import fs from "fs";
import logUpdate from 'log-update';
import { readPackage } from "@substreams/manifest";
import { createRegistry, createRequest, applyParams } from "@substreams/core";
import { BlockEmitter, createNodeTransport } from "@substreams/node";
import { token, baseUrl, manifest, outputModule, params, startBlockNum, stopBlockNum } from "./src/config.js";
import { readCursor, saveCursor } from "./src/utils.js";
import { blockNumberFromGenesis, toTransactionId } from "./src/evm.js";
import { rlptxToOpCode } from "./src/eorc.js";

// Read Substream
const substreamPackage = await readPackage(manifest);
if ( !substreamPackage.modules ) throw new Error("No modules found in manifest");
applyParams([params], substreamPackage.modules.modules);

// Connect Transport
const registry = createRegistry(substreamPackage);
const transport = createNodeTransport(baseUrl, token, registry);
const request = createRequest({
  substreamPackage,
  outputModule,
  startBlockNum,
  stopBlockNum,
  startCursor: readCursor(),
  finalBlocksOnly: true,
});

// NodeJS Events
const emitter = new BlockEmitter(transport, request, registry);

export interface Download {
  evm_trx_id: string;
  eos_trx_id: string;
  eos_block_number: number;
  evm_block_number: number;
  timestamp: string;
  miner: string;
  rlptx: string;
}

let start = 0;
let timestamp = 0;
let pushtx = 0;
let blocks = 0;

// Stream Blocks
const pushtx_writer = fs.createWriteStream("pushtx.jsonl", {flags: "a"});
const blocks_writer = fs.createWriteStream("blocks.jsonl", {flags: "a"});
const eorc_writer = fs.createWriteStream("eorc.jsonl", {flags: "a"});

emitter.on("anyMessage", (message: any, cursor, clock) => {
  if ( !clock.timestamp ) return;
  const evm_block_number = blockNumberFromGenesis(clock.timestamp?.toDate());

  if (!message.transactionTraces) return;
  for ( const trace of message.transactionTraces ) {
    if ( !trace.actionTraces ) continue;
    for ( const action of trace.actionTraces) {
      if ( action.action.name !== "pushtx" ) continue;
      const { miner, rlptx } = JSON.parse(action.action.jsonData);

      const evm_trx_id = toTransactionId(`0x${rlptx}`);
      const row: Download = {
        evm_trx_id,
        eos_trx_id: trace.id,
        eos_block_number: trace.blockNum,
        evm_block_number,
        timestamp: trace.blockTime,
        miner,
        rlptx,
      }
      pushtx_writer.write(JSON.stringify(row) + "\n");

      // logging
      const now = Math.floor(Date.now() / 1000);
      const date = trace.blockTime.split(".")[0] + "Z";
      if ( start === 0 ) start = now;
      pushtx += 1;
      if ( timestamp !== now ) {
        timestamp = now;
        const elapsed = (timestamp - start);

        // op codes
        const op_rate = Math.floor(pushtx / elapsed);

        // pushtx
        const pushtx_rate = Math.floor(pushtx / elapsed);

        // blocks
        const blocks_rate = Math.floor(blocks / elapsed / 2);
        const blocks_remaining = Math.floor((stopBlockNum - trace.blockNum)/2);

        logUpdate([
          "EORC",
          "----",
          `ops: ${op_rate}/s`,
          `rate: ${pushtx_rate}/s`,
          `elapsed: ${elapsed}s`,
          `timestamp: ${date}`,

          "\nEVM pushtx",
          "----------",
          `count: ${pushtx}`,
          `rate: ${pushtx_rate}/s`,

          "\nEVM blocks",
          "----------",
          `count: ${blocks}`,
          `rate: ${blocks_rate}/s`,
          `remaining: ${blocks_remaining}`,
          `current: ${evm_block_number}`
        ].join("\n"));
      }

      // EORC handling
      const eorc = rlptxToOpCode(`0x${rlptx}`);
      if ( !eorc ) continue;
      eorc_writer.write(JSON.stringify({...eorc, timestamp: date, block_number: evm_block_number, trx_id: evm_trx_id}) + "\n");
    }
  }
});

emitter.on("cursor", (cursor, clock) => {
  saveCursor(cursor);
  if ( !clock.timestamp ) return;
  const timestamp = clock.timestamp?.toDate();
  const evm_block_number = blockNumberFromGenesis(timestamp);
  blocks_writer.write(JSON.stringify({timestamp, evm_block_number, eos_block_number: Number(clock.number), eos_block_id: clock.id }) + "\n");
  blocks+=1;
});

// End of Stream
emitter.on("close", (error) => {
  if (error) {
    console.error(error);
  }
});

// Fatal Error
emitter.on("fatalError", (error) => {
  console.error(error);
});

emitter.start();