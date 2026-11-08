/** Safe live diagnostics remain separate from immutable operation history. */
import { z } from "zod";
import { originalNativeOrSourceErrorCode } from "./original-native-error-code.ts";

export const currentPcbViaWriteDiagnosticSchema = z.strictObject({
  schema: z.literal("easyeda-pro-control.pcb209-via-write-diagnostic.v1"),
  stage: z.string().max(64).regex(/^[a-z][a-z\d-]{0,63}$(?![\s\S])/u), originalFailureObserved: z.boolean(),
  errorCode: z.string().max(128).regex(/^[A-Z][A-Z\d_]{1,127}$(?![\s\S])/u).nullable(),
  executionAuthorized: z.literal(false), persistenceVerified: z.literal(false), stackIncluded: z.literal(false),
}).refine(value => value.originalFailureObserved === (value.errorCode !== null));
export type CurrentPcbViaWriteDiagnostic = z.infer<typeof currentPcbViaWriteDiagnosticSchema>;
export function currentPcbViaWriteErrorCode(error: unknown): string { return originalNativeOrSourceErrorCode(error) ?? "ORIGINAL_ERROR_UNCLASSIFIED"; }
export function currentPcbViaWriteDiagnostic(stage: string, errorCode: string | null): CurrentPcbViaWriteDiagnostic {
  return Object.freeze(currentPcbViaWriteDiagnosticSchema.parse({ schema: "easyeda-pro-control.pcb209-via-write-diagnostic.v1", stage,
    originalFailureObserved: errorCode !== null, errorCode, executionAuthorized: false, persistenceVerified: false, stackIncluded: false }));
}
