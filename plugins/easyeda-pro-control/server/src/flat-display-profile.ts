/* oxlint-disable import/max-dependencies -- Bind the existing independent source, native, topology, checkpoint and inverse proofs rather than reimplementing them. */
import { canonicalJson, normalizeEasyedaProjectPath, sha256Json } from "./core.ts";
import { parseDocumentSource } from "./document-source.ts";
import type { NativeSourceSnapshot } from "./document-source.ts";
import type { ExpectedContext } from "./engine.ts";
import { isNativeDocumentDeleted } from "./native-history.ts";
import type { NativeHistorySnapshot } from "./native-history.ts";
import { verifyDesignTopology } from "./design-topology.ts";
import { deriveSchematicLayoutPageLoadScope } from "./schematic-layout-page-load.ts";
import { encodeSchematicLayoutSource, expectedSchematicLayoutCooperatively, inverseSchematicLayoutCooperatively, verifySchematicLayoutPersistenceCooperatively } from "./schematic-layout-batch.ts";
import type { SchematicLayoutBatch } from "./schematic-layout-batch.ts";
import { schematicNativeSnapshotHash } from "./schematic-native-adapter.ts";
import type { SchematicNativeSnapshot } from "./schematic-native-adapter.ts";
import { correlateSchematicNativeSource } from "./schematic-source-proof.ts";
import { verifySchematicFlatTopology } from "./schematic-flat-topology.ts";
import type { FlatDisplayObservationEvidence } from "./schematic-flat-read.ts";
import { FLAT_DISPLAY_TRANSACTION_PROFILE, assertFlatDisplayBinding, flatDisplayBindingSchema as bindingSchema, flatDisplayContextScope, flatDisplayOperation, flatDisplayProjectBindingFromHistory } from "./flat-display-binding.ts";
import type { FlatDisplayBinding } from "./flat-display-binding.ts";
import { verifySchematicStoragePersistence } from "./schematic-storage-persistence.ts";
import { verifyFlatDisplayMaterialization } from "./flat-display-storage.ts";
import { FLAT_DISPLAY_IMPORTED_TRANSACTION_PROFILE, assertFlatDisplayLibraryPeers, assertFlatDisplayLibrarySummary, captureFlatDisplayHistory, flatDisplayLibrarySeal } from "./flat-display-library-peers.ts";

export { FLAT_DISPLAY_TRANSACTION_PROFILE, assertFlatDisplayBinding, assertFlatDisplayInverse, buildFlatDisplayProjectGuardExpression, flatDisplayOperation, flatDisplayProjectBindingFromHistory } from "./flat-display-binding.ts";
export type { FlatDisplayBinding, FlatDisplayProjectBinding } from "./flat-display-binding.ts";
export { FLAT_DISPLAY_IMPORTED_TRANSACTION_PROFILE } from "./flat-display-library-peers.ts";

export interface PreparedFlatDisplayProfile {
  readonly binding: FlatDisplayBinding;
  readonly operation: SchematicLayoutBatch;
  readonly inverse: SchematicLayoutBatch;
  readonly expectedSource: NativeSourceSnapshot;
  readonly expectedNative: SchematicNativeSnapshot;
  readonly baselineProof: Readonly<Record<string, unknown>>;
}
const same = (left: unknown, right: unknown): boolean => canonicalJson(left) === canonicalJson(right);

function captureEvidence(evidence: FlatDisplayObservationEvidence): FlatDisplayObservationEvidence {
  const { history, ...rest } = evidence;
  return { ...structuredClone(rest), history: captureFlatDisplayHistory(history) };
}

