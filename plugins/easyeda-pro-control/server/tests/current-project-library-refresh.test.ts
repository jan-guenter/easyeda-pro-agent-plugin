/** Pinned source-only compilation and inert original-method control. Synthetic
 * frame/native-string fixtures issue no native origin or completion authority. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import vm from "node:vm";
import { CURRENT_PROJECT_LIBRARY_REFRESH_HELPERS as HELPERS, CURRENT_PROJECT_LIBRARY_REFRESH_PROGRAMS as PROGRAMS, qualifyCurrentProjectLibraryRefreshHelperSource } from "../src/current-project-library-refresh-programs.ts";
import { CURRENT_PROJECT_LIBRARY_REFRESH_REQUESTS as REQUESTS, currentProjectLibraryRefreshCases, validateCurrentProjectLibraryRefreshCommand } from "../src/current-project-library-refresh-protocol.ts";
import { CURRENT_PROJECT_LIBRARY_REFRESH_METHODS as METHODS, CURRENT_PROJECT_OPEN_STARTUP_METHODS as OPENING, CURRENT_PROJECT_LIBRARY_REFRESH_SITES as SITES, qualifyCurrentProjectLibraryRefreshSource } from "../src/current-project-library-refresh-source.ts";

const installed="/mnt/c/Program Files/easyeda-pro/resources/app/assets/pro-mgr/3.2.185.bf63a159/js/project-worker.js";
async function source():Promise<string|null>{try{return await readFile(installed,"utf8");}catch(error){if(error!==null&&typeof error==="object"&&"code"in error&&error.code==="ENOENT"){return null;}throw error;}}
function fixture(full:string):Readonly<{run:(program:string)=>unknown}> {
  const context=vm.createContext({});
  const classRanges=[['Hm',1_651_566,1_652_838],['mr',1_844_116,1_844_807],['Kr',1_946_988,1_947_733],['Ld',1_947_741,1_949_996],['kd',1_950_004,1_952_422],['Bd',1_952_430,1_954_611],['Md',1_954_619,1_957_297],['jd',1_957_305,1_959_498],['Fd',1_959_506,1_962_159],['Ud',1_962_167,1_964_458],['fu',1_964_491,1_967_988]] as const;
  vm.runInContext(`let scheduled=0,cancelled=0,lastCancelled=null,clockReads=0,rpcCalls=0;const console={log(){},warn(){},error(){},time(){},timeEnd(){}};const performance={now(){clockReads++;return 42;}};
function EventTarget(){}function WorkerGlobalScope(){}function DedicatedWorkerGlobalScope(){}Object.setPrototypeOf(WorkerGlobalScope,EventTarget);Object.setPrototypeOf(WorkerGlobalScope.prototype,EventTarget.prototype);Object.setPrototypeOf(DedicatedWorkerGlobalScope,WorkerGlobalScope);Object.setPrototypeOf(DedicatedWorkerGlobalScope.prototype,WorkerGlobalScope.prototype);Object.setPrototypeOf(globalThis,DedicatedWorkerGlobalScope.prototype);
Object.defineProperty(DedicatedWorkerGlobalScope.prototype,"requestAnimationFrame",{value:function requestAnimationFrame(){scheduled++;return 31;},writable:true,configurable:true,enumerable:true});Object.defineProperty(DedicatedWorkerGlobalScope.prototype,"cancelAnimationFrame",{value:function cancelAnimationFrame(){cancelled++;lastCancelled=arguments[0];},writable:true,configurable:true,enumerable:true});
const nativeString=Function.prototype.toString;Function.prototype.toString=function(){if(this===DedicatedWorkerGlobalScope.prototype.requestAnimationFrame)return "function requestAnimationFrame() { [native code] }";if(this===DedicatedWorkerGlobalScope.prototype.cancelAnimationFrame)return "function cancelAnimationFrame() { [native code] }";return nativeString.call(this);};const self=globalThis,ln=true,li="__PROJECT_UPDATE_DATA__",$A="__UPDATE_DATA_MGR__",rb={IsActive:"synthetic"};
${classRanges.map(([name,start,end])=>`const ${name}=${full.slice(start,end)};`).join("\n")}
const captured=(${PROGRAMS.capture}).call([fu,Hm,Kr,mr,Fd,kd,Ld,Md,jd,Bd,Ud,ln,li,$A]);const project=Object.create({get updateData(){return this._updateData}});project.uuid="synthetic_disposable";project._updateData=null;project.mainMesBus={async rpcCall(){rpcCalls++;return{message:true}}};globalThis.PROJECT=project;const refresh=new fu(project);project._updateData=refresh;refresh.init();refresh._timer=1;const original=(${PROGRAMS.firstLoop}).call([refresh,false,[],refresh,42,undefined],project,captured);`,context);
  return Object.freeze({run:(program:string):unknown=>vm.runInContext(program,context)});
}
void test("first loop suspension excludes todo/condition and cancels only its original RAF once",async context=>{
  const full=await source();if(full===null){context.skip("Pinned installed source unavailable");return;}const f=fixture(full);
  const suspended=structuredClone(f.run(`(${PROGRAMS.suspend}).call(original)`));assert.deepEqual(suspended,{schema:"private.project-library-refresh-suspend.v1",firstTodoExcluded:true,timerMinusOne:true});
  await f.run("refresh.loop(false)");assert.equal(f.run("clockReads"),1);assert.equal(f.run("rpcCalls"),0);assert.equal(f.run("scheduled"),1);
  f.run(`const returned=(${PROGRAMS.loopReturned}).call([refresh,false,[],refresh,42,undefined],original)`);
  assert.equal(f.run(`(${PROGRAMS.cancel}).call(returned).originalAnimationCancelled`),true);assert.equal(f.run("cancelled"),1);assert.equal(f.run("lastCancelled"),31);assert.equal(f.run("refresh._timer"),-1);assert.equal(f.run("refresh.animation"),31);
  assert.throws(()=>f.run(`(${PROGRAMS.suspend}).call(original)`));assert.throws(()=>f.run(`(${PROGRAMS.cancel}).call(returned)`));assert.throws(()=>f.run(`(${PROGRAMS.reprove}).call(original)`));
  // This is an inert supplied frame, not a native receipt or completion issuer.
  assert.equal(f.run(`(${PROGRAMS.mountReturned}).call([refresh],original).originalLoopAwaitCompleted`),true);assert.equal(f.run(`(${PROGRAMS.reprove}).call(original).fullProducerFrontierVerified`),false);assert.equal(f.run(`(${PROGRAMS.reprove}).call(original).originalMountPromiseObjectRetained`),false);assert.equal(f.run("cancelled"),1);
});
void test("original descriptors, source, cache roster and RAF slot drift refuse before cancellation",async context=>{
  const full=await source();if(full===null){context.skip("Pinned installed source unavailable");return;}
  for(const change of ['refresh.animation=32','refresh._timer=1','refresh.profiles.extra={}','refresh.symbol.cache.cache.extra={}','globalThis.PROJECT={}','Hm.prototype.suspend=function(){}','refresh.conditions[0]=async()=>true','Object.defineProperty(refresh,"timer",{set(){throw Error("unexpected setter")}})' ]){
    const f=fixture(full);f.run(`(${PROGRAMS.suspend}).call(original)`);await f.run("refresh.loop(false)");f.run(`const returned=(${PROGRAMS.loopReturned}).call([refresh,false,[],refresh,42,undefined],original)`);f.run(change);assert.throws(()=>f.run(`(${PROGRAMS.cancel}).call(returned)`),change);assert.equal(f.run("cancelled"),0);
  }
});
void test("complete pinned opening closure and every fixed loop point compile without app execution",async context=>{
  const full=await source();if(full===null){context.skip("Pinned installed source unavailable");return;}qualifyCurrentProjectLibraryRefreshSource(full);assert.equal(OPENING.length,60);assert.equal(Object.keys(METHODS).length,19);assert.throws(()=>{ qualifyCurrentProjectLibraryRefreshSource(`${full}\n`); });
  const inspector=new Session();inspector.connect();try{await inspector.post("Runtime.enable");await inspector.post("Debugger.enable");const compiled=await inspector.post("Runtime.compileScript",{expression:full,sourceURL:"inert-library-refresh-source-only.js",persistScript:true});assert.ok(compiled.scriptId!==undefined);
    for(const [role,site]of Object.entries(SITES)){const found:unknown=await inspector.post("Debugger.getPossibleBreakpoints",{start:{scriptId:compiled.scriptId,lineNumber:site.lineNumber,columnNumber:site.columnNumber},end:{scriptId:compiled.scriptId,lineNumber:site.lineNumber,columnNumber:site.columnNumber+1},restrictToFunction:true});assert.deepEqual(found,{locations:[{scriptId:compiled.scriptId,lineNumber:site.lineNumber,columnNumber:site.columnNumber,...(role==="loopReturned"||role==="mountReturned"?{type:"return"}:{})}]},role);}
  }finally{inspector.disconnect();}
});
void test("fixed selector grammar and complete native reservation accept no caller action or animation ID",()=>{
  const cases=currentProjectLibraryRefreshCases();assert.equal(cases.length,50);
  assert.equal(REQUESTS.normal,REQUESTS.arms+REQUESTS.moduleCapture+REQUESTS.capturedTuple+REQUESTS.functionMetadata+REQUESTS.frames+REQUESTS.joins+REQUESTS.effects+REQUESTS.resumes);
  assert.equal(REQUESTS.cdpRequests,REQUESTS.normal+REQUESTS.helperSources);assert.equal(REQUESTS.total,REQUESTS.cdpRequests+REQUESTS.cleanup);
  assert.equal(HELPERS.reduce((sum,row)=>sum+row.emissions,0),REQUESTS.helperSources);
  for(const row of HELPERS){qualifyCurrentProjectLibraryRefreshHelperSource(row.source,row.program);assert.throws(()=>{qualifyCurrentProjectLibraryRefreshHelperSource(`${row.source}\n`,row.program);});}
  assert.throws(()=>{qualifyCurrentProjectLibraryRefreshHelperSource("function(){return true}","function(){return true}");});
  for(const command of cases){assert.deepEqual(validateCurrentProjectLibraryRefreshCommand(command),command);assert.throws(()=>validateCurrentProjectLibraryRefreshCommand({...command,animationId:31}));
    if(command.method==="Runtime.callFunctionOn"){assert.throws(()=>validateCurrentProjectLibraryRefreshCommand({...command,params:{...command.params,functionDeclaration:"function(){this.timer=-1}"}}));}
    if(command.phase==="library-refresh-arm"){assert.throws(()=>validateCurrentProjectLibraryRefreshCommand({...command,params:{location:{...command.params.location,columnNumber:command.params.location.columnNumber+1}}}));}
  }
  assert.throws(()=>validateCurrentProjectLibraryRefreshCommand({phase:"library-refresh-resume",role:"refreshTodo",method:"Debugger.resume",params:{}}));
});
