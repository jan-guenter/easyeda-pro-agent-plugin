/** Separate inverse event cursor. It shares only the fixed seven-source
 * bootstrap algorithm, not a saved reader controller, origin or purpose.
 * Browser/page attachments must name the same suspended original target. */
import type { CurrentFootprintInverseProducerArmCommand } from "./current-footprint-inverse-producer-protocol.ts";
import type { CurrentProjectSaveStructureEvent } from "./current-project-save-structure-origin.ts";
import type { CurrentFootprintInverseConstructionCommand } from "./current-footprint-inverse-construction-protocol.ts";
import { CURRENT_PROJECT_SAVE_STRUCTURE_CONSTRUCTORS as CONSTRUCTORS, CURRENT_PROJECT_SAVE_STRUCTURE_SITES as SITES } from "./current-project-save-structure-protocol.ts";
import type { CurrentProjectSaveStructureSite } from "./current-project-save-structure-protocol.ts";
import { types } from "node:util";
import { CurrentPcbViaSavedLoadBootstrap } from "./current-pcb-via-saved-load-bootstrap.ts";
import type { CurrentPcbViaSavedLoadBootstrapResult, CurrentPcbViaSavedLoadProjectSourceHeld } from "./current-pcb-via-saved-load-bootstrap.ts";
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
  readonly constructionRequest: (command: CurrentFootprintInverseConstructionCommand, retainAllocationReply?: (reply: unknown) => void) => Promise<unknown>;
  readonly producerArmRequest: (command: CurrentFootprintInverseProducerArmCommand) => Promise<unknown>;
  readonly constructionHeld: (role: CurrentProjectSaveStructureSite, event: DiagnosticEvent) => Promise<void>;
  readonly fail: () => void;
}
export type CurrentFootprintInverseWorkerHeld = Omit<CurrentPcbViaSavedLoadBootstrapResult, "schema"> & Readonly<{ schema: "private.current-footprint-inverse-worker-held.v1" }>;
function need(value: boolean): asserts value { if (!value) { throw new Error("FOOTPRINT_INVERSE_WORKER_CURSOR"); } }
function token(value: unknown): value is string { return typeof value === "string" && /^[A-Za-z\d_.:-]{1,128}$/u.test(value); }
function record(value: unknown): value is Record<string, unknown> { return value !== null && typeof value === "object" && !Array.isArray(value) && !types.isProxy(value); }
type WorkerEvent = DiagnosticEvent & Readonly<{ sessionId: string }>;
type Attachment = Readonly<{ targetId: string; sessionId: string; url: string; title: string }>;
export class CurrentFootprintInverseWorkerController {
  readonly #bindings: CurrentFootprintInverseWorkerControllerBindings;
  readonly #completion = Promise.withResolvers<CurrentFootprintInverseWorkerHeld | null>();
  readonly #events: WorkerEvent[] = [];
  #browser: Attachment | null = null; #page: Attachment | null = null; #pair: CurrentFootprintInverseWorkerPair | null = null;
  #work: Promise<CurrentFootprintInverseWorkerHeld> | null = null; #result: CurrentFootprintInverseWorkerHeld | null = null;
  #constructionArming: CurrentProjectSaveStructureSite | null = null;
  readonly #constructionResolutions = new Map<string, CurrentProjectSaveStructureSite>();
  readonly #constructionPoints = new Map<CurrentProjectSaveStructureSite, string>();
  readonly #constructionRemoved = new Set<string>();
  #producerArming: Readonly<{ key: string; lineNumber: number; columnNumber: number }> | null = null;
  readonly #producerPoints = new Map<string, Readonly<{ id: string; lineNumber: number; columnNumber: number }>>();
  readonly #producerResolutions = new Map<string, string>();
  readonly #producerHelpers: { program: string; scriptId: string | null }[] = [];
  readonly #constructionHelpers: { program: string; scriptId: string | null }[] = [];
  #constructionWork: Readonly<{ run: () => Promise<void>; result: ReturnType<typeof Promise.withResolvers<boolean>> }> | null = null;
  #bootstrapSetupWork: Readonly<{ run: () => Promise<void>; result: ReturnType<typeof Promise.withResolvers<boolean>> }> | null = null;
  #bootstrapSetupAttempted = false;
  #constructionWorkAttempted = false; #constructionStartAttempted = false; #constructionStarted = false;
  #constructionHeld: CurrentProjectSaveStructureSite | null = null; #constructionResume: CurrentProjectSaveStructureSite | null = null;
  #source: CurrentPcbViaSavedLoadProjectSourceHeld | null = null; #failed = false; #reading = false; #eventCount = 0; #networkEvents = 0; #pumping = false;
  public constructor(bindings: CurrentFootprintInverseWorkerControllerBindings) {
    need(bindings !== null && typeof bindings === "object" && !types.isProxy(bindings) && Object.getPrototypeOf(bindings) === Object.prototype && Object.isFrozen(bindings));
    const fields = ["parentSessionId", "projectUuid", "windowTabId", "bindWorker", "request", "poll", "assertCurrent", "projectSourceHeld", "constructionRequest", "producerArmRequest", "constructionHeld", "fail"];
    need(Reflect.ownKeys(bindings).length === fields.length);
    for (const [index, name] of fields.entries()) { const d = Object.getOwnPropertyDescriptor(bindings, name); need(d !== undefined && Object.hasOwn(d, "value") && typeof d.value === (index < 3 ? "string" : "function") && !types.isProxy(d.value)); }
    need(token(bindings.parentSessionId) && token(bindings.windowTabId) && /^[a-f\d]{64}$/u.test(bindings.projectUuid)); this.#bindings = bindings; Object.freeze(this);
  }
  public fail(): void { if (!this.#failed) { this.#failed = true; this.#completion.resolve(null); const queued = this.#constructionWork; this.#constructionWork = null; queued?.result.reject(new Error("FOOTPRINT_INVERSE_WORKER_CURSOR")); const setup = this.#bootstrapSetupWork; this.#bootstrapSetupWork = null; setup?.result.reject(new Error("FOOTPRINT_INVERSE_WORKER_CURSOR")); this.#bindings.fail(); } }
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
      if (this.#source !== null && event.method === "Debugger.scriptParsed" && event.params["url"] === "") {
        const expected = [...this.#constructionHelpers,...this.#producerHelpers].find(value => value.scriptId === null);
        need(expected !== undefined && token(event.params["scriptId"]) && event.params["executionContextId"] === this.#source.executionContextId);
        expected.scriptId = event.params["scriptId"]; return;
      }
      if (this.#source !== null && event.method === "Debugger.breakpointResolved") {
        const producerId = event.params["breakpointId"]; const knownProducer = [...this.#producerPoints].find(([,point])=>point.id===producerId), producerLocation = event.params["location"];
        const producer = knownProducer === undefined ? this.#producerArming : {key:knownProducer[0],...knownProducer[1]};
        if(producer!==null && record(producerLocation) && producerLocation["scriptId"]===this.#source.scriptId && producerLocation["lineNumber"]===producer.lineNumber && producerLocation["columnNumber"]===producer.columnNumber){
          need(token(producerId));const prior=this.#producerResolutions.get(producerId);need(prior===undefined||prior===producer.key);this.#producerResolutions.set(producerId,producer.key);return;
        }
        const breakpointId = event.params["breakpointId"], known = [...this.#constructionPoints].find(([, id]) => id === breakpointId), location = event.params["location"], role = known?.[0] ?? this.#constructionArming;
        need(role !== null && role !== undefined && token(breakpointId) && record(location) && location["scriptId"] === this.#source.scriptId && location["lineNumber"] === SITES[role].lineNumber && location["columnNumber"] === SITES[role].columnNumber);
        const prior = this.#constructionResolutions.get(breakpointId); need(prior === undefined || prior === role); this.#constructionResolutions.set(breakpointId, role); return;
      }
      need(this.#events.length < 128); this.#events.push(freezeDeep(structuredClone({ method: event.method, sessionId: this.#page.sessionId, params: event.params })));
    } catch (caughtError) { this.fail(); throw caughtError; }
  }
  async #current(): Promise<void> { need(!this.#failed); await this.#bindings.assertCurrent(); need(!this.#failed); }
  async #next(): Promise<WorkerEvent> {
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
  public expectConstructionArm(source: CurrentPcbViaSavedLoadProjectSourceHeld, role: CurrentProjectSaveStructureSite): void { this.requireHeld(source); need(this.#constructionArming === null && !this.#constructionPoints.has(role)); this.#constructionArming = role; }
  public registerConstructionPoint(source: CurrentPcbViaSavedLoadProjectSourceHeld, role: CurrentProjectSaveStructureSite, id: string): void {
    this.requireHeld(source); need(!this.#constructionStarted && !this.#constructionPoints.has(role) && token(id) && ![...this.#constructionPoints.values()].includes(id)); for (const [resolved, actual] of this.#constructionResolutions) { if (actual === role) { need(resolved === id); } } need(this.#constructionArming === role); this.#constructionArming = null; this.#constructionPoints.set(role, id);
  }
  public requestConstruction(command: CurrentFootprintInverseConstructionCommand, retainAllocationReply?: (reply: unknown) => void): Promise<unknown> { return this.#bindings.constructionRequest(command, retainAllocationReply); }
  public expectConstructionHelper(program: string): void {
    need(this.#constructionStarted && this.#pumping && this.#constructionHelpers.length === 0 && typeof program === "string" && program.length <= 65_536);
    this.#constructionHelpers.push({ program, scriptId: null });
  }
  public async qualifyConstructionHelper(program: string): Promise<void> {
    const expected = this.#constructionHelpers[0]; need(expected !== undefined && expected.program === program && expected.scriptId !== null);
    const reply = await this.#bindings.constructionRequest({ phase: "inverse-construction-helper", method: "Debugger.getScriptSource", params: { scriptId: expected.scriptId } }); await this.#current();
    need(record(reply) && Reflect.ownKeys(reply).length === 1 && reply["scriptSource"] === program && this.#constructionHelpers[0] === expected); this.#constructionHelpers.shift();
  }
  public requestProducerArm(command:CurrentFootprintInverseProducerArmCommand):Promise<unknown>{this.requireConstructionBootstrap();need(this.#pumping);return this.#bindings.producerArmRequest(command);}
  public expectProducerArm(command: CurrentFootprintInverseProducerArmCommand): void {
    this.requireConstructionBootstrap(); need(this.#pumping && this.#producerArming===null && (command.phase==="project-save-producer-arm"||command.phase==="project-save-producer-guard") && this.#source!==null && command.params.location.scriptId===this.#source.scriptId);
    const key=`${command.phase}-${command.role}`;need(!this.#producerPoints.has(key));this.#producerArming=Object.freeze({key,lineNumber:command.params.location.lineNumber,columnNumber:command.params.location.columnNumber});
  }
  public registerProducerArm(command: CurrentFootprintInverseProducerArmCommand,id:string):void {
    this.requireConstructionBootstrap();const armed=this.#producerArming;need(armed!==null&&token(id)&&!this.#producerPoints.has(armed.key)&&![...this.#producerPoints.values()].some(point=>point.id===id)&&(command.phase==="project-save-producer-arm"||command.phase==="project-save-producer-guard")&&armed.key===`${command.phase}-${command.role}`);
    for(const[resolved,key]of this.#producerResolutions){if(key===armed.key){need(resolved===id);}}
    this.#producerPoints.set(armed.key,Object.freeze({id,lineNumber:armed.lineNumber,columnNumber:armed.columnNumber}));this.#producerArming=null;
  }
  public originalProducerArms():readonly Readonly<{role:string;id:string}>[]{this.requireConstructionBootstrap();need(this.#producerPoints.size===37&&this.#producerArming===null&&this.#producerHelpers.length===0);return Object.freeze([...this.#producerPoints].map(([role,point])=>Object.freeze({role,id:point.id})));}
  public expectProducerHelper(program:string):void{this.requireConstructionBootstrap();need(this.#pumping&&this.#producerHelpers.length===0&&this.#constructionHelpers.length===0&&typeof program==="string"&&program.length<=65_536);this.#producerHelpers.push({program,scriptId:null});}
  public async qualifyProducerHelper(program:string):Promise<void>{
    const original=this.#producerHelpers[0];need(original!==undefined&&original.program===program&&original.scriptId!==null);
    const reply=await this.#bindings.producerArmRequest({phase:"inverse-producer-helper",method:"Debugger.getScriptSource",params:{scriptId:original.scriptId}});await this.#current();
    need(record(reply)&&Reflect.ownKeys(reply).length===1&&reply["scriptSource"]===program&&this.#producerHelpers[0]===original);this.#producerHelpers.shift();
  }
  public queueConstruction(run: () => Promise<void>): Promise<boolean> {
    need(this.#result !== null && !this.#constructionWorkAttempted && !this.#failed && typeof run === "function" && !types.isProxy(run)); this.#constructionWorkAttempted = true;
    const result = Promise.withResolvers<boolean>(); this.#constructionWork = Object.freeze({ run, result }); return result.promise;
  }
  public queueOriginalBootstrapSetup(run: () => Promise<void>): Promise<boolean> {
    this.requireConstructionBootstrap(); need(!this.#bootstrapSetupAttempted && !this.#failed && !this.#pumping && this.#constructionWork === null && this.#constructionArming === null && this.#constructionHelpers.length === 0 && typeof run === "function" && !types.isProxy(run)); this.#bootstrapSetupAttempted = true;
    const result = Promise.withResolvers<boolean>(); this.#bootstrapSetupWork = Object.freeze({ run, result }); return result.promise;
  }
  public async startConstructionSource(): Promise<void> {
    need(this.#pumping && this.#result !== null && this.#source !== null && !this.#constructionStartAttempted && this.#constructionPoints.size === CONSTRUCTORS.length + 8);
    this.#constructionStartAttempted = true;
    const removed = await this.#bindings.constructionRequest({ phase: "inverse-construction-instrument", method: "Debugger.removeBreakpoint", params: { breakpointId: this.#source.instrumentationBreakpointId } }); await this.#current(); need(record(removed) && Reflect.ownKeys(removed).length === 0);
    const resumed = await this.#bindings.constructionRequest({ phase: "inverse-construction-start", method: "Debugger.resume", params: {} }); await this.#current(); need(record(resumed) && Reflect.ownKeys(resumed).length === 0);
    const event = await this.#next(); need(event.method === "Debugger.resumed" && Reflect.ownKeys(event.params).length === 0); this.#constructionStarted = true;
  }
  public requireConstructionBootstrap(): CurrentFootprintInverseWorkerPair {
    need(!this.#failed && this.#constructionStarted && this.#constructionHeld === "bootstrap" && this.#constructionResume === null && this.#pair !== null); return this.#pair;
  }
  public reserveConstructionRemove(breakpointId: string): void {
    need(this.#constructionHeld === "bootstrap" && !this.#constructionRemoved.has(breakpointId));
    const original = [...this.#constructionPoints].find(([, id]) => id === breakpointId); need(original !== undefined && CONSTRUCTORS.some(role => role === original[0])); this.#constructionRemoved.add(breakpointId);
  }
  public reserveConstructionResume(role: CurrentProjectSaveStructureSite): void {
    need(this.#constructionHeld === role && this.#constructionResume === null && CONSTRUCTORS.some(value => value === role)); this.#constructionHeld = null; this.#constructionResume = role;
  }
  public async nextConstructionEvent(): Promise<CurrentProjectSaveStructureEvent> {
    need(this.#pumping && this.#constructionStarted); const event = await this.#next(); need(typeof event.sessionId === "string");
    if (event.method === "Debugger.resumed") { need(this.#constructionResume !== null && Reflect.ownKeys(event.params).length === 0); this.#constructionResume = null; return { ...event, method: "Debugger.resumed", sessionId: event.sessionId }; }
    need(event.method === "Debugger.paused" && this.#constructionHeld === null && this.#constructionResume === null);
    const frames = event.params["callFrames"], hits = event.params["hitBreakpoints"];
    need(Array.isArray(hits) && hits.length === 1 && Array.isArray(frames) && frames.length > 0 && record(frames[0]));
    const location = frames[0]["location"], selected = [...this.#constructionPoints].find(([, id]) => id === hits[0]);
    need(selected !== undefined && record(location) && this.#source !== null && location["scriptId"] === this.#source.scriptId && location["lineNumber"] === SITES[selected[0]].lineNumber && location["columnNumber"] === SITES[selected[0]].columnNumber);
    this.#constructionHeld = selected[0]; await this.#bindings.constructionHeld(selected[0], event); await this.#current(); return { ...event, method: "Debugger.paused", sessionId: event.sessionId };
  }
  public async pump(): Promise<void> {
    need(!this.#failed); if (this.#browser === null || this.#page === null || this.#pumping || this.#result !== null && this.#constructionWork === null && this.#bootstrapSetupWork === null) { return; }
    this.#pumping = true;
    try {
      if (this.#result === null) { await this.observeProjectSourceHeld(); }
      else { const work = this.#constructionWork ?? this.#bootstrapSetupWork; need(work !== null); if (this.#constructionWork === work) { this.#constructionWork = null; } else { this.#bootstrapSetupWork = null; this.requireConstructionBootstrap(); }
        try { await work.run(); work.result.resolve(true); } catch (error) { work.result.reject(error); throw error; } }
    } catch (error) { this.fail(); throw error; } finally { this.#pumping = false; }
  }
  public status(): Readonly<{ pumping: boolean; failed: boolean; pairJoined: boolean; projectSourceHeld: boolean; sourceCallbackSettled: boolean; projectExecutionAuthorized: false }> {
    return Object.freeze({ pumping: this.#pumping, failed: this.#failed, pairJoined: this.#pair !== null, projectSourceHeld: this.#source !== null, sourceCallbackSettled: this.#result !== null, projectExecutionAuthorized: false });
  }
}
