/* oxlint-disable import/max-dependencies -- The coordinator reuses existing checkpoint, journal, runtime and native-navigation boundaries. */
import { join } from "node:path";
import { z } from "zod";
import { controlDataDirectory, controlRootCapability, createOperation, loadOperation, operationPath, updateOperation, writePhaseArtifact } from "./artifacts.ts";
import { listQualifiedOperationStates } from "./closed-symbol-terminal-admission.ts";
import { createCheckpoint, verifyCheckpoint } from "./checkpoint.ts";
import type { CheckpointAccessPolicy, CheckpointReceipt } from "./checkpoint.ts";
import { OPERATION_SCHEMA, assertSubset, buildPlanHash, canonicalJson, extractToolPayload, isRecord, isTerminalOperation, newOperationId, normalizeEasyedaProjectPath, sha256Text, validateExpectedFingerprint, validatePrivateFingerprint } from "./core.ts";
import type { DispatchOperationJournal, EasyedaControlEngine, ExpectedContext } from "./engine.ts";
import { assertFacadeOnlyRuntimeUpgrade } from "./design-execution.ts";
import { libraryProjectRecordsHash } from "./library-persistence-proof.ts";
import { verifyLibraryNativeProfile } from "./library-native-profile.ts";
import { readNativeHistoryCheckpoint } from "./native-history.ts";
import { deriveRecoveryNavigationTarget, prepareRecoveryNavigation } from "./recovery-navigation.ts";
import type { RecoveryNavigationTarget } from "./recovery-navigation.ts";
import { transactionError } from "./transaction-error.ts";
import { buildEditorTabsReadCode, parseEditorTabsRead } from "./editor-tabs.ts";
import { RECOVERY_NAVIGATION_FAILURE_STAGES } from "./native-diagnostics.ts";
import { nativeLibraryHeaderEvidence } from "./native-library-header-evidence.ts";

type Value = Record<string, unknown>;
const PROFILE = "easyeda-pro-control.project-open.v1";
type FailureAction = "open-existing" | "inspect-editor-tabs" | "reconcile-open";
const failureStates: ReadonlySet<string> = new Set(["planned", "project-open-dispatching", "editor-tabs-dispatching", "project-open-reconcile-dispatching", "project-open-reconcile-final-dispatching"]);
const failureCategories = new Map<string, string>(RECOVERY_NAVIGATION_FAILURE_STAGES.flatMap((stage) => {
  const category = `native-preflight:RECOVERY_${stage.toUpperCase().replaceAll("-", "_")}`;
  const entries: [string, string][] = [[`Recovery navigation refused: ${stage}`, category]];
  for (const kind of ["failure", "failure or unavailability"]) { entries.push([`The upstream EasyEDA tool reported ${kind} [${category}].`, category]); }
  return entries;
}));
for (const category of ["unclassified-upstream-failure", "invalid-envelope", "native-api-error", "payload-too-large", "invalid-input", "unavailable", "unstable-read"]) {
  for (const kind of ["failure", "failure or unavailability"]) { failureCategories.set(`The upstream EasyEDA tool reported ${kind} [${category}].`, category); }
}
failureCategories.set("The upstream bridge timed out without proving native execution ended [bridge-timeout;execution-unsettled].", "bridge-timeout");
failureCategories.set("The native lifecycle deadline expired without proving execution ended [native-lifecycle-timeout;execution-unsettled].", "native-lifecycle-timeout");
failureCategories.set("Project-open native acknowledgment is missing.", "native-acknowledgment-missing");
failureCategories.set("Project-open tab acknowledgment disagrees with the exact active context.", "native-acknowledgment-context");
failureCategories.set("Project-open proof changed SQLite tables or materialized document records.", "durable-baseline-changed");
function failureCategory(error: unknown): string {
  // Never inspect upstreamResult, stack, cause, toString or an error accessor.
  // Whole-message membership emits fixed categories only, including for spoofed
  // Error objects. Unknown and oversized messages retain no private material.
  try {
    if (typeof error !== "object" || error === null) { return "unclassified-operation-failure"; }
    const message: unknown = Object.getOwnPropertyDescriptor(error, "message")?.value;
    return typeof message === "string" && message.length <= 512 ? failureCategories.get(message) ?? "unclassified-operation-failure" : "unclassified-operation-failure";
  } catch { return "unclassified-operation-failure"; }
}
const hash = z.string().regex(/^[a-f0-9]{64}$/u);
const valueRecord = z.record(z.string(), z.unknown());
export const projectOpenTargetSchema = z.object({ projectUuid: z.string().regex(/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/u), projectPath: z.string().min(1).max(4096),
  documentUuid: z.string().regex(/^[A-Za-z0-9_-]{1,128}$/u), documentType: z.union([z.literal(1), z.literal(3)]) }).strict();
