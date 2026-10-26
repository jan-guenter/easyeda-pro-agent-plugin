/** Synthetic original-owner and VM checks; no embedded V8 or native create. */
import assert from "node:assert/strict";
import { test } from "node:test";
import vm from "node:vm";
import { CURRENT_FOOTPRINT_COPY_TRANSACTION_CLOCK_RELATION as RELATION, CURRENT_FOOTPRINT_COPY_TRANSACTION_CLOCK_REQUESTS as REQUESTS,
  CURRENT_FOOTPRINT_COPY_TRANSACTION_CLOCK_SITES as SITES, decodeCurrentFootprintCopyTransactionClockValue } from "../src/current-footprint-copy-transaction-clock.ts";
import type { CurrentFootprintCopyTransactionClockCommand } from "../src/current-footprint-copy-transaction-clock.ts";
import { CurrentFootprintCopyTransactionClockRunner } from "../src/current-footprint-copy-transaction-clock-runner.ts";
import type { CurrentFootprintCopyTransactionClockTransport } from "../src/current-footprint-copy-transaction-clock-runner.ts";

const destination = "a".repeat(16);
function paused(index: number): unknown {
  const site = SITES[index]; assert.ok(site);
  return { reason: "other", hitBreakpoints: [`breakpoint-${String(index)}`], callFrames: [{ callFrameId: `frame-${String(index)}`,
    functionName: site.role, location: { scriptId: "original-script", lineNumber: site.lineNumber, columnNumber: site.columnNumber } }] };
}
interface Controls {
  relocate?: boolean;
  loseAfterCapture?: boolean;
  failResume?: boolean;
  changedDestination?: boolean;
}
function fixture(controls: Controls = {}): { runner: CurrentFootprintCopyTransactionClockRunner;
  commands: CurrentFootprintCopyTransactionClockCommand[]; resumed: () => number; transport: CurrentFootprintCopyTransactionClockTransport } {
  const commands: CurrentFootprintCopyTransactionClockCommand[] = [];
  let allocated = 0, captures = 0, current = true, resumes = 0;
  const request = (command: CurrentFootprintCopyTransactionClockCommand): Promise<unknown> => {
    commands.push(command);
    if (command.method === "Debugger.setBreakpoint") {
      const id = `breakpoint-${String(allocated)}`; allocated += 1;
      return Promise.resolve({ breakpointId: id, actualLocation: { ...command.params.location,
        columnNumber: command.params.location.columnNumber + (controls.relocate === true ? 1 : 0) } });
    }
    if (command.method === "Debugger.evaluateOnCallFrame") {
      captures += 1; if (controls.loseAfterCapture === true) { current = false; }
      return Promise.resolve({ result: { type: "object", subtype: "array", className: "Array", description: "Array(4)", objectId: `sample-${String(captures)}` } });
    }
    if (command.method === "Runtime.callFunctionOn") {
      assert.equal(command.params.objectId, "original-manager"); assert.equal(command.params.arguments[1].objectId, "original-lexicals");
      assert.equal(command.params.functionDeclaration, RELATION);
      return Promise.resolve({ result: { type: "object", value: {
        documentUuid: captures === 2 && controls.changedDestination === true ? "b".repeat(16) : destination, updateTime: 1_777_777_777_777 } } });
    }
    if (command.method === "Debugger.resume" && controls.failResume === true) { return Promise.reject(new Error("resume acknowledgment lost")); }
    return Promise.resolve({});
  };
  const transport: CurrentFootprintCopyTransactionClockTransport = { scriptId: "original-script", managerObjectId: "original-manager",
    lexicalBundleObjectId: "original-lexicals", assertOriginal: (): Promise<void> => current ? Promise.resolve() : Promise.reject(new Error("original owner lost")),
    assertCleanup: (): void => { assert.ok(true); }, request, observeResumed: (): Promise<void> => { resumes += 1; return Promise.resolve(); } };
  return { runner: new CurrentFootprintCopyTransactionClockRunner(transport), commands, resumed: (): number => resumes, transport };
}
void test("transaction clock capture keeps both actual continuation identities even when their values are equal", async () => {
  const f = fixture(); await f.runner.arm();
  assert.equal(f.runner.retained().mutationMayHaveOccurred, false);
  await assert.rejects(new CurrentFootprintCopyTransactionClockRunner(f.transport).arm(), /ARM_CONSUMED/u);
  f.runner.consumeBeforeCreate(); assert.throws(() => { f.runner.consumeBeforeCreate(); }, /CREATE_CONSUMED/u);
  const first = await f.runner.observePause(paused(0)), second = await f.runner.observePause(paused(1));
  assert.equal(first.updateTime, second.updateTime); assert.equal(first.ordinal, 1); assert.equal(second.ordinal, 2);
  assert.notEqual(first.pauseSha256, second.pauseSha256); assert.notEqual(first.captureReplySha256, second.captureReplySha256);
  const packet = await f.runner.complete(); await f.runner.requireOriginal(packet);
  assert.equal(packet.samples[0], first); assert.equal(packet.samples[1], second);
  assert.equal(packet.executionAuthorized, false); assert.equal(packet.nativeCreateCompletionVerified, false);
  assert.equal(packet.transitiveClockRpcProvenanceVerified, false); assert.equal(f.resumed(), 2);
  assert.equal(f.commands.length, REQUESTS); assert.equal(f.runner.retained().requests, REQUESTS);
  assert.equal(f.runner.retained().rawRepliesAndPauses.length, REQUESTS + 2);
  await assert.rejects(f.runner.requireOriginal(structuredClone(packet)), /ORIGINAL_PACKET/u);
  await f.runner.cleanup(); assert.equal(f.commands.length, REQUESTS);
  assert.throws(() => f.runner.complete(), /INCOMPLETE/u);
});
void test("clock relation compares retained manager and qe identity without invoking producers or accessors", () => {
  for (const change of ["", "sample[0]={}", "sample[3]=function qe(){}", "sample[1]='bad'", "sample[1]='a'.repeat(32)", "sample[2]=0",
    "Object.defineProperty(manager,'user',{get(){traps++;return undefined;}})", "Object.defineProperty(sample,'2',{get(){traps++;return 1;}})"]) {
    const context = vm.createContext({});
    vm.runInContext(`let calls=0,traps=0;function qe(){calls++;throw Error('must not call')};const manager={user:undefined},producers=[0,1,qe,3,4,5,6,7,8,9],sample=[manager,'${destination}',1777777777777,qe];${change}`, context);
    const run = (): unknown => vm.runInContext(`(${RELATION}).call(manager,sample,producers)`, context);
    if (change === "") { assert.equal(JSON.stringify(run()), JSON.stringify({ documentUuid: destination, updateTime: 1_777_777_777_777 })); }
    else { assert.throws(run, /FOOTPRINT_COPY_CLOCK_RELATION/u); }
    assert.equal(vm.runInContext("calls+traps", context), 0);
  }
  for (const value of [0, -0, -1, Number.NaN, Number.POSITIVE_INFINITY, 1.5, 8_640_000_000_000_001, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => decodeCurrentFootprintCopyTransactionClockValue({ result: { type: "object", value: { documentUuid: destination, updateTime: value } } }));
  }
});
void test("relocated breakpoints retain allocation for once-only cleanup and never admit create", async () => {
  const f = fixture({ relocate: true }); await assert.rejects(f.runner.arm(), /TRANSACTION_CLOCK_PROTOCOL/u);
  assert.equal(f.runner.retained().allocatedBreakpoints, 1); assert.equal(f.runner.retained().mutationMayHaveOccurred, false);
  assert.throws(() => { f.runner.consumeBeforeCreate(); }, /CREATE_CONSUMED/u);
  await f.runner.cleanup(); assert.equal(f.runner.retained().removedBreakpoints, 1);
  assert.equal(f.commands.filter(command => command.method === "Debugger.resume").length, 0);
  assert.equal(f.commands.length, 3); await assert.rejects(f.runner.arm(), /ARM_CONSUMED/u);
});
void test("lost owner after frame reply retains evidence and cleans the original pause without retrying observation", async () => {
  const f = fixture({ loseAfterCapture: true }); await f.runner.arm(); f.runner.consumeBeforeCreate();
  await assert.rejects(f.runner.observePause(paused(0)), /original owner lost/u);
  assert.equal(f.runner.retained().mutationMayHaveOccurred, true); assert.equal(f.runner.retained().rawRepliesAndPauses.length, 4);
  assert.equal(f.commands.filter(command => command.method === "Runtime.callFunctionOn").length, 0);
  await f.runner.cleanup(); assert.equal(f.resumed(), 1); assert.equal(f.runner.retained().groupReleased, true);
  assert.throws(() => f.runner.observePause(paused(0)), /PAUSE_ORDER/u);
});
void test("uncertain resume is consumed and cleanup cannot issue a second resume or grant completion", async () => {
  const f = fixture({ failResume: true }); await f.runner.arm(); f.runner.consumeBeforeCreate();
  await assert.rejects(f.runner.observePause(paused(0)), /resume acknowledgment lost/u);
  await assert.rejects(f.runner.cleanup(), /CLOCK_CLEANUP/u);
  assert.equal(f.commands.filter(command => command.method === "Debugger.resume").length, 1);
  assert.equal(f.runner.retained().resumeAttempted, true); assert.equal(f.runner.retained().resumeObserved, false);
  assert.equal(f.runner.retained().groupReleased, true); assert.equal(f.runner.retained().samples.length, 0);
  assert.throws(() => f.runner.complete(), /INCOMPLETE/u);
});
void test("wrong pause order or changed destination refuses while retaining conservative mutation state", async () => {
  const wrong = fixture(); await wrong.runner.arm(); wrong.runner.consumeBeforeCreate();
  await assert.rejects(wrong.runner.observePause(paused(1)), /CLOCK_PROTOCOL/u); await wrong.runner.cleanup();
  assert.equal(wrong.commands.filter(command => command.method === "Debugger.resume").length, 0);
  const changed = fixture({ changedDestination: true }); await changed.runner.arm(); changed.runner.consumeBeforeCreate();
  await changed.runner.observePause(paused(0)); await assert.rejects(changed.runner.observePause(paused(1)), /DESTINATION_CHANGED/u);
  await changed.runner.cleanup(); assert.equal(changed.resumed(), 2); assert.equal(changed.runner.retained().samples.length, 1);
  assert.equal(changed.runner.retained().mutationMayHaveOccurred, true);
});
void test("cleanup before dispatch invalidates arm and altered transport methods are never invoked", async () => {
  const abandoned = fixture(); await abandoned.runner.arm(); await abandoned.runner.cleanup();
  assert.throws(() => { abandoned.runner.consumeBeforeCreate(); }, /CREATE_CONSUMED/u);
  assert.equal(abandoned.runner.retained().mutationMayHaveOccurred, false);
  const changed = fixture(); let invoked = false;
  Object.defineProperty(changed.transport, "request", { value: (): never => { invoked = true; throw new Error("substituted"); } });
  await assert.rejects(changed.runner.arm(), /ORIGINAL_TRANSPORT/u); assert.equal(invoked, false);
});
