/* oxlint-disable import/max-dependencies -- Compose the maintained independent graph, native wire, checkpoint and durable proofs; do not create weaker substitutes. */
import { canonicalJson, sha256Json } from "./core.ts";
import { z } from "zod";
import { parseDocumentSource } from "./document-source.ts";
import type { NativeSourceSnapshot } from "./document-source.ts";
import type { ExpectedContext } from "./engine.ts";
import type { NativeHistorySnapshot } from "./native-history.ts";
import { flatDisplayContextScope, flatDisplayProjectBindingFromHistory } from "./flat-display-binding.ts";
import { captureFlatEvidence, exactFlatMembers, flatEvidenceState } from "./flat-display-profile.ts";
import { captureFlatDisplayHistory, flatDisplayLibrarySeal } from "./flat-display-library-peers.ts";
import { verifyFlatDisplayMaterialization } from "./flat-display-storage.ts";
import { verifyDesignTopology } from "./design-topology.ts";
import { encodeSchematicLayoutSource } from "./schematic-layout-batch.ts";
import { schematicNativeSnapshotHash } from "./schematic-native-adapter.ts";
import type { SchematicNativeSnapshot } from "./schematic-native-adapter.ts";
import type { FlatDisplayObservationEvidence } from "./schematic-flat-read.ts";
import { verifySchematicFlatTopology } from "./schematic-flat-topology.ts";
import type { SchematicFlatTopologyObservation } from "./schematic-flat-topology.ts";
import { buildSchematicNativeWireAdapter } from "./schematic-native-wire.ts";
import { verifySchematicWirePersistence } from "./schematic-wire-persistence.ts";
import { verifySchematicStoragePersistence } from "./schematic-storage-persistence.ts";
import { FLAT_WIRE_TRANSACTION_PROFILE, assertFlatWireBinding, flatWireBindingSchema, flatWireOperation } from "./flat-wire-binding.ts";
import type { FlatWireBinding } from "./flat-wire-binding.ts";
import { flatWireMarkerSpecification } from "./flat-wire-markers.ts";

const same = (left: unknown, right: unknown): boolean => left === right || (left !== undefined && right !== undefined && canonicalJson(left) === canonicalJson(right));
const geometryKeys = new Set(["startX", "startY", "endX", "endY"]);
type Observation = SchematicFlatTopologyObservation;
export interface PreparedFlatWireProfile {
  readonly binding: FlatWireBinding;
  readonly operation: ReturnType<typeof flatWireOperation>;
  readonly inverse: ReturnType<typeof flatWireOperation>;
  readonly expectedSource: NativeSourceSnapshot;
  readonly expectedNative: SchematicNativeSnapshot;
  readonly baselineProof: Readonly<Record<string, unknown>>;
}

/** Preserve vertices as a multiset, including both equal degree-one signatures
 * of an isolated LINE. Movable bends retain the same LINE incidence. Pins and
 * contacts to any other WIRE also retain their exact physical coordinates.
 * Equal net strings or equal connected-component counts alone are insufficient.
 */
export function flatWireContactIncidence(observation: Observation, wireId: string): string {
  verifySchematicFlatTopology(observation);
  if (observation.pages.length !== 1) { throw new Error("Flat wire requires exactly one complete page."); }
  const page = observation.pages[0];
  if (page === undefined) { throw new Error("Flat wire page is missing."); }
  const target = page.wires.find((entry) => entry.id === wireId);
  if (target === undefined) { throw new Error("Flat wire target is absent from the complete native graph."); }
  const owned = new Set(target.lines.map((entry) => entry.id));
  const vertices = page.contacts.map((entry) => ({
    lineIds: entry.lineIds.toSorted(), pinIds: entry.pinIds.toSorted(),
    point: entry.pinIds.length > 0 || entry.lineIds.some((id) => !owned.has(id)) ? entry.point : null,
  })).toSorted((left, right) => canonicalJson(left).localeCompare(canonicalJson(right)));
  return sha256Json(vertices);
}

/** Project only target LINE coordinates into the independently verified native
 * observation. Rebuild all contact vertices, then run the independent source,
 * endpoint, split/intersection, no-connect and complete pin-net verifier again.
 * This is predicted evidence, never a claim that a native read has occurred.
 */
