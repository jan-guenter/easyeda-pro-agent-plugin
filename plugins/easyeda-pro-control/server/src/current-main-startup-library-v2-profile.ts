/** Separate original-array schedule. Historical V1's 1670 and normal SQL
 * 838/48/64 limits remain exact and cannot spend this new purpose quota. */
import { CURRENT_MAIN_STARTUP_LIBRARY_LIVE as V1 } from "./current-main-startup-library-live-profile.ts";

export const CURRENT_MAIN_STARTUP_LIBRARY_V2 = Object.freeze({
  initialLineage: V1.lineage, continuationLineage: Object.freeze(V1.lineage.slice(0, 3)),
  functionStart: V1.functionStart, functionEnd: V1.functionEnd, returnPoint: V1.returnPoint,
  requests: 2002, rawArrayLength: 333, blankRawIndex: 320,
});
export interface CurrentMainStartupLibraryV2Origin { readonly profile: "private.current-main-startup-library-origin.v2"; readonly executionAuthorized: false }
export const CURRENT_MAIN_STARTUP_LIBRARY_V2_PHASES = Object.freeze([
  "sql-stock-v2-raw", "sql-stock-v2-captured", "sql-stock-v2-caller", "sql-stock-v2-frame", "sql-stock-v2-bind", "sql-stock-v2-points", "sql-stock-v2-arm",
  "sql-stock-v2-select", "sql-stock-v2-require", "sql-stock-v2-resume", "sql-stock-v2-return-frame", "sql-stock-v2-return-properties", "sql-stock-v2-return", "sql-stock-v2-remove",
] as const);
export function isCurrentMainStartupLibraryV2Phase(phase: string): phase is typeof CURRENT_MAIN_STARTUP_LIBRARY_V2_PHASES[number] {
  return (CURRENT_MAIN_STARTUP_LIBRARY_V2_PHASES as readonly string[]).includes(phase);
}
export class CurrentMainStartupLibraryV2Schedule {
  #stage = 0; #calls = 0; #requests = 0;
  public consume(phase: string): void {
    const first = ["raw", "captured", "caller", "frame", "bind", "points", "arm", "select", "require", "resume", "raw", "captured", "caller",
      "return-frame", "return-properties", "return", "remove", "require", "resume"];
    if (phase !== `sql-stock-v2-${first[this.#stage] ?? "invalid"}` || this.#requests >= CURRENT_MAIN_STARTUP_LIBRARY_V2.requests) { throw new Error("STOCK_V2_PHASE_SEQUENCE"); }
    this.#requests += 1;
    if (this.#stage === 9) { this.#calls += 1; this.#stage = this.#calls === 332 ? 13 : 10; }
    else if (this.#stage === 12) { this.#stage = 7; } else { this.#stage += 1; }
  }
  public get requests(): number { return this.#requests; }
  public get complete(): boolean { return this.#stage === 19 && this.#calls === 332 && this.#requests === CURRENT_MAIN_STARTUP_LIBRARY_V2.requests; }
}
