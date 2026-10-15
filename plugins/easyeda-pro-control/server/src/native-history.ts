import { createDecipheriv, createHash } from "node:crypto";
import { constants } from "node:fs";
import { lstat, open } from "node:fs/promises";
import { isAbsolute } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { TextDecoder, promisify } from "node:util";
import { gunzip } from "node:zlib";
import { canonicalJson, isRecord, sha256Json } from "./core.ts";
import type { UnknownRecord } from "./core.ts";
import { yieldProofEventLoop } from "./cooperative-proof.ts";
import { createNativeAtomHeaderHistorySteps } from "./native-atom-header-history.ts";
import type { NativeAtomHeaderHistory, NativeAtomHeaderOccurrence } from "./native-atom-header-history.ts";
// oxlint-disable-next-line import/max-dependencies -- The explicit closed-container opt-in reuses one audited record commitment helper without changing default history semantics.
import { appendNativeDocumentRecordChain, emptyNativeDocumentRecordChain, sealNativeDocumentRecordHistory } from "./native-document-record-history.ts";
import type { NativeDocumentRecordChain, NativeDocumentRecordHistory } from "./native-document-record-history.ts";
import { retainPcbTextReloadRecord, sealPcbTextReloadHistory } from "./pcb-text-reload-history.ts";
import type { MutablePcbTextReloadHistory, PcbTextReloadHistory } from "./pcb-text-reload-history.ts";

const unzip = promisify(gunzip);
const UUID = /^[a-f0-9]{32}$/u;
const MAX_DATABASE_BYTES = 256 * 1024 * 1024;
const MAX_CIPHER_BYTES = 16 * 1024 * 1024;
const MAX_CHUNK_BYTES = 32 * 1024 * 1024;
const MAX_TOTAL_BYTES = 256 * 1024 * 1024;
const MAX_CHUNK_RECORDS = 250_000;
// A complete edit history can span multiple individually bounded chunks.
// Bound aggregate parsing work separately without increasing the 32 MiB chunk,
// 256 MiB total plaintext, 256 MiB database or 4096-history-row limits.
const MAX_TOTAL_RECORDS = 1_000_000;
const MAX_HISTORY_ROWS = 4096;
const COOPERATIVE_RECORD_BATCH = 512;
const COOPERATIVE_BYTE_BATCH = 256 * 1024;
const PROFILE = "easyeda.native-history.linear-gcm-gzip.v1";
const DOCUMENT_TYPES = new Set([
  "SCH", "SCH_PAGE", "PCB", "PANEL", "PANEL_LIB", "SYMBOL", "FOOTPRINT",
  "DEVICE", "BLOB", "INSTANCE", "CONFIG", "BOARD", "FONT", "VARIANT",
  "COMPONENT_GROUP", "COMPONENT_GROUP_DATA", "SIMULATION",
]);

export interface NativeHistoryChunk {
  readonly historyUuid: string;
  readonly keyHex: string;
  readonly dataBase64: string;
}

export interface NativeObjectSnapshot {
  readonly id: string;
  readonly type: string;
  readonly ticket: number;
  readonly client: string | null;
  /** Supplemental SCH_PAGE ATTR insertion-clock evidence; not semantic content. */
  readonly firstTicket?: number;
  readonly firstClient?: string | null;
  readonly body: UnknownRecord;
}

export interface NativeDocumentSnapshot {
  readonly uuid: string;
  readonly docType: string;
  readonly metadata: UnknownRecord;
  readonly records: readonly NativeObjectSnapshot[];
  readonly semanticSha256: string;
  /** Supplemental checkpoint-bound DOCHEAD provenance, never semantic content. */
  readonly headerHistory?: NativeDocumentHeaderHistory;
  /** Explicit readonly library-import profile only; never semantic content. */
  readonly atomHeaderHistory?: NativeAtomHeaderHistory;
  /** Explicit closed-container writer opt-in; not semantic content. */
  readonly documentRecordHistory?: NativeDocumentRecordHistory;
  /** Explicit retained-Save recovery opt-in; never semantic content. */
  readonly pcbTextReloadHistory?: PcbTextReloadHistory;
}

export interface NativeHistoryMaterializationOptions {
  /** Internal readonly opt-in. Existing lifecycle/writer callers stay strict. */
  readonly libraryAtomHeaders?: "preserve";
  readonly documentRecordHistory?: "preserve";
  readonly pcbTextReloadOrder?: "preserve";
}

