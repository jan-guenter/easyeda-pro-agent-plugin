/** Source-owned same-head startup sync. Every response is checked before
 * the original merge/model path. These observers call no app method. */
import { CURRENT_GENERATED_INITIAL_CACHE_PROGRAMS as CACHE } from "./current-generated-initial-cache-programs.ts";
import { CURRENT_GENERATED_INITIAL_SYNC_CALLEES as CALLEES } from "./current-generated-initial-sync-source.ts";

const common = String.raw`"use strict";const bad=()=>{throw new Error("GENERATED_INITIAL_SYNC_ORIGINAL");};
const own=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return d.value;};
const array=(o,n)=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype||own(o,"length")!==n||Reflect.ownKeys(o).length!==n+1)bad();for(let j=0;j<n;j++)own(o,String(j));};
const descriptor=(o,k,v)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value")||d.value!==v||d.writable!==true||d.enumerable!==false||d.configurable!==true)bad();};
const native=(f,name,arity)=>{if(typeof f!=="function"||own(f,"name")!==name||own(f,"length")!==arity||Function.prototype.toString.call(f)!=="function "+name+"() { [native code] }")bad();return f;};
const size=o=>Reflect.apply(native(own(Object.getOwnPropertyDescriptor(Set.prototype,"size"),"get"),"get size",0),o,[]);
const has=(o,v)=>Reflect.apply(native(own(Set.prototype,"has"),"has",1),o,[v]);
const base=original=>{array(original,16);const guard=own(original,"5");if(typeof guard!=="function"||Reflect.apply(guard,undefined,[])!==true)bad();return own(original,"0");};
const same=(frame,original,full,n)=>{array(frame,n);array(full,5);const project=base(original);for(const j of[0,1,2,3,4])if(own(frame,String(j))!==own(full,String(j)))bad();if(own(full,"0")!==project||own(full,"1")!==own(own(original,"2"),"1")||own(full,"2")!==true||typeof own(full,"3")!=="function"||Object.getPrototypeOf(own(full,"4"))!==Promise.prototype)bad();return project;};`;

