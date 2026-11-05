/** Unmounted209 worker capture. A genuine construction lease supplies all
 * handles, requests and events. There is no accept(transcript) or handle input.
 * This narrow route refuses queued/coalesced uploads. Complete SQL, operation
 * eligibility and main/worker same-owner joining remain required. */
import { z } from "zod";
import { CURRENT_PCB_WORKER_CONSTRUCTION_SOURCE } from "./current-pcb-worker-construction-contract.ts";
import type { CurrentPcbWorkerConstructionCommand } from "./current-pcb-worker-construction-contract.ts";
import { captureCurrentProjectStructureCompletionReply } from "./current-project-structure-completion-protocol.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { requireCurrentProjectStructureWorkerLease } from "./current-project-structure-worker-lease.ts";
import type { CurrentProjectStructureWorkerBinding, CurrentProjectStructureWorkerLease } from "./current-project-structure-worker-lease.ts";
import { CURRENT_PROJECT_STRUCTURE_WORKER_CALLS as CALLS } from "./current-project-structure-worker-programs.ts";

const GROUP = CURRENT_PCB_WORKER_CONSTRUCTION_SOURCE.group;
/** Exact possible-breakpoint positions in the full pinned209 worker. The
 * three callback sites follow packet creation, await return and successful
 * callback cleanup; the Nd sites are its initial and queued finalizers. */
export const CURRENT_PROJECT_STRUCTURE_WORKER_SITES = Object.freeze({
  packet: Object.freeze({ lineNumber: 110, columnNumber: 90_576, offset: 2_104_786 }),
  response: Object.freeze({ lineNumber: 110, columnNumber: 90_621, offset: 2_104_831 }),
  callbackReturn: Object.freeze({ lineNumber: 110, columnNumber: 90_770, offset: 2_104_980 }),
  initialFinally: Object.freeze({ lineNumber: 108, columnNumber: 145_736, offset: 1_847_232 }),
  queuedFinally: Object.freeze({ lineNumber: 108, columnNumber: 145_680, offset: 1_847_176 }),
});
type Site = keyof typeof CURRENT_PROJECT_STRUCTURE_WORKER_SITES;
const handle = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
const location = z.object({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() }).strict();
const remote = z.looseObject({ type: z.string(), objectId: handle.optional(), value: z.unknown().optional(), subtype: z.string().optional() });
const property = z.looseObject({ name: z.string(), value: remote.optional(), get: z.unknown().optional(), set: z.unknown().optional(), isOwn: z.literal(true) });
const properties = z.looseObject({ result: z.array(property).max(128) });
const scopeSchema = z.looseObject({ type: z.string(), object: remote, name: z.string().optional(), startLocation: location.optional() });
const frameSchema = z.looseObject({ callFrameId: handle, location, functionLocation: location,
  scopeChain: z.array(scopeSchema).min(1).max(16) });
const pauseSchema = z.looseObject({ reason: z.literal("other"), hitBreakpoints: z.array(handle).length(1), callFrames: z.array(frameSchema).min(1).max(32) });
const packetSchema = z.object({ projectUuid: z.string().regex(/^(?:[a-f\d]{32}|[a-f\d]{64})$/u), branchUuid: z.string().regex(/^[a-f\d]{32}$/u),
  ticket: z.number().int().nonnegative(), structureText: z.string().max(2_097_152).refine(s => s.isWellFormed() && Buffer.byteLength(s) <= 2_097_152) }).strict();
