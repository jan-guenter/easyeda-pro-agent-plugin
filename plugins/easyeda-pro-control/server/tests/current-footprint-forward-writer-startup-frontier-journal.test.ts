/** Actual isolated managed publications and data-only complete bound checks.
 * No native owner, parent process, callback execution or Job exit is supplied. */
import assert from "node:assert/strict";
import {dirname,join} from "node:path";
import {readFile,unlink,writeFile} from "node:fs/promises";
import {test} from "node:test";
import {loadOperation,operationPath} from "../src/artifacts.ts";
import {sha256Json} from "../src/core.ts";
import {assertNoUnresolvedCurrentPcbDiagnosticLaunches as globalLaunches} from "../src/current-pcb-diagnostic-lifecycle-journal.ts";
import {CURRENT_FOOTPRINT_FORWARD_WRITER_STARTUP_FRONTIER_BUDGET as BUDGET,currentFootprintForwardWriterStartupFrontierRecordSchema as record,currentFootprintForwardWriterStartupFrontierRequestSchema as request} from "../src/current-footprint-forward-writer-startup-frontier-contract.ts";
import type {CurrentFootprintForwardWriterStartupFrontierRecord as Entry,CurrentFootprintForwardWriterStartupFrontierPhase as Phase} from "../src/current-footprint-forward-writer-startup-frontier-contract.ts";
import {CurrentFootprintForwardWriterStartupFrontierJournal as Journal,assertCurrentFootprintForwardWriterStartupFrontierChain as chain,readCurrentFootprintForwardWriterStartupFrontierHistory as history,assertNoUnresolvedCurrentFootprintForwardWriterStartupFrontiers as isolated} from "../src/current-footprint-forward-writer-startup-frontier-journal.ts";

