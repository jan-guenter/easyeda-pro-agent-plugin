/** Origin-free complete native constructor metadata checks for the inverse
 * clock. Core must correlate the original context/tuple/reply itself. */
import { z } from "zod";
import { captureCurrentFootprintInverseDeleteBindingReply as capture } from "./current-footprint-inverse-delete-binding-capture.ts";
import { decodeCurrentNativeFunctionMetadata } from "./current-native-function-metadata.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

// Interface inheritance and member shape: HTML BroadcastChannel, Window/Worker.
// https://html.spec.whatwg.org/multipage/web-messaging.html#the-broadcastchannel-interface
export const CURRENT_FOOTPRINT_INVERSE_CLOCK_NATIVE_PROFILES=freezeDeep([
 {name:"BroadcastChannel",arity:1,constructor:true,parentDescription:"function EventTarget() { [native code] }"},
 {name:"get name",arity:0,constructor:false},
 {name:"postMessage",arity:1,constructor:false},
 {name:"get onmessage",arity:0,constructor:false},
 {name:"set onmessage",arity:1,constructor:false},
 {name:"resolve",arity:1,constructor:false},
 {name:"then",arity:2,constructor:false},
 {name:"catch",arity:1,constructor:false},
 {name:"finally",arity:1,constructor:false},
 {name:"get [Symbol.species]",arity:0,constructor:false},
 {name:"",arity:1,constructor:false},
 {name:"now",arity:0,constructor:false},
]as const);
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u),text=z.string().max(8192);
const remote=z.strictObject({type:z.enum(["object","function","number","string","symbol"]),subtype:text.optional(),className:text.optional(),description:text.optional(),objectId:handle.optional(),value:z.union([z.string(),z.number()]).optional()});
const property=z.strictObject({name:text,value:remote,writable:z.boolean(),configurable:z.boolean(),enumerable:z.boolean(),isOwn:z.literal(true),symbol:remote.optional()});const internal=z.strictObject({name:text,value:remote});
const optional=["try","withResolvers"]as const;const required=["all","allSettled","any","race","resolve","reject"]as const;
function need(value:boolean):asserts value{if(!value){throw new Error("FOOTPRINT_INVERSE_CLOCK_NATIVE_METADATA");}}
/** Qualify the callable's actual V8 description separately from own-property
 * metadata. Renaming a different native function cannot supply this role. */
export function currentFootprintInverseClockNativeCallable(input:unknown,selection:"Promise"|"Date"|number):string{
 let name:string;if(selection==="Promise"||selection==="Date"){name=selection;}else{const profile=Number.isInteger(selection)&&!Object.is(selection,-0)?CURRENT_FOOTPRINT_INVERSE_CLOCK_NATIVE_PROFILES[selection]:undefined;need(profile!==undefined);name=profile.name;}
 const value=z.strictObject({result:z.strictObject({type:z.literal("function"),className:z.literal("Function"),description:text,objectId:handle})}).parse(capture(input)).result;need(value.description===`function ${name}() { [native code] }`);return value.objectId;
}
/** Complete supplied V8 descriptor packet, including its species symbol.
 * The two fixed newer methods are optional roster entries, never execution
 * authority. Every other field, getter shape or added member refuses. */
