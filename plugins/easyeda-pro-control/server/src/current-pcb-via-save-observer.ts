/** Actual once-only Save producer observation on an original suspended worker.
 * The original native owner, never a caller function table, supplies transport. */
import { canonicalJson, sha256Text } from "./core.ts";
import { requireOriginalCurrentPcbViaSaveWorkerOrigin } from "./current-pcb-diagnostic-owner.ts";
import type { CurrentPcbViaWriteOwner } from "./current-pcb-via-write-owner.ts";
import type { CurrentPcbViaWritePlan } from "./current-pcb-via-write-plan.ts";
import type { CurrentPcbViaSaveWorkerBindings, CurrentPcbViaSaveWorkerOrigin } from "./current-pcb-via-save-origin.ts";
import { CURRENT_PCB_VIA_SAVE_CALLS as CALLS } from "./current-pcb-via-save-programs.ts";
import { CURRENT_PCB_VIA_SAVE_CALL_FLAGS as CALL_FLAGS, CURRENT_PCB_VIA_SAVE_FRAME_FLAGS as FRAME_FLAGS,
  CURRENT_PCB_VIA_SAVE_REQUESTS as REQUESTS, validateCurrentPcbViaSaveCommand } from "./current-pcb-via-save-protocol.ts";
import type { CurrentPcbViaSaveCommand } from "./current-pcb-via-save-protocol.ts";
import { captureCurrentPcbViaSaveReply, currentPcbViaSaveArrayObject, currentPcbViaSaveArrayValue, decodeCurrentPcbViaSaveArray, decodeCurrentPcbViaSaveArrayCapture, decodeCurrentPcbViaSaveBreakpoint, decodeCurrentPcbViaSaveEvent, decodeCurrentPcbViaSaveMethod, decodeCurrentPcbViaSavePause,
  decodeCurrentPcbViaSavePendingBodyValue, requireCurrentPcbViaSaveEmpty, requireCurrentPcbViaSaveMethodDescription } from "./current-pcb-via-save-replies.ts";
import type { CurrentPcbViaSavePendingBodyValue } from "./current-pcb-via-save-replies.ts";
import { CURRENT_PCB_VIA_SAVE_METHODS as METHODS, CURRENT_PCB_VIA_SAVE_SITES as SITES, captureCurrentPcbViaSaveScriptReply, qualifyCurrentPcbViaSaveScriptReply,
  requireOriginalCurrentPcbViaSaveSource } from "./current-pcb-via-save-source.ts";
