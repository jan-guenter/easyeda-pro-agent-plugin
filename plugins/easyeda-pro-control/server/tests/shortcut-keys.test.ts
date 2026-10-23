import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { decodeExactReadEnvelope } from "../src/exact-readers.ts";
import { SHORTCUT_KEYS_209_REFUSAL_STAGES, SHORTCUT_KEYS_METHOD, buildShortcutKeys209Program, buildShortcutKeysProgram, parseShortcutKeysRequest, queryShortcutKeys,
  validateShortcutKeys209Result, validateShortcutKeysArguments, validateShortcutKeysResult } from "../src/shortcut-keys.ts";

const request = { method: SHORTCUT_KEYS_METHOD, arguments: {} };
function row(): Record<string, unknown> {
  return { shortcutKey: ["Ctrl", "Page Down", ""], title: "Raw shortcut", documentType: [4, 2, 4], scene: [6, 1] };
}

function environment(rows: unknown[] = [row()], options: { before?: string; afterRead?: string; fastDeadline?: boolean; includeSystem?: boolean; generation209?: boolean } = {}): {
  run: () => Promise<unknown>; evaluate: (source: string) => unknown;
} {
  const context = createContext({ TextEncoder,
    setTimeout: options.fastDeadline === true ? (callback: () => void, delay: number): ReturnType<typeof setTimeout> => {
      assert.equal(delay, 10_000); return setTimeout(callback, 1);
    } : setTimeout, clearTimeout,
    checkCall: (topic: unknown, flag: unknown): void => {
      assert.equal(topic, "extensionApi.SYS_ShortcutKey.getShortcutKeys");
      assert.equal(flag, options.includeSystem ?? false);
    } });
  runInContext(`globalThis.window=globalThis;globalThis.top=globalThis;
globalThis.location={href:'https://client/editor?cll=warn#',origin:'https://client'};
globalThis.document={defaultView:globalThis,nodeType:9,URL:location.href};
globalThis.PRO_EDITOR_MODE='CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM';
globalThis.rows=${JSON.stringify(rows)};globalThis.calls=0;globalThis.getterReads=0;
class Bus {async rpcCall(topic,flag){if(this!==globalThis._MSG_BUS2_EXTAPI_)throw new Error('PRIVATE_RECEIVER');checkCall(topic,flag);calls++;await Promise.resolve();${options.afterRead ?? ""}return rows;}}
globalThis._MSG_BUS2_EXTAPI_=new Bus();
globalThis.gVars={extensionApiMessageBus2:globalThis._MSG_BUS2_EXTAPI_};globalThis.UI={gVars:globalThis.gVars};
class Shortcut {async getShortcutKeys(flag=false){if(this!==eda.sys_ShortcutKey)throw new Error('PRIVATE_SDK_RECEIVER');return await _MSG_BUS2_EXTAPI_.rpcCall('extensionApi.SYS_ShortcutKey.getShortcutKeys',flag);}}
globalThis.eda={extensionUuid:'7e06d286b1ac846ef7eab9c7f2a9ee40',sys_ShortcutKey:new Shortcut()};
globalThis.Locale={_curr:'en',_cache:{en:{_status:'loaded'}},get curr(){return this._curr;},i18n(value){return value;},_getValue(value){return value;},_context_i18n(context,value){return value;}};
${options.before ?? ""}`, context, { timeout: 1000 });
  const input = { method: SHORTCUT_KEYS_METHOD, arguments: options.includeSystem === undefined ? {} : { includeSystem: options.includeSystem } };
  const code = options.generation209 === true ? buildShortcutKeys209Program(input) : buildShortcutKeysProgram(input);
  return {
    run: (): Promise<unknown> => Promise.resolve(runInContext(`(async()=>{${code}})()`, context, { timeout: 1000 }) as unknown),
    evaluate: (source: string): unknown => runInContext(source, context, { timeout: 1000 }) as unknown,
  };
}

void test("shortcut reader preserves raw tokens, duplicate scopes, order and empty results without input authority", async () => {
  for (const includeSystem of [false, true]) {
    const rows = [row(), { shortcutKey: [], title: "", documentType: [0, 10], scene: [] }];
    const fixture = environment(rows, { includeSystem });
    const input = { method: SHORTCUT_KEYS_METHOD, arguments: { includeSystem } };
    const result = validateShortcutKeysResult(input, decodeExactReadEnvelope(await fixture.run()));
    assert.deepEqual(result["shortcuts"], rows); assert.equal(result["includeSystem"], includeSystem);
    assert.equal(fixture.evaluate("calls"), 2);
    for (const field of ["keyboardExecutionAuthorized", "cadAuthority", "persistenceVerified", "completeShortcutInventory", "focusVerified", "declarationTokenConformanceVerified"]) {
      assert.equal(result[field], false);
    }
    assert.equal(result["liveValidation"], "not-recorded");
  }
  const empty = environment([]);
  const emptyPayload = decodeExactReadEnvelope(await empty.run());
  assert.deepEqual(validateShortcutKeysResult(request, emptyPayload)["shortcuts"], []);
});

