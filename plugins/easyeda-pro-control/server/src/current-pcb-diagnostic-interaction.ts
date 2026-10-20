/** Fixed diagnostic fragment for the original Save-handler scope. Composed into
 * the root census, not a separate request or an execution-eligibility predicate.
 * PCB217199c8 locations and omissions are in the writer-prerequisites note.
 */
import { z } from "zod";

/** Uses only the enclosing root census's retained descriptor/collection helpers.
 * Its counted containers share that sample's aggregate entry budget. No vendor
 * getter, factory, callback, timer or tool method is invoked. Unknown active
 * tools remain "other" observations, without inspecting arbitrary tool state.
 */
export const CURRENT_PCB_DIAGNOSTIC_INTERACTION_FRAGMENT = `
const interaction=(()=>{
const startEntries=budget.entries;
const reference=(o,k)=>{const v=optional(o,k);if(v.marker==="present")object(v.value);return v.marker;};
const timer=(o,k)=>{const v=optional(o,k);if(v.marker==="present"&&(typeof v.value!=="number"||!Number.isSafeInteger(v.value)||Object.is(v.value,-0)||v.value<0))bad();return v.marker;};
const matching=(o,k,target)=>{const v=optional(o,k);if(v.marker!=="present")return v.marker;object(v.value);return v.value===target?"matching":"other";};
const named=(name,type)=>instance(own(scope,name),klass(type));
const selection=named("Fe","XU"),root=named("$0","Lpe"),rootNext=optional(root,"nextTool");
let navigation=null;
if(rootNext.marker==="present"){
object(rootNext.value);
if(Object.getPrototypeOf(rootNext.value)===own(klass("m0e"),"prototype")){
const nav=rootNext.value,next=optional(nav,"nextTool");let idle=null,nextKind=null;
if(next.marker==="present"){
object(next.value);nextKind="other";
if(Object.getPrototypeOf(next.value)===own(klass("Eh"),"prototype")){
nextKind="Eh";idle={drawing:flag(own(next.value,"drawing")),filterCount:set(own(next.value,"filterItems")),next:reference(next.value,"nextTool")};
}
}
navigation={drawing:flag(own(nav,"drawing")),filterCount:set(own(nav,"filterItems")),mouseRightDown:flag(own(nav,"isMouseRightDown")),
mouseMidDown:flag(own(nav,"isMouseMidDown")),markCount:array(own(nav,"mark")),shiftHelp:reference(nav,"shiftMoveHelpLine"),
wheelTimer:timer(object(own(nav,"wheelData")),"clearTime"),nextMarker:next.marker,nextKind,idle};
}
}
const button=optional(root,"mouseDownStatus");let mouseDownButton=null;
if(button.marker==="present"){if(!Number.isSafeInteger(button.value)||Object.is(button.value,-0)||button.value<0||button.value>4)bad();mouseDownButton=button.value;}
const sceneOwner=named("Pi","Kme"),scene=own(sceneOwner,"scene"),sceneCount=array(scene);if(sceneCount>8)bad();
const modes=[];for(let i=0;i<sceneCount;i++){const v=own(scene,String(i));if(!Number.isSafeInteger(v)||Object.is(v,-0)||v<1||v>6)bad();modes.push(v);}
const sceneState={modes,dropDrag:flag(own(sceneOwner,"_dropDrag")),historyToolCount:set(own(sceneOwner,"needHistoryTool"))};
const selected={items:array(own(selection,"items")),selections:array(own(selection,"selections")),
components:array(own(selection,"components")),tracks:array(own(selection,"tracks")),lines:set(own(selection,"lines")),
points:array(own(selection,"currentPointSelectedItems")),annotations:array(own(selection,"selectAnnotations")),
drcItems:set(own(selection,"drcItems")),selectionOrder:map(own(selection,"selectionOrder"))};
const selectionState={counts:selected,mouseLeftDown:flag(own(selection,"mouseLeftDown")),mouseLeftUp:flag(own(selection,"mouseLeftUp")),
dragging:flag(own(selection,"dragging")),readyToCopyDragging:flag(own(selection,"readyToCopyDragging")),
keepSelection:flag(own(selection,"keepSelection")),specialPaste:flag(own(selection,"isSpecialPaste")),dialog:reference(selection,"_dialog")};
const control=named("Sr","fpe"),flipping=named("cm","P1e"),attributes=named("nu","mge"),type=optional(attributes,"_type");
if(type.marker==="present"&&typeof type.value!=="string")bad();
const toolHistoryClass=klass("Cy"),toolHistory=optional(toolHistoryClass,"instance");let history=null;
if(toolHistory.marker==="present"){
const owner=instance(toolHistory.value,toolHistoryClass),activeId=optional(owner,"activeToolId");
if(activeId.marker==="present"&&typeof activeId.value!=="string")bad();
history={activeTool:reference(owner,"activeToolHistory"),activeId:activeId.marker};
}
const smart=named("Us","tge"),command=instance(own(smart,"command"),klass("De"));
const smartState={control:reference(smart,"_control"),dimension:reference(smart,"dimension"),
start:reference(smart,"start"),end:reference(smart,"end"),startSpotCount:array(own(smart,"startSpots")),
highlightSpotCount:array(own(smart,"highlightedSpots")),historyItemCount:set(own(smart,"_historyItems")),
commandCount:array(own(command,"_commands")),waitingUploadCount:array(own(command,"waitingUploadStack")),
commandIndexCount:map(own(command,"idMap")),commandFromOutside:flag(own(smart,"initCommandFromOutside"))};
const turn=named("Xo","$me");
const controllers={pointControl:reference(control,"control"),lockedLayerCount:set(own(control,"lockedLayers")),
mouseMoveCheck:flag(own(control,"mouseMoveCheck")),mouseAltDown:flag(own(control,"mouseAltDown")),hasAlt:flag(own(control,"hasAlt")),
layerTool:reference(named("dl","Spe"),"tool"),routeTool:reference(named("Yr","Ume"),"tool"),
attributeTool:reference(named("ru","cge"),"tool"),flipMoveTool:reference(flipping,"moveTool"),flipping:flag(own(flipping,"_flipping")),
toolHistoryMarker:toolHistory.marker,toolHistory:history,attributeType:type.marker,attributesUnmounted:flag(own(attributes,"isUnmounted")),
attributeTimer:timer(attributes,"_ui2PCBAboutAttrDataUpdateTimer"),smart:smartState,
turn:{selectionRelation:matching(turn,"currTool",selection),itemCount:array(own(turn,"items")),queueCount:array(own(turn,"_flipQueue")),
settleCallbackCount:array(own(turn,"_onSettleCallbacks")),processing:flag(own(turn,"_isProcessingFlip"))}};
const optionalMap=(name,field)=>{
const c=klass(name),v=optional(c,"manager");return {marker:v.marker,count:v.marker==="present"?map(own(instance(v.value,c),field)):null};
};
const dictionarySets=value=>{
object(value);const p=Object.getPrototypeOf(value);if(p!==Object.prototype&&p!==null)bad();
const keys=Reflect.ownKeys(value);spend(keys.length);let members=0;
for(const key of keys){if(typeof key!=="string")bad();members+=set(own(value,key));}
return {keys:keys.length,members};
};
const innerClass=klass("zo"),innerOwner=optional(innerClass,"manager");let innerModels=null;
if(innerOwner.marker==="present")innerModels=dictionarySets(own(instance(innerOwner.value,innerClass),"layerMapSet"));
const innerView=named("Wn","Tfe"),innerViews=dictionarySets(own(innerView,"layerMapSet"));
const retainedClass=klass("Hb"),retainedOwner=optional(retainedClass,"manager");let retainedLines=null;
if(retainedOwner.marker==="present"){
const owner=instance(retainedOwner.value,retainedClass);retainedLines={mapCount:map(own(owner,"map")),updateCount:set(own(owner,"updateIds"))};
}
const secondary={partitions:optionalMap("Nn","items"),innerModelMarker:innerOwner.marker,innerModels,innerViews,
innerViewManagerMatches:innerOwner.marker==="present"&&own(innerView,"mgr")===innerOwner.value,
smartDimensionViews:map(own(named("Yh","Qme"),"map")),groupViews:map(own(named("Ft","jde"),"map")),
retainedLineMarker:retainedOwner.marker,retainedLines};
return {schema:"easyeda-pro-control.pcb-diagnostic-interaction.v1",
toolChain:{nextMarker:rootNext.marker,nextKind:rootNext.marker==="present"?(navigation===null?"other":"m0e"):null,
rightDownTimer:timer(root,"mouseRightDownTimer"),mouseDownMarker:button.marker,mouseDownButton,navigation},
scene:sceneState,selection:selectionState,controllers,secondary,collectionEntries:budget.entries-startEntries};
})();
`;

