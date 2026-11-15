/** Original single preparation sequence. Its data cannot resume a clock or
 * replace the native Job, UI hold, real event or original request Promise. */
import { types } from "node:util";
import type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_REGISTRATION_REQUESTS as LIMIT,
  CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_REGISTRATION_ORDER as ORDER,
  currentFootprintInverseNativeDeleteClockRegistrationHelperCommand as helperCommand,
  currentFootprintInverseNativeDeleteClockRegistrationKey as key, currentFootprintInverseNativeDeleteClockRegistrationProgram as program,
  qualifyCurrentFootprintInverseNativeDeleteClockRegistrationHelper as qualify,
  validateCurrentFootprintInverseNativeDeleteClockRegistrationCommand as validate } from "./current-footprint-inverse-native-delete-clock-registration-protocol.ts";
import type { CurrentFootprintInverseNativeDeleteClockRegistrationCommand as Command } from "./current-footprint-inverse-native-delete-clock-registration-protocol.ts";

interface Bindings {
  readonly sessionId: string; readonly contextId: number;
  readonly current: () => Promise<void>; readonly assertOriginalHeld: () => void; readonly assertOriginalEvent: (event: DiagnosticEvent) => void;
  readonly request: (command: Command) => Promise<unknown>;
}
interface Helper { readonly command: Command; scriptId: string | null; attempted: boolean; issued: boolean }
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_NATIVE_DELETE_CLOCK_REGISTRATION_CURSOR"); } }
const originals = new WeakSet<object>();
export class CurrentFootprintInverseNativeDeleteClockRegistrationCursor {
  readonly #b: Bindings; readonly #runs: Promise<unknown>[] = []; readonly #issued: Promise<unknown>[] = [];
  #normal = 0; #helpers = 0; #pending = false; #failed = false; #complete = false; #helper: Helper | null = null;
  public constructor(bindings: Bindings) { this.#b = Object.freeze({ ...bindings }); originals.add(this); }
  #guard(): void { need(!this.#failed && !this.#complete); }
  async #current(): Promise<void> { this.#guard(); this.#b.assertOriginalHeld(); await this.#b.current(); this.#guard(); this.#b.assertOriginalHeld(); }
  #track<T>(run: () => Promise<T>): Promise<T> {
    this.#guard(); need(this.#runs.length < LIMIT.cdpRequests);
    const result = run(); this.#runs.push(result); return result;
  }
  async #send(command: Command): Promise<unknown> {
    await this.#current(); this.#guard(); this.#b.assertOriginalHeld(); if (program(command) !== null) { const helper = this.#helper; need(helper !== null && helper.command === command && !helper.issued); helper.issued = true; }
    const request = this.#b.request(command); need(types.isPromise(request));
    this.#issued.push(request); const raw = await request; await this.#current(); return raw;
  }
  public observe(event: DiagnosticEvent): boolean {
    if (this.#complete || event.sessionId !== this.#b.sessionId || event.method !== "Debugger.scriptParsed" || event.params["url"] !== "") { return false; }
    try {
      this.#guard(); this.#b.assertOriginalHeld(); this.#b.assertOriginalEvent(event); const helper = this.#helper;
      need(helper !== null && helper.issued && !helper.attempted && helper.scriptId === null &&
        event.params["executionContextId"] === this.#b.contextId && typeof event.params["scriptId"] === "string" &&
        /^[A-Za-z\d_.:-]{1,256}$/u.test(event.params["scriptId"]));
      helper.scriptId = event.params["scriptId"]; return true;
    } catch (caughtError) { this.#failed = true; throw caughtError; }
  }
  public request(input: Command): Promise<unknown> {
    return this.#track(async (): Promise<unknown> => {
      try {
        this.#guard(); need(!this.#pending && this.#helper === null); this.#pending = true;
        const command = validate(input); need(this.#normal < LIMIT.normal && key(command) === ORDER[this.#normal]); this.#normal += 1;
        if (program(command) !== null) { this.#helper = { command, scriptId: null, attempted: false, issued: false }; }
        return await this.#send(command);
      } catch (caughtError) { this.#failed = true; throw caughtError; } finally { this.#pending = false; }
    });
  }
  public qualifyHelper(input: Command): Promise<void> {
    return this.#track(async (): Promise<void> => {
      try {
        this.#guard(); const helper = this.#helper;
        need(!this.#pending && helper !== null && !helper.attempted && helper.scriptId !== null &&
          JSON.stringify(validate(input)) === JSON.stringify(helper.command)); helper.attempted = true; this.#pending = true;
        const raw = await this.#send(helperCommand(helper.command, helper.scriptId));
        need(raw !== null && typeof raw === "object" && !types.isProxy(raw) && Reflect.ownKeys(raw).length === 1);
        const descriptor = Object.getOwnPropertyDescriptor(raw, "scriptSource");
        need(descriptor !== undefined && Object.hasOwn(descriptor, "value")); qualify(descriptor.value, helper.command);
        this.#helpers += 1; need(this.#helpers <= LIMIT.helpers && this.#helper === helper); this.#helper = null;
      } catch (caughtError) { this.#failed = true; throw caughtError; } finally { this.#pending = false; }
    });
  }
  public requireReady(): void {
    need(!this.#failed && !this.#pending && this.#helper === null && this.#normal === LIMIT.normal && this.#helpers === LIMIT.helpers &&
      this.#runs.length === LIMIT.cdpRequests && this.#issued.length === LIMIT.cdpRequests);
  }
  public complete(): void { this.#guard(); this.requireReady(); this.#complete = true; }
  public requireCompleted(): void { need(this.#complete); this.requireReady(); }
  public fail(): void { this.#failed = true; }
  /** Parent cleanup must also join its original whole collector/controller
   * Promise; no release, termination or application proof is fabricated here. */
  public async settleAfterOriginalExit(): Promise<void> { this.fail(); await Promise.allSettled([...this.#runs, ...this.#issued]); }
}
export function assertOriginalCurrentFootprintInverseNativeDeleteClockRegistrationCursor(value: CurrentFootprintInverseNativeDeleteClockRegistrationCursor): void {
  need(value !== null && typeof value === "object" && !types.isProxy(value) && originals.has(value));
}
