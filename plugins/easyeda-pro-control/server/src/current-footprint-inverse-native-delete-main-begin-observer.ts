/** The actual native DELETE main cursor's first native SQL slot. The original BEGIN
 * callback and await return remain separate from history/persistence completion. */
/* oxlint-disable import/max-dependencies -- Keep original operation/actor custody, fixed programs and finite wire decoding separate. */
import { z } from "zod";
import { CURRENT_MAIN_CAPTURED_SCOPE_FRAMES as CAPTURED } from "./current-main-captured-scope-frames.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_BEGIN_BOOKKEEPING as BOOKKEEPING, CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_BEGIN_REBASE as REBASE } from "./current-footprint-inverse-native-delete-main-captured.ts";
import { canonicalJson } from "./core.ts";
import type { CurrentFootprintInverseNativeDeleteMainSource } from "./current-footprint-inverse-native-delete-main-source.ts";
import type { CurrentFootprintInverseNativeDeleteMainBindings,CurrentFootprintInverseNativeDeleteMainPlan,CurrentFootprintInverseNativeDeleteMainRequestOrigin } from "./current-footprint-inverse-native-delete-main-origin.ts";
import { requireOriginalCurrentFootprintInverseNativeDeleteHeldMainActor } from "./current-footprint-inverse-native-delete-main-request-observer.ts";
import type { CurrentFootprintInverseNativeDeleteHeldMainActor } from "./current-footprint-inverse-native-delete-main-request-observer.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_BEGIN_CALLBACK_CONDITION as CONDITION, CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_BEGIN_FLAGS as FLAGS, CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_BEGIN_RUN_EXPRESSION as RUN_FRAME,
  CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_BEGIN_SITES as SITES, validateCurrentFootprintInverseNativeDeleteMainBeginCommand } from "./current-footprint-inverse-native-delete-main-begin-protocol.ts";
import type { CurrentFootprintInverseNativeDeleteMainBeginCall as Role } from "./current-footprint-inverse-native-delete-main-begin-protocol.ts";
import { currentFootprintInverseNativeDeleteMainBeginResultSchema } from "./current-footprint-inverse-native-delete-main-begin-custody.ts";
import type { CurrentFootprintInverseNativeDeleteMainBeginResult } from "./current-footprint-inverse-native-delete-main-begin-custody.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { decodeCurrentFootprintCopyMainRequestArrayCapture as decodeArray, decodeCurrentFootprintCopyMainRequestCollectionPause as decodePause } from "./current-footprint-copy-main-request-protocol.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_GROUP as GROUP } from "./current-footprint-copy-main-request-programs.ts";

