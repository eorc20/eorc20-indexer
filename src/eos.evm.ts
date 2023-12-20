import { keccak256, Hex, parseTransaction, signatureToHex, serializeTransaction, recoverAddress, recoverPublicKey, Address, hexToBigInt, bytesToHex} from 'viem'
import { LOCK_GENESIS_TIME } from './config.js';

const MAX_UINT64: bigint = BigInt("0xFFFFFFFFFFFFFFFF");

export function toTransactionId(rlptx: Hex): Hex {
    return keccak256(rlptx);
}

export function blockNumberFromGenesis(blockTime: Date) {
    const current = Math.floor(blockTime.valueOf() / 1000)
    const genesis = Math.floor(LOCK_GENESIS_TIME.valueOf() / 1000);
    return current - genesis + 1;
}

function makeReservedAddress(account: bigint): Address {
    let bytes = new Uint8Array(20);
    bytes.fill(0xbb, 0, 12);

    for (let i = 0; i < 8; i++) {
        bytes[12 + i] = Number((account >> BigInt(8 * (7 - i))) & BigInt(0xFF));
    }

    return bytesToHex(bytes) as Address;
}

function decodeSpecialSignature(s: bigint): Address {
    if (s <= MAX_UINT64) {
        return makeReservedAddress(s);
    } else {
        let from: Uint8Array = new Uint8Array(20);
        let fullBytes = s.toString(16).padStart(64, '0');
        for (let i = 0; i < 20; i++) {
            from[i] = parseInt(fullBytes.substring(44 + (i * 2), 46 + (i * 2)), 16);
        }
        return bytesToHex(from) as Address;
    }
}

function isSpecialSignature(r: bigint, s: bigint): boolean {
    const kAddressLength: number = 20;
    return r === BigInt(0) &&
           (s <= MAX_UINT64 ||
            (s >> BigInt(kAddressLength * 8)) === (~BigInt(0) >> BigInt(kAddressLength * 8)));
}

export async function getFromAddress(rlptx: Hex) {
    const tx = parseTransaction(rlptx);
    if ( !tx.v) return null;

    const r = tx.r === "0x" ? BigInt(0) : hexToBigInt(tx.r as any) as any;
    const s = hexToBigInt(tx.s as any) as any;

    if( isSpecialSignature(r, s) ) {
        return decodeSpecialSignature(s);
    }

    const v = tx.v - 17777n * 2n - 35n;
    const signature = signatureToHex({ v, r, s });
    const hash = keccak256(serializeTransaction({ ...tx }));
    const addres = await recoverAddress({hash, signature});
    if ( !addres ) return null;
    return addres.toLowerCase() as Address;
}

// // Regular
// getFromAddress("0xf8ab048522ecb25c00828f5c94bb8e513b2897ac9c1c47eecfcb42dbd4b77f927580b844a9059cbb000000000000000000000000bb8e513b2897ac9c1c47eecfcb42dbd4b77f92750000000000000000000000000000000000000000000000008ac7230489e80000828b05a0542ee96294eddefe0dee60b67610191e4bea5ce093fef85587f557a40c3d8570a021080e7c84bb2a40b5bb94971146dea5968ce9eae868d94bffae8fa6c1282feb").then(console.log);

// // Special (type 1)
// getFromAddress("0xf7824f468522ecb25c0082520894d10ca73e34fc6c7c530654cb9adb0810e7771320890579848dee9ab30000801b80885530ea015b900000").then(console.log);
