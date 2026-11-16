/** Real isolated managed publication, chain order and capacity. No record
 * supplies a native timer, worker callback or original Job-exit observation. */
import assert from "node:assert/strict";
import {dirname,join} from "node:path";
import {readFile,unlink,writeFile} from "node:fs/promises";
import {test} from "node:test";
import {operationPath} from "../src/artifacts.ts";
import {sha256Json} from "../src/core.ts";
import {assertNoUnresolvedCurrentPcbDiagnosticLaunches as globalLaunches} from "../src/current-pcb-diagnostic-lifecycle-journal.ts";
import {CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_BUDGET as BUDGET,currentFootprintForwardWriterTicketTimerRecordSchema as record,currentFootprintForwardWriterTicketTimerRequestSchema as request} from "../src/current-footprint-forward-writer-ticket-timer-contract.ts";
import type {CurrentFootprintForwardWriterTicketTimerRecord as Entry,CurrentFootprintForwardWriterTicketTimerPhase as Phase} from "../src/current-footprint-forward-writer-ticket-timer-contract.ts";
import {CurrentFootprintForwardWriterTicketTimerJournal as Journal,assertCurrentFootprintForwardWriterTicketTimerChain as chain,readCurrentFootprintForwardWriterTicketTimerHistory as history,assertNoUnresolvedCurrentFootprintForwardWriterTicketTimers as unresolved} from "../src/current-footprint-forward-writer-ticket-timer-journal.ts";

const ws=Object.freeze({sourceSha256:"0".repeat(64),inputSha256:"1".repeat(64),originalStartupEntryObserved:true});
const wsResult=Object.freeze({privateDeployment:false,sourceInitializations:1,originalLexicalFrameRetained:true,websocketPublicationExcluded:true});
const released=Object.freeze({originalParentJobExitObserved:true,originalPendingCallbacksJoined:true,released:true});
function input(suffix:string):ReturnType<typeof request.parse>{return request.parse({operationId:`footprint-forward-ticket-timer-${suffix}`,parentOperationId:`footprint-forward-writer-${suffix}`,acceptOriginalNaturalTicketTimer:true});}
void test("the original timer component retains failed publication bytes and blocks launch until actual parent cleanup facts",async()=>{
 const selected=input("timer-original01");const journal=new Journal(selected);const copied=new Journal(selected);
 await journal.reserve();await journal.assertCurrent();await assert.rejects(copied.reserve());await assert.rejects(copied.settle(),/ORIGINAL_RESERVATION/u);await assert.rejects(unresolved(),/UNRESOLVED_OWNER/u);await assert.rejects(globalLaunches(),/UNRESOLVED_OWNER/u);
 const blocker=join(dirname(operationPath(selected.operationId)),selected.operationId,"01-ws-intent.json");await writeFile(blocker,"isolated conflicting bytes\n",{flag:"wx",mode:0o600});
 await assert.rejects(journal.append("ws-intent",ws));assert.equal(journal.retained().publicationPending,true);assert.equal(journal.retained().records.length,1);await journal.waitForCurrentPublication();
 // Only this test's own conflicting file is removed; the publisher cannot overwrite it.
 await unlink(blocker);await journal.settle();const bytes=await readFile(blocker,"utf8");assert.equal(bytes,`${JSON.stringify(journal.retained().records[1])}\n`);
 let called=0;await assert.rejects(journal.append("ws-result",{...wsResult,get privateDeployment():boolean{called+=1;return false;}}));assert.equal(called,0);
 await journal.append("ws-result",wsResult);await journal.append("failure",{phase:"setup",originalErrorRetained:true});await assert.rejects(journal.append("setup-intent",{}));await journal.append("release-intent",{});
 await assert.rejects(journal.append("release-result",{...released,originalPendingCallbacksJoined:false}));await journal.append("release-result",released);
 await unresolved();await globalLaunches();const observed=await history(selected.operationId);assert.equal(observed.operation["state"],"completed");
});
function capacity(timers:1|2):Entry[]{
 const selected=input("timer-capacity01");const rows:Entry[]=[];const add=(kind:Phase,evidence:Readonly<Record<string,unknown>>):void=>{const prior=rows.at(-1);rows.push(record.parse({schema:"easyeda-pro-control.footprint-forward-writer-ticket-timer-record.v1",operationId:selected.operationId,sequence:rows.length,previousSha256:prior===undefined?null:sha256Json(prior),kind,evidence,executionAuthorized:false,saveAuthorized:false}));};
 add("operation-intent",{request:selected});add("ws-intent",ws);add("ws-result",wsResult);add("setup-intent",{sourceSha256:"2".repeat(64),inputSha256:"3".repeat(64),originalReflectionPacketRetained:true});add("setup-result",{commands:37,points:3,baselinePublishTimerNull:true,originalSubscribersRetained:true,canvasTimersExcluded:true});add("precreate-intent",{});add("precreate-result",{commands:1,originalBaselineUnchanged:true});
 let ordinal=0;for(let timerOrdinal=1;timerOrdinal<=timers;timerOrdinal+=1){for(const role of["entry","returned","selfReturned"]as const){ordinal+=1;add("timer-intent",{ordinal,timerOrdinal,role});add("timer-result",{ordinal,timerOrdinal,role,commands:role==="entry"?4:3,originalResumed:true});}}
 add("quiesce-intent",{});add("quiesce-result",{commands:3,timers,publishTimerNull:true,originalParserAndPostSyncReturned:true,originalCallbacksJoined:true});add("complete",{timers,naturalSelfReturnsJoined:true,executionAuthorized:false});add("failure",{phase:"quiesce",originalErrorRetained:true});add("release-intent",{});add("release-result",released);return rows;
}
void test("the exact two-timer chain fits its reserve and rejects missing/self/out-of-order or fabricated completion facts",()=>{
 const rows=capacity(2);assert.equal(rows.length,BUDGET.records);assert.equal(rows.length,25);assert.ok(BUDGET.manifestBytes<1024*1024);assert.doesNotThrow(()=>{chain(rows);});assert.doesNotThrow(()=>{chain(capacity(1));});
 const missing=rows.filter(row=>row.kind!=="ws-result");assert.throws(()=>{chain(missing);});
 const wrong=structuredClone(rows);const at=wrong.findIndex(row=>row.kind==="timer-result");const entry=wrong[at];assert.ok(entry!==undefined);wrong[at]={...entry,evidence:{...entry.evidence,commands:3}};assert.throws(()=>{chain(wrong);});
 const unfinished=structuredClone(rows);const index=unfinished.findIndex(row=>row.kind==="quiesce-result");const final=unfinished[index];assert.ok(final!==undefined);unfinished[index]={...final,evidence:{...final.evidence,timers:1}};assert.throws(()=>{chain(unfinished);});
 assert.equal(request.safeParse({...input("timer-wrong01"),parentOperationId:"footprint-forward-writer-different"}).success,false);assert.equal(record.safeParse({...rows.at(-1),sequence:25}).success,false);
});
