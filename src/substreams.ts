import { emitter } from "./BlockEmitter.js";
import { saveCursor } from "./utils.js";
import { blockNumberFromGenesis, getFromAddress, toTransactionId } from "./eos.evm.js";
import { contentUriToSha256, parseOpCode, rlptxToTransaction, getMimeType } from "./eorc20.js";
import { writers } from "./config.js";
import logUpdate from "log-update";
import { Hex, fromHex } from "viem";

let operations: string[] = [];

let total = 0;
const start = Math.floor(Date.now().valueOf() / 1000);
let last = start;

emitter.on("anyMessage", async (message: any, cursor, clock) => {
  if ( !clock.timestamp ) return;
  const block_number = blockNumberFromGenesis(clock.timestamp?.toDate());
  const timestamp = Number(clock.timestamp.seconds);

  if (!message.transactionTraces) return;
  for ( const trace of message.transactionTraces ) {
    if ( trace.receipt.status !== "TRANSACTIONSTATUS_EXECUTED") return;
    if ( !trace.actionTraces ) continue;
    for ( const action of trace.actionTraces) {
      if ( action.action.name !== "pushtx" ) continue;
      const jsonData = JSON.parse(action.action.jsonData);
      // const miner = jsonData.miner;
      const rlptx: Hex = `0x${jsonData.rlptx}`;
      const transaction_hash = toTransactionId(rlptx);
      // const transaction_index = Number(trace.index);

      // EORC-20 handling
      const tx = rlptxToTransaction(rlptx);
      if ( !tx ) continue;
      if ( !tx.to ) continue;
      if ( !tx.data ) continue;
      const data = parseOpCode(tx.data);
      const content = fromHex(tx.data, 'string');
      if ( !data ) continue;
      const from = await getFromAddress(rlptx);
      // const sha = contentUriToSha256(content);
      const value = tx.value?.toString();
      // const gas = tx.gas?.toString();
      // const gasPrice = tx.gasPrice?.toString();
      const contentType = getMimeType(content).mimetype;

      // Write EORC-20 operation to disk used for history
      operations.push(JSON.stringify({
        id: transaction_hash,
        block: block_number,
        timestamp,
        from,
        to: tx.to,
        contentType,
        content,
        value,
        // nonce: tx.nonce,
        // transaction_index,
        // gas,
        // gasPrice,
        // sha,
        // miner,
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
  // console.log(`Writing ${operations.length} operations to disk`);
  writers.eorc20.write(operations.join(""));
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
