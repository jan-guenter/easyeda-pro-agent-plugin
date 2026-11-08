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
import {currentSchematicRelevanceDisplayWriteAbandonmentSchema,inspectCurrentSchematicRelevanceDisplayWriteAbandonment} from "../src/current-schematic-relevance-display-write-abandonment-data.ts";
import {currentSchematicRelevanceDisplayWriteAbandonmentPath} from "../src/current-schematic-relevance-display-write-abandonment-file.ts";
import {GENERATED_SCHEMATIC_RELEVANCE_DISPLAY_JOURNAL_STAGES,assertGeneratedSchematicRelevanceDisplayJournalChain} from "../src/generated-schematic-relevance-display-journal.ts";
import {prepareGeneratedSchematicRelevanceDisplayBodyPlan} from "../src/generated-schematic-relevance-display-source.ts";
import {assertNoUnresolvedCurrentSchematicRelevanceDisplayWrites,inspectCurrentSchematicRelevanceDisplayWriteAdmission} from "../src/current-schematic-relevance-display-write-admission.ts";
import {scanQualifiedAdmissionOperations} from "../src/closed-symbol-terminal-admission.ts";
import type {CurrentSchematicRelevanceDisplayWriteGenerationClosure} from "../src/current-schematic-relevance-display-write-abandonment-origin.ts";