export const projectOpenInputSchema = projectOpenTargetSchema.extend({ action: z.literal("open-existing"), expectedFingerprint: valueRecord, confirmOpen: z.literal(true) }).strict();
export type ProjectOpenInput = z.infer<typeof projectOpenInputSchema>;
const identitySchema = z.object({ dev: z.string(), ino: z.string(), birthtimeNs: z.string(), ctimeNs: z.string() }).strict();
const receiptSchema = z.object({ schema: z.literal("easyeda-pro-control.checkpoint.v2"), source: z.string(), checkpoint: z.string(), receiptPath: z.string(), createdAt: z.string(),
  sourceIdentity: identitySchema, checkpointIdentity: identitySchema, sourceSha256: hash, checkpointSha256: hash, sourceDumpSha256: hash, checkpointDumpSha256: hash, receiptSha256: hash }).loose();
const verificationSchema = z.object({ ok: z.literal(true), sourceMatchesReceipt: z.literal(true), checkpointMatchesReceipt: z.literal(true), sourceEqualsCheckpoint: z.literal(true),
  sourceChanged: z.literal(false), source: z.string(), checkpoint: z.string(), receiptPath: z.string(), sourceDumpSha256: hash, checkpointDumpSha256: hash, checkpointSha256: hash }).loose();
interface OpenPlan extends Value { profile: typeof PROFILE; target: RecoveryNavigationTarget; expectedContext: ExpectedContext; expectedFingerprint: Value; }
interface OpenJournal extends DispatchOperationJournal { plan: OpenPlan; preCheckpoint: CheckpointReceipt; beforeRecordsSha256: string; runtimeFingerprint?: Value; result?: Value; }
export type ProjectOpenEngine = Pick<EasyedaControlEngine, "assertContext" | "dispatchWithOrphanTracking" | "assertRecoveryOperationIsolated" | "ensureRuntimeRestartChallenge" | "recoverDispatchAuthority"> & {
  readonly executionAuthorityValidator: unknown;
  readonly status: () => Promise<{ stableFingerprint: Value }>;
  readonly upstream: { readonly installedEasyedaBundles?: () => Promise<{ assetsRoot: string }> };
};

async function checkpointPolicy(source: string): Promise<CheckpointAccessPolicy> {
  return { expectedSource: source, artifactRoots: [join(controlDataDirectory(), "checkpoints")], controlRoot: await controlRootCapability() };
}
const dependencies = { checkpointPolicy, createCheckpoint, verifyCheckpoint, readNativeHistoryCheckpoint, prepareRecoveryNavigation, verifyLibraryNativeProfile,
  createOperation, listOperations: listQualifiedOperationStates, loadOperation, updateOperation, writePhaseArtifact };
export type ProjectOpenDependencies = Partial<typeof dependencies>;
function targetContext(target: RecoveryNavigationTarget): ExpectedContext {
  return { project: { uuid: target.projectUuid, path: target.projectPath }, document: { uuid: target.documentUuid, documentType: target.documentType } };
}
function summary(journal: OpenJournal): Value {
  return { operationId: journal.operationId, action: "open-existing", state: journal.state, result: journal.result ?? null, saved: false, reopened: false,
    mutationMayHaveOccurred: journal.mutationMayHaveOccurred, orphanedCallPossible: journal.orphanedCallPossible, nextSafeAction: journal.nextSafeAction,
    journalPath: journal.journalPath, artifacts: journal.artifacts };
}
function isJournal(value: unknown): value is OpenJournal {
  if (!isRecord(value) || !isRecord(value["plan"])) { return false; }
  const plan = value["plan"];
  return plan["profile"] === PROFILE && projectOpenTargetSchema.safeParse(plan["target"]).success && isRecord(plan["expectedFingerprint"]) && isRecord(plan["expectedContext"]) &&
    typeof value["operationId"] === "string" && typeof value["planHash"] === "string" && typeof value["journalPath"] === "string" && typeof value["state"] === "string" &&
    typeof value["mutationState"] === "string" && typeof value["saved"] === "boolean" && typeof value["reopened"] === "boolean" && typeof value["orphanedCallPossible"] === "boolean" &&
    typeof value["hardStop"] === "boolean" && typeof value["mutationMayHaveOccurred"] === "boolean" && typeof value["nextSafeAction"] === "string" && typeof value["updatedAt"] === "string" &&
    typeof value["sequence"] === "number" && isRecord(value["context"]) && hash.safeParse(value["beforeRecordsSha256"]).success && receiptSchema.safeParse(value["preCheckpoint"]).success && Array.isArray(value["artifacts"]);
}
export function assertProjectOpenDatabaseUnchanged(input: unknown, checkpoint: CheckpointReceipt): Value {
  const value = verificationSchema.parse(input);
  if (value.source !== checkpoint.source || value.checkpoint !== checkpoint.checkpoint || value.receiptPath !== checkpoint.receiptPath ||
      value.checkpointSha256 !== checkpoint.checkpointSha256 || value.checkpointDumpSha256 !== checkpoint.checkpointDumpSha256 ||
      value.sourceDumpSha256 !== checkpoint.checkpointDumpSha256) { throw new Error("Project opening changed or lost its complete SQLite baseline."); }
  return value;
}

