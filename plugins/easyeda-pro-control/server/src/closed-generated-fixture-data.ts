/* oxlint-disable import/max-dependencies -- Data qualification joins only managed artifact readers, fixed archive/source profiles and the genuine complete SQL reader; no old runtime is reconstructed. */
import { basename, dirname, join, win32 } from "node:path";
import { z } from "zod";
import { controlDataDirectory, loadOperation, operationPath, readExactBinaryArtifact, readExactUtf8Artifact } from "./artifacts.ts";
import type { ArtifactDescriptor } from "./artifacts.ts";
import { canonicalJson } from "./core.ts";
import { generatedWindowsPath } from "./closed-generated-fixture-file.ts";
import { qualifyManagedFixtureArchive } from "./managed-fixture-archive.ts";
import { managedFixtureClosedFileMetadataSchema, managedFixtureDestinationObservationSchema } from "./managed-fixture-destination.ts";
import { qualifyGeneratedFixtureInitialSql } from "./managed-fixture-initial-sql.ts";
import type { QualifiedGeneratedFixtureTarget } from "./managed-fixture-initial-sql.ts";
import { qualifyGeneratedSchematicFixtureInitialSql } from "./managed-schematic-fixture-initial-sql.ts";
import type { QualifiedGeneratedSchematicFixtureTarget } from "./managed-schematic-fixture-initial-sql.ts";
import { currentProcessSqlRuntime } from "./machine-profile.ts";
import { readExactSqlInventory } from "./sqlite-inventory.ts";
import type { NativeSqlInventory } from "./sqlite-inventory-core.ts";

const sha = z.string().regex(/^[a-f0-9]{64}$/u);
const importId = z.string().regex(/^[a-z0-9][a-z0-9-]{7,63}$/u);
const operationId = z.string().min(24).max(80).regex(/^fixture-data209-[a-z0-9][a-z0-9-]*$/u);
export const closedGeneratedFixtureDataRequestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("requalify-closed-generated-fixture"), operationId, importOperationId: importId,
    generatedArchiveArtifactSha256: sha, closedCaptureArtifactSha256: sha,
    confirmReadClosedGeneratedFixture: z.literal(true), confirmFreshNoApplicationCheck: z.literal(true) }).strict(),
  z.object({ action: z.literal("inspect"), operationId }).strict(),
  z.object({ action: z.literal("settle-records"), operationId }).strict(),
  z.object({ action: z.literal("release-owner"), operationId, confirmReleaseClosedDataOwner: z.literal(true) }).strict(),
  z.object({ action: z.literal("stage-for-fresh-opening"), operationId, confirmStageRequalifiedData: z.literal(true) }).strict(),
  z.object({ action: z.literal("stage-schematic-for-fresh-opening"), operationId, confirmStageRequalifiedData: z.literal(true) }).strict(),
]);
export type ClosedGeneratedFixtureDataRequest = z.infer<typeof closedGeneratedFixtureDataRequestSchema>;
export type ClosedGeneratedFixtureDataStart = Extract<ClosedGeneratedFixtureDataRequest, { action: "requalify-closed-generated-fixture" }>;
export function queryClosedGeneratedFixtureData(input: unknown = {}): Record<string, unknown> {
  const request = z.object({ includeSchemas: z.boolean().default(false) }).strict().parse(input);
  return { tool: "easyeda_control_fixture_data", profile: "closed-generated-initial-data209-v1", actions: closedGeneratedFixtureDataRequestSchema.options.map(option => option.shape.action.value),
    effect: "fresh-read-only-generated-data-qualification", oldNativeRuntimeAdopted: false, oldClosureAcceptedAsAuthority: false, applicationLaunchAuthorized: false,
    writerAuthority: false, postOpenChangesAccepted: false,
    limitations: ["SHA-bound managed import artifacts locate data only; fresh current-process leases, no-app observations, full exact SQL and fixed initial source qualification are required.",
      "Only the earlier managed private TEMP file is eligible. Any source byte, complete directory roster, schema or row change refuses this initial data profile.",
      "A new data token is issued only after acknowledged fresh file/watch and proof-helper closure plus durable local records; no PID, Job, HMAC or native owner is loaded from JSON."],
    ...(request.includeSchemas ? { requestSchema: z.toJSONSchema(closedGeneratedFixtureDataRequestSchema) } : {}) };
}
export function validateClosedGeneratedFixtureDataArguments(input: unknown): Record<string, unknown> {
  const parsed = closedGeneratedFixtureDataRequestSchema.safeParse(input);
  return parsed.success ? { valid: true, request: parsed.data, executionAuthorized: false } : { valid: false, executionAuthorized: false,
    issues: parsed.error.issues.map(issue => ({ path: issue.path.join("."), message: issue.message })) };
}
const descriptor = z.object({ path: z.string().min(1).max(4096), bytes: z.number().int().positive().max(67_108_864), sha256: sha }).loose();
const oldTarget = z.object({ target: z.object({ rawWindowsPath: generatedWindowsPath }).loose(), sourceCreatedEpochMs: z.number().positive(),
  sourceModifiedEpochMs: z.number().positive() }).loose();
