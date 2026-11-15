/** Fixed complete-only natural ticket observer. No call invokes a timer,
 * cancels one, publishes a bus message or accepts caller JavaScript. */
import {z} from "zod";
import {captureCurrentPcbStringClockReply} from "./current-pcb-string-clock-reply.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";
import {CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_METHOD_METADATA as METHODS,CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_NATIVE_METADATA as NATIVES,CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_BINDING_PROGRAMS as PROGRAMS} from "./current-footprint-forward-writer-ticket-timer-bindings.ts";
import {CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_SITES as SITES} from "./current-footprint-forward-writer-ticket-timer-source.ts";

export const CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_FLAGS=Object.freeze({objectGroup:"easyeda-forward-writer-ticket-timer-v1",silent:true,generatePreview:false,throwOnSideEffect:true,awaitPromise:false,userGesture:false}as const);
export const CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_FRAME_FLAGS=Object.freeze({objectGroup:"easyeda-forward-writer-ticket-timer-v1",silent:true,generatePreview:false,throwOnSideEffect:true,returnByValue:false,includeCommandLineAPI:false}as const);
export const CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_SELF_CONDITION='e.type==="PUBLISH"&&e.topic==="/pro-mgr/project/ticket"';
const handle=z.string().regex(/^[A-Za-z0-9_.:-]{1,256}$/u),ref=z.strictObject({objectId:handle});
const flags={objectGroup:z.literal(CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true),awaitPromise:z.literal(false),userGesture:z.literal(false)};
const props=z.strictObject({objectId:handle,ownProperties:z.literal(true),accessorPropertiesOnly:z.literal(false),generatePreview:z.literal(false)});
const roles=["entry","returned","selfReturned"]as const;
const argumentsFor=(count:number):z.ZodArray<typeof ref>=>z.array(ref).length(count);
const programs=["capture","binding","baseline","before","entry","returned","selfReturned","slot"]as const;
const args=Object.freeze({capture:3,binding:1,baseline:2,before:3,entry:4,returned:4,selfReturned:4,slot:3});
const byValue=Object.freeze({capture:false,binding:false,baseline:false,before:true,entry:false,returned:true,selfReturned:true,slot:true});
const position=z.strictObject({scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()});
/* oxlint-disable unicorn/max-nested-calls -- The closed roles retain each literal program, frame expression and parameter list at the native boundary. */
const schema=z.union([
 ...programs.map(role=>z.strictObject({phase:z.literal("ticket-timer-call"),role:z.literal(role),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...flags,objectId:handle,functionDeclaration:z.literal(PROGRAMS[role]),arguments:argumentsFor(args[role]),returnByValue:z.literal(byValue[role])})})),
 z.strictObject({phase:z.literal("ticket-timer-properties"),role:z.enum(["capture","baseline","entry"]),method:z.literal("Runtime.getProperties"),params:props}),
 z.strictObject({phase:z.literal("ticket-timer-native"),slot:z.union(NATIVES.map(row=>z.literal(row.slot))),method:z.literal("Runtime.getProperties"),params:props}),
 z.strictObject({phase:z.literal("ticket-timer-method"),slot:z.union(METHODS.map(row=>z.literal(row.slot))),method:z.literal("Runtime.getProperties"),params:props}),
 z.strictObject({phase:z.literal("ticket-timer-guard"),method:z.literal("Runtime.getProperties"),params:props}),
 z.strictObject({phase:z.literal("ticket-timer-guard-source"),method:z.literal("Debugger.getScriptSource"),params:z.strictObject({scriptId:handle})}),
 ...roles.map(role=>z.strictObject({phase:z.literal("ticket-timer-arm"),role:z.literal(role),method:z.literal("Debugger.setBreakpoint"),params:z.strictObject({location:position,...(role==="selfReturned"?{condition:z.literal(CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_SELF_CONDITION)}:{})})})),
 ...roles.map(role=>z.strictObject({phase:z.literal("ticket-timer-frame"),role:z.literal(role),method:z.literal("Debugger.evaluateOnCallFrame"),params:z.strictObject({objectGroup:z.literal(CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_FRAME_FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true),returnByValue:z.literal(false),includeCommandLineAPI:z.literal(false),callFrameId:handle,expression:z.literal(SITES[role].expression)})})),
 z.strictObject({phase:z.literal("ticket-timer-resume"),role:z.enum(roles),method:z.literal("Debugger.resume"),params:z.strictObject({})}),
]);
/* oxlint-enable unicorn/max-nested-calls */
export type CurrentFootprintForwardWriterTicketTimerCommand=Readonly<z.infer<typeof schema>>;
export function validateCurrentFootprintForwardWriterTicketTimerCommand(input:unknown):CurrentFootprintForwardWriterTicketTimerCommand{
 const command=schema.parse(captureCurrentPcbStringClockReply(input).value);
 if(command.phase==="ticket-timer-arm"){const site=SITES[command.role];if(command.params.location.lineNumber!==site.lineNumber||command.params.location.columnNumber!==site.columnNumber){throw new Error("FORWARD_TICKET_TIMER_FIXED_SITE");}}
 return freezeDeep(command);
}
export function currentFootprintForwardWriterTicketTimerTemplate(input:unknown):Readonly<{command:CurrentFootprintForwardWriterTicketTimerCommand;phase:string;method:string;fields:readonly string[];values:Readonly<Record<string,string>>;template:string}>{
 const command=validateCurrentFootprintForwardWriterTicketTimerCommand(input),values:Record<string,string>={};
 const field=(name:string,value:string):string=>{if(Object.hasOwn(values,name)){throw new Error("FORWARD_TICKET_TIMER_FIELD_ALIAS");}values[name]=value;return `__ticket_timer_${name}__`;};
 const params:Record<string,unknown>={...command.params};
 if(command.method==="Runtime.callFunctionOn"){params["objectId"]=field("objectId",command.params.objectId);params["arguments"]=command.params.arguments.map((arg,i)=>({objectId:field(`argument${String(i)}`,arg.objectId)}));}
 else if(command.method==="Runtime.getProperties"){params["objectId"]=field("objectId",command.params.objectId);}
 else if(command.method==="Debugger.getScriptSource"){params["scriptId"]=field("scriptId",command.params.scriptId);}
 else if(command.method==="Debugger.evaluateOnCallFrame"){params["callFrameId"]=field("callFrameId",command.params.callFrameId);}
 else if(command.method==="Debugger.setBreakpoint"){params["location"]={...command.params.location,scriptId:field("scriptId",command.params.location.scriptId)};}
 let suffix:string|null=null;if("role" in command){suffix=command.role;}else if("slot" in command){suffix=String(command.slot);}
 return freezeDeep({command,phase:command.phase+(suffix===null?"":`-${suffix}`),method:command.method,fields:Object.keys(values),values,template:JSON.stringify({method:command.method,params})});
}
export function currentFootprintForwardWriterTicketTimerWire(input:unknown,id:number):Readonly<{command:CurrentFootprintForwardWriterTicketTimerCommand;request:Readonly<Record<string,string|number>>}>{
 if(!Number.isSafeInteger(id)||id<1||id>2_147_483_647){throw new Error("FORWARD_TICKET_TIMER_ID");}const row=currentFootprintForwardWriterTicketTimerTemplate(input);
 return freezeDeep({command:row.command,request:{action:"footprint-forward-ticket-timer",requestId:id,phase:row.phase,method:row.method,...row.values}});
}
 const plain=(phase:string,role?:string,slot?:number):unknown=>({phase,...(role===undefined?{}:{role}),...(slot===undefined?{}:{slot}),method:"Runtime.getProperties",params:{objectId:"original27",ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}});
 const call=(role:typeof programs[number]):unknown=>({phase:"ticket-timer-call",role,method:"Runtime.callFunctionOn",params:{...CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_FLAGS,objectId:"reflection11",functionDeclaration:PROGRAMS[role],arguments:Array.from({length:args[role]},()=>({objectId:"original29"})),returnByValue:byValue[role]}});

