/** Exact consistency and Text echo callees in the selected schematic family.
 * Metadata does not prove callback rosters, paused handlers or continuation. */
import { createHash } from "node:crypto";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { qualifyCurrentSchematicRelevancePublicationCalleeSource } from "./current-schematic-relevance-publication-callee-source.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_CONSISTENCY_CALLEE_SOURCE = freezeDeep([
  {
    "variant": 0,
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch-main.js",
    "bytes": 6_289_622,
    "sha256": "e7fdbc30cadd14fb87c5a50d2c5563241b4cf373d6eea8f7d0c9e7e59588d72c",
    "roles": {
      "consistencyLocalChange": {
        "start": 427_124,
        "end": 427_358,
        "bytes": 234,
        "sha256": "44429febcad33f067678fd047df78fac63456cd4685553f0f2bbf7b21b227789",
        "kind": "method",
        "name": "localChange",
        "arity": 6,
        "lineNumber": 8,
        "columnNumber": 3890
      },
      "consistencyRemoteChange": {
        "start": 427_358,
        "end": 427_780,
        "bytes": 422,
        "sha256": "41039ba7adae16c3be3335c64008a5d9cad41bce13997e4b0f23d31f4563dde8",
        "kind": "method",
        "name": "remoteChange",
        "arity": 14,
        "lineNumber": 8,
        "columnNumber": 4125
      },
      "consistencyPublishChange": {
        "start": 426_941,
        "end": 427_034,
        "bytes": 93,
        "sha256": "195e27b7da2e0b58cfd7c1e063f54f580d8077a6d1c7a14e5b44dd6cdfec2214",
        "kind": "method",
        "name": "publishChange",
        "arity": 13,
        "lineNumber": 8,
        "columnNumber": 3709
      },
      "consistencySetMaxTicket": {
        "start": 426_587,
        "end": 426_650,
        "bytes": 63,
        "sha256": "097cdaa441206803b50b30c600b68fc62533e7e9cf21ffbeeb963548eb1c3c9d",
        "kind": "method",
        "name": "setMaxTicket",
        "arity": 2,
        "lineNumber": 8,
        "columnNumber": 3354
      },
      "consistencySetDocMaxTicket": {
        "start": 426_277,
        "end": 426_377,
        "bytes": 100,
        "sha256": "1dc3c5b05584a3f58b68e3caca51c2f4b7a617a625d4484a25a7e6ff913613b4",
        "kind": "method",
        "name": "setDocMaxTicket",
        "arity": 3,
        "lineNumber": 8,
        "columnNumber": 3047
      },
      "dispatchCallback": {
        "start": 427_001,
        "end": 427_032,
        "bytes": 31,
        "sha256": "e99d7149ea307c6f882ac7f770065ed2fc07e54d9ee009ba67928ec5133f0475",
        "kind": "arrow",
        "name": "",
        "arity": 1,
        "lineNumber": 8,
        "columnNumber": 3756
      },
      "parseCallback": {
        "start": 451_479,
        "end": 451_781,
        "bytes": 302,
        "sha256": "d1abbf084d9fbec7be4694c59649dec4bab26ad183de629c07be4ea388480443",
        "kind": "arrow",
        "name": "",
        "arity": 12,
        "lineNumber": 10,
        "columnNumber": 20_703
      },
      "onParseLine": {
        "start": 783_484,
        "end": 785_280,
        "bytes": 1796,
        "sha256": "1804910672f835ccd06a9f27e216ffc38d948f51745f6c5cbc568ebf9e7b1b49",
        "kind": "method",
        "name": "onParseLine",
        "arity": 7,
        "lineNumber": 30,
        "columnNumber": 27_261
      },
      "parseText": {
        "start": 786_573,
        "end": 786_631,
        "bytes": 58,
        "sha256": "6ef1f6f8d8c11fbade09db76118b6be1f8de857d7df3086f7dc59da4f9a47ea7",
        "kind": "method",
        "name": "parseText",
        "arity": 5,
        "lineNumber": 30,
        "columnNumber": 30_348
      },
      "setOrderNum": {
        "start": 451_898,
        "end": 452_039,
        "bytes": 141,
        "sha256": "2270651b5704d8e6161a2da99edbb7fa61cc686bba296814e777d6abae781396",
        "kind": "method",
        "name": "setOrderNum",
        "arity": 3,
        "lineNumber": 10,
        "columnNumber": 21_133
      },
      "onText": {
        "start": 4_412_062,
        "end": 4_412_172,
        "bytes": 110,
        "sha256": "bda3efa278f6aa00fa63585f9d96a04fa96aa24ca266110cc218a49a611fbdaf",
        "kind": "method",
        "name": "onText",
        "arity": 6,
        "lineNumber": 3613,
        "columnNumber": 98_453
      },
      "handlerAddOrUpdate": {
        "start": 4_455_250,
        "end": 4_455_312,
        "bytes": 62,
        "sha256": "58b67f05456d3f0df192f9d4c4f1b2a6194b64237735cd2d71aefa9e8e3e6322",
        "kind": "arrow",
        "name": "",
        "arity": 1,
        "lineNumber": 3614,
        "columnNumber": 20_122
      }
    }
  },
  {
    "variant": 1,
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch.js",
    "bytes": 6_472_538,
    "sha256": "b88ad265bb2bc7febb90af92a6f37189b3f90be7cd1f1427522c8f2435dfb4bd",
    "roles": {
      "consistencyLocalChange": {
        "start": 1_450_536,
        "end": 1_450_770,
        "bytes": 234,
        "sha256": "44429febcad33f067678fd047df78fac63456cd4685553f0f2bbf7b21b227789",
        "kind": "method",
        "name": "localChange",
        "arity": 6,
        "lineNumber": 534,
        "columnNumber": 3890
      },
      "consistencyRemoteChange": {
        "start": 1_450_770,
        "end": 1_451_192,
        "bytes": 422,
        "sha256": "60641aeec4eaa556a192b7d42154863f3b94e2a7a96ff913e9ca7dd1e8dad1d0",
        "kind": "method",
        "name": "remoteChange",
        "arity": 14,
        "lineNumber": 534,
        "columnNumber": 4125
      },
      "consistencyPublishChange": {
        "start": 1_450_353,
        "end": 1_450_446,
        "bytes": 93,
        "sha256": "195e27b7da2e0b58cfd7c1e063f54f580d8077a6d1c7a14e5b44dd6cdfec2214",
        "kind": "method",
        "name": "publishChange",
        "arity": 13,
        "lineNumber": 534,
        "columnNumber": 3709
      },
      "consistencySetMaxTicket": {
        "start": 1_449_999,
        "end": 1_450_062,
        "bytes": 63,
        "sha256": "097cdaa441206803b50b30c600b68fc62533e7e9cf21ffbeeb963548eb1c3c9d",
        "kind": "method",
        "name": "setMaxTicket",
        "arity": 2,
        "lineNumber": 534,
        "columnNumber": 3354
      },
      "consistencySetDocMaxTicket": {
        "start": 1_449_689,
        "end": 1_449_789,
        "bytes": 100,
        "sha256": "1dc3c5b05584a3f58b68e3caca51c2f4b7a617a625d4484a25a7e6ff913613b4",
        "kind": "method",
        "name": "setDocMaxTicket",
        "arity": 3,
        "lineNumber": 534,
        "columnNumber": 3047
      },
      "dispatchCallback": {
        "start": 1_450_413,
        "end": 1_450_444,
        "bytes": 31,
        "sha256": "e99d7149ea307c6f882ac7f770065ed2fc07e54d9ee009ba67928ec5133f0475",
        "kind": "arrow",
        "name": "",
        "arity": 1,
        "lineNumber": 534,
        "columnNumber": 3756
      },
      "parseCallback": {
        "start": 1_474_891,
        "end": 1_475_193,
        "bytes": 302,
        "sha256": "059fb891da5d067e7fbfa0bfd40c2760f812c6b942f032e63141cbbcb357eb57",
        "kind": "arrow",
        "name": "",
        "arity": 12,
        "lineNumber": 536,
        "columnNumber": 20_703
      },
      "onParseLine": {
        "start": 1_806_896,
        "end": 1_808_692,
        "bytes": 1796,
        "sha256": "1804910672f835ccd06a9f27e216ffc38d948f51745f6c5cbc568ebf9e7b1b49",
        "kind": "method",
        "name": "onParseLine",
        "arity": 7,
        "lineNumber": 556,
        "columnNumber": 27_261
      },
      "parseText": {
        "start": 1_809_985,
        "end": 1_810_043,
        "bytes": 58,
        "sha256": "6ef1f6f8d8c11fbade09db76118b6be1f8de857d7df3086f7dc59da4f9a47ea7",
        "kind": "method",
        "name": "parseText",
        "arity": 5,
        "lineNumber": 556,
        "columnNumber": 30_348
      },
      "setOrderNum": {
        "start": 1_475_310,
        "end": 1_475_451,
        "bytes": 141,
        "sha256": "2270651b5704d8e6161a2da99edbb7fa61cc686bba296814e777d6abae781396",
        "kind": "method",
        "name": "setOrderNum",
        "arity": 3,
        "lineNumber": 536,
        "columnNumber": 21_133
      },
      "onText": {
        "start": 4_634_831,
        "end": 4_634_941,
        "bytes": 110,
        "sha256": "bda3efa278f6aa00fa63585f9d96a04fa96aa24ca266110cc218a49a611fbdaf",
        "kind": "method",
        "name": "onText",
        "arity": 6,
        "lineNumber": 4112,
        "columnNumber": 95_861
      },
      "handlerAddOrUpdate": {
        "start": 4_678_019,
        "end": 4_678_081,
        "bytes": 62,
        "sha256": "58b67f05456d3f0df192f9d4c4f1b2a6194b64237735cd2d71aefa9e8e3e6322",
        "kind": "arrow",
        "name": "",
        "arity": 1,
        "lineNumber": 4113,
        "columnNumber": 20_122
      }
    }
  }
] as const);
export type CurrentSchematicRelevanceConsistencyCalleeRole = keyof typeof CURRENT_SCHEMATIC_RELEVANCE_CONSISTENCY_CALLEE_SOURCE[0]["roles"];
export const CURRENT_SCHEMATIC_RELEVANCE_CONSISTENCY_CALLEE_ROLES = Object.freeze(["consistencyLocalChange", "consistencyRemoteChange", "consistencyPublishChange", "consistencySetMaxTicket", "consistencySetDocMaxTicket", "dispatchCallback", "parseCallback", "onParseLine", "parseText", "setOrderNum", "onText", "handlerAddOrUpdate"] as const);
export function qualifyCurrentSchematicRelevanceConsistencyCalleeSource(source: string): 0 | 1 {
  const variant = qualifyCurrentSchematicRelevancePublicationCalleeSource(source);
  for (const role of CURRENT_SCHEMATIC_RELEVANCE_CONSISTENCY_CALLEE_ROLES) {
    const row = CURRENT_SCHEMATIC_RELEVANCE_CONSISTENCY_CALLEE_SOURCE[variant].roles[role], text = source.slice(row.start, row.end);
    if (Buffer.byteLength(text) !== row.bytes || createHash("sha256").update(text).digest("hex") !== row.sha256) { throw new Error("SCHEMATIC_RELEVANCE_CONSISTENCY_CALLEE_SPAN"); }
  }
  return variant;
}
