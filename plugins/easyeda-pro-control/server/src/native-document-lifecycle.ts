import { DEVICE_NATIVE_HOST_GUARD } from "./device-runtime-guard.ts";

export interface NativeDocumentLifecycleScope {
  readonly projectUuid: string;
  readonly documentUuid: string;
  readonly documentType: 1 | 2 | 3 | 4;
  readonly metadataOwnerUuid?: string;
}
function scopeCode(scope: NativeDocumentLifecycleScope): string {
  if (typeof scope.projectUuid !== "string" || !scope.projectUuid || scope.projectUuid.length > 256 ||
      typeof scope.documentUuid !== "string" || !scope.documentUuid || scope.documentUuid.length > 256 ||
      ![1, 2, 3, 4].includes(scope.documentType) ||
      ((scope.documentType === 2 || scope.documentType === 4) && (typeof scope.metadataOwnerUuid !== "string" || !scope.metadataOwnerUuid))) {
    throw new Error("Native lifecycle requires an exact document and project scope.");
  }
  return `${DEVICE_NATIVE_HOST_GUARD}
const LIFE_SCOPE=${JSON.stringify(scope)},ui=globalThis.window?.top;
if(!ui||typeof ui.setTimeout!=='function'||typeof ui.clearTimeout!=='function'||typeof bus.subscribe!=='function'||typeof ui.document?.getElementById!=='function')throw new Error('NATIVE_LIFECYCLE_OBSERVER_UNAVAILABLE');
const projectMatches=async()=>{const project=await eda.dmt_Project.getCurrentProjectInfo();if(project?.uuid!==LIFE_SCOPE.projectUuid||host.currentProject?.projectId!==LIFE_SCOPE.projectUuid)throw new Error('NATIVE_LIFECYCLE_PROJECT_DRIFT');};
const contextMatches=async(tab)=>{await projectMatches();const current=await eda.dmt_SelectControl.getCurrentDocumentInfo();return current?.uuid===LIFE_SCOPE.documentUuid&&current?.documentType===LIFE_SCOPE.documentType&&current?.tabId===tab&&(LIFE_SCOPE.metadataOwnerUuid===undefined||current?.parentLibraryUuid===LIFE_SCOPE.metadataOwnerUuid);};
`;
}

/** Public closeDocument does not await UI $b. $b's terminal notification follows
 * all awaited cleanup and frame/tab removal. Native VP/fe bind the canvas to
 * frame_<modelTabId>, c_dbid and c_doctype. Aliased/shared models are refused.
 */
export function buildNativeDocumentCloseFunction(scope: NativeDocumentLifecycleScope): string {
  return `(async(tab)=>{
${scopeCode(scope)}
if(typeof tab!=='string'||!tab||tab.length>512||!await contextMatches(tab))throw new Error('NATIVE_LIFECYCLE_CLOSE_CONTEXT');
const modelTab=(LIFE_SCOPE.documentType===1||LIFE_SCOPE.documentType===2)?(await bus.rpcCall('getModelTabId',tab))?.message:tab;
if(modelTab!==tab)throw new Error('NATIVE_LIFECYCLE_SHARED_MODEL');
const oldElement=ui.document.getElementById('frame_'+modelTab),tag=LIFE_SCOPE.documentType<=2?'DIV':'IFRAME';
if(!oldElement||oldElement.tagName!==tag||oldElement.isConnected!==true||oldElement.getAttribute('c_dbid')!==modelTab||oldElement.getAttribute('c_doctype')!==String(LIFE_SCOPE.documentType)||(await bus.rpcCall('isOpenTab',[tab]))?.message!==true)throw new Error('NATIVE_LIFECYCLE_OLD_FRAME');
let resolveClose,rejectClose,subscription,deadline,dispatched=false,eventCount=0;
const completion=new Promise((resolve,reject)=>{resolveClose=resolve;rejectClose=reject;});completion.catch(()=>{});
try{
  subscription=bus.subscribe('sch/SubTabbarMapRemove',value=>{if(dispatched&&value===modelTab.split('@')[0]){eventCount++;resolveClose();}});
  if(typeof subscription?.cancel!=='function')throw new Error('NATIVE_LIFECYCLE_SUBSCRIPTION');
  deadline=ui.setTimeout(()=>rejectClose(new Error('NATIVE_LIFECYCLE_CLOSE_TIMEOUT')),15000);
  if(!await contextMatches(tab))throw new Error('NATIVE_LIFECYCLE_CLOSE_CONTEXT');
  dispatched=true;
  if(await eda.dmt_EditorControl.closeDocument(tab)!==true)throw new Error('NATIVE_LIFECYCLE_CLOSE_ACK');
  await completion;
  if(eventCount!==1||oldElement.isConnected!==false||ui.document.getElementById('frame_'+modelTab)!==null||(await bus.rpcCall('isOpenTab',[tab]))?.message!==false)throw new Error('NATIVE_LIFECYCLE_CLOSE_REMOVAL');
  await projectMatches();
  return {profile:'easyeda-pro-control.native-document-close.v1',closeCalls:1,terminalNotification:true,oldFrameRemoved:true,oldTabRemoved:true,saved:false};
}finally{if(deadline!==undefined)ui.clearTimeout(deadline);if(typeof subscription?.cancel==='function')subscription.cancel();}
})`;
}

