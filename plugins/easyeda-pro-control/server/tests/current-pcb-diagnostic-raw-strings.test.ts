import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { z } from "zod";
import { CURRENT_PCB_DIAGNOSTIC_RAW_STRINGS_FUNCTION, CURRENT_PCB_DIAGNOSTIC_RAW_STRINGS_FUNCTION_SHA256,
  CURRENT_PCB_DIAGNOSTIC_RAW_STRINGS_RESULT_BYTES, decodeCurrentPcbDiagnosticRawStringsReply } from "../src/current-pcb-diagnostic-raw-strings.ts";
import { currentPcbRawStringFailureDetail } from "../src/current-pcb-raw-string-failure.ts";

/** Self-authored raw layouts, not executed vendor code or a live PCB. */
const SETUP = `(()=>{
globalThis.getterReads=0;globalThis.vendorCalls=0;
class S{constructor(x,y){this.x=x;this.y=y;}}
class ee{constructor(){this.r=0;this.g=0;this.b=0;this.alpha=1;}}
class U8{constructor(){Object.assign(this,{num:1,type:0,origin:3,strokeWidth:0.8,mirror:false,showKey:false,showValue:true,fontFamily:"default",fontSize:12,reverse:false,reverseExpansion:0,positionIsNull:false,silkColor:new ee()});}}
class ib extends U8{constructor(){super();this._layerId=3;this._locked=false;}}
class Ls{constructor(){Object.assign(this,{_layerId:3,_locked:false,_leftLow:new S(0,0),_leftUp:new S(0,12),_rightLow:new S(10,0),_rightUp:new S(10,12)});}}
class rd{constructor(id){Object.assign(this,{_globalIndex:id,modelType:"Text",_dataState:0,_stateWatcher:undefined,_matrixChange:false,_key:"",_value:"Test",_position:new S(0,0),_rotation:0,base:new U8(),_box:new Ls()});}}
class yr{constructor(model){this.model=model;}}
class bo{constructor(){this.map=new Map();}}
bo.manager=new bo();const model=new rd("b".repeat(16));bo.manager.map.set(model._globalIndex,model);
class t7{constructor(){this.mgr=bo.manager;}}
const Jr=new t7();
class x{constructor(){this._id="a".repeat(32);this._doctype=3;}}
x.env=new x();
class Z1e{constructor(callback){this.callback=callback;this.isRunning=true;}}
class Oet{constructor(){this.subscribed={"pcb/saveCompiler":[new Z1e(()=>{vendorCalls++;})]};}}
class HJ{constructor(){this.messageBus=new Oet();}}
globalThis.MSG_BUS_PCB=new HJ();
globalThis.rawState={x,bo,Jr,model};
globalThis.scope={object:{x,bo,Jr,t7,rd,yr,U8,ib,Ls,S,ee}};
for(const key of ["zIndex","partition","globalIndex","position","box","locked","type","show","silkColor"]){
Object.defineProperty(rd.prototype,key,{get(){getterReads++;throw new Error("VENDOR_GETTER");}});
}
})();`;
const EXPRESSION = `(${CURRENT_PCB_DIAGNOSTIC_RAW_STRINGS_FUNCTION}).call(scope,MSG_BUS_PCB.messageBus.subscribed["pcb/saveCompiler"][0].callback)`;
const reply = (raw: unknown): unknown => ({ result: { type: "string", value: raw } });
function sample(change = ""): ReturnType<typeof decodeCurrentPcbDiagnosticRawStringsReply> {
  const context = createContext({});
  runInContext(SETUP + change, context, { timeout: 1000 });
  const raw: unknown = runInContext(EXPRESSION, context, { timeout: 1000 });
  assert.equal(runInContext("getterReads+vendorCalls", context) as unknown, 0);
  return decodeCurrentPcbDiagnosticRawStringsReply(reply(raw));
}

