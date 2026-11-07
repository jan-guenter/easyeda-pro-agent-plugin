/** Cold-load expectations from the original complete schematic closed SQL.
 * This does not create a replacement generation, worker or cache permission. */
import { canonicalJson } from "./core.ts";
import { deriveGeneratedSavedHistoryLoadData } from "./current-generated-saved-history-load-data.ts";
import type { GeneratedSavedHistoryLoadData } from "./current-generated-saved-history-load-data.ts";
import { requireOriginalGeneratedSchematicRelevanceDisplayClosedCheckpoint, verifyGeneratedSchematicRelevanceDisplayClosedCheckpoint } from "./generated-schematic-relevance-display-closed-checkpoint.ts";
import type { GeneratedSchematicRelevanceDisplayClosedCheckpoint } from "./generated-schematic-relevance-display-closed-checkpoint.ts";
import { requireOriginalGeneratedSchematicRelevanceDisplayClosedSnapshot } from "./generated-schematic-relevance-display-closed-snapshot.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { NativeSqlInventory } from "./sqlite-inventory-core.ts";

export interface GeneratedSchematicRelevanceSavedLoadPlan { readonly profile: "private.generated-schematic-relevance-saved-load-plan.v1" }
export interface GeneratedSchematicRelevanceSavedLoadData extends GeneratedSavedHistoryLoadData {
  readonly schema: "private.generated-schematic-relevance-saved-load-data.v1";
  readonly schematicUuid: string;
}
interface Original { readonly prepared: GeneratedSchematicRelevanceDisplayClosedCheckpoint; readonly inventory: NativeSqlInventory; readonly data: GeneratedSchematicRelevanceSavedLoadData; readonly text: string }
const issued = new WeakMap<GeneratedSchematicRelevanceSavedLoadPlan, Original>();
const pending = new WeakMap<GeneratedSchematicRelevanceDisplayClosedCheckpoint, Promise<GeneratedSchematicRelevanceSavedLoadPlan>>();
function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_RELEVANCE_SAVED_LOAD_PLAN"); } }
function originalInventory(prepared: GeneratedSchematicRelevanceDisplayClosedCheckpoint): NativeSqlInventory {
  const original = requireOriginalGeneratedSchematicRelevanceDisplayClosedCheckpoint(prepared);
  const closed = requireOriginalGeneratedSchematicRelevanceDisplayClosedSnapshot(original.snapshot, original.owner), status = original.owner.status();
  need(status.released && status.helperClosed && closed.inventory.checkpointSha256 === prepared.target.sourceSha256 && closed.inventory.logicalSha256 === prepared.vacuumProjection.sourceLogicalSha256);
  readerCompletion(closed.inventory); return closed.inventory;
}
export function prepareGeneratedSchematicRelevanceSavedLoadPlan(prepared: GeneratedSchematicRelevanceDisplayClosedCheckpoint): Promise<GeneratedSchematicRelevanceSavedLoadPlan> {
  const inventory = originalInventory(prepared), prior = pending.get(prepared); if (prior !== undefined) { return prior; }
  const current = (): void => { need(originalInventory(prepared) === inventory); };
  const promise = (async (): Promise<GeneratedSchematicRelevanceSavedLoadPlan> => {
    await verifyGeneratedSchematicRelevanceDisplayClosedCheckpoint(prepared); current();
    const observed = await deriveGeneratedSavedHistoryLoadData(inventory, { ...prepared.target, documentUuid: prepared.target.pageUuid }); current();
    const data: GeneratedSchematicRelevanceSavedLoadData = Object.freeze({ ...observed, schema: "private.generated-schematic-relevance-saved-load-data.v1", schematicUuid: prepared.target.schematicUuid });
    await verifyGeneratedSchematicRelevanceDisplayClosedCheckpoint(prepared); current();
    const plan: GeneratedSchematicRelevanceSavedLoadPlan = Object.freeze({ profile: "private.generated-schematic-relevance-saved-load-plan.v1" });
    issued.set(plan, Object.freeze({ prepared, inventory, data, text: canonicalJson(data) })); return plan;
  })(); pending.set(prepared, promise); return promise;
}
export function requireOriginalGeneratedSchematicRelevanceSavedLoadPlan(plan: GeneratedSchematicRelevanceSavedLoadPlan, prepared: GeneratedSchematicRelevanceDisplayClosedCheckpoint): GeneratedSchematicRelevanceSavedLoadData {
  const original = issued.get(plan); need(original !== undefined && original.prepared === prepared && originalInventory(prepared) === original.inventory && original.text === canonicalJson(original.data)); return original.data;
}
