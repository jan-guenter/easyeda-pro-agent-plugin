/** Immutable Via helper bytes for lossless build storage only. A decoder must
 * restore every original table length/hash and exact wire bytes. These data
 * grant no program selection, execution, owner, clock, Job or continuation. */
import { createHash } from "node:crypto";
import { CURRENT_PCB_VIA_MAIN_BEGIN_CALLS as BEGIN } from "./current-pcb-via-main-begin-programs.ts";
import { CURRENT_PROJECT_HISTORY_MAIN_PROGRAMS as HISTORY } from "./current-project-history-main-programs.ts";
import { CURRENT_PROJECT_SAVE_STRUCTURE_MAIN_PROGRAMS as STRUCTURE } from "./current-project-save-structure-main-programs.ts";
import { CURRENT_PCB_VIA_MAIN_BEGIN_BOOKKEEPING as BEGIN_FIXED, CURRENT_PCB_VIA_MAIN_BEGIN_REBASE as BEGIN_REBASE, CURRENT_PCB_VIA_MAIN_HISTORY_BOOKKEEPING as HISTORY_FIXED, CURRENT_PCB_VIA_MAIN_STRUCTURE_BOOKKEEPING as STRUCTURE_FIXED } from "./current-pcb-via-main-captured-rebase.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_JOIN_HELPERS as JOIN } from "./current-selected-file-main-sql-fence-programs.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

function need(value: boolean): asserts value { if (!value) { throw new Error("PCB_VIA_MAIN_STORAGE_PREFIX"); } }
/** Cut only explicitly reviewed immutable headers/body markers. Repeated
 * nested headers have a fixed census; unknown or ambiguous cutpoints refuse. */
function section(source: string, header: string, body: string, headers: number, includeHeader = false, first = false): string {
  need(source.split(header).length === headers + 1 && source.split(body).length === 2);
  const selected = first ? source.indexOf(header) : source.lastIndexOf(header); const start = selected + (includeHeader ? 0 : header.length); const end = source.indexOf(body, start);
  need(selected >= 0 && end > start); return source.slice(start, end);
}
/** Publish both source and already JSON-escaped byte identities. Catalogue
 * consumers can share these exact bytes while retaining original wire hashes. */
function row(key: string, value: string): Readonly<{ key: string; value: string; bytes: number; sha256: string; escaped: string; escapedBytes: number; escapedSha256: string }> {
  const escaped = JSON.stringify(value).slice(1, -1); need(value.length > 0 && !/[\0\t]/u.test(escaped) && !escaped.includes("__via_main_storage_"));
  return Object.freeze({ key, value, bytes: Buffer.byteLength(value), sha256: createHash("sha256").update(value).digest("hex"), escaped, escapedBytes: Buffer.byteLength(escaped), escapedSha256: createHash("sha256").update(escaped).digest("hex") });
}
export const CURRENT_PCB_VIA_MAIN_STORAGE_PREFIXES = freezeDeep([
  row("completion-original", section(BEGIN.save.program, "function(actorPacket,sqlPacket){", "\nconst z=seed", 1)),
  row("completion-readonly", section(BEGIN_FIXED.save.program, "function(actorPacket,sqlPacket){", "\nconst z=seed", 2)),
  row("history-original-tail", section(HISTORY.branch.program, "\nconst checked=", "\narr(this,6);", 1, true)),
  row("history-readonly-tail", section(HISTORY_FIXED.branch.program, "\nconst checked=", "\narr(this,6);", 1, true)),
  row("structure-original", section(STRUCTURE.selected, "function(queryPacket){", "array(this,5);", 1)),
  row("structure-readonly", section(STRUCTURE_FIXED.selected.program, "function(queryPacket){", "array(this,5);", 2)),
  row("structure-native-original-tail", section(STRUCTURE.run, JOIN, "\nconst packet=[this,caller", 1)),
  row("structure-native-readonly-tail", section(STRUCTURE_FIXED.runValue.program, JOIN, "\nconst q=run(this)", 1)),
  row("readonly-scratch", section(BEGIN_FIXED.save.program, "function(actorPacket,sqlPacket){", "return (function(", 2, false, true)),
  row("begin-readonly-tail", section(BEGIN_REBASE.run.program, "\nconst checked=", "\narr(this,7);", 1, true)),
] as const);
const escapedTable = CURRENT_PCB_VIA_MAIN_STORAGE_PREFIXES.map(value => value.escaped).join("\0");
need(Buffer.byteLength(escapedTable) <= 65_536 && new Set(CURRENT_PCB_VIA_MAIN_STORAGE_PREFIXES.map(value => value.escaped)).size === CURRENT_PCB_VIA_MAIN_STORAGE_PREFIXES.length);
const escapedHash = createHash("sha256").update(escapedTable).digest("hex");
need(CURRENT_PCB_VIA_MAIN_STORAGE_PREFIXES.length === 10 && Buffer.byteLength(escapedTable) === 65_148 && escapedHash === "419e62504f9d81a44caf2fcce570e5ae2c28acf0899f1667e95858ec74aa76bc");
export const CURRENT_PCB_VIA_MAIN_STORAGE_PREFIX_TABLE = Object.freeze({ rows: CURRENT_PCB_VIA_MAIN_STORAGE_PREFIXES.length, bytes: Buffer.byteLength(escapedTable), sha256: escapedHash });
