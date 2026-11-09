/** Synthetic descriptor/inspector replies and fixed-codebook bytes only.
 * No original native owner, model setter, worker or application is started. */
/* oxlint-disable import/max-dependencies -- The regression keeps original-issuer, independent source metadata and both foreign transport refusal boundaries separate. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_SCHEMATIC_WIRE_ACCESSOR_CALLS as CALLS, CURRENT_SCHEMATIC_WIRE_ACCESSOR_REQUESTS as REQUESTS, currentSchematicWireAccessorCases,
  currentSchematicWireAccessorTemplate, requireCurrentSchematicWireAccessorBoundArguments, validateCurrentSchematicWireAccessorCommand } from "../src/current-schematic-wire-accessor-protocol.ts";
import { CurrentSchematicWireAccessorObserver, CURRENT_SCHEMATIC_WIRE_ACCESSOR_PARAMETER_OFFSETS as OFFSETS, decodeCurrentSchematicWireAccessorFunction, qualifyCurrentSchematicWireAccessorSource } from "../src/current-schematic-wire-accessor-observer.ts";
import { currentSchematicWireEditNativeRequest } from "../src/current-schematic-wire-edit-protocol.ts";
import { currentSchematicDisplayWriteNativeRequest } from "../src/current-schematic-display-write-protocol.ts";
import { currentSchematicRelevanceDisplayWriteNativeRequest } from "../src/current-schematic-relevance-display-write-protocol.ts";
import { currentSchematicWireAccessorNativeSource } from "../src/current-schematic-wire-accessor-native.ts";
import { CURRENT_SCHEMATIC_WIRE_EDIT_NATIVE_PROFILE as PROFILE } from "../src/current-schematic-wire-edit-native-profile.ts";
import { GENERATED_SCHEMATIC_WIRE_NATIVE_SOURCE as SOURCE } from "../src/generated-schematic-wire-native-source.ts";

void test("Wire projections retain actual four descriptor callees without invoking them and reject changed receiver custody", () => {
  const context = createContext({}); runInContext(`let calls=0;class Point{}const line={},group={},owner={get points(){calls++;throw Error("get")},set points(value){calls++;throw Error("set")},setLines(){calls++;throw Error("setLines")}};
const descriptor=Object.getOwnPropertyDescriptor(owner,"points"),target={pageUuid:"synthetic"},operation={lineId:"line",wireId:"wire"};
const b={line,group,index:new Map([["line",line],["wire",group]]),pointBinding:{object:line,owner,key:"points",get:descriptor.get,set:descriptor.set},setLines:{object:group,owner,key:"setLines",fn:owner.setLines},vectorCtor:{key:"constructor",fn:Point},pointPrototype:Point.prototype};
const state={owner:null,identity:JSON.stringify({operation,target}),failed:false,modifyAttempted:false,saveAttempted:false};const holder=[b,state];state.owner=holder;
const callee=(${CALLS.callees}),same=(${CALLS.same}),targetJson=JSON.stringify(target),operationJson=JSON.stringify(operation),values=callee.call(holder,targetJson,operationJson);`, context);
  assert.equal(runInContext("values.length===4&&values[0]===descriptor.get&&values[1]===descriptor.set&&values[2]===owner.setLines&&values[3]===Point", context), true);
  assert.equal(runInContext("same.call(values,holder,targetJson,operationJson)", context), true); assert.equal(runInContext("calls", context), 0);
  runInContext("b.pointBinding.object={}", context);
  assert.throws(() => runInContext("callee.call(holder,targetJson,operationJson)", context), /PROJECTION/u); assert.equal(runInContext("calls", context), 0);
});

void test("Wire metadata codebook stays inside its existing reservation and rejects foreign markers, caller code and unbound arguments", () => {
  assert.ok(REQUESTS.total <= PROFILE.renderer.accessorObservation); assert.equal(PROFILE.renderer.total, 2721);
  for (const command of currentSchematicWireAccessorCases()) {
    const packet = { id: 83, ...command, schematicWireAccessorCommand: true, sessionId: "original_ui" }; const bytes = Buffer.from(`${JSON.stringify(packet)}\0`);
    const native = currentSchematicWireEditNativeRequest(bytes), template = currentSchematicWireAccessorTemplate(command);
    assert.equal(native["action"], "schematic-wire-edit-accessor"); assert.equal(native["phase"], command.phase);
    assert.equal(Object.hasOwn(native, "functionDeclaration"), false); assert.equal(Object.hasOwn(native, "holder"), false); assert.equal(Object.hasOwn(native, "targetJson"), false);
    assert.equal(Object.hasOwn(template.values, "boundHolder"), false);
    assert.throws(() => currentSchematicDisplayWriteNativeRequest(bytes)); assert.throws(() => currentSchematicRelevanceDisplayWriteNativeRequest(bytes));
    assert.throws(() => currentSchematicWireEditNativeRequest(Buffer.from(`${JSON.stringify({ ...packet, schematicAccessorCommand: true })}\0`)));
    assert.throws(() => validateCurrentSchematicWireAccessorCommand({ ...command, params: { ...command.params, callerCode: "value" } }));
    if (command.method === "Runtime.callFunctionOn") {
      assert.throws(() => validateCurrentSchematicWireAccessorCommand({ ...command, params: { ...command.params, functionDeclaration: "function(){}" } }));
      assert.throws(() => { requireCurrentSchematicWireAccessorBoundArguments(command, "foreign", "{}", "{}"); }, /ORIGINAL_ARGUMENTS/u);
    }
  }
  const native = currentSchematicWireAccessorNativeSource(); assert.match(native, /EncodeBound\(id,session,holder,null,target,operation/u); assert.match(native, /wireaccessor/u);
});

const field = (name: string, value: unknown): unknown => ({ name, value, writable: false, configurable: true, enumerable: false, isOwn: true });
void test("Wire function metadata binds exact native body, descriptor semantics, source location and lexical scope handle", () => {
  const source = SOURCE[0]; assert.ok(source !== undefined); const expected = source.methods.pointsGet; const description = "get points(){return this._points}";
  const packet = { result: [field("length", { type: "number", value: 0 }), field("name", { type: "string", value: "get points" })], internalProperties: [
    { name: "[[Prototype]]", value: { type: "function", objectId: "original_function_prototype" } },
    { name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: { scriptId: "original_script", lineNumber: expected.lineNumber, columnNumber: expected.columnNumber + OFFSETS.pointsGet } } },
    { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", objectId: "original_scopes", description: "Scopes[3]" } },
  ] };
  assert.equal(decodeCurrentSchematicWireAccessorFunction(packet, 0, "pointsGet", "original_script", description).scopes, "original_scopes");
  assert.throws(() => decodeCurrentSchematicWireAccessorFunction(packet, 0, "pointsGet", "foreign_script", description), /LOCATION_SCOPES/u);
  assert.throws(() => decodeCurrentSchematicWireAccessorFunction(packet, 0, "pointsGet", "original_script", `${description} `), /DESCRIPTION/u);
  assert.throws(() => decodeCurrentSchematicWireAccessorFunction({ ...packet, result: [...packet.result, field("unknown", { type: "number", value: 0 })] }, 0, "pointsGet", "original_script", description), /OWN_ROSTER/u);
  assert.throws(() => qualifyCurrentSchematicWireAccessorSource({ scriptSource: description }), /SOURCE_IDENTITY/u);
  let touched = false;
  assert.throws(() => Reflect.construct(CurrentSchematicWireAccessorObserver, [{ profile: "private.current-schematic-wire-accessor-origin.v1" }, {}, { get target(): never { touched = true; throw new Error("foreign"); } }]), /ORIGINAL_ORIGIN/u);
  assert.equal(touched, false);
});
