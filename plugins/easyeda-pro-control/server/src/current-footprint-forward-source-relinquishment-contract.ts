/** One externally reviewed Source v2 history. These hashes establish no native owner. */
import { z } from "zod";
import { currentFootprintForwardExecutionOpeningIdSchema } from "./current-footprint-forward-execution-opening-contract.ts";
import { currentFootprintForwardOpeningFileProofSchema } from "./current-footprint-forward-opening-relinquishment-file-proof.ts";

export const CURRENT_FOOTPRINT_FORWARD_SOURCE_RELINQUISHMENT_DIRECTORY = "footprint-forward-source-relinquishments-v1";
export const CURRENT_FOOTPRINT_FORWARD_SOURCE_HISTORICAL_PROFILE = Object.freeze({
  schema: "private.footprint-forward-source-external-history.v1",
  manifestBytes: 27_617,
  manifestSha256: "6baf29750b2f62e44f20d1b97a8a833ff4b665571fb8c84c19269fd67528f33f",
  canonicalManifestSha256: "92b60b48d65f4bf0d4bddd8207f43a1ef488633da71a04743d181e6f8f79e5a3",
  rosterSha256: "5f8e33d87d8f3c7fb7e1b6f38f3c8d6d695e3f384390c0fbc9d1ac15bb9fd8e9",
  code: Object.freeze({
    provenance: "external-exact-payload-review" as const,
    commit: "2aa8af6069567c9855918de8bc39f92fe1b802d5",
    version: "0.3.0+codex.20261105085316",
    sourceSha256: "635d97535d49668757356bab046e007afea8b520cee8e54c056194218b7ecfa0",
    runtimeSha256: "ba33d62f8e15ea39ba97bfe561b8f8879a1b792e72c5186917fe060dc12e89b6",
    pluginTree: "2792f5312c830ae5d154b0f78ef81ab384fd43ca",
    payloadInventorySha256: "26284070e3e71de10149532a8f93c991361c18828f7b80acf9c047048d6b9d1d",
  }),
});
export const CURRENT_FOOTPRINT_FORWARD_SOURCE_HISTORICAL_KINDS = Object.freeze([
  "operation-intent", "prepare-intent", "prepare-result", "allocation-intent", "allocation-result", "launch-intent", "binding",
  "main-intent", "main-result", "browser-intent", "browser-result", "frames-intent", "frames-result", "ui-source-intent",
  "ui-source-result", "handoff-intent", "handoff-result", "failure", "close-intent", "close-result", "termination-intent",
  "termination-result", "release-intent",
] as const);
const digest = z.string().regex(/^[a-f\d]{64}$(?![\s\S])/u);
const operationId = currentFootprintForwardExecutionOpeningIdSchema;
export const currentFootprintForwardSourceRelinquishmentRequestSchema = z.object({
  action: z.enum(["relinquish-unknown-source-opening", "settle-unknown-source-opening"]), operationId,
  expectedManifestSha256: digest, expectedRosterSha256: digest, expectedIntentSha256: digest, expectedBindingSha256: digest,
  confirmRelinquishUnknownSourceOpening: z.literal(true), acceptUnknownCaptureOutcome: z.literal(true),
}).strict();
export type CurrentFootprintForwardSourceRelinquishmentRequest = z.infer<typeof currentFootprintForwardSourceRelinquishmentRequestSchema>;
const code = CURRENT_FOOTPRINT_FORWARD_SOURCE_HISTORICAL_PROFILE.code;
const original = {
  operationId, originalManifestSha256: z.literal(CURRENT_FOOTPRINT_FORWARD_SOURCE_HISTORICAL_PROFILE.manifestSha256),
  originalCanonicalManifestSha256: z.literal(CURRENT_FOOTPRINT_FORWARD_SOURCE_HISTORICAL_PROFILE.canonicalManifestSha256),
  originalRosterSha256: z.literal(CURRENT_FOOTPRINT_FORWARD_SOURCE_HISTORICAL_PROFILE.rosterSha256),
  originalStoredJournalSha256: digest, originalIntentSha256: digest, originalBindingSha256: digest, originalIdentitySha256: digest,
  externallyReviewedSourceCodeTuple: z.object({
    provenance: z.literal(code.provenance), commit: z.literal(code.commit), version: z.literal(code.version),
    sourceSha256: z.literal(code.sourceSha256), runtimeSha256: z.literal(code.runtimeSha256), pluginTree: z.literal(code.pluginTree),
    payloadInventorySha256: z.literal(code.payloadInventorySha256),
  }).strict(),
};
export const currentFootprintForwardSourceRelinquishmentIntentSchema = z.object({
  schema: z.literal("easyeda-pro-control.footprint-forward-source-relinquishment-intent.v1"), ...original,
  createdAt: z.iso.datetime(), facadeSha256: digest, installationSha256: digest,
  confirmRelinquishUnknownSourceOpening: z.literal(true), acceptUnknownCaptureOutcome: z.literal(true),
}).strict();
const absence = z.object({ schema: z.literal("easyeda-pro-control.ordinary-launch-recovery-observation.v1"), samples: z.literal(2),
  otherPowerShellPresent: z.literal(false), sameNameProcessPresent: z.literal(false),
  helperSha256: z.literal("8ffb025cdd20c1851c37d57a20816240928c7e6425b44528a623c8b8f72a37aa"),
}).strict();
export const currentFootprintForwardSourceRelinquishmentResultSchema = z.object({
  schema: z.literal("easyeda-pro-control.footprint-forward-source-relinquished.v1"), ...original,
  createdAt: z.iso.datetime(), relinquishmentIntentSha256: digest, observationNonceSha256: digest,
  observationBefore: absence, observation: absence, otherLinuxFacadePresent: z.literal(false), linuxFacadeSamples: z.literal(2),
  fileProof: currentFootprintForwardOpeningFileProofSchema,
  captureOutcome: z.literal("unknown"), terminationOutcome: z.literal("unknown"), helperReleaseOutcome: z.literal("unknown"),
  terminationProved: z.literal(false), nativeResourcesReleased: z.literal(false), helperReleaseAcknowledged: z.literal(false),
  originalLaunchIdentityVerified: z.literal(false), retainedLaunchAuthority: z.literal(false),
  originalJournalUntouched: z.literal(true), startupBlockerRelinquished: z.literal(true),
  historicalCompletionVerified: z.literal(false), authorityRestored: z.literal(false), replayAllowed: z.literal(false),
  executionReady: z.literal(false), executionAuthorized: z.literal(false), designExecutionAuthorized: z.literal(false), saveAuthorized: z.literal(false),
}).strict();
export type CurrentFootprintForwardSourceRelinquishmentIntent = z.infer<typeof currentFootprintForwardSourceRelinquishmentIntentSchema>;
export type CurrentFootprintForwardSourceRelinquishmentResult = z.infer<typeof currentFootprintForwardSourceRelinquishmentResultSchema>;

