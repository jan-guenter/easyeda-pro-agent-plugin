/** Passive metadata syntax; the original controller supplies every packet. */
import{z}from"zod";
import{captureCurrentPcbStringClockReply as capture}from"./current-pcb-string-clock-reply.ts";
import{decodeCurrentNativeFunctionMetadata}from"./current-native-function-metadata.ts";
import{currentFootprintInverseLookupNativeCallable as callable}from"./current-footprint-inverse-lookup-native-metadata.ts";

const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_UPLOAD_NATIVE_PROFILES=Object.freeze([
 Object.freeze({role:"toString",index:7,name:"toString",arity:0,constructor:false}),
 Object.freeze({role:"get",index:8,name:"get",arity:1,constructor:false}),
 Object.freeze({role:"has",index:10,name:"has",arity:1,constructor:false}),
 Object.freeze({role:"size",index:11,name:"get size",arity:0,constructor:false}),
]as const);
/** Inspector materializes this intrinsic species accessor as its native
 * constructor value. It is never invoked by the recipe. Keep all other own
 * constructor metadata strict and preserve the exact original internal slots. */
export function qualifyCurrentFootprintInverseNativeDeleteUploadSet(input:unknown,remote:unknown):void{
 callable(remote,"Set");
 const raw=z.strictObject({result:z.array(z.unknown()).length(4),internalProperties:z.array(z.unknown()).length(2)}).parse(capture(input).value);
 const rows=raw.result.filter(row=>z.looseObject({name:z.string()}).parse(row).name!=="Symbol(Symbol.species)");
 const species=raw.result.filter(row=>z.looseObject({name:z.string()}).parse(row).name==="Symbol(Symbol.species)");
 if(rows.length!==3||species.length!==1){throw new Error("INVERSE_NATIVE_DELETE_UPLOAD_SET_METADATA");}
 z.strictObject({name:z.literal("Symbol(Symbol.species)"),value:z.strictObject({type:z.literal("function"),className:z.literal("Function"),description:z.literal("function Set() { [native code] }"),objectId:handle}),writable:z.literal(false),enumerable:z.literal(false),configurable:z.literal(true),isOwn:z.literal(true),symbol:z.strictObject({type:z.literal("symbol"),description:z.literal("Symbol(Symbol.species)"),objectId:handle})}).parse(species[0]);
 decodeCurrentNativeFunctionMetadata({result:rows,internalProperties:raw.internalProperties},{name:"Set",arity:0,constructor:true});
}
