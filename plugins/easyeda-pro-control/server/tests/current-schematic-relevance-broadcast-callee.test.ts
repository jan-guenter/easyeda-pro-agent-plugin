import {INSTALLED_EASYEDA_SOURCE_SKIP_REASON,readConfiguredEasyedaAssets} from "./helpers/installed-easyeda-source.ts";
/** Uninvoked broadcast functions. No original broadcast, receiver, ticket,
 * command mutation or callback continuation is established. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_SCHEMATIC_RELEVANCE_BROADCAST_CALLEE_ROLES as ROLES, CURRENT_SCHEMATIC_RELEVANCE_BROADCAST_CALLEE_SOURCE as SOURCE, qualifyCurrentSchematicRelevanceBroadcastCalleeSource } from "../src/current-schematic-relevance-broadcast-callee-source.ts";
import type { CurrentSchematicRelevanceBroadcastCalleeRole } from "../src/current-schematic-relevance-broadcast-callee-source.ts";
import { decodeCurrentSchematicRelevanceBroadcastCalleeFunction, requireCurrentSchematicRelevanceBroadcastCalleeDescription } from "../src/current-schematic-relevance-broadcast-callee-replies.ts";

function inertFunction(source: string, variant: 0 | 1, role: CurrentSchematicRelevanceBroadcastCalleeRole): unknown {
  const row = SOURCE[variant].roles[role]; const text = source.slice(row.start, row.end);
  const padding = source.slice(0, row.start).replaceAll(/[^\n]/gu, value => " ".repeat(value.length)); const context = createContext({});
  if (row.kind === "arrow") { return runInContext(`"use strict";${padding.slice(13, -1)}(${text})`, context) as unknown; }
  if (row.kind === "regular") { return runInContext(`${padding}${text};${row.name}`, context) as unknown; }
  const ctor: unknown = runInContext(`${padding.slice(0, -7)}(class{${text}})`, context);
  assert.ok(typeof ctor === "function"); const prototype: unknown = Reflect.get(ctor, "prototype"); assert.ok(prototype !== null && typeof prototype === "object");
  const descriptor = Object.getOwnPropertyDescriptor(prototype, row.name);
  const fn: unknown = descriptor?.value; assert.ok(typeof fn === "function"); return fn;
}
void test("actual Node24 metadata binds broadcast callbacks and native bus sender methods in both pinned sources", async context => {
  const sources=await readConfiguredEasyedaAssets(SOURCE.map(row=>row.relativePath));if(sources===null){context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON);return;}
  assert.equal(process.versions.node, "24.18.0"); const session = new Session(); session.connect(); const key = "__inertSchematicBroadcastCallee";
  try {
    for (const variant of [0, 1] as const) {
      const source: string|undefined = sources[variant]; assert.ok(typeof source === "string"); assert.equal(qualifyCurrentSchematicRelevanceBroadcastCalleeSource(source), variant);
      for (const role of ROLES) {
        Object.defineProperty(globalThis, key, { value: inertFunction(source, variant, role), configurable: true });
        const value = await session.post("Runtime.evaluate", { expression: `globalThis[${JSON.stringify(key)}]`, objectGroup: "inert-schematic-broadcast-callee" });
        const id = value.result.objectId; assert.ok(typeof id === "string");
        requireCurrentSchematicRelevanceBroadcastCalleeDescription(value.result.description ?? "", variant, role);
        const packet = await session.post("Runtime.getProperties", { objectId: id, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
        const location: unknown = packet.internalProperties?.find(row => row.name === "[[FunctionLocation]]")?.value?.value;
        assert.ok(location !== null && typeof location === "object" && "scriptId" in location && typeof location.scriptId === "string");
        const scriptId = location.scriptId;
        const decoded = decodeCurrentSchematicRelevanceBroadcastCalleeFunction(packet, variant, role, scriptId);
        assert.equal(typeof decoded.scopes, "string"); assert.equal(decoded.scriptId, scriptId);
        assert.throws(() => { requireCurrentSchematicRelevanceBroadcastCalleeDescription(`${value.result.description ?? ""} `, variant, role); });
        assert.throws(() => decodeCurrentSchematicRelevanceBroadcastCalleeFunction(packet, variant, role, "foreign-script"));
        assert.throws(() => decodeCurrentSchematicRelevanceBroadcastCalleeFunction({ ...packet, internalProperties: packet.internalProperties?.map(row => row.name === "[[FunctionLocation]]" ? { ...row, value: { ...row.value, value: { ...location, columnNumber: SOURCE[variant].roles[role].columnNumber + 1 } } } : row) }, variant, role, scriptId));
        assert.throws(() => decodeCurrentSchematicRelevanceBroadcastCalleeFunction({ ...packet, result: [packet.result[0], packet.result[0]] }, variant, role, scriptId));
      }
    }
  } finally { Reflect.deleteProperty(globalThis, key); await session.post("Runtime.releaseObjectGroup", { objectGroup: "inert-schematic-broadcast-callee" }); session.disconnect(); }
});
void test("normal broadcast metadata refuses foreign source and leaves reply getters uncalled", () => {
  assert.throws(() => qualifyCurrentSchematicRelevanceBroadcastCalleeSource("foreign source"));
  assert.throws(() => qualifyCurrentSchematicRelevanceBroadcastCalleeSource("\uD800"));
  let invoked = 0; const input = Object.defineProperty({}, "result", { enumerable: true, get() { invoked += 1; return []; } });
  assert.throws(() => decodeCurrentSchematicRelevanceBroadcastCalleeFunction(input, 0, "post", "script")); assert.equal(invoked, 0);
});
