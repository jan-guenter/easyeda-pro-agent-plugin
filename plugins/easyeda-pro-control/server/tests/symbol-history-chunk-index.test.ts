import assert from "node:assert/strict";
import { test } from "node:test";
import { setImmediate } from "node:timers";
import type { SqlCell, SqlRow, SqlTable } from "../src/sqlite-inventory.ts";
import { indexHistoryChunkUuids } from "../src/symbol-history-chunk-index.ts";

function table(keys: readonly SqlCell[]): SqlTable {
  return { name: "history_data", columns: [{ name: "uuid" }], withoutRowid: false, strict: false, sha256: "0".repeat(64),
    rows: keys.map((cell, index) => ({ rowid: { kind: "integer", decimal: String(index + 1) }, cells: [cell] })) };
}
function textCell(value: string): SqlCell { return { kind: "text", hex: Buffer.from(value).toString("hex") }; }
function selected(index: ReadonlyMap<string, SqlRow | null>, key: string): SqlRow {
  const row = index.get(key); assert.ok(row !== null && row !== undefined, "Required SQL identity is not unique."); return row;
}
void test("one index retains exact source-row identity and key byte distinctions", async () => {
  const keys = ["", " ", "uuid", "UUID", "\u00E9", "e\u0301", "\u0000"];
  const input = table(keys.map((value) => textCell(value))); const indexed = await indexHistoryChunkUuids(input);
  for (const [position, key] of keys.entries()) { assert.equal(selected(indexed, key), input.rows[position]); }
  assert.equal(indexed.size, keys.length); assert.throws(() => selected(indexed, "missing"), /not unique/u);
});
void test("duplicate selected key never chooses first last or third row", async () => {
  const input = table(["same", "same", "unrelated", "same"].map((value) => textCell(value))); const indexed = await indexHistoryChunkUuids(input);
  assert.equal(indexed.get("same"), null); assert.throws(() => selected(indexed, "same"), /not unique/u);
  assert.equal(selected(indexed, "unrelated"), input.rows[2]);
});
void test("unselected duplicate marking preserves prior selected-key semantics", async () => {
  const input = table(["selected", "other", "other"].map((value) => textCell(value))); const indexed = await indexHistoryChunkUuids(input);
  assert.equal(selected(indexed, "selected"), input.rows[0]); assert.equal(indexed.get("other"), null);
});
void test("empty table still has no selected identity", async () => {
  const indexed = await indexHistoryChunkUuids(table([])); assert.equal(indexed.size, 0); assert.throws(() => selected(indexed, "missing"), /not unique/u);
});
for (const hex of ["ff", "c080", "eda080", "f4908080", "61c2", "e282"]) {
  void test(`malformed UUID UTF8 refuses even in an unrelated final row ${hex}`, async () => {
    const input = table([textCell("selected"), { kind: "text", hex }]);
    await assert.rejects(indexHistoryChunkUuids(input), /exact UTF8/u);
  });
}
for (const cell of [{ kind: "null" }, { kind: "integer", decimal: "1" }, { kind: "blob", hex: "6162" }] as const) {
  void test(`non-TEXT UUID refuses ${cell.kind}`, async () => { await assert.rejects(indexHistoryChunkUuids(table([cell])), /Expected SQL TEXT/u); });
}
void test("missing UUID column and sparse row cell refuse", async () => {
  const input = table([textCell("value")]);
  await assert.rejects(indexHistoryChunkUuids({ ...input, columns: [{ name: "other" }] }), /column missing/u);
  await assert.rejects(indexHistoryChunkUuids({ ...input, rows: [{ rowid: null, cells: [] }] }), /Expected SQL TEXT/u);
});
for (const rowCount of [512, 2048, 8192]) {
  void test(`UUID decoding is linear across ${rowCount} rows and 128 lookups`, async (context) => {
    let reads = 0;
    const keys = Array.from({ length: rowCount }, (_, index): SqlCell => {
      const hex = Buffer.from(`key-${index}`).toString("hex");
      return { kind: "text", get hex(): string { reads += 1; return hex; } };
    });
    const input = table(keys); const start = performance.now(); const indexed = await indexHistoryChunkUuids(input);
    const indexMs = performance.now() - start;
    for (let query = 0; query < 128; query += 1) { assert.equal(selected(indexed, `key-${query}`), input.rows[query]); }
    assert.equal(reads, rowCount, "Each UUID must be decoded once, independent of selected-chunk count.");
    reads = 0; const oldStart = performance.now();
    for (let query = 0; query < 128; query += 1) {
      const found = input.rows.filter((row) => {
        const cell = row.cells[0]; assert.ok(cell?.kind === "text");
        const bytes = Buffer.from(cell.hex, "hex"); const value = bytes.toString("utf8");
        assert.ok(Buffer.from(value).equals(bytes)); return value === `key-${query}`;
      });
      assert.deepEqual(found, [input.rows[query]]);
    }
    assert.equal(reads, rowCount * 128);
    context.diagnostic(JSON.stringify({ rowCount, queries: 128, indexedDecodes: rowCount, previousDecodes: reads,
      indexMs, previousScanMs: performance.now() - oldStart }));
  });
}
void test("row batches yield real event-loop turns while retaining final row", async (context) => {
  const input = table(Array.from({ length: 10_000 }, (_, index) => textCell(`row-${index}`)));
  let running = true; let ticks = 0; let last = performance.now(); let maximumGapMs = 0;
  function tick(): void {
    if (!running) { return; } const now = performance.now(); maximumGapMs = Math.max(maximumGapMs, now - last); last = now; ticks += 1; setImmediate(tick);
  }
  setImmediate(tick);
  try { const indexed = await indexHistoryChunkUuids(input); assert.equal(selected(indexed, "row-9999"), input.rows[9999]); }
  finally { running = false; }
  assert.ok(ticks >= 150); context.diagnostic(JSON.stringify({ ticks, maximumGapMs, scope: "index-only measured, not a universal preparation deadline" }));
});
void test("encoded byte batches yield below row-count threshold", async () => {
  const keys = Array.from({ length: 16 }, (_, index) => textCell("\u00E9".repeat(8192) + index)); const input = table(keys);
  let running = true; let ticks = 0;
  function tick(): void { if (running) { ticks += 1; setImmediate(tick); } }
  setImmediate(tick);
  try { const indexed = await indexHistoryChunkUuids(input); assert.equal(indexed.size, 16); }
  finally { running = false; }
  assert.ok(ticks >= 6, "The 16 large UUID cells must yield by encoded bytes, not wait for 128 rows.");
});
