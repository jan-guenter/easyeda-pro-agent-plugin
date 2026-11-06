/** A separate original-event cursor for the fresh readonly worker. Browser and
 * page attachments must name the same suspended target before either can run. */
import { types } from "node:util";
import { CurrentPcbViaSavedLoadBootstrap } from "./current-pcb-via-saved-load-bootstrap.ts";
import type { CurrentPcbViaSavedLoadBootstrapEvent, CurrentPcbViaSavedLoadBootstrapResult, CurrentPcbViaSavedLoadProjectSourceHeld } from "./current-pcb-via-saved-load-bootstrap.ts";
import type { CurrentPcbViaSavedLoadWorkerCommand } from "./current-pcb-via-saved-load-worker-wire.ts";
import { CURRENT_PCB_VIA_SAVED_LOAD_ROLES as ROLES, CURRENT_PCB_VIA_SAVED_LOAD_SITES as SITES } from "./current-pcb-via-saved-load-source.ts";
import type { CurrentPcbViaSavedLoadRole } from "./current-pcb-via-saved-load-source.ts";
import type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";
import { isCurrentPcb209BootstrapTargetUrl } from "./current-pcb-209-worker-bootstrap-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export interface CurrentPcbViaSavedLoadWorkerPair {
  readonly targetId: string; readonly url: string; readonly title: string; readonly browserSessionId: string; readonly pageSessionId: string;
}
export interface CurrentPcbViaSavedLoadControllerBindings {
  readonly parentSessionId: string; readonly projectUuid: string; readonly windowTabId: string;
  readonly bindWorker: (pair: CurrentPcbViaSavedLoadWorkerPair) => Promise<void>;
  readonly request: (command: CurrentPcbViaSavedLoadWorkerCommand) => Promise<unknown>;
  readonly poll: () => Promise<void>; readonly assertCurrent: () => Promise<void>;
  readonly projectSourceHeld: (source: CurrentPcbViaSavedLoadProjectSourceHeld, controller: CurrentPcbViaSavedLoadController) => Promise<void>;
  readonly fail: () => void;
}
function need(value: boolean): asserts value { if (!value) { throw new Error("SAVED_READBACK_LOAD_CURSOR"); } }
function token(value: unknown): value is string { return typeof value === "string" && /^[A-Za-z\d_.:-]{1,128}$/u.test(value); }
function record(value: unknown): value is Record<string, unknown> { return value !== null && typeof value === "object" && !Array.isArray(value) && !types.isProxy(value); }
type Attachment = Readonly<{ targetId: string; sessionId: string; url: string; title: string }>;
export class CurrentPcbViaSavedLoadController {
  readonly #bindings: CurrentPcbViaSavedLoadControllerBindings;
  readonly #events: CurrentPcbViaSavedLoadBootstrapEvent[] = [];
  readonly #points = new Map<CurrentPcbViaSavedLoadRole, string>(); readonly #resolved = new Set<string>(); readonly #pauseCounts = new Map<CurrentPcbViaSavedLoadRole, number>();
  #helper: { readonly expected: string; scriptId: string | null } | null = null; readonly #helperScripts = new Set<string>();
  #started = false; #starting = false; #resumeRole: CurrentPcbViaSavedLoadRole | null = null; #currentRole: CurrentPcbViaSavedLoadRole | null = null;
  readonly #sourceStarted = Promise.withResolvers<boolean>();
  #browser: Attachment | null = null; #page: Attachment | null = null; #pair: CurrentPcbViaSavedLoadWorkerPair | null = null;
  #work: Promise<CurrentPcbViaSavedLoadBootstrapResult> | null = null; #result: CurrentPcbViaSavedLoadBootstrapResult | null = null;
  #source: CurrentPcbViaSavedLoadProjectSourceHeld | null = null; #failed = false; #reading = false; #eventCount = 0; #networkEvents = 0;
  public constructor(bindings: CurrentPcbViaSavedLoadControllerBindings) {
    need(bindings !== null && typeof bindings === "object" && !types.isProxy(bindings) && Object.getPrototypeOf(bindings) === Object.prototype && Object.isFrozen(bindings));
    const fields = ["parentSessionId", "projectUuid", "windowTabId", "bindWorker", "request", "poll", "assertCurrent", "projectSourceHeld", "fail"];
    need(Reflect.ownKeys(bindings).length === fields.length);
    for (const [index, name] of fields.entries()) { const d = Object.getOwnPropertyDescriptor(bindings, name); need(d !== undefined && Object.hasOwn(d, "value") && typeof d.value === (index < 3 ? "string" : "function") && !types.isProxy(d.value)); }
    need(token(bindings.parentSessionId) && token(bindings.windowTabId) && /^[a-f\d]{64}$/u.test(bindings.projectUuid)); this.#bindings = bindings; Object.freeze(this);
  }
  public fail(): void { if (!this.#failed) { this.#failed = true; this.#sourceStarted.resolve(false); this.#bindings.fail(); } }
  #attach(event: DiagnosticEvent): void {
    const params = event.params, sessionId = params["sessionId"], target = params["targetInfo"];
    need((event.sessionId === undefined || event.sessionId === this.#bindings.parentSessionId) && Reflect.ownKeys(params).length === 3 && record(target) &&
      target["type"] === "worker" && target["attached"] === true && token(target["targetId"]) && token(sessionId) && sessionId !== this.#bindings.parentSessionId &&
      params["waitingForDebugger"] === true && typeof target["url"] === "string" && isCurrentPcb209BootstrapTargetUrl(target["url"]) && target["url"].endsWith("&debugOpen=0") &&
      target["title"] === `project_${this.#bindings.projectUuid}_${this.#bindings.windowTabId}`);
    const attachment = Object.freeze({ targetId: target["targetId"], sessionId, url: target["url"], title: target["title"] });
    if (event.sessionId === undefined) { need(this.#browser === null); this.#browser = attachment; } else { need(this.#page === null); this.#page = attachment; }
    if (this.#browser !== null && this.#page !== null) { need(this.#browser.targetId === this.#page.targetId && this.#browser.url === this.#page.url && this.#browser.title === this.#page.title && this.#browser.sessionId !== this.#page.sessionId); }
  }
  /** Network notifications carry no authority and are never retained. The
   * fixed policy acknowledgments and later original source/body joins matter. */
  public observeEvent(event: DiagnosticEvent): void {
    try {
      this.#eventCount += 1; need(!this.#failed && this.#eventCount <= 1024);
      if (event.method === "Target.attachedToTarget") { this.#attach(event); return; }
      need(this.#page !== null && event.sessionId === this.#page.sessionId);
      if (["Network.requestWillBeSent", "Network.requestWillBeSentExtraInfo", "Network.responseReceived", "Network.responseReceivedExtraInfo", "Network.loadingFinished", "Network.loadingFailed", "Network.dataReceived", "Network.requestServedFromCache", "Network.resourceChangedPriority"].includes(event.method)) {
        this.#networkEvents += 1; need(this.#networkEvents <= 512); return;
      }
      if (this.#source !== null && event.method === "Debugger.scriptParsed") {
        const helper = this.#helper, p = event.params;
        need(helper !== null && helper.scriptId === null && p["url"] === "" && p["executionContextId"] === this.#source.executionContextId && p["hasSourceURL"] !== true && p["isLiveEdit"] !== true && token(p["scriptId"]) && !this.#helperScripts.has(p["scriptId"]) && p["scriptId"] !== this.#source.scriptId);
        helper.scriptId = p["scriptId"]; this.#helperScripts.add(p["scriptId"]); return;
      }
      if (this.#source !== null && event.method === "Debugger.breakpointResolved") {
        const p = event.params; const at = p["location"], role = ROLES.find(item => this.#points.get(item) === p["breakpointId"]);
        need(role !== undefined && record(at) && Reflect.ownKeys(p).length === 2 && Reflect.ownKeys(at).length === 3 && at["scriptId"] === this.#source.scriptId && at["lineNumber"] === SITES[role].lineNumber && at["columnNumber"] === SITES[role].columnNumber && typeof p["breakpointId"] === "string" && !this.#resolved.has(p["breakpointId"])); this.#resolved.add(p["breakpointId"]); return;
      }
      if ((this.#started || this.#starting) && event.method === "Debugger.paused") {
        const hits = event.params["hitBreakpoints"]; need(Array.isArray(hits) && hits.length === 1); const role = ROLES.find(item => this.#points.get(item) === hits[0]);
        need(role !== undefined && SITES[role].count > 0 && (this.#pauseCounts.get(role) ?? 0) < SITES[role].count); this.#pauseCounts.set(role, (this.#pauseCounts.get(role) ?? 0) + 1);
      }
      need(this.#events.length < 128); this.#events.push(freezeDeep(structuredClone({ method: event.method, sessionId: event.sessionId, params: event.params })));
    } catch (caughtError) { this.fail(); throw caughtError; }
  }
  async #current(): Promise<void> { need(!this.#failed); await this.#bindings.assertCurrent(); need(!this.#failed); }
  async #next(): Promise<CurrentPcbViaSavedLoadBootstrapEvent> {
    need(!this.#reading); this.#reading = true; const started = performance.now();
    try { for (;;) { await this.#current(); need(performance.now() - started < 30_000); const event = this.#events.shift(); if (event !== undefined) { return event; } await this.#bindings.poll(); } }
    catch (caughtError) { this.fail(); throw caughtError; } finally { this.#reading = false; }
  }
  public expectHelper(source: string): void { need(!this.#failed && this.#source !== null && this.#helper === null); this.#helper = { expected: source, scriptId: null }; }
  public async consumeHelper(source: string): Promise<void> {
    const helper = this.#helper; need(helper !== null && helper.expected === source && this.#source !== null); const started = performance.now();
    while (helper.scriptId === null) { await this.#current(); need(performance.now() - started < 30_000 && this.#helper === helper); await this.#bindings.poll(); }
    const scriptId = helper.scriptId; const result = await this.#bindings.request({ phase: "saved-observe-helper", method: "Debugger.getScriptSource", params: { scriptId } });
    await this.#current(); need(this.#helper === helper && record(result) && Reflect.ownKeys(result).length === 1 && result["scriptSource"] === source); this.#helper = null;
  }
  public registerPoint(role: CurrentPcbViaSavedLoadRole, breakpointId: string): void {
    need(this.#source !== null && !this.#started && !this.#points.has(role) && ![...this.#points.values()].includes(breakpointId) && token(breakpointId)); this.#points.set(role, breakpointId);
  }
  public async startProjectSource(): Promise<void> {
    need(!this.#started && !this.#starting && this.#result !== null && this.#source !== null && this.#points.size === ROLES.length && this.#helper === null); this.#starting = true;
    try {
      const reply = await this.#bindings.request({ phase: "saved-observe-start-project", method: "Debugger.resume", params: {} }); await this.#current(); need(record(reply) && Reflect.ownKeys(reply).length === 0);
      const event = await this.#next(); need(event.method === "Debugger.resumed" && record(event.params) && Reflect.ownKeys(event.params).length === 0); this.#started = true; this.#sourceStarted.resolve(true);
    } catch (caughtError) { this.fail(); throw caughtError; } finally { this.#starting = false; }
  }
  public async whenProjectStarted(): Promise<void> { need(await this.#sourceStarted.promise && this.#started && !this.#failed); }
  public async nextObservationEvent(): Promise<DiagnosticEvent> {
    await this.whenProjectStarted();
    for (let count = 0; count < 128; count += 1) {
      const event = await this.#next(); need(record(event.params));
      if (event.method === "Debugger.paused") { need(this.#currentRole === null && this.#resumeRole === null); const hits = event.params["hitBreakpoints"]; need(Array.isArray(hits) && hits.length === 1); const role = ROLES.find(item => this.#points.get(item) === hits[0]); need(role !== undefined && SITES[role].count > 0); this.#currentRole = role; return { method: event.method, sessionId: event.sessionId, params: event.params }; }
      if (event.method === "Debugger.resumed") { need(this.#currentRole !== null && this.#resumeRole === this.#currentRole && Reflect.ownKeys(event.params).length === 0); this.#currentRole = null; this.#resumeRole = null; return { method: event.method, sessionId: event.sessionId, params: event.params }; }
      if (event.method === "Inspector.workerScriptLoaded") { need(Reflect.ownKeys(event.params).length === 0); }
      else if (event.method === "Runtime.consoleAPICalled") { need(event.params["executionContextId"] === this.#source?.executionContextId); }
      else { throw new Error("SAVED_READBACK_LOAD_UNEXPECTED_EVENT"); }
    }
    this.fail(); throw new Error("SAVED_READBACK_LOAD_EVENT_BOUND");
  }
  public reserveResume(role: CurrentPcbViaSavedLoadRole): void { need(this.#started && this.#currentRole === role && this.#resumeRole === null); this.#resumeRole = role; }
  public requireHeld(source: CurrentPcbViaSavedLoadProjectSourceHeld): CurrentPcbViaSavedLoadWorkerPair {
    need(this.#source === source && this.#pair !== null && !this.#failed && !this.#starting && !this.#started); return this.#pair;
  }
  /** The original work Promise is retained, including rejection. This stops at
   * the actual project's source pause. A separate once-only loading transition
   * requires all fixed observer points before that pause can be resumed. */
  public observeProjectSourceHeld(): Promise<CurrentPcbViaSavedLoadBootstrapResult> {
    if (this.#work !== null) { return this.#work; }
    const work = (async (): Promise<CurrentPcbViaSavedLoadBootstrapResult> => {
      try {
        const started = performance.now(); while (this.#browser === null || this.#page === null) { await this.#current(); need(performance.now() - started < 30_000); await this.#bindings.poll(); }
        const pair = freezeDeep({ targetId: this.#page.targetId, url: this.#page.url, title: this.#page.title, browserSessionId: this.#browser.sessionId, pageSessionId: this.#page.sessionId }); this.#pair = pair;
        await this.#bindings.bindWorker(pair); await this.#current();
        const runner = new CurrentPcbViaSavedLoadBootstrap(Object.freeze({ sessionId: pair.pageSessionId, targetId: pair.targetId, targetUrl: pair.url, targetTitle: pair.title,
          expectedWindowTabId: this.#bindings.windowTabId, projectUuid: this.#bindings.projectUuid, request: async (command: CurrentPcbViaSavedLoadWorkerCommand): Promise<unknown> => {
            await this.#current(); const reply = await this.#bindings.request(command); await this.#current(); return reply;
          }, nextEvent: () => this.#next(), assertCurrent: () => this.#current(), projectSourceHeld: async (source: CurrentPcbViaSavedLoadProjectSourceHeld): Promise<void> => {
            need(this.#source === null); this.#source = source; await this.#bindings.projectSourceHeld(source, this); await this.#current();
          }, fail: (): void => { this.fail(); } }));
        const result = await runner.observe(); await this.#current(); need(this.#result === null); this.#result = result; return result;
      } catch (caughtError) { this.fail(); throw caughtError; }
    })(); this.#work = work; return work;
  }
  public status(): Readonly<{ failed: boolean; pairJoined: boolean; projectSourceHeld: boolean; sourceCallbackSettled: boolean; projectExecutionAuthorized: false }> {
    return Object.freeze({ failed: this.#failed, pairJoined: this.#pair !== null, projectSourceHeld: this.#source !== null, sourceCallbackSettled: this.#result !== null, projectExecutionAuthorized: false });
  }
}
