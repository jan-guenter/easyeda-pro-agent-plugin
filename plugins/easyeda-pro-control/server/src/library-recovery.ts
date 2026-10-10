/* eslint-disable import/max-dependencies -- Recovery composes existing runtime, checkpoint, artifact and library proofs without duplicating their policies. */
import { join } from "node:path";
import { z } from "zod";
import { controlDataDirectory, readArtifact, updateOperation } from "./artifacts.ts";
import { assertSubset, canonicalJson, extractToolPayload, isRecord, isTerminalOperation, sha256Json, sha256Text, validateExpectedFingerprint, validatePrivateFingerprint } from "./core.ts";
import type { EasyedaControlEngine, ExpectedContext } from "./engine.ts";
import type { LibraryJournal } from "./library-execution.ts";
import type { CheckpointReceipt } from "./checkpoint.ts";
import { assertFacadeOnlyRuntimeUpgrade } from "./design-execution.ts";
import { libraryExecutionKind } from "./library-runtime.ts";
import { readNativeHistoryCheckpoint } from "./native-history.ts";
import type { NativeHistorySnapshot } from "./native-history.ts";
import { libraryProjectRecordsHash } from "./library-persistence-proof.ts";
import { prepareRecoveryNavigation } from "./recovery-navigation.ts";
import { verifyLibraryNativeProfile } from "./library-native-profile.ts";
import { verifyDeviceAssociationNativeProfile } from "./device-native-profile.ts";
import { transactionError } from "./transaction-error.ts";
import { readLibraryBeforeRecoveryArtifact, readLibraryRecoveryArtifact, uniqueLibraryRecoveryArtifact, verifyRecoveredLibraryMutation } from "./library-recovery-state.ts";
import { classifyDocumentActivationContext, verifyDocumentActivationProject, verifyRetainedDocumentActivation } from "./document-activation.ts";
import type { DocumentActivationPlan } from "./document-activation.ts";
import { assertUnchangedLibraryCheckpoint } from "./library-checkpoint.ts";
import { verifySchematicNativeProfile } from "./native-profiles.ts";
import { assertDocumentCloseContext, buildDocumentCloseReconciliationExpression, validateDocumentCloseReconciliation, verifyDocumentCloseProject, verifyRetainedDocumentClose } from "./document-close.ts";
import type { DocumentClosePlan } from "./document-close.ts";
import { assertDocumentPageCreateContext, prepareDocumentPageCreate } from "./document-page-create.ts";
import { decodeExactReadEnvelope } from "./exact-readers.ts";
import { wrapWithContextGuard } from "./runtime-scripts.ts";
import { assertUndispatchedLibraryPreparation, hasMissingLibraryPreparation, rederiveUndispatchedLibraryPlan } from "./library-undispatched-recovery.ts";

type Value = Record<string, unknown>;
export type LibraryRecoveryEngine = Pick<EasyedaControlEngine, "assertContext" | "assertRecoveryOperationIsolated" | "awaitProjectUploads" | "checkpoint" | "context" | "dispatchWithOrphanTracking" | "ensureRuntimeRestartChallenge" | "recoverDispatchAuthority" | "exactRead"> & {
  readonly status: () => Promise<{ stableFingerprint: Value }>;
  readonly upstream: { readonly installedEasyedaBundles?: () => Promise<{ assetsRoot: string }> };
};
const optionalServices = { readArtifact, updateOperation, readNativeHistoryCheckpoint, prepareRecoveryNavigation, verifyLibraryNativeProfile, verifyDeviceAssociationNativeProfile, verifySchematicNativeProfile };
export interface LibraryRecoveryServices extends Partial<typeof optionalServices> {
  readonly load: (operationId: string) => Promise<LibraryJournal>;
  readonly record: (journal: LibraryJournal, phase: string, value: unknown) => Promise<void>;
}
function summary(journal: LibraryJournal): Value {
  return { operationId: journal.operationId, action: journal.plan.operation.action, state: journal.state, result: journal.result ?? null,
    saved: journal.saved, reopened: journal.reopened, hardStop: journal.hardStop, mutationMayHaveOccurred: journal.mutationMayHaveOccurred,
    orphanedCallPossible: journal.orphanedCallPossible, nextSafeAction: journal.nextSafeAction, journalPath: journal.journalPath, artifacts: journal.artifacts };
}
function sourceKind(context: ExpectedContext): string {
  const kind = new Map([[1, "schematic-source"], [2, "symbol-source"], [3, "pcb-source"], [4, "footprint-source"]]).get(context.document.documentType);
  if (kind === undefined) { throw new Error("Unsupported library recovery editor."); }
  return kind;
}
function sourceHash(value: Value): string {
  if (typeof value["source"] !== "string" || !value["source"]) { throw new Error("Library recovery source is incomplete."); }
  return sha256Json(value["source"]);
}
const hashSchema = z.string().regex(/^[a-f0-9]{64}$/u);
const fileIdentitySchema = z.object({ birthtimeNs: z.string(), ctimeNs: z.string(), dev: z.string(), ino: z.string() }).strict();
const checkpointSchema = z.object({ schema: z.literal("easyeda-pro-control.checkpoint.v2"), createdAt: z.string(),
  source: z.string().min(1), checkpoint: z.string().min(1), receiptPath: z.string().min(1),
  sourceSha256: hashSchema, checkpointSha256: hashSchema, sourceDumpSha256: hashSchema,
  checkpointDumpSha256: hashSchema, receiptSha256: hashSchema, sourceIdentity: fileIdentitySchema,
  checkpointIdentity: fileIdentitySchema }).loose();
