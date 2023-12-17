#!/usr/bin/env node

import { PAUSED, PORT } from "./src/config.js";
import "./src/substreams.js";

if ( PAUSED ) {
  console.log("Paused");
  process.exit();
}

const app = Bun.serve({
  hostname: "0.0.0",
  port: PORT,
  fetch(req: Request) {
    return new Response("Hello World");
    // if (req.method === "GET") return GET(req);
    // if (req.method === "POST") return POST(req);
    // if (req.method === "PUT") return PUT(req);
    // if (req.method === "OPTIONS") return OPTIONS(req);
    // if (req.method === "DELETE") return DELETE(req);
    // return NotFound;
  },
});

console.log(`Server listening on http://${app.hostname}:${app.port}`);
