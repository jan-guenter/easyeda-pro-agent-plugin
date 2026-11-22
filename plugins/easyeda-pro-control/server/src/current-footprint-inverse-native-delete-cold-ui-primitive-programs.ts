/** Fixed native clone/timer recipes, shared only as immutable algorithm data.
 * These functions create neither an original realm nor a UI invocation. */
import {CURRENT_NATIVE_OWN_DATA_BIND,CURRENT_NATIVE_OWN_DATA_CHECK,CURRENT_NATIVE_OWN_DATA_IDENTITIES,CURRENT_NATIVE_OWN_DATA_LITERAL,CURRENT_NATIVE_OWN_DATA_REPROVE} from "./current-native-own-data-intrinsics.ts";
import {CURRENT_FOOTPRINT_INVERSE_LOOKUP_NATIVE_PROGRAMS as NATIVE} from "./current-footprint-inverse-lookup-native-programs.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";

const reflect=`function(){"use strict";${CURRENT_NATIVE_OWN_DATA_CHECK}return[value(root,"Reflect")];}`;
const reflectApply=`function(tuple){"use strict";${CURRENT_NATIVE_OWN_DATA_CHECK}dense(tuple,1);const namespace=value(tuple,"0");if(value(root,"Reflect")!==namespace||proto(namespace)!==objectProto)bad();return[value(namespace,"apply")];}`;
/** Every operand has its original non-Proxy Inspector packet before this
 * closure is built. The fixed source joins the actual global descriptors,
 * native constructor ancestry/species and actual array iterator next at each
 * invocation; a caller Boolean is never an input. */
const primitive=`function(roots,members,qualified,iterator,iteratorProof,reflect,reflectApply){"use strict";${CURRENT_NATIVE_OWN_DATA_CHECK}
dense(roots,20);dense(members,24);dense(iteratorProof,2);dense(reflect,1);dense(reflectApply,1);
const namespace=value(reflect,"0"),ap=value(reflectApply,"0"),next=value(iteratorProof,"0"),checkIterator=value(iteratorProof,"1"),ip=proto(iterator);
const hold=(tuple,n)=>{dense(tuple,n);let cells=null;for(let j=0;j<n;j++)cells={key:""+j,item:value(tuple,""+j),next:cells};return()=>{dense(tuple,n);for(let c=cells;c!==null;c=value(c,"next"))if(value(tuple,value(c,"key"))!==value(c,"item"))bad();return true;};};
const h0=hold(roots,20),h1=hold(members,24),h2=hold(qualified,value(qualified,"length")),h3=hold(iteratorProof,2),h4=hold(reflect,1),h5=hold(reflectApply,1);
const defaults=${NATIVE.defaultInstance},hooks=${NATIVE.hooks};
const check=()=>{if(h0()!==true||h1()!==true||h2()!==true||h3()!==true||h4()!==true||h5()!==true)bad();if(value(root,"Reflect")!==namespace||proto(namespace)!==objectProto||value(namespace,"apply")!==ap||typeof ap!=="function"||proto(ap)!==functionProto||get(ap,"apply")!==undefined||value(ip,"next")!==next||get(iterator,"next")!==undefined||get(arrayProto,"next")!==undefined||get(objectProto,"next")!==undefined||checkIterator()!==true)bad();
 if(invoke(defaults,packet,[roots,members,qualified])!==true||invoke(hooks,packet,[roots,members])!==true)bad();
 return true;};check();return[ap,check];}`;
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_PRIMITIVE_PROGRAMS=freezeDeep({
 ownLiteral:CURRENT_NATIVE_OWN_DATA_LITERAL,ownIdentities:CURRENT_NATIVE_OWN_DATA_IDENTITIES,ownBind:CURRENT_NATIVE_OWN_DATA_BIND,ownReprove:CURRENT_NATIVE_OWN_DATA_REPROVE,
 nativeRoots:NATIVE.roots,nativeParents:NATIVE.parents,nativeNextParents:NATIVE.nextParents,nativePrototypes:NATIVE.prototypes,nativeMerge:NATIVE.merge,nativeMembers:NATIVE.members,
 nativeDefaultInstance:NATIVE.defaultInstance,nativeHooks:NATIVE.hooks,nativeIterator:NATIVE.iterator,nativeIteratorNext:NATIVE.iteratorNext,nativeAsyncPrototype:NATIVE.asyncPrototype,
 reflect,reflectApply,primitive,
}as const);
export type CurrentFootprintInverseNativeDeleteColdUiPrimitiveRole=keyof typeof CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_PRIMITIVE_PROGRAMS;
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_PRIMITIVE_SPECS=freezeDeep({
 ownLiteral:{references:0,byValue:false},ownIdentities:{references:7,byValue:true},ownBind:{references:11,byValue:false},ownReprove:{references:0,byValue:true},
 nativeRoots:{references:0,byValue:false},nativeParents:{references:1,byValue:false},nativeNextParents:{references:1,byValue:false},nativePrototypes:{references:1,byValue:false},nativeMerge:{references:2,byValue:false},nativeMembers:{references:2,byValue:false},
 nativeDefaultInstance:{references:3,byValue:true},nativeHooks:{references:2,byValue:true},nativeIterator:{references:1,byValue:false},nativeIteratorNext:{references:2,byValue:false},nativeAsyncPrototype:{references:0,byValue:false},
 reflect:{references:0,byValue:false},reflectApply:{references:1,byValue:false},primitive:{references:7,byValue:false},
}as const);
