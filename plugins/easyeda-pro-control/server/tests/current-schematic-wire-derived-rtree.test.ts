/** Actual original spatial code on inert model/bbox/marker ownership. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { CURRENT_SCHEMATIC_WIRE_DERIVED_RTREE_SOURCE as SOURCE } from "../src/current-schematic-wire-derived-rtree-source.ts";
import { CurrentSchematicWireDerivedRtreeCursor } from "../src/current-schematic-wire-derived-rtree-cursor.ts";
import type { CurrentSchematicWireDerivedRtreeCommand } from "../src/current-schematic-wire-derived-rtree-protocol.ts";
import type { CurrentSchematicWireDerivedRtreeData } from "../src/current-schematic-wire-derived-rtree-cursor.ts";
import { currentSchematicWireDerivedRtreeCases, currentSchematicWireDerivedRtreeTemplate, validateCurrentSchematicWireDerivedRtreeCommand as validate } from "../src/current-schematic-wire-derived-rtree-protocol.ts";
import { wireDerivedRtreeFixture } from "./helpers/current-schematic-wire-derived-rtree-fixture.ts";
import { INSTALLED_EASYEDA_SOURCE_SKIP_REASON, readConfiguredEasyedaAsset } from "./helpers/installed-easyeda-source.ts";

function object(value: unknown): object { assert.ok(value !== null && typeof value === "object"); return value; }
async function drive(session: Session, cursor: CurrentSchematicWireDerivedRtreeCursor, beforeSend?: (command: CurrentSchematicWireDerivedRtreeCommand) => void): Promise<{ data: CurrentSchematicWireDerivedRtreeData; reads: number }> {
  let reads = 0;
  for (;;) { const command = cursor.next(); if (command === null) { break; } cursor.reserve(command); beforeSend?.(command);
    const pending: unknown = Reflect.apply(session.post.bind(session), session, [command.method, command.params]); const reply: unknown = await pending;
    reads += 1; cursor.accept(command, reply);
  }
  return { data: cursor.requireCompleted(), reads };
}
for (const [variant, mode] of [[0, "complete"], [1, "complete"], [0, "same-bytes-peer"], [0, "merged"], [0, "stale-index"], [0, "swapped-leaf"], [0, "proxy-race"]] as const) {
  void test(`Wire actual derived/rTree variant ${String(variant)} / ${mode}`, async context => {
    const source = await readConfiguredEasyedaAsset(SOURCE[variant].relativePath); if (source === null) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; }
    const graph = object(runInThisContext(wireDerivedRtreeFixture(source, variant))); const key = `__wireDerived${String(variant)}${mode.replaceAll("-", "_")}`; Object.defineProperty(globalThis, key, { value: graph, configurable: true });
    const session = new Session(); session.connect(); context.after(async () => { await session.post("Runtime.releaseObjectGroup", { objectGroup: "easyeda-pro-control-schematic-wire-derived-rtree-v1" }); session.disconnect(); Reflect.deleteProperty(globalThis, key); });
    const refs: string[] = [];
    for (const name of ["holder", "native"]) { const result = await session.post("Runtime.evaluate", { expression: `globalThis.${key}.${name}` }); assert.ok(result.result.objectId !== undefined); refs.push(result.result.objectId); }
    const holder = refs[0]; const native = refs[1]; assert.ok(holder !== undefined && native !== undefined);
    const before = await drive(session, new CurrentSchematicWireDerivedRtreeCursor({ stage: "before", holder, native })); assert.equal(before.data.mutationAuthorized, false); assert.equal(before.data.lifecycleComplete, false);
    const change: unknown = Reflect.get(graph, "drive"); assert.ok(typeof change === "function"); Reflect.apply(change, graph, [mode === "merged" ? .25 : 100]);
    if (mode === "same-bytes-peer") { const index = object(Reflect.get(graph, "index")); const map: unknown = Reflect.get(index, "_idBBoxMap"); assert.ok(map instanceof Map); const old = object(map.get("text")); map.set("text", { ...old }); }
    if (mode === "stale-index") { const index = object(Reflect.get(graph, "index")); const map: unknown = Reflect.get(index, "_idBBoxMap"); assert.ok(map instanceof Map); const node = object(map.get("line")); Reflect.set(node, "maxX", 1); }
    if (mode === "swapped-leaf") { const index = object(Reflect.get(graph, "index")); const bush = object(Reflect.get(index, "_rbush")); const root = object(Reflect.get(bush, "data")); Reflect.set(root, "leaf", false); }
    assert.throws(() => new CurrentSchematicWireDerivedRtreeCursor({ stage: "after", previous: structuredClone(before.data) }));
    const after = new CurrentSchematicWireDerivedRtreeCursor({ stage: "after", previous: before.data }); let traps = 0;
    const race = (command: CurrentSchematicWireDerivedRtreeCommand): void => { if (mode !== "proxy-race" || command.phase !== "wire-derived-rtree-call" || command.role !== "after") { return; } const index = object(Reflect.get(graph, "index")); const map: unknown = Reflect.get(index, "_idBBoxMap"); assert.ok(map instanceof Map); const node = object(map.get("line")); Reflect.set(node, "bbox", new Proxy({}, { getOwnPropertyDescriptor(): never { traps += 1; throw new Error("proxy descriptor trap"); }, getPrototypeOf(): never { traps += 1; throw new Error("proxy prototype trap"); }, ownKeys(): never { traps += 1; throw new Error("proxy keys trap"); } })); };
    if (mode === "complete") { const result = await drive(session, after); assert.equal(result.data.unaffectedIndexNodesCompared, true); assert.equal(result.data.saveAuthorized, false); assert.equal(result.reads, 102); assert.equal(before.reads, 97); context.diagnostic(`metadata/call reads before=${  String(before.reads)  } after=${  String(result.reads)}`); assert.throws(() => new CurrentSchematicWireDerivedRtreeCursor({ stage: "after", previous: before.data })); }
    else { await assert.rejects(drive(session, after, race)); assert.equal(traps, 0); assert.throws(() => after.requireCompleted()); }
  });
}
void test("Wire derived commands retain a closed vocabulary and exact reservations", () => {
  for (const row of currentSchematicWireDerivedRtreeCases()) { assert.deepEqual(validate(row), row); assert.ok(currentSchematicWireDerivedRtreeTemplate(row).template.length > 0); assert.throws(() => validate({ ...row, params: { ...row.params, callerCode: "value" } })); }
  assert.throws(() => validate({ phase: "wire-derived-rtree-resume", method: "Debugger.resume", params: {} }));
  const cursor = new CurrentSchematicWireDerivedRtreeCursor({ stage: "before", holder: "123.1.2", native: "123.2.3" }); const command = cursor.next(); assert.ok(command !== null); assert.throws(() =>{  cursor.reserve(structuredClone(command)); }); cursor.reserve(command); assert.throws(() =>{  cursor.accept(command, {}); }); assert.throws(() => cursor.next());
});
