/** Original M8 -> yw custody. The first reference await stays held. */
import { CURRENT_FOOTPRINT_INVERSE_REFERENCE_ENTRY_CALLS as CALLS,CURRENT_FOOTPRINT_INVERSE_REFERENCE_ENTRY_FLAGS as FLAGS,validateCurrentFootprintInverseReferenceEntryCommand as validate } from "./current-footprint-inverse-reference-entry-protocol.ts";
import type { CurrentFootprintInverseReferenceEntryCommand as Command } from "./current-footprint-inverse-reference-entry-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_REFERENCE_ENTRY_EXPRESSIONS as EXPRESSIONS,CURRENT_FOOTPRINT_INVERSE_REFERENCE_ENTRY_POINT as POINT } from "./current-footprint-inverse-reference-entry-programs.ts";
import { currentFootprintInverseLookupArray as array,currentFootprintInverseLookupObject as object,currentFootprintInverseLookupPoint as point,currentFootprintInverseLookupProperties as properties,currentFootprintInverseLookupResult as result } from "./current-footprint-inverse-lookup-preentry-replies.ts";
import { requireCurrentFootprintInversePublicServiceDescription as description,decodeCurrentFootprintInversePublicServiceFunction as metadata,requireCurrentFootprintInversePublicServiceTrue as truth } from "./current-footprint-inverse-public-service-replies.ts";
import { currentSchematicRelevanceRawNativeConstructor as constructor } from "./current-schematic-relevance-action-raw-replies.ts";
import { currentFootprintInverseLookupNativeCallable as callable } from "./current-footprint-inverse-lookup-native-metadata.ts";
import { decodeCurrentNativeFunctionMetadata as native } from "./current-native-function-metadata.ts";
import { continueCurrentFootprintInverseReference } from "./current-footprint-inverse-reference-continuation.ts";

export interface CurrentFootprintInverseReferenceEntryBindings{
 readonly receipt:string;readonly original:string;readonly rowGuard:string;readonly frame:string;readonly uiScriptId:string;readonly oldPoint:string;
 readonly nativeRoots:string;readonly nativeMembers:string;readonly nativeQualified:string;readonly iteratorProof:string;
 readonly target:Readonly<{projectUuid:string;branchUuid:string;documentUuid:string}>;
 readonly current:()=>void;readonly request:(command:Command)=>Promise<unknown>;
 readonly control:(phase:"bind"|"prepared"|"armed"|"resumed"|"held"|"complete",fields?:Readonly<Record<string,string>>)=>Promise<void>;
 readonly wait:(breakpoint:string)=>Promise<Readonly<{frame:string;caller:string}>>;
}
function need(value:boolean):asserts value{if(!value){throw new Error("INVERSE_REFERENCE_ENTRY_COLLECTOR");}}
/** Join the original M8 and yw entry objects and retain the first reference await; later queries and deletion require separate continuations. */
export async function collectCurrentFootprintInverseReferenceEntry(b:CurrentFootprintInverseReferenceEntryBindings):Promise<Readonly<{m8:string;entry:string;caller:string;native:string;selected:string;point:string;rowGuard:string}>>{
 const props=async(objectId:string):Promise<unknown>=>{b.current();const raw=await b.request({phase:"inverse-reference-entry-properties",method:"Runtime.getProperties",params:{objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}});b.current();return raw;};
 const call=async(role:keyof typeof CALLS,refs:readonly string[],target=false):Promise<unknown>=>{const row=CALLS[role];const args:unknown[]=refs.map(objectId=>({objectId}));if(target){args.push({value:b.target});}b.current();const raw=await b.request(validate({phase:"inverse-reference-entry-call",role,method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:b.receipt,functionDeclaration:row.program,arguments:args,returnByValue:row.byValue}}));b.current();return raw;};
 const tuple=async(role:keyof typeof CALLS,refs:readonly string[],size:number):Promise<string>=>result(await call(role,refs),size);
 const frame=async(role:keyof typeof EXPRESSIONS,callFrameId:string,size:number):Promise<string>=>{b.current();const raw=await b.request({phase:"inverse-reference-entry-frame",role,method:"Debugger.evaluateOnCallFrame",params:{callFrameId,expression:EXPRESSIONS[role],objectGroup:FLAGS.objectGroup,silent:true,generatePreview:false,throwOnSideEffect:true,returnByValue:false,includeCommandLineAPI:false}});b.current();return result(raw,size);};
 await b.control("bind");truth(await call("nativeInstance",[b.nativeRoots,b.nativeMembers,b.nativeQualified]));truth(await call("nativeHooks",[b.nativeRoots,b.nativeMembers]));truth(await call("rowReprove",[b.rowGuard]));
 const m8=await frame("m8",b.frame,12);const values=array(await props(m8),12);truth(await call("select",[m8,b.original]));
 const roles=["projectPath","deleteHelper","referenceLabels","pcbReferences","schematicReferences","derivedReferences","deviceReferences"]as const;
 for(const[index,role]of roles.entries()){const fn=values[index<2?index+4:index+5];need(fn?.type==="function"&&typeof fn.description==="string");description(fn.description,role);metadata(await props(object(fn)),role,b.uiScriptId);}
 const set=values[6];need(set!==undefined);callable(set,"Set");const setPrototype=constructor(await props(object(set)),"Set");properties(await props(setPrototype));const prototype=await tuple("prototype",[m8],1);const prototypeValues=array(await props(prototype),1);need(prototypeValues[0]!==undefined);properties(await props(object(prototypeValues[0])));const nativeMembers=await tuple("members",[prototype],3);const members=array(await props(nativeMembers),3);const nativeRoles=[{name:"add",arity:1},{name:"get size",arity:0},{name:"forEach",arity:1}]as const;
 for(const[index,role]of nativeRoles.entries()){const fn=members[index];need(fn!==undefined);callable(fn,role.name);native(await props(object(fn)),{...role,constructor:false});}
 const nativeProof=await tuple("native",[m8,prototype,nativeMembers,b.nativeRoots,b.nativeMembers,b.iteratorProof],6);array(await props(nativeProof),6);truth(await call("before",[m8,b.original,nativeProof],true));
 await b.control("prepared",{scriptId:b.uiScriptId});const breakpoint=point(await b.request({phase:"inverse-reference-entry-arm",method:"Debugger.setBreakpoint",params:{location:{scriptId:b.uiScriptId,lineNumber:POINT.lineNumber,columnNumber:POINT.columnNumber},condition:""}}));await b.control("armed",{breakpointId:breakpoint});
 const held=await continueCurrentFootprintInverseReference({current:():void=>{b.current();},remove:()=>b.request({phase:"inverse-reference-entry-remove",method:"Debugger.removeBreakpoint",params:{breakpointId:b.oldPoint}}),resume:()=>b.request({phase:"inverse-reference-entry-resume",method:"Debugger.resume",params:{}}),wait:()=>b.wait(breakpoint)});b.current();await b.control("resumed");await b.control("held");
 const entry=await frame("entry",held.frame,10);const entryValues=array(await props(entry),10);const selected=entryValues[6];need(selected!==undefined);properties(await props(object(selected)));const caller=await frame("caller",held.caller,7);array(await props(caller),7);truth(await call("rowReprove",[b.rowGuard]));const selectedTuple=result(await call("entry",[entry,m8,caller,nativeProof],true),1);array(await props(selectedTuple),1);await b.control("complete");b.current();
 return Object.freeze({m8,entry,caller,native:nativeProof,selected:object(selected),point:breakpoint,rowGuard:b.rowGuard});
}
