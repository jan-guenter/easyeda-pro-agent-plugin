import path from "node:path";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { controlDataDirectory, controlRootCapability, listOperationStates, loadOperation, readArtifact, updateOperation, verifyEvidenceReceipt, writePhaseArtifact } from "./artifacts.ts";
import type { OperationJournal } from "./artifacts.ts";
import { createCheckpoint, verifyCheckpoint } from "./checkpoint.ts";
import { canonicalJson, isRecord, isTerminalOperation, normalizeEasyedaProjectPath, sha256Json } from "./core.ts";
import { nativeUiAppBindingSchema } from "./windows-native-ui.ts";
import type { WindowsNativeUiController } from "./windows-native-ui.ts";
import { transactionError } from "./transaction-error.ts";

const hash = z.string().regex(/^[a-f0-9]{64}$/u);
const targetSchema = z.object({ projectUuid: z.string().min(1).max(256), documentUuid: z.string().min(1).max(256), documentType: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]) }).strict();
const buttonSchema = z.object({ label: z.literal("Leave this page"), x: z.number().int().min(-32_768).max(32_767), y: z.number().int().min(-32_768).max(32_767) }).strict();
const dialogSchema = z.object({ title: z.literal("Confirm Close"), onlyUnsavedTarget: z.literal(true), targetName: z.string().min(1).max(512), discardButton: buttonSchema }).strict();
const recoveryBaseSchema = z.object({
  operationId: z.string().regex(/^easyeda-[a-z0-9-]+$/u),
  appBinding: nativeUiAppBindingSchema, windowHandle: z.string().regex(/^[1-9][0-9]{0,18}$/u),
  confirmUIWrite: z.literal(true), discardOwnUnsavedChanges: z.literal(true),
  acknowledgeDurableChanges: z.boolean().optional(),
  target: targetSchema,
  capture: z.object({ receiptPath: z.string().min(1), receiptSha256: hash, imageSha256: hash }).strict(),
}).strict();
const closeConfirmationRequestSchema = recoveryBaseSchema.extend({ action: z.literal("discard-close-confirmation"), observedDialog: dialogSchema }).strict();
const warningButtonSchema = buttonSchema.extend({ label: z.literal("Don't Save") }).strict();
const warningDialogSchema = z.object({
  title: z.literal("Warning"), message: z.literal("Your file hasn't been saved. Would you like to save it now?"),
  onlyUnsavedTarget: z.literal(true), targetName: z.string().min(1).max(512),
  discardButton: warningButtonSchema,
}).strict();
const saveWarningRequestSchema = recoveryBaseSchema.extend({ action: z.literal("discard-save-warning"), observedDialog: warningDialogSchema }).strict();
export const nativeCloseRecoveryRequestSchema = z.discriminatedUnion("action", [closeConfirmationRequestSchema, saveWarningRequestSchema]);
export type NativeCloseRecoveryRequest = z.infer<typeof nativeCloseRecoveryRequestSchema>;

interface CaptureProof { readonly bounds: [number, number, number, number]; readonly imageSha256: string; readonly receiptSha256: string; readonly createdAt: string }
interface SavedEvidence { readonly beforeReceipt: unknown; readonly currentCheckpoint: unknown; readonly durableChanged: boolean }
export interface NativeCloseRecoveryDependencies {
  readonly list?: typeof listOperationStates; readonly load?: typeof loadOperation; readonly update?: typeof updateOperation; readonly write?: typeof writePhaseArtifact;
  readonly capture?: (request: NativeCloseRecoveryRequest) => Promise<CaptureProof>;
  readonly checkpoint?: (journal: OperationJournal) => Promise<SavedEvidence>;
}

async function managedJson(file: string): Promise<Record<string, unknown>> {
  const read = await readArtifact(file, 0, 262_144);
  if (read.size > 262_144 || read.bytesRead !== read.size || Buffer.byteLength(read.text) !== read.bytesRead) { throw new Error("Recovery metadata exceeds its complete managed-read bound."); }
  const value: unknown = JSON.parse(read.text);
  if (!isRecord(value)) { throw new Error("Recovery metadata is not an object."); }
  return value;
}

