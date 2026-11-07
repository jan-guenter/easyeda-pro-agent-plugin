/** Real managed publication/admission with explicit inert original hook and
 * plan-registry seams. No native owner, design file or control is created. */
/* oxlint-disable import/max-dependencies -- The focused test composes both admission paths with actual managed journal/phase and immutable sidecar publication. */
import assert from "node:assert/strict";
import {randomUUID} from "node:crypto";
import {readFile,writeFile} from "node:fs/promises";
import {createRequire} from "node:module";
import {test} from "node:test";
import {runInThisContext} from "node:vm";
import {transform} from "esbuild";
import {createOperation,loadOperation,publishManagedAttachmentExclusive,writePhaseArtifact} from "../src/artifacts.ts";
import {OPERATION_SCHEMA,buildPlanHash,sha256Json,sha256Text} from "../src/core.ts";
import {currentPcbViaWriteAbandonmentSchema,inspectCurrentPcbViaWriteAbandonment} from "../src/current-pcb-via-write-abandonment-data.ts";
import {currentPcbViaWriteAbandonmentPath} from "../src/current-pcb-via-write-abandonment-file.ts";
import {assertNoUnresolvedCurrentPcbViaWrites} from "../src/current-pcb-via-write-journal.ts";
import type {assertCurrentPcbViaWriteJournalChain} from "../src/current-pcb-via-write-journal.ts";
import {inspectCurrentPcbViaWriteAdmission} from "../src/current-pcb-via-write-admission.ts";
import {scanQualifiedAdmissionOperations} from "../src/closed-symbol-terminal-admission.ts";
import type {CurrentPcbViaWriteGenerationClosure} from "../src/current-pcb-via-write-abandonment-origin.ts";

