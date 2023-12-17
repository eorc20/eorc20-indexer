import { Address, Hex } from "viem";
import { Ticker } from "../eorc20.js";

export type Balances = Map<Ticker, bigint>;

export const BALANCES = new Map<Address, Balances>();

export function getBalance(address: Hex, ticker: string) {
    const balances = BALANCES.get(address);
    if ( !balances ) return null;
    const balance = balances.get(ticker);
    if ( balance === undefined ) return null;
    return balance;
}
