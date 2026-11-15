/** Original synchronous UI provider calls share one retained source owner. */
/* oxlint-disable import/max-dependencies -- Bind exact source controls, opaque preflight root, frames and cleanup custody together. */
import {types}from"node:util";
import {z}from"zod";
import {captureCurrentPcbStringClockReply as capture}from"./current-pcb-string-clock-reply.ts";
import {decodeCurrentFootprintCopyClockRpcV2Array as array}from"./current-footprint-copy-clock-rpc-v2-protocol.ts";
import {CURRENT_SCHEMATIC_WIRE_SERVICE_INVOCATION_FLAGS as FLAGS}from"./current-schematic-wire-service-invocation-protocol.ts";
import {CURRENT_SCHEMATIC_WIRE_UI_RUNTIME_ALIASES as ALIASES}from"./current-schematic-wire-ui-runtime-programs.ts";
import {qualifyCurrentSchematicWireServiceSource as qualify}from"./current-schematic-wire-service-source.ts";
import {CurrentSchematicWireUiRuntimeCursor}from"./current-schematic-wire-ui-runtime-cursor.ts";
import type {CurrentSchematicWireUiRuntimeData}from"./current-schematic-wire-ui-runtime-cursor.ts";
import {requireCurrentSchematicWireUiRuntimeRoot as requireRoot}from"./current-schematic-wire-ui-runtime-root.ts";
import type {CurrentSchematicWireUiRuntimeRoot}from"./current-schematic-wire-ui-runtime-root.ts";
import {requireCurrentSchematicWireServiceInvocationRoot as serviceRoot}from"./current-schematic-wire-service-invocation-root.ts";
import {CURRENT_SCHEMATIC_WIRE_UI_RUNTIME_KINDS as KINDS,CURRENT_SCHEMATIC_WIRE_UI_RUNTIME_POINTS as POINTS,decodeCurrentSchematicWireUiRuntimePause as decodePause}from"./current-schematic-wire-ui-runtime-source.ts";
import type {CurrentSchematicWireUiRuntimePoint as Kind}from"./current-schematic-wire-ui-runtime-source.ts";
import {CURRENT_SCHEMATIC_WIRE_UI_RUNTIME_REQUESTS as LIMIT,validateCurrentSchematicWireUiRuntimeCommand as validate}from"./current-schematic-wire-ui-runtime-protocol.ts";
import type {CurrentSchematicWireUiRuntimeCommand as Command}from"./current-schematic-wire-ui-runtime-protocol.ts";

