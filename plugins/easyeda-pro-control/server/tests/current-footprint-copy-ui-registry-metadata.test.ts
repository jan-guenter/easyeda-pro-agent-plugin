/** Synthetic malformed CDP replies. No JSON reply recreates native authority. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { decodeCurrentFootprintCopyUiRegistryArray, decodeCurrentFootprintCopyUiRegistryClassScope, decodeCurrentFootprintCopyUiRegistryFunction } from "../src/current-footprint-copy-ui-registry-metadata.ts";
import { CURRENT_FOOTPRINT_COPY_UI_REGISTRY_CAPTURE_ORDER as ORDER, CURRENT_FOOTPRINT_COPY_UI_REGISTRY_SOURCE as SOURCE } from "../src/current-footprint-copy-ui-registry-source.ts";
import type { CurrentFootprintCopyUiRegistryFunction } from "../src/current-footprint-copy-ui-registry-source.ts";
import { FOOTPRINT_COPY_UI_REGISTRY_FIXTURE as FIXTURE } from "./current-footprint-copy-ui-registry-fixture.ts";

type Data = Record<string, unknown>;
interface Reply { result: Data[]; internalProperties: Data[] }
function property(name: string, value: Data, writable = false, enumerable = false, configurable = true): Data {
  return { name, value, writable, enumerable, configurable, isOwn: true };
}
function nativeFunction(role: CurrentFootprintCopyUiRegistryFunction): Data {
  return { type: "function", className: "Function", objectId: role, description: FIXTURE[role] };
}
function metadata(role: CurrentFootprintCopyUiRegistryFunction): Reply {
  const profile = SOURCE.functions[role], result = [property("name", { type: "string", value: profile.name }),
    property("length", { type: "number", value: profile.arity })];
  if (role === "registryConstructor") {
    result.push(property("prototype", { type: "object", className: "Object", description: "Object", objectId: "class-prototype" }, false, false, false),
      property("LIB_ID_PREFFIX", { type: "string", value: "extend_lib_" }, true, true),
      property("getInstance", nativeFunction("registryInstance"), true),
      { name: "context", get: nativeFunction("registryContext"), set: { type: "undefined" }, enumerable: false, configurable: true, isOwn: true });
  } else if (role === "contextProducer") {
    result.push(property("prototype", { type: "object", className: "Object", description: "Object", objectId: "function-prototype" }, true, false, false));
  }
  return { result, internalProperties: [
    { name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: { scriptId: "preload", lineNumber: profile.lineNumber, columnNumber: profile.columnNumber } } },
    { name: "[[Prototype]]", value: { type: "function", className: "Function", objectId: "native-function" } },
    { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", description: "Scopes[2]", objectId: `${role}-scopes` } },
  ] };
}
function bundle(): Reply {
  const result = Array.from({ length: 8 }, (_, index) => {
    const role = ORDER[index];
    const value = role === undefined ? { type: "object", objectId: `object-${String(index)}`, className: ["Object", "sl", "Map", "Array"][index - 4],
      ...(index === 6 ? { subtype: "map" } : {}), ...(index === 7 ? { subtype: "array", description: "Array(7)" } : {}) } : nativeFunction(role);
    return property(String(index), value, true, true);
  });
  result.push(property("length", { type: "number", value: 8 }, true, false, false));
  return { result, internalProperties: [{ name: "[[Prototype]]", value: { type: "object", subtype: "array", className: "Array", description: "Array(0)", objectId: "array-prototype" } }] };
}
function scopes(): { result: Data[] } {
  return { result: ["Block", "Closure", "Global"].map((description, index) =>
    property(String(index), { type: "object", subtype: "internal#scope", className: "Object", description, objectId: `scope-${String(index)}` }, true, true)) };
}
const refusal = /FOOTPRINT_COPY_UI_REGISTRY_METADATA/u;

void test("registry metadata preserves class static descriptors and fixed array function order", () => {
  for (const role of [...ORDER, "contextProducer"] as const) {
    assert.deepEqual(decodeCurrentFootprintCopyUiRegistryFunction(metadata(role), role, "preload"), { scriptId: "preload", scopesId: `${role}-scopes` });
  }
  assert.deepEqual(decodeCurrentFootprintCopyUiRegistryArray(bundle()), ORDER);
});

void test("class metadata rejects writable prototype, missing static prefix, substituted getter and extra fields", () => {
  for (const mutate of [
    (reply: Reply): void => { const field = reply.result.find(item => item["name"] === "prototype"); assert.ok(field !== undefined); field["writable"] = true; },
    (reply: Reply): void => { reply.result = reply.result.filter(item => item["name"] !== "LIB_ID_PREFFIX"); },
    (reply: Reply): void => { const field = reply.result.find(item => item["name"] === "context"); assert.ok(field !== undefined); field["get"] = nativeFunction("registryInstance"); },
    (reply: Reply): void => { reply.result.push(property("unknown", { type: "number", value: 0 })); },
    (reply: Reply): void => { reply.internalProperties.copyWithin(1, 0, 1); },
  ]) {
    const reply = metadata("registryConstructor"); mutate(reply);
    assert.throws(() => decodeCurrentFootprintCopyUiRegistryFunction(reply, "registryConstructor", "preload"), refusal);
  }
  const legacy = metadata("contextProducer");
  for (const name of ["arguments", "caller"]) { legacy.result.push(property(name, { type: "object", subtype: "null", value: null }, false, false, false)); }
  assert.throws(() => decodeCurrentFootprintCopyUiRegistryFunction(legacy, "contextProducer", "preload"), refusal);
  assert.deepEqual(SOURCE.targetFunctionMetadata.contextProducerOwnProperties, ["length", "name", "prototype"]);
  assert.equal(SOURCE.targetFunctionMetadata.legacyOwnCallerArgumentsAdmitted, false);
  assert.equal(SOURCE.targetFunctionMetadata.connectedFunctionRosterVerified, false);
});

void test("class scope chain requires its distinct Block, preload Closure and final Global", () => {
  assert.deepEqual(decodeCurrentFootprintCopyUiRegistryClassScope(scopes()), { blockScopeId: "scope-0", closureScopeId: "scope-1" });
  for (const mutate of [
    (reply: { result: Data[] }): void => { reply.result.shift(); },
    (reply: { result: Data[] }): void => { reply.result.reverse(); },
    (reply: { result: Data[] }): void => { reply.result.copyWithin(1, 0, 1); },
  ]) {
    const reply = scopes(); mutate(reply); assert.throws(() => decodeCurrentFootprintCopyUiRegistryClassScope(reply), refusal);
  }
});

void test("registry arrays reject wrong source, aliasing, accessors, proxies and incomplete original objects", () => {
  for (const mutate of [
    (reply: Reply): void => { const item = reply.result[0]; assert.ok(item !== undefined); item["value"] = nativeFunction("registryHas"); },
    (reply: Reply): void => { reply.result.copyWithin(1, 0, 1); },
    (reply: Reply): void => { reply.result.pop(); },
    (reply: Reply): void => { const item = reply.result[6]; assert.ok(item !== undefined); item["value"] = { type: "object", className: "Object", objectId: "object-6" }; },
  ]) {
    const reply = bundle(); mutate(reply); assert.throws(() => decodeCurrentFootprintCopyUiRegistryArray(reply), refusal);
  }
  let calls = 0;
  const accessor = Object.defineProperty({}, "result", { get(): never { calls += 1; throw new Error("must not inspect"); } });
  const proxy = new Proxy({}, { ownKeys(): never { calls += 1; throw new Error("must not inspect"); } });
  for (const value of [accessor, proxy]) {
    assert.throws(() => decodeCurrentFootprintCopyUiRegistryArray(value), refusal);
    assert.throws(() => decodeCurrentFootprintCopyUiRegistryFunction(value, "registryConstructor", "preload"), refusal);
  }
  assert.equal(calls, 0);
});
