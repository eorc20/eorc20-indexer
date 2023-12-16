import { readPackage } from "@substreams/manifest";
import { createRegistry, createRequest, applyParams } from "@substreams/core";
import { BlockEmitter, createNodeTransport } from "@substreams/node";
import { token, baseUrl, manifest, outputModule, params, startBlockNum, stopBlockNum } from "./config.js";
import { readCursor } from "./utils.js";

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
export const emitter = new BlockEmitter(transport, request, registry);