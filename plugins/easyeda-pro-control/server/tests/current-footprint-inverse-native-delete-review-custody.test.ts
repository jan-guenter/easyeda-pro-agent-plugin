/** Focused synthetic coverage for inverse DELETE queue, frame and Main custody. */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  currentFootprintInverseNativeDeleteDrainCall as call,
  currentFootprintInverseNativeDeleteDrainNativeFrame as decodeFrame,
  currentFootprintInverseNativeDeleteDrainWire as wire,
} from "../src/current-footprint-inverse-native-delete-drain-protocol.ts";
import type { CurrentFootprintInverseNativeDeleteDrainCommand as DrainCommand } from "../src/current-footprint-inverse-native-delete-drain-protocol.ts";
import { CurrentFootprintInverseNativeDeleteDrainRequestQueue } from "../src/current-footprint-inverse-native-delete-drain-request-queue.ts";
import { CurrentFootprintInverseNativeDeleteMainBeginCustody } from "../src/current-footprint-inverse-native-delete-main-begin-custody.ts";
import type { CurrentFootprintInverseNativeDeleteMainBeginPause } from "../src/current-footprint-inverse-native-delete-main-begin-custody.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_BEGIN_CALLS as BEGIN_CALLS } from "../src/current-footprint-inverse-native-delete-main-begin-programs.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_BEGIN_SITES as BEGIN_SITES, currentFootprintInverseNativeDeleteMainBeginNativeCases } from "../src/current-footprint-inverse-native-delete-main-begin-protocol.ts";
import type { CurrentFootprintInverseNativeDeleteMainBeginCall as BeginCall } from "../src/current-footprint-inverse-native-delete-main-begin-protocol.ts";
import { CurrentFootprintInverseNativeDeleteMainReadCustody } from "../src/current-footprint-inverse-native-delete-main-read-custody.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_READS as READS } from "../src/current-footprint-inverse-native-delete-main-read-protocol.ts";
import { CurrentFootprintInverseNativeDeleteWorkerRequestQueue } from "../src/current-footprint-inverse-native-delete-worker-request-queue.ts";

const noOperation = (): void => {
  // The synthetic owner remains current.
};
const fulfilled = (): Promise<void> => Promise.resolve();
const historyUuid = "b".repeat(32);
const flowCall = (index: string, contents: string): DrainCommand => call("cache", "flow", "original.receiver",
    [{ objectId: "entry" }, { objectId: "capture" }, { value: index }, { value: contents }, { value: historyUuid },
      { value: "FOOTPRINT" }, { value: 0 }, { objectId: "reflection" }, { objectId: "recipe" }, { objectId: "dependencies" }], 1);

void test("both request queues reserve the helper family until qualification or original exit", async () => {
  for (const queue of [new CurrentFootprintInverseNativeDeleteDrainRequestQueue(), new CurrentFootprintInverseNativeDeleteWorkerRequestQueue()]) {
    const helper = { family: "local", helper: "script", helperFor: null } as const;
    const ordinary = { family: "local", helper: null, helperFor: null } as const;
    await queue.enqueue(helper, noOperation, fulfilled);
    assert.throws(() => queue.enqueue(ordinary, noOperation, fulfilled), /REQUEST_QUEUE/u);
    await queue.enqueue({ ...ordinary, helperFor: "script" }, noOperation, fulfilled);
    await queue.enqueue(helper, noOperation, fulfilled);
    await queue.settleAfterOriginalExit(noOperation);
    assert.deepEqual(queue.retained(), { waiting: 0, active: false, helperPending: false, failed: false, ended: true });
  }
});

void test("the exact drain command cap excludes the wire-only fields", () => {
  const remaining = 65_280 - Buffer.byteLength(JSON.stringify(flowCall("x", "x")));
  const left = Math.floor(remaining / 4);
  const command = flowCall(`${"\\".repeat(left)}x`, `${"\\".repeat(Math.floor(remaining / 2) - left)}${"y".repeat(remaining % 2)}x`);
  assert.equal(Buffer.byteLength(JSON.stringify(command)), 65_280);
  const frame = Buffer.from(`${JSON.stringify(wire(command, 1, "s"))}\0`);
  assert.ok(frame.length > 65_280 && frame.length <= 65_536);
  assert.equal(decodeFrame(frame, command, "s")["requestId"], 1);
  assert.throws(() => decodeFrame(frame, command, "other"), /DRAIN_FRAME/u);
});

