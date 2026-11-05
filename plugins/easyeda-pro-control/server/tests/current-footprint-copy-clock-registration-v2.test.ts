/** Synthetic complete assets, CDP metadata and original-owner transport. Actual
 * fixed selectors/source validators run, but no application or native code runs. */
/* oxlint-disable import/max-dependencies -- One focused fixture covers the actual fixed programs, source issuers, runtime decoder and retained runner without modifying their production inputs. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import vm from "node:vm";
import { transform } from "esbuild";
import { sha256Text } from "../src/core.ts";
import { CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_V2_SOURCE as SOURCE,
  assertCurrentFootprintCopyClockRegistrationV2Function } from "../src/current-footprint-copy-clock-registration-v2-source.ts";
import type { captureCurrentFootprintCopyClockRegistrationV2SourceReply as CaptureSource,
  qualifyCurrentFootprintCopyClockRegistrationV2Source as QualifySource,
  requireCurrentFootprintCopyClockRegistrationV2Source as RequireSource,
  CurrentFootprintCopyClockRegistrationV2Role as Role } from "../src/current-footprint-copy-clock-registration-v2-source.ts";
import { CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_V2_CALLS as CALLS, CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_V2_FLAGS as FLAGS } from "../src/current-footprint-copy-clock-registration-v2-programs.ts";
import { decodeCurrentFootprintCopyClockRegistrationV2Function, validateCurrentFootprintCopyClockRegistrationV2Command } from "../src/current-footprint-copy-clock-registration-v2-contract.ts";
import type { CurrentFootprintCopyClockRegistrationV2Command as Command } from "../src/current-footprint-copy-clock-registration-v2-contract.ts";
import type { CurrentFootprintCopyClockRegistrationV2Runner, CurrentFootprintCopyClockRegistrationV2Transport } from "../src/current-footprint-copy-clock-registration-v2-runner.ts";
import type { CurrentFootprintCopyUiSourceQualification } from "../src/current-footprint-copy-ui-source.ts";

const functions = {
  wrapper: "B=>{try{let{message:q,replyTopic:Q}=B;try{let ee=v(q);ee instanceof Promise?ee.then(oe=>{this.publish(Q,{success:!0,result:oe})}).catch(oe=>{console.error(oe),this.publish(Q,{success:!1,err:String(oe)})}):this.publish(Q,{success:!0,result:ee})}catch(ee){this.publish(Q,{success:!1,err:String(ee)})}}finally{this.pull(y,k)}}",
  callback: "()=>Date.now()+Jd",
};
const binding = Object.freeze({ sessionId: "parent", uiRoute: "route", projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), windowTabId: "tab_1" });
const uiSource: CurrentFootprintCopyUiSourceQualification = Object.freeze({ sourceSha256: "synthetic-ui", functionCount: 9, runtimeBound: false, executionAuthorized: false });
const completeSources = Object.fromEntries((["wrapper", "callback"] as const).map(role => {
  const expected = SOURCE[role], fn = expected.function;
  let text = " ".repeat(expected.bytes); text = text.slice(0, fn.start) + functions[role] + text.slice(fn.end);
  return [role, text];
}));
type Data = Record<string, unknown>;
interface SourceModule {
  readonly captureCurrentFootprintCopyClockRegistrationV2SourceReply: typeof CaptureSource;
  readonly qualifyCurrentFootprintCopyClockRegistrationV2Source: typeof QualifySource;
  readonly requireCurrentFootprintCopyClockRegistrationV2Source: typeof RequireSource;
}
interface Loaded { readonly Constructor: typeof CurrentFootprintCopyClockRegistrationV2Runner; readonly source: SourceModule }
async function loadModule(path: URL, replace: Readonly<Record<string, unknown>>, sourceText?: string): Promise<Record<string, unknown>> {
  const loaded: { exports: Record<string, unknown> } = { exports: {} }, original = createRequire(path);
  const output = await transform(sourceText ?? await readFile(path, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const evaluate: unknown = vm.runInThisContext(`(function(require,module,exports){${output.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(specifier: string): unknown => Object.hasOwn(replace, specifier) ? replace[specifier] : original(specifier) as unknown, loaded, loaded.exports]);
  return loaded.exports;
}
async function implementation(): Promise<Loaded> {
  const sourcePath = new URL("../src/current-footprint-copy-clock-registration-v2-source.ts", import.meta.url);
  let text = await readFile(sourcePath, "utf8");
  // Only the test module's complete-asset hashes change. Lengths, selected source
  // Spans, function hashes, metadata locations and actual qualifier logic stay fixed.
  for (const role of ["wrapper", "callback"] as const) { const full = completeSources[role]; assert.ok(full !== undefined); text = text.replace(SOURCE[role].sha256, sha256Text(full)); }
  const source = await loadModule(sourcePath, {}, text);
  assert.equal(typeof source["qualifyCurrentFootprintCopyClockRegistrationV2Source"], "function");
  const runner = await loadModule(new URL("../src/current-footprint-copy-clock-registration-v2-runner.ts", import.meta.url), {
    "./current-footprint-copy-clock-registration-v2-source.ts": source,
    "./current-footprint-copy-ui-source.ts": { requireCurrentFootprintCopyUiSource: (value: unknown): void => { assert.equal(value, uiSource); } },
  });
  assert.equal(typeof runner["CurrentFootprintCopyClockRegistrationV2Runner"], "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Test-local evaluation preserves real private issuers/runner logic; only complete synthetic asset pins and the separate UI source issuer are substituted.
  return { Constructor: runner["CurrentFootprintCopyClockRegistrationV2Runner"], source } as unknown as Loaded;
}
function property(name: string, value: Data, writable = false, enumerable = false, configurable = true): Data { return { name, value, writable, enumerable, configurable, isOwn: true }; }
function metadata(role: Role, duplicate = false): Data {
  const expected = SOURCE[role].function;
  return { result: [property("name", { type: "string", value: expected.name }), property("length", { type: "number", value: expected.arity })], internalProperties: [
    { name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: { scriptId: role === "wrapper" ? "preload" : "ws",
      lineNumber: duplicate ? SOURCE.wrapper.unselectedCopy.lineNumber : expected.lineNumber, columnNumber: duplicate ? SOURCE.wrapper.unselectedCopy.columnNumber : expected.columnNumber } } },
    { name: "[[Prototype]]", value: { type: "function", className: "Function", objectId: "function-parent" } },
    { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", objectId: `${role}-scopes`, description: "Scopes[2]" } },
  ] };
}
function bundle(phase: "initial" | "bindings"): Data {
  const count = phase === "initial" ? 10 : 4;
  const result = Array.from({ length: count }, (_, index) => {
    let value: Data = { type: "object", objectId: `${phase}-${String(index)}` };
    const role = phase === "initial" ? "wrapper" : "callback";
    if (phase === "initial" && index === 4 || phase === "bindings" && index === 0) { value = { type: "function", className: "Function", objectId: role, description: functions[role] }; }
    if (phase === "initial" && index === 8) { value = { type: "function", className: "Function", objectId: "native-name" }; }
    if (phase === "initial" && index === 7) { value["className"] = "BroadcastChannel"; }
    if (phase === "bindings" && (index === 2 || index === 3)) { value = { type: "function", className: "Function", objectId: index === 3 ? "native-now" : "native-date" }; }
    return property(String(index), value, true, true);
  });
  result.push(property("length", { type: "number", value: count }, true, false, false));
  return { result, internalProperties: [{ name: "[[Prototype]]", value: { type: "object", subtype: "array", className: "Array", objectId: "array-parent" } }] };
}
const setup = String.raw`
let called=0;const forbidden=()=>{called++;throw Error("must not invoke");};
class BroadcastChannel{constructor(name){this.channelName=name;}}
const nameEntry={get name(){return this.channelName;}},getter=Object.getOwnPropertyDescriptor(nameEntry,"name").get;
Object.defineProperty(BroadcastChannel.prototype,"name",{get:getter,enumerable:true,configurable:true});
const nativeToString=Function.prototype.toString;Function.prototype.toString=function(){return this===getter?"function get name() { [native code] }":Reflect.apply(nativeToString,this,[]);};
const path="a".repeat(64),branch="b".repeat(32),tab="tab_1",topic="/pro-mgr/serverTime/now";
const wrapper=()=>forbidden(),callback=()=>forbidden(),task={callback:wrapper,isRunning:true,unsafe:true};
const project={projectId:path,branchUuid:branch},bus={pulled:{[topic]:[task]},pushed:{},subscribed:{},bc:new BroadcastChannel("/tab_1/notify")};
const host={currentProject:project,concurrentBus:bus},root={gVars:host,_TAB_ID_:tab,"/tab_1/notify":bus,BroadcastChannel,Date};
const notification=[wrapper,root,host,project,bus,[],{}],route=Array(17).fill({});route[14]=notification;
const wrapperScope={object:{v:callback,y:topic,k:wrapper}},clockScope={object:{Ji:bus,Jd:0}};
let first,original;
`;
function fixture(): Readonly<{ transport: CurrentFootprintCopyClockRegistrationV2Transport; commands: Command[]; world: vm.Context;
  state: { current: boolean; offset: number; expireAfter: number; duplicate: boolean; wrongCallbackRole: boolean; wrongSource: boolean; scopeReads: number } }> {
  const commands: Command[] = [], world = vm.createContext({}); vm.runInContext(setup, world);
  const state = { current: true, offset: 0, expireAfter: 0, duplicate: false, wrongCallbackRole: false, wrongSource: false, scopeReads: 0 };
  const response = (command: Command): unknown => {
    if (command.phase === "release") { return {}; }
    if (command.method === "Debugger.getScriptSource") {
      const role = command.phase === "wrapper-source" ? "wrapper" : "callback"; assert.equal(command.params.scriptId, role === "wrapper" ? "preload" : "ws");
      const full = completeSources[role]; assert.ok(full !== undefined); return { scriptSource: state.wrongSource ? `!${full.slice(1)}` : full };
    }
    if (command.phase === "initial" || command.phase === "bindings") {
      const expression = command.phase === "initial" ? `first=(${CALLS.initial.program}).call(route,path,branch,tab)` : `original=(${CALLS.bindings.program}).call(clockScope,wrapperScope,first,callback,path,branch,tab)`;
      vm.runInContext(expression, world);
      return { result: { type: "object", subtype: "array", className: "Array", objectId: command.phase, description: command.phase === "initial" ? "Array(10)" : "Array(4)" } };
    }
    if (command.phase === "callback") {
      const originalCallback: unknown = vm.runInContext(`(${CALLS.callback.program}).call(wrapperScope)===callback`, world);
      if (originalCallback !== true) {
        return { result: { type: "function", className: "Function", objectId: "replacement", description: "()=>{}" } };
      }
      return { result: { type: "function", className: "Function", objectId: "callback", description: functions.callback } };
    }
    if (command.method === "Runtime.getProperties") {
      const id = command.params.objectId;
      if (id === "initial" || id === "bindings") { return bundle(id); }
      if (id === "wrapper" || id === "callback") { return metadata(id === "callback" && state.wrongCallbackRole ? "wrapper" : id, id === "wrapper" && state.duplicate); }
      if (id === "native-now" || id === "native-name") { return { result: [property("name", { type: "string", value: id === "native-now" ? "now" : "get name" }), property("length", { type: "number", value: 0 })], internalProperties: [
        { name: "[[Prototype]]", value: { type: "function", className: "Function", objectId: "native-parent" } },
        { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", description: "Scopes[0]", objectId: "native-scopes" } }] }; }
      if (id === "wrapper-scopes" || id === "callback-scopes") {
        state.scopeReads += 1;
        return { result: [id === "wrapper-scopes" ? "Closure (rpcService)" : "Closure", "Global"].map((description, index) => property(String(index), { type: "object", subtype: "internal#scope", className: "Object", description, objectId: `${id}-${String(state.scopeReads)}-${String(index)}` }, true, true)) };
      }
      assert.fail("unexpected descriptor request");
    }
    assert.equal(command.phase, "sample"); Reflect.set(world, "sampleOffset", state.offset); vm.runInContext("clockScope.object.Jd=sampleOffset", world);
    const value: unknown = vm.runInContext(`(${CALLS.sample.program}).call(clockScope,wrapperScope,first,callback,original,path,branch,tab)`, world);
    return { result: { type: "number", value } };
  };
  return { commands, state, world, transport: { assertCurrent(): Promise<void> { assert.ok(state.current, "original owner lost"); return Promise.resolve(); }, request(command): Promise<unknown> {
    commands.push(command); const reply = response(command); if (commands.length === state.expireAfter) { state.current = false; } return Promise.resolve(reply);
  } } };
}

void test("v2 qualifies complete role-specific source bytes and refuses copied tokens, getters and the identical unselected function location", async () => {
  const loaded = await implementation();
  for (const role of ["wrapper", "callback"] as const) {
    assertCurrentFootprintCopyClockRegistrationV2Function(role, functions[role]);
    const full = completeSources[role]; assert.ok(full !== undefined);
    const token = loaded.source.qualifyCurrentFootprintCopyClockRegistrationV2Source(role, full);
    loaded.source.requireCurrentFootprintCopyClockRegistrationV2Source(token, role);
    assert.throws(() => { loaded.source.requireCurrentFootprintCopyClockRegistrationV2Source(structuredClone(token), role); });
    assert.throws(() => { loaded.source.requireCurrentFootprintCopyClockRegistrationV2Source(token, role === "wrapper" ? "callback" : "wrapper"); });
    for (const offset of [0, Math.floor(full.length / 2), full.length - 1]) {
      assert.throws(() => loaded.source.qualifyCurrentFootprintCopyClockRegistrationV2Source(role, `${full.slice(0, offset)}!${full.slice(offset + 1)}`));
    }
    assert.throws(() => loaded.source.qualifyCurrentFootprintCopyClockRegistrationV2Source(role, full.slice(1)));
  }
  let getters = 0;
  assert.throws(() => loaded.source.captureCurrentFootprintCopyClockRegistrationV2SourceReply("wrapper", { get scriptSource(): string { getters += 1; return ""; } })); assert.equal(getters, 0);
  assert.throws(() => decodeCurrentFootprintCopyClockRegistrationV2Function(metadata("wrapper", true), "wrapper"));
  assert.throws(() => decodeCurrentFootprintCopyClockRegistrationV2Function(metadata("callback"), "wrapper"));
});

void test("mixed registration uses18 observation requests and four fresh five-request samples, retains immutable replies and issues data only", async () => {
  const loaded = await implementation(); const f = fixture(), runner = new loaded.Constructor(uiSource, f.transport, binding);
  const packet = await runner.observe(); assert.equal(f.commands.length, 18);
  assert.deepEqual(f.commands.filter(command => command.method === "Debugger.getScriptSource").map(command => command.phase), ["wrapper-source", "callback-source"]);
  for (const key of ["documentClockInvocationObserved", "responderExclusivityProven", "backendOwnershipProven", "nativeBudgetReserved", "nativeMounted", "executionAuthorized"] as const) { assert.equal(packet[key], false); }
  assert.equal(packet.wrapperCopy, "preload-La"); assert.equal(Object.hasOwn(runner, "issueInvocationLease"), false);
  assert.equal("issueInvocationLease" in runner, false);
  assert.equal(Object.keys(packet).some(key => /(?:objectId|scriptId|sessionId|path)$/iu.test(key)), false);
  for (const offset of [52, -31, 809, 0]) { f.state.offset = offset; const sample = await runner.sampleOriginal(packet); assert.equal(sample.lexicalOffset, offset); assert.equal(sample.executionAuthorized, false); }
  assert.equal(f.commands.length, 38); assert.equal(f.state.scopeReads, 12);
  await assert.rejects(runner.sampleOriginal(packet)); assert.equal(f.commands.length, 38);
  const retained = runner.retained(); assert.equal(retained.replies.length, 38); assert.equal(retained.failure, null);
  assert.ok(Object.isFrozen(retained.replies[0]));
  await runner.release(); assert.equal(f.commands.length, 39); assert.equal(runner.retained().released, true);
  assert.equal(vm.runInContext("called", f.world), 0); await assert.rejects(runner.observe()); await assert.rejects(runner.release());
});

void test("wrong copy, callback role, complete source and owner reproof fail before later stages with bounded original failure digests", async () => {
  const loaded = await implementation();
  for (const fault of ["duplicate", "wrongCallbackRole", "wrongSource"] as const) {
    const f = fixture(); f.state[fault] = true; const runner = new loaded.Constructor(uiSource, f.transport, binding);
    await assert.rejects(runner.observe()); const failure = runner.retained().failure; assert.ok(failure !== null);
    assert.ok(failure.reply !== null); assert.match(failure.reply.sha256, /^[a-f\d]{64}$/u); assert.ok(failure.reply.jsonBytes > 0);
    assert.equal(failure.executionAuthorized, false); assert.equal(failure.digestEncoding, "canonical-json-utf8");
    let expectedStage = "callback-metadata";
    if (fault === "duplicate") { expectedStage = "wrapper-metadata"; } else if (fault === "wrongSource") { expectedStage = "wrapper-source"; }
    assert.equal(failure.stage, expectedStage);
    const count = f.commands.length; await assert.rejects(runner.observe()); assert.equal(f.commands.length, count);
    await runner.release(); assert.equal(runner.retained().failure, failure); assert.equal(vm.runInContext("called", f.world), 0);
  }
  const f = fixture(); f.state.expireAfter = 9; const runner = new loaded.Constructor(uiSource, f.transport, binding);
  await assert.rejects(runner.observe(), /original owner lost/u); assert.equal(f.commands.length, 9); assert.equal(runner.retained().replies.length, 9);
  assert.equal(runner.retained().failure?.requestIndex, 9); await assert.rejects(runner.observe()); assert.equal(f.commands.length, 9);
  const before = fixture(), fresh = new loaded.Constructor(uiSource, before.transport, binding); const packet = await fresh.observe();
  before.state.current = false;
  await assert.rejects(fresh.sampleOriginal(packet), /original owner lost/u);
  assert.equal(before.commands.length, 18); assert.equal(fresh.retained().replies.length, 18);
  assert.deepEqual(fresh.retained().failure, { stage: "sample", requestIndex: null, reply: null, digestEncoding: "canonical-json-utf8", executionAuthorized: false });
});

void test("fixed mixed selectors reject original lexical, callback, bus and task replacements without invoking them", async () => {
  const loaded = await implementation();
  for (const mutation of ["wrapperScope.object.v=()=>{}", "wrapperScope.object.k=()=>{}", "wrapperScope.object.v=wrapper", "wrapperScope.object.k=callback", "wrapperScope.object.y='wrong'", "clockScope.object.Ji={}",
    "bus.pulled[topic][0].callback=()=>{}", "bus.pulled[topic].push(task)", "bus.pushed[topic]=[]", "bus.subscribed[topic]=[]",
    "Object.defineProperty(clockScope.object,'Jd',{get:forbidden})", "root.Date={now:Date.now}"]) {
    const f = fixture(); vm.runInContext(mutation, f.world); const runner = new loaded.Constructor(uiSource, f.transport, binding);
    await assert.rejects(runner.observe(), /V2_(?:BINDING|SOURCE)/u); assert.equal(vm.runInContext("called", f.world), 0);
    await runner.release();
  }
});

void test("immutable binding capture, transport identity and fixed v2 commands reject proxies, accessors, copied packets and caller programs", async () => {
  const loaded = await implementation(); const f = fixture(); let getters = 0;
  assert.throws(() => new loaded.Constructor(uiSource, new Proxy(f.transport, {}), binding));
  assert.throws(() => new loaded.Constructor(uiSource, f.transport, new Proxy(binding, {})));
  assert.throws(() => new loaded.Constructor(uiSource, f.transport, { ...binding, get uiRoute(): string { getters += 1; return "route"; } })); assert.equal(getters, 0);
  const runner = new loaded.Constructor(uiSource, f.transport, binding); const packet = await runner.observe();
  await assert.rejects(runner.sampleOriginal(structuredClone(packet))); assert.equal(f.commands.length, 18); await runner.release();
  const changed = fixture(), other = new loaded.Constructor(uiSource, changed.transport, binding); await other.observe();
  Reflect.set(changed.transport, "request", (): Promise<unknown> => Promise.resolve({}));
  await assert.rejects(other.sampleOriginal(packet)); assert.equal(changed.commands.length, 18);
  const valid = { phase: "callback", method: "Runtime.callFunctionOn", sessionId: "parent", params: { ...FLAGS, objectId: "scope", functionDeclaration: CALLS.callback.program, arguments: [], returnByValue: false } };
  assert.ok(Object.isFrozen(validateCurrentFootprintCopyClockRegistrationV2Command(valid)));
  for (const value of [{ ...valid, extra: true }, { ...valid, params: { ...valid.params, functionDeclaration: "function(){return Date.now()}" } },
    { ...valid, params: { ...valid.params, throwOnSideEffect: false } }, { phase: "source", method: "Debugger.getScriptSource", sessionId: "parent", params: { scriptId: "ws" } }]) {
    assert.throws(() => validateCurrentFootprintCopyClockRegistrationV2Command(value));
  }
});
