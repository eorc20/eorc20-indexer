import { Address, Hex } from "viem";
import { DeployOpCode, Ticker } from "../eorc20.js";

export const MAX_SUPPLY = new Map<Ticker, number>();
export const SUPPLY = new Map<Ticker, number>();
export const LIMIT = new Map<Ticker, number>();
export const PRECISION = new Map<Ticker, number>();
export const CREATED_AT = new Map<Ticker, number>();
export const NUMBER = new Map<Ticker, number>();
export const ID = new Map<Ticker, Hex>();
export const OWNER = new Map<Ticker, Address>();

export function deploy(id: Hex, number: number, from: Address, opCode: DeployOpCode, timestamp: number) {
    // fix overlapping deploy
    const { tick, max, lim, prec } = opCode;
    MAX_SUPPLY.set(tick, Number(max));
    SUPPLY.set(tick, 0);
    if ( lim ) LIMIT.set(tick, Number(lim));
    if ( prec ) PRECISION.set(tick, Number(prec));
    CREATED_AT.set(tick, timestamp);
    NUMBER.set(tick, number);
    OWNER.set(tick, from);
    ID.set(tick, id);
}
