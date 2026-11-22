/** Wire V5 same-realm readonly reflection bootstrap. All fields are actual
 * private Inspector references; no caller intrinsic/global/boolean is admitted. */
import { z } from "zod";
import { captureCurrentFootprintInverseDeleteBindingReply as capture } from "./current-footprint-inverse-delete-binding-capture.ts";
import { CURRENT_NATIVE_OWN_DATA_CHECK,CURRENT_NATIVE_OWN_DATA_BIND as bind,CURRENT_NATIVE_OWN_DATA_IDENTITIES as identities,CURRENT_NATIVE_OWN_DATA_LITERAL as literal,CURRENT_NATIVE_OWN_DATA_REPROVE as reprove } from "./current-native-own-data-intrinsics.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_RAW_NATIVE_PROGRAM } from "./current-schematic-relevance-action-raw-programs.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const globals=`function(){"use strict";${CURRENT_NATIVE_OWN_DATA_CHECK}const object=value(root,"Object"),reflect=value(root,"Reflect"),array=value(root,"Array"),map=value(root,"Map"),set=value(root,"Set");return[object,reflect,array,map,set];}`;
const continuity=`function(roots,native){"use strict";${CURRENT_NATIVE_OWN_DATA_CHECK}
dense(roots,5);dense(native,19);const labels=["Object","Reflect","Array","Map","Set"];for(let i=0;i<5;i++){if(value(root,labels[i])!==value(roots,""+i))bad();}
const object=value(roots,"0"),reflect=value(roots,"1"),array=value(roots,"2"),map=value(roots,"3"),set=value(roots,"4"),mapProto=value(map,"prototype"),setProto=value(set,"prototype");
if(value(object,"prototype")!==objectProto||value(array,"prototype")!==arrayProto||value(native,"15")!==objectProto||value(native,"16")!==arrayProto||value(native,"17")!==mapProto||value(native,"18")!==setProto)bad();
const parents=[arrayProto,objectProto];for(let i=0;i<2;i++){const list=names(parents[i]);for(let j=0;j<list.length;j++){const key=list[j];if(key!==""&&+key>=0&&+key<4294967295&&""+(+key)===key)bad();}}
const objects=[object,reflect,array,mapProto,setProto],rows=[[0,"getOwnPropertyDescriptor","value"],[0,"getOwnPropertyDescriptors","value"],[0,"getPrototypeOf","value"],[0,"is","value"],[0,"hasOwn","value"],[1,"ownKeys","value"],[1,"apply","value"],[2,"isArray","value"],[3,"get","value"],[3,"has","value"],[3,"forEach","value"],[3,"size","get"],[4,"has","value"],[4,"forEach","value"],[4,"size","get"]];
for(let i=0;i<15;i++){const row=rows[i],d=get(objects[row[0]],row[1]),fn=value(native,""+i);if(!d||field(d,row[2])!==fn||d.enumerable||!d.configurable||proto(fn)!==functionProto)bad();if(row[2]==="value"){if(!d.writable||has(d,"get")||has(d,"set"))bad();}else if(has(d,"value")||has(d,"writable")||field(d,"set")!==undefined)bad();}
return true;}`;
export const CURRENT_SCHEMATIC_WIRE_GLOBALS_PROGRAMS=Object.freeze({literal,identities,bind,reprove,globals,native:CURRENT_SCHEMATIC_RELEVANCE_RAW_NATIVE_PROGRAM,continuity});
export const CURRENT_SCHEMATIC_WIRE_GLOBALS_FLAGS=Object.freeze({objectGroup:"easyeda-schematic-wire-globals-v1",silent:true,generatePreview:false,throwOnSideEffect:true,awaitPromise:false,userGesture:false}as const);
export const CURRENT_SCHEMATIC_WIRE_GLOBALS_REQUESTS=Object.freeze({normal:46,helpers:7,cdpRequests:53,controls:55,events:7,cleanupAfterOriginalExit:0});
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u),ref=z.strictObject({objectId:handle});
const flags={objectGroup:z.literal(CURRENT_SCHEMATIC_WIRE_GLOBALS_FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true),awaitPromise:z.literal(false),userGesture:z.literal(false)};
const propertyRoles=["literal","object-literal","function-literal","object-prototype","array-prototype","function-prototype","object-constructor","array-constructor"]as const;
const props=z.strictObject({objectId:handle,ownProperties:z.literal(true),accessorPropertiesOnly:z.literal(false),generatePreview:z.literal(false)});
export const CURRENT_SCHEMATIC_WIRE_GLOBALS_ORDER=Object.freeze([
 "wire-globals-literal",...propertyRoles.map(role=>`wire-globals-properties-${role}`),
 ...Array.from({length:7},(_,i)=>`wire-globals-native-${String(i)}`),
 "wire-globals-identities","wire-globals-bind","wire-globals-reprove","wire-globals-globals","wire-globals-properties-roots",
 ...Array.from({length:5},(_,i)=>`wire-globals-properties-root-${String(i)}`),...Array.from({length:2},(_,i)=>`wire-globals-properties-prototype-${String(i)}`),
 ...Array.from({length:15},(_,i)=>`wire-globals-properties-function-${String(i)}`),"wire-globals-native","wire-globals-properties-native","wire-globals-continuity"]);
