/** Inert pinned parser and original data-issuer seams only. No original
 * application, native owner, bootstrap resume or queue completion is issued. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { sha256Text } from "../src/core.ts";
import { deriveCurrentFootprintInverseStartupData } from "../src/current-footprint-inverse-startup-data.ts";
import { prepareCurrentFootprintInverseStartupPlan } from "../src/current-footprint-inverse-startup-plan.ts";
import { captureCurrentFootprintSavedFlowCacheInput, deriveCurrentFootprintSavedFlowCacheData } from "../src/current-footprint-saved-flow-cache-data.ts";

const branchUuid="b".repeat(32),copy="d".repeat(32),first="c".repeat(16),head="2".repeat(32),oldHead="1".repeat(32),projectUuid="a".repeat(64);
const line=(type:string,body:unknown,extra:object={}):string=>`${JSON.stringify({type,...extra})}||${JSON.stringify(body)}`;
function input():ReturnType<typeof captureCurrentFootprintSavedFlowCacheInput>{
  const rows=[{id:2,uuid:head,parent:oldHead,key:"3".repeat(32),is_lock:1,num:0,snapshot_num:0,created_at:null,updated_at:null,lock_time:null},{id:1,uuid:oldHead,parent:null,key:"3".repeat(32),is_lock:1,num:1,snapshot_num:0,created_at:null,updated_at:null,lock_time:null}];
  const values=[[line("DOCHEAD",{uuid:first,docType:"FOOTPRINT",client:"native"},{ticket:1}),line("META",{title:"Original"},{id:"META",ticket:2})],[line("DOCHEAD",{uuid:first,docType:"FOOTPRINT",client:"native"},{ticket:1}),line("META",{title:"Original later"},{id:"META",ticket:3})],[line("DOCHEAD",{uuid:copy,docType:"FOOTPRINT",client:"native"},{ticket:4}),line("META",{title:"Copy"},{id:"META",ticket:5})]];
  const chunks=values.map((records,index)=>{const plaintext=`${line("EDIT_HEAD",{uuid:"actor"})}|\n${records.join("|\n")}|\n`;return{historyUuid:index===2?head:oldHead,ordinal:index===1?1:0,plaintext,plaintextSha256:sha256Text(plaintext)};});
  return captureCurrentFootprintSavedFlowCacheInput({projectUuid,branchUuid,headHistoryUuid:head,heads:rows,chunks});
}
void test("complete raw source bounds count stale rows and retains distinct sixteen/thirty-two-character footprint documents",()=>{
  const data=deriveCurrentFootprintInverseStartupData(input());assert.equal(data.sourceRecordUpperBound,3);assert.equal(data.rawDocumentHeaders,3);assert.deepEqual(data.documentUuids,[first,copy]);assert.equal(data.chunkCount,3);
  assert.equal(data.suppliedObservationsOnly,true);assert.equal(data.originalNativeCallbackQualified,false);assert.equal(data.originalQueuedPromisesCompleted,false);assert.equal(data.bootstrapResumeAuthorized,false);
  for(const family of ["SYMBOL","PCB","BOARD","CONFIG"]){
    const base=input(),peer="e".repeat(32);const chunk=base.chunks[0];assert.ok(chunk!==undefined);
    const plaintext=`${chunk.plaintext}${line("DOCHEAD",{uuid:peer,docType:family,client:"native"},{ticket:10})}|\n${line("META",{title:"Baseline peer"},{id:"META",ticket:11})}|\n`;
    const mixed={...base,chunks:[{...chunk,plaintext,plaintextSha256:sha256Text(plaintext)},...base.chunks.slice(1)]};
    assert.doesNotThrow(()=>deriveCurrentFootprintSavedFlowCacheData(mixed));const full=deriveCurrentFootprintInverseStartupData(mixed);assert.equal(full.sourceRecordUpperBound,4);assert.equal(full.allDocumentTypesFootprint,false);assert.equal(full.nonFootprintRawRows,1);assert.deepEqual(full.documentUuids,[first,peer,copy]);assert.deepEqual(full.nonFootprintDocumentUuids,[peer]);assert.deepEqual(full.documentFamilies,[{uuid:first,families:[{docType:"FOOTPRINT",rawRows:2}]},{uuid:peer,families:[{docType:family,rawRows:1}]},{uuid:copy,families:[{docType:"FOOTPRINT",rawRows:1}]}]);
  }
});
void test("source counter refuses a513-row profile within otherwise supported grouped cache bounds and never evaluates accessors",()=>{
  const base=input(),chunks=Array.from({length:3},(_,ordinal)=>{const records=Array.from({length:171},(_record,index)=>line("ATTR",{},{id:`r${String(ordinal*171+index)}`,ticket:ordinal*171+index+1}));const plaintext=`${line("EDIT_HEAD",{uuid:"actor"})}|\n${line("DOCHEAD",{uuid:first,docType:"FOOTPRINT",client:"native"},{ticket:1})}|\n${records.join("|\n")}|\n`;return{historyUuid:oldHead,ordinal,plaintext,plaintextSha256:sha256Text(plaintext)};});
  const source={...base,headHistoryUuid:oldHead,heads:[{...base.heads[1],num:2}],chunks};assert.doesNotThrow(()=>deriveCurrentFootprintSavedFlowCacheData(source));assert.throws(()=>deriveCurrentFootprintInverseStartupData(source),/STARTUP_SOURCE_DOMAIN/u);
  let called=false;assert.throws(()=>deriveCurrentFootprintInverseStartupData(Object.defineProperty({},"chunks",{get(){called=true;return[];}})));assert.equal(called,false);
});
void test("copied data checkpoint and flow labels cannot issue a startup token",()=>{
  assert.throws(()=>prepareCurrentFootprintInverseStartupPlan(Object.freeze({profile:"private.current-footprint-saved-flow-cache-plan.v1"}),Object.freeze({profile:"private.current-footprint-forward-saved-checkpoint.v1"})),/FOOTPRINT_SAVED_FLOW_CACHE_PLAN/u);
});
void test("actual startup issuer retains one data Promise and exact raw-input references across original source verification",async()=>{
  for(const drift of [false,true]){
    const source=input();const data=deriveCurrentFootprintSavedFlowCacheData(source),flow=Object.freeze({syntheticFlow:true}),prepared=Object.freeze({syntheticPrepared:true}),prior=Object.freeze({inventory:Object.freeze({}),projection:Object.freeze({})});let checks=0;
    const url=new URL("../src/current-footprint-inverse-startup-plan.ts",import.meta.url);const sourceRequire=createRequire(url);const compiled=await transform(await readFile(url,"utf8"),{loader:"ts",format:"cjs",target:"node24"});
    const loaded:{exports:Record<string,unknown>}={exports:{}};const evaluate:unknown=runInThisContext(`(function(require,module,exports){${compiled.code}\n})`);assert.ok(typeof evaluate==="function");
    Reflect.apply(evaluate,undefined,[(name:string):unknown=>{
      if(name==="./current-footprint-inverse-cold-load-data.ts"){return{deriveCurrentFootprintInverseColdLoadData:(i:unknown,c:unknown,v:unknown):object=>{assert.equal(i,source);assert.equal(c,data);assert.equal(v,prior.inventory);return Object.freeze({syntheticColdDataOnly:true});}};}
      if(name==="./current-footprint-saved-flow-cache-plan.ts"){return{requireOriginalCurrentFootprintSavedFlowCachePlan:(f:unknown,p:unknown):object=>{assert.equal(f,flow);assert.equal(p,prepared);return data;},requireOriginalCurrentFootprintSavedFlowCacheInput:(f:unknown,p:unknown):object=>{assert.equal(f,flow);assert.equal(p,prepared);return drift&&checks>0?structuredClone(source):source;}};}
      if(name==="./current-footprint-copy-held-saved-generation.ts"){return{requireOriginalCurrentFootprintForwardSavedCheckpoint:(p:unknown):object=>{assert.equal(p,prepared);return prior;},verifyCurrentFootprintForwardSavedCheckpoint:async(p:unknown):Promise<void>=>{assert.equal(p,prepared);checks+=1;await Promise.resolve();}};}
      if(name==="./current-footprint-copy-v2-saved-source.ts"){return{currentFootprintCopyV2SavedTarget:(p:unknown):object=>{assert.equal(p,prior.projection);return{projectUuid,branchUuid,footprintUuid:copy};}};}
      return sourceRequire(name) as unknown;
    },loaded,loaded.exports]);
    const lookup=loaded.exports["requireOriginalCurrentFootprintInverseStartupPlan"],prepare=loaded.exports["prepareCurrentFootprintInverseStartupPlan"];assert.ok(typeof prepare==="function"&&typeof lookup==="function");
    const pending:unknown=Reflect.apply(prepare,undefined,[flow,prepared]);assert.ok(pending instanceof Promise);assert.equal(Reflect.apply(prepare,undefined,[flow,prepared]),pending);
    if(drift){await assert.rejects(pending,/STARTUP_ORIGINAL/u);assert.equal(checks,1);}else{const token:unknown=await pending;assert.equal(checks,2);const actual:unknown=Reflect.apply(lookup,undefined,[token,flow,prepared]);assert.deepEqual(actual,deriveCurrentFootprintInverseStartupData(source));assert.throws(()=>Reflect.apply(lookup,undefined,[structuredClone(token),flow,prepared]),/STARTUP_ORIGINAL/u);}
  }
});
