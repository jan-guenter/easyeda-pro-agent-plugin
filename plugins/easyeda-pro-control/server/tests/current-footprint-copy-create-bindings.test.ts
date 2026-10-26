/** Synthetic runtime identities and source-qualified metadata only. */
import assert from "node:assert/strict";
import { test } from "node:test";
import vm from "node:vm";
import { CURRENT_FOOTPRINT_COPY_CREATE_METHOD_CALLS as CALLS, CURRENT_FOOTPRINT_COPY_CREATE_METHOD_PROFILES as PROFILES,
  decodeCurrentFootprintCopyCreateMethodArray, decodeCurrentFootprintCopyCreateMethodProperties } from "../src/current-footprint-copy-create-bindings.ts";
import { FOOTPRINT_CREATE_SOURCE_FIXTURE as SOURCE } from "./helpers/current-footprint-copy-create-source-fixture.ts";

type Data = Record<string, unknown>;
const property = (name: string, value: Data, writable = false, enumerable = false, configurable = true):
{ name: string; value: Data; writable: boolean; enumerable: boolean; configurable: boolean; isOwn: true } =>
  ({ name, value, writable, enumerable, configurable, isOwn: true });
function arrayReply(): { result: ReturnType<typeof property>[]; internalProperties: { name: string; value: Data }[] } {
  return { result: [...PROFILES.map((entry, index) => property(String(index), { type: "function",
    className: entry.async ? "AsyncFunction" : "Function", description: SOURCE.worker[entry.role], objectId: `method-${String(index)}`,
  }, true, true)), property("length", { type: "number", value: 8, description: "8" }, true, false, false)],
  internalProperties: [{ name: "[[Prototype]]", value: { type: "object", subtype: "array", className: "Array", description: "Array(0)", objectId: "array-prototype" } }] };
}
function methodReply(index: number): { result: ReturnType<typeof property>[]; internalProperties: { name: string; value: Data }[] } {
  const entry = PROFILES[index]; assert.ok(entry);
  return { result: [property("length", { type: "number", value: entry.arity, description: String(entry.arity) }),
    property("name", { type: "string", value: entry.name })], internalProperties: [
    { name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: {
      scriptId: "original-script", lineNumber: entry.lineNumber, columnNumber: entry.columnNumber } } },
    { name: "[[Prototype]]", value: { type: entry.async ? "object" : "function", className: entry.async ? "AsyncFunction" : "Function", objectId: "function-prototype" } },
    { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", description: "Scopes[2]", objectId: `scopes-${String(index)}` } },
  ] };
}
function fixture(): vm.Context {
  const context = vm.createContext({});
  vm.runInContext(`let calls=0;
class Gd{uploadLocal(){calls++;}}class Lg extends Gd{}
class Pi{get newTicket(){calls++;return 1;}}class ar extends Pi{}
class Tg extends ar{create(){calls++;}buildString(){calls++;}canvasString(){calls++;}getCanvasData(){calls++;}get(){calls++;}}
class zy{}class Vc extends zy{}class ja extends Vc{setDoctype(){calls++;}}
const bus={},manager=new Tg,consistency=new ja,constructors=[Tg,ar,Pi,ja,Vc,zy];
globalThis.PROJECT=new Lg;PROJECT.workerBus=bus;PROJECT.footprint=manager;PROJECT.consistencyManager=consistency;
manager.projectManager=PROJECT;manager.user=undefined;`, context);
  return context;
}
function capture(context: vm.Context): unknown {
  return vm.runInContext(`globalThis.methods=(${CALLS.capture.program}).call(PROJECT,bus,manager,consistency,constructors)`, context);
}
function recheck(context: vm.Context): unknown {
  return vm.runInContext(`(${CALLS.recheck.program}).call(PROJECT,bus,manager,consistency,constructors,methods)`, context);
}

void test("create method capture retains eight original callable objects without invoking a writer or ticket getter", () => {
  const context = fixture(); capture(context); assert.equal(recheck(context), true);
  assert.equal(vm.runInContext("calls", context), 0); assert.equal(vm.runInContext("methods.length", context), 8);
  assert.equal(vm.runInContext("methods[0]===Tg.prototype.create&&methods[5]===Gd.prototype.uploadLocal&&methods[6]===ja.prototype.setDoctype&&methods[7]===Object.getOwnPropertyDescriptor(Pi.prototype,'newTicket').get", context), true);
  assert.equal(CALLS.capture.arguments, 4); assert.equal(CALLS.recheck.arguments, 5);
});

