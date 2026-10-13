import { sha256Json } from "../src/core.ts";
import type { ExpectedContext } from "../src/engine.ts";
import type { NativeDocumentSnapshot, NativeHistorySnapshot } from "../src/native-history.ts";
import { fixtureDocumentRecordHistory, fixtureRebindDocumentRecordHistory } from "./document-record-history-fixture.ts";

export const SCHEMATIC_CREATE_ID = "c".repeat(16);
export const SCHEMATIC_CREATE_CONTEXT: ExpectedContext = { project: { uuid: "project", path: "/fixture/project.eprj2" },
  document: { uuid: "active", documentType: 3, tabId: "active@project", parentProjectUuid: "project" } };
export const SCHEMATIC_CREATE_OPERATION = { id: "create-free-schematic", action: "document.schematic.create" };
export function schematicCreateRehash(documents: readonly NativeDocumentSnapshot[], checkpointSha256 = "a".repeat(64)): NativeHistorySnapshot {
  const values = documents.map((document) => ({ ...fixtureRebindDocumentRecordHistory(document, checkpointSha256), semanticSha256: sha256Json({ uuid: document.uuid, docType: document.docType, metadata: document.metadata,
    records: document.records.map(({ id, type, body }) => ({ id, type, body })) }) }));
  return { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: "project", projectOwnerUuid: "owner", branchUuid: "branch", headHistoryUuid: "head",
    checkpointSha256, historyRowCount: 1, chunkCount: 1, plaintextBytes: 1, documents: values,
    semanticSha256: sha256Json(values.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) };
}
export function schematicCreateHistory(created = false, peerClockChanged = false): NativeHistorySnapshot {
  const documents = ["active", "peer", "parent", "page", ...(created ? [SCHEMATIC_CREATE_ID] : [])].map((uuid) => {
    let docType = "PCB";
    if (uuid === "parent" || uuid === "peer" || uuid === SCHEMATIC_CREATE_ID) { docType = "SCH"; } else if (uuid === "page") { docType = "SCH_PAGE"; }
    const time = uuid === SCHEMATIC_CREATE_ID ? 2 : 1;
    const metadata = { uuid, docType, client: "a".repeat(16), updateTime: time, version: String(time), editVersion: "3.2",
      ...(uuid === SCHEMATIC_CREATE_ID ? {} : { user: { uuid: "original-author" } }) };
    const titles: Record<string, string> = { active: "PCB1", parent: "Schematic1", peer: "Schematic7", [SCHEMATIC_CREATE_ID]: "Schematic8" };
    const body = { title: titles[uuid] ?? uuid,
      source: "", zIndex: docType === "SCH_PAGE" ? 1 : null, ...(docType === "SCH_PAGE" ? { schematic: "parent" } : { board: "" }),
      ...(docType === "PCB" ? { parent: "" } : {}) };
    return fixtureDocumentRecordHistory({ uuid, docType, metadata, records: [{ id: "META", type: "META", body, ticket: peerClockChanged && uuid === "active" ? 99 : time,
      client: uuid === SCHEMATIC_CREATE_ID ? "a".repeat(16) : null }], semanticSha256: "" }, "a".repeat(64), undefined, uuid === SCHEMATIC_CREATE_ID);
  });
  return schematicCreateRehash(documents);
}
export { PcbCreateDomNode, pcbCreateDom } from "./project-pcb-create-fixture.ts";
