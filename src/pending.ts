import { Address, Hex } from "viem";
import { client } from "./clickhouse/createClient.js";
console.log("Downloading pending transfers...");

const query = `
SELECT * FROM transfer
WHERE id NOT IN
(SELECT id FROM approve WHERE op = 'transfer') AND
id NOT IN (SELECT id FROM errors WHERE op = 'transfer')
ORDER BY (block_number, transaction_index)
LIMIT 1
`;

interface Transfer {
    id: Hex;                      // '0x19b37d87d35a2a2dfabb69147c9148b97d68d42d7b97cc1021ed163d9a098c52'
    from: Address;                // '0x354d44ad5ecbe2b6244a63b24babff9aa5200303'
    to: Address;                  // '0xad1c853bc9607b4c5324a44df9ba42fd918276ad'
    p: string;                    // 'eorc20'
    op: string;                   // 'transfer'
    tick: string;                 // 'eoss'
    amt: string;                  // '10000000'
    block_number: number;         // 21536442
    native_block_number: number;  // 346013363
    timestamp: string;            // '2023-12-10 08:38:50'
    transaction_index: number;    // 0
}

async function getBalance(address: Address, tick: string): Promise<number|null> {
    const response = await fetch(`https://api.eorc20.io/tokens?address=${address}`)
    try {
        const json: {data: {amount: number, tick: string}[]} = await response.json();
        if ( !json.data.length) return 0;
        for ( const row of json.data ) {
            if ( row.tick === tick ) return row.amount;
        }
        return 0;
    } catch (e) {
        console.error(e);
        return null;
    }
}

const tick = 'eoss';

async function approve(id: Hex) {
    const query = `
        INSERT INTO approve SELECT 'transfer', '${id}'
    `
    const response = await client.exec({query})
    console.log(`approve transfer id = ${id} [${response.query_id}]`);
}

async function error(id: Hex) {
    const query = `
        INSERT INTO errors SELECT 'transfer', '${id}', 4
    `
    const response = await client.exec({query})
    console.log(`errors transfer id = ${id} [${response.query_id}]`);
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const metrics = {
    approve: 0,
    error: 0,
    retry: 0,
}
while (true) {
    const response = await client.query({query});
    const json: {data: Transfer[]} = await response.json();
    console.log(`Pending transfers: ${metrics.approve}/${metrics.error} (${json.data.length}/${metrics.retry++})`);
    if ( !json.data.length ) {
        await sleep(1000);
        continue;
    }

    for ( const transfer of json.data ) {
        if ( transfer.tick !== tick ) continue;
        let availableBalance = await getBalance(transfer.from, tick);
        if ( availableBalance === null ) continue;
        const balance = availableBalance - Number(transfer.amt);
        console.log({transfer, availableBalance, balance});

        // approve
        if ( balance > 0 ) {
            // console.log(`approve ${transfer.from} ${balance}`);
            await approve(transfer.id);
            metrics.approve++;
            // error
        } else {
            console.error(`error ${transfer.id}`);
            await error(transfer.id);
            metrics.error++;
        }
        await sleep(500);
    };
}

// getBalance("0x354d44ad5ecbe2b6244a63b24babff9aa5200303")