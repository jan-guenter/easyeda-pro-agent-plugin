/** Independent readonly observations of the same original accepted native
 * GET event. No public cursor, old readiness budget or body resume is reused. */
import { types } from "node:util";
import type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_TASK_ACCEPT_REQUESTS as LIMIT, currentFootprintInverseNativeGetTaskAcceptCases as cases, currentFootprintInverseNativeGetTaskAcceptProgram as program, qualifyCurrentFootprintInverseNativeGetTaskAcceptHelper as qualify, validateCurrentFootprintInverseNativeGetTaskAcceptCommand as validate } from "./current-footprint-inverse-native-get-task-accept-protocol.ts";
import type { CurrentFootprintInverseNativeGetTaskAcceptCommand as Command } from "./current-footprint-inverse-native-get-task-accept-protocol.ts";

interface Bindings {
  readonly sessionId: string; readonly contextId: number;
  readonly current: () => Promise<void>; readonly assertOriginalEvent: (event: DiagnosticEvent) => void;
  readonly request: (command: Command) => Promise<unknown>;
}
interface Helper { readonly command: Command; readonly program: string; scriptId: string | null; attempted: boolean }
const order = Object.freeze(cases().slice(0, LIMIT.normal).map(command => command.phase));
const originals = new WeakSet<object>();
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_NATIVE_GET_TASK_ACCEPT_CURSOR"); } }
/** Retain the original worker's separate accepted-event observation sequence.
 * Each slot burns before await, and a helper cannot be retried or replaced. */
export class CurrentFootprintInverseNativeGetTaskAcceptCursor {
  readonly #b: Bindings;
  #normal = 0; #helpers = 0; #failed = false; #pending = false; #completed = false;
  #helper: Helper | null = null;
  /** Capture only the same original worker/source and fixed private sender. */
  public constructor(bindings: Bindings) { this.#b = Object.freeze({ ...bindings }); originals.add(this); }
  /** Keep completed/failed ledgers closed to every new request. */
  #guard(): void { need(!this.#failed && !this.#completed); }
  /** Reprove custody after the original owner's asynchronous verification. */
  async #current(): Promise<void> { this.#guard(); await this.#b.current(); this.#guard(); }
  /** Accept only the owner's exact same-context original pending helper. */
  public observe(event: DiagnosticEvent): boolean { if (event.sessionId !== this.#b.sessionId || event.method !== "Debugger.scriptParsed" || event.params["url"] !== "") { return false; } try { this.#guard(); this.#b.assertOriginalEvent(event); const helper = this.#helper; need(helper !== null && helper.scriptId === null && event.params["executionContextId"] === this.#b.contextId && typeof event.params["scriptId"] === "string" && /^[A-Za-z\d_.:-]{1,256}$/u.test(event.params["scriptId"])); helper.scriptId = event.params["scriptId"]; return true; } catch (caughtError) { this.#failed = true; throw caughtError; } }
  /** Spend one normal slot before verification or transport. No script source
   * can be supplied by a caller, and no resume method exists in this grammar. */
  public async request(input: Command): Promise<unknown> { try { this.#guard(); need(!this.#pending && this.#helper === null); this.#pending = true; const command = validate(input); need(command.phase === order[this.#normal] && this.#normal < LIMIT.normal); this.#normal += 1; const source = program(command); if (source !== null) { this.#helper = { command, program: source, scriptId: null, attempted: false }; } await this.#current(); const raw = await this.#b.request(command); await this.#current(); return raw; } catch (caughtError) { this.#failed = true; throw caughtError; } finally { this.#pending = false; } }
  /** Retain and read the same actual helper once; another source, concurrent
   * attempt, altered command or missing event permanently spoils the lane. */
  public async qualifyHelper(input: Command): Promise<void> { try { this.#guard(); const helper = this.#helper; need(!this.#pending && helper !== null && !helper.attempted && helper.scriptId !== null && JSON.stringify(validate(input)) === JSON.stringify(helper.command)); helper.attempted = true; this.#pending = true; await this.#current(); const raw = await this.#b.request(validate({ phase: "inverse-native-get-task-accept-helper", method: "Debugger.getScriptSource", params: { scriptId: helper.scriptId } })); await this.#current(); need(this.#helper === helper && (this.#helpers += 1) <= LIMIT.helpers && raw !== null && typeof raw === "object" && !types.isProxy(raw) && Reflect.ownKeys(raw).length === 1); const source = Object.getOwnPropertyDescriptor(raw, "scriptSource"); need(source !== undefined && Object.hasOwn(source, "value")); qualify(source.value, helper.program); this.#helper = null; } catch (caughtError) { this.#failed = true; throw caughtError; } finally { this.#pending = false; } }
  /** Require every normal request and actual helper receipt before native ACK. */
  public requireReady(): void { need(!this.#failed && !this.#pending && this.#helper === null && this.#normal === LIMIT.normal && this.#helpers === LIMIT.helpers); }
  /** Seal only after the original owner joined the accepted-event native ACK. */
  public complete(): void { this.#guard(); this.requireReady(); this.#completed = true; }
  /** A completed observation stays closed and supplies no worker body grant. */
  public requireCompleted(): void { need(this.#completed); this.requireReady(); }
  /** Make original-exit/custody failure sticky; the owner joins its same outer
   * work Promise and all original pipe requests before claiming cleanup. */
  public fail(): void { this.#failed = true; }
}
const methods = Object.getOwnPropertyDescriptors(CurrentFootprintInverseNativeGetTaskAcceptCursor.prototype);
/** Refuse copied cursors, Proxy traps and substituted prototype members. */
export function assertOriginalCurrentFootprintInverseNativeGetTaskAcceptCursor(value: CurrentFootprintInverseNativeGetTaskAcceptCursor): void { need(value !== null && typeof value === "object" && !types.isProxy(value) && originals.has(value) && Object.getPrototypeOf(value) === CurrentFootprintInverseNativeGetTaskAcceptCursor.prototype && Reflect.ownKeys(value).length === 0); const observed = Object.getOwnPropertyDescriptors(CurrentFootprintInverseNativeGetTaskAcceptCursor.prototype); need(Reflect.ownKeys(observed).length === Reflect.ownKeys(methods).length && Object.entries(methods).every(([name, d]) => { const now = observed[name]; return now !== undefined && now.value === d.value && now.get === d.get && now.set === d.set && now.writable === d.writable && now.enumerable === d.enumerable && now.configurable === d.configurable; })); }
