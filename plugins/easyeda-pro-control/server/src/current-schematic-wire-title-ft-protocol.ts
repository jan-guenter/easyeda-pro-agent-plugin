/** Separately reserved original ft-return component; historical title V1 is unchanged. */
import{z}from"zod";
import{freezeDeep}from"./sqlite-inventory-core.ts";
import{captureCurrentPcbStringClockReply as capture}from"./current-pcb-string-clock-reply.ts";
import{CURRENT_SCHEMATIC_WIRE_SERVICE_SOURCE as SOURCE}from"./current-schematic-wire-service-source.ts";
import{CURRENT_SCHEMATIC_WIRE_SERVICE_INVOCATION_FLAGS as FLAGS}from"./current-schematic-wire-service-invocation-protocol.ts";
import{CURRENT_SCHEMATIC_WIRE_TITLE_FT_PROGRAMS as PROGRAMS}from"./current-schematic-wire-title-programs.ts";
import{CURRENT_SCHEMATIC_WIRE_TITLE_REQUESTS as PREVIOUS}from"./current-schematic-wire-title-protocol.ts";

/** Preflight: six property/metadata reads + two commands for each <=8 scopes.
 * Runtime: original return twelve + three two-command descriptor reproofs +
 * at most two condition-source reads. One breakpoint removal is cleanup.
 * More competing evaluations are unsupported and fail closed. */
