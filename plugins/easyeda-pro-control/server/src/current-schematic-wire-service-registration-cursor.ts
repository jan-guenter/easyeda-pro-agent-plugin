/** Before-Modify registration comparisons for the exact three original
 * shared-bus handlers. Actual service entry/return custody is separate. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply as capture } from "./current-pcb-string-clock-reply.ts";
import { decodeCurrentFootprintCopyClockRpcV2Array as array,decodeCurrentFootprintCopyClockRpcV2ArrayCapture as tuple } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import { currentSchematicRelevanceRawHandle as object } from "./current-schematic-relevance-action-raw-replies.ts";
import { CurrentSchematicWireClassicRpcSharedCensus as Census,wireClassicRpcFieldValue as value } from "./current-schematic-wire-classic-rpc-shared-census.ts";
import { CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_SHARED_FLAGS as FLAGS,validateCurrentSchematicWireClassicRpcSharedCommand as reader } from "./current-schematic-wire-classic-rpc-shared-protocol.ts";
import type { CurrentSchematicWireClassicRpcSharedCommand } from "./current-schematic-wire-classic-rpc-shared-protocol.ts";
import { decodeCurrentSchematicWireClassicRpcFunction as qualify } from "./current-schematic-wire-classic-rpc-source.ts";
import type { CurrentSchematicWireClassicRpcSourceRole as Role } from "./current-schematic-wire-classic-rpc-source.ts";
import { qualifyCurrentSchematicWireServiceSource as whole } from "./current-schematic-wire-service-source.ts";
import { CURRENT_SCHEMATIC_WIRE_SERVICE_REGISTRATION_CALLS as CALLS,CURRENT_SCHEMATIC_WIRE_SERVICE_REGISTRATION_REQUESTS as LIMIT,validateCurrentSchematicWireServiceRegistrationCommand as validate } from "./current-schematic-wire-service-registration-protocol.ts";
import type { CurrentSchematicWireServiceRegistrationCommand } from "./current-schematic-wire-service-registration-protocol.ts";

export type CurrentSchematicWireServiceRegistrationRead=CurrentSchematicWireClassicRpcSharedCommand|CurrentSchematicWireServiceRegistrationCommand;
interface Input {readonly holder:string;readonly native:string;readonly scriptId:string;readonly uiScriptId:string;readonly variant:0|1;readonly source:unknown;readonly uiSource:unknown}
export interface CurrentSchematicWireServiceRegistrationData{
 readonly schema:"private.schematic-wire-service-registration.v1";
 readonly root:string;readonly senderMethodsA:string;readonly senderMethodsB:string;readonly lists:string;readonly tasks:string;readonly callbacks:string;readonly handlers:string;readonly targets:string;
 readonly allThreeOriginalRegisteredTasksCompared:true;readonly allThreeOriginalTargetSourcesCompared:true;readonly capturedBeforeModify:true;
 readonly suppliedObservationsOnly:true;readonly originalSourceRequestsJoined:false;readonly originalNativeOwnerJoined:false;
 readonly callbackLexicalReceiversJoined:false;readonly uiProjectAndLocaleRuntimeQualified:false;readonly titleHelperRuntimeQualified:false;
 readonly serviceDeliveryJoined:false;readonly mutationAuthorized:false;readonly saveAuthorized:false;
}
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const result=z.strictObject({result:z.strictObject({type:z.enum(["undefined","function"]),className:z.string().optional(),description:z.string().optional(),objectId:handle.optional()})});
const scopeValue=z.strictObject({type:z.literal("object"),subtype:z.literal("internal#scope"),className:z.string().optional(),description:z.string().optional(),objectId:handle});
const scopeField=z.strictObject({name:z.string(),value:scopeValue,writable:z.literal(true),configurable:z.literal(true),enumerable:z.literal(true),isOwn:z.literal(true)});
const scopeList=z.strictObject({result:z.array(scopeField).min(1).max(LIMIT.scopeLimit),internalProperties:z.array(z.never()).length(0).optional()});
const truth=z.strictObject({result:z.strictObject({type:z.literal("boolean"),value:z.literal(true)})});
const issued=new WeakMap<CurrentSchematicWireServiceRegistrationData,Input>();const spent=new WeakSet<CurrentSchematicWireServiceRegistrationData>();
function need(condition:boolean):asserts condition{if(!condition){throw new Error("WIRE_SERVICE_REGISTRATION_CURSOR");}}
/** This local token supplies neither a native request nor continuation. */
export function consumeCurrentSchematicWireServiceRegistrationData(data:CurrentSchematicWireServiceRegistrationData,input:Readonly<{holder:string;native:string;scriptId:string;uiScriptId:string;variant:0|1}>):CurrentSchematicWireServiceRegistrationData{
 const original=issued.get(data);need(original!==undefined&&!spent.has(data));spent.add(data);
 need(original.holder===input.holder&&original.native===input.native&&original.scriptId===input.scriptId&&original.uiScriptId===input.uiScriptId&&original.variant===input.variant&&!Object.is(input.variant,-0));return data;
}
function props(objectId:string):CurrentSchematicWireClassicRpcSharedCommand{return reader({phase:"classic-rpc-properties",kind:"fields",method:"Runtime.getProperties",params:{objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}});}
function call(role:keyof typeof CALLS,receiver:string,refs:readonly string[]):CurrentSchematicWireServiceRegistrationCommand{
 const row=CALLS[role];need(refs.length===row.refs);return validate({phase:"wire-service-registration-call",role,method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:receiver,functionDeclaration:row.program,arguments:refs.map(objectId=>({objectId})),returnByValue:row.byValue,awaitPromise:false,userGesture:false}});
}
function* approved(census:Census,input:Input):Generator<CurrentSchematicWireServiceRegistrationRead,string,unknown>{
 const refs=[...census.approved];while(refs.length<LIMIT.approvedSlots){refs.push(input.native);}return tuple(yield call("approved",input.holder,[input.native,...refs]),LIMIT.approvedSlots);
}
function returnedObject(input:unknown):string{
 const raw=z.strictObject({result:z.strictObject({type:z.literal("object"),className:z.string(),description:z.string(),objectId:handle})}).parse(input);return raw.result.objectId;
}
interface Binding {readonly id:string;readonly scopes:string}
function* binding(input:Input,scopesId:string,key:"scopeE"|"scopeT",variant:0|1|2,role:Role,scriptId:string):Generator<CurrentSchematicWireServiceRegistrationRead,Binding,unknown>{
 const snapshot=scopeList.parse(yield props(scopesId));let found:Binding|null=null;
 for(const[index,scope]of snapshot.result.entries()){
  need(scope.name===String(index));const raw:unknown=yield call(key,scope.value.objectId,[input.native]);const candidate=result.parse(raw).result;
  if(candidate.type==="undefined"){need(candidate.objectId===undefined);}
  else{need(found===null&&candidate.objectId!==undefined);const metadata=qualify(yield props(candidate.objectId),candidate,variant,role,scriptId);found=Object.freeze({id:candidate.objectId,scopes:metadata.scopes});}
 }
 need(found!==null);return found;
}
export class CurrentSchematicWireServiceRegistrationCursor{
 readonly #input:Input;readonly #plan:Generator<CurrentSchematicWireServiceRegistrationRead,CurrentSchematicWireServiceRegistrationData,unknown>;
 #pending:CurrentSchematicWireServiceRegistrationRead|null=null;#reserved=false;#failed=false;#reads=0;#result:CurrentSchematicWireServiceRegistrationData|null=null;readonly #raw:unknown[]=[];
 public constructor(input:Input){
  for(const id of[input.holder,input.native,input.scriptId,input.uiScriptId]){handle.parse(id);}need(whole(input.source)===input.variant&&whole(input.uiSource)===2);
  this.#input=Object.freeze({...input});this.#plan=CurrentSchematicWireServiceRegistrationCursor.collect(this.#input);Object.freeze(this);
 }
 private static *collect(input:Input):Generator<CurrentSchematicWireServiceRegistrationRead,CurrentSchematicWireServiceRegistrationData,unknown>{
  const census=new Census(64);const h=yield* census.array(input.holder,2);const b=yield* census.field(h,"0"),state=yield* census.field(h,"1");yield* census.field(state,"before");
  for(const key of["page","shapes","host","line","group"]){yield* census.field(b,key,"large");}yield* census.field(b,"metadata");
  const first=yield* approved(census,input);const bus=returnedObject(yield call("bus",input.holder,[input.native,input.holder,first]));const busFields=yield* census.read(bus);for(const key of["subscribed","pulled","pushed"]){yield* census.field(busFields,key,"large");}
  const table=yield* approved(census,input);const root=tuple(yield call("roots",input.holder,[input.native,input.holder,table]),15);const rootFields=array(yield props(root),15);
  const prototype=yield* census.read(object(rootFields.get("12"),"object"));const senderMethods:string[]=[];
  const methodRoles=[["rpcCall","MessageBus_rpcCall"],["uniqueRpcTopic","MessageBus_uniqueRpcTopic"],["publish","MessageBus_publish"],["pull","MessageBus_pull"],["push","MessageBus_push"],["rpcReply","MessageBus_rpcReply"]]as const;
  for(const[name,role]of methodRoles){const actual=value(prototype,name);const method=object(actual,"function");qualify(yield props(method),actual,2,role,input.uiScriptId);senderMethods.push(method);}
  const lists=tuple(yield call("lists",input.holder,[input.native,input.holder,table,root]),3);const listFields=array(yield props(lists),3);
  const callbacks:string[]=[],handlers:Binding[]=[],targets:string[]=[],tasks:string[]=[];
  for(let index=0;index<3;index+=1){
   const listHandle=object(listFields.get(String(index)),"object");const list=yield* census.array(listHandle,1);const task=object(value(list,"0"),"object");const fields=yield* census.read(task);
   const callback=value(fields,"callback");need(value(fields,"isRunning").value===true);const fn=object(callback,"function");const metadata=qualify(yield props(fn),callback,2,"MessageBus_rpcService_child0",input.uiScriptId);
   const handler=yield* binding(input,metadata.scopes,"scopeE",index===2?input.variant:2,index===2?"titleService":"N4e_child0",index===2?input.scriptId:input.uiScriptId);
   tasks.push(task);callbacks.push(fn);handlers.push(handler);
   if(index===2){targets.push(handler.id);}else{const target=yield* binding(input,handler.scopes,"scopeT",2,index===0?"uiClosing":"uiLocale_i18n",input.uiScriptId);targets.push(target.id);}
  }
  function* bundle(refs:readonly string[]):Generator<CurrentSchematicWireServiceRegistrationRead,string,unknown>{need(refs.length===3);const captured=tuple(yield call("bundle",input.holder,[input.native,...refs]),3);array(yield props(captured),3);return captured;}
  const callbackTuple=yield* bundle(callbacks),handlerTuple=yield* bundle(handlers.map(row=>row.id)),targetTuple=yield* bundle(targets),taskTuple=yield* bundle(tasks);
  const methodsA=yield* bundle(senderMethods.slice(0,3)),methodsB=yield* bundle(senderMethods.slice(3));
  truth.parse(yield call("complete",input.holder,[input.native,input.holder,table,root,lists,taskTuple,callbackTuple,handlerTuple,targetTuple,methodsA,methodsB]));
  const data:CurrentSchematicWireServiceRegistrationData=Object.freeze({schema:"private.schematic-wire-service-registration.v1",root,senderMethodsA:methodsA,senderMethodsB:methodsB,lists,tasks:taskTuple,callbacks:callbackTuple,handlers:handlerTuple,targets:targetTuple,allThreeOriginalRegisteredTasksCompared:true,allThreeOriginalTargetSourcesCompared:true,capturedBeforeModify:true,suppliedObservationsOnly:true,originalSourceRequestsJoined:false,originalNativeOwnerJoined:false,callbackLexicalReceiversJoined:false,uiProjectAndLocaleRuntimeQualified:false,titleHelperRuntimeQualified:false,serviceDeliveryJoined:false,mutationAuthorized:false,saveAuthorized:false});issued.set(data,input);return data;
 }
 public next():CurrentSchematicWireServiceRegistrationRead|null{need(!this.#failed&&!this.#reserved);if(this.#pending!==null){return this.#pending;}if(this.#result!==null){return null;}try{const row=this.#plan.next();need(row.done!==true);this.#pending=row.value;return row.value;}catch(error){this.#failed=true;throw error;}}
 public reserve(command:CurrentSchematicWireServiceRegistrationRead):void{need(!this.#failed&&!this.#reserved&&command===this.#pending&&this.#reads<LIMIT.ordinary);this.#reserved=true;this.#reads+=1;}
 public accept(command:CurrentSchematicWireServiceRegistrationRead,raw:unknown):void{
  need(!this.#failed&&this.#reserved&&command===this.#pending);try{this.#raw.push(raw);const input=command.phase==="classic-rpc-properties"&&command.kind==="large"?raw:capture(raw).value;const row=this.#plan.next(input);this.#reserved=false;this.#pending=null;if(row.done===true){this.#result=row.value;}else{this.#pending=row.value;}}catch(error){this.#failed=true;throw error;}
 }
 public requireCompleted():CurrentSchematicWireServiceRegistrationData{need(!this.#failed&&!this.#reserved&&this.#pending===null&&this.#result!==null);return this.#result;}
 public retainedReplies():readonly unknown[]{need(this.#failed||this.#result!==null);return Object.freeze([...this.#raw]);}
 public fail():void{this.#failed=true;}
}
Object.freeze(CurrentSchematicWireServiceRegistrationCursor.prototype);Object.freeze(CurrentSchematicWireServiceRegistrationCursor);
