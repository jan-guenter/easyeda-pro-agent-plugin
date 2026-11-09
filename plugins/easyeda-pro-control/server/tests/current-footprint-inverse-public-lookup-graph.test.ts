/* oxlint-disable import/max-dependencies -- Source metadata, inert observer/graph execution and the configured installed-source gate are independent test obligations. */
import {INSTALLED_EASYEDA_SOURCE_SKIP_REASON} from "./helpers/installed-easyeda-source.ts";
import assert from "node:assert/strict";
import type { Runtime } from "node:inspector";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_FOOTPRINT_INVERSE_PUBLIC_LOOKUP_GRAPH_ROLES as ROLES, CURRENT_FOOTPRINT_INVERSE_PUBLIC_LOOKUP_GRAPH_SOURCE as S, qualifyCurrentFootprintInversePublicLookupGraphSource, requireCurrentFootprintInversePublicLookupGraphDescription } from "../src/current-footprint-inverse-public-lookup-graph-source.ts";
import { decodeCurrentFootprintInversePublicLookupGraphFunction } from "../src/current-footprint-inverse-public-lookup-graph-replies.ts";
import { CURRENT_FOOTPRINT_INVERSE_PUBLIC_LOOKUP_PROGRAMS as P } from "../src/current-footprint-inverse-public-lookup-programs.ts";
import { currentFootprintInverseLookupScopes } from "../src/current-footprint-inverse-lookup-preentry-replies.ts";
import { currentInverseLookupGraphRealm, currentInverseLookupGraphSources } from "./fixtures/current-footprint-inverse-public-lookup-graph.ts";

