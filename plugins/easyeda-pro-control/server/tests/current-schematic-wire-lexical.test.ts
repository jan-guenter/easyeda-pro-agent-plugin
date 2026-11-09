/** Synthetic scope envelopes use real Node typed-array getters and fixed
 * vendor point syntax. They supply no original application owner or action. */
/* oxlint-disable import/max-dependencies -- Keep original issuer refusals, finite codebook, source pins and all three transport families independently visible. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_SCHEMATIC_WIRE_LEXICAL_CALLS as CALLS, CURRENT_SCHEMATIC_WIRE_LEXICAL_REQUESTS as REQUESTS,
  currentSchematicWireLexicalCases, requireCurrentSchematicWireLexicalArguments, validateCurrentSchematicWireLexicalCommand } from "../src/current-schematic-wire-lexical-protocol.ts";
import { CurrentSchematicWireLexicalObserver, decodeCurrentSchematicWireLexicalArray, decodeCurrentSchematicWireLexicalFunction, decodeCurrentSchematicWireLexicalScopes } from "../src/current-schematic-wire-lexical-observer.ts";
import { CURRENT_SCHEMATIC_WIRE_ACCESSOR_REQUESTS } from "../src/current-schematic-wire-accessor-protocol.ts";
import { CURRENT_SCHEMATIC_WIRE_EDIT_NATIVE_PROFILE as PROFILE } from "../src/current-schematic-wire-edit-native-profile.ts";
import { currentSchematicWireEditNativeRequest } from "../src/current-schematic-wire-edit-protocol.ts";
import { currentSchematicDisplayWriteNativeRequest } from "../src/current-schematic-display-write-protocol.ts";
import { currentSchematicRelevanceDisplayWriteNativeRequest } from "../src/current-schematic-relevance-display-write-protocol.ts";
import { GENERATED_SCHEMATIC_WIRE_NATIVE_SOURCE as WIRE_SOURCE } from "../src/generated-schematic-wire-native-source.ts";
import { GENERATED_SCHEMATIC_DISPLAY_ACTION_SOURCE as ACTION_SOURCE } from "../src/generated-schematic-display-action-source.ts";

void test("fixed Wire lexical joins prove real shared views/defaults and invoke no model method or constructor", () => {
  const context = createContext({}); runInContext(`let calls=0;class Point{constructor(){calls++;throw Error("constructor")}}class Ea{static normal(e){calls++;return e;}}
const memory=new ArrayBuffer(16),_he=new Float64Array(memory),ok=new Int32Array(memory),qt=Object.freeze({});function Cr(...i){}
const target={pageUuid:"synthetic"},operation={operationId:"synthetic"},b={vectorCtor:{fn:Point},pointPrototype:Point.prototype};
const state={owner:null,identity:JSON.stringify({operation,target}),failed:false,modifyAttempted:false,saveAttempted:false},holder=[b,state];state.owner=holder;
const targetJson=JSON.stringify(target),operationJson=JSON.stringify(operation),scope={description:"Closure (factory)",object:{Ea,_he,ok,qt,Cr}},globalScope={description:"Global",object:globalThis};
const pointScope=(${CALLS.point0}),finiteScope=(${CALLS.finite}),pointJoin=(${CALLS.point}),same=(${CALLS.same}),defaults=(${CALLS.defaultJoin}),finiteJoin=(${CALLS.finiteJoin});
const found=pointScope.call(scope,holder,targetJson,operationJson),joined=pointJoin.call(holder,holder,targetJson,operationJson,Point,Ea,_he,ok);`, context);
  assert.equal(runInContext("found.length===6&&found[0]&&found[1]===Ea&&found[2]&&found[3]===_he&&found[4]&&found[5]===ok", context), true);
  assert.equal(runInContext("same.call(holder,holder,targetJson,operationJson,Point,Ea,_he,ok,joined[0],joined[1])", context), true);
  assert.equal(runInContext("defaults.call(holder,holder,targetJson,operationJson,qt,Cr)", context), true);
  assert.equal(runInContext("finiteScope.call(globalScope,holder,targetJson,operationJson)[1]===isFinite", context), true);
  assert.equal(runInContext("finiteJoin.call(holder,holder,targetJson,operationJson,isFinite)", context), true);
  assert.throws(() => runInContext("pointScope.call(globalScope,holder,targetJson,operationJson)", context), /PROJECTION/u);
  assert.throws(() => runInContext("pointJoin.call(holder,holder,targetJson,operationJson,Point,Ea,_he,new Int32Array(new ArrayBuffer(16)))", context), /PROJECTION/u);
  assert.throws(() => runInContext("defaults.call(holder,holder,targetJson,operationJson,{},Cr)", context), /PROJECTION/u);
  runInContext("Object.defineProperty(scope.object,'Ea',{get(){calls++;throw Error('getter')}})", context);
  assert.throws(() => runInContext("pointScope.call(scope,holder,targetJson,operationJson)", context), /PROJECTION/u); assert.equal(runInContext("calls", context), 0);
});
function field(name: string, value: unknown, writable = true, enumerable = true, configurable = true): unknown { return { name, value, writable, enumerable, configurable, isOwn: true }; }
void test("scope/array readers reject truncation and aliases; forged origins refuse before input access", () => {
  const entry = (index: number, description: string): unknown => field(String(index), { type: "object", subtype: "internal#scope", className: "Object", objectId: `scope${String(index)}`, description });
  const chain = { result: [entry(0, "Closure (factory)"), entry(1, "Script"), entry(2, "Global")] };
  assert.deepEqual(decodeCurrentSchematicWireLexicalScopes(chain, false), ["scope0"]); assert.deepEqual(decodeCurrentSchematicWireLexicalScopes(chain, true), ["scope0", "scope1", "scope2"]);
  assert.throws(() => decodeCurrentSchematicWireLexicalScopes({ result: chain.result.slice(0, 2) }, true), /SCOPE_CHAIN/u);
  assert.throws(() => decodeCurrentSchematicWireLexicalScopes({ result: [entry(0, "Closure"), entry(0, "Global")] }, false), /SCOPE_ENTRY/u);
  const array = { result: [field("0", { type: "boolean", value: false }), field("1", { type: "undefined" }), field("length", { type: "number", value: 2 }, true, false, false)], internalProperties: [{ name: "[[Prototype]]", value: { type: "object", objectId: "array_prototype" } }] };
  assert.equal(decodeCurrentSchematicWireLexicalArray(array, 2).length, 2);
  assert.throws(() => decodeCurrentSchematicWireLexicalArray({ ...array, result: [...array.result, array.result[0]] }, 2), /REPLY_CAPTURE/u);
  assert.throws(() => decodeCurrentSchematicWireLexicalArray({ ...array, result: [...array.result, structuredClone(array.result[0])] }, 2), /ROSTER/u);
  let touched = false;
  assert.throws(() => Reflect.construct(CurrentSchematicWireLexicalObserver, [{ profile: "private.current-schematic-wire-lexical-origin.v1" }, {}, { get target(): never { touched = true; throw new Error("foreign"); } }]), /ORIGINAL_ORIGIN/u); assert.equal(touched, false);
});
void test("lexical transport fits the existing Wire reservation and cannot borrow either display family or caller programs", () => {
  assert.ok(REQUESTS.total + CURRENT_SCHEMATIC_WIRE_ACCESSOR_REQUESTS.total <= PROFILE.renderer.accessorObservation); assert.equal(PROFILE.renderer.total, 2721);
  for (const command of currentSchematicWireLexicalCases()) {
    const packet = { id: 83, ...command, schematicWireLexicalCommand: true, sessionId: "original_ui" }; const bytes = Buffer.from(`${JSON.stringify(packet)}\0`);
    const native = currentSchematicWireEditNativeRequest(bytes); assert.equal(native["action"], "schematic-wire-edit-lexical"); assert.equal(Object.hasOwn(native, "functionDeclaration"), false); assert.equal(Object.hasOwn(native, "targetJson"), false);
    assert.throws(() => currentSchematicDisplayWriteNativeRequest(bytes)); assert.throws(() => currentSchematicRelevanceDisplayWriteNativeRequest(bytes));
    assert.throws(() => validateCurrentSchematicWireLexicalCommand({ ...command, params: { ...command.params, callerCode: "value" } }));
    if (command.phase === "wire-lexical-call") {
      assert.throws(() => validateCurrentSchematicWireLexicalCommand({ ...command, params: { ...command.params, functionDeclaration: "function(){}" } }));
      if (command.role === "point0") { assert.throws(() => { requireCurrentSchematicWireLexicalArguments(command, "original_holder", "{}", "{}", 1); }, /ORIGINAL_ARGUMENTS/u); }
    }
  }
});
void test("normal/noop metadata retain their exact source locations and reject changed functions", () => {
  const wire = WIRE_SOURCE[0]; const action = ACTION_SOURCE[0]; assert.ok(wire !== undefined && action !== undefined);
  for (const role of ["normal", "noop"] as const) {
    const name = role === "normal" ? "normal" : "Cr"; const arity = role === "normal" ? 1 : 0;
    const location: Readonly<{ scriptId: string; lineNumber: number; columnNumber: number }> = role === "normal" ? { scriptId: "original_script", lineNumber: wire.methods.pointNormal.lineNumber, columnNumber: wire.methods.pointNormal.columnNumber + 13 } : { scriptId: "original_script", lineNumber: action.methods.noop.lineNumber, columnNumber: action.methods.noop.columnNumber };
    const result = [field("length", { type: "number", value: arity }, false, false), field("name", { type: "string", value: name }, false, false)];
    if (role === "noop") { result.push(field("prototype", { type: "object", objectId: "noop_prototype" }, true, false, false), ...["caller", "arguments"].map(key => field(key, { type: "object", subtype: "null", value: null }, false, false, false))); }
    const packet: unknown = { result, internalProperties: [{ name: "[[Prototype]]", value: { type: "function", objectId: "function_prototype", description: "function () { [native code] }" } }, { name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: location } },
      { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", objectId: "original_scopes", description: "Scopes[3]" } }] };
    const description = role === "normal" ? 'normal(e){if(isFinite(e))return e;throw new Error(Uh.format("%f is not permitted",e))}' : "function Cr(...i){}";
    const context = { variant: 0, scriptId: "original_script", sourceSha256: action.sha256 } as const;
    assert.equal(decodeCurrentSchematicWireLexicalFunction(packet, context, role, description), "original_scopes");
    assert.throws(() => decodeCurrentSchematicWireLexicalFunction(packet, { ...context, scriptId: "foreign" }, role, description));
    assert.throws(() => decodeCurrentSchematicWireLexicalFunction(packet, context, role, `${description} `), /FUNCTION_SOURCE/u);
  }
});
