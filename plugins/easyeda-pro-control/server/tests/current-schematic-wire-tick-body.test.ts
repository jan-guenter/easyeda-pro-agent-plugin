/** Actual vendor tick and actionFinish bodies run at their original PCs.
 * Empty original listeners and inert application roots do not prove native SDK completion. */
import assert from "node:assert/strict";
import {Session} from "node:inspector/promises";
import {test} from "node:test";
import {Script,runInContext} from "node:vm";
import {Worker} from "node:worker_threads";
import {CURRENT_SCHEMATIC_WIRE_TICK_BODY_LIMIT as LIMIT,CURRENT_SCHEMATIC_WIRE_TICK_BODY_PROGRAMS as PROGRAMS,currentSchematicWireTickBodyCall,currentSchematicWireTickBodyFrame,validateCurrentSchematicWireTickBodyCommand} from "../src/current-schematic-wire-tick-body-protocol.ts";
import {CURRENT_SCHEMATIC_WIRE_TICK_BODY_SOURCE as SOURCE,qualifyCurrentSchematicWireTickBodyFunction,qualifyCurrentSchematicWireTickBodySource} from "../src/current-schematic-wire-tick-body-source.ts";
import {wireNativeFixture} from "./generated-schematic-wire-native-fixture.ts";
import {installWireOriginalRunner,wireTickBodyFixture} from "./helpers/current-schematic-wire-tick-body-fixture.ts";
import {INSTALLED_EASYEDA_SOURCE_SKIP_REASON,readConfiguredEasyedaAsset} from "./helpers/installed-easyeda-source.ts";

