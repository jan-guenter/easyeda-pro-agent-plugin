/** Pure selected common-row relation for pinned PCB217199c8. No native getter,
 * Serializer, queue, FileSource, update or Save is invoked. */
import { sha256Json, sha256Text } from "./core.ts";
import { decodeCurrentPcbCommonPresentation, decodeCurrentPcbCommonRules } from "./current-pcb-common-state.ts";
import type { CurrentPcbCommonRules } from "./current-pcb-common-state.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

type Graph = CurrentPcbCommonRules["graph"];
type Value = Graph["roots"][number][1];
type ObjectNode = Extract<Graph["nodes"][number], { kind: "object" }>;
type Json = string | number | boolean | null | Json[] | { [key: string]: Json };
type Body = Record<string, Json>;
const FAMILIES = [["safeSpacings", "xI", "SAFE"], ["otherSpacings", "Ky", "OTHER"],
  ["creepageSpacings", "nC", "CREEPAGE"], ["trackPhysics", "cR", "TRACK"],
  ["netLengthPhysics", "tR", "NET_LENGTH"], ["netLengthTolerancePhysics", "rR", "NET_LENGTH_TOLERANCE"],
  ["differentialPhysics", "i2", "DIFFER_ENTAIL"], ["blindViaPhysics", "Jx", "BLIND"],
  ["radiusPhysics", "aR", "RADIUS"], ["innerPlanes", "eR", "PLANE"], ["copperPlanes", "Qx", "COPPER"],
  ["pasteExpansions", "sR", "PASTE"], ["solderExpansions", "lR", "SOLDER"], ["autoRouters", "hR", "AUTO_ROUTER"]] as const;
// Native public reads/calls must reach their pinned prototype implementation.
// Keep unrelated own backing state; reject only source-used shadows, including
// Non-callable toJSON shadows that would make the native serializer throw.
const PUBLIC_READS: Readonly<Record<string, readonly string[]>> = {
  te: ["getRuleTemplateName", "getAll", "getAllSafeSpacing", "getAllOtherSpacing", "getAllCreepageSpacing", "getAllTrackPhysics",
    "getAllNetLengthPhysics", "getAllNetLengthTolerancePhysics", "getAllDifferentialPhysics", "getAllBlindPhysics", "getAllRadiusPhysics",
    "getAllInnerPlane", "getAllCopperPlane", "getAllPasteExpansion", "getAllSolderExpansion", "getAllAutoRouterRules",
    "getAllNetClass", "getAllNets", "getAllNetDifferentials", "getAllEqualLengthGroups", "getAllPadsPairGroups", "getAllRegions", "getAllSelector"],
  xI: ["status", "toJSON", "getTable"], fj: ["data", "getPosition"],
  Ky: ["deviceClearance", "thru2SmdClearance", "holeClearance"], nC: ["creepageDistance", "ignoreLayer"],
  cR: ["toJSON", "getLayerStatus"], E8: ["toJSON", "minValue", "defaultValue", "maxValue"],
  tR: ["netLengthMin", "netLengthMax"], rR: ["netLengthTolerance"],
  i2: ["toJSON", "getLayerStatus", "differentialPairLenTolerMax"], Jx: ["getAllVias"],
  Yre: ["name", "startLayer", "endLayer", "viaSizeRule"],
  aR: ["minRadius", "defalutRadius", "maxRadius", "minInner", "defalutInner", "maxInner"],
  eR: ["toJSON"], Qx: ["toJSON", "getLayerStatus"], O8: ["PadConnectRule", "connectMode", "lineClearance", "lineWidth", "lineAngle"],
  KCe: ["trackConnect"], sR: ["padTopExpansion", "padBottomExpansion", "testPointTopExpansion", "testPointBottomExpansion"],
  lR: ["padTopExpansion", "padBottomExpansion", "testPointTopExpansion", "testPointBottomExpansion", "viaTopExpansion", "viaBottomExpansion"],
  hR: ["config", "routingCorner", "isKeep", "viaQuatity", "routingEffectPriority", "routingNetPriority"], Ll: ["visible", "pick"], zi: ["getItem"],
};
// Native getPrimitives@4770832 order, vF@4410600 mapping. Both copper names select21.
const PRIMITIVES = [["ALL", 0], ["COMPONENT", 1], ["PROPERTY", 2], ["COMPONENTSILK", 3], ["TRACK", 4],
  ["VIA", 9], ["TESTPOINT", 5], ["PAD", 6], ["PADSPAIR", 7], ["NETWORK", 8], ["SUTUREHOLE", 10],
  ["TEARDROP", 34], ["RATLINE", 11], ["GROUP", 12], ["TEXT", 13], ["IMAGE", 15], ["PICTURE", 14],
  ["DIMENSION", 16], ["BOARDOUTLINE", 17], ["SLOTREGION", 18], ["FILLREGIEN", 19], ["COPPEROUTLINE", 21],
  ["COPPERFILLED", 21], ["PROHIBITEDREGION", 23], ["CONSTRAINT", 24], ["PARTITION", 25], ["LINE", 26],
  ["LOCKED", 36], ["UNLOCKED", 37], ["SHELL", 27], ["BOSS", 28], ["CREASE", 29], ["TOPSHELLCUT", 30],
  ["SIDESHELLCUT", 31], ["TOPBOTTOMENTITY", 32], ["SIDEENTITY", 33], ["FPC_STIFFENER", 20]] as const;
