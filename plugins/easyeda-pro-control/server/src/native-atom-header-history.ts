import { createHash } from "node:crypto";
import { z } from "zod";
import { canonicalJson, sha256Json } from "./core.ts";

const PROFILE = "easyeda.native-history.library-atom-headers.v1";
// The existing materializer permits at most one million records in total.
// Supplemental evidence shares that bound; it never drops or truncates rows.
const MAX_OCCURRENCES = 1_000_000;
const HASH_BATCH_RECORDS = 512;
const HASH_BATCH_BYTES = 256 * 1024;
// Only the cooperative constructor can register immutable generated proofs.
// Deserialized/caller-built evidence must use the full untrusted verifier.
const generatedHistories = new WeakSet<NativeAtomHeaderHistory>();
const hashSchema = z.string().regex(/^[a-f0-9]{64}$/u);
const clockSchema = z.number().int().min(0).max(Number.MAX_SAFE_INTEGER).refine((value) => !Object.is(value, -0));
const occurrenceSchema = z.strictObject({
  chunkIndex: z.number().int().min(0).max(MAX_OCCURRENCES - 1),
  recordIndex: z.number().int().min(0).max(249_999),
  id: z.string().min(1).max(4096),
  type: z.string().regex(/^[A-Z][A-Z0-9_]{0,63}$/u),
  ticket: clockSchema,
  client: z.string().min(1).max(128).nullable(),
  clientSource: z.enum(["explicit", "inherited", "missing"]),
  serializedFirstTicket: clockSchema.optional(),
  headerSha256: hashSchema,
  bodySha256: hashSchema.nullable(),
  bodyEncodingSha256: hashSchema.nullable(),
  tombstone: z.boolean(),
}).superRefine((value, context) => {
  if ((Object.hasOwn(value, "serializedFirstTicket") && value.serializedFirstTicket === undefined) ||
      (value.clientSource === "missing") !== (value.client === null) ||
      value.tombstone !== (value.bodySha256 === null) ||
      value.tombstone !== (value.bodyEncodingSha256 === null) ||
      (value.serializedFirstTicket !== undefined &&
        (value.serializedFirstTicket > value.ticket || value.id === "DELETE_DOC" || ["META", "DELETE_DOC", "DOCHEAD", "EDIT_HEAD"].includes(value.type))) ||
      ["DOCHEAD", "EDIT_HEAD"].includes(value.type)) {
    context.addIssue({ code: "custom", message: "Unsupported atom header occurrence." });
  }
});

export type NativeAtomHeaderOccurrence = z.infer<typeof occurrenceSchema>;

export interface NativeAtomHeaderHistory {
  readonly profile: typeof PROFILE;
  readonly checkpointSha256: string;
  readonly documentUuid: string;
  readonly docType: "SYMBOL" | "FOOTPRINT";
  readonly occurrences: readonly NativeAtomHeaderOccurrence[];
  readonly occurrencesSha256: string;
  readonly sha256: string;
}

export interface NativeAtomHeaderBinding {
  readonly checkpointSha256: string;
  readonly documentUuid: string;
  readonly docType: "SYMBOL" | "FOOTPRINT";
}

const bindingSchema = z.strictObject({
  checkpointSha256: hashSchema,
  documentUuid: z.string().min(1).max(128),
  docType: z.enum(["SYMBOL", "FOOTPRINT"]),
});
const historySchema = bindingSchema.extend({
  profile: z.literal(PROFILE),
  occurrences: z.array(occurrenceSchema).min(1).max(MAX_OCCURRENCES),
  occurrencesSha256: hashSchema,
  sha256: hashSchema,
});

function fail(): never {
  throw new Error("Unsupported or mismatched native library atom-header provenance.");
}

function appendJsonChildren(value: object, depth: number, pending: { value: unknown; depth: number }[]): void {
  const array = Array.isArray(value);
  const prototype: unknown = Object.getPrototypeOf(value);
  if ((array && prototype !== Array.prototype) || (!array && prototype !== Object.prototype && prototype !== null)) { fail(); }
  const descriptors = Object.getOwnPropertyDescriptors(value);
  const keys = Reflect.ownKeys(descriptors);
  if (array) {
    const length: unknown = descriptors["length"]?.value;
    if (typeof length !== "number" || !Number.isSafeInteger(length) || length < 0 || length > MAX_OCCURRENCES || keys.length !== length + 1) { fail(); }
  }
  for (const key of keys) {
    if (typeof key !== "string" || ["__proto__", "constructor", "prototype"].includes(key)) { fail(); }
    const descriptor = descriptors[key];
    if (descriptor === undefined || !Object.hasOwn(descriptor, "value")) { fail(); }
    if (!(array && key === "length")) {
      if (descriptor.enumerable !== true || (array && !/^(?:0|[1-9][0-9]*)$/u.test(key))) { fail(); }
      const child: unknown = descriptor.value;
      pending.push({ value: child, depth: depth + 1 });
    }
  }
}

/** Evidence is JSON data, never callable objects. Inspect descriptors before
 * reading values so getters, sparse arrays and own undefined fields refuse.
 * The shallow evidence schema has no executable or recursively nested fields.
 */
