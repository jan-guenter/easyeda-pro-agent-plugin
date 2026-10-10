import { canonicalJson, sha256Json } from "./core.ts";
import type { NativeSourceObject, NativeSourceSnapshot } from "./document-source.ts";
import { isNativeDocumentDeleted } from "./native-history.ts";
import type { NativeHistorySnapshot, NativeObjectSnapshot } from "./native-history.ts";
import type { SchematicNativeComponent, SchematicNativeSnapshot } from "./schematic-native-adapter.ts";

type Point = readonly [number, number];
interface Binding { model: SchematicNativeComponent; pin: SchematicNativeComponent["pins"][number]; local: Point; origin: Point; rotation: number; reconstructed: Point; symbolSha256: string; }
export interface StoredPinCoordinateProof {
  readonly componentId: string; readonly attributeId: string; readonly symbolSha256: string; readonly checkpointSha256: string;
  readonly stored: Point; readonly compared: Point; readonly origins: readonly Point[];
  readonly profile: "pinned-pin-model-ignores-stored-position" | "pinned-quarter-turn-displaced-pin-number";
  readonly recenter?: { readonly profile: "pinned-quarter-turn-reconstructed-origin-recenter"; readonly translationOrigin: Point };
}
const same = (a: unknown, b: unknown): boolean => canonicalJson({ value: a }) === canonicalJson({ value: b });
function fail(): never { throw new Error("Stored pin-number coordinates lack exact native library/constructor proof."); }
function point(body: Record<string, unknown>): Point {
  const x = body["x"], y = body["y"];
  if (typeof x !== "number" || typeof y !== "number" || !Number.isFinite(x) || !Number.isFinite(y)) { fail(); }
  return [x, y];
}
function moved(at: Point, before: Point, after: Point): Point { return [at[0] + (after[0] - before[0]), at[1] + (after[1] - before[1])]; }
const translate = (x: number, y: number): number[] => [1, 0, 0, 0, 1, 0, x, y, 1];
function multiply(a: readonly number[], b: readonly number[]): number[] {
  const result: number[] = [];
  for (let row = 0; row < 3; row += 1) { for (let column = 0; column < 3; column += 1) {
    let sum = 0;
    for (let inner = 0; inner < 3; inner += 1) { sum += Number(a[row * 3 + inner]) * Number(b[inner * 3 + column]); }
    result.push(sum);
  } }
  return result;
}
/** Wb.getDataForTransformTo (6196185), Vt.setOrigin and MP.mul use this
 * Operation order: translate from the zero library canvas, rotate around the
 * New component origin, then multiply the local point. No rounding is used.
 */
function constructorPoint(local: Point, origin: Point, rotation: number): Point {
  let matrix = translate(origin[0], origin[1]);
  if (rotation !== 0) {
    const angle = -rotation * Math.PI / 180, cosine = Math.cos(angle), sine = Math.sin(angle);
    const around = multiply(multiply(translate(-origin[0], -origin[1]), [cosine, sine, 0, -sine, cosine, 0, 0, 0, 1]), translate(origin[0], origin[1]));
    matrix = multiply(matrix, around);
  }
  return [local[0] * Number(matrix[0]) + local[1] * Number(matrix[3]) + Number(matrix[6]),
    local[0] * Number(matrix[1]) + local[1] * Number(matrix[4]) + Number(matrix[7])];
}
function documentHash(doc: NativeHistorySnapshot["documents"][number]): string {
  return sha256Json({ uuid: doc.uuid, docType: doc.docType, metadata: doc.metadata,
    records: doc.records.map(({ id, type, body }) => ({ id, type, body })) });
}

/** Compose a typed translation from the original saved constructor with a
 * later 90-degree native reconstruction. Neither side is rounded. This is
 * needed when the new origin itself reconstructs to a different fixed point.
 */
