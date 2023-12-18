import { createClient } from "@clickhouse/client";
// import { name as application } from "../../package.json";
import { DATABASE, HOST, PASSWORD } from "../config.js";

export const client = createClient({
    host: HOST,
    password: PASSWORD,
    database: DATABASE,
    clickhouse_settings: {
        wait_for_async_insert: 0, // 0
        async_insert: 1, // 1
    },
    application: "EORC-20 indexer",
});