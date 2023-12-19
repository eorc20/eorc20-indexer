import { expect, test } from "bun:test";
import { getMimeType } from "./mimetype.js";

test("getMimeType", () => {
    expect(getMimeType(`data:application/json,{"p":"ierc-20","op":"mint","tick":"pows","amt":"1000","nonce":"523240143910290187"}`)).toEqual({
        media_type: "application",
        mime_subtype: "json",
        mimetype: "application/json",
    })
    expect(getMimeType(`data:,{"p":"erc-20","op":"mint","tick":"mars","id":"19300","amt":"1000"}`)).toEqual({
        mimetype: "text/plain",
        media_type: "text",
        mime_subtype: "plain",
    })
    expect(getMimeType(`data:application/json,{"p":"ierc-20","op":"mint","tick":"pows","amt":"1000","nonce":"523240143910290187"}`)).toEqual({
        mimetype: "application/json",
        media_type: "application",
        mime_subtype: "json",
    })

    expect(getMimeType(`data:text/plain;charset=utf-8,{"p":"tap","op":"token-transfer","tick":"gib","amt":"100000"}`)).toEqual({
        mimetype: "text/plain",
        media_type: "text",
        mime_subtype: "plain",
    })
})