void test("original Wire tick body finishes and real willDidRun is held with an empty original listener roster",{timeout:300_000},async context=>{
 const variant=0;const mode="bbox-method-preparation-execution-hooks-dependencies-returns-children-prerequisites-attrs-points-data-setter-runner-tick-body";
  const source=await readConfiguredEasyedaAsset(SOURCE.relativePath);if(source===null){context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON);return;}
  const session=new Session();session.connect();await session.post("Debugger.enable");let stageScriptId="";let vendorScriptId="";let contextId=0;const key=`__wireCallbackDriver${String(variant)}${mode.replaceAll("-","")}`;const vendorUrl=`${key}Vendor.js`;
  session.on("Debugger.scriptParsed",notification=>{if(notification.params.url==="wireNativeStage-v4.js"){stageScriptId=notification.params.scriptId;contextId=notification.params.executionContextId;}if(notification.params.url===vendorUrl){vendorScriptId=notification.params.scriptId;}});
  const native=wireNativeFixture("success","v4",variant,true,mode.endsWith("-shared-source"));const vm=native.fixtureContext;const refs:unknown=runInContext(wireTickBodyFixture(source,variant),vm,{filename:vendorUrl});assert.ok(refs!==null&&typeof refs==="object");Object.defineProperty(vm,"fixtureRefs",{value:refs,configurable:true});installWireOriginalRunner(vm);
  runInContext(`globalThis.fixtureAstGetterCalls=0;fixtureRoots.shapes.shouldUpdateAst=${String(false)};fixtureRefs.monitor.onModelAttributeChange=fixtureRefs.modifyView;fixtureRoots.shapes.bboxMonitor=fixtureRefs.bbox;fixtureRefs.bbox.shapeManager=fixtureRoots.shapes;fixtureRefs.bbox.onModelAttributeChange=fixtureRefs.bboxAttribute;fixtureRefs.bbox.add=fixtureRefs.bboxAdd;fixtureRefs.bbox._nextTickPromise=null;fixtureRefs.bbox._modelMapForOnBBoxChangeAsync=new Map;fixtureRefs.bbox._modelsShouldUpdateBBox=new Map;fixtureRefs.bbox._modelTypesShouldUpdateBBox=new Set;fixtureRefs.bbox._addCore=fixtureRefs.core.forCommon;fixtureRefs.bbox._addCoreMethods=fixtureRefs.core;fixtureRefs.bbox.shouldUpdateInAsync=false;fixtureRefs.bbox._onModelsBBoxChangeAsync=new fixtureRefs.dispatcherClass({});fixtureRefs.bbox._tryAddParent=fixtureRefs.bboxTryParent;globalThis.fixtureSavedSetAdd=Set.prototype.add;globalThis.fixtureSavedMapSet=Map.prototype.set;globalThis.fixtureProtoHistoryDescriptor=Object.getOwnPropertyDescriptor(Object.prototype,"notAddHistory");globalThis.fixtureProtoWireDescriptor=Object.getOwnPropertyDescriptor(Object.prototype,"Wire");globalThis.fixtureLineParentDescriptor=Object.getOwnPropertyDescriptor(fixtureRoots.line,"parent");globalThis.fixtureLineTypeDescriptor=Object.getOwnPropertyDescriptor(fixtureRoots.line,"modelType");globalThis.fixtureSavedPromise=Promise;globalThis.fixturePromiseDescriptors=Object.getOwnPropertyDescriptors(Promise);globalThis.fixturePromiseProtoDescriptors=Object.getOwnPropertyDescriptors(Promise.prototype);globalThis.fixtureModuleGetterCalls=0;globalThis.fixtureViewGetterCalls=0;fixtureRefs.monitor.modelsMayBeShouldUpdateView=new Set;
fixtureRefs.monitor.shapeManager=fixtureRoots.shapes;fixtureRoots.shapes.modifyMonitor=fixtureRefs.monitor;Object.defineProperty(fixtureRoots.line,"points",Object.getOwnPropertyDescriptor(fixtureRefs.pointObject.prototype,"points"));globalThis.fixtureNative=Object.freeze([Object.getOwnPropertyDescriptor,Object.getOwnPropertyDescriptors,Object.getPrototypeOf,Object.is,Object.hasOwn,Reflect.ownKeys,Reflect.apply,Array.isArray,Map.prototype.get,Map.prototype.has,Map.prototype.forEach,Object.getOwnPropertyDescriptor(Map.prototype,"size").get,Set.prototype.has,Set.prototype.forEach,Object.getOwnPropertyDescriptor(Set.prototype,"size").get,Object.prototype,Array.prototype,Map.prototype,Set.prototype]);`,vm);
  runInContext("Object.setPrototypeOf(fixtureRefs.childAttributesObject,fixtureRefs.baseAttributesObject)",vm);
  runInContext("fixtureRoots.group.setLines=fixtureRefs.setLines",vm);
  const captured=await native.call("capture");assert.ok(Array.isArray(captured));const before=await native.call("preflight");assert.ok(before!==null&&typeof before==="object"&&Reflect.get(before,"ok")===true);assert.ok(stageScriptId.length>0&&vendorScriptId.length>0);session.disconnect();
  Object.defineProperty(globalThis,key,{value:vm,configurable:true});const result=Promise.withResolvers<unknown>();const worker=new Worker(new URL("helpers/current-schematic-wire-callback-driver-worker.ts",import.meta.url),{workerData:{key,vendorScriptId,contextId,targetJson:JSON.stringify(Reflect.get(vm,"target")),operationJson:JSON.stringify(Reflect.get(vm,"operation")),variant,source,mode}});
  const originalExit=Promise.withResolvers<number>();worker.once("exit",originalExit.resolve);
  context.after(async()=>{Reflect.deleteProperty(globalThis,key);await worker.terminate();});worker.on("error",result.reject);worker.on("message",(raw:unknown)=>{result.resolve(raw);});
  const raw=await result.promise;const originalWorkerExitCode=await originalExit.promise;assert.equal(originalWorkerExitCode,0,"original worker must finish its raw-reply write before teardown");context.diagnostic(JSON.stringify({schema:"test.schematic-wire-setter-worker-exit.v1",originalWorkerExitCode,writeCompletedBeforeTeardown:true}));assert.ok(raw!==null&&typeof raw==="object"&&!("error"in raw),JSON.stringify(raw));context.diagnostic(JSON.stringify(raw));
 const ledger:unknown=Reflect.get(raw,"tickBodyLedger");const events:unknown=Reflect.get(raw,"tickBodyEvents");const replies:unknown=Reflect.get(raw,"tickBodyRaw");const packet:unknown=Reflect.get(raw,"packet");
 assert.ok(Array.isArray(ledger)&&Array.isArray(events)&&Array.isArray(replies)&&packet!==null&&typeof packet==="object");
 assert.deepEqual(Reflect.get(raw,"state"),{getters:0,status:"willDidRun",asyncSize:0,next:null,listenerSize:0});
 assert.equal(Reflect.get(raw,"originalFixtureModifyPending"),true);assert.equal(Reflect.get(raw,"ownedEvents"),4);assert.equal(Reflect.get(raw,"tickBodySteps"),2);
 assert.equal(Reflect.get(packet,"schema"),"private.schematic-wire-original-tick-empty-listeners-will-did-run-held.v1");assert.equal(Reflect.get(packet,"normalRequests"),ledger.length);
 const helpers=ledger.filter(row=>row!==null&&typeof row==="object"&&Reflect.get(row,"method")==="Runtime.callFunctionOn").length;
 assert.equal(Reflect.get(packet,"helperSources"),helpers);assert.equal(replies.length,ledger.length);assert.equal(events.length,helpers+4);assert.ok(ledger.length<=LIMIT.normalMaximum&&helpers<=LIMIT.helperSourcesMaximum);
 for(const flag of["originalTickBodyReturned","originalAsyncMapClearedAndNextTickReleased","originalTickPromiseFulfilled","realOriginalWillDidRunStatusAndSuccessPayloadJoined","completeOriginalGraphsPointsBirthsScratchAndPromiseDescriptorsRecompared","tickBodyCompleted"]){assert.equal(Reflect.get(packet,flag),true);}
 for(const flag of["tickDrainVerified","historyResolversRun","didRunJoined","workerCompleted","modifyCompleted","originalNativeOwnerJoined","continuousGlobalsVerified","saveAuthorized"]){assert.equal(Reflect.get(packet,flag),false);}
 const pauses=events.filter(row=>row!==null&&typeof row==="object"&&Reflect.get(row,"method")==="Debugger.paused");assert.equal(pauses.length,2);
 const historic:unknown=Reflect.get(raw,"tickBodyBase");assert.ok(historic!==null&&typeof historic==="object");assert.equal(Reflect.get(historic,"runnerSteps"),5);
});

