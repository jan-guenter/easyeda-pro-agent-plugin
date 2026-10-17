/** Pure pre-dispatch proof budgets. No clock, owner or execution token is issued. */
import { z } from "zod";
import { CURRENT_SAVED_SYMBOL_CONTENT_LIMIT, CURRENT_SAVED_SYMBOL_ENVELOPE_LIMIT, buildCurrentSavedSymbolReadProgram } from "./current-symbol-saved-read-program.ts";
import { CURRENT_SYMBOL_WRITE_TIME_CEILING, CURRENT_SYMBOL_WRITE_WINDOW_MS } from "./current-symbol-write-program.ts";
import { EXACT_READ_ENVELOPE_SCHEMA } from "./exact-readers.ts";
import { currentSymbolStartupExpectationSchema } from "./current-symbol-startup.ts";
import type { CurrentSymbolStartupExpectation } from "./current-symbol-startup.ts";
import { expectedSavedSymbolContent, prepareCurrentCanvasSegmentsSavedSymbolProjection, prepareCurrentDocumentCacheSavedSymbolProjection, prepareCurrentSingleCanvasSegmentSavedSymbolProjection,
  prepareSavedSymbolProjection } from "./saved-symbol-projection.ts";
import { ACTOR_NAME_MAX_CODE_UNITS } from "./symbol-dual-actor.ts";
import type { DecodedSymbolSqlRawHistory } from "./symbol-sql-comparator.ts";
import { MAX_ENCODED_BYTES } from "./sqlite-inventory-core.ts";
import type { NativeSqlInventory, SqlCell, SqlRow, SqlTable } from "./sqlite-inventory-core.ts";

const desiredSchema = z.object({ name: z.string().min(1).max(512), description: z.string().max(65_536),
  tags: z.array(z.string().max(512)).max(256), source: z.string().max(4096) }).strict();
const MAX_NATIVE_TIME = 8_640_000_000_000_000;
type MetadataInput = Readonly<{ name: string; description: string; tags: readonly string[]; source: string }>;
type BudgetStrategy = "meta-only" | "single-canvas-segment" | "canvas-segments";
const BUDGET_PROFILES = Object.freeze({
  "meta-only": "private.current-symbol-write-budget.v1",
  "single-canvas-segment": "private.current-single-canvas-segment-write-budget.v1",
  "canvas-segments": "private.current-canvas-segments-write-budget.v1",
});
const CLIENT = "0".repeat(16);
// SQL actor selection bounds both project-user names to this many code units.
// A NUL contributes six JSON bytes, the maximum for any individual code unit.
const ACTOR = Object.freeze({ uuid: "0".repeat(32), username: "\0".repeat(ACTOR_NAME_MAX_CODE_UNITS),
  nickname: "\0".repeat(ACTOR_NAME_MAX_CODE_UNITS) });
function need(condition: boolean, message: string): asserts condition {
  if (!condition) { throw new Error(`Current symbol write budget: ${message}`); }
}

function savedEnvelopeBytes(targetUuid: string, ticket: number, desired: z.infer<typeof desiredSchema>, content: string,
  startup: CurrentSymbolStartupExpectation): number {
  const target = { projectUuid: "0".repeat(64), branchUuid: "0".repeat(32), symbolUuid: targetUuid, ownerUuid: "0".repeat(32) };
  const expectedBefore = { name: desired.name, description: desired.description, tagsJson: JSON.stringify(desired.tags), source: desired.source,
    version: String(MAX_NATIVE_TIME), ticket };
  // Compiler-only validation applies the real request/schema/262144-byte cap.
  // Its program is discarded, never dispatched or retained as native evidence.
  buildCurrentSavedSymbolReadProgram({ target, expectedBefore, expectedActor: ACTOR, maximumTicket: ticket, startup });
  const result = { profile: "private.current-symbol-saved-read-observation.v1", target, expectedBefore, expectedActor: ACTOR,
    observation: { profile: "private.saved-symbol-content-observation.v1", projectUuid: target.projectUuid, targetUuid, maximumTicket: ticket,
      workerClient: CLIENT, content, executionAuthorized: false, producerBindingVerified: false, completionProved: false },
    samples: 2, noEditorTabsObserved: true, mutationDispatched: false, explicitSaveDispatched: false, executionAuthorized: false };
  const json = JSON.stringify(result), utf8Bytes = Buffer.byteLength(json);
  const bytes = Buffer.byteLength(JSON.stringify({ schema: EXACT_READ_ENVELOPE_SCHEMA, utf8Bytes, json }));
  need(utf8Bytes <= CURRENT_SAVED_SYMBOL_ENVELOPE_LIMIT && bytes <= CURRENT_SAVED_SYMBOL_ENVELOPE_LIMIT,
    "complete desired saved envelope exceeds its reader byte limit");
  return bytes;
}

