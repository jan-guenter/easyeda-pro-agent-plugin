/** A new saved-reader preparation from the genuine completed closed lifecycle.
 * This retains historical data and never allocates or transfers an owner. */
import { canonicalJson } from "./core.ts";
import { requireOriginalGeneratedSchematicRelevanceClosedLifecycle } from "./generated-schematic-relevance-closed-lifecycle.ts";
import type { GeneratedSchematicRelevanceClosedLifecycle } from "./generated-schematic-relevance-closed-lifecycle.ts";
import { verifyGeneratedSchematicRelevanceDisplayClosedCheckpoint } from "./generated-schematic-relevance-display-closed-checkpoint.ts";
import type { GeneratedSchematicRelevanceDisplayClosedCheckpoint } from "./generated-schematic-relevance-display-closed-checkpoint.ts";
import { requireOriginalGeneratedSchematicRelevanceSavedLoadPlan } from "./generated-schematic-relevance-saved-load-plan.ts";
import type { GeneratedSchematicRelevanceSavedLoadData } from "./generated-schematic-relevance-saved-load-plan.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export interface GeneratedSchematicRelevanceSavedReadbackPlan { readonly profile: "private.generated-schematic-relevance-saved-readback-plan.v1" }
export interface GeneratedSchematicRelevanceSavedReadbackData {
  readonly schema: "private.generated-schematic-relevance-saved-readback-data.v1";
  readonly operationId: string;
  readonly target: GeneratedSchematicRelevanceDisplayClosedCheckpoint["target"];
  readonly loading: GeneratedSchematicRelevanceSavedLoadData;
  readonly cacheNamespaces: readonly [string, string];
  readonly sourceRecordCount: 7; readonly persistentPeerCount: 6; readonly endpointMarkerCount: 2;
  readonly originalWriterAndHelperClosed: true; readonly completeOriginalClosedSqlVerified: true;
  readonly readerAllocated: false; readonly cacheMutationAuthorized: false; readonly freshOpeningAuthorized: false;
  readonly originalNativeHandlesTransferred: false; readonly reopenedVerified: false; readonly executionAuthorized: false;
}
interface Original {
  readonly lifecycle: GeneratedSchematicRelevanceClosedLifecycle;
  readonly closed: ReturnType<typeof requireOriginalGeneratedSchematicRelevanceClosedLifecycle>;
  readonly data: GeneratedSchematicRelevanceSavedReadbackData; readonly text: string;
}
const issued = new WeakMap<GeneratedSchematicRelevanceSavedReadbackPlan, Original>();
const attempts = new WeakMap<GeneratedSchematicRelevanceClosedLifecycle, Promise<GeneratedSchematicRelevanceSavedReadbackPlan>>();
function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_RELEVANCE_SAVED_READBACK_ORIGINAL_PLAN"); } }
function original(lifecycle: GeneratedSchematicRelevanceClosedLifecycle): ReturnType<typeof requireOriginalGeneratedSchematicRelevanceClosedLifecycle> {
  const closed = requireOriginalGeneratedSchematicRelevanceClosedLifecycle(lifecycle), status = closed.owner.status();
  need(status.released && status.helperClosed && closed.args.operation.peers.length === 6 && closed.args.operation.rootIds.length === 3);
  const loading = requireOriginalGeneratedSchematicRelevanceSavedLoadPlan(closed.loadPlan, closed.checkpoint);
  need(loading.projectUuid === closed.checkpoint.target.projectUuid && loading.documentUuid === closed.checkpoint.target.pageUuid && loading.schematicUuid === closed.checkpoint.target.schematicUuid);
  return closed;
}
/** One preparation per original lifecycle, including retention of its failure.
 * An original source/checkpoint reproof brackets the immutable plan creation. */
export function prepareGeneratedSchematicRelevanceSavedReadbackPlan(lifecycle: GeneratedSchematicRelevanceClosedLifecycle): Promise<GeneratedSchematicRelevanceSavedReadbackPlan> {
  const closed = original(lifecycle), prior = attempts.get(lifecycle); if (prior !== undefined) { return prior; }
  const current = (): void => { need(original(lifecycle) === closed); };
  const pending = (async (): Promise<GeneratedSchematicRelevanceSavedReadbackPlan> => {
    await verifyGeneratedSchematicRelevanceDisplayClosedCheckpoint(closed.checkpoint); current();
    const loading = requireOriginalGeneratedSchematicRelevanceSavedLoadPlan(closed.loadPlan, closed.checkpoint), project = closed.checkpoint.target.projectUuid;
    const data: GeneratedSchematicRelevanceSavedReadbackData = freezeDeep({ schema: "private.generated-schematic-relevance-saved-readback-data.v1", operationId: closed.args.operation.operationId,
      target: structuredClone(closed.checkpoint.target), loading, cacheNamespaces: [`project_${project}_v6`, `localProject_${project}_v1`],
      sourceRecordCount: 7, persistentPeerCount: 6, endpointMarkerCount: 2, originalWriterAndHelperClosed: true, completeOriginalClosedSqlVerified: true,
      readerAllocated: false, cacheMutationAuthorized: false, freshOpeningAuthorized: false, originalNativeHandlesTransferred: false, reopenedVerified: false, executionAuthorized: false });
    await verifyGeneratedSchematicRelevanceDisplayClosedCheckpoint(closed.checkpoint); current();
    const plan: GeneratedSchematicRelevanceSavedReadbackPlan = Object.freeze({ profile: "private.generated-schematic-relevance-saved-readback-plan.v1" });
    issued.set(plan, Object.freeze({ lifecycle, closed, data, text: canonicalJson(data) })); return plan;
  })(); attempts.set(lifecycle, pending); return pending;
}
/** Data and original historical references only. A later separately admitted
 * native factory must create its own runtime and all cache/opening receipts. */
export function requireOriginalGeneratedSchematicRelevanceSavedReadbackPlan(plan: GeneratedSchematicRelevanceSavedReadbackPlan): Readonly<{
  lifecycle: GeneratedSchematicRelevanceClosedLifecycle; closed: Original["closed"]; data: GeneratedSchematicRelevanceSavedReadbackData;
}> {
  const retained = issued.get(plan); need(retained !== undefined && original(retained.lifecycle) === retained.closed && retained.text === canonicalJson(retained.data));
  return Object.freeze({ lifecycle: retained.lifecycle, closed: retained.closed, data: retained.data });
}
