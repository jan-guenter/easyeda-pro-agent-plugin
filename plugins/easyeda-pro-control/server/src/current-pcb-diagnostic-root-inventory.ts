/** Fixed populated-safe census of original PCB model roots and spatial indexes.
 * Dormant leaf: no transport, complete baseline, empty-root or writer authority.
 * Source and omissions: docs/current-pcb-root-membership-2026-10-20.md.
 */
import { createHash } from "node:crypto";
import { types } from "node:util";
import { z } from "zod";
import { CURRENT_PCB_CONSTRUCTOR_ASSOCIATION_PROGRAMS } from "./current-pcb-constructor-scope.ts";
import { CURRENT_PCB_DIAGNOSTIC_INTERACTION_FRAGMENT, currentPcbDiagnosticInteractionSchema } from "./current-pcb-diagnostic-interaction.ts";
import { decodeCurrentPcbDiagnosticJson } from "./current-pcb-diagnostic-json.ts";
import { CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION } from "./current-pcb-diagnostic-model-program.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const MAX_ENTRIES = 65_536;
const MAX_TREES = 128;
const MAX_DEPTH = 64;
const MAX_RETAINED_DESCRIPTORS = MAX_ENTRIES * 8 + 4096;
export const CURRENT_PCB_DIAGNOSTIC_ROOT_INVENTORY_RESULT_BYTES = 8192;

/** Original Save-handler scope zero, original callback and admitted constructor tuple.
 * Runtime.callFunctionOn must use throwOnSideEffect/silent/returnByValue true,
 * awaitPromise/generatePreview/userGesture false. No model getter or vendor
 * method is called. Nonempty supported collections remain diagnostic output.
 */
