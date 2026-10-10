import { randomBytes } from "node:crypto";
import { canonicalJson, isRecord, sha256Json } from "./core.ts";
import { compareDocumentSources } from "./document-source.ts";
import type { NativeSourceObject, NativeSourceSnapshot } from "./document-source.ts";
import type { NativeDocumentSnapshot, NativeHistorySnapshot } from "./native-history.ts";
import { isNativeDocumentDeleted } from "./native-history.ts";
import { SCHEMATIC_NATIVE_READER_CODE } from "./schematic-native-adapter.ts";
import type { SchematicNativeSnapshot } from "./schematic-native-adapter.ts";
import { alignSchematicLifecyclePair } from "./schematic-lifecycle.ts";
import { schematicOperationSchema } from "./schematic-operations.ts";
import type { SchematicOperation } from "./schematic-operations.ts";
import type { DesignTopology } from "./design-topology.ts";
import { correlateSchematicNativeSource } from "./schematic-source-proof.ts";

export const SCHEMATIC_COMPONENT_CREATE_PROFILE = "easyeda-pro-control.schematic-component-source-create.v1";
interface ComponentAssets { readonly device: NativeDocumentSnapshot; readonly symbol: NativeDocumentSnapshot; readonly partId: string; readonly attributes: Record<string, string>; }
interface SymbolPin { readonly pin: NativeSourceObject; readonly attributes: readonly NativeSourceObject[]; readonly number: string; }
export interface SchematicComponentCreateAdapter {
  readonly profile: typeof SCHEMATIC_COMPONENT_CREATE_PROFILE;
  readonly expression: string;
  readonly createdId: string;
  readonly designator: string;
  readonly uniqueId: string;
  readonly expected: NativeSourceSnapshot;
  readonly assetCommitment: string;
  readonly topology: DesignTopology[number];
}
const same = (left: unknown, right: unknown): boolean => canonicalJson(left) === canonicalJson(right);
function createOperation(input: unknown): Extract<SchematicOperation, { action: "sch.component.create" }> {
  const operation = schematicOperationSchema.parse(input);
  if (operation.action !== "sch.component.create") { throw new Error("Expected typed component creation."); }
  if (operation.properties.rotation !== 0 || operation.properties.mirror) { throw new Error("Component source creation currently requires unrotated, unmirrored placement."); }
  return operation;
}
function exactAsset(history: NativeHistorySnapshot, id: string, type: string): NativeDocumentSnapshot {
  const values = history.documents.filter((document) => document.uuid === id && document.docType === type && !isNativeDocumentDeleted(document));
  const value = values[0];
  if (values.length !== 1 || value === undefined) { throw new Error("Required project-library asset is missing or ambiguous."); }
  if (new Set(value.records.map((record) => record.id)).size !== value.records.length) { throw new Error("Duplicate library record identity."); }
  return value;
}
function assets(input: unknown, history: NativeHistorySnapshot): ComponentAssets {
  const operation = createOperation(input);
  if (history.profile !== "easyeda.native-history.linear-gcm-gzip.v1" || operation.properties.component.libraryUuid !== history.projectUuid) { throw new Error("Component creation requires assets already present in the exact project checkpoint."); }
  const device = exactAsset(history, operation.properties.component.uuid, "DEVICE");
  const meta = device.records.find((record) => record.id === "META" && record.type === "META");
  const raw = meta?.body["attributes"];
  if (!isRecord(raw) || Object.keys(raw).length > 4096 || Object.values(raw).some((value) => typeof value !== "string" || value.length > 65_536)) { throw new Error("Project device attributes are not complete string properties."); }
  const attributes: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value !== "string" || ["__proto__", "prototype", "constructor"].includes(key)) { throw new Error("Invalid project device property."); }
    attributes[key] = value;
  }
  const symbolId = attributes["Symbol"];
  if (symbolId === undefined || symbolId.length === 0) { throw new Error("Device has no exact symbol association."); }
  const symbol = exactAsset(history, symbolId, "SYMBOL");
  const footprintId = attributes["Footprint"];
  if (operation.properties.addIntoPcb && (footprintId === undefined || !footprintId)) { throw new Error("PCB-included device needs an existing footprint association."); }
  if (footprintId !== undefined && footprintId.length > 0) { exactAsset(history, footprintId, "FOOTPRINT"); }
  const parts = symbol.records.filter((record) => record.type === "PART");
  const part = parts.find((record) => record.body["title"] === operation.properties.subPartName);
  if (parts.length !== 1 || part === undefined) { throw new Error("Component creation currently requires an exact single-part project symbol title."); }
  if (symbol.records.some((record) => record.type === "ATTR" && record.body["key"] === "NO_CONNECT")) { throw new Error("Symbol no-connect inheritance needs an explicit creation profile."); }
  return { device, symbol, partId: part.id, attributes };
}
function nextDesignator(value: string | undefined, native: SchematicNativeSnapshot): string {
  const prefix = value?.match(/^([A-Za-z]+)\?$/u)?.[1];
  if (prefix === undefined) { throw new Error("Device designator must be a reviewed prefix followed by '?'."); }
  const used = new Set(native.components.flatMap((component) => component.attributes.filter((attribute) => attribute.key === "Designator").map((attribute) => attribute.value)));
  for (let index = 1; index <= 20_001; index += 1) { if (!used.has(`${prefix}${index}`)) { return `${prefix}${index}`; } }
  throw new Error("No bounded unused designator available.");
}
function attrBody(parentId: string, key: string, value: string, zIndex: number): Record<string, unknown> {
  return { x: null, y: null, rotation: null, color: null, fontFamily: null, fontSize: null, fontWeight: null, italic: null, underline: null, align: null, value, keyVisible: null, valueVisible: null, key, fillColor: null, parentId, zIndex, locked: false, groupId: "" };
}
function assetCommitment(value: ComponentAssets): string { return sha256Json({ device: value.device, symbol: value.symbol }); }

