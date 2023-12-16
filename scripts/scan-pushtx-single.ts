import fs from "fs";
import readline from "readline";

const rl = readline.createInterface({
  input: fs.createReadStream('pushtx.jsonl'),
  crlfDelay: Infinity
});

rl.on('line', async (line) => {
    const row = JSON.parse(line);
    if ( row.evm_trx_id === "0x4f391bfa20e6fd756eb535ca7a27e8d46bea6c1804af31876c2a2ab1aeb923b6") {
        console.log(row);
        process.exit(0);
    }
});
