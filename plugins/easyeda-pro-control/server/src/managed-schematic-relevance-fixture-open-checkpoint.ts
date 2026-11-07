import { join, win32 } from "node:path";
import { controlDataDirectory, controlRootCapability, readArtifact, verifyExactManagedArtifact } from "./artifacts.ts";
import { createCheckpoint, verifyCheckpoint } from "./checkpoint.ts";
import type { CheckpointAccessPolicy, CheckpointReceipt } from "./checkpoint.ts";
import { canonicalJson, normalizeEasyedaProjectPath, sha256Text } from "./core.ts";
import { assertOriginalGeneratedSchematicRelevanceFixtureTarget, originalGeneratedSchematicRelevanceFixtureInventory, qualifyGeneratedSchematicRelevanceFixtureInitialSql } from "./managed-schematic-relevance-fixture-initial-sql.ts";
import type { QualifiedGeneratedSchematicRelevanceFixtureTarget } from "./managed-schematic-relevance-fixture-initial-sql.ts";
import { currentProcessSqlRuntime } from "./machine-profile.ts";
import type { NativeHistorySnapshot } from "./native-history.ts";
import { readExactSqlInventory } from "./sqlite-inventory.ts";
import { qualifyGeneratedFixtureVacuumProjection } from "./managed-fixture-vacuum-projection.ts";


