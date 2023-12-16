import { saveCursor } from "./src/utils.js";
import { blockNumberFromGenesis, getFromAddress, toTransactionId } from "./src/eos.evm.js";
import { rlptxToOpCode } from "./src/eorc.js";
import { emitter } from "./src/substreams.js";
import { writers } from "./src/config.js";

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

      // EORC handling
      const eorc = rlptxToOpCode(`0x${rlptx}`);
      if ( !eorc ) continue;
      const from = await getFromAddress(`0x${rlptx}`);
      console.log({from, eorc})
      writers.eorc.write(JSON.stringify({
        from,
        ...eorc,
        timestamp,
        block_number,
        trx_id,
      }) + "\n");
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

emitter.start();