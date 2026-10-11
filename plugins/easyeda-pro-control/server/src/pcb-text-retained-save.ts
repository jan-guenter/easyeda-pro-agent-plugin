import { z } from "zod";
import { canonicalJson, isRecord, sha256Json, sha256Text } from "./core.ts";
import { compareDocumentSources, parseDocumentSource } from "./document-source.ts";
import type { NativeSourceSnapshot } from "./document-source.ts";
import type { ExpectedContext } from "./engine.ts";
import type { NativeDocumentSnapshot, NativeHistorySnapshot } from "./native-history.ts";
import { nativeDocumentRecordHistoryProjection, validateNativeDocumentRecordHistory } from "./native-document-record-history.ts";
import { verifyDesignBaseline, verifyDesignPersistence } from "./design-persistence.ts";
import { PCB_TEXT_LIFECYCLE_PROFILE, assertPcbTextLifecycleAcknowledgment, expectedPcbTextLifecycleSource, pcbTextLifecycleOperationSchema } from "./pcb-text-lifecycle.ts";
import { verifyLegacyPcbTextReloadOrder } from "./pcb-text-reload-history.ts";

const LEGACY_CREATE_PROFILE = "easyeda-pro-control.pcb-standalone-text-lifecycle.v1";
const hash = z.string().regex(/^[a-f0-9]{64}$/u);
const nativeId = z.string().regex(/^[a-f0-9]{16}$/u);
const preparation = z.object({ adapterProfile: z.enum([LEGACY_CREATE_PROFILE, PCB_TEXT_LIFECYCLE_PROFILE]),
  createdId: nativeId, createdIds: z.null(), componentCreate: z.null(), codeSha256: hash }).strict();
type Value = Record<string, unknown>;
export interface PcbTextSaveJournal {
  readonly operationId: string;
  readonly planHash: string;
  readonly plan: { readonly operation: unknown; readonly expectedContext: ExpectedContext };
  readonly context: ExpectedContext;
  readonly before: NativeSourceSnapshot;
  readonly after?: NativeSourceSnapshot;
  readonly createdId?: string;
  readonly targetId?: string;
  readonly createdIds?: unknown;
  readonly beforeNative?: unknown;
  readonly afterNative?: unknown;
}
export interface PcbTextSavePhases {
  readonly before: unknown;
  readonly prepared: unknown;
  readonly apply: unknown;
  readonly after: unknown;
  readonly intent: unknown;
  readonly save: unknown;
}
export interface PcbTextRetainedSaveAuthority {
  readonly profile: "easyeda-pro-control.pcb-text-retained-save.v1";
  readonly legacy: boolean;
  readonly createdId: string;
  readonly projectUuid: string;
  readonly documentUuid: string;
  readonly before: NativeSourceSnapshot;
  readonly intended: NativeSourceSnapshot;
  readonly beforeRawSource: string;
  readonly intendedRawSource: string;
  readonly beforePhase: unknown;
  readonly acknowledgment: unknown;
  readonly prepared: unknown;
}
function exact(actual: unknown, expected: unknown, message: string): void {
  if (canonicalJson(actual) !== canonicalJson(expected)) { throw new Error(message); }
}

/** Keep the original unsorted native source alongside its semantic snapshot.
 * The snapshot sorts IDs and cannot attest STRING decoder order.
 */
