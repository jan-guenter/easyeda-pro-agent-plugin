/** Initial original seven-record main request observation. The global SQL driver pause
 * is retained, with no resume until a separate per-call grant exists. */
/* oxlint-disable import/max-dependencies -- Keep genuine native origin/body authority separate from the immutable source selectors and independent pause/reply decoders. */
import { requireOriginalCurrentSchematicRelevanceDisplaySaveMainOrigin } from "./current-pcb-diagnostic-owner.ts";
import type { CurrentSchematicRelevanceDisplayWriteOwner } from "./current-schematic-relevance-display-write-owner.ts";
import type { GeneratedSchematicRelevanceDisplayNativeArguments } from "./generated-schematic-relevance-display-source.ts";
import type { CurrentSchematicRelevanceDisplaySaveMainBindings, CurrentSchematicRelevanceDisplaySaveMainOrigin } from "./current-schematic-relevance-display-save-main-origin.ts";
import { validateCurrentPcbViaMainCommand } from "./current-pcb-via-main-protocol.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_COLLECTION_SITES as SITES, decodeCurrentFootprintCopyMainRequestAllocation as decodeAllocation,
  decodeCurrentFootprintCopyMainRequestArrayCapture as decodeArray, decodeCurrentFootprintCopyMainRequestCollectedFunction as decodeFunction,
  decodeCurrentFootprintCopyMainRequestArrayMember as decodeMember, decodeCurrentFootprintCopyMainRequestCollectionPause as decodePause } from "./current-footprint-copy-main-request-protocol.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_INVOCATION_EXPRESSIONS as EXPRESSIONS, CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_INVOCATION_PROGRAMS as PROGRAMS } from "./current-footprint-copy-main-request-collect-programs.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_FLAGS as FLAGS, decodeCurrentFootprintCopyMainRequestPromise as decodePromise, decodeCurrentFootprintCopyMainRequestValue as decodeValue } from "./current-footprint-copy-main-request-contract.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_GROUP as GROUP, CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_CALLS as SOURCE_CALLS, CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_EXPRESSIONS as SOURCE_FRAMES } from "./current-footprint-copy-main-request-programs.ts";
import { requireCurrentFootprintCopyMainRequestSource } from "./current-footprint-copy-main-request-source.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { requireOriginalGeneratedSchematicRelevanceDisplaySaveData } from "./generated-schematic-relevance-display-native-save.ts";
import type { GeneratedSchematicRelevanceDisplayNativeSaveData } from "./generated-schematic-relevance-display-native-save.ts";
import { z } from "zod";
import type { CurrentSelectedFileMainRequestObservation } from "./current-selected-file-main-request-reader.ts";

