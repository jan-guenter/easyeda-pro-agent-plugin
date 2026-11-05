/** Closed selectors for the preload La wrapper and ws-service callback. They
 * inspect the original route and fresh scopes without invoking either function. */
import { freezeDeep } from "./sqlite-inventory-core.ts";

const helpers = String.raw`"use strict";const bad=()=>{throw new Error("FOOTPRINT_CLOCK_REGISTRATION_V2_BINDING");},seen=[];
const descriptor=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);seen.push([o,k,d]);return d;};
const own=(o,k)=>{const d=descriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return d.value;};
const absent=(o,k)=>{if(descriptor(o,k)!==undefined||k in o)bad();};
const array=(o,n)=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype||own(o,"length")!==n||Reflect.ownKeys(o).length!==n+1)bad();for(let i=0;i<n;i++)own(o,String(i));};
const verify=()=>{for(const[o,k,d]of seen){const v=Object.getOwnPropertyDescriptor(o,k);if(d===undefined?v!==undefined:!v||Reflect.ownKeys(d).length!==Reflect.ownKeys(v).length||Reflect.ownKeys(d).some(k=>!Object.is(d[k],v[k])))bad();}};
const native=(f,name,arity,text)=>{if(typeof f!=="function"||own(f,"name")!==name||own(f,"length")!==arity||Function.prototype.toString.call(f)!==text)bad();};
const nameGetter=(root,bc,tab)=>{const constructor=own(root,"BroadcastChannel"),prototype=own(constructor,"prototype"),entry=descriptor(prototype,"name");if(Object.getPrototypeOf(bc)!==prototype||descriptor(bc,"name")!==undefined||!entry||Object.hasOwn(entry,"value")||typeof entry.get!=="function"||entry.set!==undefined||entry.enumerable!==true||entry.configurable!==true)bad();const getter=entry.get;native(getter,"get name",0,"function get name() { [native code] }");if(Reflect.apply(getter,bc,[])!=="/"+tab+"/notify")bad();return getter;};
const initial=(route,path,branch,tab)=>{array(route,17);const notification=own(route,"14");array(notification,7);const root=own(notification,"1"),host=own(notification,"2"),project=own(notification,"3"),bus=own(notification,"4");
if(own(root,"gVars")!==host||own(host,"currentProject")!==project||own(project,"projectId")!==path||own(project,"branchUuid")!==branch||own(root,"_TAB_ID_")!==tab||own(host,"concurrentBus")!==bus||own(root,"/"+tab+"/notify")!==bus)bad();
const topic="/pro-mgr/serverTime/now",pulled=own(bus,"pulled"),pushed=own(bus,"pushed"),subscribed=own(bus,"subscribed"),queue=own(pulled,topic);array(queue,1);absent(pushed,topic);absent(subscribed,topic);
const task=own(queue,"0"),wrapper=own(task,"callback"),bc=own(bus,"bc"),getter=nameGetter(root,bc,tab);if(own(task,"isRunning")!==true||own(task,"unsafe")!==true||typeof wrapper!=="function")bad();return[root,host,project,bus,wrapper,queue,task,bc,getter,route];};
const registration=(original,path,branch,tab)=>{array(original,10);const fresh=initial(own(original,"9"),path,branch,tab);for(const i of[0,1,2,3,4,7,8,9])if(own(original,String(i))!==fresh[i])bad();return fresh;};
const bindings=(scope,wrapperScope,first,callback,path,branch,tab)=>{const current=registration(first,path,branch,tab),lexical=own(scope,"object"),rpc=own(wrapperScope,"object");if(own(rpc,"v")!==callback||own(rpc,"y")!=="/pro-mgr/serverTime/now"||own(rpc,"k")!==current[4]||own(lexical,"Ji")!==current[3])bad();
const offset=own(lexical,"Jd");if(typeof offset!=="number"||!Number.isSafeInteger(offset)||Object.is(offset,-0))bad();const date=own(current[0],"Date"),now=own(date,"now");native(date,"Date",7,"function Date() { [native code] }");native(now,"now",0,"function now() { [native code] }");return{values:[callback,current[3],date,now],offset};};`;
export const CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_V2_CALLS = freezeDeep({
  initial: { program: `function(path,branch,tab){${helpers}\nconst result=initial(this,path,branch,tab);verify();return result;}`, arguments: 3, returnByValue: false },
  callback: { program: `function(){${helpers}\nconst callback=own(own(this,"object"),"v");if(typeof callback!=="function")bad();verify();return callback;}`, arguments: 0, returnByValue: false },
  bindings: { program: `function(wrapperScope,first,callback,path,branch,tab){${helpers}\nconst result=bindings(this,wrapperScope,first,callback,path,branch,tab);verify();return result.values;}`, arguments: 6, returnByValue: false },
  sample: { program: `function(wrapperScope,first,callback,original,path,branch,tab){${helpers}\narray(original,4);const result=bindings(this,wrapperScope,first,callback,path,branch,tab);for(let i=0;i<4;i++)if(own(original,String(i))!==result.values[i])bad();verify();return result.offset;}`, arguments: 7, returnByValue: true },
} as const);
export const CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_V2_GROUP = "easyeda-pro-control-footprint-copy-clock-registration-v2";
export const CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_V2_FLAGS = Object.freeze({ objectGroup: CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_V2_GROUP,
  silent: true, generatePreview: false, throwOnSideEffect: true, awaitPromise: false, userGesture: false } as const);
