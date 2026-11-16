/** Pure direct-DEL send comparison programs, distinct original custodians.
 * The immutable scalar algorithms are projected by exact literal census only. */
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_NEXT_WORKER_FORWARD_PROGRAMS as BASE,CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_NEXT_WORKER_FORWARD_EXPRESSIONS as E} from "./current-footprint-inverse-native-reference-next-worker-forward-programs.ts";
import {replaceCurrentFootprintInverseNativeReferenceNextWorkerSource as replace} from "./current-footprint-inverse-native-reference-next-worker-manager-programs.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";

const selected={...BASE["footprint-derived"]};
for(const role of ["send-postRoots","send-incoming","send-local"] as const){selected[role]=replace(selected[role],"/mgr/projectWorker/footprint/getKeysBySource","/mgr/projectWorker/footprint/delete",role==="send-local"?2:1);}
if(Object.values(selected).some(program=>program.includes("getKeysBySource"))){throw new Error("INVERSE_NATIVE_DELETE_FORWARD_FIXED_SOURCE");}
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_EXECUTION_FORWARD_PROGRAMS=freezeDeep({delete:selected});
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_EXECUTION_FORWARD_EXPRESSIONS=freezeDeep({delete:E["footprint-derived"]});
