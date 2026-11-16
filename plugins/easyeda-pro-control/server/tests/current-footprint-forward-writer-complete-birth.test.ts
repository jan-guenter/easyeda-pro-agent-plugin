/** Refused original births and inert data/constructor checks only.
 * No factory reaches native graph capture, spawn, helper, Job or app. */
import assert from "node:assert/strict";
import {test} from "node:test";
import { CurrentFootprintForwardWriterHeldSavedNativeOwner, CurrentFootprintForwardWriterNativeOwner, assertOriginalCurrentFootprintCopyHeldSavedNativeOwner, assertOriginalCurrentFootprintForwardWriterHeldSavedNativeOwner, currentFootprintForwardWriterBirthOutcome, currentFootprintForwardWriterCompleteBirthOutcome, requireOriginalCurrentFootprintForwardWriterCompleteBirth, startCurrentFootprintForwardWriterCompleteNativeOwner, startCurrentFootprintForwardWriterHeldSavedNativeOwner } from "../src/current-pcb-diagnostic-owner.ts";
import {CurrentFootprintCopyForwardResourceLedger,createCurrentFootprintForwardWriterCompleteResourceLedger} from "../src/current-footprint-copy-forward-capacity.ts";
import {CurrentFootprintForwardWriterAllocatedCreateClockBudget,createCurrentFootprintForwardWriterCompleteAllocatedClockBudget} from "../src/current-footprint-forward-writer-allocated-clock-budget.ts";
import {CurrentFootprintForwardWriterStartupChannel,createCurrentFootprintForwardWriterCompleteStartupChannel} from "../src/current-pcb-worker-startup-channel.ts";
import {requireCurrentFootprintForwardWriterMainRequestMaximumStrings} from "../src/current-footprint-forward-writer-main-request-plan.ts";
import {completeCapacityFixture} from "./helpers/footprint-forward-complete-capacity-fixture.ts";
import {currentFootprintForwardWriterCompleteProfile} from "../src/current-footprint-forward-writer-complete-profile.ts";
import {CURRENT_FOOTPRINT_FORWARD_WRITER_COMPLETE_TAIL_ACTIONS as ACTIONS,currentFootprintForwardWriterCompleteMainCleanup as cleanup,isCurrentFootprintForwardWriterCompleteAction as completeAction} from "../src/current-footprint-forward-writer-complete-action-class.ts";

function unusedPeer():never{throw new Error("inert-peer-must-remain-unused");}
const options=():Readonly<{pluginRoot:string;assetsRoot:string;powershellSha256:string;powershellBytes:number}>=>
 Object.freeze({pluginRoot:"/inert-complete-birth",assetsRoot:"/inert-assets",powershellSha256:"0".repeat(64),powershellBytes:1});
