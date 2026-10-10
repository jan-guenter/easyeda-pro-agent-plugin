import { canonicalJson, sha256Json } from "./core.ts";
import type { NativeSourceObject, NativeSourceSnapshot } from "./document-source.ts";
import { isNativeDocumentDeleted } from "./native-history.ts";
import type { NativeHistorySnapshot } from "./native-history.ts";
import type { SchematicNativeComponent, SchematicNativeSnapshot } from "./schematic-native-adapter.ts";
import { correlateSchematicNativeSource } from "./schematic-source-proof.ts";
import { alignDisplacedStoredPinNumberCoordinates, alignStoredPinNumberCoordinates, projectStoredPinNumberCoordinates, proveQuarterTurnPinDisplacement } from "./schematic-pin-number-coordinates.ts";
import type { StoredPinCoordinateProof } from "./schematic-pin-number-coordinates.ts";

const same = (a: unknown, b: unknown): boolean => canonicalJson({ value: a }) === canonicalJson({ value: b });
function number(value: unknown): number { if (typeof value !== "number" || !Number.isFinite(value)) { throw new TypeError("Schematic coordinate lifecycle requires finite values."); } return value; }
const translate = (a: number, b: number): number[] => [1, 0, 0, 0, 1, 0, a, b, 1];
function symbolEvidence(model: SchematicNativeComponent, history: NativeHistorySnapshot): { hash: string; rotation: 90 | 180 | 270 } {
  const symbolId = model.attributes.find((attr) => attr.key === "Symbol")?.body["value"];
  const symbol = history.documents.find((doc) => doc.uuid === symbolId && doc.docType === "SYMBOL" && !isNativeDocumentDeleted(doc));
  const rotation = model.body["rotation"];
  if (!((model.kind === "part" && rotation === 90) || (model.kind === "netport" && (rotation === 180 || rotation === 270))) || model.body["isMirror"] !== false || symbol === undefined ||
      !same(symbol.records.find((row) => row.type === "CANVAS")?.body, { originX: 0, originY: 0 }) || !symbol.records.some((row) => row.type === "PART" && row.id === model.body["partId"])) {
    throw new Error("Unreviewed schematic component coordinate reconstruction.");
  }
  const hash = sha256Json({ uuid: symbol.uuid, docType: symbol.docType, metadata: symbol.metadata, records: symbol.records.map(({ id, type, body }) => ({ id, type, body })) });
  if (hash !== symbol.semanticSha256) { throw new Error("Coordinate reconstruction library evidence changed."); }
  return { hash, rotation };
}
function multiply(a: readonly number[], b: readonly number[]): number[] {
  const result: number[] = [];
  for (let row = 0; row < 3; row += 1) {
    for (let column = 0; column < 3; column += 1) {
      let sum = 0;
      for (let inner = 0; inner < 3; inner += 1) { sum += number(a[row * 3 + inner]) * number(b[inner * 3 + column]); }
      result.push(sum);
    }
  }
  return result;
}
/** Exact MP.mul/Vt.setOrigin/Wb.getDataForTransformTo operation order from the
 * pinned native renderer, also used by netport's inherited transformToCore.
 * This is arithmetic reconstruction, never a coordinate tolerance.
 */
function reconstructionMatrix(x: number, y: number, degrees: 90 | 180 | 270): readonly number[] {
  // Native Br retains 270, then Wb negates it.
  // Substituting +90 changes floating-point results despite equivalent geometry.
  const angle = -degrees * Math.PI / 180, cosine = Math.cos(angle), sine = Math.sin(angle);
  const rotation = [cosine, sine, 0, -sine, cosine, 0, 0, 0, 1];
  const around = multiply(multiply(translate(-x, -y), rotation), translate(x, y));
  return multiply(translate(x, y), around);
}
function reconstructedOrigin(x: number, y: number, degrees: 90 | 180 | 270): readonly [number, number] {
  const result = reconstructionMatrix(x, y, degrees);
  return [number(result[6]), number(result[7])];
}
export function schematicQuarterTurnOrigin(x: number, y: number): readonly [number, number] { return reconstructedOrigin(x, y, 90); }
export function schematicHalfTurnOrigin(x: number, y: number): readonly [number, number] { return reconstructedOrigin(x, y, 180); }
export function schematicThreeQuarterTurnOrigin(x: number, y: number): readonly [number, number] { return reconstructedOrigin(x, y, 270); }
function alignInherited(prior: SchematicNativeComponent, model: SchematicNativeComponent, referenceIds: ReadonlySet<string>, records: ReadonlyMap<string, NativeSourceObject>, alignBody: (before: Record<string, unknown>, after: Record<string, unknown>) => void): void {
  for (const owner of [model, ...model.pins]) {
    const oldOwner = owner === model ? prior : prior.pins.find((pin) => pin.id === owner.id);
    if (oldOwner === undefined) { throw new Error("Coordinate reconstruction changed physical pin identity."); }
    if (owner !== model) { alignBody(oldOwner.body, owner.body); }
    for (const attr of owner.attributes) {
      const old = oldOwner.attributes.find((entry) => entry.key === attr.key && entry.body["parentId"] === attr.body["parentId"]);
      if (old === undefined) { throw new Error("Coordinate reconstruction changed inherited attribute identity."); }
      if (!referenceIds.has(old.id) && !records.has(attr.id)) { alignBody(old.body, attr.body); }
    }
  }
}

