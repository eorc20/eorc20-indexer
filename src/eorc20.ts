import { Address, TransactionSerializableLegacy, fromHex, parseTransaction } from "viem";
import { TICKERS } from "./config.js";

export type Ticker = string;

export interface OpCode {
    from: Address;  // '0x4ce47b001f40438c4ccd5188a7f688023be301b2'
    to: Address;    // '0x4ce47b001f40438c4ccd5188a7f688023be301b2'
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
}

export function rlptxToOpCode(rlptx: Address) {
    let tx: TransactionSerializableLegacy
    try {
        tx = parseTransaction(rlptx);
    } catch (e) {
        return null;
    }
    if ( !tx.to) return null;
    if ( !tx.data) return null;
    // nonce can be undefined or 0
    const op = parseOpCode(tx.data);
    if ( !op ) return null;

    return {
        to: tx.to,
        ...op,
    };
}

export function parseOpCode(data: Address) {
    const str = fromHex(data, 'string');
    if ( !str.includes("data:,") ) return null;
    const opCode = str.split("data:,")[1];
    if ( !opCode ) return null;
    try {
        const parsedOp = JSON.parse(opCode);
        const { p, tick, op, amt, max } = parsedOp;

        // eorc-20 operations
        if ( !p || !tick || !op ) return null;
        if ( p !== "eorc20" ) return null;
        if ( !["deploy", "mint", "transfer"].includes(op) ) return null;
        if ( tick.length !== 4 ) return null;

        // required fields
        if ( ["transfer","mint"].includes(op)) {
            if ( amt === undefined ) return null;
            if ( !Number.isInteger(Number(amt))) return null;
        }
        if ( op === "deploy") {
            if ( max === undefined ) return null;
            if ( !Number.isInteger(Number(max))) return null;
        }

        // custom filters
        if ( TICKERS.length && !TICKERS.includes(tick) ) return null;

        return parsedOp;
    } catch (e) {
        return null;
    }
}

// console.log(rlptxToOpCode("0xf8a3808522ecb25c008255c894b96f197992b795078407a2c170eada7894488bb980b83c646174613a2c7b2270223a22656f72633230222c226f70223a226d696e74222c227469636b223a22656f7373222c22616d74223a223130303030227d828b05a05504af55e2ff8427c36888cc7fe98520c6d12918fe0e43c03c654b7d0071a6a7a062b80c13bc0e210d2a7cda668fa626ab6cd529013486c29f050795f7eb17a744"));