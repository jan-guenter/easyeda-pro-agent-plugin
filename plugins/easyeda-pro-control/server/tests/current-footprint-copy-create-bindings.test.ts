/** Synthetic runtime identities and source-qualified metadata only. */
import assert from "node:assert/strict";
import { test } from "node:test";
import vm from "node:vm";
import { CURRENT_FOOTPRINT_COPY_CREATE_METHOD_CALLS as CALLS, CURRENT_FOOTPRINT_COPY_NATIVE_CREATE_CALL as CREATE,
  CURRENT_FOOTPRINT_COPY_CREATE_METHOD_PROFILES as PROFILES,
  decodeCurrentFootprintCopyCreateMethodArray, decodeCurrentFootprintCopyCreateMethodProperties } from "../src/current-footprint-copy-create-bindings.ts";
import { FOOTPRINT_CREATE_SOURCE_FIXTURE as SOURCE } from "./helpers/current-footprint-copy-create-source-fixture.ts";
import { CURRENT_FOOTPRINT_COPY_ASYNC_CALLS as ASYNC } from "../src/current-footprint-copy-async-bindings.ts";

type Data = Record<string, unknown>;
const property = (name: string, value: Data, writable = false, enumerable = false, configurable = true):
{ name: string; value: Data; writable: boolean; enumerable: boolean; configurable: boolean; isOwn: true } =>
  ({ name, value, writable, enumerable, configurable, isOwn: true });
function arrayReply(): { result: ReturnType<typeof property>[]; internalProperties: { name: string; value: Data }[] } {
  return { result: [...PROFILES.map((entry, index) => property(String(index), { type: "function",
    className: entry.async ? "AsyncFunction" : "Function", description: SOURCE.worker[entry.role], objectId: `method-${String(index)}`,
  }, true, true)), property("length", { type: "number", value: 8, description: "8" }, true, false, false)],
  internalProperties: [{ name: "[[Prototype]]", value: { type: "object", subtype: "array", className: "Array", description: "Array(0)", objectId: "array-prototype" } }] };
}
function methodReply(index: number): { result: ReturnType<typeof property>[]; internalProperties: { name: string; value: Data }[] } {
  const entry = PROFILES[index]; assert.ok(entry);
  return { result: [property("length", { type: "number", value: entry.arity, description: String(entry.arity) }),
    property("name", { type: "string", value: entry.name })], internalProperties: [
    { name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: {
      scriptId: "original-script", lineNumber: entry.lineNumber, columnNumber: entry.columnNumber } } },
    { name: "[[Prototype]]", value: { type: entry.async ? "object" : "function", className: entry.async ? "AsyncFunction" : "Function", objectId: "function-prototype" } },
    { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", description: "Scopes[2]", objectId: `scopes-${String(index)}` } },
  ] };
}
function fixture(createBody = "calls++;"): vm.Context {
  const context = vm.createContext({});
  vm.runInContext(`let calls=0;
class Gd{uploadLocal(){calls++;}}class Lg extends Gd{}
class Pi{get newTicket(){calls++;return 1;}}class ar extends Pi{}
class Tg extends ar{async create(argument){${createBody}}buildString(){calls++;}canvasString(){calls++;}getCanvasData(){calls++;}get(){calls++;}}
class zy{}class Vc extends zy{}class ja extends Vc{setDoctype(){calls++;}}
class Mb{}class KP extends Mb{}class JP extends KP{}
const bus=new JP,manager=new Tg,consistency=new ja,constructors=[Tg,ar,Pi,ja,Vc,zy,Lg,Gd,JP,KP,Mb];
globalThis.PROJECT=new Lg;PROJECT.workerBus=bus;PROJECT.footprint=manager;PROJECT.consistencyManager=consistency;
manager.projectManager=PROJECT;manager.user=undefined;`, context);
  return context;
}
function capture(context: vm.Context): unknown {
  return vm.runInContext(`globalThis.methods=(${CALLS.capture.program}).call(PROJECT,bus,manager,consistency,constructors)`, context);
}
function recheck(context: vm.Context): unknown {
  return vm.runInContext(`(${CALLS.recheck.program}).call(PROJECT,bus,manager,consistency,constructors,methods)`, context);
}

