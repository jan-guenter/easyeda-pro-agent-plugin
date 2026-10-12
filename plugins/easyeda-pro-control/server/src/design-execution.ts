/* oxlint-disable import/max-dependencies -- This transaction coordinator composes distinct context, journal, source, native and durable-state proof boundaries. */
import { basename, join } from "node:path";
import { z } from "zod";
import { controlDataDirectory, createOperation, listOperationStates, loadOperation, operationPath, readArtifact, scanOperations, updateOperation, writePhaseArtifact } from "./artifacts.ts";
import type { ArtifactDescriptor } from "./artifacts.ts";
import { OPERATION_SCHEMA, assertSubset, buildPlanHash, canonicalJson, extractToolPayload, isRecord, isTerminalOperation, newOperationId, sha256Text, validateExpectedFingerprint, validatePrivateFingerprint } from "./core.ts";
import type { DispatchOperationJournal, EasyedaControlEngine, ExpectedContext } from "./engine.ts";
import { assertDesignActionSupportedCooperatively, compileDesignAction, designActionSchema, inverseDesignActionCooperatively, prepareDesignActionCooperatively, verifyDesignActionCooperatively } from "./design-action.ts";
import type { DesignAction, DesignActionState } from "./design-action.ts";
import { compareDocumentSources, parseDocumentSource } from "./document-source.ts";
import type { NativeSourceSnapshot } from "./document-source.ts";
import { buildSaveReopenCode, wrapWithContextGuard } from "./runtime-scripts.ts";
import { normalizeSchematicNativeSnapshot, schematicNativeSnapshotHash, schematicNativeSnapshotSchema } from "./schematic-native-adapter.ts";
import { buildSchematicNativeTransportCode, decodeSchematicNativeEnvelope } from "./schematic-native-transport.ts";
import type { SchematicNativeSnapshot } from "./schematic-native-adapter.ts";
import { readNativeHistoryCheckpoint } from "./native-history.ts";
import { verifyStackPersistence } from "./stack-persistence.ts";
import { verifyRulePersistence } from "./rule-persistence.ts";
import { isDesignRuleAction } from "./design-rule-public-adapter.ts";
import type { NativeHistorySnapshot } from "./native-history.ts";
import { deriveDesignBaselineTargets, verifyDesignBaseline, verifyDesignPersistence } from "./design-persistence.ts";
import { designTopologySchema, readDesignTopology, verifyDesignTopology } from "./design-topology.ts";
import type { DesignTopology } from "./design-topology.ts";
import type { SchematicComponentCreateAdapter } from "./schematic-component-create.ts";
import { SCHEMATIC_TOPOLOGY_EXECUTION_REFUSAL, decodeExactReadEnvelope } from "./exact-readers.ts";
import { prepareRecoveryNavigation } from "./recovery-navigation.ts";
import { projectFootprintScope } from "./footprint-action.ts";
import { buildFootprintReopenCode, buildFootprintSaveCode } from "./footprint-lifecycle.ts";
import { verifyLibraryNativeProfile } from "./library-native-profile.ts";
import { verifyDeviceAssociationNativeProfile } from "./device-native-profile.ts";
import { transactionError } from "./transaction-error.ts";
import { verifySchematicLifecycleEquivalence } from "./schematic-lifecycle.ts";
import { projectSymbolScope } from "./symbol-action.ts";
import { buildSymbolReopenCode, buildSymbolSaveCode } from "./symbol-lifecycle.ts";
import { verifySchematicNativeProfile } from "./native-profiles.ts";
import { designOperationSchema, designParameterEffects } from "./design-operations.ts";
import { verifyCopperLifecycleEquivalence, verifyCopperSaveAcknowledgment } from "./copper-lifecycle.ts";
import { verifyCopperClearPersistence } from "./copper-persistence.ts";
import { deriveFootprintBaselineTargets, verifyFootprintBaseline, verifyFootprintEmptyNetPersistence } from "./footprint-empty-net-persistence.ts";
import { expectedNativeEmptyNetDefault } from "./native-empty-net-default.ts";
import { projectSettledPriorInverse } from "./related-inverse-persistence.ts";
import { verifySymbolPersistence } from "./symbol-persistence.ts";
import { selectSavedLibraryReopen, verifySavedLibraryArtifacts } from "./saved-library-recovery.ts";
import { buildLoadedNetFlagTemplateReadExpression } from "./schematic-layout-netflag.ts";
import { prepareSchematicLayoutNetLabelRepair, prepareSchematicLayoutWireGroupRepair, verifyHistoricalSchematicLayoutEffect, verifySchematicLayoutBaselineCooperatively, verifySchematicLayoutPersistenceCooperatively, verifySchematicLayoutWireGroupRepairLegacyPersistence } from "./schematic-layout-batch.ts";
import { schematicWireGroupRepairDescriptorSchema } from "./schematic-layout-wire-groups.ts";
import type { SchematicWireGroupRepairDescriptor } from "./schematic-layout-wire-groups.ts";
import { verifyLayoutWireGroupRepairTopology } from "./schematic-layout-repair-topology.ts";
import { verifySchematicStoragePersistence } from "./schematic-storage-persistence.ts";
import { hasSchematicWireSaveEvidence, verifySchematicWireBaseline, verifySchematicWirePersistence, verifyWireRetainedSaveAuthority } from "./schematic-wire-persistence.ts";
import { buildSchematicLayoutPageLoadCode, deriveSchematicLayoutPageLoadScope } from "./schematic-layout-page-load.ts";
import { prepareSchematicLayoutVisibilityRepair, verifySchematicLayoutVisibilityRepairPersistence } from "./schematic-layout-visibility-repair.ts";
import { yieldProofEventLoop } from "./cooperative-proof.ts";
import { needsSchematicLayoutConstructorWitness } from "./schematic-retained-wire-order.ts";
import { resolveSchematicLayoutConstructorWitness } from "./schematic-layout-constructor-witness.ts";
import type { SchematicLayoutConstructorWitness } from "./schematic-layout-constructor-witness.ts";
import { DESIGN_SAVE_ATTEMPT_PROFILE, createDesignSaveIntent, createDesignSaveNotDispatched, designSavePhase, hasLegacyDesignSaveEvidence, inspectDesignSaveAttempts } from "./design-save-attempt.ts";
import type { DesignSaveIntent } from "./design-save-attempt.ts";
import { flatDisplayOperation, prepareFlatDisplayProfile } from "./flat-display-profile.ts";
import type { FlatDisplayBinding } from "./flat-display-profile.ts";
import { assertFlatTransactionBinding, assertFlatTransactionInverse, flatTransactionBinding, isFlatWireBinding } from "./flat-transaction-binding.ts";
import type { FlatTransactionBinding } from "./flat-transaction-binding.ts";
import { assertFlatTransactionLibraryPeers, verifyFlatTransactionObservation, verifyFlatTransactionPersistence } from "./flat-transaction-profile.ts";
import { flatWireOperation } from "./flat-wire-binding.ts";
import type { FlatWireBinding } from "./flat-wire-binding.ts";
import { flatWireInverse, prepareFlatWireProfile } from "./flat-wire-profile.ts";
import { observeSchematicFlatTopology } from "./schematic-flat-read.ts";
import type { FlatDisplayObservationEvidence } from "./schematic-flat-read.ts";
import { buildFlatLifecycleObservation } from "./flat-lifecycle-observation.ts";
import type { FlatLifecyclePhase } from "./flat-lifecycle-observation.ts";
import type { FlatDisplayRuntimeGuard } from "./flat-display-runtime.ts";
import { verifyFlatDisplayMaterialization, verifyFlatDisplayRestoration } from "./flat-display-storage.ts";
import { hasDesignInverseAttempt } from "./design-inverse-attempt.ts";
import { verifyFlatInverseCheckpoint } from "./flat-inverse-checkpoint.ts";
import { assertPcbTextCreateRetainedAuthority, assertPcbTextLifecycleAcknowledgment } from "./pcb-text-lifecycle.ts";
import { verifyPcbTextRetainedSaveAuthority, verifyPcbTextRetainedSaveEffect } from "./pcb-text-retained-save.ts";
import { verifyNativeRuleReportProfile } from "./native-rule-profile.ts";
import { PCB_NAVIGATION_PREFLIGHT_PROFILE, buildPcbNavigationPreferencePreflight } from "./pcb-navigation-preflight.ts";

type RecordValue = Record<string, unknown>;
const PROFILE = "easyeda-pro-control.typed-design-transaction.v1";
function externalRuntimeIdentity(value: RecordValue): RecordValue {
  const external = Object.fromEntries(Object.entries(value).filter(([key]) => !["facadeImplementation", "reviewedCompatibilityManifest"].includes(key)));
  // In-memory status includes absent optional properties with undefined values.
  // Compare the same JSON representation used by MCP and the sealed journal.
  const serialized: unknown = JSON.parse(canonicalJson(external));
  if (!isRecord(serialized)) { throw new Error("External runtime identity must serialize to an object."); }
  return serialized;
}
export function assertFacadeOnlyRuntimeUpgrade(original: RecordValue, current: RecordValue): void {
  validateExpectedFingerprint(original);
  validatePrivateFingerprint(current);
  assertSubset(externalRuntimeIdentity(current), externalRuntimeIdentity(original), "Unchanged EasyEDA/upstream runtime during facade upgrade");
  assertSubset(externalRuntimeIdentity(original), externalRuntimeIdentity(current), "Complete original EasyEDA/upstream runtime binding");
}
export const designTransactionActionSchema = z.enum(["apply", "commit", "rollback", "inspect", "reconcile", "recover-authority", "rebind-runtime", "open-target", "load-layout-pages", "repair-layout-net-labels", "repair-layout-wire-groups", "repair-layout-label-visibility"]);

interface DesignPlan extends RecordValue {
  profile: typeof PROFILE;
  operation: DesignAction;
  expectedContext: ExpectedContext;
  expectedFingerprint: RecordValue;
  expectedTopology?: DesignTopology;
  flatDisplay?: FlatDisplayBinding;
  flatWire?: FlatWireBinding;
}

interface DesignJournal extends DispatchOperationJournal {
  plan: DesignPlan;
  before: NativeSourceSnapshot;
  after?: NativeSourceSnapshot;
  createdId?: string;
  targetId?: string;
  inverse?: DesignAction;
  beforeNative?: SchematicNativeSnapshot;
  afterNative?: SchematicNativeSnapshot;
  beforeTopology?: DesignTopology;
  derivedResult?: unknown;
  createdIds?: Readonly<Record<string, string>>;
  componentCreate?: SchematicComponentCreateAdapter;
  layoutTemplates?: Readonly<Record<string, SchematicNativeSnapshot>>;
  layoutWireGroupRepair?: SchematicWireGroupRepairDescriptor;
  runtimeFingerprint?: RecordValue;
  wireSaveAttempted?: true;
  saveAttemptProtocol?: typeof DESIGN_SAVE_ATTEMPT_PROFILE;
  designSaveAttempted?: true;
  inverseAttempted?: true;
  flatDurabilityClassification?: "unchanged-baseline" | "exact-intended-effect";
}

function flatEffectProof<T extends object>(journal: DesignJournal, proof: T): T & { topology?: string; compiledTopology?: boolean } {
  return flatTransactionBinding(journal.plan) === undefined ? proof : { ...proof,
    topology: "executor-verified-checkpoint-bound-flat-pin-nets", compiledTopology: false };
}

function flatPersistenceProof(journal: DesignJournal, proof: RecordValue): RecordValue {
  return flatTransactionBinding(journal.plan) === undefined || !isRecord(proof["effect"]) ? proof :
    { ...proof, effect: flatEffectProof(journal, proof["effect"]) };
}

function inverseAvailability(journal: DesignJournal): RecordValue {
  if (hasDesignInverseAttempt(journal)) { return { available: false, reason: "inverse-already-attempted" }; }
  if (hasLegacyDesignSaveEvidence(journal)) { return { available: false, reason: "retained-save-evidence" }; }
  if (journal.state !== "applied-unsaved" || journal.inverse === undefined || journal.orphanedCallPossible || journal.hardStop) {
    return { available: false, reason: "transaction-not-ready" };
  }
  if (flatTransactionBinding(journal.plan) !== undefined && journal.flatDurabilityClassification !== "unchanged-baseline") {
    return { available: false, reason: journal.flatDurabilityClassification === "exact-intended-effect" ? "forward-effect-already-persisted" : "fresh-durable-baseline-proof-required" };
  }
  return { available: true, conditionalOnFreshPreflight: true };
}

function appliedNextSafeAction(journal: DesignJournal): string {
  if (hasDesignInverseAttempt(journal)) { return "An inverse was already attempted. Inspect retained evidence; do not repeat the inverse or Save."; }
  if (flatTransactionBinding(journal.plan) !== undefined && journal.flatDurabilityClassification === "exact-intended-effect") {
    return "The exact forward effect already persisted. Unsaved rollback is unavailable; commit may prove Save/reopen without repeating the edit.";
  }
  return flatTransactionBinding(journal.plan) === undefined ? "Exact intended edit is present; commit for new save/reopen proof or use its verified inverse." :
    "Exact intended edit is present; commit for new save/reopen proof or request an inverse subject to fresh unchanged-durable-baseline proof.";
}

type LayoutRepairAuthority = Pick<DesignJournal, "plan" | "state" | "saved" | "reopened" | "orphanedCallPossible" | "hardStop" | "createdIds" | "beforeTopology" | "context" | "artifacts" | "layoutWireGroupRepair">;
/** The correction belongs to one failed, settled layout dispatch. Presence of
 * its prepared receipt consumes the one-shot even if a later check fails.
 */
export function assertLayoutNetLabelRepairAuthority(journal: LayoutRepairAuthority, prepared: unknown, acknowledgment: unknown): void {
  if (journal.plan.operation.action !== "sch.layout.batch" || journal.context.document.documentType !== 1 ||
      !["apply-needs-review", "runtime-rebound-needs-reconciliation", "target-opened-needs-reconciliation", "layout-pages-loaded-needs-reconciliation"].includes(journal.state) ||
      journal.orphanedCallPossible || !journal.hardStop || journal.saved || journal.reopened || journal.createdIds === undefined || journal.beforeTopology === undefined || journal.layoutWireGroupRepair !== undefined ||
      journal.artifacts.some((entry) => /-layout-(?:net-label|wire-group|visibility)-repair-/u.test(basename(entry.path)) || /-(?:save-reopen|reopened)\.json$/u.test(entry.path))) {
    throw new Error("Layout repair requires one settled failed layout with no prior correction or Save.");
  }
  verifyDesignTopology(journal.beforeTopology, journal.plan.expectedTopology);
  if (!isRecord(prepared) || prepared["adapterProfile"] !== "easyeda-pro-control.schematic-layout-batch.v1" ||
      typeof prepared["codeSha256"] !== "string" || !/^[a-f0-9]{64}$/u.test(prepared["codeSha256"]) || canonicalJson(prepared["createdIds"]) !== canonicalJson(journal.createdIds) ||
      !isRecord(acknowledgment) || acknowledgment["ok"] !== true || acknowledgment["kind"] !== "typed-design-result" || acknowledgment["id"] !== journal.plan.operation.id ||
      acknowledgment["createdId"] !== null || canonicalJson(acknowledgment["createdIds"]) !== canonicalJson(journal.createdIds)) {
    throw new Error("Layout net-label repair lacks the original exact preparation, acknowledgment or identities.");
  }
}

/** A correction intent is one-shot even if its dispatch or readback fails. */
export function assertLayoutWireGroupRepairAuthority(journal: LayoutRepairAuthority & { readonly layoutWireGroupRepair?: SchematicWireGroupRepairDescriptor }, prepared: unknown, acknowledgment: unknown): void {
  assertLayoutNetLabelRepairAuthority(journal, prepared, acknowledgment);
  if (journal.layoutWireGroupRepair !== undefined || journal.artifacts.some((entry) => /-layout-wire-group-repair-/u.test(basename(entry.path)))) {
    throw new Error("Layout wire-group repair already has a retained correction intent; do not repeat it.");
  }
}


type LayoutSavedAuthority = Pick<DesignJournal, "plan" | "context" | "after" | "afterNative" | "createdIds" | "beforeTopology" | "orphanedCallPossible">;
/** This proves a retained lifecycle acknowledgment, never current persistence.
 * The coordinator separately re-verifies the original effect, complete circuit
 * and every durable project record before it may complete the journal.
 */
export function verifyLayoutRetainedSaveAuthority(journal: LayoutSavedAuthority, afterPhase: unknown, acknowledgment: unknown): void {
  const expected = journal.after, projectUuid = journal.context.project.uuid ?? journal.context.project.projectUuid;
  if (journal.plan.operation.action !== "sch.layout.batch" || journal.plan.operation.operations.some((step) => step.action === "sch.wire.replace") ||
      journal.context.document.documentType !== 1 || journal.orphanedCallPossible || expected === undefined || journal.afterNative === undefined ||
      journal.createdIds === undefined || journal.beforeTopology === undefined || typeof projectUuid !== "string") {
    throw new Error("Retained layout Save requires the current layout profile, settled authority and complete original evidence.");
  }
  verifyDesignTopology(journal.beforeTopology, journal.plan.expectedTopology);
  if (expected.sha256 !== sha256Text(canonicalJson({ schema: expected.schema, document: expected.document, objects: expected.objects })) ||
      !isRecord(afterPhase) || canonicalJson(afterPhase["snapshot"]) !== canonicalJson(expected) ||
      canonicalJson(afterPhase["native"]) !== canonicalJson(journal.afterNative) || !isRecord(afterPhase["payload"]) ||
      typeof afterPhase["payload"]["source"] !== "string" || parseDocumentSource(afterPhase["payload"]["source"]).sha256 !== expected.sha256 ||
      !isRecord(afterPhase["payload"]["read_consistency"])) {
    throw new Error("Retained layout Save is not bound to the exact verified after source and native state.");
  }
  const consistency = afterPhase["payload"]["read_consistency"];
  if (consistency["stable"] !== true || consistency["attempts"] !== 2 || typeof consistency["snapshotSha256"] !== "string" ||
      !/^[a-f0-9]{64}$/u.test(consistency["snapshotSha256"])) { throw new Error("Retained layout source lacks its exact double-read commitment."); }
  if (!isRecord(acknowledgment) || acknowledgment["ok"] !== true || acknowledgment["saved"] !== true ||
      acknowledgment["closed"] !== true || acknowledgment["reopened"] !== true || !isRecord(acknowledgment["document"]) ||
      acknowledgment["document"]["uuid"] !== expected.document["uuid"] || acknowledgment["document"]["documentType"] !== 1 ||
      acknowledgment["document"]["tabId"] !== journal.context.document.tabId ||
      expected.document["uuid"] !== (journal.context.document.uuid ?? journal.context.document.documentUuid)) {
    throw new Error("Retained layout Save/reopen receipt does not match the exact current target.");
  }
  const barrier = acknowledgment["projectUploadBarrier"], close = acknowledgment["closeProof"], guard = acknowledgment["exactSaveGuard"], open = acknowledgment["openProof"];
  if (!isRecord(guard) || guard["passes"] !== 2 || guard["saveInvokedInSameExecution"] !== true || guard["publicCompareAndSwapAvailable"] !== false ||
      canonicalJson(guard["labels"]) !== canonicalJson(["schematic-source"]) ||
      canonicalJson(guard["snapshotSha256"]) !== canonicalJson([consistency["snapshotSha256"]]) ||
      !isRecord(close) || close["profile"] !== "easyeda-pro-control.native-document-close.v1" || close["closeCalls"] !== 1 ||
      close["terminalNotification"] !== true || close["oldFrameRemoved"] !== true || close["oldTabRemoved"] !== true || close["saved"] !== false ||
      !isRecord(open) || open["profile"] !== "easyeda-pro-control.native-document-open.v1" || open["tabId"] !== journal.context.document.tabId ||
      open["newFrameReady"] !== true || open["exactContext"] !== true || open["readinessSamples"] !== 2 || typeof open["activated"] !== "boolean" ||
      !isRecord(barrier) || barrier["profile"] !== "easyeda-pro-control.project-upload-barrier.v1" || barrier["projectUuid"] !== projectUuid ||
      barrier["scheduledWritesSettled"] !== true || barrier["savedEditorChanges"] !== false) {
    throw new Error("Retained layout Save lacks its exact guard, terminal close, ready reopen or upload barrier.");
  }
}

/** A flat profile is additional sealed authority, never a reinterpretation of
 * the historical compiled-topology receipt. Both validators must pass.
 */