const capture = z.object({ schema: z.enum(["easyeda-pro-control.managed-fixture-closed-snapshot.v1", "easyeda-pro-control.managed-schematic-fixture-closed-snapshot.v1"]),
  snapshot: descriptor, originalSourceSha256: sha, completeInitialSqlRowsQualified: z.literal(true),
  issuedReadOpenTarget: oldTarget.nullable().optional(), issuedSchematicDataTarget: oldTarget.nullable().optional() }).loose();
const nativeClockCapture = capture.extend({
  schema: z.enum(["easyeda-pro-control.managed-fixture-closed-snapshot.v2", "easyeda-pro-control.managed-schematic-fixture-closed-snapshot.v2"]),
  sourceClockSource: z.literal("original-destination-windows-filetime"), windowsClosedFileMetadata: managedFixtureClosedFileMetadataSchema,
});
/** Released captures can retain valid complete data when DrvFS reports no
 * birth time. This historical refusal grants no initial-model qualification;
 * the new native file lease must supply both genuine Windows file clocks. */
const clockRefusedCapture = capture.omit({ completeInitialSqlRowsQualified: true }).extend({
  completeInitialSqlRowsQualified: z.literal(false), completeSqlInventoryCaptured: z.literal(true),
  qualificationFailure: z.literal("Generated fixture initial SQL refused: bounded fresh native file clock interval."),
  issuedReadOpenTarget: z.null().optional(), issuedSchematicDataTarget: z.null().optional(),
  decoded: z.null(), sourceComparison: z.null(),
});
export type ClosedGeneratedDataQualification = QualifiedGeneratedFixtureTarget | QualifiedGeneratedSchematicFixtureTarget;
export interface ClosedGeneratedFixtureDataLocator {
  readonly archive: Buffer; readonly rawWindowsPath: string; readonly snapshot: ArtifactDescriptor;
  readonly oldQualification: ClosedGeneratedDataQualification | null; readonly kind: "pcb" | "schematic";
  readonly clockRefusedInitialInventory?: NativeSqlInventory;
  readonly locatorReceipt: Readonly<Record<string, unknown>>;
}
function need(value: boolean, message: string): asserts value { if (!value) { throw new Error(`Closed generated data refused: ${message}.`); } }
function phaseArtifact(artifacts: readonly ArtifactDescriptor[], operation: string, phase: string, hash?: string): ArtifactDescriptor {
  const directory = join(dirname(operationPath(operation)), operation);
  const matches = artifacts.filter(item => dirname(item.path) === directory && new RegExp(`^[0-9]{2,6}-${phase}\\.json$`, "u").test(basename(item.path)));
  need(matches.length === 1 && (hash === undefined || matches[0]?.sha256 === hash), `one exact ${phase} artifact ID`); const found = matches[0]; need(found !== undefined, "phase artifact exists"); return found;
}
export async function qualifyClosedGeneratedDataSql(archive: Buffer, inventory: NativeSqlInventory, rawWindowsPath: string,
  sourceCreatedEpochMs: number, sourceModifiedEpochMs: number, kind: "pcb" | "schematic"): Promise<ClosedGeneratedDataQualification> {
  const input = { archive, inventory, rawWindowsPath, sourceCreatedEpochMs, sourceModifiedEpochMs };
  return (kind === "pcb" ? await qualifyGeneratedFixtureInitialSql(input) : await qualifyGeneratedSchematicFixtureInitialSql(input)).qualification;
}
/** Historical records provide untrusted data locators only. Their old closure,
 * owner, runtime and acceptance fields are never read as current authority. */