export interface NativeDocumentHeaderHistory {
  readonly profile: "easyeda.native-history.schematic-header-lineage.v1";
  readonly checkpointSha256: string;
  readonly documentUuid: string;
  readonly headers: readonly { readonly ticket: number; readonly metadata: UnknownRecord }[];
  readonly sha256: string;
}

export interface NativeHistorySnapshot {
  readonly profile: typeof PROFILE;
  readonly projectUuid: string;
  readonly projectOwnerUuid?: string;
  readonly branchUuid: string;
  readonly headHistoryUuid: string;
  readonly checkpointSha256: string;
  readonly historyRowCount: number;
  readonly chunkCount: number;
  readonly plaintextBytes: number;
  readonly documents: readonly NativeDocumentSnapshot[];
  readonly semanticSha256: string;
}

interface NativeRecord {
  readonly header: UnknownRecord;
  readonly body: UnknownRecord | null;
  readonly headerSha256?: string;
  readonly bodyEncodingSha256?: string | null;
  readonly recordEncodingSha256?: string;
}

interface LibraryAtomHistory {
  readonly occurrences: NativeAtomHeaderOccurrence[];
  readonly clocks: Map<string, Map<number, Map<string | null, string>>>;
  hasFirstTicket: boolean;
}

interface MutableDocument {
  readonly uuid: string;
  readonly docType: string;
  metadata: UnknownRecord;
  metadataTicket: number;
  readonly objects: Map<string, NativeObjectSnapshot | Tombstone>;
  readonly firstClocks: Map<string, NativeFirstClock>;
  /** Null disables supplemental proof after stale clocks or any deletion marker. */
  metadataHeaders: { readonly ticket: number; readonly metadata: UnknownRecord }[] | null;
  readonly libraryAtoms?: LibraryAtomHistory;
  documentRecordChain?: NativeDocumentRecordChain;
  readonly pcbTextReloadHistory?: MutablePcbTextReloadHistory;
}

interface NativeFirstClock {
  readonly ticket: number;
  readonly client: string | null;
  readonly ambiguous: boolean;
}

interface Tombstone {
  readonly id: string;
  readonly type: string;
  readonly ticket: number;
  readonly client: string | null;
  readonly body: null;
}

type NativeHistoryStage = "record-invalid" | "chunk-decode" | "chunk-encoding" | "total-bytes-limit" | "total-records-limit" | "record-ticket-conflict" | "record-client-conflict" | "record-type-conflict" | "document-type" | "document-ticket-conflict" | "delete-document" | "checkpoint-input" | "checkpoint-file" | "checkpoint-hash" | "project-scope" | "history-chain" | "history-snapshot" | "history-chunk" | "checkpoint-stability" | "atom-header-profile";
class NativeHistoryError extends Error {
  public constructor(stage: NativeHistoryStage) {
    super(`Unsupported, malformed, unstable or unauthenticated native history (${stage}).`);
    this.name = "NativeHistoryError";
  }
}
function fail(stage: NativeHistoryStage = "record-invalid"): never {
  // Never include ciphertext, keys, native records or underlying crypto errors.
  throw new NativeHistoryError(stage);
}
function retainMetadataHeader(document: MutableDocument, ticket: number, metadata: UnknownRecord): void {
  const headers = document.metadataHeaders;
  const last = headers?.at(-1);
  if (headers === null || last === undefined) { return; }
  if (ticket < last.ticket || (ticket === last.ticket && canonicalJson(last.metadata) !== canonicalJson(metadata)) ||
      (ticket > last.ticket && headers.length >= MAX_HISTORY_ROWS)) { document.metadataHeaders = null; }
  else if (ticket > last.ticket) { headers.push({ ticket, metadata }); }
}

function record(value: unknown): UnknownRecord {
  if (!isRecord(value)) {fail();}
  return value;
}

function text(value: unknown, maximum = 4096): string {
  if (typeof value !== "string" || value.length === 0 || value.length > maximum) {fail();}
  return value;
}

function uuid(value: unknown): string {
  const result = text(value, 32);
  if (!UUID.test(result)) {fail();}
  return result;
}

function integer(value: unknown, maximum = Number.MAX_SAFE_INTEGER): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0 || value > maximum) {fail();}
  return value;
}

function optionalClient(value: unknown): string | null {
  if (value === undefined) {return null;}
  return text(value, 128);
}

