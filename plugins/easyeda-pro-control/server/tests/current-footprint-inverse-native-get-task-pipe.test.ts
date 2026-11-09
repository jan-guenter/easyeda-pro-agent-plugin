// oxlint-disable import/max-dependencies -- Independent public, UI, worker and both readonly native books exercise the same original byte transport and exclusion seams.
/** Actual bounded byte transport. Synthetic peer data creates no original
 * application, Core enrollment, invocation permission or accepted worker Job. */
import { currentFootprintInverseNativeGetTaskManagerCases } from "../src/current-footprint-inverse-native-get-task-manager-protocol.ts";
import { currentFootprintInverseNativeGetTaskCallbackCases } from "../src/current-footprint-inverse-native-get-task-callback-protocol.ts";
import { currentFootprintInverseNativeGetTaskDependenciesCases } from "../src/current-footprint-inverse-native-get-task-dependencies-protocol.ts";
import { currentFootprintInverseNativeGetTaskIntrinsicsCases } from "../src/current-footprint-inverse-native-get-task-intrinsics-protocol.ts";
import assert from "node:assert/strict";
import { once } from "node:events";
import { PassThrough, Writable } from "node:stream";
import { test } from "node:test";
import { sha256Text } from "../src/core.ts";
import { CurrentFootprintInversePipe } from "../src/current-pcb-diagnostic-pipe.ts";
import { currentFootprintInverseNativeGetTaskSenderCases as cases } from "../src/current-footprint-inverse-native-get-task-sender-protocol.ts";
import { currentFootprintInverseNativeGetLookupCases } from "../src/current-footprint-inverse-native-get-lookup-protocol.ts";
import { currentFootprintInversePublicCallCases } from "../src/current-footprint-inverse-public-call-protocol.ts";
import { currentFootprintInverseNativeGetWorkerCases } from "../src/current-footprint-inverse-native-get-worker-protocol.ts";