void test("tick continuation fixed grammar refuses arbitrary bodies and flags",()=>{
 for(const program of Object.values(PROGRAMS)){assert.doesNotThrow(()=>new Script(`(${  program  })`));}
 const call=currentSchematicWireTickBodyCall("entry","original",Array.from({length:6},()=>"original"));assert.equal(call.method,"Runtime.callFunctionOn");
 assert.throws(()=>validateCurrentSchematicWireTickBodyCommand({...call,params:{...call.params,throwOnSideEffect:false}}));
 assert.throws(()=>validateCurrentSchematicWireTickBodyCommand({...call,params:{...call.params,functionDeclaration:"function(){return true}"}}));
 assert.throws(()=>currentSchematicWireTickBodyCall("entry","original",["original"]));
 assert.equal(currentSchematicWireTickBodyFrame("[this]","original").method,"Debugger.evaluateOnCallFrame");
 assert.throws(()=>validateCurrentSchematicWireTickBodyCommand({phase:"wire-tick-body-frame",method:"Debugger.evaluateOnCallFrame",params:{expression:"arbitrary()"}}));
 assert.throws(()=>validateCurrentSchematicWireTickBodyCommand({phase:"wire-tick-body-step",method:"Debugger.stepInto",params:{}}));
});

void test("actual dispatcher metadata refuses copied source PCs and source drift",async context=>{
 const source=await readConfiguredEasyedaAsset(SOURCE.relativePath);if(source===null){context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON);return;}qualifyCurrentSchematicWireTickBodySource({scriptSource:source});
 const changed=`${source.slice(0,SOURCE.methods.dispatch.start)} ${source.slice(SOURCE.methods.dispatch.start+1)}`;assert.throws(()=>qualifyCurrentSchematicWireTickBodySource({scriptSource:changed}));
 const native=wireNativeFixture("success","v4",0,true);const vm=native.fixtureContext;const session=new Session;session.connect();await session.post("Debugger.enable");let contextId=0,scriptId="";session.on("Debugger.scriptParsed",packet=>{if(packet.params.url==="wireOriginalEmptyDispatcher.js"){scriptId=packet.params.scriptId;contextId=packet.params.executionContextId;}});
 try{const refs:unknown=runInContext(wireTickBodyFixture(source,0),vm,{filename:"wireOriginalEmptyDispatcher.js"});Object.defineProperty(vm,"fixtureRefs",{value:refs,configurable:true});assert.ok(scriptId.length>0&&contextId>0);
  const originalScriptId=scriptId;
  for(const[role,expression]of[["dispatch","fixtureRefs.dispatcherClass.prototype.dispatch"],["deliver","fixtureRefs.dispatcherBase.prototype._deliver"],["dispatcherClass","fixtureRefs.dispatcherClass"],["dispatcherBase","fixtureRefs.dispatcherBase"]]as const){
   const actual=await session.post("Runtime.evaluate",{expression,contextId,returnByValue:false});assert.equal(actual.exceptionDetails,undefined);assert.ok(actual.result.objectId!==undefined);const own=await session.post("Runtime.getProperties",{objectId:actual.result.objectId,ownProperties:true});context.diagnostic(JSON.stringify({role,actual,own}));qualifyCurrentSchematicWireTickBodyFunction(own,actual.result,0,role,originalScriptId);
   const foreign=structuredClone(own);const location=foreign.internalProperties?.find(row=>row.name==="[[FunctionLocation]]");assert.ok(location!==undefined&&location.value!==undefined);location.value.value={scriptId:"copied-source",lineNumber:SOURCE.methods[role].lineNumber,columnNumber:SOURCE.methods[role].columnNumber};assert.throws(()=>qualifyCurrentSchematicWireTickBodyFunction(foreign,actual.result,0,role,originalScriptId));
   context.diagnostic(JSON.stringify({role,actual,own,foreign,originalDispatchNotInvoked:true}));
  }assert.equal(native.counts()["actions"],0);
 }finally{session.disconnect();}
});
