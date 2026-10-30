/* oxlint-disable import/max-dependencies -- Exercise the actual source qualifier, runner, selectors and native encoder together at one isolated source-issuer boundary. */
/** Synthetic CDP and native getter fixtures. No application is connected. */
import assert from "node:assert/strict";
import { decodeFixedNativeTable } from "./helpers/fixed-native-table.ts";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import vm from "node:vm";
import { transform } from "esbuild";
import { CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_CALLS as CALLS, CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_FLAGS as FLAGS,
  decodeCurrentFootprintCopyClockRegistrationFunction, validateCurrentFootprintCopyClockRegistrationCommand } from "../src/current-footprint-copy-clock-registration-contract.ts";
import type { CurrentFootprintCopyClockRegistrationCommand as Command } from "../src/current-footprint-copy-clock-registration-contract.ts";
import { CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_SOURCE as SOURCE, assertCurrentFootprintCopyClockRegistrationFunction,
  captureCurrentFootprintCopyClockRegistrationSourceReply, qualifyCurrentFootprintCopyClockRegistrationSource, requireCurrentFootprintCopyClockRegistrationSource } from "../src/current-footprint-copy-clock-registration-source.ts";
import type { CurrentFootprintCopyClockRegistrationFunction as Role } from "../src/current-footprint-copy-clock-registration-source.ts";
import type { CurrentFootprintCopyClockRegistrationRunner, CurrentFootprintCopyClockRegistrationTransport } from "../src/current-footprint-copy-clock-registration-runner.ts";
import type { CurrentFootprintCopyUiSourceQualification } from "../src/current-footprint-copy-ui-source.ts";
import { currentFootprintCopyClockRegistrationNativeCases, currentFootprintCopyClockRegistrationNativeSource } from "../src/current-footprint-copy-clock-registration-native.ts";
import { currentFootprintCopyClockRegistrationWire } from "../src/current-footprint-copy-clock-registration-wire.ts";

