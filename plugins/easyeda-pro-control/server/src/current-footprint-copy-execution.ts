/** Private distinct execution-generation contract. No registered tool or
 * preparation-purpose owner may instantiate this lifecycle. Native mounting
 * and its complete launch/request reservation are deliberately still absent. */
import { z } from "zod";

export const CURRENT_FOOTPRINT_COPY_EXECUTION_PURPOSE = "worker-startup-footprint-copy209";
export const CURRENT_FOOTPRINT_COPY_EXECUTION_PHASES = ["prepare", "create", "close-writer", "observe-writer-exit", "release-writer",
  "start-verification", "exclude-replay", "open-verification", "read-verification", "close-verification",
  "observe-verification-exit", "release-verification", "complete", "failed-closed"] as const;
export const currentFootprintCopyExecutionGenerationSchema = z.object({
  profile: z.literal("private.current-footprint-copy-execution-generation.v1"),
  purpose: z.literal(CURRENT_FOOTPRINT_COPY_EXECUTION_PURPOSE),
  operationId: z.string().regex(/^footprint-copy-[a-z\d][a-z\d-]{0,95}(?![\s\S])/u),
  bindingSha256: z.string().length(64).regex(/^[a-f\d]{64}(?![\s\S])/u),
}).strict();
export const currentFootprintCopyExecutionAdvanceSchema = z.object({
  expectedPhase: z.enum(CURRENT_FOOTPRINT_COPY_EXECUTION_PHASES),
}).strict();
export type CurrentFootprintCopyExecutionGeneration = Readonly<z.infer<typeof currentFootprintCopyExecutionGenerationSchema>>;
export type CurrentFootprintCopyExecutionPhase = typeof CURRENT_FOOTPRINT_COPY_EXECUTION_PHASES[number];
/** Coordinator limits only. They cannot reserve a native helper or expand the
 *554-request preparation purpose. Native execution needs its own full profile. */
export const CURRENT_FOOTPRINT_COPY_EXECUTION_LIMITS = Object.freeze({
  generations: 2, createAttempts: 1, explicitSaveAttempts: 0, normalCloseAttemptsPerGeneration: 1,
  terminationObservationsPerGeneration: 240, journalRecords: 32, milliseconds: 3_600_000,
  releaseObservationsPerGeneration: 240,
  nativeExecutionMounted: false, wholeNativeBudgetReserved: false,
});
