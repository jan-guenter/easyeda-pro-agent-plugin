/** Descriptor programs over the pinned inert bus fixture, without native
 * ownership or authority issuance. Original service execution remains separate. */
import assert from "node:assert/strict";
import {test} from "node:test";
import {createContext,runInContext} from "node:vm";
import {CURRENT_FOOTPRINT_INVERSE_REFERENCE_QUERY_FILES as FILES,CURRENT_FOOTPRINT_INVERSE_REFERENCE_QUERY_SOURCE as SOURCE,qualifyCurrentFootprintInverseReferenceQuerySource} from "../src/current-footprint-inverse-reference-query-source.ts";
import {CURRENT_FOOTPRINT_INVERSE_REFERENCE_WORKER_INPUT_PROGRAMS as PROGRAMS} from "../src/current-footprint-inverse-reference-worker-input-programs.ts";
import {CURRENT_FOOTPRINT_INVERSE_REFERENCE_WORKER_TOPICS as TOPICS} from "../src/current-footprint-inverse-reference-worker-source.ts";
import {currentFootprintInverseGetMethodGraph as fixture} from "./fixtures/current-footprint-inverse-get-method-graph.ts";
import {INSTALLED_EASYEDA_SOURCE_SKIP_REASON,readConfiguredEasyedaAsset} from "./helpers/installed-easyeda-source.ts";

void test("new reference descriptors retain original identities without invoking spent GET guards",async context=>{
 const full=await readConfiguredEasyedaAsset(FILES.worker.relativePath);if(full===null){context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON);return;}qualifyCurrentFootprintInverseReferenceQuerySource(full,"worker");
 const runtime=createContext({});runInContext(fixture(full),runtime,{timeout:1000});
 const setup=`(()=>{const i=inertGetCompletion,project=i.project,bus=i.bus;const pcb={${full.slice(SOURCE.workerPcbGetAll.start,SOURCE.workerPcbGetAll.end)},${full.slice(SOURCE.workerPcbAll.start,SOURCE.workerPcbAll.end)}},device={${full.slice(SOURCE.workerDeviceGetAll.start,SOURCE.workerDeviceGetAll.end)},${full.slice(SOURCE.workerDeviceAll.start,SOURCE.workerDeviceAll.end)}};project.pcb=Object.assign(Object.create(pcb),{projectManager:project,data:{}});project.device=Object.assign(Object.create(device),{projectManager:project,data:{}});for(const topic of Object.values(${JSON.stringify(TOPICS)}))bus.rpcService(topic,()=>[]);i.delivery[4][1][14]=()=>{throw Error("spent GET guard was invoked");};globalThis.referenceInput={I:i.I,oldRoots:i.delivery[4][1]};})()`;
 runInContext(setup,runtime,{timeout:1000});
 const evaluate=(source:string):unknown=>runInContext(source,runtime,{timeout:1000});
 const invoke=(role:keyof typeof PROGRAMS,receiver:string,args=""):unknown=>runInContext(`(${PROGRAMS[role]}).call(${receiver}${args?`,${args}`:""})`,runtime,{timeout:1000});
 runtime["newRoots"]=invoke("roots","referenceInput.oldRoots","referenceInput.I");runtime["newMethods"]=invoke("methods","newRoots");runtime["graphMethods"]=invoke("graphMethods","newMethods");assert.equal(runInContext("graphMethods.length===6&&graphMethods[5]()===true",runtime),true);
 for(const kind of Object.keys(TOPICS)){runtime["namespace"]=invoke("namespace","newRoots",JSON.stringify(kind));runtime["service"]=invoke("service","namespace");runtime["scopeWrapper"]=evaluate("({object:{e:namespace[6],s:service[3],t:()=>[]}})");runtime["link"]=invoke("serviceScope","scopeWrapper","referenceInput.I,service");runtime["handlerWrapper"]=evaluate("({object:{e:inertGetCompletion.project}})");runtime["bound"]=invoke("handlerScope","handlerWrapper","referenceInput.I,link");assert.equal(runInContext("bound[2]()",runtime),true);runtime["wrongHandlerWrapper"]=evaluate("({object:{n:inertGetCompletion.project}})");assert.throws(()=>{invoke("handlerScope","wrongHandlerWrapper","referenceInput.I,link");});assert.equal(runInContext("namespace[9]()&&service[4]()",runtime),true);let keys="footprint";if(kind==="pcb-all"){keys="pcb";}else if(kind==="device-all"){keys="device";}assert.equal(runInContext(`namespace[2]===inertGetCompletion.project.${keys}&&service[2]===namespace[5][0]&&service[3]===namespace[5][0].callback`,runtime),true);}
 runtime["namespace"]=invoke("namespace","newRoots",JSON.stringify("footprint-derived"));assert.throws(()=>{invoke("modelRoster","namespace",JSON.stringify("a".repeat(16)));});
 assert.throws(()=>{invoke("model","namespace",JSON.stringify("a".repeat(16)));});
 runInContext("inertGetCompletion.project.pcb.data.unexpected={uuid:\"b\"}",runtime);assert.throws(()=>{invoke("namespace","newRoots",JSON.stringify("pcb-all"));});
});
