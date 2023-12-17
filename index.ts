#!/usr/bin/env node

import { PAUSED, PORT } from "./src/config.js";
// import DELETE from "./src/fetch/DELETE.js";
import GET from "./src/fetch/GET.js";
import OPTIONS from "./src/fetch/OPTIONS.js";
// import POST from "./src/fetch/POST.js";
// import PUT from "./src/fetch/PUT.js";
import { NotFound } from "./src/fetch/cors.js";
import "./src/substreams.js";

if ( PAUSED ) {
  console.log("Paused");
  process.exit();
}

const app = Bun.serve({
  // hostname: "0.0.0.0",
  port: PORT,
  fetch(req: Request) {
    // return new Response("Hello World");
    if (req.method === "GET") return GET(req);
    // if (req.method === "POST") return POST(req);
    // if (req.method === "PUT") return PUT(req);
    if (req.method === "OPTIONS") return OPTIONS(req);
    // if (req.method === "DELETE") return DELETE(req);
    return NotFound;
  },
});

// console.log(`Server listening on http://${app.hostname}:${app.port}`);
