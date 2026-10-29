/** Exact descriptions and function locations of the nine dormant trigger
 * dependencies in its captured array order. This qualifies source, not objects. */
import { createHash } from "node:crypto";
import { qualifyCurrentFootprintDeleteSource } from "./current-footprint-delete-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_DELETE_TRIGGER_METHODS = freezeDeep([
  { name: "deleteData", arity: 1, async: true, lineNumber: 109, columnNumber: 40_299,
    start: 1_887_596, end: 1_887_808, bytes: 212, sha256: "9a0d4e8fcf43da7c33bcd62ba4611fc324f78f2a843a4e32965f06406e53c5ba" },
  { name: "deleteString", arity: 1, async: true, lineNumber: 109, columnNumber: 40_040,
    start: 1_887_335, end: 1_887_596, bytes: 261, sha256: "de16b89e4f1379991902feaf25f2b1e0415c6a2580f4114ef5541e0fcd983402" },
  { name: "verifyKey", arity: 1, async: false, lineNumber: 109, columnNumber: 32_452,
    start: 1_879_756, end: 1_879_786, bytes: 30, sha256: "0d9bc9172a72f79c91c09a603ea7f5b201ffead08d53f858505879a72c9cb2e0" },
  { name: "isHas", arity: 1, async: false, lineNumber: 109, columnNumber: 9601,
    start: 1_856_909, end: 1_856_962, bytes: 53, sha256: "b8c0a9db07afe6dc3483f54369423f8054bf15c95541ec23d058e75eaca1d5db" },
  { name: "getMaxTicket", arity: 0, async: false, lineNumber: 4, columnNumber: 3316,
    start: 242_716, end: 242_753, bytes: 37, sha256: "60c8a23917d7db26fd8f02dd4ebd730ac547a2f52221b0a42fb472a5d830a93c" },
  { name: "setMaxTicket", arity: 2, async: false, lineNumber: 4, columnNumber: 3353,
    start: 242_753, end: 242_816, bytes: 63, sha256: "476a9095e2662fef0b2d1eb4c6ff993f454bb982f9c5484a5662db7d8b60e4de" },
  { name: "uploadLocal", arity: 1, async: true, lineNumber: 110, columnNumber: 17_009,
    start: 2_031_202, end: 2_031_622, bytes: 420, sha256: "5add70c985bd271d5683fc48abd3d69ed0627cb54a9638acc73a164e583b5ea4" },
  { name: "get maxTicket", arity: 0, async: false, lineNumber: 109, columnNumber: 9133,
    start: 1_856_433, end: 1_856_510, bytes: 77, sha256: "b2d7068621557b1b72c1a4332fcde13ccff1858349cc199d6894935f5c7fb106" },
  { name: "get newTicket", arity: 0, async: false, lineNumber: 109, columnNumber: 9210,
    start: 1_856_510, end: 1_856_613, bytes: 103, sha256: "b2e4944fdd2d9d7ceaaba8b9b3ff803e12fd8f86eb782a987057ba2ea4c924df" },
] as const);

/** The actual entry producer creates an own uuid before folding META or
 * DELETE_DOC. The manager getter later returns that value, not a synthesized ID. */
export const CURRENT_FOOTPRINT_DELETE_TRIGGER_ENTRY_PRODUCER = Object.freeze({
  start: 1_878_825, end: 1_879_756, bytes: 931, sha256: "a6d8254ca882842724fc5ab8d35ddc8d90b6088d74828f23465cb26a9e842356",
});

export interface CurrentFootprintDeleteTriggerSource {
  readonly profile: "private.current-footprint-delete-trigger-source.v1";
  readonly methodCount: 9;
  readonly sourceQualified: true;
  readonly nativeObjectsQualified: false;
  readonly executionAuthorized: false;
}
const sources = new WeakSet<CurrentFootprintDeleteTriggerSource>();
export function qualifyCurrentFootprintDeleteTriggerSource(input: unknown): CurrentFootprintDeleteTriggerSource {
  qualifyCurrentFootprintDeleteSource(input);
  if (typeof input !== "string") { throw new TypeError("FOOTPRINT_DELETE_TRIGGER_SOURCE"); }
  for (const expected of [...CURRENT_FOOTPRINT_DELETE_TRIGGER_METHODS, CURRENT_FOOTPRINT_DELETE_TRIGGER_ENTRY_PRODUCER]) {
    const text = input.slice(expected.start, expected.end);
    if (Buffer.byteLength(text) !== expected.bytes || createHash("sha256").update(text).digest("hex") !== expected.sha256) {
      throw new Error("FOOTPRINT_DELETE_TRIGGER_SOURCE");
    }
  }
  const packet: CurrentFootprintDeleteTriggerSource = Object.freeze({ profile: "private.current-footprint-delete-trigger-source.v1", methodCount: 9,
    sourceQualified: true, nativeObjectsQualified: false, executionAuthorized: false });
  sources.add(packet); return packet;
}
export function requireCurrentFootprintDeleteTriggerSource(packet: CurrentFootprintDeleteTriggerSource): void {
  if (!sources.has(packet)) { throw new Error("FOOTPRINT_DELETE_TRIGGER_SOURCE"); }
}
