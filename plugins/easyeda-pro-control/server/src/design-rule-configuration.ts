import { isRecord, sha256Json } from "./core.ts";
import type { CompiledDesignOperation } from "./design-operations.ts";
import type { NativeSourceSnapshot } from "./document-source.ts";

type Body = Record<string, unknown>;
const FAMILIES = { Spacing: { "Safe Spacing": "SAFE", "Other Spacing": "OTHER", "Creepage Distance": "CREEPAGE" }, Physics: { Track: "TRACK", "Net Length Range": "NET_LENGTH", "Net Length Tolerance": "NET_LENGTH_TOLERANCE", "Differential Pair": "DIFFER_ENTAIL", "Blind/Buried Via": "BLIND", "Via Size": "RADIUS" }, Plane: { "Plane Zone": "PLANE", "Copper Zone": "COPPER" }, Expansion: { "Solder Mask Expansion": "SOLDER", "Paste Mask Expansion": "PASTE" } };
const SCALARS: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  OTHER: { device2device: "deviceClearance", thru2Smd: "thru2SmdClearance", hole2Hole: "holeClearance" },
  NET_LENGTH: { netLengthMin: "netLenMin", netLengthMax: "netLenMax" },
  NET_LENGTH_TOLERANCE: { netLengthTolerance: "netLengthTolerance" },
  RADIUS: { viaOuterdiameterMin: "minRadius", viaOuterdiameterDefault: "defRadius", viaOuterdiameterMax: "maxRadius", viaInnerdiameterMin: "minInner", viaInnerdiameterDefault: "defInner", viaInnerdiameterMax: "maxInner" },
  SOLDER: { padToplayerExpansion: "padTopExpan", padBottomlayerExpansion: "padBotExpan", viaToplayerExpansion: "viaTopExpan", viaBottomlayerExpansion: "viaBotExpan", testPointToplayerExpansion: "testPointTopExpan", testPointBottomlayerExpansion: "testPointBotExpan" },
  PASTE: { padToplayerExpansion: "padTopExpan", padBottomlayerExpansion: "padBotExpan", testPointToplayerExpansion: "testPointTopExpan", testPointBottomlayerExpansion: "testPointBotExpan" },
};
function object(value: unknown, label: string): Body {if (!isRecord(value)) {throw new Error(`Invalid ${label} rule object.`);} return value;}
function keys(value: Body, allowed: readonly string[], required = allowed): void {
  if (Object.keys(value).some((key) => !allowed.includes(key)) || required.some((key) => !Object.hasOwn(value, key))) {throw new Error("Incomplete or unreviewed native rule configuration field.");}
}
function numeric(value: unknown): number {if (typeof value !== "number" || !Number.isFinite(value)) {throw new TypeError("Non-finite rule quantity.");} return value;}
function round(value: number): number {return Math.round(value * 10_000 + 1e-10) / 10_000;}
function status(value: unknown): boolean {if (value !== 0 && value !== 1 && value !== false && value !== true) {throw new Error("Unknown native rule status.");} return value === 1 || value === true;}
function layer(value: string, before: NativeSourceSnapshot): number {
  const id = Number(value);
  if (!Number.isInteger(id) || !before.objects.some((entry) => entry.type === "LAYER" && entry.id === JSON.stringify(["LAYER", id]))) {throw new Error("Rule table names an absent native layer.");}
  return id;
}
function thermalMode(value: unknown, track: boolean): string {
  const modes = track ? ["DIRECT", "NON_CONNECT"] : ["DIVERGENCE", "DIRECT", "NON_CONNECT"];
  const index = typeof value === "string" && /^[012]$/u.test(value) ? Number(value) : value;
  if (typeof index !== "number" || !Number.isInteger(index) || modes[index] === undefined) {throw new Error("Unknown native thermal mode.");}
  return modes[index];
}

/** Pinned c1 public configuration -> $R native record context. All distances
 * are converted from the row's display unit to native mil, then serialized at
 * four decimals; raw RADIUS values are radii, not public diameters.
 */
