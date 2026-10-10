import { canonicalJson, sha256Json } from "./core.ts";
import { parseDocumentSource } from "./document-source.ts";
import type { NativeSourceSnapshot } from "./document-source.ts";
import { normalizeSchematicNativeSnapshot } from "./schematic-native-adapter.ts";
import type { SchematicNativeComponent, SchematicNativeSnapshot } from "./schematic-native-adapter.ts";

type Attribute = SchematicNativeComponent["attributes"][number];
export interface SchematicLifecycleChange { readonly parentId: string; readonly key: string; readonly beforeId: string; readonly afterId: string; readonly beforeZ: number; readonly afterZ: number; readonly stored: boolean }
const same = (a: unknown, b: unknown): boolean => canonicalJson(a) === canonicalJson(b);
const sortAttributes = (attributes: Attribute[]): Attribute[] => attributes.toSorted((a, b) => a.id.localeCompare(b.id));
function order(attribute: Attribute): number {
  const value = attribute.body["zIndex"];
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) { throw new Error("Native lifecycle attribute order is invalid."); }
  return value;
}
function nonDrawing(attribute: Attribute): boolean { return attribute.body["x"] === null && attribute.body["y"] === null; }
function boundSource(native: SchematicNativeSnapshot): NativeSourceSnapshot {
  const source = parseDocumentSource(native.source);
  if (source.document["uuid"] !== native.document.documentUuid || source.document["docType"] !== "SCH_PAGE" || source.document["editVersion"] !== "3.2.149.88089769") { throw new Error("Schematic lifecycle source/version binding differs."); }
  const objects = new Map(source.objects.map((entry) => [entry.id, entry]));
  const sourceComponents = source.objects.filter((entry) => entry.type === "COMPONENT");
  if (!same(sourceComponents.map((entry) => entry.id).toSorted(), native.components.map((entry) => entry.id).toSorted())) { throw new Error("Lifecycle native component inventory differs from source."); }
  for (const model of native.components) {
    if (!same(objects.get(model.id)?.body, model.body)) { throw new Error("Lifecycle native component body differs from source."); }
    for (const attr of [...model.attributes, ...model.pins.flatMap((pin) => pin.attributes)]) {
      const stored = objects.get(attr.id);
      if (stored !== undefined && (stored.type !== "ATTR" || !same(stored.body, attr.body))) { throw new Error("Lifecycle native stored attribute differs from source."); }
    }
  }
  return source;
}
/** Eligibility is bound to the complete native/source pair, not a caller list.
 * Null x/y is the pinned renderer's non-drawing condition; values, visibility,
 * styles and every remaining body field still require exact durable comparison.
 */
export function schematicNonDrawingStoredAttributes(input: unknown): readonly { id: string; parentId: string; key: string; zIndex: number; sourceSha256: string; bodySha256: string }[] {
  const native = normalizeSchematicNativeSnapshot(input);
  const source = boundSource(native);
  const records = new Map(source.objects.map((entry) => [entry.id, entry]));
  return native.components.filter((entry) => entry.kind === "part").flatMap((model) => model.attributes.filter((attr) => nonDrawing(attr) && records.has(attr.id)).map((attr) => {
    if (attr.body["parentId"] !== model.id || attr.body["key"] !== attr.key) { throw new Error("Non-drawing stored attribute owner/key is inconsistent."); }
    return { id: attr.id, parentId: model.id, key: attr.key, zIndex: order(attr), sourceSha256: source.sha256, bodySha256: sha256Json(attr.body) };
  }));
}

interface AttributePairInput {
  readonly parentId: string;
  readonly before: readonly Attribute[];
  readonly after: readonly Attribute[];
  readonly beforeIds: ReadonlySet<string>;
  readonly afterIds: ReadonlySet<string>;
  readonly allowHiddenOrder: boolean;
}
function alignAttributes(input: AttributePairInput, changes: SchematicLifecycleChange[]): Attribute[] {
  const { before, after } = input;
  if (!same(before.map((entry) => entry.key).toSorted(), after.map((entry) => entry.key).toSorted())) { throw new Error("Lifecycle attribute key inventory changed."); }
  const hiddenBefore = before.filter((entry) => nonDrawing(entry));
  const hiddenAfter = after.filter((entry) => nonDrawing(entry));
  const hiddenPermutation = input.allowHiddenOrder && same(hiddenBefore.map((entry) => entry.key).toSorted(), hiddenAfter.map((entry) => entry.key).toSorted()) &&
    same(hiddenBefore.map((entry) => order(entry)).toSorted((a, b) => a - b), hiddenAfter.map((entry) => order(entry)).toSorted((a, b) => a - b));
  return sortAttributes(after.map((entry) => {
    const prior = before.find((candidate) => candidate.key === entry.key);
    if (prior === undefined || prior.body["parentId"] !== input.parentId || entry.body["parentId"] !== input.parentId || prior.body["key"] !== prior.key || entry.body["key"] !== entry.key) { throw new Error("Lifecycle attribute parent/key binding changed."); }
    const result = structuredClone(entry);
    const virtual = !input.beforeIds.has(prior.id) && !input.afterIds.has(entry.id);
    if (prior.id !== entry.id) {
      if (!virtual || !/^[a-f0-9]{16}$/u.test(prior.id) || !/^[a-f0-9]{16}$/u.test(entry.id) || input.beforeIds.has(entry.id) || input.afterIds.has(prior.id)) { throw new Error("Stored or malformed native attribute identity changed."); }
      result.id = prior.id;
    }
    const beforeZ = order(prior);
    const afterZ = order(entry);
    if (beforeZ !== afterZ) {
      if (!hiddenPermutation || !nonDrawing(prior) || !nonDrawing(entry)) { throw new Error("Drawing or non-permutation attribute order changed."); }
      result.body["zIndex"] = beforeZ;
    }
    if (prior.id !== entry.id || beforeZ !== afterZ) { changes.push({ parentId: input.parentId, key: entry.key, beforeId: prior.id, afterId: entry.id, beforeZ, afterZ, stored: !virtual }); }
    return result;
  }));
}