const propertyPhases=[...["roots",...Array.from({length:5},(_,i)=>`root-${String(i)}`),...Array.from({length:2},(_,i)=>`prototype-${String(i)}`),...Array.from({length:15},(_,i)=>`function-${String(i)}`),"native"].map(role=>`wire-globals-properties-${role}` as const),...propertyRoles.map(role=>`wire-globals-properties-${role}`as const),...Array.from({length:7},(_,index)=>`wire-globals-native-${String(index)}`as const)];
/* oxlint-disable unicorn/max-nested-calls -- The finite bootstrap schema keeps each exact readonly native signature together. */
const schema=z.union([
 z.strictObject({phase:z.literal("wire-globals-literal"),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...flags,uniqueContextId:handle,functionDeclaration:z.literal(literal),arguments:z.tuple([]),returnByValue:z.literal(false)})}),
 ...(["identities","bind","reprove","globals","native","continuity","check"]as const).map(role=>z.strictObject({phase:z.literal(`wire-globals-${role}`),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...flags,objectId:handle,functionDeclaration:z.literal((role==="check"?continuity:CURRENT_SCHEMATIC_WIRE_GLOBALS_PROGRAMS[role])),arguments:z.array(ref).max(19),returnByValue:z.literal(role!=="bind"&&role!=="globals"&&role!=="native")})})),
 ...propertyPhases.map(phase=>z.strictObject({phase:z.literal(phase),method:z.literal("Runtime.getProperties"),params:props})),
 z.strictObject({phase:z.literal("wire-globals-helper"),method:z.literal("Debugger.getScriptSource"),params:z.strictObject({scriptId:handle})}),
]);
/* oxlint-enable unicorn/max-nested-calls */
export type CurrentSchematicWireGlobalsCommand=Readonly<z.infer<typeof schema>>;
function need(value:boolean):asserts value{if(!value){throw new Error("SCHEMATIC_WIRE_GLOBALS_PROTOCOL");}}
function argumentCount(phase:string):number{if(phase==="wire-globals-native"){return 19;}if((phase==="wire-globals-continuity"||phase==="wire-globals-check")){return 2;}if(phase==="wire-globals-bind"){return 11;}if(phase==="wire-globals-identities"){return 7;}return 0;}
const properties=(phase:string):unknown=>({phase,method:"Runtime.getProperties",params:{objectId:"original_ref",ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}});
export function validateCurrentSchematicWireGlobalsCommand(input:unknown):CurrentSchematicWireGlobalsCommand{const command=schema.parse(capture(input));if(command.method==="Runtime.callFunctionOn"){const count=argumentCount(command.phase);need(command.params.arguments.length===count);}return freezeDeep(command);}
export function currentSchematicWireGlobalsProgram(command:CurrentSchematicWireGlobalsCommand):string|null{return command.method==="Runtime.callFunctionOn"?command.params.functionDeclaration:null;}
export function qualifyCurrentSchematicWireGlobalsHelper(source:unknown,program:string):void{need(Object.values(CURRENT_SCHEMATIC_WIRE_GLOBALS_PROGRAMS).some(value=>value===program)&&source===`(${program})`);}
export function currentSchematicWireGlobalsWire(input:CurrentSchematicWireGlobalsCommand,id:number,sessionId:string):CurrentSchematicWireGlobalsCommand&Readonly<{id:number;sessionId:string;schematicWireGlobals:true}>{need(Number.isSafeInteger(id)&&id>0&&id<=2_147_483_647);handle.parse(sessionId);return freezeDeep({id,...validateCurrentSchematicWireGlobalsCommand(input),schematicWireGlobals:true,sessionId});}
export function currentSchematicWireGlobalsNativeFrame(bytes:Buffer,input:CurrentSchematicWireGlobalsCommand,sessionId:string):Readonly<Record<string,string|number>>{need(bytes.length<=65_536&&bytes.at(-1)===0);const raw:unknown=JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(bytes.subarray(0,-1)));const id=z.looseObject({id:z.number().int().positive().max(2_147_483_647)}).parse(capture(raw)).id;const command=validateCurrentSchematicWireGlobalsCommand(input);need(bytes.toString("utf8")===`${JSON.stringify(currentSchematicWireGlobalsWire(command,id,sessionId))}\0`);const fields:Record<string,string|number>={action:"schematic-wire-v5-globals",requestId:id,phase:command.phase,method:command.method};if(command.method==="Debugger.getScriptSource"){fields["scriptId"]=command.params.scriptId;}else if(command.phase==="wire-globals-literal"){fields["uniqueContextId"]=command.params.uniqueContextId;}else{fields["objectId"]=command.params.objectId;if(command.method==="Runtime.callFunctionOn"){for(const[index,arg]of command.params.arguments.entries()){fields[`reference${String(index)}`]=arg.objectId;}}}return Object.freeze(fields);}
export function currentSchematicWireGlobalsCases():readonly CurrentSchematicWireGlobalsCommand[]{return freezeDeep([
 {phase:"wire-globals-literal",method:"Runtime.callFunctionOn",params:{...CURRENT_SCHEMATIC_WIRE_GLOBALS_FLAGS,uniqueContextId:"original_context",functionDeclaration:literal,arguments:[],returnByValue:false}},
 ...propertyPhases.map(phase=>properties(phase)),
 ...(["identities","bind","reprove","globals","native","continuity","check"]as const).map(role=>({phase:`wire-globals-${role}`,method:"Runtime.callFunctionOn",params:{...CURRENT_SCHEMATIC_WIRE_GLOBALS_FLAGS,objectId:"original_ref",functionDeclaration:(role==="check"?continuity:CURRENT_SCHEMATIC_WIRE_GLOBALS_PROGRAMS[role]),arguments:Array.from({length:argumentCount(`wire-globals-${role}`)},()=>({objectId:"original_ref"})),returnByValue:role!=="bind"&&role!=="globals"&&role!=="native"}})),
 {phase:"wire-globals-helper",method:"Debugger.getScriptSource",params:{scriptId:"original_ref"}},
 ].map(input=>validateCurrentSchematicWireGlobalsCommand(input)));}
