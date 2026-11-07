/** Uninvoked installed lookup functions, with original source positions. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_FOOTPRINT_INVERSE_PUBLIC_DELETE_FILES as FILES } from "../src/current-footprint-inverse-public-delete-source.ts";
import { decodeCurrentFootprintInversePublicLookupFunction, requireCurrentFootprintInversePublicLookupDescription } from "../src/current-footprint-inverse-public-lookup-replies.ts";
import { CURRENT_FOOTPRINT_INVERSE_PUBLIC_LOOKUP_ROLES as ROLES, CURRENT_FOOTPRINT_INVERSE_PUBLIC_LOOKUP_SOURCE as SOURCE, qualifyCurrentFootprintInversePublicLookupSource } from "../src/current-footprint-inverse-public-lookup-source.ts";

void test("actual uninvoked lookup and formatter metadata preserves installed source locations and function kinds", async context => {
  assert.equal(process.versions.node, "24.18.0"); let full: string;
  try { full = await readFile(`/mnt/c/Program Files/EasyEDA-Pro/resources/app/assets/${FILES.ui.relativePath}`, "utf8"); }
  catch (error) { if (error !== null && typeof error === "object" && "code" in error && error.code === "ENOENT") { context.skip("installed source unavailable"); return; } throw error; }
  qualifyCurrentFootprintInversePublicLookupSource(full);
  const session = new Session(); session.connect(); const key = "__uninvokedInverseLookup";
  try {
    for (const role of ROLES) {
      const row = SOURCE[role], text = full.slice(row.descriptionStart, row.end);
      // Whitespace derives from the installed asset, never the expected pin.
      const padding = full.slice(0, row.descriptionStart).replaceAll(/[^\n]/gu, value => " ".repeat(value.length));
      const realm = createContext({}); let fn: unknown;
      if (row.kind === "method") {
        const constructor: unknown = runInContext(`${padding.slice(0, -7)}(class{${text}})`, realm);
        assert.ok(typeof constructor === "function"); fn = Object.getOwnPropertyDescriptor(constructor.prototype, row.name)?.value;
      } else {
        const prefix = `const ${row.name}=`; fn = runInContext(`${padding.slice(0, -prefix.length)}${prefix}${text};${row.name}`, realm);
      }
      Object.defineProperty(globalThis, key, { value: fn, configurable: true });
      const evaluated = await session.post("Runtime.evaluate", { expression: `globalThis[${JSON.stringify(key)}]`, objectGroup: "uninvoked-inverse-lookup" });
      assert.equal(evaluated.result.description, text); requireCurrentFootprintInversePublicLookupDescription(text, role);
      assert.throws(() => { requireCurrentFootprintInversePublicLookupDescription(`${text} `, role); });
      const objectId = evaluated.result.objectId; assert.ok(typeof objectId === "string");
      const metadata = await session.post("Runtime.getProperties", { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
      const at = metadata.internalProperties?.find(value => value.name === "[[FunctionLocation]]")?.value;
      assert.ok(at !== undefined && typeof at.value === "object" && at.value !== null);
      const scriptId: unknown = Reflect.get(at.value, "scriptId"); assert.equal(typeof scriptId, "string"); assert.ok(typeof scriptId === "string");
      assert.equal(decodeCurrentFootprintInversePublicLookupFunction(metadata, role, scriptId).scriptId, scriptId);
      assert.throws(() => decodeCurrentFootprintInversePublicLookupFunction(metadata, role, "foreign-script"));
      const shifted = structuredClone(metadata); const point = shifted.internalProperties?.find(value => value.name === "[[FunctionLocation]]")?.value;
      assert.ok(point !== undefined && typeof point.value === "object" && point.value !== null); Reflect.set(point.value, "columnNumber", row.columnNumber - 1);
      assert.throws(() => decodeCurrentFootprintInversePublicLookupFunction(shifted, role, scriptId));
    }
  } finally { Reflect.deleteProperty(globalThis, key); await session.post("Runtime.releaseObjectGroup", { objectGroup: "uninvoked-inverse-lookup" }); session.disconnect(); }
});
