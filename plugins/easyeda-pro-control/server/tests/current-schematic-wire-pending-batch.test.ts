/** Three original CM publications feed one original publisher batch. Browser
 * timer registration and worker transport are explicitly inert fixture sinks. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { Worker } from "node:worker_threads";
import { CURRENT_SCHEMATIC_WIRE_PENDING_BATCH_SOURCE as SOURCE } from "../src/current-schematic-wire-pending-batch-source.ts";
import { decodeCurrentSchematicWireCmPublicationFunction as cmMetadata } from "../src/current-schematic-wire-cm-publication-source.ts";
import { requireCurrentSchematicRelevancePublicationCalleeDescription as description, decodeCurrentSchematicRelevancePublicationCalleeFunction as metadata } from "../src/current-schematic-relevance-publication-callee-replies.ts";
import { wirePendingBatchFixture } from "./helpers/current-schematic-wire-pending-batch-fixture.ts";
import { INSTALLED_EASYEDA_SOURCE_SKIP_REASON, readConfiguredEasyedaAsset } from "./helpers/installed-easyeda-source.ts";

function object(value: unknown): object { assert.ok(value !== null && typeof value === "object"); return value; }
for (const [variant, mode] of [[0, "complete"], [1, "complete"], [0, "wrong-body"], [0, "wrong-type"], [0, "replacement-promise"], [0, "foreign-publisher"], [0, "early-publish"]] as const) {
  void test(`Wire original pending batch variant ${  String(variant)  } / ${  mode}`, { timeout: 25_000 }, async context => {
    const source = await readConfiguredEasyedaAsset(SOURCE[variant].relativePath); if (source === null) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; }
    const key = `__wirePendingBatch${  String(variant)  }${mode.replaceAll("-", "_")}`; const url = `${key  }.js`; let scriptId = ""; const session = new Session(); session.connect(); await session.post("Debugger.enable");
    session.on("Debugger.scriptParsed", event => { if (event.params.url === url) { scriptId = event.params.scriptId; } });
    const graph = object(runInThisContext(`${wirePendingBatchFixture(source, variant, mode)  }\n//# sourceURL=${  url}`)); Object.defineProperty(globalThis, key, { value: graph, configurable: true }); assert.ok(scriptId.length > 0);
    for (const role of ["cachePendData", "publishPendData", "localChange"] as const) { const fn = await session.post("Runtime.evaluate", { expression: `globalThis.${  key  }.publisher.${  role}` }); assert.ok(fn.result.objectId !== undefined && typeof fn.result.description === "string"); description(fn.result.description, variant, role); metadata(await session.post("Runtime.getProperties", { objectId: fn.result.objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false }), variant, role, scriptId); }
    const cm = await session.post("Runtime.evaluate", { expression: `globalThis.${  key  }.cm.publishChange` }); assert.ok(cm.result.objectId !== undefined); cmMetadata(await session.post("Runtime.getProperties", { objectId: cm.result.objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false }), cm.result, variant, scriptId);
    const bus = await session.post("Runtime.evaluate", { expression: `globalThis.${  key  }.dataBus.publish` }); assert.ok(bus.result.objectId !== undefined); const busMetadata = await session.post("Runtime.getProperties", { objectId: bus.result.objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false }); const dataBusSite: unknown = busMetadata.internalProperties?.find(row => row.name === "[[FunctionLocation]]")?.value?.value;
    session.disconnect(); const expected: unknown = Reflect.get(graph, "expected"); const done = Promise.withResolvers<unknown>(); const worker = new Worker(new URL("helpers/current-schematic-wire-pending-batch-worker.ts", import.meta.url), { workerData: { key, scriptId, variant, expected, dataBusSite } }); context.after(async () => { Reflect.deleteProperty(globalThis, key); await worker.terminate(); }); worker.on("error", done.reject);
    worker.on("message", (value: unknown) => { const message = object(value); if ("ready" in message) { const drive: unknown = Reflect.get(graph, "drive"); assert.ok(typeof drive === "function"); Reflect.apply(drive, graph, []); } else { done.resolve(value); } });
    const result = object(await done.promise);
    if (mode === "complete") { assert.ok(!("error" in result), JSON.stringify(result)); assert.equal(Reflect.get(result, "pauses"), 6); assert.equal(Reflect.get(result, "resumes"), 6); assert.equal(Reflect.get(result, "helpers"), 17); assert.equal(Reflect.get(result, "cleanup"), 1); assert.equal(Reflect.get(result, "settled"), true); assert.equal(Reflect.get(result, "sameResolver"), true); assert.equal(Reflect.get(result, "workerPublicationJoined"), false); assert.equal(Reflect.get(result, "saveAuthorized"), false); assert.deepEqual(Reflect.get(result, "stages"), [28, 30, 31, 37, 7, 3, 2]); assert.equal(Reflect.get(result, "reads"), 138); context.diagnostic(JSON.stringify(result)); const counts = object(Reflect.get(graph, "counts")); const pubs: unknown = Reflect.get(counts, "publications"); assert.ok(Array.isArray(pubs)); assert.deepEqual(pubs.map((row: unknown) => { assert.ok(Array.isArray(row)); const type: unknown = row[3]; assert.ok(typeof type === "string"); return type; }), ["WIRE", "LINE", "ATTR"]); assert.equal(Reflect.get(counts, "timers"), 1); const batches: unknown = Reflect.get(counts, "batches"); assert.ok(Array.isArray(batches)); assert.equal(batches.length, 1); }
    else { assert.ok("error" in result, "unsafe batch completed"); let expectedError = /SCH209_WIRE_PENDING_BATCH/u; if (mode === "early-publish") { expectedError = /SCHEMATIC_WIRE_PENDING_BATCH_PAYLOAD_PAUSE/u; } else if (mode === "foreign-publisher") { expectedError = /SCH209_WIRE_CM_PUBLICATION/u; } assert.match(String(Reflect.get(result, "error")), expectedError); }
  });
}
