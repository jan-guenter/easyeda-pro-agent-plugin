/** Internal bounded reader. No native schema or execution lifecycle is admitted.
 * Read hash-bound immutable SQL inputs, including maintained checkpoints.
 * Those checkpoints use VACUUM INTO: their complete table inventory is NOT a
 * complete original-source inventory. A closed-file byte-copy/identity proof
 * or an independently proved normalization projection remains required.
 * Runs only inside the owned, deadline-bounded reader process. Schema/effect
 * admission belongs to a separate coordinator, not this generic inventory.
 */
import { createHash } from "node:crypto";
import { constants } from "node:fs";
import type { BigIntStats } from "node:fs";
import { lstat, open, realpath } from "node:fs/promises";
import type { FileHandle } from "node:fs/promises";
import { isAbsolute } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { setImmediate as yieldImmediate } from "node:timers/promises";
import { canonicalJson, sha256Json } from "./sqlite-inventory-json.ts";

export const MAX_FILE_BYTES = 256n * 1024n * 1024n;
const MAX_ROWS = 100_000;
const MAX_CELL_BYTES = 2_097_152;
const MAX_TOTAL_BYTES = 67_108_864;
const MAX_TOTAL_CELLS = 250_000;
export const MAX_ENCODED_BYTES = 16_777_216;
const SQL_HEAP_BYTES = 67_108_864;
const HASH = /^[a-f0-9]{64}$/u;
export const IDENTITY_KEYS = ["dev", "ino", "size", "mtimeNs", "ctimeNs", "nlink", "mode", "uid", "gid"] as const;
export type FileIdentity = Readonly<Record<typeof IDENTITY_KEYS[number], string>>;
export interface SqlScanInput {
  readonly checkpointPath: string;
  readonly expectedSha256: string;
  readonly identity: FileIdentity;
}
export function identity(info: BigIntStats): FileIdentity {
  return { dev: info.dev.toString(), ino: info.ino.toString(), size: info.size.toString(), mtimeNs: info.mtimeNs.toString(),
    ctimeNs: info.ctimeNs.toString(), nlink: info.nlink.toString(), mode: info.mode.toString(), uid: info.uid.toString(), gid: info.gid.toString() };
}
type SchemaEntry = Readonly<{ type: string; name: string; table: string; sql: string | null }>;
export interface SqlSchemaProfile { readonly id: string; readonly entries: readonly SchemaEntry[] }
export type SqlCell = Readonly<{ kind: "null" }> |
  Readonly<{ kind: "integer"; decimal: string }> |
  Readonly<{ kind: "real"; ieee754le: string }> |
  Readonly<{ kind: "text" | "blob"; hex: string }>;
