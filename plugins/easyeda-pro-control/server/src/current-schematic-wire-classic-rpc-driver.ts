/** Original C-side RPC event owner. All three requests and cleanup share one
 * retained lifecycle; service/native custody remains with the complete factory. */
/* oxlint-disable import/max-dependencies -- Keep the exact closed controls, readers, caller profiles and original Promise cleanup together. */
import { types } from "node:util";
import { z } from "zod";
import { captureCurrentPcbStringClockReply as capture } from "./current-pcb-string-clock-reply.ts";
import { decodeCurrentFootprintCopyClockRpcV2Array as array, decodeCurrentFootprintCopyClockRpcV2ArrayCapture as tuple } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import { CurrentSchematicWireClassicRpcSharedCursor } from "./current-schematic-wire-classic-rpc-shared-cursor.ts";
import type { CurrentSchematicWireClassicRpcSharedData, CurrentSchematicWireClassicRpcSharedInput } from "./current-schematic-wire-classic-rpc-shared-cursor.ts";
import { CurrentSchematicWireClassicRpcSharedReplySelector } from "./current-schematic-wire-classic-rpc-shared-selector.ts";
import { CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_SHARED_FLAGS as FLAGS, validateCurrentSchematicWireClassicRpcSharedCommand as reader } from "./current-schematic-wire-classic-rpc-shared-protocol.ts";
import type { CurrentSchematicWireClassicRpcSharedCommand } from "./current-schematic-wire-classic-rpc-shared-protocol.ts";
import { decodeCurrentSchematicWireClassicRpcPause as decodePause, qualifyCurrentSchematicWireClassicRpcSource as qualify } from "./current-schematic-wire-classic-rpc-source.ts";
import { CURRENT_SCHEMATIC_WIRE_COMPLETION_SOURCE as COMPLETION } from "./current-schematic-wire-completion-source.ts";
import { CURRENT_SCHEMATIC_WIRE_PARSER_HELPERS as HELPERS } from "./current-schematic-wire-parser-source.ts";
import { CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_DRIVER_REQUESTS as LIMIT, CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_DRIVER_POINTS as POINTS, validateCurrentSchematicWireClassicRpcDriverControl as control, currentSchematicWireClassicRpcDriverLocation as pointLocation } from "./current-schematic-wire-classic-rpc-driver-protocol.ts";
import type { CurrentSchematicWireClassicRpcDriverControl, CurrentSchematicWireClassicRpcDriverPoint as Kind } from "./current-schematic-wire-classic-rpc-driver-protocol.ts";
import { CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_ORIGIN_FRAMES as FRAMES, CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_ORIGIN_PROGRAMS as PROGRAMS } from "./current-schematic-wire-classic-rpc-origin.ts";
import { consumeCurrentSchematicWireParserDriverData } from "./current-schematic-wire-parser-driver.ts";
import type { CurrentSchematicWireParserDriver, CurrentSchematicWireParserDriverData } from "./current-schematic-wire-parser-driver.ts";