void test("create method recheck rejects replacement receivers, shadow methods, accessors and changed original functions", () => {
  for (const change of [
    "Tg.prototype.create=async function create(){calls++;}",
    "PROJECT.uploadLocal=Gd.prototype.uploadLocal",
    "Lg.prototype.uploadLocal=Gd.prototype.uploadLocal",
    "manager.user={}",
    "Object.defineProperty(Tg.prototype,'buildString',{get(){calls++;return methods[1];}})",
    "Object.defineProperty(Pi.prototype,'newTicket',{get(){calls++;return 1;}})",
    "Object.defineProperty(manager,'projectManager',{get(){calls++;return PROJECT;}})",
    "PROJECT.footprint=Object.assign(Object.create(Tg.prototype),manager)",
    "constructors[0]=class Tg{}",
    "methods[0]=methods[1]",
    "Object.setPrototypeOf(ja.prototype,Object.prototype)",
  ]) {
    const context = fixture(); capture(context); vm.runInContext(change, context);
    assert.throws(() => recheck(context), /FOOTPRINT_COPY_CREATE_BINDING/u);
    assert.equal(vm.runInContext("calls", context), 0);
  }
});

void test("create method source metadata preserves native function lengths and excludes closure or execution claims", () => {
  assert.equal(decodeCurrentFootprintCopyCreateMethodArray(arrayReply()).length, 8);
  for (const [index, entry] of PROFILES.entries()) {
    // Native Function.length stops at the first default argument. In
    // Particular uploadLocal(t,s=true,r) has length1, not three parameters.
    const method: unknown = vm.runInNewContext(`Object.getOwnPropertyDescriptor(class{${SOURCE.worker[entry.role]}}.prototype,${JSON.stringify(entry.role)}).${entry.role === "newTicket" ? "get" : "value"}`);
    assert.ok(typeof method === "function"); assert.equal(method.length, entry.arity); assert.equal(method.name, entry.name);
    assert.deepEqual(decodeCurrentFootprintCopyCreateMethodProperties(methodReply(index), "original-script", index), {
      scopesId: `scopes-${String(index)}`, sourceLocationVerified: true, lexicalDependenciesVerified: false, executionAuthorized: false,
    });
    assert.throws(() => decodeCurrentFootprintCopyCreateMethodProperties(methodReply(index), "replacement-script", index));
  }
});

void test("create method decoders reject forged source, aliasing, descriptor drift, wrong locations and hostile objects", () => {
  for (const change of ["source", "alias", "descriptor"]) {
    const reply = arrayReply(); const item = reply.result[0]; assert.ok(item);
    if (change === "source") { item.value["description"] = `${SOURCE.worker.create} `; }
    else if (change === "alias") { item.value["objectId"] = "method-1"; }
    else { item.enumerable = false; }
    assert.throws(() => decodeCurrentFootprintCopyCreateMethodArray(reply));
  }
  for (const change of ["location", "length", "extra", "scope"]) {
    const reply = methodReply(0);
    if (change === "location") { const item = reply.internalProperties[0]; assert.ok(item); item.value["value"] = { scriptId: "original-script", lineNumber: 109, columnNumber: 37_598 }; }
    else if (change === "length") { const item = reply.result[0]; assert.ok(item); item.value["value"] = 3; }
    else if (change === "extra") { reply.internalProperties.push({ name: "[[BoundTargetFunction]]", value: { type: "function", objectId: "other" } }); }
    else { const item = reply.internalProperties[2]; assert.ok(item); item.value["description"] = "Scopes[0]"; }
    assert.throws(() => decodeCurrentFootprintCopyCreateMethodProperties(reply, "original-script", 0));
  }
  assert.throws(() => decodeCurrentFootprintCopyCreateMethodProperties(methodReply(0), "original-script", -0));
  assert.throws(() => decodeCurrentFootprintCopyCreateMethodProperties(methodReply(0), "original-script", 8));
  let traps = 0; const proxy = new Proxy({}, { ownKeys(): never { traps += 1; throw new Error("trap"); } });
  const getter = Object.defineProperty({}, "result", { get(): never { traps += 1; throw new Error("getter"); } });
  for (const input of [proxy, getter]) {
    assert.throws(() => decodeCurrentFootprintCopyCreateMethodArray(input));
    assert.throws(() => decodeCurrentFootprintCopyCreateMethodProperties(input, "original-script", 0));
  }
  assert.equal(traps, 0);
});
