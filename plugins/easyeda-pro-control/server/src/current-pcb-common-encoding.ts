/** Pure supplied-graph relation for selected format2.0 common bodies in PCB
 * 217199c8. Never calls FileSource, D5, model getters or vendor code. The raw
 * graph remains evidence even where native encoding omits a field or layer. */
import { sha256Json, sha256Text } from "./core.ts";
import { decodeCurrentPcbCommonPreference, decodeCurrentPcbCommonPresentation, decodeCurrentPcbCommonRules } from "./current-pcb-common-state.ts";
import type { CurrentPcbCommonPresentation } from "./current-pcb-common-state.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

type Graph = CurrentPcbCommonPresentation["graph"];
type Value = Graph["roots"][number][1];
type Node = Graph["nodes"][number];
type ObjectNode = Extract<Node, { kind: "object" }>;
type Json = null | boolean | number | string | Json[] | { [key: string]: Json | undefined };
type Body = Record<string, Json | undefined>;
const LIMITS = Object.freeze({ originalOwnerVerified: false, nativeIntrinsicsVerified: false,
  atomicSnapshotVerified: false, completeLiveBaselineVerified: false, completeStoredBaselineVerified: false,
  nativeNoMutationVerified: false, storedSourceMatched: false, queueCompletionVerified: false,
  completeEffectVerified: false, saveAuthorized: false, executionAuthorized: false } as const);
// Full graph instances preserve every own field. Native public reads must not
// Be shadowed by those fields while this relation uses their backing values.
const PUBLIC_READS: Readonly<Record<string, readonly string[]>> = {
  Ke: ["deactiveAlpha", "getAllItem", "getLayerPhys", "getLayer"],
  WA: ["config", "visible", "locked", "realActiveColor"], Ff: ["config", "visible", "locked", "getValue"], ee: ["toString"],
  HA: ["layerId", "material", "thickness", "permittivity", "lossTangent", "isKeepIsland"],
  te: ["getRadiusPhysicsByNet", "getNet", "getRuleSelector", "getRadiusPhysics", "getRule", "getDefault"],
  aR: ["isDefault", "defalutInner", "defalutRadius"],
};

export interface CurrentPcbCommonEncodedBody {
  readonly dataType: "CANVAS" | "LAYER" | "LAYER_PHYS" | "ACTIVE_LAYER" | "SILK_OPTS" | "PREFERENCE";
  readonly id: string;
  readonly bodyText: string;
  readonly bodySha256: string;
}
export interface CurrentPcbCommonEncoding extends Readonly<typeof LIMITS> {
  readonly profile: "private.current-pcb-common-encoding.v1";
  readonly documentUuid: string;
  readonly rawGraphSha256: string;
  readonly suppliedRulesGraphSha256: string | null;
  readonly rows: readonly CurrentPcbCommonEncodedBody[];
  readonly bodySequenceSha256: string;
}

function need(ok: boolean, detail: string): asserts ok {
  if (!ok) { throw new Error(`PCB_COMMON_ENCODING: ${detail}`); }
}
function object(graph: Graph, value: Value | undefined, className: string): ObjectNode {
  const node = value?.[0] === "ref" ? graph.nodes[value[1]] : undefined;
  need(node?.kind === "object" && node.className === className, `expected ${className} object`);
  need(!node.fields.some(entry => PUBLIC_READS[className]?.includes(entry[0]) === true), `${className} own public shadow`);
  return node;
}
function field(node: ObjectNode, name: string): Value {
  const value = node.fields.find(entry => entry[0] === name)?.[1];
  need(value !== undefined, `missing ${name}`); return value;
}
function root(graph: Graph, name: string, className: string): ObjectNode {
  return object(graph, graph.roots.find(entry => entry[0] === name)?.[1], className);
}
function number(value: Value): number {
  need(value[0] === "number", "finite raw number required"); return Number(value[1]);
}
function text(value: Value): string {
  need(value[0] === "string", "raw string required"); return value[1];
}
function boolean(value: Value): boolean {
  need(value[0] === "boolean", "raw boolean required"); return value[1];
}
function map(graph: Graph, value: Value): Extract<Node, { kind: "map" }> {
  const node = value[0] === "ref" ? graph.nodes[value[1]] : undefined;
  need(node?.kind === "map", "raw map required"); return node;
}
function rawNumber(node: ObjectNode, name: string): number { return number(field(node, name)); }
function rawText(node: ObjectNode, name: string): string { return text(field(node, name)); }
function rawBoolean(node: ObjectNode, name: string): boolean { return boolean(field(node, name)); }

