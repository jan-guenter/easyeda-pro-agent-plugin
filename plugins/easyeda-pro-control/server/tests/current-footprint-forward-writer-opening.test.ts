/** Actual local publication/refusal paths; no native owner or application. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { sha256Json, sha256Text } from "../src/core.ts";
import { CurrentFootprintForwardWriterOpeningProvider, createCurrentFootprintForwardWriterCompleteOpeningProvider, requireCurrentFootprintForwardWriterOpeningInput, requireOriginalCurrentFootprintForwardWriterCompleteOpeningProvider } from "../src/current-footprint-forward-writer-opening.ts";
import type { CurrentPcbDiagnosticLifecycleOptions } from "../src/current-pcb-diagnostic-lifecycle.ts";
import { CurrentFootprintForwardWriterOpeningJournal, assertCurrentFootprintForwardWriterOpeningChain, assertNoUnresolvedCurrentFootprintForwardWriterOpenings } from "../src/current-footprint-forward-writer-opening-journal.ts";
import { CURRENT_FOOTPRINT_FORWARD_WRITER_OPENING_PRODUCER_STEPS as STEPS,currentFootprintForwardWriterOpeningRecordSchema,currentFootprintForwardWriterOpeningRequestSchema } from "../src/current-footprint-forward-writer-opening-contract.ts";
import type { CurrentFootprintForwardWriterOpeningRecord as Entry, CurrentFootprintForwardWriterOpeningPhase as Phase } from "../src/current-footprint-forward-writer-opening-contract.ts";

function request(name="test"):ReturnType<typeof currentFootprintForwardWriterOpeningRequestSchema.parse> {
 const rawWindowsPath=String.raw`C:\Synthetic\full-validation.eprj2`;
 return currentFootprintForwardWriterOpeningRequestSchema.parse({operationId:`footprint-forward-writer-${name}`,target:{rawWindowsPath,projectUuid:sha256Text(rawWindowsPath),documentUuid:"c".repeat(16),expectedSourceSha256:"d".repeat(64)},footprintUuid:"e".repeat(16),confirmDisposableProject:true,acceptExistingProfileEffects:true,acceptNormalOpenEffects:true,acceptDebuggerPauseEffects:true});
}
function options(failure:unknown):CurrentPcbDiagnosticLifecycleOptions { return Object.freeze({pluginRoot:"/synthetic-missing-plugin",assetsRoot:"/synthetic-missing-assets",powershellSha256:"a".repeat(64),powershellBytes:1,
 // oxlint-disable-next-line typescript/prefer-promise-reject-errors -- Exercise original non-Error rejection identity; this refusal occurs before native or journal I/O.
 assertAllowed:():Promise<void>=>Promise.reject(failure),assertLocalAllowed:():void=>{
  // Inert original guard; the earlier async guard refuses before all I/O.
 },assertOtherLaunchesSettled:():Promise<void>=>Promise.reject(new Error("must not be reached"))}); }
void test("original rejection including null burns launch before native or journal effects and supports its no-allocation cleanup",async()=>{
 for(const failure of [new Error("original-refusal"),null]) {
  const provider=new CurrentFootprintForwardWriterOpeningProvider(request(failure===null?"null-refusal":"error-refusal"),options(failure));
  await assert.rejects(provider.launch(),(error:unknown)=>error===failure);assert.equal(provider.retainedFailure(),failure);
  const status=provider.status();assert.equal(status["failed"],true);assert.equal(status["factoryInvoked"],false);assert.equal(status["launchInvoked"],false);
  await provider.cleanupBeforeLaunch();assert.equal(provider.status()["released"],true);await assert.rejects(provider.launch());
 }
});
void test("fresh complete provider retains its disjoint choice through pre-allocation failure without upgrading an old provider",async()=>{
 const failure=new Error("complete-original-refusal");const prior=new CurrentFootprintForwardWriterOpeningProvider(request("prior-choice"),options(failure));
 assert.throws(()=>{requireOriginalCurrentFootprintForwardWriterCompleteOpeningProvider(prior);},/ORIGINAL_COMPLETE_PROVIDER/u);
 const complete=createCurrentFootprintForwardWriterCompleteOpeningProvider(request("complete-choice"),options(failure));
 requireOriginalCurrentFootprintForwardWriterCompleteOpeningProvider(complete);
 const copied={};Object.setPrototypeOf(copied,CurrentFootprintForwardWriterOpeningProvider.prototype);
 assert.throws(()=>Reflect.apply(requireOriginalCurrentFootprintForwardWriterCompleteOpeningProvider,undefined,[copied]),/ORIGINAL_COMPLETE_PROVIDER/u);
 await assert.rejects(complete.launch(),(error:unknown)=>error===failure);assert.equal(complete.status()["factoryInvoked"],false);
 await complete.cleanupBeforeLaunch();assert.equal(complete.status()["released"],true);
 assert.throws(()=>{requireOriginalCurrentFootprintForwardWriterCompleteOpeningProvider(prior);},/ORIGINAL_COMPLETE_PROVIDER/u);
});
void test("copied provider and options accessors cannot manufacture an original full opening",()=>{
 const provider=new CurrentFootprintForwardWriterOpeningProvider(request("copy-refusal"),options(new Error("guard")));const copied:unknown=Object.create(CurrentFootprintForwardWriterOpeningProvider.prototype);
 const method:unknown=Reflect.get(provider,"status");assert.ok(typeof method==="function");assert.throws(()=>Reflect.apply(method,copied,[]));let traps=0;
 const accessor=Object.freeze(Object.defineProperty({...options(null)},"pluginRoot",{get:():never=>{traps+=1;throw new Error("getter");}}));
 assert.throws(()=>new CurrentFootprintForwardWriterOpeningProvider(request("accessor-refusal"),accessor));assert.equal(traps,0);
});
function append(entries:Entry[],kind:Phase,evidence:Readonly<Record<string,unknown>>={}):void {
 const previous=entries.at(-1);
 entries.push(currentFootprintForwardWriterOpeningRecordSchema.parse({schema:"easyeda-pro-control.footprint-forward-writer-opening-record.v1",operationId:request().operationId,sequence:entries.length,previousSha256:entries.length===0?null:sha256Json(previous),kind,evidence,executionAuthorized:false,saveAuthorized:false}));
}
function opening():Entry[] {
 const entries:Entry[]=[];append(entries,"operation-intent",{request:request()});
 for(const kind of ["prepare-intent","prepare-result","allocation-intent","allocation-result","launch-intent","binding","main-intent","main-result","browser-intent","browser-result","frames-intent","frames-result","ui-source-intent","ui-source-result","handoff-intent","handoff-result","opening-intent"] as const) { append(entries,kind); }
 return entries;
}
void test("pending opening owns bounded paired producer stages while failure preserves original abort/termination/release",()=>{
 const entries=opening();append(entries,"producer-intent",{ordinal:1,action:"head",facts:{}});append(entries,"producer-result",{ordinal:1,action:"head",facts:{}});
 append(entries,"producer-intent",{ordinal:2,action:"arm",facts:{}});append(entries,"failure",{phase:"ui-source",originalErrorRetained:true,code:"ORIGINAL_STAGE_FAILED"});
 append(entries,"abort-intent");append(entries,"abort-result",{requested:true,originalJobOnly:true});append(entries,"termination-intent",{ordinal:1});append(entries,"termination-result",{ordinal:1,terminated:true});append(entries,"release-intent");append(entries,"release-result",{released:true});
 assertCurrentFootprintForwardWriterOpeningChain(entries);
 for(const bad of [():Entry[]=>{const next=opening();append(next,"producer-result",{ordinal:1,action:"head",facts:{}});return next;},():Entry[]=>{const next=opening();append(next,"producer-intent",{ordinal:2,action:"head",facts:{}});return next;},():Entry[]=>{const next=opening();append(next,"producer-intent",{ordinal:1,action:"head",facts:{}});append(next,"producer-result",{ordinal:1,action:"arm",facts:{}});return next;}]) { assert.throws(()=>{assertCurrentFootprintForwardWriterOpeningChain(bad());}); }
 const oversized=opening();append(oversized,"producer-intent",{ordinal:1,action:"head",facts:{unexpected:"x".repeat(4096)}});assert.throws(()=>{assertCurrentFootprintForwardWriterOpeningChain(oversized);},/RECORD_BOUND/u);
 assert.equal(STEPS,37);const noOpening:Entry[]=[];append(noOpening,"operation-intent",{request:request()});append(noOpening,"producer-intent",{ordinal:1,action:"head",facts:{}});assert.throws(()=>{assertCurrentFootprintForwardWriterOpeningChain(noOpening);});
});
void test("real managed full journal blocks a different launch until its original no-allocation terminal is published",async()=>{
 const journal=new CurrentFootprintForwardWriterOpeningJournal(request("actual-local-journal"));await journal.reserve();await assert.rejects(assertNoUnresolvedCurrentFootprintForwardWriterOpenings(),/UNRESOLVED_OWNER/u);
 await journal.append("cleanup-no-allocation",{noAllocationProved:true});await journal.assertCurrent();await assertNoUnresolvedCurrentFootprintForwardWriterOpenings();
 assert.equal(journal.retained().records.at(-1)?.kind,"cleanup-no-allocation");assert.equal(journal.retained().publicationPending,false);
});

void test("original unpublished and copied providers cannot issue full source or clock admission",async()=>{
 const provider=new CurrentFootprintForwardWriterOpeningProvider(request("unpublished-source"),options(new Error("guard")));
 await assert.rejects(requireCurrentFootprintForwardWriterOpeningInput(provider),/SOURCE_NOT_PUBLISHED/u);
 const copied:unknown=Object.create(CurrentFootprintForwardWriterOpeningProvider.prototype);
 const source:unknown=Reflect.get(provider,"requireSourceInput");assert.ok(typeof source==="function");
 await assert.rejects(async()=>{await Reflect.apply(source,copied,[]);});
 assert.equal(provider.status()["factoryInvoked"],false);assert.equal(provider.status()["sourceSealed"],false);
});
