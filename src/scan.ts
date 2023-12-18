import fs from "node:fs";
import readline from "node:readline";
import { TRANSACTIONS_PATH } from "./config.js";
import { client } from "./clickhouse/createClient.js";
import pQueue from "p-queue";
import { parseOpCode } from "./eorc20.js";

const queue = new pQueue({concurrency: 1});
const transactions: any[] = [];
const native_blocks: any[] = [];
const operations: any[] = [];

// let operations = 0;
let inserts = 0;
let lines = 0;

async function insert() {
    if ( transactions.length === 0 ) return;
    // console.log(`Inserting ${transactions.length} transactions...`);
    // console.log(response);
    console.log(`Inserting ${transactions.length}/${inserts} transactions...`);
    await client.insert({table: "transactions", values: transactions, format: "JSONEachRow"})
    await client.insert({table: "native_blocks", values: native_blocks, format: "JSONEachRow"})
    await client.insert({table: "operations", values: operations, format: "JSONEachRow"})
    // console.log(response);
    transactions.length = 0;
    native_blocks.length = 0;
    operations.length = 0;
}

console.log("Scanning inscriptions...");
// console.time("Scan completed");

const rl = readline.createInterface({
    input: fs.createReadStream(TRANSACTIONS_PATH),
    crlfDelay: Infinity
});

rl.on('line', (line: string) => {
    const row = JSON.parse(line);
    // operations++;
    lines++;
    const opCode = parseOpCode(row.content_uri);
    // console.log(opCode);

    queue.add(async () => {
        inserts++;
        transactions.push([row]);
        native_blocks.push([{...row, final: true}]);
        operations.push({...opCode, id: row.transaction_hash});
        if (transactions.length >= 1000) await insert();
    });
});

rl.on("close", async () => {
    // console.timeEnd("Scan completed");
    console.log(`Total lines: ${lines}`);
    console.log("Waiting for queue to empty..."); // "Waiting for queue to empty...
    await queue.onEmpty();
    console.log("Queue is empty");
    await insert();
});

rl.on("error", (error) => {
    console.error(error);
});