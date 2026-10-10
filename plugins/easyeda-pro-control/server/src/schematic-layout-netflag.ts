import { z } from "zod";
import { canonicalJson, isRecord, sha256Json } from "./core.ts";
import { parseDocumentSource } from "./document-source.ts";
import type { NativeSourceObject, NativeSourceSnapshot } from "./document-source.ts";
import { isNativeDocumentDeleted } from "./native-history.ts";
import type { NativeDocumentSnapshot, NativeHistorySnapshot } from "./native-history.ts";
import { SCHEMATIC_NATIVE_READER_CODE } from "./schematic-native-adapter.ts";
import type { SchematicNativeComponent, SchematicNativeSnapshot } from "./schematic-native-adapter.ts";
import { schematicHiddenNullOrder } from "./schematic-hidden-order.ts";
import { correlateSchematicNativeSource } from "./schematic-source-proof.ts";

export const SCHEMATIC_NETFLAG_CLONE_PROFILE = "easyeda-pro-control.schematic-netflag-clone.v1";
const identifier = z.string().min(1).max(256);
export const netFlagCloneStepSchema = z.object({
  id: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$/u), action: z.literal("sch.net-flag.clone"),
  template: z.object({ sheetUuid: identifier, componentId: identifier }).strict(), x: z.number(), y: z.number(),
}).strict();
export type NetFlagCloneStep = z.infer<typeof netFlagCloneStepSchema>;
type Body = Record<string, unknown>;
type Attribute = SchematicNativeComponent["attributes"][number];
const same = (left: unknown, right: unknown): boolean => left === undefined || right === undefined ? left === right : canonicalJson(left) === canonicalJson(right);
function fail(): never { throw new Error("Net-flag template, inheritance, identity or electrical scope is unsupported or changed."); }
function number(value: unknown): number { if (typeof value !== "number" || !Number.isFinite(value)) { fail(); } return value; }
function string(value: unknown): string { if (typeof value !== "string" || !value) { fail(); } return value; }
function document(history: NativeHistorySnapshot, uuid: string, type: string): NativeDocumentSnapshot {
  const values = history.documents.filter((entry) => entry.uuid === uuid && entry.docType === type && !isNativeDocumentDeleted(entry));
  const value = values[0];
  if (values.length !== 1 || value === undefined) { fail(); }
  const hash = sha256Json({ uuid: value.uuid, docType: value.docType, metadata: value.metadata, records: value.records.map(({ id, type: recordType, body }) => ({ id, type: recordType, body })) });
  if (hash !== value.semanticSha256) { fail(); }
  return value;
}
function rootAttribute(component: SchematicNativeComponent, key: string): Attribute {
  const values = component.attributes.filter((entry) => entry.key === key); const value = values[0];
  if (values.length !== 1 || value === undefined || value.body["parentId"] !== component.id || value.instanceValue !== null) { fail(); }
  return value;
}
function translated<T extends Body>(body: T, dx: number, dy: number): T {
  const result = structuredClone(body);
  for (const [key, delta] of [["x", dx], ["y", dy]] as const) {
    if (result[key] !== null && result[key] !== undefined) { Reflect.set(result, key, number(result[key]) + delta); }
  }
  return result;
}
function unlocked(body: Body): boolean {
  return body["locked"] !== true && (body["groupId"] === undefined || body["groupId"] === "");
}
function nativeRootOrder(symbol: NativeDocumentSnapshot, partId: string, attributes: readonly NativeSourceObject[], deviceAttributes: Body): { offset: number; keys: readonly string[] } {
  const partRecords = symbol.records.filter((entry) => entry.body["partId"] === partId);
  const shapes = partRecords.filter((entry) => entry.type !== "ATTR");
  if (shapes.some((entry) => !["PIN", "POLY", "LINE", "ARC", "RECT", "CIRCLE", "ELLIPSE", "TEXT"].includes(entry.type))) { fail(); }
  const roots = partRecords.filter((entry) => entry.type === "ATTR" && [partId, ""].includes(String(entry.body["parentId"])));
  if (roots.some((entry) => !Number.isFinite(entry.body["zIndex"])) || new Set(roots.map((entry) => entry.body["zIndex"])).size !== roots.length) { fail(); }
  const keys = roots.toSorted((a, b) => number(a.body["zIndex"]) - number(b.body["zIndex"])).map((entry) => string(entry.body["key"]));
  if (keys.includes("Relevance") || new Set(keys).size !== keys.length) { fail(); }
  // Native creation attaches non-ATTR library shapes, then library root ATTRs.
  // Supplied extra ATTRs replace the constructor's temporary Relevance and
  // Append in input order; missing device attributes append afterward.
  for (const attr of attributes) { const key = string(attr.body["key"]); if (!keys.includes(key)) { keys.push(key); } }
  for (const key of Object.keys(deviceAttributes)) { if (!keys.includes(key)) { keys.push(key); } }
  if (!keys.includes("Name")) { keys.push("Name"); }
  return { offset: shapes.length, keys };
}
function storedTemplateBodies(sheet: NativeDocumentSnapshot, source: NativeSourceSnapshot, model: SchematicNativeComponent): readonly { id: string; fields: readonly string[] }[] {
  const pins = new Set(model.pins.map((pin) => pin.id));
  const selected = (record: NativeSourceObject): boolean => record.id === model.id || record.body["parentId"] === model.id || pins.has(String(record.body["parentId"]));
  const prior = sheet.records.filter(selected); const current = source.objects.filter(selected);
  if (!same(prior.map((item) => item.id).toSorted(), current.map((item) => item.id).toSorted())) { fail(); }
  const hydration: { id: string; fields: string[] }[] = [];
  for (const stored of prior) {
    const live = current.find((item) => item.id === stored.id);
    if (live === undefined || live.type !== stored.type || !unlocked(stored.body) || !unlocked(live.body)) { fail(); }
    const body = structuredClone(stored.body), fields: string[] = [];
    if (stored.type === "ATTR") {
      // O7.createSchSymbolWithTemplate ends with recalculateChildrenZIndex
      // (sch.js 4629723 / 1929422). The importer also inherits false strikeout.
      if (!same(body["zIndex"], live.body["zIndex"])) {
        if (!Number.isSafeInteger(live.body["zIndex"]) || number(live.body["zIndex"]) < 0) { fail(); }
        body["zIndex"] = live.body["zIndex"]; fields.push("zIndex");
      }
      if (!Object.hasOwn(body, "strikeout") && live.body["strikeout"] === false) { body["strikeout"] = false; fields.push("strikeout"); }
    }
    if (!same(body, live.body)) { fail(); }
    if (fields.length > 0) { hydration.push({ id: stored.id, fields }); }
  }
  return hydration;
}

