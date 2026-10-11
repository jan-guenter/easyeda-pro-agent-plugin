import { z } from "zod";
import { assertSubset, canonicalJson, sha256Json, validatePrivateFingerprint } from "./core.ts";
import { parseDocumentSource } from "./document-source.ts";
import type { NativeSourceSnapshot } from "./document-source.ts";
import type { EasyedaControlEngine, ExpectedContext } from "./engine.ts";
import { assertExactTransportValue } from "./exact-readers.ts";

export const PCB_ACTIVE_LAYER_METHOD = "eda.pcb_Layer.getCurrentLayer";
export const PCB_ACTIVE_LAYER_PROFILE = "easyeda-pro-control.pcb-active-layer.v1";
export const PCB_ACTIVE_LAYER_API_SHA256 = "5923696711fc5e4f3027ce500d5ba6aee57b9d8f9903fdba84820432066125fc";
export const PCB_ACTIVE_LAYER_PCB_SHA256 = "65401cdc0a8f244db2ff2d8da88fd835b6e1fb3a3ecdbcfd975781502cb04b54";
export const PCB_ACTIVE_LAYER_SOURCE_EDIT_VERSION = "3.2.149.88089769";
const ALL_LAYERS_METHOD = "eda.pcb_Layer.getAllLayers";
const MAX_BYTES = 2_097_152;
export const PCB_ACTIVE_LAYER_LIMITATIONS = [
  "Native active-layer identity plus the existing public getAllLayers nine-field projection; not execution or return-parity of getCurrentLayer, whose installed API 0.2.53.aee2f57a body is empty.",
  "Only one exact active project-owned type-3 PCB. One ACTIVE_LAYER record and one corresponding LAYER source record must identify exactly one returned layer. Missing, malformed or ambiguous state refuses; no undefined/no-active-layer result is claimed.",
  "The selected layer's name, mapped type, locked state and use/show-derived status must match source. Colors and rounded transparency percentages retain the public getAllLayers projection, not complete native display/physical-stack parity.",
  "Color fields are bounded raw public strings, not validated CSS colors. The pinned native fractional-channel serializer can emit malformed values such as #a.492f; values are preserved, never corrected or evaluated.",
  "Two matching complete source/layers/source cycles, each observation double-sampled, require unchanged full observed context and runtime. Switch-away-and-back between observations remains undetectable.",
  "At most 20,000 source records, 512 layer rows and the existing 3 MiB source/2 MiB SDK observation limits. Unknown unrelated source records are retained, not interpreted or stripped; no complete layer-manager membership, connectivity, saved-file or persistence claim.",
  "No public getCurrentLayer stub, private invocation, selection, layer change, navigation, settings write or Save. Connected validation is separate from source tests.",
] as const;
export const pcbActiveLayerArgumentsSchema = z.object({}).strict();
export const pcbActiveLayerRequestSchema = z.object({ method: z.literal(PCB_ACTIVE_LAYER_METHOD), arguments: pcbActiveLayerArgumentsSchema }).strict();
const layerId = z.number().int().min(1).max(65_535);
const layerType = z.enum(["SIGNAL", "PLANE", "SILKSCREEN", "SOLDER_MASK", "PASTE_MASK", "ASSEMBLY", "CUSTOM", "OTHER"]);
// Qc.toString slices fractional hexadecimal channels without rounding.
// Preserve raw public data, including malformed default custom colors.
const color = z.string().min(1).max(128);
export const pcbActiveLayerResultSchema = z.object({ id: layerId, name: z.string().max(1024), type: layerType,
  color, transparency: z.number().min(0).max(100), inactiveColor: color, inactiveTransparency: z.number().min(0).max(100),
  layerStatus: z.union([z.literal(0), z.literal(1), z.literal(2)]), locked: z.boolean() }).strict();
const layerRows = z.array(pcbActiveLayerResultSchema).min(1).max(512);
const sourceLayerFields = z.object({ layerId: layerId.optional(), layerName: z.string().max(1024), layerType: z.string().min(1).max(128),
  locked: z.boolean(), use: z.boolean(), show: z.boolean() }).loose();
