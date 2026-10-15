import { assertUpstreamReplySettled, extractToolPayload } from "./core.ts";
import { buildCurrentStartPageGuard } from "./current-start-page.ts";
import { EXACT_READ_ENVELOPE_SCHEMA, decodeExactReadEnvelope } from "./exact-readers.ts";

export const CURRENT_UPLOAD_QUEUE_PROFILE = "easyeda-pro-control.current-inactive-upload-queues.v1";
export const CURRENT_UPLOAD_QUEUE_TIMEOUT_MS = 10_000;
export const CURRENT_UPLOAD_QUEUE_MAX_BYTES = 16_384;
export interface CurrentUploadQueueScope { readonly projectUuid: string; readonly branchUuid: string }

function fields(input: unknown, names: readonly string[]): Record<string, unknown> {
  if (input === null || typeof input !== "object" || Array.isArray(input) ||
    (Object.getPrototypeOf(input) !== Object.prototype && Object.getPrototypeOf(input) !== null) || Reflect.ownKeys(input).length !== names.length) {
    throw new Error("CURRENT_UPLOAD_QUEUE_INPUT");
  }
  const result: Record<string, unknown> = {};
  for (const name of names) {
    const descriptor = Object.getOwnPropertyDescriptor(input, name);
    if (descriptor === undefined || !Object.hasOwn(descriptor, "value")) { throw new Error("CURRENT_UPLOAD_QUEUE_INPUT"); }
    result[name] = descriptor.value as unknown;
  }
  return result;
}
function scope(input: unknown): CurrentUploadQueueScope {
  const value = fields(input, ["projectUuid", "branchUuid"]);
  const branchUuid = value["branchUuid"], projectUuid = value["projectUuid"];
  if (typeof projectUuid !== "string" || projectUuid.length !== 64 || !/^[a-f0-9]{64}$/u.test(projectUuid) ||
    typeof branchUuid !== "string" || branchUuid.length !== 32 || !/^[a-f0-9]{32}$/u.test(branchUuid)) { throw new Error("CURRENT_UPLOAD_QUEUE_INPUT"); }
  return { projectUuid, branchUuid };
}

/** Current UI3823ed6e/WORKERb849bd12 fixed observation only. Exactly three
 * target-absence RPCs bracket two noncreating CacheStorage.match calls. No
 * body read, cache enumeration, network, clearing, navigation or retry.
 * The absence flags are sequential observations, not atomic or ongoing cache emptiness.
 * The coordinator separately owns the launch, session and pre-open lifetime.
 */
export function buildCurrentUploadQueueReadExpression(input: unknown): string {
  const target = scope(input);
  return `(async()=>{
const target=${JSON.stringify(target)},root=globalThis,apply=Reflect.apply;
let stage='HOST',expired=false,timer,clear;
const bad=()=>{throw new Error('CURRENT_UPLOAD_QUEUE_READ_REFUSED:'+stage);};
const own=(owner,key,optional=false)=>{if(owner===null||(typeof owner!=='object'&&typeof owner!=='function'))bad();const d=Object.getOwnPropertyDescriptor(owner,key);if(!d){if(optional&&!(key in owner))return undefined;bad();}if(!Object.hasOwn(d,'value'))bad();return d.value;};
const method=(owner,key)=>{const chain=[];let node=owner;for(let i=0;i<4;i++){if(node===null||(typeof node!=='object'&&typeof node!=='function'))bad();chain.push(node);const d=Object.getOwnPropertyDescriptor(node,key);if(d){if(!Object.hasOwn(d,'value')||typeof d.value!=='function')bad();return{owner,key,chain,fn:d.value};}node=Object.getPrototypeOf(node);}bad();};
const methodCheck=binding=>{for(let i=0;i<binding.chain.length;i++){const node=binding.chain[i];if(i>0&&Object.getPrototypeOf(binding.chain[i-1])!==node)bad();if(i===binding.chain.length-1){if(own(node,binding.key)!==binding.fn)bad();}else if(Object.hasOwn(node,binding.key))bad();}};
try{
 const set=own(root,'setTimeout');clear=own(root,'clearTimeout');if(typeof set!=='function'||typeof clear!=='function')bad();
 ${buildCurrentStartPageGuard()}
 const host=currentStartPage.host,bus=own(host,'messageBus'),rpc=method(bus,'rpcCall');
 const navigator=root.navigator,serviceWorker=navigator?.serviceWorker;
 const storage=root.caches,constructor=root.CacheStorage,prototype=constructor?.prototype;
 if(typeof constructor!=='function'||storage===null||typeof storage!=='object'||Object.getPrototypeOf(storage)!==prototype)bad();
 const match=own(prototype,'match');if(typeof match!=='function'||!serviceWorker||serviceWorker.controller!==null)bad();
 const check=()=>{
  if(expired){stage='TIMEOUT';bad();}currentStartPage.check();methodCheck(rpc);
  if(own(host,'messageBus')!==bus||root.navigator!==navigator||navigator.serviceWorker!==serviceWorker||serviceWorker.controller!==null)bad();
  if(root.caches!==storage||root.CacheStorage!==constructor||constructor.prototype!==prototype||Object.getPrototypeOf(storage)!==prototype||Object.hasOwn(storage,'match')||own(prototype,'match')!==match||own(root,'setTimeout')!==set||own(root,'clearTimeout')!==clear)bad();
 };
 const absent=async()=>{stage='TARGET_INACTIVE';check();const reply=await apply(rpc.fn,bus,['/pro-mgr/hasProject',[target.projectUuid]]);check();if(own(reply,'message')!==false)bad();};
 const run=async()=>{
  const names=['project_'+target.projectUuid+'_v6','localProject_'+target.projectUuid+'_v1'];
  for(let index=0;index<2;index++){
   await absent();stage=index===0?'PROJECT_CACHE':'LOCAL_CACHE';check();
   const result=await apply(match,storage,['https://client/upload/'+target.branchUuid,{cacheName:names[index],ignoreSearch:true,ignoreMethod:false,ignoreVary:true}]);
   check();if(result!==undefined)bad();
  }
  await absent();stage='RESULT';check();
  return{profile:${JSON.stringify(CURRENT_UPLOAD_QUEUE_PROFILE)},projectUuid:target.projectUuid,branchUuid:target.branchUuid,origin:'https://client',projectV6UploadAbsent:true,localProjectV1UploadAbsent:true,scope:'point-in-time-inactive-target',startupQualified:false,persistenceVerified:false,writerAuthority:false,executionAuthorized:false};
 };
 check();const timeout=new Promise((resolve,reject)=>{timer=apply(set,root,[()=>{expired=true;stage='TIMEOUT';reject(new Error('CURRENT_UPLOAD_QUEUE_READ_REFUSED:TIMEOUT'));},${CURRENT_UPLOAD_QUEUE_TIMEOUT_MS}]);});
 return await Promise.race([run(),timeout]);
}catch{throw new Error('CURRENT_UPLOAD_QUEUE_READ_REFUSED:'+stage);}
finally{if(timer!==undefined){try{apply(clear,root,[timer]);}catch{throw new Error('CURRENT_UPLOAD_QUEUE_READ_REFUSED:CLEANUP');}}}
})()`;
}

