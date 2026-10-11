import { z } from "zod";

import { schematicTextStateSchema, schematicTextStatesSchema } from "./schematic-text-read.ts";
import { schematicNetGroupStateSchema, schematicNetGroupStatesSchema } from "./schematic-netgroup-read.ts";

export const SCHEMATIC_PRIMITIVE_READ_METHODS = [
  "eda.sch_Primitive.getPrimitiveByPrimitiveId", "eda.sch_Primitive.getPrimitivesByPrimitiveId",
] as const;
// oxlint-disable-next-line eslint/no-control-regex -- Selectors cannot contain bridge control characters.
const identity = z.string().min(1).max(256).regex(/^[^\u0000-\u001F\u007F]+$/u);
const identities = z.array(identity).min(1).max(256).refine((ids) => new Set(ids).size === ids.length, "Duplicate selectors.");
const multipleArguments = z.object({ ids: identities }).strict();
export const schematicPrimitiveReadRequestSchema = z.discriminatedUnion("method", [
  z.object({ method: z.literal(SCHEMATIC_PRIMITIVE_READ_METHODS[0]), arguments: z.object({ id: identity }).strict() }).strict(),
  z.object({ method: z.literal(SCHEMATIC_PRIMITIVE_READ_METHODS[1]), arguments: multipleArguments }).strict(),
]);
export const schematicPrimitiveStateSchema = z.discriminatedUnion("modelType", [schematicTextStateSchema, schematicNetGroupStateSchema]);
export const schematicPrimitiveStatesSchema = z.array(schematicPrimitiveStateSchema).min(1).max(256);
export const SCHEMATIC_PRIMITIVE_GUARD_CODES = [
  "IDENTITY", "MANAGER", "INVENTORY", "CONTEXT", "OWNER", "READY", "TREE", "SOURCE", "FAMILY", "CHILDREN", "STATE", "BOUND", "TARGET", "CHANGED",
] as const;
export function isSchematicPrimitiveReadMethod(method: string): boolean { return SCHEMATIC_PRIMITIVE_READ_METHODS.some((entry) => entry === method); }

/** Pinned API 59236967, UTF-16 1511705/1512312: public generic readers
 * delegate to family wrappers and omit missing results. This narrower native
 * equivalent reuses the reviewed Text and NetGroup DTO/collection contracts,
 * but captures their COMPLETE mixed state against ONE retained page/manager,
 * tree, source and ID index. It never stitches independent family observations.
 * Text and line backing getters, source style conversion and NetName fields
 * have the same pinned SCH provenance as schematic-{text,netgroup}-read.ts.
 * Existing family readers stay unchanged. No compiler, serializer, public
 * getter, network, navigation or Save is invoked. This is point-in-time state,
 * not complete source, connectivity, durable proof or atomic read isolation.
 */
