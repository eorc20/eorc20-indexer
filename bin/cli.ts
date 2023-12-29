#!/usr/bin/env node

import { PAUSED } from "../src/config.js";
import { emitter } from "../src/BlockEmitter.js";
import "../src/substreams.js"

if ( PAUSED ) {
    console.log("Paused");
    process.exit(0);
}

emitter.start();
console.log("EORC-20 indexer 🚀");
