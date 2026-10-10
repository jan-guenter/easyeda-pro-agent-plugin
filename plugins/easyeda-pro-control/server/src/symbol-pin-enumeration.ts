/** Lossless enumeration of the existing public Pin getter fields for one
 * ordinary project symbol PART. The broken public getAll is never called.
 * Native membership and scalar values independently constrain each public get.
 * Custom pin attributes, multipart/inherited shapes and source GROUP records
 * remain unsupported. This is not a complete native-source/persistence proof.
 */
export const SYMBOL_PIN_ENUMERATION_METHOD = "eda.sch_PrimitivePin.getAll";
export const SYMBOL_PIN_GETTER_FIELDS = [
  "PrimitiveType", "PrimitiveId", "X", "Y", "PinNumber", "PinName", "Rotation", "PinLength", "PinColor", "PinShape", "pinType", "OtherProperty",
] as const;
export const SYMBOL_PIN_ENUMERATION_GUARD_CODES = [
  "CONTEXT", "OWNER", "READY", "PART", "TREE", "SOURCE", "PIN_SET", "PIN_ATTR", "PIN_STATE", "CHANGED", "PUBLIC_METHOD", "PUBLIC_RESULT", "GETTER", "PARITY", "BOUND",
] as const;

/** The maintained wrapper supplies EXPECTED_* and optionally failureCode.
 * Every awaited public lookup is bounded by complete native inventory reproof.
 * No source serializer, parts-sorting getter or native getOrCreate is called.
 */
