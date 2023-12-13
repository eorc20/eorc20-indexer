import { keccak256, Address } from 'viem'
import { LOCK_GENESIS_TIME } from './config.js';

export function toTransactionId(rlptx: Address) {
    const value = Buffer.from(rlptx.replace(/^0x/,""), "hex");
    return keccak256(value);
}

export function blockNumberFromGenesis(blockTime: Date) {
    const current = Math.floor(blockTime.valueOf() / 1000)
    const genesis = Math.floor(LOCK_GENESIS_TIME.valueOf() / 1000);
    return current - genesis + 1;
}