export interface CurrentFootprintInverseNativeDeleteHeldBeginResult {
  readonly schema: "private.current-footprint-inverse-native-delete-held-begin-result.v1";
  readonly originalNativeCallbackSucceeded: true; readonly originalBeginAwaitCompleted: true;
  readonly historySqlCompleted: false; readonly furtherSelectedSqlAuthorized: false; readonly persistenceVerified: false;
}
const issued = new WeakMap<CurrentFootprintInverseNativeDeleteHeldBeginResult, Readonly<{ observer: CurrentFootprintInverseNativeDeleteMainBeginObserver; owner: CurrentFootprintInverseNativeDeleteMainSource; plan: CurrentFootprintInverseNativeDeleteMainPlan; origin: CurrentFootprintInverseNativeDeleteMainRequestOrigin; result: CurrentFootprintInverseNativeDeleteMainBeginResult }>>();
const eventFrame = z.looseObject({ callFrameId: z.string() }), frameList = z.array(eventFrame).min(1);
const eventParams = z.looseObject({ hitBreakpoints: z.tuple([z.string()]), callFrames: frameList });
const eventSchema = z.strictObject({ method: z.literal("Debugger.paused"), params: eventParams });
const resultSchema = z.strictObject({ result: z.strictObject({ type: z.literal("object"), value: currentFootprintInverseNativeDeleteMainBeginResultSchema }) });
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`INVERSE_NATIVE_DELETE_BEGIN_OBSERVER_${code}`); } }
export class CurrentFootprintInverseNativeDeleteMainBeginObserver {
  readonly #origin: CurrentFootprintInverseNativeDeleteMainRequestOrigin; readonly #owner: CurrentFootprintInverseNativeDeleteMainSource; readonly #plan: CurrentFootprintInverseNativeDeleteMainPlan; readonly #bindings: CurrentFootprintInverseNativeDeleteMainBindings;
  readonly #points = new Map<Exclude<Role, "run">, string>();
  #armed = false; #busy = false; #attempted = false; #failed = false; #packet: CurrentFootprintInverseNativeDeleteHeldBeginResult | null = null;
  public constructor(origin: CurrentFootprintInverseNativeDeleteMainRequestOrigin, owner: CurrentFootprintInverseNativeDeleteMainSource, plan: CurrentFootprintInverseNativeDeleteMainPlan, bindings: CurrentFootprintInverseNativeDeleteMainBindings) { this.#origin = origin; this.#owner = owner; this.#plan = plan; this.#bindings = bindings; Object.freeze(this); }
  async #current(observing: boolean): Promise<void> { need(!this.#failed, "ORIGINAL"); await this.#bindings.assertCurrent(); need(!this.#failed, "CHANGED"); if (observing) { this.#bindings.assertOriginalUploadWritten(); } }
  async #send(input: unknown, observing: boolean): Promise<unknown> { await this.#current(observing); const command = validateCurrentFootprintInverseNativeDeleteMainBeginCommand(input), reply = captureCurrentPcbStringClockReply(await this.#bindings.beginRequest(command, false)).value; await this.#current(observing); return reply; }
  /** This enrollment is before the original upload resumes. It records all
   * four actual source breakpoint acknowledgments on the same main cursor. */
  public async arm(): Promise<void> {
    need(!this.#armed && !this.#busy, "ARM_CONSUMED"); this.#armed = true; this.#busy = true;
    try { for (const role of ["save", "transaction", "callback", "returned"] as const) { const site = SITES[role]; const location = { scriptId: this.#bindings.scriptId, lineNumber: site.lineNumber, columnNumber: site.columnNumber };
      const result = z.strictObject({ breakpointId: z.string(), actualLocation: z.unknown() }).parse(await this.#send({ phase: "inverse-native-delete-main-begin-arm", role, method: "Debugger.setBreakpoint", params: { location, ...(role === "callback" ? { condition: CONDITION } : {}) } }, false));
      need(canonicalJson(result.actualLocation) === canonicalJson(location) && ![...this.#points.values()].includes(result.breakpointId), "ARM_REPLY"); this.#points.set(role, result.breakpointId);
    } this.#bindings.requireBeginArmed(); }
    catch (error) { this.#failed = true; this.#bindings.fail(error); throw error; } finally { this.#busy = false; }
  }
  async #next(role: Role): Promise<string> {
    for (let count = 0; count < 64; count += 1) { const raw = captureCurrentPcbStringClockReply(await this.#bindings.nextEvent()).value;
      const event = eventSchema.parse(raw); await this.#current(true);
      if (event.params.hitBreakpoints[0] === this.#bindings.persistentDriverBreakpointId) { decodePause(event.params, "driver", this.#bindings.scriptId, this.#bindings.persistentDriverBreakpointId); const request = await this.#bindings.observeRequest(); this.#bindings.requireOriginalRequest(request); need(request.method === "GET" || request.method === "HEAD", "FOREIGN_REQUEST"); await this.#bindings.continueReadonlyRequest(request); }
      else { if (role !== "run") { need(event.params.hitBreakpoints[0] === this.#points.get(role), "ORIGINAL_POINT"); } const frame = event.params.callFrames[0]; need(frame !== undefined, "FRAME"); return frame.callFrameId; }
    } throw new Error("INVERSE_NATIVE_DELETE_BEGIN_OBSERVER_READ_BOUND");
  }
  /** Keep the original frame/join schedule. SQL roles reconstruct captured
   * util; other joins use fixed scratch-copy adapters with original arguments. */
  async #capture(role: Role, arguments_: readonly string[]): Promise<string | null> {
    let captured: typeof CAPTURED.beginRun | null = null; if (role === "run") { captured = CAPTURED.beginRun; } else if (role === "callback") { captured = CAPTURED.beginCallback; }
    const callFrameId = await this.#next(role), expression = captured?.rawExpression ?? (role === "run" ? RUN_FRAME : SITES[role].expression);
    const frame = decodeArray(await this.#send({ phase: captured === null ? "inverse-native-delete-main-begin-frame" : "inverse-native-delete-main-begin-raw-frame", role, method: "Debugger.evaluateOnCallFrame", params: { objectGroup: GROUP, silent: true, generatePreview: false, throwOnSideEffect: true,
      callFrameId, expression, returnByValue: false, includeCommandLineAPI: false } }, true), { save: 4, transaction: 2, run: 7, callback: 8, returned: 2 }[role] - (captured === null ? 0 : 1));
    const fixed = role === "run" || role === "callback" ? REBASE[role] : BOOKKEEPING[role]; const args = role === "callback" ? [this.#bindings.sqlCaptureObjectId, ...arguments_] : arguments_;
    const result = await this.#send({ phase: captured === null ? "inverse-native-delete-main-begin-bookkeeping" : "inverse-native-delete-main-begin-rebase", role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: frame, functionDeclaration: fixed.program,
      arguments: args.map(objectId => ({ objectId })), returnByValue: fixed.returnByValue } }, true);
    if (role === "returned") { resultSchema.parse(result); return null; }
    return decodeArray(result, fixed.length);
  }
  async #step(role: "actor" | "save" | "transaction" | "run" | "callback"): Promise<void> { z.strictObject({}).parse(await this.#send({ phase: "inverse-native-delete-main-begin-step", role, method: "Debugger.resume", params: {} }, true)); }
  public async begin(actor: CurrentFootprintInverseNativeDeleteHeldMainActor): Promise<CurrentFootprintInverseNativeDeleteHeldBeginResult> {
    need(this.#armed && !this.#busy && !this.#attempted, "BEGIN_CONSUMED"); this.#attempted = true; this.#busy = true;
    try { need(await requireOriginalCurrentFootprintInverseNativeDeleteHeldMainActor(actor, this.#owner, this.#plan) === this.#origin, "ORIGINAL_ACTOR_ORIGIN"); this.#bindings.requireBeginArmed();
      const original = this.#bindings.requireOriginalActorSql(); await this.#step("actor"); const save = await this.#capture("save", [original.actorObjectId, original.sqlObjectId]); need(save !== null, "SAVE_PACKET");
      await this.#step("save"); const transaction = await this.#capture("transaction", [save]); need(transaction !== null, "TRANSACTION_PACKET");
      await this.#step("transaction"); const run = await this.#capture("run", [this.#bindings.sqlCaptureObjectId, transaction]); need(run !== null, "RUN_PACKET");
      await this.#step("run"); const callback = await this.#capture("callback", [run]); need(callback !== null, "CALLBACK_PACKET");
      await this.#step("callback"); await this.#capture("returned", [callback]); const result = this.#bindings.originalBeginResult();
      this.#packet = Object.freeze({ schema: "private.current-footprint-inverse-native-delete-held-begin-result.v1", originalNativeCallbackSucceeded: true, originalBeginAwaitCompleted: true, historySqlCompleted: false, furtherSelectedSqlAuthorized: false, persistenceVerified: false });
      issued.set(this.#packet, Object.freeze({ observer: this, owner: this.#owner, plan: this.#plan, origin: this.#origin, result })); return this.#packet;
    } catch (error) { this.#failed = true; this.#bindings.fail(error); throw error; } finally { this.#busy = false; }
  }
  public async requireOriginal(packet: CurrentFootprintInverseNativeDeleteHeldBeginResult): Promise<void> { need(this.#packet === packet && issued.get(packet)?.observer === this, "ORIGINAL_PACKET"); await this.#current(true); need(this.#bindings.originalBeginResult() === issued.get(packet)?.result, "ORIGINAL_RESULT"); }
}

/** JSON and another original operation cannot transfer this held return. */
export async function requireOriginalCurrentFootprintInverseNativeDeleteHeldBeginResult(packet: CurrentFootprintInverseNativeDeleteHeldBeginResult, owner: CurrentFootprintInverseNativeDeleteMainSource, plan: CurrentFootprintInverseNativeDeleteMainPlan): Promise<CurrentFootprintInverseNativeDeleteMainRequestOrigin> {
  const original = issued.get(packet); need(original !== undefined && original.owner === owner && original.plan === plan, "ORIGINAL_OWNER_PLAN"); await original.observer.requireOriginal(packet); return original.origin;
}

Object.freeze(CurrentFootprintInverseNativeDeleteMainBeginObserver.prototype);
Object.freeze(CurrentFootprintInverseNativeDeleteMainBeginObserver);
