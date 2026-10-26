/* oxlint-disable import/max-dependencies -- This boundary test compares source fixtures, descriptors, runner and both old/new native wires in one focused suite. */
/** Synthetic descriptors and actual fixed selectors; never connected execution. */
import assert from "node:assert/strict";
import { test } from "node:test";
import vm from "node:vm";
import { CURRENT_FOOTPRINT_COPY_DEPENDENCY_CALLS as CALLS, decodeCurrentFootprintCopyDependencies,
  decodeCurrentFootprintCopyDependencyFunction } from "../src/current-footprint-copy-dependency-bindings.ts";
import { CURRENT_FOOTPRINT_COPY_DEPENDENCY_PROFILES as PROFILES } from "../src/current-footprint-copy-dependency-profiles.ts";
import { CurrentFootprintCopyDependencyRunner, currentFootprintCopyDependencyObservationSchema } from "../src/current-footprint-copy-dependency-runner.ts";
import { CURRENT_FOOTPRINT_COPY_LEXICAL_PROFILES as DIRECT } from "../src/current-footprint-copy-producer-scope.ts";
import { currentFootprintCopyDependencyNativeCases, currentPcb209WorkerStartupNativeCases, currentPcbWorkerStartupNativeSource } from "../src/current-pcb-worker-startup-native.ts";
import { currentFootprintCopyPreparationWire, currentPcb209WorkerStartupWire, currentPcbWorkerStartupWire } from "../src/current-pcb-worker-startup-wire.ts";
import { CURRENT_FOOTPRINT_COPY_DEPENDENCY_FIXTURE as SOURCES } from "./helpers/current-footprint-copy-dependency-fixture.ts";
import { FOOTPRINT_PRODUCER_SOURCE_FIXTURE as DIRECT_SOURCES } from "./helpers/current-footprint-copy-producer-fixture.ts";

type Data = Record<string, unknown>;
const property = (name: string, value: Data, writable = false, enumerable = false, configurable = true): Data =>
  ({ name, value, writable, enumerable, configurable, isOwn: true });
const yes = { result: { type: "boolean", value: true } };
function arrayReply(direct = false): Data {
  const profiles = direct ? DIRECT : PROFILES, sources = direct ? DIRECT_SOURCES : SOURCES;
  const result = profiles.map((entry, index) => property(String(index), { type: "function", className: entry.async ? "AsyncFunction" : "Function",
    description: sources[index], objectId: `${direct ? "direct" : "dependency"}-${String(index)}` }, true, true));
  if (direct) {
    result.push(...[7, 8].map(index => property(String(index), { type: "object", className: "Object", description: "Object", objectId: `enum-${String(index)}` }, true, true)),
      property("9", { type: "string", value: "|\n" }, true, true));
  } else {
    result.push(...["JP", "Cache", "Cache"].map((className, index) => property(String(index + 53), { type: "object", className, objectId: `runtime-${String(index)}` }, true, true)));
  }
  result.push(property("length", { type: "number", value: direct ? 10 : 56 }, true, false, false));
  return { result, internalProperties: [{ name: "[[Prototype]]", value: { type: "object", subtype: "array", className: "Array", description: "Array(0)", objectId: "array-prototype" } }] };
}
function functionReply(index: number, direct = false): Data {
  const profile = direct ? DIRECT[index] : PROFILES[index]; assert.ok(profile);
  const result = [property("length", { type: "number", value: profile.arity }), property("name", { type: "string", value: profile.name })];
  const isClass = "class" in profile ? profile.class : profile.kind === "class", method = "kind" in profile && profile.kind === "method";
  if (!profile.async && !method) { result.push(property("prototype", { type: "object", objectId: "own-prototype" }, !isClass, false, false)); }
  return { result, internalProperties: [
    { name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: { scriptId: "script",
      lineNumber: "line" in profile ? profile.line : profile.lineNumber, columnNumber: "column" in profile ? profile.column : profile.columnNumber } } },
    { name: "[[Prototype]]", value: { type: profile.async ? "object" : "function", objectId: "function-prototype" } },
    { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", description: "Scopes[2]", objectId: `scopes-${String(index)}` } },
  ] };
}
function owner(): { runner: CurrentFootprintCopyDependencyRunner; calls: string[]; failFinal: () => void; loseAfterReply: () => void } {
  const calls: string[] = []; let current = true, lose = false, valid = true;
  const runner = new CurrentFootprintCopyDependencyRunner(Object.freeze({
    lexicalBundleObjectId: "lexicals", assertCurrent: (): void => { assert.ok(current, "owner lost"); },
    properties: (id: string): Promise<unknown> => {
      calls.push(id); if (lose) { current = false; }
      if (id === "lexicals" || id === "dependencies") { return Promise.resolve(arrayReply(id === "lexicals")); }
      if (id.startsWith("scopes-")) { return Promise.resolve({ result: ["Closure", "Global"].map((description, index) => property(String(index), {
        type: "object", subtype: "internal#scope", className: "Object", description, objectId: `${id}-${String(index)}`,
      }, true, true)) }); }
      const index = Number(id.split("-")[1]);
      return Promise.resolve(functionReply(index, id.startsWith("direct-")));
    },
    capture: (scope: string): Promise<unknown> => { calls.push(`capture-${scope}`); return Promise.resolve({ result: { type: "object", subtype: "array", className: "Array", description: "Array(56)", objectId: "dependencies" } }); },
    recheck: (scope: string, bundle: string): Promise<unknown> => { calls.push(`recheck-${scope}`); assert.equal(bundle, "dependencies"); return Promise.resolve(valid ? yes : { result: { type: "boolean", value: false } }); },
  }), "script");
  return { runner, calls, failFinal: (): void => { valid = false; }, loseAfterReply: (): void => { lose = true; } };
}

