/** Unmounted original-main construction selectors. The source-qualified original
 * registration call frame issues the input; copied JSON supplies no ownership.
 * No callback, clock, SQL accessor, registration method or initializer executes. */
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_GROUP = "easyeda-footprint-main-backend-construction-v1";
export const CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_EXPRESSION = "[u,e,t,xC,L3,y,Date,Date.now,rl]";
const helpers = String.raw`"use strict";const bad=()=>{throw new Error("FOOTPRINT_MAIN_BACKEND_BINDING");},seen=[];
const descriptor=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);seen.push([o,k,d]);return d;};
const own=(o,k)=>{const d=descriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return d.value;};
const array=(o,n)=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype||own(o,"length")!==n||Reflect.ownKeys(o).length!==n+1)bad();for(let i=0;i<n;i++)own(o,String(i));};
const fn=(f,name,arity)=>{if(typeof f!=="function"||own(f,"name")!==name||own(f,"length")!==arity)bad();};
const verify=()=>{for(const[o,k,d]of seen){const v=Object.getOwnPropertyDescriptor(o,k);if(d===undefined?v!==undefined:!v||Reflect.ownKeys(d).length!==Reflect.ownKeys(v).length||Reflect.ownKeys(d).some(k=>!Object.is(d[k],v[k])))bad();}};
const select=source=>{array(source,9);const callback=own(source,"0"),backend=own(source,"1"),session=own(source,"2"),router=own(source,"3"),actor=own(source,"4"),sql=own(source,"5"),date=own(source,"6"),now=own(source,"7"),parser=own(source,"8");
if(backend===null||typeof backend!=="object"||session===null||typeof session!=="object")bad();const prototype=Object.getPrototypeOf(backend),intercept=own(prototype,"interceptHttpProtocol"),driver=own(backend,"cb");
fn(callback,"u",1);fn(router,"xC",3);fn(actor,"L3",2);fn(sql,"y",2);fn(intercept,"interceptHttpProtocol",3);fn(driver,"",2);fn(date,"Date",7);fn(now,"now",0);fn(parser,"rl",1);
if(own(globalThis,"Date")!==date||own(date,"now")!==now||Function.prototype.toString.call(date)!=="function Date() { [native code] }"||Function.prototype.toString.call(now)!=="function now() { [native code] }")bad();
return[source,backend,session,callback,prototype,intercept,driver,router,actor,sql,date,now,parser];};`;

export const CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_CALLS = freezeDeep({
  capture: { program: `function(){${helpers}\nconst result=select(this);verify();return result;}`, arguments: 0, returnByValue: false },
  require: { program: `function(original){${helpers}\narray(original,13);const current=select(this);for(let i=0;i<13;i++)if(own(original,String(i))!==current[i])bad();verify();return true;}`, arguments: 1, returnByValue: true },
});
export const CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_FLAGS = Object.freeze({ objectGroup: CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_GROUP,
  silent: true, generatePreview: false, throwOnSideEffect: true, awaitPromise: false, userGesture: false } as const);
export const CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_LIMITS = Object.freeze({
  profile: "private.current-footprint-copy-main-backend-construction.v1",
  originalMainTransportRequired: true, exactRuntimeAppSourceRequired: true, originalRegistrationPauseRequired: true,
  actualBreakpointLocationRequired: true, originalFunctionMetadataRequired: true,
  protocolRegistrationObserved: false, requestContextRetained: false, actualActorClockInvocationObserved: false,
  projectSqlInvocationObserved: false, responderExclusivityProven: false, executionAuthorized: false,
} as const);