void test("shortcut discovery normalizes omitted false and accepts only the fixed public query", () => {
  assert.deepEqual(parseShortcutKeysRequest(request), { method: SHORTCUT_KEYS_METHOD, arguments: { includeSystem: false } });
  assert.equal(validateShortcutKeysArguments(request)["valid"], true);
  for (const invalid of [{ method: "eda.sys_ShortcutKey.registerShortcutKey", arguments: {} },
    { ...request, code: "private()" }, { method: SHORTCUT_KEYS_METHOD, arguments: { includeSystem: 1 } },
    { method: SHORTCUT_KEYS_METHOD, arguments: { includeSystem: false, key: "Ctrl" } }]) {
    assert.throws(() => buildShortcutKeysProgram(invalid));
    assert.equal(validateShortcutKeysArguments(invalid)["valid"], false);
  }
  const catalog = queryShortcutKeys({ includeSchemas: true, method: SHORTCUT_KEYS_METHOD });
  assert.equal(catalog["total"], 1); assert.equal(catalog["invocationEnabledByDiscovery"], false);
  assert.match(JSON.stringify(catalog), /inputSchema/u);
  assert.throws(() => queryShortcutKeys({ method: "other" }));
});

void test("shortcut reader rechecks frame, public method, RPC and locale owners around awaits and copies scope arrays", async () => {
  for (const afterRead of [
    "globalThis.document={...document};",
    "eda.sys_ShortcutKey=new Shortcut();",
    "Shortcut.prototype.getShortcutKeys=async()=>rows;",
    "Bus.prototype.rpcCall=async()=>rows;",
    "globalThis.Locale={...Locale};",
    "Locale._cache.en={_status:'loaded'};",
    "Locale._curr='de';",
    "Locale.i18n=()=>'';",
    "if(calls===2)rows[0].documentType.push(0);",
  ]) {
    const fixture = environment([row()], { afterRead });
    await assert.rejects(fixture.run(), { message: "SHORTCUT_KEYS_READ_FAILED" });
    assert.equal(fixture.evaluate("calls"), afterRead.startsWith("if(calls===2)") ? 2 : 1);
  }
  const wrongBridge = environment([row()], { before: "eda.extensionUuid='aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';" });
  await assert.rejects(wrongBridge.run(), { message: "SHORTCUT_KEYS_READ_FAILED" });
  assert.equal(wrongBridge.evaluate("calls"), 0);
});

void test("shortcut reader rejects malformed, accessor and oversized replies and fixes vendor/deadline errors", async () => {
  for (const before of [
    "rows[0].scene=[0];", "rows[0].documentType=[11];", "rows[0].shortcutKey=['x'.repeat(33)];",
    "rows[0].title='x'.repeat(1025);", "rows[0].extra='PRIVATE';", "delete rows[0].scene[0];",
    "Object.defineProperty(rows[0],'title',{get(){getterReads++;throw new Error('PRIVATE_GETTER');}});",
    "rows=Array(1025).fill(rows[0]);", "rows=Array.from({length:300},()=>({...rows[0],title:'x'.repeat(1024)}));",
  ]) {
    const fixture = environment([row()], { before });
    await assert.rejects(fixture.run(), { message: "SHORTCUT_KEYS_READ_FAILED" });
    assert.equal(fixture.evaluate("calls"), 1); assert.equal(fixture.evaluate("getterReads"), 0);
  }
  const failed = environment([row()], { afterRead: "throw new Error('PRIVATE_VENDOR_ERROR');" });
  await assert.rejects(failed.run(), { message: "SHORTCUT_KEYS_READ_FAILED" });
  const hung = environment([row()], { afterRead: "return await new Promise(()=>{});", fastDeadline: true });
  await assert.rejects(hung.run(), { message: "SHORTCUT_KEYS_READ_FAILED" });
  assert.equal(hung.evaluate("calls"), 1);
});

