/** Pinned source with inert callback stand-ins; no native owner or app. */
import assert from "node:assert/strict";
import {test} from "node:test";
import {Script,createContext} from "node:vm";
import {CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_BINDING_PROGRAMS as BINDINGS} from "../src/current-footprint-forward-writer-ticket-timer-bindings.ts";
import {CURRENT_FOOTPRINT_COPY_DEPENDENCY_PROFILES as DEPENDENCIES} from "../src/current-footprint-copy-dependency-profiles.ts";
import {CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_SOURCE as SOURCE,qualifyCurrentFootprintForwardWriterTicketTimerSource as qualify,requireCurrentFootprintForwardWriterTicketTimerSource as requireSource} from "../src/current-footprint-forward-writer-ticket-timer-source.ts";
import {CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_PROGRAMS as PROGRAMS} from "../src/current-footprint-forward-writer-ticket-timer-programs.ts";
import {INSTALLED_EASYEDA_SOURCE_SKIP_REASON,readConfiguredEasyedaAssets} from "./helpers/installed-easyeda-source.ts";

void test("whole original worker and all ticket/broadcast spans qualify without issuing a timer",async context=>{
 const assets=await readConfiguredEasyedaAssets(["pro-mgr/3.2.185.bf63a159/js/project-worker.js"]);
 if(assets===null){context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON);return;}
 const worker=assets[0];assert.ok(worker!==undefined);
 const token=qualify(worker);requireSource(token);
 assert.throws(()=>{requireSource({...token});});
 assert.throws(()=>{requireSource(new Proxy(token,{}));});
 assert.throws(()=>qualify(`${worker} `));
 assert.throws(()=>qualify(worker.replace(SOURCE["JP.post.callback"].source,"()=>{}")));
 assert.equal(token.originalTimerJoined,false);
 assert.equal(token.executionAuthorized,false);
});
void test("actual local ticket source coalesces timers but its return precedes the broadcast self-microtask",()=>{
 const context=createContext(Object.freeze({}),{microtaskMode:"afterEvaluate",codeGeneration:{strings:false,wasm:false}});
 const methods=[SOURCE["KP.publish"],SOURCE["KP.onReceivedPublish"],SOURCE["JP.broadcastPublish"],SOURCE["JP.post"],SOURCE["JP.onMessage"]].map(row=>row.source).join(",");
 const source=`const events=[],posts=[],scheduled=[];let callback=null;const console={debug(...a){if(a[0]==="BCMSG(")events.push("self");},warn(){throw Error("SYNTHETIC_UNEXPECTED_BUS_TOPIC");}};const setTimeout=(fn,ms)=>{if(ms!==20)throw Error("SYNTHETIC_TIMER_DELAY");scheduled.push(fn);callback=fn;return scheduled.length;};const clearTimeout=()=>{throw Error("SYNTHETIC_CANCELLATION_FORBIDDEN");};const bus={uuid:"synthetic",subscribed:{},bc:{postMessage(e){posts.push(e);}},${methods}};const project={isReady:true,publishTimer:null,workerBus:bus,consistencyManager:{getMaxTicket(){return 37;}},${SOURCE["Lg.localPublishTicket"].source}};for(let i=0;i<3;i++)project.localPublishTicket();if(scheduled.length!==1)throw Error("SYNTHETIC_COALESCE");callback();const beforeSelf=events.length;const timerNullAfterReturn=project.publishTimer===null;project.localPublishTicket();callback();const result={scheduled:scheduled.length,posts,events,beforeSelf,timerNullAfterReturn,subscribed:Object.keys(bus.subscribed)};`;
 new Script(source).runInContext(context,{timeout:1000});
 const raw:unknown=new Script("JSON.stringify(result)").runInContext(context,{timeout:1000});
 assert.equal(raw,JSON.stringify({scheduled:2,posts:[{type:"PUBLISH",uuid:"synthetic",topic:"/pro-mgr/project/ticket",message:{ticket:37}},{type:"PUBLISH",uuid:"synthetic",topic:"/pro-mgr/project/ticket",message:{ticket:37}}],events:["self","self"],beforeSelf:0,timerNullAfterReturn:true,subscribed:[]}));
});