function input(suffix:string):ReturnType<typeof request.parse>{return request.parse({operationId:`footprint-forward-frontier-${suffix}`,parentOperationId:`footprint-forward-writer-${suffix}`,acceptOriginalProjectTimerCancellation:true});}
const setup=Object.freeze({sourceRecords:512,sourceSha256:"0".repeat(64),inputSha256:"1".repeat(64)});
const configured=Object.freeze({callbackPoints:4,timerPoints:2,timerSetupRequests:17});
const released=Object.freeze({originalParentJobExitObserved:true,originalPendingCallbacksJoined:true,released:true});
void test("only original pending component bytes settle after real publication failure; equal requests cannot adopt",async()=>{
 const selected=input("publication-original");const journal=new Journal(selected);const copied=new Journal(selected);
 await journal.reserve();await journal.assertCurrent();assert.equal(journal.reservationOutcome(),"reserved");
 await assert.rejects(copied.reserve());assert.equal(copied.reservationOutcome(),"not-entered");await assert.rejects(copied.settle(),/ORIGINAL_RESERVATION/u);
 await assert.rejects(isolated(),/UNRESOLVED_OWNER/u);await assert.rejects(globalLaunches(),/UNRESOLVED_OWNER/u);
 const blocker=join(dirname(operationPath(selected.operationId)),selected.operationId,"01-setup-intent.json");
 await writeFile(blocker,"foreign isolated fixture\n",{flag:"wx",mode:0o600});
 await assert.rejects(journal.append("setup-intent",setup));assert.equal(journal.retained().publicationPending,true);assert.equal(journal.retained().records.length,1);
 await journal.waitForCurrentPublication();await assert.rejects(journal.append("setup-result",configured),/PUBLICATION_PENDING/u);
 const before=await loadOperation(selected.operationId);assert.ok(Array.isArray(before["records"]));assert.equal(before["records"].length,1);
 // Remove only this test's exact own blocker; the journal itself never replaces a conflicting artifact.
 await unlink(blocker);await journal.settle();await journal.assertCurrent();
 assert.equal(journal.retained().publicationPending,false);const rows=journal.retained().records;assert.equal(rows.length,2);assert.deepEqual(rows[1]?.evidence,setup);
 const stored:unknown=JSON.parse(await readFile(blocker,"utf8"));assert.deepEqual(stored,rows[1]);
 let getterCalls=0;const hostile={get callbackPoints():number{getterCalls+=1;return 4;},timerPoints:2,timerSetupRequests:17};
 await assert.rejects(journal.append("setup-result",hostile));assert.equal(getterCalls,0);
 await journal.append("setup-result",configured);await journal.append("failure",{phase:"callback",originalErrorRetained:true});
 await assert.rejects(journal.append("queue-intent",{}),/NORMAL_ENDED/u);
 await journal.append("release-intent",{});await assert.rejects(journal.append("release-result",{...released,originalParentJobExitObserved:false}));
 await journal.append("release-result",released);await isolated();await globalLaunches();const completed=await history(selected.operationId);assert.equal(completed.operation["state"],"completed");
 await assert.rejects(journal.append("failure",{phase:"frontier",originalErrorRetained:true}),/CHAIN_IDENTITY/u);
});
function capacity(calls:number,bound:number):Entry[]{
 const selected=input("capacity-historical");const out:Entry[]=[];let ordinal=0;
 const add=(kind:Phase,evidence:Readonly<Record<string,unknown>>):void=>{const prior=out.at(-1);out.push(record.parse({schema:"easyeda-pro-control.footprint-forward-writer-startup-frontier-record.v1",operationId:selected.operationId,sequence:out.length,previousSha256:prior===undefined?null:sha256Json(prior),kind,evidence,executionAuthorized:false,saveAuthorized:false}));};
 const hold=(role:"startupEntry"|"startupReturn"|"initialFinally"|"queuedFinally",commands:8|4|6):void=>{ordinal+=1;add("callback-intent",{ordinal,role});if(ordinal===1){add("timer-intent",{ordinal:1,role:"entry"});add("timer-result",{ordinal:1,role:"entry",originalResumed:true,commands:5,cancelled:false});}add("callback-result",{ordinal,role,originalResumed:true,commands});};
 add("operation-intent",{request:selected});add("setup-intent",{...setup,sourceRecords:bound});add("setup-result",configured);
 for(let at=0;at<calls;at+=1){hold("startupEntry",8);hold("startupReturn",4);}
 add("timer-intent",{ordinal:2,role:"returned"});add("timer-result",{ordinal:2,role:"returned",originalResumed:true,commands:6,cancelled:true});
 for(let at=0;at<calls;at+=1){hold(at===0?"initialFinally":"queuedFinally",6);}
 add("queue-intent",{});add("queue-result",{calls,finalizers:calls,fulfilledPromiseReferences:2*calls,originalSerialSlotsNull:true,originalOpeningCompleted:true});
 add("frontier-result",{startupComplete:true,executionAuthorized:false,completeProducerFrontierVerified:false});
 add("failure",{phase:"frontier",originalErrorRetained:true});add("release-intent",{});add("release-result",released);return out;
}
void test("complete1536-hold bound fits and source rows remain only an upper bound",()=>{
 const all=capacity(512,512);assert.equal(all.length,BUDGET.records);assert.equal(all.length,3085);assert.ok(BUDGET.manifestBytes<64*1024*1024);assert.equal(BUDGET.rendererRequests,10_787);assert.doesNotThrow(()=>{ chain(all); });
 const smaller=capacity(2,512);assert.doesNotThrow(()=>{ chain(smaller); });assert.equal(smaller.filter(row=>row.kind==="callback-result").length,6);
 assert.equal(record.safeParse({...all.at(-1),sequence:BUDGET.records}).success,false);
 const queue=smaller.findIndex(row=>row.kind==="queue-result");assert.ok(queue>0);const falseQueue=[...smaller];const original=falseQueue[queue];assert.ok(original!==undefined);falseQueue[queue]=record.parse({...original,evidence:{calls:1,finalizers:1,fulfilledPromiseReferences:2,originalSerialSlotsNull:true,originalOpeningCompleted:true}});assert.throws(()=>{ chain(falseQueue.slice(0,queue+1)); },/QUEUE_RESULT/u);
 const start=smaller.findIndex(row=>row.kind==="callback-intent");const first=smaller[start];assert.ok(first!==undefined);const foreign=record.parse({...first,evidence:{ordinal:1,role:"startupReturn"}});assert.throws(()=>{ chain([...smaller.slice(0,start),foreign]); },/CALLBACK_RETURN/u);
 const last=smaller.at(-1);assert.ok(last!==undefined);for(const missing of["originalParentJobExitObserved","originalPendingCallbacksJoined"]){assert.throws(()=>{ chain([...smaller.slice(0,-1),record.parse({...last,evidence:{...released,[missing]:false}})]); });}
});
void test("strict disjoint request and evidence schema cannot claim original ownership",()=>{
 const selected=input("schema-only-original");assert.throws(()=>request.parse({...selected,parentOperationId:"footprint-forward-writer-different-suffix"}));assert.throws(()=>request.parse({...selected,operationId:"footprint-forward-writer-schema-only-original"}));assert.throws(()=>request.parse({...selected,acceptOriginalProjectTimerCancellation:false}));assert.throws(()=>request.parse({...selected,nativeOwner:{}}));
 const all=capacity(1,1);const first=all[0];assert.ok(first!==undefined);assert.throws(()=>{ chain([record.parse({...first,evidence:{request:selected,ownerIssued:true}})]); });
});
