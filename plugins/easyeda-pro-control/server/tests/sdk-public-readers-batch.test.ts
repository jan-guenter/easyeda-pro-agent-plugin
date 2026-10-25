import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { isRecord } from "../src/core.ts";
import { decodeExactReadEnvelope } from "../src/exact-readers.ts";
import { buildSdkPublicReadersBatchProgram, validateSdkPublicReadersBatchResult } from "../src/sdk-public-readers-batch.ts";
import {
  SDK_PUBLIC_READERS_209_LANGUAGES, SDK_PUBLIC_READERS_209_SYSTEM_LIBRARY_UUID, SDK_PUBLIC_READERS_BATCH_MAX_BYTES,
  SDK_PUBLIC_READERS_MAX_BYTES, sdkPublicReadersBatchRequestSchema, sdkPublicReadersOperationSchema,
} from "../src/sdk-public-readers.ts";
import type { SdkPublicReadersBatchRequest, SdkPublicReadersRequest } from "../src/sdk-public-readers.ts";

const entries = [
  { namespace: "sys_I18n", name: "getAllSupportedLanguages", value: [...SDK_PUBLIC_READERS_209_LANGUAGES], ui: false },
  { namespace: "sys_I18n", name: "isLanguageSupported", value: false, ui: false },
  { namespace: "sys_I18n", name: "getCurrentLanguage", value: "de", ui: true },
  { namespace: "sys_Window", name: "getViewportSize", value: { width: 1920, height: 1080 }, ui: false },
  { namespace: "sys_Window", name: "getCurrentTheme", value: "dark", ui: true },
  { namespace: "sys_Unit", name: "getFrontendDataUnit", value: "mil", ui: true },
  { namespace: "lib_LibrariesList", name: "getSystemLibraryUuid", value: SDK_PUBLIC_READERS_209_SYSTEM_LIBRARY_UUID, ui: true },
] as const;
type Entry = typeof entries[number];
const batch = (selected: readonly Entry[] = entries): SdkPublicReadersBatchRequest => sdkPublicReadersBatchRequestSchema.parse({ action: "batch",
  requests: selected.map((entry) => ({ method: `eda.${entry.namespace}.${entry.name}`, arguments: entry.name === "isLanguageSupported" ? { language: "EN" } : {} })) });

function fixture(response: (entry: Entry, call: number) => unknown = (entry) => entry.value): {
  evaluate: (code: string) => unknown; run: (request?: SdkPublicReadersBatchRequest) => Promise<unknown>;
  calls: string[]; timers: () => { scheduled: number; cleared: number };
} {
  const calls: string[] = [], counts = new Map<string, number>();
  let cleared = 0, deadline: (() => void) | undefined, elapsed = 0, scheduled = 0;
  const eda: Record<string, unknown> = { extensionUuid: "7e06d286b1ac846ef7eab9c7f2a9ee40" };
  for (const entry of entries) {
    const owner = eda[entry.namespace] ?? {}; assert.ok(isRecord(owner)); eda[entry.namespace] = owner;
    owner[entry.name] = function read(this: unknown, ...args: unknown[]): unknown {
      assert.equal(this, owner); assert.deepEqual(args, entry.name === "isLanguageSupported" ? ["EN"] : []);
      calls.push(entry.name); const call = (counts.get(entry.name) ?? 0) + 1; counts.set(entry.name, call);
      const value = response(entry, call); return entry.ui ? Promise.resolve(value) : value;
    };
  }
  const context = createContext({ TextEncoder, eda, performance: { now: (): number => elapsed },
    advanceClock: (amount: number): void => { elapsed += amount; }, expire: (): void => { deadline?.(); },
    // Retain the one browser timer to distinguish clock expiry from callback delivery.
    setTimeout: (callback: () => void, delay: number): number => { assert.equal(delay, 10_000); scheduled += 1; deadline = callback; return 1; },
    clearTimeout: (timer: number): void => { assert.equal(timer, 1); cleared += 1; } });
  const evaluate = (code: string): unknown => runInContext(code, context, { timeout: 1000 }) as unknown;
  evaluate(`window=globalThis;self=globalThis;top=globalThis;frameElement=null;getterCalls=0;
    location={origin:'https://client',href:'https://client/editor?cll=error'};
    document={defaultView:globalThis,nodeType:9,URL:location.href};
    PRO_EDITOR_MODE='CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM';
    _MSG_BUS2_EXTAPI_={rpcCall(){throw new Error('NO_DIRECT_RPC');}};
    _MSG_BUS_={rpcCall(){throw new Error('NO_DIRECT_LEGACY_RPC');}};
    gVars={extensionApiMessageBus2:_MSG_BUS2_EXTAPI_,messageBus:_MSG_BUS_};UI={gVars};`);
  return { evaluate, calls, timers: () => ({ scheduled, cleared }),
    run: (request = batch()) => Promise.resolve(evaluate(`(async()=>{${buildSdkPublicReadersBatchProgram(request)}})()`)) };
}

