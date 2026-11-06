/** Synthetic same-realm holders/inspector packets only. No application,
 * action/factory/model call, native owner, getter or setter is executed. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { GENERATED_SCHEMATIC_DISPLAY_ACTION_ACTIVE_FUNCTION as ACTIVE, GENERATED_SCHEMATIC_DISPLAY_ACTION_CLOSURE_FUNCTION as CLOSURE,
  GENERATED_SCHEMATIC_DISPLAY_ACTION_PREFLIGHT_FUNCTION as PREFLIGHT, GENERATED_SCHEMATIC_DISPLAY_ACTION_SAME_FUNCTION as SAME } from "../src/generated-schematic-display-action-program.ts";
import { decodeGeneratedSchematicDisplayActionActiveCallees, decodeGeneratedSchematicDisplayActionActiveOwners, decodeGeneratedSchematicDisplayActionFunction, decodeGeneratedSchematicDisplayActionPreflightCallees,
  decodeGeneratedSchematicDisplayActionRecorderScope, decodeGeneratedSchematicDisplayActionScopes, qualifyGeneratedSchematicDisplayActionSource } from "../src/generated-schematic-display-action-replies.ts";
import { GENERATED_SCHEMATIC_DISPLAY_ACTION_ACTIVE_CALLEES, GENERATED_SCHEMATIC_DISPLAY_ACTION_METADATA_BUDGET,
  GENERATED_SCHEMATIC_DISPLAY_ACTION_PREFLIGHT_CALLEES, GENERATED_SCHEMATIC_DISPLAY_ACTION_SOURCE } from "../src/generated-schematic-display-action-source.ts";

void test("idle and actual active graph projections follow different callbacks without invoking application methods", () => {
  const context = createContext({}); runInContext(`let calls=0;const no=()=>{calls++;throw new Error("Application call forbidden");};
class Runner{run(){return no();}useAction(){return no();}_tryStartHistory(){return no();}_getActionRealOptions(){return no();}get currentAction(){return no();}set currentAction(v){no();}get running(){return no();}}
class HistoryBase{withResolvers(){return no();}transactionSuccessHandler(){return no();}transactionFailHandler(){return no();}}
class History extends HistoryBase{watch(){return no();}getModelHistoryCommand(){return no();}get isWatched(){return no();}}
class Group{constructor(){this._commands=new Set();}add(){return no();}}
const target={pageUuid:"synthetic"},operation={operationId:"synthetic"},page={},shapes={docManager:page},runner=new Runner(),history=new History(),text={shapeManager:shapes};
runner._currentAction=null;runner._historyResolversMap=new WeakMap();Object.assign(history,{shapeManager:shapes,_isWatched:true,_tryHandleGroupModelCommand:()=>no(),modelCommandMap:new Map(),onModelAttributeChange:no,onSubTreeInsertConnectedChild:no,onSubTreeRemoveConnectedChild:no});shapes.historyRecorder=history;
const b={shapes,page,runner,run:{object:runner,owner:Runner.prototype,key:"run",fn:Runner.prototype.run}},state={owner:null,identity:JSON.stringify({operation,target}),failed:false,modifyAttempted:false,modifyAcknowledged:false,saveAttempted:false,before:{text}},holder=[b,state];state.owner=holder;
`, context);
  const evaluate = (code: string): unknown => runInContext(code, context);
  assert.equal(evaluate(`const original=(${PREFLIGHT}).call(holder,target,operation);original.length`), 18);
  assert.throws(() => evaluate(`(${ACTIVE}).call(original,holder,target,operation)`));
  evaluate(`state.modifyAttempted=true;runner._currentAction={status:"running",history:"add"};history.batchSaveStack=new Group();const resolver={start:()=>no(),complete:()=>no(),failure:()=>no()};runner._historyResolversMap.set(shapes,resolver);history.onModelAttributeChange=()=>no();`);
  assert.equal(evaluate(`const active=(${ACTIVE}).call(original,holder,target,operation);active.length`), 11);
  assert.equal(evaluate(`(${CLOSURE}).call(history,holder,target,operation,original)`), true);
  assert.equal(evaluate(`(${SAME}).call(active,holder,target,operation,original)`), true);
  assert.throws(() => evaluate(`(${PREFLIGHT}).call(holder,target,operation)`));
  assert.throws(() => evaluate(`(${CLOSURE}).call({},holder,target,operation,original)`));
  evaluate(`const originalStack=history.batchSaveStack;history.batchSaveStack=new Group();`);
  assert.throws(() => evaluate(`(${SAME}).call(active,holder,target,operation,original)`));
  evaluate(`history.batchSaveStack=originalStack;runner._historyResolversMap.set(shapes,{...resolver});`);
  assert.throws(() => evaluate(`(${SAME}).call(active,holder,target,operation,original)`));
  evaluate(`runner._historyResolversMap.set(shapes,resolver);history.modelCommandMap.set(text,{});history.batchSaveStack._commands.add({});`);
  assert.throws(() => evaluate(`(${ACTIVE}).call(original,holder,target,operation)`));
  assert.equal(evaluate(`(${SAME}).call(active,holder,target,operation,original)`), true);
  evaluate(`history.onModelAttributeChange=()=>no();`); assert.throws(() => evaluate(`(${SAME}).call(active,holder,target,operation,original)`));
  evaluate(`history.onModelAttributeChange=active[0];resolver.start=()=>no();`); assert.throws(() => evaluate(`(${SAME}).call(active,holder,target,operation,original)`));
  assert.equal(evaluate("calls"), 0);
});
function field(name: string, value: unknown, writable = true, enumerable = true, configurable = true): unknown { return { name, value, writable, enumerable, configurable, isOwn: true }; }
function packet(roles: readonly string[], active = false): unknown {
  const owners = active ? ["x8", "Object", GENERATED_SCHEMATIC_DISPLAY_ACTION_SOURCE[0].methods.groupConstructor.name, "Object", "Map"] : [];
  return { result: [...roles.map((role, index) => field(String(index), { type: "function", className: "Function", objectId: `callee.${index}`, description: role })), ...owners.map((className, index) => field(String(roles.length + index), { type: "object", className, objectId: `owner.${index}`, ...(className === "Map" ? { subtype: "map" } : {}) })),
  field("length", { type: "number", value: roles.length + owners.length }, true, false, false)], internalProperties: [{ name: "[[Prototype]]", value: { type: "object", objectId: "array.prototype" } }] }; }
void test("finite metadata binds the active callback site/script and original recorder lexical this", () => {
  const method = GENERATED_SCHEMATIC_DISPLAY_ACTION_SOURCE[0].methods.historyActiveAttribute;
  const raw = { result: [field("name", { type: "string", value: "" }, false, false), field("length", { type: "number", value: 1 }, false, false)], internalProperties: [
    { name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: { scriptId: "original.script", lineNumber: method.lineNumber, columnNumber: method.columnNumber } } },
    { name: "[[Prototype]]", value: { type: "function", objectId: "function.prototype" } },
    { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", description: "Scopes[2]", objectId: "actual.scopes" } } ] };
  assert.deepEqual(decodeGeneratedSchematicDisplayActionFunction(raw, 0, "historyActiveAttribute", "original.script"), { scopes: "actual.scopes", prototype: null });
  assert.throws(() => decodeGeneratedSchematicDisplayActionFunction(raw, 0, "noop", "original.script"));
  assert.throws(() => decodeGeneratedSchematicDisplayActionFunction(raw, 1, "historyActiveAttribute", "original.script"));
  assert.throws(() => decodeGeneratedSchematicDisplayActionFunction(raw, 0, "historyActiveAttribute", "other.script"));
  assert.throws(() => decodeGeneratedSchematicDisplayActionFunction(raw, 0, "commandConstructor", "original.script"));
  const scope = { result: [field("this", { type: "object", className: "x8", objectId: "actual.history" })] };
  assert.equal(decodeGeneratedSchematicDisplayActionRecorderScope(scope, 0), "actual.history"); assert.throws(() => decodeGeneratedSchematicDisplayActionRecorderScope(scope, 1));
  assert.equal(decodeGeneratedSchematicDisplayActionRecorderScope({ result: [] }, 0), null);
  assert.throws(() => decodeGeneratedSchematicDisplayActionScopes({ result: [field("0", { type: "object", subtype: "internal#scope", className: "Object", objectId: "scope.global", description: "Global" })] }));
  const preflight = decodeGeneratedSchematicDisplayActionPreflightCallees(packet(GENERATED_SCHEMATIC_DISPLAY_ACTION_PREFLIGHT_CALLEES));
  const active = decodeGeneratedSchematicDisplayActionActiveCallees(packet(GENERATED_SCHEMATIC_DISPLAY_ACTION_ACTIVE_CALLEES, true), 0);
  assert.equal(Object.keys(preflight).length, 18); assert.equal(Object.keys(active).length, 6);
  const owners = decodeGeneratedSchematicDisplayActionActiveOwners(packet(GENERATED_SCHEMATIC_DISPLAY_ACTION_ACTIVE_CALLEES, true), 0);
  assert.deepEqual(owners, { history: "owner.0", resolver: "owner.1", stack: "owner.2", action: "owner.3", modelCommands: "owner.4" });
  assert.throws(() => decodeGeneratedSchematicDisplayActionActiveCallees(packet(GENERATED_SCHEMATIC_DISPLAY_ACTION_ACTIVE_CALLEES), 0));
  assert.throws(() => decodeGeneratedSchematicDisplayActionPreflightCallees(packet(GENERATED_SCHEMATIC_DISPLAY_ACTION_ACTIVE_CALLEES)));
  assert.throws(() => qualifyGeneratedSchematicDisplayActionSource({ scriptSource: "unqualified" }));
  const { cdpRequests, events, actionDispatchAuthorized, saveAuthorized, ...counts } = GENERATED_SCHEMATIC_DISPLAY_ACTION_METADATA_BUDGET;
  assert.equal(Object.values(counts).reduce((sum, count) => sum + count, 0), cdpRequests); assert.equal(events, 0); assert.equal(actionDispatchAuthorized || saveAuthorized, false);
});
