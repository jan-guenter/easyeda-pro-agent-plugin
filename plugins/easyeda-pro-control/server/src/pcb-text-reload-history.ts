import { z } from "zod";
import { canonicalJson, sha256Json } from "./core.ts";
import type { UnknownRecord } from "./core.ts";
import type { NativeDocumentSnapshot } from "./native-history.ts";
import { appendNativeDocumentRecordChain, nativeDocumentRecordHistoryProjection, validateNativeDocumentRecordHistory } from "./native-document-record-history.ts";
import type { NativeDocumentRecordChain } from "./native-document-record-history.ts";

const PROFILE = "easyeda.native-history.pcb-text-reload-order.v1";
const hash = z.string().regex(/^[a-f0-9]{64}$/u);
const clock = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const chain = z.object({ recordCount: clock, maximumTicket: clock, chainSha256: hash }).strict();
const occurrence = z.object({ type: z.string(), id: z.string().nullable(), ticket: clock, client: z.string().nullable(),
  bodySha256: hash.nullable(), recordEncodingSha256: hash }).strict();
type Occurrence = z.infer<typeof occurrence>;
const schema = z.object({ profile: z.literal(PROFILE), checkpointSha256: hash, documentUuid: z.string(),
  strings: z.array(occurrence).max(10_000), nonStringIds: z.array(z.string()).max(100_000),
  tail: z.array(z.object({ before: chain, occurrence }).strict()).max(2), sha256: hash }).strict();
export type PcbTextReloadHistory = z.infer<typeof schema>;
export interface MutablePcbTextReloadHistory {
  readonly strings: Occurrence[];
  readonly nonStringIds: Set<string>;
  readonly tail: { readonly before: NativeDocumentRecordChain; readonly occurrence: Occurrence }[];
}

/** Supplemental evidence only. Called after the ordinary parser validates
 * every header and body, before materialization can discard old versions.
 * It admits no additional native fields and never changes selected records.
 */
export function retainPcbTextReloadRecord(history: MutablePcbTextReloadHistory, entry: {
  readonly header: UnknownRecord; readonly body: UnknownRecord | null; readonly recordEncodingSha256?: string;
}, inheritedClient: string | undefined, before: NativeDocumentRecordChain): void {
  const value = occurrence.parse({ type: entry.header["type"], id: entry.header["id"] ?? null,
    ticket: entry.header["ticket"], client: entry.header["client"] ?? inheritedClient ?? null,
    bodySha256: entry.body === null ? null : sha256Json(entry.body), recordEncodingSha256: entry.recordEncodingSha256 });
  history.tail.push({ before, occurrence: value });
  if (history.tail.length > 2) { history.tail.shift(); }
  if (value.type === "STRING") {
    if (history.strings.length >= 10_000) { throw new Error("PCB text reload occurrence limit exceeded."); }
    history.strings.push(value);
  } else if (value.id !== null) {
    history.nonStringIds.add(value.id);
    if (history.nonStringIds.size > 100_000) { throw new Error("PCB text historical identity limit exceeded."); }
  }
}
export function sealPcbTextReloadHistory(history: MutablePcbTextReloadHistory, checkpointSha256: string, documentUuid: string): PcbTextReloadHistory {
  const body = { profile: PROFILE, checkpointSha256, documentUuid, strings: history.strings,
    nonStringIds: [...history.nonStringIds].toSorted(), tail: history.tail };
  return schema.parse({ ...body, sha256: sha256Json(body) });
}
function read(document: NativeDocumentSnapshot, checkpointSha256: string): PcbTextReloadHistory {
  const value = schema.parse(document.pcbTextReloadHistory), { sha256, ...body } = value;
  validateNativeDocumentRecordHistory(document, checkpointSha256);
  if (document.docType !== "PCB" || value.documentUuid !== document.uuid || value.checkpointSha256 !== checkpointSha256 || sha256 !== sha256Json(body)) {
    throw new Error("PCB text reload evidence lost its immutable checkpoint binding.");
  }
  return value;
}
function same(actual: unknown, expected: unknown): void {
  if (canonicalJson(actual) !== canonicalJson(expected)) { throw new Error("PCB text reload raw occurrence history changed."); }
}

/** The pinned ordinary editor requests needNum=true. Worker compress sorts
 * selected IDs by the oldest physical version's firstTicket||ticket, not the
 * newest materialized ticket or ID. Strict history rejects firstTicket here;
 * strict unequal oldest tickets avoid the native client tie-break entirely.
 */