function receipt(value: unknown): CheckpointReceipt { return checkpointSchema.parse(value); }

/** Recovery only. It never dispatches a library mutation, save, close, inverse
 * or export. A completed changed result requires the original returned ID and
 * original prepared plan, then the same whole-project durable proof as execute.
 */
export class LibraryRecoveryCoordinator {
  private readonly engine: LibraryRecoveryEngine;
  private readonly services: LibraryRecoveryServices & typeof optionalServices;
  public constructor(engine: LibraryRecoveryEngine, services: LibraryRecoveryServices) {
    this.engine = engine; this.services = { ...optionalServices, ...services };
  }
  private async load(operationId: string): Promise<LibraryJournal> {
    const journal = await this.services.load(operationId);
    validateExpectedFingerprint(journal.plan.expectedFingerprint);
    if (journal.runtimeFingerprint !== undefined) { validateExpectedFingerprint(journal.runtimeFingerprint); }
    return journal;
  }
  private async runtime(journal: LibraryJournal, requireContext = true): Promise<string> {
    const fingerprint = journal.runtimeFingerprint ?? journal.plan.expectedFingerprint;
    validatePrivateFingerprint(fingerprint);
    const status = await this.engine.status();
    assertSubset(status.stableFingerprint, fingerprint, "Library recovery runtime");
    const installed = await this.engine.upstream.installedEasyedaBundles?.();
    if (installed === undefined) { throw new Error("Library recovery native implementation is unavailable."); }
    const device = ["library.device.create", "library.device.modify", "library.device.model-transform", "library.symbol.modify", "document.page.rename", "document.page.create"].includes(journal.plan.operation.action);
    await (device ? this.services.verifyDeviceAssociationNativeProfile(installed.assetsRoot) : this.services.verifyLibraryNativeProfile(installed.assetsRoot));
    if (journal.plan.operation.action === "document.activate" || journal.plan.operation.action === "document.close" || journal.plan.operation.action === "document.page.rename" || journal.plan.operation.action === "document.page.create" || journal.plan.operation.action === "library.symbol.modify") { await this.services.verifySchematicNativeProfile(installed.assetsRoot); }
    if (requireContext) { await this.engine.assertContext(structuredClone(journal.context)); }
    return installed.assetsRoot;
  }
  private async isolated(journal: LibraryJournal): Promise<void> {
    if (journal.orphanedCallPossible) { throw new Error("Prove retained execution termination before library reconciliation/navigation."); }
    await this.engine.assertRecoveryOperationIsolated(journal.operationId);
  }
  private history(checkpoint: CheckpointReceipt, context: ExpectedContext): ReturnType<typeof readNativeHistoryCheckpoint> {
    const projectUuid = context.project.uuid ?? context.project.projectUuid;
    if (projectUuid === undefined || checkpoint.source !== context.project.path) { throw new Error("Library recovery checkpoint project/path differs."); }
    return this.services.readNativeHistoryCheckpoint({ checkpointPath: checkpoint.checkpoint, expectedSha256: checkpoint.checkpointSha256, projectUuid });
  }
  public async rebindRuntime(operationId: string, expectedFingerprint: Value): Promise<Value> {
    const journal = await this.load(operationId);
    if (isTerminalOperation(journal)) { throw new Error("Completed library journals retain their original runtime evidence."); }
    if (hasMissingLibraryPreparation(journal)) { throw new Error("Missing preparation must be reconciled or invalidated on its original compatible runtime; replacement-runtime recovery is unsupported."); }
    await this.isolated(journal);
    validatePrivateFingerprint(expectedFingerprint);
    const status = await this.engine.status();
    const current = status.stableFingerprint;
    assertSubset(current, expectedFingerprint, "Requested replacement library runtime");
    assertFacadeOnlyRuntimeUpgrade(journal.plan.expectedFingerprint, current);
    const oldFingerprint = journal.runtimeFingerprint ?? journal.plan.expectedFingerprint;
    journal.runtimeFingerprint = structuredClone(current);
    journal.state = "library-runtime-rebound-needs-reconciliation"; journal.hardStop = true;
    journal.nextSafeAction = journal.plan.operation.action === "document.close" ? "Original close plan retained. Reconcile the unchanged active editor and target presence without opening, closing or activating any tab." : "Original plan retained. Open its exact target if needed and reconcile without repeating the library operation.";
    await this.services.record(journal, "runtime-rebound", { oldFingerprint, newFingerprint: current, originalPlanHash: journal.planHash, activeTargetVerified: false });
    return summary(journal);
  }
  public async openTarget(operationId: string): Promise<Value> {
    const journal = await this.load(operationId);
    if (isTerminalOperation(journal)) { return summary(journal); }
    if (hasMissingLibraryPreparation(journal)) { throw new Error("Missing preparation must be reconciled or invalidated on its original compatible runtime without target navigation."); }
    if (journal.plan.operation.action === "document.activate") { throw new Error("Activation recovery never opens or reactivates a tab. Reconcile its current exact state instead."); }
    if (journal.plan.operation.action === "document.close") { throw new Error("Close recovery never opens, closes or reactivates a tab. Reconcile its current exact state instead."); }
    await this.isolated(journal);
    const assetsRoot = await this.runtime(journal, false);
    const prepared = await this.services.prepareRecoveryNavigation({ expectedContext: journal.plan.expectedContext, preCheckpoint: journal.preCheckpoint, assetsRoot });
    journal.state = "library-target-open-dispatching"; journal.hardStop = true;
    journal.nextSafeAction = "Await this single target navigation. Never repeat an uncertain open or the original mutation.";
    await this.services.record(journal, "target-open-prepared", { target: prepared.target, codeSha256: sha256Text(prepared.code) });
    try {
      const returned = extractToolPayload(await this.engine.dispatchWithOrphanTracking(journal, "library-target-open", "easyeda_execute", { code: prepared.code, timeoutMs: 60_000, confirmWrite: true }, 70_000));
      await this.services.record(journal, "target-open-return", returned);
      journal.context = structuredClone(await this.engine.assertContext(structuredClone(journal.plan.expectedContext), { allowTabChange: true }));
      journal.state = "library-target-opened-needs-reconciliation";
      journal.nextSafeAction = "Original target is open. Reconcile retained source and full durable evidence before any new action.";
      await this.services.record(journal, "target-opened", { context: journal.context });
      return summary(journal);
    } catch (error) {
      journal.state = "library-target-open-needs-recovery";
      journal.nextSafeAction = "Inspect retained target-navigation evidence; do not repeat an uncertain open.";
      await this.services.record(journal, "target-open-failed", { orphanedCallPossible: journal.orphanedCallPossible });
      throw transactionError(error, journal);
    }
  }
  public async recoverAuthority(operationId: string, runtimeRestartConfirmation?: string): Promise<Value> {
    const journal = await this.load(operationId);
    if (isTerminalOperation(journal)) { return summary(journal); }
    if (hasMissingLibraryPreparation(journal)) { throw new Error("Missing preparation must be reconciled or invalidated on its original compatible runtime without dispatch-authority recovery."); }
    const confirmation = runtimeRestartConfirmation ?? (journal.orphanedCallPossible ? await this.engine.ensureRuntimeRestartChallenge(journal) : undefined);
    const boundary = await this.engine.recoverDispatchAuthority(journal, confirmation, async () => { await this.runtime(journal, false); });
    try {
      if (journal.plan.operation.action === "document.activate") {
        const prepared = await this.activationPreparation(journal);
        await this.activationContext(prepared.plan);
      } else if (journal.plan.operation.action === "document.close") {
        const prepared = await this.closePreparation(journal);
        const context = structuredClone(await this.engine.assertContext(structuredClone(journal.plan.expectedContext)));
        assertDocumentCloseContext(prepared.plan, context);
      } else if (journal.plan.operation.action === "document.page.create") {
        const before = await this.history(receipt(journal.preCheckpoint), journal.plan.expectedContext);
        const plan = prepareDocumentPageCreate(journal.plan.operation, before, journal.plan.expectedContext);
        const context = structuredClone(await this.engine.assertContext(structuredClone(journal.plan.expectedContext)));
        assertDocumentPageCreateContext(plan, context);
      } else { journal.context = structuredClone(await this.engine.assertContext(structuredClone(journal.context), { allowTabChange: true })); }
      journal.state = "library-authority-recovered-needs-reconciliation"; journal.hardStop = true;
      journal.nextSafeAction = "Execution authority recovered. Reconcile without repeating the original library action.";
      await this.services.record(journal, "authority-recovered", { boundary: boundary ?? null, context: journal.context });
      return summary(journal);
    } catch (error) {
      journal.state = "library-authority-recovered-needs-target"; journal.hardStop = true;
      journal.nextSafeAction = journal.plan.operation.action === "document.close" || journal.plan.operation.action === "document.activate" ? "Prior execution terminated. Inspect the original and target tab state, then reconcile without another activation, close or open." : "Prior execution terminated. Open the original existing target, then reconcile; no mutation was repeated.";
      await this.services.record(journal, "authority-recovered-needs-target", { boundary: boundary ?? null });
      throw transactionError(error, journal);
    }
  }
  public async reconcile(operationId: string, requireNoMutation = false): Promise<Value> {
    const journal = await this.load(operationId);
    if (isTerminalOperation(journal)) { return summary(journal); }
    if (hasMissingLibraryPreparation(journal)) {
      // Read-only failures preserve the exact publication prefix for another
      // Inspection; the generic recovery catch must not append new evidence.
      try { return await this.invalidateUndispatchedPreparation(journal); }
      catch (error) { throw transactionError(error, journal); }
    }
    await this.isolated(journal);
    await this.runtime(journal, journal.plan.operation.action !== "document.activate");
    try {
      if (journal.plan.operation.action === "document.activate") { return await this.reconcileActivation(journal); }
      if (journal.plan.operation.action === "document.close") { return await this.reconcileClose(journal); }
      await this.engine.awaitProjectUploads(journal.context, journal, "library-reconcile-upload-barrier");
      const current = await this.engine.exactRead({ kind: sourceKind(journal.context) }, journal.context);
      if (sourceHash(current) !== journal.beforeSourceSha256) { throw new Error("Active source differs from the exact library baseline; no automatic source correction is permitted."); }
      const baseline = receipt(journal.preCheckpoint);
      const before = await this.history(baseline, journal.context);
      let preparedPageCreate: unknown;
      if (journal.plan.operation.action === "document.page.create") {
        preparedPageCreate = await readLibraryRecoveryArtifact(uniqueLibraryRecoveryArtifact(journal.artifacts, "page-create-prepared"), this.services.readArtifact);
        const expected = prepareDocumentPageCreate(journal.plan.operation, before, journal.plan.expectedContext);
        if (canonicalJson(expected) !== canonicalJson(preparedPageCreate) || canonicalJson(expected) !== canonicalJson(journal.pageCreatePlan)) { throw new Error("Retained page creation plan differs from its original operation and checkpoint."); }
        const originalContext = await this.engine.assertContext(structuredClone(journal.plan.expectedContext));
        assertDocumentPageCreateContext(expected, originalContext);
      }
      const checkpoint = await this.engine.checkpoint({ source: journal.context.project.path, outputDir: join(controlDataDirectory(), "checkpoints"), label: "library-reconciled" });
      const afterReceipt = receipt(checkpoint);
      const after = await this.history(afterReceipt, journal.context);
      let result: Value;
      const unchanged = baseline.checkpointDumpSha256 === afterReceipt.checkpointDumpSha256 && libraryProjectRecordsHash(before) === libraryProjectRecordsHash(after);
      if (unchanged) {
        result = { kind: "library-recovery", persistence: "complete-logical-database-and-project-records-unchanged", actionRepeated: false, saveInvoked: false, closeInvoked: false };
      } else {
        if (requireNoMutation) { throw new Error("Durable library changed; use explicit changed-result reconciliation, not the no-mutation action."); }
        const nativeReturn = await readLibraryRecoveryArtifact(uniqueLibraryRecoveryArtifact(journal.artifacts, "native-return"), this.services.readArtifact);
        const kind = libraryExecutionKind(journal.plan.operation);
        const device = kind === "project-device-create" || kind === "project-device-association" || kind === "project-device-transform";
        const preparedDevice = device ? await readLibraryRecoveryArtifact(uniqueLibraryRecoveryArtifact(journal.artifacts, "device-prepared"), this.services.readArtifact) : undefined;
        if (journal.devicePlan !== undefined && canonicalJson(journal.devicePlan) !== canonicalJson(preparedDevice)) { throw new Error("Journal and original prepared device artifact disagree."); }
        const preparedSymbol = kind === "project-symbol-metadata" ? await readLibraryRecoveryArtifact(uniqueLibraryRecoveryArtifact(journal.artifacts, "symbol-prepared"), this.services.readArtifact) : undefined;
        if (journal.symbolPlan !== undefined && canonicalJson(journal.symbolPlan) !== canonicalJson(preparedSymbol)) { throw new Error("Journal and original prepared symbol artifact disagree."); }
        const preparedPageRename = kind === "project-page-rename" ? await readLibraryRecoveryArtifact(uniqueLibraryRecoveryArtifact(journal.artifacts, "page-rename-prepared"), this.services.readArtifact) : undefined;
        if (journal.pageRenamePlan !== undefined && canonicalJson(journal.pageRenamePlan) !== canonicalJson(preparedPageRename)) { throw new Error("Journal and original prepared page rename artifact disagree."); }
        const verified = verifyRecoveredLibraryMutation({ operation: journal.plan.operation, before, after, nativeReturn,
          ...(journal.mutationReceipt === undefined ? {} : { retainedReceipt: journal.mutationReceipt }), ...(preparedDevice === undefined ? {} : { preparedDevice }),
          ...(preparedSymbol === undefined ? {} : { preparedSymbol }), ...(preparedPageRename === undefined ? {} : { preparedPageRename, expectedContext: journal.plan.expectedContext }),
          ...(preparedPageCreate === undefined ? {} : { preparedPageCreate, expectedContext: journal.plan.expectedContext }) });
        journal.mutationReceipt = verified.receipt;
        result = { kind, proof: verified.proof, createdId: verified.receipt.createdId, persistence: "complete-project-checkpoint-records-verified",
          actionRepeated: false, saveInvoked: false, closeInvoked: false, reopened: false,
          ...(kind === "project-symbol-metadata" || kind === "project-page-rename" || kind === "project-page-create" ? { currentGenerationLiveValidated: false } : {}) };
      }
      await this.runtime(journal);
      if (sourceHash(await this.engine.exactRead({ kind: sourceKind(journal.context) }, journal.context)) !== journal.beforeSourceSha256) { throw new Error("Active source changed during library reconciliation."); }
      const final = await this.engine.checkpoint({ receiptPath: afterReceipt.receiptPath });
      assertUnchangedLibraryCheckpoint(final, afterReceipt, "Reconciled durable library evidence changed before completion or its checkpoint verification failed.");
      if (journal.plan.operation.action === "document.page.rename" || journal.plan.operation.action === "document.page.create" || journal.plan.operation.action === "library.symbol.modify") { await this.engine.assertContext(structuredClone(journal.context)); }
      journal.finalCheckpoint = afterReceipt; journal.result = result; journal.hardStop = false;
      journal.state = unchanged ? "reconciled-no-mutation" : "completed";
      journal.mutationState = unchanged ? "before" : "after"; journal.mutationMayHaveOccurred = !unchanged;
      if (!unchanged) { journal.saved = true; journal.reopened = false; }
      journal.nextSafeAction = unchanged ? "Exact baseline recovered; no mutation or save was repeated." : "Original returned library mutation is durably verified. No library reopen or additional save is inferred.";
      await this.services.record(journal, "reconciled", { result, checkpoint: afterReceipt });
      return summary(journal);
    } catch (error) {
      journal.state = "library-reconciliation-needs-review"; journal.hardStop = true;
      journal.nextSafeAction = "Inspect retained source, original return and complete checkpoint proof. Do not repeat the library mutation or save.";
      await this.services.record(journal, "reconciliation-failed", { orphanedCallPossible: journal.orphanedCallPossible });
      throw transactionError(error, journal);
    }
  }

