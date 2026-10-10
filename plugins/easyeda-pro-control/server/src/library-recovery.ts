/* eslint-disable import/max-dependencies -- Recovery composes existing runtime, checkpoint, artifact and library proofs without duplicating their policies. */
import { join } from "node:path";
import { z } from "zod";
import { controlDataDirectory, readArtifact } from "./artifacts.ts";
import { assertSubset, canonicalJson, extractToolPayload, isTerminalOperation, sha256Json, sha256Text, validateExpectedFingerprint, validatePrivateFingerprint } from "./core.ts";
import type { EasyedaControlEngine, ExpectedContext } from "./engine.ts";
import type { LibraryJournal } from "./library-execution.ts";
import type { CheckpointReceipt } from "./checkpoint.ts";
import { assertFacadeOnlyRuntimeUpgrade } from "./design-execution.ts";
import { libraryExecutionKind } from "./library-runtime.ts";
import { readNativeHistoryCheckpoint } from "./native-history.ts";
import { libraryProjectRecordsHash } from "./library-persistence-proof.ts";
import { prepareRecoveryNavigation } from "./recovery-navigation.ts";
import { verifyLibraryNativeProfile } from "./library-native-profile.ts";
import { verifyDeviceAssociationNativeProfile } from "./device-native-profile.ts";
import { transactionError } from "./transaction-error.ts";
import { readLibraryRecoveryArtifact, uniqueLibraryRecoveryArtifact, verifyRecoveredLibraryMutation } from "./library-recovery-state.ts";

type Value = Record<string, unknown>;
export type LibraryRecoveryEngine = Pick<EasyedaControlEngine, "assertContext" | "assertRecoveryOperationIsolated" | "awaitProjectUploads" | "checkpoint" | "dispatchWithOrphanTracking" | "ensureRuntimeRestartChallenge" | "recoverDispatchAuthority" | "exactRead"> & {
  readonly status: () => Promise<{ stableFingerprint: Value }>;
  readonly upstream: { readonly installedEasyedaBundles?: () => Promise<{ assetsRoot: string }> };
};
const optionalServices = { readArtifact, readNativeHistoryCheckpoint, prepareRecoveryNavigation, verifyLibraryNativeProfile, verifyDeviceAssociationNativeProfile };
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
    const device = ["library.device.create", "library.device.modify", "library.device.model-transform"].includes(journal.plan.operation.action);
    await (device ? this.services.verifyDeviceAssociationNativeProfile(installed.assetsRoot) : this.services.verifyLibraryNativeProfile(installed.assetsRoot));
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
    await this.isolated(journal);
    validatePrivateFingerprint(expectedFingerprint);
    const status = await this.engine.status();
    const current = status.stableFingerprint;
    assertSubset(current, expectedFingerprint, "Requested replacement library runtime");
    assertFacadeOnlyRuntimeUpgrade(journal.plan.expectedFingerprint, current);
    const oldFingerprint = journal.runtimeFingerprint ?? journal.plan.expectedFingerprint;
    journal.runtimeFingerprint = structuredClone(current);
    journal.state = "library-runtime-rebound-needs-reconciliation"; journal.hardStop = true;
    journal.nextSafeAction = "Original plan retained. Open its exact target if needed and reconcile without repeating the library operation.";
    await this.services.record(journal, "runtime-rebound", { oldFingerprint, newFingerprint: current, originalPlanHash: journal.planHash, activeTargetVerified: false });
    return summary(journal);
  }
  public async openTarget(operationId: string): Promise<Value> {
    const journal = await this.load(operationId);
    if (isTerminalOperation(journal)) { return summary(journal); }
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
    const confirmation = runtimeRestartConfirmation ?? (journal.orphanedCallPossible ? await this.engine.ensureRuntimeRestartChallenge(journal) : undefined);
    const boundary = await this.engine.recoverDispatchAuthority(journal, confirmation, async () => { await this.runtime(journal, false); });
    try {
      journal.context = structuredClone(await this.engine.assertContext(structuredClone(journal.context), { allowTabChange: true }));
      journal.state = "library-authority-recovered-needs-reconciliation"; journal.hardStop = true;
      journal.nextSafeAction = "Execution authority recovered. Reconcile without repeating the original library action.";
      await this.services.record(journal, "authority-recovered", { boundary: boundary ?? null, context: journal.context });
      return summary(journal);
    } catch (error) {
      journal.state = "library-authority-recovered-needs-target"; journal.hardStop = true;
      journal.nextSafeAction = "Prior execution terminated. Open the original existing target, then reconcile; no mutation was repeated.";
      await this.services.record(journal, "authority-recovered-needs-target", { boundary: boundary ?? null });
      throw transactionError(error, journal);
    }
  }
  public async reconcile(operationId: string, requireNoMutation = false): Promise<Value> {
    const journal = await this.load(operationId);
    if (isTerminalOperation(journal)) { return summary(journal); }
    await this.isolated(journal);
    await this.runtime(journal);
    try {
      await this.engine.awaitProjectUploads(journal.context, journal, "library-reconcile-upload-barrier");
      const current = await this.engine.exactRead({ kind: sourceKind(journal.context) }, journal.context);
      if (sourceHash(current) !== journal.beforeSourceSha256) { throw new Error("Active source differs from the exact library baseline; no automatic source correction is permitted."); }
      const baseline = receipt(journal.preCheckpoint);
      const before = await this.history(baseline, journal.context);
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
        const verified = verifyRecoveredLibraryMutation({ operation: journal.plan.operation, before, after, nativeReturn,
          ...(journal.mutationReceipt === undefined ? {} : { retainedReceipt: journal.mutationReceipt }), ...(preparedDevice === undefined ? {} : { preparedDevice }) });
        journal.mutationReceipt = verified.receipt;
        result = { kind, proof: verified.proof, createdId: verified.receipt.createdId, persistence: "complete-project-checkpoint-records-verified",
          actionRepeated: false, saveInvoked: false, closeInvoked: false, reopened: false };
      }
      await this.runtime(journal);
      if (sourceHash(await this.engine.exactRead({ kind: sourceKind(journal.context) }, journal.context)) !== journal.beforeSourceSha256) { throw new Error("Active source changed during library reconciliation."); }
      const final = await this.engine.checkpoint({ receiptPath: afterReceipt.receiptPath });
      if (!("sourceChanged" in final) || final.sourceChanged !== false || !("checkpointMatchesReceipt" in final) || final.checkpointMatchesReceipt !== true ||
          final.receiptPath !== afterReceipt.receiptPath || final.checkpoint !== afterReceipt.checkpoint ||
          final.checkpointSha256 !== afterReceipt.checkpointSha256 || final.checkpointDumpSha256 !== afterReceipt.checkpointDumpSha256) { throw new Error("Reconciled durable library evidence changed before completion."); }
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
}
