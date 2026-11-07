/** Inert timer implementations and source-only compilation; no native owner or application is allocated. */
/* oxlint-disable import/max-dependencies -- The same fixed programs, purpose wire and original source are checked together. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import vm from "node:vm";
import { decodeCurrentProjectSyncQuiesceArray } from "../src/current-project-sync-quiesce-replies.ts";
import { CURRENT_PROJECT_SYNC_QUIESCE_PROGRAMS as PROGRAMS } from "../src/current-project-sync-quiesce-programs.ts";
import { CURRENT_PROJECT_SYNC_QUIESCE_ENTRY_CONDITION as CONDITION, CURRENT_PROJECT_SYNC_QUIESCE_METHOD as METHOD, qualifyCurrentProjectSyncQuiesceSource } from "../src/current-project-sync-quiesce-source.ts";
import { currentProjectSyncQuiesceNativeCases, validateCurrentProjectSyncQuiesceCommand } from "../src/current-project-sync-quiesce-protocol.ts";
import { currentProjectSyncQuiesceWire } from "../src/current-project-sync-quiesce-wire.ts";
import { currentPcbViaWriteNativeRequest } from "../src/current-pcb-via-write-protocol.ts";
import { currentSchematicDisplayWriteNativeRequest } from "../src/current-schematic-display-write-protocol.ts";
import { diagnosticNativeRequest } from "../src/current-pcb-diagnostic-protocol.ts";

// Node's Inspector declarations omit this supported CDP option. Keep it as
// Explicit extra data so the actual transport still receives the exact flag.
const SIDE_EFFECT = { throwOnSideEffect: true } as const;
function initialization(): string { return `let scheduled=0,cleared=0,lastCleared=null;function EventTarget(){}function WorkerGlobalScope(){}function DedicatedWorkerGlobalScope(){};
Object.setPrototypeOf(WorkerGlobalScope,EventTarget);Object.setPrototypeOf(WorkerGlobalScope.prototype,EventTarget.prototype);Object.setPrototypeOf(DedicatedWorkerGlobalScope.prototype,WorkerGlobalScope.prototype);Object.setPrototypeOf(globalThis,DedicatedWorkerGlobalScope.prototype);
Object.defineProperty(WorkerGlobalScope.prototype,"setTimeout",{value:function setTimeout(callback){scheduled++;return 17;},writable:true,enumerable:true,configurable:true});Object.defineProperty(WorkerGlobalScope.prototype,"clearTimeout",{value:function clearTimeout(){cleared++;lastCleared=arguments[0];},writable:true,enumerable:true,configurable:true});
const nativeString=Function.prototype.toString;Function.prototype.toString=function(){if(this===WorkerGlobalScope.prototype.setTimeout)return "function setTimeout() { [native code] }";if(this===WorkerGlobalScope.prototype.clearTimeout)return "function clearTimeout() { [native code] }";return nativeString.call(this);};
const Fe=false,proto={${METHOD.source}},project=Object.create(proto);project.isEstablished=false;project.projectTimer=null;globalThis.PROJECT=project;
`; }
function fixture():Readonly<{run:(source:string)=>unknown}> {
  const context=vm.createContext({});
  vm.runInContext(`${initialization()}\nconst captured=(${PROGRAMS.capture})();const original=(${PROGRAMS.entry}).call([project],project,captured);`,context);
  return Object.freeze({run:(source:string):unknown=>vm.runInContext(source,context)});
}
void test("the original first timer is cancelled once while its positive application slot remains unchanged",()=>{
  const f=fixture();assert.equal(f.run(CONDITION),true);f.run(`project.checkProject();const returned=(${PROGRAMS.returned}).call([project],original)`);
  assert.equal(f.run('scheduled'),1);assert.equal(f.run('project.projectTimer'),17);assert.equal(f.run('returned[0]===original'),true);
  assert.equal(JSON.stringify(f.run(`(${PROGRAMS.cancel}).call(returned)`)),JSON.stringify({schema:"private.project-sync-quiesce-cancel.v1",cancelled:true,timerSlotRetained:true}));
  assert.equal(f.run('cleared'),1);assert.equal(f.run('lastCleared'),17);assert.equal(f.run('project.projectTimer'),17);
  assert.throws(()=>f.run(`(${PROGRAMS.cancel}).call(returned)`));assert.equal(f.run('cleared'),1);
  // Calls with the retained positive slot cannot schedule again. A future reset stays held by the permanent entry guard.
  f.run('project.checkProject()');assert.equal(f.run('scheduled'),1);assert.equal(f.run(CONDITION),true);
  assert.equal(f.run(`(function(){return ${CONDITION}}).call(project)`),false);
  f.run('project.projectTimer=null');assert.equal(f.run(`(function(){return ${CONDITION}}).call(project)`),true);
});
void test("receiver, slot and native descriptor drift refuse before another cancellation; an unknown native outcome burns the attempt",()=>{
  for(const change of ['project.projectTimer=18','globalThis.PROJECT={}','Object.defineProperty(project,"projectTimer",{get(){throw Error("getter")}})','Reflect.apply=function(){throw Error("replacement") }']){
    const f=fixture();f.run(`project.checkProject();const returned=(${PROGRAMS.returned}).call([project],original)`);f.run(change);assert.throws(()=>f.run(`(${PROGRAMS.cancel}).call(returned)`));assert.equal(f.run('cleared'),0);
  }
  const f=fixture();f.run(`project.checkProject();const returned=(${PROGRAMS.returned}).call([project],original);original[4].attempted=true`);assert.throws(()=>f.run(`(${PROGRAMS.cancel}).call(returned)`));assert.equal(f.run('cleared'),0);
});
void test("twenty-eight exact commands select only their original Via wire and allow no caller timer or program",()=>{
  const cases=currentProjectSyncQuiesceNativeCases();assert.equal(cases.length,28);
  for(const command of cases){const bytes=Buffer.from(`${JSON.stringify({id:1,...command,syncQuiesceCommand:true,sessionId:"worker-original"})}\0`);assert.deepEqual(currentPcbViaWriteNativeRequest(bytes),currentProjectSyncQuiesceWire(command,1,"via").request);assert.throws(()=>diagnosticNativeRequest(bytes));assert.throws(()=>currentSchematicDisplayWriteNativeRequest(bytes));assert.throws(()=>validateCurrentProjectSyncQuiesceCommand({...command,timerId:17}));
    if(command.method==="Runtime.callFunctionOn"){assert.throws(()=>validateCurrentProjectSyncQuiesceCommand({...command,params:{...command.params,functionDeclaration:"function(){clearTimeout(17)}"}}));}
  }
});
void test("the pinned original method exposes exact entry, native call, return and opening caller without executing it",async context=>{
  let source:string;try{source=await readFile('/mnt/c/Program Files/easyeda-pro/resources/app/assets/pro-mgr/3.2.185.bf63a159/js/project-worker.js','utf8');}catch(error){if(error!==null&&typeof error==="object"&&"code" in error&&error.code==="ENOENT"){context.skip("Pinned installed source unavailable");return;}throw error;}
  qualifyCurrentProjectSyncQuiesceSource(source);const inspector=new Session();inspector.connect();try{await inspector.post("Runtime.enable");await inspector.post("Debugger.enable");const compiled=await inspector.post("Runtime.compileScript",{expression:source,sourceURL:"source-only-sync-quiesce.js",persistScript:true});assert.ok(compiled.scriptId!==undefined);
    for(const [column,type]of [[112_810,undefined],[112_868,"call"],[112_997,"return"],[97_017,"call"]] as const){const locations:unknown=await inspector.post("Debugger.getPossibleBreakpoints",{start:{scriptId:compiled.scriptId,lineNumber:110,columnNumber:column},end:{scriptId:compiled.scriptId,lineNumber:110,columnNumber:column+1},restrictToFunction:true});assert.deepEqual(locations,{locations:[{scriptId:compiled.scriptId,lineNumber:110,columnNumber:column,...(type===undefined?{}:{type})}]});}
  }finally{inspector.disconnect();}
});

void test("actual inert Inspector private arrays use exact mutable descriptors and frozen tuples refuse",async()=>{
  const inspector=new Session();inspector.connect();try{await inspector.post("Runtime.enable");for(const frozen of [true,false]){const captured=await inspector.post("Runtime.evaluate",{expression:frozen?"Object.freeze([1,{},function(){}])":"[1,{},function(){}]",returnByValue:false});const objectId=captured.result.objectId;assert.ok(objectId!==undefined);const properties=await inspector.post("Runtime.getProperties",{objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false});if(frozen){assert.throws(()=>decodeCurrentProjectSyncQuiesceArray(properties,3));}else{const fields=decodeCurrentProjectSyncQuiesceArray(properties,3);assert.equal(fields.get("0")?.value,1);}}}finally{inspector.disconnect();}
});

void test("actual Inspector permits fixed polling captures with side-effect checking and rejects tuple drift",async()=>{
  // Browser globals/timer implementations are inert substitutes. The actual
  // Inspector executes unchanged production programs with the production flag.
  const world=vm.createContext({},{name:"inert-polling-capture"});vm.runInContext(initialization(),world);
  const inspector=new Session();inspector.connect();const contexts:number[]=[];
  inspector.on("Runtime.executionContextCreated",notification=>{if(notification.params.context.name==="inert-polling-capture"){contexts.push(notification.params.context.id);}});
  try{await inspector.post("Runtime.enable");const contextId=contexts[0];assert.ok(contextId!==undefined);
    const capture=await inspector.post("Runtime.evaluate",{contextId,expression:`(${PROGRAMS.capture})()`,...SIDE_EFFECT,returnByValue:false});
    assert.equal(capture.exceptionDetails,undefined);const captured=capture.result.objectId;assert.ok(captured!==undefined);
    decodeCurrentProjectSyncQuiesceArray(await inspector.post("Runtime.getProperties",{objectId:captured,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}),20);
    const frame=await inspector.post("Runtime.evaluate",{contextId,expression:"[PROJECT]",...SIDE_EFFECT,returnByValue:false}),project=await inspector.post("Runtime.evaluate",{contextId,expression:"PROJECT",...SIDE_EFFECT,returnByValue:false});
    const frameId=frame.result.objectId,projectId=project.result.objectId;assert.ok(frameId!==undefined&&projectId!==undefined);
    const entry=await inspector.post("Runtime.callFunctionOn",{objectId:frameId,functionDeclaration:PROGRAMS.entry,arguments:[{objectId:projectId},{objectId:captured}],...SIDE_EFFECT,returnByValue:false});
    assert.equal(entry.exceptionDetails,undefined);const original=entry.result.objectId;assert.ok(original!==undefined);
    vm.runInContext("project.projectTimer=17",world);
    const returned=await inspector.post("Runtime.callFunctionOn",{objectId:frameId,functionDeclaration:PROGRAMS.returned,arguments:[{objectId:original}],...SIDE_EFFECT,returnByValue:false});
    assert.equal(returned.exceptionDetails,undefined);const returnedId=returned.result.objectId;assert.ok(returnedId!==undefined);
    decodeCurrentProjectSyncQuiesceArray(await inspector.post("Runtime.getProperties",{objectId:returnedId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}),3);
    const mutation=await inspector.post("Runtime.callFunctionOn",{objectId:captured,functionDeclaration:"function(){this[0]={};}",returnByValue:true});assert.equal(mutation.exceptionDetails,undefined);
    const refused=await inspector.post("Runtime.callFunctionOn",{objectId:frameId,functionDeclaration:PROGRAMS.returned,arguments:[{objectId:original}],...SIDE_EFFECT,returnByValue:false});assert.ok(refused.exceptionDetails!==undefined);
    assert.equal(vm.runInContext("scheduled+cleared",world),0);assert.equal(vm.runInContext("project.projectTimer",world),17);
  }finally{inspector.disconnect();}
});

void test("Inspector rewraps original references and equality must be proved inside the original realm",async()=>{
  const inspector=new Session();inspector.connect();try{await inspector.post("Runtime.enable");const entry=await inspector.post("Runtime.evaluate",{expression:"[1,2,3,4,5]",objectGroup:"inert-timer-alias",returnByValue:false});const id=entry.result.objectId;assert.ok(id!==undefined);const returned=await inspector.post("Runtime.callFunctionOn",{objectId:id,functionDeclaration:"function(){return [this,17,{}]}",objectGroup:"inert-timer-alias",returnByValue:false});const returnedId=returned.result.objectId;assert.ok(returnedId!==undefined);const fields=decodeCurrentProjectSyncQuiesceArray(await inspector.post("Runtime.getProperties",{objectId:returnedId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}),3);const rewrapped=fields.get("0")?.objectId;assert.ok(rewrapped!==undefined);assert.notEqual(rewrapped,id);const identity:unknown=await inspector.post("Runtime.callFunctionOn",{objectId:rewrapped,functionDeclaration:"function(original){return this===original}",arguments:[{objectId:id}],returnByValue:true});assert.deepEqual(identity,{result:{type:"boolean",value:true}});await inspector.post("Runtime.releaseObjectGroup",{objectGroup:"inert-timer-alias"});}finally{inspector.disconnect();}
});