interface InheritedPinNameReconstruction {
  readonly componentId: string; readonly pinId: string; readonly key: "Pin Name"; readonly symbolSha256: string;
  readonly originalOrigin: readonly number[]; readonly currentOrigin: readonly number[]; readonly libraryPosition: readonly number[];
  readonly translated: readonly number[]; readonly reconstructed: readonly number[]; readonly beforeAttributeId: string; readonly afterAttributeId: string;
}
function documentHash(document: NativeHistorySnapshot["documents"][number]): string {
  return sha256Json({ uuid: document.uuid, docType: document.docType, metadata: document.metadata, records: document.records.map(({ id, type, body }) => ({ id, type, body })) });
}

interface InactiveNoConnectReconstruction {
  readonly profile: "pinned-quarter-turn-inactive-no-connect";
  readonly componentId: string; readonly pinId: string; readonly attributeId: string;
  readonly symbolSha256: string; readonly checkpointSha256: string;
  readonly before: readonly number[]; readonly reconstructed: readonly number[];
}
function alignDisplacedInactiveNoConnect(referenceSource: NativeSourceSnapshot, observedSource: NativeSourceSnapshot,
  prior: SchematicNativeComponent, model: SchematicNativeComponent, history: NativeHistorySnapshot,
  records: Map<string, NativeSourceObject>): InactiveNoConnectReconstruction[] {
  const proofs: InactiveNoConnectReconstruction[] = [];
  const align = (pin: SchematicNativeComponent["pins"][number]): void => {
    const oldPin = prior.pins.find((entry) => entry.id === pin.id);
    const current = pin.noConnect, old = oldPin?.noConnect;
    if (old === undefined || old === null || current === null ||
        (same(old.body["x"], current.body["x"]) && same(old.body["y"], current.body["y"]))) { return; }
    const after = records.get(current.id), before = referenceSource.objects.find((row) => row.id === old.id);
    const original = history.documents.find((doc) => doc.uuid === referenceSource.document["uuid"] && doc.docType === "SCH_PAGE")?.records.find((row) => row.id === old.id);
    if (oldPin === undefined || old.id !== current.id || old.value !== "no" || current.value !== "no" ||
        old.body["key"] !== "NO_CONNECT" || old.body["parentId"] !== oldPin.id || current.body["parentId"] !== pin.id ||
        old.body["value"] !== "no" || current.body["value"] !== "no" ||
        before?.type !== "ATTR" || after?.type !== "ATTR" || original?.type !== "ATTR" ||
        !same(before.body, old.body) || !same(after.body, current.body) ||
        !same(old, { ...current, body: { ...current.body, x: old.body["x"], y: old.body["y"] } }) ||
        !same({ ...original.body, x: old.body["x"], y: old.body["y"] }, old.body) ||
        !same([old.body["x"], old.body["y"]], [oldPin.body["x"], oldPin.body["y"]]) ||
        !same([current.body["x"], current.body["y"]], [pin.body["x"], pin.body["y"]])) {
      throw new Error("Inactive no-connect coordinate lacks its exact stored source/native pin binding.");
    }
    const proof = proveQuarterTurnPinDisplacement(history, referenceSource, observedSource, prior, model, oldPin, pin);
    const beforePoint = [number(old.body["x"]), number(old.body["y"])] as const, reconstructed = [number(current.body["x"]), number(current.body["y"])];
    current.body["x"] = beforePoint[0]; current.body["y"] = beforePoint[1];
    after.body["x"] = beforePoint[0]; after.body["y"] = beforePoint[1];
    proofs.push({ profile: "pinned-quarter-turn-inactive-no-connect", componentId: model.id, pinId: pin.id, attributeId: old.id,
      symbolSha256: proof.symbolSha256, checkpointSha256: history.checkpointSha256, before: beforePoint, reconstructed });
  };
  for (const pin of model.pins) { align(pin); }
  return proofs;
}

interface QuarterTurnPinAttributeReconstruction {
  readonly profile: "pinned-unstored-quarter-turn-pin-attribute";
  readonly componentId: string; readonly pinId: string; readonly key: "Pin Name" | "Pin Number";
  readonly symbolSha256: string; readonly checkpointSha256: string;
  readonly originalOrigin: readonly number[]; readonly currentOrigin: readonly number[]; readonly libraryPosition: readonly number[];
  readonly originalConstructor: readonly number[]; readonly translated: readonly number[]; readonly reconstructed: readonly number[];
  readonly beforeAttributeId: string; readonly afterAttributeId: string;
}
function quarterTurnPoint(local: readonly number[], origin: readonly number[]): readonly [number, number] {
  const matrix = reconstructionMatrix(number(origin[0]), number(origin[1]), 90);
  // Native J.multiply3 uses left-to-right point products after Wb's full matrix.
  // Rotating around zero then adding the origin produces different floats.
  return [number(local[0]) * number(matrix[0]) + number(local[1]) * number(matrix[3]) + number(matrix[6]),
    number(local[0]) * number(matrix[1]) + number(local[1]) * number(matrix[4]) + number(matrix[7])];
}
/** The pinned loader transforms unstored Pin Name/Number attributes together
 * with their 90-degree symbol. A later presentation translation instead adds a
 * delta to the old constructor result. Prove those two complete arithmetic
 * paths, each affected physical pin and the immutable library binding. The
 * surrounding whole-native/topology proof still checks every other pin. This comparison
 * profile changes no source record and never permits stored coordinate writes.
 */
