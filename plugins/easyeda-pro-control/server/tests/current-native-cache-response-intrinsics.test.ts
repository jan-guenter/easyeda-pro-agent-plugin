/** Inert descriptors and supplied metadata only; no browser/native cache,
 * Response creation or original owner is exercised. */
import assert from "node:assert/strict";
import { test } from "node:test";
import vm from "node:vm";
import { CURRENT_NATIVE_CACHE_RESPONSE_INTRINSIC_CALLS as CALLS, CURRENT_NATIVE_CACHE_RESPONSE_INTRINSIC_PROFILES as PROFILES,
  decodeCurrentNativeCacheResponseIntrinsic } from "../src/current-native-cache-response-intrinsics.ts";

function fixture(): Readonly<{ run: (source: string) => unknown }> {
  const context = vm.createContext({});
  vm.runInContext(`let invoked=0;function Cache(){invoked++;throw Error("constructor")};function CacheStorage(){invoked++;throw Error("constructor")};function Response(){invoked++;throw Error("constructor")};
for(const[prototype,names]of [[Cache.prototype,["put","match","delete","keys"]],[CacheStorage.prototype,["open","keys","has","delete"]],[Response.prototype,["clone","arrayBuffer"]]])for(const key of names)Object.defineProperty(prototype,key,{value:function(){invoked++;throw Error("method")},enumerable:true,writable:true,configurable:true});
for(const key of ["url","redirected","type","status","statusText","ok","headers","body","bodyUsed"])Object.defineProperty(Response.prototype,key,{get:function(){invoked++;throw Error("getter")},enumerable:true,configurable:true});
Object.defineProperty(globalThis,"caches",{get:function(){invoked++;throw Error("caches getter")},enumerable:true,configurable:true});`, context);
  vm.runInContext(`const original=(${CALLS.constructors.program})();const complete=(${CALLS.members.program}).call(original);`, context);
  return Object.freeze({ run: (source: string): unknown => vm.runInContext(source, context) });
}
void test("constructor then member capture and reproof invoke no constructor, native candidate method or getter", () => {
  const f = fixture(); assert.equal(f.run("original.length"), 4); assert.equal(f.run("complete.length"), 28);
  assert.equal(f.run(`(${CALLS.reprove.program}).call(complete)`), true); assert.equal(f.run("invoked"), 0);
  f.run('Cache.prototype.put=function(){invoked++;throw Error("replacement")}');
  assert.throws(() => f.run(`(${CALLS.reprove.program}).call(complete)`), /NATIVE_CACHE_RESPONSE_INTRINSICS/u); assert.equal(f.run("invoked"), 0);
});
void test("getter/constructor descriptor drift refuses without running replacement callbacks", () => {
  for (const mutation of ['Object.defineProperty(Response.prototype,"url",{get:function(){invoked++;throw Error("replacement")},enumerable:true,configurable:true})',
    'Object.defineProperty(globalThis,"Cache",{get:function(){invoked++;throw Error("replacement")},configurable:true})']) {
    const f = fixture(); f.run(mutation); assert.throws(() => f.run(`(${CALLS.reprove.program}).call(complete)`)); assert.equal(f.run("invoked"), 0);
  }
});
const field = (name: string, value: unknown, writable = false, enumerable = false, configurable = true): object => ({ name, value, writable, enumerable, configurable, isOwn: true });
function metadata(index: number): Record<string, unknown> {
  const expected = PROFILES.find(value => value.index === index); assert.ok(expected !== undefined);
  const result = [field("name", { type: "string", value: expected.name }), field("length", { type: "number", value: expected.arity })];
  if (expected.constructor) { result.push(field("prototype", { type: "object", className: expected.name, description: expected.name, objectId: "native-prototype" }, false, false, false)); }
  return { result, internalProperties: [{ name: "[[Prototype]]", value: { type: "function", className: "Function", description: "function () { [native code] }", objectId: "function-prototype" } },
    { name: "[[Scopes]]", value: { type: "object", className: "Array", subtype: "internal#scopeList", description: "Scopes[0]", objectId: "native-scopes" } }] };
}
void test("supplied native-function metadata must have the exact slot, empty scope and no application location", () => {
  for (const profile of PROFILES) { decodeCurrentNativeCacheResponseIntrinsic(metadata(profile.index), profile.index); }
  const source = metadata(8); const properties = source["internalProperties"]; assert.ok(Array.isArray(properties));
  const capturedProperties = Array.from(properties, (value: unknown): unknown => value);
  assert.throws(() => { decodeCurrentNativeCacheResponseIntrinsic({ ...source, internalProperties: [...capturedProperties, { name: "[[FunctionLocation]]", value: { type: "object", objectId: "application" } }] }, 8); });
  assert.throws(() => { decodeCurrentNativeCacheResponseIntrinsic(metadata(8), 9); });
  let touched = false; const input = Object.defineProperty({}, "result", { enumerable: true, get: (): unknown => { touched = true; return []; } });
  assert.throws(() => { decodeCurrentNativeCacheResponseIntrinsic(input, 8); }); assert.equal(touched, false);
});
