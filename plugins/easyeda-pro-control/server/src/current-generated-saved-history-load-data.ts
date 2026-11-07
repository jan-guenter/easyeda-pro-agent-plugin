/** Completed SQL/cipher projection only. This contains no original owner,
 * checkpoint issuer, cache mutation, worker or opening authority. */
import { createHash } from "node:crypto";
import { CURRENT_GENERATED_INITIAL_CACHE_SOURCE as INITIAL_CACHE_SOURCE } from "./current-generated-initial-cache-source.ts";
import { canonicalJson, sha256Text } from "./core.ts";
import { decodeNativeHistoryChunk, parseNativeRecords } from "./native-history.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import type { NativeSqlInventory, SqlCell, SqlTable } from "./sqlite-inventory-core.ts";

export interface GeneratedSavedHistoryLoadTarget {
  readonly projectUuid: string; readonly branchUuid: string; readonly documentUuid: string; readonly sourceSha256: string;
}
export interface GeneratedSavedHistoryLoadData {
  readonly projectUuid: string; readonly branchUuid: string; readonly documentUuid: string; readonly headHistoryUuid: string;
  readonly sourceSha256: string; readonly logicalSha256: string; readonly projectionSourceSha256: string;
  /** Generated native cipher/key/plaintext values stay private. Never include
   * them in public results, diagnostics or journals. */
  readonly histories: readonly Readonly<Record<string, string | number | null>>[];
  readonly chunks: readonly Readonly<{ historyUuid: string; ordinal: 0 | 1; dataUuid: string; fetchUrl: string;
    keyHex: string; dataBase64: string; cipherSha256: string; plaintext: string; plaintextSha256: string }>[];
  readonly nativeLoadingVerified: false; readonly cacheExclusionVerified: false; readonly reopenedVerified: false;
}
type Scalar = string | number | null;
const projection = ["id", "uuid", "parent", "key", "is_lock", "num", "snapshot_num", "created_at", "updated_at", "lock_time"] as const;
function need(value: boolean): asserts value { if (!value) { throw new Error("PCB_VIA_SAVED_LOAD_PLAN"); } }
function scalar(cell: SqlCell | undefined): Scalar {
  need(cell !== undefined); if (cell.kind === "null") { return null; }
  if (cell.kind === "integer") { const value = Number(cell.decimal); need(Number.isSafeInteger(value) && String(value) === cell.decimal); return value; }
  need(cell.kind === "text"); const bytes = Buffer.from(cell.hex, "hex"), value = bytes.toString("utf8"); need(Buffer.from(value).equals(bytes)); return value;
}
function rows(table: SqlTable | undefined): readonly Readonly<Record<string, Scalar>>[] {
  need(table !== undefined && !table.withoutRowid && table.rows.length > 0 && table.rows.length <= 2);
  const names = table.columns.map(column => { need(typeof column["name"] === "string"); return column["name"]; }); need(new Set(names).size === names.length);
  return table.rows.map(row => { need(row.rowid !== null && row.cells.length === names.length); return Object.fromEntries(names.map((name, index) => [name, scalar(row.cells[index])])); });
}
function text(value: Scalar | undefined): string { need(typeof value === "string"); return value; }
export async function deriveGeneratedSavedHistoryLoadData(inventory: NativeSqlInventory, target: GeneratedSavedHistoryLoadTarget): Promise<GeneratedSavedHistoryLoadData> {
  readerCompletion(inventory); need(inventory.checkpointSha256 === target.sourceSha256);
  const tables = new Map(inventory.tables.map(table => [table.name, table])); need(tables.size === inventory.tables.length);
  const branches = rows(tables.get("branches")), payloads = rows(tables.get("history_data"));
  const selected = branches.find(branch => branch["uuid"] === target.branchUuid); need(selected !== undefined && selected["project_uuid"] === target.projectUuid);
  const raw = [...rows(tables.get(`project_history_${target.branchUuid}`))].toSorted((a, b) => { need(typeof a["id"] === "number" && typeof b["id"] === "number"); return b["id"] - a["id"]; });
  need(raw[0]?.["uuid"] === selected["history_uuid"] && payloads.length === 2);
  const chunks: GeneratedSavedHistoryLoadData["chunks"][number][] = [], histories: Record<string, Scalar>[] = []; const covered = new Set<string>();
  for (const row of raw) {
    const historyUuid = text(row["uuid"]), keyHex = text(row["key"]); const count = row["num"];
    need(/^[a-f\d]{32}$/u.test(historyUuid) && /^[a-f\d]{32}$/u.test(keyHex) && (count === 0 || count === 1) && row["snapshot"] === null && row["snapshot_num"] === 0);
    const api = Object.fromEntries(projection.map(name => { const value = row[name]; need(value !== undefined); return [name, value]; }));
    const base = `/api/v4/histories/dataStr?path=${target.projectUuid}&uuid=${historyUuid}`; histories.push({ ...api, iv: historyUuid, dataStrUrl: base });
    for (let ordinal = 0; ordinal <= count; ordinal += 1) {
      need(ordinal === 0 || ordinal === 1); const suffix = ordinal === 0 ? "" : "-1"; const dataUuid = `${historyUuid}${suffix}`;
      const payload = payloads.find(value => value["uuid"] === dataUuid); need(payload !== undefined && payload["history_uuid"] === historyUuid && !covered.has(dataUuid));
      const dataBase64 = text(payload["dataStr"]); const bytes = Buffer.from(dataBase64, "base64"); need(bytes.toString("base64") === dataBase64 && bytes.length > 0 && bytes.length <= 8192);
      const plaintext = await decodeNativeHistoryChunk({ historyUuid, keyHex, dataBase64 }); readerCompletion(inventory);
      need(plaintext.isWellFormed() && plaintext.startsWith('{"type":"EDIT_HEAD"}||') && Buffer.byteLength(plaintext) <= 16_384);
      // Native Save bodies end at the final record, while imported initial
      // Archives include a delimiter. Preserve both actual plaintext forms.
      const parsed = parseNativeRecords(plaintext); need(parsed.length >= 3 && parsed[0]?.header["type"] === "EDIT_HEAD" && parsed.some(value => value.header["type"] === "DOCHEAD"));
      covered.add(dataUuid); chunks.push(Object.freeze({ historyUuid, ordinal, dataUuid, fetchUrl: `${base}${suffix}`, keyHex, dataBase64,
        cipherSha256: createHash("sha256").update(bytes).digest("hex"), plaintext, plaintextSha256: sha256Text(plaintext) }));
    }
  }
  need(chunks.length === 2 && covered.size === payloads.length); readerCompletion(inventory);
  return freezeDeep({ projectUuid: target.projectUuid, branchUuid: target.branchUuid, documentUuid: target.documentUuid, headHistoryUuid: text(selected["history_uuid"]), sourceSha256: target.sourceSha256,
    logicalSha256: inventory.logicalSha256, projectionSourceSha256: sha256Text(canonicalJson(INITIAL_CACHE_SOURCE)), histories, chunks, nativeLoadingVerified: false, cacheExclusionVerified: false, reopenedVerified: false });
}
