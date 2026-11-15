/* oxlint-disable promise/prefer-await-to-then, unicorn/prefer-top-level-await -- Held main-thread parser callbacks require retained reentrant failure cleanup. */
import {Session} from "node:inspector/promises";
import {parentPort,workerData} from "node:worker_threads";
import {z} from "zod";
import {CurrentSchematicWireParserCursor} from "../../src/current-schematic-wire-parser-cursor.ts";
import type {CurrentSchematicWireParserData,CurrentSchematicWireParserInput} from "../../src/current-schematic-wire-parser-cursor.ts";
import {CurrentSchematicWireParserHelperCursor} from "../../src/current-schematic-wire-parser-helper-cursor.ts";
import {CURRENT_SCHEMATIC_WIRE_PARSER_FLAGS as FLAGS} from "../../src/current-schematic-wire-parser-protocol.ts";
import {CURRENT_SCHEMATIC_WIRE_PARSER_POINTS as POINTS,decodeCurrentSchematicWireParserPause as decode} from "../../src/current-schematic-wire-parser-source.ts";
import type {CurrentSchematicWireParserRole as Role} from "../../src/current-schematic-wire-parser-source.ts";

const config=z.strictObject({key:z.string(),scriptId:z.string(),variant:z.union([z.literal(0),z.literal(1)])}).parse(workerData);const port=parentPort??(():never=>{throw new Error("worker port")})();port.on("message",()=>{
 // Keep this observer alive while an original main-thread fixture frame is held.
});const session=new Session();session.connectToMainThread();const points=new Map<string,Readonly<{role:Role;stage:"entry"|"returned"}>>();const sources=new Set<string>();const programs:string[]=[];let active:string|null=null;let stopped=false;let released=false;const removed=new Set<string>();let holder="";let native="";let data:CurrentSchematicWireParserData|null=null;let reads=0;let helperReads=0;let pauses=0;let resumes=0;const stages:number[]=[];
function need(condition:boolean,message:string):asserts condition{if(!condition){throw new Error(message);}}
session.on("Debugger.scriptParsed",event=>{if(active!==null&&event.params.url===""&&event.params.length===active.length+2){sources.add(event.params.scriptId);}});
async function post(method:string,params:unknown):Promise<unknown>{if(method==="Runtime.callFunctionOn"&&params!==null&&typeof params==="object"){const fn:unknown=Reflect.get(params,"functionDeclaration");need(typeof fn==="string","helper bytes");active=fn;programs.push(`(${fn})`);}const pending:unknown=Reflect.apply(session.post.bind(session),session,[method,params]);const raw:unknown=await pending;active=null;if(raw!==null&&typeof raw==="object"&&"exceptionDetails" in raw){const d:unknown=Reflect.get(raw,"exceptionDetails");const e:unknown=d!==null&&typeof d==="object"?Reflect.get(d,"exception"):null;const message:unknown=e!==null&&typeof e==="object"?Reflect.get(e,"value"):null;if(message==="SCH209_WIRE_PARSER_CONTEXT"){throw new Error(message);}throw new Error("unexpected parser helper exception");}return raw;}
async function run(cursor:CurrentSchematicWireParserCursor):Promise<CurrentSchematicWireParserData>{const first=reads;for(let command=cursor.next();command!==null;command=cursor.next()){cursor.reserve(command);reads+=1;cursor.accept(command,await post(command.method,command.params));}stages.push(reads-first);return cursor.requireCompleted();}
async function collect(input:CurrentSchematicWireParserInput):Promise<CurrentSchematicWireParserData>{
 if(input.stage!=="context"){let refused=false;try{const candidate=new CurrentSchematicWireParserCursor({...input,previous:structuredClone(input.previous)});candidate.next();}catch{refused=true;}need(refused,"copied parser packet accepted");}
 const cursor=new CurrentSchematicWireParserCursor(input);const result=await run(cursor);
 if(input.stage!=="context"){let refused=false;try{const candidate=new CurrentSchematicWireParserCursor(input);candidate.next();}catch{refused=true;}need(refused,"original parser packet replayed");}return result;
}
async function remove():Promise<void>{for(const breakpointId of points.keys()){if(!removed.has(breakpointId)){removed.add(breakpointId);await session.post("Debugger.removeBreakpoint",{breakpointId});}}}
async function release():Promise<void>{need(!released,"parser cleanup replay");released=true;await session.post("Runtime.releaseObjectGroup",{objectGroup:FLAGS.objectGroup});}
async function fail(error:unknown):Promise<void>{if(stopped){return;}stopped=true;try{await remove();if(!released){await release();}await session.post("Debugger.resume");}catch{
 // The inert source fixture may already have returned while failure is retained.
}port.postMessage({error:String(error),reads,helperReads,stages,pauses,resumes});session.disconnect();port.close();}
session.on("Debugger.paused",event=>{void(async():Promise<void>=>{
 if(stopped){return;}pauses+=1;const id=event.params.hitBreakpoints?.[0];const point=id===undefined?undefined:points.get(id);need(point!==undefined&&id!==undefined,"unexpected parser point");const held=decode(event.params,config.variant,point.role,point.stage,config.scriptId,id);const first={holder,native,scriptId:config.scriptId,variant:config.variant};const caller=event.params.callFrames[1];const previous=data;
 if(point.role==="docParse"&&point.stage==="entry"){need(caller!==undefined,"original dispatcher caller");data=await collect({...first,stage:"context",frame:held.frame,callerFrame:caller.callFrameId});}
 else if(point.role==="sheetParse"&&point.stage==="entry"){need(previous!==null,"original doc packet");data=await collect({stage:"sheet",frame:held.frame,previous});}
 else if(point.role==="sheetAst"&&point.stage==="entry"){need(previous!==null,"original sheet packet");const cursor=new CurrentSchematicWireParserHelperCursor({frame:held.frame,scriptId:config.scriptId,variant:config.variant});for(let command=cursor.next();command!==null;command=cursor.next()){cursor.reserve(command);helperReads+=1;cursor.accept(command,await post(command.method,command.params));}data=await collect({stage:"astEntry",frame:held.frame,helpers:cursor.requireCompleted(),previous});}
 else if(point.role==="astUpdate"&&point.stage==="entry"){need(previous!==null&&caller!==undefined,"original sheet publication");await session.post("Runtime.evaluate",{expression:`globalThis.${config.key}.fault()`});data=await collect({stage:"published",frame:held.frame,callerFrame:caller.callFrameId,previous});}
 else if(point.stage==="returned"&&point.role!=="shapeDidTransact"){need(previous!==null&&held.promise!==null,"original parser return");data=await collect({stage:"returned",frame:held.frame,role:point.role,promise:held.promise,previous});}
 if(point.role==="docParse"&&point.stage==="returned"){
  need(data!==null,"last parser return packet");data=await collect({stage:"settled",previous:data});const actual:string[]=[];for(const scriptId of sources){const reply=await session.post("Debugger.getScriptSource",{scriptId});actual.push(reply.scriptSource);}need(sources.size===20&&JSON.stringify(actual.toSorted())===JSON.stringify(programs.toSorted()),"parser complete helper sources");await remove();await release();await session.post("Debugger.resume");resumes+=1;stopped=true;port.postMessage({reads,helperReads,stages,pauses,resumes,sources:sources.size,returns:data.normalReturnPromisesCompared,published:data.sameAstPublishedCompared,settled:data.allSixRetainedPromisesFulfilledCompared,parserCompleted:data.parserCompleted,childRpcJoined:data.childRpcJoined,saveAuthorized:data.saveAuthorized});session.disconnect();port.close();return;
 }
 await session.post("Debugger.resume");resumes+=1;
})().catch(fail);});
async function initialize():Promise<void>{await session.post("Debugger.enable");for(const name of["holder","native"]){const result=await session.post("Runtime.evaluate",{expression:`globalThis.${config.key}.${name}`});need(result.result.objectId!==undefined,"original parser fixture root");if(name==="holder"){holder=result.result.objectId;}else {native=result.result.objectId;}}
 for(const role of ["shapeDidTransact","docParse","sheetAst","sheetParse","astUpdate","astPassSchematic","astPassContent"] as const){const sites=POINTS[config.variant].points[role];for(const stage of ["entry","returned"] as const){const site=sites[stage];const point=await session.post("Debugger.setBreakpoint",{location:{scriptId:config.scriptId,...site}});points.set(point.breakpointId,{role,stage});}}port.postMessage({ready:true});}
void initialize().catch(fail);
