/* oxlint-disable import/max-dependencies -- This executor composes existing runtime, journal, checkpoint, artifact and typed-proof modules instead of duplicating their security boundaries. */
import { join } from "node:path";
import { archiveExternalEvidence, controlDataDirectory, createOperation, ensureManagedDirectory, loadOperation, operationPath, publishManagedAttachmentExclusive, reserveEvidencePaths, updateOperation, writePhaseArtifact } from "./artifacts.ts";
import { listQualifiedOperationStates } from "./closed-symbol-terminal-admission.ts";
import { OPERATION_SCHEMA, assertSubset, buildPlanHash, extractToolPayload, isRecord, isTerminalOperation, newOperationId, sha256Json, validatePrivateFingerprint } from "./core.ts";
import { decodeExactReadEnvelope } from "./exact-readers.ts";
import type { DispatchOperationJournal, EasyedaControlEngine, ExpectedContext } from "./engine.ts";
import type { CheckpointReceipt } from "./checkpoint.ts";
import { compileLibraryOperation, libraryOperationSchema, listLibraryOperationCapabilities } from "./library-operations.ts";
import type { LibraryOperation } from "./library-operations.ts";
import { LIBRARY_EXECUTION_PROFILE, LIBRARY_FILE_EXECUTION_MAX_BYTES, buildLibraryExecutionExpression, decodeLibraryFileResult, libraryExecutionKind, libraryExportRefusalReason, validateLibraryMetadata } from "./library-runtime.ts";
import type { LibraryOpenScope } from "./library-runtime.ts";
import { assertProjectLibraryWriteTarget, libraryProjectRecordsHash, projectLibraryOpenTarget, verifyProjectLibraryEffect, verifyProjectLibraryMetadata } from "./library-persistence-proof.ts";
import { readNativeHistoryCheckpoint } from "./native-history.ts";
import type { NativeHistorySnapshot } from "./native-history.ts";
import { wrapWithContextGuard } from "./runtime-scripts.ts";
import { verifyLibraryNativeProfile } from "./library-native-profile.ts";
import { buildDeviceAssociationExpression, prepareDeviceAssociation, verifyDeviceAssociationEffect } from "./device-association.ts";
import type { DeviceAssociationPlan } from "./device-association.ts";
import { verifyDeviceAssociationNativeProfile } from "./device-native-profile.ts";
import { DEVICE_CREATE_PROFILE, buildDeviceCreateExpression, prepareDeviceCreate, verifyDeviceCreateEffect } from "./device-create.ts";
import type { DeviceCreatePlan } from "./device-create.ts";
import { deviceRequestedModel, validateDeviceModelMetadata } from "./device-model.ts";
import { LibraryRecoveryCoordinator } from "./library-recovery.ts";
import { libraryMutationReceipt } from "./library-recovery-state.ts";
import type { LibraryMutationReceipt } from "./library-recovery-state.ts";
import { transactionError } from "./transaction-error.ts";
import { DEVICE_TRANSFORM_PROFILE, buildDeviceTransformExpression, prepareDeviceTransform, verifyDeviceTransformEffect } from "./device-transform.ts";
import type { DeviceTransformPlan } from "./device-transform.ts";
import { PROJECT_SYMBOL_METADATA_PROFILE, buildProjectSymbolMetadataExpression, prepareProjectSymbolMetadata, verifyProjectSymbolMetadataEffect } from "./project-symbol-metadata.ts";
import type { ProjectSymbolMetadataPlan } from "./project-symbol-metadata.ts";
import { buildDocumentActivationExpression, documentActivationContext, prepareDocumentActivation, validateDocumentActivationResult, verifyDocumentActivationProject } from "./document-activation.ts";
import type { DocumentActivationPlan } from "./document-activation.ts";
import { assertUnchangedLibraryCheckpoint } from "./library-checkpoint.ts";
import { verifySchematicNativeProfile } from "./native-profiles.ts";
import { DOCUMENT_PAGE_RENAME_PROFILE, buildDocumentPageRenameExpression, buildDocumentPageRenameReadbackExpression, prepareDocumentPageRename, validateDocumentPageRenameReadback, verifyDocumentPageRenameEffect } from "./document-page-rename.ts";
import type { DocumentPageRenamePlan } from "./document-page-rename.ts";
import { assertDocumentCloseContext, buildDocumentCloseExpression, prepareDocumentClose, validateDocumentCloseResult, verifyDocumentCloseProject } from "./document-close.ts";
import type { DocumentClosePlan } from "./document-close.ts";
import { DOCUMENT_PAGE_CREATE_PROFILE, buildDocumentPageCreateExpression, prepareDocumentPageCreate, verifyDocumentPageCreateEffect } from "./document-page-create.ts";
import type { DocumentPageCreatePlan } from "./document-page-create.ts";
import { PROJECT_SYMBOL_CREATE_PROFILE, buildProjectSymbolCreateExpression, prepareProjectSymbolCreate, verifyProjectSymbolCreateEffect } from "./project-symbol-create.ts";
import type { ProjectSymbolCreatePlan } from "./project-symbol-create.ts";
import { DOCUMENT_CONTAINER_RENAME_PROFILE, prepareDocumentContainerRename, verifyDocumentContainerRenameEffect } from "./document-container-rename.ts";
import type { DocumentContainerRenamePlan } from "./document-container-rename.ts";
import { buildDocumentContainerRenameExpression, buildDocumentContainerRenameReadbackExpression, validateDocumentContainerRenameReadback } from "./document-container-rename-runtime.ts";
import { verifyDocumentContainerRenameNativeProfile } from "./document-container-rename-native-profile.ts";
import { PROJECT_PCB_CREATE_PROFILE, prepareProjectPcbCreate, verifyProjectPcbCreateEffect } from "./project-pcb-create.ts";
import { PROJECT_SCHEMATIC_CREATE_PROFILE, prepareProjectSchematicCreate, verifyProjectSchematicCreateEffect } from "./project-schematic-create.ts";
import type { ProjectPcbCreatePlan } from "./project-pcb-create.ts";
import type { ProjectSchematicCreatePlan } from "./project-schematic-create.ts";
import { buildProjectPcbCreateExpression, buildProjectPcbCreateReadbackExpression, validateProjectPcbCreateReadback } from "./project-pcb-create-runtime.ts";
import { buildProjectSchematicCreateExpression, buildProjectSchematicCreateReadbackExpression, validateProjectSchematicCreateReadback } from "./project-schematic-create-runtime.ts";

import { verifyProjectSchematicCreateNativeProfile } from "./project-schematic-create-native-profile.ts";
import { assertLibraryExecutionLifecycle, libraryExecutionLifecycleAdvice, libraryExecutionLifecycleRefusal } from "./library-execution-lifecycle.ts";

type Value = Record<string, unknown>;
const libraryExecutionServices = { readNativeHistoryCheckpoint, verifyLibraryNativeProfile, verifyDeviceAssociationNativeProfile, verifySchematicNativeProfile, verifyDocumentContainerRenameNativeProfile, verifyProjectSchematicCreateNativeProfile };
/** Internal dependency seams for deterministic offline transaction tests.
 * The MCP constructs the executor with the reviewed implementations only.
 */