const hash = z.string().regex(/^[a-f0-9]{64}$/u);
const consistencySchema = z.object({ stable: z.literal(true), attempts: z.literal(2), snapshotSha256: hash,
  contextBinding: z.object({ level: z.literal("active-context-stability-required"), preAndPostChecked: z.literal(true), switchAwayAndBackDetectable: z.literal(false) }).strict() }).strict();
const sourcePayloadSchema = z.object({ ok: z.literal(true), kind: z.literal("pcb-source"), documentType: z.literal(3),
  source: z.string().min(1).max(3 * 1024 * 1024), read_consistency: consistencySchema }).loose();
const layersPayloadSchema = z.object({ ok: z.literal(true), kind: z.literal("public-sdk-read"), method: z.literal(ALL_LAYERS_METHOD),
  present: z.literal(true), value: layerRows, undefinedPaths: z.array(z.never()), implementationKind: z.never().optional(), publicApiSha256: z.literal(PCB_ACTIVE_LAYER_API_SHA256),
  authority: z.literal("public-sdk-observation-not-complete-design-proof"),
  assurance: z.literal("bounded-public-sdk-observation-not-native-or-persistence-proof"), read_consistency: consistencySchema }).loose();
export type PcbActiveLayerEngine = Pick<EasyedaControlEngine, "assertBridgeDispatchAllowed" | "assertContext" | "exactRead" | "publicSdkRead"> & {
  readonly status: () => Promise<{ stableFingerprint: Record<string, unknown> }>;
};

/** API Pie at 1370133. This deliberately retains its OTHER fallback, not a
 * guessed richer public enum. The selected source name/status/lock remain exact.
 */