function alignQuarterTurnPinAttributes(referenceSource: NativeSourceSnapshot, observedSource: NativeSourceSnapshot,
  reference: SchematicNativeSnapshot, observed: SchematicNativeSnapshot, history: NativeHistorySnapshot): QuarterTurnPinAttributeReconstruction[] {
  const changes: QuarterTurnPinAttributeReconstruction[] = [];
  const beforeIds = new Set(referenceSource.objects.map((row) => row.id));
  const afterIds = new Set(observedSource.objects.map((row) => row.id));
  const alignAttribute = (model: SchematicNativeComponent, prior: SchematicNativeComponent, pin: SchematicNativeComponent["pins"][number], key: "Pin Name" | "Pin Number"): void => {
      const oldPin = prior.pins.find((entry) => entry.id === pin.id);
        const matches = pin.attributes.filter((entry) => entry.key === key), oldMatches = oldPin?.attributes.filter((entry) => entry.key === key);
        const attr = matches[0], old = oldMatches?.[0];
        if (old === undefined || attr === undefined || (same(old.body["x"], attr.body["x"]) && same(old.body["y"], attr.body["y"]))) { return; }
        const page = history.documents.find((entry) => entry.uuid === reference.document.documentUuid && entry.docType === "SCH_PAGE" && !isNativeDocumentDeleted(entry));
        const original = page?.records.find((row) => row.id === model.id && row.type === "COMPONENT");
        const symbolAttr = prior.attributes.find((entry) => entry.key === "Symbol"), symbolId = symbolAttr?.body["value"];
        const partId = model.body["partId"];
        const symbol = history.documents.find((entry) => entry.uuid === symbolId && entry.docType === "SYMBOL" && !isNativeDocumentDeleted(entry));
        if (prior.kind !== "part" || !same(prior.body, model.body) || model.body["isMirror"] !== false ||
            referenceSource.document["editVersion"] !== "3.2.149.88089769" || observedSource.document["editVersion"] !== "3.2.149.88089769" ||
            page === undefined || page.semanticSha256 !== documentHash(page) || original === undefined || original.body["rotation"] !== 90 || original.body["isMirror"] !== false || original.body["partId"] !== partId ||
            symbol === undefined || symbol.semanticSha256 !== documentHash(symbol) || !same(symbol.records.find((row) => row.type === "CANVAS")?.body, { originX: 0, originY: 0 }) ||
            !symbol.records.some((row) => row.type === "PART" && row.id === partId) || symbolAttr === undefined ||
            !same(symbolAttr, model.attributes.find((entry) => entry.key === "Symbol")) ||
            !page.records.some((row) => row.type === "ATTR" && row.body["parentId"] === model.id && row.body["key"] === "Symbol" && row.body["value"] === symbolId) ||
            matches.length !== 1 || oldMatches?.length !== 1 || beforeIds.has(old.id) || afterIds.has(attr.id) ||
            !/^[a-f0-9]{16}$/u.test(old.id) || !/^[a-f0-9]{16}$/u.test(attr.id) ||
            page.records.some((row) => row.type === "ATTR" && row.body["parentId"] === pin.id && row.body["key"] === key)) {
          throw new Error("Quarter-turn pin attribute lacks exact unstored component/library binding.");
        }
        const localPins = symbol.records.filter((row) => row.type === "PIN" && row.body["partId"] === partId && `${model.id}-${row.id}` === pin.id);
        const localPin = localPins[0];
        const localAttrs = symbol.records.filter((row) => row.type === "ATTR" && row.body["partId"] === partId && row.body["parentId"] === localPin?.id && row.body["key"] === key);
        const local = localAttrs[0];
        if (localPins.length !== 1 || localAttrs.length !== 1 || localPin === undefined || local === undefined || oldPin === undefined ||
            !same(oldPin.body, pin.body) || old.body["parentId"] !== pin.id || attr.body["parentId"] !== pin.id || old.symbolValue !== local.body["value"] ||
            old.blockValue !== null || old.instanceValue !== null || old.body["value"] !== null ||
            !same(old, { ...attr, id: old.id, body: { ...attr.body, x: old.body["x"], y: old.body["y"] } })) {
          throw new Error("Quarter-turn pin attribute changed pin identity, style, value or structure.");
        }
        const originalOrigin = [number(original.body["x"]), number(original.body["y"])];
        const currentOrigin = [number(model.body["x"]), number(model.body["y"])];
        const libraryPosition = [number(local.body["x"]), number(local.body["y"])];
        const originalConstructor = quarterTurnPoint(libraryPosition, originalOrigin), reconstructed = quarterTurnPoint(libraryPosition, currentOrigin);
        const translated = originalConstructor.map((value, index) => value + (number(currentOrigin[index]) - number(originalOrigin[index])));
        const physical = quarterTurnPoint([number(localPin.body["x"]), number(localPin.body["y"])], currentOrigin);
        if (!same([pin.body["x"], pin.body["y"]], physical) || pin.body["rotation"] !== (number(localPin.body["rotation"]) + 90) % 360 ||
            !same([old.body["x"], old.body["y"]], translated) || !same([attr.body["x"], attr.body["y"]], reconstructed)) {
          throw new Error("Quarter-turn pin attribute is not the exact translated/reconstructed library pair.");
        }
        attr.body["x"] = number(old.body["x"]); attr.body["y"] = number(old.body["y"]);
        changes.push({ profile: "pinned-unstored-quarter-turn-pin-attribute", componentId: model.id, pinId: pin.id, key,
          symbolSha256: symbol.semanticSha256, checkpointSha256: history.checkpointSha256,
          originalOrigin, currentOrigin, libraryPosition, originalConstructor, translated, reconstructed, beforeAttributeId: old.id, afterAttributeId: attr.id });
  };
  for (const model of observed.components.filter((entry) => entry.kind === "part" && entry.body["rotation"] === 90)) {
    const prior = reference.components.find((entry) => entry.id === model.id);
    if (prior !== undefined) { for (const pin of model.pins) { for (const key of ["Pin Name", "Pin Number"] as const) { alignAttribute(model, prior, pin, key); } } }
  }
  return changes;
}
/** Pinned createSchSymbolWithTemplate clones symbol-local pin attributes before
 * _handleSymbolData/transformToCore translates from the zero canvas origin.
 * A prior source-merge translation instead adds a delta to an already translated
 * float. Admit exactly these two arithmetic orders for unstored Pin Name attrs,
 * not a tolerance, origin change, physical pin adjustment or stored override.
 */