export interface CurrentSchematicRelevanceDisplayHeldMainDriver {
  readonly schema: "private.current-schematic-relevance-display-held-main-driver.v2"; readonly originalDriverInvocationRetained: true;
  readonly originalSaveAttemptRetained: true; readonly originalSaveProjectionRetained: true;
  readonly originalFetchPostRouteVerified: true;
  readonly actualRequestBodyJoined: false; readonly nativeMutationResumed: false; readonly selectedSqlAuthorized: false;
}
const packets = new WeakMap<CurrentSchematicRelevanceDisplayHeldMainDriver, Readonly<{ observer: CurrentSchematicRelevanceDisplayMainRequestObserver; invocation: string; request: CurrentSelectedFileMainRequestObservation }>>();
export interface CurrentSchematicRelevanceDisplayHeldMainContext {
  readonly schema: "private.current-schematic-relevance-display-held-main-context.v1";
  readonly originalDriverContextJoined: true; readonly actualRequestBodyJoined: false; readonly selectedSqlAuthorized: false;
}
const contexts = new WeakMap<CurrentSchematicRelevanceDisplayHeldMainContext, Readonly<{ observer: CurrentSchematicRelevanceDisplayMainRequestObserver; context: string }>>();
export interface CurrentSchematicRelevanceDisplayHeldMainController {
  readonly schema: "private.current-schematic-relevance-display-held-main-controller.v1";
  readonly originalDriverContextJoined: true; readonly actualRequestBodyJoined: true; readonly mainActorClockVerified: false; readonly selectedSqlAuthorized: false;
}
const controllers = new WeakMap<CurrentSchematicRelevanceDisplayHeldMainController, Readonly<{ observer: CurrentSchematicRelevanceDisplayMainRequestObserver; controller: string }>>();
export interface CurrentSchematicRelevanceDisplayHeldMainActor {
  readonly schema: "private.current-schematic-relevance-display-held-main-actor.v1"; readonly actualRequestBodyJoined: true;
  readonly originalL3ActorAndDateClockJoined: true; readonly originalFulfilledDatabasePromiseJoined: true;
  readonly originalSelectedNativeDatabaseJoined: true; readonly selectedSqlAuthorized: false;
}
const actors = new WeakMap<CurrentSchematicRelevanceDisplayHeldMainActor, Readonly<{ observer: CurrentSchematicRelevanceDisplayMainRequestObserver; owner: CurrentSchematicRelevanceDisplayWriteOwner; plan: GeneratedSchematicRelevanceDisplayNativeArguments; origin: CurrentSchematicRelevanceDisplaySaveMainOrigin; actor: string; sql: string; value: ReturnType<typeof decodeValue> }>>();
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`SCHEMATIC_RELEVANCE_MAIN_OBSERVER_${code}`); } }
export class CurrentSchematicRelevanceDisplayMainRequestObserver {
  readonly #origin: CurrentSchematicRelevanceDisplaySaveMainOrigin; readonly #owner: CurrentSchematicRelevanceDisplayWriteOwner; readonly #plan: GeneratedSchematicRelevanceDisplayNativeArguments; readonly #bindings: CurrentSchematicRelevanceDisplaySaveMainBindings;
  #attempted = false; #armed = false; #busy = false; #failed = false; #packet: CurrentSchematicRelevanceDisplayHeldMainDriver | null = null;
  #projection: GeneratedSchematicRelevanceDisplayNativeSaveData | null = null;
  readonly #points = new Map<"context" | "controller" | "editHead", string>();
  #contextAttempted = false; #context: CurrentSchematicRelevanceDisplayHeldMainContext | null = null;
  #controllerAdvanced = false; #actorAttempted = false; #actor: CurrentSchematicRelevanceDisplayHeldMainActor | null = null;
  #contextAdvanced = false; #controllerAttempted = false; #controller: CurrentSchematicRelevanceDisplayHeldMainController | null = null;
  public constructor(origin: CurrentSchematicRelevanceDisplaySaveMainOrigin, owner: CurrentSchematicRelevanceDisplayWriteOwner, plan: GeneratedSchematicRelevanceDisplayNativeArguments) {
    this.#origin = origin; this.#owner = owner; this.#plan = plan; this.#bindings = requireOriginalCurrentSchematicRelevanceDisplaySaveMainOrigin(origin, owner, plan); Object.freeze(this);
  }
  async #current(observing = false): Promise<void> {
    need(!this.#failed && requireOriginalCurrentSchematicRelevanceDisplaySaveMainOrigin(this.#origin, this.#owner, this.#plan) === this.#bindings, "ORIGINAL");
    requireCurrentFootprintCopyMainRequestSource(this.#bindings.source); await this.#bindings.assertCurrent();
    need(!this.#failed && requireOriginalCurrentSchematicRelevanceDisplaySaveMainOrigin(this.#origin, this.#owner, this.#plan) === this.#bindings, "CHANGED"); if (observing) { this.#bindings.assertSaveAttempt(); }
  }
  async #send(input: unknown, observing = false, cleanup = false): Promise<unknown> {
    await this.#current(observing); const command = validateCurrentPcbViaMainCommand(input);
    const reply = captureCurrentPcbStringClockReply(await this.#bindings.request(command, cleanup)).value; await this.#current(observing); return reply;
  }
  async #arm(role: "context" | "controller" | "editHead"): Promise<void> {
    need(!this.#points.has(role), "POINT_CONSUMED"); const site = SITES[role]; const raw = await this.#send({ phase: "via-main-request-site-arm", method: "Debugger.setBreakpoint", params: {
      location: { scriptId: this.#bindings.scriptId, lineNumber: site.lineNumber, columnNumber: site.columnNumber } } });
    const point = decodeAllocation(raw, role, this.#bindings.scriptId); need(![...this.#points.values()].includes(point), "POINT_ALIAS"); this.#points.set(role, point);
  }
  public async arm(): Promise<void> {
    need(!this.#armed && !this.#busy, "ARM_CONSUMED"); this.#armed = true; this.#busy = true;
    try { for (const role of ["controller", "editHead"] as const) { await this.#arm(role); } }
    catch (error) { this.#failed = true; this.#bindings.fail(); throw error; } finally { this.#busy = false; }
  }
  async #nextPoint(role: "context" | "controller" | "editHead"): Promise<ReturnType<typeof decodePause>> {
    for (let index = 0; index < 64; index += 1) {
      const raw = captureCurrentPcbStringClockReply(await this.#bindings.nextEvent()).value;
      const event = z.strictObject({ method: z.literal("Debugger.paused"), params: z.unknown() }).parse(raw); await this.#current(true);
      const paused = z.looseObject({ hitBreakpoints: z.tuple([z.string()]) }).parse(event.params);
      if (paused.hitBreakpoints[0] === this.#bindings.persistentDriverBreakpointId) {
        decodePause(event.params, "driver", this.#bindings.scriptId, this.#bindings.persistentDriverBreakpointId);
        const request = await this.#bindings.observeRequest(); this.#bindings.requireOriginalRequest(request);
        need(request.method === "GET" || request.method === "HEAD", "FOREIGN_WRITE_REQUEST"); await this.#bindings.continueReadonlyRequest(request);
      } else { const point = this.#points.get(role); need(point !== undefined, "SOURCE_POINT"); return decodePause(event.params, role, this.#bindings.scriptId, point); }
    }
    throw new Error("SCHEMATIC_RELEVANCE_MAIN_OBSERVER_READ_REQUEST_BOUND");
  }
  async #frame(callFrameId: string, expression: string): Promise<string> {
    return decodeArray(await this.#send({ phase: "via-main-request-invocation-frame", method: "Debugger.evaluateOnCallFrame", params: { callFrameId, expression, objectGroup: GROUP,
      silent: true, returnByValue: false, generatePreview: false, throwOnSideEffect: true, includeCommandLineAPI: false } }, true), 3);
  }
  public async bindOriginalBody(projection: GeneratedSchematicRelevanceDisplayNativeSaveData): Promise<void> {
    need(this.#armed && !this.#busy && this.#projection === null && !this.#attempted, "BODY_BIND_CONSUMED"); this.#busy = true;
    try { requireOriginalGeneratedSchematicRelevanceDisplaySaveData(projection, this.#owner, this.#plan); await this.#current(true);
      const delta = await this.#owner.bindSchematicRelevanceDisplaySaveMainData(this.#plan, this.#origin, projection);
      need(delta === projection.delta, "NATIVE_BODY_PROJECTION");
      requireOriginalGeneratedSchematicRelevanceDisplaySaveData(projection, this.#owner, this.#plan); await this.#current(true); this.#projection = projection;
    } catch (error) { this.#failed = true; this.#bindings.fail(); throw error; } finally { this.#busy = false; }
  }
  /** This captures only the physical original invocation/caller. It does not
   * read the request body, claim causality by matching JSON or release SQL. */
  public async captureDriver(projection: GeneratedSchematicRelevanceDisplayNativeSaveData): Promise<CurrentSchematicRelevanceDisplayHeldMainDriver> {
    need(this.#armed && !this.#busy && !this.#attempted && this.#projection === projection, "DRIVER_CONSUMED"); this.#attempted = true; this.#busy = true;
    try {
      requireOriginalGeneratedSchematicRelevanceDisplaySaveData(projection, this.#owner, this.#plan); await this.#current(true);
      let selected: Readonly<{ pause: ReturnType<typeof decodePause>; request: CurrentSelectedFileMainRequestObservation }> | null = null;
      for (let index = 0; index < 64; index += 1) {
        const raw = captureCurrentPcbStringClockReply(await this.#bindings.nextEvent()).value;
        const event = z.strictObject({ method: z.literal("Debugger.paused"), params: z.unknown() }).parse(raw); await this.#current(true);
        const pause = decodePause(event.params, "driver", this.#bindings.scriptId, this.#bindings.persistentDriverBreakpointId);
        const request = await this.#bindings.observeRequest(); this.#bindings.requireOriginalRequest(request); await this.#current(true);
        if (request.method === "GET" || request.method === "HEAD") { await this.#bindings.continueReadonlyRequest(request); await this.#current(true); }
        else {
          need(request.mode === "fetch" && request.method === "POST" && request.pureQuery === "" && request.pathHeader === this.#plan.target.projectUuid &&
            request.pureUrl === `/api/v4/projects/${this.#plan.target.projectUuid}/branches/${this.#plan.target.branchUuid}/histories`, "ORIGINAL_POST_ROUTE");
          selected = Object.freeze({ pause, request }); break;
        }
      }
      need(selected !== null, "DRIVER_REQUEST_BOUND"); await this.#arm("context"); const { pause, request } = selected; need(pause.callerFrameId !== null, "DRIVER_CALLER");
      const top = await this.#frame(pause.frameId, EXPRESSIONS.driver); const caller = await this.#frame(pause.callerFrameId, EXPRESSIONS.driverCaller);
      const invocation = decodeArray(await this.#send({ phase: "via-main-request-invocation", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: top,
        functionDeclaration: PROGRAMS.invocation, arguments: [{ objectId: this.#bindings.constructionObjectId }, { objectId: caller }], returnByValue: false } }, true), 6);
      requireOriginalGeneratedSchematicRelevanceDisplaySaveData(projection, this.#owner, this.#plan); await this.#current(true);
      this.#bindings.requireOriginalRequest(request);
      const packet: CurrentSchematicRelevanceDisplayHeldMainDriver = Object.freeze({ schema: "private.current-schematic-relevance-display-held-main-driver.v2", originalDriverInvocationRetained: true,
        originalSaveAttemptRetained: true, originalSaveProjectionRetained: true, originalFetchPostRouteVerified: true, actualRequestBodyJoined: false, nativeMutationResumed: false, selectedSqlAuthorized: false });
      this.#packet = packet; packets.set(packet, Object.freeze({ observer: this, invocation, request })); return packet;
    } catch (error) { this.#failed = true; this.#bindings.fail(); throw error; } finally { this.#busy = false; }
  }
  public async requireOriginal(packet: CurrentSchematicRelevanceDisplayHeldMainDriver): Promise<void> {
    const original = packets.get(packet); need(this.#packet === packet && original?.observer === this, "ORIGINAL_PACKET");
    this.#bindings.requireOriginalRequest(original.request); await this.#current(true);
  }
  /** Advance only the actual selected history driver. The native sender also
   * requires the operation's private body and original pending one-Save slot.
   * The new context stays paused before routing or design SQL. */
  public async continueToContext(packet: CurrentSchematicRelevanceDisplayHeldMainDriver): Promise<CurrentSchematicRelevanceDisplayHeldMainContext> {
    need(!this.#busy && !this.#contextAttempted, "CONTEXT_CONSUMED"); this.#contextAttempted = true; this.#busy = true;
    try {
      await this.requireOriginal(packet); const original = packets.get(packet); need(original !== undefined, "ORIGINAL_PACKET");
      await this.#bindings.continuePlannedDriver(original.request); await this.#current(true);
      const pause = await this.#nextPoint("context");
      const frame = decodeArray(await this.#send({ phase: "via-main-request-frame", method: "Debugger.evaluateOnCallFrame", params: { callFrameId: pause.frameId,
        expression: SOURCE_FRAMES.context, objectGroup: GROUP, silent: true, returnByValue: false, generatePreview: false, throwOnSideEffect: true, includeCommandLineAPI: false } }, true), 4);
      const context = decodeArray(await this.#send({ phase: "via-main-request-context", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: frame,
        functionDeclaration: SOURCE_CALLS.context.program, arguments: [{ objectId: this.#bindings.constructionObjectId }], returnByValue: false } }, true), 6);
      z.strictObject({ result: z.strictObject({ type: z.literal("boolean"), value: z.literal(true) }) }).parse(await this.#send({ phase: "via-main-request-context-join", method: "Runtime.callFunctionOn", params: {
        ...FLAGS, objectId: original.invocation, functionDeclaration: PROGRAMS.contextJoin, arguments: [{ objectId: context }], returnByValue: true } }, true));
      const contextPoint = this.#points.get("context"); need(contextPoint !== undefined, "CONTEXT_POINT");
      z.strictObject({}).parse(await this.#send({ phase: "via-main-request-remove", method: "Debugger.removeBreakpoint", params: { breakpointId: contextPoint } }, true, true));
      await this.#current(true); const held: CurrentSchematicRelevanceDisplayHeldMainContext = Object.freeze({ schema: "private.current-schematic-relevance-display-held-main-context.v1", originalDriverContextJoined: true, actualRequestBodyJoined: false, selectedSqlAuthorized: false });
      this.#context = held; contexts.set(held, Object.freeze({ observer: this, context })); return held;
    } catch (error) { this.#failed = true; this.#bindings.fail(); throw error; } finally { this.#busy = false; }
  }
  public async requireOriginalContext(packet: CurrentSchematicRelevanceDisplayHeldMainContext): Promise<void> {
    need(!this.#contextAdvanced && this.#context === packet && contexts.get(packet)?.observer === this, "ORIGINAL_CONTEXT"); await this.#current(true);
  }
  /** The same original context may advance once to the actual history
   * controller. Its fixed program joins the original request body and selected
   * native path before the actor clock or any history mutation is released. */
  public async continueToController(packet: CurrentSchematicRelevanceDisplayHeldMainContext): Promise<CurrentSchematicRelevanceDisplayHeldMainController> {
    need(!this.#busy && !this.#controllerAttempted && this.#projection !== null, "CONTROLLER_CONSUMED"); this.#controllerAttempted = true; this.#busy = true;
    try {
      await this.requireOriginalContext(packet); const original = contexts.get(packet); need(original !== undefined, "ORIGINAL_CONTEXT");
      const delta = requireOriginalGeneratedSchematicRelevanceDisplaySaveData(this.#projection, this.#owner, this.#plan);
      const expected = Object.freeze({ projectUuid: this.#plan.target.projectUuid, branchUuid: this.#plan.target.branchUuid,
        projectKey: this.#plan.target.projectUuid, path: this.#plan.target.rawWindowsPath, dataStr: delta.body });
      this.#contextAdvanced = true; await this.#bindings.continuePlannedContext(); await this.#current(true);
      const pause = await this.#nextPoint("controller");
      const frame = decodeArray(await this.#send({ phase: "via-main-request-frame", method: "Debugger.evaluateOnCallFrame", params: { callFrameId: pause.frameId,
        expression: SOURCE_FRAMES.controller, objectGroup: GROUP, silent: true, returnByValue: false, generatePreview: false, throwOnSideEffect: true, includeCommandLineAPI: false } }, true), 8);
      const controller = decodeArray(await this.#send({ phase: "via-main-request-controller", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: frame,
        functionDeclaration: SOURCE_CALLS.controller.program, arguments: [{ objectId: original.context }, { value: expected }], returnByValue: false } }, true), 12);
      this.#bindings.requireOriginalControllerBody(); requireOriginalGeneratedSchematicRelevanceDisplaySaveData(this.#projection, this.#owner, this.#plan); await this.#current(true);
      const held: CurrentSchematicRelevanceDisplayHeldMainController = Object.freeze({ schema: "private.current-schematic-relevance-display-held-main-controller.v1", originalDriverContextJoined: true,
        actualRequestBodyJoined: true, mainActorClockVerified: false, selectedSqlAuthorized: false });
      this.#controller = held; controllers.set(held, Object.freeze({ observer: this, controller })); return held;
    } catch (error) { this.#failed = true; this.#bindings.fail(); throw error; } finally { this.#busy = false; }
  }
  #properties(objectId: string): Promise<unknown> {
    return this.#send({ phase: "via-main-request-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }, true);
  }
  async #sourceFrame(frameId: string, role: "editHead" | "actor"): Promise<string> {
    return decodeArray(await this.#send({ phase: "via-main-request-frame", method: "Debugger.evaluateOnCallFrame", params: { callFrameId: frameId,
      expression: SOURCE_FRAMES[role], objectGroup: GROUP, silent: true, returnByValue: false, generatePreview: false, throwOnSideEffect: true, includeCommandLineAPI: false } }, true), role === "editHead" ? 1 : 9);
  }
  /** Continue the exact held controller to its original PB/L3 frame. The
   * original Date/now, actor row, fulfilled ctx.db Promise and selected native
   * database are joined while PB remains paused before history SQL. */
  public async continueToActor(packet: CurrentSchematicRelevanceDisplayHeldMainController): Promise<CurrentSchematicRelevanceDisplayHeldMainActor> {
    need(!this.#busy && !this.#actorAttempted, "ACTOR_CONSUMED"); this.#actorAttempted = true; this.#busy = true;
    try {
      await this.requireOriginalController(packet); const original = controllers.get(packet); need(original !== undefined, "ORIGINAL_CONTROLLER");
      const pb = decodeMember(await this.#properties(original.controller), 12, 8, "editHead");
      decodeFunction(await this.#properties(pb), "editHead", this.#bindings.scriptId);
      this.#controllerAdvanced = true; await this.#bindings.continuePlannedController(); await this.#current(true);
      const pause = await this.#nextPoint("editHead"); need(pause.callerFrameId !== null, "ACTOR_CALLER");
      const selected = await this.#sourceFrame(pause.frameId, "editHead"); const caller = await this.#sourceFrame(pause.callerFrameId, "actor");
      const actor = decodeArray(await this.#send({ phase: "via-main-request-actor", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: selected,
        functionDeclaration: SOURCE_CALLS.actor.program, arguments: [{ objectId: caller }, { objectId: original.controller }], returnByValue: false } }, true), 10);
      const promise = decodeMember(await this.#properties(actor), 10, 6, "promise");
      const sqlOwner = decodePromise(await this.#properties(promise));
      const sql = decodeArray(await this.#send({ phase: "via-main-request-sql", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: actor,
        functionDeclaration: SOURCE_CALLS.sql.program, arguments: [{ objectId: sqlOwner }], returnByValue: false } }, true), 7);
      const query = decodeMember(await this.#properties(sql), 7, 6, "sqlQueryOne"); decodeFunction(await this.#properties(query), "sqlQueryOne", this.#bindings.scriptId);
      const value = decodeValue(await this.#send({ phase: "via-main-request-value", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: actor,
        functionDeclaration: SOURCE_CALLS.value.program, arguments: [], returnByValue: true } }, true));
      this.#bindings.requireOriginalActorSql(); await this.#current(true);
      const held: CurrentSchematicRelevanceDisplayHeldMainActor = Object.freeze({ schema: "private.current-schematic-relevance-display-held-main-actor.v1", actualRequestBodyJoined: true,
        originalL3ActorAndDateClockJoined: true, originalFulfilledDatabasePromiseJoined: true, originalSelectedNativeDatabaseJoined: true, selectedSqlAuthorized: false });
      this.#actor = held; actors.set(held, Object.freeze({ observer: this, owner: this.#owner, plan: this.#plan, origin: this.#origin, actor, sql, value })); return held;
    } catch (error) { this.#failed = true; this.#bindings.fail(); throw error; } finally { this.#busy = false; }
  }
  public async requireOriginalActor(packet: CurrentSchematicRelevanceDisplayHeldMainActor): Promise<void> {
    need(this.#actor === packet && actors.get(packet)?.observer === this, "ORIGINAL_ACTOR"); this.#bindings.requireOriginalActorSql(); await this.#current(true);
  }
  public async requireOriginalController(packet: CurrentSchematicRelevanceDisplayHeldMainController): Promise<void> {
    need(!this.#controllerAdvanced && this.#controller === packet && controllers.get(packet)?.observer === this, "ORIGINAL_CONTROLLER"); this.#bindings.requireOriginalControllerBody(); await this.#current(true);
  }
}

/** Exact live actor reference only. Equal JSON and another generation cannot
 * enroll a history continuation against this original held PB. */
export async function requireOriginalCurrentSchematicRelevanceDisplayHeldMainActor(packet: CurrentSchematicRelevanceDisplayHeldMainActor, owner: CurrentSchematicRelevanceDisplayWriteOwner, plan: GeneratedSchematicRelevanceDisplayNativeArguments): Promise<CurrentSchematicRelevanceDisplaySaveMainOrigin> {
  const original = actors.get(packet); need(original !== undefined && original.owner === owner && original.plan === plan, "ORIGINAL_ACTOR_OPERATION");
  await original.observer.requireOriginalActor(packet); return original.origin;
}
