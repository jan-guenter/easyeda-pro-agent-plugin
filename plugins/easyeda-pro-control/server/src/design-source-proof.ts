import { canonicalJson, isRecord, sha256Json } from "./core.ts";
import { DESIGN_OPERATION_PROFILE, compileDesignOperation, designOperationSchema } from "./design-operations.ts";
import type { CompiledDesignOperation, DesignExpectedField, DesignOperation } from "./design-operations.ts";
import { assertCopperClearProfile, assertCopperRebuildProfile, expectedCopperClearSource, expectedCopperRebuildSource } from "./design-copper-adapter.ts";
import { expectedBetweenRules, expectedRegionRules } from "./design-rule-collections.ts";
import { expectedRuleConfiguration } from "./design-rule-configuration.ts";
import { compareDocumentSources } from "./document-source.ts";
import type { NativeSourceDelta, NativeSourceObject, NativeSourceSnapshot } from "./document-source.ts";

export interface DesignSourceIds { readonly targetId?: string; readonly createdId?: string; readonly derivedResult?: unknown; }
type Body = Record<string, unknown>;
interface NativeFamily { readonly type: string; readonly fields: Readonly<Record<string, string>>; }

// Reviewed PCB native encoder names in 3.2.149.5378b690. These mappings do not
// Imply connected admission. Every absent field remains explicitly unsupported.
const LINE_FIELDS = { net: "netName", layer: "layerId", startX: "startX", startY: "startY", endX: "endX", endY: "endY", lineWidth: "width", primitiveLock: "locked" };
const FAMILIES: Readonly<Record<string, NativeFamily>> = {
  line: { type: "LINE", fields: LINE_FIELDS },
  arc: { type: "ARC", fields: { ...LINE_FIELDS, arcAngle: "angle", interactiveMode: "arcType" } },
  component: { type: "COMPONENT", fields: { x: "x", y: "y", rotation: "angle", layer: "layerId", primitiveLock: "locked" } },
  via: { type: "VIA", fields: { net: "netName", x: "centerX", y: "centerY", holeDiameter: "holeDiameter", diameter: "viaDiameter", viaType: "viaType", designRuleBlindViaName: "ruleName", solderMaskExpansion: "$mask", primitiveLock: "locked" } },
  pad: { type: "PAD", fields: { net: "netName", layer: "layerId", padNumber: "num", x: "centerX", y: "centerY", rotation: "padAngle", pad: "defaultPad", padType: "padType", hole: "hole", holeOffsetX: "padOffsetX", holeOffsetY: "padOffsetY", holeRotation: "relativeAngle", metallization: "plated", solderMaskAndPasteMaskExpansion: "$mask", heatWelding: "$heat", primitiveLock: "locked" } },
  polyline: { type: "POLY", fields: { net: "netName", layer: "layerId", polygon: "path", lineWidth: "width", primitiveLock: "locked" } },
  region: { type: "REGION", fields: { layer: "layerId", regionName: "name", complexPolygon: "path", ruleType: "$region", lineWidth: "width", primitiveLock: "locked" } },
  pour: { type: "POUR", fields: { net: "netName", layer: "layerId", complexPolygon: "path", pourFillMethod: "$pourStyle", gridLineWidth: "$pourStyle", gridSpacing: "$pourStyle", optimizationFineness: "$pourStyle", pourName: "name", pourPriority: "order", preserveSilos: "keepIsland", lineWidth: "width", primitiveLock: "locked" } },
  fill: { type: "FILL", fields: { net: "netName", layer: "layerId", complexPolygon: "path", fillMode: "fillStyle", lineWidth: "width", primitiveLock: "locked" } },
};

export const DESIGN_SOURCE_PROOF_LIMITATIONS = Object.freeze([
  "component creation needs complete library/attribute sources",
  "plane fills and NGON pads require distinct native collection/shape models",
  "NO_VIAS is absent from the pinned native prohibition model and its encoder",
  "group and rule collection replacement needs complete native RULE/RULE_SELECTOR/NET_CLASS/EQL_NET_GRP mapping",
  "new-net records, derived copper and any other unlisted collateral are not ignored",
]);

function unsupported(reason: string): never {
  throw new Error(`DESIGN_SOURCE_UNSUPPORTED: ${reason}`);
}

function equal(left: unknown, right: unknown): boolean {
  return canonicalJson({ value: left }) === canonicalJson({ value: right });
}

function exactNumber(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new TypeError(`Native ${field} is not a finite number.`);
  }
  return value;
}

function checkedSnapshot(snapshot: NativeSourceSnapshot): void {
  if (snapshot.schema !== "easyeda-pro-control.document-source.v1" || snapshot.document["docType"] !== "PCB" ||
      typeof snapshot.document["uuid"] !== "string" || snapshot.document["uuid"].length === 0 ||
      snapshot.sha256 !== sha256Json({ schema: snapshot.schema, document: snapshot.document, objects: snapshot.objects }) ||
      new Set(snapshot.objects.map((object) => object.id)).size !== snapshot.objects.length) {
    throw new Error("Native source snapshot identity, completeness or hash is invalid.");
  }
}

function resolvedTarget(compiled: CompiledDesignOperation, ids: DesignSourceIds): string {
  const target = compiled.effect.target;
  if (target === null) {return unsupported("operation has no primitive target");}
  if ("primitiveId" in target) {
    if (ids.targetId !== undefined && ids.targetId !== target.primitiveId) {throw new Error("Resolved primitive ID contradicts the compiled target.");}
    return target.primitiveId;
  }
  if (typeof ids.targetId !== "string" || ids.targetId.length === 0) {return unsupported("created-ID target has not been resolved by the journal");}
  return ids.targetId;
}

function nativeFamily(compiled: CompiledDesignOperation): NativeFamily {
  if (compiled.profile !== DESIGN_OPERATION_PROFILE || compiled.documentType !== 3 ||
      compiled.action !== `pcb.${compiled.effect.family}.${compiled.call.method}` ||
      !["create", "modify", "delete"].includes(compiled.call.method)) {
    return unsupported("group/rule collection or unreviewed operation profile");
  }
  return FAMILIES[compiled.effect.family] ?? unsupported("native record family is unknown");
}

