/** Exact installed normal-history listeners. Capturing an uninvoked function
 * proves neither its receiver nor delivery or publication. */
import { createHash } from "node:crypto";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_COMPLETION_CALLBACK_SOURCE = freezeDeep([
  {
    "variant": 0,
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch-main.js",
    "bytes": 6_289_622,
    "sha256": "e7fdbc30cadd14fb87c5a50d2c5563241b4cf373d6eea8f7d0c9e7e59588d72c",
    "roles": {
      "didRecordUpload": {
        "name": "",
        "arity": 1,
        "kind": "arrow",
        "start": 4_407_212,
        "end": 4_407_228,
        "bytes": 16,
        "sha256": "8d67dd121a24dd9b67aea7e501713f082fb7d3193ea1a881f82a9ba6497b91ae",
        "lineNumber": 3613,
        "columnNumber": 93_597
      },
      "statusToolbar": {
        "name": "",
        "arity": 0,
        "kind": "arrow",
        "start": 3_980_878,
        "end": 3_981_090,
        "bytes": 212,
        "sha256": "bacb971bc942b8da4f7413e7ef5ae0f5a49ccd92bca950ce90dacde95be5dfe6",
        "lineNumber": 3606,
        "columnNumber": 313_994
      },
      "statusMenu": {
        "name": "",
        "arity": 0,
        "kind": "arrow",
        "start": 3_980_505,
        "end": 3_980_711,
        "bytes": 206,
        "sha256": "ed4edb3342b356b5176d0ad54a8e22bb9e9aafa89d50e6f895a027b6fdd94e40",
        "lineNumber": 3606,
        "columnNumber": 313_621
      },
      "statusUnsaved": {
        "name": "",
        "arity": 0,
        "kind": "arrow",
        "start": 3_980_221,
        "end": 3_980_338,
        "bytes": 117,
        "sha256": "756d60d5883d11f9db816f877873025db62835fc840039a6357966db296986c6",
        "lineNumber": 3606,
        "columnNumber": 313_337
      }
    }
  },
  {
    "variant": 1,
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch.js",
    "bytes": 6_472_538,
    "sha256": "b88ad265bb2bc7febb90af92a6f37189b3f90be7cd1f1427522c8f2435dfb4bd",
    "roles": {
      "didRecordUpload": {
        "name": "",
        "arity": 1,
        "kind": "arrow",
        "start": 4_629_981,
        "end": 4_629_997,
        "bytes": 16,
        "sha256": "8d67dd121a24dd9b67aea7e501713f082fb7d3193ea1a881f82a9ba6497b91ae",
        "lineNumber": 4112,
        "columnNumber": 91_005
      },
      "statusToolbar": {
        "name": "",
        "arity": 0,
        "kind": "arrow",
        "start": 4_188_079,
        "end": 4_188_291,
        "bytes": 212,
        "sha256": "bacb971bc942b8da4f7413e7ef5ae0f5a49ccd92bca950ce90dacde95be5dfe6",
        "lineNumber": 4105,
        "columnNumber": 179_462
      },
      "statusMenu": {
        "name": "",
        "arity": 0,
        "kind": "arrow",
        "start": 4_187_706,
        "end": 4_187_912,
        "bytes": 206,
        "sha256": "ed4edb3342b356b5176d0ad54a8e22bb9e9aafa89d50e6f895a027b6fdd94e40",
        "lineNumber": 4105,
        "columnNumber": 179_089
      },
      "statusUnsaved": {
        "name": "",
        "arity": 0,
        "kind": "arrow",
        "start": 4_187_422,
        "end": 4_187_539,
        "bytes": 117,
        "sha256": "756d60d5883d11f9db816f877873025db62835fc840039a6357966db296986c6",
        "lineNumber": 4105,
        "columnNumber": 178_805
      }
    }
  }
] as const);
export type CurrentSchematicRelevanceCompletionCallbackRole = keyof typeof CURRENT_SCHEMATIC_RELEVANCE_COMPLETION_CALLBACK_SOURCE[0]["roles"];
export const CURRENT_SCHEMATIC_RELEVANCE_COMPLETION_CALLBACK_ROLES = Object.freeze(["didRecordUpload", "statusToolbar", "statusMenu", "statusUnsaved"] as const);
const digest = (value: string): string => createHash("sha256").update(value).digest("hex");
export function qualifyCurrentSchematicRelevanceCompletionCallbackSource(input: string): 0 | 1 {
  if (!input.isWellFormed()) { throw new Error("SCHEMATIC_RELEVANCE_COMPLETION_CALLBACK_SOURCE"); }
  for (const variant of [0, 1] as const) {
    const profile = CURRENT_SCHEMATIC_RELEVANCE_COMPLETION_CALLBACK_SOURCE[variant];
    if (Buffer.byteLength(input) === profile.bytes && digest(input) === profile.sha256) {
      for (const role of CURRENT_SCHEMATIC_RELEVANCE_COMPLETION_CALLBACK_ROLES) {
        const method = profile.roles[role], text = input.slice(method.start, method.end);
        if (Buffer.byteLength(text) !== method.bytes || digest(text) !== method.sha256) { throw new Error("SCHEMATIC_RELEVANCE_COMPLETION_CALLBACK_SPAN"); }
      }
      return variant;
    }
  }
  throw new Error("SCHEMATIC_RELEVANCE_COMPLETION_CALLBACK_SOURCE");
}