function sqlText(value: string): SqlCell { return { kind: "text", hex: Buffer.from(value).toString("hex") }; }
const SQL_INTEGER: SqlCell = Object.freeze({ kind: "integer", decimal: String(Number.MAX_SAFE_INTEGER) });
function sqlField(table: SqlTable, row: SqlRow, name: string): SqlCell {
  const index = table.columns.findIndex((column) => column["name"] === name);
  const cell = row.cells[index];
  need(index !== -1 && cell !== undefined, "fixed SQL effect column is missing"); return cell;
}
function selectedSqlText(table: SqlTable, row: SqlRow, name: string, value: string): boolean {
  const cell = sqlField(table, row, name); return cell.kind === "text" && cell.hex === Buffer.from(value).toString("hex");
}
function sqlInteger(cell: SqlCell): bigint {
  need(cell.kind === "integer" && /^(?:0|[1-9][0-9]*)$/u.test(cell.decimal), "SQL allocation is not a supported integer");
  return BigInt(cell.decimal);
}
function allocationCapacity(history: SqlTable, data: SqlTable, sequence: SqlTable, writes: number): void {
  const maxima = [history, data].map((table) => {
    let maximum = 0n;
    for (const row of table.rows) {
      const id = sqlInteger(sqlField(table, row, "id"));
      need(row.rowid !== null && id > 0n && id === sqlInteger(row.rowid), "SQL allocation ID/rowid association differs");
      if (id > maximum) { maximum = id; }
    }
    need(maximum + BigInt(writes) <= BigInt(Number.MAX_SAFE_INTEGER), "SQL rowid allocation cannot contain the reserved writes");
    return maximum;
  });
  const rows = sequence.rows.filter((row) => selectedSqlText(sequence, row, "name", "history_data"));
  need(rows.length === 1 && rows[0] !== undefined, "SQL history-data sequence is not unique");
  const id = sqlInteger(sqlField(sequence, rows[0], "seq"));
  need(id >= (maxima[1] ?? 0n) && id + BigInt(writes) <= BigInt(Number.MAX_SAFE_INTEGER),
    "SQL sequence allocation cannot contain the reserved writes");
}

/** A sufficient upper bound for the unchanged exact six-table effect, not a
 * projected SQL inventory. Existing cells remain counted even when replaced.
 * Hashes and schema descriptors keep their fixed lengths. Physical SQLite file
 * allocation, native heap and deadlines still require their original proofs.
 */
