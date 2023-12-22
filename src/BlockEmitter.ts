import { readPackage } from "@substreams/manifest";
import { createRegistry, createRequest, applyParams } from "@substreams/core";
import { BlockEmitter, createNodeTransport } from "@substreams/node";
import { manifest, outputModule, params, startBlockNum, stopBlockNum, FINAL_BLOCKS_ONLY } from "./config.js";
import { readCursor } from "./utils.js";

// auth API token
// https://app.streamingfast.io/
// https://app.pinax.network/
if (!process.env.SUBSTREAMS_API_TOKEN) {
  throw new Error("SUBSTREAMS_API_TOKEN is require");
}

export const token = process.env.SUBSTREAMS_API_TOKEN;
export const baseUrl = "https://eos.substreams.pinax.network:443";

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
  finalBlocksOnly: FINAL_BLOCKS_ONLY,
  // productionMode: true,
});

// NodeJS Events
export const emitter = new BlockEmitter(transport, request, registry);