export function verifyFlatDisplayRetainedSaveAuthority(journal: Pick<DesignJournal, "plan" | "context">, prepared: unknown, acknowledgment: unknown): void {
  const binding = assertFlatTransactionBinding(flatTransactionBinding(journal.plan), journal.plan.operation, journal.context);
  const hash = sha256Text(canonicalJson(binding));
  if (!isRecord(prepared) || prepared["flatBindingSha256"] !== hash ||
      typeof prepared["observationSha256"] !== "string" || !/^[a-f0-9]{64}$/u.test(prepared["observationSha256"]) ||
      !isRecord(acknowledgment) || !isRecord(acknowledgment["flatDisplaySaveGuard"])) {
    throw new Error("Retained flat display Save lacks its sealed final synchronous guard.");
  }
  const guard = acknowledgment["flatDisplaySaveGuard"];
  if (canonicalJson(guard) !== canonicalJson({ profile: binding.profile, bindingSha256: hash,
    observationSha256: prepared["observationSha256"], finalSynchronousCheck: true })) {
    throw new Error("Retained flat display Save guard differs from the prepared observation.");
  }
}

export interface DesignApplyInput {
  readonly operation: unknown;
  readonly expectedContext: ExpectedContext;
  readonly expectedFingerprint: RecordValue;
  readonly confirmWrite: true;
  readonly expectedTopology?: DesignTopology | undefined;
}

/** Every schematic transaction depends on compiled connectivity proof. The
 * former reader can annotate and Save All, so refuse before any side effect,
 * including navigation and upload barriers. Check both current and sealed
 * contexts: a recovery tab rebind must not remove the original restriction.
 */
function assertDesignTopologyExecutionAvailable(...contexts: readonly ExpectedContext[]): void {
  if (contexts.some((context) => context.document.documentType === 1)) {
    throw new Error(SCHEMATIC_TOPOLOGY_EXECUTION_REFUSAL);
  }
}

function assertTransactionTopologyAvailable(plan: DesignPlan, ...contexts: readonly ExpectedContext[]): void {
  if (flatTransactionBinding(plan) === undefined) { assertDesignTopologyExecutionAvailable(plan.expectedContext, ...contexts); return; }
  for (const context of [plan.expectedContext, ...contexts]) { assertFlatTransactionBinding(flatTransactionBinding(plan), plan.operation, context); }
}
function assertFlatDisplayJournal(journal: DesignJournal): FlatTransactionBinding {
  const binding = assertFlatTransactionBinding(flatTransactionBinding(journal.plan), journal.plan.operation, journal.context);
  assertFlatTransactionBinding(binding, journal.plan.operation, journal.plan.expectedContext);
  const checkpointFields = ["receiptPath", "receiptSha256", "checkpointSha256", "sourceSha256", "sourceDumpSha256", "checkpointDumpSha256"] as const;
  if (journal.beforeNative === undefined || journal.layoutWireGroupRepair !== undefined || journal.layoutTemplates !== undefined ||
      journal.before.sha256 !== binding.before.sourceSha256 || schematicNativeSnapshotHash(journal.beforeNative) !== binding.before.nativeSha256 ||
      sha256Text(canonicalJson({ schema: journal.before.schema, document: journal.before.document, objects: journal.before.objects })) !== binding.before.sourceSha256 ||
      parseDocumentSource(journal.beforeNative.source).sha256 !== binding.before.sourceSha256 ||
      journal.createdId !== undefined || (isFlatWireBinding(binding)
        ? journal.targetId !== binding.wireId || journal.createdIds !== undefined
        : journal.targetId !== undefined || canonicalJson(journal.createdIds) !== "{}") ||
      checkpointFields.some((field) => journal.preCheckpoint[field] !== binding.checkpoint[field]) || buildPlanHash(journal.plan) !== journal.planHash) {
    throw new Error("Flat display journal differs from its sealed original evidence.");
  }
  verifyDesignTopology(binding.topology, journal.beforeTopology); verifyDesignTopology(binding.topology, journal.plan.expectedTopology);
  if (journal.inverse !== undefined) { assertFlatTransactionInverse(binding, journal.inverse); }
  return binding;
}
function flatDisplayCandidate(input: unknown): boolean {
  try { flatDisplayOperation(input); return true; } catch { return false; }
}
function flatWireCandidate(input: unknown): boolean {
  try { flatWireOperation(input); return true; } catch { return false; }
}

function sourceRequest(context: ExpectedContext): { kind: "pcb-source" | "schematic-source" | "symbol-source" | "footprint-source" } {
  switch (context.document.documentType) {
    case 1: { return { kind: "schematic-source" };
    }
    case 2: { return { kind: "symbol-source" };
    }
    case 3: { return { kind: "pcb-source" };
    }
    case 4: { return { kind: "footprint-source" };
    }
    default: { throw new Error("Unsupported design transaction document type.");
    }
  }
}

function sourceSnapshot(payload: RecordValue, context: ExpectedContext): NativeSourceSnapshot {
  if (typeof payload["source"] !== "string") { throw new TypeError("Missing complete native source."); }
  const result = parseDocumentSource(payload["source"]);
  const uuid = context.document.uuid ?? context.document.documentUuid;
  if (result.document["uuid"] !== uuid) { throw new Error("Document source belongs to another document."); }
  return result;
}

function summary(journal: DesignJournal): RecordValue {
  const flatBinding = flatTransactionBinding(journal.plan);
  const operation = journal.plan.operation;
  const operations = operation.action === "pcb.batch" ? operation.operations : [operation];
  const parameterEffects = operations.flatMap((entry) => {
    const parsed = designOperationSchema.safeParse(entry.action.startsWith("footprint.") ? { ...entry, action: entry.action.replace("footprint.", "pcb.") } : entry);
    return parsed.success ? designParameterEffects(parsed.data).map((effect) => {
      const result: RecordValue = { operationId: entry.id };
      return Object.assign(result, effect);
    }) : [];
  });
  return { operationId: journal.operationId, profile: PROFILE, state: journal.state,
    action: journal.plan.operation.action, saved: journal.saved, reopened: journal.reopened,
    orphanedCallPossible: journal.orphanedCallPossible, hardStop: journal.hardStop,
    mutationMayHaveOccurred: journal.mutationMayHaveOccurred, nextSafeAction: journal.nextSafeAction,
    createdId: journal.createdId ?? null, targetId: journal.targetId ?? null,
    createdIds: journal.createdIds ?? null, parameterEffects,
    inverse: inverseAvailability(journal),
    ...(flatBinding === undefined ? {} : { topologyAuthority: { kind: "checkpoint-bound-flat-pin-nets", compiledTopology: false,
      schematicUuid: flatBinding.schematicUuid, pageUuid: flatBinding.pageUuid,
      durableDocumentCount: flatBinding.members.length } }),
    beforeSha256: journal.before.sha256, afterSha256: journal.after?.sha256 ?? null,
    journalPath: journal.journalPath, artifacts: journal.artifacts };
}

function isDesignJournal(value: unknown): value is DesignJournal {
  return isRecord(value) && isRecord(value["plan"]) && value["plan"]["profile"] === PROFILE &&
    isRecord(value["plan"]["expectedContext"]) && isRecord(value["plan"]["expectedFingerprint"]) &&
    isRecord(value["before"]) && typeof value["before"]["sha256"] === "string" && Array.isArray(value["before"]["objects"]) &&
    typeof value["operationId"] === "string" && typeof value["sequence"] === "number" &&
    typeof value["state"] === "string" && typeof value["mutationState"] === "string" &&
    typeof value["saved"] === "boolean" && typeof value["reopened"] === "boolean" &&
    typeof value["orphanedCallPossible"] === "boolean" && typeof value["hardStop"] === "boolean" &&
    typeof value["mutationMayHaveOccurred"] === "boolean" && typeof value["nextSafeAction"] === "string" &&
    typeof value["journalPath"] === "string" && Array.isArray(value["artifacts"]) &&
    isRecord(value["context"]) && isRecord(value["preCheckpoint"]) &&
    (value["after"] === undefined || isRecord(value["after"])) &&
    (value["createdId"] === undefined || typeof value["createdId"] === "string") &&
    (value["targetId"] === undefined || typeof value["targetId"] === "string");
}

function journalPayload(value: unknown): DesignJournal {
  if (!isRecord(value) || !isRecord(value["plan"]) || value["plan"]["profile"] !== PROFILE ||
      !isRecord(value["before"]) || typeof value["operationId"] !== "string") {
    throw new Error("Not a typed design transaction journal.");
  }
  const plan = value["plan"];
  designActionSchema.parse(plan["operation"]);
  // LoadOperation has already checked the sealed journal and every artifact.
  if (!isDesignJournal(value)) { throw new Error("Typed design journal has invalid state fields."); }
  if (flatTransactionBinding(value.plan) !== undefined) { assertFlatDisplayJournal(value); }
  if (value.inverse !== undefined) { designActionSchema.parse(value.inverse); }
  if (value.beforeNative !== undefined) { schematicNativeSnapshotSchema.parse(value.beforeNative); }
  if (value.afterNative !== undefined) { schematicNativeSnapshotSchema.parse(value.afterNative); }
  if (value.layoutTemplates !== undefined) { z.record(z.string(), schematicNativeSnapshotSchema).parse(value.layoutTemplates); }
  if (value.layoutWireGroupRepair !== undefined) { schematicWireGroupRepairDescriptorSchema.parse(value.layoutWireGroupRepair); }
  // Retained evidence may belong to an earlier facade generation. Loading or
  // Inspecting it must remain possible; every dispatch separately validates
  // Its selected fingerprint against the current manifest in assertRuntime.
  if (value.runtimeFingerprint !== undefined) { validateExpectedFingerprint(value.runtimeFingerprint); }
  if (value.flatDurabilityClassification !== undefined &&
      (flatTransactionBinding(value.plan) === undefined || !["unchanged-baseline", "exact-intended-effect"].includes(value.flatDurabilityClassification))) {
    throw new Error("Flat display durability classification is malformed.");
  }
  if (hasDesignInverseAttempt(value)) { value.inverseAttempted = true; }
  // Remember legacy Save evidence before rebind/open/read changes its phase.
  // This is execution state, never a change to the sealed original plan.
  if (value.saveAttemptProtocol === undefined && hasSchematicWireSaveEvidence(value)) { value.wireSaveAttempted = true; }
  if (hasLegacyDesignSaveEvidence(value)) { value.designSaveAttempted = true; }
  return value;
}

function state(source: NativeSourceSnapshot, native?: SchematicNativeSnapshot, history?: NativeHistorySnapshot, context?: ExpectedContext, layoutTemplates?: Readonly<Record<string, SchematicNativeSnapshot>>, layoutWireGroupRepair?: SchematicWireGroupRepairDescriptor, layoutConstructorWitness?: SchematicLayoutConstructorWitness): DesignActionState {
  const footprintScope = context?.document.documentType === 4 && history !== undefined ? projectFootprintScope(source, history, context) : undefined;
  const symbolScope = source.document["docType"] === "SYMBOL" && history !== undefined ? projectSymbolScope(source, history) : undefined;
  return { source, ...(native === undefined ? {} : { schematic: native }), ...(history === undefined ? {} : { history }), ...(footprintScope === undefined ? {} : { footprintScope }), ...(symbolScope === undefined ? {} : { symbolScope }), ...(layoutTemplates === undefined ? {} : { layoutTemplates }), ...(layoutWireGroupRepair === undefined ? {} : { layoutWireGroupRepair }), ...(layoutConstructorWitness === undefined ? {} : { layoutConstructorWitness }) };
}
interface LibraryLifecycle { readonly family: "symbol" | "footprint"; readonly scope: unknown; readonly saveCode: string; readonly reopenCode: string }
type RetainedPhase = "before" | "flat-inverse-prepared" | "flat-inverse-verification" | "flat-save-prepared" | "after" | "reconciled" | "layout-net-label-repair-verified" | "layout-visibility-repair-verified" | "layout-wire-group-repair-prepared" | "layout-wire-group-repair-verified" | "apply" | "prepared" | "save-reopen" | "inverse" | "inverse-verified" |
  "symbol-save" | "footprint-save" | "symbol-durable-before-close" | "footprint-durable-before-close" |
  "symbol-reopen" | "footprint-reopen" | "symbol-reopen-recovery" | "footprint-reopen-recovery" |
  "library-reopen-recovery-intent" | "library-reopen-recovery-not-dispatched" | "design-save-intent";
export function selectDesignPhaseDescriptor(artifacts: readonly ArtifactDescriptor[], phase: RetainedPhase, latest = false): ArtifactDescriptor | undefined {
  const pattern = new RegExp(`^[0-9]+-${phase}\\.json$`, "u");
  const descriptors = artifacts.filter((entry) => pattern.test(basename(entry.path)));
  if (descriptors.length === 0) { return undefined; }
  const descriptor = latest ? descriptors.at(-1) : descriptors[0];
  if ((!latest && descriptors.length !== 1) || descriptor === undefined || !Number.isSafeInteger(descriptor.bytes) || descriptor.bytes < 1 || descriptor.bytes > 16 * 1024 * 1024) { throw new Error("Retained design phase is ambiguous or exceeds its bound."); }
  return descriptor;
}
function symbolLifecycle(source: NativeSourceSnapshot, history: NativeHistorySnapshot): LibraryLifecycle {
  const scope = projectSymbolScope(source, history);
  return { family: "symbol", scope, saveCode: buildSymbolSaveCode(source, scope), reopenCode: buildSymbolReopenCode(source, scope) };
}
function footprintLifecycle(source: NativeSourceSnapshot, history: NativeHistorySnapshot, context: ExpectedContext): LibraryLifecycle {
  const scope = projectFootprintScope(source, history, context);
  return { family: "footprint", scope, saveCode: buildFootprintSaveCode(source, scope), reopenCode: buildFootprintReopenCode(source, scope) };
}

function nativeState(value: SchematicNativeSnapshot | undefined): unknown {
  return value === undefined ? null : { ...normalizeSchematicNativeSnapshot(value), document: { documentUuid: value.document.documentUuid } };
}

function sameState(left: DesignActionState, right: DesignActionState): boolean {
  if (left.source.sha256 !== right.source.sha256) { return false; }
  return canonicalJson(nativeState(left.schematic)) === canonicalJson(nativeState(right.schematic));
}

/** Only lifecycle/reconciliation may compare regenerated invisible bookkeeping.
 * Pre-dispatch and within-generation stability checks continue to use sameState.
 */
function lifecycleEquivalent(reference: DesignActionState, observed: DesignActionState): RecordValue | undefined {
  if (sameState(reference, observed)) { return { exact: true }; }
  if (reference.schematic === undefined || observed.schematic === undefined) { return undefined; }
  try {
    return { ...verifySchematicLifecycleEquivalence(reference.source, reference.schematic, observed.source, observed.schematic) };
  } catch { return undefined; }
}

type WirePageLoadAuthority = Pick<DesignJournal, "plan" | "context" | "state" | "saved" | "reopened" | "orphanedCallPossible" | "hardStop" | "before" | "beforeNative" | "beforeTopology" | "after" | "afterNative" | "artifacts" | "layoutWireGroupRepair">;
/** A failed standalone wire may load pages only from its restored baseline.
 * The first prepared page receipt consumes navigation, even on partial failure.
 */
export function assertWirePageLoadAuthority(journal: WirePageLoadAuthority, current: DesignActionState): void {
  if (journal.plan.operation.action !== "sch.wire.modify" || journal.context.document.documentType !== 1 ||
      isTerminalOperation(journal) || journal.orphanedCallPossible || !journal.hardStop || journal.saved || journal.reopened ||
      !["apply-needs-review", "runtime-rebound-needs-reconciliation", "target-opened-needs-reconciliation", "target-open-needs-recovery"].includes(journal.state) ||
      journal.beforeNative === undefined || journal.beforeTopology === undefined || journal.plan.expectedTopology === undefined ||
      journal.after !== undefined || journal.afterNative !== undefined || journal.layoutWireGroupRepair !== undefined ||
      journal.artifacts.some((entry) => /-(?:layout-pages?-load[^.]*|[^.]*repair[^.]*|[^.]*save[^.]*|reopened|inverse[^.]*)\.json$/u.test(basename(entry.path)))) {
    throw new Error("Wire recovery page loading requires one settled pre-Save failure with no prior page load or correction.");
  }
  verifyDesignTopology(journal.beforeTopology, journal.plan.expectedTopology);
  if (current.schematic === undefined || current.source.sha256 !== journal.before.sha256 ||
      lifecycleEquivalent(state(journal.before, journal.beforeNative), current) === undefined) {
    throw new Error("Wire recovery page loading requires the exact restored source and lifecycle-equivalent original native state.");
  }
}

/** Loading sibling pages must not change even inherited IDs on the active page. */
export function verifyWirePageLoadResult(before: DesignActionState, after: DesignActionState, expectedTopology: DesignTopology, topology: DesignTopology): void {
  if (!sameState(before, after)) { throw new Error("Active wire source or native state changed while loading recovery pages."); }
  verifyDesignTopology(expectedTopology, topology);
}

function durableSnapshot(checkpoint: RecordValue, context: ExpectedContext): Promise<NativeHistorySnapshot> {
  const projectUuid = context.project.uuid ?? context.project.projectUuid;
  if (typeof checkpoint["checkpoint"] !== "string" || typeof checkpoint["checkpointSha256"] !== "string" || typeof projectUuid !== "string") {
    throw new TypeError("Durable checkpoint identity is incomplete.");
  }
  return readNativeHistoryCheckpoint({ checkpointPath: checkpoint["checkpoint"], expectedSha256: checkpoint["checkpointSha256"], projectUuid });
}

/** Only the sealed display-only v2 journal may admit imported library peers.
 * Every call rereads its original immutable checkpoint and proves the complete
 * peer membership again. Other actions and historical v1 journals retain the
 * strict reader, including library writes and generic recovery.
 */
async function journalDurableSnapshot(journal: DesignJournal, checkpoint: RecordValue = journal.preCheckpoint,
  context: ExpectedContext = journal.context): Promise<NativeHistorySnapshot> {
  const selected = flatTransactionBinding(journal.plan);
  if (selected === undefined || !("libraryHeaders" in selected) || selected.libraryHeaders === undefined) { return durableSnapshot(checkpoint, context); }
  const binding = assertFlatTransactionBinding(flatTransactionBinding(journal.plan), journal.plan.operation, context);
  const read = (receipt: RecordValue): Promise<NativeHistorySnapshot> => {
    if (typeof receipt["checkpoint"] !== "string" || typeof receipt["checkpointSha256"] !== "string") {
      throw new TypeError("Imported flat display lacks an exact immutable checkpoint.");
    }
    return readNativeHistoryCheckpoint({ checkpointPath: receipt["checkpoint"], expectedSha256: receipt["checkpointSha256"],
      projectUuid: binding.project.projectUuid, libraryAtomHeaders: "preserve" });
  };
  const baseline = await read(journal.preCheckpoint);
  if (baseline.checkpointSha256 !== binding.checkpoint.checkpointSha256 || baseline.semanticSha256 !== binding.checkpoint.historySemanticSha256) {
    throw new Error("Imported flat display baseline differs from its sealed original checkpoint.");
  }
  assertFlatTransactionLibraryPeers(binding, baseline);
  const current = checkpoint === journal.preCheckpoint ? baseline : await read(checkpoint);
  assertFlatTransactionLibraryPeers(binding, current);
  const members = new Map(binding.members.map((entry) => [entry.uuid, entry]));
  if (current.projectUuid !== binding.project.projectUuid || current.projectOwnerUuid !== binding.project.ownerUuid || current.branchUuid !== binding.project.branchUuid ||
      current.documents.length !== binding.members.length || current.documents.some((document) => {
        const peer = members.get(document.uuid);
        return peer?.docType !== document.docType || (document.uuid !== binding.pageUuid && peer.semanticSha256 !== document.semanticSha256);
      })) { throw new Error("Imported flat display changed its sealed project or an immutable peer document."); }
  return current;
}

/** One explicit typed operation per transaction. No caller code, auto-retry,
 * automatic save or silent rollback. Each effect gets independent source proof.
 */
export class DesignExecutor {
  private readonly engine: EasyedaControlEngine;
  public constructor(engine: EasyedaControlEngine) { this.engine = engine; }

  private async assertRuntime(plan: DesignPlan, context: ExpectedContext = plan.expectedContext, fingerprint = plan.expectedFingerprint): Promise<void> {
    validatePrivateFingerprint(fingerprint);
    const status = await this.engine.status();
    assertSubset(status.stableFingerprint, fingerprint, "Typed design runtime fingerprint");
    if (context.document.documentType === 2) {
      const installed = await this.engine.upstream.installedEasyedaBundles?.();
      if (installed === undefined) { throw new Error("Native symbol implementation identity is unavailable."); }
      await verifySchematicNativeProfile(installed.assetsRoot);
      await verifyDeviceAssociationNativeProfile(installed.assetsRoot);
    }
    await this.engine.assertContext(context);
  }