export function proveQuarterTurnPinDisplacement(history: NativeHistorySnapshot, referenceSource: NativeSourceSnapshot,
  observedSource: NativeSourceSnapshot, prior: SchematicNativeComponent, model: SchematicNativeComponent,
  oldPin: SchematicNativeComponent["pins"][number], pin: SchematicNativeComponent["pins"][number]): {
    originalOrigin: Point; priorOrigin: Point; currentOrigin: Point; translationOrigin: Point; recentered: boolean; symbolSha256: string;
  } {
  const currentOrigin = point(model.body), priorOrigin = point(prior.body);
  const page = history.documents.find((doc) => doc.uuid === referenceSource.document["uuid"] && doc.docType === "SCH_PAGE" && !isNativeDocumentDeleted(doc));
  const original = page?.records.find((row) => row.type === "COMPONENT" && row.id === model.id);
  const oldSymbols = prior.attributes.filter((attr) => attr.key === "Symbol"), symbols = model.attributes.filter((attr) => attr.key === "Symbol");
  const symbolId = oldSymbols[0]?.value;
  const symbol = history.documents.find((doc) => doc.uuid === symbolId && doc.docType === "SYMBOL" && !isNativeDocumentDeleted(doc));
  if (prior.id !== model.id || prior.kind !== "part" || model.kind !== "part" || model.body["rotation"] !== 90 || model.body["isMirror"] !== false ||
      !same({ ...model.body, x: priorOrigin[0], y: priorOrigin[1] }, prior.body) ||
      referenceSource.document["editVersion"] !== "3.2.149.88089769" || observedSource.document["editVersion"] !== "3.2.149.88089769" ||
      referenceSource.document["uuid"] !== observedSource.document["uuid"] ||
      same(priorOrigin, currentOrigin) || !same(constructorPoint([0, 0], priorOrigin, 90), currentOrigin) ||
      !same(constructorPoint([0, 0], currentOrigin, 90), currentOrigin) ||
      page === undefined || page.semanticSha256 !== documentHash(page) || original === undefined ||
      original.body["rotation"] !== 90 || original.body["isMirror"] !== false || original.body["partId"] !== model.body["partId"] ||
      oldSymbols.length !== 1 || symbols.length !== 1 || !same(oldSymbols[0], symbols[0]) || typeof symbolId !== "string" || oldSymbols[0]?.body["value"] !== symbolId ||
      !page.records.some((row) => row.type === "ATTR" && row.body["parentId"] === model.id && row.body["key"] === "Symbol" && row.body["value"] === symbolId) ||
      symbol === undefined || symbol.semanticSha256 !== documentHash(symbol) ||
      !same(symbol.records.find((row) => row.type === "CANVAS")?.body, { originX: 0, originY: 0 }) ||
      !symbol.records.some((row) => row.type === "PART" && row.id === model.body["partId"])) { fail(); }
  const locals = symbol.records.filter((row) => row.type === "PIN" && row.body["partId"] === model.body["partId"] && `${model.id}-${row.id}` === pin.id);
  const local = locals[0], originalOrigin = point(original.body);
  if (locals.length !== 1 || local === undefined) { fail(); }
  const originalPin = constructorPoint(point(local.body), originalOrigin, 90);
  if (oldPin.id !== pin.id || oldPin.net !== pin.net ||
      !same({ ...pin.body, x: oldPin.body["x"], y: oldPin.body["y"] }, oldPin.body) ||
      pin.body["rotation"] !== (Number(local.body["rotation"]) + 90) % 360 ||
      !same(point(pin.body), constructorPoint(point(local.body), currentOrigin, 90))) { fail(); }
  let translationOrigin = originalOrigin;
  const recentered = !same(point(oldPin.body), moved(originalPin, originalOrigin, priorOrigin));
  if (recentered) {
    // A later typed move can return an already reconstructed part to its
    // Unchanged saved origin. Bind that exact complete saved body and the
    // Stable constructor origin before using it as the translation start.
    const reconstructedOrigin = constructorPoint([0, 0], originalOrigin, 90);
    if (!same(original.body, prior.body) || same(originalOrigin, reconstructedOrigin) ||
        !same(reconstructedOrigin, currentOrigin) ||
        !same(point(oldPin.body), moved(originalPin, reconstructedOrigin, priorOrigin))) { fail(); }
    translationOrigin = reconstructedOrigin;
    if (oldPin.noConnect !== null || pin.noConnect !== null) {
      const old = oldPin.noConnect;
      const current = pin.noConnect;
      const markers = page.records.filter((row) => row.type === "ATTR" && row.id === old?.id);
      const marker = markers[0];
      if (old === null || current === null || old.id !== current.id || old.value !== "no" || current.value !== "no" ||
          old.body["key"] !== "NO_CONNECT" || old.body["value"] !== "no" || old.body["parentId"] !== oldPin.id ||
          markers.length !== 1 || marker === undefined || !same(marker.body, old.body) ||
          !same(old, { ...current, body: { ...current.body, x: old.body["x"], y: old.body["y"] } }) ||
          !same(point(old.body), point(oldPin.body)) || !same(point(current.body), point(pin.body))) { fail(); }
    }
  }
  return { originalOrigin, priorOrigin, currentOrigin, translationOrigin, recentered, symbolSha256: symbol.semanticSha256 };
}

