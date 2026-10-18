/** Synthetic current native-shaped records only. No app, project or SQL access. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { prepareCurrentSchematicRenameHistory, verifyCurrentSchematicRenameHistory } from "../src/current-schematic-rename-history.ts";

const ACTOR = "c".repeat(32), BOARD = "d".repeat(16), CLIENT = "b".repeat(16), TARGET = "a".repeat(16);
function input(): {
  targetUuid: string; beforeMetaText: string; desiredTitle: string; maximumTargetHeaderTime: number; client: string; maximumTicket: number;
  documentTime: number; backendTime: number; documentClock: { minimumMs: number; maximumMs: number };
  backendClock: { minimumMs: number; maximumMs: number }; backendActor: { uuid: string; username: string; nickname: string };
} {
  return { targetUuid: TARGET, beforeMetaText: JSON.stringify({ title: "Original Ω", source: "", board: BOARD, zIndex: null }),
    desiredTitle: "Container Ω", maximumTargetHeaderTime: 199, client: CLIENT, maximumTicket: 50, documentTime: 200, backendTime: 250,
    documentClock: { minimumMs: 200, maximumMs: 220 }, backendClock: { minimumMs: 240, maximumMs: 260 },
    backendActor: { uuid: ACTOR, username: "Synthetic actor", nickname: "Ω" } };
}

void test("SCH history projects exact container framing, ordered META, separate clocks and one ticket", () => {
  const original = input();
  const copy = structuredClone(original), plan = prepareCurrentSchematicRenameHistory(original);
  const meta = `{"title":"Container Ω","source":"","board":"${BOARD}","zIndex":null}`;
  const records = `{"type":"DOCHEAD","ticket":51}||{"docType":"SCH","client":"${CLIENT}","uuid":"${TARGET}","updateTime":200,"version":"200","editVersion":"3.2.206"}|\n` +
    `{"type":"META","ticket":51,"id":"META"}||${meta}`;
  const chunk = `{"type":"EDIT_HEAD"}||{"uuid":"${ACTOR}","username":"Synthetic actor","nickname":"Ω","updateTime":250}|\n${records}`;
  assert.equal(plan.afterMetaText, meta); assert.equal(plan.recordsText, records); assert.equal(plan.chunkText, chunk);
  assert.equal(plan.expectedTicket, 51); assert.equal(plan.documentTime, 200); assert.equal(plan.backendTime, 250);
  assert.equal(plan.recordsSha256, createHash("sha256").update(records).digest("hex"));
  assert.equal(plan.chunkSha256, createHash("sha256").update(chunk).digest("hex"));
  assert.deepEqual(original, copy); assert.ok(Object.isFrozen(plan));
  const checked = verifyCurrentSchematicRenameHistory(plan, chunk); assert.equal(checked.exactAppendedChunk, true);
  assert.ok(Object.isFrozen(checked));
  for (const key of ["executionAuthorized", "producerBindingVerified", "completeHistoryVerified", "actorProvenanceVerified",
    "clockProvenanceVerified", "nativeNamePolicyVerified", "queueCompletionVerified", "fullSqlVerified", "reopened"] as const) {
    assert.equal(plan[key], false); assert.equal(checked[key], false);
  }
});
void test("SCH history preserves escaping and empty backend names without adding a DOCHEAD user", () => {
  const value = input(); value.desiredTitle = String.raw`Container "Ω" \ reference`; value.backendActor.username = ""; value.backendActor.nickname = "";
  const plan = prepareCurrentSchematicRenameHistory(value);
  assert.ok(plan.recordsText.includes(JSON.stringify(value.desiredTitle))); assert.equal(plan.recordsText.includes('"user":'), false);
  assert.equal(plan.recordsText.includes(ACTOR), false); assert.equal(plan.recordsText.includes('"parent":'), false);
  assert.equal(plan.recordsText.endsWith("|\n"), false);
});
void test("SCH history refuses PCB/sheet metadata, inherited or unknown fields and native zIndex normalization", () => {
  const meta = { title: "Original Ω", source: "", board: BOARD, zIndex: null };
  for (const altered of [{ ...meta, parent: "" }, { ...meta, schematic: TARGET }, { ...meta, source: TARGET },
    { ...meta, board: "invalid" }, { ...meta, extra: true }, { title: "Original Ω", source: "", board: BOARD }]) {
    assert.throws(() => prepareCurrentSchematicRenameHistory({ ...input(), beforeMetaText: JSON.stringify(altered) }));
  }
  for (const zIndex of [0, -0, 1, -1, 0.5, "0"]) {
    assert.throws(() => prepareCurrentSchematicRenameHistory({ ...input(), beforeMetaText: JSON.stringify({ ...meta, zIndex }) }));
  }
});
void test("SCH history refuses duplicate keys, native order drift and alternate JSON encodings", () => {
  const before = input().beforeMetaText;
  for (const beforeMetaText of [` ${before}`, `${before}\n`, before.replace('"source":""', '"source":"other","source":""'),
    before.replace(`"source":"","board":"${BOARD}"`, `"board":"${BOARD}","source":""`), before.replace("Ω", String.raw`\u03a9`)]) {
    assert.throws(() => prepareCurrentSchematicRenameHistory({ ...input(), beforeMetaText }), /serialization/u);
  }
});
void test("SCH history keeps independent clock windows and refuses old/unsafe stamps and tickets", () => {
  for (const altered of [{ documentTime: 199 }, { documentTime: 221 }, { backendTime: 239 }, { backendTime: 261 },
    { maximumTargetHeaderTime: 200 }, { documentClock: { minimumMs: 220, maximumMs: 200 } },
    { backendClock: { minimumMs: 240, maximumMs: 60_241 } }, { maximumTicket: Number.MAX_SAFE_INTEGER }]) {
    assert.throws(() => prepareCurrentSchematicRenameHistory({ ...input(), ...altered }));
  }
  for (const field of ["documentTime", "backendTime", "maximumTargetHeaderTime", "maximumTicket"] as const) {
    for (const value of [-0, -1, 0.5, Infinity, Number.NaN, Number.MAX_SAFE_INTEGER + 1]) {
      assert.throws(() => prepareCurrentSchematicRenameHistory({ ...input(), [field]: value }));
    }
  }
});
void test("SCH history refuses invalid titles, identities and UTF8 instead of replacing data", () => {
  for (const altered of [{ targetUuid: "invalid" }, { client: ACTOR }, { desiredTitle: "Original Ω" }, { desiredTitle: "" },
    { desiredTitle: " leading" }, { desiredTitle: "trailing " }, { desiredTitle: "line\nbreak" }, { desiredTitle: "a".repeat(513) },
    { desiredTitle: "\uD800" }, { beforeMetaText: "Ω".repeat(16_385) },
    { backendActor: { uuid: ACTOR, username: "\uD800", nickname: "" } }]) {
    assert.throws(() => prepareCurrentSchematicRenameHistory({ ...input(), ...altered }));
  }
});
void test("SCH history comparison refuses extra writes, changed kinds/actors/clocks and copied projections", () => {
  const plan = prepareCurrentSchematicRenameHistory(input());
  for (const value of [plan.recordsText, `${plan.chunkText}|\n`, `${plan.chunkText}|\n${plan.recordsText}`,
    plan.chunkText.replace('"SCH"', '"SCH_PAGE"'), plan.chunkText.replace('"SCH"', '"PCB"'),
    plan.chunkText.replace(ACTOR, "e".repeat(32)), plan.chunkText.replace('"updateTime":250', '"updateTime":251'),
    plan.chunkText.replace('"ticket":51', '"ticket":52'), plan.chunkText.replace('"zIndex":null', '"zIndex":0'), null, {}]) {
    assert.throws(() => verifyCurrentSchematicRenameHistory(plan, value), /complete appended chunk/u);
  }
  assert.throws(() => verifyCurrentSchematicRenameHistory(structuredClone(plan), plan.chunkText), /original/u);
});
void test("SCH history snapshots own data and rejects accessors without calling them", () => {
  let calls = 0;
  const getter = (): number => { calls += 1; return 200; };
  assert.throws(() => prepareCurrentSchematicRenameHistory(Object.defineProperty(input(), "documentTime", { get: getter })), /accessors/u);
  for (const field of ["backendActor", "backendClock", "documentClock"] as const) {
    const original = input();
    const key = Object.keys(original[field])[0]; assert.ok(key !== undefined);
    Object.defineProperty(original[field], key, { get: getter, enumerable: true });
    assert.throws(() => prepareCurrentSchematicRenameHistory(original), /accessors/u);
  }
  assert.equal(calls, 0); assert.throws(() => prepareCurrentSchematicRenameHistory({ ...input(), extra: true }), /fields/u);
  const original = input(), plan = prepareCurrentSchematicRenameHistory(original);
  original.backendActor.nickname = "Changed"; original.documentClock.minimumMs = 201;
  assert.equal(verifyCurrentSchematicRenameHistory(plan, plan.chunkText).exactAppendedChunk, true);
});