void test("shortcut result validator binds the requested filter and refuses unknown data or authority upgrades", async () => {
  const raw: unknown = decodeExactReadEnvelope(await environment().run());
  assert.ok(raw !== null && typeof raw === "object");
  const payload = { ...raw };
  for (const invalid of [{ ...payload, includeSystem: true }, { ...payload, method: "other" }, { ...payload, extra: "PRIVATE" },
    { ...payload, keyboardExecutionAuthorized: true }, { ...payload, shortcuts: [{ ...row(), documentType: [11] }] }]) {
    assert.throws(() => validateShortcutKeysResult(request, invalid));
  }
});

void test("209 fixed shortcut program preserves UI scopes 11-14 but refuses out-of-range values and await-time mode drift", async () => {
  const rows = [{ ...row(), documentType: [0, 10, 11, 12, 13, 14, 14] }];
  const fixture = environment(rows, { generation209: true });
  const result = validateShortcutKeys209Result(request, decodeExactReadEnvelope(await fixture.run()));
  assert.deepEqual(result["shortcuts"], rows); assert.equal(result["declarationScopeConformanceVerified"], false);
  assert.equal(fixture.evaluate("calls"), 2);
  for (const options of [
    { before: "rows[0].documentType=[15];", expectedStage: "result-document-types" },
    { afterRead: "globalThis.PRO_EDITOR_MODE='CLIENT-OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM';", expectedStage: "editor-mode" },
    { afterRead: "globalThis.UI={gVars:globalThis.gVars};", expectedStage: "api-owner" },
  ]) {
    const rejected = environment(rows, { ...options, generation209: true });
    const refusal = validateShortcutKeys209Result(request, decodeExactReadEnvelope(await rejected.run()));
    assert.equal(refusal["ok"], false); assert.equal(refusal["stage"], options.expectedStage); assert.equal(rejected.evaluate("calls"), 1);
  }
});

void test("209 shortcut refusal stages identify failed guards without leaking raw values or partial shortcut data", async () => {
  const cases = [
    { before: "delete globalThis.PRO_EDITOR_MODE;", stage: "initial-environment", calls: 0 },
    { before: "delete eda.sys_ShortcutKey;", stage: "public-method", calls: 0 },
    { before: "delete Bus.prototype.rpcCall;", stage: "rpc-method", calls: 0 },
    { before: "Locale._cache=Object.create(null);", stage: "locale-cache", calls: 0 },
    { before: "Locale.i18n='PRIVATE';", stage: "locale-methods", calls: 0 },
    { before: "globalThis.setTimeout='PRIVATE';", stage: "timer-owner", calls: 0 },
    { before: "document.URL='PRIVATE';", stage: "frame-owner", calls: 0 },
    { before: "eda.extensionUuid='PRIVATE';", stage: "api-owner", calls: 0 },
    { before: "gVars.extensionApiMessageBus2={};", stage: "rpc-owner", calls: 0 },
    { afterRead: "Locale._cache.en={};", stage: "locale-owner", calls: 1 },
    { afterRead: "Locale.i18n=()=>'';", stage: "locale-method-owner", calls: 1 },
    { afterRead: "throw new Error('PRIVATE_VENDOR_ERROR');", stage: "public-call", calls: 1 },
    { before: "rows={secret:'PRIVATE'};", stage: "result-array", calls: 1 },
    { before: "rows[0].extra='PRIVATE';", stage: "result-record", calls: 1 },
    { before: "rows[0].shortcutKey='PRIVATE';", stage: "result-keys", calls: 1 },
    { before: "rows[0].shortcutKey=['x'.repeat(33)];", stage: "result-key-token", calls: 1 },
    { before: "Object.defineProperty(rows[0],'title',{get(){getterReads++;throw new Error('PRIVATE_ACCESSOR');}});", stage: "result-title", calls: 1 },
    { before: "rows[0].documentType=[15];", stage: "result-document-types", calls: 1 },
    { before: "rows[0].scene=[0];", stage: "result-scenes", calls: 1 },
    { before: "rows=Array.from({length:300},()=>({...rows[0],title:'x'.repeat(1024)}));", stage: "sample-size", calls: 1 },
    { afterRead: "if(calls===2)rows[0].documentType.push(0);", stage: "sample-equality", calls: 2 },
    { before: "rows=Array.from({length:240},()=>({...rows[0],title:'\\\"'.repeat(500)}));", stage: "result-envelope", calls: 2 },
    { afterRead: "return await new Promise(()=>{});", fastDeadline: true, stage: "deadline", calls: 1 },
    { before: "const originalClear=clearTimeout;globalThis.clearTimeout=timer=>{originalClear(timer);throw new Error('PRIVATE_CLEAR');};", stage: "timer-cleanup", calls: 2 },
  ];
  const observed = new Set<string>();
  for (const options of cases) {
    const fixture = environment([row()], { ...options, generation209: true });
    const raw = decodeExactReadEnvelope(await fixture.run()), result = validateShortcutKeys209Result(request, raw);
    assert.equal(result["ok"], false); assert.equal(result["stage"], options.stage); observed.add(options.stage);
    assert.equal(result["code"], "SHORTCUT_KEYS_209_READ_REFUSED"); assert.equal(result["publicCallsAttempted"], options.calls);
    assert.equal(result["cleanupFailed"], options.stage === "timer-cleanup");
    assert.equal(result["observationSucceeded"], false); assert.equal(result["partialResultsReturned"], false);
    assert.equal(result["shortcuts"], undefined); assert.equal(fixture.evaluate("calls"), options.calls); assert.equal(fixture.evaluate("getterReads"), 0);
    assert.doesNotMatch(JSON.stringify(raw), /PRIVATE|Raw shortcut|Page Down/u);
    assert.throws(() => validateShortcutKeysResult(request, raw));
  }
  // Editor-mode is covered by the preceding existing 209 regression.
  observed.add("editor-mode");
  assert.deepEqual([...observed].toSorted(), [...SHORTCUT_KEYS_209_REFUSAL_STAGES].toSorted());
});

