import { BALANCES } from "./balances.js";
import { MintOpCode } from "../eorc20.js";
import { LIMIT, MAX_SUPPLY, SUPPLY } from "./deploy.js";
import { Address } from "viem";

export function mint(from: Address, opCode: MintOpCode) {
    let { tick, amt } = opCode;
    const balances = BALANCES.get(from);
    const amount = BigInt(amt);

    // ticker must be deployed
    const max_supply = MAX_SUPPLY.get(tick);
    const supply = SUPPLY.get(tick);
    const limit = LIMIT.get(tick);

    // mint amount must equal to limit to be valid
    if ( limit !== undefined ) {
        if ( amount !== BigInt(limit) ) return;
    }

    // ensure max supply is not exceeded
    if ( max_supply === undefined || supply === undefined ) return;
    if ( BigInt(supply) + BigInt(amount) > max_supply ) return;

    // user has no balances at all
    if ( !balances ) {
        BALANCES.set(from, new Map([[tick, amount]]));
    } else {
        const balance = balances.get(tick);

        // user has no balance of this token
        if ( balance === undefined ) {
            balances.set(tick, amount);

        // user has a balance of this token
        } else {
            balances.set(tick, balance + amount);
        }
    }
}
