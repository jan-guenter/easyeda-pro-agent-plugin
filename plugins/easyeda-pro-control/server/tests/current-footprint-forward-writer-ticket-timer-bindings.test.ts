/** Passive recipes on explicit inert project/bus/native stand-ins. These
 * tests grant no runtime metadata, source, timer or native owner authority. */
import assert from "node:assert/strict";
import {requireOriginalCurrentFootprintForwardWriterCallbackTargets} from "../src/current-footprint-forward-writer-producer-origin.ts";
import {Session} from "node:inspector/promises";
import {qualifyCurrentFootprintForwardWriterTicketTimerGuard} from "../src/current-footprint-forward-writer-ticket-timer-replies.ts";
import {test} from "node:test";
import {createContext,runInContext} from "node:vm";
import {CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_BINDING_PROGRAMS as PROGRAMS} from "../src/current-footprint-forward-writer-ticket-timer-bindings.ts";
import {CURRENT_FOOTPRINT_COPY_DEPENDENCY_PROFILES as DEPENDENCIES} from "../src/current-footprint-copy-dependency-profiles.ts";
import {CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_SOURCE as SOURCE} from "../src/current-footprint-forward-writer-ticket-timer-source.ts";

const methods=(prefix:string):string=>Object.entries(SOURCE).filter(([key])=>key.startsWith(prefix)&&!key.endsWith(".callback")).map(([,value])=>value.source).join("\n");
function fixture(beforeCapture=""):ReturnType<typeof createContext>{
 const context=createContext({});
 runInContext(`let called=0;class EventTarget{};class WorkerGlobalScope extends EventTarget{};class BroadcastChannel extends EventTarget{postMessage(){called++;throw Error("must not call");}}
Object.defineProperty(WorkerGlobalScope.prototype,"setTimeout",{value:function setTimeout(){called++;throw Error("must not call");},writable:true,enumerable:true,configurable:true});Object.defineProperty(WorkerGlobalScope.prototype,"clearTimeout",{value:function clearTimeout(){called++;throw Error("must not call");},writable:true,enumerable:true,configurable:true});
class Mb{};class KP extends Mb{${methods("KP.")}};class JP extends KP{${methods("JP.")}broadcastWhoHas(e){this.post({type:"WHOHAS",uuid:this.uuid,topic:e})}broadcastIHave(e,t){this.post({type:"IHAVE",uuid:this.uuid,topic:e,id:t})}broadcastINeed(e,t,s){this.post({type:"INEED",uuid:this.uuid,topic:e,source:t,id:s})}broadcastIGive(e,t,s,r){this.post({type:"IGIVE",uuid:this.uuid,topic:e,id:t,target:s,message:r})}};
class zy{};class Vc extends zy{getMaxTicket(){return this.maxTicket}};class ja extends Vc{};class Gd{publishUploadPending(){called++;throw Error("must not call");}};class ar{publishCanvas(){called++;throw Error("must not call");}};class Tg extends ar{onDataChange(){called++;throw Error("must not call");}};class Lg extends Gd{canWsPublish(){return false}publishMaxTicket(){called++;throw Error("must not call");}onHeadChange(){called++;throw Error("must not call");}${methods("Lg.")}}
globalThis.EventTarget=EventTarget;globalThis.WorkerGlobalScope=WorkerGlobalScope;globalThis.BroadcastChannel=BroadcastChannel;Object.setPrototypeOf(globalThis,WorkerGlobalScope.prototype);
const project=new Lg,manager=new ja,bus=new JP;project.consistencyManager=manager;project.workerBus=bus;project.isReady=true;project.publishTimer=null;manager.maxTicket=10;manager.cbArr=[function(){}];manager.headCbArr=[function(){}];project.footprint=new Tg;project.footprint.projectManager=project;project.footprint.watchIds={};project.footprint.canvasTimer=null;project.footprint.revokeTimer=null;bus.bc=new BroadcastChannel;bus.subscribed={};bus.uuid="bus27";globalThis.PROJECT=project;
const reflection=[Object.getOwnPropertyDescriptor,Object.getPrototypeOf,Object.hasOwn,Object.getOwnPropertyNames,Object.getOwnPropertySymbols,Array.isArray,Function.prototype.apply,Object.prototype,Array.prototype,Function.prototype,globalThis];
project.uploadStructure=function(){called++;throw Error("must not call");};const dependencies=Array.from({length:${String(DEPENDENCIES.length+9)}},()=>null),destinations=Array.from({length:43},()=>null);
dependencies[39]=Lg.prototype.onHeadChange;dependencies[${String(DEPENDENCIES.length-3)}]=Tg.prototype.onDataChange;dependencies[${String(DEPENDENCIES.length-1)}]=project.uploadStructure;destinations[0]=Lg.prototype.publishMaxTicket;destinations[2]=Lg.prototype.canWsPublish;
${beforeCapture}\nconst capture=(${PROGRAMS.capture}).call(reflection,project,dependencies,destinations);const binding=(${PROGRAMS.binding}).call(reflection,capture);const baseline=(${PROGRAMS.baseline}).call(reflection,binding,capture);`,context);
 return context;
}
function call(context:ReturnType<typeof createContext>,role:keyof typeof PROGRAMS,args:string):unknown{return runInContext(`(${PROGRAMS[role]}).call(reflection,${args})`,context);}
void test("binding guards preserve complete method/native descriptors without invoking timers, bus methods or the SDK",()=>{
 const f=fixture();assert.equal(call(f,"before","binding,baseline,capture"),true);assert.equal(runInContext("called",f),0);
 for(const change of['Object.defineProperty(KP.prototype,"publish",{writable:false})','Object.setPrototypeOf(project.workerBus,{})','Promise.resolve=()=>{}','JP.prototype.broadcastIGive=function(){}','manager.cbArr.push(function(){})','project.footprint.watchIds.newdoc=1','project.footprint.canvasTimer=4','Lg.prototype.canWsPublish=function(){return true}','Object.defineProperty(Lg.prototype,"onHeadChange",{writable:false})','project.publishMaxTicket=function(){}','Tg.prototype.onDataChange=function(){}','project.uploadStructure=function(){}','destinations[2]=function(){return false}' ]){
  const altered=fixture();runInContext(change,altered);assert.throws(()=>call(altered,"before","binding,baseline,capture"));assert.equal(runInContext("called",altered),0);
 }
 const getter=fixture();runInContext('Object.defineProperty(project,"publishTimer",{get(){called++;return null}})',getter);assert.throws(()=>call(getter,"before","binding,baseline,capture"));assert.equal(runInContext("called",getter),0);
 const subscribed=fixture();runInContext('bus.subscribed["/pro-mgr/project/ticket"]=[]',subscribed);assert.throws(()=>call(subscribed,"before","binding,baseline,capture"));
});
void test("only a post-baseline ticket and its same timer/envelope can close the natural callback and self-message",()=>{
 const f=fixture();runInContext("manager.maxTicket=11;project.publishTimer=7;const frame=[project];",f);
 const entry=call(f,"entry","frame,binding,baseline,capture");assert.equal(Array.isArray(entry),true);runInContext(`const original=(${PROGRAMS.entry}).call(reflection,frame,binding,baseline,capture);project.publishTimer=null;const selfFrame=[bus,{type:"PUBLISH",uuid:bus.uuid,topic:"/pro-mgr/project/ticket",message:{ticket:11}}];`,f);
 assert.equal(call(f,"returned","frame,binding,original,capture"),true);assert.equal(call(f,"selfReturned","selfFrame,binding,original,capture"),true);assert.equal(JSON.stringify(call(f,"slot","binding,baseline,capture")),'{"timer":null,"ticket":11}');assert.equal(runInContext("called",f),0);
 for(const change of['selfFrame[1].message.ticket=10','selfFrame[1].message.force=true','selfFrame[1].topic="/other"','manager.maxTicket=12']){
  const other=fixture();runInContext(`manager.maxTicket=11;project.publishTimer=7;const frame=[project];const original=(${PROGRAMS.entry}).call(reflection,frame,binding,baseline,capture);project.publishTimer=null;const selfFrame=[bus,{type:"PUBLISH",uuid:bus.uuid,topic:"/pro-mgr/project/ticket",message:{ticket:11}}];${change};`,other);assert.throws(()=>call(other,"selfReturned","selfFrame,binding,original,capture"));
 }
 const old=fixture();runInContext("project.publishTimer=7;const frame=[project];",old);assert.throws(()=>call(old,"entry","frame,binding,baseline,capture"));
});