const capture = `function(module,project,head,caller,key,body){${common}
array(this,2);array(module,6);array(caller,2);if(own(this,"0")!==project||own(module,"0")!==project||own(caller,"0")!==project||own(this,"1")!==own(caller,"1")||typeof own(this,"1")!=="string")bad();
const entry=this,lg=own(module,"1"),gd=own(module,"2"),history=own(project,"historyIndex"),methods=[];
const names=${JSON.stringify(CALLEES.slice(0, 7).map(row => row.name))};
const helpers=[own(module,"3"),own(module,"4"),own(module,"5")];
for(let j=0;j<7;j++){const f=own(gd,names[j]);descriptor(gd,names[j],f);if(typeof f!=="function")bad();methods.push(f);}
for(let j=0;j<3;j++)if(typeof helpers[j]!=="function"||own(module,String(j+3))!==helpers[j])bad();
const retained=[];let nodes=0;const retain=(v,depth)=>{if(v===null||typeof v!=="object")return;if(++nodes>128||depth>7)bad();if(Object.getPrototypeOf(v)!==(Array.isArray(v)?Array.prototype:Object.prototype))bad();for(const k of Reflect.ownKeys(v)){const d=Object.getOwnPropertyDescriptor(v,k);if(!d||!Object.hasOwn(d,"value"))bad();retained.push([v,k,d]);retain(d.value,depth+1);}};retain(history,0);
const promise=Promise,promiseProto=Promise.prototype,set=Set,setProto=Set.prototype,arrayProto=Array.prototype;
const collectionNames=["task3","cachePromise","syncPendingNodeUuids","confirmedEmptyNodeUuids","warnedEmptyNodeUuids"],collections=collectionNames.map(k=>own(project,k));
const guard=()=>{const p=own(module,"0");if(p!==project||own(globalThis,"PROJECT")!==project||Object.getPrototypeOf(project)!==lg||Object.getPrototypeOf(lg)!==gd||own(module,"1")!==lg||own(module,"2")!==gd||own(project,"historyIndex")!==history)bad();
for(const[o,k,d]of retained){const q=Object.getOwnPropertyDescriptor(o,k);if(!q||!Object.hasOwn(q,"value")||!Object.is(q.value,d.value)||q.writable!==d.writable||q.enumerable!==d.enumerable||q.configurable!==d.configurable)bad();}
array(module,6);array(entry,2);array(caller,2);if(own(entry,"0")!==project||own(caller,"0")!==project||own(entry,"1")!==own(caller,"1"))bad();
for(const o of[project,lg])for(const k of[...names,"isV2Format"])if(Object.getOwnPropertyDescriptor(o,k)!==undefined)bad();
for(let j=0;j<7;j++){descriptor(gd,names[j],methods[j]);}
for(let j=0;j<3;j++)if(typeof helpers[j]!=="function"||own(module,String(j+3))!==helpers[j])bad();
const vf=Object.getOwnPropertyDescriptor(gd,"isV2Format");if(!vf||Object.hasOwn(vf,"value")||vf.enumerable!==false||vf.configurable!==true||Function.prototype.toString.call(vf.get)!=="get isV2Format(){return this._isV2Format}"||Function.prototype.toString.call(vf.set)!=="set isV2Format(t){this._isV2Format=t,this._projectDetails&&(this._projectDetails.isV2Format=t)}")bad();
for(const k of["isTemporary","isHistoryBack","_isV2Format","isUploadingCloud"])if(own(project,k)!==false)bad();
if(Promise!==promise||Promise.prototype!==promiseProto||Set!==set||Set.prototype!==setProto||Array.prototype!==arrayProto)bad();native(promise,"Promise",1);native(set,"Set",0);
for(const[k,n]of[["add",1],["delete",1],["has",1],["values",0]])native(own(setProto,k),k,n);
if(own(setProto,Symbol.iterator)!==own(setProto,"values"))bad();native(own(Object.getOwnPropertyDescriptor(setProto,"size"),"get"),"get size",0);
for(const[k,n]of[["then",2],["catch",1],["finally",1]])native(own(promiseProto,k),k,n);
for(const[k,n]of[["some",1],["findIndex",1],["map",1],["filter",1],["values",0]])native(own(arrayProto,k),k,n);
if(own(arrayProto,Symbol.iterator)!==own(arrayProto,"values"))bad();native(own(Array,"from"),"from",1);
for(let j=0;j<collections.length;j++)if(own(project,collectionNames[j])!==collections[j]||Object.getPrototypeOf(collections[j])!==setProto||Reflect.ownKeys(collections[j]).length!==0)bad();
for(const k of["snapshot","snapDocs","snapDocIds"])if(Object.getOwnPropertyDescriptor(Object.prototype,k)!==undefined)bad();
if(Reflect.apply((${CACHE.head}),head,[key,body])!==true||own(head,"2")!==own(project,"cache")||own(head,"7")!==history)bad();array(history,1);if(own(own(history,"0"),"uuid")!==own(entry,"1"))bad();return true;};
guard();if(size(collections[0])!==0||size(collections[2])!==0||size(collections[3])!==0||size(collections[4])!==0)bad();
for(const k of["notSyncCloud","pendingSyncCloud","isSyncing"]){const d=Object.getOwnPropertyDescriptor(project,k);if(d&&(!Object.hasOwn(d,"value")||(d.value!==false&&d.value!==undefined)))bad();}
return[project,module,entry,head,history,guard,...methods,...helpers];}`;

