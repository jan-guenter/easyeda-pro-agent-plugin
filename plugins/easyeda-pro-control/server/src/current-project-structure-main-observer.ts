/** Unmounted original-main structure observer. It observes an independently
 * authorized request; it dispatches no POST, edit, SQL operation or response.
 * The existing native vocabulary/purpose and cross-worker join remain closed. */
import { performance } from "node:perf_hooks";
import { setTimeout as delay } from "node:timers/promises";
import { z } from "zod";
import { requireCurrentProjectStructureMainLease } from "./current-project-structure-main-lease.ts";
import type { CurrentProjectStructureMainBinding, CurrentProjectStructureMainLease } from "./current-project-structure-main-lease.ts";
import { CURRENT_PROJECT_STRUCTURE_MAIN_ORDER as ORDER, CURRENT_PROJECT_STRUCTURE_MAIN_SITES as SITES, requireCurrentProjectStructureMainSource } from "./current-project-structure-main-source.ts";
import type { CurrentProjectStructureMainStage as Stage } from "./current-project-structure-main-source.ts";
import { CURRENT_PROJECT_STRUCTURE_MAIN_FLAGS as FLAGS, CURRENT_PROJECT_STRUCTURE_MAIN_REQUESTS as REQUESTS,
  captureCurrentProjectStructureMainData as capture, decodeCurrentProjectStructureMainPause, validateCurrentProjectStructureMainCommand,
  validateCurrentProjectStructureMainPlan } from "./current-project-structure-main-protocol.ts";
import type { CurrentProjectStructureMainCommand as Command, CurrentProjectStructureMainPlan as Plan } from "./current-project-structure-main-protocol.ts";
import { CURRENT_PROJECT_STRUCTURE_MAIN_EXPRESSIONS as EXPRESSIONS, CURRENT_PROJECT_STRUCTURE_MAIN_GROUP as GROUP,
  CURRENT_PROJECT_STRUCTURE_MAIN_PROGRAMS as PROGRAMS } from "./current-project-structure-main-programs.ts";

const handle = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
const empty = z.object({}).strict();
const remote = z.looseObject({ type: z.string(), subtype: z.string().optional(), objectId: handle.optional(), value: z.unknown().optional() });
const arrayReply = z.object({ result: z.object({ type: z.literal("object"), subtype: z.literal("array"), className: z.literal("Array"),
  objectId: handle, description: z.string().max(32) }).strict() }).strict();
const property = z.looseObject({ name: z.string(), value: remote.optional(), get: z.unknown().optional(), set: z.unknown().optional() });
const internal = z.object({ name: z.string(), value: remote }).strict();
const propertyReply = z.looseObject({ result: z.array(property).max(128), internalProperties: z.array(internal).max(8).optional() });
const valueSchema = z.object({ projectUuid: z.string(), branchUuid: z.string(), ticket: z.number().int().positive(), structureText: z.string(),
  projectPath: z.string().min(1).max(4096), selectedTicket: z.number().int().nonnegative(), selectedRows: z.number().int().min(1).max(4096) }).strict();
interface Point { readonly stage: Stage; readonly id: string; attempted: boolean; removed: boolean }
interface Pause { readonly stage: Stage; readonly frameId: string; readonly callerId: string | null; attempted: boolean; resumed: boolean }
export interface CurrentProjectStructureMainObservation extends Plan {
  readonly profile: "private.current-project-structure-main-observation.v1";
  readonly projectPath: string;
  readonly selectedTicket: number;
  readonly selectedRows: number;
  readonly originalRequestConnectionAndResponseRetained: true;
  readonly lowerTicketBranchWideUpdateReturnObserved: true;
  readonly nativeTransportIntegrationVerified: false;
  readonly workerSameOwnerJoinVerified: false;
  readonly mainPublicationVerified: false;
  readonly completeSqlEffectVerified: false;
  readonly executionAuthorized: false;
}
export interface CurrentProjectStructureMainRetained {
  readonly issuer: object;
  readonly lease: CurrentProjectStructureMainLease;
  /** Original remote array retains the actual request, connection and response. */
  readonly packet: string;
}
const observations = new WeakMap<object, CurrentProjectStructureMainRetained>();
const consumed = new WeakSet<CurrentProjectStructureMainLease>();
/** Require original observation membership and a still-retained original lease;
 * deserialized output cannot provide cross-process request or SQL custody. */
