/** Real original GROUP command and two held history callbacks, using inert
 * model/getter/event/upload data. This grants no live history or Save proof. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { Script, runInThisContext } from "node:vm";
import { Worker } from "node:worker_threads";
import { CURRENT_SCHEMATIC_WIRE_GROUP_HISTORY_REQUESTS as LIMIT, currentSchematicWireGroupHistoryCases, currentSchematicWireGroupHistoryTemplate, validateCurrentSchematicWireGroupHistoryCommand as validate } from "../src/current-schematic-wire-group-history-protocol.ts";
import { CURRENT_SCHEMATIC_WIRE_GROUP_HISTORY_PROGRAMS as PROGRAMS } from "../src/current-schematic-wire-group-history-programs.ts";
import { CurrentSchematicWireGroupHistoryCursor } from "../src/current-schematic-wire-group-history-cursor.ts";
import { WIRE_GROUP_SOURCE as SOURCE, qualifyWireGroupFunction, wireGroupHistoryFixture } from "./helpers/current-schematic-wire-group-history-fixture.ts";
import { INSTALLED_EASYEDA_SOURCE_SKIP_REASON, readConfiguredEasyedaAsset } from "./helpers/installed-easyeda-source.ts";

function obj(value: unknown): object { assert.ok(value !== null && typeof value === "object"); return value; }

for (const variant of [0, 1] as const) {
  void test(`original GROUP history variant ${String(variant)} compares complete old/new children before its three uploads`, { timeout: 30_000 }, async context => {
    const source = await readConfiguredEasyedaAsset(SOURCE[variant].relativePath); if (source === null) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; }
    const session = new Session(); session.connect(); await session.post("Debugger.enable"); const url = `wireGroupHistoryOriginal${String(variant)}.js`; let scriptId = "";
    session.on("Debugger.scriptParsed", event => { if (event.params.url === url) { scriptId = event.params.scriptId; } });
    const graph: unknown = runInThisContext(`${wireGroupHistoryFixture(source, variant)}\n//# sourceURL=${url}`); assert.ok(graph !== null && typeof graph === "object" && scriptId.length > 0);
    const key = `__wireGroupHistory${String(variant)}`; Object.defineProperty(globalThis, key, { value: graph, configurable: true });
    for (const [field, role] of [["uploadWatch", "uploaderWatch"], ["modelHandler", "handleModelCommand"], ["groupUpload", "groupUpload"]] as const) {
      const actual = await session.post("Runtime.evaluate", { expression: `globalThis.${key}.${field}`, returnByValue: false }); assert.ok(actual.result.objectId !== undefined);
      const metadata = await session.post("Runtime.getProperties", { objectId: actual.result.objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false }); qualifyWireGroupFunction(metadata, actual.result, variant, scriptId, role);
    }
    session.disconnect();
    const done = Promise.withResolvers<unknown>(), worker = new Worker(new URL("helpers/current-schematic-wire-group-history-worker.ts", import.meta.url), { workerData: { key, scriptId, variant } });
    context.after(async () => { Reflect.deleteProperty(globalThis, key); await worker.terminate(); }); worker.on("error", done.reject);
    worker.on("message", (value: unknown) => { if (value !== null && typeof value === "object" && "ready" in value) { const drive: unknown = Reflect.get(graph, "drive"); assert.ok(typeof drive === "function"); Reflect.apply(drive, graph, []); } else { done.resolve(value); } });
    const result = await done.promise; assert.ok(result !== null && typeof result === "object" && !("error" in result), JSON.stringify(result));
    assert.deepEqual(Reflect.get(result, "stageReads"), [LIMIT.before, LIMIT.after]); assert.equal(Reflect.get(result, "reads"), LIMIT.normal); assert.equal(Reflect.get(result, "helpers"), LIMIT.helperSources); assert.equal(Reflect.get(result, "pauses"), 2); assert.equal(Reflect.get(result, "resumed"), 2);
    assert.deepEqual(Reflect.get(graph, "counts"), { publications: ["WIRE", "LINE", "ATTR"], historyClear: 1, dispose: 1 });
    const history: unknown = Reflect.get(graph, "history"); assert.ok(history !== null && typeof history === "object"); assert.equal(Reflect.get(history, "batchSaveStack"), null);
  });
}
void test("GROUP history vocabulary consumes failures and rejects caller programs, navigation, resumes and copied rows", () => {
  for (const command of currentSchematicWireGroupHistoryCases()) { assert.deepEqual(validate(command), command); assert.ok(currentSchematicWireGroupHistoryTemplate(command).template.length > 0); assert.throws(() => validate({ ...command, params: { ...command.params, callerCode: "value" } })); }
  assert.throws(() => validate({ phase: "wire-group-history-resume", method: "Debugger.resume", params: {} }));
  const input = { role: "before", frame: "1.2.3", holder: "holder", native: "native", frontier: "frontier", setter: "setter", groupConstructor: "group", scriptId: "script", variant: 0 } as const;
  const cursor = new CurrentSchematicWireGroupHistoryCursor(input); Reflect.set(input, "frame", "foreign");
  const command = cursor.next(); assert.ok(command !== null && command.phase === "wire-group-history-frame"); assert.equal(command.params.callFrameId, "1.2.3"); assert.throws(() => { cursor.reserve(structuredClone(command)); }); cursor.reserve(command);
  assert.throws(() => { cursor.accept(command, { result: { type: "object", subtype: "proxy", objectId: "foreign" } }); }); assert.throws(() => cursor.next()); assert.throws(() => cursor.requireCompleted());
});


void test("GROUP completion refuses changed old data, opaque peer references, cloned point coordinates, extra commands and action replacement before publication", { timeout: 30_000 }, async context => {
  const source = await readConfiguredEasyedaAsset(SOURCE[0].relativePath); if (source === null) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; }
  const fixture = new Script(wireGroupHistoryFixture(source, 0)); const functions = new Map<string, unknown>();
  for (const [role, program] of Object.entries(PROGRAMS)) { const fn: unknown = runInThisContext(`(${program})`); assert.ok(typeof fn === "function"); functions.set(role, fn); }
  for (const kind of ["old-data", "peer-data", "line-point", "extra-command", "action"]) {
    const graph: unknown = fixture.runInThisContext(); const g = obj(graph); const holder: unknown = Reflect.get(g, "holder"); const native: unknown = Reflect.get(g, "native"); const frontier: unknown = Reflect.get(g, "frontier"); const history = obj(Reflect.get(g, "history"));
    const invoke = (role: string, receiver: unknown, refs: readonly unknown[]): unknown => { const fn = functions.get(role); assert.ok(typeof fn === "function"); return Reflect.apply(fn, receiver, refs); };
    const module = invoke("module", holder, [native, Reflect.get(g, "groupConstructor"), Reflect.get(g, "setter")]);
    const roots = invoke("beforeRoots", [history], [native, holder, frontier]);
    const collect = (after: boolean, activeRoots: unknown): readonly unknown[] => {
      const collections = invoke("collections", activeRoots, [native, holder]); const payload = invoke("data", collections, [native, module]); const details = invoke(after ? "afterDetails" : "beforeDetails", payload, [native]); const records = invoke(after ? "afterRecords" : "beforeRecords", details, [native, holder]); const attributes = invoke(after ? "afterAttributes" : "beforeAttributes", records, [native]); const points = invoke(after ? "afterPoints" : "beforePoints", attributes, [native]); const coordinates = invoke(after ? "afterCoordinates" : "beforeCoordinates", points, [native]);
      return [native, holder, module, activeRoots, collections, payload, details, records, attributes, points, coordinates];
    };
    const snapshot = invoke("snapshot", holder, collect(false, roots));
    const bus = obj(Reflect.get(history, "_onDidRecord"));
    Reflect.set(bus, "dispatch", (stack: unknown): void => {
      const tamper: unknown = Reflect.get(g, "tamper"); assert.ok(typeof tamper === "function"); Reflect.apply(tamper, g, [kind]);
      const activeRoots = invoke("afterRoots", [stack], [native, holder, frontier, snapshot]); invoke("completed", holder, [...collect(true, activeRoots), snapshot]);
      assert.fail("unsafe completion reached the publication body");
    });
    const drive: unknown = Reflect.get(g, "drive"); assert.ok(typeof drive === "function"); assert.throws(() => Reflect.apply(drive, g, []), /WIRE_GROUP_HISTORY/u);
    const counts = obj(Reflect.get(g, "counts")); assert.deepEqual(Reflect.get(counts, "publications"), []);
  }
});