function rejectDuplicateJsonKeys(source: string): void {
  const containers: (Set<string> | null)[] = [];
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (character === "{") {containers.push(new Set());}
    else if (character === "[") {containers.push(null);}
    else if (character === "}" || character === "]") {containers.pop();}
    else if (character === '"') {
      const start = index;
      index += 1;
      while (index < source.length && source[index] !== '"') {
        if (source[index] === "\\") {index += 1;}
        index += 1;
      }
      let next = index + 1;
      while (/[\t\n\r ]/u.test(source[next] ?? "x")) {next += 1;}
      if (source[next] === ":") {
        const keys = containers.at(-1);
        const key: unknown = JSON.parse(source.slice(start, index + 1));
        if (keys === undefined || keys === null || typeof key !== "string" || keys.has(key)) {fail();}
        keys.add(key);
      }
    }
    if (containers.length > 64) {fail();}
  }
}

function parseObject(source: string): UnknownRecord {
  let parsed: unknown;
  try { parsed = JSON.parse(source); } catch { fail(); }
  rejectDuplicateJsonKeys(source);
  const result = record(parsed);
  const pending: { value: unknown; depth: number }[] = [{ value: result, depth: 0 }];
  let nodes = 0;
  while (pending.length > 0) {
    const item = pending.pop();
    nodes += 1;
    if (!item || item.depth > 64 || nodes > 500_000) {fail();}
    if (typeof item.value === "number" && !Number.isFinite(item.value)) {fail();}
    if (item.value !== null && typeof item.value === "object") {
      for (const [key, child] of Object.entries(item.value)) {
        if (["__proto__", "constructor", "prototype"].includes(key)) {fail();}
        pending.push({ value: child, depth: item.depth + 1 });
      }
    }
  }
  return result;
}

/** Decode exactly the native AES-128-GCM plus gzip format, never logging keys. */
export async function decodeNativeHistoryChunk(input: NativeHistoryChunk): Promise<string> {
  try {
    const historyUuid = uuid(input.historyUuid);
    const keyHex = uuid(input.keyHex);
    const encoded = text(input.dataBase64, Math.ceil(MAX_CIPHER_BYTES / 3) * 4);
    if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/u.test(encoded)) {fail("chunk-encoding");}
    const bytes = Buffer.from(encoded, "base64");
    if (bytes.length <= 16 || bytes.length > MAX_CIPHER_BYTES || bytes.toString("base64") !== encoded) {fail();}
    const decipher = createDecipheriv("aes-128-gcm", Buffer.from(keyHex, "hex"), Buffer.from(historyUuid, "hex"));
    decipher.setAuthTag(bytes.subarray(-16));
    const compressed = Buffer.concat([decipher.update(bytes.subarray(0, -16)), decipher.final()]);
    const decoded = await unzip(compressed, { maxOutputLength: MAX_CHUNK_BYTES });
    return new TextDecoder("utf-8", { fatal: true }).decode(decoded);
  } catch (error) { if (error instanceof NativeHistoryError) { throw error; } return fail("chunk-decode"); }
}

interface MaterializationBudget {
  records: number;
  bytes: number;
}

function materializationBatchReached(budget: MaterializationBudget, bytes = 0): boolean {
  budget.records += 1;
  budget.bytes += bytes;
  if (budget.records < COOPERATIVE_RECORD_BATCH && budget.bytes < COOPERATIVE_BYTE_BATCH) { return false; }
  budget.records = 0;
  budget.bytes = 0;
  return true;
}

function finishMaterializationSteps<Result>(steps: Generator<void, Result, undefined>): Result {
  let step = steps.next();
  while (step.done !== true) { step = steps.next(); }
  return step.value;
}

/** Parse the entire chunk before applying any record, preserving rejection
 * precedence even when a later malformed record follows an earlier conflict.
 * Individual JSON parsing and framing remain synchronous bounded operations.
 */