export function verifyLegacyPcbTextReloadOrder(input: {
  readonly before: NativeDocumentSnapshot; readonly after: NativeDocumentSnapshot;
  readonly beforeCheckpointSha256: string; readonly afterCheckpointSha256: string;
  readonly originalId: string; readonly createdId: string;
}): Record<string, unknown> {
  if (input.before.uuid !== input.after.uuid) { throw new Error("Legacy PCB text reload changed document identity."); }
  const old = read(input.before, input.beforeCheckpointSha256);
  const next = read(input.after, input.afterCheckpointSha256);
  const oldStrings = input.before.records.filter((row) => row.type === "STRING");
  const newStrings = input.after.records.filter((row) => row.type === "STRING");
  const original = oldStrings[0];
  const created = newStrings.find((row) => row.id === input.createdId);
  if (oldStrings.length !== 1 || original?.id !== input.originalId || original.body["specialColor"] !== "#000000" ||
      newStrings.length !== 2 || created?.body["specialColor"] !== null || old.strings.length === 0 ||
      next.strings.length !== old.strings.length + 1) { throw new Error("Legacy PCB text reload requires exactly one original black and one new null STRING."); }
  if (old.nonStringIds.includes(original.id) || old.nonStringIds.includes(input.createdId)) {
    throw new Error("Legacy PCB text identity had a previous non-STRING physical occurrence.");
  }
  same(next.nonStringIds, old.nonStringIds);
  const clocks = new Set<string>();
  for (const row of old.strings) {
    const key = String(row.ticket);
    if (row.id !== original.id || row.bodySha256 === null || row.client === null || clocks.has(key)) {
      throw new Error("Legacy PCB text reload has an unseen, deleted or duplicate STRING occurrence.");
    }
    clocks.add(key);
  }
  same(next.strings.slice(0, -1), old.strings);
  const addition = next.strings.at(-1);
  if (addition?.id !== input.createdId || addition.bodySha256 !== sha256Json(created.body) || addition.ticket !== created.ticket ||
      addition.client !== created.client || created.client === null || created.ticket <= nativeDocumentRecordHistoryProjection(input.before).maximumTicket) { throw new Error("Legacy PCB text reload lacks the original stored null creation."); }
  const oldest = Math.min(...old.strings.map((row) => row.ticket));
  if (oldest >= created.ticket) { throw new Error("Legacy PCB text reload order is reversed or ambiguous."); }
  const [head, atom] = next.tail;
  if (head === undefined || atom === undefined || head.occurrence.type !== "DOCHEAD" || head.occurrence.id !== null ||
      head.occurrence.bodySha256 !== sha256Json(input.after.metadata) || head.occurrence.ticket <= created.ticket ||
      atom.occurrence.type !== "STRING") { throw new Error("Legacy PCB text history is not one native DOCHEAD/STRING append."); }
  same(head.before, nativeDocumentRecordHistoryProjection(input.before));
  same(atom.occurrence, addition);
  const afterHead = appendNativeDocumentRecordChain(head.before, head.occurrence.recordEncodingSha256, head.occurrence.ticket);
  same(atom.before, afterHead);
  same(nativeDocumentRecordHistoryProjection(input.after), appendNativeDocumentRecordChain(afterHead, atom.occurrence.recordEncodingSha256, atom.occurrence.ticket));
  if (nativeDocumentRecordHistoryProjection(input.after).recordCount !== head.before.recordCount + 2) {
    throw new Error("Legacy PCB text target history has additional raw records.");
  }
  return { profile: PROFILE, documentUuid: input.before.uuid, beforeCheckpointSha256: input.beforeCheckpointSha256,
    afterCheckpointSha256: input.afterCheckpointSha256, ordinaryEditorNeedNum: true, oldestOriginalTicket: oldest,
    selectedOriginalTicket: original.ticket, createdTicket: created.ticket, decoderStringOrder: [original.id, created.id],
    originalStringOccurrenceCount: old.strings.length, addedStringOccurrenceCount: 1,
    originalCreatedIdAbsentFromAllHistoricalRecordTypes: true,
    targetRawPrefixUnchanged: true, targetRawSuffixTypes: ["DOCHEAD", "STRING"],
    excludes: ["EDIT_HEAD", "chunk-boundary", "cross-document-order"] };
}
