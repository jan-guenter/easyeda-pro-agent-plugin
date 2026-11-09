/** Synthetic program and fixed codebook checks. Debugger statements are inert
 * in this VM; these tests do not qualify a live callback or writer owner. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { Script, createContext, runInContext } from "node:vm";
import { CURRENT_SCHEMATIC_WIRE_WRITER_MARKERS as MARKERS, CURRENT_SCHEMATIC_WIRE_WRITER_FUNCTION as PROGRAM, currentSchematicWireWriterStageResultSchema as schema } from "../src/current-schematic-wire-writer-programs.ts";
import { generatedSchematicWireEditStageResultSchema as V1 } from "../src/generated-schematic-wire-edit-program.ts";
import { generatedSchematicWireLifecycleStageResultSchema as V2 } from "../src/generated-schematic-wire-lifecycle-program.ts";
import { currentSchematicWirePrefixCases, currentSchematicWirePrefixTemplate, validateCurrentSchematicWirePrefixCommand } from "../src/current-schematic-wire-prefix-protocol.ts";
import { currentSchematicWireWriterCases, validateCurrentSchematicWireWriterCommand } from "../src/current-schematic-wire-writer-protocol.ts";
import { CURRENT_SCHEMATIC_WIRE_CALLBACK_POINT_AFTER as AFTER, CURRENT_SCHEMATIC_WIRE_CALLBACK_POINT_BEFORE as BEFORE, CURRENT_SCHEMATIC_WIRE_CALLBACK_SETTER_BEFORE as SETTER } from "../src/current-schematic-wire-active-programs.ts";
import { wireNativeFixture } from "./generated-schematic-wire-native-fixture.ts";

void test("held Wire v3 source preserves both old schemas, fixes action options and keeps one setter/Save in the synthetic graph", async () => {
  assert.doesNotThrow(() => new Script(`(${PROGRAM})`)); assert.equal(MARKERS.length, 6);
  const script = `(${PROGRAM})`; const lines = script.split("\n");
  for (const marker of MARKERS) { assert.equal(lines[marker.lineNumber]?.slice(marker.columnNumber, marker.columnNumber + 9), "debugger;"); }
  const fixture = wireNativeFixture("success", "v3"); await fixture.call("capture");
  for (const stage of ["preflight", "modify", "observe", "save"] as const) {
    const packet = schema.parse(await fixture.call(stage)); assert.equal(packet.ok, true); assert.equal(packet.stage, stage);
    assert.equal(V1.safeParse(packet).success, false); assert.equal(V2.safeParse(packet).success, false);
    assert.equal(packet.workerCompletionVerified, false); assert.equal(packet.structureCompletionVerified, false); assert.equal(packet.persistenceVerified, false);
  }
  assert.deepEqual(fixture.counts(), { actions: 1, points: 1, save: 1, allocation: 0 });
  const refused = schema.parse(await fixture.call("save")); assert.equal(refused.ok, false); assert.equal(fixture.counts()["save"], 1);
});
void test("Wire observation and source-equivalent prefix grammars admit fixed readonly rows and refuse resume or caller programs", () => {
  for (const command of currentSchematicWirePrefixCases()) {
    const fixed = currentSchematicWirePrefixTemplate(command); assert.match(fixed.phase, /^wire-prefix-/u);
    assert.throws(() => validateCurrentSchematicWirePrefixCommand({ ...command, phase: "prefix-call" }));
    assert.throws(() => validateCurrentSchematicWirePrefixCommand({ ...command, params: { ...command.params, callerCode: "value" } }));
    if (command.method === "Runtime.callFunctionOn") { assert.throws(() => validateCurrentSchematicWirePrefixCommand({ ...command, params: { ...command.params, functionDeclaration: "function(){}" } })); }
  }
  assert.throws(() => validateCurrentSchematicWirePrefixCommand({ phase: "wire-prefix-resume", role: "run", method: "Debugger.resume", params: {} }));
  for (const command of currentSchematicWireWriterCases()) {
    assert.throws(() => validateCurrentSchematicWireWriterCommand({ ...command, params: { ...command.params, callerCode: "value" } }));
    if (command.method === "Runtime.callFunctionOn") { assert.throws(() => validateCurrentSchematicWireWriterCommand({ ...command, params: { ...command.params, functionDeclaration: "function(){}" } })); }
  }
  assert.throws(() => validateCurrentSchematicWireWriterCommand({ phase: "wire-resume", method: "Debugger.resume", params: {} }));
});

void test("held point proofs bind both actual points and the full shared buffer, rejecting inherited setters before construction", () => {
  const context = createContext({}); runInContext(`let calls=0;const memory=new ArrayBuffer(16),floats=new Float64Array(memory),ints=new Int32Array(memory);
class Point{constructor(x,y){calls++;this.x=x;this.y=y;floats[0]=x;floats[1]=y;this.hashed=ints[0]^ints[1]^ints[2]^ints[3]}}
const methods={set points(t){throw Error("application")},setLines(){throw Error("application")}},shapes={},line={id:"line",shapeManager:shapes},group={shapeManager:shapes,_lines:new Set([line])},runner={_currentAction:{history:"add",status:"running"}},operation={lineId:"line",wireId:"wire",afterBody:{startX:2,startY:4,endX:92,endY:6}},target={pageUuid:"synthetic"};
const b={line,group,shapes,runner,index:new Map([["line",line],["wire",group]]),vectorCtor:{fn:Point},pointPrototype:Point.prototype,pointBinding:{object:line,owner:methods,set:Object.getOwnPropertyDescriptor(methods,"points").set},setLines:{object:group,owner:methods,fn:methods.setLines}},before={line,wire:group},state={owner:null,before,failed:false,modifyAttempted:true,modifyAcknowledged:false,saveAttempted:false},holder=[b,state];state.owner=holder;
const originalContext=[holder,b,state,before,target,operation],qualified=[Point,{},floats,ints,()=>{},isFinite,Object.freeze({}),()=>{}],native=[Object.getOwnPropertyDescriptor,Object.getOwnPropertyDescriptors,Object.getPrototypeOf,Object.is,Object.hasOwn,Reflect.ownKeys,Reflect.apply,Array.isArray,Map.prototype.get,Map.prototype.has,Map.prototype.forEach,Object.getOwnPropertyDescriptor(Map.prototype,"size").get,Set.prototype.has,Set.prototype.forEach,Object.getOwnPropertyDescriptor(Set.prototype,"size").get,Object.prototype,Array.prototype,Map.prototype,Set.prototype];
const prior=[],points=[],beforeFn=(${BEFORE}),afterFn=(${AFTER}),setterFn=(${SETTER}),frame0=[originalContext,0,[2,4],points];
beforeFn.call(frame0,native,holder,qualified,prior);const p0=new Point(2,4),first=afterFn.call([...frame0,p0],native,holder,qualified,prior);points.push(p0);
const frame1=[originalContext,1,[92,6],points];beforeFn.call(frame1,native,holder,qualified,first);const p1=new Point(92,6),second=afterFn.call([...frame1,p1],native,holder,qualified,first);points.push(p1);`, context);
  assert.equal(runInContext("setterFn.call([originalContext,points],native,holder,qualified,first,second)", context), true);
  assert.throws(() => runInContext("setterFn.call([originalContext,[p1,p0]],native,holder,qualified,first,second)", context), /WIRE_CALLBACK_PROOF/u);
  runInContext("floats[0]=91", context);
  assert.throws(() => runInContext("afterFn.call([originalContext,1,[92,6],[p0],p1],native,holder,qualified,first)", context), /WIRE_CALLBACK_PROOF/u);
  runInContext("Object.defineProperty(Point.prototype,'x',{set(value){calls++;throw Error('inherited setter')}})", context);
  assert.throws(() => runInContext("beforeFn.call([originalContext,0,[2,4],[]],native,holder,qualified,[])", context), /WIRE_CALLBACK_PROOF/u);
  assert.equal(runInContext("calls", context), 2);
});
