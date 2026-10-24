/* oxlint-disable eslint/max-classes-per-file -- Private owner composition and fixed-generation wrappers stay together so native callers cannot inject a runner or source profile. */
/** Private startup owner composition, allocated only by the separate startup
 * lifecycle. It owns initial waiting/instrumentation cleanup and delegates
 * only the separately reviewed construction vocabulary after complete source
 * qualification through the original native process and pipe. */
import { createHash } from "node:crypto";
import { types } from "node:util";
import { z } from "zod";
import { CURRENT_PCB_209_WORKER_STARTUP_SOURCE } from "./current-pcb-209-worker-startup-profile.ts";
import { CURRENT_PCB_209_WORKER_BOOTSTRAP_ROLES, CURRENT_PCB_209_WORKER_PRELOAD_LOG, currentPcb209StartupScriptRole,
  isCurrentPcb209BootstrapTargetUrl, qualifyCurrentPcb209StartupScriptSource } from "./current-pcb-209-worker-bootstrap-source.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_PCB_DIAGNOSTIC_WORKER_SCRIPT } from "./current-pcb-diagnostic-worker-context.ts";
import type { DiagnosticWorkerScriptProfile } from "./current-pcb-diagnostic-worker-context.ts";
import { CurrentPcb209WorkerConstructionRunner, CurrentPcbWorkerConstructionRunner } from "./current-pcb-worker-construction-runner.ts";
import type { CurrentPcb209WorkerConstructionPacket, CurrentPcbWorkerConstructionPacket } from "./current-pcb-worker-construction-runner.ts";
import type { CurrentPcbWorkerConstructionCommand, CurrentPcbWorkerConstructionTransport } from "./current-pcb-worker-construction-contract.ts";
import { CURRENT_PCB_WORKER_STARTUP_ATTACH } from "./current-pcb-worker-startup-contract.ts";
import type { CurrentPcbWorkerStartupCommand, CurrentPcbWorkerStartupDependency, CurrentPcbWorkerStartupEvent } from "./current-pcb-worker-startup-contract.ts";

const INTERNAL_PROFILE = Symbol("fixed-worker-startup-transport-profile");
const token = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
const sessionToken = token.max(128);
const expectedProjectSchema = z.object({ projectUuid: z.string().regex(/^[a-f\d]{64}$/u),
  branchUuid: z.string().regex(/^[a-f\d]{32}$/u), windowTabId: z.string().regex(/^[A-Za-z\d_-]{1,128}$/u) }).strict();
const empty = z.object({}).strict();
const targetSchema = z.looseObject({ targetId: token, type: z.literal("worker"), attached: z.literal(true),
  title: z.string().max(8192), url: z.string().max(8192) });
const inventoryTargetSchema = z.looseObject({ targetId: token, type: z.string().min(1).max(64), attached: z.boolean(),
  title: z.string().max(8192), url: z.string().max(8192) });
const inventorySchema = z.object({ targetInfos: z.array(inventoryTargetSchema).max(256) }).strict();
const contextSchema = z.object({ id: z.number().int().positive(), origin: z.string().max(8192),
  name: z.string().max(8192), uniqueId: token }).strict();
const scriptSchema = z.looseObject({ scriptId: token, executionContextId: z.number().int().positive(),
  url: z.string().max(8192), hasSourceURL: z.literal(false).optional(), isLiveEdit: z.literal(false).optional(),
  scriptLanguage: z.literal("JavaScript").optional() });
const initialFrameSchema = z.looseObject({ location: z.looseObject({ scriptId: token }) });
const initialPauseSchema = z.looseObject({ reason: z.literal("instrumentation"),
  data: z.looseObject({ scriptId: token }), hitBreakpoints: z.array(token).max(1),
  callFrames: z.array(initialFrameSchema).min(1).max(16) });
