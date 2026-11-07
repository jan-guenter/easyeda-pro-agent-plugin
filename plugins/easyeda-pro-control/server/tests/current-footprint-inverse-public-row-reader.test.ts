/** Actual readonly metadata/snapshots only; no original row issuer is used. */
import assert from "node:assert/strict";
import type { Runtime } from "node:inspector";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_FOOTPRINT_INVERSE_PUBLIC_ROW_READER_PROGRAMS as PROGRAMS, readCurrentFootprintInversePublicRow } from "../src/current-footprint-inverse-public-row-reader.ts";
import type { CurrentFootprintInversePublicRowValue as Row } from "../src/current-footprint-inverse-public-row-data.ts";

const expected: Row = { kind: "object", entries: [["uuid", { kind: "string", value: "selected" }], ["creator", { kind: "undefined" }], ["owner", { kind: "object", entries: [["uuid", { kind: "string", value: "owner" }], ["avatar", { kind: "null" }]] }], ["tags", { kind: "array", values: [{ kind: "string", value: "test" }] }]] };
void test("complete original-reference snapshots pass readonly Inspector without array or JSON hooks and refuse an equal-shaped replacement", async () => {
  const name = "inert-inverse-passive-row"; const realm = createContext({}, { name });
  runInContext('globalThis.effects=0;globalThis.I=[Object.getOwnPropertyDescriptor,Object.getPrototypeOf,Object.hasOwn,Object.getOwnPropertyNames,Object.getOwnPropertySymbols,Array.isArray,Function.prototype.apply,Object.prototype,Array.prototype,Function.prototype,globalThis];globalThis.row={uuid:"selected",creator:undefined,owner:{uuid:"owner",avatar:null},tags:["test"]};Object.defineProperty(Array.prototype,"0",{set(){effects++;throw "setter"},configurable:true});Array.prototype[Symbol.iterator]=function(){effects++;throw "iterator"};Object.defineProperty(Object.prototype,"toJSON",{value(){effects++;throw "JSON"},configurable:true});', realm);
  const session = new Session(); session.connect(); let contextId: number | null = null;
  session.on("Runtime.executionContextCreated", event => { if (event.params.context.name === name) { contextId = event.params.context.id; } });
  try {
    await session.post("Runtime.enable"); assert.ok(contextId !== null); const originalContextId = contextId;
    const object = async (expression: string): Promise<string> => { const raw = await session.post("Runtime.evaluate", { expression, contextId: originalContextId }); assert.equal(raw.exceptionDetails, undefined); assert.ok(typeof raw.result.objectId === "string"); return raw.result.objectId; };
    const receipt = await object("I"), row = await object("row");
    const bindings = { current: (): void => { assert.equal(runInContext("effects", realm), 0); }, properties: (objectId: string): Promise<Runtime.GetPropertiesReturnType> => session.post("Runtime.getProperties", { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false }), call: async (role: "capture" | "reprove", references: readonly string[], kind?: "Object" | "Array"): Promise<Runtime.CallFunctionOnReturnType> => { const args: Runtime.CallArgument[] = references.map(objectId => ({ objectId })); if (kind !== undefined) { args.push({ value: kind }); } const base: Runtime.CallFunctionOnParameterType = { objectId: receipt, functionDeclaration: PROGRAMS[role], arguments: args, returnByValue: role === "reprove", silent: true }; const checked = { ...base, throwOnSideEffect: true }; const raw = await session.post("Runtime.callFunctionOn", checked); assert.equal(raw.exceptionDetails, undefined); return raw; } };
    const result = await readCurrentFootprintInversePublicRow(row, expected, bindings); assert.equal(result.objects, 3); await result.reprove(); assert.equal(runInContext("effects", realm), 0);
    runInContext('row.owner={uuid:"owner",avatar:null}', realm); await assert.rejects(result.reprove); assert.equal(runInContext("effects", realm), 0);
  } finally { session.disconnect(); }
});