export interface SchematicNetFlagCloneDescriptor {
  readonly profile: typeof SCHEMATIC_NETFLAG_CLONE_PROFILE;
  readonly checkpointSha256: string; readonly historySha256: string; readonly projectUuid: string;
  readonly templateSheetUuid: string; readonly templateSourceSha256: string; readonly templateNativeSha256: string;
  readonly symbolUuid: string; readonly symbolSha256: string; readonly deviceUuid: string; readonly deviceSha256: string;
  readonly templateHydration: readonly { id: string; fields: readonly string[] }[];
  readonly watchedOmittedStrikeout: readonly { id: string; parentId: string; key: string; stored: boolean }[];
  readonly materializedDeviceAttributes: readonly { id: string; key: string }[];
  readonly reconstructedHiddenAttributeOrder: readonly { id: string; key: string; initialZIndex: number; reconstructedZIndex: number }[];
  readonly net: string; readonly records: readonly NativeSourceObject[]; readonly component: SchematicNativeComponent;
  readonly excludedFromBomAndPcbBy: "native-symbol-type-18";
}

/** Inputs are coordinator-owned: a hash-verified history checkpoint and an
 * authenticated complete native template read. No caller-provided record body,
 * net rename, catalog import, rotation, mirror or inclusion change is admitted.
 */
export function planSchematicNetFlagClone(input: unknown, current: NativeSourceSnapshot, history: NativeHistorySnapshot, templateInput: unknown,
  allocate: (key: string) => string): { records: readonly NativeSourceObject[]; component: SchematicNativeComponent; descriptor: SchematicNetFlagCloneDescriptor } {
  return planClone(input, current, history, templateInput, allocate);
}

/** Recovery only for the retained pre-Description-allocation journal format.
 * Preserve its existing ATTR pool exactly. The sole missing Description ID is
 * Recovered from an exact captured source; its full body remains template-bound.
 * This function does not generate an action and is never used by the writer.
 */
