/** Fixed programs in an inert realm. Explicit synthetic scope objects exercise
 * joins only and cannot issue the original main/native request capability. */
import assert from "node:assert/strict";
import { open } from "node:fs/promises";
import { test } from "node:test";
import { types } from "node:util";
import { createContext, runInContext } from "node:vm";
import { CURRENT_SELECTED_FILE_MAIN_FETCH_BRAND_SOURCE as BRAND, CURRENT_SELECTED_FILE_MAIN_FETCH_METHOD_SOURCE as METHOD,
  CURRENT_SELECTED_FILE_MAIN_FETCH_SOURCE as SOURCE, captureCurrentSelectedFileMainFetchScriptReply, qualifyCurrentSelectedFileMainFetchSource,
  requireOriginalCurrentSelectedFileMainFetchSource } from "../src/current-selected-file-main-fetch-source.ts";
import { CURRENT_SELECTED_FILE_MAIN_REQUEST_CALLS as CALLS } from "../src/current-selected-file-main-request-programs.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_CAPTURE_PROGRAM as SQL_CAPTURE } from "../src/current-selected-file-main-sql-fence-programs.ts";

function fixture(): ReturnType<typeof createContext> {
  const context = createContext({ nativeProxy: types.isProxy });
  runInContext(`let calls=0;const forbidden=()=>{calls++;throw Error("effectful accessor");};class Z2{}class Yo{};const sc={Database:Map,Statement:Set},F5={types:{isProxy:nativeProxy}},sql=(${SQL_CAPTURE}).call([Z2,Yo,sc,F5],"C:\\\\Synthetic\\\\fixture.eprj2");
const FunctionPrototypeSymbolHasInstance=Function.prototype.call.bind(Function.prototype[Symbol.hasInstance]),webidl={};webidl.brandCheck=${BRAND};
const RequestClass=class _Request{#state;constructor(method){this.#state={method};}${METHOD} get url(){return forbidden();}};Object.defineProperty(RequestClass.prototype,"method",{enumerable:true});
class BL{constructor(req){this.req=req;this.pureUrl="/api/v4/projects/"+"a".repeat(64);this.pureQuery="";this._headers={path:"b".repeat(64)};}}class zL extends BL{};
const request=new RequestClass("GET"),wrapper=new BL(request),frame=[{},wrapper,{},sc,F5,BL,zL];
const captured=(${CALLS.capture}).call(frame,sql),bound=(${CALLS.bind}).call(captured,{_Request:RequestClass},{webidl},webidl,{FunctionPrototypeSymbolHasInstance});`, context);
  return context;
}
void test("qualified original method getter reads GET/POST without touching URL/body or application methods", () => {
  const context = fixture(), first: unknown = runInContext(`(${CALLS.read}).call(bound)`, context);
  assert.ok(first !== null && typeof first === "object"); assert.equal(Reflect.get(first, "method"), "GET"); assert.equal(Reflect.get(first, "readonlySql"), false);
  runInContext(`const second=new BL(new RequestClass("POST")),next=(${CALLS.capture}).call([frame[0],second,frame[2],sc,F5,BL,zL],sql),rebound=(${CALLS.rebind}).call(next,bound);`, context);
  const after: unknown = runInContext(`(${CALLS.read}).call(rebound)`, context);
  assert.ok(after !== null && typeof after === "object"); assert.equal(Reflect.get(after, "method"), "POST"); assert.equal(Reflect.get(after, "executionAuthorized"), false); assert.equal(runInContext("calls", context), 0);
});
void test("only the path header is projected; cookie/authorization values and getters stay private", () => {
  const context = fixture(); runInContext('Object.defineProperty(wrapper._headers,"cookie",{get:forbidden});Object.defineProperty(wrapper._headers,"authorization",{get:forbidden});', context);
  const value: unknown = runInContext(`(${CALLS.read}).call(bound)`, context); assert.ok(value !== null && typeof value === "object");
  assert.equal(Reflect.get(value, "pathHeader"), "b".repeat(64)); assert.equal(Object.hasOwn(value, "headers"), false); assert.equal(Object.hasOwn(value, "cookie"), false); assert.equal(runInContext("calls", context), 0);
});
void test("getter, brand, wrapper, header and proxy drift refuse before an effectful accessor", () => {
  for (const mutation of ['Object.defineProperty(RequestClass.prototype,"method",{get:forbidden})', 'webidl.brandCheck=forbidden', 'wrapper.req=new RequestClass("GET")', 'Object.defineProperty(wrapper,"pureUrl",{get:forbidden})', 'Object.defineProperty(wrapper._headers,"path",{get:forbidden})', 'wrapper._headers=new Proxy({},{ownKeys:forbidden})']) {
    const context = fixture(); runInContext(mutation, context); assert.throws(() => runInContext(`(${CALLS.read}).call(bound)`, context), /SELECTED_MAIN_REQUEST_BINDING/u); assert.equal(runInContext("calls", context), 0, mutation);
  }
});
void test("legacy ownmethod is admitted only under its distinct original wrapper branch", () => {
  const context = fixture(); const value: unknown = runInContext(`const legacy=new zL({method:"HEAD"}),saved=(${CALLS.capture}).call([frame[0],legacy,frame[2],sc,F5,BL,zL],sql);(${CALLS.read}).call(saved)`, context);
  assert.ok(value !== null && typeof value === "object"); assert.equal(Reflect.get(value, "mode"), "legacy"); assert.equal(Reflect.get(value, "method"), "HEAD");
  runInContext('Object.defineProperty(legacy.req,"method",{get:forbidden});', context); assert.throws(() => runInContext(`(${CALLS.read}).call(saved)`, context)); assert.equal(runInContext("calls", context), 0);
});
void test("the installed PE embedded builtin qualifies exact complete source; source JSON and accessors cannot issue it", async context => {
  const handle = await open("/mnt/c/Program Files/easyeda-pro/easyeda-pro.exe", "r").catch((error: unknown): undefined => { if (error !== null && typeof error === "object" && "code" in error && error.code === "ENOENT") { return undefined; } throw error; });
  if (handle === undefined) { context.skip("Pinned vendor PE is not present in this source-only environment."); return; }
  try {
    const before = await handle.stat(); assert.equal(before.size, SOURCE.executable.bytes); const bytes = Buffer.alloc(SOURCE.embedded.bytes);
    const read = await handle.read(bytes, 0, bytes.length, SOURCE.embedded.offset); assert.equal(read.bytesRead, bytes.length); const after = await handle.stat(); assert.equal(before.ino, after.ino); assert.equal(before.mtimeMs, after.mtimeMs); assert.equal(before.ctimeMs, after.ctimeMs);
    const source = bytes.toString("latin1"), token = qualifyCurrentSelectedFileMainFetchSource(captureCurrentSelectedFileMainFetchScriptReply({ scriptSource: source }).scriptSource);
    requireOriginalCurrentSelectedFileMainFetchSource(token); assert.throws(() => { requireOriginalCurrentSelectedFileMainFetchSource(structuredClone(token)); }); assert.throws(() => qualifyCurrentSelectedFileMainFetchSource(`${source}\n`));
    let calls = 0; assert.throws(() => captureCurrentSelectedFileMainFetchScriptReply(Object.defineProperty({}, "scriptSource", { get: (): never => { calls += 1; throw new Error("getter"); } }))); assert.equal(calls, 0);
  } finally { await handle.close(); }
});
