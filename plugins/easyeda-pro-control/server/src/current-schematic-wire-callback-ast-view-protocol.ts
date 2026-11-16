/** A separate successor to the immutable89/2 held-record subgroup. It admits
 * only the original AST assignment and stops before the original view body. */
import {z} from "zod";
import {captureCurrentPcbStringClockReply as capture} from "./current-pcb-string-clock-reply.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";
import {CURRENT_SCHEMATIC_WIRE_WRITER_FLAGS as FLAGS} from "./current-schematic-wire-writer-protocol.ts";

export const CURRENT_SCHEMATIC_WIRE_CALLBACK_AST_VIEW_REQUESTS=Object.freeze({normal:16,cleanup:2,helperSources:3,pauses:2,resumes:2,events:7} as const);
const guard=String.raw`"use strict";const get=native[0],proto=native[2],has=native[4],keys=native[5],isArray=native[7],bad=()=>{throw "WIRE_CALLBACK_AST_VIEW";},own=(o,k)=>{const d=get(o,k);if(!d||!has(d,"value"))bad();return d.value;},dense=(o,n)=>{if(!isArray(o)||proto(o)!==native[16]||own(o,"length")!==n||keys(o).length!==n+1)bad();for(let i=0;i<n;i++)own(o,i);};const selected=(holder,event)=>{dense(holder,2);const b=own(holder,0),state=own(holder,1),before=own(state,"before"),line=own(b,"line"),group=own(b,"group"),shapes=own(b,"shapes"),monitor=own(shapes,"modifyMonitor"),action=own(own(b,"runner"),"_currentAction");if(own(state,"owner")!==holder||own(state,"failed")!==false||own(state,"modifyAttempted")!==true||own(state,"modifyAcknowledged")!==false||own(state,"saveAttempted")!==false||own(before,"line")!==line||own(before,"wire")!==group||own(line,"shapeManager")!==shapes||own(group,"shapeManager")!==shapes||own(monitor,"shapeManager")!==shapes||action===null||typeof action!=="object"||own(action,"history")!=="add"||own(action,"status")!=="running"||proto(event)!==native[15]||keys(event).length!==4||own(event,"model")!==line||own(event,"attr")!=="points"||own(event,"newValue")!==own(line,"_points")||own(event,"oldValue")===own(event,"newValue"))bad();const descriptor=get(shapes,"shouldUpdateAst");if(!descriptor||!has(descriptor,"value")||typeof descriptor.value!=="boolean"||!descriptor.writable||!descriptor.enumerable||!descriptor.configurable)bad();return[shapes,monitor,line,descriptor.value];};`;
export {guard as CURRENT_SCHEMATIC_WIRE_CALLBACK_SELECTED_GUARD};
export const CURRENT_SCHEMATIC_WIRE_CALLBACK_AST_VIEW_PROGRAMS=Object.freeze({
 methods:`function(native,event,ast){${guard}const s=selected(this,event);if(typeof ast!=="function")bad();const view=own(s[1],"onModelAttributeChange");if(typeof view!=="function")bad();return[ast,view];}`,
 ast:`function(native,holder,event,caller){${guard}dense(this,1);const s=selected(holder,event);if(own(this,0)!==s[1]||caller!==event)bad();return true;}`,
 view:`function(native,holder,event,caller){${guard}dense(this,3);const s=selected(holder,event);if(own(this,0)!==s[1]||own(this,1)!==s[2]||own(this,2)!=="points"||caller!==event||s[3]!==true)bad();return true;}`,
});
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const reference=z.strictObject({objectId:handle});
const flags={objectGroup:z.literal(FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true)};
const frames=Object.freeze({ast:"[this]",view:"[this,n,s]",event:"n"} as const);
const selectors=Object.entries(frames).map(([role,expression])=>{const params=z.strictObject({...flags,callFrameId:handle,expression:z.literal(expression),returnByValue:z.literal(false),includeCommandLineAPI:z.literal(false)});return z.strictObject({phase:z.literal("wire-callback-ast-view-selector"),role:z.literal(role),method:z.literal("Debugger.evaluateOnCallFrame"),params});});
const calls=Object.entries(CURRENT_SCHEMATIC_WIRE_CALLBACK_AST_VIEW_PROGRAMS).map(([role,program])=>{const count=role==="methods"?3:4;const params=z.strictObject({...flags,objectId:handle,functionDeclaration:z.literal(program),arguments:z.array(reference).length(count),returnByValue:z.literal(role!=="methods"),awaitPromise:z.literal(false),userGesture:z.literal(false)});return z.strictObject({phase:z.literal("wire-callback-ast-view-call"),role:z.literal(role),method:z.literal("Runtime.callFunctionOn"),params});});
const armParams=z.strictObject({objectId:handle,condition:z.literal("")});
const schema=z.union([...selectors,...calls,z.strictObject({phase:z.literal("wire-callback-ast-view-arm"),role:z.enum(["ast","view"]),method:z.literal("Debugger.setBreakpointOnFunctionCall"),params:armParams})]);
export type CurrentSchematicWireCallbackAstViewCommand=Readonly<z.infer<typeof schema>>;
export function validateCurrentSchematicWireCallbackAstViewCommand(input:unknown):CurrentSchematicWireCallbackAstViewCommand{return freezeDeep(schema.parse(capture(input).value));}
export function currentSchematicWireCallbackAstViewSelector(role:keyof typeof frames,frameId:string):CurrentSchematicWireCallbackAstViewCommand{return validateCurrentSchematicWireCallbackAstViewCommand({phase:"wire-callback-ast-view-selector",role,method:"Debugger.evaluateOnCallFrame",params:{...FLAGS,callFrameId:frameId,expression:frames[role],returnByValue:false,includeCommandLineAPI:false}});}
export function currentSchematicWireCallbackAstViewCall(role:keyof typeof CURRENT_SCHEMATIC_WIRE_CALLBACK_AST_VIEW_PROGRAMS,receiver:string,refs:readonly string[]):CurrentSchematicWireCallbackAstViewCommand{return validateCurrentSchematicWireCallbackAstViewCommand({phase:"wire-callback-ast-view-call",role,method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:receiver,functionDeclaration:CURRENT_SCHEMATIC_WIRE_CALLBACK_AST_VIEW_PROGRAMS[role],arguments:refs.map(objectId=>({objectId})),returnByValue:role!=="methods",awaitPromise:false,userGesture:false}});}
export interface CurrentSchematicWireCallbackViewHeldData{
 readonly schema:"private.schematic-wire-callback-ast-view-held.v1";readonly originalRecordEntryConsumed:true;readonly originalAstCallbackAndCallerCompared:true;
 readonly originalAstSourceAssignmentJoined:true;readonly originalShouldUpdateAstOwnDataCompared:true;readonly originalViewAndSameRecordEventCompared:true;readonly originalViewEntryStillHeld:true;
 readonly viewBodyResumed:false;readonly callbackReturned:false;readonly fullSetterComplete:false;readonly workerCompleted:false;readonly modifyCompleted:false;
 readonly normalRequests:number;readonly cleanupRequests:number;readonly suppliedTransportOnly:true;readonly originalNativeOwnerJoined:false;readonly continuousGlobalsVerified:false;readonly saveAuthorized:false;
}
