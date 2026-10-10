import assert from "node:assert/strict";
import { test } from "node:test";
import { isRecord, sha256Json } from "../src/core.ts";
import { parseDocumentSource } from "../src/document-source.ts";
import type { NativeSourceSnapshot } from "../src/document-source.ts";
import { verifyDesignPersistence } from "../src/design-persistence.ts";
import { materializeNativeHistory } from "../src/native-history.ts";
import type { NativeDocumentSnapshot, NativeHistorySnapshot } from "../src/native-history.ts";

type Json = Record<string, unknown>;
interface Header { readonly ticket: number; readonly metadata: Json }
const DOCUMENT = "1234567890abcdef";
const USER = { uuid: "12".repeat(16), username: "fixture", nickname: "Fixture", avatar: "" };
const IDENTITY = { uuid: DOCUMENT, docType: "SCH_PAGE", editVersion: "3.2.149.88089769" };
const metadata = (time: number, user = false): Json => ({ ...IDENTITY, client: "0123456789abcdef", updateTime: time,
  version: String(time), ...(user ? { user: USER } : {}) });
const oldHeaders = [{ ticket: 1, metadata: metadata(100, true) },
  { ticket: 2, metadata: metadata(200) }, { ticket: 3, metadata: metadata(250) }] as const;
const newHeaders = [...oldHeaders, { ticket: 4, metadata: metadata(300, true) }] as const;
function lines(headers: readonly Header[], x: number): string {
  const prefix = headers.map(({ ticket, metadata: body }) => `{"type":"DOCHEAD","ticket":${ticket}}||${JSON.stringify(body)}|\n`).join("");
  return `${prefix}{"type":"COMPONENT","id":"part","ticket":20}||{"x":${x},"y":0}|\n`;
}
function snapshot(headers: readonly Header[], x: number, hash: string, suffix = ""): NativeHistorySnapshot {
  const documents = materializeNativeHistory([lines(headers, x) + suffix,
    '{"type":"DOCHEAD","ticket":1}||{"uuid":"peer","docType":"SYMBOL"}|\n' +
    '{"type":"META","id":"META","ticket":1}||{"title":"unchanged"}|\n'], hash);
  return { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: "11".repeat(32), branchUuid: "22".repeat(16),
    headHistoryUuid: "33".repeat(16), checkpointSha256: hash, historyRowCount: 1, chunkCount: 1, plaintextBytes: 100,
    documents, semanticSha256: sha256Json(documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) };
}
const source = (x: number): NativeSourceSnapshot => parseDocumentSource(`{"type":"DOCHEAD"}||${JSON.stringify(IDENTITY)}|\n{"type":"COMPONENT","id":"part"}||{"x":${x},"y":0}|\n`);
function fixture(beforeHeaders: readonly Header[] = oldHeaders, afterHeaders: readonly Header[] = newHeaders,
  beforeSuffix = ""): Parameters<typeof verifyDesignPersistence>[0] {
  return { before: snapshot(beforeHeaders, 1, "a".repeat(64), beforeSuffix), after: snapshot(afterHeaders, 2, "b".repeat(64)),
    expectedBefore: source(1), expectedAfter: source(2) };
}
function target(history: NativeHistorySnapshot): NativeDocumentSnapshot {
  const document = history.documents.find((entry) => entry.uuid === DOCUMENT);
  assert.ok(document);
  return document;
}
function mutateLast(headers: readonly Header[], patch: Json): readonly Header[] {
  return headers.map((header, index) => index === headers.length - 1 ? { ...header, metadata: { ...header.metadata, ...patch } } : header);
}

void test("same-target header user restoration retains exact provenance and existing semantic hashes", () => {
  const input = fixture();
  const raw = JSON.stringify(input);
  const proof = verifyDesignPersistence(input);
  const restoration = proof["schematicMetadataUserRestoration"];
  assert.ok(isRecord(restoration));
  assert.equal(proof["ok"], true);
  assert.equal(proof["documentCount"], 2);
  assert.equal(restoration["originalHeaderTicket"], 1);
  assert.equal(restoration["omittedHeaderTicket"], 3);
  assert.equal(restoration["restoredHeaderTicket"], 4);
  assert.equal(restoration["restoredUserSha256"], sha256Json(USER));
  assert.equal(restoration["beforeCheckpointSha256"], input.before.checkpointSha256);
  assert.equal(restoration["beforeHeaderHistorySha256"], target(input.before).headerHistory?.sha256);
  assert.equal(materializeNativeHistory([lines(oldHeaders, 1)])[0]?.semanticSha256, target(input.before).semanticSha256);
  assert.equal(JSON.stringify(input), raw);
});

