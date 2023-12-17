import { Clock } from "@substreams/core/proto";
import fs from "fs";
import { CURSOR_PATH } from "./config.js";

export function clockToDay(clock: Clock) {
    if ( !clock.timestamp ) throw new Error("No timestamp in clock");
    const day = Math.floor(Number(clock.timestamp.seconds) / 86400) * 86400 * 1000;
    return new Date(day).toISOString();
}

export function readCursor() {
    if ( fs.existsSync(CURSOR_PATH) ) {
        return fs.readFileSync(CURSOR_PATH, "utf8");
    }
    return undefined;
}

export function saveCursor(cursor: string) {
    fs.writeFileSync(CURSOR_PATH, cursor);
}