void test("passive timer recipes preserve original bindings and refuse ticket or subscriber drift without app calls",()=>{
 const source=`(()=>{let applicationCalls=0;class Base{publish(){applicationCalls++;}onReceivedPublish(){applicationCalls++;}}class Bus extends Base{broadcastPublish(){applicationCalls++;}post(){applicationCalls++;}onMessage(){applicationCalls++;}}class Channel{postMessage(){applicationCalls++;}}const channel=new Channel(),bus=new Bus();bus.bc=channel;bus.subscribed={};bus.uuid="synthetic-bus";const manager={maxTicket:37},project={isReady:true,publishTimer:null,consistencyManager:manager,workerBus:bus};globalThis.PROJECT=project;const binding=[project,manager,bus,channel,bus.subscribed,bus.uuid,Bus.prototype,Base.prototype,Base.prototype.publish,Bus.prototype.broadcastPublish,Bus.prototype.post,Bus.prototype.onMessage,Base.prototype.onReceivedPublish,Channel.prototype,Channel.prototype.postMessage];const native=[Object.getOwnPropertyDescriptor,Object.getPrototypeOf,Object.hasOwn,Object.getOwnPropertyNames,Object.getOwnPropertySymbols,Array.isArray,Function.prototype.apply,Object.prototype,Array.prototype,Function.prototype,globalThis];const roots=[globalThis,binding,project,manager,bus,channel,bus.subscribed,Bus.prototype,Base.prototype,Channel.prototype,...binding.slice(8,13),Channel.prototype.postMessage];const approved=(...extra)=>{const rows=[...roots,...extra];while(rows.length<32)rows.push(native);return rows;};const baseline=Reflect.apply((${PROGRAMS.baseline}),native,[binding,approved()]);project.publishTimer=42;const frame=[project],original=Reflect.apply((${PROGRAMS.entry}),native,[frame,binding,approved(frame)]);project.publishTimer=null;const returned=Reflect.apply((${PROGRAMS.returned}),native,[frame,binding,original,approved(frame,original)]);const body={ticket:37},envelope={type:"PUBLISH",uuid:bus.uuid,topic:"/pro-mgr/project/ticket",message:body},self=[bus,envelope];const qualify=()=>Reflect.apply((${PROGRAMS.selfReturned}),native,[self,binding,original,approved(self,original,envelope,body)]);const selfReturned=qualify();let refused=0;body.ticket=38;try{qualify();}catch{refused++;}body.ticket=37;bus.subscribed["/pro-mgr/project/ticket"]=[];try{qualify();}catch{refused++;}delete bus.subscribed["/pro-mgr/project/ticket"];manager.maxTicket=38;try{qualify();}catch{refused++;}return JSON.stringify({baseline:baseline[6],returned,selfReturned,refused,applicationCalls});})()`;
 const raw:unknown=new Script(source).runInNewContext(Object.freeze({}),{timeout:1000,contextCodeGeneration:{strings:false,wasm:false}});
 assert.equal(raw,JSON.stringify({baseline:37,returned:true,selfReturned:true,refused:3,applicationCalls:0}));
});

void test("timer binding rejects intermediate-prototype shadows at capture and after capture without invoking getters",()=>{
 for(const key of ["publish","onReceivedPublish"]as const){
  for(const timing of ["before","after"]as const){
   const setup=`let applicationCalls=0,getterCalls=0;const nope=()=>{applicationCalls++;throw Error("inert-app-call");};
class Events{}class Worker extends Events{}class Channel extends Events{postMessage(){nope();}}
class Base{publish(){nope();}onReceivedPublish(){nope();}}class Bus extends Base{broadcastPublish(){nope();}broadcastWhoHas(){nope();}broadcastIHave(){nope();}broadcastINeed(){nope();}broadcastIGive(){nope();}post(){nope();}onMessage(){nope();}}
class Gd{publishUploadPending(){nope();}}class Lg extends Gd{localPublishTicket(){nope();}publishMaxTicket(){nope();}canWsPublish(){nope();}onHeadChange(){nope();}}
class Vc{getMaxTicket(){nope();}}class Ja extends Vc{}class Manager extends Ja{}class Ar{publishCanvas(){nope();}}class Footprint extends Ar{onDataChange(){nope();}}
const project=new Lg(),manager=new Ja(),bus=new Bus(),channel=new Channel(),footprint=new Footprint();
Object.assign(manager,{cbArr:[function(){}],headCbArr:[function(){}]});Object.assign(bus,{bc:channel,subscribed:{},uuid:"inert-bus"});Object.assign(footprint,{projectManager:project,canvasTimer:null,revokeTimer:null,watchIds:{}});Object.assign(project,{consistencyManager:manager,workerBus:bus,footprint,uploadStructure:function(){}});
Object.assign(globalThis,{PROJECT:project,BroadcastChannel:Channel,WorkerGlobalScope:Worker,EventTarget:Events});Object.assign(Worker.prototype,{setTimeout:nope,clearTimeout:nope});Object.setPrototypeOf(globalThis,Worker.prototype);
const packet=[Object.getOwnPropertyDescriptor,Object.getPrototypeOf,Object.hasOwn,Object.getOwnPropertyNames,Object.getOwnPropertySymbols,Array.isArray,Function.prototype.apply,Object.prototype,Array.prototype,Function.prototype,globalThis];
const dependencies=Array(${String(DEPENDENCIES.length+9)}).fill(nope),destinations=Array(43).fill(nope);
dependencies[39]=Lg.prototype.onHeadChange;dependencies[${String(DEPENDENCIES.length-3)}]=Footprint.prototype.onDataChange;dependencies[${String(DEPENDENCIES.length-1)}]=project.uploadStructure;destinations[0]=Lg.prototype.publishMaxTicket;destinations[2]=Lg.prototype.canWsPublish;
const capture=${BINDINGS.capture};const shadow=()=>Object.defineProperty(Bus.prototype,${JSON.stringify(key)},{get(){getterCalls++;throw Error("inert-shadow-getter");},configurable:true});
`;
   const before=timing==="before"?"shadow();":"const retained=Reflect.apply(capture,packet,[project,dependencies,destinations]);if(Reflect.apply(retained[48],globalThis,[])!==true)throw Error(\"inert-positive-guard\");shadow();";const after=timing==="after"?"Reflect.apply(retained[48],globalThis,[]);":"Reflect.apply(capture,packet,[project,dependencies,destinations]);";
   const result:unknown=new Script(`(()=>{${setup}${before}let refused=false;try{${after}}catch{refused=true;}return JSON.stringify({refused,applicationCalls,getterCalls});})()`).runInNewContext(Object.freeze({}),{timeout:1000,contextCodeGeneration:{strings:false,wasm:false}});
   assert.equal(result,JSON.stringify({refused:true,applicationCalls:0,getterCalls:0}));
  }
 }
});