void test("dependency profiles match complete pinned sources and JavaScript arities without invoking them", () => {
  assert.equal(decodeCurrentFootprintCopyDependencies(arrayReply()).length, 53);
  const context = vm.createContext({}), done = new Set<string>();
  function compile(index: number): void {
    const profile = PROFILES[index], source = SOURCES[index]; assert.ok(profile && source);
    if (done.has(profile.key)) { return; }
    if (profile.kind === "class" && profile.parent !== null) { compile(PROFILES.findIndex(item => item.key === profile.parent)); }
    const expression = profile.kind === "method" ? `({${source}})[${JSON.stringify(profile.name)}]` : `(${source})`;
    const declaration = profile.kind === "class" ? `const ${profile.key}=selected${String(index)};` : "";
    const arity: unknown = vm.runInContext(`const selected${String(index)}=${expression};${declaration}selected${String(index)}.length`, context);
    assert.equal(arity, profile.arity, profile.key); done.add(profile.key);
    decodeCurrentFootprintCopyDependencyFunction(functionReply(index), "script", index);
    assert.throws(() => decodeCurrentFootprintCopyDependencyFunction(functionReply(index), "other-script", index));
  }
  for (const index of PROFILES.keys()) { compile(index); }
  assert.equal(done.size, 53);
  const altered = arrayReply(); assert.ok(Array.isArray(altered["result"]));
  altered["result"][0] = property("0", { type: "function", className: "Function", description: "function wa(){}", objectId: "replacement" }, true, true);
  assert.throws(() => decodeCurrentFootprintCopyDependencies(altered));
});

