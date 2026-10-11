import { z } from "zod";
import { assertSubset, canonicalJson, sha256Json, validatePrivateFingerprint } from "./core.ts";
import { parseDocumentSource } from "./document-source.ts";
import type { NativeSourceSnapshot } from "./document-source.ts";
import type { ExpectedContext } from "./engine.ts";
import { PCB_NET_MEMBERSHIP_API_SHA256, PCB_NET_MEMBERSHIP_MAX_BYTES, PCB_NET_MEMBERSHIP_PCB_SHA256,
  PCB_NET_MEMBERSHIP_SOURCE_EDIT_VERSION } from "./pcb-net-membership.ts";
import type { PcbNetMembershipEngine } from "./pcb-net-membership-read.ts";
import { capturePcbInheritedLineScope, pcbNeedsInheritedLineEvidence } from "./pcb-inherited-lines.ts";
import type { PcbInheritedLineScope } from "./pcb-inherited-lines.ts";
import { PCB_SOURCE_OBJECTS_LIMITATIONS, PCB_SOURCE_OBJECTS_PROFILE, PCB_SOURCE_OBJECT_METHOD,
  derivePcbSourceObjects, pcbSourceObjectIds, pcbSourceObjectsRequestSchema } from "./pcb-source-objects.ts";

export type PcbSourceObjectsEngine = PcbNetMembershipEngine;
const hash = z.string().regex(/^[a-f0-9]{64}$/u);
const consistencySchema = z.object({ stable: z.literal(true), attempts: z.literal(2), snapshotSha256: hash,
  contextBinding: z.object({ level: z.literal("active-context-stability-required"), preAndPostChecked: z.literal(true), switchAwayAndBackDetectable: z.literal(false) }).strict() }).strict();
const exactSchema = z.object({ ok: z.literal(true), kind: z.enum(["pcb-source", "pcb-inventory"]), documentType: z.literal(3), read_consistency: consistencySchema }).loose();
function ownedContext(context: ExpectedContext): string {
  const project = context.project.uuid ?? context.project.projectUuid;
  const document = context.document.uuid ?? context.document.documentUuid;
  if (context.project.uuid !== undefined && context.project.projectUuid !== undefined && context.project.uuid !== context.project.projectUuid ||
      context.document.uuid !== undefined && context.document.documentUuid !== undefined && context.document.uuid !== context.document.documentUuid ||
      typeof project !== "string" || project.length === 0 || typeof document !== "string" || document.length === 0 ||
      context.document.documentType !== 3 || context.document["parentProjectUuid"] !== project || context.document["parentLibraryUuid"] !== undefined ||
      context.document.tabId !== document && context.document.tabId !== `${document}@${project}`) {
    throw new Error("Explicit PCB source objects require one exact active project-owned type-3 PCB.");
  }
  return document;
}
function checkedExact(input: unknown, kind: "pcb-source" | "pcb-inventory"): z.infer<typeof exactSchema> {
  const payload = exactSchema.parse(input), { read_consistency: consistency, ...sample } = payload;
  if (payload.kind !== kind || sha256Json(sample) !== consistency.snapshotSha256) { throw new Error("Explicit PCB exact observation commitment is invalid."); }
  return payload;
}

/** Fixed source/inventory reads only. Both independent cycles and the inner
 * double samples remain intact; requested identities never come from selection.
 */
