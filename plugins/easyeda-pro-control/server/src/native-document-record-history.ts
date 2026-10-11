import { createHash } from "node:crypto";
import { z } from "zod";
import { sha256Json } from "./core.ts";
import type { NativeDocumentSnapshot } from "./native-history.ts";

export const NATIVE_DOCUMENT_RECORD_HISTORY_PROFILE = "easyeda.native-history.document-record-chain.v1";
const digest = z.string().regex(/^[a-f0-9]{64}$/u);
const identifier = z.string().regex(/^[a-zA-Z0-9_-]{1,128}$/u);
const ticket = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const chainSchema = z.object({ recordCount: z.number().int().nonnegative().max(1_000_000), maximumTicket: ticket, chainSha256: digest }).strict();
export type NativeDocumentRecordChain = z.infer<typeof chainSchema>;
const historySchema = chainSchema.extend({ profile: z.literal(NATIVE_DOCUMENT_RECORD_HISTORY_PROFILE),
  checkpointSha256: digest, documentUuid: identifier, sha256: digest }).strict();
export type NativeDocumentRecordHistory = z.infer<typeof historySchema>;

/** One chain per document, in original decoded occurrence order. The hash
 * commits exact header||body encodings, including field order/presence and
 * tombstone framing. EDIT_HEAD, chunk boundaries and cross-document ordering
 * are project packaging, not part of this per-document commitment.
 */
export function emptyNativeDocumentRecordChain(documentUuid: string): NativeDocumentRecordChain {
  identifier.parse(documentUuid);
  return { recordCount: 0, maximumTicket: 0, chainSha256: sha256Json({ profile: NATIVE_DOCUMENT_RECORD_HISTORY_PROFILE, documentUuid }) };
}
export function appendNativeDocumentRecordChain(chain: NativeDocumentRecordChain, recordEncodingSha256: string, recordTicket: number): NativeDocumentRecordChain {
  const previous = chainSchema.parse(chain);
  digest.parse(recordEncodingSha256); ticket.parse(recordTicket);
  if (previous.recordCount >= 1_000_000) { throw new Error("Native document record-history limit exceeded."); }
  return { recordCount: previous.recordCount + 1, maximumTicket: Math.max(previous.maximumTicket, recordTicket), chainSha256: sha256Json({ previous: previous.chainSha256, recordEncodingSha256 }) };
}
export function sealNativeDocumentRecordHistory(chain: NativeDocumentRecordChain, checkpointSha256: string, documentUuid: string): NativeDocumentRecordHistory {
  const body = { profile: NATIVE_DOCUMENT_RECORD_HISTORY_PROFILE, checkpointSha256, documentUuid, ...chainSchema.parse(chain) };
  return historySchema.parse({ ...body, sha256: sha256Json(body) });
}
export function validateNativeDocumentRecordHistory(document: NativeDocumentSnapshot, checkpointSha256: string): NativeDocumentRecordHistory {
  const value = historySchema.parse(document.documentRecordHistory), { sha256, ...body } = value;
  if (value.documentUuid !== document.uuid || value.checkpointSha256 !== checkpointSha256 || value.recordCount < 1 || sha256 !== sha256Json(body)) {
    throw new Error("Native document record-history checkpoint binding is invalid.");
  }
  return value;
}
export function nativeDocumentRecordHistoryProjection(document: NativeDocumentSnapshot): NativeDocumentRecordChain {
  const value = historySchema.parse(document.documentRecordHistory);
  return { recordCount: value.recordCount, maximumTicket: value.maximumTicket, chainSha256: value.chainSha256 };
}

/** The pinned worker xt/Qe serializers emit precisely DOCHEAD then META,
 * without explicit META client, trailing newline, or additional native fields.
 * Derive the byte encodings independently of the observed history commitment.
 */
export function appendClosedContainerMetadataRecords(before: NativeDocumentRecordChain, document: NativeDocumentSnapshot): NativeDocumentRecordChain {
  const meta = document.records.find((entry) => entry.id === "META" && entry.type === "META");
  if (meta === undefined || !["PCB", "SCH"].includes(document.docType)) { throw new Error("Closed-container native metadata records are unavailable."); }
  const header = { docType: document.docType, client: document.metadata["client"], uuid: document.uuid,
    updateTime: document.metadata["updateTime"], version: document.metadata["version"],
    ...(Object.hasOwn(document.metadata, "editVersion") ? { editVersion: document.metadata["editVersion"] } : {}) };
  const body = { title: meta.body["title"], ...(document.docType === "PCB" ? { parent: meta.body["parent"] } : {}),
    source: meta.body["source"], board: meta.body["board"], zIndex: meta.body["zIndex"] };
  const records = [
    `${JSON.stringify({ type: "DOCHEAD", ticket: meta.ticket })}||${JSON.stringify(header)}`,
    `${JSON.stringify({ type: "META", ticket: meta.ticket, id: "META" })}||${JSON.stringify(body)}`,
  ];
  let chain = before;
  for (const encoded of records) { chain = appendNativeDocumentRecordChain(chain, createHash("sha256").update(encoded).digest("hex"), meta.ticket); }
  return chain;
}
