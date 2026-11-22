/** Descriptor-only receiver recipes. These share immutable syntax with the
 * original lookup algorithms, never their owner, receipt or Call domains. */
import {CURRENT_NATIVE_OWN_DATA_CHECK} from "./current-native-own-data-intrinsics.ts";
import {CURRENT_FOOTPRINT_INVERSE_GET_FORWARDING_PROGRAMS as F} from "./current-footprint-inverse-get-forwarding-programs.ts";
import {CURRENT_FOOTPRINT_INVERSE_GET_MANAGER_PROGRAMS as M} from "./current-footprint-inverse-get-manager-programs.ts";
import {CURRENT_FOOTPRINT_INVERSE_GET_CHANNEL_PROGRAMS as C} from "./current-footprint-inverse-get-channel-programs.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";

const common=`"use strict";${CURRENT_NATIVE_OWN_DATA_CHECK}
const data=(o,k)=>{const d=get(o,k);if(!d||!has(d,"value")||!d.writable||!d.enumerable||!d.configurable)bad();return d.value;};
const guard=f=>{if(typeof f!=="function"||invoke(f,undefined,[])!==true)bad();};`;
const receiverMembers=`function(sender){${common}dense(sender,9);guard(value(sender,"3"));const task=value(sender,"8"),p=proto(task),callback=data(task,"callback");return[p,callback,()=>{guard(value(sender,"3"));if(proto(task)!==p||data(task,"callback")!==callback||data(task,"isRunning")!==true)bad();return true;}];}`;
const receiverAppliers=`function(handler,body,module,asyncPrototype){${common}
dense(handler,2);dense(body,2);dense(module,4);const wrapper=value(handler,"0"),fn=value(body,"0"),applyArgs=value(module,"0");
const check=()=>{guard(value(handler,"1"));guard(value(body,"1"));guard(value(module,"3"));if(proto(wrapper)!==functionProto||proto(fn)!==asyncPrototype||proto(applyArgs)!==functionProto||get(wrapper,"apply")!==undefined||get(fn,"apply")!==undefined||get(applyArgs,"apply")!==undefined||get(functionProto,"apply")===undefined)bad();return true;};check();return[check];}`;
const receiverLookup=`function(wrapper,module){${common}dense(module,4);guard(value(module,"3"));const scope=value(wrapper,"object");const check=()=>{guard(value(module,"3"));if(value(scope,"K")!==value(module,"1")||value(scope,"so")!==value(module,"2"))bad();return true;};check();return[check];}`;
const receiverChannelProof=`function(lineage,roots,classes,module,methods,task,native,channel){${common}
dense(lineage,1);dense(roots,12);dense(classes,4);dense(module,7);dense(methods,22);dense(task,4);dense(native,4);dense(channel,3);
const check=()=>{guard(value(lineage,"0"));guard(value(roots,"11"));guard(value(classes,"3"));guard(value(module,"6"));guard(value(methods,"21"));guard(value(task,"3"));guard(value(native,"3"));guard(value(channel,"2"));return true;};check();return[check];}`;
/** This fresh wrapper is spent before any reproof; it calls only the sender's
 * already prepared one-shot closure after the actual source/registry/channel
 * guards succeed in the same synchronous application attempt. */