function projectObservation(observation: Observation, source: NativeSourceSnapshot): Observation {
  const projected = structuredClone(observation);
  const page = projected.pages[0];
  if (page === undefined || projected.pages.length !== 1) { throw new Error("Flat wire projection requires one page."); }
  page.source = encodeSchematicLayoutSource(source);
  const rows = new Map(source.objects.map((entry) => [entry.id, entry]));
  const points = new Map<string, Observation["pages"][number]["contacts"][number]>();
  const contact = (point: [number, number]): Observation["pages"][number]["contacts"][number] => {
    const key = canonicalJson(point);
    const previous = points.get(key);
    if (previous !== undefined) { return previous; }
    const value = { point, lineIds: [] as string[], pinIds: [] as string[] }; points.set(key, value); return value;
  };
  for (const wire of page.wires) {
    for (const line of wire.lines) {
      const row = rows.get(line.id);
      if (row?.type !== "LINE") { throw new Error("Flat wire projected LINE membership changed."); }
      line.body = z.record(z.string(), z.json()).parse(row.body);
      const coordinates = [row.body["startX"], row.body["startY"], row.body["endX"], row.body["endY"]];
      if (coordinates.some((value) => typeof value !== "number" || !Number.isSafeInteger(value))) { throw new Error("Flat wire requires exact integer coordinates."); }
      line.points = [[Number(coordinates[0]), Number(coordinates[1])], [Number(coordinates[2]), Number(coordinates[3])]];
      for (const point of line.points) { contact(point).lineIds.push(line.id); }
    }
  }
  for (const symbol of page.symbols) { for (const pin of symbol.pins) { contact(pin.origin).pinIds.push(pin.id); } }
  page.contacts = [...points.values()].toSorted((left, right) => canonicalJson(left.point).localeCompare(canonicalJson(right.point)));
  verifySchematicFlatTopology(projected);
  return projected;
}

/** Exact inverse uses the original sorted ID-to-segment association, not a
 * geometry multiset or a fresh automatic allocation. Every style remains fixed.
 */
export function flatWireInverse(operationInput: unknown, before: NativeSourceSnapshot, native: SchematicNativeSnapshot): ReturnType<typeof flatWireOperation> {
  const operation = flatWireOperation(operationInput);
  if (!("primitiveId" in operation.target)) { throw new Error("Flat wire needs a literal target."); }
  const wireId = operation.target.primitiveId;
  const adapter = buildSchematicNativeWireAdapter(operation, before, native);
  const lines = before.objects.filter((row) => row.type === "LINE" && row.body["lineGroup"] === wireId).toSorted((left, right) => left.id.localeCompare(right.id));
  const inverse = flatWireOperation({ ...operation, id: `${operation.id}-inverse`, patch: { ...operation.patch,
    line: lines.map((row) => [row.body["startX"], -Number(row.body["startY"]), row.body["endX"], -Number(row.body["endY"])]) } });
  const projectedNative = { ...structuredClone(native), source: encodeSchematicLayoutSource(adapter.expected) };
  const reversed = buildSchematicNativeWireAdapter(inverse, adapter.expected, projectedNative);
  if (!same(reversed.expected, before) || reversed.descriptor.allocatedLineIds.length > 0 || reversed.descriptor.removedLineIds.length > 0) {
    throw new Error("Flat wire inverse cannot restore every original identity and field exactly.");
  }
  return inverse;
}

