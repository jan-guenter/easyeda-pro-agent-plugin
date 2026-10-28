/** Exact installed worker fragments for the unmounted delete comparison. */
import { createHash } from "node:crypto";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_DELETE_SOURCE = freezeDeep({
  "header": {
    "start": 241_441,
    "end": 241_789,
    "location": {
      "line": 5,
      "column": 2029
    },
    "bytes": 348,
    "sha256": "4e874784918bc25aa28ec509f0e43b40a4351626f30bef7c4ecb0a03467ce18b"
  },
  "atom": {
    "start": 241_789,
    "end": 242_093,
    "location": {
      "line": 5,
      "column": 2377
    },
    "bytes": 304,
    "sha256": "83b95d8c688391dddfe09f382b38c95bc47a737565b43cb3229637337faae113"
  },
  "deleteEncoder": {
    "start": 620_185,
    "end": 620_277,
    "location": {
      "line": 20,
      "column": 252_164
    },
    "bytes": 92,
    "sha256": "b9116a69d9fdca0e199d83e45d50836435b4f9151f7b18c5320a697a445fc3e6"
  },
  "deleteString": {
    "start": 1_887_335,
    "end": 1_887_596,
    "location": {
      "line": 110,
      "column": 40_022
    },
    "bytes": 261,
    "sha256": "de16b89e4f1379991902feaf25f2b1e0415c6a2580f4114ef5541e0fcd983402"
  },
  "deleteData": {
    "start": 1_887_596,
    "end": 1_887_808,
    "location": {
      "line": 110,
      "column": 40_283
    },
    "bytes": 212,
    "sha256": "9a0d4e8fcf43da7c33bcd62ba4611fc324f78f2a843a4e32965f06406e53c5ba"
  },
  "headMethod": {
    "start": 619_874,
    "end": 619_982,
    "location": {
      "line": 20,
      "column": 251_853
    },
    "bytes": 108,
    "sha256": "06de53645d654cb726c07dea0df4e33d5a1047cc5602fe26fc5b8d4bad968c08"
  }
} as const);
export type CurrentFootprintDeleteSourceRole = keyof typeof CURRENT_FOOTPRINT_DELETE_SOURCE;
export const CURRENT_FOOTPRINT_DELETE_WORKER = Object.freeze({ bytes: 2_181_308,
  sha256: "0e7a474385029ac4f69dac08abdfd8beec7346aea8c2a4f71d5afb78bb454046" });
const issued = new WeakSet<object>();
export function assertCurrentFootprintDeleteSource(role: CurrentFootprintDeleteSourceRole, value: unknown): void {
  if (!Object.hasOwn(CURRENT_FOOTPRINT_DELETE_SOURCE, role)) { throw new Error("FOOTPRINT_DELETE_SOURCE"); }
  const expected = CURRENT_FOOTPRINT_DELETE_SOURCE[role];
  if (typeof value !== "string" || !value.isWellFormed() || Buffer.byteLength(value) !== expected.bytes ||
      createHash("sha256").update(value).digest("hex") !== expected.sha256) { throw new Error("FOOTPRINT_DELETE_SOURCE"); }
}
/** Full source qualification is not a native receiver, completed callback or
 * inverse authorization. Existing runtime/owner gates remain separate. */
export function qualifyCurrentFootprintDeleteSource(value: unknown): Readonly<{ sourceQualified: true; executionAuthorized: false }> {
  const expected = CURRENT_FOOTPRINT_DELETE_WORKER;
  if (typeof value !== "string" || !value.isWellFormed() || Buffer.byteLength(value) !== expected.bytes ||
      createHash("sha256").update(value).digest("hex") !== expected.sha256) { throw new Error("FOOTPRINT_DELETE_SOURCE"); }
  for (const role of Object.keys(CURRENT_FOOTPRINT_DELETE_SOURCE)) {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Own keys of this fixed, deeply frozen profile are the declared role union.
    const selected = role as CurrentFootprintDeleteSourceRole;
    const span = CURRENT_FOOTPRINT_DELETE_SOURCE[selected]; assertCurrentFootprintDeleteSource(selected, value.slice(span.start, span.end));
  }
  const packet = Object.freeze({ sourceQualified: true as const, executionAuthorized: false as const }); issued.add(packet); return packet;
}
export function requireCurrentFootprintDeleteSource(value: unknown): void {
  if (value === null || typeof value !== "object" || !issued.has(value)) { throw new Error("FOOTPRINT_DELETE_SOURCE"); }
}
