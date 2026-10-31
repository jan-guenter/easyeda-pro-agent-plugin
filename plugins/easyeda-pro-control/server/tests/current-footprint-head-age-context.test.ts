/** Exact fixed context programs in a synthetic realm, plus real local V8
 * descriptor metadata. Neither source bytes nor these tests issue custody. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_FOOTPRINT_HEAD_AGE_CONTEXT_BIND_PROGRAM as BIND, CURRENT_FOOTPRINT_HEAD_AGE_CONTEXT_CAPTURE_PROGRAM as CAPTURE,
  CURRENT_FOOTPRINT_HEAD_AGE_CONTEXT_REQUIRE_PROGRAM as REQUIRE, CURRENT_FOOTPRINT_HEAD_AGE_CONTEXT_SOURCE as SOURCE,
  decodeCurrentFootprintHeadAgeContextAccessor, decodeCurrentFootprintHeadAgeContextScopes, requireCurrentFootprintHeadAgeContextSource } from "../src/current-footprint-head-age-context.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_CALLS } from "../src/current-footprint-copy-main-backend-programs.ts";
import { CURRENT_FOOTPRINT_HEAD_AGE_CAPTURE_PROGRAM, CURRENT_FOOTPRINT_HEAD_AGE_OBSERVE_PROGRAM } from "../src/current-footprint-head-age-main.ts";
import { mainBackendFragments } from "./helpers/footprint-main-backend-fragments.ts";

/** Bind the exact fixed programs to a synthetic accessor-backed process and
 * matching lexical scope wrappers without issuing native custody. */
function fixture(): ReturnType<typeof createContext> {
  const context = createContext({});
  runInContext(`const originalProcess={pid:123,versions:{node:"24.14.1"},env:{}};let _process=originalProcess;
const accessor={${SOURCE.getter.text},${SOURCE.setter.text}};
Object.defineProperty(globalThis,"process",{get:accessor.get,set:accessor.set,enumerable:false,configurable:true});
const u=async function u(t){},xC=function xC(t,e,r){},L3=async function L3(t,e,r=false){},y=async function y(t,e){};
class Driver{async interceptHttpProtocol(e,r,i){}}const backend=new Driver(),session={};backend.cb=(()=>async(r,i)=>{})();
const rl=${mainBackendFragments.dateParser},source=[u,backend,session,xC,L3,y,Date,Date.now,rl];
const original=(${CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_CALLS.capture.program}).call(source);
const captured=(${CAPTURE}).call(source,original);
const inner={description:"Closure (setupProcessObject)",object:{_process:originalProcess}},outer={description:"Closure",object:{process:originalProcess,globalThis}};
const bound=(${BIND}).call(inner,outer,inner,outer,captured,123);`, context);
  return context;
}
void test("the exact accessor tuple binds original lexical process/global/env and keeps the descriptor intact", () => {
  const context = fixture();
  assert.equal(runInContext(`(${REQUIRE})(bound)`, context), true);
  assert.equal(runInContext("Object.getOwnPropertyDescriptor(globalThis,'process').get===accessor.get&&Object.getOwnPropertyDescriptor(globalThis,'process').set===accessor.set", context), true);
  const literal = "2020-01-15 12:34:56", wall = Date.parse(`${literal.replace(" ", "T")}Z`);
  const result: unknown = runInContext(`const held=(${CURRENT_FOOTPRINT_HEAD_AGE_CAPTURE_PROGRAM}).call(source,original,bound);(${CURRENT_FOOTPRINT_HEAD_AGE_OBSERVE_PROGRAM}).call(held,${JSON.stringify(literal)},${String(wall)}).executionAuthorized`, context);
  assert.equal(result, false);
});
void test("data descriptors, replaced getter/setter and a setter-created process replacement refuse", () => {
  for (const mutation of [
    "Object.defineProperty(globalThis,'process',{value:originalProcess,configurable:true})",
    "Object.defineProperty(globalThis,'process',{get(){return originalProcess},set:accessor.set,configurable:true})",
    "Object.defineProperty(globalThis,'process',{get:accessor.get,set(value){},configurable:true})",
    "process={pid:123,versions:{node:'24.14.1'},env:{}}",
    "originalProcess.env={}",
    "originalProcess.pid=124",
  ]) {
    const context = fixture(); runInContext(mutation, context); assert.throws(() => runInContext(`(${REQUIRE})(bound)`, context), /HEAD_AGE_CONTEXT/u);
  }
});
void test("case-insensitive TZ and foreign bootstrap lexical receiver or native PID never bind", () => {
  for (const key of ["TZ", "tz", "Tz", "tZ"]) {
    const context = fixture(); runInContext(`originalProcess.env[${JSON.stringify(key)}]='UTC'`, context);
    assert.throws(() => runInContext(`(${REQUIRE})(bound)`, context), /HEAD_AGE_CONTEXT/u);
  }
  const context = fixture();
  assert.throws(() => runInContext(`(${BIND}).call(inner,outer,inner,outer,captured,456)`, context), /HEAD_AGE_CONTEXT/u);
  assert.throws(() => runInContext(`(${BIND}).call(inner,{description:'Closure',object:{process:originalProcess,globalThis:{}}},inner,outer,captured,123)`, context), /HEAD_AGE_CONTEXT/u);
  assert.throws(() => { requireCurrentFootprintHeadAgeContextSource({ profile: "private.current-footprint-head-age-context-source.v1", runtimeProcessVerified: false, executionAuthorized: false }); });
});
void test("actual local Node24 accessor scopes have the fixed three labels; its different bootstrap generation refuses", async () => {
  const session = new Session(); session.connect();
  try {
    await session.post("Runtime.enable"); await session.post("Debugger.enable");
    const selected = await session.post("Runtime.evaluate", { expression: "Object.getOwnPropertyDescriptor(globalThis,'process').get" });
    assert.ok(selected.result.objectId !== undefined);
    const metadata = await session.post("Runtime.getProperties", { objectId: selected.result.objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
    assert.throws(() => decodeCurrentFootprintHeadAgeContextAccessor(metadata, "getter"));
    const scopes = metadata.internalProperties?.find(field => field.name === "[[Scopes]]"); const scopeValue = scopes?.value; assert.ok(scopeValue?.objectId !== undefined);
    const list = await session.post("Runtime.getProperties", { objectId: scopeValue.objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
    assert.equal(decodeCurrentFootprintHeadAgeContextScopes(list).length, 2);
    assert.throws(() => decodeCurrentFootprintHeadAgeContextScopes({ ...list, result: list.result.toReversed() }));
  } finally { session.disconnect(); }
});
