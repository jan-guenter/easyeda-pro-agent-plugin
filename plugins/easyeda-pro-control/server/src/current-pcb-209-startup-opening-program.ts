/** The209 parent waits while its original project worker is deliberately
 * paused for source and constructor capture. Only this fixed startup route
 * adds that finite await graph to the ordinary project-opening allowance. */
import { CURRENT_PCB_DIAGNOSTIC_OPENING_FUNCTION } from "./current-pcb-diagnostic-opening.ts";
import { CURRENT_PCB_209_STARTUP_OPENING_TIMING } from "./current-pcb-209-worker-startup-timing.ts";

// Keep the generic program byte-identical. Refuse a changed template rather
// Than silently replacing another timer or exporting a configurable deadline.
const originalDeadline = 'phase==="preflight"?10000:45000';
const parts = CURRENT_PCB_DIAGNOSTIC_OPENING_FUNCTION.split(originalDeadline);
if (parts.length !== 2) { throw new Error("PCB209_STARTUP_OPENING_TEMPLATE"); }
const dispatch = 'stage="dispatch";dispatchAttempted=true;const result=await';
const dispatchParts = parts.join(`phase==="preflight"?10000:${CURRENT_PCB_209_STARTUP_OPENING_TIMING.nativeMs}`).split(dispatch);
if (dispatchParts.length !== 2) { throw new Error("PCB209_STARTUP_OPENING_DISPATCH_TEMPLATE"); }
export const CURRENT_PCB_209_STARTUP_OPENING_FUNCTION = dispatchParts.join(
  'stage="dispatch";substage="native-open-project";dispatchAttempted=true;const result=await');
