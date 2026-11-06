/** Actual fixed proofs on inert own-reference data and real finite wire. */
/* oxlint-disable import/max-dependencies -- Exercise the actual cursor, Cache/Response proof reuse, native wires and source-only Inspector positions together. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import vm from "node:vm";
import { CurrentPcbViaLocalUploadCursor } from "../src/current-pcb-via-local-upload-cursor.ts";
import type { CurrentPcbViaLocalUploadBindings, CurrentPcbViaLocalUploadHeld } from "../src/current-pcb-via-local-upload-cursor.ts";
import { CURRENT_PCB_VIA_LOCAL_UPLOAD_ROLES as ROLES, currentPcbViaLocalUploadNativeCases } from "../src/current-pcb-via-local-upload-protocol.ts";
import type { CurrentPcbViaLocalUploadCommand } from "../src/current-pcb-via-local-upload-protocol.ts";
import { currentPcbViaLocalUploadWire } from "../src/current-pcb-via-local-upload-wire.ts";
import { currentPcbViaWriteNativeRequest } from "../src/current-pcb-via-write-protocol.ts";
import { currentSchematicDisplayWriteNativeRequest } from "../src/current-schematic-display-write-protocol.ts";
import { diagnosticNativeRequest } from "../src/current-pcb-diagnostic-protocol.ts";
import { CURRENT_NATIVE_CACHE_RESPONSE_INTRINSIC_CALLS as INTRINSICS } from "../src/current-native-cache-response-intrinsics.ts";
import { qualifyCurrentPcbViaSaveSource } from "../src/current-pcb-via-save-source.ts";

const branch="a".repeat(32);const key=`https://client/upload/${branch}?key=${"b".repeat(32)}`;const body="actual original Save body\n\"😀";
function fixture(): Readonly<{cursor:CurrentPcbViaLocalUploadCursor;packet:(role:typeof ROLES[number])=>object;state:{resumes:number;failed:boolean;requests:number};run:(source:string)=>unknown}> {
  const context=vm.createContext({});vm.runInContext(`let hooks=0;function Cache(){}function CacheStorage(){}function Response(){}
for(const[p,names]of [[Cache.prototype,["put","match","delete","keys"]],[CacheStorage.prototype,["open","keys","has","delete"]],[Response.prototype,["clone","arrayBuffer"]]])for(const k of names)Object.defineProperty(p,k,{value:function(){hooks++;throw Error("native operation")},writable:true,enumerable:true,configurable:true});
for(const k of ["url","redirected","type","status","statusText","ok","headers","body","bodyUsed"])Object.defineProperty(Response.prototype,k,{get:function(){hooks++;throw Error("getter")},enumerable:true,configurable:true});Object.defineProperty(globalThis,"caches",{get:function(){hooks++;throw Error("getter")},enumerable:true,configurable:true});
const intrinsics=(${INTRINSICS.members.program}).call((${INTRINSICS.constructors.program})());const wrapper={cache:Object.create(Cache.prototype)},r={},PROJECT={consistencyManager:r,localCache:wrapper};Object.defineProperty(globalThis,"PROJECT",{value:PROJECT});
const body=[PROJECT,{},r,100,42,${JSON.stringify(body)}],local=[PROJECT,[body[5]],false,undefined],response=Object.create(Response.prototype),n=async()=>{},put=[wrapper,${JSON.stringify(key)},response,undefined],cache=[put,[],wrapper,wrapper.cache,response,intrinsics,${JSON.stringify(key)},body[5],"p","${branch}"],pending=[...put,0,n],success=[...put,0,n];
const payload={dataStr:body[5],dataUrl:${JSON.stringify(key)}},callback=async()=>{},c=async()=>{},o=()=>{},buffer=[payload,null,null,null,PROJECT,callback,500,c,o],scheduled=[payload,7,new Promise(()=>{}),()=>{},PROJECT,callback,500,c,o],returned=[...local,body[5]];`,context);
  const objects=new Map<string,unknown>();for(const name of ["body","local","cache","pending","success","buffer","scheduled","returned"]) { objects.set(name,vm.runInContext(name,context)); }
  const actual=new WeakMap<object,CurrentPcbViaLocalUploadHeld>();const state={resumes:0,failed:false,requests:0};
  const binding:CurrentPcbViaLocalUploadBindings=Object.freeze({body,bodyObject:"body",branchUuid:branch,assertCurrent:():Promise<void>=>Promise.resolve(),requireHeld:(packet:object):CurrentPcbViaLocalUploadHeld=>{const held=actual.get(packet);assert.ok(held!==undefined);return held;},
    request:(command:CurrentPcbViaLocalUploadCommand):Promise<unknown>=>{state.requests+=1;if(command.method==="Runtime.getProperties") { return Promise.resolve({result:[],internalProperties:[{name:"[[Prototype]]",value:{type:"object",className:"Promise",description:"Promise",objectId:"prototype"}},{name:"[[PromiseState]]",value:{type:"string",value:command.role==="cache"?"fulfilled":"pending"}},{name:"[[PromiseResult]]",value:{type:"undefined"}}]}); }
      assert.equal(command.method,"Runtime.callFunctionOn");const fn:unknown=vm.runInContext(`(${command.params.functionDeclaration})`,context);assert.equal(typeof fn,"function");assert.ok(typeof fn==="function");const args=command.params.arguments.map(value=>"value" in value?value.value:objects.get(value.objectId));const value:unknown=Reflect.apply(fn,objects.get(command.params.objectId),args);return Promise.resolve({result:{type:"boolean",value}});},
    resume:(held:CurrentPcbViaLocalUploadHeld):Promise<void>=>{assert.equal(actual.get(held.packet),held);state.resumes+=1;return Promise.resolve();},fail:():void=>{state.failed=true;}});
  return {cursor:new CurrentPcbViaLocalUploadCursor(binding),state,run:(source:string):unknown=>vm.runInContext(source,context),packet:(role):object=>{const marker=Object.freeze({original:true});const names={localIngress:"local",headEntry:"cache",headPromise:"pending",headSuccess:"success",bufferIngress:"buffer",bufferScheduled:"scheduled",localReturned:"returned"};actual.set(marker,Object.freeze({packet:marker,role,joinedId:names[role],key:role==="headEntry"?key:null,cache:role==="headEntry"?{role:"localUpload",joinedId:"cache"}:null,promise:role==="headPromise"?{objectId:"putPromise"}:null,bufferPromise:role==="bufferScheduled"?"bufferPromise":null}));return marker;}};
}
void test("the exact local Save body put and callback schedule resume seven original pauses without native cache invocation",async()=>{
  const f=fixture();for(const role of ROLES){await f.cursor.continue(f.packet(role));}f.cursor.requireCompleted();assert.equal(f.state.resumes,7);assert.equal(f.state.requests,9);assert.equal(f.state.failed,false);assert.equal(f.run("hooks"),0);await assert.rejects(f.cursor.continue(f.packet("localIngress")));assert.equal(f.state.resumes,7);
});
void test("foreign body, parse flag, cache response or scheduled callback refuses and never replays its original pause",async()=>{
  for(const change of ['local[1][0]="foreign"','local[2]=true','Object.defineProperty(local,"2",{get(){hooks++;return false}})']){const f=fixture();f.run(change);const packet=f.packet("localIngress");await assert.rejects(f.cursor.continue(packet));assert.equal(f.state.resumes,0);assert.equal(f.run("hooks"),0);await assert.rejects(f.cursor.continue(packet));}
  const f=fixture();for(const role of ROLES.slice(0,5)){await f.cursor.continue(f.packet(role));}f.run('scheduled[7]=async()=>{}');await assert.rejects(f.cursor.continue(f.packet("bufferScheduled")));assert.equal(f.state.resumes,5);
});
void test("all sixteen local commands roundtrip only through the dedicated Via wire",()=>{
  for(const command of currentPcbViaLocalUploadNativeCases()){const bytes=Buffer.from(`${JSON.stringify({id:1,...command,viaLocalUploadCommand:true,sessionId:"original-worker"})}\0`);assert.deepEqual(currentPcbViaWriteNativeRequest(bytes),currentPcbViaLocalUploadWire(command,1).request);assert.throws(()=>diagnosticNativeRequest(bytes));assert.throws(()=>currentSchematicDisplayWriteNativeRequest(bytes));if(command.method==="Runtime.callFunctionOn"){assert.throws(()=>currentPcbViaLocalUploadWire({...command,params:{...command.params,functionDeclaration:"function(){return true}"}},1));}}
});
void test("the source-only compiled original calls expose the exact two caller positions without executing vendor code",async context=>{
  let source:string;try{source=await readFile('/mnt/c/Program Files/easyeda-pro/resources/app/assets/pro-mgr/3.2.185.bf63a159/js/project-worker.js','utf8');}catch(error){if(error!==null&&typeof error==="object"&&"code" in error&&error.code==="ENOENT"){context.skip("Pinned installed source unavailable");return;}throw error;}
  qualifyCurrentPcbViaSaveSource(source);const inspector=new Session();inspector.connect();try{await inspector.post("Runtime.enable");await inspector.post("Debugger.enable");const compiled=await inspector.post("Runtime.compileScript",{expression:source,sourceURL:"source-only-local-proof.js",persistScript:true});assert.ok(compiled.scriptId!==undefined);
    for(const column of [17_322,131_307]){const reply:unknown=await inspector.post("Debugger.getPossibleBreakpoints",{start:{scriptId:compiled.scriptId,lineNumber:110,columnNumber:column},end:{scriptId:compiled.scriptId,lineNumber:110,columnNumber:column+1},restrictToFunction:true});assert.deepEqual(reply,{locations:[{scriptId:compiled.scriptId,lineNumber:110,columnNumber:column,type:"call"}]});}
  }finally{inspector.disconnect();}
});