const fixtureFunctions = Object.freeze({
  wrapper: "s=>{try{let{message:r,replyTopic:n}=s;try{let a=t(r);a instanceof Promise?a.then(o=>{this.publish(n,{success:!0,result:o})}).catch(o=>{console.error(o),this.publish(n,{success:!1,err:String(o)})}):this.publish(n,{success:!0,result:a})}catch(a){this.publish(n,{success:!1,err:String(a)})}}finally{this.pull(e,i)}}",
  callback: "()=>Date.now()+Jd",
});
const binding = Object.freeze({ sessionId: "parent", uiRoute: "route", projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), windowTabId: "tab_1" });
const uiSource: CurrentFootprintCopyUiSourceQualification = Object.freeze({ sourceSha256: "synthetic-ui", functionCount: 9, runtimeBound: false, executionAuthorized: false });
const wsSource = Object.freeze({ sha256: SOURCE.sha256, runtimeBound: false as const });
type Data = Record<string, unknown>;
function property(name: string, value: Data, writable = false, enumerable = false, configurable = true): Data { return { name, value, writable, enumerable, configurable, isOwn: true }; }
function metadata(role: Role): Data {
  const profile = SOURCE.functions[role];
  return { result: [property("name", { type: "string", value: profile.name }), property("length", { type: "number", value: profile.arity })], internalProperties: [
    { name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: { scriptId: "ws", lineNumber: profile.lineNumber, columnNumber: profile.columnNumber } } },
    { name: "[[Prototype]]", value: { type: "function", className: "Function", objectId: "function-parent" } },
    { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", objectId: `${role}-scopes`, description: "Scopes[2]" } },
  ] };
}
function bundle(phase: "initial" | "bindings"): Data {
  const count = phase === "initial" ? 10 : 4;
  const result = Array.from({ length: count }, (_, index) => {
    let value: Data = { type: "object", objectId: `${phase}-${String(index)}` };
    const role = phase === "initial" ? "wrapper" : "callback";
    if (phase === "initial" && index === 4 || phase === "bindings" && index === 0) { value = { type: "function", className: "Function", objectId: role, description: fixtureFunctions[role] }; }
    if (phase === "initial" && index === 8) { value = { type: "function", className: "Function", objectId: "native-name" }; }
    if (phase === "initial" && index === 7) { value["className"] = "BroadcastChannel"; }
    if (phase === "bindings" && (index === 2 || index === 3)) { value = { type: "function", className: "Function", objectId: index === 3 ? "native-now" : "native-date" }; }
    return property(String(index), value, true, true);
  });
  result.push(property("length", { type: "number", value: count }, true, false, false));
  return { result, internalProperties: [{ name: "[[Prototype]]", value: { type: "object", subtype: "array", className: "Array", description: "Array(0)", objectId: "array-parent" } }] };
}
async function constructor(): Promise<typeof CurrentFootprintCopyClockRegistrationRunner> {
  const path = new URL("../src/current-footprint-copy-clock-registration-runner.ts", import.meta.url);
  const actualRequire = createRequire(path), loaded: { exports: Record<string, unknown> } = { exports: {} };
  const output = await transform(await readFile(path, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const evaluate: unknown = vm.runInThisContext(`(function(require,module,exports){${output.code}\n})`); assert.ok(typeof evaluate === "function");
  const sourceModule = actualRequire("./current-footprint-copy-clock-registration-source.ts") as unknown;
  assert.ok(sourceModule !== null && typeof sourceModule === "object");
  Reflect.apply(evaluate, undefined, [(specifier: string): unknown => {
    if (specifier === "./current-footprint-copy-ui-source.ts") { return { requireCurrentFootprintCopyUiSource: (value: unknown): void => { assert.equal(value, uiSource); } }; }
    if (specifier === "./current-footprint-copy-clock-registration-source.ts") { return { ...sourceModule,
      qualifyCurrentFootprintCopyClockRegistrationSource: (value: unknown): typeof wsSource => { assert.equal(value, "synthetic-complete-ws-source"); return wsSource; },
      requireCurrentFootprintCopyClockRegistrationSource: (value: unknown): void => { assert.equal(value, wsSource); } }; }
    return actualRequire(specifier) as unknown;
  }, loaded, loaded.exports]);
  const result = loaded.exports["CurrentFootprintCopyClockRegistrationRunner"]; assert.equal(typeof result, "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Load the original class with only the two source issuers replaced by identity-checking synthetic issuers.
  return result as typeof CurrentFootprintCopyClockRegistrationRunner;
}
function fixture(): Readonly<{ transport: CurrentFootprintCopyClockRegistrationTransport; commands: Command[]; state: { current: boolean; offset: number; expireAfter: number; wrongSource: boolean; scopeReads: number } }> {
  const commands: Command[] = [], state = { current: true, offset: 0, expireAfter: 0, wrongSource: false, scopeReads: 0 };
  const response = (command: Command): unknown => {
    if (command.phase === "release") { return {}; }
    if (command.phase === "source") { return { scriptSource: state.wrongSource ? "drift" : "synthetic-complete-ws-source" }; }
    if (command.phase === "initial" || command.phase === "bindings") { return { result: { type: "object", subtype: "array", className: "Array", objectId: command.phase, description: command.phase === "initial" ? "Array(10)" : "Array(4)" } }; }
    if (command.phase === "callback") { return { result: { type: "function", className: "Function", objectId: "callback", description: fixtureFunctions.callback } }; }
    if (command.method === "Runtime.getProperties") {
      const id = command.params.objectId;
      if (id === "initial" || id === "bindings") { return bundle(id); }
      if (id === "wrapper" || id === "callback") { return metadata(id); }
      if (id === "native-now" || id === "native-name") { return { result: [property("name", { type: "string", value: id === "native-now" ? "now" : "get name" }), property("length", { type: "number", value: 0 })], internalProperties: [
        { name: "[[Prototype]]", value: { type: "function", className: "Function", objectId: "native-parent" } },
        { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", description: "Scopes[0]", objectId: "native-scopes" } }] }; }
      if (id === "wrapper-scopes" || id === "callback-scopes") {
        state.scopeReads += 1;
        return { result: [id === "wrapper-scopes" ? "Closure (rpcService)" : "Closure", "Global"].map((description, index) => property(String(index), { type: "object", subtype: "internal#scope", className: "Object", description, objectId: `${id}-${String(state.scopeReads)}-${String(index)}` }, true, true)) };
      }
      assert.fail("unexpected descriptor request");
    }
    assert.equal(command.phase, "sample"); return { result: { type: "number", value: state.offset } };
  };
  return { commands, state, transport: { assertCurrent(): Promise<void> { assert.ok(state.current, "original owner lost"); return Promise.resolve(); }, request(command): Promise<unknown> {
    commands.push(command); const reply = response(command); if (commands.length === state.expireAfter) { state.current = false; } return Promise.resolve(reply);
  } } };
}

void test("renderer registration retains runtime source and samples changed offsets with fresh scopes within its complete budget", async () => {
  const Constructor = await constructor(), value = fixture(); const runner = new Constructor(uiSource, value.transport, binding); const packet = await runner.observe();
  assert.equal(value.commands.length, 17); assert.equal(value.commands[3]?.phase, "source"); assert.equal(packet.initialLexicalOffset, 0);
  assert.equal(packet.documentClockInvocationObserved, false); assert.equal(packet.responderExclusivityProven, false); assert.equal(packet.backendOwnershipProven, false);
  for (const offset of [52, -31, 809, 0]) { value.state.offset = offset; const observed = await runner.sampleOriginal(packet); assert.equal(observed.lexicalOffset, offset); assert.equal(observed.documentClockInvocationObserved, false); }
  assert.equal(value.commands.length, 37); assert.equal(value.state.scopeReads, 12);
  await assert.rejects(runner.sampleOriginal(packet)); assert.equal(value.commands.length, 37); await runner.release(); assert.equal(value.commands.length, 38);
  await assert.rejects(runner.observe()); await assert.rejects(runner.release());
});
void test("runtime source drift and original owner loss stop before following further scopes; copied receipts cannot authorize sampling", async () => {
  const Constructor = await constructor(), wrong = fixture(); wrong.state.wrongSource = true;
  const drift = new Constructor(uiSource, wrong.transport, binding); await assert.rejects(drift.observe()); assert.equal(wrong.commands.at(-1)?.phase, "source"); assert.equal(wrong.state.scopeReads, 0); await drift.release();
  const lost = fixture(); lost.state.expireAfter = 9;
  const owner = new Constructor(uiSource, lost.transport, binding); await assert.rejects(owner.observe(), /original owner lost/u); assert.equal(owner.retained().replies.length, 9); await assert.rejects(owner.observe()); assert.equal(lost.commands.length, 9);
  const copied = fixture(), runner = new Constructor(uiSource, copied.transport, binding); const packet = await runner.observe();
  await assert.rejects(runner.sampleOriginal(structuredClone(packet))); assert.equal(copied.commands.length, 17); await runner.release();
});

const setup = String.raw`
let called=0;const forbidden=()=>{called++;throw Error("must not invoke");};
class BroadcastChannel{constructor(name){this.channelName=name;}}
const nameEntry={get name(){return this.channelName;}},getter=Object.getOwnPropertyDescriptor(nameEntry,"name").get;
Object.defineProperty(BroadcastChannel.prototype,"name",{get:getter,enumerable:true,configurable:true});
// Node has no browser-native name getter. Only this one signature is synthetic.
const nativeToString=Function.prototype.toString;Function.prototype.toString=function(){return this===getter?"function get name() { [native code] }":Reflect.apply(nativeToString,this,[]);};
const path="a".repeat(64),branch="b".repeat(32),tab="tab_1",topic="/pro-mgr/serverTime/now";
const wrapper=forbidden,callback=forbidden,task={callback:wrapper,isRunning:true,unsafe:true},queue=[task];
const project={projectId:path,branchUuid:branch},bus={pulled:{[topic]:queue},pushed:{},subscribed:{},bc:new BroadcastChannel("/tab_1/notify")};
const host={currentProject:project,concurrentBus:bus},root={gVars:host,_TAB_ID_:tab,"/tab_1/notify":bus,BroadcastChannel,Date};
const notification=[wrapper,root,host,project,bus,[],{}],route=Array(17).fill({});route[14]=notification;
const wrapperScope={object:{t:callback,e:topic,i:wrapper}},clockScope={object:{Ji:bus,Jd:0}};
`;
function world(): vm.Context { const context = vm.createContext({}); vm.runInContext(`${setup}\nconst first=(${CALLS.initial.program}).call(route,path,branch,tab);const original=(${CALLS.bindings.program}).call(clockScope,wrapperScope,first,callback,path,branch,tab);`, context); return context; }
function sample(context: vm.Context): unknown { return vm.runInContext(`(${CALLS.sample.program}).call(clockScope,wrapperScope,first,callback,original,path,branch,tab)`, context); }
void test("fixed selectors use the actual pulled registration and permit only the original wrapper when the native task recycles", () => {
  const context = world(); assert.equal(sample(context), 0);
  vm.runInContext("clockScope.object.Jd=-152;bus.pulled[topic]=[{callback:wrapper,isRunning:true,unsafe:true}]", context); assert.equal(sample(context), -152);
  assert.equal(vm.runInContext(`(${CALLS.callback.program}).call(wrapperScope)===callback`, context), true); assert.equal(vm.runInContext("called", context), 0);
});
void test("wrong receiver, offset, competing local registration and accessor shadows refuse without invoking callbacks", () => {
  for (const mutation of ["clockScope.object.Ji={}", "clockScope.object.Jd=NaN", "clockScope.object.Jd=-0", "clockScope.object.Jd=1.5", "wrapperScope.object.t=()=>{}", "wrapperScope.object.i=()=>{}",
    "bus.pulled[topic][0].callback=()=>{}", "bus.pulled[topic][0].unsafe=false", "bus.pulled[topic].push(task)", "bus.subscribed[topic]=[]", "bus.pushed[topic]=[]", "bus.bc.channelName='wrong'",
    "project.branchUuid='c'.repeat(32)", "Object.defineProperty(clockScope.object,'Jd',{get:forbidden})", "Object.defineProperty(bus.bc,'name',{get:forbidden})", "root.Date={now:Date.now}"]) {
    const context = world(); vm.runInContext(mutation, context); assert.throws(() => sample(context), /FOOTPRINT_COPY_CLOCK_REGISTRATION_BINDING/u); assert.equal(vm.runInContext("called", context), 0);
  }
});
void test("source, location and fixed command grammar reject substitutes before any invocation", () => {
  for (const role of ["wrapper", "callback"] as const) { assertCurrentFootprintCopyClockRegistrationFunction(role, fixtureFunctions[role]); assert.throws(() => { assertCurrentFootprintCopyClockRegistrationFunction(role, `${fixtureFunctions[role]} `); }); }
  assert.deepEqual(decodeCurrentFootprintCopyClockRegistrationFunction(metadata("callback"), "callback", "ws"), { scriptId: "ws", scopesId: "callback-scopes" });
  assert.throws(() => decodeCurrentFootprintCopyClockRegistrationFunction(metadata("callback"), "callback", "unrelated"));
  assert.throws(() => qualifyCurrentFootprintCopyClockRegistrationSource("changed")); assert.throws(() => { requireCurrentFootprintCopyClockRegistrationSource(structuredClone(wsSource)); });
  let called = 0; assert.throws(() => captureCurrentFootprintCopyClockRegistrationSourceReply({ get scriptSource(): string { called += 1; return ""; } })); assert.equal(called, 0);
  const valid = { phase: "callback", method: "Runtime.callFunctionOn", sessionId: "parent", params: { ...FLAGS, objectId: "scope", functionDeclaration: CALLS.callback.program, arguments: [], returnByValue: false } };
  assert.ok(Object.isFrozen(validateCurrentFootprintCopyClockRegistrationCommand(valid)));
  for (const changed of [{ ...valid, extra: true }, { ...valid, params: { ...valid.params, functionDeclaration: "function(){return Date.now()}" } }, { ...valid, params: { ...valid.params, throwOnSideEffect: false } }]) { assert.throws(() => validateCurrentFootprintCopyClockRegistrationCommand(changed)); }
});
void test("native registration vocabulary preserves every fixed command and cannot substitute a session or program", async () => {
  const cases = currentFootprintCopyClockRegistrationNativeCases(); assert.equal(cases.length, 7);
  const native = currentFootprintCopyClockRegistrationNativeSource();
  const { rows } = await decodeFixedNativeTable(native, 7, 4);
  for (const [index, command] of cases.entries()) {
    const wire = currentFootprintCopyClockRegistrationWire(command, 52, command.sessionId);
    assert.equal(wire.request["parentPhase"], `footprint-copy-clock-registration-${command.phase}`); assert.equal(Object.hasOwn(wire.request, "sessionId"), false); assert.equal(Object.hasOwn(wire.request, "functionDeclaration"), false);
    assert.throws(() => currentFootprintCopyClockRegistrationWire(command, 52, "different"));
    const fields = rows[index]?.split("\t"); assert.ok(fields !== undefined); assert.equal(fields[0], command.phase); assert.equal(fields[1], command.method);
    const template = fields[3]; assert.ok(template !== undefined);
    const restored = template.replaceAll(/"__copyregistration_([A-Za-z\d]+)__"/gu, (_all, name: string) => JSON.stringify(name === "sessionId" ? command.sessionId : wire.request[name]));
    const { phase: _phase, ...expected } = command; assert.deepEqual(JSON.parse(restored), expected);
  }
  assert.match(native, /originalParentSession/u); assert.match(native, /fields.Count==names.Length/u);
});
