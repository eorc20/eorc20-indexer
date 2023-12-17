import { toText } from "./cors.js";

export default async function (): Promise<Response> {
  return toText("OK");
}