export function planHistoricalSchematicNetFlagClone(input: unknown, current: NativeSourceSnapshot, history: NativeHistorySnapshot, templateInput: unknown,
  allocate: (key: string) => string, observedSource: NativeSourceSnapshot): { records: readonly NativeSourceObject[]; component: SchematicNativeComponent; descriptor: SchematicNetFlagCloneDescriptor } {
  if (!same(current.document, observedSource.document) || observedSource.sha256 !== sha256Json({ schema: observedSource.schema, document: observedSource.document, objects: observedSource.objects })) { fail(); }
  return planClone(input, current, history, templateInput, allocate, observedSource);
}

function planClone(input: unknown, current: NativeSourceSnapshot, history: NativeHistorySnapshot, templateInput: unknown,
  allocate: (key: string) => string, historicalAfter?: NativeSourceSnapshot): { records: readonly NativeSourceObject[]; component: SchematicNativeComponent; descriptor: SchematicNetFlagCloneDescriptor } {
  const step = netFlagCloneStepSchema.parse(input);
  if (history.profile !== "easyeda.native-history.linear-gcm-gzip.v1" || !/^[a-f0-9]{64}$/u.test(history.checkpointSha256) ||
      current.document["docType"] !== "SCH_PAGE" || current.document["editVersion"] !== "3.2.149.88089769") { fail(); }
  document(history, string(current.document["uuid"]), "SCH_PAGE");
  if (!isRecord(templateInput) || typeof templateInput["source"] !== "string") { fail(); }
  const templateSource = parseDocumentSource(templateInput["source"]); const native = correlateSchematicNativeSource(templateSource, templateInput);
  if (native.document.documentUuid !== step.template.sheetUuid || native.document.tabId !== `${step.template.sheetUuid}@${history.projectUuid}`) { fail(); }
  const model = native.components.find((entry) => entry.id === step.template.componentId);
  if (model === undefined || model.kind !== "netflag" || model.locked || !unlocked(model.body) || !same(model.body["attrs"], {}) ||
      model.body["rotation"] !== 0 || model.body["isMirror"] !== false || model.pins.length !== 1) { fail(); }
  const sheet = document(history, step.template.sheetUuid, "SCH_PAGE");
  const symbolUuid = string(rootAttribute(model, "Symbol").value); const deviceUuid = string(rootAttribute(model, "Device").value);
  const symbol = document(history, symbolUuid, "SYMBOL"); const device = document(history, deviceUuid, "DEVICE");
  const symbolMeta = symbol.records.find((entry) => entry.type === "META" && entry.id === "META"); const deviceMeta = device.records.find((entry) => entry.type === "META" && entry.id === "META");
  const deviceAttributes = deviceMeta?.body["attributes"];
  if (symbolMeta?.body["docType"] !== 18 || !isRecord(deviceAttributes) || deviceAttributes["Symbol"] !== symbolUuid ||
      ["Footprint", "3D Model", "Add into BOM", "Convert to PCB"].some((key) => model.attributes.some((attr) => attr.key === key) || Object.hasOwn(deviceAttributes, key))) { fail(); }
  const parts = symbol.records.filter((entry) => entry.type === "PART"); const part = parts[0], pin = model.pins[0];
  if (parts.length !== 1 || part === undefined || model.body["partId"] !== part.id || pin === undefined || pin.noConnect !== null || !unlocked(pin.body)) { fail(); }
  const libraryPins = symbol.records.filter((entry) => entry.type === "PIN" && entry.body["partId"] === part.id); const libraryPin = libraryPins[0];
  if (libraryPins.length !== 1 || libraryPin === undefined || pin.id !== `${model.id}-${libraryPin.id}` ||
      libraryPin.body["x"] !== 0 || libraryPin.body["y"] !== 0 || number(pin.body["x"]) !== number(model.body["x"]) || number(pin.body["y"]) !== number(model.body["y"])) { fail(); }
  if (["length", "rotation", "display", "color", "pinShape"].some((key) => !same(libraryPin.body[key], pin.body[key]))) { fail(); }
  const net = string(rootAttribute(model, "Name").value);
  if (rootAttribute(model, "Global Net Name").value !== net || pin.net !== net || rootAttribute(model, "Relevance").value !== "[]") { fail(); }
  const allAttrs = [...model.attributes, ...pin.attributes];
  if (allAttrs.some((attr) => !unlocked(attr.body) || attr.instanceValue !== null || attr.valueAuthority !== undefined) ||
      model.attributes.some((attr) => ["Designator", "Unique ID", "UniqueID"].includes(attr.key))) { fail(); }
  const owned = templateSource.objects.filter((entry) => entry.id === model.id || entry.body["parentId"] === model.id || entry.body["parentId"] === pin.id);
  if (owned.some((entry) => entry.id !== model.id && entry.type !== "ATTR")) { fail(); }
  const inheritedDeviceAttributes = model.attributes.filter((attr) => !owned.some((entry) => entry.id === attr.id));
  if (inheritedDeviceAttributes.some((attr) => !Object.hasOwn(deviceAttributes, attr.key) || !same(attr.body["value"], deviceAttributes[attr.key]) || !same(attr.blockValue, attr.body["value"]))) { fail(); }
  // Creating a watched new symbol uploads device-default ATTRs too. Supply
  // Their IDs before dispatch instead of accepting native-generated stored IDs.
  const inheritedRecords = inheritedDeviceAttributes.map((attr) => ({ id: attr.id, type: "ATTR", body: attr.body }));
  const attributes = [...owned.filter((entry) => entry.type === "ATTR"), ...(historicalAfter === undefined ? inheritedRecords : [])].toSorted((a, b) => a.id.localeCompare(b.id));
  const storedRoots = sheet.records.filter((entry) => entry.type === "ATTR" && entry.body["parentId"] === model.id).toSorted((a, b) => a.ticket - b.ticket);
  if (new Set(storedRoots.map((entry) => entry.ticket)).size !== storedRoots.length) { fail(); }
  const templateOrder = nativeRootOrder(symbol, part.id, storedRoots, deviceAttributes);
  if (model.attributes.length !== templateOrder.keys.length || model.attributes.some((attr) => attr.body["zIndex"] !== templateOrder.offset + templateOrder.keys.indexOf(attr.key))) {
    // A reopened stored null Relevance uses worker first-insertion clocks,
    // Not the latest edit tickets. Reuse the complete bound library sequence
    // Proof; all subsequent template body and clone lifecycle guards remain.
    const roots = storedRoots.filter((entry) => entry.body["key"] === "Relevance"); const relevance = roots[0];
    if (roots.length !== 1 || relevance === undefined) { fail(); }
    schematicHiddenNullOrder(history, sheet, templateSource, native, relevance);
  }
  const hydration = storedTemplateBodies(sheet, templateSource, model);
  const used = new Set(current.objects.map((entry) => entry.id));
  const allocation = (key: string): string => {
    const value = allocate(key);
    if (!/^[a-f0-9]{16}$/u.test(value) || used.has(value)) { fail(); }
    used.add(value); return value;
  };
  const componentId = allocation(step.id), pinId = `${componentId}-${libraryPin.id}`;
  // Pool slots are journal keys, not original-attribute indices. Sorting the
  // Pool preserves the exact template source's ATTR insertion order on import.
  const pool = attributes.map((_, index) => allocation(`${step.id}:attr:${index}`)).toSorted();
  const map = new Map<string, string>([[model.id, componentId], [pin.id, pinId]]);
  for (const [index, attr] of attributes.entries()) { const value = pool[index]; if (value === undefined) { fail(); } map.set(attr.id, value); }
  if (historicalAfter !== undefined) {
    const attr = inheritedDeviceAttributes[0];
    if (inheritedDeviceAttributes.length !== 1 || attr?.key !== "Description") { fail(); }
    const matches = historicalAfter.objects.filter((entry) => entry.type === "ATTR" && entry.body["parentId"] === componentId && entry.body["key"] === "Description");
    const observed = matches[0];
    if (matches.length !== 1 || observed === undefined || !/^[a-f0-9]{16}$/u.test(observed.id) || used.has(observed.id) || historicalAfter.objects.filter((entry) => entry.id === observed.id).length !== 1) { fail(); }
    used.add(observed.id); map.set(attr.id, observed.id);
  }
  const dx = step.x - number(model.body["x"]), dy = -step.y - number(model.body["y"]);
  let zIndex = 0;
  for (const entry of current.objects) { if (entry.body["zIndex"] !== null && entry.body["zIndex"] !== undefined) { zIndex = Math.max(zIndex, number(entry.body["zIndex"])); } }
  zIndex = Math.floor(zIndex) + 1;
  if (!Number.isSafeInteger(zIndex)) { fail(); }
  const component = structuredClone(model); component.id = componentId; component.body = translated(component.body, dx, dy); component.body["zIndex"] = zIndex;
  const watchedOmittedStrikeout: { id: string; parentId: string; key: string; stored: boolean }[] = [];
  const cloneAttr = (attr: Attribute): Attribute => {
    const parent = map.get(string(attr.body["parentId"])); if (parent === undefined) { fail(); }
    const body = translated(attr.body, dx, dy); body["parentId"] = parent;
    const id = map.get(attr.id) ?? sha256Json({ componentId, parent, key: attr.key }).slice(0, 16);
    const libraryParents = attr.body["parentId"] === model.id ? [part.id, ""] : [libraryPin.id];
    const libraryAttributes = symbol.records.filter((entry) => entry.type === "ATTR" && entry.body["partId"] === part.id && entry.body["key"] === attr.key && libraryParents.includes(String(entry.body["parentId"])));
    if (libraryAttributes.length > 1 || (body["strikeout"] !== undefined && typeof body["strikeout"] !== "boolean")) { fail(); }
    const inheritedStrikeout = libraryAttributes[0]?.body["strikeout"] === true;
    // Ak.watch (1885423) skips setters when the getter equals the new value.
    // The strikeout getter defaults to false (3863558), but ATTR encoding uses
    // _strikeout (6279814). A fresh watched false/default clone therefore omits
    // This backing field. A true library style explicitly changed to false
    // Still writes false and must not be omitted.
    if (body["strikeout"] === undefined && inheritedStrikeout) { fail(); }
    if (body["strikeout"] === false && !inheritedStrikeout) {
      delete body["strikeout"]; watchedOmittedStrikeout.push({ id, parentId: parent, key: attr.key, stored: map.has(attr.id) });
    }
    // Unstored inherited IDs are expectation aliases only. They are never
    // Injected into the source and are independently matched by key/parent.
    return { ...structuredClone(attr), id, body };
  };
  component.attributes = component.attributes.map(cloneAttr);
  component.pins = component.pins.map((entry) => ({ ...entry, id: pinId, body: translated(entry.body, dx, dy), attributes: entry.attributes.map(cloneAttr) }));
  const cloneOrder = nativeRootOrder(symbol, part.id, attributes.filter((entry) => entry.body["parentId"] === model.id), deviceAttributes);
  for (const attr of component.attributes) { attr.body["zIndex"] = cloneOrder.offset + cloneOrder.keys.indexOf(attr.key); }
  component.attributes.sort((a, b) => a.id.localeCompare(b.id));
  for (const entry of component.pins) { entry.attributes.sort((a, b) => a.id.localeCompare(b.id)); }
  const records: NativeSourceObject[] = [{ id: componentId, type: "COMPONENT", body: structuredClone(component.body) }];
  for (const attr of [...attributes, ...(historicalAfter === undefined ? [] : inheritedRecords)]) {
    const mapped = [...component.attributes, ...component.pins.flatMap((entry) => entry.attributes)].find((entry) => entry.id === map.get(attr.id));
    if (mapped === undefined) { fail(); }
    records.push({ id: mapped.id, type: "ATTR", body: structuredClone(mapped.body) });
  }
  if (historicalAfter !== undefined) {
    for (const attr of inheritedDeviceAttributes) {
      const id = map.get(attr.id);
      if (!same(records.find((entry) => entry.id === id), historicalAfter.objects.find((entry) => entry.id === id))) { fail(); }
    }
  }
  // Native updateSymbols (sch.js 5647699) recreates via getSchSymbolCreateInfo
  // (6249779), whose Map inserts Symbol and Device before remaining stored
  // Attributes. O7 (4627070) retains library root order and appends extras;
  // Then recalculateChildrenZIndex (1929422) assigns contiguous indices.
  const storedRootAttributes = component.attributes.filter((attr) => records.some((record) => record.id === attr.id));
  const reconstructionAttributes = [
    ...["Symbol", "Device"].flatMap((key) => storedRootAttributes.filter((attr) => attr.key === key)),
    ...storedRootAttributes.filter((attr) => !["Symbol", "Device"].includes(attr.key)).toSorted((a, b) => number(a.body["zIndex"]) - number(b.body["zIndex"])),
  ].map((attr) => ({ id: attr.id, type: "ATTR", body: attr.body }));
  const reconstructedOrder = nativeRootOrder(symbol, part.id, reconstructionAttributes, deviceAttributes);
  const reordered = component.attributes.filter((attr) => attr.body["zIndex"] !== reconstructedOrder.offset + reconstructedOrder.keys.indexOf(attr.key));
  const deviceAttr = reordered.find((attr) => attr.key === "Device"), relevance = reordered.find((attr) => attr.key === "Relevance");
  const description = reordered.find((attr) => attr.key === "Description");
  const adjacentSwap = reordered.length === 2 && relevance !== undefined && deviceAttr !== undefined &&
    number(deviceAttr.body["zIndex"]) === number(relevance.body["zIndex"]) + 1 &&
    reconstructedOrder.offset + reconstructedOrder.keys.indexOf("Device") === relevance.body["zIndex"] &&
    reconstructedOrder.offset + reconstructedOrder.keys.indexOf("Relevance") === deviceAttr.body["zIndex"];
  // A watched clone can store its materialized empty Description before the
  // Relevance/Device extras. Native Symbol/Device-first recreation then moves
  // Device ahead of BOTH extras. Derive only this exact adjacent three-cycle
  // From the same library and retained insertion order, not arbitrary z-order.
  const materializedDescriptionCycle = reordered.length === 3 && description !== undefined && relevance !== undefined && deviceAttr !== undefined &&
    inheritedDeviceAttributes.some((attr) => attr.key === "Description" && attr.value === "" && map.get(attr.id) === description.id) &&
    number(relevance.body["zIndex"]) === number(description.body["zIndex"]) + 1 &&
    number(deviceAttr.body["zIndex"]) === number(description.body["zIndex"]) + 2 &&
    reconstructedOrder.offset + reconstructedOrder.keys.indexOf("Device") === description.body["zIndex"] &&
    reconstructedOrder.offset + reconstructedOrder.keys.indexOf("Description") === relevance.body["zIndex"] &&
    reconstructedOrder.offset + reconstructedOrder.keys.indexOf("Relevance") === deviceAttr.body["zIndex"];
  const reconstructedHiddenAttributeOrder = (adjacentSwap || materializedDescriptionCycle) &&
    reordered.every((attr) => attr.body["x"] === null && attr.body["y"] === null &&
      attr.body["keyVisible"] === null && attr.body["valueVisible"] === null) ?
    reordered.map((attr) => ({ id: attr.id, key: attr.key, initialZIndex: number(attr.body["zIndex"]),
      reconstructedZIndex: reconstructedOrder.offset + reconstructedOrder.keys.indexOf(attr.key) })) : [];
  const descriptor: SchematicNetFlagCloneDescriptor = { profile: SCHEMATIC_NETFLAG_CLONE_PROFILE, checkpointSha256: history.checkpointSha256,
    historySha256: history.semanticSha256, projectUuid: history.projectUuid, templateSheetUuid: step.template.sheetUuid,
    templateSourceSha256: templateSource.sha256, templateNativeSha256: sha256Json(native), symbolUuid, symbolSha256: symbol.semanticSha256,
    deviceUuid, deviceSha256: device.semanticSha256, templateHydration: hydration, watchedOmittedStrikeout,
    materializedDeviceAttributes: inheritedDeviceAttributes.map((attr) => ({ id: string(map.get(attr.id)), key: attr.key })), reconstructedHiddenAttributeOrder,
    net, records, component, excludedFromBomAndPcbBy: "native-symbol-type-18" };
  return { records, component, descriptor };
}

