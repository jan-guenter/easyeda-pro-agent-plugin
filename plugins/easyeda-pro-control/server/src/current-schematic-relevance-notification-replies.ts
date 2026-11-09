/** Native Promise metadata is data only. The original controller must retain
 * and join the actual returnValue and same-realm prototype separately. */
import {z} from "zod";
import {captureCurrentPcbStringClockReply} from "./current-pcb-string-clock-reply.ts";

const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote=z.strictObject({type:z.string(),subtype:z.string().optional(),className:z.string().optional(),description:z.string().max(128).optional(),objectId:handle.optional(),value:z.unknown().optional()});
const slot=z.strictObject({name:z.string(),value:remote});
const packet=z.strictObject({result:z.array(z.unknown()).length(0),internalProperties:z.array(slot).length(3)});
function need(value:boolean):asserts value{if(!value){throw new Error("SCH_NOTIFICATION_PROMISE_METADATA");}}
/** Capture the descriptive native-Promise envelope before reading its opaque
 * handle. This issues no ownership or settlement permission. */
export function captureCurrentSchematicRelevanceNotificationPromiseRemote(input:unknown):Readonly<{type:"object";subtype:"promise";className:"Promise";description:"Promise";objectId:string}>{const actual=remote.parse(captureCurrentPcbStringClockReply(input).value);need(actual.type==="object"&&actual.subtype==="promise"&&actual.className==="Promise"&&actual.description==="Promise"&&actual.objectId!==undefined&&actual.value===undefined);return Object.freeze({type:"object",subtype:"promise",className:"Promise",description:"Promise",objectId:actual.objectId});}
/** Read the one native-call result envelope before capturing its Promise.
 * This preserves the descriptor-safe metadata boundary without settling it. */
export function captureCurrentSchematicRelevanceNotificationPromiseResult(input:unknown):ReturnType<typeof captureCurrentSchematicRelevanceNotificationPromiseRemote>{const copied=captureCurrentPcbStringClockReply(input).value;need(copied!==null&&typeof copied==="object"&&!Array.isArray(copied)&&Object.keys(copied).length===1);return captureCurrentSchematicRelevanceNotificationPromiseRemote(Reflect.get(copied,"result"));}
/** Decode a native Promise handle with exactly the expected state, result and prototype slots.
 * Pending and fulfilled states both require an undefined result; this metadata does not establish original Promise ownership.
 */
export function decodeCurrentSchematicRelevanceNotificationPromise(input:unknown,actualRemote:unknown):Readonly<{state:"pending"|"fulfilled";prototypeObjectId:string;originalPromiseOwnershipIssued:false;settlementAuthorized:false;modifyCompleted:false;saveAuthorized:false}>{const actual=remote.parse(captureCurrentPcbStringClockReply(actualRemote).value);need(actual.type==="object"&&actual.subtype==="promise"&&actual.className==="Promise"&&actual.description==="Promise"&&actual.objectId!==undefined&&actual.value===undefined);const raw=packet.parse(captureCurrentPcbStringClockReply(input).value);const slots=new Map(raw.internalProperties.map(row=>[row.name,row.value]));need(slots.size===3);const state=slots.get("[[PromiseState]]");const result=slots.get("[[PromiseResult]]");const prototype=slots.get("[[Prototype]]");need(state?.type==="string"&&(state.value==="pending"||state.value==="fulfilled")&&state.objectId===undefined&&state.subtype===undefined&&result?.type==="undefined"&&Object.keys(result).length===1&&prototype?.type==="object"&&prototype.subtype===undefined&&prototype.className==="Promise"&&prototype.objectId!==undefined&&prototype.value===undefined);return Object.freeze({state:state.value,prototypeObjectId:prototype.objectId,originalPromiseOwnershipIssued:false,settlementAuthorized:false,modifyCompleted:false,saveAuthorized:false});}
