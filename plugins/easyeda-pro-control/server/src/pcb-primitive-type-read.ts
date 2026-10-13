import { z } from "zod";
import { assertSubset, canonicalJson, sha256Json, validatePrivateFingerprint } from "./core.ts";
import { parseDocumentSource } from "./document-source.ts";
import type { NativeSourceSnapshot } from "./document-source.ts";
import type { ExpectedContext } from "./engine.ts";
import { PCB_NET_MEMBERSHIP_API_SHA256, PCB_NET_MEMBERSHIP_MAX_BYTES, PCB_NET_MEMBERSHIP_PCB_SHA256,
  PCB_NET_MEMBERSHIP_SOURCE_EDIT_VERSION, PCB_NET_MEMBERSHIP_TYPES, derivePcbPhysicalMembers } from "./pcb-net-membership.ts";
import type { PcbNetMembershipEngine } from "./pcb-net-membership-read.ts";
import { capturePcbInheritedLineScope, pcbNeedsInheritedLineEvidence } from "./pcb-inherited-lines.ts";
import type { PcbInheritedLineEvidence, PcbInheritedLineScope } from "./pcb-inherited-lines.ts";

export const PCB_PRIMITIVE_TYPE_METHOD = "eda.pcb_Primitive.getPrimitiveTypeByPrimitiveId";
export const PCB_PRIMITIVE_TYPE_PROFILE = "easyeda-pro-control.pcb-primitive-type.v1";
export const PCB_PRIMITIVE_TYPE_LIMITATIONS = [
  "Native identity classification, not execution or return-parity of the installed public method, whose body is empty in API 0.2.53.aee2f57a.",
  "One literal existing ID, restricted to Line, Arc, Via, standalone Pad and component-owned ComponentPad. Missing IDs, other families and ambiguous membership refuse; no undefined/absence claim is made.",
  "Requires complete source/inventory correspondence for all five supported families, including empty-net objects, before classifying the requested ID. Physical pad owner and PAD_NET correlation must agree.",
  "Requires one active project-owned type-3 PCB, the reviewed runtime and source editVersion 3.2.149.88089769. Library, partition and unmodeled source records are unsupported; nonselected outline/text/metadata contributes no type result.",
  "Two matching source/inventory/source cycles require unchanged runtime and full observed context. Switching away and back between observations remains undetectable.",
  "Direct empty-net top-silkscreen footprint LINEs additionally require explicit component/Footprint associations from a fresh unchanged complete checkpoint, exact inventory geometry and separately labelled inherited provenance. Only unlocked top-side zero-rotation components and zero-origin ordinary footprints are supported; custom, rotated, bottom, replaced-layer and ambiguous cases refuse.",
  "Bounded to 20,000 native source records, 16 MiB source evidence and 2 MiB result; inherited Line proof additionally bounds decoded checkpoint history to 32 MiB and referenced documents to 20,000 records. No truncation, electrical-connectivity, general geometry, saved-file or persistence proof.",
] as const;
// oxlint-disable-next-line eslint/no-control-regex -- Literal IDs cannot carry transport control characters.
const identity = z.string().min(1).max(256).regex(/^[^\u0000-\u001F\u007F]+$/u);
export const pcbPrimitiveTypeArgumentsSchema = z.object({ id: identity }).strict();
export const pcbPrimitiveTypeRequestSchema = z.object({ method: z.literal(PCB_PRIMITIVE_TYPE_METHOD), arguments: pcbPrimitiveTypeArgumentsSchema }).strict();
export const pcbPrimitiveTypeResultSchema = z.enum(PCB_NET_MEMBERSHIP_TYPES);
const hash = z.string().regex(/^[a-f0-9]{64}$/u);
const consistencySchema = z.object({ stable: z.literal(true), attempts: z.literal(2), snapshotSha256: hash,
  contextBinding: z.object({ level: z.literal("active-context-stability-required"), preAndPostChecked: z.literal(true), switchAwayAndBackDetectable: z.literal(false) }).strict() }).strict();
const payloadSchema = z.object({ ok: z.literal(true), kind: z.enum(["pcb-source", "pcb-inventory"]), documentType: z.literal(3), read_consistency: consistencySchema }).loose();

/** The API 59236967 method at 1342057 has an empty body. This fixed native
 * equivalent classifies a source-bound physical identity, including unassigned
 * objects. It never obtains a public object or fabricates a net to find one.
 */
