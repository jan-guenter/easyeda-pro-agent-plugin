/** Pure synthetic budget checks, never an editor or database mutation. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { prepareCurrentCanvasSegmentsWriteBudget, prepareCurrentSingleCanvasSegmentWriteBudget, prepareCurrentSymbolWriteBudget } from "../src/current-symbol-write-budget.ts";
import { CURRENT_SYMBOL_WRITE_TIME_CEILING, CURRENT_SYMBOL_WRITE_WINDOW_MS } from "../src/current-symbol-write-program.ts";
import { materializeNativeHistory } from "../src/native-history.ts";
import { isRecord, sha256Json } from "../src/core.ts";
import type { DecodedSymbolSqlRawHistory } from "../src/symbol-sql-comparator.ts";
import type { NativeSqlInventory, SqlTable } from "../src/sqlite-inventory-core.ts";
import { IDS, fixture } from "./helpers/symbol-sql-fixture.ts";

const CLIENT = "a".repeat(16), TARGET = "2".repeat(16);
const DESIRED = Object.freeze({ name: "After", description: "Exact desired metadata", tags: ["tag"], source: "" });
const STARTUP = Object.freeze({ sheetUuids: ["8".repeat(16)], templates: [] });
let original: Promise<NativeSqlInventory> | undefined;
async function originalInventory(): Promise<NativeSqlInventory> { const value = await fixture(); return value.before; }
function baseline(): Promise<NativeSqlInventory> { original ??= originalInventory(); return original; }
async function budget(input: DecodedSymbolSqlRawHistory, desired: Parameters<typeof prepareCurrentSymbolWriteBudget>[2] = DESIRED,
  inventory?: NativeSqlInventory): Promise<Readonly<Record<string, unknown>>> {
  return prepareCurrentSymbolWriteBudget(input, TARGET, desired, inventory ?? await baseline(), STARTUP);
}
function initial(ticket = 2, user?: object, description = "Before", updateTime = 100): string {
  return [`${JSON.stringify({ type: "DOCHEAD", ticket })}||${JSON.stringify({ docType: "SYMBOL", uuid: TARGET, client: CLIENT,
    updateTime, version: String(updateTime), editVersion: "3.2.206", ...(user === undefined ? {} : { user }) })}`,
  `${JSON.stringify({ type: "META", ticket, id: "META" })}||${JSON.stringify({ title: "Before", description, tags: [], docType: 2, source: "" })}`].join("|\n");
}
function decoded(chunks = [initial()], maximumTicket = 2, rows = 1): DecodedSymbolSqlRawHistory {
  const documents = materializeNativeHistory(chunks);
  return { chunks, maximumTicket, links: [], history: { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: "1".repeat(64),
    projectOwnerUuid: "3".repeat(32), branchUuid: IDS.branch, headHistoryUuid: "5".repeat(32), checkpointSha256: "6".repeat(64),
    historyRowCount: rows, chunkCount: chunks.length, plaintextBytes: chunks.reduce((total, chunk) => total + Buffer.byteLength(chunk), 0),
    documents, semanticSha256: sha256Json(documents) } };
}

void test("small desired metadata reserves one upload without granting authority", async () => {
  const input = decoded();
  const before = JSON.stringify(input), desiredBefore = JSON.stringify(DESIRED);
  const result = await budget(input);
  assert.equal(result["afterHistoryRows"], 2); assert.equal(result["afterChunks"], 2); assert.equal(result["afterMaximumTicket"], 3);
  assert.equal(result["savedContentLimit"], 65_536); assert.equal(result["executionAuthorized"], false);
  assert.equal(result["producerBindingVerified"], false);
  assert.equal(JSON.stringify(input), before); assert.equal(JSON.stringify(DESIRED), desiredBefore);
});

void test("UTF8, JSON escaping and preserved tags/source count toward the complete reader limit", async () => {
  for (const desired of [{ ...DESIRED, description: "x".repeat(65_536) }, { ...DESIRED, description: "😀".repeat(14_000) },
    { ...DESIRED, description: "\0".repeat(10_000) }, { ...DESIRED, tags: Array.from({ length: 120 }, () => "x".repeat(512)) },
    { ...DESIRED, description: "x".repeat(50_000), source: "\0".repeat(4096) }]) {
    await assert.rejects(budget(decoded(), desired), /reader byte limit/u);
  }
});

void test("symbol proof budget rejects metadata beyond its native UTF-16 bounds", async () => {
  for (const desired of [{ ...DESIRED, name: `${"😀".repeat(256)}x` }, { ...DESIRED, description: `${"😀".repeat(32_768)}x` },
    { ...DESIRED, tags: [`${"😀".repeat(256)}x`] }, { ...DESIRED, source: `${"😀".repeat(2048)}x` }]) {
    await assert.rejects(budget(decoded(), desired), /UTF-16/u);
  }
});

void test("retained historical header users remain in the bound when a real clock selects the old header", async () => {
  const user = { uuid: "7".repeat(32), extra: "x".repeat(60_000) };
  const input = decoded([initial(2, user)]);
  await assert.rejects(budget(input, { ...DESIRED, description: "x".repeat(6000) }), /reader byte limit/u);
});

void test("one new row and two ticket increments fit at the exact supported edge", async () => {
  const admitted = await budget(decoded([initial()], 2, 63));
  assert.equal(admitted["afterHistoryRows"], 64);
  const full = decoded([initial()], 2, 64);
  await assert.rejects(budget(full), /64-row/u);
  const last = Number.MAX_SAFE_INTEGER - 2;
  const edge = await budget(decoded([initial(last)], last));
  assert.equal(edge["afterMaximumTicket"], last + 1);
  for (const ticket of [Number.MAX_SAFE_INTEGER - 1, Number.MAX_SAFE_INTEGER, -0]) {
    const input = decoded([initial()], ticket);
    await assert.rejects(budget(input), /safe integers/u);
  }
});

void test("appending the upload must fit the existing complete chunk and plaintext bounds", async () => {
  const full = decoded(Array.from({ length: 4096 }, () => initial()));
  await assert.rejects(budget(full), /chunk count/u);
  const large = initial(2, undefined, "x".repeat(200_000));
  const chunks = Array.from({ length: 41 }, () => large);
  // Put the complete before-state just below the 8 MiB ceiling; only the new
  // Exact upload crosses it. A peer-free duplicate preserves valid raw clocks.
  const room = 8_388_608 - chunks.reduce((total, chunk) => total + Buffer.byteLength(chunk), 0);
  const emptyBytes = Buffer.byteLength(initial(3, undefined, ""));
  const last = initial(3, undefined, "x".repeat(room - emptyBytes - 1));
  chunks.push(last);
  const input = decoded(chunks, 3);
  assert.equal(input.history.plaintextBytes, 8_388_607);
  await assert.rejects(budget(input), /raw history byte bound/u);
});

void test("copied count claims and unsupported desired shapes cannot weaken the bounds", async () => {
  const input = decoded();
  await assert.rejects(budget({ ...input, history: { ...input.history, plaintextBytes: 0 } }), /counts differ/u);
  await assert.rejects(budget(input, { ...DESIRED, name: "" }));
});

function extraTable(name: string, rows: number, columns: number): SqlTable {
  const row = { rowid: { kind: "integer" as const, decimal: "1" }, cells: Array.from({ length: columns }, () => ({ kind: "null" as const })) };
  return { name, columns: Array.from({ length: columns }, (_, index) => ({ name: `column${index}` })), withoutRowid: false, strict: false,
    rows: Array.from({ length: rows }, () => row), sha256: "0".repeat(64) };
}

void test("logical SQL capacity reserves both inserted rows, cells and complete encoded output", async () => {
  const before = await baseline(), input = decoded();
  const rows = before.tables.reduce((sum, table) => sum + table.rows.length, 0);
  const nearRows = { ...before, tables: [...before.tables, extraTable("synthetic_rows", 99_999 - rows, 1)] };
  await assert.rejects(budget(input, DESIRED, nearRows), /row\/cell-count/u);
  const cells = before.tables.reduce((sum, table) => sum + table.rows.length * (table.columns.length + 1), 0);
  const wideRows = Math.floor((249_999 - cells) / 129);
  const remainder = 249_999 - cells - wideRows * 129;
  const extras = [extraTable("synthetic_cells", wideRows, 128)];
  if (remainder >= 2) { extras.push(extraTable("synthetic_remainder", 1, remainder - 1)); }
  await assert.rejects(budget(input, DESIRED, { ...before, tables: [...before.tables, ...extras] }), /row\/cell-count/u);
  const oversized = { ...before, properties: { ...before.properties, syntheticPadding: "x".repeat(16_777_216 - Buffer.byteLength(JSON.stringify(before)) - 100) } };
  assert.ok(Buffer.byteLength(JSON.stringify(oversized)) < 16_777_216);
  await assert.rejects(budget(input, DESIRED, oversized), /SQL encoded budget/u);
});

void test("saved envelope budgets preserve double escaping and exact startup string encoding", async () => {
  const input = decoded(), inventory = await baseline();
  const escaped = await budget(input, { ...DESIRED, description: "\\".repeat(25_000) });
  assert.ok(typeof escaped["maximumSavedEnvelopeBytes"] === "number" && escaped["maximumSavedEnvelopeBytes"] <= 393_216);
  const startup = { sheetUuids: ["8".repeat(16)], templates: Array.from({ length: 128 }, (_, index) => ({ uuid: index.toString(16).padStart(32, "0"),
    docType: 2 as const, partId: "\uD800".repeat(256) })) };
  await assert.rejects(prepareCurrentSymbolWriteBudget(input, TARGET, { ...DESIRED, description: "x".repeat(50_000) }, inventory, startup), /CURRENT_SAVED_SYMBOL_INPUT/u);
});

void test("complete output envelope can exceed its limit while saved content still fits", async () => {
  const history = initial(2, { uuid: "7".repeat(32) }, "Before", 8_640_000_000_000_001);
  const input = decoded([history]);
  await assert.rejects(budget(input, { ...DESIRED, description: "\\".repeat(32_500) }), /complete desired saved envelope/u);
});

void test("disposable forward reserves both exact metadata stages, history rows and tickets", async () => {
  const before = await baseline();
  const restore = { ...DESIRED, name: "Original", description: "x".repeat(5000) };
  const result = await prepareCurrentSymbolWriteBudget(decoded([initial()], 2, 62), TARGET, DESIRED, before, STARTUP, restore);
  const one = await budget(decoded());
  assert.equal(result["reservedWrites"], 2); assert.equal(result["afterHistoryRows"], 64); assert.equal(result["afterMaximumTicket"], 4);
  assert.equal(result["afterChunks"], 3);
  assert.ok(Number(result["maximumSavedContentBytes"]) > Number(one["maximumSavedContentBytes"]));
  const single = one["sqlCapacity"], sql = result["sqlCapacity"];
  assert.ok(isRecord(single) && isRecord(sql));
  assert.equal(Number(sql["maximumRows"]), Number(single["maximumRows"]) + 2);
  assert.ok(Number(sql["maximumEncodedBytes"]) > Number(single["maximumEncodedBytes"]));
  assert.equal(sql["physicalFileGrowthProved"], false); assert.equal(sql["readerResourceCompletionProved"], false);
  const full = decoded([initial()], 2, 63);
  await assert.rejects(prepareCurrentSymbolWriteBudget(full, TARGET, DESIRED, before, STARTUP, restore), /64-row/u);
  const maximumTicket = Number.MAX_SAFE_INTEGER - 2;
  const ticketEdge = decoded([initial(maximumTicket)], maximumTicket);
  await assert.rejects(prepareCurrentSymbolWriteBudget(ticketEdge, TARGET, DESIRED, before, STARTUP, restore), /safe integers/u);
  const excessive = { ...restore, description: "x".repeat(65_536) };
  await assert.rejects(prepareCurrentSymbolWriteBudget(decoded(), TARGET, DESIRED, before, STARTUP, excessive), /reader byte limit/u);
});

function allocationEdge(before: NativeSqlInventory, tableName: string, field: string): NativeSqlInventory {
  const integer = { kind: "integer" as const, decimal: String(Number.MAX_SAFE_INTEGER - 1) };
  return { ...before, tables: before.tables.map((table) => table.name === tableName ? { ...table, rows: table.rows.map((row) => ({
    rowid: field === "id" ? integer : row.rowid,
    cells: row.cells.map((cell, index) => table.columns[index]?.["name"] === field ? integer : cell),
  })) } : table) };
}

void test("SQL rowid and AUTOINCREMENT allocation reserve the inverse before dispatch", async () => {
  const before = await baseline(), input = decoded();
  for (const [table, field] of [[`project_history_${IDS.branch}`, "id"], ["sqlite_sequence", "seq"]]) {
    assert.ok(table !== undefined && field !== undefined);
    const edge = allocationEdge(before, table, field);
    await budget(input, DESIRED, edge);
    await assert.rejects(prepareCurrentSymbolWriteBudget(input, TARGET, DESIRED, edge, STARTUP, DESIRED), /allocation cannot/u);
  }
  const dataEdge = allocationEdge(before, "history_data", "id");
  await assert.rejects(budget(input, DESIRED, dataEdge), /sequence allocation/u);
});

function canvasInitial(raw = '{"x":1}', updateTime = 100): string {
  return `${initial(2, undefined, "Before", updateTime)}|\n{"type":"LINE","ticket":2,"id":"drawn"}||${raw}`;
}
async function canvasBudget(input = decoded([canvasInitial()]), desired: Parameters<typeof prepareCurrentSymbolWriteBudget>[2] = DESIRED,
  restore?: Parameters<typeof prepareCurrentSymbolWriteBudget>[5], inventory?: NativeSqlInventory): Promise<Readonly<Record<string, unknown>>> {
  return prepareCurrentSingleCanvasSegmentWriteBudget(input, TARGET, desired, inventory ?? await baseline(), STARTUP, restore);
}

void test("separate canvas budget preserves drawing bytes without broadening the META-only budget", async () => {
  const drawing = JSON.stringify({ label: "Ω\\".repeat(1500) });
  const input = decoded([canvasInitial(drawing)]);
  const before = JSON.stringify(input), metadataOnly = await budget(decoded()), result = await canvasBudget(input);
  assert.equal(result["profile"], "private.current-single-canvas-segment-write-budget.v1");
  assert.equal(result["reservedWrites"], 1); assert.equal(result["afterChunks"], 2);
  assert.equal(result["executionAuthorized"], false); assert.equal(result["producerBindingVerified"], false);
  assert.ok(Number(result["maximumSavedContentBytes"]) > Number(metadataOnly["maximumSavedContentBytes"]));
  assert.ok(Number(result["maximumSavedEnvelopeBytes"]) > Number(metadataOnly["maximumSavedEnvelopeBytes"]));
  assert.equal(JSON.stringify(input), before);
  await assert.rejects(budget(input), /document-cache canvas/u);
  await assert.rejects(canvasBudget(decoded()), /requires historical canvas/u);
  const largeDrawing = JSON.stringify({ label: "x".repeat(60_000) });
  const large = decoded([canvasInitial(largeDrawing)]);
  await assert.rejects(canvasBudget(large, { ...DESIRED, description: "x".repeat(6000) }), /reader byte limit/u);
});

void test("canvas original eligibility and strictly later synthetic headers cannot be hidden by the appended edit", async () => {
  const repeat = `${initial(3, undefined, "Later", 200)}|\n{"type":"LINE","ticket":3,"id":"drawn"}||`;
  const multipleSegments = decoded([canvasInitial(), repeat], 3, 2);
  const equalTime = decoded([canvasInitial(), initial(3, undefined, "Later", 100)], 3, 2);
  const discarded = decoded([canvasInitial(' {"x":1}')]);
  await assert.rejects(canvasBudget(multipleSegments), /multiple history segments/u);
  await assert.rejects(canvasBudget(equalTime), /segment arrival order/u);
  await assert.rejects(canvasBudget(discarded), /discarded/u);
  const noSingleWindow = decoded([canvasInitial('{"x":1}', CURRENT_SYMBOL_WRITE_TIME_CEILING - CURRENT_SYMBOL_WRITE_WINDOW_MS)]);
  await assert.rejects(canvasBudget(noSingleWindow), /reserved write headroom/u);
  const firstCeiling = CURRENT_SYMBOL_WRITE_TIME_CEILING - CURRENT_SYMBOL_WRITE_WINDOW_MS - 1;
  const noDoubleWindow = decoded([canvasInitial('{"x":1}', firstCeiling - CURRENT_SYMBOL_WRITE_WINDOW_MS)]);
  await assert.rejects(canvasBudget(noDoubleWindow, DESIRED, DESIRED), /reserved write headroom/u);
  const edgeInput = decoded([canvasInitial('{"x":1}', firstCeiling - CURRENT_SYMBOL_WRITE_WINDOW_MS - 1)]);
  const edge = await canvasBudget(edgeInput, DESIRED, DESIRED);
  assert.equal(edge["reservedWrites"], 2);
});

void test("canvas forward and larger exact restoration reserve intermediate output and summed SQL growth", async () => {
  const before = await baseline(), input = decoded([canvasInitial()], 2, 62), restore = { ...DESIRED, name: "Original", description: "x".repeat(5000) };
  const result = await canvasBudget(input, DESIRED, restore), single = await canvasBudget(input);
  assert.equal(result["reservedWrites"], 2); assert.equal(result["afterHistoryRows"], 64); assert.equal(result["afterMaximumTicket"], 4);
  assert.equal(result["afterChunks"], 3);
  assert.ok(Number(result["maximumSavedContentBytes"]) > Number(single["maximumSavedContentBytes"]));
  assert.ok(Number(result["maximumRawHistoryBytes"]) > input.history.plaintextBytes + Number(result["maximumUploadBytes"]));
  const oneSql = single["sqlCapacity"], twoSql = result["sqlCapacity"]; assert.ok(isRecord(oneSql) && isRecord(twoSql));
  assert.equal(Number(twoSql["maximumRows"]), Number(oneSql["maximumRows"]) + 2);
  const growth = Number(oneSql["maximumEncodedBytes"]) - Buffer.byteLength(JSON.stringify(before));
  const near = { ...before, properties: { ...before.properties,
    syntheticPadding: "x".repeat(16_777_216 - Buffer.byteLength(JSON.stringify(before)) - growth - 100) } };
  await canvasBudget(input, DESIRED, undefined, near);
  await assert.rejects(canvasBudget(input, DESIRED, restore, near), /SQL encoded budget/u);
  const noRestorationRow = decoded([canvasInitial()], 2, 63);
  await assert.rejects(canvasBudget(noRestorationRow, DESIRED, restore), /64-row/u);
  await assert.rejects(canvasBudget(input, DESIRED, { ...restore, description: "x".repeat(65_536) }), /reader byte limit/u);
});

void test("canvas envelopes count raw escaped drawing bodies as well as desired metadata", async () => {
  const drawing = JSON.stringify({ label: "\\".repeat(500) });
  const plainDrawing = JSON.stringify({ label: "x".repeat(1000) });
  const input = decoded([canvasInitial(drawing)]), plainInput = decoded([canvasInitial(plainDrawing)]);
  const desired = { ...DESIRED, description: "\\".repeat(19_000) };
  const escaped = await canvasBudget(input, desired), plain = await canvasBudget(plainInput, desired);
  assert.equal(escaped["maximumSavedContentBytes"], plain["maximumSavedContentBytes"]);
  assert.ok(Number(escaped["maximumSavedEnvelopeBytes"]) > Number(plain["maximumSavedEnvelopeBytes"]));
  assert.ok(Number(escaped["maximumSavedEnvelopeBytes"]) <= 393_216);
});

function severalCanvasSegments(): string[] {
  return [canvasInitial(), `${initial(3, undefined, "Later", 200)}|\n` +
    '{"type":"LINE","ticket":3,"id":"drawn"}||{ "x":2 }|\n{"type":"PART","ticket":3,"id":"part"}||{"partId":"P"}'];
}
async function segmentsBudget(input: DecodedSymbolSqlRawHistory, restore?: Parameters<typeof prepareCurrentSymbolWriteBudget>[5]): Promise<Readonly<Record<string, unknown>>> {
  return prepareCurrentCanvasSegmentsWriteBudget(input, TARGET, DESIRED, await baseline(), STARTUP, restore);
}

void test("separate multi-segment budget reserves exact forward/inverse output without broadening older profiles", async () => {
  const input = decoded(severalCanvasSegments(), 3, 2), serialized = JSON.stringify(input);
  const result = await segmentsBudget(input, DESIRED);
  assert.equal(result["profile"], "private.current-canvas-segments-write-budget.v1");
  assert.equal(result["reservedWrites"], 2); assert.equal(result["afterChunks"], 4); assert.equal(result["afterHistoryRows"], 4);
  assert.equal(result["executionAuthorized"], false); assert.equal(result["producerBindingVerified"], false);
  const empty = await budget(decoded());
  assert.ok(Number(result["maximumSavedContentBytes"]) > Number(empty["maximumSavedContentBytes"]));
  assert.equal(JSON.stringify(input), serialized);
  await assert.rejects(canvasBudget(input), /multiple history segments/u);
  await assert.rejects(budget(input), /document-cache canvas/u);
  const tombstone = severalCanvasSegments(); tombstone[1] += '|\n{"type":"LINE","ticket":4,"id":"drawn"}||';
  const removed = await segmentsBudget(decoded(tombstone, 4, 2), DESIRED);
  assert.equal(removed["reservedWrites"], 2);
});

void test("multi-segment budget reserves every appended chunk inside the first 101-stream loader batch", async () => {
  const peer = initial().replaceAll(TARGET, "7".repeat(16));
  const input = (count: number): DecodedSymbolSqlRawHistory => decoded([
    ...severalCanvasSegments(), ...Array.from({ length: count - 2 }, () => peer),
  ], 3, 2);
  const two = await segmentsBudget(input(99), DESIRED);
  assert.equal(two["afterChunks"], 101);
  const one = await segmentsBudget(input(100));
  assert.equal(one["afterChunks"], 101);
  await assert.rejects(segmentsBudget(input(100), DESIRED), /101|concurrent|chunk/u);
  await assert.rejects(segmentsBudget(input(101)), /101|concurrent|chunk/u);
});

void test("multi-segment budget retains original clock, inverse headroom and complete restored-content bounds", async () => {
  const history = severalCanvasSegments(); history[1] = history[1]?.replace('"updateTime":200', '"updateTime":100') ?? "missing";
  await assert.rejects(segmentsBudget(decoded(history, 3, 2)), /header|segment arrival order/u);
  const noDoubleWindow = CURRENT_SYMBOL_WRITE_TIME_CEILING - 2 * CURRENT_SYMBOL_WRITE_WINDOW_MS - 1;
  const nearCeiling = decoded([canvasInitial('{"x":1}', noDoubleWindow)]);
  await assert.rejects(segmentsBudget(nearCeiling, DESIRED), /reserved write headroom/u);
  const excessive = { ...DESIRED, description: "x".repeat(65_536) };
  const initialSegments = decoded(severalCanvasSegments(), 3, 2);
  await assert.rejects(segmentsBudget(initialSegments, excessive), /reader byte limit/u);
});