export function assertSchematicComponentCreateSupported(input: unknown, before: NativeSourceSnapshot, nativeInput: unknown, history: NativeHistorySnapshot): void {
  const operation = createOperation(input);
  const native = correlateSchematicNativeSource(before, nativeInput);
  const library = assets(operation, history);
  nextDesignator(library.attributes["Designator"], native);
  if (!history.documents.some((document) => document.uuid === native.document.documentUuid && document.docType === "SCH_PAGE" && !isNativeDocumentDeleted(document))) { throw new Error("Active schematic page is absent from the project checkpoint."); }
  symbolPinNumbers(library);
}
function symbolPinNumbers(library: ComponentAssets): string[] {
  return symbolPins(library).map((value) => value.number);
}
const PIN_FIELDS = ["display", "x", "y", "length", "rotation", "color", "pinShape", "locked"];
const ATTR_FIELDS = ["x", "y", "rotation", "color", "fontFamily", "fontSize", "fontWeight", "italic", "underline", "strikeout", "align", "value", "keyVisible", "valueVisible", "key", "fillColor", "parentId", "zIndex", "locked"];
function symbolPins(library: ComponentAssets): SymbolPin[] {
  const pins = library.symbol.records.filter((record) => record.type === "PIN" && record.body["partId"] === library.partId);
  const numbers = new Set<string>(), suffixes = new Set<string>();
  if (pins.length === 0 || pins.length > 4096) { throw new Error("Project symbol requires a bounded pin inventory."); }
  return pins.map((pin) => {
    const suffix = pin.id.split("-").at(-1);
    if (suffix === undefined || suffix.length === 0 || suffixes.has(suffix) || PIN_FIELDS.some((field) => !Object.hasOwn(pin.body, field)) || Object.keys(pin.body).some((key) => ![...PIN_FIELDS, "partId", "groupId", "zIndex"].includes(key)) || pin.body["groupId"] !== "" || typeof pin.body["display"] !== "boolean" || typeof pin.body["locked"] !== "boolean" || typeof pin.body["pinShape"] !== "string" || !["x", "y", "length", "rotation", "zIndex"].every((field) => typeof pin.body[field] === "number" && Number.isFinite(pin.body[field]))) { throw new Error("Project symbol pin has an unreviewed native body or identity."); }
    suffixes.add(suffix);
    const attributes = library.symbol.records.filter((record) => record.type === "ATTR" && record.body["parentId"] === pin.id);
    const keys = attributes.map((record) => record.body["key"]);
    if (new Set(keys).size !== keys.length || ["Pin Name", "Pin Number", "Pin Type"].some((key) => !keys.includes(key))) { throw new Error("Project symbol pin attributes are missing or ambiguous."); }
    for (const attribute of attributes) {
      if (ATTR_FIELDS.some((field) => !Object.hasOwn(attribute.body, field)) || Object.keys(attribute.body).some((key) => ![...ATTR_FIELDS, "partId", "groupId", "version"].includes(key)) || attribute.body["groupId"] !== "" || attribute.body["partId"] !== library.partId || typeof attribute.body["key"] !== "string" || typeof attribute.body["value"] !== "string" || typeof attribute.body["locked"] !== "boolean" || !Number.isSafeInteger(attribute.body["zIndex"]) || (attribute.body["version"] !== undefined && attribute.body["version"] !== "2.0") || ["x", "y"].some((field) => attribute.body[field] !== null && (typeof attribute.body[field] !== "number" || !Number.isFinite(attribute.body[field])))) { throw new Error("Project symbol pin attribute has an unreviewed native body."); }
    }
    const number = attributes.find((record) => record.body["key"] === "Pin Number")?.body["value"];
    if (typeof number !== "string" || !number || numbers.has(number)) { throw new Error("Project symbol requires unique nonempty pin numbers."); }
    numbers.add(number);
    return { pin, attributes, number };
  });
}