/** This proves only the new flag. The batch coordinator still proves every
 * existing source/native record, real-part pin/net topology, all other sheets,
 * library bytes and the complete durable project before reporting success.
 */
export function verifySchematicNetFlagClone(descriptor: SchematicNetFlagCloneDescriptor, actualSource: NativeSourceSnapshot, actualInput: unknown): void {
  if (descriptor.profile !== SCHEMATIC_NETFLAG_CLONE_PROFILE) { fail(); }
  const actual = correlateSchematicNativeSource(actualSource, actualInput), found = actual.components.find((entry) => entry.id === descriptor.component.id);
  if (found === undefined) { fail(); }
  const model = structuredClone(found), stored = new Set(descriptor.records.map((entry) => entry.id));
  const align = (before: readonly Attribute[], after: Attribute[]): void => {
    if (before.length !== after.length) { fail(); }
    for (const entry of after) {
      const reference = before.find((attr) => attr.key === entry.key && attr.body["parentId"] === entry.body["parentId"]);
      if (reference === undefined) { fail(); }
      if (entry.id !== reference.id) {
        if (stored.has(reference.id) || actualSource.objects.some((object) => object.id === entry.id) || !/^[a-f0-9]{16}$/u.test(entry.id)) { fail(); }
        entry.id = reference.id;
      }
    }
    after.sort((a, b) => a.id.localeCompare(b.id));
  };
  align(descriptor.component.attributes, model.attributes);
  for (const pin of model.pins) { const reference = descriptor.component.pins.find((entry) => entry.id === pin.id); if (reference === undefined) { fail(); } align(reference.attributes, pin.attributes); }
  const expected = structuredClone(descriptor.component); expected.attributes.sort((a, b) => a.id.localeCompare(b.id));
  for (const pin of expected.pins) { pin.attributes.sort((a, b) => a.id.localeCompare(b.id)); }
  if (!same(model, expected)) { fail(); }
  const pins = new Set(model.pins.map((entry) => entry.id));
  const records = actualSource.objects.filter((entry) => entry.id === model.id || entry.body["parentId"] === model.id || pins.has(String(entry.body["parentId"])));
  if (!same(records.toSorted((a, b) => a.id.localeCompare(b.id)), descriptor.records.toSorted((a, b) => a.id.localeCompare(b.id)))) { fail(); }
}

