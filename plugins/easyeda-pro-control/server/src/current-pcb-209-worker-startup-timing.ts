/** Fixed 3.2.209 serial await graph, not caller-selectable timeouts. Each owner
 * proof and request keeps its original two-second ceiling. The pause budget
 * includes acknowledgments which can arrive after the next paused event. */
import { performance } from "node:perf_hooks";

const REQUEST_MS = 2000;
const OWNER_MS = REQUEST_MS;
const READ_MS = OWNER_MS + REQUEST_MS + OWNER_MS;
const RESUME_MS = REQUEST_MS + REQUEST_MS;
const BREAKPOINTS = 8;
const ARM_MS = OWNER_MS + BREAKPOINTS * READ_MS;
const SOURCE_MS = OWNER_MS + REQUEST_MS + OWNER_MS;
const SOURCE_CARRY_MS = REQUEST_MS + OWNER_MS;
const constructionReads = [3, 3, 2, 4, 4, 4, 3, 2, 1] as const;

export const CURRENT_PCB_209_STARTUP_TIMING = Object.freeze({
  requestMs: REQUEST_MS,
  legacyPauseMs: 5000,
  constructionArmMs: ARM_MS,
  // First source inherits runIfWaiting's acknowledgment; later sources inherit
  // Both the previous resume acknowledgment and its following owner proof.
  bootstrapPauseMs: REQUEST_MS + SOURCE_MS + RESUME_MS,
  sourcePauseMs: SOURCE_CARRY_MS + SOURCE_MS + RESUME_MS,
  projectPauseMs: SOURCE_CARRY_MS + SOURCE_MS + ARM_MS + REQUEST_MS + OWNER_MS + RESUME_MS,
  constructionPauseMs: Object.freeze(constructionReads.map((reads, index) =>
    (index === 0 ? 0 : REQUEST_MS) + OWNER_MS + reads * READ_MS +
    (index === constructionReads.length - 1 ? REQUEST_MS : 0) + RESUME_MS)),
  // The final eight removals run concurrently, hence one request window above.
});

export interface CurrentPcbStartupWindow {
  readonly startedAtMs: number;
  readonly limitMs: number;
}
export interface CurrentPcbStartupWindowObservation {
  readonly elapsedMs: number;
  readonly limitMs: number;
}
export function currentPcbStartupMonotonicMs(): number { return performance.now(); }
export function currentPcbStartupWindowObservation(window: CurrentPcbStartupWindow, now: number): CurrentPcbStartupWindowObservation {
  return Object.freeze({ elapsedMs: Math.max(0, Math.floor(now - window.startedAtMs)), limitMs: window.limitMs });
}
