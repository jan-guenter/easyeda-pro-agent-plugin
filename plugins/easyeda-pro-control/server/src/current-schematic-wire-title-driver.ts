/** One original title callback owner retains its branch, return and query joins. */
/* oxlint-disable import/max-dependencies -- Exact controls, original issuers and retained return custody share one driver. */
import{CURRENT_SCHEMATIC_WIRE_TITLE_FT_CONDITION as FT_CONDITION,CURRENT_SCHEMATIC_WIRE_TITLE_FT_REQUESTS as FT_LIMIT,decodeCurrentSchematicWireTitleFtPause as decodeFtPause,currentSchematicWireTitleFtCall as ftCall,decodeCurrentSchematicWireTitleFtCondition as ftCondition,currentSchematicWireTitleFtLocation as ftLocation,validateCurrentSchematicWireTitleFtCommand as validateFt}from"./current-schematic-wire-title-ft-protocol.ts";
import type{CurrentSchematicWireTitleFtReturnData,CurrentSchematicWireTitleFtCommand as FtCommand}from"./current-schematic-wire-title-ft-protocol.ts";
import{currentSchematicWireTitleFtArrayPreflight as ftPreflight}from"./current-schematic-wire-title-ft-preflight.ts";
import{types}from"node:util";
import{z}from"zod";
import{captureCurrentPcbStringClockReply as capture}from"./current-pcb-string-clock-reply.ts";
import{decodeCurrentFootprintCopyClockRpcV2Array as array,decodeCurrentFootprintCopyClockRpcV2ArrayCapture as tuple}from"./current-footprint-copy-clock-rpc-v2-protocol.ts";
import{CurrentSchematicWireTitlePreflightCursor,currentSchematicWireTitleCall as call,consumeCurrentSchematicWireTitlePreflightData as consume,currentSchematicWireTitleProperties as props}from"./current-schematic-wire-title-preflight.ts";
import type{CurrentSchematicWireTitlePreflightData}from"./current-schematic-wire-title-preflight.ts";
import{requireCurrentSchematicWireServiceInvocationRoot as requireRoot}from"./current-schematic-wire-service-invocation-root.ts";
import type{CurrentSchematicWireServiceInvocationRoot}from"./current-schematic-wire-service-invocation-root.ts";
import type{CurrentSchematicWireTreePreflightData}from"./current-schematic-wire-tree-preflight-cursor.ts";
import{requireCurrentSchematicWireServiceTitleQuery as queryReceipt}from"./current-schematic-wire-service-invocation-cursor.ts";
import type{CurrentSchematicWireServiceInvocationData}from"./current-schematic-wire-service-invocation-cursor.ts";
import{CURRENT_SCHEMATIC_WIRE_TITLE_CALLBACK as CALLBACK,decodeCurrentSchematicWireTitlePause as decodePause,qualifyCurrentSchematicWireTitleSource as qualify,decodeCurrentSchematicWireTitleCallback as qualifyCallback}from"./current-schematic-wire-title-source.ts";
import{CURRENT_SCHEMATIC_WIRE_TITLE_KINDS as KINDS,CURRENT_SCHEMATIC_WIRE_TITLE_REQUESTS as LIMIT,currentSchematicWireTitlePoints as points,validateCurrentSchematicWireTitleCommand as validate}from"./current-schematic-wire-title-protocol.ts";
import type{CurrentSchematicWireTitleCommand as Command,CurrentSchematicWireTitleKind as Kind}from"./current-schematic-wire-title-protocol.ts";
import{CURRENT_SCHEMATIC_WIRE_TITLE_FRAMES as F}from"./current-schematic-wire-title-programs.ts";
import{CURRENT_SCHEMATIC_WIRE_SERVICE_INVOCATION_FLAGS as FLAGS}from"./current-schematic-wire-service-invocation-protocol.ts";
import{currentSchematicWireTreePromiseSettled as fulfilled}from"./current-schematic-wire-tree-promise.ts";

