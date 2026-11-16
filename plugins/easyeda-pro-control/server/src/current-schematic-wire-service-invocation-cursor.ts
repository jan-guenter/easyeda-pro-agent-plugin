/** Actual original service arguments, target returns, native Promise aliases
 * and publication/result identity. All observations remain transport supplied. */
/* oxlint-disable import/max-dependencies -- Bind the exact registration/request roots, source-held frames and native Promise comparisons in one bounded cursor. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply as capture } from "./current-pcb-string-clock-reply.ts";
import { decodeCurrentFootprintCopyClockRpcV2Array as array,decodeCurrentFootprintCopyClockRpcV2ArrayCapture as tuple } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import { currentSchematicRelevanceRawHandle as object,currentSchematicRelevanceRawProperties as rawProperties } from "./current-schematic-relevance-action-raw-replies.ts";
import { decodeCurrentSchematicWireClassicRpcPromise as promise } from "./current-schematic-wire-classic-rpc-promise.ts";
import { consumeCurrentSchematicWireServiceRequestReceipt as consumeRequest } from "./current-schematic-wire-service-request-receipt.ts";
import type { CurrentSchematicWireServiceRequestReceipt } from "./current-schematic-wire-service-request-receipt.ts";
import { requireCurrentSchematicWireServiceInvocationRoot as requireRoot } from "./current-schematic-wire-service-invocation-root.ts";
import type { CurrentSchematicWireServiceInvocationRoot } from "./current-schematic-wire-service-invocation-root.ts";
import { decodeCurrentSchematicWireServiceFunction as qualifyService } from "./current-schematic-wire-service-source.ts";
import { decodeCurrentSchematicWireClassicRpcFunction as qualifyClassic } from "./current-schematic-wire-classic-rpc-source.ts";
import { CURRENT_SCHEMATIC_WIRE_SERVICE_INVOCATION_CALLS as CALLS,CURRENT_SCHEMATIC_WIRE_SERVICE_INVOCATION_FLAGS as FLAGS,validateCurrentSchematicWireServiceInvocationCommand as validate } from "./current-schematic-wire-service-invocation-protocol.ts";
import type { CurrentSchematicWireServiceInvocationCommand as Command } from "./current-schematic-wire-service-invocation-protocol.ts";
import { CURRENT_SCHEMATIC_WIRE_SERVICE_INVOCATION_FRAMES as FRAMES } from "./current-schematic-wire-service-invocation-programs.ts";

import type {CurrentSchematicRelevanceRawRemote}from"./current-schematic-relevance-action-raw-replies.ts";

type Stage="entry"|"targetEntry"|"targetReturned"|"queryEntry"|"queryReturned"|"post"|"callbackReturned"|"publishedEntry"|"publishedReturned"|"replyEntry"|"replyReturned"|"settled";
type Role="closing"|"language"|"titles";
interface First{readonly root:CurrentSchematicWireServiceInvocationRoot;readonly request:CurrentSchematicWireServiceRequestReceipt}
export interface CurrentSchematicWireServiceInvocationData{
 readonly schema:"private.schematic-wire-service-invocation.v1";readonly role:Role;readonly stage:Stage;
 readonly originalCallbackReceiverCompared:boolean;readonly originalTargetReturnedCompared:boolean;
 readonly sameFreshServicePromiseCompared:boolean;readonly sameQueryResultCompared:boolean;readonly sameOriginalPublicationCompared:boolean;readonly sameOriginalReplyCompared:boolean;
 readonly suppliedObservationsOnly:true;readonly originalNativeOwnerJoined:false;readonly originalAsyncThenRegistrationJoined:false;
 readonly uiProjectAndLocaleRuntimeQualified:false;readonly titleHelperRuntimeQualified:false;
 readonly serviceDeliveryJoined:false;readonly saveAuthorized:false;
}
export type CurrentSchematicWireServiceInvocationInput=
 First&Readonly<{stage:"entry";frame:string;callerFrame:string}>|
 Readonly<{stage:Exclude<Stage,"entry"|"settled">;frame:string;returnValue?:unknown;previous:CurrentSchematicWireServiceInvocationData}>|
 Readonly<{stage:"settled";previous:CurrentSchematicWireServiceInvocationData}>;
interface Stored{readonly first:First;readonly parents:string;readonly snapshot:string;readonly target:string|null;readonly query:string|null;readonly post:string|null;readonly publication:string|null;readonly reply:string|null;
 readonly queryPromise:string|null;readonly targetPromise:string|null;readonly queryResult:string|null;readonly result:string|null;readonly language:string|null;readonly done:readonly Stage[]}
const issued=new WeakMap<CurrentSchematicWireServiceInvocationData,Stored>(),spent=new WeakSet<CurrentSchematicWireServiceInvocationData>();
/** Source observers share the exact original in-flight query; copies confer no authority. */
export function requireCurrentSchematicWireServiceTitleQuery(data:CurrentSchematicWireServiceInvocationData,root:CurrentSchematicWireServiceInvocationRoot):Readonly<Stored>{
 const original=issued.get(data);need(original!==undefined&&original.first.root===root&&data.role==="titles"&&(data.stage==="queryEntry"||data.stage==="queryReturned")&&!spent.has(data));requireRoot(root);return original;
}
/** One complete owner can consume the exact still-live settled tuple. This
 * reveals only retained observation handles and grants no application action. */
