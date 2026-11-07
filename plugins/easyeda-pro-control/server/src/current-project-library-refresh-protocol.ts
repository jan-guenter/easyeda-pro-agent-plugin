/** Finite inert vocabulary. A purpose-specific original registry must retain
 * every selector and consume its durable intent before suspend or cancel. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_PROJECT_LIBRARY_REFRESH_PROGRAMS as PROGRAMS } from "./current-project-library-refresh-programs.ts";
import { CURRENT_PROJECT_LIBRARY_REFRESH_MODULE_EXPRESSION as MODULES, CURRENT_PROJECT_LIBRARY_REFRESH_SITES as SITES } from "./current-project-library-refresh-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PROJECT_LIBRARY_REFRESH_REQUESTS=Object.freeze({arms:7,moduleCapture:2,pristineCapture:2,capturedTuple:2,functionMetadata:13,frames:6,joins:6,effects:2,resumes:3,normal:43,helperSources:12,cdpRequests:55,cleanup:8,total:63,holds:3,bind:1,complete:1,controls:68,normalEvents:6});
export const CURRENT_PROJECT_LIBRARY_REFRESH_FLAGS=Object.freeze({silent:true,generatePreview:false,userGesture:false,awaitPromise:false,throwOnSideEffect:false,returnByValue:false,objectGroup:"easyeda-project-library-refresh209"} as const);
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const ref=z.strictObject({objectId:handle});
const flags={silent:z.literal(true),generatePreview:z.literal(false),userGesture:z.literal(false),awaitPromise:z.literal(false),throwOnSideEffect:z.literal(false),returnByValue:z.literal(false),objectGroup:z.literal("easyeda-project-library-refresh209")};
const location=z.strictObject({scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()});
const roles=["firstLoop","loopReturned","mountReturned","unexpectedAnimation","refreshTodo","refreshResume","refreshForce"] as const;
const normalRoles=["firstLoop","loopReturned","mountReturned"] as const;
const armRows=roles.map(role=>{const fixed=location.extend({lineNumber:z.literal(SITES[role].lineNumber),columnNumber:z.literal(SITES[role].columnNumber)});return z.strictObject({phase:z.literal("library-refresh-arm"),role:z.literal(role),method:z.literal("Debugger.setBreakpoint"),params:z.strictObject({location:fixed})});});
const [firstArm,...otherArms]=armRows;
const frameRows=normalRoles.map(role=>z.strictObject({phase:z.literal("library-refresh-frame"),role:z.literal(role),method:z.literal("Debugger.evaluateOnCallFrame"),params:z.strictObject({...flags,callFrameId:handle,expression:z.literal(SITES[role].expression)})}));
const [firstFrame,...otherFrames]=frameRows;
if(firstArm===undefined||firstFrame===undefined){throw new Error("PROJECT_LIBRARY_REFRESH_FIXED_ROSTER");}
const arm=z.discriminatedUnion("role",[firstArm,...otherArms]);
const frame=z.discriminatedUnion("role",[firstFrame,...otherFrames]);
const call=<const Phase extends string,Args extends z.ZodType,const Value extends boolean>(phase:Phase,program:string,args:Args,byValue:Value):z.ZodObject<{phase:z.ZodLiteral<Phase>;method:z.ZodLiteral<"Runtime.callFunctionOn">;params:z.ZodObject<Omit<typeof flags,"returnByValue">&{returnByValue:z.ZodLiteral<Value>;objectId:typeof handle;functionDeclaration:z.ZodLiteral<string>;arguments:Args},z.core.$strict>},z.core.$strict>=>z.strictObject({phase:z.literal(phase),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...flags,returnByValue:z.literal(byValue),objectId:handle,functionDeclaration:z.literal(program),arguments:args})});
const schemas=[arm,frame,
 z.strictObject({phase:z.literal("library-refresh-pristine"),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...flags,uniqueContextId:handle,functionDeclaration:z.literal(PROGRAMS.pristine),arguments:z.tuple([])})}),
 z.strictObject({phase:z.literal("library-refresh-modules"),method:z.literal("Debugger.evaluateOnCallFrame"),params:z.strictObject({...flags,callFrameId:handle,expression:z.literal(MODULES)})}),
 z.strictObject({phase:z.literal("library-refresh-properties"),tuple:z.enum(["pristine","modules","captured","firstLoopFrame","firstLoop","loopReturnedFrame","loopReturned","mountReturnedFrame"]),method:z.literal("Runtime.getProperties"),params:z.strictObject({objectId:handle,ownProperties:z.literal(true),accessorPropertiesOnly:z.literal(false),generatePreview:z.literal(false)})}),
 z.strictObject({phase:z.literal("library-refresh-function"),slot:z.number().int().min(1).max(13),method:z.literal("Runtime.getProperties"),params:z.strictObject({objectId:handle,ownProperties:z.literal(true),accessorPropertiesOnly:z.literal(false),generatePreview:z.literal(false)})}),
 call("library-refresh-capture",PROGRAMS.capture,z.tuple([ref]),false),call("library-refresh-first-loop",PROGRAMS.firstLoop,z.tuple([ref,ref]),false),
 call("library-refresh-suspend",PROGRAMS.suspend,z.tuple([]),true),call("library-refresh-loop-returned",PROGRAMS.loopReturned,z.tuple([ref]),false),
 call("library-refresh-cancel",PROGRAMS.cancel,z.tuple([]),true),call("library-refresh-mount-returned",PROGRAMS.mountReturned,z.tuple([ref]),true),call("library-refresh-reprove",PROGRAMS.reprove,z.tuple([]),true),
 z.strictObject({phase:z.literal("library-refresh-resume"),role:z.enum(normalRoles),method:z.literal("Debugger.resume"),params:z.strictObject({})}),
 z.strictObject({phase:z.literal("library-refresh-helper"),method:z.literal("Debugger.getScriptSource"),params:z.strictObject({scriptId:handle})}),
 z.strictObject({phase:z.literal("library-refresh-remove"),role:z.enum(roles),method:z.literal("Debugger.removeBreakpoint"),params:z.strictObject({breakpointId:handle})}),
 z.strictObject({phase:z.literal("library-refresh-release"),method:z.literal("Runtime.releaseObjectGroup"),params:z.strictObject({objectGroup:z.literal("easyeda-project-library-refresh209")})})] as const;
const schema=z.union(schemas);
export type CurrentProjectLibraryRefreshCommand=z.infer<typeof schema>;
export function validateCurrentProjectLibraryRefreshCommand(input:unknown):CurrentProjectLibraryRefreshCommand{return freezeDeep(schema.parse(captureCurrentPcbStringClockReply(input).value));}
export function currentProjectLibraryRefreshCases():readonly CurrentProjectLibraryRefreshCommand[]{
 const properties={objectId:"original",ownProperties:true,accessorPropertiesOnly:false,generatePreview:false} as const;
 const values:unknown[]=[{phase:"library-refresh-pristine",method:"Runtime.callFunctionOn",params:{...CURRENT_PROJECT_LIBRARY_REFRESH_FLAGS,uniqueContextId:"original",functionDeclaration:PROGRAMS.pristine,arguments:[]}},...roles.map(role=>({phase:"library-refresh-arm",role,method:"Debugger.setBreakpoint",params:{location:{scriptId:"original",lineNumber:SITES[role].lineNumber,columnNumber:SITES[role].columnNumber}}})),
 ...normalRoles.map(role=>({phase:"library-refresh-frame",role,method:"Debugger.evaluateOnCallFrame",params:{...CURRENT_PROJECT_LIBRARY_REFRESH_FLAGS,callFrameId:"original",expression:SITES[role].expression}})),
 {phase:"library-refresh-modules",method:"Debugger.evaluateOnCallFrame",params:{...CURRENT_PROJECT_LIBRARY_REFRESH_FLAGS,callFrameId:"original",expression:MODULES}},
 ...["pristine","modules","captured","firstLoopFrame","firstLoop","loopReturnedFrame","loopReturned","mountReturnedFrame"].map(tuple=>({phase:"library-refresh-properties",tuple,method:"Runtime.getProperties",params:properties})),
 ...Array.from({length:13},(_,index)=>({phase:"library-refresh-function",slot:index+1,method:"Runtime.getProperties",params:properties})),
 ...Object.entries(PROGRAMS).filter(([name])=>name!=="pristine").map(([name,program])=>{let phase=`library-refresh-${name}`;if(name==="firstLoop"){phase="library-refresh-first-loop";}if(name==="loopReturned"){phase="library-refresh-loop-returned";}if(name==="mountReturned"){phase="library-refresh-mount-returned";}let args:{objectId:string}[]=[];if(name==="capture"){args=[{objectId:"pristine"}];}if(name==="firstLoop"){args=[{objectId:"project"},{objectId:"capture"}];}if(name==="loopReturned"||name==="mountReturned"){args=[{objectId:"first_loop"}];}return{phase,method:"Runtime.callFunctionOn",params:{...CURRENT_PROJECT_LIBRARY_REFRESH_FLAGS,returnByValue:["suspend","cancel","mountReturned","reprove"].includes(name),objectId:"original",functionDeclaration:program,arguments:args}};}),
 ...normalRoles.map(role=>({phase:"library-refresh-resume",role,method:"Debugger.resume",params:{}})),{phase:"library-refresh-helper",method:"Debugger.getScriptSource",params:{scriptId:"original"}},
 ...roles.map(role=>({phase:"library-refresh-remove",role,method:"Debugger.removeBreakpoint",params:{breakpointId:"original"}})),{phase:"library-refresh-release",method:"Runtime.releaseObjectGroup",params:{objectGroup:"easyeda-project-library-refresh209"}}];
 return freezeDeep(values.map(value=>validateCurrentProjectLibraryRefreshCommand(value)));
}
