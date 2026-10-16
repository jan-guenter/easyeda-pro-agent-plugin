/** Fixed SCH startup-holder check for the fresh, no-editor symbol route.
 * Requires root/apply/own/bad/target/startupExpected/projectOnly. No RPC, source
 * getter, collection getter, Save, watcher or timer registration is performed.
 * In particular, SCH.parts sorts its backing array and is never called here.
 */
export function buildCurrentSymbolStartupGuard(): string {
  return String.raw`
const startup=(()=>{
 const sch=own(root,'SCH'),vars=own(sch,'gVars'),project=own(vars,'projectMgr'),cache=own(project,'componentCache');
 const descriptor=Object.getOwnPropertyDescriptor(sch,'docMemoryManager');
 if(!descriptor||typeof descriptor.get!=='function'||descriptor.set!==undefined)bad();
 const getManager=descriptor.get,manager=apply(getManager,sch,[]),docs=own(manager,'docMap'),fetches=own(manager,'_docFetchPromiseMap');
 const templates=own(cache,'symbolTemplate'),runner=own(vars,'actionRunner'),realtime=own(runner,'realTimeSyncActionManager');
 const runnerSet=own(realtime,'_runnerSet'),runnerIds=own(runnerSet,'_idMap'),runTimer=own(realtime,'_runTimer');
 const MapOwner=own(root,'Map'),mapPrototype=own(MapOwner,'prototype'),mapSize=Object.getOwnPropertyDescriptor(mapPrototype,'size')?.get;
 if(typeof mapSize!=='function')bad();
 const emptyMap=value=>{if(Object.getPrototypeOf(value)!==mapPrototype||Reflect.ownKeys(value).length!==0||apply(mapSize,value,[])!==0)bad();};
 const plain=value=>{if(value===null||typeof value!=='object'||Array.isArray(value)||Object.getPrototypeOf(value)!==Object.prototype)bad();return value;};
 const noCanvas=value=>{const canvas=own(value,'_canvas',true);if(canvas!==undefined&&canvas!==null)bad();};
 const base=()=>{
  projectOnly.check();
  const currentDescriptor=Object.getOwnPropertyDescriptor(sch,'docMemoryManager');
  if(own(root,'SCH')!==sch||own(sch,'gVars')!==vars||own(vars,'projectMgr')!==project||own(project,'uuid')!==target.projectUuid||own(project,'componentCache')!==cache||own(cache,'projectMgr')!==project||own(cache,'symbolTemplate')!==templates)bad();
  if(currentDescriptor?.get!==getManager||currentDescriptor.set!==undefined||apply(getManager,sch,[])!==manager||own(manager,'docMap')!==docs||own(manager,'_docFetchPromiseMap')!==fetches)bad();
  if(own(root,'Map')!==MapOwner||own(MapOwner,'prototype')!==mapPrototype||Object.getOwnPropertyDescriptor(mapPrototype,'size')?.get!==mapSize)bad();
  if(own(vars,'actionRunner')!==runner||own(runner,'_currentAction')!==null||own(runner,'realTimeSyncActionManager')!==realtime||own(realtime,'transactionRunner')!==runner||own(realtime,'_isRunning')!==false)bad();
  if(own(realtime,'_runnerSet')!==runnerSet||own(runnerSet,'_idMap')!==runnerIds||own(realtime,'_runTimer')!==runTimer||own(runTimer,'_mark')!==-1)bad();emptyMap(runnerIds);
  const waiting=own(realtime,'_localActionOnceDidRunSubscription',true);if(waiting!==undefined&&waiting!==null)bad();
  emptyMap(docs);emptyMap(fetches);
 };
 const sample=()=>{
  base();const owners=[sch,vars,project,cache,templates,runner,realtime,runnerSet,runnerIds,runTimer,docs,fetches],keys=Reflect.ownKeys(plain(templates));
  if(keys.length!==startupExpected.templates.length||keys.some(key=>typeof key!=='string'||!startupExpected.templates.some(item=>item.uuid===key)))bad();
  for(const expected of startupExpected.templates){
   const doc=own(templates,expected.uuid),consistency=own(doc,'consistencyImpl'),handler=own(consistency,'decodeAndRealTimeSyncHandler'),nativeManager=own(consistency,'manager'),nativeBase=own(nativeManager,'base'),update=own(handler,'docUpdateImpl'),tasks=own(handler,'_realTimeSyncTask'),shapes=own(doc,'shapeManager');
   owners.push(doc,consistency,handler,nativeManager,nativeBase,update,tasks,shapes);
   if(own(doc,'uuid')!==expected.uuid||own(doc,'docType')!==expected.docType||own(doc,'path')!==target.projectUuid||own(doc,'project_uuid')!==target.projectUuid||own(doc,'projectMgr')!==project)bad();noCanvas(doc);
   if(own(consistency,'docManager')!==doc||own(consistency,'handler')!==handler||own(handler,'consistencyImpl')!==consistency||own(handler,'_state')!=='initialized'||own(handler,'isPaused')!==false)bad();
   const pending=plain(own(nativeBase,'pendCache')),taskMap=own(update,'taskMap'),parentMap=own(tasks,'_parentChildIdMapFromRemote');owners.push(pending,taskMap,parentMap);
   if(own(nativeBase,'uuid')!==expected.uuid||own(nativeBase,'path')!==target.projectUuid||own(nativeBase,'isProject')!==true||own(nativeBase,'isInit')!==true||own(nativeBase,'isInitIng')!==false||own(nativeBase,'isDestroy')!==false||own(nativeBase,'pendTimer')!==null||own(nativeBase,'pendPromise')!==null||own(nativeBase,'pendCacheLength')!==0||Reflect.ownKeys(pending).length!==0)bad();
   emptyMap(taskMap);emptyMap(parentMap);
   if(own(tasks,'handler')!==handler||own(tasks,'shouldCommitModelChanged')!==false||own(tasks,'existLocalSaved')!==false||own(tasks,'existRemoteSaved')!==false||own(shapes,'docManager')!==doc)bad();
   const parts=own(shapes,'_parts'),partMap=plain(own(shapes,'_partIdMap'));
   if(!Array.isArray(parts)||Object.getPrototypeOf(parts)!==Array.prototype||Reflect.ownKeys(parts).length!==2||own(parts,'length')!==1||Reflect.ownKeys(partMap).length!==1)bad();
   const part=own(parts,'0');if(own(partMap,expected.partId)!==part||own(part,'partId')!==expected.partId)bad();
   owners.push(parts,partMap,part);
  }
  base();return owners;
 };
 const original=sample();
 const check=()=>{const current=sample();if(current.length!==original.length||current.some((value,index)=>value!==original[index]))bad();};
 return{check};
})();`;
}
