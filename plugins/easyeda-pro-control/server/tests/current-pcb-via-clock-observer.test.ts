/** Real observer async/state logic with explicit native/source seams. These
 * tests create no original native owner, SDK Save, responder or SQL authority. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import type { CurrentPcbViaClockBodyJoin, CurrentPcbViaClockObserver } from "../src/current-pcb-via-clock-observer.ts";
import { CURRENT_PCB_VIA_CLOCK_UI_CALLER as CALLER, CURRENT_PCB_VIA_CLOCK_SITES as SITES } from "../src/current-pcb-via-clock-protocol.ts";
import type { CurrentPcbViaClockCommand, CurrentPcbViaClockSite as Site } from "../src/current-pcb-via-clock-protocol.ts";
import type { CurrentPcbViaSaveBodyObservation } from "../src/current-pcb-via-save-observer.ts";
import { CURRENT_PCB_VIA_SAVE_SOURCE as SAVE } from "../src/current-pcb-via-save-source.ts";

const uiUuid = "22222222-2222-2222-2222-222222222222", workerUuid = "11111111-1111-1111-1111-111111111111";
const replyTopic = `_MSG_BUS_RPC_-/pro-mgr/serverTime/now-${workerUuid}-41`; const value = 1_700_000_000_123; const offset = -12;
const property = (name: string, remote: unknown, length = false): unknown => ({ name, value: remote, writable: true, enumerable: !length, configurable: !length, isOwn: true });
const remoteArray = (objectId: string, count: number): unknown => ({ result: { type: "object", subtype: "array", className: "Array", objectId, description: `Array(${String(count)})` } });
function array(id: string): unknown {
  const role = id.replace("joined-", ""); const count = { worker: 14, ui: 10, push: 9, dispatch: 4, result: 8, reply: 4, complete: 5 }[role]; assert.ok(count !== undefined);
  const byRole: Readonly<Record<string, Partial<Record<number, string | number>>>> = { worker: { 12: workerUuid }, ui: { 8: uiUuid }, push: { 7: replyTopic, 8: 41 },
    dispatch: { 1: workerUuid, 2: uiUuid, 3: 41 }, result: { 3: value, 4: offset, 5: replyTopic, 6: workerUuid, 7: 41 }, reply: { 3: value } };
  const special = byRole[role] ?? {};
  const result = Array.from({ length: count }, (_, index) => {
    const scalar = special[index]; return property(String(index), scalar === undefined ? { type: "object", objectId: `${role}-${String(index)}`, description: "explicit-method-seam" } : { type: typeof scalar, value: scalar });
  });
  result.push(property("length", { type: "number", value: count }, true));
  return { result, internalProperties: [{ name: "[[Prototype]]", value: { type: "object", subtype: "array", objectId: "array-prototype" } }] };
}
function paused(role: Site): unknown {
  const site = SITES[role]; const scriptId = site.realm === "worker" ? "worker-script" : "wrapper-script";
  const callFrames = [{ callFrameId: `frame-${role}`, functionName: site.functionName,
    functionLocation: { scriptId, lineNumber: site.functionLine, columnNumber: site.functionColumn }, location: { scriptId, lineNumber: site.lineNumber, columnNumber: site.columnNumber } }];
  if (role === "push") { callFrames.push({ callFrameId: "save-caller", functionName: "saveCanvas", functionLocation: { scriptId, lineNumber: SAVE.saveCanvas.functionLine, columnNumber: SAVE.saveCanvas.functionColumn }, location: { scriptId, lineNumber: 110, columnNumber: 131_055 } }); }
  if (role === "result") { callFrames.push({ callFrameId: "ui-caller", functionName: CALLER.functionName, functionLocation: { scriptId, lineNumber: CALLER.functionLine, columnNumber: CALLER.functionColumn }, location: { scriptId, lineNumber: CALLER.lineNumber, columnNumber: CALLER.columnNumber } }); }
  return { method: "Debugger.paused", sessionId: site.realm, params: { reason: "other", hitBreakpoints: [`bp-${role}`], callFrames } };
}
async function fixture(options: Readonly<{ first?: "reply" | "complete"; delayed?: boolean; loseResume?: boolean }> = {}): Promise<Readonly<{
  observer: CurrentPcbViaClockObserver; body: CurrentPcbViaSaveBodyObservation; requireJoin: (join: CurrentPcbViaClockBodyJoin) => Promise<unknown>;
  state: { exited: boolean; failed: boolean; normal: number; cleanup: number; resumes: number }; waiting: Promise<unknown>; abort: () => void;
}>> {
  const owner = Object.freeze({ explicitSyntheticOwner: true }); const origin = Object.freeze({ explicitSyntheticOrigin: true }); const workerSource = Object.freeze({ explicitSyntheticSource: true });
  const plan = Object.freeze({ target: { documentUuid: "a".repeat(32), projectUuid: "b".repeat(64), branchUuid: "c".repeat(32) } });
  const body: CurrentPcbViaSaveBodyObservation = Object.freeze({ schema: "private.current-pcb-via-save-body-observation.v2", value: { schema:"private.current-pcb-via-save-body-value.v2" as const, pending:{maximumTicket:4,primitiveId:"3333333333333333",ticket:3,client:"producer",dataType:"VIA" as const,data:"{}",canvasUuid:plan.target.documentUuid,workerEditVersion:"3.2.185",priorVersion:"prior",priorUserUndefined:true,priorUserJson:null}, ...plan.target, clock: value,
    uniqueId: "compiler", client: "client", headTicket: 5, body: "synthetic-body", userUndefined: true, userJson: null }, bodySha256: "d".repeat(64),
    originalAwaitedClockContinuationObserved: true, originalFullCompressReturnObserved: true, selectedClockResponderVerified: false, selectedSqlAuthorized: false, persistenceVerified: false });
  const state = { exited: false, failed: false, normal: 0, cleanup: 0, resumes: 0 }; const queue: unknown[] = [paused("push")];
  const waiting = Promise.withResolvers<null>(); const pending = Promise.withResolvers<never>();
  const bindings = { workerSessionId: "worker", uiSessionId: "ui", workerScriptId: "worker-script", workerUniqueContextId: "worker-context", uiSdkObjectId: "sdk-tuple", windowTabId: "window", workerSource,
    assertCurrent: (): Promise<void> => { assert.equal(state.exited, false); return Promise.resolve(); }, assertSaveAttempt: (): void => { assert.equal(state.exited, false); },
    assertOriginalGenerationExited: (): Promise<void> => { assert.equal(state.exited, true); return Promise.resolve(); }, fail: (): void => { state.failed = true; },
    nextEvent: (): Promise<unknown> => { waiting.resolve(null); if (options.delayed === true) { return pending.promise; } assert.ok(queue.length > 0); return Promise.resolve(queue.shift()); },
    request: (command: CurrentPcbViaClockCommand, realm: string, cleanup: boolean): Promise<unknown> => {
      if (cleanup) { state.cleanup += 1; } else { state.normal += 1; }
      if (command.phase === "via-clock-source") { return Promise.resolve({ scriptSource: command.role }); }
      if (command.phase === "via-clock-arm") { return Promise.resolve({ breakpointId: `bp-${command.role}`, actualLocation: command.params.location }); }
      if (command.phase === "via-clock-remove" || command.phase === "via-clock-release") { return Promise.resolve({}); }
      if (command.phase === "via-clock-resume") {
        state.resumes += 1; queue.push({ method: "Debugger.resumed", sessionId: realm, params: {} });
        if (command.role === "push") { queue.push(paused("dispatch")); } else if (command.role === "dispatch") { queue.push(paused("result")); }
        else if (command.role === "result") { queue.push(paused(options.first ?? "reply"), paused(options.first === "complete" ? "reply" : "complete")); }
        if (options.loseResume === true) { return Promise.reject(new Error("original-resume-ack-lost")); } return Promise.resolve({});
      }
      if (command.phase === "via-clock-frame") {
        const role = Object.keys(SITES).find(candidate => command.params.callFrameId === `frame-${candidate}`); const counts: Readonly<Record<string, number>> = { complete: 5, push: 4, dispatch: 7, reply: 6 }; return Promise.resolve(remoteArray(`raw-${role ?? "caller"}`, counts[role ?? "caller"] ?? 8));
      }
      if (command.phase === "via-clock-properties") { const id = command.params.objectId;
        if (id === "first" || id === "bindings") { return Promise.resolve({ explicitRegistrationArray: id }); }
        if (id === "wrapper" || id === "callback") { return Promise.resolve({ explicitMetadata: id }); }
        if (id === "scopes-wrapper" || id === "scopes-callback") { return Promise.resolve({ explicitScopes: id }); }
        if (id.startsWith("joined-")) { return Promise.resolve(array(id)); } return Promise.resolve({ explicitNativeOrWorkerMetadata: id });
      }
      if (command.phase === "via-clock-registration") { return Promise.resolve(remoteArray("first", 10)); }
      if (command.phase === "via-clock-bindings") { return Promise.resolve(remoteArray("bindings", 4)); }
      if (command.phase === "via-clock-callback") { return Promise.resolve({ result: { type: "function", className: "Function", description: "explicit-callback-source", objectId: "callback" } }); }
      if (command.phase === "via-clock-offset") { return Promise.resolve({ result: { type: "number", value: offset } }); }
      const role = command.phase.replace("via-clock-", ""); const count = { worker: 14, ui: 10, push: 9, dispatch: 4, result: 8, reply: 4, complete: 5 }[role]; assert.ok(count !== undefined);
      return Promise.resolve(remoteArray(`joined-${role}`, count));
    } };
  const url = new URL("../src/current-pcb-via-clock-observer.ts", import.meta.url); const sourceRequire = createRequire(url);
  const output = await transform(await readFile(url, "utf8"), { loader: "ts", format: "cjs", target: "node24" }); const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${output.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => {
    if (name === "./current-pcb-diagnostic-owner.ts") { return { requireOriginalCurrentPcbViaClockOrigin: (o: unknown, actual: unknown, p: unknown): unknown => { assert.equal(o, origin); assert.equal(actual, owner); assert.equal(p, plan); return bindings; } }; }
    if (name === "./current-pcb-via-save-source.ts") { return { requireOriginalCurrentPcbViaSaveSource: (s: unknown): void => { assert.equal(s, workerSource); } }; }
    if (name === "./current-pcb-via-save-observer.ts") { return { requireOriginalCurrentPcbViaSaveBody: (b: unknown, o: unknown, p: unknown): void => { assert.equal(b, body); assert.equal(o, owner); assert.equal(p, plan); } }; }
    if (name === "./current-footprint-copy-clock-registration-v2-source.ts") { return { assertCurrentFootprintCopyClockRegistrationV2Function: (): void => { assert.equal(state.exited, false); }, requireCurrentFootprintCopyClockRegistrationV2Source: (): void => { assert.equal(state.exited, false); },
      captureCurrentFootprintCopyClockRegistrationV2SourceReply: (_: unknown, raw: unknown): unknown => structuredClone(raw), qualifyCurrentFootprintCopyClockRegistrationV2Source: (role: unknown): unknown => Object.freeze({ explicitSource: role }) }; }
    if (name === "./current-footprint-copy-clock-registration-v2-contract.ts") { return {
      decodeCurrentFootprintCopyClockRegistrationV2Function: (_: unknown, role: string): unknown => ({ scriptId: `${role}-script`, scopesId: `scopes-${role}` }),
      decodeCurrentFootprintCopyClockRegistrationV2Array: (_: unknown, phase: string): readonly string[] => phase === "initial" ? ["root", "host", "project", "bus", "wrapper", "queue", "task", "bc", "getter", "route"] : ["callback", "bus", "Date", "now"] }; }
    if (name === "./current-footprint-copy-clock-registration-contract.ts") { return { decodeCurrentFootprintCopyClockRegistrationNative: (): void => { assert.equal(state.exited, false); }, decodeCurrentFootprintCopyClockRegistrationScope: (_: unknown, role: string): string => `scope-${role}` }; }
    if (name === "./current-footprint-copy-clock-rpc-v2-protocol.ts") { const actual: unknown = sourceRequire(name); assert.ok(typeof actual === "object" && actual !== null); return { ...actual,
      decodeCurrentFootprintCopyClockRpcV2Function: (): void => { assert.equal(state.exited, false); }, requireCurrentFootprintCopyClockRpcV2Description: (): void => { assert.equal(state.exited, false); } }; }
    return sourceRequire(name) as unknown;
  }, loaded, loaded.exports]);
  const Constructor = loaded.exports["CurrentPcbViaClockObserver"], requireJoin = loaded.exports["requireOriginalCurrentPcbViaClockBodyJoin"]; assert.ok(typeof Constructor === "function" && typeof requireJoin === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The real class runs with explicit original-native/source seams above; no native factory is called.
  const observer = Reflect.construct(Constructor, [origin, owner, plan]) as CurrentPcbViaClockObserver;
  return { observer, body, state, waiting: waiting.promise, abort: (): void => { state.exited = true; pending.reject(new Error("original-job-exited")); },
    requireJoin: join => { const result: unknown = Reflect.apply(requireJoin, undefined, [join, body, owner, plan]); assert.ok(result instanceof Promise); return result; } };
}
void test("both cross-realm tail orders retain every original pause and join only the original Save body", async () => {
  for (const first of ["reply", "complete"] as const) { const f = await fixture({ first }); await f.observer.arm(); assert.equal(f.state.normal, 36); const packet = await f.observer.collect();
    assert.equal(f.state.normal, 59); assert.equal(f.state.cleanup, 10); assert.equal(f.state.resumes, 5); assert.equal(packet.selectedSqlAuthorized, false);
    await assert.rejects(f.observer.requireOriginal({ ...packet }), /ORIGINAL_PACKET/u); const join = await f.observer.joinBody(packet, f.body); await f.requireJoin(join);
    await assert.rejects(f.requireJoin({ ...join }), /ORIGINAL_BODY_JOIN/u); await assert.rejects(f.observer.joinBody(packet, f.body), /BODY_JOIN_CONSUMED/u);
    await f.observer.release(); assert.equal(f.state.cleanup, 12); await assert.rejects(f.requireJoin(join), /ORIGINAL/u);
  }
});
void test("a lost resume acknowledgment consumes its original request and requires original exit", async () => {
  const f = await fixture({ loseResume: true }); await f.observer.arm(); await assert.rejects(f.observer.collect(), /original-resume-ack-lost/u);
  assert.equal(f.state.failed, true); assert.equal(f.state.resumes, 1); await assert.rejects(f.observer.collect(), /COLLECT_CONSUMED/u); await assert.rejects(f.observer.release(), /RELEASE_CONSUMED/u);
  f.state.exited = true; await f.observer.retireAfterOriginalExit(); assert.equal(f.state.resumes, 1);
});
void test("original Job exit settles a pending clock event before retirement without racing the request away", async () => {
  const f = await fixture({ delayed: true }); await f.observer.arm(); const pending = f.observer.collect(); await f.waiting;
  await assert.rejects(f.observer.retireAfterOriginalExit(), /RETIRE_PENDING/u); f.abort(); await assert.rejects(pending, /original-job-exited/u); await f.observer.retireAfterOriginalExit(); assert.equal(f.state.resumes, 0);
});
