/** Complete finite observer vocabulary for the original V5 coordinator.
 * There is no Modify, application invocation, arbitrary condition or Save. */
/* oxlint-disable import/max-dependencies -- Fixed case generation mirrors the existing closed schemas without broadening any one of them. */
import {captureCurrentPcbStringClockReply as capture} from "./current-pcb-string-clock-reply.ts";
import type {CurrentSchematicWireParserServiceCommand} from "./current-schematic-wire-parser-service-coordinator.ts";
import {currentSchematicWireTitleFtV5Cases,validateCurrentSchematicWireTitleFtV5Command} from "./current-schematic-wire-title-ft-v5-protocol.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";
import {currentSchematicWireParserCases,validateCurrentSchematicWireParserCommand} from "./current-schematic-wire-parser-protocol.ts";
import {currentSchematicWireParserHelperCases,validateCurrentSchematicWireParserHelperCommand} from "./current-schematic-wire-parser-helper-protocol.ts";
import {currentSchematicWireParserDriverCases,validateCurrentSchematicWireParserDriverControl} from "./current-schematic-wire-parser-driver-protocol.ts";
import {CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_SHARED_CALLS as RPC,CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_SHARED_FLAGS as RPC_FLAGS,validateCurrentSchematicWireClassicRpcSharedCommand as rpc} from "./current-schematic-wire-classic-rpc-shared-protocol.ts";
import {CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_SHARED_FRAMES as RPC_FRAMES} from "./current-schematic-wire-classic-rpc-shared-programs.ts";
import {CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_DRIVER_POINTS as RPC_POINTS,validateCurrentSchematicWireClassicRpcDriverControl as rpcControl,currentSchematicWireClassicRpcDriverLocation as rpcLocation} from "./current-schematic-wire-classic-rpc-driver-protocol.ts";
import {CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_ORIGIN_PROGRAMS as ORIGIN,CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_ORIGIN_FRAMES as ORIGIN_FRAMES} from "./current-schematic-wire-classic-rpc-origin.ts";
import {CURRENT_SCHEMATIC_WIRE_SERVICE_INVOCATION_FLAGS as FLAGS,CURRENT_SCHEMATIC_WIRE_SERVICE_INVOCATION_CALLS as SERVICE,validateCurrentSchematicWireServiceInvocationCommand as service} from "./current-schematic-wire-service-invocation-protocol.ts";
import {CURRENT_SCHEMATIC_WIRE_SERVICE_INVOCATION_FRAMES as SERVICE_FRAMES} from "./current-schematic-wire-service-invocation-programs.ts";
import {CURRENT_SCHEMATIC_WIRE_SERVICE_INVOCATION_KINDS as SERVICE_KINDS,CURRENT_SCHEMATIC_WIRE_SERVICE_INVOCATION_POINTS as SERVICE_POINTS} from "./current-schematic-wire-service-invocation-source.ts";
import {validateCurrentSchematicWireServiceDriverControl as serviceControl} from "./current-schematic-wire-service-driver-protocol.ts";
import {CURRENT_SCHEMATIC_WIRE_UI_RUNTIME_CALLS as UI,CURRENT_SCHEMATIC_WIRE_UI_RUNTIME_ALIASES as UI_ALIASES,CURRENT_SCHEMATIC_WIRE_UI_RUNTIME_FRAMES as UI_FRAMES,CURRENT_SCHEMATIC_WIRE_UI_RUNTIME_RETAIN as UI_RETAIN} from "./current-schematic-wire-ui-runtime-programs.ts";
import {CURRENT_SCHEMATIC_WIRE_UI_RUNTIME_KINDS as UI_KINDS,CURRENT_SCHEMATIC_WIRE_UI_RUNTIME_POINTS as UI_POINTS} from "./current-schematic-wire-ui-runtime-source.ts";
import {validateCurrentSchematicWireUiRuntimeCommand as ui} from "./current-schematic-wire-ui-runtime-protocol.ts";
import {CURRENT_SCHEMATIC_WIRE_TREE_RUNTIME_PROGRAMS as TREE,CURRENT_SCHEMATIC_WIRE_TREE_RUNTIME_FRAMES as TREE_FRAMES} from "./current-schematic-wire-tree-runtime-programs.ts";
import {CURRENT_SCHEMATIC_WIRE_TREE_RUNTIME_KINDS as TREE_KINDS,currentSchematicWireTreeRuntimePoints as treePoints} from "./current-schematic-wire-tree-runtime-source.ts";
import {validateCurrentSchematicWireTreeRuntimeCommand as validateTree} from "./current-schematic-wire-tree-runtime-protocol.ts";
import {CURRENT_SCHEMATIC_WIRE_TITLE_CALLS as TITLE,CURRENT_SCHEMATIC_WIRE_TITLE_KINDS as TITLE_KINDS,validateCurrentSchematicWireTitleCommand as title,currentSchematicWireTitlePoints as titlePoints} from "./current-schematic-wire-title-protocol.ts";
import {CURRENT_SCHEMATIC_WIRE_TITLE_FT_PROGRAMS as FT,CURRENT_SCHEMATIC_WIRE_TITLE_FRAMES as TITLE_FRAMES} from "./current-schematic-wire-title-programs.ts";
import {CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_SOURCE as RPC_SOURCE} from "./current-schematic-wire-classic-rpc-source.ts";
import {validateCurrentSchematicWireTitleFtCommand as ft} from "./current-schematic-wire-title-ft-protocol.ts";

