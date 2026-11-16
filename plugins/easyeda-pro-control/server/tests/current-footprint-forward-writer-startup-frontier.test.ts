/** Real full driver/callback/timer classes with explicit inert registry/CDP
 * peers. No native owner, application, timer or production grant is created. */
/* oxlint-disable import/max-dependencies -- Exercise the three actual cursors, fixed encoders, native metadata decoders and separate managed journal together. */
import assert from "node:assert/strict";
import { setImmediate as nextTurn } from "node:timers/promises";
import { test } from "node:test";
import type { CurrentFootprintForwardWriterStartupFrontier } from "../src/current-footprint-forward-writer-startup-frontier.ts";
import type { CurrentFootprintForwardWriterStartupFrontierBindings } from "../src/current-footprint-forward-writer-frontier-origin.ts";
import { currentFootprintForwardWriterFrontierChannelCommand, validateCurrentFootprintForwardWriterFrontierCommand } from "../src/current-footprint-forward-writer-frontier-protocol.ts";
import { currentFootprintForwardWriterProducerWire } from "../src/current-footprint-forward-writer-producer-wire.ts";
import type { CurrentProjectSyncQuiesceBindings } from "../src/current-project-sync-quiesce-origin.ts";
import { CURRENT_PROJECT_SYNC_QUIESCE_NATIVE_PROFILES as PROFILES } from "../src/current-project-sync-quiesce-protocol.ts";
import { CURRENT_PROJECT_SYNC_QUIESCE_METHOD as METHOD, CURRENT_PROJECT_SYNC_QUIESCE_CALLER as TIMER_CALLER, CURRENT_PROJECT_SYNC_QUIESCE_SITES as TIMER_SITES } from "../src/current-project-sync-quiesce-source.ts";
import { CURRENT_PROJECT_SAVE_STRUCTURE_SITES as SITES } from "../src/current-project-save-structure-protocol.ts";
import type { CurrentFootprintForwardWriterStartupCallbackRole as CallbackRole, CurrentFootprintForwardWriterFrontierCommand, CurrentFootprintForwardWriterFrontierLane } from "../src/current-footprint-forward-writer-frontier-protocol.ts";
import { CURRENT_PCB_209_WORKER_PRODUCER_LOCATIONS as LOCATIONS } from "../src/current-pcb-209-worker-startup-profile.ts";
import { CURRENT209_SYNTHETIC_WORKER_SOURCE, current209SyntheticSourceModule } from "./helpers/current209-source-excerpts.ts";
import { loadSyntheticRegistryModule } from "./helpers/load-synthetic-registry-module.ts";
import { assertCurrentFootprintForwardWriterStartupFrontierChain } from "../src/current-footprint-forward-writer-startup-frontier-journal.ts";
import { currentFootprintForwardWriterStartupFrontierRecordSchema } from "../src/current-footprint-forward-writer-startup-frontier-contract.ts";
import { sha256Json } from "../src/core.ts";

const prop = (name: string, value: unknown, writable = true, enumerable = true, configurable = true): object => ({ name, value, writable, enumerable, configurable, isOwn: true });
const object = (objectId: string): object => ({ type: "object", objectId });
const array = (id: string, length: number): object => ({ result: { type: "object", subtype: "array", className: "Array", description: `Array(${String(length)})`, objectId: id } });
function nativeMetadata(index: number): object {
  const p = PROFILES.find(profile => profile.index === index); assert.ok(p !== undefined);
  const result = [prop("name", { type: "string", value: p.name }, false, false, true), prop("length", { type: "number", value: p.arity }, false, false, true)];
  if (p.constructor) { result.push(prop("prototype", { type: "object", className: p.name, description: p.name, objectId: "native-prototype" }, false, false, false)); }
  return { result, internalProperties: [{ name: "[[Prototype]]", value: { type: "function", className: "Function", description: "parentDescription" in p ? p.parentDescription : "function () { [native code] }", objectId: "native-parent" } },
    { name: "[[Scopes]]", value: { type: "object", className: "Array", subtype: "internal#scopeList", description: "Scopes[0]", objectId: "native-scopes" } }] };
}
function timerEvent(role: "entry" | "returned"): object {
    const site = TIMER_SITES[role]; return { reason: "other", hitBreakpoints: [`timer-${role}`], callFrames: [
      { callFrameId: `frame-${role}`, location: { scriptId: "worker", lineNumber: site.lineNumber, columnNumber: site.columnNumber }, functionLocation: { scriptId: "worker", lineNumber: site.functionLineNumber, columnNumber: site.functionColumnNumber } },
      { callFrameId: "caller", location: { scriptId: "worker", lineNumber: TIMER_CALLER.lineNumber, columnNumber: TIMER_CALLER.columnNumber }, functionLocation: { scriptId: "worker", lineNumber: TIMER_CALLER.functionLineNumber, columnNumber: TIMER_CALLER.functionColumnNumber } }] };
}