const MASK_FIELDS = { topSolderMask: "topSolderExpansion", bottomSolderMask: "bottomSolderExpansion", topPasteMask: "topPasteExpansion", bottomPasteMask: "bottomPasteExpansion" };
const REGION_TYPES: Readonly<Record<number, string>> = { 2: "COMPONENT", 3: "VIA", 5: "TRACK", 6: "FILL", 7: "COPPER", 8: "PLANE" };

function maskPatch(value: unknown, family: string): Body {
  if (value !== null && !isRecord(value)) {throw new Error("Invalid mask property.");}
  const patch: Body = {};
  for (const [key, raw] of Object.entries(MASK_FIELDS)) {
    if (family === "via" && key.includes("Paste")) {
      if (value !== null && Object.hasOwn(value, key)) {return unsupported("vias have no paste-mask field");}
    } else if (value === null) {patch[raw] = null;}
    else if (Object.hasOwn(value, key)) {patch[raw] = exactNumber(value[key], key);}
  }
  return patch;
}

function pathValue(value: unknown, complex: boolean): unknown {
  if (!Array.isArray(value)) {throw new TypeError("Malformed polygon value.");}
  const paths = Array.isArray(value[0]) ? value : [value];
  // C cubic segments are declared publicly but tS has no cubic branch. Reject
  // Them instead of feeding its non-advancing loop; ARC/CARC remain supported.
  if (paths.some((path) => !Array.isArray(path) || path.includes("C"))) {return unsupported("native polygon cubic segment mapping");}
  void complex;
  return paths;
}

function padShapeValue(value: unknown): Body {
  if (!Array.isArray(value)) {throw new TypeError("Invalid pad shape tuple.");}
  const shape: readonly unknown[] = value;
  if (shape[0] === "NGON") {return unsupported("NGON needs an explicit polygon outline; native pad decoder has no NGON shape");}
  if (shape[0] === "POLYGON") {
    const paths = pathValue(shape[1], true);
    if (!Array.isArray(paths) || paths.length !== 1) {return unsupported("pad polygons require one native outline");}
    return { padType: "POLYGON", path: paths[0] };
  }
  if (shape[0] === "ELLIPSE" && shape[1] !== shape[2]) {return unsupported("native ELLIPSE pad is circular; width and height must match");}
  if (shape[0] === "RECT" && exactNumber(shape[3], "pad corner percentage") > 100) {return unsupported("native RECT pad corner value is a 0..100 percentage");}
  return { padType: shape[0], width: shape[1], height: shape[2], ...(shape[0] === "RECT" ? { radius: shape[3] } : {}) };
}

function heatPatch(value: unknown): Body {
  if (value === null) {return { connectMode: null, spokeSpace: null, spokeWidth: null, spokeAngle: null };}
  if (!isRecord(value)) {throw new TypeError("Invalid thermal connection.");}
  const modes: Readonly<Record<string, string>> = { Divergent: "DIVERGENCE", "Direct-connected": "DIRECT", "Non-connected": "NON_CONNECT" };
  const mode = modes[String(value["connectionMethod"])];
  if (mode === undefined) {return unsupported("unknown native thermal mode");}
  return { connectMode: mode, spokeSpace: exactNumber(value["divergenceSpacing"], "thermal spacing"), spokeWidth: exactNumber(value["divergenceLineWidth"], "thermal width"), spokeAngle: exactNumber(value["divergenceAngle"], "thermal angle") };
}

function nativePatch(compiled: CompiledDesignOperation, family: NativeFamily): Body {
  const patch: Body = {};
  if (new Set(compiled.effect.fields).size !== compiled.effect.fields.length ||
      !equal(compiled.effect.fields.toSorted(), compiled.expectedFields.map((entry) => entry.field).toSorted())) {
    throw new Error("Compiled field model is incomplete or duplicated.");
  }
  function applyField(field: DesignExpectedField): void {
    const name = family.fields[field.field];
    if (name === undefined || field.comparison !== "equals" || field.selector !== undefined) {
      unsupported(`native mapping for ${compiled.effect.family}.${field.field}`);
    }
    let value: unknown = field.value;
    if (name === "$pourStyle") {patch[field.field] = value; return;}
    if (name === "$mask") {Object.assign(patch, maskPatch(value, compiled.effect.family)); return;}
    if (name === "$heat") {Object.assign(patch, heatPatch(value)); return;}
    if (name === "$region") {
      if (!Array.isArray(value) || !value.every((entry: unknown): entry is number => typeof entry === "number")) {throw new Error("Invalid region restriction list.");}
      const numbers = value;
      if (numbers.includes(3)) {unsupported("NO_VIAS is absent from the native prohibition model and encoder");}
      if (numbers.includes(9) && numbers.length > 1) {unsupported("constraint and prohibition regions are different native model types");}
      patch["regionType"] = numbers.includes(9) ? "CONSTRAINT" : "PROHIBIT";
      patch["prohibitType"] = [5, 2, 7, 6, 8].filter((number) => numbers.includes(number)).map((number) => REGION_TYPES[number]);
      return;
    }
    if (name === "path") {value = pathValue(value, field.field === "complexPolygon");}
    if (field.field === "fillMode") {
      if (value === 2) {unsupported("plane fill is a LAYER_FILL collection, not a standalone FILL");}
      if (value === 1) {unsupported("standalone FILL encoder only stores SOLID; use a grid POUR for hatched copper");}
      value = "SOLID";
    }
    if (field.field === "viaType") {
      value = ["NORMAL", "BLIND", "SUTURE"][exactNumber(value, "via type")];
    }
    if (field.field === "padType") {
      if (value === 2) {unsupported("native pad encoder does not preserve MARKER independently from NORMAL");}
      value = value === 0 ? "NORMAL" : "TEST";
    }
    if (field.field === "pad") {value = padShapeValue(value);}
    if (field.field === "designRuleBlindViaName") {value ??= "";}
    if (field.field === "hole" && value !== null) {
      if (!Array.isArray(value)) {throw new TypeError("Invalid pad hole tuple.");}
      const hole: readonly unknown[] = value;
      value = { holeType: hole[0], width: hole[0] === "ROUND" ? hole[1] : hole[2], height: hole[1] };
    }
    if (field.field === "interactiveMode") {
      if (value !== 1 && value !== 2) {throw new Error("Unsupported arc interaction value.");}
      value = value === 1 ? "DOT" : "CENT";
    }
    if (typeof value === "number" && !Number.isFinite(value)) {throw new TypeError("Non-finite expected native field.");}
    patch[name] = value;
  }
  for (const field of compiled.expectedFields) {applyField(field);}
  return patch;
}