void test("create method capture retains eight original callable objects without invoking a writer or ticket getter", () => {
  const context = fixture(); capture(context); assert.equal(recheck(context), true);
  assert.equal(vm.runInContext("calls", context), 0); assert.equal(vm.runInContext("methods.length", context), 8);
  assert.equal(vm.runInContext("methods[0]===Tg.prototype.create&&methods[5]===Gd.prototype.uploadLocal&&methods[6]===ja.prototype.setDoctype&&methods[7]===Object.getOwnPropertyDescriptor(Pi.prototype,'newTicket').get", context), true);
  assert.equal(CALLS.capture.arguments, 4); assert.equal(CALLS.recheck.arguments, 5);
});

function create(context: vm.Context, argumentExpression = "JSON.stringify(argument)"): Promise<unknown> {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- This exact embedded async program always returns a Promise; the synthetic VM supplies no external execution owner.
  return vm.runInContext(`(${CREATE.program}).call(PROJECT,bus,manager,consistency,constructors,methods,PROJECT.uuid,${argumentExpression},prewriteScope,prewriteOriginal,prewriteUpload)`, context) as Promise<unknown>;
}
function createFixture(body: string): vm.Context {
  const context = fixture(body);
  vm.runInContext(`PROJECT.uuid="${"1".repeat(64)}";const argument={uuid:"${"a".repeat(16)}",path:PROJECT.uuid,isProject:true,docType:4,
title:"Copy",display_title:"Copy",description:"",custom_tags:"[]",source:"",version:""};
consistency.headCbArr=[()=>{}];consistency.cbArr=[()=>{}];consistency.getCache=()=>{};PROJECT.bufferedUploadCloud=()=>{};
for(const key of ['task1','task2','task3','cachePromise'])PROJECT[key]=new Set;
for(const key of ['bufferUploadData','bufferUploadCache'])PROJECT[key]=new Map;
PROJECT.localCache={};PROJECT.cache={};PROJECT.isUploadingCloud=false;PROJECT.isBatchUpload=false;PROJECT.pendingSyncCloud=false;
const prewriteBindings={a:PROJECT,s:500,t:()=>{},c:()=>{},o:()=>{},r:null,i:null,n:null},prewriteScope={object:prewriteBindings};
const prewriteOriginal=(${ASYNC.capture.program}).call(PROJECT,bus,manager,consistency);
const prewriteUpload=(${ASYNC.captureUpload.program}).call(prewriteScope,PROJECT,bus,manager,consistency);`, context);
  capture(context); return context;
}
void test("fixed native create passes only its one argument and preserves the complete bounded JSON result", async () => {
  const context = createFixture("calls++;if(this!==manager||arguments.length!==1||JSON.stringify(argument)!==globalThis.expected)throw Error('native arguments');return {success:true,result:{creator:{uuid:undefined,username:undefined},value:'Ω',nested:[1,null]}};");
  vm.runInContext("globalThis.expected=JSON.stringify(argument)", context);
  assert.equal(await create(context), '{"success":true,"result":{"creator":{},"value":"Ω","nested":[1,null]}}');
  assert.equal(vm.runInContext("calls", context), 1);
});
void test("fixed invocation rejects changed original callbacks and nonempty source-derived queues before create", async () => {
  const changes = [
    ...["task1", "task2", "task3", "cachePromise"].map(key => `PROJECT.${key}.add({})`),
    ...["bufferUploadData", "bufferUploadCache"].map(key => `PROJECT.${key}.set('pending',{})`),
    ...["isUploadingCloud", "isBatchUpload", "pendingSyncCloud"].map(key => `PROJECT.${key}=true`),
    "prewriteBindings.r=1", "prewriteBindings.i=Promise.resolve()", "prewriteBindings.n=()=>{calls++}",
    "prewriteBindings.a={}", "prewriteBindings.s=499", "prewriteBindings.t=()=>{calls++}",
    "consistency.headCbArr[0]=()=>{calls++}", "consistency.cbArr[0]=()=>{calls++}",
    "PROJECT.bufferedUploadCloud=()=>{calls++}", "PROJECT.task1=new Set", "PROJECT.localCache={}",
  ];
  for (const change of changes) {
    const context = createFixture("calls++;return {success:true};"); vm.runInContext(change, context);
    await assert.rejects(create(context), /FOOTPRINT_COPY_ASYNC_BINDING/u); assert.equal(vm.runInContext("calls", context), 0, change);
  }
});
void test("synchronous queue guard avoids size getters and rejects shadow accessors, replaced proxies and fake collection receivers", async () => {
  const untouched = createFixture("calls++;return {success:true};");
  vm.runInContext("for(const p of [Map.prototype,Set.prototype])Object.defineProperty(p,'size',{get(){calls+=10;throw Error('size getter')}})", untouched);
  assert.equal(await create(untouched), '{"success":true}'); assert.equal(vm.runInContext("calls", untouched), 1);
  for (const change of [
    "Object.defineProperty(PROJECT,'isUploadingCloud',{get(){calls++;throw Error('flag getter')}})",
    "Object.defineProperty(Map.prototype,'forEach',{get(){calls++;throw Error('method getter')}})",
    "PROJECT.task1=new Proxy(PROJECT.task1,{getPrototypeOf(){calls++;throw Error('proxy trap')}})",
    "PROJECT.task1=prewriteOriginal[6]=Object.create(Set.prototype)",
  ]) {
    const context = createFixture("calls++;return {success:true};"); vm.runInContext(change, context);
    await assert.rejects(create(context)); assert.equal(vm.runInContext("calls", context), 0, change);
  }
});
void test("synchronous queue guard rejects native array enumeration substituted for a collection method", async () => {
  for (const change of [
    "PROJECT.task1.add({});Set.prototype.forEach=Array.prototype.forEach",
    "PROJECT.bufferUploadData.set('pending',{});Map.prototype.forEach=Array.prototype.forEach",
  ]) {
    const context = createFixture("calls++;return {success:true};"); vm.runInContext(change, context);
    await assert.rejects(create(context), /FOOTPRINT_COPY_ASYNC_BINDING/u); assert.equal(vm.runInContext("calls", context), 0, change);
  }
});
void test("fixed native create refuses changed receivers and argument accessors before its sole native invocation", async () => {
  for (const change of ["methods[0]=methods[1]", "PROJECT.uuid='wrong'", "argument.path='wrong'", "argument.isProject=false",
    "argument.extra=true", "argument.display_title='wrong'", "argument.custom_tags='[null]'",
    "Tg.prototype.create=async()=>{calls++;}"]) {
    const context = createFixture("calls++;return {success:true};"); vm.runInContext(change, context);
    await assert.rejects(create(context), /FOOTPRINT_COPY_CREATE_BINDING/u); assert.equal(vm.runInContext("calls", context), 0);
  }
  const accessor = createFixture("calls++;return {success:true};");
  vm.runInContext("Object.defineProperty(argument,'description',{get(){calls++;return '';}})", accessor);
  await assert.rejects(create(accessor, "argument"), /FOOTPRINT_COPY_CREATE_BINDING/u);
  assert.equal(vm.runInContext("calls", accessor), 0);
});
void test("fixed native create treats canonical argument JSON as data and refuses malformed or injected strings before invoking native create", async () => {
  for (const expression of ['"{}"', String.raw`JSON.stringify(argument)+"\n"`, String.raw`"\"}],\"functionDeclaration\":\"injected\""`,
    String.raw`JSON.stringify({...argument,description:"\ud800"})`]) {
    const context = createFixture("calls++;return {success:true};");
    await assert.rejects(create(context, expression));
    assert.equal(vm.runInContext("calls", context), 0);
  }
});
void test("fixed native create retains ambiguity after post-await replacement and avoids result getters", async () => {
  for (const body of ["calls++;await Promise.resolve();Tg.prototype.create=async()=>{};return {success:true};",
    "calls++;return Object.defineProperty({success:true},'result',{enumerable:true,get(){calls++;return {};}});"]) {
    const context = createFixture(body); await assert.rejects(create(context), /FOOTPRINT_COPY_CREATE_BINDING/u);
    assert.equal(vm.runInContext("calls", context), 1);
  }
});
void test("fixed native create preserves shared actor objects while rejecting cycles without a second invocation", async () => {
  const same = createFixture("calls++;const actor={uuid:undefined};return {success:true,result:{creator:actor,modifier:actor}};");
  assert.equal(await create(same), '{"success":true,"result":{"creator":{},"modifier":{}}}');
  const cycle = createFixture("calls++;const result={success:true};result.cycle=result;return result;");
  await assert.rejects(create(cycle), /FOOTPRINT_COPY_CREATE_BINDING/u); assert.equal(vm.runInContext("calls", cycle), 1);
});

