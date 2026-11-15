/** Real durable journal/validator checks. Pure completion records below are
 * synthetic historical data; no native owner or saved design is proved. */
import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { test } from "node:test";
import { sha256Json } from "../src/core.ts";
import { CURRENT_FOOTPRINT_FORWARD_WRITER_WORKFLOW_STAGES as STAGES, currentFootprintForwardWriterWorkflowRecordSchema, currentFootprintForwardWriterWorkflowRequestSchema } from "../src/current-footprint-forward-writer-workflow-contract.ts";
import type { CurrentFootprintForwardWriterWorkflowRecord as Entry, CurrentFootprintForwardWriterWorkflowPhase as Phase } from "../src/current-footprint-forward-writer-workflow-contract.ts";
import { CurrentFootprintForwardWriterWorkflowJournal, assertCurrentFootprintForwardWriterWorkflowChain, assertNoUnresolvedCurrentFootprintForwardWriterWorkflows, readCurrentFootprintForwardWriterWorkflowHistory, scanCurrentFootprintForwardWriterWorkflowSummaries } from "../src/current-footprint-forward-writer-workflow-journal.ts";

function request(suffix = "chain"):ReturnType<typeof currentFootprintForwardWriterWorkflowRequestSchema.parse>{
 return currentFootprintForwardWriterWorkflowRequestSchema.parse({operationId:`footprint-forward-flow-${suffix}`,parentOperationId:`footprint-forward-writer-${suffix}`,confirmDisposableCopy:true,acceptUnsupportedInverse:true});
}
function append(records:Entry[],kind:Phase,evidence:Readonly<Record<string,unknown>>):void{
 const previous=records.at(-1);
 const entry=currentFootprintForwardWriterWorkflowRecordSchema.parse({schema:"easyeda-pro-control.footprint-forward-flow-record.v1",operationId:request().operationId,sequence:records.length,previousSha256:records.length===0?null:sha256Json(previous),kind,evidence,executionAuthorized:false,saveAuthorized:false});records.push(entry);
}
function cleanup(records:Entry[],generation:"writer"|"saved",action:string,outcome:string,attempt=1):void{
 append(records,"cleanup-intent",{generation,action,attempt});append(records,"cleanup-result",{generation,action,attempt,outcome,evidenceSha256:"a".repeat(64)});
}
function successful():Entry[]{
 const records:Entry[]=[];append(records,"operation-intent",{request:request()});
 for(const stage of STAGES){
  if(stage==="writer-snapshot"||stage==="saved-snapshot"){
   const generation=stage==="writer-snapshot"?"writer":"saved";cleanup(records,generation,"close","dispatched");cleanup(records,generation,"termination","pending");cleanup(records,generation,"termination","terminated",2);cleanup(records,generation,"observers","released");
  }
  if(stage==="saved-allocation"){cleanup(records,"writer","release","released");}
  if(stage==="saved-checkpoint"){cleanup(records,"saved","release","released");}
  append(records,"stage-intent",{stage});append(records,"stage-result",{stage,evidenceSha256:"a".repeat(64),originalCompletionObserved:true});
 }
 append(records,"complete",{createdUuid:"1234567890abcdef",writerSqlSha256:"a".repeat(64),savedSqlSha256:"a".repeat(64),sourceReadSha256:"b".repeat(64),originalClosedReadersDistinct:true,originalOwnersReleased:true,explicitSaveAttempts:0,savedResultVerified:true,inverseAvailable:false});return records;
}
void test("full workflow history requires actual phase order, distinct closure stages and complete SQL equality",()=>{
 const records=successful();assertCurrentFootprintForwardWriterWorkflowChain(records);
 const badSql=structuredClone(records);const last=badSql.at(-1);assert.ok(last);last.evidence["savedSqlSha256"]="c".repeat(64);assert.throws(()=>{assertCurrentFootprintForwardWriterWorkflowChain(badSql);},/COMPLETE_PREDECESSOR/u);
 const premature:Entry[]=[];append(premature,"operation-intent",{request:request()});append(premature,"stage-intent",{stage:"metadata"});assert.throws(()=>{assertCurrentFootprintForwardWriterWorkflowChain(premature);},/NORMAL_PREDECESSOR/u);
 assert.throws(()=>currentFootprintForwardWriterWorkflowRequestSchema.parse({...request(),parentOperationId:"footprint-forward-writer-foreign"}));
 assert.throws(()=>currentFootprintForwardWriterWorkflowRecordSchema.parse({...records[0],evidence:{request:request(),nativeOwner:{}}}));
});
void test("failure retains original pending stage, forbids normal replay and needs both resource closures",()=>{
 const records:Entry[]=[];append(records,"operation-intent",{request:request()});append(records,"stage-intent",{stage:"opening"});append(records,"failure",{stage:"opening",originalErrorRetained:true});
 const replay=structuredClone(records);append(replay,"stage-result",{stage:"opening",evidenceSha256:"a".repeat(64),originalCompletionObserved:true});assert.throws(()=>{assertCurrentFootprintForwardWriterWorkflowChain(replay);},/ORIGINAL_STAGE_RESULT/u);
 cleanup(records,"writer","no-allocation","no-resource");const premature=structuredClone(records);append(premature,"terminal-failure",{originalOwnersClosed:true,originalPendingJoined:true,released:true});assert.throws(()=>{assertCurrentFootprintForwardWriterWorkflowChain(premature);},/TERMINAL_FAILURE_PREDECESSOR/u);
 cleanup(records,"saved","no-allocation","no-resource");append(records,"terminal-failure",{originalOwnersClosed:true,originalPendingJoined:true,released:true});assertCurrentFootprintForwardWriterWorkflowChain(records);
 assert.throws(()=>currentFootprintForwardWriterWorkflowRecordSchema.parse({...records[1],kind:"cleanup-intent",evidence:{generation:"writer",action:"abort",attempt:2}}));
});
void test("managed workflow publication blocks until original terminal facts and rejects artifact tampering",async()=>{
 const selected=request("publication");const journal=new CurrentFootprintForwardWriterWorkflowJournal(selected);await journal.reserve();await journal.assertCurrent();
 assert.deepEqual(await scanCurrentFootprintForwardWriterWorkflowSummaries(),[{operationId:selected.operationId,settled:false}]);await assert.rejects(assertNoUnresolvedCurrentFootprintForwardWriterWorkflows(),/UNRESOLVED_OWNER/u);
 await journal.append("stage-intent",{stage:"opening"});await journal.append("failure",{stage:"opening",originalErrorRetained:true});
 for(const generation of["writer","saved"]as const){await journal.append("cleanup-intent",{generation,action:"no-allocation",attempt:1});await journal.append("cleanup-result",{generation,action:"no-allocation",attempt:1,outcome:"no-resource",evidenceSha256:"a".repeat(64)});}
 await journal.append("terminal-failure",{originalOwnersClosed:true,originalPendingJoined:true,released:true});await journal.waitForCurrentPublication();await journal.settle();await assertNoUnresolvedCurrentFootprintForwardWriterWorkflows();
 const history=await readCurrentFootprintForwardWriterWorkflowHistory(selected.operationId);assert.equal(history.operation["state"],"completed");assert.equal(journal.retained().publicationPending,false);await assert.rejects(journal.reserve(),/RESERVATION_CONSUMED/u);
 const artifact=history.operation.artifacts?.[0];assert.ok(artifact);await writeFile(artifact.path,"corrupt isolated test artifact");await assert.rejects(journal.assertCurrent());
});