  private async snapshot(context: ExpectedContext): Promise<{ payload: RecordValue; snapshot: NativeSourceSnapshot; native?: SchematicNativeSnapshot }> {
    const payload = await this.engine.exactRead(sourceRequest(context), context);
    const nativePayload = context.document.documentType === 1 ? await this.engine.schematicNativeRead(context) : undefined;
    const native = nativePayload === undefined ? undefined : schematicNativeSnapshotSchema.parse(nativePayload["snapshot"]);
    return { payload, snapshot: sourceSnapshot(payload, context), ...(native === undefined ? {} : { native }) };
  }

  private async assertNavigationPreferences(context: ExpectedContext): Promise<void> {
    await this.engine.assertBridgeDispatchAllowed();
    const installed = await this.engine.upstream.installedEasyedaBundles?.();
    if (installed === undefined) { throw new Error("Navigation preference preflight UI implementation identity is unavailable."); }
    await verifyLibraryNativeProfile(installed.assetsRoot);
    const code = buildPcbNavigationPreferencePreflight(context);
    const result = await this.engine.upstream.callTool("easyeda_execute", { code, timeoutMs: 15_000, confirmWrite: true }, 25_000);
    const payload = extractToolPayload(result);
    if (canonicalJson(payload) !== canonicalJson({ profile: PCB_NAVIGATION_PREFLIGHT_PROFILE, admitted: true })) {
      throw new Error("Navigation preference preflight did not return its exact admission.");
    }
    await verifyLibraryNativeProfile(installed.assetsRoot);
    await this.engine.assertContext(context);
  }

  /** Execute promises a later Save/reopen, unlike standalone unsaved apply. */
  public async preflightSaveNavigation(input: DesignApplyInput): Promise<void> {
    if (!input.confirmWrite) { throw new Error("Typed design writes need explicit confirmation."); }
    const plan: DesignPlan = { profile: PROFILE, operation: designActionSchema.parse(input.operation),
      expectedContext: structuredClone(input.expectedContext), expectedFingerprint: structuredClone(input.expectedFingerprint) };
    await this.engine.assertBridgeDispatchAllowed();
    await this.assertRuntime(plan);
    const context = await this.engine.assertContext(plan.expectedContext);
    await this.assertNavigationPreferences(context);
  }

  /** Read already loaded template pages without changing the active tab. The
   * only page IDs come from the typed operation; bodies never come from callers.
   * The fixed native reader samples twice within the same guarded frame.
   */
  private async readLayoutTemplates(operation: DesignAction, context: ExpectedContext): Promise<Readonly<Record<string, SchematicNativeSnapshot>> | undefined> {
    if (operation.action !== "sch.layout.batch") { return undefined; }
    const sheetIds = [...new Set(operation.operations.filter((step) => step.action === "sch.net-flag.clone").map((step) => step.template.sheetUuid))].toSorted();
    if (sheetIds.length === 0) { return undefined; }
    if (sheetIds.length > 16) { throw new Error("Layout template page count exceeds the reviewed read bound."); }
    const bundles = await this.engine.upstream.installedEasyedaBundles?.();
    if (bundles === undefined) { throw new Error("Installed schematic template implementation identity is unavailable."); }
    await verifySchematicNativeProfile(bundles.assetsRoot);
    const documentUuid = context.document.uuid ?? context.document.documentUuid;
    const projectUuid = context.project.uuid ?? context.project.projectUuid;
    if (typeof documentUuid !== "string" || typeof context.document.tabId !== "string" || typeof projectUuid !== "string") { throw new TypeError("Layout template read requires the exact active page and project."); }
    const templates: Record<string, SchematicNativeSnapshot> = {};
    for (const sheetUuid of sheetIds) {
      await this.engine.assertContext(context);
      const expression = buildLoadedNetFlagTemplateReadExpression({ active: { documentUuid, tabId: context.document.tabId },
        template: { documentUuid: sheetUuid, tabId: `${sheetUuid}@${projectUuid}` }, projectUuid });
      const code = wrapWithContextGuard(buildSchematicNativeTransportCode(expression), context);
      const raw = await this.engine.upstream.callTool("easyeda_execute", { code, timeoutMs: 60_000, confirmWrite: true }, 70_000);
      const template = await decodeSchematicNativeEnvelope(extractToolPayload(raw));
      if (template.document.documentUuid !== sheetUuid || template.document.tabId !== `${sheetUuid}@${projectUuid}`) { throw new Error("Layout template read returned a different page."); }
      templates[sheetUuid] = template;
      await this.engine.assertContext(context);
    }
    await verifySchematicNativeProfile(bundles.assetsRoot);
    return templates;
  }

  private static async artifact(journal: DesignJournal, phase: string, data: unknown): Promise<ArtifactDescriptor> {
    journal.sequence += 1;
    const descriptor = await writePhaseArtifact(journal.operationId, journal.sequence, phase, data);
    journal.artifacts.push(descriptor);
    journal.updatedAt = new Date().toISOString();
    await updateOperation(journal);
    return descriptor;
  }

  private static retainFlatVerification(journal: DesignJournal, phase: "apply" | "reconcile" | "inverse" | "save",
    evidence: FlatDisplayObservationEvidence, durability: RecordValue): Promise<ArtifactDescriptor> {
    const classification = durability["classification"];
    if (classification !== "unchanged-baseline" && classification !== "exact-intended-effect") {
      throw new Error("Flat display durability proof has no recognized classification.");
    }
    journal.flatDurabilityClassification = classification;
    const binding = assertFlatDisplayJournal(journal);
    return DesignExecutor.artifact(journal, `flat-${phase}-verification`, {
      schema: "easyeda-pro-control.flat-display-verification.v1", phase, operationId: journal.operationId, originalPlanHash: journal.planHash,
      flatBindingSha256: sha256Text(canonicalJson(binding)),
      checkpoint: evidence.checkpoint, projectBinding: evidence.projectBinding,
      ...(evidence.libraryHeaderEvidence === undefined ? {} : { libraryHeaderEvidence: evidence.libraryHeaderEvidence }),
      observation: evidence.observation, observationSha256: sha256Text(canonicalJson(evidence.observation)),
      topologyProof: evidence.proof, compiledTopology: false, durability,
    });
  }

  private static async assertFlatInverseCheckpoint(journal: DesignJournal): Promise<void> {
    const retained = journalPayload(await loadOperation(journal.operationId));
    const binding = assertFlatDisplayJournal(retained), bindingSha256 = sha256Text(canonicalJson(binding));
    const descriptor = selectDesignPhaseDescriptor(retained.artifacts, "flat-inverse-verification", true);
    const prepared = await DesignExecutor.phase(retained, "flat-inverse-prepared");
    const verification = await DesignExecutor.phase(retained, "flat-inverse-verification", true);
    if (descriptor === undefined || !isRecord(prepared) || canonicalJson(prepared["flatVerification"]) !== canonicalJson(descriptor) ||
        !isRecord(verification) || verification["schema"] !== "easyeda-pro-control.flat-display-verification.v1" ||
        verification["phase"] !== "inverse" || verification["flatBindingSha256"] !== bindingSha256 ||
        prepared["flatBindingSha256"] !== bindingSha256 || canonicalJson(retained.plan) !== canonicalJson(journal.plan) ||
        canonicalJson(verification["projectBinding"]) !== canonicalJson(binding.project) ||
        verification["operationId"] !== journal.operationId || verification["originalPlanHash"] !== journal.planHash ||
        !isRecord(verification["durability"]) || verification["durability"]["classification"] !== "unchanged-baseline") {
      throw new Error("Flat inverse lacks its exact retained unchanged-baseline verification.");
    }
    await verifyFlatInverseCheckpoint(verification["checkpoint"], journal.context.project.path);
  }

  private observeFlat(context: ExpectedContext): Promise<FlatDisplayObservationEvidence> {
    return observeSchematicFlatTopology(this.engine, context);
  }

  private async flatEvidence(journal: DesignJournal, current: Awaited<ReturnType<DesignExecutor["snapshot"]>>,
    phase: "before" | "after", lifecycle = false): Promise<FlatDisplayObservationEvidence> {
    const binding = assertFlatTransactionBinding(flatTransactionBinding(journal.plan), journal.plan.operation, journal.context);
    if (current.native === undefined) { throw new Error("Flat display requires a complete native snapshot."); }
    const evidence = await this.observeFlat(journal.context);
    verifyFlatTransactionObservation(binding, journal.plan.operation, journal.context, evidence, current.native, phase, lifecycle);
    return evidence;
  }

  private static flatRuntimeGuard(journal: DesignJournal, evidence: FlatDisplayObservationEvidence, phase: "before" | "after"): FlatDisplayRuntimeGuard {
    return { binding: assertFlatTransactionBinding(flatTransactionBinding(journal.plan), journal.plan.operation, journal.context), operation: journal.plan.operation,
      context: journal.context, observation: evidence.observation, phase };
  }

  private async transactionTopology(journal: DesignJournal, current: Awaited<ReturnType<DesignExecutor["snapshot"]>>,
    phase: "before" | "after", lifecycle = false): Promise<{ topology: DesignTopology; flatEvidence?: FlatDisplayObservationEvidence }> {
    if (flatTransactionBinding(journal.plan) === undefined) { return { topology: await readDesignTopology(this.engine, journal.context) }; }
    const evidence = await this.flatEvidence(journal, current, phase, lifecycle);
    return { topology: evidence.proof.topology, flatEvidence: evidence };
  }

  private static async retainFlatLifecycleObservation(journal: DesignJournal, current: Awaited<ReturnType<DesignExecutor["snapshot"]>>,
    phase: FlatLifecyclePhase, sourcePhase: "before" | "after", evidence: FlatDisplayObservationEvidence | undefined): Promise<ArtifactDescriptor | undefined> {
    if (evidence === undefined) { return undefined; }
    if (current.native === undefined) { throw new Error("Flat lifecycle observation requires its verified native snapshot."); }
    const binding = assertFlatDisplayJournal(journal);
    const artifact = buildFlatLifecycleObservation({ phase, sourcePhase, operationId: journal.operationId,
      originalPlanHash: journal.planHash, flatBindingSha256: sha256Text(canonicalJson(binding)), context: journal.context,
      sourceSha256: current.snapshot.sha256, nativeSha256: schematicNativeSnapshotHash(current.native) }, evidence);
    const descriptor = await DesignExecutor.artifact(journal, `flat-${phase}-observation`, artifact);
    return descriptor;
  }

  /** Native source import may already have persisted its exact effect. Both
   * admitted states are complete whole-project comparisons, never an exemption
   * for the active target. A mixed or unrelated durable edit refuses Save.
   */
  private static async flatDurability(journal: DesignJournal, current: Awaited<ReturnType<DesignExecutor["snapshot"]>>,
    evidence: FlatDisplayObservationEvidence, allowAfter: boolean): Promise<RecordValue> {
    if (!["sch.layout.batch", "sch.wire.modify"].includes(journal.plan.operation.action) || journal.beforeNative === undefined || current.native === undefined) {
      throw new Error("Flat display durable classification lacks its exact original layout.");
    }
    return verifyFlatTransactionPersistence({ binding: assertFlatDisplayJournal(journal), operation: journal.plan.operation, context: journal.context,
      baseline: await journalDurableSnapshot(journal), before: journal.before, beforeNative: journal.beforeNative,
      current: current.snapshot, currentNative: current.native, evidence, allowAfter });
  }

  private static async assertFlatDispatch(journal: DesignJournal, phase: string, code: string): Promise<void> {
    const binding = assertFlatDisplayJournal(journal);
    const phases = new Map<string, RetainedPhase>([["apply", "prepared"], ["inverse", "flat-inverse-prepared"], ["save-reopen", "flat-save-prepared"]]);
    const preparedPhase = phases.get(phase);
    if (preparedPhase === undefined) {
      throw new Error("Flat display dispatch lacks its exact sealed original preparation and phase.");
    }
    if (phase === "inverse") { assertFlatTransactionInverse(binding, journal.inverse); }
    const retained = journalPayload(await loadOperation(journal.operationId));
    if (canonicalJson(retained.plan) !== canonicalJson(journal.plan) || retained.planHash !== journal.planHash ||
        canonicalJson(retained.preCheckpoint) !== canonicalJson(journal.preCheckpoint) || retained.before.sha256 !== journal.before.sha256 ||
        canonicalJson(retained.beforeNative) !== canonicalJson(journal.beforeNative)) { throw new Error("Flat display dispatch substituted its sealed journal."); }
    const prepared = await DesignExecutor.phase(retained, preparedPhase);
    if (!isRecord(prepared) || prepared["codeSha256"] !== sha256Text(code) || prepared["flatBindingSha256"] !== sha256Text(canonicalJson(binding))) {
      throw new Error("Flat display dispatch differs from its original prepared program.");
    }
    const before = await DesignExecutor.phase(retained, "before");
    if (!isRecord(before) || sha256Text(canonicalJson(before["flatObservation"])) !== binding.beforeObservationSha256 ||
        sha256Text(canonicalJson(before["flatBaselineProof"])) !== binding.baselineProofSha256 ||
        canonicalJson(before["flatProjectBinding"]) !== canonicalJson(binding.project)) {
      throw new Error("Flat display dispatch lacks its original retained observation and baseline proof.");
    }
  }

  private static async phase(journal: DesignJournal, phase: RetainedPhase, latest = false): Promise<unknown> {
    const descriptor = selectDesignPhaseDescriptor(journal.artifacts, phase, latest);
    if (descriptor === undefined) { return undefined; }
    let text = "";
    let offset = 0;
    while (offset < descriptor.bytes) {
      let length = Math.min(256 * 1024, descriptor.bytes - offset);
      let chunk = await readArtifact(descriptor.path, offset, length);
      // Three truncated bytes of a four-byte character decode to an equal-size U+FFFD.
      // Retreat from that ambiguity once, then stop at the first byte-exact boundary:
      // A genuine complete U+FFFD immediately before it must not trigger more retreats.
      for (let attempt = 0; attempt < 3 && ((attempt === 0 && chunk.text.endsWith("\uFFFD")) ||
        Buffer.byteLength(chunk.text, "utf8") !== chunk.bytesRead); attempt += 1) {
        length -= 1; chunk = await readArtifact(descriptor.path, offset, length);
      }
      if (chunk.size !== descriptor.bytes || chunk.offset !== offset || chunk.bytesRead < 1 || Buffer.byteLength(chunk.text, "utf8") !== chunk.bytesRead) { throw new Error("Retained design phase changed or its UTF-8 chunk boundary is unsupported."); }
      text += chunk.text; offset += chunk.bytesRead;
    }
    if (sha256Text(text) !== descriptor.sha256) { throw new Error("Retained design phase hash changed."); }
    const value: unknown = JSON.parse(text);
    return value;
  }

  private static async libraryPersistence(journal: DesignJournal, input: Parameters<typeof verifyDesignPersistence>[0]): Promise<RecordValue> {
    const verify = journal.context.document.documentType === 2 ? verifySymbolPersistence : verifyFootprintEmptyNetPersistence;
    const otherChanges = input.before.documents.filter((document) => document.uuid !== input.expectedBefore.document["uuid"] &&
      input.after.documents.find((entry) => entry.uuid === document.uuid)?.semanticSha256 !== document.semanticSha256);
    if (otherChanges.length === 0) { return verify(input); }
    if (otherChanges.length !== 1) { throw new Error("Multiple unrelated durable changes cannot be attributed to one prior inverse."); }
    const createdAt = journal.createdAt;
    if (typeof createdAt !== "string" || !Number.isFinite(Date.parse(createdAt))) { throw new TypeError("Current preparation time is unavailable."); }
    const relatedUuid = otherChanges[0]?.uuid;
    const candidates = await scanOperations((entry) => isDesignJournal(entry) &&
      entry.operationId !== journal.operationId && entry.state === "rolled-back" && entry.mutationState === "before" &&
      !entry.orphanedCallPossible && !entry.hardStop && entry.after !== undefined && entry.inverse !== undefined &&
      entry.before.document["uuid"] === relatedUuid && canonicalJson(entry.context.project) === canonicalJson(journal.context.project) &&
      typeof entry.updatedAt === "string" && Number.isFinite(Date.parse(entry.updatedAt)) && Date.parse(entry.updatedAt) <= Date.parse(createdAt) &&
      canonicalJson(externalRuntimeIdentity(entry.plan.expectedFingerprint)) === canonicalJson(externalRuntimeIdentity(journal.plan.expectedFingerprint))
      ? entry.operationId : undefined);
    if (candidates.length !== 1 || candidates[0] === undefined) { throw new Error("Unrelated durable change lacks one authenticated prior rollback journal."); }
    const prior = journalPayload(await loadOperation(candidates[0]));
    if (prior.after === undefined || prior.inverse === undefined || typeof prior["journalSha256"] !== "string") { throw new Error("Prior inverse evidence is incomplete."); }
    const restored = await DesignExecutor.phase(prior, "inverse-verified");
    const acknowledgment = await DesignExecutor.phase(prior, "inverse");
    const descriptor = prior.artifacts.find((entry) => entry.path.endsWith("-inverse-verified.json"));
    if (!isRecord(restored) || !isRecord(acknowledgment) || acknowledgment["ok"] !== true ||
        descriptor === undefined || canonicalJson(restored["snapshot"]) !== canonicalJson(prior.before)) { throw new Error("Prior inverse did not retain its exact complete restoration."); }
    const checkpoint = await durableSnapshot(prior.preCheckpoint, prior.context);
    const beforeState = state(prior.before, prior.beforeNative, checkpoint, prior.context, prior.layoutTemplates, prior.layoutWireGroupRepair);
    const ids = { ...(prior.targetId === undefined ? {} : { targetId: prior.targetId }), ...(prior.createdId === undefined ? {} : { createdId: prior.createdId }), ...(prior.createdIds === undefined ? {} : { createdIds: prior.createdIds }) };
    await verifyDesignActionCooperatively(compileDesignAction(prior.plan.operation), beforeState, state(prior.after, prior.afterNative), ids);
    if (canonicalJson(await inverseDesignActionCooperatively(prior.plan.operation, beforeState, ids)) !== canonicalJson(prior.inverse)) { throw new Error("Retained inverse does not belong to the earlier typed operation."); }
    const related = projectSettledPriorInverse(input, { operationId: prior.operationId, journalSha256: prior["journalSha256"],
      inversePhaseSha256: descriptor.sha256, checkpoint, before: prior.before, after: prior.after, restored: prior.before });
    const current = verify({ ...input, before: related.before });
    return { ok: true, schema: "easyeda-pro-control.composed-design-persistence.v1", isolatedTransaction: false,
      operationId: journal.operationId, targetUuid: input.expectedAfter.document["uuid"], documentCount: input.before.documents.length,
      beforeCheckpointSha256: input.before.checkpointSha256, afterCheckpointSha256: input.after.checkpointSha256,
      beforeSemanticSha256: input.before.semanticSha256, afterSemanticSha256: input.after.semanticSha256,
      settledPriorInverse: related.evidence, current };
  }

  private static async layoutConstructorWitness(journal: DesignJournal, baseline?: NativeHistorySnapshot): Promise<SchematicLayoutConstructorWitness | undefined> {
    if (journal.plan.operation.action !== "sch.layout.batch" || journal.beforeNative === undefined ||
        !needsSchematicLayoutConstructorWitness(journal.plan.operation, journal.before, journal.beforeNative)) { return undefined; }
    return resolveSchematicLayoutConstructorWitness(journal, baseline ?? await durableSnapshot(journal.preCheckpoint, journal.context));
  }

  private static async layoutLifecycle(journal: DesignJournal, observed: DesignActionState, constructorWitness?: SchematicLayoutConstructorWitness): Promise<RecordValue> {
    if (journal.plan.operation.action !== "sch.layout.batch" || journal.createdIds === undefined) { throw new Error("Layout lifecycle lacks its retained typed operation and created IDs."); }
    const baseline = await journalDurableSnapshot(journal);
    const witness = constructorWitness ?? await DesignExecutor.layoutConstructorWitness(journal, baseline);
    return { ...(await verifyDesignActionCooperatively(compileDesignAction(journal.plan.operation),
      state(journal.before, journal.beforeNative, baseline, journal.context, journal.layoutTemplates, journal.layoutWireGroupRepair, witness), observed,
      { createdIds: journal.createdIds, layoutCloneLifecycle: true })) };
  }

