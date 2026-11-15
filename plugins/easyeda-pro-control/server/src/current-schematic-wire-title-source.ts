/** Complete original async title callback and narrow callsite holds. */
import{createHash}from"node:crypto";
import{z}from"zod";
import{freezeDeep}from"./sqlite-inventory-core.ts";
import{compareCurrentSchematicWireFunctionMetadata as compare}from"./current-schematic-wire-completion-source.ts";
import{CURRENT_SCHEMATIC_WIRE_SERVICE_SOURCE as S,qualifyCurrentSchematicWireServiceSource as qualify}from"./current-schematic-wire-service-source.ts";
import{currentSchematicWireTitlePoints as points}from"./current-schematic-wire-title-protocol.ts";
import type{CurrentSchematicWireTitleKind as Kind}from"./current-schematic-wire-title-protocol.ts";

export const CURRENT_SCHEMATIC_WIRE_TITLE_CALLBACK=freezeDeep([
 {start:5_731_514,end:5_732_593,bytes:1079,sha256:"cde1c162262065134f10fd69645ce4d08f67c575d1faebc2671e8822b9e68604",name:"",arity:2,constructible:false,className:"AsyncFunction",lineNumber:3697,columnNumber:41_904,parentType:"object",parentClassName:"AsyncFunction",parentDescription:"AsyncFunction",points:{entry:{lineNumber:3697,columnNumber:41_923},returned:{lineNumber:3697,columnNumber:42_982,type:"return"}}},
 {start:6_442_640,end:6_443_719,bytes:1079,sha256:"324f11201369f07c840f3a006b14370fa8d50e50336d94bf58b3367ee55c94d7",name:"",arity:2,constructible:false,className:"AsyncFunction",lineNumber:4331,columnNumber:238_422,parentType:"object",parentClassName:"AsyncFunction",parentDescription:"AsyncFunction",points:{entry:{lineNumber:4331,columnNumber:238_441},returned:{lineNumber:4331,columnNumber:239_500,type:"return"}}},
]as const);
export const CURRENT_SCHEMATIC_WIRE_TITLE_DOCUMENT_TYPES=freezeDeep([
 {start:1_668_456,end:1_668_841,bytes:385,sha256:"03c5647c086fbaa20c41d1a06ac15294291c4c9f36251ada138bcba68eed612d"},
 {start:1_851_891,end:1_852_276,bytes:385,sha256:"03c5647c086fbaa20c41d1a06ac15294291c4c9f36251ada138bcba68eed612d"},
]as const);
function need(value:boolean):asserts value{if(!value){throw new Error("WIRE_TITLE_SOURCE");}}
export function qualifyCurrentSchematicWireTitleSource(input:unknown):0|1{const variant=qualify(input);need(variant!==2);const source:unknown=Object.getOwnPropertyDescriptor(input,"scriptSource")?.value;need(typeof source==="string");for(const row of[CURRENT_SCHEMATIC_WIRE_TITLE_CALLBACK[variant],CURRENT_SCHEMATIC_WIRE_TITLE_DOCUMENT_TYPES[variant]]){const text=source.slice(row.start,row.end);need(Buffer.byteLength(text)===row.bytes&&createHash("sha256").update(text).digest("hex")===row.sha256);}return variant;}
export function decodeCurrentSchematicWireTitleCallback(input:unknown,actual:unknown,variant:0|1,scriptId:string):ReturnType<typeof compare>{return compare(input,actual,CURRENT_SCHEMATIC_WIRE_TITLE_CALLBACK[variant],scriptId);}
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u),location=z.strictObject({scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()});
const frame=z.object({callFrameId:handle,location,functionLocation:location,returnValue:z.unknown().optional()});
const paused=z.object({hitBreakpoints:z.array(handle).length(1),callFrames:z.array(frame).min(1).max(64)});
export function decodeCurrentSchematicWireTitlePause(input:unknown,variant:0|1,kind:Kind,scriptId:string,id:string):Readonly<{frame:string;caller:string|null;returnValue:unknown}>{
 const packet=paused.parse(input);const top=packet.callFrames[0];const row=CURRENT_SCHEMATIC_WIRE_TITLE_CALLBACK[variant];need(top!==undefined&&packet.hitBreakpoints[0]===id&&top.location.scriptId===scriptId&&top.location.lineNumber===row.lineNumber&&top.location.columnNumber===points(variant)[kind]&&top.functionLocation.scriptId===scriptId&&top.functionLocation.lineNumber===row.lineNumber&&top.functionLocation.columnNumber===row.columnNumber);
 let caller:string|null=null;if(kind==="entry"){const parent=packet.callFrames[1];const ft=S[variant].rows.helper00;need(parent!==undefined&&parent.location.scriptId===scriptId&&parent.location.lineNumber===ft.lineNumber&&parent.location.columnNumber===4865&&parent.functionLocation.scriptId===scriptId&&parent.functionLocation.lineNumber===ft.lineNumber&&parent.functionLocation.columnNumber===ft.columnNumber);caller=parent.callFrameId;}
 if(kind==="returned"){z.strictObject({type:z.literal("object"),subtype:z.literal("promise"),className:z.literal("Promise"),description:z.literal("Promise"),objectId:handle}).parse(top.returnValue);}else{need(top.returnValue===undefined);}
 return Object.freeze({frame:top.callFrameId,caller,returnValue:top.returnValue});
}