const receiverGuard=`function(sender,module,lookup,getData,project,methods,channel,appliers){${common}
dense(sender,9);dense(module,4);dense(lookup,1);dense(getData,3);dense(project,3);dense(methods,22);dense(channel,1);dense(appliers,1);
const check=()=>{guard(value(sender,"3"));guard(value(module,"3"));guard(value(lookup,"0"));guard(value(getData,"2"));guard(value(channel,"0"));guard(value(appliers,"0"));return true;};let attempted=false;
const invokeOnce=()=>{if(attempted)bad();attempted=true;check();return value(sender,"4")();};check();return[invokeOnce,check,value(project,"0"),value(project,"1"),value(methods,"9")];}`;
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_RECEIVER_PROGRAMS=freezeDeep({
 receiverAppliers,receiverMembers,receiverHandler:F.handlerUi,receiverBody:F.handlerBody,receiverModule:F.managerModule,receiverLookup,receiverChannelProof,receiverGuard,
 managerRegistry:M.registry,managerRegistrySelf:M.registrySelf,managerMap:M.registryMap,managerNativeMap:M.nativeMap,managerNativePrototype:M.nativePrototype,managerMethods:M.methods,managerSelected:M.selected,managerProject:M.project,managerFootprint:M.footprint,managerGetData:M.getData,
 channelLineage:C.lineageUi,channelRoots:C.roots,channelParent:C.parent,channelClasses:C.classes,channelModule:C.module,channelMethods:C.methods,channelTaskPrototype:C.taskPrototype,channelTaskMethods:C.taskMethods,channelNativePrototype:C.nativePrototype,channelEventTargetPrototype:C.eventTargetPrototype,channelNativeMembers:C.nativeMembers,channel:C.channel,
}as const);
export type CurrentFootprintInverseNativeDeleteColdUiReceiverRole=keyof typeof CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_RECEIVER_PROGRAMS;
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_RECEIVER_ROLES=[
 "receiverAppliers","receiverMembers","receiverHandler","receiverBody","receiverModule","receiverLookup","receiverChannelProof","receiverGuard",
 "managerRegistry","managerRegistrySelf","managerMap","managerNativeMap","managerNativePrototype","managerMethods","managerSelected","managerProject","managerFootprint","managerGetData",
 "channelLineage","channelRoots","channelParent","channelClasses","channelModule","channelMethods","channelTaskPrototype","channelTaskMethods","channelNativePrototype","channelEventTargetPrototype","channelNativeMembers","channel",
]as const satisfies readonly CurrentFootprintInverseNativeDeleteColdUiReceiverRole[];
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_RECEIVER_SPECS=freezeDeep({
 receiverAppliers:{references:4,target:false,byValue:false},receiverMembers:{references:1,target:false,byValue:false},receiverHandler:{references:2,target:false,byValue:false},receiverBody:{references:2,target:false,byValue:false},receiverModule:{references:2,target:false,byValue:false},receiverLookup:{references:2,target:false,byValue:false},receiverChannelProof:{references:8,target:false,byValue:false},receiverGuard:{references:8,target:false,byValue:false},
 managerRegistry:{references:1,target:false,byValue:false},managerRegistrySelf:{references:2,target:false,byValue:true},managerMap:{references:1,target:false,byValue:false},managerNativeMap:{references:0,target:false,byValue:false},managerNativePrototype:{references:1,target:false,byValue:false},managerMethods:{references:4,target:false,byValue:false},managerSelected:{references:3,target:true,byValue:false},managerProject:{references:1,target:true,byValue:false},managerFootprint:{references:2,target:false,byValue:false},managerGetData:{references:2,target:false,byValue:false},
 channelLineage:{references:6,target:false,byValue:false},channelRoots:{references:7,target:true,byValue:false},channelParent:{references:1,target:false,byValue:false},channelClasses:{references:3,target:false,byValue:false},channelModule:{references:2,target:false,byValue:false},channelMethods:{references:4,target:false,byValue:false},channelTaskPrototype:{references:1,target:false,byValue:false},channelTaskMethods:{references:2,target:false,byValue:false},channelNativePrototype:{references:2,target:false,byValue:false},channelEventTargetPrototype:{references:1,target:false,byValue:false},channelNativeMembers:{references:3,target:false,byValue:false},channel:{references:2,target:true,byValue:false},
}as const);
export function isCurrentFootprintInverseNativeDeleteColdUiReceiverRole(role:string):role is CurrentFootprintInverseNativeDeleteColdUiReceiverRole{return CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_RECEIVER_ROLES.some(value=>value===role);}
