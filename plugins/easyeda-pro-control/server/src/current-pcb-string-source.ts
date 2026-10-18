/** Offline current STRING encoding relation only. No native receiver, file read,
 * lifecycle token, writer, source reconstruction or compatibility admission. */
import { z } from "zod";
import { canonicalJson, isRecord, sha256Json, sha256Text } from "./core.ts";
import { currentPcbGeometryResultSchema, validateCurrentPcbGeometryResult } from "./current-pcb-geometry.ts";
import { currentPcbIdentitiesResultSchema, validateCurrentPcbIdentitiesResult } from "./current-pcb-identities.ts";
import { currentPcbLayersRequestSchema } from "./current-pcb-layers.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_STRING_SOURCE_PROFILE = "private.current-pcb-string-source.v1";
const MAX_RECORDS = 20_000, MAX_SOURCE_BYTES = 8_388_608, MAX_STRINGS = 256;
const MAX_JSON_DEPTH = 32, MAX_JSON_NODES = 500_000;
const identifier = z.string().regex(/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u);
const finite = z.number().min(-1e12).max(1e12).refine(value => !Object.is(value, -0));
const integer = finite.refine(Number.isSafeInteger);
const alignments = ["LEFT_TOP", "LEFT_MIDDLE", "LEFT_BOTTOM", "CENTER_TOP", "CENTER_MIDDLE", "CENTER_BOTTOM",
  "RIGHT_TOP", "RIGHT_MIDDLE", "RIGHT_BOTTOM"] as const;
// PCB217199c8: getSTRING@4001063, O3.getData@4418517, we@3214815,
// Pie@4007842. Retain the entire body separately; this schema projects nothing
// Away and is not permission to use an old decoder on the current application.
const encodedNumber = finite.refine(value => nativeRound(value) === value);
const stringBodySchema = z.object({ partitionId: z.literal(""), groupId: z.literal(0),
  layerId: integer.min(0).max(65_535), x: encodedNumber, y: encodedNumber,
  text: z.string().max(65_536), fontFamily: z.string().max(1024), fontSize: encodedNumber,
  strokeWidth: encodedNumber, bold: z.literal(0), italic: z.literal(0), origin: z.enum(alignments),
  angle: encodedNumber, reverse: z.boolean(), expansion: encodedNumber, mirror: z.boolean(),
  locked: z.boolean(), zIndex: integer.min(-1), specialColor: z.union([z.null(), z.string().min(1).max(128)]) }).loose()
  .refine(value => value.layerId === 3 || value.layerId === 4 || value.specialColor === null, "Non-silkscreen STRING color must be null.");
