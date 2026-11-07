/** Actual readonly descriptor selection, without a browser origin issuer. */
import assert from "node:assert/strict";
import type { Runtime } from "node:inspector";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_NATIVE_SERIALIZED_ORIGIN_PROGRAMS as P, qualifyCurrentNativeSerializedOriginFunction, qualifyCurrentNativeSerializedOriginPrototype } from "../src/current-native-serialized-origin.ts";

void test("readonly origin selection does not invoke JS getters, adopt data values or traverse a returned Proxy", async () => {
  const name = "inert-serialized-origin", realm = createContext({}, { name });
  runInContext('globalThis.effects=0;globalThis.I=[Object.getOwnPropertyDescriptor,Object.getPrototypeOf,Object.hasOwn,Object.getOwnPropertyNames,Object.getOwnPropertySymbols,Array.isArray,Function.prototype.apply,Object.prototype,Array.prototype,Function.prototype,globalThis];Object.defineProperty(globalThis,"origin",{get(){effects++;return"fixture"},configurable:true});globalThis.empty=[];', realm);
  const session = new Session(); session.connect(); let contextId: number | null = null; session.on("Runtime.executionContextCreated", event => { if (event.params.context.name === name) { contextId = event.params.context.id; } });
  try {
    await session.post("Runtime.enable"); assert.ok(contextId !== null); const originalContext = contextId;
    const reference = async (expression: string): Promise<string> => { const raw = await session.post("Runtime.evaluate", { expression, contextId: originalContext }); assert.ok(raw.result.objectId !== undefined); return raw.result.objectId; }; const receipt = await reference("I"); const root = await reference("globalThis"); const empty = await reference("empty");
    const properties = (objectId: string): Promise<Runtime.GetPropertiesReturnType> => session.post("Runtime.getProperties", { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
    const call = (role: keyof typeof P, references: readonly string[]): Promise<Runtime.CallFunctionOnReturnType> => { const base: Runtime.CallFunctionOnParameterType = { objectId: receipt, functionDeclaration: P[role], arguments: references.map(objectId => ({ objectId })), returnByValue: false, silent: true }; const checked = { ...base, throwOnSideEffect: true }; return session.post("Runtime.callFunctionOn", checked); };
    const snapshot = await call("step", [root, empty]); assert.equal(snapshot.exceptionDetails, undefined); assert.ok(snapshot.result.objectId !== undefined); const fields = await properties(snapshot.result.objectId); const getter = fields.result.find(field => field.name === "2")?.value; assert.ok(getter?.objectId !== undefined);
    assert.throws(() =>{  qualifyCurrentNativeSerializedOriginFunction({}, getter, "get"); }); assert.equal(runInContext("effects", realm), 0);
    const chain = await call("append", [empty, snapshot.result.objectId]); assert.equal(chain.exceptionDetails, undefined);
    runInContext('Object.defineProperty(globalThis,"origin",{value:"fixture",configurable:true});', realm); const data = await call("step", [root, empty]); assert.ok(data.exceptionDetails !== undefined); assert.equal(runInContext("effects", realm), 0);
    runInContext('delete globalThis.origin;Object.setPrototypeOf(globalThis,new Proxy({},{getPrototypeOf(){effects++;throw"prototype"},getOwnPropertyDescriptor(){effects++;throw"descriptor"}}));', realm);
    const parentStep = await call("step", [root, empty]); assert.equal(parentStep.exceptionDetails, undefined); assert.ok(parentStep.result.objectId !== undefined); const parentFields = await properties(parentStep.result.objectId); const parent = parentFields.result.find(field => field.name === "1")?.value; assert.equal(parent?.subtype, "proxy"); assert.throws(() =>{  qualifyCurrentNativeSerializedOriginPrototype({}, parent); }); assert.equal(runInContext("effects", realm), 0);
    for (const program of Object.values(P)) { assert.equal(program.includes("\0"), false); }
  } finally { session.disconnect(); }
});

void test("renaming a genuine native getter cannot supply serialized-origin metadata", async () => {
  const realm = createContext({}); runInContext('globalThis.getter=Object.getOwnPropertyDescriptor(Array,Symbol.species).get;Object.defineProperty(getter,"name",{value:"get origin"})', realm); const key = "__inertOriginNativeGetter"; Object.defineProperty(globalThis, key, { value: Reflect.get(realm, "getter"), configurable: true }); const session = new Session(); session.connect();
  try { const raw = await session.post("Runtime.evaluate", { expression: `globalThis.${key}` }); assert.equal(raw.result.description, "function get [Symbol.species]() { [native code] }"); assert.throws(() =>{  qualifyCurrentNativeSerializedOriginFunction({}, raw.result, "get"); }); } finally { Reflect.deleteProperty(globalThis, key); session.disconnect(); }
});
