import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { decodeExactReadEnvelope } from "../src/exact-readers.ts";
import { buildSdkPublicReadersBatchProgram, validateSdkPublicReadersBatchResult } from "../src/sdk-public-readers-batch.ts";
import {
  SDK_PUBLIC_READERS_209_LANGUAGES, SDK_PUBLIC_READERS_API_LOG_LEVELS, SDK_PUBLIC_READERS_MAX_API_HREF_BYTES,
  buildSdkPublicReadersProgram, parseSdkPublicReadersRequest, sdkPublicReadersBatchRequestSchema,
  validateSdkPublicReadersArguments, validateSdkPublicReadersResult,
} from "../src/sdk-public-readers.ts";

const request = { method: "eda.sys_Window.getUrlParam", arguments: { key: "cll" } };
// Byte-exact Qu and Mu from API0.3.59 e7c31b0d at UTF16 472002/1907530.
// These producers run in an actual VM realm with synthetic browser objects.
// They attest neither a connected editor nor the actual bridge installation.
const pinnedQuerySource = "function Qu(e){return new URLSearchParams(new URL(window.location.href).search).get(e)}";
// oxlint-disable-next-line eslint/no-template-curly-in-string -- The byte-exact vendor compiler fixture must retain its own literal template placeholder.
const pinnedCompilerSource = "function Mu(e){e=`with (sandbox) {/**/\n        ${e}\n    /**/}`;let t=Object.getPrototypeOf(async()=>{}).constructor,i=t(\"sandbox\",e);return async n=>{let r=new Proxy(n,{has(s,a){return a in s},get(s,a,o){if(a===Symbol.unscopables||typeof a==\"string\"&&a.startsWith(\"_\")||typeof a==\"string\"&&E7.has(a))return;let l=Reflect.get(s,a,o);return typeof l==\"function\"?l.bind(s):l},set(s,a,o){return typeof a==\"string\"&&a.startsWith(\"_\")?!1:(s[a]=o,!0)},deleteProperty(s,a){return typeof a==\"string\"&&a.startsWith(\"_\")?!1:(delete s[a],!0)},ownKeys(s){return Object.keys(s).filter(a=>!a.startsWith(\"_\")&&!E7.has(a))}});return i(r)}}";

function fixture(href = "https://client/api-frame?cll=warn&session=PRIVATE_QUERY"): {
  evaluate: (code: string) => unknown; run: (code?: string) => Promise<unknown>;
} {
  const apiRealm = createContext({ TextEncoder, URL, URLSearchParams, logLevels: SDK_PUBLIC_READERS_API_LOG_LEVELS,
    supported: SDK_PUBLIC_READERS_209_LANGUAGES });
  const evaluate = (code: string): unknown => runInContext(code, apiRealm, { timeout: 1000 }) as unknown;
  evaluate(`window=globalThis;self=globalThis;location={href:${JSON.stringify(href)}};
    document={defaultView:globalThis,nodeType:9,URL:location.href};
    top={location:{href:'https://client/editor?cll=debug'}};parent=top;EDITOR_TOP=top;
    ${pinnedQuerySource}
    const E7=new Set(['__proto__','eval','Function','globalThis','top','parent','frames','window','opener']);
    ${pinnedCompilerSource}
    class ApiWindow{getUrlParam(t){return Qu(t)}}
    const original=new ApiWindow;calls=0;getterCalls=0;args=[];
    eda={sys_Window:original,sys_I18n:{getAllSupportedLanguages(){return supported}}};
    const nativeRead=original.getUrlParam;
    original.getUrlParam=function(...values){
      if(this!==original)throw new Error('WRONG_RECEIVER');calls++;args.push(values);return nativeRead.apply(this,values);
    };
    scheduled=0;cleared=0;performance={now(){return 0}};
    setTimeout=()=>{scheduled++;return 1};clearTimeout=()=>{cleared++};
    const bridge=Mu("const AsyncFunction=Object.getPrototypeOf(async()=>null).constructor;return await new AsyncFunction('eda',requestCode)(eda)");
    runBridge=code=>bridge({eda,requestCode:code,window:top,globalThis:top});`);
  // Invoke the compiled bridge from a different realm whose page URL conflicts
  // With the API's own page. The generated function still belongs to API realm.
  const parentRealm = createContext({ runBridge: evaluate("runBridge") });
  return { evaluate, run: (code = buildSdkPublicReadersProgram(request)) => {
    parentRealm["program"] = code;
    return Promise.resolve(runInContext("runBridge(program)", parentRealm, { timeout: 1000 }) as unknown);
  } };
}

void test("cll reader accepts one literal key and discloses no generic query access", () => {
  assert.deepEqual(parseSdkPublicReadersRequest(request), request);
  for (const input of [{}, { key: "session" }, { key: "__proto__" }, { key: "cll\n" }, { key: "" }, { key: "cll", code: "read()" }]) {
    const invalid = { ...request, arguments: input };
    assert.equal(validateSdkPublicReadersArguments(invalid)["valid"], false);
    assert.throws(() => buildSdkPublicReadersProgram(invalid));
  }
});

