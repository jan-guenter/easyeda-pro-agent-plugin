/** Same source-owned worker channel algorithms under its own fixed selectors.
 * The genuine cold constructor supplies PROJECT/bus/channel/onmessage; an
 * equivalent packet or manager-side registry never supplies those originals. */
import {CURRENT_NATIVE_OWN_DATA_CHECK} from "./current-native-own-data-intrinsics.ts";
import {CURRENT_FOOTPRINT_INVERSE_GET_CHANNEL_PROGRAMS as C} from "./current-footprint-inverse-get-channel-programs.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";

const common=`"use strict";${CURRENT_NATIVE_OWN_DATA_CHECK}
const data=(o,k)=>{const d=get(o,k);if(!d||!has(d,"value")||!d.writable||!d.enumerable||!d.configurable)bad();return d.value;};
const guard=f=>{if(typeof f!=="function"||invoke(f,undefined,[])!==true)bad();};`;
const workerBinding=`function(project){${common}if(value(root,"PROJECT")!==project)bad();const bus=data(project,"workerBus");return[bus,data(bus,"bc")];}`;
const workerLineage=`function(project,bus){${common}const check=()=>{if(value(root,"PROJECT")!==project||data(project,"workerBus")!==bus)bad();return true;};check();return[check];}`;
const workerRoots=`function(project,bus,channel,target){${common}
const integer=n=>{if(typeof n!=="number"||n<0||n>=9007199254740991||n%1!==0||n===0&&1/n<0)bad();return n;};
if(proto(target)!==objectProto||count(target)!==3||value(root,"PROJECT")!==project||data(project,"workerBus")!==bus||data(project,"uuid")!==value(target,"projectUuid")||data(project,"_branchUuid")!==value(target,"branchUuid")||data(bus,"bc")!==channel)bad();
const p=proto(bus),subscribed=data(bus,"subscribed"),pushed=data(bus,"pushed"),pulled=data(bus,"pulled"),uuid=data(bus,"uuid"),ticket=integer(data(bus,"rpcTicket")),push=integer(data(bus,"pushCnt")),tab=value(root,"_TAB_ID_"),ctor=value(root,"BroadcastChannel");
if(count(bus)!==7||typeof uuid!=="string"||uuid.length!==36||typeof tab!=="string"||tab.length<1||tab.length>128||typeof ctor!=="function")bad();
const check=()=>{if(value(root,"PROJECT")!==project||data(project,"workerBus")!==bus||data(project,"uuid")!==value(target,"projectUuid")||data(project,"_branchUuid")!==value(target,"branchUuid")||data(bus,"bc")!==channel||proto(bus)!==p||count(bus)!==7||data(bus,"subscribed")!==subscribed||data(bus,"pushed")!==pushed||data(bus,"pulled")!==pulled||data(bus,"uuid")!==uuid||integer(data(bus,"rpcTicket"))<0||integer(data(bus,"pushCnt"))<0||value(root,"_TAB_ID_")!==tab||value(root,"BroadcastChannel")!==ctor)bad();return true;};
check();return[bus,p,channel,subscribed,pushed,pulled,uuid,ticket,push,tab,ctor,check];}`;
/** The inner library has distinct worker lexical names even where its method
 * bodies and offsets coincide. Replace only quoted lookup keys, never code
 * tokens, selectors or caller strings. Complete worker source is pinned too. */
