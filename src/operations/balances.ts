import { Address, Hex } from "viem";
import { Ticker } from "../eorc20.js";

export type Balance = Map<Ticker, number>;

export const BALANCES = new Map<Address, Balance>();

export function getBalance(address: Hex, ticker: string) {
    const balances = BALANCES.get(address);
    if ( !balances ) return null;
    const balance = balances.get(ticker);
    if ( balance === undefined ) return null;
    return balance;
}