const count = z.number().int().min(0).max(65_536).refine(value => !Object.is(value, -0));
const marker = z.enum(["absent", "undefined", "null", "present"]);
const ownerCount = z.object({ marker, count: count.nullable() }).strict()
  .refine(value => (value.marker === "present") === (value.count !== null));
const idle = z.object({ drawing: z.boolean(), filterCount: count, next: marker }).strict();
const navigation = z.object({
  drawing: z.boolean(), filterCount: count, mouseRightDown: z.boolean(), mouseMidDown: z.boolean(),
  markCount: count, shiftHelp: marker, wheelTimer: marker, nextMarker: marker,
  nextKind: z.enum(["Eh", "other"]).nullable(), idle: idle.nullable(),
}).strict().refine(value => (value.nextMarker === "present") === (value.nextKind !== null) &&
  (value.nextKind === "Eh") === (value.idle !== null));
const chain = z.object({
  nextMarker: marker, nextKind: z.enum(["m0e", "other"]).nullable(), rightDownTimer: marker,
  mouseDownMarker: marker, mouseDownButton: count.max(4).nullable(), navigation: navigation.nullable(),
}).strict().refine(value => (value.nextMarker === "present") === (value.nextKind !== null) &&
  (value.nextKind === "m0e") === (value.navigation !== null) &&
  (value.mouseDownMarker === "present") === (value.mouseDownButton !== null));