  private static async verifyWireGroupRepairIntent(journal: DesignJournal): Promise<void> {
    const prepared = await DesignExecutor.phase(journal, "layout-wire-group-repair-prepared");
    if (journal.layoutWireGroupRepair === undefined) {
      if (prepared !== undefined) { throw new Error("Retained wire-group correction lost its descriptor."); }
      return;
    }
    if (journal.plan.operation.action !== "sch.layout.batch" || !isRecord(prepared) ||
        prepared["originalPlanHash"] !== journal.planHash || canonicalJson(prepared["descriptor"]) !== canonicalJson(journal.layoutWireGroupRepair) ||
        canonicalJson(prepared["createdIds"]) !== canonicalJson(journal.createdIds) ||
        typeof prepared["codeSha256"] !== "string" || !/^[a-f0-9]{64}$/u.test(prepared["codeSha256"]) ||
        canonicalJson(prepared["originalPreparation"]) !== canonicalJson(await DesignExecutor.phase(journal, "prepared")) ||
        canonicalJson(prepared["originalAcknowledgment"]) !== canonicalJson(await DesignExecutor.phase(journal, "apply"))) {
      throw new Error("Wire-group correction is not bound to its original sealed plan and one-shot preparation.");
    }
  }

  private async call(journal: DesignJournal, phase: string, code: string, lifecycle = false): Promise<unknown> {
    assertTransactionTopologyAvailable(journal.plan, journal.context);
    if (flatTransactionBinding(journal.plan) !== undefined) { await DesignExecutor.assertFlatDispatch(journal, phase, code); }
    await this.assertRuntime(journal.plan, journal.context, journal.runtimeFingerprint);
    const nativeLifecycle = ["save-reopen", "footprint-reopen", "footprint-reopen-recovery", "symbol-reopen", "symbol-reopen-recovery"].includes(phase);
    const pcbScopedDispatch = journal.context.document.documentType === 3;
    const installedNative = nativeLifecycle || pcbScopedDispatch ? await this.engine.upstream.installedEasyedaBundles?.() : undefined;
    const persistenceNative = nativeLifecycle ? installedNative : undefined;
    const pcbNative = pcbScopedDispatch ? installedNative : undefined;
    if (nativeLifecycle && persistenceNative === undefined) { throw new Error("Save/reopen project-manager implementation identity is unavailable."); }
    if (pcbScopedDispatch && pcbNative === undefined) { throw new Error("PCB dispatch UI implementation identity is unavailable."); }
    if (persistenceNative !== undefined) { await verifyDeviceAssociationNativeProfile(persistenceNative.assetsRoot); }
    if (pcbNative !== undefined) { await verifyLibraryNativeProfile(pcbNative.assetsRoot); }
    const savePhase = designSavePhase(phase);
    if (savePhase !== undefined) {
      const saveEvidence = await inspectDesignSaveAttempts(journal);
      if (saveEvidence.attempted) { throw new Error("A design Save was already attempted; inspect its retained evidence without repeating Save."); }
    }
    journal.state = `${phase}-dispatching`;
    journal.hardStop = true;
    journal.mutationMayHaveOccurred = true;
    journal.nextSafeAction = "Await the single dispatched operation; never retry an ambiguous write.";
    await updateOperation(journal);
    const recoveryNavigation = ["symbol-reopen-recovery", "footprint-reopen-recovery"].includes(phase);
    const intent = recoveryNavigation ? { operationId: journal.operationId, planHash: journal.planHash, phase,
      sequence: journal.sequence + 1, sourceSha256: journal.after?.sha256, context: journal.context } : undefined;
    if (intent !== undefined) { await DesignExecutor.artifact(journal, "library-reopen-recovery-intent", intent); }
    const previousMark = journal.orphanedCallMarkedAt;
    let saveIntent: DesignSaveIntent | undefined;
    let saveCallbackFinished = false;
    let result: unknown;
    try {
      result = await this.engine.dispatchWithOrphanTracking(journal, phase, "easyeda_execute", {
        code: lifecycle ? code : wrapWithContextGuard(code, journal.context),
        timeoutMs: 60_000, confirmWrite: true,
      }, 70_000, savePhase === undefined && !(phase === "inverse" && flatTransactionBinding(journal.plan) !== undefined) ? undefined : async (): Promise<void> => {
        if (phase === "inverse") { await DesignExecutor.assertFlatInverseCheckpoint(journal); return; }
        if (savePhase === undefined) { throw new Error("Save dispatch lacks its exact phase."); }
        // Runtime/context authority capture has completed, but callTool has not
        // Persist this immutable attempt before crossing that boundary.
        journal.saveAttemptProtocol = DESIGN_SAVE_ATTEMPT_PROFILE;
        saveIntent = createDesignSaveIntent(journal, savePhase);
        await DesignExecutor.artifact(journal, "design-save-intent", saveIntent);
        saveCallbackFinished = true;
      });
    } catch (error) {
      if (saveIntent !== undefined && !saveCallbackFinished && !journal.orphanedCallPossible) {
        const failedIntent = saveIntent;
        // A failed journal update can clear only the in-memory marker. Require
        // The sealed disk journal to prove that authority cleanup completed.
        const retained = journalPayload(await loadOperation(journal.operationId));
        const descriptor = retained.artifacts.find((entry) => entry.sha256 === sha256Text(`${JSON.stringify(failedIntent)}\n`) &&
          basename(entry.path) === `${failedIntent.sequence.toString().padStart(2, "0")}-design-save-intent.json`);
        if (!retained.orphanedCallPossible && descriptor !== undefined) { await DesignExecutor.artifact(journal, "design-save-not-dispatched", createDesignSaveNotDispatched(retained, failedIntent, descriptor)); }
      }
      // No orphan mark means authority capture failed before callTool. Retain
      // That proof so a read/capture failure cannot consume the navigation.
      if (intent !== undefined && !journal.orphanedCallPossible && journal.orphanedCallMarkedAt === previousMark) {
        await DesignExecutor.artifact(journal, "library-reopen-recovery-not-dispatched", { intentSha256: sha256Text(canonicalJson(intent)), dispatched: false });
      }
      throw error;
    }
    const extracted = extractToolPayload(result);
    const payload = isRecord(extracted) && extracted["schema"] === "easyeda-pro-control.exact-json.v1" ? decodeExactReadEnvelope(extracted) : extracted;
    await DesignExecutor.artifact(journal, phase, payload);
    // Preserve the original return before any post-dispatch implementation check
    // Can fail, including the lifecycle manager verifier's nested UI check.
    // Changed implementation bytes never permit replay of the completed call.
    if (persistenceNative !== undefined) { await verifyDeviceAssociationNativeProfile(persistenceNative.assetsRoot); }
    if (pcbNative !== undefined) { await verifyLibraryNativeProfile(pcbNative.assetsRoot); }
    return payload;
  }

  public async apply(input: DesignApplyInput): Promise<RecordValue> {
    if (!input.confirmWrite) { throw new Error("Typed design writes need explicit confirmation."); }
    const wireCandidate = input.expectedContext.document.documentType === 1 && flatWireCandidate(input.operation);
    const flatCandidate = wireCandidate || (input.expectedContext.document.documentType === 1 && flatDisplayCandidate(input.operation));
    if (flatCandidate && input.expectedTopology !== undefined) { throw new Error("A sealed flat transaction derives complete unchanged topology; caller overrides are not authority."); }
    if (!flatCandidate) { assertDesignTopologyExecutionAvailable(input.expectedContext); }
    const operation = designActionSchema.parse(input.operation);
    if (operation.action === "sch.layout.batch" && input.expectedTopology !== undefined) { throw new Error("Schematic layout preserves the complete original compiled topology; an override is not allowed."); }
    if (operation.action === "sch.component.create" && input.expectedTopology !== undefined) { throw new Error("This component-create profile derives exact initially-unconnected topology using journal-owned identities; connect it in a subsequent typed operation."); }
    const compiled = compileDesignAction(operation);
    if (input.expectedContext.document.documentType !== compiled.documentType) { throw new Error("Wrong editor for design action."); }
    if (this.engine.executionAuthorityValidator === undefined) { throw new Error("Launch EasyEDA through the retained runtime supervisor before design writes."); }
    const operations = await listOperationStates();
    const unfinished = operations.filter((entry) => !isTerminalOperation(entry));
    if (unfinished.length > 0) { throw new Error("Resolve the existing incomplete transaction before another design write."); }
    const plan: DesignPlan = { profile: PROFILE, operation, expectedContext: structuredClone(input.expectedContext), expectedFingerprint: structuredClone(input.expectedFingerprint) };
    await this.assertRuntime(plan);
    const context = await this.engine.assertContext(plan.expectedContext);
    const baselineUploads = await this.engine.awaitProjectUploads(context);
    const before = await this.snapshot(context);
    const layoutTemplates = await this.readLayoutTemplates(operation, context);
    const flatBefore = flatCandidate ? await this.observeFlat(context) : undefined;
    const flatPrepared = flatBefore === undefined ? undefined : await (wireCandidate ? prepareFlatWireProfile : prepareFlatDisplayProfile)({ operation, context, evidence: flatBefore, native: before.native });
    if (flatPrepared !== undefined) {
      if (isFlatWireBinding(flatPrepared.binding)) { plan.flatWire = flatPrepared.binding; }
      else { plan.flatDisplay = flatPrepared.binding; }
    }
    const beforeTopology = flatBefore?.proof.topology ?? (context.document.documentType === 1 ? await readDesignTopology(this.engine, context) : undefined);
    if (beforeTopology !== undefined) { plan.expectedTopology = designTopologySchema.parse(input.expectedTopology ?? beforeTopology); }
    else if (input.expectedTopology !== undefined) { throw new Error("Explicit schematic topology cannot be supplied for a PCB action."); }
    const checkpoint = flatBefore === undefined ? await this.engine.checkpoint({ source: context.project.path, outputDir: join(controlDataDirectory(), "checkpoints"), label: "typed-design-before" }) : { ...flatBefore.checkpoint };
    if (!("receiptPath" in checkpoint) || typeof checkpoint.receiptPath !== "string") { throw new Error("Checkpoint creation did not return a durable receipt."); }
    const targetId = "target" in operation && "primitiveId" in operation.target ? operation.target.primitiveId : undefined;
    if ("target" in operation && targetId === undefined) { throw new Error("A standalone transaction requires an exact target ID, not a batch reference."); }
    const id = newOperationId();
    const timestamp = new Date().toISOString();
    const journal: DesignJournal = { schema: OPERATION_SCHEMA, operationId: id, journalPath: operationPath(id),
      planHash: buildPlanHash(plan), plan, state: "planned", mutationState: "before", saved: false, reopened: false, saveAttemptProtocol: DESIGN_SAVE_ATTEMPT_PROFILE,
      orphanedCallPossible: false, hardStop: false, mutationMayHaveOccurred: false,
      nextSafeAction: "Apply the reviewed typed action once.", context, preCheckpoint: checkpoint,
      sequence: 0, createdAt: timestamp, updatedAt: timestamp, artifacts: [], before: before.snapshot,
      ...(targetId === undefined ? {} : { targetId }) };
    // Check that the raw-record effect profile is available before any mutation.
    const baseline = await journalDurableSnapshot(journal, checkpoint, context);
    const beforeState: DesignActionState = state(before.snapshot, before.native, baseline, context, layoutTemplates);
    await assertDesignActionSupportedCooperatively(operation, beforeState, targetId === undefined ? {} : { targetId });
    if (operation.action === "sch.layout.batch") { await yieldProofEventLoop(); }
    const flatGuard = flatBefore === undefined || flatPrepared === undefined ? undefined :
      { binding: flatPrepared.binding, operation, context, observation: flatBefore.observation, phase: "before" as const };
    const prepared = await prepareDesignActionCooperatively(operation, beforeState, targetId === undefined ? {} : { targetId }, flatGuard);
    if (prepared.createdId !== undefined) { journal.createdId = prepared.createdId; }
    if (prepared.createdIds !== undefined) { journal.createdIds = prepared.createdIds; }
    if (prepared.componentCreate !== undefined) {
      journal.componentCreate = structuredClone(prepared.componentCreate);
      plan.expectedTopology = designTopologySchema.parse([...(beforeTopology ?? []), prepared.componentCreate.topology]);
      journal.planHash = buildPlanHash(plan);
    }
    const target = before.snapshot.objects.find((object) => object.id === targetId);
    let baselineTargets = target === undefined ? [] : [{ id: target.id, fields: Object.keys(target.body) }];
    if (prepared.expectedSource !== undefined) {
      const derived = context.document.documentType === 4 ? deriveFootprintBaselineTargets(before.snapshot, prepared.expectedSource, baseline) : deriveDesignBaselineTargets(before.snapshot, prepared.expectedSource);
      baselineTargets = [...derived].map((entry) => ({ id: entry.id, fields: [...entry.fields] }));
    }
    const baselineVerifier = context.document.documentType === 4 ? verifyFootprintBaseline : verifyDesignBaseline;
    const baselineInput = { checkpoint: baseline, source: before.snapshot,
      targets: baselineTargets, ...(before.native === undefined ? {} : { native: before.native }) };
    let baselineProof: RecordValue;
    if (operation.action === "sch.layout.batch") { baselineProof = await verifySchematicLayoutBaselineCooperatively(baselineInput); }
    else if (operation.action === "sch.wire.modify") { baselineProof = verifySchematicWireBaseline(operation, baselineInput); }
    else { baselineProof = baselineVerifier(baselineInput); }
    if (before.native !== undefined) { journal.beforeNative = before.native; }
    if (layoutTemplates !== undefined) { journal.layoutTemplates = structuredClone(layoutTemplates); }
    if (beforeTopology !== undefined) { journal.beforeTopology = beforeTopology; }
    await createOperation(journal);
    await DesignExecutor.artifact(journal, "before", { ...before, baselineProof, baselineUploads,
      ...(flatBefore === undefined ? {} : { flatObservation: flatBefore.observation, flatProof: flatBefore.proof, flatProjectBinding: flatBefore.projectBinding,
        flatBaselineProof: flatPrepared?.baselineProof }) });
    try {
      const recheck = await this.snapshot(context);
      if (!sameState(state(recheck.snapshot, recheck.native), beforeState)) { throw new Error("Design changed after the checkpoint; no write dispatched."); }
      if (flatBefore !== undefined) {
        const fresh = await this.flatEvidence(journal, recheck, "before");
        await DesignExecutor.flatDurability(journal, recheck, fresh, false);
      }
      if (layoutTemplates !== undefined && canonicalJson(await this.readLayoutTemplates(operation, context)) !== canonicalJson(layoutTemplates)) { throw new Error("A loaded net-flag template changed after preparation; no write dispatched."); }
      await DesignExecutor.artifact(journal, "prepared", { adapterProfile: prepared.adapterProfile, createdId: prepared.createdId ?? null, createdIds: prepared.createdIds ?? null, codeSha256: sha256Text(prepared.code), componentCreate: prepared.componentCreate ?? null,
        ...(flatPrepared === undefined ? {} : { flatBindingSha256: sha256Text(canonicalJson(flatPrepared.binding)) }) });
      const result = await this.call(journal, "apply", prepared.code);
      if (!isRecord(result) || result["ok"] !== true || result["id"] !== operation.id) { throw new Error("Typed operation acknowledgment is invalid."); }
      if (operation.action === "pcb.text.create" || operation.action === "pcb.text.delete") {
        assertPcbTextLifecycleAcknowledgment(operation, journal.createdId === undefined ? {} : { createdId: journal.createdId }, result);
      }
      if (journal.createdIds !== undefined && canonicalJson(journal.createdIds) !== canonicalJson(result["createdIds"])) { throw new Error("Batch acknowledgment differs from journal-owned identities."); }
      if (compiled.resultKind === "created-primitive") {
        if (typeof result["createdId"] !== "string") { throw new TypeError("Created identity is unavailable."); }
        if (journal.createdId !== undefined && journal.createdId !== result["createdId"]) { throw new Error("Created identity differs from the prepared native ID."); }
        journal.createdId = result["createdId"];
      }
      if (compiled.resultKind === "derived-copper") { journal.derivedResult = result["derivedResult"]; }
      await updateOperation(journal);
      const after = await this.snapshot(context);
      const ids = { ...(targetId === undefined ? {} : { targetId }), ...(journal.createdId === undefined ? {} : { createdId: journal.createdId }), ...(journal.createdIds === undefined ? {} : { createdIds: journal.createdIds }), ...(journal.derivedResult === undefined ? {} : { derivedResult: journal.derivedResult }), ...(journal.componentCreate === undefined ? {} : { componentCreate: journal.componentCreate }) };
      const afterState: DesignActionState = { source: after.snapshot, ...(after.native === undefined ? {} : { schematic: after.native }) };
      const proof = flatEffectProof(journal, await verifyDesignActionCooperatively(prepared.compiled, beforeState, afterState, ids));
      let flatDurable: RecordValue | undefined;
      let flatVerification: ArtifactDescriptor | undefined;
      if (plan.expectedTopology !== undefined) {
        const flat = flatTransactionBinding(plan) === undefined ? undefined : await this.flatEvidence(journal, after, "after");
        if (flat !== undefined) {
          flatDurable = await DesignExecutor.flatDurability(journal, after, flat, true);
          flatVerification = await DesignExecutor.retainFlatVerification(journal, "apply", flat, flatDurable);
        }
        const topology = flat?.proof.topology ?? await readDesignTopology(this.engine, context);
        verifyDesignTopology(plan.expectedTopology, topology);
        await DesignExecutor.artifact(journal, "topology", topology);
      }
      const inverse = wireCandidate ? flatPrepared?.inverse : await inverseDesignActionCooperatively(operation, beforeState, ids);
      if (flatTransactionBinding(plan) !== undefined) { assertFlatTransactionInverse(flatTransactionBinding(plan), inverse); }
      if (inverse !== undefined) { journal.inverse = inverse; }
      journal.after = after.snapshot;
      if (after.native !== undefined) { journal.afterNative = after.native; }
      journal.state = "applied-unsaved"; journal.mutationState = "after"; journal.hardStop = false;
      journal.nextSafeAction = appliedNextSafeAction(journal);
      await DesignExecutor.artifact(journal, "after", { ...after, proof, ...(flatDurable === undefined ? {} : { flatDurable, flatVerification }) });
      return summary(journal);
    } catch (error) {
      journal.state = journal.orphanedCallPossible ? "apply-outcome-unknown" : "apply-needs-review";
      journal.hardStop = true;
      journal.nextSafeAction = journal.orphanedCallPossible ? "Terminate the retained old runtime normally and recover; do not retry." : "Inspect the journal and current document; do not repeat the edit.";
      await updateOperation(journal);
      throw transactionError(error, journal);
    }
  }

  public static async inspect(operationId: string): Promise<RecordValue> {
    return summary(journalPayload(await loadOperation(operationId)));
  }

  /** Explicit facade-only upgrade binding. It neither classifies nor edits a
   * design, changes the sealed original plan, nor clears orphan uncertainty.
   */
  public async rebindRuntime(operationId: string, expectedFingerprint: RecordValue): Promise<RecordValue> {
    const journal = journalPayload(await loadOperation(operationId));
    if (isTerminalOperation(journal)) { throw new Error("Completed transactions are immutable runtime evidence."); }
    if (journal.orphanedCallPossible) { throw new Error("Prove old execution termination before rebinding its runtime."); }
    await this.engine.assertRecoveryOperationIsolated(operationId);
    validatePrivateFingerprint(expectedFingerprint);
    const status = await this.engine.status();
    const current = status.stableFingerprint;
    assertSubset(current, expectedFingerprint, "Requested replacement runtime");
    assertFacadeOnlyRuntimeUpgrade(journal.plan.expectedFingerprint, current);
    const oldFingerprint = journal.runtimeFingerprint ?? journal.plan.expectedFingerprint;
    journal.runtimeFingerprint = structuredClone(current);
    journal.state = "runtime-rebound-needs-reconciliation";
    journal.hardStop = true;
    journal.nextSafeAction = "Runtime binding updated without dispatching an edit. Reconcile exact native, topology and durable evidence before committing or further writes.";
    await DesignExecutor.artifact(journal, "runtime-rebound", { oldFingerprint, newFingerprint: current, originalPlanHash: journal.planHash, activeTargetVerified: false });
    return summary(journal);
  }

