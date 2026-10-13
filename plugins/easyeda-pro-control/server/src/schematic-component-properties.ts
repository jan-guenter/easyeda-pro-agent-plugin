import { z } from "zod";

/** Native equivalent for the installed component-property wrapper's broken
 * result ABI. SCH Symbol.getAttr() copies _attrMap values. Include inherited
 * and generated direct attributes, not only stored ATTR rows or OtherProperty.
 * Never evaluate attribute values, multiPart, serializers, compiler or RPC.
 */
export const SCHEMATIC_COMPONENT_PROPERTY_METHOD = "eda.sch_PrimitiveComponent.getAllPropertyNames";

/** Empty and case-distinct keys are data. No trimming, case folding, coercion,
 * prototype-key filtering or loss of inherited attribute names is allowed.
 */
export const schematicComponentPropertyNamesSchema = z.array(z.string().max(1024)).max(20_000).refine(
  (names) => names.reduce((total, key) => total + key.length, 0) <= 131_072
    && names.every((key, index) => index === 0 || (names[index - 1] ?? "") < key),
  "Component property names must be bounded, sorted and unique.",
);

export const SCHEMATIC_COMPONENT_PROPERTY_GUARD_CODES = [
  "IDENTITY", "MANAGER", "INVENTORY", "RECEIVER_CHANGED", "CONTEXT", "OWNER_CHANGED", "NOT_READY",
  "TREE", "TREE_MEMBERSHIP", "TREE_CHANGED", "SOURCE_INVENTORY", "SOURCE_MODEL", "SOURCE_CHANGED",
  "MODEL_MAP", "MODEL_LIST", "MODEL_MEMBERSHIP", "MODEL_KIND", "MODELS_CHANGED",
  "ATTRIBUTE_MAP", "ATTRIBUTE_LIST", "ATTRIBUTE_KEY", "ATTRIBUTE_MEMBERSHIP", "ATTRIBUTES_CHANGED", "RESULT_BOUND",
] as const;

/** Synchronous observation under the maintained EXPECTED_* context guard.
 * Source IDs prove stored-model presence; the independent complete tree/index
 * and each symbol's Attr children prove inherited membership too. Unsupported
 * cross-linked trees and structural GROUP source IDs refuse the entire read.
 */
