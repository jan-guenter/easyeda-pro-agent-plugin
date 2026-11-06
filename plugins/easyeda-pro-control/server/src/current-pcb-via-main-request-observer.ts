/** Initial original Via main request observation. The global SQL driver pause
 * is retained, with no resume until a separate per-call grant exists. */
/* oxlint-disable import/max-dependencies -- Keep genuine native origin/body authority separate from the immutable source selectors and independent pause/reply decoders. */
import { requireOriginalCurrentPcbViaMainOrigin } from "./current-pcb-diagnostic-owner.ts";
import type { CurrentPcbViaWriteOwner } from "./current-pcb-via-write-owner.ts";
import type { CurrentPcbViaWritePlan } from "./current-pcb-via-write-plan.ts";
import type { CurrentPcbViaMainBindings, CurrentPcbViaMainOrigin } from "./current-pcb-via-main-origin.ts";
import { validateCurrentPcbViaMainCommand } from "./current-pcb-via-main-protocol.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_COLLECTION_SITES as SITES, decodeCurrentFootprintCopyMainRequestArrayCapture as decodeArray,
  decodeCurrentFootprintCopyMainRequestCollectionPause as decodePause } from "./current-footprint-copy-main-request-protocol.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_INVOCATION_EXPRESSIONS as EXPRESSIONS, CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_INVOCATION_PROGRAMS as PROGRAMS } from "./current-footprint-copy-main-request-collect-programs.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_FLAGS as FLAGS } from "./current-footprint-copy-main-request-contract.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_GROUP as GROUP } from "./current-footprint-copy-main-request-programs.ts";
import { requireCurrentFootprintCopyMainRequestSource } from "./current-footprint-copy-main-request-source.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { requireOriginalCurrentPcbViaSaveProjection } from "./current-pcb-via-save-projection.ts";
import type { CurrentPcbViaSaveProjection } from "./current-pcb-via-save-projection.ts";
import { z } from "zod";
import type { CurrentSelectedFileMainRequestObservation } from "./current-selected-file-main-request-reader.ts";

