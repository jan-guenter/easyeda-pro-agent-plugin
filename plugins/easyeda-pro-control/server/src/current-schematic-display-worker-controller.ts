/** Original-event cursor for one fresh schematic worker. Structural transports prove
 * no ownership; only the actual central owner's held-source callback can issue
 * its private native origin. No debugger continuation is attempted on failure. */
import { CurrentSchematicDisplayEventRouter } from "./current-schematic-display-event-router.ts";
import type { CurrentSchematicDisplayEventPoint, CurrentSchematicDisplayRoutedEvent } from "./current-schematic-display-event-router.ts";
import { CURRENT_PROJECT_SAVE_STRUCTURE_SITES as STRUCTURE_SITES } from "./current-project-save-structure-protocol.ts";
import type { CurrentProjectSaveStructureCommand } from "./current-project-save-structure-protocol.ts";
import { performance } from "node:perf_hooks";
import { types } from "node:util";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { CURRENT_SCHEMATIC_DISPLAY_SAVE_SITES } from "./current-schematic-display-save-source.ts";
import type { CurrentSchematicDisplaySaveSite } from "./current-schematic-display-save-source.ts";
import { isCurrentPcb209BootstrapTargetUrl } from "./current-pcb-209-worker-bootstrap-source.ts";
import { CurrentSchematicDisplayWorkerBootstrap } from "./current-schematic-display-worker-bootstrap.ts";
import type { CurrentSchematicDisplayProjectSourceHeld, CurrentSchematicDisplayWorkerBootstrapEvent, CurrentSchematicDisplayWorkerBootstrapResult } from "./current-schematic-display-worker-bootstrap.ts";
import type { CurrentSchematicDisplayWorkerBootstrapCommand, CurrentSchematicDisplayWorkerCommand } from "./current-schematic-display-worker-wire.ts";
import type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";

