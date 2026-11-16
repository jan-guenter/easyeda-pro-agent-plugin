/** Closed passive parser context/return vocabulary. Retention copies only
 * the exact native object reference; no parser, Promise method or control runs. */
import {z} from "zod";
import {captureCurrentPcbStringClockReply as capture} from "./current-pcb-string-clock-reply.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";
import {CURRENT_SCHEMATIC_WIRE_PARSER_FLAGS as FLAGS} from "./current-schematic-wire-parser-helper-protocol.ts";
import {CURRENT_SCHEMATIC_WIRE_PARSER_FRAMES as FRAMES,CURRENT_SCHEMATIC_WIRE_PARSER_PROGRAMS as P} from "./current-schematic-wire-parser-programs.ts";

export {CURRENT_SCHEMATIC_WIRE_PARSER_FLAGS} from "./current-schematic-wire-parser-helper-protocol.ts";
export const CURRENT_SCHEMATIC_WIRE_PARSER_REQUESTS=Object.freeze({approvedSlots:64,context:70,sheet:69,astEntry:3,published:5,astReturn:8,otherReturn:5,returns:33,settle:8,normal:188,helpers:20,helperBindings:23,cleanup:1,total:232} as const);
export const CURRENT_SCHEMATIC_WIRE_PARSER_CALLS=freezeDeep({
 approved:{program:P.approved,refs:65,byValue:false},context:{program:P.context,refs:4,byValue:false},sheet:{program:P.sheet,refs:4,byValue:false},
 astEntry:{program:P.astEntry,refs:5,byValue:true},retainPromise:{program:P.retainPromise,refs:0,byValue:false},astReturned:{program:P.astReturned,refs:7,byValue:true},
 published:{program:P.published,refs:6,byValue:true},passSchematicReturned:{program:P.passSchematicReturned,refs:4,byValue:true},passContentReturned:{program:P.passContentReturned,refs:4,byValue:true},
 updateReturned:{program:P.updateReturned,refs:4,byValue:true},sheetReturned:{program:P.sheetReturned,refs:4,byValue:true},docReturned:{program:P.docReturned,refs:4,byValue:true},
 contextCurrent:{program:P.contextCurrent,refs:4,byValue:true},sameObject:{program:P.sameObject,refs:1,byValue:true},
} as const);
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);const ref=z.strictObject({objectId:handle});
const flags={objectGroup:z.literal(FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true)};
const calls=Object.entries(CURRENT_SCHEMATIC_WIRE_PARSER_CALLS).map(([role,row])=>z.strictObject({phase:z.literal("wire-parser-call"),role:z.literal(role),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...flags,objectId:handle,functionDeclaration:z.literal(row.program),arguments:z.array(ref).length(row.refs),returnByValue:z.literal(row.byValue),awaitPromise:z.literal(false),userGesture:z.literal(false)})}));
const frames=([0,1] as const).flatMap(variant=>Object.entries(FRAMES[variant]).map(([role,expression])=>z.strictObject({phase:z.literal("wire-parser-frame"),variant:z.literal(variant),role:z.literal(role),method:z.literal("Debugger.evaluateOnCallFrame"),params:z.strictObject({...flags,callFrameId:handle,expression:z.literal(expression),returnByValue:z.literal(false),includeCommandLineAPI:z.literal(false)})})));
const properties=z.strictObject({objectId:handle,ownProperties:z.literal(true),accessorPropertiesOnly:z.literal(false),generatePreview:z.literal(false)});const release=z.strictObject({objectGroup:flags.objectGroup});
const schema=z.union([...calls,...frames,z.strictObject({phase:z.literal("wire-parser-properties"),method:z.literal("Runtime.getProperties"),params:properties}),z.strictObject({phase:z.literal("wire-parser-release"),method:z.literal("Runtime.releaseObjectGroup"),params:release})]);
export type CurrentSchematicWireParserCommand=z.infer<typeof schema>;
export function validateCurrentSchematicWireParserCommand(input:unknown):CurrentSchematicWireParserCommand{return freezeDeep(schema.parse(capture(input).value));}
export function currentSchematicWireParserCases():readonly CurrentSchematicWireParserCommand[]{return freezeDeep([
 ...Object.entries(CURRENT_SCHEMATIC_WIRE_PARSER_CALLS).map(([role,row])=>({phase:"wire-parser-call",role,method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:"original_ref",functionDeclaration:row.program,arguments:Array.from({length:row.refs},()=>({objectId:"original_ref"})),returnByValue:row.byValue,awaitPromise:false,userGesture:false}})),
 ...([0,1] as const).flatMap(variant=>Object.entries(FRAMES[variant]).map(([role,expression])=>({phase:"wire-parser-frame",variant,role,method:"Debugger.evaluateOnCallFrame",params:{...FLAGS,callFrameId:"original_frame",expression,returnByValue:false,includeCommandLineAPI:false}}))),
 {phase:"wire-parser-properties",method:"Runtime.getProperties",params:{objectId:"original_ref",ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}},
 {phase:"wire-parser-release",method:"Runtime.releaseObjectGroup",params:{objectGroup:FLAGS.objectGroup}},
].map(command=>validateCurrentSchematicWireParserCommand(command)));}

/** Fixed native template fields carry only original opaque handles. */
export function currentSchematicWireParserTemplate(input:unknown):Readonly<{phase:string;method:string;fields:Readonly<Record<string,"handle">>;values:Readonly<Record<string,string>>;template:string}>{
 const command=validateCurrentSchematicWireParserCommand(input);const fields:Record<string,"handle">={};const values:Record<string,string>={};
 const field=(name:string,value:string):string=>{fields[name]="handle";values[name]=value;return `__wireparser_${name}__`;};
 const params:Record<string,unknown>={...command.params};let phase:string=command.phase;
 if(command.phase==="wire-parser-call"){phase+=`-${command.role}`;params["objectId"]=field("objectId",command.params.objectId);params["arguments"]=command.params.arguments.map((arg,index)=>({objectId:field(`arg${String(index)}`,arg.objectId)}));}
 else if(command.phase==="wire-parser-frame"){phase+=`-${command.role}-v${String(command.variant)}`;params["callFrameId"]=field("callFrameId",command.params.callFrameId);}
 else if(command.phase==="wire-parser-properties"){params["objectId"]=field("objectId",command.params.objectId);}
 return freezeDeep({phase,method:command.method,fields,values,template:JSON.stringify({method:command.method,params})});
}