export function nativeRuleContext(family: string, row: Body, before: NativeSourceSnapshot): Body {
  if (family === "BLIND") {
    keys(row, ["editName", "isSetDefault", "table"]);
    if (!Array.isArray(row["table"])) {throw new TypeError("Blind-via rule table is incomplete.");}
    const names = new Set<string>();
    const content = row["table"].map((entry: unknown) => {
      const value = object(entry, "blind-via"); keys(value, ["name", "startLayer", "endLayer", "used", "key", "viaSizeRule"], ["name", "startLayer", "endLayer", "viaSizeRule"]);
      const end = layer(String(value["endLayer"]), before), start = layer(String(value["startLayer"]), before);
      if (start === end || (start === 1 && end === 2) || (start === 2 && end === 1) || typeof value["name"] !== "string" || names.has(value["name"])) {throw new Error("Invalid blind-via rule identity or span.");}
      names.add(value["name"]);
      return { name: value["name"], staLayerId: start, endLayerId: end, viaSizeRule: value["viaSizeRule"] };
    });
    return { blinds: { content } };
  }
  const unit = row["unit"];
  if (unit !== "mm" && unit !== "mil" && unit !== "inch") {throw new Error("Unknown rule display unit.");}
  const factor = new Map([["mm", 1 / 0.0254], ["inch", 1000], ["mil", 1]]).get(unit) ?? 1;
  const distance = (value: unknown): number => round(numeric(value) * factor);
  if (family === "SAFE") {
    keys(row, ["editName", "unit", "isSetDefault", "column", "row", "status", "tables"]);
    const labels = ["Track", "SMD Pad", "TH Pad", "SMD Test Point", "TH Test Point", "Via", "Fill Region/Teardrop", "Copper/Plane Zone", "Slot Region", "Line", "Text/Image", "Board Outline", "Hole"];
    if (JSON.stringify(row["column"]) !== JSON.stringify(labels.slice(0, 12)) || JSON.stringify(row["row"]) !== JSON.stringify(labels)) {throw new Error("Legacy, reordered or unknown spacing matrix labels need an explicit migration.");}
    const tables = object(row["tables"], "spacing tables");
    const safeSpacing = Object.entries(tables).map(([key, entry]) => {
      const value = object(entry, "spacing table"); keys(value, ["status", "content"]);
      if (!Array.isArray(value["content"]) || value["content"].length !== 13) {throw new Error("Incomplete spacing matrix.");}
      const content = value["content"].map((cells: unknown, index: number) => {
        // Pinned GY.data/modifyAllClearance omit the Board Outline diagonal.
        // Hole is row 12 but has no column, so its 12 preceding cells remain.
        const length = index < 11 ? index + 1 : index;
        if (!Array.isArray(cells) || cells.length !== length) {throw new Error("Spacing matrix triangle shape changed.");}
        return cells.map((cell: unknown) => distance(cell));
      });
      return { layerId: layer(key, before), isOpen: status(value["status"]), content, columnNames: [] };
    });
    if (safeSpacing.length === 0) {throw new Error("Spacing rule has no table.");}
    return { unit, isForAll: status(row["status"]) ? "LAYERED" : "ALL", safeSpacing };
  }
  keys(row, ["editName", "unit", "isSetDefault", "form"]);
  const form = object(row["form"], "form");
  const scalars = SCALARS[family];
  if (scalars !== undefined) {
    keys(form, Object.keys(scalars));
    const result: Body = { unit };
    for (const [input, raw] of Object.entries(scalars)) {result[raw] = family === "RADIUS" ? round(numeric(form[input]) * factor / 2) : distance(form[input]);}
    return result;
  }
  if (family === "CREEPAGE") {keys(form, ["creepageDistance", "ignoreLayer"]); if (typeof form["ignoreLayer"] !== "boolean") {throw new TypeError("Creepage layer policy is not explicit.");} return { unit, creepageDistance: distance(form["creepageDistance"]), ignoreLayer: form["ignoreLayer"] };}
  const table = (input: unknown, mode: "width" | "spacing" | "thermal" | "track"): Body => {
    const value = object(input, "layer table"); keys(value, ["status", "data"]);
    const content = Object.entries(object(value["data"], "layer rows")).map(([id, entry]) => {
      const data = object(entry, "layer row"), layerId = layer(id, before);
      if (mode === "width" || mode === "spacing") {
        keys(data, ["minValue", "defaultValue", "maxValue"]);
        if (mode === "spacing" && data["maxValue"] !== null) {throw new Error("Native differential spacing has no maximum field.");}
        return mode === "width" ? { layerId, stroMin: distance(data["minValue"]), stroDef: distance(data["defaultValue"]), stroMax: distance(data["maxValue"]) } : { layerId, spacMin: distance(data["minValue"]), spacDef: distance(data["defaultValue"]) };
      }
      if (mode === "track") {keys(data, ["trackConnectMode"]); return { layerId, connType: thermalMode(data["trackConnectMode"], true) };}
      keys(data, ["connectMode", "lineClearance", "lineWidth", "lineAngle"]);
      return { layerId, connType: thermalMode(data["connectMode"], false), spoSpac: distance(data["lineClearance"]), spoWidth: distance(data["lineWidth"]), spoAng: round(numeric(data["lineAngle"])) };
    });
    if (content.length === 0) {throw new Error("Physical rule has no layer table.");}
    return { isOpen: status(value["status"]), content };
  };
  if (family === "TRACK") {return { unit, track: table(form, "width") };}
  if (family === "DIFFER_ENTAIL") {
    keys(form, ["strokeWidthTables", "diffPairSpacingTables", "differentailPairLenTolerMax"]);
    return { unit, stroWidth: table(form["strokeWidthTables"], "width"), spacing: table(form["diffPairSpacingTables"], "spacing"), differPairLenTolerMax: distance(form["differentailPairLenTolerMax"]) };
  }
  if (family === "PLANE") {return { unit, mulPad: table(form, "thermal") };}
  if (family === "COPPER") {
    keys(form, ["singleLayerPadModel", "multiLayerPadModel", "trackConnectModel"]);
    return { unit, sglPad: table(form["singleLayerPadModel"], "thermal"), mulPad: table(form["multiLayerPadModel"], "thermal"), track: table(form["trackConnectModel"], "track") };
  }
  throw new Error("Unreviewed native rule configuration family.");
}