void test("actual complete factory consumes its own options before a forged input can reach native IO",async()=>{
 const selected=options();let getters=0;
 const input=Object.freeze({get profile():"private.current-footprint-forward-writer-head-input.v1"{getters+=1;return"private.current-footprint-forward-writer-head-input.v1";},executionAuthorized:false as const});
 assert.equal(currentFootprintForwardWriterCompleteProfile().stages.complete.naturalTicketTimerBudgetReserved,true);
 await assert.rejects(startCurrentFootprintForwardWriterCompleteNativeOwner(selected,input),/FORWARD_WRITER_HEAD_INPUT/u);assert.equal(getters,0);
 const result=currentFootprintForwardWriterCompleteBirthOutcome(selected);assert.equal(result.schema,"private.current-footprint-forward-writer-complete-birth-outcome.v2");assert.equal(result.state,"no-resource");assert.equal(result.owner,null);assert.equal(result.helperClosed,false);assert.equal(result.eofAttempted,false);
 assert.equal(currentFootprintForwardWriterBirthOutcome(selected).state,"not-attempted");assert.equal(currentFootprintForwardWriterCompleteBirthOutcome({...selected}).state,"not-attempted");
 await assert.rejects(startCurrentFootprintForwardWriterCompleteNativeOwner(selected,input),/COMPLETE_BIRTH_CONSUMED/u);assert.equal(getters,0);
});
void test("matching complete labels cannot select the fixed ledger, physical clock budget or channel",async()=>{
 const origin=Object.freeze({profile:"private.current-footprint-forward-writer-complete-birth-origin.v1"as const});let getters=0;
 assert.throws(()=>requireOriginalCurrentFootprintForwardWriterCompleteBirth(origin),/ORIGINAL_BIRTH_ORIGIN/u);
 await assert.rejects(createCurrentFootprintForwardWriterCompleteResourceLedger(origin),/ORIGINAL_BIRTH_ORIGIN/u);
 await assert.rejects(createCurrentFootprintForwardWriterCompleteAllocatedClockBudget(1,origin),/ORIGINAL_BIRTH_ORIGIN/u);
 assert.throws(()=>Reflect.construct(CurrentFootprintCopyForwardResourceLedger,["forward-writer-complete-v2"]),/PROFILE/u);
 const packet=Object.freeze({get key():symbol{getters+=1;return Symbol("fake-complete");}});
 assert.throws(()=>Reflect.construct(CurrentFootprintCopyForwardResourceLedger,["observation",packet]),/COMPLETE_ORIGINAL_FACTORY/u);
 assert.throws(()=>Reflect.construct(CurrentFootprintForwardWriterAllocatedCreateClockBudget,[1,packet]),/COMPLETE_CLOCK_ORIGINAL_FACTORY/u);
 const native={get requireOriginalParent():()=>Promise<never>{getters+=1;return()=>Promise.reject(new Error("inert native must remain untouched"));},assertOriginalTermination:():Promise<void>=>Promise.resolve(),observeOriginalParentEvent:():null=>null,exchange:():Promise<never>=>Promise.reject(new Error("inert native must remain untouched"))};
 const prior={nextRequestId:1,receivedBytes:0,eventBytes:0,eventCount:0};
 await assert.rejects(createCurrentFootprintForwardWriterCompleteStartupChannel(origin,native,unusedPeer,prior,unusedPeer),/ORIGINAL_BIRTH_ORIGIN/u);
 assert.throws(()=>Reflect.construct(CurrentFootprintForwardWriterStartupChannel,[native,unusedPeer,prior,unusedPeer,packet]),/COMPLETE_ORIGINAL_CHANNEL_FACTORY/u);assert.equal(getters,0);
});
void test("complete-only Main action classification cannot consume renderer slots or widen historical roles",()=>{
 assert.deepEqual(ACTIONS,["footprint-forward-writer-main-sql","footprint-forward-startup-ws","footprint-forward-ticket-timer","footprint-forward-ticket-timer-control","footprint-forward-own-data","footprint-forward-own-data-control","footprint-forward-branch-query","footprint-forward-writer-branch","footprint-forward-live-history","footprint-forward-copy-local","footprint-forward-copy-upload","footprint-forward-copy-drain","footprint-forward-copy-post-sync","footprint-forward-copy-delete","footprint-forward-copy-tail-observe","footprint-forward-copy-tail-control","footprint-forward-copy-publication","footprint-forward-copy-publication-control"]);
 assert.equal(cleanup("footprint-forward-writer-main-sql","forward-writer-sql-frame-run"),false);assert.equal(cleanup("footprint-forward-writer-main-sql","arbitrary"),null);
 for(const action of ACTIONS){assert.equal(completeAction(action),true);}assert.equal(completeAction("main-request-send"),false);
 for(const action of["footprint-forward-writer-branch","footprint-forward-live-history"]){assert.equal(cleanup(action,action.includes("branch")?"forward-writer-branch-arm":"inverse-main-history-arm"),false);assert.equal(cleanup(action,"arbitrary"),null);}
 assert.equal(cleanup("footprint-forward-writer-branch","forward-writer-branch-remove"),true);assert.equal(cleanup("footprint-forward-writer-branch","forward-writer-branch-release"),true);assert.equal(cleanup("footprint-forward-live-history","inverse-main-history-release"),true);
 assert.equal(cleanup("footprint-forward-initial-history","inverse-main-history-arm"),null);
});
void test("maximum reservation projects its two original strings without losing the lower duplicate META record",async()=>{
 const f=await completeCapacityFixture();const strings=requireCurrentFootprintForwardWriterMainRequestMaximumStrings(f.reservation);assert.equal(strings.length,2);assert.equal(Object.isFrozen(strings),true);assert.equal(strings.join("|\n"),f.maximum.dataStr);
 assert.equal(strings[0].split("|\n").length,2);assert.ok(strings[1].startsWith('{"type":"DOCHEAD",'));assert.equal((strings.join("|\n").match(/"id":"META"/gu)??[]).length,2);
 assert.throws(()=>requireCurrentFootprintForwardWriterMainRequestMaximumStrings({...f.reservation}),/ORIGINAL_RESERVATION/u);
});

void test("data-only complete and cold owner prototypes cannot enter either original saved factory",async()=>{
 const candidate:unknown=Object.create(CurrentFootprintForwardWriterNativeOwner.prototype);assert.ok(candidate instanceof CurrentFootprintForwardWriterNativeOwner);
 let reads=0;Object.defineProperty(candidate,"status",{get():never{reads+=1;throw new Error("getter");}});
 const pending:unknown=Reflect.apply(startCurrentFootprintForwardWriterHeldSavedNativeOwner,undefined,[candidate,{},{},{}]);assert.ok(pending instanceof Promise);await assert.rejects(pending,/ORIGINAL/u);assert.equal(reads,0);
 const cold:unknown=Object.create(CurrentFootprintForwardWriterHeldSavedNativeOwner.prototype);assert.ok(cold instanceof CurrentFootprintForwardWriterHeldSavedNativeOwner);
 assert.throws(()=>{assertOriginalCurrentFootprintForwardWriterHeldSavedNativeOwner(cold);},/ORIGINAL_OWNER/u);assert.throws(()=>{assertOriginalCurrentFootprintCopyHeldSavedNativeOwner(cold);},/ORIGINAL_OWNER/u);
});
