/** Original SDK classes on inert buses with real VM-native Promises. No application-owned SDK
 * instance, native job, document, edit, Save or reopened authority is issued. */
import assert from "node:assert/strict";
import {createHook} from "node:async_hooks";
import {createHash} from "node:crypto";
import {test} from "node:test";
import {types} from "node:util";
import {createContext,runInContext} from "node:vm";
import type {Context} from "node:vm";
import {CURRENT_SCHEMATIC_WIRE_PUBLIC_FACTS as FACTS,CURRENT_SCHEMATIC_WIRE_PUBLIC_SOURCE as SOURCE,CURRENT_SCHEMATIC_WIRE_PUBLIC_TEXT as TEXT,qualifyCurrentSchematicWirePublicSource as qualify} from "../src/current-schematic-wire-public-source.ts";
import type {CurrentSchematicWirePublicSourceSpan} from "../src/current-schematic-wire-public-source.ts";
import {INSTALLED_EASYEDA_SOURCE_SKIP_REASON,readConfiguredEasyedaAssets} from "./helpers/installed-easyeda-source.ts";

function promise(value:unknown):Promise<unknown>{assert.ok(types.isPromise(value));return value;}
function field(value:unknown,key:string):unknown{assert.ok(value!==null&&typeof value==="object");return Reflect.get(value,key)as unknown;}
function invoke(value:unknown,args:readonly unknown[]):unknown{assert.ok(typeof value==="function");return Reflect.apply(value,undefined,args);}
function hash(text:string):string{return createHash("sha256").update(text).digest("hex");}
interface RpcCall {readonly topic:string;readonly args:unknown;readonly inner:Promise<unknown>;readonly promises:readonly Promise<unknown>[];}
function observe(pending:Promise<unknown>):{state:{settled:boolean};result:Promise<unknown>}{
 const state={settled:false};async function wait():Promise<unknown>{const value=await pending;state.settled=true;return value;}return{state,result:wait()};
}
function fixture():{realm:Context;calls:readonly RpcCall[];start:(expression:string)=>Promise<unknown>}{
 const calls:RpcCall[]=[],promises:Promise<unknown>[]=[];
 let collecting=false;
 const hook=createHook({init(_id,type,_trigger,resource:unknown){if(collecting&&type==="PROMISE"){promises.push(promise(resource));}}});
 const realm=createContext({T:{extensionApiMessageBus2:{rpcCall(topic:string,args:unknown){const inner=promises.at(-1);assert.ok(inner);calls.push({topic,args,inner,promises:[...promises]});return Promise.resolve();}}}});
 runInContext(`var Xa=${TEXT.state};var v0=${TEXT.api};var api=new v0;`,realm);
 return {realm,calls,start(expression:string):Promise<unknown>{assert.equal(calls.length,0);hook.enable();collecting=true;try{return promise(runInContext(expression,realm)as unknown);}finally{collecting=false;hook.disable();}}};
}
void test("fixed Wire source text and qualifiers remain inert data",()=>{
 assert.equal(hash(TEXT.api),SOURCE[0].roles.apiClass.sha256);
 assert.equal(hash(TEXT.state),SOURCE[0].roles.stateClass.sha256);
 assert.equal(hash(TEXT.ui),SOURCE[1].roles.uiClass.sha256);
 assert.equal(hash(TEXT.uiNamespace),SOURCE[1].roles.uiNamespace.sha256);
 assert.equal(FACTS.modifyAwaitsDone,false);
 assert.equal(FACTS.geometryAwaitsNetCompiler,true);
 assert.equal(FACTS.compilerTransitiveEffectsClosed,false);
 for(const key of["publicExecutionValidated","originalReceiverVerified","nativeJobVerified","historyVerified","sqlVerified","saveVerified","reopenedVerified","executionAuthorized"]as const){assert.equal(FACTS[key],false);}
 assert.throws(()=>qualify(TEXT.api),/SCHEMATIC_WIRE_PUBLIC_SOURCE/u);
 assert.throws(()=>qualify(""),/SCHEMATIC_WIRE_PUBLIC_SOURCE/u);
});
void test("all four installed public Wire files and UTF16 role spans qualify exactly",async context=>{
 const sources=await readConfiguredEasyedaAssets(SOURCE.map(row=>row.relativePath));
 if(sources===null){context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON);return;}
 for(const[index,source]of sources.entries()){
  assert.equal(qualify(source),index);
  assert.throws(()=>qualify(`${source} `),/SCHEMATIC_WIRE_PUBLIC_SOURCE/u);
  const profile=SOURCE[index];assert.ok(profile);
  const roles:Readonly<Record<string,CurrentSchematicWirePublicSourceSpan>>=profile.roles;
  for(const row of Object.values(roles)){
   const value=source.slice(row.start,row.end);assert.equal(hash(value),row.sha256);
   const before=source.slice(0,row.start);assert.equal(before.split("\n").length-1,row.lineNumber);assert.equal(row.start-before.lastIndexOf("\n")-1,row.columnNumber);
  }
  const first=Object.values(roles)[0];assert.ok(first);
  const at=first.start;assert.throws(()=>qualify(`${source.slice(0,at)}!${source.slice(at+1)}`),/SCHEMATIC_WIRE_PUBLIC_SOURCE/u);
 }
});
void test("original public modify returns before its retained actual done Promise and getter",async()=>{
 const fx=fixture();const outer=fx.start('api.modify("inert-wire",{line:[0,0,20,0]})');const call=fx.calls[0];assert.ok(call);
 assert.equal(fx.calls.length,1);assert.equal(call.topic,"extensionApi.SCH_PrimitiveWire.modify");
 // Async API promise, async done promise, then the actual manual Promise i.
 // The init hook retains original native objects. Promise, done and the
 // Original await/return statements remain unmodified.
 assert.equal(call.promises.length,3);assert.equal(call.promises[0],outer);
 const done=call.promises[1];assert.ok(done);assert.equal(call.promises[2],call.inner);
 const nativePrototype:unknown=runInContext("Promise.prototype",fx.realm);assert.equal(Object.getPrototypeOf(call.inner),nativePrototype);
 assert.notEqual(outer,done);assert.notEqual(done,call.inner);
 const innerObserved=observe(call.inner);const doneObserved=observe(done);
 const wrapper=await outer;
 await Promise.resolve();assert.equal(innerObserved.state.settled,false);assert.equal(doneObserved.state.settled,false);
 const sent=field(call.args,"data");assert.equal(field(sent,"primitiveId"),"inert-wire");assert.equal(field(sent,"net"),"");assert.equal(field(sent,"color"),null);assert.equal(field(sent,"lineWidth"),null);assert.equal(field(sent,"lineType"),null);
 assert.equal(field(wrapper,"line"),field(sent,"line"));assert.equal(field(wrapper,"net"),"");
 const row={id:"inert-wire",line:[[0,0,20,0]],net:"AFTER_CALLBACK",color:"#008800",lineWidth:2,lineType:1};
 invoke(field(call.args,"getter"),[row]);
 assert.equal(await innerObserved.result,undefined);assert.equal(await doneObserved.result,wrapper);
 assert.equal(field(wrapper,"line"),row.line);assert.equal(field(wrapper,"net"),row.net);assert.equal(field(wrapper,"color"),row.color);
});
void test("original modify can ACK while its actual done Promise later rejects",async()=>{
 const fx=fixture();const outer=fx.start('api.modify("inert-wire",{line:[0,0,20,0]})');const call=fx.calls[0];assert.ok(call);
 const done=call.promises[1];assert.ok(done);const rejected=assert.rejects(done,/modify failed!/u);
 const wrapper=await outer;assert.equal(field(wrapper,"primitiveId"),"inert-wire");
 invoke(field(call.args,"getter"),[undefined]);await rejected;assert.equal(await call.inner,undefined);
});
void test("original public create awaits its actual getter Promise",async()=>{
 const fx=fixture();const outer=fx.start('api.create([0,0,20,0],"inert_net",null,null,null)');const call=fx.calls[0];assert.ok(call);assert.equal(call.topic,"extensionApi.SCH_PrimitiveWire.create");assert.equal(call.promises.length,3);assert.equal(call.promises[2],call.inner);
 const observed=observe(outer);await Promise.resolve();await Promise.resolve();assert.equal(observed.state.settled,false);
 assert.equal(field(field(call.args,"data"),"net"),"INERT_NET");
 const row={id:"inert-created-wire",line:[[0,0,20,0]],net:"INERT_NET",color:null,lineWidth:null,lineType:null};invoke(field(call.args,"getter"),[row]);
 const wrapper=await observed.result;assert.equal(field(wrapper,"primitiveId"),row.id);assert.equal(field(wrapper,"line"),row.line);assert.equal(await call.inner,undefined);
});
void test("original public delete adopts the original UI deletion Promise after the bus ACK",async()=>{
 const nativeDelete=Promise.withResolvers<unknown>();let apiCalls=0,uiCalls=0;let payload:unknown;
 const realm=createContext({w:{messageBus:{rpcCall(topic:string,args:unknown){uiCalls+=1;assert.equal(topic,"deleteObjs");payload=args;return nativeDelete.promise;}}},T:{extensionApiMessageBus2:{rpcCall(topic:string,args:unknown){apiCalls+=1;assert.equal(topic,"extensionApi.SCH_PrimitiveWire.delete");const handler:unknown=runInContext("wireNamespace.delete",realm);invoke(handler,[args]);return Promise.resolve();}}}});
 runInContext(`var Xa=${TEXT.state};var v0=${TEXT.api};var VI=${TEXT.ui};var wireNamespace=${TEXT.uiNamespace};var api=new v0;`,realm);
 // Retain the actual VI.delete Promise at native creation, not a replacement
 // Promise or a boolean copied from its eventual result.
 const created:Promise<unknown>[]=[];let collecting=false;
 const hook=createHook({init(_id,type,_trigger,resource:unknown){if(collecting&&type==="PROMISE"){created.push(promise(resource));}}});
 // The UI namespace passes VI.delete's return to the original SDK getter.
 // The native hook retains that exact newly created Promise object.
 hook.enable();collecting=true;let outer:Promise<unknown>;
 try{outer=promise(runInContext('api.delete("inert-wire")',realm)as unknown);}finally{collecting=false;hook.disable();}
 assert.equal(apiCalls,1);assert.equal(uiCalls,1);assert.equal(field(field(payload,"ids"),"0"),"inert-wire");
 const actualUi=created[1];assert.ok(actualUi);assert.equal(created[0],outer);assert.notEqual(actualUi,outer);assert.equal(Object.getPrototypeOf(actualUi),runInContext("Promise.prototype",realm));
 const uiObserved=observe(actualUi);const observed=observe(outer);
 await Promise.resolve();await Promise.resolve();assert.equal(uiObserved.state.settled,false);assert.equal(observed.state.settled,false);
 nativeDelete.resolve({message:true});assert.equal(await uiObserved.result,true);assert.equal(await observed.result,true);
});
