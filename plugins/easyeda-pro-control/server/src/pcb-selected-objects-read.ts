import { z } from "zod";
import { assertSubset, canonicalJson, sha256Json, validatePrivateFingerprint } from "./core.ts";
import { parseDocumentSource } from "./document-source.ts";
import type { NativeSourceSnapshot } from "./document-source.ts";
import type { EasyedaControlEngine, ExpectedContext } from "./engine.ts";
import { PCB_NET_MEMBERSHIP_API_SHA256, PCB_NET_MEMBERSHIP_MAX_BYTES, PCB_NET_MEMBERSHIP_PCB_SHA256,
  PCB_NET_MEMBERSHIP_SOURCE_EDIT_VERSION } from "./pcb-net-membership.ts";
import type { PcbNetMembershipEngine } from "./pcb-net-membership-read.ts";
import { capturePcbInheritedLineScope, pcbNeedsInheritedLineEvidence } from "./pcb-inherited-lines.ts";
import type { PcbInheritedLineScope } from "./pcb-inherited-lines.ts";
import { validatePublicSdkReadPayload } from "./public-sdk-read.ts";
import { PCB_SELECTED_OBJECTS_IDS_METHOD, PCB_SELECTED_OBJECTS_LIMITATIONS, PCB_SELECTED_OBJECTS_PROFILE,
  derivePcbSelectedObjects, pcbSelectedObjectIdsSchema, pcbSelectedObjectsRequestSchema } from "./pcb-selected-objects.ts";

export type PcbSelectedObjectsEngine = PcbNetMembershipEngine & Pick<EasyedaControlEngine, "publicSdkRead">;
const idsRequest = { method: PCB_SELECTED_OBJECTS_IDS_METHOD, arguments: {} };
const hash = z.string().regex(/^[a-f0-9]{64}$/u);
const consistencySchema = z.object({ stable: z.literal(true), attempts: z.literal(2), snapshotSha256: hash,
  contextBinding: z.object({ level: z.literal("active-context-stability-required"), preAndPostChecked: z.literal(true), switchAwayAndBackDetectable: z.literal(false) }).strict() }).strict();
const exactSchema = z.object({ ok: z.literal(true), kind: z.enum(["pcb-source", "pcb-inventory"]), documentType: z.literal(3), read_consistency: consistencySchema }).loose();
const idsSchema = z.object({ ok: z.literal(true), kind: z.literal("public-sdk-read"), method: z.literal(PCB_SELECTED_OBJECTS_IDS_METHOD), present: z.literal(true),
  value: pcbSelectedObjectIdsSchema, undefinedPaths: z.array(z.string()).length(0), authority: z.literal("public-sdk-observation-not-complete-design-proof"),
  read_consistency: consistencySchema }).loose();
function ownedContext(context: ExpectedContext): string {
  const project = context.project.uuid ?? context.project.projectUuid;
  const document = context.document.uuid ?? context.document.documentUuid;
  if (context.project.uuid !== undefined && context.project.projectUuid !== undefined && context.project.uuid !== context.project.projectUuid ||
      context.document.uuid !== undefined && context.document.documentUuid !== undefined && context.document.uuid !== context.document.documentUuid ||
      typeof project !== "string" || project.length === 0 || typeof document !== "string" || document.length === 0 ||
      context.document.documentType !== 3 || context.document["parentProjectUuid"] !== project || context.document["parentLibraryUuid"] !== undefined ||
      context.document.tabId !== document && context.document.tabId !== `${document}@${project}`) {
    throw new Error("Selected PCB source objects require one exact active project-owned type-3 PCB.");
  }
  return document;
}
function checkedExact(input: unknown, kind: "pcb-source" | "pcb-inventory"): z.infer<typeof exactSchema> {
  const payload = exactSchema.parse(input), { read_consistency: consistency, ...sample } = payload;
  if (payload.kind !== kind || sha256Json(sample) !== consistency.snapshotSha256) { throw new Error("Selected PCB exact observation commitment is invalid."); }
  return payload;
}
function checkedIds(input: unknown): z.infer<typeof idsSchema> {
  const payload = idsSchema.parse(input), { read_consistency: consistency, authority: _authority, ...sample } = payload;
  if (sha256Json(sample) !== consistency.snapshotSha256) { throw new Error("Selected PCB ID observation commitment is invalid."); }
  const { assurance: _assurance, publicApiSha256: _publicApiSha256, liveValidation: _liveValidation, limitations: _limitations, ...raw } = sample;
  if (canonicalJson(validatePublicSdkReadPayload(raw, idsRequest)) !== canonicalJson(sample)) {
    throw new Error("Selected PCB ID observation metadata differs from the maintained validator.");
  }
  return payload;
}

