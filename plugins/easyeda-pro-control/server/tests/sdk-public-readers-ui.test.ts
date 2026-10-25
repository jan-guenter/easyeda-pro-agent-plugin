import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { decodeExactReadEnvelope } from "../src/exact-readers.ts";
import {
  SDK_PUBLIC_READERS_209_RESOLVED_LANGUAGES,
  SDK_PUBLIC_READERS_209_SYSTEM_LIBRARY_UUID,
  buildSdkPublicReadersProgram,
  parseSdkPublicReadersRequest,
  sdkPublicReadersDescriptors,
  validateSdkPublicReadersResult,
} from "../src/sdk-public-readers.ts";

const cases = [
  { method: "eda.sys_Window.getCurrentTheme", namespace: "sys_Window", name: "getCurrentTheme", value: "dark" },
  { method: "eda.sys_Unit.getFrontendDataUnit", namespace: "sys_Unit", name: "getFrontendDataUnit", value: "mil" },
  { method: "eda.lib_LibrariesList.getSystemLibraryUuid", namespace: "lib_LibrariesList", name: "getSystemLibraryUuid", value: SDK_PUBLIC_READERS_209_SYSTEM_LIBRARY_UUID },
  { method: "eda.sys_I18n.getCurrentLanguage", namespace: "sys_I18n", name: "getCurrentLanguage", value: "de" },
] as const;
const request = (method: string): unknown => ({ method, arguments: {} });

function fixture(entry: typeof cases[number], response: (call: number) => unknown = () => entry.value): {
  evaluate: (code: string) => unknown; run: () => Promise<unknown>; calls: () => number; timersCleared: () => number;
} {
  let calls = 0, cleared = 0, deadline: (() => void) | undefined, elapsed = 0;
  const owner: Record<string, unknown> = {};
  owner[entry.name] = function read(this: unknown, ...args: unknown[]): Promise<unknown> {
    assert.equal(this, owner); assert.deepEqual(args, []); calls += 1;
    return Promise.resolve(response(calls));
  };
  const context = createContext({ TextEncoder, eda: { extensionUuid: "7e06d286b1ac846ef7eab9c7f2a9ee40", [entry.namespace]: owner },
    performance: { now: (): number => elapsed }, advanceClock: (): void => { elapsed += 10_001; }, expire: (): void => { deadline?.(); },
    // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Capture the browser timer without waiting so the test distinguishes monotonic expiry from timer delivery.
    setTimeout: (callback: () => void): number => { deadline = callback; return 1; }, clearTimeout: (): void => { cleared += 1; } });
  const evaluate = (code: string): unknown => runInContext(code, context, { timeout: 1000 }) as unknown;
  evaluate(`window=globalThis;self=globalThis;top=globalThis;frameElement=null;
    location={origin:'https://client',href:'https://client/editor?cll=error'};
    document={defaultView:globalThis,nodeType:9,URL:location.href};
    PRO_EDITOR_MODE='CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM';
    _MSG_BUS2_EXTAPI_={rpcCall(){throw new Error('NO_DIRECT_RPC');}};
    _MSG_BUS_={rpcCall(){throw new Error('NO_DIRECT_LEGACY_RPC');}};
    gVars={extensionApiMessageBus2:_MSG_BUS2_EXTAPI_,messageBus:_MSG_BUS_};UI={gVars};`);
  return { evaluate, calls: () => calls, timersCleared: () => cleared, run: () => {
    const code = buildSdkPublicReadersProgram(request(entry.method));
    return Promise.resolve(evaluate(`(async()=>{${code}})()`));
  } };
}

void test("four UI-backed public methods await two fixed calls and retain bounded public values", async () => {
  for (const entry of cases) {
    const observed = fixture(entry), raw = decodeExactReadEnvelope(await observed.run());
    const result = validateSdkPublicReadersResult(request(entry.method), raw);
    assert.equal(observed.calls(), 2); assert.equal(result["value"], entry.value);
    assert.equal(observed.timersCleared(), 1);
    assert.equal(result["uiVersion"], "3.2.198.2800f583");
    assert.match(String(result["authority"]), /not-project-state/u);
    const descriptor = sdkPublicReadersDescriptors().find((item) => item.method === entry.method);
    assert.ok(descriptor?.uiSource); assert.equal(descriptor.uiSource.sha256, result["uiSha256"]);
  }
});

void test("late UI responses cannot dispatch another sample even before the timeout callback runs", async () => {
  for (const entry of [cases[0], cases[3]]) {
    for (const mutation of ["advanceClock()", "expire()", "performance={...performance}", "performance.now=()=>0"]) {
      const observed = fixture(entry, async () => {
        await Promise.resolve(); observed.evaluate(mutation); return entry.value;
      });
      await assert.rejects(observed.run(), { message: "SDK_PUBLIC_READERS_READ_FAILED" });
      assert.equal(observed.calls(), 1); assert.equal(observed.timersCleared(), 1);
    }
  }
});

