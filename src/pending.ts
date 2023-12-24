
import { sleep } from "./utils.js";
import { metrics } from "./pending/metrics.js";
import { getLastPendingTransfer } from "./pending/getLastPendingTransfer.js";
import { getTokensByAddress } from "./pending/getTokensByAddress.js";
import { approve, confirmTransaction, error } from "./pending/approve.js";
import { Hex } from "viem";
console.log("🤖 start monitoring pending transfers...");

const tick = 'eoss';

let confirm_last_id = new Set<Hex>()

while (true) {
    await sleep(1000);
    // get last confirmed transfer
    if ( confirm_last_id.size ) {
        const id = confirm_last_id.values().next().value;
        const confirmed = await confirmTransaction(id);
        if ( confirmed ) {
            confirm_last_id.delete(id);
            console.log(`✅ confirmed transfer id = ${id}`);
        } else {
            console.log(`⚠️ NOT confirmed transfer id = ${id}`);
            continue;
        }
    }

    // get last pending transfer
    const pendingTransfer = await getLastPendingTransfer(tick);
    if ( !pendingTransfer ) {
        console.log(`no pending transfers | approved/errors ${metrics.approve}/${metrics.error} (retry=${metrics.retry++})`);
        await sleep(1000);
        continue;
    }
    // Values from pending Transfer
    const { id, from, to } = pendingTransfer;
    const amt = Number(pendingTransfer.amt);

    // get available balance
    let availableBalance = await getTokensByAddress(from, tick);
    if ( availableBalance === null ) {
        console.error(`❌ failed to get balance for ${from}`);
        continue;
    }

    // compute remaining balance after transfer
    const balance = availableBalance - amt;
    console.log({pendingTransfer, availableBalance, balance})

    // error (5) - cannot transfer to self
    if ( from === to ) {
        await error(id, 5);
        confirm_last_id.add(id);
        metrics.error++;
        continue;

    // error (4) - insufficient balance
    } else if ( balance < 0 ) {
        await error(id, 4);
        confirm_last_id.add(id);
        metrics.error++;
        continue;

    // error (6) - decimals is invalid
    } else if (amt !== Math.floor(amt) ) {
        await error(id, 6);
        confirm_last_id.add(id);
        metrics.error++;
        continue;

    // fallback to approve
    } else {
        await approve(id);
        confirm_last_id.add(id);
        metrics.approve++;
        continue;
    }
}
