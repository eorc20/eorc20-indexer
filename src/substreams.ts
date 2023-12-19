import { emitter } from "./BlockEmitter.js";
import { saveCursor } from "./utils.js";
import { blockNumberFromGenesis, getFromAddress, toTransactionId } from "./eos.evm.js";
import { parseOpCode, rlptxToTransaction, contentUriToSha256 } from "./eorc20.js";
import { writers } from "./config.js";
import logUpdate from "log-update";
import { Hex, fromHex } from "viem";
import { TransactionRawData } from "./schemas.js";
import { getMimeType } from "./mimetype.js";
import pQueue from "p-queue";
import { client } from "./clickhouse/createClient.js";

function timeout(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const queue = new pQueue({ concurrency: 1 });

function time() {
  return Math.floor(Date.now().valueOf() / 1000);
}

let inserts = 0;
let blocks = 0;
let clickhouse_inserts = 0;
const init_timestamp = time();

function insert(buffer: TransactionRawData[]) {
  queue.add(async () => {
    const response = await client.insert({table: "transactions", values: buffer, format: "JSONEachRow"})
    clickhouse_inserts+=buffer.length;
    buffer.length = 0;
    // console.log(`clickhouse insert: ${buffer.length} [${response.query_id}]`);
    await timeout(250);
  });
}

emitter.on("anyMessage", async (message: any, cursor, clock) => {
  if ( !clock.timestamp ) return;
  const native_block_id = clock.id;
  const native_block_number = Number(clock.number);
  const block_number = blockNumberFromGenesis(clock.timestamp?.toDate());
  const timestamp = Number(clock.timestamp.seconds);
  const transactions: TransactionRawData[] = [];

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
      // const opCode = parseOpCode(content_uri);
      // if ( !opCode ) continue;
      const mimetype = getMimeType(content_uri);
      if ( !mimetype ) continue;
      const from = await getFromAddress(rlptx);
      if ( !from ) continue;
      const sha = contentUriToSha256(content_uri);
      const value = tx.value?.toString();
      const gas = tx.gas?.toString();
      const gas_price = tx.gasPrice?.toString();

      // Write EORC-20 operation to disk used for history
      const transaction = {
        transaction_hash,
        block_number,
        timestamp,
        creator: from,
        from_address: from,
        to_address: to,
        ...mimetype,
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
      transactions.push(transaction);
      inserts++;
    }
  }

  // Save transactions to disk & clickhouse
  if ( transactions.length) {
    writers.transactions.write(transactions.map(item => JSON.stringify(item) + "\n").join(""));
    saveCursor(cursor);

    // Save to clickhouse
    insert([...transactions]);
    transactions.length = 0; // empty buffer memory
  }

  // logging
  blocks++;
  const now = time();
  const rate = inserts / (now - init_timestamp);
  const blockRate = blocks / (now - init_timestamp);
  logUpdate(`queue/disk/inserts/blocks ${queue.size}/${inserts}/${clickhouse_inserts}/${blocks} at ${rate.toFixed(2)} op/s ${blockRate.toFixed(2)} block/s (${block_number}/${native_block_number} evm/native blocks)`);
});

// End of Stream
emitter.on("close", (error) => {
  console.log("🏁 End of Stream");
  if (error) {
    console.error(error);
    process.exit(70);
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
