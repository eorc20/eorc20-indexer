import fs from "node:fs";
import readline from "node:readline";
import { TRANSACTIONS_PATH } from "./config.js";
import { client } from "./clickhouse/createClient.js";
import pQueue from "p-queue";
import { parseOpCode } from "./eorc20.js";

const max_inserts = 1000;
const queue = new pQueue({concurrency: 1});
const transactions: any[] = [];
const operations: any[] = [];

// let operations = 0;
let inserts = 0;
let lines = 0;

async function insert() {
    if ( transactions.length === 0 ) return;
    console.log(`Inserting ${transactions.length}/${inserts} transactions...`);
    await client.insert({table: "transactions", values: transactions, format: "JSONEachRow"})
    await client.insert({table: "operations", values: operations, format: "JSONEachRow"})
    transactions.length = 0;
    operations.length = 0;
}

export function scan() {
    return new Promise((resolve, reject) => {
        console.log("Scanning inscriptions...");

        const rl = readline.createInterface({
            input: fs.createReadStream(TRANSACTIONS_PATH),
            crlfDelay: Infinity
        });

        rl.on('line', (line: string) => {
            const row = JSON.parse(line);
            lines++;
            const opCode = parseOpCode(row.content_uri);

            queue.add(async () => {
                inserts++;
                transactions.push([row]);
                operations.push({...opCode, id: row.transaction_hash});
                if (transactions.length >= max_inserts) await insert();
            });
        });

        rl.on("close", async () => {
            console.log(`Total lines: ${lines}`);
            console.log("Waiting for queue to empty..."); // "Waiting for queue to empty...
            await queue.onEmpty();
            console.log("Queue is empty");
            await insert();
            console.log("Done");
            resolve(true);
        });

        rl.on("error", (error) => {
            console.error(error);
            reject(error);
        });
    });
}