void test("native-task GET retains its own original slot and refuses public or worker preparation while held", async context => {
  const input = new PassThrough(), sent: Buffer[] = [];
  // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Exercise the actual Writable callback before treating a request as written.
  const output = new Writable({ write(chunk: unknown, _encoding, callback): void { assert.ok(Buffer.isBuffer(chunk)); sent.push(Buffer.from(chunk)); callback(); } });
  const pipe = new CurrentFootprintInversePipe(input, output); pipe.start();
  context.after(async () => { const closed = [input, output].filter(stream => !stream.closed).map(stream => once(stream, "close")); input.destroy(); output.destroy(); await Promise.all(closed); pipe.releaseClosedListeners(); });
  const last = (): Readonly<{ id: number; sessionId?: string }> => { const raw = sent.at(-1); assert.ok(raw !== undefined); const p: unknown = JSON.parse(raw.subarray(0, -1).toString("utf8")); assert.ok(p !== null && typeof p === "object" && "id" in p && typeof p.id === "number"); if ("sessionId" in p) { assert.ok(typeof p.sessionId === "string"); return { id: p.id, sessionId: p.sessionId }; } return { id: p.id }; };
  const reply = (result: object): void => { const frame = Buffer.from(`${JSON.stringify({ ...last(), result })}\0`); input.write(frame); };
  pipe.retainInverseActorEvents(() => "held");
  for (const phase of ["before", "arm", "after"] as const) { const p = pipe.observeInverseActors(phase); reply({}); await p; }
  const attached = pipe.attachTarget("original-target", () => {
    // This inert peer delivers no application event.
  }); reply({ sessionId: "original-ui" }); await attached;
  const path = String.raw`C:\Synthetic\Footprint_Validation.eprj2`; const target = Object.freeze({ rawWindowsPath: path, projectUuid: sha256Text(path), branchUuid: "b".repeat(32), documentUuid: "c".repeat(16), expectedSourceSha256: "d".repeat(64) });
  const preflight = pipe.preflightInverseProject("original-context", target); reply({}); await preflight;
  const registration = pipe.dispatchInverseRegistration("original-context", target); reply({ result: { type: "string", value: JSON.stringify({ schema: "easyeda-pro-control.footprint-inverse-path-registration.v1", projectUuid: target.projectUuid, rawWindowsPath: path, beforeRegistrySha256: "e".repeat(64), afterRegistrySha256: "e".repeat(64), beforeCount: 1, afterCount: 1, registrationDispatched: false, priorRegistrationPresent: true, exactOtherRegistrationRosterUnchanged: true, selectedRawPathMatched: true, selectedNonCbbMatched: true, recentPathRowMayHaveChanged: false, projectNavigationDispatched: false, cadEditDispatched: false, explicitSaveDispatched: false, persistentRegistrationVerified: false, replayAllowed: false, writerAuthority: false }) } }); await registration;
  const parent = pipe.armInverseParent(() => {
    // This inert peer delivers no parent event.
  }); reply({}); await parent; const opened = pipe.openInverseProject("original-context", target); reply({}); await opened;
  const invoke = cases().find(c => c.phase === "inverse-native-get-task-sender-invoke"); assert.ok(invoke !== undefined);
  const pending = pipe.observeInverseNativeGetTaskSender(invoke); const originalFrame = last(); await pipe.originalInverseNativeGetTaskSenderWrite(pending); pipe.requireInverseNativeGetTaskSenderWritten(pending);
  assert.equal(pipe.status().pendingRequestId, originalFrame.id); assert.throws(() => { void pipe.originalInverseNativeGetTaskSenderWrite(Promise.resolve({})); }); assert.throws(() => { pipe.requireInverseNativeGetTaskSenderWritten(Promise.resolve({})); });
  const originalCount = sent.length, sdk = currentFootprintInversePublicCallCases().find(c => c.phase === "inverse-public-call-sdk"), worker = currentFootprintInverseNativeGetWorkerCases()[0]; assert.ok(sdk !== undefined && worker !== undefined);
  await assert.rejects(pipe.observeInversePublicCall(sdk), /NATIVE_GET_TASK_PENDING/u); assert.throws(() => pipe.observeInverseNativeGetWorker(worker)); assert.throws(() => pipe.observeInverseNativeGetTaskSender(invoke)); const uiLookup = currentFootprintInverseNativeGetLookupCases()[0]; assert.ok(uiLookup !== undefined); assert.throws(() => pipe.observeInverseNativeGetLookup(uiLookup)); assert.equal(sent.length, originalCount);
  for (const c of cases()) { if (c.phase !== "inverse-native-get-task-sender-invoke") { const read = pipe.observeInverseNativeGetTaskSender(c); assert.equal(last().sessionId, "original-ui"); reply({}); await read; pipe.requireInverseNativeGetTaskSenderWritten(pending); assert.equal(pipe.status().pendingRequestId, originalFrame.id); } }
  const intrinsic = currentFootprintInverseNativeGetTaskIntrinsicsCases()[0]; const dependency = currentFootprintInverseNativeGetTaskDependenciesCases()[0]; assert.ok(intrinsic !== undefined && dependency !== undefined);
  const beforeForeign = sent.length; assert.throws(() => pipe.observeInverseNativeGetTaskIntrinsics(intrinsic, Promise.resolve({}))); assert.throws(() => pipe.observeInverseNativeGetTaskDependencies(dependency, Promise.resolve({}))); assert.equal(sent.length, beforeForeign);
  for (const c of currentFootprintInverseNativeGetTaskIntrinsicsCases()) { const read = pipe.observeInverseNativeGetTaskIntrinsics(c, pending); reply({}); await read; pipe.requireInverseNativeGetTaskSenderWritten(pending); assert.equal(pipe.status().pendingRequestId, originalFrame.id); }
  for (const c of currentFootprintInverseNativeGetTaskDependenciesCases()) { const read = pipe.observeInverseNativeGetTaskDependencies(c, pending); reply({}); await read; pipe.requireInverseNativeGetTaskSenderWritten(pending); assert.equal(pipe.status().pendingRequestId, originalFrame.id); }
  const callback = currentFootprintInverseNativeGetTaskCallbackCases()[0]; assert.ok(callback !== undefined); const beforeCallback = sent.length; assert.throws(() => pipe.observeInverseNativeGetTaskCallback(callback, Promise.resolve({}))); assert.equal(sent.length, beforeCallback);
  for (const c of currentFootprintInverseNativeGetTaskCallbackCases()) { const read = pipe.observeInverseNativeGetTaskCallback(c, pending); reply({}); await read; pipe.requireInverseNativeGetTaskSenderWritten(pending); assert.equal(pipe.status().pendingRequestId, originalFrame.id); }
  const manager = currentFootprintInverseNativeGetTaskManagerCases()[0]; assert.ok(manager !== undefined); const beforeManager = sent.length; assert.throws(() => pipe.observeInverseNativeGetTaskManager(manager, Promise.resolve({}))); assert.equal(sent.length, beforeManager);
  for (const c of currentFootprintInverseNativeGetTaskManagerCases()) { const read = pipe.observeInverseNativeGetTaskManager(c, pending); reply({}); await read; pipe.requireInverseNativeGetTaskSenderWritten(pending); assert.equal(pipe.status().pendingRequestId, originalFrame.id); }
  input.write(Buffer.from(`${JSON.stringify({ ...originalFrame, result: { result: { type: "object", subtype: "promise", className: "Promise", objectId: "original-getter-promise" } } })}\0`)); await pending;
  assert.throws(() => { pipe.requireInverseNativeGetTaskSenderWritten(pending); }); assert.equal(pipe.status().pendingRequestId, null); assert.throws(() => pipe.observeInverseNativeGetTaskSender(invoke)); assert.throws(() => pipe.observeInverseNativeGetTaskIntrinsics(intrinsic, pending)); assert.throws(() => pipe.observeInverseNativeGetTaskDependencies(dependency, pending)); assert.throws(() => pipe.observeInverseNativeGetTaskCallback(callback, pending)); assert.throws(() => pipe.observeInverseNativeGetTaskManager(manager, pending));
});