export async function loadClosedGeneratedFixtureData(request: ClosedGeneratedFixtureDataStart, current: () => void): Promise<ClosedGeneratedFixtureDataLocator> {
  const checked = async <T>(call: () => Promise<T>): Promise<T> => { current(); try { return await call(); } finally { current(); } };
  const operation = await checked(() => loadOperation(request.importOperationId));
  need(operation.plan["profile"] === "managed-fixture-import209-v1", "fixed import data profile");
  const generatedDescriptor = phaseArtifact(operation.artifacts ?? [], request.importOperationId, "generated-archive", request.generatedArchiveArtifactSha256);
  const captureDescriptor = phaseArtifact(operation.artifacts ?? [], request.importOperationId, "closed-import-capture", request.closedCaptureArtifactSha256);
  const generatedBytes = await checked(() => readExactUtf8Artifact(generatedDescriptor));
  const generatedRaw: unknown = JSON.parse(generatedBytes.text);
  const generated = z.object({ staged: z.object({ stageId: z.uuid(), archive: descriptor }).loose() }).loose().parse(generatedRaw);
  const archiveDescriptor = generated.staged.archive;
  const archiveDirectory = join(controlDataDirectory(), "artifacts", "fixture-archives", generated.staged.stageId);
  need(dirname(archiveDescriptor.path) === archiveDirectory && /^Codex_(?:via_only|line_and_via|arc_line_and_via|schematic)_[a-f0-9]{16}\.epro2$/u.test(basename(archiveDescriptor.path)), "managed generated archive stage");
  const archiveBytes = await checked(() => readExactBinaryArtifact(archiveDescriptor)); const archive = archiveBytes.content; const archiveData = qualifyManagedFixtureArchive(archive);
  need(basename(archiveDescriptor.path) === `${archiveData.manifest.title}.epro2`, "archive exact generated title");
  const capturedBytes = await checked(() => readExactUtf8Artifact(captureDescriptor));
  const closed = z.union([capture, nativeClockCapture, clockRefusedCapture]).parse(JSON.parse(capturedBytes.text) as unknown);
  const kind = closed.schema === "easyeda-pro-control.managed-fixture-closed-snapshot.v1" || closed.schema === "easyeda-pro-control.managed-fixture-closed-snapshot.v2" ? "pcb" : "schematic";
  const old = kind === "pcb" ? closed.issuedReadOpenTarget : closed.issuedSchematicDataTarget;
  need((kind === "pcb" ? closed.issuedSchematicDataTarget === undefined : closed.issuedReadOpenTarget === undefined) &&
    (closed.completeInitialSqlRowsQualified ? old !== undefined && old !== null : old === null), "distinct initial data target");
  need(dirname(closed.snapshot.path) === join(controlDataDirectory(), "artifacts", "fixture-import-closed") && /^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}\.eprj2$/u.test(basename(closed.snapshot.path)) &&
    closed.originalSourceSha256 === closed.snapshot.sha256, "exact managed closed snapshot");
  if (closed.schema === "easyeda-pro-control.managed-fixture-closed-snapshot.v2" || closed.schema === "easyeda-pro-control.managed-schematic-fixture-closed-snapshot.v2") {
    const native = closed.windowsClosedFileMetadata.file;
    need(old !== undefined && old !== null && old.target.rawWindowsPath === native.windowsPath && native.sha256 === closed.snapshot.sha256 &&
      native.bytes === closed.snapshot.bytes && old.sourceCreatedEpochMs === native.createdEpochMs && old.sourceModifiedEpochMs === native.modifiedEpochMs,
    "v2 complete snapshot and original native file-clock binding");
  }
  let rawWindowsPath: string;
  if (old !== undefined && old !== null) { rawWindowsPath = old.target.rawWindowsPath; }
  else {
    const destinationDescriptor = phaseArtifact(operation.artifacts ?? [], request.importOperationId, "destination-held");
    const destinationBytes = await checked(() => readExactUtf8Artifact(destinationDescriptor));
    const destination = managedFixtureDestinationObservationSchema.parse(JSON.parse(destinationBytes.text) as unknown);
    need(destination.state === "held" && destination.expectedBasename === archiveData.expectedDestinationBasename, "original generated destination data locator");
    rawWindowsPath = generatedWindowsPath.parse(win32.join(destination.windowsDirectory, destination.expectedBasename));
  }
  need(rawWindowsPath.endsWith(`\\${archiveData.expectedDestinationBasename}`), "archive/native filename binding");
  const inventory = await checked(async () => readExactSqlInventory({ checkpointPath: closed.snapshot.path, expectedSha256: closed.snapshot.sha256, runtime: await currentProcessSqlRuntime() }));
  const oldQualification = old === undefined || old === null ? null : await checked(() => qualifyClosedGeneratedDataSql(archive, inventory, rawWindowsPath, old.sourceCreatedEpochMs, old.sourceModifiedEpochMs, kind));
  need(oldQualification === null || oldQualification.target.expectedSourceSha256 === closed.snapshot.sha256, "old snapshot source hash");
  return Object.freeze({ archive: Buffer.from(archive), rawWindowsPath, snapshot: closed.snapshot,
    oldQualification, ...(oldQualification === null ? { clockRefusedInitialInventory: inventory } : {}), kind, locatorReceipt: Object.freeze({ importOperationId: request.importOperationId, generatedArchiveArtifact: generatedDescriptor,
      closedCaptureArtifact: captureDescriptor, archive: archiveDescriptor, snapshot: closed.snapshot,
      historicalOwnerClaimsAccepted: false, historicalRuntimeAdopted: false, dataIntegrityAuthenticatesWriter: false }) });
}
/** A clock-refused historical capture remains unqualified until the original
 * fresh Windows file lease supplies clocks bound to the unchanged source hash.
 * Every initial schema, row, actor, ticket, body and clock predicate still runs. */
