/** Bounded readonly diagnostics, separate from immutable journal/result data.
 * Only the private original source issuer can supply a code. */
import { originalNativeOrSourceErrorCode } from "./original-native-error-code.ts";
import { z } from "zod";

export const currentSchematicRelevanceDisplayWriteDiagnosticSchema = z.strictObject({
  schema: z.literal("easyeda-pro-control.schematic209-relevance-display-write-diagnostic.v1"),
  stage: z.string().regex(/^[a-z][a-z\d-]{0,63}$/u), originalFailureObserved: z.boolean(),
  errorCode: z.string().regex(/^[A-Z][A-Z\d_]{1,127}$/u).nullable(),
  executionAuthorized: z.literal(false), persistenceVerified: z.literal(false), stackIncluded: z.literal(false),
}).refine(value => value.originalFailureObserved === (value.errorCode !== null));
export type CurrentSchematicRelevanceDisplayWriteDiagnostic = z.infer<typeof currentSchematicRelevanceDisplayWriteDiagnosticSchema>;
export function currentSchematicRelevanceDisplayWriteErrorCode(error: unknown): string {
  return originalNativeOrSourceErrorCode(error) ?? "ORIGINAL_ERROR_UNCLASSIFIED";
}
export function currentSchematicRelevanceDisplayWriteDiagnostic(stage: string, errorCode: string | null): CurrentSchematicRelevanceDisplayWriteDiagnostic {
  return Object.freeze(currentSchematicRelevanceDisplayWriteDiagnosticSchema.parse({ schema: "easyeda-pro-control.schematic209-relevance-display-write-diagnostic.v1", stage,
    originalFailureObserved: errorCode !== null, errorCode, executionAuthorized: false, persistenceVerified: false, stackIncluded: false }));
}
