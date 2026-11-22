/** Original natural read custody. It retains only the host installed by the
 * same native DELETE Main controller; data and equal handles cannot enroll it. */
import {z} from "zod";
import {canonicalJson} from "./core.ts";
import {captureCurrentPcbStringClockReply} from "./current-pcb-string-clock-reply.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_READ_FUNCTIONS as FUNCTIONS,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_READ_KINDS as KINDS,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_READS as READS,validateCurrentFootprintInverseNativeDeleteMainReadCommand as validate} from "./current-footprint-inverse-native-delete-main-read-protocol.ts";
import type {CurrentFootprintInverseNativeDeleteMainReadCommand as Command,CurrentFootprintInverseNativeDeleteMainReadKind as Kind} from "./current-footprint-inverse-native-delete-main-read-protocol.ts";
import {currentFootprintInverseMainHistoryValueSchema} from "./current-footprint-inverse-main-history-baseline.ts";
import {decodeCurrentGeneratedSyncCallee} from "./current-generated-initial-sync-replies.ts";
import type {CurrentFootprintInverseNativeDeleteMainRequestOrigin} from "./current-footprint-inverse-native-delete-main-origin.ts";
import type {CurrentFootprintInverseNativeDeleteMainBeginPause as Pause} from "./current-footprint-inverse-native-delete-main-begin-custody.ts";
import type {CurrentSelectedFileMainRequestObservation as Request} from "./current-selected-file-main-request-reader.ts";

const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u),project=z.string().regex(/^[a-f0-9]{64}$/u),uuid=z.string().regex(/^[a-f0-9]{32}$/u);
const branchSchema=z.strictObject({projectUuid:project,branchUuid:uuid,body:z.string().min(1).max(4096)});
const bodySchema=z.strictObject({projectUuid:project,historyUuid:uuid,cipherHexParts:z.array(z.string().min(1).max(8192).regex(/^(?:[a-f0-9]{2})+$/u)).min(1).max(8)});
export type CurrentFootprintInverseNativeDeleteMainReadValue=Readonly<z.infer<typeof branchSchema>>|Readonly<z.infer<typeof currentFootprintInverseMainHistoryValueSchema>>|Readonly<z.infer<typeof bodySchema>>;
export interface CurrentFootprintInverseNativeDeleteMainReadExpectation{
 readonly projectUuid:string;readonly branchUuid:string;readonly historyUuid:string;
 readonly compare:(kind:Kind,value:CurrentFootprintInverseNativeDeleteMainReadValue)=>void;
}
export interface CurrentFootprintInverseNativeDeleteMainReadHost{
 readonly origin:CurrentFootprintInverseNativeDeleteMainRequestOrigin;
 readonly scriptId:string;readonly sqlCaptureObjectId:string;readonly persistentDriverBreakpointId:string;readonly assertCurrent:()=>void;
 readonly expected:()=>CurrentFootprintInverseNativeDeleteMainReadExpectation;
 readonly pause:()=>Pause;readonly pendingRequestId:()=>number|null;readonly busy:()=>boolean;
 readonly send:(command:Command,cleanup:boolean)=>Promise<unknown>;
 readonly resume:(identity:object,command:Command)=>Promise<unknown>;readonly fail:(cause:unknown)=>void;
 readonly registerPoint:(id:string,location:Readonly<{scriptId:string;lineNumber:number;columnNumber:number}>)=>void;
 readonly removePoint:(id:string)=>void;readonly pointCurrent:(id:string)=>boolean;
}
const location=z.strictObject({scriptId:handle,lineNumber:z.number().int(),columnNumber:z.number().int()});
const frame=z.looseObject({callFrameId:handle,functionName:z.string(),location,functionLocation:location.optional()});
const pause=z.looseObject({reason:z.literal("other"),hitBreakpoints:z.tuple([handle]),callFrames:z.array(frame).min(1).max(64)});
const remote=z.looseObject({type:z.string(),subtype:z.string().optional(),objectId:handle.optional(),value:z.unknown().optional()});
const member=z.looseObject({name:z.string(),value:remote.optional()});
const properties=z.looseObject({result:z.array(member).max(64),internalProperties:z.array(member).max(8).optional()});
const array=z.strictObject({result:z.looseObject({type:z.literal("object"),subtype:z.literal("array"),objectId:handle})});
const byValue=z.strictObject({result:z.strictObject({type:z.literal("object"),value:z.unknown()})});
function need(value:boolean,code:string):asserts value{if(!value){throw new Error(`INVERSE_NATIVE_DELETE_MAIN_READ_${code}`);}}
const normalOrder=["arm","frame","join-capture","properties-packet","properties-promise","join-resolved","join-value","remove","step","release"]as const;
/** The three reads share the original Main object's CDP group. Keep their
 * identity and order in one ledger per original Main request origin. */
