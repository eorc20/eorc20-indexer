import { Address, Hex } from "viem";
import { client } from "../clickhouse/createClient.js";

export interface Transfer {
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

export async function getLastPendingTransfer(tick: string) {
    const query = `
SELECT * FROM transfer
WHERE
tick = {tick: String} AND
id NOT IN (SELECT id FROM errors_transfer WHERE errors_transfer.id = id) AND
id NOT IN (SELECT id FROM approve_transfer WHERE approve_transfer.id = id)
ORDER BY (block_number, transaction_index)
LIMIT 1`;
    const response = await client.query({query, query_params: {tick}});
    const data = await response.json<{data: Transfer[], rows: number}>();
    if ( !data.data.length ) return null;
    return data.data[0];
}
