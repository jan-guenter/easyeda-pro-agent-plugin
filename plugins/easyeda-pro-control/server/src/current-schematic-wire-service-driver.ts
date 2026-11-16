/** One retained event owner joins original callback, target and publication.
 * Complete native/runtime admission remains a separate writer obligation. */
/* oxlint-disable import/max-dependencies -- Keep exact controls, original receipts, frame cursors and lifecycle custody together. */
import {types}from"node:util";
import {z}from"zod";
import {captureCurrentPcbStringClockReply as capture}from"./current-pcb-string-clock-reply.ts";
import {decodeCurrentFootprintCopyClockRpcV2Array as array,decodeCurrentFootprintCopyClockRpcV2ArrayCapture as tuple}from"./current-footprint-copy-clock-rpc-v2-protocol.ts";
import {qualifyCurrentSchematicWireServiceSource as qualify}from"./current-schematic-wire-service-source.ts";
import {CurrentSchematicWireServiceInvocationCursor,consumeCurrentSchematicWireServiceInvocationBindings as consumeBindings}from"./current-schematic-wire-service-invocation-cursor.ts";
import type {CurrentSchematicWireServiceInvocationData,CurrentSchematicWireServiceInvocationInput}from"./current-schematic-wire-service-invocation-cursor.ts";
import {retainCurrentSchematicWireServiceRequest as requestReceipt}from"./current-schematic-wire-service-request-receipt.ts";
import {requireCurrentSchematicWireServiceInvocationRoot as requireRoot}from"./current-schematic-wire-service-invocation-root.ts";
import type {CurrentSchematicWireServiceInvocationRoot}from"./current-schematic-wire-service-invocation-root.ts";
import {CURRENT_SCHEMATIC_WIRE_SERVICE_INVOCATION_KINDS as KINDS,CURRENT_SCHEMATIC_WIRE_SERVICE_INVOCATION_POINTS as POINTS,decodeCurrentSchematicWireServiceInvocationPause as decodePause}from"./current-schematic-wire-service-invocation-source.ts";
import type {CurrentSchematicWireServiceInvocationPoint as Kind}from"./current-schematic-wire-service-invocation-source.ts";
import {CURRENT_SCHEMATIC_WIRE_SERVICE_INVOCATION_FLAGS as FLAGS,validateCurrentSchematicWireServiceInvocationCommand as reader}from"./current-schematic-wire-service-invocation-protocol.ts";
import type {CurrentSchematicWireServiceInvocationCommand}from"./current-schematic-wire-service-invocation-protocol.ts";
import {CURRENT_SCHEMATIC_WIRE_SERVICE_DRIVER_REQUESTS as LIMIT,validateCurrentSchematicWireServiceDriverControl as control}from"./current-schematic-wire-service-driver-protocol.ts";
import type {CurrentSchematicWireServiceDriverControl}from"./current-schematic-wire-service-driver-protocol.ts";

import{CurrentSchematicWireTitleDriver}from"./current-schematic-wire-title-driver.ts";