/** Stored Pin Number is not an unstored inherited attribute. Prove and align
 * this composed case before the component-origin pass changes the pin pose.
 * The ordinary stored-position and durable-write guards remain separate.
 */
export function alignDisplacedStoredPinNumberCoordinates(history: NativeHistorySnapshot, referenceSource: NativeSourceSnapshot,
  observedSource: NativeSourceSnapshot, reference: SchematicNativeSnapshot, observed: SchematicNativeSnapshot,
  records: Map<string, NativeSourceObject>): readonly StoredPinCoordinateProof[] {
  const changes: StoredPinCoordinateProof[] = [];
  const align = (before: NativeSourceObject): void => {
    const after = records.get(before.id);
    // Unchanged nullable coordinates require no arithmetic or reconstruction.
    if (after === undefined || (same(before.body["x"], after.body["x"]) && same(before.body["y"], after.body["y"]))) { return; }
    const prior = reference.components.find((model) => model.pins.some((pin) => pin.id === before.body["parentId"]));
    const model = observed.components.find((entry) => entry.id === prior?.id);
    if (prior === undefined || model === undefined || same(point(prior.body), point(model.body))) { return; }
    const bound = bind(history, observedSource, observed, after), oldPin = prior.pins.find((pin) => pin.id === bound.pin.id);
    if (oldPin === undefined) { fail(); }
    const proof = proveQuarterTurnPinDisplacement(history, referenceSource, observedSource, prior, model, oldPin, bound.pin);
    const oldAttrs = oldPin.attributes.filter((attr) => attr.id === before.id && attr.key === "Pin Number");
    const attrs = bound.pin.attributes.filter((attr) => attr.id === before.id && attr.key === "Pin Number");
    const attr = attrs[0], old = oldAttrs[0];
    const page = history.documents.find((doc) => doc.uuid === referenceSource.document["uuid"] && doc.docType === "SCH_PAGE");
    const originals = page?.records.filter((row) => row.id === before.id && row.type === "ATTR" && row.body["parentId"] === oldPin.id && row.body["key"] === "Pin Number");
    const original = originals?.[0], originalLabel = constructorPoint(bound.local, proof.originalOrigin, 90);
    const translatedLabel = moved(originalLabel, proof.translationOrigin, proof.priorOrigin);
    if (oldAttrs.length !== 1 || attrs.length !== 1 || originals?.length !== 1 || old === undefined || attr === undefined || original === undefined ||
        !same(old.body, before.body) || !same(attr.body, after.body) ||
        !same(old, { ...attr, body: { ...attr.body, x: old.body["x"], y: old.body["y"] } }) ||
        !same({ ...after.body, x: before.body["x"], y: before.body["y"] }, before.body) ||
        !same({ ...original.body, x: before.body["x"], y: before.body["y"] }, before.body) ||
        !same(point(original.body), proof.recentered ? translatedLabel : originalLabel) ||
        !same(point(before.body), translatedLabel) ||
        !same(point(after.body), bound.reconstructed)) { fail(); }
    const beforeCoordinates = point(before.body);
    attr.body["x"] = beforeCoordinates[0]; attr.body["y"] = beforeCoordinates[1];
    after.body["x"] = beforeCoordinates[0]; after.body["y"] = beforeCoordinates[1];
    changes.push({ componentId: model.id, attributeId: before.id, symbolSha256: proof.symbolSha256, checkpointSha256: history.checkpointSha256,
      stored: beforeCoordinates, compared: bound.reconstructed, origins: [proof.originalOrigin, proof.priorOrigin, proof.currentOrigin], profile: "pinned-quarter-turn-displaced-pin-number",
      ...(proof.recentered ? { recenter: { profile: "pinned-quarter-turn-reconstructed-origin-recenter" as const, translationOrigin: proof.translationOrigin } } : {}) });
  };
  for (const before of referenceSource.objects.filter((row) => row.type === "ATTR" && row.body["key"] === "Pin Number")) { align(before); }
  return changes;
}
function bind(history: NativeHistorySnapshot, source: NativeSourceSnapshot, native: SchematicNativeSnapshot, row: NativeSourceObject): Binding {
  const owners = native.components.filter((model) => model.pins.some((pin) => pin.id === row.body["parentId"]));
  const model = owners[0], pin = model?.pins.find((entry) => entry.id === row.body["parentId"]);
  const attrs = pin?.attributes.filter((entry) => entry.key === "Pin Number" && entry.id === row.id);
  const attr = attrs?.[0];
  const symbolId = model?.attributes.find((entry) => entry.key === "Symbol")?.value;
  const symbol = history.documents.find((doc) => doc.uuid === symbolId && doc.docType === "SYMBOL" && !isNativeDocumentDeleted(doc));
  const rotation = model?.body["rotation"];
  if (owners.length !== 1 || model?.kind !== "part" || ![0, 90, 180, 270].includes(Number(rotation)) || model.body["isMirror"] !== false ||
      row.type !== "ATTR" || row.body["key"] !== "Pin Number" || attrs?.length !== 1 || attr === undefined || pin === undefined ||
      source.document["editVersion"] !== "3.2.149.88089769" || symbol === undefined || typeof symbolId !== "string" || typeof rotation !== "number" ||
      symbol.semanticSha256 !== sha256Json({ uuid: symbol.uuid, docType: symbol.docType, metadata: symbol.metadata,
        records: symbol.records.map(({ id, type, body }) => ({ id, type, body })) }) ||
      !same(symbol.records.find((entry) => entry.type === "CANVAS")?.body, { originX: 0, originY: 0 })) { fail(); }
  const localPins = symbol.records.filter((entry) => entry.type === "PIN" && entry.body["partId"] === model.body["partId"] && `${model.id}-${entry.id}` === pin.id);
  const localPin = localPins[0];
  const locals = symbol.records.filter((entry) => entry.type === "ATTR" && entry.body["partId"] === model.body["partId"] &&
    entry.body["parentId"] === localPin?.id && entry.body["key"] === "Pin Number");
  const localAttr = locals[0], origin = point(model.body);
  if (localPins.length !== 1 || locals.length !== 1 || localPin === undefined || localAttr === undefined || attr.symbolValue !== localAttr.body["value"] ||
      attr.body["value"] !== row.body["value"] || !same(point(pin.body), constructorPoint(point(localPin.body), origin, rotation)) ||
      pin.body["rotation"] !== (Number(localPin.body["rotation"]) + rotation) % 360) { fail(); }
  const local = point(localAttr.body);
  return { model, pin, local, origin, rotation, reconstructed: constructorPoint(local, origin, rotation), symbolSha256: symbol.semanticSha256 };
}