export type CurrentSchematicWireUiRuntimeDriverCommand=Command;
export interface CurrentSchematicWireUiRuntimeDriverTransport{
 readonly request:(command:Command)=>Promise<unknown>;
 readonly assertCurrent:()=>void;readonly assertOriginalExit:()=>void;readonly fail:(cause:unknown)=>void;
}
interface Input{readonly sessionId:string;readonly scriptId:string;readonly holder:string;readonly native:string;readonly variant:0|1;readonly source:unknown;readonly busScriptId:string;readonly busSource:unknown}
interface Attempt{readonly reserved:Command;readonly command:Command;readonly cleanup:boolean;pending?:Promise<unknown>;raw?:unknown;cause?:unknown}
interface Point{readonly kind:Kind;readonly id:string;removeAttempted:boolean;removed:boolean}
interface SourceCall{readonly program:string;readonly scripts:string[]}
interface Resume{readonly signal:PromiseWithResolvers<null>;eventObserved:boolean;ackObserved:boolean}
export interface CurrentSchematicWireUiRuntimeDriverData{
 readonly schema:"private.schematic-wire-ui-runtime-events.v1";readonly sourceVariant:2;
 readonly allThirteenPausesCompared:true;readonly allThirteenResumesCompared:true;
 readonly originalRegistryAndExistingToolCallsCompared:true;readonly originalControllerGetterFalseCompared:true;
 readonly originalNativeTrimCallSiteCompared:true;readonly originalCurrAndFirstDictionaryReturnCompared:true;
 readonly allThreeObjectReturnAliasesRetainedBeforeResume:true;readonly allThreeReturnCellsComparedAfterResume:true;readonly allAllocatedBreakpointsRemoved:true;
 readonly sharedServiceGroupRetained:true;readonly normalRequests:number;readonly cleanupRequests:number;
 readonly suppliedTransportOnly:true;readonly originalNativeOwnerJoined:false;readonly nativeGlobalsQualified:false;
 readonly titleHelperRuntimeQualified:false;readonly originalAsyncThenRegistrationJoined:false;readonly serviceDeliveryJoined:false;readonly saveAuthorized:false;
}
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const location=z.strictObject({scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()});
const allocated=z.strictObject({breakpointId:handle,actualLocation:location});
const frameSchema=z.object({callFrameId:handle,location,functionLocation:location.optional()});
const paused=z.object({hitBreakpoints:z.array(handle).length(1),callFrames:z.array(frameSchema).min(1).max(64)});
const event=z.strictObject({sessionId:handle,method:z.enum(["Debugger.paused","Debugger.resumed","Debugger.scriptParsed"]),params:z.unknown()});
const script=z.object({scriptId:handle,url:z.string(),length:z.number().int().nonnegative()});
const source=z.strictObject({scriptSource:z.string().max(32_768)});
const empty=z.strictObject({});
function need(value:boolean):asserts value {if(!value){throw new Error("WIRE_UI_RUNTIME_DRIVER");}}
async function settled(task:Promise<unknown>|null):Promise<void>{try{await task;}catch{
 // Original failure remains retained.
}}
function methods(transport:CurrentSchematicWireUiRuntimeDriverTransport):readonly unknown[]{
 need(transport!==null&&typeof transport==="object"&&!types.isProxy(transport)&&(Object.getPrototypeOf(transport)===Object.prototype||Object.getPrototypeOf(transport)===null)&&Reflect.ownKeys(transport).length===4);
 return Object.freeze((["request","assertCurrent","assertOriginalExit","fail"]as const).map(name=>{const d=Object.getOwnPropertyDescriptor(transport,name);need(d!==undefined&&Object.hasOwn(d,"value")&&typeof d.value==="function");return d.value as unknown;}));
}
export class CurrentSchematicWireUiRuntimeDriver{
 readonly #input:Input;readonly #transport:CurrentSchematicWireUiRuntimeDriverTransport;readonly #methods:readonly unknown[];
 readonly #points:Point[]=[];readonly #attempts:Attempt[]=[];readonly #events:unknown[]=[];readonly #data=new Map<Kind,CurrentSchematicWireUiRuntimeData>();
 readonly #done=Promise.withResolvers<null>();readonly #activeCursors=new Set<CurrentSchematicWireUiRuntimeCursor>();
 #root:CurrentSchematicWireUiRuntimeRoot|null=null;#closingSteps=0;#languageSteps=0;
 #armTask:Promise<void>|null=null;#runTask:Promise<CurrentSchematicWireUiRuntimeDriverData>|null=null;#finishTask:Promise<void>|null=null;#removeTask:Promise<void>|null=null;#retirementTask:Promise<void>|null=null;
 #tail:Promise<void>=Promise.resolve();#functionTail:Promise<void>=Promise.resolve();#sourceCall:SourceCall|null=null;#resume:Resume|null=null;
 #failure:Readonly<{cause:unknown}>|null=null;#notificationFailure:Readonly<{cause:unknown}>|null=null;#packet:CurrentSchematicWireUiRuntimeDriverData|null=null;
 #normal=0;#cleanup=0;#received=0;#completed=0;#resumes=0;#resumeEvents=0;#sources=0;
 #armed=false;#closing=false;#settled=false;#finished=false;#allocationUncertain=false;
 public constructor(input:Input,transport:CurrentSchematicWireUiRuntimeDriverTransport){
  for(const id of[input.sessionId,input.scriptId,input.holder,input.native,input.busScriptId]){handle.parse(id);}
  need(qualify(input.source)===input.variant&&qualify(input.busSource)===2);
  this.#input=Object.freeze({...input});this.#transport=transport;this.#methods=methods(transport);void settled(this.#done.promise);this.#current();Object.freeze(this);
 }
 public bindPreflight(root:CurrentSchematicWireUiRuntimeRoot):void{
  this.#current();need(this.#root===null&&!this.#armed&&this.#armTask===null);const before=requireRoot(root),original=serviceRoot(before.root);
  need(original.input.holder===this.#input.holder&&original.input.native===this.#input.native&&original.input.scriptId===this.#input.scriptId&&original.input.uiScriptId===this.#input.busScriptId&&original.input.variant===this.#input.variant);this.#root=root;
 }
 #current(cleanup=false):void{need(methods(this.#transport).every((value,index)=>value===this.#methods[index]));if(!cleanup){need(!this.#closing&&this.#failure===null);this.#transport.assertCurrent();}}
 #fail(cause:unknown):void{if(this.#failure!==null){return;}this.#failure=Object.freeze({cause});for(const cursor of this.#activeCursors){cursor.fail();}this.#done.reject(cause);this.#resume?.signal.reject(cause);try{this.#transport.fail(cause);}catch(error){this.#notificationFailure=Object.freeze({cause:error});}}
 async #write(attempt:Attempt):Promise<unknown>{
  const command=attempt.command;let generated:SourceCall|null=null;
  if(command.method==="Runtime.callFunctionOn"){need(this.#sourceCall===null);generated={program:command.params.functionDeclaration,scripts:[]};this.#sourceCall=generated;}
  try{
   this.#current(attempt.cleanup);const pending=this.#transport.request(command);need(types.isPromise(pending));attempt.pending=pending;
   const raw=await pending;attempt.raw=raw;this.#current(attempt.cleanup);
   if(generated!==null){need(this.#sourceCall===generated&&generated.scripts.length===1);this.#sourceCall=null;const scriptId=generated.scripts[0];need(scriptId!==undefined);const packet=source.parse(capture(await this.#send({phase:"wire-ui-runtime-source",method:"Debugger.getScriptSource",params:{scriptId}})).value);need(packet.scriptSource===`(${generated.program})`);this.#sources+=1;}
   return raw;
  }catch(error){attempt.cause=error;throw error;}finally{if(this.#sourceCall===generated){this.#sourceCall=null;}}
 }
 #send(input:Command,cleanup=false):Promise<unknown>{
  this.#current(cleanup);const command=validate(input);if(cleanup){need(this.#cleanup<LIMIT.cleanup);this.#cleanup+=1;}else{need(this.#normal<LIMIT.normal);this.#normal+=1;}
  const attempt:Attempt={reserved:input,command,cleanup};this.#attempts.push(attempt);
  if(command.method!=="Runtime.callFunctionOn"){return this.#write(attempt);}
  const prior=this.#functionTail;const task=(async():Promise<unknown>=>{await prior;return this.#write(attempt);})();this.#functionTail=settled(task);return task;
 }
 public arm():Promise<void>{
  if(this.#armTask!==null){return this.#armTask;}this.#current();need(this.#root!==null);
  const task=(async():Promise<void>=>{try{for(const kind of KINDS){const row=POINTS[kind];this.#allocationUncertain=true;
   const ack=allocated.parse(capture(await this.#send({phase:"wire-ui-runtime-arm",point:kind,method:"Debugger.setBreakpoint",params:{location:{scriptId:this.#input.busScriptId,lineNumber:row.point.lineNumber,columnNumber:row.point.columnNumber}}})).value);
   need(!this.#points.some(value=>value.id===ack.breakpointId));this.#points.push({kind,id:ack.breakpointId,removeAttempted:false,removed:false});this.#allocationUncertain=false;
   need(ack.actualLocation.scriptId===this.#input.busScriptId&&ack.actualLocation.lineNumber===row.point.lineNumber&&ack.actualLocation.columnNumber===row.point.columnNumber);
  }this.#armed=true;}catch(error){this.#fail(error);throw error;}})();this.#armTask=task;return task;
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
   const held=decodePause(packet.params,point.kind,this.#input.busScriptId,point.id);this.#received+=1;const tail=this.#tail;
   this.#tail=(async():Promise<void>=>{try{await tail;this.#current();await this.#process(point.kind,held.frame,held.caller,held.returnValue);}catch(error){this.#fail(error);}})();return true;
  }catch(error){if(!retained){this.#events.push(input);}this.#fail(error);return true;}
 }
 async #process(point:Kind,frame:string,caller:string|null,returnValue:unknown):Promise<void>{
  need(this.#root!==null&&!this.#data.has(point));const language=point==="trim"||POINTS[point].caller==="language";
  const expected=language?KINDS[this.#languageSteps+8]:KINDS[this.#closingSteps];need(expected===point);
  const cursor=new CurrentSchematicWireUiRuntimeCursor({root:this.#root,point,frame,caller,returnValue});this.#activeCursors.add(cursor);
  try{for(let command=cursor.next();command!==null;command=cursor.next()){cursor.reserve(command);cursor.accept(command,await this.#send(command));}this.#data.set(point,cursor.requireCompleted());}finally{this.#activeCursors.delete(cursor);}
  if(language){this.#languageSteps+=1;}else{this.#closingSteps+=1;}await this.#resumeOnce();this.#completed+=1;
  if(this.#completed===13){this.#done.resolve(null);}
 }
 async #resumeOnce():Promise<void>{
  need(this.#resume===null);const resume:Resume={signal:Promise.withResolvers<null>(),eventObserved:false,ackObserved:false};void settled(resume.signal.promise);this.#resume=resume;
  empty.parse(capture(await this.#send({phase:"wire-ui-runtime-resume",method:"Debugger.resume",params:{}})).value);resume.ackObserved=true;await resume.signal.promise;this.#current();need(this.#resume===resume&&resume.eventObserved&&resume.ackObserved);this.#resume=null;this.#resumes+=1;
 }
 #removeOnce():Promise<void>{
  if(this.#removeTask!==null){return this.#removeTask;}
  const task=(async():Promise<void>=>{let failure:Readonly<{cause:unknown}>|null=null;for(const point of this.#points){need(!point.removeAttempted);point.removeAttempted=true;try{empty.parse(capture(await this.#send({phase:"wire-ui-runtime-remove",method:"Debugger.removeBreakpoint",params:{breakpointId:point.id}},true)).value);point.removed=true;}catch(error){failure??=Object.freeze({cause:error});}}if(failure!==null){throw failure.cause;}})();this.#removeTask=task;return task;
 }
 async #compareAliases():Promise<void>{
  need(this.#root!==null);const before=requireRoot(this.#root);const original=serviceRoot(before.root);const {native,holder}=original.input;const reg=before.root.registrations;
  const cells=(["instanceReturned","getReturned","lookupReturned"]as const).map(kind=>{const value=this.#data.get(kind)?.retainedReturnCell;need(value!==undefined&&value!==null);return value;});
  for(const objectId of cells){const command=validate({phase:"wire-ui-runtime-properties",method:"Runtime.getProperties",params:{objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}});const raw=await this.#send(command);array(capture(raw).value,1);}
  const [first,second,third]=cells;need(first!==undefined&&second!==undefined&&third!==undefined);
  const raw=await this.#send(validate({phase:"wire-ui-runtime-call",role:"aliases",method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:first,functionDeclaration:ALIASES,arguments:[native,holder,reg.root,reg.senderMethodsA,reg.senderMethodsB,before.registry,before.locale,reg.targets,second,third].map(objectId=>({objectId})),returnByValue:true,awaitPromise:false,userGesture:false}}));
  z.strictObject({result:z.strictObject({type:z.literal("boolean"),value:z.literal(true)})}).parse(capture(raw).value);
 }
 public run():Promise<CurrentSchematicWireUiRuntimeDriverData>{
  if(this.#runTask!==null){return this.#runTask;}this.#current();
  const task=(async():Promise<CurrentSchematicWireUiRuntimeDriverData>=>{try{
   await this.arm();await this.#done.promise;await this.#tail;await this.#compareAliases();this.#current();
   need(this.#received===13&&this.#completed===13&&this.#resumes===13&&this.#resumeEvents===13&&this.#data.size===13&&this.#closingSteps===8&&this.#languageSteps===5&&this.#sources===17&&this.#sources===this.#attempts.filter(row=>row.command.method==="Runtime.callFunctionOn").length);
   await this.#removeOnce();this.#current();need(this.#points.length===13&&this.#points.every(point=>point.removed));
   const packet:CurrentSchematicWireUiRuntimeDriverData=Object.freeze({schema:"private.schematic-wire-ui-runtime-events.v1",sourceVariant:2,allThirteenPausesCompared:true,allThirteenResumesCompared:true,originalRegistryAndExistingToolCallsCompared:true,originalControllerGetterFalseCompared:true,originalNativeTrimCallSiteCompared:true,originalCurrAndFirstDictionaryReturnCompared:true,allThreeObjectReturnAliasesRetainedBeforeResume:true,allThreeReturnCellsComparedAfterResume:true,allAllocatedBreakpointsRemoved:true,sharedServiceGroupRetained:true,normalRequests:this.#normal,cleanupRequests:this.#cleanup,suppliedTransportOnly:true,originalNativeOwnerJoined:false,nativeGlobalsQualified:false,titleHelperRuntimeQualified:false,originalAsyncThenRegistrationJoined:false,serviceDeliveryJoined:false,saveAuthorized:false});this.#packet=packet;return packet;
  }catch(error){this.#fail(error);await this.#tail;try{await this.#removeOnce();}catch(cleanupError){this.#notificationFailure??=Object.freeze({cause:cleanupError});}need(this.#failure!==null);throw this.#failure.cause;}finally{this.#settled=true;}})();this.#runTask=task;return task;
 }
 public finish():Promise<void>{
  if(this.#finishTask!==null){return this.#finishTask;}this.#current();const task=(async():Promise<void>=>{try{await this.run();this.#current();this.#finished=true;}catch(error){this.#fail(error);throw error;}})();this.#finishTask=task;return task;
 }
 public retireAfterOriginalExit():Promise<void>{
  if(this.#retirementTask!==null){return this.#retirementTask;}this.#current(true);this.#transport.assertOriginalExit();this.#closing=true;if(!this.#settled||this.#packet===null){this.#fail(new Error("WIRE_UI_RUNTIME_ORIGINAL_EXIT"));}
  const task=(async():Promise<void>=>{await settled(this.#armTask);await this.#tail;await settled(this.#runTask);await settled(this.#finishTask);await settled(this.#removeTask);await this.#functionTail;for(const attempt of this.#attempts){await settled(attempt.pending??null);}this.#current(true);this.#transport.assertOriginalExit();})();this.#retirementTask=task;return task;
 }
 public requireLiveComparison(data:CurrentSchematicWireUiRuntimeDriverData):void{this.#current();need(this.#packet===data&&!this.#finished&&this.#root!==null);requireRoot(this.#root);}
 public inspect():Readonly<{armed:boolean;settled:boolean;failed:boolean;pauses:number;resumes:number;normalRequests:number;cleanupRequests:number;allocationUncertain:boolean;originalNativeOwnerJoined:false;saveAuthorized:false}>{
  this.#current(true);return Object.freeze({armed:this.#armed,settled:this.#settled,failed:this.#failure!==null,pauses:this.#received,resumes:this.#resumes,normalRequests:this.#normal,cleanupRequests:this.#cleanup,allocationUncertain:this.#allocationUncertain,originalNativeOwnerJoined:false,saveAuthorized:false});
 }
 public retained():Readonly<{attempts:readonly Readonly<Attempt>[];events:readonly unknown[];firstFailure:Readonly<{cause:unknown}>|null;notificationFailure:Readonly<{cause:unknown}>|null}>{
  this.#current(true);return Object.freeze({attempts:Object.freeze(this.#attempts.map(row=>Object.freeze({...row}))),events:Object.freeze([...this.#events]),firstFailure:this.#failure,notificationFailure:this.#notificationFailure});
 }
}
Object.freeze(CurrentSchematicWireUiRuntimeDriver.prototype);Object.freeze(CurrentSchematicWireUiRuntimeDriver);