function fixedWorld(): vm.Context {
  const context = vm.createContext({});
  const selected = PROFILES.map(profile => ({ key: profile.key, kind: profile.kind, parent: profile.parent }));
  vm.runInContext(`const selected=${JSON.stringify(selected)};let calls=0;const scope={};const stop=()=>{calls++;throw Error('invoked');};
    function define(name,parent){if(scope[name])return scope[name];const inherited=parent??selected.find(p=>p.key===name)?.parent;const base=inherited?define(inherited):null;const c=base?class extends base{}:class{};scope[name]=c;return c;}
    for(const [name,parent]of [['Gd',null],['Lg','Gd'],['Pi',null],['ar','Pi'],['Tg','ar'],['zy',null],['Vc','zy'],['ja','Vc'],['Mb',null],['KP','Mb'],['JP','KP']])define(name,parent);
    for(const p of selected.filter(p=>p.kind==='class'))define(p.key,p.parent);
    for(const p of selected){if(p.kind==='function')scope[p.key]=stop;else if(p.kind==='method'){const [owner,key]=p.key.split('.');Object.defineProperty(scope[owner].prototype,key,{value:stop,writable:true,enumerable:false,configurable:true});}}
    for(const key of ['qe','Qe','Ke','Ni','cg'])scope[key]=stop;
    const project=Object.create(scope.Lg.prototype),manager=Object.create(scope.Tg.prototype),consistency=Object.create(scope.ja.prototype),bus={};
    const constructors=[scope.Tg,scope.ar,scope.Pi,scope.ja,scope.Vc,scope.zy],lexicals=[stop,stop,scope.qe,scope.Qe,scope.Ke,scope.Ni,scope.cg,{}, {},'|\\n'];
    const notification=Object.create(scope.JP.prototype);notification.uuid='12345678-1234-1234-1234-123456789abc';notification.rpcTicket=1;
    Object.assign(project,{workerBus:bus,footprint:manager,consistencyManager:consistency,wsBus:notification,cache:{},localCache:{}});Object.assign(manager,{projectManager:project,user:undefined});
    globalThis.PROJECT=project;globalThis._TAB_ID_='tab';globalThis['/tab/notify']=notification;
  `, context);
  return context;
}
void test("fixed dependency selectors retain original identities and refuse lazy bus creation, accessors and method shadows", () => {
  for (const change of ["", "delete globalThis['/tab/notify']", "scope.wa=function replacement(){}", "project.cache={}",
    "notification.rpcCall=function replacement(){}", "Object.defineProperty(scope,'oo',{get(){calls++;return stop;}})", "globalThis.EDITOR_TOP={}", "manager.user='changed'"]) {
    const context = fixedWorld();
    vm.runInContext(`const original=(${CALLS.capture.program}).call(scope,project,bus,manager,consistency,constructors,lexicals);${change}`, context);
    const invoke = (): unknown => vm.runInContext(`(${CALLS.recheck.program}).call(scope,project,bus,manager,consistency,constructors,lexicals,original)`, context);
    if (change === "") { assert.equal(invoke(), true); } else { assert.throws(invoke, /FOOTPRINT_COPY_DEPENDENCY_BINDING/u); }
    assert.equal(vm.runInContext("calls", context), 0);
    if (change.startsWith("delete")) { assert.equal(vm.runInContext("Object.hasOwn(globalThis,'/tab/notify')", context), false); }
  }
});
void test("dependency runner retains64 original reads, then one fresh3-request reproof without execution authority", async () => {
  const { runner, calls } = owner(), packet = await runner.observe();
  assert.equal(calls.length, 64); assert.equal(runner.retained().replies.length, 64);
  assert.deepEqual(calls.filter(id => id.startsWith("scopes-")), ["scopes-2", "scopes-4", "scopes-5"]);
  currentFootprintCopyDependencyObservationSchema.parse(packet); assert.equal(packet.executionAuthorized, false);
  await assert.rejects(runner.requireOriginal({ ...packet })); assert.equal(calls.length, 64);
  await runner.requireOriginal(packet); assert.equal(calls.length, 67);
  await assert.rejects(runner.requireOriginal(packet)); await assert.rejects(runner.observe()); assert.equal(calls.length, 67);
});
void test("dependency owner loss retains the arrived reply and failed reproof cannot retry", async () => {
  const lost = owner(); lost.loseAfterReply(); await assert.rejects(lost.runner.observe(), /owner lost/u);
  assert.equal(lost.runner.retained().replies.length, 1); assert.equal(lost.runner.retained().failed, true);
  const failed = owner(), packet = await failed.runner.observe(); failed.failFinal(); await assert.rejects(failed.runner.requireOriginal(packet));
  assert.equal(failed.runner.retained().requests, 67); assert.equal(failed.runner.retained().failed, true);
  await assert.rejects(failed.runner.requireOriginal(packet)); assert.equal(failed.calls.length, 67);
});
void test("dependency commands exist only in preparation wire while native generation preserves old case parity", () => {
  for (const [index, command] of currentFootprintCopyDependencyNativeCases().entries()) {
    assert.throws(() => currentPcbWorkerStartupWire(command, 1)); assert.throws(() => currentPcb209WorkerStartupWire(command, 1));
    const encoded = currentFootprintCopyPreparationWire(command, 497);
    assert.equal(encoded.request["startupPhase"], index === 0 ? "footprint-dependency-capture" : "footprint-dependency-recheck");
    assert.equal(Object.hasOwn(encoded.request, "argument6"), index === 1);
  }
  for (const command of currentPcb209WorkerStartupNativeCases()) { currentPcb209WorkerStartupWire(command, 1); }
  const native = currentPcbWorkerStartupNativeSource(); assert.ok(native.includes('phase==@"footprint-dependency-capture"'));
  assert.ok(native.includes('phase==@"footprint-dependency-recheck"'));
});
