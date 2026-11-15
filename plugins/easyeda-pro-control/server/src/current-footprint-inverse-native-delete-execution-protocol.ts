/** New post-reference native DEL transport. Historical qualification packets
 * remain readonly. Its sole invocation checks original tab/Storage guards in
 * the same synchronous renderer call before the original sender is spent. */
import {z} from "zod";
import {freezeDeep} from "./sqlite-inventory-core.ts";
import {CURRENT_NATIVE_OWN_DATA_CHECK} from "./current-native-own-data-intrinsics.ts";
import {captureCurrentFootprintInversePreferenceReply as capture} from "./current-footprint-inverse-public-preferences-replies.ts";
import {validateCurrentFootprintInverseNativeDeleteSenderCommand as old,currentFootprintInverseNativeDeleteSenderCases as oldCases,validateCurrentFootprintInverseNativeDeleteSenderReadCommand as oldRead,currentFootprintInverseNativeDeleteSenderTemplate as oldTemplate} from "./current-footprint-inverse-native-delete-sender-protocol.ts";
import type {CurrentFootprintInverseNativeDeleteSenderCommand as Old} from "./current-footprint-inverse-native-delete-sender-protocol.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SENDER_PROGRAMS as P} from "./current-footprint-inverse-native-delete-sender-programs.ts";
import {validateCurrentFootprintInverseNativeDeleteRegistrationCommand as registration} from "./current-footprint-inverse-native-delete-registration-protocol.ts";
import type {CurrentFootprintInverseNativeDeleteRegistrationCommand as Registration} from "./current-footprint-inverse-native-delete-registration-protocol.ts";

export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_EXECUTION_INVOKE=`function(prepared,tabProof,storageProof){"use strict";${CURRENT_NATIVE_OWN_DATA_CHECK}dense(prepared,8);dense(tabProof,2);dense(storageProof,2);const tab=value(tabProof,"1"),storage=value(storageProof,"1");if(typeof tab!=="function"||typeof storage!=="function"||invoke(tab,undefined,[])!==true)bad();const n=invoke(storage,undefined,[]);if(typeof n!=="number"||n<0||n>128||n%1!==0||1/n===-Infinity)bad();return invoke(value(prepared,"6"),undefined,[]);}`;
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_EXECUTION_REQUESTS=Object.freeze({sender:{read:61,held:23,cdp:84,controls:87},registration:{cdp:172,controls:174},cdpRequests:256,controls:261,nativeSenderHeldOnly:true,workerDeleteBodyAuthorized:false,mutationReturned:false,saveAuthorized:false});
type OldInvoke=Extract<Old,{phase:"inverse-native-delete-sender-invoke"}>;
type Invoke=Omit<OldInvoke,"params">&Readonly<{params:Omit<OldInvoke["params"],"functionDeclaration"|"arguments">&Readonly<{functionDeclaration:typeof CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_EXECUTION_INVOKE;arguments:readonly[{readonly objectId:string},{readonly objectId:string},{readonly objectId:string}]}>}>;
export type CurrentFootprintInverseNativeDeleteExecutionSenderCommand=Exclude<Old,OldInvoke>|Invoke;
export type CurrentFootprintInverseNativeDeleteExecutionCommand=Readonly<{stage:"sender";command:CurrentFootprintInverseNativeDeleteExecutionSenderCommand}|{stage:"registration";command:Registration}>;
const h=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const ref=z.strictObject({objectId:h});
const invokeSchema=z.looseObject({phase:z.literal("inverse-native-delete-sender-invoke"),params:z.looseObject({functionDeclaration:z.literal(CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_EXECUTION_INVOKE),arguments:z.tuple([ref,ref,ref])})});
function need(value:boolean):asserts value{
if(!value){
throw new Error("INVERSE_NATIVE_DELETE_EXECUTION_COMMAND");
}
}
/** Normalize only fixed syntax for validation; original three handles and
 * source are restored before transport. No historical invocation is emitted. */
