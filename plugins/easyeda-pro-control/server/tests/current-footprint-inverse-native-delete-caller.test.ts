/* oxlint-disable import/max-dependencies -- This integration fixture compares independent fixed source/program tables, the schema, queue and condition router together. */
import assert from"node:assert/strict";
import test from"node:test";
import vm from"node:vm";
import{INSTALLED_EASYEDA_SOURCE_SKIP_REASON,readConfiguredEasyedaAssets}from"./helpers/installed-easyeda-source.ts";
import type{DiagnosticEvent}from"../src/current-pcb-diagnostic-protocol.ts";
import{CurrentFootprintInverseNativeDeleteCallerConditionRouter as Router}from"../src/current-footprint-inverse-native-delete-caller-condition-router.ts";
import{CurrentFootprintInverseNativeDeleteCallerRequestQueue as Queue}from"../src/current-footprint-inverse-native-delete-caller-request-queue.ts";
import{CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CALLER_WORKER_PROGRAMS as W}from"../src/current-footprint-inverse-native-delete-caller-worker-programs.ts";
import{CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CALLER_UI_PROGRAMS as U}from"../src/current-footprint-inverse-native-delete-caller-ui-programs.ts";
import{CURRENT_FOOTPRINT_INVERSE_CLOCK_WORKER_CALLEES as CALLEES}from"../src/current-footprint-inverse-clock-worker-source.ts";
import{CURRENT_FOOTPRINT_INVERSE_DELETE_RPC_TOPIC as TOPIC}from"../src/current-footprint-inverse-delete-rpc-source.ts";
import{qualifyCurrentFootprintInverseNativeDeleteCallerSources}from"../src/current-footprint-inverse-native-delete-caller-source.ts";
import{currentFootprintInverseNativeDeleteCallerCases as cases,currentFootprintInverseNativeDeleteCallerCondition as predicate,validateCurrentFootprintInverseNativeDeleteCallerCommand as validate}from"../src/current-footprint-inverse-native-delete-caller-protocol.ts";
import{currentFootprintInverseNativeDeleteClockCondition as clockPredicate}from"../src/current-footprint-inverse-native-delete-clock-protocol.ts";

