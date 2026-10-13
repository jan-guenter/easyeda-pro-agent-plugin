import { sha256Json } from "../src/core.ts";
import { compareDocumentSources, parseDocumentSource } from "../src/document-source.ts";
import type { NativeSourceObject, NativeSourceSnapshot } from "../src/document-source.ts";
import { materializeNativeHistory } from "../src/native-history.ts";
import type { NativeHistorySnapshot } from "../src/native-history.ts";
import { verifyDesignBaseline } from "../src/design-persistence.ts";
import { PCB_TEXT_LIFECYCLE_PROFILE, expectedPcbTextLifecycleSource } from "../src/pcb-text-lifecycle.ts";

export const CLIENT = "c".repeat(16), CREATED = "4".repeat(16), DOC = "d".repeat(16), OLD = "8".repeat(16);
export const CONTEXT = { project: { uuid: "a".repeat(64), path: "/synthetic/fixture.eprj2" },
  document: { uuid: DOC, documentType: 3, tabId: `${DOC}@${"a".repeat(64)}`, parentProjectUuid: "a".repeat(64) } };
export const OPERATION = { id: "create-text", action: "pcb.text.create" as const,
  properties: { x: 500, y: 210, text: "Created", fontSize: 40, strokeWidth: 5 } };
export const TEXT = { partitionId: "", groupId: 0, layerId: 3, x: 95, y: 210, text: "Original", fontSize: 120, strokeWidth: 8,
  fontFamily: "default", bold: 0, italic: 0, origin: "LEFT_BOTTOM", angle: 0, reverse: false, expansion: 0,
  mirror: false, locked: false, zIndex: -1, specialColor: "#000000" };
export function raw(type: string, ticket: number, body: unknown, id?: string): string {
  return `${JSON.stringify({ type, ticket, ...(id === undefined ? {} : { id }) })}||${body === null ? "" : JSON.stringify(body)}|\n`;
}
export function head(ticket: number, documentUuid = DOC): string {
  return raw("DOCHEAD", ticket, { docType: "PCB", client: CLIENT, uuid: documentUuid,
    updateTime: ticket, version: String(ticket), editVersion: "3.2.149.88089769" });
}
export const BASE = head(2) + raw("META", 1, { title: "Synthetic", parent: "", source: "", board: "" }, "META") +
  raw("LAYER", 2, { layerId: 3, use: true, show: true, locked: false }, "layer3") + raw("STRING", 3, TEXT, OLD) +
  head(11) + raw("STRING", 10, TEXT, OLD);
