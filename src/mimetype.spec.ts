import { expect, test } from "bun:test";
import { getMimeType } from "./mimetype.js";

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