export type LibraryExecutionServices = Partial<typeof libraryExecutionServices>;
export interface LibraryExecuteInput {
  readonly operation: unknown;
  readonly expectedContext: ExpectedContext;
  readonly expectedFingerprint: Value;
  readonly confirmWrite?: true | undefined;
}
export interface LibraryJournal extends DispatchOperationJournal {
  plan: Value & { profile: typeof LIBRARY_EXECUTION_PROFILE; operation: LibraryOperation; expectedFingerprint: Value; expectedContext: ExpectedContext };
  beforeSourceSha256: string;
  preCheckpoint: CheckpointReceipt;
  finalCheckpoint?: CheckpointReceipt;
  result?: Value;
  runtimeFingerprint?: Value;
  mutationReceipt?: LibraryMutationReceipt;
  devicePlan?: DeviceAssociationPlan | DeviceCreatePlan | DeviceTransformPlan;
  symbolPlan?: ProjectSymbolMetadataPlan;
  symbolCreatePlan?: ProjectSymbolCreatePlan;
  pageRenamePlan?: DocumentPageRenamePlan;
  documentRenamePlan?: DocumentContainerRenamePlan;
  pageCreatePlan?: DocumentPageCreatePlan;
  pcbCreatePlan?: ProjectPcbCreatePlan;
  schematicCreatePlan?: ProjectSchematicCreatePlan;
  activationPlan?: DocumentActivationPlan;
  closePlan?: DocumentClosePlan;
}
const sourceKind = (context: ExpectedContext): string => {
  const kind = new Map([[1, "schematic-source"], [2, "symbol-source"], [3, "pcb-source"], [4, "footprint-source"]]).get(context.document.documentType);
  if (kind === undefined) { throw new Error("Library execution requires a supported design or library editor."); }
  return kind;
};
function projectId(context: ExpectedContext): string {
  const id = context.project.uuid ?? context.project.projectUuid;
  if (typeof id !== "string" || id.length === 0) { throw new Error("Exact project identity is missing."); }
  return id;
}
function sourceHash(payload: Value): string {
  if (typeof payload["source"] !== "string" || payload["source"].length === 0) { throw new Error("Complete active document source is missing."); }
  return sha256Json(payload["source"]);
}
function resolvedMetadataOwner(operation: LibraryOperation, metadata: Value, expectedOwner: string | null | undefined, localProject: boolean, history: NativeHistorySnapshot | undefined, projectSymbolMetadata: unknown): unknown {
  if (localProject) {
    if (history === undefined) { throw new Error("Project metadata checkpoint is unavailable."); }
    return verifyProjectLibraryMetadata(operation, metadata, history, projectSymbolMetadata);
  }
  if (metadata["libraryUuid"] !== expectedOwner) { throw new Error("Returned external library owner differs from the requested library."); }
  return null;
}
function summary(journal: LibraryJournal): Value {
  return { operationId: journal.operationId, action: journal.plan.operation.action, state: journal.state, result: journal.result ?? null,
    saved: journal.saved, reopened: journal.reopened, mutationMayHaveOccurred: journal.mutationMayHaveOccurred, orphanedCallPossible: journal.orphanedCallPossible,
    nextSafeAction: journal.nextSafeAction, journalPath: journal.journalPath, artifacts: journal.artifacts,
    ...libraryExecutionLifecycleAdvice(journal.plan.operation.action, journal.nextSafeAction) };
}
function isCheckpoint(value: unknown): value is CheckpointReceipt {
  if (!isRecord(value) || value["schema"] !== "easyeda-pro-control.checkpoint.v2") { return false; }
  return ["createdAt", "source", "checkpoint", "sourceSha256", "checkpointSha256", "sourceDumpSha256", "checkpointDumpSha256", "receiptSha256", "receiptPath"].every((key) => typeof value[key] === "string") && isRecord(value["sourceIdentity"]) && isRecord(value["checkpointIdentity"]);
}
function isLibraryJournal(value: unknown): value is LibraryJournal {
  return isRecord(value) && isRecord(value["plan"]) && value["plan"]["profile"] === LIBRARY_EXECUTION_PROFILE && isRecord(value["plan"]["expectedContext"]) && isRecord(value["plan"]["expectedFingerprint"]) && typeof value["operationId"] === "string" && typeof value["planHash"] === "string" && typeof value["journalPath"] === "string" && typeof value["state"] === "string" && typeof value["mutationState"] === "string" && typeof value["saved"] === "boolean" && typeof value["reopened"] === "boolean" && typeof value["orphanedCallPossible"] === "boolean" && typeof value["hardStop"] === "boolean" && typeof value["mutationMayHaveOccurred"] === "boolean" && typeof value["nextSafeAction"] === "string" && typeof value["updatedAt"] === "string" && typeof value["sequence"] === "number" && typeof value["beforeSourceSha256"] === "string" && /^[a-f0-9]{64}$/u.test(value["beforeSourceSha256"]) && isRecord(value["context"]) && isCheckpoint(value["preCheckpoint"]) && Array.isArray(value["artifacts"]);
}
async function libraryJournal(operationId: string): Promise<LibraryJournal> {
  const journal = await loadOperation(operationId);
  if (!isLibraryJournal(journal)) { throw new Error("Invalid library-execution journal."); }
  libraryOperationSchema.parse(journal.plan.operation);
  return journal;
}

/** Execute reviewed typed operations only. No caller JS, arbitrary paths, Save dialogs, or retries. */
export class LibraryExecutor {
  private readonly engine: EasyedaControlEngine;
  private readonly recovery: LibraryRecoveryCoordinator;
  private readonly services: typeof libraryExecutionServices;
  public constructor(engine: EasyedaControlEngine, services: LibraryExecutionServices = {}) {
    this.engine = engine;
    this.services = { ...libraryExecutionServices, ...services };
    this.recovery = new LibraryRecoveryCoordinator(engine, { ...this.services, load: libraryJournal, record: (journal, phase, value): Promise<void> => LibraryExecutor.record(journal, phase, value) });
  }

