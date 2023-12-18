import { emitter } from "./BlockEmitter.js";
import { saveCursor } from "./utils.js";
import { blockNumberFromGenesis, getFromAddress, toTransactionId } from "./eos.evm.js";
import { parseOpCode, rlptxToTransaction, getMimeType } from "./eorc20.js";
import { writers } from "./config.js";
import logUpdate from "log-update";
import { Hex, fromHex } from "viem";
import { InscriptionRawData } from "./schemas.js";
import { INSCRIPTION_NUMBER, handleOpCode } from "./operations/index.js";
import pQueue from "p-queue";

const queue = new pQueue({ concurrency: 1 });

let operations: string[] = [];

let total = 0;
const init_timestamp = Math.floor(Date.now().valueOf() / 1000);
let last_timestamp = init_timestamp;

emitter.on("anyMessage", async (message: any, cursor, clock) => {
  // if ( queue.size > 100 ) {
  //   if ( emitter.cancelFn ) {
  //     console.log("Queue is full, pausing emitter");
  //     emitter.cancelFn();
  //   }
  // }
  queue.add(async () => {
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
        const to = tx.to;
        if ( !to ) continue;
        if ( !tx.data ) continue;
        const content = fromHex(tx.data, 'string');
        const opCode = parseOpCode(content);
        if ( !opCode ) continue;
        const from = await getFromAddress(rlptx);
        if ( !from ) continue;
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
          to,
          contentType,
          content,
          value,
          // nonce: tx.nonce,
          // transaction_index,
          // gas,
          // gasPrice,
          // sha,
          // miner,
        } as InscriptionRawData) + "\n");

        // Update EORC-20 State
        handleOpCode(transaction_hash, from, to, opCode, timestamp);

        // Update progress
        const now = Math.floor(Date.now().valueOf() / 1000);
        total++;
        const rate = total / (now - init_timestamp);
        if ( last_timestamp !== now ) logUpdate(`Queue ${queue.size} Processed ${total}/${INSCRIPTION_NUMBER} EORC-20 operations at ${rate.toFixed(2)} op/s (last block: ${block_number})`);
        last_timestamp = now
      }

      // Save operations buffer to disk
      // console.log(`Writing ${operations.length} operations to disk`);
      writers.eorc20.write(operations.join(""));
      operations = []; // clear buffer

      // Save cursor
      saveCursor(cursor);
      // writers.blocks.write(JSON.stringify({
      //   timestamp,
      //   block_number,
      //   eos_block_number: Number(clock.number),
      //   eos_block_id: clock.id
      // }) + "\n");
    }
  })
});

// End of Stream
emitter.on("close", (error) => {
  if (error) {
    console.error(error);
  }
});

// Fatal Error
emitter.on("fatalError", (error) => {
  console.error("☠️ fatalError occurred");
  console.error(error);
  process.exit(70);
});

// Handle user exit
// https://github.com/dotnet/templating/wiki/Exit-Codes
process.on("SIGINT", () => {
  console.log("Ctrl-C was pressed");
  if (emitter.cancelFn) {
    emitter.cancelFn();
  }
  process.exit(130);
});
