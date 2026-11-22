/* oxlint-disable import/max-dependencies -- This single fixed roster joins the existing native, source, array and original serial-scope data decoders. */
/** Actual same-frame publication subscriber/native roster. Completion is
 * preflight only and cannot consume the held upload or any original callback. */
import {z} from "zod";
import {createHash} from "node:crypto";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_PUBLICATION_EXTRA_METADATA as EXTRAS,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_PUBLICATION_GUARD as GUARD,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_PUBLICATION_METHOD_METADATA as METHODS,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_PUBLICATION_NATIVE_METADATA as NATIVES,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_PUBLICATION_BINDING_PROGRAMS as PROGRAMS,qualifyCurrentFootprintInverseNativeDeletePublicationBindingSource} from "./current-footprint-inverse-native-delete-publication-bindings.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_PUBLICATION_FLAGS as FLAGS,validateCurrentFootprintInverseNativeDeletePublicationCommand as validate} from "./current-footprint-inverse-native-delete-publication-protocol.ts";
import type {CurrentFootprintInverseNativeDeletePublicationCommand as Command} from "./current-footprint-inverse-native-delete-publication-protocol.ts";
import {decodeCurrentFootprintCopyClockRpcV2Array as array,decodeCurrentFootprintCopyClockRpcV2ArrayCapture as arrayCapture,currentFootprintCopyClockRpcV2ArrayObject as objectAt} from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import {currentFootprintInverseLookupNativeCallable,qualifyCurrentFootprintInverseLookupNativeConstructor} from "./current-footprint-inverse-lookup-native-metadata.ts";
import {decodeCurrentNativeFunctionMetadata} from "./current-native-function-metadata.ts";
import {decodeCurrentGeneratedSyncCallee} from "./current-generated-initial-sync-replies.ts";
import {decodeCurrentPcb209WorkerProducerScopeList,decodeCurrentPcb209WorkerProducerScopes} from "./current-pcb-string-producer-scope.ts";
import {CURRENT_FOOTPRINT_INVERSE_STARTUP_QUEUE_CALL as QUEUE} from "./current-footprint-inverse-startup-queue-protocol.ts";
import {captureCurrentPcbStringClockReply} from "./current-pcb-string-clock-reply.ts";

