/* oxlint-disable import/max-dependencies -- Distinct source qualification, native caller/callback/manager grammars and an independent Inspector thread are separate proof inputs. */
/** Source-only actual original native DEL callback and manager entry. Inert
 * constructor/transport/guard stand-ins create no native owner or worker Job. */
import assert from "node:assert/strict";
import {test} from "node:test";
import {Worker} from "node:worker_threads";
import {Script} from "node:vm";
import {currentFootprintInverseNativeDeleteExecutionManagerCases as managerCases,currentFootprintInverseNativeDeleteExecutionManagerTemplate as managerTemplate,validateCurrentFootprintInverseNativeDeleteExecutionManagerCommand as managerValidate} from "../src/current-footprint-inverse-native-delete-execution-manager-protocol.ts";
import {currentFootprintInverseNativeDeleteExecutionCallbackCases as callbackCases,validateCurrentFootprintInverseNativeDeleteExecutionCallbackCommand as callbackValidate} from "../src/current-footprint-inverse-native-delete-execution-callback-protocol.ts";
import {qualifyCurrentFootprintInverseNativeDeleteQualificationSource as qualify} from "../src/current-footprint-inverse-native-delete-qualification-source.ts";
import {FOOTPRINT_INVERSE_NATIVE_DELETE_MANAGER_INSPECTOR as INSPECTOR} from "./helpers/footprint-inverse-native-delete-manager-fixture.ts";
import {footprintInverseNativeGetTaskUiFixture as uiFixture} from "./helpers/footprint-inverse-native-get-task-dependencies-fixture.ts";
import {footprintInverseNativeRegistrationManagerFixture as managerFixture} from "./helpers/footprint-inverse-native-registration-fixture.ts";
import {INSTALLED_EASYEDA_SOURCE_SKIP_REASON,readConfiguredEasyedaAssets} from "./helpers/installed-easyeda-source.ts";

void test("native DEL callback/manager syntax admits only its own fixed source and exact receiver-entry role",()=>{
 const all=managerCases();assert.equal(all.length,18);assert.ok(all.some(c=>"role"in c&&c.role==="deleteData"));
 for(const command of all){const row=managerTemplate(command);assert.ok(row.names.length<=13);managerValidate(command);assert.throws(()=>managerValidate({...command,publicOrigin:"borrowed"}));if(command.method==="Runtime.callFunctionOn"){assert.ok(new Script(`(${command.params.functionDeclaration})`) instanceof Script);assert.throws(()=>managerValidate({...command,params:{...command.params,functionDeclaration:`${command.params.functionDeclaration} `}}));}}
 for(const command of callbackCases()){callbackValidate(command);assert.throws(()=>callbackValidate({...command,callerCode:"foreign"}));}
});
void test("the actual native DEL wrapper/body joins the original deleteData receiver and holds before its worker call",async context=>{
 const sources=await readConfiguredEasyedaAssets(["pro-ui/3.2.198.2800f583/js/ui.js","pro-mgr/3.2.185.bf63a159/js/pro-mgr.js"]);if(sources===null){context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON);return;}const[ui,manager]=sources;assert.ok(ui!==undefined&&manager!==undefined);qualify({scriptSource:ui},"ui");qualify({scriptSource:manager},"manager");
 context.after(()=>{for(const name of ["inertNativeReg","inertNativeRegCtor","inertNativeRegTimer","gVars","_MSG_BUS_"]){Reflect.deleteProperty(globalThis,name);}});
 for(const mode of ["held","managerLate"]){
  const worker=new Worker(INSPECTOR,{eval:true,workerData:{mode,ui:uiFixture(ui),manager:managerFixture(manager),deleteSender:new URL("../src/current-footprint-inverse-native-delete-sender-collector.ts",import.meta.url).href,registration:new URL("../src/current-footprint-inverse-native-delete-registration-collector.ts",import.meta.url).href,sender:new URL("../src/current-footprint-inverse-native-delete-sender-collector.ts",import.meta.url).href,callController:new URL("../src/current-footprint-inverse-native-delete-execution-call-controller.ts",import.meta.url).href,dependencies:new URL("../src/current-footprint-inverse-native-delete-execution-dependencies-collector.ts",import.meta.url).href,dependencyProtocol:new URL("../src/current-footprint-inverse-native-delete-execution-dependencies-protocol.ts",import.meta.url).href,controller:new URL("../src/current-footprint-inverse-native-delete-execution-callback-controller.ts",import.meta.url).href,managerController:new URL("../src/current-footprint-inverse-native-delete-execution-manager-controller.ts",import.meta.url).href}});
  try{
   // oxlint-disable-next-line promise/avoid-new -- The independent Inspector thread retains actual source frames and transports only inert receipts.
   const value:unknown=await new Promise((resolve,reject)=>{worker.once("message",resolve);worker.once("error",reject);});
   assert.ok(value!==null&&typeof value==="object"&&!Object.hasOwn(value,"error"),JSON.stringify(value));assert.ok("managerResumes"in value&&"effectsWhileHeld"in value&&"exitRefused"in value);assert.equal(value.exitRefused,true);assert.deepEqual(value.effectsWhileHeld,[0,1,0]);
   if(mode==="managerLate"){assert.equal(value.managerResumes,0);assert.ok("managerRefused"in value&&value.managerRefused===true);}else{assert.equal(value.managerResumes,3);assert.ok("callbackSpent"in value&&value.callbackSpent===true&&"managerForged"in value&&value.managerForged===true&&"authority"in value);assert.deepEqual(value.authority,[true,false,false]);}
  }finally{await worker.terminate();}
 }
});