function sourcePhase(input: unknown, expected: NativeSourceSnapshot): { raw: string; payloadHash: string } {
  if (!isRecord(input) || !isRecord(input["payload"]) || input["native"] !== undefined) { throw new Error("Retained PCB text source phase is incomplete."); }
  const { read_consistency: consistency, ...payload } = input["payload"];
  const raw = payload["source"];
  if (payload["ok"] !== true || payload["kind"] !== "pcb-source" || payload["documentType"] !== 3 ||
      typeof raw !== "string" || Buffer.byteLength(raw) > 16_777_216 || payload["utf8Bytes"] !== Buffer.byteLength(raw)) {
    throw new Error("Retained PCB text native source is incomplete or unbounded.");
  }
  const payloadHash = sha256Json(payload);
  exact(consistency, { stable: true, attempts: 2, snapshotSha256: payloadHash,
    contextBinding: { level: "active-context-stability-required", preAndPostChecked: true, switchAwayAndBackDetectable: false } }, "Retained PCB text double-read commitment changed.");
  exact(parseDocumentSource(raw), expected, "Retained PCB text source does not match the journal snapshot.");
  exact(input["snapshot"], expected, "Retained PCB text phase snapshot changed.");
  return { raw, payloadHash };
}
function legacyExpected(expected: NativeSourceSnapshot, createdId: string): NativeSourceSnapshot {
  // This is the frozen v1 producer's expected body, not normalization of
  // An observed source, durable record or hash. No v1 writer is generated.
  const source = { schema: expected.schema, document: expected.document,
    objects: expected.objects.map((row) => row.id === createdId ? { ...row, body: { ...row.body, specialColor: null } } : row) };
  return { ...source, sha256: sha256Json(source) };
}
function assertContext(journal: PcbTextSaveJournal): { projectUuid: string; documentUuid: string; tabId: string } {
  const { context } = journal;
  const projectUuid = z.string().regex(/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/u).parse(context.project.uuid ?? context.project.projectUuid);
  const documentUuid = nativeId.parse(context.document.uuid ?? context.document.documentUuid), tabId = `${documentUuid}@${projectUuid}`;
  for (const value of [context, journal.plan.expectedContext]) {
    if ((value.project.uuid ?? value.project.projectUuid) !== projectUuid || (value.project.uuid !== undefined && value.project.projectUuid !== undefined && value.project.uuid !== value.project.projectUuid) ||
        (value.document.uuid ?? value.document.documentUuid) !== documentUuid || (value.document.uuid !== undefined && value.document.documentUuid !== undefined && value.document.uuid !== value.document.documentUuid) ||
        value.project.path !== context.project.path || value.document.documentType !== 3 || value.document.tabId !== tabId ||
        value.document["parentProjectUuid"] !== projectUuid || value.document["parentLibraryUuid"] !== undefined) {
      throw new Error("Retained PCB text Save context is not the original standalone PCB.");
    }
  }
  if (journal.before.document["uuid"] !== documentUuid || journal.after?.document["uuid"] !== documentUuid ||
      journal.targetId !== undefined || journal.createdIds !== undefined || journal.beforeNative !== undefined || journal.afterNative !== undefined) {
    throw new Error("Retained PCB text creation lacks exact standalone source and identity authority.");
  }
  return { projectUuid, documentUuid, tabId };
}

/** Read-only creation recovery authority. Caller separately checks the sealed
 * phase descriptors, their order, one consumed Save and no inverse attempt.
 */
export function verifyPcbTextRetainedSaveAuthority(journal: PcbTextSaveJournal, phases: PcbTextSavePhases): PcbTextRetainedSaveAuthority {
  const operation = pcbTextLifecycleOperationSchema.parse(journal.plan.operation), prepared = preparation.parse(phases.prepared);
  if (operation.action !== "pcb.text.create" || prepared.createdId !== journal.createdId || journal.after === undefined) {
    throw new Error("Retained PCB text recovery requires the original creation reservation.");
  }
  const context = assertContext(journal), legacy = prepared.adapterProfile === LEGACY_CREATE_PROFILE;
  assertPcbTextLifecycleAcknowledgment(operation, { createdId: prepared.createdId }, phases.apply);
  const expected = expectedPcbTextLifecycleSource(operation, journal.before, { createdId: prepared.createdId });
  exact(journal.after, legacy ? legacyExpected(expected, prepared.createdId) : expected, "Retained PCB text immediate effect differs from its original producer.");
  const before = sourcePhase(phases.before, journal.before);
  const after = sourcePhase(phases.after, journal.after);
  if (!isRecord(phases.after)) { throw new Error("Retained PCB text after phase is missing."); }
  exact(phases.after["proof"], compareDocumentSources(journal.before, journal.after), "Retained PCB text immediate proof changed.");
  if (!isRecord(phases.intent) || !Number.isSafeInteger(phases.intent["sequence"]) || Number(phases.intent["sequence"]) < 1) { throw new Error("Retained PCB text Save intent is missing."); }
  exact(phases.intent, { profile: "easyeda-pro-control.design-save-attempt.v1", operationId: journal.operationId, planHash: journal.planHash,
    sequence: phases.intent["sequence"], phase: "save-reopen", sourceSha256: journal.after.sha256,
    scope: { projectUuid: context.projectUuid, documentUuid: context.documentUuid, documentType: 3 } }, "Retained PCB text Save intent differs from the original edit.");
  const labels = z.tuple([z.literal("pcb-source")]), sourceHashes = z.tuple([z.literal(after.payloadHash)]);
  const acknowledgment = z.object({ ok: z.literal(true), saved: z.literal(true), closed: z.literal(true), reopened: z.literal(true),
    projectUploadBarrier: z.object({ profile: z.literal("easyeda-pro-control.project-upload-barrier.v1"), projectUuid: z.literal(context.projectUuid), scheduledWritesSettled: z.literal(true), savedEditorChanges: z.literal(false) }).strict(),
    closeProof: z.object({ profile: z.literal("easyeda-pro-control.native-document-close.v1"), closeCalls: z.literal(1), terminalNotification: z.literal(true), oldFrameRemoved: z.literal(true), oldTabRemoved: z.literal(true), saved: z.literal(false) }).strict(),
    openProof: z.object({ profile: z.literal("easyeda-pro-control.native-document-open.v1"), tabId: z.literal(context.tabId), newFrameReady: z.literal(true), exactContext: z.literal(true), readinessSamples: z.literal(2), activated: z.boolean() }).strict(),
    exactSaveGuard: z.object({ passes: z.literal(2), labels, snapshotSha256: sourceHashes, saveInvokedInSameExecution: z.literal(true), publicCompareAndSwapAvailable: z.literal(false) }).strict(),
    document: z.object({ uuid: z.literal(context.documentUuid), documentType: z.literal(3), title: z.string(), tabId: z.literal(context.tabId) }).strict(),
  }).strict().parse(phases.save);
  return { profile: "easyeda-pro-control.pcb-text-retained-save.v1", legacy, createdId: prepared.createdId,
    projectUuid: context.projectUuid, documentUuid: context.documentUuid, before: journal.before, intended: journal.after,
    beforeRawSource: before.raw, intendedRawSource: after.raw, beforePhase: phases.before, acknowledgment, prepared };
}