void test("same-function accessors and prototype replacements refuse without executing the accessor", async () => {
  const mutations = [
    "const saved=eda.sys_Window;Object.defineProperty(eda,'sys_Window',{get(){getterCalls++;return saved;}})",
    "const saved=eda.sys_Window.getCurrentTheme;Object.defineProperty(eda.sys_Window,'getCurrentTheme',{get(){getterCalls++;return saved;}})",
    "const saved=_MSG_BUS2_EXTAPI_.rpcCall;Object.defineProperty(_MSG_BUS2_EXTAPI_,'rpcCall',{get(){getterCalls++;return saved;}})",
    "Object.setPrototypeOf(eda.sys_Window,{})", "Object.setPrototypeOf(_MSG_BUS2_EXTAPI_,{})",
  ];
  for (const mutation of mutations) {
    const observed = fixture(cases[0], async () => {
      await Promise.resolve(); observed.evaluate(mutation); return "dark";
    });
    observed.evaluate("getterCalls=0");
    await assert.rejects(observed.run(), { message: "SDK_PUBLIC_READERS_READ_FAILED" });
    assert.equal(observed.calls(), 1); assert.equal(observed.evaluate("getterCalls"), 0);
    assert.equal(observed.timersCleared(), 1);
  }
});

void test("UI-backed methods refuse missing, coerced, extra and unknown public results without adapter fallback", async () => {
  for (const entry of cases) {
    for (const value of [undefined, null, false, { value: entry.value }, [entry.value], "", "x".repeat(9000), "unknown"]) {
      const observed = fixture(entry, () => value);
      await assert.rejects(observed.run(), { message: "SDK_PUBLIC_READERS_READ_FAILED" });
      assert.equal(observed.calls(), 1);
      assert.throws(() => validateSdkPublicReadersResult(request(entry.method), { ok: true, kind: "sdk-public-readers", method: entry.method, value }));
    }
  }
  for (const value of ["follow_system", "LIGHT", "customize"]) {
    await assert.rejects(fixture(cases[0], () => value).run(), /SDK_PUBLIC_READERS_READ_FAILED/u);
  }
  for (const value of ["in", "m", "cm", "unit(mil)"]) {
    await assert.rejects(fixture(cases[1], () => value).run(), /SDK_PUBLIC_READERS_READ_FAILED/u);
  }
  await assert.rejects(fixture(cases[2], () => "a".repeat(32)).run(), /SDK_PUBLIC_READERS_READ_FAILED/u);
});

void test("SDK-resolved language preserves its exact enum and discloses vendor fallback and private-cache limits", async () => {
  const entry = cases[3];
  for (const value of SDK_PUBLIC_READERS_209_RESOLVED_LANGUAGES) {
    const observed = fixture(entry, () => value);
    const result = validateSdkPublicReadersResult(request(entry.method), decodeExactReadEnvelope(await observed.run()));
    assert.equal(result["value"], value); assert.equal(observed.calls(), 2);
    assert.equal(result["languageScope"], "sdk-resolved-language");
    assert.equal(result["fallbackPossible"], true); assert.equal(result["providerSuccessVerified"], false);
    assert.equal(result["cachedMessageBusIdentityVerified"], false);
    assert.match(JSON.stringify(result["limitations"]), /300-second vendor timeout not cancelled on success/u);
  }
  // The provider's undefined reply and actual English both become SDK "en".
  // Neither this synthetic observation nor the result claims to distinguish them.
  for (const value of ["vn", "zh-hans", "zh-CN", "EN", "en-US"]) {
    await assert.rejects(fixture(entry, () => value).run(), /SDK_PUBLIC_READERS_READ_FAILED/u);
    assert.throws(() => validateSdkPublicReadersResult(request(entry.method), { ok: true, kind: "sdk-public-readers", method: entry.method, value }));
  }
});

