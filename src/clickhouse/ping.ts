import { client } from "./createClient.js";

export async function ping() {
    return client.exec({ query: "SELECT 1" });
}