  /** Open only the immutable journal's existing checkpoint-proven target from
   * an empty editor or the same project. Never saves or closes another target.
   */
  public async openTarget(operationId: string): Promise<RecordValue> {
    const journal = journalPayload(await loadOperation(operationId));
    assertTransactionTopologyAvailable(journal.plan, journal.context);
    if (isTerminalOperation(journal) || journal.orphanedCallPossible) { throw new Error("Recovery navigation requires an isolated unresolved journal with no prior execution uncertainty."); }
    await this.engine.assertRecoveryOperationIsolated(operationId);
    const fingerprint = journal.runtimeFingerprint ?? journal.plan.expectedFingerprint;
    validatePrivateFingerprint(fingerprint);
    const status = await this.engine.status();
    assertSubset(status.stableFingerprint, fingerprint, "Recovery navigation runtime");
    const bundles = await this.engine.upstream.installedEasyedaBundles?.();
    if (bundles === undefined) { throw new Error("Installed navigation implementation identity is unavailable."); }
    const flatBinding = flatTransactionBinding(journal.plan);
    const libraryHeaders = flatBinding !== undefined && "libraryHeaders" in flatBinding ? flatBinding.libraryHeaders : undefined;
    const importedPeers = libraryHeaders !== undefined;
    if (importedPeers) { await journalDurableSnapshot(journal); }
    const prepared = await prepareRecoveryNavigation({ expectedContext: journal.plan.expectedContext, preCheckpoint: journal.preCheckpoint,
      assetsRoot: bundles.assetsRoot, ...(importedPeers ? { libraryAtomHeaders: "preserve" as const } : {}) });
    if (importedPeers && prepared.libraryHeaderEvidence?.contentSha256 !== libraryHeaders.contentSha256) {
      throw new Error("Flat display recovery navigation lost its sealed imported library peers.");
    }
    journal.state = "target-open-dispatching"; journal.hardStop = true;
    journal.nextSafeAction = "Await the single target-navigation request. Do not repeat an uncertain open.";
    await DesignExecutor.artifact(journal, "target-open-prepared", { target: prepared.target, codeSha256: sha256Text(prepared.code),
      ...(prepared.libraryHeaderEvidence === undefined ? {} : { libraryHeaderEvidence: prepared.libraryHeaderEvidence }) });
    try {
      const result = await this.engine.dispatchWithOrphanTracking(journal, "target-open", "easyeda_execute", { code: prepared.code, timeoutMs: 60_000, confirmWrite: true }, 70_000);
      await DesignExecutor.artifact(journal, "target-open-return", extractToolPayload(result));
      journal.context = structuredClone(await this.engine.assertContext(structuredClone(journal.plan.expectedContext), { allowTabChange: true }));
      assertTransactionTopologyAvailable(journal.plan, journal.context);
      journal.state = "target-opened-needs-reconciliation";
      journal.nextSafeAction = "Exact saved target is open. Reconcile source, topology and durable state before committing or further writes.";
      await DesignExecutor.artifact(journal, "target-opened", { context: journal.context });
      return summary(journal);
    } catch (error) {
      journal.state = "target-open-needs-recovery";
      journal.nextSafeAction = "Inspect the target and retained navigation evidence; never repeat an uncertain open.";
      await updateOperation(journal); throw transactionError(error, journal);
    }
  }

  /** Recover only execution authority and the current tab binding. The nonce is
   * an operation-bound replay guard; authorized automation may consume the
   * current journal nonce without asking a person to copy it into a message.
   * No action, save, discard, reopen or design-state classification occurs here.
   */
  public async recoverAuthority(operationId: string, runtimeRestartConfirmation?: string): Promise<RecordValue> {
    const journal = journalPayload(await loadOperation(operationId));
    if (isTerminalOperation(journal)) { return summary(journal); }
    const confirmation = runtimeRestartConfirmation ?? (journal.orphanedCallPossible ? await this.engine.ensureRuntimeRestartChallenge(journal) : undefined);
    const boundary = await this.engine.recoverDispatchAuthority(journal, confirmation, async () => {
      const fingerprint = journal.runtimeFingerprint ?? journal.plan.expectedFingerprint;
      validatePrivateFingerprint(fingerprint);
      const status = await this.engine.status();
      assertSubset(status.stableFingerprint, fingerprint, "Typed recovery runtime fingerprint");
    });
    try {
      const context = await this.engine.assertContext(structuredClone(journal.context), { allowTabChange: true });
      if (flatTransactionBinding(journal.plan) !== undefined) { assertTransactionTopologyAvailable(journal.plan, context); }
      journal.context = structuredClone(context);
      journal.state = "authority-recovered-needs-reconciliation";
      journal.hardStop = true;
      journal.nextSafeAction = "Execution authority is recovered. Reconcile the exact document and durable state before another design action.";
      await DesignExecutor.artifact(journal, "authority-recovered", { boundary: boundary ?? null, context });
      return summary(journal);
    } catch (error) {
      journal.state = "authority-recovered-needs-target";
      journal.hardStop = true;
      journal.nextSafeAction = "Prior execution authority is terminated. Open the existing target document normally, then recover its tab binding and reconcile; do not repeat the uncertain action.";
      await updateOperation(journal);
      throw transactionError(error, journal);
    }
  }

  private async loadLayoutPagesForJournal(journal: DesignJournal, baseline: NativeHistorySnapshot): Promise<DesignTopology> {
    assertDesignTopologyExecutionAvailable(journal.context, journal.plan.expectedContext);
    const bundles = await this.engine.upstream.installedEasyedaBundles?.();
    if (bundles === undefined) { throw new Error("Layout page loading requires the pinned native implementation."); }
    await verifySchematicNativeProfile(bundles.assetsRoot);
    await verifyDeviceAssociationNativeProfile(bundles.assetsRoot);
    const pageScope = deriveSchematicLayoutPageLoadScope(journal.context, baseline);
    for (const [index, pageUuid] of pageScope.pageUuids.filter((id) => id !== pageScope.activePageUuid).entries()) {
      const pageCode = buildSchematicLayoutPageLoadCode(pageScope, pageUuid);
      await DesignExecutor.artifact(journal, `layout-page-load-${index + 1}-prepared`, { pageScope, pageUuid, codeSha256: sha256Text(pageCode), saved: false });
      const loaded = await this.call(journal, `layout-page-load-${index + 1}`, pageCode);
      if (!isRecord(loaded) || loaded["ok"] !== true || loaded["profile"] !== "easyeda-pro-control.schematic-layout-page-load.v1" ||
          loaded["pageUuid"] !== pageUuid || loaded["activePageUuid"] !== pageScope.activePageUuid || loaded["activeTabId"] !== pageScope.activeTabId ||
          loaded["loaded"] !== true || loaded["returned"] !== true || loaded["saved"] !== false) { throw new Error("Recovery page loading did not prove the exact loaded page and return target."); }
      await this.engine.assertContext(journal.context);
    }
    await verifyDeviceAssociationNativeProfile(bundles.assetsRoot);
    await verifySchematicNativeProfile(bundles.assetsRoot);
    return readDesignTopology(this.engine, journal.context);
  }

  /** Recovery navigation only, also usable when native reload restored the
   * baseline and full topology is needed to classify that state. Never saves.
   */
  public async loadLayoutPages(operationId: string, confirmOpen: true): Promise<RecordValue> {
    if (!confirmOpen) { throw new Error("Recovery page loading needs explicit navigation confirmation."); }
    const journal = journalPayload(await loadOperation(operationId));
    assertDesignTopologyExecutionAvailable(journal.context, journal.plan.expectedContext);
    const wireRecovery = journal.plan.operation.action === "sch.wire.modify";
    if ((!wireRecovery && journal.plan.operation.action !== "sch.layout.batch") || journal.context.document.documentType !== 1 || isTerminalOperation(journal) || journal.orphanedCallPossible) {
      throw new Error("Recovery page loading requires one unresolved, settled schematic layout or restored wire baseline.");
    }
    await this.engine.assertRecoveryOperationIsolated(operationId);
    await this.assertRuntime(journal.plan, journal.context, journal.runtimeFingerprint);
    const before = await this.snapshot(journal.context);
    if (wireRecovery) { assertWirePageLoadAuthority(journal, state(before.snapshot, before.native)); }
    try {
      const topology = await this.loadLayoutPagesForJournal(journal, await durableSnapshot(journal.preCheckpoint, journal.context));
      const after = await this.snapshot(journal.context);
      if (before.snapshot.sha256 !== after.snapshot.sha256) { throw new Error("Active layout source changed while loading recovery pages."); }
      if (wireRecovery) {
        if (journal.beforeTopology === undefined) { throw new Error("Original wire topology is unavailable."); }
        verifyWirePageLoadResult(state(before.snapshot, before.native), state(after.snapshot, after.native), journal.beforeTopology, topology);
      }
      journal.state = "layout-pages-loaded-needs-reconciliation"; journal.hardStop = true;
      journal.nextSafeAction = wireRecovery ? "All declared pages and the original wire baseline are verified. Reconcile the complete durable project separately; no edit or Save was dispatched." :
        "All declared pages are loaded. Reconcile the current drawing or explicitly correct its retained label ownership; no Save was dispatched.";
      await DesignExecutor.artifact(journal, "layout-pages-loaded", { before, after, topology, saved: false, sourceUnchanged: true });
      return summary(journal);
    } catch (error) {
      journal.state = "layout-pages-load-needs-review"; journal.hardStop = true;
      journal.nextSafeAction = "Inspect the exact loaded-page/context evidence; do not repeat an uncertain navigation or Save.";
      await updateOperation(journal); throw transactionError(error, journal);
    }
  }

  /** Explicit one-shot correction of the retained layout's misplaced label
   * ownership. It never replays the original layout or changes its net intent.
   */
  public async repairLayoutNetLabels(operationId: string, confirmWrite: true): Promise<RecordValue> {
    if (!confirmWrite) { throw new Error("Layout net-label repair needs explicit write confirmation."); }
    const journal = journalPayload(await loadOperation(operationId));
    assertDesignTopologyExecutionAvailable(journal.context, journal.plan.expectedContext);
    const saveEvidence = await inspectDesignSaveAttempts(journal);
    if (saveEvidence.attempted) { throw new Error("A design Save was already attempted; a layout repair cannot reclassify it as unsaved."); }
    const originalPreparation = await DesignExecutor.phase(journal, "prepared");
    const originalAcknowledgment = await DesignExecutor.phase(journal, "apply");
    assertLayoutNetLabelRepairAuthority(journal, originalPreparation, originalAcknowledgment);
    if (journal.createdIds === undefined || journal.beforeNative === undefined || journal.beforeTopology === undefined) { throw new Error("Layout net-label repair lacks complete original native evidence."); }
    await this.engine.assertRecoveryOperationIsolated(operationId);
    await this.assertRuntime(journal.plan, journal.context, journal.runtimeFingerprint);
    await this.engine.awaitProjectUploads(journal.context, journal, "layout-repair-upload-barrier");
    const baseline = await durableSnapshot(journal.preCheckpoint, journal.context);
    const currentTopology = await this.loadLayoutPagesForJournal(journal, baseline);
    const current = await this.snapshot(journal.context);
    if (current.native === undefined) { throw new Error("Layout net-label repair requires the complete current native page."); }
    const evidence = { history: baseline, templates: journal.layoutTemplates ?? {} };
    // Every page call returned and full topology/current source reads completed.
    // A helper refusal here is not a dispatched label correction.
    journal.state = "layout-pages-loaded-needs-reconciliation"; journal.hardStop = true;
    journal.nextSafeAction = "Pages are loaded; label correction has not been prepared or dispatched. Inspect any preflight refusal before further action.";
    await DesignExecutor.artifact(journal, "layout-repair-preflight", { ...current, topology: currentTopology, correctionPrepared: false, correctionDispatched: false });
    let correction: ReturnType<typeof prepareSchematicLayoutNetLabelRepair>;
    try {
      correction = prepareSchematicLayoutNetLabelRepair(journal.plan.operation, journal.before, journal.beforeNative, journal.createdIds, evidence, current.snapshot, current.native);
    } catch (error) { throw transactionError(error, journal); }
    const bundles = await this.engine.upstream.installedEasyedaBundles?.();
    if (bundles === undefined) { throw new Error("Layout correction requires the pinned native schematic implementation."); }
    await verifySchematicNativeProfile(bundles.assetsRoot);
    const code = `const applied=await(async()=>{${correction.code}\n})();if(applied!==true)throw new Error('SCH_LAYOUT_REPAIR_ACK_INVALID');
return {ok:true,profile:${JSON.stringify(correction.profile)},id:${JSON.stringify(journal.plan.operation.id)},currentSourceSha256:${JSON.stringify(correction.currentSourceSha256)},correctedSourceSha256:${JSON.stringify(correction.correctedSourceSha256)}};`;
    journal.state = "layout-net-label-repair-prepared"; journal.hardStop = true;
    journal.nextSafeAction = "Await this one correction and exact source/topology proof; never repeat it or Save on failure.";
    await DesignExecutor.artifact(journal, "layout-net-label-repair-prepared", { ...current, originalPreparation, originalAcknowledgment,
      originalPlanHash: journal.planHash, createdIds: journal.createdIds, profile: correction.profile,
      currentSourceSha256: correction.currentSourceSha256, currentNativeSha256: correction.currentNativeSha256, correctedSourceSha256: correction.correctedSourceSha256,
      expectedSource: correction.expectedSource, labelBindings: correction.labelBindings, misnamedPins: correction.misnamedPins, currentTopology, codeSha256: sha256Text(code) });
    try {
      const recheck = await this.snapshot(journal.context);
      if (!sameState(state(current.snapshot, current.native), state(recheck.snapshot, recheck.native))) { throw new Error("Layout changed after repair preparation; correction was not dispatched."); }
      const result = await this.call(journal, "layout-net-label-repair-apply", code);
      if (!isRecord(result) || result["ok"] !== true || result["profile"] !== correction.profile || result["id"] !== journal.plan.operation.id ||
          result["currentSourceSha256"] !== correction.currentSourceSha256 || result["correctedSourceSha256"] !== correction.correctedSourceSha256) { throw new Error("Layout correction returned a different acknowledgment."); }
      await verifySchematicNativeProfile(bundles.assetsRoot);
      const repaired = await this.snapshot(journal.context);
      const proof = await verifyDesignActionCooperatively(compileDesignAction(journal.plan.operation), state(journal.before, journal.beforeNative, baseline, journal.context, journal.layoutTemplates),
        state(repaired.snapshot, repaired.native), { createdIds: journal.createdIds, layoutCloneLifecycle: true });
      const topology = await readDesignTopology(this.engine, journal.context);
      verifyDesignTopology(journal.beforeTopology, topology);
      const final = await this.snapshot(journal.context);
      if (!sameState(state(repaired.snapshot, repaired.native), state(final.snapshot, final.native))) { throw new Error("Layout changed during repaired-topology verification."); }
      journal.after = repaired.snapshot;
      if (repaired.native !== undefined) { journal.afterNative = repaired.native; }
      delete journal.inverse;
      journal.state = "applied-unsaved"; journal.mutationState = "after"; journal.hardStop = false;
      journal.nextSafeAction = "Label ownership and the complete original circuit are verified. Commit this same transaction for save/reopen and whole-project durable proof.";
      await DesignExecutor.artifact(journal, "layout-net-label-repair-verified", { ...repaired, proof, topology, correctionDelta: compareDocumentSources(current.snapshot, repaired.snapshot),
        originalPlanHash: journal.planHash, createdIds: journal.createdIds, labelBindings: correction.labelBindings });
      return summary(journal);
    } catch (error) {
      journal.state = journal.orphanedCallPossible ? "layout-net-label-repair-outcome-unknown" : "layout-net-label-repair-needs-review";
      journal.hardStop = true; journal.nextSafeAction = "Inspect the retained correction and current design; do not repeat the correction or Save.";
      await updateOperation(journal); throw transactionError(error, journal);
    }
  }

  /** Finish only requested NET hides reverted by the source import's stale
   * connection cache. The original moves, source intent and topology are not
   * replayed or relaxed; the shared correction-intent gate is one-shot.
   */
  public async repairLayoutLabelVisibility(operationId: string, confirmWrite: true): Promise<RecordValue> {
    if (!confirmWrite) { throw new Error("Layout visibility repair needs explicit write confirmation."); }
    const journal = journalPayload(await loadOperation(operationId));
    assertDesignTopologyExecutionAvailable(journal.context, journal.plan.expectedContext);
    const saveEvidence = await inspectDesignSaveAttempts(journal);
    if (saveEvidence.attempted) { throw new Error("A design Save was already attempted; a layout repair cannot reclassify it as unsaved."); }
    const originalPreparation = await DesignExecutor.phase(journal, "prepared");
    const originalAcknowledgment = await DesignExecutor.phase(journal, "apply");
    assertLayoutNetLabelRepairAuthority(journal, originalPreparation, originalAcknowledgment);
    if (journal.createdIds === undefined || journal.beforeNative === undefined || journal.beforeTopology === undefined) { throw new Error("Visibility repair lacks original native evidence."); }
    await this.engine.assertRecoveryOperationIsolated(operationId);
    await this.assertRuntime(journal.plan, journal.context, journal.runtimeFingerprint);
    await this.engine.awaitProjectUploads(journal.context, journal, "layout-visibility-upload-barrier");
    const baseline = await durableSnapshot(journal.preCheckpoint, journal.context);
    const currentTopology = await this.loadLayoutPagesForJournal(journal, baseline);
    verifyDesignTopology(journal.beforeTopology, currentTopology);
    const current = await this.snapshot(journal.context);
    if (current.native === undefined) { throw new Error("Visibility repair requires the complete current native page."); }
    const evidence = { history: baseline, templates: journal.layoutTemplates ?? {} };
    journal.state = "layout-pages-loaded-needs-reconciliation"; journal.hardStop = true;
    journal.nextSafeAction = "Pages and original topology are verified; visibility correction has not been prepared or dispatched.";
    await DesignExecutor.artifact(journal, "layout-visibility-preflight", { ...current, topology: currentTopology, correctionPrepared: false, correctionDispatched: false });
    let correction: ReturnType<typeof prepareSchematicLayoutVisibilityRepair>, preflightCheckpoint: Awaited<ReturnType<EasyedaControlEngine["checkpoint"]>>, preflightPersistence: unknown;
    try {
      correction = prepareSchematicLayoutVisibilityRepair(journal.plan.operation, journal.before, journal.beforeNative, journal.createdIds, evidence, current.snapshot, current.native);
      preflightCheckpoint = await this.engine.checkpoint({ source: journal.context.project.path,
        outputDir: join(controlDataDirectory(), "checkpoints"), label: "typed-layout-visibility-before" });
      if (!("receiptPath" in preflightCheckpoint)) { throw new Error("Visibility preflight checkpoint receipt missing."); }
      preflightPersistence = verifySchematicLayoutVisibilityRepairPersistence(journal.plan.operation,
        { before: baseline, after: await durableSnapshot(preflightCheckpoint, journal.context), expectedBefore: journal.before,
          expectedAfter: current.snapshot, beforeNative: journal.beforeNative, afterNative: current.native }, journal.createdIds, evidence);
    } catch (error) { throw transactionError(error, journal); }
    const bundles = await this.engine.upstream.installedEasyedaBundles?.();
    if (bundles === undefined) { throw new Error("Visibility correction requires the pinned native implementation."); }
    await verifySchematicNativeProfile(bundles.assetsRoot);
    const code = `const applied=await(async()=>{${correction.code}\n})();if(applied!==true)throw new Error('SCH_LAYOUT_VISIBILITY_REPAIR_ACK');
return {ok:true,profile:${JSON.stringify(correction.profile)},id:${JSON.stringify(journal.plan.operation.id)},currentSourceSha256:${JSON.stringify(correction.currentSourceSha256)},correctedSourceSha256:${JSON.stringify(correction.correctedSourceSha256)}};`;
    journal.state = "layout-visibility-repair-prepared"; journal.hardStop = true;
    journal.nextSafeAction = "Await this one visibility correction and exact original effect proof. Never repeat it or Save on failure.";
    await DesignExecutor.artifact(journal, "layout-visibility-repair-prepared", { ...current, originalPreparation, originalAcknowledgment,
      originalPlanHash: journal.planHash, createdIds: journal.createdIds, descriptor: correction.descriptor, profile: correction.profile,
      currentSourceSha256: correction.currentSourceSha256, currentNativeSha256: correction.currentNativeSha256, correctedSourceSha256: correction.correctedSourceSha256,
      expectedSource: correction.expectedSource, currentTopology, preflightCheckpoint, preflightPersistence, codeSha256: sha256Text(code) });
    try {
      const recheck = await this.snapshot(journal.context);
      if (!sameState(state(current.snapshot, current.native), state(recheck.snapshot, recheck.native))) { throw new Error("Layout changed after visibility repair preparation; correction was not dispatched."); }
      const result = await this.call(journal, "layout-visibility-repair-apply", code);
      if (!isRecord(result) || result["ok"] !== true || result["profile"] !== correction.profile || result["id"] !== journal.plan.operation.id ||
          result["currentSourceSha256"] !== correction.currentSourceSha256 || result["correctedSourceSha256"] !== correction.correctedSourceSha256) { throw new Error("Visibility correction returned a different acknowledgment."); }
      await verifySchematicNativeProfile(bundles.assetsRoot);
      const repaired = await this.snapshot(journal.context);
      const proof = await verifyDesignActionCooperatively(compileDesignAction(journal.plan.operation), state(journal.before, journal.beforeNative, baseline, journal.context, journal.layoutTemplates),
        state(repaired.snapshot, repaired.native), { createdIds: journal.createdIds, layoutCloneLifecycle: true });
      const topology = await readDesignTopology(this.engine, journal.context);
      verifyDesignTopology(journal.beforeTopology, topology);
      const final = await this.snapshot(journal.context);
      if (!sameState(state(repaired.snapshot, repaired.native), state(final.snapshot, final.native))) { throw new Error("Layout changed during visibility topology verification."); }
      journal.after = repaired.snapshot;
      if (repaired.native !== undefined) { journal.afterNative = repaired.native; }
      delete journal.inverse;
      journal.state = "applied-unsaved"; journal.mutationState = "after"; journal.hardStop = false;
      journal.nextSafeAction = "Original visibility intent and complete circuit verified. Commit this same journal for Save/reopen and whole-project durable proof.";
      await DesignExecutor.artifact(journal, "layout-visibility-repair-verified", { ...repaired, proof, topology, correctionDelta: compareDocumentSources(current.snapshot, repaired.snapshot),
        originalPlanHash: journal.planHash, createdIds: journal.createdIds, descriptor: correction.descriptor });
      return summary(journal);
    } catch (error) {
      journal.state = journal.orphanedCallPossible ? "layout-visibility-repair-outcome-unknown" : "layout-visibility-repair-needs-review";
      journal.hardStop = true; journal.nextSafeAction = "Inspect the retained visibility correction and current design; never repeat the correction or Save on failure.";
      await updateOperation(journal); throw transactionError(error, journal);
    }
  }

