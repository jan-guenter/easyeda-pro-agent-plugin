/** Inverse-only descriptor capture. It runs on the actual ready frame's lexical
 * tuple and original PROJECT; it invokes no manager, getter, encoder or clock. */
import { freezeDeep } from "./sqlite-inventory-core.ts";

const helpers=String.raw`"use strict";const bad=()=>{throw new Error("FOOTPRINT_INVERSE_DELETE_BINDING");},seen=[],parents=[];
const desc=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);seen.push([o,k,d]);return d;};
const own=(o,k)=>{const d=desc(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return d.value;};
const absent=(o,k)=>{if(desc(o,k)!==undefined)bad();};
const proto=o=>{const p=Object.getPrototypeOf(o);parents.push([o,p]);return p;};
const dense=(o,n)=>{if(!Array.isArray(o)||proto(o)!==Array.prototype||own(o,"length")!==n||Reflect.ownKeys(o).length!==n+1)bad();for(let i=0;i<n;i++)own(o,String(i));};
const plain=o=>{if(o===null||typeof o!=="object"||proto(o)!==Object.prototype)bad();return o;};
const id=(v,re)=>{if(typeof v!=="string"||re.exec(v)?.[0]!==v)bad();return v;};
const integer=v=>{if(typeof v!=="number"||!Number.isSafeInteger(v)||Object.is(v,-0)||v<0||v>=Number.MAX_SAFE_INTEGER)bad();return v;};
const verify=()=>{for(const[o,p]of parents)if(Object.getPrototypeOf(o)!==p)bad();for(const[o,k,d]of seen){const n=Object.getOwnPropertyDescriptor(o,k);if(d===undefined?n!==undefined:!n||d.value!==n.value||d.get!==n.get||d.set!==n.set||d.writable!==n.writable||d.enumerable!==n.enumerable||d.configurable!==n.configurable||Object.hasOwn(d,"value")!==Object.hasOwn(n,"value"))bad();}};`;
const capture=String.raw`
dense(this,18);plain(expected);if(Reflect.ownKeys(expected).length!==4)bad();
const projectUuid=id(own(expected,"projectUuid"),/^[a-f0-9]{64}$/),branchUuid=id(own(expected,"branchUuid"),/^[a-f0-9]{32}$/),targetUuid=id(own(expected,"targetUuid"),/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/),maximumTicket=integer(own(expected,"maximumTicket"));
if(own(globalThis,"PROJECT")!==project||own(project,"uuid")!==projectUuid||own(project,"_branchUuid")!==branchUuid||own(project,"isOpening")!==false||own(project,"isReady")!==true)bad();
const constructors=[];for(let i=0;i<11;i++){const c=own(this,String(i));if(typeof c!=="function")bad();constructors.push(c);}
const chain=(o,names,offset)=>{let p=proto(o);const values=[];for(let i=0;i<names.length;i++){const c=constructors[offset+i];if(own(c,"name")!==names[i]||own(c,"prototype")!==p||own(p,"constructor")!==c||proto(c)!==(i===names.length-1?Function.prototype:constructors[offset+i+1]))bad();values.push(p);p=proto(p);}if(p!==Object.prototype)bad();return values;};
const bus=own(project,"workerBus"),manager=own(project,"footprint"),consistency=own(project,"consistencyManager"),notification=own(project,"wsBus");
if(own(manager,"projectManager")!==project||own(manager,"user")!==undefined)bad();
const footprint=chain(manager,["Tg","ar","Pi"],0),common=chain(consistency,["ja","Vc","zy"],3),projectChain=chain(project,["Lg","Gd"],6);chain(bus,["JP","KP","Mb"],8);chain(notification,["JP","KP","Mb"],8);
const tab=id(own(globalThis,"_TAB_ID_"),/^[A-Za-z0-9_-]{1,128}$/);if(own(globalThis,"/"+tab+"/notify")!==notification)bad();
const client=id(own(manager,"client"),/^[a-f0-9]{16}$/);if(own(consistency,"client")!==client||own(consistency,"maxTicket")!==maximumTicket)bad();
const data=plain(own(manager,"data")),entry=plain(own(data,targetUuid));if(own(entry,"uuid")!==targetUuid)bad();const deleted=desc(entry,"isDelete");if(deleted!==undefined&&(!Object.hasOwn(deleted,"value")||deleted.value!==false&&deleted.value!==undefined))bad();
const method=(o,chain,name,index)=>{absent(o,name);for(let i=0;i<index;i++)absent(chain[i],name);const d=desc(chain[index],name);if(!d||!Object.hasOwn(d,"value")||typeof d.value!=="function"||!d.writable||d.enumerable||!d.configurable)bad();return d.value;};
const getter=name=>{absent(manager,name);absent(footprint[0],name);absent(footprint[1],name);const d=desc(footprint[2],name);if(!d||Object.hasOwn(d,"value")||typeof d.get!=="function"||d.set!==undefined||d.enumerable||!d.configurable)bad();return d.get;};
const methods=[method(manager,footprint,"deleteData",0),method(manager,footprint,"deleteString",0),method(manager,footprint,"verifyKey",0),method(manager,footprint,"isHas",1),method(consistency,common,"getMaxTicket",1),method(consistency,common,"setMaxTicket",1),method(project,projectChain,"uploadLocal",1),getter("maxTicket"),getter("newTicket")];
const qe=own(this,"11"),Ke=own(this,"12"),xt=own(this,"13"),atom=own(this,"14"),separator=own(this,"15"),rl=own(this,"16"),of=own(this,"17");
for(const[f,name]of[[qe,"qe"],[Ke,"Ke"],[xt,"xt"],[atom,"$e"],[rl,"rl"],[of,"of"]])if(typeof f!=="function"||own(f,"name")!==name)bad();
if(separator!=="|\n"||proto(Ke)!==Function.prototype||proto(own(Ke,"prototype"))!==Object.prototype||proto(rl)!==of||proto(of)!==Function.prototype||proto(own(rl,"prototype"))!==own(of,"prototype")||proto(own(of,"prototype"))!==Object.prototype)bad();
const encoder=own(of,"prototype"),encoderMethod=name=>{const d=desc(encoder,name);if(!d||!Object.hasOwn(d,"value")||typeof d.value!=="function"||!d.writable||d.enumerable||!d.configurable)bad();return d.value;};
const functions=[...constructors,Ke,rl,of,...methods,qe,xt,atom,encoderMethod("head"),encoderMethod("delete")];
if(functions.length!==28||new Set(functions).size!==28)bad();verify();
const check=()=>{verify();return true;};
return [functions,[project,bus,manager,consistency,notification,client,maximumTicket,targetUuid,entry],check,{projectUuid,branchUuid,targetUuid,maximumTicket}];`;
const selected=String.raw`dense(this,4);const functions=own(this,"0"),state=own(this,"1"),check=own(this,"2");dense(functions,28);dense(state,9);if(typeof check!=="function"||check()!==true||own(globalThis,"PROJECT")!==own(state,"0"))bad();`;
export const CURRENT_FOOTPRINT_INVERSE_DELETE_BINDING_PROGRAMS=freezeDeep({
 capture:`function(project,expected){${helpers}${capture}}`,
 select:`function(slot){${helpers}${selected}if(!Number.isSafeInteger(slot)||Object.is(slot,-0)||slot<0||slot>=28)bad();const selected=own(functions,String(slot));if(typeof selected!=="function")bad();verify();return selected;}`,
 reprove:`function(){${helpers}${selected}verify();return JSON.stringify({schema:"private.current-footprint-inverse-delete-binding-state.v1",client:own(state,"5"),maximumTicket:own(state,"6"),targetUuid:own(state,"7"),managerUserAbsent:true,originalReceiverAndDescriptorRelationsReproved:true,deleteInvoked:false,clockInvoked:false,executionAuthorized:false});}`,
} as const);
