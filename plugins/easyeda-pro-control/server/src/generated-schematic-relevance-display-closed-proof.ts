/** Full logical SQL comparison using only the same original schematic owner,
 * completed Save effects and closed capture. It issues no live or reopen grant. */
import { canonicalJson } from "./core.ts";
import { originalCurrentSchematicRelevanceDisplayClosedEffects, originalCurrentSchematicRelevanceDisplayWriteTarget } from "./current-schematic-relevance-display-write-owner.ts";
import type { CurrentSchematicRelevanceDisplayWriteOwner } from "./current-schematic-relevance-display-write-owner.ts";
import type { GeneratedSchematicRelevanceDisplayNativeArguments } from "./generated-schematic-relevance-display-source.ts";
import { requireOriginalGeneratedSchematicRelevanceDisplayClosedSnapshot } from "./generated-schematic-relevance-display-closed-snapshot.ts";
import type { GeneratedSchematicRelevanceDisplayClosedSnapshot } from "./generated-schematic-relevance-display-closed-snapshot.ts";
import { originalGeneratedSchematicRelevanceFixtureInventory } from "./managed-schematic-relevance-fixture-initial-sql.ts";
import { compareGeneratedProjectClosedSqlDelta } from "./generated-project-closed-sql-delta.ts";
import type { GeneratedProjectClosedSqlDelta } from "./generated-project-closed-sql-delta.ts";

export interface GeneratedSchematicRelevanceDisplayClosedSqlProof {
  readonly schema: "private.generated-schematic-relevance-display-closed-sql-proof.v1";
  readonly sourceSha256: string; readonly logicalSha256: string; readonly bodySha256: string; readonly structureSha256: string;
  readonly completeSqlVerified: true; readonly exactOriginalSaveDataVerified: true;
  readonly persistenceVerified: false; readonly reopenedVerified: false; readonly liveContinuationAuthorized: false;
}
interface Original {
  readonly owner: CurrentSchematicRelevanceDisplayWriteOwner; readonly args: GeneratedSchematicRelevanceDisplayNativeArguments;
  readonly termination: object; readonly snapshot: GeneratedSchematicRelevanceDisplayClosedSnapshot;
  readonly effects: ReturnType<typeof originalCurrentSchematicRelevanceDisplayClosedEffects>;
  readonly delta: GeneratedProjectClosedSqlDelta; readonly text: string;
}
const issued = new WeakMap<GeneratedSchematicRelevanceDisplayClosedSqlProof, Original>();
const attempts = new WeakMap<CurrentSchematicRelevanceDisplayWriteOwner, Readonly<Omit<Original, "delta" | "text"> & { promise: Promise<GeneratedSchematicRelevanceDisplayClosedSqlProof> }>>();
function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_RELEVANCE_CLOSED_SQL_ORIGINAL_PROOF"); } }
/** Repeated lookup joins the original comparison Promise, including failure.
 * It never opens a replacement source or retries a write or Save. */
export function qualifyOriginalGeneratedSchematicRelevanceDisplayClosedSql(owner: CurrentSchematicRelevanceDisplayWriteOwner,
  args: GeneratedSchematicRelevanceDisplayNativeArguments, termination: object, snapshot: GeneratedSchematicRelevanceDisplayClosedSnapshot): Promise<GeneratedSchematicRelevanceDisplayClosedSqlProof> {
  const prepared = originalCurrentSchematicRelevanceDisplayWriteTarget(owner);
  const before = originalGeneratedSchematicRelevanceFixtureInventory(prepared.qualification);
  const captured = requireOriginalGeneratedSchematicRelevanceDisplayClosedSnapshot(snapshot, owner);
  const effects = originalCurrentSchematicRelevanceDisplayClosedEffects(owner, args, termination);
  const current = (): void => {
    need(originalCurrentSchematicRelevanceDisplayWriteTarget(owner) === prepared && originalGeneratedSchematicRelevanceFixtureInventory(prepared.qualification) === before &&
      requireOriginalGeneratedSchematicRelevanceDisplayClosedSnapshot(snapshot, owner).inventory === captured.inventory && originalCurrentSchematicRelevanceDisplayClosedEffects(owner, args, termination) === effects);
  };
  current(); const prior = attempts.get(owner);
  if (prior !== undefined) { need(prior.args === args && prior.snapshot === snapshot && prior.effects === effects && prior.termination === termination); return prior.promise; }
  const promise = (async (): Promise<GeneratedSchematicRelevanceDisplayClosedSqlProof> => {
    const delta = await compareGeneratedProjectClosedSqlDelta(before, captured.inventory, effects.body.body, effects.history, effects.structure); current();
    need(effects.body.documentUuid === args.target.pageUuid && effects.body.headTicket === effects.structure.ticket && delta.bodySha256 === effects.body.bodySha256 && delta.afterLogicalSha256 === snapshot.inventoryLogicalSha256);
    const proof: GeneratedSchematicRelevanceDisplayClosedSqlProof = Object.freeze({ schema: "private.generated-schematic-relevance-display-closed-sql-proof.v1", sourceSha256: snapshot.sourceSha256,
      logicalSha256: delta.afterLogicalSha256, bodySha256: delta.bodySha256, structureSha256: delta.structureSha256, completeSqlVerified: true, exactOriginalSaveDataVerified: true,
      persistenceVerified: false, reopenedVerified: false, liveContinuationAuthorized: false });
    issued.set(proof, Object.freeze({ owner, args, termination, snapshot, effects, delta, text: canonicalJson(proof) })); return proof;
  })(); attempts.set(owner, Object.freeze({ owner, args, termination, snapshot, effects, promise })); return promise;
}
export function requireOriginalGeneratedSchematicRelevanceDisplayClosedSql(proof: GeneratedSchematicRelevanceDisplayClosedSqlProof,
  owner: CurrentSchematicRelevanceDisplayWriteOwner, args: GeneratedSchematicRelevanceDisplayNativeArguments): GeneratedProjectClosedSqlDelta {
  const original = issued.get(proof); need(original !== undefined && original.owner === owner && original.args === args && original.text === canonicalJson(proof));
  originalCurrentSchematicRelevanceDisplayWriteTarget(owner);
  need(requireOriginalGeneratedSchematicRelevanceDisplayClosedSnapshot(original.snapshot, owner).inventory.logicalSha256 === proof.logicalSha256 &&
    originalCurrentSchematicRelevanceDisplayClosedEffects(owner, args, original.termination) === original.effects); return original.delta;
}