  private async runtime(input: LibraryExecuteInput, context = input.expectedContext): Promise<void> {
    validatePrivateFingerprint(input.expectedFingerprint);
    const status = await this.engine.status();
    assertSubset(status.stableFingerprint, input.expectedFingerprint, "Library execution fingerprint");
    await this.engine.assertContext(structuredClone(context));
  }
  private async nativeProfile(deviceAssociation = false, activation = false, documentRename = false, schematicCreate = false): Promise<void> {
    const installed = await this.engine.upstream.installedEasyedaBundles?.();
    if (installed === undefined) { throw new Error("Native library implementation identity is unavailable."); }
    if (schematicCreate) { await this.services.verifyProjectSchematicCreateNativeProfile(installed.assetsRoot); }
    else if (documentRename) { await this.services.verifyDocumentContainerRenameNativeProfile(installed.assetsRoot); }
    else { await (deviceAssociation ? this.services.verifyDeviceAssociationNativeProfile(installed.assetsRoot) : this.services.verifyLibraryNativeProfile(installed.assetsRoot)); }
    if (activation) { await this.services.verifySchematicNativeProfile(installed.assetsRoot); }
  }
  private async checkpoint(context: ExpectedContext, label: string): Promise<CheckpointReceipt> {
    const checkpoint = await this.engine.checkpoint({ source: context.project.path, outputDir: join(controlDataDirectory(), "checkpoints"), label });
    if (!isCheckpoint(checkpoint)) { throw new Error("Library checkpoint receipt missing."); }
    return checkpoint;
  }
  private history(checkpoint: CheckpointReceipt, context: ExpectedContext, operation?: LibraryOperation): Promise<NativeHistorySnapshot> {
    const preserve = operation !== undefined && ["document.pcb.create", "document.schematic.create", "document.pcb.rename", "document.schematic.rename"].includes(operation.action);
    return this.services.readNativeHistoryCheckpoint({ checkpointPath: checkpoint.checkpoint, expectedSha256: checkpoint.checkpointSha256, projectUuid: projectId(context),
      ...(preserve ? { documentRecordHistory: "preserve" } : {}) });
  }
  private static async record(journal: LibraryJournal, phase: string, value: unknown): Promise<void> {
    journal.sequence += 1;
    journal.artifacts.push(await writePhaseArtifact(journal.operationId, journal.sequence, phase, value));
    journal.updatedAt = new Date().toISOString();
    await updateOperation(journal);
  }
  private async dispatch(input: LibraryExecuteInput, journal: LibraryJournal, operation: LibraryOperation, phase: string, association?: DeviceAssociationPlan | DeviceCreatePlan | DeviceTransformPlan | ProjectSymbolMetadataPlan | ProjectSymbolCreatePlan | DocumentPageRenamePlan | DocumentPageCreatePlan | DocumentContainerRenamePlan | ProjectPcbCreatePlan | ProjectSchematicCreatePlan, openScope?: LibraryOpenScope): Promise<unknown> {
    assertLibraryExecutionLifecycle(operation);
    await this.runtime(input);
    const nativeSymbolMetadata = operation.action === "library.symbol.get" && operation.libraryUuid === projectId(input.expectedContext);
    const kind = libraryExecutionKind(operation);
    await this.nativeProfile(association !== undefined || nativeSymbolMetadata, operation.action === "document.activate" || operation.action === "document.close" || operation.action === "document.page.rename" || operation.action === "document.page.create" || operation.action === "library.symbol.modify", kind === "project-document-rename" || kind === "project-pcb-create", kind === "project-schematic-create");
    if (kind.startsWith("project-") || kind === "document-activate" || kind === "document-close") {
      // Admission can scan substantial retained evidence. Reprove the baseline
      // After those awaits, immediately before the journaled native dispatch.
      const baseline = await this.engine.checkpoint({ receiptPath: journal.preCheckpoint.receiptPath });
      assertUnchangedLibraryCheckpoint(baseline, journal.preCheckpoint, "Durable project changed during final library admission or its checkpoint verification failed.");
      const active = await this.engine.exactRead({ kind: sourceKind(input.expectedContext) }, input.expectedContext);
      if (sourceHash(active) !== journal.beforeSourceSha256) { throw new Error("Active design changed during final library admission."); }
    }
    journal.state = `${phase}-dispatching`; journal.hardStop = true;
    journal.nextSafeAction = "Await the single native call; do not retry an ambiguous result.";
    await updateOperation(journal);
    let expression: string;
    if (operation.action === "document.activate") {
      if (journal.activationPlan === undefined) { throw new Error("Document activation preparation is missing."); }
      expression = buildDocumentActivationExpression(journal.activationPlan);
    }
    else if (operation.action === "document.close") {
      if (journal.closePlan === undefined) { throw new Error("Document close preparation is missing."); }
      expression = buildDocumentCloseExpression(journal.closePlan);
    }
    else if (association === undefined) { expression = buildLibraryExecutionExpression(operation, nativeSymbolMetadata, openScope); }
    else if (association.profile === DEVICE_CREATE_PROFILE) { expression = buildDeviceCreateExpression(association); }
    else if (association.profile === DEVICE_TRANSFORM_PROFILE) { expression = buildDeviceTransformExpression(association); }
    else if (association.profile === PROJECT_SYMBOL_METADATA_PROFILE) { expression = buildProjectSymbolMetadataExpression(association, input.expectedContext); }
    else if (association.profile === PROJECT_SYMBOL_CREATE_PROFILE) { expression = buildProjectSymbolCreateExpression(association, input.expectedContext); }
    else if (association.profile === DOCUMENT_PAGE_RENAME_PROFILE) { expression = buildDocumentPageRenameExpression(association, input.expectedContext); }
    else if (association.profile === DOCUMENT_CONTAINER_RENAME_PROFILE) { expression = buildDocumentContainerRenameExpression(association, input.expectedContext); }
    else if (association.profile === DOCUMENT_PAGE_CREATE_PROFILE) { expression = buildDocumentPageCreateExpression(association, input.expectedContext); }
    else if (association.profile === PROJECT_PCB_CREATE_PROFILE) { expression = buildProjectPcbCreateExpression(association, input.expectedContext); }
    else if (association.profile === PROJECT_SCHEMATIC_CREATE_PROFILE) { expression = buildProjectSchematicCreateExpression(association, input.expectedContext); }
    else { expression = buildDeviceAssociationExpression(association); }
    const code = wrapWithContextGuard(`return await ${expression};`, input.expectedContext);
    const requiresEarlyRetention = kind === "project-symbol-create" || kind === "project-page-create" || kind === "project-page-rename" || kind === "project-document-rename" || kind === "project-pcb-create" || kind === "project-schematic-create";
    let mutationIdentityRetained = false, settledResultObserved = false;
    let invalidMutationResult: { readonly error: unknown } | undefined;
    const retainSettledResult = requiresEarlyRetention ? async (raw: unknown): Promise<void> => {
      if (settledResultObserved) { throw new Error("Native mutation identity retention must not repeat."); }
      settledResultObserved = true;
      let mutationReceipt: LibraryMutationReceipt, nativeReturn: unknown;
      try {
        nativeReturn = decodeExactReadEnvelope(extractToolPayload(raw));
        mutationReceipt = libraryMutationReceipt(operation, nativeReturn);
      } catch (error) {
        // A settled refusal or malformed acknowledgment has no attributable
        // Mutation identity. Preserve its error without inventing retention or
        // Reclassifying completed native execution as an unsettled transport.
        invalidMutationResult = { error }; return;
      }
      journal.mutationReceipt = mutationReceipt;
      // Storage failures are different: leave the callback rejected so the
      // Engine retains quarantine and never claims durable result publication.
      await LibraryExecutor.record(journal, "native-return", nativeReturn);
      mutationIdentityRetained = true;
    } : undefined;
    const raw = await this.engine.dispatchWithOrphanTracking(journal, phase, "easyeda_execute", { code, timeoutMs: 60_000, confirmWrite: true }, 70_000, undefined, retainSettledResult);
    if (invalidMutationResult !== undefined) { throw invalidMutationResult.error; }
    if (requiresEarlyRetention && !mutationIdentityRetained) { throw new Error("Native mutation identity was not retained at the settled dispatch boundary."); }
    return extractToolPayload(raw);
  }

