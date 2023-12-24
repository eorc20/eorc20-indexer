import { createClient as createClientWeb } from "@clickhouse/client-web";
import { DATABASE, HOST, PASSWORD } from "../config.js";
import { ping } from "./ping.js";

function createClient(readonly = false) {
    const client = createClientWeb({
        host: HOST,
        password: PASSWORD,
        database: DATABASE,
        clickhouse_settings: {
            wait_for_async_insert: 0, // 0
            async_insert: 1, // 1
            readonly: readonly ? "1" : "0",
        },
        application: "EORC-20 Indexer",
    });
    client.command = client.exec;
    client.ping = ping as any;
    return client;
}

export const client = createClient();