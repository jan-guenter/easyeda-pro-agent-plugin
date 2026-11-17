/** Durable current/history data only. Synthetic preflight facts below never
 * issue an opaque owner proof or dispatch any native release. */
import assert from "node:assert/strict";
import { unlink, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { operationPath } from "../src/artifacts.ts";
import { CURRENT_FOOTPRINT_FORWARD_WRITER_WORKFLOW_STAGES as STAGES, currentFootprintForwardWriterWorkflowRequestSchema } from "../src/current-footprint-forward-writer-workflow-contract.ts";
import { CurrentFootprintForwardWriterWorkflowJournal, readCurrentFootprintForwardWriterWorkflowHistory } from "../src/current-footprint-forward-writer-workflow-journal.ts";
import { CurrentFootprintForwardWriterWorkflowV2Journal, assertNoUnresolvedCurrentFootprintForwardWriterCurrentWorkflows, readCurrentFootprintForwardWriterWorkflowV2History, scanCurrentFootprintForwardWriterCurrentWorkflowSummaries } from "../src/current-footprint-forward-writer-workflow-v2-journal.ts";
import { currentFootprintForwardWriterCompleteProfile, currentFootprintForwardWriterCompleteV2Profile } from "../src/current-footprint-forward-writer-complete-profile.ts";
import { CURRENT_FOOTPRINT_FORWARD_EXECUTION_CAPACITY } from "../src/current-footprint-copy-forward-capacity.ts";

type Journal=CurrentFootprintForwardWriterWorkflowJournal|CurrentFootprintForwardWriterWorkflowV2Journal;
function request(suffix:string):ReturnType<typeof currentFootprintForwardWriterWorkflowRequestSchema.parse>{return currentFootprintForwardWriterWorkflowRequestSchema.parse({operationId:`footprint-forward-flow-${suffix}`,parentOperationId:`footprint-forward-writer-${suffix}`,confirmDisposableCopy:true,acceptUnsupportedInverse:true});}
async function cleanup(journal:Journal,generation:"writer"|"saved",action:string,outcome:string,attempt=1):Promise<void>{
 await journal.append("cleanup-intent",{generation,action,attempt});
 await journal.append("cleanup-result",{generation,action,attempt,outcome,evidenceSha256:"a".repeat(64)});
}
async function unallocated(journal:Journal):Promise<void>{
 await journal.append("stage-intent",{stage:"opening"});await journal.append("failure",{stage:"opening",originalErrorRetained:true});
 for(const generation of ["writer","saved"]as const){await cleanup(journal,generation,"no-allocation","no-resource");}
 await journal.append("terminal-failure",{originalOwnersClosed:true,originalPendingJoined:true,released:true});
}
void test("current mixed scan reads immutable V1 history and current V2 publication with separate exact profiles",async()=>{
 const first=request("mixed-historical-v1"),second=request("mixed-current-v2");
 const historical=new CurrentFootprintForwardWriterWorkflowJournal(first);await historical.reserve();await unallocated(historical);
 const current=new CurrentFootprintForwardWriterWorkflowV2Journal(second);await current.reserve();
 const summaries=await scanCurrentFootprintForwardWriterCurrentWorkflowSummaries();
 assert.deepEqual(new Map(summaries.map(value=>[value.operationId,value.settled])),new Map([[first.operationId,true],[second.operationId,false]]));
 await assert.rejects(assertNoUnresolvedCurrentFootprintForwardWriterCurrentWorkflows(),/UNRESOLVED_OWNER/u);
 await assert.rejects(readCurrentFootprintForwardWriterWorkflowHistory(second.operationId));
 await assert.rejects(readCurrentFootprintForwardWriterWorkflowV2History(first.operationId));
 await unallocated(current);await assertNoUnresolvedCurrentFootprintForwardWriterCurrentWorkflows();
 const before=await readCurrentFootprintForwardWriterWorkflowHistory(first.operationId);const after=await readCurrentFootprintForwardWriterWorkflowV2History(second.operationId);
 assert.equal(before.operation.plan["profile"],"private.current-footprint-forward-writer-workflow.v1");
 assert.equal(after.operation.plan["profile"],"private.current-footprint-forward-writer-workflow.v2");
 assert.equal(after.records[0]?.schema,"easyeda-pro-control.footprint-forward-flow-record.v2");
});
void test("only the new V3 complete envelope reserves V2 journal bytes and the single precreate control",()=>{
 const historical=currentFootprintForwardWriterCompleteV2Profile();const current=currentFootprintForwardWriterCompleteProfile();
 assert.equal(historical.profile,"private.current-footprint-forward-writer-complete-birth.v2");assert.equal(current.profile,"private.current-footprint-forward-writer-complete-birth.v3");
 assert.equal(historical.stages.complete.workflow.records,1036);assert.equal(current.stages.complete.workflow.records,1040);
 assert.equal(current.output.artifactBytes-historical.output.artifactBytes,16_384);
 assert.equal(current.output.journalBytes-historical.output.journalBytes,51_200);
 assert.equal(current.output.retainedBytes-historical.output.retainedBytes,67_584);
 assert.equal(current.stages.complete.tail.controls-historical.stages.complete.tail.controls,1);
 assert.equal(current.controls.normal-historical.controls.normal,1);assert.equal(current.controls.cleanup,historical.controls.cleanup);assert.equal(current.controls.total-historical.controls.total,1);
 assert.equal(current.writerHelperStdoutBytes-historical.writerHelperStdoutBytes,CURRENT_FOOTPRINT_FORWARD_EXECUTION_CAPACITY.controls.replyHeaderBytes);
 assert.deepEqual(current.renderer,historical.renderer);assert.deepEqual(current.main,historical.main);
});
void test("synthetic complete V2 history can recover both first release failures without a primary failure record",async()=>{
 const selected=request("v2-normal-recovery");const journal=new CurrentFootprintForwardWriterWorkflowV2Journal(selected);await journal.reserve();
 const facts=Object.freeze({schema:"easyeda-pro-control.footprint-forward-release-preflight-facts.v1",failedReleaseAttempt:1,originalOwnerRetained:true,originalFailureRetained:true,originalReleaseNotDispatched:true,originalNativeActivityUnchanged:true,proofSha256:"d".repeat(64)});
 const release=async(generation:"writer"|"saved"):Promise<void>=>{
  await cleanup(journal,generation,"release","failed");const evidence={generation,action:"release",attempt:2,preDispatchProof:facts};
  await journal.append("cleanup-intent",evidence);await journal.append("cleanup-result",{...evidence,outcome:"released",evidenceSha256:"a".repeat(64)});
 };
 for(const stage of STAGES){
  if(stage==="writer-snapshot"||stage==="saved-snapshot"){
   const generation=stage==="writer-snapshot"?"writer":"saved";await cleanup(journal,generation,"close","dispatched");await cleanup(journal,generation,"termination","terminated");await cleanup(journal,generation,"observers","released");
   if(generation==="writer"){await release(generation);}
  }
  if(stage==="saved-checkpoint"){await release("saved");}
  await journal.append("stage-intent",{stage});await journal.append("stage-result",{stage,evidenceSha256:"a".repeat(64),originalCompletionObserved:true});
 }
 await journal.append("complete",{createdUuid:"1234567890abcdef",writerSqlSha256:"a".repeat(64),savedSqlSha256:"a".repeat(64),sourceReadSha256:"b".repeat(64),originalClosedReadersDistinct:true,originalOwnersReleased:true,explicitSaveAttempts:0,savedResultVerified:true,inverseAvailable:false});
 const history=await readCurrentFootprintForwardWriterWorkflowV2History(selected.operationId);assert.equal(history.operation["state"],"completed");assert.equal(history.records.some(value=>value.kind==="failure"),false);
 assert.equal(history.records.filter(value=>value.kind==="cleanup-result"&&value.evidence["action"]==="release"&&value.evidence["outcome"]==="failed").length,2);
 assert.equal(history.records.filter(value=>value.kind==="cleanup-result"&&value.evidence["attempt"]===2).length,2);await assertNoUnresolvedCurrentFootprintForwardWriterCurrentWorkflows();
});
void test("V2 retry facts retain original durable bytes across publication collision and failed attempt2 stays unresolved",async()=>{
 const selected=request("v2-release-publication");const journal=new CurrentFootprintForwardWriterWorkflowV2Journal(selected);await journal.reserve();
 await journal.append("stage-intent",{stage:"opening"});await journal.append("failure",{stage:"opening",originalErrorRetained:true});
 await cleanup(journal,"writer","abort","dispatched");await cleanup(journal,"writer","termination","terminated");await cleanup(journal,"writer","observers","released");await cleanup(journal,"writer","release","failed");
 const facts=Object.freeze({schema:"easyeda-pro-control.footprint-forward-release-preflight-facts.v1",failedReleaseAttempt:1,originalOwnerRetained:true,originalFailureRetained:true,originalReleaseNotDispatched:true,originalNativeActivityUnchanged:true,proofSha256:"d".repeat(64)});
 const evidence={generation:"writer",action:"release",attempt:2,preDispatchProof:facts};
 const collision=join(dirname(operationPath(selected.operationId)),selected.operationId,"11-cleanup-intent.json");await writeFile(collision,"isolated-publication-collision",{flag:"wx"});
 await assert.rejects(journal.append("cleanup-intent",evidence));assert.equal(journal.retained().publicationPending,true);
 await unlink(collision);await journal.waitForCurrentPublication();await journal.settle();await journal.assertCurrent();
 let history=await readCurrentFootprintForwardWriterWorkflowV2History(selected.operationId);assert.deepEqual(history.records.at(-1)?.evidence,evidence);
 assert.equal(history.records.filter(value=>value.kind==="cleanup-intent"&&value.evidence["attempt"]===2).length,1);
 await journal.append("cleanup-result",{...evidence,outcome:"failed",evidenceSha256:"a".repeat(64)});await cleanup(journal,"saved","no-allocation","no-resource");
 await assert.rejects(journal.append("terminal-failure",{originalOwnersClosed:true,originalPendingJoined:true,released:true}),/TERMINAL_FAILURE_PREDECESSOR/u);
 await assert.rejects(journal.append("cleanup-intent",{...evidence,attempt:3}));
 history=await readCurrentFootprintForwardWriterWorkflowV2History(selected.operationId);assert.equal(history.operation["state"],"prepared");
 await assert.rejects(assertNoUnresolvedCurrentFootprintForwardWriterCurrentWorkflows(),/UNRESOLVED_OWNER/u);
});
