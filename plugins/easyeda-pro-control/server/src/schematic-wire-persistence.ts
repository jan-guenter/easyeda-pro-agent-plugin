import { basename } from "node:path";
import { canonicalJson, isRecord, sha256Json } from "./core.ts";
import type { ArtifactDescriptor } from "./artifacts.ts";
import { deriveDesignBaselineTargets } from "./design-persistence.ts";
import { verifyDesignTopology } from "./design-topology.ts";
import type { DesignTopology } from "./design-topology.ts";
import type { ExpectedContext } from "./engine.ts";
import { parseDocumentSource } from "./document-source.ts";
import type { NativeSourceSnapshot } from "./document-source.ts";
import type { SchematicNativeSnapshot } from "./schematic-native-adapter.ts";
import { buildSchematicNativeWireAdapter, verifySchematicNativeWireEffect } from "./schematic-native-wire.ts";
import { verifySchematicStorageBaseline, verifySchematicStoragePersistence } from "./schematic-storage-persistence.ts";

type RecordValue = Record<string, unknown>;
const same = (a: unknown, b: unknown): boolean => canonicalJson({ value: a }) === canonicalJson({ value: b });

/** Derive every baseline field from the maintained typed wire projection. Raw
 * stored child order can differ from the model; the shared storage proof owns
 * that encoding, not the generic baseline verifier or caller-selected targets.
 */
export function verifySchematicWireBaseline(operation: unknown, input: Parameters<typeof verifySchematicStorageBaseline>[0]): RecordValue {
  const adapter = buildSchematicNativeWireAdapter(operation, input.source, input.native);
  const targets = deriveDesignBaselineTargets(input.source, adapter.expected);
  if (!same(targets, input.targets)) { throw new Error("Wire baseline targets differ from the complete typed effect."); }
  return { ...verifySchematicStorageBaseline(input), wireProfile: adapter.profile, expectedSourceSha256: adapter.expected.sha256 };
}

/** Exact typed source/native proof must precede the unchanged full-project
 * storage encoding verifier. Neither raw inputs nor generic guards are changed.
 */
export function verifySchematicWirePersistence(operation: unknown, input: Parameters<typeof verifySchematicStoragePersistence>[0]): RecordValue {
  const wireEffect = verifySchematicNativeWireEffect(operation, input.expectedBefore, input.expectedAfter, input.beforeNative, input.afterNative);
  return { ...verifySchematicStoragePersistence(input), wireEffect };
}

interface WireSaveState {
  readonly plan: { readonly operation: unknown };
  readonly state: string;
  readonly saved: boolean;
  readonly reopened: boolean;
  readonly artifacts: readonly ArtifactDescriptor[];
  readonly orphanedCallPhase?: string | undefined;
  readonly wireSaveAttempted?: unknown;
}

/** Evidence of an attempt is a prohibition on another Save, not success proof.
 * The explicit marker survives later rebind/open/read phase transitions. Old
 * journals can establish it from their retained lifecycle phase or state.
 */
export function hasSchematicWireSaveEvidence(journal: WireSaveState): boolean {
  if (!isRecord(journal.plan.operation) || journal.plan.operation["action"] !== "sch.wire.modify") { return false; }
  if (journal.wireSaveAttempted !== undefined && journal.wireSaveAttempted !== true) { throw new Error("Wire Save-attempt marker is malformed."); }
  return journal.wireSaveAttempted === true || journal.saved || journal.reopened ||
    ["save-reopen-dispatching", "commit-needs-recovery"].includes(journal.state) ||
    ["save-reopen", "commit-upload-barrier"].includes(journal.orphanedCallPhase ?? "") ||
    journal.artifacts.some((entry) => /^[0-9]+-(?:wire-save-intent|save-reopen|commit-upload-barrier|reopened)\.json$/u.test(basename(entry.path)));
}

interface WireSavedAuthority {
  readonly plan: { readonly operation: unknown; readonly expectedTopology?: DesignTopology | undefined };
  readonly context: ExpectedContext;
  readonly after?: NativeSourceSnapshot | undefined;
  readonly afterNative?: SchematicNativeSnapshot | undefined;
  readonly beforeTopology?: DesignTopology | undefined;
  readonly orphanedCallPossible: boolean;
}

