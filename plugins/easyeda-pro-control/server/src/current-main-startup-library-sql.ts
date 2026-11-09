/** Hash comparisons of the current original SQL string only. Matching a row
 * does not establish a JL invocation, native receiver or continuation. */
import { createHash } from "node:crypto";
import { types } from "node:util";
import { CURRENT_MAIN_STARTUP_LIBRARY_CHUNKS as CHUNKS, CURRENT_MAIN_STARTUP_LIBRARY_SOURCE as SOURCE } from "./current-main-startup-library-catalog.ts";

export interface CurrentMainStartupLibrarySqlMatch {
  readonly schema: "private.current-main-startup-library-sql-match.v1";
  readonly scriptIndex: number; readonly bytes: number; readonly utf16: number; readonly sha256: string;
  readonly readonlySql: false; readonly nativeCompletionProven: false;
  readonly normalReturnProven: false; readonly designWriteGrant: false;
}
function bad(): never { throw new Error("MAIN_STARTUP_LIBRARY_SQL_DATA"); }
/** Stock runScripts invokes run with its default fresh empty parameter array.
 * Reject hostile descriptors before reading any member or formatting input. */
export function requireCurrentMainStartupLibraryEmptyParameters(input: unknown): void {
  if (input === null || typeof input !== "object" || types.isProxy(input) || !Array.isArray(input) || Object.getPrototypeOf(input) !== Array.prototype) { return bad(); }
  const descriptor = Object.getOwnPropertyDescriptor(input, "length");
  if (descriptor === undefined || !Object.hasOwn(descriptor, "value") || descriptor.value !== 0 || Reflect.ownKeys(input).length !== 1) { return bad(); }
}
export function compareCurrentMainStartupLibrarySql(scriptIndex: unknown, sql: unknown, parameters: unknown): CurrentMainStartupLibrarySqlMatch | null {
  requireCurrentMainStartupLibraryEmptyParameters(parameters);
  if (typeof scriptIndex !== "number" || !Number.isSafeInteger(scriptIndex) || Object.is(scriptIndex, -0) || scriptIndex < 0 || scriptIndex >= SOURCE.script.chunkCount ||
    typeof sql !== "string" || !sql.isWellFormed() || sql.length === 0 || sql.length > SOURCE.script.maximumChunkUtf16) { return null; }
  const row = CHUNKS[scriptIndex]; if (row === undefined || sql.length !== row.utf16 || Buffer.byteLength(sql) !== row.bytes) { return null; }
  const sha256 = createHash("sha256").update(sql).digest("hex"); if (sha256 !== row.sha256) { return null; }
  return Object.freeze({ schema: "private.current-main-startup-library-sql-match.v1", scriptIndex, bytes: row.bytes, utf16: row.utf16, sha256,
    readonlySql: false, nativeCompletionProven: false, normalReturnProven: false, designWriteGrant: false });
}