  private async pageRenameReadback(input: LibraryExecuteInput, journal: LibraryJournal, plan: DocumentPageRenamePlan): Promise<void> {
    await this.runtime(input);
    await this.nativeProfile(true, true);
    const expression = buildDocumentPageRenameReadbackExpression(plan, input.expectedContext);
    const code = wrapWithContextGuard(`return await ${expression};`, input.expectedContext);
    const raw = await this.engine.dispatchWithOrphanTracking(journal, "page-rename-readback", "easyeda_execute", { code, timeoutMs: 60_000, confirmWrite: true }, 70_000);
    const result = validateDocumentPageRenameReadback(decodeExactReadEnvelope(extractToolPayload(raw)), plan);
    await LibraryExecutor.record(journal, "page-rename-readback", result);
  }
  private async documentRenameReadback(input: LibraryExecuteInput, journal: LibraryJournal, plan: DocumentContainerRenamePlan, phase: string): Promise<void> {
    await this.runtime(input);
    await this.nativeProfile(false, false, true);
    const code = wrapWithContextGuard(`return await ${buildDocumentContainerRenameReadbackExpression(plan, input.expectedContext)};`, input.expectedContext);
    const raw = await this.engine.dispatchWithOrphanTracking(journal, phase, "easyeda_execute", { code, timeoutMs: 60_000, confirmWrite: true }, 70_000);
    const result = validateDocumentContainerRenameReadback(decodeExactReadEnvelope(extractToolPayload(raw)), plan);
    await LibraryExecutor.record(journal, phase, result);
  }

  private async pcbCreateReadback(input: LibraryExecuteInput, journal: LibraryJournal, plan: ProjectPcbCreatePlan, phase: string): Promise<void> {
    await this.runtime(input);
    await this.nativeProfile(false, false, true);
    const createdId = journal.mutationReceipt?.createdId;
    if (typeof createdId !== "string") { throw new TypeError("PCB creation readback requires the retained native identity."); }
    const code = wrapWithContextGuard(`return await ${buildProjectPcbCreateReadbackExpression(plan, input.expectedContext, createdId)};`, input.expectedContext);
    const raw = await this.engine.dispatchWithOrphanTracking(journal, phase, "easyeda_execute", { code, timeoutMs: 60_000, confirmWrite: true }, 70_000);
    const result = validateProjectPcbCreateReadback(decodeExactReadEnvelope(extractToolPayload(raw)), createdId);
    await LibraryExecutor.record(journal, phase, result);
  }
  private async schematicCreateReadback(input: LibraryExecuteInput, journal: LibraryJournal, plan: ProjectSchematicCreatePlan, phase: string): Promise<void> {
    await this.runtime(input);
    await this.nativeProfile(false, false, false, true);
    const createdId = journal.mutationReceipt?.createdId;
    if (typeof createdId !== "string") { throw new TypeError("schematic creation readback requires the retained native identity."); }
    const code = wrapWithContextGuard(`return await ${buildProjectSchematicCreateReadbackExpression(plan, input.expectedContext, createdId)};`, input.expectedContext);
    const raw = await this.engine.dispatchWithOrphanTracking(journal, phase, "easyeda_execute", { code, timeoutMs: 60_000, confirmWrite: true }, 70_000);
    const result = validateProjectSchematicCreateReadback(decodeExactReadEnvelope(extractToolPayload(raw)), createdId);
    await LibraryExecutor.record(journal, phase, result);
  }

