/** Uninvoked normal-history listeners. No original history, receiver, record,
 * command mutation or callback continuation is established. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_SCHEMATIC_RELEVANCE_COMPLETION_CALLBACK_ROLES as ROLES, CURRENT_SCHEMATIC_RELEVANCE_COMPLETION_CALLBACK_SOURCE as SOURCE, qualifyCurrentSchematicRelevanceCompletionCallbackSource } from "../src/current-schematic-relevance-completion-callback-source.ts";
import type { CurrentSchematicRelevanceCompletionCallbackRole } from "../src/current-schematic-relevance-completion-callback-source.ts";
import { decodeCurrentSchematicRelevanceCompletionCallbackFunction, requireCurrentSchematicRelevanceCompletionCallbackDescription } from "../src/current-schematic-relevance-completion-callback-replies.ts";

function inertFunction(source: string, variant: 0 | 1, role: CurrentSchematicRelevanceCompletionCallbackRole): unknown {
  const row = SOURCE[variant].roles[role]; const text = source.slice(row.start, row.end);
  const padding = source.slice(0, row.start).replaceAll(/[^\n]/gu, value => " ".repeat(value.length)); const context = createContext({});
  return runInContext(`${padding.slice(0, -1)}(${text})`, context) as unknown;
}
void test("actual Node24 metadata binds all four normal history listeners in both pinned sources", async context => {
  let sources: readonly string[];
  try { sources = await Promise.all(SOURCE.map(row => readFile(`/mnt/c/Program Files/EasyEDA-Pro/resources/app/assets/${row.relativePath}`, "utf8"))); }
  catch (error) { if (error !== null && typeof error === "object" && "code" in error && error.code === "ENOENT") { context.skip("installed source unavailable"); return; } throw error; }
  assert.equal(process.versions.node, "24.18.0"); const session = new Session(); session.connect(); const key = "__inertSchematicCompletionCallback";
  try {
    for (const variant of [0, 1] as const) {
      const source = sources[variant]; assert.ok(typeof source === "string"); assert.equal(qualifyCurrentSchematicRelevanceCompletionCallbackSource(source), variant);
      for (const role of ROLES) {
        Object.defineProperty(globalThis, key, { value: inertFunction(source, variant, role), configurable: true });
        const value = await session.post("Runtime.evaluate", { expression: `globalThis[${JSON.stringify(key)}]`, objectGroup: "inert-schematic-completion-callback" });
        const id = value.result.objectId; assert.ok(typeof id === "string");
        requireCurrentSchematicRelevanceCompletionCallbackDescription(value.result.description ?? "", variant, role);
        const packet = await session.post("Runtime.getProperties", { objectId: id, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
        const location: unknown = packet.internalProperties?.find(row => row.name === "[[FunctionLocation]]")?.value?.value;
        assert.ok(location !== null && typeof location === "object" && "scriptId" in location && typeof location.scriptId === "string");
        const scriptId = location.scriptId;
        const decoded = decodeCurrentSchematicRelevanceCompletionCallbackFunction(packet, variant, role, scriptId);
        assert.equal(decoded.originalHistoryVerified, false); assert.equal(decoded.callbackReceiverVerified, false); assert.equal(decoded.continuationAuthorized, false);
        assert.equal(typeof decoded.scopes, "string"); assert.equal(typeof decoded.functionPrototype, "string");
        assert.throws(() => { requireCurrentSchematicRelevanceCompletionCallbackDescription(`${value.result.description ?? ""} `, variant, role); });
        assert.throws(() => decodeCurrentSchematicRelevanceCompletionCallbackFunction(packet, variant, role, "foreign-script"));
        assert.throws(() => decodeCurrentSchematicRelevanceCompletionCallbackFunction({ ...packet, internalProperties: packet.internalProperties?.map(row => row.name === "[[FunctionLocation]]" ? { ...row, value: { ...row.value, value: { ...location, columnNumber: SOURCE[variant].roles[role].columnNumber + 1 } } } : row) }, variant, role, scriptId));
        assert.throws(() => decodeCurrentSchematicRelevanceCompletionCallbackFunction({ ...packet, result: [packet.result[0], packet.result[0]] }, variant, role, scriptId));
      }
    }
  } finally { Reflect.deleteProperty(globalThis, key); await session.post("Runtime.releaseObjectGroup", { objectGroup: "inert-schematic-completion-callback" }); session.disconnect(); }
});
void test("normal history listener metadata refuses foreign source and leaves reply getters uncalled", () => {
  assert.throws(() => qualifyCurrentSchematicRelevanceCompletionCallbackSource("foreign source"));
  assert.throws(() => qualifyCurrentSchematicRelevanceCompletionCallbackSource("\uD800"));
  let invoked = 0; const input = Object.defineProperty({}, "result", { enumerable: true, get() { invoked += 1; return []; } });
  assert.throws(() => decodeCurrentSchematicRelevanceCompletionCallbackFunction(input, 0, "didRecordUpload", "script")); assert.equal(invoked, 0);
});