export function validateCurrentFootprintInverseNativeDeleteExecutionSenderCommand(input:unknown):CurrentFootprintInverseNativeDeleteExecutionSenderCommand{
 const raw=capture(input);
const phase=z.looseObject({phase:z.string()}).parse(raw).phase;
if(phase!=="inverse-native-delete-sender-invoke"){
const checked=old(raw);
need(checked.phase!=="inverse-native-delete-sender-invoke");
return checked;
}
 const actual=invokeSchema.parse(raw);
const normalized=old({...actual,params:{...actual.params,functionDeclaration:P.invokeOnce,arguments:[actual.params.arguments[0]]}});
 need(normalized.phase==="inverse-native-delete-sender-invoke");
return freezeDeep({...normalized,params:{...normalized.params,functionDeclaration:CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_EXECUTION_INVOKE,arguments:actual.params.arguments}});
}
/** A fresh preparation reader cannot inherit the historical invoke branch. */
export function validateCurrentFootprintInverseNativeDeleteExecutionReadCommand(input:unknown):Exclude<Old,OldInvoke>{
const c=oldRead(input);
need(c.phase!=="inverse-native-delete-sender-invoke");
return c;
}
export function validateCurrentFootprintInverseNativeDeleteExecutionCommand(input:unknown):CurrentFootprintInverseNativeDeleteExecutionCommand{
const raw=z.strictObject({stage:z.enum(["sender","registration"]),command:z.unknown()}).parse(capture(input));
return raw.stage==="sender"?freezeDeep({stage:raw.stage,command:validateCurrentFootprintInverseNativeDeleteExecutionSenderCommand(raw.command)}):freezeDeep({stage:raw.stage,command:registration(raw.command)});
}
export function qualifyCurrentFootprintInverseNativeDeleteExecutionHelper(input:unknown,command:CurrentFootprintInverseNativeDeleteExecutionSenderCommand):void{
const c=validateCurrentFootprintInverseNativeDeleteExecutionSenderCommand(command);
const source=z.strictObject({scriptSource:z.string().max(16_386)}).parse(capture(input));
let program:string|null=null;
if(c.method==="Runtime.callFunctionOn"){
program=`(${c.params.functionDeclaration})`;
}
else if(c.method==="Debugger.evaluateOnCallFrame"){
program=c.params.expression;
}
need(program!==null&&source.scriptSource===program);
}
type Wire<T>=T extends CurrentFootprintInverseNativeDeleteExecutionCommand?T["command"]&Readonly<{stage:T["stage"];id:number;sessionId:string;inverseNativeDeleteExecution:true}>:never;
export function currentFootprintInverseNativeDeleteExecutionWire(input:CurrentFootprintInverseNativeDeleteExecutionCommand,id:number,sessionId:string):Wire<CurrentFootprintInverseNativeDeleteExecutionCommand>{
need(Number.isSafeInteger(id)&&id>0);
h.parse(sessionId);
const c=validateCurrentFootprintInverseNativeDeleteExecutionCommand(input);
return c.stage==="sender"?freezeDeep({...c.command,stage:c.stage,id,sessionId,inverseNativeDeleteExecution:true}):freezeDeep({...c.command,stage:c.stage,id,sessionId,inverseNativeDeleteExecution:true});
}
export function currentFootprintInverseNativeDeleteExecutionNativeFrame(bytes:Buffer,input:CurrentFootprintInverseNativeDeleteExecutionCommand,sessionId:string):Readonly<Record<string,string|number>>{
need(bytes.length<=65_536&&bytes.at(-1)===0);
const raw:unknown=JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(bytes.subarray(0,-1)));
const id=z.looseObject({id:z.number().int().positive()}).parse(capture(raw)).id;
const packet=validateCurrentFootprintInverseNativeDeleteExecutionCommand(input);
const c=packet.command;
need(bytes.toString("utf8")===`${JSON.stringify(currentFootprintInverseNativeDeleteExecutionWire(packet,id,sessionId))}\0`);
const fields:Record<string,string|number>={action:"footprint-inverse-native-delete-execution",stage:packet.stage,requestId:id,phase:c.phase,method:c.method};
if("role"in c){
fields["role"]=c.role;
}
if(c.method==="Runtime.callFunctionOn"){
fields["objectId"]=c.params.objectId;
for(const[index,arg]
of c.params.arguments.entries()){
if("objectId"in arg){
fields[`reference${String(index)}`]=arg.objectId;
}
else{
Object.assign(fields,arg.value);
}
}
}
else if(c.method==="Debugger.evaluateOnCallFrame"){
fields["callFrameId"]=c.params.callFrameId;
}
else if(c.method==="Debugger.getScriptSource"){
fields["scriptId"]=c.params.scriptId;
}
else{
fields["objectId"]=c.params.objectId;
}
return Object.freeze(fields);
}
export function currentFootprintInverseNativeDeleteExecutionSenderCases():readonly CurrentFootprintInverseNativeDeleteExecutionSenderCommand[]{
return freezeDeep(oldCases().map(c=>c.phase==="inverse-native-delete-sender-invoke"?validateCurrentFootprintInverseNativeDeleteExecutionSenderCommand({...c,params:{...c.params,functionDeclaration:CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_EXECUTION_INVOKE,arguments:[{objectId:"original_ref"},{objectId:"original_ref"},{objectId:"original_ref"}]}}):c));
}
export function currentFootprintInverseNativeDeleteExecutionSenderTemplate(input:CurrentFootprintInverseNativeDeleteExecutionSenderCommand):ReturnType<typeof oldTemplate>{
const c=validateCurrentFootprintInverseNativeDeleteExecutionSenderCommand(input);
if(c.phase!=="inverse-native-delete-sender-invoke"){
return oldTemplate(c);
}
const params={...c.params,objectId:"__native_delete_execution_objectId__",functionDeclaration:"__native_delete_execution_program_invokeOnce__",arguments:c.params.arguments.map((_,index)=>({objectId:`__native_delete_execution_reference${String(index)}__`}))};
return freezeDeep({key:"invoke",method:c.method,names:["objectId","reference0","reference1","reference2"],template:JSON.stringify({method:c.method,params})});
}