  public async execute(request: LibraryExecuteInput): Promise<Value> {
    const input = structuredClone(request);
    const operation = libraryOperationSchema.parse(input.operation);
    assertLibraryExecutionLifecycle(operation);
    const kind = libraryExecutionKind(operation);
    const compiled = compileLibraryOperation(operation);
    const mutation = kind === "project-footprint-write" || kind === "project-device-association" || kind === "project-device-create" || kind === "project-device-transform" || kind === "project-symbol-metadata" || kind === "project-symbol-create" || kind === "project-page-rename" || kind === "project-document-rename" || kind === "project-page-create" || kind === "project-pcb-create" || kind === "project-schematic-create";
    if ((mutation || kind === "document-open" || kind === "document-activate" || kind === "document-close") && input.confirmWrite !== true) { throw new Error("Library/context changes require explicit confirmation."); }
    if (kind === "project-symbol-metadata" && "target" in operation && "uuid" in operation.target &&
        operation.target.uuid === (input.expectedContext.document.uuid ?? input.expectedContext.document.documentUuid)) {
      throw new Error("Symbol metadata editing requires an inactive target; the active editor source must remain unchanged.");
    }
    if (this.engine.executionAuthorityValidator === undefined) { throw new Error("Retained runtime execution authority is required for tracked library calls."); }
    const operations = await listQualifiedOperationStates();
    if (operations.some((entry) => !isTerminalOperation(entry))) { throw new Error("Resolve the incomplete transaction before library execution."); }
    if (compiled.documentTypes !== null && !compiled.documentTypes.includes(input.expectedContext.document.documentType)) { throw new Error("Wrong active editor for library/export action."); }
    await this.runtime(input);
    const context = structuredClone(await this.engine.assertContext(structuredClone(input.expectedContext)));
    const baselineUploads = await this.engine.awaitProjectUploads(context);
    const beforeSource = await this.engine.exactRead({ kind: sourceKind(context) }, context);
    const checkpoint = await this.checkpoint(context, "library-before");
    const projectMetadata = kind === "metadata-read" && compiled.target?.libraryUuid === projectId(context);
    const beforeHistory = mutation || kind === "document-open" || kind === "document-activate" || kind === "document-close" || projectMetadata ? await this.history(checkpoint, context, operation) : undefined;
    let association: DeviceAssociationPlan | DeviceCreatePlan | DeviceTransformPlan | ProjectSymbolMetadataPlan | ProjectSymbolCreatePlan | DocumentPageRenamePlan | DocumentPageCreatePlan | DocumentContainerRenamePlan | ProjectPcbCreatePlan | ProjectSchematicCreatePlan | undefined;
    if (mutation) {
      if (beforeHistory === undefined) { throw new Error("Missing library inventory."); }
      if (kind === "project-footprint-write") { assertProjectLibraryWriteTarget(operation, beforeHistory); }
    }
    const openTarget = kind === "document-open" && beforeHistory !== undefined ? projectLibraryOpenTarget(operation, beforeHistory) : undefined;
    if (kind === "document-open" && openTarget === undefined) { throw new Error("Document-open checkpoint target is missing."); }
    const activationPlan = kind === "document-activate" && beforeHistory !== undefined ? prepareDocumentActivation(operation, beforeHistory, context) : undefined;
    if (kind === "document-activate" && activationPlan === undefined) { throw new Error("Activation checkpoint is unavailable."); }
    const closePlan = kind === "document-close" && beforeHistory !== undefined ? prepareDocumentClose(operation, beforeHistory, context) : undefined;
    if (kind === "document-close" && closePlan === undefined) { throw new Error("Clean-close checkpoint is unavailable."); }
    const pageCreatePlan = kind === "project-page-create" && beforeHistory !== undefined ? prepareDocumentPageCreate(operation, beforeHistory, context) : undefined;
    if (kind === "project-page-create" && pageCreatePlan === undefined) { throw new Error("Page creation checkpoint is unavailable."); }
    const symbolCreatePlan = kind === "project-symbol-create" && beforeHistory !== undefined ? prepareProjectSymbolCreate(operation, beforeHistory, context) : undefined;
    if (kind === "project-symbol-create" && symbolCreatePlan === undefined) { throw new Error("Symbol creation checkpoint is unavailable."); }
    const documentRenamePlan = kind === "project-document-rename" && beforeHistory !== undefined ? prepareDocumentContainerRename(operation, beforeHistory, context) : undefined;
    if (kind === "project-document-rename" && documentRenamePlan === undefined) { throw new Error("Document rename checkpoint is unavailable."); }
    const pcbCreatePlan = kind === "project-pcb-create" && beforeHistory !== undefined ? prepareProjectPcbCreate(operation, beforeHistory, context) : undefined;
    if (kind === "project-pcb-create" && pcbCreatePlan === undefined) { throw new Error("PCB creation checkpoint is unavailable."); }
    const schematicCreatePlan = kind === "project-schematic-create" && beforeHistory !== undefined ? prepareProjectSchematicCreate(operation, beforeHistory, context) : undefined;
    if (kind === "project-schematic-create" && schematicCreatePlan === undefined) { throw new Error("schematic creation checkpoint is unavailable."); }
    const operationId = newOperationId();
    const plan: LibraryJournal["plan"] = { profile: LIBRARY_EXECUTION_PROFILE, operation: structuredClone(operation), expectedFingerprint: structuredClone(input.expectedFingerprint), expectedContext: structuredClone(context) };
    const journal: LibraryJournal = { schema: OPERATION_SCHEMA, operationId, journalPath: operationPath(operationId), planHash: buildPlanHash(plan), plan,
      state: "planned", mutationState: "before", saved: false, reopened: false, orphanedCallPossible: false, hardStop: false,
      mutationMayHaveOccurred: false, nextSafeAction: "Dispatch the reviewed typed operation once.", context: structuredClone(context), preCheckpoint: checkpoint,
      beforeSourceSha256: sourceHash(beforeSource), sequence: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), artifacts: [] };
    await createOperation(journal);
    await LibraryExecutor.record(journal, "before", { source: beforeSource, baselineUploads, ...(beforeHistory === undefined ? {} : { projectRecordsSha256: libraryProjectRecordsHash(beforeHistory) }) });
    try {
      if (pcbCreatePlan !== undefined) {
        association = pcbCreatePlan; journal.pcbCreatePlan = structuredClone(association);
        await LibraryExecutor.record(journal, "pcb-create-prepared", association);
      }
      if (schematicCreatePlan !== undefined) {
        association = schematicCreatePlan; journal.schematicCreatePlan = structuredClone(association);
        await LibraryExecutor.record(journal, "schematic-create-prepared", association);
      }
      if (documentRenamePlan !== undefined) {
        association = documentRenamePlan; journal.documentRenamePlan = structuredClone(association);
        await LibraryExecutor.record(journal, "document-rename-prepared", association);
      }
      if (closePlan !== undefined) {
        journal.closePlan = closePlan;
        await LibraryExecutor.record(journal, "close-prepared", journal.closePlan);
      }
      if (activationPlan !== undefined) {
        journal.activationPlan = activationPlan;
        await LibraryExecutor.record(journal, "activation-prepared", journal.activationPlan);
      }
      if (kind === "project-symbol-metadata") {
        if (beforeHistory === undefined) { throw new Error("Symbol checkpoint is unavailable."); }
        association = prepareProjectSymbolMetadata(operation, beforeHistory);
        journal.symbolPlan = structuredClone(association);
        await LibraryExecutor.record(journal, "symbol-prepared", association);
      }
      if (kind === "project-page-rename") {
        if (beforeHistory === undefined) { throw new Error("Page rename checkpoint is unavailable."); }
        association = prepareDocumentPageRename(operation, beforeHistory, context);
        journal.pageRenamePlan = structuredClone(association);
        await LibraryExecutor.record(journal, "page-rename-prepared", association);
      }
      if (pageCreatePlan !== undefined) {
        association = pageCreatePlan;
        journal.pageCreatePlan = structuredClone(association);
        await LibraryExecutor.record(journal, "page-create-prepared", association);
      }
      if (symbolCreatePlan !== undefined) {
        association = symbolCreatePlan;
        journal.symbolCreatePlan = structuredClone(association);
        await LibraryExecutor.record(journal, "symbol-create-prepared", association);
      }
      if (kind === "project-device-association" || kind === "project-device-create" || kind === "project-device-transform") {
        if (beforeHistory === undefined) { throw new Error("Device checkpoint is unavailable."); }
        const model = deviceRequestedModel(operation);
        let metadata: unknown;
        if (model !== undefined) {
          const read = libraryOperationSchema.parse({ id: "device-model-read", action: "library.model3d.get", libraryUuid: model.libraryUuid, target: { uuid: model.uuid } });
          const first = decodeExactReadEnvelope(await this.dispatch(input, journal, read, "model-read-first"));
          await LibraryExecutor.record(journal, "model-first", first);
          const second = decodeExactReadEnvelope(await this.dispatch(input, journal, read, "model-read-second"));
          await LibraryExecutor.record(journal, "model-second", second);
          if (!isRecord(first) || !isRecord(second) || first["kind"] !== "metadata-read" || second["kind"] !== "metadata-read" || sha256Json(first) !== sha256Json(second)) { throw new Error("Existing model metadata changed between observations."); }
          metadata = validateDeviceModelMetadata(second["metadata"], model).metadata;
        }
        if (kind === "project-device-create") { association = prepareDeviceCreate(operation, beforeHistory, metadata); }
        else if (kind === "project-device-transform") { association = prepareDeviceTransform(operation, beforeHistory); }
        else { association = prepareDeviceAssociation(operation, beforeHistory, metadata); }
        journal.devicePlan = structuredClone(association);
        await LibraryExecutor.record(journal, "device-prepared", association);
      }
      const check = await this.engine.checkpoint({ receiptPath: checkpoint.receiptPath });
      assertUnchangedLibraryCheckpoint(check, checkpoint, "Durable project changed before library dispatch or its checkpoint verification failed.");
      const recheck = await this.engine.exactRead({ kind: sourceKind(context) }, context);
      if (sourceHash(recheck) !== sourceHash(beforeSource)) { throw new Error("Active design changed before library dispatch."); }
      journal.mutationMayHaveOccurred = mutation;
      const envelope = await this.dispatch(input, journal, operation, "execute", association, openTarget === undefined ? undefined : { ...openTarget, projectUuid: projectId(context) });
      const mutationIdentityRetained = kind === "project-symbol-create" || kind === "project-page-create" || kind === "project-page-rename" || kind === "project-document-rename" || kind === "project-pcb-create" || kind === "project-schematic-create";
      if (mutation && !mutationIdentityRetained) { journal.mutationReceipt = libraryMutationReceipt(operation, decodeExactReadEnvelope(envelope)); }
      if (!mutationIdentityRetained && (mutation || kind === "document-open" || kind === "document-activate" || kind === "document-close" || kind === "metadata-read")) { await LibraryExecutor.record(journal, "native-return", decodeExactReadEnvelope(envelope)); }
      if (association?.profile === DOCUMENT_PAGE_RENAME_PROFILE) { await this.pageRenameReadback(input, journal, association); }
      if (association?.profile === DOCUMENT_CONTAINER_RENAME_PROFILE) { await this.documentRenameReadback(input, journal, association, "document-rename-readback"); }
      if (association?.profile === PROJECT_PCB_CREATE_PROFILE) { await this.pcbCreateReadback(input, journal, association, "pcb-create-readback"); }
      if (association?.profile === PROJECT_SCHEMATIC_CREATE_PROFILE) { await this.schematicCreateReadback(input, journal, association, "schematic-create-readback"); }
      let finalContext: ExpectedContext = context;
      let result: Value;
      if (kind === "document-close") {
        if (journal.closePlan === undefined || beforeHistory === undefined) { throw new Error("Clean-close preparation is missing."); }
        const closed = validateDocumentCloseResult(decodeExactReadEnvelope(envelope), journal.closePlan);
        finalContext = structuredClone(await this.engine.assertContext(structuredClone(context)));
        assertDocumentCloseContext(journal.closePlan, finalContext);
        await this.engine.awaitProjectUploads(finalContext, journal, "library-close-upload-barrier");
        const final = await this.checkpoint(finalContext, "library-close-after");
        verifyDocumentCloseProject(journal.closePlan, beforeHistory, await this.history(final, finalContext));
        if (checkpoint.checkpointDumpSha256 !== final.checkpointDumpSha256) { throw new Error("Document close changed the complete logical database."); }
        journal.finalCheckpoint = final;
        result = { ...closed, context: finalContext, persistence: "complete-logical-database-and-project-records-unchanged", currentGenerationLiveValidated: false,
          automaticInverse: false, editorUndoAndExportCachesRestored: false };
      } else if (kind === "document-activate") {
        if (journal.activationPlan === undefined || beforeHistory === undefined) { throw new Error("Activation preparation is missing."); }
        const activation = validateDocumentActivationResult(decodeExactReadEnvelope(envelope), journal.activationPlan);
        finalContext = structuredClone(await this.engine.assertContext(documentActivationContext(journal.activationPlan)));
        await this.engine.awaitProjectUploads(finalContext, journal, "library-activation-upload-barrier");
        const final = await this.checkpoint(finalContext, "library-activation-after");
        verifyDocumentActivationProject(journal.activationPlan, beforeHistory, await this.history(final, finalContext));
        if (checkpoint.checkpointDumpSha256 !== final.checkpointDumpSha256) { throw new Error("Document activation changed the complete logical database."); }
        const targetSource = await this.engine.exactRead({ kind: sourceKind(finalContext) }, finalContext);
        await this.runtime(input, finalContext);
        if (sourceHash(await this.engine.exactRead({ kind: sourceKind(finalContext) }, finalContext)) !== sourceHash(targetSource)) { throw new Error("Activated document source changed during verification."); }
        journal.finalCheckpoint = final;
        result = { ...activation, context: finalContext, targetSourceSha256: sourceHash(targetSource), persistence: "complete-logical-database-and-project-records-unchanged", currentGenerationLiveValidated: false };
      } else if (kind === "document-open") {
        const opened = decodeExactReadEnvelope(envelope);
        if (!isRecord(opened) || opened["kind"] !== "document-open" || openTarget === undefined) { throw new Error("Document-open acknowledgment missing."); }
        finalContext = await this.engine.context();
        if (projectId(finalContext) !== projectId(context) || finalContext.project.path !== context.project.path || (finalContext.document.uuid ?? finalContext.document.documentUuid) !== openTarget.uuid || finalContext.document.documentType !== openTarget.documentType || finalContext.document.tabId !== opened["tabId"] || (openTarget.metadataOwnerUuid !== undefined && finalContext.document["parentLibraryUuid"] !== openTarget.metadataOwnerUuid)) { throw new Error("Opened document context does not match the exact target."); }
        await this.engine.awaitProjectUploads(finalContext, journal, "library-open-upload-barrier");
        const final = await this.checkpoint(finalContext, "library-open-after");
        if (beforeHistory === undefined || libraryProjectRecordsHash(await this.history(final, finalContext)) !== libraryProjectRecordsHash(beforeHistory)) { throw new Error("Opening a document altered durable project records."); }
        result = { kind, context: finalContext, saved: false };
      } else {
        await this.runtime(input);
        const afterSource = await this.engine.exactRead({ kind: sourceKind(context) }, context);
        if (sourceHash(afterSource) !== sourceHash(beforeSource)) { throw new Error("Library/export operation altered the active design source."); }
        if (kind === "file-export") {
          if (!("maxBytes" in operation)) { throw new Error("File operation bound is missing."); }
          const file = decodeLibraryFileResult(envelope, operation.maxBytes);
          const directory = await ensureManagedDirectory(join(controlDataDirectory(), "exports", operationId));
          const reservation = await reserveEvidencePaths({ resultPath: join(directory, "result.json"), receiptPath: join(directory, "receipt.json") });
          const attachment = await publishManagedAttachmentExclusive(join(directory, "payload.bin"), "Native library export", file.bytes, "native-file-export");
          const receipt = await archiveExternalEvidence({ reservation, request: operation, result: { name: file.name, mime: file.mime, bytes: file.bytes.length, sha256: file.sha256 }, metadata: { operationId, context, sourceSha256: sourceHash(afterSource), fabricationApproved: false }, attachments: [attachment] });
          result = { kind, name: file.name, mime: file.mime, attachment, receipt, fabricationApproved: false };
        } else if (kind === "metadata-read") {
          const first = decodeExactReadEnvelope(envelope);
          const second = decodeExactReadEnvelope(await this.dispatch(input, journal, operation, "metadata-recheck"));
          await LibraryExecutor.record(journal, "metadata-return-recheck", second);
          if (!isRecord(first) || !isRecord(second) || sha256Json(first) !== sha256Json(second)) { throw new Error("Library metadata changed between observations."); }
          const metadata = validateLibraryMetadata(second["metadata"], operation);
          const resolvedLibrary = resolvedMetadataOwner(operation, metadata, compiled.target?.libraryUuid, projectMetadata, beforeHistory, second["projectSymbolMetadata"]);
          result = { kind, metadata, resolvedLibrary, readConsistency: { stable: true, attempts: 2, sha256: sha256Json(metadata) } };
        } else {
          const acknowledgment = decodeExactReadEnvelope(envelope);
          let expectedTargetId: string | undefined;
          if (association?.profile === PROJECT_SYMBOL_METADATA_PROFILE || association?.profile === DOCUMENT_PAGE_RENAME_PROFILE || association?.profile === DOCUMENT_CONTAINER_RENAME_PROFILE) { expectedTargetId = association.targetUuid; }
          else if (association !== undefined && association.profile !== DEVICE_CREATE_PROFILE && association.profile !== DOCUMENT_PAGE_CREATE_PROFILE && association.profile !== PROJECT_SYMBOL_CREATE_PROFILE && association.profile !== PROJECT_PCB_CREATE_PROFILE && association.profile !== PROJECT_SCHEMATIC_CREATE_PROFILE) { expectedTargetId = association.deviceUuid; }
          if (!isRecord(acknowledgment) || acknowledgment["kind"] !== kind || beforeHistory === undefined ||
              (expectedTargetId !== undefined && acknowledgment["targetId"] !== expectedTargetId)) { throw new Error("Library write result missing."); }
          const createdId = typeof acknowledgment["createdId"] === "string" ? acknowledgment["createdId"] : undefined;
          await this.engine.awaitProjectUploads(context, journal, "library-write-upload-barrier");
          const final = await this.checkpoint(context, "library-after");
          const afterHistory = await this.history(final, context, operation);
          let proof: Value;
          if (association === undefined) { proof = verifyProjectLibraryEffect(operation, beforeHistory, afterHistory, createdId); }
          else if (association.profile === DEVICE_CREATE_PROFILE) { proof = verifyDeviceCreateEffect(association, beforeHistory, afterHistory, createdId); }
          else if (association.profile === DEVICE_TRANSFORM_PROFILE) { proof = verifyDeviceTransformEffect(association, beforeHistory, afterHistory); }
          else if (association.profile === PROJECT_SYMBOL_METADATA_PROFILE) { proof = verifyProjectSymbolMetadataEffect(association, beforeHistory, afterHistory); }
          else if (association.profile === PROJECT_SYMBOL_CREATE_PROFILE) { proof = verifyProjectSymbolCreateEffect(association, beforeHistory, afterHistory, createdId); }
          else if (association.profile === DOCUMENT_PAGE_RENAME_PROFILE) { proof = verifyDocumentPageRenameEffect(association, beforeHistory, afterHistory); }
          else if (association.profile === DOCUMENT_CONTAINER_RENAME_PROFILE) { proof = verifyDocumentContainerRenameEffect(association, beforeHistory, afterHistory); }
          else if (association.profile === DOCUMENT_PAGE_CREATE_PROFILE) { proof = verifyDocumentPageCreateEffect(association, beforeHistory, afterHistory, createdId); }
          else if (association.profile === PROJECT_PCB_CREATE_PROFILE) { proof = verifyProjectPcbCreateEffect(association, beforeHistory, afterHistory, createdId); }
          else if (association.profile === PROJECT_SCHEMATIC_CREATE_PROFILE) { proof = verifyProjectSchematicCreateEffect(association, beforeHistory, afterHistory, createdId); }
          else { proof = verifyDeviceAssociationEffect(association, beforeHistory, afterHistory); }
          journal.finalCheckpoint = final;
          journal.saved = kind !== "project-document-rename" && kind !== "project-pcb-create" && kind !== "project-schematic-create"; journal.mutationState = "after";
          result = { kind, proof, createdId: createdId ?? null, persistence: "complete-project-checkpoint-records-verified", reopened: false,
            ...(kind === "project-symbol-metadata" || kind === "project-symbol-create" || kind === "project-page-rename" || kind === "project-page-create" || kind === "project-document-rename" || kind === "project-pcb-create" || kind === "project-schematic-create" ? { currentGenerationLiveValidated: false } : {}),
            ...(kind === "project-document-rename" || kind === "project-pcb-create" || kind === "project-schematic-create" ? { saveInvoked: false } : {}) };
        }
        if (!mutation) {
          await this.engine.awaitProjectUploads(context, journal, "library-read-upload-barrier");
          const unchanged = await this.engine.checkpoint({ receiptPath: checkpoint.receiptPath });
          assertUnchangedLibraryCheckpoint(unchanged, checkpoint, "Read/export changed the durable project or its checkpoint verification failed.");
        }
      }
      await this.runtime(input, finalContext);
      await this.nativeProfile(association !== undefined || (operation.action === "library.symbol.get" && operation.libraryUuid === projectId(context)), kind === "document-activate" || kind === "document-close" || kind === "project-page-rename" || kind === "project-page-create" || kind === "project-symbol-metadata", kind === "project-document-rename" || kind === "project-pcb-create", kind === "project-schematic-create");
      if (kind !== "document-open") {
        if (kind !== "document-activate" && sourceHash(await this.engine.exactRead({ kind: sourceKind(context) }, context)) !== journal.beforeSourceSha256) { throw new Error("Active source changed before library result completion."); }
        const finalReceipt = journal.finalCheckpoint ?? checkpoint;
        const finalCheck = await this.engine.checkpoint({ receiptPath: finalReceipt.receiptPath });
        assertUnchangedLibraryCheckpoint(finalCheck, finalReceipt, "Durable library evidence changed before completion or its checkpoint verification failed.");
        if (kind === "document-activate" || kind === "document-close" || kind === "project-page-rename" || kind === "project-page-create" || kind === "project-symbol-metadata" || kind === "project-symbol-create") { await this.engine.assertContext(structuredClone(finalContext)); }
        if (association?.profile === DOCUMENT_CONTAINER_RENAME_PROFILE) {
          await this.documentRenameReadback(input, journal, association, "document-rename-final-readback");
          if (sourceHash(await this.engine.exactRead({ kind: sourceKind(context) }, context)) !== journal.beforeSourceSha256) { throw new Error("Active source changed during final document rename observation."); }
          assertUnchangedLibraryCheckpoint(await this.engine.checkpoint({ receiptPath: finalReceipt.receiptPath }), finalReceipt, "Durable document rename evidence changed during final readback.");
          await this.engine.assertContext(structuredClone(finalContext));
        }
        if (association?.profile === PROJECT_PCB_CREATE_PROFILE) {
          await this.pcbCreateReadback(input, journal, association, "pcb-create-final-readback");
          if (sourceHash(await this.engine.exactRead({ kind: sourceKind(context) }, context)) !== journal.beforeSourceSha256) { throw new Error("Active source changed during final PCB creation observation."); }
          assertUnchangedLibraryCheckpoint(await this.engine.checkpoint({ receiptPath: finalReceipt.receiptPath }), finalReceipt, "Durable PCB creation evidence changed during final readback.");
          await this.engine.assertContext(structuredClone(finalContext));
        }
        if (association?.profile === PROJECT_SCHEMATIC_CREATE_PROFILE) {
          await this.schematicCreateReadback(input, journal, association, "schematic-create-final-readback");
          if (sourceHash(await this.engine.exactRead({ kind: sourceKind(context) }, context)) !== journal.beforeSourceSha256) { throw new Error("Active source changed during final schematic creation observation."); }
          assertUnchangedLibraryCheckpoint(await this.engine.checkpoint({ receiptPath: finalReceipt.receiptPath }), finalReceipt, "Durable schematic creation evidence changed during final readback.");
          await this.engine.assertContext(structuredClone(finalContext));
        }
      }
      journal.result = result; journal.state = "completed"; journal.hardStop = false;
      journal.nextSafeAction = mutation ? "Exact durable library records verified; editor reopen and connected fixture validation remain separate claims." : "Retain the managed result and journal; no design save was called.";
      await LibraryExecutor.record(journal, "verified", result);
      return summary(journal);
    } catch (error) {
      journal.state = journal.orphanedCallPossible ? "library-outcome-unknown" : "library-needs-review";
      journal.hardStop = true; journal.nextSafeAction = "Inspect this journal and current state. Do not repeat the operation or save after an unverified outcome.";
      await updateOperation(journal); throw transactionError(error, journal);
    }
  }

  public static async inspect(operationId: string): Promise<Value> {
    return summary(await libraryJournal(operationId));
  }

  public recoverAuthority(operationId: string, runtimeRestartConfirmation?: string): Promise<Value> {
    return this.recovery.recoverAuthority(operationId, runtimeRestartConfirmation);
  }

  public preflightReconcile(operationId: string): Promise<Value | undefined> { return this.recovery.preflightReconcile(operationId); }
  public reconcileNoMutation(operationId: string): Promise<Value> {
    return this.recovery.reconcile(operationId, true);
  }
  public reconcile(operationId: string): Promise<Value> { return this.recovery.reconcile(operationId); }
  public rebindRuntime(operationId: string, expectedFingerprint: Value): Promise<Value> { return this.recovery.rebindRuntime(operationId, expectedFingerprint); }
  public openTarget(operationId: string): Promise<Value> { return this.recovery.openTarget(operationId); }
}

