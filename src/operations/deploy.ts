import { DeployOpCode, Ticker } from "../eorc20.js";

export const MAX_SUPPLY = new Map<Ticker, number>();
export const SUPPLY = new Map<Ticker, number>();
export const LIMIT = new Map<Ticker, number>();

export function deploy(opCode: DeployOpCode) {
    const { tick, max, lim } = opCode;
    MAX_SUPPLY.set(tick, Number(max));
    SUPPLY.set(tick, 0);
    if ( lim ) LIMIT.set(tick, Number(lim));
}