void test("batch schemas admit only distinct bounded members and retain the old single shape", () => {
  const valid = batch();
  const first = valid.requests[0]; assert.ok(first);
  assert.deepEqual(sdkPublicReadersOperationSchema.parse(first), first);
  assert.deepEqual(sdkPublicReadersOperationSchema.parse(valid), valid);
  for (const invalid of [
    { action: "batch", requests: [] }, { ...valid, requests: [...valid.requests, first] },
    { action: "batch", requests: [first, first] }, { action: "batch", requests: [valid.requests[1], { method: "eda.sys_I18n.isLanguageSupported", arguments: { language: "en" } }] },
    { ...valid, timeoutMs: 20_000 }, { ...valid, code: "private()" }, { action: "batch", requests: [first, { method: "eda.sys_Window.open", arguments: {} }] },
    { action: "batch", requests: [{ ...first, hidden: true }] }, { action: "batch", requests: [{ ...first, arguments: { hidden: true } }] },
    { ...valid, method: first.method, arguments: {} }, { requests: [first] }, { action: "batch", requests: [null] },
  ]) {
    assert.equal(sdkPublicReadersOperationSchema.safeParse(invalid).success, false);
    assert.throws(() => buildSdkPublicReadersBatchProgram(invalid));
  }
});

void test("seven readers run as two complete ordered passes with one deadline and retained individual meanings", async () => {
  const observed = fixture(), raw = decodeExactReadEnvelope(await observed.run());
  const result = validateSdkPublicReadersBatchResult(batch(), raw);
  assert.deepEqual(observed.calls, [...entries, ...entries].map((entry) => entry.name));
  assert.deepEqual(observed.timers(), { scheduled: 1, cleared: 1 });
  assert.equal(result["atomicSnapshot"], false); assert.equal(result["sharedDeadlineMilliseconds"], 10_000);
  const results = result["results"]; assert.ok(Array.isArray(results) && results.every((member) => isRecord(member)));
  assert.deepEqual(results.map((member) => member["value"]), entries.map((entry) => entry.value));
  assert.equal(results[2]?.["fallbackPossible"], true); assert.equal(results[2]?.["providerSuccessVerified"], false);
  assert.equal(results[2]?.["cachedMessageBusIdentityVerified"], false);
  assert.ok(results.every((member) => Buffer.byteLength(JSON.stringify(member)) <= SDK_PUBLIC_READERS_MAX_BYTES));
  assert.ok(Buffer.byteLength(JSON.stringify(result)) <= SDK_PUBLIC_READERS_BATCH_MAX_BYTES);
});

void test("local-only batches need no UI bus and capture every method before dispatch", async () => {
  const local = batch(entries.filter((entry) => !entry.ui)), observed = fixture();
  observed.evaluate("delete UI;delete gVars;delete _MSG_BUS_;delete _MSG_BUS2_EXTAPI_");
  await observed.run(local); assert.equal(observed.calls.length, 6);
  const missing = fixture(); missing.evaluate("delete eda.lib_LibrariesList.getSystemLibraryUuid");
  await assert.rejects(missing.run(), { message: "SDK_PUBLIC_READERS_BATCH_READ_FAILED" });
  assert.deepEqual(missing.calls, []); assert.deepEqual(missing.timers(), { scheduled: 1, cleared: 1 });
});

