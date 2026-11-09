/** Synthetic descriptor graphs exercise real WeakMap/Map operations and fixed
 * native joins; they cannot manufacture an original owner or observation. */
/* oxlint-disable import/max-dependencies -- The original issuer, fixed programs, reservation and three transport families are independently checked. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_SCHEMATIC_WIRE_INTENT_CALLS as CALLS, CURRENT_SCHEMATIC_WIRE_INTENT_REQUESTS as REQUESTS, currentSchematicWireIntentCases, validateCurrentSchematicWireIntentCommand } from "../src/current-schematic-wire-intent-protocol.ts";
import { CurrentSchematicWireIntentObserver } from "../src/current-schematic-wire-intent-observer.ts";
import { CURRENT_SCHEMATIC_WIRE_ACCESSOR_REQUESTS as ACCESSORS } from "../src/current-schematic-wire-accessor-protocol.ts";
import { CURRENT_SCHEMATIC_WIRE_LEXICAL_REQUESTS as LEXICAL } from "../src/current-schematic-wire-lexical-protocol.ts";
import { CURRENT_SCHEMATIC_WIRE_EDIT_NATIVE_PROFILE as PROFILE } from "../src/current-schematic-wire-edit-native-profile.ts";
import { currentSchematicWireEditNativeRequest } from "../src/current-schematic-wire-edit-protocol.ts";
import { currentSchematicDisplayWriteNativeRequest } from "../src/current-schematic-display-write-protocol.ts";
import { currentSchematicRelevanceDisplayWriteNativeRequest } from "../src/current-schematic-relevance-display-write-protocol.ts";

void test("Wire idle/monitor projections join original graph and closure receivers without invoking application methods", () => {
  const context = createContext({}); runInContext(`let calls=0;const fail=()=>{calls++;throw Error("application call")};
class Base{withResolvers(){fail()}transactionSuccessHandler(){fail()}transactionFailHandler(){fail()}}
class History extends Base{watch(){fail()}getModelHistoryCommand(){fail()}get isWatched(){fail()}}
class Runner{run(){fail()}useAction(){fail()}_tryStartHistory(){fail()}_getActionRealOptions(){fail()}get currentAction(){fail()}set currentAction(value){fail()}get running(){fail()}}
const runner=new Runner,history=new History,shapes={docManager:{}},line={shapeManager:shapes};
function Cr(...i){}Object.assign(history,{shapeManager:shapes,_isWatched:true,modelCommandMap:new Map,_tryHandleGroupModelCommand:()=>fail(),onModelAttributeChange:Cr,onSubTreeInsertConnectedChild:Cr,onSubTreeRemoveConnectedChild:Cr});
Object.assign(runner,{_historyResolversMap:new WeakMap,_currentAction:null});shapes.historyRecorder=history;
for(const name of ["modifyMonitor","bboxMonitor","attrWatcher"]){const object={shapeManager:shapes};object.onModelAttributeChange=()=>{fail();return object};shapes[name]=object;}
const b={runner,shapes,line,page:shapes.docManager,run:{object:runner,owner:Runner.prototype,key:"run",fn:Runner.prototype.run}},target={pageUuid:"synthetic"},operation={lineId:"synthetic"},holder=[b,{owner:null,identity:JSON.stringify({operation,target}),failed:false,modifyAttempted:false,saveAttempted:false,modifyAcknowledged:false,before:{line}}];holder[1].owner=holder;
const t=JSON.stringify(target),o=JSON.stringify(operation),idle=(${CALLS.idle}),same=(${CALLS.idleSame}),monitors=(${CALLS.monitors}),monitorSame=(${CALLS.monitorsSame}),scope=(${CALLS.scope}),closure=(${CALLS.closure1});
const action=idle.call(holder,holder,t,o,Cr),roots=monitors.call(holder,holder,t,o),receiver=scope.call({description:"Closure (watch)",object:{this:shapes.bboxMonitor}},holder,t,o);`, context);
  assert.equal(runInContext("action.length===18&&roots.length===6&&receiver[0]&&receiver[1]===roots[1]", context), true);
  assert.equal(runInContext("same.call(action,holder,t,o,Cr)&&monitorSame.call(roots,holder,t,o)&&closure.call(holder,holder,t,o,receiver[1])", context), true);
  assert.throws(() => runInContext("closure.call(holder,holder,t,o,roots[0])", context), /WIRE_INTENT/u);
  assert.throws(() => runInContext("idle.call(holder,holder,t,o,()=>{})", context), /WIRE_INTENT/u);
  assert.throws(() => runInContext("scope.call({description:'Script',object:{this:roots[1]}},holder,t,o)", context), /WIRE_INTENT/u);
  runInContext("holder[1].before.line={shapeManager:shapes}", context);
  assert.throws(() => runInContext("monitors.call(holder,holder,t,o)", context), /WIRE_INTENT/u); assert.equal(runInContext("calls", context), 0);
});
void test("separate Wire intent grammar stays in its reservation and refuses forged origins and foreign families", () => {
  assert.ok(ACCESSORS.total + LEXICAL.total + REQUESTS.total <= PROFILE.renderer.accessorObservation); assert.equal(PROFILE.renderer.total, 2721);
  for (const command of currentSchematicWireIntentCases()) {
    const bytes = Buffer.from(`${JSON.stringify({ id: 83, ...command, schematicWireIntentCommand: true, sessionId: "original_ui" })}\0`);
    assert.equal(currentSchematicWireEditNativeRequest(bytes)["action"], "schematic-wire-edit-intent");
    assert.throws(() => currentSchematicDisplayWriteNativeRequest(bytes)); assert.throws(() => currentSchematicRelevanceDisplayWriteNativeRequest(bytes));
    assert.throws(() => validateCurrentSchematicWireIntentCommand({ ...command, params: { ...command.params, code: "caller" } }));
  }
  let touched = false;
  assert.throws(() => Reflect.construct(CurrentSchematicWireIntentObserver, [{ profile: "private.current-schematic-wire-intent-origin.v1" }, {}, { get target(): never { touched = true; throw new Error("foreign"); } }]), /ORIGINAL_ORIGIN/u); assert.equal(touched, false);
});
