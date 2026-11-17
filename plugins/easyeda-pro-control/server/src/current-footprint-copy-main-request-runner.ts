/** Unmounted sequenced observer of one real backend invocation. It never starts
 * that invocation, chooses a project, executes SQL or authorizes a write. The
 * original combined owner owns the sole main scheduler and all kernel handles. */
/* oxlint-disable import/max-dependencies -- The fixed provenance, selectors, protocol, original issuer and wire bound are independently enforced at this boundary. */
import { performance } from "node:perf_hooks";
import { setTimeout as delay } from "node:timers/promises";
import { z } from "zod";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { requireCurrentFootprintCopyMainRequestSource } from "./current-footprint-copy-main-request-source.ts";
// oxlint-disable-next-line import/no-cycle -- The original scheduler invokes this collector's synchronous held transfer only after both instances exist; initialization never invokes the getter.
import { requireCurrentFootprintCopyMainRequestClockOrigin, requireCurrentFootprintCopyMainRequestOrigin } from "./current-footprint-copy-main-request-origin.ts";
import type { CurrentFootprintCopyMainRequestOrigin } from "./current-footprint-copy-main-request-origin.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_COLLECTION_ORDER as ORDER,
  CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_REQUESTS as REQUESTS, currentFootprintCopyMainRequestAllocatedId, currentFootprintCopyMainRequestSourceArm,
  decodeCurrentFootprintCopyMainRequestAllocation, decodeCurrentFootprintCopyMainRequestArrayCapture, decodeCurrentFootprintCopyMainRequestArrayMember,
  decodeCurrentFootprintCopyMainRequestCollectedFunction, decodeCurrentFootprintCopyMainRequestCollectionPause,
  requireCurrentFootprintCopyMainRequestEmpty, validateCurrentFootprintCopyMainRequestCollectCommand } from "./current-footprint-copy-main-request-protocol.ts";
import type { CurrentFootprintCopyMainRequestCollectCommand as Command, CurrentFootprintCopyMainRequestCollectionStage as Stage } from "./current-footprint-copy-main-request-protocol.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_FLAGS as FLAGS, currentFootprintCopyMainRequestPlanSchema,
  decodeCurrentFootprintCopyMainRequestPromise, decodeCurrentFootprintCopyMainRequestValue } from "./current-footprint-copy-main-request-contract.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_CALLS as CALLS, CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_EXPRESSIONS as EXPRESSIONS,
  CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_GROUP as GROUP } from "./current-footprint-copy-main-request-programs.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_INVOCATION_EXPRESSIONS as INVOCATION, CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_INVOCATION_PROGRAMS as PROGRAMS } from "./current-footprint-copy-main-request-collect-programs.ts";
import { currentFootprintCopyMainRequestWire } from "./current-footprint-copy-main-request-wire.ts";
/* oxlint-disable import/no-cycle -- Late binding calls the actual paired-clock issuer after construction; no capability getter or binder runs during module initialization. */
import { assertCurrentFootprintCopyMainRequestPlanWire, bindCurrentFootprintCopyMainRequestPlan,
  isCurrentFootprintCopyMainRequestReservation, requireCurrentFootprintCopyMainRequestReservation } from "./current-footprint-copy-main-request-plan.ts";
/* oxlint-enable import/no-cycle */
import type { CurrentFootprintCopyMainRequestReservation } from "./current-footprint-copy-main-request-plan.ts";
import type { CurrentFootprintCopyClockRpcObservation } from "./current-footprint-copy-clock-rpc-runner.ts";
import type { CurrentFootprintCopyClockRpcOrigin } from "./current-footprint-copy-clock-rpc-origin.ts";

// oxlint-disable-next-line import/no-cycle -- The original backend owns issuance and synchronous held transfer; no getter runs during module initialization.
import { isCurrentFootprintForwardMainRequestOrigin, requireCurrentFootprintForwardMainRequestOrigin } from "./current-footprint-copy-main-backend-runner.ts";
import type { CurrentFootprintForwardMainRequestOrigin, CurrentFootprintForwardMainRequestOriginBindings } from "./current-footprint-forward-execution-main-origin.ts";

import { captureCurrentFootprintForwardExecutionPrototypes, requireCurrentFootprintForwardExecutionPrototypes } from "./current-footprint-forward-execution-opening-identity.ts";

// oxlint-disable-next-line import/no-cycle -- The full backend owns the original registry and consumes the held lease after construction; module initialization issues no origin.
import {isCurrentFootprintForwardWriterMainRequestOrigin,requireCurrentFootprintForwardWriterMainRequestClockOrigin,requireCurrentFootprintForwardWriterMainRequestOrigin} from "./current-footprint-forward-writer-main-origin.ts";
import type {CurrentFootprintForwardWriterMainRequestOrigin,CurrentFootprintForwardWriterMainRequestOriginBindings} from "./current-footprint-forward-writer-main-origin.ts";
// oxlint-disable-next-line import/no-cycle -- Full late binding checks the original issued clock packet only after construction; no getter or binder runs during module initialization.
import {bindCurrentFootprintForwardWriterMainRequestPlan,isCurrentFootprintForwardWriterMainRequestReservation,requireCurrentFootprintForwardWriterMainRequestReservation} from "./current-footprint-forward-writer-main-request-plan.ts";
import type {CurrentFootprintForwardWriterMainRequestReservation} from "./current-footprint-forward-writer-main-request-plan.ts";
import type {CurrentFootprintForwardWriterClockRpcOrigin} from "./current-footprint-forward-writer-clock-origin.ts";
// oxlint-disable-next-line import/no-cycle -- Bound-body lookup joins the original clock registry after both runners exist; module initialization invokes no reader.
import type {CurrentFootprintForwardWriterClockRpcObservation} from "./current-footprint-forward-writer-clock-rpc-runner.ts";
import {requireCurrentFootprintForwardWriterClockRpcObservation} from "./current-footprint-forward-writer-clock-rpc-runner.ts";