const prefix="inverse-native-delete-publication-";const handle=z.string().regex(/^[A-Za-z0-9_.:-]{1,256}$/u);
const remote=z.looseObject({type:z.string(),subtype:z.string().optional(),className:z.string().optional(),description:z.string().optional(),objectId:handle.optional(),value:z.unknown().optional()});
const location=z.strictObject({scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()});
const internal=z.strictObject({name:z.string(),value:remote});
function need(ok:boolean):asserts ok{if(!ok){throw new Error("INVERSE_NATIVE_DELETE_PUBLICATION_ROSTER");}}
export interface CurrentFootprintInverseNativeDeletePublicationBindings{
 readonly scriptId:string;readonly source:string;readonly intrinsics:string;readonly project:string;readonly wrapper:string;readonly callback:string;readonly bundle:string;readonly frame:string;
 readonly current:()=>void;readonly request:(command:Command)=>Promise<unknown>;readonly qualifyHelper:(command:Command)=>Promise<void>;
}
export interface CurrentFootprintInverseNativeDeletePublicationData{
 readonly capture:string;readonly extra:string;readonly sourceRecordUpperBound:1;
 readonly normal:42;readonly helpers:4;readonly cdpRequests:46;readonly originalSingleChangeSubscriber:true;readonly originalSingleHeadSubscriber:true;
 readonly originalSerialClosureEmpty:true;readonly originalNonprivateMode:false;readonly uploadHeld:true;readonly uploadResumed:false;readonly publicationComplete:false;readonly saveAuthorized:false;
}
export async function observeCurrentFootprintInverseNativeDeletePublication(b:CurrentFootprintInverseNativeDeletePublicationBindings):Promise<Readonly<CurrentFootprintInverseNativeDeletePublicationData>>{
 b.current();qualifyCurrentFootprintInverseNativeDeletePublicationBindingSource(b.source);let normal=0;let helpers=0;
 const send=async(input:unknown):Promise<unknown>=>{b.current();const c=validate(input);need((normal+=1)<=42);const raw=await b.request(c);b.current();if(c.method==="Runtime.callFunctionOn"||c.method==="Debugger.evaluateOnCallFrame"){need((helpers+=1)<=4);await b.qualifyHelper(c);b.current();}return captureCurrentPcbStringClockReply(raw).value;};
 const props=(role:string,objectId:string):Promise<unknown>=>send({phase:`${prefix}properties`,role,method:"Runtime.getProperties",params:{objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}});
 const call=(role:"capture"|"extra",args:readonly string[]):Promise<unknown>=>send({phase:`${prefix}${role}`,method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:b.intrinsics,functionDeclaration:PROGRAMS[role],arguments:args.map(objectId=>({objectId})),returnByValue:false}});
 const capture=arrayCapture(await call("capture",[b.project,b.wrapper,b.callback]),49),members=array(await props("capture",capture),49);
 for(const row of NATIVES){const actual=members.get(String(row.slot));need(actual!==undefined);const id=objectAt(members,row.slot),raw=await props(`native-${String(row.slot)}`,id);currentFootprintInverseLookupNativeCallable(actual,row.name);
  if(row.name==="Promise"||row.name==="Symbol"){qualifyCurrentFootprintInverseLookupNativeConstructor(raw,actual,row.name);}else{decodeCurrentNativeFunctionMetadata(raw,row);}}
 for(const row of METHODS){const actual=remote.parse(members.get(String(row.slot)));need(actual.type==="function"&&actual.className==="Function"&&actual.subtype===undefined&&actual.description===row.source);decodeCurrentGeneratedSyncCallee(await props(`method-${String(row.slot)}`,objectAt(members,row.slot)),row,b.scriptId);}
 const guard=remote.parse(members.get("48"));need(guard.type==="function"&&guard.className==="Function"&&guard.subtype===undefined&&guard.description===GUARD);
 const guardRaw=z.looseObject({internalProperties:z.array(internal).min(3).max(4)}).parse(await props("guard",objectAt(members,48)));const at=location.parse(guardRaw.internalProperties.find(row=>row.name==="[[FunctionLocation]]")?.value.value);
 const offset=PROGRAMS.capture.indexOf(GUARD);const before=PROGRAMS.capture.slice(0,offset);const last=before.lastIndexOf("\n");need(offset!==-1);
 decodeCurrentGeneratedSyncCallee(guardRaw,{name:"check",arity:0,async:false,regular:false,lineNumber:before.split("\n").length-1,columnNumber:last===-1?offset+1:offset-last-1},at.scriptId);
 z.strictObject({scriptSource:z.literal(`(${PROGRAMS.capture})`)}).parse(await send({phase:`${prefix}guard-source`,method:"Debugger.getScriptSource",params:{scriptId:at.scriptId}}));
 const extra=arrayCapture(await call("extra",[capture,b.bundle,b.wrapper,b.callback]),10),extraMembers=array(await props("extra",extra),10);
 for(const row of EXTRAS){const actual=remote.parse(extraMembers.get(String(row.slot))),description=actual.description;need(actual.type==="function"&&actual.className==="Function"&&actual.subtype===undefined&&typeof description==="string"&&Buffer.byteLength(description)===row.sourceBytes&&createHash("sha256").update(description).digest("hex")===row.sourceSha256);decodeCurrentGeneratedSyncCallee(await props(`extra-${String(row.slot)}`,objectAt(extraMembers,row.slot)),row,b.scriptId);}
 const scopes=decodeCurrentPcb209WorkerProducerScopeList(await props("wrapper",b.wrapper),b.scriptId,"serial"),values=decodeCurrentPcb209WorkerProducerScopes(await props("scopes",scopes),"serial");need(values[0]!==undefined);
 z.strictObject({result:z.strictObject({type:z.literal("boolean"),value:z.literal(true)})}).parse(await send({phase:`${prefix}empty`,method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:values[0],functionDeclaration:QUEUE,arguments:[b.project,b.wrapper,b.callback].map(objectId=>({objectId})),returnByValue:true}}));
 const mode=arrayCapture(await send({phase:`${prefix}mode`,method:"Debugger.evaluateOnCallFrame",params:{objectGroup:FLAGS.objectGroup,silent:true,generatePreview:false,throwOnSideEffect:true,returnByValue:false,includeCommandLineAPI:false,callFrameId:b.frame,expression:"[jr]"}}),1),modeMembers=array(await props("mode",mode),1);const privateMode=remote.parse(modeMembers.get("0"));need(privateMode.type==="boolean"&&privateMode.value===false&&privateMode.objectId===undefined&&normal===42&&helpers===4);b.current();
 return Object.freeze({capture,extra,sourceRecordUpperBound:1,normal:42,helpers:4,cdpRequests:46,originalSingleChangeSubscriber:true,originalSingleHeadSubscriber:true,originalSerialClosureEmpty:true,originalNonprivateMode:false,uploadHeld:true,uploadResumed:false,publicationComplete:false,saveAuthorized:false});
}
