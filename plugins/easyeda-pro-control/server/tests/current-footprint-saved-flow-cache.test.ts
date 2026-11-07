/** Fixed source parser execution over inert native plaintext only. No original
 * checkpoint, native worker, cache write or continuation is issued. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { sha256Text } from "../src/core.ts";
import { prepareCurrentFootprintSavedFlowCachePlan, requireOriginalCurrentFootprintSavedFlowCachePlan } from "../src/current-footprint-saved-flow-cache-plan.ts";
import { deriveCurrentFootprintSavedFlowCacheData } from "../src/current-footprint-saved-flow-cache-data.ts";

const branchUuid = "b".repeat(32), firstDoc = "c".repeat(16), head = "2".repeat(32), oldHead = "1".repeat(32), projectUuid = "a".repeat(64), secondDoc = "d".repeat(32);
const line = (type: string, body: unknown, extra: object = {}): string => `${JSON.stringify({ type, ...extra })}||${JSON.stringify(body)}`;
const row = (id: number, uuid: string, parent: string | null, num: number): object => ({ id, uuid, parent, key: "3".repeat(32), is_lock: 1, num, snapshot_num: 0,
    created_at: "2026-11-07 00:00:00", updated_at: "2026-11-07 00:00:00", lock_time: null });
function fixture(): Readonly<{ input: object; firstBody: string }> {
  const first = [line("DOCHEAD", { uuid: firstDoc, docType: "FOOTPRINT", client: "native-client" }, { ticket: 1 }), line("META", { title: "Original" }, { id: "META", ticket: 2 }),
    line("DOCHEAD", { uuid: secondDoc, docType: "FOOTPRINT", client: "native-client" }, { ticket: 3 }), line("META", { title: "Copy" }, { id: "META", ticket: 4 })];
  const raw = [first, [first[0], line("META", { title: "Original later" }, { id: "META", ticket: 5 })],
    [first[2], line("META", { title: "Saved copy" }, { id: "META", ticket: 6 })]];
  const chunks = raw.map((records, index) => { const plaintext = `${line("EDIT_HEAD", { uuid: "actor", updateTime: 1000 + index })}|\n${records.join("|\n")}|\n`;
    return { historyUuid: index === 2 ? head : oldHead, ordinal: index === 1 ? 1 : 0, plaintext, plaintextSha256: sha256Text(plaintext) }; });
  return { input: { projectUuid, branchUuid, headHistoryUuid: head, heads: [row(2, head, oldHead, 0), row(1, oldHead, null, 1)], chunks }, firstBody: first.join("|\n") };
}
void test("actual fixed parser combines sixteen/thirty-two-character footprints under literal group and preserves noninitial chunk URLs", () => {
  const f = fixture(), result = deriveCurrentFootprintSavedFlowCacheData(f.input);
  assert.deepEqual(result.bodies.map(body => body.url), [`https://client/dataStr/${oldHead}-FOOTPRINT`, `https://client/dataStr/${oldHead}-1-FOOTPRINT`, `https://client/dataStr/${head}-FOOTPRINT`]);
  assert.equal(result.bodies[0]?.body, f.firstBody); assert.equal(result.bodies[0]?.sha256, sha256Text(f.firstBody));
  const index: unknown = JSON.parse(result.headIndex.body); assert.ok(Array.isArray(index));
  const newest: unknown = index[0], previous: unknown = index[1]; assert.ok(newest !== null && typeof newest === "object" && previous !== null && typeof previous === "object");
  assert.deepEqual(Object.keys(newest), ["id", "uuid", "parent", "key", "is_lock", "num", "snapshot_num", "created_at", "updated_at", "lock_time", "iv", "dataStrUrl", "editHead", "docs", "docIds"]);
  assert.ok("docIds" in previous && "docs" in previous && "dataStrUrl" in previous);
  assert.deepEqual(previous.docIds, [[firstDoc, secondDoc], [firstDoc]]); assert.deepEqual(previous.docs, [{ FOOTPRINT: 0 }, { FOOTPRINT: 0 }]);
  assert.equal(previous.dataStrUrl, `/api/v4/histories/dataStr?path=${projectUuid}&uuid=${oldHead}`);
  assert.equal(result.suppliedObservationsOnly, true); assert.equal(result.nativeWorkerOwnershipVerified, false); assert.equal(result.cacheContinuationAuthorized, false);
});
void test("source projection refuses accessor input and an oversized group before issuing data", () => {
  let called = false; const accessor = Object.defineProperty({}, "heads", { enumerable: true, get: (): unknown => { called = true; return []; } });
  assert.throws(() => deriveCurrentFootprintSavedFlowCacheData(accessor)); assert.equal(called, false);
  const oversized = `${line("EDIT_HEAD", { uuid: "actor" })}|\n${line("DOCHEAD", { uuid: firstDoc, docType: "FOOTPRINT" }, { ticket: 1 })}|\n${line("META", { title: "x".repeat(9000) }, { id: "META", ticket: 2 })}|\n`;
  const value = { projectUuid, branchUuid, headHistoryUuid: oldHead, heads: [{ id: 1, uuid: oldHead, parent: null, key: "3".repeat(32), is_lock: 1, num: 0, snapshot_num: 0, created_at: null, updated_at: null, lock_time: null }],
    chunks: [{ historyUuid: oldHead, ordinal: 0, plaintext: oversized, plaintextSha256: sha256Text(oversized) }] };
  assert.throws(() => deriveCurrentFootprintSavedFlowCacheData(value));
});

void test("copied saved-checkpoint and plan labels issue no original source plan", () => {
  const prepared = Object.freeze({ profile: "private.current-footprint-forward-saved-checkpoint.v1" as const });
  assert.throws(() => prepareCurrentFootprintSavedFlowCachePlan(prepared), /ORIGINAL_FORWARD_CHECKPOINT/u);
  assert.throws(() => requireOriginalCurrentFootprintSavedFlowCachePlan(Object.freeze({ profile: "private.current-footprint-saved-flow-cache-plan.v1" }), prepared), /FOOTPRINT_SAVED_FLOW_CACHE_PLAN/u);
});