void test("raw String map includes watcherless models and preserves absent, undefined, null and zero", () => {
  const initial = sample();
  const first = initial.models[0];
  assert.equal(initial.managerModelCount, 1); assert.equal(first?.globalIndex, "b".repeat(16));
  assert.deepEqual(first?.zIndex, { kind: "absent" });
  assert.deepEqual(first?.stateWatcher, { kind: "undefined" });
  assert.equal(initial.sourceOwnershipVerified, false); assert.equal(initial.completeModelMembershipVerified, false);
  assert.equal(initial.writerSupported, false); assert.equal(initial.executionAuthorized, false);
  const raw = sample('Object.assign(rawState.model,{_zIndex:0,_partition:"",_groupID:0,_parent:null,_number:undefined});').models[0];
  assert.deepEqual(raw?.zIndex, { kind: "value", value: 0 });
  assert.deepEqual(raw?.partition, { kind: "value", value: "" });
  assert.deepEqual(raw?.groupId, { kind: "value", value: 0 });
  assert.deepEqual(raw?.parent, { kind: "null" }); assert.deepEqual(raw?.number, { kind: "undefined" });
  assert.deepEqual(raw?.base.silkColor, { kind: "value", value: { r: 0, g: 0, b: 0, alpha: 1 } });
  assert.ok(Object.isFrozen(initial)); assert.ok(Object.isFrozen(initial.models[0]?.base));
  assert.equal(CURRENT_PCB_DIAGNOSTIC_RAW_STRINGS_FUNCTION_SHA256,
    createHash("sha256").update(CURRENT_PCB_DIAGNOSTIC_RAW_STRINGS_FUNCTION).digest("hex"));
});

void test("raw observer accepts only the separately bounded empty-space base and reciprocal view", () => {
  const value = sample(`rawState.model.base=new scope.object.ib();delete rawState.model._box;
rawState.model._stateWatcher=new scope.object.yr(rawState.model);`).models[0];
  assert.equal(value?.base.kind, "ib"); assert.deepEqual(value?.box, { kind: "absent" });
  assert.deepEqual(value?.base.layerId, { kind: "value", value: 3 });
  assert.deepEqual(value?.stateWatcher, { kind: "value", value: "reciprocal-yr" });
  const empty = sample("rawState.bo.manager.map.clear();");
  assert.equal(empty.managerModelCount, 0); assert.deepEqual(empty.models, []);
  assert.equal(empty.emptyRootPcbVerified, false); assert.equal(empty.completeLiveBaselineVerified, false);
});

void test("raw observer refuses unsupported owners, model kinds, parent references, lossy numbers and accessors", () => {
  for (const change of [
    "rawState.Jr.mgr={};", "rawState.x.env._doctype=4;", 'rawState.model.modelType="Image";',
    'rawState.bo.manager.map.set("c".repeat(16),rawState.model);',
    'Object.setPrototypeOf(rawState.model,{});', 'rawState.model._parent={};', 'rawState.model._key="Name";',
    "rawState.model._zIndex=-0;", "rawState.model._rotation=NaN;", "rawState.model._position.x=Infinity;",
    'rawState.model.base.silkColor="";', 'rawState.model.base.silkColor={r:0,g:0,b:0,alpha:1};',
    "rawState.model.base._layerId=3;", "rawState.model._stateWatcher=new scope.object.yr({});",
    'Object.defineProperty(rawState.model,"_zIndex",{get(){getterReads++;throw new Error("GETTER");}});',
    'Object.defineProperty(scope.object.rd.prototype,"_partition",{value:"shadow"});',
    'rawState.model._value="x".repeat(1025);',
    'for(let i=0;i<17;i++){const id=i.toString(16).padStart(16,"0");rawState.bo.manager.map.set(id,new scope.object.rd(id));}',
  ]) { assert.throws(() => sample(change), /PCB_DIAGNOSTIC_RAW_STRINGS_STATE/u, change); }
});

