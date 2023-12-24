import { Address } from "viem";

// TO-DO make as SQL call
export async function getTokensByAddress(address: Address, tick: string): Promise<number|null> {
    const response = await fetch(`https://api.eorc20.io/tokens?address=${address}&tick=${tick}`)
    try {
        const json: {data: {amount: number, tick: string}[]} = await response.json();
        if ( !json.data.length) return 0;
        for ( const row of json.data ) {
            if ( row.tick === tick ) return Number(row.amount);
        }
        return 0;
    } catch (e) {
        console.error(e);
        return null;
    }
}