async function fixture(fault: "cancel-ack" | "return" | null = null): Promise<Readonly<{
  driver: CurrentFootprintForwardWriterStartupFrontier; callback: (role: CallbackRole) => Promise<void>; timer: () => Promise<void>;
  state: { requests: number; resumes: number; failure: unknown; exited: boolean }; records: ReturnType<typeof currentFootprintForwardWriterStartupFrontierRecordSchema.parse>[];
}>> {
  const origin = Object.freeze({ profile: "private.current-footprint-forward-writer-startup-frontier-origin.v1" as const });
  const timerOrigin = Object.freeze({ profile: "private.current-footprint-forward-writer-project-sync-quiesce-origin.v1" as const });
  const operation = Object.freeze({ syntheticOperation: true }), owner = Object.freeze({ syntheticOwner: true });
  const state = { requests: 0, resumes: 0, failure: null as unknown, exited: false };
  let callbackReceipt: PromiseWithResolvers<null> | null = null, driver: CurrentFootprintForwardWriterStartupFrontier | null = null;
  const timerReceipt = Promise.withResolvers<null>();
  void (async (): Promise<void> => { try { await timerReceipt.promise; } catch {
    // A callback can fail before this synthetic caller requests its timer receipt.
  } })();
  const records: ReturnType<typeof currentFootprintForwardWriterStartupFrontierRecordSchema.parse>[] = [];
  const append = (kind: string, evidence: Readonly<Record<string, unknown>>): Promise<void> => {
    const record = currentFootprintForwardWriterStartupFrontierRecordSchema.parse({ schema: "easyeda-pro-control.footprint-forward-writer-startup-frontier-record.v1", operationId: "footprint-forward-frontier-synthetic-case", sequence: records.length,
      previousSha256: records.length === 0 ? null : sha256Json(records.at(-1)), kind, evidence, executionAuthorized: false, saveAuthorized: false });
    assertCurrentFootprintForwardWriterStartupFrontierChain([...records, record]); records.push(record);
    if (kind === "callback-result") { callbackReceipt?.resolve(null); } return Promise.resolve();
  };
  await append("operation-intent", { request: { operationId: "footprint-forward-frontier-synthetic-case", parentOperationId: "footprint-forward-writer-synthetic-case", acceptOriginalProjectTimerCancellation: true } });
  await append("setup-intent", { sourceRecords: 512, sourceSha256: "a".repeat(64), inputSha256: "b".repeat(64) });
  const selected = (): CurrentFootprintForwardWriterStartupFrontier => { assert.ok(driver !== null); return driver; };
  const bindings: CurrentFootprintForwardWriterStartupFrontierBindings = Object.freeze({ sourceRecords: 512, actual: Object.freeze({ sessionId: "session", scriptId: "worker", uniqueContextId: "context", source: CURRENT209_SYNTHETIC_WORKER_SOURCE, project: "project", wrapper: "wrapper", callback: "callback" }), timerOrigin,
    assertCurrent: (): void => { assert.equal(state.exited, false); }, assertOriginalGenerationExited: (): Promise<void> => { assert.equal(state.exited, true); return Promise.resolve(); },
    fail: (cause?: unknown): void => { state.failure ??= cause ?? new Error("synthetic original frontier failure"); callbackReceipt?.reject(state.failure); timerReceipt.reject(state.failure); },
    journal: append, event: (lane: CurrentFootprintForwardWriterFrontierLane) => selected().nextEvent(lane), point: (lane: "callback" | "timer", role: string, id: string): void => { selected().point(lane, role, id); },
    control: (action: Parameters<CurrentFootprintForwardWriterStartupFrontierBindings["control"]>[0]): Promise<void> => { if (action === "timer-complete") { timerReceipt.resolve(null); } return Promise.resolve(); },
    request: async (input: CurrentFootprintForwardWriterFrontierCommand): Promise<unknown> => {
      await Promise.resolve();
      const value = validateCurrentFootprintForwardWriterFrontierCommand(input); selected().requireRequest(value); state.requests += 1;
      const wire = currentFootprintForwardWriterProducerWire(currentFootprintForwardWriterFrontierChannelCommand(value), state.requests, "session");
      assert.equal(wire.request["action"], "footprint-forward-startup-frontier-send"); assert.equal(wire.request["lane"], value.lane);
      const command = value.command;
      if (command.method === "Debugger.setBreakpoint") { return { breakpointId: `${value.lane}-${"role" in command ? command.role : "unknown"}`, actualLocation: command.params.location }; }
      if (command.method === "Debugger.resume") {
        state.resumes += 1; queueMicrotask(() => { selected().resumed(); if (value.lane === "timer" && "role" in command && command.role === "entry") { selected().paused(timerEvent("returned")); } }); return {};
      }
      if (value.lane === "timer") {
        if (command.phase === "sync-quiesce-capture") { return array("capture", 20); }
        if (command.phase === "sync-quiesce-native") { return nativeMetadata(command.index); }
        if (command.phase === "sync-quiesce-properties") {
          let fields: object[];
          if (command.role === "capture") { fields = Array.from({ length: 20 }, (_, index) => prop(String(index), object(`native-${String(index)}`))); }
          else if (command.role === "entry") { fields = [prop("0", object("project")), prop("1", { type: "function", objectId: "method" }), prop("2", object("capture")), prop("3", { type: "function", objectId: "guard" }), prop("4", object("state"))]; }
          else { fields = [prop("0", { type: "object", subtype: "array", className: "Array", description: "Array(5)", objectId: "original-entry" }), prop("1", { type: "number", value: 17 }), prop("2", object("descriptor"))]; }
          return { result: [...fields, prop("length", { type: "number", value: fields.length }, true, false, false)], internalProperties: [{ name: "[[Prototype]]", value: { type: "object", subtype: "array", objectId: "array-prototype" } }] };
        }
        if (command.phase === "sync-quiesce-frame") { return array(`timer-frame-${command.role}`, 1); }
        if (command.phase === "sync-quiesce-entry") { return array("entry", 5); }
        if (command.phase === "sync-quiesce-returned") { return array("returned", 3); }
        if (command.phase === "sync-quiesce-callee") { return { result: [prop("name", { type: "string", value: METHOD.name }, false, false, true), prop("length", { type: "number", value: METHOD.arity }, false, false, true)], internalProperties: [
          { name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: { scriptId: "worker", lineNumber: METHOD.lineNumber, columnNumber: METHOD.columnNumber } } },
          { name: "[[Prototype]]", value: { type: "function", className: "Function", description: "function () { [native code] }", objectId: "function-parent" } }, { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", description: "Scopes[2]", objectId: "method-scopes" } }] }; }
        if (command.phase === "sync-quiesce-cancel") { if (fault === "cancel-ack") { throw new Error("synthetic-original-cancel-ack-lost"); } return { result: { type: "object", value: { schema: "private.project-sync-quiesce-cancel.v1", cancelled: true, timerSlotRetained: true } } }; }
        return {};
      }
      if (command.method === "Debugger.evaluateOnCallFrame") { return array("role" in command ? command.role : "unknown", 4); }
      if (command.method === "Runtime.getProperties") {
        const id = command.params.objectId;
        if (id === "wrapper") { return { result: [prop("length", { type: "number", value: 0 }, false, false), prop("name", { type: "string", value: "" }, false, false)], internalProperties: [
          { name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: { scriptId: "worker", lineNumber: LOCATIONS.serial.lineNumber, columnNumber: LOCATIONS.serial.columnNumber } } },
          { name: "[[Prototype]]", value: { type: "function", objectId: "function-prototype" } }, { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", objectId: "serial-scopes", description: "Scopes[2]" } }] }; }
        if (id === "serial-scopes") { return { result: [prop("0", { type: "object", subtype: "internal#scope", className: "Object", description: "Closure (Nd)", objectId: "serial-scope" }), prop("1", { type: "object", subtype: "internal#scope", className: "Object", description: "Global", objectId: "global" })] }; }
        if (id === "promise") { return { result: [], internalProperties: [{ name: "[[Prototype]]", value: { type: "object", className: "Promise", description: "Promise", objectId: "promise-prototype" } }, { name: "[[PromiseState]]", value: { type: "string", value: "fulfilled" } }, { name: "[[PromiseResult]]", value: { type: "undefined" } }] }; }
        if (id === "initialFinally") { return { result: [prop("0", { type: "object", subtype: "promise", className: "Promise", description: "Promise", objectId: "promise" }), prop("1", { type: "object", subtype: "null", value: null }), prop("2", { type: "function", objectId: "callback" }), prop("length", { type: "number", value: 3 })] }; }
        return { result: [...Array.from({ length: 4 }, (_, index) => prop(String(index), object(`value-${String(index)}`))), prop("length", { type: "number", value: 4 })] };
      }
      return { result: { type: "boolean", value: true } };
    },
  });
  const lookup = (a: unknown, b: unknown, c: unknown): CurrentFootprintForwardWriterStartupFrontierBindings => { assert.equal(a, origin); assert.equal(b, owner); assert.equal(c, operation); return bindings; };
  const timerBindings: CurrentProjectSyncQuiesceBindings = Object.freeze({ sessionId: "session", scriptId: "worker", uniqueContextId: "context", source: bindings.actual.source, originalProject: (): string => "project", assertCurrent: (): Promise<void> => Promise.resolve(), assertOriginalGenerationExited: bindings.assertOriginalGenerationExited,
    request: (command: Parameters<CurrentProjectSyncQuiesceBindings["request"]>[0]) => selected().requestTimer(command), nextEvent: () => selected().nextTimerEvent(), complete: () => selected().completeTimer(), fail: (): void => {
      // The retained outer timer Promise reports its original rejection.
    } });
  const generic = await loadSyntheticRegistryModule(new URL("../src/current-project-sync-quiesce-observer.ts", import.meta.url), (name, actual) => name === "./current-pcb-diagnostic-owner.ts" ? { ...actual, requireOriginalCurrentProjectSyncQuiesceOrigin: (): CurrentProjectSyncQuiesceBindings => timerBindings } : current209SyntheticSourceModule(name, actual));
  const timer = await loadSyntheticRegistryModule(new URL("../src/current-footprint-forward-writer-startup-timer.ts", import.meta.url), (name, actual) => { if (name === "./current-footprint-forward-writer-frontier-origin.ts") { return { ...actual, requireOriginalCurrentFootprintForwardWriterStartupFrontierOrigin: lookup }; } if (name === "./current-project-sync-quiesce-observer.ts") { return generic; } return actual; });
  const callbacks = await loadSyntheticRegistryModule(new URL("../src/current-footprint-forward-writer-startup-callbacks.ts", import.meta.url), (name, actual) => name === "./current-footprint-forward-writer-frontier-origin.ts" ? { ...actual, requireOriginalCurrentFootprintForwardWriterStartupFrontierOrigin: lookup } : actual);
  const module = await loadSyntheticRegistryModule(new URL("../src/current-footprint-forward-writer-startup-frontier.ts", import.meta.url), (name, actual) => { if (name === "./current-footprint-forward-writer-frontier-origin.ts") { return { ...actual, requireOriginalCurrentFootprintForwardWriterStartupFrontierOrigin: lookup }; } if (name === "./current-footprint-forward-writer-startup-callbacks.ts") { return callbacks; } if (name === "./current-footprint-forward-writer-startup-timer.ts") { return timer; } return actual; });
  const Constructor = module["CurrentFootprintForwardWriterStartupFrontier"]; assert.ok(typeof Constructor === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Runtime-checked actual maintained class; only explicit inert registry and CDP peers are substituted.
  driver = Reflect.construct(Constructor, [origin, owner, operation]) as CurrentFootprintForwardWriterStartupFrontier;
  await driver.arm();
  return { driver, state, records, callback: async (role: CallbackRole): Promise<void> => {
    callbackReceipt = Promise.withResolvers<null>(); const site = SITES[role]; selected().paused({ reason: "other", hitBreakpoints: [`callback-${role}`], callFrames: [
      { callFrameId: role, location: { scriptId: "worker", lineNumber: site.lineNumber, columnNumber: site.columnNumber }, functionLocation: { scriptId: "worker", lineNumber: site.lineNumber, columnNumber: site.columnNumber }, ...(role === "startupReturn" ? { returnValue: fault === "return" ? { type: "number", value: 1 } : { type: "undefined" } } : {}) },
      { callFrameId: "startupCaller", location: { scriptId: "worker", lineNumber: SITES.producerSerial.lineNumber, columnNumber: SITES.producerSerial.columnNumber }, functionLocation: { scriptId: "worker", lineNumber: SITES.producerSerial.lineNumber, columnNumber: SITES.producerSerial.columnNumber } }] }); await callbackReceipt.promise;
  }, timer: async (): Promise<void> => { selected().paused(timerEvent("entry")); await timerReceipt.promise; } };
}

void test("full driver joins callbacks, delayed finalizer, interleaved original timer and completed serial Promises", async () => {
  const f = await fixture(); await f.callback("startupEntry"); await f.callback("startupReturn"); await f.timer(); await f.callback("initialFinally");
  const receipt = await f.driver.finish(); assert.equal(receipt.startupComplete, true); assert.equal(receipt.completeProducerFrontierVerified, false);
  assert.equal(f.state.requests, 55); assert.equal(f.state.resumes, 5); assert.equal(f.state.failure, null);
  assert.equal(f.records.filter(row => row.kind === "callback-result").length, 3); assert.equal(f.records.filter(row => row.kind === "timer-result").length, 2);
  await assert.rejects(f.driver.finish()); assert.equal(f.state.requests, 55);
  await assert.rejects(f.driver.endAfterOriginalExit()); f.state.exited = true; await f.driver.endAfterOriginalExit(); assert.equal(f.state.requests, 55);
});

void test("lost original timer cancellation acknowledgement leaves its returned pause stopped and cannot replay", async () => {
  const f = await fixture("cancel-ack"); await f.callback("startupEntry"); await f.callback("startupReturn");
  await assert.rejects(f.timer(), /original-cancel-ack-lost/u); await nextTurn();
  assert.match(String(f.state.failure), /original-cancel-ack-lost/u); assert.equal(f.state.resumes, 3); const requests = f.state.requests;
  await assert.rejects(f.driver.finish()); await assert.rejects(f.driver.endAfterOriginalExit()); f.state.exited = true; await f.driver.endAfterOriginalExit(); assert.equal(f.state.requests, requests);
});

void test("a substituted callback return cannot resume or manufacture a completed serial queue", async () => {
  const f = await fixture("return"); await f.callback("startupEntry");
  await assert.rejects(f.callback("startupReturn"), error => error === f.state.failure);
  const requests = f.state.requests; assert.equal(requests, 29); assert.equal(f.state.resumes, 1);
  assert.equal(f.records.some(row => row.kind === "queue-intent"), false); await assert.rejects(f.driver.finish());
  f.state.exited = true; await f.driver.endAfterOriginalExit(); assert.equal(f.state.requests, requests);
});
