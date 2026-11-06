/** Deliberate one-shot session mutation, never a general timer API. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_PROJECT_SYNC_QUIESCE_PROGRAMS as PROGRAMS } from "./current-project-sync-quiesce-programs.ts";
import { CURRENT_PROJECT_SYNC_QUIESCE_ENTRY_CONDITION as CONDITION,CURRENT_PROJECT_SYNC_QUIESCE_SITES as SITES } from "./current-project-sync-quiesce-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export { CURRENT_PROJECT_SYNC_QUIESCE_ENTRY_CONDITION } from "./current-project-sync-quiesce-source.ts";
export const CURRENT_PROJECT_SYNC_QUIESCE_GROUP="easyeda-project-sync-quiesce209-v1";
export const CURRENT_PROJECT_SYNC_QUIESCE_CAPTURE_LENGTH=20;
export const CURRENT_PROJECT_SYNC_QUIESCE_NATIVE_PROFILES=freezeDeep([
  {index:1,name:"setTimeout",arity:1,constructor:false},{index:2,name:"clearTimeout",arity:0,constructor:false},
  {index:3,name:"getOwnPropertyDescriptor",arity:2,constructor:false},{index:4,name:"getPrototypeOf",arity:1,constructor:false},{index:5,name:"hasOwn",arity:2,constructor:false},
  {index:6,name:"apply",arity:3,constructor:false},{index:7,name:"toString",arity:0,constructor:false},{index:8,name:"isArray",arity:1,constructor:false},{index:9,name:"isSafeInteger",arity:1,constructor:false},{index:10,name:"freeze",arity:1,constructor:false},{index:11,name:"is",arity:2,constructor:false},
  {index:12,name:"WorkerGlobalScope",arity:0,constructor:true,parentDescription:"function EventTarget() { [native code] }"},{index:13,name:"EventTarget",arity:0,constructor:true},
]);
export const CURRENT_PROJECT_SYNC_QUIESCE_REQUESTS=Object.freeze({capture:1,properties:3,nativeMetadata:13,calleeMetadata:1,arms:2,frames:2,joins:2,cancel:1,remove:1,resumes:2,cdpRequests:28,setupHelperSources:1,events:4,completionControls:1});
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u),ref=z.strictObject({objectId:handle});
const flags={objectGroup:z.literal(CURRENT_PROJECT_SYNC_QUIESCE_GROUP),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true),awaitPromise:z.literal(false),userGesture:z.literal(false)};
export const CURRENT_PROJECT_SYNC_QUIESCE_FLAGS=Object.freeze({objectGroup:CURRENT_PROJECT_SYNC_QUIESCE_GROUP,silent:true,generatePreview:false,throwOnSideEffect:true,awaitPromise:false,userGesture:false} as const);
export const CURRENT_PROJECT_SYNC_QUIESCE_FRAME_FLAGS=Object.freeze({objectGroup:CURRENT_PROJECT_SYNC_QUIESCE_GROUP,silent:true,generatePreview:false,throwOnSideEffect:true,returnByValue:false,includeCommandLineAPI:false} as const);
const position=z.strictObject({scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()});
const index=z.union(CURRENT_PROJECT_SYNC_QUIESCE_NATIVE_PROFILES.map(profile=>z.literal(profile.index)));
const schemas=[
  z.strictObject({phase:z.literal("sync-quiesce-capture"),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...flags,uniqueContextId:handle,functionDeclaration:z.literal(PROGRAMS.capture),arguments:z.tuple([]),returnByValue:z.literal(false)})}),
  z.strictObject({phase:z.literal("sync-quiesce-properties"),role:z.enum(["capture","entry","returned"]),method:z.literal("Runtime.getProperties"),params:z.strictObject({objectId:handle,ownProperties:z.literal(true),accessorPropertiesOnly:z.literal(false),generatePreview:z.literal(false)})}),
  z.strictObject({phase:z.literal("sync-quiesce-native"),index,method:z.literal("Runtime.getProperties"),params:z.strictObject({objectId:handle,ownProperties:z.literal(true),accessorPropertiesOnly:z.literal(false),generatePreview:z.literal(false)})}),
  z.strictObject({phase:z.literal("sync-quiesce-callee"),method:z.literal("Runtime.getProperties"),params:z.strictObject({objectId:handle,ownProperties:z.literal(true),accessorPropertiesOnly:z.literal(false),generatePreview:z.literal(false)})}),
  z.strictObject({phase:z.literal("sync-quiesce-arm"),role:z.enum(["entry","returned"]),method:z.literal("Debugger.setBreakpoint"),params:z.strictObject({location:position,condition:z.string()})}),
  z.strictObject({phase:z.literal("sync-quiesce-frame"),role:z.enum(["entry","returned"]),method:z.literal("Debugger.evaluateOnCallFrame"),params:z.strictObject({objectGroup:z.literal(CURRENT_PROJECT_SYNC_QUIESCE_GROUP),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true),returnByValue:z.literal(false),includeCommandLineAPI:z.literal(false),callFrameId:handle,expression:z.literal("[this]")})}),
  z.strictObject({phase:z.literal("sync-quiesce-entry"),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...flags,objectId:handle,functionDeclaration:z.literal(PROGRAMS.entry),arguments:z.tuple([ref,ref]),returnByValue:z.literal(false)})}),
  z.strictObject({phase:z.literal("sync-quiesce-returned"),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...flags,objectId:handle,functionDeclaration:z.literal(PROGRAMS.returned),arguments:z.tuple([ref]),returnByValue:z.literal(false)})}),
  z.strictObject({phase:z.literal("sync-quiesce-cancel"),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...flags,throwOnSideEffect:z.literal(false),objectId:handle,functionDeclaration:z.literal(PROGRAMS.cancel),arguments:z.tuple([]),returnByValue:z.literal(true)})}),
  z.strictObject({phase:z.literal("sync-quiesce-remove-returned"),method:z.literal("Debugger.removeBreakpoint"),params:z.strictObject({breakpointId:handle})}),
  z.strictObject({phase:z.literal("sync-quiesce-resume"),role:z.enum(["entry","returned"]),method:z.literal("Debugger.resume"),params:z.strictObject({})}),
] as const;
const schema=z.union(schemas);
export type CurrentProjectSyncQuiesceCommand=z.infer<typeof schema>;
export function validateCurrentProjectSyncQuiesceCommand(input:unknown):CurrentProjectSyncQuiesceCommand {
  const command=schema.parse(captureCurrentPcbStringClockReply(input).value);
  if(command.phase==="sync-quiesce-arm"){const site=SITES[command.role];if(command.params.location.lineNumber!==site.lineNumber||command.params.location.columnNumber!==site.columnNumber||command.params.condition!==(command.role==="entry"?CONDITION:"")) { throw new Error("PROJECT_SYNC_QUIESCE_FIXED_ARM"); }}return freezeDeep(command);
}
const properties=(objectId:string):Readonly<{objectId:string;ownProperties:true;accessorPropertiesOnly:false;generatePreview:false}>=>({objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false});
export function currentProjectSyncQuiesceNativeCases():readonly CurrentProjectSyncQuiesceCommand[] {
  const cases:unknown[]=[{phase:"sync-quiesce-capture",method:"Runtime.callFunctionOn",params:{...CURRENT_PROJECT_SYNC_QUIESCE_FLAGS,uniqueContextId:"worker_context",functionDeclaration:PROGRAMS.capture,arguments:[],returnByValue:false}},{phase:"sync-quiesce-properties",role:"capture",method:"Runtime.getProperties",params:properties("original_capture")}];
  for(const profile of CURRENT_PROJECT_SYNC_QUIESCE_NATIVE_PROFILES){cases.push({phase:"sync-quiesce-native",index:profile.index,method:"Runtime.getProperties",params:properties("original_native")});}
  for(const role of ["entry","returned"] as const){const site=SITES[role];cases.push({phase:"sync-quiesce-arm",role,method:"Debugger.setBreakpoint",params:{location:{scriptId:"project_script",lineNumber:site.lineNumber,columnNumber:site.columnNumber},condition:role==="entry"?CONDITION:""}});}
  cases.push({phase:"sync-quiesce-frame",role:"entry",method:"Debugger.evaluateOnCallFrame",params:{...CURRENT_PROJECT_SYNC_QUIESCE_FRAME_FLAGS,callFrameId:"original_frame",expression:"[this]"}},
    {phase:"sync-quiesce-entry",method:"Runtime.callFunctionOn",params:{...CURRENT_PROJECT_SYNC_QUIESCE_FLAGS,objectId:"entry_frame",functionDeclaration:PROGRAMS.entry,arguments:[{objectId:"original_project"},{objectId:"original_capture"}],returnByValue:false}},
    {phase:"sync-quiesce-properties",role:"entry",method:"Runtime.getProperties",params:properties("original_entry")},{phase:"sync-quiesce-callee",method:"Runtime.getProperties",params:properties("original_method")},{phase:"sync-quiesce-resume",role:"entry",method:"Debugger.resume",params:{}},
    {phase:"sync-quiesce-frame",role:"returned",method:"Debugger.evaluateOnCallFrame",params:{...CURRENT_PROJECT_SYNC_QUIESCE_FRAME_FLAGS,callFrameId:"original_frame",expression:"[this]"}},
    {phase:"sync-quiesce-returned",method:"Runtime.callFunctionOn",params:{...CURRENT_PROJECT_SYNC_QUIESCE_FLAGS,objectId:"returned_frame",functionDeclaration:PROGRAMS.returned,arguments:[{objectId:"original_entry"}],returnByValue:false}},
    {phase:"sync-quiesce-properties",role:"returned",method:"Runtime.getProperties",params:properties("original_returned")},
    {phase:"sync-quiesce-cancel",method:"Runtime.callFunctionOn",params:{...CURRENT_PROJECT_SYNC_QUIESCE_FLAGS,throwOnSideEffect:false,objectId:"original_returned",functionDeclaration:PROGRAMS.cancel,arguments:[],returnByValue:true}},
    {phase:"sync-quiesce-remove-returned",method:"Debugger.removeBreakpoint",params:{breakpointId:"returned_point"}},{phase:"sync-quiesce-resume",role:"returned",method:"Debugger.resume",params:{}});
  return freezeDeep(cases.map(value=>validateCurrentProjectSyncQuiesceCommand(value)));
}