function exactMembers(history: NativeHistorySnapshot): FlatDisplayBinding["members"] {
  return history.documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 })).toSorted((left, right) => left.uuid.localeCompare(right.uuid));
}
function attributes(items: readonly { readonly id: string; readonly key: string; readonly value: unknown; readonly body: unknown }[]): unknown {
  return items.map(({ id, key, value, body }) => ({ id, key, value, body })).toSorted((left, right) => left.id.localeCompare(right.id));
}
function assertNativeObservation(evidence: FlatDisplayObservationEvidence, native: SchematicNativeSnapshot): void {
  const symbols = evidence.observation.pages[0]?.symbols;
  if (symbols === undefined || symbols.length !== native.components.length) { throw new Error("Flat display native component membership differs."); }
  const components = new Map(native.components.map((entry) => [entry.id, entry]));
  const topologyByPart = new Map(evidence.proof.topology.map((entry) => [entry.uniqueId, entry]));
  for (const symbol of symbols) {
    const model = components.get(symbol.id);
    if (model === undefined || model.kind !== symbol.kind || !same(model.body, symbol.body) ||
        !same(attributes(model.attributes), attributes(symbol.attributes)) || model.pins.length !== symbol.pins.length) {
      throw new Error("Flat display native symbol or attributes differ from the independent observation.");
    }
    const uniqueId = symbol.attributes.find((entry) => entry.key === "Unique ID")?.value;
    const topology = typeof uniqueId === "string" ? topologyByPart.get(uniqueId) : undefined;
    const expectedNets = new Map(topology?.pins.map((entry) => [entry.pinNumber, entry.net]));
    const pins = new Map(model.pins.map((entry) => [entry.id, entry]));
    for (const pin of symbol.pins) {
      const actual = pins.get(pin.id), expectedNet = expectedNets.get(pin.number);
      const noConnect = pin.noConnectAttribute === null ? null : { id: pin.noConnectAttribute.id, value: pin.noConnectAttribute.value, body: pin.noConnectAttribute.body };
      if (actual === undefined || !same(actual.body, pin.body) || !same(attributes(actual.attributes), attributes(pin.attributes)) ||
          !same(actual.noConnect, noConnect) || actual.net !== expectedNet) {
        throw new Error("Flat display native pin/body/net differs from the independent endpoint observation.");
      }
    }
  }
}
function evidenceState(evidence: FlatDisplayObservationEvidence, context: ExpectedContext, nativeInput: unknown): {
  source: NativeSourceSnapshot; native: SchematicNativeSnapshot; schematicUuid: string;
} {
  const contextBinding = flatDisplayContextScope(context), { checkpoint, history, observation } = evidence;
  assertFlatDisplayLibrarySummary(history, evidence.libraryHeaderEvidence, checkpoint.checkpointSha256);
  // The maintained observer verifies each file's own receipt hash and identity.
  // SQLite backup preserves logical contents, not necessarily source file bytes.
  if (checkpoint.schema !== "easyeda-pro-control.checkpoint.v2" || normalizeEasyedaProjectPath(checkpoint.source) !== contextBinding.projectPath ||
      checkpoint.sourceDumpSha256 !== checkpoint.checkpointDumpSha256 ||
      history.checkpointSha256 !== checkpoint.checkpointSha256 || !same(evidence.projectBinding, flatDisplayProjectBindingFromHistory(history))) {
    throw new Error("Flat display observation is not bound to its complete checkpoint and project branch.");
  }
  const scope = deriveSchematicLayoutPageLoadScope(context, history);
  const expectedScope = { projectUuid: scope.projectUuid, schematicUuid: scope.schematicUuid, activePageUuid: scope.activePageUuid,
    activeTabId: scope.activeTabId, pageIds: scope.pageUuids };
  const proof = verifySchematicFlatTopology(observation);
  if (scope.pageUuids.length !== 1 || !same(observation.scope, expectedScope) || !same(proof, evidence.proof)) {
    throw new Error("Flat display requires one complete checkpoint-bound page and its exact verified observation.");
  }
  const alive = history.documents.filter((document) => !isNativeDocumentDeleted(document));
  if (alive.some((document) => ["INSTANCE", "VARIANT", "COMPONENT_GROUP", "COMPONENT_GROUP_DATA"].includes(document.docType))) {
    throw new Error("Flat display excludes hierarchical, variant and grouped project records.");
  }
  const schematic = alive.find((document) => document.uuid === scope.schematicUuid && document.docType === "SCH");
  const parentMeta = schematic?.records.filter((record) => record.id === "META" || record.type === "META");
  if (parentMeta?.length !== 1 || parentMeta[0]?.id !== "META" || parentMeta[0].type !== "META" ||
      parentMeta[0].body["source"] !== "" || Object.hasOwn(parentMeta[0].body, "blockSymbolUuid")) {
    throw new Error("Flat display requires an ordinary non-inherited schematic parent.");
  }
  const savedPage = alive.find((document) => document.uuid === scope.activePageUuid && document.docType === "SCH_PAGE");
  const pageMeta = savedPage?.records.filter((record) => record.id === "META" || record.type === "META");
  if (pageMeta?.length !== 1 || pageMeta[0]?.id !== "META" || pageMeta[0].type !== "META" ||
      pageMeta[0].body["source"] !== "" || pageMeta[0].body["schematic"] !== scope.schematicUuid || Object.hasOwn(pageMeta[0].body, "blockSymbolUuid")) {
    throw new Error("Flat display requires an ordinary non-inherited saved page.");
  }
  const page = observation.pages[0];
  if (page === undefined) { throw new Error("Flat display observation has no active source."); }
  const source = parseDocumentSource(page.source);
  const native = correlateSchematicNativeSource(source, nativeInput);
  if (native.document.tabId !== scope.activeTabId || native.document.documentUuid !== scope.activePageUuid) {
    throw new Error("Flat display native snapshot belongs to a different page or tab.");
  }
  assertNativeObservation(evidence, native);
  return { source, native, schematicUuid: scope.schematicUuid };
}