export function requireCurrentProjectStructureMainObservation(input: unknown): CurrentProjectStructureMainRetained {
  need(input !== null && typeof input === "object", "ORIGINAL_OBSERVATION");
  const retained = observations.get(input); need(retained !== undefined, "ORIGINAL_OBSERVATION");
  requireCurrentProjectStructureMainLease(retained.lease).assertCleanup(); return retained;
}
/** Refuse with a fixed phase code without echoing project data or remote IDs. */
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`PROJECT_STRUCTURE_MAIN_${code}`); } }
/** Extract one native remote object while refusing primitive/null results. */
function object(value: z.infer<typeof remote> | undefined): string {
  need(value !== undefined && value.type === "object" && value.subtype !== "null" && value.objectId !== undefined, "REMOTE_OBJECT"); return value.objectId;
}
export class CurrentProjectStructureMainObserver {
  readonly #lease: CurrentProjectStructureMainLease;
  readonly #binding: CurrentProjectStructureMainBinding;
  readonly #plan: Plan;
  readonly #points: Point[] = [];
  readonly #pauses: Pause[] = [];
  readonly #packets = new Map<Stage, string>();
  #started = 0;
  #attempted = false;
  #armed = false;
  #busy = false;
  #failed = false;
  #uncertain = false;
  #unknownPause = false;
  #normal = 0;
  #cleanup = 0;
  #resuming: Pause | null = null;
  #cleanupAttempted = false;
  #releaseAttempted = false;
  #released = false;
  #packet: CurrentProjectStructureMainObservation | null = null;
  /** A comparison plan cannot create the required original construction lease. */
  public constructor(lease: CurrentProjectStructureMainLease, input: unknown) {
    this.#binding = requireCurrentProjectStructureMainLease(lease); this.#lease = lease; this.#plan = validateCurrentProjectStructureMainPlan(input);
    requireCurrentProjectStructureMainSource(this.#binding.source);
    need(!consumed.has(lease), "CONSUMED"); consumed.add(lease);
  }
  /** Reprove original custody across every await; cleanup has no normal replay. */
  async #current(cleanup: boolean): Promise<void> {
    need(!this.#released && requireCurrentProjectStructureMainLease(this.#lease) === this.#binding, "ORIGINAL_OWNER");
    requireCurrentProjectStructureMainSource(this.#binding.source);
    if (cleanup) { this.#binding.assertCleanup(); }
    else { need(!this.#failed && !this.#cleanupAttempted && (this.#started === 0 || performance.now() - this.#started < 15_000), "FAILED"); await this.#binding.assertOriginal(); }
    need(requireCurrentProjectStructureMainLease(this.#lease) === this.#binding, "ORIGINAL_OWNER");
  }
  /** Consume only the expected fixed pause and the acknowledgment of our own
   * preceding resume; unrelated or duplicate events retain uncertain custody. */
  #drain(): void {
    for (let count = 0; count < 64; count += 1) {
      const event = this.#binding.takeEvent(); if (event === null) { return; }
      if (event.method === "Debugger.resumed") {
        empty.parse(capture(event.params)); need(this.#resuming !== null && this.#resuming.attempted && !this.#resuming.resumed, "UNEXPECTED_RESUME");
        this.#resuming.resumed = true; this.#resuming = null;
      } else {
        const stage = ORDER[this.#pauses.length]; const point = this.#points.find(value => value.stage === stage);
        try {
          need(this.#armed && stage !== undefined && point !== undefined && (this.#pauses.length === 0 || this.#pauses.at(-1)?.resumed === true), "UNEXPECTED_PAUSE");
          const paused = decodeCurrentProjectStructureMainPause(event.params, stage, this.#binding.scriptId, point.id);
          this.#pauses.push({ stage, ...paused, attempted: false, resumed: false });
        } catch (error) { this.#unknownPause = true; throw error; }
      }
    }
    this.#unknownPause = true; throw new Error("PROJECT_STRUCTURE_MAIN_EVENT_BOUND");
  }
  /** Preserve separate fixed normal and cleanup counters before dispatch. */
  async #send(input: Command, cleanup = false): Promise<unknown> {
    await this.#current(cleanup); this.#drain(); need(cleanup ? this.#cleanup < REQUESTS.cleanup : this.#normal < REQUESTS.normal, "REQUEST_BOUND");
    const command = validateCurrentProjectStructureMainCommand(input); if (cleanup) { this.#cleanup += 1; } else { this.#normal += 1; }
    const result = capture(await this.#binding.request(command, cleanup)); await this.#current(cleanup); this.#drain(); return result;
  }
  /** Capture a fixed frame expression directly into the retained object group. */
  async #frame(stage: keyof typeof EXPRESSIONS, frameId: string): Promise<string> {
    return arrayReply.parse(await this.#send({ phase: "structure-main-frame", stage, method: "Debugger.evaluateOnCallFrame", params: {
      callFrameId: frameId, expression: EXPRESSIONS[stage], objectGroup: GROUP, silent: true, returnByValue: false, generatePreview: false,
      throwOnSideEffect: true, includeCommandLineAPI: false } })).result.objectId;
  }
  /** Join actual remote objects by descriptor identity, preserving them in a
   * new retained array rather than trusting equality of remote handle strings. */
  async #join(stage: keyof typeof PROGRAMS, objectId: string, args: readonly string[], plan?: Plan): Promise<string | null> {
    const byValue = ["context-join", "connection", "value"].includes(stage);
    const argumentsList: ({ objectId: string } | { value: Plan })[] = args.map(id => ({ objectId: id })); if (plan !== undefined) { argumentsList.push({ value: plan }); }
    const result = await this.#send({ phase: "structure-main-join", stage, method: "Runtime.callFunctionOn", params: {
      ...FLAGS, objectId, functionDeclaration: PROGRAMS[stage], arguments: argumentsList, returnByValue: byValue } });
    if (byValue) { z.object({ result: z.object({ type: z.literal("boolean"), value: z.literal(true) }).strict() }).strict().parse(result); return null; }
    return arrayReply.parse(result).result.objectId;
  }
  /** Read the original DB promise's native fulfilled result, then compare the
   * actual object to the SELECT receiver within the retained runtime context. */
  async #connection(query: string): Promise<void> {
    const properties = (id: string): Promise<unknown> => this.#send({ phase: "structure-main-properties", method: "Runtime.getProperties", params: {
      objectId: id, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } });
    const packet = propertyReply.parse(await properties(query)); const promiseFields = packet.result.filter(value => value.name === "6");
    need(promiseFields.length === 1 && promiseFields[0]?.get === undefined && promiseFields[0]?.set === undefined && promiseFields[0]?.value?.subtype === "promise", "DB_PROMISE");
    const promise = propertyReply.parse(await properties(object(promiseFields[0]?.value)));
    const states = promise.internalProperties?.filter(value => value.name === "[[PromiseState]]") ?? [];
    const results = promise.internalProperties?.filter(value => value.name === "[[PromiseResult]]") ?? [];
    need(states.length === 1 && states[0]?.value.type === "string" && states[0].value.value === "fulfilled" && results.length === 1, "DB_PROMISE_RESULT");
    await this.#join("connection", query, [object(results[0]?.value)]);
  }
  /** Pump only this original inspector, with finite source-observer waiting. */
  async #wait(predicate: () => boolean): Promise<void> {
    while (!predicate()) {
      await this.#current(false); await this.#binding.pump(false); this.#drain();
      if (!predicate()) { await delay(1); }
    }
  }
  /** Arm before an independently authorized structure operation; no application
   * callback, queue, upload or SQL operation is started by this method. */
  public async arm(): Promise<void> {
    need(!this.#busy && !this.#attempted, "CONSUMED"); this.#attempted = true; this.#busy = true;
    try {
      for (const stage of ORDER) {
        const site = SITES[stage]; this.#uncertain = true;
        const raw = await this.#send({ phase: "structure-main-arm", stage, method: "Debugger.setBreakpoint", params: {
          location: { scriptId: this.#binding.scriptId, lineNumber: site.lineNumber, columnNumber: site.columnNumber } } });
        const allocated = z.looseObject({ breakpointId: handle }).safeParse(raw);
        if (allocated.success && !this.#points.some(value => value.id === allocated.data.breakpointId)) {
          this.#points.push({ stage, id: allocated.data.breakpointId, attempted: false, removed: false }); this.#uncertain = false;
        }
        const reply = z.object({ breakpointId: handle, actualLocation: z.object({ scriptId: handle, lineNumber: z.number(), columnNumber: z.number() }).strict() }).strict().parse(raw);
        need(this.#points.at(-1)?.id === reply.breakpointId && reply.actualLocation.scriptId === this.#binding.scriptId &&
          reply.actualLocation.lineNumber === site.lineNumber && reply.actualLocation.columnNumber === site.columnNumber, "BREAKPOINT_LOCATION");
      }
      this.#armed = true;
    } catch (error) { this.#failed = true; this.#binding.fail(); throw error; } finally { this.#busy = false; }
  }
  /** Retain the complete ordered source chain. This proves neither cross-realm
   * same-owner joining nor response delivery or independent complete SQL. */
  public async observation(): Promise<CurrentProjectStructureMainObservation> {
    need(this.#armed && !this.#busy && !this.#cleanupAttempted, "NOT_ARMED"); this.#busy = true;
    try {
      if (this.#packet !== null) { await this.#current(false); return this.#packet; }
      this.#started = performance.now();
      for (const [index, stage] of ORDER.entries()) {
        await this.#wait(() => this.#pauses.length > index); const pause = this.#pauses[index]; need(pause !== undefined, "PAUSE");
        const frame = await this.#frame(stage, pause.frameId); let packet: string | null;
        if (stage === "driver") {
          need(pause.callerId !== null, "DRIVER_CALLER"); packet = await this.#join(stage, frame, [this.#binding.construction, await this.#frame("driverCaller", pause.callerId)]);
        } else if (stage === "context") {
          packet = await this.#join(stage, frame, [this.#binding.construction]); const driver = this.#packets.get("driver"); need(driver !== undefined && packet !== null, "DRIVER_PACKET");
          await this.#join("context-join", driver, [packet]);
        } else if (stage === "controller") {
          const context = this.#packets.get("context"), driver = this.#packets.get("driver"); need(context !== undefined && driver !== undefined, "CONTEXT_PACKET");
          packet = await this.#join(stage, frame, [context, driver], this.#plan);
        } else if (stage === "query-one") {
          const controller = this.#packets.get("controller"); need(controller !== undefined && pause.callerId !== null, "CONTROLLER_PACKET");
          packet = await this.#join(stage, frame, [controller, await this.#frame("selectCaller", pause.callerId)]); need(packet !== null, "QUERY_PACKET"); await this.#connection(packet);
        } else {
          const previous = ORDER[index - 1], retained = previous === undefined ? undefined : this.#packets.get(previous); need(retained !== undefined, "PREVIOUS_PACKET");
          packet = await this.#join(stage, frame, [retained]);
        }
        need(packet !== null, "PACKET"); this.#packets.set(stage, packet); pause.attempted = true; this.#resuming = pause;
        empty.parse(await this.#send({ phase: "structure-main-resume", method: "Debugger.resume", params: {} }, true)); await this.#wait(() => pause.resumed);
      }
      const packet = this.#packets.get("response"); need(packet !== undefined, "RESPONSE_PACKET");
      const raw = await this.#send({ phase: "structure-main-join", stage: "value", method: "Runtime.callFunctionOn", params: {
        ...FLAGS, objectId: packet, functionDeclaration: PROGRAMS.value, arguments: [], returnByValue: true } });
      const result = z.object({ result: z.object({ type: z.literal("object"), value: valueSchema }).strict() }).strict().parse(raw).result.value;
      need(result.projectUuid === this.#plan.projectUuid && result.branchUuid === this.#plan.branchUuid && result.ticket === this.#plan.ticket &&
        result.structureText === this.#plan.structureText && result.selectedTicket < result.ticket, "RESULT_JOIN");
      const value: CurrentProjectStructureMainObservation = Object.freeze({ ...result, profile: "private.current-project-structure-main-observation.v1",
        originalRequestConnectionAndResponseRetained: true, lowerTicketBranchWideUpdateReturnObserved: true,
        nativeTransportIntegrationVerified: false, workerSameOwnerJoinVerified: false, mainPublicationVerified: false, completeSqlEffectVerified: false, executionAuthorized: false });
      observations.set(value, Object.freeze({ issuer: this.#binding.issuer, lease: this.#lease, packet })); this.#packet = value; return value;
    } catch (error) { this.#failed = true; this.#binding.fail(); throw error; } finally { this.#busy = false; }
  }
  /** Remove only acknowledged original allocations and resume only a known
   * pause once. Unknown pause/allocation or lost acknowledgments retain custody. */
  public async cleanup(): Promise<void> {
    need(!this.#busy && !this.#cleanupAttempted, "CLEANUP_CONSUMED"); this.#cleanupAttempted = true; this.#busy = true;
    try {
      for (const point of this.#points) {
        need(!point.attempted, "REMOVE_CONSUMED"); point.attempted = true;
        empty.parse(await this.#send({ phase: "structure-main-remove", method: "Debugger.removeBreakpoint", params: { breakpointId: point.id } }, true)); point.removed = true;
      }
      const pause = this.#pauses.at(-1);
      if (pause !== undefined && !pause.resumed) {
        need(!this.#unknownPause && !pause.attempted, "RESUME_CONSUMED"); pause.attempted = true; this.#resuming = pause;
        empty.parse(await this.#send({ phase: "structure-main-resume", method: "Debugger.resume", params: {} }, true));
        for (let count = 0; count < 32 && !pause.resumed; count += 1) { await this.#binding.pump(true); this.#drain(); }
      }
      need(!this.#uncertain && !this.#unknownPause && (pause === undefined || pause.resumed), "CLEANUP_INCOMPLETE");
    } finally { this.#busy = false; }
  }
  /** Release retained arrays only after consumers finish the original join.
   * A lost release acknowledgment is consumed and cannot mint a new lease. */
  public async release(): Promise<void> {
    need(!this.#busy && this.#cleanupAttempted && this.#points.every(point => point.removed) && !this.#releaseAttempted &&
      !this.#uncertain && !this.#unknownPause && this.#resuming === null && this.#pauses.every(pause => pause.resumed), "RELEASE_CONSUMED");
    this.#releaseAttempted = true; this.#busy = true;
    try {
      empty.parse(await this.#send({ phase: "structure-main-release", method: "Runtime.releaseObjectGroup", params: { objectGroup: GROUP } }, true));
      this.#binding.retire(); this.#released = true;
    } finally { this.#busy = false; }
  }
  /** Actual original-root exit and empty Job may retire a failed local cursor;
   * this is not helper-release acknowledgment or a completed SQL observation. */
  public settleGenerationExit(): void { need(!this.#busy, "BUSY"); this.#binding.assertGenerationExited(); this.#binding.retire(); this.#released = true; }
}
