/** Fixed before-Modify title/ft vocabulary. No breakpoint, resume, writer,
 * application callback or caller program can enter this original V5 lane. */
/* oxlint-disable import/max-dependencies -- The finite before-Modify codebook keeps its existing pure recipes together. */
import {z} from "zod";
import {CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_SHARED_FLAGS as RPC_FLAGS} from "./current-schematic-wire-classic-rpc-shared-protocol.ts";
import {currentSchematicWireV5RuntimeCases,validateCurrentSchematicWireV5RuntimeCommand} from "./current-schematic-wire-v5-runtime-protocol.ts";
import type {CurrentSchematicWireV5RuntimeCommand} from "./current-schematic-wire-v5-runtime-protocol.ts";
import {CURRENT_SCHEMATIC_WIRE_TITLE_FT_V5_REQUESTS as FT_LIMIT} from "./current-schematic-wire-title-ft-v5-protocol.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";
import {captureCurrentPcbStringClockReply as capture} from "./current-pcb-string-clock-reply.ts";
import {CURRENT_SCHEMATIC_WIRE_SERVICE_REGISTRATION_CALLS as REG,CURRENT_SCHEMATIC_WIRE_SERVICE_REGISTRATION_REQUESTS as REG_LIMIT} from "./current-schematic-wire-service-registration-protocol.ts";
import {CURRENT_SCHEMATIC_WIRE_UI_PROVIDER_CALLS as UI,CURRENT_SCHEMATIC_WIRE_UI_PROVIDER_REQUESTS as UI_LIMIT} from "./current-schematic-wire-ui-provider-protocol.ts";
import {CURRENT_SCHEMATIC_WIRE_TREE_PREFLIGHT_CALLS as TREE,CURRENT_SCHEMATIC_WIRE_TREE_PREFLIGHT_REQUESTS as TREE_LIMIT} from "./current-schematic-wire-tree-preflight-protocol.ts";
import {CURRENT_SCHEMATIC_WIRE_TITLE_CALLS as TITLE,CURRENT_SCHEMATIC_WIRE_TITLE_REQUESTS as TITLE_LIMIT} from "./current-schematic-wire-title-protocol.ts";
import {CURRENT_SCHEMATIC_WIRE_TITLE_BINDINGS as B,CURRENT_SCHEMATIC_WIRE_TITLE_FT_PROGRAMS as FT} from "./current-schematic-wire-title-programs.ts";
import {CURRENT_SCHEMATIC_WIRE_SERVICE_INVOCATION_FLAGS as FLAGS} from "./current-schematic-wire-service-invocation-protocol.ts";