export function derivePcbPrimitiveType(source: NativeSourceSnapshot, inventory: unknown, requestInput: unknown,
  documentUuid: string, inherited?: PcbInheritedLineEvidence): z.infer<typeof pcbPrimitiveTypeResultSchema> {
  const request = pcbPrimitiveTypeRequestSchema.parse(requestInput);
  const members = derivePcbPhysicalMembers(source, inventory, documentUuid, PCB_NET_MEMBERSHIP_TYPES, inherited);
  const sourceIds = new Set(source.objects.map((row) => row.id));
  if (members.some((row) => row.sourceRecordId !== row.primitiveId && sourceIds.has(row.primitiveId))) {
    throw new Error("PCB primitive type inherited identity collides with another source record.");
  }
  const selected = members.find((row) => row.primitiveId === request.arguments.id);
  if (selected === undefined) { throw new Error("PCB primitive type requires an existing identity in the five supported physical families; absence or other families are not classified."); }
  return pcbPrimitiveTypeResultSchema.parse(selected.primitiveType);
}

function ownedContext(context: ExpectedContext): string {
  const project = context.project.uuid ?? context.project.projectUuid;
  const document = context.document.uuid ?? context.document.documentUuid;
  if (context.project.uuid !== undefined && context.project.projectUuid !== undefined && context.project.uuid !== context.project.projectUuid ||
      context.document.uuid !== undefined && context.document.documentUuid !== undefined && context.document.uuid !== context.document.documentUuid ||
      typeof project !== "string" || project.length === 0 || typeof document !== "string" || document.length === 0 ||
      context.document.documentType !== 3 || context.document["parentProjectUuid"] !== project || context.document["parentLibraryUuid"] !== undefined ||
      context.document.tabId !== document && context.document.tabId !== `${document}@${project}`) {
    throw new Error("PCB primitive type requires one exact active project-owned type-3 PCB.");
  }
  return document;
}
function checkedPayload(input: unknown, kind: "pcb-source" | "pcb-inventory"): z.infer<typeof payloadSchema> {
  const payload = payloadSchema.parse(input), { read_consistency: consistency, ...sample } = payload;
  if (payload.kind !== kind || sha256Json(sample) !== consistency.snapshotSha256) { throw new Error("PCB primitive type exact observation commitment is invalid."); }
  return payload;
}

