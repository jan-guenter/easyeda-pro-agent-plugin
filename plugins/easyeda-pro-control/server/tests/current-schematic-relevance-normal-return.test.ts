/** Actual uninvoked pinned functions in an inert VM. No model, original
 * renderer, actor, receiver, mutation or saved result is established. */
import assert from "node:assert/strict";
import { INSTALLED_EASYEDA_SOURCE_SKIP_REASON, readConfiguredEasyedaAssets } from "./helpers/installed-easyeda-source.ts";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_SCHEMATIC_RELEVANCE_NORMAL_RETURN_ROLES as ROLES, CURRENT_SCHEMATIC_RELEVANCE_NORMAL_RETURN_SOURCE as SOURCE, qualifyCurrentSchematicRelevanceNormalReturnSource } from "../src/current-schematic-relevance-normal-return-source.ts";
import type { CurrentSchematicRelevanceNormalReturnRole } from "../src/current-schematic-relevance-normal-return-source.ts";
import { decodeCurrentSchematicRelevanceNormalReturnFunction, requireCurrentSchematicRelevanceNormalReturnDescription } from "../src/current-schematic-relevance-normal-return-replies.ts";

function inertFunction(source: string, variant: 0 | 1, role: CurrentSchematicRelevanceNormalReturnRole): unknown {
 const row = SOURCE[variant].roles[role], text = source.slice(row.start, row.end);
 let padding = source.slice(0, row.start).replaceAll(/[^\r\n]/gu, char => " ".repeat(char.length));
 const context = createContext({});
 if (row.kind === "method") {
  const ctor: unknown = runInContext(`${padding.slice(0, -7)}(class{${text}})`, context);
  assert.ok(typeof ctor === "function"); const prototype: unknown = Reflect.get(ctor, "prototype");
  assert.ok(prototype !== null && typeof prototype === "object"); return Object.getOwnPropertyDescriptor(prototype, row.name)?.value as unknown;
 }
 const prefix = role === "asyncFulfilled" ? "const selected=(0," : "const s=", tail = role === "asyncFulfilled" ? ");selected" : ";s";
 if (role === "finishAction") { const directive = '"use strict";'; assert.ok(padding.startsWith(" ".repeat(directive.length))); padding = directive + padding.slice(directive.length); }
 return runInContext(`${padding.slice(0, -prefix.length)}${prefix}${text}${tail}`, context) as unknown;
}
void test("actual Node24 metadata binds all eight normal-return callbacks in both exact sources", async context => {
  const sources: readonly string[] | null = await readConfiguredEasyedaAssets(SOURCE.map(row => row.relativePath)); if (sources === null) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; }
  assert.equal(process.versions.node, "24.18.0"); const session = new Session(); session.connect(); const key = "__inertSchematicNormalReturn";
  try {
    for (const variant of [0, 1] as const) {
      const source: string | undefined = sources[variant]; assert.ok(typeof source === "string"); assert.equal(qualifyCurrentSchematicRelevanceNormalReturnSource(source), variant);
      for (const role of ROLES) {
        Object.defineProperty(globalThis, key, { value: inertFunction(source, variant, role), configurable: true });
        const value = await session.post("Runtime.evaluate", { expression: `globalThis[${JSON.stringify(key)}]`, objectGroup: "inert-schematic-normal-return" });
        const id = value.result.objectId; assert.ok(typeof id === "string");
        requireCurrentSchematicRelevanceNormalReturnDescription(value.result.description ?? "", variant, role);
        const packet = await session.post("Runtime.getProperties", { objectId: id, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
        const location: unknown = packet.internalProperties?.find(row => row.name === "[[FunctionLocation]]")?.value?.value;
        assert.ok(location !== null && typeof location === "object" && "scriptId" in location && typeof location.scriptId === "string");
        const scriptId = location.scriptId;
        const decoded = decodeCurrentSchematicRelevanceNormalReturnFunction(packet, variant, role, scriptId);
        assert.equal(decoded.originalReceiverVerified, false); assert.equal(decoded.callbackDeliveryVerified, false); assert.equal(decoded.continuationAuthorized, false);
        assert.equal(typeof decoded.scopes, "string"); assert.equal(typeof decoded.functionPrototype, "string");
        assert.throws(() => { requireCurrentSchematicRelevanceNormalReturnDescription(`${value.result.description ?? ""} `, variant, role); });
        assert.throws(() => decodeCurrentSchematicRelevanceNormalReturnFunction(packet, variant, role, "foreign-script"));
        assert.throws(() => decodeCurrentSchematicRelevanceNormalReturnFunction({ ...packet, internalProperties: packet.internalProperties?.map(row => row.name === "[[FunctionLocation]]" ? { ...row, value: { ...row.value, value: { ...location, columnNumber: SOURCE[variant].roles[role].columnNumber + 1 } } } : row) }, variant, role, scriptId));
        assert.throws(() => decodeCurrentSchematicRelevanceNormalReturnFunction({ ...packet, result: [packet.result[0], packet.result[0]] }, variant, role, scriptId));
      }
    }
  } finally { Reflect.deleteProperty(globalThis, key); await session.post("Runtime.releaseObjectGroup", { objectGroup: "inert-schematic-normal-return" }); session.disconnect(); }
});
void test("normal-return callback qualification refuses foreign or malformed source and keeps metadata getters uncalled", () => {
  assert.throws(() => qualifyCurrentSchematicRelevanceNormalReturnSource("foreign source"));
  assert.throws(() => qualifyCurrentSchematicRelevanceNormalReturnSource("\uD800"));
  let invoked = 0; const input = Object.defineProperty({}, "result", { enumerable: true, get() { invoked += 1; return []; } });
  assert.throws(() => decodeCurrentSchematicRelevanceNormalReturnFunction(input, 0, "actionEnd", "script")); assert.equal(invoked, 0);
});
