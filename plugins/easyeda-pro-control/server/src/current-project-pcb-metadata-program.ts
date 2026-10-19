import { CURRENT_PROJECT_PCB_METADATA_MAX_BYTES, CURRENT_PROJECT_PCB_METADATA_MAX_ITEMS, CURRENT_PROJECT_PCB_METADATA_TIMEOUT_MS, parseCurrentProjectPcbMetadataRequest } from "./current-project-pcb-metadata.ts";
import { buildCurrentProjectOnlySymbolGuard } from "./current-project-only-symbol-guard.ts";
import { EXACT_READ_ENVELOPE_SCHEMA } from "./exact-readers.ts";

/** Fixed metadata-only native equivalent. MGR005584e0 at2063406 routes the exact
 * project-qualified PCB getData request. WORKERb849bd12 Sg.get/getData at1901353/
 * 1902855 read existing metadata; getNeedData/canvas is never requested.
 * The API021d155b wrapper at476238 instead enumerates the mutable public tree.
 * APP52f51ce4 G.show at2317299 omits store from local project metadata.
 * Preserve the existing symbol route's exact optional inactive-flag forms.
 * Inventory uses GET_ALL_KV2064064 and Sg.getAllKVData1903452, not the manager's
 * caught-error array route. Native enumeration precedes our response bounds.
 */