function translated(value: unknown, offset: number): number | null {
  if (value === null) { return null; }
  if (typeof value !== "number" || !Number.isFinite(value)) { throw new TypeError("Invalid symbol coordinate."); }
  return value + offset;
}

/** A deterministic typed source patch. Does not invoke API placement, grid snap,
 * auto-numbering, cloud import, library writes, Save, or a file dialog.
 * Executor must retain this generated expectation in its pre-dispatch journal.
 */
export function buildSchematicComponentCreate(input: unknown, before: NativeSourceSnapshot, nativeInput: unknown, history: NativeHistorySnapshot): SchematicComponentCreateAdapter {
  assertSchematicComponentCreateSupported(input, before, nativeInput, history);
  const operation = createOperation(input);
  const native = correlateSchematicNativeSource(before, nativeInput);
  const library = assets(operation, history);
  if (!history.documents.some((document) => document.uuid === native.document.documentUuid && document.docType === "SCH_PAGE" && !isNativeDocumentDeleted(document))) { throw new Error("Active schematic page is absent from the project checkpoint."); }
  const createdId = randomBytes(8).toString("hex");
  const uniqueId = `gge${randomBytes(8).toString("hex")}`;
  const designator = nextDesignator(library.attributes["Designator"], native);
  const ids = new Set(before.objects.map((record) => record.id));
  if (ids.has(createdId) || native.components.some((model) => model.attributes.some((attribute) => attribute.key === "Unique ID" && attribute.value === uniqueId))) { throw new Error("Generated component identity collision."); }
  const zValues = before.objects.map((record) => record.body["zIndex"]).filter((value) => value !== undefined);
  if (zValues.some((value) => typeof value !== "number" || !Number.isSafeInteger(value))) { throw new Error("Invalid existing source z-order."); }
  let zIndex = 1;
  for (const value of zValues) { if (typeof value === "number") { zIndex = Math.max(zIndex, value + 1); } }
  if (!Number.isSafeInteger(zIndex)) { throw new TypeError("Source z-order exhausted."); }
  const objects: NativeSourceObject[] = structuredClone([...before.objects]);
  objects.push({ id: createdId, type: "COMPONENT", body: { partId: library.partId, x: operation.properties.x, y: -operation.properties.y, rotation: 0, isMirror: false, attrs: {}, zIndex, locked: false, groupId: "" } });
  const properties = { ...library.attributes, Device: library.device.uuid, Symbol: library.symbol.uuid, Designator: designator, "Unique ID": uniqueId, "Add into BOM": operation.properties.addIntoBom ? "yes" : "no", "Convert to PCB": operation.properties.addIntoPcb ? "yes" : "no" };
  let childZ = 1;
  for (const [key, value] of Object.entries(properties)) {
    const id = randomBytes(8).toString("hex");
    if (ids.has(id) || id === createdId) { throw new Error("Generated attribute identity collision."); }
    ids.add(id);
    const body = attrBody(createdId, key, value, childZ); childZ += 1;
    if (key === "Designator" || key === "Name") { body["x"] = operation.properties.x; body["y"] = -operation.properties.y + (key === "Designator" ? -15 : 15); body["rotation"] = 0; body["valueVisible"] = true; body["fontSize"] = 15; body["align"] = "LEFT_BOTTOM"; }
    objects.push({ id, type: "ATTR", body });
  }
  objects.sort((a, b) => a.id.localeCompare(b.id));
  const snapshot = { schema: before.schema, document: before.document, objects };
  const expected = { ...snapshot, sha256: sha256Json(snapshot) };
  const desired = JSON.stringify(objects);
  const baseline = canonicalJson(native);
  if (desired.length + baseline.length > 6 * 1024 * 1024) { throw new Error("Generated schematic source operation exceeds bound."); }
  const expression = `(async () => {
const binding = ${JSON.stringify(native.document)};
${SCHEMATIC_NATIVE_READER_CODE}
const canonical = (value) => JSON.stringify(value,(_key,entry)=>entry && typeof entry === 'object' && !Array.isArray(entry) ? Object.fromEntries(Object.keys(entry).sort().map(key=>[key,entry[key]])) : entry);
const baseline = ${JSON.stringify(baseline)};
if (canonical(schCapture()) !== baseline) throw new Error('SCH_CREATE_BASELINE_CHANGED');
if (typeof schDoc.consistencyImpl.setSourceCode !== 'function' || typeof schDoc.shapeManager.actionRunner?.run !== 'function') throw new Error('SCH_CREATE_SOURCE_API_MISSING');
const desired = ${desired};
const original = schDoc.consistencyImpl.getSourceCode();
const lines = original.split('|\\n');
if (!lines[0]?.startsWith('{"type":"DOCHEAD"}||')) throw new Error('SCH_CREATE_HEADER_INVALID');
const source = [lines[0], ...desired.map((record,index)=>JSON.stringify({type:record.type,id:record.id,ticket:index+1})+'||'+JSON.stringify(record.body))].join('|\\n');
const applied = await schDoc.shapeManager.actionRunner.run(async () => {
  schCheck();
  if (canonical(schCapture()) !== baseline) throw new Error('SCH_CREATE_BASELINE_CHANGED');
  if (await schDoc.consistencyImpl.setSourceCode(source) !== true) throw new Error('SCH_CREATE_SOURCE_REJECTED');
});
if (applied !== true) throw new Error('SCH_CREATE_ACTION_REJECTED');
schCheck();
return {primitiveId:${JSON.stringify(createdId)}};
})()`;
  return { profile: SCHEMATIC_COMPONENT_CREATE_PROFILE, expression, createdId, uniqueId, designator, expected, assetCommitment: assetCommitment(library), topology: { uniqueId, designator, pins: symbolPinNumbers(library).map((pinNumber) => ({ pinNumber, net: null })) } };
}

