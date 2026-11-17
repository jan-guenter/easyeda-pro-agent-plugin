/** Native callable syntax only. Actual original property replies and their
 * qualification-before-use order remain the drain controller's custody. */
import{z}from"zod";
import{captureCurrentPcbStringClockReply as capture}from"./current-pcb-string-clock-reply.ts";


export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_DRAIN_NATIVE_PROFILES=Object.freeze([
 Object.freeze({role:"add",name:"add",arity:1,constructor:false}),
 Object.freeze({role:"values",name:"values",arity:0,constructor:false}),
 Object.freeze({role:"parse",name:"parse",arity:2,constructor:false}),
 Object.freeze({role:"stringify",name:"stringify",arity:3,constructor:false}),
 Object.freeze({role:"next",name:"next",arity:0,constructor:false}),
]as const);
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote=z.strictObject({type:z.enum(["object","function","string","symbol"]),className:z.string().optional(),description:z.string().optional(),objectId:handle.optional(),value:z.unknown().optional(),subtype:z.string().optional()});
const property=z.strictObject({name:z.string(),value:remote,writable:z.boolean(),enumerable:z.literal(false),configurable:z.literal(true),isOwn:z.literal(true),symbol:remote.optional()});
const parent=z.strictObject({name:z.literal("[[Prototype]]"),value:z.strictObject({type:z.literal("object"),className:z.literal("Object"),description:z.literal("Object"),objectId:handle})});
const namespaceProperties=z.strictObject({result:z.array(property).min(3).max(5),internalProperties:z.tuple([parent])});
/** V8's complete JSON namespace is either the historical parse/stringify
 * pair or also the two newer raw-JSON functions. Extra getters/proxy slots
 * are refused before following any property into a helper invocation. */
export function currentFootprintInverseNativeDeleteDrainJson(input:unknown,namespace:unknown):Readonly<{parse:string;stringify:string}>{
 z.strictObject({type:z.literal("object"),className:z.literal("JSON"),description:z.literal("JSON"),objectId:handle}).parse(namespace);
 const raw=namespaceProperties.parse(capture(input).value);
 const fields=new Map(raw.result.map(row=>[row.name,row]));if(fields.size!==raw.result.length||fields.size!==3&&fields.size!==5){throw new Error("INVERSE_NATIVE_DELETE_DRAIN_JSON");}
 const names=fields.size===3?["parse","stringify"]:["parse","stringify","rawJSON","isRawJSON"];
 const functions=new Map<string,string>();for(const name of names){const row=fields.get(name);if(row===undefined||!row.writable||row.symbol!==undefined){throw new Error("INVERSE_NATIVE_DELETE_DRAIN_JSON_METHOD");}const fn=z.strictObject({type:z.literal("function"),className:z.literal("Function"),description:z.literal(`function ${name}() { [native code] }`),objectId:handle}).parse(row.value);functions.set(name,fn.objectId);}
 const tag=fields.get("Symbol(Symbol.toStringTag)");if(tag===undefined||tag.writable){throw new Error("INVERSE_NATIVE_DELETE_DRAIN_JSON_TAG");}z.strictObject({type:z.literal("symbol"),description:z.literal("Symbol(Symbol.toStringTag)"),objectId:handle}).parse(tag.symbol);z.strictObject({type:z.literal("string"),value:z.literal("JSON")}).parse(tag.value);
 const parse=functions.get("parse"),stringify=functions.get("stringify");if(parse===undefined||stringify===undefined){throw new Error("INVERSE_NATIVE_DELETE_DRAIN_JSON_METHODS");}return Object.freeze({parse,stringify});
}
