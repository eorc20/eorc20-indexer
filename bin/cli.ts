#!/usr/bin/env node

import { IGNORE_SCAN, PAUSED } from "../src/config.js";
import { emitter } from "../src/BlockEmitter.js";
import { scan } from "../src/scan.js"
import "../src/substreams.js"

if ( PAUSED ) {
    console.log("Paused");
    process.exit(0);
}

// Scan existing inscriptions and index them before starting the server
if ( !IGNORE_SCAN ) {
  await scan();
}

// Start indexing with substreams
emitter.start();
console.log("EORC-20 indexer 🚀");