const originReads = new WeakMap<CurrentFootprintInverseNativeDeleteMainRequestOrigin, Map<Kind, CurrentFootprintInverseNativeDeleteMainReadCustody>>();
export class CurrentFootprintInverseNativeDeleteMainReadCustody{
 readonly #kind:Kind;readonly #host:CurrentFootprintInverseNativeDeleteMainReadHost;readonly #order:readonly string[];
 readonly #functions=new Map<string,string>();
 readonly #previous:CurrentFootprintInverseNativeDeleteMainReadCustody|null;
 #stage=0;#driverAttempted=false;#failed=false;#failureHandedOff=false;#point:string|null=null;#frame:string|null=null;#capture:string|null=null;#requestCapture:string|null=null;#promise:string|null=null;#resolved:string|null=null;
 #expected:CurrentFootprintInverseNativeDeleteMainReadExpectation|null=null;#value:CurrentFootprintInverseNativeDeleteMainReadValue|null=null;
 #active:Readonly<{command:Command;consumed:boolean}>|null=null;
 public constructor(kind:Kind,host:CurrentFootprintInverseNativeDeleteMainReadHost){
  this.#kind=kind;this.#host=Object.freeze({...host});this.#order=kind==="history"?[...normalOrder.slice(0,6),"properties-projectSql","properties-table","properties-branches",...normalOrder.slice(6)]:normalOrder;
  this.#host.assertCurrent();
  const reads=originReads.get(this.#host.origin)??new Map<Kind,CurrentFootprintInverseNativeDeleteMainReadCustody>();
  const previousKind=KINDS[KINDS.indexOf(kind)-1];
  const previous=previousKind===undefined?null:reads.get(previousKind);
  need(!reads.has(kind)&&previous!==undefined,"ORIGINAL_READ_ORDER");
  this.#previous=previous;
  reads.set(kind,this);
  originReads.set(this.#host.origin,reads);
  Object.freeze(this);
 }
 public failOriginalObservation(cause:unknown):void{this.#failed=true;if(!this.#failureHandedOff){this.#failureHandedOff=true;try{this.#host.fail(cause);}catch{
 // A failed handoff cannot restore an observation or authorize a resume.
 }}}
 #same():void{need(!this.#failed,"FAILED");this.#host.assertCurrent();if(this.#expected!==null){need(this.#host.expected()===this.#expected,"ORIGINAL_EXPECTATION");}}
 public wantsReadonlyRequest(packet:Request):boolean{
  if(this.#stage!==1){return false;}this.#same();const e=this.#host.expected();if(packet.mode!=="fetch"||packet.method!=="GET"){return false;}
  if(this.#kind==="body"){return(packet.pathHeader===null||packet.pathHeader===e.projectUuid)&&packet.pureUrl==="/api/v4/histories/dataStr"&&packet.pureQuery===`path=${e.projectUuid}&uuid=${e.historyUuid}`;}
  const path=`/api/v4/projects/${e.projectUuid}/branches/${e.branchUuid}${this.#kind==="history"?`/histories/${e.historyUuid}`:""}`;
  return packet.pathHeader===e.projectUuid&&packet.pureQuery===""&&packet.pureUrl===path;
 }
 public retainReadonlyRequest(packet:Request,capture:string):void{need(this.wantsReadonlyRequest(packet)&&this.#requestCapture===null,"ONE_ORIGINAL_REQUEST");this.#expected=this.#host.expected();this.#requestCapture=handle.parse(capture);}
 public originalRequestObjectId():string{this.#same();need(this.#requestCapture!==null,"ORIGINAL_REQUEST_REQUIRED");return this.#requestCapture;}
 #held():Pause{
  const held=this.#host.pause();const event=pause.parse(captureCurrentPcbStringClockReply(held.raw).value),first=event.callFrames[0],site=READS[this.#kind].site;
  need(first!==undefined&&held.frameId===first.callFrameId&&held.sqlSite===null&&held.pendingEvents===0&&!held.resumed&&!held.resumeAttempted&&
   first.functionName===site.name&&first.functionLocation?.scriptId===this.#host.scriptId&&first.functionLocation.lineNumber===site.lineNumber&&first.functionLocation.columnNumber===site.functionColumn&&
   first.location.scriptId===this.#host.scriptId&&first.location.lineNumber===site.lineNumber&&first.location.columnNumber===site.columnNumber&&event.hitBreakpoints[0]===this.#point,"ORIGINAL_RETURN");return held;
 }
 #driverHeld():Pause{
  const held=this.#host.pause();const driverEvent=pause.parse(captureCurrentPcbStringClockReply(held.raw).value);
  need(held.sqlSite==="driver"&&held.pendingEvents===0&&!held.resumed&&!held.resumeAttempted&&driverEvent.hitBreakpoints[0]===this.#host.persistentDriverBreakpointId&&driverEvent.callFrames[0]?.callFrameId===held.frameId,"ORIGINAL_DRIVER");
  return held;
 }
 #expect(command:Command):void{
  if(command.phase==="inverse-native-delete-main-read-driver-step"){
   need(command.kind===this.#kind&&this.#stage===1&&this.#requestCapture!==null&&!this.#driverAttempted,"ONCE_DRIVER");
   // Early successor arm is allowed.
   // Keep its driver held until the predecessor's group release is acknowledged.
   this.#previous?.result();
   this.#driverHeld();return;
  }
  const suffix=command.phase.replace("inverse-native-delete-main-read-","");const step=suffix+("role"in command?"-"+command.role:"");
  need(command.kind===this.#kind&&step===this.#order[this.#stage],"ONCE_ORDER");
  if(this.#stage===0){need(command.phase==="inverse-native-delete-main-read-arm"&&command.params.location.scriptId===this.#host.scriptId,"ORIGINAL_SCRIPT");return;}
  if(this.#stage<this.#order.indexOf("release")){need(this.#driverAttempted,"ORIGINAL_DRIVER_RESUMED");this.#held();if(this.#stage<this.#order.indexOf("remove")){need(this.#point!==null&&this.#host.pointCurrent(this.#point),"CURRENT_POINT");}}
  if(command.phase==="inverse-native-delete-main-read-frame"){need(command.params.callFrameId===this.#held().frameId,"ORIGINAL_FRAME");}
  else if(command.phase==="inverse-native-delete-main-read-join"){
   if(command.role==="capture"){need(command.params.objectId===this.#frame&&command.params.arguments[0]?.objectId===this.#host.sqlCaptureObjectId&&command.params.arguments[1]?.objectId===this.originalRequestObjectId(),"ORIGINAL_CAPTURE_ARGUMENTS");}
   else{need(command.params.objectId===this.#capture&&(command.role!=="resolved"||command.params.arguments[0]?.objectId===this.#resolved),"ORIGINAL_JOIN");}
  }else if(command.phase==="inverse-native-delete-main-read-properties"){
   let expected=this.#functions.get(command.role);if(command.role==="packet"){expected=this.#capture??undefined;}else if(command.role==="promise"){expected=this.#promise??undefined;}
   need(command.params.objectId===expected,"ORIGINAL_MEMBER");
  }else if(command.phase==="inverse-native-delete-main-read-remove"){need(command.params.breakpointId===this.#point,"ORIGINAL_REMOVE");}
 }
 public consume(command:Command,id:number):void{
  this.#same();const active=this.#active;need(active!==null&&!active.consumed&&canonicalJson(active.command)===canonicalJson(command)&&this.#host.pendingRequestId()===id&&this.#host.busy(),"ORIGINAL_PENDING_COMMAND");this.#active={command:active.command,consumed:true};
 }
 public async request(input:Command,cleanup:boolean):Promise<unknown>{
  this.#same();const command=validate(input);need(this.#active===null&&cleanup===(command.phase==="inverse-native-delete-main-read-remove"||command.phase==="inverse-native-delete-main-read-release"),"REQUEST_CLASS");
  try{
   this.#expect(command);this.#active={command,consumed:false};
   const stepping=command.phase==="inverse-native-delete-main-read-step"||command.phase==="inverse-native-delete-main-read-driver-step";
   let resumeIdentity:object|null=null;
   if(stepping){resumeIdentity=command.phase==="inverse-native-delete-main-read-driver-step"?this.#driverHeld().identity:this.#held().identity;}
   if(command.phase==="inverse-native-delete-main-read-driver-step"){this.#driverAttempted=true;}
   const raw=await(resumeIdentity===null?this.#host.send(command,cleanup):this.#host.resume(resumeIdentity,command));
   const reply=captureCurrentPcbStringClockReply(raw).value;need(this.#active.consumed,"NATIVE_ACK");this.#same();
   if(command.phase==="inverse-native-delete-main-read-arm"){
    const result=z.strictObject({breakpointId:handle,actualLocation:z.unknown()}).parse(reply);
    this.#point=result.breakpointId;
    const actualLocation=location.parse(result.actualLocation);
    this.#host.registerPoint(this.#point,actualLocation);
    need(canonicalJson(actualLocation)===canonicalJson(command.params.location),"EXACT_POINT");
   }
   else if(command.phase==="inverse-native-delete-main-read-frame"){this.#frame=array.parse(reply).result.objectId;}
   else if(command.phase==="inverse-native-delete-main-read-join"){
    if(command.role==="capture"){this.#capture=array.parse(reply).result.objectId;}
    else if(command.role==="resolved"){z.strictObject({result:z.strictObject({type:z.literal("boolean"),value:z.literal(true)})}).parse(reply);}
    else{
     const rawValue=byValue.parse(reply).result.value;let value:CurrentFootprintInverseNativeDeleteMainReadValue;
     if(this.#kind==="branch"){value=branchSchema.parse(rawValue);}else if(this.#kind==="history"){value=currentFootprintInverseMainHistoryValueSchema.parse(rawValue);}else{value=bodySchema.parse(rawValue);}
     const e=this.#expected;need(e!==null&&value.projectUuid===e.projectUuid,"RETURN_PROJECT");if("branchUuid"in value){need(value.branchUuid===e.branchUuid,"RETURN_BRANCH");}if("historyUuid"in value){need(value.historyUuid===e.historyUuid,"RETURN_HISTORY");}
     e.compare(this.#kind,value);this.#value=freezeDeep(value);
    }
   }else if(command.phase==="inverse-native-delete-main-read-properties"){
    const definition=READS[this.#kind],parsed=properties.parse(reply);
    if(command.role==="packet"){
     need(parsed.result.length===definition.packetLength+1&&parsed.result.filter(v=>v.name==="length").length===1&&parsed.result.find(v=>v.name==="length")?.value?.value===definition.packetLength,"PACKET_LENGTH");
     const promise=parsed.result.find(v=>v.name===String(definition.promiseIndex))?.value;need(promise?.type==="object"&&promise.subtype==="promise"&&typeof promise.objectId==="string","DB_PROMISE");this.#promise=promise.objectId;
     this.#retainFunctions(parsed);
    }else if(command.role==="promise"){
     const entries=parsed.internalProperties;need(entries!==undefined&&entries.length===3&&entries.filter(v=>v.name==="[[Prototype]]").length===1,"DB_PROMISE_INTERNALS");
     const results=entries.filter(v=>v.name==="[[PromiseResult]]"),states=entries.filter(v=>v.name==="[[PromiseState]]");need(states.length===1&&states[0]?.value?.type==="string"&&states[0].value.value==="fulfilled"&&results.length===1,"DB_PROMISE_FULFILLED");
     const result=results[0]?.value;need(result?.type==="object"&&result.subtype===undefined&&typeof result.objectId==="string","DB_PROMISE_RESULT");this.#resolved=result.objectId;
    }else{need(command.kind==="history","FUNCTION_KIND");decodeCurrentGeneratedSyncCallee(reply,FUNCTIONS[command.role],this.#host.scriptId);}
   }else{z.strictObject({}).parse(reply);if(command.phase==="inverse-native-delete-main-read-remove"){need(this.#point!==null,"POINT_REQUIRED");this.#host.removePoint(this.#point);}}
   if(command.phase!=="inverse-native-delete-main-read-driver-step"){this.#stage+=1;}return reply;
  }catch(error){this.failOriginalObservation(error);throw error;}finally{this.#active=null;}
 }
 #retainFunctions(parsed:z.infer<typeof properties>):void{
  if(this.#kind!=="history"){return;}
  for(const[role,source]of Object.entries(FUNCTIONS)){const fn=parsed.result.find(v=>v.name===String(source.index))?.value;need(fn?.type==="function"&&typeof fn.objectId==="string","ORIGINAL_FUNCTION");this.#functions.set(role,fn.objectId);}
 }
 public result():CurrentFootprintInverseNativeDeleteMainReadValue{this.#same();need(this.#stage===this.#order.length&&this.#value!==null&&this.#active===null,"COMPLETED_READ");return this.#value;}
}
Object.freeze(CurrentFootprintInverseNativeDeleteMainReadCustody.prototype);
Object.freeze(CurrentFootprintInverseNativeDeleteMainReadCustody);
