/** Focused synthetic coverage for the inverse DELETE continuation and drain regressions. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { sha256Text } from "../src/core.ts";
import { CurrentFootprintInverseNativeDeleteDrainCursor } from "../src/current-footprint-inverse-native-delete-drain-cursor.ts";
import type { CurrentFootprintInverseNativeDeleteDrainHeld } from "../src/current-footprint-inverse-native-delete-drain-cursor.ts";
import type { CurrentFootprintInverseNativeDeleteDrainCommand as DrainCommand } from "../src/current-footprint-inverse-native-delete-drain-protocol.ts";
import { CurrentFootprintInverseNativeDeleteLocalCursor } from "../src/current-footprint-inverse-native-delete-local-cursor.ts";
import type { CurrentFootprintInverseNativeDeleteLocalCommand } from "../src/current-footprint-inverse-native-delete-local-protocol.ts";
import { CURRENT_PCB_VIA_LOCAL_KEY_CALLEES as KEY_CALLEES } from "../src/current-pcb-via-local-key-source.ts";
import type { CurrentFootprintSavedFlowCacheData } from "../src/current-footprint-saved-flow-cache-data.ts";

const fulfilled = (): Promise<void> => Promise.resolve();
const object = (objectId: string): Readonly<{ type: "object"; className: "Object"; objectId: string }> =>
  ({ type: "object", className: "Object", objectId });
const promise = (objectId: string): Readonly<Record<string, string>> =>
  ({ type: "object", className: "Promise", subtype: "promise", description: "Promise", objectId });
const remoteArray = (objectId: string, count: number): unknown =>
  ({ result: { type: "object", subtype: "array", className: "Array", description: `Array(${String(count)})`, objectId } });
const booleanReply = (value: boolean): unknown => ({ result: { type: "boolean", value } });
function fields(values: readonly unknown[]): unknown {
  return {
    result: [
      ...values.map((value, index) => ({ name: String(index), value, writable: true, configurable: true, enumerable: true, isOwn: true })),
      { name: "length", value: { type: "number", value: values.length }, writable: true, configurable: false, enumerable: false, isOwn: true },
    ],
    internalProperties: [{ name: "[[Prototype]]", value: { type: "object", subtype: "array", objectId: "array.prototype" } }],
  };
}
function arrayWith(length: number, index: number, value: unknown): unknown {
  return fields(Array.from({ length }, (_, slot) => slot === index ? value : { type: "undefined" }));
}
function promiseProperties(state: "pending" | "fulfilled", cloud = false): unknown {
  return { result: [], internalProperties: [
    { name: "[[Prototype]]", value: { ...object("promise.prototype"), className: "Promise", description: "Promise" } },
    { name: "[[PromiseState]]", value: { type: "string", value: state } },
    { name: "[[PromiseResult]]", value: cloud && state === "fulfilled" ? object("cloud.settled") : { type: "undefined" } },
  ] };
}

const body = "synthetic tombstone";
const branchUuid = "a".repeat(32);
const historyUuid = "b".repeat(32);
const cacheBody = { historyUuid, ordinal: 0, url: `https://client/dataStr/${historyUuid}-FOOTPRINT`, body, sha256: sha256Text(body) };
const liveData: CurrentFootprintSavedFlowCacheData = {
  schema: "private.current-footprint-saved-flow-cache-data.v1", projectUuid: "c".repeat(64), branchUuid, headHistoryUuid: historyUuid,
  projectionSourceSha256: "d".repeat(64), namespace: "synthetic",
  bodies: [cacheBody], headIndex: { url: "https://client/index/synthetic", body: "index", sha256: sha256Text("index") },
  suppliedObservationsOnly: true, nativeWorkerOwnershipVerified: false, cacheContinuationAuthorized: false, completeUploadFrontierVerified: false,
};
function drainReply(command: DrainCommand, pending: boolean): unknown {
  if (command.phase === "inverse-native-delete-drain-properties") {
    if (command.role === "replyFrame") { return arrayWith(9, 8, object("reply.object")); }
    if (command.role === "capture") { return arrayWith(7, 6, promise("cloud.promise")); }
    if (command.role === "queued") { return arrayWith(10, 9, promise("queued.promise")); }
    if (command.role === "cloudFrame") { return arrayWith(8, 7, object("cloud.object")); }
    if (command.role === "settled") { return promiseProperties(pending && command.slot === 3 ? "pending" : "fulfilled", command.slot === 6); }
    assert.fail(`Unexpected drain properties role ${command.role}`);
  }
  assert.equal(command.phase, "inverse-native-delete-drain-call");
  if (command.kind === "retain") { return { result: promise(command.params.objectId) }; }
  if (command.role === "capture") { return remoteArray("drain.capture", 7); }
  return booleanReply(command.role !== "final");
}
function drainHold(role: CurrentFootprintInverseNativeDeleteDrainHeld["role"]): CurrentFootprintInverseNativeDeleteDrainHeld {
  return { packet: {}, role, joinedId: role, key: null, cache: null, promise: null, returnPromiseId: `return.${role}` };
}
function cacheHolds(role: "localSave" | "flow" | "syncHead", key: string): readonly CurrentFootprintInverseNativeDeleteDrainHeld[] {
  return (["headEntry", "headPromise", "headSuccess"] as const).map(step => ({
    packet: {}, role: step, key, joinedId: `${role}.${step}`, cache: { role, joinedId: `${role}.entry` }, promise: { objectId: `${role}.promise` }, returnPromiseId: null,
  }));
}
for (const pending of [true, false]) {
  void test(`the last inverse drain settlement fails with ${pending ? "a pending original promise" : "two false final proofs"}`, async () => {
    const holds = [
      drainHold("historyReply"), drainHold("detachedEntry"), ...cacheHolds("localSave", "local.save"),
      ...(["cacheDeleteCall", "cacheDeleteReturned", "detachedReturned", "syncEntry", "syncDeferred", "historyQueued", "historyFinally",
        "cloudReturned", "cloudFinally"] as const).map(role => drainHold(role)),
      ...cacheHolds("flow", cacheBody.url), ...cacheHolds("syncHead", liveData.headIndex.url),
      drainHold("batchReturned"), drainHold("bufferDone"),
    ];
    const original = new Map(holds.map(held => [held.packet, held]));
    const failures: unknown[] = [];
    const cursor = new CurrentFootprintInverseNativeDeleteDrainCursor({
      local: { scheduledFrame: "scheduled.frame", bodyFrame: "body.frame", cacheFrame: "cache.frame", putPromise: "put.promise", bufferPromise: "buffer.promise" },
      uploadCapture: "upload.capture", historyFrame: "history.frame", body, branchUuid, reflection: "reflection", recipe: "recipe", dependencies: "dependencies",
      assertCurrent: fulfilled, requireHeld: (packet): CurrentFootprintInverseNativeDeleteDrainHeld => { const held = original.get(packet); assert.ok(held); return held; },
      historyResult: (): Promise<Readonly<{ historyUuid: string; bodySha256: string }>> => Promise.resolve({ historyUuid, bodySha256: sha256Text(body) }),
      liveData: (): Promise<CurrentFootprintSavedFlowCacheData> => Promise.resolve(liveData),
      postSyncProgress: (): Readonly<{ replayResumed: boolean; completed: boolean }> => ({ replayResumed: true, completed: true }),
      request: (command): Promise<unknown> => Promise.resolve(drainReply(command, pending)),
      qualifyHelper: fulfilled, resume: fulfilled, continueDelete: fulfilled,
      complete: (): never => assert.fail("An unsettled drain cannot complete"),
      fail: (error): void => { failures.push(error); },
    });
    for (const held of holds) { await cursor.continue(held.packet); }
    assert.deepEqual(cursor.progress(), { acknowledgedResumes: 22, canSettle: true, completed: false, failed: false, settlementPasses: 1, wholeInverseVerified: false });
    await assert.rejects(cursor.settle(), /INVERSE_NATIVE_DELETE_DRAIN_SETTLEMENT_EXHAUSTED/u);
    assert.deepEqual(cursor.progress(), { acknowledgedResumes: 22, canSettle: false, completed: false, failed: true, settlementPasses: 2, wholeInverseVerified: false });
    assert.equal(failures.length, 1);
  });
}

void test("local continuation uses the retained body binding and preserves its continuation failure", async () => {
  const packet = {}, stopped = new Error("continuation proof failed");
  const held = { packet, role: "localIngress" as const, joinedId: "local.join", callFrameId: "local.frame", key: null, cache: null, promise: null, bufferPromise: null };
  const bindings = {
    scriptId: "fixture.script", body, bodyObject: "original.body", branchUuid, assertCurrent: fulfilled,
    requireHeld: (): typeof held => held,
    request: (command: CurrentFootprintInverseNativeDeleteLocalCommand): Promise<unknown> => {
      if (command.method === "Debugger.evaluateOnCallFrame") { return Promise.resolve(remoteArray("key.array", 2)); }
      if (command.method === "Runtime.callFunctionOn") {
        assert.deepEqual(command.params.arguments, [{ objectId: "original.body" }]);
        return Promise.resolve(booleanReply(true));
      }
      assert.equal(command.phase, "inverse-native-delete-local-key-properties");
      if (command.role === "tuple") { return Promise.resolve(fields([object("first"), object("second")])); }
      const profile = KEY_CALLEES.find(entry => entry.name === command.role);
      assert.ok(profile);
      return Promise.resolve({
        result: [
          { name: "name", value: { type: "string", value: profile.name }, writable: false, enumerable: false, configurable: true, isOwn: true },
          { name: "length", value: { type: "number", value: profile.arity }, writable: false, enumerable: false, configurable: true, isOwn: true },
          { name: "prototype", value: object("callee.prototype"), writable: true, enumerable: false, configurable: false, isOwn: true },
        ],
        internalProperties: [
          { name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: { scriptId: "fixture.script", lineNumber: profile.lineNumber, columnNumber: profile.columnNumber } } },
          { name: "[[Prototype]]", value: { type: "function", className: "Function", description: "function () { [native code] }", objectId: "function.prototype" } },
          { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", description: "Scopes[1]", objectId: "function.scopes" } },
        ],
      });
    },
    qualifyHelper: fulfilled, resume: (): Promise<never> => Promise.reject(stopped),
    fail: (): never => { throw new Error("notification failed"); },
  };
  const cursor = new CurrentFootprintInverseNativeDeleteLocalCursor(bindings);
  bindings.bodyObject = "substituted.body";
  await assert.rejects(cursor.continue(packet), stopped);
  assert.equal(cursor.progress().failed, true);
});
