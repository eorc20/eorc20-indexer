import { keccak256, Hex, parseTransaction, signatureToHex, serializeTransaction, recoverAddress, recoverPublicKey } from 'viem'
import { LOCK_GENESIS_TIME } from './config.js';

export function toTransactionId(rlptx: Hex) {
    return keccak256(rlptx);
}

export function blockNumberFromGenesis(blockTime: Date) {
    const current = Math.floor(blockTime.valueOf() / 1000)
    const genesis = Math.floor(LOCK_GENESIS_TIME.valueOf() / 1000);
    return current - genesis + 1;
}

export async function getFromAddress(rlptx: Hex) {
    const tx = parseTransaction(rlptx);
    if ( !tx.v) return null;
    if ( !tx.r) return null;
    if ( !tx.s) return null;
    if ( tx.r === "0x") return null;

    const v = tx.v - 17777n * 2n - 35n;
    const signature = signatureToHex({ v, r: tx.r, s: tx.s });
    const hash = keccak256(serializeTransaction({ ...tx }));
    return recoverAddress({hash, signature});
}

// getFromAddress("0xf7824f468522ecb25c0082520894d10ca73e34fc6c7c530654cb9adb0810e7771320890579848dee9ab30000801b80885530ea015b900000").then(console.log);