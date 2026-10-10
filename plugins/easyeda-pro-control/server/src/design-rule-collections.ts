import { canonicalJson, isRecord, sha256Json } from "./core.ts";
import type { CompiledDesignOperation } from "./design-operations.ts";
import type { NativeSourceObject, NativeSourceSnapshot } from "./document-source.ts";

type Body = Record<string, unknown>;

function reference(before: NativeSourceSnapshot, value: unknown, family: string): string | null {
  if (value === undefined || value === null || value === "") {return null;}
  if (typeof value !== "string" || !before.objects.some((object) => object.type === "RULE" && object.id === JSON.stringify(["RULE", family, value]))) {throw new Error(`Unknown native ${family} rule reference.`);}
  return value;
}
function selector(object: NativeSourceObject): unknown {
  if (object.type !== "RULE_SELECTOR") {return undefined;}
  const id: unknown = JSON.parse(object.id);
  if (!Array.isArray(id) || id[0] !== "RULE_SELECTOR" || id.length !== 2) {throw new Error("Malformed native rule selector.");}
  return id[1];
}
function snapshot(before: NativeSourceSnapshot, objects: NativeSourceObject[]): NativeSourceSnapshot {
  objects.sort((left, right) => left.id.localeCompare(right.id));
  const base = { schema: before.schema, document: before.document, objects };
  return { ...base, sha256: sha256Json(base) };
}

/** Installed c1.getBetweenNetList and LR/gSe/ySe/bSe native encoders. */
export function expectedBetweenRules(compiled: CompiledDesignOperation, before: NativeSourceSnapshot): NativeSourceSnapshot {
  const argument = compiled.call.args[0];
  if (argument?.kind !== "literal" || !isRecord(argument.value) || !Array.isArray(argument.value["Safe Spacing"]) || !Array.isArray(argument.value["Creepage Distance"]) || Object.keys(argument.value).length !== 2) {throw new Error("Complete Safe Spacing and Creepage Distance pair collections are required.");}
  const orientations = new Map<string, string>(), rows = new Map<string, Body>();
  const endpoint = (value: unknown): string[] => {
    if (!isRecord(value) || Object.keys(value).length !== 2 || typeof value["name"] !== "string") {throw new Error("Invalid between-net endpoint.");}
    const type = new Map([["net", "NET"], ["netClass", "NET_CLASS"], ["equalLengthGroup", "EQ_LEN_GRP"]]).get(String(value["type"]));
    if (type === undefined) {throw new Error("Unknown endpoint kind.");}
    const name = value["name"];
    const id = type === "NET" ? JSON.stringify(["NET", name]) : JSON.stringify(["RULE_SELECTOR", [type, name]]);
    if (!before.objects.some((object) => object.id === id)) {throw new Error("Between-net endpoint does not exist.");}
    return [type, name];
  };
  for (const category of ["Safe Spacing", "Creepage Distance"]) {
    const values = argument.value[category];
    if (!Array.isArray(values)) {throw new TypeError("Invalid pair collection.");}
    const seen = new Set<string>();
    for (const value of values) {
      if (!isRecord(value) || Object.keys(value).some((key) => !["net1", "net2", "rule", ...(category === "Safe Spacing" ? ["copperRuleName", "planeRuleName"] : [])].includes(key))) {throw new Error("Unreviewed pair rule field.");}
      const first = endpoint(value["net1"]), second = endpoint(value["net2"]);
      if (canonicalJson(first) === canonicalJson(second)) {throw new Error("Between-net endpoints must be distinct.");}
      const id = JSON.stringify(["RULE_SELECTOR", [first, second]]);
      const symmetricId = canonicalJson([first, second].toSorted((left, right) => canonicalJson(left).localeCompare(canonicalJson(right))));
      if (seen.has(symmetricId)) {throw new Error("Duplicate symmetric between-net rule.");}
      if (orientations.has(symmetricId) && orientations.get(symmetricId) !== id) {throw new Error("Between-net categories must use one consistent endpoint orientation.");}
      seen.add(symmetricId); orientations.set(symmetricId, id);
      const body = rows.get(id) ?? { ruleOrder: 3, ruleKeyValue: {}, copperValue: { COPPER: null }, innerPlaneValue: { PLANE: null } };
      const keys = body["ruleKeyValue"];
      if (!isRecord(keys)) {throw new Error("Invalid generated rule body.");}
      const rule = reference(before, value["rule"], category === "Safe Spacing" ? "SAFE" : "CREEPAGE");
      if (rule !== null) {keys[category === "Safe Spacing" ? "SAFE" : "CREEPAGE"] = rule;}
      if (category === "Safe Spacing") {
        body["copperValue"] = { COPPER: reference(before, value["copperRuleName"], "SAFE") };
        body["innerPlaneValue"] = { PLANE: reference(before, value["planeRuleName"], "SAFE") };
      }
      rows.set(id, body);
    }
  }
  const objects = before.objects.filter((object) => { const key = selector(object); return !Array.isArray(key) || !Array.isArray(key[0]); });
  for (const [id, body] of rows) {objects.push({ id, type: "RULE_SELECTOR", body: { ...before.objects.find((object) => object.id === id)?.body, ...body } });}
  return snapshot(before, objects);
}

