/** The actual Via main cursor's first native SQL slot. The original BEGIN
 * callback and await return remain separate from history/Save completion. */
/* oxlint-disable import/max-dependencies -- Keep original operation/actor custody, fixed programs and finite wire decoding separate. */
import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { requireOriginalCurrentPcbViaMainOrigin } from "./current-pcb-diagnostic-owner.ts";
import type { CurrentPcbViaWriteOwner } from "./current-pcb-via-write-owner.ts";
import type { CurrentPcbViaWritePlan } from "./current-pcb-via-write-plan.ts";
import type { CurrentPcbViaMainBindings, CurrentPcbViaMainOrigin } from "./current-pcb-via-main-origin.ts";
import { requireOriginalCurrentPcbViaHeldMainActor } from "./current-pcb-via-main-request-observer.ts";
import type { CurrentPcbViaHeldMainActor } from "./current-pcb-via-main-request-observer.ts";
import { CURRENT_PCB_VIA_MAIN_BEGIN_CALLBACK_CONDITION as CONDITION, CURRENT_PCB_VIA_MAIN_BEGIN_FLAGS as FLAGS, CURRENT_PCB_VIA_MAIN_BEGIN_RUN_EXPRESSION as RUN_FRAME,
  CURRENT_PCB_VIA_MAIN_BEGIN_SITES as SITES, validateCurrentPcbViaMainBeginCommand } from "./current-pcb-via-main-begin-protocol.ts";
import type { CurrentPcbViaMainBeginCall as Role } from "./current-pcb-via-main-begin-protocol.ts";
import { CURRENT_PCB_VIA_MAIN_BEGIN_CALLS as CALLS } from "./current-pcb-via-main-begin-programs.ts";
import { currentPcbViaMainBeginResultSchema } from "./current-pcb-via-main-begin-custody.ts";
import type { CurrentPcbViaMainBeginResult } from "./current-pcb-via-main-begin-custody.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { decodeCurrentFootprintCopyMainRequestArrayCapture as decodeArray } from "./current-footprint-copy-main-request-protocol.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_GROUP as GROUP } from "./current-footprint-copy-main-request-programs.ts";

