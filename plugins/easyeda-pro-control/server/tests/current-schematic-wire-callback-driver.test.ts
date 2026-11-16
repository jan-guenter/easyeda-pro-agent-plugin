/** Actual fixed stage/callback and exact installed vendor spans in inert VMs.
 * Source data, stand-in app roots and teardown grant no native Modify proof. */
import assert from "node:assert/strict";
import {Session} from "node:inspector/promises";
import {test} from "node:test";
import {runInContext} from "node:vm";
import {Worker} from "node:worker_threads";
import {CURRENT_SCHEMATIC_WIRE_CALLBACK_DRIVER_REQUESTS as LIMIT,validateCurrentSchematicWireCallbackDriverCommand as validate} from "../src/current-schematic-wire-callback-driver-protocol.ts";
import {CURRENT_SCHEMATIC_WIRE_TRANSITION_SOURCE as SOURCE} from "../src/current-schematic-wire-transition-source.ts";
import {wireNativeFixture} from "./generated-schematic-wire-native-fixture.ts";
import {wireTransitionFixture} from "./helpers/current-schematic-wire-transition-fixture.ts";
import {INSTALLED_EASYEDA_SOURCE_SKIP_REASON,readConfiguredEasyedaAsset} from "./helpers/installed-easyeda-source.ts";

