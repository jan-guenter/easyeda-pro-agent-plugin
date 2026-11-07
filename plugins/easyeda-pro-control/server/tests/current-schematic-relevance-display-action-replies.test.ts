/** Actual Node24 Inspector metadata from inert pinned noop declarations.
 * Declarations are compiled, never invoked. No app or native owner exists. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { decodeCurrentSchematicRelevanceDisplayActionNoop } from "../src/current-schematic-relevance-display-action-replies.ts";
import { decodeGeneratedSchematicDisplayActionFunction, requireGeneratedSchematicDisplayActionDescription } from "../src/generated-schematic-display-action-replies.ts";
import { GENERATED_SCHEMATIC_DISPLAY_ACTION_SOURCE as SOURCE } from "../src/generated-schematic-display-action-source.ts";

void test("genuine7 noop metadata admits only the actual sloppy five-field shape and preserves old6 refusal", async () => {
  assert.equal(process.versions.node, "24.18.0"); const session = new Session(); session.connect(); await session.post("Debugger.enable");
  const key = `__inertSchematicNoop_${globalThis.crypto.randomUUID().replaceAll("-", "")}`;
  try {
    for (const variant of [0, 1] as const) {
      const context = createContext({}); const row = SOURCE[variant].methods.noop; const text = `function ${row.name}(...i){}`;
      const source = `${"\n".repeat(row.lineNumber)}${" ".repeat(row.columnNumber - `function ${row.name}`.length - 1)}(${text})`;
      const fn: unknown = runInContext(source, context); Object.defineProperty(globalThis, key, { value: fn, configurable: true });
      const evaluated = await session.post("Runtime.evaluate", { expression: `globalThis[${JSON.stringify(key)}]`, objectGroup: "inert-schematic-noop" }); const objectId = evaluated.result.objectId;
      assert.ok(typeof objectId === "string"); requireGeneratedSchematicDisplayActionDescription(evaluated.result.description, variant, "noop");
      const metadata = await session.post("Runtime.getProperties", { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
      const location: unknown = metadata.internalProperties?.find(field => field.name === "[[FunctionLocation]]")?.value?.value;
      assert.ok(location !== null && typeof location === "object"); const scriptId: unknown = Reflect.get(location, "scriptId"); assert.ok(typeof scriptId === "string");
      decodeCurrentSchematicRelevanceDisplayActionNoop(metadata, variant, scriptId);
      assert.throws(() => decodeGeneratedSchematicDisplayActionFunction(metadata, variant, "noop", scriptId), /FUNCTION_OWN_FIELDS/u);
      assert.throws(() => { decodeCurrentSchematicRelevanceDisplayActionNoop(metadata, variant, "foreign-script"); });
      const truncated = { ...metadata, result: metadata.result.filter(field => field.name !== "arguments" && field.name !== "caller") };
      assert.throws(() => { decodeCurrentSchematicRelevanceDisplayActionNoop(truncated, variant, scriptId); });
      const changed = structuredClone(metadata); const caller = changed.result.find(field => field.name === "caller"); assert.ok(caller !== undefined); caller.writable = true;
      assert.throws(() => { decodeCurrentSchematicRelevanceDisplayActionNoop(changed, variant, scriptId); });
      Reflect.deleteProperty(globalThis, key);
    }
  } finally { Reflect.deleteProperty(globalThis, key); await session.post("Runtime.releaseObjectGroup", { objectGroup: "inert-schematic-noop" }); session.disconnect(); }
});
