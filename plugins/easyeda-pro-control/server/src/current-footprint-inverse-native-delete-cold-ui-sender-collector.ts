/** Exact negative UI sender preparation. The original cold owner alone binds
 * this packet's realm and primitives; no matching JSON or old GET token is an
 * invocation, body transfer, native Job or persisted absence grant. */
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_SENDER_REQUESTS} from "./current-footprint-inverse-native-delete-cold-ui-request-budgets.ts";
import {types} from "node:util";
import {z} from "zod";
import {captureCurrentFootprintInversePreferenceReply as captureReply} from "./current-footprint-inverse-public-preferences-replies.ts";
import {CURRENT_FOOTPRINT_INVERSE_INITIALIZED_GET_SOURCE as SOURCE,requireCurrentFootprintInverseInitializedGetDescription as description} from "./current-footprint-inverse-initialized-get-source.ts";
import type {CurrentFootprintInverseInitializedGetRole as SourceRole} from "./current-footprint-inverse-initialized-get-source.ts";
import {decodeCurrentFootprintInverseInitializedGetFunction as metadata} from "./current-footprint-inverse-initialized-get-replies.ts";
import {currentFootprintInverseLookupArray as array,currentFootprintInverseLookupObject as object,currentFootprintInverseLookupProperties as properties,currentFootprintInverseLookupResult as result} from "./current-footprint-inverse-lookup-preentry-replies.ts";
import type {CurrentFootprintInverseLookupRemote as Remote} from "./current-footprint-inverse-lookup-preentry-replies.ts";
import {requireCurrentFootprintInversePublicServiceTrue as truth} from "./current-footprint-inverse-public-service-replies.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_FLAGS as FLAGS,currentFootprintInverseNativeDeleteColdUiCallSpec as spec,validateCurrentFootprintInverseNativeDeleteColdUiCommand as validate} from "./current-footprint-inverse-native-delete-cold-ui-protocol.ts";
import type {CurrentFootprintInverseNativeDeleteColdUiCommand as Command,CurrentFootprintInverseNativeDeleteColdUiCallRole as Role} from "./current-footprint-inverse-native-delete-cold-ui-protocol.ts";
import type {CurrentFootprintInverseNativeDeleteColdUiPrimitives as Primitives} from "./current-footprint-inverse-native-delete-cold-ui-primitive-collector.ts";