export function verifySchematicComponentCreate(input: unknown, adapter: SchematicComponentCreateAdapter, before: NativeSourceSnapshot, after: NativeSourceSnapshot, oldNativeInput: unknown, newNativeInput: unknown, history: NativeHistorySnapshot): void {
  const operation = createOperation(input);
  const library = assets(operation, history);
  const oldNative = correlateSchematicNativeSource(before, oldNativeInput);
  const newNative = correlateSchematicNativeSource(after, newNativeInput);
  if (adapter.profile !== SCHEMATIC_COMPONENT_CREATE_PROFILE || adapter.assetCommitment !== assetCommitment(library) || adapter.expected.sha256 !== sha256Json({ schema: adapter.expected.schema, document: adapter.expected.document, objects: adapter.expected.objects }) || !same(adapter.expected, after)) { throw new Error("Created schematic source differs from the journaled exact expectation."); }
  const delta = compareDocumentSources(before, after);
  if (delta.documentChanged || delta.changed.length > 0 || delta.removed.length > 0) { throw new Error("Component creation altered preexisting source records."); }
  const target = newNative.components.find((component) => component.id === adapter.createdId);
  // Complete source equality above proves all previous stored records survived.
  // Project only the new component out before comparing regenerated virtual
  // Attributes; no stored ID or body is removed from that preservation check.
  const existing = newNative.components.filter((component) => component.id !== adapter.createdId);
  let unchanged = same(oldNative.components, existing);
  if (!unchanged) {
    const preserved = alignSchematicLifecyclePair(oldNative, { ...newNative, source: oldNative.source, components: existing });
    unchanged = same(preserved.reference.components, preserved.observed.components);
  }
  if (target?.kind !== "part" || target.locked || !same(oldNative.document, newNative.document) || !unchanged) { throw new Error("Component creation changed unrelated native components, pins or nets."); }
  const values = Object.fromEntries(target.attributes.map((attribute) => [attribute.key, attribute.value]));
  for (const [key, value] of Object.entries({ ...library.attributes, Device: library.device.uuid, Symbol: library.symbol.uuid, Designator: adapter.designator, "Unique ID": adapter.uniqueId, "Add into BOM": operation.properties.addIntoBom ? "yes" : "no", "Convert to PCB": operation.properties.addIntoPcb ? "yes" : "no" })) {
    if (values[key] !== value) { throw new Error("Created component lost a device property or association."); }
  }
  const pins = symbolPins(library);
  if (pins.length === 0 || pins.length !== target.pins.length) { throw new Error("Created component pin inventory differs from its project symbol."); }
  for (const { pin, attributes, number } of pins) {
    const physical = target.pins.filter((entry) => entry.attributes.some((attribute) => attribute.key === "Pin Number" && attribute.value === number));
    const actual = physical[0];
    if (physical.length !== 1 || actual === undefined || actual.noConnect !== null || actual.id !== `${adapter.createdId}-${pin.id.split("-").at(-1)}` || !Number.isSafeInteger(actual.body["zIndex"])) { throw new Error("Created component pin identity or geometry differs from its exact project symbol."); }
    // Clone inserts children into the instance's own z-order. Its complete
    // Observed order remains in the after snapshot; all electrical/style data
    // Below is independently derived from the immutable project symbol.
    const expectedBody = { ...Object.fromEntries(PIN_FIELDS.map((key) => [key, pin.body[key]])), x: translated(pin.body["x"], operation.properties.x), y: translated(pin.body["y"], -operation.properties.y), zIndex: actual.body["zIndex"] };
    if (!same(actual.body, expectedBody) || actual.attributes.length !== attributes.length) { throw new Error("Created component pin geometry, style or attributes differ from its exact project symbol."); }
    for (const attribute of attributes) {
      const matching = actual.attributes.find((entry) => entry.key === attribute.body["key"]);
      const body = { ...Object.fromEntries(ATTR_FIELDS.map((key) => [key, attribute.body[key]])), x: translated(attribute.body["x"], operation.properties.x), y: translated(attribute.body["y"], -operation.properties.y), value: null, keyVisible: null, valueVisible: null, parentId: actual.id, strikeout: attribute.body["strikeout"] === true, fillColor: attribute.body["color"] };
      if (matching === undefined || !/^[a-f0-9]{16}$/u.test(matching.id) || matching.value !== attribute.body["value"] || matching.symbolValue !== attribute.body["value"] || matching.blockValue !== null || matching.instanceValue !== null || !same(matching.body, body)) { throw new Error("Created pin lost or changed an inherited name, number, electrical type, style or property override."); }
    }
  }
}
