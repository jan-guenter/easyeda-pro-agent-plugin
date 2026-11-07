/** Exact uninvoked document constructors. Source and function metadata do not
 * instantiate a document or establish its original receiver/HomeObject. */
import { createHash } from "node:crypto";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_DOCUMENT_CONSTRUCTOR_SOURCE = freezeDeep([
  {
    "variant": 0,
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch-main.js",
    "bytes": 6_289_622,
    "sha256": "e7fdbc30cadd14fb87c5a50d2c5563241b4cf373d6eea8f7d0c9e7e59588d72c",
    "roles": {
      "base": {
        "name": "m1",
        "arity": 1,
        "kind": "class",
        "parent": "He",
        "start": 4_460_838,
        "end": 4_463_428,
        "bytes": 2590,
        "sha256": "0eb132c2e971c7e17f9b86e1f13da8de82c20e60ae6a697e39eedee0a6c43d83",
        "lineNumber": 3614,
        "columnNumber": 25_738
      },
      "schematicPage": {
        "name": "ja",
        "arity": 1,
        "kind": "class",
        "parent": "m1",
        "start": 5_370_125,
        "end": 5_375_093,
        "bytes": 4968,
        "sha256": "a3eff5df50ed791535ff8e4a041c4caee5fc7a3b93312c45246ef3031e96d13c",
        "lineNumber": 3673,
        "columnNumber": 57_976
      }
    }
  },
  {
    "variant": 1,
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch.js",
    "bytes": 6_472_538,
    "sha256": "b88ad265bb2bc7febb90af92a6f37189b3f90be7cd1f1427522c8f2435dfb4bd",
    "roles": {
      "base": {
        "name": "bv",
        "arity": 1,
        "kind": "class",
        "parent": "He",
        "start": 4_683_607,
        "end": 4_686_197,
        "bytes": 2590,
        "sha256": "cf845360a0ddc77b9cbee750916d2a94bd2dbb56ad2af8e49f6218a87dbc4aa3",
        "lineNumber": 4113,
        "columnNumber": 25_738
      },
      "schematicPage": {
        "name": "Ha",
        "arity": 1,
        "kind": "class",
        "parent": "bv",
        "start": 5_669_131,
        "end": 5_674_099,
        "bytes": 4968,
        "sha256": "6d2343e75b790edab8bfb0d735dc619fbd9b8a988ad59ba198287b8a56efd853",
        "lineNumber": 4191,
        "columnNumber": 63_076
      }
    }
  }
] as const);
export type CurrentSchematicDocumentConstructorRole = keyof typeof CURRENT_SCHEMATIC_DOCUMENT_CONSTRUCTOR_SOURCE[0]["roles"];
export const CURRENT_SCHEMATIC_DOCUMENT_CONSTRUCTOR_ROLES = Object.freeze(["base", "schematicPage"] as const);
const digest = (value: string): string => createHash("sha256").update(value).digest("hex");
export function qualifyCurrentSchematicDocumentConstructorSource(input: string): 0 | 1 {
 if (!input.isWellFormed()) { throw new Error("SCHEMATIC_DOCUMENT_CONSTRUCTOR_SOURCE"); }
 for (const variant of [0, 1] as const) {
  const profile = CURRENT_SCHEMATIC_DOCUMENT_CONSTRUCTOR_SOURCE[variant];
  if (Buffer.byteLength(input) === profile.bytes && digest(input) === profile.sha256) {
   for (const role of CURRENT_SCHEMATIC_DOCUMENT_CONSTRUCTOR_ROLES) {
    const row = profile.roles[role], text = input.slice(row.start, row.end);
    if (Buffer.byteLength(text) !== row.bytes || digest(text) !== row.sha256) { throw new Error("SCHEMATIC_DOCUMENT_CONSTRUCTOR_SPAN"); }
   }
   return variant;
  }
 }
 throw new Error("SCHEMATIC_DOCUMENT_CONSTRUCTOR_SOURCE");
}
