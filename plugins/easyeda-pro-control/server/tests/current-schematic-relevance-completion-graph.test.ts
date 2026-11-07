/** Inert history graph with actual readonly Inspector execution. These checks
 * establish descriptor behavior, not original application custody or delivery. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import type { Runtime } from "node:inspector";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import type { Context } from "node:vm";
import { CURRENT_SCHEMATIC_RELEVANCE_COMPLETION_DETAILS as DETAILS, CURRENT_SCHEMATIC_RELEVANCE_COMPLETION_FUNCTIONS as FUNCTIONS, CURRENT_SCHEMATIC_RELEVANCE_COMPLETION_ROOTS as ROOTS, CURRENT_SCHEMATIC_RELEVANCE_COMPLETION_SAME as SAME, CURRENT_SCHEMATIC_RELEVANCE_COMPLETION_SNAPSHOT as SNAPSHOT, CURRENT_SCHEMATIC_RELEVANCE_COMPLETION_SNAPSHOT_SAME as SNAPSHOT_SAME, CURRENT_SCHEMATIC_RELEVANCE_COMPLETION_SUBSCRIPTIONS as SUBSCRIPTIONS } from "../src/current-schematic-relevance-completion-programs.ts";
import { CurrentSchematicRelevanceCompletionCursor } from "../src/current-schematic-relevance-completion-cursor.ts";

const setup = String.raw`
let calls=0;const called=()=>{calls++;},fn=()=>{};
class Queue{constructor(){this.index=-1;this.end=0;}enqueue(){called();}dispose(){called();}}
class Event{constructor(size){this._size=size;this._listenerSubscriptions=Array.from({length:size},()=>({cb:fn,dispose:fn}));this._options={};this._event=fn;if(size>1)this._deliveryQueue=new Queue;}
dispatch(){called();}_deliver(){called();}_deliverQueue(){called();}}
class Group{constructor(){this._commands=new Set;}forEach(){called();}remove(){called();}get size(){called();return 0;}}
class CommandBase{get canRecord(){called();return false;}}
class HistoryBase{_record(){called();}clearRecordsCore(){called();}get status(){called();return{};}get canRedo(){called();return false;}get canUndo(){called();return false;}}
class History extends HistoryBase{get canRedo(){called();return false;}get canUndo(){called();return false;}}
class Text{get x(){called();return 0;}get y(){called();return 0;}get rotation(){called();return 0;}get hAlign(){called();return 0;}get vAlign(){called();return 0;}}
const doc={tabId:"tab"},group=new Group,text=new Text,history=Object.assign(new History,{batchSaveStack:group,_undoCommands:[],_redoCommands:[],_onBatchSaveStackWillRecord:new Event(1),_onWillRecord:new Event(1),_onDidRecord:new Event(1),_onStatusChange:new Event(3),maxLength:50,belongTabId:"tab",_enable:true});
const shapes={historyRecorder:history,docManager:doc};history.shapeManager=shapes;const action={},runner={_currentAction:action};
const native=[Object.getOwnPropertyDescriptor,Object.getOwnPropertyDescriptors,Object.getPrototypeOf,Object.is,Object.hasOwn,Reflect.ownKeys,Reflect.apply,Array.isArray,Map.prototype.get,Map.prototype.has,Map.prototype.forEach,Object.getOwnPropertyDescriptor(Map.prototype,"size").get,Set.prototype.has,Set.prototype.forEach,Object.getOwnPropertyDescriptor(Set.prototype,"size").get,Object.prototype,Array.prototype,Map.prototype,Set.prototype];
const refs=Array.from({length:24},()=>({}));refs[10]=shapes;refs[22]=runner;const entry=Array.from({length:13},()=>({}));entry[8]=text;entry[10]=action;
const active=[history,{},group,{}, {}, {}, {},fn],module=[class extends CommandBase{},CommandBase,[]],base=Array.from({length:34},()=>fn);base[12]=Event.prototype.dispatch;base[13]=Event.prototype._deliver;base[30]=Queue;
const queue=Array.from({length:18},()=>fn);queue[0]=Event.prototype._deliverQueue;queue[2]=Queue.prototype.enqueue;queue[3]=Queue.prototype.dispose;
let qualified=[];const add=value=>{if(value!==null&&(typeof value==="object"||typeof value==="function")){let at=value;while(at!==null){if(!qualified.includes(at))qualified.push(at);at=Object.getPrototypeOf(at);}}};
for(const value of [history,group,CommandBase,CommandBase.prototype,history._undoCommands,history._redoCommands,text,doc,group._commands,shapes,runner,...native,...base,...queue])add(value);
for(const name of ["_onBatchSaveStackWillRecord","_onWillRecord","_onDidRecord","_onStatusChange"]){const event=history[name];for(const value of [event,event._options,event._listenerSubscriptions,event._deliveryQueue,...event._listenerSubscriptions])add(value);}
const selection=(roots,details,subscriptions)=>[native,roots,details,subscriptions,entry,base,queue,qualified];
`;
function fixture(): Readonly<{ realm: Context; execute: (source: string, receiver: string, args: string) => unknown; unchanged: () => unknown; snapshotSame: () => unknown; calls: () => unknown }> {
  const realm = createContext({}); runInContext(setup, realm);
  const execute = (source: string, receiver: string, args: string): unknown => runInContext(`Reflect.apply((${source}),${receiver},${args})`, realm);
  const roots = execute(ROOTS, "entry", "[native,refs,entry,active,module,qualified]"); realm["roots"] = roots;
  const details = execute(DETAILS, "roots", "[native,qualified]"); realm["details"] = details;
  const subscriptions = execute(SUBSCRIPTIONS, "details", "[native,qualified]"); realm["subscriptions"] = subscriptions;
  const functions = execute(FUNCTIONS, "roots", "selection(roots,details,subscriptions)"); realm["functions"] = functions;
  runInContext("for(let i=0;i<functions.length;i++)add(functions[i]);", realm);
  const snapshot = execute(SNAPSHOT, "qualified", "[native]"); realm["snapshot"] = snapshot;
  return { realm, execute, unchanged: (): unknown => execute(SAME, "functions", "[...selection(roots,details,subscriptions),...functions.slice(17,22)]"), snapshotSame: (): unknown => execute(SNAPSHOT_SAME, "snapshot", "[native,qualified]"), calls: (): unknown => runInContext("calls", realm) };
}
void test("normal history selection retains six original subscriptions and all24 uninvoked functions", () => {
  const f = fixture(); assert.equal(f.unchanged(), true); assert.equal(f.snapshotSame(), true); assert.equal(f.calls(), 0);
  for (const fault of ["history._redoCommands.push({})", "history.belongTabId='foreign'", "history._onStatusChange._options.onAdd=fn", "history._onStatusChange._listenerSubscriptions[2]={cb:fn,dispose:fn}", "history._onStatusChange._deliveryQueue.current=history", "Object.defineProperty(text,'x',{get(){called();return 0;}})"]) {
    const changed = fixture(); runInContext(fault, changed.realm); assert.throws(changed.unchanged); assert.throws(changed.snapshotSame); assert.equal(changed.calls(), 0);
  }
  const changed = fixture(); runInContext("history[Symbol.for('unrecognized-original-field')]={retained:true}", changed.realm); assert.throws(changed.snapshotSame); assert.equal(changed.calls(), 0);
});
void test("the original idle event queue accepts completed delivery fields and refuses an active queue", () => {
  const f = fixture(); runInContext("Object.assign(history._onStatusChange._deliveryQueue,{index:3,end:3,current:undefined,args:undefined})", f.realm); assert.equal(f.unchanged(), true); assert.equal(f.calls(), 0);
  runInContext("history._onStatusChange._deliveryQueue.args=[]", f.realm); assert.throws(f.unchanged); assert.equal(f.calls(), 0);
});
void test("actual Inspector permits all fixed stages under throwOnSideEffect without invoking model getters", async () => {
  const f = fixture(); const session = new Session(); session.connect(); const key = "__inertCompletionGraph";
  const values: unknown = runInContext("[entry,native,refs,active,module,qualified,roots,details,subscriptions,base,queue,functions,snapshot,...functions.slice(17,22)]", f.realm);
  Object.defineProperty(globalThis, key, { value: values, configurable: true });
  try {
    const outer = await session.post("Runtime.evaluate", { expression: `globalThis.${key}`, objectGroup: "completion-graph" }); assert.ok(outer.result.objectId !== undefined);
    const packet = await session.post("Runtime.getProperties", { objectId: outer.result.objectId, ownProperties: true });
    const id = (index: number): string => { const value = packet.result.find(row => row.name === String(index))?.value?.objectId; assert.ok(value !== undefined); return value; };
    const cases = [[ROOTS, 0, [1, 2, 0, 3, 4, 5]], [DETAILS, 6, [1, 5]], [SUBSCRIPTIONS, 7, [1, 5]], [FUNCTIONS, 6, [1, 6, 7, 8, 0, 9, 10, 5]], [SAME, 11, [1, 6, 7, 8, 0, 9, 10, 5, 13, 14, 15, 16, 17]], [SNAPSHOT, 5, [1]], [SNAPSHOT_SAME, 12, [1, 5]]] as const;
    for (const [functionDeclaration, receiver, args] of cases) {
      const parameters: Runtime.CallFunctionOnParameterType & Readonly<{ throwOnSideEffect: true }> = { objectId: id(receiver), functionDeclaration, arguments: args.map(index => ({ objectId: id(index) })), returnByValue: false, throwOnSideEffect: true };
      const reply = await session.post("Runtime.callFunctionOn", parameters);
      assert.equal(reply.exceptionDetails, undefined, functionDeclaration.slice(0, 100));
      assert.ok(reply.result.subtype === "array" || reply.result.type === "boolean");
    }
    assert.equal(f.calls(), 0);
  } finally { await session.post("Runtime.releaseObjectGroup", { objectGroup: "completion-graph" }); session.disconnect(); Reflect.deleteProperty(globalThis, key); }
});
void test("the cursor consumes only its own original command and permanently refuses a malformed source reply", () => {
  // No fabricated receipt reaches an application: source classification must
  // Finish before the first graph command, and this case stops at that boundary.
  const raw = { nativeObjectId: "native", referencesObjectId: "refs", objectsObjectId: "objects", snapshotObjectId: "snapshot", guardObjectId: "guard", originalReferenceSlots: 44, prototypeDepth: 12, originalRequests: 63, encoderInvoked: false, continuationAuthorized: false } as const;
  const cursor: unknown = Reflect.construct(CurrentSchematicRelevanceCompletionCursor, [raw, Object.freeze({}), Object.freeze({}), Object.freeze({ qualifiedObjectId: "qualified" }), Object.freeze({}), 0, "script"]);
  assert.ok(cursor instanceof CurrentSchematicRelevanceCompletionCursor);
  const command = cursor.next(); assert.ok(command !== null && command.method === "Debugger.getScriptSource");
  assert.throws(() => { cursor.reserve({ ...command }); }); cursor.reserve(command); assert.throws(() => { cursor.accept(command, { scriptSource: "foreign source" }); }); assert.throws(() => cursor.next()); assert.throws(() => cursor.requireCompleted());
});
