/** New schemas only. A stage acknowledgement grants no persistence or inverse. */
import { z } from "zod";
import { CURRENT_PCB_VIA_WRITE_STAGES } from "./current-pcb-via-write-program.ts";
import { currentPcbViaWriteRequestSchema } from "./current-pcb-via-write-plan.ts";

export const CURRENT_PCB_VIA_WRITE_PURPOSE = "pcb-via-write209";
export const CURRENT_PCB_VIA_WRITE_TOOL = "easyeda_control_current_pcb_via_write";
export const CURRENT_PCB_VIA_WRITE_CLEANUP_ACTIONS = ["inspect", "abort", "observe-termination", "release", "settle-publication"] as const;
export const CURRENT_PCB_VIA_WRITE_EXECUTE_ACKNOWLEDGEMENTS = Object.freeze({ confirmDisposableViaWrite: true, confirmOneSave: true,
  confirmForwardOnly: true, confirmNormalOpenEffects: true } as const);
export const CURRENT_PCB_VIA_WRITE_ABORT_ACKNOWLEDGEMENTS = Object.freeze({ confirmOriginalJobOnly: true } as const);
export const currentPcbViaWriteActionSchema = z.discriminatedUnion("action", [
  z.strictObject({ action: z.literal("prepare"), fixtureOperationId: z.string().regex(/^[a-z\d][a-z\d-]{7,95}$/u),
    operationId: currentPcbViaWriteRequestSchema.shape.operationId, via: currentPcbViaWriteRequestSchema.shape.via }),
  z.strictObject({ action: z.literal("execute"), operationId: currentPcbViaWriteRequestSchema.shape.operationId,
    confirmDisposableViaWrite: z.literal(true), confirmOneSave: z.literal(true), confirmForwardOnly: z.literal(true), confirmNormalOpenEffects: z.literal(true) }),
  z.strictObject({ action: z.literal("abort"), operationId: currentPcbViaWriteRequestSchema.shape.operationId, confirmOriginalJobOnly: z.literal(true) }),
  z.strictObject({ action: z.enum(["inspect", "observe-termination", "release", "settle-publication"]), operationId: currentPcbViaWriteRequestSchema.shape.operationId }),
]);
export type CurrentPcbViaWriteAction = z.infer<typeof currentPcbViaWriteActionSchema>;
export const currentPcbViaWriteStageResultSchema = z.strictObject({
  schema: z.literal("easyeda-pro-control.pcb209-via-write-stage.v1"), stage: z.enum(CURRENT_PCB_VIA_WRITE_STAGES), ok: z.boolean(),
  dispatchAttempted: z.boolean(), originalPromiseAcknowledged: z.boolean(),
  primitiveId: z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u).nullable(),
  createAttempted: z.boolean(), createAcknowledged: z.boolean(), saveAttempted: z.boolean(), saveAcknowledged: z.boolean(),
  inverseAvailable: z.literal(false), persistenceVerified: z.literal(false),
}).refine(value => (!value.createAcknowledged || value.createAttempted && value.primitiveId !== null) &&
  (!value.saveAttempted || value.createAcknowledged) && (!value.saveAcknowledged || value.saveAttempted) &&
  (!value.originalPromiseAcknowledged || value.dispatchAttempted) &&
  (!value.ok || value.stage !== "create" || value.createAcknowledged && value.originalPromiseAcknowledged) &&
  (!value.ok || value.stage !== "save" || value.saveAcknowledged && value.originalPromiseAcknowledged));
export type CurrentPcbViaWriteStageResult = z.infer<typeof currentPcbViaWriteStageResultSchema>;

/** Stable public operation/cleanup envelope. A matching result is historical
 * data; only the retained original coordinator can perform its cleanup actions. */
export const currentPcbViaWriteResultSchema = z.strictObject({
  schema: z.literal("easyeda-pro-control.pcb209-via-write-operation.v1"), action: z.enum(["prepare", "execute", ...CURRENT_PCB_VIA_WRITE_CLEANUP_ACTIONS]),
  operationId: currentPcbViaWriteRequestSchema.shape.operationId,
  state: z.enum(["prepared", "running", "needs-cleanup", "verification-pending", "completed"]),
  effects: z.strictObject({ createAttempted: z.boolean(), createAcknowledged: z.boolean(), saveAttempted: z.boolean(),
    saveOutcome: z.enum(["not-attempted", "unknown", "acknowledged"]) }),
  verification: z.strictObject({ saved: z.boolean(), reopened: z.boolean(), completeSqlVerified: z.boolean(), peerRosterPreserved: z.boolean() }),
  cleanup: z.strictObject({ generation: z.enum(["none", "writer", "readback"]), allocation: z.enum(["not-entered", "no-resource", "unresolved", "retained", "released"]),
    nativeResourcesRetained: z.boolean(), abortAttempted: z.boolean(), originalTerminationVerified: z.boolean(), helperReleaseVerified: z.boolean(), publicationPending: z.boolean() }),
  forwardOnly: z.literal(true), inverseAvailable: z.literal(false),
}).refine(value => {
  const effects = value.effects, proof = value.verification, state = value.cleanup;
  return (!effects.createAcknowledged || effects.createAttempted) && (!effects.saveAttempted || effects.createAcknowledged) &&
    (effects.saveOutcome === "not-attempted") === !effects.saveAttempted &&
    (!proof.saved || effects.saveAttempted && proof.completeSqlVerified && proof.peerRosterPreserved) && (!proof.reopened || proof.saved) &&
    (!state.helperReleaseVerified || !state.nativeResourcesRetained) && (state.allocation !== "released" || state.helperReleaseVerified) &&
    (!["not-entered", "no-resource"].includes(state.allocation) || !state.nativeResourcesRetained) &&
    (state.allocation !== "unresolved" || state.nativeResourcesRetained) &&
    (value.state !== "completed" || proof.saved && proof.reopened && proof.completeSqlVerified && proof.peerRosterPreserved && state.originalTerminationVerified && state.helperReleaseVerified && !state.nativeResourcesRetained && !state.publicationPending);
});
export type CurrentPcbViaWriteResult = z.infer<typeof currentPcbViaWriteResultSchema>;