  private async invalidateUndispatchedPreparation(journal: LibraryJournal): Promise<Value> {
    assertUndispatchedLibraryPreparation(journal);
    await this.isolated(journal);
    await this.runtime(journal);
    const baseline = receipt(journal.preCheckpoint), context = journal.plan.expectedContext, original = canonicalJson(journal);
    const observed = await this.engine.assertContext(structuredClone(context));
    if (canonicalJson(observed) !== canonicalJson(context)) { throw new Error("Undispatched preparation requires its exact original context."); }
    const verified = await this.engine.checkpoint({ receiptPath: baseline.receiptPath });
    assertUnchangedLibraryCheckpoint(verified, baseline, "Undispatched preparation baseline verification failed.");
    const before = await this.history(baseline, context), preparedPlanSha256 = rederiveUndispatchedLibraryPlan(journal, before);
    const current = await this.engine.exactRead({ kind: sourceKind(context) }, context);
    if (sourceHash(current) !== journal.beforeSourceSha256) { throw new Error("Undispatched preparation active source differs from its original baseline."); }
    const descriptor = journal.artifacts[0];
    if (descriptor !== undefined) {
      const retained = await readLibraryBeforeRecoveryArtifact(descriptor, this.services.readArtifact);
      if (!isRecord(retained) || !isRecord(retained["source"]) || sourceHash(retained["source"]) !== journal.beforeSourceSha256 ||
          retained["projectRecordsSha256"] !== libraryProjectRecordsHash(before)) { throw new Error("Undispatched preparation before artifact contradicts its baseline."); }
    }
    // No upload barrier or native lifecycle call: those would acquire dispatch
    // Authority. Two verified durable observations must already be unchanged.
    const snapshot = await this.engine.checkpoint({ source: context.project.path, outputDir: join(controlDataDirectory(), "checkpoints"), label: "library-undispatched" });
    const afterReceipt = receipt(snapshot);
    const after = await this.history(afterReceipt, context);
    if (baseline.checkpointDumpSha256 !== afterReceipt.checkpointDumpSha256 || libraryProjectRecordsHash(before) !== libraryProjectRecordsHash(after) ||
        rederiveUndispatchedLibraryPlan(journal, after) !== preparedPlanSha256) { throw new Error("Undispatched preparation changed the complete logical database or project history."); }
    await this.runtime(journal);
    if (sourceHash(await this.engine.exactRead({ kind: sourceKind(context) }, context)) !== journal.beforeSourceSha256) { throw new Error("Undispatched preparation source changed during verification."); }
    const final = await this.engine.checkpoint({ receiptPath: afterReceipt.receiptPath });
    assertUnchangedLibraryCheckpoint(final, afterReceipt, "Undispatched preparation final checkpoint verification failed.");
    if (canonicalJson(await this.engine.assertContext(structuredClone(context))) !== canonicalJson(context)) { throw new Error("Undispatched preparation final context changed."); }
    await this.isolated(journal);
    if (canonicalJson(await this.load(journal.operationId)) !== original) { throw new Error("Undispatched preparation journal changed during verification."); }
    await this.runtime(journal);
    if (sourceHash(await this.engine.exactRead({ kind: sourceKind(context) }, context)) !== journal.beforeSourceSha256) { throw new Error("Undispatched preparation source changed after the final journal check."); }
    const finalRecheck = await this.engine.checkpoint({ receiptPath: afterReceipt.receiptPath });
    assertUnchangedLibraryCheckpoint(finalRecheck, afterReceipt, "Undispatched preparation final checkpoint changed after the journal check.");
    if (canonicalJson(await this.engine.assertContext(structuredClone(context))) !== canonicalJson(context)) { throw new Error("Undispatched preparation final context changed after the journal check."); }
    // One sealed update, not an additional artifact publication: a failure
    // Leaves either the original admissible prefix or this terminal journal.
    const terminal = structuredClone(journal);
    terminal.state = "plan-invalidated"; terminal.hardStop = false; terminal.finalCheckpoint = afterReceipt;
    terminal.updatedAt = new Date().toISOString();
    terminal.result = { kind: "undispatched-preparation-invalidation", actionDispatched: false, actionRepeated: false, saveInvoked: false,
      closeInvoked: false, openInvoked: false, activationInvoked: false, automaticRetry: false,
      persistence: "complete-logical-database-and-project-records-unchanged", originalJournalSha256: sha256Json(journal), preparedPlanSha256,
      projectRecordsSha256: libraryProjectRecordsHash(before), beforeSourceSha256: journal.beforeSourceSha256 };
    terminal.nextSafeAction = "Unpublished preparation invalidated; no lifecycle action was dispatched or inferred. Any new intent requires a new reviewed operation.";
    await this.services.updateOperation(terminal);
    return summary(terminal);
  }

