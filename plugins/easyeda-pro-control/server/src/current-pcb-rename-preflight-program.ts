import { CURRENT_PCB_RENAME_PREFLIGHT_LIMITATIONS, CURRENT_PCB_RENAME_PREFLIGHT_MAX_BYTES, CURRENT_PCB_RENAME_PREFLIGHT_MAX_PEERS,
  CURRENT_PCB_RENAME_PREFLIGHT_TIMEOUT_MS, parseCurrentPcbRenamePreflightRequest } from "./current-pcb-rename-preflight.ts";
import { buildCurrentProjectOnlySymbolGuard } from "./current-project-only-symbol-guard.ts";
import { CURRENT_SYMBOL_RUNTIME_OBSERVATION_SOURCE } from "./current-symbol-runtime-observation.ts";
import { EXACT_READ_ENVELOPE_SCHEMA } from "./exact-readers.ts";

/** Fixed observation only. Require the current project-only preflight source
 * profile before and after dispatch, including notify-clock implementation.
 * MGR005584e0 GET_ALL_KV2064064 has no swallowed-error [] fallback; its
 * GET_UUID_BY_TITLE2063498 calls WORKERb849bd12 Sg.getIdByTitle1903859
 * using Ne1845057.
 * Only the native empty-string result means no match. The outer message bus
 * converts service exceptions to undefined, which must never mean available.
 * That native lookup is read-only. The public modifyPcbName route is not used.
 */
