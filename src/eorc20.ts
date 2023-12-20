import { createHash } from "crypto";
import { Hex, TransactionSerializableLegacy, fromHex, parseTransaction } from "viem";

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

// const str = fromHex(data, 'string');

export function parseOpCodeFromHex(data: Hex) {
    return parseOpCode(fromHex(data, 'string'));
}

export function parseOpCode(content: string): TransferOpCode | MintOpCode | DeployOpCode | null {
    const opCode = content.split(/data:[application\/json]?,/)[1];
    if ( !opCode ) return null;
    try {
        const parsedOp = JSON.parse(opCode);
        const { p, tick, op, amt, max } = parsedOp;

        // valid eorc-20 operations
        if ( !p || !tick || !op ) return null;
        if ( p !== "eorc20" ) return null;
        if ( !["deploy", "mint", "transfer"].includes(op) ) return null;

        // required fields
        if ( ["transfer", "mint"].includes(op)) {
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

// const rlptx = "0xf86a808522ecb25c008301e84894aa2f34e41b397ad905e2f48059338522d05ca53480b83c646174613a2c7b2270223a22656f72633230222c226f70223a226d696e74222c227469636b223a22656f7373222c22616d74223a223130303030227d1b808855318063a0000000"

// const tx = rlptxToTransaction(rlptx);
// console.log(tx);


// const content_uri = fromHex(tx?.data ?? '0x', 'string');
// // const opCode = parseOpCode(content_uri);
// // if ( !opCode ) continue;
// const mimetype = getMimeType(content_uri);
// const from = await getFromAddress(rlptx);
// console.log({content_uri, mimetype, from})