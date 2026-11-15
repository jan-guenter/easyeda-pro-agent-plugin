/** Original native DEL single-clock event and Promise custody. */
import { types } from "node:util";
import { performance } from "node:perf_hooks";
import { z } from "zod";
import type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";
import { observeCurrentFootprintInverseNativeDeleteClock as observe } from "./current-footprint-inverse-native-delete-clock-observer.ts";
import type { CurrentFootprintInverseNativeDeleteClockData as Data, CurrentFootprintInverseNativeDeleteClockObserverBindings as Observer } from "./current-footprint-inverse-native-delete-clock-observer.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_ARM_ROLES as ARMS, CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_ORDER as ORDER, currentFootprintInverseNativeDeleteClockHelperCommand as helperCommand,
  currentFootprintInverseNativeDeleteClockKey as key, currentFootprintInverseNativeDeleteClockProgram as program,
  qualifyCurrentFootprintInverseNativeDeleteClockHelper as qualify, qualifyCurrentFootprintInverseNativeDeleteClockConditionSource as qualifyCondition, validateCurrentFootprintInverseNativeDeleteClockCommand as validate } from "./current-footprint-inverse-native-delete-clock-protocol.ts";
import type { CurrentFootprintInverseNativeDeleteClockCommand as Command } from "./current-footprint-inverse-native-delete-clock-protocol.ts";
import { currentFootprintInverseNativeDeleteClockPause as pause } from "./current-footprint-inverse-native-delete-clock-replies.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_SITES as SITES } from "./current-footprint-inverse-native-delete-clock-profile.ts";

