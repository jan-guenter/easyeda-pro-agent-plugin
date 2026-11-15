/** Fixed parser-helper observations. No callback, RPC, parser, resume or Save
 * can be invoked through this source-only vocabulary. */
import {z} from "zod";
import {captureCurrentPcbStringClockReply as capture} from "./current-pcb-string-clock-reply.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";
import {CURRENT_SCHEMATIC_WIRE_PARSER_HELPER_FRAMES as FRAMES} from "./current-schematic-wire-parser-source.ts";

export const CURRENT_SCHEMATIC_WIRE_PARSER_FLAGS=Object.freeze({objectGroup:"easyeda-schematic-wire-parser-v1",silent:true,generatePreview:false,throwOnSideEffect:true} as const);
export const CURRENT_SCHEMATIC_WIRE_PARSER_HELPER_REQUESTS=Object.freeze({frame:1,array:1,functions:21,normal:23,cleanup:1,total:24} as const);
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const flags={objectGroup:z.literal(CURRENT_SCHEMATIC_WIRE_PARSER_FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true)};
const frameFields={...flags,callFrameId:handle,returnByValue:z.literal(false),includeCommandLineAPI:z.literal(false)};
const firstFrame=z.strictObject({...frameFields,expression:z.literal(FRAMES[0])});
const secondFrame=z.strictObject({...frameFields,expression:z.literal(FRAMES[1])});
const properties=z.strictObject({objectId:handle,ownProperties:z.literal(true),accessorPropertiesOnly:z.literal(false),generatePreview:z.literal(false)});
const cleanup=z.strictObject({objectGroup:flags.objectGroup});
const schema=z.union([
 z.strictObject({phase:z.literal("wire-parser-helper-frame"),variant:z.literal(0),method:z.literal("Debugger.evaluateOnCallFrame"),params:firstFrame}),
 z.strictObject({phase:z.literal("wire-parser-helper-frame"),variant:z.literal(1),method:z.literal("Debugger.evaluateOnCallFrame"),params:secondFrame}),
 z.strictObject({phase:z.literal("wire-parser-properties"),method:z.literal("Runtime.getProperties"),params:properties}),
 z.strictObject({phase:z.literal("wire-parser-release"),method:z.literal("Runtime.releaseObjectGroup"),params:cleanup}),
]);
export type CurrentSchematicWireParserHelperCommand=z.infer<typeof schema>;
export function validateCurrentSchematicWireParserHelperCommand(input:unknown):CurrentSchematicWireParserHelperCommand{return freezeDeep(schema.parse(capture(input).value));}
export function currentSchematicWireParserHelperCases():readonly CurrentSchematicWireParserHelperCommand[]{return freezeDeep([
 ...([0,1] as const).map(variant=>({phase:"wire-parser-helper-frame",variant,method:"Debugger.evaluateOnCallFrame",params:{...CURRENT_SCHEMATIC_WIRE_PARSER_FLAGS,callFrameId:"original_frame",expression:FRAMES[variant],returnByValue:false,includeCommandLineAPI:false}})),
 {phase:"wire-parser-properties",method:"Runtime.getProperties",params:{objectId:"original_ref",ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}},
 {phase:"wire-parser-release",method:"Runtime.releaseObjectGroup",params:{objectGroup:CURRENT_SCHEMATIC_WIRE_PARSER_FLAGS.objectGroup}},
].map(value=>validateCurrentSchematicWireParserHelperCommand(value)));}

/** Fixed native template fields carry only original opaque handles. */
export function currentSchematicWireParserHelperTemplate(input:unknown):Readonly<{phase:string;method:string;fields:Readonly<Record<string,"handle">>;values:Readonly<Record<string,string>>;template:string}>{
 const command=validateCurrentSchematicWireParserHelperCommand(input);const fields:Record<string,"handle">={};const values:Record<string,string>={};
 const field=(name:string,value:string):string=>{fields[name]="handle";values[name]=value;return `__wireparser_${name}__`;};
 const params:Record<string,unknown>={...command.params};let phase:string=command.phase;
 if(command.phase==="wire-parser-helper-frame"){phase+=`-v${String(command.variant)}`;params["callFrameId"]=field("callFrameId",command.params.callFrameId);}
 else if(command.phase==="wire-parser-properties"){params["objectId"]=field("objectId",command.params.objectId);}
 return freezeDeep({phase,method:command.method,fields,values,template:JSON.stringify({method:command.method,params})});
}
