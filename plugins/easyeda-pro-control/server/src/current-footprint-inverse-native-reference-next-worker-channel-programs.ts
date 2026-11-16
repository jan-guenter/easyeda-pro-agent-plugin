/** Immutable kind-specific channel operands; original public/PCB ledgers stay separate. */
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_PCB_CHANNEL_PROGRAMS as BASE,CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_PCB_CHANNEL_EXPRESSIONS as E} from "./current-footprint-inverse-native-reference-pcb-channel-programs.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_NEXT_WORKER_PROFILES as PROFILES,replaceCurrentFootprintInverseNativeReferenceNextWorkerSource as replace} from "./current-footprint-inverse-native-reference-next-worker-manager-programs.ts";
import type {CurrentFootprintInverseNativeReferenceNextWorkerKind as Kind} from "./current-footprint-inverse-native-reference-next-worker-manager-programs.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";

function programs(kind:Kind):Readonly<typeof BASE>{const p=PROFILES[kind];const next={...BASE};
 next["channel-roots"]=replace(next["channel-roots"],'data(projectObject,"pcb")',`data(projectObject,${JSON.stringify(p.group)})`,1);
 next.route=replace(next.route,'"/mgr/projectWorker/pcb/getAllArrData"',JSON.stringify(p.topic),1);next.route=replace(next.route,'"pcb"',JSON.stringify(p.group),1);next.route=replace(next.route,'"getAllArrData"',JSON.stringify(p.method),1);
 next.inner=replace(next.inner,'"/mgr/projectWorker/pcb/getAllArrData"',JSON.stringify(p.topic),1);
 if(p.argument){
  next.before=replace(next.before,'value(frame,"1")!==undefined||value(frame,"2")!==undefined||value(frame,"3")!==0','value(frame,"1")!==value(sender,"3")||value(frame,"2")!==undefined||value(frame,"3")!==1',1);
  next.inner=replace(next.inner,'value(frame,"2")!==undefined||value(caller,"1")!==undefined||value(caller,"2")!==undefined||value(caller,"3")!==0','value(frame,"2")!==value(target,"documentUuid")||value(caller,"1")!==value(target,"documentUuid")||value(caller,"2")!==undefined||value(caller,"3")!==1',1);
 }return freezeDeep(next);}
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_NEXT_WORKER_CHANNEL_PROGRAMS=freezeDeep({"footprint-derived":programs("footprint-derived"),"device-all":programs("device-all")});
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_NEXT_WORKER_CHANNEL_EXPRESSIONS=freezeDeep({"footprint-derived":{...E,getData:"[this,t,undefined,arguments.length,J]",caller:"[this,t,undefined,arguments.length,J]"},"device-all":E});