export type CurrentSchematicWireTitleDriverCommand=Command|FtCommand;
export interface CurrentSchematicWireTitleTransport{readonly request:(command:CurrentSchematicWireTitleDriverCommand)=>Promise<unknown>;readonly assertCurrent:()=>void;readonly assertOriginalExit:()=>void;readonly fail:(cause:unknown)=>void}
interface Input{readonly sessionId:string;readonly scriptId:string;readonly holder:string;readonly native:string;readonly variant:0|1;readonly source:unknown}
interface Attempt{readonly command:CurrentSchematicWireTitleDriverCommand;readonly ft?:boolean;readonly cleanup:boolean;pending?:Promise<unknown>;raw?:unknown;cause?:unknown}
interface Point{readonly kind:Kind;readonly id:string;attempted:boolean;removed:boolean}
interface SourceCall{readonly program:string;readonly scripts:string[]}
interface Resume{readonly ft:boolean;readonly signal:PromiseWithResolvers<null>;event:boolean;ack:boolean}
export interface CurrentSchematicWireTitleData{readonly schema:"private.schematic-wire-title-callback.v1";readonly originalTreeProjectAndTitleQueryCompared:true;readonly allTwelveOriginalHelperSourcesAndBindingsCompared:true;readonly allFiveOriginalCallbackPausesAndResumesCompared:true;readonly originalFlatEmptySymbolBranchCompared:true;readonly originalCallbackFunctionAndFtCallerCompared:true;readonly originalCallbackNormalReturnCellComparedAfterResume:true;readonly callbackPromiseFulfilledUndefinedCompared:true;readonly originalQueryAndTitleResultCompared:true;readonly allAllocatedBreakpointsRemoved:true;readonly sharedServiceGroupRetained:true;readonly normalRequests:number;readonly cleanupRequests:number;readonly suppliedTransportOnly:true;readonly originalNativeOwnerJoined:false;readonly nativeGlobalsQualified:false;readonly ftNormalReturnJoined:false;readonly titleHelperRuntimeQualified:false;readonly selectedTreeChildJoined:false;readonly serviceDeliveryJoined:false;readonly saveAuthorized:false}
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u),location=z.strictObject({scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()});
const allocation=z.strictObject({breakpointId:handle,actualLocation:location}),empty=z.strictObject({});
const event=z.strictObject({sessionId:handle,method:z.enum(["Debugger.paused","Debugger.resumed","Debugger.scriptParsed"]),params:z.unknown()});
const paused=z.object({hitBreakpoints:z.array(handle).length(1)}),script=z.object({scriptId:handle,url:z.string(),length:z.number().int().nonnegative()}),source=z.strictObject({scriptSource:z.string().max(32_768)});
const truth=z.strictObject({result:z.strictObject({type:z.literal("boolean"),value:z.literal(true)})});
function need(value:boolean):asserts value{if(!value){throw new Error("WIRE_TITLE_DRIVER");}}
async function settled(task:Promise<unknown>|null):Promise<void>{try{await task;}catch{
 // Retain the original failure; retirement only drains its original requests.
}}
function methods(transport:CurrentSchematicWireTitleTransport):readonly unknown[]{need(transport!==null&&typeof transport==="object"&&!types.isProxy(transport)&&(Object.getPrototypeOf(transport)===Object.prototype||Object.getPrototypeOf(transport)===null)&&Reflect.ownKeys(transport).length===4);return Object.freeze((["request","assertCurrent","assertOriginalExit","fail"]as const).map(name=>{const d=Object.getOwnPropertyDescriptor(transport,name);need(d!==undefined&&Object.hasOwn(d,"value")&&typeof d.value==="function");return d.value as unknown;}));}
export class CurrentSchematicWireTitleDriver{
 readonly #input:Input;readonly #transport:CurrentSchematicWireTitleTransport;readonly #methods:readonly unknown[];readonly #attempts:Attempt[]=[];readonly #events:unknown[]=[];readonly #points:Point[]=[];readonly #done=Promise.withResolvers<null>();
 #before:ReturnType<typeof consume>|null=null;#cursor:CurrentSchematicWireTitlePreflightCursor|null=null;#snapshot:string|null=null;#query:string|null=null;#entry:string|null=null;#cell:string|null=null;#promise:string|null=null;
 #prepareTask:Promise<CurrentSchematicWireTitlePreflightData>|null=null;#armTask:Promise<void>|null=null;#runTask:Promise<CurrentSchematicWireTitleData>|null=null;#removeTask:Promise<void>|null=null;#finishTask:Promise<void>|null=null;#retireTask:Promise<void>|null=null;
 #tail:Promise<void>=Promise.resolve();#functions:Promise<void>=Promise.resolve();#source:SourceCall|null=null;#resume:Resume|null=null;
 #failure:Readonly<{cause:unknown}>|null=null;#notificationFailure:Readonly<{cause:unknown}>|null=null;#packet:CurrentSchematicWireTitleData|null=null;
 #ftPrepareTask:Promise<void>|null=null;#ftArray:string|null=null;readonly #ftConditions:string[]=[];#ftConditionReads=0;#ftEnabled=false;#ftPoint:Readonly<{id:string}>|null=null;#ftRemoveAttempted=false;#ftRemoved=false;#ftNormal=0;#ftCleanup=0;#ftSources=0;#ftPauses=0;#ftCompleted=0;#ftResumes=0;#ftResumeEvents=0;
 #ftFrame:string|null=null;#ftCell:string|null=null;#ftPromise:string|null=null;#ftPacket:CurrentSchematicWireTitleFtReturnData|null=null;#ftRemoveTask:Promise<void>|null=null;
 #preparing=false;#armed=false;#closing=false;#finished=false;#settled=false;#uncertain=false;#prepared=0;#preparedSources=0;#normal=0;#cleanup=0;#sources=0;#pauses=0;#completed=0;#resumes=0;#resumeEvents=0;
 public constructor(input:Input,transport:CurrentSchematicWireTitleTransport){for(const id of[input.sessionId,input.scriptId,input.holder,input.native]){handle.parse(id);}need(qualify(input.source)===input.variant);this.#input=Object.freeze({...input});this.#transport=transport;this.#methods=methods(transport);void settled(this.#done.promise);this.#current();Object.freeze(this);}
 #current(cleanup=false):void{need(methods(this.#transport).every((value,index)=>value===this.#methods[index]));if(!cleanup){need(!this.#closing&&this.#failure===null);this.#transport.assertCurrent();if(this.#before!==null){requireRoot(this.#before.root);}}}
 #fail(cause:unknown):void{if(this.#failure!==null){return;}this.#failure=Object.freeze({cause});this.#cursor?.fail();this.#done.reject(cause);this.#resume?.signal.reject(cause);try{this.#transport.fail(cause);}catch(error){this.#notificationFailure=Object.freeze({cause:error});}}

 #send(input:Command,cleanup=false):Promise<unknown>{this.#current(cleanup);const command=validate(input);if(cleanup){need(this.#cleanup<LIMIT.cleanup);this.#cleanup+=1;}else if(this.#preparing){need(this.#prepared<LIMIT.preflight+LIMIT.preflightSources);this.#prepared+=1;}else{need(this.#normal<LIMIT.runtime);this.#normal+=1;}return this.#queue({command,cleanup});}
 #ftSend(input:FtCommand,cleanup=false):Promise<unknown>{
  this.#current(cleanup);need(this.#ftEnabled);const command=validateFt(input);
  if(cleanup){need(this.#ftCleanup<FT_LIMIT.cleanup);this.#ftCleanup+=1;}else{need(this.#ftNormal<FT_LIMIT.normal);this.#ftNormal+=1;}
  return this.#queue({command,cleanup,ft:true});
 }
 #queue(attempt:Attempt):Promise<unknown>{this.#attempts.push(attempt);if(attempt.command.method!=="Runtime.callFunctionOn"){return this.#write(attempt);}const prior=this.#functions;const task=(async():Promise<unknown>=>{await prior;return this.#write(attempt);})();this.#functions=settled(task);return task;}
 async #write(attempt:Attempt):Promise<unknown>{
  const command=attempt.command;let generated:SourceCall|null=null;
  if(command.method==="Runtime.callFunctionOn"){need(this.#source===null);generated={program:command.params.functionDeclaration,scripts:[]};this.#source=generated;}
  try{
   this.#current(attempt.cleanup);const pending=this.#transport.request(command);need(types.isPromise(pending));attempt.pending=pending;const raw=await pending;attempt.raw=raw;this.#current(attempt.cleanup);
   if(generated!==null){need(this.#source===generated&&generated.scripts.length===1);this.#source=null;const id=generated.scripts[0];need(id!==undefined);
    const read=attempt.ft===true?this.#ftSend({phase:"wire-title-ft-source",method:"Debugger.getScriptSource",params:{scriptId:id}}):this.#send({phase:"wire-title-source",method:"Debugger.getScriptSource",params:{scriptId:id}});
    const actual=source.parse(capture(await read).value);need(actual.scriptSource===`(${generated.program})`);
    if(attempt.ft===true){need(this.#ftSources<FT_LIMIT.sources);this.#ftSources+=1;}
    else if(this.#preparing){need(this.#preparedSources<LIMIT.preflightSources);this.#preparedSources+=1;}else{need(this.#sources<LIMIT.runtimeSources);this.#sources+=1;}
   }return raw;
  }catch(error){attempt.cause=error;throw error;}finally{if(this.#source===generated){this.#source=null;}}
 }
 /** Separate fixed continuation; opt in only after original preflight and before arm. */
 public prepareFtReturn():Promise<void>{
  if(this.#ftPrepareTask!==null){return this.#ftPrepareTask;}this.#current();need(this.#before!==null&&!this.#preparing&&this.#armTask===null&&!this.#ftEnabled);this.#ftEnabled=true;
  const before=this.#before;const task=(async():Promise<void>=>{try{
   const cursor=ftPreflight(this.#input.variant,this.#input.scriptId,this.#input.native,before.helpers);let row=cursor.next();
   while(row.done!==true){row=cursor.next(capture(await this.#ftSend(row.value)).value);}
   this.#current();this.#ftArray=row.value;
  }catch(error){this.#fail(error);throw error;}})();this.#ftPrepareTask=task;return task;
 }
 async #currentFtArray():Promise<void>{need(this.#ftArray!==null);const command=ftCall("arrayCurrent",this.#ftArray,[this.#input.native]);const raw=await this.#ftSend(command);truth.parse(capture(raw).value);}
 async #readFtConditions():Promise<void>{
  while(this.#ftConditionReads<this.#ftConditions.length){const scriptId=this.#ftConditions[this.#ftConditionReads];need(scriptId!==undefined);
   const raw=source.parse(capture(await this.#ftSend({phase:"wire-title-ft-source",method:"Debugger.getScriptSource",params:{scriptId}})).value);
   need(raw.scriptSource===FT_CONDITION);this.#ftConditionReads+=1;
  }
 }
 async #armFtReturn():Promise<void>{
  need(this.#ftEnabled&&this.#ftArray!==null&&this.#ftPoint===null&&this.#completed===4&&this.#cell!==null);await this.#currentFtArray();this.#uncertain=true;
  const expected=ftLocation(this.#input.variant,this.#input.scriptId);
  const ack=allocation.parse(capture(await this.#ftSend({phase:"wire-title-ft-arm",variant:this.#input.variant,method:"Debugger.setBreakpoint",params:{location:expected,condition:FT_CONDITION}})).value);
  need(!this.#points.some(point=>point.id===ack.breakpointId));this.#ftPoint=Object.freeze({id:ack.breakpointId});
  need(ack.actualLocation.scriptId===expected.scriptId&&ack.actualLocation.lineNumber===expected.lineNumber&&ack.actualLocation.columnNumber===expected.columnNumber);this.#uncertain=false;
 }
 #ftProperties(objectId:string):Promise<unknown>{return this.#ftSend({phase:"wire-title-ft-properties",method:"Runtime.getProperties",params:{objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}});}
 async #processFt(frameId:string,returned:string):Promise<void>{
  need(this.#ftEnabled&&this.#completed===5&&this.#entry!==null&&this.#ftFrame===null);await this.#readFtConditions();await this.#currentFtArray();
  this.#ftFrame=tuple(capture(await this.#ftSend({phase:"wire-title-ft-frame",method:"Debugger.evaluateOnCallFrame",params:{...FLAGS,callFrameId:frameId,expression:"[i,e]",returnByValue:false,includeCommandLineAPI:false}})).value,2);
  array(capture(await this.#ftProperties(this.#ftFrame)).value,2);
  const compare=ftCall("compare",this.#ftFrame,[...this.#refs(),this.#entry]);const compared=await this.#ftSend(compare);truth.parse(capture(compared).value);
  const retain=ftCall("retain",returned,[]);const retained=await this.#ftSend(retain);this.#ftCell=tuple(capture(retained).value,1);
  const fields=array(capture(await this.#ftProperties(this.#ftCell)).value,1);
  this.#ftPromise=z.strictObject({type:z.literal("object"),subtype:z.literal("promise"),className:z.literal("Promise"),description:z.literal("Promise"),objectId:handle}).parse(fields.get("0")).objectId;
  await this.#resumeOnce(true);this.#ftCompleted+=1;
 }
 #removeFt():Promise<void>{
  if(this.#ftRemoveTask!==null){return this.#ftRemoveTask;}
  const task=(async():Promise<void>=>{if(this.#ftPoint===null){return;}need(!this.#ftRemoveAttempted);this.#ftRemoveAttempted=true;
   empty.parse(capture(await this.#ftSend({phase:"wire-title-ft-remove",method:"Debugger.removeBreakpoint",params:{breakpointId:this.#ftPoint.id}},true)).value);this.#ftRemoved=true;
  })();this.#ftRemoveTask=task;return task;
 }
 public prepare(root:CurrentSchematicWireServiceInvocationRoot,tree:CurrentSchematicWireTreePreflightData):Promise<CurrentSchematicWireTitlePreflightData>{if(this.#prepareTask!==null){return this.#prepareTask;}this.#current();const original=requireRoot(root);need(original.input.holder===this.#input.holder&&original.input.native===this.#input.native&&original.input.scriptId===this.#input.scriptId&&original.input.variant===this.#input.variant);const task=(async():Promise<CurrentSchematicWireTitlePreflightData>=>{try{this.#preparing=true;const cursor=new CurrentSchematicWireTitlePreflightCursor(root,tree);this.#cursor=cursor;for(let command=cursor.next();command!==null;command=cursor.next()){cursor.reserve(command);cursor.accept(command,await this.#send(command));}const data=cursor.requireCompleted();this.#before=consume(data,root);this.#cursor=null;this.#preparing=false;return data;}catch(error){this.#fail(error);throw error;}})();this.#prepareTask=task;return task;}
 public arm():Promise<void>{if(this.#armTask!==null){return this.#armTask;}this.#current();need(this.#before!==null&&!this.#preparing);const task=(async():Promise<void>=>{try{for(const kind of KINDS){this.#uncertain=true;const columnNumber=points(this.#input.variant)[kind],lineNumber=CALLBACK[this.#input.variant].lineNumber;const ack=allocation.parse(capture(await this.#send({phase:"wire-title-arm",variant:this.#input.variant,point:kind,method:"Debugger.setBreakpoint",params:{location:{scriptId:this.#input.scriptId,lineNumber,columnNumber}}})).value);need(!this.#points.some(point=>point.id===ack.breakpointId));this.#points.push({kind,id:ack.breakpointId,attempted:false,removed:false});this.#uncertain=false;need(ack.actualLocation.scriptId===this.#input.scriptId&&ack.actualLocation.lineNumber===lineNumber&&ack.actualLocation.columnNumber===columnNumber);}this.#armed=true;}catch(error){this.#fail(error);throw error;}})();this.#armTask=task;return task;}
 public observeFtCondition(input:unknown):boolean{
  if(this.#closing||!this.#ftEnabled||this.#ftPoint===null||this.#ftRemoveAttempted){return false;}
  const packet=event.parse(capture(input).value);if(packet.sessionId!==this.#input.sessionId||packet.method!=="Debugger.scriptParsed"){return false;}
  const id=ftCondition(packet.params,this.#input.variant,this.#input.scriptId);if(id===null){return false;}
  try{this.#current();need(this.#ftConditions.length<FT_LIMIT.conditionScripts&&!this.#ftConditions.includes(id));this.#ftConditions.push(id);this.#events.push(input);return true;}
  catch(error){this.#events.push(input);this.#fail(error);return true;}
 }
 public observe(input:unknown):boolean{if(this.#closing){return false;}let retained=false;try{this.#current();const packet=event.parse(capture(input).value);if(packet.sessionId!==this.#input.sessionId){return false;}if(packet.method==="Debugger.scriptParsed"){const active=this.#source,actual=script.parse(packet.params);if(active===null){return false;}if(actual.url!==""||actual.length!==active.program.length+2){return false;}need(!active.scripts.includes(actual.scriptId));active.scripts.push(actual.scriptId);need(active.scripts.length===1);this.#events.push(input);return true;}this.#events.push(input);retained=true;if(packet.method==="Debugger.resumed"){empty.parse(packet.params);const original=this.#resume;need(original!==null&&!original.event);original.event=true;if(original.ft){this.#ftResumeEvents+=1;need(this.#ftResumeEvents<=1);}else{this.#resumeEvents+=1;need(this.#resumeEvents<=LIMIT.pauseCount);}original.signal.resolve(null);return true;}const originalFt=paused.parse(packet.params).hitBreakpoints[0];if(this.#ftPoint!==null&&originalFt===this.#ftPoint.id){need(this.#ftEnabled&&this.#ftPauses===0);const held=decodeFtPause(packet.params,this.#input.variant,this.#input.scriptId,this.#ftPoint.id);this.#ftPauses+=1;const prior=this.#tail;this.#tail=(async():Promise<void>=>{try{await prior;this.#current();await this.#processFt(held.frame,held.promise);}catch(error){this.#fail(error);}})();return true;}need(this.#armed&&this.#pauses<LIMIT.pauseCount&&(this.#pauses===this.#completed||this.#resumeEvents===this.#pauses));const head=paused.parse(packet.params),point=this.#points.find(row=>row.id===head.hitBreakpoints[0]);need(point!==undefined&&KINDS[this.#pauses]===point.kind);const held=decodePause(packet.params,this.#input.variant,point.kind,this.#input.scriptId,point.id);this.#pauses+=1;const tail=this.#tail;this.#tail=(async():Promise<void>=>{try{await tail;this.#current();await this.#process(point.kind,held.frame,held.caller,held.returnValue);}catch(error){this.#fail(error);}})();return true;}catch(error){if(!retained){this.#events.push(input);}this.#fail(error);return true;}}
 async #frame(role:keyof typeof F,id:string):Promise<string>{
  const command=validate({phase:"wire-title-frame",role,method:"Debugger.evaluateOnCallFrame",params:{...FLAGS,callFrameId:id,expression:F[role],returnByValue:false,includeCommandLineAPI:false}});
  const raw=await this.#send(command);
  const length=({entry:6,caller:5,step:7,branch:11}as const)[role];
  const captured=tuple(capture(raw).value,length);
  const properties=await this.#send(props(captured));array(capture(properties).value,length);return captured;
 }
 #refs():string[]{need(this.#before!==null&&this.#snapshot!==null&&this.#query!==null);const original=requireRoot(this.#before.root);return[original.input.native,original.input.holder,this.#before.root.registrations.root,this.#before.before,this.#before.helpers,this.#snapshot,this.#query];}
 public async compareQuery(data:CurrentSchematicWireServiceInvocationData):Promise<void>{
  try{
   this.#current();need(this.#before!==null&&this.#snapshot===null&&this.#query===null&&this.#pauses===0&&data.stage==="queryEntry");
   const original=queryReceipt(data,this.#before.root);need(original.query!==null);this.#snapshot=original.snapshot;this.#query=original.query;
   const raw=await this.#send(call("query",this.#input.holder,this.#refs()));truth.parse(capture(raw).value);
  }catch(error){this.#fail(error);throw error;}
 }
 async #process(kind:Kind,id:string,callerId:string|null,returnValue:unknown):Promise<void>{
  const refs=this.#refs();
  if(kind==="entry"){
   need(callerId!==null&&this.#entry===null);
   const top=await this.#frame("entry",id);
   const caller=await this.#frame("caller",callerId);
   const raw=await this.#send(call("entry",top,[...refs,caller]));this.#entry=tuple(capture(raw).value,2);
   const properties=await this.#send(props(this.#entry));const fields=array(capture(properties).value,2);
   const fn=z.object({objectId:handle}).parse(fields.get("1"));
   const metadata=await this.#send(props(fn.objectId));qualifyCallback(capture(metadata).value,fields.get("1"),this.#input.variant,this.#input.scriptId);
  }else{
   need(this.#entry!==null);
   const role=kind==="schematic"||kind==="flat"?"branch":"step";
   const top=await this.#frame(role,id);const raw=await this.#send(call(kind==="returned"?"returned":role,top,[...refs,this.#entry]));truth.parse(capture(raw).value);
   if(kind==="returned"){
    const actual=z.object({objectId:handle}).parse(returnValue);
    const retained=await this.#send(call("retain",actual.objectId,[]));this.#cell=tuple(capture(retained).value,1);
    const properties=await this.#send(props(this.#cell));const fields=array(capture(properties).value,1);
    this.#promise=z.strictObject({type:z.literal("object"),subtype:z.literal("promise"),className:z.literal("Promise"),description:z.literal("Promise"),objectId:handle}).parse(fields.get("0")).objectId;
   }
  }
  if(kind==="returned"&&this.#ftEnabled){await this.#armFtReturn();}
  await this.#resumeOnce();this.#completed+=1;
 }
 async #resumeOnce(ft=false):Promise<void>{need(this.#resume===null);const original:Resume={ft,signal:Promise.withResolvers<null>(),event:false,ack:false};void settled(original.signal.promise);this.#resume=original;empty.parse(capture(await (ft?this.#ftSend({phase:"wire-title-ft-resume",method:"Debugger.resume",params:{}}):this.#send({phase:"wire-title-resume",method:"Debugger.resume",params:{}}))).value);original.ack=true;await original.signal.promise;this.#current();need(this.#resume===original&&original.event&&original.ack);this.#resume=null;if(ft){this.#ftResumes+=1;}else{this.#resumes+=1;}}
 public async compareQueryReturned(data:CurrentSchematicWireServiceInvocationData):Promise<void>{
  try{
   await this.#tail;this.#current();
   need(this.#before!==null&&data.stage==="queryReturned"&&this.#completed===LIMIT.pauseCount&&this.#entry!==null&&this.#cell!==null&&this.#promise!==null);
   const original=queryReceipt(data,this.#before.root);need(original.query===this.#query&&original.snapshot===this.#snapshot&&original.queryResult!==null);
   const properties=await this.#send(props(this.#promise));need(fulfilled(capture(properties).value));
   const raw=await this.#send(call("join",this.#input.holder,[...this.#refs(),this.#entry,original.queryResult,this.#cell,this.#promise]));truth.parse(capture(raw).value);
   if(this.#ftEnabled){
    need(this.#ftCompleted===1&&this.#ftPauses===1&&this.#ftResumes===1&&this.#ftResumeEvents===1&&this.#ftFrame!==null&&this.#ftCell!==null&&this.#ftPromise!==null);
    const promise=await this.#ftProperties(this.#ftPromise);need(fulfilled(capture(promise).value));
    const join=ftCall("join",this.#input.holder,[...this.#refs(),this.#entry,this.#ftFrame,this.#ftCell,this.#ftPromise]);const joined=await this.#ftSend(join);truth.parse(capture(joined).value);
    await this.#readFtConditions();await this.#currentFtArray();
    await this.#removeFt();need(this.#ftNormal<=FT_LIMIT.normal&&this.#ftCleanup===FT_LIMIT.cleanup&&this.#ftSources<=FT_LIMIT.sources&&this.#ftConditions.length > 0&&this.#ftConditionReads===this.#ftConditions.length&&this.#ftRemoved);
    this.#ftPacket=Object.freeze({schema:"private.schematic-wire-title-ft-return.v1",originalScopeArrayAndNativePredicateCompared:true,fixedPredicateSourcesCompared:true,originalTitleRequestAndCallbackCompared:true,originalFtNormalReturnPromiseRetainedBeforeResume:true,sameOriginalPromiseFulfilledUndefinedAfterResume:true,originalQueryReturnJoined:true,originalBreakpointRemoved:true,normalRequests:this.#ftNormal,cleanupRequests:this.#ftCleanup,suppliedTransportOnly:true,originalNativeOwnerJoined:false,nativeGlobalsQualified:false,titleHelperRuntimeQualified:false,annotationReturnJoined:false,saveAuthorized:false});
   }
   queryReceipt(data,this.#before.root);this.#done.resolve(null);
  }catch(error){this.#fail(error);throw error;}
 }
 #remove():Promise<void>{if(this.#removeTask!==null){return this.#removeTask;}const task=(async():Promise<void>=>{let failure:Readonly<{cause:unknown}>|null=null;for(const point of this.#points){need(!point.attempted);point.attempted=true;try{empty.parse(capture(await this.#send({phase:"wire-title-remove",method:"Debugger.removeBreakpoint",params:{breakpointId:point.id}},true)).value);point.removed=true;}catch(error){failure??=Object.freeze({cause:error});}}if(failure!==null){throw failure.cause;}})();this.#removeTask=task;return task;}
 public run():Promise<CurrentSchematicWireTitleData>{if(this.#runTask!==null){return this.#runTask;}this.#current();const task=(async():Promise<CurrentSchematicWireTitleData>=>{try{await this.arm();await this.#done.promise;await this.#tail;this.#current();need(this.#completed===5&&this.#pauses===5&&this.#resumes===5&&this.#resumeEvents===5&&this.#sources===8);await this.#remove();this.#current();need(this.#points.length===5&&this.#points.every(point=>point.removed));const data:CurrentSchematicWireTitleData=Object.freeze({schema:"private.schematic-wire-title-callback.v1",originalTreeProjectAndTitleQueryCompared:true,allTwelveOriginalHelperSourcesAndBindingsCompared:true,allFiveOriginalCallbackPausesAndResumesCompared:true,originalFlatEmptySymbolBranchCompared:true,originalCallbackFunctionAndFtCallerCompared:true,originalCallbackNormalReturnCellComparedAfterResume:true,callbackPromiseFulfilledUndefinedCompared:true,originalQueryAndTitleResultCompared:true,allAllocatedBreakpointsRemoved:true,sharedServiceGroupRetained:true,normalRequests:this.#prepared+this.#normal,cleanupRequests:this.#cleanup,suppliedTransportOnly:true,originalNativeOwnerJoined:false,nativeGlobalsQualified:false,ftNormalReturnJoined:false,titleHelperRuntimeQualified:false,selectedTreeChildJoined:false,serviceDeliveryJoined:false,saveAuthorized:false});this.#packet=data;return data;}catch(error){this.#fail(error);await this.#tail;try{await this.#removeFt();await this.#remove();}catch(cleanupError){this.#notificationFailure??=Object.freeze({cause:cleanupError});}need(this.#failure!==null);throw this.#failure.cause;}finally{this.#settled=true;}})();this.#runTask=task;return task;}
 public requireLiveComparison(data:CurrentSchematicWireTitleData):void{this.#current();need(this.#packet===data&&!this.#finished);}
 public originalFtReturn(data:CurrentSchematicWireTitleData):CurrentSchematicWireTitleFtReturnData{this.requireLiveComparison(data);need(this.#ftEnabled&&this.#ftPacket!==null);return this.#ftPacket;}
 public finish():Promise<void>{if(this.#finishTask!==null){return this.#finishTask;}this.#current();const task=(async():Promise<void>=>{await this.run();this.#current();this.#finished=true;})();this.#finishTask=task;return task;}
 public retireAfterOriginalExit():Promise<void>{if(this.#retireTask!==null){return this.#retireTask;}this.#current(true);this.#transport.assertOriginalExit();this.#closing=true;if(!this.#settled||this.#packet===null){this.#fail(new Error("WIRE_TITLE_ORIGINAL_EXIT"));}const task=(async():Promise<void>=>{await settled(this.#prepareTask);await settled(this.#ftPrepareTask);await settled(this.#armTask);await this.#tail;await settled(this.#runTask);await settled(this.#finishTask);await settled(this.#removeTask);await settled(this.#ftRemoveTask);await this.#functions;for(const attempt of this.#attempts){await settled(attempt.pending??null);}this.#transport.assertOriginalExit();})();this.#retireTask=task;return task;}
 public retained():Readonly<{attempts:readonly Readonly<Attempt>[];events:readonly unknown[];firstFailure:Readonly<{cause:unknown}>|null;notificationFailure:Readonly<{cause:unknown}>|null;allocationUncertain:boolean}>{this.#current(true);return Object.freeze({attempts:Object.freeze(this.#attempts.map(attempt=>Object.freeze({...attempt}))),events:Object.freeze([...this.#events]),firstFailure:this.#failure,notificationFailure:this.#notificationFailure,allocationUncertain:this.#uncertain});}
}
Object.freeze(CurrentSchematicWireTitleDriver.prototype);Object.freeze(CurrentSchematicWireTitleDriver);
