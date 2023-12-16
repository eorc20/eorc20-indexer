import fs from "fs";
import readline from "readline";
import { getTransaction } from "../src/rpc.js";
import pQueue from "p-queue";

const queue = new pQueue({ concurrency: 1 });

const writer = fs.createWriteStream("transactions.jsonl");
const rl = readline.createInterface({
  input: fs.createReadStream('transfers.jsonl'),
  crlfDelay: Infinity
});

rl.on('line', async (line) => {
    const row = JSON.parse(line);
    if ( row.miner !== "miner.enf") return;

    queue.add(async () => {
      const transaction = await getTransaction(row.evm_trx_id);
      await timeout(500);
      console.log(transaction.result);
      writer.write(JSON.stringify(transaction.result) + "\n");
    })
});

function timeout(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}