/** We@3214815, including epsilon placement and negative-zero normalization only
 * At JSON serialization. Refuse overflow instead of accepting JSON's null. */
function round(value: number, digits: number): number {
  const scale = 10 ** digits, scaled = value * scale + 1e-10;
  need(Number.isFinite(scaled), "rounded scalar overflow"); return Math.round(scaled) / scale;
}
function nullableNumber(value: Value): number | null {
  return value[0] === "null" ? null : number(value);
}
function nullableText(value: Value): string | null {
  return value[0] === "null" ? null : text(value);
}
function gridType(value: Value): string {
  const name = text(value);
  if (name === "grid") { return "GRID"; }
  return name === "outlets" ? "OUTLETS" : "NONE";
}
function canvasBody(graph: Graph): Body {
  // AF@4408674 and format@3993664. At uses ||, not ??; alternate grid has no
  // Unit conversion, unlike primary grid. Highlight uses we's default1 digit.
  const canvas = root(graph, "canvas", "null"), point = object(graph, field(canvas, "_origin"), "S");
  const grid = root(graph, "grid", "plain"), owner = object(graph, field(grid, "owner"), "null");
  const attached = field(grid, "parameter"), parameter = attached[0] === "null" ? null : object(graph, attached, "null");
  const gridValue = (name: string): number => {
    const own = rawNumber(owner, name), preferred = parameter === null ? 0 : rawNumber(parameter, name);
    return round((preferred || own) * 10, 6);
  };
  const alternate = object(graph, field(canvas, "_altGridSize"), "plain");
  const alternateValue = (name: string): number => {
    const quantity = object(graph, field(alternate, name), "plain"); return round(rawNumber(quantity, "number"), 6);
  };
  return { originX: round(rawNumber(point, "x") * 10, 4), originY: round(rawNumber(point, "y") * 10, 4),
    unit: rawText(canvas, "_unit"), gridXSize: gridValue("_stepX"), gridYSize: gridValue("_stepY"),
    snapXSize: gridValue("_snapX"), snapYSize: gridValue("_snapY"), altSnapXSize: alternateValue("GridX"),
    altSnapYSize: alternateValue("GridY"), gridType: gridType(field(canvas, "_gridType")),
    multiGridType: gridType(field(canvas, "_multiType")), multiGridRatio: rawNumber(canvas, "_multiRatio"),
    highlightValue: round(rawNumber(canvas, "_forceValue"), 1) };
}
function color(graph: Graph, value: Value): { text: string; alpha: number } {
  const item = object(graph, value, "ee");
  // Ee.toString@1453688 does not round/clamp: even malformed CSS is preserved.
  const channels = ["r", "g", "b"].map(name => {
    const channel = rawNumber(item, name) * 255;
    need(Number.isFinite(channel), "color channel overflow"); return channel.toString(16).padStart(2, "0").slice(0, 2);
  });
  return { text: `#${channels.join("")}`, alpha: rawNumber(item, "alpha") };
}
function flags(graph: Graph, layer: ObjectNode): { use: boolean; show: boolean; locked: boolean } {
  const state = rawNumber(object(graph, field(layer, "status"), "Ff"), "state");
  need(Number.isInteger(state) && state >= 0 && state <= 15, "unsupported layer bit state");
  return { use: state % 2 === 1, show: Math.floor(state / 2) % 2 === 1, locked: Math.floor(state / 4) % 2 === 1 };
}
function row(dataType: CurrentPcbCommonEncodedBody["dataType"], id: string, body: Body): CurrentPcbCommonEncodedBody {
  const bodyText = JSON.stringify(body);
  need(Buffer.byteLength(bodyText) <= 524_288, "encoded body too large");
  return { dataType, id, bodyText, bodySha256: sha256Text(bodyText) };
}
function layerRows(graph: Graph): CurrentPcbCommonEncodedBody[] {
  // YR@4409481; saveCommonData@5840102 skips only unconfigured CUSTOM layers.
  const manager = root(graph, "layers", "Ke"), rows: CurrentPcbCommonEncodedBody[] = [];
  const identities = new Set<number>();
  for (const [key, value] of map(graph, field(manager, "map")).entries) {
    const layer = object(graph, value, "WA"); const id = rawNumber(layer, "layerId"), type = rawText(layer, "type");
    need(Number.isSafeInteger(id) && id > 0 && number(key) === id && !identities.has(id), "layer identity differs"); identities.add(id);
    const state = flags(graph, layer);
    if (type !== "CUSTOM" || state.use) {
      const active = color(graph, field(layer, "_activeColor")), inactive = color(graph, field(layer, "deactiveColor"));
      rows.push(row("LAYER", JSON.stringify(["LAYER", id]), { layerId: id, layerType: type, layerName: rawText(layer, "name"),
        ...state, activeColor: active.text, activateTransparency: active.alpha, inactiveColor: inactive.text,
        inactiveTransparency: rawNumber(manager, "_deactiveAlpha") }));
    }
  }
  // Both physical silkscreen holders are dereferenced later by native wF.
  need(identities.has(3) && identities.has(4), "both silk layer holders required");
  const activeLayer = rawNumber(manager, "activeLayer"); need(identities.has(activeLayer), "active layer missing");
  const physical = map(graph, field(manager, "_layerPhys")).entries.map(([key, value]) => {
    const item = object(graph, value, "HA"); const id = rawNumber(item, "_layerId");
    need(Number.isSafeInteger(id) && number(key) === id, "physical layer identity differs");
    return { item, id, zIndex: rawNumber(item, "zIndex") };
  });
  // GetLayerPhys@3186173 stable-sorts a copy, retaining ties' insertion order.
  for (const { item, id, zIndex } of physical.toSorted((a, b) => a.zIndex - b.zIndex)) {
    const thickness = nullableNumber(field(item, "_thickness"));
    const body: Body = { material: nullableText(field(item, "_material")), thickness: round((thickness ?? 0) * 10, 3),
      permittivity: nullableNumber(field(item, "_permittivity")), lossTangent: nullableNumber(field(item, "_lossTangent")),
      isKeepIsland: rawBoolean(item, "_isKeepIsland"), zIndex };
    rows.push(row("LAYER_PHYS", JSON.stringify(["LAYER_PHYS", id]), body));
  }
  rows.push(row("ACTIVE_LAYER", "ACTIVE_LAYER", { layerId: activeLayer })); return rows;
}
function finish(documentUuid: string, graph: Graph, rules: Graph | null, rows: CurrentPcbCommonEncodedBody[]): CurrentPcbCommonEncoding {
  need(rows.reduce((sum, item) => sum + Buffer.byteLength(item.bodyText), 0) <= 524_288, "body sequence too large");
  return freezeDeep({ profile: "private.current-pcb-common-encoding.v1", documentUuid, rawGraphSha256: sha256Json(graph),
    suppliedRulesGraphSha256: rules === null ? null : sha256Json(rules), rows, bodySequenceSha256: sha256Json(rows), ...LIMITS });
}

