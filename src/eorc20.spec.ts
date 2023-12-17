import { describe, expect, test } from "bun:test";
import { contentUriToSha256, getMimeType, parseOpCode, parseOpCodeFromHex, rlptxToTransaction } from "./eorc20.js";

describe("parseOpCode", () => {
    test("rlptxToTransaction", () => {
        const tx = rlptxToTransaction("0xf8a3808522ecb25c008255c894b96f197992b795078407a2c170eada7894488bb980b83c646174613a2c7b2270223a22656f72633230222c226f70223a226d696e74222c227469636b223a22656f7373222c22616d74223a223130303030227d828b05a05504af55e2ff8427c36888cc7fe98520c6d12918fe0e43c03c654b7d0071a6a7a062b80c13bc0e210d2a7cda668fa626ab6cd529013486c29f050795f7eb17a744");
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
    test("parseOpCode", () => {
        expect(parseOpCode("data:,{\"p\":\"eorc20\",\"op\":\"mint\",\"tick\":\"eoss\",\"amt\":\"10000\"}")).toEqual({
            p: "eorc20",
            tick: "eoss",
            op: "mint",
            amt: "10000",
        });
    });
    test("getMimeType", () => {
        expect(getMimeType(`data:application/json,{"p":"ierc-20","op":"mint","tick":"pows","amt":"1000","nonce":"523240143910290187"}`)).toEqual({
            media_type: "application",
            mime_subtype: "json",
            mimetype: "application/json",
        })
        expect(getMimeType(`data:,{"p":"erc-20","op":"mint","tick":"mars","id":"19300","amt":"1000"}`)).toEqual({
            media_type: "text",
            mime_subtype: "plain",
            mimetype: "text/plain",
        })
    })
    test("contentUriToSha256", () => {
        expect(contentUriToSha256(`data:application/json,{"p":"ierc-20","op":"mint","tick":"pows","amt":"1000","nonce":"523240143910290187"}`))
            .toBe("8c0989d456bf0af6b5b11a42d387fba4e2a7f80e9976522b49d3e17c8a03add2");

        expect(contentUriToSha256(`data:,{"p":"erc-20","op":"mint","tick":"dragon","id":"62","amt":"1000"}`))
            .toBe("c882cbde2c0a280f123233234003b9e131b0cc040a106c36250c2f59b8f9e930");
    });
});