const PEER = head(1, "e".repeat(16)) + raw("META", 1, { title: "Peer" }, "META");
export function history(chunks: readonly string[], label: string): NativeHistorySnapshot {
  const checkpointSha256 = sha256Json({ label, chunks }), documents = materializeNativeHistory(chunks, checkpointSha256,
    { documentRecordHistory: "preserve", pcbTextReloadOrder: "preserve" });
  return { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: CONTEXT.project.uuid, projectOwnerUuid: "owner",
    branchUuid: "b".repeat(32), headHistoryUuid: "f".repeat(32), checkpointSha256, historyRowCount: 1, chunkCount: chunks.length,
    plaintextBytes: chunks.reduce((sum, value) => sum + Buffer.byteLength(value), 0), documents,
    semanticSha256: sha256Json(documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) };
}
export function sourceRaw(source: NativeSourceSnapshot, order = [OLD, CREATED]): string {
  const rows = [...source.objects.filter((row) => row.type !== "STRING"), ...order.flatMap((id) => source.objects.filter((row) => row.id === id))];
  return raw("DOCHEAD", 0, source.document) + rows.map((row, index) => raw(row.type, index + 1, row.body, row.id)).join("");
}
export function phase(source: NativeSourceSnapshot, order = [OLD, CREATED]): {
  snapshot: NativeSourceSnapshot; payload: Record<string, unknown>;
} {
  const sourceText = sourceRaw(source, order);
  const payload = { ok: true, kind: "pcb-source", documentType: 3, source: sourceText, utf8Bytes: Buffer.byteLength(sourceText) };
  return { snapshot: source, payload: { ...payload, read_consistency: { stable: true, attempts: 2, snapshotSha256: sha256Json(payload),
    contextBinding: { level: "active-context-stability-required", preAndPostChecked: true, switchAwayAndBackDetectable: false } } } };
}
export function recolor(source: NativeSourceSnapshot, id: string, color: unknown): NativeSourceSnapshot {
  const body = { schema: source.schema, document: source.document,
    objects: source.objects.map((row) => row.id === id ? { ...row, body: { ...row.body, specialColor: color } } : row) };
  return { ...body, sha256: sha256Json(body) };
}
export function fixture(legacy = true, extraRecords: readonly NativeSourceObject[] = []): {
  journal: { operationId: string; planHash: string; plan: { operation: typeof OPERATION; expectedContext: typeof CONTEXT };
    context: typeof CONTEXT; before: NativeSourceSnapshot; after: NativeSourceSnapshot; createdId: string };
  phases: { before: ReturnType<typeof phase> & { baselineProof: Record<string, unknown> }; prepared: Record<string, unknown>; apply: Record<string, unknown>;
    after: ReturnType<typeof phase> & { proof: ReturnType<typeof compareDocumentSources> }; intent: Record<string, unknown>; save: Record<string, unknown> };
  beforeHistory: NativeHistorySnapshot; afterHistory: NativeHistorySnapshot; current: NativeSourceSnapshot; suffix: string;
} {
  const extra = extraRecords.map((row) => raw(row.type, 4, row.body, row.id)).join("");
  const beforeHistory = history([BASE + extra, PEER], "before");
  const before = parseDocumentSource(head(11) + raw("LAYER", 2, { layerId: 3, use: true, show: true, locked: false }, "layer3") + raw("STRING", 10, TEXT, OLD) + extra);
  const projected = expectedPcbTextLifecycleSource(OPERATION, before, { createdId: CREATED });
  const intended = legacy ? recolor(projected, CREATED, null) : projected;
  const added = intended.objects.find((row) => row.id === CREATED);
  if (added === undefined) { throw new Error("Synthetic created row missing."); }
  const suffix = head(13) + raw("STRING", 12, added.body, CREATED);
  const afterHistory = history([BASE + extra, PEER, suffix], "after");
  const journal = { operationId: "synthetic-operation", planHash: "f".repeat(64), plan: { operation: OPERATION, expectedContext: CONTEXT },
    context: CONTEXT, before, after: intended, createdId: CREATED };
  const after = { ...phase(intended), proof: compareDocumentSources(before, intended) };
  const { read_consistency: consistency } = after.payload;
  if (typeof consistency !== "object" || consistency === null || !("snapshotSha256" in consistency)) { throw new Error("Synthetic read commitment missing."); }
  const phases = {
    before: { ...phase(before), baselineProof: verifyDesignBaseline({ checkpoint: beforeHistory, source: before, targets: [] }) },
    prepared: { adapterProfile: legacy ? "easyeda-pro-control.pcb-standalone-text-lifecycle.v1" : PCB_TEXT_LIFECYCLE_PROFILE,
      createdId: CREATED, createdIds: null, componentCreate: null, codeSha256: "c".repeat(64) },
    apply: { ok: true, kind: "typed-design-result", id: OPERATION.id, primitiveId: CREATED, createdId: CREATED }, after,
    intent: { profile: "easyeda-pro-control.design-save-attempt.v1", operationId: journal.operationId, planHash: journal.planHash,
      sequence: 5, phase: "save-reopen", sourceSha256: intended.sha256,
      scope: { projectUuid: CONTEXT.project.uuid, documentUuid: DOC, documentType: 3 } },
    save: { ok: true, saved: true, closed: true, reopened: true,
      projectUploadBarrier: { profile: "easyeda-pro-control.project-upload-barrier.v1", projectUuid: CONTEXT.project.uuid, scheduledWritesSettled: true, savedEditorChanges: false },
      closeProof: { profile: "easyeda-pro-control.native-document-close.v1", closeCalls: 1, terminalNotification: true, oldFrameRemoved: true, oldTabRemoved: true, saved: false },
      openProof: { profile: "easyeda-pro-control.native-document-open.v1", tabId: CONTEXT.document.tabId, newFrameReady: true, exactContext: true, readinessSamples: 2, activated: true },
      exactSaveGuard: { passes: 2, labels: ["pcb-source"], snapshotSha256: [consistency.snapshotSha256], saveInvokedInSameExecution: true, publicCompareAndSwapAvailable: false },
      document: { uuid: DOC, documentType: 3, title: "", tabId: CONTEXT.document.tabId } },
  };
  return { journal, phases, beforeHistory, afterHistory, current: projected, suffix };
}
