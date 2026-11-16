/** Exact fixed callback prefix for each native reference. The selected kind is
 * supplied by original Core custody; these strings contain no owner receipt. */
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_PCB_CALLBACK_PROGRAMS as BASE} from "./current-footprint-inverse-native-reference-pcb-callback-programs.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_ROSTER as ROSTER} from "./current-footprint-inverse-native-reference-roster.ts";
import type {CurrentFootprintInverseNativeReferenceNextKind as Kind} from "./current-footprint-inverse-native-reference-next-sender-protocol.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";

function replace(source:string,from:string,to:string):string{if(source.split(from).length!==2){throw new Error("INVERSE_NATIVE_NEXT_CALLBACK_CENSUS");}return source.replace(from,to);}
const checks=Object.freeze({
 schematic:'if(proto(argument)!==objectProto||count(argument)!==2||data(argument,"uuid")!==value(sender,"3")||data(argument,"type")!=="Footprint")bad();',
 "footprint-derived":'dense(argument,2);if(value(argument,"0")!==value(sender,"3")||value(argument,"1")!==value(sender,"4"))bad();',
 "device-all":'dense(argument,1);if(value(argument,"0")!==value(sender,"4"))bad();',
});
const entries=Object.freeze({
 schematic:'if(proto(fresh)!==objectProto||proto(old)!==objectProto||count(fresh)!==2||count(old)!==2)bad();for(const key of["uuid","type"])if(data(fresh,key)!==data(old,key))bad();',
 "footprint-derived":'dense(fresh,2);dense(old,2);for(let j=0;j<2;j++)if(value(fresh,""+j)!==value(old,""+j))bad();',
 "device-all":'dense(fresh,1);dense(old,1);for(let j=0;j<1;j++)if(value(fresh,""+j)!==value(old,""+j))bad();',
});
function programs(kind:Kind):Readonly<typeof BASE>{return freezeDeep({...BASE,
 prepare:replace(replace(BASE.prepare,"/PrjDB/pcb/getAllArrDatas",ROSTER[kind].topic),'dense(argument,1);if(value(argument,"0")!==value(sender,"4"))bad();',checks[kind]),
 entry:replace(BASE.entry,'dense(fresh,1);dense(old,1);for(let j=0;j<1;j++)if(value(fresh,""+j)!==value(old,""+j))bad();',entries[kind]),
});}
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_NEXT_CALLBACK_PROGRAMS=freezeDeep({schematic:programs("schematic"),"footprint-derived":programs("footprint-derived"),"device-all":programs("device-all")});
export {CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_PCB_CALLBACK_EXPRESSIONS as CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_NEXT_CALLBACK_EXPRESSIONS} from "./current-footprint-inverse-native-reference-pcb-callback-programs.ts";