type Role="closing"|"language"|"titles";
export type CurrentSchematicWireServiceDriverCommand=CurrentSchematicWireServiceInvocationCommand|CurrentSchematicWireServiceDriverControl;
export interface CurrentSchematicWireServiceDriverTransport{
 readonly request:(command:CurrentSchematicWireServiceDriverCommand)=>Promise<unknown>;
 readonly assertCurrent:()=>void;readonly assertOriginalExit:()=>void;readonly fail:(cause:unknown)=>void;
}
interface Input{readonly sessionId:string;readonly scriptId:string;readonly holder:string;readonly native:string;readonly variant:0|1;readonly source:unknown;readonly busScriptId:string;readonly busSource:unknown}
interface Attempt{readonly reserved:CurrentSchematicWireServiceDriverCommand;readonly command:CurrentSchematicWireServiceDriverCommand;readonly cleanup:boolean;pending?:Promise<unknown>;raw?:unknown;cause?:unknown}
interface Point{readonly kind:Kind;readonly id:string;removeAttempted:boolean;removed:boolean}
interface SourceCall{readonly program:string;readonly scripts:string[]}
interface Resume{readonly signal:PromiseWithResolvers<null>;eventObserved:boolean;ackObserved:boolean}
export interface CurrentSchematicWireServiceDriverData{
 readonly schema:"private.schematic-wire-service-events.v1";readonly sourceVariant:0|1;
 readonly allTwentyFivePausesCompared:true;readonly allTwentyFiveResumesCompared:true;
 readonly originalThreeCallbacksTargetsAndRepliesCompared:true;readonly originalLocalTitleQueryAndPublishedResultCompared:true;
 readonly allAllocatedBreakpointsRemoved:true;readonly objectGroupReleased:false;
 readonly normalRequests:number;readonly cleanupRequests:number;
 readonly suppliedTransportOnly:true;readonly originalNativeOwnerJoined:false;readonly originalAsyncThenRegistrationJoined:false;
 readonly uiProjectAndLocaleRuntimeQualified:false;readonly titleHelperRuntimeQualified:false;
 readonly serviceDeliveryJoined:false;readonly originalJobExitJoined:false;readonly parserCompleted:false;readonly saveAuthorized:false;
}
const issued=new WeakMap<CurrentSchematicWireServiceDriverData,CurrentSchematicWireServiceDriver>();
const spent=new WeakSet<CurrentSchematicWireServiceDriverData>();
export function consumeCurrentSchematicWireServiceDriverBindings(data:CurrentSchematicWireServiceDriverData,owner:CurrentSchematicWireServiceDriver):ReturnType<CurrentSchematicWireServiceDriver["consumeBindings"]>{
 need(issued.get(data)===owner&&!spent.has(data));spent.add(data);return owner.consumeBindings(data);
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
function fixedRole(kind:Kind):Role|null{
 if(kind==="closingEntry"||kind==="closingReturned"){return"closing";}
 if(kind==="languageEntry"||kind==="languageReturned"){return"language";}
 if(kind==="titleEntry"||kind==="titleReturned"||kind==="queryEntry"||kind==="queryReturned"||kind==="publishedEntry"||kind==="publishedReturned"){return"titles";}
 return null;
}
function need(value:boolean):asserts value {if(!value){throw new Error("WIRE_SERVICE_DRIVER");}}
async function settled(task:Promise<unknown>|null):Promise<void>{try{await task;}catch{
 // Original failure remains retained.
}}
function methods(transport:CurrentSchematicWireServiceDriverTransport):readonly unknown[]{
 need(transport!==null&&typeof transport==="object"&&!types.isProxy(transport)&&(Object.getPrototypeOf(transport)===Object.prototype||Object.getPrototypeOf(transport)===null)&&Reflect.ownKeys(transport).length===4);
 return Object.freeze((["request","assertCurrent","assertOriginalExit","fail"]as const).map(name=>{const d=Object.getOwnPropertyDescriptor(transport,name);need(d!==undefined&&Object.hasOwn(d,"value")&&typeof d.value==="function");return d.value as unknown;}));
}
function validate(command:CurrentSchematicWireServiceDriverCommand):CurrentSchematicWireServiceDriverCommand{
 return command.phase.startsWith("wire-service-driver-")?control(command):reader(command);
}
export class CurrentSchematicWireServiceDriver{
 readonly #input:Input;readonly #transport:CurrentSchematicWireServiceDriverTransport;readonly #methods:readonly unknown[];
 readonly #points:Point[]=[];readonly #attempts:Attempt[]=[];readonly #events:unknown[]=[];readonly #data=new Map<Role,CurrentSchematicWireServiceInvocationData>();
 readonly #started=new Set<Role>();readonly #done=Promise.withResolvers<null>();readonly #settlements:Promise<void>[]=[];
 #title:CurrentSchematicWireTitleDriver|null=null;
 #root:CurrentSchematicWireServiceInvocationRoot|null=null;#active:Role|null=null;
 #armTask:Promise<void>|null=null;#runTask:Promise<CurrentSchematicWireServiceDriverData>|null=null;#finishTask:Promise<void>|null=null;
 #removeTask:Promise<void>|null=null;#releaseTask:Promise<void>|null=null;#cleanupTask:Promise<void>|null=null;#retirementTask:Promise<void>|null=null;
 #tail:Promise<void>=Promise.resolve();#functionTail:Promise<void>=Promise.resolve();#sourceCall:SourceCall|null=null;#resume:Resume|null=null;
 readonly #activeCursors=new Set<CurrentSchematicWireServiceInvocationCursor>();
 #failure:Readonly<{cause:unknown}>|null=null;#notificationFailure:Readonly<{cause:unknown}>|null=null;#packet:CurrentSchematicWireServiceDriverData|null=null;
 #normal=0;#cleanup=0;#received=0;#completed=0;#resumes=0;#resumeEvents=0;#sources=0;
 #armed=false;#closing=false;#settled=false;#finishSettled=false;#allocationUncertain=false;#releaseAttempted=false;#released=false;
 public constructor(input:Input,transport:CurrentSchematicWireServiceDriverTransport){
  for(const id of[input.sessionId,input.scriptId,input.holder,input.native,input.busScriptId]){handle.parse(id);}
  need(qualify(input.source)===input.variant&&qualify(input.busSource)===2);
  this.#input=Object.freeze({...input});this.#transport=transport;this.#methods=methods(transport);void settled(this.#done.promise);this.#current();Object.freeze(this);
 }
 public bindRegistrations(root:CurrentSchematicWireServiceInvocationRoot):void{this.#current();need(this.#root===null&&!this.#armed&&this.#armTask===null);const original=requireRoot(root);need(original.input.holder===this.#input.holder&&original.input.native===this.#input.native&&original.input.scriptId===this.#input.scriptId&&original.input.uiScriptId===this.#input.busScriptId&&original.input.variant===this.#input.variant);this.#root=root;}
 public bindTitleDriver(owner:CurrentSchematicWireTitleDriver):void{this.#current();need(this.#title===null&&!this.#armed&&this.#armTask===null&&Object.getPrototypeOf(owner)===CurrentSchematicWireTitleDriver.prototype);this.#title=owner;}
 #current(cleanup=false):void{need(methods(this.#transport).every((value,index)=>value===this.#methods[index]));if(!cleanup){need(!this.#closing&&this.#failure===null);this.#transport.assertCurrent();}}
 #fail(cause:unknown):void{if(this.#failure!==null){return;}this.#failure=Object.freeze({cause});for(const cursor of this.#activeCursors){cursor.fail();}this.#done.reject(cause);this.#resume?.signal.reject(cause);try{this.#transport.fail(cause);}catch(error){this.#notificationFailure=Object.freeze({cause:error});}}
 async #write(attempt:Attempt):Promise<unknown>{
  const command=attempt.command;let generated:SourceCall|null=null;
  if(command.method==="Runtime.callFunctionOn"){need(this.#sourceCall===null);generated={program:command.params.functionDeclaration,scripts:[]};this.#sourceCall=generated;}
  try{
   this.#current(attempt.cleanup);const pending=this.#transport.request(command);need(types.isPromise(pending));attempt.pending=pending;
   const raw=await pending;attempt.raw=raw;this.#current(attempt.cleanup);
   if(generated!==null){need(this.#sourceCall===generated&&generated.scripts.length===1);this.#sourceCall=null;const scriptId=generated.scripts[0];need(scriptId!==undefined);const packet=source.parse(capture(await this.#send({phase:"wire-service-driver-source",method:"Debugger.getScriptSource",params:{scriptId}})).value);need(packet.scriptSource===`(${generated.program})`);this.#sources+=1;}
   return raw;
  }catch(error){attempt.cause=error;throw error;}finally{if(this.#sourceCall===generated){this.#sourceCall=null;}}
 }
 #send(input:CurrentSchematicWireServiceDriverCommand,cleanup=false):Promise<unknown>{
  this.#current(cleanup);const command=validate(input);if(cleanup){need(this.#cleanup<LIMIT.cleanup);this.#cleanup+=1;}else{need(this.#normal<LIMIT.normal);this.#normal+=1;}
  const attempt:Attempt={reserved:input,command,cleanup};this.#attempts.push(attempt);
  if(command.method!=="Runtime.callFunctionOn"){return this.#write(attempt);}
  const prior=this.#functionTail;const task=(async():Promise<unknown>=>{await prior;return this.#write(attempt);})();this.#functionTail=settled(task);return task;
 }
 public arm():Promise<void>{
  if(this.#armTask!==null){return this.#armTask;}this.#current();need(this.#root!==null);
  const task=(async():Promise<void>=>{try{for(const kind of KINDS){const row=POINTS[this.#input.variant].points[kind];
   this.#allocationUncertain=true;const scriptId=row.realm==="ui"?this.#input.busScriptId:this.#input.scriptId;
   const ack=allocated.parse(capture(await this.#send({phase:"wire-service-driver-arm",point:kind,variant:this.#input.variant,method:"Debugger.setBreakpoint",params:{location:{scriptId,lineNumber:row.lineNumber,columnNumber:row.columnNumber}}})).value);
   const point=kind;need(!this.#points.some(value=>value.id===ack.breakpointId));this.#points.push({kind:point,id:ack.breakpointId,removeAttempted:false,removed:false});this.#allocationUncertain=false;
   need(ack.actualLocation.scriptId===scriptId&&ack.actualLocation.lineNumber===row.lineNumber&&ack.actualLocation.columnNumber===row.columnNumber);
  }this.#armed=true;}catch(error){this.#fail(error);try{await this.#cleanupOnce();}catch(cleanupError){this.#notificationFailure??=Object.freeze({cause:cleanupError});}throw error;}})();this.#armTask=task;return task;
 }
 public observe(input:unknown):boolean{
  if(this.#closing){return false;}let retained=false;
  try{
   this.#current();const packet=event.parse(capture(input).value);if(packet.sessionId!==this.#input.sessionId){return false;}
   if(packet.method==="Debugger.scriptParsed"){const active=this.#sourceCall,parsed=script.parse(packet.params);if(active===null||parsed.url!==""||parsed.length!==active.program.length+2){return false;}need(!active.scripts.includes(parsed.scriptId));active.scripts.push(parsed.scriptId);need(active.scripts.length===1);this.#events.push(input);return true;}
   if(this.#packet!==null){return false;}this.#events.push(input);retained=true;
   if(packet.method==="Debugger.resumed"){empty.parse(packet.params);const pending=this.#resume;need(pending!==null&&!pending.eventObserved);pending.eventObserved=true;this.#resumeEvents+=1;need(this.#resumeEvents<=LIMIT.pauseCount);pending.signal.resolve(null);return true;}
   need(this.#armed&&this.#received<LIMIT.pauseCount&&(this.#received===this.#completed||this.#resumeEvents===this.#received));
   const head=paused.parse(packet.params),point=this.#points.find(row=>row.id===head.hitBreakpoints[0]);need(point!==undefined);
   const row=POINTS[this.#input.variant].points[point.kind],scriptId=row.realm==="ui"?this.#input.busScriptId:this.#input.scriptId;
   const held=decodePause(packet.params,this.#input.variant,point.kind,scriptId,point.id);this.#received+=1;const tail=this.#tail;
   this.#tail=(async():Promise<void>=>{try{await tail;this.#current();await this.#process(point.kind,held.frame,held.returnValue,head.callFrames[1]?.callFrameId??null);}catch(error){this.#fail(error);}})();return true;
  }catch(error){if(!retained){this.#events.push(input);}this.#fail(error);return true;}
 }
 async #read(input:CurrentSchematicWireServiceInvocationInput):Promise<CurrentSchematicWireServiceInvocationData>{
  const cursor=new CurrentSchematicWireServiceInvocationCursor(input);this.#activeCursors.add(cursor);
  try{for(let command=cursor.next();command!==null;command=cursor.next()){cursor.reserve(command);cursor.accept(command,await this.#send(command));}return cursor.requireCompleted();}finally{this.#activeCursors.delete(cursor);}
 }
 async #failureFrame(kind:"caught"|"rejected",frameId:string):Promise<never>{
  const expression=kind==="caught"?"[this,i,o,n,e,s]":"[this,c,a,o,l]";
  const command=reader({phase:"wire-service-invocation-frame",variant:2,role:kind,method:"Debugger.evaluateOnCallFrame",params:{...FLAGS,callFrameId:frameId,expression,returnByValue:false,includeCommandLineAPI:false}});
  const captured=tuple(await this.#send(command),kind==="caught"?6:5);
  const raw=await this.#send(reader({phase:"wire-service-invocation-properties",method:"Runtime.getProperties",params:{objectId:captured,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}}));
  array(capture(raw).value,kind==="caught"?6:5);throw new Error("WIRE_ORIGINAL_SERVICE_FAILURE",{cause:Object.freeze({schema:"private.schematic-wire-original-service-failure.v1",kind,role:this.#active,captured,raw})});
 }
 async #process(kind:Kind,frameId:string,returnValue:unknown,caller:string|null):Promise<void>{
  if(kind==="caught"||kind==="rejected"){await this.#failureFrame(kind,frameId);}
  need(this.#root!==null);let role:Role;let observed:CurrentSchematicWireServiceInvocationData;
  if(kind==="serviceEntry"){
   need(this.#active===null&&caller!==null);const original=requireRoot(this.#root),request=await requestReceipt(original.rpc);role=request.role;need(!this.#started.has(role));this.#started.add(role);this.#active=role;
   observed=await this.#read({stage:"entry",root:this.#root,request,frame:frameId,callerFrame:caller});
  }else{
   const fixed=fixedRole(kind);
   role=fixed??this.#active??"titles";if(this.#active===null){need(role==="titles"&&(kind==="queryReturned"||kind==="titleReturned"||kind==="publishedEntry"||kind==="publishedReturned"||kind==="replyEntry"||kind==="replyReturned"));}else{need(role===this.#active);}
   const previous=this.#data.get(role);need(previous!==undefined);
   const stages={servicePost:"post",serviceReturned:"callbackReturned",closingEntry:"targetEntry",closingReturned:"targetReturned",languageEntry:"targetEntry",languageReturned:"targetReturned",titleEntry:"targetEntry",titleReturned:"targetReturned",queryEntry:"queryEntry",queryReturned:"queryReturned",publishedEntry:"publishedEntry",publishedReturned:"publishedReturned",replyEntry:"replyEntry",replyReturned:"replyReturned"}as const;
   need(kind!=="caught"&&kind!=="rejected");observed=await this.#read({stage:stages[kind],frame:frameId,returnValue,previous});
  }
  if(this.#title!==null){if(kind==="queryEntry"){await this.#title.compareQuery(observed);}else if(kind==="queryReturned"){await this.#title.compareQueryReturned(observed);}}
  this.#data.set(role,observed);if(kind==="serviceReturned"){this.#active=null;}
  await this.#resumeOnce();this.#completed+=1;
  if(kind==="serviceReturned"&&role!=="titles"||kind==="publishedReturned"){
   const final=observed;this.#data.delete(role);const task=(async():Promise<void>=>{try{this.#data.set(role,await this.#read({stage:"settled",previous:final}));if(this.#data.size===3&&[...this.#data.values()].every(value=>value.stage==="settled")){this.#done.resolve(null);}}catch(error){this.#fail(error);throw error;}})();void settled(task);this.#settlements.push(task);
  }
 }
 async #resumeOnce():Promise<void>{
  need(this.#resume===null);const resume:Resume={signal:Promise.withResolvers<null>(),eventObserved:false,ackObserved:false};void settled(resume.signal.promise);this.#resume=resume;
  empty.parse(capture(await this.#send({phase:"wire-service-driver-resume",method:"Debugger.resume",params:{}})).value);resume.ackObserved=true;await resume.signal.promise;this.#current();need(this.#resume===resume&&resume.eventObserved&&resume.ackObserved);this.#resume=null;this.#resumes+=1;
 }
 #removeOnce():Promise<void>{
  if(this.#removeTask!==null){return this.#removeTask;}
  const task=(async():Promise<void>=>{let failure:Readonly<{cause:unknown}>|null=null;for(const point of this.#points){need(!point.removeAttempted);point.removeAttempted=true;try{empty.parse(capture(await this.#send({phase:"wire-service-driver-remove",method:"Debugger.removeBreakpoint",params:{breakpointId:point.id}},true)).value);point.removed=true;}catch(error){failure??=Object.freeze({cause:error});}}if(failure!==null){throw failure.cause;}})();this.#removeTask=task;return task;
 }
 #releaseOnce():Promise<void>{
  if(this.#releaseTask!==null){return this.#releaseTask;}const task=(async():Promise<void>=>{need(!this.#releaseAttempted);this.#releaseAttempted=true;const command=reader({phase:"wire-service-invocation-release",method:"Runtime.releaseObjectGroup",params:{objectGroup:FLAGS.objectGroup}});const raw=await this.#send(command,true);empty.parse(capture(raw).value);this.#released=true;})();this.#releaseTask=task;return task;
 }
 #cleanupOnce():Promise<void>{
  if(this.#cleanupTask!==null){return this.#cleanupTask;}const task=(async():Promise<void>=>{let failure:Readonly<{cause:unknown}>|null=null;try{await this.#removeOnce();}catch(error){failure=Object.freeze({cause:error});}try{await this.#releaseOnce();}catch(error){failure??=Object.freeze({cause:error});}if(failure!==null){throw failure.cause;}})();this.#cleanupTask=task;return task;
 }
 public run():Promise<CurrentSchematicWireServiceDriverData>{
  if(this.#runTask!==null){return this.#runTask;}this.#current();
  const task=(async():Promise<CurrentSchematicWireServiceDriverData>=>{try{
   await this.arm();await this.#done.promise;await this.#tail;await Promise.all(this.#settlements);this.#current();
   need(this.#received===25&&this.#completed===25&&this.#resumes===25&&this.#resumeEvents===25&&this.#data.size===3&&this.#active===null&&this.#sources===this.#attempts.filter(row=>row.command.method==="Runtime.callFunctionOn").length);
   await this.#removeOnce();this.#current();need(this.#points.length===17&&this.#points.every(point=>point.removed)&&!this.#released);
   const packet:CurrentSchematicWireServiceDriverData=Object.freeze({schema:"private.schematic-wire-service-events.v1",sourceVariant:this.#input.variant,allTwentyFivePausesCompared:true,allTwentyFiveResumesCompared:true,originalThreeCallbacksTargetsAndRepliesCompared:true,originalLocalTitleQueryAndPublishedResultCompared:true,allAllocatedBreakpointsRemoved:true,objectGroupReleased:false,normalRequests:this.#normal,cleanupRequests:this.#cleanup,suppliedTransportOnly:true,originalNativeOwnerJoined:false,originalAsyncThenRegistrationJoined:false,uiProjectAndLocaleRuntimeQualified:false,titleHelperRuntimeQualified:false,serviceDeliveryJoined:false,originalJobExitJoined:false,parserCompleted:false,saveAuthorized:false});issued.set(packet,this);this.#packet=packet;return packet;
  }catch(error){this.#fail(error);await this.#tail;await Promise.all(this.#settlements.map(settled));try{await this.#cleanupOnce();}catch(cleanupError){this.#notificationFailure??=Object.freeze({cause:cleanupError});}need(this.#failure!==null);throw this.#failure.cause;}finally{this.#settled=true;}})();this.#runTask=task;return task;
 }
 public finish():Promise<void>{
  if(this.#finishTask!==null){return this.#finishTask;}this.#current();const task=(async():Promise<void>=>{try{await this.run();this.#current();await this.#releaseOnce();this.#current();}catch(error){this.#fail(error);await this.#tail;try{await this.#cleanupOnce();}catch(cleanupError){this.#notificationFailure??=Object.freeze({cause:cleanupError});}need(this.#failure!==null);throw this.#failure.cause;}finally{this.#finishSettled=true;}})();this.#finishTask=task;return task;
 }
 public retireAfterOriginalExit():Promise<void>{
  if(this.#retirementTask!==null){return this.#retirementTask;}this.#current(true);this.#transport.assertOriginalExit();this.#closing=true;if(!this.#settled||this.#packet===null||this.#finishTask!==null&&!this.#finishSettled){this.#fail(new Error("WIRE_SERVICE_DRIVER_ORIGINAL_EXIT"));}
  const task=(async():Promise<void>=>{await settled(this.#armTask);await this.#tail;await Promise.all(this.#settlements.map(settled));await settled(this.#runTask);await settled(this.#finishTask);if(this.#armTask!==null){try{await this.#cleanupOnce();}catch(cleanupError){this.#notificationFailure??=Object.freeze({cause:cleanupError});}}await settled(this.#cleanupTask);await settled(this.#removeTask);await settled(this.#releaseTask);await this.#functionTail;for(const attempt of this.#attempts){await settled(attempt.pending??null);}this.#current(true);this.#transport.assertOriginalExit();})();this.#retirementTask=task;return task;
 }
 public requireLiveComparison(data:CurrentSchematicWireServiceDriverData):void{this.#current();need(this.#packet===data&&!this.#released);}
 public consumeBindings(data:CurrentSchematicWireServiceDriverData):Readonly<{root:CurrentSchematicWireServiceInvocationRoot;roles:readonly ReturnType<typeof consumeBindings>[];suppliedTransportOnly:true;originalNativeOwnerJoined:false;serviceDeliveryJoined:false;saveAuthorized:false}>{
  this.requireLiveComparison(data);need(this.#root!==null);
  const root=this.#root;const roles=(["closing","language","titles"]as const).map(role=>{const packet=this.#data.get(role);need(packet!==undefined);return consumeBindings(packet,root);});
  return Object.freeze({root,roles:Object.freeze(roles),suppliedTransportOnly:true,originalNativeOwnerJoined:false,serviceDeliveryJoined:false,saveAuthorized:false});
 }
 public inspect():Readonly<{armed:boolean;settled:boolean;failed:boolean;pauses:number;resumes:number;normalRequests:number;cleanupRequests:number;objectGroupReleased:boolean;allocationUncertain:boolean;parserCompleted:false;saveAuthorized:false}>{
  this.#current(true);return Object.freeze({armed:this.#armed,settled:this.#settled,failed:this.#failure!==null,pauses:this.#received,resumes:this.#resumes,normalRequests:this.#normal,cleanupRequests:this.#cleanup,objectGroupReleased:this.#released,allocationUncertain:this.#allocationUncertain,parserCompleted:false,saveAuthorized:false});
 }
 public retained():Readonly<{attempts:readonly Readonly<Attempt>[];events:readonly unknown[];firstFailure:Readonly<{cause:unknown}>|null;notificationFailure:Readonly<{cause:unknown}>|null}>{
  this.#current(true);return Object.freeze({attempts:Object.freeze(this.#attempts.map(row=>Object.freeze({...row}))),events:Object.freeze([...this.#events]),firstFailure:this.#failure,notificationFailure:this.#notificationFailure});
 }
}
Object.freeze(CurrentSchematicWireServiceDriver.prototype);Object.freeze(CurrentSchematicWireServiceDriver);