const reply="_MSG_BUS_RPC_-/mgr/projectWorker/footprint/delete-11111111-2222-3333-4444-555555555555-7";
const event=(method:string,params:Readonly<Record<string,unknown>>):DiagnosticEvent=>Object.freeze({method,sessionId:"worker",params:Object.freeze({...params})});
function syntheticCustody():void{
 // The inert fixture has no native owner to reprove.
}
function rejectOriginalUndefined():Promise<never>{
 // oxlint-disable-next-line eslint/prefer-promise-reject-errors, typescript/prefer-promise-reject-errors -- Preserve an original undefined rejection to test identity rather than replacing it with a new Error.
 return Promise.reject();
}
void test("V4 classifier retains a false caller condition before an unrelated Clock pause",async():Promise<void>=>{
 const caller=predicate("success",reply),clock=clockPredicate("push","11111111-2222-3333-4444-555555555555");
 const falseEvent=event("Debugger.scriptParsed",{scriptId:"caller_false",executionContextId:1,url:""});
 const clockEvent=event("Debugger.scriptParsed",{scriptId:"clock_true",executionContextId:1,url:""});
 const pause=event("Debugger.paused",{hitBreakpoints:["clock_point"]});const release=Promise.withResolvers<unknown>();const deliveries:unknown[]=[];const reads:unknown[]=[];const originals=new Set([falseEvent,clockEvent,pause]);
 const router=new Router({sessions:{worker:"worker",ui:"ui"},contexts:{worker:1,ui:2},current:syntheticCustody,assertOriginalEvent:(e):void=>{assert.ok(originals.has(e));},assertOriginalExit:syntheticCustody,
  originalHelper:():boolean=>false,requestSource:(e):Promise<unknown>=>{reads.push(e);return e===falseEvent?release.promise:Promise.resolve({scriptSource:clock});},
  classify:(text):readonly("caller"|"clock")[]=>{if(text===caller){return["caller"];}if(text===clock){return["clock"];}return[];},
  deliverCondition:(family,e,text):void=>{deliveries.push({family,event:e,text});},deliver:(e):boolean=>{deliveries.push(e);return true;},fail:():never=>assert.fail("unexpected refusal")});
 assert.equal(router.observe(falseEvent),true);assert.equal(router.observe(clockEvent),true);assert.equal(router.observe(pause),true);
 assert.equal(deliveries.length,0);release.resolve({scriptSource:caller});await router.joinCurrent();
 assert.deepEqual(deliveries,[{family:"caller",event:falseEvent,text:caller},{family:"clock",event:clockEvent,text:clock},pause]);assert.deepEqual(reads,[falseEvent,clockEvent]);
 assert.deepEqual(router.retained(),{reads:2,receipts:2,queued:0,pending:false,failed:false,ended:false});
});
void test("condition classification rejects overlapping fixed rosters and retains an original failed read through exit",async():Promise<void>=>{
 const parsed=event("Debugger.scriptParsed",{scriptId:"condition",executionContextId:1,url:"debugger://not-authority"});
 let handed:unknown="not-called";let delivered=false;
 const router=new Router({sessions:{worker:"worker",ui:"ui"},contexts:{worker:1,ui:2},current:syntheticCustody,assertOriginalEvent:(e):void=>{assert.equal(e,parsed);},assertOriginalExit:syntheticCustody,
 originalHelper:():boolean=>false,requestSource:rejectOriginalUndefined,classify:():readonly("caller"|"clock")[]=>["caller","clock"],deliverCondition:():void=>{delivered=true;},deliver:():boolean=>true,fail:(cause):void=>{handed=cause;}});
 router.observe(parsed);let caught=false;try{await router.joinCurrent();}catch(error){caught=true;assert.equal(error,undefined);}assert.equal(caught,true);assert.equal(handed,undefined);assert.equal(delivered,false);await router.settleAfterOriginalExit();
 const overlap=new Router({sessions:{worker:"worker",ui:"ui"},contexts:{worker:1,ui:2},current:syntheticCustody,assertOriginalEvent:syntheticCustody,assertOriginalExit:syntheticCustody,originalHelper:():boolean=>false,requestSource:():Promise<unknown>=>Promise.resolve({scriptSource:"fixed"}),classify:():readonly("clock"|"caller")[]=>["clock","caller"],deliverCondition:():never=>assert.fail("overlap delivered"),deliver:():boolean=>true,fail:syntheticCustody});
 overlap.observe(parsed);await assert.rejects(overlap.joinCurrent(),/CONDITION_ROUTER/u);
});
void test("caller queue preserves its original active send and closes undispatched families before joining exit",async():Promise<void>=>{
 const q=new Queue(),written=Promise.withResolvers<unknown>();let sends=0;const one=q.enqueue({family:"caller-worker",realm:"worker",helper:"frame",helperFor:null},syntheticCustody,():Promise<unknown>=>{sends+=1;return written.promise;});const two=q.enqueue({family:"clock",realm:"ui",helper:null,helperFor:null},syntheticCustody,():Promise<unknown>=>{sends+=1;return Promise.resolve({});});
 const rejection=assert.rejects(two,/ORIGINAL_EXIT/u);let closed=false;const exit=(async():Promise<void>=>{await q.settleAfterOriginalExit(syntheticCustody);closed=true;})();await Promise.resolve();assert.equal(closed,false);assert.equal(sends,1);written.resolve({});await assert.rejects(one,/ORIGINAL_EXIT/u);await rejection;await exit;assert.equal(sends,1);
});
void test("the original helper is issued only at dispatch and retains its realm through its exact source join",async():Promise<void>=>{
 const first=Promise.withResolvers<unknown>();const q=new Queue();let otherSends=0;
 const helper=q.enqueue({family:"caller-worker",realm:"worker",helper:"worker-frame-returned",helperFor:null},syntheticCustody,():Promise<unknown>=>first.promise);
 assert.equal(q.originalIssuedHelper(),null);q.markOriginalHelperIssued("caller-worker");
 assert.deepEqual(q.originalIssuedHelper(),{family:"caller-worker",key:"worker-frame-returned",realm:"worker"});
 const other=q.enqueue({family:"clock",realm:"ui",helper:null,helperFor:null},syntheticCustody,():Promise<unknown>=>{otherSends+=1;return Promise.resolve({});});
 first.resolve({});await helper;assert.equal(otherSends,0);
 assert.throws(():Promise<unknown>=>q.enqueue({family:"caller-worker",realm:"ui",helper:null,helperFor:"worker-frame-returned"},syntheticCustody,():Promise<unknown>=>Promise.resolve({})),/REQUEST_QUEUE/u);
 const source=q.enqueue({family:"caller-worker",realm:"worker",helper:null,helperFor:"worker-frame-returned"},syntheticCustody,():Promise<unknown>=>Promise.resolve({scriptSource:"actual fixed helper"}));
 await source;await other;assert.equal(q.originalIssuedHelper(),null);assert.equal(otherSends,1);
});
function workerFixture():vm.Context{
 const context=vm.createContext({rows:CALLEES,topic:TOPIC,reply,W});
 vm.runInContext(`
 const O=Object,A=Array,F=Function;globalThis.reflection=[O.getOwnPropertyDescriptor,O.getPrototypeOf,O.hasOwn,O.getOwnPropertyNames,O.getOwnPropertySymbols,A.isArray,F.prototype.apply,O.prototype,A.prototype,F.prototype,globalThis];
 class Mb{}class KP extends Mb{}class JP extends KP{}class wu{}
 const classes={Mb,KP,JP,wu};for(const row of rows){if(row.kind==="method")O.defineProperty(classes[row.owner].prototype,row.name,{value:function(){},writable:true,enumerable:false,configurable:true});}
 const functions=Array.from(rows,row=>row.kind==="method"?classes[row.owner].prototype[row.name]:classes[row.key]??function(){});
 const manager={};const project={workerBus:null,footprint:manager};manager.projectManager=project;globalThis.PROJECT=project;
 const bus=O.create(JP.prototype),callback=function(){},handler=function(){},task=O.assign(O.create(wu.prototype),{callback,unsafe:true,isRunning:true}),queue=[];
 O.assign(bus,{pulled:{[topic]:queue},pushed:{},subscribed:{}});project.workerBus=bus;
 const ready=[project,bus,manager,null,null,null,null,"a".repeat(16),null],original=[[],ready,()=>true,null],clock=[original,[],functions,null,null,null,null,null,()=>true];
 const prelude=[original,clock,bus,queue,task,callback,()=>true],link=[prelude,handler,()=>true],bound=[link,project,manager,()=>true],incoming={message:ready[7],replyTopic:reply},instance=[original,null,null,null,()=>true],entry=[instance,clock,()=>true],rpc=[bound,incoming,bus,ready[7],reply,()=>true],job=[rpc,instance,()=>true],service=[bus,incoming,topic,handler,callback,ready[7],reply],event=[bus,{}];
 const ownNative=[Promise,Promise.prototype,Promise.prototype.then,Promise.prototype.catch,Symbol.species,O.getOwnPropertyDescriptor(Promise,Symbol.species).get,Symbol.hasInstance,F.prototype[Symbol.hasInstance]];
 globalThis.state=F("return ("+W.prepare+")")().call(reflection,service,event,job,entry,ownNative);
 globalThis.synthetic={service,event,job,entry,ownNative,bus,task,queue,callback,handler,functions,manager,project};
 `,context);return context;
}
void test("synthetic native-recipe fixture preserves exact method identities and same result object without invoking hooks",():void=>{
 const context=workerFixture();vm.runInContext(`
 // Synthetic shape only; original Inspector internal slots are a separate host proof.\n const p=Object.create(Promise.prototype),frame=[...synthetic.service,p];globalThis.returned=Function("return ("+W.returned+")")().call(frame,state);
 const next=Object.assign(Object.create(Object.getPrototypeOf(synthetic.task)),{callback:synthetic.callback,unsafe:true,isRunning:true});synthetic.queue[0]=next;
 globalThis.serviceReturned=Function("return ("+W.serviceReturn+")")().call(synthetic.service.slice(0,5),state);
 const result={success:true};globalThis.success=Function("return ("+W.success+")")().call([synthetic.bus,result,reply],state,returned,result,result);
 globalThis.verified=Function("return ("+W.final+")")().call(reflection,state,returned,success,serviceReturned);
 `,context);assert.equal(vm.runInContext("verified",context),true);
 assert.throws(()=>vm.runInContext('Function("return ("+W.success+")")().call([synthetic.bus,{success:true},reply],state,returned,{success:true},{success:true})',context));
 const replaced=workerFixture();vm.runInContext('Object.getPrototypeOf(synthetic.bus).onMessage=function(){}',replaced);
 assert.throws(()=>vm.runInContext('Function("return ("+W.serviceReturn+")")().call(synthetic.service.slice(0,5),state)',replaced));
 const shadow=workerFixture();vm.runInContext('globalThis.hooks=0;Object.defineProperty(synthetic.bus,"publish",{get(){hooks+=1;return function(){};}})',shadow);
 assert.throws(()=>vm.runInContext('Function("return ("+W.prepare+")")().call(reflection,synthetic.service,synthetic.event,synthetic.job,synthetic.entry,synthetic.ownNative)',shadow));assert.equal(vm.runInContext("hooks",shadow),0);
});
void test("caller fixed programs compile and source qualifiers use actual installed complete files",async(context):Promise<void>=>{
 const configured=await readConfiguredEasyedaAssets(["pro-mgr/3.2.185.bf63a159/js/project-worker.js","pro-ui/3.2.198.2800f583/js/ui.js","pro-mgr/3.2.185.bf63a159/js/pro-mgr.js"]);if(configured===null){context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON);return;}
 const assets=process.env["EASYEDA_ASSETS_ROOT"];assert.ok(assets!==undefined&&assets.length>0);
 const [worker,ui,manager]=configured;assert.ok(worker!==undefined&&ui!==undefined&&manager!==undefined);
 qualifyCurrentFootprintInverseNativeDeleteCallerSources({worker,ui,manager});
 for(const program of[...Object.values(W),...Object.values(U)]){assert.equal(typeof vm.runInNewContext(`(${program})`),"function");}
 const packets=cases();assert.ok(packets.length>0);for(const packet of packets){assert.deepEqual(validate(packet),packet);}
 const outerResult=packets.find(p=>p.phase==="inverse-native-delete-caller-call"&&p.role==="outerResult");assert.ok(outerResult?.phase==="inverse-native-delete-caller-call");
 const wrongTruth=[...outerResult.params.arguments];wrongTruth[1]={value:"true"};assert.throws(()=>validate({...outerResult,params:{...outerResult.params,arguments:wrongTruth}}));
 const envelope=packets.find(p=>p.phase==="inverse-native-delete-caller-call"&&p.role==="innerEnvelope");assert.ok(envelope?.phase==="inverse-native-delete-caller-call");
 const wrongText=[...envelope.params.arguments];wrongText[3]={value:true};assert.throws(()=>validate({...envelope,params:{...envelope.params,arguments:wrongText}}));
 const arm=packets.find(p=>p.phase==="inverse-native-delete-caller-arm"&&p.role==="returned");assert.ok(arm);
 assert.throws(()=>validate({...arm,params:{...arm.params,condition:"true"}}));
 assert.throws(()=>validate({...arm,owner:"json-cannot-issue"}));
});
