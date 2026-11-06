/** Fixed stages for one original native SCH holder. No caller code, SDK
 * construction, public Text.modify, navigation retry or inverse is emitted. */
import { GENERATED_SCHEMATIC_DISPLAY_STAGES } from "./generated-schematic-display.ts";
import { buildCurrentProjectUrlGuard } from "./current-project-url.ts";
import { requireOriginalGeneratedSchematicDisplayNativeArguments } from "./generated-schematic-display-source.ts";
import type { GeneratedSchematicFixtureOpenCheckpoint } from "./managed-schematic-fixture-open-checkpoint.ts";
import type { GeneratedSchematicDisplayNativeArguments } from "./generated-schematic-display-source.ts";

export { GENERATED_SCHEMATIC_DISPLAY_STAGES } from "./generated-schematic-display.ts";
export type GeneratedSchematicDisplayStage = typeof GENERATED_SCHEMATIC_DISPLAY_STAGES[number];
export const GENERATED_SCHEMATIC_DISPLAY_SAVE_SOURCE = 'async save(){try{return(await T.extensionApiMessageBus2.rpcCall("extensionApi.SCH_Document.save")).success}catch{return!1}}';
export const GENERATED_SCHEMATIC_DISPLAY_FUNCTION = `async function(target,stage,operation){
"use strict";
const root=globalThis,apply=Reflect.apply,bad=(reason="URL")=>{throw new Error("SCH209_DISPLAY_"+reason);};
${buildCurrentProjectUrlGuard()}
const plain=o=>{if(o===null||typeof o!=="object"||Object.getPrototypeOf(o)!==Object.prototype)bad("PLAIN");return o;};
const own=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad("OWNER");const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad("DATA");return d.value;};
const keys=(o,names)=>{plain(o);const list=Reflect.ownKeys(o);if(list.length!==names.length||list.some(k=>!names.includes(k)))bad("KEYS");for(const key of names)own(o,key);};
const method=(o,key)=>{let at=o;for(let i=0;at&&i<12;i++,at=Object.getPrototypeOf(at)){const d=Object.getOwnPropertyDescriptor(at,key);if(d){if(!Object.hasOwn(d,"value")||typeof d.value!=="function")bad("METHOD");return{object:o,owner:at,key,fn:d.value};}}bad("METHOD");};
const property=(o,key)=>{let at=o;for(let i=0;at&&i<12;i++,at=Object.getPrototypeOf(at)){const d=Object.getOwnPropertyDescriptor(at,key);if(d){if(Object.hasOwn(d,"value"))return{object:o,owner:at,key,kind:"data",value:d.value};if(typeof d.get!=="function"||d.set!==undefined)bad("PROPERTY");return{object:o,owner:at,key,kind:"getter",get:d.get};}}bad("PROPERTY");};
const readProperty=p=>{const now=property(p.object,p.key);if(now.owner!==p.owner||now.kind!==p.kind||p.kind==="data"&&now.value!==p.value||p.kind==="getter"&&now.get!==p.get)bad("PROPERTY_DRIFT");return p.kind==="data"?p.value:apply(p.get,p.object,[]);};
const setter=(o,key)=>{let at=o;for(let i=0;at&&i<12;i++,at=Object.getPrototypeOf(at)){const d=Object.getOwnPropertyDescriptor(at,key);if(d){if(Object.hasOwn(d,"value")||typeof d.set!=="function"||typeof d.get!=="function")bad("SETTER");return{object:o,owner:at,key,get:d.get,set:d.set};}}bad("SETTER");};
const reproveSetter=s=>{const now=setter(s.object,s.key);if(now.owner!==s.owner||now.get!==s.get||now.set!==s.set)bad("SETTER_DRIFT");};
const reprove=m=>{if(method(m.object,m.key).owner!==m.owner||method(m.object,m.key).fn!==m.fn)bad("METHOD_DRIFT");};
const json=v=>JSON.stringify(v,(_key,value)=>value&&typeof value==="object"&&!Array.isArray(value)?Object.fromEntries(Object.keys(value).sort().map(key=>[key,value[key]])):value);
const dense=(v,max)=>{if(!Array.isArray(v)||Object.getPrototypeOf(v)!==Array.prototype||v.length>max||Reflect.ownKeys(v).length!==v.length+1)bad("ARRAY");for(let i=0;i<v.length;i++)own(v,String(i));return v;};
if(!${JSON.stringify(GENERATED_SCHEMATIC_DISPLAY_STAGES)}.includes(stage))bad("STAGE");
keys(target,["rawWindowsPath","projectUuid","branchUuid","schematicUuid","pageUuid","expectedSourceSha256"]);
if(!/^[a-f0-9]{64}$/.test(target.projectUuid)||!/^[a-f0-9]{64}$/.test(target.expectedSourceSha256)||![target.branchUuid,target.schematicUuid,target.pageUuid].every(v=>typeof v==="string"&&/^[a-f0-9]{32}$/.test(v)))bad("TARGET");
keys(operation,["operationId","textId","beforeBody","afterBody","peers"]);
if(typeof operation.operationId!=="string"||operation.operationId.length<20||operation.operationId.length>80||!/^sch209-display-[a-z0-9][a-z0-9-]*$/.test(operation.operationId)||typeof operation.textId!=="string"||!/^0[a-f0-9]{15}$/.test(operation.textId))bad("OPERATION");
plain(operation.beforeBody);plain(operation.afterBody);dense(operation.peers,5);if(operation.peers.length!==5||operation.beforeBody.value!=="Disposable schematic fixture"||operation.afterBody.value!==operation.beforeBody.value||operation.beforeBody.locked!==false||operation.afterBody.locked!==false)bad("BODY");
const expectedBodyKeys=["x","y","rotation","color","fontFamily","fontSize","fontWeight","italic","underline","strikeout","align","value","fillColor","locked","zIndex"];
keys(operation.beforeBody,expectedBodyKeys);keys(operation.afterBody,expectedBodyKeys);
const peerIds=new Set();for(const row of operation.peers){keys(row,["id","type","body"]);if(typeof row.id!=="string"||peerIds.has(row.id)||row.id===operation.textId||!["CANVAS","WIRE","LINE","BUS"].includes(row.type))bad("PEER");peerIds.add(row.id);plain(row.body);}
if(json(operation).length>16384||operation.peers.filter(r=>r.type==="CANVAS"&&r.id==="CANVAS"&&json(r.body)==='{"originX":0,"originY":0}').length!==1)bad("BOUND");
const identity=json({target,operation}),tabId=target.pageUuid+"@"+target.projectUuid;
let tuple=this,state,b;
if(stage==="capture"){
 if(this!==root)bad("CAPTURE_RECEIVER");
 const ui=own(root,"UI"),host=own(root,"gVars"),sch=own(root,"SCH"),tabs=own(ui,"tabBar"),managerProperty=property(sch,"docMemoryManager"),manager=readProperty(managerProperty),active=method(manager,"getActiveDoc"),activeTab=method(tabs,"getActiveTab"),getTab=method(tabs,"getTabById");
 const page=apply(active.fn,manager,[]),shapes=own(page,"shapeManager"),ids=own(page,"idManager"),index=own(ids,"idMap"),consistency=own(page,"consistencyImpl"),handler=own(consistency,"decodeAndRealTimeSyncHandler"),runnerProperty=property(shapes,"actionRunner"),runner=readProperty(runnerProperty);
 const getSource=method(consistency,"getSourceCode"),sourceIds=method(handler,"getSourceCodeIdMap"),run=method(runner,"run");
 const text=index.get(operation.textId);if(!text)bad("TEXT");
 const setters=Object.fromEntries(["x","y","rotation","fontFamily","fontSize","fontWeight","italic","underline","hAlign","vAlign"].map(key=>[key,setter(text,key)]));
 const permissionProperty=property(host,"isReadOnlyMode");
 const sdk=own(root,"_EXTAPI_ROOT_"),docApi=own(sdk,"sch_Document"),save=method(docApi,"save");
 if(apply(Function.prototype.toString,save.fn,[])!==${JSON.stringify(GENERATED_SCHEMATIC_DISPLAY_SAVE_SOURCE)})bad("SAVE_SOURCE");
 const document=root.document,href=root.location?.href,windowTabId=own(root,"_TAB_ID_"),metadata=own(host,"currentProject"),tab=apply(getTab.fn,tabs,[tabId]);
 b={ui,host,sch,tabs,managerProperty,runnerProperty,manager,active,activeTab,getTab,page,shapes,ids,index,consistency,handler,runner,getSource,sourceIds,run,setters,permissionProperty,sdk,docApi,save,document,href,windowTabId,metadata,tab};
 state={identity,owner:null,modifyAttempted:false,modifyAcknowledged:false,observed:false,saveAttempted:false,saveAcknowledged:false,savePromiseSettled:false,failed:false,before:null};tuple=[b,state];state.owner=tuple;
}else{
 dense(tuple,2);if(tuple.length!==2)bad("HOLDER");b=own(tuple,"0");state=own(tuple,"1");plain(b);plain(state);
 if(state.owner!==tuple||state.identity!==identity||state.failed!==false)bad("HOLDER");
}
let ownedAction=null,dispatchAttempted=false,originalPromiseSettled=false;
const check=()=>{
 if(parseProjectUrl(root.location?.href,target.projectUuid,tabId).empty)bad("URL");
 if(root.window!==root||root.top!==root||root.document!==b.document||b.document?.defaultView!==root||b.document?.nodeType!==9||root.location?.origin!=="https://client"||root.location?.href!==b.href||b.document.URL!==b.href||own(root,"_TAB_ID_")!==b.windowTabId||typeof b.windowTabId!=="string")bad("WINDOW");
 if(own(root,"UI")!==b.ui||own(root,"gVars")!==b.host||own(root,"SCH")!==b.sch||own(b.ui,"gVars")!==b.host||own(b.host,"currentProject")!==b.metadata||own(b.metadata,"projectId")!==target.projectUuid||own(b.metadata,"branchUuid")!==target.branchUuid||own(b.metadata,"isV2Format")!==false||own(b.host,"isHistoryMode")!==false)bad("PROJECT");
 if(own(b.ui,"tabBar")!==b.tabs||readProperty(b.managerProperty)!==b.manager||apply(b.active.fn,b.manager,[])!==b.page||apply(b.activeTab.fn,b.tabs,[])!==tabId||apply(b.getTab.fn,b.tabs,[tabId])!==b.tab||b.tab?.data?.doctype!==1||b.tab.data.pid!==target.projectUuid||b.tab.parentLibraryUuid!==undefined)bad("PAGE");
 const p=b.page;if(p.uuid!==target.pageUuid||p.schematicUuid!==target.schematicUuid||p.project_uuid!==target.projectUuid||p.tabId!==tabId||p.docType!==1||p.source!==""||p.isBlockSymbolInstancePage!==false||p.isSchSheetDoc?.()!==true||p.projectMgr?.uuid!==target.projectUuid||p.shapeManager!==b.shapes||p.idManager!==b.ids||b.ids.idMap!==b.index||b.shapes.docManager!==p||b.shapes.idManager!==b.ids||p.readonlyMode!==false||p.isLockedByAuth!==false||readProperty(b.permissionProperty)!==false||p.consistencyImpl!==b.consistency||b.consistency.handler!==b.handler||b.consistency.decodeAndRealTimeSyncHandler!==b.handler||b.handler.docManager!==p||b.handler.consistencyImpl!==b.consistency||b.consistency.state!=="initialized"||readProperty(b.runnerProperty)!==b.runner)bad("OWNER");
 if(ownedAction===null?b.runner.running!==false:b.runner.running!==true||b.runner.currentAction!==ownedAction||ownedAction.status!=="running")bad("ACTION");
 if(own(root,"_EXTAPI_ROOT_")!==b.sdk||own(b.sdk,"sch_Document")!==b.docApi||state.owner!==tuple||state.identity!==identity||state.failed||tuple[0]!==b||tuple[1]!==state)bad("DRIFT");
 for(const m of [b.active,b.activeTab,b.getTab,b.getSource,b.sourceIds,b.run,b.save])reprove(m);for(const binding of Object.values(b.setters))reproveSetter(binding);
};
const capture=expected=>{
 check();if(!(b.index instanceof Map)||b.index.size>64)bad("TREE");const rootModel=b.shapes.root;if(!rootModel||rootModel.modelType!=="Root"||rootModel.parent!=null||rootModel.shapeManager!==b.shapes||rootModel.isConnected!==true)bad("ROOT");
 const tree=[],queue=[rootModel],seen=new Set();for(let n=0;n<queue.length;n++){const parent=queue[n];if(parent.children===undefined)continue;for(const model of dense(parent.children,64)){if(!model||typeof model.id!=="string"||seen.has(model.id)||model.parent!==parent||model.shapeManager!==b.shapes||model.isConnected!==true||b.index.get(model.id)!==model)bad("TREE");seen.add(model.id);tree.push({model,parent,id:model.id,type:model.modelType,locked:model.locked});queue.push(model);if(tree.length>64)bad("TREE");}}
 if(tree.length!==b.index.size)bad("TREE");const text=b.index.get(operation.textId);if(!text||text.modelType!=="Text"||text.cmdKey!=="text"||text.parent!==rootModel||text.locked!==false)bad("TEXT");
 const sourceMap=apply(b.sourceIds.fn,b.handler,[]);if(!(sourceMap instanceof Map)||sourceMap.size!==5)bad("SOURCE_IDS");
 const raw=apply(b.getSource.fn,b.consistency,[]);if(typeof raw!=="string"||!raw.endsWith("|\\n")||new TextEncoder().encode(raw).byteLength>16384)bad("SOURCE");
 const parts=raw.slice(0,-2).split("|\\n"),head=parts.shift();if(!head)bad("HEADER");const boundary=head.indexOf("||"),header=JSON.parse(head.slice(0,boundary)),document=JSON.parse(head.slice(boundary+2));plain(header);plain(document);
 if(header.type!=="DOCHEAD"||document.uuid!==target.pageUuid||document.docType!=="SCH_PAGE")bad("HEADER");
 const rows=parts.map(part=>{const at=part.indexOf("||"),h=JSON.parse(part.slice(0,at)),body=JSON.parse(part.slice(at+2));plain(h);plain(body);if(typeof h.id!=="string"||typeof h.type!=="string")bad("RECORD");return{id:h.id,type:h.type,body,header:h};});
 if(rows.length!==6||new Set(rows.map(r=>r.id)).size!==6)bad("ROSTER");const record=rows.find(r=>r.id===operation.textId);if(!record||record.type!=="TEXT"||json(record.body)!==json(expected))bad("TEXT_BODY");
 const peers=rows.filter(r=>r.id!==operation.textId).map(({id,type,body})=>({id,type,body})).sort((l,r)=>l.id<r.id?-1:l.id>r.id?1:0);if(json(peers)!==json(operation.peers))bad("PEERS");
 for(const row of rows){if(row.id!=="CANVAS"&&(sourceMap.get(row.id)!==1||!seen.has(row.id)))bad("SOURCE_IDS");}
 for(const[id,value]of sourceMap){if(value!==1||!rows.some(r=>r.id===id&&id!=="CANVAS"))bad("SOURCE_IDS");}
 check();return{raw,head,document,rows,tree,rootModel,text,sourceMap:new Map(sourceMap)};
};
const same=(before,after)=>{if(before.rootModel!==after.rootModel||before.text!==after.text||before.tree.length!==after.tree.length||before.sourceMap.size!==after.sourceMap.size)bad("SCENE_CHANGED");for(let i=0;i<before.tree.length;i++){const x=before.tree[i],y=after.tree[i];if(x.model!==y.model||x.parent!==y.parent||x.id!==y.id||x.type!==y.type||!Object.is(x.locked,y.locked))bad("SCENE_CHANGED");}for(const[id,value]of before.sourceMap)if(after.sourceMap.get(id)!==value)bad("SCENE_CHANGED");};
const receipt=(ok,source=null)=>({schema:"easyeda-pro-control.generated-schematic-display-stage.v1",stage,ok,dispatchAttempted,originalPromiseSettled,modifyAttempted:state.modifyAttempted,modifyAcknowledged:state.modifyAcknowledged,saveAttempted:state.saveAttempted,saveAcknowledged:state.saveAcknowledged,savePromiseSettled:state.savePromiseSettled,source:source?.raw??null,windowTabId:b.windowTabId,originalContextIntact:ok,connectivityVerified:false,sourceVersionAliased:false,workerCompletionVerified:false,structureCompletionVerified:false,persistenceVerified:false,inverseAvailable:false});
try{
 if(stage==="capture"){state.before=capture(operation.beforeBody);same(state.before,capture(operation.beforeBody));return tuple;}
 if(stage==="preflight"){if(state.modifyAttempted||state.saveAttempted)bad("CONSUMED");same(state.before,capture(operation.beforeBody));return receipt(true,capture(operation.beforeBody));}
 if(stage==="modify"){
  if(state.modifyAttempted||state.saveAttempted)bad("CONSUMED");state.modifyAttempted=true;const before=capture(operation.beforeBody);same(state.before,before);
  const changes=[];
  for(const field of ["x","y","rotation","fontFamily","fontSize","fontWeight","italic","underline"]){if(json(operation.beforeBody[field])!==json(operation.afterBody[field]))changes.push([field,operation.afterBody[field]]);}
  if(operation.beforeBody.align!==operation.afterBody.align){const labels=["LEFT_TOP","LEFT_MIDDLE","LEFT_BOTTOM","CENTER_TOP","CENTER_MIDDLE","CENTER_BOTTOM","RIGHT_TOP","RIGHT_MIDDLE","RIGHT_BOTTOM"],at=labels.indexOf(operation.afterBody.align);if(operation.afterBody.align!==null&&at<0)bad("ALIGN");changes.push(["hAlign",operation.afterBody.align===null?null:Math.floor(at/3)],["vAlign",operation.afterBody.align===null?null:at%3]);}
  if(changes.length===0)bad("NO_CHANGE");
  dispatchAttempted=true;const original=apply(b.run.fn,b.runner,[async()=>{ownedAction=b.runner.currentAction;check();same(before,capture(operation.beforeBody));for(const[field,value]of changes){check();const binding=b.setters[field];if(binding.object!==before.text)bad("TEXT_RECEIVER");reproveSetter(binding);apply(binding.set,before.text,[value]);}check();}]);
  if(Object.getPrototypeOf(original)!==Promise.prototype)bad("ACTION_PROMISE");const result=await original;ownedAction=null;originalPromiseSettled=true;if(result!==true)bad("ACTION_REJECTED");const after=capture(operation.afterBody);same(before,after);state.modifyAcknowledged=true;return receipt(true,after);
 }
 if(stage==="observe"){if(!state.modifyAcknowledged||state.saveAttempted)bad("ORDER");const after=capture(operation.afterBody);same(state.before,after);state.observed=true;return receipt(true,after);}
 if(stage==="save"){
  if(!state.modifyAcknowledged||!state.observed||state.saveAttempted)bad("ORDER");state.saveAttempted=true;const before=capture(operation.afterBody);same(state.before,before);dispatchAttempted=true;
  const original=apply(b.save.fn,b.docApi,[]);if(Object.getPrototypeOf(original)!==Promise.prototype)bad("SAVE_PROMISE");const saved=await original;originalPromiseSettled=true;state.savePromiseSettled=true;check();if(saved!==true)bad("SAVE_REJECTED");const after=capture(operation.afterBody);same(before,after);state.saveAcknowledged=true;return receipt(true,after);
 }
 bad("STAGE");
}catch{state.failed=true;return receipt(false);}
}`;

/** Plain data only; an original native owner must also authenticate the actual
 * checkpoint-bound argument object and its retained stage/source capability. */
export function generatedSchematicDisplayArgumentsValue(input: GeneratedSchematicDisplayNativeArguments, prepared: GeneratedSchematicFixtureOpenCheckpoint): Readonly<{
  target: GeneratedSchematicDisplayNativeArguments["target"]; operation: GeneratedSchematicDisplayNativeArguments["operation"];
}> { requireOriginalGeneratedSchematicDisplayNativeArguments(input, prepared); return { target: input.target, operation: input.operation }; }