export function consumeCurrentSchematicWireServiceInvocationBindings(data:CurrentSchematicWireServiceInvocationData,root:CurrentSchematicWireServiceInvocationRoot):Readonly<Stored>{
 const original=issued.get(data);need(original!==undefined&&data.stage==="settled"&&original.first.root===root&&!spent.has(data));requireRoot(root);spent.add(data);return original;
}
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const nativePromise=z.strictObject({type:z.literal("object"),subtype:z.literal("promise"),className:z.literal("Promise"),description:z.literal("Promise"),objectId:handle});
const retainedPromise=z.strictObject({result:nativePromise});
const truth=z.strictObject({result:z.strictObject({type:z.literal("boolean"),value:z.literal(true)})});
const internal=z.strictObject({name:z.literal("[[Prototype]]"),value:z.unknown()});
const ordinary=z.strictObject({result:z.array(z.unknown()).max(256),internalProperties:z.array(internal).length(1)});
const MAXIMUM=Object.freeze({entry:11,targetEntry:5,targetReturned:7,queryEntry:10,queryReturned:6,post:5,callbackReturned:3,publishedEntry:9,publishedReturned:4,replyEntry:4,replyReturned:3,settled:5}as const);
const ORDER=Object.freeze({
 closing:Object.freeze(["entry","targetEntry","targetReturned","post","replyEntry","replyReturned","callbackReturned","settled"]as const),
 language:Object.freeze(["entry","targetEntry","targetReturned","post","replyEntry","replyReturned","callbackReturned","settled"]as const),
 titles:Object.freeze(["entry","targetEntry","queryEntry","post","callbackReturned","queryReturned","targetReturned","publishedEntry","replyEntry","replyReturned","publishedReturned","settled"]as const),
});
function need(condition:boolean):asserts condition{if(!condition){throw new Error("WIRE_SERVICE_INVOCATION_CURSOR");}}
function props(objectId:string):Command{return validate({phase:"wire-service-invocation-properties",method:"Runtime.getProperties",params:{objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}});}
function call(role:keyof typeof CALLS,receiver:string,refs:readonly string[],value?:string):Command{
 const row=CALLS[role];need(refs.length===row.refs&&(value===undefined?0:1)===row.values);
 const args:({objectId:string}|{value:string})[]=refs.map(objectId=>({objectId}));if(value!==undefined){args.push({value});}
 return validate({phase:"wire-service-invocation-call",role,method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:receiver,functionDeclaration:row.program,arguments:args,returnByValue:row.byValue,awaitPromise:false,userGesture:false}});
}
function frame(variant:0|1|2,role:string,expression:string,callFrameId:string):Command{return validate({phase:"wire-service-invocation-frame",variant,role,method:"Debugger.evaluateOnCallFrame",params:{...FLAGS,callFrameId,expression,returnByValue:false,includeCommandLineAPI:false}});}
export class CurrentSchematicWireServiceInvocationCursor{
 readonly #plan:Generator<Command,CurrentSchematicWireServiceInvocationData,unknown>;readonly #maximum:number;
 #pending:Command|null=null;#reserved=false;#failed=false;#reads=0;#result:CurrentSchematicWireServiceInvocationData|null=null;readonly #raw:unknown[]=[];
 public constructor(input:CurrentSchematicWireServiceInvocationInput){
  let old:Stored|null=null;let first:First;
  if(input.stage==="entry"){const root=requireRoot(input.root);consumeRequest(input.request,root.rpc);first=Object.freeze({root:input.root,request:input.request});handle.parse(input.frame);handle.parse(input.callerFrame);}
  else{const original=issued.get(input.previous);need(original!==undefined&&!spent.has(input.previous));spent.add(input.previous);old=original;first=original.first;need(!original.done.includes(input.stage));if(input.stage!=="settled"){handle.parse(input.frame);}}
  requireRoot(first.root);this.#maximum=MAXIMUM[input.stage];this.#plan=CurrentSchematicWireServiceInvocationCursor.collect(input,first,old);Object.freeze(this);
 }
 private static *collect(input:CurrentSchematicWireServiceInvocationInput,first:First,old:Stored|null):Generator<Command,CurrentSchematicWireServiceInvocationData,unknown>{
  const original=requireRoot(first.root);const context=original.input;const reg=first.root.registrations;const role=first.request.role;
  const {native,holder,variant}=context;
  let parents=old?.parents??"";let snapshot=old?.snapshot??"";let target=old?.target??null;let query=old?.query??null;let post=old?.post??null;let publication=old?.publication??null;let reply=old?.reply??null;
  let queryPromise=old?.queryPromise??null;let targetPromise=old?.targetPromise??null;let queryResult=old?.queryResult??null;let result=old?.result??null;let language=old?.language??null;
  const done=[...old?.done??[]];need(ORDER[role][done.length]===input.stage);
  if(input.stage==="entry"){
   parents=tuple(yield call("parents",holder,[native,holder,reg.root,first.request.entry,first.request.request,reg.senderMethodsA,reg.senderMethodsB]),5);array(yield props(parents),5);
   const captured=tuple(yield frame(2,"entry",FRAMES.ui.entry,input.frame),5),cells=array(yield props(captured),5);
   const caller=tuple(yield frame(2,"caller",FRAMES.ui.caller,input.callerFrame),6);array(yield props(caller),6);
   const payload=object(cells.get("1"),"object");const payloadFields=arrayLike(yield props(payload));const arg=payloadFields.get("message");
   if(role==="language"){array(yield props(object(arg,"object")),1);}else if(role==="titles"){const args=arrayLike(yield props(object(arg,"object")));need(args.size===1);for(const value of args.values()){array(yield props(object(value,"object")),0);}}
   const selected=({closing:"entryClosing",language:"entryLanguage",titles:"entryTitles"}as const)[role];
   snapshot=tuple(yield call(selected,captured,[native,holder,parents,reg.tasks,reg.callbacks,reg.handlers,reg.targets,caller]),8);array(yield props(snapshot),8);
  }else{
   need(old!==null&&snapshot!=="");
   switch(input.stage){
    case "targetEntry":{
     need(!done.includes("post"));const field=({closing:"closing",language:"language",titles:"target"}as const)[role],v=role==="titles"?variant:2;
     const expression=role==="titles"?FRAMES.sch[variant].target:FRAMES.ui[role==="closing"?"closing":"language"];
     const count=({closing:3,language:6,titles:2}as const)[role];const captured=tuple(yield frame(v,field,expression,input.frame),count),cells=array(yield props(captured),count);
     if(role==="closing"){const fn=cells.get("2");qualifyService(yield props(object(fn,"function")),fn,2,"registryLookup",context.uiScriptId);}
     else if(role==="titles"){const fn=cells.get("1");qualifyClassic(yield props(object(fn,"function")),fn,variant,"titleQuery",context.scriptId);}
     const selected=({closing:"targetClosing",language:"targetLanguage",titles:"targetTitles"}as const)[role];
     target=tuple(yield call(selected,captured,[native,holder,snapshot]),role==="titles"?2:3);array(yield props(target),role==="titles"?2:3);break;
    }
    case "queryEntry":{
     need(role==="titles"&&target!==null&&!done.includes("post"));
     const captured=tuple(yield frame(variant,"query",FRAMES.sch[variant].query,input.frame),9),cells=array(yield props(captured),9);
     for(let index=3;index<9;index+=1){const fn=cells.get(String(index));const helper=(["helper00","helper01","helper02","helper03","helper04","helper05"]as const)[index-3];need(helper!==undefined);qualifyService(yield props(object(fn,"function")),fn,variant,helper,context.scriptId);}
     query=tuple(yield call("query",captured,[native,holder,snapshot,target]),9);array(yield props(query),9);break;
    }
    case "targetReturned":{
     need(target!==null&&done.includes("targetEntry"));
     const count=({closing:3,language:6,titles:2}as const)[role];
     const expression=role==="titles"?FRAMES.sch[variant].target:FRAMES.ui[role==="closing"?"closing":"language"];
     const captured=tuple(yield frame(role==="titles"?variant:2,({closing:"closing",language:"language",titles:"target"}as const)[role],expression,input.frame),count);array(yield props(captured),count);
     if(role==="closing"){z.strictObject({type:z.literal("boolean"),value:z.literal(false)}).parse(input.returnValue);}
     else if(role==="language"){language=z.strictObject({type:z.literal("string"),value:z.string().max(8192)}).parse(input.returnValue).value;}
     else{need(post!==null);const actual=nativePromise.parse(input.returnValue);targetPromise=retainedPromise.parse(yield call("retain",actual.objectId,[])).result.objectId;promise(yield props(targetPromise));const postFields=array(yield props(post),3);const postValue=object(postFields.get("1"),"object");truth.parse(yield call("same",targetPromise,[postValue]));}
     const selected=({closing:"targetClosingReturned",language:"targetLanguageReturned",titles:"targetTitlesReturned"}as const)[role];truth.parse(yield call(selected,captured,[native,holder,snapshot,target]));break;
    }
    case "post":{
     need(target!==null&&(role==="titles"?query!==null:done.includes("targetReturned")));
     const captured=tuple(yield frame(2,"post",FRAMES.ui.post,input.frame),9);array(yield props(captured),9);
     const selected=({closing:"postClosing",language:"postLanguage",titles:"postTitles"}as const)[role];
     if(role==="language"){need(language!==null);post=tuple(yield call(selected,captured,[native,holder,snapshot],language),3);}
     else{post=tuple(yield call(selected,captured,[native,holder,snapshot]),3);}
     const cells=array(yield props(post),3);if(role==="titles"){const postValue=object(cells.get("1"),"object");const postPromise=promise(yield props(postValue));need(postPromise.state==="pending");}break;
    }
    case "callbackReturned":{
     need(post!==null);z.strictObject({type:z.literal("undefined")}).parse(input.returnValue);
     const captured=tuple(yield frame(2,"entry",FRAMES.ui.entry,input.frame),5);array(yield props(captured),5);truth.parse(yield call("callbackReturned",captured,[native,holder,snapshot]));break;
    }
    case "queryReturned":{
     need(role==="titles"&&query!==null&&post!==null);
     const captured=tuple(yield frame(variant,"queryReturned",FRAMES.sch[variant].queryReturned,input.frame),3),cells=array(yield props(captured),3);queryResult=object(cells.get("1"),"object");
     const actual=nativePromise.parse(input.returnValue);queryPromise=retainedPromise.parse(yield call("retain",actual.objectId,[])).result.objectId;promise(yield props(queryPromise));ordinary.parse(yield props(queryResult));
     truth.parse(yield call("queryReturned",captured,[native,holder,snapshot,query,queryResult]));break;
    }
    case "publishedEntry":{
     need(role==="titles"&&post!==null&&queryPromise!==null&&queryResult!==null&&targetPromise!==null);
     const captured=tuple(yield frame(2,"published",FRAMES.ui.published,input.frame),6);array(yield props(captured),6);
     const service=promise(yield props(targetPromise));const parsed=promise(yield props(queryPromise));need(service.state==="fulfilled"&&parsed.state==="fulfilled"&&service.result!==null&&parsed.result!==null);result=service.result;
     ordinary.parse(yield props(result));truth.parse(yield call("same",result,[queryResult]));truth.parse(yield call("same",result,[parsed.result]));
     publication=tuple(yield call("published",captured,[native,holder,snapshot,post,result]),3);array(yield props(publication),3);break;
    }
    case "replyEntry":{
     need(post!==null&&(role!=="titles"||publication!==null));const captured=tuple(yield frame(2,"reply",FRAMES.ui.reply,input.frame),5);array(yield props(captured),5);
     const selected=({closing:"replyClosing",language:"replyLanguage",titles:"replyTitles"}as const)[role];const refs=[native,holder,snapshot,post];if(role==="titles"){need(publication!==null);refs.push(publication);}
     reply=tuple(yield call(selected,captured,refs),3);array(yield props(reply),3);break;
    }
    case "replyReturned":{
     need(reply!==null);z.strictObject({type:z.literal("undefined")}).parse(input.returnValue);const captured=tuple(yield frame(2,"reply",FRAMES.ui.reply,input.frame),5);array(yield props(captured),5);truth.parse(yield call("replyReturned",captured,[native,holder,snapshot,reply]));break;
    }
    case "publishedReturned":{
     need(role==="titles"&&result!==null&&post!==null&&publication!==null&&done.includes("replyReturned"));z.strictObject({type:z.literal("undefined")}).parse(input.returnValue);
     const captured=tuple(yield frame(2,"published",FRAMES.ui.published,input.frame),6);array(yield props(captured),6);const value=tuple(yield call("published",captured,[native,holder,snapshot,post,result]),3);array(yield props(value),3);break;
    }
    case "settled":{
     need(done.includes("callbackReturned")&&done.includes("replyReturned")&&done.includes("targetReturned"));
     if(role==="titles"){need(done.includes("publishedReturned")&&targetPromise!==null&&queryPromise!==null&&queryResult!==null);const a=promise(yield props(targetPromise)),b=promise(yield props(queryPromise));need(a.state==="fulfilled"&&b.state==="fulfilled"&&a.result!==null&&b.result!==null);truth.parse(yield call("same",a.result,[queryResult]));truth.parse(yield call("same",b.result,[queryResult]));}
     truth.parse(yield call("current",holder,[native,holder,snapshot]));break;
    }
    default:{throw new Error("WIRE_SERVICE_STAGE");}
   }
  }
  done.push(input.stage);requireRoot(first.root);
  const data:CurrentSchematicWireServiceInvocationData=Object.freeze({schema:"private.schematic-wire-service-invocation.v1",role,stage:input.stage,originalCallbackReceiverCompared:true,originalTargetReturnedCompared:done.includes("targetReturned"),sameFreshServicePromiseCompared:role==="titles"&&targetPromise!==null,sameQueryResultCompared:queryResult!==null&&result!==null,sameOriginalPublicationCompared:publication!==null,sameOriginalReplyCompared:reply!==null,suppliedObservationsOnly:true,originalNativeOwnerJoined:false,originalAsyncThenRegistrationJoined:false,uiProjectAndLocaleRuntimeQualified:false,titleHelperRuntimeQualified:false,serviceDeliveryJoined:false,saveAuthorized:false});
  issued.set(data,Object.freeze({first,parents,snapshot,target,query,post,publication,reply,queryPromise,targetPromise,queryResult,result,language,done:Object.freeze(done)}));return data;
 }
 public next():Command|null{need(!this.#failed&&!this.#reserved);if(this.#pending!==null){return this.#pending;}if(this.#result!==null){return null;}try{const row=this.#plan.next();need(row.done!==true);this.#pending=row.value;return row.value;}catch(error){this.#failed=true;throw error;}}
 public reserve(command:Command):void{need(!this.#failed&&!this.#reserved&&this.#pending===command&&this.#reads<this.#maximum);this.#reserved=true;this.#reads+=1;}
 public accept(command:Command,raw:unknown):void{need(!this.#failed&&this.#reserved&&this.#pending===command);try{this.#raw.push(raw);const row=this.#plan.next(capture(raw).value);this.#reserved=false;this.#pending=null;if(row.done===true){this.#result=row.value;}else{this.#pending=row.value;}}catch(error){this.#failed=true;throw error;}}
 public requireCompleted():CurrentSchematicWireServiceInvocationData{need(!this.#failed&&!this.#reserved&&this.#pending===null&&this.#result!==null);return this.#result;}
 public retainedReplies():readonly unknown[]{need(this.#failed||this.#result!==null);return Object.freeze([...this.#raw]);}
 public fail():void{this.#failed=true;}
}
function arrayLike(input:unknown):ReadonlyMap<string,CurrentSchematicRelevanceRawRemote>{
 const packet=ordinary.parse(input);const out=new Map<string,CurrentSchematicRelevanceRawRemote>();
 // Reuse the complete raw descriptor decoder without manufacturing internals.
 for(const row of rawProperties(packet).values()){need(row.value!==undefined&&row.get===undefined&&row.set===undefined);out.set(row.name,row.value);}return out;
}
Object.freeze(CurrentSchematicWireServiceInvocationCursor.prototype);Object.freeze(CurrentSchematicWireServiceInvocationCursor);
