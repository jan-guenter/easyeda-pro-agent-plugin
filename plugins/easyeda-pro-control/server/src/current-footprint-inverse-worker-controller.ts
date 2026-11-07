import { CURRENT_FOOTPRINT_INVERSE_INITIAL_CACHE_ROLES as CACHE_ROLES, CURRENT_FOOTPRINT_INVERSE_COLD_LOAD_SITES as COLD_SITES, CURRENT_FOOTPRINT_INVERSE_STARTUP_CALLBACK_ROLES as STARTUP_ROLES, CURRENT_FOOTPRINT_INVERSE_INITIAL_SYNC_ROLES as SYNC_ROLES, classifyCurrentFootprintInverseColdPause, currentFootprintInverseConditionBudget, currentFootprintInverseConditionText, currentFootprintInverseInitialCacheBudget, currentFootprintInverseStartupCallbackBudget, qualifyCurrentFootprintInverseConditionSource } from "./current-footprint-inverse-cold-load-protocol.ts";
import type { CurrentFootprintInverseColdLoadCommand, CurrentFootprintInverseColdStepCommand, CurrentFootprintInverseConditionRole, CurrentFootprintInverseInitialCacheCommand, CurrentFootprintInverseInitialCacheRole, CurrentFootprintInverseInitialSyncNativeCommand, CurrentFootprintInverseStartupCallbackCommand, CurrentFootprintInverseStartupCallbackRole, CurrentFootprintInverseStartupQueueCommand, CurrentFootprintInverseColdLoadRole as CurrentPcbViaSavedLoadRole } from "./current-footprint-inverse-cold-load-protocol.ts";
/** Separate inverse event cursor. It shares only the fixed seven-source
 * bootstrap algorithm, not a saved reader controller, origin or purpose.
 * Browser/page attachments must name the same suspended original target. */
