/** Actual publisher bus selected through the imported CJS provider. Similar
 * bus copies elsewhere in the same asset do not match this family. */
import { createHash } from "node:crypto";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { qualifyCurrentSchematicRelevancePublicationCalleeSource } from "./current-schematic-relevance-publication-callee-source.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_BROADCAST_CALLEE_SOURCE = freezeDeep([
  {
    "variant": 0,
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch-main.js",
    "bytes": 6_289_622,
    "sha256": "e7fdbc30cadd14fb87c5a50d2c5563241b4cf373d6eea8f7d0c9e7e59588d72c",
    "roles": {
      "factory": {
        "start": 764_805,
        "end": 764_882,
        "bytes": 77,
        "sha256": "397e94a1a1a59cad5418af6fe07a9ae592ff8b9c27fa50174941161ea4dff29d",
        "kind": "regular",
        "name": "xC",
        "strict": false,
        "arity": 1,
        "lineNumber": 30,
        "columnNumber": 8582
      },
      "publish": {
        "start": 411_797,
        "end": 411_881,
        "bytes": 84,
        "sha256": "a7d478020fae45173d72d326c2b2e846cda3bfa66b9961ce87b1490115b0229e",
        "kind": "method",
        "name": "publish",
        "strict": true,
        "arity": 2,
        "lineNumber": 6,
        "columnNumber": 113_766
      },
      "broadcastPublish": {
        "start": 414_261,
        "end": 414_344,
        "bytes": 83,
        "sha256": "bb10d70a55d8264473ba459ace0f362fad24328976a3c416b5b00b810e400cb7",
        "kind": "method",
        "name": "broadcastPublish",
        "strict": true,
        "arity": 2,
        "lineNumber": 6,
        "columnNumber": 116_239
      },
      "post": {
        "start": 414_671,
        "end": 414_750,
        "bytes": 79,
        "sha256": "d444f82a5379a15755ba2a6c41ff227163c1fb5cae10f0989f6fd6b453e64629",
        "kind": "method",
        "name": "post",
        "strict": true,
        "arity": 1,
        "lineNumber": 6,
        "columnNumber": 116_637
      },
      "loopback": {
        "start": 414_725,
        "end": 414_748,
        "bytes": 23,
        "sha256": "106163d941d5d50ae465504a7570da85ddf06a9be01181d557cb861fc76dff85",
        "kind": "arrow",
        "name": "",
        "strict": true,
        "arity": 0,
        "lineNumber": 6,
        "columnNumber": 116_687
      },
      "onMessage": {
        "start": 413_824,
        "end": 414_261,
        "bytes": 437,
        "sha256": "da5aa102c6f446ddb90cb5d503c702117a233b5ebcc33c31ebee255156a5e9e5",
        "kind": "method",
        "name": "onMessage",
        "strict": true,
        "arity": 1,
        "lineNumber": 6,
        "columnNumber": 115_795
      },
      "onReceivedPublish": {
        "start": 412_368,
        "end": 412_653,
        "bytes": 285,
        "sha256": "733d8c66759c947d1887afc33c575e9f2dbb191fa1d6cd8dfd32e2159e7d6509",
        "kind": "method",
        "name": "onReceivedPublish",
        "strict": true,
        "arity": 3,
        "lineNumber": 6,
        "columnNumber": 114_347
      }
    }
  },
  {
    "variant": 1,
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch.js",
    "bytes": 6_472_538,
    "sha256": "b88ad265bb2bc7febb90af92a6f37189b3f90be7cd1f1427522c8f2435dfb4bd",
    "roles": {
      "factory": {
        "start": 1_788_217,
        "end": 1_788_294,
        "bytes": 77,
        "sha256": "fa53c38fae4aa7cadd1bd7abcf3d97f4792c12e774345217b91fcff396b58653",
        "kind": "regular",
        "name": "e2",
        "strict": false,
        "arity": 1,
        "lineNumber": 556,
        "columnNumber": 8582
      },
      "publish": {
        "start": 1_435_209,
        "end": 1_435_293,
        "bytes": 84,
        "sha256": "a7d478020fae45173d72d326c2b2e846cda3bfa66b9961ce87b1490115b0229e",
        "kind": "method",
        "name": "publish",
        "strict": true,
        "arity": 2,
        "lineNumber": 532,
        "columnNumber": 113_766
      },
      "broadcastPublish": {
        "start": 1_437_673,
        "end": 1_437_756,
        "bytes": 83,
        "sha256": "bb10d70a55d8264473ba459ace0f362fad24328976a3c416b5b00b810e400cb7",
        "kind": "method",
        "name": "broadcastPublish",
        "strict": true,
        "arity": 2,
        "lineNumber": 532,
        "columnNumber": 116_239
      },
      "post": {
        "start": 1_438_083,
        "end": 1_438_162,
        "bytes": 79,
        "sha256": "d444f82a5379a15755ba2a6c41ff227163c1fb5cae10f0989f6fd6b453e64629",
        "kind": "method",
        "name": "post",
        "strict": true,
        "arity": 1,
        "lineNumber": 532,
        "columnNumber": 116_637
      },
      "loopback": {
        "start": 1_438_137,
        "end": 1_438_160,
        "bytes": 23,
        "sha256": "106163d941d5d50ae465504a7570da85ddf06a9be01181d557cb861fc76dff85",
        "kind": "arrow",
        "name": "",
        "strict": true,
        "arity": 0,
        "lineNumber": 532,
        "columnNumber": 116_687
      },
      "onMessage": {
        "start": 1_437_236,
        "end": 1_437_673,
        "bytes": 437,
        "sha256": "da5aa102c6f446ddb90cb5d503c702117a233b5ebcc33c31ebee255156a5e9e5",
        "kind": "method",
        "name": "onMessage",
        "strict": true,
        "arity": 1,
        "lineNumber": 532,
        "columnNumber": 115_795
      },
      "onReceivedPublish": {
        "start": 1_435_780,
        "end": 1_436_065,
        "bytes": 285,
        "sha256": "733d8c66759c947d1887afc33c575e9f2dbb191fa1d6cd8dfd32e2159e7d6509",
        "kind": "method",
        "name": "onReceivedPublish",
        "strict": true,
        "arity": 3,
        "lineNumber": 532,
        "columnNumber": 114_347
      }
    }
  }
] as const);
export type CurrentSchematicRelevanceBroadcastCalleeRole = keyof typeof CURRENT_SCHEMATIC_RELEVANCE_BROADCAST_CALLEE_SOURCE[0]["roles"];
export const CURRENT_SCHEMATIC_RELEVANCE_BROADCAST_CALLEE_ROLES = Object.freeze(["factory", "publish", "broadcastPublish", "post", "loopback", "onMessage", "onReceivedPublish"] as const);
export function qualifyCurrentSchematicRelevanceBroadcastCalleeSource(source: string): 0 | 1 {
  const variant = qualifyCurrentSchematicRelevancePublicationCalleeSource(source);
  for (const role of CURRENT_SCHEMATIC_RELEVANCE_BROADCAST_CALLEE_ROLES) {
    const row = CURRENT_SCHEMATIC_RELEVANCE_BROADCAST_CALLEE_SOURCE[variant].roles[role], text = source.slice(row.start, row.end);
    if (Buffer.byteLength(text) !== row.bytes || createHash("sha256").update(text).digest("hex") !== row.sha256) { throw new Error("SCHEMATIC_RELEVANCE_BROADCAST_CALLEE_SPAN"); }
  }
  return variant;
}
