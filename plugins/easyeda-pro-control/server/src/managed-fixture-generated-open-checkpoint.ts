import { join } from "node:path";
import { controlDataDirectory, controlRootCapability, readArtifact, verifyExactManagedArtifact } from "./artifacts.ts";
import { createCheckpoint, verifyCheckpoint } from "./checkpoint.ts";
import type { CheckpointAccessPolicy, CheckpointReceipt } from "./checkpoint.ts";
import { canonicalJson, normalizeEasyedaProjectPath, sha256Text } from "./core.ts";
import { assertOriginalGeneratedFixtureTarget, originalGeneratedFixtureInventory, qualifyGeneratedFixtureInitialSql } from "./managed-fixture-initial-sql.ts";
import type { QualifiedGeneratedFixtureTarget } from "./managed-fixture-initial-sql.ts";
import { currentProcessSqlRuntime } from "./machine-profile.ts";
import type { NativeHistorySnapshot } from "./native-history.ts";
import type { CurrentDisposableOpenCheckpoint } from "./current-disposable-open-checkpoint.ts";
import { readExactSqlInventory, readerCompletion } from "./sqlite-inventory.ts";
import type { NativeSqlInventory } from "./sqlite-inventory-core.ts";

const profile = "easyeda-pro-control.generated-fixture-open-checkpoint.v1";
export interface GeneratedFixtureOpenCheckpoint {
  readonly profile: typeof profile;
  readonly qualification: QualifiedGeneratedFixtureTarget;
  readonly checkpoint: CheckpointReceipt;
  readonly preparationCheckpoint: Readonly<{ path: string; bytes: number; sha256: string }>;
  readonly history: NativeHistorySnapshot;
  readonly vacuumProjection: Readonly<{ sourceLogicalSha256: string; checkpointLogicalSha256: string; sourceSchemaVersion: number; checkpointSchemaVersion: number; onlySchemaVersionIncremented: true }>;
}
const issued = new WeakMap<GeneratedFixtureOpenCheckpoint, Readonly<{ text: string; archive: Buffer }>>();
function sourcePath(qualification: QualifiedGeneratedFixtureTarget): string {
  assertOriginalGeneratedFixtureTarget(qualification);
  const raw = qualification.target.rawWindowsPath;
  if (!/^[A-Z]:\\[^/]+\\Codex_(?:via_only|line_and_via|arc_line_and_via)_[a-f0-9]{16}\.eprj2$/u.test(raw) ||
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
export function qualifyGeneratedFixtureVacuumProjection(source: NativeSqlInventory, checkpoint: NativeSqlInventory): GeneratedFixtureOpenCheckpoint["vacuumProjection"] {
  readerCompletion(source); readerCompletion(checkpoint);
  const sourceVersion = source.properties["schema_version"]; const checkpointVersion = checkpoint.properties["schema_version"];
  const sourceProjection = { schema: source.schema, schemaSha256: source.schemaSha256, tables: source.tables, properties: source.properties };
  const checkpointProjection = { schema: checkpoint.schema, schemaSha256: checkpoint.schemaSha256, tables: checkpoint.tables,
    properties: { ...checkpoint.properties, schema_version: sourceVersion } };
  if (typeof sourceVersion !== "number" || !Number.isSafeInteger(sourceVersion) || sourceVersion < 0 || sourceVersion >= 2_147_483_647 ||
      checkpointVersion !== sourceVersion + 1 || canonicalJson(sourceProjection) !== canonicalJson(checkpointProjection)) {
    throw new Error("Generated fixture VACUUM checkpoint differs beyond one exact schema_version increment.");
  }
  return Object.freeze({ sourceLogicalSha256: source.logicalSha256, checkpointLogicalSha256: checkpoint.logicalSha256,
    sourceSchemaVersion: sourceVersion, checkpointSchemaVersion: checkpointVersion, onlySchemaVersionIncremented: true });
}
function sameQualification(actual: QualifiedGeneratedFixtureTarget, original: QualifiedGeneratedFixtureTarget): void {
  const normalized = { ...actual, inventoryLogicalSha256: original.inventoryLogicalSha256,
    target: { ...actual.target, expectedSourceSha256: original.target.expectedSourceSha256 } };
  if (canonicalJson(normalized) !== canonicalJson(original)) { throw new Error("Generated fixture checkpoint differs from its complete initial SQL/source qualification."); }
}
async function requalify(checkpoint: CheckpointReceipt, qualification: QualifiedGeneratedFixtureTarget, archive: Buffer): Promise<Readonly<{ history: NativeHistorySnapshot; vacuumProjection: GeneratedFixtureOpenCheckpoint["vacuumProjection"] }>> {
  const inventory = await readExactSqlInventory({ checkpointPath: checkpoint.checkpoint, expectedSha256: checkpoint.checkpointSha256, runtime: await currentProcessSqlRuntime() });
  const result = await qualifyGeneratedFixtureInitialSql({ archive, inventory, rawWindowsPath: qualification.target.rawWindowsPath,
    sourceCreatedEpochMs: qualification.sourceCreatedEpochMs, sourceModifiedEpochMs: qualification.sourceModifiedEpochMs });
  const vacuumProjection = qualifyGeneratedFixtureVacuumProjection(originalGeneratedFixtureInventory(qualification), inventory);
  sameQualification(result.qualification, qualification); return { history: result.history, vacuumProjection };
}
async function unchanged(prepared: GeneratedFixtureOpenCheckpoint): Promise<void> {
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
export async function prepareGeneratedFixtureOpenCheckpoint(input: Readonly<{ qualification: QualifiedGeneratedFixtureTarget; archive: Buffer }>): Promise<GeneratedFixtureOpenCheckpoint> {
  const source = sourcePath(input.qualification); const archive = Buffer.from(input.archive);
  const checkpoint = await createCheckpoint({ source, outputDir: join(controlDataDirectory(), "checkpoints"), label: "generated-fixture-open" }, await policy(source));
  if (checkpoint.sourceSha256 !== input.qualification.target.expectedSourceSha256) { throw new Error("Closed generated fixture changed before preparation."); }
  const qualified = await requalify(checkpoint, input.qualification, archive); const artifact = await readArtifact(checkpoint.checkpoint, 0, 1);
  const prepared: GeneratedFixtureOpenCheckpoint = Object.freeze({ profile, qualification: input.qualification, checkpoint,
    preparationCheckpoint: Object.freeze({ path: artifact.path, bytes: artifact.size, sha256: checkpoint.checkpointSha256 }), ...qualified });
  await unchanged(prepared); issued.set(prepared, { text: canonicalJson(prepared), archive }); return prepared;
}
export function assertOriginalGeneratedFixtureOpenCheckpoint(prepared: GeneratedFixtureOpenCheckpoint): void {
  const original = issued.get(prepared);
  if (original === undefined || original.text !== canonicalJson(prepared)) { throw new Error("Original generated fixture checkpoint owner is required."); }
  assertOriginalGeneratedFixtureTarget(prepared.qualification);
}
/** Pre-navigation only. Reuses the same baseline and never mints replacement
 * authority from receipt JSON or examines a source after ordinary open effects.
 */
export async function verifyGeneratedFixtureOpenCheckpoint(prepared: GeneratedFixtureOpenCheckpoint): Promise<void> {
  assertOriginalGeneratedFixtureOpenCheckpoint(prepared); const original = issued.get(prepared);
  if (original === undefined) { throw new Error("Original generated fixture checkpoint is unavailable."); }
  await unchanged(prepared); const qualified = await requalify(prepared.checkpoint, prepared.qualification, original.archive);
  if (canonicalJson(qualified.history) !== canonicalJson(prepared.history) || canonicalJson(qualified.vacuumProjection) !== canonicalJson(prepared.vacuumProjection)) { throw new Error("Generated fixture default-branch history changed."); }
  await unchanged(prepared); assertOriginalGeneratedFixtureOpenCheckpoint(prepared);
}
export function generatedFixtureDiagnosticCheckpoint(prepared: GeneratedFixtureOpenCheckpoint): CurrentDisposableOpenCheckpoint {
  assertOriginalGeneratedFixtureOpenCheckpoint(prepared); const target = prepared.qualification.target; const history = prepared.history;
  const document = history.documents[0];
  if (document === undefined || history.documents.length !== 1 || document.uuid !== target.documentUuid || document.docType !== "PCB") { throw new Error("Original generated PCB membership changed."); }
  // A DTO for the existing diagnostic journal, not a generic checkpoint proof.
  // The enclosing lifecycle retains the original narrow issued object and uses
  // Only its source-specific verification for every authorization boundary.
  return Object.freeze({ profile: "easyeda-pro-control.current-disposable-open-checkpoint.v1", checkpoint: prepared.checkpoint,
    preparationCheckpoint: prepared.preparationCheckpoint, targetEvidence: Object.freeze({ projectUuid: target.projectUuid, branchUuid: target.branchUuid,
      documentUuid: target.documentUuid, docType: "PCB", sourceSha256: target.expectedSourceSha256, checkpointSha256: prepared.checkpoint.checkpointSha256,
      documentSemanticSha256: document.semanticSha256, historySemanticSha256: history.semanticSha256, headHistoryUuid: history.headHistoryUuid }) });
}
/** After ordinary open, inspect only the original immutable managed backup.
 * Never hash, attach, requalify or replace the now potentially changed source. */
export async function verifyHistoricalGeneratedFixtureOpenCheckpoint(prepared: GeneratedFixtureOpenCheckpoint): Promise<void> {
  assertOriginalGeneratedFixtureOpenCheckpoint(prepared); const original = issued.get(prepared);
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
  await verifyExactManagedArtifact(prepared.preparationCheckpoint); assertOriginalGeneratedFixtureOpenCheckpoint(prepared);
}