const LIMITS = Object.freeze({ originalOwnerVerified: false, nativeIntrinsicsVerified: false,
  atomicSnapshotVerified: false, completeLiveBaselineVerified: false, completeStoredBaselineVerified: false,
  nativeNoMutationVerified: false, storedSourceMatched: false, queueCompletionVerified: false,
  completeEffectVerified: false, saveAuthorized: false, executionAuthorized: false } as const);
interface EncodedRow {
  readonly dataType: "RULE_TEMPLATE" | "RULE" | "PRIMITIVE" | "PANELIZE";
  readonly id: string; readonly bodyText: string; readonly bodySha256: string;
}
export interface CurrentPcbCommonRuleEncoding extends Readonly<typeof LIMITS> {
  readonly profile: "private.current-pcb-common-rule-encoding.v1";
  readonly documentUuid: string; readonly rulesGraphSha256: string; readonly presentationGraphSha256: string;
  readonly rows: readonly EncodedRow[]; readonly bodySequenceSha256: string;
  readonly panelize: EncodedRow;
  readonly omissions: readonly string[];
}
function need(ok: boolean, detail: string): asserts ok {
  if (!ok) { throw new Error(`PCB_COMMON_RULE_ENCODING: ${detail}`); }
}
function object(graph: Graph, value: Value | undefined, className: string): ObjectNode {
  const item = value?.[0] === "ref" ? graph.nodes[value[1]] : undefined;
  need(item?.kind === "object" && item.className === className, `expected ${className}`);
  const rule = FAMILIES.some(entry => entry[1] === className);
  const names = new Set([...(PUBLIC_READS[className] ?? []), ...(rule ? ["name", "isDefault"] : []),
    ...(rule && className !== "Jx" && className !== "hR" ? ["unit"] : [])]);
  need(!item.fields.some(entry => names.has(entry[0])), `${className} own public shadow`); return item;
}
function field(item: ObjectNode, name: string): Value {
  const value = item.fields.find(entry => entry[0] === name)?.[1]; need(value !== undefined, `missing ${name}`); return value;
}
function number(value: Value): number { need(value[0] === "number", "finite number required"); return Number(value[1]); }
function text(value: Value): string { need(value[0] === "string", "string required"); return value[1]; }
function boolean(value: Value): boolean { need(value[0] === "boolean", "boolean required"); return value[1]; }
function numeric(item: ObjectNode, name: string): number { return number(field(item, name)); }
function string(item: ObjectNode, name: string): string { return text(field(item, name)); }
function bool(item: ObjectNode, name: string): boolean { return boolean(field(item, name)); }
function map(graph: Graph, value: Value): Extract<Graph["nodes"][number], { kind: "map" }> {
  const item = value[0] === "ref" ? graph.nodes[value[1]] : undefined;
  need(item?.kind === "map" && item.entries.length <= 512, "bounded map required"); return item;
}
function array(graph: Graph, value: Value): Value[] {
  const item = value[0] === "ref" ? graph.nodes[value[1]] : undefined;
  need(item?.kind === "array", "dense array required"); return item.values;
}
function scaled(value: number): number {
  // Hs4743362 -> we3214815, preserve multiplication and epsilon order.
  const result = Math.round(value * 10 * 10_000 + 1e-10) / 10_000;
  need(Number.isFinite(result), "numeric overflow"); return result;
}
function distance(item: ObjectNode, name: string): number { return scaled(numeric(item, name)); }
function angle(value: number): number {
  const result = Math.round(value / Math.PI * 180 * 10_000 + 1e-10) / 10_000;
  need(Number.isFinite(result), "angle overflow"); return result;
}
function row(dataType: EncodedRow["dataType"], id: string, body: Body): EncodedRow {
  const bodyText = JSON.stringify(body); need(Buffer.byteLength(bodyText) <= 524_288, "body byte limit");
  return { dataType, id, bodyText, bodySha256: sha256Text(bodyText) };
}
function table(graph: Graph, item: ObjectNode, name: string, className: string): { layerId: number; item: ObjectNode }[] {
  return map(graph, field(item, name)).entries.map(([key, value]) => ({ layerId: number(key), item: object(graph, value, className) }));
}
function status(graph: Graph, item: ObjectNode, index: number): boolean {
  const value = map(graph, field(item, "layerStatus")).entries.find(entry => entry[0][0] === "number" && number(entry[0]) === index)?.[1];
  // Native i2 may return undefined; Qx first falls back to0. Both FI(undefined/0) false.
  return value === undefined ? false : number(value) === 1;
}
function dimensions(item: ObjectNode): Body {
  return { stroMin: distance(item, "_minValue"), stroDef: distance(item, "_defaultValue"), stroMax: distance(item, "_maxValue") };
}
function pad(item: ObjectNode): Body {
  const mode = numeric(item, "_connectMode");
  let connType = "DIRECT";
  if (mode === 0) { connType = "DIVERGENCE"; } else if (mode === 2) { connType = "NON_CONNECT"; }
  return { connType, spoSpac: distance(item, "_lineClearance"), spoWidth: distance(item, "_lineWidth"), spoAng: angle(numeric(item, "_lineAngle")) };
}
function padTables(graph: Graph, item: ObjectNode, name: string, isOpen: boolean): Body {
  return { isOpen, content: table(graph, item, name, "O8").map(entry => layerBody(entry.layerId, pad(entry.item))) };
}
function layerBody(layerId: number, body: Body): Body { return { layerId, ...body }; }
function safeSpacing(graph: Graph, item: ObjectNode, unit: string): Body {
  const state = numeric(item, "_status"); let tables = table(graph, item, "tables", "fj");
  if (state === 0) {
    const reference = numeric(item, "referenceLayer"), selected = tables.find(entry => entry.layerId === reference);
    need(selected !== undefined, "missing safe reference table"); tables = [selected];
  }
  return { unit, isForAll: state === 1 ? "LAYERED" : "ALL", safeSpacing: tables.map(entry => {
    const data = array(graph, field(entry.item, "_data")); need(data.length === 156, "safe matrix storage length");
    // Native fj.data3466478:13rows, stride12, and no row11 diagonal. This is not a
    // Symmetric square matrix; preserve the native triangular output exactly.
    const content: number[][] = [];
    for (let r = 0; r < 13; r += 1) {
      const cells: number[] = [];
      for (let c = 0; c < 12 && c <= r; c += 1) {
        if (r < 11 || c < r) {
          const value = data[r * 12 + c]; need(value !== undefined, "missing safe matrix cell"); cells.push(scaled(number(value)));
        }
      }
      content.push(cells);
    }
    return { layerId: entry.layerId, isOpen: numeric(entry.item, "status") === 1, content, columnNames: [] };
  }) };
}
function differential(graph: Graph, item: ObjectNode, unit: string): Body {
  return { unit, stroWidth: { isOpen: status(graph, item, 0), content: table(graph, item, "strokeWidthTables", "E8").map(entry => ({
    layerId: entry.layerId, stroMin: distance(entry.item, "_minValue"), stroMax: distance(entry.item, "_maxValue"), stroDef: distance(entry.item, "_defaultValue") })) },
    spacing: { isOpen: status(graph, item, 1), content: table(graph, item, "diffPairSpacingTables", "E8").map(entry => ({
      layerId: entry.layerId, spacMin: distance(entry.item, "_minValue"), spacDef: distance(entry.item, "_defaultValue") })) },
    differPairLenTolerMax: distance(item, "_differentialPairLenTolerMax") };
}
function expansion(item: ObjectNode, unit: string, solder: boolean): Body {
  const body: Body = { unit, padTopExpan: distance(item, "_padTopExpansion"), padBotExpan: distance(item, "_padBottomExpansion") };
  if (solder) { body["viaTopExpan"] = distance(item, "_viaTopExpansion"); body["viaBotExpan"] = distance(item, "_viaBottomExpansion"); }
  body["testPointTopExpan"] = distance(item, "_testPointTopExpansion"); body["testPointBotExpan"] = distance(item, "_testPointBottomExpansion");
  return body;
}
function autoRouter(graph: Graph, item: ObjectNode): Body {
  const corner = numeric(item, "_routingCorner"), quantity = numeric(item, "_viaQuatity");
  let routingCorner = "L45", viaQuantity = "LESS";
  if (corner === 1) { routingCorner = "L90"; } else if (corner === 2) { routingCorner = "A90"; }
  if (quantity === 1) { viaQuantity = "MID"; } else if (quantity === 2) { viaQuantity = "MORE"; }
  for (const name of ["layers", "ignoreNets"]) {
    const value = field(item, name); const node = value[0] === "ref" ? graph.nodes[value[1]] : undefined;
    need(node?.kind === "array" && node.jsonToJSONAbsent === true, "raw router array serializer evidence");
  }
  return { routingCorner, isKeep: bool(item, "_isKeep") ? 1 : 0, viaQuantity,
    routingEffectPriority: numeric(item, "_routingEffectPriority") === 0 ? "SPEED_FIRST" : "COMPLETION_FIRST",
    layers: array(graph, field(item, "layers")).map(value => number(value)), ignoreNets: array(graph, field(item, "ignoreNets")).map(value => text(value)) };
}
function context(graph: Graph, item: ObjectNode, unit: string, className: string): Body {
  switch (className) {
    case "xI": { return safeSpacing(graph, item, unit); }
    case "Ky": { return { unit, deviceClearance: distance(item, "_device2Device"),
      thru2SmdClearance: scaled(Math.max(0, numeric(item, "_thru2SMD"))),
      holeClearance: scaled(numeric(item, "_hole2Hole") >= 0 ? numeric(item, "_hole2Hole") : 0.69) }; }
    case "nC": { return { unit, creepageDistance: scaled(Math.max(0, numeric(item, "_creepageDistance"))), ignoreLayer: bool(item, "_ignoreLayer") }; }
    case "cR": { return { unit, track: { isOpen: numeric(item, "layerStatus") === 1,
      content: table(graph, item, "tables", "E8").map(entry => layerBody(entry.layerId, dimensions(entry.item))) } }; }
    case "tR": { return { unit, netLenMin: distance(item, "_netLengthMin"), netLenMax: distance(item, "_netLengthMax") }; }
    case "rR": { return { unit, netLengthTolerance: distance(item, "_netLengthTolerance") }; }
    case "i2": { return differential(graph, item, unit); }
    case "Jx": { return { blinds: { content: array(graph, field(item, "blindVias")).map(value => {
      const via = object(graph, value, "Yre"); return { name: string(via, "_name"), staLayerId: numeric(via, "_startLayer"),
        endLayerId: numeric(via, "_endLayer"), viaSizeRule: string(via, "_viaSizeRule") };
    }) } }; }
    case "aR": { return { unit, minRadius: distance(item, "_minRadius"), defRadius: distance(item, "_defaultRadius"),
      maxRadius: distance(item, "_maxRadius"), minInner: distance(item, "_minInner"), defInner: distance(item, "_defaultInner"), maxInner: distance(item, "_maxInner") }; }
    case "eR": { return { unit, mulPad: padTables(graph, item, "multiLayerPadModel", numeric(item, "layerStatus") === 1) }; }
    case "Qx": { return { unit, sglPad: padTables(graph, item, "singleLayerPadModel", status(graph, item, 0)),
      mulPad: padTables(graph, item, "multiLayerPadModel", status(graph, item, 1)),
      track: { isOpen: status(graph, item, 2), content: table(graph, item, "trackConnectModel", "KCe").map(entry => ({
        layerId: entry.layerId, connType: numeric(entry.item, "_trackConnect") === 1 ? "NON_CONNECT" : "DIRECT" })) } }; }
    case "sR": { return expansion(item, unit, false); }
    case "lR": { return expansion(item, unit, true); }
    case "hR": { return autoRouter(graph, item); }
    default: { throw new Error("PCB_COMMON_RULE_ENCODING: unsupported rule class"); }
  }
}
function ruleRows(graph: Graph, budget: { remaining: number }): EncodedRow[] {
  const rules = object(graph, graph.roots[0]?.[1], "te"), unitValue = graph.roots[1]?.[1];
  need(unitValue !== undefined, "missing observed rule unit"); const unit = text(unitValue);
  const ids = new Set<string>(), rows = [row("RULE_TEMPLATE", "RULE_TEMPLATE", { name: string(rules, "ruleTemplateName") })];
  budget.remaining -= Buffer.byteLength(rows[0]?.bodyText ?? "");
  for (const [family, className, type] of FAMILIES) {
    const seen = new Set<ObjectNode>();
    for (const [, value] of map(graph, field(rules, family)).entries) {
      const item = object(graph, value, className);
      // Native te.getAll3499595 first turns Map values into a Set. Aliased values
      // Appear once at first insertion, even when multiple keys reference them.
      if (!seen.has(item)) {
        seen.add(item); const id = JSON.stringify(["RULE", type, string(item, "_name")]);
        need(!ids.has(id), "colliding native rule ID"); ids.add(id);
        // QRe665570 removes ruleType/ruleName from body, preserving their ID.
        const encoded = row("RULE", id, { ruleState: bool(item, "_isDefault") ? "DEFAULT" : "NORMAL", ruleContext: context(graph, item, unit, className) });
        budget.remaining -= Buffer.byteLength(encoded.bodyText); need(budget.remaining >= 0, "sequence byte limit"); rows.push(encoded);
        need(rows.length <= 513, "rule row limit");
      }
    }
  }
  return rows;
}
function primitiveRows(graph: Graph): EncodedRow[] {
  const filters = object(graph, graph.roots.find(entry => entry[0] === "filters")?.[1], "zi");
  const entries = map(graph, field(filters, "map")).entries.map(([key, value]) => {
    const item = object(graph, value, "Ll"), type = number(key);
    need(numeric(item, "type") === type, "filter identity differs");
    return { type, display: bool(item, "_visible"), pick: bool(item, "_pick") };
  });
  return PRIMITIVES.map(([name, type]) => {
    const entry = entries.find(item => item.type === type);
    // RH.getPick9106015/getVisible9107444 return false for absent filters.
    return row("PRIMITIVE", JSON.stringify(["PRIMITIVE", name]), { display: entry?.display ?? false, pick: entry?.pick ?? false });
  });
}
function panelizeRow(graph: Graph): EncodedRow {
  const item = object(graph, graph.roots.find(entry => entry[0] === "panelize")?.[1], "plain");
  need(item.jsonToJSONAbsent === true && item.enumerableKeys !== undefined, "panel clone descriptor evidence");
  const copied = new Map<string, Value>();
  // Native feedPanelize4768233 first JSON-clones the whole parameter object. This
  // Initial disabled-panel subset accepts only scalar enumerable values, so
  // No unknown nested object or toJSON hook can be silently omitted.
  for (const key of item.enumerableKeys) {
    const value = field(item, key);
    need(value[0] !== "ref" && key !== "__proto__", "unsupported panel clone member");
    if (value[0] !== "undefined") { copied.set(key, value); }
  }
  const copy: ObjectNode = { kind: "object", className: "plain", fields: [...copied] };
  need(!bool(copy, "on") && !bool(copy, "success"), "active panel excluded");
  const vertical = copied.get("vertical");
  const direction = (fallback: boolean): boolean => vertical === undefined ? fallback : boolean(vertical);
  const count = (name: string): number => {
    const value = field(copy, name); need(value[0] === "number" || value[0] === "string", "panel count scalar required");
    const source = value[0] === "number" ? String(number(value)) : value[1];
    // oxlint-disable-next-line eslint/radix -- Native une4430699 uses omitted-radix parseInt.
    const result = Number.parseInt(source); need(Number.isFinite(result), "invalid panel group count"); return result;
  };
  const stamp = (fallback: boolean): Body => {
    const isVertical = direction(fallback);
    return { on: bool(copy, isVertical ? "stampColumn" : "stampRow"),
      stampHoleGroupQuantity: count(isVertical ? "stampPerColumn" : "stampPerRow"),
      stampHoleDiameter: distance(copy, "stampHoleDiameter"), stampHoleQuantityPerGroup: numeric(copy, "stampHolePerGroup"),
      stampHoleSpacing: distance(copy, "stampHoleSpacing") };
  };
  const side = (fallback: boolean): Body => ({ on: bool(copy, direction(fallback) ? "borderAtTopBottom" : "borderAtLeftRight"),
    sideHeight: distance(copy, "borderHeight"), positionHoleDiameter: bool(copy, "createPositionHole") ? distance(copy, "positionHoleDiameter") : 0,
    markDiameter: bool(copy, "createMark") ? distance(copy, "markDiameter") : 0, markExpansion: distance(copy, "markExpansion") });
  return row("PANELIZE", "PANELIZE", { on: false, row: numeric(copy, "row"), column: numeric(copy, "column"),
    rowSpacing: distance(copy, "rowSpacing"), columnSpacing: distance(copy, "columnSpacing"), onlyOutline: bool(copy, "onlyOutline"),
    horizontalStamp: stamp(false), verticalStamp: stamp(true), horizontalSize: side(false), verticalSize: side(true) });
}
/** Exact selected rows from two supplied non-atomic graph replies. Every NET,
 * Selector and EQLEN participant is already excluded by the rules decoder. */
export function encodeCurrentPcbCommonRulesAndPrimitives(rulesInput: unknown, presentationInput: unknown): CurrentPcbCommonRuleEncoding {
  const presentation = decodeCurrentPcbCommonPresentation(presentationInput), rules = decodeCurrentPcbCommonRules(rulesInput);
  need(presentation.documentUuid === rules.documentUuid, "common document differs");
  const panelize = panelizeRow(presentation.graph); const budget = { remaining: 524_288 - Buffer.byteLength(panelize.bodyText) };
  const rows = [...ruleRows(rules.graph, budget), ...primitiveRows(presentation.graph)];
  need(rows.reduce((sum, item) => sum + Buffer.byteLength(item.bodyText), Buffer.byteLength(panelize.bodyText)) <= 524_288, "sequence byte limit");
  return freezeDeep({ profile: "private.current-pcb-common-rule-encoding.v1", documentUuid: rules.documentUuid,
    rulesGraphSha256: sha256Json(rules.graph), presentationGraphSha256: sha256Json(presentation.graph), rows,
    bodySequenceSha256: sha256Json({ rows, panelize }), panelize, omissions: [], ...LIMITS });
}
