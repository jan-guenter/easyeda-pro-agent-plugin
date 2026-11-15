/** Original selected tree child, async return cells and completed parser share one retained source owner. */
/* oxlint-disable import/max-dependencies -- Bind exact source controls, opaque preflight root, frames and cleanup custody together. */
import {types}from"node:util";
import {z}from"zod";
import {captureCurrentPcbStringClockReply as capture}from"./current-pcb-string-clock-reply.ts";
import {decodeCurrentFootprintCopyClockRpcV2Array as array,decodeCurrentFootprintCopyClockRpcV2ArrayCapture as tuple}from"./current-footprint-copy-clock-rpc-v2-protocol.ts";
import {CURRENT_SCHEMATIC_WIRE_SERVICE_INVOCATION_FLAGS as FLAGS}from"./current-schematic-wire-service-invocation-protocol.ts";
import {CURRENT_SCHEMATIC_WIRE_TREE_RUNTIME_FRAMES as F,CURRENT_SCHEMATIC_WIRE_TREE_RUNTIME_PROGRAMS as P}from"./current-schematic-wire-tree-runtime-programs.ts";
import{CURRENT_SCHEMATIC_WIRE_TREE_RUNTIME_KINDS as KINDS,decodeCurrentSchematicWireTreeRuntimePause as decodePause,currentSchematicWireTreeRuntimePoints as points,qualifyCurrentSchematicWireTreeRuntimeSource as qualify}from"./current-schematic-wire-tree-runtime-source.ts";
import type{CurrentSchematicWireTreeRuntimeKind as Kind}from"./current-schematic-wire-tree-runtime-source.ts";
import{consumeCurrentSchematicWireTreePreflightData as consumeBefore}from"./current-schematic-wire-tree-preflight-cursor.ts";
import type{CurrentSchematicWireTreePreflightData}from"./current-schematic-wire-tree-preflight-cursor.ts";
import{requireCurrentSchematicWireServiceInvocationRoot as serviceRoot}from"./current-schematic-wire-service-invocation-root.ts";
import type{CurrentSchematicWireServiceInvocationRoot}from"./current-schematic-wire-service-invocation-root.ts";
import{CurrentSchematicWireParserDriver}from"./current-schematic-wire-parser-driver.ts";
import{retainCurrentSchematicWireTreeParserReceipt as parserReceipt,requireCurrentSchematicWireTreeParserReceipt as requireReceipt}from"./current-schematic-wire-tree-parser-receipt.ts";
import{currentSchematicWireTreePromiseSettled as promiseSettled}from"./current-schematic-wire-tree-promise.ts";
import{CURRENT_SCHEMATIC_WIRE_TREE_RUNTIME_REQUESTS as LIMIT,validateCurrentSchematicWireTreeRuntimeCommand as validate}from"./current-schematic-wire-tree-runtime-protocol.ts";
import type{CurrentSchematicWireTreeRuntimeCommand as Command}from"./current-schematic-wire-tree-runtime-protocol.ts";

