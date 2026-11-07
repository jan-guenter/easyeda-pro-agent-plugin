/** Actual uninvoked base and schematic-page classes in inert VMs. No
 * application document, original owner, receiver or continuation is issued. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_SCHEMATIC_DOCUMENT_CONSTRUCTOR_ROLES as ROLES, CURRENT_SCHEMATIC_DOCUMENT_CONSTRUCTOR_SOURCE as SOURCE, qualifyCurrentSchematicDocumentConstructorSource } from "../src/current-schematic-document-constructor-source.ts";
import type { CurrentSchematicDocumentConstructorRole } from "../src/current-schematic-document-constructor-source.ts";
import { decodeCurrentSchematicDocumentConstructorFunction, requireCurrentSchematicDocumentConstructorDescription } from "../src/current-schematic-document-constructor-replies.ts";

function inertFunction(source: string, variant: 0 | 1, role: CurrentSchematicDocumentConstructorRole): unknown {
  const row = SOURCE[variant].roles[role]; const text = source.slice(row.start, row.end);
  // Preserve UTF16 coordinates even if a future pinned prefix has astral text.
  const padding = source.slice(0, row.start).replaceAll(/[^\r\n]/gu, char => " ".repeat(char.length));
  const context = createContext({}); runInContext("class He{constructor(){throw 'unexpected construction';}}", context);
  if (role === "schematicPage") {
    const base = SOURCE[variant].roles.base;
    runInContext(`const ${base.name}=${source.slice(base.start, base.end)}`, context);
  }
  const prefix = `const ${row.name}=`;
  return runInContext(`${padding.slice(0, -prefix.length)}${prefix}${text};${row.name}`, context) as unknown;
}
void test("actual Node24 metadata qualifies all four base and schematic document constructors without constructing them", async context => {
  let sources: readonly string[];
  try { sources = await Promise.all(SOURCE.map(row => readFile(`/mnt/c/Program Files/EasyEDA-Pro/resources/app/assets/${row.relativePath}`, "utf8"))); }
  catch (error) { if (error !== null && typeof error === "object" && "code" in error && error.code === "ENOENT") { context.skip("installed source unavailable"); return; } throw error; }
  assert.equal(process.versions.node, "24.18.0"); const session = new Session(); session.connect(); const key = "__inertSchematicDocumentConstructor";
  try {
    for (const variant of [0, 1] as const) {
      const source = sources[variant]; assert.ok(typeof source === "string"); assert.equal(qualifyCurrentSchematicDocumentConstructorSource(source), variant);
      for (const role of ROLES) {
        Object.defineProperty(globalThis, key, { value: inertFunction(source, variant, role), configurable: true });
        const value = await session.post("Runtime.evaluate", { expression: `globalThis[${JSON.stringify(key)}]`, objectGroup: "inert-schematic-document-constructor" });
        const id = value.result.objectId; assert.ok(typeof id === "string");
        requireCurrentSchematicDocumentConstructorDescription(value.result.description ?? "", variant, role);
        const packet = await session.post("Runtime.getProperties", { objectId: id, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
        const location: unknown = packet.internalProperties?.find(row => row.name === "[[FunctionLocation]]")?.value?.value;
        assert.ok(location !== null && typeof location === "object" && "scriptId" in location && typeof location.scriptId === "string");
        const scriptId = location.scriptId;
        const decoded = decodeCurrentSchematicDocumentConstructorFunction(packet, variant, role, scriptId);
        assert.equal(decoded.originalDocumentVerified, false); assert.equal(decoded.constructorInvocationAuthorized, false); assert.equal(decoded.continuationAuthorized, false);
        assert.equal(typeof decoded.scopes, "string"); assert.equal(typeof decoded.functionPrototype, "string");
        assert.equal(typeof decoded.prototype, "string");
        assert.throws(() => { requireCurrentSchematicDocumentConstructorDescription(`${value.result.description ?? ""} `, variant, role); });
        assert.throws(() => decodeCurrentSchematicDocumentConstructorFunction(packet, variant, role, "foreign-script"));
        assert.throws(() => decodeCurrentSchematicDocumentConstructorFunction({ ...packet, internalProperties: packet.internalProperties?.map(row => row.name === "[[FunctionLocation]]" ? { ...row, value: { ...row.value, value: { ...location, columnNumber: SOURCE[variant].roles[role].columnNumber + 1 } } } : row) }, variant, role, scriptId));
        assert.throws(() => decodeCurrentSchematicDocumentConstructorFunction({ ...packet, result: [packet.result[0], packet.result[0]] }, variant, role, scriptId));
      }
    }
  } finally { Reflect.deleteProperty(globalThis, key); await session.post("Runtime.releaseObjectGroup", { objectGroup: "inert-schematic-document-constructor" }); session.disconnect(); }
});
void test("document constructor qualification rejects foreign source and reply getters without invoking them", () => {
  assert.throws(() => qualifyCurrentSchematicDocumentConstructorSource("foreign source"));
  assert.throws(() => qualifyCurrentSchematicDocumentConstructorSource("\uD800"));
  let invoked = 0; const input = Object.defineProperty({}, "result", { enumerable: true, get() { invoked += 1; return []; } });
  assert.throws(() => decodeCurrentSchematicDocumentConstructorFunction(input, 0, "schematicPage", "script")); assert.equal(invoked, 0);
});
