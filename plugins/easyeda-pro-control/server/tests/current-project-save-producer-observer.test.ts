/** Explicit registry seam; real collector, fixed source programs and grammar.
 * No original native capability, worker or continuation is created. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { CURRENT_PROJECT_SAVE_PRODUCER_RECEIVER_CALLS as CALLS } from "../src/current-project-save-producer-programs.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_ROLES as ROLES, CURRENT_PROJECT_SAVE_PRODUCER_SHARED_GUARDS as SHARED, currentProjectSaveProducerNativeCases, validateCurrentProjectSaveProducerCommand } from "../src/current-project-save-producer-protocol.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_SITES as SITES } from "../src/current-project-save-producer-source.ts";
import type { CurrentProjectSaveProducerBindings, CurrentProjectSaveProducerOrigin } from "../src/current-project-save-producer-origin.ts";
import type { CurrentProjectSaveProducerObserver } from "../src/current-project-save-producer-observer.ts";
import { loadSyntheticRegistryModule } from "./helpers/load-synthetic-registry-module.ts";

void test("all producer requests remain source-fixed observations with no resume or timer/cache operation", () => {
  const cases = currentProjectSaveProducerNativeCases(); assert.equal(cases.length, 121);
  for (const command of cases) { assert.deepEqual(validateCurrentProjectSaveProducerCommand(command), command);
    assert.throws(() => validateCurrentProjectSaveProducerCommand({ ...command, method: "Debugger.resume", params: {} }));
    if (command.phase === "project-save-producer-frame") { assert.throws(() => validateCurrentProjectSaveProducerCommand({ ...command, params: { ...command.params, expression: "this.uploadCloud()" } })); }
  }
  for (const role of SHARED) { const site = SITES[role]; assert.throws(() => validateCurrentProjectSaveProducerCommand({ phase: "project-save-producer-arm", role, method: "Debugger.setBreakpoint", params: { location: { scriptId: "original-script", lineNumber: site.lineNumber, columnNumber: site.columnNumber } } })); }
});
void test("fixed receiver projection retains the original callback and reads no field accessors", () => {
  const result: unknown = runInNewContext(`let calls=0;const wrapper=()=>{calls++},callback=()=>{calls++},project={bufferedUploadCloud:wrapper};globalThis.PROJECT=project;
const f=(${CALLS.bufferIngress}),frame=[{},null,null,null,project,callback,500,()=>{},()=>{}];
if(f.call(frame,project,wrapper,callback)!==frame)throw Error("identity");let refused=0;try{f.call(frame,project,wrapper,()=>{})}catch{refused++}
Object.defineProperty(frame,"5",{get(){calls++;return callback}});try{f.call(frame,project,wrapper,callback)}catch{refused++}({calls,refused});`);
  assert.equal(JSON.stringify(result), JSON.stringify({ calls: 0, refused: 2 }));
});
async function fixture(foreign = false): Promise<Readonly<{ observer: CurrentProjectSaveProducerObserver; packetData: (packet: object) => object; exit: () => void; state: { failed: boolean; requests: number } }>> {
  const origin: CurrentProjectSaveProducerOrigin = Object.freeze({ profile: "private.current-pcb-via-save-producer-origin.v1" }); const operation = Object.freeze({ syntheticOperation: true }), owner = Object.freeze({ syntheticOwner: true });
  const state = { failed: false, requests: 0 }; let exited = false;
  const role = "syncEntry", site = SITES[role];
  const bindings: CurrentProjectSaveProducerBindings = Object.freeze({ sessionId: "worker-session", scriptId: "worker-script",
    originalIntrinsics: (): string => "original-native-intrinsics",
    retainHeldCall: () => Object.freeze({ profile: "private.current-project-save-producer-held-call.v1" as const }),
    originalBreakpoint: (name: typeof ROLES[number]) => `bp-${name}`, originalReceivers: () => Object.freeze({ project: "original-project", wrapper: "original-wrapper", callback: "original-callback" }),
    assertCurrent: (): Promise<void> => Promise.resolve(), assertOriginalGenerationExited: (): Promise<void> => { assert.equal(exited, true); return Promise.resolve(); }, fail: (): void => { state.failed = true; },
    nextEvent: () => Promise.resolve({ method: "Debugger.paused" as const, sessionId: "worker-session", params: { reason: "other", hitBreakpoints: [`bp-${role}`], callFrames: [{ callFrameId: "original-frame", location: { scriptId: "worker-script", lineNumber: site.lineNumber, columnNumber: site.columnNumber }, functionLocation: { scriptId: foreign ? "foreign-script" : "worker-script", lineNumber: site.functionLineNumber, columnNumber: site.functionColumnNumber } }] } }),
    request: (input: Parameters<CurrentProjectSaveProducerBindings["request"]>[0]) => { const command = validateCurrentProjectSaveProducerCommand(input); state.requests += 1;
      if (command.phase === "project-save-producer-arm") { return Promise.resolve({ breakpointId: `bp-${command.role}`, actualLocation: command.params.location }); }
      if (command.phase === "project-save-producer-properties") { return Promise.resolve({ result: [
        { name: "0", isOwn: true, value: { type: "object", objectId: "original-project" } }, { name: "1", isOwn: true, value: { type: "undefined" } }, { name: "length", isOwn: true, value: { type: "number", value: 2 } }] }); }
      return Promise.resolve({ result: { type: "object", subtype: "array", className: "Array", description: "Array(2)", objectId: command.phase === "project-save-producer-frame" ? "original-frame-array" : "original-joined-array" } });
    } });
  const exports = await loadSyntheticRegistryModule(new URL("../src/current-project-save-producer-observer.ts", import.meta.url), (name, actual) => name === "./current-pcb-diagnostic-owner.ts" ? { ...actual,
    requireOriginalCurrentProjectSaveProducerOrigin: (candidate: object, actualOwner: object, actualOperation: object): CurrentProjectSaveProducerBindings => { assert.equal(candidate, origin); assert.equal(actualOwner, owner); assert.equal(actualOperation, operation); return bindings; } } : actual);
  const Constructor = exports["CurrentProjectSaveProducerObserver"], held = exports["requireOriginalCurrentProjectSaveProducerHeldCall"]; assert.ok(typeof Constructor === "function" && typeof held === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Runtime checked real collector; only its original registry accessor has the stated explicit synthetic seam.
  const observer = Reflect.construct(Constructor, [origin, owner, operation]) as CurrentProjectSaveProducerObserver;
  return { observer, state, exit: (): void => { exited = true; }, packetData: (packet: object): object => { const value: unknown = Reflect.apply(held, undefined, [packet, observer]); assert.ok(value !== null && typeof value === "object"); return value; } };
}
void test("source-owned startup call stays held after exact receiver join and retires only after original exit", async () => {
  const f = await fixture(); await f.observer.arm(); assert.equal(f.state.requests, ROLES.length - SHARED.length);
  const packet = await f.observer.observeHeldCall(); const data = f.packetData(packet); assert.equal(Reflect.get(data, "role"), "syncEntry");
  assert.equal(Object.isFrozen(Reflect.get(data, "fields")), true); assert.throws(() => f.packetData(structuredClone(packet))); assert.equal(f.state.requests, 26);
  await assert.rejects(f.observer.observeHeldCall(), /HELD_CALL_ONCE/u); await assert.rejects(f.observer.retireAfterOriginalExit()); assert.equal(f.state.failed, false);
  f.exit(); await f.observer.retireAfterOriginalExit(); assert.equal(f.state.requests, 26);
});
void test("foreign function location refuses before any original frame projection or continuation", async () => {
  const f = await fixture(true); await f.observer.arm(); await assert.rejects(f.observer.observeHeldCall(), /ORIGINAL_FRAME/u); assert.equal(f.state.requests, 23); assert.equal(f.state.failed, true);
  f.exit(); await f.observer.retireAfterOriginalExit(); assert.equal(f.state.requests, 23);
});
