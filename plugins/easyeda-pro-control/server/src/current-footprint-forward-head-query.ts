/** One fixed readonly head JOIN for the original forward Main collector.
 * SQL text and decoded rows provide no connection, callback, current-head
 * exclusion, native age or writer authority. The original issuer stays required. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { validateClockControlScope } from "./symbol-clock-controls.ts";
import type { CurrentFootprintCopyHeadReference } from "./current-footprint-copy-head-reference.ts";

const uuid = z.string().regex(/^[a-f\d]{32}$(?![\s\S])/u);
const projectUuid = z.string().regex(/^(?:[a-f\d]{32}|[a-f\d]{64})$(?![\s\S])/u);
const target = z.strictObject({ projectUuid, branchUuid: uuid });
const rowSchema = z.strictObject({ projectUuid, defaultBranchUuid: uuid, ownerUuid: uuid, branchUuid: uuid, branchProjectUuid: projectUuid,
  historyUuid: uuid, headUuid: uuid, headNum: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  isLock: z.union([z.literal(0), z.literal(1)]), createdAtLiteral: z.string().min(1).max(256),
  deleteStatus: z.literal(0), projectCount: z.literal(1), branchCount: z.literal(1), headCount: z.literal(1) });
export type CurrentFootprintForwardHeadRow = Readonly<z.infer<typeof rowSchema>>;
/** Only the sealed branch's hexadecimal table suffix enters SQL text. All
 * values remain parameters. Counts reject duplicate project/branch/head rows
 * even when a first-row API would otherwise hide an ambiguous relation. */
export function currentFootprintForwardHeadQuery(input: Readonly<{ projectUuid: string; branchUuid: string }>): Readonly<{
  sql: string; parameters: readonly [string, string, string];
}> {
  const selected = target.parse(captureCurrentPcbStringClockReply(input).value);
  const history = `"project_history_${selected.branchUuid}"`;
  const sql = `SELECT p.uuid AS projectUuid,p.branch_uuid AS defaultBranchUuid,p.owner_uuid AS ownerUuid,b.uuid AS branchUuid,b.project_uuid AS branchProjectUuid,b.history_uuid AS historyUuid,h.uuid AS headUuid,h.num AS headNum,h.is_lock AS isLock,h.created_at AS createdAtLiteral,b.delete_status AS deleteStatus,(SELECT COUNT(*) FROM projects) AS projectCount,(SELECT COUNT(*) FROM branches WHERE uuid=?) AS branchCount,(SELECT COUNT(*) FROM ${history} WHERE uuid=b.history_uuid) AS headCount FROM projects AS p JOIN branches AS b ON b.project_uuid=p.uuid LEFT JOIN ${history} AS h ON h.uuid=b.history_uuid WHERE p.uuid=? AND b.uuid=? LIMIT 1`;
  return Object.freeze({ sql, parameters: Object.freeze([selected.branchUuid, selected.projectUuid, selected.branchUuid] as const) });
}
/** Decode own bounded data from the actual original callback, then join the
 * complete selected relation to the retained historical source reference.
 * Equality is an observation; this function does not authenticate the callback
 * or prove that another continuation cannot change the head afterward. */
export function decodeCurrentFootprintForwardHeadRow(input: unknown,
  reference: CurrentFootprintCopyHeadReference): CurrentFootprintForwardHeadRow {
  const row = rowSchema.parse(captureCurrentPcbStringClockReply(input).value);
  if (Object.is(row.headNum, -0) || row.projectUuid !== reference.projectUuid || row.defaultBranchUuid !== reference.branchUuid ||
      row.branchUuid !== reference.branchUuid || row.branchProjectUuid !== reference.projectUuid || row.ownerUuid !== reference.ownerUuid ||
      row.historyUuid !== reference.historyUuid || row.headUuid !== row.historyUuid || row.createdAtLiteral !== reference.createdAtLiteral ||
      row.isLock !== (reference.lockState === "locked" ? 1 : 0)) { throw new Error("FORWARD_HEAD_QUERY_SOURCE_RELATION"); }
  if (row.isLock === 0) { validateClockControlScope({ createdAtLiteral: row.createdAtLiteral, referenceUtcMs: 0 }); }
  return Object.freeze(row);
}
