/** Actual fixed ready proofs on inert same-realm project/serial objects.
 * No SDK method, callback or native process is invoked. */
import assert from "node:assert/strict";
import {test} from "node:test";
import {runInNewContext} from "node:vm";
import {CURRENT_FOOTPRINT_FORWARD_WRITER_PUBLICATION_CALLS as READY,validateCurrentFootprintForwardWriterPublicationCommand} from "../src/current-footprint-forward-writer-publication-protocol.ts";
import {CURRENT_PROJECT_SAVE_STRUCTURE_CALLS as STARTUP} from "../src/current-project-save-structure-programs.ts";
import {currentFootprintForwardWriterFrontierCases} from "../src/current-footprint-forward-writer-frontier-protocol.ts";

void test("ready proof joins original project/serial arguments while startup proof remains false-only",()=>{
 const prefix=`let invoked=0;const project={isReady:true};globalThis.PROJECT=project;const callback=()=>{invoked++},t=Promise.resolve(),s=null,args=["doc","id","data"],caller=[callback,t,s,args],scope={object:{e:callback,t,s,r:args}},entry=[project,...args],returned=[...entry],finalizer=[t,s,callback];`;
 for(const role of ["startupEntry","startupReturn","startupFinalizer"] as const){
  const call={startupEntry:"fn.call(entry,project,callback,caller,scope)",startupReturn:"fn.call(returned,entry,project)",startupFinalizer:"fn.call(finalizer,project,callback,scope)"}[role];
  const result:unknown=runInNewContext(`${prefix}const fn=(${READY[role]});const result=${call};[result,invoked]`,{});
  assert.equal(JSON.stringify(result),"[true,0]");
  assert.throws(()=>runInNewContext(`${prefix}project.isReady=false;const fn=(${READY[role]});${call}`,{}));
  assert.throws(()=>runInNewContext(`${prefix}let getterCalls=0;Object.defineProperty(project,"isReady",{get(){getterCalls++;return true}});const fn=(${READY[role]});${call}`,{}));
  if(role!=="startupFinalizer"){assert.throws(()=>runInNewContext(`${prefix}const fn=(${STARTUP[role]});${call}`,{}));}
 }
});
void test("publication syntax rejects old startup proof, arms, timers and supplied methods",()=>{
 const rows=currentFootprintForwardWriterFrontierCases();
 for(const row of rows){
  if(row.lane==="timer"||row.command.method==="Debugger.setBreakpoint"||row.command.method==="Debugger.removeBreakpoint"){
   assert.throws(()=>validateCurrentFootprintForwardWriterPublicationCommand({...row,phase:"forward-copy-publication"}));
  }
  if(row.command.phase==="project-save-structure-startupEntry"){
   assert.throws(()=>validateCurrentFootprintForwardWriterPublicationCommand({...row,phase:"forward-copy-publication"}));
   const value={...row,phase:"forward-copy-publication",command:{...row.command,params:{...row.command.params,functionDeclaration:READY.startupEntry}}};
   assert.equal(validateCurrentFootprintForwardWriterPublicationCommand(value).lane,"callback");
   assert.throws(()=>validateCurrentFootprintForwardWriterPublicationCommand({...value,command:{...value.command,params:{...value.command.params,functionDeclaration:`${READY.startupEntry} `}}}));
  }
 }
});
