/** Original-event cursor for one fresh Via worker. Structural transports prove
 * no ownership; only the actual central owner's held-source callback can issue
 * its private native origin. No debugger continuation is attempted on failure. */
import { performance } from "node:perf_hooks";
import { types } from "node:util";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { CURRENT_PCB_VIA_SAVE_SITES } from "./current-pcb-via-save-source.ts";
import type { CurrentPcbViaSaveSite } from "./current-pcb-via-save-source.ts";
import { isCurrentPcb209BootstrapTargetUrl } from "./current-pcb-209-worker-bootstrap-source.ts";
import { CurrentPcbViaWorkerBootstrap } from "./current-pcb-via-worker-bootstrap.ts";
import type { CurrentPcbViaProjectSourceHeld, CurrentPcbViaWorkerBootstrapEvent, CurrentPcbViaWorkerBootstrapResult } from "./current-pcb-via-worker-bootstrap.ts";
import type { CurrentPcbViaWorkerBootstrapCommand } from "./current-pcb-via-worker-bootstrap-protocol.ts";
import type { CurrentPcbViaWorkerCommand } from "./current-pcb-via-worker-wire.ts";
import type { CurrentPcbViaSaveWorkerEvent } from "./current-pcb-via-save-origin.ts";
import type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";

export interface CurrentPcbViaWorkerChild { readonly sessionId: string; readonly targetId: string; readonly url: string; readonly title: string }
export interface CurrentPcbViaWorkerControllerBindings {
  readonly parentSessionId: string; readonly projectUuid: string; readonly windowTabId: string;
  readonly existingWorkers: readonly Readonly<{ targetId: string; url: string; title: string }>[];
  readonly bindWorker: (worker: CurrentPcbViaWorkerChild) => Promise<void>;
  readonly request: (command: CurrentPcbViaWorkerCommand, cleanup: boolean) => Promise<unknown>;
  readonly poll: () => Promise<void>;
  readonly assertCurrent: () => Promise<void>;
  readonly projectSourceHeld: (source: CurrentPcbViaProjectSourceHeld, controller: CurrentPcbViaWorkerController) => Promise<void>;
  readonly releaseParentWait: () => Promise<void>;
  readonly fail: () => void;
}
function need(value: boolean): asserts value { if (!value) { throw new Error("PCB_VIA_WORKER_CURSOR"); } }
function token(value: unknown): value is string { return typeof value === "string" && /^[A-Za-z\d_.:-]{1,256}$/u.test(value); }
function record(value: unknown): value is Record<string, unknown> { return value !== null && typeof value === "object" && !Array.isArray(value) && !types.isProxy(value); }
export class CurrentPcbViaWorkerController {
  readonly #bindings: CurrentPcbViaWorkerControllerBindings;
  readonly #events: CurrentPcbViaWorkerBootstrapEvent[] = [];
  readonly #savePoints = new Map<CurrentPcbViaSaveSite, string>();
  readonly #background = new Set<string>();
  #child: CurrentPcbViaWorkerChild | null = null;
  #runner: CurrentPcbViaWorkerBootstrap | null = null;
  #source: CurrentPcbViaProjectSourceHeld | null = null;
  #result: CurrentPcbViaWorkerBootstrapResult | null = null;
  #work: Promise<void> | null = null;
  #pumping = false; #reading = false; #failed = false; #parentRunning = false; #loaded = false; #eventCount = 0;
  public constructor(bindings: CurrentPcbViaWorkerControllerBindings) {
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
  public fail(): void { this.#failed = true; this.#bindings.fail(); }
  /** Private original object identity, also usable for historical retirement. */
  public requireHeld(source: CurrentPcbViaProjectSourceHeld): CurrentPcbViaWorkerChild {
    need(this.#source === source && this.#child !== null && this.#runner !== null); return this.#child;
  }
  public requireOriginal(source: CurrentPcbViaProjectSourceHeld, child: CurrentPcbViaWorkerChild): void {
    need(this.#source === source && this.#child === child && this.#runner !== null);
  }
  public bindSaveBreakpoint(source: CurrentPcbViaProjectSourceHeld, role: CurrentPcbViaSaveSite, breakpointId: string): void {
    need(this.#source === source && this.#result === null && !this.#savePoints.has(role) && ![...this.#savePoints.values()].includes(breakpointId) && token(breakpointId));
    this.#savePoints.set(role, breakpointId);
  }
  #resolution(event: CurrentPcbViaWorkerBootstrapEvent): boolean {
    if (event.method !== "Debugger.breakpointResolved") { return false; }
    need(this.#source !== null && record(event.params) && record(event.params["location"]));
    const location = event.params["location"], params = event.params;
    const match = [...this.#savePoints].find(([_role, id]) => id === params["breakpointId"]); need(match !== undefined);
    const site = CURRENT_PCB_VIA_SAVE_SITES[match[0]];
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
    if (typeof event.sessionId === "string" && this.#background.has(event.sessionId)) { return; }
    need(this.#child !== null && event.sessionId === this.#child.sessionId && this.#events.length < 256);
    this.#events.push(freezeDeep(structuredClone({ method: event.method, sessionId: event.sessionId, params: event.params })));
  }
  async #current(): Promise<void> { need(!this.#failed); await this.#bindings.assertCurrent(); need(!this.#failed); }
  /** One retained finite read, without racing or abandoning a native poll. */
  async #next(): Promise<CurrentPcbViaWorkerBootstrapEvent> {
    need(!this.#reading); this.#reading = true; const started = performance.now();
    try {
      for (;;) {
        await this.#current(); need(performance.now() - started < 30_000);
        const event = this.#events.shift(); if (event === undefined) { await this.#bindings.poll(); await this.#current(); }
        else if (!this.#resolution(event)) { return event; }
      }
    } catch (error) { this.fail(); throw error; } finally { this.#reading = false; }
  }
  public async nextSaveEvent(): Promise<CurrentPcbViaSaveWorkerEvent> {
    need(this.#result !== null && !this.#pumping && this.#child !== null);
    for (let count = 0; count < 128; count += 1) {
      const event = await this.#next();
      if (event.method === "Debugger.paused" || event.method === "Debugger.resumed") { return { method: event.method, sessionId: event.sessionId, params: event.params }; }
      need(record(event.params));
      if (event.method === "Inspector.workerScriptLoaded") { need(!this.#loaded && Reflect.ownKeys(event.params).length === 0); this.#loaded = true; }
      else if (event.method === "Debugger.scriptParsed") { need(event.params["url"] === "" && event.params["executionContextId"] === this.#source?.executionContextId); }
      else if (event.method === "Runtime.consoleAPICalled") { need(event.params["executionContextId"] === this.#source?.executionContextId); }
      else { this.fail(); throw new Error("PCB_VIA_WORKER_UNEXPECTED_EVENT"); }
    }
    this.fail(); throw new Error("PCB_VIA_WORKER_EVENT_CAPACITY");
  }
  async #start(): Promise<void> {
    const child = this.#child; need(child !== null && this.#runner === null);
    await this.#current(); await this.#bindings.bindWorker(child); await this.#current();
    const runner = new CurrentPcbViaWorkerBootstrap(Object.freeze({ sessionId: child.sessionId, targetId: child.targetId, targetUrl: child.url, targetTitle: child.title,
      expectedWindowTabId: this.#bindings.windowTabId, projectUuid: this.#bindings.projectUuid,
      request: (command: CurrentPcbViaWorkerBootstrapCommand, cleanup: boolean): Promise<unknown> => this.#bindings.request(command, cleanup), nextEvent: (): Promise<CurrentPcbViaWorkerBootstrapEvent> => this.#next(),
      assertCurrent: (): Promise<void> => this.#current(), projectSourceHeld: async (source: CurrentPcbViaProjectSourceHeld): Promise<void> => {
        need(this.#runner === runner && this.#source === null); this.#source = source; await this.#bindings.projectSourceHeld(source, this); await this.#current(); need(this.#savePoints.size === 6);
      }, releaseParentWait: async (): Promise<void> => { need(!this.#parentRunning); this.#parentRunning = true; await this.#bindings.releaseParentWait(); await this.#current(); },
      fail: (): void => { this.fail(); } }));
    this.#runner = runner; const result = await runner.observe(); await this.#current();
    need(this.#runner === runner && result.sessionId === child.sessionId && this.#source !== null && result.scriptId === this.#source.scriptId &&
      result.uniqueContextId === this.#source.uniqueContextId); this.#result = result;
  }
  /** The outer original renderer call drives this, including its still-pending
   * project-open Promise. Nested observer transfers never start a second pump. */
  public async pump(): Promise<void> {
    need(!this.#failed); if (this.#child === null || this.#result !== null || this.#pumping) { return; }
    this.#pumping = true;
    try { this.#work ??= this.#start(); await this.#work; } catch (error) { this.fail(); throw error; } finally { this.#pumping = false; }
  }
}