/** Legacy PCB/footprint Xb does not emit editorCreated. Its public library open
 * may acknowledge at tab activation, before owner metadata is assigned. Bound
 * the actual frame/tab/context predicate, not a fixed wait or an assumed event.
 * Public activation awaits fe.setTabActive; a false acknowledgment is accepted
 * only when the independently re-read exact context proves activation.
 */
export function buildNativeDocumentOpenFunction(scope: NativeDocumentLifecycleScope): string {
  return `(async(tab)=>{
${scopeCode(scope)}
if(typeof tab!=='string'||!tab||tab.length>512||(await bus.rpcCall('isOpenTab',[tab]))?.message!==false)throw new Error('NATIVE_LIFECYCLE_OPEN_TARGET_PRESENT');
await projectMatches();
let rejectDeadline,deadline,pollTimer,readinessSamples=0;
const expired=new Promise((resolve,reject)=>{rejectDeadline=reject;});expired.catch(()=>{});
const bounded=promise=>Promise.race([promise,expired]);
const pause=()=>new Promise(resolve=>{pollTimer=ui.setTimeout(()=>{pollTimer=undefined;resolve();},50);});
const frameReady=()=>{const frame=ui.document.getElementById('frame_'+tab);return Boolean(frame&&frame.isConnected===true&&frame.tagName===(LIFE_SCOPE.documentType<=2?'DIV':'IFRAME')&&frame.getAttribute('c_dbid')===tab&&frame.getAttribute('c_doctype')===String(LIFE_SCOPE.documentType));};
try{
  deadline=ui.setTimeout(()=>rejectDeadline(new Error('NATIVE_LIFECYCLE_OPEN_TIMEOUT')),15000);
  const opened=await bounded(LIFE_SCOPE.documentType===2?eda.lib_Symbol.openInEditor(LIFE_SCOPE.documentUuid,LIFE_SCOPE.projectUuid):
    LIFE_SCOPE.documentType===4?eda.dmt_EditorControl.openLibraryDocument(LIFE_SCOPE.projectUuid,'4',LIFE_SCOPE.documentUuid):
    eda.dmt_EditorControl.openDocument(LIFE_SCOPE.documentUuid));
  if(opened!==tab)throw new Error('NATIVE_LIFECYCLE_OPEN_ACK');
  let activated;
  for(let attempt=0;attempt<300;attempt++){
    await bounded(projectMatches());
    const isOpen=(await bounded(bus.rpcCall('isOpenTab',[tab])))?.message;
    if(isOpen!==true&&isOpen!==false)throw new Error('NATIVE_LIFECYCLE_NEW_FRAME');
    if(isOpen===true&&frameReady()){
      if(activated===undefined){activated=await bounded(eda.dmt_EditorControl.activateDocument(tab));if(typeof activated!=='boolean')throw new Error('NATIVE_LIFECYCLE_ACTIVATE_CONTEXT');}
      if(await bounded(contextMatches(tab))){
        readinessSamples++;
        if(readinessSamples===2)return {profile:'easyeda-pro-control.native-document-open.v1',tabId:tab,newFrameReady:true,exactContext:true,readinessSamples,activated};
      }else readinessSamples=0;
    }else readinessSamples=0;
    await bounded(pause());
  }
  throw new Error('NATIVE_LIFECYCLE_OPEN_TIMEOUT');
}finally{if(deadline!==undefined)ui.clearTimeout(deadline);if(pollTimer!==undefined)ui.clearTimeout(pollTimer);}
})`;
}