function* parseNativeRecordSteps(plaintext: string, preserveLibraryAtoms = false, preserveDocumentRecords = false): Generator<void, NativeRecord[], undefined> {
  if (Buffer.byteLength(plaintext) > MAX_CHUNK_BYTES) {fail();}
  const lines = plaintext.split("|\n");
  if (lines.at(-1) === "") {lines.pop();}
  if (lines.length === 0 || lines.length > MAX_CHUNK_RECORDS) {fail();}
  const entries: NativeRecord[] = [];
  const budget = { records: 0, bytes: 0 };
  for (const line of lines) {
    const split = line.indexOf("||");
    if (split < 1) {fail();}
    const headerSource = line.slice(0, split);
    const header = parseObject(headerSource);
    const allowedKeys = new Set(["type", "id", "ticket", "client"]);
    if (preserveLibraryAtoms) { allowedKeys.add("firstTicket"); }
    if (Object.keys(header).some((key) => !allowedKeys.has(key))) {fail();}
    if (!/^[A-Z][A-Z0-9_]{0,63}$/u.test(text(header["type"], 64))) {fail();}
    if (Object.hasOwn(header, "firstTicket")) {
      const firstTicket = integer(header["firstTicket"]);
      if (Object.is(firstTicket, -0) || firstTicket > integer(header["ticket"]) ||
          ["EDIT_HEAD", "DOCHEAD", "META", "DELETE_DOC"].includes(text(header["type"])) || entryDeletionId(header)) { fail(); }
    }
    const bodySource = line.slice(split + 2);
    entries.push({ header, body: bodySource === "" ? null : parseObject(bodySource),
      ...(preserveDocumentRecords ? { recordEncodingSha256: createHash("sha256").update(line).digest("hex") } : {}),
      ...(preserveLibraryAtoms ? { headerSha256: createHash("sha256").update(headerSource).digest("hex"),
        bodyEncodingSha256: bodySource === "" ? null : createHash("sha256").update(bodySource).digest("hex") } : {}) });
    if (materializationBatchReached(budget, Buffer.byteLength(line))) { yield; }
  }
  return entries;
}

function entryDeletionId(header: UnknownRecord): boolean { return header["id"] === "DELETE_DOC"; }

export function parseNativeRecords(plaintext: string): NativeRecord[] {
  /* Live-source parsers intentionally discard atom headers. Never enable the
   * imported-history extension here or that provenance would be lost silently. */
  return finishMaterializationSteps(parseNativeRecordSteps(plaintext));
}

function retainLibraryAtom(document: MutableDocument, entry: NativeRecord, inheritedClient: string | undefined,
  chunkIndex: number, recordIndex: number, checkpointSha256: string | undefined): void {
  const history = document.libraryAtoms;
  const hasFirstTicket = Object.hasOwn(entry.header, "firstTicket");
  if (hasFirstTicket && (history === undefined || checkpointSha256 === undefined)) { fail("atom-header-profile"); }
  if (history === undefined) { return; }
  const id = text(entry.header["id"]);
  const type = text(entry.header["type"], 64);
  const ticket = integer(entry.header["ticket"]);
  const client = optionalClient(entry.header["client"] ?? inheritedClient);
  const serializedFirstTicket = hasFirstTicket ? { serializedFirstTicket: integer(entry.header["firstTicket"]) } : {};
  /* Physical clocks select bodies. Serialized firstTicket is separate imported
   * provenance and never substitutes for the physical ticket or its client. */
  /* Duplicate bodies use the existing canonical semantic comparison. Exact
   * header/body encoding differences remain separately committed below. */
  const signature = sha256Json({ type, body: entry.body, ...serializedFirstTicket });
  const tickets = history.clocks.get(id) ?? new Map<number, Map<string | null, string>>();
  const clients = tickets.get(ticket) ?? new Map<string | null, string>();
  const previous = clients.get(client);
  if (previous !== undefined && previous !== signature) { fail("record-ticket-conflict"); }
  if ((client === null && [...clients.keys()].some((value) => value !== null)) ||
      (client !== null && clients.has(null))) { fail("record-client-conflict"); }
  clients.set(client, signature);
  tickets.set(ticket, clients);
  history.clocks.set(id, tickets);
  history.hasFirstTicket ||= hasFirstTicket;
  if (entry.headerSha256 === undefined || entry.bodyEncodingSha256 === undefined) { fail("atom-header-profile"); }
  let clientSource: NativeAtomHeaderOccurrence["clientSource"] = inheritedClient === undefined ? "missing" : "inherited";
  if (entry.header["client"] !== undefined && entry.header["client"] !== null) { clientSource = "explicit"; }
  history.occurrences.push({ chunkIndex, recordIndex, id, type, ticket, client,
    clientSource,
    ...serializedFirstTicket, headerSha256: entry.headerSha256,
    bodyEncodingSha256: entry.bodyEncodingSha256,
    bodySha256: entry.body === null ? null : sha256Json(entry.body), tombstone: entry.body === null });
}

