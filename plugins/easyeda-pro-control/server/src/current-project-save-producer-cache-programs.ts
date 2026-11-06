/** Original paused caller/cache/Response identity projection. No cache method,
 * Response getter, serializer, resolver, timer or continuation is invoked. */
import { CURRENT_NATIVE_CACHE_RESPONSE_INTRINSIC_CALLS as INTRINSICS } from "./current-native-cache-response-intrinsics.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_CACHE_CALLERS as CALLERS } from "./current-project-save-producer-cache-source.ts";
import type { CurrentProjectSaveProducerCacheCaller } from "./current-project-save-producer-cache-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const guards = String.raw`"use strict";const bad=()=>{throw new Error("PROJECT_SAVE_PRODUCER_CACHE_CALLER");},seen=[];
const own=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();seen.push([o,k,d]);return d.value;};
const array=(o,n)=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype||own(o,"length")!==n||Reflect.ownKeys(o).length!==n+1)bad();for(let i=0;i<n;i++)own(o,String(i));};
const verify=()=>{for(const[o,k,d]of seen){const next=Object.getOwnPropertyDescriptor(o,k);if(!next||!Object.hasOwn(next,"value")||!Object.is(next.value,d.value)||next.writable!==d.writable||next.enumerable!==d.enumerable||next.configurable!==d.configurable)bad();}};`;
function join(role: CurrentProjectSaveProducerCacheCaller): string {
  if (role === "flow") { return 'if(key!==own(caller,"4"))bad();body=own(caller,"3");'; }
  if (role === "localUpload" || role === "localSave") { return 'if(key!==own(caller,"5"))bad();body=own(caller,"4");'; }
  return 'if(!key.endsWith("/index/v1/"+branch))bad();body=own(project,"historyIndex");if(!Array.isArray(body)||Object.getPrototypeOf(body)!==Array.prototype)bad();';
}
const programs = Object.fromEntries(Object.entries(CALLERS).map(([name, site]) => {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Keys enumerate this fixed complete source roster.
  const role = name as CurrentProjectSaveProducerCacheCaller;
  const namespace = site.namespace === "project" ? '"project_"+uuid+"_v6"' : '"localProject_"+uuid+"_v1"';
  const member = site.namespace === "project" ? "cache" : "localCache";
  return [role, `function(project,wrapper,callback,intrinsics,caller){${guards}
array(this,4);array(caller,${String(site.length)});array(intrinsics,28);const reprove=(${INTRINSICS.reprove.program});if(Reflect.apply(reprove,intrinsics,[])!==true)bad();
if(own(globalThis,"PROJECT")!==project||own(project,"bufferedUploadCloud")!==wrapper||typeof wrapper!=="function"||typeof callback!=="function"||own(caller,"0")!==project)bad();
const cacheWrapper=own(this,"0"),key=own(this,"1"),response=own(this,"2"),retry=own(this,"3"),uuid=own(project,"uuid"),branch=own(project,"branchUuid");
if(typeof uuid!=="string"||!/^[a-f0-9]{64}$/.test(uuid)||typeof branch!=="string"||!/^[a-f0-9]{32}$/.test(branch)||cacheWrapper!==own(project,"${member}")||own(cacheWrapper,"cacheName")!==${namespace}||typeof key!=="string"||key.length===0||key.length>4096||retry!==undefined)bad();
const cache=own(cacheWrapper,"cache");if(cache===null||typeof cache!=="object"||Object.getPrototypeOf(cache)!==own(intrinsics,"4")||Reflect.ownKeys(cache).length!==0||response===null||typeof response!=="object"||Object.getPrototypeOf(response)!==own(intrinsics,"6")||Reflect.ownKeys(response).length!==0)bad();
let body;${join(role)}if(typeof body==="string"&&body.length>16384)bad();${site.namespace === "local" || role === "flow" ? 'if(typeof body!=="string")bad();' : ""}
verify();if(Reflect.apply(reprove,intrinsics,[])!==true)bad();return[this,caller,cacheWrapper,cache,response,intrinsics,key,body,uuid,branch];}`];
}));
// oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Constructed once from the exact six-key source roster above.
export const CURRENT_PROJECT_SAVE_PRODUCER_CACHE_CALLS = freezeDeep(programs) as Readonly<Record<CurrentProjectSaveProducerCacheCaller, string>>;
export const CURRENT_PROJECT_SAVE_PRODUCER_CACHE_CAPTURE_LENGTH = 10;
