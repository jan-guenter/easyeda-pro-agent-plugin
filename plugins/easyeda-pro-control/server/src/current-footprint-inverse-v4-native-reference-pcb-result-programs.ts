/** Exact fixed route projection over immutable native result syntax.
 * Shared program data confer no old result or ledger authority. */
import { createHash } from "node:crypto";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_TASK_RESULT_PROGRAMS as OLD } from "./current-footprint-inverse-v4-native-get-task-result-programs.ts";

export { CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_TASK_RESULT_EXPRESSIONS as CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_PCB_RESULT_EXPRESSIONS, CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_TASK_RESULT_POINTS as CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_PCB_RESULT_POINTS } from "./current-footprint-inverse-v4-native-get-task-result-programs.ts";
const counts: Readonly<Partial<Record<keyof typeof OLD, readonly [number,number]>>> = Object.freeze({queued:[1,0],views:[0,1],final:[2,0],roots:[2,1],local:[1,0],incoming:[1,0]});
if(createHash("sha256").update(JSON.stringify(Object.entries(OLD))).digest("hex")!=="f0eaeea274ab5b451a67c5246e578871cd80f9034b9a35d671ba9a1fbfa60916"){throw new Error("INVERSE_NATIVE_REFERENCE_RESULT_SOURCE");}
const next={...OLD};
function named(value:string):value is keyof typeof OLD{return Object.hasOwn(OLD,value);}
for(const [role,source] of Object.entries(OLD)){
 if(!named(role)){throw new Error("INVERSE_NATIVE_REFERENCE_RESULT_ROLE");}const census=counts[role]??[0,0];
 if(source.split("/mgr/projectWorker/footprint/get").length!==census[0]+1||source.split("/PrjDB/footprint/getData").length!==census[1]+1){throw new Error("INVERSE_NATIVE_REFERENCE_RESULT_CENSUS");}
 next[role]=source.replaceAll("/mgr/projectWorker/footprint/get","/mgr/projectWorker/pcb/getAllArrData").replaceAll("/PrjDB/footprint/getData","/PrjDB/pcb/getAllArrDatas");
}
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_PCB_RESULT_PROGRAMS=Object.freeze(next);
