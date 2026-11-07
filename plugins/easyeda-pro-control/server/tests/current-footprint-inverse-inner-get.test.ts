/** Exact class/method definitions only. No constructor or vendor body runs. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_FOOTPRINT_INVERSE_INNER_GET_FILE as FILE, CURRENT_FOOTPRINT_INVERSE_INNER_GET_ROLES as ROLES, CURRENT_FOOTPRINT_INVERSE_INNER_GET_SOURCE as SOURCE, requireCurrentFootprintInverseInnerGetDescription as description, qualifyCurrentFootprintInverseInnerGetSource as qualify } from "../src/current-footprint-inverse-inner-get-source.ts";
import type { CurrentFootprintInverseInnerGetRole as Role } from "../src/current-footprint-inverse-inner-get-source.ts";
import { decodeCurrentFootprintInverseInnerGetFunction as decode } from "../src/current-footprint-inverse-inner-get-replies.ts";

/** Preserve actual assignment inference, including `let s=...` and excluding
 * member assignments such as `bc.onmessage=...`; no expected name supplies it. */
function assignedName(source: string, start: number): string | null {
  const before = source.slice(Math.max(0, start - 64), start); const match = /([$A-Z_a-z][$\w]*)\s*=$/u.exec(before); if (match === null || match[1] === undefined) { return null; } const offset = before.length - match[0].length; if (before[offset - 1] === ".") { return null; } return match[1];
}
function inert(source: string, role: Role): unknown {
  const row = SOURCE[role]; const fragment = source.slice(row.start, row.end); let prefix = "", suffix = "";
  if (row.syntax === "class") { const name = assignedName(source, row.start); assert.ok(name !== null); prefix = `const ${name}=`; suffix = `;globalThis.selected=${name};`; }
  else if (row.syntax === "method") { prefix = "const holder=class{"; suffix = `};globalThis.selected=Object.getOwnPropertyDescriptor(holder.prototype,${JSON.stringify(row.name)}).value;`; }
  else if (row.syntax === "function") { suffix = `;globalThis.selected=${row.name};`; }
  else { const name = assignedName(source, row.start); if (name === null) { prefix = "(fn=>globalThis.selected=fn)("; suffix = ");"; } else { prefix = `const ${name}=`; suffix = `;globalThis.selected=${name};`; } }
  let program = source.slice(0, row.start).replaceAll(/[^\r\n]/gu, " "); program = program.slice(0, row.start - prefix.length) + prefix + fragment + suffix; if (row.strict) { program = `"use strict";${program.slice(13)}`; }
  const realm = createContext({}); runInContext("var _w=class{},VR=class{};", realm); runInContext(program, realm); return Reflect.get(realm, "selected");
}
void test("all43 inner Li functions preserve original coordinates and inferred callback names in actual Node metadata", async context => {
  let source: string; try { source = await readFile(`/mnt/c/Program Files/EasyEDA-Pro/resources/app/assets/${FILE.relativePath}`, "utf8"); } catch (error) { if (error !== null && typeof error === "object" && "code" in error && error.code === "ENOENT") { context.skip("installed source unavailable"); return; } throw error; }
  qualify(source); assert.throws(() => { qualify(`${source} `); }); assert.equal(ROLES.length, 43); assert.equal(process.versions.node, "24.18.0"); const session = new Session(); session.connect(); const key = "__inertInnerGet";
  try { for (const role of ROLES) { const fn = inert(source, role); assert.equal(typeof fn, "function"); Object.defineProperty(globalThis, key, { value: fn, configurable: true }); const remote = await session.post("Runtime.evaluate", { expression: `globalThis.${key}`, objectGroup: "inert-inner-get" }); const id = remote.result.objectId; assert.ok(typeof id === "string"); description(remote.result.description ?? "", role);
      const raw = await session.post("Runtime.getProperties", { objectId: id, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false }); const metadata = decode(raw, role); assert.ok(metadata.scopes.length > 0); assert.throws(() => decode(raw, role, "foreign-script")); const changed = structuredClone(raw); const point = changed.internalProperties?.find(item => item.name === "[[FunctionLocation]]"); assert.ok(point?.value !== undefined); point.value.value = { scriptId: metadata.scriptId, lineNumber: SOURCE[role].lineNumber, columnNumber: SOURCE[role].columnNumber + 1 }; assert.throws(() => decode(changed, role));
    } } finally { Reflect.deleteProperty(globalThis, key); await session.post("Runtime.releaseObjectGroup", { objectGroup: "inert-inner-get" }); session.disconnect(); }
});
void test("inner and outer RPC records stay distinct and the assigned service callback keeps its actual name", () => {
  assert.equal(SOURCE.innerRpcBaseRpcServiceCallback1.name, "s"); assert.equal(SOURCE.innerBroadcastTaskExecute.async, true); assert.equal(SOURCE.innerRpcBaseRpcCall.arity, 2); assert.throws(() => { description("post(e){return true}", "innerBroadcastPost"); });
  let effects = 0; const input = new Proxy({}, { ownKeys(): never { effects += 1; throw new Error("getter"); } }); assert.throws(() => decode(input, "innerBroadcastPost")); assert.equal(effects, 0);
});
