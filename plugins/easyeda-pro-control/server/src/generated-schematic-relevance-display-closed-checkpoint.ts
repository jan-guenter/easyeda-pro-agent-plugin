/* oxlint-disable import/max-dependencies -- A new historical checkpoint binds original closure/SQL facts, managed backup, complete VACUUM projection and exact source receipt. It grants no live owner. */
import { join } from "node:path";
import { controlDataDirectory, controlRootCapability, readArtifact, verifyExactManagedArtifact } from "./artifacts.ts";
import { createCheckpoint, verifyCheckpoint } from "./checkpoint.ts";
import type { CheckpointAccessPolicy, CheckpointReceipt } from "./checkpoint.ts";
import { canonicalJson, normalizeEasyedaProjectPath, sha256Text } from "./core.ts";
import type { CurrentSchematicRelevanceDisplayWriteOwner } from "./current-schematic-relevance-display-write-owner.ts";
import type { GeneratedSchematicRelevanceDisplayNativeArguments } from "./generated-schematic-relevance-display-source.ts";
import { requireOriginalGeneratedSchematicRelevanceDisplayClosedSnapshot } from "./generated-schematic-relevance-display-closed-snapshot.ts";
import type { GeneratedSchematicRelevanceDisplayClosedSnapshot } from "./generated-schematic-relevance-display-closed-snapshot.ts";
import { requireOriginalGeneratedSchematicRelevanceDisplayClosedSql } from "./generated-schematic-relevance-display-closed-proof.ts";
import type { GeneratedSchematicRelevanceDisplayClosedSqlProof } from "./generated-schematic-relevance-display-closed-proof.ts";
import { qualifyGeneratedFixtureVacuumProjection } from "./managed-fixture-vacuum-projection.ts";
import type { GeneratedFixtureVacuumProjection } from "./managed-fixture-vacuum-projection.ts";
import { currentProcessSqlRuntime } from "./machine-profile.ts";
import { readExactSqlInventory } from "./sqlite-inventory.ts";

export interface GeneratedSchematicRelevanceDisplayClosedCheckpoint {
  readonly profile: "private.generated-schematic-relevance-display-closed-checkpoint.v1";
  readonly operationId: string;
  readonly target: Readonly<{ rawWindowsPath: string; projectUuid: string; branchUuid: string; schematicUuid: string; pageUuid: string; sourceSha256: string }>;
  readonly checkpoint: CheckpointReceipt;
  readonly preparationCheckpoint: Readonly<{ path: string; bytes: number; sha256: string }>;
  readonly vacuumProjection: GeneratedFixtureVacuumProjection;
  readonly completeOriginalClosedSqlVerified: true;
  readonly freshOpeningAuthorized: false; readonly cacheMutationAuthorized: false; readonly reopenedVerified: false;
}
interface Original { readonly owner: CurrentSchematicRelevanceDisplayWriteOwner; readonly plan: GeneratedSchematicRelevanceDisplayNativeArguments;
  readonly snapshot: GeneratedSchematicRelevanceDisplayClosedSnapshot; readonly sql: GeneratedSchematicRelevanceDisplayClosedSqlProof;
  readonly captured: ReturnType<typeof requireOriginalGeneratedSchematicRelevanceDisplayClosedSnapshot>; readonly text: string }
const issued = new WeakMap<GeneratedSchematicRelevanceDisplayClosedCheckpoint, Original>();
const attempts = new WeakMap<CurrentSchematicRelevanceDisplayWriteOwner, Readonly<{ plan: GeneratedSchematicRelevanceDisplayNativeArguments; snapshot: GeneratedSchematicRelevanceDisplayClosedSnapshot; sql: GeneratedSchematicRelevanceDisplayClosedSqlProof; promise: Promise<GeneratedSchematicRelevanceDisplayClosedCheckpoint> }>>();
function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_RELEVANCE_CLOSED_CHECKPOINT_ORIGINAL"); } }
async function policy(source: string): Promise<CheckpointAccessPolicy> { return { expectedSource: source, controlRoot: await controlRootCapability(), artifactRoots: [join(controlDataDirectory(), "checkpoints")], maximumSourceBytes: 67_108_864 }; }
function current(original: Omit<Original, "text">): void {
  const actual = requireOriginalGeneratedSchematicRelevanceDisplayClosedSnapshot(original.snapshot, original.owner);
  need(actual.inventory === original.captured.inventory && actual.sourceSnapshot === original.captured.sourceSnapshot && requireOriginalGeneratedSchematicRelevanceDisplayClosedSql(original.sql, original.owner, original.plan).afterLogicalSha256 === actual.inventory.logicalSha256);
}
/** A new data checkpoint of the exact original closed source. It deliberately
 * does not reuse the initial GeneratedFixtureOpenCheckpoint qualification or
 * issue a new native generation. The later birth must own fresh admission. */