for(const[variant,mode]of[[0,"coalesced"],
[1,"coalesced"],
[0,"bad-stage"],
[0,"ast-view"],
[1,"ast-view"],
[0,"ast-accessor"],
[0,"ast-foreign-view"],
[0,"view-bbox"],
[1,"view-existing"],
[0,"view-weak-add"],
[0,"view-point-getter"],
[0,"view-foreign-member"],
[0,"view-collateral"],
[0,"bbox-add"],
[1,"bbox-add"],
[0,"bbox-module-getter"],
[0,"bbox-points-getter"],
[0,"bbox-next-getter"],
[0,"bbox-foreign-add"],
[0,"bbox-common"],
[1,"bbox-common"],
[0,"bbox-promise-getter"],
[0,"bbox-resolve-reject"],
[0,"bbox-species-getter"],
[0,"bbox-constructor-getter"],
[0,"bbox-foreign-common"],
[0,"bbox-parent"],
[1,"bbox-parent-existing"],
[0,"bbox-weak-set"],
[0,"bbox-weak-map"],
[0,"bbox-type-getter"],
[0,"bbox-map-foreign"],
[0,"bbox-map-collateral"],
[0,"bbox-parent-getter"],
[0,"bbox-foreign-parent"],
[0,"bbox-inherited"],
[1,"bbox-inherited"],
[0,"bbox-inherited-foreign"],
[0,"bbox-inherited-backing-getter"],
[0,"bbox-inherited-shadow"],
[0,"bbox-inherited-drift"],
[0,"bbox-branch-absent"],
[1,"bbox-branch-absent"],
[0,"bbox-branch-present"],
[1,"bbox-branch-present"],
[0,"bbox-branch-own-absent"],
[0,"bbox-branch-map-getter"],
[0,"bbox-branch-foreign-predicate"],
[0,"bbox-branch-foreign-rtree"],
[0,"bbox-branch-foreign-attr"],
[0,"bbox-branch-collateral"],
[0,"bbox-history"],
[1,"bbox-history"],
[0,"bbox-history-disposed"],
[0,"bbox-history-wire"],
[0,"bbox-history-wire-getter"],
[0,"bbox-history-proto-getter"],
[0,"bbox-history-attr-getter"],
[0,"bbox-history-foreign"],
[0,"bbox-history-collateral"],
[0,"bbox-group"],
[1,"bbox-group"],
[0,"bbox-group-model-flag"],
[0,"bbox-group-proto-flag"],
[0,"bbox-group-foreign-getter"],
[0,"bbox-group-foreign"],
[0,"bbox-group-backing-drift"],
[0,"bbox-method"],
[1,"bbox-method"],
[0,"bbox-method-foreign-tag"],
[0,"bbox-method-tag-data"],
[0,"bbox-method-getter"],
[0,"bbox-method-foreign"],
[0,"bbox-method-drift"],
[0,"bbox-method-preparation"],
[1,"bbox-method-preparation"],
[0,"bbox-method-preparation-existing"],
[1,"bbox-method-preparation-existing"],
[0,"bbox-method-preparation-map-getter"],
[0,"bbox-method-preparation-map-get"],
[0,"bbox-method-preparation-map-set"],
[0,"bbox-method-preparation-set-add"],
[0,"bbox-method-preparation-stack-getter"],
[0,"bbox-method-preparation-stack-foreign"],
[0,"bbox-method-preparation-proto-getter"],
[0,"bbox-method-preparation-peers"],
[0,"bbox-method-preparation-collateral"],
[0,"bbox-method-preparation-execution"],
[1,"bbox-method-preparation-execution"],
[0,"bbox-method-preparation-execution-existing"],
[1,"bbox-method-preparation-execution-existing"],
[0,"bbox-method-preparation-execution-map-drift"],
[0,"bbox-method-preparation-execution-setter"],
[0,"bbox-method-preparation-execution-birth-drift"],
[0,"bbox-method-preparation-execution-map-collateral"],
[0,"bbox-method-preparation-execution-set-collateral"],
[0,"bbox-method-preparation-execution-init-shadow"],
[0,"bbox-method-preparation-execution-hooks"],
[1,"bbox-method-preparation-execution-hooks"],
[0,"bbox-method-preparation-execution-hooks-getter"],
[0,"bbox-method-preparation-execution-hooks-base-drift"],
[0,"bbox-method-preparation-execution-hooks-each-getter"],
[0,"bbox-method-preparation-execution-hooks-flag-getter"],
[0,"bbox-method-preparation-execution-hooks-peer-drift"],
[0,"bbox-method-preparation-execution-hooks-roster-drift"],[0,"bbox-method-preparation-execution-hooks-dependencies"],[1,"bbox-method-preparation-execution-hooks-dependencies"],[0,"bbox-method-preparation-execution-hooks-dependencies-foreign-attributes"],[0,"bbox-method-preparation-execution-hooks-dependencies-scalar-accessor"],[0,"bbox-method-preparation-execution-hooks-dependencies-map-getter"],[0,"bbox-method-preparation-execution-hooks-dependencies-map-drift"],[0,"bbox-method-preparation-execution-hooks-dependencies-peer-drift"],[0,"bbox-method-preparation-execution-hooks-dependencies-numeric-drift"],[0,"bbox-method-preparation-execution-hooks-dependencies-stroke-nan"],[0,"bbox-method-preparation-execution-hooks-dependencies-stroke-infinity"],[0,"bbox-method-preparation-execution-hooks-dependencies-returns-highlight-nan"],[0,"bbox-method-preparation-execution-hooks-dependencies-returns"],[1,"bbox-method-preparation-execution-hooks-dependencies-returns"],[0,"bbox-method-preparation-execution-hooks-dependencies-returns-home-drift"],[0,"bbox-method-preparation-execution-hooks-dependencies-returns-object-getter"],[0,"bbox-method-preparation-execution-hooks-dependencies-returns-ia-drift"],[0,"bbox-method-preparation-execution-hooks-dependencies-returns-born-drift"],[0,"bbox-method-preparation-execution-hooks-dependencies-returns-parent-drift"],[0,"bbox-method-preparation-execution-hooks-dependencies-returns-children"],[1,"bbox-method-preparation-execution-hooks-dependencies-returns-children"],[0,"bbox-method-preparation-execution-hooks-dependencies-returns-children-child-foreign"],[0,"bbox-method-preparation-execution-hooks-dependencies-returns-children-child-result"],[0,"bbox-method-preparation-execution-hooks-dependencies-returns-children-child-birth"],[0,"bbox-method-preparation-execution-hooks-dependencies-returns-children-child-peer"],[0,"bbox-method-preparation-execution-hooks-dependencies-returns-children-child-numeric"],[0,"bbox-method-preparation-execution-hooks-dependencies-returns-children-child-accessor"],[0,"bbox-method-preparation-execution-hooks-dependencies-returns-children-child-write"]]as const){
 void test(`original Wire callback driver ${String(variant)} / ${mode}`,{timeout:mode.startsWith("bbox-method-preparation-execution-hooks-dependencies-returns")?70_000:35_000},async context=>{
  const source=await readConfiguredEasyedaAsset(SOURCE[variant].relativePath);if(source===null){context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON);return;}
  const session=new Session();session.connect();await session.post("Debugger.enable");let stageScriptId="";let vendorScriptId="";let contextId=0;const key=`__wireCallbackDriver${String(variant)}${mode.replaceAll("-","")}`;const vendorUrl=`${key}Vendor.js`;
  session.on("Debugger.scriptParsed",notification=>{if(notification.params.url==="wireNativeStage-v4.js"){stageScriptId=notification.params.scriptId;contextId=notification.params.executionContextId;}if(notification.params.url===vendorUrl){vendorScriptId=notification.params.scriptId;}});
  const native=wireNativeFixture("success","v4",variant);const vm=native.fixtureContext;const refs:unknown=runInContext(wireTransitionFixture(source,variant,mode.startsWith("bbox-method-preparation-execution-hooks-dependencies-returns-children")),vm,{filename:vendorUrl});assert.ok(refs!==null&&typeof refs==="object");Object.defineProperty(vm,"fixtureRefs",{value:refs,configurable:true});
  runInContext(`globalThis.fixtureAstGetterCalls=0;fixtureRoots.shapes.shouldUpdateAst=${String(variant===1)};fixtureRefs.monitor.onModelAttributeChange=fixtureRefs.modifyView;fixtureRoots.shapes.bboxMonitor=fixtureRefs.bbox;fixtureRefs.bbox.shapeManager=fixtureRoots.shapes;fixtureRefs.bbox.onModelAttributeChange=fixtureRefs.bboxAttribute;fixtureRefs.bbox.add=fixtureRefs.bboxAdd;fixtureRefs.bbox._nextTickPromise=null;fixtureRefs.bbox._modelMapForOnBBoxChangeAsync=new Map;fixtureRefs.bbox._modelsShouldUpdateBBox=new Map;fixtureRefs.bbox._modelTypesShouldUpdateBBox=new Set;fixtureRefs.bbox._addCore=fixtureRefs.core.forCommon;fixtureRefs.bbox._addCoreMethods=fixtureRefs.core;fixtureRefs.bbox.shouldUpdateInAsync=false;fixtureRefs.bbox._onModelsBBoxChangeAsync={dispatch(){}};fixtureRefs.bbox._tryAddParent=fixtureRefs.bboxTryParent;globalThis.fixtureSavedSetAdd=Set.prototype.add;globalThis.fixtureSavedMapSet=Map.prototype.set;globalThis.fixtureProtoHistoryDescriptor=Object.getOwnPropertyDescriptor(Object.prototype,"notAddHistory");globalThis.fixtureProtoWireDescriptor=Object.getOwnPropertyDescriptor(Object.prototype,"Wire");globalThis.fixtureLineParentDescriptor=Object.getOwnPropertyDescriptor(fixtureRoots.line,"parent");globalThis.fixtureLineTypeDescriptor=Object.getOwnPropertyDescriptor(fixtureRoots.line,"modelType");globalThis.fixtureSavedPromise=Promise;globalThis.fixturePromiseDescriptors=Object.getOwnPropertyDescriptors(Promise);globalThis.fixturePromiseProtoDescriptors=Object.getOwnPropertyDescriptors(Promise.prototype);globalThis.fixtureModuleGetterCalls=0;globalThis.fixtureViewGetterCalls=0;fixtureRefs.monitor.modelsMayBeShouldUpdateView=new Set;
if(${JSON.stringify(mode)}==="view-existing"||${JSON.stringify(mode)}==="view-collateral"){fixtureRefs.monitor.modelsMayBeShouldUpdateView.add(fixtureRoots.line);fixtureRefs.monitor.modelsMayBeShouldUpdateView.add(fixtureRoots.shapes.root);const originalAttributes={peer:{opaque:true}};Object.defineProperty(originalAttributes,"points",{value:false,writable:true,enumerable:false,configurable:false});Object.defineProperty(originalAttributes,"opaqueGetter",{get(){fixtureViewGetterCalls++;throw Error("opaque getter")},enumerable:false,configurable:true});originalAttributes[Symbol("opaque")]=()=>{};fixtureRoots.line.changedAttrsForUpdateView=originalAttributes;Object.defineProperty(fixtureRefs.monitor.modelsMayBeShouldUpdateView,"opaqueGetter",{get(){fixtureViewGetterCalls++;throw Error("set getter")},configurable:true});}
if(${JSON.stringify(mode)}==="view-point-getter"){fixtureRoots.line.changedAttrsForUpdateView={};Object.defineProperty(fixtureRoots.line.changedAttrsForUpdateView,"points",{get(){fixtureViewGetterCalls++;return false},enumerable:true,configurable:true});}
if(${JSON.stringify(mode)}==="view-foreign-member")fixtureRefs.monitor.modelsMayBeShouldUpdateView.add({foreign:true});if(${JSON.stringify(mode)}==="ast-accessor")Object.defineProperty(fixtureRoots.shapes,"shouldUpdateAst",{get(){fixtureAstGetterCalls++;return false},enumerable:true,configurable:true});if(${JSON.stringify(mode)}==="ast-foreign-view")fixtureRefs.monitor.onModelAttributeChange=function(){throw Error("foreign view")};fixtureRefs.monitor.shapeManager=fixtureRoots.shapes;fixtureRoots.shapes.modifyMonitor=fixtureRefs.monitor;Object.defineProperty(fixtureRoots.line,"points",Object.getOwnPropertyDescriptor(fixtureRefs.pointObject.prototype,"points"));globalThis.fixtureNative=Object.freeze([Object.getOwnPropertyDescriptor,Object.getOwnPropertyDescriptors,Object.getPrototypeOf,Object.is,Object.hasOwn,Reflect.ownKeys,Reflect.apply,Array.isArray,Map.prototype.get,Map.prototype.has,Map.prototype.forEach,Object.getOwnPropertyDescriptor(Map.prototype,"size").get,Set.prototype.has,Set.prototype.forEach,Object.getOwnPropertyDescriptor(Set.prototype,"size").get,Object.prototype,Array.prototype,Map.prototype,Set.prototype]);`,vm);
  const captured=await native.call("capture");assert.ok(Array.isArray(captured));const before=await native.call("preflight");assert.ok(before!==null&&typeof before==="object"&&Reflect.get(before,"ok")===true);assert.ok(stageScriptId.length>0&&vendorScriptId.length>0);session.disconnect();
  Object.defineProperty(globalThis,key,{value:vm,configurable:true});const result=Promise.withResolvers<unknown>();const worker=new Worker(new URL("helpers/current-schematic-wire-callback-driver-worker.ts",import.meta.url),{workerData:{key,vendorScriptId,contextId,targetJson:JSON.stringify(Reflect.get(vm,"target")),operationJson:JSON.stringify(Reflect.get(vm,"operation")),variant,source,mode}});
  context.after(async()=>{Reflect.deleteProperty(globalThis,key);await worker.terminate();});worker.on("error",result.reject);worker.on("message",(raw:unknown)=>{result.resolve(raw);});
  const raw=await result.promise;assert.ok(raw!==null&&typeof raw==="object"&&!("error"in raw),JSON.stringify(raw));
  // Every refusal and successful hold must leave downstream CAD counters unchanged.
  assert.deepEqual(native.counts(),{actions:1,points:0,save:0,allocation:0});
  if(mode==="bad-stage"){assert.equal(Reflect.get(raw,"refused"),true);return;}
  if(mode==="ast-accessor"||mode==="ast-foreign-view"){assert.equal(Reflect.get(raw,"refused"),true);assert.equal(Reflect.get(raw,"baseResumes"),7);assert.equal(Reflect.get(raw,"getterCalls"),0);return;}
  if(mode==="view-weak-add"||mode==="view-point-getter"||mode==="view-foreign-member"||mode==="view-collateral"){assert.equal(Reflect.get(raw,"refused"),true);assert.equal(Reflect.get(raw,"baseResumes"),mode==="view-collateral"?10:9);assert.equal(Reflect.get(raw,"getterCalls"),0);return;}
  if(mode==="bbox-module-getter"||mode==="bbox-points-getter"||mode==="bbox-next-getter"||mode==="bbox-foreign-add"){assert.equal(Reflect.get(raw,"refused"),true);assert.equal(Reflect.get(raw,"baseResumes"),10);assert.equal(Reflect.get(raw,"getterCalls"),0);return;}
  if(mode==="bbox-promise-getter"||mode==="bbox-resolve-reject"||mode==="bbox-species-getter"||mode==="bbox-constructor-getter"||mode==="bbox-foreign-common"){assert.equal(Reflect.get(raw,"refused"),true);assert.equal(Reflect.get(raw,"baseResumes"),11);assert.equal(Reflect.get(raw,"getterCalls"),0);return;}
  if(mode==="bbox-weak-set"||mode==="bbox-weak-map"||mode==="bbox-type-getter"||mode==="bbox-map-foreign"||mode==="bbox-map-collateral"||mode==="bbox-parent-getter"||mode==="bbox-foreign-parent"){assert.equal(Reflect.get(raw,"refused"),true);assert.equal(Reflect.get(raw,"baseResumes"),mode==="bbox-map-collateral"?13:12);assert.equal(Reflect.get(raw,"getterCalls"),0);return;}
  if(mode==="bbox-inherited-foreign"||mode==="bbox-inherited-backing-getter"||mode==="bbox-inherited-shadow"||mode==="bbox-inherited-drift"){assert.equal(Reflect.get(raw,"refused"),true);assert.equal(Reflect.get(raw,"baseResumes"),mode==="bbox-inherited-drift"?14:12);assert.equal(Reflect.get(raw,"getterCalls"),0);return;}
  if(mode==="bbox-branch-map-getter"||mode==="bbox-branch-foreign-predicate"||mode==="bbox-branch-foreign-rtree"||mode==="bbox-branch-foreign-attr"||mode==="bbox-branch-collateral"){assert.equal(Reflect.get(raw,"refused"),true);assert.equal(Reflect.get(raw,"baseResumes"),mode==="bbox-branch-collateral"?17:15);assert.equal(Reflect.get(raw,"getterCalls"),0);return;}
  if(mode==="bbox-history-disposed"||mode==="bbox-history-wire"||mode==="bbox-history-wire-getter"||mode==="bbox-history-proto-getter"||mode==="bbox-history-attr-getter"||mode==="bbox-history-foreign"||mode==="bbox-history-collateral"){assert.equal(Reflect.get(raw,"refused"),true);assert.equal(Reflect.get(raw,"baseResumes"),mode==="bbox-history-collateral"?21:20);assert.equal(Reflect.get(raw,"getterCalls"),0);return;}
  if(mode==="bbox-group-model-flag"||mode==="bbox-group-proto-flag"||mode==="bbox-group-foreign-getter"||mode==="bbox-group-foreign"||mode==="bbox-group-backing-drift"){assert.equal(Reflect.get(raw,"refused"),true);assert.equal(Reflect.get(raw,"baseResumes"),mode==="bbox-group-backing-drift"?23:21);assert.equal(Reflect.get(raw,"getterCalls"),0);return;}
  if(mode==="bbox-method-foreign-tag"||mode==="bbox-method-tag-data"||mode==="bbox-method-getter"||mode==="bbox-method-foreign"||mode==="bbox-method-drift"){assert.equal(Reflect.get(raw,"refused"),true);assert.equal(Reflect.get(raw,"baseResumes"),mode==="bbox-method-drift"?27:24);assert.equal(Reflect.get(raw,"getterCalls"),0);return;}
  if(mode.endsWith("-stroke-nan")||mode.endsWith("-stroke-infinity")||mode.endsWith("-returns-highlight-nan")){
   assert.equal(Reflect.get(raw,"refused"),true);assert.equal(Reflect.get(raw,"getterCalls"),0);
   const inspect:unknown=Reflect.get(raw,"inspect");assert.ok(inspect!==null&&typeof inspect==="object");
   assert.equal(Reflect.get(inspect,"failed"),true);assert.equal(Reflect.get(raw,"baseResumes"),mode.endsWith("-returns-highlight-nan")?40:39);
   if(mode.endsWith("-returns-highlight-nan")){assert.equal(Reflect.get(inspect,"dependencyNormal"),26);}else{assert.equal(Reflect.get(inspect,"dependencyNormal"),4);}
   context.diagnostic(JSON.stringify(raw));return;
  }
  if(mode.startsWith("bbox-method-preparation-execution-hooks-dependencies-returns-children")){
   assert.equal(Reflect.get(raw,"getterCalls"),0);const inspect:unknown=Reflect.get(raw,"inspect");assert.ok(inspect!==null&&typeof inspect==="object");if(mode!=="bbox-method-preparation-execution-hooks-dependencies-returns-children"){assert.equal(Reflect.get(raw,"refused"),true);assert.equal(Reflect.get(inspect,"failed"),true);const boundaries={"-child-foreign":[60,47],"-child-result":[57,28],"-child-birth":[59,45],"-child-peer":[59,45],"-child-numeric":[56,12],"-child-accessor":[56,5],"-child-write":[57,28]}as const;const boundary=Object.entries(boundaries).find(([suffix])=>mode.endsWith(suffix));assert.ok(boundary!==undefined);const[resumes,normal]=boundary[1];assert.equal(Reflect.get(raw,"baseResumes"),resumes);assert.equal(Reflect.get(inspect,"childNormal"),normal);assert.equal(Reflect.get(inspect,"returnNormal"),156);assert.equal(Reflect.get(raw,"requests"),627+normal);if(mode.endsWith("-child-foreign")){assert.equal(Reflect.get(raw,"fixtureTeardownGetterCalls"),1);}context.diagnostic(JSON.stringify(raw));return;}
   const packet:unknown=Reflect.get(raw,"packet");assert.ok(packet!==null&&typeof packet==="object");assert.equal(Reflect.get(packet,"schema"),"private.schematic-wire-first-child-attribute-entry-held.v1");assert.equal(Reflect.get(packet,"normalRequests"),59);assert.equal(Reflect.get(packet,"helperSources"),18);assert.equal(Reflect.get(packet,"scopeReads"),4);assert.equal(Reflect.get(packet,"cleanupRequests"),0);assert.equal(Reflect.get(raw,"requests"),686);assert.equal(Reflect.get(raw,"ownedEvents"),16);assert.equal(Reflect.get(inspect,"returnNormal"),156);assert.equal(Reflect.get(inspect,"pauses"),61);assert.equal(Reflect.get(inspect,"resumes"),60);assert.equal(Reflect.get(inspect,"failed"),false);assert.equal(Reflect.get(raw,"originalFixtureModifyPending"),true);for(const flag of["originalBaseReturnToGroupContinuationJoined","originalGroupResultIdentityRecompared","originalEmptyChildrenObjectBirthJoined","actualNativeForEachFirstCallbackJoined","actualFirstChildCallbackOperandsCompared","firstChildAttributeGetterSourceAndMetadataQualified","actualFirstChildGetterEntryAndReceiverJoined","originalNumericAndObjectBindingsFreshlyRecompared","completeOriginalPeerDescriptorsAndMembershipRecompared","originalOldNewDataBirthsStillEmpty","originalSamePendingPromiseRetained","originalTickPointRetained","firstChildAttributeGetterEntryStillHeld","baseGetDataBodyReturned"]){assert.equal(Reflect.get(packet,flag),true);}for(const flag of["firstChildAttributeGetterBodyReturned","firstChildTagGetterJoined","nativeChildrenIterationCompleted","groupGetDataBodyReturned","oldDataGraphJoined","initOldDataBodyReturned","callbackReturned","methodBodyReturned","groupBodyReturned","historyBodyReturned","tickBodyResumed","fullSetterComplete","workerCompleted","modifyCompleted","originalNativeOwnerJoined","continuousGlobalsVerified","saveAuthorized"]){assert.equal(Reflect.get(packet,flag),false);}context.diagnostic(JSON.stringify(raw));return;
  }
  if(mode.startsWith("bbox-method-preparation-execution-hooks-dependencies-returns")){
   assert.equal(Reflect.get(raw,"getterCalls"),0);const inspect:unknown=Reflect.get(raw,"inspect");assert.ok(inspect!==null&&typeof inspect==="object");if(mode!=="bbox-method-preparation-execution-hooks-dependencies-returns"){assert.equal(Reflect.get(raw,"refused"),true);assert.equal(Reflect.get(inspect,"failed"),true);const expectations={"-object-getter":[39,19],"-home-drift":[42,44],"-parent-drift":[54,138],"-ia-drift":[46,77],"-born-drift":[46,82]}as const;const expected=Object.entries(expectations).find(([suffix])=>mode.endsWith(suffix));assert.ok(expected!==undefined);const[expectedResumes,expectedNormal]=expected[1];assert.equal(Reflect.get(inspect,"returnNormal"),expectedNormal);assert.equal(Reflect.get(raw,"baseResumes"),expectedResumes);if(mode.endsWith("-home-drift")){assert.equal(Reflect.get(raw,"fixtureTeardownGetterCalls"),1);}context.diagnostic(JSON.stringify(raw));return;}
   const packet:unknown=Reflect.get(raw,"packet");assert.ok(packet!==null&&typeof packet==="object");assert.equal(Reflect.get(packet,"schema"),"private.schematic-wire-group-base-data-return-held.v1");assert.equal(Reflect.get(packet,"normalRequests"),156);assert.equal(Reflect.get(packet,"helperSources"),47);assert.equal(Reflect.get(packet,"scopeReads"),8);assert.equal(Reflect.get(packet,"cleanupRequests"),0);assert.equal(Reflect.get(raw,"requests"),627);assert.equal(Reflect.get(raw,"ownedEvents"),15);assert.equal(Reflect.get(inspect,"pauses"),57);assert.equal(Reflect.get(inspect,"resumes"),56);assert.equal(Reflect.get(inspect,"failed"),false);assert.equal(Reflect.get(raw,"originalFixtureModifyPending"),true);for(const flag of["originalSuperDispatchDestinationsJoined","originalGroupGetterLexicalObjectBindingCompared","originalNumericBindingFreshlyRecompared","genuineHighlightAndNumericReturnsCompared","genuineBaseAndGroupAttributeReturnsJoined","genuineParentReturnJoined","originalBaseGetDataReturnValueJoined","originalAttributeResultIdentityRetained","completeOriginalPeerDescriptorsAndMembershipRecompared","originalOldNewDataBirthsStillEmpty","originalSamePendingPromiseRetained","originalTickPointRetained","originalBaseGetDataReturnInstructionStillHeld","modelAttributeGetterReturned"]){assert.equal(Reflect.get(packet,flag),true);}for(const flag of["baseGetDataBodyReturned","groupGetDataBodyReturned","nativeChildrenIterationJoined","oldDataGraphJoined","initOldDataBodyReturned","callbackReturned","methodBodyReturned","groupBodyReturned","historyBodyReturned","tickBodyResumed","fullSetterComplete","workerCompleted","modifyCompleted","originalNativeOwnerJoined","continuousGlobalsVerified","saveAuthorized"]){assert.equal(Reflect.get(packet,flag),false);}context.diagnostic(JSON.stringify(raw));return;
  }
  if(mode.startsWith("bbox-method-preparation-execution-hooks-dependencies")){
   if(mode!=="bbox-method-preparation-execution-hooks-dependencies"){assert.equal(Reflect.get(raw,"refused"),true);assert.equal(Reflect.get(raw,"baseResumes"),39);assert.equal(Reflect.get(raw,"getterCalls"),0);const inspect:unknown=Reflect.get(raw,"inspect");assert.ok(inspect!==null&&typeof inspect==="object");let expected=18;if(mode.endsWith("-foreign-attributes")){expected=7;}else if(mode.endsWith("-scalar-accessor")||mode.endsWith("-map-getter")){expected=4;}else if(mode.endsWith("-numeric-drift")){expected=22;}assert.equal(Reflect.get(inspect,"dependencyNormal"),expected);return;}
   const packet:unknown=Reflect.get(raw,"packet");const inspect:unknown=Reflect.get(raw,"inspect");assert.ok(packet!==null&&typeof packet==="object"&&inspect!==null&&typeof inspect==="object");assert.equal(Reflect.get(packet,"schema"),"private.schematic-wire-group-data-dependencies-held.v1");assert.equal(Reflect.get(packet,"scopeReads"),2);assert.equal(Reflect.get(packet,"normalRequests"),26);assert.equal(Reflect.get(packet,"cleanupRequests"),0);assert.equal(Reflect.get(packet,"helperSources"),6);assert.equal(Reflect.get(inspect,"dependencyNormal"),26);assert.equal(Reflect.get(inspect,"pauses"),40);assert.equal(Reflect.get(inspect,"resumes"),39);assert.equal(Reflect.get(inspect,"failed"),false);assert.equal(Reflect.get(raw,"requests"),471);assert.equal(Reflect.get(raw,"ownedEvents"),14);for(const flag of["originalGroupDataEntryAndOperandsRecompared","actualGroupAndBaseAttributeAndHighlightSourcesCompared","actualParentGetterSourceAndBackingPathCompared","originalNumericPredicateClosureBindingCompared","nativeObjectAssignAndMapGetCompared","completeBackingMapMembershipAndOpaquePeerDescriptorsRetained","attributeScalarOperandDataPathsCompared","originalSamePendingPromiseRetained","originalTickPointRetained","originalGroupGetDataEntryStillHeld"]){assert.equal(Reflect.get(packet,flag),true);}for(const flag of["attributeGetterHomeObjectsJoined","attributeGetterGlobalObjectBindingJoined","attributeScalarAccessorBodiesJoined","modelAttributeGetterExecutionQualified","groupGetDataBodyResumed","baseGetDataBodyResumed","modelAttributeGetterReturned","oldDataGraphJoined","initOldDataBodyReturned","methodBodyReturned","groupBodyReturned","historyBodyReturned","tickBodyResumed","callbackReturned","fullSetterComplete","workerCompleted","modifyCompleted","originalNativeOwnerJoined","continuousGlobalsVerified","saveAuthorized"]){assert.equal(Reflect.get(packet,flag),false);}assert.equal(Reflect.get(raw,"getterCalls"),0);assert.equal(Reflect.get(raw,"originalFixtureModifyPending"),true);context.diagnostic(JSON.stringify(raw));return;
  }
  if(mode.startsWith("bbox-method-preparation-execution-hooks")){
   if(mode!=="bbox-method-preparation-execution-hooks"){assert.equal(Reflect.get(raw,"refused"),true);assert.equal(Reflect.get(raw,"baseResumes"),mode.endsWith("roster-drift")?39:38);assert.equal(Reflect.get(raw,"getterCalls"),0);return;}
   const packet:unknown=Reflect.get(raw,"packet");const inspect:unknown=Reflect.get(raw,"inspect");assert.ok(packet!==null&&typeof packet==="object"&&inspect!==null&&typeof inspect==="object");assert.equal(Reflect.get(packet,"schema"),"private.schematic-wire-group-data-hook-entry-held.v1");assert.equal(Reflect.get(packet,"childCount"),4);assert.equal(Reflect.get(packet,"normalRequests"),28);assert.equal(Reflect.get(packet,"cleanupRequests"),1);assert.equal(Reflect.get(inspect,"hookNormal"),28);assert.equal(Reflect.get(inspect,"hookCleanup"),1);assert.equal(Reflect.get(inspect,"pauses"),40);assert.equal(Reflect.get(inspect,"resumes"),39);assert.equal(Reflect.get(inspect,"failed"),false);assert.equal(Reflect.get(raw,"requests"),445);assert.equal(Reflect.get(raw,"ownedEvents"),14);for(const flag of["originalRunningInitOperandsAndParentLexicalCompared","originalGroupAndBaseGetDataFunctionsQualified","nativeChildrenForEachQualified","completeOriginalChildRosterAndHookPrototypePathsRetained","completePeersAndOriginalOldNewDataBirthsCompared","originalInitBodyResumed","originalGroupGetDataEntryJoined","originalGroupGetDataEntryStillHeld","originalSamePendingPromiseRetained","originalTickPointRetained"]){assert.equal(Reflect.get(packet,flag),true);}for(const flag of["modelAttributeGetterExecutionQualified","groupGetDataBodyResumed","baseGetDataBodyResumed","initOldDataBodyReturned","methodBodyReturned","groupBodyReturned","historyBodyReturned","tickBodyResumed","callbackReturned","fullSetterComplete","workerCompleted","modifyCompleted","originalNativeOwnerJoined","continuousGlobalsVerified","saveAuthorized"]){assert.equal(Reflect.get(packet,flag),false);}assert.equal(Reflect.get(raw,"getterCalls"),0);assert.equal(Reflect.get(raw,"originalFixtureModifyPending"),true);context.diagnostic(JSON.stringify(raw));return;
  }
  if(mode.startsWith("bbox-method-preparation-execution")){
   const existing=mode==="bbox-method-preparation-execution-existing";
   if(mode!=="bbox-method-preparation-execution"&&!existing){const expected={"bbox-method-preparation-execution-map-drift":28,"bbox-method-preparation-execution-setter":30,"bbox-method-preparation-execution-birth-drift":32,"bbox-method-preparation-execution-map-collateral":34,"bbox-method-preparation-execution-set-collateral":36,"bbox-method-preparation-execution-init-shadow":37};assert.equal(Reflect.get(raw,"refused"),true);assert.equal(Reflect.get(raw,"baseResumes"),Reflect.get(expected,mode));assert.equal(Reflect.get(raw,"getterCalls"),0);return;}
   const packet:unknown=Reflect.get(raw,"packet");const inspect:unknown=Reflect.get(raw,"inspect");assert.ok(packet!==null&&typeof packet==="object");assert.ok(inspect!==null&&typeof inspect==="object");assert.equal(Reflect.get(packet,"schema"),existing?"private.schematic-wire-group-existing-return-held.v1":"private.schematic-wire-group-init-entry-held.v1");assert.equal(Reflect.get(packet,"normalRequests"),existing?18:68);assert.equal(Reflect.get(packet,"cleanupRequests"),existing?2:11);assert.equal(Reflect.get(packet,"commandConstructorJoined"),!existing);assert.equal(Reflect.get(packet,"initOldDataJoined"),!existing);assert.equal(Reflect.get(packet,"methodBodyResumed"),true);assert.equal(Reflect.get(inspect,"executionNormal"),existing?18:68);assert.equal(Reflect.get(inspect,"resumes"),existing?29:38);assert.equal(Reflect.get(inspect,"pauses"),existing?30:39);assert.equal(Reflect.get(inspect,"failed"),false);assert.equal(Reflect.get(raw,"ownedEvents"),existing?11:13);assert.equal(Reflect.get(raw,"requests"),existing?363:416);for(const flag of["methodBodyReturned","groupBodyReturned","historyBodyReturned","tickBodyResumed","callbackReturned","fullSetterComplete","workerCompleted","modifyCompleted","originalNativeOwnerJoined","continuousGlobalsVerified","saveAuthorized"]){assert.equal(Reflect.get(packet,flag),false);}assert.equal(Reflect.get(raw,"getterCalls"),0);assert.equal(Reflect.get(raw,"originalFixtureModifyPending"),true);context.diagnostic(JSON.stringify(raw));return;
  }
  if(mode.startsWith("bbox-method-preparation")&&mode!=="bbox-method-preparation"&&mode!=="bbox-method-preparation-existing"){assert.equal(Reflect.get(raw,"refused"),true);assert.equal(Reflect.get(raw,"baseResumes"),27);assert.equal(Reflect.get(raw,"getterCalls"),0);return;}
  const preparation=mode==="bbox-method-preparation"||mode==="bbox-method-preparation-existing";
  const method=mode==="bbox-method"||preparation;
  const group=mode==="bbox-group"||method;
  const history=mode==="bbox-history"||group;
  const branch=mode.startsWith("bbox-branch")||history;
  const ownBranch=mode==="bbox-branch-own-absent";
  const inherited=mode==="bbox-inherited"||branch&&!ownBranch;
  const parent=branch||inherited||mode==="bbox-parent"||mode==="bbox-parent-existing";
  const common=mode==="bbox-common"||parent;
  const add=mode==="bbox-add"||common;
  const bbox=mode==="view-bbox"||mode==="view-existing"||add;
  const successor=mode==="ast-view"||bbox;assert.equal(LIMIT.normal,89);assert.equal(LIMIT.cleanup,2);
  const expected={normal:89,cleanup:2,pauses:8,resumes:7,held:"recordEntryStillHeld",body:"monitorBodyResumed"};
  if(successor){Object.assign(expected,{normal:16,pauses:10,resumes:9,held:"originalViewEntryStillHeld",body:"viewBodyResumed"});}
  if(bbox){Object.assign(expected,{normal:15,cleanup:1,pauses:11,resumes:10,held:"originalBboxEntryStillHeld",body:"bboxBodyResumed"});}
  if(add){Object.assign(expected,{normal:13,cleanup:1,pauses:12,resumes:11,held:"originalAddEntryStillHeld",body:"addBodyResumed"});}
  if(common){Object.assign(expected,{normal:23,cleanup:1,pauses:13,resumes:12,held:"originalCommonEntryStillHeld",body:"commonBodyResumed"});}
  if(parent){Object.assign(expected,{normal:17,cleanup:1,pauses:14,resumes:13,held:"originalParentEntryStillHeld",body:"parentBodyResumed"});}
  if(inherited){Object.assign(expected,{normal:29,cleanup:3,pauses:16,resumes:15});}
  if(branch){const present=mode.includes("present");Object.assign(expected,{normal:present?18:35,cleanup:present?2:5,pauses:(ownBranch?14:16)+(present?2:5),resumes:(ownBranch?13:15)+(present?2:5),held:"originalAttrEntryStillHeld",body:"attrBodyResumed"});}
  if(history){Object.assign(expected,{normal:15,cleanup:1,pauses:22,resumes:21,held:"originalHistoryEntryStillHeld",body:"historyBodyResumed"});}
  if(group){Object.assign(expected,{normal:23,cleanup:3,pauses:25,resumes:24,held:"originalGroupHandlerEntryStillHeld",body:"groupBodyResumed"});}
  if(method){Object.assign(expected,{normal:25,cleanup:3,pauses:28,resumes:27,held:"originalGroupHistoryMethodEntryStillHeld",body:"methodBodyResumed"});}
  if(preparation){Object.assign(expected,{normal:mode.endsWith("existing")?38:32,cleanup:0,held:"originalGroupHistoryMethodEntryStillHeld",body:"methodBodyResumed"});}
  const packet:unknown=Reflect.get(raw,"packet");assert.ok(packet!==null&&typeof packet==="object");assert.equal(Reflect.get(packet,"normalRequests"),expected.normal);assert.equal(Reflect.get(packet,"cleanupRequests"),expected.cleanup);assert.equal(Reflect.get(packet,expected.held),true);
  for(const flag of[expected.body,"callbackReturned","fullSetterComplete","workerCompleted","modifyCompleted","originalNativeOwnerJoined","continuousGlobalsVerified","saveAuthorized"]){assert.equal(Reflect.get(packet,flag),false);}
  const inspect:unknown=Reflect.get(raw,"inspect");
assert.ok(inspect!==null&&typeof inspect==="object");
assert.equal(Reflect.get(inspect,"pauses"),expected.pauses);
assert.equal(Reflect.get(inspect,"resumes"),expected.resumes);
assert.equal(Reflect.get(inspect,"held"),true);
assert.equal(Reflect.get(inspect,"failed"),false);
assert.equal(Reflect.get(raw,"originalFixtureModifyPending"),true);

if(successor&&!bbox){assert.equal(Reflect.get(packet,"originalAstSourceAssignmentJoined"),true);
assert.equal(Reflect.get(packet,"originalShouldUpdateAstOwnDataCompared"),true);
assert.equal(Reflect.get(inspect,"normal"),89);
assert.equal(Reflect.get(inspect,"astNormal"),16);
assert.equal(Reflect.get(inspect,"astCleanup"),2);
}if(bbox&&!add){for(const flag of["nativeSetAddComparedOnFreshSet","completePriorSetMembershipAndOwnDescriptorsPreserved","completeChangedAttributeDescriptorsPreserved","originalPointChangedFlagCompared"]){assert.equal(Reflect.get(packet,flag),true);
}assert.equal(Reflect.get(inspect,"bboxNormal"),15);
assert.equal(Reflect.get(inspect,"bboxCleanup"),1);
assert.equal(Reflect.get(raw,"getterCalls"),0);
}if(add&&!common){assert.equal(Reflect.get(packet,"scopeReads"),1);
assert.equal(Reflect.get(packet,"originalClosureModuleDataCompared"),true);
assert.equal(Reflect.get(packet,"ownPointsPredicateCompared"),true);
assert.equal(Reflect.get(inspect,"addNormal"),13);
assert.equal(Reflect.get(inspect,"addCleanup"),1);
assert.equal(Reflect.get(raw,"getterCalls"),0);
}if(common&&!parent){assert.equal(Reflect.get(packet,"scopeReads"),3);
assert.equal(Reflect.get(packet,"actualPendingPromiseCompared"),true);
assert.equal(Reflect.get(packet,"originalTickPointRetained"),true);
assert.equal(Reflect.get(packet,"tickBodyResumed"),false);
assert.equal(Reflect.get(inspect,"commonNormal"),23);
assert.equal(Reflect.get(inspect,"commonCleanup"),1);
assert.equal(Reflect.get(raw,"getterCalls"),0);
}if(parent&&!inherited&&!branch){assert.equal(Reflect.get(packet,"originalThreeCommonCollectionEffectsCompared"),true);
assert.equal(Reflect.get(packet,"actualSamePromiseStillPending"),true);
assert.equal(Reflect.get(packet,"originalTickPointRetained"),true);
assert.equal(Reflect.get(packet,"tickBodyResumed"),false);
assert.equal(Reflect.get(inspect,"parentNormal"),17);
assert.equal(Reflect.get(inspect,"parentCleanup"),1);
assert.equal(Reflect.get(raw,"getterCalls"),0);
}if(inherited&&!branch){assert.equal(Reflect.get(packet,"originalParentGetterEntryAndReturnJoined"),true);
assert.equal(Reflect.get(packet,"actualOriginalParentGetterReturnCompared"),true);
assert.equal(Reflect.get(packet,"actualSamePromiseStillPending"),true);
assert.equal(Reflect.get(inspect,"inheritedNormal"),29);
assert.equal(Reflect.get(inspect,"inheritedCleanup"),3);
}if(branch&&!history){const present=mode.includes("present");
assert.equal(Reflect.get(packet,"branch"),present?"present":"absent");
assert.equal(Reflect.get(packet,"originalPredicateAndRtreeReturnsJoined"),!present);
assert.equal(Reflect.get(packet,"originalGroupCommonEffectsCompared"),present);
assert.equal(Reflect.get(packet,"originalBboxReturnedToSameRecord"),true);
assert.equal(Reflect.get(packet,"actualSamePromiseStillPending"),true);
assert.equal(Reflect.get(packet,"tickBodyResumed"),false);
assert.equal(Reflect.get(inspect,"branchNormal"),present?18:35);
}if(history&&!group){assert.equal(Reflect.get(packet,"scopeReads"),1);
assert.equal(Reflect.get(packet,"wireSubscriptionsAbsentAcrossCompletePrototypePathCompared"),true);
assert.equal(Reflect.get(packet,"originalAttrAbsenceBodyReturnedToSameRecord"),true);
assert.equal(Reflect.get(packet,"actualSamePromiseStillPending"),true);
assert.equal(Reflect.get(inspect,"historyNormal"),15);
assert.equal(Reflect.get(raw,"getterCalls"),0);
}if(group&&!method){assert.equal(Reflect.get(packet,"actualOriginalParentGetterReturnCompared"),true);
assert.equal(Reflect.get(packet,"originalHistoryToGroupOperandsCompared"),true);
assert.equal(Reflect.get(packet,"historyBodyReturned"),false);
assert.equal(Reflect.get(inspect,"groupNormal"),23);
assert.equal(Reflect.get(inspect,"groupCleanup"),3);
assert.equal(Reflect.get(raw,"getterCalls"),0);
}if(preparation){assert.equal(Reflect.get(packet,"schema"),"private.schematic-wire-group-preparation-held.v1");
assert.equal(Reflect.get(packet,"branch"),mode.endsWith("existing")?"existing":"missing");
assert.equal(Reflect.get(packet,"scopeReads"),1);
assert.equal(Reflect.get(packet,"originalRunningMethodLexicalConstructorAndBaseCompared"),true);
assert.equal(Reflect.get(packet,"completeCurrentCollectionMembershipAndPeerDescriptorsCompared"),true);
assert.equal(Reflect.get(inspect,"preparationNormal"),expected.normal);
assert.equal(Reflect.get(raw,"getterCalls"),0);
}else if(method){assert.equal(Reflect.get(packet,"actualNetGroupLineTagReturnCompared"),true);
assert.equal(Reflect.get(packet,"originalInitCallbackSourceAndCallsiteCompared"),true);
assert.equal(Reflect.get(packet,"commandConstructorJoined"),false);
assert.equal(Reflect.get(packet,"initOldDataJoined"),false);
assert.equal(Reflect.get(inspect,"methodNormal"),25);
assert.equal(Reflect.get(raw,"getterCalls"),0);
}context.diagnostic(JSON.stringify(raw));
 });
}
void test("callback driver rejects ambient selectors, conditional arms, generic resumes and historical unrelated phases",()=>{
 for(const input of[{phase:"wire-add-common-tick",variant:0,method:"Debugger.setBreakpoint",params:{location:{scriptId:"original",lineNumber:0,columnNumber:0},condition:""}},{phase:"wire-callback-driver-selector",role:"points",method:"Debugger.evaluateOnCallFrame",params:{expression:"Array.isArray(originalPoints)"}},{phase:"wire-callback-driver-arm",role:"setter",method:"Debugger.setBreakpointOnFunctionCall",params:{objectId:"original",condition:"true"}},{phase:"Debugger.resume",method:"Debugger.resume",params:{}},{phase:"wire-raw-properties",method:"Runtime.getProperties",params:{objectId:"original",ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}}]){assert.throws(()=>validate(input));}
});
