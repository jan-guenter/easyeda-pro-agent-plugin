import assert from "node:assert/strict";
import { test } from "node:test";
import { projectFootprintScope } from "../src/footprint-action.ts";
import { projectSymbolScope } from "../src/symbol-action.ts";
import { deriveRecoveryNavigationTarget } from "../src/recovery-navigation.ts";
import { parseDocumentSource } from "../src/document-source.ts";
import type { NativeHistorySnapshot } from "../src/native-history.ts";

void test("library geometry and recovery scopes refuse deleted documents and accept explicit native restoration", () => {
  for (const docType of ["SYMBOL", "FOOTPRINT"]) {
    const source = parseDocumentSource(`{"type":"DOCHEAD"}||${JSON.stringify({ uuid: "asset", docType: docType === "FOOTPRINT" ? "PCB" : docType, editVersion: "3.2.149.88089769" })}|\n{"id":"part","type":"PART"}||{"title":"A"}`);
    const records = [{ id: "META", type: "META", ticket: 1, client: null, body: { title: "Asset" } },
      { id: "DELETE_DOC", type: "DELETE_DOC", ticket: 2, client: null, body: { isDelete: true } }];
    const history: NativeHistorySnapshot = { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: "ab".repeat(32), projectOwnerUuid: "owner",
      branchUuid: "branch", headHistoryUuid: "head", checkpointSha256: "a".repeat(64), historyRowCount: 1, chunkCount: 1, plaintextBytes: 1, semanticSha256: "b".repeat(64),
      documents: [{ uuid: "asset", docType, metadata: {}, semanticSha256: "c".repeat(64), records }] };
    const context = { project: { uuid: history.projectUuid, path: "/mnt/c/Fixture/project.eprj2" },
      document: { uuid: "asset", documentType: docType === "SYMBOL" ? 2 : 4, parentLibraryUuid: "owner", tabId: `asset@${history.projectUuid}` } };
    const scope = docType === "SYMBOL" ? projectSymbolScope : projectFootprintScope;
    assert.throws(() => scope(source, history, context), /absent/u);
    assert.throws(() => deriveRecoveryNavigationTarget(context, history));
    const restored = { ...history, documents: history.documents.map((entry) => ({ ...entry,
      records: entry.records.map((record) => record.type === "DELETE_DOC" ? { ...record, body: { isDelete: false } } : record) })) };
    assert.doesNotThrow(() => scope(source, restored, context));
    assert.equal(deriveRecoveryNavigationTarget(context, restored).documentUuid, "asset");
    assert.equal(history.documents[0]?.records.length, 2);
  }
});
