/** Fixed diagnostic messages, never application RPCs. Native Worker.postMessage
 * uses the Worker's hidden outside port (HTML workers). The receiver is installed
 * before imports, consumes only its trusted nonce event, and removes itself.
 * Parent remains held before Hn/bridge/openProject until this proof completes.
 * https://html.spec.whatwg.org/multipage/workers.html#dom-worker-postmessage
 * https://dom.spec.whatwg.org/#dom-event-stopimmediatepropagation */
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_COPY_PARENT_WORKER_GROUP = "easyeda-footprint-parent-worker-peer-v1";
export const CURRENT_FOOTPRINT_COPY_PARENT_WORKER_MARKER = "easyeda-private-footprint-worker-peer-v1";
const prelude = String.raw`"use strict";const bad=()=>{throw new Error("FOOTPRINT_COPY_PARENT_WORKER_PROBE");};
const own=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return d.value;};
const getter=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d||Object.hasOwn(d,"value")||typeof d.get!=="function"||d.set!==undefined)bad();return d.get;};
const native=(f,n,l)=>{if(typeof f!=="function"||own(f,"name")!==n||own(f,"length")!==l||Function.prototype.toString.call(f)!=="function "+n+"() { [native code] }")bad();return f;};
const nonce=(v)=>{if(typeof v!=="string"||!/^[a-f0-9]{64}$/.test(v))bad();return v;};
const array=(a,n)=>{if(!Array.isArray(a)||Object.getPrototypeOf(a)!==Array.prototype||own(a,"length")!==n||Reflect.ownKeys(a).length!==n+1)bad();for(let i=0;i<n;i++)own(a,String(i));};`;
const parent = String.raw`const parent=(bundle)=>{array(bundle,4);const project=own(bundle,"0"),worker=own(bundle,"1"),post=own(bundle,"2"),state=own(bundle,"3"),prototype=own(own(globalThis,"Worker"),"prototype");
if(own(project,"worker")!==worker||Object.getPrototypeOf(worker)!==prototype||Object.getOwnPropertyDescriptor(worker,"postMessage")!==undefined||own(prototype,"postMessage")!==post)bad();native(post,"postMessage",1);return state;};`;
const child = String.raw`const child=(bundle)=>{array(bundle,8);if(own(bundle,"0")!==globalThis)bad();const target=own(own(globalThis,"EventTarget"),"prototype"),event=own(own(globalThis,"Event"),"prototype"),message=own(own(globalThis,"MessageEvent"),"prototype");
const actual=[own(target,"addEventListener"),own(target,"removeEventListener"),own(event,"stopImmediatePropagation"),getter(message,"data"),getter(event,"type"),getter(event,"currentTarget")];
const names=["addEventListener","removeEventListener","stopImmediatePropagation","get data","get type","get currentTarget"],lengths=[2,2,0,0,0,0];for(let i=0;i<actual.length;i++)if(native(actual[i],names[i],lengths[i])!==own(bundle,String(i+1)))bad();return own(bundle,"7");};`;

export const CURRENT_FOOTPRINT_COPY_PARENT_WORKER_PROGRAMS = freezeDeep({
  parentSelect: `function(){${prelude}${parent}
const prototype=own(own(globalThis,"Worker"),"prototype"),worker=own(this,"worker"),post=own(prototype,"postMessage");
const result=[this,worker,post,{sent:false}];parent(result);return result;}`,
  parentSend: `function(value){${prelude}${parent}
nonce(value);const state=parent(this);if(own(state,"sent")!==false)bad();state.sent=true;state.nonce=value;
Reflect.apply(own(this,"2"),own(this,"1"),[{marker:"${CURRENT_FOOTPRINT_COPY_PARENT_WORKER_MARKER}",nonce:value}]);return true;}`,
  parentRecheck: `function(value){${prelude}${parent}
nonce(value);const state=parent(this);if(own(state,"sent")!==true||own(state,"nonce")!==value)bad();return true;}`,
  managerJoin: `function(route,value){${prelude}${parent}
nonce(value);const state=parent(this);array(route,11);if(own(state,"sent")!==true||own(state,"nonce")!==value||own(route,"2")!==own(this,"0")||own(route,"5")!==own(this,"1"))bad();return true;}`,
  childSelect: `function(){${prelude}${child}
const target=own(own(globalThis,"EventTarget"),"prototype"),event=own(own(globalThis,"Event"),"prototype"),message=own(own(globalThis,"MessageEvent"),"prototype");
const result=[globalThis,own(target,"addEventListener"),own(target,"removeEventListener"),own(event,"stopImmediatePropagation"),getter(message,"data"),getter(event,"type"),getter(event,"currentTarget"),{attempted:false,installed:false,received:false,removed:false,disposed:false}];child(result);return result;}`,
  childInstall: `function(value){${prelude}${child}
nonce(value);const bundle=this,state=child(bundle);if(own(state,"attempted")!==false)bad();state.attempted=true;state.nonce=value;
state.promise=new Promise(resolve=>{state.resolve=resolve;});
const listener=event=>{const data=Reflect.apply(own(bundle,"4"),event,[]);if(data===null||typeof data!=="object"||Object.getPrototypeOf(data)!==Object.prototype||Reflect.ownKeys(data).length!==2)return;
const marker=Object.getOwnPropertyDescriptor(data,"marker"),candidate=Object.getOwnPropertyDescriptor(data,"nonce");
if(!marker||!candidate||!Object.hasOwn(marker,"value")||!Object.hasOwn(candidate,"value")||marker.value!=="${CURRENT_FOOTPRINT_COPY_PARENT_WORKER_MARKER}"||candidate.value!==value)return;
Reflect.apply(own(bundle,"3"),event,[]);
if(event.isTrusted!==true||Reflect.apply(own(bundle,"5"),event,[])!=="message"||Reflect.apply(own(bundle,"6"),event,[])!==globalThis||state.received||state.disposed)bad();state.received=true;
Reflect.apply(own(bundle,"2"),globalThis,["message",listener,true]);state.installed=false;state.removed=true;
state.resolve({profile:"private.current-footprint-worker-peer-receipt.v1",nonce:value,trusted:true,removed:true});};
state.listener=listener;state.installed=true;Reflect.apply(own(bundle,"1"),globalThis,["message",listener,true]);return true;}`,
  childReceipt: `function(value){${prelude}${child}
nonce(value);const state=child(this);if(own(state,"attempted")!==true||own(state,"nonce")!==value||own(state,"disposed")!==false)bad();return own(state,"promise");}`,
  childRecheck: `function(value){${prelude}${child}
nonce(value);const state=child(this);if(own(state,"nonce")!==value||own(state,"received")!==true||own(state,"removed")!==true||own(state,"installed")!==false||own(state,"disposed")!==true)bad();return true;}`,
  childDispose: `function(value){${prelude}${child}
nonce(value);const state=child(this);if(own(state,"nonce")!==value||own(state,"disposed")!==false)bad();state.disposed=true;
if(own(state,"installed")){Reflect.apply(own(this,"2"),globalThis,["message",own(state,"listener"),true]);state.installed=false;state.removed=true;}
if(!own(state,"received"))own(state,"resolve")({profile:"private.current-footprint-worker-peer-cancelled.v1",nonce:value});
return {received:own(state,"received"),removed:own(state,"removed"),installed:own(state,"installed")};}`,
} as const);
