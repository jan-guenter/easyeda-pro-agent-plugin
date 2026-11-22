/** Real local Inspector executes only fixed readonly projections on an inert
 * VM graph. Synthetic metadata drives finite ordering; neither admits EasyEDA. */
/* oxlint-disable import/max-dependencies -- The original origin refusal, immutable aggregate budget and separate native transport families are independently tested. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import type { Runtime } from "node:inspector";
import { test } from "node:test";
import { z } from "zod";
import { CURRENT_SCHEMATIC_WIRE_DEPENDENCY_NATIVE_ROLES as ROLES } from "../src/current-schematic-wire-dependencies-programs.ts";
import { CURRENT_SCHEMATIC_WIRE_DEPENDENCY_CALLS as CALLS, CURRENT_SCHEMATIC_WIRE_DEPENDENCY_FLAGS as FLAGS, CURRENT_SCHEMATIC_WIRE_DEPENDENCY_REQUESTS as REQUESTS,
  currentSchematicWireDependencyCases, requireCurrentSchematicWireDependencyArguments, validateCurrentSchematicWireDependencyCommand } from "../src/current-schematic-wire-dependencies-protocol.ts";
import { CurrentSchematicWireDependencyCursor, decodeCurrentSchematicWireDependencyIterator } from "../src/current-schematic-wire-dependencies-cursor.ts";
import { CurrentSchematicWireDependencyObserver } from "../src/current-schematic-wire-dependencies-observer.ts";
import { CURRENT_SCHEMATIC_WIRE_ACCESSOR_REQUESTS as ACCESSOR } from "../src/current-schematic-wire-accessor-protocol.ts";
import { CURRENT_SCHEMATIC_WIRE_LEXICAL_REQUESTS as LEXICAL } from "../src/current-schematic-wire-lexical-protocol.ts";
import { CURRENT_SCHEMATIC_WIRE_INTENT_REQUESTS as INTENT } from "../src/current-schematic-wire-intent-protocol.ts";
import { CURRENT_SCHEMATIC_WIRE_EDIT_NATIVE_PROFILE as PROFILE } from "../src/current-schematic-wire-edit-native-profile.ts";
import { currentSchematicWireEditNativeRequest } from "../src/current-schematic-wire-edit-protocol.ts";
import { CURRENT_SCHEMATIC_WIRE_WRITER_V4_NATIVE_PROFILE as V4_PROFILE } from "../src/current-schematic-wire-writer-v4-native-profile.ts";
import { currentSchematicWireWriterV4NativeRequest } from "../src/current-schematic-wire-writer-v4-protocol.ts";
import { currentSchematicDisplayWriteNativeRequest } from "../src/current-schematic-display-write-protocol.ts";
import { currentSchematicRelevanceDisplayWriteNativeRequest } from "../src/current-schematic-relevance-display-write-protocol.ts";

const inspectorReply = z.strictObject({ result: z.object({ type: z.string(), objectId: z.string().optional(), description: z.string().optional(), value: z.unknown().optional() }), exceptionDetails: z.unknown().optional() });
const fixture = `(()=>{let calls=0;const fail=()=>{calls++;throw Error("application")};class Line{get points(){fail()}set points(value){fail()}}class Group{setLines(){fail()}}
const shapes={},line=Object.assign(new Line,{id:"line",shapeManager:shapes}),group=Object.assign(new Group,{shapeManager:shapes,_lines:new Set([line])});
const b={line,group,shapes,index:new Map([["line",line],["wire",group]]),pointBinding:{object:line,owner:Line.prototype,get:Object.getOwnPropertyDescriptor(Line.prototype,"points").get,set:Object.getOwnPropertyDescriptor(Line.prototype,"points").set},setLines:{object:group,owner:Group.prototype,fn:Group.prototype.setLines}},target={pageUuid:"synthetic"},operation={lineId:"line",wireId:"wire"},state={owner:null,identity:JSON.stringify({operation,target}),failed:false,modifyAttempted:false,modifyAcknowledged:false,saveAttempted:false,before:{line,wire:group}},holder=[b,state];state.owner=holder;
return{holder,t:JSON.stringify(target),o:JSON.stringify(operation),calls:()=>calls,line,group,shapes};})()`;
async function captureId(session: Session, expression: string): Promise<string> {
  const value = await session.post("Runtime.evaluate", { expression }); assert.equal(value.exceptionDetails, undefined); assert.equal(typeof value.result.objectId, "string"); return String(value.result.objectId);
}
void test("Wire native dependency projections pass actual local throwOnSideEffect and invoke no application function", async () => {
  const key = "__wireNativeDependencyInertFixture";
  const session = new Session(); session.connect();
  try {
    await session.post("Runtime.evaluate", { expression: `Object.defineProperty(globalThis,"${key}",{value:${fixture},configurable:true})` });
    const holder = await captureId(session, `globalThis.${key}.holder`);
    const t = await session.post("Runtime.evaluate", { expression: `globalThis.${key}.t`, returnByValue: true });
    const o = await session.post("Runtime.evaluate", { expression: `globalThis.${key}.o`, returnByValue: true });
    const operationValue: unknown = o.result.value, targetValue: unknown = t.result.value;
    assert.ok(typeof targetValue === "string" && typeof operationValue === "string");
    const argumentsValue: Runtime.CallArgument[] = [{ objectId: holder }, { value: targetValue }, { value: operationValue }];
    const call = async (role: "capture" | "iterator" | "same", refs: readonly string[]): Promise<z.infer<typeof inspectorReply>> => {
      // Ambient Node types omit this supported Inspector side-effect flag.
      const params = { ...FLAGS, objectId: holder, functionDeclaration: CALLS[role], arguments: [...argumentsValue, ...refs.map(ref => ({ objectId: ref }))], returnByValue: role === "same" };
      const pending: Promise<unknown> = session.post("Runtime.callFunctionOn", params); const raw = await pending; return inspectorReply.parse(raw);
    };
    const native = await call("capture", []); assert.equal(native.exceptionDetails, undefined); assert.equal(native.result.description, "Array(18)"); assert.ok(native.result.objectId !== undefined && native.result.objectId.length > 0);
    const iterator = await call("iterator", [native.result.objectId]); assert.equal(iterator.exceptionDetails, undefined); assert.equal(iterator.result.description, "Array(3)"); assert.ok(iterator.result.objectId !== undefined && iterator.result.objectId.length > 0);
    const iteratorMetadata = await session.post("Runtime.getProperties", { objectId: iterator.result.objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
    assert.ok(decodeCurrentSchematicWireDependencyIterator(iteratorMetadata).iteratorNextObjectId.length > 0);
    const same = await call("same", [native.result.objectId, iterator.result.objectId]); assert.equal(same.exceptionDetails, undefined); assert.equal(same.result.value, true);
    await session.post("Runtime.evaluate", { expression: `globalThis.${key}.group._lines=new Set([{id:"line"}])` });
    const membershipDrift = await call("same", [native.result.objectId, iterator.result.objectId]); assert.ok(membershipDrift.exceptionDetails !== undefined);
    await session.post("Runtime.evaluate", { expression: `Object.defineProperty(globalThis.${key}.line,"points",{set(value){throw Error("shadow")},configurable:true})` });
    const drift = await call("capture", []); assert.ok(drift.exceptionDetails !== undefined);
    const count = await session.post("Runtime.evaluate", { expression: `globalThis.${key}.calls()`, returnByValue: true }); assert.equal(count.result.value, 0);
  } finally { await session.post("Runtime.releaseObjectGroup", { objectGroup: FLAGS.objectGroup }); session.disconnect(); Reflect.deleteProperty(globalThis, key); }
});
function remote(kind: string, objectId: string, extra: Readonly<Record<string, unknown>> = {}): object { return { type: kind, objectId, ...extra }; }
function property(name: string, value: object, writable = true, enumerable = true, configurable = true): object { return { name, value, writable, enumerable, configurable, isOwn: true }; }
function arrayCapture(objectId: string, length: number): object { return { result: remote("object", objectId, { subtype: "array", className: "Array", description: `Array(${String(length)})` }) }; }
function properties(values: readonly object[]): object {
  return { result: [...values.map((value, index) => property(String(index), value)), property("length", { type: "number", value: values.length }, true, false, false)], internalProperties: [{ name: "[[Prototype]]", value: remote("object", "array_prototype", { className: "Array", description: "Array(0)", subtype: "array" }) }] };
}
function metadata(name: string, length: number, constructor: boolean): object {
  return { result: [property("length", { type: "number", value: length }, false, false), property("name", { type: "string", value: name }, false, false),
    ...(constructor ? [
      property("prototype", remote("object", "map_prototype", { className: "Map", description: "Map" }), false, false, false),
      { ...property("Symbol(Symbol.species)", remote("function", "map_species_constructor", { className: "Function", description: "function Map() { [native code] }" }), false, false),
        symbol: remote("symbol", "map_species_symbol", { description: "Symbol(Symbol.species)" }) },
    ] : [])],
    internalProperties: [{ name: "[[Prototype]]", value: remote("function", "function_prototype", { className: "Function", description: "function () { [native code] }" }) },
      { name: "[[Scopes]]", value: remote("object", "native_scopes", { className: "Array", subtype: "internal#scopeList", description: "Scopes[0]" }) }] };
}
const nativeFunctions = ROLES.map((row, index) => remote("function", `native_${String(index)}`, { className: "Function", description: `function ${row[1]}() { [native code] }` }));
function reply(command: ReturnType<typeof validateCurrentSchematicWireDependencyCommand>): object {
  if (command.phase === "wire-dependency-call") {
    if (command.role === "capture") { return arrayCapture("native_array", ROLES.length); }
    if (command.role === "iterator") { return arrayCapture("iterator_tuple", 3); }
    return { result: { type: "boolean", value: true } };
  }
  assert.equal(command.phase, "wire-dependency-properties");
  const id = command.params.objectId;
  if (id === "native_array") { return properties(nativeFunctions); }
  if (id === "iterator_tuple") { return properties([remote("object", "set_iterator", { subtype: "iterator", className: "SetIterator", description: "SetIterator" }), remote("object", "iterator_prototype", { className: "Set Iterator", description: "Set Iterator" }), remote("function", "iterator_next", { className: "Function", description: "function next() { [native code] }" })]); }
  if (id === "iterator_next") { return metadata("next", 0, false); }
  const role = ROLES[Number(id.slice("native_".length))]; assert.ok(role); return metadata(role[1], role[2], role[0] === "mapConstructor");
}
void test("Wire dependency cursor accepts digit CDP handles and rejects backslash", () => {
  const cursor = new CurrentSchematicWireDependencyCursor("123.1.2", "{}", "{}"); const command = cursor.next();
  assert.ok(command !== null && command.phase === "wire-dependency-call"); assert.equal(command.params.objectId, "123.1.2");
  assert.throws(() => new CurrentSchematicWireDependencyCursor(String.raw`123\1\2`, "{}", "{}"));
});
void test("Wire dependency cursor consumes exactly24 original command identities and refuses copied/null commands or malformed evidence", () => {
  const cursor = new CurrentSchematicWireDependencyCursor("holder", "{}", "{}"); const reserve: unknown = Reflect.get(cursor, "reserve"); assert.ok(typeof reserve === "function"); assert.throws(() => { Reflect.apply(reserve, cursor, [null]); });
  let reads = 0;
  for (let command = cursor.next(); command !== null; command = cursor.next()) {
    assert.equal(cursor.next(), command); assert.throws(() => { cursor.reserve(structuredClone(command)); }); cursor.reserve(command);
    assert.throws(() => { cursor.accept(structuredClone(command), reply(command)); }); cursor.accept(command, reply(command)); reads += 1;
  }
  assert.equal(reads, REQUESTS.normal); const data = cursor.requireCompleted(); assert.equal(data.nativeFunctionObjectIds.length, 18); assert.equal(data.iteratorNextObjectId, "iterator_next");
  const refused = new CurrentSchematicWireDependencyCursor("holder", "{}", "{}"); const first = refused.next(); assert.ok(first); refused.reserve(first);
  assert.throws(() => { refused.accept(first, { result: { type: "object", objectId: "spoof" } }); }); assert.throws(() => refused.next()); assert.throws(() => refused.requireCompleted());
});
void test("Wire V4 dependency transport binds holder and JSON and refuses historical or foreign routes", () => {
  assert.equal(PROFILE.renderer.total, 2721);
  assert.equal(V4_PROFILE.renderer.total, 6910);
  assert.equal(ACCESSOR.total + LEXICAL.total + INTENT.total + REQUESTS.total, V4_PROFILE.renderer.accessorObservation);
  for (const command of currentSchematicWireDependencyCases()) {
    const bytes = Buffer.from(`${JSON.stringify({ id: 83, ...command, schematicWireWriterV4DependencyCommand: true, sessionId: "original_ui" })}\0`);
    const legacy = Buffer.from(`${JSON.stringify({ id: 83, ...command, schematicWireDependencyCommand: true, sessionId: "original_ui" })}\0`);
    assert.equal(currentSchematicWireWriterV4NativeRequest(bytes)["action"], "schematic-wire-writer-v4-dependencies");
    assert.throws(() => currentSchematicWireWriterV4NativeRequest(legacy));
    assert.throws(() => currentSchematicWireEditNativeRequest(legacy));
    assert.throws(() => currentSchematicWireEditNativeRequest(bytes));
    assert.throws(() => currentSchematicDisplayWriteNativeRequest(bytes)); assert.throws(() => currentSchematicRelevanceDisplayWriteNativeRequest(bytes));
    assert.throws(() => validateCurrentSchematicWireDependencyCommand({ ...command, params: { ...command.params, code: "caller" } }));
    if (command.phase === "wire-dependency-call") {
      assert.throws(() => validateCurrentSchematicWireDependencyCommand({ ...command, params: { ...command.params, functionDeclaration: "function(){}" } }));
      assert.throws(() => { requireCurrentSchematicWireDependencyArguments(command, "copied_holder", "{}", "{}"); });
    }
  }
  let touched = false;
  assert.throws(() => Reflect.construct(CurrentSchematicWireDependencyObserver, [{ profile: "private.current-schematic-wire-dependency-origin.v1" }, {}, { get target(): never { touched = true; throw new Error("foreign"); } }]), /ORIGINAL_ORIGIN/u); assert.equal(touched, false);
});
