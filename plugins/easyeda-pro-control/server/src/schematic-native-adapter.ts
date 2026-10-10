import { z } from "zod";
import { canonicalJson, sha256Json } from "./core.ts";
import { NORMALIZE_DOCUMENT_SOURCE_CODE } from "./document-source.ts";
import { isSchematicBindingProperty, schematicOperationSchema } from "./schematic-operations.ts";
import type { SchematicOperation, SchematicPreservedProperties } from "./schematic-operations.ts";

/** Native manager/encoder contracts reviewed in pro-sch 3.2.149.35ae2987. */
export const SCHEMATIC_NATIVE_PROFILE = "easyeda-pro-control.schematic-native.v1";
export const SCHEMATIC_NATIVE_MAX_BYTES = 8 * 1024 * 1024;
const identifier = z.string().min(1).max(512);
const scalar = z.union([z.string().max(65_536), z.number(), z.boolean(), z.null()]);
const body = z.record(z.string(), z.json()).refine((value) => JSON.stringify(value).length <= 1_048_576);
const attribute = z.object({ id: identifier, key: identifier, value: scalar, symbolValue: scalar, blockValue: scalar, instanceValue: scalar, body, valueAuthority: z.literal("stored-frame-update").optional() }).strict();
const pin = z.object({ id: identifier, body, attributes: z.array(attribute).max(4096), net: z.string().max(65_536), noConnect: z.object({ id: identifier, value: scalar, body }).strict().nullable() }).strict();
const component = z.object({ id: identifier, kind: identifier, locked: z.boolean(), body, attributes: z.array(attribute).max(4096), pins: z.array(pin).max(4096) }).strict();
export const schematicNativeBindingSchema = z.object({ documentUuid: identifier, tabId: identifier }).strict();
export const schematicNativeSnapshotSchema = z.object({
  profile: z.literal(SCHEMATIC_NATIVE_PROFILE),
  document: schematicNativeBindingSchema,
  source: z.string().min(1).max(4_194_304),
  components: z.array(component).max(20_000),
}).strict().superRefine((value, context) => {
  if (Buffer.byteLength(JSON.stringify(value), "utf8") > SCHEMATIC_NATIVE_MAX_BYTES) { context.addIssue({ code: "custom", message: "Native snapshot exceeds decoded bound." }); }
  const ids = new Set<string>();
  for (const entry of value.components) {
    if (ids.has(entry.id)) { context.addIssue({ code: "custom", message: "Duplicate component identity." }); }
    ids.add(entry.id);
    for (const attributes of [entry.attributes, ...entry.pins.map((item) => item.attributes)]) {
      if (new Set(attributes.map((item) => item.id)).size !== attributes.length || new Set(attributes.map((item) => item.key)).size !== attributes.length) {
        context.addIssue({ code: "custom", message: "Duplicate attribute identity or key." });
      }
    }
    if (new Set(entry.pins.map((item) => item.id)).size !== entry.pins.length) { context.addIssue({ code: "custom", message: "Duplicate pin identity." }); }
  }
});
export type SchematicNativeBinding = z.infer<typeof schematicNativeBindingSchema>;
export type SchematicNativeSnapshot = z.infer<typeof schematicNativeSnapshotSchema>;
export type SchematicNativeComponent = z.infer<typeof component>;

/** The pinned drawing model computes these two display strings from sheetCache
 * updateTime, not ATTR data. Compare the stored value, retaining every override,
 * source-body field and other effective value. Also accepts older raw evidence.
 */
export function normalizeSchematicNativeSnapshot(input: unknown): SchematicNativeSnapshot {
  const snapshot = schematicNativeSnapshotSchema.parse(input);
  for (const model of snapshot.components) {
    for (const attr of model.attributes) {
      const derived = model.kind === "sheet" && ["@Update Date", "@Update Time"].includes(attr.key);
      if (derived) {
        const stored = scalar.parse(attr.body["value"]);
        if (attr.body["key"] !== attr.key || attr.body["parentId"] !== model.id) { throw new Error("Computed frame attribute source binding differs."); }
        const pattern = attr.key === "@Update Time" ? /^(?:[0-2]\d:[0-5]\d:[0-5]\d)?$/u : /^(?:\d{4}-\d{2}-\d{2})?$/u;
        if (attr.valueAuthority === undefined && (typeof attr.value !== "string" || !pattern.test(attr.value))) { throw new Error("Computed frame timestamp format differs from the reviewed native getter."); }
        if (attr.valueAuthority !== undefined && canonicalJson(attr.value) !== canonicalJson(stored)) { throw new Error("Stored frame timestamp value is inconsistent."); }
        attr.value = stored; attr.valueAuthority = "stored-frame-update";
      } else if (attr.valueAuthority !== undefined) {
        throw new Error("Unexpected native attribute authority marker.");
      }
    }
  }
  return snapshot;
}

