/** Historical relinquishment only. These records cannot recreate a native owner. */
import { z } from "zod";

export const CURRENT_FOOTPRINT_COMBINED_HISTORICAL_PRODUCER = "9f9595cef23ca61fbaac10e0b044b1f5e161e2a45636f2d822e15481dd63a335";
export const CURRENT_FOOTPRINT_COMBINED_ABANDONMENT_DIRECTORY = "pcb-diagnostic-unknown-abandonments-v1";
const digest = z.string().regex(/^[a-f0-9]{64}$/u);
const operationId = z.string().max(80).regex(/^footprint-combined-[a-z0-9][a-z0-9_-]*(?![\s\S])/u);
export const currentFootprintCombinedHistoricalIntentSchema = z.object({
  schema: z.literal("easyeda-pro-control.footprint-combined-launch-intent.v1"), operationId, createdAt: z.iso.datetime(),
  purpose: z.literal("worker-startup"), facadeSha256: z.literal(CURRENT_FOOTPRINT_COMBINED_HISTORICAL_PRODUCER),
  installationSha256: digest, confirmValidationOnly: z.literal(true), confirmDiagnosticLaunch: z.literal(true),
  acceptExistingProfileEffects: z.literal(true), acceptDebuggerPauseEffects: z.literal(true),
}).strict();
const original = {
  operationId, originalIntentSha256: digest, originalRosterSha256: digest, originalIdentitySha256: digest,
  originalProducerFacadeSha256: z.literal(CURRENT_FOOTPRINT_COMBINED_HISTORICAL_PRODUCER), originalInstallationSha256: digest,
};
export const currentFootprintCombinedAbandonmentIntentSchema = z.object({
  schema: z.literal("easyeda-pro-control.footprint-combined-unknown-abandonment-intent.v1"), ...original,
  createdAt: z.iso.datetime(), facadeSha256: digest, installationSha256: digest,
  confirmAbandonUnknownLaunch: z.literal(true), acceptUnobservedDescendants: z.literal(true), acceptUnknownProfileEffects: z.literal(true),
}).strict();
export const currentFootprintCombinedAbandonmentResultSchema = z.object({
  schema: z.literal("easyeda-pro-control.footprint-combined-unknown-abandoned.v1"), ...original,
  createdAt: z.iso.datetime(), abandonmentIntentSha256: digest, observationNonceSha256: digest,
  observation: z.object({ schema: z.literal("easyeda-pro-control.ordinary-launch-recovery-observation.v1"), samples: z.literal(2),
    otherPowerShellPresent: z.literal(false), sameNameProcessPresent: z.literal(false),
    helperSha256: z.literal("8ffb025cdd20c1851c37d57a20816240928c7e6425b44528a623c8b8f72a37aa"),
  }).strict(), otherLinuxFacadePresent: z.literal(false), linuxFacadeSamples: z.literal(2),
  launchOutcome: z.literal("unknown"), nonDispatchProved: z.literal(false), terminationProved: z.literal(false),
  nativeResourcesReleased: z.literal(false), originalLaunchIdentityVerified: z.literal(false), retainedLaunchAuthority: z.literal(false),
  designExecutionAuthorized: z.literal(false), saveAuthorized: z.literal(false), persistenceVerified: z.literal(false),
}).strict();
export type CurrentFootprintCombinedAbandonmentIntent = z.infer<typeof currentFootprintCombinedAbandonmentIntentSchema>;
export type CurrentFootprintCombinedAbandonmentResult = z.infer<typeof currentFootprintCombinedAbandonmentResultSchema>;
