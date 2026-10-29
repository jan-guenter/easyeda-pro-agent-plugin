import assert from "node:assert/strict";
import { test } from "node:test";
import vm from "node:vm";
import { CURRENT_FOOTPRINT_COPY_METHOD_CALLS, CURRENT_FOOTPRINT_COPY_METHOD_PROFILES,
  CURRENT_FOOTPRINT_COPY_NATIVE_METHOD_PROFILES, decodeCurrentFootprintCopyCacheMethodArray,
  decodeCurrentFootprintCopyMethodArray, decodeCurrentFootprintCopyMethodProperties,
  decodeCurrentFootprintCopyNativeMethodProperties } from "../src/current-footprint-copy-method-bindings.ts";

type Data = Record<string, unknown>;
const sources = [
  "async getStr(s){let r=this.data[s];if(!r||r!=null&&r.isDelete)return{success:!1,message:\"Data does not exist!\"};let i=s,n=this.client,{ticket:a,creator:o,createTime:c,modifier:l,updateTime:u}=r,h=new Ke,p=[h.footprint.head({doc:i,client:n,updateTime:u,version:r.version,user:l,ticket:this.maxTicket+1})],d=h.footprint.metaData(r);p.push(h.footprint.meta(a,d));let m=await this.projectManager.getCanvasByConsistency([s]);return m&&p.push(m),{success:!0,result:p.join(Ie)}}",
  "get maxTicket(){return this.projectManager.consistencyManager.getMaxTicket()}",
  "getMaxTicket(){return this.maxTicket}",
  "getCanvasByConsistency(s,r,i,n){return this.compress({docIds:s,ignoreType:[De.META,De.META_PLACEHOLDER,De.DELETE_DOC,De.META_CREATE,De.META_MODIFY],notDocHead:i,needNum:r,needDelete:n,keepFirst:!0})}",
  "compress(s={clearDelete:!0,keepFirst:!0}){try{return this.preCompressProps(s),this.bindCompressProgress(s),this.consistencyManager.asyncCompressFull(s)}catch(r){throw new Error(r)}}"
] as const;
const property = (name: string, value: Data, writable = false, enumerable = false, configurable = true):
{ name: string; value: Data; writable: boolean; enumerable: boolean; configurable: boolean; isOwn: true } =>
  ({ name, value, writable, enumerable, configurable, isOwn: true });
function arrayReply(): { result: ReturnType<typeof property>[]; internalProperties: { name: string; value: Data }[] } {
  return { result: [...CURRENT_FOOTPRINT_COPY_METHOD_PROFILES.map((entry, index) => property(String(index), {
    type: "function", className: entry.async ? "AsyncFunction" : "Function", description: sources[index], objectId: `method-${String(index)}`,
  }, true, true)), property("length", { type: "number", value: 5, description: "5" }, true, false, false)],
  internalProperties: [{ name: "[[Prototype]]", value: { type: "object", subtype: "array", className: "Array", description: "Array(0)", objectId: "array-prototype" } }] };
}
function methodReply(index: number): { result: ReturnType<typeof property>[]; internalProperties: { name: string; value: Data }[] } {
  const expected = CURRENT_FOOTPRINT_COPY_METHOD_PROFILES[index]; assert.ok(expected);
  return { result: [property("length", { type: "number", value: expected.parameterCount, description: String(expected.parameterCount) }),
    property("name", { type: "string", value: expected.name })], internalProperties: [
    { name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: {
      scriptId: "original-worker", lineNumber: expected.lineNumber, columnNumber: expected.columnNumber } } },
    { name: "[[Prototype]]", value: { type: expected.async ? "object" : "function", className: expected.async ? "AsyncFunction" : "Function", objectId: "function-prototype" } },
    { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", description: "Scopes[2]", objectId: `scopes-${String(index)}` } },
  ] };
}
function fixture(): vm.Context {
  const context = vm.createContext({});
  vm.runInContext(`let calls=0;
class Gd{};class Lg extends Gd{getCanvasByConsistency(a,b,c,d){calls++;}compress(a={}){calls++;}}
class Pi{get maxTicket(){calls++;return 1;}}class ar extends Pi{}class Tg extends ar{getStr(s){calls++;return s;}}
class zy{}class Vc extends zy{getMaxTicket(){calls++;return 1;}}class ja extends Vc{}
class Mb{}class KP extends Mb{}class JP extends KP{}
const bus=new JP,manager=new Tg,consistency=new ja,constructors=[Tg,ar,Pi,ja,Vc,zy,Lg,Gd,JP,KP,Mb];
globalThis.PROJECT=new Lg;PROJECT.workerBus=bus;PROJECT.footprint=manager;PROJECT.consistencyManager=consistency;manager.projectManager=PROJECT;`, context);
  return context;
}
function capture(context: vm.Context): unknown {
  return vm.runInContext(`globalThis.methods=(${CURRENT_FOOTPRINT_COPY_METHOD_CALLS.capture.program}).call(PROJECT,bus,manager,consistency,constructors)`, context);
}
function recheck(context: vm.Context): unknown {
  return vm.runInContext(`(${CURRENT_FOOTPRINT_COPY_METHOD_CALLS.recheck.program}).call(PROJECT,bus,manager,consistency,constructors,methods)`, context);
}