export function buildSymbolPinEnumerationExpression(diagnostics?: "sdk-failure-code"): string {
  if (diagnostics !== undefined && diagnostics !== "sdk-failure-code") { throw new Error("Unsupported symbol Pin diagnostics."); }
  return `await (async () => {
const bad=reason=>{${diagnostics === "sdk-failure-code" ? "failureCode='SYMBOL_PIN_ENUM_'+reason;" : ""}throw new Error('SYMBOL_PIN_ENUM_'+reason);};
const validId=value=>{if(typeof value!=='string'||!value||value.length>256||[...value].some(c=>c.charCodeAt(0)<32||c.charCodeAt(0)===127))bad('BOUND');return value;};
const sch=globalThis.SCH,ui=globalThis.UI,tabs=ui?.tabBar,manager=sch?.docMemoryManager;
const activeReader=manager?.getActiveDoc,tabReader=tabs?.getActiveTab;
if(typeof activeReader!=='function'||typeof tabReader!=='function')bad('CONTEXT');
const doc=activeReader.call(manager),shapes=doc?.shapeManager,ids=doc?.idManager,index=ids?.idMap;
const project=doc?.projectMgr,cache=doc?.componentCache,consistency=doc?.consistencyImpl,handler=consistency?.decodeAndRealTimeSyncHandler;
const sourceReader=handler?.getSourceCodeIdMap,root=shapes?.root,parts=shapes?._parts,partMap=shapes?._partIdMap,action=shapes?.actionRunner;
if(!doc||!project||!(index instanceof Map)||index.size>20000||typeof sourceReader!=='function'||!Array.isArray(parts)||parts.length!==1||!partMap||typeof partMap!=='object')bad('PART');
const part=parts[0],partShapes=part?.shapes,api=eda.sch_PrimitivePin,get=api?.get;
if(typeof get!=='function')bad('PUBLIC_METHOD');
const check=()=>{
 if(globalThis.SCH!==sch||globalThis.UI!==ui||ui.tabBar!==tabs||tabs.getActiveTab!==tabReader||sch.docMemoryManager!==manager||manager.getActiveDoc!==activeReader||activeReader.call(manager)!==doc||tabReader.call(tabs)!==EXPECTED_TAB_ID||EXPECTED_DOCUMENT_TYPE!==2||doc.docType!==2||doc.uuid!==EXPECTED_DOCUMENT_UUID||doc.project_uuid!==EXPECTED_PROJECT_UUID||doc.tabId!==EXPECTED_TAB_ID||EXPECTED_TAB_ID!==EXPECTED_DOCUMENT_UUID+'@'+EXPECTED_PROJECT_UUID||doc.isSymbolDoc?.()!==true||doc.cmdKey!=='part')bad('CONTEXT');
 if(doc.projectMgr!==project||project.uuid!==EXPECTED_PROJECT_UUID||doc.shapeManager!==shapes||doc.idManager!==ids||shapes.docManager!==doc||shapes.idManager!==ids||ids.docManager!==doc||ids.idMap!==index||doc.consistencyImpl!==consistency||consistency.docManager!==doc||consistency.decodeAndRealTimeSyncHandler!==handler||consistency.handler!==handler||handler.consistencyImpl!==consistency||handler.docManager!==doc||handler.getSourceCodeIdMap!==sourceReader||shapes.actionRunner!==action||eda.sch_PrimitivePin!==api||api.get!==get)bad('OWNER');
 if(consistency.state!=='initialized'||action?.running!==false)bad('READY');
 if(shapes.root!==root||!root||root.modelType!=='Root'||root.parent!=null||root.isConnected!==true||root.shapeManager!==shapes||shapes._parts!==parts||parts.length!==1||parts[0]!==part||shapes._partIdMap!==partMap||Reflect.ownKeys(partMap).length!==1||partMap[part?.id]!==part||part?.modelType!=='Symbol'||part.cmdKey!=='part'||part.partId!==validId(part.id)||part.parent!==root||part.shapes!==partShapes||!(partShapes instanceof Map)||partShapes.size>1000||part.isActive!==true||part.symbolUuid!==EXPECTED_DOCUMENT_UUID||part.deviceUuid!==''||!cache||doc.componentCache!==cache||cache.device!=null||part.groups!==undefined)bad('PART');
};
const capture=()=>{
 check();
 const tree=new Map(),pending=[root];
 for(let offset=0;offset<pending.length;offset++){
  const parent=pending[offset],children=parent.children;
  if(children===undefined){if(parent===root||parent===part||parent.modelType==='Pin')bad('TREE');continue;}
  if(!Array.isArray(children)||children.length>20000||new Set(children).size!==children.length)bad('TREE');
  for(const [position,model] of children.entries()){
   const id=validId(model?.id);
   if(tree.has(id)||model===root||model.parent!==parent||model.shapeManager!==shapes||model.isConnected!==true||index.get(id)!==model||model.locked!==undefined&&typeof model.locked!=='boolean'||!['Symbol','Pin','Attr','Text','Rect','Circle','Polyline','UnConnectDot'].includes(model.modelType))bad('TREE');
   tree.set(id,{model,parent,position,type:model.modelType,locked:model.locked});pending.push(model);
   if(tree.size>20000)bad('BOUND');
  }
 }
 if(root.children.length!==1||root.children[0]!==part||tree.size!==index.size)bad('TREE');
 for(const [id,model] of index){if(tree.get(id)?.model!==model)bad('TREE');}
 const source=sourceReader.call(handler);
 if(!(source instanceof Map)||source.size>20000||source.get(part.id)!==1)bad('SOURCE');
 for(const [id,marker] of source){validId(id);if(marker!==1||tree.get(id)?.model!==index.get(id)||!index.has(id))bad('SOURCE');}
 const pins=partShapes.get('Pin');
 if(pins!==undefined&&(!(pins instanceof Set)||pins.size>256))bad('PIN_SET');
 const native=new Map(),fields=new Map(),attributes=new Map();
 for(const [id,entry] of tree){
  const model=entry.model;
  if(model.modelType==='Pin'){
   if(model.parent!==part||!pins?.has(model)||source.get(id)!==1||!Array.isArray(model.children)||model.children.length>4||!(model._attrMap instanceof Map)||!(model._attrIdMap instanceof Map)||model._attrMap.size!==3||model._attrIdMap.size!==3||model.junctionModel!=null||model.noConnect!=null)bad('PIN_SET');
   const values=new Map();let dots=0;
   for(const child of model.children){
    if(child.modelType==='UnConnectDot'){
     dots++;if(dots>1||model.unConnectDotModel!==child||source.has(child.id)||child.children!==undefined&&child.children.length!==0)bad('PIN_ATTR');continue;
    }
    if(child.modelType!=='Attr'||!['Pin Name','Pin Number','Pin Type'].includes(child.key)||values.has(child.key)||model._attrMap.get(child.key)!==child||model._attrIdMap.get(child.id)!==child||source.get(child.id)!==1||child.children!==undefined&&child.children.length!==0||typeof child.value!=='string'||child.value.length>4096)bad('PIN_ATTR');
    values.set(child.key,child.value);
   }
   if(values.size!==3||dots===0&&model.unConnectDotModel!=null)bad('PIN_ATTR');
   if(![model.origin?.x,model.origin?.y,model.rotation,model.length].every(value=>typeof value==='number'&&Number.isFinite(value))||model.length<0||!(model.color===null||typeof model.color==='string'&&model.color.length<=4096)||!['None','Inverted','Clock','Inverted Clock'].includes(model.pinShape)||!['IN','OUT','BI','Passive','Open Collector','Open Emitter','Power','Ground','HIZ','Terminator','Undefined'].includes(values.get('Pin Type')))bad('PIN_STATE');
   native.set(id,model);attributes.set(id,{byKey:model._attrMap,byId:model._attrIdMap});fields.set(id,{PrimitiveType:'Pin',PrimitiveId:id,X:model.origin.x,Y:-model.origin.y,PinNumber:values.get('Pin Number'),PinName:values.get('Pin Name'),Rotation:model.rotation,PinLength:model.length,PinColor:model.color,PinShape:model.pinShape,pinType:values.get('Pin Type'),OtherProperty:undefined});
  } else if(model!==part){
   if(model.modelType==='Symbol')bad('PART');
   if(model.modelType==='UnConnectDot'){if(model.parent?.modelType!=='Pin'||model.parent.unConnectDotModel!==model||source.has(id))bad('PIN_ATTR');}
   else if(model.modelType==='Attr'){if(model.parent!==part&&model.parent?.modelType!=='Pin')bad('TREE');}
   else if(model.parent!==part||source.get(id)!==1)bad('TREE');
  }
 }
 if(native.size!==(pins?.size??0))bad('PIN_SET');
 for(const pin of pins??[]){if(native.get(pin?.id)!==pin)bad('PIN_SET');}
 check();return{tree,source,pins,native,fields,attributes};
};
const baseline=capture();
const reprove=()=>{
 const now=capture();
 if(now.tree.size!==baseline.tree.size||now.source.size!==baseline.source.size||now.pins!==baseline.pins||now.native.size!==baseline.native.size)bad('CHANGED');
 for(const [id,entry] of baseline.tree){const current=now.tree.get(id);if(!current||current.model!==entry.model||current.parent!==entry.parent||current.position!==entry.position||current.type!==entry.type||current.locked!==entry.locked)bad('CHANGED');}
 for(const [id,marker] of baseline.source){if(now.source.get(id)!==marker)bad('CHANGED');}
 for(const [id,value] of baseline.attributes){const current=now.attributes.get(id);if(!current||current.byKey!==value.byKey||current.byId!==value.byId)bad('CHANGED');}
 for(const [id,value] of baseline.fields){const current=now.fields.get(id);if(!current)bad('CHANGED');for(const field of ${JSON.stringify(SYMBOL_PIN_GETTER_FIELDS)}){if(!Object.is(current[field],value[field]))bad('CHANGED');}}
};
const result=[];
for(const id of [...baseline.native.keys()].sort()){
 reprove();const pin=await get.call(api,id);reprove();
 if(!pin||typeof pin!=='object'||Array.isArray(pin))bad('PUBLIC_RESULT');
 const expected=baseline.fields.get(id);
 for(const field of ${JSON.stringify(SYMBOL_PIN_GETTER_FIELDS)}){
  const getter=pin['getState_'+field];if(typeof getter!=='function')bad('GETTER');
  const value=getter.call(pin);if(!Object.is(value,expected[field]))bad('PARITY');
 }
 result.push(pin);
}
reprove();return result;
})()`;
}