function alignInheritedPinNames(referenceSource: NativeSourceSnapshot, observedSource: NativeSourceSnapshot,
  reference: SchematicNativeSnapshot, observed: SchematicNativeSnapshot, history: NativeHistorySnapshot): InheritedPinNameReconstruction[] {
  const changes: InheritedPinNameReconstruction[] = [];
  const beforeIds = new Set(referenceSource.objects.map((row) => row.id));
  const afterIds = new Set(observedSource.objects.map((row) => row.id));
  const alignPin = (model: SchematicNativeComponent, prior: SchematicNativeComponent, pin: SchematicNativeComponent["pins"][number]): void => {
      const oldPin = prior.pins.find((entry) => entry.id === pin.id);
      const attr = pin.attributes.find((entry) => entry.key === "Pin Name");
      const old = oldPin?.attributes.find((entry) => entry.key === "Pin Name");
      if (old === undefined || attr === undefined || (same(old.body["x"], attr.body["x"]) && same(old.body["y"], attr.body["y"]))) { return; }
      const page = history.documents.find((entry) => entry.uuid === reference.document.documentUuid && entry.docType === "SCH_PAGE" && !isNativeDocumentDeleted(entry));
      const original = page?.records.find((row) => row.id === model.id && row.type === "COMPONENT"), symbolAttr = prior.attributes.find((entry) => entry.key === "Symbol");
      const symbolId = symbolAttr?.body["value"];
      const partId = model.body["partId"];
      const symbol = history.documents.find((entry) => entry.uuid === symbolId && entry.docType === "SYMBOL" && !isNativeDocumentDeleted(entry));
      if (model.kind !== "part" || prior.kind !== "part" || !same(prior.body, model.body) || model.body["rotation"] !== 0 || model.body["isMirror"] !== false ||
          referenceSource.document["editVersion"] !== "3.2.149.88089769" || observedSource.document["editVersion"] !== "3.2.149.88089769" ||
          page === undefined || page.semanticSha256 !== documentHash(page) || original === undefined || original.body["rotation"] !== 0 || original.body["isMirror"] !== false || original.body["partId"] !== partId ||
          symbol === undefined || symbol.semanticSha256 !== documentHash(symbol) || !same(symbol.records.find((row) => row.type === "CANVAS")?.body, { originX: 0, originY: 0 }) ||
          !symbol.records.some((row) => row.type === "PART" && row.id === partId) || symbolAttr === undefined ||
          !same(symbolAttr, model.attributes.find((entry) => entry.key === "Symbol")) ||
          !page.records.some((row) => row.type === "ATTR" && row.body["parentId"] === model.id && row.body["key"] === "Symbol" && row.body["value"] === symbolId) ||
          beforeIds.has(old.id) || afterIds.has(attr.id) || !/^[a-f0-9]{16}$/u.test(old.id) || !/^[a-f0-9]{16}$/u.test(attr.id)) {
        throw new Error("Inherited pin-name reconstruction lacks its exact unstored unrotated component/library binding.");
      }
      const localPins = symbol.records.filter((row) => row.type === "PIN" && row.body["partId"] === partId && `${model.id}-${row.id}` === pin.id);
      const localPin = localPins[0];
      const localAttrs = symbol.records.filter((row) => row.type === "ATTR" && row.body["partId"] === partId && row.body["parentId"] === localPin?.id && row.body["key"] === "Pin Name");
      const local = localAttrs[0];
      if (localPins.length !== 1 || localAttrs.length !== 1 || localPin === undefined || local === undefined || oldPin === undefined ||
          !same(oldPin.body, pin.body) || old.body["parentId"] !== pin.id || attr.body["parentId"] !== pin.id || old.symbolValue !== local.body["value"] ||
          !same(old, { ...attr, id: old.id, body: { ...attr.body, x: old.body["x"], y: old.body["y"] } })) {
        throw new Error("Inherited pin-name reconstruction changed pin identity, style, value or attribute structure.");
      }
      const originalOrigin = [number(original.body["x"]), number(original.body["y"])];
      const currentOrigin = [number(model.body["x"]), number(model.body["y"])];
      const libraryPosition = [number(local.body["x"]), number(local.body["y"])];
      const translated: number[] = [];
      const reconstructed: number[] = [];
      for (const [index, key] of ["x", "y"].entries()) {
        const originalValue = number(originalOrigin[index]);
        const currentValue = number(currentOrigin[index]);
        const localValue = number(libraryPosition[index]);
        const moved = (localValue + originalValue) + (currentValue - originalValue), reloaded = localValue + currentValue;
        if (old.body[key] !== moved || attr.body[key] !== reloaded || pin.body[key] !== number(localPin.body[key]) + currentValue) {
          throw new Error("Inherited pin-name coordinate is not the exact translated/reconstructed library pair.");
        }
        translated.push(moved); reconstructed.push(reloaded); attr.body[key] = old.body[key];
      }
      changes.push({ componentId: model.id, pinId: pin.id, key: "Pin Name", symbolSha256: symbol.semanticSha256, originalOrigin, currentOrigin, libraryPosition,
        translated, reconstructed, beforeAttributeId: old.id, afterAttributeId: attr.id });
  };
  for (const model of observed.components) {
    const prior = reference.components.find((entry) => entry.id === model.id);
    if (prior !== undefined) { for (const pin of model.pins) { alignPin(model, prior, pin); } }
  }
  return changes;
}

