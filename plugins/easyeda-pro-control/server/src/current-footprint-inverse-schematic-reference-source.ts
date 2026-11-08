/** Exact uninvoked SCH reference-query callbacks, store iterator and factory.
 * Source metadata issues no original store, request, result or continuation. */
import { createHash } from "node:crypto";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { qualifyCurrentFootprintSourceFunctionMetadata } from "./current-footprint-source-function-metadata.ts";

export const CURRENT_FOOTPRINT_INVERSE_SCHEMATIC_REFERENCE_SOURCE = freezeDeep([
  {
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch-main.js",
    "bytes": 6_289_622,
    "sha256": "e7fdbc30cadd14fb87c5a50d2c5563241b4cf373d6eea8f7d0c9e7e59588d72c",
    "methods": {
      "iterator": {
        "name": "V",
        "arity": 2,
        "kind": "function",
        "strict": false,
        "async": false,
        "parent": null,
        "start": 302_503,
        "end": 302_718,
        "descriptionStart": 302_503,
        "bytes": 215,
        "sha256": "a4137ea1ab5e11b08b7e04347b14f0ccd835ddf8c93fa2e1324b4e0aa1e87ac5",
        "lineNumber": 6,
        "columnNumber": 4475
      },
      "factory": {
        "name": "Lx",
        "arity": 0,
        "kind": "function",
        "strict": false,
        "async": false,
        "parent": null,
        "start": 3_630_759,
        "end": 3_631_048,
        "descriptionStart": 3_630_759,
        "bytes": 289,
        "sha256": "5c54461660a55a0ae1d700f28e47458a8e5130cc6c7b0461aa387a068fdda152",
        "lineNumber": 3605,
        "columnNumber": 2652
      },
      "method": {
        "name": "getDeviceByUuid",
        "arity": 2,
        "kind": "method",
        "strict": true,
        "async": false,
        "parent": null,
        "start": 5_545_093,
        "end": 5_545_686,
        "descriptionStart": 5_545_093,
        "bytes": 593,
        "sha256": "11cd525a647630d02c0c03600d4b40cb520b5ff6259f48ea2641d2df5e68003d",
        "lineNumber": 3673,
        "columnNumber": 232_931
      },
      "handler": {
        "name": "-getDeviceByUuid",
        "arity": 1,
        "kind": "function",
        "strict": false,
        "async": true,
        "parent": null,
        "start": 6_163_351,
        "end": 6_163_435,
        "descriptionStart": 6_163_351,
        "bytes": 84,
        "sha256": "62a0fcdff030cc2a17a92c582c73fbf507d44c42a9a5ae05f037b1146b8bad45",
        "lineNumber": 3831,
        "columnNumber": 2507
      }
    },
    "links": [
      {
        "start": 5_770_270,
        "text": "Z=Lx()"
      }
    ]
  },
  {
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch.js",
    "bytes": 6_472_538,
    "sha256": "b88ad265bb2bc7febb90af92a6f37189b3f90be7cd1f1427522c8f2435dfb4bd",
    "methods": {
      "iterator": {
        "name": "V",
        "arity": 2,
        "kind": "function",
        "strict": false,
        "async": false,
        "parent": null,
        "start": 1_325_915,
        "end": 1_326_130,
        "descriptionStart": 1_325_915,
        "bytes": 215,
        "sha256": "a4137ea1ab5e11b08b7e04347b14f0ccd835ddf8c93fa2e1324b4e0aa1e87ac5",
        "lineNumber": 532,
        "columnNumber": 4475
      },
      "method": {
        "name": "getDeviceByUuid",
        "arity": 2,
        "kind": "method",
        "strict": true,
        "async": false,
        "parent": null,
        "start": 4_095_418,
        "end": 4_096_011,
        "descriptionStart": 4_095_418,
        "bytes": 593,
        "sha256": "e028692bc78f8588a6219826d2edf74202acc326e244adfacb9acaaf486fc5ac",
        "lineNumber": 4105,
        "columnNumber": 86_816
      },
      "handler": {
        "name": "-getDeviceByUuid",
        "arity": 1,
        "kind": "function",
        "strict": false,
        "async": true,
        "parent": null,
        "start": 6_155_021,
        "end": 6_155_105,
        "descriptionStart": 6_155_021,
        "bytes": 84,
        "sha256": "62a0fcdff030cc2a17a92c582c73fbf507d44c42a9a5ae05f037b1146b8bad45",
        "lineNumber": 4329,
        "columnNumber": 2507
      },
      "factory": {
        "name": "Gx",
        "arity": 0,
        "kind": "function",
        "strict": false,
        "async": false,
        "parent": null,
        "start": 6_383_483,
        "end": 6_383_772,
        "descriptionStart": 6_383_483,
        "bytes": 289,
        "sha256": "30d8b998ffcd2d5ce09f6d9f570365ff89ce8361ece09bcfb9d0b2a988f72c62",
        "lineNumber": 4331,
        "columnNumber": 179_276
      }
    },
    "links": [
      {
        "start": 6_413_738,
        "text": "Z=Gx()"
      }
    ]
  }
] as const);
export type CurrentFootprintInverseSchematicReferenceRole = keyof typeof CURRENT_FOOTPRINT_INVERSE_SCHEMATIC_REFERENCE_SOURCE[0]["methods"];
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_SCHEMATIC_REFERENCE_SOURCE"); } }
export function qualifyCurrentFootprintInverseSchematicReferenceSource(source: string, variant: 0 | 1): void {
  const pin = CURRENT_FOOTPRINT_INVERSE_SCHEMATIC_REFERENCE_SOURCE[variant]; need(Buffer.byteLength(source) === pin.bytes && createHash("sha256").update(source).digest("hex") === pin.sha256);
  for (const role of ["handler", "method", "iterator", "factory"] as const) { const row = pin.methods[role]; const text = source.slice(row.descriptionStart, row.end); need(Buffer.byteLength(text) === row.bytes && createHash("sha256").update(text).digest("hex") === row.sha256); }
  for (const link of pin.links) { need(source.slice(link.start, link.start + link.text.length) === link.text); }
}
export function requireCurrentFootprintInverseSchematicReferenceDescription(text: string, variant: 0 | 1, role: CurrentFootprintInverseSchematicReferenceRole): void {
  const row = CURRENT_FOOTPRINT_INVERSE_SCHEMATIC_REFERENCE_SOURCE[variant].methods[role]; need(Buffer.byteLength(text) === row.bytes && createHash("sha256").update(text).digest("hex") === row.sha256);
}
export function qualifyCurrentFootprintInverseSchematicReferenceFunction(input: unknown, variant: 0 | 1, role: CurrentFootprintInverseSchematicReferenceRole, scriptId: string): string {
  return qualifyCurrentFootprintSourceFunctionMetadata(input, CURRENT_FOOTPRINT_INVERSE_SCHEMATIC_REFERENCE_SOURCE[variant].methods[role], scriptId);
}
