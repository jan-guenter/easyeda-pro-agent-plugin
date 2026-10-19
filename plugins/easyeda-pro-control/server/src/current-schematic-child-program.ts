import { buildCurrentProjectOnlySymbolGuard } from "./current-project-only-symbol-guard.ts";
import { buildCurrentSchematicChildGuard } from "./current-schematic-child-guard.ts";
import { parseCurrentSchematicRenamePreflightRequest } from "./current-schematic-rename-preflight.ts";
import { EXACT_READ_ENVELOPE_SCHEMA } from "./exact-readers.ts";

export const CURRENT_SCHEMATIC_CHILD_TIMEOUT_MS = 10_000;
export const CURRENT_SCHEMATIC_CHILD_MAX_BYTES = 524_288;

/** Dormant fixed reader. MGR005584e0@2060322 forwards [schematicUuid,projectUuid]
 * to WORKERb849bd12@1921285. Undefined filter reads every active sheet through
 * get@1919022; the array route's caught-error fallback is deliberately absent.
 * The snapshot retains SCH holders across each await, not a producer or queue
 * token. No reader result authorizes a future rename or claims startup success.
 * Unchanged child spelling permits ASCII capital I only when the actual getter
 * and both retained ASTs match the explicit ASCII-fold projection. This is not
 * a native-locale claim; dotless-I output refuses before any writer.
 */