void test("Main read custody retains a relocated breakpoint before refusing the source site", async () => {
  const points = new Map<string, number>();
  const scriptId = "original.script";
  const custody = new CurrentFootprintInverseNativeDeleteMainReadCustody("branch", {
    origin: { profile: "private.current-footprint-inverse-native-delete-main-request-origin.v1" },
    scriptId, sqlCaptureObjectId: "sql.capture", persistentDriverBreakpointId: "driver.point",
    assertCurrent: noOperation, pendingRequestId: (): number => 1, busy: (): boolean => true,
    expected: (): never => assert.fail("No read is expected after a rejected arm"), pause: (): never => assert.fail("Arm must stay independent of pauses"),
    resume: (): never => assert.fail("A relocated point grants no resume"), fail: noOperation,
    registerPoint: (id, location): void => { points.set(id, location.columnNumber); },
    removePoint: (id): void => { points.delete(id); }, pointCurrent: (id): boolean => points.has(id),
    send: (command): Promise<unknown> => {
      custody.consume(command, 1);
      assert.equal(command.phase, "inverse-native-delete-main-read-arm");
      return Promise.resolve({ breakpointId: "relocated.point", actualLocation: { ...command.params.location, columnNumber: command.params.location.columnNumber + 1 } });
    },
  });
  const { lineNumber, columnNumber } = READS.branch.site;
  await assert.rejects(custody.request({ kind: "branch", phase: "inverse-native-delete-main-read-arm", method: "Debugger.setBreakpoint",
    params: { location: { scriptId, lineNumber, columnNumber } } }, false), /EXACT_POINT/u);
  assert.deepEqual([...points], [["relocated.point", columnNumber + 1]]);
});

void test("Main successor refuses its driver resume until the original predecessor releases the shared group", async () => {
  const branchUuid = "d".repeat(32), projectUuid = "c".repeat(64);
  const origin = { profile: "private.current-footprint-inverse-native-delete-main-request-origin.v1" } as const;
  const expected = { projectUuid, branchUuid, historyUuid, compare: noOperation };
  const scriptId = "original.script";
  function prepare(kind: "branch" | "history"): CurrentFootprintInverseNativeDeleteMainReadCustody {
    const custody = new CurrentFootprintInverseNativeDeleteMainReadCustody(kind, {
      origin, scriptId, sqlCaptureObjectId: "sql.capture", persistentDriverBreakpointId: "driver.point",
      assertCurrent: noOperation, pendingRequestId: (): number => 1, busy: (): boolean => true, expected: (): typeof expected => expected,
      pause: (): never => assert.fail("Blocked successor must retain the driver without reading its pause"),
      resume: (): never => assert.fail("The original driver must remain held"), fail: noOperation,
      registerPoint: noOperation, removePoint: noOperation, pointCurrent: (): boolean => true,
      send: (command): Promise<unknown> => {
        custody.consume(command, 1);
        assert.equal(command.phase, "inverse-native-delete-main-read-arm");
        return Promise.resolve({ breakpointId: `${kind}.point`, actualLocation: command.params.location });
      },
    });
    return custody;
  }
  const branch = prepare("branch"), history = prepare("history");
  for (const [kind, custody] of [["branch", branch], ["history", history]] as const) {
    const { lineNumber, columnNumber } = READS[kind].site;
    await custody.request({ kind, phase: "inverse-native-delete-main-read-arm", method: "Debugger.setBreakpoint",
      params: { location: { scriptId, lineNumber, columnNumber } } }, false);
  }
  history.retainReadonlyRequest({ schema: "private.selected-file-main-request.v1", mode: "fetch", method: "GET",
    pureUrl: `/api/v4/projects/${projectUuid}/branches/${branchUuid}/histories/${historyUuid}`, pureQuery: "",
    pathHeader: projectUuid, originalRequestVerified: true, readonlySql: false, executionAuthorized: false,
    saveAuthorized: false }, "history.request");
  await assert.rejects(history.request({ kind: "history", phase: "inverse-native-delete-main-read-driver-step",
    method: "Debugger.resume", params: {} }, false), /COMPLETED_READ/u);
});

const beginCases = currentFootprintInverseNativeDeleteMainBeginNativeCases();
const beginRoles = ["save", "transaction", "run", "callback", "returned"] as const;
const beginScript = "via_script";
const beginResult = {
  schema: "private.current-footprint-inverse-native-delete-main-begin-result.v1", originalNativeCallbackSucceeded: true,
  originalBeginAwaitCompleted: true, transactionDepth: 1, historySqlCompleted: false, furtherSelectedSqlAuthorized: false,
  persistenceVerified: false,
};
function beginFrame(functionName: string, lineNumber: number, columnNumber: number, functionLine: number, functionColumn: number): object {
  return { callFrameId: "via_frame", functionName, location: { scriptId: beginScript, lineNumber, columnNumber },
    functionLocation: { scriptId: beginScript, lineNumber: functionLine, columnNumber: functionColumn } };
}
function beginPause(role: BeginCall, breakpointId = `${role}.point`): CurrentFootprintInverseNativeDeleteMainBeginPause {
  const site = role === "run" ? null : BEGIN_SITES[role];
  const callFrames = site === null ? [
    beginFrame("", 1025, 875, 1025, 859), beginFrame("begin", 1025, 2186, 1025, 2040),
    beginFrame("inTransaction", 1025, 2529, 1025, 2514),
  ] : [beginFrame(site.name, site.lineNumber, site.columnNumber, site.functionLine, site.functionColumn)];
  return { identity: {}, frameId: "via_frame", sqlSite: role === "run" ? "run" : null,
    raw: { reason: "other", hitBreakpoints: [breakpointId], callFrames }, pendingEvents: 0, resumed: false, resumeAttempted: false };
}
function beginArray(objectId: string, length: number): object {
  return { result: { type: "object", subtype: "array", className: "Array", description: `Array(${String(length)})`, objectId } };
}

