/** Exact base/waveform/page document getters. Source equality permits neither
 * getter execution nor original document ownership. Offsets use UTF16. */
import { createHash } from "node:crypto";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_DOCUMENT_TAB_ID_SOURCE = freezeDeep([
  {
    "variant": 0,
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch-main.js",
    "bytes": 6_289_622,
    "sha256": "e7fdbc30cadd14fb87c5a50d2c5563241b4cf373d6eea8f7d0c9e7e59588d72c",
    "roles": {
      "base": {
        "start": 4_461_473,
        "end": 4_461_504,
        "name": "get tabId",
        "kind": "getter",
        "arity": 0,
        "bytes": 31,
        "sha256": "5faecd38425bb08493c0e469139e7317fe82308bab886d69e0f5679989bd231b",
        "lineNumber": 3614,
        "columnNumber": 26_354
      },
      "waveform": {
        "start": 4_472_232,
        "end": 4_472_263,
        "name": "get tabId",
        "kind": "getter",
        "arity": 0,
        "bytes": 31,
        "sha256": "24874f0b7d637254283b26f23edb9f3269b28da4b6a7ffb81b3b88d8d7c49de0",
        "lineNumber": 3614,
        "columnNumber": 37_113
      },
      "schematicPage": {
        "start": 5_372_258,
        "end": 5_372_289,
        "name": "get tabId",
        "kind": "getter",
        "arity": 0,
        "bytes": 31,
        "sha256": "24874f0b7d637254283b26f23edb9f3269b28da4b6a7ffb81b3b88d8d7c49de0",
        "lineNumber": 3673,
        "columnNumber": 60_090
      }
    }
  },
  {
    "variant": 1,
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch.js",
    "bytes": 6_472_538,
    "sha256": "b88ad265bb2bc7febb90af92a6f37189b3f90be7cd1f1427522c8f2435dfb4bd",
    "roles": {
      "base": {
        "start": 4_684_242,
        "end": 4_684_273,
        "name": "get tabId",
        "kind": "getter",
        "arity": 0,
        "bytes": 31,
        "sha256": "5faecd38425bb08493c0e469139e7317fe82308bab886d69e0f5679989bd231b",
        "lineNumber": 4113,
        "columnNumber": 26_354
      },
      "waveform": {
        "start": 4_695_001,
        "end": 4_695_032,
        "name": "get tabId",
        "kind": "getter",
        "arity": 0,
        "bytes": 31,
        "sha256": "24874f0b7d637254283b26f23edb9f3269b28da4b6a7ffb81b3b88d8d7c49de0",
        "lineNumber": 4113,
        "columnNumber": 37_113
      },
      "schematicPage": {
        "start": 5_671_264,
        "end": 5_671_295,
        "name": "get tabId",
        "kind": "getter",
        "arity": 0,
        "bytes": 31,
        "sha256": "24874f0b7d637254283b26f23edb9f3269b28da4b6a7ffb81b3b88d8d7c49de0",
        "lineNumber": 4191,
        "columnNumber": 65_190
      }
    }
  }
] as const);
export type CurrentSchematicDocumentTabIdRole = keyof typeof CURRENT_SCHEMATIC_DOCUMENT_TAB_ID_SOURCE[0]["roles"];
export const CURRENT_SCHEMATIC_DOCUMENT_TAB_ID_ROLES = Object.freeze(["base", "waveform", "schematicPage"] as const);
const digest = (value: string): string => createHash("sha256").update(value).digest("hex");
export function qualifyCurrentSchematicDocumentTabIdSource(input: string): 0 | 1 {
  if (!input.isWellFormed()) { throw new Error("SCHEMATIC_DOCUMENT_TAB_ID_SOURCE"); }
  for (const variant of [0, 1] as const) {
    const profile = CURRENT_SCHEMATIC_DOCUMENT_TAB_ID_SOURCE[variant];
    if (Buffer.byteLength(input) === profile.bytes && digest(input) === profile.sha256) {
      for (const role of CURRENT_SCHEMATIC_DOCUMENT_TAB_ID_ROLES) {
        const getter = profile.roles[role], text = input.slice(getter.start, getter.end);
        if (Buffer.byteLength(text) !== getter.bytes || digest(text) !== getter.sha256) { throw new Error("SCHEMATIC_DOCUMENT_TAB_ID_SPAN"); }
      }
      return variant;
    }
  }
  throw new Error("SCHEMATIC_DOCUMENT_TAB_ID_SOURCE");
}
