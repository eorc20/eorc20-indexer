import { saveCursor } from "./src/utils.js";
import { blockNumberFromGenesis, getFromAddress, toTransactionId } from "./src/eos.evm.js";
import { rlptxToOpCode } from "./src/eorc20.js";
import { emitter } from "./src/substreams.js";
import { writers } from "./src/config.js";
import logUpdate from "log-update";

let total = 0;
const start = Math.floor(Date.now().valueOf() / 1000);
let last = start;

emitter.on("anyMessage", async (message: any, cursor, clock) => {
  if ( !clock.timestamp ) return;
  const block_number = blockNumberFromGenesis(clock.timestamp?.toDate());
  const timestamp = clock.timestamp?.toDate().toISOString();

  if (!message.transactionTraces) return;
  for ( const trace of message.transactionTraces ) {
    if ( !trace.actionTraces ) continue;
    for ( const action of trace.actionTraces) {
      if ( action.action.name !== "pushtx" ) continue;
      const { miner, rlptx } = JSON.parse(action.action.jsonData);
      const trx_id = toTransactionId(`0x${rlptx}`);

      // EOS EVM push transaction
      writers.pushtx.write(JSON.stringify({
        trx_id,
        timestamp: trace.blockTime,
        block_number,
        eos_trx_id: trace.id,
        eos_block_number: trace.blockNum,
        miner,
        rlptx,
      }) + "\n");

      // EORC-20 handling
      const data = rlptxToOpCode(`0x${rlptx}`);
      if ( !data ) continue;
      const from = await getFromAddress(`0x${rlptx}`);

      writers.eorc.write(JSON.stringify({
        from,
        ...data,
        timestamp,
        block_number,
        trx_id,
      }) + "\n");

      // Update progress
      const now = Math.floor(Date.now().valueOf() / 1000);
      total++;
      const rate = total / (now - start);
      if ( last !== now ) logUpdate(`Processed ${total} EORC-20 operations at ${rate.toFixed(2)} op/s`);
      last = now
    }
  }

  // Save cursor
  saveCursor(cursor);
  writers.blocks.write(JSON.stringify({
    timestamp,
    block_number,
    eos_block_number: Number(clock.number),
    eos_block_id: clock.id
  }) + "\n");
});

// End of Stream
emitter.on("close", (error) => {
  if (error) {
    console.error(error);
  }
});

// Fatal Error
emitter.on("fatalError", (error) => {
  console.error(error);
});

const cancelFn = emitter.start();
console.log("EORC-20 indexer 🚀");

// Handle user exit
process.on("SIGINT", () => {
  console.log("closing...");
  cancelFn();
  process.exit();
});