const id="original27";
function call(phase:string,role:string,program:string,refs:number,byValue:boolean,flags:typeof FLAGS|typeof RPC_FLAGS=FLAGS,values=0):unknown{return{phase,role,method:"Runtime.callFunctionOn",params:{...flags,awaitPromise:false,userGesture:false,objectId:id,functionDeclaration:program,arguments:[...Array.from({length:refs},()=>({objectId:id})),...Array.from({length:values},()=>({value:"original scalar"}))],returnByValue:byValue}};}
function frame(phase:string,role:string,expression:string,variant?:number,flags:typeof FLAGS|typeof RPC_FLAGS=FLAGS):unknown{return{phase,role,...(variant===undefined?{}:{variant}),method:"Debugger.evaluateOnCallFrame",params:{...flags,callFrameId:id,expression,returnByValue:false,includeCommandLineAPI:false}};}
function props(phase:string,kind?:"fields"|"large"):unknown{return{phase,...(kind===undefined?{}:{kind}),method:"Runtime.getProperties",params:{objectId:id,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}};}
function controls(prefix:string):readonly unknown[]{return[{phase:`${prefix}-source`,method:"Debugger.getScriptSource",params:{scriptId:id}},{phase:`${prefix}-resume`,method:"Debugger.resume",params:{}},{phase:`${prefix}-remove`,method:"Debugger.removeBreakpoint",params:{breakpointId:id}}];}
function arm(phase:string,tags:object,point:Readonly<{lineNumber:number;columnNumber:number}>,condition?:string):unknown{return{phase,...tags,method:"Debugger.setBreakpoint",params:{location:{scriptId:id,lineNumber:point.lineNumber,columnNumber:point.columnNumber},...(condition===undefined?{}:{condition})}};}
function treeReferences(role:string):number{if(role==="retain"){return 0;}if(role.startsWith("join")){return 19;}return 12;}
const variants=[0,1] as const;
const samples:readonly unknown[]=[
 ...currentSchematicWireParserCases(),...currentSchematicWireParserHelperCases(),...currentSchematicWireParserDriverCases(),
 ...Object.entries(RPC).map(([role,row])=>call("classic-rpc-call",role,row.program,row.refs,row.byValue,RPC_FLAGS)),
 ...Object.entries(RPC_FRAMES[2]).map(([role,expression])=>frame("classic-rpc-frame",role,expression,2,RPC_FLAGS)),
 ...(["fields","large"] as const).map(kind=>props("classic-rpc-properties",kind)),
 {phase:"classic-rpc-await",method:"Runtime.awaitPromise",params:{promiseObjectId:id,returnByValue:false,generatePreview:false}},
 {phase:"classic-rpc-release",method:"Runtime.releaseObjectGroup",params:{objectGroup:RPC_FLAGS.objectGroup}},
 ...Object.entries(ORIGIN_FRAMES).map(([role,expression])=>frame("wire-rpc-driver-origin-frame",role,expression,undefined,RPC_FLAGS)),
 ...Object.entries(ORIGIN).map(([role,program])=>call("wire-rpc-driver-origin-call",role,program,role==="join"?6:3,role==="join",RPC_FLAGS)),
 ...RPC_POINTS.map(([point])=>arm("wire-rpc-driver-arm",{point,variant:2},rpcLocation(point))),...controls("wire-rpc-driver"),
 ...Object.entries(SERVICE).map(([role,row])=>call("wire-service-invocation-call",role,row.program,row.refs,row.byValue,FLAGS,row.values)),
 ...Object.entries(SERVICE_FRAMES.ui).map(([role,expression])=>frame("wire-service-invocation-frame",role,expression,2)),
 ...variants.flatMap(variant=>Object.entries(SERVICE_FRAMES.sch[variant]).map(([role,expression])=>frame("wire-service-invocation-frame",role,expression,variant))),
 frame("wire-service-invocation-frame","caught","[this,i,o,n,e,s]",2),frame("wire-service-invocation-frame","rejected","[this,c,a,o,l]",2),props("wire-service-invocation-properties"),
 {phase:"wire-service-invocation-release",method:"Runtime.releaseObjectGroup",params:{objectGroup:FLAGS.objectGroup}},
 ...variants.flatMap(variant=>SERVICE_KINDS.map(point=>arm("wire-service-driver-arm",{variant,point},SERVICE_POINTS[variant].points[point]))),...controls("wire-service-driver"),
 ...[...UI,{role:"retain",program:UI_RETAIN,refs:0,byValue:false},{role:"aliases",program:UI_ALIASES,refs:10,byValue:true}].map(row=>call("wire-ui-runtime-call",row.role,row.program,row.refs,row.byValue)),
 ...Object.entries(UI_FRAMES).map(([role,expression])=>frame("wire-ui-runtime-frame",role,expression)),
 ...UI_KINDS.map(point=>arm("wire-ui-runtime-arm",{point},UI_POINTS[point].point)),props("wire-ui-runtime-properties"),...controls("wire-ui-runtime"),
 ...Object.entries(TREE).map(([role,program])=>call("wire-tree-runtime-call",role,program,treeReferences(role),role!=="retain")),
 ...variants.flatMap(variant=>Object.entries(TREE_FRAMES[variant]).map(([role,expression])=>frame("wire-tree-runtime-frame",role,expression,variant))),
 ...variants.flatMap(variant=>(["objectContent","pageContent"] as const).flatMap(tree=>TREE_KINDS.map(point=>arm("wire-tree-runtime-arm",{variant,tree,point},treePoints(variant,tree)[point])))),props("wire-tree-runtime-properties"),...controls("wire-tree-runtime"),
 ...Object.entries(TITLE).map(([role,row])=>call("wire-title-call",role,row.program,row.refs,row.byValue)),
 ...Object.entries(TITLE_FRAMES).map(([role,expression])=>frame("wire-title-frame",role,expression)),
 ...variants.flatMap(variant=>TITLE_KINDS.map(point=>arm("wire-title-arm",{variant,point},{lineNumber:RPC_SOURCE[variant].rows.titleQuery.lineNumber,columnNumber:titlePoints(variant)[point]}))),props("wire-title-properties"),...controls("wire-title"),
 ...Object.entries(FT).map(([role,program])=>call("wire-title-ft-call",role,program,({retain:0,compare:8,join:11,scopeArray:1,arrayCurrent:1} as Readonly<Record<string,number>>)[role]??-1,role!=="retain"&&role!=="scopeArray")),
 ...currentSchematicWireTitleFtV5Cases(),
 {phase:"wire-title-ft-frame",method:"Debugger.evaluateOnCallFrame",params:{...FLAGS,callFrameId:id,expression:"[i,e]",returnByValue:false,includeCommandLineAPI:false}},props("wire-title-ft-properties"),...controls("wire-title-ft"),
];
export function validateCurrentSchematicWireV5RuntimeCommand(raw:unknown):CurrentSchematicWireParserServiceCommand{
 const input=capture(raw).value;
 if(typeof input!=="object"||input===null||!("phase"in input)||typeof input.phase!=="string"){throw new Error("WIRE_V5_RUNTIME_PHASE");}const phase=input.phase;
 if(phase==="wire-title-ft-arm"){throw new Error("WIRE_V5_CONDITIONAL_FT_NOT_ADMITTED");}if(phase.startsWith("wire-title-ft-v5-")){return validateCurrentSchematicWireTitleFtV5Command(input);}
 if(phase.startsWith("wire-parser-driver-")){return validateCurrentSchematicWireParserDriverControl(input);}if(phase.startsWith("wire-parser-helper-")){return validateCurrentSchematicWireParserHelperCommand(input);}if(phase.startsWith("wire-parser-")){return validateCurrentSchematicWireParserCommand(input);}
 if(phase.startsWith("classic-rpc-")){return rpc(input);}if(phase.startsWith("wire-rpc-driver-")){return rpcControl(input);}if(phase.startsWith("wire-service-invocation-")){return service(input);}if(phase.startsWith("wire-service-driver-")){return serviceControl(input);}if(phase.startsWith("wire-ui-runtime-")){return ui(input);}if(phase.startsWith("wire-tree-runtime-")){return validateTree(input);}if(phase.startsWith("wire-title-ft-")){return ft(input);}if(phase.startsWith("wire-title-")){return title(input);}throw new Error("WIRE_V5_RUNTIME_PHASE");
}
export type CurrentSchematicWireV5RuntimeCommand=CurrentSchematicWireParserServiceCommand;
const cases=freezeDeep(samples.map(row=>validateCurrentSchematicWireV5RuntimeCommand(row)));
export function currentSchematicWireV5RuntimeCases():readonly CurrentSchematicWireV5RuntimeCommand[]{return cases;}
