/** Origin-free fixed primitives for a fresh same-realm reflection receipt.
 * Core must retain the literal, metadata and identity packets before any use.
 * No serialized tuple or matching descriptor issues an original receipt. */
import { z } from "zod";
import { captureCurrentFootprintInverseDeleteBindingReply as capture } from "./current-footprint-inverse-delete-binding-capture.ts";
import { decodeCurrentNativeFunctionMetadata } from "./current-native-function-metadata.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_NATIVE_OWN_DATA_PROFILES=freezeDeep([
 {name:"getOwnPropertyDescriptor",arity:2,constructor:false},
 {name:"getPrototypeOf",arity:1,constructor:false},
 {name:"hasOwn",arity:2,constructor:false},
 {name:"getOwnPropertyNames",arity:1,constructor:false},
 {name:"getOwnPropertySymbols",arity:1,constructor:false},
 {name:"isArray",arity:1,constructor:false},
 {name:"apply",arity:2,constructor:false},
]as const);
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u),text=z.string().max(8192);
function need(value:boolean):asserts value{if(!value){throw new Error("NATIVE_OWN_DATA_INTRINSICS");}}
export function currentNativeOwnDataCallable(input:unknown,index:number):string{const row=Number.isInteger(index)&&!Object.is(index,-0)?CURRENT_NATIVE_OWN_DATA_PROFILES[index]:undefined;need(row!==undefined);const value=z.strictObject({result:z.strictObject({type:z.literal("function"),className:z.literal("Function"),description:text,objectId:handle})}).parse(capture(input)).result;need(value.description===`function ${row.name}() { [native code] }`);return value.objectId;}
export function qualifyCurrentNativeOwnDataFunction(input:unknown,index:number):void{const row=Number.isInteger(index)&&!Object.is(index,-0)?CURRENT_NATIVE_OWN_DATA_PROFILES[index]:undefined;need(row!==undefined);decodeCurrentNativeFunctionMetadata(input,row);}
/** No ambient property, method, constructor, iterator, spread or array push
 * runs in the first builder. Literal elements create their own data slots. */
export const CURRENT_NATIVE_OWN_DATA_LITERAL="function(){return[this,{},[],function(){}];}";
export const CURRENT_NATIVE_OWN_DATA_BIND="function(get,proto,has,names,symbols,isArray,apply,objectProto,arrayProto,functionProto,root){return[get,proto,has,names,symbols,isArray,apply,objectProto,arrayProto,functionProto,root];}";
/** Core substitutes every argument only from its actual original Inspector
 * property packets. Object/Array constructors themselves are never invoked. */
export const CURRENT_NATIVE_OWN_DATA_IDENTITIES="function(objectProto,arrayProto,functionProto,objectCtorProto,arrayCtorProto,objectCtorParent,arrayCtorParent){return objectProto===objectCtorProto&&arrayProto===arrayCtorProto&&functionProto===objectCtorParent&&functionProto===arrayCtorParent;}";
export const CURRENT_NATIVE_OWN_DATA_CHECK=String.raw`const packet=this,get=packet[0],proto=packet[1],has=packet[2],names=packet[3],symbols=packet[4],isArray=packet[5],apply=packet[6],objectProto=packet[7],arrayProto=packet[8],functionProto=packet[9],root=packet[10],bad=()=>{throw "NATIVE_OWN_DATA_BINDING";};
const value=(o,k)=>{const d=get(o,k);if(!d||!has(d,"value"))bad();return d.value;};const field=(d,k)=>has(d,k)?d[k]:undefined;const count=o=>names(o).length+symbols(o).length;const dense=(o,n)=>{if(!isArray(o)||proto(o)!==arrayProto||count(o)!==n+1)bad();const length=get(o,"length");if(!length||!has(length,"value")||length.value!==n||!length.writable||length.enumerable||length.configurable)bad();for(let i=0;i<n;i++){const d=get(o,""+i);if(!d||!has(d,"value")||!d.writable||!d.enumerable||!d.configurable)bad();}};
const descriptorKeys=["value","get","set","writable","enumerable","configurable"];for(let i=0;i<6;i++)if(get(objectProto,descriptorKeys[i])!==undefined)bad();
dense(packet,11);const expected=[get,proto,has,names,symbols,isArray,apply,objectProto,arrayProto,functionProto,root];for(let i=0;i<11;i++)if(value(packet,""+i)!==expected[i])bad();if(proto(objectProto)!==null||proto(arrayProto)!==objectProto)bad();const ad=get(functionProto,"apply");if(!ad||!has(ad,"value")||ad.value!==apply||!ad.writable||ad.enumerable||!ad.configurable)bad();for(let i=0;i<7;i++){const fn=expected[i];if(typeof fn!=="function"||proto(fn)!==functionProto||get(fn,"apply")!==undefined)bad();}
const invoke=(fn,receiver,args)=>{if(typeof fn!=="function"||proto(fn)!==functionProto||get(fn,"apply")!==undefined||value(functionProto,"apply")!==apply)bad();return fn.apply(receiver,args);};`;
export const CURRENT_NATIVE_OWN_DATA_REPROVE=`function(){"use strict";${CURRENT_NATIVE_OWN_DATA_CHECK}return true;}`;
