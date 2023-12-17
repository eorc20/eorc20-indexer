import fs from "node:fs";
import readline from "node:readline";
import { EORC20_PATH } from "./config.js";

export async function scan() {
    console.log("Scanning inscriptions...");
    return new Promise((resolve, reject) => {
        console.time("Scan completed");
        const rl = readline.createInterface({
            input: fs.createReadStream(EORC20_PATH),
            crlfDelay: Infinity
        });
        rl.on('line', (line) => {
            const row = JSON.parse(line);
            // console.log(row);
        });

        rl.on("close", () => {
            console.timeEnd("Scan completed");
            return resolve(true);
        });

        rl.on("error", (error) => {
            return reject(error);
        });
    });
}

// await scan();