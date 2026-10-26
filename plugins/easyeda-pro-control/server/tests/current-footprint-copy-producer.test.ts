/** Synthetic descriptors and original-owner contracts, never a native create. */
import assert from "node:assert/strict";
import { test } from "node:test";
import vm from "node:vm";
import { CURRENT_FOOTPRINT_COPY_CREATE_METHOD_PROFILES as METHODS } from "../src/current-footprint-copy-create-bindings.ts";
import { CURRENT_FOOTPRINT_COPY_LEXICAL_CALLS as CALLS, CURRENT_FOOTPRINT_COPY_LEXICAL_PROFILES as PROFILES,
  decodeCurrentFootprintCopyProducerArray, decodeCurrentFootprintCopyProducerFunction, decodeCurrentFootprintCopyProducerScope } from "../src/current-footprint-copy-producer-scope.ts";
import { CURRENT_FOOTPRINT_COPY_PRODUCER_REQUESTS, CurrentFootprintCopyProducerRunner } from "../src/current-footprint-copy-producer-runner.ts";
import { FOOTPRINT_CREATE_SOURCE_FIXTURE } from "./helpers/current-footprint-copy-create-source-fixture.ts";
import { FOOTPRINT_PRODUCER_SOURCE_FIXTURE } from "./helpers/current-footprint-copy-producer-fixture.ts";

type Data = Record<string, unknown>;
const property = (name: string, value: Data, writable = false, enumerable = false, configurable = true):
  { name: string; value: Data; writable: boolean; enumerable: boolean; configurable: boolean; isOwn: true } =>
  ({ name, value, writable, enumerable, configurable, isOwn: true });
const scopeList = (id: string): Data => ({ result: ["Closure", "Global"].map((description, index) => property(String(index), {
  type: "object", subtype: "internal#scope", className: "Object", description, objectId: `${id}-${String(index)}`,
}, true, true)) });
const yes = { result: { type: "boolean", value: true } };
function arrayReply(lexical: boolean): Data {
  const functions = lexical ? PROFILES.map((entry, index) => property(String(index), { type: "function", className: entry.async ? "AsyncFunction" : "Function",
    objectId: `producer-${String(index)}`, description: FOOTPRINT_PRODUCER_SOURCE_FIXTURE[index] }, true, true)) :
    METHODS.map((entry, index) => property(String(index), { type: "function", className: entry.async ? "AsyncFunction" : "Function",
      objectId: `method-${String(index)}`, description: FOOTPRINT_CREATE_SOURCE_FIXTURE.worker[entry.role] }, true, true));
  if (lexical) {
    functions.push(...[7, 8].map(index => property(String(index), { type: "object", className: "Object", description: "Object", objectId: `enum-${String(index)}` }, true, true)),
      property("9", { type: "string", value: "|\n" }, true, true));
  }
  functions.push(property("length", { type: "number", value: lexical ? 10 : 8 }, true, false, false));
  return { result: functions, internalProperties: [{ name: "[[Prototype]]", value: {
    type: "object", subtype: "array", className: "Array", description: "Array(0)", objectId: "array-prototype",
  } }] };
}
function functionReply(index: number, lexical: boolean): Data {
  const item = lexical ? PROFILES[index] : METHODS[index]; assert.ok(item);
  const result = [property("length", { type: "number", value: item.arity }), property("name", { type: "string", value: item.name })];
  if (lexical && !item.async) {
    const profile = PROFILES[index]; assert.ok(profile);
    result.push(property("prototype", { type: "object", className: "Object", objectId: "function-own-prototype" }, !profile.class, false, false));
  }
  if (lexical && index === 0) {
    result.push(...["getOldLibByNet", "transform", "getOtherLibByNet", "getOtherLibByWorker", "getProjectLibByWorker", "getExtendLib", "getProLibSource"]
      .map(name => property(name, { type: "function", objectId: `static-${name}` }, true)));
  }
  const lineNumber = "line" in item ? item.line : item.lineNumber;
  const columnNumber = "column" in item ? item.column : item.columnNumber;
  return { result, internalProperties: [
    { name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: { scriptId: "script", lineNumber, columnNumber } } },
    { name: "[[Prototype]]", value: { type: item.async ? "object" : "function", className: item.async ? "AsyncFunction" : "Function", objectId: "function-prototype" } },
    { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", description: "Scopes[2]", objectId: `scopes-${String(index)}` } },
  ] };
}

void test("fixed lexical selectors retain identities, enums and separator without invoking any producer", () => {
  for (const change of ["", "scope.qe=function qe(){}", "scope.Ie='bad'", "scope.ve.FOOTPRINT='PCB'", "scope.ai.getProLibSource=async function(){}",
    "Object.defineProperty(scope,'Qe',{get(){calls++;return function Qe(){};}})", "scope.Oe={FOOTPRINT:4}"]) {
    const context = vm.createContext({});
    vm.runInContext(String.raw`let calls=0;const f=()=>{calls++;throw Error('must not invoke')};const ai=function Jo(){calls++};ai.getProLibSource=f;const scope={ai,qe:f,Qe:f,Ke:f,Ni:f,cg:f,ve:{FOOTPRINT:'FOOTPRINT',FONT:'FONT',BLOB:'BLOB'},Oe:{FOOTPRINT:4},Ie:'|\n'};`, context);
    vm.runInContext(`const original=(${CALLS.capture.program}).call(scope);${change}`, context);
    const run = (): unknown => vm.runInContext(`(${CALLS.recheck.program}).call(scope,original)`, context);
    if (change === "") { assert.equal(run(), true); } else { assert.throws(run, /FOOTPRINT_COPY_PRODUCER_SCOPE/u); }
    assert.equal(vm.runInContext("calls", context), 0);
  }
});

