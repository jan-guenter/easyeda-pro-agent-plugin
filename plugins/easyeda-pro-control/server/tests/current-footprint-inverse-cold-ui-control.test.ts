/** Actual control/continuation methods with explicit synthetic original workflow,
 * saved/cold and native-generation boundaries. No native owner or app is issued. */
/* oxlint-disable import/max-dependencies -- The control boundary joins strict discovery, same-coordinator refusal and the actual continuation with four explicit synthetic native/source boundaries. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {createRequire} from "node:module";
import {test} from "node:test";
import {types} from "node:util";
import vm from "node:vm";
import {transform} from "esbuild";
import {sha256Text} from "../src/core.ts";
import {CurrentFootprintForwardWriterCoordinator} from "../src/current-footprint-forward-writer-coordinator.ts";
import {createCurrentFootprintInverseColdUiContinuation} from "../src/current-footprint-inverse-cold-ui-continuation.ts";
import {CURRENT_FOOTPRINT_INVERSE_COLD_UI_CONTROL_TOOL,currentFootprintInverseColdUiControlActionSchema,currentFootprintInverseColdUiControlResultSchema} from "../src/current-footprint-inverse-cold-ui-control-contract.ts";
import {apiRequestSchema,queryOfflineApi} from "../src/offline-api.ts";
import {facadeToolRegistered} from "../src/facade-mode.ts";

function execute():Record<string,unknown>{return {schema:"easyeda-pro-control.footprint-inverse-cold-ui-control.v1",action:"execute",operationId:"footprint-inverse-cold-ui-flow-owned",sourceOperationId:"footprint-inverse-flow-owned",
 confirmValidationOnly:true,confirmDisposableProject:true,confirmIndependentColdUiGeneration:true,acceptExistingProfileOpeningAndCacheEffects:true,acceptDebuggerPauseEffects:true,confirmNormalCloseWithoutExplicitSave:true,acceptNoPublicSdkParity:true};}
void test("cold UI strict discovery requires separate consent and genuine completed same-coordinator inverse before allocation",async()=>{
 const input=execute();assert.equal(currentFootprintInverseColdUiControlActionSchema.safeParse(input).success,true);
 for(const key of Object.keys(input).filter(value=>value.startsWith("confirm")||value.startsWith("accept"))){const missing={...input};Reflect.deleteProperty(missing,key);assert.equal(currentFootprintInverseColdUiControlActionSchema.safeParse(missing).success,false);assert.equal(currentFootprintInverseColdUiControlActionSchema.safeParse({...input,[key]:false}).success,false);}
 for(const key of ["source","checkpoint","owner","program","clock","callbacks"]){assert.equal(currentFootprintInverseColdUiControlActionSchema.safeParse({...input,[key]:{}}).success,false);}
 assert.equal(currentFootprintInverseColdUiControlActionSchema.safeParse({...input,sourceOperationId:"footprint-inverse-flow-foreign"}).success,false);
 assert.equal(facadeToolRegistered("public-utilities-only",CURRENT_FOOTPRINT_INVERSE_COLD_UI_CONTROL_TOOL),true);assert.equal(facadeToolRegistered("legacy-reviewed",CURRENT_FOOTPRINT_INVERSE_COLD_UI_CONTROL_TOOL),false);
 const query=apiRequestSchema.parse({action:"current-footprint-inverse-cold-ui",query:{includeSchemas:true}});const discovery=queryOfflineApi(query);assert.match(JSON.stringify(discovery),/"wholeInverseVerified":false/u);
 const rawWindowsPath=String.raw`C:\Synthetic\cold-ui-inverse.eprj2`;
 const owner=new CurrentFootprintForwardWriterCoordinator(Object.freeze({pluginRoot:"/synthetic-absent",assetsRoot:"/synthetic-absent",powershellSha256:"a".repeat(64),powershellBytes:1,assertAllowed:():Promise<never>=>Promise.reject(new Error("UNUSED")),assertOtherLaunchesSettled:():Promise<never>=>Promise.reject(new Error("UNUSED")),assertLocalAllowed:():void=>{
  // No native preparation is permitted in this original-result refusal case.
 }}),{action:"prepare",operationId:"footprint-forward-flow-owned",target:{rawWindowsPath,projectUuid:sha256Text(rawWindowsPath),documentUuid:"c".repeat(16),expectedSourceSha256:"d".repeat(64)},footprintUuid:"e".repeat(16),confirmValidationOnly:true,confirmDisposableProject:true,acceptExistingProfileEffects:true,acceptNormalOpenEffects:true,acceptDebuggerPauseEffects:true});
 assert.throws(()=>owner.runInverseColdUi(input),/ORIGINAL_COMPLETED_INVERSE/u);assert.throws(()=>Reflect.apply(createCurrentFootprintInverseColdUiContinuation,undefined,[{},input]));await owner.shutdownOriginal();
});
async function fixture(mode:"success"|"factory-failure"|"journal-unknown"):Promise<vm.Context>{
 const url=new URL("../src/current-footprint-inverse-cold-ui-continuation.ts",import.meta.url);const require=createRequire(url);
 const built=await transform(await readFile(url,"utf8"),{loader:"ts",format:"cjs",target:"node24",logLevel:"silent"});const context=vm.createContext({assert,Buffer,Promise,input:execute(),mode});
 vm.runInContext(`
 globalThis.input=JSON.parse(JSON.stringify(input));const events=[],forward={},opening={},saved={},cold={};
 const source=Object.freeze({profile:'private.current-footprint-inverse-full-workflow-result.v1',operationId:input.sourceOperationId,sourceOperationId:'footprint-forward-flow-owned',targetUuid:'a'.repeat(16),persistenceVerified:true,nativeManagerColdAbsenceVerified:true,selectedPreferencesUnchanged:true,originalWriterAndColdHelpersReleased:true,explicitSaveAttempts:0,nativeUiTaskAbsenceVerified:false,publicSdkParity:false,wholeInverseVerified:false,executionAuthorized:false});
 const absence=Object.freeze({profile:'private.current-footprint-inverse-native-delete-cold-ui-absence.v1',targetUuid:source.targetUuid,maximumTicket:79,nativeManagerColdAbsenceVerified:true,originalUiTaskColdAbsenceVerified:true,originalUiInvocations:1,originalColdRootAndWholeJobExited:true,originalColdHelperReleased:true,coldGenerationClosureVerified:true,completeClosedSqlCompared:true,logicalSqlUnchangedAfterColdRead:true,replayNamespacesAbsentAtOpenFrontier:true,continuousReplayExclusion:false,publicSdkParity:false,nativeUiTaskAbsenceVerified:true,saveRequests:0,wholeInverseVerified:false,executionAuthorized:false});
 const sourceBinding={source:forward,opening,saved};const savedGeneration={originalCompletedColdGeneration(value){assert.equal(value,saved);events.push('saved-cold');return cold}};
 const gate=Promise.withResolvers();let started=false,finished=false,cleaned=false,closed=false,repairAllowed=false,unknown=mode==='journal-unknown';
 class NativeGeneration{
  start(){events.push('start');assert.equal(started,false);started=true;return unknown?Promise.reject(new Error('SYNTHETIC_CREATE_UNKNOWN')):gate.promise}
  cleanup(){events.push('cutoff');cleaned=true;if(unknown)throw new Error('SYNTHETIC_JOURNAL_UNREADABLE');closed=true;if(!finished)gate.reject(new Error('SYNTHETIC_STOP'));return Promise.resolve()}
  settlePublication(){events.push('settle');if(unknown&&!repairAllowed)throw new Error('SYNTHETIC_UNKNOWN_REPAIR');unknown=false;return Promise.resolve()}
  retained(){return{started,cleaned,ownerRetained:mode!=='journal-unknown',terminated:closed,released:closed,helperClosed:closed}}
  originalControlState(){return{stage:'read',publicationPending:false,journalTerminal:!unknown&&(finished||cleaned),journalUnsettled:unknown||!finished&&!cleaned}}
  originalResult(value){assert.equal(value,absence);assert.equal(finished&&closed,true);return{owner:this,absence}}
 }
 Object.freeze(NativeGeneration.prototype);Object.freeze(NativeGeneration);
 const inverse={requireOriginalCurrentFootprintInverseFullWorkflowResult(value){assert.equal(value,source);return sourceBinding}};
 const nativeOpening={requireOriginalCurrentFootprintInverseFullNativeOpeningResult(value){assert.equal(value,opening);return{saved:savedGeneration}}};
 const savedModule={requireOriginalCurrentFootprintInverseNativeDeleteSavedColdGeneration(value){assert.equal(value,saved);events.push('saved-token');return cold}};
 const generationModule={CurrentFootprintInverseNativeDeleteColdUiGeneration:NativeGeneration,createCurrentFootprintInverseNativeDeleteColdUiAfterColdGeneration(value){assert.equal(value,cold);events.push('factory');if(mode==='factory-failure')throw new Error('SYNTHETIC_FACTORY');return new NativeGeneration()}};
 globalThis.deps={inverse,nativeOpening,savedModule,generationModule};globalThis.source=source;globalThis.events=events;globalThis.complete=()=>{closed=true;finished=true;gate.resolve(absence)};globalThis.permitRepair=()=>{repairAllowed=true};
 `,context);
 const loaded:{exports:Record<string,unknown>}={exports:{}};const evaluate:unknown=vm.runInContext(`(function(require,module,exports){${built.code}\n})`,context);assert.ok(typeof evaluate==="function");
 const clock=await transform(await readFile(new URL("../src/current-pcb-string-clock-reply.ts",import.meta.url),"utf8"),{loader:"ts",format:"cjs",target:"node24",logLevel:"silent"});const clockModule:{exports:Record<string,unknown>}={exports:{}};
 const clockEvaluate:unknown=vm.runInContext(`(function(require,module,exports){${clock.code}\n})`,context);assert.ok(typeof clockEvaluate==="function");Reflect.apply(clockEvaluate,undefined,[require,clockModule,clockModule.exports]);
 const aliases:Readonly<Record<string,string>>={"./current-footprint-inverse-full-workflow.ts":"inverse","./current-footprint-inverse-full-native-generation.ts":"nativeOpening","./current-footprint-inverse-native-delete-saved-generation.ts":"savedModule","./current-footprint-inverse-native-delete-cold-ui-generation.ts":"generationModule"};
 Reflect.apply(evaluate,undefined,[(name:string):unknown=>{if(name==="./current-pcb-string-clock-reply.ts"){return clockModule.exports;}const selected=aliases[name];if(selected!==undefined){return vm.runInContext(`deps.${selected}`,context) as unknown;}
  // oxlint-disable-next-line import/no-dynamic-require -- Four explicit original source/native boundaries above; all schema, capture and receiver guards remain maintained code.
  return require(name) as unknown;},loaded,loaded.exports]);context["api"]=loaded.exports;return context;
}
async function run(context:vm.Context,body:string):Promise<void>{const pending:unknown=vm.runInContext(`(async()=>{${body}})()`,context);assert.ok(types.isPromise(pending));await pending;}
const start="globalThis.owner=api.createCurrentFootprintInverseColdUiContinuation(source,input);globalThis.first=await owner.run(input);";
void test("actual continuation follows original saved/cold factory once and retains separate completion and immutable inverse V1",async()=>{
 const context=await fixture("success");await run(context,`${start}assert.equal(first.state,'running');assert.equal(events.join(','),'saved-token,saved-cold,factory,start');assert.throws(()=>owner.run(input),/CONSUMED/);assert.throws(()=>api.createCurrentFootprintInverseColdUiContinuation(source,input),/SOURCE_CONSUMED/);assert.throws(()=>api.createCurrentFootprintInverseColdUiContinuation({...source},input));complete();for(let i=0;i<32&&!owner.inspect().execution.settled;i++)await Promise.resolve();const result=owner.inspect();assert.equal(result.state,'completed');assert.equal(result.originalInverse.nativeUiTaskAbsenceVerified,false);assert.equal(result.nativeUiTaskAbsenceVerified,true);assert.equal(result.publicSdkParity,false);assert.equal(result.wholeInverseVerified,false);assert.equal(result.coldUiAbsence.continuousReplayExclusion,false);globalThis.result=result;const stop=owner.shutdownOriginal();assert.equal(owner.shutdownOriginal(),stop);await stop;assert.equal(owner.hasActiveReservation(),false);assert.equal(events.filter(x=>x==='factory').length,1);assert.equal(events.filter(x=>x==='cutoff').length,1);`);
 assert.equal(currentFootprintInverseColdUiControlResultSchema.safeParse(context["result"]).success,true);
});
void test("actual continuation consumes failed factory and closes only its retained no-resource attempt",async()=>{
 const context=await fixture("factory-failure");await run(context,`${start}for(let i=0;i<32&&!owner.inspect().execution.settled;i++)await Promise.resolve();assert.equal(owner.inspect().execution.failed,true);assert.throws(()=>owner.run(input),/CONSUMED/);assert.equal(events.filter(x=>x==='factory').length,1);await owner.cleanup();assert.equal(owner.hasActiveReservation(),false);await owner.shutdownOriginal();assert.equal(events.includes('start'),false);assert.equal(events.includes('cutoff'),false);`);
});
void test("actual continuation retains unknown original journal after resource-free cleanup until exact publication repair",async()=>{
 const context=await fixture("journal-unknown");await run(context,`${start}for(let i=0;i<32&&!owner.inspect().execution.settled;i++)await Promise.resolve();const cleanup=owner.cleanup();assert.equal(events.at(-1),'cutoff');assert.equal(owner.cleanup(),cleanup);await assert.rejects(cleanup,/JOURNAL_UNREADABLE/);for(let i=0;i<32&&!owner.inspect().cleanup.settled;i++)await Promise.resolve();const held=owner.inspect();assert.equal(held.cleanup.originalResourcesClosed,true);assert.equal(held.cleanup.publicationPending,false);assert.equal(held.cleanup.journalUnsettled,true);assert.equal(held.state,'needs-cleanup');assert.equal(owner.hasActiveReservation(),true);await assert.rejects(owner.settleRecords(),/UNKNOWN_REPAIR/);assert.equal(owner.hasActiveReservation(),true);permitRepair();await owner.settleRecords();assert.equal(owner.inspect().cleanup.journalUnsettled,false);assert.equal(owner.hasActiveReservation(),false);await owner.shutdownOriginal();assert.equal(events.filter(x=>x==='start').length,1);assert.equal(events.filter(x=>x==='cutoff').length,1);`);
});

void test("cold UI factory consumes an original source only after valid paired construction",async()=>{
 const context=await fixture("success");await run(context,[
  "const other={...input,operationId:'footprint-inverse-cold-ui-flow-foreign',sourceOperationId:'footprint-inverse-flow-foreign'};",
  "assert.throws(()=>api.createCurrentFootprintInverseColdUiContinuation(source,other),/ORIGINAL_SOURCE_OPERATION/);",
  "const continuation=api.createCurrentFootprintInverseColdUiContinuation(source,input);",
  "assert.throws(()=>api.createCurrentFootprintInverseColdUiContinuation(source,input),/SOURCE_CONSUMED/);",
  "assert.equal(events.length,0);await continuation.shutdownOriginal();assert.equal(continuation.hasActiveReservation(),false);",
 ].join("\n"));
});