export function qualifyCurrentFootprintInverseClockPromiseConstructor(input:unknown):void{
 const reply=z.strictObject({result:z.array(property).min(10).max(12),internalProperties:z.array(internal).length(2)}).parse(capture(input));const fields=new Map(reply.result.map(row=>[row.name,row]));need(fields.size===reply.result.length);
 const allowed=new Set<string>(["length","name","prototype",...required,...optional,"Symbol(Symbol.species)"]);for(const row of reply.result){need(allowed.has(row.name)&&!row.enumerable);if(row.name!=="Symbol(Symbol.species)"){need(row.symbol===undefined);}}
 for(const[name,value]of[["name","Promise"],["length",1]]as const){const row=fields.get(name);need(row!==undefined&&!row.writable&&row.configurable&&row.value.type===(name==="name"?"string":"number")&&row.value.value===value&&row.value.objectId===undefined&&row.value.subtype===undefined&&row.value.className===undefined);}
 const prototype=fields.get("prototype");need(prototype!==undefined&&!prototype.writable&&!prototype.configurable&&prototype.value.type==="object"&&prototype.value.className==="Promise"&&prototype.value.description==="Promise"&&prototype.value.objectId!==undefined&&prototype.value.subtype===undefined&&prototype.value.value===undefined);
 for(const name of[...required,...optional]){const row=fields.get(name);if(row===undefined){need(optional.some(value=>value===name));}else{need(row.writable&&row.configurable&&row.value.type==="function"&&row.value.className==="Function"&&row.value.description===`function ${name}() { [native code] }`&&row.value.objectId!==undefined&&row.value.value===undefined&&row.value.subtype===undefined);}}
 // V8 materializes the native species getter value in this descriptor packet.
 // Later fixed capture must qualify the actual JS getter identity before
 // Explicit execution. This validator itself invokes no supplied member.
 const species=fields.get("Symbol(Symbol.species)");need(species!==undefined&&!species.writable&&species.configurable&&species.value.type==="function"&&species.value.className==="Function"&&species.value.description==="function Promise() { [native code] }"&&species.value.objectId!==undefined&&species.value.value===undefined&&species.value.subtype===undefined&&species.symbol?.type==="symbol"&&species.symbol.description==="Symbol(Symbol.species)"&&species.symbol.objectId!==undefined&&species.symbol.value===undefined&&species.symbol.subtype===undefined&&species.symbol.className===undefined);
 const parts=new Map(reply.internalProperties.map(row=>[row.name,row.value]));need(parts.size===2);const parent=parts.get("[[Prototype]]"),scopes=parts.get("[[Scopes]]");need(parent?.type==="function"&&parent.className==="Function"&&parent.description==="function () { [native code] }"&&parent.objectId!==undefined&&parent.value===undefined&&parent.subtype===undefined&&scopes?.type==="object"&&scopes.className==="Array"&&scopes.subtype==="internal#scopeList"&&scopes.description==="Scopes[0]"&&scopes.objectId!==undefined&&scopes.value===undefined);
}
export function qualifyCurrentFootprintInverseClockNativeFunction(input:unknown,slot:number):void{const expected=Number.isInteger(slot)&&!Object.is(slot,-0)?CURRENT_FOOTPRINT_INVERSE_CLOCK_NATIVE_PROFILES[slot]:undefined;need(expected!==undefined);decodeCurrentNativeFunctionMetadata(input,expected);}

/** V8 exposes Date.prototype as an ordinary Object; its complete native
 * constructor packet differs from the generic WebIDL constructor profile. */
export function qualifyCurrentFootprintInverseClockDateConstructor(input:unknown):void{
 const reply=z.strictObject({result:z.array(property).length(6),internalProperties:z.array(internal).length(2)}).parse(capture(input));const fields=new Map(reply.result.map(row=>[row.name,row]));need(fields.size===6);const allowed=new Set(["length","name","prototype","now","parse","UTC"]);for(const row of reply.result){need(allowed.has(row.name)&&!row.enumerable&&row.symbol===undefined);}
 for(const[name,value]of[["name","Date"],["length",7]]as const){const row=fields.get(name);need(row!==undefined&&!row.writable&&row.configurable&&row.value.type===(name==="name"?"string":"number")&&row.value.value===value&&row.value.objectId===undefined&&row.value.subtype===undefined&&row.value.className===undefined);}
 const prototype=fields.get("prototype");need(prototype!==undefined&&!prototype.writable&&!prototype.configurable&&prototype.value.type==="object"&&prototype.value.className==="Object"&&prototype.value.description==="Object"&&prototype.value.subtype===undefined&&prototype.value.objectId!==undefined&&prototype.value.value===undefined);
 for(const name of["now","parse","UTC"]){const row=fields.get(name);need(row!==undefined&&row.writable&&row.configurable&&row.value.type==="function"&&row.value.className==="Function"&&row.value.description===`function ${name}() { [native code] }`&&row.value.objectId!==undefined&&row.value.value===undefined&&row.value.subtype===undefined);}
 const parts=new Map(reply.internalProperties.map(row=>[row.name,row.value]));need(parts.size===2);const parent=parts.get("[[Prototype]]"),scopes=parts.get("[[Scopes]]");need(parent?.type==="function"&&parent.className==="Function"&&parent.description==="function () { [native code] }"&&parent.objectId!==undefined&&parent.value===undefined&&parent.subtype===undefined&&scopes?.type==="object"&&scopes.className==="Array"&&scopes.subtype==="internal#scopeList"&&scopes.description==="Scopes[0]"&&scopes.objectId!==undefined&&scopes.value===undefined);
}
