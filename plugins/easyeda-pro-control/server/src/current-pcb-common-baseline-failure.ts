/** Original runner failures expose fixed labels only, never arbitrary native
 * exception text, remote handles, renderer properties or nested causes. */
import { z } from "zod";
import { currentPcbConstructorFailureDetail, currentPcbConstructorFailureSchema } from "./current-pcb-constructor-failure.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const currentPcbCommonRunnerFailureSchema = z.object({
  schema: z.literal("easyeda-pro-control.pcb-common-runner-failure.v1"),
  phase: z.enum(["presentation", "rules", "preference", "assets", "metadata", "owner", "owner-final", "wrapper", "properties", "handler", "constructors", "bounds", "release"]),
  cleanup: z.enum(["not-started", "released", "failed"]),
  constructor: currentPcbConstructorFailureSchema.nullable(), executionAuthorized: z.literal(false),
}).strict().refine(value => value.constructor === null || value.constructor.bundle === "common");
export type CurrentPcbCommonRunnerFailure = Readonly<z.infer<typeof currentPcbCommonRunnerFailureSchema>>;
const failures = new WeakMap<object, CurrentPcbCommonRunnerFailure>();

export function currentPcbCommonRunnerFailure(phase: CurrentPcbCommonRunnerFailure["phase"],
  cleanup: CurrentPcbCommonRunnerFailure["cleanup"], errors: readonly unknown[]): AggregateError {
  const detail = freezeDeep(currentPcbCommonRunnerFailureSchema.parse({ schema: "easyeda-pro-control.pcb-common-runner-failure.v1",
    phase, cleanup, constructor: currentPcbConstructorFailureDetail(errors[0]), executionAuthorized: false }));
  const error = new AggregateError(errors, `PCB_COMMON_BASELINE_OBSERVATION_FAILED_${phase.toUpperCase()}${cleanup === "failed" ? "_RELEASE_FAILED" : ""}`,
    { cause: errors[0] });
  failures.set(error, detail); return error;
}
export function currentPcbCommonRunnerFailureDetail(error: unknown): CurrentPcbCommonRunnerFailure | null {
  return error !== null && typeof error === "object" ? failures.get(error) ?? null : null;
}