function exactObject(snapshot: NativeSourceSnapshot, id: string, type: string): NativeSourceObject {
  const object = snapshot.objects.find((candidate) => candidate.id === id);
  if (object?.type !== type) {return unsupported(`target ${id} is not a standalone native ${type} record`);}
  if (object.body["parentId"] !== undefined && object.body["parentId"] !== null && object.body["parentId"] !== "") {
    return unsupported("component-owned primitive needs parent/library collateral proof");
  }
  return object;
}

function assertComponentPatch(before: NativeSourceObject, patch: Body): void {
  if (![1, 2].includes(exactNumber(before.body["layerId"], "component layer"))) {return unsupported("component baseline is not top/bottom");}
  const oldAngle = exactNumber(before.body["angle"], "component angle");
  if (patch["layerId"] !== undefined && patch["layerId"] !== before.body["layerId"] && patch["angle"] === undefined) {
    patch["angle"] = nativeCoordinate((180 - oldAngle) % 360);
  }
  for (const key of ["x", "y", "angle"]) {
    exactNumber(before.body[key], key);
    if (Object.hasOwn(patch, key) && nativeCoordinate(exactNumber(patch[key], key)) !== patch[key]) {
      unsupported("component requested coordinate/angle exceeds the reviewed four-decimal native serialization");
    }
  }
}

/** Installed PCB De(value,4), used by the native coordinate encoder. This is a
 * fixed representation rule, not a caller-selected tolerance or fuzzy match.
 */
function nativeCoordinate(value: number): number {
  return Math.round(value * 10_000 + 1e-10) / 10_000;
}

function assertProfile(compiled: CompiledDesignOperation, before: NativeSourceSnapshot, ids: DesignSourceIds): { family: NativeFamily; patch: Body; target?: NativeSourceObject } {
  checkedSnapshot(before);
  const family = nativeFamily(compiled);
  const patch = nativePatch(compiled, family);
  if (family.type === "POUR") {
    const original = compiled.effect.identity === "create" ? undefined : exactObject(before, resolvedTarget(compiled, ids), "POUR");
    const originalStyle = original?.body["pourType"];
    const sourceStyle = isRecord(originalStyle) ? originalStyle : {};
    const hasStyle = ["pourFillMethod", "gridLineWidth", "gridSpacing", "optimizationFineness"].some((key) => Object.hasOwn(patch, key));
    if (hasStyle) {
      let mode = patch["pourFillMethod"];
      if (mode === undefined) {
        if (sourceStyle["pourType"] === "SOLID") {mode = "solid";}
        else if (sourceStyle["pourType"] === "GRID_LINE") {mode = sourceStyle["angle"] === 45 ? "45grid" : "90grid";}
      }
      if (mode === "solid") {
        if (Object.hasOwn(patch, "gridLineWidth") || Object.hasOwn(patch, "gridSpacing")) {unsupported("solid pour has no grid width/spacing");}
        patch["pourType"] = { pourType: "SOLID", fineness: patch["optimizationFineness"] ?? (sourceStyle["pourType"] === "SOLID" ? sourceStyle["fineness"] : 0) };
      } else if (mode === "45grid" || mode === "90grid") {
        if (Object.hasOwn(patch, "optimizationFineness")) {unsupported("grid pour has no solid optimization fineness");}
        const strokeSpacing = patch["gridSpacing"] ?? sourceStyle["strokeSpacing"], strokeWidth = patch["gridLineWidth"] ?? sourceStyle["strokeWidth"];
        if (exactNumber(strokeWidth, "grid line width") <= 0 || exactNumber(strokeSpacing, "grid spacing") <= 0) {unsupported("grid pour requires explicit positive line width and spacing");}
        patch["pourType"] = { pourType: "GRID_LINE", angle: mode === "45grid" ? 45 : 0, strokeWidth, strokeSpacing };
      } else {unsupported("unknown pour style");}
      delete patch["pourFillMethod"]; delete patch["gridLineWidth"]; delete patch["gridSpacing"]; delete patch["optimizationFineness"];
    }
    const merged = { ...original?.body, ...patch };
    if (typeof merged["name"] !== "string" || merged["name"].length === 0 || before.objects.some((object) => object.type === "POUR" && object.id !== original?.id && object.body["name"] === merged["name"])) {unsupported("pour name must be nonempty and unique");}
    if (before.objects.some((object) => object.type === "POUR" && object.id !== original?.id && object.body["layerId"] === merged["layerId"] && object.body["order"] === merged["order"])) {unsupported("pour priority would implicitly renumber another pour");}
  }
  if (family.type === "REGION") {
    const regionType = patch["regionType"] ?? before.objects.find((candidate) => candidate.id === ids.targetId || (compiled.effect.target !== null && "primitiveId" in compiled.effect.target && candidate.id === compiled.effect.target.primitiveId))?.body["regionType"];
    if (regionType === "PROHIBIT" && Object.hasOwn(patch, "name")) {
      if (patch["name"] !== "") {return unsupported("prohibition regions do not store a name");}
      delete patch["name"];
    }
  }
  if (compiled.effect.identity === "create") {
    if (!["line", "arc", "region", "fill", "polyline", "via", "pad", "pour"].includes(compiled.effect.family)) {return unsupported("creation defaults and child records for this family are unreviewed");}
    const optional = new Set(["gridLineWidth", "gridSpacing", "optimizationFineness"]);
    if (!equal(Object.keys(family.fields).filter((field) => !optional.has(field)).toSorted(), compiled.effect.fields.filter((field) => !optional.has(field)).toSorted())) {throw new Error("Primitive create omits a required field.");}
    if (family.type === "POLY") {patch["polyType"] = patch["layerId"] === 11 ? "BOARD_OUTLINE" : "NORMAL";}
    assertPrimitiveRepresentation(family.type, patch);
    return { family, patch };
  }
  const target = exactObject(before, resolvedTarget(compiled, ids), family.type);
  if (compiled.effect.family === "component") {
    if (compiled.effect.identity !== "preserve") {return unsupported("component deletion requires complete library/pad-net child removal proof");}
    assertComponentPatch(target, patch);
    expectedComponentChildren(before, target, patch);
  }
  if (target.body["locked"] !== false && !(Object.keys(patch).length === 1 && patch["locked"] === false)) {
    return unsupported("locked target requires a separate exact unlock operation");
  }
  for (const name of Object.keys(patch)) {
    if (!Object.hasOwn(target.body, name)) {return unsupported(`native baseline has no ${name} field`);}
  }
  if (family.type === "POLY" && patch["layerId"] !== undefined) {patch["polyType"] = patch["layerId"] === 11 ? "BOARD_OUTLINE" : "NORMAL";}
  assertPrimitiveRepresentation(family.type, { ...target.body, ...patch });
  return { family, patch, target };
}

