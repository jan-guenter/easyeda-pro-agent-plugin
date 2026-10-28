/** Local V8 and hostile descriptor tests. These do not establish a browser
 * CacheStorage namespace or an EasyEDA backend/notification owner. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { isRecord } from "../src/core.ts";
import { decodeCurrentFootprintCopyBackendCacheNativeProperties } from "../src/current-footprint-copy-backend-cache.ts";
import { CURRENT_FOOTPRINT_COPY_BACKEND_CACHE_PROFILES as PROFILES } from "../src/current-footprint-copy-backend-cache-profiles.ts";
import { decodeCurrentFootprintCopyDependencyFunction } from "../src/current-footprint-copy-dependency-bindings.ts";
import { CURRENT_FOOTPRINT_COPY_BACKEND_CACHE_FIXTURE as SOURCES } from "./helpers/current-footprint-copy-backend-cache-fixture.ts";
import { backendCacheNativeMetadata } from "./helpers/current-footprint-copy-backend-cache-metadata.ts";

void test("exact bb wrapper methods and constructor match actual V8 metadata without executing cache I/O", async () => {
  const session = new Session(); session.connect();
  try {
    await session.post("Runtime.enable");
    for (const [index, profile] of PROFILES.entries()) {
      const source = SOURCES[index]; assert.ok(source !== undefined);
      const isClass = profile.kind === "class";
      const insertion = isClass ? 9 : 2;
      const offset = source.indexOf("(");
      const prefix = `"use strict";${"\n".repeat(profile.lineNumber)}${" ".repeat(profile.columnNumber - offset - insertion)}`;
      const expression = isClass ? `const bb=${source};bb` : `({${source}})[${JSON.stringify(profile.name)}]`;
      const reply = await session.post("Runtime.evaluate", { expression: prefix + expression, objectGroup: "backend-cache-methods" });
      assert.equal(reply.exceptionDetails, undefined); const id = reply.result.objectId; assert.ok(id !== undefined);
      const metadata = await session.post("Runtime.getProperties", { objectId: id, ownProperties: true });
      const point: unknown = metadata.internalProperties?.find(item => item.name === "[[FunctionLocation]]")?.value?.value;
      assert.ok(isRecord(point)); const scriptId = point["scriptId"]; assert.equal(typeof scriptId, "string");
      assert.doesNotThrow(() => { decodeCurrentFootprintCopyDependencyFunction(metadata, String(scriptId), index + 53); }, profile.key);
      assert.throws(() => { decodeCurrentFootprintCopyDependencyFunction(metadata, "foreign", index + 53); });
    }
  } finally {
    try { await session.post("Runtime.releaseObjectGroup", { objectGroup: "backend-cache-methods" }); } finally { session.disconnect(); }
  }
});

void test("native cache metadata refuses lookalikes, located methods, bound functions and extra fields", () => {
  for (const index of [0, 1, 2, 3]) {
    const original = backendCacheNativeMetadata(index); decodeCurrentFootprintCopyBackendCacheNativeProperties(original, index);
    for (const change of ["location", "scope", "bound", "own"] as const) {
      const copy = structuredClone(original), internals = copy["internalProperties"], own = copy["result"];
      assert.ok(Array.isArray(internals) && Array.isArray(own));
      if (change === "location") { internals.push({ name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: { scriptId: "foreign" } } }); }
      if (change === "scope") { const scopes: unknown = internals[1]; assert.ok(isRecord(scopes) && isRecord(scopes["value"])); scopes["value"]["description"] = "Scopes[1]"; }
      if (change === "bound") { internals[1] = { name: "[[TargetFunction]]", value: { type: "function", objectId: "target" } }; }
      if (change === "own") { own.push({ name: "replacement", value: { type: "boolean", value: true }, isOwn: true, writable: true, enumerable: true, configurable: true }); }
      assert.throws(() => { decodeCurrentFootprintCopyBackendCacheNativeProperties(copy, index); }, change);
    }
  }
  assert.throws(() => { decodeCurrentFootprintCopyBackendCacheNativeProperties(backendCacheNativeMetadata(0), -0); });
});