function requireJsonData(value: unknown): void {
  const pending = [{ value, depth: 0 }];
  const seen = new Set<object>();
  let nodes = 0;
  while (pending.length > 0) {
    const item = pending.pop();
    nodes += 1;
    if (item === undefined || item.depth > 5 || nodes > MAX_OCCURRENCES * 16 + 32) { fail(); }
    if (typeof item.value === "number") {
      if (!Number.isFinite(item.value) || Object.is(item.value, -0)) { fail(); }
    } else if (item.value !== null && typeof item.value === "object") {
      if (seen.has(item.value)) { fail(); }
      seen.add(item.value);
      appendJsonChildren(item.value, item.depth, pending);
    } else if (item.value !== null && typeof item.value !== "string" && typeof item.value !== "boolean") {
      fail();
    }
  }
}

/** Complete, ordered canonical occurrences are newline-framed before hashing.
 * Canonical JSON escapes string newlines, so the boundary is unambiguous. The
 * separate commitment includes checkpoint/document identity and exact count.
 * This proves retained evidence integrity, not independent authenticity.
 */
export function* createNativeAtomHeaderHistorySteps(binding: NativeAtomHeaderBinding,
  occurrences: readonly NativeAtomHeaderOccurrence[]): Generator<void, NativeAtomHeaderHistory, undefined> {
  requireJsonData(binding);
  const parsedBinding = bindingSchema.safeParse(binding);
  const occurrenceCount = occurrences.length;
  if (!parsedBinding.success || occurrenceCount === 0 || occurrenceCount > MAX_OCCURRENCES) { fail(); }
  const capturedBinding = Object.freeze(parsedBinding.data);
  const hash = createHash("sha256");
  const retained: NativeAtomHeaderOccurrence[] = [];
  let previous: NativeAtomHeaderOccurrence | undefined;
  let hasFirstTicket = false;
  let batchRecords = 0;
  let batchBytes = 0;
  for (let index = 0; index < occurrenceCount; index += 1) {
    if (occurrences.length !== occurrenceCount) { fail(); }
    const occurrence = occurrences[index];
    requireJsonData(occurrence);
    const parsedOccurrence = occurrenceSchema.safeParse(occurrence);
    if (!parsedOccurrence.success) { fail(); }
    const captured = Object.freeze(parsedOccurrence.data);
    if (previous !== undefined && (captured.chunkIndex < previous.chunkIndex ||
        (captured.chunkIndex === previous.chunkIndex && captured.recordIndex <= previous.recordIndex))) { fail(); }
    retained.push(captured);
    hasFirstTicket ||= Object.hasOwn(captured, "serializedFirstTicket");
    const encoded = canonicalJson(captured);
    hash.update(encoded).update("\n");
    previous = captured;
    batchRecords += 1;
    batchBytes += Buffer.byteLength(encoded);
    if (batchRecords >= HASH_BATCH_RECORDS || batchBytes >= HASH_BATCH_BYTES) {
      batchRecords = 0;
      batchBytes = 0;
      yield;
    }
  }
  if (!hasFirstTicket || occurrences.length !== occurrenceCount) { fail(); }
  const occurrencesSha256 = hash.digest("hex");
  const commitment = { profile: PROFILE, ...capturedBinding, occurrenceCount: retained.length, occurrencesSha256 };
  const result = Object.freeze({ profile: PROFILE, ...capturedBinding, occurrences: Object.freeze(retained), occurrencesSha256, sha256: sha256Json(commitment) });
  generatedHistories.add(result);
  return result;
}

/** Internal fresh-reader fast path. The constructor already validated and
 * hashed every occurrence with cooperative yields, then froze every object.
 * A retained/serialized/caller-cloned proof is deliberately not accepted here.
 * The object identity is not a source authenticity token or write authority.
 */
export function verifyGeneratedNativeAtomHeaderHistory(value: NativeAtomHeaderHistory, expected: NativeAtomHeaderBinding): NativeAtomHeaderHistory {
  requireJsonData(expected);
  const binding = bindingSchema.safeParse(expected);
  if (!binding.success || !generatedHistories.has(value) || value.checkpointSha256 !== binding.data.checkpointSha256 ||
      value.documentUuid !== binding.data.documentUuid || value.docType !== binding.data.docType) { fail(); }
  return value;
}

/** Validate an already checkpoint-bound retained proof. A caller still needs
 * the independently verified checkpoint and complete source comparison; this
 * checksum is neither a signature nor permission to mutate imported assets.
 */
export function verifyNativeAtomHeaderHistory(value: unknown, expected: NativeAtomHeaderBinding): NativeAtomHeaderHistory {
  requireJsonData(value);
  requireJsonData(expected);
  const parsed = historySchema.safeParse(value);
  if (!parsed.success || !bindingSchema.safeParse(expected).success ||
      parsed.data.checkpointSha256 !== expected.checkpointSha256 ||
      parsed.data.documentUuid !== expected.documentUuid || parsed.data.docType !== expected.docType) { fail(); }
  const steps = createNativeAtomHeaderHistorySteps(expected, parsed.data.occurrences);
  let step = steps.next();
  while (step.done !== true) { step = steps.next(); }
  if (step.value.sha256 !== parsed.data.sha256 || step.value.occurrencesSha256 !== parsed.data.occurrencesSha256) { fail(); }
  // Verification of a serialized claim must not create a fresh-reader brand.
  generatedHistories.delete(step.value);
  return step.value;
}
