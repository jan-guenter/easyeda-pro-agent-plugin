/** Negative branch facts only. The original owner must correlate every
 * packet with its pending request and original held event before using these
 * decoders. Equal JSON cannot issue a cold birth or absence observation. */
import {z} from "zod";
import {captureCurrentFootprintInversePreferenceReply as capture} from "./current-footprint-inverse-public-preferences-replies.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_SOURCE as SOURCE} from "./current-footprint-inverse-native-delete-cold-ui-source.ts";

const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$(?![\s\S])/u);
const remote=z.strictObject({type:z.enum(["undefined","object","function","string","number","boolean","symbol"]),subtype:z.string().max(64).optional(),className:z.string().max(128).optional(),description:z.string().max(16_384).optional(),objectId:handle.optional(),value:z.unknown().optional()});
const property=z.strictObject({name:z.string().max(128),value:remote,writable:z.literal(true),enumerable:z.literal(true),configurable:z.literal(true),isOwn:z.literal(true)});
const internal=z.strictObject({name:z.string().max(128),value:remote});
const properties=z.strictObject({result:z.array(property).max(3),internalProperties:z.tuple([internal])});
const location=z.strictObject({scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()});
function need(ok:boolean):asserts ok{if(!ok){throw new Error("INVERSE_NATIVE_DELETE_COLD_UI_REPLY");}}
/** Returns the actual prototype handle for a later same-realm identity proof;
 * opaque remote IDs are not assumed to be canonical object identities. */
export function requireCurrentFootprintInverseNativeDeleteColdUiMissing(input:unknown):Readonly<{prototype:string}>{
 const raw=properties.parse(capture(input));const fields=new Map(raw.result.map(row=>[row.name,row.value]));
 const success=fields.get("success");const message=fields.get("message");const prototype=raw.internalProperties[0];
 need(raw.result.length===2&&fields.size===2&&success?.type==="boolean"&&success.value===false&&success.objectId===undefined&&success.subtype===undefined&&message?.type==="string"&&message.value==="数据不存在"&&message.objectId===undefined&&message.subtype===undefined&&prototype.name==="[[Prototype]]"&&prototype.value.type==="object"&&prototype.value.className==="Object"&&prototype.value.subtype===undefined&&prototype.value.objectId!==undefined);
 return Object.freeze({prototype:prototype.value.objectId});
}
export function requireCurrentFootprintInverseNativeDeleteColdUiOuterValue(input:unknown):Readonly<{prototype:string}>{
 const raw=properties.parse(capture(input));const fields=new Map(raw.result.map(row=>[row.name,row.value]));const prototype=raw.internalProperties[0];
 need(raw.result.length===3&&fields.size===3&&["message","bridge","source"].every(name=>{const value=fields.get(name);return value?.type==="undefined"&&value.objectId===undefined&&!Object.hasOwn(value,"value")&&value.subtype===undefined;}));
 need(prototype.name==="[[Prototype]]"&&prototype.value.type==="object"&&prototype.value.className==="Object"&&prototype.value.subtype===undefined&&prototype.value.objectId!==undefined);
 return Object.freeze({prototype:prototype.value.objectId});
}
export function requireCurrentFootprintInverseNativeDeleteColdUiFulfilledPromise(input:unknown):Readonly<{result:string;prototype:string}>{
 const raw=z.strictObject({result:z.tuple([]),internalProperties:z.array(internal).length(3)}).parse(capture(input));
 const values=new Map(raw.internalProperties.map(row=>[row.name,row.value]));need(values.size===3);
 const state=values.get("[[PromiseState]]");const value=values.get("[[PromiseResult]]");const prototype=values.get("[[Prototype]]");
 need(state?.type==="string"&&state.value==="fulfilled"&&state.objectId===undefined&&state.subtype===undefined&&value?.type==="object"&&value.subtype===undefined&&value.className==="Object"&&value.objectId!==undefined&&prototype?.type==="object"&&prototype.subtype===undefined&&prototype.className==="Promise"&&prototype.objectId!==undefined);
 return Object.freeze({result:value.objectId,prototype:prototype.objectId});
}
/** At rpcReply the immediately original caller must be the fulfilled arrow.
 * The catch arrow sends the same undefined payload and is always refused. */
export function requireCurrentFootprintInverseNativeDeleteColdUiFulfilledCaller(input:unknown,uiScriptId:string):string{
 handle.parse(uiScriptId);
 const raw=z.looseObject({callFrameId:handle,functionName:z.literal(""),functionLocation:location,location}).parse(capture(input));
 const fixed=SOURCE.uiFulfilled;
 need(raw.functionLocation.scriptId===uiScriptId&&raw.functionLocation.lineNumber===fixed.lineNumber&&raw.functionLocation.columnNumber===fixed.columnNumber&&raw.location.scriptId===uiScriptId&&raw.location.lineNumber===fixed.lineNumber&&raw.location.columnNumber>=fixed.columnNumber&&raw.location.columnNumber<fixed.columnNumber+fixed.bytes);
 return raw.callFrameId;
}
