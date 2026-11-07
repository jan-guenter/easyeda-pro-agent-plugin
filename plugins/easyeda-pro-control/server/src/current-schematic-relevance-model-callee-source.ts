/** Exact source and V8 function metadata for the Text getter and active monitor
 * callbacks. This data cannot establish an original model or receiver. */
import { createHash } from "node:crypto";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_MODEL_CALLEE_SOURCE = freezeDeep([
  {
    "variant": 0,
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch-main.js",
    "bytes": 6_289_622,
    "sha256": "e7fdbc30cadd14fb87c5a50d2c5563241b4cf373d6eea8f7d0c9e7e59588d72c",
    "roles": {
      "parentGet": {
        "name": "get parent",
        "arity": 0,
        "kind": "getter",
        "start": 1_732_764,
        "end": 1_732_797,
        "bytes": 33,
        "sha256": "86021a24c76d9ee4c0d4dc7dd9c6f5289e60c29dab20b0ddefd0762987b40536",
        "lineNumber": 59,
        "columnNumber": 16_231
      },
      "tagNameGet": {
        "name": "get tagName",
        "arity": 0,
        "kind": "getter",
        "start": 4_126_461,
        "end": 4_126_488,
        "bytes": 27,
        "sha256": "aa92a9af35437c1fe8cb7829bfc95105ccb5fc34fddb64e1d4d1a3b8e619ac7e",
        "lineNumber": 3606,
        "columnNumber": 459_588
      },
      "positionAttrsGet": {
        "name": "get positionAttrs",
        "arity": 0,
        "kind": "getter",
        "start": 3_492_719,
        "end": 3_492_750,
        "bytes": 31,
        "sha256": "3cf125f0f6a6c6ca2bbf9d6ce88d2517395dfb17c75fe8cbba3d5bc4b67b7f80",
        "lineNumber": 3597,
        "columnNumber": 7688
      },
      "modifyAttributeChange": {
        "name": "",
        "arity": 1,
        "kind": "arrow",
        "start": 1_696_644,
        "end": 1_696_804,
        "bytes": 160,
        "sha256": "86d78fde9fbbdf22f8a1412af6292c8808473633e8fb55c25e9567b2cc51239b",
        "lineNumber": 58,
        "columnNumber": 58_015
      },
      "bboxAttributeChange": {
        "name": "",
        "arity": 1,
        "kind": "arrow",
        "start": 3_962_267,
        "end": 3_962_346,
        "bytes": 79,
        "sha256": "fffdee5cd13bdf9b8421f6e16b889582eaba454ee91564e7c8fdefa6dbe213e8",
        "lineNumber": 3606,
        "columnNumber": 295_383
      },
      "watchAttributeChange": {
        "name": "",
        "arity": 1,
        "kind": "arrow",
        "start": 3_957_807,
        "end": 3_958_057,
        "bytes": 250,
        "sha256": "91d59e8fae0d047215d20fc7c53fc36a96a0817412538505d4a1008f75b95212",
        "lineNumber": 3606,
        "columnNumber": 290_923
      }
    }
  },
  {
    "variant": 1,
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch.js",
    "bytes": 6_472_538,
    "sha256": "b88ad265bb2bc7febb90af92a6f37189b3f90be7cd1f1427522c8f2435dfb4bd",
    "roles": {
      "parentGet": {
        "name": "get parent",
        "arity": 0,
        "kind": "getter",
        "start": 1_929_318,
        "end": 1_929_351,
        "bytes": 33,
        "sha256": "86021a24c76d9ee4c0d4dc7dd9c6f5289e60c29dab20b0ddefd0762987b40536",
        "lineNumber": 557,
        "columnNumber": 16_231
      },
      "tagNameGet": {
        "name": "get tagName",
        "arity": 0,
        "kind": "getter",
        "start": 4_331_633,
        "end": 4_331_660,
        "bytes": 27,
        "sha256": "aa92a9af35437c1fe8cb7829bfc95105ccb5fc34fddb64e1d4d1a3b8e619ac7e",
        "lineNumber": 4105,
        "columnNumber": 323_027
      },
      "positionAttrsGet": {
        "name": "get positionAttrs",
        "arity": 0,
        "kind": "getter",
        "start": 3_872_834,
        "end": 3_872_865,
        "bytes": 31,
        "sha256": "b39bc8576b1a3a876aaa063bfd40b9dd8ebbde603d819bcfa75320d71176a6aa",
        "lineNumber": 4096,
        "columnNumber": 4624
      },
      "modifyAttributeChange": {
        "name": "",
        "arity": 1,
        "kind": "arrow",
        "start": 1_893_198,
        "end": 1_893_358,
        "bytes": 160,
        "sha256": "86d78fde9fbbdf22f8a1412af6292c8808473633e8fb55c25e9567b2cc51239b",
        "lineNumber": 556,
        "columnNumber": 113_552
      },
      "bboxAttributeChange": {
        "name": "",
        "arity": 1,
        "kind": "arrow",
        "start": 4_169_468,
        "end": 4_169_547,
        "bytes": 79,
        "sha256": "c70c069625072326c85dbd744de7948409930929c4738cd974570861cd13c1b0",
        "lineNumber": 4105,
        "columnNumber": 160_851
      },
      "watchAttributeChange": {
        "name": "",
        "arity": 1,
        "kind": "arrow",
        "start": 4_165_008,
        "end": 4_165_258,
        "bytes": 250,
        "sha256": "91d59e8fae0d047215d20fc7c53fc36a96a0817412538505d4a1008f75b95212",
        "lineNumber": 4105,
        "columnNumber": 156_391
      }
    }
  }
] as const);
export type CurrentSchematicRelevanceModelCalleeRole = keyof typeof CURRENT_SCHEMATIC_RELEVANCE_MODEL_CALLEE_SOURCE[0]["roles"];
export const CURRENT_SCHEMATIC_RELEVANCE_MODEL_CALLEE_ROLES = Object.freeze(["parentGet", "tagNameGet", "positionAttrsGet", "modifyAttributeChange", "bboxAttributeChange", "watchAttributeChange"] as const);
const digest = (value: string): string => createHash("sha256").update(value).digest("hex");
export function qualifyCurrentSchematicRelevanceModelCalleeSource(input: string): 0 | 1 {
  if (!input.isWellFormed()) { throw new Error("SCHEMATIC_RELEVANCE_MODEL_CALLEE_SOURCE"); }
  for (const variant of [0, 1] as const) {
    const profile = CURRENT_SCHEMATIC_RELEVANCE_MODEL_CALLEE_SOURCE[variant];
    if (Buffer.byteLength(input) === profile.bytes && digest(input) === profile.sha256) {
      for (const role of CURRENT_SCHEMATIC_RELEVANCE_MODEL_CALLEE_ROLES) {
        const method = profile.roles[role], text = input.slice(method.start, method.end);
        if (Buffer.byteLength(text) !== method.bytes || digest(text) !== method.sha256) { throw new Error("SCHEMATIC_RELEVANCE_MODEL_CALLEE_SPAN"); }
      }
      return variant;
    }
  }
  throw new Error("SCHEMATIC_RELEVANCE_MODEL_CALLEE_SOURCE");
}