export function buildCurrentProjectPcbMetadataProgram(input: unknown): string {
  const request = parseCurrentProjectPcbMetadataRequest(input);
  const inventory = request.method === "eda.dmt_Pcb.getAllPcbsInfo";
  return `let timer,clear;
try{
const root=globalThis,apply=Reflect.apply,target=${JSON.stringify(request.target)};let expired=false;
const bad=()=>{throw new Error('CURRENT_PROJECT_PCB_METADATA_READ_FAILED');};
const own=(owner,key,optional=false)=>{if(owner===null||(typeof owner!=='object'&&typeof owner!=='function'))bad();const d=Object.getOwnPropertyDescriptor(owner,key);if(!d){if(optional&&!(key in owner))return undefined;bad();}if(!Object.hasOwn(d,'value'))bad();return d.value;};
const plain=value=>{if(value===null||typeof value!=='object'||Array.isArray(value)||Object.getPrototypeOf(value)!==Object.prototype)bad();return value;};
const text=(value,max)=>{if(typeof value!=='string'||value.length>max)bad();return value;};
const integer=(value,max=Number.MAX_SAFE_INTEGER)=>{if(typeof value!=='number'||!Number.isSafeInteger(value)||value<0||value>max||Object.is(value,-0))bad();return value;};
const method=(owner,key)=>{const chain=[];let node=owner;for(let i=0;i<4;i++){if(node===null||(typeof node!=='object'&&typeof node!=='function'))bad();chain.push(node);const d=Object.getOwnPropertyDescriptor(node,key);if(d){if(!Object.hasOwn(d,'value')||typeof d.value!=='function')bad();return{owner,key,chain,fn:d.value};}node=Object.getPrototypeOf(node);}bad();};
const methodCheck=binding=>{for(let i=0;i<binding.chain.length;i++){const node=binding.chain[i];if(i>0&&Object.getPrototypeOf(binding.chain[i-1])!==node)bad();if(i===binding.chain.length-1){if(own(node,binding.key)!==binding.fn)bad();}else if(Object.hasOwn(node,binding.key))bad();}};
const set=own(root,'setTimeout');clear=own(root,'clearTimeout');if(typeof set!=='function'||typeof clear!=='function')bad();
${buildCurrentProjectOnlySymbolGuard()}
const host=projectOnly.host,bus=own(host,'messageBus'),rpc=method(bus,'rpcCall'),edaOwner=eda;
const same=()=>{projectOnly.check();methodCheck(rpc);if(expired||own(host,'messageBus')!==bus||eda!==edaOwner||own(edaOwner,'extensionUuid')!=='7e06d286b1ac846ef7eab9c7f2a9ee40'||own(root,'setTimeout')!==set||own(root,'clearTimeout')!==clear)bad();};
const call=async(topic,args)=>{same();const raw=await apply(rpc.fn,bus,[topic,args,0]);same();return plain(own(plain(raw),'message'));};
const projectMetadata=async()=>{
 const value=await call('/PrjDB/project/getData',[target.projectUuid]);same();
 if(own(value,'uuid')!==target.projectUuid||own(value,'currentBranch')!==target.branchUuid||own(value,'isV2Format')!==false)bad();
 for(const key of ['archive','store','cbb_project']){const flag=own(value,key,true);if(flag!==undefined&&flag!==false&&flag!==null&&flag!==0)bad();}
 const ownerUuid=own(plain(own(value,'owner')),'uuid');if(typeof ownerUuid!=='string'||!/^[a-f0-9]{32}$/.test(ownerUuid))bad();return ownerUuid;
};
const metadata=(raw,uuid,ownerUuid)=>{
 const value=plain(raw);if(own(value,'uuid')!==uuid||own(value,'project_uuid')!==target.projectUuid||own(value,'docType')!==3)bad();
 const parentUuid=text(own(value,'parent_uuid'),32);if(parentUuid!==''&&!/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/.test(parentUuid))bad();
 return{uuid,projectUuid:target.projectUuid,ownerUuid,title:text(own(value,'title'),512),displayTitle:text(own(value,'display_title'),512),
  parentUuid,source:text(own(value,'source'),4096),version:text(own(value,'version'),128),boardUuid:text(own(value,'board'),128),
  ticket:integer(own(value,'ticket')),updateTime:integer(own(value,'updateTime'),8640000000000000),docType:3};
};
const sample=async()=>{
 const ownerUuid=await projectMetadata();same();
 ${inventory ? `const map=await call('/PrjDB/pcb/getAllKVDatas',[target.projectUuid]);same();const keys=Reflect.ownKeys(map);
 if(keys.length>${CURRENT_PROJECT_PCB_METADATA_MAX_ITEMS}||keys.some(key=>typeof key!=='string'||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/.test(key)))bad();keys.sort();
 const pcbs=keys.map(uuid=>metadata(own(map,uuid),uuid,ownerUuid));
 const result={ownerUuid,pcbs,observedPcbCount:pcbs.length,completeNativePcbMapObserved:true};
 if(new TextEncoder().encode(JSON.stringify(result)).byteLength>${CURRENT_PROJECT_PCB_METADATA_MAX_BYTES})bad();` : `const result=metadata(await call('/PrjDB/pcb/getData',[target.pcbUuid,target.projectUuid]),target.pcbUuid,ownerUuid);same();`}
 if(await projectMetadata()!==ownerUuid)bad();same();return result;
};
const run=async()=>{
 const first=await sample(),seal=JSON.stringify(first);const second=await sample();same();if(JSON.stringify(second)!==seal)bad();
 const result={ok:true,kind:'current-project-pcb-metadata-observation',method:${JSON.stringify(request.method)},target,${inventory ? "...first" : "value:first"},samples:2,currentTabId:projectOnly.currentTabId,
  implementationKind:'native-task-equivalent',noEditorTabsObserved:true,hiddenEditorsAbsentObserved:true,dirtyTabsAbsentObserved:true,cachedProjectReadOnlyAbsentObserved:true,concurrentStrictModeAbsentObserved:true,
  workerIdentityVerified:false,cadAuthority:false,persistenceVerified:false,sourceMembershipVerified:false,permissionVerified:false,mutationDispatched:false,explicitSaveDispatched:false};
 const json=JSON.stringify(result),utf8Bytes=new TextEncoder().encode(json).byteLength,envelope={schema:${JSON.stringify(EXACT_READ_ENVELOPE_SCHEMA)},utf8Bytes,json};
 if(utf8Bytes>${CURRENT_PROJECT_PCB_METADATA_MAX_BYTES}||new TextEncoder().encode(JSON.stringify(envelope)).byteLength>${CURRENT_PROJECT_PCB_METADATA_MAX_BYTES})bad();return envelope;
};
same();const timeout=new Promise((resolve,reject)=>{timer=apply(set,root,[()=>{expired=true;reject(new Error('CURRENT_PROJECT_PCB_METADATA_READ_FAILED'));},${CURRENT_PROJECT_PCB_METADATA_TIMEOUT_MS}]);});
return await Promise.race([run(),timeout]);
}catch{throw new Error('CURRENT_PROJECT_PCB_METADATA_READ_FAILED');}
finally{if(timer!==undefined&&typeof clear==='function'){try{Reflect.apply(clear,globalThis,[timer]);}catch{throw new Error('CURRENT_PROJECT_PCB_METADATA_READ_FAILED');}}}`;
}
