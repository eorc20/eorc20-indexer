import fs from "fs";
import readline from "readline";

const writer = fs.createWriteStream("eorc-clean.jsonl");

// create a readline interface for reading the file line by line
const rl = readline.createInterface({
  input: fs.createReadStream('eorc.jsonl'),
  crlfDelay: Infinity
});

// read each line of the file and parse it as JSON
rl.on('line', (line) => {
  const row = JSON.parse(line);
  row.timestamp = row.timestamp.replace("ZZ", "Z");
  writer.write(JSON.stringify(row) + "\n");
});

// log the parsed JSON objects once the file has been fully read
rl.on('close', () => {
  console.log("done");
});
