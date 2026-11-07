/** Original drained Save to complete closed SQL/checkpoint/cold data. This
 * historical composition does not allocate or authorize a replacement owner. */
import { assertOriginalCurrentSchematicRelevanceDisplayWriteTermination, requireOriginalCurrentSchematicRelevanceDisplaySaveDrained } from "./current-pcb-diagnostic-owner.ts";
import type { CurrentSchematicRelevanceDisplaySaveDrained } from "./current-schematic-relevance-display-save-drained.ts";
import type { CurrentSchematicRelevanceDisplayWriteOwner } from "./current-schematic-relevance-display-write-owner.ts";
import { requireOriginalGeneratedSchematicRelevanceDisplayClosedSnapshot } from "./generated-schematic-relevance-display-closed-snapshot.ts";
import type { GeneratedSchematicRelevanceDisplayClosedSnapshot } from "./generated-schematic-relevance-display-closed-snapshot.ts";
import { qualifyOriginalGeneratedSchematicRelevanceDisplayClosedSql, requireOriginalGeneratedSchematicRelevanceDisplayClosedSql } from "./generated-schematic-relevance-display-closed-proof.ts";
import type { GeneratedSchematicRelevanceDisplayClosedSqlProof } from "./generated-schematic-relevance-display-closed-proof.ts";
import { prepareGeneratedSchematicRelevanceDisplayClosedCheckpoint, requireOriginalGeneratedSchematicRelevanceDisplayClosedCheckpoint } from "./generated-schematic-relevance-display-closed-checkpoint.ts";
import type { GeneratedSchematicRelevanceDisplayClosedCheckpoint } from "./generated-schematic-relevance-display-closed-checkpoint.ts";
import { prepareGeneratedSchematicRelevanceSavedLoadPlan, requireOriginalGeneratedSchematicRelevanceSavedLoadPlan } from "./generated-schematic-relevance-saved-load-plan.ts";
import type { GeneratedSchematicRelevanceSavedLoadPlan } from "./generated-schematic-relevance-saved-load-plan.ts";
import type { GeneratedSchematicRelevanceDisplayNativeArguments } from "./generated-schematic-relevance-display-source.ts";

export interface GeneratedSchematicRelevanceClosedLifecycle { readonly profile: "private.generated-schematic-relevance-closed-lifecycle.v1" }
interface Input {
  readonly owner: CurrentSchematicRelevanceDisplayWriteOwner; readonly args: GeneratedSchematicRelevanceDisplayNativeArguments;
  readonly drained: CurrentSchematicRelevanceDisplaySaveDrained; readonly termination: object; readonly snapshot: GeneratedSchematicRelevanceDisplayClosedSnapshot;
}
interface Completed extends Input {
  readonly sql: GeneratedSchematicRelevanceDisplayClosedSqlProof; readonly checkpoint: GeneratedSchematicRelevanceDisplayClosedCheckpoint;
  readonly loadPlan: GeneratedSchematicRelevanceSavedLoadPlan;
}
const issued = new WeakMap<GeneratedSchematicRelevanceClosedLifecycle, Readonly<Completed>>();
const pending = new WeakMap<CurrentSchematicRelevanceDisplayWriteOwner, Readonly<{ input: Readonly<Input>; promise: Promise<GeneratedSchematicRelevanceClosedLifecycle> }>>();
function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_RELEVANCE_CLOSED_LIFECYCLE_ORIGINAL"); } }
function current(input: Input): void {
  requireOriginalCurrentSchematicRelevanceDisplaySaveDrained(input.drained, input.owner, input.args);
  assertOriginalCurrentSchematicRelevanceDisplayWriteTermination(input.owner, input.termination);
  requireOriginalGeneratedSchematicRelevanceDisplayClosedSnapshot(input.snapshot, input.owner);
}
/** Repeated requests join the same original preparation, including its first
 * failure. No Save, close, restore, source edit or replacement birth occurs. */
export function completeOriginalGeneratedSchematicRelevanceClosedLifecycle(owner: CurrentSchematicRelevanceDisplayWriteOwner, args: GeneratedSchematicRelevanceDisplayNativeArguments,
  drained: CurrentSchematicRelevanceDisplaySaveDrained, termination: object, snapshot: GeneratedSchematicRelevanceDisplayClosedSnapshot): Promise<GeneratedSchematicRelevanceClosedLifecycle> {
  const input: Readonly<Input> = Object.freeze({ owner, args, drained, termination, snapshot }); current(input);
  const prior = pending.get(owner); if (prior !== undefined) { need(prior.input.args === args && prior.input.drained === drained && prior.input.termination === termination && prior.input.snapshot === snapshot); return prior.promise; }
  const promise = (async (): Promise<GeneratedSchematicRelevanceClosedLifecycle> => {
    const sql = await qualifyOriginalGeneratedSchematicRelevanceDisplayClosedSql(owner, args, termination, snapshot); current(input);
    const checkpoint = await prepareGeneratedSchematicRelevanceDisplayClosedCheckpoint(owner, args, snapshot, sql); current(input);
    const loadPlan = await prepareGeneratedSchematicRelevanceSavedLoadPlan(checkpoint); current(input);
    const packet: GeneratedSchematicRelevanceClosedLifecycle = Object.freeze({ profile: "private.generated-schematic-relevance-closed-lifecycle.v1" });
    issued.set(packet, Object.freeze({ ...input, sql, checkpoint, loadPlan })); requireOriginalGeneratedSchematicRelevanceClosedLifecycle(packet); return packet;
  })(); pending.set(owner, Object.freeze({ input, promise })); return promise;
}
/** Opaque original custody for a later separately admitted reader. Returned
 * historical facts neither transfer the old owner nor issue live authority. */
export function requireOriginalGeneratedSchematicRelevanceClosedLifecycle(packet: GeneratedSchematicRelevanceClosedLifecycle): Readonly<Completed> {
  const original = issued.get(packet); need(original !== undefined); current(original);
  requireOriginalGeneratedSchematicRelevanceDisplayClosedSql(original.sql, original.owner, original.args);
  const checkpoint = requireOriginalGeneratedSchematicRelevanceDisplayClosedCheckpoint(original.checkpoint);
  need(checkpoint.owner === original.owner && checkpoint.plan === original.args && checkpoint.snapshot === original.snapshot && checkpoint.sql === original.sql);
  const data = requireOriginalGeneratedSchematicRelevanceSavedLoadPlan(original.loadPlan, original.checkpoint);
  need(data.projectUuid === original.args.target.projectUuid && data.branchUuid === original.args.target.branchUuid && data.documentUuid === original.args.target.pageUuid && data.schematicUuid === original.args.target.schematicUuid && data.sourceSha256 === original.snapshot.sourceSha256);
  return original;
}
