/** Saved-history rows from the original completed flow projection. This data
 * grants no Main owner, SQL continuation, writer or Save authority. */
import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { captureCurrentFootprintSavedFlowCacheInput } from "./current-footprint-saved-flow-cache-data.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const uuid = z.string().regex(/^[a-f\d]{32}$/u);
const scalar = z.union([z.string().max(1024), z.number().int(), z.null()]);
export const currentFootprintInverseMainHistoryRowSchema = z.strictObject({ id: z.number().int().positive(), uuid,
  parent: uuid.nullable(), key: uuid, is_lock: z.union([z.literal(0), z.literal(1)]), num: z.number().int().min(0).max(7),
  snapshot_num: z.literal(0), created_at: scalar, updated_at: scalar, lock_time: scalar, iv: uuid });
export const currentFootprintInverseMainHistoryValueSchema = z.strictObject({ projectUuid: z.string().regex(/^[a-f\d]{64}$/u),
  branchUuid: uuid, historyUuid: uuid, rows: z.array(currentFootprintInverseMainHistoryRowSchema).min(1).max(8) });
type Value = z.infer<typeof currentFootprintInverseMainHistoryValueSchema>;
export type CurrentFootprintInverseMainHistoryBaseline = Readonly<Omit<Value, "rows"> & { rows: readonly Readonly<Value["rows"][number]>[] }>;
/** The native factory must retain this result with its actual flow/checkpoint.
 * An independently supplied input or matching JSON cannot enroll that owner. */
export function deriveCurrentFootprintInverseMainHistoryBaseline(raw: unknown): CurrentFootprintInverseMainHistoryBaseline {
  const input = captureCurrentFootprintSavedFlowCacheInput(raw);
  const result = currentFootprintInverseMainHistoryValueSchema.parse({ projectUuid: input.projectUuid, branchUuid: input.branchUuid,
    historyUuid: input.headHistoryUuid, rows: input.heads.map(row => ({ id: row.id, uuid: row.uuid, parent: row.parent, key: row.key, is_lock: row.is_lock, num: row.num, snapshot_num: row.snapshot_num, created_at: row.created_at, updated_at: row.updated_at, lock_time: row.lock_time, iv: row.uuid })) });
  if (result.rows[0]?.uuid !== result.historyUuid || new Set(result.rows.map(row => row.uuid)).size !== result.rows.length ||
    result.rows.some((row, index) => row.parent !== (result.rows[index + 1]?.uuid ?? null) || index > 0 && row.id >= (result.rows[index - 1]?.id ?? 0))) {
    throw new Error("FOOTPRINT_INVERSE_MAIN_HISTORY_BASELINE");
  }
  if (canonicalJson(result).length > 16_384) { throw new Error("FOOTPRINT_INVERSE_MAIN_HISTORY_BOUND"); }
  return freezeDeep(result);
}