const selectedEvidenceSchema = z.object({ primitiveIds: z.array(z.string().min(1).max(256)).min(1).max(MAX_STRINGS), result: z.unknown() }).strict();
const evidenceSchema = z.object({ identities: z.unknown(), all: z.unknown(), selected: selectedEvidenceSchema.optional() }).strict();
type StringBody = z.infer<typeof stringBodySchema>;
type JsonObject = Record<string, unknown>;
export interface CurrentPcbStringSourceRecord {
  readonly raw: string;
  readonly header: JsonObject;
  readonly body: JsonObject;
}
export interface CurrentPcbStringSource {
  readonly profile: typeof CURRENT_PCB_STRING_SOURCE_PROFILE;
  readonly documentUuid: string;
  readonly source: string;
  readonly sourceSha256: string;
  readonly records: readonly CurrentPcbStringSourceRecord[];
  readonly strings: readonly Readonly<{ id: string; recordIndex: number; body: StringBody }>[];
  readonly executionAuthorized: false;
}
function need(value: boolean, detail: string): asserts value {
  if (!value) { throw new Error(`Current PCB STRING source: ${detail}.`); }
}
function nativeRound(value: number): number { return Math.round(value * 10_000 + 1e-10) / 10_000; }
interface JsonStep { readonly value: unknown; readonly depth: number; readonly exit?: boolean; }
interface JsonBudget { bytes: number; readonly maximum: number; }
function chargeJson(budget: JsonBudget, bytes: number): void {
  budget.bytes += bytes; need(budget.bytes <= budget.maximum, "JSON byte bound exceeded");
}
function chargeScalar(budget: JsonBudget, value: string | number | boolean | null): void {
  if (typeof value === "string") { need(value.length <= budget.maximum, "JSON string exceeds bound"); }
  const encoded = JSON.stringify(value); need(typeof encoded === "string", "non-JSON scalar");
  chargeJson(budget, Buffer.byteLength(encoded));
}
function visitJson(step: JsonStep, pending: JsonStep[], seen: Set<object>, budget: JsonBudget): void {
  const { value, depth } = step;
  if (value === null || typeof value === "boolean" || typeof value === "string") { chargeScalar(budget, value); return; }
  if (typeof value === "number") { need(Number.isFinite(value) && !Object.is(value, -0), "lossy JSON number"); chargeScalar(budget, value); return; }
  need(typeof value === "object" && !seen.has(value), "non-JSON value or cycle"); seen.add(value);
  pending.push({ value, depth, exit: true });
  const array = Array.isArray(value), prototype: unknown = Object.getPrototypeOf(value);
  need(prototype === (array ? Array.prototype : Object.prototype) || !array && prototype === null, "non-plain JSON object");
  const keys = Reflect.ownKeys(value); let arrayLength = 0;
  if (array) {
    const length = Object.getOwnPropertyDescriptor(value, "length");
    const size: unknown = length?.value;
    need(length !== undefined && Object.hasOwn(length, "value") && typeof size === "number" && Number.isSafeInteger(size) &&
      size >= 0 && size <= MAX_JSON_NODES && keys.length === size + 1, "sparse or oversized JSON array"); arrayLength = size;
  }
  need(keys.length <= MAX_JSON_NODES, "JSON field count exceeds bound");
  chargeJson(budget, 2 + Math.max(0, (array ? arrayLength : keys.length) - 1));
  for (const key of keys) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    need(typeof key === "string" && key.length <= budget.maximum && descriptor !== undefined && Object.hasOwn(descriptor, "value"), "accessor or symbol JSON field");
    if (!array || key !== "length") {
      need(descriptor.enumerable === true && (!array || /^(?:0|[1-9][0-9]*)$/u.test(key) && Number(key) < arrayLength), "unsupported JSON field");
      if (!array) { chargeScalar(budget, key); chargeJson(budget, 1); }
      pending.push({ value: descriptor.value as unknown, depth: depth + 1 });
    }
  }
}

/** Inspect own data before serializing supplied observations. Getters, toJSON,
 * sparse arrays, cycles and lossy numeric values are never invoked/coerced. */
function jsonText(input: unknown, maximum: number): string {
  const pending: JsonStep[] = [{ value: input, depth: 0 }];
  const budget: JsonBudget = { bytes: 0, maximum };
  const seen = new Set<object>(); let nodes = 0;
  while (pending.length > 0) {
    const next = pending.pop(); need(next !== undefined, "JSON traversal is incomplete");
    const { value, depth } = next;
    if (next.exit === true) { need(value !== null && typeof value === "object", "invalid JSON traversal"); seen.delete(value); }
    else { nodes += 1; need(nodes <= MAX_JSON_NODES && depth <= MAX_JSON_DEPTH, "JSON traversal bound exceeded"); visitJson(next, pending, seen, budget); }
  }
  const text = JSON.stringify(input); need(typeof text === "string" && Buffer.byteLength(text) <= maximum, "JSON byte bound exceeded"); return text;
}
function object(text: string): JsonObject {
  const value: unknown = JSON.parse(text);
  need(isRecord(value), "record must contain JSON objects");
  need(jsonText(value, MAX_SOURCE_BYTES) === text, "noncanonical or duplicate-key JSON encoding"); return value;
}
function assertStringBody(value: JsonObject): asserts value is StringBody { stringBodySchema.parse(value); }