export function listLibraryExecutionCapabilities(): Value[] {
  const results: Value[] = [];
  for (const entry of listLibraryOperationCapabilities()) {
    const action = entry.action;
    let status: string = entry.status;
    const lifecycleRefusal = libraryExecutionLifecycleRefusal(action);
    const executionRefusal = lifecycleRefusal ?? libraryExportRefusalReason(action);
    if (lifecycleRefusal !== undefined) { status = "unavailable-native-project-structure-lifecycle"; }
    else if (executionRefusal !== undefined) { status = "unavailable-installed-export-side-effect-or-editor-contract"; }
    else if (action.endsWith(".get") && action.startsWith("library.")) { status = "implemented-double-sampled-metadata"; }
    else if (action.startsWith("export.") && entry.status === "typed-descriptor-awaiting-executor-validation") { status = "implemented-bounded-file-export"; }
    else if (["library.footprint.create", "library.footprint.modify"].includes(action)) { status = "implemented-project-library-checkpoint-proof"; }
    else if (action === "library.device.modify") { status = "implemented-project-local-association-proof"; }
    else if (action === "library.device.create") { status = "implemented-project-local-device-addition-proof"; }
    else if (action === "library.device.model-transform") { status = "implemented-project-device-transform-checkpoint-proof"; }
    else if (action === "library.symbol.modify") { status = "implemented-project-symbol-metadata-checkpoint-proof"; }
    else if (action === "library.symbol.create") { status = "implemented-closed-empty-project-symbol-create-proof"; }
    else if (action === "document.page.rename") { status = "implemented-closed-project-page-rename-proof"; }
    else if (action === "document.pcb.rename" || action === "document.schematic.rename") { status = "implemented-closed-ordinary-document-rename-proof"; }
    else if (action === "document.page.create") { status = "implemented-closed-empty-project-page-create-proof"; }
    else if (action === "document.pcb.create") { status = "implemented-closed-empty-free-pcb-create-proof"; }
    else if (action === "document.schematic.create") { status = "implemented-closed-empty-free-schematic-create-proof"; }
    else if (action === "document.activate") { status = "implemented-current-project-document-activation"; }
    else if (action === "document.close") { status = "implemented-inactive-clean-project-document-close"; }
    else if (["document.open", "library.footprint.open", "library.symbol.open"].includes(action)) { status = "implemented-current-project-document-open"; }
    results.push({ action, status, ...(executionRefusal === undefined ? {} : { executionRefusal }), connectedValidation: "see-capability-matrix;catalog-not-live-proof", ...(status === "implemented-bounded-file-export" ? { maxBytes: LIBRARY_FILE_EXECUTION_MAX_BYTES, autoGenerateModels: false } : {}), ...(["library.device.modify", "library.device.create"].includes(action) ? { supportedBindings: "existing project-local symbol/footprint; existing external 32-hex model identity after stable native metadata reads; explicit footprint/model clearing for modify", model3DAssignment: true, implicitEco: false, createsSymbolOrFootprint: false } : {}), ...(action === "library.device.model-transform" ? { inheritedInstances: "exact checkpoint inventory required", modelBindingChanged: false, implicitEco: false } : {}), ...(action === "library.symbol.modify" ? { supportedFields: ["name", "description"], ordinarySymbolOnly: true, activeTarget: false, targetMustBeClosed: true, currentGenerationLiveValidated: false, reopened: false } : {}), ...(action === "document.page.rename" ? {
      adapterKind: "native-task-equivalent", supportedFields: ["name"], targetMustBeClosed: true, otherCleanSiblingRequired: true,
      hierarchicalOrCbbProjects: false, collaborativeStrictMode: false, currentGenerationLiveValidated: false, reopened: false,
      saveInvoked: false, editorTitleRefreshVerified: false, headerBookkeeping: "client/time/version updated; prior user omitted; editor version must already match",
    } : {}), ...(action === "document.pcb.rename" || action === "document.schematic.rename" ? {
      adapterKind: "native-task-equivalent", supportedFields: ["name"], targetMustBeClosed: true, schematicChildrenMustBeClosed: true,
      activeDocumentTypes: [3], otherCleanDirectOpenPcbRequired: true, pooledPanelsAndHiddenExports: false,
      importedAtomHeaderHistories: false, nonNullTargetZIndex: false, hierarchicalOrCbbProjects: false, inheritedDocuments: false,
      completeRecordClocksAndPeerHeaderLineage: true, originalAcknowledgmentRequiredForChangedRecovery: true,
      automaticInverse: false, saveInvoked: false, reopened: false, currentGenerationLiveValidated: false, editorTitleRefreshVerified: false,
    } : {}), ...(action === "document.page.create" ? { adapterKind: "native-task-equivalent", parentOnly: true, ordinarySchematicOnly: true,
      emptyPage: true, drawingFrameInitialized: false, editorOpened: false, saveInvoked: false, currentGenerationLiveValidated: false,
      activeDocumentTypes: [1, 3], hierarchicalOrCbbProjects: false, recoveryRequiresOriginalNativeIdentity: true, automaticInverse: false,
    } : {}), ...(action === "document.pcb.create" ? {
      adapterKind: "native-task-equivalent", boardNameMustBeAbsent: true, emptyPcb: true, freePcb: true,
      canvasInitialized: false, editorOpened: false, saveInvoked: false, reopened: false, currentGenerationLiveValidated: false,
      activeDocumentTypes: [3], otherCleanDirectOpenPcbRequired: true, pooledPanelsAndHiddenExports: false,
      importedAtomHeaderHistories: false, hierarchicalOrCbbProjects: false, inheritedDocuments: false,
      completeRecordClocksAndPeerHeaderLineage: true, recoveryRequiresOriginalNativeIdentity: true, automaticInverse: false,
    } : {}), ...(action === "document.schematic.create" ? {
      adapterKind: "native-task-equivalent", boardNameMustBeAbsent: true, emptySchematic: true, freeSchematic: true,
      pageCreated: false, canvasInitialized: false, editorOpened: false, saveInvoked: false, reopened: false, currentGenerationLiveValidated: false,
      activeDocumentTypes: [3], otherCleanDirectOpenPcbRequired: true, pooledPanelsAndHiddenExports: false,
      importedAtomHeaderHistories: false, hierarchicalOrCbbProjects: false, inheritedDocuments: false,
      exactLocalOrdinarySymbolReferencesRequired: true, nonemptyInlineComponentAttributes: false,
      completeRecordClocksAndPeerHeaderLineage: true, recoveryRequiresOriginalNativeIdentity: true, automaticInverse: false,
      nativeSubscriberAtomicProjectIsolation: false,
    } : {}), ...(action === "library.symbol.create" ? { adapterKind: "native-task-equivalent", ordinarySymbolOnly: true,
      emptySymbol: true, canvasInitialized: false, editorOpened: false, saveInvoked: false, currentGenerationLiveValidated: false,
      activeDocumentTypes: [3], classification: false, inheritedSource: false, hierarchicalOrCbbProjects: false,
      preflightObservationalOnly: false, permissionRefusalMayOpenDialog: true,
      recoveryRequiresOriginalNativeIdentity: true, automaticInverse: false,
    } : {}), ...(action === "document.close" ? { targetDocumentTypes: [2, 3, 4], activeDocumentTypes: [3, 4], targetMustBeInactiveAndClean: true,
      exactTwoProjectTabs: true, splitScreens: false, saveInvoked: false, currentGenerationLiveValidated: false, automaticInverse: false,
      recovery: "read-only target-presence observation; never repeats close or opens another tab", schematicCloseRefusal: "Installed clearOnePage can persist INSTANCE attributes during close." } : {}) });
  }
  return results;
}
