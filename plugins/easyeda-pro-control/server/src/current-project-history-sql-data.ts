/** Exact pinned wo/D5 output for one selected history transaction. These
 * strings and parameter rosters grant no native SQL or operation authority. */
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PROJECT_HISTORY_SQL = freezeDeep({
  historyData: '\n    insert into history_data ("uuid","history_uuid","dataStr") values (\n        ?,\n        ?,\n        ?) on conflict ("uuid") do update set "dataStr" = \n    ?',
  branch: 'update branches set history_uuid = \n    ? where \n    "uuid" = \n    ?',
  commit: "commit transaction",
  project: "update projects set updated_at = \n    ?,modifier_uuid = \n    ? where \n    1 = \n    1",
  structure: 'update project_structures set ticket = \n    ?,structure = \n    ? where \n    "branch_uuid" = \n    ?',
});
export function currentProjectSelectedHistorySql(branchUuid: string, mode: "append" | "mutable"): string {
  if (!/^[a-f\d]{32}$/u.test(branchUuid) || mode !== "append" && mode !== "mutable") { throw new Error("PROJECT_HISTORY_SQL_SCOPE"); }
  if (mode === "append") { return `insert into project_history_${branchUuid} ("uuid","parent","snapshot","key") values (\n    ?,\n    ?,\n    ?,\n    ?)`; }
  return `update project_history_${branchUuid} set num = \n    ? where \n    "uuid" = \n    ?`;
}
export const CURRENT_PROJECT_HISTORY_SQL_PARAMETER_ROSTERS = freezeDeep({ historyData: ["chunkUuid", "historyUuid", "dataBase64", "dataBase64"],
  append: ["historyUuid", "parentHistoryUuid", null, "keyHex"], mutable: ["nextNum", "historyUuid"], branch: ["historyUuid", "branchUuid"],
  commit: [], project: ["updatedAt", "modifierUuid"], structure: ["ticket", "exactStructure", "branchUuid"] });
