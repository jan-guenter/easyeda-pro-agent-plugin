/** Live diagnostics read only the original pause's captured tuple. Historical
 * v1 remains a separate immutable frame-evaluation/two-request contract. */
import { z } from "zod";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_SOURCE as SOURCE } from "./current-selected-file-main-sql-fence-source.ts";
import { currentSelectedFileMainSqlStartupDiagnosticSchema as historicalV1Schema } from "./current-selected-file-main-sql-startup-diagnostic.ts";
import type { CurrentSelectedFileMainSqlStartupDiagnostic as HistoricalV1 } from "./current-selected-file-main-sql-startup-diagnostic.ts";

export interface CurrentSelectedFileMainSqlStartupDiagnosticV2 extends Omit<HistoricalV1, "profile" | "frameState"> {
  readonly profile: "private.selected-file-main-sql-startup-diagnostic.v2";
  readonly frameOrigin: "captured-original-tuple";
  readonly frameState: "not-read" | "captured" | "tuple-refused" | "properties-refused";
}
/** New current format uses the same strict summary/site fields. A captured
 * summary requires exactly its one property request; no frame eval is allowed. */
export const currentSelectedFileMainSqlStartupDiagnosticV2Schema = z.strictObject({
  ...historicalV1Schema.shape,
  profile: z.literal("private.selected-file-main-sql-startup-diagnostic.v2"),
  frameOrigin: z.literal("captured-original-tuple"),
  frameState: z.enum(["not-read", "captured", "tuple-refused", "properties-refused"]),
  diagnosticRequests: z.number().int().min(0).max(1),
}).refine(value => (value.frameState === "captured") === (value.summary !== null) &&
  (value.summary === null || value.summary.slotKinds.length === SOURCE.sites[value.site].expression.slice(1, -1).split(",").length) &&
  (value.frameState !== "captured" || value.diagnosticRequests === 1) &&
  (value.frameState !== "not-read" && value.frameState !== "tuple-refused" || value.diagnosticRequests === 0));

export type HistoricalSelectedFileMainSqlStartupDiagnosticV1 = HistoricalV1;
export type CurrentSelectedFileMainSqlStartupDiagnosticRecord = HistoricalV1 | CurrentSelectedFileMainSqlStartupDiagnosticV2;
/** Optional private artifact boundary accepts both explicit released profiles.
 * Historical parsing never creates a tuple, original owner or resume grant. */
export const currentSelectedFileMainSqlStartupDiagnosticRecordSchema = z.union([historicalV1Schema, currentSelectedFileMainSqlStartupDiagnosticV2Schema]);
