import assert from "node:assert/strict";
import { test } from "node:test";
import { sha256Json } from "../src/core.ts";
import { materializeNativeHistory, materializeNativeHistoryCooperatively } from "../src/native-history.ts";
import type { NativeHistorySnapshot } from "../src/native-history.ts";
import { nativeDocumentRecordHistoryProjection, validateNativeDocumentRecordHistory } from "../src/native-document-record-history.ts";
import { isProjectPcbCreateProjectUnchanged, prepareProjectPcbCreate, verifyProjectPcbCreateEffect } from "../src/project-pcb-create.ts";
import { isDocumentContainerRenameProjectUnchanged, prepareDocumentContainerRename, verifyDocumentContainerRenameEffect } from "../src/document-container-rename.ts";

const CLIENT = "f".repeat(16), CREATED = "c".repeat(16), HASH = "a".repeat(64);
const CONTEXT = { project: { uuid: "project", path: "/fixture.eprj2" }, document: { uuid: "active", documentType: 3, tabId: "active@project", parentProjectUuid: "project" } };
const CREATE = { id: "new", action: "document.pcb.create" };
function raw(type: string, ticket: number, body: unknown, id?: string): string {
  return `${JSON.stringify({ type, ticket, ...(id === undefined ? {} : { id }) })}||${body === null ? "" : JSON.stringify(body)}|\n`;
}
function head(uuid: string, ticket: number, time = 1, type = "PCB"): string {
  return raw("DOCHEAD", ticket, { docType: type, client: CLIENT, uuid, updateTime: time, version: String(time), editVersion: "3.2" });
}
function meta(name: string, ticket: number, type = "PCB"): string {
  return raw("META", ticket, { title: name, ...(type === "PCB" ? { parent: "" } : {}), source: "", board: "", zIndex: null }, "META");
}
const BASE = head("active", 1) + meta("PCB1", 1) + head("peer", 2) + meta("PCB7", 2) + head("parent", 3, 1, "SCH") + meta("Circuit", 3, "SCH");
const ADD = head(CREATED, 10, 2) + meta("PCB8", 10);
function history(chunks: readonly string[], checkpointSha256 = HASH): NativeHistorySnapshot {
  const documents = materializeNativeHistory(chunks, checkpointSha256, { documentRecordHistory: "preserve" });
  return { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: "project", projectOwnerUuid: "owner", branchUuid: "branch", headHistoryUuid: "head",
    checkpointSha256, historyRowCount: chunks.length, chunkCount: chunks.length, plaintextBytes: chunks.reduce((size, chunk) => size + Buffer.byteLength(chunk), 0), documents,
    semanticSha256: sha256Json(documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) };
}
void test("per-document raw record commitments are opt-in, checkpoint-bound, and identical in cooperative materialization", async () => {
  const observed = history([BASE]), strict = materializeNativeHistory([BASE], HASH);
  assert.ok(strict.every((document) => document.documentRecordHistory === undefined));
  assert.deepEqual(await materializeNativeHistoryCooperatively([BASE], HASH, { documentRecordHistory: "preserve" }), observed.documents);
  assert.equal(sha256Json(strict.map((document) => document.semanticSha256)), sha256Json(observed.documents.map((document) => document.semanticSha256)));
  assert.throws(() => materializeNativeHistory([BASE], undefined, { documentRecordHistory: "preserve" }), /checkpoint-hash/u);
  const first = observed.documents[0]; assert.ok(first);
  assert.equal(validateNativeDocumentRecordHistory(first, HASH).recordCount, 2);
  assert.throws(() => validateNativeDocumentRecordHistory(first, "b".repeat(64)), /binding/u);
  assert.throws(() => validateNativeDocumentRecordHistory({ ...first, uuid: "foreign" }, HASH), /binding/u);
  assert.throws(() => validateNativeDocumentRecordHistory({ ...first, documentRecordHistory: { ...validateNativeDocumentRecordHistory(first, HASH), chainSha256: "0".repeat(64) } }, HASH), /binding/u);
  assert.throws(() => prepareProjectPcbCreate(CREATE, { ...observed, documents: strict }, CONTEXT));
});
void test("PCB creation requires an independently encoded DOCHEAD/META pair and unchanged peer occurrence chains", () => {
  const before = history([BASE]), plan = prepareProjectPcbCreate(CREATE, before, CONTEXT);
  const after = history([BASE, ADD], "b".repeat(64));
  assert.equal(verifyProjectPcbCreateEffect(plan, before, after, CREATED)["effectVerified"], true);
  const changes = [head("peer", 9), head("peer", 2), head("peer", 0),
    head("peer", 2) + raw("META", 0, { title: "stale" }, "META"),
    head("peer", 2) + raw("STRING", 0, null, "absent"),
    head("peer", 2) + raw("STRING", 8, { value: "transient" }, "temporary") + raw("STRING", 9, null, "temporary"),
  ];
  for (const changed of changes) {
    const peerChanged = history([BASE, changed]);
    assert.equal(peerChanged.semanticSha256, before.semanticSha256);
    assert.equal(isProjectPcbCreateProjectUnchanged(plan, before, peerChanged), false);
    assert.throws(() => verifyProjectPcbCreateEffect(plan, before, history([BASE, changed, ADD]), CREATED), /pre-existing/u);
  }
  for (const added of [ADD + ADD, ADD.replace('"type":"META","ticket":10,"id":"META"', '"type":"META","id":"META","ticket":10'),
    ADD.replace('"type":"META","ticket":10', `"type":"META","client":"${CLIENT}","ticket":10`),
    ADD.replace('"parent":""', '"parent": ""')]) {
    assert.equal(history([BASE, added]).semanticSha256, history([BASE, ADD]).semanticSha256);
    assert.throws(() => verifyProjectPcbCreateEffect(plan, before, history([BASE, added]), CREATED), /raw record history/u);
  }
});
for (const kind of ["pcb", "schematic"] as const) {
  void test(`${kind} rename requires precisely one raw DOCHEAD/META suffix and preserves every peer occurrence`, () => {
    const type = kind === "pcb" ? "PCB" : "SCH", uuid = kind === "pcb" ? "peer" : "parent";
    const before = history([BASE]), operation = { id: "rename", action: `document.${kind}.rename`, target: { uuid }, name: "Renamed" };
    const plan = prepareDocumentContainerRename(operation, before, CONTEXT), suffix = head(uuid, 10, 2, type) + meta("Renamed", 10, type);
    const after = history([BASE, suffix], "b".repeat(64));
    assert.equal(verifyDocumentContainerRenameEffect(plan, before, after)["effectVerified"], true);
    for (const peer of [head("active", 9), head("active", 1), head("active", 0) + raw("META", 0, { title: "hidden" }, "META")]) {
      assert.equal(history([BASE, peer]).semanticSha256, before.semanticSha256);
      assert.equal(isDocumentContainerRenameProjectUnchanged(plan, before, history([BASE, peer])), false);
      assert.throws(() => verifyDocumentContainerRenameEffect(plan, before, history([BASE, peer, suffix])), /children, peers/u);
    }
    const transient = head(uuid, 4, 1, type) + raw("STRING", 8, { value: "hidden" }, "temporary") + raw("STRING", 9, null, "temporary");
    for (const hidden of [suffix + suffix, transient + suffix, suffix.replace('"ticket":10', '"ticket":9')]) {
      assert.equal(history([BASE, hidden]).semanticSha256, history([BASE, suffix]).semanticSha256);
      assert.throws(() => verifyDocumentContainerRenameEffect(plan, before, history([BASE, hidden])), /raw record history/u);
    }
  });
}
void test("record commitments preserve raw field order, empty-body framing, duplicates, and maximum tombstone clock", () => {
  const base = history([BASE]), ordered = history([BASE.replace('"type":"META","ticket":1,"id":"META"', '"id":"META","type":"META","ticket":1')]);
  assert.equal(base.semanticSha256, ordered.semanticSha256);
  assert.notDeepEqual(base.documents.map(nativeDocumentRecordHistoryProjection), ordered.documents.map(nativeDocumentRecordHistoryProjection));
  const withTombstone = history([BASE, head("peer", 2) + raw("STRING", 100, null, "absent")]);
  const peer = withTombstone.documents.find((document) => document.uuid === "peer"); assert.ok(peer);
  assert.equal(nativeDocumentRecordHistoryProjection(peer).maximumTicket, 100);
  const plan = prepareProjectPcbCreate(CREATE, withTombstone, CONTEXT);
  assert.throws(() => verifyProjectPcbCreateEffect(plan, withTombstone, history([BASE, head("peer", 2) + raw("STRING", 100, null, "absent"), ADD]), CREATED), /META clock/u);
  const deleted = BASE + head("peer", 2) + raw("DELETE_DOC", 3, { isDelete: false }, "DELETE_DOC");
  const toggled = deleted + head("peer", 2) + raw("DELETE_DOC", 8, { isDelete: true }, "DELETE_DOC") + raw("DELETE_DOC", 9, { isDelete: false }, "DELETE_DOC");
  assert.equal(history([deleted]).semanticSha256, history([toggled]).semanticSha256);
  assert.notDeepEqual(history([deleted]).documents.map(nativeDocumentRecordHistoryProjection), history([toggled]).documents.map(nativeDocumentRecordHistoryProjection));
});