function sqlCapacity(before: NativeSqlInventory, branchUuid: string, uploadBytes: readonly number[]): Readonly<Record<string, unknown>> {
  const tables = new Map(before.tables.map((table) => [table.name, table]));
  const data = tables.get("history_data"), history = tables.get(`project_history_${branchUuid}`), sequence = tables.get("sqlite_sequence");
  need(history !== undefined && data !== undefined && sequence !== undefined, "fixed history SQL tables are missing");
  allocationCapacity(history, data, sequence, uploadBytes.length);
  let encodedGrowth = 0, insertedCells = 0, maximumCiphertextBase64Bytes = 0;
  for (const n of uploadBytes) {
    // Pinned APP gzipSync(level:1), then AES-GCM's 16-byte tag and canonical
    // Base64. Node24.14.1 Chromium-zlib deflateBound uses max(fixed,stored)+18
    // For gzip. Its hash configuration forbids using the tighter default bound.
    const fixed = n + Math.floor(n / 8) + Math.floor(n / 256) + Math.floor(n / 512) + 4;
    const stored = n + Math.floor(n / 32) + Math.floor(n / 128) + Math.floor(n / 2048) + 7;
    const ciphertextBytes = 4 * Math.ceil((Math.max(fixed, stored) + 18 + 16) / 3);
    maximumCiphertextBase64Bytes = Math.max(maximumCiphertextBase64Bytes, ciphertextBytes);
    need(ciphertextBytes <= 2_097_152, "generated SQL TEXT exceeds the maintained cell-byte limit");
    const timestamp = sqlText("2000-01-01 00:00:00"), uuid = sqlText("0".repeat(32));
    const historyValues: Readonly<Record<string, SqlCell>> = { id: SQL_INTEGER, uuid, parent: uuid, snapshot: { kind: "null" }, key: uuid,
      is_lock: SQL_INTEGER, num: SQL_INTEGER, created_at: timestamp, updated_at: timestamp, snapshot_num: SQL_INTEGER, lock_time: timestamp };
    const dataValues: Readonly<Record<string, SqlCell>> = { id: SQL_INTEGER, uuid, history_uuid: uuid,
      dataStr: sqlText("A".repeat(ciphertextBytes)), created_at: timestamp, updated_at: timestamp };
    for (const [table, values] of [[history, historyValues], [data, dataValues]] as const) {
      need(!table.withoutRowid && table.columns.length === Object.keys(values).length, "inserted SQL shape differs from the exact effect");
      const cells = table.columns.map((column) => {
        const name = column["name"];
        const cell = typeof name === "string" ? values[name] : undefined;
        need(cell !== undefined, "inserted SQL effect column is missing"); return cell;
      });
      encodedGrowth += Buffer.byteLength(JSON.stringify({ rowid: SQL_INTEGER, cells })) + 1;
      insertedCells += cells.length + 1;
    }
    const updates = [
      ["projects", undefined, undefined, { updated_at: timestamp, modifier_uuid: uuid }],
      ["branches", "uuid", branchUuid, { history_uuid: uuid }],
      ["project_structures", "branch_uuid", branchUuid, { ticket: SQL_INTEGER }],
      ["sqlite_sequence", "name", "history_data", { seq: SQL_INTEGER }],
    ] as const;
    for (const [name, field, value, changes] of updates) {
      const table = tables.get(name); need(table !== undefined, "updated SQL table is missing");
      const selectedRows = field === undefined ? table.rows : table.rows.filter((row) => selectedSqlText(table, row, field, value));
      for (const row of selectedRows) {
        for (const [column, cell] of Object.entries(changes)) {
          sqlField(table, row, column);
          // Adding the full replacement cell, rather than subtracting the old
          // One, is conservative even for native NULL-to-value bookkeeping.
          encodedGrowth += Buffer.byteLength(JSON.stringify(cell));
        }
      }
    }
  }
  const maximumRows = before.tables.reduce((sum, table) => sum + table.rows.length, 0) + 2 * uploadBytes.length;
  const maximumCells = before.tables.reduce((sum, table) => sum + table.rows.length * (table.columns.length + (table.withoutRowid ? 0 : 1)), 0) + insertedCells;
  const maximumEncodedBytes = Buffer.byteLength(JSON.stringify(before)) + encodedGrowth;
  need(maximumRows <= 100_000 && maximumCells <= 250_000, "complete SQL row/cell-count budget cannot contain the exact effect");
  need(maximumEncodedBytes <= MAX_ENCODED_BYTES, "complete SQL encoded budget cannot contain the exact effect");
  // The encoded bound also bounds aggregate SQL CAST(... AS BLOB) byte usage:
  // TEXT/BLOB use two hex digits per byte and numeric decimal encodings are
  // Shorter than their tagged cell objects. 16MiB is below the reader's 64MiB.
  return Object.freeze({ maximumRows, maximumCells, maximumEncodedBytes, maximumCiphertextBase64Bytes,
    physicalFileGrowthProved: false, readerResourceCompletionProved: false });
}

/** One proved current upload contains exactly EDIT_HEAD, DOCHEAD and META.
 * The two time endpoints cover retaining the existing header and selecting a
 * newly generated header. A future historical user/version must not disappear
 * from the bound just because a synthetic maximum timestamp selects a new one.
 * A disposable owner may supply its exact original metadata to reserve a second
 * upload; both intermediate results and all endpoint combinations are checked.
 * These synthetic strings are never sent to EasyEDA or retained as native proof.
 */