/** Pure cooperative preparation. All inputs are captured before the first
 * yield. The observer, source/native correlation and complete baseline proof
 * are independently checked; operation patches cannot supply authority.
 */
export async function prepareFlatDisplayProfile(input: { readonly operation: unknown; readonly context: ExpectedContext;
  readonly evidence: FlatDisplayObservationEvidence; readonly native: unknown }): Promise<PreparedFlatDisplayProfile> {
  const captured = { ...structuredClone({ ...input, evidence: undefined }), evidence: captureEvidence(input.evidence) };
  const operation = flatDisplayOperation(captured.operation);
  const { source, native, schematicUuid } = evidenceState(captured.evidence, captured.context, captured.native);
  const { history, checkpoint, proof } = captured.evidence;
  const baselineProof = await verifyFlatDisplayMaterialization({ history, source, native });
  const layoutEvidence = { history, templates: {} };
  const projected = await expectedSchematicLayoutCooperatively(operation, source, native, {}, layoutEvidence);
  const inverse = await inverseSchematicLayoutCooperatively(operation, source, native, {}, layoutEvidence);
  if (inverse === undefined || Object.keys(projected.createdIds).length > 0 || source.sha256 === projected.expected.sha256) {
    throw new Error("Flat display requires a nonempty exact effect and a complete stored-field inverse.");
  }
  flatDisplayOperation(inverse);
  const contextBinding = flatDisplayContextScope(captured.context);
  const libraryHeaders = flatDisplayLibrarySeal(history);
  const binding = bindingSchema.parse({ profile: libraryHeaders === undefined ? FLAT_DISPLAY_TRANSACTION_PROFILE : FLAT_DISPLAY_IMPORTED_TRANSACTION_PROFILE,
    ...(libraryHeaders === undefined ? {} : { libraryHeaders }), project: captured.evidence.projectBinding,
    projectPath: contextBinding.projectPath, schematicUuid, pageUuid: contextBinding.pageUuid, tabId: contextBinding.tabId,
    operationSha256: sha256Json(operation), inverseSha256: sha256Json(inverse), checkpoint: { receiptPath: checkpoint.receiptPath,
      receiptSha256: checkpoint.receiptSha256, checkpointSha256: checkpoint.checkpointSha256, sourceSha256: checkpoint.sourceSha256,
      sourceDumpSha256: checkpoint.sourceDumpSha256, checkpointDumpSha256: checkpoint.checkpointDumpSha256, historySemanticSha256: history.semanticSha256 },
    members: exactMembers(history), before: { sourceSha256: source.sha256, nativeSha256: schematicNativeSnapshotHash(native) },
    after: { sourceSha256: projected.expected.sha256, nativeSha256: schematicNativeSnapshotHash(projected.native) },
    topology: proof.topology, beforeObservationSha256: proof.observationSha256, baselineProofSha256: sha256Json(baselineProof) });
  return { binding, operation, inverse, expectedSource: projected.expected, expectedNative: projected.native, baselineProof };
}

/** The retained v1 after seal hashes the layout projection's source encoding,
 * not a native export's record order, header key order or trailing delimiter.
 * Re-encode only the already-correlated after source with that exact original
 * encoder in a comparison copy. Keep every native field and parsed source body,
 * metadata and identity, and retain the original raw seal and evidence unchanged.
 * Before observations remain byte-strict. Other lifecycle differences still
 * require their separate complete proof; the global native hash is unchanged.
 */
export function verifyFlatDisplayObservation(bindingInput: unknown, operationInput: unknown, context: ExpectedContext,
  evidence: FlatDisplayObservationEvidence, nativeInput: unknown, phase: "before" | "after"): void {
  const binding = assertFlatDisplayBinding(bindingInput, operationInput, context);
  const current = evidenceState(evidence, context, nativeInput);
  const nativeSource = parseDocumentSource(current.native.source);
  const comparisonNative = phase === "after" ? { ...current.native, source: encodeSchematicLayoutSource(nativeSource) } : current.native;
  if (!same(binding.project, evidence.projectBinding) || current.schematicUuid !== binding.schematicUuid ||
      nativeSource.sha256 !== current.source.sha256 || current.source.sha256 !== binding[phase].sourceSha256 ||
      schematicNativeSnapshotHash(comparisonNative) !== binding[phase].nativeSha256) {
    throw new Error("Flat display phase source, native state or project branch differs from its sealed binding.");
  }
  verifyMembershipTopology(binding, evidence, current.schematicUuid);
}

