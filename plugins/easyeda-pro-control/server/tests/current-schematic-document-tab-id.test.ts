/** Actual uninvoked pinned functions in an inert VM. No model, original
 * renderer, actor, receiver, mutation or saved result is established. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_SCHEMATIC_DOCUMENT_TAB_ID_ROLES as ROLES, CURRENT_SCHEMATIC_DOCUMENT_TAB_ID_SOURCE as SOURCE, qualifyCurrentSchematicDocumentTabIdSource } from "../src/current-schematic-document-tab-id-source.ts";
import type { CurrentSchematicDocumentTabIdRole } from "../src/current-schematic-document-tab-id-source.ts";
import { decodeCurrentSchematicDocumentTabIdFunction, requireCurrentSchematicDocumentTabIdDescription } from "../src/current-schematic-document-tab-id-replies.ts";

function inertFunction(source: string, variant: 0 | 1, role: CurrentSchematicDocumentTabIdRole): unknown {
  const row = SOURCE[variant].roles[role]; const text = source.slice(row.start, row.end);
  const padding = source.slice(0, row.start).replaceAll(/[^\n]/gu, " "); const context = createContext({});
  const ctor: unknown = runInContext(`${padding.slice(0, -7)}(class{${text}})`, context);
  assert.ok(typeof ctor === "function"); const prototype: unknown = Reflect.get(ctor, "prototype"); assert.ok(prototype !== null && typeof prototype === "object");
  // oxlint-disable-next-line typescript/unbound-method -- Inspector must receive the exact uninvoked getter; binding it would replace its identity.
  const getter: unknown = Object.getOwnPropertyDescriptor(prototype, row.name.slice(4))?.get; assert.ok(typeof getter === "function"); return getter;
}
void test("actual Node24 metadata binds all six uninvoked base, waveform and schematic-page document tabId getters in both exact sources", async context => {
  let sources: readonly string[];
  try { sources = await Promise.all(SOURCE.map(row => readFile(`/mnt/c/Program Files/EasyEDA-Pro/resources/app/assets/${row.relativePath}`, "utf8"))); }
  catch (error) { if (error !== null && typeof error === "object" && "code" in error && error.code === "ENOENT") { context.skip("installed source unavailable"); return; } throw error; }
  assert.equal(process.versions.node, "24.18.0"); const session = new Session(); session.connect(); const key = "__inertSchematicDocumentTabId";
  try {
    for (const variant of [0, 1] as const) {
      const source = sources[variant]; assert.ok(typeof source === "string"); assert.equal(qualifyCurrentSchematicDocumentTabIdSource(source), variant);
      for (const role of ROLES) {
        Object.defineProperty(globalThis, key, { value: inertFunction(source, variant, role), configurable: true });
        const value = await session.post("Runtime.evaluate", { expression: `globalThis[${JSON.stringify(key)}]`, objectGroup: "inert-schematic-document-tab-id" });
        const id = value.result.objectId; assert.ok(typeof id === "string");
        requireCurrentSchematicDocumentTabIdDescription(value.result.description ?? "", variant, role);
        const packet = await session.post("Runtime.getProperties", { objectId: id, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
        const location: unknown = packet.internalProperties?.find(row => row.name === "[[FunctionLocation]]")?.value?.value;
        assert.ok(location !== null && typeof location === "object" && "scriptId" in location && typeof location.scriptId === "string");
        const scriptId = location.scriptId;
        const decoded = decodeCurrentSchematicDocumentTabIdFunction(packet, variant, role, scriptId);
        assert.equal(decoded.originalDocumentVerified, false); assert.equal(decoded.getterInvocationAuthorized, false); assert.equal(decoded.continuationAuthorized, false);
        assert.equal(typeof decoded.scopes, "string"); assert.equal(typeof decoded.functionPrototype, "string");
        assert.throws(() => { requireCurrentSchematicDocumentTabIdDescription(`${value.result.description ?? ""} `, variant, role); });
        assert.throws(() => decodeCurrentSchematicDocumentTabIdFunction(packet, variant, role, "foreign-script"));
        assert.throws(() => decodeCurrentSchematicDocumentTabIdFunction({ ...packet, internalProperties: packet.internalProperties?.map(row => row.name === "[[FunctionLocation]]" ? { ...row, value: { ...row.value, value: { ...location, columnNumber: SOURCE[variant].roles[role].columnNumber + 1 } } } : row) }, variant, role, scriptId));
        assert.throws(() => decodeCurrentSchematicDocumentTabIdFunction({ ...packet, result: [packet.result[0], packet.result[0]] }, variant, role, scriptId));
      }
    }
  } finally { Reflect.deleteProperty(globalThis, key); await session.post("Runtime.releaseObjectGroup", { objectGroup: "inert-schematic-document-tab-id" }); session.disconnect(); }
});
void test("document getter qualification refuses foreign or malformed source and keeps metadata getters uncalled", () => {
  assert.throws(() => qualifyCurrentSchematicDocumentTabIdSource("foreign source"));
  assert.throws(() => qualifyCurrentSchematicDocumentTabIdSource("\uD800"));
  let invoked = 0; const input = Object.defineProperty({}, "result", { enumerable: true, get() { invoked += 1; return []; } });
  assert.throws(() => decodeCurrentSchematicDocumentTabIdFunction(input, 0, "base", "script")); assert.equal(invoked, 0);
});
