import * as metrics from "../prometheus.js";
import { NotFound } from "./cors.js";
import inscription from "./inscription.js";
import tokens from "./tokens.js";

export default async function (req: Request) {
  const { pathname } = new URL(req.url);
  metrics.requests.inc();

  if (pathname === "/tokens") return tokens(req);
  if (pathname === "/inscription") return inscription(req);
  return NotFound;
}