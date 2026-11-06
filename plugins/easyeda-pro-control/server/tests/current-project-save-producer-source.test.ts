/** Execute only pinned method bodies on inert objects. No original worker,
 * runtime, application, cache backend or continuation authority is created. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { Session } from "node:inspector/promises";
import { types } from "node:util";
import { runInNewContext } from "node:vm";
import { CURRENT_PROJECT_SAVE_PRODUCER_METHODS as METHODS, CURRENT_PROJECT_SAVE_PRODUCER_SITES as SITES,
  CURRENT_PROJECT_SAVE_PRODUCER_METHOD_SOURCE as SOURCE, qualifyCurrentProjectSaveProducerSource } from "../src/current-project-save-producer-source.ts";

class BodyResponse { public readonly body: string; public constructor(body: string) { this.body = body; } }

function original(name: keyof typeof SOURCE, globals: Record<string, unknown> = {}): (target: object, ...args: unknown[]) => unknown {
  const fn: unknown = runInNewContext(`({${SOURCE[name]}})[${JSON.stringify(name === "headPut" ? "put" : name)}]`, {
    Map, Set, Promise, console: { time: (): undefined => undefined, timeEnd: (): undefined => undefined, error: (): undefined => undefined }, ...globals
  });
  assert.ok(typeof fn === "function"); return (target, ...args): unknown => Reflect.apply(fn, target, args);
}
async function turns(): Promise<void> { for (let index = 0; index < 12; index += 1) { await Promise.resolve(); } }
function promised(value: unknown): Promise<unknown> { assert.ok(types.isPromise(value)); return Promise.resolve(value); }

void test("fixed method text, coordinates and frame arity are sealed without claiming a continuation", () => {
  const sources: Readonly<Record<string, string>> = SOURCE;
  for (const [name, pin] of Object.entries(METHODS)) {
    const source = sources[name]; assert.ok(source !== undefined); assert.equal(Buffer.byteLength(source), pin.bytes);
    assert.equal(createHash("sha256").update(source).digest("hex"), pin.sha256); assert.equal(pin.end - pin.start, source.length);
  }
  assert.equal(Object.keys(SITES).length, 27);
  for (const site of Object.values(SITES)) { const names = site.expression.match(/[a-z]+/gu) ?? []; const frame: unknown = runInNewContext(`(${site.expression})`, Object.fromEntries(names.map(name => [name, undefined])));
    assert.ok(Array.isArray(frame)); assert.equal(frame.length, site.length); assert.equal(Object.hasOwn(site, "resume"), false); }
  assert.throws(() => { qualifyCurrentProjectSaveProducerSource("method text without the complete original script"); }, /PRODUCER_SOURCE/u);
});

void test("actual uploadCloud returns before its detached cache Promise and sync task settle", async () => {
  const cache = Promise.withResolvers<true>(), history = Promise.withResolvers<{ success: true; result: string }>(), sync = Promise.withResolvers<true>();
  const calls: unknown[] = [], deleted: unknown[] = [], task1 = new Set<Promise<true>>();
  const target = { isV2Format: false, isTemporary: false, uuid: "original-project", branchUuid: "original-branch",
    bufferUploadData: new Map([["upload/original", "original-body"]]), bufferUploadCache: new Map(), task1,
    localCache: { put: (...args: unknown[]): Promise<true> => { calls.push(args); return cache.promise; }, delete: (key: unknown): Promise<true> => { deleted.push(key); return Promise.resolve(true); } },
    syncCloud: (): Promise<true> => sync.promise, publishUploadPending: (): undefined => undefined };
  const invoke = original("uploadCloud", { Ie: "\n", Re: { getInstance: (): unknown => ({ projectHistory: { set: (args: unknown): Promise<{ success: true; result: string }> => { calls.push(args); return history.promise; } } }) },
    cg: (value: string): string => value, Response: BodyResponse });
  const pending = promised(invoke(target)); await turns(); assert.equal(calls.length, 1); assert.equal(target.bufferUploadData.size, 0);
  history.resolve({ success: true, result: "actual-history-head" }); assert.equal(JSON.stringify(await pending), JSON.stringify({ success: true }));
  assert.equal(calls.length, 2); assert.equal(deleted.length, 0); assert.equal(task1.has(sync.promise), true);
  cache.resolve(true); await turns(); assert.deepEqual(deleted, ["upload/original"]); assert.equal(task1.has(sync.promise), true);
  sync.resolve(true); await turns(); assert.equal(task1.size, 0);
});

void test("actual buffered callback owns its resolver and task until the original upload Promise settles", async () => {
  const task1 = new Set<unknown>(), uploaded = Promise.withResolvers<true>(); const timers: (() => Promise<void>)[] = []; let uploadCalls = 0;
  const target = { task1, bufferUploadData: new Map() };
  const buffered: unknown = original("bufferedStream", { setTimeout: (callback: () => Promise<void>, delay: number): number => { assert.equal(delay, 500); timers.push(callback); return 1; }, clearTimeout: (): never => assert.fail("unexpected timer replacement") })(target, (): Promise<true> => { uploadCalls += 1; return uploaded.promise; }, 500);
  assert.ok(typeof buffered === "function"); Reflect.apply(buffered, undefined, [{ dataUrl: "original-upload-url", dataStr: "original-body" }]);
  assert.equal(task1.size, 1); assert.equal(uploadCalls, 0); assert.equal(target.bufferUploadData.get("original-upload-url"), "original-body");
  const timer = timers[0]; assert.ok(timer !== undefined); const originalTimer = timer(); await turns(); assert.equal(uploadCalls, 1); assert.equal(task1.size, 1);
  uploaded.resolve(true); await originalTimer; assert.equal(task1.size, 0);
});

void test("actual head-cache wrapper retains the original native put Promise and retries on its failure branch", async () => {
  const native = Promise.withResolvers<true>(), retry = Promise.withResolvers<true>(); let puts = 0, retries = 0;
  const target = { cache: { put: (): Promise<true> => { puts += 1; return puts === 1 ? native.promise : Promise.resolve(true); } } };
  const invoke = original("headPut", { nu: (value: string): string => value, tu: (delay: number): Promise<true> => { assert.equal(delay, 100); retries += 1; return retry.promise; } });
  let settled = false; const pending = promised(invoke(target, "branch-index", { clone: (): object => ({}) }, true));
  const observed = (async (): Promise<void> => { await pending; settled = true; })(); await turns(); assert.equal(settled, false); assert.equal(puts, 1);
  native.reject(new Error("original native put failed")); await turns(); assert.equal(retries, 1); assert.equal(puts, 1); assert.equal(settled, false);
  retry.resolve(true); await observed; assert.equal(puts, 2); assert.equal(settled, true);
});

void test("actual local upload reaches the buffered producer only after its original cache Promise", async () => {
  const buffered: unknown[] = [], cache = Promise.withResolvers<true>();
  const target = { branchUuid: "original-branch", localCache: { put: (): Promise<true> => cache.promise },
    consistencyManager: { parseFull: (): never => assert.fail("Save passes the already-compressed body") },
    bufferedUploadCloud: (input: unknown): void => { buffered.push(input); }, publishUploadPending: (): undefined => undefined };
  const invoke = original("uploadLocal", { Ie: "\n", cg: (value: string): string => value, Qe: (): string => "original-cache-nonce",
    Response: BodyResponse });
  const pending = promised(invoke(target, ["original-body"], false, "original-unique-id")); await turns(); assert.equal(buffered.length, 0);
  cache.resolve(true); assert.equal(JSON.stringify(await pending), JSON.stringify({ success: true }));
  assert.equal(JSON.stringify(buffered), JSON.stringify([{ dataStr: "original-body", dataUrl: "upload/original-branch?key=original-cache-nonce" }]));
});

void test("actual syncCloud may finish all registered tasks before its dropped head-index cache write", async () => {
  const cachePromise = new Set(), head = Promise.withResolvers<true>(), task3 = new Set(), writes: unknown[] = [];
  const next = { uuid: "new-head", num: 0 }, previous = { uuid: "previous-head", num: 0 };
  const target = { uuid: "original-project", branchUuid: "original-branch", historyIndex: [previous], task3, cachePromise,
    isReadOnly: (): false => false, notSyncCloud: false, isUploadingCloud: false, pendingSyncCloud: false, isApplyShot: false,
    syncPendingNodeUuids: new Set(), confirmedEmptyNodeUuids: new Set(), warnedEmptyNodeUuids: new Set(),
    getHistories: (): Promise<unknown> => Promise.resolve({ success: true, result: [next, previous] }), loadLastSnap: (): Promise<true> => Promise.resolve(true),
    ensureNodesLoaded: (): Promise<true> => Promise.resolve(true), cache: { put: (...args: unknown[]): Promise<true> => { writes.push(args); return head.promise; } } };
  const invoke = original("syncCloud", { hd: (value: unknown): unknown => value, du: (): Promise<true> => Promise.resolve(true), yt: { ContentType: "Content-Type" }, gt: { Json: "application/json" },
    ou: (value: string): string => `index/${value}`, Response: BodyResponse });
  await promised(invoke(target, "new-head")); assert.equal(writes.length, 1); assert.equal(task3.size, 0); assert.equal(cachePromise.size, 0);
  assert.equal(target.notSyncCloud, false); assert.equal(target.historyIndex[0]?.uuid, "new-head"); head.resolve(true); await head.promise;
});

void test("every fixed producer point is an actual V8 break location in the pinned method syntax", async () => {
  const session = new Session(); session.connect();
  try {
    await session.post("Runtime.enable"); await session.post("Debugger.enable"); const sources: Readonly<Record<string, string>> = SOURCE;
    for (const [name, pin] of Object.entries(METHODS)) {
      const method = sources[name]; assert.ok(method !== undefined);
      const compiled = await session.post("Runtime.compileScript", { expression: `({${method}})`, sourceURL: `fixed-producer-${name}.js`, persistScript: true });
      assert.ok(compiled.scriptId !== undefined && compiled.exceptionDetails === undefined);
      const actual = await session.post("Debugger.getPossibleBreakpoints", { start: { scriptId: compiled.scriptId, lineNumber: 0, columnNumber: 0 } });
      for (const [role, site] of Object.entries(SITES)) {
        if (site.offset >= pin.start && site.offset < pin.end) { const columnNumber = site.offset - pin.start + 2;
          assert.ok(actual.locations.some(value => value.lineNumber === 0 && value.columnNumber === columnNumber), `${name}/${role} must stop at its actual source statement`); }
      }
    }
  } finally { session.disconnect(); }
});