type Packet = Readonly<z.infer<typeof packetSchema>>;
interface Breakpoint { readonly id: string; readonly site: Site; attempted: boolean; removed: boolean }
interface Pause { raw: z.infer<typeof pauseSchema> | null; resumed: boolean; attempted: boolean; readonly signal: PromiseWithResolvers<null> }
export interface CurrentProjectStructureWorkerObservation extends Packet {
  readonly profile: "private.current-project-structure-worker-observation.v1";
  readonly originalWorkerPacketAndPromiseCustodyRetained: true;
  readonly originalDebounceTimerAndResolverRetained: true;
  readonly callbackSuccessAndFinalizersObserved: true;
  readonly nativeTransportIntegrationVerified: false;
  readonly nativeQueueCompletionGranted: false;
  readonly mainPublicationVerified: false;
  readonly completeSqlEffectVerified: false;
  readonly executionAuthorized: false;
}
export interface CurrentProjectStructureWorkerRetained {
  readonly issuer: object;
  readonly lease: CurrentProjectStructureWorkerLease;
  readonly packet: string;
  readonly task: string;
  readonly datas: string;
  readonly taskSet: string;
  readonly response: string;
  readonly debounceTimer: number;
  readonly debounceResolver: string;
  readonly uploadPromise: string;
  readonly structurePromise: string;
}
const observations = new WeakMap<CurrentProjectStructureWorkerObservation, CurrentProjectStructureWorkerRetained>();
const consumed = new WeakSet<CurrentProjectStructureWorkerLease>();
/** Return an original worker observation only while its retained lease passes
 * cleanup checks. Its handles grant no normal execution or current completion
 * authority. */