  /** One correction of a retained split ground-drop group. Never replay the
   * layout, rename a net, move geometry, or Save before exact circuit proof.
   */
  public async repairLayoutWireGroups(operationId: string, confirmWrite: true): Promise<RecordValue> {
    if (!confirmWrite) { throw new Error("Wire-group correction needs explicit write confirmation."); }
    const journal = journalPayload(await loadOperation(operationId));
    assertDesignTopologyExecutionAvailable(journal.context, journal.plan.expectedContext);
    const saveEvidence = await inspectDesignSaveAttempts(journal);
    if (saveEvidence.attempted) { throw new Error("A design Save was already attempted; a layout repair cannot reclassify it as unsaved."); }
    const originalPreparation = await DesignExecutor.phase(journal, "prepared");
    const originalAcknowledgment = await DesignExecutor.phase(journal, "apply");
    assertLayoutWireGroupRepairAuthority(journal, originalPreparation, originalAcknowledgment);
    if (journal.createdIds === undefined || journal.beforeNative === undefined || journal.beforeTopology === undefined) {
      throw new Error("Wire-group correction lacks original identities, native state or compiled topology.");
    }
    await this.engine.assertRecoveryOperationIsolated(operationId);
    await this.assertRuntime(journal.plan, journal.context, journal.runtimeFingerprint);
    await this.engine.awaitProjectUploads(journal.context, journal, "layout-wire-group-upload-barrier");
    const baseline = await durableSnapshot(journal.preCheckpoint, journal.context);
    const currentTopology = await this.loadLayoutPagesForJournal(journal, baseline);
    const current = await this.snapshot(journal.context);
    if (current.native === undefined) { throw new Error("Wire-group correction requires complete native state."); }
    const evidence = { history: baseline, templates: journal.layoutTemplates ?? {} };
    journal.state = "layout-pages-loaded-needs-reconciliation"; journal.hardStop = true;
    journal.nextSafeAction = "Wire-group correction has not been prepared or dispatched. Inspect any preflight refusal; do not Save.";
    await DesignExecutor.artifact(journal, "wire-group-repair-preflight", { ...current, topology: currentTopology, correctionDispatched: false });
    let correction: ReturnType<typeof prepareSchematicLayoutWireGroupRepair>;
    let preflightPersistence: RecordValue;
    let preflightCheckpoint: Awaited<ReturnType<EasyedaControlEngine["checkpoint"]>>;
    try {
      correction = prepareSchematicLayoutWireGroupRepair(journal.plan.operation, journal.before, journal.beforeNative,
        journal.createdIds, evidence, current.snapshot, current.native);
      verifyLayoutWireGroupRepairTopology(journal.beforeNative, journal.beforeTopology, currentTopology, correction.misnamedPins);
      preflightCheckpoint = await this.engine.checkpoint({ source: journal.context.project.path,
        outputDir: join(controlDataDirectory(), "checkpoints"), label: "typed-layout-wire-group-before" });
      if (!("receiptPath" in preflightCheckpoint)) { throw new Error("Wire-group preflight checkpoint receipt missing."); }
      preflightPersistence = verifySchematicLayoutWireGroupRepairLegacyPersistence(journal.plan.operation,
        { before: baseline, after: await durableSnapshot(preflightCheckpoint, journal.context), expectedBefore: journal.before,
          expectedAfter: current.snapshot, beforeNative: journal.beforeNative, afterNative: current.native }, journal.createdIds, evidence);
    } catch (error) { throw transactionError(error, journal); }
    const bundles = await this.engine.upstream.installedEasyedaBundles?.();
    if (bundles === undefined) { throw new Error("Wire-group correction requires the pinned native implementation."); }
    await verifySchematicNativeProfile(bundles.assetsRoot);
    const profile = "easyeda-pro-control.schematic-layout-wire-group-repair.v1";
    const code = `const applied=await(async()=>{${correction.code}\n})();if(applied!==true)throw new Error('SCH_LAYOUT_WIRE_GROUP_REPAIR_ACK');
return {ok:true,profile:${JSON.stringify(profile)},id:${JSON.stringify(journal.plan.operation.id)},currentSourceSha256:${JSON.stringify(correction.currentSourceSha256)},correctedSourceSha256:${JSON.stringify(correction.correctedSourceSha256)}};`;
    journal.layoutWireGroupRepair = correction.descriptor;
    journal.state = "layout-wire-group-repair-prepared"; journal.hardStop = true;
    journal.nextSafeAction = "Await the single wire-group correction and exact original circuit proof. Never repeat it or Save on failure.";
    await DesignExecutor.artifact(journal, "layout-wire-group-repair-prepared", { ...current, originalPreparation, originalAcknowledgment,
      originalPlanHash: journal.planHash, createdIds: journal.createdIds, descriptor: correction.descriptor, profile,
      currentSourceSha256: correction.currentSourceSha256, correctedSourceSha256: correction.correctedSourceSha256,
      expectedSource: correction.expectedSource, misnamedPins: correction.misnamedPins, currentTopology,
      preflightCheckpoint, preflightPersistence, codeSha256: sha256Text(code) });
    try {
      const recheck = await this.snapshot(journal.context);
      if (!sameState(state(current.snapshot, current.native), state(recheck.snapshot, recheck.native))) {
        throw new Error("Document changed after wire-group repair preparation; correction was not dispatched.");
      }
      const result = await this.call(journal, "layout-wire-group-repair-apply", code);
      if (!isRecord(result) || result["ok"] !== true || result["profile"] !== profile || result["id"] !== journal.plan.operation.id ||
          result["currentSourceSha256"] !== correction.currentSourceSha256 || result["correctedSourceSha256"] !== correction.correctedSourceSha256) {
        throw new Error("Wire-group correction returned a different acknowledgment.");
      }
      await verifySchematicNativeProfile(bundles.assetsRoot);
      const repaired = await this.snapshot(journal.context);
      const proof = await verifyDesignActionCooperatively(compileDesignAction(journal.plan.operation),
        state(journal.before, journal.beforeNative, baseline, journal.context, journal.layoutTemplates, correction.descriptor),
        state(repaired.snapshot, repaired.native), { createdIds: journal.createdIds, layoutCloneLifecycle: true });
      const topology = await readDesignTopology(this.engine, journal.context);
      verifyDesignTopology(journal.beforeTopology, topology);
      const final = await this.snapshot(journal.context);
      if (!sameState(state(repaired.snapshot, repaired.native), state(final.snapshot, final.native))) { throw new Error("Document changed during repaired topology verification."); }
      journal.after = repaired.snapshot;
      if (repaired.native !== undefined) { journal.afterNative = repaired.native; }
      delete journal.inverse;
      journal.state = "applied-unsaved"; journal.mutationState = "after"; journal.hardStop = false;
      journal.nextSafeAction = "Corrected wire identity and the complete original circuit are verified. Commit this same journal for Save/reopen and complete durable proof.";
      await DesignExecutor.artifact(journal, "layout-wire-group-repair-verified", { ...repaired, proof, topology,
        correctionDelta: compareDocumentSources(current.snapshot, repaired.snapshot), originalPlanHash: journal.planHash,
        createdIds: journal.createdIds, descriptor: correction.descriptor });
      return summary(journal);
    } catch (error) {
      journal.state = journal.orphanedCallPossible ? "layout-wire-group-repair-outcome-unknown" : "layout-wire-group-repair-needs-review";
      journal.hardStop = true;
      journal.nextSafeAction = "Inspect the retained wire-group correction and current design; do not repeat the correction or Save.";
      await updateOperation(journal); throw transactionError(error, journal);
    }
  }

  /** Classify a returned-but-failed call without executing its action again. */
  public async reconcile(operationId: string): Promise<RecordValue> {
    const journal = journalPayload(await loadOperation(operationId));
    assertTransactionTopologyAvailable(journal.plan, journal.context);
    if (isTerminalOperation(journal)) { return summary(journal); }
    if (journal.orphanedCallPossible) { throw new Error("Prior execution may still be running. Prove retained runtime termination before reconciliation."); }
    const saveEvidence = await inspectDesignSaveAttempts(journal);
    const retainedProfile = [2, 4].includes(journal.context.document.documentType) || ["sch.wire.modify", "pcb.pour.rebuild", "pcb.text.create"].includes(journal.plan.operation.action) ||
      (journal.plan.operation.action === "sch.layout.batch" && !journal.plan.operation.operations.some((step) => step.action === "sch.wire.replace"));
    if (saveEvidence.attempted && !retainedProfile) { throw new Error("A design Save was already attempted; no maintained retained-Save proof applies to this state. Do not downgrade it to applied-unsaved or repeat Save."); }
    if (saveEvidence.attempted && [2, 4].includes(journal.context.document.documentType) && !DesignExecutor.hasLibrarySaveEvidence(journal)) {
      throw new Error("Library Save was attempted without a retained success acknowledgment; do not repeat Save or downgrade to applied-unsaved.");
    }
    if (saveEvidence.attempted && journal.plan.operation.action === "sch.layout.batch" && selectDesignPhaseDescriptor(journal.artifacts, "save-reopen") === undefined) {
      throw new Error("Layout Save was attempted without a retained success acknowledgment; do not repeat Save or downgrade to applied-unsaved.");
    }
    if (saveEvidence.attempted && journal.plan.operation.action === "sch.wire.modify" && selectDesignPhaseDescriptor(journal.artifacts, "save-reopen") === undefined) {
      throw new Error("Wire Save was attempted without a retained success acknowledgment; do not repeat Save or downgrade to applied-unsaved.");
    }
    await this.engine.assertRecoveryOperationIsolated(operationId);
    await this.assertRuntime(journal.plan, journal.context, journal.runtimeFingerprint);
    if (saveEvidence.attempted && journal.plan.operation.action === "pcb.text.create") {
      if (saveEvidence.intentCount !== 1 || saveEvidence.provenNotDispatchedCount !== 0) { throw new Error("PCB text retained Save requires exactly one consumed original intent."); }
      return this.reconcileSavedPcbText(journal);
    }
    const retainedWireSave = journal.plan.operation.action === "sch.wire.modify" && saveEvidence.attempted;
    await this.engine.awaitProjectUploads(journal.context, journal, "reconcile-upload-barrier");
    const current = await this.snapshot(journal.context);
    await DesignExecutor.verifyWireGroupRepairIntent(journal);
    const baseline = await journalDurableSnapshot(journal);
    const constructorWitness = await DesignExecutor.layoutConstructorWitness(journal, baseline);
    const beforeState = state(journal.before, journal.beforeNative, baseline, journal.context, journal.layoutTemplates, journal.layoutWireGroupRepair, constructorWitness);
    const currentState = state(current.snapshot, current.native);
    if (retainedWireSave) { return this.reconcileSavedWire(journal, current, beforeState); }
    if (DesignExecutor.hasLibrarySaveEvidence(journal)) {
      const retained = await this.verifySavedLibrary(journal, current);
      journal.saved = true; journal.state = "saved-awaiting-reopen"; journal.mutationState = "after"; journal.hardStop = false;
      journal.nextSafeAction = retained.navigation.action === "reuse-reopen" ?
        "Commit verifies the retained successful reopen without repeating Save or navigation." :
        "The exact saved edit is verified. Commit performs only one close/reopen and final durable proof; it does not repeat Save.";
      await DesignExecutor.artifact(journal, "saved-library-reconciled", retained.evidence);
      return summary(journal);
    }

    if (journal.plan.operation.action === "sch.layout.batch" && !journal.plan.operation.operations.some((step) => step.action === "sch.wire.replace") &&
        selectDesignPhaseDescriptor(journal.artifacts, "save-reopen") !== undefined) {
      const savedDescriptor = selectDesignPhaseDescriptor(journal.artifacts, "save-reopen");
      const savedIndex = savedDescriptor === undefined ? -1 : journal.artifacts.indexOf(savedDescriptor);
      const phaseNames = ["after", "reconciled", "layout-net-label-repair-verified", "layout-wire-group-repair-verified", "layout-visibility-repair-verified"] as const;
      const priorArtifacts = journal.artifacts.slice(0, savedIndex);
      const candidates = phaseNames.flatMap((phase) => {
        const descriptor = selectDesignPhaseDescriptor(priorArtifacts, phase, true);
        return descriptor === undefined ? [] : [{ phase, index: priorArtifacts.indexOf(descriptor) }];
      }).toSorted((left, right) => right.index - left.index);
      const candidate = candidates[0];
      if (savedDescriptor === undefined || savedIndex === -1 || candidate === undefined) { throw new Error("Retained layout Save lacks its preceding verified after artifact."); }
      const afterPhase = await DesignExecutor.phase({ ...journal, artifacts: priorArtifacts }, candidate.phase, true);
      const savedAck = await DesignExecutor.phase(journal, "save-reopen");
      verifyLayoutRetainedSaveAuthority(journal, afterPhase, savedAck);
      if (flatTransactionBinding(journal.plan) !== undefined) { verifyFlatDisplayRetainedSaveAuthority(journal, await DesignExecutor.phase(journal, "flat-save-prepared"), savedAck); }
      if (journal.after === undefined || journal.afterNative === undefined || journal.createdIds === undefined ||
          journal.beforeNative === undefined || current.native === undefined || beforeState.history === undefined || journal.beforeTopology === undefined) {
        throw new Error("Retained layout Save lacks complete source, native or checkpoint evidence.");
      }
      const ids = { createdIds: journal.createdIds, layoutCloneLifecycle: true as const };
      const compiled = compileDesignAction(journal.plan.operation);
      const savedEffect = await verifyDesignActionCooperatively(compiled, beforeState, state(journal.after, journal.afterNative), ids);
      const lifecycle = await verifyDesignActionCooperatively(compiled, beforeState, currentState, ids);
      const { topology, flatEvidence } = await this.transactionTopology(journal, current, "after", true);
      verifyDesignTopology(journal.beforeTopology, topology);
      const flatLifecycleObservation = await DesignExecutor.retainFlatLifecycleObservation(journal, current, "retained-save", "after", flatEvidence);
      await this.engine.awaitProjectUploads(journal.context, journal, "layout-saved-reconcile-upload-barrier");
      const checkpoint = await this.engine.checkpoint({ source: journal.context.project.path,
        outputDir: join(controlDataDirectory(), "checkpoints"), label: "typed-layout-retained-save-reconciled" });
      if (!("receiptPath" in checkpoint)) { throw new Error("Retained layout reconciliation checkpoint receipt missing."); }
      const savedHistory = await journalDurableSnapshot(journal, checkpoint);
      const persistence = await verifySchematicLayoutPersistenceCooperatively(journal.plan.operation, { before: beforeState.history,
        after: savedHistory, expectedBefore: journal.before, expectedAfter: current.snapshot,
        beforeNative: journal.beforeNative, afterNative: current.native }, journal.createdIds,
        { history: beforeState.history, templates: journal.layoutTemplates ?? {}, ...(journal.layoutWireGroupRepair === undefined ? {} : { wireGroupRepair: journal.layoutWireGroupRepair }), ...(constructorWitness === undefined ? {} : { constructorWitness }) });
      const flatMaterialization = flatTransactionBinding(journal.plan) === undefined ? undefined :
        await verifyFlatDisplayMaterialization({ history: savedHistory, source: current.snapshot, native: current.native });
      const final = await this.snapshot(journal.context);
      if (!sameState(currentState, state(final.snapshot, final.native))) { throw new Error("Layout changed during retained Save verification."); }
      await DesignExecutor.artifact(journal, "layout-retained-save-reconciled", { ...final, checkpoint,
        persistence: flatPersistenceProof(journal, persistence), savedEffect: flatEffectProof(journal, savedEffect),
        lifecycle: flatEffectProof(journal, lifecycle), topology,
        ...(flatLifecycleObservation === undefined ? {} : { flatLifecycleObservation }),
        ...(flatMaterialization === undefined ? {} : { flatMaterialization }),
        retainedSaveAcknowledgment: savedAck, retainedAfterArtifact: priorArtifacts[candidate.index],
        saveDispatchedByRecovery: false, navigationDispatchedByRecovery: false });
      journal.saved = true; journal.reopened = true; journal.state = "completed"; journal.mutationState = "after"; journal.hardStop = false;
      journal.nextSafeAction = "The retained Save/reopen, complete original circuit and full durable layout are verified. No Save, navigation or design action was repeated.";
      await updateOperation(journal);
      return summary(journal);
    }
    if (journal.plan.operation.action === "pcb.pour.rebuild" && journal.after !== undefined) {
      const savedAck = await DesignExecutor.phase(journal, "save-reopen");
      if (savedAck !== undefined) {
        verifyCopperSaveAcknowledgment(savedAck, await DesignExecutor.phase(journal, "after"), journal.after);
        const ids = { ...(journal.targetId === undefined ? {} : { targetId: journal.targetId }), derivedResult: journal.derivedResult };
        await verifyDesignActionCooperatively(compileDesignAction(journal.plan.operation), beforeState, state(journal.after), ids);
        const lifecycle = verifyCopperLifecycleEquivalence(journal.after, current.snapshot);
        if (journal.plan.expectedTopology !== undefined) { verifyDesignTopology(journal.plan.expectedTopology, await readDesignTopology(this.engine, journal.context)); }
        const checkpoint = await this.engine.checkpoint({ source: journal.context.project.path, outputDir: join(controlDataDirectory(), "checkpoints"), label: "typed-copper-reconciled-persisted" });
        if (!("receiptPath" in checkpoint)) { throw new Error("Copper reconciliation checkpoint receipt missing."); }
        const persistence = verifyDesignPersistence({ before: await durableSnapshot(journal.preCheckpoint, journal.context), after: await durableSnapshot(checkpoint, journal.context), expectedBefore: journal.before, expectedAfter: journal.after });
        await DesignExecutor.artifact(journal, "reconciled-persisted", { ...current, checkpoint, persistence, lifecycle, retainedSaveAcknowledgment: savedAck });
        journal.saved = true; journal.reopened = true; journal.state = "completed"; journal.mutationState = "after"; journal.hardStop = false;
        journal.nextSafeAction = "The retained save/reopen, exact durable edit and current native arc reload are verified. No save or design action was repeated.";
        await updateOperation(journal);
        return summary(journal);
      }
    }
    if (saveEvidence.attempted) { throw new Error("A design Save was already attempted; no maintained retained-Save proof applies to this state. Do not downgrade it to applied-unsaved or repeat Save."); }
    let durableNoMutation: RecordValue | undefined;
    let flatVerification: ArtifactDescriptor | undefined;
    let flatLifecycleObservation: ArtifactDescriptor | undefined;
    let baselineLifecycle = lifecycleEquivalent(beforeState, currentState);
    if (baselineLifecycle === undefined && journal.context.document.documentType === 4) {
      const nativeDefault = expectedNativeEmptyNetDefault(journal.before);
      if (sameState(state(nativeDefault), currentState)) {
        baselineLifecycle = { profile: "footprint-empty-net-default.v1", beforeSourceSha256: journal.before.sha256, currentSourceSha256: current.snapshot.sha256 };
      }
    }
    if (baselineLifecycle) {
      if (journal.beforeTopology !== undefined) {
        const { topology, flatEvidence } = await this.transactionTopology(journal, current, "before", true);
        verifyDesignTopology(journal.beforeTopology, topology);
        flatLifecycleObservation = await DesignExecutor.retainFlatLifecycleObservation(journal, current, "baseline-reconcile", "before", flatEvidence);
      }
      const checkpoint = await this.engine.checkpoint({ source: journal.context.project.path,
        outputDir: join(controlDataDirectory(), "checkpoints"), label: "typed-design-reconciled-before" });
      if (!("receiptPath" in checkpoint)) { throw new Error("Reconciliation checkpoint receipt missing."); }
      const recoveryPersistenceInput = { before: await journalDurableSnapshot(journal),
        after: await journalDurableSnapshot(journal, checkpoint), expectedBefore: journal.before, expectedAfter: current.snapshot,
        ...(journal.beforeNative === undefined || current.native === undefined ? {} : { beforeNative: journal.beforeNative, afterNative: current.native }) };
      let persistence: RecordValue;
      if (flatTransactionBinding(journal.plan) === undefined) { persistence = journal.context.document.documentType === 4 ? verifyFootprintEmptyNetPersistence(recoveryPersistenceInput) : verifyDesignPersistence(recoveryPersistenceInput); }
      else { persistence = await verifyFlatDisplayRestoration(recoveryPersistenceInput); }
      durableNoMutation = { checkpoint, persistence, lifecycle: baselineLifecycle };
      journal.state = "reconciled-no-mutation"; journal.mutationState = "before"; journal.hardStop = false;
      journal.mutationMayHaveOccurred = false;
      if (journal.context.document.documentType === 4) {
        journal.nextSafeAction = "Requested geometry is absent. The retained proof lists native empty-net and metadata bookkeeping separately; all other records match. No action or save was retried.";
      } else {
        journal.nextSafeAction = flatTransactionBinding(journal.plan) === undefined ?
          "Exact current document and all decoded durable documents match the pre-edit baseline; no action or save was retried." :
          "Original source and all durable documents match the flat baseline with separately reported native initialization/encoding; no action or Save was retried.";
      }
    } else {
      if (journal.plan.operation.action === "sch.layout.batch" && journal.plan.operation.operations.some((step) => step.action === "sch.wire.replace")) {
        if (journal.createdIds === undefined || journal.beforeNative === undefined || current.native === undefined || beforeState.history === undefined || journal.beforeTopology === undefined ||
            canonicalJson(journal.plan.expectedTopology) !== canonicalJson(journal.beforeTopology)) { throw new Error("Historical layout recovery lacks its original source, identities or unchanged topology contract."); }
        const acknowledgment = await DesignExecutor.phase(journal, "apply"), prepared = await DesignExecutor.phase(journal, "prepared");
        if (!isRecord(prepared) || prepared["adapterProfile"] !== "easyeda-pro-control.schematic-layout-batch.v1" || canonicalJson(prepared["createdIds"]) !== canonicalJson(journal.createdIds) ||
            !isRecord(acknowledgment) || acknowledgment["ok"] !== true || acknowledgment["kind"] !== "typed-design-result" || acknowledgment["id"] !== journal.plan.operation.id ||
            acknowledgment["createdId"] !== null || canonicalJson(acknowledgment["createdIds"]) !== canonicalJson(journal.createdIds)) { throw new Error("Historical layout recovery lacks its exact retained preparation and native acknowledgment."); }
        const proof = verifyHistoricalSchematicLayoutEffect(journal.plan.operation, journal.before, current.snapshot, journal.beforeNative, current.native,
          journal.createdIds, { history: beforeState.history, templates: journal.layoutTemplates ?? {} });
        verifyDesignTopology(journal.beforeTopology, await readDesignTopology(this.engine, journal.context));
        const checkpoint = await this.engine.checkpoint({ source: journal.context.project.path, outputDir: join(controlDataDirectory(), "checkpoints"), label: "typed-layout-historical-reconciled" });
        if (!("receiptPath" in checkpoint)) { throw new Error("Historical layout reconciliation checkpoint receipt missing."); }
        const persistence = verifySchematicStoragePersistence({ before: beforeState.history, after: await durableSnapshot(checkpoint, journal.context),
          expectedBefore: journal.before, expectedAfter: current.snapshot, beforeNative: journal.beforeNative, afterNative: current.native });
        await DesignExecutor.artifact(journal, "historical-layout-reconciled-persisted", { ...current, checkpoint, proof, persistence,
          retainedPreparation: prepared, retainedAcknowledgment: acknowledgment, savedByNativePersistence: true, saveDispatchedByRecovery: false, reopenedProved: false });
        journal.after = current.snapshot; journal.afterNative = current.native; delete journal.inverse;
        journal.saved = true; journal.reopened = false; journal.state = "completed"; journal.mutationState = "after"; journal.hardStop = false;
        journal.nextSafeAction = "Historical layout reconciled from exact current native state, unchanged compiled topology and complete durable evidence. No edit or Save was repeated; this is not current-profile save/reopen validation.";
        await updateOperation(journal);
        return summary(journal);
      }
      const ids = { ...(journal.targetId === undefined ? {} : { targetId: journal.targetId }), ...(journal.createdId === undefined ? {} : { createdId: journal.createdId }), ...(journal.createdIds === undefined ? {} : { createdIds: journal.createdIds }), ...(journal.derivedResult === undefined ? {} : { derivedResult: journal.derivedResult }), ...(journal.componentCreate === undefined ? {} : { componentCreate: journal.componentCreate }) };
      if (journal.plan.operation.action === "pcb.text.create") {
        assertPcbTextCreateRetainedAuthority(journal.plan.operation, journal.createdId,
          await DesignExecutor.phase(journal, "prepared"), await DesignExecutor.phase(journal, "apply"));
      }
      // Creation code allocates an identity only during original preparation.
      // Reconciliation proves the retained journal identity without rebuilding
      // Or redispatching that program or minting a replacement identity.
      const prepared = journal.plan.operation.action === "sch.component.create" || journal.plan.operation.action === "pcb.text.create"
        ? undefined : await prepareDesignActionCooperatively(journal.plan.operation, beforeState, ids);
      const compiled = prepared?.compiled ?? compileDesignAction(journal.plan.operation);
      const proof = flatEffectProof(journal, await verifyDesignActionCooperatively(compiled, beforeState, currentState, { ...ids, ...(journal.plan.operation.action === "sch.layout.batch" ? { layoutCloneLifecycle: true as const } : {}) }));
      if (journal.plan.expectedTopology !== undefined) {
        const flat = flatTransactionBinding(journal.plan) === undefined ? undefined : await this.flatEvidence(journal, current, "after");
        if (flat !== undefined) {
          const durable = await DesignExecutor.flatDurability(journal, current, flat, true);
          flatVerification = await DesignExecutor.retainFlatVerification(journal, "reconcile", flat, durable);
        }
        verifyDesignTopology(journal.plan.expectedTopology, flat?.proof.topology ?? await readDesignTopology(this.engine, journal.context));
      }
      journal.after = current.snapshot;
      if (current.native !== undefined) { journal.afterNative = current.native; }
      const inverse = journal.plan.flatWire === undefined ? await inverseDesignActionCooperatively(journal.plan.operation, beforeState, ids) :
        flatWireInverse(journal.plan.operation, journal.before, schematicNativeSnapshotSchema.parse(journal.beforeNative));
      if (flatTransactionBinding(journal.plan) !== undefined) { assertFlatTransactionInverse(flatTransactionBinding(journal.plan), inverse); }
      if (inverse === undefined) { delete journal.inverse; }
      else { journal.inverse = inverse; }
      journal.state = "applied-unsaved"; journal.mutationState = "after"; journal.hardStop = false;
      journal.nextSafeAction = appliedNextSafeAction(journal);
      await DesignExecutor.artifact(journal, "reconciled-effect", proof);
    }
    await DesignExecutor.artifact(journal, "reconciled", { ...current, ...(durableNoMutation === undefined ? {} : { durableNoMutation }),
      ...(flatLifecycleObservation === undefined ? {} : { flatLifecycleObservation }),
      ...(flatVerification === undefined ? {} : { flatVerification }) });
    return summary(journal);
  }

