/** Correlated original Inspector packets only; these data checks cannot issue
 * readiness or interpret a JSON body as an own undefined application field. */
import { z } from "zod";
import { captureCurrentFootprintInverseDeleteBindingReply as capture } from "./current-footprint-inverse-delete-binding-capture.ts";
import { decodeCurrentFootprintCopyClockRpcV2Array } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_GET_WORKER_SITE as SITE } from "./current-footprint-inverse-get-worker-protocol.ts";

const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
function need(value:boolean):asserts value{if(!value){throw new Error("FOOTPRINT_INVERSE_GET_WORKER_REPLY");}}
export function qualifyCurrentFootprintInverseGetWorkerRoots(input:unknown):void{const fields=decodeCurrentFootprintCopyClockRpcV2Array(input,15);for(const slot of[7,8,9,10,11,12]){const value=fields.get(String(slot));need(value?.type==="object"&&value.objectId!==undefined&&value.subtype===undefined);}need(fields.get("14")?.type==="function");}
const flags={writable:z.literal(true),enumerable:z.literal(true),configurable:z.literal(true),isOwn:z.literal(true)};
const callback=z.strictObject({type:z.literal("function"),className:z.literal("Function"),description:z.string().max(2048),objectId:handle});
const parent=z.strictObject({type:z.literal("object"),className:z.string().min(1).max(128),description:z.string().max(128),objectId:handle});
const yes=z.strictObject({type:z.literal("boolean"),value:z.literal(true)});
const callbackField=z.strictObject({name:z.literal("callback"),value:callback,...flags});
const unsafeField=z.strictObject({name:z.literal("unsafe"),value:yes,...flags});
const runningField=z.strictObject({name:z.literal("isRunning"),value:yes,...flags});
const prototypeField=z.strictObject({name:z.literal("[[Prototype]]"),value:parent});
const task=z.strictObject({result:z.tuple([callbackField,unsafeField,runningField]),internalProperties:z.tuple([prototypeField])});
export function qualifyCurrentFootprintInverseGetWorkerTask(input:unknown):void{task.parse(capture(input));}
export function currentFootprintInverseGetWorkerPoint(input:unknown,scriptId:string):string{const reply=z.strictObject({breakpointId:handle,actualLocation:z.strictObject({scriptId:handle,lineNumber:z.literal(SITE.lineNumber),columnNumber:z.literal(SITE.columnNumber)})}).parse(capture(input));need(reply.actualLocation.scriptId===scriptId);return reply.breakpointId;}