void test("raw reply decoder rejects extra claims, mismatched membership, duplicates and oversized UTF-8", () => {
  const context = createContext({});
  runInContext(SETUP, context, { timeout: 1000 });
  const raw: unknown = runInContext(EXPRESSION, context, { timeout: 1000 });
  assert.equal(typeof raw, "string");
  if (typeof raw !== "string") { throw new TypeError("Synthetic raw String result is not text."); }
  for (const input of [
    { result: { type: "string", value: raw, objectId: "retained" } },
    { result: { type: "string", value: raw }, exceptionDetails: {} },
    reply(raw.replace('"managerModelCount":1', '"managerModelCount":0')),
    reply(raw.replace('"managerModelCount":1', '"managerModelCount":1,"managerModelCount":1')),
    reply(raw.replace('"managerModelCount":1', '"managerModelCount":-0')),
    reply(raw.replace('"models":', '"writerSupported":true,"models":')),
    reply(raw.replace('"x":0', '"x":-0')),
    reply(raw.replace('"modelType":"Text"', '"modelType":"Attribute"')),
    reply(raw.replace('"value":"Test"', String.raw`"value":"\ud800"`)),
    reply("é".repeat(CURRENT_PCB_DIAGNOSTIC_RAW_STRINGS_RESULT_BYTES)),
  ]) { assert.throws(() => decodeCurrentPcbDiagnosticRawStringsReply(input), /RAW_STRINGS_REPLY/u); }
  let accessed = false;
  const hostile = Object.defineProperty({}, "result", { get(): never { accessed = true; throw new Error("ACCESSOR"); } });
  assert.throws(() => decodeCurrentPcbDiagnosticRawStringsReply(hostile), /RAW_STRINGS_REPLY/u); assert.equal(accessed, false);
  const proxy = new Proxy({}, { ownKeys(): never { throw new Error("PROXY"); } });
  assert.throws(() => decodeCurrentPcbDiagnosticRawStringsReply(proxy), /RAW_STRINGS_REPLY/u);
});

void test("malformed CDP and side-effect refusals retain only the bounded decode/reply label", () => {
  let read = false;
  const exception = Object.defineProperty({}, "text", { get(): never { read = true; throw new Error("PRIVATE_VENDOR_TEXT"); } });
  for (const input of [{ result: { type: "undefined" }, exceptionDetails: exception }, reply("not-json"), reply("é".repeat(65_536))]) {
    assert.throws(() => decodeCurrentPcbDiagnosticRawStringsReply(input), caught => {
      assert.ok(caught instanceof Error); assert.equal(caught.message, "PCB_DIAGNOSTIC_RAW_STRINGS_REPLY");
      assert.deepEqual(currentPcbRawStringFailureDetail(caught), {
        schema: "easyeda-pro-control.pcb-raw-string-failure.v1", stage: "decode", reason: "reply",
      }); return true;
    });
  }
  assert.equal(read, false);
  assert.equal(currentPcbRawStringFailureDetail(new Error("PCB_DIAGNOSTIC_RAW_STRINGS_REPLY")), null);
});

void test("the raw observer bounds the aggregate encoded response without truncating membership", () => {
  const expanded = `rawState.bo.manager.map.clear();
for(let i=0;i<16;i++){const id=i.toString(16).padStart(16,"0"),m=new scope.object.rd(id);
m._value="A".repeat(1024);rawState.bo.manager.map.set(id,m);}`;
  const full = sample(expanded);
  assert.equal(full.managerModelCount, 16); assert.equal(full.models.length, 16);
  assert.throws(() => sample(String.raw`${expanded}for(const m of rawState.bo.manager.map.values())m._value="\u0000".repeat(1024);`),
    /PCB_DIAGNOSTIC_RAW_STRINGS_STATE/u);
});

/** A real local inspector executes only the self-authored fixture and fixed
 * leaf. It proves synthetic side-effect compatibility, not EasyEDA admission. */
void test("fixed raw observer runs under inspector side-effect checking and refuses state-changing proxy traps", async () => {
  const session = new Session(); session.connect();
  const name = "pcb-raw-strings-synthetic";
  let uniqueContextId = "";
  session.on("Runtime.executionContextCreated", ({ params }): void => {
    if (params.context.name === name && "uniqueId" in params.context && typeof params.context.uniqueId === "string") {
      uniqueContextId = params.context.uniqueId;
    }
  });
  try {
    await session.post("Runtime.enable");
    const context = createContext({}, { name });
    runInContext(SETUP, context, { timeout: 1000 });
    assert.notEqual(uniqueContextId, "");
    const evaluate = (): Promise<unknown> => session.post("Runtime.evaluate", { expression: EXPRESSION, uniqueContextId,
      returnByValue: true, throwOnSideEffect: true, silent: true, awaitPromise: false, generatePreview: false,
      includeCommandLineAPI: false, allowUnsafeEvalBlockedByCSP: false, userGesture: false, timeout: 1000 });
    const state = decodeCurrentPcbDiagnosticRawStringsReply(await evaluate());
    assert.equal(state.managerModelCount, 1);
    runInContext(`const original=rawState.model;rawState.bo.manager.map.set(original._globalIndex,
new Proxy(original,{getOwnPropertyDescriptor(target,key){getterReads++;return Reflect.getOwnPropertyDescriptor(target,key);}}));`, context);
    const refused = await evaluate();
    assert.throws(() => decodeCurrentPcbDiagnosticRawStringsReply(refused), /RAW_STRINGS_REPLY/u);
    assert.equal(runInContext("getterReads+vendorCalls", context) as unknown, 0);
  } finally { session.disconnect(); }
});

