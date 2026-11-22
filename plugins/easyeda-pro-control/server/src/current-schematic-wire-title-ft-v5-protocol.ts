/** V5 alone uses an unconditional original ft return hold. The held input is
 * classified with the retained native predicate; debugger conditions execute
 * no ambient Array binding. This is not application-global immutability. */
import {z} from "zod";
import {freezeDeep} from "./sqlite-inventory-core.ts";
import {captureCurrentPcbStringClockReply as capture} from "./current-pcb-string-clock-reply.ts";
import {CURRENT_SCHEMATIC_WIRE_SERVICE_INVOCATION_FLAGS as FLAGS} from "./current-schematic-wire-service-invocation-protocol.ts";
import {CURRENT_SCHEMATIC_WIRE_TITLE_FT_REQUESTS as OLD,currentSchematicWireTitleFtLocation as location} from "./current-schematic-wire-title-ft-protocol.ts";

/** Remove two condition-source reads; add one bounded array branch (seven
 * commands) and two commands for the actual target's native classification. */
export const CURRENT_SCHEMATIC_WIRE_TITLE_FT_V5_REQUESTS=Object.freeze({normal:OLD.normal+7,cleanup:OLD.cleanup,sources:OLD.sources+3,pauses:2,arrayReturns:1,events:21,aggregateNormal:OLD.aggregateNormal+7,aggregateCleanup:OLD.aggregateCleanup} as const);
export const CURRENT_SCHEMATIC_WIRE_TITLE_FT_V5_FILTER=String.raw`function(native){"use strict";const get=native[0],proto=native[2],has=native[4],isArray=native[7],bad=()=>{throw "WIRE_FT_V5_NATIVE_FILTER";},value=(o,k)=>{const d=get(o,k);if(!d||!has(d,"value"))bad();return d.value;};if(!isArray(this)||proto(this)!==native[16]||value(this,"length")!==2)bad();return isArray(value(this,"0"));}`;
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const arms=([0,1] as const).map(variant=>{const point=location(variant,"original27");const selected=z.strictObject({scriptId:handle,lineNumber:z.literal(point.lineNumber),columnNumber:z.literal(point.columnNumber)});const params=z.strictObject({location:selected,condition:z.literal("")});return z.strictObject({phase:z.literal("wire-title-ft-v5-arm"),variant:z.literal(variant),method:z.literal("Debugger.setBreakpoint"),params});});
const reference=z.strictObject({objectId:handle});
const filterParams=z.strictObject({objectGroup:z.literal(FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true),objectId:handle,functionDeclaration:z.literal(CURRENT_SCHEMATIC_WIRE_TITLE_FT_V5_FILTER),arguments:z.tuple([reference]),returnByValue:z.literal(true),awaitPromise:z.literal(false),userGesture:z.literal(false)});
const filter=z.strictObject({phase:z.literal("wire-title-ft-v5-filter"),method:z.literal("Runtime.callFunctionOn"),params:filterParams});
const schema=z.union([...arms,filter]);
export type CurrentSchematicWireTitleFtV5Command=Readonly<z.infer<typeof schema>>;
export function validateCurrentSchematicWireTitleFtV5Command(input:unknown):CurrentSchematicWireTitleFtV5Command{return freezeDeep(schema.parse(capture(input).value));}
export type CurrentSchematicWireTitleFtV5FilterCommand=Extract<CurrentSchematicWireTitleFtV5Command,Readonly<{method:"Runtime.callFunctionOn"}>>;
export function currentSchematicWireTitleFtV5Filter(receiver:string,native:string):CurrentSchematicWireTitleFtV5FilterCommand{const command=validateCurrentSchematicWireTitleFtV5Command({phase:"wire-title-ft-v5-filter",method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:receiver,functionDeclaration:CURRENT_SCHEMATIC_WIRE_TITLE_FT_V5_FILTER,arguments:[{objectId:native}],returnByValue:true,awaitPromise:false,userGesture:false}});if(command.method!=="Runtime.callFunctionOn"){throw new Error("WIRE_FT_V5_FILTER_COMMAND");}return command;}
export function currentSchematicWireTitleFtV5Cases():readonly CurrentSchematicWireTitleFtV5Command[]{return Object.freeze([
 ...([0,1] as const).map(variant=>validateCurrentSchematicWireTitleFtV5Command({phase:"wire-title-ft-v5-arm",variant,method:"Debugger.setBreakpoint",params:{location:location(variant,"original27"),condition:""}})),currentSchematicWireTitleFtV5Filter("original27","original27"),
]);}
export interface CurrentSchematicWireTitleFtV5ReturnData{
 readonly schema:"private.schematic-wire-title-ft-unconditional.v1";readonly originalScopeArrayAndNativePredicateCompared:true;
 readonly unconditionalBreakpointCompared:true;readonly ambientDebuggerConditionNotEvaluated:true;readonly actualHeldParameterClassifiedWithRetainedNativePredicate:true;readonly fixedFilterProgramSourcesCompared:true;
 readonly skippedArrayNormalReturns:number;readonly originalTitleRequestAndCallbackCompared:true;readonly originalFtNormalReturnPromiseRetainedBeforeResume:true;readonly sameOriginalPromiseFulfilledUndefinedAfterResume:true;readonly originalQueryReturnJoined:true;readonly originalBreakpointRemoved:true;
 readonly normalRequests:number;readonly cleanupRequests:number;readonly suppliedTransportOnly:true;readonly originalNativeOwnerJoined:false;readonly nativeGlobalsQualified:false;readonly titleHelperRuntimeQualified:false;readonly annotationReturnJoined:false;readonly saveAuthorized:false;
}
