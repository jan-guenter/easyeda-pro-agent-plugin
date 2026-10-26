import assert from "node:assert/strict";
import { test } from "node:test";
import vm from "node:vm";
import { CURRENT_FOOTPRINT_COPY_CACHE_FACTORY_CALLS, CURRENT_FOOTPRINT_COPY_CACHE_FACTORY_PROFILES,
  decodeCurrentFootprintCopyCacheFactoryArray, decodeCurrentFootprintCopyCacheFactoryProperties } from "../src/current-footprint-copy-cache-factory.ts";

type Data = Record<string, unknown>;
const sources = ["setCacheData(e){this.getCache=e}", "()=>this.getCacheData()"] as const;
const property = (name: string, value: Data, writable = false, enumerable = false, configurable = true):
{ name: string; value: Data; writable: boolean; enumerable: boolean; configurable: boolean; isOwn: true } =>
  ({ name, value, writable, enumerable, configurable, isOwn: true });
function arrayReply(): { result: ReturnType<typeof property>[]; internalProperties: { name: string; value: Data }[] } {
  return { result: [property("0", { type: "object", className: "ja", description: "ja", objectId: "consistency" }, true, true),
    ...CURRENT_FOOTPRINT_COPY_CACHE_FACTORY_PROFILES.map((_entry, index) => property(String(index + 1), {
      type: "function", className: "Function", description: sources[index], objectId: `method-${String(index)}`,
    }, true, true)), property("length", { type: "number", value: 3, description: "3" }, true, false, false)],
  internalProperties: [{ name: "[[Prototype]]", value: { type: "object", subtype: "array", className: "Array", description: "Array(0)", objectId: "array-prototype" } }] };
}
function methodReply(index: number): { result: ReturnType<typeof property>[]; internalProperties: { name: string; value: Data }[] } {
  const expected = CURRENT_FOOTPRINT_COPY_CACHE_FACTORY_PROFILES[index]; assert.ok(expected);
  return { result: [property("length", { type: "number", value: expected.parameterCount, description: String(expected.parameterCount) }),
    property("name", { type: "string", value: expected.name })], internalProperties: [
    { name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: {
      scriptId: "original-worker", lineNumber: expected.lineNumber, columnNumber: expected.columnNumber } } },
    { name: "[[Prototype]]", value: { type: "function", className: "Function", objectId: "function-prototype" } },
    { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", description: "Scopes[2]", objectId: `scopes-${String(index)}` } },
  ] };
}
function fixture(): vm.Context {
  const context = vm.createContext({});
  vm.runInContext(`let calls=0;class zy{}class Vc extends zy{}class ja extends Vc{setCacheData(e){this.getCache=e;}}
class Gd{constructor(){this.consistencyManager=new ja;this.consistencyManager.setCacheData(()=>this.getCacheData());}getCacheData(){calls++;}}
class Lg extends Gd{}const project=new Lg,bus={};`, context);
  return context;
}
function capture(context: vm.Context): unknown {
  return vm.runInContext(`globalThis.bundle=(${CURRENT_FOOTPRINT_COPY_CACHE_FACTORY_CALLS.capture.program}).call(project)`, context);
}
function recheck(context: vm.Context): unknown {
  return vm.runInContext(`(${CURRENT_FOOTPRINT_COPY_CACHE_FACTORY_CALLS.recheck.program}).call(project,bus,bundle)`, context);
}

void test("cache factory capture retains the original base-end objects before PROJECT assignment without invoking them", () => {
  const context = fixture(); capture(context);
  assert.equal(vm.runInContext("typeof PROJECT", context), "undefined");
  assert.equal(vm.runInContext("bundle[0]===project.consistencyManager&&bundle[1]===ja.prototype.setCacheData&&bundle[2]===project.consistencyManager.getCache", context), true);
  vm.runInContext("globalThis.PROJECT=project;project.workerBus=bus", context);
  assert.equal(recheck(context), true); assert.equal(vm.runInContext("calls", context), 0);
  assert.equal(CURRENT_FOOTPRINT_COPY_CACHE_FACTORY_CALLS.capture.arguments, 0);
  assert.equal(CURRENT_FOOTPRINT_COPY_CACHE_FACTORY_CALLS.capture.returnByValue, false);
  assert.equal(CURRENT_FOOTPRINT_COPY_CACHE_FACTORY_CALLS.recheck.arguments, 2);
});