export const CURRENT_PCB_DIAGNOSTIC_ROOT_INVENTORY_FUNCTION = `function(originalCallback,constructors){
"use strict";
const bad=()=>{throw new Error("PCB_DIAGNOSTIC_ROOT_INVENTORY_STATE");};
const retained=[],collections=[];
const budget={entries:0,trees:0};
const remember=(o,k,m,v)=>{if(retained.length>=${MAX_RETAINED_DESCRIPTORS})bad();retained.push([o,k,m,v]);};
const count=v=>{if(!Number.isSafeInteger(v)||Object.is(v,-0)||v<0||v>${MAX_ENTRIES})bad();return v;};
const spend=n=>{budget.entries+=count(n);if(budget.entries>${MAX_ENTRIES})bad();};
const object=o=>{if(o===null||typeof o!=="object"||Array.isArray(o))bad();return o;};
const descriptor=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();return Object.getOwnPropertyDescriptor(o,k);};
const own=(o,k)=>{const d=descriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();remember(o,k,"present",d.value);return d.value;};
const optional=(o,k)=>{const d=descriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||descriptor(p,k))bad();p=Object.getPrototypeOf(p);}remember(o,k,"absent",undefined);return {marker:"absent",value:undefined};}if(!Object.hasOwn(d,"value"))bad();const v=d.value;remember(o,k,"present",v);return {marker:v===undefined?"undefined":v===null?"null":"present",value:v};};
const flag=v=>{if(typeof v!=="boolean")bad();return v;};
const id=v=>{if(typeof v!=="string"||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/.test(v))bad();return v;};
const collection=(o,p)=>{
object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();
const d=descriptor(p,"size");if(!d||typeof d.get!=="function"||d.set!==undefined)bad();
const n=count(Reflect.apply(d.get,o,[]));spend(n);collections.push([o,p,d.get,n]);return n;
};
const map=o=>collection(o,Map.prototype),set=o=>collection(o,Set.prototype);
const array=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,"length"));spend(n);const keys=Reflect.ownKeys(o);if(keys.length!==n+1||keys[n]!=="length")bad();for(let i=0;i<n;i++){if(keys[i]!==String(i))bad();const d=descriptor(o,String(i));if(!d||!Object.hasOwn(d,"value"))bad();}return n;};
const iterate=(o,p,n,visit)=>{
const iterator=Reflect.apply(own(p,p===Map.prototype?"entries":"values"),o,[]),next=own(Object.getPrototypeOf(iterator),"next");
if(typeof next!=="function")bad();
for(let i=0;i<n;i++){const result=Reflect.apply(next,iterator,[]);if(own(result,"done")!==false)bad();const v=own(result,"value");if(p===Map.prototype){if(!Array.isArray(v)||v.length!==2)bad();visit(v[0],v[1]);}else visit(v);}
if(own(Reflect.apply(next,iterator,[]),"done")!==true)bad();
};
const has=(o,v)=>Reflect.apply(own(Set.prototype,"has"),o,[v]);
if((${CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION})!==originalCallback)bad();
const scope=object(own(this,"object"));
${CURRENT_PCB_CONSTRUCTOR_ASSOCIATION_PROGRAMS.diagnostic}
const klass=n=>{const c=own(scope,n);if(typeof c!=="function")bad();return c;};
const instance=(o,c)=>{object(o);if(Object.getPrototypeOf(o)!==own(c,"prototype"))bad();return o;};
const envClass=klass("x"),env=instance(own(envClass,"env"),envClass);
const documentUuid=id(own(env,"_id"));if(own(env,"_doctype")!==3)bad();
const family=n=>{const c=klass(n),v=optional(c,"manager");return {marker:v.marker,count:v.marker==="present"?map(own(instance(v.value,c),"map")):null};};
const families={tracks:family("vn"),pads:family("Jn"),vias:family("Dn"),circles:family("Xi"),
radiusDimensions:family("ol"),rectangles:family("nn"),strings:family("bo"),protractorDimensions:family("_a"),
lengthDimensions:family("Aa"),smartDimensions:family("GR"),components:family("Ms"),polygons:family("Fi"),
images:family("oa"),pictures:family("c0"),copper:family("Yo"),inner:family("zo"),groups:family("Mp")};
const boardClass=klass("_s"),boardOwner=optional(boardClass,"instance");
let board={ownerMarker:boardOwner.marker,boardMarker:null,outlineCount:null,autoGenerate:null};
if(boardOwner.marker==="present"){
const owner=instance(boardOwner.value,boardClass),value=optional(owner,"_board");if(value.marker==="present")object(value.value);
board={ownerMarker:"present",boardMarker:value.marker,outlineCount:map(own(owner,"_outlineCollect")),autoGenerate:flag(own(owner,"_autoGenerate"))};
}
const panelClass=klass("ai"),panelOwner=optional(panelClass,"model");
let panelization={ownerMarker:panelOwner.marker,viewModelMatchesOwner:null,activation:null,counts:null};
if(panelOwner.marker==="present"){
const owner=instance(panelOwner.value,panelClass),view=constructorInstance(own(scope,"Si"),"Jse"),param=object(own(owner,"_param"));
const borders=own(owner,"borderClosures");if(array(borders)!==2)bad();
const counts={items:array(own(owner,"items")),outlines:array(own(owner,"outlines")),slots:array(own(owner,"slots")),
originOutline:array(own(owner,"originOutline")),holes:array(own(owner,"holes")),positionHoles:array(own(owner,"positionHoles")),
stampGroups:array(own(owner,"stampGroups")),marks:array(own(owner,"marks")),vCutShapes:array(own(owner,"vCutShapes")),
closures:array(own(owner,"closures")),borderClosuresFirst:array(own(borders,"0")),borderClosuresSecond:array(own(borders,"1")),
borderClosuresOuterMost:array(own(owner,"borderClosures_outerMost"))};
panelization={ownerMarker:"present",viewModelMatchesOwner:own(view,"model")===owner,
activation:{on:flag(own(param,"on")),success:flag(own(param,"success"))},counts};
}
const spatial=instance(own(scope,"Ht"),klass("tV")),treeSeen=new Set();
const mdPrototype=own(klass("Md"),"prototype"),f0Prototype=own(klass("F0"),"prototype"),
niPrototype=own(klass("NI"),"prototype"),iyPrototype=own(klass("iy"),"prototype");
const empty=()=>({outerKeyCount:0,nestedKeyCount:0,treeCount:0,itemCount:0,changeCount:0,deadCount:0,
rootNodeCount:0,rootLeafCount:0,rootLeafWithoutItemCount:0,rootLeafWithoutItemOrDeadCount:0,
itemWithoutRootLeafCount:0,itemWithoutRootLeafOrChangeCount:0,repeatedRootLeafCount:0});
const inspectTree=(value,result)=>{
object(value);const prototype=Object.getPrototypeOf(value),nodePrototype=prototype===mdPrototype?niPrototype:prototype===f0Prototype?iyPrototype:null;
if(nodePrototype===null||treeSeen.has(value)||++budget.trees>${MAX_TREES})bad();treeSeen.add(value);result.treeCount++;
const items=own(value,"items"),changes=own(value,"changeList"),dead=own(value,"deadList");
const itemCount=set(items),changeCount=set(changes),deadCount=set(dead);
result.itemCount+=itemCount;result.changeCount+=changeCount;result.deadCount+=deadCount;
const root=object(own(value,"root")),nodes=new Set(),leaves=new Set(),stack=[[root,null,0]];
while(stack.length){
const current=stack.pop(),node=current[0],parent=current[1],depth=current[2];
if(depth>${MAX_DEPTH}||nodes.has(node)||Object.getPrototypeOf(node)!==nodePrototype||own(node,"parent")!==parent)bad();
nodes.add(node);spend(1);result.rootNodeCount++;
const children=own(node,"childs"),n=array(children);
for(let i=0;i<n;i++){
const child=object(own(children,String(i))),childPrototype=Object.getPrototypeOf(child);
if(childPrototype===niPrototype||childPrototype===iyPrototype){
if(childPrototype!==nodePrototype)bad();stack.push([child,node,depth+1]);
}else{
result.rootLeafCount++;
if(leaves.has(child)){result.repeatedRootLeafCount++;continue;}leaves.add(child);
if(!has(items,child)){result.rootLeafWithoutItemCount++;if(!has(dead,child))result.rootLeafWithoutItemOrDeadCount++;}
}
}
}
iterate(items,Set.prototype,itemCount,item=>{object(item);if(!leaves.has(item)){result.itemWithoutRootLeafCount++;if(!has(changes,item))result.itemWithoutRootLeafOrChangeCount++;}});
};
const branch=(value,nested)=>{
const result=empty(),n=map(value);result.outerKeyCount=n;
iterate(value,Map.prototype,n,(_key,entry)=>{
if(nested){const length=map(entry);result.nestedKeyCount+=length;iterate(entry,Map.prototype,length,(_layer,tree)=>inspectTree(tree,result));}
else inspectTree(entry,result);
});return result;
};
const spatialIndexes={typed:branch(own(spatial,"map"),true),other:branch(own(spatial,"otherMap"),false),ratline:branch(own(spatial,"ratlineMap"),false)};
${CURRENT_PCB_DIAGNOSTIC_INTERACTION_FRAGMENT}
verifyConstructorAssociations();
for(const item of retained){const d=descriptor(item[0],item[1]);if(item[2]==="absent"?d!==undefined:!d||!Object.hasOwn(d,"value")||d.value!==item[3])bad();}
for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}
if((${CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION})!==originalCallback)bad();
const output=JSON.stringify({schema:"easyeda-pro-control.pcb-diagnostic-root-inventory.v1",documentUuid,families,board,panelization,spatialIndexes,interaction,collectionEntries:budget.entries,treeCount:budget.trees});
if(output.length>${CURRENT_PCB_DIAGNOSTIC_ROOT_INVENTORY_RESULT_BYTES})bad();
return output;
}`;

