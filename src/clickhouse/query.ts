import { QueryParams } from "@clickhouse/client-web";
import { client } from "./createClient.js";

interface QueryResponseMeta {
    name: string;
    type: string;
}

interface QueryResponseStatistics {
    elapsed: number;
    nows_read: number;
    bytes_read: number;
}

export interface QueryResponse<T = unknown> {
    meta: QueryResponseMeta[],
    data: T[],
    rows: number,
    statistics: QueryResponseStatistics,
}

export async function query<T>(params: QueryParams) {
    const response = await client.query(params);
    const json = await response.json();
    return json as QueryResponse<T>;
}
