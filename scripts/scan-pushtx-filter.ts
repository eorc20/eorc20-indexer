import fs from "fs";
import { parseTransaction } from "viem";
import readline from "readline";
import { Download } from "../index.js";
import logUpdate from 'log-update';

const writer = fs.createWriteStream("pushtx-filter.jsonl");

// create a readline interface for reading the file line by line
const rl = readline.createInterface({
  input: fs.createReadStream('pushtx.jsonl'),
  crlfDelay: Infinity
});

export interface Filter {
  trx_id: string;
  timestamp: string;
  to: `0x${string}`;
}

let timestamp = 0
let total = 0;

// read each line of the file and parse it as JSON
rl.on('line', (line) => {
  const download = JSON.parse(line) as Download;
  // fix download data
  download.eos_block_number = Number(download.eos_block_number);
  const tx = parseTransaction(`0x${download.rlptx}`);
  if ( !tx.to) return;
  if ( !tx.nonce) return;
  if ( !tx.gas) return;
  if ( !tx.gasPrice) return;

  const row: Filter = {
    to: tx.to,
    trx_id: download.evm_trx_id,
    timestamp: download.timestamp,
  };
  writer.write(JSON.stringify(row) + "\n");

  // logging
  total += 1;
  const now = Math.floor(Date.now() / 1000);
  if ( timestamp !== now ) {
    timestamp = now;
    logUpdate(`${total}\n`);
  }
});

// log the parsed JSON objects once the file has been fully read
rl.on('close', () => {
  console.log("done");
});