/** Pinned createSchSymbolWithTemplate reconstructs inherited ATTR identities,
 * appends device attributes after stored overrides, then recalculates child
 * zIndex. Only a permutation among null-position component attributes is
 * projected; the renderer's hasPosition predicate excludes those from drawing.
 * Raw inputs and commitments remain unchanged. This is not ordinary read equality.
 */
export function alignSchematicLifecyclePair(referenceInput: unknown, observedInput: unknown): {
  reference: SchematicNativeSnapshot; observed: SchematicNativeSnapshot; observedSource: NativeSourceSnapshot; changes: readonly SchematicLifecycleChange[];
} {
  const reference = normalizeSchematicNativeSnapshot(referenceInput);
  const observed = normalizeSchematicNativeSnapshot(observedInput);
  const beforeSource = boundSource(reference);
  const afterSource = boundSource(observed);
  if (reference.document.documentUuid !== observed.document.documentUuid || !same(beforeSource.document, afterSource.document)) { throw new Error("Lifecycle document identity or semantic header changed."); }
  if (!same(reference.components.map((entry) => entry.id), observed.components.map((entry) => entry.id))) { throw new Error("Lifecycle component inventory changed."); }
  const beforeIds = new Set(beforeSource.objects.map((entry) => entry.id));
  const afterIds = new Set(afterSource.objects.map((entry) => entry.id));
  const changes: SchematicLifecycleChange[] = [];
  for (const model of observed.components) {
    const previous = reference.components.find((entry) => entry.id === model.id);
    if (previous === undefined || previous.kind !== model.kind || !same(previous.pins.map((entry) => entry.id), model.pins.map((entry) => entry.id))) { throw new Error("Lifecycle component kind or physical pin identities changed."); }
    model.attributes = alignAttributes({ parentId: model.id, before: previous.attributes, after: model.attributes, beforeIds, afterIds, allowHiddenOrder: model.kind === "part" }, changes);
    for (const pin of model.pins) {
      const prior = previous.pins.find((entry) => entry.id === pin.id);
      if (prior === undefined) { throw new Error("Lifecycle physical pin disappeared."); }
      pin.attributes = alignAttributes({ parentId: pin.id, before: prior.attributes, after: pin.attributes, beforeIds, afterIds, allowHiddenOrder: false }, changes);
    }
  }
  const projected = structuredClone(afterSource);
  for (const change of changes.filter((entry) => entry.stored && entry.beforeZ !== entry.afterZ)) {
    const object = projected.objects.find((entry) => entry.id === change.afterId);
    if (object !== undefined) { object.body["zIndex"] = change.beforeZ; }
  }
  const observedSource = { ...projected, sha256: sha256Json({ schema: projected.schema, document: projected.document, objects: projected.objects }) };
  return { reference, observed, observedSource, changes };
}

export function verifySchematicLifecycleEquivalence(referenceSource: NativeSourceSnapshot, referenceNative: unknown, observedSource: NativeSourceSnapshot, observedNative: unknown): {
  readonly profile: "easyeda-pro-control.schematic-lifecycle-equivalence.v1"; readonly sourceBeforeSha256: string; readonly sourceAfterSha256: string; readonly changes: readonly SchematicLifecycleChange[];
} {
  const pair = alignSchematicLifecyclePair(referenceNative, observedNative);
  if (!same(parseDocumentSource(pair.reference.source), referenceSource) || !same(parseDocumentSource(normalizeSchematicNativeSnapshot(observedNative).source), observedSource)) { throw new Error("Independent source does not match lifecycle native records."); }
  if (!same(referenceSource, pair.observedSource) || !same(pair.reference.components, pair.observed.components)) { throw new Error("Schematic lifecycle changed content beyond proven inherited identity and non-drawing order."); }
  return { profile: "easyeda-pro-control.schematic-lifecycle-equivalence.v1", sourceBeforeSha256: referenceSource.sha256, sourceAfterSha256: observedSource.sha256, changes: pair.changes };
}