type Entry=Parameters<typeof assertCurrentPcbViaWriteJournalChain>[0][number];
interface Publication {publish:()=>Promise<unknown>;settle:()=>Promise<unknown>}
async function fixture(outcome:CurrentPcbViaWriteGenerationClosure,lose=false):Promise<Readonly<{id:string;plan:object;journal:object;token:object;publication:Publication;other:(token:object,plan:object,journal:object)=>Publication;writes:()=>number;drift:()=>void}>>{
 const id=`pcb209-via-write-abandon-${randomUUID()}`,raw=`C:\\Synthetic\\CodexEasyedaFixture_${"a".repeat(32)}\\Codex_line_and_via_${"b".repeat(16)}.eprj2`;
 const plan=Object.freeze({schema:"private.current-pcb-via-write-plan.v1",operationId:id,target:{rawWindowsPath:raw,projectUuid:sha256Text(raw),branchUuid:"c".repeat(32),documentUuid:"d".repeat(32),expectedSourceSha256:"e".repeat(64)},initialLogicalSha256:"f".repeat(64),via:{netName:"",xMil:10,yMil:20,holeDiameterMil:4,diameterMil:8,viaType:0,designRuleBlindViaName:"",solderMaskExpansion:{topSolderMask:0,bottomSolderMask:0},primitiveLock:false},expectedNative:{family:"Via",net:"",x:1,y:2,radius:.4,holeRadius:.2,type:0,startLayer:1,endLayer:2,expansionType:2,topExpansion:0,bottomExpansion:0,locked:false},inverseAvailable:false,footprintDocumentAllocationRequired:false,footprintStructureWriterRequired:false});
 const data={profile:"private.pcb209-via-write-journal.v2",plan,nonce:"1".repeat(64)},records:Entry[]=[];
 const add=(kind:Entry["kind"],evidence:Entry["evidence"]):void=>{records.push({schema:"easyeda-pro-control.pcb209-via-write-record.v2",operationId:id,sequence:records.length,previousSha256:records.length===0?null:sha256Json(records.at(-1)),kind,evidence,inverseAvailable:false});};
 add("operation-intent",{plan});add("baseline-intent",{});add("baseline-result",{});add("allocation-intent",{});
 if(outcome.helperAllocated){add("allocation-result",{});add("launch-intent",{});if(outcome.rootCreated){add("launch-result",{});}}add("failure",{source:"inert original refusal"});
 if(outcome.outcome==="root-never-created"){add("no-process-release-intent",{generation:"writer",originalFactoryVerified:true,rootNeverCreated:true,jobEmpty:true,releaseOriginalHelperOnly:true});add("no-process-release-result",{generation:"writer",originalFactoryVerified:true,rootNeverCreated:true,jobEmpty:true,helperReleaseVerified:true,designCompletionClaimed:false,readbackCompletionClaimed:false});}
 if(outcome.outcome==="root-exited"){add("termination-intent",{});add("termination-result",{rootExited:true,jobEmpty:true});add("release-intent",{});add("release-result",{released:true});}
 const artifacts=[];for(const entry of records){artifacts.push(await writePhaseArtifact(id,entry.sequence,entry.kind,entry));}await createOperation({schema:OPERATION_SCHEMA,operationId:id,plan:data,planHash:buildPlanHash(data),state:"prepared",records,artifacts});
 const token=Object.freeze({profile:"private.current-pcb-via-write-failure-closure.v1"});const journal=Object.freeze({original:true});let valid=true,writes=0;
 const bindings=Object.freeze({plan,journal,value:Object.freeze({writer:outcome,readback:null,capture:"not-started",saved:false,reopened:false,completionClaimed:false,ownerTransferred:false,replayAllowed:false}),assertCurrent:():Promise<void>=>{assert.equal(valid,true);return Promise.resolve();}});
 const registry=new WeakMap<object,typeof bindings>([[token,bindings]]),workflow=Object.freeze({requireOriginalCurrentPcbViaWriteFailureClosure:(candidate:object,p:object,j:object):typeof bindings=>{const b=registry.get(candidate);assert.equal(b,bindings);assert.equal(p,plan);assert.equal(j,journal);assert.equal(valid,true);return bindings;}});
 const url=new URL("../src/current-pcb-via-write-abandonment.ts",import.meta.url);const local=createRequire(url);const originalSource=await readFile(url,"utf8");const source=originalSource.replace('await import("./current-pcb-via-write-workflow.ts")','await Promise.resolve(require("./current-pcb-via-write-workflow.ts"))');
 const compiled=await transform(source,{loader:"ts",format:"cjs",target:"node24"}),loaded:{exports:Record<string,unknown>}={exports:{}};const evaluate:unknown=runInThisContext(`(function(require,module,exports){${compiled.code}\n})`);assert.ok(typeof evaluate==="function");
 Reflect.apply(evaluate,undefined,[(name:string):unknown=>{if(name==="./current-pcb-via-write-workflow.ts"){return workflow;}if(name==="./current-pcb-via-write-plan.ts"){return{requireOriginalCurrentPcbViaWritePlan:(p:unknown):object=>{assert.equal(p,plan);return{};}};}if(name==="./artifacts.ts"){const original:unknown=local(name);assert.ok(original!==null&&typeof original==="object");return{...original,publishManagedAttachmentExclusive:async(...args:Parameters<typeof publishManagedAttachmentExclusive>):Promise<Awaited<ReturnType<typeof publishManagedAttachmentExclusive>>>=>{writes+=1;const result=await publishManagedAttachmentExclusive(...args);if(lose){throw new Error("lost original publication ACK");}return result;}};}return local(name) as unknown;},loaded,loaded.exports]);
 const Constructor=loaded.exports["CurrentPcbViaWriteAbandonmentPublication"];assert.ok(typeof Constructor==="function");
 const other=(t:object,p:object,j:object):Publication=>{const value:unknown=Reflect.construct(Constructor,[t,p,j]);assert.ok(value!==null&&typeof value==="object");const publish:unknown=Reflect.get(value,"publish"),settle:unknown=Reflect.get(value,"settle");assert.ok(typeof publish==="function"&&typeof settle==="function");return{publish:()=>Promise.resolve(Reflect.apply(publish,value,[])),settle:()=>Promise.resolve(Reflect.apply(settle,value,[]))};};
 return{id,plan,journal,token,publication:other(token,plan,journal),other,writes:()=>writes,drift:():void=>{valid=false;}};
}
async function quarantined(id:string):Promise<boolean>{const rows=await scanQualifiedAdmissionOperations();const result=rows.find(row=>row.summary.operationId===id);return result?.bridgeBlocking===true;}
void test("four original closure distinctions abandon without rewriting or completing the failed journal",async()=>{
 const outcomes:CurrentPcbViaWriteGenerationClosure[]=[{outcome:"allocation-never-entered",helperAllocated:false,rootCreated:false,exitClaimed:false},{outcome:"no-resource-allocated",helperAllocated:false,rootCreated:false,exitClaimed:false},{outcome:"root-never-created",helperAllocated:true,helperReleased:true,rootCreated:false,exitClaimed:false},{outcome:"root-exited",helperAllocated:true,helperReleased:true,rootCreated:true,originalRootExited:true,originalJobEmpty:true}];
 for(const outcome of outcomes){const f=await fixture(outcome);assert.equal(await quarantined(f.id),true);const before=await loadOperation(f.id);await f.publication.publish();assert.equal(f.writes(),1);assert.equal(sha256Json(await loadOperation(f.id)),sha256Json(before));assert.equal(await quarantined(f.id),false);const expected={operationId:f.id,storedJournalSha256:String(before["journalSha256"]),entireStoredJournalSha256:sha256Json(before)};assert.deepEqual(await inspectCurrentPcbViaWriteAdmission(expected),{terminal:false,abandoned:true});const inspected=await inspectCurrentPcbViaWriteAbandonment(f.id);assert.ok(inspected!==undefined);assert.equal(inspected.saved,false);assert.equal(inspected.reopened,false);assert.equal(inspected.authorityRestored,false);const sidecarText=await readFile(currentPcbViaWriteAbandonmentPath(f.id),"utf8");const retained=currentPcbViaWriteAbandonmentSchema.parse(JSON.parse(sidecarText) as unknown);assert.equal(retained.body.originalClosure.writer.outcome,outcome.outcome);}
 await assertNoUnresolvedCurrentPcbViaWrites();
});
void test("lost publication acknowledgment settles the same bytes and never writes a second sidecar",async()=>{
 const f=await fixture({outcome:"root-exited",helperAllocated:true,helperReleased:true,rootCreated:true,originalRootExited:true,originalJobEmpty:true},true);await assert.rejects(f.publication.publish(),/lost original/u);await assert.rejects(f.publication.publish());assert.equal(f.writes(),1);await f.publication.settle();assert.equal(f.writes(),1);assert.equal(await quarantined(f.id),false);await f.other(f.token,f.plan,f.journal).settle();assert.equal(f.writes(),1);
});
void test("changed phase bytes and false success claims quarantine global and direct admission again",async()=>{
 const f=await fixture({outcome:"root-never-created",helperAllocated:true,helperReleased:true,rootCreated:false,exitClaimed:false});await f.publication.publish();const journal=await loadOperation(f.id),phase=journal.artifacts?.[0];assert.ok(phase!==undefined);const bytes=await readFile(phase.path);await writeFile(phase.path,"changed original phase\n");assert.equal(await quarantined(f.id),true);await assert.rejects(assertNoUnresolvedCurrentPcbViaWrites());await writeFile(phase.path,bytes);assert.equal(await quarantined(f.id),false);
 const path=currentPcbViaWriteAbandonmentPath(f.id);const text=await readFile(path,"utf8");const envelope=currentPcbViaWriteAbandonmentSchema.parse(JSON.parse(text) as unknown);const changed={...envelope,body:{...envelope.body,originalClosure:{...envelope.body.originalClosure,saved:true}}};await writeFile(path,`${JSON.stringify({...changed,bodySha256:sha256Json(changed.body)})}\n`);assert.equal(await quarantined(f.id),true);await assert.rejects(assertNoUnresolvedCurrentPcbViaWrites());await writeFile(path,text);assert.equal(await quarantined(f.id),false);
});
void test("copied tokens or changed original closure never reach immutable publication",async()=>{
 const f=await fixture({outcome:"no-resource-allocated",helperAllocated:false,rootCreated:false,exitClaimed:false});await assert.rejects(f.other({...f.token},f.plan,f.journal).publish());assert.equal(f.writes(),0);f.drift();await assert.rejects(f.publication.publish());assert.equal(f.writes(),0);assert.equal(await inspectCurrentPcbViaWriteAbandonment(f.id),undefined);assert.equal(await quarantined(f.id),true);
});
