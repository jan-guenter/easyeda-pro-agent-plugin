/** Distinct Via main observation vocabulary. Immutable request selectors are
 * reused as data; footprint owners and mutation resumes are never admitted. */
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { validateCurrentFootprintCopyMainRequestCollectCommand } from "./current-footprint-copy-main-request-protocol.ts";
import type { CurrentFootprintCopyMainRequestCollectCommand } from "./current-footprint-copy-main-request-protocol.ts";
import { currentFootprintCopyMainRequestWire } from "./current-footprint-copy-main-request-wire.ts";
import { currentFootprintCopyMainRequestNativeCases } from "./current-footprint-copy-main-request-native.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { validateCurrentFootprintCopyMainBackendCommand } from "./current-footprint-copy-main-backend-contract.ts";
import { currentFootprintCopyMainBackendWire } from "./current-footprint-copy-main-backend-wire.ts";
import { currentFootprintCopyMainBackendNativeCases } from "./current-footprint-copy-main-backend-native.ts";

export interface CurrentPcbViaMainCommand { readonly phase: `via-main-${string}`; readonly method: CurrentFootprintCopyMainRequestCollectCommand["method"]; readonly params: Readonly<Record<string, unknown>> }
const prefix = "via-main-";
export const CURRENT_PCB_VIA_MAIN_REQUESTS = Object.freeze({ requestObservation: 22, originalConstructionReproof: 1, normal: 23, ownPointRemovals: 3, groupRelease: 1, cleanup: 4, total: 27,
  nativeSqlResumeAvailable: false, saveAuthorized: false });
function original(input: unknown): CurrentFootprintCopyMainRequestCollectCommand {
  const value = captureCurrentPcbStringClockReply(input).value;
  if (value === null || typeof value !== "object" || !("phase" in value) || typeof value.phase !== "string" || !value.phase.startsWith(prefix)) { throw new Error("PCB_VIA_MAIN_PHASE"); }
  const command = validateCurrentFootprintCopyMainRequestCollectCommand({ ...value, phase: value.phase.slice(prefix.length) });
  // The global SQL-fence driver breakpoint is kept for the whole generation.
  // No second driver breakpoint or unfenced resume can be encoded here.
  if (command.phase === "request-driver-arm" || command.method === "Debugger.resume") { throw new Error("PCB_VIA_MAIN_NO_RESUME_OR_DRIVER_ARM"); }
  return command;
}
export function validateCurrentPcbViaMainCommand(input: unknown): CurrentPcbViaMainCommand {
  const value = captureCurrentPcbStringClockReply(input).value;
  if (value !== null && typeof value === "object" && "phase" in value && value.phase === "via-main-construction-require") {
    const command = validateCurrentFootprintCopyMainBackendCommand({ ...value, phase: "require" });
    if (command.phase !== "require") { throw new Error("PCB_VIA_MAIN_CONSTRUCTION_COMMAND"); } return freezeDeep({ ...command, phase: "via-main-construction-require" });
  }
  const command = original(input); return freezeDeep({ ...command, phase: `via-main-${command.phase}` });
}
export function currentPcbViaMainWire(input: unknown, id: number): Readonly<{ command: CurrentPcbViaMainCommand; request: Readonly<Record<string, string | number>> }> {
  const command = validateCurrentPcbViaMainCommand(input);
  if (command.phase === "via-main-construction-require") { const wire = currentFootprintCopyMainBackendWire({ ...command, phase: "require" }, id);
    return freezeDeep({ command, request: { ...wire.request, action: "pcb-via-main-observe", phase: "via-main-construction-require" } }); }
  const wire = currentFootprintCopyMainRequestWire(original(command), id);
  return freezeDeep({ command, request: { ...wire.request, action: "pcb-via-main-observe", phase: `via-main-${String(wire.request["phase"])}` } });
}
export function currentPcbViaMainNativeCases(): readonly CurrentPcbViaMainCommand[] {
  return freezeDeep([...currentFootprintCopyMainBackendNativeCases().filter(command => command.phase === "require").map(command => validateCurrentPcbViaMainCommand({ ...command, phase: "via-main-construction-require" })),
    ...currentFootprintCopyMainRequestNativeCases().filter(command => command.phase !== "request-driver-arm" && command.method !== "Debugger.resume")
      .map(command => validateCurrentPcbViaMainCommand({ ...command, phase: `via-main-${command.phase}` }))]);
}
