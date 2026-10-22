/** Private startup owner composition. Existing diagnostic paths never import
 * this class. It owns initial waiting/instrumentation cleanup and delegates
 * only the separately reviewed construction vocabulary after complete source
 * qualification. Native process/pipe integration remains a dependency. */
import { createHash } from "node:crypto";
import { types } from "node:util";
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_PCB_DIAGNOSTIC_WORKER_SCRIPT } from "./current-pcb-diagnostic-worker-context.ts";
import type { DiagnosticWorkerScriptProfile } from "./current-pcb-diagnostic-worker-context.ts";
import { CurrentPcbWorkerConstructionRunner } from "./current-pcb-worker-construction-runner.ts";
import type { CurrentPcbWorkerConstructionPacket } from "./current-pcb-worker-construction-runner.ts";
import type { CurrentPcbWorkerConstructionCommand, CurrentPcbWorkerConstructionTransport } from "./current-pcb-worker-construction-contract.ts";
import { CURRENT_PCB_WORKER_STARTUP_ATTACH } from "./current-pcb-worker-startup-contract.ts";
import type { CurrentPcbWorkerStartupCommand, CurrentPcbWorkerStartupDependency, CurrentPcbWorkerStartupEvent } from "./current-pcb-worker-startup-contract.ts";

const token = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
const sessionToken = token.max(128);
const empty = z.object({}).strict();
const targetSchema = z.looseObject({ targetId: token, type: z.literal("worker"), attached: z.literal(true),
  title: z.string().max(8192), url: z.string().max(8192) });
const contextSchema = z.object({ id: z.number().int().positive(), origin: z.string().max(8192),
  name: z.string().max(8192), uniqueId: token }).strict();
const scriptSchema = z.looseObject({ scriptId: token, executionContextId: z.number().int().positive(),
  url: z.string().max(8192), hasSourceURL: z.literal(false).optional(), isLiveEdit: z.literal(false).optional(),
  scriptLanguage: z.literal("JavaScript").optional() });
const initialFrameSchema = z.looseObject({ location: z.looseObject({ scriptId: token }) });
const initialPauseSchema = z.looseObject({ reason: z.literal("instrumentation"),
  data: z.looseObject({ scriptId: token }), hitBreakpoints: z.array(token).max(1),
  callFrames: z.array(initialFrameSchema).min(1).max(16) });
const PAUSE_MS = 5000, REQUEST_MS = 2000, WAIT_MS = 15_000;
type Worker = Readonly<{ sessionId: string; target: z.infer<typeof targetSchema> }>;
type Subscriber = Parameters<CurrentPcbWorkerConstructionTransport["subscribe"]>[0];
function failure(code: string): Error { return new Error(`PCB_WORKER_STARTUP_${code}`); }
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

export class CurrentPcbWorkerStartupTransport {
  readonly #dependency: CurrentPcbWorkerStartupDependency;
  readonly #originalMembers: readonly unknown[];
  readonly #send: CurrentPcbWorkerStartupDependency["request"];
  readonly #assertOwner: CurrentPcbWorkerStartupDependency["assertOriginalOwner"];
  readonly #assertTermination: CurrentPcbWorkerStartupDependency["assertOriginalTermination"];
  readonly #subscribe: CurrentPcbWorkerStartupDependency["subscribe"];
  readonly #parentSession: string;
  readonly #parentTarget: string;
  readonly #profile: DiagnosticWorkerScriptProfile;
  readonly #attached = Promise.withResolvers<Worker>();
  readonly #initialPaused = Promise.withResolvers<unknown>();
  readonly #initialResumed = Promise.withResolvers<null>();
  readonly #waiting = new Map<string, Promise<void>>();
  readonly #workers = new Map<string, Worker>();
  #worker: Worker | null = null;
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
  #runner: CurrentPcbWorkerConstructionRunner | null = null;
  #constructionCapture: Promise<CurrentPcbWorkerConstructionPacket> | null = null;
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

