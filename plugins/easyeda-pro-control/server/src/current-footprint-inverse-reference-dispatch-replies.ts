import{types}from"node:util";
/** Distinct closed SCH scope shapes from the actual unmodified factories.
 * The handler has a factory Closure then module Closure; its class method has
 * only module Closure. No arbitrary scope search or Global binding read. */
import{z}from"zod";
import{captureCurrentFootprintInversePreferenceReply as capture}from"./current-footprint-inverse-public-preferences-replies.ts";

const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote=z.strictObject({type:z.enum(["object","function","string","number","boolean","undefined","symbol","bigint"]),subtype:z.string().optional(),className:z.string().optional(),description:z.string().optional(),objectId:handle.optional(),value:z.unknown().optional(),unserializableValue:z.string().optional()});
const property=z.strictObject({name:z.string(),value:remote.optional(),get:remote.optional(),set:remote.optional(),writable:z.boolean().optional(),enumerable:z.boolean(),configurable:z.boolean(),isOwn:z.literal(true),symbol:remote.optional()});
const internal=z.strictObject({name:z.string(),value:remote});
const packet=z.strictObject({result:z.array(property).max(512),internalProperties:z.array(internal).max(3).optional()});
function need(value:boolean):asserts value{if(!value){throw new Error("INVERSE_REFERENCE_DISPATCH_REPLY");}}
/** Opaque property values are retained, including values never traversed by
 * the selected query. Only the subject's native metadata is qualified here. */
export function currentFootprintInverseReferenceDispatchProperties(input:unknown):void{const raw=packet.parse(capture(input));const keys=new Set<string>();for(const item of raw.result){need(!keys.has(item.name));keys.add(item.name);}const names=new Set<string>();for(const item of raw.internalProperties??[]){need(!names.has(item.name)&&["[[Prototype]]","[[Entries]]","[[Scopes]]","[[FunctionLocation]]"].includes(item.name));names.add(item.name);}need(!names.has("[[Target]]")&&!names.has("[[Handler]]"));}
const scopeValue=z.strictObject({type:z.literal("object"),subtype:z.literal("internal#scope"),className:z.literal("Object"),description:z.enum(["Closure","Script","Global"]),objectId:handle});
const scopeField=z.strictObject({name:z.string(),value:scopeValue,writable:z.literal(true),enumerable:z.literal(true),configurable:z.literal(true),isOwn:z.literal(true)});
const scopePacket=z.strictObject({result:z.array(scopeField).min(2).max(4)});
export function currentFootprintInverseReferenceSchematicScope(input:unknown,role:"handler"|"method"):string{const raw=scopePacket.parse(capture(input));const closures=role==="handler"?2:1;need(raw.result.length===closures+1||raw.result.length===closures+2);for(const[index,row]of raw.result.entries()){need(row.name===String(index));let expected="Closure";if(index>=closures){expected=index===raw.result.length-1?"Global":"Script";}need(row.value.description===expected);}const selected=raw.result[closures-1];need(selected!==undefined);return selected.value.objectId;}
/** Extract only the engine location. The caller must immediately validate the
 * full exact source/function profile and retrieve that same original script. */
export function currentFootprintInverseReferenceFunctionScript(input:unknown):string{const raw=packet.parse(capture(input));const locations=raw.internalProperties?.filter(item=>item.name==="[[FunctionLocation]]")??[];need(locations.length===1);const location=locations[0]?.value;need(location!==undefined&&location.type==="object"&&location.subtype==="internal#location"&&location.objectId===undefined);return z.strictObject({scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()}).parse(location.value).scriptId;}

export function currentFootprintInverseReferenceDispatchScript(input:unknown):string{need(input!==null&&typeof input==="object"&&!types.isProxy(input)&&(Object.getPrototypeOf(input)===Object.prototype||Object.getPrototypeOf(input)===null)&&Reflect.ownKeys(input).length===1);const field=Object.getOwnPropertyDescriptor(input,"scriptSource");need(field!==undefined&&Object.hasOwn(field,"value")&&typeof field.value==="string"&&field.value.length<=6_500_000);return field.value;}