/** Complete pour/constraint selector replacement; references are checked
 * before dispatch. Constraint names are the only primitive field it can set.
 */
export function expectedRegionRules(compiled: CompiledDesignOperation, before: NativeSourceSnapshot): NativeSourceSnapshot {
  const argument = compiled.call.args[0];
  if (argument?.kind !== "literal" || !Array.isArray(argument.value)) {throw new Error("Complete region rule rows are required.");}
  const records = new Map(before.objects.map((object) => [object.id, object]));
  const wanted = new Set<string>();
  for (const value of argument.value) {
    if (!isRecord(value) || value["type"] !== "region" || typeof value["name"] !== "string") {throw new Error("Malformed region rule row.");}
    const target = records.get(value["name"]);
    const constraint = target?.type === "REGION" && target.body["regionType"] === "CONSTRAINT";
    if (target === undefined || (!constraint && target.type !== "POUR")) {throw new Error("Region rule target must be an existing pour or constraint ID.");}
    const fields: Body = constraint ? { "Safe Spacing": "SAFE", "Other Spacing": "OTHER", Track: "TRACK", "Differential Pair": "DIFFER_ENTAIL", "Via Size": "RADIUS", "Plane Zone": "PLANE", "Copper Zone": "COPPER", "Creepage Distance": "CREEPAGE" } : { "Safe Spacing": "SAFE", "Plane Zone": "PLANE", "Copper Zone": "COPPER", "Creepage Distance": "CREEPAGE" };
    const allowed = new Set(["type", "name", ...Object.keys(fields), ...(constraint ? ["constraintName", "Copper Safe Spacing", "Plane Safe Spacing"] : [])]);
    if (Object.keys(value).some((key) => !allowed.has(key))) {throw new Error("Unreviewed region rule field.");}
    const id = JSON.stringify(["RULE_SELECTOR", [constraint ? "REGION" : "POUR", target.id]]);
    if (wanted.has(id)) {throw new Error("Duplicate region rule row.");}
    wanted.add(id);
    const ruleKeyValue: Body = {};
    for (const [label, raw] of Object.entries(fields)) {
      const family = String(raw), rule = reference(before, value[label], family);
      if (rule !== null && (constraint || !["PLANE", "COPPER"].includes(family) || rule !== "default")) {ruleKeyValue[family] = rule;}
    }
    const copper = reference(before, value["Copper Safe Spacing"], "SAFE"), plane = reference(before, value["Plane Safe Spacing"], "SAFE");
    records.set(id, { id, type: "RULE_SELECTOR", body: { ...records.get(id)?.body, ruleOrder: 2, ruleKeyValue, copperValue: copper === null ? {} : { COPPER: copper }, innerPlaneValue: plane === null ? {} : { PLANE: plane } } });
    if (constraint && Object.hasOwn(value, "constraintName")) {
      if (typeof value["constraintName"] !== "string" || value["constraintName"].length === 0 || target.body["locked"] === true) {throw new Error("Constraint name is empty or its primitive is locked.");}
      records.set(target.id, { ...target, body: { ...target.body, name: value["constraintName"] } });
    }
  }
  for (const object of before.objects) {const key = selector(object); if (Array.isArray(key) && ["POUR", "REGION"].includes(String(key[0])) && !wanted.has(object.id)) {records.delete(object.id);}}
  return snapshot(before, [...records.values()]);
}