export async function readPcbPrimitiveType(engine: PcbNetMembershipEngine, requestInput: unknown, expectedContext: ExpectedContext,
  expectedFingerprint: Record<string, unknown>): Promise<Record<string, unknown>> {
  const request = pcbPrimitiveTypeRequestSchema.parse(requestInput);
  const expected = structuredClone(expectedContext);
  const documentUuid = ownedContext(expected);
  const expectedRuntime = structuredClone(expectedFingerprint);
  validatePrivateFingerprint(expectedRuntime);
  assertSubset(expectedRuntime, { installedBundles: { pcbEditor: { implementationSha256: PCB_NET_MEMBERSHIP_PCB_SHA256 },
    publicApi: { implementationSha256: PCB_NET_MEMBERSHIP_API_SHA256 } } }, "PCB primitive type reviewed implementation");
  await engine.assertBridgeDispatchAllowed();
  const initialStatus = await engine.status();
  const fingerprint = structuredClone(initialStatus.stableFingerprint);
  validatePrivateFingerprint(fingerprint);
  assertSubset(fingerprint, expectedRuntime, "PCB primitive type runtime");
  const context = structuredClone(await engine.assertContext(expected));
  assertSubset(context, expected, "PCB primitive type active context");
  if (ownedContext(context) !== documentUuid) { throw new Error("PCB primitive type active identity changed."); }
  let inheritedScope: PcbInheritedLineScope | undefined;
  const observe = async (kind: "pcb-source" | "pcb-inventory"): Promise<z.infer<typeof payloadSchema>> => {
    await engine.assertBridgeDispatchAllowed();
    if (canonicalJson(await engine.assertContext(context)) !== canonicalJson(context)) { throw new Error("PCB primitive type context changed before observation."); }
    await inheritedScope?.reprove();
    const payload = checkedPayload(await engine.exactRead({ kind }, context), kind);
    await inheritedScope?.reprove();
    if (canonicalJson(await engine.assertContext(context)) !== canonicalJson(context)) { throw new Error("PCB primitive type context changed after observation."); }
    return payload;
  };
  const observations = async (): Promise<{ source: NativeSourceSnapshot; inventory: z.infer<typeof payloadSchema>; sourceSha256: string;
    sourceBeforeSnapshotSha256: string; sourceAfterSnapshotSha256: string; inventorySnapshotSha256: string; contextBinding: z.infer<typeof consistencySchema>["contextBinding"] }> => {
    const beforePayload = await observe("pcb-source");
    const inventory = await observe("pcb-inventory");
    const afterPayload = await observe("pcb-source");
    const before = parseDocumentSource(z.string().max(16_777_216).parse(beforePayload["source"]));
    const after = parseDocumentSource(z.string().max(16_777_216).parse(afterPayload["source"]));
    if (before.sha256 !== after.sha256) { throw new Error("PCB primitive type native source changed around the inventory."); }
    return { source: before, inventory, sourceSha256: before.sha256,
      sourceBeforeSnapshotSha256: beforePayload.read_consistency.snapshotSha256, sourceAfterSnapshotSha256: afterPayload.read_consistency.snapshotSha256,
      inventorySnapshotSha256: inventory.read_consistency.snapshotSha256, contextBinding: inventory.read_consistency.contextBinding };
  };
  let initial = await observations();
  if (pcbNeedsInheritedLineEvidence(initial.source, initial.inventory)) {
    inheritedScope = await capturePcbInheritedLineScope(engine, context);
    // Detection predates the fresh checkpoint; discard it, never certify it.
    initial = await observations();
  }
  type Classified = Omit<Awaited<ReturnType<typeof observations>>, "source" | "inventory"> & {
    value: ReturnType<typeof derivePcbPrimitiveType>; inheritedLines?: PcbInheritedLineEvidence["proof"];
  };
  const classify = (observed: Awaited<ReturnType<typeof observations>>): Classified => {
    const { source, inventory, ...proof } = observed, inherited = inheritedScope?.derive(source, inventory);
    return { ...proof, value: derivePcbPrimitiveType(source, inventory, request, documentUuid, inherited),
      ...(inherited === undefined ? {} : { inheritedLines: inherited.proof }) };
  };
  const first = classify(initial), second = classify(await observations());
  if (canonicalJson(first) !== canonicalJson(second)) { throw new Error("PCB primitive type complete observations changed between cycles."); }
  await engine.assertBridgeDispatchAllowed();
  const finalStatus = await engine.status();
  const finalFingerprint = finalStatus.stableFingerprint;
  validatePrivateFingerprint(finalFingerprint);
  if (canonicalJson(finalFingerprint) !== canonicalJson(fingerprint) || canonicalJson(await engine.assertContext(context)) !== canonicalJson(context)) {
    throw new Error("PCB primitive type runtime or active context changed.");
  }
  await inheritedScope?.reprove();
  const sample = { ok: true, kind: "public-sdk-read", method: request.method, present: true, value: second.value, undefinedPaths: [],
    authority: "native-pcb-identity-type-not-public-method-parity", implementationKind: "native-task-equivalent",
    assurance: "bounded-native-pcb-type-not-complete-design-state", publicApiSha256: PCB_NET_MEMBERSHIP_API_SHA256,
    nativePcbEditorSha256: PCB_NET_MEMBERSHIP_PCB_SHA256, liveValidation: "not-yet-validated", limitations: [...PCB_PRIMITIVE_TYPE_LIMITATIONS],
    proof: { profile: PCB_PRIMITIVE_TYPE_PROFILE, primitiveId: request.arguments.id, sourceSha256: second.sourceSha256,
      sourceBeforeSnapshotSha256: second.sourceBeforeSnapshotSha256, sourceAfterSnapshotSha256: second.sourceAfterSnapshotSha256,
      inventorySnapshotSha256: second.inventorySnapshotSha256, sourceUnchanged: true, sourceEditVersion: PCB_NET_MEMBERSHIP_SOURCE_EDIT_VERSION,
      ...(inheritedScope === undefined ? {} : { inheritedLines: second.inheritedLines, checkpointReceiptPath: inheritedScope.receiptPath,
        libraryHeaderEvidenceSha256: inheritedScope.libraryHeaderEvidenceSha256 }),
      samplesPerRead: 2, observationCycles: 2, completeFamilies: [...PCB_NET_MEMBERSHIP_TYPES], fingerprintSha256: sha256Json(fingerprint) } };
  const result = { ...sample, read_consistency: { stable: true, attempts: 2, snapshotSha256: sha256Json(sample), contextBinding: second.contextBinding } };
  if (Buffer.byteLength(JSON.stringify(result)) > PCB_NET_MEMBERSHIP_MAX_BYTES) { throw new Error("PCB primitive type proof exceeds its byte bound."); }
  return result;
}
