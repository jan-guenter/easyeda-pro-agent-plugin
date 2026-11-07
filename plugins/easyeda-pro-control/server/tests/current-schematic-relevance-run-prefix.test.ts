/** Actual Inspector metadata on isolated inert values. No CAD, original
 * owner, bridge, helper, application action or durability is established. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_SCHEMATIC_RELEVANCE_RUN_PREFIX_CALLS as CALLS, CURRENT_SCHEMATIC_RELEVANCE_RUN_PREFIX_FLAGS as FLAGS, currentSchematicRelevanceRunPrefixExpression, validateCurrentSchematicRelevanceRunPrefixCommand } from "../src/current-schematic-relevance-run-prefix-protocol.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_PREFIX_NATIVE_FUNCTIONS as NATIVES, currentSchematicRelevancePrefixCapture, currentSchematicRelevancePrefixHandle, currentSchematicRelevancePrefixNativeFunction, currentSchematicRelevancePrefixProperties, currentSchematicRelevancePrefixTuple } from "../src/current-schematic-relevance-run-prefix-replies.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_PREFIX_QUEUE_PROGRAMS as QUEUE } from "../src/current-schematic-relevance-action-prefix-queue-programs.ts";

void test("fixed prefix grammar rejects caller expressions, program changes and indexed argument substitution", () => {
  const frame = { phase: "prefix-frame", role: "run", variant: 0, method: "Debugger.evaluateOnCallFrame", params: { ...FLAGS, callFrameId: "original_frame", expression: currentSchematicRelevanceRunPrefixExpression("run", 0), returnByValue: false, includeCommandLineAPI: false } };
  assert.equal(validateCurrentSchematicRelevanceRunPrefixCommand(frame).phase, "prefix-frame");
  assert.throws(() => validateCurrentSchematicRelevanceRunPrefixCommand({ ...frame, params: { ...frame.params, expression: "this.modify()" } }));
  for (const row of CALLS) {
    const args = Array.from({ length: row[2] }, (_value, index) => row[0] === "select" && index === 1 ? { value: 0 } : { objectId: "original_value" });
    const command = { phase: "prefix-call", role: row[0], method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: "original_receiver", functionDeclaration: row[1], arguments: args, returnByValue: row[3], awaitPromise: false, userGesture: false } };
    assert.equal(validateCurrentSchematicRelevanceRunPrefixCommand(command).phase, "prefix-call");
    assert.throws(() => validateCurrentSchematicRelevanceRunPrefixCommand({ ...command, params: { ...command.params, functionDeclaration: `${row[1]} ` } }));
    assert.throws(() => validateCurrentSchematicRelevanceRunPrefixCommand({ ...command, params: { ...command.params, arguments: [{ value: 1 }, ...args.slice(1)] } }));
  }
});
void test("actual native member metadata, nullable prototype roots and Proxy rejection use original Inspector packets", async () => {
  assert.equal(process.versions.node, "24.18.0");
  const context = createContext({});
  runInContext(`globalThis.native=[Object.getOwnPropertyDescriptor,Object.getOwnPropertyDescriptors,Object.getPrototypeOf,Object.is,Object.hasOwn,Reflect.ownKeys,Reflect.apply,Array.isArray,Map.prototype.get,Map.prototype.has,Map.prototype.forEach,Object.getOwnPropertyDescriptor(Map.prototype,"size").get,Set.prototype.has,Set.prototype.forEach,Object.getOwnPropertyDescriptor(Set.prototype,"size").get,Object.prototype,Array.prototype,Map.prototype,Set.prototype];globalThis.extra=[Reflect,Array,Set,WeakMap,String,Error,Promise,Number,Symbol,WeakRef];globalThis.prototypes=(${QUEUE.intrinsicPrototypes}).call(extra,native);globalThis.run=Array(14).fill(null);run[10]=Object.prototype.toString;globalThis.qualified=[];for(const tuple of [extra,prototypes,native,[Object.prototype.toString,Function.prototype]])for(let value of tuple){while(value!==null&&(typeof value==="object"||typeof value==="function")){if(!qualified.includes(value))qualified.push(value);value=Object.getPrototypeOf(value);}}globalThis.members=(${QUEUE.intrinsicMembers}).call(extra,native,prototypes,qualified,Function.prototype,run);globalThis.traps=0;globalThis.proxy=new Proxy({},{ownKeys(){traps++;throw Error("trap")}});`, context);
  const session = new Session(); session.connect(); const key = "__inertOriginalRunPrefix";
  Object.defineProperty(globalThis, key, { value: context, configurable: true });
  try {
    const actual = await session.post("Runtime.evaluate", { expression: `globalThis.${key}.members`, objectGroup: FLAGS.objectGroup });
    const array = currentSchematicRelevancePrefixCapture(actual);
    const fields = currentSchematicRelevancePrefixTuple(await session.post("Runtime.getProperties", { objectId: array, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false }), 38);
    for (const [index, profile] of NATIVES.entries()) {
      const item = fields[index]; assert.ok(item !== undefined); assert.equal(item.description, `function ${profile[0]}() { [native code] }`);
      const packet = await session.post("Runtime.getProperties", { objectId: currentSchematicRelevancePrefixHandle(item), ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
      currentSchematicRelevancePrefixNativeFunction(packet, profile);
      assert.throws(() => { currentSchematicRelevancePrefixNativeFunction(packet, ["forged", profile[1]]); });
    }
    for (const expression of [`globalThis.${key}.native[15]`, `globalThis.${key}.proxy`]) {
      const result = await session.post("Runtime.evaluate", { expression }); assert.ok(typeof result.result.objectId === "string");
      const packet = await session.post("Runtime.getProperties", { objectId: result.result.objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
      if (expression.endsWith("proxy")) { assert.throws(() => currentSchematicRelevancePrefixProperties(packet)); }
      else { assert.equal(currentSchematicRelevancePrefixProperties(packet).internalProperties, undefined); }
    }
    assert.equal(runInContext("traps", context), 0);
  } finally { Reflect.deleteProperty(globalThis, key); await session.post("Runtime.releaseObjectGroup", { objectGroup: FLAGS.objectGroup }); session.disconnect(); }
});
void test("Map iterator projection preserves the application map under the production side-effect flag", async () => {
  const session = new Session(); session.connect();
  const context = createContext({}); const key = "__inertPrefixMapIterator";
  runInContext("globalThis.map=new Map([[1,{}]]);globalThis.native=[,,,,,,Reflect.apply,,,,,,,,,,,Map.prototype];globalThis.members=Array(38).fill(null);members[20]=Map.prototype.entries;native[2]=Object.getPrototypeOf", context);
  Object.defineProperty(globalThis, key, { value: context, configurable: true });
  try {
    const values: string[] = [];
    for (const field of ["map", "native", "members"]) { const value = await session.post("Runtime.evaluate", { expression: `globalThis.${key}.${field}` }); assert.ok(typeof value.result.objectId === "string"); values.push(value.result.objectId); }
    const row = CALLS.find(value => value[0] === "map-iterator"); assert.ok(row !== undefined && values[0] !== undefined && values[1] !== undefined && values[2] !== undefined);
    const reply = await session.post("Runtime.callFunctionOn", { ...FLAGS, objectId: values[0], functionDeclaration: row[1], arguments: [{ objectId: values[1] }, { objectId: values[2] }], returnByValue: false, awaitPromise: false, userGesture: false });
    const tuple = currentSchematicRelevancePrefixCapture(reply);
    assert.equal(currentSchematicRelevancePrefixTuple(await session.post("Runtime.getProperties", { objectId: tuple, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false }), 3).length, 3);
    assert.equal(runInContext("map.size===1&&map.has(1)", context), true);
  } finally { Reflect.deleteProperty(globalThis, key); await session.post("Runtime.releaseObjectGroup", { objectGroup: FLAGS.objectGroup }); session.disconnect(); }
});