/** Wire-only counterpart of the reviewed layout lifecycle receipt assertions.
 * The coordinator hash-verifies artifacts, proves both effects and current
 * topology, and decodes every durable document separately. A receipt alone
 * cannot complete this journal and never authorizes Save or navigation.
 */
export function verifyWireRetainedSaveAuthority(journal: WireSavedAuthority, afterPhase: unknown, acknowledgment: unknown): void {
  const expected = journal.after, projectUuid = journal.context.project.uuid ?? journal.context.project.projectUuid;
  if (!isRecord(journal.plan.operation) || journal.plan.operation["action"] !== "sch.wire.modify" ||
      journal.context.document.documentType !== 1 || journal.orphanedCallPossible || expected === undefined ||
      journal.afterNative === undefined || journal.beforeTopology === undefined || journal.plan.expectedTopology === undefined || typeof projectUuid !== "string") {
    throw new Error("Retained wire Save requires settled authority and complete original evidence.");
  }
  verifyDesignTopology(journal.beforeTopology, journal.plan.expectedTopology);
  if (expected.sha256 !== sha256Json({ schema: expected.schema, document: expected.document, objects: expected.objects }) ||
      parseDocumentSource(journal.afterNative.source).sha256 !== expected.sha256 ||
      journal.afterNative.document.documentUuid !== expected.document["uuid"] ||
      !isRecord(afterPhase) || !same(afterPhase["snapshot"], expected) || !same(afterPhase["native"], journal.afterNative) ||
      !isRecord(afterPhase["payload"]) || typeof afterPhase["payload"]["source"] !== "string" ||
      parseDocumentSource(afterPhase["payload"]["source"]).sha256 !== expected.sha256 || !isRecord(afterPhase["payload"]["read_consistency"])) {
    throw new Error("Retained wire Save is not bound to the exact verified source and native state.");
  }
  const consistency = afterPhase["payload"]["read_consistency"];
  if (consistency["stable"] !== true || consistency["attempts"] !== 2 || typeof consistency["snapshotSha256"] !== "string" ||
      !/^[a-f0-9]{64}$/u.test(consistency["snapshotSha256"])) { throw new Error("Retained wire source lacks its exact double-read commitment."); }
  if (!isRecord(acknowledgment) || acknowledgment["ok"] !== true || acknowledgment["saved"] !== true ||
      acknowledgment["closed"] !== true || acknowledgment["reopened"] !== true || !isRecord(acknowledgment["document"]) ||
      acknowledgment["document"]["uuid"] !== expected.document["uuid"] || acknowledgment["document"]["documentType"] !== 1 ||
      acknowledgment["document"]["tabId"] !== journal.context.document.tabId ||
      expected.document["uuid"] !== (journal.context.document.uuid ?? journal.context.document.documentUuid)) {
    throw new Error("Retained wire Save/reopen acknowledgment is missing or does not match the target; do not repeat Save.");
  }
  const barrier = acknowledgment["projectUploadBarrier"], close = acknowledgment["closeProof"], guard = acknowledgment["exactSaveGuard"], open = acknowledgment["openProof"];
  if (!isRecord(guard) || guard["passes"] !== 2 || guard["saveInvokedInSameExecution"] !== true || guard["publicCompareAndSwapAvailable"] !== false ||
      !same(guard["labels"], ["schematic-source"]) || !same(guard["snapshotSha256"], [consistency["snapshotSha256"]]) ||
      !isRecord(close) || close["profile"] !== "easyeda-pro-control.native-document-close.v1" || close["closeCalls"] !== 1 ||
      close["terminalNotification"] !== true || close["oldFrameRemoved"] !== true || close["oldTabRemoved"] !== true || close["saved"] !== false ||
      !isRecord(open) || open["profile"] !== "easyeda-pro-control.native-document-open.v1" || open["tabId"] !== journal.context.document.tabId ||
      open["newFrameReady"] !== true || open["exactContext"] !== true || open["readinessSamples"] !== 2 || typeof open["activated"] !== "boolean" ||
      !isRecord(barrier) || barrier["profile"] !== "easyeda-pro-control.project-upload-barrier.v1" || barrier["projectUuid"] !== projectUuid ||
      barrier["scheduledWritesSettled"] !== true || barrier["savedEditorChanges"] !== false) {
    throw new Error("Retained wire Save lacks its exact guard, terminal close, ready reopen or upload barrier.");
  }
}
