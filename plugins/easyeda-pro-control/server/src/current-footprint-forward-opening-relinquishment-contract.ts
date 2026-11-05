/** Explicit relinquishment of one reviewed read-only opening history. No owner is reconstructed. */
import { z } from "zod";
import { currentFootprintForwardPrewriteIdSchema } from "./current-footprint-forward-prewrite-validation.ts";
import { currentFootprintForwardOpeningFileProofSchema } from "./current-footprint-forward-opening-relinquishment-file-proof.ts";

export const CURRENT_FOOTPRINT_FORWARD_OPENING_PRODUCER = "c4da74d20c67fdbba80919e4ad1ff3aed13004aeeb8d4db3f2f21eefdc9cb6cd";
export const CURRENT_FOOTPRINT_FORWARD_OPENING_INSTALLATION = "d5c5727996398d24f60e48439484a88ca1dacacddc6660a7e0723dadd622ea89";
export const CURRENT_FOOTPRINT_FORWARD_OPENING_RELINQUISHMENT_DIRECTORY = "pcb-diagnostic-forward-opening-relinquishments-v1";
const digest = z.string().regex(/^[a-f0-9]{64}$/u);
const operationId = currentFootprintForwardPrewriteIdSchema;
export const currentFootprintForwardOpeningRelinquishmentRequestSchema = z.object({
  action: z.literal("relinquish-unknown-opening"), operationId, expectedIntentSha256: digest,
  expectedBindingSha256: digest, expectedOpeningIntentSha256: digest,
  confirmRelinquishUnknownOpening: z.literal(true), acceptUnknownCaptureOutcome: z.literal(true),
}).strict();
export type CurrentFootprintForwardOpeningRelinquishmentRequest = z.infer<typeof currentFootprintForwardOpeningRelinquishmentRequestSchema>;
export const currentFootprintForwardOpeningHistoricalIntentSchema = z.object({
  schema: z.literal("easyeda-pro-control.footprint-forward-prewrite-launch-intent.v1"), operationId, createdAt: z.iso.datetime(),
  purpose: z.literal("worker-startup"), facadeSha256: z.literal(CURRENT_FOOTPRINT_FORWARD_OPENING_PRODUCER),
  installationSha256: z.literal(CURRENT_FOOTPRINT_FORWARD_OPENING_INSTALLATION), confirmValidationOnly: z.literal(true),
  confirmDiagnosticLaunch: z.literal(true), acceptExistingProfileEffects: z.literal(true), acceptDebuggerPauseEffects: z.literal(true),
  dispatchProtocol: z.literal("challenge-ready-before-launch.v1"),
}).strict();
const original = {
  operationId, originalIntentSha256: digest, originalBindingSha256: digest, originalOpeningIntentSha256: digest,
  originalRosterSha256: digest, originalIdentitySha256: digest,
  originalProducerFacadeSha256: z.literal(CURRENT_FOOTPRINT_FORWARD_OPENING_PRODUCER),
  originalInstallationSha256: z.literal(CURRENT_FOOTPRINT_FORWARD_OPENING_INSTALLATION),
};
export const currentFootprintForwardOpeningRelinquishmentIntentSchema = z.object({
  schema: z.literal("easyeda-pro-control.footprint-forward-opening-relinquishment-intent.v1"), ...original,
  createdAt: z.iso.datetime(), facadeSha256: digest, installationSha256: digest,
  confirmRelinquishUnknownOpening: z.literal(true), acceptUnknownCaptureOutcome: z.literal(true),
}).strict();
const processAbsenceSchema = z.object({ schema: z.literal("easyeda-pro-control.ordinary-launch-recovery-observation.v1"), samples: z.literal(2),
  otherPowerShellPresent: z.literal(false), sameNameProcessPresent: z.literal(false),
  helperSha256: z.literal("8ffb025cdd20c1851c37d57a20816240928c7e6425b44528a623c8b8f72a37aa"),
}).strict();
export const currentFootprintForwardOpeningRelinquishmentResultSchema = z.object({
  schema: z.literal("easyeda-pro-control.footprint-forward-opening-relinquished.v1"), ...original,
  createdAt: z.iso.datetime(), relinquishmentIntentSha256: digest, observationNonceSha256: digest,
  observationBefore: processAbsenceSchema, observation: processAbsenceSchema,
  otherLinuxFacadePresent: z.literal(false), linuxFacadeSamples: z.literal(2),
  fileProof: currentFootprintForwardOpeningFileProofSchema,
  captureOutcome: z.literal("unknown"), terminationOutcome: z.literal("unknown"), helperReleaseOutcome: z.literal("unknown"), terminationProved: z.literal(false), nativeResourcesReleased: z.literal(false),
  helperReleaseAcknowledged: z.literal(false), originalLaunchIdentityVerified: z.literal(false),
  retainedLaunchAuthority: z.literal(false), executionReady: z.literal(false), executionAuthorized: z.literal(false),
  designExecutionAuthorized: z.literal(false), saveAuthorized: z.literal(false),
}).strict();
export type CurrentFootprintForwardOpeningRelinquishmentIntent = z.infer<typeof currentFootprintForwardOpeningRelinquishmentIntentSchema>;
export type CurrentFootprintForwardOpeningRelinquishmentResult = z.infer<typeof currentFootprintForwardOpeningRelinquishmentResultSchema>;

