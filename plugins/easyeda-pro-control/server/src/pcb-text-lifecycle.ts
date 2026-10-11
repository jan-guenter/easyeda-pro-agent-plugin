import { randomBytes } from "node:crypto";
import { z } from "zod";
import { canonicalJson, sha256Json } from "./core.ts";
import { buildReviewedNativeSourceMerge } from "./design-native-adapter.ts";
import type { DesignNativeAdapter } from "./design-native-adapter.ts";
import { compareDocumentSources } from "./document-source.ts";
import type { NativeSourceDelta, NativeSourceObject, NativeSourceSnapshot } from "./document-source.ts";
import type { NativeHistorySnapshot } from "./native-history.ts";
import { assertPcbTextSourceProfile, pcbTextCreateFieldsSchema, pcbTextRuntimeScope, selectPcbTextString } from "./pcb-text-action.ts";
import { buildPcbTextLifecycleRuntime } from "./pcb-text-lifecycle-runtime.ts";

export const PCB_TEXT_LIFECYCLE_PROFILE = "easyeda-pro-control.pcb-standalone-text-lifecycle.v1";
const id = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$/u);
const nativeId = z.string().regex(/^[a-f0-9]{16}$/u);
export const pcbTextLifecycleOperationSchema = z.discriminatedUnion("action", [
  z.object({ id, action: z.literal("pcb.text.create"), properties: pcbTextCreateFieldsSchema }).strict(),
  z.object({ id, action: z.literal("pcb.text.delete"), target: z.object({ primitiveId: nativeId }).strict() }).strict(),
]);
export type PcbTextLifecycleOperation = z.infer<typeof pcbTextLifecycleOperationSchema>;
export interface PcbTextLifecycleIds { readonly createdId?: string; readonly targetId?: string; }

/** Only the exact generated wrapper return is an acknowledgment. A recovery
 * Without a return may prove the effect using the original reservation, but
 * Must not invent a native acknowledgment or mint another identity.
 */
export function assertPcbTextLifecycleAcknowledgment(input: unknown, ids: PcbTextLifecycleIds, acknowledgment: unknown): void {
  const operation = pcbTextLifecycleOperationSchema.parse(input);
  if (operation.action === "pcb.text.create") {
    const createdId = nativeId.parse(ids.createdId);
    z.object({ ok: z.literal(true), kind: z.literal("typed-design-result"), id: z.literal(operation.id),
      primitiveId: z.literal(createdId), createdId: z.literal(createdId) }).strict().parse(acknowledgment);
  } else {
    z.object({ ok: z.literal(true), kind: z.literal("typed-design-result"), id: z.literal(operation.id),
      createdId: z.null(), createdIds: z.null() }).strict().parse(acknowledgment);
  }
}

export function assertPcbTextCreateRetainedAuthority(input: unknown, createdId: unknown, prepared: unknown, acknowledgment: unknown): void {
  const operation = pcbTextLifecycleOperationSchema.parse(input);
  if (operation.action !== "pcb.text.create") { throw new Error("Retained PCB text creation authority requires its original create plan."); }
  const identity = nativeId.parse(createdId);
  // The sealed journal and phase-artifact hash bind this commitment to
  // The original program. Do not rebuild a preparation to recover its ID.
  z.object({ adapterProfile: z.literal(PCB_TEXT_LIFECYCLE_PROFILE), createdId: z.literal(identity),
    createdIds: z.null(), componentCreate: z.null(), codeSha256: z.string().regex(/^[a-f0-9]{64}$/u) }).strict().parse(prepared);
  if (acknowledgment !== undefined) { assertPcbTextLifecycleAcknowledgment(operation, { createdId: identity }, acknowledgment); }
}

export function compilePcbTextLifecycleOperation(input: unknown): { profile: typeof PCB_TEXT_LIFECYCLE_PROFILE;
  id: string; action: PcbTextLifecycleOperation["action"]; documentType: 3; resultKind: "created-primitive" | "boolean";
  operation: PcbTextLifecycleOperation } {
  const operation = pcbTextLifecycleOperationSchema.parse(input);
  return { profile: PCB_TEXT_LIFECYCLE_PROFILE, id: operation.id, action: operation.action, documentType: 3,
    resultKind: operation.action === "pcb.text.create" ? "created-primitive" : "boolean", operation };
}

export function assertPcbTextLifecycleSupported(input: unknown, before: NativeSourceSnapshot, ids: PcbTextLifecycleIds = {}): void {
  const operation = pcbTextLifecycleOperationSchema.parse(input);
  assertPcbTextSourceProfile(before);
  if (operation.action === "pcb.text.delete") {
    if (ids.targetId !== undefined && ids.targetId !== operation.target.primitiveId) {
      throw new Error("Standalone PCB text deletion differs from its journal-owned target.");
    }
    selectPcbTextString(operation.target.primitiveId, before);
  } else {
    if (ids.targetId !== undefined) { throw new Error("Standalone PCB text creation cannot bind an existing target."); }
    if (before.objects.length >= 20_000) { throw new Error("Standalone PCB text creation exceeds the complete source object bound."); }
    if (ids.createdId !== undefined) {
      nativeId.parse(ids.createdId);
      if (before.objects.some((row) => row.id === ids.createdId) || before.document["uuid"] === ids.createdId) {
        throw new Error("Standalone PCB text creation identity already exists in its baseline.");
      }
    }
  }
}