async function captureProof(request: NativeCloseRecoveryRequest): Promise<CaptureProof> {
  const verified = await verifyEvidenceReceipt(request.capture.receiptPath);
  if (!verified.ok) { throw new Error("Recovery capture receipt failed verification."); }
  const receipt = await managedJson(request.capture.receiptPath);
  if (receipt["schema"] !== "easyeda-pro-control.capture-receipt.v1" || receipt["receiptSha256"] !== request.capture.receiptSha256 || typeof receipt["resultPath"] !== "string" || typeof receipt["createdAt"] !== "string") { throw new Error("Recovery capture identity differs."); }
  const age = Date.now() - Date.parse(receipt["createdAt"]);
  if (!Number.isFinite(age) || age < -1000 || age > 120_000) { throw new Error("Recovery requires a capture from the last two minutes."); }
  const retained = await managedJson(receipt["resultPath"]);
  const observedRequest = retained["request"];
  const captured = retained["result"];
  const payload = isRecord(captured) ? captured["payload"] : undefined;
  const image: unknown = isRecord(captured) && Array.isArray(captured["images"]) && captured["images"].length === 1 ? captured["images"][0] : undefined;
  const { authority: _authority, ...binding } = request.appBinding;
  if (!isRecord(observedRequest) || observedRequest["action"] !== "capture" || observedRequest["windowHandle"] !== request.windowHandle || !isRecord(payload) || payload["schema"] !== "easyeda-pro-control.windows-native-ui.v1" || payload["action"] !== "capture" || canonicalJson(payload["binding"]) !== canonicalJson(binding) || !isRecord(image) || image["mimeType"] !== "image/png" || image["sha256"] !== request.capture.imageSha256) { throw new Error("Recovery capture does not bind the selected native process and window."); }
  const result = payload["result"];
  const bounds = z.tuple([z.number(), z.number(), z.number().positive(), z.number().positive()]).parse(isRecord(result) ? result["bounds"] : undefined);
  const { x, y } = request.observedDialog.discardButton;
  if (x < bounds[0] || y < bounds[1] || x >= bounds[0] + bounds[2] || y >= bounds[1] + bounds[3]) { throw new Error("Recovery discard point is outside its observed capture."); }
  const finalVerification = await verifyEvidenceReceipt(request.capture.receiptPath);
  if (!finalVerification.ok) { throw new Error("Recovery capture changed during validation."); }
  return { bounds, imageSha256: request.capture.imageSha256, receiptSha256: request.capture.receiptSha256, createdAt: receipt["createdAt"] };
}

async function preserveSavedEvidence(journal: OperationJournal): Promise<SavedEvidence> {
  const context = journal["context"], prior = journal["preCheckpoint"];
  const project = isRecord(context) ? context["project"] : undefined;
  if (!isRecord(project) || typeof project["path"] !== "string" || !isRecord(prior) || typeof prior["receiptPath"] !== "string" || typeof prior["checkpointDumpSha256"] !== "string") { throw new Error("Recovery journal lacks its exact saved source/checkpoint."); }
  const source = normalizeEasyedaProjectPath(project["path"]);
  const outputDir = path.join(controlDataDirectory(), "checkpoints");
  const policy = { expectedSource: source, artifactRoots: [controlDataDirectory()], controlRoot: await controlRootCapability() };
  const original = await verifyCheckpoint(prior["receiptPath"], policy);
  if (!original.checkpointMatchesReceipt || original.checkpointSha256 !== prior["checkpointSha256"] || original.checkpointDumpSha256 !== prior["checkpointDumpSha256"]) { throw new Error("Original recovery checkpoint is no longer intact."); }
  const current = await createCheckpoint({ source, outputDir, label: "native-close-recovery-before-discard" }, policy);
  return { beforeReceipt: prior, currentCheckpoint: current, durableChanged: current.checkpointDumpSha256 !== original.checkpointDumpSha256 };
}

