import fs from "fs";
import readline from "readline";
import { rlptxToOpCode } from "../src/eorc.js";
import { Hex } from "viem";
import pQueue from "p-queue";

const queue = new pQueue({ concurrency: 100 });

const writer = fs.createWriteStream("eorc2.jsonl");
const rl = readline.createInterface({
  input: fs.createReadStream('pushtx.jsonl'),
  crlfDelay: Infinity
});

rl.on('line', async (line) => {
    const row = JSON.parse(line);
    const rlptx: Hex = `0x${row.rlptx}`;

    // EORC handling
    try {
      const eorc = rlptxToOpCode(rlptx);
      if ( !eorc ) return;
      writer.write(JSON.stringify({...eorc, timestamp: row.timestamp, block_number: row.evm_block_number, trx_id: row.evm_trx_id}) + "\n");
    } catch (e) {
      console.error(e);
    }
});