function applyRecord(document: MutableDocument, entry: NativeRecord, inheritedClient: string | undefined): void {
  const type = text(entry.header["type"], 64);
  const id = text(entry.header["id"]);
  // Native delete()/restore serialize one document-state record, not an object
  // Deletion. Retain it and all hidden records for complete durable comparison.
  if (type === "DELETE_DOC" && (id !== "DELETE_DOC" || entry.body === null || Object.keys(entry.body).length !== 1 || typeof entry.body["isDelete"] !== "boolean")) {fail("delete-document");}
  if (id === "DELETE_DOC" && type !== "DELETE_DOC") {fail("delete-document");}
  const ticket = integer(entry.header["ticket"]);
  const client = optionalClient(entry.header["client"] ?? inheritedClient);
  const previous = document.objects.get(id);
  const next = { id, type, ticket, client, body: entry.body };
  // Native history is keyed by document and ID, not type. Empty STRING entries
  // They can delete an ATTR under the same ID; a later record can restore it.
  if (previous && previous.type !== type && previous.body !== null && entry.body !== null) {fail("record-type-conflict");}
  if (previous && previous.ticket === ticket && canonicalJson(previous) !== canonicalJson(next)) {
    if (previous.client === client) {fail("record-ticket-conflict");}
    if (previous.client === null || client === null) {fail("record-client-conflict");}
  }
  // Native project-worker pE orders equal tickets by their client string.
  if (!previous || previous.ticket < ticket || (previous.ticket === ticket && previous.client !== null && client !== null && previous.client < client)) {document.objects.set(id, next);}
  if (document.docType === "SCH_PAGE") {
    // Pinned project-worker It.getHead/pE retain the minimum ticket/client.
    // Replacements/tombstones preserve this head and its serialization order.
    // Only complete linear history is admitted; latest clocks stay untouched.
    const first = document.firstClocks.get(id);
    if (!first || ticket < first.ticket) {
      document.firstClocks.set(id, { ticket, client, ambiguous: false });
    } else if (ticket === first.ticket && client !== first.client) {
      if (client === null || first.client === null) {
        document.firstClocks.set(id, { ...first, ambiguous: true });
      } else if (client < first.client) {
        document.firstClocks.set(id, { ticket, client, ambiguous: first.ambiguous });
      }
    }
  }
}

/** Deleted documents remain in the full snapshot and its hash. Target selection
 * must exclude them; a later native isDelete:false marker restores visibility.
 */
export function isNativeDocumentDeleted(document: NativeDocumentSnapshot): boolean {
  const markers = document.records.filter((entry) => entry.type === "DELETE_DOC" || entry.id === "DELETE_DOC");
  if (markers.length === 0) { return false; }
  const marker = markers[0];
  if (markers.length !== 1 || marker?.id !== "DELETE_DOC" || marker.type !== "DELETE_DOC" || Object.keys(marker.body).length !== 1 || typeof marker.body["isDelete"] !== "boolean") { fail("delete-document"); }
  return marker.body["isDelete"];
}

/** Shared sync/async state machine. Whole-record replacement, conflict order,
 * supplemental lineage and hashes have one implementation and unchanged limits.
 */