export async function qualifyClosedGeneratedBaselineWithFileClocks(locator: ClosedGeneratedFixtureDataLocator,
  sourceCreatedEpochMs: number, sourceModifiedEpochMs: number): Promise<ClosedGeneratedDataQualification> {
  if (locator.oldQualification !== null) { return locator.oldQualification; }
  const inventory = locator.clockRefusedInitialInventory;
  need(inventory !== undefined && inventory.checkpointSha256 === locator.snapshot.sha256, "retained complete clock-refused initial data inventory");
  const qualified = await qualifyClosedGeneratedDataSql(locator.archive, inventory, locator.rawWindowsPath, sourceCreatedEpochMs, sourceModifiedEpochMs, locator.kind);
  need(qualified.target.expectedSourceSha256 === locator.snapshot.sha256, "clock-qualified initial snapshot hash"); return qualified;
}
export function assertSameClosedGeneratedData(left: ClosedGeneratedDataQualification, right: ClosedGeneratedDataQualification): void {
  need(left.schema === right.schema && canonicalJson(left.target) === canonicalJson(right.target) && left.archiveSha256 === right.archiveSha256 &&
    left.inventoryLogicalSha256 === right.inventoryLogicalSha256 && left.sourceSha256 === right.sourceSha256 && left.nativeLocalOffsetMinutes === right.nativeLocalOffsetMinutes &&
    Math.trunc(left.sourceCreatedEpochMs) === Math.trunc(right.sourceCreatedEpochMs) && Math.trunc(left.sourceModifiedEpochMs) === Math.trunc(right.sourceModifiedEpochMs), "complete old/new initial data equality");
}