export const CURRENT_PCB_DIAGNOSTIC_ROOT_INVENTORY_FUNCTION_SHA256 = createHash("sha256")
  .update(CURRENT_PCB_DIAGNOSTIC_ROOT_INVENTORY_FUNCTION).digest("hex");

const countSchema = z.number().int().min(0).max(MAX_ENTRIES).refine(value => !Object.is(value, -0));
const markerSchema = z.enum(["absent", "undefined", "null", "present"]);
const ownerSchema = z.object({ marker: markerSchema, count: countSchema.nullable() }).strict()
  .refine(value => (value.marker === "present") === (value.count !== null));
const familiesSchema = z.object({
  tracks: ownerSchema, pads: ownerSchema, vias: ownerSchema, circles: ownerSchema, radiusDimensions: ownerSchema,
  rectangles: ownerSchema, strings: ownerSchema, protractorDimensions: ownerSchema, lengthDimensions: ownerSchema,
  smartDimensions: ownerSchema, components: ownerSchema, polygons: ownerSchema, images: ownerSchema,
  pictures: ownerSchema, copper: ownerSchema, inner: ownerSchema, groups: ownerSchema,
}).strict();
const boardSchema = z.object({
  ownerMarker: markerSchema, boardMarker: markerSchema.nullable(), outlineCount: countSchema.nullable(),
  autoGenerate: z.boolean().nullable(),
}).strict().refine(value => value.ownerMarker === "present" ?
  value.boardMarker !== null && value.outlineCount !== null && value.autoGenerate !== null :
  value.boardMarker === null && value.outlineCount === null && value.autoGenerate === null);
