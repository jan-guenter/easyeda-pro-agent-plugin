/** Resume only the original serialization chain; stop before upload parsing. */
import {z} from "zod";
import type {DiagnosticEvent} from "./current-pcb-diagnostic-protocol.ts";
import {decodeCurrentFootprintCopyClockRpcV2Array as array,currentFootprintCopyClockRpcV2ArrayObject as objectAt,decodeCurrentFootprintCopyClockRpcV2ArrayCapture as result} from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SERIALIZATION_PROGRAMS as PROGRAMS} from "./current-footprint-inverse-native-delete-serialization-programs.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SERIALIZATION_FLAGS as FLAGS,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SERIALIZATION_GROUP as GROUP, currentFootprintInverseNativeDeleteSerializationExpression as expression,validateCurrentFootprintInverseNativeDeleteSerializationCommand as validate} from "./current-footprint-inverse-native-delete-serialization-protocol.ts";
import type {CurrentFootprintInverseNativeDeleteSerializationCommand as Command,currentFootprintInverseNativeDeleteSerializationExpectedSchema as ExpectedSchema} from "./current-footprint-inverse-native-delete-serialization-protocol.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SERIALIZATION_FRAME_LENGTHS as LENGTHS,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SERIALIZATION_ORDER as ROLES,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SERIALIZATION_SITES as SITES} from "./current-footprint-inverse-native-delete-serialization-profile.ts";
import {currentFootprintInverseNativeDeleteSerializationNative as native,currentFootprintInverseNativeDeleteSerializationPause as pause,currentFootprintInverseNativeDeleteSerializationPromise as promise} from "./current-footprint-inverse-native-delete-serialization-replies.ts";