  /** The optional profile is an offline synthetic-test seam, never an MCP or
   * native owner input. Installed integration must use the compiled default. */
  public constructor(dependency: CurrentPcbWorkerStartupDependency,
    profile: DiagnosticWorkerScriptProfile = CURRENT_PCB_DIAGNOSTIC_WORKER_SCRIPT) {
    this.#originalMembers = members(dependency); this.#dependency = dependency;
    this.#parentSession = sessionToken.parse(dependency.parentSessionId); this.#parentTarget = sessionToken.parse(dependency.parentTargetId);
    this.#send = dependency.request; this.#assertOwner = dependency.assertOriginalOwner;
    this.#assertTermination = dependency.assertOriginalTermination; this.#subscribe = dependency.subscribe;
    this.#profile = Object.freeze(z.object({ relativePath: z.string().max(512).regex(/^[A-Za-z\d_.-]+(?:\/[A-Za-z\d_.-]+)+\.js$/u),
      scriptBytes: z.number().int().min(1).max(4 * 1024 * 1024), scriptSha256: z.string().regex(/^[a-f\d]{64}$/u) }).strict().parse(profile));
    void observe(this.#attached.promise); void observe(this.#initialPaused.promise); void observe(this.#initialResumed.promise);
  }
  public status(): Readonly<{ started: boolean; settled: boolean; failed: boolean; sourceQualified: boolean;
    initialPauseSeen: boolean; initialResumeAttempted: boolean; initialResumeSeen: boolean;
    unresolvedInstrumentation: boolean; attachedWorkers: number; released: boolean }> {
    return Object.freeze({ started: this.#started, settled: this.#settled, failed: this.#failure !== null,
      sourceQualified: this.#sourceQualified, initialPauseSeen: this.#initialPauseSeen,
      initialResumeAttempted: this.#initialResume !== null, initialResumeSeen: this.#initialResumeSeen,
      unresolvedInstrumentation: this.#instrumentationUncertain || this.#instrumentation !== null && !this.#instrumentationRemoved,
      attachedWorkers: this.#workers.size, released: this.#released });
  }
  #poison(code: string): void {
    this.#failure ??= failure(code); this.#attached.reject(this.#failure); this.#initialPaused.reject(this.#failure);
    this.#subscriber?.lost();
  }
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
    try {
      const captured = captureCurrentPcbStringClockReply(input);
      this.#events += 1; this.#eventBytes += Buffer.byteLength(captured.text);
      if (this.#events > 4096 || this.#eventBytes > 8 * 1024 * 1024) { throw failure("EVENT_BUDGET"); }
      const event = z.object({ method: z.string().max(128), sessionId: sessionToken, params: z.record(z.string(), z.unknown()) }).strict().parse(captured.value);
      this.#acceptEvent(event);
    } catch { this.#poison("EVENT"); }
  };
  #acceptEvent(event: CurrentPcbWorkerStartupEvent): void {
    if (event.sessionId === this.#parentSession && event.method === "Target.attachedToTarget") {
      const params = z.object({ sessionId: sessionToken, targetInfo: targetSchema, waitingForDebugger: z.literal(true) }).strict().parse(event.params);
      if (params.sessionId === this.#parentSession || params.targetInfo.targetId === this.#parentTarget ||
          this.#workers.has(params.sessionId) || this.#workers.size >= 16) { throw failure("ATTACHMENT"); }
      const worker = Object.freeze({ sessionId: params.sessionId, target: params.targetInfo });
      this.#workers.set(worker.sessionId, worker);
      if (this.#worker !== null) { void observe(this.#runWaiting(worker)); throw failure("EXTRA_WORKER"); }
      this.#worker = worker;
      if (!this.#sourceUrl(worker.target.url)) { void observe(this.#runWaiting(worker)); throw failure("WORKER_URL"); }
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
      if (this.#script !== null || !this.#sourceUrl(script.url) || script.url !== worker.target.url) { throw failure("SCRIPT"); }
      this.#script = script; return;
    }
    if (event.method === "Debugger.paused") {
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
      if (!this.#initialResumeSeen) {
        if (this.#initialResume === null) { throw failure("UNEXPECTED_RESUME"); }
        this.#initialResumeSeen = true; clearTimeout(this.#initialPauseWatchdog); this.#initialResumed.resolve(null); return;
      }
      if (this.#subscriber === null) { throw failure("UNEXPECTED_RESUME"); }
      this.#subscriber.resumed(); return;
    }
    if (event.method === "Runtime.consoleAPICalled" && this.#sourceQualified) { return; }
    // No context replacement, foreign scripts, worker loss or silent console
    // Exception is accepted by this startup-purpose owner.
    throw failure("UNEXPECTED_EVENT");
  }
  #sourceUrl(value: string): boolean {
    if (!value.isWellFormed() || /[\\\s?#@]/u.test(value) || /\/(?:\.|\.\.)(?:\/|$)/u.test(value)) { return false; }
    try { const url = new URL(value); return url.username === "" && url.password === "" && url.search === "" && url.hash === "" &&
      url.pathname.endsWith(`/${this.#profile.relativePath}`); } catch { return false; }
  }
  #runWaiting(worker: Worker): Promise<void> {
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
  async #cleanupInitialPause(): Promise<void> {
    const failures: unknown[] = [];
    try { await this.#removeInitialBreakpoint(); } catch (error) { failures.push(error); }
    try { await this.#resumeInitialPause(); } catch (error) { failures.push(error); }
    if (failures.length > 0) { throw new AggregateError(failures, "PCB_WORKER_STARTUP_PAUSE_CLEANUP"); }
  }
  async #armInstrumentation(worker: Worker): Promise<void> {
    await this.#current(); this.#requests += 1;
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
  public async capture(): Promise<CurrentPcbWorkerConstructionPacket> {
    if (this.#started) { throw failure("CONSUMED"); } this.#started = true;
    try {
      await this.#current(); this.#unsubscribe = this.#subscribe.call(this.#dependency, this.#event);
      empty.parse(captureCurrentPcbStringClockReply(await this.#request({ method: "Target.setAutoAttach",
        params: CURRENT_PCB_WORKER_STARTUP_ATTACH, sessionId: this.#parentSession })).value);
      const worker = await bounded(this.#attached.promise, WAIT_MS);
      empty.parse(captureCurrentPcbStringClockReply(await this.#request({ method: "Runtime.enable", params: {}, sessionId: worker.sessionId })).value);
      z.object({ debuggerId: token }).strict().parse(captureCurrentPcbStringClockReply(await this.#request({ method: "Debugger.enable",
        params: { maxScriptsCacheSize: 33_554_432 }, sessionId: worker.sessionId })).value);
      await this.#armInstrumentation(worker); await this.#runWaiting(worker);
      const paused = initialPauseSchema.parse(await bounded(this.#initialPaused.promise, WAIT_MS));
      const context = this.#context, script = this.#script;
      if (context === null || script === null || script.executionContextId !== context.id ||
          paused.data.scriptId !== script.scriptId || paused.callFrames[0]?.location.scriptId !== script.scriptId ||
          paused.hitBreakpoints.length === 1 && paused.hitBreakpoints[0] !== this.#instrumentation) { throw failure("INITIAL_PAUSE_IDENTITY"); }
      // Capture the large source before the following awaited owner callback.
      this.#requests += 1;
      this.#qualifySource(await bounded(this.#send.call(this.#dependency, { method: "Debugger.getScriptSource",
        params: { scriptId: script.scriptId }, sessionId: worker.sessionId })));
      await this.#current();
      const transport: CurrentPcbWorkerConstructionTransport = Object.freeze({ scriptId: script.scriptId,
        assertOriginalPinnedWorker: (): Promise<void> => this.#current(),
        request: (command: CurrentPcbWorkerConstructionCommand): Promise<unknown> => this.#constructionRequest(command, worker),
        subscribe: (events: Subscriber): (() => void) => {
          if (this.#subscriber !== null) { throw failure("SUBSCRIBER"); } this.#subscriber = events;
          return (): void => { if (this.#subscriber === events) { this.#subscriber = null; } };
        },
      });
      const runner = new CurrentPcbWorkerConstructionRunner(transport); this.#runner = runner;
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
  public async requireOriginal(packet: CurrentPcbWorkerConstructionPacket): Promise<CurrentPcbWorkerConstructionRunner> {
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
    clearTimeout(this.#initialPauseWatchdog); this.#unsubscribe?.(); this.#unsubscribe = null; this.#released = true;
  }
}