const preloadArgumentSchema = z.object({ type: z.literal("string"), value: z.literal(CURRENT_PCB_209_WORKER_PRELOAD_LOG.message) }).strict();
const preloadLogFrameSchema = z.looseObject({ functionName: z.string().max(256), scriptId: token,
  url: z.string().max(8192), lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const preloadLogStackSchema = z.looseObject({ callFrames: z.array(preloadLogFrameSchema).min(1).max(16) });
const preloadLogSchema = z.object({ type: z.literal("log"), args: z.tuple([preloadArgumentSchema]),
  executionContextId: z.number().int().positive(), timestamp: z.number().nonnegative(), stackTrace: preloadLogStackSchema }).strict();
const PAUSE_MS = 5000, REQUEST_MS = 2000, WAIT_MS = 15_000;
type Worker = Readonly<{ sessionId: string; target: z.infer<typeof targetSchema>; waitingForDebugger: boolean }>;
type ExistingWorker = Readonly<{ targetId: string; title: string; url: string }>;
const eventMethods = ["Target.attachedToTarget", "Target.detachedFromTarget", "Target.targetDestroyed", "Target.targetInfoChanged",
  "Runtime.executionContextCreated", "Runtime.executionContextDestroyed", "Runtime.executionContextsCleared", "Runtime.exceptionThrown",
  "Runtime.consoleAPICalled", "Debugger.scriptParsed", "Debugger.paused", "Debugger.resumed"] as const;
const eventReasons = ["EVENT_BUDGET", "ATTACHMENT", "EXISTING_WORKER_CHANGED", "EXISTING_WORKER_SELECTED", "EXISTING_WORKER_PAUSED", "WORKER_NOT_WAITING",
  "EXTRA_WORKER", "WORKER_URL", "WORKER_TITLE", "EVENT_SESSION", "CONTEXT", "SCRIPT", "UNEXPECTED_PAUSE",
  "UNEXPECTED_RESUME", "UNEXPECTED_EVENT"] as const;
type EventMethod = typeof eventMethods[number] | "other" | "unparsed";
type EventReason = typeof eventReasons[number] | "MALFORMED_EVENT";
type RejectedTarget = Readonly<{ targetId: string; sessionId: string; waitingForDebugger: boolean;
  urlSha256: string; urlBytes: number; urlRole: "bootstrap" | "preload" | "project" | "other";
  urlProtocol: string | null; urlHostname: string | null; urlPathname: string | null;
  urlQueryKeys: readonly string[]; titleSha256: string; titleMatchesExpected: boolean }>;
type EventFailure = Readonly<{ method: EventMethod; reason: EventReason; target?: RejectedTarget }>;
type StartupRole = typeof CURRENT_PCB_209_WORKER_BOOTSTRAP_ROLES[number];
interface BootstrapStage {
  readonly role: StartupRole;
  readonly paused: PromiseWithResolvers<unknown>;
  readonly resumed: PromiseWithResolvers<null>;
  script: z.infer<typeof scriptSchema> | null;
  pauseSeen: boolean;
  sourceQualified: boolean;
  resume: Promise<void> | null;
  resumeSeen: boolean;
  watchdog: ReturnType<typeof setTimeout> | undefined;
}
type Subscriber = Parameters<CurrentPcbWorkerConstructionTransport["subscribe"]>[0];
function failure(code: string): Error { return new Error(`PCB_WORKER_STARTUP_${code}`); }
function eventReason(error: unknown): EventReason {
  if (error === null || typeof error !== "object" || types.isProxy(error)) { return "MALFORMED_EVENT"; }
  const message: unknown = Object.getOwnPropertyDescriptor(error, "message")?.value;
  return eventReasons.find(reason => message === `PCB_WORKER_STARTUP_${reason}`) ?? "MALFORMED_EVENT";
}
async function bounded<T>(work: Promise<T>, milliseconds = REQUEST_MS): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = Promise.withResolvers<never>();
  try { timer = setTimeout(() => { deadline.reject(failure("DEADLINE")); }, milliseconds); return await Promise.race([work, deadline.promise]); }
  finally { clearTimeout(timer); }
}
async function observe(work: Promise<unknown>): Promise<void> {
  try { await work; } catch {
    // The original operation and retained status report failure.
  }
}
async function withoutValue(work: Promise<null>): Promise<void> { await work; }
function members(dependency: CurrentPcbWorkerStartupDependency): readonly unknown[] {
  if (dependency === null || typeof dependency !== "object" || types.isProxy(dependency) || Array.isArray(dependency) ||
      Object.getPrototypeOf(dependency) !== Object.prototype && Object.getPrototypeOf(dependency) !== null) { throw failure("DEPENDENCY"); }
  const fields = ["parentTargetId", "parentSessionId", "assertOriginalOwner", "assertOriginalTermination", "request", "subscribe"] as const;
  const keys = Reflect.ownKeys(dependency);
  if (keys.length !== fields.length || keys.some(key => typeof key !== "string" || !fields.some(field => field === key))) { throw failure("DEPENDENCY"); }
  return fields.map(key => {
    const descriptor = Object.getOwnPropertyDescriptor(dependency, key);
    if (descriptor === undefined || !Object.hasOwn(descriptor, "value") ||
        typeof descriptor.value !== (key === "parentTargetId" || key === "parentSessionId" ? "string" : "function")) { throw failure("DEPENDENCY"); }
    return descriptor.value as unknown;
  });
}

type ConstructionPacket = CurrentPcbWorkerConstructionPacket | CurrentPcb209WorkerConstructionPacket;
interface ConstructionRunner<Packet extends ConstructionPacket> {
  readonly capture: () => Promise<Packet>;
  readonly requireOriginal: (packet: Packet) => ReturnType<CurrentPcbWorkerConstructionRunner["requireOriginal"]>;
  readonly status: () => ReturnType<CurrentPcbWorkerConstructionRunner["status"]>;
  readonly whenArmed: () => Promise<void>;
}
class CurrentPcbWorkerStartupTransportCore<Packet extends ConstructionPacket, Runner extends ConstructionRunner<Packet>> {
  readonly #createRunner: (transport: CurrentPcbWorkerConstructionTransport) => Runner;
  readonly #dependency: CurrentPcbWorkerStartupDependency;
  readonly #originalMembers: readonly unknown[];
  readonly #send: CurrentPcbWorkerStartupDependency["request"];
  readonly #assertOwner: CurrentPcbWorkerStartupDependency["assertOriginalOwner"];
  readonly #assertTermination: CurrentPcbWorkerStartupDependency["assertOriginalTermination"];
  readonly #subscribe: CurrentPcbWorkerStartupDependency["subscribe"];
  readonly #parentSession: string;
  readonly #parentTarget: string;
  readonly #profile: DiagnosticWorkerScriptProfile;
  readonly #bootstrap209: boolean;
  readonly #bootstrapStages: readonly BootstrapStage[];
  #bootstrapIndex = 0;
  #preloadLogSeen = false;
  readonly #attached = Promise.withResolvers<Worker>();
  readonly #armed = Promise.withResolvers<null>();
  readonly #initialPaused = Promise.withResolvers<unknown>();
  readonly #initialResumed = Promise.withResolvers<null>();
  readonly #waiting = new Map<string, Promise<void>>();
  readonly #workers = new Map<string, Worker>();
  #existingWorkers: ReadonlyMap<string, ExistingWorker> | null = null;
  readonly #backgroundWorkers = new Set<string>();
  #firstEventFailure: EventFailure | null = null;
  #worker: Worker | null = null;
  #expectedProject: z.infer<typeof expectedProjectSchema> | null = null;
  #context: z.infer<typeof contextSchema> | null = null;
  #script: z.infer<typeof scriptSchema> | null = null;
  #instrumentation: string | null = null;
  #instrumentationUncertain = false;
  #removeInstrumentation: Promise<void> | null = null;
  #instrumentationRemoved = false;
  #initialResume: Promise<void> | null = null;
  #initialPauseSeen = false;
  #initialResumeSeen = false;
  #initialPauseWatchdog: ReturnType<typeof setTimeout> | undefined;
  #runner: Runner | null = null;
  #constructionCapture: Promise<Packet> | null = null;
  #subscriber: Subscriber | null = null;
  #unsubscribe: (() => void) | null = null;
  #failure: Error | null = null;
  #started = false;
  #settled = false;
  #sourceQualified = false;
  #released = false;
  #events = 0;
  #eventBytes = 0;
  #requests = 0;
  #cleanup: Promise<void> | null = null;

  public constructor(internal: typeof INTERNAL_PROFILE, dependency: CurrentPcbWorkerStartupDependency,
    profile: DiagnosticWorkerScriptProfile, createRunner: (transport: CurrentPcbWorkerConstructionTransport) => Runner,
    bootstrap209 = false) {
    if (internal !== INTERNAL_PROFILE) { throw failure("INTERNAL_PROFILE"); } this.#createRunner = createRunner;
    this.#originalMembers = members(dependency); this.#dependency = dependency;
    this.#parentSession = sessionToken.parse(dependency.parentSessionId); this.#parentTarget = sessionToken.parse(dependency.parentTargetId);
    this.#send = dependency.request; this.#assertOwner = dependency.assertOriginalOwner;
    this.#assertTermination = dependency.assertOriginalTermination; this.#subscribe = dependency.subscribe;
    this.#profile = Object.freeze(z.object({ relativePath: z.string().max(512).regex(/^[A-Za-z\d_.-]+(?:\/[A-Za-z\d_.-]+)+\.js$/u),
      scriptBytes: z.number().int().min(1).max(4 * 1024 * 1024), scriptSha256: z.string().regex(/^[a-f\d]{64}$/u) }).strict().parse(profile));
    this.#bootstrap209 = bootstrap209;
    this.#bootstrapStages = bootstrap209 ? CURRENT_PCB_209_WORKER_BOOTSTRAP_ROLES.map(role => ({ role,
      paused: Promise.withResolvers<unknown>(), resumed: Promise.withResolvers<null>(), script: null,
      pauseSeen: false, sourceQualified: false, resume: null, resumeSeen: false, watchdog: undefined })) : [];
    for (const stage of this.#bootstrapStages) { void observe(stage.paused.promise); void observe(stage.resumed.promise); }
    void observe(this.#attached.promise); void observe(this.#armed.promise);
    void observe(this.#initialPaused.promise); void observe(this.#initialResumed.promise);
  }
  public status(): Readonly<{ started: boolean; settled: boolean; failed: boolean; sourceQualified: boolean;
    initialPauseSeen: boolean; initialResumeAttempted: boolean; initialResumeSeen: boolean;
    unresolvedInstrumentation: boolean; attachedWorkers: number; released: boolean;
    existingWorkersBound: boolean; existingWorkersObserved: number; existingWorkersAttached: number; firstEventFailure: EventFailure | null;
    bootstrapStages: readonly Readonly<{ role: StartupRole; parsed: boolean; pauseSeen: boolean;
      sourceQualified: boolean; resumeAttempted: boolean; resumeSeen: boolean }>[]; preloadLogSeen: boolean; requests: number }> {
    return Object.freeze({ started: this.#started, settled: this.#settled, failed: this.#failure !== null,
      sourceQualified: this.#sourceQualified, initialPauseSeen: this.#initialPauseSeen,
      initialResumeAttempted: this.#initialResume !== null || this.#bootstrapStages.some(stage => stage.resume !== null), initialResumeSeen: this.#initialResumeSeen,
      unresolvedInstrumentation: this.#instrumentationUncertain || this.#instrumentation !== null && !this.#instrumentationRemoved,
      attachedWorkers: this.#workers.size, released: this.#released, existingWorkersBound: this.#existingWorkers !== null,
      existingWorkersObserved: this.#existingWorkers?.size ?? 0, existingWorkersAttached: this.#backgroundWorkers.size,
      firstEventFailure: this.#firstEventFailure, requests: this.#requests, preloadLogSeen: this.#preloadLogSeen,
      bootstrapStages: Object.freeze(this.#bootstrapStages.map(stage => Object.freeze({ role: stage.role,
        parsed: stage.script !== null, pauseSeen: stage.pauseSeen, sourceQualified: stage.sourceQualified,
        resumeAttempted: stage.resume !== null, resumeSeen: stage.resumeSeen }))) });
  }
  /** The private opener supplies its checkpoint-selected project and original
   * UI window before auto-attach. This title check is only an early selector;
   * the captured PROJECT receiver still needs its independent identity read. */
  public bindExpectedProject(input: Readonly<{ projectUuid: string; branchUuid: string; windowTabId: string }>): void {
    if (this.#started || this.#expectedProject !== null || this.#failure !== null || this.#released) { throw failure("EXPECTED_PROJECT_CONSUMED"); }
    this.#expectedProject = Object.freeze(expectedProjectSchema.parse(captureCurrentPcbStringClockReply(input).value));
  }
  /** The private opener supplies its fresh, original Target.getTargets reply.
   * Auto-attach also reports existing workers; waitForDebuggerOnStart applies
   * only to new workers. Existing running workers are never debugged, resumed
   * or treated as the selected project worker. Browser-created dedicated-worker
   * placeholders can still have empty URL/title until renderer child reporting;
   * their original target ID, not those empty fields, binds the later attachment.
   * The snapshot is not atomic. */
  public bindExistingWorkers(input: unknown): void {
    if (this.#started || this.#expectedProject === null || this.#existingWorkers !== null || this.#failure !== null || this.#released) {
      throw failure("EXISTING_WORKERS_CONSUMED");
    }
    // Consume before parsing so a refused inventory cannot be replaced by a
    // More permissive caller retry on the same original transport.
    this.#existingWorkers = new Map();
    try {
      const inventory = inventorySchema.parse(captureCurrentPcbStringClockReply(input).value).targetInfos;
      const existing = new Map<string, ExistingWorker>(), ids = new Set<string>();
      let parentFound = false;
      const expectedTitle = `project_${this.#expectedProject.projectUuid}_${this.#expectedProject.windowTabId}`;
      for (const target of inventory) {
        if (ids.has(target.targetId)) { throw failure("EXISTING_WORKERS_INVENTORY"); } ids.add(target.targetId);
        if (target.targetId === this.#parentTarget) {
          if (target.type !== "page" || !target.attached) { throw failure("EXISTING_WORKERS_PARENT"); } parentFound = true;
        }
        if (target.type === "worker") {
          if (target.attached || existing.size >= 15 || target.title === expectedTitle || this.#targetUrl(target.url)) {
            throw failure("EXISTING_WORKERS_INVENTORY");
          }
          existing.set(target.targetId, Object.freeze({ targetId: target.targetId, title: target.title, url: target.url }));
        }
      }
      if (!parentFound) { throw failure("EXISTING_WORKERS_PARENT"); }
      this.#existingWorkers = existing;
    } catch (error) { this.#poison("EXISTING_WORKERS_INVENTORY"); throw error; }
  }
  #poison(code: string): void {
    this.#failure ??= failure(code); this.#attached.reject(this.#failure); this.#initialPaused.reject(this.#failure);
    this.#armed.reject(this.#failure);
    for (const stage of this.#bootstrapStages) { stage.paused.reject(this.#failure); }
    this.#subscriber?.lost();
  }
  /** The project opener may dispatch only after the original auto-attach reply
   * and owner reproof. Calling capture() alone does not establish this barrier. */
  public async whenArmed(): Promise<void> { await this.#armed.promise; await this.#current(); }

  /** A refused opener stops capture through its original listener. Cleanup
   * retains late allocation replies and never detaches or closes live pipes. */
  public abort(): Promise<void> { this.#poison("ABORTED"); return this.cleanup(); }
  #sameDependency(): void {
    if (members(this.#dependency).some((value, index) => value !== this.#originalMembers[index])) { throw failure("DEPENDENCY_CHANGED"); }
  }
  async #current(): Promise<void> {
    if (this.#failure !== null || this.#released) { throw this.#failure ?? failure("RELEASED"); }
    this.#sameDependency(); await bounded(this.#assertOwner.call(this.#dependency)); this.#sameDependency();
    if (this.#failure !== null || this.#released) { throw this.#failure ?? failure("OWNER_CHANGED"); }
  }
  async #request(command: CurrentPcbWorkerStartupCommand, cleanup = false): Promise<unknown> {
    if (!cleanup) { await this.#current(); }
    if (this.#requests >= (cleanup ? 256 : 224)) { this.#poison("REQUEST_BUDGET"); throw failure("REQUEST_BUDGET"); }
    this.#requests += 1;
    const result = captureCurrentPcbStringClockReply(await bounded(this.#send.call(this.#dependency, command))).value;
    if (!cleanup) { await this.#current(); }
    return result;
  }
  readonly #event = (input: CurrentPcbWorkerStartupEvent): void => {
    if (this.#released) { return; }
    let method: EventMethod = "unparsed";
    let rejectedTarget: RejectedTarget | null = null;
    try {
      const captured = captureCurrentPcbStringClockReply(input);
      this.#events += 1; this.#eventBytes += Buffer.byteLength(captured.text);
      if (this.#events > 4096 || this.#eventBytes > 8 * 1024 * 1024) { throw failure("EVENT_BUDGET"); }
      const event = z.object({ method: z.string().max(128), sessionId: sessionToken, params: z.record(z.string(), z.unknown()) }).strict().parse(captured.value);
      method = eventMethods.find(value => value === event.method) ?? "other";
      this.#acceptEvent(event, worker => { rejectedTarget = this.#bootstrap209 ? this.#targetMetadata(worker) : null; });
    } catch (error) {
      this.#firstEventFailure ??= Object.freeze({ method, reason: eventReason(error),
        ...(rejectedTarget === null ? {} : { target: rejectedTarget }) }); this.#poison("EVENT");
    }
  };
  #acceptEvent(event: CurrentPcbWorkerStartupEvent, retainTarget: (worker: Worker) => void): void {
    if (event.sessionId === this.#parentSession && event.method === "Target.attachedToTarget") {
      const params = z.object({ sessionId: sessionToken, targetInfo: targetSchema, waitingForDebugger: z.boolean() }).strict().parse(event.params);
      if (params.sessionId === this.#parentSession || params.targetInfo.targetId === this.#parentTarget ||
          this.#workers.has(params.sessionId) || [...this.#workers.values()].some(value => value.target.targetId === params.targetInfo.targetId) ||
          this.#workers.size >= 16) { throw failure("ATTACHMENT"); }
      const worker = Object.freeze({ sessionId: params.sessionId, target: params.targetInfo, waitingForDebugger: params.waitingForDebugger });
      retainTarget(worker);
      this.#workers.set(worker.sessionId, worker);
      const expected = this.#expectedProject;
      const existing = this.#existingWorkers?.get(worker.target.targetId);
      if (existing !== undefined) {
        if (worker.waitingForDebugger) { this.#releaseRejectedWorker(worker); throw failure("EXISTING_WORKER_PAUSED"); }
        if (expected !== null && worker.target.title === `project_${expected.projectUuid}_${expected.windowTabId}` ||
            this.#targetUrl(worker.target.url)) { throw failure("EXISTING_WORKER_SELECTED"); }
        // Chromium146 WorkerDevToolsManager creates the same token with empty
        // URL/name. Renderer ChildTargetCreated fills both before attachment.
        // Permit only that initial metadata population, never changes to an
        // Already populated inventory. The original parent session and target
        // ID above remain mandatory; neither field qualifies worker source.
        if ((existing.title !== "" || existing.url !== "") &&
            (worker.target.title !== existing.title || worker.target.url !== existing.url)) { throw failure("EXISTING_WORKER_CHANGED"); }
        this.#backgroundWorkers.add(worker.sessionId); return;
      }
      if (!worker.waitingForDebugger) { throw failure("WORKER_NOT_WAITING"); }
      if (this.#worker !== null) { this.#releaseRejectedWorker(worker); throw failure("EXTRA_WORKER"); }
      this.#worker = worker;
      if (!this.#targetUrl(worker.target.url)) { this.#releaseRejectedWorker(worker); throw failure("WORKER_URL"); }
      if (expected !== null && worker.target.title !== `project_${expected.projectUuid}_${expected.windowTabId}`) {
        this.#releaseRejectedWorker(worker); throw failure("WORKER_TITLE");
      }
      // Autoattach can have succeeded before its reply was lost. A later first
      // Attachment still belongs to this original owner and must not remain
      // Waiting merely because the initial empty cleanup already settled.
      if (this.#failure !== null) { void observe(this.#runWaiting(worker)); return; }
      this.#attached.resolve(worker); return;
    }
    const worker = this.#worker;
    if (worker === null || event.sessionId !== worker.sessionId) { throw failure("EVENT_SESSION"); }
    if (event.method === "Runtime.executionContextCreated") {
      const context = z.object({ context: contextSchema }).strict().parse(event.params).context;
      if (this.#context !== null || context.origin !== worker.target.url || context.name !== worker.target.title) { throw failure("CONTEXT"); }
      this.#context = context; return;
    }
    if (event.method === "Debugger.scriptParsed") {
      const script = scriptSchema.parse(event.params);
      // Fixed callFunctionOn programs can produce anonymous parsed scripts.
      // They cannot replace the admitted bootstrap or introduce another world.
      if (this.#sourceQualified && script.url === "" && script.executionContextId === this.#context?.id) { return; }
      if (this.#bootstrap209) { this.#bootstrapScript(script); return; }
      if (this.#script !== null || !this.#sourceUrl(script.url) || script.url !== worker.target.url) { throw failure("SCRIPT"); }
      this.#script = script; return;
    }
    if (event.method === "Debugger.paused") {
      if (this.#bootstrap209 && this.#bootstrapIndex < this.#bootstrapStages.length) {
        this.#bootstrapPaused(event.params); return;
      }
      if (!this.#initialPauseSeen) {
        this.#initialPauseSeen = true;
        this.#initialPauseWatchdog = setTimeout(() => { this.#poison("INITIAL_PAUSE_DEADLINE"); void observe(this.cleanup()); }, PAUSE_MS);
        this.#initialPaused.resolve(event.params);
        if (this.#failure !== null) { void observe(this.#cleanupInitialPause()); } return;
      }
      if (!this.#initialResumeSeen || this.#subscriber === null) { throw failure("UNEXPECTED_PAUSE"); }
      this.#subscriber.paused(event.params); return;
    }
    if (event.method === "Debugger.resumed") {
      empty.parse(event.params);
      if (this.#bootstrap209 && this.#bootstrapIndex < this.#bootstrapStages.length) {
        this.#bootstrapResumed(); return;
      }
      if (!this.#initialResumeSeen) {
        if (this.#initialResume === null) { throw failure("UNEXPECTED_RESUME"); }
        this.#initialResumeSeen = true; clearTimeout(this.#initialPauseWatchdog); this.#initialResumed.resolve(null); return;
      }
      if (this.#subscriber === null) { throw failure("UNEXPECTED_RESUME"); }
      this.#subscriber.resumed(); return;
    }
    if (event.method === "Runtime.consoleAPICalled") {
      if (this.#sourceQualified) { return; }
      if (this.#bootstrap209) { this.#preloadLog(event.params); return; }
    }
    // No context replacement, foreign scripts, worker loss or silent console
    // Exception is accepted by this startup-purpose owner.
    throw failure("UNEXPECTED_EVENT");
  }
  #targetMetadata(worker: Worker): RejectedTarget {
    const value = worker.target.url;
    const role = currentPcb209StartupScriptRole(value);
    let hostname: string | null = null, pathname: string | null = null, protocol: string | null = null;
    let queryKeys: readonly string[] = [];
    try {
      const url = new URL(value); protocol = /^(?:https?|file|blob|data):$/u.test(url.protocol) ? url.protocol : "other";
      hostname = ["client", "modules.lceda.cn", ""].includes(url.hostname) ? url.hostname : "other";
      const paths = { bootstrap: "/editor", preload: "/preload.js", project: "/project-worker.js" } as const;
      pathname = role === null ? "other" : paths[role];
      queryKeys = Object.freeze([...url.searchParams.keys()].slice(0, 8).map(key =>
        ["entry", "cll", "debugOpen"].includes(key) ? key : "other"));
    } catch {
      // The digest retains malformed URL identity without exposing URL values.
    }
    const expected = this.#expectedProject;
    return Object.freeze({ targetId: worker.target.targetId, sessionId: worker.sessionId, waitingForDebugger: worker.waitingForDebugger,
      urlSha256: createHash("sha256").update(value).digest("hex"), urlBytes: Buffer.byteLength(value), urlRole: role ?? "other",
      urlProtocol: protocol, urlHostname: hostname, urlPathname: pathname, urlQueryKeys: queryKeys,
      titleSha256: createHash("sha256").update(worker.target.title).digest("hex"),
      titleMatchesExpected: expected !== null && worker.target.title === `project_${expected.projectUuid}_${expected.windowTabId}` });
  }
  #targetUrl(value: string): boolean {
    return this.#bootstrap209 ? isCurrentPcb209BootstrapTargetUrl(value) : this.#sourceUrl(value);
  }
  #releaseRejectedWorker(worker: Worker): void {
    // Preserve the refusal and its target metadata before cleanup can deliver
    // Synchronous nested events. The original waiting attempt remains consumed.
    if (this.#bootstrap209) {
      void observe((async (): Promise<void> => { await Promise.resolve(); await this.#runWaiting(worker); })());
    }
    else { void observe(this.#runWaiting(worker)); }
  }
  #bootstrapScript(script: z.infer<typeof scriptSchema>): void {
    const stage = this.#bootstrapStages[this.#bootstrapIndex], worker = this.#worker;
    if (stage === undefined || worker === null || stage.script !== null || script.executionContextId !== this.#context?.id ||
        currentPcb209StartupScriptRole(script.url) !== stage.role || stage.role === "bootstrap" && script.url !== worker.target.url) {
      throw failure("SCRIPT");
    }
    stage.script = script;
    if (stage.role === "project") { this.#script = script; }
  }
  #bootstrapPaused(params: Readonly<Record<string, unknown>>): void {
    const stage = this.#bootstrapStages[this.#bootstrapIndex];
    if (stage === undefined || stage.pauseSeen) { throw failure("UNEXPECTED_PAUSE"); }
    stage.pauseSeen = true; this.#initialPauseSeen = true;
    stage.watchdog = setTimeout(() => { this.#poison("INITIAL_PAUSE_DEADLINE"); void observe(this.cleanup()); }, PAUSE_MS);
    stage.paused.resolve(params);
    if (this.#failure !== null) { void observe(this.#cleanupInitialPause()); }
  }
  #bootstrapResumed(): void {
    const stage = this.#bootstrapStages[this.#bootstrapIndex];
    if (stage === undefined || stage.resume === null || !stage.pauseSeen || stage.resumeSeen) { throw failure("UNEXPECTED_RESUME"); }
    stage.resumeSeen = true; clearTimeout(stage.watchdog); stage.resumed.resolve(null); this.#bootstrapIndex += 1;
    if (this.#bootstrapIndex === this.#bootstrapStages.length) { this.#initialResumeSeen = true; }
  }
  #preloadLog(params: Readonly<Record<string, unknown>>): void {
    const profile = CURRENT_PCB_209_WORKER_PRELOAD_LOG, stage = this.#bootstrapStages[1];
    if (this.#preloadLogSeen || stage?.role !== "preload" || !stage.sourceQualified || stage.resume === null || stage.script === null) {
      throw failure("UNEXPECTED_EVENT");
    }
    const log = preloadLogSchema.parse(params);
    const frame = log.stackTrace.callFrames[0];
    if (log.executionContextId !== this.#context?.id || frame?.scriptId !== stage.script.scriptId || frame.url !== stage.script.url ||
        frame.functionName !== profile.functionName || frame.lineNumber !== profile.lineNumber || frame.columnNumber !== profile.columnNumber) {
      throw failure("UNEXPECTED_EVENT");
    }
    this.#preloadLogSeen = true;
  }
  #sourceUrl(value: string): boolean {
    if (!value.isWellFormed() || /[\\\s?#@]/u.test(value) || /\/(?:\.|\.\.)(?:\/|$)/u.test(value)) { return false; }
    try { const url = new URL(value); return url.username === "" && url.password === "" && url.search === "" && url.hash === "" &&
      url.pathname.endsWith(`/${this.#profile.relativePath}`); } catch { return false; }
  }
  #runWaiting(worker: Worker): Promise<void> {
    // Never send even a nominal no-op resume to a pre-existing running worker.
    if (!worker.waitingForDebugger) { return Promise.resolve(); }
    const prior = this.#waiting.get(worker.sessionId); if (prior !== undefined) { return prior; }
    const completion = Promise.withResolvers<null>();
    const work = withoutValue(completion.promise);
    this.#waiting.set(worker.sessionId, work);
    void (async (): Promise<void> => {
      try { empty.parse(captureCurrentPcbStringClockReply(await this.#request({ method: "Runtime.runIfWaitingForDebugger", params: {},
        sessionId: worker.sessionId }, true)).value); completion.resolve(null); } catch (error) { completion.reject(error); }
    })();
    return work;
  }
  #removeInitialBreakpoint(): Promise<void> {
    if (this.#removeInstrumentation !== null) { return this.#removeInstrumentation; }
    const id = this.#instrumentation, worker = this.#worker;
    if (id === null || worker === null) { return Promise.resolve(); }
    this.#removeInstrumentation = (async (): Promise<void> => {
      empty.parse(captureCurrentPcbStringClockReply(await this.#request({ method: "Debugger.removeBreakpoint",
        params: { breakpointId: id }, sessionId: worker.sessionId }, true)).value);
      this.#instrumentationRemoved = true;
    })();
    return this.#removeInstrumentation;
  }
  #resumeInitialPause(): Promise<void> {
    if (this.#bootstrap209) {
      const stage = this.#bootstrapStages.find(value => value.pauseSeen && !value.resumeSeen);
      return stage === undefined ? Promise.resolve() : this.#resumeBootstrapStage(stage);
    }
    if (this.#initialResume !== null) { return this.#initialResume; }
    const worker = this.#worker; if (worker === null || !this.#initialPauseSeen) { return Promise.resolve(); }
    // Publish the consumed promise before the send: a dependency can deliver the
    // Resumed event synchronously, and a lost reply must not permit replay.
    const completion = Promise.withResolvers<null>();
    const work = withoutValue(completion.promise);
    this.#initialResume = work;
    void (async (): Promise<void> => {
      try {
        empty.parse(captureCurrentPcbStringClockReply(await this.#request({ method: "Debugger.resume", params: {}, sessionId: worker.sessionId }, true)).value);
        await bounded(this.#initialResumed.promise); completion.resolve(null);
      } catch (error) { completion.reject(error); }
    })();
    return work;
  }
  #resumeBootstrapStage(stage: BootstrapStage): Promise<void> {
    if (stage.resume !== null) { return stage.resume; }
    const worker = this.#worker;
    if (worker === null || !stage.pauseSeen || stage.resumeSeen) { return Promise.reject(failure("INITIAL_PAUSE_IDENTITY")); }
    // Publish each original attempt before dispatch. Resumed and the following
    // Script's parsed/paused events can arrive before this command's reply.
    const completion = Promise.withResolvers<null>(), work = withoutValue(completion.promise);
    stage.resume = work;
    void (async (): Promise<void> => {
      try {
        empty.parse(captureCurrentPcbStringClockReply(await this.#request({ method: "Debugger.resume", params: {},
          sessionId: worker.sessionId }, true)).value);
        await bounded(stage.resumed.promise); completion.resolve(null);
      } catch (error) { completion.reject(error); }
    })();
    return work;
  }
  async #cleanupInitialPause(): Promise<void> {
    const failures: unknown[] = [];
    try { await this.#removeInitialBreakpoint(); } catch (error) { failures.push(error); }
    try { await this.#resumeInitialPause(); } catch (error) { failures.push(error); }
    if (failures.length > 0) { throw new AggregateError(failures, "PCB_WORKER_STARTUP_PAUSE_CLEANUP"); }
  }
  async #armInstrumentation(worker: Worker): Promise<void> {
    await this.#current();
    if (this.#requests >= 224) { this.#poison("REQUEST_BUDGET"); throw failure("REQUEST_BUDGET"); }
    this.#requests += 1;
    this.#instrumentationUncertain = true;
    const pending = (async (): Promise<void> => {
      const raw = await this.#send.call(this.#dependency, { method: "Debugger.setInstrumentationBreakpoint",
        params: { instrumentation: "beforeScriptExecution" }, sessionId: worker.sessionId });
      this.#instrumentation = z.object({ breakpointId: token }).strict().parse(captureCurrentPcbStringClockReply(raw).value).breakpointId;
      this.#instrumentationUncertain = false;
      if (this.#failure !== null) {
        void observe((async (): Promise<void> => {
          await this.#removeInitialBreakpoint(); await this.#runWaiting(worker);
          if (this.#initialPauseSeen && !this.#initialResumeSeen) { await this.#resumeInitialPause(); }
        })());
      }
    })();
    await bounded(pending); await this.#current();
  }
  async #constructionRequest(command: CurrentPcbWorkerConstructionCommand, worker: Worker): Promise<unknown> {
    if (command.method === "Debugger.setBreakpoint") {
      await this.#current();
      if (this.#requests >= 224) { this.#poison("REQUEST_BUDGET"); throw failure("REQUEST_BUDGET"); }
      this.#requests += 1;
      // The runner owns this allocation deadline and retains late IDs. An
      // Additional transport timeout would hide its original late reply.
      return captureCurrentPcbStringClockReply(await this.#send.call(this.#dependency, { ...command, sessionId: worker.sessionId })).value;
    }
    return this.#request({ ...command, sessionId: worker.sessionId }, command.method === "Debugger.resume" ||
      command.method === "Debugger.removeBreakpoint" || command.method === "Runtime.releaseObjectGroup");
  }
  #qualifySource(raw: unknown): void {
    if (raw === null || typeof raw !== "object" || types.isProxy(raw) || Reflect.ownKeys(raw).join(",") !== "scriptSource" ||
        Object.getPrototypeOf(raw) !== Object.prototype && Object.getPrototypeOf(raw) !== null) { throw failure("SOURCE_REPLY"); }
    const descriptor = Object.getOwnPropertyDescriptor(raw, "scriptSource"), source: unknown = descriptor?.value;
    if (descriptor === undefined || !Object.hasOwn(descriptor, "value") || typeof source !== "string" || !source.isWellFormed() ||
        Buffer.byteLength(source) !== this.#profile.scriptBytes || createHash("sha256").update(source).digest("hex") !== this.#profile.scriptSha256) { throw failure("SOURCE"); }
    this.#sourceQualified = true;
  }
  async #qualifyBootstrapStages(worker: Worker): Promise<z.infer<typeof scriptSchema>> {
    for (const stage of this.#bootstrapStages) {
      const paused = initialPauseSchema.parse(await bounded(stage.paused.promise, WAIT_MS));
      const context = this.#context, script = stage.script;
      if (context === null || script === null || script.executionContextId !== context.id ||
          paused.data.scriptId !== script.scriptId || paused.data["url"] !== script.url ||
          paused.callFrames[0]?.location.scriptId !== script.scriptId ||
          paused.hitBreakpoints.length === 1 && paused.hitBreakpoints[0] !== this.#instrumentation) {
        throw failure("INITIAL_PAUSE_IDENTITY");
      }
      await this.#current();
      if (this.#requests >= 224) { this.#poison("REQUEST_BUDGET"); throw failure("REQUEST_BUDGET"); }
      this.#requests += 1;
      // Source replies exceed the small event capture bound. Qualify the own
      // Data string before any following awaited owner reproof.
      qualifyCurrentPcb209StartupScriptSource(stage.role, await bounded(this.#send.call(this.#dependency,
        { method: "Debugger.getScriptSource", params: { scriptId: script.scriptId }, sessionId: worker.sessionId })));
      stage.sourceQualified = true; await this.#current();
      if (stage.role === "project") { this.#sourceQualified = true; return script; }
      await this.#resumeBootstrapStage(stage); await this.#current();
    }
    throw failure("INITIAL_PAUSE_IDENTITY");
  }
  async #qualifyLegacyInitialSource(worker: Worker): Promise<z.infer<typeof scriptSchema>> {
    const paused = initialPauseSchema.parse(await bounded(this.#initialPaused.promise, WAIT_MS));
    const context = this.#context, script = this.#script;
    if (context === null || script === null || script.executionContextId !== context.id ||
        paused.data.scriptId !== script.scriptId || paused.callFrames[0]?.location.scriptId !== script.scriptId ||
        paused.hitBreakpoints.length === 1 && paused.hitBreakpoints[0] !== this.#instrumentation) { throw failure("INITIAL_PAUSE_IDENTITY"); }
    this.#requests += 1;
    this.#qualifySource(await bounded(this.#send.call(this.#dependency, { method: "Debugger.getScriptSource",
      params: { scriptId: script.scriptId }, sessionId: worker.sessionId })));
    await this.#current(); return script;
  }
  public async capture(): Promise<Packet> {
    if (this.#started) { throw failure("CONSUMED"); } this.#started = true;
    try {
      if (this.#bootstrap209 && (this.#expectedProject === null || this.#existingWorkers === null)) { throw failure("EXPECTED_PROJECT_REQUIRED"); }
      await this.#current(); this.#unsubscribe = this.#subscribe.call(this.#dependency, this.#event);
      empty.parse(captureCurrentPcbStringClockReply(await this.#request({ method: "Target.setAutoAttach",
        params: CURRENT_PCB_WORKER_STARTUP_ATTACH, sessionId: this.#parentSession })).value);
      this.#armed.resolve(null);
      const worker = await bounded(this.#attached.promise, WAIT_MS);
      empty.parse(captureCurrentPcbStringClockReply(await this.#request({ method: "Runtime.enable", params: {}, sessionId: worker.sessionId })).value);
      z.object({ debuggerId: token }).strict().parse(captureCurrentPcbStringClockReply(await this.#request({ method: "Debugger.enable",
        params: { maxScriptsCacheSize: 33_554_432 }, sessionId: worker.sessionId })).value);
      await this.#armInstrumentation(worker); await this.#runWaiting(worker);
      const script = this.#bootstrap209 ? await this.#qualifyBootstrapStages(worker) : await this.#qualifyLegacyInitialSource(worker);
      const transport: CurrentPcbWorkerConstructionTransport = Object.freeze({ scriptId: script.scriptId,
        assertOriginalPinnedWorker: (): Promise<void> => this.#current(),
        request: (command: CurrentPcbWorkerConstructionCommand): Promise<unknown> => this.#constructionRequest(command, worker),
        subscribe: (events: Subscriber): (() => void) => {
          if (this.#subscriber !== null) { throw failure("SUBSCRIBER"); } this.#subscriber = events;
          return (): void => { if (this.#subscriber === events) { this.#subscriber = null; } };
        },
      });
      const runner = this.#createRunner(transport); this.#runner = runner;
      const captured = runner.capture(); this.#constructionCapture = captured; void observe(captured); await runner.whenArmed();
      await this.#removeInitialBreakpoint(); await this.#current(); await this.#resumeInitialPause();
      const packet = await captured; await this.#current(); return packet;
    } catch (error) {
      this.#poison("CAPTURE");
      // A failed startup must settle the retained construction listener too.
      // Its lost event unwinds the current bounded request/pause without retry.
      if (this.#constructionCapture !== null) { await observe(bounded(this.#constructionCapture, WAIT_MS)); }
      try { await this.cleanup(); } catch (cleanupError) { throw new AggregateError([error, cleanupError], "PCB_WORKER_STARTUP_FAILED", { cause: cleanupError }); }
      throw error;
    } finally { this.#settled = true; }
  }
  public async requireOriginal(packet: Packet): Promise<Runner> {
    await this.#current(); const runner = this.#runner; if (runner === null) { throw failure("RUNNER"); }
    await runner.requireOriginal(packet); await this.#current(); return runner;
  }
  /** Normal cleanup removes original instrumentation and releases each original
   * waiting worker once. It neither detaches sessions nor disconnects pipes. */
  public cleanup(): Promise<void> {
    if (this.#cleanup !== null) { return this.#cleanup; }
    this.#cleanup = (async (): Promise<void> => {
      try { await this.#cleanupCurrentState(); }
      finally { this.#cleanup = null; }
    })();
    return this.#cleanup;
  }
  async #cleanupCurrentState(): Promise<void> {
      const failures: unknown[] = [];
      try { await this.#removeInitialBreakpoint(); } catch (error) { failures.push(error); }
      // Unknown instrumentation must not be released into running code. A late
      // Acknowledged ID gets its own original remove/start cleanup above.
      if (this.#instrumentationUncertain || this.#instrumentation !== null && !this.#instrumentationRemoved) {
        failures.push(failure("RETAIN_UNKNOWN_BREAKPOINT"));
        throw new AggregateError(failures, "PCB_WORKER_STARTUP_CLEANUP");
      }
      if (this.#runner?.status().unresolvedBreakpoints === true) {
        failures.push(failure("RETAIN_CONSTRUCTION_BREAKPOINTS"));
        throw new AggregateError(failures, "PCB_WORKER_STARTUP_CLEANUP");
      }
      for (const worker of this.#workers.values()) {
        try { await this.#runWaiting(worker); } catch (error) { failures.push(error); }
      }
      if (this.#initialPauseSeen && !this.#initialResumeSeen) {
        try { await this.#resumeInitialPause(); } catch (error) { failures.push(error); }
      }
      if (failures.length > 0) { throw new AggregateError(failures, "PCB_WORKER_STARTUP_CLEANUP"); }
  }
  /** Event listeners survive both successful capture and failed cleanup. Only
   * original root AND whole-Job termination permits their final release. */
  public async releaseAfterTermination(): Promise<void> {
    if (!this.#settled || this.#released) { throw failure("RELEASE_STATE"); }
    this.#sameDependency(); await bounded(this.#assertTermination.call(this.#dependency)); this.#sameDependency();
    clearTimeout(this.#initialPauseWatchdog);
    for (const stage of this.#bootstrapStages) { clearTimeout(stage.watchdog); }
    this.#unsubscribe?.(); this.#unsubscribe = null; this.#released = true;
  }
}

/** The legacy optional profile remains its existing offline fixture seam.
 * Production owners use its compiled default; generation209 has no such seam. */
export class CurrentPcbWorkerStartupTransport extends CurrentPcbWorkerStartupTransportCore<CurrentPcbWorkerConstructionPacket, CurrentPcbWorkerConstructionRunner> {
  public constructor(dependency: CurrentPcbWorkerStartupDependency,
    profile: DiagnosticWorkerScriptProfile = CURRENT_PCB_DIAGNOSTIC_WORKER_SCRIPT) {
    super(INTERNAL_PROFILE, dependency, profile, transport => new CurrentPcbWorkerConstructionRunner(transport));
  }
}
/** Fixed209 original startup owner. Native ownership, source admission and
 * initial instrumentation still precede every actual constructor capture. */
export class CurrentPcb209WorkerStartupTransport extends CurrentPcbWorkerStartupTransportCore<CurrentPcb209WorkerConstructionPacket, CurrentPcb209WorkerConstructionRunner> {
  public constructor(dependency: CurrentPcbWorkerStartupDependency) {
    const source = CURRENT_PCB_209_WORKER_STARTUP_SOURCE;
    super(INTERNAL_PROFILE, dependency, { relativePath: source.relativePath, scriptBytes: source.bytes, scriptSha256: source.sha256 },
      transport => new CurrentPcb209WorkerConstructionRunner(transport), true);
  }
}