export interface CurrentSchematicDisplayWorkerChild { readonly sessionId: string; readonly targetId: string; readonly url: string; readonly title: string }
export interface CurrentSchematicDisplayWorkerControllerBindings {
  readonly parentSessionId: string; readonly projectUuid: string; readonly windowTabId: string;
  readonly existingWorkers: readonly Readonly<{ targetId: string; url: string; title: string }>[];
  readonly bindWorker: (worker: CurrentSchematicDisplayWorkerChild) => Promise<void>;
  readonly request: (command: CurrentSchematicDisplayWorkerCommand, cleanup: boolean) => Promise<unknown>;
  readonly poll: () => Promise<void>;
  readonly assertCurrent: () => Promise<void>;
  readonly projectSourceHeld: (source: CurrentSchematicDisplayProjectSourceHeld, controller: CurrentSchematicDisplayWorkerController) => Promise<void>;
  readonly releaseParentWait: () => Promise<void>;
  readonly fail: () => void;
}
function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_DISPLAY_WORKER_CURSOR"); } }
function token(value: unknown): value is string { return typeof value === "string" && /^[A-Za-z\d_.:-]{1,256}$/u.test(value); }
function record(value: unknown): value is Record<string, unknown> { return value !== null && typeof value === "object" && !Array.isArray(value) && !types.isProxy(value); }
export class CurrentSchematicDisplayWorkerController {
  readonly #bindings: CurrentSchematicDisplayWorkerControllerBindings;
  readonly #events: CurrentSchematicDisplayWorkerBootstrapEvent[] = [];
  readonly #savePoints = new Map<CurrentSchematicDisplaySaveSite, string>();
  readonly #structurePoints = new Map<Extract<CurrentProjectSaveStructureCommand, { phase: "project-save-structure-arm" }>["role"], string>();
  readonly #background = new Set<string>();
  #child: CurrentSchematicDisplayWorkerChild | null = null;
  #runner: CurrentSchematicDisplayWorkerBootstrap | null = null;
  #router: CurrentSchematicDisplayEventRouter | null = null;
  #source: CurrentSchematicDisplayProjectSourceHeld | null = null;
  #result: CurrentSchematicDisplayWorkerBootstrapResult | null = null;
  #work: Promise<void> | null = null;
  readonly #sourceResumed = Promise.withResolvers<boolean>();
  #pumping = false; #reading = false; #failed = false; #parentRunning = false; #loaded = false; #eventCount = 0;
  public constructor(bindings: CurrentSchematicDisplayWorkerControllerBindings) {
    need(bindings !== null && typeof bindings === "object" && !types.isProxy(bindings) && Object.getPrototypeOf(bindings) === Object.prototype && Object.isFrozen(bindings));
    const fields = ["parentSessionId", "projectUuid", "windowTabId", "existingWorkers", "bindWorker", "request", "poll", "assertCurrent", "projectSourceHeld", "releaseParentWait", "fail"];
    need(Reflect.ownKeys(bindings).length === fields.length);
    for (const key of fields) { const field = Object.getOwnPropertyDescriptor(bindings, key); need(field !== undefined && Object.hasOwn(field, "value")); }
    need(token(bindings.parentSessionId) && /^[a-f\d]{64}$/u.test(bindings.projectUuid) && /^[A-Za-z\d_-]{1,128}$/u.test(bindings.windowTabId) &&
      Array.isArray(bindings.existingWorkers) && !types.isProxy(bindings.existingWorkers) && Object.isFrozen(bindings.existingWorkers) && bindings.existingWorkers.length <= 16 &&
      Reflect.ownKeys(bindings.existingWorkers).length === bindings.existingWorkers.length + 1);
    for (const key of fields.slice(4)) { const callback: unknown = Reflect.getOwnPropertyDescriptor(bindings, key)?.value; need(typeof callback === "function" && !types.isProxy(callback)); }
    const workerTargets = new Set<string>();
    for (let index = 0; index < bindings.existingWorkers.length; index += 1) {
      const own = Object.getOwnPropertyDescriptor(bindings.existingWorkers, String(index)); need(own !== undefined && Object.hasOwn(own, "value"));
      const worker: unknown = own.value; need(record(worker) && Object.getPrototypeOf(worker) === Object.prototype && Object.isFrozen(worker) && Reflect.ownKeys(worker).length === 3);
      for (const key of ["targetId", "url", "title"]) { const field = Object.getOwnPropertyDescriptor(worker, key); need(field !== undefined && Object.hasOwn(field, "value")); }
      need(token(worker["targetId"]) && typeof worker["url"] === "string" && worker["url"].length <= 4096 && typeof worker["title"] === "string" && worker["title"].length <= 512); workerTargets.add(worker["targetId"]);
    }
    need(workerTargets.size === bindings.existingWorkers.length);
    this.#bindings = bindings; Object.freeze(this);
  }
  public status(): Readonly<{ ready: boolean; pumping: boolean; failed: boolean; projectSourceHeld: boolean; originalWorkerSelected: boolean }> {
    return Object.freeze({ ready: this.#result !== null, pumping: this.#pumping, failed: this.#failed, projectSourceHeld: this.#source !== null, originalWorkerSelected: this.#child !== null });
  }
  public fail(): void { this.#failed = true; this.#sourceResumed.resolve(false); this.#bindings.fail(); }
  /** Private original object identity, also usable for historical retirement. */
  public requireHeld(source: CurrentSchematicDisplayProjectSourceHeld): CurrentSchematicDisplayWorkerChild {
    need(this.#source === source && this.#child !== null && this.#runner !== null); return this.#child;
  }
  public requireOriginal(source: CurrentSchematicDisplayProjectSourceHeld, child: CurrentSchematicDisplayWorkerChild): void {
    need(this.#source === source && this.#child === child && this.#runner !== null);
  }
  public bindSaveBreakpoint(source: CurrentSchematicDisplayProjectSourceHeld, role: CurrentSchematicDisplaySaveSite, breakpointId: string): void {
    need(this.#source === source && this.#result === null && !this.#savePoints.has(role) && ![...this.#savePoints.values()].includes(breakpointId) && token(breakpointId));
    this.#savePoints.set(role, breakpointId);
  }
  public bindStructureBreakpoint(source: CurrentSchematicDisplayProjectSourceHeld, role: Extract<CurrentProjectSaveStructureCommand, { phase: "project-save-structure-arm" }>["role"], breakpointId: string): void {
    need(this.#source === source && this.#result === null && !this.#structurePoints.has(role) && ![...this.#structurePoints.values(), ...this.#savePoints.values()].includes(breakpointId) && token(breakpointId));
    this.#structurePoints.set(role, breakpointId);
  }
  public requireStructureArmed(source: CurrentSchematicDisplayProjectSourceHeld): void { need(this.#source === source && this.#structurePoints.size === 14); }
  #resolution(event: CurrentSchematicDisplayWorkerBootstrapEvent): boolean {
    if (this.#result !== null) { return false; }
    if (event.method !== "Debugger.breakpointResolved") { return false; }
    need(this.#source !== null && record(event.params) && record(event.params["location"]));
    const location = event.params["location"], params = event.params;
    const match = [...this.#savePoints].find(([_role, id]) => id === params["breakpointId"]);
    const structure = [...this.#structurePoints].find(([_role, id]) => id === params["breakpointId"]); need(match !== undefined || structure !== undefined);
    const site = match === undefined ? STRUCTURE_SITES[structure?.[0] ?? "bootstrap"] : CURRENT_SCHEMATIC_DISPLAY_SAVE_SITES[match[0]];
    need(Reflect.ownKeys(params).length === 2 && Reflect.ownKeys(location).length === 3 && location["scriptId"] === this.#source.scriptId && location["lineNumber"] === site.lineNumber && location["columnNumber"] === site.columnNumber); return true;
  }
  public observeEvent(event: DiagnosticEvent): void {
    try { this.#accept(event); } catch (error) { this.fail(); throw error; }
  }
  #accept(event: DiagnosticEvent): void {
    this.#eventCount += 1; need(!this.#failed && this.#eventCount <= 4096);
    if (event.sessionId === this.#bindings.parentSessionId && event.method === "Target.attachedToTarget") {
      const params = event.params;
      const sessionId = params["sessionId"], target = params["targetInfo"];
      need(record(target) && target["type"] === "worker" && target["attached"] === true && token(target["targetId"]) && token(sessionId) &&
        typeof target["url"] === "string" && typeof target["title"] === "string" && typeof params["waitingForDebugger"] === "boolean");
      const expected = `project_${this.#bindings.projectUuid}_${this.#bindings.windowTabId}`;
      const existing = this.#bindings.existingWorkers.find(worker => worker.targetId === target["targetId"]);
      if (existing !== undefined) {
        need(!params["waitingForDebugger"] && target["title"] !== expected && !isCurrentPcb209BootstrapTargetUrl(target["url"]) &&
          (existing.url === "" && existing.title === "" || existing.url === target["url"] && existing.title === target["title"])); this.#background.add(sessionId); return;
      }
      if (this.#parentRunning && !params["waitingForDebugger"]) { need(target["title"] !== expected && !isCurrentPcb209BootstrapTargetUrl(target["url"])); this.#background.add(sessionId); return; }
      need(this.#child === null && params["waitingForDebugger"] && target["title"] === expected && isCurrentPcb209BootstrapTargetUrl(target["url"]));
      this.#child = freezeDeep({ sessionId, targetId: target["targetId"], url: target["url"], title: target["title"] }); return;
    }
    if (event.sessionId === this.#bindings.parentSessionId && this.#result !== null && ["Debugger.paused", "Debugger.resumed", "Debugger.breakpointResolved"].includes(event.method)) {
      need(this.#events.length < 256); this.#events.push(freezeDeep(structuredClone({ method: event.method, sessionId: event.sessionId, params: event.params }))); return;
    }
    if (typeof event.sessionId === "string" && this.#background.has(event.sessionId)) { return; }
    need(this.#child !== null && event.sessionId === this.#child.sessionId && this.#events.length < 256);
    this.#events.push(freezeDeep(structuredClone({ method: event.method, sessionId: event.sessionId, params: event.params })));
  }
  async #current(): Promise<void> { need(!this.#failed); await this.#bindings.assertCurrent(); need(!this.#failed); }
  /** One retained finite read, without racing or abandoning a native poll. */
  async #next(): Promise<CurrentSchematicDisplayWorkerBootstrapEvent> {
    need(!this.#reading); this.#reading = true; const started = performance.now();
    try {
      for (;;) {
        await this.#current(); need(performance.now() - started < 30_000);
        const event = this.#events.shift(); if (event === undefined) { await this.#bindings.poll(); await this.#current(); }
        else if (!this.#resolution(event)) { return event; }
      }
    } catch (error) { this.fail(); throw error; } finally { this.#reading = false; }
  }
  async #nextObservedEvent(): Promise<DiagnosticEvent> {
    need(this.#result !== null && !this.#pumping && this.#child !== null);
    for (let count = 0; count < 128; count += 1) {
      const event = await this.#next();
      if (event.method === "Debugger.paused" || event.method === "Debugger.resumed" || event.method === "Debugger.breakpointResolved") { need(record(event.params)); return { method: event.method, sessionId: event.sessionId, params: event.params }; }
      need(record(event.params));
      if (event.method === "Inspector.workerScriptLoaded") { need(!this.#loaded && Reflect.ownKeys(event.params).length === 0); this.#loaded = true; }
      else if (event.method === "Debugger.scriptParsed") { need(event.params["url"] === "" && event.params["executionContextId"] === this.#source?.executionContextId); }
      else if (event.method === "Runtime.consoleAPICalled") { need(event.params["executionContextId"] === this.#source?.executionContextId); }
      else { this.fail(); throw new Error("SCHEMATIC_DISPLAY_WORKER_UNEXPECTED_EVENT"); }
    }
    this.fail(); throw new Error("SCHEMATIC_DISPLAY_WORKER_EVENT_CAPACITY");
  }
  #eventRouter(): CurrentSchematicDisplayEventRouter {
    need(this.#router !== null && this.#result !== null && !this.#pumping); return this.#router;
  }
  public observeUiEvent(event: DiagnosticEvent): boolean {
    if (event.sessionId !== this.#bindings.parentSessionId || this.#result === null || !["Debugger.paused", "Debugger.resumed", "Debugger.breakpointResolved"].includes(event.method)) { return false; }
    this.observeEvent(event); return true;
  }
  /** Pure retained barrier. It never infers completion from elapsed time or
   * starts another native poll; the original abort/failure settles false. */
  public async whenOriginalSourceResumed(): Promise<void> { const resumed = await this.#sourceResumed.promise; need(resumed && !this.#failed && this.#result !== null && this.#router !== null); }
  public async nextStructureEvent(): Promise<CurrentSchematicDisplayRoutedEvent> { await this.whenOriginalSourceResumed(); return this.#eventRouter().next("structure"); }
  public reserveStructureResume(source: CurrentSchematicDisplayProjectSourceHeld, role: Extract<CurrentProjectSaveStructureCommand, { phase: "project-save-structure-resume" }>["role"]): void {
    need(this.#source === source && this.#child !== null); this.#eventRouter().reserveResume("structure", this.#child.sessionId, role);
  }
  public nextSaveEvent(): Promise<CurrentSchematicDisplayRoutedEvent> { return this.#eventRouter().next("save"); }
  public nextClockEvent(): Promise<CurrentSchematicDisplayRoutedEvent> { return this.#eventRouter().next("clock"); }
  public bindClockBreakpoint(source: CurrentSchematicDisplayProjectSourceHeld, point: CurrentSchematicDisplayEventPoint): void {
    need(this.#source === source); this.#eventRouter().register("clock", point);
  }
  public reserveSaveResume(source: CurrentSchematicDisplayProjectSourceHeld): void {
    need(this.#source === source && this.#child !== null); this.#eventRouter().reserveResume("save", this.#child.sessionId);
  }
  public reserveClockResume(source: CurrentSchematicDisplayProjectSourceHeld, realm: "worker" | "ui", role: string): void {
    need(this.#source === source && this.#child !== null); this.#eventRouter().reserveResume("clock", realm === "worker" ? this.#child.sessionId : this.#bindings.parentSessionId, role);
  }
  public requireClockCompletionWithHeldSaveBody(source: CurrentSchematicDisplayProjectSourceHeld): void {
    need(this.#source === source && this.#child !== null); this.requireOriginal(source, this.#child); this.#eventRouter().requireClockCompletionWithHeldSaveBody();
  }
  async #start(): Promise<void> {
    const child = this.#child; need(child !== null && this.#runner === null);
    await this.#current(); await this.#bindings.bindWorker(child); await this.#current();
    const runner = new CurrentSchematicDisplayWorkerBootstrap(Object.freeze({ sessionId: child.sessionId, targetId: child.targetId, targetUrl: child.url, targetTitle: child.title,
      expectedWindowTabId: this.#bindings.windowTabId, projectUuid: this.#bindings.projectUuid,
      request: (command: CurrentSchematicDisplayWorkerBootstrapCommand, cleanup: boolean): Promise<unknown> => this.#bindings.request(command, cleanup), nextEvent: (): Promise<CurrentSchematicDisplayWorkerBootstrapEvent> => this.#next(),
      assertCurrent: (): Promise<void> => this.#current(), projectSourceHeld: async (source: CurrentSchematicDisplayProjectSourceHeld): Promise<void> => {
        need(this.#runner === runner && this.#source === null); this.#source = source; await this.#bindings.projectSourceHeld(source, this); await this.#current(); need(this.#savePoints.size === 6);
      }, releaseParentWait: async (): Promise<void> => { need(!this.#parentRunning); this.#parentRunning = true; await this.#bindings.releaseParentWait(); await this.#current(); },
      fail: (): void => { this.fail(); } }));
    this.#runner = runner; const result = await runner.observe(); await this.#current();
    need(this.#runner === runner && result.sessionId === child.sessionId && this.#source !== null && result.scriptId === this.#source.scriptId &&
      result.uniqueContextId === this.#source.uniqueContextId); this.#result = result;
    const router = new CurrentSchematicDisplayEventRouter(Object.freeze({ workerSessionId: child.sessionId, uiSessionId: this.#bindings.parentSessionId,
      nextEvent: (): Promise<DiagnosticEvent> => this.#nextObservedEvent(), assertCurrent: (): Promise<void> => this.#current(), fail: (): void => { this.fail(); } }));
    for (const [role, breakpointId] of this.#savePoints) { const site = CURRENT_SCHEMATIC_DISPLAY_SAVE_SITES[role]; router.register("save", { sessionId: child.sessionId, scriptId: this.#source.scriptId, breakpointId, role, lineNumber: site.lineNumber, columnNumber: site.columnNumber }); }
    for (const [role, breakpointId] of this.#structurePoints) { const site = STRUCTURE_SITES[role]; router.register("structure", { sessionId: child.sessionId, scriptId: this.#source.scriptId, breakpointId, role, lineNumber: site.lineNumber, columnNumber: site.columnNumber }); }
    this.#router = router;
  }
  /** The outer original renderer call drives this, including its still-pending
   * project-open Promise. Nested observer transfers never start a second pump. */
  public async pump(): Promise<void> {
    need(!this.#failed); if (this.#child === null || this.#result !== null || this.#pumping) { return; }
    this.#pumping = true;
    try { this.#work ??= this.#start(); await this.#work; } catch (error) { this.fail(); throw error; } finally { this.#pumping = false; if (!this.#failed && this.#result !== null && this.#router !== null) { this.#sourceResumed.resolve(true); } }
  }
}