type Role = typeof ARMS[number];
type Resume = Parameters<Observer["resume"]>[0];
type Realm = "worker" | "ui";
interface Condition { readonly role: Role; readonly scriptId: string; readonly command: Command; readonly event: DiagnosticEvent; attempted: boolean; complete: boolean }
interface Helper { readonly command: Command; scriptId: string | null; issued: boolean; attempted: boolean }
export interface CurrentFootprintInverseNativeDeleteClockControllerBindings extends Omit<Observer, "request" | "qualifyHelper" | "retainPoint" | "resume" | "next" | "control"> {
  readonly contexts: Readonly<{ worker: number; ui: number }>;
  readonly current: () => void; readonly assertOriginalHeld: () => void;
  readonly assertOriginalEvent: (event: DiagnosticEvent) => void; readonly assertOriginalExit: () => void;
  readonly poll: () => Promise<void>; readonly send: (command: Command, beforeTransfer: () => void) => Promise<unknown>;
  readonly resume: (command: Command, beforeTransfer: () => void) => Promise<unknown>;
  readonly consumeOriginalHold: (realm: Realm) => void;
  readonly control: (phase: "bind" | "armed" | "held" | "resumed" | "complete", fields?: Readonly<Record<string, string>>) => Promise<void>;
}
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_NATIVE_DELETE_CLOCK_CUSTODY"); } }
const originals = new WeakSet<object>(); const empty = z.strictObject({});
export class CurrentFootprintInverseNativeDeleteClockController {
  readonly #b: CurrentFootprintInverseNativeDeleteClockControllerBindings;
  readonly #points = new Map<Role, string>(); readonly #conditions = new Map<Role, Condition>(); readonly #conditionSources = new Map<Role, Command>(); readonly #raw: DiagnosticEvent[] = []; readonly #requests: Promise<unknown>[] = [];
  readonly #held: Record<Realm, DiagnosticEvent | null>;
  readonly #resuming = new Map<Realm, Resume>(); readonly #resumed = new Set<Resume>(); readonly #removed = new Set<string>();
  #helper: Helper | null = null; #reading = false; #failed = false; #armed = false; #step = 0; #normal = 0; #helpers = 0; #pauseCount = 0;
  #queued: Readonly<{ role: Role; event: DiagnosticEvent }> | null = null; #data: Readonly<Data> | null = null; #pending: Promise<Readonly<Data>> | null = null;
  #producerConsumed = false;
  #arming: Role | null = null; #resolved: string | null = null;
  public constructor(bindings: CurrentFootprintInverseNativeDeleteClockControllerBindings) { this.#b = Object.freeze({ ...bindings }); this.#held = { worker: bindings.initialWorker, ui: bindings.initialUi }; originals.add(this); }
  #current(): void { try { this.#b.current(); need(!this.#failed); } catch (caughtError) { this.#failed = true; throw caughtError; } }
  /** Only the actual owner/worker reader can supply these original events.
   * Each pause is validated before any frame operand is projected. */
  public observe(event: DiagnosticEvent): boolean {
    let realm: Realm | null = null;
    if (event.sessionId === this.#b.sessions.worker) { realm = "worker"; } else if (event.sessionId === this.#b.sessions.ui) { realm = "ui"; }
    if (realm === null || this.#data !== null) { return false; }
    // The original global reader retains console packets under its aggregate
    // Bound; they supply no clock helper, breakpoint or continuation receipt.
    if (event.method === "Runtime.consoleAPICalled") { return false; }
    try { this.#current(); this.#b.assertOriginalEvent(event); need(this.#raw.length < 45); this.#raw.push(event);
      if (event.method === "Debugger.scriptParsed" && this.#helper === null) {
        const role = ARMS[this.#pauseCount], sourceId = event.params["scriptId"], url = event.params["url"];
        need(this.#armed && role !== undefined && SITES[role].realm === realm && !this.#conditions.has(role) &&
          (this.#held[realm] === null || this.#resuming.has(realm)) && event.params["executionContextId"] === this.#b.contexts[realm] &&
          typeof sourceId === "string" && /^[A-Za-z\d_.:-]{1,256}$/u.test(sourceId) && url === "" &&
          ![...this.#conditions.values()].some(item => item.scriptId === sourceId));
        const command = this.#conditionSources.get(role); need(command !== undefined);
        this.#conditions.set(role, { role, scriptId: sourceId, command, event, attempted: false, complete: false }); return true;
      }
      if (event.method === "Debugger.scriptParsed" && event.params["url"] === "") { const helper = this.#helper; need(helper !== null && helper.issued && !helper.attempted &&
        helper.command.realm === realm && helper.scriptId === null && event.params["executionContextId"] === this.#b.contexts[realm] &&
        typeof event.params["scriptId"] === "string" && /^[A-Za-z\d_.:-]{1,256}$/u.test(event.params["scriptId"])); helper.scriptId = event.params["scriptId"]; return true; }
      if (event.method === "Debugger.breakpointResolved") { const role = this.#arming; const location = event.params["location"]; need(role !== null && this.#resolved === null && SITES[role].realm === realm &&
        location !== null && typeof location === "object" && !types.isProxy(location)); const actual = z.strictObject({ scriptId: z.literal(this.#b.scripts[realm]), lineNumber: z.literal(SITES[role].lineNumber), columnNumber: z.literal(SITES[role].columnNumber) }).parse(location);
        need(actual.scriptId === this.#b.scripts[realm] && typeof event.params["breakpointId"] === "string"); this.#resolved = event.params["breakpointId"]; return true; }
      if (event.method === "Debugger.resumed") { const role = this.#resuming.get(realm); need(role !== undefined && !this.#resumed.has(role) && this.#held[realm] !== null); empty.parse(event.params);
        this.#resumed.add(role); this.#resuming.delete(realm); this.#held[realm] = null; return true; }
      if (event.method === "Debugger.paused") { const role = ARMS[this.#pauseCount]; need(this.#armed && role !== undefined && SITES[role].realm === realm && this.#queued === null && this.#held[realm] === null && !this.#resuming.has(realm));
        const point = this.#points.get(role); need(point !== undefined); pause(event, role, this.#b.sessions[realm], this.#b.scripts[realm], point);
        this.#pauseCount += 1; this.#queued = Object.freeze({ role, event }); return true; }
      return false;
    } catch (caughtError) { this.#failed = true; throw caughtError; }
  }
  /** Start is consumed synchronously before the first native I/O. */
  public start(): Promise<Readonly<Data>> {
    if (this.#pending !== null) { return this.#pending; }
    const result = Promise.withResolvers<Readonly<Data>>(); this.#pending = result.promise;
    void (async (): Promise<void> => { try { this.#current(); this.#b.assertOriginalHeld(); await this.#control("bind");
      const data = await observe({ ...this.#b, request: input => this.#read(input), qualifyHelper: input => this.#qualify(input),
        retainPoint: (role, point): void => { this.#current(); need(this.#arming === role && !this.#points.has(role) && ![...this.#points.values()].includes(point) && (this.#resolved === null || this.#resolved === point)); this.#points.set(role, point); this.#arming = null; this.#resolved = null; },
        resume: role => this.#resume(role), next: role => this.#next(role), control: phase => this.#control(phase) });
      this.#current(); need(this.#data === null && this.#held.worker === data.producerEvent && this.#held.ui === null && this.#queued === null && this.#helper === null && this.#step === 90 && this.#requests.length === 90 && this.#normal === 70 && this.#helpers === 20 && this.#resumed.size === 7 && this.#removed.size === 9 && this.#conditions.size === 6 && [...this.#conditions.values()].every(condition => condition.complete));
      this.#data = data; result.resolve(data);
    } catch (caughtError) { this.#failed = true; result.reject(caughtError); } })(); return result.promise;
  }
  async #send(command: Command): Promise<unknown> { this.#current(); need(key(command) === ORDER[this.#step]); this.#step += 1;
    const actual = this.#b.send(command, (): void => { this.#current(); const helper = this.#helper;
      if (program(command) !== null) { need(helper !== null && !helper.issued); helper.issued = true; } }); need(types.isPromise(actual) && this.#requests.length < 90); this.#requests.push(actual); const raw = await actual; this.#current(); return raw; }
  async #read(input: Command): Promise<unknown> { try { this.#current(); need(!this.#reading && this.#helper === null && this.#data === null); this.#reading = true;
    const command = validate(input); need(command.method !== "Debugger.resume" && (this.#normal += 1) <= 70);
    if (command.method === "Debugger.setBreakpoint") { need(this.#arming === null); this.#arming = command.role; this.#resolved = null; need(!this.#conditionSources.has(command.role)); this.#conditionSources.set(command.role, command); }
    if (program(command) !== null) { this.#helper = { command: input, scriptId: null, issued: false, attempted: false }; }
    const raw = await this.#send(command); if (command.method === "Debugger.removeBreakpoint") { empty.parse(raw); need(!this.#removed.has(command.params.breakpointId)); this.#removed.add(command.params.breakpointId); } return raw;
  } catch (caughtError) { this.#failed = true; throw caughtError; } finally { this.#reading = false; } }
  async #qualify(input: Command): Promise<void> { try { this.#current(); const helper = this.#helper; need(!this.#reading && helper !== null && !helper.attempted && helper.scriptId !== null && input === helper.command); helper.attempted = true; this.#reading = true;
    const raw = z.strictObject({ scriptSource: z.string().max(20_000) }).parse(await this.#send(helperCommand(helper.command, helper.scriptId))); qualify(raw.scriptSource, helper.command);
    need((this.#helpers += 1) <= 20); this.#helper = null;
  } catch (caughtError) { this.#failed = true; throw caughtError; } finally { this.#reading = false; } }
  async #wait(predicate: () => boolean): Promise<void> { const started = performance.now(); while (!predicate()) { this.#current(); need(performance.now() - started < 30_000); await this.#b.poll(); this.#current(); } }
  async #resume(role: Resume): Promise<void> { this.#current(); const realm: Realm = role === "initial-ui" || role === "result" ? "ui" : "worker";
    need(this.#armed && !this.#reading && this.#helper === null && this.#held[realm] !== null && !this.#resuming.has(realm) && !this.#resumed.has(role)); this.#reading = true;
    try { const command = validate({ phase: "inverse-native-delete-clock-resume", role, realm, method: "Debugger.resume", params: {} });
      const raw = this.#b.resume(command, (): void => { this.#current(); need(!this.#resuming.has(realm) && this.#held[realm] !== null);
        if (role === "initial-ui" || role === "initial-worker") { this.#b.consumeOriginalHold(realm); }
        need(key(command) === ORDER[this.#step]); this.#step += 1; this.#resuming.set(realm, role); need((this.#normal += 1) <= 70); });
      need(types.isPromise(raw) && this.#requests.length < 90); this.#requests.push(raw); empty.parse(await raw); this.#current(); await this.#wait(() => this.#resumed.has(role)); await this.#control("resumed", { role });
    } catch (caughtError) { this.#failed = true; throw caughtError; } finally { this.#reading = false; }
  }
  async #next(role: Role): Promise<DiagnosticEvent> { await this.#wait(() => this.#queued !== null); this.#current(); const actual = this.#queued; need(actual !== null && actual.role === role && this.#held[SITES[role].realm] === null);
    this.#queued = null; this.#held[SITES[role].realm] = actual.event; await this.#control("held", { role });
    const condition = this.#conditions.get(role); need(condition !== undefined && !condition.attempted && !condition.complete); condition.attempted = true;
    this.#b.assertOriginalEvent(condition.event);
    const raw = z.strictObject({ scriptSource: z.string().max(512) }).parse(await this.#read(validate({ phase: "inverse-native-delete-clock-condition", realm: SITES[role].realm, role, method: "Debugger.getScriptSource", params: { scriptId: condition.scriptId } })));
    qualifyCondition(raw.scriptSource, condition.command); need(this.#conditions.get(role) === condition); condition.complete = true; return actual.event; }
  async #control(phase: "bind" | "armed" | "held" | "resumed" | "complete", fields: Readonly<Record<string, string>> = {}): Promise<void> {
    this.#current(); if (phase === "armed") { this.#b.assertOriginalHeld(); need(!this.#armed && this.#points.size === 6 && this.#helper === null); this.#armed = true; }
    if (phase === "complete") { need(this.#normal === 70 && this.#helpers === 20 && this.#pauseCount === 6 && this.#resumed.size === 7 && this.#held.worker !== null && this.#held.ui === null && this.#removed.size === 9 && this.#conditions.size === 6 && [...this.#conditions.values()].every(condition => condition.complete)); }
    const selected = phase === "armed" ? Object.freeze(Object.fromEntries(this.#points)) : fields;
    await this.#b.control(phase, selected); this.#current();
  }
  public requireOriginal(data: Readonly<Data>): Readonly<Data> { this.#current(); need(!this.#producerConsumed && this.#data === data && this.#held.worker === data.producerEvent && this.#pending !== null && !this.#reading); this.#b.assertOriginalEvent(data.producerEvent); return data; }
  public consumeOriginalProducer(data: Readonly<Data>): void { this.requireOriginal(data); need(!this.#producerConsumed); this.#producerConsumed = true; }
  /** Join every original request and outer work only after actual parent exit. */
  public async settleAfterOriginalExit(): Promise<void> { this.#b.assertOriginalExit(); this.#failed = true; await Promise.allSettled([this.#pending, ...this.#requests]); this.#b.assertOriginalExit(); }
}
const methods = Object.getOwnPropertyDescriptors(CurrentFootprintInverseNativeDeleteClockController.prototype);
export function assertOriginalCurrentFootprintInverseNativeDeleteClockController(value: CurrentFootprintInverseNativeDeleteClockController): void {
  need(value !== null && typeof value === "object" && !types.isProxy(value) && originals.has(value) && Object.getPrototypeOf(value) === CurrentFootprintInverseNativeDeleteClockController.prototype && Reflect.ownKeys(value).length === 0);
  const actual = Object.getOwnPropertyDescriptors(CurrentFootprintInverseNativeDeleteClockController.prototype); need(Reflect.ownKeys(actual).length === Reflect.ownKeys(methods).length && Object.entries(methods).every(([methodName, field]) => {
    const next = actual[methodName]; return next !== undefined && next.value === field.value && next.get === field.get && next.set === field.set && next.writable === field.writable && next.enumerable === field.enumerable && next.configurable === field.configurable; }));
}