  private async closePreparation(journal: LibraryJournal): Promise<{ plan: DocumentClosePlan; before: NativeHistorySnapshot }> {
    const before = await this.history(receipt(journal.preCheckpoint), journal.plan.expectedContext);
    const prepared = await readLibraryRecoveryArtifact(uniqueLibraryRecoveryArtifact(journal.artifacts, "close-prepared"), this.services.readArtifact);
    return { plan: verifyRetainedDocumentClose(journal.plan.operation, before, journal.plan.expectedContext, prepared, journal.closePlan), before };
  }

  private async reconcileClose(journal: LibraryJournal): Promise<Value> {
    const { plan, before } = await this.closePreparation(journal);
    const context = structuredClone(await this.engine.assertContext(structuredClone(journal.plan.expectedContext)));
    assertDocumentCloseContext(plan, context);
    await this.engine.awaitProjectUploads(context, journal, "close-reconcile-upload-barrier");
    if (sourceHash(await this.engine.exactRead({ kind: sourceKind(context) }, context)) !== journal.beforeSourceSha256) { throw new Error("Clean-close recovery active source differs from its retained baseline."); }
    const baseline = receipt(journal.preCheckpoint);
    const unchanged = await this.engine.checkpoint({ receiptPath: baseline.receiptPath });
    assertUnchangedLibraryCheckpoint(unchanged, baseline, "Clean-close recovery baseline changed before observation.");
    await this.runtime(journal);
    const code = wrapWithContextGuard(`return await ${buildDocumentCloseReconciliationExpression(plan)};`, context);
    journal.state = "close-reconciliation-observing"; journal.hardStop = true;
    await this.services.record(journal, "close-reconciliation-prepared", { planSha256: sha256Json(plan), codeSha256: sha256Text(code), lifecycleAction: false });
    const raw = await this.engine.dispatchWithOrphanTracking(journal, "close-reconciliation-observe", "easyeda_execute", { code, timeoutMs: 60_000, confirmWrite: true }, 70_000);
    const response = extractToolPayload(raw);
    const observation = validateDocumentCloseReconciliation(decodeExactReadEnvelope(response), plan);
    await this.services.record(journal, "close-reconciliation-return", observation);
    const afterCheckpoint = await this.engine.checkpoint({ source: context.project.path, outputDir: join(controlDataDirectory(), "checkpoints"), label: "close-reconciled" });
    const afterReceipt = receipt(afterCheckpoint);
    verifyDocumentCloseProject(plan, before, await this.history(afterReceipt, context));
    if (baseline.checkpointDumpSha256 !== afterReceipt.checkpointDumpSha256) { throw new Error("Clean-close recovery found a changed complete logical database."); }
    await this.runtime(journal);
    if (sourceHash(await this.engine.exactRead({ kind: sourceKind(context) }, context)) !== journal.beforeSourceSha256) { throw new Error("Clean-close recovery active source changed during verification."); }
    const final = await this.engine.checkpoint({ receiptPath: afterReceipt.receiptPath });
    assertUnchangedLibraryCheckpoint(final, afterReceipt, "Clean-close recovery checkpoint changed before completion.");
    const finalContext = structuredClone(await this.engine.assertContext(structuredClone(context)));
    assertDocumentCloseContext(plan, finalContext);
    const result = { ...observation, context: finalContext, persistence: "complete-logical-database-and-project-records-unchanged", actionRepeated: false,
      acknowledgmentInferred: false, currentGenerationLiveValidated: false, automaticInverse: false };
    journal.finalCheckpoint = afterReceipt; journal.result = result; journal.state = "reconciled-no-mutation";
    journal.hardStop = false; journal.mutationState = "before"; journal.mutationMayHaveOccurred = false;
    journal.saved = false; journal.reopened = false;
    journal.nextSafeAction = "Exact target presence and unchanged active source/full database verified. The original close attempt remains consumed; no lifecycle action was repeated.";
    await this.services.record(journal, "close-reconciled", { result, checkpoint: afterReceipt });
    return summary(journal);
  }

