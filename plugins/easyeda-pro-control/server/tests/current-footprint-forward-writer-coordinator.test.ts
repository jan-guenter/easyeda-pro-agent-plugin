/** Controlled facade composition with real managed publication and original
 * pre-native refusal only. No native owner/helper/Job/application is allocated. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { setImmediate as nextTurn } from "node:timers/promises";
import { isRecord, sha256Text } from "../src/core.ts";
import { issueCurrentPcbDiagnosticNativeRefusal } from "../src/current-pcb-diagnostic-native-refusal.ts";
import { CurrentFootprintForwardWriterCoordinator } from "../src/current-footprint-forward-writer-coordinator.ts";
import { CURRENT_FOOTPRINT_FORWARD_WRITER_CONTROL_TOOL, currentFootprintForwardWriterControlActionSchema, currentFootprintForwardWriterControlResultSchema, currentFootprintForwardWriterControlV1ResultSchema } from "../src/current-footprint-forward-writer-control-contract.ts";
import type { CurrentPcbDiagnosticLifecycleOptions } from "../src/current-pcb-diagnostic-lifecycle.ts";
import { assertNoUnresolvedCurrentPcbDiagnosticLaunches } from "../src/current-pcb-diagnostic-lifecycle-journal.ts";
import { facadeToolRegistered } from "../src/facade-mode.ts";
// oxlint-disable-next-line import/max-dependencies -- This integration test needs both the original native error issuer and the separate actual MCP callback fixture.
import { forwardWriterCallbackFixture } from "./helpers/current-footprint-forward-writer-callback-fixture.ts";

function prepare(suffix:string):Readonly<Record<string,unknown>>{
 const rawWindowsPath=String.raw`C:\Synthetic\controlled-footprint.eprj2`;
 return {action:"prepare",operationId:`footprint-forward-flow-${suffix}`,target:{rawWindowsPath,projectUuid:sha256Text(rawWindowsPath),documentUuid:"c".repeat(16),expectedSourceSha256:"d".repeat(64)},footprintUuid:"e".repeat(16),
  confirmValidationOnly:true,confirmDisposableProject:true,acceptExistingProfileEffects:true,acceptNormalOpenEffects:true,acceptDebuggerPauseEffects:true};
}
function execute(operationId:string):Readonly<Record<string,unknown>>{return{action:"execute",operationId,confirmDisposableCopy:true,confirmCopyTriggeredPersistence:true,confirmNoExplicitSave:true,acceptUnsupportedInverse:true};}
function options(allowed:()=>Promise<void>):CurrentPcbDiagnosticLifecycleOptions{
 return Object.freeze({pluginRoot:"/synthetic-missing-plugin",assetsRoot:"/synthetic-missing-assets",powershellSha256:"a".repeat(64),powershellBytes:1,
  assertAllowed:allowed,assertLocalAllowed:():void=>{
   // No native or filesystem authority is issued by this local test guard.
  },assertOtherLaunchesSettled:allowed});
}
void test("strict controlled footprint family preserves confirmations, original flow IDs and mode scope",()=>{
 const request=prepare("contract");assert.equal(currentFootprintForwardWriterControlActionSchema.parse(request).action,"prepare");
 for(const key of ["confirmValidationOnly","confirmDisposableProject","acceptExistingProfileEffects","acceptNormalOpenEffects","acceptDebuggerPauseEffects"]){
  assert.equal(currentFootprintForwardWriterControlActionSchema.safeParse({...request,[key]:false}).success,false);
 }
 const start=execute("footprint-forward-flow-contract");for(const key of ["confirmDisposableCopy","confirmCopyTriggeredPersistence","confirmNoExplicitSave","acceptUnsupportedInverse"]){assert.equal(currentFootprintForwardWriterControlActionSchema.safeParse({...start,[key]:false}).success,false);}
 assert.equal(currentFootprintForwardWriterControlActionSchema.safeParse({...start,code:"anything"}).success,false);
 assert.equal(currentFootprintForwardWriterControlActionSchema.safeParse({action:"cleanup",operationId:start["operationId"],confirmOriginalJobsOnly:false}).success,false);
 assert.equal(currentFootprintForwardWriterControlActionSchema.safeParse({...request,operationId:`footprint-forward-flow-${"a".repeat(74)}`}).success,false);
 assert.equal(facadeToolRegistered("public-utilities-only",CURRENT_FOOTPRINT_FORWARD_WRITER_CONTROL_TOOL),true);
 assert.equal(facadeToolRegistered("legacy-reviewed",CURRENT_FOOTPRINT_FORWARD_WRITER_CONTROL_TOOL),false);
 assert.equal(facadeToolRegistered("calculation-only",CURRENT_FOOTPRINT_FORWARD_WRITER_CONTROL_TOOL),false);
});
void test("execute and cleanup return promptly with original pending work, while replay and competing operations refuse",async()=>{
 const entered=Promise.withResolvers<null>();const gate=Promise.withResolvers<null>();let admissions=0;
 const coordinator=new CurrentFootprintForwardWriterCoordinator(options(async()=>{admissions+=1;entered.resolve(null);await gate.promise;throw issueCurrentPcbDiagnosticNativeRefusal("pcb-diagnostic-launch-approval");}),prepare("prompt"));
 const operationId="footprint-forward-flow-prompt";assert.equal(coordinator.inspect().state,"prepared");assert.equal(coordinator.hasActiveReservation(),true);
 const result=await coordinator.run(execute(operationId));assert.equal(result.state,"running");assert.equal(result.connectedValidation,false);assert.equal(result.explicitSaveAttempts,0);
 await entered.promise;await assert.rejects(coordinator.run(execute(operationId)),/EXECUTE_CONSUMED/u);
 await assert.rejects(coordinator.run({action:"inspect",operationId:"footprint-forward-flow-foreign"}),/ORIGINAL_OPERATION/u);
 await assert.rejects(assertNoUnresolvedCurrentPcbDiagnosticLaunches(),/UNRESOLVED_OTHER_WORKFLOW/u);
 const cleanup=await coordinator.run({action:"cleanup",operationId,confirmOriginalJobsOnly:true});assert.equal(cleanup.cleanup.requested,true);
 gate.resolve(null);await coordinator.shutdownOriginal();assert.equal(admissions,1);assert.equal(coordinator.hasActiveReservation(),false);
 const stopped=coordinator.inspect();assert.equal(stopped.state,"stopped");assert.equal(stopped.execution.failed,true);assert.equal(stopped.cleanup.writerReleased,true);assert.equal(stopped.cleanup.savedReleased,true);
 assert.equal(stopped.diagnostic.code,"PCB_DIAGNOSTIC_LAUNCH_APPROVAL");assert.equal(stopped.ordinaryProjectsSupported,false);
 await assertNoUnresolvedCurrentPcbDiagnosticLaunches();
});
void test("cleanup before execute closes only original local preparation and burns later execution",async()=>{
 let admissions=0;const coordinator=new CurrentFootprintForwardWriterCoordinator(options(()=>{admissions+=1;return Promise.reject(new Error("unused"));}),prepare("before-execute"));
 const operationId="footprint-forward-flow-before-execute";await coordinator.run({action:"cleanup",operationId,confirmOriginalJobsOnly:true});await coordinator.shutdownOriginal();
 assert.equal(admissions,0);assert.equal(coordinator.inspect().state,"stopped");assert.equal(coordinator.hasActiveReservation(),false);
 await assert.rejects(coordinator.run(execute(operationId)),/EXECUTE_CONSUMED/u);
});

/** Fixed historical wire values, independent of both current emitters and
 * schema fields. Do not generate one fixture from the other or a V2 result. */