void test("actual pinned compiler/query producers retain API iframe values instead of conflicting parent UI values", async () => {
  for (const value of [...SDK_PUBLIC_READERS_API_LOG_LEVELS, null]) {
    const observed = fixture(`https://client/api-frame?session=PRIVATE_QUERY${value === null ? "" : `&cll=${value}`}`);
    const result = validateSdkPublicReadersResult(request, decodeExactReadEnvelope(await observed.run()));
    assert.equal(result["value"], value); assert.equal(observed.evaluate("calls"), 2);
    assert.deepEqual(structuredClone(observed.evaluate("args")), [["cll"], ["cll"]]);
    assert.equal(result["urlScope"], "public-api-execution-page"); assert.equal(result["uiStateVerified"], false);
    const text = JSON.stringify(result);
    assert.equal(text.includes("PRIVATE_QUERY"), false); assert.equal(text.includes("api-frame"), false);
  }
});

void test("unsupported URL values and bounded input refuse before any public method dispatch", async () => {
  const overlong = `https://client/api-frame?cll=debug&ignored=${"x".repeat(SDK_PUBLIC_READERS_MAX_API_HREF_BYTES)}`;
  for (const href of ["https://client/api-frame?cll=PRIVATE_QUERY", "https://client/api-frame?cll=", "not-a-url", overlong,
    `https://client/api-frame?cll=debug&ignored=${"😀".repeat(SDK_PUBLIC_READERS_MAX_API_HREF_BYTES / 4)}`]) {
    const observed = fixture(href);
    await assert.rejects(observed.run(), { message: "SDK_PUBLIC_READERS_READ_FAILED" });
    assert.equal(observed.evaluate("calls"), 0);
  }
});

void test("cll read rejects changed original method, receiver and API page owners before a second sample", async () => {
  const mutations = [
    "eda.sys_Window={...eda.sys_Window}", "eda.sys_Window.getUrlParam=()=> 'warn'",
    "const saved=eda.sys_Window.getUrlParam;Object.defineProperty(eda.sys_Window,'getUrlParam',{get(){getterCalls++;return saved}})",
    "Object.setPrototypeOf(eda.sys_Window,{})", "window={location,document}", "location={...location}",
    "document={...document}", "location.href='https://client/api-frame?cll=error'", "document.URL+='&changed=true'",
  ];
  for (const mutation of mutations) {
    const observed = fixture();
    observed.evaluate(`const savedRead=eda.sys_Window.getUrlParam;
      eda.sys_Window.getUrlParam=function(...values){const value=savedRead.apply(this,values);${mutation};return value};`);
    await assert.rejects(observed.run(), { message: "SDK_PUBLIC_READERS_READ_FAILED" });
    assert.equal(observed.evaluate("calls"), 1); assert.equal(observed.evaluate("getterCalls"), 0);
  }
});

void test("a bounded scalar must match the API page and every decoded output remains strict", async () => {
  for (const expression of ["'debug'", "null", "undefined", "Promise.resolve('warn')", "true"]) {
    const observed = fixture(); observed.evaluate(`eda.sys_Window.getUrlParam=()=>${expression}`);
    await assert.rejects(observed.run(), { message: "SDK_PUBLIC_READERS_READ_FAILED" });
  }
  const payload = { ok: true, kind: "sdk-public-readers", method: request.method, value: "warn" };
  for (const value of [undefined, "PRIVATE_QUERY", {}, true, ["warn"]]) {
    assert.throws(() => validateSdkPublicReadersResult(request, { ...payload, value }));
  }
  assert.throws(() => validateSdkPublicReadersResult(request, { ...payload, href: "PRIVATE_QUERY" }));
});

void test("cll participates in the unchanged shared batch deadline and two complete ordered passes", async () => {
  const observed = fixture();
  observed.evaluate(`order=[];const savedUrl=eda.sys_Window.getUrlParam;
    eda.sys_Window.getUrlParam=function(...values){order.push('cll');return savedUrl.apply(this,values)};
    eda.sys_Window.getViewportSize=()=>{order.push('viewport');return {width:9,height:11}};`);
  const batch = sdkPublicReadersBatchRequestSchema.parse({ action: "batch", requests: [request,
    { method: "eda.sys_Window.getViewportSize", arguments: {} }] });
  const raw = decodeExactReadEnvelope(await observed.run(buildSdkPublicReadersBatchProgram(batch)));
  const result = validateSdkPublicReadersBatchResult(batch, raw);
  assert.deepEqual(structuredClone(observed.evaluate("order")), ["cll", "viewport", "cll", "viewport"]);
  assert.deepEqual(structuredClone(observed.evaluate("[scheduled,cleared]")), [1, 1]);
  assert.equal(result["sharedDeadlineMilliseconds"], 10_000); assert.equal(result["atomicSnapshot"], false);
});

void test("batch captures the API URL owner before its first earlier member and rejects URL drift before cll dispatch", async () => {
  const observed = fixture();
  observed.evaluate("eda.sys_I18n.getAllSupportedLanguages=()=>{location.href+='&changed=true';return supported}");
  const batch = sdkPublicReadersBatchRequestSchema.parse({ action: "batch", requests: [
    { method: "eda.sys_I18n.getAllSupportedLanguages", arguments: {} }, request] });
  await assert.rejects(observed.run(buildSdkPublicReadersBatchProgram(batch)), { message: "SDK_PUBLIC_READERS_BATCH_READ_FAILED" });
  assert.equal(observed.evaluate("calls"), 0);
  assert.deepEqual(structuredClone(observed.evaluate("[scheduled,cleared]")), [1, 1]);
});
