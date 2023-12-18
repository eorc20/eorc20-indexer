import fs from "node:fs";
import readline from "node:readline";
import { OPERATIONS_PATH, TRANSACTIONS_PATH, writers } from "./config.js";
import { client } from "./clickhouse/createClient.js";
import pQueue from "p-queue";
import { parseOpCode } from "./eorc20.js";
import { Operation, TransactionRawData } from "./schemas.js";

const max_inserts = 1000;
const queue = new pQueue({concurrency: 1});
const transactions: TransactionRawData[][] = [];
const buffer: TransactionRawData[] = [];
const operations: Operation[] = [];

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
    if ( lines > 5460000 ) buffer.push(row);
    if ( buffer.length >= max_inserts ) {
        emptyBuffer();
    }
    lines++;
    // const
    // const opCode = parseOpCode(row.content_uri);
    // const operation = {...opCode, id: row.transaction_hash} as Operation;
    // // operations.push(operation);
    // // writers.operations.write(JSON.stringify({...opCode, id: row.transaction_hash}) + "\n");
    if ( lines % 100000 === 0 ) console.log(`lines,buffer (${lines},${transactions.length})`);

    // queue.add(async () => {
    //     console.log(`Push to operations: ${lines}`)
    //     const response = await client.insert({table: "operations", values: [operation], format: "JSONEachRow"})
    //     await timeout(100);
    //     console.log(response);
    // })
    // const response = await client.insert({table: "transactions", values: [row], format: "JSONEachRow"})

    // transactions.push(row);
    // operations.push({...opCode, id: row.transaction_hash})
    // if ( transactions.length >= max_inserts ) {
    //     const insert_transactions = [...transactions];
    //     const insert_operations = [...operations];
    //     queue.add(async () => {
    //         console.log(`Scanning lines: ${lines}`);
    //         await insert( insert_transactions, insert_operations);
    //     });
    //     transactions.length = 0;
    //     operations.length = 0;
    // }
});

rl.on("close", async () => {
    emptyBuffer();
    console.log(`Transactions: ${lines}`);
    console.log(`Buffers: ${transactions.length}`);

    for ( const buffer of transactions ) {
        queue.add(async () => {
            console.log(`Inserting buffer to Clickhouse: ${buffer.length}`);
            const response = await client.insert({table: "transactions", values: buffer, format: "JSONEachRow"})
            console.log(response);
        });
    }
    await queue.onIdle();
    // console.log("Waiting for queue to empty..."); // "Waiting for queue to empty...
    // await queue.onEmpty();
    // console.log("Queue is empty");
    // await insert(transactions, operations);

    console.log("Done");
});

rl.on("error", (error) => {
    console.error(error);
});