void test("create method recheck rejects replacement receivers, shadow methods, accessors and changed original functions", () => {
  for (const change of [
    "Tg.prototype.create=async function create(){calls++;}",
    "PROJECT.uploadLocal=Gd.prototype.uploadLocal",
    "Lg.prototype.uploadLocal=Gd.prototype.uploadLocal",
    "manager.user={}",
    "Object.defineProperty(Tg.prototype,'buildString',{get(){calls++;return methods[1];}})",
    "Object.defineProperty(Pi.prototype,'newTicket',{get(){calls++;return 1;}})",
    "Object.defineProperty(manager,'projectManager',{get(){calls++;return PROJECT;}})",
    "PROJECT.footprint=Object.assign(Object.create(Tg.prototype),manager)",
    "constructors[0]=class Tg{}",
    "methods[0]=methods[1]",
    "Object.setPrototypeOf(ja.prototype,Object.prototype)",
  ]) {
    const context = fixture(); capture(context); vm.runInContext(change, context);
    assert.throws(() => recheck(context), /FOOTPRINT_COPY_CREATE_BINDING/u);
    assert.equal(vm.runInContext("calls", context), 0);
  }
});

void test("create method source metadata preserves native function lengths and excludes closure or execution claims", () => {
  assert.equal(decodeCurrentFootprintCopyCreateMethodArray(arrayReply()).length, 8);
  for (const [index, entry] of PROFILES.entries()) {
    // Native Function.length stops at the first default argument. In
    // Particular uploadLocal(t,s=true,r) has length1, not three parameters.
    const method: unknown = vm.runInNewContext(`Object.getOwnPropertyDescriptor(class{${SOURCE.worker[entry.role]}}.prototype,${JSON.stringify(entry.role)}).${entry.role === "newTicket" ? "get" : "value"}`);
    assert.ok(typeof method === "function"); assert.equal(method.length, entry.arity); assert.equal(method.name, entry.name);
    assert.deepEqual(decodeCurrentFootprintCopyCreateMethodProperties(methodReply(index), "original-script", index), {
      scopesId: `scopes-${String(index)}`, sourceLocationVerified: true, lexicalDependenciesVerified: false, executionAuthorized: false,
    });
    assert.throws(() => decodeCurrentFootprintCopyCreateMethodProperties(methodReply(index), "replacement-script", index));
  }
});

