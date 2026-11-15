/** Thirteen source holds for the actual existing UI providers. The first-hit
 * return is separate from the old full-function last-return profile. */
import {z}from"zod";
import {captureCurrentPcbStringClockReply as capture}from"./current-pcb-string-clock-reply.ts";
import {freezeDeep}from"./sqlite-inventory-core.ts";
import {CURRENT_SCHEMATIC_WIRE_SERVICE_SOURCE as SERVICE}from"./current-schematic-wire-service-source.ts";
import {currentSchematicWireClassicRpcSourceRow as classic}from"./current-schematic-wire-classic-rpc-source.ts";

const rows=SERVICE[2].rows;
const closing=classic(2,"uiClosingGetter");const valueProfile=classic(2,"uiLocale__getValue");const language=classic(2,"uiLocale_i18n");
function point(profile:Readonly<{points:Readonly<Record<string,Readonly<{lineNumber:number;columnNumber:number}>>>}>,kind:"entry"|"returned"):Readonly<{lineNumber:number;columnNumber:number}>{const selected=profile.points[kind];if(selected===undefined){throw new Error("WIRE_UI_RUNTIME_POINT");}return selected;}
export const CURRENT_SCHEMATIC_WIRE_UI_RUNTIME_KINDS=Object.freeze(["lookupEntry","instanceEntry","instanceReturned","getEntry","getReturned","lookupReturned","closingEntry","closingReturned","trim","currEntry","currReturned","valueEntry","valueReturned"]as const);
export const CURRENT_SCHEMATIC_WIRE_UI_RUNTIME_POINTS=freezeDeep({
 lookupEntry:{profile:rows.registryLookup,point:point(rows.registryLookup,"entry"),frame:"lookup",caller:"closing",returned:"none"},
 instanceEntry:{profile:rows.registryGetInstance,point:point(rows.registryGetInstance,"entry"),frame:"instance",caller:"lookup",returned:"none"},
 instanceReturned:{profile:rows.registryGetInstance,point:point(rows.registryGetInstance,"returned"),frame:"instance",caller:"lookup",returned:"tool"},
 getEntry:{profile:rows.registryGet,point:point(rows.registryGet,"entry"),frame:"get",caller:"lookup",returned:"none"},
 getReturned:{profile:rows.registryGet,point:point(rows.registryGet,"returned"),frame:"get",caller:"lookup",returned:"controller"},
 lookupReturned:{profile:rows.registryLookup,point:point(rows.registryLookup,"returned"),frame:"lookup",caller:"closing",returned:"controller"},
 closingEntry:{profile:closing,point:point(closing,"entry"),frame:"closing",caller:"closing",returned:"none"},
 closingReturned:{profile:closing,point:point(closing,"returned"),frame:"closing",caller:"closing",returned:"false"},
 trim:{profile:language,point:{lineNumber:1172,columnNumber:1_834_491},frame:"trim",caller:null,returned:"none"},
 currEntry:{profile:rows.localeCurr,point:point(rows.localeCurr,"entry"),frame:"curr",caller:"language",returned:"none"},
 currReturned:{profile:rows.localeCurr,point:point(rows.localeCurr,"returned"),frame:"curr",caller:"language",returned:"locale"},
 valueEntry:{profile:valueProfile,point:point(valueProfile,"entry"),frame:"value",caller:"language",returned:"none"},
 valueReturned:{profile:valueProfile,point:{lineNumber:1172,columnNumber:1_834_007},frame:"value",caller:"language",returned:"translation"},
}as const);
export type CurrentSchematicWireUiRuntimePoint=typeof CURRENT_SCHEMATIC_WIRE_UI_RUNTIME_KINDS[number];
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const location=z.strictObject({scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()});
const frame=z.object({callFrameId:handle,location,functionLocation:location.optional(),returnValue:z.unknown().optional()});
const paused=z.object({reason:z.literal("other"),hitBreakpoints:z.array(handle).length(1),callFrames:z.array(frame).min(1).max(64)});
function need(value:boolean):asserts value{if(!value){throw new Error("WIRE_UI_RUNTIME_SOURCE");}}
export function decodeCurrentSchematicWireUiRuntimePause(input:unknown,kind:CurrentSchematicWireUiRuntimePoint,scriptId:string,breakpointId:string):Readonly<{frame:string;caller:string|null;returnValue:unknown;originalNativeEventJoined:false}>{
 handle.parse(scriptId);handle.parse(breakpointId);const row=CURRENT_SCHEMATIC_WIRE_UI_RUNTIME_POINTS[kind];need(row!==undefined);
 const packet=paused.parse(capture(input).value),top=packet.callFrames[0];need(top!==undefined&&packet.hitBreakpoints[0]===breakpointId);
 need(top.location.scriptId===scriptId&&top.location.lineNumber===row.point.lineNumber&&top.location.columnNumber===row.point.columnNumber&&top.functionLocation?.scriptId===scriptId&&top.functionLocation.lineNumber===row.profile.lineNumber&&top.functionLocation.columnNumber===row.profile.columnNumber);
 let caller:string|null=null;
 if(row.caller!==null){const parent=packet.callFrames[1];need(parent!==undefined);const profile=row.caller==="lookup"?rows.registryLookup:classic(2,row.caller==="closing"?"uiClosing":"uiLocale_i18n");need(parent.location.scriptId===scriptId&&parent.functionLocation?.scriptId===scriptId&&parent.functionLocation.lineNumber===profile.lineNumber&&parent.functionLocation.columnNumber===profile.columnNumber);caller=parent.callFrameId;}
 if(row.returned==="none"){need(top.returnValue===undefined);}else{need(top.returnValue!==undefined);}
 return Object.freeze({frame:top.callFrameId,caller,returnValue:top.returnValue,originalNativeEventJoined:false});
}