function readOnlyCall(session: Session, params: Runtime.CallFunctionOnParameterType): Promise<Runtime.CallFunctionOnReturnType> { const checked = { ...params, throwOnSideEffect: true }; return session.post("Runtime.callFunctionOn", checked); }
async function available(context:TestContext):Promise<boolean>{if(await currentInverseLookupGraphSources()===null){context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON);return false;}return true;}
void test("all fifteen uninvoked lookup graph declarations preserve original source coordinates and actual Node metadata", async context => {
  if (!await available(context)) { return; } assert.equal(process.versions.node, "24.18.0"); const full = await currentInverseLookupGraphSources(); assert.ok(full!==null);for (const file of ["ui", "preload", "manager"] as const) { qualifyCurrentFootprintInversePublicLookupGraphSource(full[file], file); }
  const session = new Session(); session.connect(); const key = "__inverseLookupGraphFunction";
  try {
    for (const role of ROLES) { const row = S[role]; const original = full[row.file]; const fragment = original.slice(row.start, row.end); let prefix = "", suffix = "";
      if (row.syntax === "method" || row.syntax === "property") { const property = row.name.replace(/^get /u, ""); const getter = row.name.startsWith("get "); const staticMethod = fragment.startsWith("static "); prefix = row.syntax === "method" ? "const __holder=class{" : "const __holder={"; const target = staticMethod || row.syntax === "property" ? "__holder" : "__holder.prototype"; suffix = `};globalThis.__selected=Object.getOwnPropertyDescriptor(${target},${JSON.stringify(property)}).${getter ? "get" : "value"};`; }
      else if (row.kind === "arrow") { prefix = "(fn=>globalThis.__selected=fn)("; suffix = ");"; }
      else { suffix = `;globalThis.__selected=${row.name};`; }
      // Positions come from the original source span, never the expected
      // FunctionLocation. A wrong parameter-point pin must fail the decoder.
      let inert = original.slice(0, row.end).replaceAll(/[^\r\n]/gu, " "); inert = inert.slice(0, row.start - prefix.length) + prefix + fragment + suffix; if (row.strict) { inert = `"use strict";${inert.slice(13)}`; }
      const realm = createContext({}); runInContext(inert, realm); const fn: unknown = Reflect.get(realm, "__selected"); assert.equal(typeof fn, "function"); Object.defineProperty(globalThis, key, { value: fn, configurable: true });
      const value = await session.post("Runtime.evaluate", { expression: `globalThis[${JSON.stringify(key)}]`, objectGroup: "inert-inverse-lookup-graph" }); const id = value.result.objectId; assert.ok(typeof id === "string"); requireCurrentFootprintInversePublicLookupGraphDescription(value.result.description ?? "", role);
      const raw = await session.post("Runtime.getProperties", { objectId: id, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false }); const decoded = decodeCurrentFootprintInversePublicLookupGraphFunction(raw, role); assert.equal(typeof decoded.scopes, "string"); assert.throws(() => decodeCurrentFootprintInversePublicLookupGraphFunction(raw, role, "foreign-script"));
    }
  } finally { Reflect.deleteProperty(globalThis, key); await session.post("Runtime.releaseObjectGroup", { objectGroup: "inert-inverse-lookup-graph" }); session.disconnect(); }
});
void test("staged lookup reads original initialized registry and GET task without invoking an initializer or getter", async context => {
  if (!await available(context)) { return; } const realm = await currentInverseLookupGraphRealm(); assert.equal(runInContext(`(${P.membership}).call(selected,roots,context,original,"a".repeat(64))`, realm), true); assert.equal(runInContext("selected.length", realm), 25); assert.equal(runInContext(`(${P.same}).call(selected)`, realm), true);
  runInContext('extendLibManager._map.set("a".repeat(64),{})', realm); assert.throws(() => runInContext(`(${P.membership}).call(selected,roots,context,original,"a".repeat(64))`, realm));
  const fresh = await currentInverseLookupGraphRealm(); runInContext('Object.defineProperty(scope.object.Lo,"bus",{get(){effects++;throw "hook"},configurable:true})', fresh); assert.throws(() => runInContext(`(${P.same}).call(selected)`, fresh)); assert.equal(runInContext("effects", fresh), 0);
});
void test("actual complete named registry class exposes only its private class and Po closure joins", async context => {
  if (!await available(context)) { return; } const full=await currentInverseLookupGraphSources();assert.ok(full!==null);const{ui}=full; const classStart = 6_122_497; const classEnd = 6_123_453; assert.ok(ui.slice(classStart, classEnd).startsWith("class kgt{"));
  const blank = ui.replaceAll(/[^\r\n]/gu, " "); const prefix = "(()=>{"; let inert = prefix + blank.slice(prefix.length); const po = S.contextProducer; inert = inert.slice(0, po.start) + ui.slice(po.start, po.end) + inert.slice(po.end); const declaration = "const __registry="; inert = inert.slice(0, classStart - declaration.length) + declaration + ui.slice(classStart, classEnd) + inert.slice(classEnd); inert += ';globalThis.__registryGetter=Object.getOwnPropertyDescriptor(__registry,"context").get;globalThis.__registryClass=__registry;globalThis.__registryPo=Po;})()';
  const realm = createContext({}); runInContext(inert, realm); const getter: unknown = Reflect.get(realm, "__registryGetter"); const registry: unknown = Reflect.get(realm, "__registryClass"); const poFunction: unknown = Reflect.get(realm, "__registryPo"); const session = new Session(); session.connect(); const key = "__inverseNamedRegistry", rootsKey = "__inverseNamedRegistryRoots"; Object.defineProperty(globalThis, key, { value: getter, configurable: true }); Object.defineProperty(globalThis, rootsKey, { value: [null, registry, null, null, null, null, poFunction, null, (): boolean => true], configurable: true });
  try {
    const remote = await session.post("Runtime.evaluate", { expression: `globalThis[${JSON.stringify(key)}]`, objectGroup: "inert-named-registry" }); assert.ok(typeof remote.result.objectId === "string"); const raw = await session.post("Runtime.getProperties", { objectId: remote.result.objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false }); const decoded = decodeCurrentFootprintInversePublicLookupGraphFunction(raw, "registryContext");
    const scopes = await session.post("Runtime.getProperties", { objectId: decoded.scopes, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false }); assert.deepEqual(scopes.result.map(field => field.value?.description), ["Block", "Closure", "Global"]); assert.equal(currentFootprintInverseLookupScopes(scopes).length, 2); const ids = scopes.result.slice(0, 2).map(field => field.value?.objectId); assert.ok(typeof ids[0] === "string" && typeof ids[1] === "string");
    const roots = await session.post("Runtime.evaluate", { expression: `globalThis[${JSON.stringify(rootsKey)}]`, objectGroup: "inert-named-registry" }); const rootsId = roots.result.objectId; assert.ok(typeof rootsId === "string");
    for (const [index, program] of [P.classScope, P.contextScope].entries()) { const id = ids[index]; assert.ok(typeof id === "string"); const proof = await readOnlyCall(session, { objectId: id, functionDeclaration: program, arguments: [{ objectId: rootsId }], returnByValue: true, silent: true }); assert.equal(proof.exceptionDetails, undefined); assert.equal(proof.result.value, true); }
  } finally { Reflect.deleteProperty(globalThis, key); Reflect.deleteProperty(globalThis, rootsKey); await session.post("Runtime.releaseObjectGroup", { objectGroup: "inert-named-registry" }); session.disconnect(); }
});
