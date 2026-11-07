/** Actual source-preserving declarations are instantiated without calling any
 * vendor body. Runtime request custody remains outside these metadata checks. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_FOOTPRINT_INVERSE_INITIALIZED_GET_FILES as FILES, CURRENT_FOOTPRINT_INVERSE_INITIALIZED_GET_ROLES as ROLES, CURRENT_FOOTPRINT_INVERSE_INITIALIZED_GET_SOURCE as SOURCE, requireCurrentFootprintInverseInitializedGetDescription as description, qualifyCurrentFootprintInverseInitializedGetSource as qualify } from "../src/current-footprint-inverse-initialized-get-source.ts";
import type { CurrentFootprintInverseInitializedGetRole as Role } from "../src/current-footprint-inverse-initialized-get-source.ts";
import { decodeCurrentFootprintInverseInitializedGetFunction as decode } from "../src/current-footprint-inverse-initialized-get-replies.ts";

function load(file: "ui" | "manager"): Promise<string> { return readFile(`/mnt/c/Program Files/easyeda-pro/resources/app/assets/${FILES[file].relativePath}`, "utf8"); }
async function sources(): Promise<Readonly<Record<"ui" | "manager", string>>> {
  const [ui, manager] = await Promise.all([load("ui"), load("manager")]); return { ui, manager };
}
function inert(original: string, role: Role): unknown {
  const row = SOURCE[role]; const fragment = original.slice(row.start, row.end); let prefix = "", suffix = "";
  if (row.syntax === "method") {
    prefix = "const __holder=class{"; const target = fragment.startsWith("static ") ? "__holder" : "__holder.prototype";
    suffix = `};globalThis.__selected=Object.getOwnPropertyDescriptor(${target},${JSON.stringify(row.name)}).value;`;
  } else if (row.syntax === "class") { prefix = `const ${row.name}=`; suffix = `;globalThis.__selected=${row.name};`; }
  else if (row.syntax === "function") { suffix = `;globalThis.__selected=${row.name};`; }
  else { prefix = "(fn=>globalThis.__selected=fn)("; suffix = ");"; }
  // Preserve coordinates from original text, without padding to expected pins.
  let program = original.slice(0, row.start).replaceAll(/[^\r\n]/gu, " "); program = program.slice(0, row.start - prefix.length) + prefix + fragment + suffix;
  if (row.strict) { program = `"use strict";${program.slice(13)}`; }
  const realm = createContext({}); if (row.kind === "class" && (row.name === "ddn" || row.name === "UR")) { runInContext("var qsi=class{},ww=class{};", realm); } runInContext(program, realm); return Reflect.get(realm, "__selected");
}
void test("all98 initialized bus and GET functions have actual uninvoked Node24 metadata at original source coordinates", async context => {
  let full: Awaited<ReturnType<typeof sources>>;
  try { full = await sources(); } catch (error) { if (error !== null && typeof error === "object" && "code" in error && error.code === "ENOENT") { context.skip("installed source unavailable"); return; } throw error; }
  assert.equal(process.versions.node, "24.18.0"); assert.equal(ROLES.length, 98); for (const file of ["ui", "manager"] as const) { qualify(full[file], file); assert.throws(() => { qualify(`${full[file]} `, file); }); }
  const session = new Session(); session.connect(); const key = "__inertInitializedGet";
  try {
    for (const role of ROLES) {
      const row = SOURCE[role]; const fn = inert(full[row.file], role); assert.equal(typeof fn, "function"); Object.defineProperty(globalThis, key, { value: fn, configurable: true });
      const value = await session.post("Runtime.evaluate", { expression: `globalThis.${key}`, objectGroup: "initialized-get" }); const id = value.result.objectId; assert.ok(id !== undefined); description(value.result.description ?? "", role);
      const raw = await session.post("Runtime.getProperties", { objectId: id, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false }); let checked: ReturnType<typeof decode>; try { checked = decode(raw, role); } catch (error) { throw new Error(role, { cause: error }); } assert.ok(checked.scopes.length > 0); assert.throws(() => decode(raw, role, "foreign-script"));
      const changed = structuredClone(raw), field = changed.result.find(item => item.name === "length"); assert.ok(field?.value !== undefined); field.value.value = row.arity + 1; assert.throws(() => decode(changed, role));
      const foreign = structuredClone(raw), location = foreign.internalProperties?.find(item => item.name === "[[FunctionLocation]]"); assert.ok(location?.value !== undefined); location.value.value = { scriptId: checked.scriptId, lineNumber: row.lineNumber, columnNumber: row.columnNumber + 1 }; assert.throws(() => decode(foreign, role));
    }
  } finally { Reflect.deleteProperty(globalThis, key); await session.post("Runtime.releaseObjectGroup", { objectGroup: "initialized-get" }); session.disconnect(); }
});
void test("GET forwarding stays on initialized outer buses and preserves its undefined need argument", () => {
  assert.equal(FILES.ui.alias, "ude=L(KU())"); assert.equal(FILES.manager.alias, "ky=mi(Li())");
  assert.equal(SOURCE.managerRegisterGetCallback1.start, 2_069_066); assert.equal(SOURCE.managerProjectGetData.async, true);
  assert.equal(SOURCE.uiBusRpcCall.arity, 2); assert.equal(SOURCE.managerBusRpcCall.arity, 2);
  assert.equal(SOURCE.uiTaskClass.arity, 1); assert.equal(SOURCE.managerTaskClass.arity, 1);
  // These exact descriptions include rpcCall's300000ms reject timer. No local
  // Completion, timeout cancellation or producer-drain receipt is issued here.
  assert.throws(() => { description("rpcCall(){return Promise.resolve({})}", "managerBusRpcCall"); });
  let traps = 0; const hostile = new Proxy({}, { ownKeys(): never { traps += 1; throw new Error("unreached"); } });
  assert.throws(() => decode(hostile, "managerRegisterGetCallback1")); assert.equal(traps, 0);
});