/** Input is the fixed reader's strict raw reply, not a caller-supplied live
 * Object. Rows are ordered only within this selected projection. RULE and other
 * Native rows occur before SILK_OPTS and remain deliberately unmodeled. */
export function encodeCurrentPcbCommonPresentation(input: unknown): CurrentPcbCommonEncoding {
  const sample = decodeCurrentPcbCommonPresentation(input); const graph = sample.graph, silk = root(graph, "silk", "null");
  const rows = [row("CANVAS", "CANVAS", canvasBody(graph)), ...layerRows(graph),
    row("SILK_OPTS", '["SILK_OPTS",3]', { defaultColor: rawText(silk, "_topSilkscreenColor"), baseColor: rawText(silk, "_topBoardColor") }),
    row("SILK_OPTS", '["SILK_OPTS",4]', { defaultColor: rawText(silk, "_bottomSilkscreenColor"), baseColor: rawText(silk, "_bottomBoardColor") })];
  return finish(sample.documentUuid, graph, null, rows);
}

function scalar(value: Value): null | undefined | string | number | boolean {
  switch (value[0]) {
    case "null": { return null; }
    case "undefined": { return undefined; }
    case "number": { return number(value); }
    case "string": case "boolean": { return value[1]; }
    case "ref": { throw new Error("PCB_COMMON_ENCODING: scalar required"); }
    default: { throw new Error("PCB_COMMON_ENCODING: invalid scalar"); }
  }
}
function jsonValue(graph: Graph, value: Value, path: Set<number>, budget: { remaining: number; bytes: number }): Json | undefined {
  budget.remaining -= 1;
  need(budget.remaining >= 0 && path.size <= 32, "JSON expansion bound");
  if (value[0] !== "ref") {
    const result = scalar(value);
    // Undefined array items encode as null. Charge output before expanding an
    // Aliased graph, not only after potentially large JSON allocation.
    budget.bytes -= Buffer.byteLength(JSON.stringify(result ?? null));
    need(budget.bytes >= 0, "JSON byte expansion bound"); return result;
  }
  const index = value[1], node = graph.nodes[index];
  need(!path.has(index) && node !== undefined, "cyclic JSON preference");
  const next = new Set([...path, index]);
  need((node.kind === "array" || node.kind === "object") && node.jsonToJSONAbsent === true, "JSON serializer absence evidence required");
  if (node.kind === "array") {
    budget.bytes -= 2 + Math.max(0, node.values.length - 1);
    need(budget.bytes >= 0, "JSON byte expansion bound");
    return node.values.map(entry => jsonValue(graph, entry, next, budget) ?? null);
  }
  need((node.className === "plain" || node.className === "null") && node.enumerableKeys !== undefined,
    "object preference needs enumerable-field evidence");
  budget.bytes -= 2 + Math.max(0, node.enumerableKeys.length - 1);
  const entries = node.enumerableKeys.map(key => {
    budget.bytes -= Buffer.byteLength(JSON.stringify(key)) + 1;
    need(budget.bytes >= 0, "JSON byte expansion bound");
    return [key, jsonValue(graph, field(node, key), next, budget)] as const;
  });
  // Object.fromEntries defines __proto__ as data; assignment would invoke the
  // Host prototype setter. Native integer-key enumeration is retained by JSON.
  return Object.fromEntries<Json | undefined>(entries);
}
function radiusDefaults(graph: Graph): ObjectNode | undefined {
  const rules = root(graph, "rules", "te"); const radius = field(rules, "radiusPhysics"), safe = field(rules, "safeSpacings");
  // Native getDefault3499660 selects a separate safe-cache branch by Map
  // Identity. The modeled radius branch must not alias that safe family Map.
  need(radius[0] === "ref" && safe[0] === "ref" && radius[1] !== safe[1], "radius/safe map alias excluded");
  const entries = map(graph, radius).entries;
  // D5 calls getRadiusPhysicsByNet even when both overrides are nonzero.
  // Empty maps invoke correctDefault and are never admitted by this relation.
  need(entries.length > 0, "radius default repair would run");
  const items = entries.map(entry => object(graph, entry[1], "aR"));
  return items.find(item => rawBoolean(item, "_isDefault"));
}
function viaRadius(via: ObjectNode, name: string, defaults: ObjectNode | undefined, fallback: string): number {
  const value = nullableNumber(field(via, name));
  if (value !== null && value !== 0) { return value; }
  need(defaults !== undefined, "missing radius default"); return rawNumber(defaults, fallback);
}
function routingMode(value: string): string {
  switch (value) {
    case "WIRING_MODE_OBSTRUCT": { return "OBSTRUCT"; }
    case "WIRING_MODE_PUSHAWAY": { return "PUSH"; }
    case "WIRING_MODE_SURROUND": { return "SURROUND"; }
    case "WIRING_MODE_SURROUND_AND_PUSHAWAY": { return "SURROUND&PUSH"; }
    default: { return "NONE"; }
  }
}
function routingCorner(value: string): string | undefined {
  switch (value) {
    case "WIRING_CORNER_LINE45": { return "L45"; }
    case "WIRING_CORNER_LINE90": { return "L90"; }
    case "WIRING_CORNER_FREEANGLE": { return "L"; }
    case "WIRING_CORNER_ARC45": { return "R45"; }
    case "WIRING_CORNER_ARC90": { return "R90"; }
    case "WIRING_CORNER_ARC": { return "R"; }
    default: { return undefined; }
  }
}
function optionName(value: Value, choices: readonly (readonly [string | number, string])[]): string | null {
  const input = scalar(value); return choices.find(entry => entry[0] === input)?.[1] ?? null;
}
function trackCorner(value: Value): number {
  need(value[0] === "number" || value[0] === "string", "unmodeled track corner coercion");
  // Pl.getTrackMinCorner@7355548 uses parseInt without a radix. Keep hex and
  // Scientific-notation behavior, but refuse native NaN rather than emit null.
  const input = value[0] === "number" ? String(number(value)) : value[1];
  // oxlint-disable-next-line eslint/radix -- Mirrors the pinned native omitted-radix conversion, including hex prefixes.
  const result = Number.parseInt(input); need(Number.isFinite(result), "invalid track corner"); return result;
}
/** Exact selected raw inputs only. Initialized width and a nonempty radius map
 * Avoid the known lazy-repair paths in the modeled empty-NET branch. Independent
 * Samples still do not establish an unchanged interval or native no-mutation. */
