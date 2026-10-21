/** Original subscribed Sfe owner, not the uncaptured top-level Zec binding.
 * BoundThis/TargetFunction/BoundArgs come only from original inspector replies.
 * No bound function, target method or constructor is called. */
import { CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION } from "./current-pcb-diagnostic-model-program.ts";

export const CURRENT_PCB_TEARDROP_TOPICS = Object.freeze([
  "isMoveSwitch", "SetSuspend", "cheakTearDrop", "addModifyTeardrop", "flushTearDrop", "refreshTearDrop",
] as const);
export const CURRENT_PCB_TEARDROP_METHODS = Object.freeze([
  "isMoveSwitch", "setSuspend", "addModify", "addMaodifyTeardrop", "flushService", "refreshService",
] as const);
const GUARDS = `"use strict";
let stage="callback",topic=null,reason="unexpected";
const bad=r=>{reason=r;throw new Error("PCB_TEARDROP_OWNER");};
const held=[],descriptors=[],prototypes=[];
const own=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad("object");const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad("own");held.push([o,k,d.value]);return d.value;};
const object=o=>{if(o===null||typeof o!=="object"||Array.isArray(o))bad("object");return o;};
const proto=o=>{const p=Object.getPrototypeOf(o);prototypes.push([o,p]);return p;};
const named=(o,n)=>{object(o);const p=proto(o),c=own(p,"constructor");if(typeof c!=="function"||own(c,"name")!==n||own(c,"prototype")!==p)bad("instance");return o;};
const tuple=(v,n)=>{if(!Array.isArray(v)||proto(v)!==Array.prototype||own(v,"length")!==n)bad("count");const keys=Reflect.ownKeys(v);if(keys.length!==n+1||keys[n]!=="length")bad("count");for(let i=0;i<n;i++)if(keys[i]!==String(i))bad("count");return v;};
const topics=${JSON.stringify(CURRENT_PCB_TEARDROP_TOPICS)},names=${JSON.stringify(CURRENT_PCB_TEARDROP_METHODS)};
const select=()=>{stage="registry";const bridge=named(own(globalThis,"MSG_BUS_PCB"),"HJ"),bus=named(own(bridge,"messageBus"),"Oet"),registry=object(own(bus,"subscribed"));const p=proto(registry);if(p!==Object.prototype&&p!==null)bad("prototype");const selected=[];for(let i=0;i<6;i++){topic=topics[i];const tasks=tuple(own(registry,topic),1),task=named(own(tasks,"0"),"Z1e"),callback=own(task,"callback");if(own(task,"isRunning")!==true||typeof callback!=="function")bad("callback");selected.push(callback);}topic=null;return selected;};
const target=(owner,name)=>{if(Object.getOwnPropertyDescriptor(owner,name)!==undefined)bad("shadow");descriptors.push([owner,name]);const p=proto(owner),d=Object.getOwnPropertyDescriptor(p,name);if(!d||!Object.hasOwn(d,"value")||typeof d.value!=="function"||!d.writable||!d.configurable||d.enumerable)bad("target");descriptors.push([p,name,d]);return d.value;};
const verify=()=>{for(const [o,k,v]of held){const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value")||!Object.is(d.value,v))bad("own");}for(const [o,p]of prototypes)if(Object.getPrototypeOf(o)!==p)bad("prototype");for(const [o,k,d]of descriptors){const now=Object.getOwnPropertyDescriptor(o,k);if(!d){if(now!==undefined)bad("shadow");}else if(!now||!Object.hasOwn(now,"value")||now.value!==d.value||now.writable!==d.writable||now.configurable!==d.configurable||now.enumerable!==d.enumerable)bad("target");}};
`;
const FAILURE = `catch{return JSON.stringify({schema:"easyeda-pro-control.pcb-teardrop-owner-failure.v1",stage,topic,reason});}`;
export const CURRENT_PCB_TEARDROP_CALLBACK_SELECTOR = `function(originalCallback){${GUARDS}try{
if((${CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION})!==originalCallback)bad("callback");
const selected=select();stage="reproof";verify();if((${CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION})!==originalCallback)bad("callback");return selected;
}${FAILURE}}`;

