import { currentSchematicPageOpeningTargetSchema } from "./current-schematic-page-opening.ts";
import { buildCurrentProjectUrlGuard } from "./current-project-url.ts";
import { EXACT_READ_ENVELOPE_SCHEMA } from "./exact-readers.ts";

/** The captured parent UI receiver owns this one public openDocument await.
 * It accepts only an empty editor and this operation's checkpoint-bound page.
 * There is deliberately no timeout race: native work is never declared settled
 * merely because a facade deadline elapsed. The tracked dispatcher owns that
 * ambiguous-call boundary and its original process authority. */
export function buildCurrentSchematicPageOpeningProgram(input: unknown, phase: "preflight" | "open", expectedWindowTabId?: string): string {
  const target = currentSchematicPageOpeningTargetSchema.parse(input);
  if (phase !== "preflight" && phase !== "open") { throw new Error("SCH209_OPEN_PHASE"); }
  if (phase === "open" ? expectedWindowTabId === undefined || !/^[A-Za-z0-9_-]{1,128}$/u.test(expectedWindowTabId) : expectedWindowTabId !== undefined) { throw new Error("SCH209_OPEN_WINDOW_BINDING"); }
  return `"use strict";
const target=${JSON.stringify(target)},phase=${JSON.stringify(phase)},root=globalThis,apply=Reflect.apply,bad=()=>{throw new Error("SCH209_PAGE_OPEN_REFUSED");};
const own=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return d.value;};
const plain=o=>{if(o===null||typeof o!=="object"||Array.isArray(o)||Object.getPrototypeOf(o)!==Object.prototype)bad();return o;};
const method=(owner,key)=>{const chain=[];let item=owner;for(let i=0;i<4;i++){if(item===null||(typeof item!=="object"&&typeof item!=="function"))bad();chain.push(item);const d=Object.getOwnPropertyDescriptor(item,key);if(d){if(!Object.hasOwn(d,"value")||typeof d.value!=="function")bad();return{owner,key,chain,fn:d.value};}item=Object.getPrototypeOf(item);}bad();};
const reprove=b=>{for(let i=0;i<b.chain.length;i++){if(i>0&&Object.getPrototypeOf(b.chain[i-1])!==b.chain[i])bad();if(i===b.chain.length-1){if(own(b.chain[i],b.key)!==b.fn)bad();}else if(Object.hasOwn(b.chain[i],b.key))bad();}};
const dense=(value,max)=>{if(!Array.isArray(value)||Object.getPrototypeOf(value)!==Array.prototype)bad();const n=own(value,"length");if(!Number.isInteger(n)||n>max||Reflect.ownKeys(value).length!==n+1)bad();for(let i=0;i<n;i++)own(value,String(i));return n;};
${buildCurrentProjectUrlGuard()}
const ui=own(root,"UI"),host=own(root,"gVars"),metadata=plain(own(host,"currentProject")),tabs=own(ui,"tabBar"),document=root.document,location=root.location;
const windowTabId=own(root,"_TAB_ID_"),mode=own(root,"PRO_EDITOR_MODE"),initialHref=location?.href;
if(${JSON.stringify(expectedWindowTabId ?? null)}!==null&&windowTabId!==${JSON.stringify(expectedWindowTabId ?? null)})bad();
if(typeof windowTabId!=="string"||!/^[A-Za-z0-9_-]{1,128}$/.test(windowTabId)||typeof tabs!=="function")bad();
const tabId=target.documentUuid+"@"+target.projectUuid,active=method(tabs,"getActiveTab"),getTab=method(tabs,"getTabById"),container=method(tabs,"getContainerInfo");
const apiBus=own(host,"extensionApiMessageBus2"),bus=own(host,"messageBus"),open=method(apiBus,"rpcCall"),registry=method(bus,"rpcCall"),select=document?.querySelectorAll;
if(typeof select!=="function")bad();let href=initialHref;
const check=()=>{
if(root.window!==root||root.top!==root||root.document!==document||document?.defaultView!==root||document?.nodeType!==9||document?.URL!==href||root.location!==location||location?.href!==href||location?.origin!=="https://client")bad();
const url=parseProjectUrl(href,target.projectUuid);if(url.empty||url.tabIds.some(id=>id!==tabId))bad();
if(own(root,"UI")!==ui||own(root,"gVars")!==host||own(ui,"gVars")!==host||own(ui,"tabBar")!==tabs||own(host,"currentProject")!==metadata||own(root,"_TAB_ID_")!==windowTabId||own(root,"PRO_EDITOR_MODE")!==mode||!["CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM","CLIENT-OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM"].includes(mode))bad();
if(own(metadata,"projectId")!==target.projectUuid||own(metadata,"branchUuid")!==target.branchUuid||own(metadata,"isV2Format")!==false||own(host,"isHistoryMode")!==false||own(host,"extensionApiMessageBus2")!==apiBus||own(root,"_MSG_BUS2_EXTAPI_")!==apiBus||own(host,"messageBus")!==bus||document.querySelectorAll!==select)bad();
for(const binding of [active,getTab,container,open,registry])reprove(binding);
};
const sample=opened=>{
check();const ids=own(tabs,"containerIds"),tree=plain(own(tabs,"containerTree"));
if(dense(ids,1)!==1||ids[0]!=="editor-window-main"||own(tree,"id")!=="editor-window-main"||Object.hasOwn(tree,"children")&&own(tree,"children")!==undefined||own(tabs,"belongContainer")!=="editor-window-main")bad();
const info=plain(apply(container.fn,tabs,["editor-window-main"])),list=own(info,"tabs"),n=dense(list,3),current=own(tabs,"currentTabId");
if(n<1||own(info,"id")!=="editor-window-main"||own(info,"belong")!=="editor-window-main"||own(info,"activeTabId")!==current||apply(active.fn,tabs,[])!==current)bad();
const owners=[ids,tree,info,list],rows=[],seen=new Set();let found=false;
for(let i=0;i<n;i++){const tab=plain(own(list,String(i))),id=own(tab,"tabId"),data=plain(own(tab,"data")),type=own(data,"doctype");
if(typeof id!=="string"||seen.has(id)||apply(getTab.fn,tabs,[id])!==tab)bad();seen.add(id);owners.push(tab,data);
if(id==="tab_page1"||id==="0"){const start=id==="tab_page1";if(type!==(start?-1:0)||own(tab,"isAbleDelete")!==false||own(tab,"group")!=="start_blank"||own(tab,"draggable")!==start||typeof own(tab,"isDisplayNone")!=="boolean"||!start&&own(tab,"isDisplayNone")!==true)bad();for(const k of ["pid","owner"])if(Object.hasOwn(data,k)&&own(data,k)!==undefined)bad();}
else{if(id!==tabId||type!==1||own(data,"pid")!==target.projectUuid||Object.hasOwn(tab,"parentLibraryUuid")&&own(tab,"parentLibraryUuid")!==undefined)bad();found=true;}
rows.push([id,type]);}
if(!seen.has(current)||found!==opened||opened&&current!==tabId||apply(select,document,["iframe"]).length!==0)bad();
return{owners,identity:JSON.stringify([rows,current])};
};
const same=(left,right)=>{if(left.identity!==right.identity||left.owners.length!==right.owners.length||left.owners.some((owner,i)=>owner!==right.owners[i]))bad();};
const registration=async opened=>{const before=sample(opened),reply=plain(await apply(registry.fn,bus,["/pro-mgr/api/client/getProjectPaths",{},0]));check();same(before,sample(opened));const message=plain(own(reply,"message"));if(own(message,"success")!==true)bad();const paths=plain(own(message,"result")),keys=Reflect.ownKeys(paths);if(keys.length>4096||keys.some(key=>typeof key!=="string"||!/^[a-f0-9]{64}$/.test(key)))bad();const entry=plain(own(paths,target.projectUuid));if(own(entry,"path")!==target.rawWindowsPath||own(entry,"isCbb")!==false)bad();return before;};
const before=await registration(false);check();
if(phase==="open"){
same(before,sample(false));const result=await apply(open.fn,apiBus,["extensionApi.DMT_EditorControl.openDocument",{documentUuid:target.documentUuid,splitScreenId:undefined}]);href=location?.href;check();if(result!==tabId)bad();await registration(true);check();
}else{same(before,sample(false));}
const json=JSON.stringify({schema:"easyeda-pro-control.current-schematic-page-opening-result.v1",phase,projectUuid:target.projectUuid,branchUuid:target.branchUuid,documentUuid:target.documentUuid,schematicUuid:target.schematicUuid,tabId,windowTabId,opened:phase==="open",dispatchAttempted:phase==="open",nativeWorkMayRemain:phase==="open",startupCompletionVerified:false,completeSourceVerified:false,persistenceVerified:false,executionAuthorized:false,explicitSaveDispatched:false});
const utf8Bytes=new TextEncoder().encode(json).byteLength,envelope={schema:${JSON.stringify(EXACT_READ_ENVELOPE_SCHEMA)},utf8Bytes,json};if(new TextEncoder().encode(JSON.stringify(envelope)).byteLength>16384)bad();return envelope;`;
}
