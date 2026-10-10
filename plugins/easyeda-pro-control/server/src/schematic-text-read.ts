import { z } from "zod";

/** Native state, not the inconsistent installed Text getter projection. X/Y
 * are unconverted native coordinates, including native Y direction. Alignment
 * is the raw horizontal/vertical pair: null means inherited/default, 0/1/2
 * mean left/center/right and top/middle/bottom. No display/theme resolution.
 */
export const SCHEMATIC_TEXT_READ_METHODS = ["eda.sch_PrimitiveText.get", "eda.sch_PrimitiveText.getAll"] as const;
// oxlint-disable-next-line eslint/no-control-regex -- Native selectors cannot include transport control characters.
const identity = z.string().min(1).max(256).regex(/^[^\u0000-\u001F\u007F]+$/u);
const identities = z.array(identity).min(1).max(256).refine((values) => new Set(values).size === values.length, "Duplicate Text IDs.");
const selectedArguments = z.object({ primitiveIds: z.union([identity, identities]) }).strict();
export const schematicTextReadRequestSchema = z.discriminatedUnion("method", [
  z.object({ method: z.literal(SCHEMATIC_TEXT_READ_METHODS[0]), arguments: selectedArguments }).strict(),
  z.object({ method: z.literal(SCHEMATIC_TEXT_READ_METHODS[1]), arguments: z.object({}).strict() }).strict(),
]);
const number = z.number().min(-1_000_000_000).max(1_000_000_000).nullable();
const alignment = z.union([z.literal(0), z.literal(1), z.literal(2), z.null()]);
export const schematicTextStateSchema = z.object({
  primitiveId: identity, modelType: z.literal("Text"), x: number, y: number, value: z.string().max(65_536), rotation: number,
  color: z.string().max(4096).nullable(), fontFamily: z.string().max(4096).nullable(), fontSize: z.number().min(0).max(1_000_000_000).nullable(),
  fontWeight: z.boolean().nullable(), italic: z.boolean().nullable(), underline: z.boolean().nullable(), hAlign: alignment, vAlign: alignment,
}).strict();
export const schematicTextStatesSchema = z.array(schematicTextStateSchema).max(256).refine((rows) =>
  rows.every((row, index) => index === 0 || (rows[index - 1]?.primitiveId ?? "") < row.primitiveId)
  && rows.reduce((sum, row) => sum + row.value.length + (row.color?.length ?? 0) + (row.fontFamily?.length ?? 0), 0) <= 262_144,
"Text states must be sorted, unique and bounded.");

export const SCHEMATIC_TEXT_GUARD_CODES = [
  "IDENTITY", "MANAGER", "INVENTORY", "CONTEXT", "OWNER", "READY", "TREE", "SOURCE", "FAMILY", "STATE", "BOUND", "TARGET", "CHANGED",
] as const;
export function isSchematicTextReadMethod(method: string): boolean { return SCHEMATIC_TEXT_READ_METHODS.some((entry) => entry === method); }

/** The wrapper supplies EXPECTED_* constants. Read only reviewed scalar getters,
 * the copied source-ID map and root Text family. Never call the callback-based
 * public Text methods, getApiShapeData, serializers, compiler or native RPC.
 * Pinned SCH el getters return their backing fields; rv.value returns _value
 * or an empty string. Their gt/F5e decorator only wraps setters, not getters.
 * Two synchronous captures prove the complete tree and bounded scalar state.
 */
