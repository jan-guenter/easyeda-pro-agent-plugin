/** Seven-stage source state machine for the distinct saved readonly birth. The
 * actual owner supplies retained requests/events and alone issues worker custody. */
import { types } from "node:util";
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_PCB_209_WORKER_BOOTSTRAP_SOURCES as BOOTSTRAPS,
  CURRENT_PCB_209_WORKER_PRELOAD_LOG as LOG, CURRENT_PCB_209_WORKER_PRELOAD_URL as PRELOAD, CURRENT_PCB_209_PROJECT_WORKER_URL as PROJECT, CURRENT_PCB_209_WORKER_BOOTSTRAP_ROLES as ROLES,
  currentPcb209PreloadCopyCaller, isCurrentPcb209BootstrapTargetUrl, qualifyCurrentPcb209PreloadCopyCreator,
  qualifyCurrentPcb209PreloadCopyPause, qualifyCurrentPcb209StartupScriptSource } from "./current-pcb-209-worker-bootstrap-source.ts";
import type { CurrentPcb209StartupScriptRole } from "./current-pcb-209-worker-bootstrap-source.ts";
import { CURRENT_PCB_VIA_SAVED_LOAD_BOOTSTRAP_REQUESTS as REQUESTS, validateCurrentPcbViaSavedLoadBootstrapCommand } from "./current-pcb-via-saved-load-bootstrap-protocol.ts";
import type { CurrentPcbViaSavedLoadBootstrapCommand } from "./current-pcb-via-saved-load-bootstrap-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export interface CurrentPcbViaSavedLoadBootstrapEvent { readonly method: string; readonly sessionId: string; readonly params: unknown }
export interface CurrentPcbViaSavedLoadProjectSourceHeld {
  readonly instrumentationBreakpointId: string; readonly scriptId: string; readonly uniqueContextId: string; readonly executionContextId: number; readonly source: string;
}
export interface CurrentPcbViaSavedLoadBootstrapBindings {
  readonly sessionId: string; readonly targetId: string; readonly targetUrl: string; readonly targetTitle: string;
  readonly expectedWindowTabId: string; readonly projectUuid: string;
  readonly request: (command: CurrentPcbViaSavedLoadBootstrapCommand, cleanup: boolean) => Promise<unknown>;
  /** Bounded original event request, retained through settlement/Job abort. */
  readonly nextEvent: () => Promise<CurrentPcbViaSavedLoadBootstrapEvent>;
  readonly assertCurrent: () => Promise<void>;
  /** Original owner verifies its same runner and source pause, then alone
   * issues the native origin and retains the original held-source loading observer. The project stays paused. */
  readonly projectSourceHeld: (source: CurrentPcbViaSavedLoadProjectSourceHeld) => Promise<void>;
  readonly fail: () => void;
}
export interface CurrentPcbViaSavedLoadBootstrapResult {
  readonly schema: "private.current-pcb-via-saved-load-bootstrap-held.v1";
  readonly sessionId: string; readonly targetId: string; readonly scriptId: string; readonly uniqueContextId: string;
  readonly completeImportedSourceQualified: true; readonly originalProjectSourceCallbackSettled: true;
  readonly projectInitialSourceRemainsPaused: true; readonly scopedHttpCacheAndServiceWorkerBypassAcknowledged: true;
  readonly nativeWorkerOwnershipIssuedByThisRunner: false; readonly startupCompletionVerified: false;
  readonly clockResponderVerified: false; readonly selectedSqlAuthorized: false; readonly executionAuthorized: false;
}
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const context = z.strictObject({ id: z.number().int().positive(), uniqueId: handle, name: z.string().max(8192), origin: z.string().max(8192) });
const contextEvent = z.strictObject({ context });
const script = z.looseObject({ scriptId: handle, executionContextId: z.number().int().positive(), url: z.string().max(8192),
  hasSourceURL: z.literal(false).optional(), isLiveEdit: z.literal(false).optional(), scriptLanguage: z.literal("JavaScript").optional() });
