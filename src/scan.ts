import fs from "node:fs";
import readline from "node:readline";
import { EORC20_PATH } from "./config.js";
import { InscriptionRawData } from "./schemas.js";
import { handleOpCode } from "./operations/index.js";
import { parseOpCode } from "./eorc20.js";

export async function scan() {
    console.log("Scanning inscriptions...");
    let operations = 0;
    return new Promise((resolve, reject) => {
        console.time("Scan completed");
        const rl = readline.createInterface({
            input: fs.createReadStream(EORC20_PATH),
            crlfDelay: Infinity
        });
        rl.on('line', (line) => {
            const row = JSON.parse(line) as InscriptionRawData;
            const opCode = parseOpCode(row.content);
            handleOpCode(opCode);
            operations++;
        });

        rl.on("close", () => {
            console.timeEnd("Scan completed");
            console.log(`Total operations: ${operations}`);
            return resolve(true);
        });

        rl.on("error", (error) => {
            return reject(error);
        });
    });
}

// await scan();