void test("create method decoders reject forged source, aliasing, descriptor drift, wrong locations and hostile objects", () => {
  for (const change of ["source", "alias", "descriptor"]) {
    const reply = arrayReply(); const item = reply.result[0]; assert.ok(item);
    if (change === "source") { item.value["description"] = `${SOURCE.worker.create} `; }
    else if (change === "alias") { item.value["objectId"] = "method-1"; }
    else { item.enumerable = false; }
    assert.throws(() => decodeCurrentFootprintCopyCreateMethodArray(reply));
  }
  for (const change of ["location", "length", "extra", "scope"]) {
    const reply = methodReply(0);
    if (change === "location") { const item = reply.internalProperties[0]; assert.ok(item); item.value["value"] = { scriptId: "original-script", lineNumber: 109, columnNumber: 37_598 }; }
    else if (change === "length") { const item = reply.result[0]; assert.ok(item); item.value["value"] = 3; }
    else if (change === "extra") { reply.internalProperties.push({ name: "[[BoundTargetFunction]]", value: { type: "function", objectId: "other" } }); }
    else { const item = reply.internalProperties[2]; assert.ok(item); item.value["description"] = "Scopes[0]"; }
    assert.throws(() => decodeCurrentFootprintCopyCreateMethodProperties(reply, "original-script", 0));
  }
  assert.throws(() => decodeCurrentFootprintCopyCreateMethodProperties(methodReply(0), "original-script", -0));
  assert.throws(() => decodeCurrentFootprintCopyCreateMethodProperties(methodReply(0), "original-script", 8));
  let traps = 0; const proxy = new Proxy({}, { ownKeys(): never { traps += 1; throw new Error("trap"); } });
  const getter = Object.defineProperty({}, "result", { get(): never { traps += 1; throw new Error("getter"); } });
  for (const input of [proxy, getter]) {
    assert.throws(() => decodeCurrentFootprintCopyCreateMethodArray(input));
    assert.throws(() => decodeCurrentFootprintCopyCreateMethodProperties(input, "original-script", 0));
  }
  assert.equal(traps, 0);
});