/** Embedded only by facade-generated programs after the normal exact-runtime gate.
 * The fresh native encoder supplies DOCHEAD client/time/version on every read.
 * Normalize only those validated export fields; retain all real source records.
 */
export const SCHEMATIC_NATIVE_READER_CODE = `
const schNative = globalThis.SCH;
if (!schNative || !schNative.docMemoryManager || typeof schNative.docMemoryManager.getActiveDoc !== "function") throw new Error("SCH_NATIVE_MANAGER_MISSING");
const schManager = schNative.docMemoryManager;
const schDoc = schManager.getActiveDoc();
const schCheck = () => {
  const current = schManager.getActiveDoc();
  if (!current || current !== schDoc || current.uuid !== binding.documentUuid || current.tabId !== binding.tabId ||
      typeof current.isSchSheetDoc !== "function" || current.isSchSheetDoc() !== true) throw new Error("SCH_NATIVE_CONTEXT_MISMATCH");
};
schCheck();
const schScalar = (value) => {
  if (value === undefined || value === null) return null;
  if ((typeof value === "string" && value.length <= 65536) || typeof value === "boolean" || (typeof value === "number" && Number.isFinite(value))) return value;
  throw new Error("SCH_NATIVE_SCALAR_INVALID");
};
const schBody = (model) => {
  if (!model || typeof model.getConsistencyData !== "function") throw new Error("SCH_NATIVE_BODY_MISSING");
  const value = model.getConsistencyData();
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("SCH_NATIVE_BODY_INVALID");
  // Native encoders JSON.stringify these records too: omit undefined object properties only.
  return JSON.parse(JSON.stringify(value));
};
const schAttributes = (model) => {
  if (typeof model.getAttr !== "function") throw new Error("SCH_NATIVE_ATTRIBUTES_MISSING");
  const values = model.getAttr();
  if (!Array.isArray(values) || values.length > 4096) throw new Error("SCH_NATIVE_ATTRIBUTES_INVALID");
  return values.map((attr) => {
    if (!attr || typeof attr.id !== "string" || typeof attr.key !== "string" || typeof attr.getValue !== "function" || typeof attr.getInstanceValue !== "function") throw new Error("SCH_NATIVE_ATTRIBUTE_INVALID");
    const body = schBody(attr);
    const computedFrameUpdate = model.cmdKey === "sheet" && (attr.key === "@Update Date" || attr.key === "@Update Time");
    const observed = schScalar(attr.getValue());
    if (computedFrameUpdate) {
      const pattern = attr.key === "@Update Time" ? /^(?:[0-2]\\d:[0-5]\\d:[0-5]\\d)?$/ : /^(?:\\d{4}-\\d{2}-\\d{2})?$/;
      if (typeof observed !== "string" || !pattern.test(observed) || body.key !== attr.key || body.parentId !== model.id || body.value === undefined) throw new Error("SCH_NATIVE_FRAME_TIMESTAMP_INVALID");
    }
    return { id: attr.id, key: attr.key, value: computedFrameUpdate ? schScalar(body.value) : observed, symbolValue: schScalar(attr.symbolValue), blockValue: schScalar(attr.blockValue), instanceValue: schScalar(attr.getInstanceValue()), body, ...(computedFrameUpdate ? {valueAuthority:"stored-frame-update"} : {}) };
  }).sort((a,b) => a.id.localeCompare(b.id));
};
const schCaptureComponent = (model) => {
  if (!model || typeof model.id !== "string" || typeof model.cmdKey !== "string" || typeof model.traversePins !== "function") throw new Error("SCH_NATIVE_COMPONENT_INVALID");
  if (model.locked !== undefined && typeof model.locked !== "boolean") throw new Error("SCH_NATIVE_LOCK_INVALID");
  const pins = [];
  model.traversePins((item) => {
    if (pins.length >= 4096 || typeof item.id !== "string") throw new Error("SCH_NATIVE_PIN_INVALID");
    const helper = schDoc.shapeManager.modelHelpers.pin;
    if (!helper || typeof helper.getSchPinNet !== "function") throw new Error("SCH_NATIVE_PIN_NET_MISSING");
    const net = helper.getSchPinNet(item);
    if (typeof net !== "string") throw new Error("SCH_NATIVE_PIN_NET_INVALID");
    const noConnect = item.noConnect;
    pins.push({ id: item.id, body: schBody(item), attributes: schAttributes(item), net, noConnect: noConnect ? { id: noConnect.id, value: schScalar(noConnect.value), body: schBody(noConnect) } : null });
  });
  pins.sort((a,b) => a.id.localeCompare(b.id));
  return { id: model.id, kind: model.cmdKey, locked: model.locked === true, body: schBody(model), attributes: schAttributes(model), pins };
};
const schCapture = () => {
  schCheck();
  if (!schDoc.shapeManager || typeof schDoc.shapeManager.getModels !== "function" || !schDoc.consistencyImpl || typeof schDoc.consistencyImpl.getSourceCode !== "function") throw new Error("SCH_NATIVE_SOURCE_MISSING");
  const models = schDoc.shapeManager.getModels("Symbol");
  if (!Array.isArray(models) || models.length > 20000) throw new Error("SCH_NATIVE_COMPONENTS_INVALID");
  const components = models.map((model) => schCaptureComponent(model)).sort((a,b) => a.id.localeCompare(b.id));
  let source = schDoc.consistencyImpl.getSourceCode();
  if (typeof source !== "string" || !source || source.length > 4194304) throw new Error("SCH_NATIVE_SOURCE_INVALID");
  ${NORMALIZE_DOCUMENT_SOURCE_CODE}
  if (sourceHeader.uuid !== binding.documentUuid || sourceHeader.docType !== "SCH_PAGE") throw new Error("SCH_NATIVE_SOURCE_CONTEXT_MISMATCH");
  schCheck();
  return { profile: "${SCHEMATIC_NATIVE_PROFILE}", document: { documentUuid: schDoc.uuid, tabId: schDoc.tabId }, source, components };
};
`;

