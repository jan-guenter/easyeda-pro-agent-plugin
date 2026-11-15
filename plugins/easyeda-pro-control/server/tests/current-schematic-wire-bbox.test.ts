/** Real scheduled bbox code with explicit inert model/event/rTree sinks. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { Worker } from "node:worker_threads";
import { CURRENT_SCHEMATIC_WIRE_TRANSITION_SOURCE as SOURCE, decodeCurrentSchematicWireTransitionFunction as qualify } from "../src/current-schematic-wire-transition-source.ts";
import { currentSchematicWireBboxCases, currentSchematicWireBboxTemplate, validateCurrentSchematicWireBboxCommand as validate } from "../src/current-schematic-wire-bbox-protocol.ts";
import { CurrentSchematicWireBboxCursor } from "../src/current-schematic-wire-bbox-cursor.ts";
import { wireBboxFixture } from "./helpers/current-schematic-wire-bbox-fixture.ts";
import { INSTALLED_EASYEDA_SOURCE_SKIP_REASON, readConfiguredEasyedaAsset } from "./helpers/installed-easyeda-source.ts";

function obj(value: unknown): object { assert.ok(value !== null && typeof value === "object"); return value; }
async function driveGraph(graph: object, reject: (reason?: unknown) => void): Promise<void> {
  try { const drive: unknown = Reflect.get(graph, "drive"); assert.ok(typeof drive === "function"); const pending: unknown = Reflect.apply(drive, graph, []); assert.ok(pending instanceof Promise); await pending; }
  catch (error) { reject(error); }
}
for (const [variant, mode] of [[0, "complete"], [1, "complete"], [0, "pending-change"], [0, "callback-error"], [0, "reused-promise"]] as const) {
  void test(`Wire bbox variant ${String(variant)} / ${mode} retains the two original callback Promises`, { timeout: 25_000 }, async context => {
    const source = await readConfiguredEasyedaAsset(SOURCE[variant].relativePath); if (source === null) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; }
    const key = `__wireBbox${String(variant)}${mode.replaceAll("-", "_")}`; const url = `wireBbox${String(variant)}${mode}.js`; let scriptId = ""; const session = new Session(); session.connect(); await session.post("Debugger.enable");
    session.on("Debugger.scriptParsed", event => { if (event.params.url === url) { scriptId = event.params.scriptId; } });
    const graph = obj(runInThisContext(`${wireBboxFixture(source, variant, mode)}\n//# sourceURL=${url}`)); assert.ok(scriptId.length > 0); Object.defineProperty(globalThis, key, { value: graph, configurable: true });
    for (const [field, role] of [["bbox.add", "bboxAdd"], ["bbox.update", "bboxUpdate"], ["bbox._addCoreMethods.forCommon", "bboxCommon"], ["bbox._addCoreMethods.forUpdating", "bboxUpdating"]] as const) { const actual = await session.post("Runtime.evaluate", { expression: `globalThis.${key}.${field}` }); assert.ok(actual.result.objectId !== undefined); const packet = await session.post("Runtime.getProperties", { objectId: actual.result.objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false }); qualify(packet, actual.result, variant, role, scriptId); }
    session.disconnect(); const done = Promise.withResolvers<unknown>(); const worker = new Worker(new URL("helpers/current-schematic-wire-bbox-worker.ts", import.meta.url), { workerData: { key, scriptId, variant } }); context.after(async () => { Reflect.deleteProperty(globalThis, key); await worker.terminate(); }); worker.on("error", done.reject);
    worker.on("message", (value: unknown) => { const message = obj(value); if ("ready" in message) { void driveGraph(graph, done.reject); } else { done.resolve(value); } });
    const result = obj(await done.promise);
    if (mode === "complete") { assert.ok(!("error" in result), JSON.stringify(result)); assert.deepEqual(Reflect.get(result, "stageReads"), [14, 4, 2, 12, 4, 2]); assert.equal(Reflect.get(result, "reads"), 38); assert.equal(Reflect.get(result, "pauses"), 4); assert.equal(Reflect.get(result, "resumed"), 4); assert.equal(Reflect.get(result, "helpers"), 6); assert.deepEqual(Reflect.get(graph, "counts"), { async: 2, updated: 1, afterAll: 1, modelBBox: 4, rTreeClear: 1, warnings: 0 }); }
    else { assert.ok("error" in result, "unsafe bbox lifecycle completed"); assert.match(String(Reflect.get(result, "error")), mode === "callback-error" ? /original bbox caught failure/u : /SCH209_WIRE_BBOX/u); }
  });
}
void test("Wire bbox commands reject caller programs, resumes, copied reservations and malformed replies", () => {
  for (const command of currentSchematicWireBboxCases()) { assert.deepEqual(validate(command), command); assert.ok(currentSchematicWireBboxTemplate(command).template.length > 0); assert.throws(() => validate({ ...command, params: { ...command.params, callerCode: "value" } })); }
  assert.throws(() => validate({ phase: "wire-bbox-resume", method: "Debugger.resume", params: {} })); const input = { role: "entry", tick: 1, frame: "1.2.3", holder: "holder", native: "native", action: "action" } as const; const cursor = new CurrentSchematicWireBboxCursor(input); Reflect.set(input, "frame", "foreign"); const command = cursor.next(); assert.ok(command !== null && command.phase === "wire-bbox-frame"); assert.equal(command.params.callFrameId, "1.2.3"); assert.throws(() => { cursor.reserve(structuredClone(command)); }); cursor.reserve(command); assert.throws(() => { cursor.accept(command, { result: { type: "object", subtype: "proxy", objectId: "foreign" } }); }); assert.throws(() => cursor.next()); assert.throws(() => cursor.requireCompleted());
});