export function alignSchematicCoordinateLifecycle(referenceSource: NativeSourceSnapshot, referenceInput: unknown,
  observedSource: NativeSourceSnapshot, observedInput: unknown, history: NativeHistorySnapshot): {
    source: NativeSourceSnapshot; native: SchematicNativeSnapshot;
    proof: { profile: "easyeda-pro-control.schematic-coordinate-lifecycle.v1"; rawSourceSha256: string; rawNativeSha256: string; changes: readonly { componentId: string; symbolSha256: string; capturedComponentSha256: string; before: readonly number[]; reconstructed: readonly number[] }[]; inheritedPinNames: readonly InheritedPinNameReconstruction[]; quarterTurnPinAttributes: readonly QuarterTurnPinAttributeReconstruction[]; storedPinNumbers: readonly StoredPinCoordinateProof[]; inactiveNoConnects: readonly InactiveNoConnectReconstruction[] };
  } {
  const native = structuredClone(correlateSchematicNativeSource(observedSource, observedInput)), reference = correlateSchematicNativeSource(referenceSource, referenceInput);
  const rawNativeSha256 = sha256Json(native), records = new Map(observedSource.objects.map((row) => [row.id, structuredClone(row)]));
  const referenceIds = new Set(referenceSource.objects.map((row) => row.id));
  const rawComponents = new Map(native.components.map((model) => [model.id, sha256Json(model)]));
  const changes: { componentId: string; symbolSha256: string; capturedComponentSha256: string; before: readonly number[]; reconstructed: readonly number[] }[] = [];
  const displacedStoredPinNumbers = alignDisplacedStoredPinNumberCoordinates(history, referenceSource, observedSource, reference, native, records);
  const inactiveNoConnects: InactiveNoConnectReconstruction[] = [];
  for (const model of native.components) {
    const prior = reference.components.find((entry) => entry.id === model.id);
    if (prior !== undefined && (!same(prior.body["x"], model.body["x"]) || !same(prior.body["y"], model.body["y"]))) {
      if (prior.kind !== model.kind || prior.body["rotation"] !== model.body["rotation"] || prior.body["isMirror"] !== model.body["isMirror"] ||
          referenceSource.document["editVersion"] !== "3.2.149.88089769" || observedSource.document["editVersion"] !== "3.2.149.88089769") {
        throw new Error("Unreviewed schematic component coordinate reconstruction.");
      }
      const { hash: symbolSha256, rotation } = symbolEvidence(prior, history);
      const x = number(prior.body["x"]), y = number(prior.body["y"]);
      const mapped = reconstructedOrigin(x, y, rotation);
      const next = reconstructedOrigin(mapped[0], mapped[1], rotation);
      if (!same(mapped, [model.body["x"], model.body["y"]]) || !same(next, rotation === 180 ? [x, y] : mapped)) {
        throw new Error("Schematic component coordinate change is not the exact stable native matrix result.");
      }
      inactiveNoConnects.push(...alignDisplacedInactiveNoConnect(referenceSource, observedSource, prior, model, history, records));
      const deltas = [mapped[0] - x, mapped[1] - y];
      const alignBody = (before: Record<string, unknown>, after: Record<string, unknown>): void => {
        for (const [index, key] of ["x", "y"].entries()) {
          const value = before[key];
          if (value === null || value === undefined) {
            if (!same(value, after[key])) { throw new Error("Coordinate reconstruction changed inherited null position."); }
          } else {
            if (after[key] !== number(value) + number(deltas[index])) { throw new Error("Inherited coordinate differs from the exact component displacement."); }
            after[key] = value;
          }
        }
      };
      alignBody(prior.body, model.body);
      const row = records.get(model.id); if (row === undefined || row.type !== "COMPONENT") { throw new Error("Coordinate reconstruction lost its source component."); }
      row.body["x"] = x; row.body["y"] = y;
      alignInherited(prior, model, referenceIds, records, alignBody);
      const capturedComponentSha256 = rawComponents.get(model.id); if (capturedComponentSha256 === undefined) { throw new Error("Coordinate reconstruction lost its captured part hash."); }
      changes.push({ componentId: model.id, symbolSha256, capturedComponentSha256, before: [x, y], reconstructed: mapped });
    }
  }
  const quarterTurnPinAttributes = alignQuarterTurnPinAttributes(referenceSource, observedSource, reference, native, history);
  const inheritedPinNames = alignInheritedPinNames(referenceSource, observedSource, reference, native, history);
  const storedPinNumbers = [...displacedStoredPinNumbers, ...alignStoredPinNumberCoordinates(history, referenceSource, observedSource, reference, native, records)];
  const value = { schema: observedSource.schema, document: observedSource.document, objects: [...records.values()].toSorted((a, b) => a.id.localeCompare(b.id)) };
  const source = { ...value, sha256: sha256Json(value) };
  native.source = `${[`{"type":"DOCHEAD"}||${JSON.stringify(source.document)}`, ...source.objects.map((row) => `${JSON.stringify({ type: row.type, id: row.id })}||${JSON.stringify(row.body)}`)].join("|\n")}|\n`;
  return { source, native, proof: { profile: "easyeda-pro-control.schematic-coordinate-lifecycle.v1", rawSourceSha256: observedSource.sha256, rawNativeSha256, changes, inheritedPinNames, quarterTurnPinAttributes, storedPinNumbers, inactiveNoConnects } };
}

