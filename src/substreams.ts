import { emitter } from "./BlockEmitter.js";
import { saveCursor } from "./utils.js";
import { blockNumberFromGenesis, getFromAddress, toTransactionId } from "./eos.evm.js";
import { contentUriToSha256, parseOpCode, rlptxToTransaction, getMimeType } from "./eorc20.js";
import { writers } from "./config.js";
import logUpdate from "log-update";
import { Hex } from "viem";
import PQueue from "p-queue";

const queue = new PQueue({ concurrency: 1 });
let operations: string[] = [];

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

      // Write to disk used for history
      operations.push(JSON.stringify({
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

  // Save operations buffer to disk
  console.log(`Writing ${operations.length} operations to disk`);
  writers.eorc.write(operations.join(""));
  operations = []; // clear buffer

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

export const cancelFn = emitter.start();
console.log("EORC-20 indexer 🚀");

// Handle user exit
process.on("SIGINT", () => {
  console.log("Ctrl-C was pressed");
  cancelFn();
  process.exit();
});