function* materializeNativeHistorySteps(plaintextChunks: readonly string[], checkpointSha256?: string,
  options: NativeHistoryMaterializationOptions = {}): Generator<void, readonly NativeDocumentSnapshot[], undefined> {
  if (checkpointSha256 !== undefined && !/^[a-f0-9]{64}$/u.test(checkpointSha256)) { fail("checkpoint-hash"); }
  if (options.documentRecordHistory === "preserve" && checkpointSha256 === undefined) { fail("checkpoint-hash"); }
  if (options.pcbTextReloadOrder === "preserve" && (checkpointSha256 === undefined || options.documentRecordHistory !== "preserve")) { fail("checkpoint-hash"); }
  const documents = new Map<string, MutableDocument>();
  let totalBytes = 0;
  let totalRecords = 0;
  for (const [chunkIndex, plaintext] of plaintextChunks.entries()) {
    totalBytes += Buffer.byteLength(plaintext);
    if (totalBytes > MAX_TOTAL_BYTES) {fail("total-bytes-limit");}
    let current: MutableDocument | undefined;
    let currentClient: string | undefined;
    const entries = yield* parseNativeRecordSteps(plaintext, options.libraryAtomHeaders === "preserve", options.documentRecordHistory === "preserve");
    yield;
    const budget = { records: 0, bytes: 0 };
    for (const [recordIndex, entry] of entries.entries()) {
      totalRecords += 1;
      if (totalRecords > MAX_TOTAL_RECORDS) {fail("total-records-limit");}
      const type = entry.header["type"];
      if (type === "EDIT_HEAD") {
        if (Object.keys(entry.header).length !== 1 || entry.body === null) {fail();}
      } else if (type === "DOCHEAD") {
        const body = record(entry.body);
        const documentUuid = text(body["uuid"], 128);
        const docType = text(body["docType"], 64);
        if (!DOCUMENT_TYPES.has(docType)) {fail("document-type");}
        currentClient = body["client"] === undefined ? undefined : text(body["client"], 128);
        const ticket = integer(entry.header["ticket"]);
        current = documents.get(documentUuid);
        if (current && current.docType !== docType) {fail();}
        if (!current) {
          current = { uuid: documentUuid, docType, metadata: body, metadataTicket: ticket, objects: new Map(), firstClocks: new Map(),
            metadataHeaders: docType === "SCH_PAGE" ? [{ ticket, metadata: body }] : null,
            ...(options.documentRecordHistory === "preserve" ? { documentRecordChain: emptyNativeDocumentRecordChain(documentUuid) } : {}),
            ...(options.pcbTextReloadOrder === "preserve" && docType === "PCB" ? { pcbTextReloadHistory: { strings: [], nonStringIds: new Set<string>(), tail: [] } } : {}),
            ...(options.libraryAtomHeaders === "preserve" && (docType === "SYMBOL" || docType === "FOOTPRINT")
              ? { libraryAtoms: { occurrences: [], clocks: new Map(), hasFirstTicket: false } } : {}) };
          documents.set(documentUuid, current);
        } else if (ticket === current.metadataTicket && canonicalJson(current.metadata) !== canonicalJson(body)) {
          fail("document-ticket-conflict");
        } else if (ticket > current.metadataTicket) {
          current.metadata = body;
          current.metadataTicket = ticket;
        }
        retainMetadataHeader(current, ticket, body);
      } else {
        if (!current) {fail();}
        retainLibraryAtom(current, entry, currentClient, chunkIndex, recordIndex, checkpointSha256);
        if (entry.header["type"] === "DELETE_DOC" || entry.header["id"] === "DELETE_DOC") { current.metadataHeaders = null; }
        applyRecord(current, entry, currentClient);
      }
      if (type !== "EDIT_HEAD" && options.documentRecordHistory === "preserve") {
        if (current?.documentRecordChain === undefined || entry.recordEncodingSha256 === undefined) { fail(); }
        if (current.pcbTextReloadHistory !== undefined) { retainPcbTextReloadRecord(current.pcbTextReloadHistory, entry, currentClient, current.documentRecordChain); }
        current.documentRecordChain = appendNativeDocumentRecordChain(current.documentRecordChain, entry.recordEncodingSha256, integer(entry.header["ticket"]));
      }
      if (materializationBatchReached(budget)) { yield; }
    }
    yield;
  }
  if (documents.size === 0) {fail();}
  const snapshots: NativeDocumentSnapshot[] = [];
  for (const document of [...documents.values()].toSorted((left, right) => left.uuid.localeCompare(right.uuid))) {
    const records: NativeObjectSnapshot[] = [];
    const budget = { records: 0, bytes: 0 };
    for (const value of document.objects.values()) {
      if (value.body !== null) {
        const first = value.type === "ATTR" ? document.firstClocks.get(value.id) : undefined;
        records.push(first && !first.ambiguous
          ? { ...value, firstTicket: first.ticket, firstClient: first.client }
          : value);
      }
      if (materializationBatchReached(budget)) { yield; }
    }
    yield;
    records.sort((left, right) => left.id.localeCompare(right.id));
    const headerHistory = checkpointSha256 !== undefined && document.metadataHeaders !== null ? {
      profile: "easyeda.native-history.schematic-header-lineage.v1" as const, checkpointSha256,
      documentUuid: document.uuid, headers: document.metadataHeaders,
    } : undefined;
    const snapshot: NativeDocumentSnapshot = {
      uuid: document.uuid,
      docType: document.docType,
      metadata: document.metadata,
      records,
      semanticSha256: sha256Json({ uuid: document.uuid, docType: document.docType, metadata: document.metadata, records: records.map(({ id, type, body }) => ({ id, type, body })) }),
    };
    const completed = headerHistory === undefined ? snapshot : Object.assign(snapshot,
      { headerHistory: Object.assign(headerHistory, { sha256: sha256Json(headerHistory) }) });
    if (document.libraryAtoms?.hasFirstTicket === true) {
      if (checkpointSha256 === undefined || (document.docType !== "SYMBOL" && document.docType !== "FOOTPRINT")) { fail("atom-header-profile"); }
      const atomHeaderHistory = yield* createNativeAtomHeaderHistorySteps({ checkpointSha256, documentUuid: document.uuid,
        docType: document.docType }, document.libraryAtoms.occurrences);
      Object.assign(completed, { atomHeaderHistory });
    }
    if (document.documentRecordChain !== undefined) {
      if (checkpointSha256 === undefined) { fail("checkpoint-hash"); }
      Object.assign(completed, { documentRecordHistory: sealNativeDocumentRecordHistory(document.documentRecordChain, checkpointSha256, document.uuid) });
      if (document.pcbTextReloadHistory !== undefined) { Object.assign(completed, { pcbTextReloadHistory: sealPcbTextReloadHistory(document.pcbTextReloadHistory, checkpointSha256, document.uuid) }); }
    }
    snapshots.push(completed);
    yield;
  }
  return snapshots;
}