const profile = "easyeda-pro-control.generated-schematic-relevance-fixture-open-checkpoint.v1";
export interface GeneratedSchematicRelevanceFixtureOpenCheckpoint {
  readonly profile: typeof profile;
  readonly qualification: QualifiedGeneratedSchematicRelevanceFixtureTarget;
  readonly checkpoint: CheckpointReceipt;
  readonly preparationCheckpoint: Readonly<{ path: string; bytes: number; sha256: string }>;
  readonly history: NativeHistorySnapshot;
  readonly vacuumProjection: Readonly<{ sourceLogicalSha256: string; checkpointLogicalSha256: string; sourceSchemaVersion: number; checkpointSchemaVersion: number; onlySchemaVersionIncremented: true }>;
}
const issued = new WeakMap<GeneratedSchematicRelevanceFixtureOpenCheckpoint, Readonly<{ text: string; archive: Buffer }>>();
function sourcePath(qualification: QualifiedGeneratedSchematicRelevanceFixtureTarget): string {
  assertOriginalGeneratedSchematicRelevanceFixtureTarget(qualification);
  const raw = qualification.target.rawWindowsPath;
  if (!/^[A-Z]:\\[^/]+\\Codex_schematic_relevance_[a-f0-9]{16}\.eprj2$/u.test(raw) ||
      !/^CodexEasyedaFixture_[a-f0-9]{32}$/u.test(win32.basename(win32.dirname(raw))) ||
      sha256Text(raw) !== qualification.target.projectUuid || raw.slice(3).split("\\").some(segment =>
        segment.length === 0 || segment === "." || segment === ".." || segment.trim() !== segment ||
        segment.endsWith(".") || /[<>:"|?*]/u.test(segment) || /~\d/u.test(segment))) {
    throw new Error("Generated fixture requires its exact unambiguous original native path.");
  }
  return normalizeEasyedaProjectPath(raw);
}
async function policy(source: string): Promise<CheckpointAccessPolicy> {
  return { expectedSource: source, controlRoot: await controlRootCapability(), artifactRoots: [join(controlDataDirectory(), "checkpoints")], maximumSourceBytes: 67_108_864 };
}
function sameQualification(actual: QualifiedGeneratedSchematicRelevanceFixtureTarget, original: QualifiedGeneratedSchematicRelevanceFixtureTarget): void {
  const normalized = { ...actual, inventoryLogicalSha256: original.inventoryLogicalSha256,
    target: { ...actual.target, expectedSourceSha256: original.target.expectedSourceSha256 } };
  if (canonicalJson(normalized) !== canonicalJson(original)) { throw new Error("Generated fixture checkpoint differs from its complete initial SQL/source qualification."); }
}
async function requalify(checkpoint: CheckpointReceipt, qualification: QualifiedGeneratedSchematicRelevanceFixtureTarget, archive: Buffer): Promise<Readonly<{ history: NativeHistorySnapshot; vacuumProjection: GeneratedSchematicRelevanceFixtureOpenCheckpoint["vacuumProjection"] }>> {
  const inventory = await readExactSqlInventory({ checkpointPath: checkpoint.checkpoint, expectedSha256: checkpoint.checkpointSha256, runtime: await currentProcessSqlRuntime() });
  const result = await qualifyGeneratedSchematicRelevanceFixtureInitialSql({ archive, inventory, rawWindowsPath: qualification.target.rawWindowsPath,
    sourceCreatedEpochMs: qualification.sourceCreatedEpochMs, sourceModifiedEpochMs: qualification.sourceModifiedEpochMs });
  const vacuumProjection = qualifyGeneratedFixtureVacuumProjection(originalGeneratedSchematicRelevanceFixtureInventory(qualification), inventory);
  sameQualification(result.qualification, qualification); return { history: result.history, vacuumProjection };
}
async function unchanged(prepared: GeneratedSchematicRelevanceFixtureOpenCheckpoint): Promise<void> {
  const source = sourcePath(prepared.qualification); const checkpoint = prepared.checkpoint;
  if (checkpoint.source !== source || checkpoint.sourceSha256 !== prepared.qualification.target.expectedSourceSha256 ||
      prepared.preparationCheckpoint.path !== checkpoint.checkpoint || prepared.preparationCheckpoint.sha256 !== checkpoint.checkpointSha256) {
    throw new Error("Generated fixture retained checkpoint source binding changed.");
  }
  await verifyExactManagedArtifact(prepared.preparationCheckpoint);
  const raw = await readArtifact(checkpoint.receiptPath, 0, 65_536); const parsed: unknown = JSON.parse(raw.text);
  if (!raw.eof || canonicalJson(parsed) !== canonicalJson(checkpoint)) { throw new Error("Generated fixture checkpoint receipt changed."); }
  const verified = await verifyCheckpoint(checkpoint.receiptPath, await policy(source));
  if (!verified.ok || verified.sourceChanged || !verified.sourceMatchesReceipt || !verified.checkpointMatchesReceipt || !verified.sourceEqualsCheckpoint ||
      verified.sourceSha256 !== checkpoint.sourceSha256 || verified.checkpointSha256 !== checkpoint.checkpointSha256 ||
      verified.sourceDumpSha256 !== checkpoint.sourceDumpSha256 || verified.checkpointDumpSha256 !== checkpoint.checkpointDumpSha256) {
    throw new Error("Generated fixture source or managed checkpoint changed before navigation.");
  }
}
/** The original issued closed baseline is the only production input. A new
 * managed checkpoint uses the established source/access/dump policy, then all
 * initial rows and the unticked native header are requalified independently.
 */
export async function prepareGeneratedSchematicRelevanceFixtureOpenCheckpoint(input: Readonly<{ qualification: QualifiedGeneratedSchematicRelevanceFixtureTarget; archive: Buffer }>): Promise<GeneratedSchematicRelevanceFixtureOpenCheckpoint> {
  const qualification = input.qualification; const source = sourcePath(qualification); const archive = Buffer.from(input.archive);
  const checkpoint = await createCheckpoint({ source, outputDir: join(controlDataDirectory(), "checkpoints"), label: "generated-schematic-fixture-open" }, await policy(source));
  if (checkpoint.sourceSha256 !== qualification.target.expectedSourceSha256) { throw new Error("Closed generated fixture changed before preparation."); }
  const qualified = await requalify(checkpoint, qualification, archive); const artifact = await readArtifact(checkpoint.checkpoint, 0, 1);
  const prepared: GeneratedSchematicRelevanceFixtureOpenCheckpoint = Object.freeze({ profile, qualification, checkpoint,
    preparationCheckpoint: Object.freeze({ path: artifact.path, bytes: artifact.size, sha256: checkpoint.checkpointSha256 }), ...qualified });
  await unchanged(prepared); issued.set(prepared, { text: canonicalJson(prepared), archive }); return prepared;
}
export function assertOriginalGeneratedSchematicRelevanceFixtureOpenCheckpoint(prepared: GeneratedSchematicRelevanceFixtureOpenCheckpoint): void {
  const original = issued.get(prepared);
  if (original === undefined || original.text !== canonicalJson(prepared)) { throw new Error("Original generated fixture checkpoint owner is required."); }
  assertOriginalGeneratedSchematicRelevanceFixtureTarget(prepared.qualification);
}
/** Pre-navigation only. Reuses the same baseline and never mints replacement
 * authority from receipt JSON or examines a source after ordinary open effects.
 */
export async function verifyGeneratedSchematicRelevanceFixtureOpenCheckpoint(prepared: GeneratedSchematicRelevanceFixtureOpenCheckpoint): Promise<void> {
  assertOriginalGeneratedSchematicRelevanceFixtureOpenCheckpoint(prepared); const original = issued.get(prepared);
  if (original === undefined) { throw new Error("Original generated fixture checkpoint is unavailable."); }
  await unchanged(prepared); const qualified = await requalify(prepared.checkpoint, prepared.qualification, original.archive);
  if (canonicalJson(qualified.history) !== canonicalJson(prepared.history) || canonicalJson(qualified.vacuumProjection) !== canonicalJson(prepared.vacuumProjection)) { throw new Error("Generated fixture default-branch history changed."); }
  await unchanged(prepared); assertOriginalGeneratedSchematicRelevanceFixtureOpenCheckpoint(prepared);
}
/** After ordinary open, inspect only the original immutable managed backup.
 * Never hash, attach, requalify or replace the now potentially changed source. */
export async function verifyHistoricalGeneratedSchematicRelevanceFixtureOpenCheckpoint(prepared: GeneratedSchematicRelevanceFixtureOpenCheckpoint): Promise<void> {
  assertOriginalGeneratedSchematicRelevanceFixtureOpenCheckpoint(prepared); const original = issued.get(prepared);
  if (original === undefined) { throw new Error("Original generated historical checkpoint is unavailable."); }
  const raw = await readArtifact(prepared.checkpoint.receiptPath, 0, 65_536); const parsed: unknown = JSON.parse(raw.text);
  const { receiptSha256, ...body } = prepared.checkpoint;
  if (!raw.eof || canonicalJson(parsed) !== canonicalJson(prepared.checkpoint) || sha256Text(canonicalJson(body)) !== receiptSha256) {
    throw new Error("Generated historical checkpoint receipt changed.");
  }
  await verifyExactManagedArtifact(prepared.preparationCheckpoint);
  const qualified = await requalify(prepared.checkpoint, prepared.qualification, original.archive);
  if (canonicalJson(qualified.history) !== canonicalJson(prepared.history) || canonicalJson(qualified.vacuumProjection) !== canonicalJson(prepared.vacuumProjection)) {
    throw new Error("Generated historical complete SQL/source baseline changed.");
  }
  await verifyExactManagedArtifact(prepared.preparationCheckpoint); assertOriginalGeneratedSchematicRelevanceFixtureOpenCheckpoint(prepared);
}
