import { Address, Hex } from "viem";
import { DeployOpCode, MintOpCode, TransferOpCode } from "../eorc20.js";
import { deploy } from "./deploy.js";
import { mint } from "./mint.js";

export let number = 0;

export function handleOpCode(id: Hex, from: Address, to: Address, opCode: DeployOpCode | TransferOpCode | MintOpCode, timestamp: number) {
    number += 1;
    switch (opCode.op) {
        case "deploy":
            return deploy(id, number, from, opCode, timestamp);
        case "mint":
            return mint(from, opCode);
        // case "transfer":
        //     return transfer(opCode);
    }
}