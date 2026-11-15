/** Pinned parser on complete inert histories, not a native-owner receipt. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { sha256Text } from "../src/core.ts";
import { captureCurrentFootprintSavedFlowCacheInput, deriveCurrentFootprintSavedFlowCacheData } from "../src/current-footprint-saved-flow-cache-data.ts";
import { deriveCurrentFootprintForwardWriterLiveHistoryCacheData } from "../src/current-footprint-forward-writer-live-history-cache-data.ts";

function record(header:unknown,body:unknown):string{return`${JSON.stringify(header)}||${JSON.stringify(body)}`}
function fixture():Parameters<typeof deriveCurrentFootprintForwardWriterLiveHistoryCacheData>[0]{
 const projectUuid="a".repeat(64);const branchUuid="b".repeat(32);const oldUuid="c".repeat(32);const newUuid="d".repeat(32);const destination="e".repeat(16);const actor={uuid:"f".repeat(32),username:"synthetic",nickname:"Quoted \"name\"",updateTime:101};
 const row={id:1,uuid:oldUuid,parent:null,key:"1".repeat(32),is_lock:1,num:0,snapshot_num:0,created_at:"2026-11-14 10:00:00",updated_at:"2026-11-14 10:00:00",lock_time:"1970-01-01 08:00:00"};
 const oldPlain=[record({type:"EDIT_HEAD"},{...actor,updateTime:1}),record({type:"DOCHEAD",ticket:1},{uuid:"2".repeat(16),docType:"FOOTPRINT",client:"3".repeat(16),updateTime:1,version:"1",editVersion:"3.0"}),record({type:"META",ticket:1,id:"META"},{title:"Source"})].join("|\n");
 const initialInput=captureCurrentFootprintSavedFlowCacheInput({projectUuid,branchUuid,headHistoryUuid:oldUuid,heads:[row],chunks:[{historyUuid:oldUuid,ordinal:0,plaintext:oldPlain,plaintextSha256:sha256Text(oldPlain)}]});
 const body=[record({type:"DOCHEAD",ticket:11},{uuid:destination,docType:"FOOTPRINT",client:destination,updateTime:100,version:"100",editVersion:"3.0"}),record({type:"META",ticket:11,id:"META"},{title:"Copy"}),record({type:"DOCHEAD",ticket:12},{uuid:destination,docType:"FOOTPRINT",client:destination,updateTime:101,version:"101",editVersion:"3.0"}),record({type:"CIRCLE",ticket:12,id:"shape"},{x:0,y:0,r:1})].join("|\n");
 const branch={uuid:branchUuid,delete_status:0,name:"disposable",project_uuid:projectUuid,branch_uuid:branchUuid,history_uuid:oldUuid,description:"",node:false,created_at:"2026-11-14 11:00:00",updated_at:"2026-11-14 11:00:00",parent_uuid:null,parent_name:null,creator_nickname:null,creator_uuid:null,modifier_nickname:null,default:true,project_histories_id:1};const beforeBody=JSON.stringify(branch),postBody=JSON.stringify({...branch,history_uuid:newUuid,project_histories_id:37});
 const common={projectUuid,branchUuid,observedLocalOffsetMinutes:60,writerClockAuthority:false as const};
 return{initialInput,initialFlow:deriveCurrentFootprintSavedFlowCacheData(initialInput),beforeBranch:{...common,historyUuid:oldUuid,body:beforeBody,sha256:sha256Text(beforeBody)},postBranch:{...common,historyUuid:newUuid,body:postBody,sha256:sha256Text(postBody)},actor,body,nativeRows:{projectUuid,branchUuid,historyUuid:newUuid,rows:[{...row,id:37,uuid:newUuid,parent:oldUuid,key:"4".repeat(32),is_lock:0,created_at:"2026-11-14 10:01:00",updated_at:"2026-11-14 10:01:00",iv:newUuid},{...row,iv:oldUuid}]}};
}
void test("full copy live cache preserves two headers, old peer fields and native head id gaps",()=>{
 const input=fixture(),result=deriveCurrentFootprintForwardWriterLiveHistoryCacheData(input);assert.equal(result.documents.length,1);assert.equal(result.documents[0]?.body,input.body);assert.equal(result.historyBodySha256,sha256Text(input.body));assert.equal(result.mode,"append");assert.equal(result.nativeWorkerOwnershipVerified,false);assert.equal(result.completeUploadFrontierVerified,false);
 assert.ok(result.headIndex.body.includes('"id":37'));assert.ok(result.headIndex.body.includes('"docs":'));assert.ok(Object.isFrozen(result));
 for(const changed of [{...input,body:input.body.replace('"FOOTPRINT"','"SYMBOL"')},{...input,postBranch:{...input.postBranch,sha256:"0".repeat(64)}},{...input,body:input.body+"x".repeat(8192)}]){assert.throws(()=>deriveCurrentFootprintForwardWriterLiveHistoryCacheData(changed))}
});

void test("live cache uses the comparator's original branch offset",()=>{
 const input=fixture();const changed={...input,postBranch:{...input.postBranch,observedLocalOffsetMinutes:120}};
 const result=deriveCurrentFootprintForwardWriterLiveHistoryCacheData(changed);
 assert.equal(result.branch.importLocalOffsetMinutes,60);
});