export function buildSchematicPrimitiveReadExpression(input: unknown, diagnostics?: "sdk-failure-code"): string {
  const request = schematicPrimitiveReadRequestSchema.parse(input);
  if (diagnostics !== undefined && diagnostics !== "sdk-failure-code") { throw new Error("Unsupported schematic primitive diagnostics."); }
  const singular = request.method === SCHEMATIC_PRIMITIVE_READ_METHODS[0];
  const selected = "id" in request.arguments ? [request.arguments.id] : request.arguments.ids;
  return `(() => {
const bad=reason=>{${diagnostics === "sdk-failure-code" ? "failureCode='SCH_PRIMITIVE_'+reason;" : ""}throw new Error('SCH_PRIMITIVE_'+reason);};
const selected=${JSON.stringify(selected)},singular=${JSON.stringify(singular)};
const validId=value=>{if(typeof value!=='string'||!value||value.length>256||[...value].some(c=>c.charCodeAt(0)<32||c.charCodeAt(0)===127))bad('IDENTITY');return value;};
const sch=globalThis.SCH,ui=globalThis.UI,tabs=ui?.tabBar,manager=sch?.docMemoryManager;
const activeReader=manager?.getActiveDoc,tabReader=tabs?.getActiveTab;
if(typeof activeReader!=='function'||typeof tabReader!=='function')bad('MANAGER');
const page=activeReader.call(manager),shapes=page?.shapeManager,ids=page?.idManager,index=ids?.idMap;
const project=page?.projectMgr,modelMap=shapes?.modelMap,modelReader=shapes?.getModels,root=shapes?.root;
const consistency=page?.consistencyImpl,handler=consistency?.decodeAndRealTimeSyncHandler,sourceReader=handler?.getSourceCodeIdMap,action=shapes?.actionRunner;
if(!page||!project||!(index instanceof Map)||index.size>20000||!(modelMap instanceof Map)||modelMap.size>1000||typeof modelReader!=='function'||typeof sourceReader!=='function')bad('INVENTORY');
const check=()=>{
 if(globalThis.SCH!==sch||globalThis.UI!==ui||ui.tabBar!==tabs||tabs.getActiveTab!==tabReader||sch.docMemoryManager!==manager||manager.getActiveDoc!==activeReader||activeReader.call(manager)!==page||tabReader.call(tabs)!==EXPECTED_TAB_ID||EXPECTED_DOCUMENT_TYPE!==1||page.uuid!==EXPECTED_DOCUMENT_UUID||page.project_uuid!==EXPECTED_PROJECT_UUID||page.tabId!==EXPECTED_TAB_ID||EXPECTED_TAB_ID!==EXPECTED_DOCUMENT_UUID+'@'+EXPECTED_PROJECT_UUID||page.isSchSheetDoc?.()!==true||page.isBlockSymbolInstancePage!==false)bad('CONTEXT');
 if(page.projectMgr!==project||project.uuid!==EXPECTED_PROJECT_UUID||page.shapeManager!==shapes||page.idManager!==ids||shapes.docManager!==page||shapes.idManager!==ids||ids.docManager!==page||ids.idMap!==index||shapes.modelMap!==modelMap||shapes.getModels!==modelReader||page.consistencyImpl!==consistency||consistency.docManager!==page||consistency.decodeAndRealTimeSyncHandler!==handler||consistency.handler!==handler||handler.consistencyImpl!==consistency||handler.docManager!==page||handler.getSourceCodeIdMap!==sourceReader||shapes.actionRunner!==action)bad('OWNER');
 if(consistency.state!=='initialized'||action?.running!==false)bad('READY');
 if(shapes.root!==root||!root||root.modelType!=='Root'||root.parent!=null||root.isConnected!==true||root.shapeManager!==shapes)bad('TREE');
};
const captureTree=()=>{
 const tree=new Map(),pending=[root];
 for(let offset=0;offset<pending.length;offset++){
  const parent=pending[offset],children=parent.children;
  if(children===undefined){if(parent===root)bad('TREE');continue;}
  if(!Array.isArray(children)||children.length>20000||new Set(children).size!==children.length)bad('TREE');
  for(const [position,model] of children.entries()){
   const id=validId(model?.id);
   if(tree.has(id)||model===root||model.parent!==parent||model.shapeManager!==shapes||model.isConnected!==true||index.get(id)!==model||model.locked!==undefined&&typeof model.locked!=='boolean')bad('TREE');
   tree.set(id,{model,parent,position,type:model.modelType,locked:model.locked});pending.push(model);if(tree.size>20000)bad('BOUND');
  }
 }
 if(tree.size!==index.size)bad('TREE');for(const [id,model] of index){if(tree.get(id)?.model!==model)bad('TREE');}return tree;
};
const sameTree=(before,after)=>{if(before.size!==after.size)bad('CHANGED');for(const [id,left] of before){const right=after.get(id);if(!right||left.model!==right.model||left.parent!==right.parent||left.position!==right.position||left.type!==right.type||!Object.is(left.locked,right.locked))bad('CHANGED');}};
const captureSource=tree=>{const source=sourceReader.call(handler);if(!(source instanceof Map)||source.size>20000)bad('SOURCE');for(const [id,marker] of source){validId(id);if(marker!==1||!tree.has(id)||tree.get(id).model!==index.get(id))bad('SOURCE');}return new Map(source);};
const sameSource=(before,after)=>{if(before.size!==after.size)bad('CHANGED');for(const [id,marker] of before){if(after.get(id)!==marker)bad('CHANGED');}};
const boundedArray=(value,limit)=>{if(!Array.isArray(value)||value.length>limit||new Set(value).size!==value.length)bad('CHILDREN');return [...value];};
const finite=value=>{if(typeof value!=='number'||!Number.isFinite(value)||Math.abs(value)>1000000000)bad('STATE');return value;};
const styleName=value=>{if(value===null)return null;if(typeof value!=='number'||!Number.isInteger(value)||value<0||value>3)bad('STATE');return ['SOLID','SHORT_DASH','DOT','DOT_DASH'][value];};
const textFields=['modelType','x','y','value','rotation','color','fontFamily','fontSize','fontWeight','italic','underline','hAlign','vAlign'];
const captureText=(tree,source)=>{
 const family=modelMap.get('Text'),models=modelReader.call(shapes,'Text');
 if(family!==undefined&&(!(family instanceof Set)||family.size>256)||!Array.isArray(models)||models.length>256||models.length!==(family?.size??0))bad('FAMILY');
 const members=new Map(),states=new Map();let characters=0;
 for(const model of models){
  const id=validId(model?.id);
  if(members.has(id)||model.modelType!=='Text'||model.cmdKey!=='text'||model.parent!==root||model.shapeManager!==shapes||index.get(id)!==model||!family?.has(model)||source.get(id)!==1)bad('FAMILY');
  const state={primitiveId:id};for(const field of textFields)state[field]=model[field];
  for(const field of ['x','y','rotation','fontSize']){const value=state[field];if(value!==null&&(typeof value!=='number'||!Number.isFinite(value)||Math.abs(value)>1000000000||field==='fontSize'&&value<0))bad('STATE');}
  for(const field of ['fontWeight','italic','underline']){if(state[field]!==null&&typeof state[field]!=='boolean')bad('STATE');}
  for(const field of ['hAlign','vAlign']){if(state[field]!==null&&![0,1,2].includes(state[field]))bad('STATE');}
  if(state.modelType!=='Text'||typeof state.value!=='string'||state.value.length>65536||!(state.color===null||typeof state.color==='string'&&state.color.length<=4096)||!(state.fontFamily===null||typeof state.fontFamily==='string'&&state.fontFamily.length<=4096))bad('STATE');
  characters+=state.value.length+(state.color?.length??0)+(state.fontFamily?.length??0);if(characters>262144)bad('BOUND');
  members.set(id,model);states.set(id,state);
 }
 for(const [id,entry] of tree){if(entry.type==='Text'&&entry.parent===root&&members.get(id)!==entry.model)bad('FAMILY');}
 return{family,members,states,characters};
};
const reproveText=snapshot=>{
 if(modelMap.get('Text')!==snapshot.family||(snapshot.family?.size??0)!==snapshot.members.size)bad('CHANGED');
 for(const [id,model] of snapshot.members){
  if(!snapshot.family.has(model)||model.id!==id||model.cmdKey!=='text'||model.parent!==root||model.shapeManager!==shapes||index.get(id)!==model||model.isConnected!==true)bad('CHANGED');
  const state=snapshot.states.get(id);for(const field of textFields){if(!Object.is(state[field],model[field]))bad('CHANGED');}
 }
};
const capture=()=>{
 check();const tree=captureTree(),source=captureSource(tree),text=captureText(tree,source);
 check();const family=modelMap.get('NetGroup'),models=modelReader.call(shapes,'NetGroup');
 if(family!==undefined&&(!(family instanceof Set)||family.size>256)||!Array.isArray(models)||models.length>256||models.length!==(family?.size??0))bad('FAMILY');
 const members=new Map(),states=new Map(),collections=new Map();let lineCount=0,nameCount=0,attributeCount=0,characters=text.characters;
 for(const model of models){
  const id=validId(model?.id);
  if(members.has(id)||text.members.has(id)||model.modelType!=='NetGroup'||model.cmdKey!=='netGroup'||model.tagName!=='NetGroup'||!['wire','bus'].includes(model.type)||model.parent!==root||model.shapeManager!==shapes||index.get(id)!==model||!family?.has(model)||source.get(id)!==1||model.combination)bad('FAMILY');
  const lines=boundedArray(model.lines,1024),names=boundedArray(model.netNames,1024),children=boundedArray(model.children,20000);
  if(!lines.length)bad('CHILDREN');const expectedLineType=model.type==='wire'?'Wire':'Bus';
  const lineSet=new Set(lines),nameSet=new Set(names),lineStyles=new Map(),custom=[],markers=[];
  const child=(item)=>{validId(item?.id);if(item.parent!==model||item.shapeManager!==shapes||index.get(item.id)!==item||!children.includes(item)||!tree.has(item.id)||(item.children!==undefined&&(!Array.isArray(item.children)||item.children.length)))bad('CHILDREN');};
  const lineStates=lines.map(item=>{
   child(item);if(++lineCount>1024)bad('BOUND');
   if(item.modelType!==expectedLineType||item.tagName!=='NetGroupLine'||item.type!==model.type||item.cmdKey!==model.type||source.get(item.id)!==1)bad('CHILDREN');
   const points=item.points;if(!Array.isArray(points)||points.length<1||points.length>2)bad('STATE');
   const nativeStyle=item.strokeStyle;
   const result={primitiveId:item.id,points:points.map(point=>[finite(point?.x),finite(point?.y)]),color:item.strokeColor,width:item.strokeWidth,strokeStyle:styleName(nativeStyle)};
   if(!(result.color===null||typeof result.color==='string'&&result.color.length<=4096)||result.width!==null&&(typeof result.width!=='number'||!Number.isFinite(result.width)||result.width<0||result.width>1000000000))bad('STATE');
   lineStyles.set(item.id,nativeStyle);
   characters+=result.color?.length??0;return result;
  });
  const nameStates=names.map(item=>{
   child(item);if(++nameCount>1024)bad('BOUND');
   if(item.modelType!=='NetLabel'||item.tagName!=='NetName'||item.cmdKey!=='netlabel'||item.key!=='Name'||item.keyInSourceCode!=='NET'||source.get(item.id)!==1)bad('CHILDREN');
   const value=item.value;if(typeof value!=='string'||value.length>65536)bad('STATE');characters+=value.length;return{primitiveId:item.id,value};
  });
  for(const item of children){
   child(item);if(lineSet.has(item)||nameSet.has(item))continue;
   if(item.modelType==='Attr'&&item.tagName==='Attr'){if(++attributeCount>1024)bad('BOUND');if(source.get(item.id)!==1)bad('CHILDREN');custom.push(item.id);}
   else if(['Junction','UnConnectDot'].includes(item.modelType)&&item.tagName===item.modelType&&item.notAddHistory===true&&!source.has(item.id)){markers.push(item.id);}
   else bad('CHILDREN');
  }
  if(characters>262144)bad('BOUND');
  members.set(id,model);collections.set(id,{lines,names,children:[...children],markers,lineStyles});
  states.set(id,{primitiveId:id,modelType:'NetGroup',kind:model.type,lines:lineStates.sort((a,b)=>a.primitiveId<b.primitiveId?-1:1),names:nameStates.sort((a,b)=>a.primitiveId<b.primitiveId?-1:1),customAttributeIds:custom.sort()});
 }
 for(const [id,entry] of tree){if(entry.type==='NetGroup'&&entry.parent===root&&members.get(id)!==entry.model)bad('FAMILY');}
 sameSource(source,captureSource(tree));sameTree(tree,captureTree());if(modelMap.get('NetGroup')!==family||(family?.size??0)!==members.size)bad('CHANGED');
 for(const model of members.values()){if(!family?.has(model)||model.cmdKey!=='netGroup'||model.tagName!=='NetGroup'||model.combination)bad('CHANGED');}
 reproveText(text);check();return{tree,source,family,members,states,collections,text};
};
const before=capture(),after=capture();
if(before.text.family!==after.text.family||before.text.members.size!==after.text.members.size)bad('CHANGED');
for(const [id,model] of before.text.members){if(after.text.members.get(id)!==model)bad('CHANGED');const left=before.text.states.get(id),right=after.text.states.get(id);for(const field of textFields){if(!Object.is(left[field],right[field]))bad('CHANGED');}}
if(before.family!==after.family||before.members.size!==after.members.size)bad('CHANGED');sameTree(before.tree,after.tree);sameSource(before.source,after.source);
const sameList=(left,right)=>{if(left.length!==right.length||left.some((item,index)=>item!==right[index]))bad('CHANGED');};
for(const [id,model] of before.members){
 if(after.members.get(id)!==model)bad('CHANGED');const left=before.states.get(id),right=after.states.get(id),lc=before.collections.get(id),rc=after.collections.get(id);
 for(const key of ['lines','names','children','markers'])sameList(lc[key],rc[key]);
 if(left.kind!==right.kind||left.lines.length!==right.lines.length||left.names.length!==right.names.length)bad('CHANGED');sameList(left.customAttributeIds,right.customAttributeIds);
 for(let i=0;i<left.lines.length;i++){const a=left.lines[i],b=right.lines[i];if(a.primitiveId!==b.primitiveId||!Object.is(a.color,b.color)||!Object.is(a.width,b.width)||!Object.is(a.strokeStyle,b.strokeStyle)||!Object.is(lc.lineStyles.get(a.primitiveId),rc.lineStyles.get(b.primitiveId))||a.points.length!==b.points.length)bad('CHANGED');for(let j=0;j<a.points.length;j++){if(!Object.is(a.points[j][0],b.points[j][0])||!Object.is(a.points[j][1],b.points[j][1]))bad('CHANGED');}}
 for(let i=0;i<left.names.length;i++){if(left.names[i].primitiveId!==right.names[i].primitiveId||left.names[i].value!==right.names[i].value)bad('CHANGED');}
}
// Reprove retained scalar fields after the final source/tree collection. This
// Prevents a late inventory callback from changing geometry after capture.
// Text reproof precedes group reproof so it cannot conceal a later line change.
reproveText(after.text);
for(const [id,model] of after.members){
 const state=after.states.get(id),collection=after.collections.get(id);
 if(model.type!==state.kind||model.modelType!=='NetGroup'||model.cmdKey!=='netGroup'||model.tagName!=='NetGroup')bad('CHANGED');
 sameList(collection.lines,boundedArray(model.lines,1024));sameList(collection.names,boundedArray(model.netNames,1024));sameList(collection.children,boundedArray(model.children,20000));
 const lines=new Map(collection.lines.map(item=>[item.id,item])),names=new Map(collection.names.map(item=>[item.id,item])),children=new Map(collection.children.map(item=>[item.id,item]));
 for(const row of state.lines){const current=lines.get(row.primitiveId),points=current?.points;if(!current||current.modelType!==(state.kind==='wire'?'Wire':'Bus')||current.tagName!=='NetGroupLine'||current.cmdKey!==state.kind||current.type!==state.kind||!Array.isArray(points)||points.length!==row.points.length||!Object.is(current.strokeColor,row.color)||!Object.is(current.strokeWidth,row.width)||!Object.is(current.strokeStyle,collection.lineStyles.get(row.primitiveId)))bad('CHANGED');for(let j=0;j<points.length;j++){if(!Object.is(points[j]?.x,row.points[j][0])||!Object.is(points[j]?.y,row.points[j][1]))bad('CHANGED');}}
 for(const row of state.names){const current=names.get(row.primitiveId);if(!current||current.modelType!=='NetLabel'||current.tagName!=='NetName'||current.cmdKey!=='netlabel'||current.key!=='Name'||current.keyInSourceCode!=='NET'||current.value!==row.value)bad('CHANGED');}
 for(const id of state.customAttributeIds){const current=children.get(id);if(current?.modelType!=='Attr'||current.tagName!=='Attr')bad('CHANGED');}
 for(const id of collection.markers){const current=children.get(id);if(!current||!['Junction','UnConnectDot'].includes(current.modelType)||current.tagName!==current.modelType||current.notAddHistory!==true)bad('CHANGED');}
}
const states=new Map([...before.text.states,...before.states]);
for(const id of selected){if(!states.has(id))bad('TARGET');}
check();const rows=selected.map(id=>states.get(id));return singular?rows[0]:rows;
})()`;
}

