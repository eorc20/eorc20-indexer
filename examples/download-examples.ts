import { client } from "../src/clickhouse/createClient.js";
import { query } from "../src/clickhouse/query.js";

const invalid_ids = [
    "0x4c3c5fa428a37c185dba33d17056d1d3aec8bcc2636005f1350885a6fd915418",
    "0xb6b437aaf038ae7a11eb8dc6a40c8f383d6a35b997a80c4da682e1a08fcc6d0e",
    "0xaca765c3bb330369f4ff6e74decfd54e25cdb3bc990c68b6328f20b5050641a6",
    "0xa16b3bf114b4d8e72f858f9f5d647b8798c7338d48af88f8efb39435edf7cada",
    "0x3d56e4446226f54619cb59ff9bcb9175118d1d67a8b1199a2ad3b52ccb53a877",
    "0xb81a944ced03ce42fd247c2182096326941da1e9032b0763ac1bd6b5f1224066",
    "0x313632b35679d4c4fac5c029401858db825a5fcc7f3ad32505720b840060cdb5",
    "0x463a74662f6425ad7c022a860a5f68dfaba6f75aa603ff081e6e9e9cc87a4438",
    "0xc9d1e7b6c4a27b7b1b7b70d484d3c878a5b18ea563918899c412441cdaa169f8",
    "0xb5f860b16815cc35d2a52dd38437b994f4ec5d09c829b9415853b461585d9791",
    "0x94b15b4761fb4011e0130f11ad4a67185d787e5e44b1bdc855d8f47aefd58f1d",
    "0x1cb6a272ca0aadfcc87bd5c2ec05edb52ae2b97c37b30a64b8a7b3eaf30d008e",
]

const insufficient_balance_ids = [
    "0x2a0eeb4203635767cca51358d6523de3ea48a6b7c936f1cfc9cd5eaa9eff28b5",
    "0x4dc03d47b34a736cdcfecc7d94085797f737893f86147f79843edb872e905732",
    "0x526c2354472c68d9e988b371577413cf2ea5ca1f58fecd663b79736dbe61b468",
    "0x1331d9eede6999440b27d93246b5ef651d25412327610b4f9afd8e76a5fcca6e",
    "0x1f837e2cbef5cb96a8cfc0f87e90edce64fa1e6b385149488e8594efecca175d",
    "0x8abef87fc5d77e12373378f672f2750966f0254f62ae29079744d534089086ef",
    "0x242c15d9e67ac3fdd23012811a97490e13ae62810b12a11ca80af6c646b2ad85",
    "0xc854de1ab9f8161453cb02454066d282cfec276eac03c36be3225556d6daf5f8",
    "0x21a5e40b0f604613a7717e8296b74de36d98be4f33a789872a8f0884f158b51b",
    "0x0f77e63d94d4c172d0a1d3d8f84419407c4fa4e7cd5cea9d5b3a16d4c2a6c3d1",
    "0xac5ec908b83198bd9f241118aed6757bc28b9ae686bbecf856e0545925bb01e4",
    "0x575288d2c10a72e900807d29ac53050e62d3a6bdb06aac39f307f88c2d5b93be",
    "0xa54a24b3c24a9b5ab2230d2ede7fb0bb3a14511b9b70bf3930ad69c522b8fb66",
    "0xcaa084203da53095fe6a8a4d785f5e7f7dc08ccdd262e3e2ec89c2d6ee45007b",
    "0x16a3e9be096bc4790ed1dd56eb79fe512144867214c189964c0fb4b839ed3c28",
]

for ( const id of insufficient_balance_ids) {
    const transfer = await query<any>({query: "SELECT * FROM transfer WHERE id = {id: String}", query_params: {id}})
    console.log(transfer.data);

    const transactions = await query<any>({query: "SELECT * FROM transactions WHERE transaction_hash = {id: String}", query_params: {id}})
    console.log(transactions.data);
}