// The released v1 profile above remains unchanged.
// This second reviewed producer emitted the same thirteen-record opening prefix.
// No source or seal stage belongs to either admitted roster.
export const CURRENT_FOOTPRINT_FORWARD_OPENING_190023_PRODUCER = "bf9650e7c9b85c698e23fcbf08833dff71aef42f39f1da599e36d1ec5198f1a5";
export const CURRENT_FOOTPRINT_FORWARD_OPENING_190023_INSTALLATION = "4c593053fa7991e49ec0fc7af317a769ee9aa6454d48ea01c31219464eb907d4";
export const currentFootprintForwardOpening190023HistoricalIntentSchema = currentFootprintForwardOpeningHistoricalIntentSchema.extend({
  facadeSha256: z.literal(CURRENT_FOOTPRINT_FORWARD_OPENING_190023_PRODUCER),
  installationSha256: z.literal(CURRENT_FOOTPRINT_FORWARD_OPENING_190023_INSTALLATION),
});
const original190023 = {
  originalProducerFacadeSha256: z.literal(CURRENT_FOOTPRINT_FORWARD_OPENING_190023_PRODUCER),
  originalInstallationSha256: z.literal(CURRENT_FOOTPRINT_FORWARD_OPENING_190023_INSTALLATION),
};
export const currentFootprintForwardOpening190023RelinquishmentIntentSchema = currentFootprintForwardOpeningRelinquishmentIntentSchema.extend({
  schema: z.literal("easyeda-pro-control.footprint-forward-opening-relinquishment-intent.v2"), ...original190023,
});
export const currentFootprintForwardOpening190023RelinquishmentResultSchema = currentFootprintForwardOpeningRelinquishmentResultSchema.extend({
  schema: z.literal("easyeda-pro-control.footprint-forward-opening-relinquished.v2"), ...original190023,
});
// Whole-object alternatives preserve the exact producer/installation pairs.
// Independent digest enums would also admit unreviewed mixed tuples.
export const currentFootprintForwardOpeningKnownHistoricalIntentSchema = z.union([
  currentFootprintForwardOpeningHistoricalIntentSchema, currentFootprintForwardOpening190023HistoricalIntentSchema,
]);
export const currentFootprintForwardOpeningKnownRelinquishmentIntentSchema = z.discriminatedUnion("schema", [
  currentFootprintForwardOpeningRelinquishmentIntentSchema, currentFootprintForwardOpening190023RelinquishmentIntentSchema,
]);
export const currentFootprintForwardOpeningKnownRelinquishmentResultSchema = z.discriminatedUnion("schema", [
  currentFootprintForwardOpeningRelinquishmentResultSchema, currentFootprintForwardOpening190023RelinquishmentResultSchema,
]);
export type CurrentFootprintForwardOpeningKnownRelinquishmentIntent = z.infer<typeof currentFootprintForwardOpeningKnownRelinquishmentIntentSchema>;
export type CurrentFootprintForwardOpeningKnownRelinquishmentResult = z.infer<typeof currentFootprintForwardOpeningKnownRelinquishmentResultSchema>;

/** Discover the separate historical path without collecting observations or granting launch authority. */
export function queryCurrentFootprintForwardOpeningRelinquishment(includeSchemas: boolean): Record<string, unknown> {
  return { wrapperAction: "footprint-forward-opening-relinquishment", actions: ["relinquish-unknown-opening"],
    validationOnly: true, executionReady: false, executionAuthorized: false, saveAuthorized: false,
    limitations: ["Only the exact reviewed forward opening-intent roster and producer/installation pins qualify.",
      "Fresh global Linux facade exclusion, Windows process absence and complete unchanged raw/prepared SQL/history proofs relinquish only the historical startup blocker.",
      "Capture, original Job termination and helper release remain unknown. No owner adoption, replay, writer or Save authority follows."],
    ...(includeSchemas ? { inputSchema: z.toJSONSchema(currentFootprintForwardOpeningRelinquishmentRequestSchema),
      resultSchema: z.toJSONSchema(currentFootprintForwardOpeningKnownRelinquishmentResultSchema) } : {}) };
}
/** Validate caller confirmations and digest expectations; supplied data cannot establish history or observations. */
export function validateCurrentFootprintForwardOpeningRelinquishment(input: unknown): Record<string, unknown> {
  const result = currentFootprintForwardOpeningRelinquishmentRequestSchema.safeParse(input);
  return result.success ? { valid: true, request: result.data, executionReady: false, executionAuthorized: false } :
    { valid: false, executionReady: false, executionAuthorized: false,
      issues: result.error.issues.slice(0, 16).map(issue => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) })) };
}