export function currentFootprintForwardWriterTicketTimerCases():readonly CurrentFootprintForwardWriterTicketTimerCommand[]{ const out:unknown[]=[call("capture"),plain("ticket-timer-properties","capture"),...NATIVES.map(row=>plain("ticket-timer-native",undefined,row.slot)),...METHODS.map(row=>plain("ticket-timer-method",undefined,row.slot)),plain("ticket-timer-guard"),{phase:"ticket-timer-guard-source",method:"Debugger.getScriptSource",params:{scriptId:"helper27"}},call("binding"),call("baseline"),plain("ticket-timer-properties","baseline")];
 for(const role of roles){const site=SITES[role];out.push({phase:"ticket-timer-arm",role,method:"Debugger.setBreakpoint",params:{location:{scriptId:"source27",lineNumber:site.lineNumber,columnNumber:site.columnNumber},...(role==="selfReturned"?{condition:CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_SELF_CONDITION}:{})}});}
 out.push(call("before"));
 for(const role of roles){out.push({phase:"ticket-timer-frame",role,method:"Debugger.evaluateOnCallFrame",params:{...CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_FRAME_FLAGS,callFrameId:"frame27",expression:SITES[role].expression}},call(role));if(role==="entry"){out.push(plain("ticket-timer-properties","entry"));}out.push({phase:"ticket-timer-resume",role,method:"Debugger.resume",params:{}});}
 out.push(call("slot"));return freezeDeep(out.map(value=>validateCurrentFootprintForwardWriterTicketTimerCommand(value)));
}