/** Explicitly authorized loss of one observed unsaved target. This is neither
 * rollback nor proof of saved-state equality, API termination or recovery.
 */
export async function discardCloseConfirmation(input: unknown, controller: Pick<WindowsNativeUiController, "runRecoveryCloseClick">, dependencies: NativeCloseRecoveryDependencies = {}): Promise<Record<string, unknown>> {
  const request = nativeCloseRecoveryRequestSchema.parse(input);
  const operations = await (dependencies.list ?? listOperationStates)();
  const pending = operations.filter((entry) => !isTerminalOperation(entry));
  if (pending.length !== 1 || pending[0]?.["operationId"] !== request.operationId) { throw new Error("Discard-close recovery requires exactly its one pending operation."); }
  const journal = await (dependencies.load ?? loadOperation)(request.operationId);
  const isSaveWarning = request.action === "discard-save-warning";
  const slot = isSaveWarning ? "nativeSaveWarningRecovery" : "nativeCloseRecovery";
  const phasePrefix = isSaveWarning ? "native-discard-save-warning" : "native-discard-close";
  const firstDiscard = journal["nativeCloseRecovery"];
  if (isSaveWarning) {
    const first = isRecord(firstDiscard) ? closeConfirmationRequestSchema.safeParse(firstDiscard["request"]) : undefined;
    if (!isRecord(firstDiscard) || firstDiscard["schema"] !== "easyeda-pro-control.native-discard-close.v1" || firstDiscard["state"] !== "click-returned" || firstDiscard["dispatched"] !== true || firstDiscard["originalPlanHash"] !== journal.planHash || first?.success !== true ||
        first.data.operationId !== request.operationId || canonicalJson(first.data.appBinding) !== canonicalJson(request.appBinding) || canonicalJson(first.data.target) !== canonicalJson(request.target) ||
        first.data.observedDialog.targetName !== request.observedDialog.targetName || first.data.capture.receiptSha256 === request.capture.receiptSha256 || first.data.capture.imageSha256 === request.capture.imageSha256) {
      throw new Error("Save-warning discard requires the same operation, target and native generation after its first discard click returned, with a new capture.");
    }
  }
  const previous = journal[slot];
  const previousRequest = isRecord(previous) ? previous["request"] : undefined;
  const previousCapture = isRecord(previousRequest) ? previousRequest["capture"] : undefined;
  const freshAfterRefusal = isRecord(previous) && previous["state"] === "click-failed" && previous["dispatched"] === false && isRecord(previousCapture) && previousCapture["receiptSha256"] !== request.capture.receiptSha256;
  if (journal.plan["profile"] !== "easyeda-pro-control.typed-design-transaction.v1" || journal["saved"] !== false || journal["orphanedCallPossible"] !== false || (previous !== undefined && !freshAfterRefusal) || !Number.isSafeInteger(journal["sequence"]) || typeof journal["sequence"] !== "number") { throw new Error("This journal has no unused, settled-call unsaved close-recovery slot. A proven pre-dispatch refusal requires a new capture receipt."); }
  const context = journal["context"], expected = journal.plan["expectedContext"];
  const document = isRecord(context) ? context["document"] : undefined, project = isRecord(context) ? context["project"] : undefined;
  const originalDocument = isRecord(expected) ? expected["document"] : undefined, originalProject = isRecord(expected) ? expected["project"] : undefined;
  if (!isRecord(project) || !isRecord(document) || !isRecord(originalProject) || !isRecord(originalDocument) || project["uuid"] !== request.target.projectUuid || originalProject["uuid"] !== request.target.projectUuid || document["uuid"] !== request.target.documentUuid || originalDocument["uuid"] !== request.target.documentUuid || document["documentType"] !== request.target.documentType || originalDocument["documentType"] !== request.target.documentType) { throw new Error("Recovery acknowledgment does not identify the original target."); }
  const authority = journal["executionAuthorityBeforeOrphan"];
  const processes = isRecord(authority) && Array.isArray(authority["processes"]) ? authority["processes"] : [];
  const roots = processes.filter((entry: unknown) => isRecord(entry) && entry["role"] === "easyeda-main");
  const root: unknown = roots[0];
  if (roots.length !== 1 || !isRecord(root) || root["pid"] !== request.appBinding.rootPid || typeof root["startIdentity"] !== "string" || !new RegExp(`^win32:${request.appBinding.rootStartTicks}:job:[a-f0-9]{32}$`, "u").test(root["startIdentity"])) { throw new Error("Observed native process is not the journal's original execution generation."); }
  const saved = await (dependencies.checkpoint ?? preserveSavedEvidence)(journal);
  if (saved.durableChanged && request.acknowledgeDurableChanges !== true) { throw new Error("Saved state differs from the original checkpoint; explicit durable-change acknowledgment is required before discard."); }
  const capture = await (dependencies.capture ?? captureProof)(request);
  if (isSaveWarning && (typeof journal["updatedAt"] !== "string" || !Number.isFinite(Date.parse(journal["updatedAt"])) || !Number.isFinite(Date.parse(capture.createdAt)) || Date.parse(capture.createdAt) <= Date.parse(journal["updatedAt"]))) {
    throw new Error("Save-warning recovery requires a fresh capture after the prior discard result was journaled.");
  }
  const attempt = { schema: isSaveWarning ? "easyeda-pro-control.native-discard-save-warning.v1" : "easyeda-pro-control.native-discard-close.v1", attemptId: randomUUID(), request,
    ...(isSaveWarning ? { priorCloseAttemptSha256: sha256Json(firstDiscard) } : {}),
    originalPlanHash: journal.planHash, savedEvidence: saved, capture, ...(previous === undefined ? {} : { previousAttemptSha256: sha256Json(previous) }), recordedAt: new Date().toISOString(), state: "intent-recorded", dispatched: false };
  const update = dependencies.update ?? updateOperation, write = dependencies.write ?? writePhaseArtifact;
  const record = async (phase: string, value: unknown): Promise<void> => {
    journal["sequence"] = Number(journal["sequence"]) + 1;
    const descriptor = await write(journal.operationId, Number(journal["sequence"]), phase, value);
    (journal.artifacts ??= []).push(descriptor);
    journal["updatedAt"] = new Date().toISOString(); await update(journal);
  };
  journal[slot] = attempt;
  journal["hardStop"] = true;
  journal["nextSafeAction"] = "Await the one discard-close click, then prove native process exit and reconcile saved state. Do not retry, save or repeat the original mutation.";
  await record(`${phasePrefix}-intent`, attempt);
  try {
    const result = await controller.runRecoveryCloseClick({ windowHandle: request.windowHandle, appBinding: request.appBinding,
      confirmUIWrite: true, x: request.observedDialog.discardButton.x, y: request.observedDialog.discardButton.y,
      expectedCaptureSha256: capture.imageSha256, expectedBounds: capture.bounds });
    journal[slot] = { ...attempt, state: "click-returned", dispatched: true, resultSha256: sha256Json(result) };
    await record(`${phasePrefix}-result`, { result, savedStateVerified: false, recovered: false });
    return { schema: attempt.schema, operationId: journal.operationId, state: journal["state"], discardClickReturned: true, recovered: false, savedStateVerified: false, durableChanged: saved.durableChanged, currentCheckpoint: saved.currentCheckpoint, nextSafeAction: journal["nextSafeAction"] };
  } catch (error) {
    const dispatched = error instanceof Error && "dispatched" in error && error.dispatched === false ? false : "unknown";
    journal[slot] = { ...attempt, state: "click-failed", dispatched };
    await record(`${phasePrefix}-failure`, { dispatched, error: "native-discard-close-failed", recovered: false });
    throw transactionError(error, { operationId: journal.operationId, state: String(journal["state"]), orphanedCallPossible: false, nextSafeAction: String(journal["nextSafeAction"]) });
  }
}
