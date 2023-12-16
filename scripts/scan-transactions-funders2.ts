import fs from "fs";
import readline from "readline";
import pQueue from "p-queue";
import all_funders from "../funders.json"

const queue = new pQueue({ concurrency: 1 });

const writer = fs.createWriteStream("transfers-to-funders.csv");
writer.write("address,eos_transfered,multi_transfers,total_miners,tokens\n");
const rl = readline.createInterface({
  input: fs.createReadStream('transactions.jsonl'),
  crlfDelay: Infinity
});

let total = 0;
let count = 0;
const funders = new Map<string, {
  value: number;
  multi_transfers: number;
  miners: Set<string>;
}>();

rl.on('line', async (line) => {
    const { from, to, value } = JSON.parse(line);
    const tokens = (all_funders as any)[to];
    if ( !tokens ) return;
    // console.log({from, to, value: value / 10**18});
    const eos = value / 10**18;
    // writer.write(`${from},${to},${eos},${tokens}\n`);
    const previous = funders.get(from);
    funders.set(from, {
      value: (previous?.value || 0) + eos,
      multi_transfers: (previous?.multi_transfers || 0) + 1,
      miners: new Set([...(previous?.miners || []), to])
    });
    total += eos;
    count++;
});

rl.on('close', () => {
  const sorted = Array.from(funders.entries()).sort((a, b) => b[1].value - a[1].value);
  let total_tokens = 0;
  const current: any = {};

  let total_tokens_miners = 0;
  for ( const tokens of Object.values(all_funders) ) {
    total_tokens_miners += tokens;
  }
  for ( const [address, {value, multi_transfers}] of sorted) {
    const miners = funders.get(address)?.miners
    if ( !miners ) continue;
    let tokens = 0;
    for ( const miner of [...miners] ) {
      if ( miner in all_funders) {
        tokens += (all_funders as any)[miner];
      }
    }
    current[address] = tokens;
    total_tokens += tokens;
    console.log(JSON.stringify({address, value: value.toFixed(1), multi_transfers, total_miners: miners.size, tokens}))
    writer.write([
      address,
      Number(value.toFixed(1)),
      multi_transfers,
      miners.size,
      tokens,
    ].join(",") + "\n");
  }
  fs.writeFileSync("funders2.json", JSON.stringify(current, null, 2));
  console.log({total, total_tokens, count, size: funders.size, total_tokens_miners})
});