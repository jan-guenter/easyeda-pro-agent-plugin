/* oxlint-disable import/max-dependencies -- Exercise original Core/provider guards and managed artifact collision/settlement together, with no injected native callback table. */
/** Real original admission and managed failure/exit bookkeeping only. These
 * cases never allocate a native owner, helper, Job, facade or application. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { unlink, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import {createOperation,operationPath,updateOperation} from "../src/artifacts.ts";
import {OPERATION_SCHEMA,buildPlanHash,sha256Text} from "../src/core.ts";
import {EasyedaControlEngine} from "../src/engine.ts";
import { CurrentFootprintForwardWriterNativeOwner } from "../src/current-pcb-diagnostic-owner.ts";
import { CurrentFootprintForwardWriterOpeningProvider, createCurrentFootprintForwardWriterCompleteOpeningProvider, requireOriginalCurrentFootprintForwardWriterCompleteOpeningRequest } from "../src/current-footprint-forward-writer-opening.ts";
import type { CurrentPcbDiagnosticLifecycleOptions } from "../src/current-pcb-diagnostic-lifecycle.ts";
import { CurrentFootprintForwardWriterWorkflow, assertNoUnresolvedCurrentFootprintForwardWriterWorkflowIsolation, isOriginalCurrentFootprintForwardWriterWorkflowAdmission, reproveOriginalCurrentFootprintForwardWriterWorkflowCreateAdmission, requireOriginalCurrentFootprintForwardWriterWorkflowCreateAdmission, requireOriginalCurrentFootprintForwardWriterWorkflowResult } from "../src/current-footprint-forward-writer-workflow.ts";
import { readCurrentFootprintForwardWriterWorkflowV2History } from "../src/current-footprint-forward-writer-workflow-v2-journal.ts";

function opening(suffix:string):Readonly<Record<string,unknown>> {
 const rawWindowsPath=String.raw`C:\Synthetic\complete-workflow.eprj2`;
 return {operationId:`footprint-forward-writer-${suffix}`,target:{rawWindowsPath,projectUuid:sha256Text(rawWindowsPath),documentUuid:"c".repeat(16),expectedSourceSha256:"d".repeat(64)},footprintUuid:"e".repeat(16),
  confirmDisposableProject:true,acceptExistingProfileEffects:true,acceptNormalOpenEffects:true,acceptDebuggerPauseEffects:true};
}
function request(suffix:string):Readonly<Record<string,unknown>> { return {operationId:`footprint-forward-flow-${suffix}`,parentOperationId:`footprint-forward-writer-${suffix}`,confirmDisposableCopy:true,acceptUnsupportedInverse:true}; }
function options(allowed:()=>Promise<void>):CurrentPcbDiagnosticLifecycleOptions {
 return Object.freeze({pluginRoot:"/synthetic-missing-plugin",assetsRoot:"/synthetic-missing-assets",powershellSha256:"a".repeat(64),powershellBytes:1,assertAllowed:allowed,
  assertLocalAllowed:():void=>{
   // Pure local guard; async admission refuses before native I/O.
  },
  assertOtherLaunchesSettled:():Promise<void>=>Promise.reject(new Error("native factory must not be reached"))});
}
const allowed=():Promise<void>=>Promise.reject(new Error("unused"));
void test("complete workflow rejects old/copy/proxy providers and copied results without invoking supplied getters",()=>{

 const old=new CurrentFootprintForwardWriterOpeningProvider(opening("old"),options(allowed));let traps=0;
 assert.throws(()=>new CurrentFootprintForwardWriterWorkflow(old,request("old")),/ORIGINAL_COMPLETE_PROVIDER/u);
 const proxy=new Proxy({}, {get:():never=>{traps+=1;throw new Error("foreign getter");}});
 assert.throws(()=>Reflect.construct(CurrentFootprintForwardWriterWorkflow,[proxy,request("proxy")]),/ORIGINAL_COMPLETE_PROVIDER/u);
 assert.throws(()=>Reflect.apply(requireOriginalCurrentFootprintForwardWriterWorkflowResult,undefined,[proxy]),/ORIGINAL_RESULT/u);
 assert.throws(()=>Reflect.apply(requireOriginalCurrentFootprintForwardWriterWorkflowCreateAdmission,undefined,[proxy,proxy,proxy,proxy,proxy]),/ORIGINAL_CREATE_SCOPE/u);
 assert.throws(()=>Reflect.apply(reproveOriginalCurrentFootprintForwardWriterWorkflowCreateAdmission,undefined,[proxy,proxy,proxy,proxy,proxy]),/ORIGINAL_CREATE_SCOPE/u);
 const provider=createCurrentFootprintForwardWriterCompleteOpeningProvider(opening("exact"),options(allowed));
 const original=requireOriginalCurrentFootprintForwardWriterCompleteOpeningRequest(provider);assert.equal(requireOriginalCurrentFootprintForwardWriterCompleteOpeningRequest(provider),original);
 const workflow=new CurrentFootprintForwardWriterWorkflow(provider,request("exact"));assert.equal(workflow.retained()["terminal"],false);
 assert.throws(()=>new CurrentFootprintForwardWriterWorkflow(provider,request("exact")),/ORIGINAL_PROVIDER_CONSUMED/u);
 assert.equal(isOriginalCurrentFootprintForwardWriterWorkflowAdmission("footprint-forward-flow-exact"),false);assert.equal(traps,0);
});
void test("original no-allocation rejection preserves raw undefined/null failure and settles both generations without replay",async()=>{
 for(const [suffix,failure] of [["raw-undefined",undefined],["raw-null",null]] as const){
  let calls=0;const provider=createCurrentFootprintForwardWriterCompleteOpeningProvider(opening(suffix),options(async()=>{
   calls+=1;assert.equal(isOriginalCurrentFootprintForwardWriterWorkflowAdmission(`footprint-forward-flow-${suffix}`),true);
   assert.equal(isOriginalCurrentFootprintForwardWriterWorkflowAdmission("footprint-forward-flow-foreign"),false);
   await assertNoUnresolvedCurrentFootprintForwardWriterWorkflowIsolation();
   // oxlint-disable-next-line typescript/only-throw-error -- Preserve the original non-Error rejection identity.
   throw failure;
  }));
  const workflow=new CurrentFootprintForwardWriterWorkflow(provider,request(suffix));const pending=workflow.run();assert.equal(workflow.run(),pending);
  await assert.rejects(pending,(error:unknown)=>error===failure);assert.equal(workflow.retainedFailure(),failure);
  assert.equal(calls,1);assert.equal(provider.status()["factoryInvoked"],false);assert.equal(workflow.retained()["writerReleased"],true);assert.equal(workflow.retained()["savedReleased"],true);
  const history=await readCurrentFootprintForwardWriterWorkflowV2History(`footprint-forward-flow-${suffix}`);
  assert.equal(history.records.at(-1)?.kind,"terminal-failure");
  assert.equal(history.records.filter(row=>row.kind==="cleanup-result"&&row.evidence["action"]==="no-allocation").length,2);
  assert.equal(workflow.run(),pending);await assertNoUnresolvedCurrentFootprintForwardWriterWorkflowIsolation();
 }
});
void test("cleanup joins its exact pending pre-native admission while journal publication remains serialized",async()=>{
 const gate=Promise.withResolvers<null>();const entered=Promise.withResolvers<null>();const original=new Error("original-pending-admission");
 const provider=createCurrentFootprintForwardWriterCompleteOpeningProvider(opening("pending-cleanup"),options(async()=>{entered.resolve(null);await gate.promise;throw original;}));
 const workflow=new CurrentFootprintForwardWriterWorkflow(provider,request("pending-cleanup"));const running=workflow.run();
 const observed=(async():Promise<unknown>=>{try{await running;return null;}catch(error){return error;}})();await entered.promise;
 const cleanup=workflow.cleanup();assert.equal(workflow.cleanup(),cleanup);gate.resolve(null);
 await cleanup;assert.equal(await observed,original);assert.equal(workflow.retained()["terminal"],true);assert.equal(provider.status()["factoryInvoked"],false);
 const history=await readCurrentFootprintForwardWriterWorkflowV2History("footprint-forward-flow-pending-cleanup");assert.equal(history.records.at(-1)?.kind,"terminal-failure");
 assert.equal(history.records.filter(row=>row.kind==="failure").length,1);await assertNoUnresolvedCurrentFootprintForwardWriterWorkflowIsolation();
});


void test("explicit observer exit join rejects copied native owners before any pending work or helper action",()=>{
 let traps=0;const copied={};Object.setPrototypeOf(copied,CurrentFootprintForwardWriterNativeOwner.prototype);
 Object.defineProperty(copied,"releaseClosed",{get:():never=>{traps+=1;throw new Error("foreign release");}});
 // oxlint-disable-next-line typescript/unbound-method -- Invoke only via Reflect.apply to exercise the actual private-field receiver guard.
 const method=CurrentFootprintForwardWriterNativeOwner.prototype.endFootprintForwardWriterWorkflowObserversAfterTermination;
 assert.throws(()=>Reflect.apply(method,copied,[]),/FORWARD_WRITER_ORIGINAL_BIRTH/u);
 const proxy=new Proxy({}, {get:():never=>{traps+=1;throw new Error("foreign native");}});
 assert.throws(()=>Reflect.apply(method,proxy,[]),/FORWARD_WRITER_ORIGINAL_BIRTH/u);assert.equal(traps,0);
});


void test("original acknowledged no-allocation closure settles its retained publication after collision without another action",async()=>{
 const operationId="footprint-forward-flow-settle-original-close";
 const collision=join(dirname(operationPath(operationId)),operationId,"04-cleanup-result.json");let calls=0;
 const original=new Error("ORIGINAL_PRE_NATIVE_REFUSAL");
 const provider=createCurrentFootprintForwardWriterCompleteOpeningProvider(opening("settle-original-close"),options(async()=>{
  calls+=1;await writeFile(collision,"isolated-test-collision",{flag:"wx"});throw original;
 }));
 const workflow=new CurrentFootprintForwardWriterWorkflow(provider,request("settle-original-close"));const pending=workflow.run();
 await assert.rejects(pending);assert.equal(workflow.retained()["terminal"],false);assert.equal(provider.status()["released"],true);
 await unlink(collision);await workflow.settleRecords();assert.equal(workflow.retained()["terminal"],true);
 assert.equal(workflow.retained()["writerReleased"],true);assert.equal(workflow.retained()["savedReleased"],true);assert.equal(calls,1);
 assert.equal(provider.status()["factoryInvoked"],false);assert.equal(workflow.run(),pending);
 const history=await readCurrentFootprintForwardWriterWorkflowV2History(operationId);assert.equal(history.records.at(-1)?.kind,"terminal-failure");
 await assertNoUnresolvedCurrentFootprintForwardWriterWorkflowIsolation();
});


void test("generic diagnostic engine admission exempts only its actual pre-birth workflow and original opening publisher",async()=>{
 const engine=new EasyedaControlEngine({callTool:():Promise<never>=>Promise.reject(new Error("NO_LIVE_ENGINE_CALL"))});
 const entered=Promise.withResolvers<null>(),resume=Promise.withResolvers<null>();const stopped=new Error("STOP_BEFORE_CHECKPOINT_OR_NATIVE");let admissions=0;
 const admit=async():Promise<void>=>{
  admissions+=1;await engine.assertDiagnosticLaunchOtherOperationsSettled();
  if(admissions===3){
   const plan={purpose:"inert foreign blocker"};const foreign={schema:OPERATION_SCHEMA,operationId:"footprint-engine-foreign-orphan",plan,planHash:buildPlanHash(plan),state:"unknown",orphanedCallPossible:true,artifacts:[]};
   await createOperation(foreign);await assert.rejects(engine.assertDiagnosticLaunchOtherOperationsSettled(),/quarantined/u);
   foreign.state="completed";foreign.orphanedCallPossible=false;await updateOperation(foreign);
   assert.equal(await engine.assertDiagnosticLaunchOtherOperationsSettled(),true);
   entered.resolve(null);await resume.promise;throw stopped;
  }
 };
 const lifecycle=Object.freeze({...options(admit),assertOtherLaunchesSettled:admit});
 const provider=createCurrentFootprintForwardWriterCompleteOpeningProvider(opening("engine-own-publisher"),lifecycle);
 const workflow=new CurrentFootprintForwardWriterWorkflow(provider,request("engine-own-publisher"));const pending=workflow.run();
 const observed=(async():Promise<unknown>=>{try{await pending;return null;}catch(error){return error;}})();
 await entered.promise;
 await assert.rejects(engine.assertDiagnosticLaunchOtherOperationsSettled(),/before native UI edits/u);
 assert.equal(provider.status()["factoryInvoked"],false);resume.resolve(null);
 assert.equal(await observed,stopped);assert.equal(admissions,3);assert.equal(workflow.retained()["terminal"],true);
 assert.equal(provider.status()["factoryInvoked"],false);assert.equal(await engine.assertDiagnosticLaunchOtherOperationsSettled(),true);
});
