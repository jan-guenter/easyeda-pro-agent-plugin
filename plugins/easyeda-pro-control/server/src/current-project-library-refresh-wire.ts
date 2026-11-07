/** One immutable encoder for separately issued purpose ledgers. Session and
 * context remain original native substitutions, never public selectors. */
import { canonicalJson } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { currentProjectLibraryRefreshCases,validateCurrentProjectLibraryRefreshCommand } from "./current-project-library-refresh-protocol.ts";
import type { CurrentProjectLibraryRefreshCommand } from "./current-project-library-refresh-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export function currentProjectLibraryRefreshTemplate(input:unknown):Readonly<{phase:string;method:string;fields:readonly string[];values:Readonly<Record<string,string>>;template:string}>{
 const command=validateCurrentProjectLibraryRefreshCommand(input),values:Record<string,string>={};const field=(name:string,value:string):string=>{if(Object.hasOwn(values,name)){throw new Error("PROJECT_LIBRARY_REFRESH_FIELD_ALIAS");}values[name]=value;return`__library_refresh_${name}__`;};
 const params:Record<string,unknown>={...command.params};
 if(command.phase==="library-refresh-pristine"){params["uniqueContextId"]="__library_refresh_boundContext__";}
 else if(command.phase==="library-refresh-arm"){params["location"]={...command.params.location,scriptId:field("scriptId",command.params.location.scriptId)};}
 else if(command.method==="Debugger.evaluateOnCallFrame"){params["callFrameId"]=field("callFrameId",command.params.callFrameId);}
 else if(command.method==="Debugger.getScriptSource"){params["scriptId"]=field("scriptId",command.params.scriptId);}
 else if(command.method==="Debugger.removeBreakpoint"){params["breakpointId"]=field("breakpointId",command.params.breakpointId);}
 else if(command.method==="Runtime.getProperties"||command.method==="Runtime.callFunctionOn"){params["objectId"]=field("objectId",command.params.objectId);}
 if(command.method==="Runtime.callFunctionOn"){params["arguments"]=command.params.arguments.map((argument,index)=>({objectId:field(`argument${String(index)}`,argument.objectId)}));}
 let suffix:string|null=null;if("role"in command){suffix=command.role;}else if("slot"in command){suffix=String(command.slot);}else if("tuple"in command){suffix=command.tuple;}
 return freezeDeep({phase:command.phase+(suffix===null?"":`-${suffix}`),method:command.method,fields:Object.keys(values),values,template:JSON.stringify({method:command.method,params})});
}
export function currentProjectLibraryRefreshTemplates():readonly ReturnType<typeof currentProjectLibraryRefreshTemplate>[]{return freezeDeep(currentProjectLibraryRefreshCases().map(command=>currentProjectLibraryRefreshTemplate(command)));}
/** Exact observer order, excluding the twelve correlated helper receipts. */
export function currentProjectLibraryRefreshOrder():readonly string[]{return Object.freeze([
 "library-refresh-pristine","library-refresh-properties-pristine",...["firstLoop","loopReturned","mountReturned","unexpectedAnimation","refreshTodo","refreshResume","refreshForce"].map(role=>`library-refresh-arm-${role}`),
 "library-refresh-modules","library-refresh-properties-modules","library-refresh-capture","library-refresh-properties-captured",...Array.from({length:13},(_,index)=>`library-refresh-function-${String(index+1)}`),
 "library-refresh-frame-firstLoop","library-refresh-properties-firstLoopFrame","library-refresh-first-loop","library-refresh-properties-firstLoop","library-refresh-suspend","library-refresh-resume-firstLoop",
 "library-refresh-frame-loopReturned","library-refresh-properties-loopReturnedFrame","library-refresh-loop-returned","library-refresh-properties-loopReturned","library-refresh-cancel","library-refresh-resume-loopReturned",
 "library-refresh-frame-mountReturned","library-refresh-properties-mountReturnedFrame","library-refresh-mount-returned","library-refresh-resume-mountReturned","library-refresh-reprove"
]);}
export interface CurrentProjectLibraryRefreshObservationStep {readonly phase:CurrentProjectLibraryRefreshCommand["phase"];readonly role?:Extract<CurrentProjectLibraryRefreshCommand,{phase:"library-refresh-arm"}>["role"];readonly tuple?:Extract<CurrentProjectLibraryRefreshCommand,{phase:"library-refresh-properties"}>["tuple"];readonly slot?:number}
const commands=currentProjectLibraryRefreshCases();
export const CURRENT_PROJECT_LIBRARY_REFRESH_OBSERVATION_STEPS:readonly CurrentProjectLibraryRefreshObservationStep[]=freezeDeep(currentProjectLibraryRefreshOrder().map(phase=>{
 const matches=commands.filter(command=>currentProjectLibraryRefreshTemplate(command).phase===phase);const command=matches[0];if(matches.length!==1||command===undefined){throw new Error("PROJECT_LIBRARY_REFRESH_FIXED_ORDER");}
 const row:CurrentProjectLibraryRefreshObservationStep={phase:command.phase};if("role"in command){Object.assign(row,{role:command.role});}if("tuple"in command){Object.assign(row,{tuple:command.tuple});}if("slot"in command){Object.assign(row,{slot:command.slot});}return row;
}));
export function currentProjectLibraryRefreshEnvelope(input:CurrentProjectLibraryRefreshCommand,id:number,sessionId:string):CurrentProjectLibraryRefreshCommand&Readonly<{id:number;sessionId:string;libraryRefresh:true}>{
 if(!Number.isSafeInteger(id)||id<1||id>2_147_483_647||!/^[A-Za-z\d_.:-]{1,256}$(?![\s\S])/u.test(sessionId)){throw new Error("PROJECT_LIBRARY_REFRESH_WIRE");}return freezeDeep({...validateCurrentProjectLibraryRefreshCommand(input),id,sessionId,libraryRefresh:true});
}
export function currentProjectLibraryRefreshWire(input:unknown,id:number,action:"footprint-inverse-library-refresh"|"schematic-relevance-library-refresh"):Readonly<{command:CurrentProjectLibraryRefreshCommand;request:Readonly<Record<string,string|number>>}>{
 if(!Number.isSafeInteger(id)||id<1||id>2_147_483_647||(action!=="footprint-inverse-library-refresh"&&action!=="schematic-relevance-library-refresh")){throw new Error("PROJECT_LIBRARY_REFRESH_REQUEST");}const command=validateCurrentProjectLibraryRefreshCommand(input),row=currentProjectLibraryRefreshTemplate(command);return freezeDeep({command,request:{action,requestId:id,phase:row.phase,method:row.method,...row.values}});
}
/** An adapter adds only its own fixed action after this exact original frame. */
export function currentProjectLibraryRefreshNativeFrame(chunk:Buffer,input:CurrentProjectLibraryRefreshCommand,sessionId:string):Readonly<Record<string,string|number>>{
 if(chunk.length>65_536||chunk.at(-1)!==0){throw new Error("PROJECT_LIBRARY_REFRESH_FRAME");}const parsed:unknown=JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(chunk.subarray(0,-1))),raw=captureCurrentPcbStringClockReply(parsed).value;
 if(raw===null||typeof raw!=="object"||!("id"in raw)||typeof raw.id!=="number"){throw new Error("PROJECT_LIBRARY_REFRESH_FRAME");}const expected=currentProjectLibraryRefreshEnvelope(input,raw.id,sessionId);if(canonicalJson(expected)!==canonicalJson(raw)||chunk.toString("utf8")!==`${JSON.stringify(expected)}\0`){throw new Error("PROJECT_LIBRARY_REFRESH_FRAME");}
 const row=currentProjectLibraryRefreshTemplate(input);return freezeDeep({requestId:raw.id,phase:row.phase,method:row.method,...row.values});
}
