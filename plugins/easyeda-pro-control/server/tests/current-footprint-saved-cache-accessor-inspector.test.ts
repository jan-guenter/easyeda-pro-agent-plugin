/** Actual Node24 inspector execution in a synthetic realm. Node V8 is not
 * Chrome146; this supplies no native CacheStorage or replay qualification. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_FOOTPRINT_SAVED_CACHE_ACCESSOR_PROBE_CALLS as CALLS, CURRENT_FOOTPRINT_SAVED_CACHE_ACCESSOR_PROBE_GROUP as GROUP,
  decodeCurrentFootprintSavedCacheAccessorProbeArray } from "../src/current-footprint-saved-cache-accessor-probe.ts";

async function bounded<T>(operation: Promise<T>): Promise<T> {
  const expired = Promise.withResolvers<never>();
  const timer = setTimeout(() => { expired.reject(new Error("SAVED_CACHE_SYNTHETIC_INSPECTOR_DEADLINE")); }, 5000);
  try { return await Promise.race([operation, expired.promise]); } finally { clearTimeout(timer); }
}

void test("Node inspector accepts the five-slot descriptor tuple with side-effect checks and rejects changed handles", { timeout: 20_000 }, async () => {
  const name = "saved-cache-accessor-descriptor-tuple-synthetic";
  const realm = createContext({}, { name });
  runInContext(`let calls=0,getters=0;
globalThis.PRO_EDITOR_VERSION='3.2.209';
globalThis.gVars={currentProject:{projectId:undefined,branchUuid:''}};
globalThis.UI={tabBar:{currentTabId:'tab_page1'}};
globalThis.CacheStorage=class CacheStorage{
constructor(){calls++;throw Error('synthetic constructor must not run');}
match(){calls++;throw Error('synthetic match must not run');}};
Object.defineProperty(globalThis,'caches',{get(){getters++;throw Error('synthetic caches getter must not run');}});`, realm);
  const session = new Session();
  const contexts: { id: number; name: string }[] = [];
  let connected = false;
  try {
    session.connect(); connected = true;
    session.on("Runtime.executionContextCreated", event => { contexts.push(event.params.context); });
    await bounded(session.post("Runtime.enable"));
    const original = contexts.find(context => context.name === name); assert.ok(original !== undefined);
    const flags = { objectGroup: GROUP, silent: true, generatePreview: false, throwOnSideEffect: true,
      awaitPromise: false, userGesture: false, arguments: [], timeout: 2000 };
    // V8 rejects this builtin even when its target array was just allocated.
    // The maintained selector must succeed without this operation or a weaker guard.
    const propertyMutation = await bounded(session.post("Runtime.callFunctionOn", { ...flags,
      executionContextId: original.id, functionDeclaration: 'function(){const a=[];Object.defineProperty(a,"baseline",{value:"x"});return a;}', returnByValue: false }));
    assert.equal(propertyMutation.result.className, "EvalError");
    assert.ok(propertyMutation.exceptionDetails?.exception?.description?.startsWith("EvalError: Possible side-effect in debug-evaluate") === true);

    const captured = await bounded(session.post("Runtime.callFunctionOn", { ...flags,
      executionContextId: original.id, functionDeclaration: CALLS.capture, returnByValue: false }));
    assert.equal(captured.exceptionDetails, undefined);
    assert.equal(captured.result.description, "Array(5)");
    const objectId = captured.result.objectId; assert.ok(objectId !== undefined);
    const properties = await bounded(session.post("Runtime.getProperties", {
      objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false,
    }));
    const selected = decodeCurrentFootprintSavedCacheAccessorProbeArray(properties);
    assert.deepEqual(properties.result.map(property => property.name).toSorted(), ["0", "1", "2", "3", "4", "length"]);
    const baseline = properties.result.find(property => property.name === "4"); assert.ok(baseline !== undefined);
    assert.equal(baseline.writable, true); assert.equal(baseline.enumerable, true); assert.equal(baseline.configurable, true);
    assert.equal(baseline.value?.value, selected.baseline);
    const checked = await bounded(session.post("Runtime.callFunctionOn", {
      ...flags, objectId, functionDeclaration: CALLS.recheck, returnByValue: true,
    }));
    assert.equal(checked.exceptionDetails, undefined); assert.equal(checked.result.type, "string");
    assert.equal(checked.result.value, selected.baseline);
    assert.equal(runInContext("JSON.stringify({calls,getters})", realm), '{"calls":0,"getters":0}');

    runInContext("CacheStorage.prototype.match=function replacement(){}", realm);
    const replaced = await bounded(session.post("Runtime.callFunctionOn", {
      ...flags, objectId, functionDeclaration: CALLS.recheck, returnByValue: true,
    }));
    assert.equal(replaced.result.className, "Error");
    assert.ok(replaced.exceptionDetails?.exception?.description?.startsWith("Error: SAVED_CACHE_ACCESSOR_PROBE") === true);
    assert.equal(runInContext("JSON.stringify({calls,getters})", realm), '{"calls":0,"getters":0}');
  } finally {
    try {
      if (connected) { await bounded(session.post("Runtime.releaseObjectGroup", { objectGroup: GROUP })); }
    } finally { session.disconnect(); }
  }
});
