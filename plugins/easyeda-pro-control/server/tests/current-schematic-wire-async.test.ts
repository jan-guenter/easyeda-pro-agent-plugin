/** Real installed Pc/Dc and tree/caller functions run with inert project,
 * tree and scheduling sinks. No app, Modify or Save is executed. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { Worker } from "node:worker_threads";
import { CURRENT_SCHEMATIC_WIRE_ASYNC_ROLES as ROLES, CURRENT_SCHEMATIC_WIRE_ASYNC_SOURCE as SOURCE, decodeCurrentSchematicWireAsyncFunction as qualify } from "../src/current-schematic-wire-async-source.ts";
import { CURRENT_SCHEMATIC_WIRE_ASYNC_REQUESTS as LIMIT } from "../src/current-schematic-wire-async-protocol.ts";
import { wireAsyncFixture, wireAsyncMetadataFixture } from "./helpers/current-schematic-wire-async-fixture.ts";
import { INSTALLED_EASYEDA_SOURCE_SKIP_REASON, readConfiguredEasyedaAsset } from "./helpers/installed-easyeda-source.ts";

function obj(value: unknown): object { assert.ok(value !== null && typeof value === "object"); return value; }
function invoke(graph: object, field: string): unknown { const fn: unknown = Reflect.get(graph, field); assert.ok(typeof fn === "function"); return Reflect.apply(fn, graph, []); }
for (const variant of [0, 1] as const) {
  void test(`Wire async variant ${String(variant)} qualifies all twelve complete original functions`, { timeout: 30_000 }, async context => {
    const source = await readConfiguredEasyedaAsset(SOURCE[variant].relativePath); if (source === null) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; }
    const session = new Session(); session.connect(); await session.post("Debugger.enable"); context.after(() => { session.disconnect(); }); let expectedUrl = ""; let currentScript = ""; session.on("Debugger.scriptParsed", event => { if (event.params.url === expectedUrl) { currentScript = event.params.scriptId; } });
    for (const role of ROLES) {
      const selected = role; const url = `wireAsyncMetadata${String(variant)}${role}.js`; expectedUrl = url; currentScript = "";
      const actual: unknown = runInThisContext(`${wireAsyncMetadataFixture(source, variant, selected)}\n//# sourceURL=${url}`); assert.ok(typeof actual === "function" && currentScript.length > 0); const key = `__wireAsyncMetadata${String(variant)}`;
      Object.defineProperty(globalThis, key, { value: actual, configurable: true });
      try { const value = await session.post("Runtime.evaluate", { expression: `globalThis.${key}` }); assert.ok(value.result.objectId !== undefined); const metadata = await session.post("Runtime.getProperties", { objectId: value.result.objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false }); qualify(metadata, value.result, variant, selected, currentScript); }
      finally { Reflect.deleteProperty(globalThis, key); }
    }
  });
}
for (const [variant, mode, treeRole, deferred] of [[0, "complete", "objectContent", true], [1, "complete", "objectContent", true], [0, "exhaust", "objectContent", true], [0, "coalesced", "objectContent", true], [0, "complete", "pageContent", false], [1, "complete", "pageContent", false], [0, "complete", "netContent", false], [1, "complete", "symbolContent", false], [1, "complete", "symbolContent", true]] as const) {
  const dirty = deferred || treeRole !== "symbolContent";
  void test(`Wire original async child variant ${String(variant)} / ${mode} / ${treeRole} / ${deferred ? "deferred" : "synchronous"} retains fresh call, caller and Promise`, { timeout: 30_000 }, async context => {
    const source = await readConfiguredEasyedaAsset(SOURCE[variant].relativePath); if (source === null) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; }
    const session = new Session(); session.connect(); await session.post("Debugger.enable"); const key = `__wireAsync${String(variant)}${mode}${treeRole}${String(deferred)}`; let scriptId = ""; const url = `wireAsync${String(variant)}${mode}${treeRole}${String(deferred)}.js`;
    session.on("Debugger.scriptParsed", event => { if (event.params.url === url) { scriptId = event.params.scriptId; } });
    const graph: unknown = runInThisContext(`${wireAsyncFixture(source, variant, treeRole, dirty)}\n//# sourceURL=${url}`); const g = obj(graph); const counts = obj(Reflect.get(g, "counts")); const state = obj(Reflect.get(g, "state")); assert.ok(scriptId.length > 0); Object.defineProperty(globalThis, key, { value: graph, configurable: true }); session.disconnect();
    const done = Promise.withResolvers<unknown>(); const worker = new Worker(new URL("helpers/current-schematic-wire-async-worker.ts", import.meta.url), { workerData: { key, scriptId, variant, mode, treeRole, deferred } });
    context.after(async () => { invoke(g, "resolve"); Reflect.deleteProperty(globalThis, key); await worker.terminate(); }); worker.on("error", done.reject);
    worker.on("message", (value: unknown) => {
      const message = obj(value);
      if ("ready" in message) { invoke(g, "drive"); }
      else if ("childPending" in message) { setImmediate(() => { try { assert.equal(Reflect.get(counts, "parent"), 1); assert.equal(Reflect.get(state, "modifyAcknowledged"), true); if (mode === "coalesced") { invoke(g, "queue"); } worker.postMessage({ settle: true }, []); } catch (error) { done.reject(error); } }); }
      else if ("pendingAfterParent" in message) { invoke(g, "resolve"); setImmediate(() => { worker.postMessage({ released: true }, []); }); }
      else { done.resolve(value); }
    });
    const result = obj(await done.promise); assert.equal(Reflect.get(result, "pauses"), 3, JSON.stringify(result)); assert.equal(Reflect.get(result, "resumed"), 3, JSON.stringify(result));
    if (mode === "complete") { assert.ok(!("error" in result), JSON.stringify(result)); assert.deepEqual(Reflect.get(result, "stageReads"), [LIMIT.entry, LIMIT.target, LIMIT.continuation, deferred ? 7 : 6]); assert.equal(Reflect.get(result, "helpers"), LIMIT.helperSources); assert.equal(Reflect.get(counts, "fills"), dirty ? 1 : 0); }
    else { assert.equal(Reflect.get(result, "reads"), mode === "exhaust" ? LIMIT.entry + LIMIT.target + LIMIT.continuation + LIMIT.promisePollsMaximum - 1 : 29); assert.ok("error" in result, "unsafe async completion passed"); assert.match(String(Reflect.get(result, "error")), mode === "exhaust" ? /SCHEMATIC_WIRE_ASYNC_CURSOR/u : /SCH209_WIRE_ASYNC/u); }
  });
}
