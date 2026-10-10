import { z } from "zod";
import { assertSubset, canonicalJson, sha256Json, validatePrivateFingerprint } from "./core.ts";
import { parseDocumentSource } from "./document-source.ts";
import type { EasyedaControlEngine, ExpectedContext } from "./engine.ts";
import { PCB_NET_MEMBERSHIP_API_SHA256, PCB_NET_MEMBERSHIP_LIMITATIONS, PCB_NET_MEMBERSHIP_MAX_BYTES, PCB_NET_MEMBERSHIP_PCB_SHA256,
  PCB_NET_MEMBERSHIP_PROFILE, PCB_NET_MEMBERSHIP_SOURCE_EDIT_VERSION, derivePcbNetMembership, pcbNetMembershipRequestSchema } from "./pcb-net-membership.ts";

const hash = z.string().regex(/^[a-f0-9]{64}$/u);
const consistencySchema = z.object({ stable: z.literal(true), attempts: z.literal(2), snapshotSha256: hash,
  contextBinding: z.object({ level: z.literal("active-context-stability-required"), preAndPostChecked: z.literal(true), switchAwayAndBackDetectable: z.literal(false) }).strict() }).strict();
const payloadSchema = z.object({ ok: z.literal(true), kind: z.enum(["pcb-source", "pcb-inventory"]), documentType: z.literal(3), read_consistency: consistencySchema }).loose();
export type PcbNetMembershipEngine = Pick<EasyedaControlEngine, "assertBridgeDispatchAllowed" | "assertContext" | "exactRead"> & {
  readonly status: () => Promise<{ stableFingerprint: Record<string, unknown> }>;
};

function ownedContext(context: ExpectedContext): string {
  const project = context.project.uuid ?? context.project.projectUuid;
  const document = context.document.uuid ?? context.document.documentUuid;
  if (context.project.uuid !== undefined && context.project.projectUuid !== undefined && context.project.uuid !== context.project.projectUuid ||
      context.document.uuid !== undefined && context.document.documentUuid !== undefined && context.document.uuid !== context.document.documentUuid ||
      typeof project !== "string" || project.length === 0 || typeof document !== "string" || document.length === 0 ||
      context.document.documentType !== 3 || context.document["parentProjectUuid"] !== project || context.document["parentLibraryUuid"] !== undefined ||
      context.document.tabId !== document && context.document.tabId !== `${document}@${project}`) {
    throw new Error("PCB net membership requires one exact active project-owned type-3 PCB.");
  }
  return document;
}
function checkedPayload(input: unknown, kind: "pcb-source" | "pcb-inventory"): z.infer<typeof payloadSchema> {
  const payload = payloadSchema.parse(input), { read_consistency: consistency, ...sample } = payload;
  if (payload.kind !== kind || sha256Json(sample) !== consistency.snapshotSha256) { throw new Error("PCB net membership exact observation commitment is invalid."); }
  return payload;
}

/** The existing exact readers already double-sample every observation. This
 * coordinator additionally brackets the complete inventory with unchanged
 * native source, full context and runtime identity. No native net enumeration,
 * toJSON, calculation, navigation or save is introduced by this adapter.
 */
