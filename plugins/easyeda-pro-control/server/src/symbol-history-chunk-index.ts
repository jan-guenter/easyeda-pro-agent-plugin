/** Pure index over an already bounded, issued SQL inventory. No proof authority. */
import { yieldProofEventLoop } from "./cooperative-proof.ts";
import type { SqlRow, SqlTable } from "./sqlite-inventory.ts";

const ROW_BATCH = 128;
const BYTE_BATCH = 65_536;

/** Null retains a duplicate key rather than silently selecting its first/last row.
 * The selected-key check preserves unique()'s missing/duplicate refusal.
 * Every UUID is decoded once, including unrelated rows, with exact UTF8 checks.
 * Only index construction changes; full SQL row comparisons still use the source.
 */
export async function indexHistoryChunkUuids(owner: SqlTable): Promise<ReadonlyMap<string, SqlRow | null>> {
  const column = owner.columns.findIndex((entry) => entry["name"] === "uuid");
  if (column === -1) { throw new Error("Required SQL column missing."); }
  const result = new Map<string, SqlRow | null>();
  let bytes = 0; let rows = 0;
  for (const row of owner.rows) {
    const cell = row.cells[column];
    if (cell?.kind !== "text") { throw new Error("Expected SQL TEXT."); }
    const hex = cell.hex; const size = hex.length / 2;
    if (rows > 0 && bytes + size > BYTE_BATCH) { await yieldProofEventLoop(); bytes = 0; rows = 0; }
    const encoded = Buffer.from(hex, "hex"); const value = encoded.toString("utf8");
    if (!Buffer.from(value).equals(encoded)) { throw new Error("SQL identity text is not exact UTF8."); }
    result.set(value, result.has(value) ? null : row);
    bytes += size; rows += 1;
    if (rows >= ROW_BATCH || bytes >= BYTE_BATCH) { await yieldProofEventLoop(); bytes = 0; rows = 0; }
  }
  return result;
}
