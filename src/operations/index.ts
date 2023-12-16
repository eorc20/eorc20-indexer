import { DeployOpCode, MintOpCode, TransferOpCode } from "../eorc20.js";
import { deploy } from "./deploy.js";
import { mint } from "./mint.js";

export function handleOpCode(opCode: DeployOpCode | TransferOpCode | MintOpCode) {
    switch (opCode.op) {
        case "deploy":
            return deploy(opCode);
        case "mint":
            return mint(opCode);
        // case "transfer":
        //     return transfer(opCode);
    }
}