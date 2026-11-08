/** Fixed local UI MessageBus candidates. These supplied-byte profiles grant no receiver or publication authority. */
import {createHash} from "node:crypto";
import {freezeDeep} from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_STATUS_BUS_SOURCE=freezeDeep([
  {
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch-main.js",
    "bytes": 6_289_622,
    "sha256": "e7fdbc30cadd14fb87c5a50d2c5563241b4cf373d6eea8f7d0c9e7e59588d72c",
    "kind": "schematic",
    "publish": {
      "start": 146_348,
      "end": 146_556,
      "name": "publish",
      "arity": 4,
      "bytes": 208,
      "sha256": "4472a109b3fb1ee6db3ef732ce31309657e119e4b8cec2eb3e361cfa3a0ad7d7",
      "lineNumber": 3,
      "columnNumber": 68_486
    },
    "taskRunning": {
      "start": 146_007,
      "end": 146_039,
      "name": "running",
      "arity": 0,
      "bytes": 32,
      "sha256": "adb3cd3837fa32d458dc61d19a39f15d6e1daf9ddcd8dd698582dd13a4430b35",
      "lineNumber": 3,
      "columnNumber": 68_145
    },
    "taskExecute": {
      "start": 146_039,
      "end": 146_120,
      "name": "execute",
      "arity": 4,
      "bytes": 81,
      "sha256": "d980428a5cd3698a092272adb4773097b5571b7e619c2a753de4df2e9bcc93d9",
      "lineNumber": 3,
      "columnNumber": 68_177
    },
    "clone": {
      "start": 142_593,
      "end": 142_966,
      "name": "yB",
      "arity": 1,
      "bytes": 373,
      "sha256": "f82a319a1310be51e0a8dc2ebb7ce4b869ca110646b0993ce4cc2ce29ca0b212",
      "lineNumber": 3,
      "columnNumber": 64_735
    },
    "cloneArgument": "i",
    "cloneModuleExpression": "[i,yB,AIe,RH]",
    "cloneCaptureExpression": "[yB]"
  },
  {
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch.js",
    "bytes": 6_472_538,
    "sha256": "b88ad265bb2bc7febb90af92a6f37189b3f90be7cd1f1427522c8f2435dfb4bd",
    "kind": "schematic",
    "publish": {
      "start": 334_677,
      "end": 334_885,
      "name": "publish",
      "arity": 4,
      "bytes": 208,
      "sha256": "5a9032a664dc255379758a84d2fda8d5fdddc1b1ae13fcf8cb0f65c65b4c157e",
      "lineNumber": 501,
      "columnNumber": 73_911
    },
    "taskRunning": {
      "start": 334_336,
      "end": 334_368,
      "name": "running",
      "arity": 0,
      "bytes": 32,
      "sha256": "adb3cd3837fa32d458dc61d19a39f15d6e1daf9ddcd8dd698582dd13a4430b35",
      "lineNumber": 501,
      "columnNumber": 73_570
    },
    "taskExecute": {
      "start": 334_368,
      "end": 334_449,
      "name": "execute",
      "arity": 4,
      "bytes": 81,
      "sha256": "9dc647262600b84debd44467c948ffb8a4a097be453605d78cb1102d87d0179a",
      "lineNumber": 501,
      "columnNumber": 73_602
    },
    "clone": {
      "start": 330_922,
      "end": 331_295,
      "name": "ER",
      "arity": 1,
      "bytes": 373,
      "sha256": "e34d883fcf3d18212d3d08fd51a1d96ca2e512d9cf25a072e15a3259a81b625f",
      "lineNumber": 501,
      "columnNumber": 70_160
    },
    "cloneArgument": "i",
    "cloneModuleExpression": "[i,ER,V8e,kW]",
    "cloneCaptureExpression": "[ER]"
  },
  {
    "relativePath": "pro-ui/3.2.198.2800f583/js/ui.js",
    "bytes": 17_468_192,
    "sha256": "3515d4c299b353fa7bcd0d859f0b8b59b7eae39b5dc243b2c27f2e54a60a1ee6",
    "kind": "ui",
    "publish": {
      "start": 1_649_296,
      "end": 1_649_504,
      "name": "publish",
      "arity": 4,
      "bytes": 208,
      "sha256": "0bce2ea3405188a341e08d4b2f73326ffc7805ad5a468ade32e50ef99275c869",
      "lineNumber": 1033,
      "columnNumber": 29_000
    },
    "taskRunning": {
      "start": 1_648_954,
      "end": 1_648_986,
      "name": "running",
      "arity": 0,
      "bytes": 32,
      "sha256": "adb3cd3837fa32d458dc61d19a39f15d6e1daf9ddcd8dd698582dd13a4430b35",
      "lineNumber": 1033,
      "columnNumber": 28_658
    },
    "taskExecute": {
      "start": 1_648_986,
      "end": 1_649_068,
      "name": "execute",
      "arity": 4,
      "bytes": 82,
      "sha256": "e3f3dd7f5d116bf632acf0431c14c33751fa768802c8873552bca13f7970579b",
      "lineNumber": 1033,
      "columnNumber": 28_690
    },
    "clone": {
      "start": 1_645_526,
      "end": 1_645_903,
      "name": "e9e",
      "arity": 1,
      "bytes": 377,
      "sha256": "698dd5cc887837e94cabe91632547aa74da355e8e9e5a069f8d2120d6bd08ce0",
      "lineNumber": 1033,
      "columnNumber": 25_235
    },
    "cloneArgument": "t",
    "cloneModuleExpression": "[t,e9e,edn,O2t]",
    "cloneCaptureExpression": "[e9e]"
  }
] as const);
export type CurrentSchematicRelevanceStatusBusVariant=0|1|2;
export function qualifyCurrentSchematicRelevanceStatusBusSource(source:string):CurrentSchematicRelevanceStatusBusVariant{if(!source.isWellFormed()){throw new Error("SCH_STATUS_BUS_SOURCE");}for(const variant of[0,1,2]as const){const row=CURRENT_SCHEMATIC_RELEVANCE_STATUS_BUS_SOURCE[variant];if(Buffer.byteLength(source)===row.bytes&&createHash("sha256").update(source).digest("hex")===row.sha256){for(const role of["publish","taskRunning","taskExecute","clone"]as const){const method=row[role],text=source.slice(method.start,method.end);if(Buffer.byteLength(text)!==method.bytes||createHash("sha256").update(text).digest("hex")!==method.sha256){throw new Error("SCH_STATUS_BUS_SPAN");}}return variant;}}throw new Error("SCH_STATUS_BUS_SOURCE");}