export function expectedRuleConfiguration(compiled: CompiledDesignOperation, before: NativeSourceSnapshot): NativeSourceSnapshot {
  const argument = compiled.call.args[0];
  if (argument?.kind !== "literal") {throw new Error("Rule configuration must be one complete fixed collection.");}
  const config = object(argument.value, "configuration"); keys(config, Object.keys(FAMILIES));
  const records = new Map(before.objects.map((entry) => [entry.id, entry]));
  const desired = new Set<string>(), families = new Set<string>();
  for (const [category, subcategories] of Object.entries(FAMILIES)) {
    const section = object(config[category], "category"); keys(section, Object.keys(subcategories));
    for (const [label, family] of Object.entries(subcategories)) {
      families.add(family);
      const rows = object(section[label], "family");
      if (Object.values(rows).filter((value) => isRecord(value) && value["isSetDefault"] === true).length !== 1) {throw new Error("Each physical rule family needs exactly one explicit default.");}
      for (const [name, value] of Object.entries(rows)) {
        const row = object(value, "row");
        if (name.length === 0 || row["editName"] !== name || typeof row["isSetDefault"] !== "boolean") {throw new Error("Rule identity or default flag is inconsistent.");}
        const id = JSON.stringify(["RULE", family, name]), previous = records.get(id);
        const context = nativeRuleContext(family, row, before);
        const priorContext = previous?.body["ruleContext"];
        records.set(id, { id, type: "RULE", body: { ...previous?.body, ruleState: row["isSetDefault"] ? "DEFAULT" : "NORMAL", ruleContext: { ...(isRecord(priorContext) ? priorContext : {}), ...context } } });
        desired.add(id);
      }
    }
  }
  for (const record of before.objects.filter((entry) => entry.type === "RULE")) {
    const id: unknown = JSON.parse(record.id);
    if (Array.isArray(id) && families.has(String(id[1])) && !desired.has(record.id)) {records.delete(record.id);}
  }
  // Rule definitions may not silently orphan existing per-net/pour selectors.
  for (const record of [...records.values()].filter((entry) => entry.type === "RULE_SELECTOR")) {
    for (const [field, override] of [["ruleKeyValue", null], ["copperValue", "SAFE"], ["innerPlaneValue", "SAFE"]] as const) {
      const values = record.body[field]; if (!isRecord(values)) {throw new Error("Unknown selector body.");}
      for (const [type, value] of Object.entries(values)) {
        const name: unknown = Array.isArray(value) ? value[0] : value;
        if (name !== null && name !== undefined && name !== "default" && (typeof name !== "string" || !records.has(JSON.stringify(["RULE", override ?? type, name])))) {throw new Error("Configuration would orphan a native rule reference.");}
      }
    }
  }
  const objects = [...records.values()].toSorted((left, right) => left.id.localeCompare(right.id));
  const base = { schema: before.schema, document: before.document, objects };
  return { ...base, sha256: sha256Json(base) };
}