void test("actual inert Inspector metadata joins the guard to its exact generated capture script",async()=>{
 const context=fixture();const fn:unknown=runInContext(`(${PROGRAMS.capture})`,context);assert.equal(typeof fn,"function");
 const reflection:unknown=runInContext("reflection",context);const project:unknown=runInContext("project",context);assert.ok(Array.isArray(reflection));
 // Runtime-check the inert VM callable; this is never a native issuer.
 assert.ok(typeof fn==="function");const capture:unknown=Reflect.apply(fn,reflection,[project,runInContext("dependencies",context),runInContext("destinations",context)]);assert.ok(Array.isArray(capture));const guard:unknown=capture[48];assert.equal(typeof guard,"function");
 const root:Record<string,unknown>=globalThis;const name="__easyedaInertTicketGuard";assert.equal(Object.hasOwn(root,name),false);root[name]=guard;
 const session=new Session();session.connect();
 try{
  await session.post("Runtime.enable");await session.post("Debugger.enable");const evaluated=await session.post("Runtime.evaluate",{expression:name,objectGroup:"inert-ticket-guard-test",silent:true});assert.ok(evaluated.result.objectId!==undefined);
  const properties=await session.post("Runtime.getProperties",{objectId:evaluated.result.objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false});
  const scriptId=qualifyCurrentFootprintForwardWriterTicketTimerGuard(properties,evaluated.result);const original=await session.post("Debugger.getScriptSource",{scriptId});assert.equal(original.scriptSource,`(${PROGRAMS.capture})`);
 }finally{session.disconnect();Reflect.deleteProperty(root,name);}
});


void test("an equal bootstrap cannot expose the original private callback bundles or run a supplied getter",()=>{
 let reads=0;const candidate={get profile():never{reads+=1;throw new Error("getter");}};
 assert.throws(()=>requireOriginalCurrentFootprintForwardWriterCallbackTargets(candidate,{}),/ORIGINAL_BOOTSTRAP/u);assert.equal(reads,0);
});


void test("capture refuses callback targets that no longer match their already-qualified original bundles",()=>{
 for(const change of ['Lg.prototype.canWsPublish=function(){return true}','project.onHeadChange=function(){}','Tg.prototype.onDataChange=function(){}','project.uploadStructure=function(){}']){
  assert.throws(()=>fixture(change),/NATIVE_OWN_DATA/u);
 }
});
