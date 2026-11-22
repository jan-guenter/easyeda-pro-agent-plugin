/* oxlint-disable import/max-dependencies -- This inert boundary test compares the new fixed-purpose codec and owner methods against the unchanged historical codec and profile. */
/** Inert real Inspector contexts only; no application or native owner. */
import assert from "node:assert/strict";
import {Session} from "node:inspector/promises";
import type {Runtime} from "node:inspector";
import {test} from "node:test";
import {createContext,runInContext} from "node:vm";
import {z} from "zod";
import {currentSchematicWireTitleFtV5Filter} from "../src/current-schematic-wire-title-ft-v5-protocol.ts";
import {captureCurrentSchematicWireGlobals} from "../src/current-schematic-wire-globals-collector.ts";
import {CURRENT_SCHEMATIC_WIRE_GLOBALS_FLAGS as FLAGS,CURRENT_SCHEMATIC_WIRE_GLOBALS_PROGRAMS as PROGRAMS,currentSchematicWireGlobalsCases,currentSchematicWireGlobalsProgram,currentSchematicWireGlobalsWire,qualifyCurrentSchematicWireGlobalsHelper} from "../src/current-schematic-wire-globals-protocol.ts";
import type {CurrentSchematicWireGlobalsCommand as Command} from "../src/current-schematic-wire-globals-protocol.ts";

import {currentSchematicWireWriterV5NativeRequest} from "../src/current-schematic-wire-writer-v5-protocol.ts";
import {currentSchematicWireWriterV4NativeRequest} from "../src/current-schematic-wire-writer-v4-protocol.ts";
import {CURRENT_SCHEMATIC_WIRE_WRITER_V5_NATIVE_PROFILE as V5} from "../src/current-schematic-wire-writer-v5-native-profile.ts";
import {CURRENT_SCHEMATIC_WIRE_WRITER_V4_NATIVE_PROFILE as V4} from "../src/current-schematic-wire-writer-v4-native-profile.ts";

async function fixture(mode:"valid"|"getter"|"numeric"|"metadata"|"drift"|"ft-filter"):Promise<void>{
 const session=new Session();session.connect();const name=`wire-globals-${mode}`;const contexts:{unique:string;id:number}[]=[];const helpers:{id:string;length:number|undefined;url:string}[]=[];
 session.on("Runtime.executionContextCreated",event=>{const row=z.looseObject({name:z.string(),uniqueId:z.string(),id:z.number()}).parse(event.params.context);if(row.name===name){contexts.push({unique:row.uniqueId,id:row.id});}});
 session.on("Debugger.scriptParsed",event=>{helpers.push({id:event.params.scriptId,length:event.params.length,url:event.params.url});});
 try{await session.post("Runtime.enable");await session.post("Debugger.enable");const context=createContext({},{name});
 runInContext("globalThis.getterCalls=0;globalThis.ftObjectPair=[{},function callback(){}];globalThis.ftArrayPair=[[],function callback(){}]",context);
 if(mode==="getter"){runInContext('Object.defineProperty(globalThis,"Map",{get(){getterCalls+=1;return null;}})',context);}
 if(mode==="numeric"){runInContext('Object.defineProperty(Array.prototype,"0",{set(){getterCalls+=1;},configurable:true})',context);}
 const selected=contexts[0];assert.ok(selected!==undefined&&contexts.length===1);let last=0,normal=0,sources=0;const phases:string[]=[];
 const request=(command:Command):Promise<unknown>=>{normal+=1;phases.push(command.phase);last=helpers.length;
  if(mode==="metadata"&&command.phase==="wire-globals-properties-function-0"){return Promise.resolve({result:[]});}
  if(command.method==="Runtime.callFunctionOn"){return session.post(command.method,command.params);}
  if(command.method==="Runtime.getProperties"){return session.post(command.method,command.params);}
  throw new Error("separate-helper-custody");};
 const pending=captureCurrentSchematicWireGlobals({uniqueContextId:selected.unique,assertCurrent:()=>{assert.equal(contexts.length,1);},request,qualifyHelper:async(command,program)=>{assert.equal(currentSchematicWireGlobalsProgram(command),program);const rows=helpers.slice(last).filter(row=>row.length===program.length+2&&row.url==="");assert.equal(rows.length,1);const row=rows[0];assert.ok(row!==undefined);const source=await session.post("Debugger.getScriptSource",{scriptId:row.id});qualifyCurrentSchematicWireGlobalsHelper(source.scriptSource,program);sources+=1;}});
 if(mode==="valid"||mode==="drift"||mode==="ft-filter"){const actual=await pending;assert.equal(actual.packets.length,46);assert.equal(normal,46);assert.equal(sources,7);assert.notEqual(actual.reflection,actual.tuple);assert.equal(phases.at(-1),"wire-globals-continuity");
 if(mode==="ft-filter"){
  const pairs:string[]=[];for(const key of["ftObjectPair","ftArrayPair"]){const reply=await session.post("Runtime.evaluate",{expression:`globalThis.${key}`,contextId:selected.id});assert.ok(reply.result.objectId!==undefined);pairs.push(reply.result.objectId);}
  runInContext('Object.defineProperty(globalThis,"Array",{get(){getterCalls+=1;return null;}})',context);
  for(const[index,pair]of pairs.entries()){const command=currentSchematicWireTitleFtV5Filter(pair,actual.tuple);const params:Runtime.CallFunctionOnParameterType&Readonly<{throwOnSideEffect:true}>={...command.params,arguments:command.params.arguments.map(arg=>({objectId:arg.objectId}))};const raw=await session.post("Runtime.callFunctionOn",params);assert.equal(raw.result.type,"boolean");assert.equal(raw.result.value,index===1);assert.equal(raw.exceptionDetails,undefined);}
 }
 if(mode==="drift"){runInContext('Object.defineProperty(globalThis,"Map",{get(){getterCalls+=1;return null;}})',context);const result=await session.post("Runtime.callFunctionOn",{...FLAGS,objectId:actual.reflection,functionDeclaration:PROGRAMS.continuity,arguments:[{objectId:actual.roots},{objectId:actual.tuple}],returnByValue:true});assert.equal(result.result.type,"string");assert.ok(result.exceptionDetails!==undefined);}
}
 else{await assert.rejects(pending);assert.ok(normal<=46);if(mode==="getter"){assert.equal(phases.at(-1),"wire-globals-globals");}if(mode==="metadata"){assert.equal(phases.at(-1),"wire-globals-properties-function-0");}}
 assert.equal(runInContext("getterCalls",context),0);
 }finally{session.disconnect();}
}
void test("readonly Wire globals qualify actual same-context reflection and the exact19 parser tuple before Modify",async()=>{await fixture("valid");});
void test("V5 actual retained native Array predicate classifies both held input shapes while an ambient Array getter remains uncalled",async()=>{await fixture("ft-filter");});
void test("retained actual global continuity rejects a later binding accessor without invoking it",async()=>{await fixture("drift");});
void test("global accessors, numeric inherited setters and wrong native metadata cannot issue a tuple or invoke hooks",async()=>{for(const mode of ["getter","numeric","metadata"]as const){await fixture(mode);}});