/** Effect comparison normalizes the complete part pose. Durable constructor
 * checks must instead see the captured, internally consistent pose together
 * with its captured stored attributes. Restore only the already-proved
 * composed parts, never an arbitrary native snapshot or unrelated field.
 */
export function restoreComposedCoordinateStorage(source: NativeSourceSnapshot, native: SchematicNativeSnapshot,
  capturedSource: NativeSourceSnapshot, capturedInput: unknown, proof: ReturnType<typeof alignSchematicCoordinateLifecycle>["proof"]): {
    source: NativeSourceSnapshot; native: SchematicNativeSnapshot; restored: readonly { componentId: string; sourceIds: readonly string[] }[];
  } {
  const captured = correlateSchematicNativeSource(capturedSource, capturedInput), result = structuredClone(native);
  const records = new Map(source.objects.map((row) => [row.id, structuredClone(row)]));
  const componentIds = new Set([...proof.storedPinNumbers.filter((entry) => entry.profile === "pinned-quarter-turn-displaced-pin-number").map((entry) => entry.componentId),
    ...proof.inactiveNoConnects.map((entry) => entry.componentId)]);
  const restored: { componentId: string; sourceIds: string[] }[] = [];
  for (const componentId of componentIds) {
    const change = proof.changes.find((entry) => entry.componentId === componentId);
    const model = result.components.find((entry) => entry.id === componentId), raw = captured.components.find((entry) => entry.id === componentId);
    if (change === undefined || model === undefined || raw === undefined || model.kind !== "part" || model.body["rotation"] !== 90 || model.body["isMirror"] !== false ||
        !same([model.body["x"], model.body["y"]], change.before) || !same([raw.body["x"], raw.body["y"]], change.reconstructed) ||
        change.capturedComponentSha256 !== sha256Json(raw)) {
      throw new Error("Composed coordinate storage lacks its exact proved part pose.");
    }
    const delta = change.reconstructed.map((value, index) => value - number(change.before[index]));
    const sourceIds: string[] = [];
    const restoreBody = (body: Record<string, unknown>, rawBody: Record<string, unknown>, spelling?: { stored: readonly number[]; compared: readonly number[] }): void => {
      if (!same({ ...rawBody, x: body["x"], y: body["y"] }, body)) { throw new Error("Composed coordinate storage changed a non-coordinate field."); }
      for (const [index, key] of ["x", "y"].entries()) {
        if (!same(body[key], rawBody[key])) {
          if (spelling === undefined ? rawBody[key] !== number(body[key]) + number(delta[index]) :
            body[key] !== spelling.stored[index] || rawBody[key] !== spelling.compared[index]) {
            throw new Error("Composed coordinate storage is not the proved captured displacement.");
          }
          body[key] = rawBody[key];
        }
      }
    };
    const restoreRecord = (id: string, spelling?: { stored: readonly number[]; compared: readonly number[] }): void => {
      const rawRow = capturedSource.objects.find((entry) => entry.id === id), row = records.get(id);
      if (row === undefined || rawRow === undefined || row.type !== rawRow.type) { throw new Error("Composed coordinate storage lost its source identity."); }
      restoreBody(row.body, rawRow.body, spelling); sourceIds.push(id);
    };
    restoreBody(model.body, raw.body); restoreRecord(componentId);
    for (const owner of [model, ...model.pins]) {
      const rawOwner = owner === model ? raw : raw.pins.find((entry) => entry.id === owner.id);
      if (rawOwner === undefined) { throw new Error("Composed coordinate storage lost a pin."); }
      if (owner !== model) { restoreBody(owner.body, rawOwner.body); }
      const restoreAttribute = (attr: SchematicNativeComponent["attributes"][number]): void => {
        const rawAttr = rawOwner.attributes.find((entry) => entry.id === attr.id);
        if (rawAttr === undefined) { throw new Error("Composed coordinate storage lost an attribute."); }
        if (same(attr.body["x"], rawAttr.body["x"]) && same(attr.body["y"], rawAttr.body["y"])) { return; }
        const numberProof = proof.storedPinNumbers.find((entry) => entry.componentId === componentId && entry.attributeId === attr.id && entry.profile === "pinned-quarter-turn-displaced-pin-number");
        if (records.has(attr.id) || capturedSource.objects.some((row) => row.id === attr.id)) {
          if (numberProof === undefined || attr.key !== "Pin Number") { throw new Error("Composed coordinate storage attempted an unproved stored attribute."); }
          restoreRecord(attr.id, numberProof);
        }
        restoreBody(attr.body, rawAttr.body, numberProof);
      };
      for (const attr of owner.attributes) { restoreAttribute(attr); }
    }
    const restoreMarker = (pin: SchematicNativeComponent["pins"][number]): void => {
      const marker = pin.noConnect, rawMarker = raw.pins.find((entry) => entry.id === pin.id)?.noConnect;
      if (marker === null || rawMarker === undefined || rawMarker === null || same(marker.body, rawMarker.body)) { return; }
      const nc = proof.inactiveNoConnects.find((entry) => entry.componentId === componentId && entry.pinId === pin.id && entry.attributeId === marker.id);
      if (nc === undefined || marker.id !== rawMarker.id || marker.value !== "no" || rawMarker.value !== "no") { throw new Error("Composed storage marker is not the proved inactive NC."); }
      const spelling = { stored: nc.before, compared: nc.reconstructed };
      restoreBody(marker.body, rawMarker.body, spelling); restoreRecord(marker.id, spelling);
    };
    for (const pin of model.pins) { restoreMarker(pin); }
    if (!same(model, raw)) { throw new Error("Composed coordinate storage changed the complete native part outside proved coordinates."); }
    restored.push({ componentId, sourceIds });
  }
  const value = { schema: source.schema, document: source.document, objects: [...records.values()].toSorted((a, b) => a.id.localeCompare(b.id)) };
  const rebuilt = { ...value, sha256: sha256Json(value) };
  result.source = `${[`{"type":"DOCHEAD"}||${JSON.stringify(rebuilt.document)}`, ...rebuilt.objects.map((row) => `${JSON.stringify({ type: row.type, id: row.id })}||${JSON.stringify(row.body)}`)].join("|\n")}|\n`;
  return { source: rebuilt, native: result, restored };
}

