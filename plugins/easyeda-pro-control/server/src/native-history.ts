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

type NativeHistoryStage = "record-invalid" | "chunk-decode" | "chunk-encoding" | "total-bytes-limit" | "total-records-limit" | "record-ticket-conflict" | "record-client-conflict" | "record-type-conflict" | "document-type" | "document-ticket-conflict" | "delete-document" | "checkpoint-input" | "checkpoint-file" | "checkpoint-hash" | "project-scope" | "history-chain" | "history-snapshot" | "history-chunk" | "checkpoint-stability";
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
function* parseNativeRecordSteps(plaintext: string): Generator<void, NativeRecord[], undefined> {
  if (Buffer.byteLength(plaintext) > MAX_CHUNK_BYTES) {fail();}
  const lines = plaintext.split("|\n");
  if (lines.at(-1) === "") {lines.pop();}
  if (lines.length === 0 || lines.length > MAX_CHUNK_RECORDS) {fail();}
  const entries: NativeRecord[] = [];
  const budget = { records: 0, bytes: 0 };
  for (const line of lines) {
    const split = line.indexOf("||");
    if (split < 1) {fail();}
    const header = parseObject(line.slice(0, split));
    const allowedKeys = new Set(["type", "id", "ticket", "client"]);
    if (Object.keys(header).some((key) => !allowedKeys.has(key))) {fail();}
    if (!/^[A-Z][A-Z0-9_]{0,63}$/u.test(text(header["type"], 64))) {fail();}
    const bodySource = line.slice(split + 2);
    entries.push({ header, body: bodySource === "" ? null : parseObject(bodySource) });
    if (materializationBatchReached(budget, Buffer.byteLength(line))) { yield; }
  }
  return entries;
}

export function parseNativeRecords(plaintext: string): NativeRecord[] {
  return finishMaterializationSteps(parseNativeRecordSteps(plaintext));
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
function* materializeNativeHistorySteps(plaintextChunks: readonly string[], checkpointSha256?: string): Generator<void, readonly NativeDocumentSnapshot[], undefined> {
  if (checkpointSha256 !== undefined && !/^[a-f0-9]{64}$/u.test(checkpointSha256)) { fail("checkpoint-hash"); }
  const documents = new Map<string, MutableDocument>();
  let totalBytes = 0;
  let totalRecords = 0;
  for (const plaintext of plaintextChunks) {
    totalBytes += Buffer.byteLength(plaintext);
    if (totalBytes > MAX_TOTAL_BYTES) {fail("total-bytes-limit");}
    let current: MutableDocument | undefined;
    let currentClient: string | undefined;
    const entries = yield* parseNativeRecordSteps(plaintext);
    yield;
    const budget = { records: 0, bytes: 0 };
    for (const entry of entries) {
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
            metadataHeaders: docType === "SCH_PAGE" ? [{ ticket, metadata: body }] : null };
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
        if (entry.header["type"] === "DELETE_DOC" || entry.header["id"] === "DELETE_DOC") { current.metadataHeaders = null; }
        applyRecord(current, entry, currentClient);
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
    snapshots.push(completed);
    yield;
  }
  return snapshots;
}

/** Whole-record replacement by ticket. Empty bodies are tombstones, not empty objects. */
export function materializeNativeHistory(plaintextChunks: readonly string[], checkpointSha256?: string): readonly NativeDocumentSnapshot[] {
  return finishMaterializationSteps(materializeNativeHistorySteps(plaintextChunks, checkpointSha256));
}

/** Capture complete immutable chunk strings before yielding. Real event-loop
 * turns service existing socket/timer work without changing leases or evidence.
 * Single-record JSON parsing, sorting and final canonical hashing can still be
 * expensive; this is not a universal latency or heartbeat-deadline guarantee.
 */
export async function materializeNativeHistoryCooperatively(plaintextChunks: readonly string[], checkpointSha256?: string): Promise<readonly NativeDocumentSnapshot[]> {
  const steps = materializeNativeHistorySteps([...plaintextChunks], checkpointSha256);
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
}): Promise<NativeHistorySnapshot> {
  const { checkpointPath, expectedSha256, projectUuid: requestedProjectUuid } = input;
  let stage: NativeHistoryStage = "checkpoint-input";
  if (!isAbsolute(checkpointPath) || !/\.eprj2$/iu.test(checkpointPath) || !/^[a-f0-9]{64}$/u.test(expectedSha256)) {fail();}
  const projectUuid = text(requestedProjectUuid, 64);
  if (!/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/u.test(projectUuid)) {fail();}
  await absentSidecars(checkpointPath);
  // oxlint-disable-next-line eslint/no-bitwise -- POSIX open flags prevent following a substituted symbolic link.
  const file = await open(checkpointPath, constants.O_RDONLY | constants.O_NOFOLLOW);
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
    const documents = await materializeNativeHistoryCooperatively(plaintext, expectedSha256);
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
