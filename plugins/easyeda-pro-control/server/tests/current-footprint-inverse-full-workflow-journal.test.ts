/** Real isolated durable publication; records below are data, never live owners. */
import assert from "node:assert/strict";
import {unlink,writeFile} from "node:fs/promises";
import {dirname,join} from "node:path";
import {test} from "node:test";
import {sha256Json} from "../src/core.ts";
import {operationPath} from "../src/artifacts.ts";
import {CURRENT_FOOTPRINT_INVERSE_FULL_WORKFLOW_BUDGET as BUDGET,assertCurrentFootprintInverseFullWorkflowChain as assertChain,currentFootprintInverseFullWorkflowRecordSchema,currentFootprintInverseFullWorkflowRequestSchema} from "../src/current-footprint-inverse-full-workflow-contract.ts";
import type {CurrentFootprintInverseFullWorkflowRecord as Entry} from "../src/current-footprint-inverse-full-workflow-contract.ts";
import {CurrentFootprintInverseFullWorkflowJournal as Journal,readCurrentFootprintInverseFullWorkflowHistory as read,scanCurrentFootprintInverseFullWorkflowSummaries as scan} from "../src/current-footprint-inverse-full-workflow-journal.ts";

function request(suffix:string):ReturnType<typeof currentFootprintInverseFullWorkflowRequestSchema.parse>{return currentFootprintInverseFullWorkflowRequestSchema.parse({
 operationId:`footprint-inverse-flow-${suffix}`,sourceOperationId:`footprint-forward-flow-${suffix}`,
 confirmDisposableCopiedFootprintDelete:true,confirmDeleteTriggeredPersistence:true,confirmNoExplicitSave:true,
 acceptExistingProfileEffects:true,acceptNormalOpenEffects:true,acceptDebuggerPauseEffects:true,acceptCacheInvalidationEffects:true,
 acceptManagerOnlyColdAbsence:true,acceptUnsupportedNativeUiTaskAbsence:true,
});}
void test("strict consent refuses mismatched original operation and caller dispatch data",()=>{
 const valid=request("strict");assert.throws(()=>currentFootprintInverseFullWorkflowRequestSchema.parse({...valid,sourceOperationId:"footprint-forward-flow-another"}));
 assert.throws(()=>currentFootprintInverseFullWorkflowRequestSchema.parse({...valid,program:"caller"}));
 assert.throws(()=>currentFootprintInverseFullWorkflowRequestSchema.parse({...valid,confirmDeleteTriggeredPersistence:false}));
 assert.equal(BUDGET.records,12);assert.equal(BUDGET.records*BUDGET.recordBytes,49_152);
});
void test("real inverse journal retains exact interrupted bytes and terminal cleanup requires its original durable intent",async()=>{
 const input=request("retained-publication");const journal=new Journal(input);await journal.reserve();await journal.append("stage-intent",{stage:"preparation"});
 await assert.rejects(journal.append("cleanup-result",{originalOwnersClosed:true,originalPendingJoined:true,released:true}));
 await journal.append("failure",{stage:"preparation",originalErrorRetained:true});
 const path=join(dirname(operationPath(input.operationId)),input.operationId,"03-cleanup-intent.json");
 await writeFile(path,"isolated-collision",{flag:"wx"});
 await assert.rejects(journal.append("cleanup-intent",{confirmOriginalJobsOnly:true,normalWorkStopped:true}));
 assert.equal(journal.retained().publicationPending,true);await assert.rejects(journal.append("stage-result",{stage:"preparation",originalCompletionObserved:true,evidenceSha256:"a".repeat(64)}));
 await unlink(path);await journal.waitForCurrentPublication();await journal.settle();await journal.assertCurrent();
 const before=await read(input.operationId);assert.equal(before.records.at(-1)?.kind,"cleanup-intent");
 await journal.append("cleanup-result",{originalOwnersClosed:true,originalPendingJoined:true,released:true});
 await journal.append("terminal-failure",{originalOwnersClosed:true,originalPendingJoined:true,released:true});
 const after=await read(input.operationId);assert.equal(after.operation["state"],"completed");assert.equal(after.records.filter(row=>row.kind==="cleanup-intent").length,1);
 await assert.rejects(journal.append("stage-intent",{stage:"opening"}));const summaries=await scan();assert.equal(summaries.find(row=>row.operationId===input.operationId)?.settled,true);
});
void test("real scanner refuses a completed manifest whose original record artifact changed",async()=>{
 const input=request("artifact-drift"),journal=new Journal(input);await journal.reserve();
 await journal.append("failure",{stage:"preparation",originalErrorRetained:true});
 await journal.append("cleanup-intent",{confirmOriginalJobsOnly:true,normalWorkStopped:true});
 await journal.append("cleanup-result",{originalOwnersClosed:true,originalPendingJoined:true,released:true});
 await journal.append("terminal-failure",{originalOwnersClosed:true,originalPendingJoined:true,released:true});
 const path=join(dirname(operationPath(input.operationId)),input.operationId,"00-operation-intent.json");
 await writeFile(path,"altered-isolated-record");await assert.rejects(journal.assertCurrent());await assert.rejects(read(input.operationId));await assert.rejects(scan());
});