export function prepareCurrentSymbolWriteBudget(decoded: DecodedSymbolSqlRawHistory, targetUuid: string,
  desiredInput: MetadataInput, before: NativeSqlInventory,
  startupInput: CurrentSymbolStartupExpectation,
  restorationInput?: MetadataInput): Promise<Readonly<Record<string, unknown>>> {
  return prepareWriteBudget(decoded, targetUuid, desiredInput, before, startupInput, restorationInput, "meta-only");
}

/** Separate pure budget for the fixed disposable single-canvas-segment profile.
 * Its writer must prove a strictly newer document window and leave a complete
 * later inverse window when reserving two writes. Synthetic endpoints bound
 * serialized sizes; they neither observe nor promise those future clocks.
 */
export function prepareCurrentSingleCanvasSegmentWriteBudget(decoded: DecodedSymbolSqlRawHistory, targetUuid: string,
  desiredInput: MetadataInput, before: NativeSqlInventory, startupInput: CurrentSymbolStartupExpectation,
  restorationInput?: MetadataInput): Promise<Readonly<Record<string, unknown>>> {
  return prepareWriteBudget(decoded, targetUuid, desiredInput, before, startupInput, restorationInput, "single-canvas-segment");
}

/** Disposable-only stream-order profile. Each appended stage must still fit
 * the pinned loader's first concurrent batch and prove a canvas-free winning
 * header, keeping both exact header alternatives independent of canvas order.
 */
export function prepareCurrentCanvasSegmentsWriteBudget(decoded: DecodedSymbolSqlRawHistory, targetUuid: string,
  desiredInput: MetadataInput, before: NativeSqlInventory, startupInput: CurrentSymbolStartupExpectation,
  restorationInput?: MetadataInput): Promise<Readonly<Record<string, unknown>>> {
  return prepareWriteBudget(decoded, targetUuid, desiredInput, before, startupInput, restorationInput, "canvas-segments");
}

