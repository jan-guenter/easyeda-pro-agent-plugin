import { z } from "zod";

/** Native group geometry and literal names. Coordinates retain native Y and
 * each line retains its own nullable style. These are not SDK class getters,
 * resolved electrical nets, complete source records or display/theme values.
 */
export const SCHEMATIC_NETGROUP_READ_METHODS = [
  "eda.sch_PrimitiveWire.get", "eda.sch_PrimitiveWire.getAll", "eda.sch_PrimitiveBus.get", "eda.sch_PrimitiveBus.getAll",
] as const;
// oxlint-disable-next-line eslint/no-control-regex -- Native selectors cannot contain transport control characters.
const identity = z.string().min(1).max(256).regex(/^[^\u0000-\u001F\u007F]+$/u);
const selectors = z.union([identity, z.array(identity).min(1).max(256).refine((ids) => new Set(ids).size === ids.length, "Duplicate group selectors.")]);
const selectedArguments = z.object({ primitiveIds: selectors }).strict();
const emptyArguments = z.object({}).strict();
export const schematicNetGroupReadRequestSchema = z.discriminatedUnion("method", [
  z.object({ method: z.literal(SCHEMATIC_NETGROUP_READ_METHODS[0]), arguments: selectedArguments }).strict(),
  z.object({ method: z.literal(SCHEMATIC_NETGROUP_READ_METHODS[1]), arguments: emptyArguments }).strict(),
  z.object({ method: z.literal(SCHEMATIC_NETGROUP_READ_METHODS[2]), arguments: selectedArguments }).strict(),
  z.object({ method: z.literal(SCHEMATIC_NETGROUP_READ_METHODS[3]), arguments: emptyArguments }).strict(),
]);
const coordinate = z.number().min(-1_000_000_000).max(1_000_000_000);
const lineSchema = z.object({
  primitiveId: identity, points: z.array(z.tuple([coordinate, coordinate])).min(1).max(2),
  color: z.string().max(4096).nullable(), width: z.number().min(0).max(1_000_000_000).nullable(),
  strokeStyle: z.enum(["SOLID", "SHORT_DASH", "DOT", "DOT_DASH"]).nullable(),
}).strict();
const nameSchema = z.object({ primitiveId: identity, value: z.string().max(65_536) }).strict();
export const schematicNetGroupStateSchema = z.object({
  primitiveId: identity, modelType: z.literal("NetGroup"), kind: z.enum(["wire", "bus"]),
  lines: z.array(lineSchema).min(1).max(1024), names: z.array(nameSchema).max(1024), customAttributeIds: z.array(identity).max(1024),
}).strict();
function sortedDistinct(ids: readonly string[]): boolean { return ids.every((id, index) => index === 0 || (ids[index - 1] ?? "") < id); }
export const schematicNetGroupStatesSchema = z.array(schematicNetGroupStateSchema).max(256).refine((rows) => {
  const ids = rows.flatMap((row) => [row.primitiveId, ...row.lines.map((line) => line.primitiveId), ...row.names.map((name) => name.primitiveId), ...row.customAttributeIds]);
  return sortedDistinct(rows.map((row) => row.primitiveId)) && new Set(ids).size === ids.length &&
    rows.every((row) => sortedDistinct(row.lines.map((line) => line.primitiveId)) && sortedDistinct(row.names.map((name) => name.primitiveId)) && sortedDistinct(row.customAttributeIds)) &&
    rows.reduce((sum, row) => sum + row.lines.length, 0) <= 1024 && rows.reduce((sum, row) => sum + row.names.length, 0) <= 1024 &&
    rows.reduce((sum, row) => sum + row.customAttributeIds.length, 0) <= 1024 &&
    rows.reduce((sum, row) => sum + row.names.reduce((size, name) => size + name.value.length, 0) + row.lines.reduce((size, line) => size + (line.color?.length ?? 0), 0), 0) <= 262_144;
}, "NetGroup states require sorted unique identities and complete bounded results.");
export const SCHEMATIC_NETGROUP_GUARD_CODES = [
  "IDENTITY", "MANAGER", "INVENTORY", "CONTEXT", "OWNER", "READY", "TREE", "SOURCE", "FAMILY", "CHILDREN", "STATE", "BOUND", "TARGET", "CHANGED",
] as const;
export function isSchematicNetGroupReadMethod(method: string): boolean { return SCHEMATIC_NETGROUP_READ_METHODS.some((entry) => entry === method); }

