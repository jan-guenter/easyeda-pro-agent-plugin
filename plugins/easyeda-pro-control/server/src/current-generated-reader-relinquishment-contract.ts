/** One reviewed historical Pad report-chain failure. No original owner is recreated. */
import { z } from "zod";

export const GENERATED_READER_RELINQUISHMENT_DIRECTORY = "generated-reader-closed-relinquishments-v1";
export const GENERATED_READER_KNOWN_ROSTER_SHA256 = "5ce881255eb71f217d75df7b6d79e5dfce9a081064585dd0bea83b2954c6e91b";
export const GENERATED_READER_KNOWN_FACADE_SHA256 = "953724c092cfa616d445977e83da937f8c254a6a75362416bd12a5063decbbb7";
const digest = z.string().regex(/^[a-f0-9]{64}$/u);
const operationId = z.string().max(96).regex(/^pcb209-spatial-pads-[a-z0-9][a-z0-9-]*(?![\s\S])/u);
export const currentGeneratedReaderRelinquishmentRequestSchema = z.strictObject({
  action: z.literal("relinquish-closed-reader"), operationId,
  expectedOriginalRosterSha256: z.literal(GENERATED_READER_KNOWN_ROSTER_SHA256),
  confirmRelinquishClosedReader: z.literal(true), acceptMissingHelperReleaseAcknowledgment: z.literal(true),
});
const original = { operationId, originalRosterSha256: z.literal(GENERATED_READER_KNOWN_ROSTER_SHA256),
  originalIdentitySha256: digest, originalIntentSha256: digest, originalCaptureSha256: digest,
  originalProducerFacadeSha256: z.literal(GENERATED_READER_KNOWN_FACADE_SHA256) };
export const currentGeneratedReaderRelinquishmentIntentSchema = z.strictObject({
  schema: z.literal("easyeda-pro-control.generated-reader-closed-relinquishment-intent.v1"), ...original,
  createdAt: z.iso.datetime(), facadeSha256: digest, installationSha256: digest,
  confirmRelinquishClosedReader: z.literal(true), acceptMissingHelperReleaseAcknowledgment: z.literal(true),
});
export const currentGeneratedReaderRelinquishmentResultSchema = z.strictObject({
  schema: z.literal("easyeda-pro-control.generated-reader-closed-relinquished.v1"), ...original,
  createdAt: z.iso.datetime(), relinquishmentIntentSha256: digest, observationNonceSha256: digest,
  observation: z.strictObject({ schema: z.literal("easyeda-pro-control.ordinary-launch-recovery-observation.v1"), samples: z.literal(2),
    otherPowerShellPresent: z.literal(false), sameNameProcessPresent: z.literal(false),
    helperSha256: z.literal("8ffb025cdd20c1851c37d57a20816240928c7e6425b44528a623c8b8f72a37aa") }),
  otherLinuxFacadePresent: z.literal(false), linuxFacadeSamples: z.literal(2),
  originalTerminationRecordRetained: z.literal(true), originalClosedDataArtifactsVerified: z.literal(true),
  originalHelperReleaseAcknowledged: z.literal(false), originalNativeHandlesAdopted: z.literal(false),
  nativeResourcesReleased: z.literal(false), originalJournalModified: z.literal(false),
  retainedLaunchAuthority: z.literal(false), designExecutionAuthorized: z.literal(false), saveAuthorized: z.literal(false), persistenceVerified: z.literal(false),
});
export type GeneratedReaderRelinquishmentIntent = z.infer<typeof currentGeneratedReaderRelinquishmentIntentSchema>;
export type GeneratedReaderRelinquishmentResult = z.infer<typeof currentGeneratedReaderRelinquishmentResultSchema>;

export function queryCurrentGeneratedReaderRelinquishment(includeSchemas = false): Record<string, unknown> {
  return { tool: "easyeda_control_pcb209_opening", action: "relinquish-closed-reader", historicalMetadataOnly: true,
    scope: "one-reviewed-frozen4500-terminated-pad-reader-report-chain-failure", originalJournalReadOnly: true,
    exactCompleteOriginalRosterRequired: true, freshWindowsAndLinuxAbsenceRequired: true,
    originalHelperReleaseAcknowledged: false, nativeOwnerAdoption: false, processSignalOffered: false, executionAuthorized: false,
    ...(includeSchemas ? { requestSchema: z.toJSONSchema(currentGeneratedReaderRelinquishmentRequestSchema),
      resultSchema: z.toJSONSchema(currentGeneratedReaderRelinquishmentResultSchema) } : {}) };
}
export function validateCurrentGeneratedReaderRelinquishment(input: unknown): Record<string, unknown> {
  const parsed = currentGeneratedReaderRelinquishmentRequestSchema.safeParse(input);
  return parsed.success ? { valid: true, request: parsed.data, executionAuthorized: false } : {
    valid: false, executionAuthorized: false,
    issues: parsed.error.issues.slice(0, 16).map(issue => ({ path: issue.path.join("."), message: issue.message.slice(0, 512) })),
  };
}