export function prepareGeneratedSchematicRelevanceDisplayClosedCheckpoint(owner: CurrentSchematicRelevanceDisplayWriteOwner, plan: GeneratedSchematicRelevanceDisplayNativeArguments,
  snapshot: GeneratedSchematicRelevanceDisplayClosedSnapshot, sql: GeneratedSchematicRelevanceDisplayClosedSqlProof): Promise<GeneratedSchematicRelevanceDisplayClosedCheckpoint> {
  const captured = requireOriginalGeneratedSchematicRelevanceDisplayClosedSnapshot(snapshot, owner), original = { owner, plan, snapshot, sql, captured }; current(original);
  const prior = attempts.get(owner); if (prior !== undefined) { need(prior.plan === plan && prior.snapshot === snapshot && prior.sql === sql); return prior.promise; }
  const promise = (async (): Promise<GeneratedSchematicRelevanceDisplayClosedCheckpoint> => {
    const source = normalizeEasyedaProjectPath(plan.target.rawWindowsPath);
    need(sha256Text(plan.target.rawWindowsPath) === plan.target.projectUuid && captured.sourceSnapshot.sha256 === snapshot.sourceSha256 && sql.sourceSha256 === snapshot.sourceSha256);
    await verifyExactManagedArtifact(captured.sourceSnapshot); current(original);
    const checkpoint = await createCheckpoint({ source, outputDir: join(controlDataDirectory(), "checkpoints"), label: "schematic-relevance-closed" }, await policy(source), async (): Promise<void> => { current(original); await verifyExactManagedArtifact(captured.sourceSnapshot); current(original); }); current(original);
    need(checkpoint.source === source && checkpoint.sourceSha256 === snapshot.sourceSha256);
    const inventory = await readExactSqlInventory({ checkpointPath: checkpoint.checkpoint, expectedSha256: checkpoint.checkpointSha256, runtime: await currentProcessSqlRuntime() }); current(original);
    const artifact = await readArtifact(checkpoint.checkpoint, 0, 1); current(original); const vacuumProjection = qualifyGeneratedFixtureVacuumProjection(captured.inventory, inventory);
    const prepared: GeneratedSchematicRelevanceDisplayClosedCheckpoint = Object.freeze({ profile: "private.generated-schematic-relevance-display-closed-checkpoint.v1", operationId: plan.operation.operationId,
      target: Object.freeze({ rawWindowsPath: plan.target.rawWindowsPath, projectUuid: plan.target.projectUuid, branchUuid: plan.target.branchUuid, schematicUuid: plan.target.schematicUuid, pageUuid: plan.target.pageUuid, sourceSha256: snapshot.sourceSha256 }),
      checkpoint, preparationCheckpoint: Object.freeze({ path: artifact.path, bytes: artifact.size, sha256: checkpoint.checkpointSha256 }), vacuumProjection,
      completeOriginalClosedSqlVerified: true, freshOpeningAuthorized: false, cacheMutationAuthorized: false, reopenedVerified: false });
    issued.set(prepared, { ...original, text: canonicalJson(prepared) }); await verifyGeneratedSchematicRelevanceDisplayClosedCheckpoint(prepared); return prepared;
  })(); attempts.set(owner, Object.freeze({ plan, snapshot, sql, promise })); return promise;
}
export function requireOriginalGeneratedSchematicRelevanceDisplayClosedCheckpoint(prepared: GeneratedSchematicRelevanceDisplayClosedCheckpoint): Readonly<{ owner: CurrentSchematicRelevanceDisplayWriteOwner; plan: GeneratedSchematicRelevanceDisplayNativeArguments; snapshot: GeneratedSchematicRelevanceDisplayClosedSnapshot; sql: GeneratedSchematicRelevanceDisplayClosedSqlProof }> {
  const original = issued.get(prepared); need(original !== undefined && original.text === canonicalJson(prepared)); current(original);
  return Object.freeze({ owner: original.owner, plan: original.plan, snapshot: original.snapshot, sql: original.sql });
}
/** Before any later cache/open purpose is born, reprove the original source,
 * complete managed receipt and exact full SQL checkpoint projection. */
export async function verifyGeneratedSchematicRelevanceDisplayClosedCheckpoint(prepared: GeneratedSchematicRelevanceDisplayClosedCheckpoint): Promise<void> {
  requireOriginalGeneratedSchematicRelevanceDisplayClosedCheckpoint(prepared); const original = issued.get(prepared); need(original !== undefined);
  const reproof = (): void => { need(requireOriginalGeneratedSchematicRelevanceDisplayClosedCheckpoint(prepared).snapshot === original.snapshot); };
  await verifyExactManagedArtifact(original.captured.sourceSnapshot); reproof(); await verifyExactManagedArtifact(prepared.preparationCheckpoint); reproof();
  const raw = await readArtifact(prepared.checkpoint.receiptPath, 0, 65_536); reproof(); need(raw.eof && canonicalJson(JSON.parse(raw.text)) === canonicalJson(prepared.checkpoint));
  const checked = await verifyCheckpoint(prepared.checkpoint.receiptPath, await policy(prepared.checkpoint.source)); reproof();
  need(checked.ok && !checked.sourceChanged && checked.sourceMatchesReceipt && checked.checkpointMatchesReceipt && checked.sourceEqualsCheckpoint && checked.sourceSha256 === prepared.target.sourceSha256 && checked.checkpointSha256 === prepared.checkpoint.checkpointSha256 && checked.sourceDumpSha256 === prepared.checkpoint.sourceDumpSha256 && checked.checkpointDumpSha256 === prepared.checkpoint.checkpointDumpSha256);
  const inventory = await readExactSqlInventory({ checkpointPath: prepared.preparationCheckpoint.path, expectedSha256: prepared.preparationCheckpoint.sha256, runtime: await currentProcessSqlRuntime() }); reproof();
  need(canonicalJson(qualifyGeneratedFixtureVacuumProjection(original.captured.inventory, inventory)) === canonicalJson(prepared.vacuumProjection)); await verifyExactManagedArtifact(prepared.preparationCheckpoint); reproof();
}