/** Pinned SCH source: NetGroup lines/netNames copy their Sets (3928158,
 * 3929563); line points/styles are backing-field getters (2139137). The raw
 * style getter returns null or numeric 0–3. Ka (2141617) decodes source style
 * strings to numbers (2144276) and encodes them back (2146362). This DTO uses
 * those literal strings while retaining the native number for drift proof.
 * NetName is modelType NetLabel, tagName NetName (4267994/4272655). Its value
 * getter returns _value; no AST/compiler/name resolution or serializer is used.
 * The complete connected tree, root family and direct child collections must
 * agree. Generated markers are retained in ownership proof but are not data.
 */
export function buildSchematicNetGroupReadExpression(input: unknown, diagnostics?: "sdk-failure-code"): string {
  const request = schematicNetGroupReadRequestSchema.parse(input);
  if (diagnostics !== undefined && diagnostics !== "sdk-failure-code") { throw new Error("Unsupported schematic NetGroup diagnostics."); }
  const selector = "primitiveIds" in request.arguments ? request.arguments.primitiveIds : null;
  const selected = selector === null ? null : (Array.isArray(selector) ? selector : [selector]).toSorted();
  const kind = request.method.includes("PrimitiveWire") ? "wire" : "bus";
  return `(() => {
const bad=reason=>{${diagnostics === "sdk-failure-code" ? "failureCode='SCH_NETGROUP_'+reason;" : ""}throw new Error('SCH_NETGROUP_'+reason);};
const selected=${JSON.stringify(selected)},kind=${JSON.stringify(kind)};
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
const capture=()=>{
 check();const tree=captureTree(),source=captureSource(tree),family=modelMap.get('NetGroup'),models=modelReader.call(shapes,'NetGroup');
 if(family!==undefined&&(!(family instanceof Set)||family.size>256)||!Array.isArray(models)||models.length>256||models.length!==(family?.size??0))bad('FAMILY');
 const members=new Map(),states=new Map(),collections=new Map();let lineCount=0,nameCount=0,attributeCount=0,characters=0;
 for(const model of models){
  const id=validId(model?.id);
  if(members.has(id)||model.modelType!=='NetGroup'||model.cmdKey!=='netGroup'||model.tagName!=='NetGroup'||!['wire','bus'].includes(model.type)||model.parent!==root||model.shapeManager!==shapes||index.get(id)!==model||!family?.has(model)||source.get(id)!==1||model.combination)bad('FAMILY');
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
 check();return{tree,source,family,members,states,collections};
};
const before=capture(),after=capture();
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
const wanted=selected??[...before.states.values()].filter(value=>value.kind===kind).map(value=>value.primitiveId).sort();
for(const id of wanted){if(before.states.get(id)?.kind!==kind)bad('TARGET');}check();return wanted.map(id=>before.states.get(id));
})()`;
}

export function validateSchematicNetGroupStates(value: unknown, input: unknown): void {
  const request = schematicNetGroupReadRequestSchema.parse(input), rows = schematicNetGroupStatesSchema.parse(value);
  const kind = request.method.includes("PrimitiveWire") ? "wire" : "bus";
  if (rows.some((row) => row.kind !== kind)) { throw new Error("NetGroup observation contains a different family."); }
  if ("primitiveIds" in request.arguments) {
    const selected = request.arguments.primitiveIds, wanted = (Array.isArray(selected) ? selected : [selected]).toSorted();
    if (rows.length !== wanted.length || rows.some((row, index) => row.primitiveId !== wanted[index])) { throw new Error("NetGroup observation differs from the exact requested identities."); }
  }
}
