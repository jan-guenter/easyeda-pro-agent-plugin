/** Separate future writer birth. The released forward observation purpose and
 * execution-generation v1 schemas remain read-only and unchanged. Parsing this
 * data does not issue a native owner, source qualification or send capability. */
import { z } from "zod";

export const CURRENT_FOOTPRINT_FORWARD_EXECUTION_PURPOSE = "worker-startup-footprint-forward-execution209";
export const currentFootprintForwardExecutionGenerationSchema = z.object({
  profile: z.literal("private.current-footprint-forward-execution-generation.v2"),
  purpose: z.literal(CURRENT_FOOTPRINT_FORWARD_EXECUTION_PURPOSE),
  operationId: z.string().max(96).regex(/^footprint-forward-execution-[a-z\d][a-z\d-]{0,95}$(?![\s\S])/u),
  bindingSha256: z.string().regex(/^[a-f\d]{64}$(?![\s\S])/u),
}).strict();
export type CurrentFootprintForwardExecutionGeneration = Readonly<z.infer<typeof currentFootprintForwardExecutionGenerationSchema>>;

export const CURRENT_FOOTPRINT_FORWARD_EXECUTION_MISSING_PROVIDERS = Object.freeze([
  "separately-born-original-writer-v2-native-owner",
  "same-writer-v2-opening-source-seal-and-checkpoint-qualification",
  "same-writer-v2-head-queues-clocks-and-main-cursor-qualification",
  "complete-original-normal-cleanup-control-and-output-reservation",
  "fixed-native-codebooks-and-original-cleanup-transports",
  "original-saved-generation-replay-exclusion-and-complete-sql-provider",
] as const);
