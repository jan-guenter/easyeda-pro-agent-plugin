/** Distinct fixed direct-DEL operands over immutable scalar-worker algorithms.
 * No reference-origin guard, old mutable ledger or public Call is reused. */
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_NEXT_WORKER_CHANNEL_PROGRAMS as BASE,CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_NEXT_WORKER_CHANNEL_EXPRESSIONS as E} from "./current-footprint-inverse-native-reference-next-worker-channel-programs.ts";
import {replaceCurrentFootprintInverseNativeReferenceNextWorkerSource as replace} from "./current-footprint-inverse-native-reference-next-worker-manager-programs.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";

const next={...BASE["footprint-derived"]};
next.route=replace(next.route,"/mgr/projectWorker/footprint/getKeysBySource","/mgr/projectWorker/footprint/delete",1);
next.route=replace(next.route,'"getKeysBySource"','"delete"',1);
next.inner=replace(next.inner,"/mgr/projectWorker/footprint/getKeysBySource","/mgr/projectWorker/footprint/delete",1);
if(Object.values(next).some(program=>program.includes("getKeysBySource"))){throw new Error("INVERSE_NATIVE_DELETE_CHANNEL_PROGRAM_CENSUS");}
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_EXECUTION_CHANNEL_PROGRAMS=freezeDeep({delete:next});
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_EXECUTION_CHANNEL_EXPRESSIONS=freezeDeep({delete:{deleteData:E["footprint-derived"].getData,inner:E["footprint-derived"].inner,caller:E["footprint-derived"].caller}});
