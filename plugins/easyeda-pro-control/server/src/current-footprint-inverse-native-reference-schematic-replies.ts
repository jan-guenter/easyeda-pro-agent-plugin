/** Pinned schematic body and genuine initialized-UI return stops. This parser
 * is data-only; original owner event identity is checked by the new controller. */
import {z} from "zod";
import {captureCurrentFootprintInversePreferenceReply as capture} from "./current-footprint-inverse-public-preferences-replies.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_SCHEMATIC_POINTS as POINTS} from "./current-footprint-inverse-native-reference-schematic-programs.ts";
import {currentFootprintInverseNativeReferencePcbResultPause as uiPause} from "./current-footprint-inverse-native-reference-pcb-result-replies.ts";

const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const location=z.strictObject({scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()});
const remote=z.looseObject({type:z.string(),objectId:handle.optional()});
const frame=z.strictObject({callFrameId:handle,functionName:z.string(),functionLocation:location,location,url:z.string(),scopeChain:z.array(z.unknown()).max(16),this:remote,returnValue:remote.optional(),canBeRestarted:z.boolean().optional()});
const packet=z.strictObject({method:z.literal("Debugger.paused"),sessionId:handle,params:z.strictObject({callFrames:z.array(frame).min(1).max(64),reason:z.enum(["other","debugCommand"]),hitBreakpoints:z.tuple([handle]),asyncStackTrace:z.unknown().optional(),asyncStackTraceId:z.unknown().optional()})});
export type CurrentFootprintInverseNativeReferenceSchematicPointRole=keyof typeof POINTS;
export interface CurrentFootprintInverseNativeReferenceSchematicHeld{readonly role:keyof typeof POINTS;readonly frame:string;readonly caller:string|null;readonly push:string|null;readonly returned:string|null;readonly point:string;}
function need(v:boolean):asserts v{if(!v){throw new Error("INVERSE_NATIVE_SCHEMATIC_PAUSE");}}
export function currentFootprintInverseNativeReferenceSchematicPause(input:unknown,session:string,scripts:Readonly<{ui:string;manager:string;schematic:string}>,points:ReadonlyMap<string,keyof typeof POINTS>):CurrentFootprintInverseNativeReferenceSchematicHeld{
 const raw=packet.parse(capture(input));need(raw.sessionId===session&&new Set(raw.params.callFrames.map(f=>f.callFrameId)).size===raw.params.callFrames.length);const point=raw.params.hitBreakpoints[0];const role=points.get(point);const top=raw.params.callFrames[0];need(role!==undefined&&top!==undefined);
 if(role==="reply"||role==="execute"||role==="callback"||role==="callbackReturned"){const uiRole=role==="callbackReturned"?"returned":role;const held=uiPause(input,session,scripts,new Map([[point,uiRole]]),"unused_owned_native_point");return Object.freeze({role,frame:held.frame,caller:held.caller,push:held.push,returned:null,point});}
 const p=POINTS[role];need(top.functionName===p.name&&top.functionLocation.scriptId===scripts[p.file]&&top.location.scriptId===scripts[p.file]&&top.functionLocation.lineNumber===p.line&&top.location.lineNumber===p.line&&top.functionLocation.columnNumber===p.fn&&top.location.columnNumber===p.pc);
 let returned:string|null=null;if(role.startsWith("returned")||role.startsWith("handlerReturned")||role==="outerReturned"){need(top.returnValue?.type==="object"&&typeof top.returnValue.objectId==="string");returned=top.returnValue.objectId;}else{need(top.returnValue===undefined);}
 return Object.freeze({role,frame:top.callFrameId,caller:raw.params.callFrames[1]?.callFrameId??null,push:null,returned,point});
}
