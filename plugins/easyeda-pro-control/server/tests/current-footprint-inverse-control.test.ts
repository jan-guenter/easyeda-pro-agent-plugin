/** Real strict schemas and coordinator methods, with explicitly synthetic
 * workflow boundaries in the VM. No native helper/application is allocated. */
/* oxlint-disable import/max-dependencies -- This boundary checks schemas/discovery, manager selectors, coordinator source and original-result guards together. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { setImmediate as nextTurn } from "node:timers/promises";
import { test } from "node:test";
import { types } from "node:util";
import vm from "node:vm";
import { transform } from "esbuild";
import { captureOriginalFootprintInverseManagerRequest, originalFootprintInverseManagerControl } from "../../scripts/control-session-footprint-inverse-adapter.ts";
import { sha256Text } from "../src/core.ts";
import { CurrentFootprintForwardWriterCoordinator } from "../src/current-footprint-forward-writer-coordinator.ts";
import { currentFootprintForwardWriterControlResultSchema, currentFootprintForwardWriterControlV1ResultSchema } from "../src/current-footprint-forward-writer-control-contract.ts";
import { CURRENT_FOOTPRINT_INVERSE_CONTROL_TOOL, currentFootprintInverseControlActionSchema, currentFootprintInverseControlResultSchema } from "../src/current-footprint-inverse-control-contract.ts";
import { apiRequestSchema, queryOfflineApi } from "../src/offline-api.ts";
import { facadeToolRegistered } from "../src/facade-mode.ts";
import { queryExtensionApiCoverage } from "../src/extension-api-coverage.ts";

function execute(suffix="control"):Record<string,unknown>{
 return {schema:"easyeda-pro-control.footprint-inverse-control.v1",action:"execute",operationId:`footprint-inverse-flow-${suffix}`,sourceOperationId:`footprint-forward-flow-${suffix}`,
  confirmValidationOnly:true,confirmDisposableProject:true,confirmDisposableCopiedFootprintDelete:true,confirmDeleteTriggeredPersistence:true,confirmNoExplicitSave:true,
  acceptExistingProfileEffects:true,acceptNormalOpenEffects:true,acceptDebuggerPauseEffects:true,acceptCacheInvalidationEffects:true,acceptManagerOnlyColdAbsence:true,acceptUnsupportedNativeUiTaskAbsence:true};
}
function preparation(suffix:string):object{
 const rawWindowsPath=String.raw`C:\Synthetic\inverse-control.eprj2`;
 return {action:"prepare",operationId:`footprint-forward-flow-${suffix}`,target:{rawWindowsPath,projectUuid:sha256Text(rawWindowsPath),documentUuid:"c".repeat(16),expectedSourceSha256:"d".repeat(64)},footprintUuid:"e".repeat(16),
  confirmValidationOnly:true,confirmDisposableProject:true,acceptExistingProfileEffects:true,acceptNormalOpenEffects:true,acceptDebuggerPauseEffects:true};
}
void test("separate inverse strict consent refuses caller capabilities and preserves forward result grammars",async()=>{
 const input=execute();assert.equal(currentFootprintInverseControlActionSchema.safeParse(input).success,true);
 for(const key of Object.keys(input).filter(name=>name.startsWith("confirm")||name.startsWith("accept"))){
  assert.equal(currentFootprintInverseControlActionSchema.safeParse({...input,[key]:false}).success,false);
  const missing={...input};Reflect.deleteProperty(missing,key);assert.equal(currentFootprintInverseControlActionSchema.safeParse(missing).success,false);
 }
 for(const key of ["source","checkpoint","owner","program","clock","callbacks"]){assert.equal(currentFootprintInverseControlActionSchema.safeParse({...input,[key]:{}}).success,false);}
 assert.equal(currentFootprintInverseControlActionSchema.safeParse({...input,schema:"easyeda-pro-control.footprint-inverse-control.v2"}).success,false);
 assert.equal(currentFootprintInverseControlActionSchema.safeParse({...input,sourceOperationId:"footprint-forward-flow-foreign"}).success,false);
 for(const mode of ["legacy-reviewed","calculation-only"]as const){assert.equal(facadeToolRegistered(mode,CURRENT_FOOTPRINT_INVERSE_CONTROL_TOOL),false);}
 assert.equal(facadeToolRegistered("public-utilities-only",CURRENT_FOOTPRINT_INVERSE_CONTROL_TOOL),true);
 const coordinator=new CurrentFootprintForwardWriterCoordinator(Object.freeze({pluginRoot:"/synthetic-absent",assetsRoot:"/synthetic-absent",powershellSha256:"a".repeat(64),powershellBytes:1,
  assertAllowed:()=>Promise.reject(new Error("UNUSED")),assertLocalAllowed:():void=>{
   // The real coordinator must refuse before any native allocation.
  },assertOtherLaunchesSettled:()=>Promise.reject(new Error("UNUSED"))}),preparation("control"));
 const before=coordinator.inspect();assert.equal(before.inverseAvailable,false);
 assert.equal(currentFootprintForwardWriterControlResultSchema.safeParse(before).success,true);
 assert.equal(currentFootprintForwardWriterControlV1ResultSchema.safeParse({...before,schema:"easyeda-pro-control.footprint-forward-write-operation.v1"}).success,true);
 await assert.rejects(coordinator.runInverse(input),/ORIGINAL_COMPLETED_RESULT/u);
 assert.throws(()=>coordinator.inspectInverse(),/ORIGINAL_INVERSE_CONTROL_REQUIRED/u);await coordinator.shutdownOriginal();
});
void test("offline inverse discovery and manager selectors expose no caller source or replay authority",()=>{
 const discovery=queryOfflineApi(apiRequestSchema.parse({action:"current-footprint-inverse",query:{includeSchemas:true}}));
 assert.match(JSON.stringify(discovery),/"managerOnlyColdAbsence":true/u);assert.match(JSON.stringify(discovery),/"wholeInverseVerified":false/u);
 for(const [request,valid]of [[execute(),true],[{...execute(),source:{}},false]]as const){
  const result=queryOfflineApi(apiRequestSchema.parse({action:"current-footprint-inverse-validate",query:{request}}));
  assert.match(JSON.stringify(result),new RegExp(`"valid":${String(valid)}`,"u"));assert.match(JSON.stringify(result),/"executionAuthorized":false/u);
 }
 const original=captureOriginalFootprintInverseManagerRequest(CURRENT_FOOTPRINT_INVERSE_CONTROL_TOOL,{request:execute()});assert.ok(original!==null);assert.ok(Object.isFrozen(original.request));
 assert.equal(captureOriginalFootprintInverseManagerRequest("easyeda_control_current_footprint_forward_write",{request:execute()}),null);
 assert.equal(captureOriginalFootprintInverseManagerRequest(CURRENT_FOOTPRINT_INVERSE_CONTROL_TOOL,{request:execute(),owner:{}}),null);
 assert.deepEqual(originalFootprintInverseManagerControl(original,"cleanup"),{tool:CURRENT_FOOTPRINT_INVERSE_CONTROL_TOOL,arguments:{request:{schema:"easyeda-pro-control.footprint-inverse-control.v1",action:"cleanup",operationId:original.operationId,confirmOriginalJobsOnly:true}}});
 assert.throws(()=>originalFootprintInverseManagerControl(original,"execute"));
 assert.match(JSON.stringify(queryExtensionApiCoverage({search:"lib_Footprint.delete",detail:true})),/easyeda_control_current_footprint_inverse/u);
});
/** Evaluate the actual maintained coordinator with three synthetic imported
 * workflow boundaries. Its own private fields and methods remain unchanged. */