void test("every await checks earlier and later member owners without adopting replacements or invoking accessors", async () => {
  const mutations = [
    "eda.sys_Unit.getFrontendDataUnit=async()=> 'mil'", "Object.setPrototypeOf(eda.sys_Unit,{})",
    "Object.defineProperty(eda.sys_Unit,'getFrontendDataUnit',{writable:false})",
    "const saved=eda.sys_Unit.getFrontendDataUnit;Object.defineProperty(eda.sys_Unit,'getFrontendDataUnit',{get(){getterCalls++;return saved;}})",
    "const saved=eda.sys_I18n.getAllSupportedLanguages;Object.defineProperty(eda.sys_I18n,'getAllSupportedLanguages',{get(){getterCalls++;return saved;}})",
    "_MSG_BUS2_EXTAPI_={..._MSG_BUS2_EXTAPI_}", "Object.defineProperty(gVars,'messageBus',{enumerable:false})",
    "document={...document}", "performance={...performance}", "performance.now=()=>0", "clearTimeout=()=>{}",
  ];
  for (const mutation of mutations) {
    const observed = fixture(async (entry) => { await Promise.resolve(); observed.evaluate(mutation); return entry.value; });
    const request = batch([entries[2], entries[0], entries[5]]);
    await assert.rejects(observed.run(request), { message: "SDK_PUBLIC_READERS_BATCH_READ_FAILED" });
    assert.deepEqual(observed.calls, ["getCurrentLanguage"]); assert.equal(observed.evaluate("getterCalls"), 0);
    assert.deepEqual(observed.timers(), { scheduled: 1, cleared: 1 });
  }
});

void test("one monotonic deadline covers all members, delayed timers and both passes", async () => {
  for (const expire of ["advanceClock(5000)", "expire()", "advanceClock(-1)"]) {
    const observed = fixture(async (entry) => {
      await Promise.resolve(); observed.evaluate(entry.name === "getCurrentLanguage" ? "advanceClock(6000)" : expire); return entry.value;
    });
    await assert.rejects(observed.run(batch([entries[2], entries[4], entries[5]])), { message: "SDK_PUBLIC_READERS_BATCH_READ_FAILED" });
    assert.deepEqual(observed.calls, ["getCurrentLanguage", "getCurrentTheme"]); assert.deepEqual(observed.timers(), { scheduled: 1, cleared: 1 });
  }
  const repeated = fixture(async (entry, call) => { await Promise.resolve(); repeated.evaluate(`advanceClock(${call === 1 ? 6000 : 4000})`); return entry.value; });
  await assert.rejects(repeated.run(batch([entries[2]])), { message: "SDK_PUBLIC_READERS_BATCH_READ_FAILED" });
  assert.deepEqual(repeated.calls, ["getCurrentLanguage", "getCurrentLanguage"]);
});

void test("invalid, asynchronous local and changed second-pass values refuse without dispatching later members", async () => {
  for (const replacement of [undefined, "x".repeat(9000), Promise.resolve("de")]) {
    const selected = replacement instanceof Promise ? [entries[0], entries[4]] : [entries[2], entries[4]];
    const observed = fixture(() => replacement);
    await assert.rejects(observed.run(batch(selected)), { message: "SDK_PUBLIC_READERS_BATCH_READ_FAILED" });
    assert.deepEqual(observed.calls, [selected[0]?.name]);
  }
  const changed = fixture((entry, call) => entry.name === "getCurrentTheme" && call === 2 ? "light" : entry.value);
  await assert.rejects(changed.run(batch([entries[4], entries[5]])), { message: "SDK_PUBLIC_READERS_BATCH_READ_FAILED" });
  assert.deepEqual(changed.calls, ["getCurrentTheme", "getFrontendDataUnit", "getCurrentTheme"]);
});

function rawMember(request: SdkPublicReadersRequest, value: unknown): Record<string, unknown> {
  return { ok: true, kind: "sdk-public-readers", method: request.method, value };
}
void test("transport validation rejects mixed membership, extra fields and both byte limits all-or-nothing", () => {
  const request = batch(), results = request.requests.map((member, index) => rawMember(member, entries[index]?.value));
  const payload = { ok: true, kind: "sdk-public-readers-batch", results, samplesMatched: true,
    observationOrder: "two-complete-ordered-passes", atomicSnapshot: false };
  assert.equal(validateSdkPublicReadersBatchResult(request, payload)["kind"], payload.kind);
  for (const invalid of [
    { ...payload, results: results.slice(1) }, { ...payload, results: results.toReversed() },
    { ...payload, results: [...results, results[0]] }, { ...payload, extra: true }, { ...payload, atomicSnapshot: true },
    { ...payload, results: [{ ...results[0], value: "x".repeat(SDK_PUBLIC_READERS_MAX_BYTES) }, ...results.slice(1)] },
    { ...payload, extra: "x".repeat(SDK_PUBLIC_READERS_BATCH_MAX_BYTES) },
    { ...payload, results: [{ ...results[0], hidden: true }, ...results.slice(1)] },
  ]) { assert.throws(() => validateSdkPublicReadersBatchResult(request, invalid)); }
});