export function encodeCurrentPcbCommonPreference(input: unknown, rulesInput: unknown): CurrentPcbCommonEncoding {
  const rules = decodeCurrentPcbCommonRules(rulesInput), sample = decodeCurrentPcbCommonPreference(input);
  need(sample.documentUuid === rules.documentUuid, "preference/rules document differs");
  const graph = sample.graph;
  const config = root(graph, "config", "null"), model = root(graph, "model", "null"), options = root(graph, "options", "null"),
    routing = root(graph, "routing", "null"), via = root(graph, "via", "null");
  const defaults = radiusDefaults(rules.graph), width = rawNumber(model, "_prevTrackWidth");
  const optional = object(graph, field(config, "layerPreference"), "plain");
  const preference = rawBoolean(optional, "present") ? jsonValue(graph, field(optional, "value"), new Set(), { remaining: 32_768, bytes: 524_288 }) : undefined;
  const body: Body = { startTrackWidthFollowLast: rawText(config, "_startTrackWidth") === "last", lastTrackWidth: round(width * 10, 4),
    startViaSizeFollowLast: rawText(config, "_startViaSize") === "last", lastViaInnerDiameter: round(viaRadius(via, "innerRadius", defaults, "_defaultInner") * 20, 4),
    lastViaDiameter: round(viaRadius(via, "radius", defaults, "_defaultRadius") * 20, 4), snap: rawBoolean(model, "_adsorb"),
    routingMode: routingMode(rawText(routing, "_mode")), routingCorner: routingCorner(rawText(routing, "_type")),
    removeLoop: rawBoolean(model, "_removeLoop"), rotatingObject: rawText(config, "_rotateWhole") === "single",
    trackFollow: rawText(config, "_trackFollow") === "moveKeep", stretchTrackMinCorner: trackCorner(field(options, "minimumTrackCorners")),
    preferenceConfig: preference, realTimeUpdateUnusedLayers: rawBoolean(config, "realTimeUpdateUnusedLayers"),
    unusedPadRange: optionName(field(config, "unusedPadRange"), [[3, "VIA"], [2, "PAD"], [1, "ALL"]]),
    pushVia: optionName(field(options, "pushViaOptimization"), [["OPTIMIZA_NONE", "OPTIMIZA_NONE"], ["OPTIMIZA_OPEN", "OPTIMIZA_OPEN"]]),
    pathOptimization4BePushed: optionName(field(options, "pathOptimization"), [[2, "NONE"], [1, "ALL"], [0, "SINGLE"]]),
    currentPathOptimization4BePushed: optionName(field(options, "currentPathOptimization"), [["OPTIMIZA_NONE", "OPTIMIZA_NONE"], ["OPTIMIZA_STRONG", "OPTIMIZA_STRONG"], ["OPTIMIZA_WEAK", "OPTIMIZA_WEAK"]]),
    removeCircuitsContainingVias: rawBoolean(options, "removeCircuitsContainingVias"), removeAntenna: rawBoolean(options, "removeAntenna") };
  return finish(sample.documentUuid, graph, rules.graph, [row("PREFERENCE", "PREFERENCE", body)]);
}
