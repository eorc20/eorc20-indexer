import fs from "fs";
import readline from "readline";

const rl = readline.createInterface({
  input: fs.createReadStream('blocks.jsonl'),
  crlfDelay: Infinity
});

let last_eos_block_number = 0;
let last_evm_block_number = 0;
rl.on('line', (line) => {
    const row = JSON.parse(line);
    if ( row.evm_block_number === 21515155) {
        console.log(row);
        process.exit(0);
    }
    // if (row.eos_block_number - last_eos_block_number >= 2 ) {
    //     console.log(`EOS block ${row.eos_block_number} is missing`);
    // }
    // if (row.evm_block_number - last_evm_block_number >= 2 ) {
    //     console.log(`EVM block ${row.evm_block_number - 1} is missing`);
    // }
    // last_eos_block_number = row.eos_block_number;
    // last_evm_block_number = row.evm_block_number;
});