import type { CurrentPcbViaSaveSite } from "./current-pcb-via-save-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export interface CurrentPcbViaSaveBodyObservation {
  readonly schema: "private.current-pcb-via-save-body-observation.v2"; readonly value: CurrentPcbViaSavePendingBodyValue; readonly bodySha256: string;
  readonly originalAwaitedClockContinuationObserved: true; readonly originalFullCompressReturnObserved: true;
  readonly selectedClockResponderVerified: false; readonly selectedSqlAuthorized: false; readonly persistenceVerified: false;
}
interface IssuedBody { readonly observer: CurrentPcbViaSaveObserver; readonly owner: CurrentPcbViaWriteOwner; readonly plan: CurrentPcbViaWritePlan; readonly text: string }
const bodies = new WeakMap<CurrentPcbViaSaveBodyObservation, IssuedBody>();
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`PCB_VIA_SAVE_OBSERVER_${code}`); } }
/** Genuine native origin and one actual worker required even for arming. */
export class CurrentPcbViaSaveObserver {
  readonly #origin: CurrentPcbViaSaveWorkerOrigin; readonly #owner: CurrentPcbViaWriteOwner; readonly #plan: CurrentPcbViaWritePlan;
  readonly #bindings: CurrentPcbViaSaveWorkerBindings;
  readonly #points = new Map<CurrentPcbViaSaveSite, string>(); readonly #arrays = new Map<string, string>();
  #normal = 0; #cleanup = 0; #armed = false; #busy = false; #failed = false; #retired = false; #observing = false;
  #body: CurrentPcbViaSaveBodyObservation | null = null; #bodyReleased = false; #complete = false;
  #paused: Readonly<{ role: CurrentPcbViaSaveSite; frameId: string }> | null = null;
  public constructor(origin: CurrentPcbViaSaveWorkerOrigin, owner: CurrentPcbViaWriteOwner, plan: CurrentPcbViaWritePlan) {
    this.#origin = origin; this.#owner = owner; this.#plan = plan;
    this.#bindings = requireOriginalCurrentPcbViaSaveWorkerOrigin(origin, owner, plan); requireOriginalCurrentPcbViaSaveSource(this.#bindings.source);
    Object.freeze(this);
  }
  async #current(savePending = false): Promise<void> {
    need(!this.#failed && !this.#retired && requireOriginalCurrentPcbViaSaveWorkerOrigin(this.#origin, this.#owner, this.#plan) === this.#bindings, "ORIGINAL");
    requireOriginalCurrentPcbViaSaveSource(this.#bindings.source); await this.#bindings.assertCurrent();
    need(!this.#failed && !this.#retired && requireOriginalCurrentPcbViaSaveWorkerOrigin(this.#origin, this.#owner, this.#plan) === this.#bindings, "CHANGED"); if (savePending) { this.#bindings.assertSaveAttempt(); }
  }
  async #send(command: CurrentPcbViaSaveCommand, cleanup = false): Promise<unknown> {
    await this.#current(this.#observing); validateCurrentPcbViaSaveCommand(command);
    if (cleanup) { this.#cleanup += 1; need(this.#cleanup <= REQUESTS.cleanup, "CLEANUP_CAPACITY"); }
    else { this.#normal += 1; need(this.#normal <= REQUESTS.normal, "CAPACITY"); }
    const raw = await this.#bindings.request(command, cleanup);
    const reply = command.phase === "via-save-source" ? captureCurrentPcbViaSaveScriptReply(raw) : captureCurrentPcbViaSaveReply(raw);
    await this.#current(this.#observing); return reply;
  }
  #failure(): void { this.#failed = true; this.#bindings.fail(); }
   #properties(objectId: string): Promise<unknown> {
    return this.#send({ phase: "via-save-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } });
  }
  public async arm(): Promise<void> {
    need(!this.#armed && !this.#busy && !this.#observing, "ARM_CONSUMED"); this.#busy = true; this.#armed = true;
    try {
      const raw = await this.#send({ phase: "via-save-source", method: "Debugger.getScriptSource", params: { scriptId: this.#bindings.scriptId } });
      qualifyCurrentPcbViaSaveScriptReply(raw);
      for (const role of ["noData", "entry", "clock", "compress", "body", "result"] as const) {
        const site = SITES[role]; const result = await this.#send({ phase: "via-save-arm", role, method: "Debugger.setBreakpoint", params: {
          location: { scriptId: this.#bindings.scriptId, lineNumber: site.lineNumber, columnNumber: site.columnNumber } } });
        const breakpointId = decodeCurrentPcbViaSaveBreakpoint(result, role, this.#bindings.scriptId);
        need(![...this.#points.values()].includes(breakpointId), "BREAKPOINT_ALIAS"); this.#points.set(role, breakpointId);
      }
    } catch (error) { this.#failure(); throw error; } finally { this.#busy = false; }
  }
  async #event(): Promise<ReturnType<typeof decodeCurrentPcbViaSaveEvent>> {
    await this.#current(true); const event = decodeCurrentPcbViaSaveEvent(await this.#bindings.nextEvent()); await this.#current(true);
    need(event.sessionId === this.#bindings.sessionId, "FOREIGN_SESSION"); return event;
  }
  async #pause(role: CurrentPcbViaSaveSite): Promise<string> {
    need(this.#paused === null, "FOREIGN_PAUSE"); const event = await this.#event();
    need(event.method === "Debugger.paused", "UNEXPECTED_RESUME"); const breakpointId = this.#points.get(role); need(breakpointId !== undefined, "ARM_MISSING");
    const frameId = decodeCurrentPcbViaSavePause(event.params, role, this.#bindings.scriptId, breakpointId);
    this.#paused = Object.freeze({ role, frameId }); return frameId;
  }
  async #capture(role: "entry" | "clock" | "compress" | "body" | "result", previous: string): Promise<ReturnType<typeof decodeCurrentPcbViaSaveArray>> {
    const frameId = await this.#pause(role); const site = SITES[role];
    const raw = decodeCurrentPcbViaSaveArrayCapture(await this.#send({ phase: "via-save-frame", role, method: "Debugger.evaluateOnCallFrame", params: {
      ...FRAME_FLAGS, callFrameId: frameId, expression: site.expression } }), site.length);
    const args = role === "entry" ? [{ value: this.#plan.target.documentUuid }, { value: this.#plan.target.projectUuid }] :
      [{ objectId: this.#arrays.get("entry") }, { objectId: previous }];
    const command = validateCurrentPcbViaSaveCommand({ phase: `via-save-${role}`, method: "Runtime.callFunctionOn", params: { ...CALL_FLAGS, objectId: raw,
      functionDeclaration: CALLS[role], arguments: args, returnByValue: false } });
    const length = role === "entry" ? 13 : site.length; const objectId = decodeCurrentPcbViaSaveArrayCapture(await this.#send(command), length);
    this.#arrays.set(role, objectId); return decodeCurrentPcbViaSaveArray(await this.#properties(objectId), length);
  }
  async #resume(role: CurrentPcbViaSaveSite): Promise<void> {
    need(this.#paused?.role === role, "RESUME_ORIGINAL_PAUSE");
    const reply = await this.#send({ phase: "via-save-resume", method: "Debugger.resume", params: {} }, true);
    requireCurrentPcbViaSaveEmpty(reply); const event = await this.#event();
    need(event.method === "Debugger.resumed", "RESUME_EVENT"); requireCurrentPcbViaSaveEmpty(event.params); this.#paused = null;
  }
  /** Called while the original one-Save SDK Promise is retained separately by
   * the native owner. Returns with the actual worker held before uploadLocal. */
  public async observeBody(): Promise<CurrentPcbViaSaveBodyObservation> {
    need(this.#armed && !this.#busy && !this.#observing, "BODY_CONSUMED"); this.#busy = true; this.#observing = true;
    try {
      const entry = await this.#capture("entry", "unused");
      for (const role of ["save", "rpc", "compress", "getTicket", "setTicket"] as const) {
        const profile = METHODS[role]; const object = entry.get(String(profile.index)); need(object !== undefined, "METHOD_MISSING");
        requireCurrentPcbViaSaveMethodDescription(object.description, role);
        decodeCurrentPcbViaSaveMethod(await this.#properties(currentPcbViaSaveArrayObject(entry, profile.index)), role, this.#bindings.scriptId);
      }
      await this.#resume("entry"); await this.#capture("clock", this.#arrays.get("entry") ?? "missing"); await this.#resume("clock");
      await this.#capture("compress", this.#arrays.get("clock") ?? "missing"); await this.#resume("compress");
      const body = await this.#capture("body", this.#arrays.get("compress") ?? "missing"), objectId = this.#arrays.get("body"); need(objectId !== undefined, "BODY_MISSING");
      const valueCommand = validateCurrentPcbViaSaveCommand({ phase: "via-save-value", method: "Runtime.callFunctionOn", params: {
        ...CALL_FLAGS, objectId, functionDeclaration: CALLS.value, arguments: [{ objectId: this.#arrays.get("entry") }], returnByValue: true } });
      const value = decodeCurrentPcbViaSavePendingBodyValue(await this.#send(valueCommand));
      need(value.documentUuid === this.#plan.target.documentUuid && value.projectUuid === this.#plan.target.projectUuid && value.clock === currentPcbViaSaveArrayValue(body, 3) &&
        value.headTicket === currentPcbViaSaveArrayValue(body, 4) && value.body === currentPcbViaSaveArrayValue(body, 5), "BODY_VALUE");
      const packet: CurrentPcbViaSaveBodyObservation = freezeDeep({ schema: "private.current-pcb-via-save-body-observation.v2", value, bodySha256: sha256Text(value.body),
        originalAwaitedClockContinuationObserved: true, originalFullCompressReturnObserved: true, selectedClockResponderVerified: false, selectedSqlAuthorized: false, persistenceVerified: false });
      this.#body = packet; bodies.set(packet, Object.freeze({ observer: this, owner: this.#owner, plan: this.#plan, text: canonicalJson(packet) })); return packet;
    } catch (error) { this.#failure(); throw error; } finally { this.#busy = false; }
  }
  /** Resume only the retained accepted body pause, once. Actual main request
   * and every native SQL call remain fenced by the original main owner. */
  public async releaseBody(packet: CurrentPcbViaSaveBodyObservation): Promise<void> {
    need(this.#body === packet && !this.#bodyReleased && !this.#busy, "BODY_RELEASE_CONSUMED"); this.#bodyReleased = true; this.#busy = true;
    try { await this.requireOriginal(packet); await this.#resume("body"); } catch (error) { this.#failure(); throw error; } finally { this.#busy = false; }
  }
  public async observeCompletion(): Promise<void> {
    need(this.#bodyReleased && !this.#complete && !this.#busy, "COMPLETION_CONSUMED"); this.#complete = true; this.#busy = true;
    try { await this.#capture("result", this.#arrays.get("body") ?? "missing"); await this.#resume("result"); }
    catch (error) { this.#failure(); throw error; } finally { this.#busy = false; }
  }
  public async requireOriginal(packet: CurrentPcbViaSaveBodyObservation): Promise<void> {
    const original = bodies.get(packet); need(original?.observer === this && original.owner === this.#owner && original.plan === this.#plan &&
      original.text === canonicalJson(packet) && this.#body === packet, "ORIGINAL_BODY"); await this.#current(true);
  }
  /** No live detach or unsafe resume on failure. Original Job abort/normal
   * close and observed complete exit must settle any pending native request. */
  public async retireAfterOriginalExit(): Promise<void> {
    need(!this.#busy && !this.#retired, "RETIRE_PENDING"); await this.#bindings.assertOriginalGenerationExited(); this.#retired = true;
  }
}
export async function requireOriginalCurrentPcbViaSaveBody(packet: CurrentPcbViaSaveBodyObservation, owner: CurrentPcbViaWriteOwner,
  plan: CurrentPcbViaWritePlan): Promise<void> {
  const original = bodies.get(packet); need(original !== undefined && original.owner === owner && original.plan === plan, "ORIGINAL_BODY");
  await original.observer.requireOriginal(packet);
}