export const CURRENT_PCB_TEARDROP_OWNER_ASSOCIATION = `function(originalCallback,callbacks,receiver0,receiver1,receiver2,receiver3,receiver4,receiver5,target0,target1,target2,target3,target4,target5){${GUARDS}try{
if((${CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION})!==originalCallback)bad("callback");
stage="tuple";tuple(callbacks,6);const selected=select(),receivers=[receiver0,receiver1,receiver2,receiver3,receiver4,receiver5],targets=[target0,target1,target2,target3,target4,target5];
stage="receiver";const owner=named(receiver0,"Sfe");if(proto(proto(owner))!==Object.prototype)bad("prototype");
for(let i=0;i<6;i++){topic=topics[i];stage="receiver";if(receivers[i]!==owner)bad("receiver");stage="target";if(own(callbacks,String(i))!==selected[i])bad("callback");if(target(owner,names[i])!==targets[i])bad("target");}
topic=null;stage="reproof";verify();if((${CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION})!==originalCallback)bad("callback");return [owner,callbacks,targets];
}${FAILURE}}`;

/** Leaf-local reproof. Requires own/object/bad and a retained teardropProof.
 * No lexical Zec/Sfe lookup is attempted. The original six immutable bound
 * function slots were qualified before this tuple was returned. */
export const CURRENT_PCB_TEARDROP_OWNER_FRAGMENT = `
const tearsHeld=[],tearsPrototypes=[],tearsDescriptors=[],tearsTopics=${JSON.stringify(CURRENT_PCB_TEARDROP_TOPICS)},tearsMethods=${JSON.stringify(CURRENT_PCB_TEARDROP_METHODS)};
const tearsOwn=(o,k)=>{const v=own(o,k);tearsHeld.push([o,k,v]);return v;};
const tearsProto=o=>{const p=Object.getPrototypeOf(o);tearsPrototypes.push([o,p]);return p;};
const tearsArray=(v,n)=>{if(!Array.isArray(v)||tearsProto(v)!==Array.prototype||tearsOwn(v,"length")!==n)bad("count");const k=Reflect.ownKeys(v);if(k.length!==n+1||k[n]!=="length")bad("count");for(let i=0;i<n;i++)if(k[i]!==String(i))bad("count");return v;};
const tearsNamed=(o,n)=>{object(o);const p=tearsProto(o),c=tearsOwn(p,"constructor");if(typeof c!=="function"||tearsOwn(c,"name")!==n||tearsOwn(c,"prototype")!==p)bad("instance");return o;};
tearsArray(teardropProof,3);const teardropOwner=tearsNamed(tearsOwn(teardropProof,"0"),"Sfe"),tearsCallbacks=tearsArray(tearsOwn(teardropProof,"1"),6),tearsTargets=tearsArray(tearsOwn(teardropProof,"2"),6);
const tearsPrototype=tearsProto(teardropOwner);if(tearsProto(tearsPrototype)!==Object.prototype)bad("prototype");
const tearsBridge=tearsNamed(tearsOwn(globalThis,"MSG_BUS_PCB"),"HJ"),tearsBus=tearsNamed(tearsOwn(tearsBridge,"messageBus"),"Oet"),tearsRegistry=object(tearsOwn(tearsBus,"subscribed"));
const tearsRegistryPrototype=tearsProto(tearsRegistry);if(tearsRegistryPrototype!==Object.prototype&&tearsRegistryPrototype!==null)bad("prototype");
for(let i=0;i<6;i++){const tasks=tearsArray(tearsOwn(tearsRegistry,tearsTopics[i]),1),task=tearsNamed(tearsOwn(tasks,"0"),"Z1e"),callback=tearsOwn(task,"callback"),method=tearsMethods[i];if(tearsOwn(task,"isRunning")!==true||typeof callback!=="function"||tearsOwn(tearsCallbacks,String(i))!==callback)bad("callback");if(Object.getOwnPropertyDescriptor(teardropOwner,method)!==undefined)bad("shadow");const d=Object.getOwnPropertyDescriptor(tearsPrototype,method);if(!d||!Object.hasOwn(d,"value")||!d.writable||!d.configurable||d.enumerable||typeof d.value!=="function"||tearsOwn(tearsTargets,String(i))!==d.value)bad("target");tearsDescriptors.push([method,d]);}
const verifyTeardropOwner=()=>{for(const [o,k,v]of tearsHeld){const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value")||!Object.is(d.value,v))bad("own");}for(const [o,p]of tearsPrototypes)if(Object.getPrototypeOf(o)!==p)bad("prototype");for(const [k,d]of tearsDescriptors){if(Object.getOwnPropertyDescriptor(teardropOwner,k)!==undefined)bad("shadow");const n=Object.getOwnPropertyDescriptor(tearsPrototype,k);if(!n||!Object.hasOwn(n,"value")||n.value!==d.value||n.writable!==d.writable||n.configurable!==d.configurable||n.enumerable!==d.enumerable)bad("target");}};
`;
