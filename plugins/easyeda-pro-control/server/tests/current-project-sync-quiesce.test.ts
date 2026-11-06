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

function fixture():Readonly<{run:(source:string)=>unknown}> {
  const context=vm.createContext({});
  vm.runInContext(`let scheduled=0,cleared=0,lastCleared=null;function EventTarget(){}function WorkerGlobalScope(){}function DedicatedWorkerGlobalScope(){};
Object.setPrototypeOf(WorkerGlobalScope,EventTarget);Object.setPrototypeOf(WorkerGlobalScope.prototype,EventTarget.prototype);Object.setPrototypeOf(DedicatedWorkerGlobalScope.prototype,WorkerGlobalScope.prototype);Object.setPrototypeOf(globalThis,DedicatedWorkerGlobalScope.prototype);
Object.defineProperty(WorkerGlobalScope.prototype,"setTimeout",{value:function setTimeout(callback){scheduled++;return 17;},writable:true,enumerable:true,configurable:true});Object.defineProperty(WorkerGlobalScope.prototype,"clearTimeout",{value:function clearTimeout(){cleared++;lastCleared=arguments[0];},writable:true,enumerable:true,configurable:true});
const nativeString=Function.prototype.toString;Function.prototype.toString=function(){if(this===WorkerGlobalScope.prototype.setTimeout)return "function setTimeout() { [native code] }";if(this===WorkerGlobalScope.prototype.clearTimeout)return "function clearTimeout() { [native code] }";return nativeString.call(this);};
const Fe=false,proto={${METHOD.source}},project=Object.create(proto);project.isEstablished=false;project.projectTimer=null;globalThis.PROJECT=project;
const captured=(${PROGRAMS.capture})();const original=(${PROGRAMS.entry}).call([project],project,captured);
`,context);
  return Object.freeze({run:(source:string):unknown=>vm.runInContext(source,context)});
}
void test("the original first timer is cancelled once while its positive application slot remains unchanged",()=>{
  const f=fixture();assert.equal(f.run(CONDITION),true);f.run(`project.checkProject();const returned=(${PROGRAMS.returned}).call([project],original)`);
  assert.equal(f.run('scheduled'),1);assert.equal(f.run('project.projectTimer'),17);
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

void test("actual inert Inspector frozen arrays use readonly descriptors and mutable tuples refuse",async()=>{
  const inspector=new Session();inspector.connect();try{await inspector.post("Runtime.enable");for(const frozen of [true,false]){const captured=await inspector.post("Runtime.evaluate",{expression:frozen?"Object.freeze([1,{},function(){}])":"[1,{},function(){}]",returnByValue:false});const objectId=captured.result.objectId;assert.ok(objectId!==undefined);const properties=await inspector.post("Runtime.getProperties",{objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false});if(frozen){const fields=decodeCurrentProjectSyncQuiesceArray(properties,3);assert.equal(fields.get("0")?.value,1);}else{assert.throws(()=>decodeCurrentProjectSyncQuiesceArray(properties,3));}}}finally{inspector.disconnect();}
});
