/** Historical metadata only. Missing native Job/release proof stays missing. */
import { z } from "zod";
import { ordinaryLaunchRecoveryObservationSchema } from "./ordinary-launch-recovery.ts";

const hash = z.string().length(64).regex(/^[a-f\d]{64}$/u);
const operationId = z.string().max(96).regex(/^pcb209-via-write-[a-z\d][a-z\d-]*$(?![\s\S])/u);
export const currentPcbViaPreopeningRelinquishmentRequestSchema = z.strictObject({
  action: z.literal("relinquish-failed-via-before-opening"), operationId,
  expectedEntireJournalSha256: hash,
  confirmHistoricalRelinquishment: z.literal(true),
  acceptMissingOriginalJobAndReleaseProof: z.literal(true),
  acceptUnknownProfileEffects: z.literal(true),
});
const original = { operationId, originalEntireJournalSha256: hash, originalStoredJournalSha256: hash, originalPlanSha256: hash };
export const currentPcbViaPreopeningRelinquishmentIntentSchema = z.strictObject({
  schema: z.literal("easyeda-pro-control.pcb-via-preopening-relinquishment-intent.v1"), ...original,
  createdAt: z.iso.datetime(), facadeSha256: hash, installationSha256: hash,
  confirmHistoricalRelinquishment: z.literal(true),
  acceptMissingOriginalJobAndReleaseProof: z.literal(true), acceptUnknownProfileEffects: z.literal(true),
});
export const currentPcbViaPreopeningRelinquishmentResultSchema = z.strictObject({
  schema: z.literal("easyeda-pro-control.pcb-via-preopening-relinquished.v1"), ...original,
  createdAt: z.iso.datetime(), relinquishmentIntentSha256: hash, observationNonceSha256: hash,
  observation: ordinaryLaunchRecoveryObservationSchema.extend({ otherPowerShellPresent: z.literal(false), sameNameProcessPresent: z.literal(false) }),
  otherLinuxFacadePresent: z.literal(false), linuxFacadeSamples: z.literal(2),
  originalJournalModified: z.literal(false), originalJobEmptyProved: z.literal(false),
  originalHelperReleaseAcknowledged: z.literal(false), originalNativeHandlesAdopted: z.literal(false),
  terminationProved: z.literal(false), nativeResourcesReleased: z.literal(false),
  projectOpeningRecorded: z.literal(false), createRecorded: z.literal(false), saveRecorded: z.literal(false),
  completionClaimed: z.literal(false), persistenceVerified: z.literal(false),
  retainedLaunchAuthority: z.literal(false), designExecutionAuthorized: z.literal(false), saveAuthorized: z.literal(false),
});
export type CurrentPcbViaPreopeningRelinquishmentRequest = z.infer<typeof currentPcbViaPreopeningRelinquishmentRequestSchema>;
export type CurrentPcbViaPreopeningRelinquishmentIntent = z.infer<typeof currentPcbViaPreopeningRelinquishmentIntentSchema>;
export type CurrentPcbViaPreopeningRelinquishmentResult = z.infer<typeof currentPcbViaPreopeningRelinquishmentResultSchema>;

export function queryCurrentPcbViaPreopeningRelinquishment(includeSchemas = false): Record<string, unknown> {
  return { tool: "easyeda_control_pcb209_opening", action: "relinquish-failed-via-before-opening", historicalMetadataOnly: true,
    scope: "complete-failed-main-prefix-before-any-project-opening-intent", originalJournalReadOnly: true,
    freshNoAllocationFacadeRequired: true, freshWindowsAndLinuxAbsenceRequired: true,
    originalJobEmptyProved: false, originalHelperReleaseAcknowledged: false, nativeOwnerAdoption: false,
    processSignalOffered: false, replayAllowed: false, executionAuthorized: false,
    ...(includeSchemas ? { requestSchema: z.toJSONSchema(currentPcbViaPreopeningRelinquishmentRequestSchema), resultSchema: z.toJSONSchema(currentPcbViaPreopeningRelinquishmentResultSchema) } : {}) };
}
export function validateCurrentPcbViaPreopeningRelinquishment(input: unknown): Record<string, unknown> {
  const parsed = currentPcbViaPreopeningRelinquishmentRequestSchema.safeParse(input);
  return parsed.success ? { valid: true, request: parsed.data, executionAuthorized: false } : { valid: false, executionAuthorized: false,
    issues: parsed.error.issues.slice(0, 16).map(issue => ({ path: issue.path.join("."), message: issue.message.slice(0, 512) })) };
}
