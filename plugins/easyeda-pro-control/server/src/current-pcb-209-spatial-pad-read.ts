/** Pad-only point results have a distinct schema. Parsing grants no original
 * runtime ownership, source qualification or native geometry acceptance. */
import { z } from "zod";
import { CURRENT_PCB_209_SPATIAL_MAX_HITS, currentPcb209SpatialQuerySchema } from "./current-pcb-209-spatial-read.ts";
import { currentPcb209SpatialTrackResultSchema, decodeCurrentPcb209SpatialResultData } from "./current-pcb-209-spatial-track-read.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export { CURRENT_PCB_209_SPATIAL_PAD_BINDINGS_FUNCTION } from "./current-pcb-209-spatial-pad-capture.ts";
export { CURRENT_PCB_209_SPATIAL_PAD_READ_FUNCTION } from "./current-pcb-209-spatial-pad-read-program.ts";

export const currentPcb209SpatialPadPointSchema = currentPcb209SpatialQuerySchema.options[0];
export const currentPcb209SpatialPadQueriesSchema = z.array(currentPcb209SpatialPadPointSchema).min(1).max(16);
const common = z.strictObject(currentPcb209SpatialTrackResultSchema.shape).omit({ sceneViaCount: true, sceneLineCount: true }).shape;
const identity = currentPcb209SpatialTrackResultSchema.shape.identities.element.extend({ family: z.literal("Pad") });
export const currentPcb209SpatialPadResultSchema = z.strictObject({ ...common,
  schema: z.literal("easyeda-pro-control.pcb209-spatial-pad-point-read.v1"), query: currentPcb209SpatialPadPointSchema,
  identities: z.array(identity).max(1),
  scenePadCount: z.number().int().nonnegative().max(CURRENT_PCB_209_SPATIAL_MAX_HITS).refine(value => !Object.is(value, -0)),
  scope: z.literal("standalone-circular-pad-ready-point-scene"),
}).refine(value => value.identities.length <= value.scenePadCount && value.selectedPrimitiveIds.length <= value.scenePadCount);
export type CurrentPcb209SpatialPadResult = Readonly<z.infer<typeof currentPcb209SpatialPadResultSchema>>;
export function decodeCurrentPcb209SpatialPadReply(input: unknown): CurrentPcb209SpatialPadResult {
  try { return freezeDeep(currentPcb209SpatialPadResultSchema.parse(decodeCurrentPcb209SpatialResultData(input))); }
  catch { throw new Error("PCB209_SPATIAL_PAD_REPLY"); }
}