export function requireCurrentProjectStructureWorkerObservation(observation: CurrentProjectStructureWorkerObservation): CurrentProjectStructureWorkerRetained {
  const original = observations.get(observation); if (original === undefined) { throw fail("ORIGINAL_OBSERVATION"); }
  requireCurrentProjectStructureWorkerLease(original.lease).assertCleanup(); return original;
}
function fail(code: string): Error { return new Error(`PROJECT_STRUCTURE_WORKER_${code}`); }
function need(value: boolean): asserts value { if (!value) { throw fail("RELATION"); } }
function object(input: z.infer<typeof remote> | undefined): string {
  need(input?.type === "object" && input.objectId !== undefined && input.subtype !== "null"); return input.objectId;
}
async function bounded<T>(promise: Promise<T>, milliseconds = 2000): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try { const deadline = Promise.withResolvers<never>(); timer = setTimeout(() => { deadline.reject(fail("DEADLINE")); }, milliseconds); return await Promise.race([promise, deadline.promise]); }
  finally { clearTimeout(timer); }
}
export class CurrentProjectStructureWorkerObserver {
  readonly #lease: CurrentProjectStructureWorkerLease;
  readonly #binding: CurrentProjectStructureWorkerBinding;
  readonly #breakpoints: Breakpoint[] = [];
  readonly #raw: unknown[] = [];
  readonly #finalizers = new Set<"upload" | "structure">();
  readonly #finished = Promise.withResolvers<null>();
  #unsubscribe: (() => void) | null = null;
  #pause: Pause | null = null;
  #chain: Promise<void> = Promise.resolve();
  #error: unknown = null;
  #revocationError: unknown = null;
  #failed = false;
  #attempted = false;
  #uncertainBreakpoint = false;
  #requests = 0;
  #normalRequests = 0;
  #cleanupRequests = 0;
  #packet: string | null = null;
  #task: string | null = null;
  #datas: string | null = null;
  #taskSet: string | null = null;
  #response: string | null = null;
  #timer: number | null = null;
  #resolver: string | null = null;
  #upload: string | null = null;
  #structure: string | null = null;
  #value: Packet | null = null;
  #callbackReturned = false;
  #observationAttempted = false;
  #cleanupStarted = false;
  #armed = false;
  public constructor(lease: CurrentProjectStructureWorkerLease) { this.#lease = lease; this.#binding = requireCurrentProjectStructureWorkerLease(lease); }
  #stop(error: unknown): void {
    if (!this.#failed) {
      this.#failed = true; this.#error = error;
      try { this.#binding.fail(); } catch (revocationError) { this.#revocationError = revocationError; }
    }
    this.#finished.resolve(null);
  }
  async #send(command: CurrentPcbWorkerConstructionCommand, cleanup = false, retainAllocationReply?: (reply: unknown) => void): Promise<unknown> {
    this.#binding.assertCleanup();
    if (!cleanup) { need(!this.#failed && !this.#cleanupStarted); await this.#binding.assertOriginal(); }
    if (cleanup) { need(this.#cleanupRequests < 6); this.#cleanupRequests += 1; }
    else { need(this.#normalRequests < 160); this.#normalRequests += 1; }
    this.#requests += 1;
    const capture = command.method === "Runtime.callFunctionOn" && command.params.functionDeclaration === CALLS.packetText
      ? captureCurrentProjectStructureCompletionReply : captureCurrentPcbStringClockReply;
    const retain = retainAllocationReply === undefined ? undefined : (reply: unknown): void => {
      const raw = capture(reply).value; this.#raw.push(raw); retainAllocationReply(raw);
    };
    const reply = await bounded(this.#binding.request(command, cleanup, retain));
    const raw = capture(reply).value; if (retain === undefined) { this.#raw.push(raw); }
    if (!cleanup) { await this.#binding.assertOriginal(); }
    this.#binding.assertCleanup(); return raw;
  }
  #properties(objectId: string): Promise<unknown> { return this.#send({ method: "Runtime.getProperties", params: { objectId, ownProperties: true, generatePreview: false } }); }
  #call(program: keyof typeof CALLS, objectId: string, args: readonly string[], returnByValue = true): Promise<unknown> {
    const argumentsList = args.map(id => Object.freeze({ objectId: id }));
    return this.#send({ method: "Runtime.callFunctionOn", params: { objectId, functionDeclaration: CALLS[program],
      arguments: argumentsList, objectGroup: GROUP, returnByValue, silent: true,
      generatePreview: false, throwOnSideEffect: true, awaitPromise: false, userGesture: false } });
  }
  async #readPacket(objectId: string): Promise<Packet> {
    const value = await this.#call("packetText", objectId, []);
    const schema = z.object({ type: z.literal("object"), value: packetSchema }).strict();
    return z.object({ result: schema }).strict().parse(value).result.value;
  }
  async #retain(objectId: string): Promise<string> {
    return object(z.object({ result: remote }).strict().parse(await this.#call("retain", objectId, [], false)).result);
  }
  async #retainFunction(objectId: string): Promise<string> {
    const value = z.object({ result: remote }).strict().parse(await this.#call("retain", objectId, [], false)).result;
    need(value.type === "function" && value.objectId !== undefined); return value.objectId;
  }
  async #boolean(program: "same" | "taskRemoved" | "success", objectId: string, args: readonly string[]): Promise<void> {
    z.object({ result: z.object({ type: z.literal("boolean"), value: z.literal(true) }).strict() }).strict().parse(await this.#call(program, objectId, args));
  }
  async #own(objectId: string, uninitialized: readonly string[] = []): Promise<Map<string, z.infer<typeof remote>>> {
    const entries = properties.parse(await this.#properties(objectId)).result;
    const result = new Map<string, z.infer<typeof remote>>();
    for (const item of entries) { need(item.get === undefined && item.set === undefined && !result.has(item.name)); if (item.value === undefined) { need(uninitialized.includes(item.name)); } else { result.set(item.name, item.value); } }
    return result;
  }
  async #serial(scope: string, callbackObjectId: string): Promise<string> {
    const raw = z.object({ result: remote }).strict().parse(await this.#call("serial", scope, [callbackObjectId], false));
    const values = await this.#own(object(raw.result)); need(values.size === 3 && values.get("length")?.value === 2);
    return object(values.get("0"));
  }
  async #queues(): Promise<void> {
    const scopes = await this.#binding.freshScopes();
    const debounce = object(z.object({ result: remote }).strict().parse(await this.#call("debounce", scopes.debounce,
      [scopes.debounceParameters, this.#binding.structureCallback], false)).result);
    const values = await this.#own(debounce);
    const resolver = values.get("1"), timer = values.get("0");
    need(values.size === 3 && values.get("length")?.value === 2 && timer?.type === "number" &&
      typeof timer.value === "number" && Number.isSafeInteger(timer.value) && timer.value > 0 && resolver?.type === "function" && resolver.objectId !== undefined);
    if (this.#timer === null && this.#resolver === null) { this.#timer = timer.value; this.#resolver = await this.#retainFunction(resolver.objectId); }
    else { need(this.#timer === timer.value && this.#resolver !== null); await this.#boolean("same", resolver.objectId, [this.#resolver]); }
    const upload = await this.#serial(scopes.upload, this.#binding.uploadCallback);
    const structure = await this.#serial(scopes.structure, this.#binding.debounce);
    if (this.#upload === null && this.#structure === null) { this.#upload = upload; this.#structure = structure; }
    else { need(this.#upload !== null && this.#structure !== null); await this.#boolean("same", upload, [this.#upload]); await this.#boolean("same", structure, [this.#structure]); }
  }
  /** Require untouched serial/debounce closures before and after arming.
   * This rejects work that started before this observer retained its pauses.
   * It does not supply whole-project frontier or continuation exclusion. */
  async #pristine(): Promise<void> {
    const scopes = await this.#binding.freshScopes();
    z.object({ result: z.object({ type: z.literal("boolean"), value: z.literal(true) }).strict() }).strict().parse(
      await this.#call("pristine", this.#binding.project, [scopes.upload, scopes.structure, scopes.debounce, scopes.debounceParameters,
        this.#binding.uploadCallback, this.#binding.debounce, this.#binding.structureCallback]));
  }
  async #promiseFulfilled(objectId: string): Promise<void> {
    const internal = z.object({ name: z.string(), value: remote }).strict();
    const raw = z.looseObject({ internalProperties: z.array(internal).min(2).max(4) }).parse(await this.#properties(objectId));
    const states = raw.internalProperties.filter(item => item.name === "[[PromiseState]]");
    need(states.length === 1 && states[0]?.value.type === "string" && states[0].value.value === "fulfilled");
  }
  readonly #acceptsPause = (input: unknown): boolean => {
    try { const captured = captureCurrentPcbStringClockReply(input).value;
      const raw = z.looseObject({ hitBreakpoints: z.array(handle).max(32) }).parse(captured);
      return raw.hitBreakpoints.some(id => this.#breakpoints.some(point => point.id === id)); } catch { return false; }
  };
  readonly #paused = (input: unknown): void => {
    try {
      need(this.#pause === null || this.#pause.resumed);
      const pause: Pause = { raw: null, resumed: false, attempted: false, signal: Promise.withResolvers<null>() }; this.#pause = pause;
      const raw = captureCurrentPcbStringClockReply(input).value; this.#raw.push(raw); pause.raw = pauseSchema.parse(raw);
      const previous = this.#chain;
      this.#chain = (async (): Promise<void> => { await previous; try { await this.#process(pause); } catch (error) { this.#stop(error); } })();
    } catch (error) { this.#stop(error); }
  };
  readonly #resumed = (): void => {
    const pause = this.#pause; if (pause === null || pause.resumed || !pause.attempted) { this.#stop(fail("UNEXPECTED_RESUME")); return; }
    pause.resumed = true; pause.signal.resolve(null);
  };
  async #resume(pause: Pause, cleanup = false): Promise<void> {
    need(!pause.attempted); pause.attempted = true;
    z.object({}).strict().parse(await this.#send({ method: "Debugger.resume", params: {} }, cleanup)); await bounded(pause.signal.promise);
  }
  async #locals(pause: Pause, beforeAwait: boolean): Promise<Map<string, z.infer<typeof remote>>> {
    need(pause.raw !== null); const frame = pause.raw.callFrames[0]; need(frame !== undefined);
    const selected = frame.scopeChain.filter(scope => scope.type === "local" || scope.type === "block");
    need(selected.length === 2 && selected[0]?.type === "block" && selected[1]?.type === "local");
    const values = new Map<string, z.infer<typeof remote>>();
    for (const scope of selected) { for (const [name, value] of await this.#own(object(scope.object), beforeAwait ? ["d"] : [])) { need(!values.has(name)); values.set(name, value); } }
    return values;
  }
  async #process(pause: Pause): Promise<void> {
    need(!this.#failed && this.#armed && pause.raw !== null); const raw = pause.raw;
    const point = this.#breakpoints.find(p => p.id === raw.hitBreakpoints[0]); need(point !== undefined);
    const frame = raw.callFrames[0], site = CURRENT_PROJECT_STRUCTURE_WORKER_SITES[point.site];
    need(frame?.location.scriptId === this.#binding.scriptId && frame.location.lineNumber === site.lineNumber && frame.location.columnNumber === site.columnNumber);
    if (point.site === "queuedFinally") { throw fail("QUEUED_UPLOAD_UNSUPPORTED"); }
    if (point.site === "initialFinally") {
      need(this.#callbackReturned);
      const closure = frame.scopeChain.find(scope => scope.type === "closure" && scope.name === "Nd"); need(closure !== undefined);
      const kind = z.object({ result: z.object({ type: z.literal("string"), value: z.enum(["upload", "structure"]) }).strict() }).strict()
        .parse(await this.#call("callbackKind", object(closure.object), [this.#binding.uploadCallback, this.#binding.debounce])).result.value;
      need(!this.#finalizers.has(kind));
      const closureValues = await this.#own(object(closure.object)); const promise = object(closureValues.get("t"));
      const original = kind === "upload" ? this.#upload : this.#structure; need(original !== null);
      await this.#boolean("same", promise, [original]); need(closureValues.get("s")?.value === null);
      this.#finalizers.add(kind); await this.#resume(pause);
      if (this.#finalizers.size === 2) { this.#finished.resolve(null); }
      return;
    }
    const locals = await this.#locals(pause, point.site === "packet"), packet = object(locals.get("p")), task = object(locals.get("r"));
    if (point.site === "packet") {
      need(this.#packet === null);
      const timerFrame = raw.callFrames[1];
      need(timerFrame?.functionLocation.scriptId === this.#binding.scriptId && timerFrame.functionLocation.lineNumber === 109 && timerFrame.functionLocation.columnNumber === 164_014);
      await this.#queues();
      const array = object(z.object({ result: remote }).strict().parse(await this.#call("packet", packet, [this.#binding.project, task], false)).result);
      const values = await this.#own(array); need(values.size === 3 && values.get("length")?.value === 2);
      this.#datas = await this.#retain(object(values.get("0"))); this.#taskSet = await this.#retain(object(values.get("1")));
      this.#value = await this.#readPacket(packet);
      this.#packet = await this.#retain(packet); this.#task = await this.#retain(task);
    } else {
      need(this.#packet !== null && this.#task !== null); await this.#boolean("same", packet, [this.#packet]); await this.#boolean("same", task, [this.#task]);
      need(this.#value !== null && this.#datas !== null && this.#taskSet !== null);
      const taskSet = object(z.object({ result: remote }).strict().parse(await this.#call("taskSet", this.#binding.project, [], false)).result);
      await this.#boolean("same", taskSet, [this.#taskSet]);
      const current = await this.#readPacket(packet);
      need(current.projectUuid === this.#value.projectUuid && current.branchUuid === this.#value.branchUuid &&
        current.ticket === this.#value.ticket && current.structureText === this.#value.structureText);
      const data = object(z.object({ result: remote }).strict().parse(await this.#call("data", packet, [], false)).result);
      await this.#boolean("same", data, [this.#datas]);
      const response = object(locals.get("d")); await this.#boolean("success", response, []);
      if (point.site === "response") { need(this.#response === null); await this.#queues(); this.#response = await this.#retain(response); }
      else { need(this.#response !== null); await this.#boolean("same", response, [this.#response]);
        await this.#boolean("taskRemoved", this.#binding.project, [task, this.#taskSet]); await this.#promiseFulfilled(task); this.#callbackReturned = true; }
    }
    await this.#resume(pause);
  }
  /** Arm before the independently authorized operation. This starts no timer,
   * upload, edit or Save and does not manufacture an operation eligibility. */
  public async arm(): Promise<void> {
    need(!this.#attempted && !consumed.has(this.#lease)); this.#attempted = true; consumed.add(this.#lease);
    try {
      await this.#binding.assertOriginal();
      await this.#pristine();
      this.#unsubscribe = this.#binding.subscribe(Object.freeze({ acceptsPause: this.#acceptsPause, paused: this.#paused,
        resumed: this.#resumed, lost: (): void => { this.#stop(fail("OWNER_LOST")); } }));
      for (const site of ["packet", "response", "callbackReturn", "initialFinally", "queuedFinally"] as const) {
        const value = CURRENT_PROJECT_STRUCTURE_WORKER_SITES[site];
        this.#uncertainBreakpoint = true;
        let retained = false;
        const retain = (raw: unknown): void => {
          const allocated = z.looseObject({ breakpointId: handle }).safeParse(raw);
          if (allocated.success && !this.#breakpoints.some(p => p.id === allocated.data.breakpointId)) {
            this.#breakpoints.push({ id: allocated.data.breakpointId, site, attempted: false, removed: false }); this.#uncertainBreakpoint = false; retained = true;
          }
        };
        const raw = await this.#send({ method: "Debugger.setBreakpoint", params: { location: { scriptId: this.#binding.scriptId,
          lineNumber: value.lineNumber, columnNumber: value.columnNumber } } }, false, retain);
        const result = z.object({ breakpointId: handle, actualLocation: location }).strict().parse(raw);
        need(retained && this.#breakpoints.at(-1)?.id === result.breakpointId && result.actualLocation.scriptId === this.#binding.scriptId &&
          result.actualLocation.lineNumber === value.lineNumber && result.actualLocation.columnNumber === value.columnNumber);
      }
      await this.#pristine(); this.#armed = true;
    } catch (error) { this.#stop(error); throw error; }
  }
  public async observation(): Promise<CurrentProjectStructureWorkerObservation> {
    need(this.#attempted && !this.#observationAttempted); this.#observationAttempted = true; try { await bounded(this.#finished.promise, 15_000); } catch (error) { this.#stop(error); throw error; } await this.#chain;
    if (this.#failed) { throw this.#error; }
    need(this.#value !== null && this.#packet !== null && this.#task !== null && this.#datas !== null && this.#taskSet !== null && this.#response !== null &&
      this.#upload !== null && this.#structure !== null && this.#timer !== null && this.#resolver !== null && this.#finalizers.size === 2 && this.#callbackReturned);
    await this.#promiseFulfilled(this.#upload); await this.#promiseFulfilled(this.#structure); await this.#binding.assertOriginal();
    const observation = Object.freeze({ ...this.#value, profile: "private.current-project-structure-worker-observation.v1" as const,
      originalWorkerPacketAndPromiseCustodyRetained: true as const, originalDebounceTimerAndResolverRetained: true as const, callbackSuccessAndFinalizersObserved: true as const,
      nativeTransportIntegrationVerified: false as const, nativeQueueCompletionGranted: false as const, mainPublicationVerified: false as const,
      completeSqlEffectVerified: false as const, executionAuthorized: false as const });
    observations.set(observation, Object.freeze({ issuer: this.#binding.issuer, lease: this.#lease, packet: this.#packet, task: this.#task, datas: this.#datas, taskSet: this.#taskSet,
      response: this.#response, debounceTimer: this.#timer, debounceResolver: this.#resolver, uploadPromise: this.#upload, structurePromise: this.#structure })); return observation;
  }
  /** Remove only retained original breakpoint IDs and resume a retained pause
   * once. Ambiguous allocation or resume acknowledgment keeps owner custody. */
  public async cleanup(): Promise<void> {
    this.#cleanupStarted = true;
    await this.#chain;
    for (const point of this.#breakpoints) {
      if (!point.removed) {
        need(!point.attempted); point.attempted = true;
        z.object({}).strict().parse(await this.#send({ method: "Debugger.removeBreakpoint", params: { breakpointId: point.id } }, true)); point.removed = true;
      }
    }
    const pause = this.#pause;
    if (pause !== null && !pause.resumed) { need(!pause.attempted); await this.#resume(pause, true); }
    need(!this.#uncertainBreakpoint && this.#pause === pause && (pause === null || pause.resumed)); this.#unsubscribe?.(); this.#unsubscribe = null;
  }
  public retained(): Readonly<{ failed: boolean; error: unknown; revocationError: unknown; requests: number; replies: readonly unknown[]; pendingPause: boolean; unresolvedBreakpoints: boolean }> {
    return Object.freeze({ failed: this.#failed, error: this.#error, revocationError: this.#revocationError, requests: this.#requests, replies: Object.freeze([...this.#raw]),
      pendingPause: this.#pause !== null && !this.#pause.resumed, unresolvedBreakpoints: this.#uncertainBreakpoint || this.#breakpoints.some(point => !point.removed) });
  }
}