export function buildSchematicNativeReadExpression(input: unknown): string {
  const binding = schematicNativeBindingSchema.parse(input);
  return `(() => { const binding = ${JSON.stringify(binding)}; ${SCHEMATIC_NATIVE_READER_CODE}\nreturn schCapture(); })()`;
}

export function schematicNativeSnapshotHash(input: unknown): string {
  return sha256Json(normalizeSchematicNativeSnapshot(input));
}

const STANDARD_PROPERTIES = new Set(["Add into BOM", "Convert to PCB", "Designator", "Name", "Unique ID", "Manufacturer", "Manufacturer Part", "Supplier", "Supplier Part"]);
const ATTR_FIELDS: Readonly<Record<string, string>> = { addIntoBom: "Add into BOM", addIntoPcb: "Convert to PCB", designator: "Designator", name: "Name", uniqueId: "Unique ID", manufacturer: "Manufacturer", manufacturerId: "Manufacturer Part", supplier: "Supplier", supplierId: "Supplier Part" };

/** Values come from native inherited+override attributes, never the filtered public mapper. */
export function schematicPreservedProperties(input: unknown, targetId: string): SchematicPreservedProperties {
  const snapshot = schematicNativeSnapshotSchema.parse(input);
  const model = snapshot.components.find((entry) => entry.id === targetId);
  if (!model || model.kind !== "part") { throw new Error("Schematic preservation target is not one part."); }
  const values = Object.fromEntries(model.attributes.map((attr) => [attr.key, attr.value]));
  const sourcing = (key: string): string | null => {
    const value = values[key];
    if (value === undefined || value === null) { return null; }
    if (typeof value !== "string") { throw new TypeError("Native sourcing value is not a string."); }
    return value;
  };
  const otherProperty: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(values)) {
    if (!STANDARD_PROPERTIES.has(key)) {
      if (["__proto__", "constructor", "prototype"].includes(key) || value === null) { throw new Error("Native property cannot be represented losslessly by the typed component patch."); }
      otherProperty[key] = value;
    }
  }
  return { otherProperty, manufacturer: sourcing("Manufacturer"), manufacturerId: sourcing("Manufacturer Part"), supplier: sourcing("Supplier"), supplierId: sourcing("Supplier Part") };
}

