/** Complete native worker and outer UI return route projection. No old result authority. */
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_PCB_RESULT_PROGRAMS as BASE} from "./current-footprint-inverse-v4-native-reference-pcb-result-programs.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_NEXT_WORKER_PROFILES as PROFILES} from "./current-footprint-inverse-native-reference-next-worker-manager-programs.ts";
import type {CurrentFootprintInverseNativeReferenceNextWorkerKind as Kind} from "./current-footprint-inverse-native-reference-next-worker-manager-programs.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";

export {CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_PCB_RESULT_EXPRESSIONS as CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_NEXT_WORKER_RESULT_EXPRESSIONS,CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_PCB_RESULT_POINTS as CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_NEXT_WORKER_RESULT_POINTS} from "./current-footprint-inverse-v4-native-reference-pcb-result-programs.ts";
const counts:Readonly<Partial<Record<keyof typeof BASE,readonly[number,number]>>>=Object.freeze({queued:[1,0],views:[0,1],final:[2,0],roots:[2,1],local:[1,0],incoming:[1,0]});
function named(role:string):role is keyof typeof BASE{return Object.hasOwn(BASE,role);}
function programs(kind:Kind):Readonly<typeof BASE>{const p=PROFILES[kind];const next={...BASE};for(const role of Object.keys(BASE)){if(!named(role)){throw new Error("INVERSE_NATIVE_NEXT_WORKER_RESULT_ROLE");}const source=BASE[role];const count=counts[role]??[0,0];if(source.split("/mgr/projectWorker/pcb/getAllArrData").length!==count[0]+1||source.split("/PrjDB/pcb/getAllArrDatas").length!==count[1]+1){throw new Error("INVERSE_NATIVE_NEXT_WORKER_RESULT_SOURCE_CENSUS");}next[role]=source.replaceAll("/mgr/projectWorker/pcb/getAllArrData",p.topic).replaceAll("/PrjDB/pcb/getAllArrDatas",p.outer);}return freezeDeep(next);}
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_NEXT_WORKER_RESULT_PROGRAMS=freezeDeep({"footprint-derived":programs("footprint-derived"),"device-all":programs("device-all")});
