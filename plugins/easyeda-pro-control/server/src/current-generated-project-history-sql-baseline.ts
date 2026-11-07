/** Complete-reader initial row projection only. The original writer factory
 * independently supplies its genuine generated checkpoint and operation. */
import { z } from "zod";
import { readerCompletion } from "./sqlite-inventory.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import type { NativeSqlInventory, SqlCell } from "./sqlite-inventory-core.ts";

type Cell = string | number | null;
const uuid = z.string().regex(/^[a-f\d]{32}$/u); const time = z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/u);
export const currentGeneratedProjectHistorySqlBaselineSchema = z.strictObject({ projectUuid: z.string().regex(/^[a-f\d]{64}$/u), branchUuid: uuid,
  initialLogicalSha256: z.string().regex(/^[a-f\d]{64}$/u), branch: z.strictObject({ node: z.literal(0), uuid, delete_status: z.literal(0), history_uuid: uuid }),
  head: z.strictObject({ num: z.literal(0), uuid, key: uuid, is_lock: z.literal(0), created_at: time }),
  structure: z.strictObject({ ticket: z.literal(1), structure: z.string().min(1).max(65_536) }),
});
export type CurrentGeneratedProjectHistorySqlBaseline = Readonly<z.infer<typeof currentGeneratedProjectHistorySqlBaselineSchema>>;
function need(value: boolean): asserts value { if (!value) { throw new Error("GENERATED_PROJECT_HISTORY_BASELINE"); } }
function cellValue(cell: SqlCell | undefined): Cell {
  need(cell !== undefined); if (cell.kind === "null") { return null; }
  if (cell.kind === "integer") { const number = Number(cell.decimal); need(Number.isSafeInteger(number) && String(number) === cell.decimal); return number; }
  need(cell.kind === "text"); const bytes = Buffer.from(cell.hex, "hex"), text = bytes.toString("utf8"); need(Buffer.from(text, "utf8").equals(bytes)); return text;
}
export function currentGeneratedProjectHistorySqlBaseline(inventory: NativeSqlInventory, projectUuid: string, branchUuid: string): CurrentGeneratedProjectHistorySqlBaseline {
  readerCompletion(inventory);
  const rows = (name: string): readonly Readonly<Record<string, Cell>>[] => { const tables = inventory.tables.filter(table => table.name === name); const table = tables[0]; need(tables.length === 1 && table !== undefined);
    const columns = table.columns.map(column => { need(typeof column["name"] === "string"); return column["name"]; }); need(new Set(columns).size === columns.length);
    return table.rows.map(row => { need(row.cells.length === columns.length); return Object.fromEntries(columns.map((columnName, index) => [columnName, cellValue(row.cells[index])])); }); };
  const branch = rows("branches").filter(row => row["uuid"] === branchUuid), head = rows(`project_history_${branchUuid}`), structure = rows("project_structures");
  const selected = branch[0], selectedHead = head[0], selectedStructure = structure[0]; need(branch.length === 1 && head.length === 1 && structure.length === 1 && selected !== undefined && selectedHead !== undefined && selectedStructure !== undefined);
  need(selected["project_uuid"] === projectUuid && selected["history_uuid"] === selectedHead["uuid"] && selectedStructure["project_uuid"] === projectUuid && selectedStructure["branch_uuid"] === branchUuid);
  return freezeDeep(currentGeneratedProjectHistorySqlBaselineSchema.parse({ projectUuid, branchUuid, initialLogicalSha256: inventory.logicalSha256,
    branch: { node: selected["node"], uuid: selected["uuid"], delete_status: selected["delete_status"], history_uuid: selected["history_uuid"] },
    head: { num: selectedHead["num"], uuid: selectedHead["uuid"], key: selectedHead["key"], is_lock: selectedHead["is_lock"], created_at: selectedHead["created_at"] },
    structure: { ticket: selectedStructure["ticket"], structure: selectedStructure["structure"] } }));
}