export function nativeSchematicAttributePatch(operation: SchematicOperation): Record<string, string | null> {
  if (operation.action !== "sch.component.modify") { throw new Error("Native attribute patch requires component.modify."); }
  const attributes: Record<string, string | null> = {};
  for (const [key, entry] of Object.entries(operation.patch.otherProperty ?? {})) {
    if (isSchematicBindingProperty(key)) { throw new Error("Library-binding attributes require an explicit instance replacement/ECO operation."); }
    attributes[key] = String(entry);
  }
  for (const [field, key] of Object.entries(ATTR_FIELDS)) {
    const value: unknown = Reflect.get(operation.patch, field);
    if (value !== undefined) {
      if (field === "addIntoBom" || field === "addIntoPcb") {
        if (typeof value !== "boolean") { throw new TypeError("Inclusion property must be boolean."); }
        attributes[key] = value ? "yes" : "no";
      } else {
        if (value !== null && typeof value !== "string") { throw new TypeError("Component property must be string or null."); }
        attributes[key] = value;
      }
    }
  }
  return attributes;
}

/** Fixed native edit avoids the public mapper's property filtering and falsy-value clearing.
 * Journaling, exact-runtime checks, independent source/topology proofs and persistence
 * remain mandatory in the executor. This expression never saves or retries.
 */
export function buildSchematicNativeComponentWriteExpression(input: unknown, beforeInput: unknown, targetId: string): string {
  const operation = schematicOperationSchema.parse(input);
  const before = normalizeSchematicNativeSnapshot(beforeInput);
  if (operation.action !== "sch.component.modify") { throw new Error("Native component adapter accepts only typed component modifications."); }
  identifier.parse(targetId);
  if ("primitiveId" in operation.target && operation.target.primitiveId !== targetId) { throw new Error("Resolved component identity contradicts operation."); }
  const target = before.components.find((entry) => entry.id === targetId);
  if (!target || target.kind !== "part" || target.locked) { throw new Error("Native component target must be an unlocked part."); }
  if (operation.patch.rotation !== undefined && operation.patch.rotation % 90 !== 0) { throw new Error("Native component rotation requires an exact cardinal angle."); }
  const attributes = nativeSchematicAttributePatch(operation);
  const pose = Object.fromEntries(Object.entries(operation.patch).filter(([key]) => ["x", "y", "rotation", "mirror"].includes(key)));
  return `(async () => {
const binding = ${JSON.stringify(before.document)};
${SCHEMATIC_NATIVE_READER_CODE}
const canonical = (value) => JSON.stringify(value, (_key, entry) => entry && typeof entry === "object" && !Array.isArray(entry) ? Object.fromEntries(Object.keys(entry).sort().map((key) => [key, entry[key]])) : entry);
const baseline = ${JSON.stringify(canonicalJson(before))};
if (canonical(schCapture()) !== baseline) throw new Error("SCH_NATIVE_BASELINE_CHANGED");
const targetId = ${JSON.stringify(targetId)};
const model = schDoc.shapeManager.idManager.get(targetId);
if (!model || model.id !== targetId || model.cmdKey !== "part" || (model.locked !== false && model.locked !== undefined) || typeof model.transformToCore !== "function" || typeof model.getOrCreateAttr !== "function") throw new Error("SCH_NATIVE_TARGET_INVALID");
const runner = schDoc.shapeManager.actionRunner;
if (!runner || typeof runner.run !== "function") throw new Error("SCH_NATIVE_RUNNER_MISSING");
const attributes = ${JSON.stringify(attributes)};
const pose = ${JSON.stringify(pose)};
await runner.run(() => {
  schCheck();
  if (canonical(schCapture()) !== baseline) throw new Error("SCH_NATIVE_BASELINE_CHANGED");
  if (Object.keys(pose).length) {
    const x = Object.hasOwn(pose, "x") ? pose.x : model.origin.x;
    const y = Object.hasOwn(pose, "y") ? -pose.y : model.origin.y;
    const origin = model.origin.add1(x-model.origin.x, y-model.origin.y);
    model.transformToCore({ origin, rotation: Object.hasOwn(pose, "rotation") ? pose.rotation : model.rotation, isMirror: Object.hasOwn(pose, "mirror") ? pose.mirror : model.isMirror });
  }
  for (const [key,value] of Object.entries(attributes)) {
    const attr = model.getOrCreateAttr(key);
    if (!attr || typeof attr.setValue !== "function" || attr.setValue(value, binding.tabId) !== true) throw new Error("SCH_NATIVE_ATTRIBUTE_REJECTED");
  }
});
schCheck();
return { primitiveId: targetId, snapshot: schCapture() };
})()`;
}
