/** Ratline navigation deliberately pauses the PCB and its children. The
 * native encoder supplies only the remaining original launch allowance;
 * callers cannot supply or renew this third runtime argument. */
import { CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_FUNCTION } from "./current-pcb-diagnostic-pcb-opening.ts";
import type { CurrentPcbDiagnosticPcbOpeningResult } from "./current-pcb-diagnostic-pcb-opening.ts";
import { CURRENT_PCB_209_RATLINE_NATIVE_PROFILE } from "./current-pcb-209-ratline-budget.ts";
import { CURRENT_PCB_209_RATLINE_CONTINUATION_NATIVE_PROFILE } from "./current-pcb-209-ratline-continuation-budget.ts";

// The composed continuation already has 2,857 bounded parent callbacks, so
// Their individual maxima exceed the overall launch allowance. Capture waits
// And handoffs share that original allowance; summing them would invent time.
// This constant validates the native grant, never supplies a new full window.
export const CURRENT_PCB_209_RATLINE_OPENING_MAX_MS = CURRENT_PCB_209_RATLINE_NATIVE_PROFILE.elapsed.normalMilliseconds;
if (CURRENT_PCB_209_RATLINE_OPENING_MAX_MS !== CURRENT_PCB_209_RATLINE_CONTINUATION_NATIVE_PROFILE.elapsed.normalMilliseconds) {
  throw new Error("PCB209_RATLINE_OPENING_HORIZON");
}
function replaceOnce(source: string, original: string, replacement: string): string {
  const parts = source.split(original);
  if (parts.length !== 2) { throw new Error("PCB209_RATLINE_OPENING_TEMPLATE"); }
  return parts.join(replacement);
}
const signature = replaceOnce(CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_FUNCTION,
  "async function(target,phase){", "async function(target,phase,nativeRemainingMilliseconds){");
const guarded = replaceOnce(signature, 'plain(target);const targetKeys=',
  `if(!["preflight","open-document"].includes(phase)||!Number.isSafeInteger(nativeRemainingMilliseconds)||nativeRemainingMilliseconds<0||nativeRemainingMilliseconds>${CURRENT_PCB_209_RATLINE_OPENING_MAX_MS}||` +
  '(phase==="open-document"?nativeRemainingMilliseconds===0:nativeRemainingMilliseconds!==0))bad("TIMEOUT");\nplain(target);const targetKeys=');
export const CURRENT_PCB_209_RATLINE_OPENING_FUNCTION = replaceOnce(guarded,
  'phase==="open-document"?45000:10000', 'phase==="open-document"?nativeRemainingMilliseconds:10000');

/** A retained refused or timed-out navigation remains consumed, not acknowledged. */
export function currentPcb209RatlineOpeningAcknowledged(observation: CurrentPcbDiagnosticPcbOpeningResult | null): boolean {
  return observation?.phase === "open-document" && observation.ok;
}
