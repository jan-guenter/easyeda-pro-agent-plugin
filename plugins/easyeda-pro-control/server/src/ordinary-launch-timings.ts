import { performance } from "node:perf_hooks";

const STAGES = ["inventory-initial", "admission-initial", "installation-initial", "admission-before-helper", "helper-presence",
  "reservation", "intent-publication", "admission-after-intent", "inventory-before-dispatch", "installation-before-dispatch",
  "admission-before-dispatch", "launch-dispatch", "launched-publication", "nondispatch-publication"] as const;
export type OrdinaryLaunchTimingStage = typeof STAGES[number];
interface State { completedCount: number; failedCount: number; totalElapsedMs: number; maxElapsedMs: number; }
function bounded(value: number): number {
  return Number.isFinite(value) ? Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.floor(value))) : 0;
}

/** Fixed-label, process-local diagnostics only. No inputs, results, paths or
 * error messages are retained. Timings never qualify admission or a retry.
 */
export class OrdinaryLaunchTimings {
  readonly #clock: () => number;
  readonly #stages = new Map<OrdinaryLaunchTimingStage, State>();
  public constructor(clock: () => number = (): number => performance.now()) { this.#clock = clock; }
  #now(): number | undefined {
    try { const value = this.#clock(); return Number.isFinite(value) && value >= 0 ? value : undefined; }
    catch { return undefined; }
  }
  public async measure<Value>(stage: OrdinaryLaunchTimingStage, action: () => Promise<Value>): Promise<Value> {
    if (!STAGES.some((allowed) => allowed === stage)) { return action(); }
    const start = this.#now();
    const state = this.#stages.get(stage) ?? { completedCount: 0, failedCount: 0, totalElapsedMs: 0, maxElapsedMs: 0 };
    this.#stages.set(stage, state);
    let completed = false;
    try { const result = await action(); completed = true; return result; }
    finally {
      const end = this.#now();
      const elapsed = start === undefined || end === undefined ? 0 : bounded(end - start);
      if (completed) { state.completedCount = bounded(state.completedCount + 1); }
      else { state.failedCount = bounded(state.failedCount + 1); }
      state.totalElapsedMs = bounded(state.totalElapsedMs + elapsed);
      state.maxElapsedMs = Math.max(state.maxElapsedMs, elapsed);
    }
  }
  public snapshot(): Readonly<Record<string, unknown>> {
    return Object.freeze({ schema: "easyeda-pro-control.ordinary-launch-timings.v1",
      scope: "original-launch-request; same-coordinator-memory-only; inner-checks-included",
      authority: "passive-diagnostics-not-admission-or-termination-proof",
      stages: Object.freeze(STAGES.flatMap((stage) => {
        const state = this.#stages.get(stage);
        return state === undefined ? [] : [Object.freeze({ stage, ...state })];
      })) });
  }
}
