import { Address } from "viem";

// TO-DO make as SQL call
export async function getTokensByAddress(address: Address, tick: string, block_number: number): Promise<number|null> {
    try {
        const response = await fetch(`https://api.eorc20.io/balance?address=${address}&tick=${tick}&block_number=${block_number}`)
        const data = await response.json();
        console.log(data);
        return data.amt;
    } catch (e) {
        console.error(e);
        return null;
    }
}

// getTokensByAddress("0x06356df2181e4ef417b9aaa0a8848df804cc20f1", "eoss", 22732942).then(console.log)