/** Validate the original requested order without weakening the family DTO
 * refinements. Only temporary validation projections are sorted; output is not.
 */
export function validateSchematicPrimitiveStates(value: unknown, input: unknown): void {
  const request = schematicPrimitiveReadRequestSchema.parse(input);
  const rows = "id" in request.arguments ? [schematicPrimitiveStateSchema.parse(value)] : schematicPrimitiveStatesSchema.parse(value);
  const wanted = "id" in request.arguments ? [request.arguments.id] : request.arguments.ids;
  if (rows.length !== wanted.length || rows.some((row, index) => row.primitiveId !== wanted[index])) { throw new Error("Primitive observation differs from the exact ordered selectors."); }
  const text = rows.filter((row) => row.modelType === "Text").toSorted((a, b) => a.primitiveId < b.primitiveId ? -1 : 1);
  const groups = rows.filter((row) => row.modelType === "NetGroup").toSorted((a, b) => a.primitiveId < b.primitiveId ? -1 : 1);
  schematicTextStatesSchema.parse(text); schematicNetGroupStatesSchema.parse(groups);
  const allIds = [...text.map((row) => row.primitiveId), ...groups.flatMap((row) => [row.primitiveId,
    ...row.lines.map((line) => line.primitiveId), ...row.names.map((name) => name.primitiveId), ...row.customAttributeIds])];
  const characters = text.reduce((sum, row) => sum + row.value.length + (row.color?.length ?? 0) + (row.fontFamily?.length ?? 0), 0)
    + groups.reduce((sum, row) => sum + row.names.reduce((count, name) => count + name.value.length, 0) + row.lines.reduce((count, line) => count + (line.color?.length ?? 0), 0), 0);
  if (new Set(allIds).size !== allIds.length || characters > 262_144) { throw new Error("Primitive observation has aliased identities or exceeds the combined string bound."); }
}