/** Whole-record replacement by ticket. Empty bodies are tombstones, not empty objects. */
export function materializeNativeHistory(plaintextChunks: readonly string[], checkpointSha256?: string,
  options: NativeHistoryMaterializationOptions = {}): readonly NativeDocumentSnapshot[] {
  return finishMaterializationSteps(materializeNativeHistorySteps(plaintextChunks, checkpointSha256, options));
}

/** Capture complete immutable chunk strings before yielding. Real event-loop
 * turns service existing socket/timer work without changing leases or evidence.
 * Single-record JSON parsing, sorting and final canonical hashing can still be
 * expensive; this is not a universal latency or heartbeat-deadline guarantee.
 */
export async function materializeNativeHistoryCooperatively(plaintextChunks: readonly string[], checkpointSha256?: string,
  options: NativeHistoryMaterializationOptions = {}): Promise<readonly NativeDocumentSnapshot[]> {
  const steps = materializeNativeHistorySteps([...plaintextChunks], checkpointSha256, { ...options });
  let step = steps.next();
  while (step.done !== true) {
    await yieldProofEventLoop();
    step = steps.next();
  }
  return step.value;
}

async function absentSidecars(path: string): Promise<void> {
  for (const suffix of ["-wal", "-shm", "-journal"]) {
    let missing = false;
    try { await lstat(`${path}${suffix}`); } catch (error) {
      if (isRecord(error) && error["code"] === "ENOENT") {missing = true;}
      else {fail();}
    }
    if (!missing) {fail();}
  }
}