/** Runtime.evaluate on a supplied scope-shaped object does not exercise V8's
 * internal scope wrapper. This follows the retained function -> [[Scopes]] ->
 * scope zero -> callFunctionOn path without executing any vendor source. */
void test("raw observer uses an actual V8 closure scope and original remote callback with callFunctionOn", async () => {
  const session = new Session(); session.connect();
  const name = "pcb-raw-strings-remote-scope-synthetic";
  let uniqueContextId = "";
  session.on("Runtime.executionContextCreated", ({ params }): void => {
    if (params.context.name === name && "uniqueId" in params.context && typeof params.context.uniqueId === "string") {
      uniqueContextId = params.context.uniqueId;
    }
  });
  try {
    await session.post("Runtime.enable");
    const context = createContext({}, { name });
    const closure = SETUP.replace("globalThis.rawState=", "globalThis.syntheticHandler=async()=>[x,bo,Jr,t7,rd,yr,U8,ib,Ls,S,ee];globalThis.rawState=");
    runInContext(closure, context, { timeout: 1000 });
    assert.notEqual(uniqueContextId, "");
    const remote = z.object({ objectId: z.string().min(1).optional(), subtype: z.string().optional(), description: z.string().optional() });
    const property = z.object({ name: z.string(), value: remote });
    const evaluate = (expression: string): Promise<unknown> => session.post("Runtime.evaluate", { expression, uniqueContextId, returnByValue: false });
    const properties = (objectId: string): Promise<unknown> => session.post("Runtime.getProperties", { objectId,
      ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
    const handler = z.object({ result: remote }).parse(await evaluate("syntheticHandler"));
    const handlerId = handler.result.objectId; assert.ok(handlerId !== undefined);
    const handlerProperties = z.object({ internalProperties: z.array(property) }).parse(await properties(handlerId));
    const scopesId = handlerProperties.internalProperties.find(item => item.name === "[[Scopes]]")?.value.objectId; assert.ok(scopesId !== undefined);
    const scopes = z.object({ result: z.array(property) }).parse(await properties(scopesId));
    const first = scopes.result.find(item => item.name === "0")?.value; assert.ok(first);
    assert.equal(first.subtype, "internal#scope"); assert.equal(first.description, "Closure");
    const scopeId = first.objectId; assert.ok(scopeId !== undefined);
    const callback = z.object({ result: remote }).parse(await evaluate('MSG_BUS_PCB.messageBus.subscribed["pcb/saveCompiler"][0].callback'));
    const callbackId = callback.result.objectId; assert.ok(callbackId !== undefined);
    const observe = (): Promise<unknown> => session.post("Runtime.callFunctionOn", { objectId: scopeId,
      functionDeclaration: CURRENT_PCB_DIAGNOSTIC_RAW_STRINGS_FUNCTION, arguments: [{ objectId: callbackId }],
      returnByValue: true, throwOnSideEffect: true, silent: true, awaitPromise: false, generatePreview: false, userGesture: false });
    assert.equal(decodeCurrentPcbDiagnosticRawStringsReply(await observe()).managerModelCount, 1);
    runInContext("rawState.bo.manager.map.clear();", context);
    assert.equal(decodeCurrentPcbDiagnosticRawStringsReply(await observe()).managerModelCount, 0);
    runInContext("rawState.Jr.mgr={};", context);
    const rejected = await observe();
    assert.throws(() => decodeCurrentPcbDiagnosticRawStringsReply(rejected), caught => {
      assert.deepEqual(currentPcbRawStringFailureDetail(caught), {
        schema: "easyeda-pro-control.pcb-raw-string-failure.v1", stage: "view-manager", reason: "guard",
      }); return true;
    });
    assert.equal(runInContext("getterReads+vendorCalls", context) as unknown, 0);
  } finally { session.disconnect(); }
});
