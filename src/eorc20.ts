import { createHash } from "crypto";
import { Hex, TransactionSerializableLegacy, decodeFunctionData, fromHex, parseAbi, parseTransaction } from "viem";
import { abi } from "./abi.js";

export type Ticker = string;

export interface OpCode {
    p: string;      // 'eorc20'
    tick: Ticker;   // 'eoss'
}

export interface MintOpCode extends OpCode {
    op: "mint";
    amt: string;    // '10000'
}

export interface TransferOpCode extends OpCode {
    op: "transfer";
    amt: string;    // '10000'
}

export interface DeployOpCode extends OpCode {
    op: "deploy";
    max: string;    // '210000000000'
    lim?: string;    // '10000'
    prec?: number;    // 0
}

export type AnyOpCode = MintOpCode | TransferOpCode | DeployOpCode;

export function rlptxToTransaction(rlptx: Hex) {
    let tx: TransactionSerializableLegacy
    try {
        tx = parseTransaction(rlptx);
    } catch (e) {
        return null;
    }
    if ( !tx.to) return null;
    if ( !tx.data) return null;

    // nonce can be undefined or 0
    return tx;
}

// handle smart contract "inscribe" function
export function parseOpCodeFromContract(data: Hex) {
    if ( isContract(data) ) {
        try {
            const [to, calldata] = decodeFunctionData({abi, data}).args;
            return {to, ...parseOpCode(fromHex(calldata, 'string'))};
        } catch (e) {
            console.error(e);
            return null;
        }
    }
    return null;
}

export function isContract(data: Hex) {
    return data.startsWith("0x58bf77ac");
}

export function parseOpCodeFromHex(data: Hex) {
    return parseOpCode(fromHex(data, 'string'));
}

export function parseOpCode(content: string): TransferOpCode | MintOpCode | DeployOpCode | null {
    const opCode = content.split(/data:[application\/json]?,/)[1]?.replace(/\u0000/g, "");
    if ( !opCode ) return null;
    try {
        const parsedOp = JSON.parse(opCode);
        const { p, tick, op, amt, max } = parsedOp;

        // valid eorc-20 operations
        if ( !p || !tick || !op ) return null;
        if ( p !== "eorc20" ) return null;
        if ( !["deploy", "mint", "transfer", "list"].includes(op) ) return null;

        // required fields
        if ( ["transfer", "mint", "list"].includes(op)) {
            if ( !isValidAmount(amt) ) return null;
        }
        if ( op === "deploy") {
            if ( !isValidAmount(max) ) return null;
        }

        return parsedOp;
    } catch (e) {
        return null;
    }
}

export function contentUriToSha256(content_uri: string) {
    return createHash('sha256').update(content_uri, 'utf8').digest("hex")
}

export function isValidAmount(amt: string) {
    try {
        const value = BigInt(amt);
        // cannot be negative
        if ( value < 0n ) return false;
    } catch (e) {
        return false;
    }
    return true;
}

// const rlptx = "0xf8b2198522ecb25c008301e848948ed573bf1ac1d01a1af4b983fd6034912450c6fe80b884449b2cf60000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000003e646174613a2c7b2270223a22656f72633230222c226f70223a227472616e73666572222c227469636b223a22656f7373222c22616d74223a22323030227d00001b80883276a9e757a6b060"

// const tx = rlptxToTransaction(rlptx);
// console.log(tx);


// const content_uri = fromHex(tx?.data ?? '0x', 'string');
// // const opCode = parseOpCode(content_uri);
// // if ( !opCode ) continue;
// const mimetype = getMimeType(content_uri);
// const from = await getFromAddress(rlptx);
// console.log({content_uri, mimetype, from})

// export const abi = parseAbi([
//     'function transfer(address to, uint256 amount) returns (bool)',
//     'function balanceOf(address account) returns (uint256)',
//     'function inscribe(bytes calldata data) public',
//     'event Inscribe(bytes data)'
// ])

// const rlptx = "0xf8b2198522ecb25c008301e848948ed573bf1ac1d01a1af4b983fd6034912450c6fe80b884449b2cf60000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000003e646174613a2c7b2270223a22656f72633230222c226f70223a227472616e73666572222c227469636b223a22656f7373222c22616d74223a22323030227d00001b80883276a9e757a6b060"
// const trx = rlptxToTransaction(rlptx)
// const from = await getFromAddress(rlptx);
// console.log({trx, from});
// if ( trx?.data) {
//     console.log(trx.data)
//     // const calldata = fromHex(trx.data, 'string') as Hex;
//     const decoded = decodeFunctionData({abi, data: trx.data});
//     const ops = parseOpCodeFromHex(decoded.args[0]);
//     // console.log(fromHex(decoded.args[0], "string"));
//     // console.log(content_uri)
//     console.log(ops);
// }


// console.log(parseOpCodeFromContract("0x58bf77ac00000000000000000000000026684e708333ba46be27bca221474409c6f77b200000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000003d646174613a2c7b2270223a22656f72633230222c226f70223a227472616e73666572222c227469636b223a22656f7373222c22616d74223a223130227d000000"))