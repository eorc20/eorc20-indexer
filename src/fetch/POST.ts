import { NotFound, toText } from "./cors.js";
import tokens from "./tokens.js";

export default async function (req: Request) {
  const { pathname } = new URL(req.url);

  if (pathname === "/tokens") return tokens(req);
  return NotFound;
}