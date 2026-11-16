/** Fixed original worker-backed native reference joins. Every substitution is
 * checked against its complete immutable predecessor; source data grant no
 * original event, invocation, worker Job or result authority. */
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_PCB_MANAGER_PROGRAMS as BASE,CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_PCB_MANAGER_EXPRESSIONS as E} from "./current-footprint-inverse-native-reference-pcb-manager-programs.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_NEXT_WORKER_KINDS=["footprint-derived","device-all"] as const;
export type CurrentFootprintInverseNativeReferenceNextWorkerKind=typeof CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_NEXT_WORKER_KINDS[number];
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_NEXT_WORKER_PROFILES=freezeDeep({
 "footprint-derived":{group:"footprint",method:"getKeysBySource",topic:"/mgr/projectWorker/footprint/getKeysBySource",outer:"/PrjDB/footprint/getKeysBySource",sourceRole:"managerFootprintKeys",callbackRole:"managerFootprintCallback",argument:true,callbackFn:43_672,callbackEntry:43_695,callbackCall:43_725,methodFn:74_565,methodEntry:74_581,methodCall:74_626},
 "device-all":{group:"device",method:"getAllArrData",topic:"/mgr/projectWorker/device/getAllArrData",outer:"/PrjDB/device/getAllArrDatas",sourceRole:"managerDeviceAll",callbackRole:"managerDeviceCallback",argument:false,callbackFn:46_640,callbackEntry:46_660,callbackCall:46_687,methodFn:67_250,methodEntry:67_265,methodCall:67_310}
} as const);
/** Refuse drift in each exact literal selected for a route projection. */
export function replaceCurrentFootprintInverseNativeReferenceNextWorkerSource(source:string,from:string,to:string,count:number):string{if(source.split(from).length!==count+1){throw new Error("INVERSE_NATIVE_NEXT_WORKER_SOURCE_CENSUS");}return source.replaceAll(from,to);}
function programs(kind:CurrentFootprintInverseNativeReferenceNextWorkerKind):Readonly<typeof BASE>{
 const p=CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_NEXT_WORKER_PROFILES[kind];const next={...BASE};
 for(const role of ["serviceRoots","manager","topicGroup","getData"] as const){const count=role==="serviceRoots"||role==="topicGroup"?2:1;next[role]=replaceCurrentFootprintInverseNativeReferenceNextWorkerSource(next[role],'"pcb"',JSON.stringify(p.group),count);}
 for(const role of ["servicePrototype","serviceMethod","manager","getData"] as const){const counts={servicePrototype:2,serviceMethod:2,manager:2,getData:1};next[role]=replaceCurrentFootprintInverseNativeReferenceNextWorkerSource(next[role],'"getAllArrData"',JSON.stringify(p.method),counts[role]);}
 next.getData=replaceCurrentFootprintInverseNativeReferenceNextWorkerSource(next.getData,"/mgr/projectWorker/pcb/getAllArrData",p.topic,1);
 if(p.argument){
  next.body=replaceCurrentFootprintInverseNativeReferenceNextWorkerSource(next.body,'value(frame,"0")!==value(sender,"4")||value(frame,"1")!==undefined||value(frame,"2")!==undefined','value(frame,"0")!==value(sender,"3")||value(frame,"1")!==value(sender,"4")||value(frame,"2")!==undefined',1);
  next.getData=replaceCurrentFootprintInverseNativeReferenceNextWorkerSource(next.getData,'value(frame,"1")!==undefined||value(frame,"2")!==undefined||value(frame,"3")!==0','value(frame,"1")!==value(sender,"3")||value(frame,"2")!==undefined||value(frame,"3")!==1',1);
 }
 return freezeDeep(next);
}
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_NEXT_WORKER_MANAGER_PROGRAMS=freezeDeep({"footprint-derived":programs("footprint-derived"),"device-all":programs("device-all")});
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_NEXT_WORKER_MANAGER_EXPRESSIONS=freezeDeep({
 "footprint-derived":{...E,body:"[t,s,undefined,pw,K,so,Promise,Array,Function]",getData:"[this,t,undefined,arguments.length,J]"},
 "device-all":E
});
