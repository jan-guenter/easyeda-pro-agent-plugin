/** Source-only actual original native DEL callback and manager entry. Inert
 * constructor/transport/guard stand-ins create no native owner or worker Job. */
import assert from "node:assert/strict";
import {test} from "node:test";
import {Worker} from "node:worker_threads";
import {Script} from "node:vm";
import {currentFootprintInverseNativeDeleteExecutionForwardCases as channelCases,validateCurrentFootprintInverseNativeDeleteExecutionForwardCommand as channelValidate} from "../src/current-footprint-inverse-native-delete-execution-forward-protocol.ts";
import {qualifyCurrentFootprintInverseNativeDeleteQualificationSource as qualify} from "../src/current-footprint-inverse-native-delete-qualification-source.ts";
import {FOOTPRINT_INVERSE_NATIVE_DELETE_EXECUTION_FORWARD_INSPECTOR as INSPECTOR} from "./helpers/footprint-inverse-native-delete-execution-forward-fixture.ts";
import {footprintInverseNativeDeleteExecutionChannelEntryFixture as channelFixture} from "./helpers/footprint-inverse-native-delete-execution-channel-fixture.ts";
import {footprintInverseNativeGetTaskUiFixture as uiFixture} from "./helpers/footprint-inverse-native-get-task-dependencies-fixture.ts";

import {INSTALLED_EASYEDA_SOURCE_SKIP_REASON,readConfiguredEasyedaAssets} from "./helpers/installed-easyeda-source.ts";

void test("native DEL forward uses exact scalar DEL route and own fixed transfer grammar",()=>{
 const all=channelCases();assert.equal(all.length,39);
 for(const command of all){channelValidate(command);assert.throws(()=>channelValidate({...command,queryKind:"footprint-derived"}));assert.throws(()=>channelValidate({...command,publicOrigin:"borrowed"}));if(command.method==="Runtime.callFunctionOn"){assert.ok(new Script(`(${command.params.functionDeclaration})`) instanceof Script);assert.throws(()=>channelValidate({...command,params:{...command.params,functionDeclaration:`${command.params.functionDeclaration} `}}));}}
});
void test("actual native DEL joins the original posted scalar message and Promise, held at IGIVE return",async context=>{
 const sources=await readConfiguredEasyedaAssets(["pro-ui/3.2.198.2800f583/js/ui.js","pro-mgr/3.2.185.bf63a159/js/pro-mgr.js"]);if(sources===null){context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON);return;}const[ui,manager]=sources;assert.ok(ui!==undefined&&manager!==undefined);qualify({scriptSource:ui},"ui");qualify({scriptSource:manager},"manager");
 context.after(()=>{for(const name of ["inertNativeReg","inertNativeRegCtor","inertNativeRegTimer","gVars","_MSG_BUS_"]){Reflect.deleteProperty(globalThis,name);}});
 for(const mode of ["held","forwardLate","foreignPromise"]){
  const worker=new Worker(INSPECTOR,{eval:true,workerData:{mode,ui:uiFixture(ui),manager:channelFixture(manager),deleteSender:new URL("../src/current-footprint-inverse-native-delete-sender-collector.ts",import.meta.url).href,registration:new URL("../src/current-footprint-inverse-native-delete-registration-collector.ts",import.meta.url).href,sender:new URL("../src/current-footprint-inverse-native-delete-sender-collector.ts",import.meta.url).href,callController:new URL("../src/current-footprint-inverse-native-delete-execution-call-controller.ts",import.meta.url).href,dependencies:new URL("../src/current-footprint-inverse-native-delete-execution-dependencies-collector.ts",import.meta.url).href,dependencyProtocol:new URL("../src/current-footprint-inverse-native-delete-execution-dependencies-protocol.ts",import.meta.url).href,controller:new URL("../src/current-footprint-inverse-native-delete-execution-callback-controller.ts",import.meta.url).href,managerController:new URL("../src/current-footprint-inverse-native-delete-execution-manager-controller.ts",import.meta.url).href,channelController:new URL("../src/current-footprint-inverse-native-delete-execution-channel-controller.ts",import.meta.url).href,forwardController:new URL("../src/current-footprint-inverse-native-delete-execution-forward-controller.ts",import.meta.url).href}});
  try{
   // oxlint-disable-next-line promise/avoid-new -- The independent Inspector thread retains actual source frames and transports only inert receipts.
   const value:unknown=await new Promise((resolve,reject)=>{worker.once("message",resolve);worker.once("error",reject);});
   assert.ok(value!==null&&typeof value==="object"&&!Object.hasOwn(value,"error"),JSON.stringify(value));assert.ok("forwardResumes"in value&&"effectsWhileHeld"in value&&"exitRefused"in value);assert.equal(value.exitRefused,true);
   if(mode==="held"){assert.deepEqual(value.effectsWhileHeld,[3,0,1]);assert.equal(value.forwardResumes,13);assert.ok("channelSpent"in value&&value.channelSpent===true&&"forwardForged"in value&&value.forwardForged===true&&"authority"in value);assert.deepEqual(value.authority,[true,true,false,false]);assert.ok("order"in value&&Array.isArray(value.order));assert.equal(value.order.length,280);assert.equal(value.order.filter(item=>item==="helper").length,55);}else{assert.ok("forwardRefused"in value&&value.forwardRefused===true);assert.equal(value.forwardResumes,mode==="forwardLate"?0:6);}

  }finally{await worker.terminate();}
 }
});
