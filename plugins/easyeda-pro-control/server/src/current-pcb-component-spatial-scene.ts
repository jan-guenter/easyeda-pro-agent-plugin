/** Data binding from the genuine new baseline only. These IDs alone grant no
 * process, renderer, callback, cache, hit, writer or persistence authority. */
import { canonicalJson } from "./core.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { assertOriginalGeneratedComponentFixtureOpenCheckpoint } from "./managed-component-fixture-generated-open-checkpoint.ts";
import type { GeneratedComponentFixtureOpenCheckpoint } from "./managed-component-fixture-generated-open-checkpoint.ts";

export interface CurrentPcbComponentSpatialScene {
  readonly schema: "private.pcb209-generated-component-scene.v1";
  readonly projectUuid: string; readonly documentUuid: string; readonly footprintUuid: string;
  readonly componentId: string; readonly padId: string; readonly ownedPadId: string;
  readonly footprintAttrId: string; readonly designatorAttrId: string; readonly placedFootprintAttrId: string; readonly placedDesignatorAttrId: string;
}
const issued = new WeakMap<CurrentPcbComponentSpatialScene, Readonly<{ prepared: GeneratedComponentFixtureOpenCheckpoint; text: string }>>();
export function buildCurrentPcbComponentSpatialScene(prepared: GeneratedComponentFixtureOpenCheckpoint): CurrentPcbComponentSpatialScene {
  assertOriginalGeneratedComponentFixtureOpenCheckpoint(prepared); const qualification = prepared.qualification;
  const page = prepared.history.documents.find(doc => doc.docType === "PCB" && doc.uuid === qualification.target.documentUuid);
  const footprint = prepared.history.documents.find(doc => doc.docType === "FOOTPRINT" && doc.uuid === qualification.footprintUuid);
  if (page === undefined || footprint === undefined || prepared.history.documents.length !== 2) { throw new Error("COMPONENT_SCENE_DOCUMENTS"); }
  const attr = (records: typeof page.records, key: "Footprint" | "Designator"): string => {
    const rows = records.filter(row => row.type === "ATTR" && row.body["key"] === key); if (rows.length !== 1 || rows[0] === undefined) { throw new Error("COMPONENT_SCENE_ATTRIBUTES"); } return rows[0].id;
  };
  const pads = footprint.records.filter(row => row.type === "PAD"); const padId = pads[0]?.id;
  if (pads.length !== 1 || padId === undefined || qualification.ownedPadId !== qualification.componentId + padId) { throw new Error("COMPONENT_SCENE_PAD"); }
  const result: CurrentPcbComponentSpatialScene = freezeDeep({ schema: "private.pcb209-generated-component-scene.v1", projectUuid: qualification.target.projectUuid,
    documentUuid: qualification.target.documentUuid, footprintUuid: qualification.footprintUuid, componentId: qualification.componentId, padId, ownedPadId: qualification.ownedPadId,
    footprintAttrId: attr(footprint.records, "Footprint"), designatorAttrId: attr(footprint.records, "Designator"), placedFootprintAttrId: attr(page.records, "Footprint"), placedDesignatorAttrId: attr(page.records, "Designator") });
  issued.set(result, { prepared, text: canonicalJson(result) }); return result;
}
export function requireOriginalCurrentPcbComponentSpatialScene(value: CurrentPcbComponentSpatialScene, prepared: GeneratedComponentFixtureOpenCheckpoint): void {
  const original = issued.get(value); if (original === undefined || original.prepared !== prepared || original.text !== canonicalJson(value)) { throw new Error("COMPONENT_SCENE_ORIGINAL"); }
  assertOriginalGeneratedComponentFixtureOpenCheckpoint(prepared);
}
