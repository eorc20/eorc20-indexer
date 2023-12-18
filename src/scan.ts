import fs from "node:fs";
import readline from "node:readline";
import { TRANSACTIONS_PATH, writers } from "./config.js";
import { client } from "./clickhouse/createClient.js";
import pQueue from "p-queue";
import { parseOpCode } from "./eorc20.js";
import { Operation, TransactionRawData } from "./schemas.js";

const max_inserts = 1000;
const queue = new pQueue({concurrency: 10});
const transactions: any[] = [];
const operations: any[] = [];

// let operations = 0;
let inserts = 0;
let lines = 0;

// async function insert() {
//     if ( transactions.length === 0 ) return;
//     // const insert_transactions: TransactionRawData[] = [];
//     const disk_operations: Operation[] = [];

//     let count = 0;
//     while ( true ) {
//         // const insert_transaction = transactions.pop();
//         const insert_operation = operations.pop();
//         if ( !insert_operation) break;
//         // if ( !insert_transaction || !insert_operation ) break;
//         // insert_transactions.push(insert_transaction)
//         disk_operations.push(insert_operation)
//         count++
//         if ( count > max_inserts ) break;
//     }
//     console.log(`Inserting ${disk_operations.length}/${inserts} transactions...`);
//     // await client.insert({table: "transactions", values: insert_transactions, format: "JSONEachRow"})
//     // await client.insert({table: "operations", values: disk_operations, format: "JSONEachRow"})
//     writers.operations.write(disk_operations.map(item => JSON.stringify(item) + "\n").join(""));
// }

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
            writers.operations.write(JSON.stringify({...opCode, id: row.transaction_hash}) + "\n");

            // queue.add(async () => {
            //     inserts++;
            //     transactions.push([row]);
            //     operations.push({...opCode, id: row.transaction_hash});
            //     if (transactions.length >= max_inserts) await insert();
            // });
        });

        rl.on("close", async () => {
            console.log(`Total lines: ${lines}`);
            console.log("Waiting for queue to empty..."); // "Waiting for queue to empty...
            await queue.onEmpty();
            console.log("Queue is empty");
            // await insert();
            console.log("Done");
            resolve(true);
        });

        rl.on("error", (error) => {
            console.error(error);
            reject(error);
        });
    });
}

// scan();