const panelCountsSchema = z.object({
  items: countSchema, outlines: countSchema, slots: countSchema, originOutline: countSchema, holes: countSchema,
  positionHoles: countSchema, stampGroups: countSchema, marks: countSchema, vCutShapes: countSchema, closures: countSchema,
  borderClosuresFirst: countSchema, borderClosuresSecond: countSchema, borderClosuresOuterMost: countSchema,
}).strict();
const panelSchema = z.object({
  ownerMarker: markerSchema, viewModelMatchesOwner: z.boolean().nullable(),
  activation: z.object({ on: z.boolean(), success: z.boolean() }).strict().nullable(),
  counts: panelCountsSchema.nullable(),
}).strict().refine(value => value.ownerMarker === "present" ?
  value.viewModelMatchesOwner !== null && value.activation !== null && value.counts !== null :
  value.viewModelMatchesOwner === null && value.activation === null && value.counts === null);
const treeSchema = z.object({
  outerKeyCount: countSchema, nestedKeyCount: countSchema, treeCount: countSchema.max(MAX_TREES),
  itemCount: countSchema, changeCount: countSchema, deadCount: countSchema,
  rootNodeCount: countSchema, rootLeafCount: countSchema,
  rootLeafWithoutItemCount: countSchema, rootLeafWithoutItemOrDeadCount: countSchema,
  itemWithoutRootLeafCount: countSchema, itemWithoutRootLeafOrChangeCount: countSchema, repeatedRootLeafCount: countSchema,
}).strict().refine(value => value.rootNodeCount >= value.treeCount &&
  value.repeatedRootLeafCount <= value.rootLeafCount &&
  value.rootLeafWithoutItemCount <= value.rootLeafCount - value.repeatedRootLeafCount &&
  value.rootLeafWithoutItemOrDeadCount <= value.rootLeafWithoutItemCount &&
  value.itemWithoutRootLeafCount <= value.itemCount &&
  value.itemWithoutRootLeafOrChangeCount <= value.itemWithoutRootLeafCount &&
  (value.treeCount !== 0 || value.itemCount + value.changeCount + value.deadCount + value.rootNodeCount +
    value.rootLeafCount + value.itemWithoutRootLeafCount + value.rootLeafWithoutItemCount === 0));