/** Actual Core methods with inert source/transport seams. The synthetic map
 * cannot issue a production owner, context or native receipt. */
interface CoreHarness {captureSchematicWireGlobals:(args:object)=>Promise<unknown>;end:()=>Promise<void>;exited:boolean;observation:object|null}
async function coreHarness(readFailure?:Error):Promise<Readonly<{owner:CoreHarness;args:object;entered:Promise<boolean>;capture:ReturnType<typeof Promise.withResolvers<unknown>>;ends:()=>number}>>{
 const {readFile}=await import("node:fs/promises");const {stripTypeScriptTypes}=await import("node:module");const {runInNewContext}=await import("node:vm");
 const source=await readFile(new URL("../src/current-pcb-diagnostic-owner.ts",import.meta.url),"utf8");
 const from=source.indexOf("  public captureSchematicWireGlobals("),to=source.indexOf("  public async openGeneratedSchematicWireEdit",from);
 assert.ok(from!==-1&&to>from);let actual=source.slice(from,to).replaceAll("this.#","this._").replace("#observeSchematicWireGlobalsEvent","_observeSchematicWireGlobalsEvent").replace("async #endSchematicWireGlobalsAfterOriginalExit","async end");
 actual=stripTypeScriptTypes(`class Host{${actual}}\nHost`);
 const args={};const realm={sessionId:"session27",uniqueContextId:"context29",contextId:31};const capture=Promise.withResolvers<unknown>();const entered=Promise.withResolvers<boolean>();const originals=new WeakMap<object,unknown>();
 let owner:CoreHarness|null=null;let ended=0;
 class Pipe {
  readonly #failure=readFailure;readonly #capture=capture;readonly #status=Object.freeze({pendingRequestId:null});
  public observeSchematicWireGlobals():Promise<unknown>{
   // oxlint-disable-next-line typescript/prefer-promise-reject-errors -- This inert read preserves a raw original rejection rather than replacing its value.
   return Promise.reject(this.#failure);
  }
  public status():Readonly<{pendingRequestId:null}>{return this.#status;}
  public endSchematicWireGlobalsAfterOriginalExit():void{ended+=1;this.#capture.reject();}
 }
 const pipe=new Pipe();const context={schematicWireGlobalsContext:():typeof realm=>realm};const selected={pipe,context,current:():void=>{assert.equal(context.schematicWireGlobalsContext(),realm);}};
 const Host:unknown=runInNewContext(actual,{wireGlobalsOriginals:originals,wireV5TitleOriginals:new WeakMap(),CurrentSchematicWireWriterV5Pipe:Pipe,assertOriginalCurrentSchematicWireWriterV5Owner:(value:unknown):void=>{assert.equal(value,owner);},canonicalJson:JSON.stringify,currentSchematicWireGlobalsProgram:()=>null,error:(value:string)=>new Error(value),captureCurrentSchematicWireGlobals:(binding:{request:(command:unknown)=>Promise<unknown>}):Promise<unknown>=>{entered.resolve(true);return readFailure===undefined?capture.promise:binding.request({phase:"wire-globals-properties-literal",method:"Runtime.getProperties",params:{objectId:"tuple27",ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}});},exact:(value:unknown,keys:readonly string[])=>typeof value==="object"&&value!==null&&JSON.stringify(Object.keys(value))===JSON.stringify(keys),Promise});
 const HostConstructor=z.custom<new()=>CoreHarness>(value=>typeof value==="function").parse(Host);owner=new HostConstructor();
 const mutable=z.custom<Record<string,unknown>>(value=>typeof value==="object"&&value!==null).parse(owner);
 Object.assign(mutable,{_schematicSdkBinding:"holder27",_schematicStages:new Set(["preflight"]),_schematicReadContext:()=>selected,_verify:()=>Promise.resolve(),_send:Promise.resolve(),_request:(_input:unknown,current:()=>void):Promise<unknown>=>{current();return Promise.resolve({written:true});},_terminationObserved:false,_terminationObservation:null});
 Object.defineProperties(owner,{exited:{get:()=>mutable["_terminationObserved"],set:(value:boolean)=>{mutable["_terminationObserved"]=value;}},observation:{get:()=>mutable["_terminationObservation"],set:(value:object|null)=>{mutable["_terminationObservation"]=value;}}});
 return{owner,args,entered:entered.promise,capture,ends:()=>ended};
}
void test("Core retains one original globals Promise before I/O and a thrown undefined remains sticky without replay",async()=>{
 const h=await coreHarness(),pending=h.owner.captureSchematicWireGlobals(h.args);await h.entered;
 assert.equal(h.owner.captureSchematicWireGlobals(h.args),pending);assert.throws(()=>h.owner.captureSchematicWireGlobals({}));
 // Rejecting without an argument retains the actual undefined failure value.
 h.capture.reject();await assert.rejects(pending,cause=>cause===undefined);assert.equal(h.owner.captureSchematicWireGlobals(h.args),pending);
});
void test("only observed original root and empty Job end the reader before joining its original pending collector",async()=>{
 const h=await coreHarness(),pending=h.owner.captureSchematicWireGlobals(h.args);const rejected=assert.rejects(pending,cause=>cause===undefined);await h.entered;
 await assert.rejects(h.owner.end(),/RETAIN_ORIGINAL_JOB/u);assert.equal(h.ends(),0);
 h.owner.exited=true;h.owner.observation={originalRootExited:true,originalJobEmpty:true};await h.owner.end();await rejected;assert.equal(h.ends(),1);await h.owner.end();assert.equal(h.ends(),1);
});

void test("an actual Core read rejection preserves its exact original error across the native write join",async()=>{const failure=new Error("inert-original-read"),h=await coreHarness(failure);const pending=h.owner.captureSchematicWireGlobals(h.args);await assert.rejects(pending,error=>error===failure);assert.equal(h.owner.captureSchematicWireGlobals(h.args),pending);});

void test("the V5 native frame binds every fixed globals selector and cannot enter the historical V4 wire",()=>{
 assert.equal(V4.renderer.total,6910);assert.equal(V5.renderer.total,V4.renderer.total+53+V5.title.cdpRequests);
 for(const command of currentSchematicWireGlobalsCases()){
  const wire=currentSchematicWireGlobalsWire(command,V5.renderer.total,"session27");
  const bytes=Buffer.from(`${JSON.stringify(wire)}\0`);
  assert.equal(currentSchematicWireWriterV5NativeRequest(bytes)["action"],"schematic-wire-v5-globals");
  assert.throws(()=>currentSchematicWireWriterV4NativeRequest(bytes));
  assert.throws(()=>currentSchematicWireWriterV5NativeRequest(Buffer.from(`${JSON.stringify({...wire,id:V5.renderer.total+1})}\0`)));
  assert.throws(()=>currentSchematicWireWriterV5NativeRequest(Buffer.from(`${JSON.stringify({...wire,callerCode:"arbitrary"})}\0`)));
 }
});
