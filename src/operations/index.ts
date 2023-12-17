import { Address, Hex } from "viem";
import { DeployOpCode, MintOpCode, TransferOpCode } from "../eorc20.js";
import { deploy } from "./deploy.js";
import { mint } from "./mint.js";

export let INSCRIPTION_NUMBER = 0;

export function handleOpCode(id: Hex, from: Address, to: Address, opCode: DeployOpCode | TransferOpCode | MintOpCode, timestamp: number) {
    INSCRIPTION_NUMBER += 1;
    switch (opCode.op) {
        case "deploy":
            return deploy(id, INSCRIPTION_NUMBER, from, opCode, timestamp);
        case "mint":
            return mint(from, opCode);
        // case "transfer":
        //     return transfer(opCode);
    }
}