import fs from "fs";
import readline from "readline";
import { rlptxToOpCode } from "../src/eorc.js";
import { Hex, TransactionSerializableLegacy, parseTransaction } from "viem";
import { getFromAddress } from "../src/evm.js";
import pQueue from "p-queue";

const queue = new pQueue({ concurrency: 100 });

const writer = fs.createWriteStream("transfers.jsonl");
const rl = readline.createInterface({
  input: fs.createReadStream('pushtx.jsonl'),
  crlfDelay: 100
});

rl.on('line', async (line) => {
    const row = JSON.parse(line);
    const rlptx: Hex = `0x${row.rlptx}`;
    const tx = parseTransaction(rlptx);
    if ( row.miner == "wesleymouch1") return;
    if ( rlptxToOpCode(rlptx) ) return;
    if ( !isTransfer(tx) ) return;

    // queue.add(async () => {
    //     console.log(rlptx)
    //     // const from = await getFromAddress(rlptx);
    // });
    writer.write(JSON.stringify({...row, to: tx.to, gas: Number(tx.gas), gasPrice: Number(tx.gasPrice)}) + "\n");
});

function isTransfer(tx: TransactionSerializableLegacy) {
    if (tx.data) return false;
    if (!tx.value) return false;
    if (tx.value > 0) return true;
    return false;
}
