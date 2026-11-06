import { webcrypto } from "node:crypto";
import { createContext, runInContext } from "node:vm";
import type { QualifiedGeneratedSchematicFixtureTarget } from "../../src/managed-schematic-fixture-initial-sql.ts";
import type { NativeHistorySnapshot } from "../../src/native-history.ts";

/** Synthetic browser/native model surface only. It never starts CAD or calls
 * a native helper and does not claim execution of the vendor constructors. */
export function generatedSchematicOpeningVm(qualification: QualifiedGeneratedSchematicFixtureTarget, history: NativeHistorySnapshot,
  options: { failStage?: string; drift?: "document" | "project" } = {}): { run: (code: string) => Promise<unknown>; evaluate: (code: string) => unknown } {
  const context = createContext({ TextEncoder, crypto: webcrypto, setTimeout, clearTimeout });
  runInContext(`globalThis.window=globalThis;globalThis.top=globalThis;globalThis.target=${JSON.stringify(qualification.target)};
globalThis.failStage=${JSON.stringify(options.failStage ?? null)};globalThis.drift=${JSON.stringify(options.drift ?? null)};
globalThis.location={href:'https://client/editor?cll=warn#',origin:'https://client'};globalThis._TAB_ID_='original-window';
globalThis.document={defaultView:globalThis,nodeType:9,URL:location.href,title:'EasyEDA Pro - V3.2.209',querySelector(selector){if(selector!=='meta[name="editorMainVersion"]')throw new Error('META');return meta;},querySelectorAll(selector){if(selector!=='iframe')throw new Error('FRAME');return [];}};
globalThis.meta={ownerDocument:document,nodeType:1,localName:'meta',getAttribute(name){if(name!=='content')throw new Error('META_ATTRIBUTE');return '3.2.209';}};
globalThis.PRO_EDITOR_MODE='CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM';
globalThis.start={tabId:'tab_page1',data:{doctype:-1},isAbleDelete:false,group:'start_blank',draggable:true,isDisplayNone:false};
globalThis.info={id:'editor-window-main',belong:'editor-window-main',tabs:[start],activeTabId:'tab_page1'};
class Tabs{static containerIds=['editor-window-main'];static containerTree={id:'editor-window-main'};static belongContainer='editor-window-main';static currentTabId='tab_page1';static getActiveTab(){return this.currentTabId;}static getContainerInfo(id){return id===info.id?info:null;}static getTabById(id){return info.tabs.find(tab=>tab.tabId===id)??null;}}
globalThis.calls={registration:0,project:0,page:0,registry:0,activePage:0};globalThis.registration={};globalThis.listeners=[];
class Task{constructor(callback){this.callback=callback;this.isRunning=true;}cancel(){this.callback=null;this.isRunning=false;}}
class Registry{async rpcCall(topic,args,timeout){if(topic==='/pro-mgr/api/client/getProjectPaths'){calls.registry++;if(failStage==='project-preflight'&&calls.registry===3||failStage==='page-preflight'&&calls.registry===7)throw new Error('REGISTRY_REFUSED');if(Object.keys(args).length||timeout!==0)throw new Error('REGISTRY');return{message:{success:true,result:registration}};}
if(topic!=='/pro-mgr/api/client/openProject'||args.length!==1||args[0]!==target.rawWindowsPath)throw new Error('REGISTER');calls.registration++;if(failStage==='registration')throw new Error('REGISTER_REFUSED');registration[target.projectUuid]={path:target.rawWindowsPath,isCbb:false,readOnly:false};return{message:{success:true,result:{[target.projectUuid]:registration[target.projectUuid]}}};}
subscribe(topic,callback){if(topic!=='loadProjectCompleted')throw new Error('SUBSCRIBE');const task=new Task(callback);listeners.push(task);return task;}}
class Api{async rpcCall(topic,args){if(topic==='extensionApi.DMT_Project.openProject'){calls.project++;if(args!==target.projectUuid)throw new Error('PROJECT');if(failStage==='project-open')return false;gVars.currentProject={projectId:target.projectUuid,branchUuid:target.branchUuid,isV2Format:false};location.href=location.href.split('#')[0]+'#id='+target.projectUuid;document.URL=location.href;for(const task of listeners)if(task.isRunning)task.callback(null,undefined,undefined);return true;}
if(topic!=='extensionApi.DMT_EditorControl.openDocument'||args.documentUuid!==target.pageUuid)throw new Error('PAGE');calls.page++;if(failStage==='page-open')throw new Error('PAGE_REFUSED');const tabId=target.pageUuid+'@'+target.projectUuid;info.tabs.push({tabId,data:{doctype:1,pid:target.projectUuid},parentProjectUuid:target.projectUuid});info.activeTabId=tabId;Tabs.currentTabId=tabId;location.href=location.href.split('#')[0]+'#id='+target.projectUuid+',tab=*'+tabId;document.URL=location.href;
if(drift==='document')globalThis.document={...document};if(drift==='project')gVars.currentProject={...gVars.currentProject};return tabId;}}
globalThis.gVars={client:{currentProjectName:''},currentProject:{projectId:undefined,branchUuid:''},isHistoryMode:false,messageBus:new Registry(),extensionApiMessageBus2:new Api()};globalThis._MSG_BUS2_EXTAPI_=gVars.extensionApiMessageBus2;globalThis.UI={gVars,tabBar:Tabs};
const sourceRows=${JSON.stringify(history.documents.find(document => document.docType === "SCH_PAGE")?.records)},index=new Map,sourceIds=new Map,texts=new Set,groups=new Set;
const ids={idMap:index},shapes={idManager:ids,modelMap:new Map([['Text',texts],['NetGroup',groups]]),getModels(type){return [...this.modelMap.get(type)];},actionRunner:{running:false}};
const root={id:'root',modelType:'Root',tagName:'Root',cmdKey:'root',children:[],shapeManager:shapes,isConnected:true};shapes.root=root;
const add=(parent,model)=>{model.parent=parent;model.shapeManager=shapes;model.isConnected=true;(parent.children??=[]).push(model);index.set(model.id,model);sourceIds.set(model.id,1);return model;};
for(const record of sourceRows.toSorted((a,b)=>a.ticket-b.ticket)){const body=record.body;if(record.type==='TEXT'){const model=add(root,{id:record.id,modelType:'Text',tagName:'Text',cmdKey:'text',x:0,y:200,value:body.value,rotation:0,color:body.color,fontFamily:body.fontFamily,fontSize:body.fontSize,fontWeight:false,italic:false,underline:false,hAlign:0,vAlign:0});texts.add(model);}
if(record.type==='WIRE'||record.type==='BUS'){const model=add(root,{id:record.id,modelType:'NetGroup',tagName:'NetGroup',cmdKey:'netGroup',type:record.type.toLowerCase(),lines:[],netNames:[],children:[]});groups.add(model);}
if(record.type==='LINE'){const group=index.get(body.lineGroup),kind=group.type;const model=add(group,{id:record.id,modelType:kind==='wire'?'Wire':'Bus',tagName:'NetGroupLine',cmdKey:kind,type:kind,points:[{x:body.startX,y:-body.startY||0},{x:body.endX,y:-body.endY||0}],strokeColor:null,strokeWidth:null,strokeStyle:null});group.lines.push(model);}}
const handler={getSourceCodeIdMap(){return new Map(sourceIds);}},consistency={state:failStage==='page-identity'?'initializing':'initialized',decodeAndRealTimeSyncHandler:handler,handler};
globalThis.page={uuid:target.pageUuid,project_uuid:target.projectUuid,schematicUuid:target.schematicUuid,tabId:target.pageUuid+'@'+target.projectUuid,docType:1,source:'',projectMgr:{uuid:target.projectUuid},shapeManager:shapes,idManager:ids,consistencyImpl:consistency,isSchSheetDoc(){return true;},isBlockSymbolInstancePage:false};
Object.assign(shapes,{docManager:page});Object.assign(ids,{docManager:page});Object.assign(consistency,{docManager:page});Object.assign(handler,{docManager:page,consistencyImpl:consistency});
globalThis.SCH={docMemoryManager:{getActiveDoc(){calls.activePage++;return page;}}};`, context, { timeout: 1000 });
  return { run: async code => structuredClone(await (runInContext(`(async()=>{${code}})()`, context, { timeout: 1000 }) as unknown)),
    evaluate: code => structuredClone(runInContext(code, context, { timeout: 1000 }) as unknown) };
}
