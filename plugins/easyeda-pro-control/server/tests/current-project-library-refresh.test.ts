/** Pinned source-only compilation and inert original-method control. Synthetic
 * frame/native-string fixtures issue no native origin or completion authority. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import vm from "node:vm";
import { CurrentProjectLibraryRefreshObserver,requireOriginalCurrentProjectLibraryRefreshCompletion } from "../src/current-project-library-refresh-observer.ts";
import { CURRENT_PROJECT_LIBRARY_REFRESH_HELPERS as HELPERS, CURRENT_PROJECT_LIBRARY_REFRESH_PROGRAMS as PROGRAMS, qualifyCurrentProjectLibraryRefreshHelperSource } from "../src/current-project-library-refresh-programs.ts";
import { CURRENT_PROJECT_LIBRARY_REFRESH_REQUESTS as REQUESTS, currentProjectLibraryRefreshCases, validateCurrentProjectLibraryRefreshCommand } from "../src/current-project-library-refresh-protocol.ts";
import { currentProjectLibraryRefreshArrayObject,decodeCurrentProjectLibraryRefreshFrame,decodeCurrentProjectLibraryRefreshFunction } from "../src/current-project-library-refresh-replies.ts";
import { CURRENT_PROJECT_LIBRARY_REFRESH_METHODS as METHODS, CURRENT_PROJECT_OPEN_STARTUP_METHODS as OPENING,CURRENT_PROJECT_LIBRARY_REFRESH_FUNCTION_PROFILES as PROFILES, CURRENT_PROJECT_LIBRARY_REFRESH_SITES as SITES, qualifyCurrentProjectLibraryRefreshSource } from "../src/current-project-library-refresh-source.ts";

const installed="/mnt/c/Program Files/easyeda-pro/resources/app/assets/pro-mgr/3.2.185.bf63a159/js/project-worker.js";
async function source():Promise<string|null>{try{return await readFile(installed,"utf8");}catch(error){if(error!==null&&typeof error==="object"&&"code"in error&&error.code==="ENOENT"){return null;}throw error;}}
function fixture(full:string):Readonly<{run:(program:string)=>unknown}> {
  const context=vm.createContext({});
  const classRanges=[['Hm',1_651_566,1_652_838],['mr',1_844_116,1_844_807],['Kr',1_946_988,1_947_733],['Ld',1_947_741,1_949_996],['kd',1_950_004,1_952_422],['Bd',1_952_430,1_954_611],['Md',1_954_619,1_957_297],['jd',1_957_305,1_959_498],['Fd',1_959_506,1_962_159],['Ud',1_962_167,1_964_458],['fu',1_964_491,1_967_988]] as const;
  vm.runInContext(`let scheduled=0,cancelled=0,lastCancelled=null,clockReads=0,rpcCalls=0;const console={log(){},warn(){},error(){},time(){},timeEnd(){}};const performance={now(){clockReads++;return 42;}};
function EventTarget(){}function WorkerGlobalScope(){}function DedicatedWorkerGlobalScope(){}Object.setPrototypeOf(WorkerGlobalScope,EventTarget);Object.setPrototypeOf(WorkerGlobalScope.prototype,EventTarget.prototype);Object.setPrototypeOf(DedicatedWorkerGlobalScope,WorkerGlobalScope);Object.setPrototypeOf(DedicatedWorkerGlobalScope.prototype,WorkerGlobalScope.prototype);Object.setPrototypeOf(globalThis,DedicatedWorkerGlobalScope.prototype);
Object.defineProperty(DedicatedWorkerGlobalScope.prototype,"requestAnimationFrame",{value:function requestAnimationFrame(){scheduled++;return 31;},writable:true,configurable:true,enumerable:true});Object.defineProperty(DedicatedWorkerGlobalScope.prototype,"cancelAnimationFrame",{value:function cancelAnimationFrame(){cancelled++;lastCancelled=arguments[0];},writable:true,configurable:true,enumerable:true});
const nativeString=Function.prototype.toString;Function.prototype.toString=function(){if(this===DedicatedWorkerGlobalScope.prototype.requestAnimationFrame)return "function requestAnimationFrame() { [native code] }";if(this===DedicatedWorkerGlobalScope.prototype.cancelAnimationFrame)return "function cancelAnimationFrame() { [native code] }";return nativeString.call(this);};const self=globalThis,ln=true,li="__PROJECT_UPDATE_DATA__",$A="__UPDATE_DATA_MGR__",rb={IsActive:"synthetic"};
const pristine=(${PROGRAMS.pristine})();
${classRanges.map(([name,start,end])=>`const ${name}=${full.slice(start,end)};`).join("\n")}
const project=Object.create({get updateData(){return this._updateData}});project.uuid="synthetic_disposable";project._updateData=null;project.mainMesBus={async rpcCall(){rpcCalls++;return{message:true}}};globalThis.PROJECT=project;const refresh=new fu(project);project._updateData=refresh;refresh.init();refresh._timer=1;const captured=(${PROGRAMS.capture}).call([fu,Hm,Kr,mr,Fd,kd,Ld,Md,jd,Bd,Ud,ln,li,$A],pristine);const original=(${PROGRAMS.firstLoop}).call([refresh,false,[],refresh,42,undefined],project,captured);`,context);
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
  const cases=currentProjectLibraryRefreshCases();assert.equal(cases.length,52);
  assert.equal(REQUESTS.normal,REQUESTS.arms+REQUESTS.pristineCapture+REQUESTS.moduleCapture+REQUESTS.capturedTuple+REQUESTS.functionMetadata+REQUESTS.frames+REQUESTS.joins+REQUESTS.effects+REQUESTS.resumes);
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
void test("actual Inspector class metadata has the strict constructor shape and rejects extra own fields",async context=>{
  const full=await source();if(full===null){context.skip("Pinned installed source unavailable");return;}
  const classes=PROFILES.filter(row=>!row.native);let isolated=full.replaceAll(/[^\r\n]/gu," ");
  for(const row of classes){const prefix=`;var ${row.name}=`;isolated=isolated.slice(0,row.start-prefix.length)+prefix+full.slice(row.start,row.end)+isolated.slice(row.end);}
  const inspector=new Session();inspector.connect();try{await inspector.post("Runtime.enable");
    // Only class definitions execute in an owned inert script. No constructor,
    // Original application module, cache, timer or method is invoked.
    const script=`(()=>{${isolated};return [${classes.map(row=>row.name).join(",")}];})()`;
    const compiled:unknown=await inspector.post("Runtime.compileScript",{expression:script,sourceURL:"inert-library-refresh-classes.js",persistScript:true});assert.ok(compiled!==null&&typeof compiled==="object"&&"scriptId"in compiled&&typeof compiled.scriptId==="string");const scriptId=compiled.scriptId;
    const result=await inspector.post("Runtime.runScript",{scriptId,returnByValue:false,objectGroup:"inert-library-refresh-metadata"});const id:unknown=result.result.objectId;assert.equal(typeof id,"string");if(typeof id!=="string"){throw new TypeError("Missing inert tuple");}
    const fields=decodeCurrentProjectLibraryRefreshFrame(await inspector.post("Runtime.getProperties",{objectId:id,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}),11);
    for(const row of classes){const objectId=currentProjectLibraryRefreshArrayObject(fields,row.slot-3);const metadata:unknown=await inspector.post("Runtime.getProperties",{objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false});
      // The isolated script preserves the pinned constructor coordinates; its
      // Actual script ID is deliberately used rather than an application ID.
      decodeCurrentProjectLibraryRefreshFunction(metadata,row.slot,scriptId,full);assert.throws(()=>{decodeCurrentProjectLibraryRefreshFunction(metadata,row.slot,"different_original_script",full);});
    }
    const objectId=currentProjectLibraryRefreshArrayObject(fields,0);await inspector.post("Runtime.callFunctionOn",{objectId,functionDeclaration:"function(){this.extra=1;}",arguments:[]});const changed:unknown=await inspector.post("Runtime.getProperties",{objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false});assert.throws(()=>{decodeCurrentProjectLibraryRefreshFunction(changed,3,scriptId,full);});
    await inspector.post("Runtime.releaseObjectGroup",{objectGroup:"inert-library-refresh-metadata"});
  }finally{inspector.disconnect();}
});
void test("copied purpose brands cannot create the shared observer or a private completion",()=>{
  const inverse={profile:"private.current-footprint-inverse-library-refresh-origin.v1"}as const;const schematic={profile:"private.current-schematic-relevance-library-refresh-origin.v1"}as const;const operation={},owner={};
  assert.throws(()=>new CurrentProjectLibraryRefreshObserver(inverse,owner,operation));assert.throws(()=>new CurrentProjectLibraryRefreshObserver(schematic,owner,operation));
  const copy={profile:"private.current-project-library-refresh-completion.v1"}as const;
  assert.throws(()=>{Reflect.apply(requireOriginalCurrentProjectLibraryRefreshCompletion,undefined,[copy,{},inverse,owner,operation]);});
});
