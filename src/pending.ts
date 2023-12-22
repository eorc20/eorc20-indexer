import { client } from "./clickhouse/createClient.js";
console.log("Downloading pending transfers...");

const query = `
SELECT * FROM pending_mv
ORDER BY (block_number, transaction_index)
LIMIT 1
`;

interface Transfer {
    id: string;                   // '0x19b37d87d35a2a2dfabb69147c9148b97d68d42d7b97cc1021ed163d9a098c52'
    from: string;                 // '0x354d44ad5ecbe2b6244a63b24babff9aa5200303'
    to: string;                   // '0xad1c853bc9607b4c5324a44df9ba42fd918276ad'
    p: string;                    // 'eorc20'
    op: string;                   // 'transfer'
    tick: string;                 // 'eoss'
    amt: string;                  // '10000000'
    block_number: number;         // 21536442
    native_block_number: number;  // 346013363
    timestamp: string;            // '2023-12-10 08:38:50'
    transaction_index: number;    // 0
}

const response = await client.query({query});
const json: {data: Transfer[]} = await response.json();

for ( const transfer of json.data ) {
};
