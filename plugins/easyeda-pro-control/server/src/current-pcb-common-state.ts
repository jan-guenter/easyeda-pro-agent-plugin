/** Dormant raw common-state collectors for pinned PCB 217199c8. No runtime
 * registration. Read the original source-qualified Save-handler scope only.
 * These preserve raw state, not format-2.0 encoding or stored-source matching.
 */
import { createHash } from "node:crypto";
import { z } from "zod";
import { CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION } from "./current-pcb-diagnostic-model-program.ts";
import { CURRENT_PCB_COMMON_GRAPH_PROGRAM, currentPcbCommonGraphSchema, decodeCurrentPcbCommonGraph } from "./current-pcb-common-graph.ts";
import type { CURRENT_PCB_COMMON_GRAPH_LIMITS } from "./current-pcb-common-graph.ts";

const RULE_FAMILIES = ["safeSpacings", "otherSpacings", "creepageSpacings", "trackPhysics", "netLengthPhysics",
  "netLengthTolerancePhysics", "differentialPhysics", "blindViaPhysics", "radiusPhysics", "innerPlanes", "copperPlanes",
  "solderExpansions", "pasteExpansions", "autoRouters"] as const;
const EMPTY_SELECTORS = ["nets", "netClass", "netDifferentials", "regionSelectors", "equalLengthGroups", "padsPairGroups", "cacheNetModel"] as const;
const CANVAS_FIELDS = ["_origin", "_unit", "_altGridSize", "_gridType", "_multiType", "_multiRatio", "_forceValue"] as const;
const GRID_FIELDS = ["_stepX", "_stepY", "_snapX", "_snapY"] as const;
const SILK_FIELDS = ["_topBoardColor", "_topSilkscreenColor", "_bottomBoardColor", "_bottomSilkscreenColor"] as const;
const CONFIG_FIELDS = ["_startTrackWidth", "_startViaSize", "_rotateWhole", "_trackFollow", "realTimeUpdateUnusedLayers", "unusedPadRange"] as const;
const MODEL_FIELDS = ["_prevTrackWidth", "_adsorb", "_removeLoop"] as const;
const VIA_FIELDS = ["innerRadius", "radius"] as const;
const ROUTING_FIELDS = ["_mode", "_type"] as const;
const OPTION_FIELDS = ["minimumTrackCorners", "pushViaOptimization", "pathOptimization", "currentPathOptimization", "removeCircuitsContainingVias", "removeAntenna"] as const;

const GUARDS = `
"use strict";const bad=()=>{throw new Error("PCB_COMMON_STATE");};
const retained=[],absent=[];const own=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value")||retained.length>=32768)bad();retained.push([o,k,d.value]);return d.value;};
const object=o=>{if(o===null||typeof o!=="object"||Array.isArray(o))bad();return o;};
if((${CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION})!==originalCallback)bad();
const scope=object(own(this,"object")),klass=n=>{const c=own(scope,n);if(typeof c!=="function")bad();return c;};
const instance=(o,n)=>{object(o);if(Object.getPrototypeOf(o)!==own(klass(n),"prototype"))bad();return o;};
const env=instance(own(klass("x"),"env"),"x"),documentUuid=own(env,"_id");
if(own(env,"_doctype")!==3||typeof documentUuid!=="string"||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/.test(documentUuid))bad();
const pick=(o,names)=>{const r=Object.create(null);for(const n of names)r[n]=own(o,n);return r;};
const optional=(o,k)=>{if(Object.getOwnPropertyDescriptor(o,k))return{present:true,value:own(o,k)};let p=Object.getPrototypeOf(o),depth=0;while(p!==null){if(++depth>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}absent.push([o,k]);return{present:false};};
${CURRENT_PCB_COMMON_GRAPH_PROGRAM}
const emptyMap=o=>{if(graphCollection(o,Map.prototype).length!==0)bad();};
const finish=(schema,roots)=>{graphVerify();for(const r of retained){const d=Object.getOwnPropertyDescriptor(r[0],r[1]);if(!d||!Object.hasOwn(d,"value")||!Object.is(d.value,r[2]))bad();}for(const r of absent){if(Object.getOwnPropertyDescriptor(r[0],r[1]))bad();}if((${CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION})!==originalCallback)bad();const text=JSON.stringify({schema,documentUuid,graph:{roots,nodes:graphNodes}});if(text.length>524288)bad();let bytes=0;for(let i=0;i<text.length;i++){const c=text.charCodeAt(i);bytes+=c<128?1:c<2048?2:c>=55296&&c<=56319?(i++,4):3;if(bytes>524288)bad();}return text;};
`;

