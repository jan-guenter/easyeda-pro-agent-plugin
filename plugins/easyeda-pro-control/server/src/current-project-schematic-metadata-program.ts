import { CURRENT_PROJECT_SCHEMATIC_METADATA_MAX_BYTES, CURRENT_PROJECT_SCHEMATIC_METADATA_MAX_ITEMS,
  CURRENT_PROJECT_SCHEMATIC_METADATA_TIMEOUT_MS, parseCurrentProjectSchematicMetadataRequest } from "./current-project-schematic-metadata.ts";
import { buildCurrentProjectOnlySymbolGuard } from "./current-project-only-symbol-guard.ts";
import { EXACT_READ_ENVELOPE_SCHEMA } from "./exact-readers.ts";

/** Metadata-only native equivalent. MGR005584e0 GET2058248/GET_ALL_KV2058801
 * and SHEET GET_ALL_KV2060322 delegate existing WORKERb849bd12 Dg1911033/
 * 1912957 and sheet1919022/1921285. Native array fallbacks are not used.
 * No SCH AST observation, name availability, clock, canvas or write preflight.
 */
export function buildCurrentProjectSchematicMetadataProgram(input: unknown): string {
  const request = parseCurrentProjectSchematicMetadataRequest(input);
  return `let timer,clear;
try{
const root=globalThis,apply=Reflect.apply,target=${JSON.stringify(request.target)};let expired=false;
const bad=()=>{throw new Error('CURRENT_PROJECT_SCHEMATIC_METADATA_READ_FAILED');};
const own=(owner,key,optional=false)=>{if(owner===null||(typeof owner!=='object'&&typeof owner!=='function'))bad();const d=Object.getOwnPropertyDescriptor(owner,key);if(!d){if(optional&&!(key in owner))return undefined;bad();}if(!Object.hasOwn(d,'value'))bad();return d.value;};
const plain=value=>{if(value===null||typeof value!=='object'||Array.isArray(value)||Object.getPrototypeOf(value)!==Object.prototype)bad();return value;};
const text=(value,max)=>{if(typeof value!=='string'||value.length>max)bad();return value;};
const finite=value=>{if(typeof value!=='number'||!Number.isFinite(value)||Object.is(value,-0))bad();return value;};
const integer=(value,max=Number.MAX_SAFE_INTEGER)=>{finite(value);if(!Number.isSafeInteger(value)||value<0||value>max)bad();return value;};
const identifier=value=>{if(typeof value!=='string'||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/.test(value))bad();return value;};
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
const common=(raw,uuid)=>{const value=plain(raw);if(own(value,'uuid')!==uuid||own(value,'project_uuid')!==target.projectUuid)bad();
 return{uuid,source:text(own(value,'source'),4096),version:text(own(value,'version'),128),ticket:integer(own(value,'ticket')),updateTime:integer(own(value,'updateTime'),8640000000000000)};};
const schematic=(raw,uuid)=>({...common(raw,uuid),name:text(own(raw,'name'),512),displayName:text(own(raw,'display_name'),512),boardUuid:text(own(raw,'board'),128)});
const sheet=(raw,uuid)=>{const value=common(raw,uuid);if(own(raw,'docType')!==1)bad();return{...value,schematicUuid:identifier(own(raw,'schematic_uuid')),
 title:text(own(raw,'title'),512),displayTitle:text(own(raw,'display_title'),512),docType:1,zIndex:finite(own(raw,'zIndex'))};};
const inventory=(raw,project)=>{const map=plain(raw),keys=Reflect.ownKeys(map);if(keys.length>${CURRENT_PROJECT_SCHEMATIC_METADATA_MAX_ITEMS}||keys.some(key=>typeof key!=='string'))bad();keys.forEach(identifier);keys.sort();
 const values=keys.map(uuid=>project(own(map,uuid),uuid));if(new TextEncoder().encode(JSON.stringify(values)).byteLength>${CURRENT_PROJECT_SCHEMATIC_METADATA_MAX_BYTES})bad();return values;};
const sample=async()=>{
 const ownerUuid=await projectMetadata(),schematics=inventory(await call('/PrjDB/schematic/getAllKVDatas',[target.projectUuid]),schematic);same();
 const sheets=inventory(await call('/PrjDB/sheet/getAllKVDatas',[undefined,target.projectUuid]),sheet);same();
 if(sheets.some(child=>schematics.some(parent=>parent.uuid===child.uuid)||!schematics.some(parent=>parent.uuid===child.schematicUuid)))bad();
 ${request.method === "eda.dmt_Schematic.getSchematicInfo" ? "const selected=schematics.find(value=>value.uuid===target.schematicUuid);if(!selected)bad();const exact=schematic(await call('/PrjDB/schematic/getData',[target.schematicUuid,target.projectUuid]),target.schematicUuid);same();if(JSON.stringify(exact)!==JSON.stringify(selected))bad();" : ""}
 if(await projectMetadata()!==ownerUuid)bad();same();const complete={ownerUuid,schematics:schematics.map(value=>({...value,children:sheets.filter(child=>child.schematicUuid===value.uuid)})),observedSchematicCount:schematics.length,observedSheetCount:sheets.length};
 if(new TextEncoder().encode(JSON.stringify(complete)).byteLength>${CURRENT_PROJECT_SCHEMATIC_METADATA_MAX_BYTES})bad();return complete;
};
const run=async()=>{
 const first=await sample(),seal=JSON.stringify(first),second=await sample();same();if(JSON.stringify(second)!==seal)bad();
 const result={ok:true,kind:'current-project-schematic-metadata-observation',method:${JSON.stringify(request.method)},target,...first,
 schematics:${request.method === "eda.dmt_Schematic.getSchematicInfo" ? "first.schematics.filter(value=>value.uuid===target.schematicUuid)" : "first.schematics"},samples:2,currentTabId:projectOnly.currentTabId,
 implementationKind:'native-task-equivalent',completeNativeSchematicMapObserved:true,completeNativeSheetMapObserved:true,parentMembershipObserved:true,
 noEditorTabsObserved:true,hiddenEditorsAbsentObserved:true,dirtyTabsAbsentObserved:true,cachedProjectReadOnlyAbsentObserved:true,concurrentStrictModeAbsentObserved:true,
 workerIdentityVerified:false,cadAuthority:false,persistenceVerified:false,sourceMembershipVerified:false,permissionVerified:false,startupCompletionVerified:false,mutationDispatched:false,explicitSaveDispatched:false};
 const json=JSON.stringify(result),utf8Bytes=new TextEncoder().encode(json).byteLength,envelope={schema:${JSON.stringify(EXACT_READ_ENVELOPE_SCHEMA)},utf8Bytes,json};
 if(utf8Bytes>${CURRENT_PROJECT_SCHEMATIC_METADATA_MAX_BYTES}||new TextEncoder().encode(JSON.stringify(envelope)).byteLength>${CURRENT_PROJECT_SCHEMATIC_METADATA_MAX_BYTES})bad();return envelope;
};
same();const timeout=new Promise((resolve,reject)=>{timer=apply(set,root,[()=>{expired=true;reject(new Error('CURRENT_PROJECT_SCHEMATIC_METADATA_READ_FAILED'));},${CURRENT_PROJECT_SCHEMATIC_METADATA_TIMEOUT_MS}]);});
return await Promise.race([run(),timeout]);
}catch{throw new Error('CURRENT_PROJECT_SCHEMATIC_METADATA_READ_FAILED');}
finally{if(timer!==undefined&&typeof clear==='function'){try{Reflect.apply(clear,globalThis,[timer]);}catch{throw new Error('CURRENT_PROJECT_SCHEMATIC_METADATA_READ_FAILED');}}}`;
}
