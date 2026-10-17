export const CURRENT_SYMBOL_STARTUP_STAGES = Object.freeze([
  "project-only-context", "sch-holder", "scheduler", "cache", "template", "native-queue", "parts",
] as const);
type StartupStage = typeof CURRENT_SYMBOL_STARTUP_STAGES[number];

/** Fixed SCH startup-holder check for the fresh, no-editor symbol route.
 * Requires root/apply/own/bad/target/startupExpected/projectOnly. No RPC, source
 * getter, collection getter, Save, watcher or timer registration is performed.
 * In particular, SCH.parts sorts its backing array and is never called here.
 * The separate observation and writer opt into lexical startupStage diagnostics.
 * Instrumentation changes only fixed labels, never the predicates or reads.
 */
export function buildCurrentSymbolStartupGuard(diagnosticStages = false): string {
  const at = (stage: StartupStage): string => diagnosticStages ? `startupStage='${stage}';` : "";
  return String.raw`
const startup=(()=>{
 ${at("sch-holder")}
 const sch=own(root,'SCH'),vars=own(sch,'gVars'),project=own(vars,'projectMgr'),cache=own(project,'componentCache');
 const descriptor=Object.getOwnPropertyDescriptor(sch,'docMemoryManager');
 if(!descriptor||typeof descriptor.get!=='function'||descriptor.set!==undefined)bad();
 const getManager=descriptor.get,manager=apply(getManager,sch,[]),docs=own(manager,'docMap'),fetches=own(manager,'_docFetchPromiseMap');
 ${at("cache")}
 const templates=own(cache,'symbolTemplate');
 ${at("scheduler")}
 const runner=own(vars,'actionRunner'),realtime=own(runner,'realTimeSyncActionManager');
 const runnerSet=own(realtime,'_runnerSet'),runnerIds=own(runnerSet,'_idMap'),runTimer=own(realtime,'_runTimer');
 ${at("cache")}
 const MapOwner=own(root,'Map'),mapPrototype=own(MapOwner,'prototype'),mapSize=Object.getOwnPropertyDescriptor(mapPrototype,'size')?.get;
 if(typeof mapSize!=='function')bad();
 const emptyMap=value=>{if(Object.getPrototypeOf(value)!==mapPrototype||Reflect.ownKeys(value).length!==0||apply(mapSize,value,[])!==0)bad();};
 const plain=value=>{if(value===null||typeof value!=='object'||Array.isArray(value)||Object.getPrototypeOf(value)!==Object.prototype)bad();return value;};
 const noCanvas=value=>{const canvas=own(value,'_canvas',true);if(canvas!==undefined&&canvas!==null)bad();};
 const base=()=>{
  ${at("project-only-context")}
  projectOnly.check();
  ${at("sch-holder")}
  const currentDescriptor=Object.getOwnPropertyDescriptor(sch,'docMemoryManager');
  if(own(root,'SCH')!==sch||own(sch,'gVars')!==vars||own(vars,'projectMgr')!==project||own(project,'uuid')!==target.projectUuid||own(project,'componentCache')!==cache||own(cache,'projectMgr')!==project||own(cache,'symbolTemplate')!==templates)bad();
  if(currentDescriptor?.get!==getManager||currentDescriptor.set!==undefined||apply(getManager,sch,[])!==manager||own(manager,'docMap')!==docs||own(manager,'_docFetchPromiseMap')!==fetches)bad();
  if(own(root,'Map')!==MapOwner||own(MapOwner,'prototype')!==mapPrototype||Object.getOwnPropertyDescriptor(mapPrototype,'size')?.get!==mapSize)bad();
  ${at("scheduler")}
  if(own(vars,'actionRunner')!==runner||own(runner,'_currentAction')!==null||own(runner,'realTimeSyncActionManager')!==realtime||own(realtime,'transactionRunner')!==runner||own(realtime,'_isRunning')!==false)bad();
  if(own(realtime,'_runnerSet')!==runnerSet||own(runnerSet,'_idMap')!==runnerIds||own(realtime,'_runTimer')!==runTimer||own(runTimer,'_mark')!==-1)bad();emptyMap(runnerIds);
  const waiting=own(realtime,'_localActionOnceDidRunSubscription',true);if(waiting!==undefined&&waiting!==null)bad();
  ${at("cache")}
  emptyMap(docs);emptyMap(fetches);
 };
 const sample=()=>{
  base();const owners=[sch,vars,project,cache,templates,runner,realtime,runnerSet,runnerIds,runTimer,docs,fetches],keys=Reflect.ownKeys(plain(templates));
  if(keys.length!==startupExpected.templates.length||keys.some(key=>typeof key!=='string'||!startupExpected.templates.some(item=>item.uuid===key)))bad();
  for(const expected of startupExpected.templates){
   ${at("template")}
   const doc=own(templates,expected.uuid),consistency=own(doc,'consistencyImpl'),handler=own(consistency,'decodeAndRealTimeSyncHandler');
   ${at("native-queue")}
   // The pinned manager owns _base; its inherited base getter is never invoked.
   const nativeManager=own(consistency,'manager'),nativeBase=own(nativeManager,'_base'),update=own(handler,'docUpdateImpl'),tasks=own(handler,'_realTimeSyncTask');
   ${at("parts")}
   const shapes=own(doc,'shapeManager');
   owners.push(doc,consistency,handler,nativeManager,nativeBase,update,tasks,shapes);
   ${at("template")}
   if(own(doc,'uuid')!==expected.uuid||own(doc,'docType')!==expected.docType||own(doc,'path')!==target.projectUuid||own(doc,'project_uuid')!==target.projectUuid||own(doc,'projectMgr')!==project)bad();noCanvas(doc);
   if(own(consistency,'docManager')!==doc||own(consistency,'handler')!==handler||own(handler,'consistencyImpl')!==consistency||own(handler,'_state')!=='initialized'||own(handler,'isPaused')!==false)bad();
   ${at("native-queue")}
   const pending=plain(own(nativeBase,'pendCache')),taskMap=own(update,'taskMap'),parentMap=own(tasks,'_parentChildIdMapFromRemote');owners.push(pending,taskMap,parentMap);
   if(own(nativeBase,'uuid')!==expected.uuid||own(nativeBase,'path')!==target.projectUuid||own(nativeBase,'isProject')!==true||own(nativeBase,'isInit')!==true||own(nativeBase,'isInitIng')!==false||own(nativeBase,'isDestroy')!==false||own(nativeBase,'pendTimer')!==null||own(nativeBase,'pendPromise')!==null||own(nativeBase,'pendCacheLength')!==0||Reflect.ownKeys(pending).length!==0)bad();
   emptyMap(taskMap);emptyMap(parentMap);
   if(own(tasks,'handler')!==handler||own(tasks,'shouldCommitModelChanged')!==false||own(tasks,'existLocalSaved')!==false||own(tasks,'existRemoteSaved')!==false||own(shapes,'docManager')!==doc)bad();
   ${at("parts")}
   const parts=own(shapes,'_parts'),partMap=plain(own(shapes,'_partIdMap'));
   if(!Array.isArray(parts)||Object.getPrototypeOf(parts)!==Array.prototype||Reflect.ownKeys(parts).length!==2||own(parts,'length')!==1||Reflect.ownKeys(partMap).length!==1)bad();
   const part=own(parts,'0');if(own(partMap,expected.partId)!==part||own(part,'partId')!==expected.partId)bad();
   owners.push(parts,partMap,part);
  }
  base();return owners;
 };
 const original=sample();
 const check=()=>{const current=sample();${at("sch-holder")}if(current.length!==original.length||current.some((value,index)=>value!==original[index]))bad();};
 return{check};
})();`;
}