/** The pinned loader excludes x/y for parent instanceof Jn (PinModel) in
 * handleSchAttrCover, sch.js4630100/5661395. Reconstruct from the exact bound
 * Library and pose instead; preserve every other stored field for strict
 * Storage verification. This classifies unused legacy values, not a tolerance.
 * The separate write guard below forbids hiding newly changed durable values.
 */
export function projectStoredPinNumberCoordinates(history: NativeHistorySnapshot, source: NativeSourceSnapshot,
  native: SchematicNativeSnapshot, stored: NativeObjectSnapshot, exported: NativeSourceObject): { row: NativeObjectSnapshot; proof: StoredPinCoordinateProof } {
  const bound = bind(history, source, native, exported);
  if (!same(point(exported.body), bound.reconstructed) || stored.id !== exported.id || stored.type !== "ATTR" ||
      stored.body["key"] !== "Pin Number" || stored.body["parentId"] !== exported.body["parentId"]) { fail(); }
  return { row: { ...stored, body: { ...stored.body, x: exported.body["x"], y: exported.body["y"] } }, proof: {
    componentId: bound.model.id, attributeId: stored.id, symbolSha256: bound.symbolSha256, checkpointSha256: history.checkpointSha256,
    stored: point(stored.body), compared: bound.reconstructed, origins: [bound.origin], profile: "pinned-pin-model-ignores-stored-position" } };
}