interface Bindings{
 readonly current:()=>void;readonly uiScriptId:string;readonly primitives:Primitives;
 readonly target:Readonly<{projectUuid:string;branchUuid:string;documentUuid:string}>;
 readonly request:(command:Command)=>Promise<unknown>;readonly qualifyHelper:(command:Command)=>Promise<string>;
}
export interface CurrentFootprintInverseNativeDeleteColdUiSender{
 readonly profile:"private.current-footprint-inverse-native-delete-cold-ui-sender.v1";
 readonly bus:string;readonly rpc:string;readonly reply:string;readonly task:string;readonly callback:string;readonly prepared:string;readonly replyTopic:string;
 readonly before:string;readonly once:string;readonly after:string;
 readonly originalOnceLocation:Readonly<{scriptId:string;lineNumber:number;columnNumber:number}>;
 readonly bodyIssued:false;readonly executionAuthorized:false;
}
interface Tuple{readonly id:string;readonly values:readonly Remote[];readonly packets:readonly unknown[]}
const originals=new WeakMap<CurrentFootprintInverseNativeDeleteColdUiSender,Bindings>();
export {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_SENDER_REQUESTS} from "./current-footprint-inverse-native-delete-cold-ui-request-budgets.ts";
const busRoles=["uiBusUniqueRpcTopic","uiBusPublish","uiBusSubscribe","uiBusPush","uiBusPull","uiBusPullA","uiBusRpcService","uiBusRpcCall","uiBusRpcReply"]as const;
function need(ok:boolean):asserts ok{if(!ok){throw new Error("INVERSE_NATIVE_DELETE_COLD_UI_SENDER");}}
export async function collectCurrentFootprintInverseNativeDeleteColdUiSender(bindings:Bindings):Promise<CurrentFootprintInverseNativeDeleteColdUiSender>{
 const b=Object.freeze({...bindings,target:Object.freeze({...bindings.target})});let helpers=0,normal=0;const qualification:{preparedScriptId:string|null}={preparedScriptId:null};
 const send=async(input:Command):Promise<unknown>=>{
  b.current();const command=validate(input);need(command.method==="Runtime.callFunctionOn"&&["roots","context","bus","methods","queue","task","members","taskMethods","prepare","before"].includes(command.role)||command.method==="Runtime.getProperties");
  need(normal<CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_SENDER_REQUESTS.normal);normal+=1;b.current();const raw=await b.request(command);b.current();
  if(command.method==="Runtime.callFunctionOn"){need(helpers<CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_SENDER_REQUESTS.helpers);helpers+=1;b.current();const scriptId=await b.qualifyHelper(command);if(command.role==="prepare"){need(qualification.preparedScriptId===null);qualification.preparedScriptId=scriptId;}b.current();}return raw;
 };
 const props=(objectId:string):Promise<unknown>=>send({phase:"inverse-native-delete-cold-ui",role:"properties",method:"Runtime.getProperties",params:{objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}});
 const call=(role:Role,refs:readonly string[],objectId=b.primitives.reflection):Promise<unknown>=>{
  const fixed=spec(role);const args:unknown[]=fixed.stage===null?[]:[{value:fixed.stage}];args.push(...refs.map(id=>({objectId:id})));if(fixed.target){args.push({value:b.target});}
  return send(validate({phase:"inverse-native-delete-cold-ui",role,method:"Runtime.callFunctionOn",params:{...FLAGS,objectId,functionDeclaration:fixed.program,arguments:args,returnByValue:fixed.byValue}}));
 };
 const tuple=async(role:Role,refs:readonly string[],size:number):Promise<Tuple>=>{
  const id=result(await call(role,refs),size);const values=array(await props(id),size);const packets:unknown[]=[];
  for(const value of values){if(value.type==="function"||value.type==="object"&&value.subtype!=="null"){const raw=await props(object(value));properties(raw);packets.push(raw);}else{packets.push(null);}}
  return Object.freeze({id,values,packets:Object.freeze(packets)});
 };
 const qualify=(capture:Tuple,index:number,role:SourceRole):string=>{
  const value=capture.values[index];need(value?.type==="function"&&value.description!==undefined&&SOURCE[role].file==="ui");description(value.description,role);metadata(capture.packets[index],role,b.uiScriptId);return object(value);
 };
 const roots=await tuple("roots",[],2);const context=await tuple("context",[roots.id],2);const bus=await tuple("bus",[roots.id,context.id],4);qualify(bus,3,"uiBusClass");
 const methods=await tuple("methods",[roots.id,context.id],9);for(const[index,role]of busRoles.entries()){qualify(methods,index,role);}
 const queue=await tuple("queue",[bus.id],1);const task=await tuple("task",[queue.id],1);const members=await tuple("members",[task.id],2);const callback=qualify(members,1,"uiBusRpcServiceCallback1");
 const taskMethods=await tuple("taskMethods",[members.id],4);for(const[index,role]of (["uiTaskClass","uiTaskCancel","uiTaskRunning","uiTaskExecute"]as const).entries()){qualify(taskMethods,index,role);}
 const prepared=await tuple("prepare",[roots.id,context.id,bus.id,methods.id,queue.id,task.id,members.id,taskMethods.id,b.primitives.reflectApply,b.primitives.reprove],9);
 const reply=prepared.values[2];need(reply?.type==="string"&&typeof reply.value==="string"&&/^_MSG_BUS_RPC_-\/PrjDB\/footprint\/getData-[a-f\d]{32}-(?:0|[1-9]\d{0,15})$(?![\s\S])/u.test(reply.value));
 const fn=(index:number):string=>{const value=prepared.values[index];need(value?.type==="function"&&value.subtype===undefined);return object(value);};
 const before=fn(3);const once=fn(4);const after=fn(5);truth(await call("before",[],before));b.current();need(normal===52&&helpers===10);
 const busValue=prepared.values[0],taskValue=prepared.values[8];need(busValue!==undefined&&taskValue!==undefined);
 const preparedScriptId=qualification.preparedScriptId;need(preparedScriptId!==null);
 const generatedValue=z.looseObject({type:z.string(),subtype:z.string().optional(),value:z.unknown().optional()});const generatedInternal=z.looseObject({name:z.string(),value:generatedValue});const generatedPacket=z.looseObject({internalProperties:z.array(generatedInternal).max(3)});const ownPacket=generatedPacket.parse(captureReply(prepared.packets[4]));
 const locations=ownPacket.internalProperties.filter(value=>value.name==="[[FunctionLocation]]");const location=locations[0];need(locations.length===1&&location?.value.type==="object"&&location.value.subtype==="internal#location");
 const originalOnceLocation=z.strictObject({scriptId:z.literal(preparedScriptId),lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()}).parse(location.value.value);
 const packet:CurrentFootprintInverseNativeDeleteColdUiSender=Object.freeze({profile:"private.current-footprint-inverse-native-delete-cold-ui-sender.v1",bus:object(busValue),rpc:qualify(methods,7,"uiBusRpcCall"),reply:qualify(methods,8,"uiBusRpcReply"),task:object(taskValue),callback,prepared:prepared.id,replyTopic:reply.value,before,once,after,originalOnceLocation:Object.freeze(originalOnceLocation),bodyIssued:false,executionAuthorized:false});
 originals.set(packet,b);return packet;
}
export function requireOriginalCurrentFootprintInverseNativeDeleteColdUiSender(packet:CurrentFootprintInverseNativeDeleteColdUiSender):void{
 need(packet!==null&&typeof packet==="object"&&!types.isProxy(packet));const original=originals.get(packet);need(original!==undefined);original.current();
}
