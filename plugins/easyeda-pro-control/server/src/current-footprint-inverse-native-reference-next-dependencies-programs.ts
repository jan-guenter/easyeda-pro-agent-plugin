/** Fresh native held-RPC module and four registered namespace projections.
 * Old native channel/registry values are comparison data only; their spent
 * ticket guards are never called. Actual body/return authority stays separate. */
import {CURRENT_NATIVE_OWN_DATA_CHECK} from "./current-native-own-data-intrinsics.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_PCB_DEPENDENCIES_PROGRAMS as BASE} from "./current-footprint-inverse-native-reference-pcb-dependencies-programs.ts";
import {CURRENT_FOOTPRINT_INVERSE_REFERENCE_DISPATCH_PROGRAMS as DISPATCH} from "./current-footprint-inverse-reference-dispatch-programs.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_ROSTER as ROSTER} from "./current-footprint-inverse-native-reference-roster.ts";
import type {CurrentFootprintInverseNativeReferenceNextKind as Kind} from "./current-footprint-inverse-native-reference-next-sender-protocol.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";

const common=`"use strict";${CURRENT_NATIVE_OWN_DATA_CHECK}const guard=f=>{if(typeof f!=="function"||f()!==true)bad();};const data=(o,k)=>{const d=get(o,k);if(!d||!has(d,"value")||!d.writable||!d.enumerable||!d.configurable)bad();return d.value;};const method=(o,k)=>{const d=get(o,k);if(!d||!has(d,"value")||typeof d.value!=="function"||!d.writable||d.enumerable||!d.configurable)bad();return d.value;};`;
const selected=`function(roots,context,bus,methods,module){${common}dense(roots,2);dense(context,2);dense(bus,4);dense(methods,9);dense(module,14);const b=value(roots,"1"),p=value(context,"1"),ctor=value(bus,"3"),host=value(roots,"0"),project=value(context,"0"),keys=["uniqueRpcTopic","publish","subscribe","push","pull","pullA","rpcService","rpcCall","rpcReply"],check=()=>{guard(value(module,"13"));if(value(root,"gVars")!==host||value(root,"_MSG_BUS_")!==b||data(host,"currentProject")!==project||proto(b)!==p||proto(p)!==objectProto||method(p,"constructor")!==ctor||ctor!==value(module,"0"))bad();for(let j=0;j<9;j++)if(get(b,value(keys,""+j))!==undefined||method(p,value(keys,""+j))!==value(methods,""+j))bad();return true;};check();return[b,p,ctor,check];}`;
function replace(source:string,from:string,to:string):string{if(source.split(from).length!==2){throw new Error("INVERSE_NATIVE_NEXT_DEPENDENCIES_CENSUS");}return source.replace(from,to);}
const checks=Object.freeze({
 schematic:'if(proto(args)!==objectProto||count(args)!==2)bad();for(const key of["uuid","type"]){const d=get(args,key);if(!d||!has(d,"value")||!d.writable||!d.enumerable||!d.configurable)bad();}if(value(args,"uuid")!==value(sender,"3")||value(args,"type")!=="Footprint")bad();',
 "footprint-derived":'dense(args,2);if(value(args,"0")!==value(sender,"3")||value(args,"1")!==value(sender,"4"))bad();',
 "device-all":'dense(args,1);if(value(args,"0")!==value(sender,"4"))bad();',
});
const managerOriginal=replace(DISPATCH.managerOriginal,'guard(value(channel,"11"));',"");
/** Every selected program is fixed. Its kind comes from the original Core
 * next-query registry, never an externally selected endpoint or body. */
function programs(kind:Kind):Readonly<typeof DISPATCH&Readonly<{module:string;selected:string;join:string}>>{
 const own=(role:"module"|"join"):string=>replace(replace(BASE[role],"/PrjDB/pcb/getAllArrDatas",ROSTER[kind].topic),'dense(args,1);if(value(args,"0")!==value(sender,"4"))bad();',checks[kind]);
 return freezeDeep({...DISPATCH,managerOriginal,module:own("module"),selected,join:own("join")});
}
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_NEXT_DEPENDENCIES_PROGRAMS=freezeDeep({schematic:programs("schematic"),"footprint-derived":programs("footprint-derived"),"device-all":programs("device-all")});