export function buildSchematicComponentPropertyNamesExpression(diagnostics?: "sdk-failure-code"): string {
  if (diagnostics !== undefined && diagnostics !== "sdk-failure-code") { throw new Error("Unsupported schematic property diagnostics."); }
  return `(() => {
const bad=reason=>{${diagnostics === "sdk-failure-code" ? "failureCode='SCH_COMPONENT_PROPERTIES_'+reason;" : ""}throw new Error('SCH_COMPONENT_PROPERTIES_'+reason);};
const validId=value=>{if(typeof value!=='string'||!value||value.length>256||[...value].some(character=>character.charCodeAt(0)<32||character.charCodeAt(0)===127))bad('IDENTITY');return value;};
const sch=globalThis.SCH,ui=globalThis.UI,tabs=ui?.tabBar;
const manager=sch?.docMemoryManager,activeReader=manager?.getActiveDoc;
if(typeof activeReader!=='function'||typeof tabs?.getActiveTab!=='function')bad('MANAGER');
const tabReader=tabs.getActiveTab,page=activeReader.call(manager);
const shapes=page?.shapeManager,ids=page?.idManager,index=ids?.idMap,modelMap=shapes?.modelMap;
const consistency=page?.consistencyImpl,handler=consistency?.decodeAndRealTimeSyncHandler;
const sourceReader=handler?.getSourceCodeIdMap,modelReader=shapes?.getModels,project=page?.projectMgr;
const action=shapes?.actionRunner,root=shapes?.root;
if(!page||!project||typeof sourceReader!=='function'||typeof modelReader!=='function'||!(index instanceof Map)||index.size>100000||!(modelMap instanceof Map)||modelMap.size>1000)bad('INVENTORY');
const check=()=>{
 if(globalThis.SCH!==sch||globalThis.UI!==ui||ui.tabBar!==tabs||tabs.getActiveTab!==tabReader||sch.docMemoryManager!==manager||manager.getActiveDoc!==activeReader||activeReader.call(manager)!==page||tabReader.call(tabs)!==EXPECTED_TAB_ID)bad('RECEIVER_CHANGED');
 if(EXPECTED_DOCUMENT_TYPE!==1||page.uuid!==EXPECTED_DOCUMENT_UUID||page.project_uuid!==EXPECTED_PROJECT_UUID||page.tabId!==EXPECTED_TAB_ID||EXPECTED_TAB_ID!==EXPECTED_DOCUMENT_UUID+'@'+EXPECTED_PROJECT_UUID||page.isSchSheetDoc?.()!==true||page.isBlockSymbolInstancePage!==false)bad('CONTEXT');
 if(page.projectMgr!==project||project.uuid!==EXPECTED_PROJECT_UUID||page.shapeManager!==shapes||page.idManager!==ids||shapes.docManager!==page||shapes.idManager!==ids||ids.docManager!==page||ids.idMap!==index||shapes.modelMap!==modelMap||shapes.getModels!==modelReader||page.consistencyImpl!==consistency||consistency.docManager!==page||consistency.decodeAndRealTimeSyncHandler!==handler||consistency.handler!==handler||handler.consistencyImpl!==consistency||handler.docManager!==page||handler.getSourceCodeIdMap!==sourceReader||shapes.actionRunner!==action)bad('OWNER_CHANGED');
 if(consistency.state!=='initialized'||action?.running!==false)bad('NOT_READY');
 if(shapes.root!==root||!root||root.modelType!=='Root'||root.shapeManager!==shapes||root.isConnected!==true||root.parent!=null)bad('TREE');
};
check();
const captureTree=()=>{
 const result=new Map(),pending=[root];
 for(let offset=0;offset<pending.length;offset++){
  const parent=pending[offset],children=parent.children;
  if(children===undefined){if(parent===root)bad('TREE');continue;}
  if(!Array.isArray(children)||children.length>100000||new Set(children).size!==children.length)bad('TREE');
  for(const [position,model] of children.entries()){
   const key=validId(model?.id);
   if(result.has(key)||model===root||model.parent!==parent||model.shapeManager!==shapes||model.isConnected!==true||index.get(key)!==model)bad('TREE_MEMBERSHIP');
   result.set(key,{model,parent,position,type:model.modelType});pending.push(model);
   if(result.size>100000)bad('TREE');
  }
 }
 if(result.size!==index.size)bad('TREE_MEMBERSHIP');
 for(const [key,model] of index){if(result.get(key)?.model!==model)bad('TREE_MEMBERSHIP');}
 return result;
};
const tree=captureTree(),sources=sourceReader.call(handler);
if(!(sources instanceof Map)||sources.size>100000)bad('SOURCE_INVENTORY');
const sourceModels=new Map();
for(const [key,marker] of sources){validId(key);const model=index.get(key);if(marker!==1||!model||model.id!==key)bad('SOURCE_MODEL');sourceModels.set(key,model);}
const family=modelMap.get('Symbol');
if(family!==undefined&&(!(family instanceof Set)||family.size>20000))bad('MODEL_MAP');
const models=modelReader.call(shapes,'Symbol');
if(!Array.isArray(models)||models.length>20000||models.length!==(family?.size??0))bad('MODEL_LIST');
const members=new Map(),names=new Set();
let characters=0;
const attributesOf=model=>{
 const attrMap=model._attrMap,reader=model.getAttr;
 if(!(attrMap instanceof Map)||attrMap.size>4096||typeof reader!=='function'||!Array.isArray(model.children))bad('ATTRIBUTE_MAP');
 const attrs=reader.call(model);
 if(!Array.isArray(attrs)||attrs.length>4096||attrs.length!==attrMap.size)bad('ATTRIBUTE_LIST');
 const entries=new Map();
 for(const attr of attrs){
  const key=attr?.key,id=validId(attr?.id);
  if(typeof key!=='string'||key.length>1024)bad('ATTRIBUTE_KEY');
  if(entries.has(key)||attr.modelType!=='Attr'||attr.parent!==model||attr.shapeManager!==shapes||attr.isConnected!==true||index.get(id)!==attr||attrMap.get(key)!==attr)bad('ATTRIBUTE_MEMBERSHIP');
  entries.set(key,attr);
 }
 const children=model.children.filter(child=>child?.modelType==='Attr');
 if(children.length!==entries.size)bad('ATTRIBUTE_MEMBERSHIP');
 for(const attr of children){if(entries.get(attr.key)!==attr)bad('ATTRIBUTE_MEMBERSHIP');}
 return {attrMap,reader,entries};
};
for(const model of models){
 const id=validId(model?.id);
 if(members.has(id)||model.modelType!=='Symbol'||model.parent!==root||model.shapeManager!==shapes||index.get(id)!==model||!family?.has(model)||sourceModels.get(id)!==model)bad('MODEL_MEMBERSHIP');
 if(!['part','sheet','netflag','netport','offPageConnector','nonElectrical_symbol','short_symbol','diffPairsFlag'].includes(model.cmdKey))bad('MODEL_KIND');
 const attributes=attributesOf(model);
 members.set(id,{model,kind:model.cmdKey,...attributes});
 for(const key of attributes.entries.keys()){
  if(!names.has(key)){names.add(key);characters+=key.length;}
  if(names.size>20000||characters>131072)bad('RESULT_BOUND');
 }
}
for(const [id,entry] of tree){if(entry.type==='Symbol'&&entry.parent===root&&members.get(id)?.model!==entry.model)bad('MODEL_MEMBERSHIP');}
const finalSources=sourceReader.call(handler);
if(!(finalSources instanceof Map)||finalSources.size!==sources.size)bad('SOURCE_CHANGED');
for(const [id,marker] of sources){if(finalSources.get(id)!==marker||index.get(id)!==sourceModels.get(id))bad('SOURCE_CHANGED');}
if(modelMap.get('Symbol')!==family||family!==undefined&&family.size!==members.size)bad('MODELS_CHANGED');
const currentModels=modelReader.call(shapes,'Symbol');
if(!Array.isArray(currentModels)||currentModels.length!==members.size||new Set(currentModels).size!==currentModels.length)bad('MODELS_CHANGED');
for(const model of currentModels){
 const prior=members.get(model?.id);
 if(!prior||prior.model!==model||!family?.has(model)||index.get(model.id)!==model||model.modelType!=='Symbol'||model.parent!==root||model.cmdKey!==prior.kind)bad('MODELS_CHANGED');
 const current=attributesOf(model);
 if(current.attrMap!==prior.attrMap||current.reader!==prior.reader||current.entries.size!==prior.entries.size)bad('ATTRIBUTES_CHANGED');
 for(const [key,attr] of prior.entries){if(current.entries.get(key)!==attr)bad('ATTRIBUTES_CHANGED');}
}
const finalTree=captureTree();
if(finalTree.size!==tree.size)bad('TREE_CHANGED');
for(const [id,entry] of tree){const current=finalTree.get(id);if(!current||current.model!==entry.model||current.parent!==entry.parent||current.position!==entry.position||current.type!==entry.type)bad('TREE_CHANGED');}
check();
return [...names].sort();
})()`;
}
