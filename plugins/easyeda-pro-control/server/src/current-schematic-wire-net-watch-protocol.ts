/** Separate finite source-only registration vocabulary. No new native route. */
 import {z} from "zod";
 import {captureCurrentPcbStringClockReply as capture} from "./current-pcb-string-clock-reply.ts";
 import {freezeDeep} from "./sqlite-inventory-core.ts";
 import {CURRENT_SCHEMATIC_WIRE_NET_WATCH_PROGRAMS as PROGRAMS} from "./current-schematic-wire-net-watch-programs.ts";
 import {CURRENT_SCHEMATIC_WIRE_NET_WATCH_SOURCE as SOURCE} from "./current-schematic-wire-net-watch-source.ts";

 export const CURRENT_SCHEMATIC_WIRE_NET_WATCH_LIMIT=Object.freeze({normal:91,helperSources:13,events:25,pauses:6,resumes:6,cleanup:5}as const);
 export const CURRENT_SCHEMATIC_WIRE_NET_WATCH_FLAGS=Object.freeze({objectGroup:"easyeda-pro-control-wire-net-watch-v1",silent:true,generatePreview:false,throwOnSideEffect:true}as const);
 const arities={selectNet:2,selectShape:1,selectBbox:1,selectProto:1,primitiveRoots:1,primitives:2,snapshot:23,event:3,register:4,returned:5,parent:5,parentReturned:6,bind:5}as const;
 const roles=["selectNet","selectShape","selectBbox","selectProto","primitiveRoots","primitives","snapshot","event","register","returned","parent","parentReturned","bind"]as const;
 export const CURRENT_SCHEMATIC_WIRE_NET_WATCH_FRAMES=freezeDeep({watch:"[this]",event:"[this,e]",caller:"[this,t]",register0:`[this,e,${SOURCE[0].symbolNames.join(",")}]`,register1:`[this,e,${SOURCE[1].symbolNames.join(",")}]`,returned:"[this,t]"}as const);
 const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
 const flags={objectGroup:z.literal(CURRENT_SCHEMATIC_WIRE_NET_WATCH_FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true)};
 const reference=z.strictObject({objectId:handle});
const calls=roles.map(role=>z.strictObject({phase:z.literal("net-watch-call"),role:z.literal(role),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...flags,objectId:handle,functionDeclaration:z.literal(PROGRAMS[role]),arguments:z.array(reference).length(arities[role]),returnByValue:z.literal(role==="returned"||role==="bind"),awaitPromise:z.literal(false),userGesture:z.literal(false)})}));
 const frames=Object.entries(CURRENT_SCHEMATIC_WIRE_NET_WATCH_FRAMES).map(([role,expression])=>z.strictObject({phase:z.literal("net-watch-frame"),role:z.literal(role),method:z.literal("Debugger.evaluateOnCallFrame"),params:z.strictObject({...flags,callFrameId:handle,expression:z.literal(expression),returnByValue:z.literal(false),includeCommandLineAPI:z.literal(false)})}));
 const armRoles=["watch","event","register","returned","parentReturned"]as const;
 const arms=SOURCE.flatMap(profile=>armRoles.map(role=>{const point=profile.points[role];const location=z.strictObject({scriptId:handle,lineNumber:z.literal(point.lineNumber),columnNumber:z.literal(point.columnNumber)});return z.strictObject({phase:z.literal("net-watch-arm"),role:z.literal(role),method:z.literal("Debugger.setBreakpoint"),params:z.strictObject({location,condition:z.literal("")})});}));
 const propertyParams=z.strictObject({objectId:handle,ownProperties:z.literal(true),accessorPropertiesOnly:z.literal(false),generatePreview:z.literal(false)});