/** Reopen/reconciliation only. Unwatched construction calls the strikeout
 * setter directly, so a reconstructed false library style is backed by false.
 * Preserve raw hashes and project only the new clone's reviewed omitted fields
 * and exact hidden attribute order from native Symbol/Device-first recreation;
 * within-generation apply and stale-state checks must use the strict verifier.
 */
export function alignSchematicNetFlagCloneLifecycle(descriptor: SchematicNetFlagCloneDescriptor, actualSource: NativeSourceSnapshot, actualInput: unknown): {
  source: NativeSourceSnapshot; native: SchematicNativeSnapshot;
  proof: { profile: "easyeda-pro-control.netflag-strikeout-lifecycle.v1"; rawSourceSha256: string; rawNativeSha256: string; comparedSourceSha256: string; hydratedAttributes: readonly string[];
    reorderedHiddenAttributes: SchematicNetFlagCloneDescriptor["reconstructedHiddenAttributeOrder"] };
} {
  const native = structuredClone(correlateSchematicNativeSource(actualSource, actualInput));
  const rawNativeSha256 = sha256Json(native), records = new Map(actualSource.objects.map((entry) => [entry.id, structuredClone(entry)]));
  const component = native.components.find((entry) => entry.id === descriptor.component.id);
  if (component === undefined) { fail(); }
  const attributes = [...component.attributes, ...component.pins.flatMap((pin) => pin.attributes)], hydratedAttributes: string[] = [];
  for (const field of descriptor.watchedOmittedStrikeout) {
    const matches = attributes.filter((entry) => entry.key === field.key && entry.body["parentId"] === field.parentId);
    const attr = matches[0];
    if (matches.length !== 1 || attr === undefined || (field.stored && attr.id !== field.id)) { fail(); }
    const record = records.get(attr.id);
    if (field.stored !== (record !== undefined)) { fail(); }
    if (Object.hasOwn(attr.body, "strikeout")) {
      if (attr.body["strikeout"] !== false || (record !== undefined && record.body["strikeout"] !== false)) { fail(); }
      delete attr.body["strikeout"]; if (record !== undefined) { delete record.body["strikeout"]; }
      hydratedAttributes.push(attr.id);
    }
  }
  const reorderedHiddenAttributes: { id: string; key: string; initialZIndex: number; reconstructedZIndex: number }[] = [];
  const order = descriptor.reconstructedHiddenAttributeOrder;
  if (order.length > 0) {
    if (order.length !== 2 && order.length !== 3) { fail(); }
    const changed = order.filter((field) => component.attributes.find((attr) => attr.id === field.id)?.body["zIndex"] !== field.initialZIndex);
    if (changed.length > 0 && changed.length !== order.length) { fail(); }
    for (const field of changed) {
      const attr = component.attributes.find((entry) => entry.id === field.id), record = records.get(field.id);
      const expected = descriptor.component.attributes.find((entry) => entry.id === field.id);
      if (attr === undefined || record === undefined || expected === undefined || record.type !== "ATTR" || attr.key !== field.key ||
          attr.body["parentId"] !== component.id || attr.body["zIndex"] !== field.reconstructedZIndex ||
          record.body["zIndex"] !== field.reconstructedZIndex ||
          !same({ ...attr, body: { ...attr.body, zIndex: field.initialZIndex } }, expected) ||
          !same({ ...record.body, zIndex: field.initialZIndex }, expected.body)) { fail(); }
      attr.body["zIndex"] = field.initialZIndex; record.body["zIndex"] = field.initialZIndex;
      reorderedHiddenAttributes.push(field);
    }
  }
  const value = { schema: actualSource.schema, document: actualSource.document, objects: [...records.values()].toSorted((a, b) => a.id.localeCompare(b.id)) };
  const source = { ...value, sha256: sha256Json(value) };
  native.source = `${[`{"type":"DOCHEAD"}||${JSON.stringify(source.document)}`,
    ...source.objects.map((entry) => `${JSON.stringify({ type: entry.type, id: entry.id })}||${JSON.stringify(entry.body)}`)].join("|\n")}|\n`;
  verifySchematicNetFlagClone(descriptor, source, native);
  return { source, native, proof: { profile: "easyeda-pro-control.netflag-strikeout-lifecycle.v1", rawSourceSha256: actualSource.sha256, rawNativeSha256,
    comparedSourceSha256: source.sha256, hydratedAttributes, reorderedHiddenAttributes } };
}

