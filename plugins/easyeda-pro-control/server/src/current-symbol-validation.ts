/** Exact disposable-only phase requests. No target, patch, code or authority input. */
import { z } from "zod";

export const currentSymbolValidationStepSchema = z.discriminatedUnion("expectedPhase", [
  z.object({ expectedPhase: z.literal("forward-write"), confirmDisposableProject: z.literal(true), acceptMetadataMutation: z.literal(true) }).strict(),
  z.object({ expectedPhase: z.literal("inverse-write"), confirmDisposableProject: z.literal(true), acceptDerivedInverseMutation: z.literal(true) }).strict(),
  z.object({ expectedPhase: z.enum(["forward-close", "forward-verification-close", "inverse-close", "inverse-verification-close", "cleanup-close"]),
    confirmNormalClose: z.literal(true), acceptUnknownFileEffects: z.literal(true) }).strict(),
  z.object({ expectedPhase: z.enum(["forward-verification-start", "forward-verification-open", "inverse-relaunch", "inverse-verification-start", "inverse-verification-open"]),
    acceptNormalOpenEffects: z.literal(true) }).strict(),
  z.object({ expectedPhase: z.literal("inverse-open"), acceptNormalOpenEffects: z.literal(true), acceptUnqualifiedSchematicStartupEffects: z.literal(true) }).strict(),
  z.object({ expectedPhase: z.literal("inverse-prepare"), acceptScratchProcessEffects: z.literal(true) }).strict(),
  z.object({ expectedPhase: z.enum(["forward-observe-termination", "forward-verification-admit", "forward-verification-caches", "forward-verification-read", "forward-verification-finish",
    "inverse-admit", "inverse-caches", "inverse-clock", "inverse-observe-termination", "inverse-verification-admit", "inverse-verification-caches", "inverse-verification-read", "inverse-verification-finish",
    "cleanup-observe-termination"]) }).strict(),
]);
export type CurrentSymbolValidationStep = z.infer<typeof currentSymbolValidationStepSchema>;
export type CurrentSymbolValidationPhase = CurrentSymbolValidationStep["expectedPhase"];
