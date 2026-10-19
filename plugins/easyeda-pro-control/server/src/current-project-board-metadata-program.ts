import { CURRENT_PROJECT_BOARD_METADATA_MAX_BYTES, CURRENT_PROJECT_BOARD_METADATA_MAX_ITEMS, CURRENT_PROJECT_BOARD_METADATA_TIMEOUT_MS, parseCurrentProjectBoardMetadataRequest } from "./current-project-board-metadata.ts";
import { buildCurrentProjectOnlySymbolGuard } from "./current-project-only-symbol-guard.ts";
import { EXACT_READ_ENVELOPE_SCHEMA } from "./exact-readers.ts";

/** Fixed no-editor reader. MGR005584e0 BOARD.GET2057426/GET_ALL_KV2057792
 * qualify the project before calling WORKERb849bd12 Cg.get1970856 and
 * getAllKVData1974138. These return only uuid/title/zIndex/ticket and exclude
 * deleted boards. No canvas, children, name lookup or public tree is requested.
 */
export function buildCurrentProjectBoardMetadataProgram(input: unknown): string {
  const request = parseCurrentProjectBoardMetadataRequest(input), selected = request.method === "eda.dmt_Board.getBoardInfo";
  return `let timer,clear;
try{
const root=globalThis,apply=Reflect.apply,target=${JSON.stringify(request.target)};let expired=false;
const bad=()=>{throw new Error('CURRENT_PROJECT_BOARD_METADATA_READ_FAILED');};
const own=(owner,key,optional=false)=>{if(owner===null||(typeof owner!=='object'&&typeof owner!=='function'))bad();const d=Object.getOwnPropertyDescriptor(owner,key);if(!d){if(optional&&!(key in owner))return undefined;bad();}if(!Object.hasOwn(d,'value'))bad();return d.value;};
const plain=value=>{if(value===null||typeof value!=='object'||Array.isArray(value)||Object.getPrototypeOf(value)!==Object.prototype)bad();return value;};
const exact=(value,keys)=>{plain(value);const actual=Reflect.ownKeys(value);if(actual.length!==keys.length||actual.some(key=>!keys.includes(key)))bad();};
const text=(value,max)=>{if(typeof value!=='string'||value.length>max)bad();return value;};
const finite=value=>{if(typeof value!=='number'||!Number.isFinite(value)||Math.abs(value)>Number.MAX_SAFE_INTEGER||Object.is(value,-0))bad();return value;};
const integer=value=>{finite(value);if(!Number.isSafeInteger(value)||value<0)bad();return value;};
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
const metadata=(value,uuid)=>{
 exact(value,['uuid','title','zIndex','ticket']);if(own(value,'uuid')!==uuid)bad();
 return{uuid,title:text(own(value,'title'),512),zIndex:finite(own(value,'zIndex')),ticket:integer(own(value,'ticket'))};
};
const sample=async()=>{
 const ownerUuid=await projectMetadata();same();
 const map=await call('/PrjDB/board/getAllKVData',[target.projectUuid]);same();const keys=Reflect.ownKeys(map);
 if(keys.length>${CURRENT_PROJECT_BOARD_METADATA_MAX_ITEMS}||keys.some(key=>typeof key!=='string'||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/.test(key)))bad();keys.sort();
 const boards=keys.map(uuid=>metadata(own(map,uuid),uuid)),completeMap={};for(const value of boards)completeMap[value.uuid]=value;
 if(new TextEncoder().encode(JSON.stringify(completeMap)).byteLength>${CURRENT_PROJECT_BOARD_METADATA_MAX_BYTES})bad();
 ${selected ? `const value=boards.find(board=>board.uuid===target.boardUuid);if(value===undefined)bad();
 const individual=metadata(await call('/PrjDB/board/getData',[target.boardUuid,target.projectUuid]),target.boardUuid);same();
 if(JSON.stringify(individual)!==JSON.stringify(value))bad();` : ""}
 if(await projectMetadata()!==ownerUuid)bad();same();return{ownerUuid,boards,observedBoardCount:boards.length};
};
const run=async()=>{
 const first=await sample(),seal=JSON.stringify(first);const second=await sample();same();if(JSON.stringify(second)!==seal)bad();
 const result={ok:true,kind:'current-project-board-metadata-observation',method:${JSON.stringify(request.method)},target,ownerUuid:first.ownerUuid,
  observedBoardCount:first.observedBoardCount,completeNativeBoardMapObserved:true,${selected ? "value:first.boards.find(board=>board.uuid===target.boardUuid),selectedGetMatchesMapObserved:true" : "boards:first.boards"},samples:2,currentTabId:projectOnly.currentTabId,
  implementationKind:'native-task-equivalent',noEditorTabsObserved:true,hiddenEditorsAbsentObserved:true,dirtyTabsAbsentObserved:true,cachedProjectReadOnlyAbsentObserved:true,concurrentStrictModeAbsentObserved:true,
  workerIdentityVerified:false,cadAuthority:false,persistenceVerified:false,sourceMembershipVerified:false,childMembershipVerified:false,publicWrapperParityVerified:false,permissionVerified:false,mutationDispatched:false,explicitSaveDispatched:false};
 const json=JSON.stringify(result),utf8Bytes=new TextEncoder().encode(json).byteLength,envelope={schema:${JSON.stringify(EXACT_READ_ENVELOPE_SCHEMA)},utf8Bytes,json};
 if(utf8Bytes>${CURRENT_PROJECT_BOARD_METADATA_MAX_BYTES}||new TextEncoder().encode(JSON.stringify(envelope)).byteLength>${CURRENT_PROJECT_BOARD_METADATA_MAX_BYTES})bad();return envelope;
};
same();const timeout=new Promise((resolve,reject)=>{timer=apply(set,root,[()=>{expired=true;reject(new Error('CURRENT_PROJECT_BOARD_METADATA_READ_FAILED'));},${CURRENT_PROJECT_BOARD_METADATA_TIMEOUT_MS}]);});
return await Promise.race([run(),timeout]);
}catch{throw new Error('CURRENT_PROJECT_BOARD_METADATA_READ_FAILED');}
finally{if(timer!==undefined&&typeof clear==='function'){try{Reflect.apply(clear,globalThis,[timer]);}catch{throw new Error('CURRENT_PROJECT_BOARD_METADATA_READ_FAILED');}}}`;
}
