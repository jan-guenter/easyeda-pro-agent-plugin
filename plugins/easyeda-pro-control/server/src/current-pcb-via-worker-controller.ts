/* oxlint-disable import/max-dependencies -- One original cursor joins independent bootstrap, Save, clock, structure, transport and producer source grammars. */
import { CURRENT_PCB_VIA_OBSERVED_WORKER_SOURCE_REQUESTS,qualifyCurrentPcbViaObservedWorkerSource,requireCurrentPcbViaObservedWorkerCondition,requireCurrentPcbViaObservedWorkerProgram } from "./current-pcb-via-observed-worker-programs.ts";
import type { CurrentPcbViaObservedSourceCommand } from "./current-pcb-via-observed-source-protocol.ts";
import { CURRENT_PCB_VIA_SAVE_TAIL_DELETE_SITES as TAIL_SITES } from "./current-pcb-via-save-tail-observation-source.ts";
import type { CurrentPcbViaSaveTailDeleteRole } from "./current-pcb-via-save-tail-observation-source.ts";
import { CURRENT_PCB_VIA_WORKER_SETUP_HELPER_REQUESTS as CURRENT_PROJECT_WORKER_SETUP_HELPER_REQUESTS, qualifyCurrentPcbViaWorkerSetupHelperSource as qualifyCurrentProjectWorkerSetupHelperSource, requireCurrentPcbViaWorkerSetupHelper as requireCurrentProjectWorkerSetupHelper } from "./current-pcb-via-worker-setup-helpers.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_ROLES, CURRENT_PROJECT_SAVE_PRODUCER_SHARED_GUARDS } from "./current-project-save-producer-protocol.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_SITES as PRODUCER_SITES } from "./current-project-save-producer-source.ts";
import type { CurrentProjectSaveProducerRole } from "./current-project-save-producer-source.ts";
import { CURRENT_PROJECT_STRUCTURE_TRANSPORT_SITES as TRANSPORT_SITES } from "./current-project-structure-transport-source.ts";
import type { CurrentProjectStructureTransportRole } from "./current-project-structure-transport-source.ts";
/** Original-event cursor for one fresh Via worker. Structural transports prove
 * no ownership; only the actual central owner's held-source callback can issue
 * its private native origin. No debugger continuation is attempted on failure. */
import { CurrentPcbViaEventRouter } from "./current-pcb-via-event-router.ts";
import type { CurrentPcbViaEventPoint, CurrentPcbViaRoutedEvent, DiagnosticEvent } from "./current-pcb-via-event-router.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_GUARD_SITES as GUARD_SITES, CURRENT_PROJECT_SAVE_STRUCTURE_SITES as STRUCTURE_SITES } from "./current-project-save-structure-protocol.ts";
import type { CurrentProjectSaveProducerGuardRole, CurrentProjectSaveStructureCommand } from "./current-project-save-structure-protocol.ts";
import { performance } from "node:perf_hooks";
import { types } from "node:util";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { CURRENT_PCB_VIA_SAVE_SITES } from "./current-pcb-via-save-source.ts";
import type { CurrentPcbViaSaveSite } from "./current-pcb-via-save-source.ts";
import { isCurrentPcb209BootstrapTargetUrl } from "./current-pcb-209-worker-bootstrap-source.ts";
import { CurrentPcbViaWorkerBootstrap } from "./current-pcb-via-worker-bootstrap.ts";
import type { CurrentPcbViaProjectSourceHeld, CurrentPcbViaWorkerBootstrapEvent, CurrentPcbViaWorkerBootstrapResult } from "./current-pcb-via-worker-bootstrap.ts";
import type { CurrentPcbViaWorkerBootstrapCommand, CurrentPcbViaWorkerCommand } from "./current-pcb-via-worker-wire.ts";

