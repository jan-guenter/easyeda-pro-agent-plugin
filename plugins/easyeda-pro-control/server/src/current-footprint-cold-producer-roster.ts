/** Original bootstrap snapshot before EP registers project RPC services. These
 * fixed descriptor reads call no producer, timer, resolver, Cache or serializer.
 * A cold snapshot cannot prove later exclusion or detached async completion. */
const guards = String.raw`"use strict";
const bad=()=>{throw new Error("FOOTPRINT_COLD_PRODUCER");},seen=[];
const own=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();seen.push([o,k,d]);return d.value;};
const scope=o=>own(o,"object");
const current=p=>{if(own(globalThis,"PROJECT")!==p)bad();};
const empty=(o,p)=>{if(o===null||typeof o!=="object"||Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,"size");if(!d||typeof d.get!=="function"||Reflect.apply(d.get,o,[])!==0)bad();};
const array=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype||own(o,"length")!==0||Reflect.ownKeys(o).length!==1)bad();};
const verify=()=>{for(const[o,k,d]of seen){const n=Object.getOwnPropertyDescriptor(o,k);if(!n||!Object.hasOwn(n,"value")||!Object.is(n.value,d.value)||n.writable!==d.writable||n.enumerable!==d.enumerable||n.configurable!==d.configurable)bad();}};`;
export const CURRENT_FOOTPRINT_COLD_PRODUCER_CALLS = Object.freeze({
  project: `function(){${guards}current(this);for(const k of ["task1","task2","task3","cachePromise","publishTask","rollbackPromise"])empty(own(this,k),Set.prototype);for(const k of ["bufferUploadData","bufferUploadCache"])empty(own(this,k),Map.prototype);for(const k of ["publishTimer","orderTimer","projectTimer"])if(own(this,k)!==null)bad();for(const k of ["isReady","isUploadingCloud","pendingSyncCloud","isBatchUpload"])if(own(this,k)!==false)bad();for(const k of ["cache","localCache"])if(Object.getOwnPropertyDescriptor(this,k)!==undefined)bad();const order=own(this,"orderCache");if(order===null||typeof order!=="object"||Object.getPrototypeOf(order)!==Object.prototype||Reflect.ownKeys(order).length!==0)bad();verify();return true;}`,
  stream: `function(project,wrapper,callback){${guards}current(project);if(own(project,"bufferedUploadCloud")!==wrapper)bad();const s=scope(this);if(own(s,"a")!==project||own(s,"t")!==callback||own(s,"s")!==500||own(s,"r")!==null||own(s,"i")!==null||own(s,"n")!==null)bad();verify();return true;}`,
  cooperation: `function(project,wrapper,callback){${guards}current(project);if(own(project,"bufferedPendDataStream")!==wrapper)bad();const s=scope(this);if(own(s,"e")!==callback||own(s,"t")!==10||own(s,"r")!==null||own(s,"i")!==null)bad();array(own(s,"s"));verify();return true;}`,
});
/** Existing four-wrapper/source/scope relations take twenty requests; these
 * three dormant-state predicates and the original Nd/QA pristine predicate add
 * four. All are dispatched while the original bootstrap frame stays paused. */
export const CURRENT_FOOTPRINT_COLD_PRODUCER_REQUESTS = 24;
export interface CurrentFootprintColdProducerRoster {
  readonly profile: "private.current-footprint-cold-producer-roster.v1";
  readonly originalBootstrapBeforeRpcRegistrationObserved: true;
  readonly originalFourWrappersAndCallbacksRetained: true;
  readonly originalSerialDebounceBufferedAndPublishDormancyObserved: true;
  readonly projectCachesUnassignedAtBootstrapObserved: true;
  readonly continuousProducerExclusionVerified: false;
  readonly detachedCacheAndRetryOutcomesVerified: false;
  readonly completeUploadFrontierVerified: false;
  readonly executionAuthorized: false;
}
