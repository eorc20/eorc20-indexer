import { parseAbi } from "viem";

export const abi = parseAbi([
    'function inscribe(address to, bytes calldata data) public'
])
