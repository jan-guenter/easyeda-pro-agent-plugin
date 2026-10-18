/** Synthetic native-shaped records only. No application, project or SQL access. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { prepareCurrentPcbRenameHistory, verifyCurrentPcbRenameHistory } from "../src/current-pcb-rename-history.ts";

const ACTOR = "c".repeat(32), BOARD = "d".repeat(16), CLIENT = "b".repeat(16), TARGET = "a".repeat(16);
function input(): {
  targetUuid: string; beforeMetaText: string; desiredTitle: string; maximumTargetHeaderTime: number; client: string; maximumTicket: number;
  documentTime: number; backendTime: number; documentClock: { minimumMs: number; maximumMs: number };
  backendClock: { minimumMs: number; maximumMs: number }; backendActor: { uuid: string; username: string; nickname: string };
} {
  return { targetUuid: TARGET, beforeMetaText: JSON.stringify({ title: "Original Ω", parent: "", source: "", board: BOARD, zIndex: null }),
    desiredTitle: "New Ω", maximumTargetHeaderTime: 199, client: CLIENT, maximumTicket: 50, documentTime: 200, backendTime: 250,
    documentClock: { minimumMs: 200, maximumMs: 220 }, backendClock: { minimumMs: 240, maximumMs: 260 },
    backendActor: { uuid: ACTOR, username: "Synthetic user", nickname: "Actor Ω" } };
}

void test("PCB rename projects exact current native framing, ordering, clocks and one ticket", () => {
  const original = input();
  const before = structuredClone(original), plan = prepareCurrentPcbRenameHistory(original);
  const meta = `{"title":"New Ω","parent":"","source":"","board":"${BOARD}","zIndex":null}`;
  const records = `{"type":"DOCHEAD","ticket":51}||{"docType":"PCB","client":"${CLIENT}","uuid":"${TARGET}","updateTime":200,"version":"200","editVersion":"3.2.206"}|\n` +
    `{"type":"META","ticket":51,"id":"META"}||${meta}`;
  const chunk = `{"type":"EDIT_HEAD"}||{"uuid":"${ACTOR}","username":"Synthetic user","nickname":"Actor Ω","updateTime":250}|\n${records}`;
  assert.equal(plan.afterMetaText, meta); assert.equal(plan.recordsText, records); assert.equal(plan.chunkText, chunk);
  assert.equal(plan.expectedTicket, 51); assert.equal(plan.documentTime, 200); assert.equal(plan.backendTime, 250);
  assert.equal(plan.recordsSha256, createHash("sha256").update(records).digest("hex"));
  assert.equal(plan.chunkSha256, createHash("sha256").update(chunk).digest("hex"));
  assert.deepEqual(original, before); assert.ok(Object.isFrozen(plan));
  const result = verifyCurrentPcbRenameHistory(plan, chunk);
  assert.equal(result.exactAppendedChunk, true); assert.ok(Object.isFrozen(result));
  for (const key of ["executionAuthorized", "producerBindingVerified", "completeHistoryVerified", "actorProvenanceVerified",
    "clockProvenanceVerified", "queueCompletionVerified", "fullSqlVerified", "reopened"] as const) {
    assert.equal(plan[key], false); assert.equal(result[key], false);
  }
});

void test("PCB rename preserves exact Unicode and escaping without confusing the two actors", () => {
  const value = input(); value.desiredTitle = String.raw`Title "Ω" \ board`; value.backendActor.username = ""; value.backendActor.nickname = "";
  const plan = prepareCurrentPcbRenameHistory(value);
  assert.ok(plan.chunkText.includes(`"uuid":"${ACTOR}","username":"","nickname":""`));
  assert.ok(plan.recordsText.includes(JSON.stringify(value.desiredTitle)));
  assert.equal(plan.recordsText.includes('"user":'), false); assert.equal(plan.recordsText.includes(ACTOR), false);
  assert.equal(plan.recordsText.endsWith("|\n"), false);
});

void test("PCB rename refuses non-null zIndex rather than accepting native normalization", () => {
  for (const zIndex of [0, -0, 1, -1, 0.5, "0"]) {
    assert.throws(() => prepareCurrentPcbRenameHistory({ ...input(), beforeMetaText: JSON.stringify({ title: "Original Ω", parent: "", source: "", board: BOARD, zIndex }) }));
  }
});

void test("PCB rename refuses inherited, incomplete or unknown baseline metadata", () => {
  const meta: Record<string, unknown> = { title: "Original Ω", parent: "", source: "", board: BOARD, zIndex: null };
  for (const altered of [{ ...meta, parent: TARGET }, { ...meta, source: TARGET }, { ...meta, extra: true },
    { ...meta, board: "missing" }, { title: meta["title"], parent: "", source: "", board: BOARD }]) {
    assert.throws(() => prepareCurrentPcbRenameHistory({ ...input(), beforeMetaText: JSON.stringify(altered) }));
  }
});

void test("PCB rename rejects duplicate keys, changed native key order and alternate JSON encodings", () => {
  const before = input().beforeMetaText;
  for (const beforeMetaText of [` ${before}`, `${before}\n`, before.replace('"parent":""', '"parent":"other","parent":""'),
    before.replace('"parent":"","source":""', '"source":"","parent":""'), before.replace("Ω", String.raw`\u03a9`)]) {
    assert.throws(() => prepareCurrentPcbRenameHistory({ ...input(), beforeMetaText }), /serialization/u);
  }
});

void test("PCB rename uses independent backend and document windows and excludes old headers", () => {
  for (const altered of [{ documentTime: 199 }, { documentTime: 221 }, { backendTime: 239 }, { backendTime: 261 },
    { maximumTargetHeaderTime: 200 }, { documentClock: { minimumMs: 201, maximumMs: 220 } },
    { backendClock: { minimumMs: 251, maximumMs: 260 } }, { documentClock: { minimumMs: 100, maximumMs: 60_101 } },
    { backendClock: { minimumMs: 260, maximumMs: 240 } }]) {
    assert.throws(() => prepareCurrentPcbRenameHistory({ ...input(), ...altered }));
  }
  assert.equal(prepareCurrentPcbRenameHistory(input()).documentTime, 200);
});

void test("PCB rename rejects unsafe clocks, tickets, identities and titles before projection", () => {
  for (const field of ["documentTime", "backendTime", "maximumTargetHeaderTime", "maximumTicket"] as const) {
    for (const value of [-0, -1, 1.5, Infinity, Number.NaN, Number.MAX_SAFE_INTEGER + 1]) {
      assert.throws(() => prepareCurrentPcbRenameHistory({ ...input(), [field]: value }));
    }
  }
  for (const altered of [{ maximumTicket: Number.MAX_SAFE_INTEGER }, { targetUuid: "invalid" }, { client: ACTOR },
    { desiredTitle: "Original Ω" }, { desiredTitle: "" }, { desiredTitle: " leading" }, { desiredTitle: "trailing " },
    { desiredTitle: "line\nbreak" }, { desiredTitle: "a".repeat(513) }, { backendActor: { uuid: ACTOR, username: "a".repeat(1025), nickname: "" } }]) {
    assert.throws(() => prepareCurrentPcbRenameHistory({ ...input(), ...altered }));
  }
});

void test("PCB rename refuses invalid UTF8 inputs instead of replacing them during hashing", () => {
  for (const altered of [{ beforeMetaText: "Ω".repeat(16_385) }, { desiredTitle: "\uD800" },
    { backendActor: { uuid: ACTOR, username: "\uD800", nickname: "" } }]) {
    assert.throws(() => prepareCurrentPcbRenameHistory({ ...input(), ...altered }), /UTF8|serialization/u);
  }
});

void test("PCB rename chunk comparison rejects all unmodeled appends, actor and clock substitutions", () => {
  const plan = prepareCurrentPcbRenameHistory(input());
  for (const value of [plan.recordsText, `${plan.chunkText}|\n`, `${plan.chunkText}|\n${plan.recordsText}`,
    plan.chunkText.replace(ACTOR, "e".repeat(32)), plan.chunkText.replace('"updateTime":250', '"updateTime":251'),
    plan.chunkText.replace('"ticket":51', '"ticket":52'), plan.chunkText.replace('"editVersion":"3.2.206"', '"editVersion":"3.2.205"'),
    plan.chunkText.replace('"zIndex":null', '"zIndex":0'), null, {}]) {
    assert.throws(() => verifyCurrentPcbRenameHistory(plan, value), /complete appended chunk/u);
  }
  assert.throws(() => verifyCurrentPcbRenameHistory(structuredClone(plan), plan.chunkText), /original/u);
});

void test("PCB rename snapshots own data and refuses caller getters without invoking them", () => {
  let calls = 0;
  const getter = { get documentTime(): number { calls += 1; return 200; } };
  assert.throws(() => prepareCurrentPcbRenameHistory(Object.defineProperty(input(), "documentTime", Object.getOwnPropertyDescriptor(getter, "documentTime") ?? {})), /accessors/u);
  const nestedGetter = (): number => { calls += 1; return 200; };
  for (const field of ["backendActor", "backendClock", "documentClock"] as const) {
    const original = input();
    const nested = original[field];
    const key = Object.keys(nested)[0]; assert.ok(key !== undefined);
    Object.defineProperty(nested, key, { get: nestedGetter, enumerable: true });
    assert.throws(() => prepareCurrentPcbRenameHistory(original), /accessors/u);
  }
  assert.equal(calls, 0);
  assert.throws(() => prepareCurrentPcbRenameHistory({ ...input(), extra: true }), /fields/u);
  const original = input(), plan = prepareCurrentPcbRenameHistory(original);
  original.backendActor.nickname = "Changed"; original.documentClock.minimumMs = 201;
  assert.equal(verifyCurrentPcbRenameHistory(plan, plan.chunkText).exactAppendedChunk, true);
});
