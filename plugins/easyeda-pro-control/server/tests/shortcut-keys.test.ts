import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { decodeExactReadEnvelope } from "../src/exact-readers.ts";
import { SHORTCUT_KEYS_METHOD, buildShortcutKeys209Program, buildShortcutKeysProgram, parseShortcutKeysRequest, queryShortcutKeys,
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
    { before: "rows[0].documentType=[15];" },
    { afterRead: "globalThis.PRO_EDITOR_MODE='CLIENT-OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM';" },
    { afterRead: "globalThis.UI={gVars:globalThis.gVars};" },
  ]) {
    const rejected = environment(rows, { ...options, generation209: true });
    await assert.rejects(rejected.run(), { message: "SHORTCUT_KEYS_READ_FAILED" }); assert.equal(rejected.evaluate("calls"), 1);
  }
});
