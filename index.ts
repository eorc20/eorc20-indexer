#!/usr/bin/env node

import { IGNORE_SCAN, HTTP_ONLY, PAUSED, PORT } from "./src/config.js";
import GET from "./src/fetch/GET.js";
import OPTIONS from "./src/fetch/OPTIONS.js";
import POST from "./src/fetch/POST.js";
import { NotFound } from "./src/fetch/cors.js";
import { start } from "./src/substreams.js";
import { scan } from "./src/scan.js"

// Scan existing inscriptions and index them before starting the server
if ( !IGNORE_SCAN ) {
  await scan();
}

// Start indexing with substreams
if (!HTTP_ONLY ) {
  start();
}

if ( PAUSED ) {
  console.log("Paused");
  process.exit(0);
}

const app = Bun.serve({
  port: PORT,
  fetch(req: Request) {
    if (req.method === "GET") return GET(req);
    if (req.method === "POST") return POST(req);
    if (req.method === "OPTIONS") return OPTIONS(req);
    return NotFound;
  },
});

console.log(`Server listening on http://${app.hostname}:${app.port}`);
