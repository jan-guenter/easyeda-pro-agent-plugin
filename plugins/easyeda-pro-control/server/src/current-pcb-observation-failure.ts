/** Fixed diagnostic labels only. Original exceptions stay in the local cause
 * chain; no vendor message, expression, object handle or design data is copied
 * into the public message. Cleanup failure never replaces the first failure. */
import { z } from "zod";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const currentPcbPendingFailureStageSchema = z.enum(["callback", "scope", "environment", "copper-uploads", "plane-uploads",
  "board-upload", "commands", "active-stack", "teardrops", "dynamic-copper", "worker-registry", "worker-association", "reproof", "serialize", "decode"]);
export const currentPcbPendingFailureReasonSchema = z.enum(["guard", "object", "own", "instance", "count", "flag", "id",
  "collection", "unexpected", "reply"]);
export const currentPcbPendingFailureSchema = z.object({ schema: z.literal("easyeda-pro-control.pcb-diagnostic-pending-failure.v1"),
  stage: currentPcbPendingFailureStageSchema, reason: currentPcbPendingFailureReasonSchema }).strict();
const phaseSchema = z.enum(["owner", "owner-final", "wrapper", "properties", "handler", "constructors-diagnostic", "constructors-precreate", "snapshot", "pending", "raw-strings", "root-inventory",
  "renderer-association", "worker-association", "empty-producers", "identity", "empty-baseline", "bounds", "sample-match", "owner-observation", "release"]);
export type CurrentPcbObservationPhase = z.infer<typeof phaseSchema>;
export const currentPcbObservationFailureSchema = z.object({ schema: z.literal("easyeda-pro-control.pcb-observation-failure.v1"),
  family: z.enum(["MODEL", "STRING_PRECREATE"]), phase: phaseSchema, leaf: currentPcbPendingFailureSchema.nullable(),
  cleanupFailed: z.boolean(), failureCount: z.number().int().min(1).max(8), executionAuthorized: z.literal(false),
  dispatchAbsenceVerified: z.literal(false) }).strict();
export type CurrentPcbObservationFailure = Readonly<z.infer<typeof currentPcbObservationFailureSchema>>;
const leaves = new WeakMap<object, Readonly<z.infer<typeof currentPcbPendingFailureSchema>>>();
const observations = new WeakMap<object, CurrentPcbObservationFailure>();

/** Diagnostic provenance only, never authorization. Arbitrary Error messages,
 * getters and copied report objects are not interpreted as local failures. */
export function currentPcbPendingFailure(stage: z.infer<typeof currentPcbPendingFailureStageSchema>,
  reason: z.infer<typeof currentPcbPendingFailureReasonSchema>): Error {
  const leaf = freezeDeep(currentPcbPendingFailureSchema.parse({ schema: "easyeda-pro-control.pcb-diagnostic-pending-failure.v1", stage, reason }));
  const error = new Error(`PCB_DIAGNOSTIC_PENDING_REPLY_${stage.toUpperCase().replaceAll("-", "_")}_${reason.toUpperCase()}`);
  leaves.set(error, leaf); return error;
}
export function currentPcbPendingFailureDetail(error: unknown): Readonly<z.infer<typeof currentPcbPendingFailureSchema>> | null {
  return error !== null && typeof error === "object" ? leaves.get(error) ?? null : null;
}
export function currentPcbObservationFailureDetail(error: unknown): CurrentPcbObservationFailure | null {
  return error !== null && typeof error === "object" ? observations.get(error) ?? null : null;
}

export function currentPcbObservationFailure(family: "MODEL" | "STRING_PRECREATE", phase: CurrentPcbObservationPhase,
  failures: readonly unknown[], cleanupFailed: boolean): AggregateError {
  const leaf = currentPcbPendingFailureDetail(failures[0]);
  const suffix = leaf === null ? "" : `_LEAF_${leaf.stage.toUpperCase().replaceAll("-", "_")}_${leaf.reason.toUpperCase()}`;
  const error = new AggregateError(failures,
    `PCB_${family === "MODEL" ? "DIAGNOSTIC_MODEL" : family}_OBSERVATION_FAILED_${phase.toUpperCase().replaceAll("-", "_")}${suffix}${cleanupFailed ? "_RELEASE_FAILED" : ""}`,
    { cause: failures[0] });
  observations.set(error, freezeDeep(currentPcbObservationFailureSchema.parse({
    schema: "easyeda-pro-control.pcb-observation-failure.v1", family, phase, leaf, cleanupFailed,
    failureCount: failures.length, executionAuthorized: false, dispatchAbsenceVerified: false,
  })));
  return error;
}
