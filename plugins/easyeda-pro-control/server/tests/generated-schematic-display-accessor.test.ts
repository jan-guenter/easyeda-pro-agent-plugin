/** Synthetic descriptor graphs and inspector packets only. No application
 * constructor, native owner, getter, setter or write capability is executed. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { GENERATED_SCHEMATIC_DISPLAY_ACCESSOR_CALLEE_FUNCTION, GENERATED_SCHEMATIC_DISPLAY_ACCESSOR_CLOSURE_FUNCTION,
  GENERATED_SCHEMATIC_DISPLAY_MONITOR_CLOSURE_FUNCTION } from "../src/generated-schematic-display-accessor-program.ts";
import { decodeGeneratedSchematicDisplayAccessorCallees, decodeGeneratedSchematicDisplayAccessorFunction,
  decodeGeneratedSchematicDisplayAccessorScopeValue, decodeGeneratedSchematicDisplayAccessorScopes, generatedSchematicDisplayPublicAccessorRole,
  qualifyGeneratedSchematicDisplayAccessorSource, requireGeneratedSchematicDisplayAccessorDescription } from "../src/generated-schematic-display-accessor-replies.ts";
import { GENERATED_SCHEMATIC_DISPLAY_ACCESSOR_CALLEES, GENERATED_SCHEMATIC_DISPLAY_ACCESSOR_SOURCE } from "../src/generated-schematic-display-accessor-source.ts";

void test("fixed callee/closure projections retain the same descriptor graph without calling a model", () => {
  const context = createContext({}); runInContext(`
let calls=0;const no=()=>{calls++;throw new Error("Model call forbidden");};
class Base{}class Text extends Base{}class Monitor{}
const shapes={_isBaseWatched:true},text=Object.create(Text.prototype),monitor=Object.create(Monitor.prototype);
Object.assign(text,{shapeManager:shapes,modelType:"Text",cmdKey:"text"});Object.assign(monitor,{shapeManager:shapes,_isWatched:true,setAttribute:()=>no(),record:()=>no()});
Object.defineProperty(Monitor.prototype,"watch",{value:function(){return no();}});shapes.modifyMonitor=monitor;
const setters={},descriptors={},decorators={};
for(const field of ["x","y","rotation","fontFamily","fontSize","fontWeight","italic","underline","hAlign","vAlign"]){
 const get=function(){return no();},raw=function(){return no();},set=field==="x"||field==="y"?raw:function(){return no();};
 Object.defineProperty(Base.prototype,field,{get,set,configurable:true,enumerable:false});
 setters[field]={object:text,owner:Base.prototype,key:field,get,set};descriptors[field]={get,set:raw,configurable:true,writable:undefined,enumerable:false};
 decorators[field]={setter:function(){return no();},accessor:function(){return no();}};
}
const target={pageUuid:"synthetic"},operation={operationId:"synthetic"},b={shapes,setters};
const identity=JSON.stringify({operation,target});const state={owner:null,identity,failed:false,modifyAttempted:false,saveAttempted:false,before:{text}};
const holder=[b,state];state.owner=holder;
`, context);
  assert.equal(runInContext(`(${GENERATED_SCHEMATIC_DISPLAY_ACCESSOR_CALLEE_FUNCTION}).call(holder,target,operation).length`, context), 26);
  assert.equal(runInContext(`(${GENERATED_SCHEMATIC_DISPLAY_ACCESSOR_CLOSURE_FUNCTION}).call(descriptors.rotation,holder,target,operation,"rotation",decorators.rotation,"rotation").length`, context), 4);
  assert.equal(runInContext(`(${GENERATED_SCHEMATIC_DISPLAY_MONITOR_CLOSURE_FUNCTION}).call(monitor,holder,target,operation)`, context), true);
  assert.throws(() => runInContext(`(${GENERATED_SCHEMATIC_DISPLAY_ACCESSOR_CLOSURE_FUNCTION}).call(descriptors.rotation,holder,target,operation,"rotation",decorators.rotation,"fontSize")`, context));
  assert.throws(() => runInContext(`(${GENERATED_SCHEMATIC_DISPLAY_MONITOR_CLOSURE_FUNCTION}).call({},holder,target,operation)`, context));
  assert.equal(runInContext("calls", context), 0);
  runInContext("setters.rotation.owner=Text.prototype", context);
  assert.throws(() => runInContext(`(${GENERATED_SCHEMATIC_DISPLAY_ACCESSOR_CALLEE_FUNCTION}).call(holder,target,operation)`, context));
});

function field(name: string, value: unknown, writable = true, enumerable = true, configurable = true): unknown {
  return { name, value, writable, enumerable, configurable, isOwn: true };
}
function functionPacket(role: "x.get" | "decoratedSetter"): { result: unknown[]; internalProperties: unknown[] } {
  const method = GENERATED_SCHEMATIC_DISPLAY_ACCESSOR_SOURCE[0].methods[role];
  const result = [field("length", { type: "number", value: method.arity }, false, false), field("name", { type: "string", value: method.name }, false, false)];
  if (role === "decoratedSetter") {
    result.push(field("arguments", { type: "object", subtype: "null", value: null }, false, false, false), field("caller", { type: "object", subtype: "null", value: null }, false, false, false),
      field("prototype", { type: "object", objectId: "wrapper.prototype" }, true, false, false));
  }
  return { result, internalProperties: [
    { name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: { scriptId: "original.script", lineNumber: method.lineNumber, columnNumber: method.columnNumber } } },
    { name: "[[Prototype]]", value: { type: "function", objectId: "function.prototype" } },
    { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", description: "Scopes[3]", objectId: "original.scopes" } }
  ] };
}
void test("function metadata requires exact original source locations and non-strict wrapper fields", () => {
  assert.deepEqual(decodeGeneratedSchematicDisplayAccessorFunction(functionPacket("x.get"), 0, "x.get", "original.script"), { scopes: "original.scopes", prototype: null });
  assert.deepEqual(decodeGeneratedSchematicDisplayAccessorFunction(functionPacket("decoratedSetter"), 0, "decoratedSetter", "original.script"), { scopes: "original.scopes", prototype: "wrapper.prototype" });
  assert.throws(() => decodeGeneratedSchematicDisplayAccessorFunction(functionPacket("x.get"), 0, "x.get", "borrowed.script"));
  const missing = functionPacket("decoratedSetter"); missing.result.splice(3, 1);
  assert.throws(() => decodeGeneratedSchematicDisplayAccessorFunction(missing, 0, "decoratedSetter", "original.script"));
  assert.equal(generatedSchematicDisplayPublicAccessorRole("rotation.set"), "decoratedSetter"); assert.equal(generatedSchematicDisplayPublicAccessorRole("x.set"), "x.set");
  requireGeneratedSchematicDisplayAccessorDescription("function(o){return i.setter.call(this,a,t,o)}", 0, "decoratedSetter");
  assert.throws(() => { requireGeneratedSchematicDisplayAccessorDescription("function(o){return i.setter.call(this,a,t,o);}", 0, "decoratedSetter"); });
  assert.throws(() => qualifyGeneratedSchematicDisplayAccessorSource({ scriptSource: "short unqualified source" }));
});
void test("scope decoding follows bounded lexical metadata and refuses a decorated validator", () => {
  const scopes = { result: ["Block", "Closure (nk)", "Global"].map((description, index) => field(String(index), { type: "object", subtype: "internal#scope", className: "Object", description, objectId: `scope.${index}` })) };
  assert.deepEqual(decodeGeneratedSchematicDisplayAccessorScopes(scopes), ["scope.0", "scope.1"]);
  assert.deepEqual(decodeGeneratedSchematicDisplayAccessorScopeValue({ result: [field("e", { type: "undefined" })] }, "e"), { kind: "undefined" });
  assert.deepEqual(decodeGeneratedSchematicDisplayAccessorScopeValue({ result: [field("t", { type: "string", value: "rotation" })] }, "t"), { kind: "field", field: "rotation" });
  assert.deepEqual(decodeGeneratedSchematicDisplayAccessorScopeValue({ result: [field("this", { type: "object", className: "sk", objectId: "original.monitor" })] }, "this", 0), { kind: "object", objectId: "original.monitor" });
  assert.throws(() => decodeGeneratedSchematicDisplayAccessorScopeValue({ result: [field("e", { type: "function", objectId: "validator" })] }, "e"));
  assert.throws(() => decodeGeneratedSchematicDisplayAccessorScopeValue({ result: [field("this", { type: "object", className: "sk", objectId: "original.monitor" })] }, "this", 1));
  const packet = { result: [...GENERATED_SCHEMATIC_DISPLAY_ACCESSOR_CALLEES.map((role, index) => field(String(index), { type: "function", className: "Function", description: role, objectId: `callee.${index}` })),
    field("length", { type: "number", value: 26 }, true, false, false)], internalProperties: [{ name: "[[Prototype]]", value: { type: "object", objectId: "array.prototype" } }] };
  assert.equal(Object.keys(decodeGeneratedSchematicDisplayAccessorCallees(packet)).length, 26);
  packet.result.pop(); assert.throws(() => decodeGeneratedSchematicDisplayAccessorCallees(packet));
});