export const CURRENT_SCHEMATIC_WIRE_V5_TITLE_REQUESTS=Object.freeze({normal:2+FT_LIMIT.aggregateNormal,cleanup:FT_LIMIT.aggregateCleanup,preflight:2+REG_LIMIT.normal+UI_LIMIT.ordinary+UI_LIMIT.sources+TREE_LIMIT.ordinary+TREE_LIMIT.sources+TITLE_LIMIT.preflight+TITLE_LIMIT.preflightSources+6+2*8,sourceBundles:2});
interface Call{readonly phase:string;readonly role:string;readonly program:string;readonly refs:number;readonly byValue:boolean}
const calls:readonly Call[]=Object.freeze([
 ...Object.entries(REG).map(([role,row])=>({phase:"wire-service-registration-call",role,program:row.program,refs:row.refs,byValue:row.byValue})),
 ...Object.entries(UI).map(([role,row])=>({phase:"wire-ui-provider-call",role,program:row.program,refs:row.refs,byValue:row.byValue})),
 ...Object.entries(TREE).map(([role,row])=>({phase:"wire-tree-preflight-call",role,program:row.program,refs:row.refs,byValue:false})),
 ...Object.entries(TITLE).filter(([role])=>Object.hasOwn(B,role)||["seed","bundle","before","same"].includes(role)).map(([role,row])=>({phase:"wire-title-call",role,program:row.program,refs:row.refs,byValue:row.byValue})),
 {phase:"wire-title-ft-call",role:"scopeArray",program:FT.scopeArray,refs:1,byValue:false},
]);
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u),reference=z.strictObject({objectId:handle});
const flags={objectGroup:z.literal(FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true),awaitPromise:z.literal(false),userGesture:z.literal(false)};
const propertyPhases=["wire-ui-provider-properties","wire-tree-preflight-properties","wire-title-properties","wire-title-ft-properties"] as const;
const sourcePhases=["wire-v5-title-bundle-source","wire-rpc-driver-source","wire-title-source","wire-title-ft-source"] as const;
const properties=z.strictObject({objectId:handle,ownProperties:z.literal(true),accessorPropertiesOnly:z.literal(false),generatePreview:z.literal(false)});
const schema=z.union([
 ...calls.map(row=>z.strictObject({phase:z.literal(row.phase),role:z.literal(row.role),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...flags,objectGroup:z.literal(row.phase==="wire-service-registration-call"?RPC_FLAGS.objectGroup:FLAGS.objectGroup),objectId:handle,functionDeclaration:z.literal(row.program),arguments:z.array(reference).length(row.refs),returnByValue:z.literal(row.byValue)})})),
 z.strictObject({phase:z.literal("classic-rpc-properties"),kind:z.literal("fields"),method:z.literal("Runtime.getProperties"),params:properties}),
 ...propertyPhases.map(phase=>z.strictObject({phase:z.literal(phase),method:z.literal("Runtime.getProperties"),params:properties})),
 ...sourcePhases.map(phase=>z.strictObject({phase:z.literal(phase),method:z.literal("Debugger.getScriptSource"),params:z.strictObject({scriptId:handle})})),
]);
export type CurrentSchematicWireV5TitleCommand=Readonly<z.infer<typeof schema>>|CurrentSchematicWireV5RuntimeCommand;
export function validateCurrentSchematicWireV5TitleCommand(input:unknown):CurrentSchematicWireV5TitleCommand{const safe=capture(input).value;const result=schema.safeParse(safe);return result.success?freezeDeep(result.data):validateCurrentSchematicWireV5RuntimeCommand(safe);}
const cases:readonly CurrentSchematicWireV5TitleCommand[]=Object.freeze([
 ...calls.map(row=>({phase:row.phase,role:row.role,method:"Runtime.callFunctionOn",params:{...FLAGS,objectGroup:row.phase==="wire-service-registration-call"?RPC_FLAGS.objectGroup:FLAGS.objectGroup,awaitPromise:false,userGesture:false,objectId:"original27",functionDeclaration:row.program,arguments:Array.from({length:row.refs},()=>({objectId:"original27"})),returnByValue:row.byValue}})),
 {phase:"classic-rpc-properties",kind:"fields",method:"Runtime.getProperties",params:{objectId:"original27",ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}},
 ...propertyPhases.map(phase=>({phase,method:"Runtime.getProperties",params:{objectId:"original27",ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}})),
 ...sourcePhases.map(phase=>({phase,method:"Debugger.getScriptSource",params:{scriptId:"original27"}})),
...currentSchematicWireV5RuntimeCases(),
].map(row=>validateCurrentSchematicWireV5TitleCommand(row)));
export function currentSchematicWireV5TitleCases():readonly CurrentSchematicWireV5TitleCommand[]{return cases;}
function fields(input:CurrentSchematicWireV5TitleCommand):Readonly<{names:readonly string[];values:Readonly<Record<string,string>>;params:Readonly<Record<string,unknown>>}>{
 const params:Record<string,unknown>={...input.params};const names:string[]=[];const values:Record<string,string>={};const field=(name:string,value:string):string=>{names.push(name);values[name]=value;return `__wire_title_${name}__`;};
 if(input.method==="Debugger.getScriptSource"){params["scriptId"]=field("scriptId",input.params.scriptId);}
 else if(input.method==="Runtime.callFunctionOn"){params["objectId"]=field("objectId",input.params.objectId);params["arguments"]=input.params.arguments.map((arg,index)=>"objectId"in arg?{objectId:field(`reference${String(index)}`,arg.objectId)}:{value:field(`scalar${String(index)}`,arg.value)});}
 else if(input.method==="Runtime.getProperties"){params["objectId"]=field("objectId",input.params.objectId);}
 else if(input.method==="Debugger.evaluateOnCallFrame"){params["callFrameId"]=field("callFrameId",input.params.callFrameId);}
 else if(input.method==="Debugger.setBreakpoint"){params["location"]={...input.params.location,scriptId:field("scriptId",input.params.location.scriptId)};}
 else if(input.method==="Debugger.removeBreakpoint"){params["breakpointId"]=field("breakpointId",input.params.breakpointId);}
 else if(input.method==="Runtime.awaitPromise"){params["promiseObjectId"]=field("promiseObjectId",input.params.promiseObjectId);}
 return Object.freeze({names:Object.freeze(names),values:Object.freeze(values),params:Object.freeze(params)});
}
function key(command:CurrentSchematicWireV5TitleCommand):string{const {params:_params,...tags}=command;return JSON.stringify({...tags,params:fields(command).params});}
const selectorKeys=new Map(cases.map((command,index)=>[key(command),index]));
export function currentSchematicWireV5TitleTemplate(input:CurrentSchematicWireV5TitleCommand):Readonly<{selector:number;method:string;names:readonly string[];template:string}>{
 const command=validateCurrentSchematicWireV5TitleCommand(input);const selector=selectorKeys.get(key(command));if(selector===undefined){throw new Error("WIRE_V5_TITLE_SELECTOR");}const parsed=fields(command);
 return Object.freeze({selector,method:command.method,names:parsed.names,template:JSON.stringify({method:command.method,params:parsed.params})});
}
/** The fixed codec already validates the complete discriminated command.
 * Its private transport envelope keeps that runtime data without multiplying
 * every observer subtype through the shared Pipe's unrelated command union. */
interface CurrentSchematicWireV5TitleEnvelope{readonly id:number;readonly schematicWireV5Title:true;readonly sessionId:string}
export type CurrentSchematicWireV5TitleWire=CurrentSchematicWireV5TitleEnvelope&(
 Readonly<{method:"Debugger.evaluateOnCallFrame";params:Readonly<Record<string,unknown>>&Readonly<{expression:string;callFrameId:string}>}>|
 Readonly<{method:Exclude<CurrentSchematicWireV5TitleCommand["method"],"Debugger.evaluateOnCallFrame">;params:Readonly<Record<string,unknown>>}>
);
export function currentSchematicWireV5TitleWire(input:unknown,id:number,sessionId:string):Readonly<{command:CurrentSchematicWireV5TitleCommand;wire:CurrentSchematicWireV5TitleWire;request:Readonly<Record<string,string|number>>}>{
 const command=validateCurrentSchematicWireV5TitleCommand(input);handle.parse(sessionId);z.number().int().positive().max(2_147_483_647).parse(id);const template=currentSchematicWireV5TitleTemplate(command);const parsed=fields(command);const request:Record<string,string|number>={action:"schematic-wire-v5-title",requestId:id,selector:template.selector,method:command.method,...parsed.values};
 return Object.freeze({command,wire:freezeDeep({id,...command,schematicWireV5Title:true as const,sessionId}),request:Object.freeze(request)});
}
