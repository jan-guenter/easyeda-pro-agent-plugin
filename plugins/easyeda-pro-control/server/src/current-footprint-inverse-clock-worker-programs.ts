/** Descriptor-only binding of the original inverse worker's notification bus.
 * No application method, native channel getter, RPC, clock or delete runs. */
import { CURRENT_FOOTPRINT_INVERSE_CLOCK_WORKER_CALLEES as CALLEES } from "./current-footprint-inverse-clock-worker-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const helpers=String.raw`"use strict";const seen=[],parents=[],bad=()=>{throw new Error("FOOTPRINT_INVERSE_CLOCK_WORKER_BINDING");};
const desc=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);seen.push([o,k,d]);return d;};
const own=(o,k)=>{const d=desc(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return d.value;};
const absent=(o,k)=>{if(desc(o,k)!==undefined)bad();};
const proto=o=>{const p=Object.getPrototypeOf(o);parents.push([o,p]);return p;};
const dense=(o,n)=>{if(!Array.isArray(o)||proto(o)!==Array.prototype||own(o,"length")!==n||Reflect.ownKeys(o).length!==n+1)bad();for(let i=0;i<n;i++)own(o,String(i));};
const plain=o=>{if(o===null||typeof o!=="object"||proto(o)!==Object.prototype)bad();return o;};
const integer=v=>{if(typeof v!=="number"||!Number.isSafeInteger(v)||Object.is(v,-0)||v<0||v>=Number.MAX_SAFE_INTEGER)bad();return v;};
const text=(v,re)=>{if(typeof v!=="string"||re.exec(v)?.[0]!==v)bad();return v;};
const verify=()=>{for(const[o,p]of parents)if(Object.getPrototypeOf(o)!==p)bad();for(const[o,k,d]of seen){const n=Object.getOwnPropertyDescriptor(o,k);if(d===undefined?n!==undefined:!n||d.value!==n.value||d.get!==n.get||d.set!==n.set||d.writable!==n.writable||d.enumerable!==n.enumerable||d.configurable!==n.configurable||Object.hasOwn(d,"value")!==Object.hasOwn(n,"value"))bad();}};`;
const ready=String.raw`dense(original,4);const readyFunctions=own(original,"0"),readyState=own(original,"1"),readyGuard=own(original,"2");dense(readyFunctions,28);dense(readyState,9);if(typeof readyGuard!=="function"||readyGuard()!==true)bad();`;
const prelude=String.raw`dense(this,3);${ready}const bus=own(readyState,"4"),kp=proto(proto(bus)),subscribe=own(kp,"subscribe");if(own(own(readyFunctions,"9"),"prototype")!==kp||typeof subscribe!=="function")bad();for(let i=0;i<3;i++)if(typeof own(this,String(i))!=="function")bad();if(own(this,"2")!==own(readyFunctions,"23"))bad();verify();return[original,this,subscribe,()=>{verify();return true;}];`;
const modules=["wa","oo","qe"];
const capture=String.raw`
${ready}dense(modules,3);dense(prelude,4);const preludeGuard=own(prelude,"3");if(own(prelude,"0")!==original||own(prelude,"1")!==modules||typeof preludeGuard!=="function"||preludeGuard()!==true)bad();const scope=own(this,"object"),classes=Object.create(null);classes.JP=own(readyFunctions,"8");classes.KP=own(readyFunctions,"9");classes.Mb=own(readyFunctions,"10");for(const name of["wu","Hg","Ac","WP"])classes[name]=own(scope,name);
`+modules.map((name,index)=>`classes[${JSON.stringify(name)}]=own(modules,${JSON.stringify(String(index))});`).join("\n")+String.raw`
for(const name of["wu","Mb","KP","JP","Hg","Ac","WP","wa","oo","qe"]){const f=classes[name];if(typeof f!=="function"||own(f,"name")!==name)bad();}if(own(scope,"VP")!=="_MSG_BUS_RPC_"||own(prelude,"2")!==own(own(classes.KP,"prototype"),"subscribe")||classes.qe!==own(readyFunctions,"23"))bad();
const project=own(readyState,"0"),bus=own(readyState,"4"),tab=text(own(globalThis,"_TAB_ID_"),/^[A-Za-z\d_-]{1,128}$/);if(own(globalThis,"PROJECT")!==project||own(project,"wsBus")!==bus||own(globalThis,"/"+tab+"/notify")!==bus)bad();
const prototypes=Object.create(null);`+CALLEES.filter(row=>row.kind==="class").map(row=>`{const c=classes[${JSON.stringify(row.key)}],p=own(c,"prototype");if(proto(c)!==${row.parent===null?"Function.prototype":`classes[${JSON.stringify(row.parent)}]`}||own(p,"constructor")!==c||proto(p)!==${row.parent===null?"Object.prototype":`own(classes[${JSON.stringify(row.parent)}],"prototype")`})bad();prototypes[${JSON.stringify(row.key)}]=p;if(Reflect.ownKeys(p).join("|")!==${JSON.stringify(["constructor",...CALLEES.filter(method=>method.kind==="method"&&method.owner===row.key).map(method=>method.name)].join("|"))})bad();}`).join("\n")+String.raw`
if(proto(bus)!==prototypes.JP)bad();const methods=Object.create(null);`+CALLEES.filter(row=>row.kind==="method").map(row=>`{const p=prototypes[${JSON.stringify(row.owner)}],d=desc(p,${JSON.stringify(row.name)});if(!d||!Object.hasOwn(d,"value")||typeof d.value!=="function"||!d.writable||d.enumerable||!d.configurable)bad();methods[${JSON.stringify(row.key)}]=d.value;${["JP","KP","Mb"].includes(row.owner)?`absent(bus,${JSON.stringify(row.name)});`:""}}`).join("\n")+String.raw`
const uuid=text(own(bus,"uuid"),/^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/),rpcTicket=integer(own(bus,"rpcTicket")),pushCnt=integer(own(bus,"pushCnt"));
for(const name of ["subscribed","pushed","pulled"]){const values=plain(own(bus,name));absent(values,"/pro-mgr/serverTime/now");if(Reflect.ownKeys(values).some(k=>typeof k!=="string"||k.startsWith("_MSG_BUS_RPC_-/pro-mgr/serverTime/now-")))bad();}
const functions=[`+CALLEES.map(row=>row.kind==="method"?`methods[${JSON.stringify(row.key)}]`:`classes[${JSON.stringify(row.key)}]`).join(",")+String.raw`];if(new Set(functions).size!==functions.length)bad();verify();
return [original,modules,functions,bus,tab,uuid,rpcTicket,pushCnt,()=>{verify();return true;}];`;
const selected=String.raw`dense(clock,9);const original=own(clock,"0"),modules=own(clock,"1"),functions=own(clock,"2"),bus=own(clock,"3"),guard=own(clock,"8");dense(original,4);dense(modules,3);dense(functions,34);if(typeof guard!=="function"||guard()!==true||own(own(original,"1"),"4")!==bus)bad();const readyGuard=own(original,"2");if(typeof readyGuard!=="function"||readyGuard()!==true)bad();const scope=own(this,"object");`+["wu","Hg","Ac","WP"].map(name=>`if(own(scope,${JSON.stringify(name)})!==own(functions,${JSON.stringify(String(CALLEES.findIndex(row=>row.key===name)))}))bad();`).join("\n")+String.raw`if(own(scope,"VP")!=="_MSG_BUS_RPC_")bad();`;
export const CURRENT_FOOTPRINT_INVERSE_CLOCK_WORKER_PROGRAMS=freezeDeep({
 prelude:`function(original){${helpers}${prelude}}`,
 capture:`function(original,modules,prelude){${helpers}${capture}}`,
 reprove:`function(clock){${helpers}${selected}verify();return true;}`,
} as const);
