/** Passive data/privacy checks. Original-runner and workflow regressions cover
 * the real capture scheduling separately; these tests issue no native request. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { captureCurrentSelectedFileMainSqlStartupPauseLocations as capture, createCurrentSelectedFileMainSqlStartupRefusalContext as context,
  currentSelectedFileMainSqlStartupRefusalContextSchema as schema } from "../src/current-selected-file-main-sql-startup-refusal-context.ts";

const progress = Object.freeze({ currentVersionObserved: true, jbCallsConsumed: 0, dcCallsConsumed: 0,
  profileSqlOnly: true, cookieUpdatesAdmitted: false, selectedProjectWriteGrant: false, nativeCompletionProven: false });
const point = (scriptId = "original-app", lineNumber = 0, columnNumber = 1): object => ({ scriptId, lineNumber, columnNumber });
const locations = (): ReturnType<typeof capture> => capture([point()], "original-app", "abc\nxy\n");

void test("only original-script locations inside the original source survive, with every omission counted", () => {
  const frames = capture([point(), point("foreign-handle"), point("original-app", 9), point("original-app", 1, 2), point("original-app", 2, 0)], "original-app", "abc\nxy\n");
  assert.deepEqual(frames, { totalFrames: 5, omittedForeignScript: 1, omittedOutsideSource: 2,
    locations: [{ frameIndex: 0, lineNumber: 0, columnNumber: 1 }, { frameIndex: 3, lineNumber: 1, columnNumber: 2 }] });
  const packet = context("run", "selection-unrecognized", { recognized: false }, progress, frames);
  assert.deepEqual(packet.selection, { state: "returned", recognized: false }); assert.deepEqual(packet.progress, progress);
  assert.equal(packet.additionalRequests, 0); assert.equal(packet.resumeAuthorized, false); assert.equal(packet.executionAuthorized, false); assert.equal(packet.saveAuthorized, false);
  assert.equal(packet.selectionReevaluated, false); assert.equal(packet.callStackReevaluated, false);
  assert.ok(Object.isFrozen(packet) && Object.isFrozen(packet.callFrames.locations) && Object.isFrozen(packet.progress));
  assert.equal(JSON.stringify(packet).includes("foreign-handle"), false); assert.equal(JSON.stringify(packet).includes("original-app"), false);
  const complete = capture(Array.from({ length: 64 }, (_value, index) => point(index === 63 ? "original-app" : "foreign")), "original-app", "abc");
  assert.equal(complete.totalFrames, 64); assert.equal(complete.omittedForeignScript, 63); assert.equal(complete.locations[0]?.frameIndex, 63);
  assert.throws(() => capture(Array.from({ length: 65 }, () => point()), "original-app", "abc"));
  assert.throws(() => capture([], "original-app", "abc"));
});

void test("selection summaries preserve exact fixed fields while SQL, paths, handles and error data stay absent", () => {
  const privateSql = String.raw`DELETE FROM private_table WHERE path='C:\private\design'`;
  const packet = context("run", "selection-sequence-refused", { recognized: true, role: "jb", site: "run", sql: privateSql,
    parametersEmpty: false, transactionDepth: 1, designWriteGrant: false, nativeCompletionProven: false }, progress, locations());
  assert.deepEqual(packet.selection, { state: "returned", recognized: true, role: "jb", site: "run", parametersEmpty: false, transactionDepth: 1, sqlPresent: true });
  const text = JSON.stringify(packet);
  for (const forbidden of [privateSql, "private_table", String.raw`C:\private`, "sqlSha256", "functionName", "url", "stack", "objectId", "scriptId"]) { assert.equal(text.includes(forbidden), false); }
  assert.deepEqual(context("run", "tracker-absent", null, progress, locations()).selection, { state: "not-attempted" });
  assert.deepEqual(context("run", "selection-reply-refused", null, progress, locations()).selection, { state: "reply-refused" });
  assert.throws(() => schema.parse({ ...packet, sql: privateSql }));
  assert.throws(() => schema.parse({ ...packet, reason: "selection-unrecognized" }));
  assert.throws(() => schema.parse({ ...packet, callFrames: { ...packet.callFrames, omittedOutsideSource: 1 } }));
  assert.throws(() => context("prepare", "selection-sequence-refused", { recognized: true, role: "jb", site: "run", sql: privateSql,
    parametersEmpty: true, transactionDepth: 1, designWriteGrant: false, nativeCompletionProven: false }, progress, locations()));
});

void test("hostile optional data invokes no getters, proxy traps or serialization hooks", () => {
  let hooks = 0;
  const poison = Object.defineProperty({}, "recognized", { enumerable: true, get: (): never => { hooks += 1; throw new Error("private error"); } });
  const proxy = new Proxy({}, { ownKeys: (): never => { hooks += 1; throw new Error("private proxy"); }, getPrototypeOf: (): never => { hooks += 1; throw new Error("private prototype"); } });
  for (const value of [poison, proxy, { recognized: false, sql: "private" }, { recognized: false, toJSON: (): never => { hooks += 1; throw new Error("private serialization"); } }]) {
    assert.throws(() => context("run", "selection-unrecognized", value, progress, locations()));
  }
  const frame = Object.defineProperty({ scriptId: "original-app", lineNumber: 0 }, "columnNumber", { enumerable: true, get: (): never => { hooks += 1; throw new Error("private frame"); } });
  assert.throws(() => capture([frame], "original-app", "abc")); assert.throws(() => capture([proxy], "original-app", "abc"));
  const snapshot = Object.defineProperty({}, "currentVersionObserved", { enumerable: true, get: (): never => { hooks += 1; throw new Error("private progress"); } });
  assert.throws(() => context("run", "tracker-absent", null, snapshot, locations()));
  const sql = Object.defineProperty({ recognized: true, role: "jb", site: "run", parametersEmpty: true, transactionDepth: 1,
    designWriteGrant: false, nativeCompletionProven: false }, "sql", { enumerable: true, get: (): never => { hooks += 1; throw new Error("private SQL"); } });
  assert.throws(() => context("run", "selection-sequence-refused", sql, progress, locations()));
  assert.equal(hooks, 0);
});
