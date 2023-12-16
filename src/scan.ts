import fs from "node:fs";
import readline from "node:readline";

async function scan(filename: string) {
    return new Promise((resolve, reject) => {
        const rl = readline.createInterface({
            input: fs.createReadStream(filename),
            crlfDelay: Infinity
        });

        rl.on('line', (line) => {
            const row = JSON.parse(line);
            console.log(row);
        });

        rl.on("close", () => {
            return resolve(true);
        });

        rl.on("error", (error) => {
            return reject(error);
        });
    });
}

await scan("eorc.jsonl");