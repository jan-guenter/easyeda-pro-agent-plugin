/** Actual vendor tick and actionFinish bodies run at their original PCs.
 * Empty original listeners and inert application roots do not prove native SDK completion. */
import assert from "node:assert/strict";
import {Session} from "node:inspector/promises";
import {test} from "node:test";
import {Script,runInContext} from "node:vm";
import {CURRENT_SCHEMATIC_WIRE_ACTION_COMPLETE_LIMIT as LIMIT,CURRENT_SCHEMATIC_WIRE_ACTION_COMPLETE_PROGRAMS as PROGRAMS,currentSchematicWireActionCompleteCall,validateCurrentSchematicWireActionCompleteCommand} from "../src/current-schematic-wire-action-complete-protocol.ts";
import {CURRENT_SCHEMATIC_WIRE_ACTION_COMPLETE_SOURCE as SOURCE,qualifyCurrentSchematicWireActionCompleteFunction,qualifyCurrentSchematicWireActionCompleteSource,requireCurrentSchematicWireActionCompleteEmptyEntries} from "../src/current-schematic-wire-action-complete-source.ts";
import {wireNativeFixture} from "./generated-schematic-wire-native-fixture.ts";
import {installWireOriginalCompletionRoots,installWireOriginalRunner,wireActionCompleteFixture} from "./helpers/current-schematic-wire-action-complete-fixture.ts";
import {runWireContinuationFixture} from "./helpers/current-schematic-wire-continuation-fixture.ts";
import {INSTALLED_EASYEDA_SOURCE_SKIP_REASON,readConfiguredEasyedaAsset} from "./helpers/installed-easyeda-source.ts";

void test("original Wire action and retained Promises complete before writer postconditions with empty original rosters",{timeout:300_000},async context=>{
 const source=await readConfiguredEasyedaAsset(SOURCE.relativePath);if(source===null){context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON);return;}
 const raw=await runWireContinuationFixture(context,source,{ fixture: wireActionCompleteFixture, completion: "held" });
 const ledger:unknown=Reflect.get(raw,"completeLedger");const events:unknown=Reflect.get(raw,"completeEvents");const replies:unknown=Reflect.get(raw,"completeRaw");const packet:unknown=Reflect.get(raw,"packet");
 assert.ok(Array.isArray(ledger)&&Array.isArray(events)&&Array.isArray(replies)&&packet!==null&&typeof packet==="object");
 assert.deepEqual(Reflect.get(raw,"state"),{getters:0,current:null,compilerKeys:0,locker:0,paused:false,timer:-1,didRunListeners:0});
 assert.equal(Reflect.get(raw,"originalFixtureModifyPending"),true);assert.equal(Reflect.get(raw,"ownedEvents"),1);assert.equal(Reflect.get(raw,"completeSteps"),5);
 assert.equal(Reflect.get(packet,"schema"),"private.schematic-wire-original-empty-roster-action-complete-held.v1");assert.equal(Reflect.get(packet,"normalRequests"),ledger.length);
 const helpers=ledger.filter(row=>row!==null&&typeof row==="object"&&Reflect.get(row,"method")==="Runtime.callFunctionOn").length;
 assert.equal(Reflect.get(packet,"helperSources"),helpers);assert.equal(replies.length,ledger.length);assert.equal(events.length,helpers+10);assert.ok(ledger.length<=LIMIT.normalMaximum&&helpers<=LIMIT.helperSourcesMaximum);
 for(const flag of["actualOriginalActionFinishAndDidRunCompleted","originalCurrentActionReleased","originalImmediateConsistencyResumeCompleted","originalHelperAndRunPromisesFulfilled","originalRunResultTrue","originalWriterPostAwaitStillHeld","completeOriginalGraphsPointsBirthsScratchAndPromisesRecompared"]){assert.equal(Reflect.get(packet,flag),true);}
 for(const flag of["nativeTimersScheduled","nativeIteratorBirthObserved","tickDrainVerified","writerPostconditionsRun","workerCompleted","modifyCompleted","originalNativeOwnerJoined","continuousGlobalsVerified","saveAuthorized"]){assert.equal(Reflect.get(packet,flag),false);}
 const pauses=events.filter(row=>row!==null&&typeof row==="object"&&Reflect.get(row,"method")==="Debugger.paused");assert.equal(pauses.length,5);
 const historic:unknown=Reflect.get(raw,"completeBase");assert.ok(historic!==null&&typeof historic==="object");const previous:unknown=Reflect.get(historic,"tickBodyPacket");assert.ok(previous!==null&&typeof previous==="object");assert.equal(Reflect.get(previous,"schema"),"private.schematic-wire-original-tick-empty-listeners-will-did-run-held.v1");assert.equal(Reflect.get(previous,"didRunJoined"),false);
});

