import { Hex, fromHex } from "viem";
import { getFromAddress, toTransactionId } from "./eos.evm.js";
import { contentUriToSha256, rlptxToTransaction } from "./eorc20.js";
import { getMimeType } from "./mimetype.js";

export interface JSONData {
    evm_trx_id: string
    eos_trx_id: string
    eos_block_number: string
    evm_block_number: number
    timestamp: string
    miner: string
    rlptx: string
}

export async function parsePushtx(jsonData: JSONData ) {
    // block header
    const native_block_number = jsonData.eos_block_number
    const native_block_id = "";
    const block_number = jsonData.evm_block_number;
    const timestamp = Math.floor(new Date(jsonData.timestamp).valueOf() / 1000);

    // JSON parsed
    const miner = jsonData.miner;
    const rlptx: Hex = `0x${jsonData.rlptx}`;
    const transaction_hash = toTransactionId(rlptx) as Hex;
    const transaction_index = Number(0);

    // EORC-20 handling
    const tx = rlptxToTransaction(rlptx);
    if ( !tx ) return null;
    const to = tx.to;
    if ( !to ) return null;
    if ( !tx.data ) return null;
    const content_uri = fromHex(tx.data, 'string');
    const mimetype = getMimeType(content_uri);
    if ( !mimetype ) return null;
    const from = await getFromAddress(rlptx);
    if ( !from ) return null;
    const sha = contentUriToSha256(content_uri);
    const value = tx.value?.toString();
    const gas = tx.gas?.toString();
    const gas_price = tx.gasPrice?.toString();

    // Write EORC-20 operation to disk used for history
    return {
      transaction_hash,
      block_number,
      timestamp,
      creator: from,
      from_address: from,
      to_address: to,
      ...mimetype,
      content_uri,
      value,

      // extras
      native_block_number,
      native_block_id,
      nonce: tx.nonce,
      transaction_index,
      gas,
      gas_price,
      sha,
      miner,
    };
}