const selectionCounts = z.object({
  items: count, selections: count, components: count, tracks: count, lines: count, points: count,
  annotations: count, drcItems: count, selectionOrder: count,
}).strict();
const smartSchema = z.object({
  control: marker, dimension: marker, start: marker, end: marker, startSpotCount: count, highlightSpotCount: count,
  historyItemCount: count, commandCount: count, waitingUploadCount: count, commandIndexCount: count,
  commandFromOutside: z.boolean(),
}).strict();
const controllersSchema = z.object({
  pointControl: marker, lockedLayerCount: count, mouseMoveCheck: z.boolean(), mouseAltDown: z.boolean(), hasAlt: z.boolean(),
  layerTool: marker, routeTool: marker, attributeTool: marker, flipMoveTool: marker, flipping: z.boolean(),
  toolHistoryMarker: marker, toolHistory: z.object({ activeTool: marker, activeId: marker }).strict().nullable(),
  attributeType: marker, attributesUnmounted: z.boolean(), attributeTimer: marker, smart: smartSchema,
  turn: z.object({
    selectionRelation: z.enum(["absent", "undefined", "null", "matching", "other"]), itemCount: count,
    queueCount: count, settleCallbackCount: count, processing: z.boolean(),
  }).strict(),
}).strict().refine(value => (value.toolHistoryMarker === "present") === (value.toolHistory !== null));
const nestedSets = z.object({ keys: count, members: count }).strict()
  .refine(value => value.keys !== 0 || value.members === 0);
const secondarySchema = z.object({
  partitions: ownerCount, innerModelMarker: marker, innerModels: nestedSets.nullable(), innerViews: nestedSets,
  innerViewManagerMatches: z.boolean(), smartDimensionViews: count, groupViews: count,
  retainedLineMarker: marker, retainedLines: z.object({ mapCount: count, updateCount: count }).strict().nullable(),
}).strict().refine(value => (value.innerModelMarker === "present") === (value.innerModels !== null) &&
  (value.retainedLineMarker === "present") === (value.retainedLines !== null) &&
  (value.innerModelMarker === "present" || !value.innerViewManagerMatches));

const modeSchema = count.min(1).max(6);
const modesSchema = z.array(modeSchema).max(8);
const state = z.object({
  schema: z.literal("easyeda-pro-control.pcb-diagnostic-interaction.v1"),
  toolChain: chain,
  scene: z.object({ modes: modesSchema, dropDrag: z.boolean(), historyToolCount: count }).strict(),
  selection: z.object({
    counts: selectionCounts, mouseLeftDown: z.boolean(), mouseLeftUp: z.boolean(), dragging: z.boolean(),
    readyToCopyDragging: z.boolean(), keepSelection: z.boolean(), specialPaste: z.boolean(), dialog: marker,
  }).strict(),
  controllers: controllersSchema, secondary: secondarySchema, collectionEntries: count,
}).strict();
type State = z.infer<typeof state>;

function collectionEntries(value: State): number {
  const { toolChain, scene, selection, controllers, secondary } = value;
  let total = scene.modes.length + scene.historyToolCount + Object.values(selection.counts).reduce((sum, n) => sum + n, 0);
  const nav = toolChain.navigation;
  if (nav !== null) { total += nav.filterCount + nav.markCount + (nav.idle?.filterCount ?? 0); }
  const { smart, turn } = controllers;
  total += controllers.lockedLayerCount + smart.startSpotCount + smart.highlightSpotCount + smart.historyItemCount +
    smart.commandCount + smart.waitingUploadCount + smart.commandIndexCount +
    turn.itemCount + turn.queueCount + turn.settleCallbackCount;
  total += (secondary.partitions.count ?? 0) + (secondary.innerModels?.keys ?? 0) + (secondary.innerModels?.members ?? 0) +
    secondary.innerViews.keys + secondary.innerViews.members + secondary.smartDimensionViews + secondary.groupViews +
    (secondary.retainedLines?.mapCount ?? 0) + (secondary.retainedLines?.updateCount ?? 0);
  return total;
}

/** Strict nested result for the root decoder. Claims remain on the enclosing
 * diagnostic and stay false; neither idle tool labels nor zero counts authorize
 * a write or prove all secondary indexes/latent callbacks were observed.
 */
export const currentPcbDiagnosticInteractionSchema = state.refine(value => collectionEntries(value) === value.collectionEntries);
