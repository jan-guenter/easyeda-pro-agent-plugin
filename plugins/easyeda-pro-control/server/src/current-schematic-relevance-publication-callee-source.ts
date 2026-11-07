/** Exact schematic publisher family selected through the sheet manager's
 * constructor. Matching source data grants no publisher or timer continuation. */
import { createHash } from "node:crypto";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_CALLEE_SOURCE = freezeDeep([
  {
    "variant": 0,
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch-main.js",
    "bytes": 6_289_622,
    "sha256": "e7fdbc30cadd14fb87c5a50d2c5563241b4cf373d6eea8f7d0c9e7e59588d72c",
    "aliases": {
      "publisher": "XE",
      "manager": "fse",
      "managerBase": "pse",
      "managerCore": "_De",
      "consistency": "EO"
    },
    "roles": {
      "publisherConstructor": {
        "name": "XE",
        "arity": 3,
        "kind": "class",
        "start": 772_240,
        "end": 782_108,
        "bytes": 9868,
        "sha256": "907b6a7154242426252eb3418ddfeac76592f6ce3a9034a756d2b625cc8d3b57",
        "lineNumber": 30,
        "columnNumber": 16_023
      },
      "cachePendData": {
        "name": "cachePendData",
        "arity": 6,
        "kind": "method",
        "start": 779_257,
        "end": 779_610,
        "bytes": 353,
        "sha256": "122fce5a8608112df5a723d3584bddc566aa3015eed29634c8afaa93d149796a",
        "lineNumber": 30,
        "columnNumber": 23_036
      },
      "publishPendData": {
        "name": "publishPendData",
        "arity": 0,
        "kind": "method",
        "start": 779_610,
        "end": 779_866,
        "bytes": 256,
        "sha256": "db28fbdf2e3cd85885693dfde5e95a8a660fd4447f826894f99402378b736870",
        "lineNumber": 30,
        "columnNumber": 23_391
      },
      "localChange": {
        "name": "localChange",
        "arity": 3,
        "kind": "method",
        "start": 779_866,
        "end": 780_184,
        "bytes": 318,
        "sha256": "e349bef751e45050b256b3e6a947fd340c5785558af4d6c3f1f0bb4504c4c201",
        "lineNumber": 30,
        "columnNumber": 23_643
      },
      "uniqueIdGet": {
        "name": "get uniqueId",
        "arity": 0,
        "kind": "getter",
        "start": 772_871,
        "end": 772_943,
        "bytes": 72,
        "sha256": "92a9427580ca0e51c00682c00d579b3d42d77b7febc0b82f78cab54421320eb8",
        "lineNumber": 30,
        "columnNumber": 16_649
      },
      "consistencyGetClient": {
        "name": "getClient",
        "arity": 0,
        "kind": "method",
        "start": 427_062,
        "end": 427_093,
        "bytes": 31,
        "sha256": "bcdb9c5b9ca5087797b72070c261597281a1727c7bab0c913fb55528fc2aa69c",
        "lineNumber": 8,
        "columnNumber": 3826
      },
      "consistencyGetUnique": {
        "name": "getUnique",
        "arity": 0,
        "kind": "method",
        "start": 426_219,
        "end": 426_250,
        "bytes": 31,
        "sha256": "67c96eeaccad2ae8f10332dd8ab28b88fe54e31b889da61e23d0714ec02a9e6c",
        "lineNumber": 8,
        "columnNumber": 2983
      },
      "timerCallback": {
        "name": "",
        "arity": 0,
        "kind": "arrow",
        "start": 779_550,
        "end": 779_605,
        "bytes": 55,
        "sha256": "8b5153d56202c0fccf8b04930c996c1350d0b72c49ed2849a3520e6d7e0eb539",
        "lineNumber": 30,
        "columnNumber": 23_316
      },
      "promiseExecutor": {
        "name": "",
        "arity": 1,
        "kind": "arrow",
        "start": 779_516,
        "end": 779_522,
        "bytes": 6,
        "sha256": "df6249608651b49a312d0f07249767640e81d14e569749ac3186077c3ade80fd",
        "lineNumber": 30,
        "columnNumber": 23_282
      }
    },
    "blueprints": {
      "publisherClass": {
        "start": 772_240,
        "end": 782_108,
        "bytes": 9868,
        "sha256": "907b6a7154242426252eb3418ddfeac76592f6ce3a9034a756d2b625cc8d3b57"
      },
      "managerClass": {
        "start": 807_161,
        "end": 808_742,
        "bytes": 1581,
        "sha256": "4717e3b09731d35ce019ad8ad00a16e26cf5363d62de6239dc2f0dc7afc1ef65"
      },
      "managerBaseClass": {
        "start": 803_486,
        "end": 807_156,
        "bytes": 3670,
        "sha256": "f0b3b01ff5ef320ead2f74215c891b8c2eea920f5ce9ed850c4a15637276986b"
      },
      "managerCoreClass": {
        "start": 783_402,
        "end": 787_537,
        "bytes": 4135,
        "sha256": "886b2744ceb96a0f889a4bf110235da21ca35d34f101e078f05923f5cf0ba644"
      },
      "consistencyClass": {
        "start": 425_934,
        "end": 427_781,
        "bytes": 1847,
        "sha256": "68355b4a09f3f84f35a71b9909dce54280e809a1bbb153fd38386c79f3359929"
      }
    }
  },
  {
    "variant": 1,
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch.js",
    "bytes": 6_472_538,
    "sha256": "b88ad265bb2bc7febb90af92a6f37189b3f90be7cd1f1427522c8f2435dfb4bd",
    "aliases": {
      "publisher": "MP",
      "manager": "Rle",
      "managerBase": "kle",
      "managerCore": "n4e",
      "consistency": "jO"
    },
    "roles": {
      "publisherConstructor": {
        "name": "MP",
        "arity": 3,
        "kind": "class",
        "start": 1_795_652,
        "end": 1_805_520,
        "bytes": 9868,
        "sha256": "a09849cff8bec8ed14d74774e39f35d0bef9b135e1c4b002efc091518ff5a147",
        "lineNumber": 556,
        "columnNumber": 16_023
      },
      "cachePendData": {
        "name": "cachePendData",
        "arity": 6,
        "kind": "method",
        "start": 1_802_669,
        "end": 1_803_022,
        "bytes": 353,
        "sha256": "122fce5a8608112df5a723d3584bddc566aa3015eed29634c8afaa93d149796a",
        "lineNumber": 556,
        "columnNumber": 23_036
      },
      "publishPendData": {
        "name": "publishPendData",
        "arity": 0,
        "kind": "method",
        "start": 1_803_022,
        "end": 1_803_278,
        "bytes": 256,
        "sha256": "f4e31ba6ccae352544e2c6ef75fb4950da1fddd410e6217e87716ee9fb65c990",
        "lineNumber": 556,
        "columnNumber": 23_391
      },
      "localChange": {
        "name": "localChange",
        "arity": 3,
        "kind": "method",
        "start": 1_803_278,
        "end": 1_803_596,
        "bytes": 318,
        "sha256": "e349bef751e45050b256b3e6a947fd340c5785558af4d6c3f1f0bb4504c4c201",
        "lineNumber": 556,
        "columnNumber": 23_643
      },
      "uniqueIdGet": {
        "name": "get uniqueId",
        "arity": 0,
        "kind": "getter",
        "start": 1_796_283,
        "end": 1_796_355,
        "bytes": 72,
        "sha256": "92a9427580ca0e51c00682c00d579b3d42d77b7febc0b82f78cab54421320eb8",
        "lineNumber": 556,
        "columnNumber": 16_649
      },
      "consistencyGetClient": {
        "name": "getClient",
        "arity": 0,
        "kind": "method",
        "start": 1_450_474,
        "end": 1_450_505,
        "bytes": 31,
        "sha256": "bcdb9c5b9ca5087797b72070c261597281a1727c7bab0c913fb55528fc2aa69c",
        "lineNumber": 534,
        "columnNumber": 3826
      },
      "consistencyGetUnique": {
        "name": "getUnique",
        "arity": 0,
        "kind": "method",
        "start": 1_449_631,
        "end": 1_449_662,
        "bytes": 31,
        "sha256": "67c96eeaccad2ae8f10332dd8ab28b88fe54e31b889da61e23d0714ec02a9e6c",
        "lineNumber": 534,
        "columnNumber": 2983
      },
      "timerCallback": {
        "name": "",
        "arity": 0,
        "kind": "arrow",
        "start": 1_802_962,
        "end": 1_803_017,
        "bytes": 55,
        "sha256": "8b5153d56202c0fccf8b04930c996c1350d0b72c49ed2849a3520e6d7e0eb539",
        "lineNumber": 556,
        "columnNumber": 23_316
      },
      "promiseExecutor": {
        "name": "",
        "arity": 1,
        "kind": "arrow",
        "start": 1_802_928,
        "end": 1_802_934,
        "bytes": 6,
        "sha256": "df6249608651b49a312d0f07249767640e81d14e569749ac3186077c3ade80fd",
        "lineNumber": 556,
        "columnNumber": 23_282
      }
    },
    "blueprints": {
      "publisherClass": {
        "start": 1_795_652,
        "end": 1_805_520,
        "bytes": 9868,
        "sha256": "a09849cff8bec8ed14d74774e39f35d0bef9b135e1c4b002efc091518ff5a147"
      },
      "managerClass": {
        "start": 1_830_573,
        "end": 1_832_154,
        "bytes": 1581,
        "sha256": "547e43f4a84b94d8b7e6e9298cb2c9f5af0b61660b3754161b25a7002fbb05d3"
      },
      "managerBaseClass": {
        "start": 1_826_898,
        "end": 1_830_568,
        "bytes": 3670,
        "sha256": "3d657873a8894ecc9d2a5b82ac87d1538ba156b9bfb534c98c8c08b437d87bca"
      },
      "managerCoreClass": {
        "start": 1_806_814,
        "end": 1_810_949,
        "bytes": 4135,
        "sha256": "92daa00487097378b665d3621a6eede643ff2050e835724c165c0f9bd651fa16"
      },
      "consistencyClass": {
        "start": 1_449_346,
        "end": 1_451_193,
        "bytes": 1847,
        "sha256": "7335df5c217cca301d797b64d565a1fd1dac03621b3782c6459b14e62d8ae7ca"
      }
    }
  }
] as const);
export type CurrentSchematicRelevancePublicationCalleeRole = keyof typeof CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_CALLEE_SOURCE[0]["roles"];
export const CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_CALLEE_ROLES = Object.freeze(["publisherConstructor", "cachePendData", "publishPendData", "localChange", "uniqueIdGet", "consistencyGetClient", "consistencyGetUnique", "timerCallback", "promiseExecutor"] as const);
const BLUEPRINT_ROLES = ["publisherClass", "managerClass", "managerBaseClass", "managerCoreClass", "consistencyClass"] as const;
const digest = (value: string): string => createHash("sha256").update(value).digest("hex");
export function qualifyCurrentSchematicRelevancePublicationCalleeSource(input: string): 0 | 1 {
  if (!input.isWellFormed()) { throw new Error("SCHEMATIC_RELEVANCE_PUBLICATION_CALLEE_SOURCE"); }
  for (const variant of [0, 1] as const) {
    const profile = CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_CALLEE_SOURCE[variant];
    if (Buffer.byteLength(input) === profile.bytes && digest(input) === profile.sha256) {
      for (const method of [...CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_CALLEE_ROLES.map(role => profile.roles[role]), ...BLUEPRINT_ROLES.map(role => profile.blueprints[role])]) {
        const text = input.slice(method.start, method.end);
        if (Buffer.byteLength(text) !== method.bytes || digest(text) !== method.sha256) { throw new Error("SCHEMATIC_RELEVANCE_PUBLICATION_CALLEE_SPAN"); }
      }
      return variant;
    }
  }
  throw new Error("SCHEMATIC_RELEVANCE_PUBLICATION_CALLEE_SOURCE");
}
