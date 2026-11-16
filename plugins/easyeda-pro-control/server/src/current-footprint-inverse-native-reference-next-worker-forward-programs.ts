/** Shared inert send algorithm, separate original native reference route data. */
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_PCB_FORWARD_PROGRAMS as BASE,CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_PCB_FORWARD_EXPRESSIONS as E} from "./current-footprint-inverse-native-reference-pcb-forward-programs.ts";
import {CURRENT_FOOTPRINT_INVERSE_REFERENCE_SEND_PROGRAMS as SEND} from "./current-footprint-inverse-reference-send-programs.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_NEXT_WORKER_CHANNEL_EXPRESSIONS as LIVE} from "./current-footprint-inverse-native-reference-next-worker-channel-programs.ts";
import type {CurrentFootprintInverseNativeReferenceNextWorkerKind as Kind} from "./current-footprint-inverse-native-reference-next-worker-manager-programs.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";

function programs(kind:Kind):Readonly<typeof BASE>{const selected=SEND[kind];return freezeDeep({...BASE,"send-postRoots":selected.postRoots,"send-incoming":selected.incoming,"send-local":selected.local,"send-message":selected.message});}
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_NEXT_WORKER_FORWARD_PROGRAMS=freezeDeep({"footprint-derived":programs("footprint-derived"),"device-all":programs("device-all")});
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_NEXT_WORKER_FORWARD_EXPRESSIONS=freezeDeep({"footprint-derived":{...E,caller:LIVE["footprint-derived"].caller},"device-all":E});