export interface CurrentPcbViaHeldBeginResult {
  readonly schema: "private.current-pcb-via-held-begin-result.v1";
  readonly originalNativeCallbackSucceeded: true; readonly originalBeginAwaitCompleted: true;
  readonly historySqlCompleted: false; readonly furtherSelectedSqlAuthorized: false; readonly persistenceVerified: false;
}
const issued = new WeakMap<CurrentPcbViaHeldBeginResult, Readonly<{ observer: CurrentPcbViaMainBeginObserver; owner: CurrentPcbViaWriteOwner; plan: CurrentPcbViaWritePlan; origin: CurrentPcbViaMainOrigin; result: CurrentPcbViaMainBeginResult }>>();
const eventFrame = z.looseObject({ callFrameId: z.string() }), frameList = z.array(eventFrame).min(1);
const eventParams = z.looseObject({ hitBreakpoints: z.tuple([z.string()]), callFrames: frameList });
const eventSchema = z.strictObject({ method: z.literal("Debugger.paused"), params: eventParams });
const resultSchema = z.strictObject({ result: z.strictObject({ type: z.literal("object"), value: currentPcbViaMainBeginResultSchema }) });
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`PCB_VIA_BEGIN_OBSERVER_${code}`); } }
export class CurrentPcbViaMainBeginObserver {
  readonly #origin: CurrentPcbViaMainOrigin; readonly #owner: CurrentPcbViaWriteOwner; readonly #plan: CurrentPcbViaWritePlan; readonly #bindings: CurrentPcbViaMainBindings;
  readonly #points = new Map<Exclude<Role, "run">, string>();
  #armed = false; #busy = false; #attempted = false; #failed = false; #packet: CurrentPcbViaHeldBeginResult | null = null;
  public constructor(origin: CurrentPcbViaMainOrigin, owner: CurrentPcbViaWriteOwner, plan: CurrentPcbViaWritePlan) { this.#origin = origin; this.#owner = owner; this.#plan = plan; this.#bindings = requireOriginalCurrentPcbViaMainOrigin(origin, owner, plan); Object.freeze(this); }
  async #current(observing: boolean): Promise<void> { need(!this.#failed && requireOriginalCurrentPcbViaMainOrigin(this.#origin, this.#owner, this.#plan) === this.#bindings, "ORIGINAL"); await this.#bindings.assertCurrent(); need(!this.#failed, "CHANGED"); if (observing) { this.#bindings.assertSaveAttempt(); } }
  async #send(input: unknown, observing: boolean): Promise<unknown> { await this.#current(observing); const command = validateCurrentPcbViaMainBeginCommand(input), reply = captureCurrentPcbStringClockReply(await this.#bindings.beginRequest(command, false)).value; await this.#current(observing); return reply; }
  /** This enrollment is before the original SDK Save dispatch. It records all
   * four actual source breakpoint acknowledgments on the same main cursor. */
  public async arm(): Promise<void> {
    need(!this.#armed && !this.#busy, "ARM_CONSUMED"); this.#armed = true; this.#busy = true;
    try { for (const role of ["save", "transaction", "callback", "returned"] as const) { const site = SITES[role]; const location = { scriptId: this.#bindings.scriptId, lineNumber: site.lineNumber, columnNumber: site.columnNumber };
      const result = z.strictObject({ breakpointId: z.string(), actualLocation: z.unknown() }).parse(await this.#send({ phase: "via-main-begin-arm", role, method: "Debugger.setBreakpoint", params: { location, ...(role === "callback" ? { condition: CONDITION } : {}) } }, false));
      need(canonicalJson(result.actualLocation) === canonicalJson(location) && ![...this.#points.values()].includes(result.breakpointId), "ARM_REPLY"); this.#points.set(role, result.breakpointId);
    } this.#bindings.requireBeginArmed(); }
    catch (error) { this.#failed = true; this.#bindings.fail(); throw error; } finally { this.#busy = false; }
  }
  async #next(role: Role): Promise<string> {
    for (let count = 0; count < 64; count += 1) { const raw = captureCurrentPcbStringClockReply(await this.#bindings.nextEvent()).value;
      const event = eventSchema.parse(raw); await this.#current(true);
      if (event.params.hitBreakpoints[0] === this.#bindings.persistentDriverBreakpointId) { const request = await this.#bindings.observeRequest(); this.#bindings.requireOriginalRequest(request); need(request.method === "GET" || request.method === "HEAD", "FOREIGN_REQUEST"); await this.#bindings.continueReadonlyRequest(request); }
      else { if (role !== "run") { need(event.params.hitBreakpoints[0] === this.#points.get(role), "ORIGINAL_POINT"); } const frame = event.params.callFrames[0]; need(frame !== undefined, "FRAME"); return frame.callFrameId; }
    } throw new Error("PCB_VIA_BEGIN_OBSERVER_READ_BOUND");
  }
  async #capture(role: Role, arguments_: readonly string[]): Promise<string | null> {
    const callFrameId = await this.#next(role), expression = role === "run" ? RUN_FRAME : SITES[role].expression;
    const frame = decodeArray(await this.#send({ phase: "via-main-begin-frame", role, method: "Debugger.evaluateOnCallFrame", params: { objectGroup: GROUP, silent: true, generatePreview: false, throwOnSideEffect: true,
      callFrameId, expression, returnByValue: false, includeCommandLineAPI: false } }, true), { save: 4, transaction: 2, run: 7, callback: 8, returned: 2 }[role]);
    const fixed = CALLS[role], result = await this.#send({ phase: "via-main-begin-join", role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: frame, functionDeclaration: fixed.program,
      arguments: arguments_.map(objectId => ({ objectId })), returnByValue: fixed.returnByValue } }, true);
    if (role === "returned") { resultSchema.parse(result); return null; }
    return decodeArray(result, fixed.length);
  }
  async #step(role: "actor" | "save" | "transaction" | "run" | "callback"): Promise<void> { z.strictObject({}).parse(await this.#send({ phase: "via-main-begin-step", role, method: "Debugger.resume", params: {} }, true)); }
  public async begin(actor: CurrentPcbViaHeldMainActor): Promise<CurrentPcbViaHeldBeginResult> {
    need(this.#armed && !this.#busy && !this.#attempted, "BEGIN_CONSUMED"); this.#attempted = true; this.#busy = true;
    try { need(await requireOriginalCurrentPcbViaHeldMainActor(actor, this.#owner, this.#plan) === this.#origin, "ORIGINAL_ACTOR_ORIGIN"); this.#bindings.requireBeginArmed();
      const original = this.#bindings.requireOriginalActorSql(); await this.#step("actor"); const save = await this.#capture("save", [original.actorObjectId, original.sqlObjectId]); need(save !== null, "SAVE_PACKET");
      await this.#step("save"); const transaction = await this.#capture("transaction", [save]); need(transaction !== null, "TRANSACTION_PACKET");
      await this.#step("transaction"); const run = await this.#capture("run", [this.#bindings.sqlCaptureObjectId, transaction]); need(run !== null, "RUN_PACKET");
      await this.#step("run"); const callback = await this.#capture("callback", [run]); need(callback !== null, "CALLBACK_PACKET");
      await this.#step("callback"); await this.#capture("returned", [callback]); const result = this.#bindings.originalBeginResult();
      this.#packet = Object.freeze({ schema: "private.current-pcb-via-held-begin-result.v1", originalNativeCallbackSucceeded: true, originalBeginAwaitCompleted: true, historySqlCompleted: false, furtherSelectedSqlAuthorized: false, persistenceVerified: false });
      issued.set(this.#packet, Object.freeze({ observer: this, owner: this.#owner, plan: this.#plan, origin: this.#origin, result })); return this.#packet;
    } catch (error) { this.#failed = true; this.#bindings.fail(); throw error; } finally { this.#busy = false; }
  }
  public async requireOriginal(packet: CurrentPcbViaHeldBeginResult): Promise<void> { need(this.#packet === packet && issued.get(packet)?.observer === this, "ORIGINAL_PACKET"); await this.#current(true); need(this.#bindings.originalBeginResult() === issued.get(packet)?.result, "ORIGINAL_RESULT"); }
}

/** JSON and another original operation cannot transfer this held return. */
export async function requireOriginalCurrentPcbViaHeldBeginResult(packet: CurrentPcbViaHeldBeginResult, owner: CurrentPcbViaWriteOwner, plan: CurrentPcbViaWritePlan): Promise<CurrentPcbViaMainOrigin> {
  const original = issued.get(packet); need(original !== undefined && original.owner === owner && original.plan === plan, "ORIGINAL_OWNER_PLAN"); await original.observer.requireOriginal(packet); return original.origin;
}
