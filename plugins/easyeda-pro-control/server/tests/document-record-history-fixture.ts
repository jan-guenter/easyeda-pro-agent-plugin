import { createHash } from "node:crypto";
import { appendClosedContainerMetadataRecords, appendNativeDocumentRecordChain, emptyNativeDocumentRecordChain, nativeDocumentRecordHistoryProjection, sealNativeDocumentRecordHistory } from "../src/native-document-record-history.ts";
import type { NativeDocumentSnapshot } from "../src/native-history.ts";

/** Synthetic lifecycle fixtures; raw-parser adversarial tests independently
 * exercise real serialized records and never call this convenience builder. */
export function fixtureDocumentRecordHistory(document: NativeDocumentSnapshot, checkpointSha256: string, before?: NativeDocumentSnapshot, created = false): NativeDocumentSnapshot {
  let chain = emptyNativeDocumentRecordChain(document.uuid);
  if (before !== undefined || created) {
    chain = appendClosedContainerMetadataRecords(before === undefined ? chain : nativeDocumentRecordHistoryProjection(before), document);
  } else {
    const records = [{ header: { type: "DOCHEAD", ticket: 0 }, body: document.metadata },
      ...document.records.map((entry) => ({ header: { type: entry.type, ticket: entry.ticket, id: entry.id }, body: entry.body }))];
    for (const entry of records) {
      chain = appendNativeDocumentRecordChain(chain, createHash("sha256").update(`${JSON.stringify(entry.header)}||${JSON.stringify(entry.body)}`).digest("hex"), entry.header.ticket);
    }
  }
  return { ...document, documentRecordHistory: sealNativeDocumentRecordHistory(chain, checkpointSha256, document.uuid) };
}
export function fixtureRebindDocumentRecordHistory(document: NativeDocumentSnapshot, checkpointSha256: string): NativeDocumentSnapshot {
  if (document.documentRecordHistory === undefined) { return fixtureDocumentRecordHistory(document, checkpointSha256); }
  return { ...document, documentRecordHistory: sealNativeDocumentRecordHistory(nativeDocumentRecordHistoryProjection(document), checkpointSha256, document.uuid) };
}