export type CurrentSchematicWireTreeRuntimeDriverCommand=Command;
export interface CurrentSchematicWireTreeRuntimeDriverTransport{
 readonly request:(command:Command)=>Promise<unknown>;
 readonly assertCurrent:()=>void;readonly assertOriginalExit:()=>void;readonly fail:(cause:unknown)=>void;
}
interface Input{readonly sessionId:string;readonly scriptId:string;readonly holder:string;readonly native:string;readonly variant:0|1;readonly source:unknown;readonly busScriptId:string;readonly busSource:unknown}
interface Attempt{readonly reserved:Command;readonly command:Command;readonly cleanup:boolean;pending?:Promise<unknown>;raw?:unknown;cause?:unknown}
interface Point{readonly kind:Kind;readonly id:string;removeAttempted:boolean;removed:boolean}
interface SourceCall{readonly program:string;readonly scripts:string[]}
interface Resume{readonly signal:PromiseWithResolvers<null>;eventObserved:boolean;ackObserved:boolean}
export interface CurrentSchematicWireTreeRuntimeDriverData{
 readonly schema:"private.schematic-wire-tree-runtime-events.v1";
 readonly allNinePausesAndResumesCompared:true;readonly originalFreshSerialBranchCompared:true;
 readonly originalSelectedTargetAndHelperNormalReturnsCompared:true;readonly sourceWrapperFinalExpressionCompared:true;
 readonly actualV8WrapperNormalReturnJoined:false;readonly originalChildReturnCellComparedAfterResume:true;
 readonly originalOuterParserReturnCompared:true;readonly originalModuleCounterTransitionCompared:true;
 readonly allFourRetainedPromisesFulfilledUndefinedCompared:true;readonly allAllocatedBreakpointsRemoved:true;
 readonly sharedServiceGroupRetained:true;readonly normalRequests:number;readonly cleanupRequests:number;
 readonly suppliedTransportOnly:true;readonly originalNativeOwnerJoined:false;readonly nativeGlobalsQualified:false;
 readonly selectedTreeHelperBindingsComplete:false;readonly selectedTreeChildJoined:false;readonly serviceDeliveryJoined:false;readonly saveAuthorized:false;
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
const frameLengths=Object.freeze({wrapperEntry:5,freshEntry:4,targetEntry:3,targetEarly:3,targetFinal:3,wrapperValue:4,continuation:7,onEntry:4,onReturn:4,freshReturn:4,callerPass:3,callerWrapper:5,callerFresh:4}as const);
const callerFrames=Object.freeze({pass:"callerPass",wrapper:"callerWrapper",fresh:"callerFresh"}as const);
function need(value:boolean):asserts value {if(!value){throw new Error("WIRE_TREE_RUNTIME_DRIVER");}}
async function settled(task:Promise<unknown>|null):Promise<void>{try{await task;}catch{
 // Original failure remains retained.
}}
function methods(transport:CurrentSchematicWireTreeRuntimeDriverTransport):readonly unknown[]{
 need(transport!==null&&typeof transport==="object"&&!types.isProxy(transport)&&(Object.getPrototypeOf(transport)===Object.prototype||Object.getPrototypeOf(transport)===null)&&Reflect.ownKeys(transport).length===4);
 return Object.freeze((["request","assertCurrent","assertOriginalExit","fail"]as const).map(name=>{const d=Object.getOwnPropertyDescriptor(transport,name);need(d!==undefined&&Object.hasOwn(d,"value")&&typeof d.value==="function");return d.value as unknown;}));
}
export class CurrentSchematicWireTreeRuntimeDriver{
 readonly #input:Input;readonly #transport:CurrentSchematicWireTreeRuntimeDriverTransport;readonly #methods:readonly unknown[];
 readonly #points:Point[]=[];readonly #attempts:Attempt[]=[];readonly #events:unknown[]=[];readonly #frames=new Map<Kind,string>();readonly #seen=new Set<Kind>();readonly #cells=new Map<string,string>();readonly #promises=new Map<string,string>();
 readonly #done=Promise.withResolvers<null>();readonly #parser:CurrentSchematicWireParserDriver;
 #before:ReturnType<typeof consumeBefore>|null=null;#entryFrame:string|null=null;
 #armTask:Promise<void>|null=null;#runTask:Promise<CurrentSchematicWireTreeRuntimeDriverData>|null=null;#finishTask:Promise<void>|null=null;#removeTask:Promise<void>|null=null;#retirementTask:Promise<void>|null=null;
 #tail:Promise<void>=Promise.resolve();#functionTail:Promise<void>=Promise.resolve();#sourceCall:SourceCall|null=null;#resume:Resume|null=null;
 #failure:Readonly<{cause:unknown}>|null=null;#notificationFailure:Readonly<{cause:unknown}>|null=null;#packet:CurrentSchematicWireTreeRuntimeDriverData|null=null;
 #normal=0;#cleanup=0;#received=0;#completed=0;#resumes=0;#resumeEvents=0;#sources=0;
 #armed=false;#closing=false;#settled=false;#finished=false;#allocationUncertain=false;
 public constructor(input:Input,transport:CurrentSchematicWireTreeRuntimeDriverTransport,parser:CurrentSchematicWireParserDriver){
  for(const id of[input.sessionId,input.scriptId,input.holder,input.native,input.busScriptId]){handle.parse(id);}
  need(qualify(input.source)===input.variant&&Object.getPrototypeOf(parser)===CurrentSchematicWireParserDriver.prototype);this.#parser=parser;
  this.#input=Object.freeze({...input});this.#transport=transport;this.#methods=methods(transport);void settled(this.#done.promise);this.#current();Object.freeze(this);
 }
 public bindPreflight(data:CurrentSchematicWireTreePreflightData,root:CurrentSchematicWireServiceInvocationRoot):void{
  this.#current();need(this.#before===null&&!this.#armed&&this.#armTask===null);const original=serviceRoot(root);need(original.input.holder===this.#input.holder&&original.input.native===this.#input.native&&original.input.scriptId===this.#input.scriptId&&original.input.variant===this.#input.variant);this.#before=consumeBefore(data,root);
 }
 #current(cleanup=false):void{need(methods(this.#transport).every((value,index)=>value===this.#methods[index]));if(!cleanup){need(!this.#closing&&this.#failure===null);this.#transport.assertCurrent();}}
 #fail(cause:unknown):void{if(this.#failure!==null){return;}this.#failure=Object.freeze({cause});this.#done.reject(cause);this.#resume?.signal.reject(cause);try{this.#transport.fail(cause);}catch(error){this.#notificationFailure=Object.freeze({cause:error});}}
 async #write(attempt:Attempt):Promise<unknown>{
  const command=attempt.command;let generated:SourceCall|null=null;
  if(command.method==="Runtime.callFunctionOn"){need(this.#sourceCall===null);generated={program:command.params.functionDeclaration,scripts:[]};this.#sourceCall=generated;}
  try{
   this.#current(attempt.cleanup);const pending=this.#transport.request(command);need(types.isPromise(pending));attempt.pending=pending;
   const raw=await pending;attempt.raw=raw;this.#current(attempt.cleanup);
   if(generated!==null){need(this.#sourceCall===generated&&generated.scripts.length===1);this.#sourceCall=null;const scriptId=generated.scripts[0];need(scriptId!==undefined);const packet=source.parse(capture(await this.#send({phase:"wire-tree-runtime-source",method:"Debugger.getScriptSource",params:{scriptId}})).value);need(packet.scriptSource===`(${generated.program})`);this.#sources+=1;}
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
  if(this.#armTask!==null){return this.#armTask;}this.#current();need(this.#before!==null);
  const before=this.#before;const task=(async():Promise<void>=>{try{for(const kind of KINDS){const row=points(this.#input.variant,before.role)[kind];this.#allocationUncertain=true;
   const ack=allocated.parse(capture(await this.#send({phase:"wire-tree-runtime-arm",variant:this.#input.variant,tree:before.role,point:kind,method:"Debugger.setBreakpoint",params:{location:{scriptId:this.#input.scriptId,lineNumber:row.lineNumber,columnNumber:row.columnNumber}}})).value);
   need(!this.#points.some(value=>value.id===ack.breakpointId));this.#points.push({kind,id:ack.breakpointId,removeAttempted:false,removed:false});this.#allocationUncertain=false;
   need(ack.actualLocation.scriptId===this.#input.scriptId&&ack.actualLocation.lineNumber===row.lineNumber&&ack.actualLocation.columnNumber===row.columnNumber);
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
   need(this.#before!==null);const held=decodePause(packet.params,this.#input.variant,this.#before.role,point.kind,this.#input.scriptId,point.id);this.#received+=1;const tail=this.#tail;
   this.#tail=(async():Promise<void>=>{try{await tail;this.#current();await this.#process(point.kind,held.frame,held.caller,held.returnValue);}catch(error){this.#fail(error);}})();return true;
  }catch(error){if(!retained){this.#events.push(input);}this.#fail(error);return true;}
 }
 static #props(objectId:string):Command{return validate({phase:"wire-tree-runtime-properties",method:"Runtime.getProperties",params:{objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}});}
 static #call(role:keyof typeof P,receiver:string,refs:readonly string[],byValue=true):Command{return validate({phase:"wire-tree-runtime-call",role,method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:receiver,functionDeclaration:P[role],arguments:refs.map(objectId=>({objectId})),returnByValue:byValue,awaitPromise:false,userGesture:false}});}
 async #properties(id:string):Promise<unknown>{const command=CurrentSchematicWireTreeRuntimeDriver.#props(id);const raw=await this.#send(command);return capture(raw).value;}
 async #compare(role:keyof typeof P,receiver:string,refs:readonly string[]):Promise<void>{const command=CurrentSchematicWireTreeRuntimeDriver.#call(role,receiver,refs);const raw=await this.#send(command);z.strictObject({result:z.strictObject({type:z.literal("boolean"),value:z.literal(true)})}).parse(capture(raw).value);}
 async #frame(role:keyof typeof F[0],callFrameId:string):Promise<string>{
  const raw=await this.#send(validate({phase:"wire-tree-runtime-frame",variant:this.#input.variant,role,method:"Debugger.evaluateOnCallFrame",params:{...FLAGS,callFrameId,expression:F[this.#input.variant][role],returnByValue:false,includeCommandLineAPI:false}}));
  const length=frameLengths[role];
  const captured=tuple(capture(raw).value,length);array(await this.#properties(captured),length);return captured;
 }
 async #retain(kind:string,id:string):Promise<void>{
  need(!this.#cells.has(kind));const raw=await this.#send(CurrentSchematicWireTreeRuntimeDriver.#call("retain",id,[],false));const cell=tuple(capture(raw).value,1);
  const values=array(await this.#properties(cell),1);
  const promise=z.strictObject({type:z.literal("object"),subtype:z.literal("promise"),className:z.literal("Promise"),description:z.literal("Promise"),objectId:handle}).parse(values.get("0"));
  this.#cells.set(kind,cell);this.#promises.set(kind,promise.objectId);
 }
 #order(point:Kind):void{
  need(!this.#seen.has(point));const seen=(key:Kind):boolean=>this.#seen.has(key);
  if(point==="wrapperEntry"){need(this.#seen.size===0);}
  else if(point==="freshEntry"){need(this.#seen.size===1&&seen("wrapperEntry"));}
  else if(point==="targetEntry"){need(this.#seen.size===2&&seen("freshEntry"));}
  else if(point==="targetEarly"||point==="targetFinal"){need(seen("targetEntry")&&!seen("targetEarly")&&!seen("targetFinal"));}
  else if(point==="wrapperValue"){need(seen("targetEntry"));}
  else if(point==="continuation"){need(seen("wrapperValue"));}
  else if(point==="onEntry"){need(seen("continuation"));}
  else if(point==="onReturn"){need(seen("onEntry"));}
  else{need(seen("wrapperValue")&&(seen("targetEarly")||seen("targetFinal")));}
 }
 async #process(point:Kind,frame:string,caller:string|null,returnValue:unknown):Promise<void>{
  need(this.#before!==null);this.#order(point);const before=this.#before,original=serviceRoot(before.root),reg=before.root.registrations;
  const captured=await this.#frame(point,frame);if(point==="wrapperEntry"){this.#entryFrame=captured;}need(this.#entryFrame!==null);
  let parent=captured;const row=points(this.#input.variant,before.role)[point];
  if(row.caller!==null){need(caller!==null);parent=await this.#frame(callerFrames[row.caller],caller);}
  const refs=[original.input.native,original.input.holder,reg.root,reg.senderMethodsA,reg.senderMethodsB,before.snapshot,before.on,before.scope,before.target,before.ticketScope,this.#entryFrame,parent];
  let role:keyof typeof P;
  if(point==="targetEarly"||point==="targetFinal"){role="targetReturn";}
  else if(point==="continuation"){role=this.#input.variant===0?"continuation0":"continuation1";}
  else if(point==="onEntry"){role=this.#input.variant===0?"onEntry0":"onEntry1";}
  else if(point==="onReturn"){role=this.#input.variant===0?"onReturn0":"onReturn1";}
  else{role=point;}
  await this.#compare(role,captured,refs);
  if(point==="wrapperValue"){
   const fields=array(await this.#properties(captured),4),id=z.object({objectId:handle}).parse(fields.get("0")).objectId;await this.#retain("wrapper",id);
  }else if(row.returned){
   const id=z.object({objectId:handle}).parse(returnValue).objectId;let kind="fresh";if(point==="targetEarly"||point==="targetFinal"){kind="target";}else if(point==="onReturn"){kind="on";}await this.#retain(kind,id);
  }
  this.#frames.set(point,captured);this.#seen.add(point);await this.#resumeOnce();this.#completed+=1;if(this.#completed===LIMIT.pauseCount){this.#done.resolve(null);}
 }
 async #resumeOnce():Promise<void>{
  need(this.#resume===null);const resume:Resume={signal:Promise.withResolvers<null>(),eventObserved:false,ackObserved:false};void settled(resume.signal.promise);this.#resume=resume;
  empty.parse(capture(await this.#send({phase:"wire-tree-runtime-resume",method:"Debugger.resume",params:{}})).value);resume.ackObserved=true;await resume.signal.promise;this.#current();need(this.#resume===resume&&resume.eventObserved&&resume.ackObserved);this.#resume=null;this.#resumes+=1;
 }
 #removeOnce():Promise<void>{
  if(this.#removeTask!==null){return this.#removeTask;}
  const task=(async():Promise<void>=>{let failure:Readonly<{cause:unknown}>|null=null;for(const point of this.#points){need(!point.removeAttempted);point.removeAttempted=true;try{empty.parse(capture(await this.#send({phase:"wire-tree-runtime-remove",method:"Debugger.removeBreakpoint",params:{breakpointId:point.id}},true)).value);point.removed=true;}catch(error){failure??=Object.freeze({cause:error});}}if(failure!==null){throw failure.cause;}})();this.#removeTask=task;return task;
 }
 async #compareAliases():Promise<void>{
  need(this.#before!==null&&this.#entryFrame!==null);const before=this.#before,original=serviceRoot(before.root),reg=before.root.registrations;
  need(this.#cells.size===4&&this.#promises.size===4);
  let fulfilled=false;for(let pass=0;pass<LIMIT.pollPasses;pass+=1){
   let all=true;for(const id of this.#promises.values()){if(!promiseSettled(await this.#properties(id))){all=false;}}
   if(all){fulfilled=true;break;}
  }need(fulfilled);
  const parser=await this.#parser.run(),receipt=parserReceipt(this.#parser,parser);requireReceipt(receipt,this.#parser,parser);
  need(promiseSettled(await this.#properties(receipt.promise)));
  array(await this.#properties(receipt.frame),3);
  const cells=["wrapper","target","fresh","on"].map(key=>{const id=this.#cells.get(key);need(id!==undefined);return id;});
  for(const id of cells){array(await this.#properties(id),1);}
  const [wrapper,target,fresh,on]=cells;need(wrapper!==undefined&&target!==undefined&&fresh!==undefined&&on!==undefined);
  const freshFrame=this.#frames.get("freshReturn"),onFrame=this.#frames.get("onReturn");need(freshFrame!==undefined&&onFrame!==undefined);const refs=[original.input.native,original.input.holder,reg.root,reg.senderMethodsA,reg.senderMethodsB,before.snapshot,before.on,freshFrame,before.target,onFrame,this.#entryFrame,wrapper,target,fresh,on,receipt.promise,receipt.frame,receipt.context,receipt.sheet];
  await this.#compare(this.#input.variant===0?"join0":"join1",original.input.holder,refs);
  requireReceipt(receipt,this.#parser,parser);
 }
 public run():Promise<CurrentSchematicWireTreeRuntimeDriverData>{
  if(this.#runTask!==null){return this.#runTask;}this.#current();
  const task=(async():Promise<CurrentSchematicWireTreeRuntimeDriverData>=>{try{
   await this.arm();await this.#done.promise;await this.#tail;await this.#compareAliases();this.#current();
   need(this.#received===9&&this.#completed===9&&this.#resumes===9&&this.#resumeEvents===9&&this.#seen.size===9&&this.#sources===14&&this.#sources===this.#attempts.filter(row=>row.command.method==="Runtime.callFunctionOn").length);
   await this.#removeOnce();this.#current();need(this.#points.length===10&&this.#points.every(point=>point.removed));
   const packet:CurrentSchematicWireTreeRuntimeDriverData=Object.freeze({schema:"private.schematic-wire-tree-runtime-events.v1",allNinePausesAndResumesCompared:true,originalFreshSerialBranchCompared:true,originalSelectedTargetAndHelperNormalReturnsCompared:true,sourceWrapperFinalExpressionCompared:true,actualV8WrapperNormalReturnJoined:false,originalChildReturnCellComparedAfterResume:true,originalOuterParserReturnCompared:true,originalModuleCounterTransitionCompared:true,allFourRetainedPromisesFulfilledUndefinedCompared:true,allAllocatedBreakpointsRemoved:true,sharedServiceGroupRetained:true,normalRequests:this.#normal,cleanupRequests:this.#cleanup,suppliedTransportOnly:true,originalNativeOwnerJoined:false,nativeGlobalsQualified:false,selectedTreeHelperBindingsComplete:false,selectedTreeChildJoined:false,serviceDeliveryJoined:false,saveAuthorized:false});this.#packet=packet;return packet;
  }catch(error){this.#fail(error);await this.#tail;try{await this.#removeOnce();}catch(cleanupError){this.#notificationFailure??=Object.freeze({cause:cleanupError});}need(this.#failure!==null);throw this.#failure.cause;}finally{this.#settled=true;}})();this.#runTask=task;return task;
 }
 public finish():Promise<void>{
  if(this.#finishTask!==null){return this.#finishTask;}this.#current();const task=(async():Promise<void>=>{try{await this.run();this.#current();this.#finished=true;}catch(error){this.#fail(error);throw error;}})();this.#finishTask=task;return task;
 }
 public retireAfterOriginalExit():Promise<void>{
  if(this.#retirementTask!==null){return this.#retirementTask;}this.#current(true);this.#transport.assertOriginalExit();this.#closing=true;if(!this.#settled||this.#packet===null){this.#fail(new Error("WIRE_TREE_RUNTIME_ORIGINAL_EXIT"));}
  const task=(async():Promise<void>=>{await settled(this.#armTask);await this.#tail;await settled(this.#runTask);await settled(this.#finishTask);await settled(this.#removeTask);await this.#functionTail;for(const attempt of this.#attempts){await settled(attempt.pending??null);}this.#current(true);this.#transport.assertOriginalExit();})();this.#retirementTask=task;return task;
 }
 public requireLiveComparison(data:CurrentSchematicWireTreeRuntimeDriverData):void{this.#current();need(this.#packet===data&&!this.#finished&&this.#before!==null);serviceRoot(this.#before.root);}
 public inspect():Readonly<{armed:boolean;settled:boolean;failed:boolean;pauses:number;resumes:number;normalRequests:number;cleanupRequests:number;allocationUncertain:boolean;originalNativeOwnerJoined:false;saveAuthorized:false}>{
  this.#current(true);return Object.freeze({armed:this.#armed,settled:this.#settled,failed:this.#failure!==null,pauses:this.#received,resumes:this.#resumes,normalRequests:this.#normal,cleanupRequests:this.#cleanup,allocationUncertain:this.#allocationUncertain,originalNativeOwnerJoined:false,saveAuthorized:false});
 }
 public retained():Readonly<{attempts:readonly Readonly<Attempt>[];events:readonly unknown[];firstFailure:Readonly<{cause:unknown}>|null;notificationFailure:Readonly<{cause:unknown}>|null}>{
  this.#current(true);return Object.freeze({attempts:Object.freeze(this.#attempts.map(row=>Object.freeze({...row}))),events:Object.freeze([...this.#events]),firstFailure:this.#failure,notificationFailure:this.#notificationFailure});
 }
}
Object.freeze(CurrentSchematicWireTreeRuntimeDriver.prototype);Object.freeze(CurrentSchematicWireTreeRuntimeDriver);