type Role=typeof ROLES[number];
export interface CurrentFootprintInverseNativeDeleteSerializationBindings{
 readonly originalUploadPoint:string;readonly intrinsics:string;readonly accepted:string;readonly initial:DiagnosticEvent;readonly scriptId:string;readonly sessionId:string;
 readonly expected:Readonly<z.infer<typeof ExpectedSchema>>;readonly texts:readonly[string,string,string];
 readonly current:()=>void;readonly request:(command:Command)=>Promise<unknown>;readonly qualifyHelper:(command:Command)=>Promise<void>;
 readonly retainPoint:(role:Role,point:string)=>void;readonly next:(role:Role)=>Promise<DiagnosticEvent>;
 readonly resume:(role:"begin"|Exclude<Role,"uploadEntry">)=>Promise<void>;readonly control:(phase:"armed"|"complete")=>Promise<void>;
}
export interface CurrentFootprintInverseNativeDeleteSerializationData{
 readonly uploadEvent:DiagnosticEvent;readonly bundle:string;readonly upload:string;readonly caller:string;readonly retainedPromise:string;
 readonly ticket:number;readonly bodySha256:string;readonly normal:53;readonly helpers:16;readonly resumes:6;
 readonly originalDeleteStringPromiseFulfilled:true;readonly uploadHeld:true;readonly uploadResumed:false;readonly publicationComplete:false;readonly saveAuthorized:false;
}
function need(ok:boolean):asserts ok{if(!ok){throw new Error("INVERSE_NATIVE_DELETE_SERIALIZATION_SEQUENCE");}}
export async function observeCurrentFootprintInverseNativeDeleteSerialization(b:CurrentFootprintInverseNativeDeleteSerializationBindings,bodySha256:string):Promise<Readonly<CurrentFootprintInverseNativeDeleteSerializationData>>{
 let helpers=0,normal=0;const points=new Map<Role,string>();const empty=z.strictObject({});
 const send=async(input:unknown):Promise<unknown>=>{b.current();const c=validate(input);need((normal += 1)<=53);const raw=await b.request(c);b.current();if(c.method==="Runtime.callFunctionOn"||c.method==="Debugger.evaluateOnCallFrame"){need((helpers += 1)<=16);await b.qualifyHelper(c);b.current();}return raw;};
 const props=(role:Extract<Command,{method:"Runtime.getProperties"}>["role"],objectId:string):Promise<unknown>=>send({phase:"inverse-native-delete-serialization-properties",role,method:"Runtime.getProperties",params:{objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}});
 const tuple=async(role:keyof typeof PROGRAMS,id:string,args:readonly unknown[],count:number,propertyRole:Extract<Command,{method:"Runtime.getProperties"}>["role"]):Promise<Readonly<{id:string;fields:ReturnType<typeof array>}>>=>{
 const captured=result(await send({phase:"inverse-native-delete-serialization-call",role,method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:id,functionDeclaration:PROGRAMS[role],arguments:args,returnByValue:false}}),count);
 return Object.freeze({id:captured,fields:array(await props(propertyRole,captured),count)});};
 const frame=async(role:"begin"|Role,event:DiagnosticEvent):Promise<string>=>{b.current();const held=pause(event,role,b.sessionId,b.scriptId,role==="begin"?null:points.get(role)??"");
 return result(await send({phase:"inverse-native-delete-serialization-frame",role,method:"Debugger.evaluateOnCallFrame",params:{callFrameId:held.frame,expression:expression(role),objectGroup:GROUP,silent:true,generatePreview:false,throwOnSideEffect:true,returnByValue:false,includeCommandLineAPI:false}}),LENGTHS[role]);};
 const environment=await tuple("environment",b.intrinsics,[],8,"environment");
 for(const [index,role]of(["push","join","stringify","string","promise","then","self"]as const).entries()){native(await props(role,objectAt(environment.fields,index)),role);}
 const begin=await tuple("begin",await frame("begin",b.initial),[{objectId:b.accepted},{value:b.expected},{value:b.texts},{objectId:environment.id}],8,"begin");
 const originalPoint=async(role:"before"|"held"):Promise<void>=>{const site=SITES.uploadEntry;const location=z.strictObject({scriptId:z.literal(b.scriptId),lineNumber:z.literal(site.lineNumber),columnNumber:z.literal(site.columnNumber),type:z.literal("call")});z.strictObject({locations:z.tuple([location])}).parse(await send({phase:"inverse-native-delete-serialization-original-point",role,method:"Debugger.getPossibleBreakpoints",params:{start:{scriptId:b.scriptId,lineNumber:site.lineNumber,columnNumber:site.columnNumber},end:{scriptId:b.scriptId,lineNumber:site.lineNumber,columnNumber:site.columnNumber+1},restrictToFunction:true}}));};
 for(const role of ROLES){if(role==="uploadEntry"){await originalPoint("before");need(![...points.values()].includes(b.originalUploadPoint));points.set(role,b.originalUploadPoint);b.retainPoint(role,b.originalUploadPoint);}else{const site=SITES[role];const p=z.strictObject({breakpointId:z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u),actualLocation:z.strictObject({scriptId:z.literal(b.scriptId),lineNumber:z.literal(site.lineNumber),columnNumber:z.literal(site.columnNumber)})}).parse(await send({phase:"inverse-native-delete-serialization-arm",role,method:"Debugger.setBreakpoint",params:{location:{scriptId:b.scriptId,lineNumber:site.lineNumber,columnNumber:site.columnNumber},condition:""}}));
 need(![...points.values()].includes(p.breakpointId));points.set(role,p.breakpointId);b.retainPoint(role,p.breakpointId);}}
 need(normal===18&&helpers===3);await b.control("armed");b.current();await b.resume("begin");b.current();normal += 1;
 let caller:string|null=null,originalPromise:string|null=null,returned:string|null=null,setter:string|null=null,upload:string|null=null,uploadEvent:DiagnosticEvent|null=null;
 for(const role of ROLES){b.current();const event=await b.next(role);b.current();const f=await frame(role,event);const args:unknown[]=[{objectId:begin.id}];
 if(role==="setterReturned"){need(setter!==null);args.push({objectId:setter});}
 if(role==="stringReturned"){const held=pause(event,role,b.sessionId,b.scriptId,points.get(role)??"");need(held.returned!==null);const retained=await tuple("retainReturn",held.returned,[],3,"retained");originalPromise=objectAt(retained.fields,0);native(await props("returned-constructor",objectAt(retained.fields,2)),"promise");args.push({objectId:retained.id});}
 if(role==="callerReady"){need(returned!==null&&originalPromise!==null);args.push({objectId:returned},{objectId:originalPromise});}
 if(role==="uploadEntry"){need(caller!==null);args.push({objectId:caller});}
 const t=await tuple(role,f,args,role==="stringReturned"||role==="uploadEntry"?3:2,role);
 if(role==="setterEntry"){setter=t.id;}else if(role==="stringReturned"){returned=t.id;need(originalPromise!==null);promise(await props("fulfilled-before",originalPromise),b.texts[2]);}
 else if(role==="callerReady"){caller=t.id;need(originalPromise!==null);promise(await props("fulfilled-after",originalPromise),b.texts[2]);}
 else if(role==="uploadEntry"){upload=t.id;uploadEvent=event;}
 if(role!=="uploadEntry"){await b.resume(role);b.current();normal += 1;}
 }
 for(const role of ROLES){if(role==="uploadEntry"){await originalPoint("held");}else{const point=points.get(role);need(point!==undefined);empty.parse(await send({phase:"inverse-native-delete-serialization-remove",role,method:"Debugger.removeBreakpoint",params:{breakpointId:point}}));}}
 need(normal===53&&{helpers}.helpers===16&&uploadEvent!==null&&upload!==null&&caller!==null&&originalPromise!==null);await b.control("complete");b.current();
 return Object.freeze({uploadEvent,bundle:begin.id,upload,caller,retainedPromise:originalPromise,ticket:b.expected.maximumTicket+1,bodySha256,normal:53,helpers:16,resumes:6,originalDeleteStringPromiseFulfilled:true,uploadHeld:true,uploadResumed:false,publicationComplete:false,saveAuthorized:false});
}