/** Fixed read-only get(uuid), never getOrInitDoc/open/activate. The caller wraps
 * this in the pinned SCH frame and authenticated active-context guard.
 * Native get/getSchDocs contract: sch.js 6416740..6418250.
 */
export function buildLoadedNetFlagTemplateReadExpression(input: { active: { documentUuid: string; tabId: string }; template: { documentUuid: string; tabId: string }; projectUuid: string }): string {
  const scope = z.object({ active: z.object({ documentUuid: identifier, tabId: identifier }).strict(), template: z.object({ documentUuid: identifier, tabId: identifier }).strict(), projectUuid: identifier }).strict().parse(input);
  if (scope.active.tabId !== `${scope.active.documentUuid}@${scope.projectUuid}` || scope.template.tabId !== `${scope.template.documentUuid}@${scope.projectUuid}`) { fail(); }
  const offset = SCHEMATIC_NATIVE_READER_CODE.indexOf("const schScalar =");
  if (offset === -1) { fail(); }
  return `(()=>{const scope=${JSON.stringify(scope)},binding=scope.template;
const schNative=globalThis.SCH,schManager=schNative?.docMemoryManager;
if(!schManager||typeof schManager.get!=='function'||typeof schManager.getSchDocs!=='function'||typeof schManager.getActiveDoc!=='function')throw new Error('SCH_NETFLAG_TEMPLATE_MANAGER');
const schActive=schManager.getActiveDoc(),schDoc=schManager.get(binding.documentUuid);
const schCheck=()=>{const docs=schManager.getSchDocs();if(schManager.getActiveDoc()!==schActive||!schActive||schActive.uuid!==scope.active.documentUuid||schActive.tabId!==scope.active.tabId||schNative.gVars?.currentProject?.projectId!==scope.projectUuid||!schDoc||schManager.get(binding.documentUuid)!==schDoc||!Array.isArray(docs)||docs.length>2048||docs.filter(doc=>doc===schDoc).length!==1||schDoc.uuid!==binding.documentUuid||schDoc.tabId!==binding.tabId||schDoc.isSchSheetDoc()!==true)throw new Error('SCH_NETFLAG_TEMPLATE_SCOPE');};
schCheck();${SCHEMATIC_NATIVE_READER_CODE.slice(offset)}
const first=schCapture(),second=schCapture();if(JSON.stringify(first)!==JSON.stringify(second))throw new Error('SCH_NETFLAG_TEMPLATE_UNSTABLE');return second;})()`;
}
