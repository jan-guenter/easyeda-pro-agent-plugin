/** Own seven-record history command metadata. The legacy action decoder's
 * implicit-class refusal remains unchanged. No command is constructed here. */
import { createHash } from "node:crypto";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_HISTORY_CALLEE_SOURCE = freezeDeep([
  {
    "variant": 0,
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch-main.js",
    "bytes": 6_289_622,
    "sha256": "e7fdbc30cadd14fb87c5a50d2c5563241b4cf373d6eea8f7d0c9e7e59588d72c",
    "roles": {
      "commandConstructor": {
        "name": "Tk",
        "arity": 0,
        "kind": "class",
        "start": 1_804_362,
        "end": 1_805_271,
        "bytes": 909,
        "sha256": "8f902a957453b232506e7e3eb8ef435fc4bfb780d36dae36a17c38fc3b1ef974",
        "lineNumber": 59,
        "columnNumber": 87_819
      },
      "commandBaseConstructor": {
        "name": "pf",
        "arity": 1,
        "kind": "class",
        "start": 1_803_249,
        "end": 1_804_358,
        "bytes": 1109,
        "sha256": "d6daf449f473b617aebd31484d22227ef854df8fe8c15ccc8495cdb12eadf5ba",
        "lineNumber": 59,
        "columnNumber": 86_723
      },
      "commandAttribute": {
        "name": "onAttrChange",
        "arity": 3,
        "kind": "method",
        "start": 1_804_725,
        "end": 1_805_015,
        "bytes": 290,
        "sha256": "eff9de540dcd898efc1098f93dc2297fa9774d5dbe0a672c5370398efb308a4c",
        "lineNumber": 59,
        "columnNumber": 88_194
      },
      "commandUpdate": {
        "name": "update",
        "arity": 0,
        "kind": "method",
        "start": 1_805_015,
        "end": 1_805_270,
        "bytes": 255,
        "sha256": "deab84f8b40ecfcad1b14f6b52aee1b39f66bb7b961c899e1fd491b466c96908",
        "lineNumber": 59,
        "columnNumber": 88_478
      }
    }
  },
  {
    "variant": 1,
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch.js",
    "bytes": 6_472_538,
    "sha256": "b88ad265bb2bc7febb90af92a6f37189b3f90be7cd1f1427522c8f2435dfb4bd",
    "roles": {
      "commandConstructor": {
        "name": "y8",
        "arity": 0,
        "kind": "class",
        "start": 6_279_221,
        "end": 6_280_130,
        "bytes": 909,
        "sha256": "14905e9361b991c83511fd529615f73f0cf8c826a5849a8a8ede69b9bac117db",
        "lineNumber": 4331,
        "columnNumber": 75_003
      },
      "commandBaseConstructor": {
        "name": "Pf",
        "arity": 1,
        "kind": "class",
        "start": 6_278_108,
        "end": 6_279_217,
        "bytes": 1109,
        "sha256": "1242b1333bd5d2da97dcedf496b082509740631adb01bcbcbb14f81938ec753d",
        "lineNumber": 4331,
        "columnNumber": 73_907
      },
      "commandAttribute": {
        "name": "onAttrChange",
        "arity": 3,
        "kind": "method",
        "start": 6_279_584,
        "end": 6_279_874,
        "bytes": 290,
        "sha256": "13d021b0bca6aff96df0859124991fecd0616ab4e3f5e905c3fc63006523eab3",
        "lineNumber": 4331,
        "columnNumber": 75_378
      },
      "commandUpdate": {
        "name": "update",
        "arity": 0,
        "kind": "method",
        "start": 6_279_874,
        "end": 6_280_129,
        "bytes": 255,
        "sha256": "deab84f8b40ecfcad1b14f6b52aee1b39f66bb7b961c899e1fd491b466c96908",
        "lineNumber": 4331,
        "columnNumber": 75_662
      }
    }
  }
] as const);
export type CurrentSchematicRelevanceHistoryCalleeRole = keyof typeof CURRENT_SCHEMATIC_RELEVANCE_HISTORY_CALLEE_SOURCE[0]["roles"];
export const CURRENT_SCHEMATIC_RELEVANCE_HISTORY_CALLEE_ROLES = Object.freeze(["commandConstructor", "commandBaseConstructor", "commandAttribute", "commandUpdate"] as const);
const digest = (value: string): string => createHash("sha256").update(value).digest("hex");
export function qualifyCurrentSchematicRelevanceHistoryCalleeSource(input: string): 0 | 1 {
  if (!input.isWellFormed()) { throw new Error("SCHEMATIC_RELEVANCE_HISTORY_CALLEE_SOURCE"); }
  for (const variant of [0, 1] as const) {
    const profile = CURRENT_SCHEMATIC_RELEVANCE_HISTORY_CALLEE_SOURCE[variant];
    if (Buffer.byteLength(input) === profile.bytes && digest(input) === profile.sha256) {
      for (const role of CURRENT_SCHEMATIC_RELEVANCE_HISTORY_CALLEE_ROLES) {
        const method = profile.roles[role], text = input.slice(method.start, method.end);
        if (Buffer.byteLength(text) !== method.bytes || digest(text) !== method.sha256) { throw new Error("SCHEMATIC_RELEVANCE_HISTORY_CALLEE_SPAN"); }
      }
      return variant;
    }
  }
  throw new Error("SCHEMATIC_RELEVANCE_HISTORY_CALLEE_SOURCE");
}