void test("cache factory reproof rejects replacement, accessor and project ownership drift without invoking a factory", () => {
  for (const mutation of [
    "project.consistencyManager.getCache=()=>project.getCacheData()",
    "ja.prototype.setCacheData=function setCacheData(e){this.getCache=e;}",
    'Object.defineProperty(project.consistencyManager,"getCache",{get(){calls++;return bundle[2];}})',
    'Object.defineProperty(project.consistencyManager,"setCacheData",{get(){calls++;return bundle[1];}})',
    "project.consistencyManager=new ja",
    "PROJECT=new Lg",
    "project.workerBus={}",
    "bundle.push(null)",
  ]) {
    const context = fixture(); capture(context);
    vm.runInContext(`globalThis.PROJECT=project;project.workerBus=bus;${mutation}`, context);
    assert.throws(() => recheck(context), /FOOTPRINT_COPY_CACHE_FACTORY/u);
    assert.equal(vm.runInContext("calls", context), 0);
  }
});

void test("cache factory metadata binds exact setter and anonymous arrow source, arity and location", () => {
  assert.deepEqual(decodeCurrentFootprintCopyCacheFactoryArray(arrayReply()), {
    consistencyId: "consistency", setterId: "method-0", factoryId: "method-1",
  });
  for (let index = 0; index < 2; index += 1) {
    assert.deepEqual(decodeCurrentFootprintCopyCacheFactoryProperties(methodReply(index), "original-worker", index), {
      scopesId: `scopes-${String(index)}`, sourceLocationVerified: true, producerBindingVerified: false, executionAuthorized: false,
    });
  }
});

void test("cache factory metadata rejects altered sources, aliasing, receiver class, script and function metadata", () => {
  for (const [index, field, value] of [[1, "description", `${sources[0]} `], [2, "objectId", "method-0"], [0, "className", "Vc"]] as const) {
    const reply = arrayReply(); const item = reply.result[index]; assert.ok(item); item.value[field] = value;
    assert.throws(() => decodeCurrentFootprintCopyCacheFactoryArray(reply));
  }
  const extra = arrayReply(); extra.result.push(property("other", { type: "number", value: 1 }));
  assert.throws(() => decodeCurrentFootprintCopyCacheFactoryArray(extra));
  for (let index = 0; index < 2; index += 1) {
    const arity = methodReply(index), length = arity.result[0]; assert.ok(length); length.value["value"] = 99;
    assert.throws(() => decodeCurrentFootprintCopyCacheFactoryProperties(arity, "original-worker", index));
    assert.throws(() => decodeCurrentFootprintCopyCacheFactoryProperties(methodReply(index), "other-worker", index));
    const location = methodReply(index); const item = location.internalProperties[0]; assert.ok(item);
    item.value["value"] = { scriptId: "original-worker", lineNumber: 0, columnNumber: 0 };
    assert.throws(() => decodeCurrentFootprintCopyCacheFactoryProperties(location, "original-worker", index));
  }
  assert.throws(() => decodeCurrentFootprintCopyCacheFactoryProperties(methodReply(0), "original-worker", -0));
  assert.throws(() => decodeCurrentFootprintCopyCacheFactoryProperties(methodReply(0), "original-worker", 2));
});

void test("cache factory host decoders refuse proxy and accessor inputs without running their traps", () => {
  let calls = 0;
  const proxy = new Proxy({}, { ownKeys: (): never => { calls += 1; throw new Error("trap"); } });
  const accessor = Object.defineProperty({}, "result", { enumerable: true, get: (): never => { calls += 1; throw new Error("getter"); } });
  for (const input of [proxy, accessor]) {
    assert.throws(() => decodeCurrentFootprintCopyCacheFactoryArray(input));
    assert.throws(() => decodeCurrentFootprintCopyCacheFactoryProperties(input, "original-worker", 0));
  }
  assert.equal(calls, 0);
});
