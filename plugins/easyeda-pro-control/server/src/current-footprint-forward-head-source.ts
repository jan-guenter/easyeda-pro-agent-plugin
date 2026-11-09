/** Exact original open-project continuation and SQL wrapper source pins.
 * Source qualification supplies no frame, connection or native callback. */
import { createHash } from "node:crypto";
import { qualifyCurrentFootprintCopyMainBackendSource } from "./current-footprint-copy-main-backend-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_FORWARD_HEAD_SOURCE = freezeDeep({
  "openProject": {
    "name": "openProject",
    "start": 2_332_540,
    "end": 2_333_277,
    "bytes": 737,
    "sha256": "9074b087f50749744f315ed1008ae23f22ab4812a774142a242095fefb0fc778",
    "lineNumber": 8549,
    "columnNumber": 106_834
  },
  "projectShow": {
    "name": "show",
    "start": 2_317_612,
    "end": 2_318_997,
    "bytes": 1385,
    "sha256": "8002a5933781102a9315c2ded072ebb883b9711cdceaa64ede8011412afcad3e",
    "lineNumber": 8549,
    "columnNumber": 91_899
  },
  "queryOne": {
    "name": "queryOne",
    "start": 1_299_421,
    "end": 1_299_554,
    "bytes": 133,
    "sha256": "6ab6ab67b089efcb007b6581f216d5ac292156c4f84bf40713b71d0951ca83eb",
    "lineNumber": 1025,
    "columnNumber": 607
  }
} as const);
export const CURRENT_FOOTPRINT_FORWARD_HEAD_OPEN_POINT = Object.freeze({ offset: 2_332_705, lineNumber: 8549, columnNumber: 106_982 });
/** Verify every complete function and the exact continuation after original
 * y(ctx,path) fulfillment, before G.show invokes its own original reads. */
export function qualifyCurrentFootprintForwardHeadSource(input: unknown): string {
  qualifyCurrentFootprintCopyMainBackendSource(input);
  if (typeof input !== "string") { throw new TypeError("FORWARD_HEAD_SOURCE"); }
  for (const row of Object.values(CURRENT_FOOTPRINT_FORWARD_HEAD_SOURCE)) {
    const text = input.slice(row.start, row.end);
    if (Buffer.byteLength(text) !== row.bytes || createHash("sha256").update(text).digest("hex") !== row.sha256) { throw new Error("FORWARD_HEAD_SOURCE_METHOD"); }
  }
  const point = CURRENT_FOOTPRINT_FORWARD_HEAD_OPEN_POINT;
  const offset = input.split("\n").slice(0, point.lineNumber).reduce((sum, line) => sum + line.length + 1, 0) + point.columnNumber;
  if (offset !== point.offset || input.slice(point.offset, point.offset + 5) !== "K0(e)") { throw new Error("FORWARD_HEAD_SOURCE_LOCATION"); }
  return input;
}
