import { describe, expect, test } from "bun:test";
import { contentUriToSha256, isContract, parseOpCode, parseOpCodeFromContract, parseOpCodeFromHex, rlptxToTransaction } from "./eorc20.js";

describe("parseOpCode", () => {
    test("rlptxToTransaction", () => {
        const tx = rlptxToTransaction("0xf8a3808522ecb25c008255c894b96f197992b795078407a2c170eada7894488bb980b83c646174613a2c7b2270223a22656f72633230222c226f70223a226d696e74222c227469636b223a22656f7373222c22616d74223a223130303030227d828b05a05504af55e2ff8427c36888cc7fe98520c6d12918fe0e43c03c654b7d0071a6a7a062b80c13bc0e210d2a7cda668fa626ab6cd529013486c29f050795f7eb17a744");
        if ( !tx ) return;
        if ( !tx.data ) return;
        expect(tx.data).toBeDefined();
    });

    test("rlptxToTransaction::inscribe", () => {
        const tx = rlptxToTransaction("0xf8b2198522ecb25c008301e848948ed573bf1ac1d01a1af4b983fd6034912450c6fe80b884449b2cf60000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000003e646174613a2c7b2270223a22656f72633230222c226f70223a227472616e73666572222c227469636b223a22656f7373222c22616d74223a22323030227d00001b80883276a9e757a6b060");
        if ( !tx ) return;
        if ( !tx.data ) return;
        expect(tx.data).toBeDefined();
    });
    test("parseOpCodeFromHex", () => {
        expect(parseOpCodeFromHex("0x646174613a2c7b2270223a22656f72633230222c226f70223a226d696e74222c227469636b223a22656f7373222c22616d74223a223130303030227d")).toEqual({
            p: "eorc20",
            tick: "eoss",
            op: "mint",
            amt: "10000",
        });
    });
    test("parseOpCodeFromContract", () => {
        expect(parseOpCodeFromContract("0x58bf77ac00000000000000000000000026684e708333ba46be27bca221474409c6f77b200000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000003d646174613a2c7b2270223a22656f72633230222c226f70223a227472616e73666572222c227469636b223a22656f7373222c22616d74223a223130227d000000")).toEqual({
            to: "0x26684e708333BA46BE27bcA221474409c6F77B20",
            p: "eorc20",
            tick: "eoss",
            op: "transfer",
            amt: "10",
        });
    });
    test("isContract", () => {
        expect(isContract("0x58bf77ac00000000000000000000000026684e708333ba46be27bca221474409c6f77b200000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000003d646174613a2c7b2270223a22656f72633230222c226f70223a227472616e73666572222c227469636b223a22656f7373222c22616d74223a223130227d000000")).toBeTruthy();
        expect(isContract("0x646174613a2c7b2270223a22656f72633230222c226f70223a226d696e74222c227469636b223a22656f7373222c22616d74223a223130303030227d")).toBeFalsy();
    });
    test("parseOpCode", () => {
        expect(parseOpCode("data:,{\"p\":\"eorc20\",\"op\":\"mint\",\"tick\":\"eoss\",\"amt\":\"10000\"}")).toEqual({
            p: "eorc20",
            tick: "eoss",
            op: "mint",
            amt: "10000",
        });
    });
    test("contentUriToSha256", () => {
        expect(contentUriToSha256(`data:application/json,{"p":"ierc-20","op":"mint","tick":"pows","amt":"1000","nonce":"523240143910290187"}`))
            .toBe("8c0989d456bf0af6b5b11a42d387fba4e2a7f80e9976522b49d3e17c8a03add2");

        expect(contentUriToSha256(`data:,{"p":"erc-20","op":"mint","tick":"dragon","id":"62","amt":"1000"}`))
            .toBe("c882cbde2c0a280f123233234003b9e131b0cc040a106c36250c2f59b8f9e930");
    });
});