function createString(operation: Extract<PcbTextLifecycleOperation, { action: "pcb.text.create" }>, createdId: string): NativeSourceObject {
  // PCB SHA65401cdc: S4 at4002049 feeds and retains numeric zIndex; its
  // Finish assigns it to the model. buildText5840719/addtextByModel7890861
  // Retain that model and ID. s3 at4435183 emits zIndex unchanged; j2's
  // Getter3378952 defaults to -1. No generated ordering or public defaults.
  return { id: nativeId.parse(createdId), type: "STRING", body: { partitionId: "", groupId: 0, layerId: 3,
    ...operation.properties, fontFamily: "default", bold: 0, italic: 0, origin: "LEFT_BOTTOM", angle: 0,
    reverse: false, expansion: 0, mirror: false, locked: false, zIndex: -1, specialColor: null } };
}

export function expectedPcbTextLifecycleSource(input: unknown, before: NativeSourceSnapshot, ids: PcbTextLifecycleIds = {}): NativeSourceSnapshot {
  const operation = pcbTextLifecycleOperationSchema.parse(input);
  assertPcbTextLifecycleSupported(operation, before, ids);
  const objects = operation.action === "pcb.text.create"
    ? [...before.objects, createString(operation, nativeId.parse(ids.createdId))].toSorted((left, right) => left.id.localeCompare(right.id))
    : before.objects.filter((row) => row.id !== operation.target.primitiveId);
  const source = { schema: before.schema, document: before.document, objects };
  const expected = { ...source, sha256: sha256Json(source) };
  assertPcbTextSourceProfile(expected);
  return expected;
}

export function verifyPcbTextLifecycleSourceEffect(input: unknown, before: NativeSourceSnapshot, after: NativeSourceSnapshot,
  ids: PcbTextLifecycleIds = {}): NativeSourceDelta {
  const expected = expectedPcbTextLifecycleSource(input, before, ids);
  assertPcbTextSourceProfile(after);
  if (canonicalJson(expected) !== canonicalJson(after)) {
    throw new Error("Standalone PCB text lifecycle changed more than its exact journal-owned STRING addition or removal.");
  }
  return compareDocumentSources(before, after);
}

export function inversePcbTextLifecycleOperation(input: unknown, before: NativeSourceSnapshot,
  ids: PcbTextLifecycleIds = {}): PcbTextLifecycleOperation | undefined {
  const operation = pcbTextLifecycleOperationSchema.parse(input);
  assertPcbTextLifecycleSupported(operation, before, ids);
  // Restoring deleted geometry through create would allocate another identity
  // And would not restore native history. No automatic delete inverse exists.
  if (operation.action === "pcb.text.delete") { return undefined; }
  const inverse = pcbTextLifecycleOperationSchema.parse({ id: `inverse-${sha256Json(operation).slice(0, 32)}`,
    action: "pcb.text.delete", target: { primitiveId: nativeId.parse(ids.createdId) } });
  const restored = expectedPcbTextLifecycleSource(inverse, expectedPcbTextLifecycleSource(operation, before, ids));
  if (canonicalJson(restored) !== canonicalJson(before)) { throw new Error("Standalone PCB text creation inverse does not restore its exact source baseline."); }
  return inverse;
}

export function buildPcbTextLifecycleAdapter(input: unknown, before: NativeSourceSnapshot, history?: NativeHistorySnapshot,
  ids: PcbTextLifecycleIds = {}): DesignNativeAdapter {
  const operation = pcbTextLifecycleOperationSchema.parse(input);
  assertPcbTextLifecycleSupported(operation, before, ids);
  const scope = pcbTextRuntimeScope(before, history);
  if (operation.action === "pcb.text.create" && ids.createdId !== undefined) {
    throw new Error("Standalone PCB text creation cannot regenerate or redispatch a retained creation identity.");
  }
  // The builder is preparation-only. Its returned ID and program commitment
  // Must enter the immutable journal before dispatch. Recovery uses the saved
  // ID for projection, never this builder to mint a replacement or retry.
  const createdId = operation.action === "pcb.text.create" ? randomBytes(8).toString("hex") : undefined;
  if (createdId !== undefined && history?.documents.some((document) => document.uuid === createdId || document.records.some((row) => row.id === createdId)) === true) {
    throw new Error("Standalone PCB text creation identity collides with retained project history.");
  }
  const expected = expectedPcbTextLifecycleSource(operation, before, createdId === undefined ? ids : { ...ids, createdId });
  const adapter = buildReviewedNativeSourceMerge(before, expected, createdId);
  return { ...adapter, code: buildPcbTextLifecycleRuntime(before, expected, scope, createdId) };
}

export const PCB_TEXT_LIFECYCLE_LIMITATIONS = Object.freeze([
  "Native task-equivalent, not public pcb_PrimitiveString create/delete execution or full-contract parity; synthetic tests do not establish connected lifecycle validation.",
  "Creates one default-font top-silkscreen STRING with explicit native-mil x/y/fontSize/strokeWidth and bounded text; fixed LEFT_BOTTOM, zero angle, no mirror/reverse/expansion, unlocked and zIndex -1. No caller-supplied native ID, parent, style, layer or ordering.",
  "Creation identity is allocated once during preparation and retained with the exact program before dispatch. Verification and an explicit creation inverse use only that original journal identity; recovery never regenerates or repeats creation.",
  "Deletes one existing unlocked standalone STRING under the same full-source profile. Deletion has no automatic inverse; recreating text would not restore its original identity or history.",
  "All existing STRINGs and every source record must satisfy the existing conservative text profile. Existing exact null or #000000 color is preserved, while new text uses explicit null. Pours/generated copper, custom fonts, groups, partitions, ambiguous ATTR ownership and unsupported record families refuse.",
  "Uses one captured project/branch/tab/frame receiver and preserves unchanged raw source rows. Original decoder acknowledgment precedes post-write checks. Complete live and saved-project peer proofs remain mandatory; no visual, clearance or fabrication acceptance is inferred.",
]);
