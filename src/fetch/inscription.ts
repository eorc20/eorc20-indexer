import { InscriptionPayload, InscriptionResponse } from "../schemas.js";
import { toJSON } from "./cors.js";

export default async function inscription(req: Request): Promise<Response> {
  const payload = await req.json() as InscriptionPayload;
  const { owner, page, pageSize, tick } = payload;
  const response: InscriptionResponse = {
    status: 200,
    data: [],
  }
  return toJSON(response);
}