/** Actual retained Core methods with inert source/transport seams only.
 * Synthetic maps and replies cannot issue a production native owner. */
/* oxlint-disable eslint/max-classes-per-file -- The pipe and coordinator doubles capture one original fixture's state and must retain separate constructor identities. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {stripTypeScriptTypes} from "node:module";
import {test} from "node:test";
import {runInNewContext} from "node:vm";
import {z} from "zod";
import {CURRENT_SCHEMATIC_WIRE_GLOBALS_FLAGS as FLAGS,CURRENT_SCHEMATIC_WIRE_GLOBALS_PROGRAMS as PROGRAMS,currentSchematicWireGlobalsProgram,qualifyCurrentSchematicWireGlobalsHelper,validateCurrentSchematicWireGlobalsCommand} from "../src/current-schematic-wire-globals-protocol.ts";
import type {CurrentSchematicWireGlobalsCommand} from "../src/current-schematic-wire-globals-protocol.ts";
import {validateCurrentSchematicWireV5TitleCommand} from "../src/current-schematic-wire-v5-title-protocol.ts";
import type {CurrentSchematicWireV5TitleCommand} from "../src/current-schematic-wire-v5-title-protocol.ts";
import {CURRENT_SCHEMATIC_WIRE_WRITER_V5_NATIVE_PROFILE as PROFILE} from "../src/current-schematic-wire-writer-v5-native-profile.ts";

interface Harness{captureSchematicWireGlobals:(args:object)=>Promise<unknown>;prepareSchematicWireV5Titles:(args:object)=>Promise<unknown>;observeGlobalsEvent:(event:unknown)=>boolean;requireEncoderSource:(args:object)=>unknown}
interface Original{readonly args:object;readonly pending:Promise<unknown>;readonly current:()=>void;readonly settled:boolean;readonly capture:unknown;readonly helper:{program:string;scripts:string[]}|null}
function fixtureData(value:unknown):unknown{return structuredClone(value);}
async function harness(failTitle:number|null):Promise<Readonly<{owner:Harness;args:object;trace:readonly string[];failure:Error;invalidateRealm:()=>void}>>{
 const source=await readFile(new URL("../src/current-pcb-diagnostic-owner.ts",import.meta.url),"utf8");const from=source.indexOf("  public captureSchematicWireGlobals(");const to=source.indexOf("  public async openGeneratedSchematicWireEdit",from);assert.ok(from!==-1&&to>from);
 const body=source.slice(from,to).replaceAll("this.#","this._").replaceAll(/#(?=[A-Za-z])/gu,"_").replaceAll("_observeSchematicWireGlobalsEvent","observeGlobalsEvent");
 const encoderStart = source.indexOf("export function requireOriginalCurrentSchematicWireV5EncoderSource(");
 const encoderEnd = source.indexOf("export function requireOriginalCurrentSchematicWireV5TitlePreparation(", encoderStart);
 assert.ok(encoderStart !== -1 && encoderEnd > encoderStart);
 const encoder = source.slice(encoderStart + "export ".length, encoderEnd);
 const actual=stripTypeScriptTypes(`${encoder}\nclass Host{${body}\nrequireEncoderSource(args: object):unknown{return requireOriginalCurrentSchematicWireV5EncoderSource(this,args);}}\nHost`);const originals=new WeakMap<object,Original>(),titles=new WeakMap<object,unknown>();let owner:Harness|null=null;
 const args={};const trace:string[]=[];const failure=new Error("inert-original-title-read");let scripts=0,titleReads=0;const realm={sessionId:"session27",uniqueContextId:"context29",contextId:31};const capture={tuple:"native27",reflection:"reflection29",root:"root31",roots:"roots33",packets:[]};
 let currentRealm = realm;
 const targetSource = { scriptSource: "inert target source" };
 const busSource = { scriptSource: "inert bus source" };
 const sourceReceive = { requestId: 27, sessionId: realm.sessionId, scriptId: "source27", frameBytes: 104 };
 const qualifiedSource = { scriptId: "source27", variant: 0 };
 class Pipe{
  readonly #trace=trace;readonly #failure=failure;readonly #status=Object.freeze({pendingRequestId:null});#ended=false;
  public status():Readonly<{pendingRequestId:null}>{return this.#status;}
  public observeSchematicWireGlobals(command:CurrentSchematicWireGlobalsCommand):Promise<unknown>{
   this.#trace.push(command.phase);if(command.method==="Debugger.getScriptSource"){return Promise.resolve({scriptSource:`(${PROGRAMS.continuity})`});}
   assert.equal(command.phase,"wire-globals-check");assert.equal(command.params.objectId,capture.reflection);assert.deepEqual(command.params.arguments,[{objectId:capture.roots},{objectId:capture.tuple}]);scripts+=1;assert.ok(owner!==null);assert.equal(owner.observeGlobalsEvent({sessionId:realm.sessionId,method:"Debugger.scriptParsed",params:{scriptId:`guard${String(scripts)}`,executionContextId:realm.contextId,url:"",length:PROGRAMS.continuity.length+2}}),true);return Promise.resolve({result:{type:"boolean",value:true}});
  }
  public observeSchematicWireV5Title(command:CurrentSchematicWireV5TitleCommand):Promise<unknown>{this.#trace.push(command.phase);titleReads+=1;if(titleReads===failTitle){return Promise.reject(this.#failure);}return Promise.resolve(command.method==="Debugger.getScriptSource"?(titleReads===1?targetSource:busSource):{result:[]});}
  public endSchematicWireGlobalsAfterOriginalExit():void{this.#ended=true;assert.equal(this.#ended,true);throw new Error("unused-inert-exit");}
 }
 interface Transport{readonly request:(command:unknown)=>Promise<unknown>}
 class Coordinator{
  readonly #transport:Transport;
  public constructor(_input:unknown,transport:Transport){this.#transport=transport;}
  public async prepareTitleFtReturnV5():Promise<object>{const command={phase:"wire-title-properties",method:"Runtime.getProperties",params:{objectId:"holder27",ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}};await Promise.all([this.#transport.request(command),this.#transport.request(command)]);return{};}
 }
 const pipe=new Pipe();const context={schematicWireGlobalsContext:():typeof realm=>currentRealm,schematicWireTitleSources:():Readonly<{scriptId:string;busScriptId:string;variant:0}>=>({scriptId:"source27",busScriptId:"bus29",variant:0}),
  schematicCalleeContext:(scriptId:string,variant:number):Readonly<{sessionId:string;scriptId:string}>=>{assert.equal(scriptId,"source27");assert.equal(variant,0);return {sessionId:currentRealm.sessionId,scriptId};}};const selected={pipe,context,current:():void=>{assert.equal(context.schematicWireGlobalsContext(),realm);}};
 const requireCurrentSchematicWireV5BundleSourceReceive = (sourcePipe: unknown, result: unknown, sessionId: string, scriptId: string): object => {
  assert.equal(sourcePipe, pipe); assert.equal(result, targetSource);
  assert.equal(sessionId, sourceReceive.sessionId); assert.equal(scriptId, sourceReceive.scriptId);
  return sourceReceive;
 };
 const qualifyCurrentSchematicWireEncoderSource = (scriptId: string, result: unknown): object => {
  assert.equal(result, targetSource); assert.equal(scriptId, qualifiedSource.scriptId);
  return qualifiedSource;
 };
 const Host:unknown=runInNewContext(actual,{requireCurrentSchematicWireV5BundleSourceReceive,qualifyCurrentSchematicWireEncoderSource,wireGlobalsOriginals:originals,wireV5TitleOriginals:titles,CurrentSchematicWireWriterV5Pipe:Pipe,assertOriginalCurrentSchematicWireWriterV5Owner:(value:unknown):void=>{assert.equal(value,owner);},requireOriginalCurrentSchematicWireGlobals:(value:object,expected:object):unknown=>{const original=originals.get(value);assert.ok(original!==undefined&&original.args===expected&&original.settled);original.current();return original.capture;},canonicalJson:JSON.stringify,currentSchematicWireGlobalsProgram,qualifyCurrentSchematicWireGlobalsHelper,validateCurrentSchematicWireGlobalsCommand:(input:unknown)=>validateCurrentSchematicWireGlobalsCommand(fixtureData(input)),validateCurrentSchematicWireV5TitleCommand:(input:unknown)=>validateCurrentSchematicWireV5TitleCommand(fixtureData(input)),CURRENT_SCHEMATIC_WIRE_GLOBALS_FLAGS:FLAGS,CURRENT_SCHEMATIC_WIRE_GLOBALS_PROGRAMS:PROGRAMS,CURRENT_SCHEMATIC_WIRE_WRITER_V5_NATIVE_PROFILE:PROFILE,CurrentSchematicWireParserServiceCoordinator:Coordinator,captureCurrentSchematicWireGlobals:()=>Promise.resolve(capture),error:(value:string)=>new Error(value),exact:(value:object,keys:readonly string[])=>JSON.stringify(Object.keys(value))===JSON.stringify(keys),record:(value:unknown)=>typeof value==="object"&&value!==null,Promise});
 const Constructor=z.custom<new()=>Harness>(value=>typeof value==="function").parse(Host);owner=new Constructor();const mutable=z.custom<Record<string,unknown>>(value=>typeof value==="object"&&value!==null).parse(owner);
 Object.assign(mutable,{_schematicSdkBinding:"holder27",_schematicStages:new Set(["preflight"]),_schematicReadContext:()=>selected,_verify:()=>Promise.resolve(),_send:Promise.resolve(),_request:(_input:unknown,current:()=>void):Promise<unknown>=>{current();return Promise.resolve({written:true});}});
 await owner.captureSchematicWireGlobals(args);return{owner,args,trace,failure,invalidateRealm:()=>{currentRealm={...realm,uniqueContextId:"foreign-realm"};}};
}
void test("actual V5 Core serializes concurrent original title sends with both qualified global brackets",async()=>{
 const h=await harness(null),pending=h.owner.prepareSchematicWireV5Titles(h.args);assert.equal(h.owner.prepareSchematicWireV5Titles(h.args),pending);assert.throws(()=>h.owner.prepareSchematicWireV5Titles({}));await pending;assert.equal(h.trace.length,20);
 for(let i=0;i<4;i+=1){assert.deepEqual(h.trace.slice(i*5,i*5+5),["wire-globals-check","wire-globals-helper",i<2?"wire-v5-title-bundle-source":"wire-title-properties","wire-globals-check","wire-globals-helper"]);}
});
void test("actual V5 Core retains the original title failure and blocks its queued sibling before another native send",async()=>{
 const h=await harness(3),pending=h.owner.prepareSchematicWireV5Titles(h.args);await assert.rejects(pending,cause=>cause===h.failure);assert.equal(h.owner.prepareSchematicWireV5Titles(h.args),pending);assert.equal(h.trace.length,13);assert.equal(h.trace.filter(phase=>phase==="wire-title-properties").length,1);
});
void test("Core reuses only the original title bundle and rechecks its selected realm without issuing another command", async () => {
 const h = await harness(null);
 const title = h.owner.prepareSchematicWireV5Titles(h.args);
 assert.throws(() => h.owner.requireEncoderSource(h.args), /WIRE_V5_ENCODER_ORIGINAL_SOURCE/u);
 await title;
 const count = h.trace.length;
 const receipt = h.owner.requireEncoderSource(h.args);
 assert.ok(receipt !== null && typeof receipt === "object");
 assert.equal(Reflect.get(receipt, "originalCoreSourceOwnerJoined"), true);
 assert.equal(Reflect.get(receipt, "executionAuthorized"), false);
 assert.equal(Reflect.get(receipt, "saveAuthorized"), false);
 assert.equal(h.owner.requireEncoderSource(h.args), receipt);
 assert.throws(() => h.owner.requireEncoderSource({}), /WIRE_V5_ENCODER_ORIGINAL_SOURCE/u);
 h.invalidateRealm();
 assert.throws(() => h.owner.requireEncoderSource(h.args));
 assert.equal(h.trace.length, count);
});