/** Only immutable, hash-bound checkpoints; never attach to a live project database. */
export async function readNativeHistoryCheckpoint(input: {
  readonly checkpointPath: string;
  readonly expectedSha256: string;
  readonly projectUuid: string;
  readonly libraryAtomHeaders?: "preserve";
  readonly documentRecordHistory?: "preserve";
  readonly pcbTextReloadOrder?: "preserve";
}): Promise<NativeHistorySnapshot> {
  const { checkpointPath, expectedSha256, projectUuid: requestedProjectUuid, libraryAtomHeaders, documentRecordHistory, pcbTextReloadOrder } = input;
  let stage: NativeHistoryStage = "checkpoint-input";
  if (!isAbsolute(checkpointPath) || !/\.eprj2$/iu.test(checkpointPath) || !/^[a-f0-9]{64}$/u.test(expectedSha256)) {fail();}
  const projectUuid = text(requestedProjectUuid, 64);
  if (!/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/u.test(projectUuid)) {fail();}
  await absentSidecars(checkpointPath);
  // oxlint-disable-next-line eslint/no-bitwise -- Refuse substituted links and open FIFOs without blocking before the regular-file check.
  const file = await open(checkpointPath, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  let database: DatabaseSync | undefined;
  try {
    stage = "checkpoint-file";
    const before = await file.stat({ bigint: true });
    if (!before.isFile() || before.nlink !== 1n || before.size > BigInt(MAX_DATABASE_BYTES)) {fail();}
    const hash = createHash("sha256");
    for await (const chunk of file.createReadStream({ autoClose: false, start: 0 })) {
      if (!Buffer.isBuffer(chunk)) {fail();}
      hash.update(chunk);
    }
    if (hash.digest("hex") !== expectedSha256) {fail("checkpoint-hash");}
    stage = "project-scope";
    database = new DatabaseSync(`/proc/self/fd/${String(file.fd)}`, { readOnly: true, enableForeignKeyConstraints: false, allowExtension: false });
    database.exec("PRAGMA trusted_schema=OFF");
    const project = record(database.prepare("SELECT uuid, branch_uuid, owner_uuid FROM projects WHERE uuid=?").get(projectUuid));
    const projectOwnerUuid = project["owner_uuid"] === null || project["owner_uuid"] === undefined ? undefined : text(project["owner_uuid"], 64);
    const branchUuid = uuid(project["branch_uuid"]);
    const branch = record(database.prepare("SELECT uuid, project_uuid, history_uuid FROM branches WHERE uuid=?").get(branchUuid));
    if (branch["project_uuid"] !== projectUuid) {fail();}
    const headHistoryUuid = uuid(branch["history_uuid"]);
    const historyTable = `project_history_${branchUuid}`;
    const rows: UnknownRecord[] = [];
    const seen = new Set<string>();
    let next: string | null = headHistoryUuid;
    while (next !== null) {
      stage = "history-chain";
      if (seen.has(next) || rows.length >= MAX_HISTORY_ROWS) {fail("history-chain");}
      seen.add(next);
      const row = record(database.prepare(`SELECT uuid, parent, snapshot, key, num, snapshot_num FROM "${historyTable}" WHERE uuid=?`).get(next));
      if (row["snapshot"] !== null || row["snapshot_num"] !== 0) {fail("history-snapshot");}
      rows.push(row);
      next = row["parent"] === null ? null : uuid(row["parent"]);
    }
    const plaintext: string[] = [];
    let plaintextBytes = 0;
    for (const row of rows.toReversed()) {
      const historyUuid = uuid(row["uuid"]);
      const keyHex = uuid(row["key"]);
      const count = integer(row["num"], 1024);
      for (let index = 0; index <= count; index += 1) {
        stage = "history-chunk";
        const chunkUuid = index === 0 ? historyUuid : `${historyUuid}-${String(index)}`;
        const payload = record(database.prepare("SELECT history_uuid, dataStr FROM history_data WHERE uuid=?").get(chunkUuid));
        if (payload["history_uuid"] !== historyUuid) {fail();}
        const decoded = await decodeNativeHistoryChunk({ historyUuid, keyHex, dataBase64: text(payload["dataStr"], Math.ceil(MAX_CIPHER_BYTES / 3) * 4) });
        plaintextBytes += Buffer.byteLength(decoded);
        if (plaintextBytes > MAX_TOTAL_BYTES) {fail("total-bytes-limit");}
        plaintext.push(decoded);
      }
    }
    const documents = await materializeNativeHistoryCooperatively(plaintext, expectedSha256,
      { ...(libraryAtomHeaders === undefined ? {} : { libraryAtomHeaders }), ...(documentRecordHistory === undefined ? {} : { documentRecordHistory }), ...(pcbTextReloadOrder === undefined ? {} : { pcbTextReloadOrder }) });
    stage = "checkpoint-stability";
    const after = await file.stat({ bigint: true });
    const pathAfter = await lstat(checkpointPath, { bigint: true });
    if (before.dev !== after.dev || before.ino !== after.ino || before.size !== after.size || before.mtimeNs !== after.mtimeNs || before.ctimeNs !== after.ctimeNs || after.dev !== pathAfter.dev || after.ino !== pathAfter.ino) {fail();}
    await absentSidecars(checkpointPath);
    return {
      profile: PROFILE, projectUuid, ...(projectOwnerUuid === undefined ? {} : { projectOwnerUuid }), branchUuid, headHistoryUuid, checkpointSha256: expectedSha256,
      historyRowCount: rows.length, chunkCount: plaintext.length, plaintextBytes, documents,
      semanticSha256: sha256Json(documents.map(({ uuid: documentUuid, docType, semanticSha256 }) => ({ uuid: documentUuid, docType, semanticSha256 }))),
    };
  } catch (error) { if (error instanceof NativeHistoryError) { throw error; } return fail(stage); } finally {
    database?.close();
    await file.close();
  }
}