void test("footprint method bindings capture and reprove original methods without invoking the getter", () => {
  const context = fixture(); capture(context);
  assert.equal(recheck(context), true); assert.equal(vm.runInContext("calls", context), 0);
  assert.equal(vm.runInContext("JSON.stringify(methods.map(f=>f.name))", context), JSON.stringify(CURRENT_FOOTPRINT_COPY_METHOD_PROFILES.map(value => value.name)));
  assert.equal(CURRENT_FOOTPRINT_COPY_METHOD_CALLS.capture.arguments, 4);
  assert.equal(CURRENT_FOOTPRINT_COPY_METHOD_CALLS.recheck.arguments, 5);
  assert.equal(CURRENT_FOOTPRINT_COPY_METHOD_CALLS.capture.returnByValue, false);
});

void test("footprint method binding reproof refuses replacements, accessors and detached constructor ownership", () => {
  for (const mutation of [
    'Object.defineProperty(Tg.prototype,"getStr",{value:function getStr(s){calls++;return s;},writable:true,configurable:true})',
    'Object.defineProperty(manager,"getStr",{get(){calls++;return Tg.prototype.getStr;}})',
    'constructors[0]=class Tg extends ar{}',
    'PROJECT.workerBus={}',
    'manager.projectManager=new Lg',
    'Object.setPrototypeOf(manager,new Tg)',
  ]) {
    const context = fixture(); capture(context); vm.runInContext(mutation, context);
    assert.throws(() => recheck(context), /FOOTPRINT_COPY_METHOD_BINDING/u);
    assert.equal(vm.runInContext("calls", context), 0);
  }
});

void test("footprint method metadata binds five exact sources, names, arities and original script locations", () => {
  assert.deepEqual(decodeCurrentFootprintCopyMethodArray(arrayReply()), ["method-0", "method-1", "method-2", "method-3", "method-4"]);
  for (let index = 0; index < 5; index += 1) {
    assert.deepEqual(decodeCurrentFootprintCopyMethodProperties(methodReply(index), "original-worker", index), {
      scopesId: `scopes-${String(index)}`, sourceLocationVerified: true, producerBindingVerified: false, executionAuthorized: false,
    });
  }
  assert.equal(CURRENT_FOOTPRINT_COPY_METHOD_PROFILES[4].parameterCount, 0);
});

void test("footprint metadata rejects source substitution, repeated IDs, altered location and metadata shape", () => {
  const source = arrayReply(); const first = source.result[0]; assert.ok(first); first.value["description"] = `${String(first.value["description"])} `;
  assert.throws(() => decodeCurrentFootprintCopyMethodArray(source));
  const duplicate = arrayReply(); const second = duplicate.result[1]; assert.ok(second); second.value["objectId"] = "method-0";
  assert.throws(() => decodeCurrentFootprintCopyMethodArray(duplicate));
  const missing = arrayReply(); missing.result.pop(); assert.throws(() => decodeCurrentFootprintCopyMethodArray(missing));
  const shadow = arrayReply(); const zero = shadow.result[0]; assert.ok(zero); zero.enumerable = false;
  assert.throws(() => decodeCurrentFootprintCopyMethodArray(shadow));
  for (let index = 0; index < 5; index += 1) {
    const arity = methodReply(index); const length = arity.result[0]; assert.ok(length); length.value["value"] = 99;
    assert.throws(() => decodeCurrentFootprintCopyMethodProperties(arity, "original-worker", index));
    assert.throws(() => decodeCurrentFootprintCopyMethodProperties(methodReply(index), "other-worker", index));
    const wrongLocation = methodReply(index); const location = wrongLocation.internalProperties[0]; assert.ok(location);
    location.value["value"] = { scriptId: "original-worker", lineNumber: 0, columnNumber: 0 };
    assert.throws(() => decodeCurrentFootprintCopyMethodProperties(wrongLocation, "original-worker", index));
  }
  assert.throws(() => decodeCurrentFootprintCopyMethodProperties(methodReply(0), "original-worker", -0));
  assert.throws(() => decodeCurrentFootprintCopyMethodProperties(methodReply(0), "original-worker", 5));
});

