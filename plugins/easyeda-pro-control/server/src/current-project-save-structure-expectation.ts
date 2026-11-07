/** Source-derived metadata only. Native request/grant ownership and complete
 * SQL must be joined separately; a matching tree grants no continuation. */
import { z } from "zod";
import { assertOriginalGeneratedFixtureOpenCheckpoint } from "./managed-fixture-generated-open-checkpoint.ts";
import type { GeneratedFixtureOpenCheckpoint } from "./managed-fixture-generated-open-checkpoint.ts";
import { assertOriginalGeneratedSchematicFixtureOpenCheckpoint } from "./managed-schematic-fixture-open-checkpoint.ts";
import type { GeneratedSchematicFixtureOpenCheckpoint } from "./managed-schematic-fixture-open-checkpoint.ts";
import { assertOriginalGeneratedSchematicRelevanceFixtureOpenCheckpoint } from "./managed-schematic-relevance-fixture-open-checkpoint.ts";
import type { GeneratedSchematicRelevanceFixtureOpenCheckpoint } from "./managed-schematic-relevance-fixture-open-checkpoint.ts";
import type { NativeDocumentSnapshot } from "./native-history.ts";

const initialHead = z.looseObject({ version: z.string().min(1).max(128), updateTime: z.number().int().positive().max(8_640_000_000_000_000) });
function time(document: NativeDocumentSnapshot, clock: number): Readonly<{ version: string; updateTime: number }> {
  const old = initialHead.parse(document.metadata); return clock > old.updateTime ? { version: String(clock), updateTime: clock } : { version: old.version, updateTime: old.updateTime };
}
/** Native nr.{pcb,schematic,sheet}, ar.setEditData and Lg.onHeadChange in the exact
 * full worker source determine every field here. PCB META does not copy zIndex
 * or docType; JSON omits them. SCH_PAGE updates its real parent as well. */
export function expectedCurrentGeneratedProjectSaveStructure(prepared: GeneratedFixtureOpenCheckpoint | GeneratedSchematicFixtureOpenCheckpoint | GeneratedSchematicRelevanceFixtureOpenCheckpoint, clockInput: number): string {
  const clock = z.number().int().positive().max(8_640_000_000_000_000).parse(clockInput);
  if (prepared.profile === "easyeda-pro-control.generated-fixture-open-checkpoint.v1") { assertOriginalGeneratedFixtureOpenCheckpoint(prepared); }
  else if (prepared.profile === "easyeda-pro-control.generated-schematic-relevance-fixture-open-checkpoint.v1") { assertOriginalGeneratedSchematicRelevanceFixtureOpenCheckpoint(prepared); }
  else { assertOriginalGeneratedSchematicFixtureOpenCheckpoint(prepared); }
  const raw = prepared.qualification.target.rawWindowsPath; const owner = { uuid: `${raw.slice(0, raw.lastIndexOf("\\"))}/`, username: "", nickname: "" };
  if (prepared.profile === "easyeda-pro-control.generated-fixture-open-checkpoint.v1") {
    const target = prepared.qualification.target; const document = prepared.history.documents[0];
    if (prepared.history.documents.length !== 1 || document?.uuid !== target.documentUuid || document.docType !== "PCB") { throw new Error("PROJECT_SAVE_STRUCTURE_PCB_BASELINE"); }
    return JSON.stringify({ boards: {}, schematics: {}, sheets: {}, pcbs: { [document.uuid]: { uuid: document.uuid, title: "PCB1", board: "", parent_uuid: "", source: "", ...time(document, clock) } },
      panels: {}, blockSymbols: {}, owner });
  }
  const target = prepared.qualification.target; const parent = prepared.history.documents.find(document => document.uuid === target.schematicUuid); const page = prepared.history.documents.find(document => document.uuid === target.pageUuid);
  if (prepared.history.documents.length !== 2 || parent?.docType !== "SCH" || page?.docType !== "SCH_PAGE") { throw new Error("PROJECT_SAVE_STRUCTURE_SCH_BASELINE"); }
  return JSON.stringify({ boards: {}, schematics: { [parent.uuid]: { uuid: parent.uuid, name: "Schematic1", board: "", source: "", ...time(parent, clock) } },
    sheets: { [page.uuid]: { uuid: page.uuid, title: "Sheet1", schematic_uuid: parent.uuid, zIndex: 1, source: "", ...time(page, clock) } },
    pcbs: {}, panels: {}, blockSymbols: {}, owner });
}