/** Fixed executor body. Rejection, including the inner deadline, stays rejected. */
export function buildCurrentUploadQueueReadProgram(input: unknown): string {
  return `const observation=await ${buildCurrentUploadQueueReadExpression(input)};
const json=JSON.stringify(observation),utf8Bytes=new TextEncoder().encode(json).byteLength;
const envelope={schema:${JSON.stringify(EXACT_READ_ENVELOPE_SCHEMA)},utf8Bytes,json};
if(utf8Bytes>${CURRENT_UPLOAD_QUEUE_MAX_BYTES}||new TextEncoder().encode(JSON.stringify(envelope)).byteLength>${CURRENT_UPLOAD_QUEUE_MAX_BYTES})throw new Error('CURRENT_UPLOAD_QUEUE_ENVELOPE');
return envelope;`;
}

/** Bounded data decoding only; neither the reply nor its envelope grants authority. */
export function decodeCurrentUploadQueueReadReply(raw: unknown, expected: unknown): Readonly<Record<string, unknown>> {
  assertUpstreamReplySettled(raw);
  const envelope = fields(extractToolPayload(raw), ["schema", "utf8Bytes", "json"]);
  if (envelope["schema"] !== EXACT_READ_ENVELOPE_SCHEMA || typeof envelope["json"] !== "string" ||
    envelope["json"].length === 0 || envelope["json"].length > CURRENT_UPLOAD_QUEUE_MAX_BYTES ||
    !Number.isSafeInteger(envelope["utf8Bytes"]) || Buffer.byteLength(envelope["json"], "utf8") > CURRENT_UPLOAD_QUEUE_MAX_BYTES ||
    Buffer.byteLength(JSON.stringify(envelope), "utf8") > CURRENT_UPLOAD_QUEUE_MAX_BYTES) { throw new Error("CURRENT_UPLOAD_QUEUE_ENVELOPE"); }
  return validateCurrentUploadQueueReadResult(decodeExactReadEnvelope(envelope), expected);
}

/** Strict data parser only. Matching JSON cannot issue runtime authority. */
export function validateCurrentUploadQueueReadResult(input: unknown, expected: unknown): Readonly<Record<string, unknown>> {
  const target = scope(expected);
  const value = fields(input, ["profile", "projectUuid", "branchUuid", "origin", "projectV6UploadAbsent", "localProjectV1UploadAbsent", "scope",
    "startupQualified", "persistenceVerified", "writerAuthority", "executionAuthorized"]);
  if (value["profile"] !== CURRENT_UPLOAD_QUEUE_PROFILE || value["projectUuid"] !== target.projectUuid || value["branchUuid"] !== target.branchUuid ||
    value["origin"] !== "https://client" || value["projectV6UploadAbsent"] !== true || value["localProjectV1UploadAbsent"] !== true ||
    value["scope"] !== "point-in-time-inactive-target" || value["startupQualified"] !== false || value["persistenceVerified"] !== false ||
    value["writerAuthority"] !== false || value["executionAuthorized"] !== false) { throw new Error("CURRENT_UPLOAD_QUEUE_RESULT"); }
  return Object.freeze(value);
}