function assertPrimitiveRepresentation(type: string, body: Body): void {
  if (type === "VIA" && body["viaType"] === "BLIND" && (typeof body["ruleName"] !== "string" || body["ruleName"].length === 0)) {return unsupported("blind via requires an explicit existing blind-layer rule");}
  if (type === "PAD" || type === "VIA") {
    const fields = type === "PAD" ? Object.values(MASK_FIELDS) : ["topSolderExpansion", "bottomSolderExpansion"];
    const masks = fields.map((field) => body[field]);
    if (!masks.every((value) => value === null) && !masks.every((value) => typeof value === "number" && Number.isFinite(value))) {return unsupported("native mask mode is shared: use all explicit numeric expansions or all rule defaults");}
  }
  if (type === "PAD") {
    if (body["topPasteExpansion"] !== body["bottomPasteExpansion"]) {return unsupported("native pad has one shared top/bottom paste expansion");}
    if (body["layerId"] !== 12 && body["hole"] !== null) {return unsupported("surface pad cannot retain a drill hole");}
    if (typeof body["num"] !== "string" || body["num"].replaceAll("-", "").toUpperCase() !== body["num"]) {return unsupported("pad number must already be in native uppercase/hyphen-free form");}
  }
}

/** Call before dispatch so an unsupported proof profile never becomes an
 * after-the-fact refusal. Result references need the journal-resolved target.
 */
export function assertDesignSourceProfileSupported(operation: unknown, before: NativeSourceSnapshot, ids: DesignSourceIds = {}): void {
  const compiled = compileDesignOperation(operation);
  if (compiled.action === "pcb.pour.rebuild") {assertCopperRebuildProfile(operation, before, ids);}
  else if (compiled.action === "pcb.pour.clear-derived") {assertCopperClearProfile(operation, before, ids);}
  else if (compiled.effect.identity === "collection") {buildGroupSource(compiled, before);}
  else {assertProfile(compiled, before, ids);}
}

function sourceSnapshot(before: NativeSourceSnapshot, objects: NativeSourceObject[]): NativeSourceSnapshot {
  objects.sort((left, right) => left.id.localeCompare(right.id));
  const base = { schema: before.schema, document: before.document, objects };
  return { ...base, sha256: sha256Json(base) };
}

function nativeNetName(object: NativeSourceObject): string {
  const key: unknown = JSON.parse(object.id);
  if (!Array.isArray(key) || key.length !== 2 || key[0] !== "NET" || typeof key[1] !== "string") {throw new Error("Invalid native net identity.");}
  return key[1];
}

function nativeGroupColor(color: unknown): string | null {
  if (!isRecord(color) || color["alpha"] !== 1) {return unsupported("native NET color serialization does not retain alpha");}
  const channels = [color["r"], color["g"], color["b"]].map((channel) => {
    const number = exactNumber(channel, "color channel");
    if (!Number.isInteger(number) || number < 0 || number > 255) {return unsupported("native group color needs integer channels");}
    return number.toString(16).padStart(2, "0");
  });
  return channels.every((channel) => channel === "00") ? null : `#${channels.join("")}`;
}

/** Native NET membership fields plus RULE_SELECTOR identity carry these
 * groups; no fabricated NET_CLASS record is introduced. Group-local physical
 * rules and every pre-existing per-net override are retained exactly.
 */