const stateSchema = z.object({
  schema: z.literal("easyeda-pro-control.pcb-diagnostic-root-inventory.v1"),
  documentUuid: z.string().regex(/^(?:[a-f\d]{16}|[a-f\d]{32})$/u),
  families: familiesSchema, board: boardSchema, panelization: panelSchema,
  spatialIndexes: z.object({ typed: treeSchema, other: treeSchema, ratline: treeSchema }).strict(),
  interaction: currentPcbDiagnosticInteractionSchema,
  collectionEntries: countSchema, treeCount: countSchema.max(MAX_TREES),
}).strict().refine(value => {
  const { typed, other, ratline } = value.spatialIndexes;
  if (typed.treeCount !== typed.nestedKeyCount || other.nestedKeyCount !== 0 || ratline.nestedKeyCount !== 0 ||
      other.treeCount !== other.outerKeyCount || ratline.treeCount !== ratline.outerKeyCount ||
      value.treeCount !== typed.treeCount + other.treeCount + ratline.treeCount) { return false; }
  let entries = Object.values(value.families).reduce((sum, owner) => sum + (owner.count ?? 0), 0);
  entries += value.board.outlineCount ?? 0;
  if (value.panelization.counts !== null) {
    entries += 2 + Object.values(value.panelization.counts).reduce((sum, count) => sum + count, 0);
  }
  for (const branch of [typed, other, ratline]) {
    // A node counts as a visit and, except each root, a parent's child slot.
    // Each leaf occurrence occupies one child slot.
    entries += branch.outerKeyCount + branch.nestedKeyCount + branch.itemCount + branch.changeCount +
      branch.deadCount + 2 * branch.rootNodeCount - branch.treeCount + branch.rootLeafCount;
  }
  return entries + value.interaction.collectionEntries === value.collectionEntries;
});
const LIMITS = Object.freeze({
  completeModelMembershipVerified: false, emptyRootPcbVerified: false, completeLiveBaselineVerified: false,
  sourceOwnershipVerified: false, secondaryIndexesCovered: false, activeToolsCovered: false,
  geometryVerified: false, queueCompletionVerified: false, persistenceVerified: false,
  saveAuthorized: false, writerSupported: false, executionAuthorized: false,
  continuousObservation: false, nativeIntrinsicsVerified: false,
} as const);
export type CurrentPcbDiagnosticRootInventory = Readonly<z.infer<typeof stateSchema>> & typeof LIMITS;

function refuse(): never { throw new Error("PCB_DIAGNOSTIC_ROOT_INVENTORY_REPLY"); }
function record(input: unknown, fields: readonly string[]): Readonly<Record<string, unknown>> {
  if (input === null || typeof input !== "object" || types.isProxy(input) || Array.isArray(input)) { return refuse(); }
  const keys = Reflect.ownKeys(input), prototype: unknown = Object.getPrototypeOf(input);
  if (prototype !== Object.prototype && prototype !== null || keys.length !== fields.length ||
      keys.some(key => typeof key !== "string" || !fields.includes(key))) { return refuse(); }
  const result: Record<string, unknown> = {};
  for (const key of fields) {
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    if (descriptor === undefined || !Object.hasOwn(descriptor, "value")) { return refuse(); }
    result[key] = descriptor.value as unknown;
  }
  return result;
}

/** Decode supplied bytes only. No original scope or complete membership token
 * is minted, and a zero count cannot establish an absent/empty live PCB.
 */
export function decodeCurrentPcbDiagnosticRootInventoryReply(input: unknown): CurrentPcbDiagnosticRootInventory {
  const reply = record(input, ["result"]), result = record(reply["result"], ["type", "value"]);
  const raw = result["value"];
  if (result["type"] !== "string" || typeof raw !== "string" || !raw.isWellFormed() ||
      Buffer.byteLength(raw, "utf8") > CURRENT_PCB_DIAGNOSTIC_ROOT_INVENTORY_RESULT_BYTES) { return refuse(); }
  try {
    const parsed = decodeCurrentPcbDiagnosticJson(Buffer.from(raw, "utf8"));
    return freezeDeep({ ...stateSchema.parse(parsed), ...LIMITS });
  } catch { return refuse(); }
}
