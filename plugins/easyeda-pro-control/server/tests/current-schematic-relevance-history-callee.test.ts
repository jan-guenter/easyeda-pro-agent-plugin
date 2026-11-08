/** Actual uninvoked history command classes and methods in inert VMs. No
 * command instance, original owner, history effect or continuation is issued. */
import assert from "node:assert/strict";
import { INSTALLED_EASYEDA_SOURCE_SKIP_REASON, readConfiguredEasyedaAssets } from "./helpers/installed-easyeda-source.ts";
import { decodeGeneratedSchematicDisplayActionFunction } from "../src/generated-schematic-display-action-replies.ts";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_SCHEMATIC_RELEVANCE_HISTORY_CALLEE_ROLES as ROLES, CURRENT_SCHEMATIC_RELEVANCE_HISTORY_CALLEE_SOURCE as SOURCE, qualifyCurrentSchematicRelevanceHistoryCalleeSource } from "../src/current-schematic-relevance-history-callee-source.ts";
import type { CurrentSchematicRelevanceHistoryCalleeRole } from "../src/current-schematic-relevance-history-callee-source.ts";
import { decodeCurrentSchematicRelevanceHistoryCalleeFunction, requireCurrentSchematicRelevanceHistoryCalleeDescription } from "../src/current-schematic-relevance-history-callee-replies.ts";

function inertFunction(source: string, variant: 0 | 1, role: CurrentSchematicRelevanceHistoryCalleeRole): unknown {
  const row = SOURCE[variant].roles[role]; const text = source.slice(row.start, row.end);
  const padding = source.slice(0, row.start).replaceAll(/[^\n]/gu, value => " ".repeat(value.length));
  const context = createContext({});
  if (role === "commandConstructor") {
    const base = SOURCE[variant].roles.commandBaseConstructor;
    runInContext(`const ${base.name}=${source.slice(base.start, base.end)}`, context);
  }
  if (row.kind === "class") {
    const prefix = `const ${row.name}=`;
    return runInContext(`${padding.slice(0, -prefix.length)}${prefix}${text};${row.name}`, context) as unknown;
  }
  const ctor: unknown = runInContext(`${padding.slice(0, -7)}(class{${text}})`, context);
  assert.ok(typeof ctor === "function"); const prototype: unknown = Reflect.get(ctor, "prototype"); assert.ok(prototype !== null && typeof prototype === "object");
  const method: unknown = Object.getOwnPropertyDescriptor(prototype, row.name)?.value; assert.ok(typeof method === "function"); return method;
}
void test("actual Node24 metadata qualifies both implicit history classes and their base and methods without constructing them", async context => {
  const sources: readonly string[] | null = await readConfiguredEasyedaAssets(SOURCE.map(row => row.relativePath)); if (sources === null) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; }
  assert.equal(process.versions.node, "24.18.0"); const session = new Session(); session.connect(); const key = "__inertSchematicHistoryCallee";
  try {
    for (const variant of [0, 1] as const) {
      const source: string | undefined = sources[variant]; assert.ok(typeof source === "string"); assert.equal(qualifyCurrentSchematicRelevanceHistoryCalleeSource(source), variant);
      for (const role of ROLES) {
        Object.defineProperty(globalThis, key, { value: inertFunction(source, variant, role), configurable: true });
        const value = await session.post("Runtime.evaluate", { expression: `globalThis[${JSON.stringify(key)}]`, objectGroup: "inert-schematic-history-callee" });
        const id = value.result.objectId; assert.ok(typeof id === "string");
        requireCurrentSchematicRelevanceHistoryCalleeDescription(value.result.description ?? "", variant, role);
        const packet = await session.post("Runtime.getProperties", { objectId: id, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
        const location: unknown = packet.internalProperties?.find(row => row.name === "[[FunctionLocation]]")?.value?.value;
        assert.ok(location !== null && typeof location === "object" && "scriptId" in location && typeof location.scriptId === "string");
        const scriptId = location.scriptId;
        const decoded = decodeCurrentSchematicRelevanceHistoryCalleeFunction(packet, variant, role, scriptId);
        assert.equal(decoded.originalModelVerified, false); assert.equal(decoded.callbackReceiverVerified, false); assert.equal(decoded.continuationAuthorized, false);
        assert.equal(typeof decoded.scopes, "string"); assert.equal(typeof decoded.functionPrototype, "string");
        assert.equal(decoded.prototype === null, SOURCE[variant].roles[role].kind !== "class");
        if (role === "commandConstructor") { assert.throws(() => decodeGeneratedSchematicDisplayActionFunction(packet, variant, role, scriptId), /IMPLICIT_CONSTRUCTOR_SOURCE_ONLY/u); }
        assert.throws(() => { requireCurrentSchematicRelevanceHistoryCalleeDescription(`${value.result.description ?? ""} `, variant, role); });
        assert.throws(() => decodeCurrentSchematicRelevanceHistoryCalleeFunction(packet, variant, role, "foreign-script"));
        assert.throws(() => decodeCurrentSchematicRelevanceHistoryCalleeFunction({ ...packet, internalProperties: packet.internalProperties?.map(row => row.name === "[[FunctionLocation]]" ? { ...row, value: { ...row.value, value: { ...location, columnNumber: SOURCE[variant].roles[role].columnNumber + 1 } } } : row) }, variant, role, scriptId));
        assert.throws(() => decodeCurrentSchematicRelevanceHistoryCalleeFunction({ ...packet, result: [packet.result[0], packet.result[0]] }, variant, role, scriptId));
      }
    }
  } finally { Reflect.deleteProperty(globalThis, key); await session.post("Runtime.releaseObjectGroup", { objectGroup: "inert-schematic-history-callee" }); session.disconnect(); }
});
void test("history command qualification rejects foreign source and reply getters without invoking them", () => {
  assert.throws(() => qualifyCurrentSchematicRelevanceHistoryCalleeSource("foreign source"));
  assert.throws(() => qualifyCurrentSchematicRelevanceHistoryCalleeSource("\uD800"));
  let invoked = 0; const input = Object.defineProperty({}, "result", { enumerable: true, get() { invoked += 1; return []; } });
  assert.throws(() => decodeCurrentSchematicRelevanceHistoryCalleeFunction(input, 0, "commandConstructor", "script")); assert.equal(invoked, 0);
});
