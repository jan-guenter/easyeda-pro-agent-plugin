/* oxlint-disable import/max-dependencies -- Exercise the actual runner, fixed selectors and native grammar with an explicitly isolated source issuer boundary. */
/** Synthetic CDP test; no editor or original runtime owner is connected. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInNewContext, runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { CURRENT_FOOTPRINT_COPY_MANAGER_ROUTE_SOURCE as SOURCE, assertCurrentFootprintCopyManagerRouteFunction, captureCurrentFootprintCopyManagerRouteSourceReply, qualifyCurrentFootprintCopyManagerRouteSource, requireCurrentFootprintCopyManagerRouteSource } from "../src/current-footprint-copy-manager-route-source.ts";
import type { CurrentFootprintCopyManagerRouteFunction as Role } from "../src/current-footprint-copy-manager-route-source.ts";
import { CURRENT_FOOTPRINT_COPY_MANAGER_ROUTE_CALLS as CALLS } from "../src/current-footprint-copy-manager-route-bindings.ts";
import type { CurrentFootprintCopyManagerRouteRunner, CurrentFootprintCopyManagerRouteTransport } from "../src/current-footprint-copy-manager-route-runner.ts";
import { currentFootprintCopyManagerRouteObservationSchema, recordedCurrentFootprintCopyManagerRouteObservationSchema } from "../src/current-footprint-copy-manager-route-runner.ts";
import { validateCurrentFootprintCopyManagerRouteCommand } from "../src/current-footprint-copy-manager-route-command.ts";
import type { CurrentFootprintCopyManagerRouteCommand as Command } from "../src/current-footprint-copy-manager-route-command.ts";
import { currentFootprintCopyManagerRouteNativeCases, currentFootprintCopyManagerRouteNativeSource } from "../src/current-footprint-copy-manager-route-native.ts";
import { currentFootprintCopyManagerRouteWire } from "../src/current-footprint-copy-manager-route-wire.ts";
import type { CurrentFootprintCopyUiSourceQualification } from "../src/current-footprint-copy-ui-source.ts";
import { FOOTPRINT_COPY_MANAGER_ROUTE_FIXTURE as FIXTURE } from "./current-footprint-copy-manager-route-fixture.ts";

const sourceModule = { CURRENT_FOOTPRINT_COPY_MANAGER_ROUTE_SOURCE: SOURCE, assertCurrentFootprintCopyManagerRouteFunction, captureCurrentFootprintCopyManagerRouteSourceReply, qualifyCurrentFootprintCopyManagerRouteSource, requireCurrentFootprintCopyManagerRouteSource };
const uiSource: CurrentFootprintCopyUiSourceQualification = Object.freeze({ sourceSha256: "synthetic-ui", functionCount: 9, runtimeBound: false, executionAuthorized: false });
const managerSource = Object.freeze({ sha256: SOURCE.sha256, runtimeBound: false as const });
const binding = Object.freeze({ sessionId: "parent", uiScriptId: "ui", uiRoute: "ui-route", projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), windowTabId: "tab_1" });
type Data = Record<string, unknown>;
const property = (name: string, value: Data, writable = false, enumerable = false, configurable = true):
  { name: string; value: Data; writable: boolean; enumerable: boolean; configurable: boolean; isOwn: true } => ({ name, value, writable, enumerable, configurable, isOwn: true });
function metadata(role: Role): Data {
  const profile = SOURCE.functions[role], result = [property("name", { type: "string", value: profile.name }), property("length", { type: "number", value: profile.arity })];
  if (profile.prototype) { result.push(property("prototype", { type: "object", objectId: "own-prototype" }, true, false, false)); }
  return { result, internalProperties: [
    { name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: { scriptId: profile.bundle, lineNumber: profile.lineNumber, columnNumber: profile.columnNumber } } },
    { name: "[[Prototype]]", value: { type: profile.async ? "object" : "function", className: profile.async ? "AsyncFunction" : "Function", objectId: "function-parent" } },
    { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", objectId: `${role}-scopes`, description: "Scopes[2]" } },
  ] };
}
function bundle(kind: "initial" | "registry" | "project", wrapper: "rpcUi" | "rpcManager"): Data {
  const count = { initial: 5, registry: 12, project: 11 }[kind];
  const roles: Record<typeof kind, readonly Role[]> = { initial: [wrapper], registry: ["registryLookup", "registryInstance", "registryGet", "channelProducer"], project: ["footprintGetStr", "workerRpcCall"] };
  const result = Array.from({ length: count }, (_, index) => {
    const role = roles[kind][index]; let value: Data;
    if (role !== undefined) { value = { type: "function", className: SOURCE.functions[role].async ? "AsyncFunction" : "Function", description: FIXTURE[role], objectId: role }; }
    else if (kind === "registry" && index === 4) { value = { type: "function", className: "Function", description: "function get() { [native code] }", objectId: "native-get" }; }
    else if (kind === "project" && index === 10) { value = { type: "function", className: "Function", description: "function get name() { [native code] }", objectId: "native-name" }; }
    else { value = { type: kind === "registry" && (index === 5 || index === 8) ? "function" : "object", objectId: `${kind}-${String(index)}` }; }
    if (kind === "project" && (index === 5 || index === 6)) { value["className"] = index === 5 ? "Worker" : "BroadcastChannel"; }
    return property(String(index), value, true, true);
  });
  result.push(property("length", { type: "number", value: count }, true, false, false));
  return { result, internalProperties: [{ name: "[[Prototype]]", value: { type: "object", subtype: "array", className: "Array", description: "Array(0)", objectId: "array-parent" } }] };
}
async function constructor(): Promise<typeof CurrentFootprintCopyManagerRouteRunner> {
  const path = new URL("../src/current-footprint-copy-manager-route-runner.ts", import.meta.url);
  const actualRequire = createRequire(path), loaded: { exports: Record<string, unknown> } = { exports: {} };
  const program = await transform(await readFile(path, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${program.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(specifier: string): unknown => {
    if (specifier === "./current-footprint-copy-ui-source.ts") { return { requireCurrentFootprintCopyUiSource: (value: unknown): void => { assert.equal(value, uiSource); } }; }
    if (specifier === "./current-footprint-copy-manager-route-source.ts") { return { ...sourceModule,
      qualifyCurrentFootprintCopyManagerRouteSource: (text: unknown): typeof managerSource => { assert.equal(text, "synthetic-exact-runtime-manager-source"); return managerSource; },
      requireCurrentFootprintCopyManagerRouteSource: (value: unknown): void => { assert.equal(value, managerSource); } }; }
    return actualRequire(specifier) as unknown;
  }, loaded, loaded.exports]);
  const result = loaded.exports["CurrentFootprintCopyManagerRouteRunner"]; assert.ok(typeof result === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The actual class is loaded with only complete vendor-source issuance stubbed above.
  return result as typeof CurrentFootprintCopyManagerRouteRunner;
}
function fixture(wrapper: "rpcUi" | "rpcManager" = "rpcUi"): Readonly<{ commands: Command[]; transport: CurrentFootprintCopyManagerRouteTransport; state: { current: boolean; expireAfter: number; sourceMismatch: boolean; recheckFails: boolean; scopeReads: number } }> {
  const commands: Command[] = [], state = { current: true, expireAfter: 0, sourceMismatch: false, recheckFails: false, scopeReads: 0 };
  const response = (command: Command): unknown => {
    if (command.phase === "release") { return {}; }
    if (command.phase === "source") { return { scriptSource: state.sourceMismatch ? "changed" : "synthetic-exact-runtime-manager-source" }; }
    if (command.phase === "initial" || command.phase === "registry" || command.phase === "project") { return { result: { type: "object", subtype: "array", className: "Array", objectId: command.phase, description: `Array(${String({ initial: 5, registry: 12, project: 11 }[command.phase])})` } }; }
    if (command.phase === "serviceUi" || command.phase === "serviceManager") { return { result: { type: "function", className: "AsyncFunction", description: FIXTURE.service, objectId: "service" } }; }
    if (command.phase === "handler") { return { result: { type: "function", className: "AsyncFunction", description: FIXTURE.handler, objectId: "handler" } }; }
    if (command.method === "Runtime.getProperties") {
      const id = command.params.objectId;
      if (id === "initial" || id === "registry" || id === "project") { return bundle(id, wrapper); }
      if (id === "native-get" || id === "native-name") { return { result: [property("name", { type: "string", value: id === "native-get" ? "get" : "get name" }), property("length", { type: "number", value: id === "native-get" ? 1 : 0 })], internalProperties: [
        { name: "[[Prototype]]", value: { type: "function", className: "Function", objectId: "native-parent" } },
        { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", description: "Scopes[0]", objectId: "native-scopes" } }] }; }
      if (id.endsWith("-scopes")) {
        const role = id.slice(0, -7); state.scopeReads += 1;
        let description = "Closure"; if (role.startsWith("rpc")) { description = "Closure (rpcService)"; } else if (role === "service") { description = "Closure (V)"; }
        return { result: [description, "Global"].map((text, index) => property(String(index), { type: "object", subtype: "internal#scope", className: "Object", description: text, objectId: `${id}-${String(state.scopeReads)}-${String(index)}` }, true, true)) };
      }
      assert.ok(Object.hasOwn(SOURCE.functions, id));
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Exact profile membership was asserted immediately above.
      return metadata(id as Role);
    }
    if (state.recheckFails) { return { exceptionDetails: { text: "route changed" } }; }
    return { result: { type: "boolean", value: true } };
  };
  return { commands, state, transport: { assertCurrent(): Promise<void> { assert.ok(state.current, "original parent lost"); return Promise.resolve(); }, request(command): Promise<unknown> {
    commands.push(command); const reply = response(command); if (commands.length === state.expireAfter) { state.current = false; } return Promise.resolve(reply);
  } } };
}
void test("manager route qualifies runtime source before scopes and retains both pinned bus variants", async () => {
  const Constructor = await constructor();
  for (const wrapper of ["rpcUi", "rpcManager"] as const) {
    const value = fixture(wrapper);
    const runner = new Constructor(uiSource, value.transport, binding);
    const packet = await runner.observe();
    assert.equal(value.commands.length, 30); assert.equal(value.commands.filter(command => command.phase === "source").length, 1);
    const sourceIndex = value.commands.findIndex(command => command.phase === "source"); assert.equal(sourceIndex, wrapper === "rpcUi" ? 6 : 3);
    const next = value.commands[sourceIndex + 1]; assert.equal(next?.method, "Runtime.getProperties");
    assert.equal(packet.projectChannelNameMatched, true); assert.equal(packet.reciprocalWorkerPeerBound, false); assert.equal(packet.backendDynamicDispatchQualified, false);
    await runner.requireOriginal(packet); assert.equal(value.commands.length, 37); assert.equal(value.state.scopeReads, 9);
    await runner.release(); assert.equal(value.commands.length, 38); await assert.rejects(runner.release()); await assert.rejects(runner.observe());
  }
});
void test("manager runtime source mismatch stops before following manager closure or invoking registry", async () => {
  const Constructor = await constructor(), value = fixture(); value.state.sourceMismatch = true;
  const runner = new Constructor(uiSource, value.transport, binding); await assert.rejects(runner.observe());
  assert.equal(value.commands.at(-1)?.phase, "source"); assert.equal(runner.retained().replies.length, 7); await runner.release();
  assert.throws(() => sourceModule.qualifyCurrentFootprintCopyManagerRouteSource("changed"));
  for (const role of ["rpcUi", "rpcManager", "workerRpcCall", "registryGet", "registryInstance", "footprintGetStr", "channelProducer", "registryLookup", "service", "handler"] as const) { sourceModule.assertCurrentFootprintCopyManagerRouteFunction(role, FIXTURE[role]); }
});
void test("manager owner loss retains reply and consumes attempt; copied packets never rebind", async () => {
  const Constructor = await constructor(), lost = fixture(); lost.state.expireAfter = 12;
  const first = new Constructor(uiSource, lost.transport, binding); await assert.rejects(first.observe(), /original parent lost/u);
  assert.equal(first.retained().replies.length, 12); await assert.rejects(first.observe()); assert.equal(lost.commands.length, 12);
  const value = fixture();
  const runner = new Constructor(uiSource, value.transport, binding);
  const packet = await runner.observe();
  await assert.rejects(runner.requireOriginal(structuredClone(packet))); assert.equal(value.commands.length, 30); await runner.release();
});
void test("manager fixed route inspects initialized Map and worker bus without calling lazy initializers", () => {
  const expression = String.raw`(()=>{let called=0;class Base{get(k){called++;throw Error("must not invoke registry get");}}class Registry extends Base{static getInstance(){called++;throw Error("must not initialize");}}
class Footprint{constructor(project){this.project=project;}getStr(){called++;throw Error("must not invoke getStr");}}class Rpc{rpcCall(){called++;throw Error("must not RPC");}}class BroadcastBase extends Rpc{}class Broadcast extends BroadcastBase{}
// The single native-accessor boundary is synthetic. Node has no browser-native BroadcastChannel name getter.
class BroadcastChannel{constructor(name){this.channelName=name;}}Object.defineProperty(globalThis,"BroadcastChannel",{value:BroadcastChannel,configurable:true});
const nameEntry={get name(){return this.channelName;}},nameGetter=Object.getOwnPropertyDescriptor(nameEntry,"name").get;
Object.defineProperty(BroadcastChannel.prototype,"name",{get:nameGetter,enumerable:true,configurable:true});const nativeToString=Function.prototype.toString;Function.prototype.toString=function(){return this===nameGetter?"function get name() { [native code] }":Reflect.apply(nativeToString,this,[]);};
const root={},host={},uiProject={projectId:path,branchUuid:branch},bus={subscribed:{"/PrjDB/footprint/getStr":[{callback:()=>{},isRunning:true}]}},notification=[()=>{},root,host,uiProject,{},[],{}],route=Array(17).fill({});route[12]=bus;route[14]=notification;root.gVars=host;host.currentProject=uiProject;root._TAB_ID_=tab;root._MSG_BUS_=bus;host.messageBus=bus;
Registry.tool=new Registry;Registry.tool.map=new Map;const project={uuid:path,_projectDetail:{currentBranch:branch},isReady:true,_isOpening:false,_isClosing:false,mainBus:bus,worker:{},workerBus:new Broadcast};project.footprint=new Footprint(project);const channel="/"+tab+"/project/"+path;project.workerBus.uuid="11111111-2222-3333-4444-555555555555";project.workerBus.bc=new BroadcastChannel(channel);root[channel]=project.workerBus;Registry.tool.map.set(path,project);
const scope={object:{K(){},so:Registry,Hn(){called++;throw Error("must not initialize");},V0:Footprint,J:{footprint:{getStr:"/mgr/projectWorker/footprint/getStr"}},Ee:{messageBus:bus,currentProject:{projectId:path,branchUuid:branch}}}};
const first=Reflect.apply(initial,route,[path,branch,tab]),reg=Reflect.apply(registry,scope,[first,path,branch,tab]),selected=Reflect.apply(select,scope,[reg,first,path,branch,tab]);
if(selected[2]!==project||selected[4]!==project.workerBus||selected[10]!==nameGetter||called!==0)throw Error("wrong ownership");
project.workerBus.bc.channelName="unrelated";let nameRefused=false;try{Reflect.apply(select,scope,[reg,first,path,branch,tab]);}catch{nameRefused=true;}if(!nameRefused)throw Error("wrong channel accepted");project.workerBus.bc.channelName=channel;
Object.defineProperty(project.workerBus.bc,"name",{get(){called++;throw Error("must not call own getter");},configurable:true});let ownRefused=false;try{Reflect.apply(select,scope,[reg,first,path,branch,tab]);}catch{ownRefused=true;}if(!ownRefused||called!==0)throw Error("own getter called");delete project.workerBus.bc.name;
Registry.tool=null;let refused=false;try{Reflect.apply(select,scope,[reg,first,path,branch,tab]);}catch{refused=true;}if(!refused||called!==0)throw Error("lazy initializer called");return true;})()`;
  const script = `const initial=${CALLS.initial.program},registry=${CALLS.registry.program},select=${CALLS.project.program};${expression}`;
  assert.equal(runInNewContext(script, { path: binding.projectUuid, branch: binding.branchUuid, tab: binding.windowTabId }, { timeout: 1000, contextCodeGeneration: { strings: false, wasm: false } }), true);
});
void test("manager native vocabulary fixes all eleven commands and excludes caller session or program fields", () => {
  const cases = currentFootprintCopyManagerRouteNativeCases(); assert.equal(cases.length, 11);
  for (const command of cases) {
    const wire = currentFootprintCopyManagerRouteWire(command, 1); assert.equal(wire.request["parentPhase"], `footprint-copy-manager-route-${command.phase}`); assert.equal(Object.hasOwn(wire.request, "sessionId"), false);
    assert.throws(() => validateCurrentFootprintCopyManagerRouteCommand({ ...command, extra: true }));
    if (command.method === "Runtime.callFunctionOn") { assert.throws(() => validateCurrentFootprintCopyManagerRouteCommand({ ...command, params: { ...command.params, functionDeclaration: "function(){return true}" } })); }
  }
  const native = currentFootprintCopyManagerRouteNativeSource(); assert.match(native, /rows.Length==11/u); assert.match(native, /originalParentSession/u);
});

void test("manager source capture accepts its full fixed byte count and rejects accessors without invoking them", () => {
  const text = "x".repeat(SOURCE.bytes), value = captureCurrentFootprintCopyManagerRouteSourceReply({ scriptSource: text });
  assert.equal(value.scriptSource, text); assert.ok(Object.isFrozen(value));
  assert.throws(() => captureCurrentFootprintCopyManagerRouteSourceReply({ scriptSource: `${text}x` }));
  let called = false;
  assert.throws(() => captureCurrentFootprintCopyManagerRouteSourceReply({ get scriptSource(): string { called = true; return text; } })); assert.equal(called, false);
  assert.throws(() => captureCurrentFootprintCopyManagerRouteSourceReply({ scriptSource: text, extra: true }));
});
void test("manager recorded schema preserves old observations without upgrading their channel evidence", async () => {
  const Constructor = await constructor(), value = fixture();
  const runner = new Constructor(uiSource, value.transport, binding);
  const packet = await runner.observe();
  const historical = { ...packet, profile: "private.current-footprint-copy-manager-route.v1", projectChannelNameMatched: false };
  assert.deepEqual(recordedCurrentFootprintCopyManagerRouteObservationSchema.parse(historical), historical);
  assert.deepEqual(recordedCurrentFootprintCopyManagerRouteObservationSchema.parse(packet), packet);
  assert.throws(() => currentFootprintCopyManagerRouteObservationSchema.parse(historical));
  assert.throws(() => recordedCurrentFootprintCopyManagerRouteObservationSchema.parse({ ...historical, projectChannelNameMatched: true }));
  assert.throws(() => recordedCurrentFootprintCopyManagerRouteObservationSchema.parse({ ...packet, projectChannelNameMatched: false }));
  await runner.release();
});