async function retainedBeginReturn(): Promise<Readonly<{
  custody: CurrentFootprintInverseNativeDeleteMainBeginCustody;
  points: ReadonlySet<string>;
  remove: (role: "callback" | "returned") => Promise<unknown>;
  setReturnedPoint: (point: string) => void;
}>> {
  const origin = { profile: "private.current-footprint-inverse-native-delete-main-request-origin.v1" } as const;
  const points = new Set<string>();
  let held = beginPause("save"), next = 0;
  const custody = new CurrentFootprintInverseNativeDeleteMainBeginCustody({
    origin, scriptId: beginScript, captureObjectId: "begin.capture", assertCurrent: noOperation,
    actorSql: (): Readonly<{ actorObjectId: string; sqlObjectId: string; dataStr: string }> =>
      ({ actorObjectId: "actor.object", sqlObjectId: "sql.object", dataStr: "fixture" }),
    pause: (): CurrentFootprintInverseNativeDeleteMainBeginPause => held,
    pendingRequestId: (): number => 7, busy: (): boolean => true,
    registerPoint: (id): void => { points.add(id); },
    pointCurrent: (id): boolean => points.has(id),
    removePoint: (id): void => { assert.equal(points.delete(id), true); },
    resume: (identity, command): Promise<unknown> => {
      assert.equal(held.identity, identity);
      held = { ...held, resumeAttempted: true };
      assert.equal(custody.consume(command, 7).origin, origin);
      const role = beginRoles[next];
      assert.ok(role !== undefined);
      next += 1;
      held = beginPause(role);
      return Promise.resolve({});
    },
    send: (command, cleanup): Promise<unknown> => {
      if (command.phase === "inverse-native-delete-main-begin-arm") {
        return Promise.resolve({ breakpointId: `${command.role}.point`, actualLocation: command.params.location });
      }
      if (command.phase === "inverse-native-delete-main-begin-frame") {
        return Promise.resolve(beginArray(`frame.${command.role}`, { save: 4, transaction: 2, run: 7, callback: 8, returned: 2 }[command.role]));
      }
      if (command.phase === "inverse-native-delete-main-begin-join") {
        return Promise.resolve(command.role === "returned" ? { result: { type: "object", value: beginResult } } :
          beginArray(`packet.${command.role}`, BEGIN_CALLS[command.role].length));
      }
      assert.equal(command.phase, "inverse-native-delete-main-begin-remove");
      assert.equal(cleanup, true);
      return Promise.resolve({});
    },
  });
  for (const command of beginCases) {
    if (command.phase === "inverse-native-delete-main-begin-arm") { await custody.request(command, false); }
  }
  const steps = beginCases.filter(command => command.phase === "inverse-native-delete-main-begin-step");
  const args = {
    save: ["actor.object", "sql.object"], transaction: ["packet.save"], run: ["begin.capture", "packet.transaction"],
    callback: ["packet.run"], returned: ["packet.callback"],
  };
  for (const [index, role] of beginRoles.entries()) {
    const step = steps[index];
    const frame = beginCases.find(command => command.phase === "inverse-native-delete-main-begin-frame" && command.role === role);
    const join = beginCases.find(command => command.phase === "inverse-native-delete-main-begin-join" && command.role === role);
    assert.ok(step !== undefined && frame !== undefined && join?.phase === "inverse-native-delete-main-begin-join");
    await custody.request(step, false);
    await custody.request(frame, false);
    await custody.request({ ...join, params: { ...join.params, objectId: `frame.${role}`, arguments: args[role].map(objectId => ({ objectId })) } }, false);
  }
  return { custody, points, remove: (role): Promise<unknown> => custody.request({
    phase: "inverse-native-delete-main-begin-remove", role, method: "Debugger.removeBreakpoint", params: { breakpointId: `${role}.point` },
  }, true), setReturnedPoint: (point): void => { held = { ...held, raw: beginPause("returned", point).raw }; } };
}

void test("BEGIN reads and hands off its original held return after removing the returned breakpoint", async () => {
  const original = await retainedBeginReturn();
  const result = original.custody.result();
  await original.remove("returned");
  assert.equal(original.points.has("returned.point"), false);
  original.setReturnedPoint("different.point");
  assert.throws(() => original.custody.result(), /ORIGINAL_SOURCE_PAUSE/u);
  original.setReturnedPoint("returned.point");
  assert.equal(original.custody.result(), result);
  assert.equal(original.custody.consumeHistoryHandoff().callbackBreakpointId, "callback.point");

  const removedCallback = await retainedBeginReturn();
  await removedCallback.remove("returned");
  await removedCallback.remove("callback");
  assert.equal(removedCallback.points.has("callback.point"), false);
  assert.deepEqual(removedCallback.custody.result(), beginResult);
  assert.throws(() => removedCallback.custody.consumeHistoryHandoff(), /ORIGINAL_CALLBACK_POINT/u);
});
