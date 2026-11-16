/** Complete original annotation factory/caller data. No observer or owner is issued. */
import { createHash } from "node:crypto";
import { captureCurrentSchematicDisplayAccessorSource as capture } from "./current-schematic-display-accessor-replies.ts";
import { compareCurrentSchematicWireFunctionMetadata as compare, qualifyCurrentSchematicWireCompletionSource as qualify } from "./current-schematic-wire-completion-source.ts";
import type { CurrentSchematicWireCompletionFunction } from "./current-schematic-wire-completion-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_WIRE_ANNOTATION_ABSENCE_SOURCE = freezeDeep([
  {
    "variant": 0,
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch-main.js",
    "rows": {
      "factory": {
        "start": 3_682_685,
        "end": 3_682_779,
        "bytes": 94,
        "sha256": "69ec4d7cff82eb0d9b7c0e7cce07ca15a10a4a12d49fd7ad1943b7816e502936",
        "lineNumber": 3606,
        "columnNumber": 15_813,
        "name": "u0e",
        "arity": 1,
        "constructible": true,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "form": "declaration"
      },
      "openCanvas": {
        "start": 5_372_834,
        "end": 5_373_094,
        "bytes": 260,
        "sha256": "48b79f7914613c8ed381cf18202e6e371cbdad32dccc188e56944b5d5ff16871",
        "lineNumber": 3673,
        "columnNumber": 60_667,
        "name": "openCanvas",
        "arity": 2,
        "constructible": false,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "form": "method"
      },
      "register": {
        "start": 325_424,
        "end": 325_703,
        "bytes": 279,
        "sha256": "86f05a168bffe4ad38bbcfa613b2332634818fda392aad4282ffb0b1c090b399",
        "lineNumber": 6,
        "columnNumber": 27_394,
        "name": "register",
        "arity": 1,
        "constructible": false,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "form": "method"
      }
    },
    "factoryAlias": "u0e",
    "privateAlias": "No"
  },
  {
    "variant": 1,
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch.js",
    "rows": {
      "factory": {
        "start": 2_086_344,
        "end": 2_086_438,
        "bytes": 94,
        "sha256": "46bde459a3f7cab00e5cd6a7c2b1a08f80407a34a1c5329a2018d5d00f5a3e13",
        "lineNumber": 557,
        "columnNumber": 173_259,
        "name": "Ede",
        "arity": 1,
        "constructible": true,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "form": "declaration"
      },
      "openCanvas": {
        "start": 5_671_840,
        "end": 5_672_100,
        "bytes": 260,
        "sha256": "d9b935fcb53ac4c9fbe93965505421598bf77468cb27d26f30d04817021b967c",
        "lineNumber": 4191,
        "columnNumber": 65_767,
        "name": "openCanvas",
        "arity": 2,
        "constructible": false,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "form": "method"
      },
      "register": {
        "start": 1_348_836,
        "end": 1_349_115,
        "bytes": 279,
        "sha256": "2cbcd42cc155af5cca472f57c1b1f6b36a748652d60185763b2562b84d6210f3",
        "lineNumber": 532,
        "columnNumber": 27_394,
        "name": "register",
        "arity": 1,
        "constructible": false,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "form": "method"
      }
    },
    "factoryAlias": "Ede",
    "privateAlias": "Bo"
  }
] as const);
export type CurrentSchematicWireAnnotationAbsenceRole = keyof typeof CURRENT_SCHEMATIC_WIRE_ANNOTATION_ABSENCE_SOURCE[0]["rows"];
/** Qualify the whole installed source before all three complete original spans. */
export function qualifyCurrentSchematicWireAnnotationAbsenceSource(input: unknown): 0 | 1 {
  const variant = qualify(input); const raw = capture(input);
  const rows: Readonly<Record<CurrentSchematicWireAnnotationAbsenceRole, Readonly<{ start: number; end: number; bytes: number; sha256: string }>>> = CURRENT_SCHEMATIC_WIRE_ANNOTATION_ABSENCE_SOURCE[variant].rows;
  for (const row of Object.values(rows)) { const text = raw.scriptSource.slice(row.start, row.end); if (Buffer.byteLength(text) !== row.bytes || createHash("sha256").update(text).digest("hex") !== row.sha256) { throw new Error("SCHEMATIC_WIRE_ANNOTATION_ABSENCE_SOURCE"); } }
  return variant;
}
/** Compare complete text plus actual own, script and function-PC metadata. */
export function decodeCurrentSchematicWireAnnotationAbsenceFunction(input: unknown, actual: unknown, variant: 0 | 1, role: CurrentSchematicWireAnnotationAbsenceRole, scriptId: string): CurrentSchematicWireCompletionFunction {
  if ((variant !== 0 && variant !== 1) || Object.is(variant, -0)) { throw new Error("SCHEMATIC_WIRE_ANNOTATION_ABSENCE_VARIANT"); }
  return compare(input, actual, CURRENT_SCHEMATIC_WIRE_ANNOTATION_ABSENCE_SOURCE[variant].rows[role], scriptId);
}
