/** Original classic RPC receiver, resolver, timeout and race-Promise readers.
 * Native event/service/Job custody remains with the eventual complete owner. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply as capture } from "./current-pcb-string-clock-reply.ts";
import { decodeCurrentFootprintCopyClockRpcV2Array as array, decodeCurrentFootprintCopyClockRpcV2ArrayCapture as tuple } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import { currentSchematicRelevanceRawHandle as object } from "./current-schematic-relevance-action-raw-replies.ts";
import { CurrentSchematicWireClassicRpcCensus as Census, wireClassicRpcFieldValue as value } from "./current-schematic-wire-classic-rpc-census.ts";
import { CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_CALLS as CALLS, CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_FLAGS as FLAGS,
  CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_REQUESTS as LIMIT, validateCurrentSchematicWireClassicRpcCommand as validate } from "./current-schematic-wire-classic-rpc-protocol.ts";
import type { CurrentSchematicWireClassicRpcCommand as Command } from "./current-schematic-wire-classic-rpc-protocol.ts";
import { CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_FRAMES as FRAMES } from "./current-schematic-wire-classic-rpc-programs.ts";
import { decodeCurrentSchematicWireClassicRpcFunction as qualify } from "./current-schematic-wire-classic-rpc-source.ts";
import type { CurrentSchematicWireClassicRpcSourceRole as SourceRole } from "./current-schematic-wire-classic-rpc-source.ts";
import { decodeCurrentSchematicWireClassicRpcPromise as promise } from "./current-schematic-wire-classic-rpc-promise.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const nativePromise = z.strictObject({type:z.literal("object"),subtype:z.literal("promise"),className:z.literal("Promise"),description:z.literal("Promise"),objectId:handle});
const heldPromise = z.strictObject({result:nativePromise});
const resultObject = z.strictObject({result:z.strictObject({type:z.literal("object"),className:z.literal("Object"),description:z.literal("Object"),objectId:handle})});
const truth = z.strictObject({result:z.strictObject({type:z.literal("boolean"),value:z.literal(true)})});
type Role = "closing" | "language" | "titles";
type Stage = "entry" | "request" | "timer" | "returned" | "reply" | "replyReturned" | "settled";
interface First { readonly frame:string;readonly holder:string;readonly native:string;readonly scriptId:string;readonly variant:0|1;readonly role:Role }
export interface CurrentSchematicWireClassicRpcData {
  readonly schema:"private.schematic-wire-classic-rpc-comparison.v1";readonly stage:Stage;readonly role:Role;
  readonly entry:string;readonly request:string|null;readonly timer:string|null;readonly returned:string|null;
  readonly originalReplyCallback:string|null;readonly retainedOuterRace:string|null;
  readonly sameResolverCompared:boolean;readonly sourceTimeoutRegistrationCompared:boolean;
  readonly innerReplyPromiseFulfilledCompared:boolean;readonly sameOuterRaceResultCompared:boolean;
  readonly suppliedObservationsOnly:true;readonly originalNativeEventJoined:false;readonly nativeGlobalsQualified:false;
  readonly originalServiceDeliveryJoined:false;readonly timeoutPromiseIdentityCaptured:false;readonly timeoutCleanupVerified:false;
  readonly originalJobExitJoined:false;readonly rpcCompleted:false;readonly saveAuthorized:false;
}
export type CurrentSchematicWireClassicRpcInput =
  First & Readonly<{stage:"entry"}> |
  Readonly<{stage:"request"|"replyReturned";frame:string;previous:CurrentSchematicWireClassicRpcData}> |
  Readonly<{stage:"timer";frame:string;callerFrame:string;previous:CurrentSchematicWireClassicRpcData}> |
  Readonly<{stage:"returned";frame:string;outerPromise:string;previous:CurrentSchematicWireClassicRpcData}> |
  Readonly<{stage:"reply";frame:string;callerFrame:string;previous:CurrentSchematicWireClassicRpcData}> |
  Readonly<{stage:"settled";previous:CurrentSchematicWireClassicRpcData}>;
interface Stored { readonly first:First;readonly entry:string;readonly request:string|null;readonly timer:string|null;readonly returned:string|null;
 readonly callback:string|null;readonly outer:string|null;readonly inner:string|null;readonly reply:string|null;readonly innerResult:string|null }
const issued = new WeakMap<CurrentSchematicWireClassicRpcData,Stored>();
const spent = new WeakSet<CurrentSchematicWireClassicRpcData>();
/** Selectors receive only exact local returned packets, never copied claims.
 * Matching their data still authenticates no native event or transport. */
