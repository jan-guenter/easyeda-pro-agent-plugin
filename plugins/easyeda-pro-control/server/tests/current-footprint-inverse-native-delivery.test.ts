/** Inert getter/descriptor/data fixtures only. They issue no native browser
 * delivery, manager Job, original owner, clock or resume capability. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import type { Runtime } from "node:inspector/promises";
import { test } from "node:test";
import { createContext,runInContext } from "node:vm";
import { CURRENT_NATIVE_OWN_DATA_BIND as BIND } from "../src/current-native-own-data-intrinsics.ts";
import { CURRENT_NATIVE_MESSAGE_EVENT_PROGRAMS_V2 as EVENT } from "../src/current-native-message-event-programs-v2.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELIVERY_PROGRAMS as PROGRAMS } from "../src/current-footprint-inverse-native-delivery-programs.ts";
import { captureCurrentFootprintInverseNativeDeliveryExpected,qualifyCurrentFootprintInverseNativeDeliveryEvent } from "../src/current-footprint-inverse-native-delivery-replies.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELIVERY_REQUESTS as BUDGET,currentFootprintInverseNativeDeliveryCases,currentFootprintInverseNativeDeliveryNativeFrame,currentFootprintInverseNativeDeliveryTemplate,currentFootprintInverseNativeDeliveryWire,validateCurrentFootprintInverseNativeDeliveryCommand } from "../src/current-footprint-inverse-native-delivery-protocol.ts";
import { requireOriginalCurrentFootprintInverseNativeDelivery } from "../src/current-footprint-inverse-native-delivery.ts";

function fixture(quiet=false):ReturnType<typeof createContext>{const context=createContext({},{name:"inert-inverse-delivery-readonly"});runInContext(`
globalThis.I=(${BIND})(Object.getOwnPropertyDescriptor,Object.getPrototypeOf,Object.hasOwn,Object.getOwnPropertyNames,Object.getOwnPropertySymbols,Array.isArray,Function.prototype.apply,Object.prototype,Array.prototype,Function.prototype,globalThis);
function Event(){};function MessageEvent(){};Object.setPrototypeOf(MessageEvent,Event);Object.setPrototypeOf(MessageEvent.prototype,Event.prototype);
const channel={},bus={bc:channel},incoming={message:"a".repeat(32),replyTopic:"_MSG_BUS_RPC_-original-forwarded-delete-job-1"};
const envelope={type:"IGIVE",uuid:"01234567-0123-4567-89ab-0123456789ab",topic:"/mgr/projectWorker/footprint/delete",id:3,target:"01234567-0123-4567-89ab-0123456789ab",message:incoming};
const state={calls:0,trusted:true,type:"message",target:channel,currentTarget:channel,eventPhase:2,source:null,data:envelope,origin:"null"};
const getter=key=>function(){${quiet?"":"state.calls++;"}return state[key];};
for(const key of["target","type","currentTarget","eventPhase"])Object.defineProperty(Event.prototype,key,{get:getter(key),enumerable:true,configurable:true});
for(const key of["data","origin","source"])Object.defineProperty(MessageEvent.prototype,key,{get:getter(key),enumerable:true,configurable:true});
const event=Object.create(MessageEvent.prototype);Object.defineProperty(event,"isTrusted",{get:getter("trusted"),enumerable:true,configurable:false});
const constructors=(${EVENT.constructors}).call(globalThis,I),members=(${EVENT.members}).call(constructors,event);
const channelOriginal=[I,[],bus,channel,constructors,()=>{},()=>true],channelMembers=[I,channelOriginal,()=>{},()=>{},()=>{},()=>{},()=>true],channelBound=[I,channelMembers,()=>{},"source",()=>true];
const packet=[{},incoming,bus,incoming.message,incoming.replyTopic,()=>true],job=[packet,[],()=>true],frame=[bus,event],expected=JSON.parse(JSON.stringify({nativeEnvelope:envelope,nativeOrigin:state.origin}));
globalThis.fixture={I,state,event,envelope,incoming,bus,channel,members,channelBound,job,frame,expected};`,context);return context;}
function capture(context:ReturnType<typeof createContext>):void{runInContext(`fixture.proof=(${PROGRAMS.capture}).call(fixture.frame,fixture.I,fixture.channelBound,fixture.job,fixture.members,fixture.expected)`,context);}
function reprove(context:ReturnType<typeof createContext>):unknown{return runInContext(`(${PROGRAMS.reprove}).call(fixture.proof)`,context)as unknown;}
void test("the complete fixed capture and retained reproof pass actual readonly Node Inspector on inert getters",async()=>{
 const session=new Session();session.connect();let contextId:number|undefined;session.on("Runtime.executionContextCreated",message=>{if(message.params.context.name==="inert-inverse-delivery-readonly"){contextId=message.params.context.id;}});await session.post("Runtime.enable");const context=fixture(true);assert.ok(contextId!==undefined);
 try{
  const reference=async(name:string):Promise<string>=>{const raw=await session.post("Runtime.evaluate",{expression:`fixture.${name}`,contextId,objectGroup:"inert-delivery-readonly"});assert.equal(raw.exceptionDetails,undefined);assert.ok(raw.result.objectId!==undefined);return raw.result.objectId;};
  const receiver=await reference("frame");const args:{objectId:string}[]=[];for(const name of["I","channelBound","job","members"]){args.push({objectId:await reference(name)});}const serialized:unknown=runInContext("JSON.stringify(fixture.expected)",context);assert.ok(typeof serialized==="string");const expected:unknown=JSON.parse(serialized);const base:Runtime.CallFunctionOnParameterType={objectId:receiver,functionDeclaration:PROGRAMS.capture,arguments:[...args,{value:expected}],objectGroup:"inert-delivery-readonly",returnByValue:false};const captureRequest={...base,throwOnSideEffect:true};const captured=await session.post("Runtime.callFunctionOn",captureRequest);assert.equal(captured.exceptionDetails,undefined,JSON.stringify(captured));assert.ok(captured.result.objectId!==undefined);
  const proof:Runtime.CallFunctionOnParameterType={objectId:captured.result.objectId,functionDeclaration:PROGRAMS.reprove,arguments:[],returnByValue:true};const proofRequest={...proof,throwOnSideEffect:true};const checked=await session.post("Runtime.callFunctionOn",proofRequest);assert.equal(checked.exceptionDetails,undefined,JSON.stringify(checked));assert.equal(checked.result.value,true);await session.post("Runtime.releaseObjectGroup",{objectGroup:"inert-delivery-readonly"});
 }finally{session.disconnect();}
});
void test("current native getter data joins exact original bus/RPC/envelope references in the fixed leaf",()=>{
 const context=fixture();assert.equal(runInContext("fixture.state.calls",context),0);capture(context);assert.equal(runInContext("fixture.proof[5]===fixture.expected&&fixture.proof[5]!==fixture.I",context),true);assert.equal(runInContext("fixture.state.calls",context),8);assert.equal(reprove(context),true);
 for(const change of["fixture.expected.nativeEnvelope.uuid='11234567-0123-4567-89ab-0123456789ab'","fixture.expected.nativeEnvelope.id++","fixture.expected.nativeEnvelope.target='11234567-0123-4567-89ab-0123456789ab'","fixture.expected.nativeEnvelope.topic='foreign'","fixture.expected.nativeEnvelope.message.message='b'.repeat(32)","fixture.expected.nativeEnvelope.message.replyTopic+='foreign'","fixture.expected.nativeOrigin='https://foreign.invalid'","fixture.frame[0]={}","fixture.job[0][1]={...fixture.incoming}"]){const changed=fixture();runInContext(change,changed);assert.throws(()=>{capture(changed);},()=>true,change);}
});
void test("trusted Event replay, changed dispatch state and changed native getter descriptors refuse",()=>{
 for(const change of["fixture.state.trusted=false","fixture.state.currentTarget=null;fixture.state.eventPhase=0","fixture.state.currentTarget={}","fixture.state.eventPhase=1","fixture.state.source={}","fixture.state.data={...fixture.envelope,message:{...fixture.incoming}}"]){const context=fixture();runInContext(change,context);assert.throws(()=>{capture(context);},()=>true,change);}
 const completed=fixture();capture(completed);runInContext("fixture.state.currentTarget=null;fixture.state.eventPhase=0",completed);assert.throws(()=>reprove(completed));
 const drift=fixture();capture(drift);runInContext('Object.defineProperty(Event.prototype,"currentTarget",{get(){throw Error("replacement getter invoked")},enumerable:true,configurable:true});fixture.before=fixture.state.calls',drift);assert.throws(()=>reprove(drift));assert.equal(runInContext("fixture.before===fixture.state.calls",drift),true);
});
void test("retained complete rosters reject later unknown string or symbol keys on every joined data object",()=>{
 for(const target of["fixture.envelope","fixture.incoming","fixture.expected","fixture.expected.nativeEnvelope","fixture.expected.nativeEnvelope.message","fixture.event"]){for(const key of['"unexpected"','Symbol("unexpected")']){const context=fixture();capture(context);runInContext(`${target}[${key}]=1`,context);assert.throws(()=>reprove(context),()=>true,`${target} ${key}`);}}
 const reordered=fixture();capture(reordered);runInContext("const oldUuid=fixture.envelope.uuid;delete fixture.envelope.uuid;fixture.envelope.uuid=oldUuid",reordered);assert.throws(()=>reprove(reordered));
 const getter=fixture();capture(getter);runInContext('fixture.extraReads=0;Object.defineProperty(fixture.incoming,"unexpected",{get(){fixture.extraReads++;throw Error("unknown getter invoked")},enumerable:true})',getter);assert.throws(()=>reprove(getter));assert.equal(runInContext("fixture.extraReads",getter),0);
});
void test("actual Event descriptor shape and expected envelope decoding reject proxies/accessors and unsupported fields",()=>{
 const data={result:[{name:"isTrusted",get:{type:"function",className:"Function",description:"function get isTrusted() { [native code] }",objectId:"native_getter"},set:{type:"undefined"},configurable:false,enumerable:true,isOwn:true}],internalProperties:[{name:"[[Prototype]]",value:{type:"object",className:"MessageEvent",description:"MessageEvent",objectId:"native_prototype"}}]};qualifyCurrentFootprintInverseNativeDeliveryEvent(data);assert.throws(()=>{qualifyCurrentFootprintInverseNativeDeliveryEvent({...data,internalProperties:[{name:"[[Target]]",value:{type:"object",subtype:"proxy"}}]});});
 let reads=0;const accessor=Object.defineProperty({},"result",{get(){reads+=1;return data.result;},enumerable:true});assert.throws(()=>{qualifyCurrentFootprintInverseNativeDeliveryEvent(accessor);});assert.equal(reads,0);
 const context=fixture(),expected:unknown=runInContext("JSON.stringify(fixture.expected)",context);assert.equal(typeof expected,"string");if(typeof expected!=="string"){throw new TypeError("expected fixture serialization");}const parsed:unknown=JSON.parse(expected);const captured=captureCurrentFootprintInverseNativeDeliveryExpected(parsed);captureCurrentFootprintInverseNativeDeliveryExpected({...captured,nativeEnvelope:{...captured.nativeEnvelope,message:{...captured.nativeEnvelope.message,message:"a".repeat(16)}}});for(const length of[15,17,31,33,64]){assert.throws(()=>captureCurrentFootprintInverseNativeDeliveryExpected({...captured,nativeEnvelope:{...captured.nativeEnvelope,message:{...captured.nativeEnvelope.message,message:"a".repeat(length)}}}));}assert.throws(()=>captureCurrentFootprintInverseNativeDeliveryExpected({nativeEnvelope:parsed,nativeOrigin:"null",extra:true}));
});
void test("finite Event codebook preserves20 CDP commands, exact data substitutions and readonly flags",()=>{
 assert.deepEqual(BUDGET,{normal:16,helpers:4,cdpRequests:20,controls:22,events:4,cleanupAfterOriginalExit:0});const cases=currentFootprintInverseNativeDeliveryCases();assert.equal(cases.length,17);
 for(const command of cases){const row=currentFootprintInverseNativeDeliveryTemplate(command);let rendered=row.template;const wire=currentFootprintInverseNativeDeliveryWire(command,79,"original_worker");const bytes=Buffer.from(`${JSON.stringify(wire)}\0`);const frame=currentFootprintInverseNativeDeliveryNativeFrame(bytes,command,"original_worker");for(const name of row.names){rendered=rendered.replace(JSON.stringify(`__inverse_native_delivery_${name}__`),JSON.stringify(frame[name]));}for(const[name,program]of Object.entries({frame:"[this,s]",...PROGRAMS})){rendered=rendered.replace(JSON.stringify(`__inverse_native_delivery_program${name}__`),JSON.stringify(program));}assert.deepEqual(JSON.parse(rendered),{method:command.method,params:command.params});if(command.method==="Runtime.callFunctionOn"){assert.equal(command.params.throwOnSideEffect,true);assert.throws(()=>validateCurrentFootprintInverseNativeDeliveryCommand({...command,params:{...command.params,throwOnSideEffect:false}}));}}
});
void test("matching native Event data and caller callbacks cannot issue the original delivery token",()=>{
 let calls=0;const candidate={profile:"private.current-footprint-inverse-native-delivery.v1",nativeEventVerified:true,current():void{calls+=1;}};
 assert.throws(()=>{Reflect.apply(requireOriginalCurrentFootprintInverseNativeDelivery,undefined,[candidate,{},{}]);},/FOOTPRINT_INVERSE_NATIVE_DELIVERY_ORIGINAL/u);assert.equal(calls,0);
});