export async function readPcbNetMembership(engine: PcbNetMembershipEngine, requestInput: unknown, expectedContext: ExpectedContext,
  expectedFingerprint: Record<string, unknown>): Promise<Record<string, unknown>> {
  const request = pcbNetMembershipRequestSchema.parse(requestInput);
  const expected = structuredClone(expectedContext);
  const documentUuid = ownedContext(expected);
  const expectedRuntime = structuredClone(expectedFingerprint);
  validatePrivateFingerprint(expectedRuntime);
  assertSubset(expectedRuntime, { installedBundles: { pcbEditor: { implementationSha256: PCB_NET_MEMBERSHIP_PCB_SHA256 },
    publicApi: { implementationSha256: PCB_NET_MEMBERSHIP_API_SHA256 } } }, "PCB net membership reviewed implementation");
  await engine.assertBridgeDispatchAllowed();
  const initialStatus = await engine.status();
  const fingerprint = structuredClone(initialStatus.stableFingerprint);
  validatePrivateFingerprint(fingerprint);
  assertSubset(fingerprint, expectedRuntime, "PCB net membership runtime");
  const context = structuredClone(await engine.assertContext(expected));
  assertSubset(context, expected, "PCB net membership active context");
  if (ownedContext(context) !== documentUuid) { throw new Error("PCB net membership active identity changed."); }
  const observe = async (kind: "pcb-source" | "pcb-inventory"): Promise<z.infer<typeof payloadSchema>> => {
    await engine.assertBridgeDispatchAllowed();
    if (canonicalJson(await engine.assertContext(context)) !== canonicalJson(context)) { throw new Error("PCB net membership context changed before observation."); }
    const payload = checkedPayload(await engine.exactRead({ kind }, context), kind);
    if (canonicalJson(await engine.assertContext(context)) !== canonicalJson(context)) { throw new Error("PCB net membership context changed after observation."); }
    return payload;
  };
  const cycle = async (): Promise<{ value: ReturnType<typeof derivePcbNetMembership>; sourceSha256: string;
    sourceBeforeSnapshotSha256: string; sourceAfterSnapshotSha256: string; inventorySnapshotSha256: string; contextBinding: z.infer<typeof consistencySchema>["contextBinding"] }> => {
    const beforePayload = await observe("pcb-source");
    const inventory = await observe("pcb-inventory");
    const afterPayload = await observe("pcb-source");
    const before = parseDocumentSource(z.string().max(16_777_216).parse(beforePayload["source"]));
    const after = parseDocumentSource(z.string().max(16_777_216).parse(afterPayload["source"]));
    if (before.sha256 !== after.sha256) { throw new Error("PCB net membership native source changed around the inventory."); }
    return { value: derivePcbNetMembership(before, inventory, request, documentUuid), sourceSha256: before.sha256,
      sourceBeforeSnapshotSha256: beforePayload.read_consistency.snapshotSha256, sourceAfterSnapshotSha256: afterPayload.read_consistency.snapshotSha256,
      inventorySnapshotSha256: inventory.read_consistency.snapshotSha256, contextBinding: inventory.read_consistency.contextBinding };
  };
  const first = await cycle(), second = await cycle();
  if (canonicalJson(first) !== canonicalJson(second)) { throw new Error("PCB net membership complete observations changed between cycles."); }
  await engine.assertBridgeDispatchAllowed();
  const finalStatus = await engine.status();
  const finalFingerprint = finalStatus.stableFingerprint;
  validatePrivateFingerprint(finalFingerprint);
  if (canonicalJson(finalFingerprint) !== canonicalJson(fingerprint) || canonicalJson(await engine.assertContext(context)) !== canonicalJson(context)) {
    throw new Error("PCB net membership runtime or active context changed.");
  }
  const sample = { ok: true, kind: "public-sdk-read", method: request.method, present: true, value: second.value, undefinedPaths: [],
    authority: "native-filtered-net-membership-not-connectivity-or-persistence-proof",
    implementationKind: "native-task-equivalent", assurance: "bounded-native-net-membership-not-connectivity-or-persistence-proof",
    publicApiSha256: PCB_NET_MEMBERSHIP_API_SHA256, nativePcbEditorSha256: PCB_NET_MEMBERSHIP_PCB_SHA256,
    liveValidation: "not-yet-validated", limitations: [...PCB_NET_MEMBERSHIP_LIMITATIONS],
    proof: { profile: PCB_NET_MEMBERSHIP_PROFILE, sourceSha256: second.sourceSha256, sourceBeforeSnapshotSha256: second.sourceBeforeSnapshotSha256,
      sourceAfterSnapshotSha256: second.sourceAfterSnapshotSha256, inventorySnapshotSha256: second.inventorySnapshotSha256,
      sourceUnchanged: true, sourceEditVersion: PCB_NET_MEMBERSHIP_SOURCE_EDIT_VERSION, samplesPerRead: 2, observationCycles: 2, fingerprintSha256: sha256Json(fingerprint) } };
  const result = { ...sample, read_consistency: { stable: true, attempts: 2, snapshotSha256: sha256Json(sample), contextBinding: second.contextBinding } };
  if (Buffer.byteLength(JSON.stringify(result)) > PCB_NET_MEMBERSHIP_MAX_BYTES) { throw new Error("PCB net membership proof exceeds its byte bound."); }
  return result;
}