export function buildSchematicTextReadExpression(input: unknown, diagnostics?: "sdk-failure-code"): string {
  const request = schematicTextReadRequestSchema.parse(input);
  if (diagnostics !== undefined && diagnostics !== "sdk-failure-code") { throw new Error("Unsupported schematic Text diagnostics."); }
  const selector = request.method === SCHEMATIC_TEXT_READ_METHODS[0] ? request.arguments.primitiveIds : null;
  const selected = selector === null ? null : (Array.isArray(selector) ? selector : [selector]).toSorted();
  return `(() => {
const bad=reason=>{${diagnostics === "sdk-failure-code" ? "failureCode='SCH_TEXT_'+reason;" : ""}throw new Error('SCH_TEXT_'+reason);};
const selected=${JSON.stringify(selected)};
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
const fields=['modelType','x','y','value','rotation','color','fontFamily','fontSize','fontWeight','italic','underline','hAlign','vAlign'];
const captureTree=()=>{
 const tree=new Map(),pending=[root];
 for(let offset=0;offset<pending.length;offset++){
  const parent=pending[offset],children=parent.children;
  if(children===undefined){if(parent===root)bad('TREE');continue;}
  if(!Array.isArray(children)||children.length>20000||new Set(children).size!==children.length)bad('TREE');
  for(const [position,model] of children.entries()){
   const id=validId(model?.id);
   if(tree.has(id)||model===root||model.parent!==parent||model.shapeManager!==shapes||model.isConnected!==true||index.get(id)!==model||model.locked!==undefined&&typeof model.locked!=='boolean')bad('TREE');
   tree.set(id,{model,parent,position,type:model.modelType,locked:model.locked});pending.push(model);
   if(tree.size>20000)bad('BOUND');
  }
 }
 if(tree.size!==index.size)bad('TREE');
 for(const [id,model] of index){if(tree.get(id)?.model!==model)bad('TREE');}
 return tree;
};
const sameTree=(before,after)=>{
 if(before.size!==after.size)bad('CHANGED');
 for(const [id,entry] of before){const other=after.get(id);if(!other||other.model!==entry.model||other.parent!==entry.parent||other.position!==entry.position||other.type!==entry.type||!Object.is(other.locked,entry.locked))bad('CHANGED');}
};
const captureSource=tree=>{
 const source=sourceReader.call(handler);
 if(!(source instanceof Map)||source.size>20000)bad('SOURCE');
 for(const [id,marker] of source){validId(id);if(marker!==1||!tree.has(id)||tree.get(id).model!==index.get(id))bad('SOURCE');}
 return new Map(source);
};
const sameSource=(before,after)=>{
 if(before.size!==after.size)bad('CHANGED');
 for(const [id,marker] of before){if(after.get(id)!==marker)bad('CHANGED');}
};
const capture=()=>{
 check();const tree=captureTree(),source=captureSource(tree);
 const family=modelMap.get('Text'),models=modelReader.call(shapes,'Text');
 if(family!==undefined&&(!(family instanceof Set)||family.size>256)||!Array.isArray(models)||models.length>256||models.length!==(family?.size??0))bad('FAMILY');
 const members=new Map(),states=new Map();let characters=0;
 for(const model of models){
  const id=validId(model?.id);
  if(members.has(id)||model.modelType!=='Text'||model.cmdKey!=='text'||model.parent!==root||model.shapeManager!==shapes||index.get(id)!==model||!family?.has(model)||source.get(id)!==1)bad('FAMILY');
  const state={primitiveId:id};for(const field of fields)state[field]=model[field];if(state.modelType!=='Text')bad('STATE');
  for(const field of ['x','y','rotation','fontSize']){const value=state[field];if(value!==null&&(typeof value!=='number'||!Number.isFinite(value)||Math.abs(value)>1000000000||field==='fontSize'&&value<0))bad('STATE');}
  for(const field of ['fontWeight','italic','underline']){if(state[field]!==null&&typeof state[field]!=='boolean')bad('STATE');}
  for(const field of ['hAlign','vAlign']){if(state[field]!==null&&![0,1,2].includes(state[field]))bad('STATE');}
  if(typeof state.value!=='string'||state.value.length>65536||!(state.color===null||typeof state.color==='string'&&state.color.length<=4096)||!(state.fontFamily===null||typeof state.fontFamily==='string'&&state.fontFamily.length<=4096))bad('STATE');
  characters+=state.value.length+(state.color?.length??0)+(state.fontFamily?.length??0);if(characters>262144)bad('BOUND');
  members.set(id,model);states.set(id,state);
 }
 for(const [id,entry] of tree){if(entry.type==='Text'&&entry.parent===root&&members.get(id)!==entry.model)bad('FAMILY');}
 sameSource(source,captureSource(tree));sameTree(tree,captureTree());
 if(modelMap.get('Text')!==family||(family?.size??0)!==members.size)bad('CHANGED');
 for(const model of members.values()){if(!family?.has(model)||model.cmdKey!=='text')bad('CHANGED');}
 check();return{tree,source,family,members,states};
};
const before=capture(),after=capture();
if(before.family!==after.family||before.members.size!==after.members.size)bad('CHANGED');
sameTree(before.tree,after.tree);sameSource(before.source,after.source);
for(const [id,model] of before.members){if(after.members.get(id)!==model)bad('CHANGED');const left=before.states.get(id),right=after.states.get(id);for(const field of fields){if(!Object.is(left[field],right[field]))bad('CHANGED');}}
const wanted=selected??[...before.members.keys()].sort();
for(const id of wanted){if(!before.members.has(id))bad('TARGET');}
check();return wanted.map(id=>before.states.get(id));
})()`;
}

export function validateSchematicTextStates(value: unknown, input: unknown): void {
  const request = schematicTextReadRequestSchema.parse(input);
  const rows = schematicTextStatesSchema.parse(value);
  if (request.method === SCHEMATIC_TEXT_READ_METHODS[0]) {
    const selected = request.arguments.primitiveIds;
    const wanted = (Array.isArray(selected) ? selected : [selected]).toSorted();
    if (rows.length !== wanted.length || rows.some((row, index) => row.primitiveId !== wanted[index])) { throw new Error("Text observation does not match the exact requested identities."); }
  }
}
