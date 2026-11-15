/** Fixed original serial/selected-tree/no-argument helper source holds.
 * The wrapper's final expression is deliberately not called a V8 return. */
import{z}from"zod";
import{freezeDeep}from"./sqlite-inventory-core.ts";
import{CURRENT_SCHEMATIC_WIRE_ASYNC_SOURCE as A,qualifyCurrentSchematicWireAsyncSource as qualify}from"./current-schematic-wire-async-source.ts";
import{CURRENT_SCHEMATIC_WIRE_COMPLETION_SOURCE as C}from"./current-schematic-wire-completion-source.ts";

export const CURRENT_SCHEMATIC_WIRE_TREE_RUNTIME_KINDS=Object.freeze(["wrapperEntry","freshEntry","targetEntry","targetEarly","targetFinal","wrapperValue","continuation","onEntry","onReturn","freshReturn"]as const);
export type CurrentSchematicWireTreeRuntimeKind=typeof CURRENT_SCHEMATIC_WIRE_TREE_RUNTIME_KINDS[number];
const columns=freezeDeep([
 {wrapperEntry:94_857,freshEntry:94_956,wrapperValue:94_990,freshReturn:94_985,continuation:230_432,onEntry:80_772,onReturn:80_902,object:[171_398,171_917,172_820],page:[208_661,209_091,210_475]},
 {wrapperEntry:28_655,freshEntry:28_754,wrapperValue:28_788,freshReturn:28_783,continuation:84_317,onEntry:209_632,onReturn:209_762,object:[9704,10_223,11_126],page:[62_546,62_976,64_360]},
]as const);
interface SourcePoint{readonly lineNumber:number;readonly columnNumber:number;readonly functionLine:number;readonly functionColumn:number;readonly caller:null|"pass"|"wrapper"|"fresh";readonly returned:boolean}
function row(fn:Readonly<{lineNumber:number;columnNumber:number}>,columnNumber:number,caller:null|"pass"|"wrapper"|"fresh"=null,returned=false):Readonly<SourcePoint>{return Object.freeze({lineNumber:fn.lineNumber,columnNumber,functionLine:fn.lineNumber,functionColumn:fn.columnNumber,caller,returned});}
export function currentSchematicWireTreeRuntimePoints(variant:0|1,role:"objectContent"|"pageContent"):Readonly<Record<CurrentSchematicWireTreeRuntimeKind,Readonly<{lineNumber:number;columnNumber:number;functionLine:number;functionColumn:number;caller:null|"pass"|"wrapper"|"fresh";returned:boolean}>>>{
 const a=A[variant].rows,c=C[variant].rows,col=columns[variant],t=role==="objectContent"?col.object:col.page;
 return freezeDeep({wrapperEntry:row(a.serialCall,col.wrapperEntry,"pass"),freshEntry:row(a.serialFresh,col.freshEntry,"wrapper"),targetEntry:row(a[role],t[0],"fresh"),targetEarly:row(a[role],t[1],null,true),targetFinal:row(a[role],t[2],null,true),wrapperValue:row(a.serialCall,col.wrapperValue),continuation:row(c.astPassContent,col.continuation),onEntry:row(a.astOn,col.onEntry,"pass"),onReturn:row(a.astOn,col.onReturn,null,true),freshReturn:row(a.serialFresh,col.freshReturn,null,true)});
}
export function qualifyCurrentSchematicWireTreeRuntimeSource(input:unknown):0|1{return qualify(input);}
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const location=z.strictObject({scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()});
const frame=z.object({callFrameId:handle,location,functionLocation:location,returnValue:z.unknown().optional()});
const paused=z.object({hitBreakpoints:z.array(handle).length(1),callFrames:z.array(frame).min(1).max(64)});
export function decodeCurrentSchematicWireTreeRuntimePause(input:unknown,variant:0|1,role:"objectContent"|"pageContent",kind:CurrentSchematicWireTreeRuntimeKind,scriptId:string,id:string):Readonly<{frame:string;caller:string|null;returnValue:unknown}>{
 const data=paused.parse(input),point=currentSchematicWireTreeRuntimePoints(variant,role)[kind],top=data.callFrames[0];
 if(top===undefined||data.hitBreakpoints[0]!==id||top.location.scriptId!==scriptId||top.location.lineNumber!==point.lineNumber||top.location.columnNumber!==point.columnNumber||top.functionLocation.scriptId!==scriptId||top.functionLocation.lineNumber!==point.functionLine||top.functionLocation.columnNumber!==point.functionColumn){throw new Error("WIRE_TREE_RUNTIME_PAUSE");}
 let caller:string|null=null;
 if(point.caller!==null){
  const a=A[variant].rows,c=C[variant].rows,parent=data.callFrames[1];
  let fn:Readonly<{lineNumber:number;columnNumber:number}>=a.serialFresh;let pc=a.serialFresh.columnNumber+20;
  if(point.caller==="pass"){fn=c.astPassContent;pc=kind==="onEntry"?columns[variant].continuation:c.astPassContent.columnNumber+41;}
  else if(point.caller==="wrapper"){fn=a.serialCall;pc=a.serialCall.columnNumber+143;}
  if(parent===undefined||parent.functionLocation.scriptId!==scriptId||parent.functionLocation.lineNumber!==fn.lineNumber||parent.functionLocation.columnNumber!==fn.columnNumber||parent.location.scriptId!==scriptId||parent.location.lineNumber!==fn.lineNumber||parent.location.columnNumber!==pc){throw new Error("WIRE_TREE_RUNTIME_CALLER");}caller=parent.callFrameId;
 }
 if(point.returned){z.strictObject({type:z.literal("object"),subtype:z.literal("promise"),className:z.literal("Promise"),description:z.literal("Promise"),objectId:handle}).parse(top.returnValue);}
 else if(top.returnValue!==undefined){throw new Error("WIRE_TREE_RUNTIME_RETURN");}
 return Object.freeze({frame:top.callFrameId,caller,returnValue:top.returnValue});
}
