/** Closed natural branch/changed-history/body selectors. Shared immutable
 * recipes carry no historical full/Via/inverse-startup owner authority. */
import {z} from "zod";
import {freezeDeep} from "./sqlite-inventory-core.ts";
import {captureCurrentPcbStringClockReply} from "./current-pcb-string-clock-reply.ts";
import {CURRENT_FOOTPRINT_FORWARD_WRITER_BRANCH_PROGRAMS as BRANCH} from "./current-footprint-forward-writer-branch-programs.ts";
import {CURRENT_FOOTPRINT_INVERSE_MAIN_HISTORY_PROGRAMS as HISTORY} from "./current-footprint-inverse-main-history-programs.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_BODY_PROGRAMS as BODY} from "./current-footprint-inverse-native-delete-main-body-programs.ts";
import {CURRENT_FOOTPRINT_FORWARD_WRITER_BRANCH_SITE as BRANCH_SITE} from "./current-footprint-forward-writer-branch-source.ts";
import {CURRENT_PCB_VIA_MAIN_LIVE_HISTORY_SITE as HISTORY_SITE} from "./current-pcb-via-main-live-history-source.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_BODY_SITE as BODY_SITE} from "./current-footprint-inverse-native-delete-main-tail-source.ts";

export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_READ_GROUP="easyeda-footprint-inverse-native-delete-main-read209-v1";
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_READ_KINDS=["branch","history","body"]as const;
export type CurrentFootprintInverseNativeDeleteMainReadKind=typeof CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_READ_KINDS[number];
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_READS=freezeDeep({
 branch:{site:BRANCH_SITE,programs:BRANCH,packetLength:6,promiseIndex:4,normal:8,cleanup:2},
 history:{site:HISTORY_SITE,programs:HISTORY,packetLength:10,promiseIndex:8,normal:11,cleanup:2},
 body:{site:BODY_SITE,programs:BODY,packetLength:6,promiseIndex:4,normal:8,cleanup:2},
});
export {CURRENT_PCB_VIA_MAIN_LIVE_HISTORY_FUNCTIONS as CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_READ_FUNCTIONS} from "./current-pcb-via-main-live-history-source.ts";
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_READ_FLAGS=Object.freeze({
 objectGroup:CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_READ_GROUP,silent:true,generatePreview:false,throwOnSideEffect:true,
}as const);
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u),kinds=z.enum(CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_READ_KINDS);
const frameFlags={objectGroup:z.literal(CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_READ_GROUP),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true),includeCommandLineAPI:z.literal(false),returnByValue:z.literal(false)};
const callFlags={objectGroup:z.literal(CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_READ_GROUP),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true),awaitPromise:z.literal(false),userGesture:z.literal(false)};
const empty=z.strictObject({}),ref=z.strictObject({objectId:handle});
const armLocation=z.strictObject({scriptId:handle,lineNumber:z.number().int(),columnNumber:z.number().int()});
const frameParams=z.strictObject({...frameFlags,callFrameId:handle,expression:z.string().max(128)});
const joinParams=z.strictObject({...callFlags,objectId:handle,functionDeclaration:z.string().max(16_384),arguments:z.array(ref).max(2),returnByValue:z.boolean()});
const propertiesParams=z.strictObject({objectId:handle,ownProperties:z.literal(true),accessorPropertiesOnly:z.literal(false),generatePreview:z.literal(false)});
const releaseParams=z.strictObject({objectGroup:z.literal(CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_READ_GROUP)});
const schema=z.discriminatedUnion("phase",[
 z.strictObject({kind:kinds,phase:z.literal("inverse-native-delete-main-read-arm"),method:z.literal("Debugger.setBreakpoint"),params:z.strictObject({location:armLocation})}),
 z.strictObject({kind:kinds,phase:z.literal("inverse-native-delete-main-read-frame"),method:z.literal("Debugger.evaluateOnCallFrame"),params:frameParams}),
 z.strictObject({kind:kinds,phase:z.literal("inverse-native-delete-main-read-join"),role:z.enum(["capture","resolved","value"]),method:z.literal("Runtime.callFunctionOn"),params:joinParams}),
 z.strictObject({kind:kinds,phase:z.literal("inverse-native-delete-main-read-properties"),role:z.enum(["packet","promise","projectSql","table","branches"]),method:z.literal("Runtime.getProperties"),params:propertiesParams}),
 z.strictObject({kind:kinds,phase:z.literal("inverse-native-delete-main-read-remove"),method:z.literal("Debugger.removeBreakpoint"),params:z.strictObject({breakpointId:handle})}),
 z.strictObject({kind:kinds,phase:z.literal("inverse-native-delete-main-read-step"),method:z.literal("Debugger.resume"),params:empty}),
 z.strictObject({kind:kinds,phase:z.literal("inverse-native-delete-main-read-driver-step"),method:z.literal("Debugger.resume"),params:empty}),
 z.strictObject({kind:kinds,phase:z.literal("inverse-native-delete-main-read-release"),method:z.literal("Runtime.releaseObjectGroup"),params:releaseParams}),
]);
export type CurrentFootprintInverseNativeDeleteMainReadCommand=Readonly<z.infer<typeof schema>>;
export function validateCurrentFootprintInverseNativeDeleteMainReadCommand(input:unknown):CurrentFootprintInverseNativeDeleteMainReadCommand{
 const value=schema.parse(captureCurrentPcbStringClockReply(input).value);const definition=CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_READS[value.kind];
 if(value.phase==="inverse-native-delete-main-read-arm"&&(value.params.location.lineNumber!==definition.site.lineNumber||value.params.location.columnNumber!==definition.site.columnNumber)){throw new Error("INVERSE_NATIVE_DELETE_MAIN_READ_SITE");}
 if(value.phase==="inverse-native-delete-main-read-frame"&&value.params.expression!==definition.site.expression){throw new Error("INVERSE_NATIVE_DELETE_MAIN_READ_FRAME");}
 if(value.phase==="inverse-native-delete-main-read-join"){const program=definition.programs[value.role];if(value.params.functionDeclaration!==program.program||value.params.arguments.length!==program.arguments||value.params.returnByValue!==program.returnByValue){throw new Error("INVERSE_NATIVE_DELETE_MAIN_READ_PROGRAM");}}
 if(value.phase==="inverse-native-delete-main-read-properties"&&value.kind!=="history"&&value.role!=="packet"&&value.role!=="promise"){throw new Error("INVERSE_NATIVE_DELETE_MAIN_READ_PROPERTY");}
 return freezeDeep(value);
}
export function currentFootprintInverseNativeDeleteMainReadCases():readonly CurrentFootprintInverseNativeDeleteMainReadCommand[]{
 const rows:unknown[]=[];
 for(const kind of CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_READ_KINDS){
  const d=CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_READS[kind],group=CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_READ_GROUP;
  rows.push({kind,phase:"inverse-native-delete-main-read-arm",method:"Debugger.setBreakpoint",params:{location:{scriptId:"script7",lineNumber:d.site.lineNumber,columnNumber:d.site.columnNumber}}},
   {kind,phase:"inverse-native-delete-main-read-frame",method:"Debugger.evaluateOnCallFrame",params:{...CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_READ_FLAGS,callFrameId:"frame8",expression:d.site.expression,includeCommandLineAPI:false,returnByValue:false}});
  for(const role of["capture","resolved","value"]as const){const program=d.programs[role];rows.push({kind,phase:"inverse-native-delete-main-read-join",role,method:"Runtime.callFunctionOn",params:{...CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_READ_FLAGS,awaitPromise:false,userGesture:false,objectId:"packet9",functionDeclaration:program.program,arguments:Array.from({length:program.arguments},(_,i)=>({objectId:`argument${String(i)}`})),returnByValue:program.returnByValue}});}
  for(const role of(kind==="history"?["packet","promise","projectSql","table","branches"]:["packet","promise"])){rows.push({kind,phase:"inverse-native-delete-main-read-properties",role,method:"Runtime.getProperties",params:{objectId:"member10",ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}});}
  rows.push({kind,phase:"inverse-native-delete-main-read-remove",method:"Debugger.removeBreakpoint",params:{breakpointId:"point11"}},
   {kind,phase:"inverse-native-delete-main-read-step",method:"Debugger.resume",params:{}},
   {kind,phase:"inverse-native-delete-main-read-driver-step",method:"Debugger.resume",params:{}},
   {kind,phase:"inverse-native-delete-main-read-release",method:"Runtime.releaseObjectGroup",params:{objectGroup:group}});
 }
 return freezeDeep(rows.map(row=>validateCurrentFootprintInverseNativeDeleteMainReadCommand(row)));
}
export function currentFootprintInverseNativeDeleteMainReadTemplate(input:unknown):Readonly<{command:CurrentFootprintInverseNativeDeleteMainReadCommand;phase:string;method:string;fields:readonly string[];values:Readonly<Record<string,string>>;template:string}>{
 const command=validateCurrentFootprintInverseNativeDeleteMainReadCommand(input),values:Record<string,string>={};
 const field=(name:string,value:string):string=>{if(Object.hasOwn(values,name)){throw new Error("INVERSE_NATIVE_DELETE_MAIN_READ_FIELD");}values[name]=value;return `__inverse_delete_read_${name}__`;};
 const params:Record<string,unknown>={...command.params};
 if(command.method==="Debugger.setBreakpoint"){params["location"]={...command.params.location,scriptId:field("scriptId",command.params.location.scriptId)};}
 else if(command.method==="Debugger.evaluateOnCallFrame"){params["callFrameId"]=field("callFrameId",command.params.callFrameId);}
 else if(command.method==="Runtime.getProperties"||command.method==="Runtime.callFunctionOn"){params["objectId"]=field("objectId",command.params.objectId);}
 else if(command.method==="Debugger.removeBreakpoint"){params["breakpointId"]=field("breakpointId",command.params.breakpointId);}
 if(command.method==="Runtime.callFunctionOn"){params["arguments"]=command.params.arguments.map((value,i)=>({objectId:field(`argument${String(i)}`,value.objectId)}));}
 return freezeDeep({command,phase:`${command.phase}-${command.kind}${"role"in command?`-${command.role}`:""}`,method:command.method,fields:Object.keys(values),values,template:JSON.stringify({method:command.method,params})});
}
export function currentFootprintInverseNativeDeleteMainReadWire(input:unknown,id:number):Readonly<{command:CurrentFootprintInverseNativeDeleteMainReadCommand;request:Readonly<Record<string,string|number>>}>{
 if(!Number.isSafeInteger(id)||id<1||id>2_147_483_647){throw new Error("INVERSE_NATIVE_DELETE_MAIN_READ_ID");}
 const row=currentFootprintInverseNativeDeleteMainReadTemplate(input);return freezeDeep({command:row.command,request:{action:"inverse-native-delete-main-read",requestId:id,phase:row.phase,method:row.method,...row.values}});
}