function publicLayerType(nativeType: string): z.infer<typeof layerType> {
  switch (nativeType) {
    case "TOP": case "BOTTOM": case "SIGNAL": { return "SIGNAL"; }
    case "PLANE": { return "PLANE"; }
    case "TOP_SILK": case "BOT_SILK": { return "SILKSCREEN"; }
    case "TOP_SOLDER_MASK": case "BOT_SOLDER_MASK": { return "SOLDER_MASK"; }
    case "TOP_PASTE_MASK": case "BOT_PASTE_MASK": { return "PASTE_MASK"; }
    case "TOP_ASSEMBLY": case "BOT_ASSEMBLY": { return "ASSEMBLY"; }
    case "CUSTOM": { return "CUSTOM"; }
    default: { return "OTHER"; }
  }
}
export function derivePcbActiveLayer(source: NativeSourceSnapshot, layersInput: unknown, documentUuid: string): z.infer<typeof pcbActiveLayerResultSchema> {
  const { sha256, ...contents } = source;
  if (sha256Json(contents) !== sha256 || source.schema !== "easyeda-pro-control.document-source.v1" || source.objects.length > 20_000 ||
      source.document["uuid"] !== documentUuid || source.document["docType"] !== "PCB" || source.document["editVersion"] !== PCB_ACTIVE_LAYER_SOURCE_EDIT_VERSION ||
      new Set(source.objects.map((row) => row.id)).size !== source.objects.length) { throw new Error("PCB active layer source identity, integrity or bounds are unsupported."); }
  const active = source.objects.filter((row) => row.type === "ACTIVE_LAYER" || row.id === "ACTIVE_LAYER");
  if (active.length !== 1 || active[0]?.type !== "ACTIVE_LAYER" || active[0].id !== "ACTIVE_LAYER") { throw new Error("PCB active layer requires exactly one canonical ACTIVE_LAYER record."); }
  const selectedId = z.object({ layerId }).strict().parse(active[0].body).layerId;
  const selectedSourceId = JSON.stringify(["LAYER", selectedId]);
  // Native Yv decodes array keys by their second element; reject aliases.
  // A canonical selected row does not make another alias unambiguous.
  for (const row of source.objects.filter((item) => item.type === "LAYER")) {
    const decoded = z.tuple([z.literal("LAYER"), layerId]).parse(JSON.parse(row.id));
    if (JSON.stringify(decoded) !== row.id) { throw new Error("PCB layer source identity is not canonical."); }
  }
  const selectedSources = source.objects.filter((row) => row.id === selectedSourceId);
  if (selectedSources.length !== 1 || selectedSources[0]?.type !== "LAYER") { throw new Error("PCB active layer has no unique corresponding LAYER source record."); }
  const native = sourceLayerFields.parse(selectedSources[0].body);
  const layers = layerRows.parse(layersInput);
  if (new Set(layers.map((row) => row.id)).size !== layers.length) { throw new Error("PCB active layer enumeration has duplicate identities."); }
  const selected = layers.find((row) => row.id === selectedId);
  let nativeStatus = 0;
  if (native.use) { nativeStatus = native.show ? 1 : 2; }
  if (native.layerId !== undefined && native.layerId !== selectedId || selected === undefined || selected.name !== native.layerName || selected.type !== publicLayerType(native.layerType) || selected.locked !== native.locked ||
      selected.layerStatus !== nativeStatus) { throw new Error("PCB active layer identity/name/type/status/lock does not match the source."); }
  return selected;
}
function ownedContext(context: ExpectedContext): string {
  const project = context.project.uuid ?? context.project.projectUuid;
  const document = context.document.uuid ?? context.document.documentUuid;
  if (context.project.uuid !== undefined && context.project.projectUuid !== undefined && context.project.uuid !== context.project.projectUuid ||
      context.document.uuid !== undefined && context.document.documentUuid !== undefined && context.document.uuid !== context.document.documentUuid ||
      typeof project !== "string" || project.length === 0 || typeof document !== "string" || document.length === 0 ||
      context.document.documentType !== 3 || context.document["parentProjectUuid"] !== project || context.document["parentLibraryUuid"] !== undefined ||
      context.document.tabId !== document && context.document.tabId !== `${document}@${project}`) { throw new Error("PCB active layer requires one exact active project-owned type-3 PCB."); }
  return document;
}
function checkedSource(input: unknown): z.infer<typeof sourcePayloadSchema> {
  assertExactTransportValue(input);
  const payload = sourcePayloadSchema.parse(input), { read_consistency: consistency, ...sample } = payload;
  if (Buffer.byteLength(payload.source) > 3 * 1024 * 1024 || sha256Json(sample) !== consistency.snapshotSha256) { throw new Error("PCB active layer source observation commitment or byte bound is invalid."); }
  return payload;
}
function checkedLayers(input: unknown): z.infer<typeof layersPayloadSchema> {
  assertExactTransportValue(input);
  if (Buffer.byteLength(JSON.stringify(input)) > MAX_BYTES) { throw new Error("PCB active layer enumeration exceeds its byte bound."); }
  const payload = layersPayloadSchema.parse(input);
  // The public SDK coordinator adds authority/read_consistency after hashing.
  // Do not use the exact-reader envelope's different commitment formula.
  const { read_consistency: consistency, authority: _authority, ...sample } = payload;
  if (sha256Json(sample) !== consistency.snapshotSha256) { throw new Error("PCB active layer public enumeration commitment is invalid."); }
  return payload;
}

/** PCB xR.getData at 4426612 and the visible layer manager at 7861902 read
 * the same model.activeLayer. Existing source and public all-layer readers
 * provide the observations. No new private method or public stub is invoked.
 */