export function buildCurrentPcbRenamePreflightProgram(input: unknown): string {
  const selected = parseCurrentPcbRenamePreflightRequest(input);
  return `let timer,clear;const root=globalThis,apply=Reflect.apply;let expired=false,stage='HOST';
const bad=()=>{throw new Error('CURRENT_PCB_RENAME_PREFLIGHT_REFUSED:'+stage);};
const own=(owner,key,optional=false)=>{if(owner===null||(typeof owner!=='object'&&typeof owner!=='function'))bad();const d=Object.getOwnPropertyDescriptor(owner,key);if(!d){if(optional&&!(key in owner))return undefined;bad();}if(!Object.hasOwn(d,'value'))bad();return d.value;};
const plain=value=>{if(value===null||typeof value!=='object'||Array.isArray(value)||Object.getPrototypeOf(value)!==Object.prototype)bad();return value;};
const text=(value,max)=>{if(typeof value!=='string'||value.length>max)bad();return value;};
const integer=(value,max=Number.MAX_SAFE_INTEGER)=>{if(typeof value!=='number'||!Number.isSafeInteger(value)||value<0||value>max||Object.is(value,-0))bad();return value;};
const identifier=value=>{if(typeof value!=='string'||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/.test(value))bad();return value;};
const method=(owner,key)=>{const chain=[];let node=owner;for(let i=0;i<4;i++){if(node===null||(typeof node!=='object'&&typeof node!=='function'))bad();chain.push(node);const d=Object.getOwnPropertyDescriptor(node,key);if(d){if(!Object.hasOwn(d,'value')||typeof d.value!=='function')bad();return{owner,key,chain,fn:d.value};}node=Object.getPrototypeOf(node);}bad();};
const methodCheck=binding=>{for(let i=0;i<binding.chain.length;i++){const node=binding.chain[i];if(i>0&&Object.getPrototypeOf(binding.chain[i-1])!==node)bad();if(i===binding.chain.length-1){if(own(node,binding.key)!==binding.fn)bad();}else if(Object.hasOwn(node,binding.key))bad();}};
const target=${JSON.stringify(selected.target)},expectedBefore=${JSON.stringify(selected.expectedBefore)},desiredTitle=${JSON.stringify(selected.desiredTitle)};
try{
 const set=own(root,'setTimeout');clear=own(root,'clearTimeout');if(typeof set!=='function'||typeof clear!=='function')bad();
 ${buildCurrentProjectOnlySymbolGuard()}
 const host=projectOnly.host,bus=own(host,'messageBus'),rpc=method(bus,'rpcCall'),edaOwner=eda;
 ${CURRENT_SYMBOL_RUNTIME_OBSERVATION_SOURCE}
 const same=()=>{projectOnly.check();checkRuntimeObservation();methodCheck(rpc);if(expired||own(host,'messageBus')!==bus||eda!==edaOwner||own(edaOwner,'extensionUuid')!=='7e06d286b1ac846ef7eab9c7f2a9ee40'||own(root,'setTimeout')!==set||own(root,'clearTimeout')!==clear)bad();};
 const call=async(topic,args)=>{same();const raw=await apply(rpc.fn,bus,[topic,args,0]);same();return own(plain(raw),'message');};
 let clientTicket;
 const clientSample=async()=>{stage='CLIENT_TICKET';const client=await call('/PrjDB/project/getClient',[target.projectUuid]);same();if(typeof client!=='string'||!/^[a-f0-9]{16}$/.test(client))bad();
  const maxTicket=integer(await call('/PrjDB/project/getMaxTicket',[target.projectUuid]));same();if(clientTicket&&(clientTicket.client!==client||clientTicket.maxTicket!==maxTicket))bad();clientTicket={client,maxTicket};};
 const projectSample=async()=>{stage='PROJECT';const value=plain(await call('/PrjDB/project/getData',[target.projectUuid]));same();
  if(own(value,'uuid')!==target.projectUuid||own(value,'currentBranch')!==target.branchUuid||own(value,'isV2Format')!==false||own(plain(own(value,'owner')),'uuid')!==target.ownerUuid)bad();
  for(const key of ['archive','store','cbb_project']){const flag=own(value,key,true);if(flag!==undefined&&flag!==false&&flag!==null&&flag!==0)bad();}};
 const metadata=(raw,uuid)=>{const value=plain(raw);if(own(value,'uuid')!==uuid||own(value,'project_uuid')!==target.projectUuid||own(value,'docType')!==3)bad();
  const parentUuid=text(own(value,'parent_uuid'),32);if(parentUuid!=='')identifier(parentUuid);
  return{uuid,title:text(own(value,'title'),512),displayTitle:text(own(value,'display_title'),512),parentUuid,source:text(own(value,'source'),4096),version:text(own(value,'version'),128),boardUuid:text(own(value,'board'),128),ticket:integer(own(value,'ticket')),updateTime:integer(own(value,'updateTime'),8640000000000000),docType:3};};
 const peerSample=async()=>{stage='PEERS';const map=plain(await call('/PrjDB/pcb/getAllKVDatas',[target.projectUuid]));same();
  const keys=Reflect.ownKeys(map);if(keys.length<1||keys.length>${CURRENT_PCB_RENAME_PREFLIGHT_MAX_PEERS}||keys.some(key=>typeof key!=='string'))bad();keys.forEach(identifier);keys.sort();
  const peers=keys.map(uuid=>metadata(own(map,uuid),uuid));if(!keys.includes(target.pcbUuid))bad();
  if(new TextEncoder().encode(JSON.stringify(peers)).byteLength>${CURRENT_PCB_RENAME_PREFLIGHT_MAX_BYTES})bad();return peers;};
 const sample=async()=>{stage='CLOCK';await sampleRuntimeClock();await clientSample();await projectSample();
  const peers=await peerSample();stage='PCB';const value=metadata(await call('/PrjDB/pcb/getData',[target.pcbUuid,target.projectUuid]),target.pcbUuid);same();
  if(JSON.stringify(value)!==JSON.stringify({uuid:target.pcbUuid,...expectedBefore})||JSON.stringify(value)!==JSON.stringify(peers.find(peer=>peer.uuid===target.pcbUuid)))bad();
  stage='NAME';const collision=await call('/PrjDB/pcb/getIdByTitle',[desiredTitle,target.projectUuid]);same();if(collision!=='')bad();
  await projectSample();await clientSample();stage='CLOCK';await sampleRuntimeClock();same();if(peers.some(peer=>peer.ticket>clientTicket.maxTicket))bad();return peers;};
 const run=async()=>{const first=await sample(),second=await sample();same();if(JSON.stringify(first)!==JSON.stringify(second))bad();
  const result={ok:true,kind:'current-pcb-rename-preflight',target,expectedBefore,desiredTitle,samples:2,currentTabId:projectOnly.currentTabId,peers:first,
   nativeNameAvailableObserved:true,completeNativePcbMapObserved:true,expectedBeforeMatched:true,noEditorTabsObserved:true,hiddenEditorsAbsentObserved:true,
   dirtyTabsAbsentObserved:true,cachedProjectReadOnlyAbsentObserved:true,concurrentStrictModeAbsentObserved:true,clientTicketObservation:{...clientTicket,samples:4},runtimeObservation:runtimeObservation(),...${JSON.stringify(CURRENT_PCB_RENAME_PREFLIGHT_LIMITATIONS)}};
  const json=JSON.stringify(result),utf8Bytes=new TextEncoder().encode(json).byteLength,envelope={schema:${JSON.stringify(EXACT_READ_ENVELOPE_SCHEMA)},utf8Bytes,json};
  if(utf8Bytes>${CURRENT_PCB_RENAME_PREFLIGHT_MAX_BYTES}||new TextEncoder().encode(JSON.stringify(envelope)).byteLength>${CURRENT_PCB_RENAME_PREFLIGHT_MAX_BYTES})bad();return envelope;};
 same();const timeout=new Promise((resolve,reject)=>{timer=apply(set,root,[()=>{expired=true;stage='TIMEOUT';reject(new Error('CURRENT_PCB_RENAME_PREFLIGHT_REFUSED:TIMEOUT'));},${CURRENT_PCB_RENAME_PREFLIGHT_TIMEOUT_MS}]);});
 return await Promise.race([run(),timeout]);
}catch{throw new Error('CURRENT_PCB_RENAME_PREFLIGHT_REFUSED:'+stage);}
finally{if(timer!==undefined){try{apply(clear,root,[timer]);}catch{throw new Error('CURRENT_PCB_RENAME_PREFLIGHT_REFUSED:CLEANUP');}}}`;
}