export function currentSchematicWireClassicRpcReplyBindings(values:readonly (CurrentSchematicWireClassicRpcData|null)[]):Readonly<{
 first:First;requests:readonly string[];
}>{
 need(values.length===3);let first:First|null=null;const found:(string|null)[]=[];
 for(const[index,item]of values.entries()){
  if(item===null){found.push(null);}else{
   const original=issued.get(item);need(original!==undefined&&!spent.has(item)&&item.stage==="returned"&&original.request!==null&&item.role===(["closing","language","titles"]as const)[index]);
   if(first===null){first=original.first;}else{need(first.holder===original.first.holder&&first.native===original.first.native&&first.scriptId===original.first.scriptId&&first.variant===original.first.variant);}
   found.push(original.request);
  }
 }
 need(first!==null);const base=first;return Object.freeze({first:base,requests:Object.freeze(found.map(item=>item??base.holder))});
}
function need(condition:boolean):asserts condition { if(!condition){throw new Error("SCHEMATIC_WIRE_CLASSIC_RPC_CURSOR");} }
function props(objectId:string):Command { return validate({phase:"classic-rpc-properties",kind:"fields",method:"Runtime.getProperties",
 params:{objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}}); }
function call(role:keyof typeof CALLS,receiver:string,refs:readonly string[]):Command {
 const row=CALLS[role];need(refs.length===row.refs);return validate({phase:"classic-rpc-call",role,method:"Runtime.callFunctionOn",
  params:{...FLAGS,objectId:receiver,functionDeclaration:row.program,arguments:refs.map(objectId=>({objectId})),returnByValue:row.byValue,awaitPromise:false,userGesture:false}});
}
function frame(first:First,role:keyof typeof FRAMES[0],callFrameId:string):Command {
 return validate({phase:"classic-rpc-frame",role,variant:first.variant,method:"Debugger.evaluateOnCallFrame",
  params:{...FLAGS,callFrameId,expression:FRAMES[first.variant][role],returnByValue:false,includeCommandLineAPI:false}});
}
function* approved(census:Census,first:First):Generator<Command,string,unknown>{
 const refs=[...census.approved];while(refs.length<64){refs.push(first.native);}
 return tuple(yield call("approved",first.holder,[first.native,...refs]),64);
}
function returnedObject(raw:unknown,kind:"object"|"array"="object"):string {
 const packet=z.strictObject({result:z.object({type:z.literal("object"),subtype:z.string().optional(),objectId:handle})}).parse(raw);
 need(packet.result.subtype===(kind==="array"?"array":undefined));return packet.result.objectId;
}
export class CurrentSchematicWireClassicRpcCursor {
 readonly #plan:Generator<Command,CurrentSchematicWireClassicRpcData,unknown>;readonly #maximum:number;
 #pending:Command|null=null;#reserved=false;#failed=false;#reads=0;#result:CurrentSchematicWireClassicRpcData|null=null;readonly #packets:unknown[]=[];
 public constructor(input:CurrentSchematicWireClassicRpcInput) {
  let first:First;let prior:Stored|null=null;
  if(input.stage==="entry"){
   first=Object.freeze({...input});for(const id of[first.frame,first.holder,first.native,first.scriptId]){handle.parse(id);}
   need((first.variant===0||first.variant===1)&&!Object.is(first.variant,-0));z.enum(["closing","language","titles"]).parse(first.role);
  }else{
   const original=issued.get(input.previous);need(original!==undefined&&!spent.has(input.previous));spent.add(input.previous);
   first=original.first;prior=original;
   const previous=({request:"entry",timer:"request",returned:"timer",reply:"returned",replyReturned:"reply",settled:"replyReturned"}as const)[input.stage];
   need(input.previous.stage===previous);if(input.stage!=="settled"){handle.parse(input.frame);}
   if(input.stage==="returned"){handle.parse(input.outerPromise);}if(input.stage==="reply"||input.stage==="timer"){handle.parse(input.callerFrame);}
  }
  this.#maximum=LIMIT[input.stage];this.#plan=CurrentSchematicWireClassicRpcCursor.collect(input,first,prior);Object.freeze(this);
 }
 private static *collect(input:CurrentSchematicWireClassicRpcInput,first:First,old:Stored|null):Generator<Command,CurrentSchematicWireClassicRpcData,unknown>{
  const {native,holder,scriptId,variant}=first;
  let entry=old?.entry??"";let request=old?.request??null;let timer=old?.timer??null;let returned=old?.returned??null;
  let callback=old?.callback??null;let outer=old?.outer??null;let inner=old?.inner??null;let reply=old?.reply??null;let innerResult=old?.innerResult??null;
  if(input.stage==="entry"){
   const census=new Census(64);const captured=tuple(yield frame(first,"entry",input.frame),14);const cells=yield* census.array(captured,14);
   const h=yield* census.array(holder,2);const b=yield* census.field(h,"0");const state=yield* census.field(h,"1");yield* census.field(state,"before");
   for(const key of["page","host","line","group"]){yield* census.field(b,key,"large");}yield* census.field(b,"metadata");
   const table=yield* approved(census,first);const bus=returnedObject(yield call("rootBus",holder,[native,holder,table]));const busFields=yield* census.read(bus);
   const uuid=value(busFields,"uuid");need(uuid.type==="string"&&typeof uuid.value==="string"&&/^[a-f\d]{32}$/u.test(uuid.value));
   const checked=yield* approved(census,first);const parts=tuple(yield call("parts",holder,[native,holder,checked]),4);const partsFields=yield* census.array(parts,4);
   const prototype=yield* census.field(partsFields,"0");for(const index of["1","2","3"]){yield* census.field(partsFields,index,"large");}
   const arg=value(cells,"2");
   if(first.role==="language"){yield* census.array(object(arg,"object"),1);}
   else if(first.role==="titles"){
    const args=yield* census.read(object(arg,"object"));need(args.size===1);
    for(const row of args.values()){need(row.value!==undefined&&row.get===undefined&&row.set===undefined);yield* census.array(object(row.value,"object"),0);}
   }
   const methodRoles=[["rpcCall","MessageBus_rpcCall"],["uniqueRpcTopic","MessageBus_uniqueRpcTopic"],["publish","MessageBus_publish"],["pull","MessageBus_pull"],["push","MessageBus_push"]]as const;
   for(const[name,role]of methodRoles){const actual=value(prototype,name);qualify(yield props(object(actual,"function")),actual,variant,role,scriptId);}
   const helpers:readonly SourceRole[]=["helperClone","helperRef","helperDeref","helperListGet","helperListEnsure","helperListRemove"];
   for(const[index,role]of helpers.entries()){const actual=value(cells,String(index+8));qualify(yield props(object(actual,"function")),actual,variant,role,scriptId);}
   const all=yield* approved(census,first);const role=({closing:"entryClosing",language:"entryLanguage",titles:"entryTitles"}as const)[first.role];
   entry=tuple(yield call(role,captured,[native,holder,all,parts]),31);array(yield props(entry),31);
  }else{
   need(old!==null);
   switch(input.stage){
    case "request": {
     const captured=tuple(yield frame(first,"request",input.frame),5);array(yield props(captured),5);
     request=tuple(yield call("request",captured,[native,holder,entry]),3);array(yield props(request),3);break;
    }
    case "timer": {
     need(request!==null);
     const captured=tuple(yield frame(first,"timer",input.frame),3);array(yield props(captured),3);
     const caller=tuple(yield frame(first,"timerCaller",input.callerFrame),14);const cells=array(yield props(caller),14);inner=object(cells.get("4"),"object");
     need(promise(yield props(inner)).state==="pending");
     timer=tuple(yield call("timer",captured,[native,holder,request,caller]),4);array(yield props(timer),4);break;
    }
    case "returned": {
     need(request!==null&&timer!==null&&inner!==null);
     const captured=tuple(yield frame(first,"returned",input.frame),13);array(yield props(captured),13);
     outer=heldPromise.parse(yield call("retain",input.outerPromise,[])).result.objectId;
     need(promise(yield props(outer)).state==="pending");
     const queue=returnedObject(yield call("task",holder,[native,holder,request]),"array");const rows=array(yield props(queue),1);const task=object(rows.get("0"),"object");
     const census=new Census(64);const taskFields=yield* census.read(task);const actual=value(taskFields,"callback");callback=object(actual,"function");qualify(yield props(callback),actual,variant,"MessageBus_rpcCall_child1",scriptId);
     returned=tuple(yield call("returned",captured,[native,holder,request,timer,outer,inner,queue,task,callback]),7);array(yield props(returned),7);break;
    }
    case "reply": {
     need(returned!==null);
     const captured=tuple(yield frame(first,"reply",input.frame),5);array(yield props(captured),5);
     const caller=tuple(yield frame(first,"replyCaller",input.callerFrame),6);array(yield props(caller),6);
     reply=tuple(yield call("reply",captured,[native,holder,returned,caller]),4);array(yield props(reply),4);break;
    }
    case "replyReturned": {
     need(reply!==null&&inner!==null);
     const captured=tuple(yield frame(first,"reply",input.frame),5);array(yield props(captured),5);
     const settled=promise(yield props(inner));need(settled.state==="fulfilled"&&settled.result!==null);innerResult=settled.result;
     const census=new Census(64);yield* census.read(innerResult);
     const compared=tuple(yield call("result",captured,[native,holder,reply,innerResult]),2);array(yield props(compared),2);break;
    }
    case "settled": {
     need(returned!==null&&outer!==null&&innerResult!==null);
     const actual=resultObject.parse(yield validate({phase:"classic-rpc-await",method:"Runtime.awaitPromise",params:{promiseObjectId:outer,returnByValue:false,generatePreview:false}})).result.objectId;
     truth.parse(yield call("settled",actual,[native,holder,returned,innerResult]));break;
    }
    default: { throw new Error("SCHEMATIC_WIRE_CLASSIC_RPC_STAGE"); }
   }
  }
  const data:CurrentSchematicWireClassicRpcData=Object.freeze({
   schema:"private.schematic-wire-classic-rpc-comparison.v1",stage:input.stage,role:first.role,entry,request,timer,returned,originalReplyCallback:callback,retainedOuterRace:outer,
   sameResolverCompared:reply!==null,sourceTimeoutRegistrationCompared:timer!==null,innerReplyPromiseFulfilledCompared:innerResult!==null,sameOuterRaceResultCompared:input.stage==="settled",
   suppliedObservationsOnly:true,originalNativeEventJoined:false,nativeGlobalsQualified:false,originalServiceDeliveryJoined:false,timeoutPromiseIdentityCaptured:false,
   timeoutCleanupVerified:false,originalJobExitJoined:false,rpcCompleted:false,saveAuthorized:false,
  });
  if(input.stage!=="settled"){issued.set(data,Object.freeze({first,entry,request,timer,returned,callback,outer,inner,reply,innerResult}));}return data;
 }
 public next():Command|null {need(!this.#failed&&!this.#reserved);if(this.#pending!==null){return this.#pending;}if(this.#result!==null){return null;}try{const row=this.#plan.next();need(row.done!==true);this.#pending=row.value;return row.value;}catch(error){this.#failed=true;throw error;}}
 public reserve(command:Command):void {need(!this.#failed&&!this.#reserved&&command===this.#pending&&this.#reads<this.#maximum);this.#reserved=true;this.#reads+=1;}
 public accept(command:Command,raw:unknown):void {need(!this.#failed&&this.#reserved&&command===this.#pending);try{this.#packets.push(raw);const row=this.#plan.next(command.phase==="classic-rpc-properties"&&command.kind==="large"?raw:capture(raw).value);this.#pending=null;this.#reserved=false;if(row.done===true){this.#result=row.value;}else{this.#pending=row.value;}}catch(error){this.#failed=true;throw error;}}
 public requireCompleted():CurrentSchematicWireClassicRpcData {need(!this.#failed&&!this.#reserved&&this.#pending===null&&this.#result!==null);return this.#result;}
 public retainedReplies():readonly unknown[] {need(this.#failed||this.#result!==null);return Object.freeze([...this.#packets]);}
 public fail():void {this.#failed=true;}
}
Object.freeze(CurrentSchematicWireClassicRpcCursor.prototype);Object.freeze(CurrentSchematicWireClassicRpcCursor);
