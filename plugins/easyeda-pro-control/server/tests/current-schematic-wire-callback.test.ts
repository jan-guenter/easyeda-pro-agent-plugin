/** Actual generated callback and vendor constructor/setter bytes run in an
 * inert VM. Stand-in downstream monitor counts are not connected evidence. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { Worker } from "node:worker_threads";
import { CURRENT_SCHEMATIC_WIRE_CALLBACK_REQUESTS as LIMIT, currentSchematicWireCallbackCases, currentSchematicWireCallbackTemplate, validateCurrentSchematicWireCallbackCommand as validate } from "../src/current-schematic-wire-callback-protocol.ts";
import { CurrentSchematicWireCallbackCursor } from "../src/current-schematic-wire-callback-cursor.ts";
import { CURRENT_SCHEMATIC_WIRE_CONSTRUCT_REQUESTS as CONSTRUCT } from "../src/current-schematic-wire-construct-protocol.ts";
import { CURRENT_SCHEMATIC_WIRE_WRITER_CALLBACK as CALLBACK } from "../src/current-schematic-wire-writer-programs.ts";
import { GENERATED_SCHEMATIC_WIRE_NATIVE_SOURCE as SOURCE } from "../src/generated-schematic-wire-native-source.ts";
import { GENERATED_SCHEMATIC_WIRE_SET_LINES_SOURCE as SET_LINES } from "../src/generated-schematic-wire-source.ts";

for (const variant of [0, 1] as const) {
  void test(`original callback variant ${String(variant)} binds both point constructors and one existing LINE setter at seven real pauses`, { timeout: 20_000 }, async context => {
    const profile = SOURCE[variant]; assert.ok(profile !== undefined);
    const point = profile.methods.pointConstructor.source, vm = createContext({});
    const invoke: unknown = runInContext(`const memory=new ArrayBuffer(16),_he=new Float64Array(memory),ok=new Int32Array(memory),Rce=_he,Yk=ok,qt=Object.freeze({});function Cr(...i){throw Error("delete");}
class Ea{static normal(e){if(isFinite(e))return e;throw Error("finite");}}const Ma=Ea,Point=${point};
let records=0,allocations=0,ownedAction=null;const apply=Reflect.apply,own=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))throw Error("own");return d.value;};
const methods={${SET_LINES},get points(){return this._points},set points(t){this._points!==t&&this.shapeManager.modifyMonitor.record({model:this,attr:"points",oldValue:this._points,newValue:this._points=t})}},shapes={modifyMonitor:{record(){records++;}}},line=Object.create(methods);Object.assign(line,{id:"line",shapeManager:shapes,_points:[]});
const group={shapeManager:shapes,_lines:new Set([line]),createLineBaseOn(){allocations++;throw Error("allocation");}},runner={_currentAction:{history:"add",status:"running"}},operation={lineId:"line",wireId:"wire",afterBody:{startX:2,startY:4,endX:92,endY:6}},target={},before={line,wire:group};
const b={line,group,shapes,runner,index:new Map([["line",line],["wire",group]]),vectorCtor:{fn:Point},pointPrototype:Point.prototype,pointBinding:{object:line,owner:methods,get:Object.getOwnPropertyDescriptor(methods,"points").get,set:Object.getOwnPropertyDescriptor(methods,"points").set},setLines:{object:group,owner:methods,fn:methods.setLines}},state={owner:null,before,failed:false,modifyAttempted:true,modifyAcknowledged:false,saveAttempted:false},tuple=[b,state];state.owner=tuple;
const native=[Object.getOwnPropertyDescriptor,Object.getOwnPropertyDescriptors,Object.getPrototypeOf,Object.is,Object.hasOwn,Reflect.ownKeys,Reflect.apply,Array.isArray,Map.prototype.get,Map.prototype.has,Map.prototype.forEach,Object.getOwnPropertyDescriptor(Map.prototype,"size").get,Set.prototype.has,Set.prototype.forEach,Object.getOwnPropertyDescriptor(Set.prototype,"size").get,Object.prototype,Array.prototype,Map.prototype,Set.prototype];
const callback=${CALLBACK};({invoke:()=>callback(),status:()=>({records,allocations,points:line._points.map(p=>[p.x,p.y]),sameAction:ownedAction===runner._currentAction})});`, vm);
    assert.ok(invoke !== null && typeof invoke === "object"); const done = Promise.withResolvers<unknown>();
    const worker = new Worker(new URL("helpers/current-schematic-wire-callback-worker.ts", import.meta.url));
    context.after(async () => { await worker.terminate(); }); worker.on("error", done.reject); const completed = Promise.withResolvers<unknown>();
    worker.on("message", (value: unknown) => {
      if (value !== null && typeof value === "object" && "ready" in value) {
        void (async (): Promise<void> => {
          try { const fn: unknown = Reflect.get(invoke, "invoke"); assert.ok(typeof fn === "function"); const pending: unknown = Reflect.apply(fn, invoke, []); assert.ok(pending !== null && typeof pending === "object"); completed.resolve(await Promise.resolve(pending)); } catch (error) { completed.reject(error); }
        })();
      } else { done.resolve(value); }
    });
    const result = await done.promise; assert.ok(result !== null && typeof result === "object" && !("error" in result), JSON.stringify(result)); await completed.promise;
    assert.equal(Reflect.get(result, "reads"), LIMIT.normal + CONSTRUCT.normal); assert.equal(Reflect.get(result, "pauses"), 7); assert.equal(Reflect.get(result, "resumed"), 7); assert.equal(Reflect.get(result, "helpers"), LIMIT.helperSourcesMaximum + CONSTRUCT.helperSourcesMaximum);
    const status: unknown = Reflect.get(invoke, "status"); assert.ok(typeof status === "function"); const value: unknown = Reflect.apply(status, invoke, []);
    assert.deepEqual(structuredClone(value), { records: 1, allocations: 0, points: [[2, 4], [92, 6]], sameAction: true });
  });
}
void test("callback readers retain immutable fixed bytes and consume failed or copied reservations", () => {
  for (const command of currentSchematicWireCallbackCases()) {
    assert.deepEqual(validate(command), command); assert.ok(currentSchematicWireCallbackTemplate(command).template.length > 0);
    assert.throws(() => validate({ ...command, params: { ...command.params, callerCode: "value" } }));
  }
  assert.throws(() => validate({ phase: "wire-callback-resume", method: "Debugger.resume", params: {} }));
  const cursor = new CurrentSchematicWireCallbackCursor({ role: "entry", frame: "123.1.2", native: "native", holder: "holder", qualified: "qualified" });
  const command = cursor.next(); assert.ok(command !== null); assert.throws(() => { cursor.reserve(structuredClone(command)); }); cursor.reserve(command);
  assert.throws(() => { cursor.accept(command, { result: { type: "object", subtype: "proxy", objectId: "foreign" } }); }); assert.throws(() => cursor.next()); assert.throws(() => cursor.requireCompleted());
});