export interface CurrentPcbViaHeldMainDriver {
  readonly schema: "private.current-pcb-via-held-main-driver.v2"; readonly originalDriverInvocationRetained: true;
  readonly originalSaveAttemptRetained: true; readonly originalSaveProjectionRetained: true;
  readonly originalFetchPostRouteVerified: true;
  readonly actualRequestBodyJoined: false; readonly nativeMutationResumed: false; readonly selectedSqlAuthorized: false;
}
const packets = new WeakMap<CurrentPcbViaHeldMainDriver, Readonly<{ observer: CurrentPcbViaMainRequestObserver; invocation: string; request: CurrentSelectedFileMainRequestObservation }>>();
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`PCB_VIA_MAIN_OBSERVER_${code}`); } }
export class CurrentPcbViaMainRequestObserver {
  readonly #origin: CurrentPcbViaMainOrigin; readonly #owner: CurrentPcbViaWriteOwner; readonly #plan: CurrentPcbViaWritePlan; readonly #bindings: CurrentPcbViaMainBindings;
  #attempted = false; #armed = false; #busy = false; #failed = false; #packet: CurrentPcbViaHeldMainDriver | null = null;
  #projection: CurrentPcbViaSaveProjection | null = null;
  public constructor(origin: CurrentPcbViaMainOrigin, owner: CurrentPcbViaWriteOwner, plan: CurrentPcbViaWritePlan) {
    this.#origin = origin; this.#owner = owner; this.#plan = plan; this.#bindings = requireOriginalCurrentPcbViaMainOrigin(origin, owner, plan); Object.freeze(this);
  }
  async #current(observing = false): Promise<void> {
    need(!this.#failed && requireOriginalCurrentPcbViaMainOrigin(this.#origin, this.#owner, this.#plan) === this.#bindings, "ORIGINAL");
    requireCurrentFootprintCopyMainRequestSource(this.#bindings.source); await this.#bindings.assertCurrent();
    need(!this.#failed && requireOriginalCurrentPcbViaMainOrigin(this.#origin, this.#owner, this.#plan) === this.#bindings, "CHANGED"); if (observing) { this.#bindings.assertSaveAttempt(); }
  }
  async #send(input: unknown, observing = false): Promise<unknown> {
    await this.#current(observing); const command = validateCurrentPcbViaMainCommand(input);
    const reply = captureCurrentPcbStringClockReply(await this.#bindings.request(command, false)).value; await this.#current(observing); return reply;
  }
  public async arm(): Promise<void> {
    need(!this.#armed && !this.#busy, "ARM_CONSUMED"); this.#armed = true; this.#busy = true;
    try { for (const role of ["context", "controller", "editHead"] as const) { const site = SITES[role]; await this.#send({ phase: "via-main-request-site-arm", method: "Debugger.setBreakpoint", params: {
      location: { scriptId: this.#bindings.scriptId, lineNumber: site.lineNumber, columnNumber: site.columnNumber } } }); }
    } catch (error) { this.#failed = true; this.#bindings.fail(); throw error; } finally { this.#busy = false; }
  }
  async #frame(callFrameId: string, expression: string): Promise<string> {
    return decodeArray(await this.#send({ phase: "via-main-request-invocation-frame", method: "Debugger.evaluateOnCallFrame", params: { callFrameId, expression, objectGroup: GROUP,
      silent: true, returnByValue: false, generatePreview: false, throwOnSideEffect: true, includeCommandLineAPI: false } }, true), 3);
  }
  public async bindOriginalBody(projection: CurrentPcbViaSaveProjection): Promise<void> {
    need(this.#armed && !this.#busy && this.#projection === null && !this.#attempted, "BODY_BIND_CONSUMED"); this.#busy = true;
    try { await requireOriginalCurrentPcbViaSaveProjection(projection, this.#owner, this.#plan); await this.#current(true);
      const delta = this.#owner.bindViaMainOriginalBody(this.#plan, this.#origin);
      need(delta.bodySha256 === projection.bodySha256 && delta.primitiveId === projection.primitiveId, "NATIVE_BODY_PROJECTION");
      await requireOriginalCurrentPcbViaSaveProjection(projection, this.#owner, this.#plan); await this.#current(true); this.#projection = projection;
    } catch (error) { this.#failed = true; this.#bindings.fail(); throw error; } finally { this.#busy = false; }
  }
  /** This captures only the physical original invocation/caller. It does not
   * read the request body, claim causality by matching JSON or release SQL. */
  public async captureDriver(projection: CurrentPcbViaSaveProjection): Promise<CurrentPcbViaHeldMainDriver> {
    need(this.#armed && !this.#busy && !this.#attempted && this.#projection === projection, "DRIVER_CONSUMED"); this.#attempted = true; this.#busy = true;
    try {
      await requireOriginalCurrentPcbViaSaveProjection(projection, this.#owner, this.#plan); await this.#current(true);
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
      need(selected !== null, "DRIVER_REQUEST_BOUND"); const { pause, request } = selected; need(pause.callerFrameId !== null, "DRIVER_CALLER");
      const top = await this.#frame(pause.frameId, EXPRESSIONS.driver); const caller = await this.#frame(pause.callerFrameId, EXPRESSIONS.driverCaller);
      const invocation = decodeArray(await this.#send({ phase: "via-main-request-invocation", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: top,
        functionDeclaration: PROGRAMS.invocation, arguments: [{ objectId: this.#bindings.constructionObjectId }, { objectId: caller }], returnByValue: false } }, true), 6);
      await requireOriginalCurrentPcbViaSaveProjection(projection, this.#owner, this.#plan); await this.#current(true);
      this.#bindings.requireOriginalRequest(request);
      const packet: CurrentPcbViaHeldMainDriver = Object.freeze({ schema: "private.current-pcb-via-held-main-driver.v2", originalDriverInvocationRetained: true,
        originalSaveAttemptRetained: true, originalSaveProjectionRetained: true, originalFetchPostRouteVerified: true, actualRequestBodyJoined: false, nativeMutationResumed: false, selectedSqlAuthorized: false });
      this.#packet = packet; packets.set(packet, Object.freeze({ observer: this, invocation, request })); return packet;
    } catch (error) { this.#failed = true; this.#bindings.fail(); throw error; } finally { this.#busy = false; }
  }
  public async requireOriginal(packet: CurrentPcbViaHeldMainDriver): Promise<void> {
    const original = packets.get(packet); need(this.#packet === packet && original?.observer === this, "ORIGINAL_PACKET");
    this.#bindings.requireOriginalRequest(original.request); await this.#current(true);
  }
}