/** Includes all own fields of layer and physical-stack models. Custom disabled
 * layers remain present. Grid owner and attached native grid parameter scalars
 * are separate, preserving the getter's fallback inputs without invoking it.
 * PANELIZE is disabled but its entire parameter object is retained. */
export const CURRENT_PCB_COMMON_PRESENTATION_FUNCTION = `function(originalCallback){${GUARDS}
const canvas=pick(env,${JSON.stringify(CANVAS_FIELDS)});
const grid=instance(own(klass("At"),"ins"),"At"),gridFields=${JSON.stringify(GRID_FIELDS)};
const gridParam=own(grid,"param"),gridState={owner:pick(grid,gridFields),parameter:gridParam===null?null:pick(instance(gridParam,"ogt"),gridFields)};
const layers=instance(own(klass("Ke"),"manager"),"Ke"),filters=instance(own(klass("zi"),"manager"),"zi");
graphCollection(own(layers,"map"),Map.prototype);graphCollection(own(layers,"_layerPhys"),Map.prototype);graphCollection(own(filters,"map"),Map.prototype);
own(layers,"activeLayer");own(layers,"_deactiveAlpha");
const panel=instance(own(klass("ai"),"model"),"ai"),panelParam=object(own(panel,"_param"));
if(own(panelParam,"on")!==false||own(panelParam,"success")!==false)bad();
const model=instance(own(scope,"Me"),"Yme"),silk=pick(model,${JSON.stringify(SILK_FIELDS)});
const roots=[["canvas",graphValue(canvas)],["grid",graphValue(gridState)],["layers",graphValue(layers)],["filters",graphValue(filters)],["silk",graphValue(silk)],["panelize",graphValue(panelParam)]];
return finish("easyeda-pro-control.pcb-common-presentation.v1",roots);
}`;

/** All fourteen raw rule-family maps, complete own fields and nested tables,
 * template name, selector/index/cache maps and between-net cache are preserved
 * through the complete rule manager. The first empty-board scope rejects every
 * NET, selector, EQLEN group/detail and cached selector, rather than dropping it.
 * Missing default rules are recorded as missing, never repaired. */
export const CURRENT_PCB_COMMON_RULES_FUNCTION = `function(originalCallback){${GUARDS}
const rules=instance(own(klass("te"),"manager"),"te");
for(const name of ${JSON.stringify(RULE_FAMILIES)})graphCollection(own(rules,name),Map.prototype);
graphCollection(own(rules,"defaultRuleMap"),Map.prototype);graphCollection(own(rules,"map"),Map.prototype);graphString(own(rules,"ruleTemplateName"));
for(const name of ${JSON.stringify(EMPTY_SELECTORS)})emptyMap(own(rules,name));
const between=instance(own(rules,"betweenNetRule"),"Wre");
for(const name of ["rule","cacheRuleMap"]){const a=own(between,name);if(!Array.isArray(a)||Object.getPrototypeOf(a)!==Array.prototype||own(a,"length")!==0||Reflect.ownKeys(a).length!==1)bad();}
return finish("easyeda-pro-control.pcb-common-rules.v1",[["rules",graphValue(rules)]]);
}`;

/** Raw backing inputs to every field read by D5. The null previous-width and
 * zero last-via values are kept as such. D5's fallback and rule selection are
 * deliberately not run, inferred or advertised as already encoded preference.
 */