/** Every constituent reader already double-samples. These independent complete
 * cycles also bracket inventory with exact source and selection, retaining the
 * selected order. Nothing changes selection or invokes an object serializer.
 */
export async function readPcbSelectedObjects(engine: PcbSelectedObjectsEngine, requestInput: unknown, expectedContext: ExpectedContext,
  expectedFingerprint: Record<string, unknown>): Promise<Record<string, unknown>> {
  const request = pcbSelectedObjectsRequestSchema.parse(requestInput);
  const expected = structuredClone(expectedContext);
  const documentUuid = ownedContext(expected);
  const expectedRuntime = structuredClone(expectedFingerprint);
  validatePrivateFingerprint(expectedRuntime);
  assertSubset(expectedRuntime, { installedBundles: { pcbEditor: { implementationSha256: PCB_NET_MEMBERSHIP_PCB_SHA256 },
    publicApi: { implementationSha256: PCB_NET_MEMBERSHIP_API_SHA256 } } }, "Selected PCB reviewed implementation");
  await engine.assertBridgeDispatchAllowed();
  const initialStatus = await engine.status();
  const fingerprint = structuredClone(initialStatus.stableFingerprint);
  validatePrivateFingerprint(fingerprint);
  assertSubset(fingerprint, expectedRuntime, "Selected PCB runtime");
  const context = structuredClone(await engine.assertContext(expected));
  assertSubset(context, expected, "Selected PCB active context");
  if (ownedContext(context) !== documentUuid) { throw new Error("Selected PCB active identity changed."); }
  let inheritedScope: PcbInheritedLineScope | undefined;
  const guard = async (): Promise<void> => {
    await engine.assertBridgeDispatchAllowed();
    await inheritedScope?.reprove();
    if (canonicalJson(await engine.assertContext(context)) !== canonicalJson(context)) { throw new Error("Selected PCB context changed around observation."); }
  };
  const observeExact = async (kind: "pcb-source" | "pcb-inventory"): Promise<z.infer<typeof exactSchema>> => {
    const payload = checkedExact(await engine.exactRead({ kind }, context), kind);
    await guard();
    return payload;
  };
  const observeIds = async (): Promise<z.infer<typeof idsSchema>> => {
    const payload = checkedIds(await engine.publicSdkRead(idsRequest, context));
    await guard();
    return payload;
  };
  // One boundary guards both adjacent readers: after the preceding reader and
  // Before the next. Only synchronous validation/classification runs between
  // Them. Inner reader guards and both samples remain unchanged. Any new await
  // Between observations must be followed by a fresh guard before another read.
  const observations = async (): Promise<{ source: NativeSourceSnapshot; inventory: z.infer<typeof exactSchema>; ids: string[];
    sourceSha256: string; sourceBeforeSnapshotSha256: string; sourceAfterSnapshotSha256: string; inventorySnapshotSha256: string;
    selectedIdsBeforeSnapshotSha256: string; selectedIdsAfterSnapshotSha256: string; contextBinding: z.infer<typeof consistencySchema>["contextBinding"] }> => {
    const beforePayload = await observeExact("pcb-source");
    const beforeIds = await observeIds();
    const inventory = await observeExact("pcb-inventory");
    const afterIds = await observeIds(), afterPayload = await observeExact("pcb-source");
    const before = parseDocumentSource(z.string().max(16_777_216).parse(beforePayload["source"]));
    const after = parseDocumentSource(z.string().max(16_777_216).parse(afterPayload["source"]));
    if (before.sha256 !== after.sha256 || canonicalJson(beforeIds) !== canonicalJson(afterIds)) {
      throw new Error("Selected PCB source or ordered selection changed around inventory.");
    }
    return { source: before, inventory, ids: beforeIds.value, sourceSha256: before.sha256,
      sourceBeforeSnapshotSha256: beforePayload.read_consistency.snapshotSha256, sourceAfterSnapshotSha256: afterPayload.read_consistency.snapshotSha256,
      selectedIdsBeforeSnapshotSha256: beforeIds.read_consistency.snapshotSha256, selectedIdsAfterSnapshotSha256: afterIds.read_consistency.snapshotSha256,
      inventorySnapshotSha256: inventory.read_consistency.snapshotSha256, contextBinding: inventory.read_consistency.contextBinding };
  };
  await guard();
  let initial = await observations();
  const initialSelected = new Set(initial.ids);
  if (initial.source.objects.some((row) => row.type === "LINE" && initialSelected.has(row.id)) && pcbNeedsInheritedLineEvidence(initial.source, initial.inventory)) {
    inheritedScope = await capturePcbInheritedLineScope(engine, context);
    // Discard detection observations: they preceded checkpoint admission.
    await guard();
    initial = await observations();
  }
  const classify = (observed: Awaited<ReturnType<typeof observations>>): Record<string, unknown> => {
    const { source, inventory, ids, ...proof } = observed, inherited = inheritedScope?.derive(source, inventory);
    return { ...proof, value: derivePcbSelectedObjects(source, inventory, ids, request, documentUuid, inherited), selectedPrimitiveIds: ids,
      ...(inherited === undefined ? {} : { inheritedLines: inherited.proof }) };
  };
  const first = classify(initial), second = classify(await observations());
  if (canonicalJson(first) !== canonicalJson(second)) { throw new Error("Selected PCB complete observations changed between independent cycles."); }
  const finalStatus = await engine.status();
  const finalFingerprint = finalStatus.stableFingerprint;
  validatePrivateFingerprint(finalFingerprint);
  if (canonicalJson(finalFingerprint) !== canonicalJson(fingerprint)) { throw new Error("Selected PCB runtime changed."); }
  await guard();
  const { value, contextBinding, ...proof } = second;
  const sample = { ok: true, kind: "public-sdk-read", method: request.method, present: true, value, undefinedPaths: [],
    authority: "native-selected-source-objects-not-public-instance-or-persistence-proof", implementationKind: "native-task-equivalent",
    assurance: "bounded-complete-selection-native-source-dtos", publicApiSha256: PCB_NET_MEMBERSHIP_API_SHA256,
    nativePcbEditorSha256: PCB_NET_MEMBERSHIP_PCB_SHA256, liveValidation: "not-yet-validated", limitations: [...PCB_SELECTED_OBJECTS_LIMITATIONS],
    encoding: "unchanged-native-pcb-source-not-sdk-getter-units",
    proof: { ...proof, profile: PCB_SELECTED_OBJECTS_PROFILE, sourceUnchanged: true, orderedSelectionUnchanged: true,
      sourceEditVersion: PCB_NET_MEMBERSHIP_SOURCE_EDIT_VERSION, samplesPerRead: 2, observationCycles: 2, fingerprintSha256: sha256Json(fingerprint),
      ...(inheritedScope === undefined ? {} : { checkpointReceiptPath: inheritedScope.receiptPath, libraryHeaderEvidenceSha256: inheritedScope.libraryHeaderEvidenceSha256 }) } };
  const result = { ...sample, read_consistency: { stable: true, attempts: 2, snapshotSha256: sha256Json(sample), contextBinding } };
  if (Buffer.byteLength(JSON.stringify(result)) > PCB_NET_MEMBERSHIP_MAX_BYTES) { throw new Error("Selected PCB source proof exceeds the byte bound."); }
  return result;
}