async function prepareWriteBudget(decoded: DecodedSymbolSqlRawHistory, targetUuid: string, desiredInput: MetadataInput,
  before: NativeSqlInventory, startupInput: CurrentSymbolStartupExpectation, restorationInput: MetadataInput | undefined,
  strategy: BudgetStrategy): Promise<Readonly<Record<string, unknown>>> {
  const chunks = [...decoded.chunks], desired = desiredSchema.parse(desiredInput);
  const startup = currentSymbolStartupExpectationSchema.parse(startupInput);
  const stages = restorationInput === undefined ? [desired] : [desired, desiredSchema.parse(restorationInput)];
  const prepareCanvas = strategy === "canvas-segments" ? prepareCurrentCanvasSegmentsSavedSymbolProjection : prepareCurrentSingleCanvasSegmentSavedSymbolProjection;
  const { history, maximumTicket } = decoded;
  need(Number.isSafeInteger(history.historyRowCount) && history.historyRowCount > 0 && history.historyRowCount + stages.length <= 64,
    "reserved appended history rows must fit the maintained 64-row decoder");
  need(history.chunkCount === chunks.length && history.plaintextBytes === chunks.reduce((total, chunk) => total + Buffer.byteLength(chunk), 0),
    "complete decoded history counts differ");
  need(Number.isSafeInteger(maximumTicket) && maximumTicket >= 0 && !Object.is(maximumTicket, -0) && maximumTicket <= Number.MAX_SAFE_INTEGER - stages.length - 1,
    "the written ticket and exported outer ticket must remain supported safe integers");
  if (strategy !== "meta-only") {
    // Check the original history as well as every synthetic appended stage.
    // A new header must not hide an initially ambiguous cache segment order.
    const baseline = await prepareCanvas({ chunks, targetUuid, maximumTicket, currentEditVersion: "3.2.206" });
    const firstMaximum = CURRENT_SYMBOL_WRITE_TIME_CEILING - (stages.length - 1) * (CURRENT_SYMBOL_WRITE_WINDOW_MS + 1);
    need(baseline.maximumTargetHeaderTime < firstMaximum - CURRENT_SYMBOL_WRITE_WINDOW_MS,
      "strictly later document windows cannot fit the reserved write headroom");
  }
  let maximumSavedContentBytes = 0, maximumSavedEnvelopeBytes = 0, maximumUploadBytes = 0;
  let paths = [chunks];
  const uploadBytes: number[] = [];
  for (const [index, stage] of stages.entries()) {
    const ticket = maximumTicket + index + 1;
    const metadata = { title: stage.name, description: stage.description, tags: stage.tags, docType: 2, source: stage.source };
    const nextPaths: string[][] = [];
    let stageUploadBytes = 0;
    for (const path of paths) {
      const stamps = strategy === "meta-only" ? [1, MAX_NATIVE_TIME]
        : [CURRENT_SYMBOL_WRITE_TIME_CEILING - (stages.length - index - 1) * (CURRENT_SYMBOL_WRITE_WINDOW_MS + 1)];
      for (const stamp of stamps) {
        const upload = `${JSON.stringify({ type: "EDIT_HEAD" })}||${JSON.stringify({ ...ACTOR, updateTime: stamp })}|\n` +
          `${JSON.stringify({ type: "DOCHEAD", ticket })}||${JSON.stringify({ docType: "SYMBOL", client: CLIENT, uuid: targetUuid,
            updateTime: stamp, version: String(stamp), editVersion: "3.2.206" })}|\n` +
          `${JSON.stringify({ type: "META", ticket, id: "META" })}||${JSON.stringify(metadata)}`;
        stageUploadBytes = Math.max(stageUploadBytes, Buffer.byteLength(upload));
        const next = [...path, upload]; nextPaths.push(next);
        const input = { chunks: next, targetUuid, maximumTicket: ticket, currentEditVersion: "3.2.206" };
        // Reuse the actual post-write proof bounds, including total bytes, chunks,
        // Records and individual records. Do not maintain a looser parallel parser.
        const raw = await prepareSavedSymbolProjection(input);
        const cache = await (strategy === "meta-only" ? prepareCurrentDocumentCacheSavedSymbolProjection(input) : prepareCanvas(input));
        if (strategy === "canvas-segments") {
          need(cache.profile === "private.current-canvas-segments-saved-symbol-getstr-projection.v1" && cache.rawPrefixOrderIndependent,
            "appended metadata header must not constrain canvas replay order");
        }
        for (const projection of [raw, cache]) {
          // Permuting the same exact lines changes neither UTF8 length nor
          // JSON-escaped envelope length. Bound both distinct header prefixes.
          const content = expectedSavedSymbolContent(projection, CLIENT);
          const bytes = Buffer.byteLength(content);
          maximumSavedContentBytes = Math.max(maximumSavedContentBytes, bytes);
          need(bytes > 0 && bytes <= CURRENT_SAVED_SYMBOL_CONTENT_LIMIT, "complete desired saved content exceeds its reader byte limit");
          maximumSavedEnvelopeBytes = Math.max(maximumSavedEnvelopeBytes, savedEnvelopeBytes(targetUuid, ticket, stage, content, startup));
        }
      }
    }
    uploadBytes.push(stageUploadBytes); maximumUploadBytes = Math.max(maximumUploadBytes, stageUploadBytes); paths = nextPaths;
  }
  return Object.freeze({ profile: BUDGET_PROFILES[strategy],
    targetUuid, beforeMaximumTicket: maximumTicket,
    reservedWrites: stages.length, afterMaximumTicket: maximumTicket + stages.length, afterHistoryRows: history.historyRowCount + stages.length,
    afterChunks: chunks.length + stages.length, maximumUploadBytes,
    maximumRawHistoryBytes: history.plaintextBytes + uploadBytes.reduce((sum, bytes) => sum + bytes, 0), maximumSavedContentBytes, maximumSavedEnvelopeBytes,
    sqlCapacity: sqlCapacity(before, history.branchUuid, uploadBytes),
    savedContentLimit: CURRENT_SAVED_SYMBOL_CONTENT_LIMIT, producerBindingVerified: false, executionAuthorized: false });
}
