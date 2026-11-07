/** Inert descriptor/catalogue fixtures, not original native metadata custody. */
import assert from "node:assert/strict";
import { test } from "node:test";
import vm from "node:vm";
import { CURRENT_NATIVE_REQUEST_METADATA_INTRINSIC_CALLS as CALLS, CURRENT_NATIVE_REQUEST_METADATA_OPTIONAL_GETTERS as OPTIONAL,
  CURRENT_NATIVE_REQUEST_METADATA_REQUIRED_GETTERS as REQUIRED, decodeCurrentNativeRequestMetadataCatalogue } from "../src/current-native-request-metadata-intrinsics.ts";

function fixture(optional: boolean): Readonly<{ run: (source: string) => unknown; catalogue: () => unknown }> {
  const context = vm.createContext({ getterKeys: [...REQUIRED, ...(optional ? OPTIONAL : [])] });
  vm.runInContext(`let invoked=0;function Request(){invoked++;throw Error("constructor")};function Headers(){invoked++;throw Error("constructor")};function AbortSignal(){invoked++;throw Error("constructor")};
for(const key of getterKeys)Object.defineProperty(Request.prototype,key,{get:function(){invoked++;throw Error("getter")},enumerable:true,configurable:true});
for(const key of ["aborted","reason"])Object.defineProperty(AbortSignal.prototype,key,{get:function(){invoked++;throw Error("getter")},enumerable:true,configurable:true});
for(const key of ["forEach","getSetCookie"])Object.defineProperty(Headers.prototype,key,{value:function(){invoked++;throw Error("method")},enumerable:true,writable:true,configurable:true});
const original=(${CALLS.constructors.program})();const complete=(${CALLS.members.program}).call(original);`, context);
  return Object.freeze({ run: (source: string): unknown => vm.runInContext(source, context), catalogue: (): unknown => structuredClone(vm.runInContext(`(${CALLS.catalogue.program}).call(complete)`, context)) });
}
void test("complete ordinary getter rosters and supported optional fields are captured/reproved without invocation", () => {
  for (const optional of [false, true]) {
    const f = fixture(optional); const catalogue = decodeCurrentNativeRequestMetadataCatalogue(f.catalogue());
    assert.equal(catalogue.length, optional ? 27 : 22); assert.equal(f.run(`(${CALLS.reprove.program}).call(complete)`), true); assert.equal(f.run("invoked"), 0);
    assert.equal(catalogue.at(-1)?.name, "getSetCookie");
  }
});
void test("an unhandled accessor or changed getter cannot silently disappear from a full metadata snapshot", () => {
  const f = fixture(false); f.run('Object.defineProperty(Request.prototype,"unhandledNativeField",{get:function(){invoked++;throw Error("getter")},enumerable:true,configurable:true})');
  assert.throws(() => f.run(`(${CALLS.reprove.program}).call(complete)`)); assert.equal(f.run("invoked"), 0);
  const g = fixture(true); g.run('Object.defineProperty(Request.prototype,"method",{get:function(){invoked++;throw Error("replacement")},enumerable:true,configurable:true})');
  assert.throws(() => g.run(`(${CALLS.reprove.program}).call(complete)`)); assert.equal(g.run("invoked"), 0);
});
void test("catalogues reject missing getters, reordered indices and duplicate optional fields", () => {
  const f = fixture(true); const catalogue = decodeCurrentNativeRequestMetadataCatalogue(f.catalogue());
  assert.throws(() => decodeCurrentNativeRequestMetadataCatalogue(catalogue.slice(1)));
  const copy = (): { index: number; name: string; arity: number; constructor: boolean }[] => catalogue.map(value => ({ index: value.index, name: value.name, arity: value.arity, constructor: value.constructor }));
  const wrongIndex = copy(); const index = wrongIndex[3]; assert.ok(index !== undefined); index.index = 9;
  assert.throws(() => decodeCurrentNativeRequestMetadataCatalogue(wrongIndex));
  const duplicate = copy(); const name = duplicate[19]; assert.ok(name !== undefined); name.name = "get duplex";
  assert.throws(() => decodeCurrentNativeRequestMetadataCatalogue(duplicate));
});
