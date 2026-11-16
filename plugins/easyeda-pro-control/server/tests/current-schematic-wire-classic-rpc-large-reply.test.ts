/** Direct local packet-data checks only; no Inspector, app, owner or native request. */
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {test} from "node:test";
import {CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_LARGE_REPLY_LIMITS as LIMIT,captureCurrentSchematicWireClassicRpcLargeReply as capture} from "../src/current-schematic-wire-classic-rpc-large-reply.ts";

interface Packet {result:{name:string;value:{type:string;subtype:string;objectId:string};writable:boolean;configurable:boolean;enumerable:boolean;isOwn:boolean}[];internalProperties:{name:string;value:{type:string;objectId:string}}[]}
function packet(count=1):Packet{return{result:Array.from({length:count},(_,index)=>({name:String(index),value:{type:"object",subtype:"proxy",objectId:`remote.${String(index)}`},writable:true,configurable:true,enumerable:true,isOwn:true})),internalProperties:[{name:"[[Prototype]]",value:{type:"object",objectId:"remote.prototype"}}]};}
function field(value:unknown,key:string):unknown{assert.ok(value!==null&&typeof value==="object");const result:unknown=Reflect.get(value,key);return result;}
void test("Classic snapshot retains all4096 descriptor rows within the existing frame profile",()=>{
 const input=packet(4096),snapshot=capture(input);assert.equal(snapshot.text,JSON.stringify(input));assert.ok(Buffer.byteLength(snapshot.text)<LIMIT.maximumTransportFrameBytes);
 assert.equal(field(field(snapshot.value,"result"),"length"),4096);assert.equal(snapshot.sha256,createHash("sha256").update(snapshot.text).digest("hex"));assert.ok(Object.isFrozen(snapshot));
});
void test("Classic snapshot freezes its own complete copies and survives caller mutation",()=>{
 const input=packet();const snapshot=capture(input);const before=snapshot.text;const row=input.result[0];assert.ok(row);row.value.objectId="changed";input.result.length=0;
 const rows=field(snapshot.value,"result");const copied=field(rows,"0");const remote=field(copied,"value");assert.equal(field(remote,"objectId"),"remote.0");assert.equal(snapshot.text,before);
 for(const value of[snapshot.value,rows,copied,remote,field(snapshot.value,"internalProperties")]){assert.ok(value!==null&&typeof value==="object"&&Object.isFrozen(value));assert.equal(Reflect.set(value,"changed",true),false);}assert.equal(Object.isFrozen(input),false);
});
void test("Classic capture refuses packet accessors and proxies without invoking them",()=>{
 let calls=0;const getter=():never=>{calls+=1;throw new Error("packet getter invoked");};
 const root=packet();Object.defineProperty(root,"result",{get:getter,enumerable:true});assert.throws(()=>capture(root),/WIRE_CLASSIC_LARGE_REPLY_CAPTURE/u);
 const nested=packet();const row=nested.result[0];assert.ok(row);Object.defineProperty(row,"value",{get:getter,enumerable:true});assert.throws(()=>capture(nested),/WIRE_CLASSIC_LARGE_REPLY_CAPTURE/u);
 const element=packet();Object.defineProperty(element.result,"0",{get:getter,enumerable:true});assert.throws(()=>capture(element),/WIRE_CLASSIC_LARGE_REPLY_CAPTURE/u);
 const proxy=new Proxy(packet(),{get:getter,ownKeys:getter,getPrototypeOf:getter,getOwnPropertyDescriptor:getter});assert.throws(()=>capture(proxy),/WIRE_CLASSIC_LARGE_REPLY_CAPTURE/u);
 const proxyRows=packet();Object.defineProperty(proxyRows,"result",{value:new Proxy([],{ownKeys:getter,getPrototypeOf:getter,get:getter,getOwnPropertyDescriptor:getter})});assert.throws(()=>capture(proxyRows),/WIRE_CLASSIC_LARGE_REPLY_CAPTURE/u);
 const revoked=Proxy.revocable({},{});revoked.revoke();assert.throws(()=>capture(revoked.proxy),/WIRE_CLASSIC_LARGE_REPLY_CAPTURE/u);assert.equal(calls,0);
});
void test("Classic capture enforces row, node, string, byte and transport-derived depth bounds",()=>{
 assert.throws(()=>capture(packet(4097)),/WIRE_CLASSIC_LARGE_REPLY_CAPTURE/u);
 for(const value of["x".repeat(LIMIT.maximumStringUnits+1),Array.from({length:LIMIT.maximumValueNodes},()=>null),["\u0000".repeat(LIMIT.maximumStringUnits/2+1),"\u0000".repeat(LIMIT.maximumStringUnits/2+1)]]){const input=packet();Object.defineProperty(input,"opaque",{value,enumerable:true});assert.throws(()=>capture(input),/WIRE_CLASSIC_LARGE_REPLY_CAPTURE/u);}
 const many=packet();const chunk="x".repeat(32_768);Object.defineProperty(many,"opaque",{value:Object.fromEntries(Array.from({length:257},(_,index)=>[`field${String(index)}`,chunk])),enumerable:true});assert.throws(()=>capture(many),/WIRE_CLASSIC_LARGE_REPLY_CAPTURE/u);
 let nested:unknown=0;for(let index=0;index<LIMIT.maximumContainerDepth-1;index+=1){nested={next:nested};}const allowed=packet();Object.defineProperty(allowed,"opaque",{value:nested,enumerable:true});assert.doesNotThrow(()=>capture(allowed));
 const deep=packet();Object.defineProperty(deep,"opaque",{value:{next:nested},enumerable:true});assert.throws(()=>capture(deep),/WIRE_CLASSIC_LARGE_REPLY_CAPTURE/u);
});
void test("Classic snapshot preserves opaque raw fields, remote getter tags and JSON edge values",()=>{
 const input=packet();const opaque={customPreview:{header:"opaque"},negativeZero:-0,unpaired:"\uD800",toJSON:"data",get:{type:"function",objectId:"remote.getter"}};Object.defineProperty(opaque,"__proto__",{value:{payload:"data"},enumerable:true});Object.defineProperty(input,"opaque",{value:opaque,enumerable:true});
 const old=Object.getOwnPropertyDescriptor(Array.prototype,"toJSON");let hooks=0;
 // oxlint-disable-next-line eslint/no-extend-native -- Test the inherited serialization trap and restore its exact original descriptor in finally.
 Object.defineProperty(Array.prototype,"toJSON",{get(){hooks+=1;throw new Error("inherited serialization invoked");},configurable:true});
 try{const snapshot=capture(input);const parsed:unknown=JSON.parse(snapshot.text);const retained=field(parsed,"opaque");assert.equal(Object.is(field(retained,"negativeZero"),-0),true);assert.equal(field(retained,"unpaired"),"\uD800");assert.equal(field(field(retained,"__proto__"),"payload"),"data");assert.equal(field(field(retained,"get"),"objectId"),"remote.getter");assert.equal(field(field(retained,"customPreview"),"header"),"opaque");assert.equal(field(retained,"toJSON"),"data");assert.equal(hooks,0);}
 finally{if(old===undefined){Reflect.deleteProperty(Array.prototype,"toJSON");}else{
  // oxlint-disable-next-line eslint/no-extend-native -- Restore only the exact original test-owned prototype descriptor.
  Object.defineProperty(Array.prototype,"toJSON",old);}}
});