export const CURRENT_PCB_COMMON_PREFERENCE_FUNCTION = `function(originalCallback){${GUARDS}
const config=instance(own(instance(own(scope,"ce"),"Nfe"),"pcbConfig"),"vfe"),model=instance(own(scope,"Me"),"Yme");
const route=instance(own(klass("nr"),"instance"),"nr"),params=instance(own(klass("pl"),"instance"),"pl");
const panel=instance(own(klass("ha"),"instance"),"ha");if(own(panel,"wiringRouterParams")!==params)bad();
const via=own(instance(own(scope,"rt"),"Epe"),"defaultVia");
const configValues=pick(config,${JSON.stringify(CONFIG_FIELDS)});
configValues.layerPreference=optional(config,"_layerPhyPerferenceConfig");
const modelValues=pick(model,${JSON.stringify(MODEL_FIELDS)}),viaValues=pick(via,${JSON.stringify(VIA_FIELDS)});
const routing=pick(route,${JSON.stringify(ROUTING_FIELDS)}),options=pick(params,${JSON.stringify(OPTION_FIELDS)});
return finish("easyeda-pro-control.pcb-common-preference.v1",[["config",graphValue(configValues)],["model",graphValue(modelValues)],["via",graphValue(viaValues)],["routing",graphValue(routing)],["options",graphValue(options)]]);
}`;

