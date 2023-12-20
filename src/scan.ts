import fs from "node:fs";
import readline from "node:readline";
import { client } from "./clickhouse/createClient.js";
import pQueue from "p-queue";
import { TransactionRawData } from "./schemas.js";
// import { parsePushtx } from "./transaction.js";

// npm run scan <start> <end>
const START_SCAN = Number(process.argv[2] ?? 0);
const END_SCAN = Number(process.argv[3] ?? Infinity);
console.log(`Scanning from ${START_SCAN} to ${END_SCAN}`);

const max_inserts = 1000;
const queue = new pQueue({concurrency: 1});
const transactions: TransactionRawData[][] = [];
const buffer: TransactionRawData[] = [];

// const writer = fs.createWriteStream("./data/pushtx-transactions2.jsonl", {flags: "a"});

console.log("Scanning inscriptions...");
const rl = readline.createInterface({
    input: fs.createReadStream("./data/pushtx-transactions2.jsonl"),
    crlfDelay: Infinity,
});

function emptyBuffer() {
    transactions.push([...buffer]);
    buffer.length = 0;
}

let lines = 0;
let inserts = 0;
rl.on('line', async (line: string) => {
    lines++;
    if ( lines % 10000 === 0 ) console.log(`lines,inserts,buffers [${lines},${inserts},${transactions.length}]`);

    if ( lines >= START_SCAN && lines <= END_SCAN ) {
        const row = await JSON.parse(line);
        if ( !row ) return;
        if ( row.miner !== "miner.enf") return;
        inserts++;
        // writer.write(`${JSON.stringify(row)}\n`);
        // const row = JSON.parse(line);
        buffer.push(row);
        if ( buffer.length >= max_inserts ) {
            emptyBuffer();
        }
    }
});

rl.on("close", async () => {
    emptyBuffer();
    console.log(`Transactions: ${lines}`);
    console.log(`Buffers: ${transactions.length}`);
    let inserts = 0;

    for ( const buffer of transactions ) {
        queue.add(async () => {
            const response = await client.insert({table: "transactions", values: buffer, format: "JSONEachRow"})
            console.log(`Inserting ${buffer.length} transactions to Clickhouse: progress ${inserts} of ${transactions.length} [${response.query_id}]`);
            inserts++;
        });
    }
    await queue.onIdle();
    console.log("Done");
});

rl.on("error", (error) => {
    console.error(error);
});