export interface CurrentPcbViaWorkerChild { readonly sessionId: string; readonly targetId: string; readonly url: string; readonly title: string }
export interface CurrentPcbViaWorkerControllerBindings {
  readonly observedSource:(command:CurrentPcbViaObservedSourceCommand)=>Promise<unknown>;
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
  readonly #observedPrograms:Readonly<{kind:"function"|"expression";text:string}>[]=[];readonly #observedSourceScripts=new Set<string>();readonly #observedConditions=new Set<string>();#observedInvocations=0;
  readonly #setupHelpers: string[] = []; readonly #setupHelperScripts = new Set<string>();
  readonly #events: CurrentPcbViaWorkerBootstrapEvent[] = [];
  readonly #savePoints = new Map<CurrentPcbViaSaveSite, string>();
  readonly #tailPoints=new Map<CurrentPcbViaSaveTailDeleteRole,string>();
  readonly #syncQuiescePoints=new Map<"entry"|"returned",string>(); #syncQuiesceComplete=false;
  readonly #producerGuardPoints = new Map<CurrentProjectSaveProducerGuardRole, string>();
  readonly #producerPoints = new Map<CurrentProjectSaveProducerRole, string>();
  #producerObservationArmed = false;
  #producerGuardHeld: CurrentProjectSaveProducerGuardRole | null = null;
  readonly #transportPoints = new Map<CurrentProjectStructureTransportRole, string>();
  readonly #structurePoints = new Map<Extract<CurrentProjectSaveStructureCommand, { phase: "project-save-structure-arm" }>["role"], string>();
  readonly #background = new Set<string>();
  #child: CurrentPcbViaWorkerChild | null = null;
  #runner: CurrentPcbViaWorkerBootstrap | null = null;
  #router: CurrentPcbViaEventRouter | null = null;
  #source: CurrentPcbViaProjectSourceHeld | null = null;
  #result: CurrentPcbViaWorkerBootstrapResult | null = null;
  #work: Promise<void> | null = null;
  readonly #sourceResumed = Promise.withResolvers<boolean>();
  #pumping = false; #reading = false; #failed = false; #parentRunning = false; #loaded = false; #eventCount = 0;
  public constructor(bindings: CurrentPcbViaWorkerControllerBindings) {
    need(bindings !== null && typeof bindings === "object" && !types.isProxy(bindings) && Object.getPrototypeOf(bindings) === Object.prototype && Object.isFrozen(bindings));
    const fields = ["parentSessionId", "projectUuid", "windowTabId", "existingWorkers", "bindWorker", "request", "poll", "assertCurrent", "projectSourceHeld", "releaseParentWait", "fail","observedSource"];
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
  public fail(): void { if (this.#failed) { return; } this.#failed = true; this.#sourceResumed.resolve(false); this.#router?.revoke(); this.#bindings.fail(); }
  /** Private original object identity, also usable for historical retirement. */
  public requireHeld(source: CurrentPcbViaProjectSourceHeld): CurrentPcbViaWorkerChild {
    need(this.#source === source && this.#child !== null && this.#runner !== null); return this.#child;
  }
  public requireOriginal(source: CurrentPcbViaProjectSourceHeld, child: CurrentPcbViaWorkerChild): void {
    need(this.#source === source && this.#child === child && this.#runner !== null);
  }
  public expectSetupHelper(source: CurrentPcbViaProjectSourceHeld, program: string): void {
    need(this.#source === source && this.#result === null && this.#pumping && this.#setupHelpers.length < CURRENT_PROJECT_WORKER_SETUP_HELPER_REQUESTS); requireCurrentProjectWorkerSetupHelper(program); this.#setupHelpers.push(program);
  }
  async #consumeSetupHelpers(source: CurrentPcbViaProjectSourceHeld): Promise<void> {
    need(this.#source === source && this.#result === null && this.#pumping);
    for (const program of this.#setupHelpers) { const event = await this.#next();
      need(event.method === "Debugger.scriptParsed" && record(event.params) && event.params["url"] === "" && event.params["executionContextId"] === source.executionContextId && event.params["hasSourceURL"] !== true && event.params["isLiveEdit"] !== true && (event.params["scriptLanguage"] === undefined || event.params["scriptLanguage"] === "JavaScript") && token(event.params["scriptId"]) && event.params["scriptId"] !== source.scriptId && !this.#setupHelperScripts.has(event.params["scriptId"]));
      const scriptId = event.params["scriptId"]; this.#setupHelperScripts.add(scriptId);
      const raw = await this.#bindings.request({ phase: "via-worker-helper-source", method: "Debugger.getScriptSource", params: { scriptId } }, false);
      need(record(raw) && Reflect.ownKeys(raw).length === 1); const descriptor = Object.getOwnPropertyDescriptor(raw, "scriptSource"); need(descriptor !== undefined && Object.hasOwn(descriptor, "value")); const text: unknown = descriptor.value; qualifyCurrentProjectWorkerSetupHelperSource(text, program); await this.#current();
    }
  }
  public expectObservedProgram(source:CurrentPcbViaProjectSourceHeld,kind:"function"|"expression"|"condition",text:string):void{need(this.#source===source&&!this.#failed);if(kind==="condition"){requireCurrentPcbViaObservedWorkerCondition(text);this.#observedConditions.add(text);return;}if(this.#result===null){return;}requireCurrentPcbViaObservedWorkerProgram(kind,text);this.#observedInvocations+=1;need(this.#observedInvocations<=CURRENT_PCB_VIA_OBSERVED_WORKER_SOURCE_REQUESTS);this.#observedPrograms.push(Object.freeze({kind,text}));}
  async #observeProgram(event:CurrentPcbViaWorkerBootstrapEvent):Promise<void>{const source=this.#source;need(source!==null&&this.#result!==null&&event.method==="Debugger.scriptParsed"&&record(event.params));const params=event.params;need(params["url"]===""&&params["executionContextId"]===source.executionContextId&&params["hasSourceURL"]!==true&&params["isLiveEdit"]!==true&&(params["scriptLanguage"]===undefined||params["scriptLanguage"]==="JavaScript")&&token(params["scriptId"])&&params["scriptId"]!==source.scriptId&&!this.#setupHelperScripts.has(params["scriptId"])&&!this.#observedSourceScripts.has(params["scriptId"]));const original=this.#observedPrograms[0];need(original!==undefined||this.#observedConditions.size>0);this.#observedSourceScripts.add(params["scriptId"]);const command:CurrentPcbViaObservedSourceCommand={phase:"via-observed-source",method:"Debugger.getScriptSource",params:{scriptId:params["scriptId"]}};const raw=await this.#bindings.observedSource(command);need(record(raw));const descriptor=Object.getOwnPropertyDescriptor(raw,"scriptSource");need(descriptor!==undefined&&Object.hasOwn(descriptor,"value")&&typeof descriptor.value==="string");const text:string=descriptor.value;if(original!==undefined&&text===(original.kind==="function"?`(${original.text})`:original.text)){qualifyCurrentPcbViaObservedWorkerSource(raw,original.kind,original.text);need(this.#observedPrograms.shift()===original);}else{need(this.#observedConditions.has(text));qualifyCurrentPcbViaObservedWorkerSource(raw,"expression",text);}await this.#current();}
  public async settleObservedPrograms(source:CurrentPcbViaProjectSourceHeld):Promise<void>{need(this.#source===source&&this.#result!==null&&!this.#reading&&!this.#failed);const started=performance.now();while(this.#observedPrograms.length>0||this.#events.length>0){need(performance.now()-started<30_000);await this.#current();const event=this.#events.shift();if(event===undefined){await this.#bindings.poll();}else if(!this.#resolution(event)){if(event.method==="Debugger.scriptParsed"){await this.#observeProgram(event);}else if(event.method==="Runtime.consoleAPICalled"){need(record(event.params)&&event.params["executionContextId"]===source.executionContextId);}else{this.#events.unshift(event);throw new Error("VIA_OBSERVED_SOURCE_FRONTIER_HELD");}}}}
  public requireProducerFrontier(source:CurrentPcbViaProjectSourceHeld):void{need(this.#source===source&&this.#result!==null&&!this.#failed&&!this.#reading&&this.#observedPrograms.length===0&&this.#events.length===0);this.#eventRouter().requireProducerFrontier();}
  public bindSaveBreakpoint(source: CurrentPcbViaProjectSourceHeld, role: CurrentPcbViaSaveSite, breakpointId: string): void {
    need(this.#source === source && this.#result === null && !this.#savePoints.has(role) && ![...this.#savePoints.values()].includes(breakpointId) && token(breakpointId));
    this.#savePoints.set(role, breakpointId);
  }
  public bindStructureBreakpoint(source: CurrentPcbViaProjectSourceHeld, role: Extract<CurrentProjectSaveStructureCommand, { phase: "project-save-structure-arm" }>["role"], breakpointId: string): void {
    need(this.#source === source && this.#result === null && !this.#structurePoints.has(role) && ![...this.#structurePoints.values(), ...this.#savePoints.values()].includes(breakpointId) && token(breakpointId));
    this.#structurePoints.set(role, breakpointId);
  }
  public bindStructureTransportBreakpoint(source: CurrentPcbViaProjectSourceHeld, role: CurrentProjectStructureTransportRole, breakpointId: string): void {
    need(this.#source === source && this.#result === null && !this.#transportPoints.has(role) && ![...this.#transportPoints.values(), ...this.#structurePoints.values(), ...this.#savePoints.values()].includes(breakpointId) && token(breakpointId)); this.#transportPoints.set(role, breakpointId);
  }
  public bindProducerGuardBreakpoint(source: CurrentPcbViaProjectSourceHeld, role: CurrentProjectSaveProducerGuardRole, breakpointId: string): void {
    need(this.#source === source && this.#result === null && !this.#producerGuardPoints.has(role) && ![...this.#producerGuardPoints.values(), ...this.#transportPoints.values(), ...this.#structurePoints.values(), ...this.#savePoints.values()].includes(breakpointId) && token(breakpointId)); this.#producerGuardPoints.set(role, breakpointId);
  }
  public originalProducerGuardBreakpoint(source: CurrentPcbViaProjectSourceHeld, role: typeof CURRENT_PROJECT_SAVE_PRODUCER_SHARED_GUARDS[number]): string {
    need(this.#source === source && this.#result === null && !this.#producerObservationArmed); const point = this.#producerGuardPoints.get(role); need(point !== undefined); return point;
  }
  public bindProducerObservationBreakpoint(source: CurrentPcbViaProjectSourceHeld, role: CurrentProjectSaveProducerRole, breakpointId: string): void {
    need(this.#source === source && this.#result === null && !this.#producerObservationArmed && !this.#producerPoints.has(role) && ![...this.#producerPoints.values(), ...this.#structurePoints.values(), ...this.#transportPoints.values(), ...this.#savePoints.values()].includes(breakpointId) && token(breakpointId));
    const shared = CURRENT_PROJECT_SAVE_PRODUCER_SHARED_GUARDS.find(value => value === role);
    if (shared === undefined) { need(![...this.#producerGuardPoints.values()].includes(breakpointId)); } else { need(this.#producerGuardPoints.get(shared) === breakpointId); } this.#producerPoints.set(role, breakpointId);
  }
  public originalProducerObservationBreakpoint(source: CurrentPcbViaProjectSourceHeld, role: CurrentProjectSaveProducerRole): string {
    need(this.#source === source && this.#producerObservationArmed); const point = this.#producerPoints.get(role); need(point !== undefined); return point;
  }
  public sealProducerObservation(source: CurrentPcbViaProjectSourceHeld): void { need(this.#source === source && this.#result === null && !this.#producerObservationArmed && this.#producerPoints.size === CURRENT_PROJECT_SAVE_PRODUCER_ROLES.length); this.#producerObservationArmed = true; }
  public requireProducerObservationArmed(source: CurrentPcbViaProjectSourceHeld): void { need(this.#source === source && this.#producerObservationArmed && this.#producerPoints.size === CURRENT_PROJECT_SAVE_PRODUCER_ROLES.length); }
  public requireProducerGuardsArmed(source: CurrentPcbViaProjectSourceHeld): void { need(this.#source === source && this.#producerGuardPoints.size === 10 && this.#producerGuardHeld === null && !this.#failed); }
  public requireStructureTransportArmed(source: CurrentPcbViaProjectSourceHeld): void { need(this.#source === source && this.#transportPoints.size === 3); }
  public requireStructureArmed(source: CurrentPcbViaProjectSourceHeld): void { need(this.#source === source && this.#structurePoints.size === 14); }
  #resolution(event: CurrentPcbViaWorkerBootstrapEvent): boolean {
    if (event.method === "Debugger.breakpointResolved" && record(event.params)) { const params = event.params; const guard = [...this.#producerGuardPoints].find(([_role, id]) => id === params["breakpointId"]);
      if (guard !== undefined) { const location = event.params["location"], site = GUARD_SITES[guard[0]]; need(this.#source !== null && record(location) && Reflect.ownKeys(event.params).length === 2 && Reflect.ownKeys(location).length === 3 && location["scriptId"] === this.#source.scriptId && location["lineNumber"] === site.lineNumber && location["columnNumber"] === site.columnNumber); return true; }
    }
    if (event.method === "Debugger.breakpointResolved" && record(event.params)) { const params = event.params, producer = [...this.#producerPoints].find(([_role, id]) => id === params["breakpointId"]);
      if (producer !== undefined) { const location = params["location"], site = PRODUCER_SITES[producer[0]]; need(this.#source !== null && record(location) && Reflect.ownKeys(params).length === 2 && Reflect.ownKeys(location).length === 3 && location["scriptId"] === this.#source.scriptId && location["lineNumber"] === site.lineNumber && location["columnNumber"] === site.columnNumber); return true; }
    }
    if(event.method==="Debugger.breakpointResolved"&&record(event.params)){const params=event.params,tail=[...this.#tailPoints].find(([_role,id])=>id===params["breakpointId"]);if(tail!==undefined){const p=TAIL_SITES[tail[0]];const location=params["location"];need(this.#source!==null&&record(location)&&Reflect.ownKeys(params).length===2&&Reflect.ownKeys(location).length===3&&location["scriptId"]===this.#source.scriptId&&location["lineNumber"]===p.lineNumber&&location["columnNumber"]===p.columnNumber);return true;}}
    if (this.#result !== null) { return false; }
    if (event.method !== "Debugger.breakpointResolved") { return false; }
    need(this.#source !== null && record(event.params) && record(event.params["location"]));
    const location = event.params["location"], params = event.params;
    const match = [...this.#savePoints].find(([_role, id]) => id === params["breakpointId"]);
    const structure = [...this.#structurePoints].find(([_role, id]) => id === params["breakpointId"]); const transport = [...this.#transportPoints].find(([_role, id]) => id === params["breakpointId"]); need(match !== undefined || structure !== undefined || transport !== undefined);
    let site: Readonly<{ lineNumber: number; columnNumber: number }>;
    if (match === undefined) {
      if (structure === undefined) { need(transport !== undefined); site = TRANSPORT_SITES[transport[0]]; } else { site = STRUCTURE_SITES[structure[0]]; }
    } else { site = CURRENT_PCB_VIA_SAVE_SITES[match[0]]; }
    need(Reflect.ownKeys(params).length === 2 && Reflect.ownKeys(location).length === 3 && location["scriptId"] === this.#source.scriptId && location["lineNumber"] === site.lineNumber && location["columnNumber"] === site.columnNumber); return true;
  }
  public observeEvent(event: DiagnosticEvent): void {
    try { this.#accept(event); this.#router?.notifyEvent(); } catch (error) { this.fail(); throw error; }
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
    if (event.method === "Debugger.paused" && record(event.params) && Array.isArray(event.params["hitBreakpoints"])) {
      const hits: readonly unknown[] = event.params["hitBreakpoints"];
      if(this.#syncQuiesceComplete&&hits.includes(this.#syncQuiescePoints.get("entry"))){this.fail();return;} const guard = [...this.#producerGuardPoints].find(([_role, id]) => hits.includes(id));
      if (guard !== undefined && !(this.#producerObservationArmed && CURRENT_PROJECT_SAVE_PRODUCER_SHARED_GUARDS.some(role => role === guard[0]))) { this.#producerGuardHeld = guard[0]; throw new Error("PROJECT_SAVE_PRODUCER_GUARD_HELD"); }
    }
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
  async #nextObservedEvent(allowNativePoll: boolean): Promise<DiagnosticEvent | null> {
    need(this.#result !== null && !this.#pumping && this.#child !== null);
    for (let count = 0; count < 128; count += 1) {
      let event: CurrentPcbViaWorkerBootstrapEvent | null = null;
      if (allowNativePoll) { event = await this.#next(); } else { await this.#current(); const queued = this.#events.shift(); if (queued === undefined) { return null; } if (!this.#resolution(queued)) { event = queued; } }
      if (event !== null) {
      if (event.method === "Debugger.paused" || event.method === "Debugger.resumed" || event.method === "Debugger.breakpointResolved") { need(record(event.params)); return { method: event.method, sessionId: event.sessionId, params: event.params }; }
      need(record(event.params));
      if (event.method === "Inspector.workerScriptLoaded") { need(!this.#loaded && Reflect.ownKeys(event.params).length === 0); this.#loaded = true; }
      else if (event.method === "Debugger.scriptParsed") { await this.#observeProgram(event); }
      else if (event.method === "Runtime.consoleAPICalled") { need(event.params["executionContextId"] === this.#source?.executionContextId); }
      else { this.fail(); throw new Error("PCB_VIA_WORKER_UNEXPECTED_EVENT"); }
      }
    }
    this.fail(); throw new Error("PCB_VIA_WORKER_EVENT_CAPACITY");
  }
  #eventRouter(): CurrentPcbViaEventRouter {
    need(this.#router !== null && this.#result !== null && !this.#pumping); return this.#router;
  }
  public observeUiEvent(event: DiagnosticEvent): boolean {
    if (event.sessionId !== this.#bindings.parentSessionId || this.#result === null || !["Debugger.paused", "Debugger.resumed", "Debugger.breakpointResolved"].includes(event.method)) { return false; }
    this.observeEvent(event); return true;
  }
  /** Pure retained barrier. It never infers completion from elapsed time or
   * starts another native poll; the original abort/failure settles false. */
  public async whenOriginalSourceResumed(): Promise<void> { const resumed = await this.#sourceResumed.promise; need(resumed && !this.#failed && this.#result !== null && this.#router !== null); }
  public bindSaveTailBreakpoint(source:CurrentPcbViaProjectSourceHeld,role:CurrentPcbViaSaveTailDeleteRole,id:string):void{need(this.#source===source&&this.#result===null&&!this.#tailPoints.has(role)&&token(id));this.#tailPoints.set(role,id);}
  public bindSyncQuiesceBreakpoint(source:CurrentPcbViaProjectSourceHeld,role:"entry"|"returned",breakpointId:string):void {need(this.#source===source&&this.#result===null&&!this.#syncQuiescePoints.has(role)&&token(breakpointId));this.#syncQuiescePoints.set(role,breakpointId);}
  public async nextSyncQuiesceEvent():Promise<CurrentPcbViaRoutedEvent>{await this.whenOriginalSourceResumed();return this.#eventRouter().next("quiesce");}
  public reserveSyncQuiesceResume(source:CurrentPcbViaProjectSourceHeld,role:"entry"|"returned"):void{need(this.#source===source&&this.#child!==null);this.#eventRouter().reserveResume("quiesce",this.#child.sessionId,role);}
  public completeSyncQuiesce(source:CurrentPcbViaProjectSourceHeld):void{need(this.#source===source&&this.#result!==null&&!this.#syncQuiesceComplete&&this.#syncQuiescePoints.size===2);this.#syncQuiesceComplete=true;}
  public async nextProducerEvent(): Promise<CurrentPcbViaRoutedEvent> { await this.whenOriginalSourceResumed(); return this.#eventRouter().next("producer"); }
  public reserveInitialCacheResume(source: CurrentPcbViaProjectSourceHeld, event: CurrentPcbViaRoutedEvent, role: "headEntry" | "headPromise" | "headSuccess"): void {
    need(this.#source === source && this.#child !== null); this.#eventRouter().reserveInitialCacheResume(event, role);
  }
  public reserveInitialSyncResume(source: CurrentPcbViaProjectSourceHeld, event: CurrentPcbViaRoutedEvent, role: "syncEntry" | "syncFull" | "syncHistory" | "syncMerged" | "syncFinalizing" | "syncReturned"): void {
    need(this.#source === source && this.#child !== null); this.#eventRouter().reserveInitialSyncResume(event, role);
  }
  public reservePeriodicSyncResume(source: CurrentPcbViaProjectSourceHeld, event: CurrentPcbViaRoutedEvent, role: "syncEntry" | "syncFull" | "syncLast" | "syncHistory" | "syncMerged" | "syncFinalizing" | "syncReturned"): void {
    need(this.#source === source && this.#child !== null); this.#eventRouter().reservePeriodicSyncResume(event, role);
  }
  public reserveSaveLocalResume(source: CurrentPcbViaProjectSourceHeld, event: CurrentPcbViaRoutedEvent, role: "localIngress" | "headEntry" | "headPromise" | "headSuccess" | "bufferIngress" | "bufferScheduled" | "localReturned"): void {
    need(this.#source === source && this.#child !== null); this.#eventRouter().reserveSaveLocalResume(event,role);
  }
  public reserveSaveUploadResume(source: CurrentPcbViaProjectSourceHeld, event: CurrentPcbViaRoutedEvent, role: "bufferDrain" | "cloudIngress" | "historyCloud"): void {
    need(this.#source === source && this.#child !== null); this.#eventRouter().reserveSaveUploadResume(event,role);
  }
  public reserveSaveDrainResume(source:CurrentPcbViaProjectSourceHeld,event:CurrentPcbViaRoutedEvent,role:string):void{need(this.#source===source&&this.#child!==null);this.#eventRouter().reserveSaveDrainResume(event,role);}
  public reservePostHistorySyncResume(source:CurrentPcbViaProjectSourceHeld,event:CurrentPcbViaRoutedEvent,role:"syncEntry"|"syncFull"|"syncLast"|"syncHistory"|"syncMerged"|"syncFinalizing"|"syncReturned"):void{need(this.#source===source&&this.#child!==null);this.#eventRouter().reservePostHistorySyncResume(event,role);}
  public reserveSaveTailDeleteResume(source:CurrentPcbViaProjectSourceHeld,event:CurrentPcbViaRoutedEvent,role:"cacheDeleteCall"|"cacheDeleteReturned"):void{need(this.#source===source&&this.#child!==null);this.#eventRouter().reserveSaveTailDeleteResume(event,role);}
  public async nextStructureTransportEvent(): Promise<CurrentPcbViaRoutedEvent> { await this.whenOriginalSourceResumed(); return this.#eventRouter().next("structureTransport"); }
  public reserveStructureTransportResume(source: CurrentPcbViaProjectSourceHeld, role: "send" | "returned"): void {
    need(this.#source === source && this.#child !== null); this.#eventRouter().reserveResume("structureTransport", this.#child.sessionId, role);
  }
  public async nextStructureEvent(): Promise<CurrentPcbViaRoutedEvent> { await this.whenOriginalSourceResumed(); return this.#eventRouter().next("structure"); }
  public reserveStructureResume(source: CurrentPcbViaProjectSourceHeld, role: Extract<CurrentProjectSaveStructureCommand, { phase: "project-save-structure-resume" }>["role"]): void {
    need(this.#source === source && this.#child !== null); this.#eventRouter().reserveResume("structure", this.#child.sessionId, role);
  }
  public nextSaveEvent(): Promise<CurrentPcbViaRoutedEvent> { return this.#eventRouter().next("save"); }
  public nextClockEvent(): Promise<CurrentPcbViaRoutedEvent> { return this.#eventRouter().next("clock"); }
  public bindClockBreakpoint(source: CurrentPcbViaProjectSourceHeld, point: CurrentPcbViaEventPoint): void {
    need(this.#source === source); this.#eventRouter().register("clock", point);
  }
  public reserveSaveResume(source: CurrentPcbViaProjectSourceHeld): void {
    need(this.#source === source && this.#child !== null); this.#eventRouter().reserveResume("save", this.#child.sessionId);
  }
  public reserveClockResume(source: CurrentPcbViaProjectSourceHeld, realm: "worker" | "ui", role: string): void {
    need(this.#source === source && this.#child !== null); this.#eventRouter().reserveResume("clock", realm === "worker" ? this.#child.sessionId : this.#bindings.parentSessionId, role);
  }
  public requireClockCompletionWithHeldSaveBody(source: CurrentPcbViaProjectSourceHeld): void {
    need(this.#source === source && this.#child !== null); this.requireOriginal(source, this.#child); this.#eventRouter().requireClockCompletionWithHeldSaveBody();
  }
  async #start(): Promise<void> {
    const child = this.#child; need(child !== null && this.#runner === null);
    await this.#current(); await this.#bindings.bindWorker(child); await this.#current();
    const runner = new CurrentPcbViaWorkerBootstrap(Object.freeze({ sessionId: child.sessionId, targetId: child.targetId, targetUrl: child.url, targetTitle: child.title,
      expectedWindowTabId: this.#bindings.windowTabId, projectUuid: this.#bindings.projectUuid,
      request: (command: CurrentPcbViaWorkerBootstrapCommand, cleanup: boolean): Promise<unknown> => this.#bindings.request(command, cleanup), nextEvent: (): Promise<CurrentPcbViaWorkerBootstrapEvent> => this.#next(),
      assertCurrent: (): Promise<void> => this.#current(), projectSourceHeld: async (source: CurrentPcbViaProjectSourceHeld): Promise<void> => {
        need(this.#runner === runner && this.#source === null); this.#source = source; await this.#bindings.projectSourceHeld(source, this); await this.#consumeSetupHelpers(source); await this.#current(); need(this.#savePoints.size === 6);
      }, releaseParentWait: async (): Promise<void> => { need(!this.#parentRunning); this.#parentRunning = true; await this.#bindings.releaseParentWait(); await this.#current(); },
      fail: (): void => { this.fail(); } }));
    this.#runner = runner; const result = await runner.observe(); await this.#current();
    need(this.#runner === runner && result.sessionId === child.sessionId && this.#source !== null && result.scriptId === this.#source.scriptId &&
      result.uniqueContextId === this.#source.uniqueContextId); this.#result = result;
    const router = new CurrentPcbViaEventRouter(Object.freeze({ workerSessionId: child.sessionId, uiSessionId: this.#bindings.parentSessionId,
      nextEvent: (allowNativePoll: boolean): Promise<DiagnosticEvent | null> => this.#nextObservedEvent(allowNativePoll), assertCurrent: (): Promise<void> => this.#current(), fail: (): void => { this.fail(); } }));
    for (const [role, breakpointId] of this.#savePoints) { const site = CURRENT_PCB_VIA_SAVE_SITES[role]; router.register("save", { sessionId: child.sessionId, scriptId: this.#source.scriptId, breakpointId, role, lineNumber: site.lineNumber, columnNumber: site.columnNumber }); }
    for (const [role, breakpointId] of this.#structurePoints) { const site = STRUCTURE_SITES[role]; router.register("structure", { sessionId: child.sessionId, scriptId: this.#source.scriptId, breakpointId, role, lineNumber: site.lineNumber, columnNumber: site.columnNumber }); }
    for (const [role, breakpointId] of this.#transportPoints) { const site = TRANSPORT_SITES[role]; router.register("structureTransport", { sessionId: child.sessionId, scriptId: this.#source.scriptId, breakpointId, role, lineNumber: site.lineNumber, columnNumber: site.columnNumber }); }
    for (const [role, breakpointId] of this.#producerPoints) { const site = PRODUCER_SITES[role]; router.register("producer", { sessionId: child.sessionId, scriptId: this.#source.scriptId, breakpointId, role, lineNumber: site.lineNumber, columnNumber: site.columnNumber }); }
    this.#router = router;
    for(const[role,breakpointId]of this.#tailPoints){const p=TAIL_SITES[role];router.register("producer",{sessionId:child.sessionId,scriptId:this.#source.scriptId,breakpointId,lineNumber:p.lineNumber,columnNumber:p.columnNumber,role});}
    for(const[role,breakpointId]of this.#syncQuiescePoints){router.register("quiesce",{sessionId:child.sessionId,scriptId:this.#source.scriptId,breakpointId,lineNumber:110,columnNumber:role==="entry"?112_810:112_997,role});}
  }
  /** The outer original renderer call drives this, including its still-pending
   * project-open Promise. Nested observer transfers never start a second pump. */
  public async pump(): Promise<void> {
    need(!this.#failed); if (this.#child === null || this.#result !== null || this.#pumping) { return; }
    this.#pumping = true;
    try { this.#work ??= this.#start(); await this.#work; } catch (error) { this.fail(); throw error; } finally { this.#pumping = false; if (!this.#failed && this.#result !== null && this.#router !== null) { this.#sourceResumed.resolve(true); } }
  }
}
