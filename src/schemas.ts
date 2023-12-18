import { Address, Hex } from "viem";

export interface InscriptionRawDataPrevious {
    id: string;
    block: number;
    timestamp: number;
    from: string;
    to: string;
    contentType: string;
    content: string;
    value?: string;
}

export interface TransactionRawData {
    transaction_hash: Hex;          // "0x8c3adec69b79c036a21e7ccddf2ef387ef6ecde6a9bd7ef1b3d40c3fe1d399b1"
    block_number: number;           // 21443083
    timestamp: number;              // 1702104171
    creator: Address;               // "0x50e6585875ad67ffa6bd44381d7a572bdbdfa0ae"
    from_address: Address;          // "0x50e6585875ad67ffa6bd44381d7a572bdbdfa0ae"
    to_address: Address;            // "0x50e6585875ad67ffa6bd44381d7a572bdbdfa0ae"
    content_uri: string;            // "data:,{\"p\":\"eorc20\",\"op\":\"mint\",\"tick\":\"eoss\",\"amt\":\"10000\"}"
    value?: string;                  // "0"

    // extras
    native_block_number: number;    // 347344702
    native_block_id: string;        // 14b40f3e3d15a86a78ca8ffa6bb9e23c4346bb83d9baae885f0ee60c2ee82c56
    mimetype: string;               // "text/plain"
    media_type: string;             // "text"
    mime_subtype: string;           // "plain"
    nonce?: number;
    transaction_index: number;
    gas?: string;
    gas_price?: string;
    sha: string;
    miner: string;
}

export interface NativeBlock {
    native_block_number: number;    // 347344702
    native_block_id: string;        // 14b40f3e3d15a86a78ca8ffa6bb9e23c4346bb83d9baae885f0ee60c2ee82c56
    timestamp: number;              // 1702104171
    final: boolean;
}