export async function readPcbSourceObjects(engine: PcbSourceObjectsEngine, requestInput: unknown, expectedContext: ExpectedContext,
  expectedFingerprint: Record<string, unknown>): Promise<Record<string, unknown>> {
  const request = pcbSourceObjectsRequestSchema.parse(requestInput), requestedIds = pcbSourceObjectIds(request);
  const expected = structuredClone(expectedContext);
  const documentUuid = ownedContext(expected);
  const expectedRuntime = structuredClone(expectedFingerprint);
  validatePrivateFingerprint(expectedRuntime);
  assertSubset(expectedRuntime, { installedBundles: { pcbEditor: { implementationSha256: PCB_NET_MEMBERSHIP_PCB_SHA256 },
    publicApi: { implementationSha256: PCB_NET_MEMBERSHIP_API_SHA256 } } }, "Explicit PCB reviewed implementation");
  await engine.assertBridgeDispatchAllowed();
  const initialStatus = await engine.status();
  const fingerprint = structuredClone(initialStatus.stableFingerprint);
  validatePrivateFingerprint(fingerprint);
  assertSubset(fingerprint, expectedRuntime, "Explicit PCB runtime");
  const context = structuredClone(await engine.assertContext(expected));
  assertSubset(context, expected, "Explicit PCB active context");
  if (ownedContext(context) !== documentUuid) { throw new Error("Explicit PCB active identity changed."); }
  let inheritedScope: PcbInheritedLineScope | undefined;
  const guard = async (): Promise<void> => {
    await engine.assertBridgeDispatchAllowed();
    if (inheritedScope !== undefined) { await inheritedScope.reprove(); }
    if (canonicalJson(await engine.assertContext(context)) !== canonicalJson(context)) { throw new Error("Explicit PCB context changed around observation."); }
  };
  const observe = async (kind: "pcb-source" | "pcb-inventory"): Promise<z.infer<typeof exactSchema>> => {
    const payload = checkedExact(await engine.exactRead({ kind }, context), kind);
    await guard();
    return payload;
  };
  // The preceding post-read boundary also guards the next read: only synchronous
  // Work occurs between them. Any intervening await needs its own fresh guard.
  const observations = async (): Promise<{ source: NativeSourceSnapshot; inventory: z.infer<typeof exactSchema>;
    sourceSha256: string; sourceBeforeSnapshotSha256: string; sourceAfterSnapshotSha256: string; inventorySnapshotSha256: string;
    contextBinding: z.infer<typeof consistencySchema>["contextBinding"] }> => {
    const beforePayload = await observe("pcb-source"), inventory = await observe("pcb-inventory");
    const afterPayload = await observe("pcb-source");
    const before = parseDocumentSource(z.string().max(16_777_216).parse(beforePayload["source"]));
    const after = parseDocumentSource(z.string().max(16_777_216).parse(afterPayload["source"]));
    if (before.sha256 !== after.sha256) { throw new Error("Explicit PCB source changed around inventory."); }
    return { source: before, inventory, sourceSha256: before.sha256,
      sourceBeforeSnapshotSha256: beforePayload.read_consistency.snapshotSha256, sourceAfterSnapshotSha256: afterPayload.read_consistency.snapshotSha256,
      inventorySnapshotSha256: inventory.read_consistency.snapshotSha256, contextBinding: inventory.read_consistency.contextBinding };
  };
  await guard();
  let initial = await observations();
  if (initial.source.objects.some((row) => row.type === "LINE" && requestedIds.includes(row.id)) && pcbNeedsInheritedLineEvidence(initial.source, initial.inventory)) {
    inheritedScope = await capturePcbInheritedLineScope(engine, context);
    await guard();
    // Detection observations preceded checkpoint admission and cannot be reused.
    initial = await observations();
  }
  const classify = (observed: Awaited<ReturnType<typeof observations>>): Record<string, unknown> => {
    const { source, inventory, ...proof } = observed, inherited = inheritedScope?.derive(source, inventory);
    return { ...proof, value: derivePcbSourceObjects(source, inventory, request, documentUuid, inherited),
      ...(inherited === undefined ? {} : { inheritedLines: inherited.proof }) };
  };
  const first = classify(initial), second = classify(await observations());
  if (canonicalJson(first) !== canonicalJson(second)) { throw new Error("Explicit PCB complete observations changed between independent cycles."); }
  const finalStatus = await engine.status();
  const finalFingerprint = finalStatus.stableFingerprint;
  validatePrivateFingerprint(finalFingerprint);
  if (canonicalJson(finalFingerprint) !== canonicalJson(fingerprint)) { throw new Error("Explicit PCB runtime changed."); }
  await guard();
  const { value: rows, contextBinding, ...proof } = second;
  const value = request.method === PCB_SOURCE_OBJECT_METHOD ? z.array(z.unknown()).length(1).parse(rows)[0] : rows;
  const sample = { ok: true, kind: "public-sdk-read", method: request.method, present: true, value, undefinedPaths: [],
    authority: "native-explicit-source-objects-not-public-instance-or-persistence-proof", implementationKind: "native-task-equivalent",
    assurance: "bounded-complete-request-native-source-dtos", publicApiSha256: PCB_NET_MEMBERSHIP_API_SHA256,
    nativePcbEditorSha256: PCB_NET_MEMBERSHIP_PCB_SHA256, liveValidation: "not-yet-validated", limitations: [...PCB_SOURCE_OBJECTS_LIMITATIONS],
    encoding: "unchanged-native-pcb-source-not-sdk-getter-units",
    proof: { ...proof, profile: PCB_SOURCE_OBJECTS_PROFILE, requestedPrimitiveIds: requestedIds, sourceUnchanged: true,
      sourceEditVersion: PCB_NET_MEMBERSHIP_SOURCE_EDIT_VERSION, samplesPerRead: 2, observationCycles: 2, fingerprintSha256: sha256Json(fingerprint),
      ...(inheritedScope === undefined ? {} : { checkpointReceiptPath: inheritedScope.receiptPath, libraryHeaderEvidenceSha256: inheritedScope.libraryHeaderEvidenceSha256 }) } };
  const result = { ...sample, read_consistency: { stable: true, attempts: 2, snapshotSha256: sha256Json(sample), contextBinding } };
  if (Buffer.byteLength(JSON.stringify(result)) > PCB_NET_MEMBERSHIP_MAX_BYTES) { throw new Error("Explicit PCB source proof exceeds the byte bound."); }
  return result;
}
