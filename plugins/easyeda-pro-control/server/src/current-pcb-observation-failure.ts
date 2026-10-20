/** Fixed diagnostic labels only. Original exceptions stay in the local cause
 * chain; no vendor message, expression, object handle or design data is copied
 * into the public message. Cleanup failure never replaces the first failure. */
export type CurrentPcbObservationPhase = "owner" | "wrapper" | "properties" | "handler" |
  "snapshot" | "pending" | "raw-strings" | "root-inventory" | "renderer-association" |
  "worker-association" | "empty-producers" | "identity" | "empty-baseline" |
  "bounds" | "sample-match" | "owner-observation" | "release";

export function currentPcbObservationFailure(family: "MODEL" | "STRING_PRECREATE", phase: CurrentPcbObservationPhase,
  failures: readonly unknown[], cleanupFailed: boolean): AggregateError {
  return new AggregateError(failures,
    `PCB_${family === "MODEL" ? "DIAGNOSTIC_MODEL" : family}_OBSERVATION_FAILED_${phase.toUpperCase().replaceAll("-", "_")}${cleanupFailed ? "_RELEASE_FAILED" : ""}`,
    { cause: failures[0] });
}
