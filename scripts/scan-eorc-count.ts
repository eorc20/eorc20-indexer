import fs from "fs";
import readline from "readline";
import main from "../miners_main.json";
import before from "../miners_before.json";

const writer_after = fs.createWriteStream("eorc20-eoss-after.csv");
const writer_before = fs.createWriteStream("eorc20-eoss-before.csv");
const writer_main = fs.createWriteStream("eorc20-eoss-main.csv");

writer_after.write("address,tokens\n");
writer_main.write("address,tokens\n");
writer_before.write("address,tokens\n");

const rl = readline.createInterface({
  input: fs.createReadStream('eorc2.jsonl'),
  crlfDelay: Infinity
});

const senders = new Map<string, number>();
let active = false;
let total_main = 0;
let total_after = 0;
let total_before = 0;
let last: any;
let first: any;

let last_after: any;
let first_after: any;
let last_before: any;
let first_before: any;
let max_supply = 21000000 * 10000;
let lim = 10000;
let mint_number = 0;
let mint_number_after = 0;
let mint_number_before = 0;

const miners_main = new Map<string, number>();
const miners_after = new Map<string, number>();
const miners_before = new Map<string, number>();

// const writers = new Map<string, fs.WriteStream>();

rl.on('line', async (line) => {
    const row = JSON.parse(line);
    const { p, to, op, tick, trx_id } = row;
    const amt = Number(row.amt);
    const max = Number(row.max);
    const timestamp = new Date(row.timestamp).valueOf();
    const annoucement = new Date("2023-12-10T17:00:00Z").valueOf();
    // console.log(timestamp, annoucement, timestamp <= annoucement)
    // invalidate 1st deploy operation
    if ( trx_id === "0x48d4a902a0327c4c59b3e8f4c6a3a614f6f9950cb61b9771d726f9fd59480e2b") return;
    if ( p !== "eorc20" ) return;
    if ( tick !== "eoss") return;
    if ( op === "deploy" ) {
      console.log(row);
      active = true;
    }
    if ( op !== "mint") return;
    if ( amt !== lim) return;
    if ( active === false ) {
      if ( (main as any)[to] ) return;
      miners_before.set(to, (miners_before.get(to) || 0) + amt);
      total_before += amt;
      mint_number_before += 1;
      last_before = row;
      if ( !first_before ) first_before = row;
      return;
    }
    const finished = total_main + amt > max_supply;
    if ( finished ) {
      if ( timestamp <= annoucement ) {
        if ( (main as any)[to] ) return;
        if ( (before as any)[to] ) return;
        miners_after.set(to, (miners_after.get(to) || 0) + amt);
        total_after += amt;
        mint_number_after += 1;
        last_after = row;
        if ( !first_after ) first_after = row;
      }
      return;
    }
    // // if ( !writers.has(to)) writers.set(to, fs.createWriteStream(`miners/${to}.csv`));
    // // writers.get(to)?.write(`${line}\n`);
    mint_number += 1;
    miners_main.set(to, (miners_main.get(to) || 0) + amt);
    total_main += amt;
    last = row;
    if ( !first ) first = row;
});

rl.on('close', () => {
  const obj_before: any = {};
  const obj_main: any = {};
  const obj_after: any = {};

  // Before
  for ( const [address, tokens] of Array.from(miners_before.entries())) {
    obj_before[address] = tokens;
    writer_before.write(`${address},${tokens}\n`);
  }
  fs.writeFileSync("miners_before.json", JSON.stringify(obj_before, null, 4));

  // main
  for ( const [address, tokens] of Array.from(miners_main.entries())) {
    obj_main[address] = tokens;
    writer_main.write(`${address},${tokens}\n`);
  }
  fs.writeFileSync("miners_main.json", JSON.stringify(obj_main, null, 4));

  // after
  for ( const [address, tokens] of Array.from(miners_after.entries())) {
    obj_after[address] = tokens;
    writer_after.write(`${address},${tokens}\n`);
  }
  fs.writeFileSync("miners_after.json", JSON.stringify(obj_after, null, 4));

  console.log({total_main, first, last, mint_number, unique: miners_main.size})
  console.log({total_after, first_after, last_after, mint_number_after, unique: miners_after.size})
  console.log({total_before, first_before, last_before, mint_number_before, unique: miners_before.size})
});