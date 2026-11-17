/** Inert same-reference stock/Error joins; no SQL or EasyEDA is executed. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { Session } from "node:inspector";
import { runInContext } from "node:vm";
import { CURRENT_MAIN_STARTUP_LIBRARY_V2_CALLS as CALLS } from "../src/current-main-startup-library-v2-programs.ts";
import { CURRENT_MAIN_STARTUP_LIBRARY_READONLY_PROGRAM as PROOF } from "../src/current-main-startup-library-readonly-program.ts";
import { CurrentMainStartupLibraryReadonlySchedule, CURRENT_MAIN_STARTUP_LIBRARY_READONLY_PROFILE as PROFILE } from "../src/current-main-startup-library-readonly-profile.ts";
import { fixture } from "./helpers/startup-library-fixture.ts";
import { CURRENT_MAIN_STARTUP_LIBRARY_READONLY_SOURCE as SOURCE } from "../src/current-main-startup-library-readonly-source.ts";

function bound(packaged=true):ReturnType<typeof fixture> {
  const context=fixture(packaged,320,true);
  runInContext(`const rawInvocation=yE.replace(/^--.*$/g,"").split(/\\r?\\n\\r?\\n/m);const caller=index=>[kit.libraryOwner,rawInvocation,kit.tuple(index,[])[1]];tracker=(${CALLS.bind}).call(frame,kit.configTracker,kit.app,caller(0));const tuple=kit.tuple(0,[]);(${CALLS.select}).call(tuple,kit.configTracker,tracker,caller(0));const error=Object.assign(new Error("synthetic"),{code:"SQLITE_READONLY",errno:8});let rejected=[tuple[0],tuple[1],tuple[2],error];`,context);
  return context;
}
const prove=`(${PROOF}).call(tuple,kit.configTracker,tracker,rejected)`;
void test("the installed first stock run accepts its own original native error frame without changing the cursor or Error",()=>{
  const context=bound(),result:unknown=runInContext(prove,context);
  assert.deepEqual(structuredClone(result),{observed:true,failureCode:"SQLITE_READONLY",errno:8,scriptIndex:0,installedStockOnly:true,originalRethrowPending:true,normalReturnProven:false,nativeCompletionProven:false,successfulInitializationProven:false,selectedProjectWriteGrant:false,retryAllowed:false});
  assert.equal(runInContext("tracker[0][9].next",context),1);assert.equal(runInContext("calls",context),0);
  assert.equal(runInContext("rejected[3]===error&&error.errno===8&&error.code==='SQLITE_READONLY'",context),true);
});
void test("foreign receivers, substituted parameters, wrong errors, later cursor, profile path and accessors fail closed",()=>{
  for(const changed of ['rejected[0]=kit.tuple(0,[],true)[0]','rejected[2]=[]','rejected[3]={code:"SQLITE_READONLY",errno:8}','error.code="SQLITE_BUSY"','error.errno=14','tracker[0][9].next=2','Object.defineProperty(error,"code",{get(){calls++;throw Error("getter")}})','rejected=new Proxy(rejected,{})']) {
    const context=bound();runInContext(changed,context);
    assert.throws(()=>runInContext(prove,context));assert.equal(runInContext("calls",context),0);
  }
  assert.throws(()=>runInContext(prove,bound(false)));
});
void test("readonly observation has an independent exact normal/rejection schedule and no retry",()=>{
  const rejected=new CurrentMainStartupLibraryReadonlySchedule();for(const phase of PROFILE.phases) { rejected.consume(`sql-stock-readonly-${phase}`); }
  assert.equal(rejected.requests,8);assert.equal(rejected.complete,true);assert.equal(rejected.rejected,true);
  assert.throws(()=>{ rejected.consume("sql-stock-readonly-resume"); });
  const normal=new CurrentMainStartupLibraryReadonlySchedule();for(const phase of ["points","arm","disarm-normal"]) { normal.consume(`sql-stock-readonly-${phase}`); }
  assert.equal(normal.requests,3);assert.equal(normal.complete,true);assert.equal(normal.rejected,false);
  const failed=new CurrentMainStartupLibraryReadonlySchedule();assert.throws(()=>{ failed.consume("sql-stock-readonly-frame"); });assert.throws(()=>{ failed.consume("sql-stock-readonly-points"); });
});

void test("actual inert Inspector executes the fixed join with side-effect checks enabled",()=>{
  const session=new Session();session.connect();const ids:number[]=[];let context:ReturnType<typeof fixture> | null=null;
  function request(method:string,params:object={}):unknown {
    let complete=false;let reply:unknown;const outcome:{failure:Error|null}={failure:null};
    // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Same-process Inspector replies synchronously; no external process or native owner is contacted.
    session.post(method,params,(error,value):void=>{complete=true;outcome.failure=error;reply=value;});
    assert.equal(complete,true);if(outcome.failure!==null) { throw outcome.failure; }return reply;
  }
  session.on("Runtime.executionContextCreated",event=>{ids.push(event.params.context.id);});
  try {
    request("Runtime.enable");const before=ids.length;context=bound();assert.equal(ids.length,before+1);const id=ids.at(-1);assert.ok(id!==undefined);
    const raw:unknown=request("Runtime.evaluate",{expression:"tuple",contextId:id,returnByValue:false,throwOnSideEffect:true});
    assert.ok(raw!==null&&typeof raw==="object");const remote:unknown=Reflect.get(raw,"result");assert.ok(remote!==null&&typeof remote==="object");const objectId:unknown=Reflect.get(remote,"objectId");assert.equal(typeof objectId,"string");
    const argumentIds=["kit.configTracker","tracker","rejected"].map(expression=>{
      const response:unknown=request("Runtime.evaluate",{expression,contextId:id,returnByValue:false,throwOnSideEffect:true});
      assert.ok(response!==null&&typeof response==="object");const result:unknown=Reflect.get(response,"result");assert.ok(result!==null&&typeof result==="object");const argumentId:unknown=Reflect.get(result,"objectId");assert.equal(typeof argumentId,"string");return{objectId:argumentId};
    });
    const response:unknown=request("Runtime.callFunctionOn",{objectId,functionDeclaration:PROOF,arguments:argumentIds,returnByValue:true,throwOnSideEffect:true,awaitPromise:false,silent:true});
    assert.ok(response!==null&&typeof response==="object");assert.equal(Reflect.get(response,"exceptionDetails"),undefined);
    const result:unknown=Reflect.get(response,"result");assert.ok(result!==null&&typeof result==="object");const value:unknown=Reflect.get(result,"value");assert.ok(value!==null&&typeof value==="object");assert.equal(Reflect.get(value,"observed"),true);
    assert.equal(runInContext("calls",context),0);
  } finally { request("Runtime.disable");session.disconnect(); }
});

void test("actual catch-frame capture needs only the run receiver, SQL, parameters and native Error",()=>{
 const session=new Session();session.connect();let captured:unknown;let caught:unknown;let paused=false;
 function request(method:string,params:object={}):unknown {
  let done=false;let reply:unknown;const state:{error:Error|null}={error:null};
  // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Same-process inert Inspector callbacks are synchronously joined; no application is contacted.
  session.post(method,params,(error,value):void=>{done=true;state.error=error;reply=value;});assert.ok(done);if(state.error!==null) { throw state.error; }return reply;
 }
 session.on("Debugger.paused",event=>{
  paused=true;
  try { const call=event.params.callFrames[0];assert.ok(call!==undefined);captured=request("Debugger.evaluateOnCallFrame",{callFrameId:call.callFrameId,expression:SOURCE.frameExpression,returnByValue:false,throwOnSideEffect:true,silent:true}); }
  catch(error) { caught=error; }
  finally { request("Debugger.resume"); }
 });
 try {
  request("Debugger.enable");const context=bound();
  runInContext(`(function run(e,r){try{throw new Error("inert catch");}catch(a){debugger;return a;}}).call(tuple[0],tuple[1],tuple[2]);`,context);
  assert.ok(paused);assert.equal(caught,undefined);assert.ok(captured!==null&&typeof captured==="object");
  assert.equal(Reflect.get(captured,"exceptionDetails"),undefined);const result:unknown=Reflect.get(captured,"result");assert.ok(result!==null&&typeof result==="object");
  assert.equal(Reflect.get(result,"subtype"),"array");assert.equal(Reflect.get(result,"description"),"Array(4)");
 }finally { request("Debugger.disable");session.disconnect(); }
});
