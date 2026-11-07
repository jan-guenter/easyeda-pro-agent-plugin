/** Actual uninvoked pinned functions in an inert VM. No model, original
 * renderer, actor, receiver, mutation or saved result is established. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_SCHEMATIC_RELEVANCE_MODEL_CALLEE_ROLES as ROLES, CURRENT_SCHEMATIC_RELEVANCE_MODEL_CALLEE_SOURCE as SOURCE, qualifyCurrentSchematicRelevanceModelCalleeSource } from "../src/current-schematic-relevance-model-callee-source.ts";
import type { CurrentSchematicRelevanceModelCalleeRole } from "../src/current-schematic-relevance-model-callee-source.ts";
import { decodeCurrentSchematicRelevanceModelCalleeFunction, requireCurrentSchematicRelevanceModelCalleeDescription } from "../src/current-schematic-relevance-model-callee-replies.ts";

function inertFunction(source: string, variant: 0 | 1, role: CurrentSchematicRelevanceModelCalleeRole): unknown {
  const row = SOURCE[variant].roles[role]; const text = source.slice(row.start, row.end);
  const padding = source.slice(0, row.start).replaceAll(/[^\n]/gu, " "); const context = createContext({});
  if (row.kind === "arrow") { return runInContext(`${padding.slice(0, -1)}(${text})`, context) as unknown; }
  const ctor: unknown = runInContext(`${padding.slice(0, -7)}(class{${text}})`, context);
  assert.ok(typeof ctor === "function"); const prototype: unknown = Reflect.get(ctor, "prototype"); assert.ok(prototype !== null && typeof prototype === "object");
  // oxlint-disable-next-line typescript/unbound-method -- Inspector must receive the exact uninvoked getter; binding it would replace its identity.
  const getter: unknown = Object.getOwnPropertyDescriptor(prototype, row.name.slice(4))?.get; assert.ok(typeof getter === "function"); return getter;
}
void test("actual Node24 metadata binds every uninvoked Text getter and active monitor in both exact sources", async context => {
  let sources: readonly string[];
  try { sources = await Promise.all(SOURCE.map(row => readFile(`/mnt/c/Program Files/EasyEDA-Pro/resources/app/assets/${row.relativePath}`, "utf8"))); }
  catch (error) { if (error !== null && typeof error === "object" && "code" in error && error.code === "ENOENT") { context.skip("installed source unavailable"); return; } throw error; }
  assert.equal(process.versions.node, "24.18.0"); const session = new Session(); session.connect(); const key = "__inertSchematicModelCallee";
  try {
    for (const variant of [0, 1] as const) {
      const source = sources[variant]; assert.ok(typeof source === "string"); assert.equal(qualifyCurrentSchematicRelevanceModelCalleeSource(source), variant);
      for (const role of ROLES) {
        Object.defineProperty(globalThis, key, { value: inertFunction(source, variant, role), configurable: true });
        const value = await session.post("Runtime.evaluate", { expression: `globalThis[${JSON.stringify(key)}]`, objectGroup: "inert-schematic-model-callee" });
        const id = value.result.objectId; assert.ok(typeof id === "string");
        requireCurrentSchematicRelevanceModelCalleeDescription(value.result.description ?? "", variant, role);
        const packet = await session.post("Runtime.getProperties", { objectId: id, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
        const location: unknown = packet.internalProperties?.find(row => row.name === "[[FunctionLocation]]")?.value?.value;
        assert.ok(location !== null && typeof location === "object" && "scriptId" in location && typeof location.scriptId === "string");
        const scriptId = location.scriptId;
        const decoded = decodeCurrentSchematicRelevanceModelCalleeFunction(packet, variant, role, scriptId);
        assert.equal(decoded.originalModelVerified, false); assert.equal(decoded.callbackReceiverVerified, false); assert.equal(decoded.continuationAuthorized, false);
        assert.equal(typeof decoded.scopes, "string"); assert.equal(typeof decoded.functionPrototype, "string");
        assert.throws(() => { requireCurrentSchematicRelevanceModelCalleeDescription(`${value.result.description ?? ""} `, variant, role); });
        assert.throws(() => decodeCurrentSchematicRelevanceModelCalleeFunction(packet, variant, role, "foreign-script"));
        assert.throws(() => decodeCurrentSchematicRelevanceModelCalleeFunction({ ...packet, internalProperties: packet.internalProperties?.map(row => row.name === "[[FunctionLocation]]" ? { ...row, value: { ...row.value, value: { ...location, columnNumber: SOURCE[variant].roles[role].columnNumber + 1 } } } : row) }, variant, role, scriptId));
        assert.throws(() => decodeCurrentSchematicRelevanceModelCalleeFunction({ ...packet, result: [packet.result[0], packet.result[0]] }, variant, role, scriptId));
      }
    }
  } finally { Reflect.deleteProperty(globalThis, key); await session.post("Runtime.releaseObjectGroup", { objectGroup: "inert-schematic-model-callee" }); session.disconnect(); }
});
void test("model callee qualification refuses foreign or malformed source and keeps metadata getters uncalled", () => {
  assert.throws(() => qualifyCurrentSchematicRelevanceModelCalleeSource("foreign source"));
  assert.throws(() => qualifyCurrentSchematicRelevanceModelCalleeSource("\uD800"));
  let invoked = 0; const input = Object.defineProperty({}, "result", { enumerable: true, get() { invoked += 1; return []; } });
  assert.throws(() => decodeCurrentSchematicRelevanceModelCalleeFunction(input, 0, "parentGet", "script")); assert.equal(invoked, 0);
});