/** Accept a complete supplied FileSource string, not stored history chunks or
 * a lossy NativeSourceSnapshot. Preserve every byte, header, peer and row order.
 * The caller's assertion of completeness is not verified by this pure parser. */
export function parseCurrentPcbStringSource(source: string, documentUuid: string): CurrentPcbStringSource {
  identifier.parse(documentUuid);
  need(typeof source === "string" && source.length > 0 && Buffer.byteLength(source) <= MAX_SOURCE_BYTES &&
    Buffer.from(source).toString("utf8") === source && !source.endsWith("|\n"), "source framing or byte bound differs");
  const lines = source.split("|\n"); need(lines.length > 0 && lines.length <= MAX_RECORDS + 1, "record count exceeds bound");
  const records: CurrentPcbStringSourceRecord[] = [], strings: { id: string; recordIndex: number; body: StringBody }[] = [];
  const ids = new Set<string>();
  for (const [recordIndex, raw] of lines.entries()) {
    const split = raw.indexOf("||"); need(split > 0, "record delimiter is missing");
    const header = object(raw.slice(0, split)); const body = object(raw.slice(split + 2)); const type = header["type"];
    need(typeof type === "string" && /^[A-Z][A-Z0-9_]{0,63}$/u.test(type), "record type is unsupported");
    if (recordIndex === 0) {
      need(type === "DOCHEAD" && body["uuid"] === documentUuid && body["docType"] === "PCB", "exact PCB document header differs");
    } else {
      const id = header["id"], ticket = header["ticket"];
      need(typeof id === "string" && id.length > 0 && id.length <= 2048 && !ids.has(id) &&
        typeof ticket === "number" && Number.isSafeInteger(ticket) && ticket >= 0 && !Object.is(ticket, -0), "record identity or ticket differs");
      need(!["DOCHEAD", "EDIT_HEAD", "DELETE", "DELETE_DOC", "GROUP", "PARTITION"].includes(type), "history or grouped/partitioned source is unsupported");
      ids.add(id);
      if (type === "STRING") {
        identifier.parse(id);
        // These fields are not current STRING encodings. Never interpret an
        // ATTR/component child or a new parent representation as standalone.
        for (const key of ["parentId", "parentUuid", "parent", "componentId", "groupID", "key", "showKey", "showValue", "positionIsNull"]) {
          need(!Object.hasOwn(body, key), "ambiguous STRING ownership or display encoding");
        }
        assertStringBody(body); need(strings.length < MAX_STRINGS, "STRING count exceeds bound");
        strings.push({ id, recordIndex, body });
      }
    }
    records.push({ raw, header, body });
  }
  return freezeDeep({ profile: CURRENT_PCB_STRING_SOURCE_PROFILE, documentUuid, source, sourceSha256: sha256Text(source),
    records, strings, executionAuthorized: false });
}

function exactField(body: StringBody, sourceField: string, row: JsonObject, readerField: string): void {
  need(Object.is(body[sourceField], row[readerField]), `STRING ${sourceField} projection differs`);
}
function roundedField(body: StringBody, sourceField: string, row: JsonObject, readerField: string): void {
  const value = row[readerField]; need(typeof value === "number" && Number.isFinite(value) && !Object.is(value, -0), "invalid reader scalar");
  // The angle mapper uses r*180/PI while the encoder uses r/PI*180. Refuse
  // Rounding ties within a conservative floating-point error margin rather
  // Than claim exact equivalence across those different arithmetic orders.
  if (sourceField === "angle") {
    const scaled = value * 10_000 + 1e-10; const boundaryDistance = Math.abs(scaled - Math.floor(scaled) - 0.5);
    need(boundaryDistance > Math.max(1, Math.abs(scaled)) * Number.EPSILON * 16, "ambiguous angle rounding boundary");
  }
  need(Object.is(body[sourceField], nativeRound(value)), `STRING ${sourceField} encoded projection differs`);
}
function compareRow(body: StringBody, row: JsonObject): void {
  for (const [sourceField, readerField] of [["layerId", "layer"], ["text", "text"], ["fontFamily", "fontFamily"],
    ["reverse", "reverse"], ["mirror", "mirror"], ["locked", "primitiveLock"]] as const) { exactField(body, sourceField, row, readerField); }
  for (const [sourceField, readerField] of [["x", "x"], ["y", "y"], ["fontSize", "fontSize"], ["strokeWidth", "lineWidth"],
    ["angle", "rotation"], ["expansion", "expansion"]] as const) { roundedField(body, sourceField, row, readerField); }
  need(row["alignMode"] === alignments.indexOf(body.origin) + 1, "STRING alignment projection differs");
}