function buildGroupSource(compiled: CompiledDesignOperation, before: NativeSourceSnapshot): NativeSourceSnapshot {
  checkedSnapshot(before);
  const family = compiled.effect.family;
  if (compiled.action === "pcb.rules.net.replace") {return buildNetRuleSource(compiled, before);}
  if (compiled.action === "pcb.rules.net-to-net.replace") {return expectedBetweenRules(compiled, before);}
  if (compiled.action === "pcb.rules.region.replace") {return expectedRegionRules(compiled, before);}
  if (compiled.action === "pcb.rules.configuration.replace") {return expectedRuleConfiguration(compiled, before);}
  if (compiled.profile !== DESIGN_OPERATION_PROFILE || !["netclass", "equal-length", "differential-pair"].includes(family)) {return unsupported("group/rule collection native mapping");}
  const verb = compiled.action.split(".")[2];
  const values = compiled.call.args.map((argument) => {
    if (argument.kind !== "literal") {return unsupported("group arguments must be compiled literals");}
    return argument.value;
  });
  const name = values[0];
  if (typeof name !== "string" || name.trim() !== name || name.length === 0) {throw new Error("Invalid exact group name.");}
  const profile = ({ netclass: ["NET_CLASS", "netType"], "equal-length": ["EQ_LEN_GRP", "equalLengthGroupName"], "differential-pair": ["DIFF_PAIR", "differentialName"] } as const)[family];
  if (profile === undefined) {return unsupported("unknown native group profile");}
  const [selectorType, membership] = profile;
  const groupId = JSON.stringify(["RULE_SELECTOR", [selectorType, name]]);
  const records = new Map(before.objects.map((object) => [object.id, object]));
  const group = records.get(groupId);
  if (verb === "create" ? group !== undefined : group?.type !== "RULE_SELECTOR") {throw new Error("Group identity precondition failed.");}
  const members = before.objects.filter((object) => object.type === "NET" && object.body[membership] === name);
  const selectorReferences = before.objects.filter((object) => object.type === "RULE_SELECTOR" && object.id !== groupId && object.id.includes(JSON.stringify([selectorType, name])));
  if (verb === "delete" && selectorReferences.length > 0) {return unsupported("delete group with net-to-net rule references requires an explicit rule reassignment");}
  const setMember = (net: unknown, nextName: string | null, positive?: boolean): void => {
    if (typeof net !== "string" || net.length === 0 || net.toUpperCase() !== net) {throw new Error("Group membership needs an exact uppercase native net name.");}
    const id = JSON.stringify(["NET", net]);
    const object = records.get(id);
    if (object?.type !== "NET" || !Object.hasOwn(object.body, membership)) {throw new Error("Group member is absent from native NET records.");}
    const old = object.body[membership];
    if (nextName !== null && old !== null && old !== name && old !== nextName) {throw new Error("A net belongs to another group; explicit removal is required.");}
    records.set(id, { ...object, body: { ...object.body, [membership]: nextName, ...(positive === undefined ? {} : { isPositiveNet: positive }) } });
  };
  if (verb === "create") {
    records.set(groupId, { id: groupId, type: "RULE_SELECTOR", body: { ruleOrder: 4, ruleKeyValue: {}, copperValue: {}, innerPlaneValue: {} } });
    if (family === "differential-pair") {setMember(values[1], name, true); setMember(values[2], name, false);}
    else {
      const nets = values[1];
      if (!Array.isArray(nets)) {throw new TypeError("Missing group nets.");}
      for (const net of nets) {setMember(net, name);}
      const color = values[2];
      if (color !== null) {
        const specialColor = nativeGroupColor(color);
        for (const net of nets) {
          const id = JSON.stringify(["NET", net]), object = records.get(id);
          assertColorTarget(object);
          records.set(id, { ...object, body: { ...object.body, specialColor } });
        }
      }
    }
  } else if (verb === "delete") {
    records.delete(groupId);
    for (const member of members) {setMember(nativeNetName(member), null, family === "differential-pair" ? false : undefined);}
  } else if (verb === "rename") {
    const newName = values[1];
    if (typeof newName !== "string" || group === undefined) {throw new Error("Missing rename target.");}
    const newId = JSON.stringify(["RULE_SELECTOR", [selectorType, newName]]);
    if (records.has(newId)) {throw new Error("New group identity already exists.");}
    records.delete(groupId); records.set(newId, { ...group, id: newId });
    for (const member of members) {setMember(nativeNetName(member), newName);}
    for (const reference of selectorReferences) {
      const id = reference.id.replaceAll(JSON.stringify([selectorType, name]), JSON.stringify([selectorType, newName]));
      if (records.has(id)) {throw new Error("Renamed associated rule identity collides.");}
      records.delete(reference.id); records.set(id, { ...reference, id });
    }
  } else if (verb === "add-nets" || verb === "remove-nets") {
    const nets = values[1];
    if (!Array.isArray(nets)) {throw new TypeError("Missing membership changes.");}
    for (const net of nets) {
      if (verb === "remove-nets" && !members.some((member) => nativeNetName(member) === net)) {throw new Error("Cannot remove a net outside the target group.");}
      setMember(net, verb === "add-nets" ? name : null);
    }
  } else if (verb === "set-positive" || verb === "set-negative") {
    const positive = verb === "set-positive";
    const previous = members.filter((member) => member.body["isPositiveNet"] === positive);
    const other = members.filter((member) => member.body["isPositiveNet"] !== positive);
    const otherMember = other[0];
    if (previous.length !== 1 || other.length !== 1 || otherMember === undefined || nativeNetName(otherMember) === values[1]) {throw new Error("Differential pair endpoint invariant failed.");}
    for (const member of previous) {setMember(nativeNetName(member), null, false);}
    setMember(values[1], name, positive);
  } else {return unsupported("unreviewed group operation");}
  return sourceSnapshot(before, [...records.values()]);
}

const NET_RULE_FIELDS: Readonly<Record<string, string>> = {
  "Safe Spacing": "SAFE", Track: "TRACK", "Differential Pair": "DIFFER_ENTAIL", "Blind/Buried Via": "BLIND", "Via Size": "RADIUS", "Plane Zone": "PLANE", "Copper Zone": "COPPER", "Solder Mask Expansion": "SOLDER", "Paste Mask Expansion": "PASTE", "Net Length Range": "NET_LENGTH", "Net Length Tolerance": "NET_LENGTH_TOLERANCE", "Creepage Distance": "CREEPAGE",
};

function ruleReference(value: unknown, field: string): string | null {
  if (value === null || value === undefined || value === "") {return null;}
  if (typeof value !== "string") {return unsupported(`native rule reference ${field} must be a rule name or null`);}
  return value;
}

function netRuleBody(row: Body): Body {
  const allowed = new Set(["type", "name", "sub", "targetNet", "Copper Safe Spacing", "Plane Safe Spacing", ...Object.keys(NET_RULE_FIELDS)]);
  if (Object.keys(row).some((key) => !allowed.has(key))) {return unsupported("unreviewed net-rule collection field");}
  const ruleKeyValue: Body = {};
  for (const [key, raw] of Object.entries(NET_RULE_FIELDS)) {
    const reference = ruleReference(row[key], key);
    if (raw === "NET_LENGTH_TOLERANCE") {
      if (reference !== null) {ruleKeyValue[raw] = [reference, ruleReference(row["targetNet"], "targetNet")];}
    } else if (reference !== null && reference !== "default") {ruleKeyValue[raw] = reference;}
  }
  const copper = ruleReference(row["Copper Safe Spacing"], "Copper Safe Spacing");
  const plane = ruleReference(row["Plane Safe Spacing"], "Plane Safe Spacing");
  return { ruleOrder: 4, ruleKeyValue, copperValue: copper === null || copper === "default" ? {} : { COPPER: copper }, innerPlaneValue: plane === null || plane === "default" ? {} : { PLANE: plane } };
}

