/** Safe data projection of a supplied envelope. Core must separately require
 * the original private GetJob; this projection supplies no provenance. */
import { z } from "zod";
import { types } from "node:util";
import { captureCurrentFootprintInverseDeleteBindingReply as capture } from "./current-footprint-inverse-delete-binding-capture.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const id=z.string().regex(/^(?:[a-f\d]{16}|[a-f\d]{32})$/u);
const replyTopic=z.string().min(32).max(256).regex(/^[A-Za-z\d_./:-]+$/u);
const common={type:z.literal("IGIVE"),uuid:z.uuid(),topic:z.literal("/mgr/projectWorker/footprint/get"),id:z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER).refine(value=>!Object.is(value,-0)),target:z.uuid()};
const taggedBody=z.strictObject({uuid:id,needUndefined:z.literal(true)});
const taggedPacket=z.strictObject({message:taggedBody,replyTopic});
const taggedEnvelope=z.strictObject({...common,message:taggedPacket});
export const currentFootprintInverseGetNativeExpectedSchema=z.strictObject({nativeEnvelope:taggedEnvelope,nativeOrigin:z.string().max(2048)});
function record(input:unknown,keys:readonly string[]):Readonly<Record<string,unknown>>{if(input===null||typeof input!=="object"||types.isProxy(input)){throw new Error("FOOTPRINT_INVERSE_GET_NATIVE_DATA");}const parent:unknown=Object.getPrototypeOf(input);if(parent!==Object.prototype&&parent!==null){throw new Error("FOOTPRINT_INVERSE_GET_NATIVE_DATA");}const actual=Reflect.ownKeys(input);if(actual.length!==keys.length||actual.some(key=>typeof key!=="string"||!keys.includes(key))){throw new Error("FOOTPRINT_INVERSE_GET_NATIVE_UNDEFINED_FIELD");}const result:Record<string,unknown>={};for(const key of keys){const descriptor=Object.getOwnPropertyDescriptor(input,key);if(descriptor===undefined||!Object.hasOwn(descriptor,"value")){throw new Error("FOOTPRINT_INVERSE_GET_NATIVE_DATA");}result[key]=descriptor.value;}return result;}
export function captureCurrentFootprintInverseGetNativeExpected(input:unknown):Readonly<z.infer<typeof currentFootprintInverseGetNativeExpectedSchema>>{
 const raw=record(input,["nativeEnvelope","nativeOrigin"]);const original=record(raw["nativeEnvelope"],["type","uuid","topic","id","target","message"]);const packet=record(original["message"],["message","replyTopic"]);const body=record(packet["message"],["uuid","need"]);if(body["need"]!==undefined){throw new Error("FOOTPRINT_INVERSE_GET_NATIVE_UNDEFINED_FIELD");}
 const projected={nativeEnvelope:{type:original["type"],uuid:original["uuid"],topic:original["topic"],id:original["id"],target:original["target"],message:{message:{uuid:body["uuid"],needUndefined:true},replyTopic:packet["replyTopic"]}},nativeOrigin:raw["nativeOrigin"]};return freezeDeep(currentFootprintInverseGetNativeExpectedSchema.parse(capture(projected)));
}
