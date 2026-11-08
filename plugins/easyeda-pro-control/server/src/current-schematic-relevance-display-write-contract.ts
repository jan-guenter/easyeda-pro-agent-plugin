/** Distinct public data grammar. Parsed JSON never supplies an original plan,
 * owner, completion, journal or persistence receipt. */
import { z } from "zod";
import { generatedSchematicDisplayPatchSchema } from "./generated-schematic-display.ts";
import { generatedSchematicRelevanceDisplayOperationIdSchema } from "./generated-schematic-relevance-display-source.ts";

const operationId = generatedSchematicRelevanceDisplayOperationIdSchema.refine(value => !/\s/u.test(value));
export const CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_WRITE_TOOL = "easyeda_control_current_schematic_relevance_display_write";
export const CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_WRITE_EXECUTE_ACKNOWLEDGEMENTS = Object.freeze({
  confirmDisposableDisplayTransaction: true, confirmOneSave: true, confirmForwardOnly: true, acceptNormalOpenEffects: true,
} as const);
export const currentSchematicRelevanceDisplayWriteRequestSchema = z.strictObject({
  schema: z.literal("easyeda-pro-control.schematic209-relevance-display-write-request.v1"), operationId, patch: generatedSchematicDisplayPatchSchema,
});
export const CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_WRITE_CLEANUP_ACTIONS = ["inspect", "abort", "observe-termination", "release", "settle-publication"] as const;
export const currentSchematicRelevanceDisplayWriteActionSchema = z.discriminatedUnion("action", [
  z.strictObject({ action: z.literal("prepare"), fixtureOperationId: z.string().regex(/^[a-z\d][a-z\d-]{7,95}$/u), operationId, patch: generatedSchematicDisplayPatchSchema }),
  z.strictObject({ action: z.literal("execute"), operationId, confirmDisposableDisplayTransaction: z.literal(true), confirmOneSave: z.literal(true),
    confirmForwardOnly: z.literal(true), acceptNormalOpenEffects: z.literal(true) }),
  z.strictObject({ action: z.literal("abort"), operationId, confirmOriginalJobOnly: z.literal(true) }),
  z.strictObject({ action: z.enum(["inspect", "observe-termination", "release", "settle-publication"]), operationId }),
]);
export type CurrentSchematicRelevanceDisplayWriteAction = z.infer<typeof currentSchematicRelevanceDisplayWriteActionSchema>;
export const currentSchematicRelevanceDisplayWriteResultSchema = z.strictObject({
  schema: z.literal("easyeda-pro-control.schematic209-relevance-display-write-operation.v1"),
  action: z.enum(["prepare", "execute", ...CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_WRITE_CLEANUP_ACTIONS]), operationId,
  state: z.enum(["prepared", "running", "needs-cleanup", "verification-pending", "completed"]),
  effects: z.strictObject({ modifyAttempted: z.boolean(), modifyAcknowledged: z.boolean(), saveAttempted: z.boolean(), saveOutcome: z.enum(["not-attempted", "unknown", "acknowledged"]) }),
  verification: z.strictObject({ saved: z.boolean(), reopened: z.boolean(), completeSqlVerified: z.boolean(), peerRosterPreserved: z.boolean() }),
  cleanup: z.strictObject({ generation: z.enum(["none", "writer", "readback"]), allocation: z.enum(["not-entered", "no-resource", "unresolved", "retained", "released"]),
    nativeResourcesRetained: z.boolean(), abortAttempted: z.boolean(), originalTerminationVerified: z.boolean(), helperReleaseVerified: z.boolean(), publicationPending: z.boolean() }),
  forwardOnly: z.literal(true), inverseAvailable: z.literal(false),
}).refine(value => {
  const effects = value.effects, proof = value.verification, state = value.cleanup;
  return (!effects.modifyAcknowledged || effects.modifyAttempted) && (!effects.saveAttempted || effects.modifyAcknowledged) &&
    (effects.saveOutcome === "not-attempted") === !effects.saveAttempted &&
    (!proof.saved || effects.modifyAcknowledged && effects.saveOutcome === "acknowledged" && proof.completeSqlVerified && proof.peerRosterPreserved) && (!proof.reopened || proof.saved) &&
    (!state.helperReleaseVerified || !state.nativeResourcesRetained) && (state.allocation !== "released" || state.helperReleaseVerified) &&
    (!["not-entered", "no-resource"].includes(state.allocation) || !state.nativeResourcesRetained) && (state.allocation !== "unresolved" || state.nativeResourcesRetained) &&
    (value.state !== "completed" || proof.saved && proof.reopened && proof.completeSqlVerified && proof.peerRosterPreserved && state.originalTerminationVerified && state.helperReleaseVerified && !state.nativeResourcesRetained && !state.publicationPending);
});
export type CurrentSchematicRelevanceDisplayWriteResult = z.infer<typeof currentSchematicRelevanceDisplayWriteResultSchema>;