export function currentSchematicWireGlobalsTemplate(input:CurrentSchematicWireGlobalsCommand):Readonly<{phase:string;method:string;names:readonly string[];template:string}>{const command=validateCurrentSchematicWireGlobalsCommand(input),names:string[]=[];const field=(name:string):string=>{need(!names.includes(name));names.push(name);return`__wire_globals_${name}__`;};const params:Record<string,unknown>={...command.params};if(command.method==="Debugger.getScriptSource"){params["scriptId"]=field("scriptId");}else if(command.phase==="wire-globals-literal"){params["uniqueContextId"]=field("uniqueContextId");params["functionDeclaration"]="__wire_globals_programliteral__";}else{params["objectId"]=field("objectId");if(command.method==="Runtime.callFunctionOn"){params["functionDeclaration"]=`__wire_globals_program${command.phase.slice("wire-globals-".length)}__`;params["arguments"]=command.params.arguments.map((_,index)=>({objectId:field(`reference${String(index)}`)}));}}return freezeDeep({phase:command.phase,method:command.method,names,template:JSON.stringify({method:command.method,params})});}

/** Same fixed private channel bytes and scalar native selector, without an owner. */
export function currentSchematicWireGlobalsFixedWire(input:unknown,id:number,sessionId:string):Readonly<{command:CurrentSchematicWireGlobalsCommand;request:Readonly<Record<string,string|number>>}>{
 const command=validateCurrentSchematicWireGlobalsCommand(input),wire=currentSchematicWireGlobalsWire(command,id,sessionId);
 const bytes=Buffer.from(`${JSON.stringify(wire)}\0`);
 return Object.freeze({command,request:currentSchematicWireGlobalsNativeFrame(bytes,command,sessionId)});
}
