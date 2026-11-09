/** Original worker cursor for the distinct native readonly GET preparation.
 * It never borrows the public GET cursor, accepts a job or resumes a body. */
import { types } from "node:util";
import type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_GET_WORKER_SITE as SITE } from "./current-footprint-inverse-get-worker-protocol.ts";
import { currentFootprintInverseGetWorkerPoint } from "./current-footprint-inverse-get-worker-replies.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_WORKER_REQUESTS as LIMIT, currentFootprintInverseNativeGetWorkerOrder as order, currentFootprintInverseNativeGetWorkerProgram as program, qualifyCurrentFootprintInverseNativeGetWorkerHelper as qualify, validateCurrentFootprintInverseNativeGetWorkerCommand as validate } from "./current-footprint-inverse-native-get-worker-protocol.ts";
import type { CurrentFootprintInverseNativeGetWorkerCommand as Command } from "./current-footprint-inverse-native-get-worker-protocol.ts";

interface Bindings { readonly scriptId: string; readonly sessionId: string; readonly contextId: number; readonly current: () => Promise<void>; readonly request: (command: Command) => Promise<unknown> }
interface Helper { readonly command: Command; scriptId: string | null; attempted: boolean }
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_NATIVE_GET_WORKER_CURSOR"); } }
function handle(value: unknown): value is string { return typeof value === "string" && /^[A-Za-z\d_.:-]{1,256}$/u.test(value); }

/** One original source/context, finite request order and original helper stream.
 * Readiness is data for Core's separate native registry, never its issuer. */
export class CurrentFootprintInverseNativeGetWorkerCursor {
  readonly #b: Bindings;
  #normal = 0; #helpers = 0; #failed = false; #pending = false; #completed = false; #arming = false;
  #point: string | null = null; #resolved: string | null = null; #helper: Helper | null = null;
  /** Retain the original worker's private source, context and fixed sender. */
  public constructor(bindings: Bindings) { this.#b = Object.freeze({ ...bindings }); }
  /** Refuse all work after any consumed failure or completed preparation. */
  #guard(): void { need(!this.#failed && !this.#completed); }
  /** Reprove current owner/context after the asynchronous private owner guard. */
  async #current(): Promise<void> { this.#guard(); await this.#b.current(); this.#guard(); }
  /** Accept only the exact pending helper or fixed source breakpoint event.
   * Unexpected metadata in this active route is permanently refused. */
  public observe(event: DiagnosticEvent): boolean {
    if (event.sessionId !== this.#b.sessionId) { return false; }
    try {
      if (event.method === "Debugger.scriptParsed" && event.params["url"] === "") {
        this.#guard(); const helper = this.#helper; need(helper !== null && helper.scriptId === null && event.params["executionContextId"] === this.#b.contextId && handle(event.params["scriptId"])); helper.scriptId = event.params["scriptId"]; return true;
      }
      if (event.method === "Debugger.breakpointResolved") {
        need(!this.#failed); const location = event.params["location"], point = event.params["breakpointId"];
        need((this.#arming || this.#point !== null) && handle(point) && (this.#point === null || this.#point === point) && location !== null && typeof location === "object" && !Array.isArray(location) && !types.isProxy(location) && Reflect.ownKeys(location).length === 3 && Reflect.ownKeys(event.params).length === 2);
        const raw = Object.getOwnPropertyDescriptors(location); need(raw["scriptId"]?.value === this.#b.scriptId && raw["lineNumber"]?.value === SITE.lineNumber && raw["columnNumber"]?.value === SITE.columnNumber && this.#resolved === null); this.#resolved = point; return true;
      }
      return false;
    } catch (caughtError) { this.#failed = true; throw caughtError; }
  }
  /** Burn each normal slot synchronously before verification or transport.
   * There is no repeat, helper shortcut, body resume or caller-selected code. */
  public async request(input: Command): Promise<unknown> {
    try {
      this.#guard(); need(!this.#pending && this.#helper === null); this.#pending = true;
      const command = validate(input); need(command.phase === order(this.#normal) && this.#normal < LIMIT.normal); this.#normal += 1;
      const source = program(command); if (source !== null) { this.#helper = { command, scriptId: null, attempted: false }; }
      if (command.method === "Debugger.setBreakpoint") { need(command.params.location.scriptId === this.#b.scriptId && this.#point === null); this.#arming = true; }
      await this.#current(); const raw = await this.#b.request(command); await this.#current();
      if (command.method === "Debugger.setBreakpoint") { const point = currentFootprintInverseGetWorkerPoint(raw, this.#b.scriptId); need(this.#resolved === null || this.#resolved === point); this.#point = point; this.#arming = false; }
      return raw;
    } catch (caughtError) { this.#failed = true; throw caughtError; } finally { this.#pending = false; }
  }
  /** Read and compare the pending helper's exact original script once. A
   * missing, copied, concurrent or changed receipt permanently spoils custody. */
  public async qualifyHelper(input: Command): Promise<void> {
    try {
      this.#guard(); const helper = this.#helper; need(!this.#pending && helper !== null && !helper.attempted && helper.scriptId !== null && JSON.stringify(validate(input)) === JSON.stringify(helper.command));
      helper.attempted = true; this.#pending = true; await this.#current();
      const raw = await this.#b.request(validate({ phase: "inverse-native-get-worker-helper", method: "Debugger.getScriptSource", params: { scriptId: helper.scriptId } })); await this.#current();
      need(this.#helper === helper && (this.#helpers += 1) <= LIMIT.helpers); qualify(raw, helper.command); this.#helper = null;
    } catch (caughtError) { this.#failed = true; throw caughtError; } finally { this.#pending = false; }
  }
  /** Require the entire readonly preparation and actual fixed point receipt. */
  public requireReady(): string { need(!this.#failed && !this.#pending && this.#helper === null && !this.#arming && this.#normal === LIMIT.normal && this.#helpers === LIMIT.helpers && this.#point !== null); return this.#point; }
  /** Seal preparation after Core has joined its original native ready ACK. */
  public complete(): void { this.#guard(); this.requireReady(); this.#completed = true; }
  /** Retained readiness has no fresh request budget and grants no worker body. */
  public requireCompleted(): string { need(this.#completed); return this.requireReady(); }
  /** Expose bounded accounting only; none of these fields issues authority. */
  public counts(): Readonly<{ normal: number; helpers: number }> { return Object.freeze({ normal: this.#normal, helpers: this.#helpers }); }
}