/** Relate the raw payloads consumed by the existing identity/getAll/get result
 * validators. This checks supplied data only, not sampling, native membership,
 * source freshness, complete canvas state, rendering or durable storage. */
export function correlateCurrentPcbStringSource(source: string, targetInput: unknown, evidenceInput: unknown): Readonly<Record<string, unknown>> {
  const targetJson = jsonText(targetInput, 4096); const targetData: unknown = JSON.parse(targetJson);
  const target = currentPcbLayersRequestSchema.shape.target.parse(targetData);
  const parsed = parseCurrentPcbStringSource(source, target.documentUuid);
  const input: unknown = JSON.parse(jsonText(evidenceInput, 3 * 393_216));
  const evidence = evidenceSchema.parse(input);
  const idRequest = { target, method: "eda.pcb_PrimitiveString.getAllPrimitiveId", arguments: {} };
  const allRequest = { target, method: "eda.pcb_PrimitiveString.getAll", arguments: {} };
  validateCurrentPcbIdentitiesResult(idRequest, evidence.identities); validateCurrentPcbGeometryResult(allRequest, evidence.all);
  const ids = currentPcbIdentitiesResultSchema.parse(evidence.identities).observations[0]?.ids;
  const all = currentPcbGeometryResultSchema.parse(evidence.all), byId = new Map(parsed.strings.map(row => [row.id, row.body]));
  need(ids !== undefined && canonicalJson(ids) === canonicalJson(all.rows.map(row => row.primitiveId)) &&
    all.rows.length === parsed.strings.length, "complete STRING family identity relation differs");
  for (const row of all.rows) {
    const body = byId.get(row.primitiveId); need(body !== undefined && row.primitiveType === "String", "missing STRING source member");
    compareRow(body, row);
  }
  if (evidence.selected !== undefined) {
    const request = { target, method: "eda.pcb_PrimitiveString.get", arguments: { primitiveIds: evidence.selected.primitiveIds } };
    validateCurrentPcbGeometryResult(request, evidence.selected.result);
    const selected = currentPcbGeometryResultSchema.parse(evidence.selected.result);
    need("observedRowCount" in selected && selected.observedRowCount === all.rows.length, "selected reader observed count differs");
    const rows = new Map(all.rows.map(row => [row.primitiveId, row]));
    need(selected.rows.every(row => canonicalJson(row) === canonicalJson(rows.get(row.primitiveId))), "selected reader differs from complete family");
  }
  return freezeDeep({ profile: "private.current-pcb-string-source-relation.v1", target, sourceSha256: parsed.sourceSha256,
    evidenceSha256: sha256Json(input), sourceRecordCount: parsed.records.length, stringCount: parsed.strings.length,
    sourceStringOrder: parsed.strings.map(row => row.id), readerStringOrder: ids,
    selectedReaderCompared: evidence.selected !== undefined, encodedFieldRelation: "native-four-decimal-source-projection",
    omittedReaderFields: ["partitionId", "groupId", "bold", "italic", "zIndex", "specialColor", "unknown-fields"],
    unknownFieldsPreserved: true, completeSourceProvenanceVerified: false, liveReceiverVerified: false,
    parentOwnershipVerified: false, renderingVerified: false, persistenceVerified: false, writerSupported: false, executionAuthorized: false });
}