  /** Creation-only retained lifecycle proof. The original source, ID and Save
   * remain immutable authority; no preparation, Save, inverse or navigation
   * program is generated or dispatched by this recovery path.
   */
  private async reconcileSavedPcbText(journal: DesignJournal): Promise<RecordValue> {
    if (hasDesignInverseAttempt(journal) || journal.beforeTopology !== undefined || journal.plan.expectedTopology !== undefined || flatTransactionBinding(journal.plan) !== undefined) {
      throw new Error("PCB text retained Save has unsupported inverse or topology authority.");
    }
    const names = ["before", "prepared", "apply", "after", "design-save-intent", "save-reopen"] as const;
    const descriptors = names.map((name) => selectDesignPhaseDescriptor(journal.artifacts, name));
    let previous = -1;
    for (const descriptor of descriptors) {
      const index = descriptor === undefined ? -1 : journal.artifacts.indexOf(descriptor);
      if (index <= previous) { throw new Error("PCB text original lifecycle phases are missing or out of order."); }
      previous = index;
    }
    const [before, prepared, apply, after, intent, save] = await Promise.all(names.map((name) => DesignExecutor.phase(journal, name)));
    const authority = verifyPcbTextRetainedSaveAuthority(journal, { before, prepared, apply, after, intent, save });
    const native = await this.engine.upstream.installedEasyedaBundles?.();
    if (native === undefined) { throw new Error("PCB text reload implementation identity is unavailable."); }
    // Reuse exact asset verifiers: PCB/UI/API plus manager/worker. No DRC or
    // Device operation is called; these functions read and hash files only.
    await verifyNativeRuleReportProfile(native.assetsRoot, "pcb-drc");
    await verifyDeviceAssociationNativeProfile(native.assetsRoot);
    const read = (checkpoint: RecordValue): Promise<NativeHistorySnapshot> => {
      if (typeof checkpoint["checkpoint"] !== "string" || typeof checkpoint["checkpointSha256"] !== "string") { throw new TypeError("PCB text recovery checkpoint is incomplete."); }
      return readNativeHistoryCheckpoint({ checkpointPath: checkpoint["checkpoint"], expectedSha256: checkpoint["checkpointSha256"],
        projectUuid: authority.projectUuid, documentRecordHistory: "preserve", ...(authority.legacy ? { pcbTextReloadOrder: "preserve" as const } : {}) });
    };
    const baseline = await read(journal.preCheckpoint);
    await this.engine.awaitProjectUploads(journal.context, journal, "pcb-text-retained-save-upload-barrier");
    const current = await this.snapshot(journal.context);
    const checkpoint = await this.engine.checkpoint({ source: journal.context.project.path,
      outputDir: join(controlDataDirectory(), "checkpoints"), label: "typed-pcb-text-retained-save" });
    if (!("receiptPath" in checkpoint) || typeof checkpoint.receiptPath !== "string") { throw new Error("PCB text recovery checkpoint receipt is missing."); }
    const proof = verifyPcbTextRetainedSaveEffect(authority, { before: baseline, after: await read(checkpoint),
      current: current.snapshot, currentPayload: current.payload });
    await verifyNativeRuleReportProfile(native.assetsRoot, "pcb-drc");
    await verifyDeviceAssociationNativeProfile(native.assetsRoot);
    await this.assertRuntime(journal.plan, journal.context, journal.runtimeFingerprint);
    const final = await this.snapshot(journal.context);
    if (canonicalJson(final) !== canonicalJson(current)) { throw new Error("PCB text changed during retained Save proof."); }
    const checkpointVerification = await this.engine.checkpoint({ receiptPath: checkpoint.receiptPath });
    if (checkpointVerification.ok !== true || checkpointVerification.sourceChanged !== false ||
        checkpointVerification.checkpointMatchesReceipt !== true || checkpointVerification.sourceMatchesReceipt !== true ||
        checkpointVerification.sourceEqualsCheckpoint !== true || checkpointVerification.checkpointSha256 !== checkpoint.checkpointSha256 ||
        checkpointVerification.sourceSha256 !== checkpoint.sourceSha256 || checkpointVerification.checkpoint !== checkpoint.checkpoint ||
        checkpointVerification.receiptPath !== checkpoint.receiptPath || checkpointVerification.source !== journal.context.project.path) {
      throw new Error("PCB text durable source changed during retained Save verification.");
    }
    await this.engine.assertContext(journal.context);
    await DesignExecutor.artifact(journal, "pcb-text-retained-save-reconciled", { ...final, checkpoint, checkpointVerification, proof,
      originalPhaseArtifacts: descriptors, retainedSaveAcknowledgment: save, retainedPreparation: prepared,
      originalIntendedSourceSha256: journal.after?.sha256, saveDispatchedByRecovery: false, navigationDispatchedByRecovery: false,
      creationProgramRegenerated: false, sourceNormalized: false });
    journal.saved = true; journal.reopened = true; journal.state = "completed"; journal.mutationState = "after"; journal.hardStop = false;
    journal.nextSafeAction = authority.legacy ?
      "The original Save/reopen and durable null STRING are verified with one exact native cached-decoder black export. No source was normalized or action repeated; further writes still require their own strict baseline." :
      "The original Save/reopen, exact created text and complete durable project are verified. No Save, navigation or design action was repeated.";
    await updateOperation(journal);
    return summary(journal);
  }

  /** Reuse the one retained successful wire lifecycle. This path performs
   * reads, upload barriers and checkpoints only, never Save or navigation.
   */
  private async reconcileSavedWire(journal: DesignJournal, current: Awaited<ReturnType<DesignExecutor["snapshot"]>>,
    beforeState: DesignActionState): Promise<RecordValue> {
    const savedDescriptor = selectDesignPhaseDescriptor(journal.artifacts, "save-reopen");
    const savedIndex = savedDescriptor === undefined ? -1 : journal.artifacts.indexOf(savedDescriptor);
    const priorArtifacts = journal.artifacts.slice(0, savedIndex);
    const phases = ["after", "reconciled"] as const;
    const candidate = phases.flatMap((phase) => {
      const descriptor = selectDesignPhaseDescriptor(priorArtifacts, phase, true);
      return descriptor === undefined ? [] : [{ phase, descriptor, index: priorArtifacts.indexOf(descriptor) }];
    }).toSorted((left, right) => right.index - left.index)[0];
    if (savedDescriptor === undefined || savedIndex < 1 || candidate === undefined || journal.plan.operation.action !== "sch.wire.modify" ||
        journal.after === undefined || journal.afterNative === undefined || journal.beforeNative === undefined ||
        current.native === undefined || beforeState.history === undefined || journal.beforeTopology === undefined || journal.plan.expectedTopology === undefined) {
      throw new Error("Retained wire Save lacks complete original, native, topology or preceding after evidence.");
    }
    const afterPhase = await DesignExecutor.phase({ ...journal, artifacts: priorArtifacts }, candidate.phase, true);
    const savedAck = await DesignExecutor.phase(journal, "save-reopen");
    verifyWireRetainedSaveAuthority(journal, afterPhase, savedAck);
    if (journal.plan.flatWire !== undefined) { verifyFlatDisplayRetainedSaveAuthority(journal, await DesignExecutor.phase(journal, "flat-save-prepared"), savedAck); }
    const ids = journal.targetId === undefined ? {} : { targetId: journal.targetId };
    const compiled = compileDesignAction(journal.plan.operation);
    const savedEffect = await verifyDesignActionCooperatively(compiled, beforeState, state(journal.after, journal.afterNative), ids);
    const currentState = state(current.snapshot, current.native);
    const lifecycle = await verifyDesignActionCooperatively(compiled, beforeState, currentState, ids);
    const { topology, flatEvidence } = await this.transactionTopology(journal, current, "after", true);
    verifyDesignTopology(journal.beforeTopology, topology);
    verifyDesignTopology(journal.plan.expectedTopology, topology);
    const flatLifecycleObservation = await DesignExecutor.retainFlatLifecycleObservation(journal, current, "retained-save", "after", flatEvidence);
    await this.engine.awaitProjectUploads(journal.context, journal, "wire-saved-reconcile-upload-barrier");
    const checkpoint = await this.engine.checkpoint({ source: journal.context.project.path,
      outputDir: join(controlDataDirectory(), "checkpoints"), label: "typed-wire-retained-save-reconciled" });
    if (!("receiptPath" in checkpoint)) { throw new Error("Retained wire reconciliation checkpoint receipt missing."); }
    const savedHistory = await journalDurableSnapshot(journal, checkpoint);
    const persistence = verifySchematicWirePersistence(journal.plan.operation, { before: beforeState.history,
      after: savedHistory, expectedBefore: journal.before, expectedAfter: current.snapshot,
      beforeNative: journal.beforeNative, afterNative: current.native });
    const flatMaterialization = journal.plan.flatWire === undefined ? undefined :
      await verifyFlatDisplayMaterialization({ history: savedHistory, source: current.snapshot, native: current.native });
    const final = await this.snapshot(journal.context);
    if (!sameState(currentState, state(final.snapshot, final.native))) { throw new Error("Wire changed during retained Save verification."); }
    await DesignExecutor.artifact(journal, "wire-retained-save-reconciled", { ...final, checkpoint,
      persistence: flatPersistenceProof(journal, persistence), savedEffect: flatEffectProof(journal, savedEffect), lifecycle: flatEffectProof(journal, lifecycle), topology,
      ...(flatLifecycleObservation === undefined ? {} : { flatLifecycleObservation }),
      ...(flatMaterialization === undefined ? {} : { flatMaterialization }),
      retainedSaveAcknowledgment: savedAck, retainedSaveArtifact: savedDescriptor, retainedAfterArtifact: candidate.descriptor,
      saveDispatchedByRecovery: false, navigationDispatchedByRecovery: false });
    journal.saved = true; journal.reopened = true; journal.state = "completed"; journal.mutationState = "after"; journal.hardStop = false;
    journal.nextSafeAction = "The retained wire Save/reopen, exact original circuit and complete durable project are verified. No Save, navigation or design action was repeated.";
    await updateOperation(journal);
    return summary(journal);
  }