const workerModule=C.module.replaceAll('"WR"','"JP"').replaceAll('"VR"','"KP"').replaceAll('"_w"','"Mb"').replaceAll('"Gy"','"Hg"').replaceAll('"bl"','"Ac"').replaceAll('"YR"','"WP"').replaceAll('"yh"','"wu"').replaceAll('"Rf"','"op"').replaceAll('"GR"','"VP"');
const workerNeedMethod=`function(proof){${common}dense(proof,5);guard(value(proof,"4"));const manager=value(proof,"0"),p=proto(manager);if(get(manager,"getNeedData")!==undefined)bad();const d=get(p,"getNeedData");if(!d||!has(d,"value")||!d.writable||d.enumerable||!d.configurable||typeof d.value!=="function")bad();return[d.value];}`;
const workerServiceQueue=`function(roots){${common}dense(roots,12);guard(value(roots,"11"));const pulled=value(roots,"5");if(proto(pulled)!==objectProto)bad();return[data(pulled,"/mgr/projectWorker/footprint/get")];}`;
const workerServiceTask=`function(queue){${common}dense(queue,1);dense(value(queue,"0"),1);return[value(value(queue,"0"),"0")];}`;
const workerServiceMembers=`function(task,prototype){${common}dense(task,1);dense(prototype,2);guard(value(prototype,"1"));const actual=value(task,"0"),p=value(prototype,"0");if(proto(actual)!==p||count(actual)!==3||data(actual,"isRunning")!==true||data(actual,"unsafe")!==true)bad();return[p,data(actual,"callback")];}`;
const workerServiceHandler=`function(wrapper,members){${common}dense(members,2);const scope=value(wrapper,"object");if(value(scope,"e")!=="/mgr/projectWorker/footprint/get"||value(scope,"s")!==value(members,"1"))bad();return[value(scope,"t")];}`;
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_WORKER_PROGRAMS=freezeDeep({
 workerBinding,workerLineage,workerRoots,workerParent:C.parent,workerClasses:C.classes,workerModule,workerMethods:C.methods,workerTaskPrototype:C.taskPrototype,workerTaskMethods:C.taskMethods,
 workerNativePrototype:C.nativePrototype,workerEventTargetPrototype:C.eventTargetPrototype,workerNativeMembers:C.nativeMembers,workerChannel:C.channel,
 workerNeedMethod,workerServiceQueue,workerServiceTask,workerServiceMembers,workerServiceHandler,
}as const);
export type CurrentFootprintInverseNativeDeleteColdUiWorkerCallRole=keyof typeof CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_WORKER_PROGRAMS;
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_WORKER_CALL_ROLES=[
 "workerBinding","workerLineage","workerRoots","workerParent","workerClasses","workerModule","workerMethods","workerTaskPrototype","workerTaskMethods","workerNativePrototype","workerEventTargetPrototype","workerNativeMembers","workerChannel","workerNeedMethod","workerServiceQueue","workerServiceTask","workerServiceMembers","workerServiceHandler",
]as const satisfies readonly CurrentFootprintInverseNativeDeleteColdUiWorkerCallRole[];
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_WORKER_CALL_SPECS=freezeDeep({
 workerBinding:{references:1,target:false,byValue:false},workerLineage:{references:2,target:false,byValue:false},workerRoots:{references:3,target:true,byValue:false},workerParent:{references:1,target:false,byValue:false},workerClasses:{references:3,target:false,byValue:false},workerModule:{references:2,target:false,byValue:false},workerMethods:{references:4,target:false,byValue:false},
 workerTaskPrototype:{references:1,target:false,byValue:false},workerTaskMethods:{references:2,target:false,byValue:false},workerNativePrototype:{references:2,target:false,byValue:false},workerEventTargetPrototype:{references:1,target:false,byValue:false},workerNativeMembers:{references:3,target:false,byValue:false},workerChannel:{references:2,target:true,byValue:false},
 workerNeedMethod:{references:1,target:false,byValue:false},workerServiceQueue:{references:1,target:false,byValue:false},workerServiceTask:{references:1,target:false,byValue:false},workerServiceMembers:{references:2,target:false,byValue:false},workerServiceHandler:{references:2,target:false,byValue:false},
}as const);
export function isCurrentFootprintInverseNativeDeleteColdUiWorkerCallRole(role:string):role is CurrentFootprintInverseNativeDeleteColdUiWorkerCallRole{return CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_WORKER_CALL_ROLES.some(value=>value===role);}
