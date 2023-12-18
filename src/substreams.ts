import { emitter } from "./BlockEmitter.js";
import { saveCursor } from "./utils.js";
import { blockNumberFromGenesis, getFromAddress, toTransactionId } from "./eos.evm.js";
import { parseOpCode, rlptxToTransaction, contentUriToSha256, MintOpCode, AnyOpCode } from "./eorc20.js";
import { writer } from "./config.js";
import logUpdate from "log-update";
import { Hex, fromHex } from "viem";
import { NativeBlock, TransactionRawData } from "./schemas.js";
import { INSCRIPTION_NUMBER, handleOpCode } from "./operations/index.js";
import { getMimeType } from "./mimetype.js";
import pQueue from "p-queue";
import { client } from "./clickhouse/createClient.js";

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
    const native_block_id = clock.id;
    const native_block_number = Number(clock.number);
    const block_number = blockNumberFromGenesis(clock.timestamp?.toDate());
    const timestamp = Number(clock.timestamp.seconds);
    const transactions: TransactionRawData[] = [];
    // const operations: any[] = [];

    if (!message.transactionTraces) return;
    for ( const trace of message.transactionTraces ) {
      if ( trace.receipt.status !== "TRANSACTIONSTATUS_EXECUTED") return;
      if ( !trace.actionTraces ) continue;
      for ( const action of trace.actionTraces) {
        if ( action.action.name !== "pushtx" ) continue;
        const jsonData = JSON.parse(action.action.jsonData);
        const miner = jsonData.miner;
        const rlptx: Hex = `0x${jsonData.rlptx}`;
        const transaction_hash = toTransactionId(rlptx) as Hex;
        const transaction_index = Number(trace.index);

        // EORC-20 handling
        const tx = rlptxToTransaction(rlptx);
        if ( !tx ) continue;
        const to = tx.to;
        if ( !to ) continue;
        if ( !tx.data ) continue;
        const content_uri = fromHex(tx.data, 'string');
        const opCode = parseOpCode(content_uri);
        if ( !opCode ) continue;
        const from = await getFromAddress(rlptx);
        if ( !from ) continue;
        const sha = contentUriToSha256(content_uri);
        const value = tx.value?.toString();
        const gas = tx.gas?.toString();
        const gas_price = tx.gasPrice?.toString();
        // const contentType = getMimeType(content_uri).mimetype;

        // Write EORC-20 operation to disk used for history
        transactions.push({
          transaction_hash,
          block_number,
          timestamp,
          creator: from,
          from_address: from,
          to_address: to,
          ...getMimeType(content_uri),
          content_uri,
          value,

          // extras
          native_block_number,
          native_block_id,
          nonce: tx.nonce,
          transaction_index,
          gas,
          gas_price,
          sha,
          miner,
        });

        // operations.push({id: transaction_hash, ...opCode});

        // // Update EORC-20 State
        // handleOpCode(transaction_hash, from, to, opCode, timestamp);

        // Update progress
        const now = Math.floor(Date.now().valueOf() / 1000);
        total++;
        const rate = total / (now - init_timestamp);
        if ( last_timestamp !== now ) logUpdate(`Queue ${queue.size} Processed ${total}/${INSCRIPTION_NUMBER} EORC-20 operations at ${rate.toFixed(2)} op/s (last block: ${block_number})`);
        last_timestamp = now
      }

      // // Save to Clickhouse
      // await client.insert({table: "transactions", values: transactions, format: "JSONEachRow"})
      // await client.insert({table: "native_blocks", values: native_blocks, format: "JSONEachRow"})
      // await client.insert({table: "operations", values: operations, format: "JSONEachRow"})

      // Save operations buffer to disk
      if ( transactions.length) {
        // console.log(`Writing ${transactions.length} transactions to disk`);
        writer.write(transactions.map(item => JSON.stringify(item) + "\n").join(""));
      }
      // operations = []; // clear buffer

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
