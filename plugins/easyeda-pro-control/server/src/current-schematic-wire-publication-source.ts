/** Original GROUP publication listeners. Their exact bytes and PCs prove
 * comparison data, without history, worker or Save completion authority. */
import { createHash } from "node:crypto";
import { captureCurrentSchematicDisplayAccessorSource } from "./current-schematic-display-accessor-replies.ts";
import { compareCurrentSchematicWireFunctionMetadata, qualifyCurrentSchematicWireCompletionSource } from "./current-schematic-wire-completion-source.ts";
import type { CurrentSchematicWireCompletionFunction } from "./current-schematic-wire-completion-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_WIRE_PUBLICATION_SOURCE = freezeDeep([
  {
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch-main.js",
    "rows": {
      "historyBusStart": {
        "start": 4_407_327,
        "end": 4_407_361,
        "bytes": 34,
        "sha256": "5b40f8ef8b15307087b0a7c13444f51d751f80d0a2277f9c070bcef643b9b784",
        "lineNumber": 3613,
        "columnNumber": 93_712,
        "name": "",
        "arity": 0,
        "constructible": false,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "form": "expression"
      },
      "historyBusEnd": {
        "start": 4_407_419,
        "end": 4_407_450,
        "bytes": 31,
        "sha256": "ed7822c6b383753826ea71319fe258fcdb384da5145cda70ae3f4e72bb176023",
        "lineNumber": 3613,
        "columnNumber": 93_804,
        "name": "",
        "arity": 0,
        "constructible": false,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "form": "expression"
      }
    }
  },
  {
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch.js",
    "rows": {
      "historyBusStart": {
        "start": 4_630_096,
        "end": 4_630_130,
        "bytes": 34,
        "sha256": "5b40f8ef8b15307087b0a7c13444f51d751f80d0a2277f9c070bcef643b9b784",
        "lineNumber": 4112,
        "columnNumber": 91_120,
        "name": "",
        "arity": 0,
        "constructible": false,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "form": "expression"
      },
      "historyBusEnd": {
        "start": 4_630_188,
        "end": 4_630_219,
        "bytes": 31,
        "sha256": "ed7822c6b383753826ea71319fe258fcdb384da5145cda70ae3f4e72bb176023",
        "lineNumber": 4112,
        "columnNumber": 91_212,
        "name": "",
        "arity": 0,
        "constructible": false,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "form": "expression"
      }
    }
  }
] as const);
export type CurrentSchematicWirePublicationRole = keyof typeof CURRENT_SCHEMATIC_WIRE_PUBLICATION_SOURCE[0]["rows"];
/** Qualify the whole original source before both actual publication spans. */
export function qualifyCurrentSchematicWirePublicationSource(input: unknown): 0 | 1 {
  const variant = qualifyCurrentSchematicWireCompletionSource(input); const raw = captureCurrentSchematicDisplayAccessorSource(input);
  const spans: Readonly<Record<CurrentSchematicWirePublicationRole, { readonly start: number; readonly end: number; readonly bytes: number; readonly sha256: string }>> = CURRENT_SCHEMATIC_WIRE_PUBLICATION_SOURCE[variant].rows;
  for (const row of Object.values(spans)) {
    const text = raw.scriptSource.slice(row.start, row.end);
    if (Buffer.byteLength(text) !== row.bytes || createHash("sha256").update(text).digest("hex") !== row.sha256) { throw new Error("SCHEMATIC_WIRE_PUBLICATION_SOURCE"); }
  }
  return variant;
}
/** The closed role selects its fixed source/name/arity/location comparison. */
export function decodeCurrentSchematicWirePublicationFunction(input: unknown, actual: unknown, variant: 0 | 1, role: CurrentSchematicWirePublicationRole, scriptId: string): CurrentSchematicWireCompletionFunction {
  if ((variant !== 0 && variant !== 1) || Object.is(variant, -0)) { throw new Error("SCHEMATIC_WIRE_PUBLICATION_VARIANT"); }
  return compareCurrentSchematicWireFunctionMetadata(input, actual, CURRENT_SCHEMATIC_WIRE_PUBLICATION_SOURCE[variant].rows[role], scriptId);
}