export function buildCurrentSchematicChildProgram(input: unknown): string {
  const { target } = parseCurrentSchematicRenamePreflightRequest(input);
  return `const root=globalThis,apply=Reflect.apply,target=${JSON.stringify(target)};let expired=false,timer,clear,stage='HOST';
const bad=()=>{throw new Error('CURRENT_SCHEMATIC_CHILD_REFUSED:'+stage);};
const own=(owner,key,optional=false)=>{if(owner===null||(typeof owner!=='object'&&typeof owner!=='function'))bad();const d=Object.getOwnPropertyDescriptor(owner,key);if(!d){if(optional&&!(key in owner))return undefined;bad();}if(!Object.hasOwn(d,'value'))bad();return d.value;};
const plain=value=>{if(value===null||typeof value!=='object'||Array.isArray(value)||Object.getPrototypeOf(value)!==Object.prototype)bad();return value;};
const method=(owner,key)=>{const chain=[];let node=owner;for(let i=0;i<4;i++){if(node===null||(typeof node!=='object'&&typeof node!=='function'))bad();chain.push(node);const d=Object.getOwnPropertyDescriptor(node,key);if(d){if(!Object.hasOwn(d,'value')||typeof d.value!=='function')bad();return{owner,key,chain,fn:d.value};}node=Object.getPrototypeOf(node);}bad();};
const methodCheck=binding=>{for(let i=0;i<binding.chain.length;i++){const node=binding.chain[i];if(i>0&&Object.getPrototypeOf(binding.chain[i-1])!==node)bad();if(i===binding.chain.length-1){if(own(node,binding.key)!==binding.fn)bad();}else if(Object.hasOwn(node,binding.key))bad();}};
const finite=value=>{if(typeof value!=='number'||!Number.isFinite(value)||Object.is(value,-0))bad();return value;};
const integer=value=>{finite(value);if(!Number.isSafeInteger(value)||value<0)bad();return value;};
const id=value=>{if(typeof value!=='string'||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/.test(value))bad();return value;};
const title=value=>{if(typeof value!=='string'||value.length<1||value.length>512||value.trim()!==value||!/^[\\x20-\\x7e]+$/.test(value))bad();return value;};
try{
 const set=own(root,'setTimeout');clear=own(root,'clearTimeout');if(typeof set!=='function'||typeof clear!=='function')bad();
 ${buildCurrentProjectOnlySymbolGuard()}
 stage='HOLDERS';${buildCurrentSchematicChildGuard()}
 const host=projectOnly.host,bus=own(host,'messageBus'),rpc=method(bus,'rpcCall'),edaOwner=eda;
 const same=()=>{projectOnly.check();schematicChildren.check();methodCheck(rpc);if(expired||own(host,'messageBus')!==bus||eda!==edaOwner||own(edaOwner,'extensionUuid')!=='7e06d286b1ac846ef7eab9c7f2a9ee40'||own(root,'setTimeout')!==set||own(root,'clearTimeout')!==clear)bad();};
 const call=async(topic,args)=>{same();const response=await apply(rpc.fn,bus,[topic,args,0]);same();return own(plain(response),'message');};
 const project=async()=>{stage='PROJECT';const value=plain(await call('/PrjDB/project/getData',[target.projectUuid]));same();
  if(own(value,'uuid')!==target.projectUuid||own(value,'currentBranch')!==target.branchUuid||own(value,'isV2Format')!==false||own(plain(own(value,'owner')),'uuid')!==target.ownerUuid)bad();
  for(const key of ['archive','store','cbb_project']){const flag=own(value,key,true);if(flag!==undefined&&flag!==false&&flag!==null&&flag!==0)bad();}};
 const children=raw=>{const map=plain(raw),keys=Reflect.ownKeys(map);if(keys.length<1||keys.length>128||keys.some(key=>typeof key!=='string'))bad();keys.forEach(id);keys.sort();const result={};
  for(const uuid of keys){const value=plain(own(map,uuid));if(own(value,'uuid')!==uuid||own(value,'project_uuid')!==target.projectUuid||own(value,'docType')!==1||own(value,'source')!=='')bad();
   const lower=title(own(value,'title')),display=title(own(value,'display_title')),version=own(value,'version'),updateTime=integer(own(value,'updateTime'));
   if(lower!==display.toLowerCase()||typeof version!=='string'||version.length<1||version.length>128||updateTime<1||updateTime>8640000000000000)bad();
   result[uuid]={uuid,project_uuid:target.projectUuid,schematic_uuid:id(own(value,'schematic_uuid')),title:lower,display_title:display,docType:1,zIndex:finite(own(value,'zIndex')),source:'',version,updateTime,ticket:integer(own(value,'ticket'))};}
  return result;};
 const sample=async()=>{await project();stage='CHILDREN';const childKv=children(await call('/PrjDB/sheet/getAllKVDatas',[undefined,target.projectUuid]));same();await project();same();return{childKv,...schematicChildren.read()};};
 const run=async()=>{const first=await sample(),second=await sample();same();if(JSON.stringify(first)!==JSON.stringify(second))bad();
  const value={profile:'private.current-schematic-child-roster-observation.v1',target,samples:[first,second]},json=JSON.stringify(value),utf8Bytes=new TextEncoder().encode(json).byteLength;
  const envelope={schema:${JSON.stringify(EXACT_READ_ENVELOPE_SCHEMA)},utf8Bytes,json};if(utf8Bytes>${CURRENT_SCHEMATIC_CHILD_MAX_BYTES}||new TextEncoder().encode(JSON.stringify(envelope)).byteLength>${CURRENT_SCHEMATIC_CHILD_MAX_BYTES})bad();return envelope;};
 same();const timeout=new Promise((resolve,reject)=>{timer=apply(set,root,[()=>{expired=true;stage='TIMEOUT';reject(new Error('CURRENT_SCHEMATIC_CHILD_REFUSED:TIMEOUT'));},${CURRENT_SCHEMATIC_CHILD_TIMEOUT_MS}]);});return await Promise.race([run(),timeout]);
}catch{throw new Error('CURRENT_SCHEMATIC_CHILD_REFUSED:'+stage);}
finally{if(timer!==undefined){try{apply(clear,root,[timer]);}catch{throw new Error('CURRENT_SCHEMATIC_CHILD_REFUSED:CLEANUP');}}}`;
}
