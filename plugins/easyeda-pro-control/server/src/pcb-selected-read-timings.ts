const STAGES = ["quarantine", "context", "status", "source-read", "inventory-read", "selected-id-read", "inherited-capture", "inherited-reproof"] as const;
type Stage = typeof STAGES[number];
interface State { completedCount: number; failedCount: number; totalElapsedMs: number; maxElapsedMs: number; }

function bounded(value: number): number {
  return Number.isFinite(value) ? Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.floor(value))) : 0;
}

/** Passive coordinator-stage diagnostics. Constituent read/capture durations
 * include their own guards and implementation checks; these are not an
 * exclusive profile of every engine operation. No paths, IDs, payloads or
 * errors are retained. Timing never enters native comparisons or commitments.
 */
export class PcbSelectedReadTimings {
  readonly #clock: () => number;
  readonly #stages = new Map<Stage, State>();

  public constructor(clock: () => number = (): number => performance.now()) { this.#clock = clock; }

  #now(): number | undefined {
    try {
      const value = this.#clock();
      return Number.isFinite(value) && value >= 0 ? value : undefined;
    } catch { return undefined; }
  }

  public async measure<Value>(stage: Stage, action: () => Promise<Value>): Promise<Value> {
    if (!STAGES.some((allowed) => allowed === stage)) { return action(); }
    const start = this.#now();
    const state = this.#stages.get(stage) ?? { completedCount: 0, failedCount: 0, totalElapsedMs: 0, maxElapsedMs: 0 };
    this.#stages.set(stage, state);
    let completed = false;
    try {
      const value = await action(); completed = true; return value;
    } finally {
      const end = this.#now();
      const elapsed = start === undefined || end === undefined ? 0 : bounded(end - start);
      if (completed) { state.completedCount = bounded(state.completedCount + 1); }
      else { state.failedCount = bounded(state.failedCount + 1); }
      state.totalElapsedMs = bounded(state.totalElapsedMs + elapsed);
      state.maxElapsedMs = Math.max(state.maxElapsedMs, elapsed);
    }
  }

  public snapshot(): Readonly<Record<string, unknown>> {
    return Object.freeze({ schema: "easyeda-pro-control.pcb-selected-read-timings.v1",
      scope: "coordinator-stages; constituent-read-and-capture-times-include-inner-guards",
      authority: "passive-diagnostics-not-native-observation-or-admission-proof",
      stages: Object.freeze(STAGES.flatMap((stage) => {
        const state = this.#stages.get(stage);
        return state === undefined ? [] : [Object.freeze({ stage, ...state })];
      })) });
  }
}
