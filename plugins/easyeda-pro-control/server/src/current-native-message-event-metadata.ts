/** Origin-free native MessageEvent metadata only. No supplied descriptor,
 * string or handle can issue a trusted native delivery/owner token. */
import { z } from "zod";
import { captureCurrentFootprintInverseDeleteBindingReply as capture } from "./current-footprint-inverse-delete-binding-capture.ts";
import { decodeCurrentNativeFunctionMetadata } from "./current-native-function-metadata.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

// DOM Event.isTrusted is unforgeable; HTML MessageEvent inherits Event.
// https://dom.spec.whatwg.org/#interface-event
// https://html.spec.whatwg.org/multipage/comms.html#the-messageevent-interface
export const CURRENT_NATIVE_MESSAGE_EVENT_PROFILES=freezeDeep([
 {name:"MessageEvent",arity:1,constructor:true,parentDescription:"function Event() { [native code] }"},
 {name:"get target",arity:0,constructor:false},
 {name:"get type",arity:0,constructor:false},
 {name:"get isTrusted",arity:0,constructor:false},
 {name:"get data",arity:0,constructor:false},
 {name:"get origin",arity:0,constructor:false},
 {name:"get source",arity:0,constructor:false},
]as const);
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u),text=z.string().max(8192);
const remote=z.strictObject({type:z.enum(["object","function","number","string"]),subtype:text.optional(),className:text.optional(),description:text.optional(),objectId:handle.optional(),value:z.union([z.string(),z.number()]).optional()});
const property=z.strictObject({name:text,value:remote,writable:z.boolean(),configurable:z.boolean(),enumerable:z.boolean(),isOwn:z.literal(true)});const internal=z.strictObject({name:text,value:remote});
function need(value:boolean):asserts value{if(!value){throw new Error("NATIVE_MESSAGE_EVENT_METADATA");}}
export function currentNativeMessageEventCallable(input:unknown,selection:"Event"|number):string{let name:string;if(selection==="Event"){name=selection;}else{const profile=Number.isInteger(selection)&&!Object.is(selection,-0)?CURRENT_NATIVE_MESSAGE_EVENT_PROFILES[selection]:undefined;need(profile!==undefined);name=profile.name;}const value=z.strictObject({result:z.strictObject({type:z.literal("function"),className:z.literal("Function"),description:text,objectId:handle})}).parse(capture(input)).result;need(value.description===`function ${name}() { [native code] }`);return value.objectId;}
/** Complete Event constructor descriptors, including four numeric constants.
 * Generic native constructor validation has a function-only static roster. */
export function qualifyCurrentNativeEventConstructor(input:unknown):void{
 const reply=z.strictObject({result:z.array(property).length(7),internalProperties:z.array(internal).length(2)}).parse(capture(input));const fields=new Map(reply.result.map(row=>[row.name,row]));need(fields.size===7);const constants={NONE:0,CAPTURING_PHASE:1,AT_TARGET:2,BUBBLING_PHASE:3}as const;const allowed=new Set(["length","name","prototype",...Object.keys(constants)]);for(const row of reply.result){need(allowed.has(row.name));}
 for(const[name,value]of[["name","Event"],["length",1]]as const){const row=fields.get(name);need(row!==undefined&&!row.writable&&!row.enumerable&&row.configurable&&row.value.type===(name==="name"?"string":"number")&&row.value.value===value&&row.value.objectId===undefined&&row.value.subtype===undefined&&row.value.className===undefined);}
 const prototype=fields.get("prototype");need(prototype!==undefined&&!prototype.writable&&!prototype.enumerable&&!prototype.configurable&&prototype.value.type==="object"&&prototype.value.className==="Event"&&prototype.value.description==="Event"&&prototype.value.objectId!==undefined&&prototype.value.value===undefined&&prototype.value.subtype===undefined);
 for(const[name,value]of Object.entries(constants)){const row=fields.get(name);need(row!==undefined&&!row.writable&&row.enumerable&&!row.configurable&&row.value.type==="number"&&row.value.value===value&&!Object.is(row.value.value,-0)&&row.value.objectId===undefined&&row.value.subtype===undefined&&row.value.className===undefined);}
 const parts=new Map(reply.internalProperties.map(row=>[row.name,row.value]));need(parts.size===2);const parent=parts.get("[[Prototype]]"),scopes=parts.get("[[Scopes]]");need(parent?.type==="function"&&parent.className==="Function"&&parent.description==="function () { [native code] }"&&parent.objectId!==undefined&&parent.value===undefined&&parent.subtype===undefined&&scopes?.type==="object"&&scopes.className==="Array"&&scopes.subtype==="internal#scopeList"&&scopes.description==="Scopes[0]"&&scopes.objectId!==undefined&&scopes.value===undefined);
}
export function qualifyCurrentNativeMessageEventFunction(input:unknown,slot:number):void{const expected=Number.isInteger(slot)&&!Object.is(slot,-0)?CURRENT_NATIVE_MESSAGE_EVENT_PROFILES[slot]:undefined;need(expected!==undefined);decodeCurrentNativeFunctionMetadata(input,expected);}
