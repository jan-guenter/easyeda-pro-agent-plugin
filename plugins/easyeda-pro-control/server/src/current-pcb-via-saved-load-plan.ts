/** Private expected cold-load data from the genuine complete saved/closed SQL
 * checkpoint. This cannot issue a worker, resume, fetch or opening grant. */
import { deriveGeneratedSavedHistoryLoadData as deriveSavedLoadData } from "./current-generated-saved-history-load-data.ts";
import type { GeneratedSavedHistoryLoadData } from "./current-generated-saved-history-load-data.ts";
import { canonicalJson } from "./core.ts";
import { requireOriginalCurrentPcbViaWriteClosedCheckpoint, verifyCurrentPcbViaWriteClosedCheckpoint } from "./current-pcb-via-write-closed-checkpoint.ts";
import type { CurrentPcbViaWriteClosedCheckpoint } from "./current-pcb-via-write-closed-checkpoint.ts";
import { requireOriginalCurrentPcbViaWriteClosedSnapshot } from "./current-pcb-via-write-closed-snapshot.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { NativeSqlInventory } from "./sqlite-inventory-core.ts";

export interface CurrentPcbViaSavedLoadPlan { readonly profile: "private.current-pcb-via-saved-load-plan.v1" }
export type CurrentPcbViaSavedLoadData = GeneratedSavedHistoryLoadData;
interface Original { readonly prepared: CurrentPcbViaWriteClosedCheckpoint; readonly inventory: NativeSqlInventory; readonly data: CurrentPcbViaSavedLoadData; readonly text: string }
const issued = new WeakMap<CurrentPcbViaSavedLoadPlan, Original>();
const pending = new WeakMap<CurrentPcbViaWriteClosedCheckpoint, Promise<CurrentPcbViaSavedLoadPlan>>();
function need(value: boolean): asserts value { if (!value) { throw new Error("PCB_VIA_SAVED_LOAD_PLAN"); } }
function originalInventory(prepared: CurrentPcbViaWriteClosedCheckpoint): NativeSqlInventory {
  const original = requireOriginalCurrentPcbViaWriteClosedCheckpoint(prepared); const closed = requireOriginalCurrentPcbViaWriteClosedSnapshot(original.snapshot, original.owner, original.plan);
  const status = original.owner.status(); need(status.released && status.helperClosed && closed.inventory.checkpointSha256 === prepared.target.sourceSha256 && closed.inventory.logicalSha256 === prepared.vacuumProjection.sourceLogicalSha256);
  readerCompletion(closed.inventory); return closed.inventory;
}
export function prepareCurrentPcbViaSavedLoadPlan(prepared: CurrentPcbViaWriteClosedCheckpoint): Promise<CurrentPcbViaSavedLoadPlan> {
  const inventory = originalInventory(prepared), previous = pending.get(prepared); if (previous !== undefined) { return previous; }
  const current = (): void => { need(originalInventory(prepared) === inventory); };
  const promise = (async (): Promise<CurrentPcbViaSavedLoadPlan> => {
    await verifyCurrentPcbViaWriteClosedCheckpoint(prepared); current(); const data = await deriveSavedLoadData(inventory, prepared.target); current();
    await verifyCurrentPcbViaWriteClosedCheckpoint(prepared); current(); const plan: CurrentPcbViaSavedLoadPlan = Object.freeze({ profile: "private.current-pcb-via-saved-load-plan.v1" });
    issued.set(plan, Object.freeze({ prepared, inventory, data, text: canonicalJson(data) })); return plan;
  })(); pending.set(prepared, promise); return promise;
}
export function requireOriginalCurrentPcbViaSavedLoadPlan(plan: CurrentPcbViaSavedLoadPlan, prepared: CurrentPcbViaWriteClosedCheckpoint): CurrentPcbViaSavedLoadData {
  const original = issued.get(plan); need(original !== undefined && original.prepared === prepared && originalInventory(prepared) === original.inventory && original.text === canonicalJson(original.data)); return original.data;
}