export function verifyStoredPinNumberWrites(before: NativeHistorySnapshot, after: NativeHistorySnapshot,
  observed: NativeSourceSnapshot, typed: NativeSourceSnapshot): void {
  const newPage = after.documents.find((doc) => doc.uuid === observed.document["uuid"]), oldPage = before.documents.find((doc) => doc.uuid === observed.document["uuid"]);
  if (oldPage === undefined || newPage === undefined) { fail(); }
  for (const row of newPage.records.filter((entry) => entry.type === "ATTR" && entry.body["key"] === "Pin Number")) {
    const prior = oldPage.records.find((entry) => entry.id === row.id);
    if (prior !== undefined && (!same(prior.body["x"], row.body["x"]) || !same(prior.body["y"], row.body["y"]))) {
      const captured = observed.objects.find((entry) => entry.id === row.id), intended = typed.objects.find((entry) => entry.id === row.id);
      if (captured?.type !== "ATTR" || intended?.type !== "ATTR" ||
          (!same(point(row.body), point(captured.body)) && !same(point(row.body), point(intended.body)))) {
        throw new Error("Durable Pin Number position is neither retained nor the exact typed/native write.");
      }
    }
  }
}

/** Effect proof admits only exact translated/recreated arithmetic. */
export function alignStoredPinNumberCoordinates(history: NativeHistorySnapshot, referenceSource: NativeSourceSnapshot,
  observedSource: NativeSourceSnapshot, reference: SchematicNativeSnapshot, observed: SchematicNativeSnapshot,
  records: Map<string, NativeSourceObject>): readonly StoredPinCoordinateProof[] {
  const changes: StoredPinCoordinateProof[] = [];
  for (const before of referenceSource.objects.filter((row) => row.type === "ATTR" && row.body["key"] === "Pin Number")) {
    const after = records.get(before.id);
    if (after !== undefined && (!same(before.body["x"], after.body["x"]) || !same(before.body["y"], after.body["y"]))) {
      const bound = bind(history, observedSource, observed, after), priorBound = bind(history, referenceSource, reference, before);
      const original = history.documents.find((doc) => doc.uuid === referenceSource.document["uuid"])?.records.find((row) => row.id === bound.model.id && row.type === "COMPONENT");
      if (original === undefined || original.body["rotation"] !== bound.rotation || original.body["isMirror"] !== false || original.body["partId"] !== bound.model.body["partId"]) { fail(); }
      const originalOrigin = point(original.body);
      const originalLabel = constructorPoint(bound.local, originalOrigin, bound.rotation);
      if (!same(bound.model.body, priorBound.model.body) || !same(bound.pin.body, priorBound.pin.body) ||
          !same({ ...after.body, x: before.body["x"], y: before.body["y"] }, before.body) ||
          !same(point(before.body), moved(originalLabel, originalOrigin, bound.origin)) || !same(point(after.body), bound.reconstructed)) { fail(); }
      const attr = bound.pin.attributes.find((entry) => entry.id === before.id); if (attr === undefined) { fail(); }
      const beforeCoordinates = point(before.body);
      attr.body["x"] = beforeCoordinates[0]; attr.body["y"] = beforeCoordinates[1];
      after.body["x"] = before.body["x"]; after.body["y"] = before.body["y"];
      changes.push({ componentId: bound.model.id, attributeId: before.id, symbolSha256: bound.symbolSha256, checkpointSha256: history.checkpointSha256,
        stored: beforeCoordinates, compared: bound.reconstructed, origins: [originalOrigin, bound.origin], profile: "pinned-pin-model-ignores-stored-position" });
    }
  }
  return changes;
}
