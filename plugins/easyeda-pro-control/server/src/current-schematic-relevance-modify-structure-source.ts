/** Source-only dependencies reached by the ready-state suppression predicate.
 * The original worker/source and held frames still require private custody. */
import { createHash } from "node:crypto";
import { CURRENT_GENERATED_INITIAL_SYNC_CALLEES } from "./current-generated-initial-sync-source.ts";
import { qualifyCurrentProjectSaveStructureSource } from "./current-project-save-structure-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const readOnly = CURRENT_GENERATED_INITIAL_SYNC_CALLEES[0];
if (readOnly === undefined) { throw new Error("SCH_MODIFY_STRUCTURE_READONLY_SOURCE"); }
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_STRUCTURE_SOURCE = freezeDeep({
  readOnly,
  v2: { name: "get isV2Format", arity: 0, async: false, regular: false, lineNumber: 109, columnNumber: 165_360,
    start: 2_012_659, end: 2_012_700, source: "get isV2Format(){return this._isV2Format}" },
  onChange: { start: 2_105_542, end: 2_107_140, bytes: 1598, sha256: "44bfca1afed5a3f24c30767ac3b7a0235fc8fd92808eb604564f98cee1424c9e", lineNumber: 110, columnNumber: 91_332 },
  serial: { lineNumber: 108, columnNumber: 145_602 },
  initial: { lineNumber: 108, columnNumber: 145_700, start: 1_847_196, end: 1_847_240 },
} as const);
/** Recheck the complete worker before using the getter's fixed location and
 * the actual onChange caller. No getter or application body is invoked here. */
export function qualifyCurrentSchematicRelevanceModifyStructureSource(input: string): void {
  qualifyCurrentProjectSaveStructureSource(input);
  const source = CURRENT_SCHEMATIC_RELEVANCE_MODIFY_STRUCTURE_SOURCE;
  const caller = input.slice(source.onChange.start, source.onChange.end);
  if (input.slice(source.v2.start, source.v2.end) !== source.v2.source || Buffer.byteLength(caller) !== source.onChange.bytes || createHash("sha256").update(caller).digest("hex") !== source.onChange.sha256) { throw new Error("SCH_MODIFY_STRUCTURE_SOURCE"); }
}
