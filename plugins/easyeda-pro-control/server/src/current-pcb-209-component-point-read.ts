import { z } from "zod";
import { currentPcb209SpatialPadPointSchema } from "./current-pcb-209-spatial-pad-read.ts";
import { CURRENT_PCB_209_SPATIAL_MAX_BYTES } from "./current-pcb-209-spatial-read.ts";

export { CURRENT_PCB_209_COMPONENT_POINT_BINDINGS_FUNCTION } from "./current-pcb-209-component-point-capture.ts";
export { CURRENT_PCB_209_COMPONENT_POINT_READ_FUNCTION } from "./current-pcb-209-component-point-read-program.ts";
export const currentPcb209ComponentPointQueriesSchema = z.array(currentPcb209SpatialPadPointSchema).min(1).max(16);
const id = z.string().min(1).max(256).refine(value => value.isWellFormed() && !value.includes("\0"));
const identitySchema = z.strictObject({ primitiveId: id, family: z.enum(["Component", "Pad"]) });
export const currentPcb209ComponentPointResultSchema = z.strictObject({
  schema: z.literal("easyeda-pro-control.pcb209-spatial-component-point-read.v1"), documentUuid: z.string().regex(/^[a-f0-9]{32}$/u),
  query: currentPcb209SpatialPadPointSchema, identities: z.array(identitySchema).max(1),
  sceneComponentCount: z.literal(1), scenePadCount: z.literal(1), sceneHiddenAttributeCount: z.literal(2), selectedPrimitiveIds: z.array(id).length(0), samples: z.literal(2),
  nativeOrderingPreserved: z.literal(true), retainedSceneDescriptorsUnchanged: z.literal(true), selectionUnchanged: z.literal(true),
  allowedExistingStateEffect: z.literal("D0.code;vMe.boxCache;Jdt-local-bbox-scratch;BLe.JJ"),
  scope: z.literal("generated-top-origin-component-owned-circular-pad-hidden-attrs-ready-point-scene"), nativeFunctionGraphVerified: z.literal(false),
  nativeIntrinsicsVerified: z.literal(false), sourceMembershipVerified: z.literal(false), persistenceVerified: z.literal(false),
});
export type CurrentPcb209ComponentPointResult = z.infer<typeof currentPcb209ComponentPointResultSchema>;
export function decodeCurrentPcb209ComponentPointReply(input: unknown): CurrentPcb209ComponentPointResult {
  const packet = z.strictObject({ result: z.strictObject({ type: z.literal("string"), value: z.string().max(CURRENT_PCB_209_SPATIAL_MAX_BYTES) }) }).parse(input);
  if (!packet.result.value.isWellFormed() || Buffer.byteLength(packet.result.value) > CURRENT_PCB_209_SPATIAL_MAX_BYTES) { throw new Error("PCB209_COMPONENT_POINT_REPLY_BOUND"); }
  return currentPcb209ComponentPointResultSchema.parse(JSON.parse(packet.result.value) as unknown);
}