/** Connectivity/membership only, not source-effect or dispatch authority. A
 * lifecycle caller must first prove its exact retained layout effect with the
 * maintained source/native lifecycle verifier, then prove complete persistence.
 */
export function verifyFlatDisplayMembershipTopology(bindingInput: unknown, operationInput: unknown, context: ExpectedContext,
  evidence: FlatDisplayObservationEvidence, nativeInput: unknown): void {
  const binding = assertFlatDisplayBinding(bindingInput, operationInput, context);
  const current = evidenceState(evidence, context, nativeInput);
  verifyMembershipTopology(binding, evidence, current.schematicUuid);
}

function verifyMembershipTopology(binding: FlatDisplayBinding, evidence: FlatDisplayObservationEvidence, schematicUuid: string): void {
  assertFlatDisplayLibraryPeers(binding, evidence.history);
  if (!same(binding.project, evidence.projectBinding) || schematicUuid !== binding.schematicUuid) {
    throw new Error("Flat display lifecycle project branch or schematic changed.");
  }
  const members = exactMembers(evidence.history);
  const previous = new Map(binding.members.map((entry) => [entry.uuid, entry.semanticSha256]));
  if (!same(members.map(({ uuid, docType }) => ({ uuid, docType })), binding.members.map(({ uuid, docType }) => ({ uuid, docType }))) ||
      members.some((entry) => entry.uuid !== binding.pageUuid && previous.get(entry.uuid) !== entry.semanticSha256)) {
    throw new Error("Flat display complete project membership or a peer document changed.");
  }
  verifyDesignTopology(binding.topology, evidence.proof.topology);
}

/** Complete durable target classification before any new writer or Save.
 * Native source import can persist automatically; only the untouched original
 * or the complete intended effect is accepted, never a partially matching target.
 */
export async function verifyFlatDisplayPersistence(input: {
  readonly binding: FlatDisplayBinding; readonly operation: unknown; readonly context: ExpectedContext;
  readonly baseline: NativeHistorySnapshot; readonly before: NativeSourceSnapshot; readonly beforeNative: SchematicNativeSnapshot;
  readonly current: NativeSourceSnapshot; readonly currentNative: SchematicNativeSnapshot;
  readonly evidence: FlatDisplayObservationEvidence; readonly allowAfter: boolean;
}): Promise<Readonly<Record<string, unknown>>> {
  const captured = { ...structuredClone({ ...input, baseline: undefined, evidence: undefined }),
    baseline: captureFlatDisplayHistory(input.baseline), evidence: captureEvidence(input.evidence) };
  const binding = assertFlatDisplayBinding(captured.binding, captured.operation, captured.context);
  const operation = flatDisplayOperation(captured.operation);
  assertFlatDisplayLibraryPeers(binding, captured.baseline);
  if (captured.baseline.checkpointSha256 !== binding.checkpoint.checkpointSha256 || captured.baseline.semanticSha256 !== binding.checkpoint.historySemanticSha256 ||
      !same(flatDisplayProjectBindingFromHistory(captured.baseline), binding.project) || !same(exactMembers(captured.baseline), binding.members) ||
      captured.before.sha256 !== binding.before.sourceSha256 || schematicNativeSnapshotHash(captured.beforeNative) !== binding.before.nativeSha256 ||
      captured.current.sha256 !== binding[captured.allowAfter ? "after" : "before"].sourceSha256) {
    throw new Error("Flat display persistence lacks its sealed original and exact intended sources.");
  }
  verifyFlatDisplayObservation(binding, operation, captured.context, captured.evidence, captured.currentNative, captured.allowAfter ? "after" : "before");
  const originalMaterialization = await verifyFlatDisplayMaterialization({ history: captured.baseline, source: captured.before, native: captured.beforeNative });
  const persistence = { before: captured.baseline, after: captured.evidence.history, expectedBefore: captured.before, expectedAfter: captured.before,
    beforeNative: captured.beforeNative, afterNative: captured.beforeNative };
  try {
    const currentMaterialization = await verifyFlatDisplayMaterialization({ history: captured.evidence.history, source: captured.before, native: captured.beforeNative });
    return { classification: "unchanged-baseline", originalMaterialization, currentMaterialization, proof: verifySchematicStoragePersistence(persistence) };
  }
  catch (error) {
    if (!captured.allowAfter) { throw error; }
    const currentMaterialization = await verifyFlatDisplayMaterialization({ history: captured.evidence.history, source: captured.current, native: captured.currentNative });
    const proof = await verifySchematicLayoutPersistenceCooperatively(operation,
      { ...persistence, expectedAfter: captured.current, afterNative: captured.currentNative }, {}, { history: captured.baseline, templates: {} });
    return { classification: "exact-intended-effect", originalMaterialization, currentMaterialization, proof };
  }
}
