import { z } from "zod";
import { canonicalJson, sha256Json } from "./core.ts";
import { buildReviewedNativeSourceMerge } from "./design-native-adapter.ts";
import type { DesignNativeAdapter } from "./design-native-adapter.ts";
import { compareDocumentSources } from "./document-source.ts";
import type { NativeSourceDelta, NativeSourceObject, NativeSourceSnapshot } from "./document-source.ts";
import { footprintScopeSchema } from "./footprint-action.ts";
import type { FootprintScope } from "./footprint-action.ts";

export const MODEL_TRANSFORM_ACTION_PROFILE = "easyeda-pro-control.model-transform.v1";
const id = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$/u);
const nativeId = z.string().min(1).max(256);
const linearMil = z.number().min(-10_000_000).max(10_000_000);
const distance = z.object({ x: linearMil, y: linearMil, z: linearMil }).strict();
const dimension = z.number().nonnegative().max(10_000_000);
// Native real-model scaling ignores zero axes when selecting positive finite
// Dimension/bounding-box ratios. Preserve those zeros, including mixed forms.
const dimensions = z.object({ x: dimension, y: dimension, z: dimension }).strict();
const angle = z.number().min(-360_000).max(360_000);
const rotation = z.object({ x: angle, y: angle, z: angle }).strict();
const coefficient = z.number().min(-1_000_000).max(1_000_000);
const columnMajor = z.tuple([coefficient, coefficient, coefficient, coefficient, coefficient, coefficient, coefficient, coefficient, coefficient]);

/** Native linear fields are mil, not mm or internal 10-mil canvas units.
 * V2 stores the 3x3 linear matrix by columns followed by translation in mil:
 * [m00,m10,m20,m01,m11,m21,m02,m12,m22,tx,ty,tz]. No matrix decomposition,
 * rotation normalization or inferred origin adjustment occurs here.
 */
export const modelTransformSchema = z.discriminatedUnion("format", [
  z.object({ format: z.literal("legacy"), dimensionsMil: dimensions, rotationDegrees: rotation, offsetMil: distance }).strict(),
  z.object({ format: z.literal("affine-v2"), linearColumnMajor: columnMajor, translationMil: distance }).strict(),
]);
export type ModelTransform = z.infer<typeof modelTransformSchema>;
export const modelTransformOperationSchema = z.discriminatedUnion("action", [
  z.object({ id, action: z.literal("pcb.component.model-transform"), target: z.object({ primitiveId: nativeId }).strict(), attributeId: nativeId, transform: modelTransformSchema }).strict(),
  z.object({ id, action: z.literal("footprint.model-transform"), attributeId: nativeId, transform: modelTransformSchema }).strict(),
]);
export type ModelTransformOperation = z.infer<typeof modelTransformOperationSchema>;
export interface CompiledModelTransformOperation {
  readonly profile: typeof MODEL_TRANSFORM_ACTION_PROFILE;
  readonly id: string;
  readonly action: ModelTransformOperation["action"];
  readonly documentType: 3 | 4;
  readonly resultKind: "boolean";
  readonly operation: ModelTransformOperation;
}
export function compileModelTransformOperation(input: unknown): CompiledModelTransformOperation {
  const operation = modelTransformOperationSchema.parse(input);
  return { profile: MODEL_TRANSFORM_ACTION_PROFILE, id: operation.id, action: operation.action,
    documentType: operation.action === "pcb.component.model-transform" ? 3 : 4, resultKind: "boolean", operation };
}
export function encodeModelTransform(input: unknown): string {
  const transform = modelTransformSchema.parse(input);
  if (transform.format === "affine-v2") {
    return `v2:${JSON.stringify([...transform.linearColumnMajor, transform.translationMil.x, transform.translationMil.y, transform.translationMil.z])}`;
  }
  const size = transform.dimensionsMil;
  const rotate = transform.rotationDegrees;
  const offset = transform.offsetMil;
  return [size.x, size.y, size.z, rotate.z, rotate.x, rotate.y, offset.x, offset.y, offset.z].join(",");
}
/** Used for bounded baseline validation and exact inverse construction only.
 * The operation schema never accepts caller-supplied encoded source text.
 */