/** Describe the separate historical path without observing processes or changing history. */
export function queryCurrentFootprintForwardSourceRelinquishment(includeSchemas: boolean): Record<string, unknown> {
  return { wrapperAction: "footprint-forward-source-relinquishment", actions: ["relinquish-unknown-source-opening", "settle-unknown-source-opening"],
    validationOnly: true, executionReady: false, executionAuthorized: false, saveAuthorized: false,
    limitations: ["Only one externally reviewed exact 23-record Source v2 roster qualifies; its old journal contains no producer digest.",
      "Fresh global Linux/Windows absence and complete unchanged raw/prepared SQL/history proofs relinquish only its historical startup blocker.",
      "Settlement accepts only this coordinator's retained pending metadata or a complete matching receipt; it never recollects observations or file proofs.",
      "Original capture, termination and helper release remain unknown. No owner, replay, restoration, writer or Save authority follows."],
    ...(includeSchemas ? { inputSchema: z.toJSONSchema(currentFootprintForwardSourceRelinquishmentRequestSchema),
      resultSchema: z.toJSONSchema(currentFootprintForwardSourceRelinquishmentResultSchema) } : {}) };
}
/** Caller confirmations and expected hashes select no profile and establish no observations. */
export function validateCurrentFootprintForwardSourceRelinquishment(input: unknown): Record<string, unknown> {
  const result = currentFootprintForwardSourceRelinquishmentRequestSchema.safeParse(input);
  return result.success ? { valid: true, request: result.data, executionReady: false, executionAuthorized: false, saveAuthorized: false } :
    { valid: false, executionReady: false, executionAuthorized: false, saveAuthorized: false,
      issues: result.error.issues.slice(0, 16).map(issue => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) })) };
}
