/** Fixed native equivalents for three ID-only SDK methods. The pinned SCH
 * implementation stores Text directly and both WIRE/BUS as NetGroup models
 * distinguished by type. getModels copies modelMap; getSourceCodeIdMap copies
 * the live source inventory (its values are presence marker 1, not record types).
 * No serialization/uploadTo, AST compilation, net lookup or settings read occurs.
 * Ordinary active SCH_PAGE only; source/model disagreement is a refusal, never
 * an empty-result fallback. This is not connectivity or persistence evidence.
 */
export const SCHEMATIC_NATIVE_ID_METHODS = [
  "eda.sch_PrimitiveText.getAllPrimitiveId",
  "eda.sch_PrimitiveWire.getAllPrimitiveId",
  "eda.sch_PrimitiveBus.getAllPrimitiveId",
] as const;

export function isSchematicNativeIdMethod(method: string): boolean {
  return SCHEMATIC_NATIVE_ID_METHODS.some((entry) => entry === method);
}

/** The surrounding maintained context guard supplies EXPECTED_* constants.
 * Keep the entire inventory read synchronous: no callback can finish after the
 * result is published. Snapshot identities are rechecked before returning IDs.
 */
export function buildSchematicNativeIdsExpression(method: string): string {
  if (!isSchematicNativeIdMethod(method)) { throw new Error("Unsupported schematic native ID method."); }
  let family = "bus";
  if (method.includes("PrimitiveText")) { family = "text"; }
  if (method.includes("PrimitiveWire")) { family = "wire"; }
  return `(() => {
const bad=reason=>{throw new Error('SCH_NATIVE_IDS_'+reason);};
const validId=value=>{if(typeof value!=='string'||!value||value.length>256||[...value].some(character=>character.charCodeAt(0)<32||character.charCodeAt(0)===127))bad('IDENTITY');return value;};
const sch=globalThis.SCH,ui=globalThis.UI,tabs=ui?.tabBar;
const manager=sch?.docMemoryManager,activeReader=manager?.getActiveDoc;
if(typeof activeReader!=='function'||typeof tabs?.getActiveTab!=='function')bad('MANAGER');
const tabReader=tabs.getActiveTab,page=activeReader.call(manager);
const shapes=page?.shapeManager,ids=page?.idManager,index=ids?.idMap,modelMap=shapes?.modelMap;
const consistency=page?.consistencyImpl,handler=consistency?.decodeAndRealTimeSyncHandler;
const sourceReader=handler?.getSourceCodeIdMap,modelReader=shapes?.getModels,project=page?.projectMgr;
const action=shapes?.actionRunner;
if(!page||!project||typeof sourceReader!=='function'||typeof modelReader!=='function'||!(index instanceof Map)||index.size>100000||!(modelMap instanceof Map)||modelMap.size>1000)bad('INVENTORY');
const check=()=>{
 if(globalThis.SCH!==sch||globalThis.UI!==ui||ui.tabBar!==tabs||tabs.getActiveTab!==tabReader||sch.docMemoryManager!==manager||manager.getActiveDoc!==activeReader||activeReader.call(manager)!==page||tabReader.call(tabs)!==EXPECTED_TAB_ID)bad('RECEIVER_CHANGED');
 if(EXPECTED_DOCUMENT_TYPE!==1||page.uuid!==EXPECTED_DOCUMENT_UUID||page.project_uuid!==EXPECTED_PROJECT_UUID||page.tabId!==EXPECTED_TAB_ID||EXPECTED_TAB_ID!==EXPECTED_DOCUMENT_UUID+'@'+EXPECTED_PROJECT_UUID||page.isSchSheetDoc?.()!==true||page.isBlockSymbolInstancePage!==false)bad('CONTEXT');
 if(page.projectMgr!==project||project.uuid!==EXPECTED_PROJECT_UUID||page.shapeManager!==shapes||page.idManager!==ids||shapes.docManager!==page||shapes.idManager!==ids||ids.docManager!==page||ids.idMap!==index||shapes.modelMap!==modelMap||shapes.getModels!==modelReader||page.consistencyImpl!==consistency||consistency.docManager!==page||consistency.decodeAndRealTimeSyncHandler!==handler||consistency.handler!==handler||handler.consistencyImpl!==consistency||handler.docManager!==page||handler.getSourceCodeIdMap!==sourceReader||shapes.actionRunner!==action)bad('OWNER_CHANGED');
 if(consistency.state!=='initialized'||action?.running!==false)bad('NOT_READY');
};
check();
const sources=sourceReader.call(handler);
if(!(sources instanceof Map)||sources.size>100000)bad('SOURCE_INVENTORY');
const sourceModels=new Map();
for(const [key,marker] of sources){validId(key);const model=index.get(key);if(marker!==1||!model||model.id!==key)bad('SOURCE_MODEL');sourceModels.set(key,model);}
const snapshots=[];
const result=[];
for(const type of ['Text','NetGroup']){
 const map=modelMap.get(type);
 if(map!==undefined&&(!(map instanceof Set)||map.size>20000))bad('MODEL_MAP');
 const models=modelReader.call(shapes,type);
 if(!Array.isArray(models)||models.length>20000||models.length!==(map?.size??0))bad('MODEL_LIST');
 const members=new Map();
 for(const model of models){
  const key=validId(model?.id);
  if(members.has(key)||model.modelType!==type||model.shapeManager!==shapes||index.get(key)!==model||!map?.has(model)||sourceModels.get(key)!==model)bad('MODEL_MEMBERSHIP');
  if(type==='NetGroup'&&!['wire','bus'].includes(model.type))bad('GROUP_TYPE');
  members.set(key,model);
  if(type==='Text'&&${JSON.stringify(family)}==='text'||type==='NetGroup'&&model.type===${JSON.stringify(family)})result.push(key);
 }
 for(const [key,model] of index){if(model?.modelType===type&&(model.id!==key||members.get(key)!==model))bad('INDEX_MEMBERSHIP');}
 for(const [key,model] of sourceModels){if(model.modelType===type&&members.get(key)!==model)bad('SOURCE_MEMBERSHIP');}
 snapshots.push({type,map,members,types:new Map([...members].map(([key,model])=>[key,model.type]))});
}
if(result.length>20000)bad('RESULT_BOUND');
const finalSources=sourceReader.call(handler);
if(!(finalSources instanceof Map)||finalSources.size!==sources.size)bad('SOURCE_CHANGED');
for(const [key,marker] of sources){if(finalSources.get(key)!==marker||index.get(key)!==sourceModels.get(key))bad('SOURCE_CHANGED');}
for(const {type,map,members,types} of snapshots){
 if(modelMap.get(type)!==map||map!==undefined&&map.size!==members.size)bad('MODELS_CHANGED');
 const current=modelReader.call(shapes,type);
 if(!Array.isArray(current)||current.length!==members.size||new Set(current).size!==current.length)bad('MODELS_CHANGED');
 for(const model of current){if(members.get(model?.id)!==model||index.get(model.id)!==model||!map?.has(model)||model.modelType!==type||model.shapeManager!==shapes||model.type!==types.get(model.id))bad('MODELS_CHANGED');}
 for(const [key,model] of index){if(model?.modelType===type&&members.get(key)!==model)bad('INDEX_CHANGED');}
}
check();
return result.sort();
})()`;
}