void test("restoration refuses every different or malformed user and any existing-user replacement", () => {
  for (const user of [null, {}, { ...USER, uuid: "34".repeat(16) }, { ...USER, username: "other" },
    { ...USER, nickname: "Other" }, { ...USER, avatar: "changed" }, { ...USER, extra: true },
    { ...USER, nickname: "\0" }, { ...USER, username: "" }]) {
    assert.throws(() => verifyDesignPersistence(fixture(oldHeaders, mutateLast(newHeaders, { user }))));
  }
  assert.throws(() => verifyDesignPersistence(fixture(mutateLast(oldHeaders, { user: null }))));
  assert.throws(() => verifyDesignPersistence(fixture(mutateLast(oldHeaders, { user: USER }),
    mutateLast(newHeaders, { user: { ...USER, username: "other" } }))));
  const unchangedUser = fixture(mutateLast(oldHeaders, { user: USER }));
  assert.equal(verifyDesignPersistence(unchangedUser)["schematicMetadataUserRestoration"], undefined);
  const reversed = fixture();
  assert.throws(() => verifyDesignPersistence({ before: reversed.after, after: reversed.before,
    expectedBefore: reversed.expectedAfter, expectedAfter: reversed.expectedBefore }));
});

void test("restoration requires original checkpoint-bound history, exact prefix and valid newer clocks", () => {
  for (const patch of [{ updateTime: 250, version: "250" }, { updateTime: 200, version: "200" },
    { updateTime: "300" }, { version: "wrong" }, { client: "unbound" }, { editVersion: "other" }, { title: "unexpected" }]) {
    assert.throws(() => verifyDesignPersistence(fixture(oldHeaders, mutateLast(newHeaders, patch))));
  }
  const absentOriginal = oldHeaders.map((header) => ({ ...header, metadata: metadata(Number(header.metadata["updateTime"])) }));
  assert.throws(() => verifyDesignPersistence(fixture(absentOriginal, [...absentOriginal, newHeaders[3]])));
  const nullOriginal = [{ ticket: 1, metadata: { ...metadata(100), user: null } }, ...oldHeaders.slice(1)];
  assert.throws(() => verifyDesignPersistence(fixture(nullOriginal, [...nullOriginal, newHeaders[3]])));
  const otherOriginal = [{ ticket: 1, metadata: { ...metadata(100), user: { ...USER, uuid: "34".repeat(16) } } }, ...oldHeaders.slice(1)];
  assert.throws(() => verifyDesignPersistence(fixture(otherOriginal, [...otherOriginal, newHeaders[3]])));
  assert.throws(() => verifyDesignPersistence(fixture(oldHeaders, [newHeaders[3]])));
  for (const change of ["missing", "digest", "checkpoint", "document", "clock"] as const) {
    const input = fixture();
    const before = target(input.before);
    const evidence = before.headerHistory;
    assert.ok(evidence);
    if (change === "missing") { Reflect.deleteProperty(before, "headerHistory"); }
    else if (change === "digest") { Reflect.set(evidence, "sha256", "c".repeat(64)); }
    else if (change === "checkpoint") { Reflect.set(evidence, "checkpointSha256", input.after.checkpointSha256); }
    else if (change === "document") { Reflect.set(evidence, "documentUuid", "peer"); }
    else {
      const header = evidence.headers[1];
      assert.ok(header); Reflect.set(header, "ticket", 1);
    }
    assert.throws(() => verifyDesignPersistence(input));
  }
});

void test("stale or conflicting header clocks and deletion markers never provide restoration authority", () => {
  const stale = [oldHeaders[1], oldHeaders[0], oldHeaders[2]];
  const staleSnapshot = snapshot(stale, 1, "a".repeat(64));
  assert.equal(target(staleSnapshot).headerHistory, undefined);
  assert.throws(() => verifyDesignPersistence(fixture(stale)));
  for (const body of ['{"isDelete":false}', '{"isDelete":true}']) {
    const deletion = `{"type":"DELETE_DOC","id":"DELETE_DOC","ticket":30}||${body}|\n`;
    const deletedSnapshot = snapshot(oldHeaders, 1, "a".repeat(64), deletion);
    assert.equal(target(deletedSnapshot).headerHistory, undefined);
    assert.throws(() => verifyDesignPersistence(fixture(oldHeaders, newHeaders, deletion)));
  }
  assert.throws(() => snapshot(oldHeaders, 1, "a".repeat(64), '{"type":"DELETE_DOC","id":"DELETE_DOC","ticket":30}|||\n'), /delete-document/u);
  assert.throws(() => materializeNativeHistory([lines(oldHeaders, 1), lines([{ ticket: 3, metadata: metadata(251) }], 1)], "a".repeat(64)), /document-ticket-conflict/u);
});

void test("historical user support preserves ordinary source and peer-document refusal", () => {
  const input = fixture();
  assert.throws(() => verifyDesignPersistence({ ...input, expectedAfter: input.expectedBefore }), /unchanged/u);
  const peer = input.after.documents.find((document) => document.uuid === "peer");
  assert.ok(peer);
  const changedPeer = { ...peer, metadata: { ...peer.metadata, title: "other" } };
  const projection = { uuid: peer.uuid, docType: peer.docType, metadata: changedPeer.metadata,
    records: peer.records.map(({ id, type, body }) => ({ id, type, body })) };
  changedPeer.semanticSha256 = sha256Json(projection);
  const documents = input.after.documents.map((document) => document.uuid === "peer" ? changedPeer : document);
  const after = { ...input.after, documents,
    semanticSha256: sha256Json(documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) };
  assert.throws(() => verifyDesignPersistence({ ...input, after }), /Another document/u);
});
