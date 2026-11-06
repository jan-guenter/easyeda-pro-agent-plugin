/** Separate inverse event cursor. It shares only the fixed seven-source
 * bootstrap algorithm, not a saved reader controller, origin or purpose.
 * Browser/page attachments must name the same suspended original target. */
import { types } from "node:util";
import { CurrentPcbViaSavedLoadBootstrap } from "./current-pcb-via-saved-load-bootstrap.ts";
import type { CurrentPcbViaSavedLoadBootstrapEvent, CurrentPcbViaSavedLoadBootstrapResult, CurrentPcbViaSavedLoadProjectSourceHeld } from "./current-pcb-via-saved-load-bootstrap.ts";
import type { CurrentPcbViaSavedLoadBootstrapCommand } from "./current-pcb-via-saved-load-bootstrap-protocol.ts";
import type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";
import { isCurrentPcb209BootstrapTargetUrl } from "./current-pcb-209-worker-bootstrap-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export interface CurrentFootprintInverseWorkerPair {
  readonly targetId: string; readonly url: string; readonly title: string; readonly browserSessionId: string; readonly pageSessionId: string;
}
export interface CurrentFootprintInverseWorkerControllerBindings {
  readonly parentSessionId: string; readonly projectUuid: string; readonly windowTabId: string;
  readonly bindWorker: (pair: CurrentFootprintInverseWorkerPair) => Promise<void>;
  readonly request: (command: CurrentPcbViaSavedLoadBootstrapCommand) => Promise<unknown>;
  readonly poll: () => Promise<void>; readonly assertCurrent: () => Promise<void>;
  readonly projectSourceHeld: (source: CurrentPcbViaSavedLoadProjectSourceHeld, controller: CurrentFootprintInverseWorkerController) => Promise<void>;
  readonly fail: () => void;
}
export type CurrentFootprintInverseWorkerHeld = Omit<CurrentPcbViaSavedLoadBootstrapResult, "schema"> & Readonly<{ schema: "private.current-footprint-inverse-worker-held.v1" }>;
function need(value: boolean): asserts value { if (!value) { throw new Error("FOOTPRINT_INVERSE_WORKER_CURSOR"); } }
function token(value: unknown): value is string { return typeof value === "string" && /^[A-Za-z\d_.:-]{1,128}$/u.test(value); }
function record(value: unknown): value is Record<string, unknown> { return value !== null && typeof value === "object" && !Array.isArray(value) && !types.isProxy(value); }
type Attachment = Readonly<{ targetId: string; sessionId: string; url: string; title: string }>;
export class CurrentFootprintInverseWorkerController {
  readonly #bindings: CurrentFootprintInverseWorkerControllerBindings;
  readonly #completion = Promise.withResolvers<CurrentFootprintInverseWorkerHeld | null>();
  readonly #events: CurrentPcbViaSavedLoadBootstrapEvent[] = [];
  #browser: Attachment | null = null; #page: Attachment | null = null; #pair: CurrentFootprintInverseWorkerPair | null = null;
  #work: Promise<CurrentFootprintInverseWorkerHeld> | null = null; #result: CurrentFootprintInverseWorkerHeld | null = null;
  #source: CurrentPcbViaSavedLoadProjectSourceHeld | null = null; #failed = false; #reading = false; #eventCount = 0; #networkEvents = 0; #pumping = false;
  public constructor(bindings: CurrentFootprintInverseWorkerControllerBindings) {
    need(bindings !== null && typeof bindings === "object" && !types.isProxy(bindings) && Object.getPrototypeOf(bindings) === Object.prototype && Object.isFrozen(bindings));
    const fields = ["parentSessionId", "projectUuid", "windowTabId", "bindWorker", "request", "poll", "assertCurrent", "projectSourceHeld", "fail"];
    need(Reflect.ownKeys(bindings).length === fields.length);
    for (const [index, name] of fields.entries()) { const d = Object.getOwnPropertyDescriptor(bindings, name); need(d !== undefined && Object.hasOwn(d, "value") && typeof d.value === (index < 3 ? "string" : "function") && !types.isProxy(d.value)); }
    need(token(bindings.parentSessionId) && token(bindings.windowTabId) && /^[a-f\d]{64}$/u.test(bindings.projectUuid)); this.#bindings = bindings; Object.freeze(this);
  }
  public fail(): void { if (!this.#failed) { this.#failed = true; this.#completion.resolve(null); this.#bindings.fail(); } }
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
      need(this.#events.length < 128); this.#events.push(freezeDeep(structuredClone({ method: event.method, sessionId: event.sessionId, params: event.params })));
    } catch (caughtError) { this.fail(); throw caughtError; }
  }
  async #current(): Promise<void> { need(!this.#failed); await this.#bindings.assertCurrent(); need(!this.#failed); }
  async #next(): Promise<CurrentPcbViaSavedLoadBootstrapEvent> {
    need(!this.#reading); this.#reading = true; const started = performance.now();
    try { for (;;) { await this.#current(); need(performance.now() - started < 30_000); const event = this.#events.shift(); if (event !== undefined) { return event; } await this.#bindings.poll(); } }
    catch (caughtError) { this.fail(); throw caughtError; } finally { this.#reading = false; }
  }
  public requireHeld(source: CurrentPcbViaSavedLoadProjectSourceHeld): CurrentFootprintInverseWorkerPair {
    need(this.#source === source && this.#pair !== null && !this.#failed); return this.#pair;
  }
  /** The original work Promise is retained, including rejection. This stops at
   * the actual project's source pause; no final resume exists in this grammar. */
  public observeProjectSourceHeld(): Promise<CurrentFootprintInverseWorkerHeld> {
    if (this.#work !== null) { return this.#work; }
    const work = (async (): Promise<CurrentFootprintInverseWorkerHeld> => {
      try {
        const started = performance.now(); while (this.#browser === null || this.#page === null) { await this.#current(); need(performance.now() - started < 30_000); await this.#bindings.poll(); }
        const pair = freezeDeep({ targetId: this.#page.targetId, url: this.#page.url, title: this.#page.title, browserSessionId: this.#browser.sessionId, pageSessionId: this.#page.sessionId }); this.#pair = pair;
        await this.#bindings.bindWorker(pair); await this.#current();
        const runner = new CurrentPcbViaSavedLoadBootstrap(Object.freeze({ sessionId: pair.pageSessionId, targetId: pair.targetId, targetUrl: pair.url, targetTitle: pair.title,
          expectedWindowTabId: this.#bindings.windowTabId, projectUuid: this.#bindings.projectUuid, request: async (command: CurrentPcbViaSavedLoadBootstrapCommand): Promise<unknown> => {
            await this.#current(); const reply = await this.#bindings.request(command); await this.#current(); return reply;
          }, nextEvent: () => this.#next(), assertCurrent: () => this.#current(), projectSourceHeld: async (source: CurrentPcbViaSavedLoadProjectSourceHeld): Promise<void> => {
            need(this.#source === null); this.#source = source; await this.#bindings.projectSourceHeld(source, this); await this.#current();
          }, fail: (): void => { this.fail(); } }));
        const scoped = await runner.observe(); await this.#current(); need(this.#result === null);
        const result = freezeDeep({ ...scoped, schema: "private.current-footprint-inverse-worker-held.v1" as const }); this.#result = result; this.#completion.resolve(result); return result;
      } catch (caughtError) { this.fail(); throw caughtError; }
    })(); this.#work = work; return work;
  }
  public async whenSourceHeld(): Promise<CurrentFootprintInverseWorkerHeld> { const result = await this.#completion.promise; need(result !== null && !this.#failed); return result; }
  public async pump(): Promise<void> {
    need(!this.#failed); if (this.#browser === null || this.#page === null || this.#result !== null || this.#pumping) { return; }
    this.#pumping = true; try { await this.observeProjectSourceHeld(); } finally { this.#pumping = false; }
  }
  public status(): Readonly<{ pumping: boolean; failed: boolean; pairJoined: boolean; projectSourceHeld: boolean; sourceCallbackSettled: boolean; projectExecutionAuthorized: false }> {
    return Object.freeze({ pumping: this.#pumping, failed: this.#failed, pairJoined: this.#pair !== null, projectSourceHeld: this.#source !== null, sourceCallbackSettled: this.#result !== null, projectExecutionAuthorized: false });
  }
}
