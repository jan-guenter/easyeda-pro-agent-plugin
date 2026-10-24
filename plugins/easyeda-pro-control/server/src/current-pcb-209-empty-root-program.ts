/** Passive raw-root exclusion for a first empty209 PCB. Managers are required
 * even when no model has a view. This does not inspect pending publications,
 * active tools, worker completion or populated geometry. */
import { createHash } from "node:crypto";
import { z } from "zod";
import { CURRENT_PCB_209_EMPTY_ROOT_ALIASES } from "./current-pcb-209-empty-root-profile.ts";
import { CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION } from "./current-pcb-diagnostic-model-program.ts";
import { CURRENT_PCB_STRING_OBSERVATION_GUARDS, decodeCurrentPcbStringObservation } from "./current-pcb-string-observation-core.ts";

export const CURRENT_PCB_209_EMPTY_ROOT_FAMILIES = Object.freeze({
  tracks: "vn", pads: "Jn", vias: "Dn", circles: "Xi", radiusDimensions: "ol", rectangles: "nn", strings: "bo",
  protractorDimensions: "_a", lengthDimensions: "Aa", smartDimensions: "GR", components: "Ms", polygons: "Fi",
  images: "oa", pictures: "c0", copper: "Yo", inner: "zo", groups: "Mp",
} as const);
export const CURRENT_PCB_209_EMPTY_ROOT_PANEL_ARRAYS = Object.freeze([
  "items", "outlines", "slots", "originOutline", "holes", "positionHoles", "stampGroups", "marks", "vCutShapes", "closures",
  "borderClosures_outerMost",
] as const);
export const CURRENT_PCB_209_EMPTY_ROOT_FUNCTION = `function(originalCallback){
${CURRENT_PCB_STRING_OBSERVATION_GUARDS}
if((${CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION})!==originalCallback)bad();
const scope=object(own(this,"object")),aliases=${JSON.stringify(CURRENT_PCB_209_EMPTY_ROOT_ALIASES)};
const klass=role=>{if(!Object.hasOwn(aliases,role))bad();const value=own(scope,aliases[role]);if(typeof value!=="function")bad();return value;};
const prototypes=[],instance=(value,role)=>{object(value);const prototype=own(klass(role),"prototype");if(Object.getPrototypeOf(value)!==prototype)bad();prototypes.push([value,prototype]);return value;};
const absent=(owner,key)=>{const value=marker(owner,key);if(value==="present")bad();return value;};
const environment=instance(own(klass("x"),"env"),"x");
const documentUuid=id(own(environment,"_id"),/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/);if(own(environment,"_doctype")!==3)bad();
const familyRoles=${JSON.stringify(CURRENT_PCB_209_EMPTY_ROOT_FAMILIES)},families={};
for(const [family,role]of Object.entries(familyRoles)){
const manager=instance(own(klass(role),"manager"),role);emptyMap(own(manager,"map"));
families[family]={count:0,last:absent(manager,"_last")};
}
// Inner source emission walks layerMapSet independently of manager.map.
const inner=instance(own(klass("zo"),"manager"),"zo"),layerSets=plain(own(inner,"layerMapSet"));
if(Object.getPrototypeOf(layerSets)!==Object.prototype)bad();const layerKeys=keys(layerSets);if(layerKeys.length>128)bad();
const innerLayerIds=layerKeys.map(key=>{if(!/^(?:0|[1-9][0-9]{0,4})$/.test(key))bad();const layer=Number(key);if(layer>65535)bad();emptySet(own(layerSets,key));return layer;});
const board=instance(own(klass("_s"),"instance"),"_s");emptyMap(own(board,"_outlineCollect"));
if(flag(own(board,"_autoGenerate")))bad();const boardMarker=absent(board,"_board");
const panel=instance(own(klass("ai"),"model"),"ai"),parameter=object(own(panel,"_param"));
if(flag(own(parameter,"on"))||flag(own(parameter,"success")))bad();
for(const field of ${JSON.stringify(CURRENT_PCB_209_EMPTY_ROOT_PANEL_ARRAYS)})if(arraySize(own(panel,field))!==0)bad();
const borders=own(panel,"borderClosures");if(arraySize(borders)!==2||arraySize(own(borders,"0"))!==0||arraySize(own(borders,"1"))!==0)bad();
const spatial=instance(own(scope,"Ht"),"tV"),trees=new Set(),entries=[];let totalKeys=0;
const iterate=(value,visit)=>{const n=size(value,Map.prototype);totalKeys+=n;if(totalKeys>128)bad();
const iterator=Reflect.apply(own(Map.prototype,"entries"),value,[]),next=own(Object.getPrototypeOf(iterator),"next");if(typeof next!=="function")bad();
for(let i=0;i<n;i++){const item=Reflect.apply(next,iterator,[]);if(own(item,"done")!==false)bad();const pair=own(item,"value");if(arraySize(pair)!==2)bad();const key=own(pair,"0"),entry=own(pair,"1");entries.push([value,key,entry]);visit(entry);}
if(own(Reflect.apply(next,iterator,[]),"done")!==true)bad();return n;};
const tree=value=>{object(value);if(trees.has(value)||trees.size>=128)bad();trees.add(value);
const prototype=Object.getPrototypeOf(value),normal=own(klass("Md"),"prototype"),other=own(klass("F0"),"prototype");
const role=prototype===normal?"NI":prototype===other?"iy":null;if(role===null)bad();prototypes.push([value,prototype]);
emptySet(own(value,"items"));emptySet(own(value,"changeList"));emptySet(own(value,"deadList"));
const root=instance(own(value,"root"),role);if(own(root,"parent")!==null||arraySize(own(root,"childs"))!==0)bad();};
const typedKeys=iterate(own(spatial,"map"),value=>iterate(value,tree));
const otherKeys=iterate(own(spatial,"otherMap"),tree),ratlineKeys=iterate(own(spatial,"ratlineMap"),tree);
verify();for(const [value,key,entry]of entries)if(Reflect.apply(own(Map.prototype,"get"),value,[key])!==entry)bad();
const finalLayerKeys=keys(layerSets);if(Object.getPrototypeOf(layerSets)!==Object.prototype||finalLayerKeys.length!==layerKeys.length||finalLayerKeys.some((key,index)=>key!==layerKeys[index]))bad();
for(const [value,prototype]of prototypes)if(Object.getPrototypeOf(value)!==prototype)bad();
if((${CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION})!==originalCallback)bad();
return JSON.stringify({schema:"easyeda-pro-control.pcb209-empty-root-membership.v1",documentUuid,families,innerLayerIds,
board:{marker:boardMarker,outlineCount:0,autoGenerate:false},panel:{enabled:false,success:false,arrayCount:13},
spatial:{typedKeys,otherKeys,ratlineKeys,totalKeys,treeCount:trees.size}});
}`;
export const CURRENT_PCB_209_EMPTY_ROOT_FUNCTION_SHA256 = createHash("sha256").update(CURRENT_PCB_209_EMPTY_ROOT_FUNCTION).digest("hex");
const marker = z.enum(["absent", "undefined", "null"]);
const count = z.number().int().min(0).max(128).refine(value => !Object.is(value, -0));
const family = z.object({ count: z.literal(0), last: marker }).strict();
const schema = z.object({ schema: z.literal("easyeda-pro-control.pcb209-empty-root-membership.v1"),
  documentUuid: z.string().regex(/^(?:[a-f\d]{16}|[a-f\d]{32})$/u),
  families: z.object({ tracks: family, pads: family, vias: family, circles: family, radiusDimensions: family,
    rectangles: family, strings: family, protractorDimensions: family, lengthDimensions: family, smartDimensions: family,
    components: family, polygons: family, images: family, pictures: family, copper: family, inner: family, groups: family }).strict(),
  innerLayerIds: z.array(z.number().int().min(0).max(65_535).refine(value => !Object.is(value, -0))).max(128)
    .refine(values => values.every((value, index) => index === 0 || value > (values[index - 1] ?? value))),
  board: z.object({ marker, outlineCount: z.literal(0), autoGenerate: z.literal(false) }).strict(),
  panel: z.object({ enabled: z.literal(false), success: z.literal(false), arrayCount: z.literal(13) }).strict(),
  spatial: z.object({ typedKeys: count, otherKeys: count, ratlineKeys: count, totalKeys: count, treeCount: count }).strict()
    .refine(value => value.totalKeys >= value.typedKeys + value.otherKeys + value.ratlineKeys &&
      value.treeCount === value.totalKeys - value.typedKeys),
}).strict();
export function decodeCurrentPcb209EmptyRootReply(input: unknown): ReturnType<typeof decodeCurrentPcbStringObservation<typeof schema>> {
  return decodeCurrentPcbStringObservation(input, schema);
}
export type CurrentPcb209EmptyRootObservation = ReturnType<typeof decodeCurrentPcb209EmptyRootReply>;
