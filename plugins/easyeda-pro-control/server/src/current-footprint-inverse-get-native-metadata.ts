/** Entered native primitive roles for the successful metadata-only GET.
 * Promise constructor/members require the separate existing native decoder;
 * these metadata facts cannot issue a worker, GET, rearm or deletion grant. */
import { z } from "zod";
import { captureCurrentFootprintInverseDeleteBindingReply as capture } from "./current-footprint-inverse-delete-binding-capture.ts";
import { decodeCurrentNativeFunctionMetadata } from "./current-native-function-metadata.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_INVERSE_GET_NATIVE_PROFILES=freezeDeep({
 stringify:{name:"stringify",arity:3,constructor:false},
 lower:{name:"toLocaleLowerCase",arity:0,constructor:false},
 push:{name:"push",arity:1,constructor:false},
 shift:{name:"shift",arity:0,constructor:false},
 hasInstance:{name:"[Symbol.hasInstance]",arity:1,constructor:false},
 debug:{name:"debug",arity:0,constructor:false},
 error:{name:"error",arity:0,constructor:false},
}as const);
export type CurrentFootprintInverseGetNativeRole=keyof typeof CURRENT_FOOTPRINT_INVERSE_GET_NATIVE_PROFILES;
export function currentFootprintInverseGetNativeCallable(input:unknown,role:CurrentFootprintInverseGetNativeRole):string{const expected=CURRENT_FOOTPRINT_INVERSE_GET_NATIVE_PROFILES[role];const value=z.strictObject({result:z.strictObject({type:z.literal("function"),className:z.literal("Function"),description:z.literal(`function ${expected.name}() { [native code] }`),objectId:z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u)})}).parse(capture(input)).result;return value.objectId;}
export function qualifyCurrentFootprintInverseGetNativeFunction(input:unknown,role:CurrentFootprintInverseGetNativeRole):void{decodeCurrentNativeFunctionMetadata(input,CURRENT_FOOTPRINT_INVERSE_GET_NATIVE_PROFILES[role]);}
