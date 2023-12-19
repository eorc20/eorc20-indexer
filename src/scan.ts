import fs from "node:fs";
import readline from "node:readline";
import { client } from "./clickhouse/createClient.js";
import pQueue from "p-queue";
import { TransactionRawData } from "./schemas.js";

// npm run scan <start> <end>
const START_SCAN = Number(process.argv[2] ?? 0);
const END_SCAN = Number(process.argv[3] ?? Infinity);

const max_inserts = 1000;
const queue = new pQueue({concurrency: 1});
const transactions: TransactionRawData[][] = [];
const buffer: TransactionRawData[] = [];

console.log("Scanning inscriptions...");
const rl = readline.createInterface({
    input: fs.createReadStream("./data/transactions.jsonl"),
    crlfDelay: Infinity,
});

function emptyBuffer() {
    transactions.push([...buffer]);
    buffer.length = 0;
}

let lines = 0;
rl.on('line', async (line: string) => {
    if ( lines >= START_SCAN && lines <= END_SCAN ) {
        const row = JSON.parse(line);
        buffer.push(row);
        if ( buffer.length >= max_inserts ) {
            emptyBuffer();
        }
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

