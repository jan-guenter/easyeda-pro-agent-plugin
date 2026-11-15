/** Actual original completion metadata and callback receiver entries in an
 * inert graph; this is neither connected history nor bbox completion proof. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { Worker } from "node:worker_threads";
import { CURRENT_SCHEMATIC_WIRE_COMPLETION_SOURCE as SOURCE } from "../src/current-schematic-wire-completion-source.ts";
import { CURRENT_SCHEMATIC_WIRE_FRONTIER_REQUESTS as LIMIT, CURRENT_SCHEMATIC_WIRE_FRONTIER_PROGRAMS as PROGRAMS, currentSchematicWireFrontierCases, currentSchematicWireFrontierTemplate, validateCurrentSchematicWireFrontierCommand as validate } from "../src/current-schematic-wire-frontier-protocol.ts";
import { CurrentSchematicWireFrontierMetadataCursor } from "../src/current-schematic-wire-frontier-cursor.ts";
import { wireFrontierFixture } from "./helpers/current-schematic-wire-frontier-fixture.ts";
import { INSTALLED_EASYEDA_SOURCE_SKIP_REASON, readConfiguredEasyedaAsset } from "./helpers/installed-easyeda-source.ts";

for (const variant of [0, 1] as const) {
  void test(`original history/bbox callback variant ${String(variant)} binds twelve functions and seven actual receivers`, { timeout: 30_000 }, async context => {
    const source = await readConfiguredEasyedaAsset(SOURCE[variant].relativePath); if (source === null) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; }
    const observer = new Session(); observer.connect(); await observer.post("Debugger.enable"); const url = `wireFrontierOriginal${String(variant)}.js`; let scriptId = "";
    observer.on("Debugger.scriptParsed", event => { if (event.params.url === url) { scriptId = event.params.scriptId; } });
    const graph: unknown = runInThisContext(`${wireFrontierFixture(source, variant)}\n//# sourceURL=${url}`); observer.disconnect();
    assert.ok(graph !== null && typeof graph === "object" && scriptId.length > 0); const key = `__wireFrontier${String(variant)}`;
    Object.defineProperty(globalThis, key, { value: graph, configurable: true }); const done = Promise.withResolvers<unknown>();
    const worker = new Worker(new URL("helpers/current-schematic-wire-frontier-worker.ts", import.meta.url), { workerData: { key, scriptId, variant } });
    context.after(async () => { Reflect.deleteProperty(globalThis, key); await worker.terminate(); }); worker.on("error", done.reject);
    worker.on("message", (value: unknown) => { if (value !== null && typeof value === "object" && "ready" in value) { const fn: unknown = Reflect.get(graph, "drive"); assert.ok(typeof fn === "function"); Reflect.apply(fn, graph, []); } else { done.resolve(value); } });
    const result = await done.promise; assert.ok(result !== null && typeof result === "object" && !("error" in result), JSON.stringify(result));
    assert.equal(Reflect.get(result, "metadataReads"), 37); assert.equal(Reflect.get(result, "reads"), 37 + LIMIT.entries); assert.equal(Reflect.get(result, "pauses"), 7); assert.equal(Reflect.get(result, "resumed"), 7); assert.equal(Reflect.get(result, "helpers"), LIMIT.helperSourcesMaximum);
    assert.deepEqual(Reflect.get(graph, "counts"), { historyClear: 1, dispose: 1, updated: 1 });
  });
}
void test("frontier vocabulary rejects resumes, caller code, copied commands and malformed evidence", () => {
  for (const command of currentSchematicWireFrontierCases()) { assert.deepEqual(validate(command), command); assert.ok(currentSchematicWireFrontierTemplate(command).template.length > 0); assert.throws(() => validate({ ...command, params: { ...command.params, callerCode: "value" } })); }
  assert.throws(() => validate({ phase: "wire-frontier-resume", method: "Debugger.resume", params: {} }));
  const cursor = new CurrentSchematicWireFrontierMetadataCursor("holder.123", "native", "script", 0);
  const command = cursor.next(); assert.ok(command !== null); assert.throws(() => { cursor.reserve(structuredClone(command)); }); cursor.reserve(command);
  assert.throws(() => { cursor.accept(command, { result: { type: "object", subtype: "proxy", objectId: "foreign" } }); }); assert.throws(() => cursor.next()); assert.throws(() => cursor.requireCompleted());
});

void test("frontier entry refuses replaced monitors before traversing a foreign Proxy and preserves receiver shape ownership", () => {
  const shapes = {}; const bbox = { shapeManager: shapes, _modelTypesShouldUpdateBBox: new Set(["Wire"]) }; const history = { shapeManager: shapes }; const net = { shapeManager: shapes };
  Object.assign(shapes, { bboxMonitor: bbox, historyRecorder: history, netPointManager: net });
  const line = { shapeManager: shapes }; const group = { shapeManager: shapes }; const before = { line, wire: group }; const runner = { _currentAction: { history: "add", status: "willDidRun" } };
  const b = { shapes, line, group, runner, consistency: {} }; const state = { owner: null as unknown, before, failed: false, modifyAttempted: true, modifyAcknowledged: false, saveAttempted: false }; const holder = [b, state]; state.owner = holder;
  const roots = [bbox, history, net, {}, {}, {}, {}, {}];
  // oxlint-disable-next-line typescript/unbound-method -- Keep the actual unbound intrinsics in their original native19 slots; fixed helpers invoke them with explicit receivers.
  const native = [Object.getOwnPropertyDescriptor, Object.getOwnPropertyDescriptors, Object.getPrototypeOf, Object.is, Object.hasOwn, Reflect.ownKeys, Reflect.apply, Array.isArray, Map.prototype.get, Map.prototype.has, Map.prototype.forEach, Object.getOwnPropertyDescriptor(Map.prototype, "size")?.get, Set.prototype.has, Set.prototype.forEach, Object.getOwnPropertyDescriptor(Set.prototype, "size")?.get, Object.prototype, Array.prototype, Map.prototype, Set.prototype];
  const historyProof: unknown = runInThisContext(`(${PROGRAMS.historyEnd})`); const netProof: unknown = runInThisContext(`(${PROGRAMS.netPointUpdate})`); assert.ok(typeof historyProof === "function" && typeof netProof === "function");
  assert.equal(Reflect.apply(historyProof, [history], [native, holder, roots]), true);
  history.shapeManager = {};
  assert.throws(() => Reflect.apply(historyProof, [history], [native, holder, roots]), /WIRE_FRONTIER/u);
  history.shapeManager = shapes;
  const replacement = { shapeManager: shapes }; Reflect.set(shapes, "historyRecorder", replacement);
  assert.throws(() => Reflect.apply(historyProof, [replacement], [native, holder, roots]), /WIRE_FRONTIER/u);
  Reflect.set(shapes, "historyRecorder", history);
  let traps = 0;
  const foreign = new Proxy({}, { getOwnPropertyDescriptor(): never { traps += 1; throw new Error("foreign trap"); } });
  Reflect.set(shapes, "bboxMonitor", foreign);
  assert.throws(() => Reflect.apply(netProof, [net, Reflect.get(bbox, "_modelTypesShouldUpdateBBox")], [native, holder, roots]), /WIRE_FRONTIER/u);
  assert.equal(traps, 0);
});