void test("fixed historical prepared and completed V1 results retain their released grammar",()=>{
 const prepared={
  schema:"easyeda-pro-control.footprint-forward-write-operation.v1",action:"prepare",operationId:"footprint-forward-flow-historical-prepared",
  state:"prepared",stage:"opening",
  execution:{attempted:false,settled:false,failed:false},
  cleanup:{requested:false,settled:false,failed:false,writerTerminated:false,writerReleased:false,savedTerminated:false,savedReleased:false,publicationPending:false},
  diagnostic:{originalFailureRetained:false,code:null},completed:null,
  validationOnly:true,connectedValidation:false,ordinaryProjectsSupported:false,generalSdkWriter:false,inverseAvailable:false,explicitSaveAttempts:0,
 };
 const completed={
  schema:"easyeda-pro-control.footprint-forward-write-operation.v1",action:"inspect",operationId:"footprint-forward-flow-historical-completed",
  state:"completed",stage:"saved-checkpoint",
  execution:{attempted:true,settled:true,failed:false},
  cleanup:{requested:false,settled:false,failed:false,writerTerminated:true,writerReleased:true,savedTerminated:true,savedReleased:true,publicationPending:false},
  diagnostic:{originalFailureRetained:false,code:null},
  completed:{
   profile:"private.current-footprint-forward-writer-workflow-result.v1",operationId:"footprint-forward-flow-historical-completed",createdUuid:"0123456789abcdef",
   writerSqlSha256:"1111111111111111111111111111111111111111111111111111111111111111",
   savedSqlSha256:"2222222222222222222222222222222222222222222222222222222222222222",
   sourceReadSha256:"3333333333333333333333333333333333333333333333333333333333333333",
   originalClosedReadersDistinct:true,originalOwnersReleased:true,explicitSaveAttempts:0,savedResultVerified:true,inverseAvailable:false,executionAuthorized:false,
  },
  validationOnly:true,connectedValidation:false,ordinaryProjectsSupported:false,generalSdkWriter:false,inverseAvailable:false,explicitSaveAttempts:0,
 };
 for(const historical of [prepared,completed]){
  assert.deepEqual(currentFootprintForwardWriterControlV1ResultSchema.parse(historical),historical);
  assert.equal(currentFootprintForwardWriterControlResultSchema.safeParse(historical).success,false);
 }
});