type Entry=ReturnType<typeof assertGeneratedSchematicRelevanceDisplayJournalChain>[number];
interface Publication {publish:()=>Promise<unknown>;settle:()=>Promise<unknown>}
async function fixture(outcome:CurrentSchematicRelevanceDisplayWriteGenerationClosure,lose=false,readerFailure=false):Promise<Readonly<{id:string;plan:object;journal:object;token:object;publication:Publication;other:(token:object,plan:object,journal:object)=>Publication;writes:()=>number;drift:()=>void}>>{
 const id=`sch209-relevance-display-abandon-${randomUUID()}`,raw=`C:\\Synthetic\\CodexEasyedaFixture_${"a".repeat(32)}\\Codex_schematic_relevance_${"b".repeat(16)}.eprj2`;
 const checkpoint={path:"synthetic-retained-checkpoint",bytes:512,sha256:"1".repeat(64)},projection=prepareGeneratedSchematicRelevanceDisplayBodyPlan({x:11});
 const argumentsValue={schema:"private.generated-schematic-relevance-display-args.v1",target:{rawWindowsPath:raw,projectUuid:sha256Text(raw),branchUuid:"c".repeat(32),schematicUuid:"d".repeat(32),pageUuid:"e".repeat(32),expectedSourceSha256:"f".repeat(64)},operation:{operationId:id,textId:"1".repeat(16),rootIds:["1".repeat(16),"2".repeat(16),"3".repeat(16)],beforeBody:projection.nativeBeforeBody,afterBody:projection.nativeAfterBody,peers:[{id:"CANVAS",type:"CANVAS",body:{}},{id:"2".repeat(16),type:"WIRE",body:{}},{id:"3".repeat(16),type:"BUS",body:{}},{id:"4".repeat(16),type:"LINE",body:{}},{id:"5".repeat(16),type:"LINE",body:{}},{id:"6".repeat(16),type:"ATTR",body:{}}]}};
 const plan=Object.freeze({profile:"private.current-schematic-relevance-display-write-plan.v1",operationId:id,executionAuthorized:false});
 const data={profile:"private.generated-schematic-relevance-display-journal.v1",arguments:argumentsValue,checkpoint,nonce:"1".repeat(64)},records:Entry[]=[];
 const add=(kind:Entry["kind"],evidence:Entry["evidence"]):void=>{records.push({schema:"easyeda-pro-control.generated-schematic-relevance-display-record.v1",operationId:id,sequence:records.length+1,previousSha256:records.length===0?null:sha256Json(records.at(-1)),kind,evidence,inverseAvailable:false});};
 add("operation-intent",{arguments:argumentsValue});
 if(readerFailure){
  for(const stage of GENERATED_SCHEMATIC_RELEVANCE_DISPLAY_JOURNAL_STAGES.slice(0,17)){
   add(`${stage}-intent`,{});
   const evidence=stage!=="modify"&&stage!=="save"?{}:{schema:"easyeda-pro-control.generated-schematic-relevance-display-stage.v1",stage,ok:true,dispatchAttempted:true,originalPromiseSettled:true,modifyAttempted:true,modifyAcknowledged:true,saveAttempted:stage==="save",saveAcknowledged:stage==="save",savePromiseSettled:stage==="save",source:"explicit-inert-stage-data",windowTabId:"inert",originalContextIntact:true,connectivityVerified:false,sourceVersionAliased:false,workerCompletionVerified:false,structureCompletionVerified:false,persistenceVerified:false,inverseAvailable:false};
   add(`${stage}-result`,evidence);
  }
  add("reopen-intent",{});add("failure",{source:"inert saved-reader refusal after original writer release"});
 }else{
add("baseline-intent",{});add("baseline-result",{});
 if(outcome.outcome!=="allocation-never-entered"){add("allocation-intent",{});}
 if(outcome.helperAllocated){add("allocation-result",{});add("launch-intent",{});if(outcome.rootCreated){add("launch-result",{});}}
 add("failure",{source:"inert original refusal"});
 if(outcome.outcome==="root-exited"){add("termination-intent",{});add("termination-result",{rootExited:true,jobEmpty:true});add("release-intent",{});add("release-result",{released:true});}
 }
 const artifacts=[];for(const entry of records){artifacts.push(await writePhaseArtifact(id,entry.sequence,entry.kind,entry));}await createOperation({schema:OPERATION_SCHEMA,operationId:id,plan:data,planHash:buildPlanHash(data),state:"prepared",sequence:records.length,records,artifacts});
 const token=Object.freeze({profile:"private.current-schematic-relevance-display-write-failure-closure.v1"});const journal=Object.freeze({original:true});let valid=true,writes=0;
 const bindings=Object.freeze({plan,journal,value:Object.freeze({writer:outcome,readback:readerFailure?{outcome:"root-never-created",helperAllocated:true,helperReleased:true,rootCreated:false,exitClaimed:false}:null,capture:readerFailure?"all-original-handles-closed":"not-started",saved:false,reopened:false,completionClaimed:false,ownerTransferred:false,replayAllowed:false}),assertCurrent:():Promise<void>=>{assert.equal(valid,true);return Promise.resolve();}});
 const registry=new WeakMap<object,typeof bindings>([[token,bindings]]),workflow=Object.freeze({requireOriginalCurrentSchematicRelevanceDisplayWriteFailureClosure:(candidate:object,p:object,j:object):typeof bindings=>{const b=registry.get(candidate);assert.equal(b,bindings);assert.equal(p,plan);assert.equal(j,journal);assert.equal(valid,true);return bindings;}});
 const url=new URL("../src/current-schematic-relevance-display-write-abandonment.ts",import.meta.url);const local=createRequire(url);const originalSource=await readFile(url,"utf8");const source=originalSource.replace('await import("./current-schematic-relevance-display-write-workflow.ts")','await Promise.resolve(require("./current-schematic-relevance-display-write-workflow.ts"))');
 const compiled=await transform(source,{loader:"ts",format:"cjs",target:"node24"}),loaded:{exports:Record<string,unknown>}={exports:{}};const evaluate:unknown=runInThisContext(`(function(require,module,exports){${compiled.code}\n})`);assert.ok(typeof evaluate==="function");
 Reflect.apply(evaluate,undefined,[(name:string):unknown=>{if(name==="./current-schematic-relevance-display-write-workflow.ts"){return workflow;}if(name==="./current-schematic-relevance-display-write-plan.ts"){return{requireOriginalCurrentSchematicRelevanceDisplayWritePlan:(p:unknown):object=>{assert.equal(p,plan);return{argumentsValue,prepared:{preparationCheckpoint:checkpoint}};}};}if(name==="./artifacts.ts"){const original:unknown=local(name);assert.ok(original!==null&&typeof original==="object");return{...original,publishManagedAttachmentExclusive:async(...args:Parameters<typeof publishManagedAttachmentExclusive>):Promise<Awaited<ReturnType<typeof publishManagedAttachmentExclusive>>>=>{writes+=1;const result=await publishManagedAttachmentExclusive(...args);if(lose){throw new Error("lost original publication ACK");}return result;}};}return local(name) as unknown;},loaded,loaded.exports]);
 const Constructor=loaded.exports["CurrentSchematicRelevanceDisplayWriteAbandonmentPublication"];assert.ok(typeof Constructor==="function");
 const other=(t:object,p:object,j:object):Publication=>{const value:unknown=Reflect.construct(Constructor,[t,p,j]);assert.ok(value!==null&&typeof value==="object");const publish:unknown=Reflect.get(value,"publish"),settle:unknown=Reflect.get(value,"settle");assert.ok(typeof publish==="function"&&typeof settle==="function");return{publish:()=>Promise.resolve(Reflect.apply(publish,value,[])),settle:()=>Promise.resolve(Reflect.apply(settle,value,[]))};};
 return{id,plan,journal,token,publication:other(token,plan,journal),other,writes:()=>writes,drift:():void=>{valid=false;}};
}
async function quarantined(id:string):Promise<boolean>{const rows=await scanQualifiedAdmissionOperations();const result=rows.find(row=>row.summary.operationId===id);return result?.bridgeBlocking===true;}
void test("four original closure distinctions abandon without rewriting or completing the failed journal",async()=>{
 const outcomes:CurrentSchematicRelevanceDisplayWriteGenerationClosure[]=[{outcome:"allocation-never-entered",helperAllocated:false,rootCreated:false,exitClaimed:false},{outcome:"no-resource-allocated",helperAllocated:false,rootCreated:false,exitClaimed:false},{outcome:"root-never-created",helperAllocated:true,helperReleased:true,rootCreated:false,exitClaimed:false},{outcome:"root-exited",helperAllocated:true,helperReleased:true,rootCreated:true,originalRootExited:true,originalJobEmpty:true}];
 for(const outcome of outcomes){const f=await fixture(outcome);assert.equal(await quarantined(f.id),true);const before=await loadOperation(f.id);await f.publication.publish();assert.equal(f.writes(),1);assert.equal(sha256Json(await loadOperation(f.id)),sha256Json(before));assert.equal(await quarantined(f.id),false);const expected={operationId:f.id,storedJournalSha256:String(before["journalSha256"]),entireStoredJournalSha256:sha256Json(before)};assert.deepEqual(await inspectCurrentSchematicRelevanceDisplayWriteAdmission(expected),{terminal:false,abandoned:true});const inspected=await inspectCurrentSchematicRelevanceDisplayWriteAbandonment(f.id);assert.ok(inspected!==undefined);assert.equal(inspected.saved,false);assert.equal(inspected.reopened,false);assert.equal(inspected.authorityRestored,false);const sidecarText=await readFile(currentSchematicRelevanceDisplayWriteAbandonmentPath(f.id),"utf8");const retained=currentSchematicRelevanceDisplayWriteAbandonmentSchema.parse(JSON.parse(sidecarText) as unknown);assert.equal(retained.body.originalClosure.writer.outcome,outcome.outcome);}
 await assertNoUnresolvedCurrentSchematicRelevanceDisplayWrites();
});
void test("a failed saved reader leaves the already released writer journal byte-exact and creates no duplicate release phases",async()=>{
 const f=await fixture({outcome:"root-exited",helperAllocated:true,helperReleased:true,rootCreated:true,originalRootExited:true,originalJobEmpty:true},false,true);
 const original=await loadOperation(f.id);const before=sha256Json(original);const records=assertGeneratedSchematicRelevanceDisplayJournalChain(original["records"]);
 assert.equal(records.filter(row=>row.kind==="release-result").length,1);
 await f.publication.publish();assert.equal(f.writes(),1);assert.equal(sha256Json(await loadOperation(f.id)),before);assert.equal(await quarantined(f.id),false);
 const sidecarPath=currentSchematicRelevanceDisplayWriteAbandonmentPath(f.id);const sidecarText=await readFile(sidecarPath,"utf8");
 const record=currentSchematicRelevanceDisplayWriteAbandonmentSchema.parse(JSON.parse(sidecarText) as unknown);
 assert.equal(record.body.originalClosure.writer.outcome,"root-exited");assert.equal(record.body.originalClosure.readback?.outcome,"root-never-created");assert.equal(record.body.originalClosure.saved,false);
});
void test("lost publication acknowledgment settles the same bytes and never writes a second sidecar",async()=>{
 const f=await fixture({outcome:"root-exited",helperAllocated:true,helperReleased:true,rootCreated:true,originalRootExited:true,originalJobEmpty:true},true);await assert.rejects(f.publication.publish(),/lost original/u);await assert.rejects(f.publication.publish());assert.equal(f.writes(),1);await f.publication.settle();assert.equal(f.writes(),1);assert.equal(await quarantined(f.id),false);await f.other(f.token,f.plan,f.journal).settle();assert.equal(f.writes(),1);
});
void test("changed phase bytes and false success claims quarantine global and direct admission again",async()=>{
 const f=await fixture({outcome:"root-never-created",helperAllocated:true,helperReleased:true,rootCreated:false,exitClaimed:false});await f.publication.publish();const journal=await loadOperation(f.id),phase=journal.artifacts?.[0];assert.ok(phase!==undefined);const bytes=await readFile(phase.path);await writeFile(phase.path,"changed original phase\n");assert.equal(await quarantined(f.id),true);await assert.rejects(assertNoUnresolvedCurrentSchematicRelevanceDisplayWrites());await writeFile(phase.path,bytes);assert.equal(await quarantined(f.id),false);
 const path=currentSchematicRelevanceDisplayWriteAbandonmentPath(f.id);const text=await readFile(path,"utf8");const envelope=currentSchematicRelevanceDisplayWriteAbandonmentSchema.parse(JSON.parse(text) as unknown);const changed={...envelope,body:{...envelope.body,originalClosure:{...envelope.body.originalClosure,saved:true}}};await writeFile(path,`${JSON.stringify({...changed,bodySha256:sha256Json(changed.body)})}\n`);assert.equal(await quarantined(f.id),true);await assert.rejects(assertNoUnresolvedCurrentSchematicRelevanceDisplayWrites());await writeFile(path,text);assert.equal(await quarantined(f.id),false);
});
void test("copied tokens or changed original closure never reach immutable publication",async()=>{
 const f=await fixture({outcome:"no-resource-allocated",helperAllocated:false,rootCreated:false,exitClaimed:false});await assert.rejects(f.other({...f.token},f.plan,f.journal).publish());assert.equal(f.writes(),0);f.drift();await assert.rejects(f.publication.publish());assert.equal(f.writes(),0);assert.equal(await inspectCurrentSchematicRelevanceDisplayWriteAbandonment(f.id),undefined);assert.equal(await quarantined(f.id),true);
});