import type { CurrentFootprintInverseProducerArmCommand } from "./current-footprint-inverse-producer-protocol.ts";
import type { CurrentFootprintInverseConstructionCommand, CurrentProjectSaveStructureEvent } from "./current-footprint-inverse-construction-protocol.ts";
import { CURRENT_PROJECT_SAVE_STRUCTURE_CONSTRUCTORS as CONSTRUCTORS, CURRENT_PROJECT_SAVE_STRUCTURE_SITES as SITES } from "./current-project-save-structure-protocol.ts";
import type { CurrentProjectSaveStructureSite } from "./current-project-save-structure-protocol.ts";
import { types } from "node:util";
import { CurrentPcbViaSavedLoadBootstrap } from "./current-pcb-via-saved-load-bootstrap.ts";
import type { CurrentPcbViaSavedLoadBootstrapResult, CurrentPcbViaSavedLoadProjectSourceHeld } from "./current-pcb-via-saved-load-bootstrap.ts";
import type { CurrentPcbViaSavedLoadBootstrapCommand } from "./current-pcb-via-saved-load-bootstrap-protocol.ts";
import type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";
import { isCurrentPcb209BootstrapTargetUrl } from "./current-pcb-209-worker-bootstrap-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
// oxlint-disable-next-line import/max-dependencies -- One original event reader owns construction, cold, callback, condition and timer packets; splitting readers would duplicate event custody.
import { CURRENT_PROJECT_SYNC_QUIESCE_SITES as TIMER_SITES } from "./current-project-sync-quiesce-source.ts";
import type { CurrentFootprintInverseTimerCommand } from "./current-footprint-inverse-timer-protocol.ts";

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
  readonly initialSyncRequest:(command:CurrentFootprintInverseInitialSyncNativeCommand)=>Promise<unknown>;readonly initialSyncHeld:()=>Promise<void>;
  readonly initialCacheRequest:(command:CurrentFootprintInverseInitialCacheCommand)=>Promise<unknown>;readonly initialCacheHeld:()=>Promise<void>;
  readonly startupQueueRequest:(command:CurrentFootprintInverseStartupQueueCommand)=>Promise<unknown>;
  readonly startupCallbackRequest:(command:CurrentFootprintInverseStartupCallbackCommand)=>Promise<unknown>;
  readonly startupCallbackHeld:(role:CurrentFootprintInverseStartupCallbackRole,event:DiagnosticEvent)=>Promise<void>;
  readonly conditionSourceRequest:(scriptId:string)=>Promise<unknown>;
  readonly timerRequest: (command: CurrentFootprintInverseTimerCommand) => Promise<unknown>;
  readonly timerHeld: () => Promise<void>;
  readonly coldStepRequest:(command:CurrentFootprintInverseColdStepCommand)=>Promise<unknown>;
  readonly coldRequest: (command: CurrentFootprintInverseColdLoadCommand) => Promise<unknown>;
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
  #coldArming:CurrentPcbViaSavedLoadRole|null=null;
  readonly #coldPoints=new Map<CurrentPcbViaSavedLoadRole,string>();
  readonly #coldResolutions=new Map<string,CurrentPcbViaSavedLoadRole>();
  readonly #coldHelpers:{program:string;scriptId:string|null}[]=[];
  #producerArming: Readonly<{ key: string; lineNumber: number; columnNumber: number }> | null = null;
  readonly #producerPoints = new Map<string, Readonly<{ id: string; lineNumber: number; columnNumber: number }>>();
  readonly #producerResolutions = new Map<string, string>();
  readonly #producerHelpers: { program: string; scriptId: string | null }[] = [];
  readonly #constructionHelpers: { program: string; scriptId: string | null }[] = [];
  #constructionWork: Readonly<{ run: () => Promise<void>; result: ReturnType<typeof Promise.withResolvers<boolean>> }> | null = null;
  #bootstrapSetupWork: Readonly<{ run: () => Promise<void>; result: ReturnType<typeof Promise.withResolvers<boolean>> }> | null = null;
  #coldStartupWork:Readonly<{run:()=>Promise<void>;result:ReturnType<typeof Promise.withResolvers<boolean>>}>|null=null;
  #coldStartupAttempted=false;#coldStartupStarted=false;#coldStartupHeld:Readonly<{role:CurrentPcbViaSavedLoadRole;event:WorkerEvent}>|null=null;
  #coldStepPending:Readonly<{role:CurrentPcbViaSavedLoadRole;event:WorkerEvent}>|null=null;
  #initialSyncBound=false;#initialSyncHolds=0;#initialSyncHeld:{role:typeof SYNC_ROLES[number];event:WorkerEvent;delivered:boolean;resumeAttempted:boolean}|null=null;#initialSyncSettlementAttempted=false;
  readonly #initialSyncHelpers:{program:string;scriptId:string|null}[]=[];
  #initialCacheBound=0;#initialCacheHolds=0;#initialCacheHeld:{role:CurrentFootprintInverseInitialCacheRole;event:WorkerEvent;delivered:boolean;resumeAttempted:boolean}|null=null;#initialCacheSettlementAttempted=false;
  readonly #initialCacheHelpers:{program:string;scriptId:string|null}[]=[];
  #startupQueueReading=false;readonly #startupQueueReads=new WeakSet<object>();readonly #startupQueueHelpers:{program:string;scriptId:string|null}[]=[];
  #conditionBound=0;#conditionReadAttempts=0;readonly #conditionRoles=new Set<CurrentFootprintInverseConditionRole>();readonly #conditionScriptIds:string[]=[];readonly #conditionSeenIds=new Set<string>();readonly #conditionCounts=new Map<string,number>();
  #startupCallbackBound=0;#startupCallbackHolds=0;#startupCallbackHeld:{role:CurrentFootprintInverseStartupCallbackRole;event:WorkerEvent;delivered:boolean;resumeAttempted:boolean}|null=null;
  readonly #startupCallbackHelpers:{program:string;scriptId:string|null}[]=[];
  readonly #timerPoints = new Map<"entry" | "returned", string>();
  readonly #timerResolutions = new Map<string, "entry" | "returned">();
  readonly #timerHelpers: { program: string; scriptId: string | null }[] = [];
  #timerArming: "entry" | "returned" | null = null;
  #timerHeld: { role: "entry" | "returned"; event: WorkerEvent; delivered: boolean; resumeAttempted: boolean } | null = null;
  #timerEntryObserved = false; #timerReturnObserved = false; #timerCompleted = false;
  readonly #coldStepAttempts=new WeakSet<object>();
  #initialHistoryMainArms = 0;
  #unsupportedStartupHeld:WorkerEvent|null=null;
  #bootstrapSetupAttempted = false;
  #constructionWorkAttempted = false; #constructionStartAttempted = false; #constructionStarted = false;
  #constructionHeld: CurrentProjectSaveStructureSite | null = null; #constructionResume: CurrentProjectSaveStructureSite | null = null;
  #source: CurrentPcbViaSavedLoadProjectSourceHeld | null = null; #failed = false; #reading = false; #eventCount = 0; #networkEvents = 0; #pumping = false;
  public constructor(bindings: CurrentFootprintInverseWorkerControllerBindings) {
    need(bindings !== null && typeof bindings === "object" && !types.isProxy(bindings) && Object.getPrototypeOf(bindings) === Object.prototype && Object.isFrozen(bindings));
    const fields = ["parentSessionId", "projectUuid", "windowTabId", "bindWorker", "request", "poll", "assertCurrent", "projectSourceHeld", "constructionRequest", "initialSyncRequest", "initialSyncHeld", "initialCacheRequest", "initialCacheHeld", "startupQueueRequest", "startupCallbackRequest", "startupCallbackHeld", "conditionSourceRequest", "timerRequest", "timerHeld", "coldStepRequest", "coldRequest", "producerArmRequest", "constructionHeld", "fail"];
    need(Reflect.ownKeys(bindings).length === fields.length);
    for (const [index, name] of fields.entries()) { const d = Object.getOwnPropertyDescriptor(bindings, name); need(d !== undefined && Object.hasOwn(d, "value") && typeof d.value === (index < 3 ? "string" : "function") && !types.isProxy(d.value)); }
    need(token(bindings.parentSessionId) && token(bindings.windowTabId) && /^[a-f\d]{64}$/u.test(bindings.projectUuid)); this.#bindings = bindings; Object.freeze(this);
  }
  public fail(): void { if (!this.#failed) { this.#failed = true; this.#completion.resolve(null); const queued = this.#constructionWork; this.#constructionWork = null; queued?.result.reject(new Error("FOOTPRINT_INVERSE_WORKER_CURSOR")); const startup=this.#coldStartupWork;this.#coldStartupWork=null;startup?.result.reject(new Error("FOOTPRINT_INVERSE_WORKER_CURSOR"));const setup = this.#bootstrapSetupWork; this.#bootstrapSetupWork = null; setup?.result.reject(new Error("FOOTPRINT_INVERSE_WORKER_CURSOR")); this.#bindings.fail(); } }
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
      this.#eventCount += 1; need(!this.#failed && this.#eventCount <= 1024+13*this.#startupCallbackBound+18*this.#initialCacheBound+53+(this.#conditionBound>0?currentFootprintInverseConditionBudget(this.#conditionBound):0));
      if (event.method === "Target.attachedToTarget") { this.#attach(event); return; }
      need(this.#page !== null && event.sessionId === this.#page.sessionId);
      if (["Network.requestWillBeSent", "Network.requestWillBeSentExtraInfo", "Network.responseReceived", "Network.responseReceivedExtraInfo", "Network.loadingFinished", "Network.loadingFailed", "Network.dataReceived", "Network.requestServedFromCache", "Network.resourceChangedPriority"].includes(event.method)) {
        this.#networkEvents += 1; need(this.#networkEvents <= 512); return;
      }
      if (this.#source !== null && event.method === "Debugger.scriptParsed" && event.params["url"] === "") {
        const expected = [...this.#constructionHelpers,...this.#producerHelpers,...this.#coldHelpers,...this.#startupCallbackHelpers,...this.#timerHelpers,...this.#startupQueueHelpers,...this.#initialCacheHelpers,...this.#initialSyncHelpers].find(value => value.scriptId === null);
        const scriptId=event.params["scriptId"];need(token(scriptId)&&event.params["executionContextId"]===this.#source.executionContextId);
        if(expected===undefined){need(this.#conditionBound>0&&this.#conditionRoles.size>0&&!this.#conditionSeenIds.has(scriptId)&&this.#conditionSeenIds.size<currentFootprintInverseConditionBudget(this.#conditionBound));this.#conditionSeenIds.add(scriptId);this.#conditionScriptIds.push(scriptId);}else{expected.scriptId=scriptId;}return;
      }
      if (this.#source !== null && event.method === "Debugger.breakpointResolved") {
        const timerId = event.params["breakpointId"]; const timerLocation = event.params["location"]; const knownTimer = [...this.#timerPoints].find(([, id]) => id === timerId);
        const timerRole = knownTimer?.[0] ?? this.#timerArming;
        if (timerRole !== null && timerRole !== undefined && record(timerLocation) && timerLocation["scriptId"] === this.#source.scriptId && timerLocation["lineNumber"] === TIMER_SITES[timerRole].lineNumber && timerLocation["columnNumber"] === TIMER_SITES[timerRole].columnNumber) {
          need(token(timerId)); const previous = this.#timerResolutions.get(timerId); need(previous === undefined || previous === timerRole); this.#timerResolutions.set(timerId, timerRole); return;
        }
        const coldId=event.params["breakpointId"];const coldKnown=[...this.#coldPoints].find(([,id])=>id===coldId);const coldRole=coldKnown?.[0]??this.#coldArming;const coldLocation=event.params["location"];
        if(coldRole!==null&&coldRole!==undefined&&record(coldLocation)&&coldLocation["scriptId"]===this.#source.scriptId&&coldLocation["lineNumber"]===COLD_SITES[coldRole].lineNumber&&coldLocation["columnNumber"]===COLD_SITES[coldRole].columnNumber){need(token(coldId));const prior=this.#coldResolutions.get(coldId);need(prior===undefined||prior===coldRole);this.#coldResolutions.set(coldId,coldRole);return;}
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
  public bindOriginalConditionBudget(records:number):void{need(this.#pumping&&this.#source!==null&&!this.#constructionStarted&&this.#conditionBound===0);currentFootprintInverseConditionBudget(records);this.#conditionBound=records;}
  public expectOriginalCondition(role:CurrentFootprintInverseConditionRole):void{need(this.#pumping&&this.#source!==null&&this.#conditionBound>0&&!this.#conditionRoles.has(role));currentFootprintInverseConditionText(role);this.#conditionRoles.add(role);}
  async #drainOriginalConditions():Promise<void>{while(this.#conditionScriptIds.length>0){const scriptId=this.#conditionScriptIds.shift();need(scriptId!==undefined&&this.#conditionBound>0);this.#conditionReadAttempts+=1;need(this.#conditionReadAttempts<=currentFootprintInverseConditionBudget(this.#conditionBound));const reply=await this.#bindings.conditionSourceRequest(scriptId);await this.#current();need(record(reply)&&Reflect.ownKeys(reply).length===1);const qualified=qualifyCurrentFootprintInverseConditionSource(reply["scriptSource"],[...this.#conditionRoles],this.#conditionBound);const count=(this.#conditionCounts.get(qualified.text)??0)+1;need(count<=qualified.maximum);this.#conditionCounts.set(qualified.text,count);}}
  async #next(): Promise<WorkerEvent> {
    need(!this.#reading); this.#reading = true; const started = performance.now();
    try { for (;;) { await this.#current(); await this.#drainOriginalConditions(); need(performance.now() - started < 30_000); const event = this.#events.shift(); if (event !== undefined) { return event; } await this.#bindings.poll(); } }
    catch (caughtError) { this.fail(); throw caughtError; } finally { this.#reading = false; }
  }
  public requireHeld(source: CurrentPcbViaSavedLoadProjectSourceHeld): CurrentFootprintInverseWorkerPair {
    need(this.#source === source && this.#pair !== null && !this.#failed); return this.#pair;
  }
  public originalProjectSource(): CurrentPcbViaSavedLoadProjectSourceHeld { this.requireConstructionBootstrap(); need(this.#source !== null); return this.#source; }
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
  public requestCold(command:CurrentFootprintInverseColdLoadCommand):Promise<unknown>{if(this.#coldStartupStarted){need(this.#coldStartupHeld!==null);}else{this.requireConstructionBootstrap();}need(this.#pumping);return this.#bindings.coldRequest(command);}
  public expectColdArm(role:CurrentPcbViaSavedLoadRole):void{this.requireConstructionBootstrap();need(this.#pumping&&this.#coldArming===null&&!this.#coldPoints.has(role));this.#coldArming=role;}
  public registerColdArm(role:CurrentPcbViaSavedLoadRole,id:string):void{this.requireConstructionBootstrap();need(this.#coldArming===role&&token(id)&&!this.#coldPoints.has(role)&&![...this.#coldPoints.values()].includes(id));for(const[resolved,actual]of this.#coldResolutions){if(actual===role){need(resolved===id);}}this.#coldPoints.set(role,id);this.#coldArming=null;}
  public originalColdArms():readonly Readonly<{role:CurrentPcbViaSavedLoadRole;id:string}>[]{this.requireConstructionBootstrap();need(this.#coldPoints.size===13&&this.#coldArming===null&&this.#coldHelpers.length===0);return Object.freeze([...this.#coldPoints].map(([role,id])=>Object.freeze({role,id})));}
  public expectColdHelper(program:string):void{if(this.#coldStartupStarted){need(this.#coldStartupHeld!==null);}else{this.requireConstructionBootstrap();}need(this.#pumping&&this.#coldHelpers.length===0&&this.#constructionHelpers.length===0&&this.#producerHelpers.length===0&&typeof program==="string"&&program.length<=65_536);this.#coldHelpers.push({program,scriptId:null});}
  public async qualifyColdHelper(program:string):Promise<void>{const original=this.#coldHelpers[0];need(original!==undefined&&original.program===program&&original.scriptId!==null);const reply=await this.#bindings.coldRequest({phase:"inverse-cold-helper",method:"Debugger.getScriptSource",params:{scriptId:original.scriptId}});await this.#current();need(record(reply)&&Reflect.ownKeys(reply).length===1&&reply["scriptSource"]===program&&this.#coldHelpers[0]===original);this.#coldHelpers.shift();}
  /** This exact producer pause distinguishes four detached sync GETs from
   * the earlier cold-loader GET. The sync cursor must retain it in this pump. */
  public reserveInitialHistoryMainArm(ordinal: number): void {
    need(!this.#failed && this.#pumping && this.#coldStartupStarted && this.#source !== null && ordinal === this.#initialHistoryMainArms + 1 && ordinal <= 4);
    const event = this.#initialSyncHeld?.event ?? null, point = this.#producerPoints.get(`project-save-producer-arm-${ordinal === 1 ? "syncEntry" : "syncHistory"}`);
    need(this.#initialSyncHeld?.delivered === true && !this.#initialSyncHeld.resumeAttempted && event !== null && point !== undefined && event.method === "Debugger.paused" && event.sessionId === this.#pair?.pageSessionId);
    const hits = event.params["hitBreakpoints"]; need(Array.isArray(hits) && hits.length === 1 && hits[0] === point.id); this.#initialHistoryMainArms = ordinal;
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
  public bindStartupCallbackBudget(records:number):void{this.requireConstructionBootstrap();need(this.#pumping&&this.#startupCallbackBound===0);currentFootprintInverseStartupCallbackBudget(records);this.#startupCallbackBound=records;}
  public originalStartupCallbackArms():readonly Readonly<{role:CurrentFootprintInverseStartupCallbackRole;id:string}>[]{this.requireConstructionBootstrap();return Object.freeze(STARTUP_ROLES.map(role=>{const id=this.#constructionPoints.get(role);need(id!==undefined);return Object.freeze({role,id});}));}
  public requestStartupCallback(command:CurrentFootprintInverseStartupCallbackCommand):Promise<unknown>{const held=this.#startupCallbackHeld;need(!this.#failed&&this.#pumping&&held!==null&&held.delivered);if(command.phase==="project-save-structure-resume"){need(command.role===held.role&&!held.resumeAttempted&&this.#startupCallbackHelpers.length===0);held.resumeAttempted=true;}else{need(!held.resumeAttempted);}return this.#bindings.startupCallbackRequest(command);}
  public expectStartupCallbackHelper(program:string):void{need(this.#pumping&&this.#startupCallbackHeld!==null&&!this.#startupCallbackHeld.resumeAttempted&&this.#startupCallbackHelpers.length===0);this.#startupCallbackHelpers.push({program,scriptId:null});}
  public async qualifyStartupCallbackHelper(program:string):Promise<void>{const original=this.#startupCallbackHelpers[0];need(this.#pumping&&this.#startupCallbackHeld!==null&&original!==undefined&&original.program===program&&original.scriptId!==null);const reply=await this.#bindings.startupCallbackRequest({phase:"inverse-startup-callback-helper",method:"Debugger.getScriptSource",params:{scriptId:original.scriptId}});await this.#current();need(record(reply)&&Reflect.ownKeys(reply).length===1&&reply["scriptSource"]===program&&this.#startupCallbackHelpers[0]===original);this.#startupCallbackHelpers.shift();}
  public async nextStartupCallbackEvent():Promise<DiagnosticEvent>{const held=this.#startupCallbackHeld;need(this.#pumping&&held!==null);if(!held.delivered){held.delivered=true;return held.event;}need(held.resumeAttempted&&this.#startupCallbackHelpers.length===0);const event=await this.#next();need(this.#pair!==null&&event.sessionId===this.#pair.pageSessionId&&event.method==="Debugger.resumed"&&Reflect.ownKeys(event.params).length===0&&this.#startupCallbackHeld===held);this.#startupCallbackHeld=null;return event;}
  public expectTimerArm(role: "entry" | "returned"): void { this.requireConstructionBootstrap(); need(this.#pumping && this.#timerArming === null && !this.#timerPoints.has(role)); this.#timerArming = role; }
  public registerTimerArm(role: "entry" | "returned", id: string): void {
    this.requireConstructionBootstrap(); need(this.#pumping && this.#timerArming === role && token(id) && !this.#timerPoints.has(role) && ![...this.#timerPoints.values()].includes(id));
    for (const [resolved, value] of this.#timerResolutions) { if (value === role) { need(resolved === id); } } this.#timerPoints.set(role, id); this.#timerArming = null;
  }
  public requireTimerArmed(): void { need(!this.#failed && this.#timerPoints.size === 2 && this.#timerArming === null && this.#timerHelpers.length === 0); }
  public expectTimerHelper(program: string): void {
    need(!this.#failed && this.#pumping && (this.#constructionHeld === "bootstrap" && this.#constructionResume === null || this.#timerHeld !== null && !this.#timerHeld.resumeAttempted) && this.#timerHelpers.length === 0 && typeof program === "string" && program.length <= 65_536);
    this.#timerHelpers.push({ program, scriptId: null });
  }
  public async qualifyTimerHelper(program: string): Promise<void> {
    const original = this.#timerHelpers[0]; need(original !== undefined && original.program === program && original.scriptId !== null);
    const reply = await this.#bindings.timerRequest({ phase: "inverse-timer-helper", method: "Debugger.getScriptSource", params: { scriptId: original.scriptId } }); await this.#current();
    need(record(reply) && Reflect.ownKeys(reply).length === 1 && reply["scriptSource"] === program && this.#timerHelpers[0] === original); this.#timerHelpers.shift();
  }
  public requestTimer(command: CurrentFootprintInverseTimerCommand): Promise<unknown> { need(!this.#failed && this.#pumping); return this.#bindings.timerRequest(command); }
  public reserveTimerResume(role: "entry" | "returned"): void { const held = this.#timerHeld; need(this.#pumping && held !== null && held.role === role && held.delivered && !held.resumeAttempted && this.#timerHelpers.length === 0); held.resumeAttempted = true; }
  public async nextTimerEvent(): Promise<DiagnosticEvent> {
    need(this.#pumping && !this.#failed && this.#pair !== null); let held = this.#timerHeld;
    if (held === null) {
      need(this.#timerEntryObserved && !this.#timerReturnObserved); const actual = await this.#next(); const hits = actual.params["hitBreakpoints"];
      need(actual.sessionId === this.#pair.pageSessionId && actual.method === "Debugger.paused" && Array.isArray(hits) && hits.length === 1 && hits[0] === this.#timerPoints.get("returned"));
      held = { role: "returned", event: actual, delivered: false, resumeAttempted: false }; this.#timerHeld = held; this.#timerReturnObserved = true;
    }
    if (!held.delivered) { held.delivered = true; return held.event; }
    need(held.resumeAttempted && this.#timerHelpers.length === 0); const resumed = await this.#next();
    need(resumed.sessionId === this.#pair.pageSessionId && resumed.method === "Debugger.resumed" && Reflect.ownKeys(resumed.params).length === 0 && this.#timerHeld === held); this.#timerHeld = null; return resumed;
  }
  public completeTimer(): void { need(this.#pumping && !this.#failed && !this.#timerCompleted && this.#timerEntryObserved && this.#timerReturnObserved && this.#timerHeld === null && this.#timerHelpers.length === 0); this.#timerCompleted = true; }
  public requireTimerCompleted(): void { need(!this.#failed && this.#timerCompleted && this.#timerHeld === null && this.#timerHelpers.length === 0); }
  public bindInitialSyncLane():void{this.requireConstructionBootstrap();need(this.#pumping&&!this.#initialSyncBound&&this.#initialCacheBound>0);this.#initialSyncBound=true;}
  public originalInitialSyncArms():readonly Readonly<{role:typeof SYNC_ROLES[number];id:string}>[]{this.requireConstructionBootstrap();return Object.freeze(SYNC_ROLES.map(role=>{const point=this.#producerPoints.get(`project-save-producer-arm-${role}`);need(point!==undefined);return Object.freeze({role,id:point.id});}));}
  public originalInitialSyncHeldRole():typeof SYNC_ROLES[number]{need(this.#pumping&&this.#initialSyncHeld!==null);return this.#initialSyncHeld.role;}
  public requestInitialSyncCall(command:CurrentFootprintInverseInitialSyncNativeCommand):Promise<unknown>{need(!this.#failed&&this.#pumping&&this.#initialSyncBound);const held=this.#initialSyncHeld;if(command.phase==="inverse-initial-sync-settled"){need(held===null);}else{need(held!==null&&held.delivered&&!held.resumeAttempted);if(command.phase==="inverse-initial-sync-resume"){need(command.role===held.role||held.role==="syncHistory"&&command.role.startsWith("syncHistory"));need(this.#initialSyncHelpers.length===0);held.resumeAttempted=true;}}return this.#bindings.initialSyncRequest(command);}
  public expectInitialSyncHelper(program:string):void{need(this.#pumping&&this.#initialSyncHeld!==null&&!this.#initialSyncHeld.resumeAttempted&&this.#initialSyncHelpers.length===0);this.#initialSyncHelpers.push({program,scriptId:null});}
  public async qualifyInitialSyncHelper(program:string):Promise<void>{const original=this.#initialSyncHelpers[0];need(this.#pumping&&this.#initialSyncHeld!==null&&original!==undefined&&original.program===program&&original.scriptId!==null);const reply=await this.#bindings.initialSyncRequest({phase:"inverse-initial-sync-helper",method:"Debugger.getScriptSource",params:{scriptId:original.scriptId}});await this.#current();need(record(reply)&&Reflect.ownKeys(reply).length===1&&reply["scriptSource"]===program&&this.#initialSyncHelpers[0]===original);this.#initialSyncHelpers.shift();}
  public async nextInitialSyncEvent():Promise<DiagnosticEvent>{const held=this.#initialSyncHeld;need(this.#pumping&&held!==null);if(!held.delivered){held.delivered=true;return held.event;}need(held.resumeAttempted&&this.#initialSyncHelpers.length===0);const event=await this.#next();need(this.#pair!==null&&event.sessionId===this.#pair.pageSessionId&&event.method==="Debugger.resumed"&&Reflect.ownKeys(event.params).length===0&&this.#initialSyncHeld===held);this.#initialSyncHeld=null;return event;}
  public queueInitialSyncSettlement(run:()=>Promise<void>):Promise<boolean>{this.requireColdStartupCustody();need(!this.#pumping&&this.#initialSyncHeld===null&&!this.#initialSyncSettlementAttempted&&this.#coldStartupWork===null&&typeof run==="function"&&!types.isProxy(run));this.#initialSyncSettlementAttempted=true;const result=Promise.withResolvers<boolean>();this.#coldStartupWork=Object.freeze({run,result});return result.promise;}
  public bindInitialCacheJobs(jobs:number):void{this.requireConstructionBootstrap();need(this.#pumping&&this.#initialCacheBound===0);currentFootprintInverseInitialCacheBudget(jobs);this.#initialCacheBound=jobs;}
  public originalInitialCacheArms():readonly Readonly<{role:CurrentFootprintInverseInitialCacheRole;id:string}>[]{this.requireConstructionBootstrap();return Object.freeze(CACHE_ROLES.map(role=>{const point=this.#producerPoints.get(`project-save-producer-arm-${role}`);need(point!==undefined);return Object.freeze({role,id:point.id});}));}
  public originalInitialCacheHeldRole():CurrentFootprintInverseInitialCacheRole{need(this.#pumping&&this.#initialCacheHeld!==null);return this.#initialCacheHeld.role;}
  public requestInitialCache(command:CurrentFootprintInverseInitialCacheCommand):Promise<unknown>{need(!this.#failed&&this.#pumping&&this.#initialCacheBound>0);const held=this.#initialCacheHeld;if(command.phase==="inverse-initial-cache-settled"){need(held===null);}else{need(held!==null&&held.delivered&&!held.resumeAttempted);if(command.phase==="inverse-initial-cache-resume"){need(command.role===held.role&&this.#initialCacheHelpers.length===0);held.resumeAttempted=true;}}return this.#bindings.initialCacheRequest(command);}
  public expectInitialCacheHelper(program:string):void{need(this.#pumping&&this.#initialCacheHeld!==null&&!this.#initialCacheHeld.resumeAttempted&&this.#initialCacheHelpers.length===0);this.#initialCacheHelpers.push({program,scriptId:null});}
  public async qualifyInitialCacheHelper(program:string):Promise<void>{const original=this.#initialCacheHelpers[0];need(this.#pumping&&this.#initialCacheHeld!==null&&original!==undefined&&original.program===program&&original.scriptId!==null);const reply=await this.#bindings.initialCacheRequest({phase:"inverse-initial-cache-helper",method:"Debugger.getScriptSource",params:{scriptId:original.scriptId}});await this.#current();need(record(reply)&&Reflect.ownKeys(reply).length===1&&reply["scriptSource"]===program&&this.#initialCacheHelpers[0]===original);this.#initialCacheHelpers.shift();}
  public async nextInitialCacheEvent():Promise<DiagnosticEvent>{const held=this.#initialCacheHeld;need(this.#pumping&&held!==null);if(!held.delivered){held.delivered=true;return held.event;}need(held.resumeAttempted&&this.#initialCacheHelpers.length===0);const event=await this.#next();need(this.#pair!==null&&event.sessionId===this.#pair.pageSessionId&&event.method==="Debugger.resumed"&&Reflect.ownKeys(event.params).length===0&&this.#initialCacheHeld===held);this.#initialCacheHeld=null;return event;}
  public queueInitialCacheSettlement(run:()=>Promise<void>):Promise<boolean>{this.requireColdStartupCustody();need(!this.#pumping&&this.#initialCacheHeld===null&&!this.#initialCacheSettlementAttempted&&this.#coldStartupWork===null&&typeof run==="function"&&!types.isProxy(run));this.#initialCacheSettlementAttempted=true;const result=Promise.withResolvers<boolean>();this.#coldStartupWork=Object.freeze({run,result});return result.promise;}
  public queueColdRead(held:Readonly<{role:CurrentPcbViaSavedLoadRole;event:WorkerEvent}>,run:()=>Promise<void>):Promise<boolean>{this.requireColdStartupHeld(held);need(held.role==="ready"&&!this.#pumping&&!this.#startupQueueReading&&!this.#startupQueueReads.has(held)&&this.#coldStartupWork===null&&this.#startupCallbackHeld===null&&typeof run==="function"&&!types.isProxy(run));this.#startupQueueReads.add(held);const result=Promise.withResolvers<boolean>();this.#coldStartupWork=Object.freeze({run:async():Promise<void>=>{this.requireColdStartupHeld(held);this.#startupQueueReading=true;try{await run();this.requireColdStartupHeld(held);}finally{this.#startupQueueReading=false;}},result});return result.promise;}
  public requestStartupQueue(command:CurrentFootprintInverseStartupQueueCommand):Promise<unknown>{need(!this.#failed&&this.#pumping&&this.#startupQueueReading&&this.#coldStartupHeld?.role==="ready"&&this.#startupCallbackHeld===null);return this.#bindings.startupQueueRequest(command);}
  public expectStartupQueueHelper(program:string):void{need(this.#pumping&&this.#startupQueueReading&&this.#coldStartupHeld?.role==="ready"&&this.#startupQueueHelpers.length===0);this.#startupQueueHelpers.push({program,scriptId:null});}
  public async qualifyStartupQueueHelper(program:string):Promise<void>{const original=this.#startupQueueHelpers[0];need(this.#pumping&&this.#startupQueueReading&&original!==undefined&&original.program===program&&original.scriptId!==null);const reply=await this.#bindings.startupQueueRequest({phase:"inverse-startup-queue-helper",method:"Debugger.getScriptSource",params:{scriptId:original.scriptId}});await this.#current();need(record(reply)&&Reflect.ownKeys(reply).length===1&&reply["scriptSource"]===program&&this.#startupQueueHelpers[0]===original);this.#startupQueueHelpers.shift();}
  public queueColdContinuation(held:Readonly<{role:CurrentPcbViaSavedLoadRole;event:WorkerEvent}>,run:()=>Promise<void>):Promise<boolean>{this.requireColdStartupHeld(held);need(!this.#pumping&&this.#coldStepPending===null&&this.#coldStartupWork===null&&this.#constructionWork===null&&this.#bootstrapSetupWork===null&&!this.#coldStepAttempts.has(held)&&typeof run==="function"&&!types.isProxy(run));this.#coldStepAttempts.add(held);const result=Promise.withResolvers<boolean>();this.#coldStartupWork=Object.freeze({run,result});return result.promise;}
  public reserveColdStep(held:Readonly<{role:CurrentPcbViaSavedLoadRole;event:WorkerEvent}>):void{this.requireColdStartupHeld(held);need(this.#pumping&&this.#coldStepAttempts.has(held)&&this.#coldStepPending===null&&this.#coldHelpers.length===0);this.#coldStepPending=held;this.#coldStartupHeld=null;}
  public requestColdStep(command:CurrentFootprintInverseColdStepCommand):Promise<unknown>{need(!this.#failed&&this.#pumping&&this.#coldStepPending!==null&&this.#coldStepPending.role===command.role&&this.#coldStartupHeld===null);return this.#bindings.coldStepRequest(command);}
  public async observeColdStepResumed(held:Readonly<{role:CurrentPcbViaSavedLoadRole;event:WorkerEvent}>):Promise<void>{need(this.#pumping&&this.#coldStepPending===held&&this.#coldStartupHeld===null);const event=await this.#next();need(this.#pair!==null&&event.sessionId===this.#pair.pageSessionId&&event.method==="Debugger.resumed"&&Reflect.ownKeys(event.params).length===0);this.#coldStepPending=null;}
  public queueColdStartup(run:()=>Promise<void>):Promise<boolean>{this.requireConstructionBootstrap();need(!this.#failed&&!this.#coldStartupAttempted&&!this.#pumping&&this.#bootstrapSetupAttempted&&this.#bootstrapSetupWork===null&&this.#constructionWork===null&&this.#coldPoints.size===13&&this.#producerPoints.size===37&&this.#coldHelpers.length===0&&this.#producerHelpers.length===0&&typeof run==="function"&&!types.isProxy(run));this.#coldStartupAttempted=true;const result=Promise.withResolvers<boolean>();this.#coldStartupWork=Object.freeze({run,result});return result.promise;}
  public reserveColdBootstrap():void{this.requireConstructionBootstrap();need(this.#pumping&&this.#coldStartupAttempted&&!this.#coldStartupStarted&&this.#coldPoints.size===13&&this.#producerPoints.size===37&&this.#coldHelpers.length===0&&this.#producerHelpers.length===0);this.#constructionHeld=null;this.#constructionResume="bootstrap";}
  public requireColdStartupCustody():void{need(!this.#failed&&this.#coldStartupAttempted&&this.#pair!==null&&(this.#coldStartupStarted||this.#constructionHeld==="bootstrap"&&this.#constructionResume===null||this.#constructionHeld===null&&this.#constructionResume==="bootstrap"));}
  public originalColdStartupHeld():Readonly<{role:CurrentPcbViaSavedLoadRole;event:WorkerEvent}>{need(this.#coldStartupHeld!==null);this.requireColdStartupHeld(this.#coldStartupHeld);return this.#coldStartupHeld;}
  public requireColdStartupHeld(value:Readonly<{role:CurrentPcbViaSavedLoadRole;event:WorkerEvent}>):void{need(!this.#failed&&this.#coldStartupStarted&&this.#coldStartupHeld===value);}
  async #serviceStartupEvent(event:WorkerEvent):Promise<boolean>{
    const hits=event.params["hitBreakpoints"];if(event.method!=="Debugger.paused"||!Array.isArray(hits)||hits.length!==1){return false;}
    if(hits[0]===this.#timerPoints.get("entry")){this.requireTimerArmed();need(!this.#timerEntryObserved&&!this.#timerCompleted&&this.#timerHeld===null);this.#timerEntryObserved=true;this.#timerHeld={role:"entry",event,delivered:false,resumeAttempted:false};await this.#bindings.timerHeld();await this.#current();this.requireTimerCompleted();return true;}
    const sync=SYNC_ROLES.find(role=>this.#producerPoints.get(`project-save-producer-arm-${role}`)?.id===hits[0]);
    if(sync!==undefined){need(this.#initialSyncBound&&this.#initialSyncHolds<9&&this.#initialSyncHeld===null);this.#initialSyncHolds+=1;this.#initialSyncHeld={role:sync,event,delivered:false,resumeAttempted:false};await this.#bindings.initialSyncHeld();await this.#current();need(this.#initialSyncHeld===null&&this.#initialSyncHelpers.length===0);return true;}
    const cache=CACHE_ROLES.find(role=>this.#producerPoints.get(`project-save-producer-arm-${role}`)?.id===hits[0]);
    if(cache!==undefined){need(this.#initialCacheBound>0&&this.#initialCacheHolds<3*this.#initialCacheBound&&this.#initialCacheHeld===null);this.#initialCacheHolds+=1;this.#initialCacheHeld={role:cache,event,delivered:false,resumeAttempted:false};await this.#bindings.initialCacheHeld();await this.#current();need(this.#initialCacheHeld===null&&this.#initialCacheHelpers.length===0);return true;}
    const startup=STARTUP_ROLES.find(role=>this.#constructionPoints.get(role)===hits[0]);
    if(startup!==undefined){need(this.#startupCallbackBound>0&&this.#startupCallbackHolds<3*this.#startupCallbackBound&&this.#startupCallbackHeld===null);this.#startupCallbackHolds+=1;this.#startupCallbackHeld={role:startup,event,delivered:false,resumeAttempted:false};await this.#bindings.startupCallbackHeld(startup,event);await this.#current();need(this.#startupCallbackHeld===null&&this.#startupCallbackHelpers.length===0);return true;}
    return false;
  }
  public async nextColdStartupHeld():Promise<Readonly<{role:CurrentPcbViaSavedLoadRole;event:WorkerEvent}>>{
    need(this.#pumping&&this.#coldStartupStarted&&this.#coldStartupHeld===null&&this.#unsupportedStartupHeld===null&&this.#startupCallbackHeld===null);
    let event:WorkerEvent;for(;;){event=await this.#next();if(!await this.#serviceStartupEvent(event)){break;}}
    this.#unsupportedStartupHeld=event;need(this.#source!==null&&this.#pair!==null);
    const points=Object.freeze([...this.#coldPoints].map(([role,id])=>Object.freeze({role,id})));
    const role=classifyCurrentFootprintInverseColdPause(event,this.#pair.pageSessionId,this.#source.scriptId,points);
    this.#unsupportedStartupHeld=null;
    const held=Object.freeze({role,event});this.#coldStartupHeld=held;return held;
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
    if (event.method === "Debugger.resumed") { need(this.#constructionResume !== null && Reflect.ownKeys(event.params).length === 0);if(this.#constructionResume==="bootstrap"){need(this.#coldStartupAttempted&&!this.#coldStartupStarted);this.#coldStartupStarted=true;} this.#constructionResume = null; return { ...event, method: "Debugger.resumed", sessionId: event.sessionId }; }
    need(event.method === "Debugger.paused" && this.#constructionHeld === null && this.#constructionResume === null);
    const frames = event.params["callFrames"], hits = event.params["hitBreakpoints"];
    need(Array.isArray(hits) && hits.length === 1 && Array.isArray(frames) && frames.length > 0 && record(frames[0]));
    const location = frames[0]["location"], selected = [...this.#constructionPoints].find(([, id]) => id === hits[0]);
    need(selected !== undefined && record(location) && this.#source !== null && location["scriptId"] === this.#source.scriptId && location["lineNumber"] === SITES[selected[0]].lineNumber && location["columnNumber"] === SITES[selected[0]].columnNumber);
    this.#constructionHeld = selected[0]; await this.#bindings.constructionHeld(selected[0], event); await this.#current(); return { ...event, method: "Debugger.paused", sessionId: event.sessionId };
  }
  public async pump(): Promise<void> {
    need(!this.#failed); if (this.#browser === null || this.#page === null || this.#pumping || this.#result !== null && this.#constructionWork === null && this.#bootstrapSetupWork === null&&this.#coldStartupWork===null) { return; }
    this.#pumping = true;
    try {
      if (this.#result === null) { await this.observeProjectSourceHeld(); }
      else { const work = this.#constructionWork ?? this.#bootstrapSetupWork??this.#coldStartupWork; need(work !== null); if (this.#constructionWork === work) { this.#constructionWork = null; } else if(this.#bootstrapSetupWork===work) { this.#bootstrapSetupWork = null; this.requireConstructionBootstrap(); }else{need(this.#coldStartupWork===work);this.#coldStartupWork=null;if(this.#coldStartupStarted){this.requireColdStartupCustody();}else{this.requireConstructionBootstrap();}}
        try { await work.run(); work.result.resolve(true); } catch (error) { work.result.reject(error); throw error; } }
    } catch (error) { this.fail(); throw error; } finally { this.#pumping = false; }
  }
  public status(): Readonly<{ pumping: boolean; failed: boolean; pairJoined: boolean; projectSourceHeld: boolean; sourceCallbackSettled: boolean; projectExecutionAuthorized: false }> {
    return Object.freeze({ pumping: this.#pumping, failed: this.#failed, pairJoined: this.#pair !== null, projectSourceHeld: this.#source !== null, sourceCallbackSettled: this.#result !== null, projectExecutionAuthorized: false });
  }
}