type Role="closing"|"language"|"titles";
export type CurrentSchematicWireClassicRpcDriverCommand=CurrentSchematicWireClassicRpcSharedCommand|CurrentSchematicWireClassicRpcDriverControl;
export interface CurrentSchematicWireClassicRpcDriverTransport {
 readonly request:(command:CurrentSchematicWireClassicRpcDriverCommand)=>Promise<unknown>;
 readonly assertCurrent:()=>void;readonly assertOriginalExit:()=>void;readonly fail:(cause:unknown)=>void;
}
interface Input {readonly sessionId:string;readonly scriptId:string;readonly holder:string;readonly native:string;readonly variant:0|1;readonly source:unknown;readonly busScriptId:string;readonly busSource:unknown}
interface Attempt {readonly reserved:CurrentSchematicWireClassicRpcDriverCommand;readonly command:CurrentSchematicWireClassicRpcDriverCommand;readonly cleanup:boolean;pending?:Promise<unknown>;raw?:unknown;cause?:unknown}
interface Point {readonly kind:Kind;readonly id:string;removeAttempted:boolean;removed:boolean}
interface SourceCall {readonly program:string;readonly scripts:string[]}
interface Resume {readonly signal:PromiseWithResolvers<null>;eventObserved:boolean;ackObserved:boolean}
interface CallerSite {readonly role:Role;readonly line:number;readonly column:number;readonly endLine:number;readonly endColumn:number}
export interface CurrentSchematicWireClassicRpcDriverData {
 readonly schema:"private.schematic-wire-classic-rpc-events.v1";readonly sourceVariant:0|1;
 readonly allEighteenPausesCompared:true;readonly allEighteenResumesCompared:true;
 readonly allThreeOriginalCallersCaptured:true;readonly allThreeInnerAndOuterResultsCompared:true;
 readonly allAllocatedBreakpointsRemoved:true;readonly objectGroupReleased:false;
 readonly normalRequests:number;readonly cleanupRequests:number;
 readonly suppliedTransportOnly:true;readonly originalNativeOwnerJoined:false;
 readonly serviceDeliveryJoined:false;readonly originalJobExitJoined:false;
 readonly timeoutCleanupVerified:false;readonly rpcCompleted:false;readonly saveAuthorized:false;
}
export interface CurrentSchematicWireParserRpcJoinData {
 readonly schema:"private.schematic-wire-parser-rpc-caller-join.v1";
 readonly originalParserAndThreeRpcCallersCompared:true;
 readonly suppliedTransportOnly:true;readonly originalNativeOwnerJoined:false;
 readonly serviceDeliveryJoined:false;readonly annotationReturnJoined:false;readonly selectedTreeChildJoined:false;
 readonly parserCompleted:false;readonly saveAuthorized:false;
}
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const location=z.strictObject({scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()});
const allocated=z.strictObject({breakpointId:handle,actualLocation:location});
const frame=z.object({callFrameId:handle,location,functionLocation:location.optional()});
const paused=z.object({hitBreakpoints:z.array(handle).length(1),callFrames:z.array(frame).min(1).max(64)});
const event=z.strictObject({sessionId:handle,method:z.enum(["Debugger.paused","Debugger.resumed","Debugger.scriptParsed"]),params:z.unknown()});
const script=z.object({scriptId:handle,url:z.string(),length:z.number().int().nonnegative()});
const source=z.strictObject({scriptSource:z.string().max(32_768)});
const empty=z.strictObject({});
const truth=z.strictObject({result:z.strictObject({type:z.literal("boolean"),value:z.literal(true)})});
const nativePromise=z.strictObject({type:z.literal("object"),subtype:z.literal("promise"),className:z.literal("Promise"),description:z.literal("Promise"),objectId:handle});
const internal=z.strictObject({name:z.literal("[[Prototype]]"),value:z.unknown()});
const ordinary=z.strictObject({result:z.array(z.unknown()).max(256),internalProperties:z.array(internal).length(1)});
function need(value:boolean):asserts value {if(!value){throw new Error("WIRE_RPC_DRIVER");}}
async function settled(task:Promise<unknown>|null):Promise<void>{try{await task;}catch{
 // Original failure remains retained.
}}
function methods(transport:CurrentSchematicWireClassicRpcDriverTransport):readonly unknown[]{
 need(transport!==null&&typeof transport==="object"&&!types.isProxy(transport)&&(Object.getPrototypeOf(transport)===Object.prototype||Object.getPrototypeOf(transport)===null)&&Reflect.ownKeys(transport).length===4);
 return Object.freeze((["request","assertCurrent","assertOriginalExit","fail"]as const).map(name=>{const d=Object.getOwnPropertyDescriptor(transport,name);need(d!==undefined&&Object.hasOwn(d,"value")&&typeof d.value==="function");return d.value as unknown;}));
}
function validate(command:CurrentSchematicWireClassicRpcDriverCommand):CurrentSchematicWireClassicRpcDriverCommand{
 return command.phase.startsWith("wire-rpc-driver-")?control(command):reader(command);
}
export class CurrentSchematicWireClassicRpcDriver {
 readonly #input:Input;readonly #transport:CurrentSchematicWireClassicRpcDriverTransport;readonly #methods:readonly unknown[];readonly #sites:readonly CallerSite[];
 readonly #points:Point[]=[];readonly #attempts:Attempt[]=[];readonly #events:unknown[]=[];readonly #data=new Map<Role,CurrentSchematicWireClassicRpcSharedData>();readonly #origins=new Map<Role,string>();
 readonly #done=Promise.withResolvers<null>();readonly #settlements:Promise<void>[]=[];
 #armTask:Promise<void>|null=null;#runTask:Promise<CurrentSchematicWireClassicRpcDriverData>|null=null;#finishTask:Promise<void>|null=null;
 #removeTask:Promise<void>|null=null;#releaseTask:Promise<void>|null=null;#cleanupTask:Promise<void>|null=null;#retirementTask:Promise<void>|null=null;
 #joinTask:Promise<CurrentSchematicWireParserRpcJoinData>|null=null;#joinDriver:CurrentSchematicWireParserDriver|null=null;#joinPacket:CurrentSchematicWireParserDriverData|null=null;
 #tail:Promise<void>=Promise.resolve();#functionTail:Promise<void>=Promise.resolve();#sourceCall:SourceCall|null=null;#resume:Resume|null=null;
 readonly #activeCursors=new Set<CurrentSchematicWireClassicRpcSharedCursor|CurrentSchematicWireClassicRpcSharedReplySelector>();
 #failure:Readonly<{cause:unknown}>|null=null;#notificationFailure:Readonly<{cause:unknown}>|null=null;#packet:CurrentSchematicWireClassicRpcDriverData|null=null;
 #preparing:Role|null=null;#replying:Role|null=null;#normal=0;#cleanup=0;#received=0;#completed=0;#resumes=0;#resumeEvents=0;#sources=0;
 #armed=false;#closing=false;#settled=false;#finishSettled=false;#allocationUncertain=false;#releaseAttempted=false;#released=false;
 public constructor(input:Input,transport:CurrentSchematicWireClassicRpcDriverTransport){
  for(const id of[input.sessionId,input.scriptId,input.holder,input.native,input.busScriptId]){handle.parse(id);}need(qualify(input.source)===input.variant&&qualify(input.busSource)===2);
  const text:unknown=Object.getOwnPropertyDescriptor(input.source,"scriptSource")?.value;need(typeof text==="string");
  const rows=[["closing",COMPLETION[input.variant].rows.sheetAst],["language",HELPERS[input.variant].rows.helper20],["titles",COMPLETION[input.variant].rows.annotationNotify]]as const;
  this.#sites=Object.freeze(rows.map(([role,row])=>{const prefix=text.slice(0,row.end);return Object.freeze({role,line:row.lineNumber,column:row.columnNumber,endLine:prefix.split("\n").length-1,endColumn:prefix.length-prefix.lastIndexOf("\n")-1});}));
  this.#input=Object.freeze({...input});this.#transport=transport;this.#methods=methods(transport);void settled(this.#done.promise);this.#current();Object.freeze(this);
 }
 #current(cleanup=false):void{need(methods(this.#transport).every((value,index)=>value===this.#methods[index]));if(!cleanup){need(!this.#closing&&this.#failure===null);this.#transport.assertCurrent();}}
 #fail(cause:unknown):void{if(this.#failure!==null){return;}this.#failure=Object.freeze({cause});for(const cursor of this.#activeCursors){cursor.fail();}this.#done.reject(cause);this.#resume?.signal.reject(cause);try{this.#transport.fail(cause);}catch(error){this.#notificationFailure=Object.freeze({cause:error});}}
 async #write(attempt:Attempt):Promise<unknown>{
  const command=attempt.command;let generated:SourceCall|null=null;
  if(command.method==="Runtime.callFunctionOn"){need(this.#sourceCall===null);generated={program:command.params.functionDeclaration,scripts:[]};this.#sourceCall=generated;}
  try{
   this.#current(attempt.cleanup);const pending=this.#transport.request(command);need(types.isPromise(pending));attempt.pending=pending;
   const raw=await pending;attempt.raw=raw;
   if(command.method==="Debugger.setBreakpoint"){const ack=allocated.parse(capture(raw).value);need(!this.#points.some(point=>point.id===ack.breakpointId));this.#points.push({kind:command.point,id:ack.breakpointId,removeAttempted:false,removed:false});const expected=command.params.location;need(ack.actualLocation.scriptId===expected.scriptId&&ack.actualLocation.lineNumber===expected.lineNumber&&ack.actualLocation.columnNumber===expected.columnNumber);this.#allocationUncertain=false;}
   this.#current(attempt.cleanup);
   if(generated!==null){need(this.#sourceCall===generated&&generated.scripts.length===1);this.#sourceCall=null;const scriptId=generated.scripts[0];need(scriptId!==undefined);const packet=source.parse(capture(await this.#send({phase:"wire-rpc-driver-source",method:"Debugger.getScriptSource",params:{scriptId}})).value);need(packet.scriptSource===`(${generated.program})`);this.#sources+=1;}
   return raw;
  }catch(error){attempt.cause=error;throw error;}finally{if(this.#sourceCall===generated){this.#sourceCall=null;}}
 }
 #send(input:CurrentSchematicWireClassicRpcDriverCommand,cleanup=false):Promise<unknown>{
  this.#current(cleanup);const command=validate(input);if(cleanup){need(this.#cleanup<LIMIT.cleanup);this.#cleanup+=1;}else{need(this.#normal<LIMIT.normal);this.#normal+=1;}
  const attempt:Attempt={reserved:input,command,cleanup};this.#attempts.push(attempt);
  if(command.method!=="Runtime.callFunctionOn"){return this.#write(attempt);}
  const prior=this.#functionTail;const task=(async():Promise<unknown>=>{await prior;return this.#write(attempt);})();this.#functionTail=settled(task);return task;
 }
 public arm():Promise<void>{
  if(this.#armTask!==null){return this.#armTask;}this.#current();
  const task=(async():Promise<void>=>{try{for(const[kind]of POINTS){const point=pointLocation(kind);this.#allocationUncertain=true;
   const ack=allocated.parse(capture(await this.#send({phase:"wire-rpc-driver-arm",point:kind,variant:2,method:"Debugger.setBreakpoint",params:{location:{scriptId:this.#input.busScriptId,...point}}})).value);
   need(ack.actualLocation.scriptId===this.#input.busScriptId&&ack.actualLocation.lineNumber===point.lineNumber&&ack.actualLocation.columnNumber===point.columnNumber);
  }this.#armed=true;}catch(error){this.#fail(error);try{await this.#cleanupOnce();}catch(cleanupError){this.#notificationFailure??=Object.freeze({cause:cleanupError});}throw error;}})();this.#armTask=task;return task;
 }
 public observe(input:unknown):boolean{
  if(this.#closing){return false;}let retained=false;
  try{
   this.#current();const packet=event.parse(capture(input).value);if(packet.sessionId!==this.#input.sessionId){return false;}
   if(packet.method==="Debugger.scriptParsed"){const active=this.#sourceCall,parsed=script.parse(packet.params);if(active===null||parsed.url!==""||parsed.length!==active.program.length+2){return false;}need(!active.scripts.includes(parsed.scriptId));active.scripts.push(parsed.scriptId);need(active.scripts.length===1);this.#events.push(input);return true;}
   if(this.#packet!==null){return false;}
   this.#events.push(input);retained=true;
   if(packet.method==="Debugger.resumed"){empty.parse(packet.params);const pending=this.#resume;need(pending!==null&&!pending.eventObserved);pending.eventObserved=true;this.#resumeEvents+=1;need(this.#resumeEvents<=LIMIT.resumeCount);pending.signal.resolve(null);return true;}
   need(this.#armed&&this.#received<LIMIT.pauseCount&&(this.#received===this.#completed||this.#resumeEvents===this.#received));
   const head=paused.parse(packet.params),id=head.hitBreakpoints[0],point=this.#points.find(row=>row.id===id);need(point!==undefined&&id!==undefined);
   const descriptor=POINTS.find(row=>row[0]===point.kind);need(descriptor!==undefined);
   const held=decodePause(packet.params,2,descriptor[1],descriptor[2],this.#input.busScriptId,id);
   let role:Role|null=null;
   if(point.kind==="entry"){
    need(this.#preparing===null);const caller=head.callFrames[1];need(caller!==undefined&&caller.functionLocation?.scriptId===this.#input.scriptId&&caller.location.scriptId===this.#input.scriptId);
    const site=this.#sites.find(row=>caller.functionLocation?.lineNumber===row.line&&caller.functionLocation.columnNumber===row.column&&
     (caller.location.lineNumber>row.line||caller.location.lineNumber===row.line&&caller.location.columnNumber>=row.column)&&
     (caller.location.lineNumber<row.endLine||caller.location.lineNumber===row.endLine&&caller.location.columnNumber<row.endColumn));
    need(site!==undefined&&!this.#origins.has(site.role));role=site.role;this.#preparing=role;
   }
   this.#received+=1;const tail=this.#tail;
   this.#tail=(async():Promise<void>=>{try{await tail;this.#current();await this.#process(point.kind,held.frame,held.returnValue,head.callFrames[1]?.callFrameId??null,role);}catch(error){this.#fail(error);}})();return true;
  }catch(error){if(!retained){this.#events.push(input);}this.#fail(error);return true;}
 }
 async #read(input:CurrentSchematicWireClassicRpcSharedInput):Promise<CurrentSchematicWireClassicRpcSharedData>{
  const cursor=new CurrentSchematicWireClassicRpcSharedCursor(input);this.#activeCursors.add(cursor);try{for(let command=cursor.next();command!==null;command=cursor.next()){cursor.reserve(command);cursor.accept(command,await this.#send(command));}return cursor.requireCompleted();}finally{this.#activeCursors.delete(cursor);}
 }
 async #origin(role:Role,caller:string,entry:string):Promise<void>{
  const sizes={closing:{frame:4,result:5},language:{frame:2,result:3},titles:{frame:3,result:4}}as const;
  const captured=tuple(await this.#send({phase:"wire-rpc-driver-origin-frame",role,method:"Debugger.evaluateOnCallFrame",params:{...FLAGS,callFrameId:caller,expression:FRAMES[role],returnByValue:false,includeCommandLineAPI:false}}),sizes[role].frame);
  const properties=reader({phase:"classic-rpc-properties",kind:"fields",method:"Runtime.getProperties",params:{objectId:captured,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}});const cells=array(await this.#send(properties),sizes[role].frame);
  if(role==="titles"){const watcher=cells.get("0");need(watcher?.type==="object"&&watcher.subtype===undefined&&watcher.objectId!==undefined);const command=reader({phase:"classic-rpc-properties",kind:"fields",method:"Runtime.getProperties",params:{objectId:watcher.objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}});const raw=await this.#send(command);ordinary.parse(capture(raw).value);}
  const data=tuple(await this.#send({phase:"wire-rpc-driver-origin-call",role,method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:captured,functionDeclaration:PROGRAMS[role],arguments:[this.#input.native,this.#input.holder,entry].map(objectId=>({objectId})),returnByValue:false,awaitPromise:false,userGesture:false}}),sizes[role].result);
  this.#origins.set(role,data);
 }
 async #select(frameId:string):Promise<Role>{
  const values=(["closing","language","titles"]as const).map(role=>{const value=this.#data.get(role);return value?.stage==="returned"||value?.stage==="request"?value:null;});
  const cursor=new CurrentSchematicWireClassicRpcSharedReplySelector(frameId,values);this.#activeCursors.add(cursor);try{for(let command=cursor.next();command!==null;command=cursor.next()){cursor.reserve(command);cursor.accept(command,await this.#send(command));}return cursor.requireCompleted();}finally{this.#activeCursors.delete(cursor);}
 }
 async #process(kind:Kind,frameId:string,returnValue:unknown,caller:string|null,initialRole:Role|null):Promise<void>{
  let role=initialRole??this.#preparing;if(kind==="reply"){need(this.#replying===null);role=await this.#select(frameId);this.#replying=role;}else if(kind==="replyReturned"){role=this.#replying;}need(role!==null);
  let observed:CurrentSchematicWireClassicRpcSharedData;
  if(kind==="entry"){need(caller!==null);observed=await this.#read({stage:"entry",role,frame:frameId,holder:this.#input.holder,native:this.#input.native,scriptId:this.#input.busScriptId,variant:2});await this.#origin(role,caller,observed.entry);}
  else{
   const previous=this.#data.get(role);need(previous!==undefined);
   if(kind==="returned"){const promise=nativePromise.parse(returnValue);observed=await this.#read({stage:"returned",frame:frameId,outerPromise:promise.objectId,previous});this.#preparing=null;}
   else if(kind==="timer"||kind==="reply"){need(caller!==null);let stage:"timer"|"reply"|"earlyReply"=kind;if(kind==="reply"&&previous.stage==="request"){stage="earlyReply";}observed=await this.#read({stage,frame:frameId,callerFrame:caller,previous});}
   else{const stage=kind==="replyReturned"&&previous.stage==="earlyReply"?"earlyReplyReturned":kind;observed=await this.#read({stage,frame:frameId,previous});}
  }
  this.#data.set(role,observed);await this.#resumeOnce();this.#completed+=1;
  if(kind==="replyReturned"){this.#replying=null;}
  if(observed.stage==="replyReturned"||observed.stage==="returned"&&role!=="titles"){
   const final=observed;this.#data.delete(role);
   const task=(async():Promise<void>=>{try{this.#data.set(role,await this.#read({stage:"settled",previous:final}));if(this.#data.size===3&&[...this.#data.values()].every(value=>value.stage==="settled")){this.#done.resolve(null);}}catch(error){this.#fail(error);throw error;}})();void settled(task);this.#settlements.push(task);
  }
 }
 async #resumeOnce():Promise<void>{
  need(this.#resume===null);const resume:Resume={signal:Promise.withResolvers<null>(),eventObserved:false,ackObserved:false};void settled(resume.signal.promise);this.#resume=resume;
  empty.parse(capture(await this.#send({phase:"wire-rpc-driver-resume",method:"Debugger.resume",params:{}})).value);resume.ackObserved=true;await resume.signal.promise;this.#current();need(this.#resume===resume&&resume.eventObserved&&resume.ackObserved);this.#resume=null;this.#resumes+=1;
 }
 #removeOnce():Promise<void>{
  if(this.#removeTask!==null){return this.#removeTask;}
  const task=(async():Promise<void>=>{let failure:Readonly<{cause:unknown}>|null=null;for(const point of this.#points){need(!point.removeAttempted);point.removeAttempted=true;try{empty.parse(capture(await this.#send({phase:"wire-rpc-driver-remove",method:"Debugger.removeBreakpoint",params:{breakpointId:point.id}},true)).value);point.removed=true;}catch(error){failure??=Object.freeze({cause:error});}}if(failure!==null){throw failure.cause;}})();this.#removeTask=task;return task;
 }
 #releaseOnce():Promise<void>{
  if(this.#releaseTask!==null){return this.#releaseTask;}const task=(async():Promise<void>=>{need(!this.#releaseAttempted);this.#releaseAttempted=true;const command=reader({phase:"classic-rpc-release",method:"Runtime.releaseObjectGroup",params:{objectGroup:FLAGS.objectGroup}});const raw=await this.#send(command,true);empty.parse(capture(raw).value);this.#released=true;})();this.#releaseTask=task;return task;
 }
 #cleanupOnce():Promise<void>{
  if(this.#cleanupTask!==null){return this.#cleanupTask;}const task=(async():Promise<void>=>{let failure:Readonly<{cause:unknown}>|null=null;try{await this.#removeOnce();}catch(error){failure=Object.freeze({cause:error});}try{await this.#releaseOnce();}catch(error){failure??=Object.freeze({cause:error});}if(failure!==null){throw failure.cause;}})();this.#cleanupTask=task;return task;
 }
 public run():Promise<CurrentSchematicWireClassicRpcDriverData>{
  if(this.#runTask!==null){return this.#runTask;}this.#current();
  const task=(async():Promise<CurrentSchematicWireClassicRpcDriverData>=>{try{
   await this.arm();await this.#done.promise;await this.#tail;await Promise.all(this.#settlements);this.#current();
   need(this.#received===18&&this.#completed===18&&this.#resumes===18&&this.#resumeEvents===18&&this.#data.size===3&&this.#origins.size===3&&this.#sources===this.#attempts.filter(row=>row.command.method==="Runtime.callFunctionOn").length);
   await this.#removeOnce();this.#current();need(this.#points.length===6&&this.#points.every(point=>point.removed)&&!this.#released);
   const packet:CurrentSchematicWireClassicRpcDriverData=Object.freeze({schema:"private.schematic-wire-classic-rpc-events.v1",sourceVariant:this.#input.variant,allEighteenPausesCompared:true,allEighteenResumesCompared:true,allThreeOriginalCallersCaptured:true,allThreeInnerAndOuterResultsCompared:true,allAllocatedBreakpointsRemoved:true,objectGroupReleased:false,normalRequests:this.#normal,cleanupRequests:this.#cleanup,suppliedTransportOnly:true,originalNativeOwnerJoined:false,serviceDeliveryJoined:false,originalJobExitJoined:false,timeoutCleanupVerified:false,rpcCompleted:false,saveAuthorized:false});this.#packet=packet;return packet;
  }catch(error){this.#fail(error);await this.#tail;await Promise.all(this.#settlements.map(settled));try{await this.#cleanupOnce();}catch(cleanupError){this.#notificationFailure??=Object.freeze({cause:cleanupError});}need(this.#failure!==null);throw this.#failure.cause;}finally{this.#settled=true;}})();this.#runTask=task;return task;
 }
 /** Consume the exact still-live parser packet, then compare all original
  * RPC caller values with its original published AST and context. */
 public joinParser(driver:CurrentSchematicWireParserDriver,packet:CurrentSchematicWireParserDriverData):Promise<CurrentSchematicWireParserRpcJoinData>{
  if(this.#joinTask!==null){need(this.#joinDriver===driver&&this.#joinPacket===packet);return this.#joinTask;}this.#current();need(!this.#released);this.#joinDriver=driver;this.#joinPacket=packet;
  const task=(async():Promise<CurrentSchematicWireParserRpcJoinData>=>{try{
   await this.run();this.#current();const parser=consumeCurrentSchematicWireParserDriverData(packet,driver);need(parser.sheet!==null);
   const closing=this.#origins.get("closing"),language=this.#origins.get("language"),titles=this.#origins.get("titles");need(closing!==undefined&&language!==undefined&&titles!==undefined);
   const refs=[this.#input.native,this.#input.holder,language,titles,parser.context,parser.sheet].map(objectId=>({objectId}));
   truth.parse(capture(await this.#send({phase:"wire-rpc-driver-origin-call",role:"join",method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:closing,functionDeclaration:PROGRAMS.join,arguments:refs,returnByValue:true,awaitPromise:false,userGesture:false}})).value);
   driver.requireLiveComparison(packet);this.#current();return Object.freeze({schema:"private.schematic-wire-parser-rpc-caller-join.v1",originalParserAndThreeRpcCallersCompared:true,suppliedTransportOnly:true,originalNativeOwnerJoined:false,serviceDeliveryJoined:false,annotationReturnJoined:false,selectedTreeChildJoined:false,parserCompleted:false,saveAuthorized:false});
  }catch(error){this.#fail(error);throw error;}})();this.#joinTask=task;return task;
 }
 public finish():Promise<void>{
  if(this.#finishTask!==null){return this.#finishTask;}this.#current();const task=(async():Promise<void>=>{try{await this.run();await this.#joinTask;this.#current();await this.#releaseOnce();this.#current();}catch(error){this.#fail(error);await this.#tail;try{await this.#cleanupOnce();}catch(cleanupError){this.#notificationFailure??=Object.freeze({cause:cleanupError});}need(this.#failure!==null);throw this.#failure.cause;}finally{this.#finishSettled=true;}})();this.#finishTask=task;return task;
 }
 public retireAfterOriginalExit():Promise<void>{
  if(this.#retirementTask!==null){return this.#retirementTask;}this.#current(true);this.#transport.assertOriginalExit();this.#closing=true;if(!this.#settled||this.#packet===null||this.#finishTask!==null&&!this.#finishSettled){this.#fail(new Error("WIRE_RPC_DRIVER_ORIGINAL_EXIT"));}
  const task=(async():Promise<void>=>{await settled(this.#armTask);await this.#tail;await Promise.all(this.#settlements.map(settled));await settled(this.#runTask);await settled(this.#joinTask);await settled(this.#finishTask);if(this.#armTask!==null){try{await this.#cleanupOnce();}catch(cleanupError){this.#notificationFailure??=Object.freeze({cause:cleanupError});}}await settled(this.#cleanupTask);await settled(this.#removeTask);await settled(this.#releaseTask);await this.#functionTail;for(const attempt of this.#attempts){await settled(attempt.pending??null);}this.#current(true);this.#transport.assertOriginalExit();})();this.#retirementTask=task;return task;
 }
 /** Internal receipt/root proof keeps the original owner live without changing retained diagnostic schemas. */
 public requireLiveServiceRequest():void{this.#current();need(!this.#released);}
 public requireLiveComparison(data:CurrentSchematicWireClassicRpcDriverData):void{this.#current();need(this.#packet===data&&!this.#released);}
 public inspect():Readonly<{armed:boolean;settled:boolean;failed:boolean;pauses:number;resumes:number;normalRequests:number;cleanupRequests:number;objectGroupReleased:boolean;allocationUncertain:boolean;rpcCompleted:false;saveAuthorized:false}>{
  this.#current(true);return Object.freeze({armed:this.#armed,settled:this.#settled,failed:this.#failure!==null,pauses:this.#received,resumes:this.#resumes,normalRequests:this.#normal,cleanupRequests:this.#cleanup,objectGroupReleased:this.#released,allocationUncertain:this.#allocationUncertain,rpcCompleted:false,saveAuthorized:false});
 }
 public retained():Readonly<{attempts:readonly Readonly<Attempt>[];events:readonly unknown[];firstFailure:Readonly<{cause:unknown}>|null;notificationFailure:Readonly<{cause:unknown}>|null}>{
  this.#current(true);return Object.freeze({attempts:Object.freeze(this.#attempts.map(row=>Object.freeze({...row}))),events:Object.freeze([...this.#events]),firstFailure:this.#failure,notificationFailure:this.#notificationFailure});
 }
}
Object.freeze(CurrentSchematicWireClassicRpcDriver.prototype);Object.freeze(CurrentSchematicWireClassicRpcDriver);
