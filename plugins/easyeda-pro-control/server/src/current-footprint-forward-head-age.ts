/** Original forward Main head-age vocabulary. The separate 23-request lane
 * shares construction and final release, preserving the old 45-request codec
 * and the head-only v2 ceiling. Command data supplies no native owner. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { validateCurrentFootprintCopyMainBackendCommand } from "./current-footprint-copy-main-backend-contract.ts";
import type { CurrentFootprintCopyMainBackendCommand } from "./current-footprint-copy-main-backend-contract.ts";
import type { CurrentFootprintHeadAgeObservation } from "./current-footprint-head-age-observation.ts";

export const CURRENT_FOOTPRINT_FORWARD_HEAD_AGE_REQUESTS = Object.freeze({ preparation: 21, observation: 2, normal: 23, cleanup: 0, total: 23, wholeWriterReserved: false });
export interface CurrentFootprintForwardHeadAgeCommand {
  readonly phase: "forward-head-age";
  readonly command: CurrentFootprintCopyMainBackendCommand;
}
const wrapper = z.strictObject({ phase: z.literal("forward-head-age"), command: z.unknown() });
const phases = new Set(["require", "properties", "head-age-context-capture", "head-age-context-source", "head-age-context-bind", "head-age-capture", "head-age-observe"]);
export function validateCurrentFootprintForwardHeadAgeCommand(input: unknown): CurrentFootprintForwardHeadAgeCommand {
  const value = wrapper.parse(captureCurrentPcbStringClockReply(input).value);
  const command = validateCurrentFootprintCopyMainBackendCommand(value.command);
  if (!phases.has(command.phase)) { throw new Error("FORWARD_HEAD_AGE_PHASE"); }
  return Object.freeze({ phase: value.phase, command });
}
export const CURRENT_FOOTPRINT_FORWARD_HEAD_AGE_PHASES = Object.freeze([
  "require", "head-age-context-capture", "properties", "properties", "properties", "head-age-context-source",
  "properties", "properties", "head-age-context-bind", "head-age-capture", "properties",
  ...Array.from({ length: 10 }, () => "properties"), "head-age-observe", "require",
]);
/** The original cursor consumes this exact finite schedule immediately before
 * native writes; its surrounding original bootstrap supplies authority. */
export class CurrentFootprintForwardHeadAgeSchedule {
  #ordinal = 0;
  #previousId: number | null = null;
  #failed = false;
  public consume(command: CurrentFootprintForwardHeadAgeCommand, requestId: number): void {
    try {
      const selected = validateCurrentFootprintForwardHeadAgeCommand(command);
      if (this.#failed || this.#ordinal >= CURRENT_FOOTPRINT_FORWARD_HEAD_AGE_PHASES.length ||
          selected.command.phase !== CURRENT_FOOTPRINT_FORWARD_HEAD_AGE_PHASES[this.#ordinal] ||
          !Number.isSafeInteger(requestId) || requestId < 1 || Object.is(requestId, -0) ||
          this.#previousId !== null && requestId !== this.#previousId + 1) { throw new Error("FORWARD_HEAD_AGE_SCHEDULE"); }
      this.#ordinal += 1; this.#previousId = requestId;
    } catch (error) { this.#failed = true; throw error; }
  }
  public requireComplete(): void {
    if (this.#failed || this.#ordinal !== CURRENT_FOOTPRINT_FORWARD_HEAD_AGE_REQUESTS.total) { throw new Error("FORWARD_HEAD_AGE_INCOMPLETE"); }
  }
}
export interface CurrentFootprintForwardHeadAgeObservation {
  readonly profile: "private.current-footprint-forward-head-age-observation.v1";
  readonly observation: CurrentFootprintHeadAgeObservation;
  readonly originalHeadReaderAndMainRetained: true;
  readonly executionAuthorized: false;
  readonly saveAuthorized: false;
}