function buildNetRuleSource(compiled: CompiledDesignOperation, before: NativeSourceSnapshot): NativeSourceSnapshot {
  const argument = compiled.call.args[0];
  if (argument?.kind !== "literal" || !Array.isArray(argument.value)) {return unsupported("complete net rule rows are required");}
  const records = new Map(before.objects.map((object) => [object.id, object]));
  const wantedSelectors = new Set<string>();
  const netRules = new Map<string, Body>();
  const classNames = new Map<string, string>();
  const lengthNames = new Map<string, string>();
  const setSelector = (type: string, name: string, body: Body): void => {
    const id = JSON.stringify(["RULE_SELECTOR", [type, name]]);
    if (wantedSelectors.has(id) && !equal(records.get(id)?.body, body)) {throw new Error("Contradictory duplicate rule selector.");}
    const previous = records.get(id);
    records.set(id, { id, type: "RULE_SELECTOR", body: { ...previous?.body, ...body } });
    wantedSelectors.add(id);
  };
  const visitNet = (value: unknown, membership?: { type: "netClass" | "equalLengthGroup"; name: string }): void => {
    if (!isRecord(value) || value["type"] !== "net" || typeof value["name"] !== "string") {throw new Error("Invalid complete net-rule row.");}
    const name = value["name"];
    const net = records.get(JSON.stringify(["NET", name]));
    if (name.length === 0 || name.toUpperCase() !== name || net?.type !== "NET") {throw new Error("Rule row names an absent or noncanonical net.");}
    const body = netRuleBody(value), previous = netRules.get(name);
    if (previous !== undefined && !equal(previous, body)) {throw new Error("A net has contradictory rule overrides across groups.");}
    netRules.set(name, body);
    setSelector("NET", name, body);
    if (membership !== undefined) {
      const map = membership.type === "netClass" ? classNames : lengthNames;
      if (map.has(name)) {throw new Error("A net belongs to two groups of the same kind.");}
      map.set(name, membership.name);
    }
  };
  for (const value of argument.value) {
    if (!isRecord(value) || typeof value["name"] !== "string") {throw new Error("Malformed rule collection row.");}
    const name = value["name"], type = value["type"];
    if (type === "net") {visitNet(value);}
    else if (type === "netClass" || type === "equalLengthGroup") {
      if (!Array.isArray(value["sub"])) {throw new TypeError("Group rule row lacks complete child nets.");}
      setSelector(type === "netClass" ? "NET_CLASS" : "EQ_LEN_GRP", name, netRuleBody(value));
      for (const net of value["sub"]) {visitNet(net, { type, name });}
    } else {return unsupported("unknown net-rule collection row type");}
  }
  for (const object of before.objects) {
    if (object.type === "NET") {
      const name = nativeNetName(object);
      if (name !== "") {
        if (!netRules.has(name)) {throw new Error("Net rule replacement omits an existing net.");}
        records.set(object.id, { ...object, body: { ...object.body, netType: classNames.get(name) ?? null, equalLengthGroupName: lengthNames.get(name) ?? null } });
      }
    } else if (object.type === "RULE_SELECTOR") {
      const key: unknown = JSON.parse(object.id);
      if (Array.isArray(key) && Array.isArray(key[1]) && ["NET_CLASS", "EQ_LEN_GRP"].includes(String(key[1][0])) && !wantedSelectors.has(object.id)) {
        const encoded = JSON.stringify(key[1]);
        if (before.objects.some((reference) => reference.type === "RULE_SELECTOR" && reference.id !== object.id && reference.id.includes(encoded))) {return unsupported("removed group remains referenced by a between-net rule");}
        records.delete(object.id);
      }
    }
  }
  return sourceSnapshot(before, [...records.values()]);
}

function assertColorTarget(object: NativeSourceObject | undefined): asserts object is NativeSourceObject {
  if (object === undefined) {throw new Error("Color target absent.");}
}

function expectedComponentChildren(before: NativeSourceSnapshot, target: NativeSourceObject, patch: Body): Map<string, NativeSourceObject> {
  const oldX = exactNumber(target.body["x"], "component x");
  const oldY = exactNumber(target.body["y"], "component y");
  const dx = exactNumber(patch["x"] ?? oldX, "component x") - oldX;
  const dy = exactNumber(patch["y"] ?? oldY, "component y") - oldY;
  const oldAngle = exactNumber(target.body["angle"], "component angle");
  const flipped = patch["layerId"] !== undefined && patch["layerId"] !== target.body["layerId"];
  const intermediateAngle = flipped ? (180 - oldAngle) % 360 : oldAngle;
  const deltaAngle = exactNumber(patch["angle"] ?? intermediateAngle, "component angle") - intermediateAngle;
  const radians = deltaAngle * Math.PI / 180;
  const cosine = Math.cos(radians), sine = Math.sin(radians);
  const expected = new Map<string, NativeSourceObject>();
  for (const child of before.objects.filter((candidate) => candidate.body["parentId"] === target.id)) {
    if (child.type !== "ATTR") {return unsupported("non-ATTR stored component child transform");}
    const body = { ...child.body };
    if (flipped || deltaAngle !== 0) {
      const layer = exactNumber(body["layerId"], "attribute layer");
      if (typeof body["mirror"] !== "boolean") {return unsupported("attribute mirror must be explicit for rotation/flip");}
      const oldChildAngle = exactNumber(body["angle"], "attribute angle");
      let newLayer = layer;
      if (flipped) {
        newLayer = oppositeLayer(layer);
        if (newLayer === layer) {return unsupported("unchanged-layer text flip needs native font-width geometry");}
        body["layerId"] = newLayer;
      }
      const mirrored = [2, 4, 6, 8, 10, 59].includes(newLayer) !== body["mirror"];
      body["angle"] = nativeCoordinate(oldChildAngle + (mirrored ? -deltaAngle : deltaAngle));
    }
    if (body["x"] !== null || body["y"] !== null) {
      const relativeX = (exactNumber(body["x"], "attribute x") - oldX) * (flipped ? -1 : 1);
      const relativeY = exactNumber(body["y"], "attribute y") - oldY;
      body["x"] = nativeCoordinate(oldX + dx + relativeX * cosine - relativeY * sine);
      body["y"] = nativeCoordinate(oldY + dy + relativeX * sine + relativeY * cosine);
    }
    expected.set(child.id, { ...child, body });
  }
  return expected;
}

function oppositeLayer(layer: number): number {
  if (layer >= 1 && layer <= 10) {return layer % 2 === 0 ? layer - 1 : layer + 1;}
  if (layer === 58) {return 59;}
  return layer === 59 ? 58 : layer;
}

function creationDefaults(type: string): Body {
  if (type === "VIA") {return { unusedInnerLayers: [] };}
  if (type === "FILL") {return { isBridgingCopper: false, networkList: [], refs: null };}
  if (type === "PAD") {return { specialPad: [], padLen: 0 };}
  return {};
}