async function fixture(failFactory=false):Promise<vm.Context>{
 const path=new URL("../src/current-footprint-forward-writer-coordinator.ts",import.meta.url),require=createRequire(path);
 const compiled=await transform(await readFile(path,"utf8"),{loader:"ts",format:"cjs",target:"node24",logLevel:"silent"});
 const context=vm.createContext({assert,Buffer,Promise,failFactory,input:execute("owned"),preparation:preparation("owned")});
 vm.runInContext(`
 globalThis.input=JSON.parse(JSON.stringify(input));globalThis.preparation=JSON.parse(JSON.stringify(preparation));
 const events=[],source=Object.freeze({profile:'private.current-footprint-forward-writer-workflow-result.v2',operationId:input.sourceOperationId,createdUuid:'a'.repeat(16),writerSqlSha256:'b'.repeat(64),savedSqlSha256:'c'.repeat(64),sourceReadSha256:'d'.repeat(64),originalClosedReadersDistinct:true,originalOwnersReleased:true,explicitSaveAttempts:0,savedResultVerified:true,inverseAvailable:false,executionAuthorized:false});
 const result=Object.freeze({profile:'private.current-footprint-inverse-full-workflow-result.v1',operationId:input.operationId,sourceOperationId:input.sourceOperationId,targetUuid:'a'.repeat(16),persistenceVerified:true,nativeManagerColdAbsenceVerified:true,selectedPreferencesUnchanged:true,originalWriterAndColdHelpersReleased:true,explicitSaveAttempts:0,nativeUiTaskAbsenceVerified:false,publicSdkParity:false,wholeInverseVerified:false,executionAuthorized:false});
 let forwardDone=false,inverseDone=false,publicationPending=false,inverseFailed=false,cleanupThrows=false;const gate=Promise.withResolvers();
 class Forward{run(){events.push('forward');forwardDone=true;return Promise.resolve(source)}cleanup(){forwardDone=true;return Promise.resolve()}settleRecords(){return Promise.resolve()}retained(){return{terminal:forwardDone,stage:'opening',writerTerminated:forwardDone,writerReleased:forwardDone,savedTerminated:forwardDone,savedReleased:forwardDone,publicationPending:false}}retainedFailure(){return null}retainedFailureCode(){return null}}
 class Inverse{run(){events.push('inverse');return gate.promise}cleanup(){events.push('cleanup');if(cleanupThrows)throw new Error('SYNTHETIC_CLEANUP_UNKNOWN');if(!inverseDone){inverseFailed=true;inverseDone=true;gate.reject(new Error('SYNTHETIC_STOP'))}return Promise.resolve()}shutdownOriginal(){events.push('shutdown');return Promise.resolve()}settleRecords(){events.push('settle');publicationPending=false;return Promise.resolve()}retained(){return{stage:'opening',terminal:inverseDone,resourcesClosed:inverseDone,publicationPending,cleanupPublicationPending:publicationPending,failed:inverseFailed}}retainedResult(){return inverseDone&&!inverseFailed?result:null}}
 globalThis.deps={forward:{CurrentFootprintForwardWriterWorkflow:Forward,requireOriginalCurrentFootprintForwardWriterWorkflowResult(value){assert.equal(value,source);return{checkpoint:{},paired:{}}}},inverse:{CurrentFootprintInverseFullWorkflow:Inverse,createCurrentFootprintInverseFullWorkflow(value,request){assert.equal(value,source);assert.equal(request.sourceOperationId,source.operationId);events.push('factory');if(failFactory)throw new Error('SYNTHETIC_FACTORY_REFUSAL');return new Inverse()},requireOriginalCurrentFootprintInverseFullWorkflowResult(value){assert.equal(value,result);return{source}}},opening:{createCurrentFootprintForwardWriterCompleteOpeningProvider(){return{}}}};
 globalThis.complete=()=>{inverseDone=true;gate.resolve(result)};globalThis.blockPublication=()=>{publicationPending=true};globalThis.throwCleanup=()=>{cleanupThrows=true};globalThis.events=events;
 `,context);
 const loaded:{exports:Record<string,unknown>}={exports:{}};
 const evaluate:unknown=vm.runInContext(`(function(require,module,exports){${compiled.code}\n})`,context);assert.ok(typeof evaluate==="function");
 // The genuine bounded capture must execute in the same realm as VM inputs;
 // Its prototype checks deliberately reject host-created plain objects.
 const clock=await transform(await readFile(new URL("../src/current-pcb-string-clock-reply.ts",import.meta.url),"utf8"),{loader:"ts",format:"cjs",target:"node24",logLevel:"silent"});
 const clockModule:{exports:Record<string,unknown>}={exports:{}};
 const clockEvaluate:unknown=vm.runInContext(`(function(require,module,exports){${clock.code}\n})`,context);assert.ok(typeof clockEvaluate==="function");
 Reflect.apply(clockEvaluate,undefined,[require,clockModule,clockModule.exports]);
 const aliases:Readonly<Record<string,string>>={"./current-footprint-forward-writer-workflow.ts":"forward","./current-footprint-inverse-full-workflow.ts":"inverse","./current-footprint-forward-writer-opening.ts":"opening"};
 Reflect.apply(evaluate,undefined,[(name:string):unknown=>{if(name==="./current-pcb-string-clock-reply.ts"){return clockModule.exports;}const selected=aliases[name];if(selected!==undefined){return vm.runInContext(`deps.${selected}`,context) as unknown;}
  // oxlint-disable-next-line import/no-dynamic-require -- Only the three explicit synthetic workflow boundaries above differ from real maintained imports.
  return require(name) as unknown;},loaded,loaded.exports]);
 context["api"]=loaded.exports;return context;
}
async function run(context:vm.Context,body:string):Promise<void>{const result:unknown=vm.runInContext(`(async()=>{${body}})()`,context);assert.ok(types.isPromise(result));await result;}
const start="globalThis.owner=new api.CurrentFootprintForwardWriterCoordinator({},preparation);await owner.run({action:'execute',operationId:input.sourceOperationId,confirmDisposableCopy:true,confirmCopyTriggeredPersistence:true,confirmNoExplicitSave:true,acceptUnsupportedInverse:true});await Promise.resolve();";
void test("real coordinator consumes one inverse before factory dispatch and retains failed original construction",async()=>{
 const context=await fixture(true);await run(context,`${start}const result=await owner.runInverse(input);assert.equal(result.execution.failed,true);assert.equal(result.execution.settled,true);assert.equal(result.state,'needs-cleanup');assert.equal(owner.originalInverseFailure().message,'SYNTHETIC_FACTORY_REFUSAL');await assert.rejects(owner.runInverse(input),/CONSUMED/);assert.equal(events.filter(x=>x==='factory').length,1);await owner.runInverse({schema:'easyeda-pro-control.footprint-inverse-control.v1',action:'cleanup',operationId:input.operationId,confirmOriginalJobsOnly:true});await owner.shutdownOriginal();assert.equal(owner.hasActiveReservation(),false);`);
});
void test("real coordinator retains original completion, publication and shutdown with false UI/parity claims",async()=>{
 const context=await fixture();await run(context,`${start}globalThis.first=await owner.runInverse(input);assert.equal(first.execution.settled,false);await assert.rejects(owner.runInverse(input),/CONSUMED/);await assert.rejects(owner.runInverse({schema:'easyeda-pro-control.footprint-inverse-control.v1',action:'inspect',operationId:'footprint-inverse-flow-foreign'}),/ORIGINAL_INVERSE_CONTROL_OPERATION/);blockPublication();complete();`);
 await nextTurn();await run(context,"assert.equal(owner.inspectInverse().cleanup.publicationPending,true);await owner.runInverse({schema:'easyeda-pro-control.footprint-inverse-control.v1',action:'settle-publication',operationId:input.operationId});");
 await nextTurn();await run(context,"const result=owner.inspectInverse();assert.equal(result.state,'completed');assert.equal(result.completed.nativeManagerColdAbsenceVerified,true);assert.equal(result.nativeUiTaskAbsenceVerified,false);assert.equal(result.publicSdkParity,false);assert.equal(result.wholeInverseVerified,false);assert.equal(owner.inspect().inverseAvailable,false);assert.equal(events.filter(x=>x==='inverse').length,1);assert.equal(events.filter(x=>x==='settle').length,1);await owner.shutdownOriginal();assert.equal(owner.hasActiveReservation(),false);globalThis.result=result;");
 const result:unknown=context["result"];assert.equal(currentFootprintInverseControlResultSchema.safeParse(result).success,true);
 assert.ok(typeof result==="object"&&result!==null);
 for(const field of ["nativeUiTaskAbsenceVerified","publicSdkParity","wholeInverseVerified"]){assert.equal(currentFootprintInverseControlResultSchema.safeParse({...result,[field]:true}).success,false);}
});
void test("real coordinator reserves cleanup before synchronous uncertainty and dispatches it once",async()=>{
 const context=await fixture();await run(context,`${start}await owner.runInverse(input);throwCleanup();await owner.runInverse({schema:'easyeda-pro-control.footprint-inverse-control.v1',action:'cleanup',operationId:input.operationId,confirmOriginalJobsOnly:true});await Promise.resolve();await owner.runInverse({schema:'easyeda-pro-control.footprint-inverse-control.v1',action:'cleanup',operationId:input.operationId,confirmOriginalJobsOnly:true});assert.equal(events.filter(x=>x==='cleanup').length,1);assert.equal(owner.inspectInverse().cleanup.failed,true);complete();`);
 await nextTurn();await run(context,"await owner.shutdownOriginal();assert.equal(events.filter(x=>x==='cleanup').length,1);");
});
