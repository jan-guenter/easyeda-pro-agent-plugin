/** Explicitly synthetic original scheduler. Production origin issuance remains
 * separately tested by the actual main runner and combined owner. */
import assert from "node:assert/strict";
import { CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_COLLECTION_ORDER as ORDER, CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_COLLECTION_SITES as SITES } from "../../src/current-footprint-copy-main-request-protocol.ts";
import type { CurrentFootprintCopyMainRequestCollectCommand as Command } from "../../src/current-footprint-copy-main-request-protocol.ts";
import type { CurrentFootprintCopyMainRequestOriginBindings as Bindings, CurrentFootprintCopyMainRequestOrigin,
  CurrentFootprintCopyMainRequestOriginEvent as Event } from "../../src/current-footprint-copy-main-request-origin.ts";
import { mainRequestFragments as fragments } from "./footprint-main-request-fragments.ts";

type Data = Record<string, unknown>;
export const syntheticRequestSource = Object.freeze({ profile: "private.current-footprint-copy-main-request-source.v1", runtimeBound: false, executionAuthorized: false } as const);
export const syntheticRequestPlan = Object.freeze({ projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), projectKey: "a".repeat(64), path: "inert-disposable-path", dataStr: "native-body" });
function property(name: string, value: Data, writable = false, enumerable = false, configurable = true): Data { return { name, value, writable, enumerable, configurable, isOwn: true }; }
function array(length: number, selected: number, value: Data): Data {
  const result = Array.from({ length }, (_, index) => property(String(index), index === selected ? value : { type: "object", objectId: `member-${String(index)}` }, true, true));
  result.push(property("length", { type: "number", value: length }, true, false, false));
  return { result, internalProperties: [{ name: "[[Prototype]]", value: { type: "object", subtype: "array", className: "Array", objectId: "array-prototype" } }] };
}
export function syntheticRequestMetadata(actor: boolean): Data {
  return { result: [property("name", { type: "string", value: actor ? "PB" : "queryOne" }), property("length", { type: "number", value: actor ? 1 : 0 })],
    internalProperties: [{ name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: { scriptId: "app", lineNumber: actor ? 8572 : 1025, columnNumber: actor ? 27_772 : 2771 } } },
      { name: "[[Prototype]]", value: { type: actor ? "object" : "function", className: actor ? "AsyncFunction" : "Function", objectId: "function-prototype" } },
      { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", description: "Scopes[2]", objectId: "scopes" } }] };
}
const captured = (name: string, length: number): Data => ({ result: { type: "object", subtype: "array", className: "Array", description: `Array(${String(length)})`, objectId: name } });
export function syntheticRequestPause(index: number, wrongCaller = false): Data {
  const role = ORDER[index]; assert.ok(role !== undefined); const site = SITES[role]; const actor = role === "editHead";
  const frame = { callFrameId: `frame-${String(index)}`, functionName: site.name, location: { scriptId: "app", lineNumber: site.lineNumber, columnNumber: site.columnNumber },
    functionLocation: { scriptId: "app", lineNumber: site.functionLine, columnNumber: site.functionColumn } };
  const callerName = actor ? "L3" : "interceptHttpProtocol";
  const caller = { callFrameId: `caller-${String(index)}`, functionName: wrongCaller ? "unrelated" : callerName,
    location: { scriptId: "app", lineNumber: actor ? 8573 : 1164, columnNumber: actor ? 267 : 51_414 }, functionLocation: { scriptId: "app", lineNumber: actor ? 8573 : 1164, columnNumber: actor ? 31 : 51_072 } };
  return { reason: "other", hitBreakpoints: [`bp-${String(index)}`], callFrames: role === "controller" ? [frame] : [frame, caller] };
}
export function requestCollectorFixture(): Readonly<{ token: CurrentFootprintCopyMainRequestOrigin; bindings: Bindings; commands: Command[];
  state: { invoked: boolean; current: boolean; retired: boolean; exited: boolean; nextPause: number; wrongCaller: boolean; promisePending: boolean; failPhase: string; lostResume: boolean;
    selectedPromiseResult: string; observedSqlArgument: string | null; mutationCalls: number; groupReleased: boolean }; require: (token: CurrentFootprintCopyMainRequestOrigin) => Bindings }> {
  const token = Object.freeze({ profile: "private.current-footprint-copy-main-request-origin.v1", executionAuthorized: false } as const); const commands: Command[] = [], events: Event[] = [];
  const state = { invoked: false, current: true, retired: false, exited: false, nextPause: 0, wrongCaller: false, promisePending: false, failPhase: "", lostResume: false,
    selectedPromiseResult: "actual-sql-result", observedSqlArgument: null as string | null, mutationCalls: 0, groupReleased: false };
  const pushPause = (): void => { if (state.nextPause < 4) { events.push({ method: "Debugger.paused", params: syntheticRequestPause(state.nextPause, state.wrongCaller) }); state.nextPause += 1; } };
  function response(command: Command): unknown {
    if (command.phase === "request-driver-arm") { return { breakpointId: "bp-0" }; }
    if (command.phase === "request-site-arm") {
      const index = ORDER.findIndex(role => SITES[role].lineNumber === command.params.location.lineNumber && SITES[role].columnNumber === command.params.location.columnNumber);
      return { breakpointId: `bp-${String(index)}`, actualLocation: command.params.location };
    }
    if (command.phase === "request-invocation-frame") { return captured(command.params.expression === "[this,r,i]" ? "driver-frame" : "driver-caller", 3); }
    if (command.phase === "request-frame") {
      const expressions = new Map([["[this,r,i,s]", 4], ["[this,this.ctx,this.service,this.path,L3,PB,Date,Date.now]", 8], ["[t]", 1], ["[t,e,r,i,c,Date,Date.now,yo,Z2]", 9]]);
      const length = expressions.get(command.params.expression); assert.ok(length !== undefined); return captured(`captured-${String(length)}`, length);
    }
    if (command.phase === "request-invocation") { return captured("invocation", 6); }
    if (command.phase === "request-context") { return captured("context", 6); }
    if (command.phase === "request-context-join") { return { result: { type: "boolean", value: true } }; }
    if (command.phase === "request-controller") { return captured("controller", 12); }
    if (command.phase === "request-actor") { return captured("actor", 10); }
    if (command.phase === "request-sql") {
      state.observedSqlArgument = command.params.arguments[0].objectId; assert.equal(state.observedSqlArgument, state.selectedPromiseResult); return captured("sql", 7);
    }
    if (command.phase === "request-value") { return { result: { type: "object", value: { uuid: "c".repeat(32), username: "selected-project-name", nickname: "selected-project-nickname", updateTime: 1_700_000_000_123 } } }; }
    if (command.phase === "request-properties") {
      const id = command.params.objectId;
      if (id === "controller") { return array(12, 8, { type: "function", className: "AsyncFunction", description: fragments.editHead, objectId: "PB" }); }
      if (id === "actor") { return array(10, 6, { type: "object", subtype: "promise", className: "Promise", objectId: "actual-promise" }); }
      if (id === "sql") { return array(7, 6, { type: "function", className: "Function", description: fragments.sqlQueryOne, objectId: "queryOne" }); }
      if (id === "PB" || id === "queryOne") { return syntheticRequestMetadata(id === "PB"); }
      assert.equal(id, "actual-promise");
      return { result: [], internalProperties: [{ name: "[[Prototype]]", value: { type: "object", className: "Promise", objectId: "promise-prototype" } },
        { name: "[[PromiseState]]", value: { type: "string", value: state.promisePending ? "pending" : "fulfilled" } },
        { name: "[[PromiseResult]]", value: { type: "object", className: "yo", objectId: state.selectedPromiseResult } }] };
    }
    if (command.phase === "request-resume") { events.push({ method: "Debugger.resumed", params: {} }); pushPause(); }
    if (command.phase === "request-release") { state.groupReleased = true; }
    return {};
  }
  const bindings: Bindings = Object.freeze({ scriptId: "app", retainedArrayObjectId: "original-construction", driverCallbackObjectId: "original-driver", qualifiedSource: syntheticRequestSource,
    assertOriginal: (): Promise<void> => { assert.ok(state.current && !state.retired && !state.exited, "original owner changed"); return Promise.resolve(); },
    assertCleanup: (): Promise<void> => { assert.ok(state.current && !state.retired, "original cleanup owner changed"); return Promise.resolve(); },
    assertOriginalGenerationExited: (): Promise<void> => { assert.ok(state.exited, "original generation still live"); events.length = 0; return Promise.resolve(); },
    request: (command: Command): Promise<unknown> => {
      commands.push(command); if (state.failPhase === command.phase) { return Promise.reject(new Error("lost native acknowledgement")); }
      const reply = response(command); if (state.lostResume && command.phase === "request-resume") { return Promise.reject(new Error("lost original resume acknowledgement")); }
      return Promise.resolve(reply);
    },
    pump: (): Promise<void> => { if (state.invoked && state.nextPause === 0) { pushPause(); } return Promise.resolve(); },
    takeEvent: (): Event | null => events.shift() ?? null,
    retire: (): Promise<void> => { assert.ok(state.exited || state.groupReleased && events.length === 0); state.retired = true; return Promise.resolve(); },
  });
  return Object.freeze({ token, bindings, commands, state, require: (input: CurrentFootprintCopyMainRequestOrigin): Bindings => { assert.equal(input, token); assert.ok(!state.retired); return bindings; } });
}