const FORWARD_INTERNAL = Symbol("original-forward-main-request-engine");
const FULL_INTERNAL=Symbol("original-full-writer-main-request-engine");
const fullEngines=new WeakSet<object>();
const fullInstances=new WeakMap<CurrentFootprintCopyMainRequestRunner,CurrentFootprintForwardWriterMainRequestOrigin>();
const fullHeldContexts = new WeakMap<object, Readonly<{ runner: CurrentFootprintCopyMainRequestRunner; origin: CurrentFootprintForwardWriterMainRequestOrigin; plan: Plan; actor: Actor }>>();
const fullConsumed=new WeakSet<object>();
const forwardEngines = new WeakSet<object>();
type RequestOrigin = CurrentFootprintCopyMainRequestOrigin | CurrentFootprintForwardMainRequestOrigin | CurrentFootprintForwardWriterMainRequestOrigin;
type Origin = ReturnType<typeof requireCurrentFootprintCopyMainRequestOrigin>;
type Plan = Readonly<z.infer<typeof currentFootprintCopyMainRequestPlanSchema>>;
type Actor = ReturnType<typeof decodeCurrentFootprintCopyMainRequestValue>;
interface Breakpoint { readonly stage: Stage; readonly id: string; removeAttempted: boolean; removed: boolean }
interface Pause {
  readonly stage: Stage; readonly frameId: string; readonly callerFrameId: string | null;
  resumeAttempted: boolean; resumeObserved: boolean;
}
export interface CurrentFootprintCopyMainRequestObservation {
  readonly profile: "private.current-footprint-copy-main-request-observation.v1";
  readonly actualOriginalDriverInvocationAndContextJoined: true;
  readonly actualOriginalControllerAndL3CallerJoined: true;
  readonly actualPbArgumentAndProjectUserRowJoined: true;
  readonly originalFulfilledPromiseResultAndSqlOwnerJoined: true;
  readonly actualBackendActor: Actor;
  readonly allFourPausesResumed: true;
  readonly allAllocatedBreakpointsRemoved: true;
  readonly temporaryObjectGroupReleased: false;
  readonly actualDocumentClockRpcJoinsObserved: false;
  readonly nativePublicationCompletionVerified: false;
  readonly nativeSqlCompletionVerified: false;
  readonly originalGenerationClosed: false;
  readonly savedResultVerified: false;
  readonly executionAuthorized: false;
}
/** Prepared before the invocation. The original PB call remains paused and its
 * object group belongs to the original collector; this token cannot resume it. */
