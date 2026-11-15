/** Immutable project-worker/CM source is shared as data only. No Text event,
 * receipt, registry, prepared object or worker controller is reused. */
import { z } from "zod";
import { types } from "node:util";
import { captureCurrentPcbStringClockReply as capture } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_WORKER_SOURCE as WORKER, qualifyCurrentSchematicRelevanceModifyWorkerFunction as workerFunction, qualifyCurrentSchematicRelevanceModifyWorkerSource as workerSource } from "./current-schematic-relevance-modify-worker-replies.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CALLEE_SOURCE as CM, qualifyCurrentSchematicRelevanceModifyCmCalleeSource as cmSource } from "./current-schematic-relevance-modify-cm-callee-source.ts";
import { requireCurrentSchematicRelevanceModifyCmCalleeDescription as cmDescription, decodeCurrentSchematicRelevanceModifyCmCalleeFunction as cmFunction } from "./current-schematic-relevance-modify-cm-callee-replies.ts";

export const CURRENT_SCHEMATIC_WIRE_WORKER_PENDING_SOURCE = Object.freeze({ relativePath: CM.relativePath, bytes: WORKER.bytes, sha256: WORKER.sha256, batch:WORKER.roles.batch, cm:CM.roles } as const);
export function qualifyCurrentSchematicWireWorkerPendingSource(source:string):void{workerSource(source);cmSource(source);}
const callable=z.strictObject({type:z.literal("function"),className:z.literal("Function"),description:z.string().max(24_674).refine(value=>value.isWellFormed()),objectId:z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u)});
/** The complete original CM class exceeds the small clock JSON text bound.
 * Read its four own scalar descriptors explicitly; never evaluate an accessor
 * or silently widen the released clock-capture bound. */
function callableData(input:unknown):z.infer<typeof callable>{
 if(input===null||typeof input!=="object"||types.isProxy(input)){throw new Error("SCHEMATIC_WIRE_WORKER_PENDING_CALLABLE");}const prototype:unknown=Object.getPrototypeOf(input);if(prototype!==Object.prototype&&prototype!==null||Reflect.ownKeys(input).length!==4){throw new Error("SCHEMATIC_WIRE_WORKER_PENDING_CALLABLE");}
 const scalar=(key:string):unknown=>{const field=Object.getOwnPropertyDescriptor(input,key);if(field===undefined||!Object.hasOwn(field,"value")||field.enumerable!==true){throw new Error("SCHEMATIC_WIRE_WORKER_PENDING_CALLABLE");}return field.value as unknown;};
 return callable.parse({type:scalar("type"),className:scalar("className"),description:scalar("description"),objectId:scalar("objectId")});
}
export function decodeCurrentSchematicWireWorkerPendingBatchFunction(input:unknown,actual:unknown,scriptId:string):void{workerFunction(input,callableData(actual),"batch",scriptId);}
export function decodeCurrentSchematicWireWorkerPendingCmFunction(input:unknown,actual:unknown,role:"jaConstructor"|"cmBaseConstructor"|"remoteChange"|"nodeConstructor"|"nodeInsert"|"nodeGetFirstTicket",scriptId:string):void{const described=callableData(actual);cmDescription(described.description,role);cmFunction(input,role,scriptId);}
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const site=z.strictObject({scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()});
const frame=z.object({callFrameId:handle,location:site,functionLocation:site.optional(),returnValue:z.unknown().optional()});
const pause=z.object({reason:z.literal("other"),callFrames:z.array(frame).min(1).max(64),hitBreakpoints:z.array(handle).length(1)});
export const CURRENT_SCHEMATIC_WIRE_WORKER_PENDING_POINTS=Object.freeze({entry:{lineNumber:110,columnNumber:98_769},returned:{lineNumber:110,columnNumber:98_916}} as const);
/** Exact original event locations are comparison data, never an event issuer. */
export function decodeCurrentSchematicWireWorkerPendingPause(input:unknown,stage:"entry"|"returned",scriptId:string,breakpointId:string):Readonly<{frame:string;originalEventJoined:false}>{
 z.enum(["entry","returned"]).parse(stage);handle.parse(scriptId);handle.parse(breakpointId);const raw=pause.parse(capture(input).value);const top=raw.callFrames[0];const expected=CURRENT_SCHEMATIC_WIRE_WORKER_PENDING_POINTS[stage];const fn=WORKER.roles.batch;
 if(top===undefined||raw.hitBreakpoints[0]!==breakpointId||top.location.scriptId!==scriptId||top.location.lineNumber!==expected.lineNumber||top.location.columnNumber!==expected.columnNumber||top.functionLocation?.scriptId!==scriptId||top.functionLocation.lineNumber!==fn.lineNumber||top.functionLocation.columnNumber!==fn.columnNumber){throw new Error("SCHEMATIC_WIRE_WORKER_PENDING_PAUSE");}
 if(stage==="entry"){if(top.returnValue!==undefined){throw new Error("SCHEMATIC_WIRE_WORKER_PENDING_PAUSE");}}else {z.strictObject({type:z.literal("undefined")}).parse(top.returnValue);}
 return Object.freeze({frame:top.callFrameId,originalEventJoined:false});
}
