/* oxlint-disable import/max-dependencies -- Independent source qualification, actual held entries, strict grammar and finite cursor identities are checked together. */
/** Local original-source Inspector checks plus finite command refusal. These
 * are source evidence, with explicit stand-in roots, never connected proof. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { Worker } from "node:worker_threads";
import { CurrentSchematicWireSetterCursor, CurrentSchematicWireTransitionMetadataCursor } from "../src/current-schematic-wire-transition-cursor.ts";
import { CURRENT_SCHEMATIC_WIRE_TRANSITION_REQUESTS as LIMIT, currentSchematicWireTransitionCases, currentSchematicWireTransitionTemplate, validateCurrentSchematicWireTransitionCommand as validate } from "../src/current-schematic-wire-transition-protocol.ts";
import { CURRENT_SCHEMATIC_WIRE_TRANSITION_ROLES as ROLES, CURRENT_SCHEMATIC_WIRE_TRANSITION_SOURCE as SOURCE, qualifyCurrentSchematicWireTransitionSource as fullSource, decodeCurrentSchematicWireTransitionFunction as qualify } from "../src/current-schematic-wire-transition-source.ts";
import { INSTALLED_EASYEDA_SOURCE_SKIP_REASON, readConfiguredEasyedaAsset } from "./helpers/installed-easyeda-source.ts";
import { wireTransitionFixture } from "./helpers/current-schematic-wire-transition-fixture.ts";
import { WIRE_TRANSITION_GRAPH as GRAPH } from "./helpers/current-schematic-wire-transition-graph.ts";

async function post(session:Session,method:string,params:unknown):Promise<unknown>{const pending:unknown=Reflect.apply(session.post.bind(session),session,[method,params]);return await pending;}
for (const variant of [0, 1] as const) {
  void test(`qualified original Wire variant ${  String(variant)  } binds all22 functions and finite metadata on real Inspector`, { timeout: 20_000 }, async context => {
    const source = await readConfiguredEasyedaAsset(SOURCE[variant].relativePath); if (source === null) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; }
    assert.equal(fullSource({ scriptSource: source }), variant); assert.throws(() => fullSource({ scriptSource: `${source  } ` }));
    const session = new Session(); session.connect();
    const url = `wireTransitionMetadata${  String(variant)  }.js`; let scriptId = "";
    try {
      await session.post("Debugger.enable"); session.on("Debugger.scriptParsed", event => { if (event.params.url === url) { scriptId = event.params.scriptId; } });
      const fx = await session.post("Runtime.evaluate", { expression: `${wireTransitionFixture(source, variant)  }\n//# sourceURL=${  url}` }); assert.equal(fx.exceptionDetails, undefined); assert.ok(fx.result.objectId !== undefined && scriptId.length > 0);const qualifiedScript=scriptId;
      const graph = await session.post("Runtime.callFunctionOn", { objectId: fx.result.objectId, functionDeclaration: GRAPH, returnByValue: false }); assert.equal(graph.exceptionDetails, undefined); assert.ok(graph.result.objectId !== undefined);
      const metadata = await session.post("Runtime.getProperties", { objectId: fx.result.objectId, ownProperties: true });
      for (const role of ROLES) {
        const remote = metadata.result.find(row => row.name === role)?.value; assert.ok(remote?.objectId !== undefined);
        const raw = await session.post("Runtime.getProperties", { objectId: remote.objectId, ownProperties: true });
        assert.equal(qualify(raw, remote, variant, role, qualifiedScript).objectId, remote.objectId);
        assert.throws(() => qualify(raw, remote, variant, role, "foreign_script"));
        assert.throws(() => qualify(raw, { ...remote, description: `${String(remote.description)  } ` }, variant, role, qualifiedScript));
      }
      const roots = await session.post("Runtime.getProperties", { objectId: graph.result.objectId, ownProperties: true });
      const holder = roots.result.find(row => row.name === "holder")?.value?.objectId, native = roots.result.find(row => row.name === "native")?.value?.objectId; assert.ok(holder !== undefined && native !== undefined);
      const cursor = new CurrentSchematicWireTransitionMetadataCursor(holder, native, scriptId, variant); let reads = 0;
      for (let command = cursor.next(); command !== null; command = cursor.next()) {
        assert.equal(cursor.next(), command); assert.throws(() =>{  cursor.reserve(structuredClone(command)); }); cursor.reserve(command);
        const raw: unknown = await post(session,command.method, command.params); cursor.accept(command, raw); reads += 1;
      }
      assert.ok(reads <= LIMIT.metadataMaximum); assert.equal(reads, 39); assert.equal(cursor.retainedReplies().length, reads);
      const data = cursor.requireCompleted(); assert.equal(Object.keys(data.functions).length, 22); assert.equal(data.executionAuthorized, false); assert.equal(data.historyComplete, false); assert.equal(data.bboxFrontierComplete, false);
    } finally { session.disconnect(); }
  });
  void test(`original points setter variant ${  String(variant)  } joins actual held record operands before AST/view/bbox/history`, { timeout: 20_000 }, async context => {
    const source = await readConfiguredEasyedaAsset(SOURCE[variant].relativePath); if (source === null) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; }
    const key = `__wireTransitionHeld${  String(variant)}`, url = `${key  }.js`; const observer = new Session(); observer.connect(); await observer.post("Debugger.enable"); let scriptId = "";
    observer.on("Debugger.scriptParsed", event => { if (event.params.url === url) { scriptId = event.params.scriptId; } });
    const refs: unknown = runInThisContext(`${wireTransitionFixture(source, variant)  }\n//# sourceURL=${  url}`); observer.disconnect(); assert.ok(refs !== null && typeof refs === "object" && scriptId.length > 0);
    const setup: unknown = runInThisContext(`(${  GRAPH  })`); assert.ok(typeof setup === "function");
    const graph: unknown = Reflect.apply(setup, refs, []); assert.ok(graph !== null && typeof graph === "object");
    const shapes: unknown = Reflect.get(graph, "shapes");const monitor: unknown = Reflect.get(graph, "monitor");const counts: unknown = Reflect.get(graph, "counts");
    assert.ok(shapes !== null && typeof shapes === "object" && monitor !== null && typeof monitor === "object" && counts !== null && typeof counts === "object");
    for (const role of ["view", "bbox", "attr", "history"] as const) {
      let target: unknown = monitor; if (role !== "view") { const fields={bbox:"bboxMonitor",attr:"attrWatcher",history:"historyRecorder"}; target=Reflect.get(shapes,fields[role]); } assert.ok(target !== null && typeof target === "object");
      Object.defineProperty(target, "onModelAttributeChange", { value: () => { const n: unknown = Reflect.get(counts, role); assert.ok(typeof n === "number"); Reflect.set(counts, role, n + 1); }, writable: true, enumerable: true, configurable: true });
    }
    Object.defineProperty(globalThis, key, { value: graph, configurable: true }); const done = Promise.withResolvers<unknown>();
    const worker = new Worker(new URL("helpers/current-schematic-wire-transition-worker.ts", import.meta.url), { workerData: { key, scriptId, variant } });
    context.after(async () => { Reflect.deleteProperty(globalThis, key); await worker.terminate(); }); worker.on("error", done.reject);
    worker.on("message", (value: unknown) => { if (value !== null && typeof value === "object" && "ready" in value) { const setter: unknown = Reflect.get(refs, "pointsSet"); assert.ok(typeof setter === "function"); Reflect.apply(setter, Reflect.get(graph, "line"), [Reflect.get(graph, "points")]); } else { done.resolve(value); } });
    const result = await done.promise; assert.ok(result !== null && typeof result === "object" && "data" in result, JSON.stringify(result)); assert.equal(Reflect.get(result, "reads"), 12); assert.equal(Reflect.get(result, "pauses"), 2); assert.equal(Reflect.get(result, "resumed"), 2);
    assert.deepEqual(counts, { view: 1, bbox: 1, attr: 1, history: 1 }); assert.equal(Reflect.get(shapes, "shouldUpdateAst"), true);
  });
}
void test("transition grammar rejects caller code/resume and cursor rejects initial null, copied command and malformed replies", () => {
  for (const command of currentSchematicWireTransitionCases()) { assert.deepEqual(validate(command), command); assert.ok(currentSchematicWireTransitionTemplate(command).template.length > 0); assert.throws(() => validate({ ...command, params: { ...command.params, callerCode: "value" } })); if (command.method === "Runtime.callFunctionOn") { assert.throws(() => validate({ ...command, params: { ...command.params, functionDeclaration: "function(){}" } })); } }
  assert.throws(() => validate({ phase: "wire-transition-resume", method: "Debugger.resume", params: {} }));
  const cursor = new CurrentSchematicWireSetterCursor("frame.123", "holder", "native", "first", "second"); const reserve: unknown = Reflect.get(cursor, "reserve"); assert.ok(typeof reserve === "function"); assert.throws(() => Reflect.apply(reserve, cursor, [null]));
  const first = cursor.next(); assert.ok(first !== null); assert.throws(() =>{  cursor.reserve(structuredClone(first)); }); cursor.reserve(first); assert.throws(() =>{  cursor.accept(first, { result: { type: "object", subtype: "proxy", objectId: "forged" } }); }); assert.throws(() => cursor.next()); assert.throws(() => cursor.requireCompleted());
});
