/** Pure supplied-data candidate only. No native observation, queue, dispatch,
 * persistence proof or token that an executor can consume. */
import { z } from "zod";
import { sha256Json, sha256Text } from "./core.ts";
import { parseCurrentPcbStringSource } from "./current-pcb-string-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const number = z.number().min(-1e11).max(1e11).refine(value => !Object.is(value, -0));
const integer = number.refine(Number.isSafeInteger);
const identifier = z.string().regex(/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u);
// PCB217199c8: Qy.fontPath literal@3628338..3635614 has every printable ASCII
// Glyph. RGe@4407316 can switch the font/type for other characters. Deliberately
// Exclude controls and Unicode here; this is not a general text or font writer.
const text = z.string().min(1).max(65_536).regex(/^[\u0020-\u007E]+$/u);
const nativeSchema = z.object({
  globalIndex: identifier, partitionId: z.literal(""), groupId: z.literal(0), parentId: z.null(), modelType: z.literal(0),
  layerId: z.union([z.literal(3), z.literal(4)]), key: z.literal(""), showKey: z.literal(false), value: text,
  showValue: z.literal(true), fontFamily: z.literal("default"), fontSize: number.positive(), rotation: number,
  locked: z.literal(false), position: z.object({ x: number, y: number }).strict(), origin: integer.min(1).max(9),
  strokeWidth: number.positive(), reverse: z.boolean(), reverseExpansion: number, silkColor: z.union([z.null(), z.string().min(1).max(128)]),
  mirror: z.boolean(), positionIsNull: z.literal(false), zIndex: integer.min(-1),
}).strict().refine(value => value.strokeWidth < value.fontSize, "Unsupported default-font width.");
const patchSchema = z.object({ x: number.optional(), y: number.optional(), text: text.optional() }).strict()
  .refine(value => Object.keys(value).length > 0, "Empty patch.");
const alignments = ["LEFT_TOP", "LEFT_MIDDLE", "LEFT_BOTTOM", "CENTER_TOP", "CENTER_MIDDLE", "CENTER_BOTTOM",
  "RIGHT_TOP", "RIGHT_MIDDLE", "RIGHT_BOTTOM"] as const;
type Native = z.infer<typeof nativeSchema>;
type Patch = z.infer<typeof patchSchema>;
interface NativeData {
  readonly layer: number;
  readonly reverse: boolean;
  readonly mirror: boolean;
  readonly primitiveLock: false;
  x?: number;
  y?: number;
  text?: string;
}
function need(value: boolean, detail: string): asserts value {
  if (!value) { throw new Error(`Current PCB STRING candidate: ${detail}.`); }
}
function round(value: number): number { return Math.round(value * 10_000 + 1e-10) / 10_000; }

/** Bound and copy the two small supplied JSON records before schema parsing.
 * No accessor, prototype method, toJSON or numeric coercion is invoked. */
function data(input: unknown, depth = 0): unknown {
  if (input === null || typeof input === "boolean") { return input; }
  if (typeof input === "string") { need(input.length <= 65_536, "string exceeds bound"); return input; }
  if (typeof input === "number") { need(Number.isFinite(input) && !Object.is(input, -0), "lossy number"); return input; }
  need(input !== null && typeof input === "object" && depth < 2, "non-data or nested input");
  const prototype: unknown = Object.getPrototypeOf(input);
  need(prototype === Object.prototype || prototype === null, "non-plain input");
  const keys = Reflect.ownKeys(input); need(keys.length <= 32, "field count exceeds bound");
  const entries: [string, unknown][] = [];
  for (const key of keys) {
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    need(typeof key === "string" && key.length <= 64 && descriptor !== undefined && Object.hasOwn(descriptor, "value") &&
      descriptor.enumerable === true, "accessor or unsupported input field");
    entries.push([key, data(descriptor.value as unknown, depth + 1)]);
  }
  return Object.fromEntries(entries);
}

function encoded(native: Native): Record<string, unknown> {
  // O3@4418517 uses rotation/PI*180, not the public reader's other arithmetic
  // Order. This snapshot retains native radians and internal distance units.
  return { partitionId: native.partitionId, groupId: native.groupId, layerId: native.layerId,
    x: round(native.position.x * 10), y: round(native.position.y * 10), text: native.value,
    fontFamily: native.fontFamily, fontSize: round(native.fontSize * 10), strokeWidth: round(native.strokeWidth * 10),
    bold: 0, italic: 0, origin: alignments[native.origin - 1], angle: round(native.rotation / Math.PI * 180),
    reverse: native.reverse, expansion: round(native.reverseExpansion * 10), mirror: native.mirror,
    locked: native.locked, zIndex: native.zIndex, specialColor: native.silkColor };
}

