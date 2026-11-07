/** Uninvoked consistency functions. No original consistency, receiver, ticket,
 * command mutation or callback continuation is established. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_SCHEMATIC_RELEVANCE_CONSISTENCY_CALLEE_ROLES as ROLES, CURRENT_SCHEMATIC_RELEVANCE_CONSISTENCY_CALLEE_SOURCE as SOURCE, qualifyCurrentSchematicRelevanceConsistencyCalleeSource } from "../src/current-schematic-relevance-consistency-callee-source.ts";
import type { CurrentSchematicRelevanceConsistencyCalleeRole } from "../src/current-schematic-relevance-consistency-callee-source.ts";
import { decodeCurrentSchematicRelevanceConsistencyCalleeFunction, requireCurrentSchematicRelevanceConsistencyCalleeDescription } from "../src/current-schematic-relevance-consistency-callee-replies.ts";

function inertFunction(source: string, variant: 0 | 1, role: CurrentSchematicRelevanceConsistencyCalleeRole): unknown {
  const row = SOURCE[variant].roles[role]; const text = source.slice(row.start, row.end);
  const padding = source.slice(0, row.start).replaceAll(/[^\n]/gu, value => " ".repeat(value.length)); const context = createContext({});
  if (row.kind === "arrow") { return runInContext(`"use strict";${padding.slice(13, -1)}(${text})`, context) as unknown; }
  const ctor: unknown = runInContext(`${padding.slice(0, -7)}(class{${text}})`, context);
  assert.ok(typeof ctor === "function"); const prototype: unknown = Reflect.get(ctor, "prototype"); assert.ok(prototype !== null && typeof prototype === "object");
  const descriptor = Object.getOwnPropertyDescriptor(prototype, row.name);
  const fn: unknown = descriptor?.value; assert.ok(typeof fn === "function"); return fn;
}
void test("actual Node24 metadata binds consistency callbacks and Text echo methods in both pinned sources", async context => {
  let sources: readonly string[];
  try { sources = await Promise.all(SOURCE.map(row => readFile(`/mnt/c/Program Files/EasyEDA-Pro/resources/app/assets/${row.relativePath}`, "utf8"))); }
  catch (error) { if (error !== null && typeof error === "object" && "code" in error && error.code === "ENOENT") { context.skip("installed source unavailable"); return; } throw error; }
  assert.equal(process.versions.node, "24.18.0"); const session = new Session(); session.connect(); const key = "__inertSchematicConsistencyCallee";
  try {
    for (const variant of [0, 1] as const) {
      const source = sources[variant]; assert.ok(typeof source === "string"); assert.equal(qualifyCurrentSchematicRelevanceConsistencyCalleeSource(source), variant);
      for (const role of ROLES) {
        Object.defineProperty(globalThis, key, { value: inertFunction(source, variant, role), configurable: true });
        const value = await session.post("Runtime.evaluate", { expression: `globalThis[${JSON.stringify(key)}]`, objectGroup: "inert-schematic-consistency-callee" });
        const id = value.result.objectId; assert.ok(typeof id === "string");
        requireCurrentSchematicRelevanceConsistencyCalleeDescription(value.result.description ?? "", variant, role);
        const packet = await session.post("Runtime.getProperties", { objectId: id, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
        const location: unknown = packet.internalProperties?.find(row => row.name === "[[FunctionLocation]]")?.value?.value;
        assert.ok(location !== null && typeof location === "object" && "scriptId" in location && typeof location.scriptId === "string");
        const scriptId = location.scriptId;
        const decoded = decodeCurrentSchematicRelevanceConsistencyCalleeFunction(packet, variant, role, scriptId);
        assert.equal(decoded.originalConsistencyVerified, false); assert.equal(decoded.callbackReceiverVerified, false); assert.equal(decoded.continuationAuthorized, false);
        assert.equal(typeof decoded.scopes, "string"); assert.equal(typeof decoded.functionPrototype, "string");
        assert.throws(() => { requireCurrentSchematicRelevanceConsistencyCalleeDescription(`${value.result.description ?? ""} `, variant, role); });
        assert.throws(() => decodeCurrentSchematicRelevanceConsistencyCalleeFunction(packet, variant, role, "foreign-script"));
        assert.throws(() => decodeCurrentSchematicRelevanceConsistencyCalleeFunction({ ...packet, internalProperties: packet.internalProperties?.map(row => row.name === "[[FunctionLocation]]" ? { ...row, value: { ...row.value, value: { ...location, columnNumber: SOURCE[variant].roles[role].columnNumber + 1 } } } : row) }, variant, role, scriptId));
        assert.throws(() => decodeCurrentSchematicRelevanceConsistencyCalleeFunction({ ...packet, result: [packet.result[0], packet.result[0]] }, variant, role, scriptId));
      }
    }
  } finally { Reflect.deleteProperty(globalThis, key); await session.post("Runtime.releaseObjectGroup", { objectGroup: "inert-schematic-consistency-callee" }); session.disconnect(); }
});
void test("normal consistency metadata refuses foreign source and leaves reply getters uncalled", () => {
  assert.throws(() => qualifyCurrentSchematicRelevanceConsistencyCalleeSource("foreign source"));
  assert.throws(() => qualifyCurrentSchematicRelevanceConsistencyCalleeSource("\uD800"));
  let invoked = 0; const input = Object.defineProperty({}, "result", { enumerable: true, get() { invoked += 1; return []; } });
  assert.throws(() => decodeCurrentSchematicRelevanceConsistencyCalleeFunction(input, 0, "consistencyLocalChange", "script")); assert.equal(invoked, 0);
});