void test("footprint method decoders reject hostile inputs without evaluating traps or accessors", () => {
  let calls = 0;
  const proxy = new Proxy({}, { ownKeys: (): never => { calls += 1; throw new Error("trap"); } });
  const getter = Object.defineProperty({}, "result", { enumerable: true, get: (): never => { calls += 1; throw new Error("getter"); } });
  for (const input of [proxy, getter]) {
    assert.throws(() => decodeCurrentFootprintCopyMethodArray(input));
    assert.throws(() => decodeCurrentFootprintCopyMethodProperties(input, "original-worker", 0));
  }
  assert.equal(calls, 0);
});

function cacheArrayReply(): ReturnType<typeof arrayReply> {
  const reply = arrayReply(); reply.result.pop();
  for (const [index, expected] of CURRENT_FOOTPRINT_COPY_NATIVE_METHOD_PROFILES.entries()) {
    reply.result.push(property(String(index + 5), { type: "function", className: "Function",
      description: `function ${expected.name}() { [native code] }`, objectId: `native-${String(index)}` }, true, true));
  }
  reply.result.push(property("length", { type: "number", value: 14, description: "14" }, true, false, false));
  return reply;
}
function nativeReply(index: number): ReturnType<typeof methodReply> {
  const expected = CURRENT_FOOTPRINT_COPY_NATIVE_METHOD_PROFILES[index]; assert.ok(expected);
  const result = [property("length", { type: "number", value: expected.parameterCount, description: String(expected.parameterCount) }),
    property("name", { type: "string", value: expected.name })];
  if (index === 6 || index === 8) {
    const name = index === 6 ? "TextDecoder" : "TypedArray";
    result.push(property("prototype", { type: "object", className: name, description: name, objectId: "native-prototype" }, false, false, false));
  }
  if (index === 8) { result.push(property("BYTES_PER_ELEMENT", { type: "number", value: 1, description: "1" }, false, false, false)); }
  return { result, internalProperties: [
    { name: "[[Prototype]]", value: { type: "function", className: "Function", objectId: "function-prototype",
      description: index === 8 ? "function TypedArray() { [native code] }" : "function () { [native code] }" } },
    { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", description: "Scopes[0]", objectId: "empty-scopes" } },
  ] };
}
function nativeFixture(): vm.Context {
  const context = fixture();
  vm.runInContext(`class Cache{match(){calls++;}}class Response{get body(){calls++;return null;}}
class ReadableStream{getReader(){calls++;}}class ReadableStreamDefaultReader{read(){calls++;}cancel(){calls++;}releaseLock(){calls++;}}
class TextDecoder{decode(){calls++;}}Object.assign(globalThis,{Cache,Response,ReadableStream,ReadableStreamDefaultReader,TextDecoder});
for(const [c,names]of [[Cache,["match"]],[Response,["body"]],[ReadableStream,["getReader"]],[ReadableStreamDefaultReader,["read","cancel","releaseLock"]],[TextDecoder,["decode"]]])
for(const name of names)Object.defineProperty(c.prototype,name,{...Object.getOwnPropertyDescriptor(c.prototype,name),enumerable:true});`, context);
  return context;
}
function cacheCapture(context: vm.Context): unknown {
  return vm.runInContext(`globalThis.methods=(${CURRENT_FOOTPRINT_COPY_METHOD_CALLS["cache-capture"].program}).call(PROJECT,bus,manager,consistency,constructors)`, context);
}
function cacheRecheck(context: vm.Context): unknown {
  return vm.runInContext(`(${CURRENT_FOOTPRINT_COPY_METHOD_CALLS["cache-recheck"].program}).call(PROJECT,bus,manager,consistency,constructors,methods)`, context);
}

void test("cache method capture retains nine additional intrinsic objects without invoking them", () => {
  const context = nativeFixture(); cacheCapture(context);
  assert.equal(cacheRecheck(context), true); assert.equal(vm.runInContext("calls", context), 0);
  assert.equal(vm.runInContext("methods.length", context), 14);
  assert.equal(vm.runInContext("methods[5]===Cache.prototype.match&&methods[6]===Object.getOwnPropertyDescriptor(Response.prototype,'body').get&&methods[11]===TextDecoder&&methods[13]===Uint8Array", context), true);
  assert.equal(CURRENT_FOOTPRINT_COPY_METHOD_CALLS["cache-capture"].arguments, 4);
  assert.equal(CURRENT_FOOTPRINT_COPY_METHOD_CALLS["cache-recheck"].arguments, 5);
});

void test("cache method recheck rejects replaced native objects, accessors and detached bundles before invocation", () => {
  for (const mutation of [
    "Cache.prototype.match=function match(){calls++;}",
    'Object.defineProperty(Response.prototype,"body",{get(){calls++;return null;},enumerable:true,configurable:true})',
    'Object.defineProperty(ReadableStream.prototype,"getReader",{get(){calls++;return methods[7];},enumerable:true,configurable:true})',
    "globalThis.TextDecoder=class TextDecoder{}",
    "methods[13]=methods[11]",
  ]) {
    const context = nativeFixture(); cacheCapture(context); vm.runInContext(mutation, context);
    assert.throws(() => cacheRecheck(context), /FOOTPRINT_COPY_METHOD_BINDING/u);
    assert.equal(vm.runInContext("calls", context), 0);
  }
});

void test("cache method metadata accepts exact native expectations without asserting execution authority", () => {
  const ids = decodeCurrentFootprintCopyCacheMethodArray(cacheArrayReply());
  assert.equal(ids.length, 14); assert.equal(ids[5], "native-0"); assert.equal(ids[13], "native-8");
  for (let index = 0; index < 9; index += 1) {
    assert.deepEqual(decodeCurrentFootprintCopyNativeMethodProperties(nativeReply(index), index), {
      nativeMetadataVerified: true, executionAuthorized: false,
    });
  }
});

void test("native metadata refuses script bodies, bound functions, nonempty scopes and modified constructor shapes", () => {
  for (const [slot, key, value] of [[5, "description", "function match() { return true; }"], [13, "objectId", "native-6"]] as const) {
    const reply = cacheArrayReply(); const item = reply.result[slot]; assert.ok(item); item.value[key] = value;
    assert.throws(() => decodeCurrentFootprintCopyCacheMethodArray(reply));
  }
  for (let index = 0; index < 9; index += 1) {
    for (const name of ["[[FunctionLocation]]", "[[BoundTargetFunction]]", "[[Target]]"]) {
      const reply = nativeReply(index);
      reply.internalProperties.push({ name, value: { type: "function", objectId: "untrusted" } });
      assert.throws(() => decodeCurrentFootprintCopyNativeMethodProperties(reply, index));
    }
    const reply = nativeReply(index); const scopes = reply.internalProperties[1]; assert.ok(scopes); scopes.value["description"] = "Scopes[1]";
    assert.throws(() => decodeCurrentFootprintCopyNativeMethodProperties(reply, index));
  }
  const constructor = nativeReply(8); const size = constructor.result[3]; assert.ok(size); size.value["value"] = 2;
  assert.throws(() => decodeCurrentFootprintCopyNativeMethodProperties(constructor, 8));
  assert.throws(() => decodeCurrentFootprintCopyNativeMethodProperties(nativeReply(0), -0));
  assert.throws(() => decodeCurrentFootprintCopyNativeMethodProperties(nativeReply(0), 9));
  let calls = 0; const proxy = new Proxy({}, { ownKeys: (): never => { calls += 1; throw new Error("trap"); } });
  assert.throws(() => decodeCurrentFootprintCopyCacheMethodArray(proxy));
  assert.throws(() => decodeCurrentFootprintCopyNativeMethodProperties(proxy, 0));
  assert.equal(calls, 0);
});

// Retained raw Chromium156 localhost CDP response. This fixture contains only
// Intrinsic metadata and ephemeral test-process IDs, with no EasyEDA evidence.
function chromiumUint8ArrayReply(): ReturnType<typeof nativeReply> {
  return {
    result: [
      {
        name: "length",
        value: {
          type: "number",
          value: 3,
          description: "3"
        },
        writable: false,
        configurable: true,
        enumerable: false,
        isOwn: true
      },
      {
        name: "name",
        value: {
          type: "string",
          value: "Uint8Array"
        },
        writable: false,
        configurable: true,
        enumerable: false,
        isOwn: true
      },
      {
        name: "prototype",
        value: {
          type: "object",
          className: "TypedArray",
          description: "TypedArray",
          objectId: "-7069450343021446742.2.29"
        },
        writable: false,
        configurable: false,
        enumerable: false,
        isOwn: true
      },
      {
        name: "BYTES_PER_ELEMENT",
        value: {
          type: "number",
          value: 1,
          description: "1"
        },
        writable: false,
        configurable: false,
        enumerable: false,
        isOwn: true
      },
      {
        name: "fromBase64",
        value: {
          type: "function",
          className: "Function",
          description: "function fromBase64() { [native code] }",
          objectId: "-7069450343021446742.2.30"
        },
        writable: true,
        configurable: true,
        enumerable: false,
        isOwn: true
      },
      {
        name: "fromHex",
        value: {
          type: "function",
          className: "Function",
          description: "function fromHex() { [native code] }",
          objectId: "-7069450343021446742.2.31"
        },
        writable: true,
        configurable: true,
        enumerable: false,
        isOwn: true
      }
    ],
    internalProperties: [
      {
        name: "[[Prototype]]",
        value: {
          type: "function",
          className: "Function",
          description: "function TypedArray() { [native code] }",
          objectId: "-7069450343021446742.2.32"
        }
      },
      {
        name: "[[Scopes]]",
        value: {
          type: "object",
          subtype: "internal#scopeList",
          className: "Array",
          description: "Scopes[0]",
          objectId: "-7069450343021446742.2.33"
        }
      }
    ]
  };
}

void test("native Uint8Array decoder accepts the retained Chromium encoding-static pair and the Node24 shape", () => {
  for (const reply of [chromiumUint8ArrayReply(), nativeReply(8)]) {
    assert.deepEqual(decodeCurrentFootprintCopyNativeMethodProperties(reply, 8), {
      nativeMetadataVerified: true, executionAuthorized: false,
    });
  }
});

void test("native Uint8Array optional static pair rejects partial, extra, altered and aliased properties", () => {
  const partial = chromiumUint8ArrayReply(); partial.result.pop();
  assert.throws(() => decodeCurrentFootprintCopyNativeMethodProperties(partial, 8));
  const extra = chromiumUint8ArrayReply(); extra.result.push(property("unexpected", { type: "number", value: 1 }));
  assert.throws(() => decodeCurrentFootprintCopyNativeMethodProperties(extra, 8));
  for (const name of ["fromBase64", "fromHex"]) {
    for (const mutation of ["enumerable", "writable", "configurable", "description", "className", "objectId"]) {
      const reply = chromiumUint8ArrayReply(); const item = reply.result.find(value => value.name === name); assert.ok(item);
      if (mutation === "enumerable") { item.enumerable = true; }
      else if (mutation === "writable" || mutation === "configurable") { item[mutation] = false; }
      else if (mutation === "description") { item.value[mutation] = `function ${name}() { return true; }`; }
      else if (mutation === "className") { item.value[mutation] = "AsyncFunction"; }
      else { item.value[mutation] = ""; }
      assert.throws(() => decodeCurrentFootprintCopyNativeMethodProperties(reply, 8));
    }
  }
  const alias = chromiumUint8ArrayReply(), left = alias.result[4], right = alias.result[5]; assert.ok(left && right);
  right.value["objectId"] = left.value["objectId"];
  assert.throws(() => decodeCurrentFootprintCopyNativeMethodProperties(alias, 8));
  const renamed = chromiumUint8ArrayReply(); const last = renamed.result[5]; assert.ok(last); last.name = "fromOther";
  assert.throws(() => decodeCurrentFootprintCopyNativeMethodProperties(renamed, 8));
});
