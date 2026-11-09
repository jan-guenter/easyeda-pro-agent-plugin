/** Finite phase consumption for the separate original stock enrollment. Every
 * attempt is spent before I/O, with no refund after a lost or refused reply. */
import { CURRENT_MAIN_STARTUP_LIBRARY_LIVE as LIVE } from "./current-main-startup-library-live-profile.ts";

export class CurrentMainStartupLibrarySchedule {
  #stage = 0; #calls = 0; #requests = 0;
  public consume(phase: string): void {
    const initial = ["sql-stock-raw", "sql-stock-captured", "sql-stock-frame", "sql-stock-bind", "sql-stock-points", "sql-stock-arm"];
    const continuation = ["sql-stock-select", "sql-stock-require", "sql-stock-resume", "sql-stock-raw", "sql-stock-captured",
      "sql-stock-return-frame", "sql-stock-return-properties", "sql-stock-return", "sql-stock-remove", "sql-stock-require", "sql-stock-resume"];
    const expected = this.#stage < 6 ? initial[this.#stage] : continuation[this.#stage - 6];
    if (phase !== expected || this.#requests >= LIVE.requests) { throw new Error("MAIN_STARTUP_LIBRARY_PHASE_SEQUENCE"); }
    this.#requests += 1;
    if (this.#stage === 8) { this.#calls += 1; this.#stage = this.#calls === 332 ? 11 : 9; }
    else if (this.#stage === 10) { this.#stage = 6; }
    else { this.#stage += 1; }
  }
  public get requests(): number { return this.#requests; }
  public get complete(): boolean { return this.#stage === 17 && this.#calls === 332 && this.#requests === LIVE.requests; }
}
