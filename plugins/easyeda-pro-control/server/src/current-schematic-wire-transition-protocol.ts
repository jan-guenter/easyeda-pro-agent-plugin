/** Closed readonly Wire transition vocabulary. A selector, data packet or
 * matching source never issues an original event, mutation or Save grant. */
import {z} from "zod";

import {captureCurrentPcbStringClockReply as capture} from "./current-pcb-string-clock-reply.ts";

import {freezeDeep} from "./sqlite-inventory-core.ts";

import {CURRENT_SCHEMATIC_WIRE_TRANSITION_FRAMES as FRAMES,CURRENT_SCHEMATIC_WIRE_TRANSITION_PROGRAMS as PROGRAMS} from "./current-schematic-wire-transition-programs.ts";


export const CURRENT_SCHEMATIC_WIRE_TRANSITION_FLAGS=Object.freeze({objectGroup:"easyeda-pro-control-schematic-wire-transition-v1",silent:true,generatePreview:false,throwOnSideEffect:true,awaitPromise:false,userGesture:false}as const);

export const CURRENT_SCHEMATIC_WIRE_TRANSITION_CALLS=freezeDeep({roots:{program:PROGRAMS.roots,refs:1,byValue:false},scopeAst:{program:PROGRAMS.scopeAst,refs:1,byValue:false},scopeGroupMain:{program:PROGRAMS.scopeGroupMain,refs:1,byValue:false},scopeGroupEditor:{program:PROGRAMS.scopeGroupEditor,refs:1,byValue:false},setter:{program:PROGRAMS.setter,refs:4,byValue:false},record:{program:PROGRAMS.record,refs:4,byValue:true}}as const);

export type CurrentSchematicWireTransitionCallRole=keyof typeof CURRENT_SCHEMATIC_WIRE_TRANSITION_CALLS;

// Metadata: roots/array2 + six root packets + core-method packet1 + two
// Twelve-level prototype searches24 +22 function packets +two scope arrays
// +sixteen bounded scope projections +two class prototype packets =75.
export const CURRENT_SCHEMATIC_WIRE_TRANSITION_REQUESTS=Object.freeze({metadataMaximum:75,setter:6,record:6,scopeLimit:8,prototypeLimit:12,helperSourcesMaximum:21,normalMaximum:87,withHelperSourcesMaximum:108,cleanup:1,totalMaximum:109}as const);

const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u),object=z.strictObject({objectId:handle});

const flags={objectGroup:z.literal(CURRENT_SCHEMATIC_WIRE_TRANSITION_FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true),awaitPromise:z.literal(false),userGesture:z.literal(false)};

const calls=Object.entries(CURRENT_SCHEMATIC_WIRE_TRANSITION_CALLS).map(([role,row])=>z.strictObject({phase:z.literal("wire-transition-call"),role:z.literal(role),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...flags,objectId:handle,functionDeclaration:z.literal(row.program),arguments:z.array(object).length(row.refs),returnByValue:z.literal(row.byValue)})}));

const frames=Object.entries(FRAMES).map(([role,expression])=>z.strictObject({phase:z.literal("wire-transition-frame"),role:z.literal(role),method:z.literal("Debugger.evaluateOnCallFrame"),params:z.strictObject({callFrameId:handle,expression:z.literal(expression),objectGroup:flags.objectGroup,silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true),returnByValue:z.literal(false),includeCommandLineAPI:z.literal(false)})}));

const propertiesSchema=z.strictObject({phase:z.literal("wire-transition-properties"),method:z.literal("Runtime.getProperties"),params:z.strictObject({objectId:handle,ownProperties:z.literal(true),accessorPropertiesOnly:z.literal(false),generatePreview:z.literal(false)})});
const releaseSchema=z.strictObject({phase:z.literal("wire-transition-release"),method:z.literal("Runtime.releaseObjectGroup"),params:z.strictObject({objectGroup:flags.objectGroup})});
const schema=z.union([...calls,...frames,propertiesSchema,releaseSchema]);

export type CurrentSchematicWireTransitionCommand=z.infer<typeof schema>;

/** Admit only exact fixed programs, literal true side-effect flags and handles. */
export function validateCurrentSchematicWireTransitionCommand(input:unknown):CurrentSchematicWireTransitionCommand{return freezeDeep(schema.parse(capture(input).value));
}
/** Enumerate inert canonical rows for private native composition/parity. */
export function currentSchematicWireTransitionCases():readonly CurrentSchematicWireTransitionCommand[]{return freezeDeep([...Object.entries(CURRENT_SCHEMATIC_WIRE_TRANSITION_CALLS).map(([role,row])=>({phase:"wire-transition-call",role,method:"Runtime.callFunctionOn",params:{...CURRENT_SCHEMATIC_WIRE_TRANSITION_FLAGS,objectId:"original_ref",functionDeclaration:row.program,arguments:Array.from({length:row.refs},()=>({objectId:"original_ref"})),returnByValue:row.byValue}})),...Object.entries(FRAMES).map(([role,expression])=>({phase:"wire-transition-frame",role,method:"Debugger.evaluateOnCallFrame",params:{callFrameId:"original_frame",expression,objectGroup:CURRENT_SCHEMATIC_WIRE_TRANSITION_FLAGS.objectGroup,silent:true,generatePreview:false,throwOnSideEffect:true,returnByValue:false,includeCommandLineAPI:false}})),{phase:"wire-transition-properties",method:"Runtime.getProperties",params:{objectId:"original_ref",ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}},{phase:"wire-transition-release",method:"Runtime.releaseObjectGroup",params:{objectGroup:CURRENT_SCHEMATIC_WIRE_TRANSITION_FLAGS.objectGroup}}].map(command=>validateCurrentSchematicWireTransitionCommand(command)));
}
/** Replace only bounded original handles in a fixed private native row. */
export function currentSchematicWireTransitionTemplate(input:unknown):Readonly<{phase:string;
method:string;
fields:Readonly<Record<string,"handle">>;
values:Readonly<Record<string,string>>;
template:string}>{const command=validateCurrentSchematicWireTransitionCommand(input);
const fields:Record<string,"handle">={};
const values:Record<string,string>={};
const field=(name:string,value:string):string=>{fields[name]="handle";
values[name]=value;
return`__schematic_wiretransition_${name}__`;
};
const params:Record<string,unknown>={...command.params};
let phase:string=command.phase;
if(command.phase==="wire-transition-call"){phase+=`-${command.role}`;
params["objectId"]=field("objectId",command.params.objectId);
params["arguments"]=command.params.arguments.map((arg,index)=>({objectId:field(`arg${String(index)}`,arg.objectId)}));
}else if(command.phase==="wire-transition-frame"){phase+=`-${command.role}`;
params["callFrameId"]=field("callFrameId",command.params.callFrameId);
}else if(command.phase==="wire-transition-properties"){params["objectId"]=field("objectId",command.params.objectId);
}return freezeDeep({phase,method:command.method,fields,values,template:JSON.stringify({method:command.method,params})});
}