function rawStringIds(source: string): string[] {
  // The source parser already validated every record and duplicate identity.
  // Split that exact sealed native encoding, not a reserialized sorted list.
  return source.split("|\n").filter((line) => line !== "").flatMap((line) => {
    const header: unknown = JSON.parse(line.slice(0, line.indexOf("||")));
    if (!isRecord(header)) { throw new Error("Retained PCB text native header is invalid."); }
    return header["type"] === "STRING" ? [nativeId.parse(header["id"])] : [];
  });
}
function document(history: NativeHistorySnapshot, uuid: string): NativeDocumentSnapshot {
  const result = history.documents.find((value) => value.uuid === uuid);
  if (result === undefined) { throw new Error("Retained PCB text complete checkpoint membership is missing."); }
  validateNativeDocumentRecordHistory(result, history.checkpointSha256); return result;
}
function peerProjection(value: NativeDocumentSnapshot): unknown {
  const entries = Object.entries(value).filter(([key]) => !["documentRecordHistory", "headerHistory", "pcbTextReloadHistory"].includes(key));
  const rest = Object.fromEntries(entries);
  const { headerHistory } = value;
  return { ...rest, documentRecordHistory: nativeDocumentRecordHistoryProjection(value),
    ...(headerHistory === undefined ? {} : { headerHistory: { profile: headerHistory.profile, documentUuid: headerHistory.documentUuid, headers: headerHistory.headers } }) };
}

/** Full-source and complete durable checks. The legacy exception is kept
 * Separate from every generic lifecycle, source and persistence comparator.
 */
