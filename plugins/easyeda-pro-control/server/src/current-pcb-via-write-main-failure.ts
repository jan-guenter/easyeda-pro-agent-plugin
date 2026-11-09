/** Separate bounded first-Main-failure data. It grants no dispatch, cleanup,
 * owner adoption, retry or saved-state authority. Error objects are not inputs. */
import {z} from "zod";
import {CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_SOURCE} from "./current-footprint-copy-main-backend-source.ts";
import {captureCurrentPcbStringClockReply} from "./current-pcb-string-clock-reply.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";

const pathKeys=["$unknown","args","breakpointId","callFrameId","callFrames","className","columnNumber","configurable","context","debuggerId",
 "description","enumerable","executionContextId","hitBreakpoints","id","internalProperties","isOwn","lineNumber","location","locations","name",
 "objectId","reason","result","scriptId","scriptSource","subtype","type","url","value","writable"]as const;
const issueCodes=["custom","invalid_element","invalid_format","invalid_key","invalid_type","invalid_union","invalid_value","not_multiple_of","too_big","too_small","unrecognized_keys","other"]as const;
const roles=[...Object.keys(CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_SOURCE.functions),"head-age-context-array","head-age-context-getter","head-age-context-setter","head-age-context-getter-scopes","head-age-context-setter-scopes","Date","now","retained-array","head-age-array","getTime","toISOString","getTimezoneOffset","getFullYear","getMonth","getDate","getHours","getMinutes","getSeconds","getMilliseconds"];
const integer=z.number().int().min(0).max(Number.MAX_SAFE_INTEGER).refine(value=>!Object.is(value,-0));
const point=z.number().int().min(0).max(16_777_216).refine(value=>!Object.is(value,-0));
const issuePath=z.array(z.union([z.enum(pathKeys),z.number().int().min(0).max(256)])).max(8);
const issue=z.strictObject({code:z.enum(issueCodes),path:issuePath});
const statusSchema=z.strictObject({
 attempted:z.boolean(),completed:z.boolean(),failed:z.boolean(),phase:z.string().max(64).regex(/^[a-z][a-z\d-]{0,63}$(?![\s\S])/u),
 failure:z.string().max(128).regex(/^[A-Z][A-Z\d_]{1,127}$(?![\s\S])/u).nullable(),
 requests:integer,replies:integer,pendingReplies:z.union([z.literal(0),z.literal(1)]),events:integer,receivedBytes:integer,
 initialContinuationCount:z.union([z.literal(0),z.literal(1)]),registrationPaused:z.boolean(),sourceQualified:z.boolean(),
 breakpointRemoved:z.boolean(),releaseAttempted:z.boolean(),released:z.boolean(),
 registrationLocationFailure:z.strictObject({lineNumber:point,columnNumber:point,scriptObserved:z.boolean()}).nullable(),
 metadataRole:z.enum(roles).nullable(),
 schemaIssues:z.array(issue).max(6).nullable(),
 requestOriginIssued:z.boolean(),requestOriginActive:z.boolean(),
});
const nativeFailureSchema=z.strictObject({action:z.enum(["head-age-main","head-age-abort","main-attach","main-reprove","main-send","structure-main-send","main-request-send","main-completion-begin","main-completion-send","main-completion-retire","main-poll","main-close-detach","main-terminate","combined-abort"]),code:z.string().max(95).regex(/^pcb-diagnostic-[a-z-]{1,80}$(?![\s\S])/u)});
const ownerFailureSchema=z.string().max(128).regex(/^[A-Z][A-Z\d_]{1,127}$(?![\s\S])/u).nullable();
export const currentPcbViaWriteMainFailureSchema=z.strictObject({
 schema:z.literal("easyeda-pro-control.pcb209-via-main-failure.v1"),stage:z.literal("main"),
 capture:z.enum(["original-status-retained","runner-absent","capture-refused"]),status:statusSchema.nullable(),nativeFailure:nativeFailureSchema.nullable(),ownerFailure:ownerFailureSchema,firstFailureRetained:z.literal(true),
 executionAuthorized:z.literal(false),cleanupAuthorized:z.literal(false),persistenceVerified:z.literal(false),
 errorPropertiesIncluded:z.literal(false),stackIncluded:z.literal(false),rawSourceIncluded:z.literal(false),privatePathsIncluded:z.literal(false),
}).refine(value=>(value.capture==="original-status-retained")===(value.status!==null));
export type CurrentPcbViaWriteMainFailure=z.infer<typeof currentPcbViaWriteMainFailureSchema>;
function packet(capture:CurrentPcbViaWriteMainFailure["capture"],status:z.infer<typeof statusSchema>|null,nativeFailure:z.infer<typeof nativeFailureSchema>|null=null,ownerFailure:string|null=null):CurrentPcbViaWriteMainFailure {
 return freezeDeep(currentPcbViaWriteMainFailureSchema.parse({schema:"easyeda-pro-control.pcb209-via-main-failure.v1",stage:"main",capture,status,nativeFailure,ownerFailure,firstFailureRetained:true,
 executionAuthorized:false,cleanupAuthorized:false,persistenceVerified:false,errorPropertiesIncluded:false,stackIncluded:false,rawSourceIncluded:false,privatePathsIncluded:false}));
}
/** This accepts supplied data only. The workflow separately joins its actual
 * factory/target and captured original private-field method before calling it. */
export function currentPcbViaWriteMainFailure(input:unknown,nativeInput:unknown=null,failureInput:unknown=null):CurrentPcbViaWriteMainFailure {
 const nativeFailure=nativeFailureSchema.nullable().parse(captureCurrentPcbStringClockReply(nativeInput).value),ownerFailure=ownerFailureSchema.parse(failureInput);
 if(input===null){return packet("runner-absent",null,nativeFailure,ownerFailure);}
 return packet("original-status-retained",statusSchema.parse(captureCurrentPcbStringClockReply(input).value),nativeFailure,ownerFailure);
}
export function refusedCurrentPcbViaWriteMainFailure():CurrentPcbViaWriteMainFailure{return packet("capture-refused",null);}
