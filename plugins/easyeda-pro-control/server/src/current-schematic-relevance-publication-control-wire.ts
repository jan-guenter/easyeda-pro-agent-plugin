/** Fixed publisher source guards and comparison helpers. Only original
 * opaque references, script IDs and frame IDs vary on this wire. */
import {freezeDeep} from "./sqlite-inventory-core.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_CONTROL_CALLS as CALLS,CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_CONTROL_FLAGS as FLAGS,CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_CONTROL_FRAMES as FRAMES,CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_RETURN_ROLES as ROLES,currentSchematicRelevancePublicationFunctionPoint as functionPoint,currentSchematicRelevancePublicationReturnPoint as returnPoint,validateCurrentSchematicRelevancePublicationControlCommand as validate} from "./current-schematic-relevance-publication-control-protocol.ts";
import type {CurrentSchematicRelevancePublicationControlCommand as Command} from "./current-schematic-relevance-publication-control-protocol.ts";

/** Enumerate the finite source guards, frame captures and comparison rows;
 * representative handles never grant execution or choose a source point. */
export function currentSchematicRelevancePublicationControlCases():readonly Command[]{
 const rows:Command[]=[validate({phase:"publication-control-properties",method:"Runtime.getProperties",params:{objectId:"original_ref",ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}}),validate({phase:"publication-control-resume",method:"Debugger.resume",params:{}})];
 for(const variant of[0,1]as const){for(const role of ROLES){const f=functionPoint(variant,role);const p=returnPoint(variant,role);const location={scriptId:"original_ref",lineNumber:p.lineNumber,columnNumber:p.columnNumber};rows.push(validate({phase:"publication-control-possible",variant,role,method:"Debugger.getPossibleBreakpoints",params:{start:{scriptId:"original_ref",lineNumber:f.lineNumber,columnNumber:f.columnNumber},end:{...location,columnNumber:location.columnNumber+1},restrictToFunction:true}}),validate({phase:"publication-control-return",variant,role,method:"Debugger.setBreakpoint",params:{location,condition:""}}));}}
 for(const role of["post","loopback"]as const){rows.push(validate({phase:"publication-control-function",role,method:"Debugger.setBreakpointOnFunctionCall",params:{objectId:"original_ref",condition:""}}));}
 for(const stage of["post","publisher","timer"]as const){rows.push(validate({phase:"publication-control-frame",stage,method:"Debugger.evaluateOnCallFrame",params:{...FLAGS,callFrameId:"original_ref",expression:FRAMES[stage],returnByValue:false,includeCommandLineAPI:false}}));}
 for(const row of CALLS){rows.push(validate({phase:"publication-control-call",role:row[0],method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:"original_ref",functionDeclaration:row[1],arguments:Array.from({length:row[2]},()=>({objectId:"original_ref"})),returnByValue:row[3],awaitPromise:false,userGesture:false}}));}
 return freezeDeep(rows);
}
/** Substitute handles only; each source role/variant/helper remains part of
 * the immutable selected row. No native input supplies JavaScript or a point. */
export function currentSchematicRelevancePublicationControlTemplate(input:unknown):Readonly<{phase:string;method:string;names:readonly string[];values:Readonly<Record<string,string>>;template:string}>{
 const command=validate(input);const names:string[]=[];const values:Record<string,string>={};const params:Record<string,unknown>={...command.params};let phase:string=command.phase;
 const field=(name:string,value:string):string=>{if(!names.includes(name)){names.push(name);}values[name]=value;return `__schematic_publicationcontrol_${name}__`;};
 if(command.phase==="publication-control-possible"){phase+=`-${command.role}-${String(command.variant)}`;params["start"]={...command.params.start,scriptId:field("scriptId",command.params.start.scriptId)};params["end"]={...command.params.end,scriptId:field("scriptId",command.params.end.scriptId)};}
 else if(command.phase==="publication-control-return"){phase+=`-${command.role}-${String(command.variant)}`;params["location"]={...command.params.location,scriptId:field("scriptId",command.params.location.scriptId)};}
 else if(command.phase==="publication-control-frame"){phase+=`-${command.stage}`;params["callFrameId"]=field("callFrameId",command.params.callFrameId);}
 else if(command.phase!=="publication-control-resume"){params["objectId"]=field("objectId",command.params.objectId);if(command.phase==="publication-control-function"){phase+=`-${command.role}`;}else if(command.phase==="publication-control-call"){const index=CALLS.findIndex(row=>row[0]===command.role);if(index===-1){throw new Error("SCH_PUBLICATION_CONTROL_TABLE");}phase+=`-${command.role}`;params["functionDeclaration"]=`__schematic_publicationcontrol_program${String(index)}__`;params["arguments"]=command.params.arguments.map((arg,i)=>({objectId:field(`argument${String(i)}`,arg.objectId)}));}}
 return freezeDeep({phase,method:command.method,names,values,template:JSON.stringify({method:command.method,params})});
}
/** Encode a validated row with its original request ID; controls and
 * JavaScript remain fixed by the selected source-owned protocol. */
export function currentSchematicRelevancePublicationControlWire(input:unknown,requestId:number):Readonly<{command:Command;request:Readonly<Record<string,string|number>>}>{if(!Number.isSafeInteger(requestId)||requestId<1||requestId>2_147_483_647){throw new Error("SCH_PUBLICATION_CONTROL_ID");}const command=validate(input),row=currentSchematicRelevancePublicationControlTemplate(command);return freezeDeep({command,request:{action:"schematic-relevance-publication",requestId,phase:row.phase,method:row.method,...row.values}});}
