import { Address } from "viem";
import { BALANCES } from "../operations/balances.js";
import { TokensListItem, TokensPayload, TokensResponse } from "../schemas.js";
import { toJSON } from "./cors.js";
import { CREATED_AT, NUMBER, PRECISION } from "../operations/deploy.js";

export default async function tokens(req: Request): Promise<Response> {
  const payload = await req.json() as TokensPayload;
  const { address, page, pageSize, tick } = payload;
  if ( !address ) return new Response("address required", { status: 400 });
  const balances = BALANCES.get(address as Address);
  if ( !balances ) return new Response("address not found", { status: 404 });
  const list: TokensListItem[] = [];

  for ( const [tick, amount] of balances ) {
    const precision = PRECISION.get(tick) ?? 0;
    const createdAt = CREATED_AT.get(tick) ?? 0;
    const number = NUMBER.get(tick) ?? 0;

    list.push({
      number,
      tick,
      amount: amount.toString(),
      precision,
      createdAt
    });
  }

  const response: TokensResponse = {
    status: 200,
    data: {
        list,
        count: 1,
    }
  }
  return toJSON(response);
}