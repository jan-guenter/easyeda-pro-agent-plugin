import assert from "node:assert/strict";
import { test } from "node:test";
import { sha256Json } from "../src/core.ts";
import { materializeNativeHistory, materializeNativeHistoryCooperatively } from "../src/native-history.ts";
import type { NativeHistorySnapshot } from "../src/native-history.ts";
import { verifyLegacyPcbTextReloadOrder } from "../src/pcb-text-reload-history.ts";
import { BASE, CREATED, DOC, OLD, TEXT, fixture, head, history, raw } from "./pcb-text-retained-save-fixture.ts";

function prove(before: NativeHistorySnapshot, after: NativeHistorySnapshot): Record<string, unknown> {
  const prior = before.documents.find((row) => row.uuid === DOC);
  const next = after.documents.find((row) => row.uuid === DOC);
  assert.ok(prior); assert.ok(next);
  return verifyLegacyPcbTextReloadOrder({ before: prior, after: next, beforeCheckpointSha256: before.checkpointSha256,
    afterCheckpointSha256: after.checkpointSha256, originalId: OLD, createdId: CREATED });
}
void test("reload occurrence evidence is opt-in and leaves every default record, semantic hash and header rule unchanged", async () => {
  const hash = "a".repeat(64), input = [BASE];
  const baseline = materializeNativeHistory(input, hash);
  const next = materializeNativeHistory(input, hash, { documentRecordHistory: "preserve", pcbTextReloadOrder: "preserve" });
  const stripped = next.map((row) => Object.fromEntries(Object.entries(row).filter(([key]) => !["documentRecordHistory", "pcbTextReloadHistory"].includes(key))));
  assert.deepEqual(stripped, baseline);
  assert.deepEqual(await materializeNativeHistoryCooperatively(input, hash, { documentRecordHistory: "preserve", pcbTextReloadOrder: "preserve" }), next);
  assert.throws(() => materializeNativeHistory(input, hash, { pcbTextReloadOrder: "preserve" }), /checkpoint-hash/u);
  for (const field of ['"firstTicket":1,', '"pend":true,', '"num":4,', '"unknown":0,']) {
    const malformed = BASE.replace('"type":"STRING","ticket":3', `${field}"type":"STRING","ticket":3`);
    assert.throws(() => materializeNativeHistory([malformed], hash));
    assert.throws(() => materializeNativeHistory([malformed], hash, { documentRecordHistory: "preserve", pcbTextReloadOrder: "preserve" }));
  }
});
void test("reload uses oldest physical ticket rather than latest ticket, ID sort or exported order", () => {
  const value = fixture();
  const proof = prove(value.beforeHistory, value.afterHistory);
  assert.equal(proof["oldestOriginalTicket"], 3);
  assert.equal(proof["selectedOriginalTicket"], 10);
  assert.equal(proof["createdTicket"], 12);
  assert.deepEqual(proof["decoderStringOrder"], [OLD, CREATED]);
  // Sorted snapshot IDs would infer the opposite.
  assert.ok(CREATED < OLD);
  assert.equal(proof["targetRawPrefixUnchanged"], true);
  assert.deepEqual(proof["targetRawSuffixTypes"], ["DOCHEAD", "STRING"]);
});
void test("reload refuses duplicate, hidden, tombstoned, tied and reordered historical STRING evidence", () => {
  const { suffix } = fixture();
  for (const extra of [raw("STRING", 3, TEXT, OLD), raw("STRING", 3, TEXT, OLD).replace('"ticket":3', '"client":"different","ticket":3'),
    raw("STRING", 0, null, "0".repeat(16)), raw("STRING", 0, TEXT, "0".repeat(16)),
    raw("STRING", 0, TEXT, CREATED) + raw("STRING", 1, null, CREATED)]) {
    const before = history([BASE + head(11) + extra], "before");
    const after = history([BASE + head(11) + extra, suffix], "after");
    assert.throws(() => prove(before, after));
  }
  const before = history([BASE], "before");
  for (const changed of [BASE + head(11) + raw("STRING", 0, TEXT, OLD), BASE.replace('"ticket":3', '"ticket":4'),
    BASE.replace('"ticket":3', '"ticket":12'), BASE + head(11) + raw("LAYER", 0, { unused: true }, "hidden")]) {
    assert.throws(() => prove(before, history([changed, suffix], "after")));
  }
  for (const changed of [suffix + suffix, suffix.replace('"ticket":12', '"ticket":11'),
    `${suffix.split("|\n").filter(Boolean).toReversed().join("|\n")}|\n`]) {
    assert.throws(() => prove(before, history([BASE + changed], "after")));
  }
});
void test("reload binds both document and checkpoint identities and refuses changed raw prefix with identical current state", () => {
  const { beforeHistory, afterHistory } = fixture();
  const before = beforeHistory.documents.find((row) => row.uuid === DOC);
  const after = afterHistory.documents.find((row) => row.uuid === DOC);
  assert.ok(before); assert.ok(after);
  const input = { before, after, beforeCheckpointSha256: beforeHistory.checkpointSha256,
    afterCheckpointSha256: afterHistory.checkpointSha256, originalId: OLD, createdId: CREATED };
  assert.throws(() => verifyLegacyPcbTextReloadOrder({ ...input, after: { ...after, uuid: "e".repeat(16) } }), /identity/u);
  assert.throws(() => verifyLegacyPcbTextReloadOrder({ ...input, afterCheckpointSha256: "a".repeat(64) }));
  const missing = { ...before }; delete missing.pcbTextReloadHistory;
  assert.throws(() => verifyLegacyPcbTextReloadOrder({ ...input, before: missing }));
  const altered = structuredClone(after);
  assert.ok(altered.pcbTextReloadHistory);
  const record = altered.pcbTextReloadHistory.tail[0]; assert.ok(record);
  const body = { ...altered.pcbTextReloadHistory, tail: [{ ...record, before: { ...record.before, chainSha256: "0".repeat(64) } }, ...altered.pcbTextReloadHistory.tail.slice(1)] };
  const { sha256: _sha256, ...projection } = body;
  assert.throws(() => verifyLegacyPcbTextReloadOrder({ ...input, after: { ...altered, pcbTextReloadHistory: { ...projection, sha256: sha256Json(projection) } } }), /raw occurrence/u);
});
void test("reserved and original STRING identities refuse an earlier tombstoned non-STRING physical history", () => {
  const { suffix } = fixture();
  for (const identity of [CREATED, OLD]) {
    const prefix = head(2) + raw("LINE", 1, { x: 0 }, identity) + raw("LINE", 2, null, identity);
    const before = history([prefix, BASE], "before");
    const after = history([prefix, BASE, suffix], "after");
    assert.throws(() => prove(before, after), /non-STRING physical/u);
  }
});
