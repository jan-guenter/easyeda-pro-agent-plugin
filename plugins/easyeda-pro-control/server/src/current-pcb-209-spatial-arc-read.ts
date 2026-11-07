/** Distinct Arc/Line/Via result shape. Older Via and Line/Via records retain
 * their schemas, counts, query bounds and historical parsing contracts. */
import { z } from "zod";
import { CURRENT_PCB_209_SPATIAL_MAX_HITS, currentPcb209SpatialQuerySchema } from "./current-pcb-209-spatial-read.ts";
import { currentPcb209SpatialTrackResultSchema, decodeCurrentPcb209SpatialResultData } from "./current-pcb-209-spatial-track-read.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const identity = currentPcb209SpatialTrackResultSchema.shape.identities.element.extend({ family: z.enum(["Via", "Line", "Arc"]) });
export const currentPcb209SpatialArcResultSchema = z.strictObject({
  ...currentPcb209SpatialTrackResultSchema.shape,
  schema: z.literal("easyeda-pro-control.pcb209-spatial-arc-line-via-read.v1"),
  identities: z.array(identity).max(CURRENT_PCB_209_SPATIAL_MAX_HITS)
    .refine(rows => new Set(rows.map(row => row.primitiveId)).size === rows.length),
  sceneArcCount: z.number().int().min(0).max(CURRENT_PCB_209_SPATIAL_MAX_HITS).refine(value => !Object.is(value, -0)),
  scope: z.literal("standalone-arc-line-via-ready-bbox-scene-no-region-border-crossings"),
}).refine(value => {
  const count = value.sceneArcCount + value.sceneLineCount + value.sceneViaCount;
  return count <= CURRENT_PCB_209_SPATIAL_MAX_HITS && value.identities.length <= count && value.selectedPrimitiveIds.length <= count &&
    value.identities.filter(row => row.family === "Arc").length <= value.sceneArcCount &&
    value.identities.filter(row => row.family === "Line").length <= value.sceneLineCount &&
    value.identities.filter(row => row.family === "Via").length <= value.sceneViaCount &&
    (value.query.kind !== "point" || value.identities.length <= 1);
});
export type CurrentPcb209SpatialArcResult = Readonly<z.infer<typeof currentPcb209SpatialArcResultSchema>>;
export const currentPcb209SpatialArcQueriesSchema = z.array(currentPcb209SpatialQuerySchema).min(1).max(6);

/** A strict complete wire result supplies no source or live-owner authority. */
export function decodeCurrentPcb209SpatialArcReply(input: unknown): CurrentPcb209SpatialArcResult {
  try {
    const decoded = decodeCurrentPcb209SpatialResultData(input);
    return freezeDeep(currentPcb209SpatialArcResultSchema.parse(decoded));
  } catch { throw new Error("PCB209_SPATIAL_ARC_REPLY"); }
}