export async function prepareFlatWireProfile(input: { readonly operation: unknown; readonly context: ExpectedContext;
  readonly evidence: FlatDisplayObservationEvidence; readonly native: unknown }): Promise<PreparedFlatWireProfile> {
  const captured = { ...structuredClone({ ...input, evidence: undefined }), evidence: captureFlatEvidence(input.evidence) };
  const operation = flatWireOperation(captured.operation), { source, native, schematicUuid } = flatEvidenceState(captured.evidence, captured.context, captured.native);
  if (!("primitiveId" in operation.target)) { throw new Error("Flat wire requires an existing target."); }
  const wireId = operation.target.primitiveId;
  const adapter = buildSchematicNativeWireAdapter(operation, source, native);
  if (source.sha256 === adapter.expected.sha256 || adapter.descriptor.allocatedLineIds.length > 0 || adapter.descriptor.removedLineIds.length > 0 ||
      adapter.descriptor.attributeOrders.some((entry) => entry.beforeOrder !== entry.order)) {
    throw new Error("Flat wire requires a nonempty reroute with unchanged LINE identities/count and derived ATTR order.");
  }
  const expectedById = new Map(adapter.expected.objects.map((entry) => [entry.id, entry]));
  for (const row of source.objects) {
    const expected = expectedById.get(row.id);
    const stripGeometry = (body: typeof row.body): typeof row.body => Object.fromEntries(Object.entries(body).filter(([key]) => !geometryKeys.has(key)));
    if (expected?.type !== row.type || (row.type === "LINE" && row.body["lineGroup"] === wireId
      ? !same(stripGeometry(row.body), stripGeometry(expected.body)) : !same(row, expected))) {
      throw new Error("Flat wire reroute may change only the existing target LINE endpoint geometry.");
    }
  }
  const lineIds = [...adapter.descriptor.lineIds].toSorted();
  flatWireMarkerSpecification(source, native, wireId); flatWireMarkerSpecification(adapter.expected, native, wireId);
  const observation = captured.evidence.observation, projected = projectObservation(observation, adapter.expected);
  const incidence = flatWireContactIncidence(observation, wireId);
  if (flatWireContactIncidence(projected, wireId) !== incidence) { throw new Error("Flat wire reroute changes complete physical contact incidence."); }
  verifyDesignTopology(captured.evidence.proof.topology, verifySchematicFlatTopology(projected).topology);
  const inverse = flatWireInverse(operation, source, native);
  const baselineProof = await verifyFlatDisplayMaterialization({ history: captured.evidence.history, source, native });
  const { checkpoint, history, proof } = captured.evidence, scope = flatDisplayContextScope(captured.context);
  const expectedNative = { ...structuredClone(native), source: encodeSchematicLayoutSource(adapter.expected) };
  const libraryHeaders = flatDisplayLibrarySeal(history);
  const binding = flatWireBindingSchema.parse({ profile: FLAT_WIRE_TRANSACTION_PROFILE,
    ...(libraryHeaders === undefined ? {} : { libraryHeaders }), project: captured.evidence.projectBinding,
    projectPath: scope.projectPath, schematicUuid, pageUuid: scope.pageUuid, tabId: scope.tabId,
    operationSha256: sha256Json(operation), inverseSha256: sha256Json(inverse), checkpoint: { receiptPath: checkpoint.receiptPath,
      receiptSha256: checkpoint.receiptSha256, checkpointSha256: checkpoint.checkpointSha256, sourceSha256: checkpoint.sourceSha256,
      sourceDumpSha256: checkpoint.sourceDumpSha256, checkpointDumpSha256: checkpoint.checkpointDumpSha256, historySemanticSha256: history.semanticSha256 },
    members: exactFlatMembers(history), before: { sourceSha256: source.sha256, nativeSha256: schematicNativeSnapshotHash(native) },
    after: { sourceSha256: adapter.expected.sha256, nativeSha256: schematicNativeSnapshotHash(expectedNative) }, topology: proof.topology,
    beforeObservationSha256: proof.observationSha256, baselineProofSha256: sha256Json(baselineProof), wireId, lineIds, contactIncidenceSha256: incidence });
  return { binding, operation, inverse, expectedSource: adapter.expected, expectedNative, baselineProof };
}

export function assertFlatWireLibraryPeers(binding: FlatWireBinding, history: NativeHistorySnapshot): void {
  if (!same(binding.libraryHeaders, flatDisplayLibrarySeal(history))) { throw new Error("Flat wire immutable library header provenance changed."); }
}

