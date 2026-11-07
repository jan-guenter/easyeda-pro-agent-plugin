/** Exact original event-removal arrow only. This source receipt grants no
 * receiver, callback delivery, disposal or continuation authority. */
import { createHash } from "node:crypto";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_NORMAL_DISPOSAL_SOURCE=freezeDeep([
  {
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch-main.js",
    "bytes": 6_289_622,
    "sha256": "e7fdbc30cadd14fb87c5a50d2c5563241b4cf373d6eea8f7d0c9e7e59588d72c",
    "roles": {
      "eventRemoval": {
        "name": "",
        "arity": 0,
        "kind": "arrow",
        "start": 330_064,
        "end": 330_105,
        "bytes": 41,
        "sha256": "ba004933a7192c0f1eb413b55a334a4855b1fd08429c8e4603a858f26d86e5a2",
        "lineNumber": 6,
        "columnNumber": 32_026
      }
    }
  },
  {
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch.js",
    "bytes": 6_472_538,
    "sha256": "b88ad265bb2bc7febb90af92a6f37189b3f90be7cd1f1427522c8f2435dfb4bd",
    "roles": {
      "eventRemoval": {
        "name": "",
        "arity": 0,
        "kind": "arrow",
        "start": 1_353_476,
        "end": 1_353_517,
        "bytes": 41,
        "sha256": "ba004933a7192c0f1eb413b55a334a4855b1fd08429c8e4603a858f26d86e5a2",
        "lineNumber": 532,
        "columnNumber": 32_026
      }
    }
  }
] as const);
export function qualifyCurrentSchematicRelevanceNormalDisposalSource(source:string):0|1{
 if(!source.isWellFormed()){throw new Error("SCH_NORMAL_DISPOSAL_SOURCE");}
 const bytes=Buffer.byteLength(source),sha=createHash("sha256").update(source).digest("hex");
 for(const variant of [0,1] as const){const row=CURRENT_SCHEMATIC_RELEVANCE_NORMAL_DISPOSAL_SOURCE[variant];if(bytes===row.bytes&&sha===row.sha256){const text=source.slice(row.roles.eventRemoval.start,row.roles.eventRemoval.end);if(Buffer.byteLength(text)!==row.roles.eventRemoval.bytes||createHash("sha256").update(text).digest("hex")!==row.roles.eventRemoval.sha256){break;}return variant;}}
 throw new Error("SCH_NORMAL_DISPOSAL_SOURCE");
}
