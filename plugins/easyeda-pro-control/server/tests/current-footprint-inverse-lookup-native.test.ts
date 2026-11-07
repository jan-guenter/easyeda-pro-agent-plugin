/** Actual native metadata only; these values cannot issue an original receipt. */
import assert from "node:assert/strict";
import type { Runtime } from "node:inspector";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { qualifyCurrentFootprintInverseLookupNativeConstructor as constructor, qualifyCurrentFootprintInverseLookupNativeMethod as method } from "../src/current-footprint-inverse-lookup-native-metadata.ts";
import { CURRENT_FOOTPRINT_INVERSE_LOOKUP_NATIVE_PROGRAMS as PROGRAMS } from "../src/current-footprint-inverse-lookup-native-programs.ts";

void test("actual ECMAScript constructors/methods qualify while renamed builtins and JS timer/DOM implementations refuse", async () => {
  const session = new Session(); session.connect();
  try {
    const remote = async (expression: string): Promise<Runtime.RemoteObject> => { const result = await session.post("Runtime.evaluate", { expression, objectGroup: "inert-get-native" }); return result.result; };
    const properties = (value: Runtime.RemoteObject): Promise<Runtime.GetPropertiesReturnType> => { assert.ok(typeof value.objectId === "string"); return session.post("Runtime.getProperties", { objectId: value.objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false }); };
    for (const role of ["Object", "Array", "Function", "Symbol", "Promise", "Date", "ArrayBuffer", "SharedArrayBuffer", "Uint8ClampedArray", "String", "Number", "WeakRef", "TypedArray"] as const) { const value = await remote(role === "TypedArray" ? "Object.getPrototypeOf(Uint8ClampedArray)" : role); constructor(await properties(value), value, role); }
    for (const [role, expression] of [["hasInstance", "Function.prototype[Symbol.hasInstance]"], ["map", "Array.prototype.map"], ["hasOwnProperty", "Object.prototype.hasOwnProperty"], ["call", "Function.prototype.call"], ["species", "Object.getOwnPropertyDescriptor(Array,Symbol.species).get"], ["race", "Promise.race"], ["resolve", "Promise.resolve"], ["promiseThen", "Promise.prototype.then"], ["promiseCatch", "Promise.prototype.catch"], ["values", "Array.prototype.values"], ["deref", "WeakRef.prototype.deref"]] as const) { const value = await remote(expression); method(await properties(value), value, role); }
    const timer = await remote("setTimeout"); assert.throws(() => { method({}, timer, "setTimeout"); }); const blob = await remote("Blob"); assert.throws(() => constructor({}, blob, "Blob"));
    const realm = createContext({}); runInContext('Object.defineProperty(Object,"name",{value:"Date"});Object.defineProperty(Object,"length",{value:7});globalThis.changed=Object', realm); const key = "__inertRenamedNative"; Object.defineProperty(globalThis, key, { value: Reflect.get(realm, "changed"), configurable: true });
    try { const changed = await remote(`globalThis[${JSON.stringify(key)}]`); assert.equal(changed.description, "function Object() { [native code] }"); assert.throws(() => constructor({}, changed, "Date")); } finally { Reflect.deleteProperty(globalThis, key); }
  } finally { await session.post("Runtime.releaseObjectGroup", { objectGroup: "inert-get-native" }); session.disconnect(); }
});
void test("readonly passive capture rejects a global accessor without invocation and compares only actual Global wrapper identity", async () => {
  const name = "inert-get-native-global", realm = createContext({}, { name });
  runInContext('globalThis.effects=0;globalThis.I=[Object.getOwnPropertyDescriptor,Object.getPrototypeOf,Object.hasOwn,Object.getOwnPropertyNames,Object.getOwnPropertySymbols,Array.isArray,Function.prototype.apply,Object.prototype,Array.prototype,Function.prototype,globalThis];globalThis.clone=function clone(){};Object.defineProperty(globalThis,"Date",{get(){effects++;throw "getter"},configurable:true})', realm);
  const session = new Session(); session.connect(); let contextId: number | null = null; session.on("Runtime.executionContextCreated", event => { if (event.params.context.name === name) { contextId = event.params.context.id; } });
  try { await session.post("Runtime.enable"); assert.ok(contextId !== null); const originalContextId = contextId;
    const reference = async (expression: string): Promise<string> => { const raw = await session.post("Runtime.evaluate", { expression, contextId: originalContextId }); assert.ok(typeof raw.result.objectId === "string"); return raw.result.objectId; }; const receipt = await reference("I"); const clone = await reference("clone");
    const base: Runtime.CallFunctionOnParameterType = { objectId: receipt, functionDeclaration: PROGRAMS.roots, arguments: [], returnByValue: false, silent: true }; const checked = { ...base, throwOnSideEffect: true }; const rejected = await session.post("Runtime.callFunctionOn", checked); assert.ok(rejected.exceptionDetails !== undefined); assert.equal(runInContext("effects", realm), 0);
    const fields = await session.post("Runtime.getProperties", { objectId: clone, ownProperties: true }); const scope = fields.internalProperties?.find(row => row.name === "[[Scopes]]")?.value?.objectId; assert.ok(typeof scope === "string"); const scopes = await session.post("Runtime.getProperties", { objectId: scope, ownProperties: true }); const global = scopes.result.at(-1)?.value; assert.ok(global?.description === "Global" && typeof global.objectId === "string");
    const realmBase: Runtime.CallFunctionOnParameterType = { objectId: receipt, functionDeclaration: PROGRAMS.realm, arguments: [{ objectId: global.objectId }], returnByValue: true, silent: true }; const realmChecked = { ...realmBase, throwOnSideEffect: true }; const proof = await session.post("Runtime.callFunctionOn", realmChecked); assert.equal(proof.exceptionDetails, undefined); assert.equal(proof.result.value, true); assert.equal(runInContext("effects", realm), 0);
  } finally { session.disconnect(); }
});
void test("fixed ECMAScript hook projections run readonly and reject a changed species constructor without invoking it", async () => {
  const name = "inert-get-native-hooks", realm = createContext({}, { name });
  // This partial ECMAScript fixture deliberately does not supply browser DOM
  // Metadata or issue a complete graph. The separate constructor test refuses
  // Node's JS DOM/timer substitutes rather than treating them as browser natives.
  runInContext('globalThis.effects=0;globalThis.I=[Object.getOwnPropertyDescriptor,Object.getPrototypeOf,Object.hasOwn,Object.getOwnPropertyNames,Object.getOwnPropertySymbols,Array.isArray,Function.prototype.apply,Object.prototype,Array.prototype,Function.prototype,globalThis];globalThis.roots=[Object,Array,Function,Symbol,Promise,Date,ArrayBuffer,null,Object,Object,Uint8ClampedArray,null,String,Number,WeakRef,JSON,null,null,console,()=>true];Object.defineProperty(Array.prototype,"0",{set(){effects++;throw "setter"},configurable:true});', realm);
  const session = new Session(); session.connect(); let contextId: number | null = null; session.on("Runtime.executionContextCreated", event => { if (event.params.context.name === name) { contextId = event.params.context.id; } });
  try {
    await session.post("Runtime.enable"); assert.ok(contextId !== null); const originalContext = contextId;
    const ref = async (expression: string): Promise<string> => { const raw = await session.post("Runtime.evaluate", { expression, contextId: originalContext }); assert.ok(raw.result.objectId !== undefined); return raw.result.objectId; }; const receipt = await ref("I"), roots = await ref("roots");
    const call = (role: keyof typeof PROGRAMS, args: readonly string[], byValue = false): Promise<Runtime.CallFunctionOnReturnType> => { const base: Runtime.CallFunctionOnParameterType = { objectId: receipt, functionDeclaration: PROGRAMS[role], arguments: args.map(objectId => ({ objectId })), silent: true, returnByValue: byValue }; const checked = { ...base, throwOnSideEffect: true }; return session.post("Runtime.callFunctionOn", checked); };
    const prototypes = await call("prototypes", [roots]); assert.equal(prototypes.exceptionDetails, undefined); assert.ok(prototypes.result.objectId !== undefined);
    const flat = await call("merge", [roots, prototypes.result.objectId]); assert.equal(flat.exceptionDetails, undefined); assert.ok(flat.result.objectId !== undefined);
    const members = await call("members", [roots, flat.result.objectId]); assert.equal(members.exceptionDetails, undefined); assert.ok(members.result.objectId !== undefined);
    const valid = await call("hooks", [roots, members.result.objectId], true); assert.equal(valid.exceptionDetails, undefined); assert.equal(valid.result.value, true);
    const iterator = await call("iterator", [members.result.objectId]); assert.equal(iterator.exceptionDetails, undefined); assert.equal(iterator.result.description, "Array Iterator");
    runInContext('Object.defineProperty(Array.prototype,"constructor",{get(){effects++;throw "constructor"},configurable:true})', realm);
    const changed = await call("hooks", [roots, members.result.objectId], true); assert.ok(changed.exceptionDetails !== undefined); assert.equal(runInContext("effects", realm), 0);
  } finally { session.disconnect(); }
});