void test("lexical decoders qualify exact bytes and locations and reject substituted source, global fallback and hostile metadata", () => {
  assert.equal(decodeCurrentFootprintCopyProducerScope(scopeList("scope")), "scope-0");
  assert.equal(decodeCurrentFootprintCopyProducerArray(arrayReply(true)).length, 7);
  for (const index of PROFILES.keys()) {
    decodeCurrentFootprintCopyProducerFunction(functionReply(index, true), "script", index);
    assert.throws(() => { decodeCurrentFootprintCopyProducerFunction(functionReply(index, true), "changed-script", index); });
  }
  const wrongSource = arrayReply(true); const fields = wrongSource["result"]; assert.ok(Array.isArray(fields));
  const first: unknown = fields[0]; assert.ok(first !== null && typeof first === "object" && "value" in first);
  const value: unknown = first.value; assert.ok(value !== null && typeof value === "object"); Object.assign(value, { description: "function replacement(){}" });
  assert.throws(() => decodeCurrentFootprintCopyProducerArray(wrongSource));
  let traps = 0;
  assert.throws(() => decodeCurrentFootprintCopyProducerScope(new Proxy({}, { ownKeys(): never { traps += 1; throw new Error("trap"); } })));
  assert.equal(traps, 0);
  assert.throws(() => decodeCurrentFootprintCopyProducerScope({ result: [property("0", { type: "object", subtype: "internal#scope", className: "Object", description: "Global", objectId: "global" }, true, true)] }));
});

const remoteArray = (objectId: string, length: number): Data => ({ result: { type: "object", subtype: "array", className: "Array", description: `Array(${String(length)})`, objectId } });
function owner(): { runner: CurrentFootprintCopyProducerRunner; calls: string[]; lose: () => void; failRecheck: () => void } {
  const calls: string[] = []; let current = true, valid = true;
  const runner = new CurrentFootprintCopyProducerRunner(Object.freeze({
    assertCurrent: (): void => { assert.ok(current, "owner lost"); },
    captureOriginalMethods: (): Promise<unknown> => { calls.push("capture-methods"); return Promise.resolve(remoteArray("methods", 8)); },
    recheckOriginalMethods: (): Promise<unknown> => { calls.push("recheck-methods"); return Promise.resolve(valid ? yes : { result: { type: "boolean", value: false } }); },
    properties: (id: string): Promise<unknown> => {
      calls.push(id);
      if (id === "methods" || id === "lexicals") { return Promise.resolve(arrayReply(id === "lexicals")); }
      if (id.startsWith("scopes-")) { return Promise.resolve(scopeList(id)); }
      const index = Number(id.split("-")[1]);
      return Promise.resolve(functionReply(index, id.startsWith("producer-")));
    },
    captureLexicals: (scope: string): Promise<unknown> => { calls.push(`capture-${scope}`); return Promise.resolve(remoteArray("lexicals", 10)); },
    recheckLexicals: (scope: string, bundle: string): Promise<unknown> => { calls.push(`recheck-${scope}`); assert.equal(bundle, "lexicals"); return Promise.resolve(yes); },
  }), "script");
  return { runner, calls, lose: (): void => { current = false; }, failRecheck: (): void => { valid = false; } };
}

void test("producer runner consumes exactly29 reads, fresh scopes and the original owner without execution authority", async () => {
  const { runner, calls, lose } = owner(), observation = await runner.observe();
  assert.equal(calls.length, CURRENT_FOOTPRINT_COPY_PRODUCER_REQUESTS); assert.equal(runner.retained().replies.length, 29);
  assert.deepEqual(calls.filter(call => call.startsWith("scopes-")), ["scopes-0", "scopes-1", "scopes-2", "scopes-4", "scopes-5"]);
  assert.equal(observation.executionAuthorized, false); assert.equal(observation.parserAndUploadCallbacksBound, false);
  runner.requireOriginal(observation); await assert.rejects(runner.observe());
  lose(); assert.throws(() => { runner.requireOriginal(observation); }); assert.equal(runner.retained().failed, true);
});

void test("producer runner rejects copied observations and terminal owner reproof failures without retry", async () => {
  const first = owner(), observation = await first.runner.observe();
  assert.throws(() => { first.runner.requireOriginal({ ...observation }); });
  const second = owner(); second.failRecheck(); await assert.rejects(second.runner.observe());
  assert.equal(second.runner.retained().failed, true); assert.equal(second.runner.retained().replies.length, 29);
  await assert.rejects(second.runner.observe()); assert.equal(second.calls.length, 29);
});