export function verifyFlatWireObservation(bindingInput: unknown, operationInput: unknown, context: ExpectedContext,
  evidence: FlatDisplayObservationEvidence, nativeInput: unknown, phase: "before" | "after", lifecycle = false): void {
  const binding = assertFlatWireBinding(bindingInput, operationInput, context), current = flatEvidenceState(evidence, context, nativeInput);
  const nativeSource = parseDocumentSource(current.native.source);
  const comparisonNative = phase === "after" ? { ...current.native, source: encodeSchematicLayoutSource(nativeSource) } : current.native;
  if (!same(binding.project, evidence.projectBinding) || current.schematicUuid !== binding.schematicUuid ||
      (!lifecycle && (nativeSource.sha256 !== current.source.sha256 || current.source.sha256 !== binding[phase].sourceSha256 ||
        schematicNativeSnapshotHash(comparisonNative) !== binding[phase].nativeSha256)) ||
      flatWireContactIncidence(evidence.observation, binding.wireId) !== binding.contactIncidenceSha256 ||
      !same(evidence.observation.pages[0]?.wires.find((wire) => wire.id === binding.wireId)?.lines.map((line) => line.id).toSorted(), binding.lineIds)) {
    throw new Error("Flat wire phase differs from its sealed project, exact source/native state or complete contact incidence.");
  }
  assertFlatWireLibraryPeers(binding, evidence.history);
  const members = exactFlatMembers(evidence.history), previous = new Map(binding.members.map((entry) => [entry.uuid, entry.semanticSha256]));
  if (!same(members.map(({ uuid, docType }) => ({ uuid, docType })), binding.members.map(({ uuid, docType }) => ({ uuid, docType }))) ||
      members.some((entry) => entry.uuid !== binding.pageUuid && previous.get(entry.uuid) !== entry.semanticSha256)) {
    throw new Error("Flat wire complete durable membership or peer document changed.");
  }
  verifyDesignTopology(binding.topology, evidence.proof.topology);
}

export async function verifyFlatWirePersistence(input: { readonly binding: FlatWireBinding; readonly operation: unknown; readonly context: ExpectedContext;
  readonly baseline: NativeHistorySnapshot; readonly before: NativeSourceSnapshot; readonly beforeNative: SchematicNativeSnapshot;
  readonly current: NativeSourceSnapshot; readonly currentNative: SchematicNativeSnapshot;
  readonly evidence: FlatDisplayObservationEvidence; readonly allowAfter: boolean }): Promise<Readonly<Record<string, unknown>>> {
  const captured = { ...structuredClone({ ...input, baseline: undefined, evidence: undefined }),
    baseline: captureFlatDisplayHistory(input.baseline), evidence: captureFlatEvidence(input.evidence) };
  const binding = assertFlatWireBinding(captured.binding, captured.operation, captured.context);
  assertFlatWireLibraryPeers(binding, captured.baseline);
  if (captured.baseline.checkpointSha256 !== binding.checkpoint.checkpointSha256 || captured.baseline.semanticSha256 !== binding.checkpoint.historySemanticSha256 ||
      !same(flatDisplayProjectBindingFromHistory(captured.baseline), binding.project) || !same(exactFlatMembers(captured.baseline), binding.members) ||
      captured.before.sha256 !== binding.before.sourceSha256 || schematicNativeSnapshotHash(captured.beforeNative) !== binding.before.nativeSha256 ||
      captured.current.sha256 !== binding[captured.allowAfter ? "after" : "before"].sourceSha256) {
    throw new Error("Flat wire persistence lacks its sealed original complete checkpoint and intended source.");
  }
  verifyFlatWireObservation(binding, captured.operation, captured.context, captured.evidence, captured.currentNative, captured.allowAfter ? "after" : "before");
  const originalMaterialization = await verifyFlatDisplayMaterialization({ history: captured.baseline, source: captured.before, native: captured.beforeNative });
  const persistence = { before: captured.baseline, after: captured.evidence.history, expectedBefore: captured.before, expectedAfter: captured.before,
    beforeNative: captured.beforeNative, afterNative: captured.beforeNative };
  try {
    const currentMaterialization = await verifyFlatDisplayMaterialization({ history: captured.evidence.history, source: captured.before, native: captured.beforeNative });
    return { classification: "unchanged-baseline", originalMaterialization, currentMaterialization, proof: verifySchematicStoragePersistence(persistence) };
  } catch (error) {
    if (!captured.allowAfter) { throw error; }
    const currentMaterialization = await verifyFlatDisplayMaterialization({ history: captured.evidence.history, source: captured.current, native: captured.currentNative });
    const proof = verifySchematicWirePersistence(captured.operation, { ...persistence, expectedAfter: captured.current, afterNative: captured.currentNative });
    return { classification: "exact-intended-effect", originalMaterialization, currentMaterialization, proof };
  }
}
