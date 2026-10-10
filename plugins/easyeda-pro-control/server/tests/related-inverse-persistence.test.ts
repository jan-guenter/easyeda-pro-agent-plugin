import assert from "node:assert/strict";
import { test } from "node:test";
import { sha256Json } from "../src/core.ts";
import type { NativeSourceSnapshot } from "../src/document-source.ts";
import type { NativeHistorySnapshot } from "../src/native-history.ts";
import { projectSettledPriorInverse } from "../src/related-inverse-persistence.ts";

function source(uuid: string, present: boolean): NativeSourceSnapshot {
  const base = { schema: "easyeda-pro-control.document-source.v1" as const, document: { uuid, docType: "PCB" },
    objects: present ? [{ id: "line", type: "LINE", body: { width: 6 } }] : [] };
  return { ...base, sha256: sha256Json(base) };
}
function history(states: readonly NativeSourceSnapshot[]): NativeHistorySnapshot {
  const documents = states.map((state) => {
    const base = { uuid: String(state.document["uuid"]), docType: "PCB", metadata: state.document, records: state.objects };
    return { ...base, records: state.objects.map((record) => ({ ...record, ticket: 1, client: null })), semanticSha256: sha256Json(base) };
  });
  return { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: "11".repeat(32), projectOwnerUuid: "44".repeat(16), branchUuid: "22".repeat(16), headHistoryUuid: "33".repeat(16), checkpointSha256: sha256Json(documents), historyRowCount: 1, chunkCount: 1, plaintextBytes: 100, documents, semanticSha256: sha256Json(documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) };
}
void test("settled prior inverse proves both complete project transitions and rejects other drift", () => {
  const a = source("prior", false); const b = source("prior", true);
  const c = source("current", false); const d = source("current", true);
  const prior = { operationId: "easyeda-test-prior", journalSha256: "ab".repeat(32), inversePhaseSha256: "cd".repeat(32), checkpoint: history([a, c]), before: a, after: b, restored: a };
  const input = { before: history([b, c]), after: history([a, d]), expectedBefore: c, expectedAfter: d };
  const proof = projectSettledPriorInverse(input, prior);
  assert.equal(proof.before.documents[0]?.semanticSha256, input.after.documents[0]?.semanticSha256);
  assert.equal(proof.evidence["beforeSemanticSha256"], input.before.semanticSha256);
  assert.throws(() => projectSettledPriorInverse(input, { ...prior, restored: b }), /restoration/u);
  assert.throws(() => projectSettledPriorInverse({ ...input, after: history([b, d]) }, prior), /Deleted record/u);
  assert.throws(() => projectSettledPriorInverse({ ...input, after: history([a, d, source("foreign", true)]) }, prior), /identity changed/u);
  assert.throws(() => projectSettledPriorInverse(input, { ...prior, before: c, after: d, restored: c }), /distinct/u);
});