type Graph = z.infer<typeof currentPcbCommonGraphSchema>;
type Node = Graph["nodes"][number];
type Value = Graph["roots"][number][1];
function graphObject(graph: Graph, value: Value | undefined, className: string): Extract<Node, { kind: "object" }> | undefined {
  if (value?.[0] !== "ref") { return undefined; }
  const node = graph.nodes[value[1]];
  return node?.kind === "object" && node.className === className ? node : undefined;
}
function ownValue(node: Extract<Node, { kind: "object" }>, key: string): Value | undefined {
  return node.fields.find(field => field[0] === key)?.[1];
}
function exactFields(node: Extract<Node, { kind: "object" }> | undefined, fields: readonly string[]): boolean {
  return node !== undefined && node.fields.length === fields.length && node.fields.every((field, index) => field[0] === fields[index]);
}
function mapField(graph: Graph, node: Extract<Node, { kind: "object" }>, key: string, empty = false): boolean {
  const value = ownValue(node, key);
  if (value?.[0] !== "ref") { return false; }
  const map = graph.nodes[value[1]];
  return map?.kind === "map" && (!empty || map.entries.length === 0);
}
function rulesShape(graph: Graph): boolean {
  const rules = graphObject(graph, graph.roots[0]?.[1], "te");
  if (rules === undefined || ![...RULE_FAMILIES, "map", "defaultRuleMap"].every(name => mapField(graph, rules, name)) ||
      !EMPTY_SELECTORS.every(name => mapField(graph, rules, name, true)) || ownValue(rules, "ruleTemplateName")?.[0] !== "string") { return false; }
  const between = graphObject(graph, ownValue(rules, "betweenNetRule"), "Wre");
  return between !== undefined && ["rule", "cacheRuleMap"].every(name => {
    const value = ownValue(between, name);
    const node = value?.[0] === "ref" ? graph.nodes[value[1]] : undefined;
    return node?.kind === "array" && node.values.length === 0;
  });
}
function presentationShape(graph: Graph): boolean {
  const classes = ["null", "plain", "Ke", "zi", "null", "plain"];
  if (!graph.roots.every((root, index) => graphObject(graph, root[1], classes[index] ?? "") !== undefined)) { return false; }
  const canvas = graphObject(graph, graph.roots[0]?.[1], "null"), grid = graphObject(graph, graph.roots[1]?.[1], "plain");
  const filters = graphObject(graph, graph.roots[3]?.[1], "zi"), layers = graphObject(graph, graph.roots[2]?.[1], "Ke");
  const panel = graphObject(graph, graph.roots[5]?.[1], "plain"), silk = graphObject(graph, graph.roots[4]?.[1], "null");
  if (!exactFields(canvas, CANVAS_FIELDS) || grid === undefined || !exactFields(grid, ["owner", "parameter"]) ||
      !exactFields(graphObject(graph, ownValue(grid, "owner"), "null"), GRID_FIELDS) || !exactFields(silk, SILK_FIELDS)) { return false; }
  const parameter = ownValue(grid, "parameter");
  if (parameter?.[0] !== "null" && !exactFields(graphObject(graph, parameter, "null"), GRID_FIELDS)) { return false; }
  return layers !== undefined && mapField(graph, layers, "map") && mapField(graph, layers, "_layerPhys") &&
    ownValue(layers, "activeLayer")?.[0] === "number" && ownValue(layers, "_deactiveAlpha")?.[0] === "number" &&
    filters !== undefined && mapField(graph, filters, "map") &&
    panel !== undefined && ["on", "success"].every(name => {
      const value = ownValue(panel, name); return value?.[0] === "boolean" && !value[1];
    });
}
function preferenceShape(graph: Graph): boolean {
  const rosters = [[...CONFIG_FIELDS, "layerPreference"], MODEL_FIELDS, VIA_FIELDS, ROUTING_FIELDS, OPTION_FIELDS];
  if (!graph.roots.every((root, index) => exactFields(graphObject(graph, root[1], "null"), rosters[index] ?? []))) { return false; }
  const config = graphObject(graph, graph.roots[0]?.[1], "null");
  if (config === undefined) { return false; }
  const optional = graphObject(graph, ownValue(config, "layerPreference"), "plain");
  if (optional === undefined) { return false; }
  const present = ownValue(optional, "present");
  return present?.[0] === "boolean" && exactFields(optional, present[1] ? ["present", "value"] : ["present"]);
}
function stateSchema<T extends string>(schema: T, names: readonly string[], shape: (graph: Graph) => boolean): z.ZodType<{
  schema: T; documentUuid: string; graph: z.infer<typeof currentPcbCommonGraphSchema>;
}> {
  return z.object({ schema: z.literal(schema), documentUuid: z.string().regex(/^(?:[a-f\d]{16}|[a-f\d]{32})$/u),
    graph: currentPcbCommonGraphSchema.refine(graph => graph.roots.length === names.length &&
      graph.roots.every((root, index) => root[0] === names[index]) && shape(graph)),
  }).strict();
}
const presentationSchema = stateSchema("easyeda-pro-control.pcb-common-presentation.v1", ["canvas", "grid", "layers", "filters", "silk", "panelize"], presentationShape);
const rulesSchema = stateSchema("easyeda-pro-control.pcb-common-rules.v1", ["rules"], rulesShape);
const preferenceSchema = stateSchema("easyeda-pro-control.pcb-common-preference.v1", ["config", "model", "via", "routing", "options"], preferenceShape);
export type CurrentPcbCommonPresentation = Readonly<z.infer<typeof presentationSchema>> & typeof CURRENT_PCB_COMMON_GRAPH_LIMITS;
export type CurrentPcbCommonRules = Readonly<z.infer<typeof rulesSchema>> & typeof CURRENT_PCB_COMMON_GRAPH_LIMITS;
export type CurrentPcbCommonPreference = Readonly<z.infer<typeof preferenceSchema>> & typeof CURRENT_PCB_COMMON_GRAPH_LIMITS;
export function decodeCurrentPcbCommonPresentation(input: unknown): CurrentPcbCommonPresentation {
  return decodeCurrentPcbCommonGraph(input, presentationSchema);
}
export function decodeCurrentPcbCommonRules(input: unknown): CurrentPcbCommonRules {
  return decodeCurrentPcbCommonGraph(input, rulesSchema);
}
export function decodeCurrentPcbCommonPreference(input: unknown): CurrentPcbCommonPreference {
  return decodeCurrentPcbCommonGraph(input, preferenceSchema);
}
export const CURRENT_PCB_COMMON_PROGRAM_HASHES = Object.freeze({
  presentation: createHash("sha256").update(CURRENT_PCB_COMMON_PRESENTATION_FUNCTION).digest("hex"),
  rules: createHash("sha256").update(CURRENT_PCB_COMMON_RULES_FUNCTION).digest("hex"),
  preference: createHash("sha256").update(CURRENT_PCB_COMMON_PREFERENCE_FUNCTION).digest("hex"),
});
