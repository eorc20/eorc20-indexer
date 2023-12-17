import { TokensPayload, TokensResponse } from "../schemas.js";
import { toJSON } from "./cors.js";

export default async function tokens(req: Request): Promise<Response> {
  const payload = await req.json() as TokensPayload;
  const { address, page, pageSize, tick } = payload;
  const response: TokensResponse = {
    status: 200,
    data: {
        list: [],
        count: 1,
    }
  }
  return toJSON(response);
}