const point = z.looseObject({ scriptId: handle });
const frame = z.looseObject({ location: point });
const paused = z.looseObject({ reason: z.literal("instrumentation"), data: z.looseObject({ scriptId: handle, url: z.string().max(8192).optional() }),
  hitBreakpoints: z.array(handle).max(1), callFrames: z.array(frame).min(1).max(16) });
const logFrame = z.looseObject({ scriptId: handle, functionName: z.string(), url: z.string().max(8192), lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const logArgument = z.strictObject({ type: z.literal("string"), value: z.literal(LOG.message) });
const logStack = z.looseObject({ callFrames: z.array(logFrame).min(1).max(16) });
const logEvent = z.strictObject({ type: z.literal("log"), args: z.tuple([logArgument]), executionContextId: z.number().int().positive(),
  timestamp: z.number().nonnegative(), stackTrace: logStack });
const eventSchema = z.strictObject({ method: z.string().min(1).max(128), sessionId: handle, params: z.unknown() });
const empty = z.strictObject({});
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`PCB_VIA_SAVED_LOAD_BOOTSTRAP_${code}`); } }

export class CurrentPcbViaSavedLoadBootstrap {
  readonly #bindings: CurrentPcbViaSavedLoadBootstrapBindings;
  readonly #scripts = new Map<CurrentPcb209StartupScriptRole, z.infer<typeof script>>();
  #context: z.infer<typeof context> | null = null; #instrument: string | null = null; #consumed = false; #failed = false;
  #normal = 0; #cleanup = 0; #events = 0; #log = false; #sourceCallbackAttempted = false;
  public constructor(bindings: CurrentPcbViaSavedLoadBootstrapBindings) {
    need(bindings !== null && typeof bindings === "object" && !types.isProxy(bindings) && Object.getPrototypeOf(bindings) === Object.prototype && Object.isFrozen(bindings), "BINDINGS");
    const fields = ["sessionId", "targetId", "targetUrl", "targetTitle", "expectedWindowTabId", "projectUuid", "request", "nextEvent", "assertCurrent", "projectSourceHeld", "fail"];
    need(Reflect.ownKeys(bindings).length === fields.length, "BINDINGS_FIELDS");
    for (const [index, key] of fields.entries()) {
      const descriptor = Object.getOwnPropertyDescriptor(bindings, key);
      need(descriptor !== undefined && Object.hasOwn(descriptor, "value") && typeof descriptor.value === (index < 6 ? "string" : "function"), "BINDINGS_DESCRIPTOR");
    }
    handle.parse(bindings.sessionId); handle.parse(bindings.targetId); handle.parse(bindings.expectedWindowTabId);
    need(/^[a-f\d]{64}$/u.test(bindings.projectUuid) && isCurrentPcb209BootstrapTargetUrl(bindings.targetUrl) &&
      bindings.targetTitle === `project_${bindings.projectUuid}_${bindings.expectedWindowTabId}`, "TARGET");
    this.#bindings = bindings; Object.freeze(this);
  }
  async #current(): Promise<void> { need(!this.#failed, "FAILED"); await this.#bindings.assertCurrent(); need(!this.#failed, "FAILED"); }
  async #send(command: CurrentPcbViaSavedLoadBootstrapCommand, cleanup = false): Promise<unknown> {
    await this.#current(); validateCurrentPcbViaSavedLoadBootstrapCommand(command);
    if (cleanup) { this.#cleanup += 1; need(this.#cleanup <= REQUESTS.initialContinuations, "CLEANUP_CAPACITY"); }
    else { this.#normal += 1; need(this.#normal <= REQUESTS.normal, "CAPACITY"); }
    const raw = await this.#bindings.request(command, cleanup);
    if (command.phase === "saved-load-source") {
      // Source qualification captures immutable strings before owner awaits;
      // The normal small-envelope decoder intentionally cannot accept2MiB.
      const source = qualifyCurrentPcb209StartupScriptSource(command.role, raw); await this.#current(); return source;
    }
    const captured = captureCurrentPcbStringClockReply(raw).value; await this.#current(); return captured;
  }
  async #event(): Promise<z.infer<typeof eventSchema>> {
    await this.#current(); this.#events += 1; need(this.#events <= 64, "EVENT_CAPACITY");
    const value = eventSchema.parse(captureCurrentPcbStringClockReply(await this.#bindings.nextEvent()).value);
    await this.#current(); need(value.sessionId === this.#bindings.sessionId, "EVENT_SESSION"); return value;
  }
  #preloadLog(raw: unknown, role: CurrentPcb209StartupScriptRole): void {
    const preload = this.#scripts.get("preload"); need(role === "project" && !this.#log && preload !== undefined && this.#context !== null, "LOG_ORDER");
    const value = logEvent.parse(raw); const first = value.stackTrace.callFrames[0];
    need(value.executionContextId === this.#context.id && first?.scriptId === preload.scriptId && first.url === PRELOAD && first.functionName === LOG.functionName &&
      first.lineNumber === LOG.lineNumber && first.columnNumber === LOG.columnNumber, "PRELOAD_LOG"); this.#log = true;
  }
  async #wait(role: CurrentPcb209StartupScriptRole): Promise<z.infer<typeof script>> {
    for (let count = 0; count < 8; count += 1) {
      const event = await this.#event();
      if (event.method === "Runtime.executionContextCreated") {
        need(this.#context === null && role === "bootstrap", "CONTEXT_REPLACED"); const value = contextEvent.parse(event.params).context;
        need(value.origin === this.#bindings.targetUrl && value.name === this.#bindings.targetTitle, "CONTEXT"); this.#context = value;
      } else if (event.method === "Runtime.consoleAPICalled") { this.#preloadLog(event.params, role); }
      else if (event.method === "Debugger.scriptParsed") {
        const value = script.parse(event.params); need(this.#context !== null && value.executionContextId === this.#context.id && !this.#scripts.has(role) &&
          ![...this.#scripts.values()].some(prior => prior.scriptId === value.scriptId), "SCRIPT_CONTEXT");
        let expected = ""; if (role === "bootstrap") { expected = this.#bindings.targetUrl; } else if (role === "preload") { expected = PRELOAD; } else if (role === "project") { expected = PROJECT; }
        need(value.url === expected, "SCRIPT_URL");
        if (currentPcb209PreloadCopyCaller(role) !== null) {
          const preload = this.#scripts.get("preload"); need(preload !== undefined, "COPY_PRELOAD"); qualifyCurrentPcb209PreloadCopyCreator(preload.scriptId, event.params);
        }
        this.#scripts.set(role, value);
      } else if (event.method === "Debugger.paused") {
        const value = paused.parse(event.params); const selected = this.#scripts.get(role);
        need(selected !== undefined && this.#context !== null && selected.executionContextId === this.#context.id && value.data.scriptId === selected.scriptId &&
          (value.data.url === undefined || value.data.url === selected.url) && value.callFrames[0]?.location.scriptId === selected.scriptId &&
          (value.hitBreakpoints.length === 0 || value.hitBreakpoints[0] === this.#instrument), "PAUSE_IDENTITY");
        if (currentPcb209PreloadCopyCaller(role) !== null) {
          const preload = this.#scripts.get("preload"); need(preload !== undefined, "COPY_PRELOAD");
          qualifyCurrentPcb209PreloadCopyPause(role, selected.scriptId, preload.scriptId, event.params);
        }
        if (role === "project") { need(this.#log, "PRELOAD_LOG_REQUIRED"); } return selected;
      } else { throw new Error("PCB_VIA_SAVED_LOAD_BOOTSTRAP_UNEXPECTED_EVENT"); }
    }
    throw new Error("PCB_VIA_SAVED_LOAD_BOOTSTRAP_STAGE_EVENTS");
  }
  async #resume(role: Exclude<CurrentPcb209StartupScriptRole, "project">): Promise<void> {
    empty.parse(await this.#send({ phase: "saved-load-resume", role, method: "Debugger.resume", params: {} }, true));
    const event = await this.#event(); need(event.method === "Debugger.resumed", "RESUME_EVENT"); empty.parse(event.params);
  }
  /** One joined browser/page waiting worker only. A failed original command or source check
   * consumes this attempt and requires the containing original Job cleanup. */
  public async observe(): Promise<CurrentPcbViaSavedLoadBootstrapResult> {
    need(!this.#consumed, "CONSUMED"); this.#consumed = true;
    try {
      empty.parse(await this.#send({ phase: "saved-load-runtime", method: "Runtime.enable", params: {} }));
      z.strictObject({ debuggerId: handle }).parse(await this.#send({ phase: "saved-load-debugger", method: "Debugger.enable", params: { maxScriptsCacheSize: 33_554_432 } }));
      empty.parse(await this.#send({ phase: "saved-load-async", method: "Debugger.setAsyncCallStackDepth", params: { maxDepth: 32 } }));
      empty.parse(await this.#send({ phase: "saved-load-network", method: "Network.enable", params: {} }));
      empty.parse(await this.#send({ phase: "saved-load-http-cache", method: "Network.setCacheDisabled", params: { cacheDisabled: true } }));
      empty.parse(await this.#send({ phase: "saved-load-service-worker", method: "Network.setBypassServiceWorker", params: { bypass: true } }));
      this.#instrument = z.strictObject({ breakpointId: handle }).parse(await this.#send({ phase: "saved-load-instrument", method: "Debugger.setInstrumentationBreakpoint",
        params: { instrumentation: "beforeScriptExecution" } })).breakpointId;
      empty.parse(await this.#send({ phase: "saved-load-run-browser", method: "Runtime.runIfWaitingForDebugger", params: {} }));
      empty.parse(await this.#send({ phase: "saved-load-run-page", method: "Runtime.runIfWaitingForDebugger", params: {} }));
      for (const role of ROLES) {
        const selected = await this.#wait(role), source = await this.#send({ phase: "saved-load-source", role, method: "Debugger.getScriptSource", params: { scriptId: selected.scriptId } });
        need(typeof source === "string", "SOURCE"); if (role === "bootstrap") { need(source === BOOTSTRAPS[1] || source === BOOTSTRAPS[2], "OFFLINE_MODE_REQUIRED"); }
        if (role === "project") {
          need(this.#context !== null && !this.#sourceCallbackAttempted && this.#instrument !== null, "PROJECT_SOURCE_CONSUMED"); this.#sourceCallbackAttempted = true;
          await this.#bindings.projectSourceHeld(freezeDeep({ instrumentationBreakpointId: this.#instrument, scriptId: selected.scriptId, uniqueContextId: this.#context.uniqueId, executionContextId: this.#context.id, source })); await this.#current();
        } else { await this.#resume(role); }
      }
      const selected = this.#scripts.get("project"); need(selected !== undefined && this.#context !== null, "PROJECT_SOURCE");
      return freezeDeep({ schema: "private.current-pcb-via-saved-load-bootstrap-held.v1", sessionId: this.#bindings.sessionId, targetId: this.#bindings.targetId,
        scriptId: selected.scriptId, uniqueContextId: this.#context.uniqueId, completeImportedSourceQualified: true, originalProjectSourceCallbackSettled: true,
        projectInitialSourceRemainsPaused: true, scopedHttpCacheAndServiceWorkerBypassAcknowledged: true, nativeWorkerOwnershipIssuedByThisRunner: false, startupCompletionVerified: false,
        clockResponderVerified: false, selectedSqlAuthorized: false, executionAuthorized: false });
    } catch (error) { this.#failed = true; this.#bindings.fail(); throw error; }
  }
}