const full = `function(original){${common}const p=base(original);array(this,5);if(own(this,"0")!==p||own(this,"1")!==own(own(original,"2"),"1")||own(this,"2")!==true||typeof own(this,"3")!=="function"||Object.getPrototypeOf(own(this,"4"))!==Promise.prototype||size(own(p,"task3"))!==0||own(p,"notSyncCloud")!==true||own(p,"pendingSyncCloud")!==false)bad();return true;}`;
// Base response fields are compared as own primitive data in original SQL/API
// Order. No key/body/headers are returned and no JSON hook can be invoked.
const history = `function(original,full,ordinal){${common}const p=same(this,original,full,9),index=own(original,"4"),head=own(index,"0"),reply=own(this,"7");if(own(this,"5")!==head||own(this,"6")!==undefined||own(this,"8")!==ordinal||!Number.isInteger(ordinal)||ordinal<1||ordinal>4||own(p,"notSyncCloud")!==true||own(p,"pendingSyncCloud")!==false||size(own(p,"task3"))!==1||!has(own(p,"task3"),own(full,"4")))bad();
if(Object.getPrototypeOf(reply)!==Object.prototype||own(reply,"success")!==true)bad();const result=own(reply,"result");array(result,1);const row=own(result,"0"),keys=["id","uuid","parent","key","is_lock","num","snapshot_num","created_at","updated_at","lock_time","iv","dataStrUrl"];
if(Object.getPrototypeOf(row)!==Object.prototype||Reflect.ownKeys(row).length!==keys.length)bad();for(let j=0;j<keys.length;j++){if(Reflect.ownKeys(row)[j]!==keys[j])bad();const v=own(row,keys[j]);if(v!==null&&!["string","number","boolean"].includes(typeof v))bad();if(!Object.is(v,own(head,keys[j])))bad();}return true;}`;
const merged = `function(original,full,last){${common}const p=same(this,original,full,10);array(last,9);if(own(last,"8")!==4||own(this,"5")!==own(last,"5")||own(this,"6")!==undefined||own(this,"7")!==own(own(last,"7"),"result")||own(this,"8")!==0||own(this,"9")!==false)bad();const result=own(this,"7");array(result,1);const row=own(result,"0"),head=own(own(original,"4"),"0"),keys=["id","uuid","parent","key","is_lock","num","snapshot_num","created_at","updated_at","lock_time","iv","dataStrUrl","docs","editHead","docIds"];if(Object.getPrototypeOf(row)!==Object.prototype||Reflect.ownKeys(row).length!==keys.length)bad();for(let j=0;j<keys.length;j++){const k=keys[j];if(Reflect.ownKeys(row)[j]!==k||!Object.is(own(row,k),own(head,k)))bad();}if(has(own(p,"cachePromise"),own(full,"4"))||size(own(p,"task3"))!==1||!has(own(p,"task3"),own(full,"4")))bad();return true;}`;
const finalizing = `function(original,full){${common}const p=same(this,original,full,5);if(own(p,"notSyncCloud")!==true||own(p,"isSyncing")!==true||own(p,"pendingSyncCloud")!==false||size(own(p,"task3"))!==1||!has(own(p,"task3"),own(full,"4"))||!has(own(p,"cachePromise"),own(full,"4")))bad();for(const k of["syncPendingNodeUuids","confirmedEmptyNodeUuids","warnedEmptyNodeUuids"])if(size(own(p,k))!==0)bad();return true;}`;
const returned = `function(original,full){${common}const p=same(this,original,full,5);if(own(p,"notSyncCloud")!==false||own(p,"isSyncing")!==false||own(p,"pendingSyncCloud")!==false||size(own(p,"task3"))!==0||has(own(p,"cachePromise"),own(full,"4")))bad();for(const k of["syncPendingNodeUuids","confirmedEmptyNodeUuids","warnedEmptyNodeUuids"])if(size(own(p,k))!==0)bad();return true;}`;
const baselineObjects = String.raw`function(){"use strict";const bad=()=>{throw new Error("INITIAL_SYNC_BASELINE_OBJECTS");},objects=[],seen=new Set();const own=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return d.value;};const walk=(o,depth)=>{if(o===null||typeof o!=="object")return;if(depth>7||objects.length>=128||seen.has(o)||Object.getPrototypeOf(o)!==(Array.isArray(o)?Array.prototype:Object.prototype))bad();seen.add(o);objects.push(o);for(const k of Reflect.ownKeys(o))walk(own(o,k),depth+1);};if(!Array.isArray(this)||own(this,"length")!==16)bad();walk(own(this,"4"),0);return objects;}`;
const responseObjects = String.raw`function(){"use strict";const own=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))throw new Error("INITIAL_SYNC_RESPONSE_OBJECTS");return d.value;};if(!Array.isArray(this)||own(this,"length")!==9)throw new Error("INITIAL_SYNC_RESPONSE_OBJECTS");const reply=own(this,"7"),result=own(reply,"result");return[reply,result,own(result,"0")];}`;
export const CURRENT_GENERATED_INITIAL_SYNC_PROGRAMS = Object.freeze({ capture, baselineObjects, responseObjects, full, history, merged, finalizing, returned });