function assertCreatedBody(object: NativeSourceObject, patch: Body): void {
  const defaults = creationDefaults(object.type);
  const extras = new Set(["partitionId", "groupId", "zIndex", "specialColor", ...Object.keys(defaults)]);
  for (const name of Object.keys(object.body)) {
    if (!Object.hasOwn(patch, name) && !extras.has(name)) {return unsupported(`unreviewed created primitive field ${name}`);}
  }
  for (const [key, value] of Object.entries(defaults)) {
    if (Object.hasOwn(object.body, key) && !equal(object.body[key], value)) {return unsupported(`created ${object.type} default ${key}`);}
  }
  for (const [name, expected] of Object.entries(patch)) {
    if (!Object.hasOwn(object.body, name) || !equal(object.body[name], expected)) {throw new Error(`Native created primitive ${name} does not match the requested value.`);}
  }
  if ((Object.hasOwn(object.body, "partitionId") && object.body["partitionId"] !== "") ||
      (Object.hasOwn(object.body, "groupId") && object.body["groupId"] !== 0 && object.body["groupId"] !== "" && object.body["groupId"] !== null) ||
      (Object.hasOwn(object.body, "specialColor") && object.body["specialColor"] !== null)) {
    return unsupported("created primitive has an unexpected partition, group or color");
  }
  if (Object.hasOwn(object.body, "zIndex") && object.body["zIndex"] !== null &&
      (typeof object.body["zIndex"] !== "number" || !Number.isSafeInteger(object.body["zIndex"]) || object.body["zIndex"] < -1)) {
    return unsupported("created primitive has invalid native draw-order metadata");
  }
}

/** Deterministic desired records from a typed operation and its complete
 * journal baseline. No native source or arbitrary field patch is accepted.
 */
export function buildExpectedDesignSource(operation: unknown, before: NativeSourceSnapshot, ids: DesignSourceIds = {}): NativeSourceSnapshot {
  const compiled = compileDesignOperation(operation);
  if (compiled.action === "pcb.pour.rebuild") {return expectedCopperRebuildSource(operation, before, ids);}
  if (compiled.action === "pcb.pour.clear-derived") {return expectedCopperClearSource(operation, before, ids);}
  if (compiled.effect.identity === "collection") {return buildGroupSource(compiled, before);}
  const { family, patch, target } = assertProfile(compiled, before, ids);
  let objects: NativeSourceObject[];
  if (compiled.effect.identity === "create") {
    const id = ids.createdId;
    if (id === undefined || !/^[a-f0-9]{16}$/u.test(id) || before.objects.some((object) => object.id === id)) {throw new Error("Source create needs one fresh facade-generated native ID.");}
    const defaults = creationDefaults(family.type);
    objects = [...before.objects, { id, type: family.type, body: { partitionId: "", groupId: 0, ...(family.type === "VIA" ? {} : { zIndex: -1 }), ...defaults, ...patch } }];
  } else {
    if (target === undefined) {throw new Error("Expected source target absent.");}
    if (compiled.effect.identity === "delete") {objects = before.objects.filter((object) => object.id !== target.id);}
    else {
      const children = family.type === "COMPONENT" ? expectedComponentChildren(before, target, patch) : new Map<string, NativeSourceObject>();
      children.set(target.id, { ...target, body: { ...target.body, ...patch } });
      objects = before.objects.map((object) => children.get(object.id) ?? object);
    }
  }
  objects.sort((left, right) => left.id.localeCompare(right.id));
  const base = { schema: before.schema, document: before.document, objects };
  return { ...base, sha256: sha256Json(base) };
}

export function verifyDesignSourceEffect(compiled: CompiledDesignOperation, before: NativeSourceSnapshot, after: NativeSourceSnapshot, ids: DesignSourceIds = {}): NativeSourceDelta {
  if (compiled.action === "pcb.pour.clear-derived") {
    const expected = expectedCopperClearSource({ id: compiled.id, action: compiled.action, target: compiled.effect.target }, before, ids);
    checkedSnapshot(after);
    if (!equal(expected, after)) {throw new Error("Copper clear changed records beyond the selected parent's derived geometry.");}
    return compareDocumentSources(before, after);
  }
  if (compiled.action === "pcb.pour.rebuild") {
    const expected = expectedCopperRebuildSource({ id: compiled.id, action: compiled.action, target: compiled.effect.target }, before, ids);
    checkedSnapshot(after);
    if (!equal(expected, after)) {throw new Error("Derived copper differs from its completed worker geometry or changed unrelated source/net/rule records.");}
    return compareDocumentSources(before, after);
  }
  if (compiled.effect.identity === "collection") {
    const expected = buildGroupSource(compiled, before);
    checkedSnapshot(after);
    if (!equal(expected, after)) {throw new Error("Native group source differs from its exact typed effect.");}
    return compareDocumentSources(before, after);
  }
  const { family, patch, target } = assertProfile(compiled, before, ids);
  checkedSnapshot(after);
  const delta = compareDocumentSources(before, after);
  if (delta.documentChanged) {throw new Error("Native document metadata changed outside the operation.");}
  if (compiled.effect.identity === "create") {
    if (typeof ids.createdId !== "string" || ids.createdId.length === 0 ||
        delta.added.length !== 1 || delta.added[0]?.id !== ids.createdId || delta.added[0].type !== family.type ||
        delta.removed.length > 0 || delta.changed.length > 0) {
      throw new Error("Native create changed records outside its one returned primitive identity.");
    }
    assertCreatedBody(delta.added[0], patch);
    return delta;
  }
  if (target === undefined) {throw new Error("Native operation target was not established.");}
  if (compiled.effect.identity === "delete") {
    if (delta.removed.length !== 1 || delta.removed[0]?.id !== target.id || delta.added.length > 0 || delta.changed.length > 0) {
      throw new Error("Native delete did not remove only the exact target record.");
    }
    return delta;
  }
  if (compiled.effect.identity !== "preserve" || delta.added.length > 0 || delta.removed.length > 0) {
    throw new Error("Native modification added or removed identities.");
  }
  const expected = compiled.effect.family === "component" ? expectedComponentChildren(before, target, patch) : new Map<string, NativeSourceObject>();
  const baseline = new Map(before.objects.map((object) => [object.id, object]));
  expected.set(target.id, { ...target, body: { ...target.body, ...patch } });
  for (const object of after.objects) {
    const wanted = expected.get(object.id) ?? baseline.get(object.id);
    if (!equal(object, wanted)) {throw new Error(`Native source collateral or expected-field mismatch at ${object.type}:${object.id}.`);}
  }
  return delta;
}

