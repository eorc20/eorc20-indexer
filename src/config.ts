import fs from "fs";

// auth API token
// https://app.streamingfast.io/
// https://app.pinax.network/
if (!process.env.SUBSTREAMS_API_TOKEN) {
    throw new Error("SUBSTREAMS_API_TOKEN is require");
}

export const token = process.env.SUBSTREAMS_API_TOKEN;
export const baseUrl = "https://eos.substreams.pinax.network:443";

// User parameters
export const manifest = "https://github.com/pinax-network/substreams/releases/download/common-v0.6.0/common-v0.6.0.spkg";
export const outputModule = "map_transaction_traces";
export const params = `map_action_traces=contract=eosio.evm&action=pushtx`;
export const startBlockNum = 345827395;
// export const stopBlockNum = startBlockNum + 1;

// EOS EVM
export const LOCK_GENESIS_TIME = new Date("2023-04-05T02:18:09Z");

// EORC
export const TICKERS = (process.env.TICKERS ?? "eoss").split(",")

// Stream Blocks
export const writers = {
    eorc: fs.createWriteStream("eorc20.jsonl", {flags: "a"}),
    blocks: fs.createWriteStream("blocks.jsonl", {flags: "a"}),
    pushtx: fs.createWriteStream("pushtx.jsonl", {flags: "a"}),
}

export const VERBOSE = true;