function coordinate(before: number, desired: number): number {
  const after = desired / 10;
  need(Number.isFinite(after) && !Object.is(after, -0), "unsupported coordinate division");
  // Handler@10395251 checks >1e-10. yr.position@7378095 then uses S.equals1
  // @1064019 with Dt.eps=1e-8@1024699. For these one-axis assignments, that
  // Latter gate dominates. rd.position@3982263 uses xLe@1043449, which is
  // Unconditionally false for differences >1e-8 with its omitted precision.
  return Math.abs(before - after) > 1e-8 ? after : before;
}

/** Plan only against supplied raw source and selected expanded native-model
 * scalars, not a complete model snapshot. Current SDK DTOs lack fields this
 * function requires. Matching them
 * is still not observation/provenance: an eventual executor MUST independently
 * obtain complete live/stored baselines, original frame/receiver ownership,
 * queue completion, exact collateral effects and saved/reopened SQL proof.
 * No boolean from the caller can assert or replace any of those prerequisites.
 *
 * expectedSourceProjection keeps the supplied headers and unknown records. It
 * predicts the selected encoded-field relation, not FileSource output headers,
 * native compiler uploads, new tickets, a durable source or a complete effect.
 * Peer color/null encodings stay distinct as supplied; no decoder, replay or
 * saved/reopened color-inheritance behavior is admitted by this projection.
 */
export function planCurrentPcbStringPatch(source: string, documentUuid: string, nativeInput: unknown, patchInput: unknown): Readonly<Record<string, unknown>> {
  const parsed = parseCurrentPcbStringSource(source, documentUuid);
  const native = nativeSchema.parse(data(nativeInput)), patch = patchSchema.parse(data(patchInput));
  const selected = parsed.strings.find(row => row.id === native.globalIndex);
  need(selected !== undefined, "native identity absent from supplied source");
  const before = encoded(native);
  for (const [key, value] of Object.entries(before)) {
    need(Object.is(selected.body[key], value), `supplied native ${key} differs from source`);
  }
  const after: Native = { ...native, position: { ...native.position } };
  const nativeData: NativeData = { layer: native.layerId, reverse: native.reverse, mirror: native.mirror, primitiveLock: false };
  const ignored: (keyof Patch)[] = [];
  for (const key of ["x", "y"] as const) {
    const desired = patch[key];
    if (desired !== undefined) {
      const result = coordinate(native.position[key], desired);
      if (Object.is(result, native.position[key])) { ignored.push(key); }
      else {
        need(!Object.is(round(result * 10), before[key]), "coordinate change is invisible in encoded source");
        after.position[key] = result; nativeData[key] = desired;
      }
    }
  }
  if (patch.text !== undefined) {
    if (patch.text === native.value) { ignored.push("text"); }
    else { after.value = patch.text; nativeData.text = patch.text; }
  }
  const afterEncoded = encoded(after), changed = Object.keys(afterEncoded).filter(key => !Object.is(before[key], afterEncoded[key]));
  need(!Object.values(afterEncoded).some(value => typeof value === "number" && (!Number.isFinite(value) || Object.is(value, -0))), "lossy predicted encoding");
  need(changed.every(key => ["x", "y", "text"].includes(key)), "unexpected encoded-field change");
  const body = { ...selected.body };
  for (const key of changed) { body[key] = afterEncoded[key]; }
  const record = parsed.records[selected.recordIndex]; need(record !== undefined, "source record missing");
  const expectedSourceProjection = parsed.records.map((row, index) => index === selected.recordIndex && changed.length > 0
    ? `${JSON.stringify(record.header)}||${JSON.stringify(body)}` : row.raw).join("|\n");
  // Reuse the strict framing/encoding bounds. In particular, JSON must not
  // Silently serialize a predicted -0 as +0 or accept unsupported roundoff.
  parseCurrentPcbStringSource(expectedSourceProjection, documentUuid);
  return freezeDeep({ profile: "private.current-pcb-string-patch-candidate.v1", documentUuid, primitiveId: native.globalIndex,
    sourceSha256: parsed.sourceSha256, suppliedNativeSha256: sha256Json(native), suppliedPatchSha256: sha256Json(patch),
    candidateArguments: changed.length === 0 ? null : { primitiveId: native.globalIndex, data: nativeData },
    noOp: changed.length === 0, ignoredRequestedFields: ignored, changedEncodedFields: changed,
    expectedNativeSnapshot: after, expectedSourceProjection, expectedSourceProjectionSha256: sha256Text(expectedSourceProjection),
    sourceHeadersPreservedOnlyForComparison: true, unknownFieldsPreservedOnlyForComparison: true,
    completeSourceProvenanceVerified: false, liveReceiverVerified: false, parentOwnershipVerified: false,
    completeLiveBaselineVerified: false, completeStoredBaselineVerified: false, nativeModelTypeVerified: false,
    queueCompletionVerified: false, completeEffectVerified: false, renderingVerified: false, persistenceVerified: false,
    writerSupported: false, executionAuthorized: false });
}
