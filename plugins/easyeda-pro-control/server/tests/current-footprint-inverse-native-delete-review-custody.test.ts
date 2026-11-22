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