/** Opens an existing saved target only. The initial context may be Start Page,
 * so checkpoint authority comes from the explicit, registry-correlated target,
 * not a fabricated active editor. No project creation/replacement or save API.
 */
export class ProjectOpenExecutor {
  private readonly engine: ProjectOpenEngine;
  private readonly services: typeof dependencies;
  public constructor(engine: ProjectOpenEngine, overrides: ProjectOpenDependencies = {}) { this.engine = engine; this.services = { ...dependencies, ...overrides }; }
  private async runtime(fingerprint: Value): Promise<string> {
    validatePrivateFingerprint(fingerprint);
    const status = await this.engine.status();
    assertSubset(status.stableFingerprint, fingerprint, "Project-open runtime");
    const bundles = await this.engine.upstream.installedEasyedaBundles?.();
    if (bundles === undefined) { throw new Error("Project-open installed implementation is unavailable."); }
    await this.services.verifyLibraryNativeProfile(bundles.assetsRoot);
    return bundles.assetsRoot;
  }
  private async load(operationId: string): Promise<OpenJournal> {
    const journal = await this.services.loadOperation(operationId);
    if (!isJournal(journal)) { throw new Error("Not a valid project-open transaction journal."); }
    const target = projectOpenTargetSchema.parse(journal.plan.target);
    if (target.projectPath !== normalizeEasyedaProjectPath(target.projectPath) || !/\.eprj2$/iu.test(target.projectPath) ||
        canonicalJson(journal.plan.expectedContext) !== canonicalJson(targetContext(target)) || journal.preCheckpoint.source !== target.projectPath) { throw new Error("Project-open journal target or baseline disagrees."); }
    validateExpectedFingerprint(journal.plan.expectedFingerprint);
    if (journal.runtimeFingerprint !== undefined) { validateExpectedFingerprint(journal.runtimeFingerprint); }
    return journal;
  }
  private async record(journal: OpenJournal, phase: string, value: unknown): Promise<void> {
    journal.sequence += 1;
    journal.artifacts.push(await this.services.writePhaseArtifact(journal.operationId, journal.sequence, phase, value));
    journal.updatedAt = new Date().toISOString(); await this.services.updateOperation(journal);
  }
  private async unchanged(journal: OpenJournal): Promise<Value> {
    return assertProjectOpenDatabaseUnchanged(await this.services.verifyCheckpoint(journal.preCheckpoint.receiptPath,
      await this.services.checkpointPolicy(journal.plan.target.projectPath)), journal.preCheckpoint);
  }
  private readHistory(checkpoint: CheckpointReceipt, target: RecoveryNavigationTarget): ReturnType<typeof readNativeHistoryCheckpoint> {
    return this.services.readNativeHistoryCheckpoint({ checkpointPath: checkpoint.checkpoint, expectedSha256: checkpoint.checkpointSha256,
      projectUuid: target.projectUuid, libraryAtomHeaders: "preserve" });
  }
  private async durableProof(journal: OpenJournal): Promise<Value> {
    const beforeCheck = await this.unchanged(journal);
    // Re-read the original immutable checkpoint. A retained compact summary is
    // Not authority for imported ordering metadata or a substitute for bytes.
    const before = await this.readHistory(journal.preCheckpoint, journal.plan.target);
    const beforeHeaders = await nativeLibraryHeaderEvidence(before,
      { checkpointSha256: journal.preCheckpoint.checkpointSha256, projectUuid: journal.plan.target.projectUuid });
    const checkpoint = await this.services.createCheckpoint({ source: journal.plan.target.projectPath, outputDir: join(controlDataDirectory(), "checkpoints"), label: "project-open-after" },
      await this.services.checkpointPolicy(journal.plan.target.projectPath));
    const after = await this.readHistory(checkpoint, journal.plan.target);
    const afterHeaders = await nativeLibraryHeaderEvidence(after,
      { checkpointSha256: checkpoint.checkpointSha256, projectUuid: journal.plan.target.projectUuid });
    const recordsSha256 = libraryProjectRecordsHash(after);
    if (checkpoint.checkpointDumpSha256 !== journal.preCheckpoint.checkpointDumpSha256 ||
        libraryProjectRecordsHash(before) !== journal.beforeRecordsSha256 || recordsSha256 !== journal.beforeRecordsSha256 ||
        beforeHeaders.contentSha256 !== afterHeaders.contentSha256) { throw new Error("Project-open proof changed SQLite tables or materialized document records."); }
    assertProjectOpenDatabaseUnchanged(await this.services.verifyCheckpoint(checkpoint.receiptPath,
      await this.services.checkpointPolicy(journal.plan.target.projectPath)), checkpoint);
    await this.unchanged(journal);
    journal.finalCheckpoint = checkpoint;
    return { sqliteDumpSha256: checkpoint.checkpointDumpSha256, recordsSha256, documentCount: after.documents.length,
      allSqliteTablesUnchanged: true, allSelectedBranchDocumentsUnchanged: true, baselineVerification: beforeCheck,
      libraryHeaderEvidence: { before: beforeHeaders, after: afterHeaders, unchanged: true },
      checkpoint, scope: "Complete logical SQLite dump plus materialized selected-branch records. No unsaved-document equivalence or save is inferred." };
  }
  private async dispatch(journal: OpenJournal, phase: string, navigate: boolean): Promise<Value> {
    const fingerprint = journal.runtimeFingerprint ?? journal.plan.expectedFingerprint;
    const assetsRoot = await this.runtime(fingerprint);
    const prepared = await this.services.prepareRecoveryNavigation({ expectedContext: journal.plan.expectedContext,
      preCheckpoint: journal.preCheckpoint, assetsRoot, libraryAtomHeaders: "preserve",
      navigation: { navigate, requireExclusiveTabs: true, requireEditorReadiness: navigate } });
    if (canonicalJson(prepared.target) !== canonicalJson(journal.plan.target)) { throw new Error("Prepared project-open target differs from its sealed journal."); }
    if (prepared.libraryHeaderEvidence === undefined || prepared.libraryHeaderEvidence.checkpointSha256 !== journal.preCheckpoint.checkpointSha256 ||
        prepared.libraryHeaderEvidence.projectUuid !== journal.plan.target.projectUuid) { throw new Error("Prepared project opening lacks checkpoint-bound library header evidence."); }
    await this.unchanged(journal);
    journal.state = `${phase}-dispatching`; journal.hardStop = true;
    journal.nextSafeAction = "Await this single tracked navigation call; never retry an uncertain open.";
    await this.record(journal, `${phase}-prepared`, { target: prepared.target, codeSha256: sha256Text(prepared.code), navigate,
      libraryHeaderEvidence: prepared.libraryHeaderEvidence });
    const result = extractToolPayload(await this.engine.dispatchWithOrphanTracking(journal, phase, "easyeda_execute",
      { code: prepared.code, timeoutMs: 60_000, confirmWrite: true }, 70_000));
    if (!isRecord(result) || result["ok"] !== true || result["schema"] !== "easyeda-pro-control.recovery-navigation.v1") { throw new Error("Project-open native acknowledgment is missing."); }
    await this.record(journal, `${phase}-return`, result);
    return result;
  }
  public async openExisting(request: ProjectOpenInput): Promise<Value> {
    const input = projectOpenInputSchema.parse(structuredClone(request));
    const target = projectOpenTargetSchema.parse({ projectUuid: input.projectUuid, projectPath: normalizeEasyedaProjectPath(input.projectPath),
      documentUuid: input.documentUuid, documentType: input.documentType });
    if (!/\.eprj2$/iu.test(target.projectPath)) { throw new Error("Project-open source must be a saved .eprj2 project."); }
    if (this.engine.executionAuthorityValidator === undefined) { throw new Error("Tracked project opening requires retained execution authority."); }
    const operations = await this.services.listOperations();
    if (operations.some((entry) => !isTerminalOperation(entry))) { throw new Error("Resolve the incomplete transaction before opening another target."); }
    await this.runtime(input.expectedFingerprint);
    const checkpoint = await this.services.createCheckpoint({ source: target.projectPath, outputDir: join(controlDataDirectory(), "checkpoints"), label: "project-open-before" }, await this.services.checkpointPolicy(target.projectPath));
    const before = await this.readHistory(checkpoint, target);
    const libraryHeaderEvidence = await nativeLibraryHeaderEvidence(before, { checkpointSha256: checkpoint.checkpointSha256, projectUuid: target.projectUuid });
    const context = targetContext(target);
    deriveRecoveryNavigationTarget(context, before);
    const operationId = newOperationId();
    const plan: OpenPlan = { profile: PROFILE, target, expectedContext: context, expectedFingerprint: structuredClone(input.expectedFingerprint) };
    const journal: OpenJournal = { schema: OPERATION_SCHEMA, operationId, journalPath: operationPath(operationId), planHash: buildPlanHash(plan), plan,
      state: "planned", mutationState: "before", saved: false, reopened: false, orphanedCallPossible: false, hardStop: false, mutationMayHaveOccurred: false,
      nextSafeAction: "Open the exact checkpoint-proven existing target once.", context, preCheckpoint: checkpoint, beforeRecordsSha256: libraryProjectRecordsHash(before),
      sequence: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), artifacts: [] };
    await this.services.createOperation(journal);
    try {
      await this.record(journal, "before", { target, checkpoint, recordsSha256: journal.beforeRecordsSha256, documentCount: before.documents.length,
        libraryHeaderEvidence });
      const native = await this.dispatch(journal, "project-open", true);
      journal.context = structuredClone(await this.engine.assertContext(context, { allowTabChange: true }));
      if (!isRecord(native["document"]) || native["document"]["tabId"] !== journal.context.document.tabId || typeof native["openedProject"] !== "boolean" || typeof native["openedDocument"] !== "boolean") { throw new Error("Project-open tab acknowledgment disagrees with the exact active context."); }
      const proof = await this.durableProof(journal);
      await this.runtime(input.expectedFingerprint);
      await this.engine.assertContext(journal.context);
      journal.result = { context: journal.context, openedProject: native["openedProject"], openedDocument: native["openedDocument"], saved: false, proof };
      journal.state = "completed"; journal.hardStop = false;
      journal.nextSafeAction = "Existing target is open and the complete saved database is unchanged. Inspect exact live design state before editing.";
      await this.record(journal, "verified", journal.result); return summary(journal);
    } catch (error) { return this.failed(journal, error, "open-existing"); }
  }
  private async failed(journal: OpenJournal, error: unknown, action: FailureAction): Promise<never> {
    const diagnostic = { schema: "easyeda-pro-control.project-open-failure.v1", action,
      phase: failureStates.has(journal.state) ? journal.state : "unclassified-phase", category: failureCategory(error),
      orphanedCallPossible: journal.orphanedCallPossible };
    journal.state = journal.orphanedCallPossible ? "project-open-outcome-unknown" : "project-open-needs-review";
    journal.hardStop = true; journal.nextSafeAction = "Inspect the retained journal. Recover authority if necessary, then reconcile without opening, saving or retrying.";
    // Commit the stop before fallible evidence publication. Each failure is a
    // New immutable phase artifact; later inspection/reconciliation keeps it.
    await this.services.updateOperation(journal);
    try { await this.record(journal, "failure", diagnostic); }
    catch { throw transactionError(new Error("Project-open failure evidence could not be retained; the operation remains stopped."), journal); }
    throw transactionError(error, journal);
  }
  public async inspect(operationId: string): Promise<Value> { return summary(await this.load(operationId)); }
  public async inspectEditorTabs(operationId: string): Promise<Value> {
    const journal = await this.load(operationId);
    if (isTerminalOperation(journal) || journal.orphanedCallPossible) { throw new Error("Editor-tab recovery inspection requires one non-orphan incomplete project-open journal."); }
    await this.engine.assertRecoveryOperationIsolated(operationId);
    const fingerprint = journal.runtimeFingerprint ?? journal.plan.expectedFingerprint;
    await this.runtime(fingerprint);
    await this.unchanged(journal);
    const code = buildEditorTabsReadCode(journal.plan.target.projectUuid);
    journal.state = "editor-tabs-dispatching"; journal.hardStop = true;
    journal.nextSafeAction = "Await fixed read-only editor-tab inspection; no navigation or save is performed.";
    await this.record(journal, "editor-tabs-prepared", { codeSha256: sha256Text(code) });
    try {
      const snapshot = parseEditorTabsRead(extractToolPayload(await this.engine.dispatchWithOrphanTracking(journal, "editor-tabs", "easyeda_execute",
        { code, timeoutMs: 30_000, confirmWrite: true }, 40_000)));
      await this.record(journal, "editor-tabs-return", snapshot);
      const database = await this.unchanged(journal);
      await this.runtime(fingerprint);
      journal.state = "project-open-needs-review";
      journal.nextSafeAction = "Inspect the retained tab fields, then reconcile the existing open journal. Inspection does not complete it or repeat navigation.";
      await this.record(journal, "editor-tabs-verified", { database, snapshotSha256: sha256Text(canonicalJson(snapshot)) });
      return { ...summary(journal), action: "inspect-editor-tabs", editorTabs: snapshot, allSqliteTablesUnchanged: true };
    } catch (error) { return this.failed(journal, error, "inspect-editor-tabs"); }
  }
  public async recoverAuthority(operationId: string): Promise<Value> {
    const journal = await this.load(operationId);
    if (isTerminalOperation(journal)) { return summary(journal); }
    const confirmation = journal.orphanedCallPossible ? await this.engine.ensureRuntimeRestartChallenge(journal) : undefined;
    await this.engine.recoverDispatchAuthority(journal, confirmation, async () => { await this.runtime(journal.runtimeFingerprint ?? journal.plan.expectedFingerprint); });
    journal.state = "project-open-authority-recovered"; journal.hardStop = true;
    journal.nextSafeAction = "Reconcile the complete saved baseline and current exclusive editor state; no open is repeated.";
    await this.services.updateOperation(journal); return summary(journal);
  }
  public async rebindRuntime(operationId: string, fingerprint: Value): Promise<Value> {
    const journal = await this.load(operationId);
    if (isTerminalOperation(journal) || journal.orphanedCallPossible) { throw new Error("Only a non-orphan incomplete project-open can rebind its facade."); }
    await this.engine.assertRecoveryOperationIsolated(operationId);
    await this.runtime(fingerprint);
    assertFacadeOnlyRuntimeUpgrade(journal.plan.expectedFingerprint, fingerprint);
    journal.runtimeFingerprint = structuredClone(fingerprint); journal.state = "project-open-runtime-rebound"; journal.hardStop = true;
    await this.record(journal, "runtime-rebound", { fingerprint, originalPlanHash: journal.planHash }); return summary(journal);
  }
  public async reconcileNoMutation(operationId: string): Promise<Value> {
    const journal = await this.load(operationId);
    if (isTerminalOperation(journal)) { return summary(journal); }
    if (journal.orphanedCallPossible) { throw new Error("Recover retained authority before project-open reconciliation."); }
    await this.engine.assertRecoveryOperationIsolated(operationId);
    try {
      const inspected = await this.dispatch(journal, "project-open-reconcile", false);
      if (inspected["inspectedOnly"] !== true || typeof inspected["targetOpen"] !== "boolean") { throw new Error("Reconciliation did not prove read-only editor inspection."); }
      const proof = await this.durableProof(journal);
      await this.runtime(journal.runtimeFingerprint ?? journal.plan.expectedFingerprint);
      const finalInspection = await this.dispatch(journal, "project-open-reconcile-final", false);
      if (canonicalJson(finalInspection) !== canonicalJson(inspected)) { throw new Error("Editor context changed during project-open reconciliation."); }
      await this.unchanged(journal);
      journal.result = { navigationOutcome: "not-inferred", targetOpenNow: inspected["targetOpen"], saved: false, proof };
      journal.state = "reconciled-no-mutation"; journal.hardStop = false; journal.mutationMayHaveOccurred = false;
      journal.nextSafeAction = "Saved database is unchanged. No navigation was repeated and the earlier open result was not inferred.";
      await this.record(journal, "reconciled-no-mutation", journal.result); return summary(journal);
    } catch (error) { return this.failed(journal, error, "reconcile-open"); }
  }
}