export interface CurrentFootprintCopyMainRequestHeldFinalPb {
  readonly profile: "private.current-footprint-copy-main-request-held-final-pb.v1";
  readonly originalRequestAndSqlOwnerJoined: true;
  readonly originalFinalPbStillHeld: true;
  readonly allAllocatedRequestBreakpointsRemoved: true;
  readonly nativeSqlCompletionVerified: false;
  readonly executionAuthorized: false;
}
export interface CurrentFootprintCopyMainRequestHeldFinalPbBindings {
  readonly scriptId: string;
  readonly finalPbFrameId: string;
  readonly retainedArrayObjectId: string;
  readonly controllerObjectId: string;
  readonly actorObjectId: string;
  readonly sqlObjectId: string;
  readonly plan: Plan;
  readonly qualifiedSource: Origin["qualifiedSource"];
  readonly assertOriginal: () => Promise<void>;
}
type Phase = "ready" | "arming" | "armed" | "invocation-consumed" | "held-final-pb" | "completion-transferred" | "collected" | "failed";
interface CollectionFailure { readonly code: string; readonly phase: Phase; readonly normalRequests: number; readonly cleanupRequests: number; readonly replies: number }
const issued = new WeakMap<CurrentFootprintCopyMainRequestObservation, CurrentFootprintCopyMainRequestRunner>();
const held = new WeakMap<CurrentFootprintCopyMainRequestHeldFinalPb, Readonly<{
  owner: CurrentFootprintCopyMainRequestRunner; read: () => CurrentFootprintCopyMainRequestHeldFinalPbBindings;
}>>();
/** Factual shapes stay byte-exact; their full receipts have separate maps. */
export type CurrentFootprintForwardWriterMainRequestObservation=CurrentFootprintCopyMainRequestObservation;
export type CurrentFootprintForwardWriterMainRequestHeldFinalPb=CurrentFootprintCopyMainRequestHeldFinalPb;
export type CurrentFootprintForwardWriterMainRequestHeldFinalPbBindings=CurrentFootprintCopyMainRequestHeldFinalPbBindings;
const fullIssued=new WeakMap<CurrentFootprintForwardWriterMainRequestObservation,CurrentFootprintCopyMainRequestRunner>();
const fullHeld=new WeakMap<CurrentFootprintForwardWriterMainRequestHeldFinalPb,Readonly<{owner:CurrentFootprintCopyMainRequestRunner;read:()=>CurrentFootprintForwardWriterMainRequestHeldFinalPbBindings}>>();
const consumed = new WeakSet<object>(), failures = new WeakMap<Error, string>();
const LIMIT_MS = 300_000;
function fail(code: string): Error { const error = new Error(`FOOTPRINT_MAIN_REQUEST_COLLECTOR_${code}`); failures.set(error, code); return error; }
function need(value: boolean, code: string): asserts value { if (!value) { throw fail(code); } }
const yes = z.object({ result: z.object({ type: z.literal("boolean"), value: z.literal(true) }).strict() }).strict();
const eventSchema = z.discriminatedUnion("method", [
  z.object({ method: z.literal("Debugger.paused"), params: z.unknown() }).strict(),
  z.object({ method: z.literal("Debugger.resumed"), params: z.object({}).strict() }).strict(),
]);
export class CurrentFootprintCopyMainRequestRunner {
  readonly #token: RequestOrigin;
  readonly #fullOrigin:CurrentFootprintForwardWriterMainRequestOriginBindings|null;
  readonly #fullLatePlan:CurrentFootprintForwardWriterMainRequestReservation|null;
  readonly #forwardOrigin: CurrentFootprintForwardMainRequestOriginBindings | null;
  readonly #origin: Origin;
  #plan: Plan | null;
  readonly #latePlan: CurrentFootprintCopyMainRequestReservation | null;
  #latePlanAttempted = false;
  #fullBoundClock:CurrentFootprintForwardWriterClockRpcOrigin|null=null;
  #fullBoundPacket:CurrentFootprintForwardWriterClockRpcObservation|null=null;
  readonly #points: Breakpoint[] = [];
  readonly #pauses: Pause[] = [];
  readonly #raw: unknown[] = [];
  #phase: Phase = "ready";
  #busy = false;
  #ending = false;
  #generationEnded = false;
  #retirementSettlementAttempted = false;
  #started = 0;
  #normal = 0;
  #cleanup = 0;
  #allocationUncertain = false;
  #unknownPause = false;
  #resuming: Pause | null = null;
  #cleanupAttempted = false;
  #groupAttempted = false;
  #groupReleased = false;
  #retired = false;
  #invocation: string | null = null;
  #context: string | null = null;
  #controller: string | null = null;
  #actorPacket: string | null = null;
  #sqlPacket: string | null = null;
  #holdFinalPb = false;
  #heldPacket: CurrentFootprintCopyMainRequestHeldFinalPb | null = null;
  #packet: CurrentFootprintCopyMainRequestObservation | null = null;
  #firstFailure: CollectionFailure | null = null;
  #idle: Promise<null> = Promise.resolve(null);
  #resolveIdle: (() => void) | null = null;
  public constructor(origin: CurrentFootprintCopyMainRequestOrigin, suppliedPlan: unknown);
  public constructor(internal: typeof FORWARD_INTERNAL, origin: CurrentFootprintForwardMainRequestOrigin, suppliedPlan: unknown);
  public constructor(internal:typeof FULL_INTERNAL,origin:CurrentFootprintForwardWriterMainRequestOrigin,suppliedPlan:unknown);
  public constructor(first: CurrentFootprintCopyMainRequestOrigin | typeof FORWARD_INTERNAL | typeof FULL_INTERNAL, second: unknown, third?: unknown) {
    this.#fullOrigin=null;this.#fullLatePlan=null;
    if(first===FULL_INTERNAL){need(isCurrentFootprintForwardWriterMainRequestOrigin(second),"FULL_ORIGINAL_ORIGIN");this.#fullOrigin=requireCurrentFootprintForwardWriterMainRequestOrigin(second);this.#forwardOrigin=null;this.#origin=this.#fullOrigin;this.#token=second;
      need(isCurrentFootprintForwardWriterMainRequestReservation(third),"FULL_ORIGINAL_RESERVATION");this.#fullLatePlan=third;this.#latePlan=null;this.#plan=null;assertCurrentFootprintCopyMainRequestPlanWire(requireCurrentFootprintForwardWriterMainRequestReservation(third));return;
    }
    if (first === FORWARD_INTERNAL) {
      need(isCurrentFootprintForwardMainRequestOrigin(second), "FORWARD_ORIGINAL_ORIGIN");
      this.#forwardOrigin = requireCurrentFootprintForwardMainRequestOrigin(second); this.#origin = this.#forwardOrigin; this.#token = second;
    } else { this.#forwardOrigin = null; this.#origin = requireCurrentFootprintCopyMainRequestOrigin(first); this.#token = first; }
    const suppliedPlan = first === FORWARD_INTERNAL ? third : second;
    this.#latePlan = isCurrentFootprintCopyMainRequestReservation(suppliedPlan) ? suppliedPlan : null;
    this.#plan = this.#latePlan === null ? freezeDeep(currentFootprintCopyMainRequestPlanSchema.parse(captureCurrentPcbStringClockReply(suppliedPlan).value)) : null;
    // Refuse oversized source/escaping before allocating any breakpoint. The
    // Fixed existing native outgoing-message cap remains65536 bytes.
    if (this.#plan === null) {
      need(this.#latePlan !== null, "ORIGINAL_RESERVATION");
      assertCurrentFootprintCopyMainRequestPlanWire(requireCurrentFootprintCopyMainRequestReservation(this.#latePlan));
    } else { assertCurrentFootprintCopyMainRequestPlanWire(this.#plan); }
  }
  /** No native request runs here. The same combined scheduler must separately
   * join the main and clock origins before supplying this original packet. */
  public async bindObservedClocks(origin: CurrentFootprintCopyClockRpcOrigin, packet: CurrentFootprintCopyClockRpcObservation): Promise<void> {
    need(this.#token.profile === "private.current-footprint-copy-main-request-origin.v1", "ORIGINAL_CLOCK_ORIGIN");
    need(this.#latePlan !== null && !this.#latePlanAttempted && this.#plan === null && this.#phase === "invocation-consumed", "LATE_PLAN_CONSUMED");
    this.#begin(); this.#latePlanAttempted = true;
    try {
      requireCurrentFootprintCopyMainRequestClockOrigin(this.#token, origin); await this.#current();
      const plan = await bindCurrentFootprintCopyMainRequestPlan(this.#latePlan, origin, packet);
      await this.#current(); requireCurrentFootprintCopyMainRequestClockOrigin(this.#token, origin); this.#plan = plan;
    } catch (error) { this.#refuse(error); throw error; } finally { this.#end(); }
  }
  /** Only the original full owner may pair this request with its own actual
   * two-clock observation. The attempt burns before the first original await. */
  public async bindForwardWriterObservedClocks(origin:CurrentFootprintForwardWriterClockRpcOrigin,packet:CurrentFootprintForwardWriterClockRpcObservation):Promise<void>{
    need(this.#fullOrigin!==null&&this.#token.profile==="private.current-footprint-forward-writer-main-request-origin.v1","FULL_ORIGINAL_CLOCK_ORIGIN");
    need(this.#fullLatePlan!==null&&!this.#latePlanAttempted&&this.#plan===null&&this.#phase==="invocation-consumed","FULL_LATE_PLAN_CONSUMED");this.#begin();this.#latePlanAttempted=true;
    try{requireCurrentFootprintForwardWriterMainRequestClockOrigin(this.#token,origin);await this.#current();
      const plan=await bindCurrentFootprintForwardWriterMainRequestPlan(this.#fullLatePlan,origin,packet);await this.#current();requireCurrentFootprintForwardWriterMainRequestClockOrigin(this.#token,origin);this.#plan=plan;this.#fullBoundClock=origin;this.#fullBoundPacket=packet;
    }catch(error){this.#refuse(error);throw error;}finally{this.#end();}
  }
  public requireForwardWriterMainReservation(origin:CurrentFootprintForwardWriterMainRequestOrigin,reservation:CurrentFootprintForwardWriterMainRequestReservation):void{
    need(this.#fullOrigin!==null&&fullInstances.get(this)===origin&&this.#token===origin&&this.#fullLatePlan===reservation,"FULL_ORIGINAL_RESERVATION");this.#same();
  }
  /** Resolve only this factory's actual frozen bound body. Late-plan maximum
   * placeholders, cloned clock packets and other original runners cannot enter. */
  public async originalForwardWriterBoundPlan(origin:CurrentFootprintForwardWriterMainRequestOrigin,clock:CurrentFootprintForwardWriterClockRpcOrigin,packet:CurrentFootprintForwardWriterClockRpcObservation):Promise<Plan>{
    need(this.#fullOrigin!==null&&origin===this.#token&&fullInstances.get(this)===origin&&this.#plan!==null&&clock===this.#fullBoundClock&&packet===this.#fullBoundPacket,"FULL_ORIGINAL_BOUND_PLAN");
    this.#same();requireCurrentFootprintForwardWriterMainRequestClockOrigin(origin,clock);const plan=this.#plan;
    await requireCurrentFootprintForwardWriterClockRpcObservation(packet,clock);this.#same();requireCurrentFootprintForwardWriterMainRequestClockOrigin(origin,clock);
    need(this.#plan===plan&&this.#fullBoundClock===clock&&this.#fullBoundPacket===packet,"FULL_ORIGINAL_BOUND_PLAN");return plan;
  }
  #originalOrigin():Origin{
    if(this.#token.profile==="private.current-footprint-forward-writer-main-request-origin.v1"){need(this.#fullOrigin!==null,"FULL_ORIGINAL_OWNER");return requireCurrentFootprintForwardWriterMainRequestOrigin(this.#token);}
    if(this.#token.profile==="private.current-footprint-forward-main-request-origin.v2"){return requireCurrentFootprintForwardMainRequestOrigin(this.#token);}
    return requireCurrentFootprintCopyMainRequestOrigin(this.#token);
  }
  #issuedMap():typeof issued{return this.#fullOrigin===null?issued:fullIssued;}
  #heldMap():typeof held{return this.#fullOrigin===null?held:fullHeld;}
  #heldBindings(packet:CurrentFootprintCopyMainRequestHeldFinalPb):CurrentFootprintCopyMainRequestHeldFinalPbBindings{return this.#fullOrigin===null?requireCurrentFootprintCopyMainRequestHeldFinalPb(packet):requireCurrentFootprintForwardWriterMainRequestHeldFinalPb(packet);}
  #same(cleanup = false): void {
    if(this.#fullOrigin!==null){requireFullEngine(this);}else if (this.#forwardOrigin !== null) { requireForwardEngine(this); }
    need(!this.#retired && !this.#generationEnded && this.#originalOrigin() === this.#origin, "ORIGINAL_OWNER");
    requireCurrentFootprintCopyMainRequestSource(this.#origin.qualifiedSource);
    need(cleanup || this.#phase !== "failed" && !this.#cleanupAttempted && !this.#ending, "FAILED");
    need(cleanup || this.#started === 0 || performance.now() - this.#started < LIMIT_MS, "DEADLINE");
  }
  async #current(cleanup = false): Promise<void> {
    this.#same(cleanup);
    await (cleanup ? this.#origin.assertCleanup() : this.#origin.assertOriginal());
    this.#same(cleanup);
  }
  #begin(): void { need(!this.#busy && !this.#ending, "BUSY"); this.#busy = true; const idle = Promise.withResolvers<null>(); this.#idle = idle.promise; this.#resolveIdle = (): void => { idle.resolve(null); }; }
  #end(): void { this.#busy = false; this.#resolveIdle?.(); this.#resolveIdle = null; }
  #refuse(error: unknown): void {
    this.#firstFailure ??= Object.freeze({ code: error instanceof Error ? failures.get(error) ?? "ORIGINAL_CHANNEL_OR_REPLY" : "ORIGINAL_CHANNEL_OR_REPLY",
      phase: this.#phase, normalRequests: this.#normal, cleanupRequests: this.#cleanup, replies: this.#raw.length });
    this.#phase = "failed";
    const allocation=this.#fullOrigin??this.#forwardOrigin;
    if (allocation !== null) {
      try { allocation.fail(error); }
      catch {
        // Revocation cannot mask the original refusal.
      }
    }
  }
  #drain(): void {
    for (let count = 0; count < 32; count += 1) {
      const raw = this.#origin.takeEvent(); if (raw === null) { return; }
      const captured = captureCurrentPcbStringClockReply(raw).value; this.#raw.push(captured);
      const event = eventSchema.parse(captured);
      if (event.method === "Debugger.resumed") {
        const current = this.#resuming; need(current !== null && current.resumeAttempted && !current.resumeObserved, "UNEXPECTED_RESUME");
        current.resumeObserved = true; this.#resuming = null;
      } else {
        const index = this.#pauses.length; const stage = ORDER[index]; const previous = this.#pauses.at(-1); const point = this.#points.find(value => value.stage === stage);
        try {
          need(this.#phase === "invocation-consumed" && stage !== undefined && point !== undefined &&
            (previous === undefined || previous.resumeAttempted && previous.resumeObserved), "UNEXPECTED_PAUSE");
          const decoded = decodeCurrentFootprintCopyMainRequestCollectionPause(event.params, stage, this.#origin.scriptId, point.id);
          this.#pauses.push({ stage, ...decoded, resumeAttempted: false, resumeObserved: false });
        } catch (error) { this.#unknownPause = true; throw error; }
      }
    }
    throw fail("EVENT_BOUND");
  }
  async #send(input: Command, cleanup = false, allocation?: Stage): Promise<unknown> {
    await this.#current(cleanup); this.#drain();
    need(cleanup ? this.#cleanup < REQUESTS.cleanup : this.#normal < REQUESTS.normal, "REQUEST_BOUND");
    const command = validateCurrentFootprintCopyMainRequestCollectCommand(input);
    currentFootprintCopyMainRequestWire(command, 2_147_483_647);
    if (cleanup) { this.#cleanup += 1; } else { this.#normal += 1; }
    if (allocation !== undefined) { this.#allocationUncertain = true; }
    const retain = (reply: unknown): void => {
      const raw = captureCurrentPcbStringClockReply(reply).value; this.#raw.push(raw);
      if (allocation !== undefined) {
        const id = currentFootprintCopyMainRequestAllocatedId(raw);
        if (id !== null && !this.#points.some(value => value.id === id)) { this.#points.push({ stage: allocation, id, removeAttempted: false, removed: false }); this.#allocationUncertain = false; }
        else { this.#allocationUncertain = true; }
      }
    };
    const original=this.#fullOrigin??this.#forwardOrigin;
    const result = original !== null && allocation !== undefined ?
      await original.request(command, cleanup, retain) : await this.#origin.request(command, cleanup);
    const raw = captureCurrentPcbStringClockReply(result).value;
    if (original === null || allocation === undefined) { retain(raw); }
    await this.#current(cleanup); this.#drain(); return raw;
  }
  async #wait(predicate: () => boolean): Promise<void> {
    while (!predicate()) { await this.#current(); this.#drain(); if (predicate()) { return; }
      await this.#origin.pump(false); await this.#current(); this.#drain(); if (!predicate()) { await delay(10); } }
  }
  #properties(objectId: string): Promise<unknown> {
    return this.#send({ phase: "request-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } });
  }
  async #frame(frameId: string, role: keyof typeof EXPRESSIONS): Promise<string> {
    return decodeCurrentFootprintCopyMainRequestArrayCapture(await this.#send({ phase: "request-frame", method: "Debugger.evaluateOnCallFrame", params: {
      callFrameId: frameId, expression: EXPRESSIONS[role], objectGroup: GROUP, silent: true, returnByValue: false,
      generatePreview: false, throwOnSideEffect: true, includeCommandLineAPI: false } }), role === "context" ? 4 : ({ controller: 8, actor: 9, editHead: 1 } as const)[role]);
  }
  async #invocationFrame(frameId: string, role: keyof typeof INVOCATION): Promise<string> {
    return decodeCurrentFootprintCopyMainRequestArrayCapture(await this.#send({ phase: "request-invocation-frame", method: "Debugger.evaluateOnCallFrame", params: {
      callFrameId: frameId, expression: INVOCATION[role], objectGroup: GROUP, silent: true, returnByValue: false,
      generatePreview: false, throwOnSideEffect: true, includeCommandLineAPI: false } }), 3);
  }
  public arm(): Promise<void> { return this.#arm(false); }
  /** Select the held-final-PB schedule before any invocation can be consumed.
   * It adds no command, callback factory, writer or completion authority. */
  public armForCompletion(): Promise<void> { return this.#arm(true); }
  async #arm(holdFinalPb: boolean): Promise<void> {
    const attempts=this.#fullOrigin===null?consumed:fullConsumed;
    need(this.#phase === "ready" && !attempts.has(this.#token), "ARM_CONSUMED"); attempts.add(this.#token); this.#begin(); this.#phase = "arming"; this.#started = performance.now();
    this.#holdFinalPb = holdFinalPb;
    try {
      for (const stage of ORDER) {
        const reply = await this.#send(stage === "driver" ? { phase: "request-driver-arm", method: "Debugger.setBreakpointOnFunctionCall", params: { objectId: this.#origin.driverCallbackObjectId } } :
          currentFootprintCopyMainRequestSourceArm(stage, this.#origin.scriptId), false, stage);
        const id = decodeCurrentFootprintCopyMainRequestAllocation(reply, stage, this.#origin.scriptId);
        need(this.#points.at(-1)?.id === id && this.#points.at(-1)?.stage === stage, "ALLOCATION");
      }
      need(this.#normal === 4 && this.#points.length === 4, "ARM_COUNT"); this.#phase = "armed";
    } catch (error) { this.#refuse(error); throw error; } finally { this.#end(); }
  }
  /** The enclosing original writer calls this after its durable intent and
   * immediately before dispatch. It starts no request and grants no authority. */
  public consumeBeforeInvocation(): void { this.#same(); need(!this.#busy && this.#phase === "armed", "INVOCATION_CONSUMED"); this.#phase = "invocation-consumed"; }
  async #remove(point: Breakpoint): Promise<void> {
    if (point.removed) { return; } need(!point.removeAttempted, "REMOVE_CONSUMED"); point.removeAttempted = true;
    requireCurrentFootprintCopyMainRequestEmpty(await this.#send({ phase: "request-remove", method: "Debugger.removeBreakpoint", params: { breakpointId: point.id } }, true)); point.removed = true;
  }
  async #resume(pause: Pause): Promise<void> {
    need(!pause.resumeAttempted && !pause.resumeObserved && this.#resuming === null, "RESUME_CONSUMED"); pause.resumeAttempted = true; this.#resuming = pause;
    requireCurrentFootprintCopyMainRequestEmpty(await this.#send({ phase: "request-resume", method: "Debugger.resume", params: {} }, true));
    await this.#wait(() => pause.resumeObserved);
  }
  async #capture(pause: Pause): Promise<Actor | null> {
    if (pause.stage === "driver") {
      need(pause.callerFrameId !== null, "DRIVER_STACK"); const selected = await this.#invocationFrame(pause.frameId, "driver"); const caller = await this.#invocationFrame(pause.callerFrameId, "driverCaller");
      this.#invocation = decodeCurrentFootprintCopyMainRequestArrayCapture(await this.#send({ phase: "request-invocation", method: "Runtime.callFunctionOn", params: { ...FLAGS,
        objectId: selected, functionDeclaration: PROGRAMS.invocation, arguments: [{ objectId: this.#origin.retainedArrayObjectId }, { objectId: caller }], returnByValue: false } }), 6); return null;
    }
    if (pause.stage === "context") {
      need(this.#invocation !== null, "INVOCATION_REQUIRED"); const selected = await this.#frame(pause.frameId, "context");
      this.#context = decodeCurrentFootprintCopyMainRequestArrayCapture(await this.#send({ phase: "request-context", method: "Runtime.callFunctionOn", params: { ...FLAGS,
        objectId: selected, functionDeclaration: CALLS.context.program, arguments: [{ objectId: this.#origin.retainedArrayObjectId }], returnByValue: false } }), 6);
      yes.parse(await this.#send({ phase: "request-context-join", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: this.#invocation,
        functionDeclaration: PROGRAMS.contextJoin, arguments: [{ objectId: this.#context }], returnByValue: true } })); return null;
    }
    if (pause.stage === "controller") {
      need(this.#context !== null && this.#plan !== null, "CONTEXT_REQUIRED"); const selected = await this.#frame(pause.frameId, "controller");
      this.#controller = decodeCurrentFootprintCopyMainRequestArrayCapture(await this.#send({ phase: "request-controller", method: "Runtime.callFunctionOn", params: { ...FLAGS,
        objectId: selected, functionDeclaration: CALLS.controller.program, arguments: [{ objectId: this.#context }, { value: this.#plan }], returnByValue: false } }), 12);
      const fn = decodeCurrentFootprintCopyMainRequestArrayMember(await this.#properties(this.#controller), 12, 8, "editHead");
      decodeCurrentFootprintCopyMainRequestCollectedFunction(await this.#properties(fn), "editHead", this.#origin.scriptId); return null;
    }
    need(this.#controller !== null && pause.callerFrameId !== null, "CONTROLLER_REQUIRED");
    const selected = await this.#frame(pause.frameId, "editHead"); const caller = await this.#frame(pause.callerFrameId, "actor");
    this.#actorPacket = decodeCurrentFootprintCopyMainRequestArrayCapture(await this.#send({ phase: "request-actor", method: "Runtime.callFunctionOn", params: { ...FLAGS,
      objectId: selected, functionDeclaration: CALLS.actor.program, arguments: [{ objectId: caller }, { objectId: this.#controller }], returnByValue: false } }), 10);
    const promise = decodeCurrentFootprintCopyMainRequestArrayMember(await this.#properties(this.#actorPacket), 10, 6, "promise");
    const sqlOwner = decodeCurrentFootprintCopyMainRequestPromise(await this.#properties(promise));
    const sql = decodeCurrentFootprintCopyMainRequestArrayCapture(await this.#send({ phase: "request-sql", method: "Runtime.callFunctionOn", params: { ...FLAGS,
      objectId: this.#actorPacket, functionDeclaration: CALLS.sql.program, arguments: [{ objectId: sqlOwner }], returnByValue: false } }), 7);
    this.#sqlPacket = sql;
    const query = decodeCurrentFootprintCopyMainRequestArrayMember(await this.#properties(sql), 7, 6, "sqlQueryOne");
    decodeCurrentFootprintCopyMainRequestCollectedFunction(await this.#properties(query), "sqlQueryOne", this.#origin.scriptId);
    return decodeCurrentFootprintCopyMainRequestValue(await this.#send({ phase: "request-value", method: "Runtime.callFunctionOn", params: { ...FLAGS,
      objectId: this.#actorPacket, functionDeclaration: CALLS.value.program, arguments: [], returnByValue: true } }));
  }
  public async collect(): Promise<CurrentFootprintCopyMainRequestObservation> {
    need(!this.#holdFinalPb, "COMPLETION_SCHEDULE_REQUIRED");
    const result = await this.#collect(false);
    need(result === this.#packet && this.#packet !== null, "ORIGINAL_PACKET"); return this.#packet;
  }
  public async collectToHeldFinalPb(): Promise<CurrentFootprintCopyMainRequestHeldFinalPb> {
    need(this.#holdFinalPb, "COMPLETION_NOT_PREPARED");
    const result = await this.#collect(true);
    need(result === this.#heldPacket && this.#heldPacket !== null, "ORIGINAL_HELD_PACKET"); return this.#heldPacket;
  }
  async #collect(holdFinalPb: boolean): Promise<CurrentFootprintCopyMainRequestObservation | CurrentFootprintCopyMainRequestHeldFinalPb> {
    need(this.#plan !== null, "LATE_PLAN_REQUIRED");
    need(this.#phase === "invocation-consumed" && this.#packet === null && this.#heldPacket === null, "COLLECT_CONSUMED"); this.#begin();
    try {
      let actor: Actor | null = null;
      for (const [index, stage] of ORDER.entries()) {
        await this.#wait(() => this.#pauses[index] !== undefined); const pause = this.#pauses[index], point = this.#points[index];
        need(pause?.stage === stage && point?.stage === stage, "PAUSE_ORDER"); actor = await this.#capture(pause) ?? actor;
        await this.#remove(point);
        if (holdFinalPb && stage === "editHead") {
          need(actor !== null && this.#normal === REQUESTS.normal && this.#cleanup === REQUESTS.cleanup - 2 &&
            !this.#allocationUncertain && !this.#unknownPause && this.#points.every(value => value.removed) &&
            this.#pauses.slice(0, -1).every(value => value.resumeObserved) && !pause.resumeAttempted && !pause.resumeObserved &&
            this.#controller !== null && this.#actorPacket !== null && this.#sqlPacket !== null && this.#plan !== null, "HELD_INCOMPLETE");
          this.#heldPacket = Object.freeze({ profile: "private.current-footprint-copy-main-request-held-final-pb.v1",
            originalRequestAndSqlOwnerJoined: true, originalFinalPbStillHeld: true, allAllocatedRequestBreakpointsRemoved: true,
            nativeSqlCompletionVerified: false, executionAuthorized: false });
          const packet = this.#heldPacket;
          if (this.#fullOrigin !== null) {
            need(this.#token.profile === "private.current-footprint-forward-writer-main-request-origin.v1", "FULL_ORIGINAL_CONTEXT");
            fullHeldContexts.set(packet, Object.freeze({ runner: this, origin: this.#token, plan: this.#plan, actor }));
          }
          const bindings = Object.freeze({ scriptId: this.#origin.scriptId, finalPbFrameId: pause.frameId,
            retainedArrayObjectId: this.#origin.retainedArrayObjectId, controllerObjectId: this.#controller,
            actorObjectId: this.#actorPacket, sqlObjectId: this.#sqlPacket, plan: this.#plan, qualifiedSource: this.#origin.qualifiedSource,
            assertOriginal: async (): Promise<void> => { this.#assertHeld(packet); await this.#current(); this.#assertHeld(packet); } });
          this.#heldMap().set(packet, Object.freeze({ owner: this, read: (): CurrentFootprintCopyMainRequestHeldFinalPbBindings => {
            this.#assertHeld(packet); return bindings;
          } }));
          this.#phase = "held-final-pb"; return packet;
        }
        await this.#resume(pause); await this.#current();
      }
      need(actor !== null && this.#normal === REQUESTS.normal && this.#cleanup === REQUESTS.cleanup - 1 &&
        !this.#allocationUncertain && !this.#unknownPause && this.#points.every(value => value.removed) && this.#pauses.every(value => value.resumeObserved), "INCOMPLETE");
      this.#packet = freezeDeep({ profile: "private.current-footprint-copy-main-request-observation.v1", actualOriginalDriverInvocationAndContextJoined: true,
        actualOriginalControllerAndL3CallerJoined: true, actualPbArgumentAndProjectUserRowJoined: true, originalFulfilledPromiseResultAndSqlOwnerJoined: true,
        actualBackendActor: actor, allFourPausesResumed: true, allAllocatedBreakpointsRemoved: true, temporaryObjectGroupReleased: false,
        actualDocumentClockRpcJoinsObserved: false, nativePublicationCompletionVerified: false, nativeSqlCompletionVerified: false, originalGenerationClosed: false,
        savedResultVerified: false, executionAuthorized: false }); this.#issuedMap().set(this.#packet, this); this.#phase = "collected"; return this.#packet;
    } catch (error) { this.#refuse(error); throw error; } finally { this.#end(); }
  }
  /** Getter for the exact once-issued held token. No JSON, copied handle or
   * callback may create a replacement. Completion transport remains separate. */
  public heldFinalPbBindings(packet: CurrentFootprintCopyMainRequestHeldFinalPb): CurrentFootprintCopyMainRequestHeldFinalPbBindings {
    this.#assertHeld(packet); return this.#heldBindings(packet);
  }
  /** The genuine original scheduler consumes this exact held lease atomically.
   * No await or native resume occurs here. Old getters and cleanup owners lose
   * their authority before the completion origin can issue its first command. */
  public transferHeldFinalPb(packet: CurrentFootprintCopyMainRequestHeldFinalPb,
    originalOrigin: CurrentFootprintCopyMainRequestOrigin): CurrentFootprintCopyMainRequestHeldFinalPbBindings {
    need(originalOrigin === this.#token, "ORIGINAL_TRANSFER_ORIGIN");
    requireCurrentFootprintCopyMainRequestOrigin(originalOrigin); return this.#transferHeld(packet, originalOrigin);
  }
  public transferForwardHeldFinalPb(packet: CurrentFootprintCopyMainRequestHeldFinalPb,
    originalOrigin: CurrentFootprintForwardMainRequestOrigin): CurrentFootprintCopyMainRequestHeldFinalPbBindings {
    requireCurrentFootprintForwardMainRequestOrigin(originalOrigin); return this.#transferHeld(packet, originalOrigin);
  }
  public transferForwardWriterHeldFinalPb(packet:CurrentFootprintForwardWriterMainRequestHeldFinalPb,origin:CurrentFootprintForwardWriterMainRequestOrigin):CurrentFootprintForwardWriterMainRequestHeldFinalPbBindings{
    need(this.#fullOrigin!==null,"FULL_ORIGINAL_TRANSFER");requireCurrentFootprintForwardWriterMainRequestOrigin(origin);return this.#transferHeld(packet,origin);
  }
  #transferHeld(packet: CurrentFootprintCopyMainRequestHeldFinalPb, originalOrigin: RequestOrigin): CurrentFootprintCopyMainRequestHeldFinalPbBindings {
    need(originalOrigin === this.#token, "ORIGINAL_TRANSFER_ORIGIN"); this.#assertHeld(packet);
    const bindings = this.#heldBindings(packet);
    this.#phase = "completion-transferred"; this.#heldMap().delete(packet); return bindings;
  }
  #assertHeld(packet: CurrentFootprintCopyMainRequestHeldFinalPb): void {
    this.#same(); const pause = this.#pauses.at(-1);
    need(!this.#busy && this.#phase === "held-final-pb" && packet === this.#heldPacket && this.#heldMap().get(packet)?.owner === this &&
      pause?.stage === "editHead" && !pause.resumeAttempted && !pause.resumeObserved && this.#controller !== null &&
      this.#actorPacket !== null && this.#sqlPacket !== null && this.#points.every(value => value.removed), "ORIGINAL_HELD_PACKET");
  }
  public async requireOriginal(packet: CurrentFootprintCopyMainRequestObservation): Promise<void> {
    need(!this.#busy && this.#phase === "collected" && packet === this.#packet && this.#issuedMap().get(packet) === this, "ORIGINAL_PACKET");
    await this.#current(); need(packet === this.#packet && this.#issuedMap().get(packet) === this && !this.#cleanupAttempted, "ORIGINAL_PACKET");
  }
  public async cleanup(): Promise<void> {
    need(this.#phase !== "completion-transferred", "COMPLETION_OWNS_GENERATION");
    need(!this.#cleanupAttempted, "CLEANUP_CONSUMED"); this.#begin(); this.#cleanupAttempted = true;
    try {
      const errors: unknown[] = [];
      const allocation=this.#fullOrigin??this.#forwardOrigin;if (allocation !== null) { try { await allocation.settleAllocation(); } catch (error) { errors.push(error); } }
      for (const point of this.#points) { try { await this.#remove(point); } catch (error) { errors.push(error); } }
      // A refused capture may be paused immediately before native SQL. Cleanup
      // Never resumes it to make a failed observation complete.
      need(errors.length === 0 && !this.#allocationUncertain && !this.#unknownPause && this.#resuming === null &&
        this.#pauses.every(value => value.resumeObserved), "GENERATION_CLOSURE_REQUIRED");
      need(!this.#groupAttempted, "RELEASE_CONSUMED"); this.#groupAttempted = true;
      requireCurrentFootprintCopyMainRequestEmpty(await this.#send({ phase: "request-release", method: "Runtime.releaseObjectGroup", params: { objectGroup: GROUP } }, true));
      this.#groupReleased = true; await this.#origin.retire(); this.#retired = true;
    } catch (error) { this.#refuse(error); throw error; } finally { this.#end(); }
  }
  public async observeOriginalGenerationEnded(): Promise<void> {
    need(this.#phase !== "completion-transferred", "COMPLETION_OWNS_GENERATION");
    need(!this.#ending && !this.#retired && (!this.#generationEnded || !this.#retirementSettlementAttempted), "GENERATION_CONSUMED");
    if (this.#generationEnded) { this.#retirementSettlementAttempted = true; }
    this.#ending = true; const idle = this.#idle;
    try {
      await this.#origin.assertOriginalGenerationExited(); this.#generationEnded = true; this.#refuse(fail("ORIGINAL_GENERATION_ENDED"));
      await idle; need(!this.#busy && this.#idle === idle, "ORIGINAL_OPERATION_UNSETTLED");
      if (!this.#retired) { await this.#origin.retire(); this.#retired = true; }
    } finally { this.#ending = false; }
  }
  public diagnostics(): Readonly<{ phase: Phase; normalRequests: number; cleanupRequests: number; replies: number; pauses: number;
    unknownPause: boolean; uncertainAllocation: boolean; groupReleased: boolean; retired: boolean; originalGenerationEnded: boolean;
    firstFailure: CollectionFailure | null }> {
    return Object.freeze({ phase: this.#phase, normalRequests: this.#normal, cleanupRequests: this.#cleanup, replies: this.#raw.length, pauses: this.#pauses.length,
      unknownPause: this.#unknownPause, uncertainAllocation: this.#allocationUncertain, groupReleased: this.#groupReleased, retired: this.#retired,
      originalGenerationEnded: this.#generationEnded, firstFailure: this.#firstFailure });
  }
}
export function requireCurrentFootprintCopyMainRequestHeldFinalPb(packet: CurrentFootprintCopyMainRequestHeldFinalPb): CurrentFootprintCopyMainRequestHeldFinalPbBindings {
  const original = held.get(packet); need(original !== undefined, "ORIGINAL_HELD_PACKET"); return original.read();
}
export function transferCurrentFootprintCopyMainRequestHeldFinalPb(packet: CurrentFootprintCopyMainRequestHeldFinalPb,
  origin: CurrentFootprintCopyMainRequestOrigin): CurrentFootprintCopyMainRequestHeldFinalPbBindings {
  const original = held.get(packet); need(original !== undefined, "ORIGINAL_HELD_PACKET");
  return original.owner.transferHeldFinalPb(packet, origin);
}

/** Construct the shared actual request collector only from the new original
 * v2 registry. The module-private selector is never supplied by a caller. */
export function createCurrentFootprintForwardMainRequestRunner(origin: CurrentFootprintForwardMainRequestOrigin,
  plan: unknown): CurrentFootprintCopyMainRequestRunner {
  requireCurrentFootprintForwardMainRequestOrigin(origin);
  requireForwardEnginePrototype();
  need(!forwardEngines.has(origin), "FORWARD_ENGINE_CONSUMED"); forwardEngines.add(origin);
  const runner = new CurrentFootprintCopyMainRequestRunner(FORWARD_INTERNAL, origin, plan); Object.freeze(runner); return runner;
}
// oxlint-disable-next-line typescript/unbound-method -- The exact private-field collector owns this original synchronous transfer.
const originalForwardHeldTransfer = CurrentFootprintCopyMainRequestRunner.prototype.transferForwardHeldFinalPb;
export function transferCurrentFootprintForwardMainRequestHeldFinalPb(packet: CurrentFootprintCopyMainRequestHeldFinalPb,
  origin: CurrentFootprintForwardMainRequestOrigin): CurrentFootprintCopyMainRequestHeldFinalPbBindings {
  requireCurrentFootprintForwardMainRequestOrigin(origin);
  const original = held.get(packet); need(original !== undefined, "ORIGINAL_HELD_PACKET");
  need(CurrentFootprintCopyMainRequestRunner.prototype.transferForwardHeldFinalPb === originalForwardHeldTransfer, "ORIGINAL_TRANSFER_METHOD");
  return originalForwardHeldTransfer.call(original.owner, packet, origin);
}

/** A full reservation and original full capability choose this private path.
 * Public constructor arguments and v2/Combined tokens cannot select it. */
export function createCurrentFootprintForwardWriterMainRequestRunner(origin:CurrentFootprintForwardWriterMainRequestOrigin,plan:unknown):CurrentFootprintCopyMainRequestRunner{
  requireCurrentFootprintForwardWriterMainRequestOrigin(origin);requireForwardEnginePrototype();need(!fullEngines.has(origin),"FULL_ENGINE_CONSUMED");fullEngines.add(origin);
  const runner=new CurrentFootprintCopyMainRequestRunner(FULL_INTERNAL,origin,plan);fullInstances.set(runner,origin);Object.freeze(runner);return runner;
}
export function requireCurrentFootprintForwardWriterMainRequestHeldFinalPb(packet:CurrentFootprintForwardWriterMainRequestHeldFinalPb):CurrentFootprintForwardWriterMainRequestHeldFinalPbBindings{
 const original=fullHeld.get(packet);need(original!==undefined,"FULL_ORIGINAL_HELD_PACKET");return original.read();
}
// oxlint-disable-next-line typescript/unbound-method -- Captured full private fields bind the exact original reservation, including after its late body slot is consumed.
const originalFullReservation=CurrentFootprintCopyMainRequestRunner.prototype.requireForwardWriterMainReservation;
export function requireOriginalCurrentFootprintForwardWriterMainRequestReservation(runner:CurrentFootprintCopyMainRequestRunner,origin:CurrentFootprintForwardWriterMainRequestOrigin,reservation:CurrentFootprintForwardWriterMainRequestReservation):void{
 need(fullInstances.get(runner)===origin,"FULL_ORIGINAL_ENGINE");requireFullEngine(runner);originalFullReservation.call(runner,origin,reservation);
}
// oxlint-disable-next-line typescript/unbound-method -- This captured private-field method reads only the actual full factory instance and its original bound clock packet.
const originalFullBoundPlan=CurrentFootprintCopyMainRequestRunner.prototype.originalForwardWriterBoundPlan;
export function requireOriginalCurrentFootprintForwardWriterBoundMainRequestPlan(runner:CurrentFootprintCopyMainRequestRunner,origin:CurrentFootprintForwardWriterMainRequestOrigin,clock:CurrentFootprintForwardWriterClockRpcOrigin,packet:CurrentFootprintForwardWriterClockRpcObservation):Promise<Plan>{
 need(fullInstances.get(runner)===origin,"FULL_ORIGINAL_ENGINE");requireFullEngine(runner);return originalFullBoundPlan.call(runner,origin,clock,packet);
}
// oxlint-disable-next-line typescript/unbound-method -- Capture only the actual private-field full collector's synchronous ownership transfer.
const originalFullHeldTransfer=CurrentFootprintCopyMainRequestRunner.prototype.transferForwardWriterHeldFinalPb;
export function transferCurrentFootprintForwardWriterMainRequestHeldFinalPb(packet:CurrentFootprintForwardWriterMainRequestHeldFinalPb,origin:CurrentFootprintForwardWriterMainRequestOrigin):CurrentFootprintForwardWriterMainRequestHeldFinalPbBindings{
 requireCurrentFootprintForwardWriterMainRequestOrigin(origin);const original=fullHeld.get(packet);need(original!==undefined,"FULL_ORIGINAL_HELD_PACKET");need(CurrentFootprintCopyMainRequestRunner.prototype.transferForwardWriterHeldFinalPb===originalFullHeldTransfer,"FULL_ORIGINAL_TRANSFER_METHOD");return originalFullHeldTransfer.call(original.owner,packet,origin);
}
function requireFullEngine(runner:CurrentFootprintCopyMainRequestRunner):void{requireForwardEnginePrototype();need(Object.getPrototypeOf(runner)===CurrentFootprintCopyMainRequestRunner.prototype&&Reflect.ownKeys(runner).length===0,"FULL_ORIGINAL_ENGINE");}

const forwardEnginePrototypes = captureCurrentFootprintForwardExecutionPrototypes(CurrentFootprintCopyMainRequestRunner.prototype);
function requireForwardEnginePrototype(): void { requireCurrentFootprintForwardExecutionPrototypes(forwardEnginePrototypes); }
function requireForwardEngine(runner: CurrentFootprintCopyMainRequestRunner): void {
  requireForwardEnginePrototype();
  need(Object.getPrototypeOf(runner) === CurrentFootprintCopyMainRequestRunner.prototype && Reflect.ownKeys(runner).length === 0, "FORWARD_ORIGINAL_ENGINE");
}

/** Factual original actor/body only. The retained full packet survives its
 * one-way completion transfer; no old held lease or continuation is revived. */
export function requireOriginalCurrentFootprintForwardWriterHeldContext(packet: CurrentFootprintForwardWriterMainRequestHeldFinalPb): Readonly<{ origin: CurrentFootprintForwardWriterMainRequestOrigin; plan: Plan; actor: Actor }> {
  const context = fullHeldContexts.get(packet);
  need(context !== undefined && fullInstances.get(context.runner) === context.origin, "FULL_ORIGINAL_HELD_CONTEXT");
  requireForwardEngine(context.runner);
  return context;
}