void test("209 shortcut cleanup failure retains the first public-call failure stage", async () => {
  const fixture = environment([row()], { generation209: true,
    before: "const originalClear=clearTimeout;globalThis.clearTimeout=timer=>{originalClear(timer);throw new Error('PRIVATE_CLEAR');};",
    afterRead: "throw new Error('PRIVATE_VENDOR_ERROR');" });
  const raw = decodeExactReadEnvelope(await fixture.run()), result = validateShortcutKeys209Result(request, raw);
  assert.equal(result["ok"], false); assert.equal(result["stage"], "public-call"); assert.equal(result["cleanupFailed"], true);
  assert.equal(result["sample"], 1); assert.equal(result["publicCallsAttempted"], 1); assert.equal(fixture.evaluate("calls"), 1);
  assert.equal(result["partialResultsReturned"], false); assert.equal(result["shortcuts"], undefined);
  assert.doesNotMatch(JSON.stringify(raw), /PRIVATE|Raw shortcut|Page Down/u);
});

void test("209 shortcut diagnostics accept only their fixed code/stage/counters and preserve current RPC prototype guards", async () => {
  const failed = environment([row()], { generation209: true, afterRead: "throw new Error('PRIVATE_VENDOR_ERROR');" });
  const raw: unknown = decodeExactReadEnvelope(await failed.run()); assert.ok(raw !== null && typeof raw === "object");
  for (const change of [{ code: "PRIVATE_VENDOR_ERROR" }, { stage: "PRIVATE_OWNER" }, { sample: 3 }, { publicCallsAttempted: -1 },
    { sample: 0, publicCallsAttempted: 1 }, { cleanupFailed: undefined }, { cleanupFailed: "false" }, { cleanupFailed: 0 },
    { partialResultsReturned: true }, { includeSystem: true }, { keyboardExecutionAuthorized: true },
    { message: "PRIVATE" }, { shortcuts: [] }]) {
    assert.throws(() => validateShortcutKeys209Result(request, { ...raw, ...change }));
  }
  // API e7c31b0d: xae extends p4; rpcCall belongs to p4.prototype. This
  // Source-shaped inert fixture proves the third-node path was already valid.
  const thirdPrototype = "const base={rpcCall:Bus.prototype.rpcCall};delete Bus.prototype.rpcCall;Object.setPrototypeOf(Bus.prototype,base);";
  const valid = environment([row()], { generation209: true, before: thirdPrototype });
  const validPayload = decodeExactReadEnvelope(await valid.run());
  assert.equal(validateShortcutKeys209Result(request, validPayload)["ok"], true);
  const changed = environment([row()], { generation209: true, before: thirdPrototype, afterRead: "base.rpcCall=async()=>rows;" });
  const changedPayload = decodeExactReadEnvelope(await changed.run());
  assert.equal(validateShortcutKeys209Result(request, changedPayload)["stage"], "rpc-owner");
  assert.equal(changed.evaluate("calls"), 1);
  const tooDeep = environment([row()], { generation209: true,
    before: `${thirdPrototype}Object.setPrototypeOf(Bus.prototype,{});Object.setPrototypeOf(Object.getPrototypeOf(Bus.prototype),base);` });
  const deepPayload = decodeExactReadEnvelope(await tooDeep.run());
  assert.equal(validateShortcutKeys209Result(request, deepPayload)["stage"], "rpc-method");
  assert.equal(tooDeep.evaluate("calls"), 0);
});
