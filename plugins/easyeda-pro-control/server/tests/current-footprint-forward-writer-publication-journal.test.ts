/** Actual isolated managed publications and data-only complete bound checks.
 * No native owner, parent process, callback execution or Job exit is supplied. */
import assert from "node:assert/strict";
import {dirname,join} from "node:path";
import {readFile,unlink,writeFile} from "node:fs/promises";
import {test} from "node:test";
import {loadOperation,operationPath} from "../src/artifacts.ts";
import {sha256Json} from "../src/core.ts";
import {assertNoUnresolvedCurrentPcbDiagnosticLaunches as globalLaunches} from "../src/current-pcb-diagnostic-lifecycle-journal.ts";
import {CURRENT_FOOTPRINT_FORWARD_WRITER_PUBLICATION_BUDGET as BUDGET,currentFootprintForwardWriterPublicationRecordSchema as record,currentFootprintForwardWriterPublicationRequestSchema as request} from "../src/current-footprint-forward-writer-publication-contract.ts";
import type {CurrentFootprintForwardWriterPublicationRecord as Entry,CurrentFootprintForwardWriterPublicationPhase as Phase} from "../src/current-footprint-forward-writer-publication-contract.ts";
import {CurrentFootprintForwardWriterPublicationJournal as Journal,assertCurrentFootprintForwardWriterPublicationChain as chain,readCurrentFootprintForwardWriterPublicationHistory as history,assertNoUnresolvedCurrentFootprintForwardWriterPublications as isolated} from "../src/current-footprint-forward-writer-publication-journal.ts";

function input(suffix:string):ReturnType<typeof request.parse>{return request.parse({operationId:`footprint-forward-publication-${suffix}`,parentOperationId:`footprint-forward-writer-${suffix}`,acceptOriginalMutationPublication:true});}
const setup=Object.freeze({bodyLineUpperBound:256,callbackRunUpperBound:512,sourceSha256:"0".repeat(64),projectionSha256:"1".repeat(64),copyPlanSha256:"2".repeat(64),maximumBodySha256:"3".repeat(64)});
const configured=Object.freeze({originalCallbackPointsRetained:4,newCallbackArms:0,originalStartupFrontierCompleted:true});
const body=Object.freeze({bodySha256:"4".repeat(64),planSha256:"5".repeat(64),documentUuid:"6".repeat(16),bodyLineCalls:256,headCalls:2,originalTwoStringTupleRetained:true});
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
 let getterCalls=0;const hostile={get originalCallbackPointsRetained():number{getterCalls+=1;return 4;},newCallbackArms:0,originalStartupFrontierCompleted:true};
 await assert.rejects(journal.append("setup-result",hostile));assert.equal(getterCalls,0);
 await journal.append("setup-result",configured);await journal.append("failure",{phase:"callback",originalErrorRetained:true});
 await assert.rejects(journal.append("queue-intent",{}),/NORMAL_ENDED/u);
 await journal.append("release-intent",{});await assert.rejects(journal.append("release-result",{...released,originalParentJobExitObserved:false}));
 await journal.append("release-result",released);await isolated();await globalLaunches();const completed=await history(selected.operationId);assert.equal(completed.operation["state"],"completed");
 await assert.rejects(journal.append("failure",{phase:"publication",originalErrorRetained:true}),/CHAIN_IDENTITY/u);
});
function rechain(rows:readonly Entry[]):Entry[]{const result:Entry[]=[];for(const row of rows){const prior=result.at(-1);result.push({...row,sequence:result.length,previousSha256:prior===undefined?null:sha256Json(prior)});}return result;}
function capacity(calls:number,bound:number):Entry[]{
 const selected=input("capacity-historical");const out:Entry[]=[];let ordinal=0;
 const add=(kind:Phase,evidence:Readonly<Record<string,unknown>>):void=>{const prior=out.at(-1);out.push(record.parse({schema:"easyeda-pro-control.footprint-forward-writer-publication-record.v1",operationId:selected.operationId,sequence:out.length,previousSha256:prior===undefined?null:sha256Json(prior),kind,evidence,executionAuthorized:false,saveAuthorized:false}));};
 const hold=(role:"startupEntry"|"startupReturn"|"initialFinally"|"queuedFinally",commands:8|4|6):void=>{ordinal+=1;add("callback-intent",{ordinal,role});add("callback-result",{ordinal,role,originalResumed:true,commands});};
 add("operation-intent",{request:selected});add("setup-intent",{...setup,bodyLineUpperBound:bound,callbackRunUpperBound:2*bound});add("setup-result",configured);add("body-intent",{...body,bodyLineCalls:bound});add("body-result",{originalBodyBound:true,parserResumeAuthorized:false});
 for(let at=0;at<calls;at+=1){hold("startupEntry",8);hold("startupReturn",4)}
 for(let at=0;at<calls;at+=1){hold(at===0?"initialFinally":"queuedFinally",6)}
 add("queue-intent",{});add("queue-result",{calls,finalizers:calls,fulfilledPromiseReferences:2*calls,originalSerialSlotsNull:true,originalParserAndPostSyncReturned:true});add("publication-result",{publicationQuiescent:true,executionAuthorized:false,completeProducerFrontierVerified:false});add("failure",{phase:"publication",originalErrorRetained:true});add("release-intent",{});add("release-result",released);return out;
}
void test("separate two-pass bound fits while zero original callback runs require null serial slots",()=>{
 const all=capacity(512,256);assert.equal(all.length,3083);assert.equal(all.length,BUDGET.records);assert.ok(BUDGET.manifestBytes<64*1024*1024);assert.equal(BUDGET.rendererRequests,10_755);assert.equal(BUDGET.callbackArms,0);assert.equal(BUDGET.timerCommands,0);assert.doesNotThrow(()=>{chain(all)});
 assert.doesNotThrow(()=>{chain(capacity(0,1))});assert.doesNotThrow(()=>{chain(capacity(1,256))});assert.equal(record.safeParse({...all.at(-1),sequence:BUDGET.records}).success,false);
 const impossible=capacity(0,1);const queue=impossible.findIndex(row=>row.kind==="queue-result");const actual=impossible[queue];assert.ok(actual!==undefined);impossible[queue]={...actual,evidence:{...actual.evidence,finalizers:1}};assert.throws(()=>{ chain(impossible); });
 const noBody=rechain(capacity(1,1).filter(row=>row.kind!=="body-result"));assert.throws(()=>{ chain(noBody); },/BODY_REQUIRED/u);assert.equal(request.safeParse({...input("wrong-parent"),parentOperationId:"footprint-forward-writer-foreign-parent"}).success,false);
});
