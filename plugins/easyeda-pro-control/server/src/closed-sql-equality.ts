/** Complete logical equality of two original finished readers. No execution grant. */
import { yieldProofEventLoop } from "./cooperative-proof.ts";
import { canonicalJson } from "./core.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { SqlCell, readExactSqlInventory } from "./sqlite-inventory.ts";

export type Inventory = Awaited<ReturnType<typeof readExactSqlInventory>>;
function need(value: boolean): asserts value { if (!value) { throw new Error("Closed SQL equality refused."); } }
function sameCell(left: SqlCell | null, right: SqlCell | null | undefined): boolean {
  if (left === null) { return right === null; }
  if (right === null || right === undefined || left.kind !== right.kind) { return false; }
  if (left.kind === "null") { return true; }
  if (left.kind === "integer") { return right.kind === "integer" && left.decimal === right.decimal; }
  if (left.kind === "real") { return right.kind === "real" && left.ieee754le === right.ieee754le; }
  return (right.kind === "blob" || right.kind === "text") && left.hex === right.hex;
}
function cellBytes(value: SqlCell | null): number {
  return value?.kind === "text" || value?.kind === "blob" ? value.hex.length : 32;
}
export async function compareCompleteClosedSql(left: Inventory, right: Inventory): Promise<Readonly<{
  profile: "private.closed-symbol-reopened-sql-equality.v1"; exactLogicalSqlUnchanged: true;
  originalEditSqlSha256: string; reopenedSqlSha256: string; executionAuthorized: false; completionProved: false;
}>> {
  need(readerCompletion(left).exitCode === 0 && readerCompletion(right).exitCode === 0);
  need(left.profile === right.profile && left.schema.length === right.schema.length && left.tables.length === right.tables.length);
  need(canonicalJson(left.properties) === canonicalJson(right.properties));
  for (const [index, expected] of left.schema.entries()) {
    need(canonicalJson(expected) === canonicalJson(right.schema[index]));
    await yieldProofEventLoop();
  }
  let cells = 0, encodedBytes = 0;
  for (const [tableIndex, expected] of left.tables.entries()) {
    const observed = right.tables[tableIndex];
    need(observed !== undefined && expected.name === observed.name && expected.strict === observed.strict &&
      expected.withoutRowid === observed.withoutRowid && expected.columns.length === observed.columns.length && expected.rows.length === observed.rows.length);
    for (const [columnIndex, column] of expected.columns.entries()) {
      need(canonicalJson(column) === canonicalJson(observed.columns[columnIndex]));
    }
    for (const [rowIndex, row] of expected.rows.entries()) {
      const actual = observed.rows[rowIndex];
      need(actual !== undefined && sameCell(row.rowid, actual.rowid) && row.cells.length === actual.cells.length);
      cells += 1;
      for (const [index, cell] of row.cells.entries()) {
        need(sameCell(cell, actual.cells[index])); cells += 1; encodedBytes += cellBytes(cell);
        if (cells >= 128 || encodedBytes >= 65_536) { cells = 0; encodedBytes = 0; await yieldProofEventLoop(); }
      }
    }
    need(expected.sha256 === observed.sha256);
    await yieldProofEventLoop();
  }
  need(left.schemaSha256 === right.schemaSha256 && left.logicalSha256 === right.logicalSha256);
  return Object.freeze({ profile: "private.closed-symbol-reopened-sql-equality.v1", exactLogicalSqlUnchanged: true,
    originalEditSqlSha256: left.logicalSha256, reopenedSqlSha256: right.logicalSha256, executionAuthorized: false, completionProved: false });
}
