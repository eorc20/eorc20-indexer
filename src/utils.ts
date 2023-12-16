import { Clock } from "@substreams/core/proto";
import fs from "fs";

export function clockToDay(clock: Clock) {
    if ( !clock.timestamp ) throw new Error("No timestamp in clock");
    const day = Math.floor(Number(clock.timestamp.seconds) / 86400) * 86400 * 1000;
    return new Date(day).toISOString();
}

export function readCursor() {
    if ( fs.existsSync("data/cursor.lock") ) {
        return fs.readFileSync("data/cursor.lock", "utf8");
    }
    return undefined;
}

export function saveCursor(cursor: string) {
    fs.writeFileSync("data/cursor.lock", cursor);
}
