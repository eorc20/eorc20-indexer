import { Address, TransactionSerializableLegacy, fromHex, parseTransaction } from "viem";

export function rlptxToOpCode(rlptx: Address) {
    let tx: TransactionSerializableLegacy
    try {
        tx = parseTransaction(rlptx);
    } catch (e) {
        return null;
    }
    if ( !tx.to) return null;
    if ( !tx.nonce) return null;
    if ( !tx.data) return null;
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
        const op = JSON.parse(opCode);
        if ( op.p !== "eorc20" ) return null;
        if ( !op.op ) return null;
        if ( !op.tick ) return null;
        return op;
    } catch (e) {
        return null;
    }
}

// console.log(rlptxToOpCode("0xf86d8351480e8522ecb25c008301e84894bbbbbbbbbbbbbbbbbbbbbbbb55318063a000000080b83c646174613a2c7b2270223a22656f72633230222c226f70223a226d696e74222c227469636b223a22656f7373222c22616d74223a223130303030227d1b808855318063a0000000"));