/** Deletion never pretends a new UUID restores the original identity. */
export function buildInverseDesignOperation(operation: unknown, before: NativeSourceSnapshot, ids: DesignSourceIds = {}): DesignOperation | undefined {
  const parsed = designOperationSchema.parse(operation);
  const compiled = compileDesignOperation(parsed);
  if (compiled.action === "pcb.pour.rebuild") {assertCopperRebuildProfile(parsed, before, ids); return undefined;}
  if (compiled.action === "pcb.pour.clear-derived") {assertCopperClearProfile(parsed, before, ids); return undefined;}
  if (compiled.effect.identity === "collection") {buildGroupSource(compiled, before); return undefined;}
  const { family, target } = assertProfile(compiled, before, ids);
  const inverseId = `inverse-${sha256Json(parsed).slice(0, 32)}`;
  if (compiled.effect.identity === "delete") {return undefined;}
  if (compiled.effect.identity === "create") {
    if (typeof ids.createdId !== "string" || ids.createdId.length === 0) {return unsupported("inverse needs the journaled created primitive ID");}
    return designOperationSchema.parse({ id: inverseId, action: `pcb.${compiled.effect.family}.delete`, target: { primitiveId: ids.createdId } });
  }
  if (target === undefined) {return unsupported("inverse has no native baseline target");}
  const patch: Body = {};
  const targetBody = target.body;
  function inverseField(field: string): void {
    const raw = family.fields[field];
    if (raw === "$pourStyle") {
      const style = targetBody["pourType"];
      if (!isRecord(style)) {unsupported("inverse pour style is incomplete");}
      if (style["pourType"] === "SOLID") {
        patch["pourFillMethod"] = "solid";
        patch["optimizationFineness"] = style["fineness"];
      } else if (style["pourType"] === "GRID_LINE" && [0, 45].includes(Number(style["angle"]))) {
        patch["pourFillMethod"] = style["angle"] === 45 ? "45grid" : "90grid";
        patch["gridLineWidth"] = style["strokeWidth"];
        patch["gridSpacing"] = style["strokeSpacing"];
      } else {unsupported("inverse native pour style");}
      return;
    }
    if (raw === "$region") {
      const values = targetBody["prohibitType"];
      if (!Array.isArray(values)) {unsupported("inverse region restrictions");}
      patch[field] = targetBody["regionType"] === "CONSTRAINT" ? [9] : values.map((value) => {
        const entry = Object.entries(REGION_TYPES).find(([, name]) => name === value);
        if (entry === undefined) {return unsupported("unknown inverse native restriction");}
        return Number(entry[0]);
      });
      return;
    }
    if (raw === "$mask") {
      const masks: Body = {};
      const selected = Object.entries(MASK_FIELDS).filter(([key]) => family.type !== "VIA" || !key.includes("Paste"));
      if (selected.every(([, key]) => targetBody[key] === null)) {patch[field] = null; return;}
      for (const [key, name] of selected) {
        if (typeof targetBody[name] !== "number") {unsupported("mixed rule/default mask inverse needs field-level mask schema");}
        masks[key] = targetBody[name];
      }
      patch[field] = masks;
      return;
    }
    if (raw === "$heat") {
      if (targetBody["connectMode"] === null) {patch[field] = null; return;}
      const modes: Readonly<Record<string, string>> = { DIVERGENCE: "Divergent", DIRECT: "Direct-connected", NON_CONNECT: "Non-connected" };
      const rawMode = targetBody["connectMode"];
      if (typeof rawMode !== "string") {unsupported("inverse thermal mode shape");}
      const mode = modes[rawMode];
      if (mode === undefined) {unsupported("inverse thermal mode");}
      patch[field] = { connectionMethod: mode, divergenceSpacing: targetBody["spokeSpace"], divergenceLineWidth: targetBody["spokeWidth"], divergenceAngle: targetBody["spokeAngle"] };
      return;
    }
    if (raw === undefined || !Object.hasOwn(targetBody, raw)) {
      if (field === "regionName" && targetBody["regionType"] === "PROHIBIT") {patch[field] = ""; return;}
      unsupported(`inverse mapping for ${field}`);
    }
    let value = targetBody[raw];
    if (field === "interactiveMode") {
      if (value !== "DOT" && value !== "CENT") {unsupported("inverse arc mode");}
      value = value === "DOT" ? 1 : 2;
    }
    if (field === "fillMode") {
      if (value !== "SOLID" && value !== "GRID") {unsupported("inverse standalone fill mode");}
      value = value === "SOLID" ? 0 : 1;
    }
    if (field === "viaType") {
      const index = ["NORMAL", "BLIND", "SUTURE"].indexOf(String(value));
      if (index === -1) {unsupported("inverse via type");}
      value = index;
    }
    if (field === "designRuleBlindViaName" && value === "") {value = null;}
    if (field === "polygon") {
      if (!Array.isArray(value) || value.length !== 1) {unsupported("inverse simple polygon has multiple paths");}
      value = value[0];
    }
    if (field === "hole" && value !== null) {
      if (!isRecord(value)) {unsupported("inverse pad hole record");}
      value = value["holeType"] === "ROUND" ? ["ROUND", value["height"]] : ["SLOT", value["height"], value["width"]];
    }
    if (field === "pad") {
      if (!isRecord(value)) {unsupported("inverse pad shape");}
      value = value["padType"] === "POLYGON" ? ["POLYGON", value["path"]] : [value["padType"], value["width"], value["height"], ...(value["padType"] === "RECT" ? [value["radius"]] : [])];
    }
    patch[field] = value;
  }
  for (const field of compiled.effect.fields) {inverseField(field);}
  if (family.type === "COMPONENT" && Object.hasOwn(patch, "layer") && !Object.hasOwn(patch, "rotation")) {patch["rotation"] = target.body["angle"];}
  return designOperationSchema.parse({ id: inverseId, action: parsed.action, target: { primitiveId: target.id }, patch });
}
