/** Exact uninvoked callbacks from normal run completion. These source facts
 * neither bind their lexical receivers nor permit delivery or continuation. */
import { createHash } from "node:crypto";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_NORMAL_RETURN_SOURCE = freezeDeep([
  {
    "variant": 0,
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch-main.js",
    "bytes": 6_289_622,
    "sha256": "e7fdbc30cadd14fb87c5a50d2c5563241b4cf373d6eea8f7d0c9e7e59588d72c",
    "roles": {
      "actionEnd": {
        "name": "end",
        "arity": 0,
        "kind": "method",
        "start": 822_543,
        "end": 822_572,
        "bytes": 29,
        "sha256": "38c1bbba46484de2e3d1d528cb1f0f22c0db2fe04ded9da90f9e0168169547df",
        "lineNumber": 30,
        "columnNumber": 66_312
      },
      "runSuccess": {
        "name": "success",
        "arity": 1,
        "kind": "method",
        "start": 824_774,
        "end": 824_799,
        "bytes": 25,
        "sha256": "cc739743f82ca72d4ad8f350104ee59c105dc145d0d6a295843e73216e8b6431",
        "lineNumber": 30,
        "columnNumber": 68_547
      },
      "asyncFulfilled": {
        "name": "",
        "arity": 1,
        "kind": "arrow",
        "start": 305_390,
        "end": 305_401,
        "bytes": 11,
        "sha256": "bb3cb7e4123595d1e2f6fb6d3bcad275234d0b134b4874712bf1834ab42e5044",
        "lineNumber": 6,
        "columnNumber": 7352
      },
      "finishAction": {
        "name": "s",
        "arity": 1,
        "kind": "arrow",
        "start": 821_732,
        "end": 822_244,
        "bytes": 512,
        "sha256": "1bd9462c3130f28361a0a5282545067f8274ebfc405d7852d9494f404357a2ea",
        "lineNumber": 30,
        "columnNumber": 65_498
      }
    }
  },
  {
    "variant": 1,
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch.js",
    "bytes": 6_472_538,
    "sha256": "b88ad265bb2bc7febb90af92a6f37189b3f90be7cd1f1427522c8f2435dfb4bd",
    "roles": {
      "actionEnd": {
        "name": "end",
        "arity": 0,
        "kind": "method",
        "start": 1_845_955,
        "end": 1_845_984,
        "bytes": 29,
        "sha256": "38c1bbba46484de2e3d1d528cb1f0f22c0db2fe04ded9da90f9e0168169547df",
        "lineNumber": 556,
        "columnNumber": 66_312
      },
      "runSuccess": {
        "name": "success",
        "arity": 1,
        "kind": "method",
        "start": 1_848_186,
        "end": 1_848_211,
        "bytes": 25,
        "sha256": "cc739743f82ca72d4ad8f350104ee59c105dc145d0d6a295843e73216e8b6431",
        "lineNumber": 556,
        "columnNumber": 68_547
      },
      "asyncFulfilled": {
        "name": "",
        "arity": 1,
        "kind": "arrow",
        "start": 1_328_802,
        "end": 1_328_813,
        "bytes": 11,
        "sha256": "bb3cb7e4123595d1e2f6fb6d3bcad275234d0b134b4874712bf1834ab42e5044",
        "lineNumber": 532,
        "columnNumber": 7352
      },
      "finishAction": {
        "name": "s",
        "arity": 1,
        "kind": "arrow",
        "start": 1_845_144,
        "end": 1_845_656,
        "bytes": 512,
        "sha256": "1bd9462c3130f28361a0a5282545067f8274ebfc405d7852d9494f404357a2ea",
        "lineNumber": 556,
        "columnNumber": 65_498
      }
    }
  }
] as const);
export type CurrentSchematicRelevanceNormalReturnRole = keyof typeof CURRENT_SCHEMATIC_RELEVANCE_NORMAL_RETURN_SOURCE[0]["roles"];
export const CURRENT_SCHEMATIC_RELEVANCE_NORMAL_RETURN_ROLES = Object.freeze(["actionEnd", "runSuccess", "asyncFulfilled", "finishAction"] as const);
const digest = (value: string): string => createHash("sha256").update(value).digest("hex");
export function qualifyCurrentSchematicRelevanceNormalReturnSource(input: string): 0 | 1 {
 if (!input.isWellFormed()) { throw new Error("SCHEMATIC_RELEVANCE_NORMAL_RETURN_SOURCE"); }
 for (const variant of [0, 1] as const) {
  const profile = CURRENT_SCHEMATIC_RELEVANCE_NORMAL_RETURN_SOURCE[variant];
  if (Buffer.byteLength(input) === profile.bytes && digest(input) === profile.sha256) {
   for (const role of CURRENT_SCHEMATIC_RELEVANCE_NORMAL_RETURN_ROLES) {
    const row = profile.roles[role], text = input.slice(row.start, row.end);
    if (Buffer.byteLength(text) !== row.bytes || digest(text) !== row.sha256) { throw new Error("SCHEMATIC_RELEVANCE_NORMAL_RETURN_SPAN"); }
   }
   return variant;
  }
 }
 throw new Error("SCHEMATIC_RELEVANCE_NORMAL_RETURN_SOURCE");
}