export async function readPcbActiveLayer(engine: PcbActiveLayerEngine, requestInput: unknown, expectedContext: ExpectedContext,
  expectedFingerprint: Record<string, unknown>): Promise<Record<string, unknown>> {
  const request = pcbActiveLayerRequestSchema.parse(requestInput);
  const expected = structuredClone(expectedContext);
  const documentUuid = ownedContext(expected);
  const expectedRuntime = structuredClone(expectedFingerprint);
  validatePrivateFingerprint(expectedRuntime);
  assertSubset(expectedRuntime, { installedBundles: { pcbEditor: { implementationSha256: PCB_ACTIVE_LAYER_PCB_SHA256 },
    publicApi: { implementationSha256: PCB_ACTIVE_LAYER_API_SHA256 } } }, "PCB active layer reviewed implementation");
  await engine.assertBridgeDispatchAllowed();
  const initialStatus = await engine.status();
  const fingerprint = structuredClone(initialStatus.stableFingerprint);
  validatePrivateFingerprint(fingerprint); assertSubset(fingerprint, expectedRuntime, "PCB active layer runtime");
  const context = structuredClone(await engine.assertContext(expected));
  assertSubset(context, expected, "PCB active layer context");
  if (ownedContext(context) !== documentUuid) { throw new Error("PCB active layer active identity changed."); }
  const stableContext = async (): Promise<void> => {
    if (canonicalJson(await engine.assertContext(context)) !== canonicalJson(context)) { throw new Error("PCB active layer context changed around an observation."); }
  };
  const observeSource = async (): Promise<z.infer<typeof sourcePayloadSchema>> => {
    await engine.assertBridgeDispatchAllowed(); await stableContext();
    const payload = checkedSource(await engine.exactRead({ kind: "pcb-source" }, context));
    await stableContext(); return payload;
  };
  const cycle = async (): Promise<{ value: z.infer<typeof pcbActiveLayerResultSchema>; sourceSha256: string; sourceBeforeSnapshotSha256: string;
    sourceAfterSnapshotSha256: string; layersSnapshotSha256: string; contextBinding: z.infer<typeof consistencySchema>["contextBinding"] }> => {
    const beforePayload = await observeSource();
    await engine.assertBridgeDispatchAllowed(); await stableContext();
    const layers = checkedLayers(await engine.publicSdkRead({ method: ALL_LAYERS_METHOD, arguments: {} }, context));
    await stableContext();
    const afterPayload = await observeSource();
    const before = parseDocumentSource(beforePayload.source);
    const after = parseDocumentSource(afterPayload.source);
    if (before.sha256 !== after.sha256) { throw new Error("PCB active layer full native source changed around enumeration."); }
    return { value: derivePcbActiveLayer(before, layers.value, documentUuid), sourceSha256: before.sha256,
      sourceBeforeSnapshotSha256: beforePayload.read_consistency.snapshotSha256, sourceAfterSnapshotSha256: afterPayload.read_consistency.snapshotSha256,
      layersSnapshotSha256: layers.read_consistency.snapshotSha256, contextBinding: layers.read_consistency.contextBinding };
  };
  const first = await cycle(), second = await cycle();
  if (canonicalJson(first) !== canonicalJson(second)) { throw new Error("PCB active layer complete observations changed between cycles."); }
  await engine.assertBridgeDispatchAllowed();
  const finalStatus = await engine.status();
  const finalFingerprint = finalStatus.stableFingerprint;
  validatePrivateFingerprint(finalFingerprint);
  if (canonicalJson(finalFingerprint) !== canonicalJson(fingerprint)) { throw new Error("PCB active layer runtime changed."); }
  await stableContext();
  const sample = { ok: true, kind: "public-sdk-read", method: request.method, present: true, value: second.value, undefinedPaths: [],
    authority: "native-active-layer-with-public-fields-not-public-method-parity", implementationKind: "native-task-equivalent",
    assurance: "bounded-native-active-layer-not-complete-design-state", publicApiSha256: PCB_ACTIVE_LAYER_API_SHA256,
    nativePcbEditorSha256: PCB_ACTIVE_LAYER_PCB_SHA256, liveValidation: "not-yet-validated", limitations: [...PCB_ACTIVE_LAYER_LIMITATIONS],
    proof: { profile: PCB_ACTIVE_LAYER_PROFILE, layerId: second.value.id, sourceSha256: second.sourceSha256,
      sourceBeforeSnapshotSha256: second.sourceBeforeSnapshotSha256, sourceAfterSnapshotSha256: second.sourceAfterSnapshotSha256,
      layersSnapshotSha256: second.layersSnapshotSha256, sourceUnchanged: true, sourceEditVersion: PCB_ACTIVE_LAYER_SOURCE_EDIT_VERSION,
      samplesPerRead: 2, observationCycles: 2, fingerprintSha256: sha256Json(fingerprint) } };
  const result = { ...sample, read_consistency: { stable: true, attempts: 2, snapshotSha256: sha256Json(sample), contextBinding: second.contextBinding } };
  if (Buffer.byteLength(JSON.stringify(result)) > MAX_BYTES) { throw new Error("PCB active layer proof exceeds its byte bound."); }
  return result;
}