const schema=z.union([...calls,...frames,...arms,
  z.strictObject({phase:z.literal("net-watch-properties"),method:z.literal("Runtime.getProperties"),params:propertyParams}),
  z.strictObject({phase:z.literal("net-watch-source"),method:z.literal("Debugger.getScriptSource"),params:z.strictObject({scriptId:handle})}),
  z.strictObject({phase:z.literal("net-watch-remove"),method:z.literal("Debugger.removeBreakpoint"),params:z.strictObject({breakpointId:handle})}),
  z.strictObject({phase:z.literal("net-watch-resume"),method:z.literal("Debugger.resume"),params:z.strictObject({})}),
 ]);
 export type CurrentSchematicWireNetWatchCommand=z.infer<typeof schema>;
 export function validateCurrentSchematicWireNetWatchCommand(input:unknown):CurrentSchematicWireNetWatchCommand{return freezeDeep(schema.parse(capture(input).value));}
 export function currentSchematicWireNetWatchCall(role:keyof typeof PROGRAMS,receiver:string,refs:readonly string[]):CurrentSchematicWireNetWatchCommand{return validateCurrentSchematicWireNetWatchCommand({phase:"net-watch-call",role,method:"Runtime.callFunctionOn",params:{...CURRENT_SCHEMATIC_WIRE_NET_WATCH_FLAGS,objectId:receiver,functionDeclaration:PROGRAMS[role],arguments:refs.map(objectId=>({objectId})),returnByValue:role==="returned"||role==="bind",awaitPromise:false,userGesture:false}});}
 export function currentSchematicWireNetWatchFrame(role:keyof typeof CURRENT_SCHEMATIC_WIRE_NET_WATCH_FRAMES,callFrameId:string):CurrentSchematicWireNetWatchCommand{return validateCurrentSchematicWireNetWatchCommand({phase:"net-watch-frame",role,method:"Debugger.evaluateOnCallFrame",params:{...CURRENT_SCHEMATIC_WIRE_NET_WATCH_FLAGS,callFrameId,expression:CURRENT_SCHEMATIC_WIRE_NET_WATCH_FRAMES[role],returnByValue:false,includeCommandLineAPI:false}});}
 /** The native codebook uses these canonical finite recipes without changing this validator. */
 export function currentSchematicWireNetWatchCases(): readonly CurrentSchematicWireNetWatchCommand[] {
  const id = "original27";
  const controls = [
   {phase:"net-watch-properties",method:"Runtime.getProperties",params:{objectId:id,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}},
   {phase:"net-watch-source",method:"Debugger.getScriptSource",params:{scriptId:id}},
   {phase:"net-watch-remove",method:"Debugger.removeBreakpoint",params:{breakpointId:id}},
   {phase:"net-watch-resume",method:"Debugger.resume",params:{}},
  ];
  const marks = SOURCE.flatMap(profile => armRoles.map(role => ({
   phase:"net-watch-arm",role,method:"Debugger.setBreakpoint",params:{location:{scriptId:id,...profile.points[role]},condition:""},
  })));
  return Object.freeze([
   ...roles.map(role => currentSchematicWireNetWatchCall(role,id,Array.from({length:arities[role]},()=>id))),
   ...Object.keys(CURRENT_SCHEMATIC_WIRE_NET_WATCH_FRAMES).map(role => {
    const key = z.enum(["watch","event","caller","register0","register1","returned"]).parse(role);
    return currentSchematicWireNetWatchFrame(key,id);
   }),
   ...[...marks,...controls].map(row => validateCurrentSchematicWireNetWatchCommand(row)),
  ]);
 }
 export interface CurrentSchematicWireNetWatchRegistration{
  readonly schema:"private.schematic-wire-original-net-watch-registration.v1";
  readonly originalWatchNormalReturn:true;readonly originalEventArgumentAndReceiverCompared:true;readonly originalRegisterArgumentAndReceiverCompared:true;
  readonly originalListenerSourceQualified:true;readonly originalWatchClosureReceiverJoined:true;readonly originalBboxUpdateRosterOne:true;readonly originalParentSubscriptionMembershipCompared:true;readonly originalBaseWatchParentRegistrationCompared:true;
  readonly originalWholeScriptSourceJoined:false;readonly originalNativeOwnerJoined:false;readonly writerPreMutationBound:false;readonly markerRefreshObserved:false;readonly sourceSerializationObserved:false;readonly modifyAuthorized:false;readonly saveAuthorized:false;readonly suppliedTransportOnly:true;
  readonly normalRequests:number;readonly helperSources:number;readonly cleanupRequests:number;
 }
 export interface CurrentSchematicWireNetWatchPreflight{
  readonly schema:"private.schematic-wire-original-net-watch-preflight.v1";readonly originalRegistrationConsumed:true;readonly originalBaseWatchParentRegistrationCompared:true;readonly originalWriterPreMutationStateCompared:true;
  readonly originalBboxUpdateRosterOne:true;readonly originalListenerAndSubscriptionRecompared:true;readonly originalSourcePrimitivesQualified:true;
  readonly originalWholeScriptSourceJoined:false;readonly originalNativeOwnerJoined:false;readonly continuousGlobalsVerified:false;readonly markerRefreshObserved:false;readonly sourceSerializationObserved:false;readonly modifyAuthorized:false;readonly saveAuthorized:false;readonly suppliedTransportOnly:true;
  readonly normalRequests:number;readonly helperSources:number;readonly cleanupRequests:number;
 }
