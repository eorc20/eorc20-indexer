import fs from "fs";
import readline from "readline";

const rl = readline.createInterface({
  input: fs.createReadStream('eorc.jsonl'),
  crlfDelay: Infinity
});

let total = 0;
rl.on('line', (line) => {
    const row = JSON.parse(line);
    if ( row.to === "0xB96F197992b795078407A2C170eADa7894488Bb9") {
        total +=1;
        console.log(total);
    }
});

rl.on('close', () => {
    console.log(total)
});