  public async commit(operationId: string): Promise<RecordValue> {
    const journal = journalPayload(await loadOperation(operationId));
    if (hasDesignInverseAttempt(journal)) { throw new Error("An inverse was already attempted; inspect its retained recovery evidence without Save."); }
    assertTransactionTopologyAvailable(journal.plan, journal.context);
    const saveEvidence = await inspectDesignSaveAttempts(journal);
    const resumeSaved = DesignExecutor.hasLibrarySaveEvidence(journal);
    if (saveEvidence.attempted && !(resumeSaved && journal.state === "saved-awaiting-reopen")) { throw new Error("A design Save was already attempted; reconcile its retained evidence without repeating Save."); }
    if (!["applied-unsaved", "saved-awaiting-reopen"].includes(journal.state) || journal.after === undefined || journal.orphanedCallPossible) { throw new Error("Transaction is not ready to commit."); }
    if (resumeSaved && journal.state !== "saved-awaiting-reopen") { throw new Error("A library Save was already attempted. Reconcile its retained evidence before continuing; do not repeat Save."); }
    if (journal.state === "saved-awaiting-reopen" && !resumeSaved) { throw new Error("Saved library recovery has no retained Save evidence."); }
    await DesignExecutor.verifyWireGroupRepairIntent(journal);
    await this.assertRuntime(journal.plan, journal.context, journal.runtimeFingerprint);
    await this.assertNavigationPreferences(journal.context);
    // Resolve retained constructor provenance before any Save dispatch. It is
    // Internal evidence never grants a caller-provided exception to source equality.
    const constructorWitness = await DesignExecutor.layoutConstructorWitness(journal);
    const beforeSave = await this.snapshot(journal.context);
    if (!sameState(state(beforeSave.snapshot, beforeSave.native), state(journal.after, journal.afterNative))) { throw new Error("Design changed since apply; save refused."); }
    if (journal.layoutWireGroupRepair !== undefined || constructorWitness !== undefined) { await DesignExecutor.layoutLifecycle(journal, state(beforeSave.snapshot, beforeSave.native), constructorWitness); }
    const consistency = beforeSave.payload["read_consistency"];
    if (!isRecord(consistency) || typeof consistency["snapshotSha256"] !== "string") { throw new Error("Exact commit guard hash unavailable."); }
    try {
      let result: unknown;
      if (resumeSaved) { result = await this.resumeSavedLibraryReopen(journal, beforeSave); }
      else if ([2, 4].includes(journal.context.document.documentType)) { result = await this.saveLibraryAndReopen(journal); }
      else {
        let flatGuard: FlatDisplayRuntimeGuard | undefined;
        let durable: RecordValue | undefined;
        let flatVerification: ArtifactDescriptor | undefined;
        if (flatTransactionBinding(journal.plan) !== undefined) {
          await this.engine.awaitProjectUploads(journal.context, journal, "flat-presave-upload-barrier");
          const evidence = await this.flatEvidence(journal, beforeSave, "after");
          durable = await DesignExecutor.flatDurability(journal, beforeSave, evidence, true);
          flatVerification = await DesignExecutor.retainFlatVerification(journal, "save", evidence, durable);
          flatGuard = DesignExecutor.flatRuntimeGuard(journal, evidence, "after");
        }
        const code = buildSaveReopenCode(journal.context, [{ request: sourceRequest(journal.context), expectedSnapshotSha256: consistency["snapshotSha256"] }], flatGuard);
        if (flatGuard !== undefined) {
          await DesignExecutor.artifact(journal, "flat-save-prepared", { codeSha256: sha256Text(code), flatBindingSha256: sha256Text(canonicalJson(flatGuard.binding)),
            observationSha256: sha256Text(canonicalJson(flatGuard.observation)), durable, flatVerification });
        }
        result = await this.call(journal, "save-reopen", code, true);
        if (flatGuard !== undefined) { verifyFlatDisplayRetainedSaveAuthority(journal, await DesignExecutor.phase(journal, "flat-save-prepared"), result); }
      }
      const context = await this.engine.rebindAfterLifecycle(structuredClone(journal.context), result, "Typed design commit");
      journal.context = context;
      assertTransactionTopologyAvailable(journal.plan, context);
      const reopened = await this.snapshot(context);
      let lifecycle: RecordValue | undefined;
      if (journal.plan.operation.action === "sch.layout.batch") { lifecycle = await DesignExecutor.layoutLifecycle(journal, state(reopened.snapshot, reopened.native), constructorWitness); }
      else if (journal.plan.operation.action === "sch.wire.modify") {
        lifecycle = { ...await verifyDesignActionCooperatively(compileDesignAction(journal.plan.operation),
          state(journal.before, journal.beforeNative), state(reopened.snapshot, reopened.native),
          journal.targetId === undefined ? {} : { targetId: journal.targetId }) };
      }
      else if (journal.plan.operation.action === "pcb.pour.rebuild") { lifecycle = verifyCopperLifecycleEquivalence(journal.after, reopened.snapshot); }
      else { lifecycle = lifecycleEquivalent(state(journal.after, journal.afterNative), state(reopened.snapshot, reopened.native)); }
      if (lifecycle === undefined) { throw new Error("Saved/reopened document does not match the verified edit."); }
      let flatLifecycleObservation: ArtifactDescriptor | undefined;
      if (journal.plan.expectedTopology !== undefined) {
        const { topology, flatEvidence } = await this.transactionTopology(journal, reopened, "after", true);
        verifyDesignTopology(journal.plan.expectedTopology, topology);
        flatLifecycleObservation = await DesignExecutor.retainFlatLifecycleObservation(journal, reopened, "commit", "after", flatEvidence);
      }
      await this.engine.awaitProjectUploads(context, journal, "commit-upload-barrier");
      const checkpoint = await this.engine.checkpoint({ source: context.project.path, outputDir: join(controlDataDirectory(), "checkpoints"), label: "typed-design-committed" });
      if (!("receiptPath" in checkpoint)) { throw new Error("Committed checkpoint receipt missing."); }
      const persistenceInput = { before: await journalDurableSnapshot(journal, journal.preCheckpoint, context), after: await journalDurableSnapshot(journal, checkpoint, context),
        expectedBefore: journal.before, expectedAfter: journal.plan.operation.action === "pcb.pour.rebuild" ? journal.after : reopened.snapshot,
        ...(journal.beforeNative === undefined || reopened.native === undefined ? {} : { beforeNative: journal.beforeNative, afterNative: reopened.native }) };
      let persistence: ReturnType<typeof verifyDesignPersistence>;
      const flatMaterialization = flatTransactionBinding(journal.plan) === undefined ? undefined :
        await verifyFlatDisplayMaterialization({ history: persistenceInput.after, source: reopened.snapshot, native: reopened.native });
      if (journal.plan.operation.action === "sch.layout.batch") {
        if (journal.createdIds === undefined) { throw new Error("Layout persistence lacks journal-owned identities."); }
        persistence = await verifySchematicLayoutPersistenceCooperatively(journal.plan.operation, persistenceInput, journal.createdIds,
          { history: persistenceInput.before, templates: journal.layoutTemplates ?? {}, ...(journal.layoutWireGroupRepair === undefined ? {} : { wireGroupRepair: journal.layoutWireGroupRepair }), ...(constructorWitness === undefined ? {} : { constructorWitness }) });
      }
      else if (journal.plan.operation.action === "sch.wire.modify") { persistence = verifySchematicWirePersistence(journal.plan.operation, persistenceInput); }
      else if (journal.plan.operation.action === "pcb.pour.clear-derived") { persistence = verifyCopperClearPersistence(persistenceInput, journal.plan.operation); }
      else if (journal.plan.operation.action === "pcb.stack.replace") { persistence = verifyStackPersistence(persistenceInput, journal.plan.operation); }
      else if (isDesignRuleAction(journal.plan.operation.action) || (journal.plan.operation.action === "pcb.batch" && journal.plan.operation.operations.some((operation) => isDesignRuleAction(operation.action)))) { persistence = verifyRulePersistence(persistenceInput, journal.plan.operation, journal.createdIds); }
      else if ([2, 4].includes(context.document.documentType)) { persistence = await DesignExecutor.libraryPersistence(journal, persistenceInput); }
      else { persistence = verifyDesignPersistence(persistenceInput); }
      await DesignExecutor.artifact(journal, "reopened", { ...reopened, checkpoint,
        persistence: flatPersistenceProof(journal, persistence), lifecycle: flatEffectProof(journal, lifecycle),
        ...(flatLifecycleObservation === undefined ? {} : { flatLifecycleObservation }),
        ...(flatMaterialization === undefined ? {} : { flatMaterialization }) });
      journal.saved = true; journal.reopened = true; journal.state = "completed"; journal.hardStop = false;
      journal.nextSafeAction = "Saved and reopened document verified. Retain the checkpoint and journal.";
      await updateOperation(journal);
      return summary(journal);
    } catch (error) {
      journal.state = "commit-needs-recovery"; journal.hardStop = true;
      journal.nextSafeAction = "Inspect recovery evidence; never repeat an ambiguous save or close.";
      await updateOperation(journal); throw transactionError(error, journal);
    }
  }

  private static hasLibrarySaveEvidence(journal: DesignJournal): boolean {
    return [2, 4].includes(journal.context.document.documentType) && (journal.saved ||
      journal.artifacts.some((entry) => /-(?:(?:symbol|footprint)-(?:save|durable-before-close)|library-save-intent)\.json$/u.test(entry.path)));
  }

  private async verifySavedLibrary(journal: DesignJournal, current: Awaited<ReturnType<DesignExecutor["snapshot"]>>): Promise<{
    readonly lifecycle: LibraryLifecycle; readonly navigation: ReturnType<typeof selectSavedLibraryReopen>; readonly evidence: RecordValue;
  }> {
    const documentType = journal.context.document.documentType;
    const documentUuid = journal.context.document.uuid;
    const tabId = journal.context.document.tabId;
    if (journal.after === undefined || (documentType !== 2 && documentType !== 4) || typeof documentUuid !== "string" || typeof tabId !== "string") { throw new Error("Saved library recovery requires the retained intended source and exact target context."); }
    const installed = await this.engine.upstream.installedEasyedaBundles?.();
    if (installed === undefined) { throw new Error("Native library implementation identity is unavailable."); }
    await verifyLibraryNativeProfile(installed.assetsRoot);
    const baseline = await durableSnapshot(journal.preCheckpoint, journal.context);
    const lifecycle = documentType === 2 ? symbolLifecycle(journal.after, baseline) : footprintLifecycle(journal.after, baseline, journal.context);
    const save = await DesignExecutor.phase(journal, `${lifecycle.family}-save`);
    const durable = await DesignExecutor.phase(journal, `${lifecycle.family}-durable-before-close`);
    const retained = verifySavedLibraryArtifacts({ family: lifecycle.family, expected: journal.after, current: current.snapshot, scope: lifecycle.scope, save, durable });
    const ids = { ...(journal.targetId === undefined ? {} : { targetId: journal.targetId }), ...(journal.createdId === undefined ? {} : { createdId: journal.createdId }) };
    const beforeState = state(journal.before, undefined, baseline, journal.context);
    const prepared = await prepareDesignActionCooperatively(journal.plan.operation, beforeState, ids);
    const compiled = prepared.compiled;
    const effect = await verifyDesignActionCooperatively(compiled, beforeState, state(journal.after), ids);
    const retainedHistory = await durableSnapshot(retained.checkpoint, journal.context);
    const persistenceInput = { before: baseline, expectedBefore: journal.before, expectedAfter: journal.after };
    const retainedPersistence = await DesignExecutor.libraryPersistence(journal, { ...persistenceInput, after: retainedHistory });
    await this.engine.awaitProjectUploads(journal.context, journal, "saved-library-recovery-upload-barrier");
    const checkpoint = await this.engine.checkpoint({ source: journal.context.project.path, outputDir: join(controlDataDirectory(), "checkpoints"), label: "typed-library-saved-recovery" });
    if (!("receiptPath" in checkpoint)) { throw new Error("Saved library recovery checkpoint receipt missing."); }
    const history = await durableSnapshot(checkpoint, journal.context);
    const persistence = await DesignExecutor.libraryPersistence(journal, { ...persistenceInput, after: history });
    if (history.projectUuid !== retainedHistory.projectUuid || history.projectOwnerUuid !== retainedHistory.projectOwnerUuid || history.branchUuid !== retainedHistory.branchUuid) { throw new Error("Saved library checkpoint project/owner/branch changed."); }
    const final = await this.snapshot(journal.context);
    if (!sameState(state(current.snapshot), state(final.snapshot))) { throw new Error("Saved library source changed during recovery verification."); }
    const intent = await DesignExecutor.phase(journal, "library-reopen-recovery-intent", true);
    const noDispatch = await DesignExecutor.phase(journal, "library-reopen-recovery-not-dispatched", true);
    const outstandingDispatch = intent !== undefined && (!isRecord(noDispatch) || noDispatch["dispatched"] !== false || noDispatch["intentSha256"] !== sha256Text(canonicalJson(intent)));
    const navigation = selectSavedLibraryReopen({ documentUuid, documentType, tabId,
      receipts: [await DesignExecutor.phase(journal, `${lifecycle.family}-reopen`), await DesignExecutor.phase(journal, `${lifecycle.family}-reopen-recovery`)], outstandingDispatch });
    await verifyLibraryNativeProfile(installed.assetsRoot);
    return { lifecycle, navigation, evidence: { schema: "easyeda-pro-control.saved-library-recovery.v1", saveRepeated: false,
      sourceSha256: journal.after.sha256, retainedCheckpoint: retained.checkpoint, checkpoint, effect, retainedPersistence, persistence, navigation: navigation.action } };
  }

  private async resumeSavedLibraryReopen(journal: DesignJournal, current: Awaited<ReturnType<DesignExecutor["snapshot"]>>): Promise<unknown> {
    const retained = await this.verifySavedLibrary(journal, current);
    await DesignExecutor.artifact(journal, "saved-library-reopen-preflight", retained.evidence);
    if (retained.navigation.action === "reuse-reopen") { return retained.navigation.receipt; }
    return this.call(journal, `${retained.lifecycle.family}-reopen-recovery`, retained.lifecycle.reopenCode, true);
  }

  private async saveLibraryAndReopen(journal: DesignJournal): Promise<unknown> {
    if (DesignExecutor.hasLibrarySaveEvidence(journal)) { throw new Error("A library Save was already attempted. Reconcile instead of repeating it."); }
    if (journal.after === undefined || ![2, 4].includes(journal.context.document.documentType)) { throw new Error("Library commit requires the verified intended source."); }
    const installed = await this.engine.upstream.installedEasyedaBundles?.();
    if (installed === undefined) { throw new Error("Native library implementation identity is unavailable."); }
    await verifyLibraryNativeProfile(installed.assetsRoot);
    const baseline = await durableSnapshot(journal.preCheckpoint, journal.context);
    const lifecycle = journal.context.document.documentType === 2 ? symbolLifecycle(journal.after, baseline) : footprintLifecycle(journal.after, baseline, journal.context);
    const requested = await this.call(journal, `${lifecycle.family}-save`, lifecycle.saveCode);
    if (!isRecord(requested) || requested["ok"] !== true || requested["kind"] !== `${lifecycle.family}-save-requested`) { throw new Error("Library source-save acknowledgment missing."); }
    await this.engine.awaitProjectUploads(journal.context, journal, `${lifecycle.family}-save-upload-barrier`);
    const saved = await this.snapshot(journal.context);
    if (!sameState(state(saved.snapshot), state(journal.after))) { throw new Error("Library source changed during save; close refused."); }
    const checkpoint = await this.engine.checkpoint({ source: journal.context.project.path, outputDir: join(controlDataDirectory(), "checkpoints"), label: `typed-${lifecycle.family}-saved-before-close` });
    if (!("receiptPath" in checkpoint)) { throw new Error("Library saved checkpoint receipt missing; close refused."); }
    const persistenceInput = { before: baseline, after: await durableSnapshot(checkpoint, journal.context), expectedBefore: journal.before, expectedAfter: saved.snapshot };
    const persistence = await DesignExecutor.libraryPersistence(journal, persistenceInput);
    // A compiler save acknowledgment does not prove the intended saved records.
    // Complete durable proof must succeed before its editor is closed.
    journal.saved = true;
    await DesignExecutor.artifact(journal, `${lifecycle.family}-durable-before-close`, { ...saved, checkpoint, persistence, scope: lifecycle.scope });
    await verifyLibraryNativeProfile(installed.assetsRoot);
    return this.call(journal, `${lifecycle.family}-reopen`, lifecycle.reopenCode, true);
  }

  public async rollback(operationId: string): Promise<RecordValue> {
    const journal = journalPayload(await loadOperation(operationId));
    assertTransactionTopologyAvailable(journal.plan, journal.context);
    const saveEvidence = await inspectDesignSaveAttempts(journal);
    if (saveEvidence.attempted) { throw new Error("A design Save was already attempted; an unsaved inverse is not authorized."); }
    if (hasDesignInverseAttempt(journal)) { throw new Error("A design inverse was already attempted; reconcile retained evidence without repeating the inverse or Save."); }
    if (journal.state !== "applied-unsaved" || journal.inverse === undefined || journal.after === undefined || journal.orphanedCallPossible || journal.hardStop) { throw new Error("Transaction has no safely dispatchable inverse."); }
    await this.assertRuntime(journal.plan, journal.context, journal.runtimeFingerprint);
    const current = await this.snapshot(journal.context);
    if (!sameState(state(current.snapshot, current.native), state(journal.after, journal.afterNative))) { throw new Error("Design changed since apply; inverse refused."); }
    let flatGuard: FlatDisplayRuntimeGuard | undefined;
    let flatVerification: ArtifactDescriptor | undefined;
    if (flatTransactionBinding(journal.plan) !== undefined) {
      const evidence = await this.flatEvidence(journal, current, "after");
      const durable = await DesignExecutor.flatDurability(journal, current, evidence, true);
      flatVerification = await DesignExecutor.retainFlatVerification(journal, "inverse", evidence, durable);
      if (durable["classification"] !== "unchanged-baseline") {
        journal.nextSafeAction = appliedNextSafeAction(journal);
        await updateOperation(journal);
        throw new Error("The flat forward effect already persisted; an unsaved inverse cannot restore its durable baseline. No inverse or Save was dispatched.");
      }
      flatGuard = DesignExecutor.flatRuntimeGuard(journal, evidence, "after");
      assertFlatTransactionInverse(flatTransactionBinding(journal.plan), journal.inverse);
    }
    const inverseTarget = "target" in journal.inverse && "primitiveId" in journal.inverse.target ? journal.inverse.target.primitiveId : undefined;
    const prepared = await prepareDesignActionCooperatively(journal.inverse, state(current.snapshot, current.native, await journalDurableSnapshot(journal), journal.context), inverseTarget === undefined ? {} : { targetId: inverseTarget }, flatGuard);
    try {
      journal.inverseAttempted = true;
      await DesignExecutor.artifact(journal, "design-inverse-intent", { operationId: journal.operationId, originalPlanHash: journal.planHash,
        sourceSha256: current.snapshot.sha256, inverseSha256: sha256Text(canonicalJson(journal.inverse)), codeSha256: sha256Text(prepared.code) });
      if (flatGuard !== undefined) { await DesignExecutor.artifact(journal, "flat-inverse-prepared", { codeSha256: sha256Text(prepared.code), flatBindingSha256: sha256Text(canonicalJson(flatGuard.binding)), flatVerification }); }
      const result = await this.call(journal, "inverse", prepared.code);
      if (!isRecord(result) || result["ok"] !== true) { throw new Error("Inverse acknowledgment missing."); }
      await this.engine.awaitProjectUploads(journal.context, journal, "inverse-upload-barrier");
      const restored = await this.snapshot(journal.context);
      const lifecycle = lifecycleEquivalent(state(journal.before, journal.beforeNative), state(restored.snapshot, restored.native));
      if (lifecycle === undefined) { throw new Error("Inverse did not restore every native document record."); }
      let flatLifecycleObservation: ArtifactDescriptor | undefined;
      if (journal.beforeTopology !== undefined) {
        const { topology, flatEvidence } = await this.transactionTopology(journal, restored, "before", true);
        verifyDesignTopology(journal.beforeTopology, topology);
        flatLifecycleObservation = await DesignExecutor.retainFlatLifecycleObservation(journal, restored, "inverse", "before", flatEvidence);
      }
      const checkpoint = await this.engine.checkpoint({ source: journal.context.project.path, outputDir: join(controlDataDirectory(), "checkpoints"), label: "typed-design-rolled-back" });
      if (!("receiptPath" in checkpoint)) { throw new Error("Rollback checkpoint receipt missing; durable restoration is unverified."); }
      const persistenceInput = { before: await journalDurableSnapshot(journal), after: await journalDurableSnapshot(journal, checkpoint),
        expectedBefore: journal.before, expectedAfter: restored.snapshot,
        ...(journal.beforeNative === undefined || restored.native === undefined ? {} : { beforeNative: journal.beforeNative, afterNative: restored.native }) };
      let persistence: RecordValue;
      if (flatTransactionBinding(journal.plan) === undefined) { persistence = journal.context.document.documentType === 4 ? verifyFootprintEmptyNetPersistence(persistenceInput) : verifyDesignPersistence(persistenceInput); }
      else { persistence = await verifyFlatDisplayRestoration(persistenceInput); }
      const final = await this.snapshot(journal.context);
      if (!sameState(state(final.snapshot, final.native), state(restored.snapshot, restored.native))) { throw new Error("Restored source changed during durable rollback verification."); }
      journal.state = "rolled-back"; journal.mutationState = "before"; journal.hardStop = false;
      journal.mutationMayHaveOccurred = false;
      journal.nextSafeAction = "Live source and complete durable project restoration are verified; no save was issued. Retain the exact checkpoint and any explicitly reported native bookkeeping.";
      await DesignExecutor.artifact(journal, "inverse-verified", { ...restored, lifecycle, checkpoint, persistence,
        ...(flatLifecycleObservation === undefined ? {} : { flatLifecycleObservation }) });
      return summary(journal);
    } catch (error) {
      journal.state = "inverse-needs-recovery"; journal.hardStop = true;
      journal.nextSafeAction = "Inspect recovery evidence; do not retry the inverse.";
      await updateOperation(journal); throw transactionError(error, journal);
    }
  }
}