void test("completion grammar keeps original fixed strings flags and bounds",()=>{
 for(const body of Object.values(PROGRAMS)){assert.doesNotThrow(()=>new Script(`(${body})`));assert.ok(body.length<=16_384);}
 const internal={result:[{name:"length",value:{type:"number",value:0,description:"0"},writable:true,configurable:false,enumerable:false,isOwn:true}]};assert.doesNotThrow(()=>{requireCurrentSchematicWireActionCompleteEmptyEntries(internal);});
 assert.throws(()=>{requireCurrentSchematicWireActionCompleteEmptyEntries({...internal,internalProperties:[{name:"[[Prototype]]",value:{type:"object",subtype:"array",objectId:"invented"}}]});});assert.throws(()=>{requireCurrentSchematicWireActionCompleteEmptyEntries({...internal,result:[{...internal.result[0],value:{type:"number",value:1,description:"1"}}]});});
 const command=currentSchematicWireActionCompleteCall("before","original",Array.from({length:7},()=>"original"));assert.equal(command.method,"Runtime.callFunctionOn");
 assert.throws(()=>validateCurrentSchematicWireActionCompleteCommand({...command,params:{...command.params,throwOnSideEffect:false}}));
 assert.throws(()=>validateCurrentSchematicWireActionCompleteCommand({...command,params:{...command.params,functionDeclaration:"function(){return true}"}}));
 assert.throws(()=>currentSchematicWireActionCompleteCall("before","original",["original"]));
 assert.throws(()=>validateCurrentSchematicWireActionCompleteCommand({phase:"wire-action-complete-step",method:"Debugger.stepInto",params:{}}));
});

void test("original completion class generator setter and callback metadata refuses copied PCs",async context=>{
 const source=await readConfiguredEasyedaAsset(SOURCE.relativePath);if(source===null){context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON);return;}qualifyCurrentSchematicWireActionCompleteSource({scriptSource:source});
 const changed=`${source.slice(0,SOURCE.methods.timerCancel.start)} ${source.slice(SOURCE.methods.timerCancel.start+1)}`;assert.throws(()=>qualifyCurrentSchematicWireActionCompleteSource({scriptSource:changed}));
 const native=wireNativeFixture("success","v4",0,true);const vm=native.fixtureContext;const session=new Session;session.connect();await session.post("Debugger.enable");let contextId=0,scriptId="";
 session.on("Debugger.scriptParsed",packet=>{if(packet.params.url==="wireOriginalCompletionMetadata.js"){scriptId=packet.params.scriptId;contextId=packet.params.executionContextId;}});
 try{const refs:unknown=runInContext(wireActionCompleteFixture(source,0),vm,{filename:"wireOriginalCompletionMetadata.js"});Object.defineProperty(vm,"fixtureRefs",{value:refs,configurable:true});installWireOriginalRunner(vm);installWireOriginalCompletionRoots(vm);assert.ok(scriptId.length>0&&contextId>0);const originalScriptId=scriptId;
  const expressions=[["collectionClass","fixtureCompletionClasses[0]"],["timerClass","fixtureCompletionClasses[1]"],["channelClass","fixtureCompletionClasses[2]"],["pausedChannelClass","fixtureCompletionClasses[3]"],["consistencyClass","fixtureCompletionClasses[4]"],["debounceFactory","fixtureRefs.completionDebounceFactory"],["collectionIterator","fixtureCompletionClasses[0].prototype[Symbol.iterator]"],["timerCancel","fixtureCompletionClasses[1].prototype.cancel"],["timerExist","fixtureCompletionClasses[1].prototype.exist"],["channelResume","fixtureCompletionClasses[2].prototype.resume"],["channelPublish","fixtureCompletionClasses[2].prototype.publish"],["channelPause","fixtureCompletionClasses[2].prototype.pause"],["pausedChannelResume","fixtureCompletionClasses[3].prototype.resume"],["pausedChannelPause","fixtureCompletionClasses[3].prototype.pause"],["consistencyPause","fixtureCompletionClasses[4].prototype.tryPause"],["setImmediate","fixtureCompletionClasses[4].prototype.setImmediateTryResume"],["immediateResume","fixtureOriginalRunner.consistencyResumePauseImpl.tryResume"],["currentActionSet","Object.getOwnPropertyDescriptor(fixtureRefs.runnerClass.prototype,'currentAction').set"]]as const;
  for(const[role,expression]of expressions){const actual=await session.post("Runtime.evaluate",{expression,contextId,returnByValue:false});assert.equal(actual.exceptionDetails,undefined);assert.ok(actual.result.objectId!==undefined);const own=await session.post("Runtime.getProperties",{objectId:actual.result.objectId,ownProperties:true});qualifyCurrentSchematicWireActionCompleteFunction(own,actual.result,role,originalScriptId);
   const copied=structuredClone(own);const location=copied.internalProperties?.find(row=>row.name==="[[FunctionLocation]]");assert.ok(location!==undefined&&location.value!==undefined);location.value.value={scriptId:"copied-source",lineNumber:SOURCE.methods[role].lineNumber,columnNumber:SOURCE.methods[role].columnNumber};assert.throws(()=>qualifyCurrentSchematicWireActionCompleteFunction(copied,actual.result,role,originalScriptId));context.diagnostic(JSON.stringify({role,actual,own,copied,originalActionNotRun:true}));
  }assert.equal(native.counts()["actions"],0);
 }finally{session.disconnect();}
});
