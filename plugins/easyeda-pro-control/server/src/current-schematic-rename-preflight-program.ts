import { CURRENT_SCHEMATIC_RENAME_OBSERVATION_LIMITATIONS, CURRENT_SCHEMATIC_RENAME_PREFLIGHT_TIMEOUT_MS } from "./current-schematic-rename-observation.ts";
import { CURRENT_SCHEMATIC_RENAME_PREFLIGHT_MAX_BYTES, CURRENT_SCHEMATIC_RENAME_PREFLIGHT_MAX_PEERS,
  parseCurrentSchematicRenamePreflightRequest } from "./current-schematic-rename-preflight.ts";
import { buildCurrentProjectOnlySymbolGuard } from "./current-project-only-symbol-guard.ts";
import { CURRENT_SYMBOL_RUNTIME_OBSERVATION_SOURCE } from "./current-symbol-runtime-observation.ts";
import { EXACT_READ_ENVELOPE_SCHEMA } from "./exact-readers.ts";

/** Fixed read-only SCH program, unregistered. MGR005584e0 GET2058248,
 * GET_ALL_KV2058801 and GET_UUID_BY_NAME2058882 delegate worker b849bd12
 * Dg.get1911033, getAllKVData1912957 and getIdByName1913613. Unlike the array
 * route, the key-value route has no caught-error [] fallback. Name availability
 * requires exactly ""; missing replies cannot mean available. No updateData,
 * tryRename, canvas, subscriber, permission RPC, APP evaluator or Save is called.
 */
export function buildCurrentSchematicRenamePreflightProgram(input: unknown): string {
  const selected = parseCurrentSchematicRenamePreflightRequest(input);
  return `let timer,clear;const root=globalThis,apply=Reflect.apply;let expired=false,stage='HOST';
const bad=()=>{throw new Error('CURRENT_SCHEMATIC_RENAME_PREFLIGHT_REFUSED:'+stage);};
const own=(owner,key,optional=false)=>{if(owner===null||(typeof owner!=='object'&&typeof owner!=='function'))bad();const d=Object.getOwnPropertyDescriptor(owner,key);if(!d){if(optional&&!(key in owner))return undefined;bad();}if(!Object.hasOwn(d,'value'))bad();return d.value;};
const plain=value=>{if(value===null||typeof value!=='object'||Array.isArray(value)||Object.getPrototypeOf(value)!==Object.prototype)bad();return value;};
const text=(value,max)=>{if(typeof value!=='string'||value.length>max)bad();return value;};
const title=value=>{text(value,512);if(value.length===0||value.trim()!==value||!/^[\\x20-\\x7E]+$/.test(value)||value.includes('I'))bad();return value;};
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
 const metadata=(raw,uuid)=>{const value=plain(raw);if(own(value,'uuid')!==uuid||own(value,'project_uuid')!==target.projectUuid||own(value,'source')!=='')bad();
  const name=title(own(value,'name')),displayName=title(own(value,'display_name')),version=text(own(value,'version'),128),boardUuid=text(own(value,'board'),32);
  if(name!==displayName.toLowerCase()||name===desiredTitle.toLowerCase()||version.length===0)bad();if(boardUuid!=='')identifier(boardUuid);
  return{uuid,name,displayName,source:'',version,boardUuid,ticket:integer(own(value,'ticket')),updateTime:integer(own(value,'updateTime'),8640000000000000)};};
 const peerSample=async()=>{stage='PEERS';const map=plain(await call('/PrjDB/schematic/getAllKVDatas',[target.projectUuid]));same();
  const keys=Reflect.ownKeys(map);if(keys.length<1||keys.length>${CURRENT_SCHEMATIC_RENAME_PREFLIGHT_MAX_PEERS}||keys.some(key=>typeof key!=='string'))bad();keys.forEach(identifier);keys.sort();
  const peers=keys.map(uuid=>metadata(own(map,uuid),uuid));if(!keys.includes(target.schematicUuid))bad();
  if(new TextEncoder().encode(JSON.stringify(peers)).byteLength>${CURRENT_SCHEMATIC_RENAME_PREFLIGHT_MAX_BYTES})bad();return peers;};
 const sample=async()=>{stage='CLOCK';await sampleRuntimeClock();await clientSample();await projectSample();
  const peers=await peerSample();stage='SCHEMATIC';const value=metadata(await call('/PrjDB/schematic/getData',[target.schematicUuid,target.projectUuid]),target.schematicUuid);same();
  if(JSON.stringify(value)!==JSON.stringify({uuid:target.schematicUuid,...expectedBefore})||JSON.stringify(value)!==JSON.stringify(peers.find(peer=>peer.uuid===target.schematicUuid)))bad();
  stage='NAME';const collision=await call('/PrjDB/schematic/getIdByName',[desiredTitle,target.projectUuid]);same();if(collision!=='')bad();
  await projectSample();await clientSample();stage='CLOCK';await sampleRuntimeClock();same();if(peers.some(peer=>peer.ticket>clientTicket.maxTicket))bad();return peers;};
 const run=async()=>{const first=await sample(),second=await sample();same();if(JSON.stringify(first)!==JSON.stringify(second))bad();
  const result={ok:true,kind:'current-schematic-rename-preflight',target,expectedBefore,desiredTitle,samples:2,currentTabId:projectOnly.currentTabId,peers:first,
   nativeNameAvailableObserved:true,completeNativeSchematicMapObserved:true,expectedBeforeMatched:true,noEditorTabsObserved:true,hiddenEditorsAbsentObserved:true,
   dirtyTabsAbsentObserved:true,cachedProjectReadOnlyAbsentObserved:true,concurrentStrictModeAbsentObserved:true,clientTicketObservation:{...clientTicket,samples:4},runtimeObservation:runtimeObservation(),...${JSON.stringify(CURRENT_SCHEMATIC_RENAME_OBSERVATION_LIMITATIONS)}};
  const json=JSON.stringify(result),utf8Bytes=new TextEncoder().encode(json).byteLength,envelope={schema:${JSON.stringify(EXACT_READ_ENVELOPE_SCHEMA)},utf8Bytes,json};
  if(utf8Bytes>${CURRENT_SCHEMATIC_RENAME_PREFLIGHT_MAX_BYTES}||new TextEncoder().encode(JSON.stringify(envelope)).byteLength>${CURRENT_SCHEMATIC_RENAME_PREFLIGHT_MAX_BYTES})bad();return envelope;};
 same();const timeout=new Promise((resolve,reject)=>{timer=apply(set,root,[()=>{expired=true;stage='TIMEOUT';reject(new Error('CURRENT_SCHEMATIC_RENAME_PREFLIGHT_REFUSED:TIMEOUT'));},${CURRENT_SCHEMATIC_RENAME_PREFLIGHT_TIMEOUT_MS}]);});
 return await Promise.race([run(),timeout]);
}catch{throw new Error('CURRENT_SCHEMATIC_RENAME_PREFLIGHT_REFUSED:'+stage);}
finally{if(timer!==undefined){try{apply(clear,root,[timer]);}catch{throw new Error('CURRENT_SCHEMATIC_RENAME_PREFLIGHT_REFUSED:CLEANUP');}}}`;
}