export interface SqlRow { readonly rowid: SqlCell | null; readonly cells: readonly SqlCell[] }
export interface SqlTable {
  readonly name: string;
  readonly columns: readonly Readonly<Record<string, unknown>>[];
  readonly withoutRowid: boolean;
  readonly strict: boolean;
  readonly rows: readonly SqlRow[];
  readonly sha256: string;
}
export interface NativeSqlInventory {
  readonly profile: "easyeda-pro-control.exact-sqlite-inventory.v2";
  readonly checkpointSha256: string;
  readonly schemaSha256: string;
  readonly schema: readonly SchemaEntry[];
  readonly properties: Readonly<Record<string, string | number>>;
  readonly tables: readonly SqlTable[];
  readonly logicalSha256: string;
}
function compareRows(left: SqlRow, right: SqlRow): number {
  const a = canonicalJson(left);
  const b = canonicalJson(right);
  if (a < b) { return -1; }
  if (a > b) { return 1; }
  return 0;
}
export class SqlInventoryRefusalError extends Error {
  public override name = "SqlInventoryRefusalError";
}
function requireValue(condition: boolean, message: string): asserts condition {
  if (!condition) { throw new SqlInventoryRefusalError(message); }
}
function isUnknownArray(value: unknown): value is readonly unknown[] { return Array.isArray(value); }
export function freezeDeep<T>(value: T): T {
  if (value !== null && typeof value === "object") {
    for (const child of Object.values(value)) { freezeDeep(child); }
    Object.freeze(value);
  }
  return value;
}
function quoteIdentifier(value: string): string {
  requireValue(value.length > 0 && value.length <= 256 && !value.includes("\0"), "Unsupported SQL identifier.");
  return `"${value.replaceAll('"', '""')}"`;
}
export async function noSidecars(path: string): Promise<void> {
  for (const suffix of ["-wal", "-shm", "-journal"]) {
    const absent = await lstat(`${path}${suffix}`).then(() => false, (error: unknown) => {
      if (error instanceof Error && "code" in error && error.code === "ENOENT") { return true; }
      throw error;
    });
    requireValue(absent, "Immutable SQL checkpoint has a sidecar.");
  }
}
export async function hashHandle(file: FileHandle): Promise<string> {
  const hash = createHash("sha256");
  for await (const chunk of file.createReadStream({ autoClose: false, start: 0 })) {
    const bytes: unknown = chunk;
    requireValue(Buffer.isBuffer(bytes), "Checkpoint stream returned non-bytes.");
    hash.update(bytes);
  }
  return hash.digest("hex");
}
function schemaEntries(database: DatabaseSync): readonly SchemaEntry[] {
  const rows = database.prepare("SELECT type,name,tbl_name,sql FROM sqlite_schema ORDER BY type,name").all();
  requireValue(rows.length > 0 && rows.length <= 256, "SQL schema entry bound exceeded.");
  return rows.map((row) => {
    requireValue(typeof row["type"] === "string" && ["table", "index", "view", "trigger"].includes(row["type"]) &&
      typeof row["name"] === "string" && row["name"].length <= 256 && typeof row["tbl_name"] === "string" && row["tbl_name"].length <= 256 &&
      (row["sql"] === null || (typeof row["sql"] === "string" && row["sql"].length <= 65_536)),
    "Unsupported schema entry.");
    return { type: row["type"], name: row["name"], table: row["tbl_name"], sql: row["sql"] };
  });
}
function databaseProperties(database: DatabaseSync): Readonly<Record<string, string | number>> {
  const result: Record<string, string | number> = {};
  for (const name of ["user_version", "application_id", "encoding", "page_size", "auto_vacuum", "schema_version"]) {
    const value = database.prepare(`PRAGMA ${name}`).get()?.[name];
    requireValue(typeof value === "string" || (typeof value === "number" && Number.isSafeInteger(value)), "Unsupported persisted SQL property.");
    result[name] = value;
  }
  return result;
}
function integerCell(value: bigint): SqlCell { return { kind: "integer", decimal: value.toString() }; }
function cell(kind: unknown, numeric: unknown, hexadecimal: unknown): SqlCell {
  if (kind === "null") { requireValue(numeric === null && hexadecimal === null, "NULL encoding drift."); return { kind }; }
  if (kind === "integer") { requireValue(typeof numeric === "bigint" && hexadecimal === null, "Integer encoding drift."); return integerCell(numeric); }
  if (kind === "real") {
    requireValue(typeof numeric === "number" && Number.isFinite(numeric) && hexadecimal === null, "REAL encoding refused.");
    const bytes = Buffer.alloc(8); bytes.writeDoubleLE(numeric); return { kind, ieee754le: bytes.toString("hex") };
  }
  requireValue((kind === "text" || kind === "blob") && numeric === null && typeof hexadecimal === "string" &&
    hexadecimal.length <= MAX_CELL_BYTES * 2 && /^(?:[A-F0-9]{2})*$/u.test(hexadecimal), "Text/BLOB encoding refused.");
  return { kind, hex: hexadecimal.toLowerCase() };
}
function boundedSize(database: DatabaseSync, table: string, columns: readonly string[]): Readonly<{ bytes: number; rows: number }> {
  const row = database.prepare(`SELECT COUNT(*) AS n FROM ${quoteIdentifier(table)}`).get();
  requireValue(typeof row?.["n"] === "number" && row["n"] <= MAX_ROWS, "SQL row bound exceeded.");
  let bytes = 0;
  for (const name of columns) {
    const length = `length(CAST(${quoteIdentifier(name)} AS BLOB))`;
    const size = database.prepare(`SELECT COALESCE(MAX(${length}),0) AS m,COALESCE(SUM(${length}),0) AS s FROM ${quoteIdentifier(table)}`).get();
    requireValue(typeof size?.["m"] === "number" && typeof size["s"] === "number" &&
      Number.isSafeInteger(size["s"]) && size["m"] <= MAX_CELL_BYTES, "SQL cell bound exceeded.");
    bytes += size["s"];
    requireValue(bytes <= MAX_TOTAL_BYTES, "SQL table byte bound exceeded.");
  }
  return { bytes, rows: row["n"] };
}
function encodedBudget(): (value: unknown) => void {
  let used = 0;
  return (value: unknown): void => {
    used += Buffer.byteLength(JSON.stringify(value));
    requireValue(used <= MAX_ENCODED_BYTES, "Complete SQL encoded-byte bound exceeded.");
  };
}
export async function scanExactSqliteInventory(input: SqlScanInput, beforeSql: () => Promise<void>): Promise<NativeSqlInventory> {
  const { checkpointPath: path, expectedSha256 } = input;
  requireValue(isAbsolute(path) && path.endsWith(".eprj2") && HASH.test(expectedSha256), "Invalid immutable checkpoint input.");
  requireValue(await realpath(path) === path, "Checkpoint path includes a symbolic link.");
  await noSidecars(path);
  // Descriptor 3 was opened read-only by the parent. Never reopen the supplied source path.
  const file = await open("/proc/self/fd/3", constants.O_RDONLY);
  let database: DatabaseSync | undefined;
  try {
    const before = await file.stat({ bigint: true });
    requireValue(before.isFile() && before.nlink === 1n && before.size > 0n && before.size <= MAX_FILE_BYTES, "Checkpoint file refused.");
    requireValue(canonicalJson(identity(before)) === canonicalJson(input.identity), "Inherited SQL descriptor identity mismatch.");
    requireValue(await hashHandle(file) === expectedSha256, "Checkpoint hash mismatch.");
    await beforeSql();
    database = new DatabaseSync(`file:/proc/self/fd/${file.fd}?mode=ro&immutable=1`, { readOnly: true, allowExtension: false, defensive: true, enableDoubleQuotedStringLiterals: false });
    database.exec("PRAGMA trusted_schema=OFF; PRAGMA query_only=ON; PRAGMA mmap_size=0; PRAGMA cache_size=-4096");
    requireValue(database.prepare(`PRAGMA hard_heap_limit=${SQL_HEAP_BYTES}`).get()?.["hard_heap_limit"] === SQL_HEAP_BYTES,
      "SQLite heap bound was not installed.");
    requireValue(database.prepare("PRAGMA quick_check").get()?.["quick_check"] === "ok", "SQL quick_check failed.");
    const schema = schemaEntries(database);
    const properties = databaseProperties(database);
    const descriptors = database.prepare("PRAGMA main.table_list").all();
    const tables: SqlTable[] = [];
    const budget = encodedBudget();
    budget({ schema, properties });
    let totalBytes = 0;
    let totalRows = 0;
    let totalCells = 0;
    for (const entry of schema.filter((value) => value.type === "table")) {
      const listed = descriptors.filter((value) => value["schema"] === "main" && value["name"] === entry.name);
      requireValue(listed.length === 1 && listed[0]?.["type"] === "table" &&
        [0, 1].includes(Number(listed[0]["wr"])) && [0, 1].includes(Number(listed[0]["strict"])), "Unsupported SQL table kind.");
      const columns = database.prepare(`PRAGMA main.table_xinfo(${quoteIdentifier(entry.name)})`).all();
      requireValue(columns.length > 0 && columns.length <= 128 && columns.every((column) => column["hidden"] === 0 && typeof column["name"] === "string"), "Unsupported SQL columns.");
      const names = columns.map((column) => String(column["name"]));
      const withoutRowid = listed[0]["wr"] === 1;
      const rowidAlias = ["rowid", "_rowid_", "oid"].find((name) => !names.some((column) => column.toLowerCase() === name));
      requireValue(withoutRowid || rowidAlias !== undefined, "All rowid aliases are shadowed.");
      const size = boundedSize(database, entry.name, names);
      totalBytes += size.bytes;
      totalCells += size.rows * (names.length + (withoutRowid ? 0 : 1));
      requireValue(totalCells <= MAX_TOTAL_CELLS, "Complete SQL cell-count bound exceeded.");
      requireValue(totalBytes <= MAX_TOTAL_BYTES, "Complete SQL byte bound exceeded.");
      requireValue(totalRows + size.rows <= MAX_ROWS, "Complete SQL row bound exceeded.");
      budget({ name: entry.name, columns, withoutRowid, strict: listed[0]["strict"] === 1 });
      const expressions = names.flatMap((name) => {
        const q = quoteIdentifier(name);
        const kind = `typeof(${q})`;
        return [kind, `CASE WHEN ${kind} IN ('integer','real') THEN ${q} ELSE NULL END`,
          `CASE WHEN ${kind} IN ('text','blob') THEN hex(${q}) ELSE NULL END`];
      });
      const prefix = withoutRowid ? "" : `${quoteIdentifier(rowidAlias ?? "")},`;
      const statement = database.prepare(`SELECT ${prefix}${expressions.join(",")} FROM ${quoteIdentifier(entry.name)}`);
      statement.setReadBigInts(true); statement.setReturnArrays(true);
      const rows: SqlRow[] = [];
      for (const untyped of statement.iterate()) {
        const row: unknown = untyped;
        requireValue(isUnknownArray(row) && row.length === names.length * 3 + (withoutRowid ? 0 : 1), "SQL result shape drift.");
        let index = withoutRowid ? 0 : 1;
        const rowid = withoutRowid ? null : row[0];
        requireValue(rowid === null || typeof rowid === "bigint", "SQL rowid missing.");
        const cells = names.map(() => { const value = cell(row[index], row[index + 1], row[index + 2]); index += 3; return value; });
        const encoded = { rowid: rowid === null ? null : integerCell(rowid), cells };
        budget(encoded);
        rows.push(encoded);
        totalRows += 1;
        requireValue(totalRows <= MAX_ROWS, "Complete SQL row bound exceeded.");
        if (totalRows % 1000 === 0) { await yieldImmediate(); }
      }
      rows.sort(compareRows);
      const value = { name: entry.name, columns, withoutRowid, strict: listed[0]["strict"] === 1, rows };
      tables.push({ ...value, sha256: sha256Json(value) });
    }
    const after = await file.stat({ bigint: true });
    const named = await lstat(path, { bigint: true });
    for (const key of IDENTITY_KEYS) {
      requireValue(before[key] === after[key] && after[key] === named[key], "Checkpoint identity changed during SQL inventory.");
    }
    requireValue(await realpath(path) === path && await hashHandle(file) === expectedSha256, "Checkpoint bytes changed during SQL inventory.");
    await noSidecars(path);
    const schemaSha256 = sha256Json(schema);
    const value: NativeSqlInventory = freezeDeep({ profile: "easyeda-pro-control.exact-sqlite-inventory.v2", checkpointSha256: expectedSha256,
      schemaSha256, schema, properties, tables,
      logicalSha256: sha256Json({ schema, properties, tables }) });
    requireValue(Buffer.byteLength(JSON.stringify(value)) <= MAX_ENCODED_BYTES, "Complete SQL encoded-byte bound exceeded.");
    return value;
  } finally {
    try { database?.close(); } finally { await file.close(); }
  }
}
