/** Selected page-publisher canvas receivers, distinct from the project path.
 * Source data grants no original subscription, echo suppression or resume. */
import { createHash } from "node:crypto";
import { qualifyCurrentSchematicRelevancePublicationCalleeSource } from "./current-schematic-relevance-publication-callee-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_CANVAS_ECHO_SOURCE = freezeDeep([
  {
    "variant": 0,
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch-main.js",
    "bytes": 6_289_622,
    "sha256": "e7fdbc30cadd14fb87c5a50d2c5563241b4cf373d6eea8f7d0c9e7e59588d72c",
    "aliases": {
      "publisher": "XE",
      "channel": "gL",
      "manager": "O9",
      "topicFactory": "xC",
      "topicNamespace": "da",
      "sheetTopics": "uDe"
    },
    "topicTemplate": "/pro-mgr/canvas/{uuid}/update",
    "blueprints": {
      "da": {
        "start": 765_067,
        "end": 765_738,
        "bytes": 671,
        "sha256": "71890fa07b22277b5f999b945113d23a0c0742caac2207bfdc4554053b37d9c6"
      },
      "uDe": {
        "start": 766_140,
        "end": 766_303,
        "bytes": 163,
        "sha256": "a28b8acc7944620cb9c5508fca36118cb7ce74f37333cd0858b73ae90c73f258"
      },
      "schematicManagerConstruction": {
        "start": 4_407_613,
        "end": 4_407_964,
        "bytes": 351,
        "sha256": "05e86d9c1ecad2ea055ee050625c0e3f52f5bd5473fee0a825386a01e08366ef"
      }
    },
    "roles": {
      "pushOnLine": {
        "kind": "method",
        "name": "pushOnLine",
        "arity": 2,
        "async": false,
        "start": 775_089,
        "end": 775_215,
        "bytes": 126,
        "sha256": "1b1686d7cebfe7079bf03c67f7ee1129654708f0f3be34eba8d667412f45f50c",
        "sourceLine": 30,
        "sourceColumn": 18_855,
        "lineNumber": 30,
        "columnNumber": 18_865
      },
      "publishLine": {
        "kind": "method",
        "name": "publishLine",
        "arity": 5,
        "async": false,
        "start": 773_138,
        "end": 773_569,
        "bytes": 431,
        "sha256": "80d2974723d10d8003548980a776e4eed30cd3d0ac3f9e17287611ffd4413f75",
        "sourceLine": 30,
        "sourceColumn": 16_904,
        "lineNumber": 30,
        "columnNumber": 16_915
      },
      "initProject": {
        "kind": "method",
        "name": "initProject",
        "arity": 6,
        "async": true,
        "start": 775_215,
        "end": 777_567,
        "bytes": 2352,
        "sha256": "f9b52137f2cf7744b3b510e587874da08abe89479fd1dffb1bc362ae3060a9a6",
        "sourceLine": 30,
        "sourceColumn": 18_981,
        "lineNumber": 30,
        "columnNumber": 18_998
      },
      "channelCanPush": {
        "kind": "method",
        "name": "canPush",
        "arity": 0,
        "async": false,
        "start": 768_281,
        "end": 768_349,
        "bytes": 68,
        "sha256": "e9907339a372b19d731fdaeb38f097c09e5446c4fa76ba3400a16f0207524384",
        "sourceLine": 30,
        "sourceColumn": 12_047,
        "lineNumber": 30,
        "columnNumber": 12_054
      },
      "taskRunning": {
        "kind": "method",
        "name": "running",
        "arity": 0,
        "async": false,
        "start": 409_949,
        "end": 409_981,
        "bytes": 32,
        "sha256": "adb3cd3837fa32d458dc61d19a39f15d6e1daf9ddcd8dd698582dd13a4430b35",
        "sourceLine": 6,
        "sourceColumn": 111_911,
        "lineNumber": 6,
        "columnNumber": 111_918
      },
      "taskExecute": {
        "kind": "method",
        "name": "execute",
        "arity": 1,
        "async": true,
        "start": 409_981,
        "end": 410_067,
        "bytes": 86,
        "sha256": "79d3459f0c2298bee3666242baea145663a2302e6128240f8e292c8b054767c1",
        "sourceLine": 6,
        "sourceColumn": 111_943,
        "lineNumber": 6,
        "columnNumber": 111_956
      },
      "projectUpdateCallback": {
        "kind": "arrow",
        "name": "",
        "arity": 1,
        "async": false,
        "start": 775_627,
        "end": 775_691,
        "bytes": 64,
        "sha256": "12cd22768ef50f72e6639a591dcbe0176ae364ba6c2d2ac43d73e4b3767bf18f",
        "sourceLine": 30,
        "sourceColumn": 19_393,
        "lineNumber": 30,
        "columnNumber": 19_393
      },
      "busSubscribe": {
        "kind": "method",
        "name": "subscribe",
        "arity": 2,
        "async": false,
        "start": 411_881,
        "end": 411_996,
        "bytes": 115,
        "sha256": "27a446a44706a9c1b0d65b647e188cd6e3af7f6805d109ff43a491099dc4b5ac",
        "sourceLine": 6,
        "sourceColumn": 113_843,
        "lineNumber": 6,
        "columnNumber": 113_852
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
      "channel": "yk",
      "manager": "_7",
      "topicFactory": "e2",
      "topicNamespace": "ya",
      "sheetTopics": "K5e"
    },
    "topicTemplate": "/pro-mgr/canvas/{uuid}/update",
    "blueprints": {
      "ya": {
        "start": 1_788_479,
        "end": 1_789_150,
        "bytes": 671,
        "sha256": "3b1807ebc34ba9192112ab080e7de2eac36c59f31db842a620d38615ba788487"
      },
      "K5e": {
        "start": 1_789_552,
        "end": 1_789_715,
        "bytes": 163,
        "sha256": "ef0dc47f61cab0396b8f19d012b55e7cf39bf94045465b066c74e8862c2ae41d"
      },
      "schematicManagerConstruction": {
        "start": 4_630_382,
        "end": 4_630_733,
        "bytes": 351,
        "sha256": "7149504ae138b35de478063eaa266b52092864fba6b65dec1f00141dce9bc71c"
      }
    },
    "roles": {
      "pushOnLine": {
        "kind": "method",
        "name": "pushOnLine",
        "arity": 2,
        "async": false,
        "start": 1_798_501,
        "end": 1_798_627,
        "bytes": 126,
        "sha256": "1b1686d7cebfe7079bf03c67f7ee1129654708f0f3be34eba8d667412f45f50c",
        "sourceLine": 556,
        "sourceColumn": 18_855,
        "lineNumber": 556,
        "columnNumber": 18_865
      },
      "publishLine": {
        "kind": "method",
        "name": "publishLine",
        "arity": 5,
        "async": false,
        "start": 1_796_550,
        "end": 1_796_981,
        "bytes": 431,
        "sha256": "80d2974723d10d8003548980a776e4eed30cd3d0ac3f9e17287611ffd4413f75",
        "sourceLine": 556,
        "sourceColumn": 16_904,
        "lineNumber": 556,
        "columnNumber": 16_915
      },
      "initProject": {
        "kind": "method",
        "name": "initProject",
        "arity": 6,
        "async": true,
        "start": 1_798_627,
        "end": 1_800_979,
        "bytes": 2352,
        "sha256": "e124063c888fb73a2cfd3c6eba01d74649670d1f8531c2c0abdf52674fce5f20",
        "sourceLine": 556,
        "sourceColumn": 18_981,
        "lineNumber": 556,
        "columnNumber": 18_998
      },
      "channelCanPush": {
        "kind": "method",
        "name": "canPush",
        "arity": 0,
        "async": false,
        "start": 1_791_693,
        "end": 1_791_761,
        "bytes": 68,
        "sha256": "e9907339a372b19d731fdaeb38f097c09e5446c4fa76ba3400a16f0207524384",
        "sourceLine": 556,
        "sourceColumn": 12_047,
        "lineNumber": 556,
        "columnNumber": 12_054
      },
      "taskRunning": {
        "kind": "method",
        "name": "running",
        "arity": 0,
        "async": false,
        "start": 1_433_361,
        "end": 1_433_393,
        "bytes": 32,
        "sha256": "adb3cd3837fa32d458dc61d19a39f15d6e1daf9ddcd8dd698582dd13a4430b35",
        "sourceLine": 532,
        "sourceColumn": 111_911,
        "lineNumber": 532,
        "columnNumber": 111_918
      },
      "taskExecute": {
        "kind": "method",
        "name": "execute",
        "arity": 1,
        "async": true,
        "start": 1_433_393,
        "end": 1_433_479,
        "bytes": 86,
        "sha256": "79d3459f0c2298bee3666242baea145663a2302e6128240f8e292c8b054767c1",
        "sourceLine": 532,
        "sourceColumn": 111_943,
        "lineNumber": 532,
        "columnNumber": 111_956
      },
      "projectUpdateCallback": {
        "kind": "arrow",
        "name": "",
        "arity": 1,
        "async": false,
        "start": 1_799_039,
        "end": 1_799_103,
        "bytes": 64,
        "sha256": "12cd22768ef50f72e6639a591dcbe0176ae364ba6c2d2ac43d73e4b3767bf18f",
        "sourceLine": 556,
        "sourceColumn": 19_393,
        "lineNumber": 556,
        "columnNumber": 19_393
      },
      "busSubscribe": {
        "kind": "method",
        "name": "subscribe",
        "arity": 2,
        "async": false,
        "start": 1_435_293,
        "end": 1_435_408,
        "bytes": 115,
        "sha256": "27a446a44706a9c1b0d65b647e188cd6e3af7f6805d109ff43a491099dc4b5ac",
        "sourceLine": 532,
        "sourceColumn": 113_843,
        "lineNumber": 532,
        "columnNumber": 113_852
      }
    }
  }
] as const);
export type CurrentSchematicRelevanceCanvasEchoRole = keyof typeof CURRENT_SCHEMATIC_RELEVANCE_CANVAS_ECHO_SOURCE[0]["roles"];
export const CURRENT_SCHEMATIC_RELEVANCE_CANVAS_ECHO_ROLES = Object.freeze(["pushOnLine", "publishLine", "initProject", "channelCanPush", "taskRunning", "taskExecute", "projectUpdateCallback", "busSubscribe"] as const);

/** Reuse the complete selected publisher-family pin and bind only the missing
 * receiver/callee and topic/constructor spans. Live identities remain unproved. */
export function qualifyCurrentSchematicRelevanceCanvasEchoSource(input: string): 0 | 1 {
  const variant = qualifyCurrentSchematicRelevancePublicationCalleeSource(input);
  const profile = CURRENT_SCHEMATIC_RELEVANCE_CANVAS_ECHO_SOURCE[variant];
  const blueprints = variant === 0 ? Object.values(CURRENT_SCHEMATIC_RELEVANCE_CANVAS_ECHO_SOURCE[0].blueprints) : Object.values(CURRENT_SCHEMATIC_RELEVANCE_CANVAS_ECHO_SOURCE[1].blueprints);
  for (const row of [...CURRENT_SCHEMATIC_RELEVANCE_CANVAS_ECHO_ROLES.map(role => profile.roles[role]), ...blueprints]) {
    const span = input.slice(row.start, row.end);
    if (Buffer.byteLength(span) !== row.bytes || createHash("sha256").update(span).digest("hex") !== row.sha256) { throw new Error("SCH_CANVAS_ECHO_SOURCE_SPAN"); }
  }
  return variant;
}
