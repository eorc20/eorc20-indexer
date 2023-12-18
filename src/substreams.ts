import { emitter } from "./BlockEmitter.js";
import { saveCursor } from "./utils.js";
import { blockNumberFromGenesis, getFromAddress, toTransactionId } from "./eos.evm.js";
import { parseOpCode, rlptxToTransaction, contentUriToSha256, MintOpCode, AnyOpCode } from "./eorc20.js";
import { writer } from "./config.js";
import logUpdate from "log-update";
import { Hex, fromHex } from "viem";
import { NativeBlock, Operation, TransactionRawData } from "./schemas.js";
import { INSCRIPTION_NUMBER, handleOpCode } from "./operations/index.js";
import { getMimeType } from "./mimetype.js";
import pQueue from "p-queue";
import { client } from "./clickhouse/createClient.js";

const queue = new pQueue({ concurrency: 10 });

// let operations: string[] = [];

let inserts = 0;
let blocks = 0;
const init_timestamp = Math.floor(Date.now().valueOf() / 1000);
// let last_timestamp = init_timestamp;

const transactions: TransactionRawData[] = [];
const operations: Operation[] = [];

async function insert() {
  if ( transactions.length < 1000 ) return;
  // console.log(`Inserting ${transactions.length} transactions...`);
  // console.log(response);
  // console.log(`Inserting ${transactions.length}/${inserts} transactions...`);
  await client.insert({table: "transactions", values: transactions, format: "JSONEachRow"})
  await client.insert({table: "operations", values: operations, format: "JSONEachRow"})
  // console.log(response);
  transactions.length = 0;
  operations.length = 0;
}

emitter.on("anyMessage", async (message: any, cursor, clock) => {
  // if ( queue.size > 100 ) {
  //   if ( emitter.cancelFn ) {
  //     console.log("Queue is full, pausing emitter");
  //     emitter.cancelFn();
  //   }
  // }
  if ( !clock.timestamp ) return;
  const native_block_id = clock.id;
  const native_block_number = Number(clock.number);
  const block_number = blockNumberFromGenesis(clock.timestamp?.toDate());
  const timestamp = Number(clock.timestamp.seconds);
  const disk_transactions: TransactionRawData[] = [];
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
      const transaction = {
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
      };

      // For on-disk history
      disk_transactions.push(transaction);

      // for Clickhouse history
      transactions.push(transaction);
      operations.push({...opCode, id: transaction_hash});
      inserts++;
    }
  }

  // Save operations buffer to disk
  if ( disk_transactions.length) {
    // console.log(`Writing ${transactions.length} transactions to disk`);
    writer.write(disk_transactions.map(item => JSON.stringify(item) + "\n").join(""));
  }
  // operations.length = 0;
  disk_transactions.length = 0;
  // operations = []; // clear buffer

  // Save cursor
  saveCursor(cursor);
  blocks++;

  // Queue Clickhouse inserts
  queue.add(async () => {
    await insert();
  });

  // logging
  const now = Math.floor(Date.now().valueOf() / 1000);
  const rate = inserts / (now - init_timestamp);
  logUpdate(`queue/inserts/blocks ${queue.size}/${inserts}/${blocks} at ${rate.toFixed(2)} op/s (${block_number} last block)`);
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