export function verifyPcbTextRetainedSaveEffect(authority: PcbTextRetainedSaveAuthority, input: {
  readonly before: NativeHistorySnapshot; readonly after: NativeHistorySnapshot;
  readonly current: NativeSourceSnapshot; readonly currentPayload: Value;
}): Value {
  const { before, after, current } = input;
  if (before.projectUuid !== authority.projectUuid || after.projectUuid !== before.projectUuid || after.projectOwnerUuid !== before.projectOwnerUuid || after.branchUuid !== before.branchUuid) {
    throw new Error("Retained PCB text checkpoint project, owner or branch changed.");
  }
  const oldTarget = document(before, authority.documentUuid);
  const newTarget = document(after, authority.documentUuid);
  if (before.documents.some((value) => value.uuid === authority.createdId || value.records.some((row) => row.id === authority.createdId))) {
    throw new Error("Retained PCB text created ID was already reserved in the original complete project.");
  }
  const baseline = verifyDesignBaseline({ checkpoint: before, source: authority.before, targets: [] });
  if (!isRecord(authority.beforePhase)) { throw new Error("Retained PCB text baseline phase is missing."); }
  exact(authority.beforePhase["baselineProof"], baseline, "Retained PCB text complete baseline proof changed.");
  const persistence = verifyDesignPersistence({ before, after, expectedBefore: authority.before, expectedAfter: authority.intended });
  exact(after.documents.map((value) => value.uuid), before.documents.map((value) => value.uuid), "Retained PCB text project membership changed.");
  let peers = 0;
  for (const prior of before.documents) {
    validateNativeDocumentRecordHistory(prior, before.checkpointSha256);
    const next = document(after, prior.uuid);
    if (prior.uuid !== authority.documentUuid) { exact(peerProjection(next), peerProjection(prior), "Retained PCB text changed an unrelated document, clock or raw history."); peers += 1; }
  }
  const stored = new Map(newTarget.records.map((value) => [value.id, value]));
  for (const prior of oldTarget.records) { exact(stored.get(prior.id), prior, "Retained PCB text changed an existing target record or clock."); }
  if (newTarget.records.length !== oldTarget.records.length + 1 || oldTarget.records.some((value) => value.id === authority.createdId)) {
    throw new Error("Retained PCB text durable delta is not the one original creation.");
  }
  const created = stored.get(authority.createdId), expectedCreated = authority.intended.objects.find((row) => row.id === authority.createdId);
  if (created === undefined || expectedCreated === undefined || created.type !== "STRING") { throw new Error("Retained PCB text original creation is absent from storage."); }
  exact({ id: created.id, type: created.type, body: created.body }, expectedCreated, "Retained PCB text stored creation differs from its original null/black intent.");
  const observed = sourcePhase({ payload: input.currentPayload, snapshot: current }, current);
  let carryover: Value | undefined;
  if (authority.legacy) {
    const previous = authority.before.objects.filter((row) => row.type === "STRING"), prior = previous[0];
    if (previous.length !== 1 || prior?.body["specialColor"] !== "#000000" || expectedCreated.body["specialColor"] !== null) {
      throw new Error("Legacy PCB text recovery requires exactly one preceding explicit-black STRING.");
    }
    if (authority.before.objects.some((row) => ["COMPONENT", "ATTR", "FONT", "BLOB"].includes(row.type)) ||
        oldTarget.records.some((row) => row.type === "COMPONENT" || row.type === "ATTR" || row.type === "FONT" || row.type === "BLOB")) {
      throw new Error("Legacy PCB text recovery excludes component, template and font decoder state.");
    }
    for (const peer of before.documents.filter((value) => value.uuid === "BLOB" || value.uuid === "FONT")) {
      if (peer.docType !== peer.uuid || peer.records.some((row) => row.type !== peer.uuid)) {
        throw new Error("Legacy PCB text recovery requires ordinary global blob/font record families only.");
      }
    }
    exact(rawStringIds(authority.beforeRawSource), [prior.id], "Legacy PCB text baseline STRING order is unproven.");
    exact(rawStringIds(authority.intendedRawSource), [prior.id, authority.createdId], "Legacy PCB text immediate STRING order is unproven.");
    exact(rawStringIds(observed.raw), [prior.id, authority.createdId], "Legacy PCB text reopened STRING order is unproven.");
    const source = { schema: authority.intended.schema, document: authority.intended.document,
      objects: authority.intended.objects.map((row) => row.id === authority.createdId ? { ...row, body: { ...row.body, specialColor: "#000000" } } : row) };
    exact(current, { ...source, sha256: sha256Json(source) }, "Legacy PCB text changed beyond its exact reserved STRING decoder carryover.");
    carryover = verifyLegacyPcbTextReloadOrder({ before: oldTarget, after: newTarget,
      beforeCheckpointSha256: before.checkpointSha256, afterCheckpointSha256: after.checkpointSha256,
      originalId: prior.id, createdId: authority.createdId });
  } else { exact(current, authority.intended, "Retained PCB text v2 reopened source is not exact."); }
  return { profile: authority.profile, originalCreatedId: authority.createdId, adapterProfile: authority.legacy ? LEGACY_CREATE_PROFILE : PCB_TEXT_LIFECYCLE_PROFILE,
    persistence, baseline, unchangedPeerCount: peers, unchangedTargetRecordCount: oldTarget.records.length,
    intendedSourceSha256: authority.intended.sha256, observedSourceSha256: current.sha256, rawObservedSourceSha256: sha256Text(observed.raw),
    ...(carryover === undefined ? {} : { carryover }), sourceNormalized: false, targetRawHistorySuffixReconstructed: false,
    targetRawBefore: nativeDocumentRecordHistoryProjection(oldTarget), targetRawAfter: nativeDocumentRecordHistoryProjection(newTarget),
    saveRepeated: false, navigationRepeated: false, creationProgramRegenerated: false };
}