void test("current controlled results remain distinct from the immutable historical V1 result grammar",()=>{
 const coordinator=new CurrentFootprintForwardWriterCoordinator(options(()=>Promise.reject(new Error("must remain inert"))),prepare("versioned-result"));
 const current=coordinator.inspect();assert.equal(current.schema,"easyeda-pro-control.footprint-forward-write-operation.v2");
 assert.equal(currentFootprintForwardWriterControlV1ResultSchema.safeParse(current).success,false);
 assert.equal(currentFootprintForwardWriterControlResultSchema.safeParse({...current,state:"completed"}).success,false);
});

/** Actual SDK parsing/registered index/default provider, with absent private
 * assets and no execute/native/start/status/upstream invocation. */
void test("actual MCP callback normalizes strict input without consuming local preparation",{timeout:30_000},async context=>{
 const operationId="footprint-forward-flow-mcp-callback",request=prepare("mcp-callback");const fixture=await forwardWriterCallbackFixture(context,operationId);
 await fixture.malformed(request);
 await fixture.malformed({request:{...request,confirmValidationOnly:"true"}});
 await fixture.malformed({request:{...request,code:"never accepted"}});
 const preparedReply=await fixture.control(request);assert.notEqual(preparedReply.isError,true);const preparedContent=preparedReply.structuredContent;assert.ok(isRecord(preparedContent));const prepared=currentFootprintForwardWriterControlResultSchema.parse(preparedContent["result"]);
 assert.equal(prepared.action,"prepare");assert.equal(prepared.operationId,operationId);assert.equal(prepared.state,"prepared");assert.equal(prepared.execution.attempted,false);assert.equal(prepared.cleanup.requested,false);assert.equal(prepared.connectedValidation,false);
 await fixture.malformed({request:{...execute(operationId),confirmNoExplicitSave:false}});
 await fixture.malformed({request:{action:"cleanup",operationId,confirmOriginalJobsOnly:false}});
 const inspectedReply=await fixture.control({action:"inspect",operationId});assert.notEqual(inspectedReply.isError,true);const inspectedContent=inspectedReply.structuredContent;assert.ok(isRecord(inspectedContent));const inspected=currentFootprintForwardWriterControlResultSchema.parse(inspectedContent["result"]);
 assert.equal(inspected.state,"prepared");assert.equal(inspected.execution.attempted,false);assert.equal(inspected.cleanup.requested,false);
 const cleanupReply=await fixture.cleanup();assert.notEqual(cleanupReply.isError,true);
 const stoppedReply=await fixture.control({action:"inspect",operationId});const stoppedContent=stoppedReply.structuredContent;assert.ok(isRecord(stoppedContent));let stopped=currentFootprintForwardWriterControlResultSchema.parse(stoppedContent["result"]);
 for(let attempt=0;attempt<30&&stopped.state!=="stopped";attempt+=1){await nextTurn();const observed=await fixture.control({action:"inspect",operationId});const observedContent=observed.structuredContent;assert.ok(isRecord(observedContent));stopped=currentFootprintForwardWriterControlResultSchema.parse(observedContent["result"]);}
 assert.equal(stopped.state,"stopped");assert.equal(stopped.execution.attempted,false);assert.equal(stopped.cleanup.requested,true);assert.equal(stopped.explicitSaveAttempts,0);await fixture.assertOffline();await fixture.close();
});