/** A constructor spelling is not authority to write a different durable NC.
 * Before projection, changed inactive-marker coordinates must equal the exact
 * typed write or the independently captured native position.
 */
const coordinates = (value: Record<string, unknown>): readonly number[] => [number(value["x"]), number(value["y"])];
export function verifyInactiveNoConnectWrites(before: NativeHistorySnapshot, after: NativeHistorySnapshot,
  observed: NativeSourceSnapshot, typed: NativeSourceSnapshot): void {
  const newPage = after.documents.find((doc) => doc.uuid === observed.document["uuid"]), oldPage = before.documents.find((doc) => doc.uuid === observed.document["uuid"]);
  if (oldPage === undefined || newPage === undefined) { throw new Error("Inactive NC write target is absent."); }
  const verify = (row: NativeHistorySnapshot["documents"][number]["records"][number]): void => {
    const prior = oldPage.records.find((entry) => entry.id === row.id);
    if (prior === undefined || (same(prior.body["x"], row.body["x"]) && same(prior.body["y"], row.body["y"]))) { return; }
    const captured = observed.objects.find((entry) => entry.id === row.id), intended = typed.objects.find((entry) => entry.id === row.id);
    if (captured?.type !== "ATTR" || intended?.type !== "ATTR" ||
        (!same(coordinates(row.body), coordinates(captured.body)) && !same(coordinates(row.body), coordinates(intended.body)))) {
      throw new Error("Durable inactive NC position is neither retained nor the exact typed/native write.");
    }
  };
  for (const row of newPage.records.filter((entry) => entry.type === "ATTR" && entry.body["key"] === "NO_CONNECT" && entry.body["value"] === "no")) { verify(row); }
}

function projectDisplacedInactiveNoConnect(history: NativeHistorySnapshot, source: NativeSourceSnapshot, native: SchematicNativeSnapshot,
  stored: NativeHistorySnapshot["documents"][number]["records"][number], exported: NativeSourceObject): { row: typeof stored; proof: InactiveNoConnectReconstruction } {
  const page = history.documents.find((doc) => doc.uuid === source.document["uuid"] && doc.docType === "SCH_PAGE" && !isNativeDocumentDeleted(doc));
  const owners = native.components.filter((model) => model.pins.some((pin) => pin.noConnect?.id === stored.id));
  const model = owners[0], pins = model?.pins.filter((pin) => pin.noConnect?.id === stored.id);
  const pin = pins?.[0];
  const marker = pin?.noConnect;
  const original = page?.records.find((row) => row.type === "COMPONENT" && row.id === model?.id);
  const symbolAttrs = model?.attributes.filter((attr) => attr.key === "Symbol"), symbolId = symbolAttrs?.[0]?.value;
  if (page === undefined || page.semanticSha256 !== documentHash(page) || owners.length !== 1 || model === undefined || model.kind !== "part" ||
      pins?.length !== 1 || pin === undefined || marker === undefined || marker === null || original === undefined ||
      model.body["rotation"] !== 90 || model.body["isMirror"] !== false ||
      stored.id !== exported.id || stored.type !== "ATTR" || exported.type !== "ATTR" || stored.body["key"] !== "NO_CONNECT" ||
      stored.body["parentId"] !== pin.id || stored.body["value"] !== "no" || marker.value !== "no" ||
      !same(marker.body, exported.body) || !same({ ...stored.body, x: exported.body["x"], y: exported.body["y"] }, exported.body) ||
      !same({ ...original.body, x: model.body["x"], y: model.body["y"] }, model.body) ||
      symbolAttrs?.length !== 1 || typeof symbolId !== "string" || symbolAttrs[0]?.body["value"] !== symbolId ||
      page.records.filter((row) => row.type === "ATTR" && row.body["parentId"] === model.id && row.body["key"] === "Symbol" && row.body["value"] === symbolId).length !== 1) {
    throw new Error("Stored inactive no-connect lacks exact component/pin coordinate evidence.");
  }
  const { hash: symbolSha256, rotation } = symbolEvidence(model, history);
  const current = [number(model.body["x"]), number(model.body["y"])], origin = [number(original.body["x"]), number(original.body["y"])];
  const mapped = reconstructedOrigin(number(origin[0]), number(origin[1]), rotation);
  const symbol = history.documents.find((doc) => doc.uuid === symbolId && doc.docType === "SYMBOL");
  const localPins = symbol?.records.filter((row) => row.type === "PIN" && row.body["partId"] === model.body["partId"] && `${model.id}-${row.id}` === pin.id);
  const local = localPins?.[0];
  const before = [number(stored.body["x"]), number(stored.body["y"])], reconstructed = [number(exported.body["x"]), number(exported.body["y"])];
  const shifted = before.map((value, index) => value + (number(current[index]) - number(origin[index])));
  if (same(origin, current) || !same(mapped, current) || !same(reconstructedOrigin(number(current[0]), number(current[1]), rotation), current) ||
      localPins?.length !== 1 || local === undefined || pin.body["rotation"] !== (number(local.body["rotation"]) + 90) % 360 ||
      !same([pin.body["x"], pin.body["y"]], quarterTurnPoint([number(local.body["x"]), number(local.body["y"])], current)) ||
      !same(reconstructed, [pin.body["x"], pin.body["y"]]) || !same(shifted, reconstructed)) {
    throw new Error("Stored inactive no-connect is not the exact quarter-turn pin displacement.");
  }
  return { row: { ...stored, body: { ...stored.body, x: exported.body["x"], y: exported.body["y"] } }, proof: {
    profile: "pinned-quarter-turn-inactive-no-connect", componentId: model.id, pinId: pin.id, attributeId: stored.id,
    symbolSha256, checkpointSha256: history.checkpointSha256, before, reconstructed } };
}

