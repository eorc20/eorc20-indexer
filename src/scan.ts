import fs from "node:fs";
import readline from "node:readline";
import { client } from "./clickhouse/createClient.js";
import pQueue from "p-queue";
import { Operation, TransactionRawData } from "./schemas.js";

const max_inserts = 1000;
const queue = new pQueue({concurrency: 1});
const transactions: TransactionRawData[][] = [];
const buffer: TransactionRawData[] = [];

// let operations = 0;
let inserts = 0;
let lines = 0;

function timeout(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function insert(transactions: TransactionRawData[], operations: Operation[]) {
    if ( transactions.length === 0 ) return;
    inserts += transactions.length;
    console.log(`Inserting ${transactions.length}/${inserts} transactions & operations (${transactions[0].block_number})...`);
    await client.insert({table: "transactions", values: transactions, format: "JSONEachRow"})
    await timeout(1000);
    await client.insert({table: "operations", values: operations, format: "JSONEachRow"})
    await timeout(1000);
}


console.log("Scanning inscriptions...");
const rl = readline.createInterface({
    input: fs.createReadStream("./data/transactions.jsonl"),
    crlfDelay: Infinity,
});

function emptyBuffer() {
    transactions.push([...buffer]);
    buffer.length = 0;
}

rl.on('line', async (line: string) => {
    const row = JSON.parse(line);
    buffer.push(row);
    if ( buffer.length >= max_inserts ) {
        emptyBuffer();
    }
    lines++;
    if ( lines % 100000 === 0 ) console.log(`lines,buffer (${lines},${transactions.length})`);
});

rl.on("close", async () => {
    emptyBuffer();
    console.log(`Transactions: ${lines}`);
    console.log(`Buffers: ${transactions.length}`);

    for ( const buffer of transactions ) {
        queue.add(async () => {
            const response = await client.insert({table: "transactions", values: buffer, format: "JSONEachRow"})
            console.log(`Inserting buffer to Clickhouse: ${buffer.length} [${response.query_id}]`);
        });
    }
    await queue.onIdle();
    console.log("Done");
});

rl.on("error", (error) => {
    console.error(error);
});

