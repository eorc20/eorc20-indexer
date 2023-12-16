#!/usr/bin/env node

import { saveCursor } from "./src/utils.js";
import { blockNumberFromGenesis, getFromAddress, toTransactionId } from "./src/eos.evm.js";
import { contentUriToSha256, parseOpCode, rlptxToTransaction, getMimeType } from "./src/eorc20.js";
import { emitter } from "./src/substreams.js";
import { PAUSED, writers } from "./src/config.js";
import logUpdate from "log-update";
import { Hex } from "viem";

let total = 0;
const start = Math.floor(Date.now().valueOf() / 1000);
let last = start;

emitter.on("anyMessage", async (message: any, cursor, clock) => {
  if ( !clock.timestamp ) return;
  const block_number = blockNumberFromGenesis(clock.timestamp?.toDate());
  const timestamp = clock.timestamp?.toDate().toISOString();

  if (!message.transactionTraces) return;
  for ( const trace of message.transactionTraces ) {
    if ( trace.receipt.status !== "TRANSACTIONSTATUS_EXECUTED") return;
    if ( !trace.actionTraces ) continue;
    for ( const action of trace.actionTraces) {
      if ( action.action.name !== "pushtx" ) continue;
      const jsonData = JSON.parse(action.action.jsonData);
      const miner = jsonData.miner;
      const rlptx: Hex = `0x${jsonData.rlptx}`;
      const transaction_hash = toTransactionId(rlptx);
      const transaction_index = trace.index;

      // // EOS EVM push transaction
      // writers.pushtx.write(JSON.stringify({
      //   trx_id,
      //   timestamp: trace.blockTime,
      //   block_number,
      //   transaction_index,
      //   eos_trx_id: trace.id,
      //   eos_block_number: trace.blockNum,
      //   miner,
      //   rlptx,
      // }) + "\n");

      // EORC-20 handling
      const tx = rlptxToTransaction(rlptx);
      if ( !tx ) continue;
      if ( !tx.to ) continue;
      if ( !tx.data ) continue;
      const content_uri = tx.data;
      const data = parseOpCode(content_uri);
      if ( !data ) continue;
      const from = await getFromAddress(rlptx);
      const sha = contentUriToSha256(content_uri);
      const value = tx.value?.toString();
      const gas = tx.gas?.toString();
      const gas_price = tx.gasPrice?.toString();

      writers.eorc.write(JSON.stringify({
        transaction_hash,
        block_number,
        timestamp,
        to: tx.to,
        from,
        data,
        value,
        nonce: tx.nonce,
        ...getMimeType(content_uri),
        transaction_index,
        content_uri,
        gas,
        gas_price,
        sha,
        miner,
      }) + "\n");

      // Update progress
      const now = Math.floor(Date.now().valueOf() / 1000);
      total++;
      const rate = total / (now - start);
      if ( last !== now ) logUpdate(`Processed ${total} EORC-20 operations at ${rate.toFixed(2)} op/s (last block: ${block_number})`);
      last = now
    }
  }

  // Save cursor
  saveCursor(cursor);
  writers.blocks.write(JSON.stringify({
    timestamp,
    block_number,
    eos_block_number: Number(clock.number),
    eos_block_id: clock.id
  }) + "\n");
});

// End of Stream
emitter.on("close", (error) => {
  if (error) {
    console.error(error);
  }
});

// Fatal Error
emitter.on("fatalError", (error) => {
  console.error(error);
});

if ( PAUSED ) {
  console.log("Paused");
  process.exit();
}

const cancelFn = emitter.start();
console.log("EORC-20 indexer 🚀");

// Handle user exit
process.on("SIGINT", () => {
  console.log("Ctrl-C was pressed");
  cancelFn();
  process.exit();
});