/** Comparison-only durable spelling. Require complete COMPONENT equality
 * except the exact finite native matrix pair; preserve every other record.
 * Ninety-degree parts and 270-degree netports require an exact fixed point. Half-turn netports
 * instead require an exact two-cycle (native reconstruction toggles its last
 * floating-point bit); neither profile admits arbitrary rounding or drift.
 * This also covers a later save materializing a previously reconstructed pose.
 */
export function projectSchematicCoordinateCheckpoint(history: NativeHistorySnapshot, source: NativeSourceSnapshot, nativeInput: unknown): {
  checkpoint: NativeHistorySnapshot; proof: { rawSemanticSha256: string; comparisonSemanticSha256: string; changes: readonly { id: string; symbolSha256: string; stored: readonly number[]; compared: readonly number[] }[]; storedPinNumbers: readonly StoredPinCoordinateProof[]; inactiveNoConnects: readonly InactiveNoConnectReconstruction[] };
} {
  const document = history.documents.find((doc) => doc.uuid === source.document["uuid"]), native = correlateSchematicNativeSource(source, nativeInput);
  if (source.document["editVersion"] !== "3.2.149.88089769" || document?.docType !== "SCH_PAGE") { throw new Error("Coordinate checkpoint has another native source profile."); }
  const changes: { id: string; symbolSha256: string; stored: readonly number[]; compared: readonly number[] }[] = [];
  const storedPinNumbers: StoredPinCoordinateProof[] = [];
  const inactiveNoConnects: InactiveNoConnectReconstruction[] = [];
  const records = document.records.map((row) => {
    const exported = source.objects.find((entry) => entry.id === row.id);
    if (row.type === "ATTR" && row.body["key"] === "NO_CONNECT" && exported?.type === "ATTR" &&
        (!same(row.body["x"], exported.body["x"]) || !same(row.body["y"], exported.body["y"]))) {
      const projected = projectDisplacedInactiveNoConnect(history, source, native, row, exported);
      inactiveNoConnects.push(projected.proof); return projected.row;
    }
    if (row.type === "ATTR" && row.body["key"] === "Pin Number" && exported?.type === "ATTR" &&
        (!same(row.body["x"], exported.body["x"]) || !same(row.body["y"], exported.body["y"]))) {
      const projected = projectStoredPinNumberCoordinates(history, source, native, row, exported);
      storedPinNumbers.push(projected.proof); return projected.row;
    }
    if (row.type !== "COMPONENT" || exported?.type !== "COMPONENT" || same(row.body, exported.body)) { return row; }
    if (same(row.body["x"], exported.body["x"]) && same(row.body["y"], exported.body["y"])) { return row; }
    const model = native.components.find((entry) => entry.id === row.id);
    if (model === undefined || !same({ ...row.body, x: exported.body["x"], y: exported.body["y"] }, exported.body)) { throw new Error("Coordinate checkpoint changed another component field."); }
    const stored = [number(row.body["x"]), number(row.body["y"])] as const, { hash: symbolSha256, rotation } = symbolEvidence(model, history);
    const compared = [number(exported.body["x"]), number(exported.body["y"])] as const;
    const forward = reconstructedOrigin(stored[0], stored[1], rotation), reverse = reconstructedOrigin(compared[0], compared[1], rotation);
    const exact = rotation === 180 ? same(forward, compared) && same(reverse, stored) :
      ((same(forward, compared) && same(reverse, compared)) || (same(reverse, stored) && same(forward, stored)));
    if (!exact) { throw new Error("Stored coordinate is not an exact stable native matrix pair."); }
    changes.push({ id: row.id, symbolSha256, stored, compared });
    return { ...row, body: structuredClone(exported.body) };
  });
  const changed = { ...document, records, semanticSha256: sha256Json({ uuid: document.uuid, docType: document.docType, metadata: document.metadata, records: records.map(({ id, type, body }) => ({ id, type, body })) }) };
  const documents = history.documents.map((doc) => doc.uuid === changed.uuid ? changed : doc);
  const checkpoint = { ...history, documents, semanticSha256: sha256Json(documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) };
  return { checkpoint, proof: { rawSemanticSha256: history.semanticSha256, comparisonSemanticSha256: checkpoint.semanticSha256, changes, storedPinNumbers, inactiveNoConnects } };
}