export function decodeModelTransform(value: unknown): ModelTransform {
  if (typeof value !== "string" || value.length === 0 || value.length > 4096) { throw new Error("Model transform baseline must be a bounded native string."); }
  const text = value.trim();
  if (text.startsWith("v2:")) {
    const values: unknown = JSON.parse(text.slice(3));
    if (!Array.isArray(values) || values.length !== 12 || values.some((entry) => typeof entry !== "number" || !Number.isFinite(entry))) {
      throw new Error("Native v2 model transform requires exactly twelve finite numbers.");
    }
    const numbers: readonly unknown[] = values;
    return modelTransformSchema.parse({ format: "affine-v2", linearColumnMajor: numbers.slice(0, 9),
      translationMil: { x: numbers[9], y: numbers[10], z: numbers[11] } });
  }
  const fields = text.split(",");
  if (fields.length !== 9 || fields.some((entry) => !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/iu.test(entry.trim()))) {
    throw new Error("Native legacy model transform requires exactly nine numeric fields.");
  }
  const values = fields.map(Number);
  return modelTransformSchema.parse({ format: "legacy", dimensionsMil: { x: values[0], y: values[1], z: values[2] },
    rotationDegrees: { x: values[4], y: values[5], z: values[3] }, offsetMil: { x: values[6], y: values[7], z: values[8] } });
}

function assertSource(source: NativeSourceSnapshot): ReadonlyMap<string, NativeSourceObject> {
  if (source.schema !== "easyeda-pro-control.document-source.v1" || source.document["docType"] !== "PCB" ||
      source.document["editVersion"] !== "3.2.149.88089769" || typeof source.document["uuid"] !== "string" || !source.document["uuid"] ||
      source.sha256 !== sha256Json({ schema: source.schema, document: source.document, objects: source.objects })) {
    throw new Error("Model transform requires the exact supported native source baseline.");
  }
  const records = new Map<string, NativeSourceObject>();
  for (const record of source.objects) {
    if (!record.id || !record.type || records.has(record.id)) { throw new Error("Model transform source has missing or duplicate identities."); }
    records.set(record.id, record);
  }
  return records;
}
function assertUnlockedAncestry(record: NativeSourceObject, records: ReadonlyMap<string, NativeSourceObject>): void {
  let current: NativeSourceObject | undefined = record;
  const seen = new Set<string>();
  while (current !== undefined) {
    if (seen.has(current.id) || current.body["locked"] === true ||
        (current.body["locked"] !== undefined && typeof current.body["locked"] !== "boolean")) {
      throw new Error("Locked or ambiguous model-transform ancestry requires a separate explicit unlock.");
    }
    seen.add(current.id);
    const parent: unknown = current.body["parentId"];
    if (parent === undefined || parent === null || parent === "") { return; }
    if (typeof parent !== "string" || !records.has(parent)) { throw new Error("Model-transform parent identity is unresolved."); }
    current = records.get(parent);
  }
}
function selectedAttribute(operation: ModelTransformOperation, source: NativeSourceSnapshot): NativeSourceObject {
  const records = assertSource(source);
  const attribute = records.get(operation.attributeId);
  if (attribute === undefined || attribute.type !== "ATTR" || attribute.body["key"] !== "3D Model Transform" ||
      typeof attribute.body["value"] !== "string") { throw new Error("Model transform requires its exact existing stored ATTR identity and value."); }
  let parent: unknown;
  if (operation.action === "pcb.component.model-transform") {
    const component = records.get(operation.target.primitiveId);
    if (component?.type !== "COMPONENT" || component.body["locked"] !== false || attribute.body["parentId"] !== component.id) {
      throw new Error("Model transform does not belong to the selected unlocked PCB component.");
    }
    parent = component.id;
  } else {
    parent = attribute.body["parentId"];
    if (parent !== "" && parent !== null && parent !== undefined) { throw new Error("Footprint model transform must be a document-level attribute."); }
    const attributes = source.objects.filter((record) => record.type === "ATTR");
    const names = new Set<string>();
    for (const item of attributes) {
      const key = item.body["key"], owner = item.body["parentId"];
      if (typeof key !== "string" || (key !== "" && names.has(key)) || (owner !== "" && owner !== null && owner !== undefined)) {
        throw new Error("Footprint attributes would require implicit native repair.");
      }
      if (key !== "") { names.add(key); }
    }
    if (source.objects.some((record) => record.type === "COMPONENT" || record.type === "PAD_NET")) { throw new Error("Footprint model transform cannot contain placed PCB instances."); }
  }
  const siblings = source.objects.filter((record) => record.type === "ATTR" && record.body["parentId"] === parent && record.body["key"] === "3D Model Transform");
  if (siblings.length !== 1 || siblings[0]?.id !== attribute.id) { throw new Error("Model transform attribute identity is ambiguous."); }
  assertUnlockedAncestry(attribute, records);
  decodeModelTransform(attribute.body["value"]);
  return attribute;
}

