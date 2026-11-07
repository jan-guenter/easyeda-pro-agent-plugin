/** Actual Node24 metadata for the inert exact decorator declaration. It is
 * never invoked and no application/native owner or setter exists. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { decodeCurrentSchematicRelevanceDisplayAccessorFunction } from "../src/current-schematic-relevance-display-accessor-replies.ts";
import { decodeGeneratedSchematicDisplayAccessorFunction, requireGeneratedSchematicDisplayAccessorDescription } from "../src/generated-schematic-display-accessor-replies.ts";
import { GENERATED_SCHEMATIC_DISPLAY_ACCESSOR_SOURCE as SOURCE } from "../src/generated-schematic-display-accessor-source.ts";

void test("own7 decorated setter admits only its actual sloppy five-field metadata and preserves old6 refusal", async () => {
  assert.equal(process.versions.node, "24.18.0"); const session = new Session(); session.connect(); await session.post("Debugger.enable");
  const key = `__inertSchematicDecorator_${globalThis.crypto.randomUUID().replaceAll("-", "")}`;
  try {
    for (const variant of [0, 1] as const) {
      const context = createContext({}); const row = SOURCE[variant].methods.decoratedSetter; const text = "function(o){return i.setter.call(this,a,t,o)}";
      const source = `${"\n".repeat(row.lineNumber)}${" ".repeat(row.columnNumber - "function".length - 1)}(${text})`;
      const fn: unknown = runInContext(source, context); Object.defineProperty(globalThis, key, { value: fn, configurable: true });
      const evaluated = await session.post("Runtime.evaluate", { expression: `globalThis[${JSON.stringify(key)}]`, objectGroup: "inert-schematic-decorator" }); const objectId = evaluated.result.objectId;
      assert.ok(typeof objectId === "string"); requireGeneratedSchematicDisplayAccessorDescription(evaluated.result.description, variant, "decoratedSetter");
      const metadata = await session.post("Runtime.getProperties", { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
      const location: unknown = metadata.internalProperties?.find(field => field.name === "[[FunctionLocation]]")?.value?.value;
      assert.ok(location !== null && typeof location === "object"); const scriptId: unknown = Reflect.get(location, "scriptId"); assert.ok(typeof scriptId === "string");
      decodeCurrentSchematicRelevanceDisplayAccessorFunction(metadata, variant, "decoratedSetter", scriptId);
      assert.throws(() => decodeGeneratedSchematicDisplayAccessorFunction(metadata, variant, "decoratedSetter", scriptId), /FUNCTION_OWN_FIELDS/u);
      assert.throws(() => { decodeCurrentSchematicRelevanceDisplayAccessorFunction(metadata, variant, "decoratedSetter", "foreign-script"); });
      const truncated = { ...metadata, result: metadata.result.filter(field => field.name !== "arguments" && field.name !== "caller") };
      assert.throws(() => { decodeCurrentSchematicRelevanceDisplayAccessorFunction(truncated, variant, "decoratedSetter", scriptId); });
      const changed = structuredClone(metadata); const caller = changed.result.find(field => field.name === "caller"); assert.ok(caller !== undefined); caller.writable = true;
      assert.throws(() => { decodeCurrentSchematicRelevanceDisplayAccessorFunction(changed, variant, "decoratedSetter", scriptId); });
      Reflect.deleteProperty(globalThis, key);
    }
  } finally { Reflect.deleteProperty(globalThis, key); await session.post("Runtime.releaseObjectGroup", { objectGroup: "inert-schematic-decorator" }); session.disconnect(); }
});
