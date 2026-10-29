/** Dormant fixed manager-delete vocabulary. It does not issue native ownership,
 * dependency eligibility, a clock collector, an inverse permit or a writer. */
import { freezeDeep } from "./sqlite-inventory-core.ts";

const helpers = String.raw`"use strict";
const bad=()=>{throw new Error("FOOTPRINT_DELETE_TRIGGER_BINDING");},descriptors=[],prototypes=[];
const object=o=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();return o;};
const descriptor=(o,k)=>{object(o);const d=Object.getOwnPropertyDescriptor(o,k);descriptors.push([o,k,d]);return d;};
const own=(o,k)=>{const d=descriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return d.value;};
const absent=(o,k)=>{if(descriptor(o,k)!==undefined)bad();};
const proto=o=>{object(o);const p=Object.getPrototypeOf(o);prototypes.push([o,p]);return p;};
const array=(o,n)=>{if(!Array.isArray(o)||proto(o)!==Array.prototype||own(o,"length")!==n||Reflect.ownKeys(o).length!==n+1)bad();for(let i=0;i<n;i++)if(typeof own(o,String(i))!=="function")bad();};
const chain=(o,names,original,offset)=>{const result=[];let p=proto(o);for(let i=0;i<names.length;i++){const c=own(p,"constructor");if(typeof c!=="function"||own(c,"name")!==names[i]||own(c,"prototype")!==p||original!==null&&own(original,String(offset+i))!==c)bad();result.push(p);p=proto(p);}if(p!==Object.prototype)bad();return result;};
const method=(o,parents,k,index)=>{absent(o,k);for(let i=0;i<index;i++)absent(parents[i],k);const d=descriptor(parents[index],k);if(!d||!Object.hasOwn(d,"value")||typeof d.value!=="function"||d.writable!==true||d.enumerable!==false||d.configurable!==true)bad();return d.value;};
const getter=(o,parents,k)=>{absent(o,k);absent(parents[0],k);absent(parents[1],k);const d=descriptor(parents[2],k);if(!d||typeof d.get!=="function"||d.set!==undefined||Object.hasOwn(d,"value")||d.enumerable!==false||d.configurable!==true)bad();return d.get;};
const verify=()=>{for(const[o,p]of prototypes)if(Object.getPrototypeOf(o)!==p)bad();for(const[o,k,d]of descriptors){const n=Object.getOwnPropertyDescriptor(o,k);if(d===undefined?n!==undefined:!n||d.enumerable!==n.enumerable||d.configurable!==n.configurable||d.writable!==n.writable||d.get!==n.get||d.set!==n.set||!Object.is(d.value,n.value)||Object.hasOwn(d,"value")!==Object.hasOwn(n,"value"))bad();}};
if(own(globalThis,"PROJECT")!==this||own(this,"workerBus")!==bus||own(this,"footprint")!==manager||own(this,"consistencyManager")!==consistency||own(manager,"projectManager")!==this||own(manager,"user")!==undefined)bad();
array(constructors,11);
const footprint=chain(manager,["Tg","ar","Pi"],constructors,0),common=chain(consistency,["ja","Vc","zy"],constructors,3),project=chain(this,["Lg","Gd"],constructors,6);
chain(bus,["JP","KP","Mb"],constructors,8);
const selected=[method(manager,footprint,"deleteData",0),method(manager,footprint,"deleteString",0),method(manager,footprint,"verifyKey",0),method(manager,footprint,"isHas",1),method(consistency,common,"getMaxTicket",1),method(consistency,common,"setMaxTicket",1),method(this,project,"uploadLocal",1),getter(manager,footprint,"maxTicket"),getter(manager,footprint,"newTicket")];`;

const eligibility = String.raw`
array(methods,9);for(let i=0;i<9;i++)if(own(methods,String(i))!==selected[i])bad();
const identifier=(v,re)=>{const m=typeof v==="string"?re.exec(v):null;if(m===null||m[0]!==v)bad();return v;};
if(expected===null||typeof expected!=="object"||proto(expected)!==Object.prototype||Reflect.ownKeys(expected).length!==5)bad();
const projectUuid=identifier(own(expected,"projectUuid"),/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/),branchUuid=identifier(own(expected,"branchUuid"),/^[a-f0-9]{32}$/),targetUuid=identifier(own(expected,"targetUuid"),/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/),client=identifier(own(expected,"client"),/^[a-f0-9]{16}$/),maximumTicket=own(expected,"maximumTicket");
if(own(this,"uuid")!==projectUuid||own(this,"_branchUuid")!==branchUuid||own(manager,"client")!==client||own(consistency,"client")!==client||typeof maximumTicket!=="number"||!Number.isSafeInteger(maximumTicket)||Object.is(maximumTicket,-0)||maximumTicket<0||maximumTicket>=Number.MAX_SAFE_INTEGER)bad();
const currentTicket=Object.getOwnPropertyDescriptor(consistency,"maxTicket");if(!currentTicket||!Object.hasOwn(currentTicket,"value")||currentTicket.value!==maximumTicket)bad();
const data=own(manager,"data");if(proto(data)!==Object.prototype)bad();const entry=own(data,targetUuid);if(proto(entry)!==Object.prototype||own(entry,"uuid")!==targetUuid)bad();
const deletion=Object.getOwnPropertyDescriptor(entry,"isDelete");if(deletion!==undefined&&(!Object.hasOwn(deletion,"value")||deletion.value!==false&&deletion.value!==undefined))bad();
verify();`;

export const CURRENT_FOOTPRINT_DELETE_TRIGGER_GROUP = "easyeda-footprint-delete-trigger-v1";
export const CURRENT_FOOTPRINT_DELETE_TRIGGER_PROGRAMS = freezeDeep({
  capture: { program: `function(bus,manager,consistency,constructors){${helpers}\nverify();return selected;}`, arguments: 4, returnByValue: false, throwOnSideEffect: true, awaitPromise: false },
  preflight: { program: `function(bus,manager,consistency,constructors,methods,expected){${helpers}${eligibility}
return JSON.stringify({projectUuid,branchUuid,targetUuid,client,maximumTicket,ownLiveFootprintPresent:true,managerUserAbsent:true,dependencyEligibilityVerified:false,executionAuthorized:false});}`,
    arguments: 6, returnByValue: true, throwOnSideEffect: true, awaitPromise: false },
  invoke: { program: `async function(bus,manager,consistency,constructors,methods,expected){${helpers}${eligibility}
const result=await selected[0].call(manager,targetUuid);verify();
if(result===null||typeof result!=="object"||Object.getPrototypeOf(result)!==Object.prototype||Reflect.ownKeys(result).length!==1)bad();
const success=Object.getOwnPropertyDescriptor(result,"success");if(!success||!Object.hasOwn(success,"value")||success.value!==true||!success.enumerable)bad();
return JSON.stringify({success:true});}`,
    arguments: 6, returnByValue: true, throwOnSideEffect: false, awaitPromise: true },
} as const);