  private async activationPreparation(journal: LibraryJournal): Promise<{ plan: DocumentActivationPlan; before: NativeHistorySnapshot }> {
    const before = await this.history(receipt(journal.preCheckpoint), journal.plan.expectedContext);
    const prepared = await readLibraryRecoveryArtifact(uniqueLibraryRecoveryArtifact(journal.artifacts, "activation-prepared"), this.services.readArtifact);
    const plan = verifyRetainedDocumentActivation(journal.plan.operation, before, journal.plan.expectedContext, prepared, journal.activationPlan);
    return { plan, before };
  }

  private async activationContext(plan: DocumentActivationPlan): Promise<{ context: ExpectedContext; targetActive: boolean }> {
    const context = structuredClone(await this.engine.context());
    const targetActive = classifyDocumentActivationContext(plan, context);
    await this.engine.assertContext(structuredClone(context));
    return { context, targetActive };
  }

  private async reconcileActivation(journal: LibraryJournal): Promise<Value> {
    const { plan, before } = await this.activationPreparation(journal);
    const { context, targetActive } = await this.activationContext(plan);
    await this.engine.awaitProjectUploads(context, journal, "activation-reconcile-upload-barrier");
    const source = await this.engine.exactRead({ kind: sourceKind(context) }, context);
    if (!targetActive && sourceHash(source) !== journal.beforeSourceSha256) { throw new Error("Original editor source differs from its activation baseline."); }
    const afterCheckpoint = await this.engine.checkpoint({ source: context.project.path, outputDir: join(controlDataDirectory(), "checkpoints"), label: "activation-reconciled" });
    const afterReceipt = receipt(afterCheckpoint);
    verifyDocumentActivationProject(plan, before, await this.history(afterReceipt, context));
    if (receipt(journal.preCheckpoint).checkpointDumpSha256 !== afterReceipt.checkpointDumpSha256) { throw new Error("Activation recovery found a changed logical database."); }
    await this.runtime(journal, false);
    await this.engine.assertContext(structuredClone(context));
    if (sourceHash(await this.engine.exactRead({ kind: sourceKind(context) }, context)) !== sourceHash(source)) { throw new Error("Activation recovery editor source changed between observations."); }
    const final = await this.engine.checkpoint({ receiptPath: afterReceipt.receiptPath });
    assertUnchangedLibraryCheckpoint(final, afterReceipt, "Activation recovery checkpoint changed before completion or its verification failed.");
    await this.engine.assertContext(structuredClone(context));
    const result = { kind: "document-activate-recovery", profile: plan.profile, targetActive, context,
      persistence: "complete-logical-database-and-project-records-unchanged", actionRepeated: false, acknowledgmentInferred: false,
      saveInvoked: false, closeInvoked: false, openInvoked: false, currentGenerationLiveValidated: false };
    journal.finalCheckpoint = afterReceipt; journal.result = result; journal.state = "reconciled-no-mutation";
    journal.hardStop = false; journal.mutationState = "before"; journal.mutationMayHaveOccurred = false;
    journal.saved = false; journal.reopened = false;
    journal.nextSafeAction = "Exact current tab and unchanged complete project verified. No activation, open, close or Save was repeated.";
    await this.services.record(journal, "activation-reconciled", { result, checkpoint: afterReceipt });
    return summary(journal);
  }
}