export function expectedModelTransformSource(input: unknown, before: NativeSourceSnapshot): NativeSourceSnapshot {
  const operation = modelTransformOperationSchema.parse(input);
  const attribute = selectedAttribute(operation, before);
  const value = encodeModelTransform(operation.transform);
  const objects = before.objects.map((record) => record.id === attribute.id ?
    { id: record.id, type: record.type, body: { ...record.body, value } } : record);
  const result = { schema: before.schema, document: before.document, objects };
  return { ...result, sha256: sha256Json(result) };
}
export function verifyModelTransformSourceEffect(input: unknown, before: NativeSourceSnapshot, after: NativeSourceSnapshot): NativeSourceDelta {
  const expected = expectedModelTransformSource(input, before);
  if (canonicalJson(expected) !== canonicalJson(after)) { throw new Error("Model transform changed component pose, binding, geometry or unrelated records beyond its single ATTR value."); }
  const delta = compareDocumentSources(before, after);
  if (delta.documentChanged || delta.added.length > 0 || delta.removed.length > 0 || delta.changed.length > 1 ||
      delta.changed.some((entry) => canonicalJson(entry.fields) !== '["value"]')) {
    throw new Error("Model transform exceeds its single-value source effect.");
  }
  return delta;
}
export function inverseModelTransformOperation(input: unknown, before: NativeSourceSnapshot): ModelTransformOperation | undefined {
  const operation = modelTransformOperationSchema.parse(input);
  const attribute = selectedAttribute(operation, before);
  const inverse = modelTransformOperationSchema.parse({ ...operation, id: `inverse-${sha256Json(operation).slice(0, 32)}`, transform: decodeModelTransform(attribute.body["value"]) });
  const restored = expectedModelTransformSource(inverse, expectedModelTransformSource(operation, before));
  return canonicalJson(restored) === canonicalJson(before) ? inverse : undefined;
}

export function buildModelTransformAdapter(input: unknown, before: NativeSourceSnapshot, scopeInput?: FootprintScope): DesignNativeAdapter {
  const operation = modelTransformOperationSchema.parse(input);
  const expected = expectedModelTransformSource(operation, before);
  verifyModelTransformSourceEffect(operation, before, expected);
  const type = operation.action === "pcb.component.model-transform" ? 3 : 4;
  const adapter = buildReviewedNativeSourceMerge(before, expected, undefined, type);
  if (type === 3) { return adapter; }
  const scope = footprintScopeSchema.parse(scopeInput);
  const named = before.objects.find((record) => record.type === "ATTR" && record.body["key"] === "Footprint");
  if (scope.footprintUuid !== before.document["uuid"] || named?.body["value"] !== scope.footprintName) {
    throw new Error("Model-transform source and checkpoint-bound footprint scope disagree.");
  }
  const guard = `
const MODEL_FOOTPRINT_SCOPE = ${JSON.stringify(scope)};
const modelFootprintContext = await eda.dmt_SelectControl.getCurrentDocumentInfo();
if (Number(modelFootprintContext?.documentType) !== 4 || modelFootprintContext?.uuid !== MODEL_FOOTPRINT_SCOPE.footprintUuid || modelFootprintContext?.parentLibraryUuid !== MODEL_FOOTPRINT_SCOPE.metadataOwnerUuid || modelFootprintContext?.tabId !== MODEL_FOOTPRINT_SCOPE.footprintUuid + '@' + MODEL_FOOTPRINT_SCOPE.libraryUuid) throw new Error('Model transform footprint scope drift');
const modelFootprintIdentity = await eda.lib_Footprint.get(MODEL_FOOTPRINT_SCOPE.footprintUuid,MODEL_FOOTPRINT_SCOPE.libraryUuid);
if (modelFootprintIdentity?.uuid !== MODEL_FOOTPRINT_SCOPE.footprintUuid || modelFootprintIdentity?.libraryUuid !== MODEL_FOOTPRINT_SCOPE.metadataOwnerUuid || modelFootprintIdentity?.name !== MODEL_FOOTPRINT_SCOPE.footprintName) throw new Error('Model transform footprint identity drift');
`;
  return { ...adapter, code: guard + adapter.code };
}

export const MODEL_TRANSFORM_LIMITATIONS = Object.freeze([
  "Changes only one existing stored 3D Model Transform ATTR value; inherited or missing overrides are not materialized.",
  "Does not bind or replace a model, alter its source file, rebuild a footprint instance, or propagate library changes to placed components.",
  "Exact inverse is unavailable when re-encoding the previous native transform would change its original string formatting.",
  "Native source-merge restrictions on generated copper and other derived board records still apply.",
  "Mechanical seating, pin alignment and model bounding-box proof require the selected model and explicit geometry checks; this adapter proves the recorded transform only.",
]);