void test("direct chain rejects another active failure stage and cleanup preceding failure while retaining idle publication boundaries",()=>{
 const input=request("direct-chain");const initial:Readonly<{kind:Entry["kind"];evidence:Readonly<Record<string,unknown>>}>={kind:"operation-intent",evidence:{request:input}};
 const make=(parts:readonly Readonly<{kind:Entry["kind"];evidence:Readonly<Record<string,unknown>>}>[]):readonly Entry[]=>{
  const records:Entry[]=[];for(const [index,part]of [initial,...parts].entries()){records.push(currentFootprintInverseFullWorkflowRecordSchema.parse({
   schema:"easyeda-pro-control.footprint-inverse-flow-record.v1",operationId:input.operationId,sequence:index,
   previousSha256:index===0?null:sha256Json(records[index-1]),kind:part.kind,evidence:part.evidence,executionAuthorized:false,saveAuthorized:false,
  }));}return records;
 };
 const preparation={kind:"stage-intent",evidence:{stage:"preparation"}}as const;
 const cleanupIntent={kind:"cleanup-intent",evidence:{confirmOriginalJobsOnly:true,normalWorkStopped:true}}as const;
 const cleanupResult={kind:"cleanup-result",evidence:{originalOwnersClosed:true,originalPendingJoined:true,released:true}}as const;
 const terminal={kind:"terminal-failure",evidence:{originalOwnersClosed:true,originalPendingJoined:true,released:true}}as const;
 assert.throws(()=>{assertChain(make([preparation,{kind:"failure",evidence:{stage:"delete-persistence-cold",originalErrorRetained:true}},cleanupIntent,cleanupResult,terminal]));},/FAILURE_STAGE/u);
 assert.throws(()=>{assertChain(make([preparation,cleanupIntent,cleanupResult,{kind:"failure",evidence:{stage:"preparation",originalErrorRetained:true}},terminal]));},/FAILURE_BEFORE_CLEANUP/u);
 for(const stage of ["preparation","opening"]as const){
  assert.doesNotThrow(()=>{assertChain(make([preparation,{kind:"stage-result",evidence:{stage:"preparation",originalCompletionObserved:true,evidenceSha256:"a".repeat(64)}},{kind:"failure",evidence:{stage,originalErrorRetained:true}},cleanupIntent,cleanupResult,terminal]));});
 }
 assert.throws(()=>{assertChain(make([preparation,{kind:"stage-result",evidence:{stage:"preparation",originalCompletionObserved:true,evidenceSha256:"a".repeat(64)}},{kind:"failure",evidence:{stage:"delete-persistence-cold",originalErrorRetained:true}},cleanupIntent,cleanupResult,terminal]));},/FAILURE_STAGE/u);
});