export const CURRENT_SCHEMATIC_WIRE_TITLE_FT_REQUESTS=Object.freeze({scopeLimit:8,conditionScripts:2,normal:42,cleanup:1,sources:14,pauses:1,events:18,aggregateNormal:PREVIOUS.aggregateNormal+42,aggregateCleanup:PREVIOUS.aggregateCleanup+1,nativeOwnerReserved:false}as const);
export interface CurrentSchematicWireTitleFtReturnData{
 readonly schema:"private.schematic-wire-title-ft-return.v1";
 readonly originalScopeArrayAndNativePredicateCompared:true;readonly fixedPredicateSourcesCompared:true;readonly originalTitleRequestAndCallbackCompared:true;readonly originalFtNormalReturnPromiseRetainedBeforeResume:true;
 readonly sameOriginalPromiseFulfilledUndefinedAfterResume:true;readonly originalQueryReturnJoined:true;readonly originalBreakpointRemoved:true;
 readonly normalRequests:number;readonly cleanupRequests:number;readonly suppliedTransportOnly:true;readonly originalNativeOwnerJoined:false;
 readonly nativeGlobalsQualified:false;readonly titleHelperRuntimeQualified:false;readonly annotationReturnJoined:false;readonly saveAuthorized:false;
}
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u),reference=z.strictObject({objectId:handle});
const refCounts:Readonly<Record<string,number>>=Object.freeze({retain:0,compare:8,join:11,scopeArray:1,arrayCurrent:1});
const calls=Object.entries(PROGRAMS).map(([role,program])=>z.strictObject({phase:z.literal("wire-title-ft-call"),role:z.literal(role),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({
 objectGroup:z.literal(FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true),objectId:handle,
 functionDeclaration:z.literal(program),arguments:z.array(reference).length(refCounts[role]??-1),returnByValue:z.literal(role!=="retain"&&role!=="scopeArray"),awaitPromise:z.literal(false),userGesture:z.literal(false),
})}));
export function currentSchematicWireTitleFtLocation(variant:0|1,scriptId:string):Readonly<{scriptId:string;lineNumber:6|532;columnNumber:4891}>{
 handle.parse(scriptId);const row=SOURCE[variant].rows.helper00;return Object.freeze({scriptId,lineNumber:row.lineNumber,columnNumber:row.points.returned.columnNumber});
}
const flags={objectGroup:z.literal(FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true)};
export const CURRENT_SCHEMATIC_WIRE_TITLE_FT_CONDITION="!Array.isArray(i)"as const;
const arms=([0,1]as const).map(variant=>{
 const row=SOURCE[variant].rows.helper00;
 const location=z.strictObject({scriptId:handle,lineNumber:z.literal(row.lineNumber),columnNumber:z.literal(row.points.returned.columnNumber)});
 const params=z.strictObject({location,condition:z.literal(CURRENT_SCHEMATIC_WIRE_TITLE_FT_CONDITION)});
 return z.strictObject({phase:z.literal("wire-title-ft-arm"),variant:z.literal(variant),method:z.literal("Debugger.setBreakpoint"),params});
});
const frameParams=z.strictObject({...flags,callFrameId:handle,expression:z.literal("[i,e]"),returnByValue:z.literal(false),includeCommandLineAPI:z.literal(false)});
const propertiesParams=z.strictObject({objectId:handle,ownProperties:z.literal(true),accessorPropertiesOnly:z.literal(false),generatePreview:z.literal(false)});
const removeParams=z.strictObject({breakpointId:handle}),sourceParams=z.strictObject({scriptId:handle});
const frameCommand=z.strictObject({phase:z.literal("wire-title-ft-frame"),method:z.literal("Debugger.evaluateOnCallFrame"),params:frameParams});
const propertiesCommand=z.strictObject({phase:z.literal("wire-title-ft-properties"),method:z.literal("Runtime.getProperties"),params:propertiesParams});
const schema=z.union([...calls,...arms,frameCommand,propertiesCommand,
 z.strictObject({phase:z.literal("wire-title-ft-source"),method:z.literal("Debugger.getScriptSource"),params:sourceParams}),
 z.strictObject({phase:z.literal("wire-title-ft-resume"),method:z.literal("Debugger.resume"),params:z.strictObject({})}),
 z.strictObject({phase:z.literal("wire-title-ft-remove"),method:z.literal("Debugger.removeBreakpoint"),params:removeParams}),
]);
export type CurrentSchematicWireTitleFtCommand=z.infer<typeof schema>;
export function validateCurrentSchematicWireTitleFtCommand(input:unknown):CurrentSchematicWireTitleFtCommand{return freezeDeep(schema.parse(capture(input).value));}
export function currentSchematicWireTitleFtCall(role:keyof typeof PROGRAMS,receiver:string,refs:readonly string[]):CurrentSchematicWireTitleFtCommand{
 return validateCurrentSchematicWireTitleFtCommand({phase:"wire-title-ft-call",role,method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:receiver,functionDeclaration:PROGRAMS[role],arguments:refs.map(objectId=>({objectId})),returnByValue:role!=="retain"&&role!=="scopeArray",awaitPromise:false,userGesture:false}});
}
const location=z.strictObject({scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()});
const promise=z.strictObject({type:z.literal("object"),subtype:z.literal("promise"),className:z.literal("Promise"),description:z.literal("Promise"),objectId:handle});
const frame=z.object({callFrameId:handle,location,functionLocation:location,returnValue:promise.optional()});
const pause=z.object({hitBreakpoints:z.array(handle).length(1),callFrames:z.array(frame).min(1).max(64)});
export function decodeCurrentSchematicWireTitleFtPause(input:unknown,variant:0|1,scriptId:string,id:string):Readonly<{frame:string;promise:string}>{
 const data=pause.parse(capture(input).value),top=data.callFrames[0];const point=currentSchematicWireTitleFtLocation(variant,scriptId),row=SOURCE[variant].rows.helper00;
 if(top===undefined||data.hitBreakpoints[0]!==id||top.location.scriptId!==scriptId||top.location.lineNumber!==point.lineNumber||top.location.columnNumber!==point.columnNumber||top.functionLocation.scriptId!==scriptId||top.functionLocation.lineNumber!==row.lineNumber||top.functionLocation.columnNumber!==row.columnNumber){throw new Error("WIRE_TITLE_FT_ORIGINAL_RETURN");}
 return Object.freeze({frame:top.callFrameId,promise:promise.parse(top.returnValue).objectId});
}


/** A fixed condition compilation is only a filter receipt. It cannot establish
 * the original request/callback/Promise identity checked at the actual pause. */
const conditionFrame=z.object({functionName:z.string(),scriptId:handle,lineNumber:z.number().int(),columnNumber:z.number().int()});
const conditionStack=z.object({callFrames:z.array(conditionFrame).min(1)});
const conditionSource=z.object({scriptId:handle,url:z.literal(""),hash:z.literal("4515baa92dcf50ca037f59d89ca07a21cbdefe4f7330e821826a9ab224d9f8df"),length:z.literal(CURRENT_SCHEMATIC_WIRE_TITLE_FT_CONDITION.length),stackTrace:conditionStack.optional()});
export function decodeCurrentSchematicWireTitleFtCondition(input:unknown,variant:0|1,scriptId:string):string|null{
 const parsed=conditionSource.safeParse(capture(input).value);
 if(!parsed.success){return null;}const data=parsed.data;
 const point=currentSchematicWireTitleFtLocation(variant,scriptId),top=data.stackTrace?.callFrames[0];
 if(top===undefined||top.functionName!=="ft"||top.scriptId!==scriptId||top.lineNumber!==point.lineNumber||top.columnNumber!==point.columnNumber){return null;}
 return data.scriptId;
}