void test("language pins its available legacy bus and descriptors through both awaits without using MessageBus2", async () => {
  const entry = cases[3];
  const mutations = [
    "eda.sys_I18n={...eda.sys_I18n}", "eda.sys_I18n.getCurrentLanguage=async()=> 'de'",
    "_MSG_BUS_={..._MSG_BUS_}", "gVars.messageBus={}", "_MSG_BUS_.rpcCall=()=>{}", "Object.setPrototypeOf(_MSG_BUS_,{})",
    "Object.defineProperty(globalThis,'_MSG_BUS_',{writable:false})", "Object.defineProperty(gVars,'messageBus',{enumerable:false})",
    "const saved=_MSG_BUS_;Object.defineProperty(globalThis,'_MSG_BUS_',{get(){getterCalls++;return saved;}})",
    "const saved=_MSG_BUS_;Object.defineProperty(gVars,'messageBus',{get(){getterCalls++;return saved;}})",
    "const saved=_MSG_BUS_.rpcCall;Object.defineProperty(_MSG_BUS_,'rpcCall',{get(){getterCalls++;return saved;}})",
    "const saved=eda.sys_I18n.getCurrentLanguage;Object.defineProperty(eda.sys_I18n,'getCurrentLanguage',{get(){getterCalls++;return saved;}})",
  ];
  for (const mutation of mutations) {
    for (const changeAt of [1, 2]) {
      const observed = fixture(entry, async (call) => {
        await Promise.resolve(); if (call === changeAt) { observed.evaluate(mutation); } return entry.value;
      });
      observed.evaluate("getterCalls=0");
      await assert.rejects(observed.run(), { message: "SDK_PUBLIC_READERS_READ_FAILED" });
      assert.equal(observed.calls(), changeAt); assert.equal(observed.evaluate("getterCalls"), 0);
    }
  }
  for (const mutation of ["delete _MSG_BUS_", "delete _MSG_BUS_.rpcCall", "gVars.messageBus={}"]) {
    const observed = fixture(entry); observed.evaluate(mutation);
    await assert.rejects(observed.run(), { message: "SDK_PUBLIC_READERS_READ_FAILED" }); assert.equal(observed.calls(), 0);
  }
  const observed = fixture(entry); observed.evaluate("delete _MSG_BUS2_EXTAPI_;delete gVars.extensionApiMessageBus2");
  await observed.run(); assert.equal(observed.calls(), 2);
});

void test("UI-backed readers reject owner drift during each await before any subsequent call", async () => {
  const mutations = [
    "eda={...eda}", "eda.sys_Window={...eda.sys_Window}", "eda.sys_Window.getCurrentTheme=async()=> 'dark'",
    "eda.extensionUuid='other'", "UI={...UI}", "gVars={...gVars}", "UI.gVars={...gVars}",
    "_MSG_BUS2_EXTAPI_={..._MSG_BUS2_EXTAPI_}", "gVars.extensionApiMessageBus2={}",
    "_MSG_BUS2_EXTAPI_.rpcCall=()=>{}", "Object.setPrototypeOf(_MSG_BUS2_EXTAPI_,{})", "document={...document}",
    "document.defaultView={}", "document.URL+='changed'", "location={...location}", "location.href+='changed'",
    "self={}", "top={}", "window={}", "EDITOR_TOP={}", "frameElement={}", "PRO_EDITOR_MODE='unknown'",
  ];
  for (const mutation of mutations) {
    for (const changeAt of [1, 2]) {
      const observed = fixture(cases[0], async (call) => {
        await Promise.resolve(); if (call === changeAt) { observed.evaluate(mutation); }
        return "dark";
      });
      await assert.rejects(observed.run(), { message: "SDK_PUBLIC_READERS_READ_FAILED" });
      assert.equal(observed.calls(), changeAt);
    }
  }
});

void test("UI reads never use matching values from a foreign editor or incomplete shared bus", async () => {
  for (const mutation of [
    "location.origin='https://foreign'", "location.href='https://client/other';document.URL=location.href",
    "document.nodeType=1", "delete UI.gVars", "delete _MSG_BUS2_EXTAPI_.rpcCall", "gVars.extensionApiMessageBus2={}",
    "Object.defineProperty(UI,'gVars',{get(){throw new Error('PRIVATE_ACCESSOR');}})",
  ]) {
    const observed = fixture(cases[0]); observed.evaluate(mutation);
    await assert.rejects(observed.run(), { message: "SDK_PUBLIC_READERS_READ_FAILED" });
    assert.equal(observed.calls(), 0);
  }
});

void test("UI read rejection and unequal samples consume only the dispatched calls", async () => {
  const rejected = fixture(cases[0], () => Promise.reject(new Error("PRIVATE_RPC_FAILURE")));
  await assert.rejects(rejected.run(), { message: "SDK_PUBLIC_READERS_READ_FAILED" }); assert.equal(rejected.calls(), 1);
  const changed = fixture(cases[0], (call) => call === 1 ? "light" : "dark");
  await assert.rejects(changed.run(), /SDK_PUBLIC_READERS_READ_FAILED/u); assert.equal(changed.calls(), 2);
  for (const entry of cases) {
    assert.throws(() => parseSdkPublicReadersRequest({ method: entry.method, arguments: { libraryUuid: "private" } }));
    assert.throws(() => parseSdkPublicReadersRequest({ method: entry.method, arguments: {}, uiPath: "/override" }));
  }
  assert.throws(() => parseSdkPublicReadersRequest(request("eda.sys_I18n.text")));
});
