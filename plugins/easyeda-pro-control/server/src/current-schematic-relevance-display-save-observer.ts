/** Actual once-only Save producer observation on an original suspended worker.
 * The original native owner, never a caller function table, supplies transport. */
import { canonicalJson, sha256Text } from "./core.ts";
import { assertOriginalCurrentSchematicRelevanceDisplayWriteOwner, requireOriginalCurrentSchematicDisplaySaveWorkerOrigin } from "./current-pcb-diagnostic-owner.ts";
import type { CurrentSchematicRelevanceDisplayWriteOwner } from "./current-schematic-relevance-display-write-owner.ts";
import type { GeneratedSchematicRelevanceDisplayNativeArguments } from "./generated-schematic-relevance-display-source.ts";
import type { CurrentSchematicDisplaySaveWorkerBindings, CurrentSchematicDisplaySaveWorkerOrigin } from "./current-schematic-display-save-origin.ts";
import { CURRENT_SCHEMATIC_DISPLAY_SAVE_CALLS as CALLS } from "./current-schematic-display-save-programs.ts";
import { CURRENT_SCHEMATIC_DISPLAY_SAVE_CALL_FLAGS as CALL_FLAGS, CURRENT_SCHEMATIC_DISPLAY_SAVE_FRAME_FLAGS as FRAME_FLAGS,
  CURRENT_SCHEMATIC_DISPLAY_SAVE_REQUESTS as REQUESTS, validateCurrentSchematicDisplaySaveCommand } from "./current-schematic-display-save-protocol.ts";
import type { CurrentSchematicDisplaySaveCommand } from "./current-schematic-display-save-protocol.ts";
import { captureCurrentSchematicDisplaySaveReply, currentSchematicDisplaySaveArrayObject, currentSchematicDisplaySaveArrayValue, decodeCurrentSchematicDisplaySaveArray, decodeCurrentSchematicDisplaySaveArrayCapture, decodeCurrentSchematicDisplaySaveBodyValue, decodeCurrentSchematicDisplaySaveBreakpoint, decodeCurrentSchematicDisplaySaveEvent, decodeCurrentSchematicDisplaySaveMethod,
  decodeCurrentSchematicDisplaySavePause, requireCurrentSchematicDisplaySaveEmpty, requireCurrentSchematicDisplaySaveMethodDescription } from "./current-schematic-display-save-replies.ts";
import type { CurrentSchematicDisplaySaveBodyValue } from "./current-schematic-display-save-replies.ts";
import { CURRENT_SCHEMATIC_DISPLAY_SAVE_METHODS as METHODS, CURRENT_SCHEMATIC_DISPLAY_SAVE_SITES as SITES, captureCurrentSchematicDisplaySaveScriptReply, qualifyCurrentSchematicDisplaySaveScriptReply,
  requireOriginalCurrentSchematicDisplaySaveSource } from "./current-schematic-display-save-source.ts";
import type { CurrentSchematicDisplaySaveSite } from "./current-schematic-display-save-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export interface CurrentSchematicRelevanceDisplaySaveBodyObservation {
  readonly schema: "private.current-schematic-relevance-display-save-body-observation.v1"; readonly value: CurrentSchematicDisplaySaveBodyValue; readonly bodySha256: string;
  readonly originalAwaitedClockContinuationObserved: true; readonly originalFullCompressReturnObserved: true;
  readonly selectedClockResponderVerified: false; readonly selectedSqlAuthorized: false; readonly persistenceVerified: false;
}
interface IssuedBody { readonly observer: CurrentSchematicRelevanceDisplaySaveObserver; readonly owner: CurrentSchematicRelevanceDisplayWriteOwner; readonly argumentsValue: GeneratedSchematicRelevanceDisplayNativeArguments; readonly text: string }
const bodies = new WeakMap<CurrentSchematicRelevanceDisplaySaveBodyObservation, IssuedBody>();
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`SCHEMATIC_DISPLAY_SAVE_OBSERVER_${code}`); } }
/** Genuine native origin and one actual worker required even for arming. */
export class CurrentSchematicRelevanceDisplaySaveObserver {
  readonly #origin: CurrentSchematicDisplaySaveWorkerOrigin; readonly #owner: CurrentSchematicRelevanceDisplayWriteOwner; readonly #argumentsValue: GeneratedSchematicRelevanceDisplayNativeArguments;
  readonly #bindings: CurrentSchematicDisplaySaveWorkerBindings;
  readonly #points = new Map<CurrentSchematicDisplaySaveSite, string>(); readonly #arrays = new Map<string, string>();
  #normal = 0; #cleanup = 0; #armed = false; #busy = false; #failed = false; #retired = false; #observing = false;
  #body: CurrentSchematicRelevanceDisplaySaveBodyObservation | null = null; #bodyReleased = false; #complete = false;
  #paused: Readonly<{ role: CurrentSchematicDisplaySaveSite; frameId: string }> | null = null;
  public constructor(origin: CurrentSchematicDisplaySaveWorkerOrigin, owner: CurrentSchematicRelevanceDisplayWriteOwner, argumentsValue: GeneratedSchematicRelevanceDisplayNativeArguments) {
    assertOriginalCurrentSchematicRelevanceDisplayWriteOwner(owner);
    this.#origin = origin; this.#owner = owner; this.#argumentsValue = argumentsValue;
    this.#bindings = requireOriginalCurrentSchematicDisplaySaveWorkerOrigin(origin, owner, argumentsValue); requireOriginalCurrentSchematicDisplaySaveSource(this.#bindings.source);
    Object.freeze(this);
  }
  async #current(savePending = false): Promise<void> {
    need(!this.#failed && !this.#retired && requireOriginalCurrentSchematicDisplaySaveWorkerOrigin(this.#origin, this.#owner, this.#argumentsValue) === this.#bindings, "ORIGINAL");
    requireOriginalCurrentSchematicDisplaySaveSource(this.#bindings.source); await this.#bindings.assertCurrent();
    need(!this.#failed && !this.#retired && requireOriginalCurrentSchematicDisplaySaveWorkerOrigin(this.#origin, this.#owner, this.#argumentsValue) === this.#bindings, "CHANGED"); if (savePending) { this.#bindings.assertSaveAttempt(); }
  }
  async #send(command: CurrentSchematicDisplaySaveCommand, cleanup = false): Promise<unknown> {
    await this.#current(this.#observing); validateCurrentSchematicDisplaySaveCommand(command);
    if (cleanup) { this.#cleanup += 1; need(this.#cleanup <= REQUESTS.cleanup, "CLEANUP_CAPACITY"); }
    else { this.#normal += 1; need(this.#normal <= REQUESTS.normal, "CAPACITY"); }
    const raw = await this.#bindings.request(command, cleanup);
    const reply = command.phase === "schematic-save-source" ? captureCurrentSchematicDisplaySaveScriptReply(raw) : captureCurrentSchematicDisplaySaveReply(raw);
    await this.#current(this.#observing); return reply;
  }
  #failure(): void { this.#failed = true; this.#bindings.fail(); }
   #properties(objectId: string): Promise<unknown> {
    return this.#send({ phase: "schematic-save-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } });
  }
  public async arm(): Promise<void> {
    need(!this.#armed && !this.#busy && !this.#observing, "ARM_CONSUMED"); this.#busy = true; this.#armed = true;
    try {
      const raw = await this.#send({ phase: "schematic-save-source", method: "Debugger.getScriptSource", params: { scriptId: this.#bindings.scriptId } });
      qualifyCurrentSchematicDisplaySaveScriptReply(raw);
      for (const role of ["noData", "entry", "clock", "compress", "body", "result"] as const) {
        const site = SITES[role]; const result = await this.#send({ phase: "schematic-save-arm", role, method: "Debugger.setBreakpoint", params: {
          location: { scriptId: this.#bindings.scriptId, lineNumber: site.lineNumber, columnNumber: site.columnNumber } } });
        const breakpointId = decodeCurrentSchematicDisplaySaveBreakpoint(result, role, this.#bindings.scriptId);
        need(![...this.#points.values()].includes(breakpointId), "BREAKPOINT_ALIAS"); this.#points.set(role, breakpointId);
      }
    } catch (error) { this.#failure(); throw error; } finally { this.#busy = false; }
  }
  async #event(): Promise<ReturnType<typeof decodeCurrentSchematicDisplaySaveEvent>> {
    await this.#current(true); const event = decodeCurrentSchematicDisplaySaveEvent(await this.#bindings.nextEvent()); await this.#current(true);
    need(event.sessionId === this.#bindings.sessionId, "FOREIGN_SESSION"); return event;
  }
  async #pause(role: CurrentSchematicDisplaySaveSite): Promise<string> {
    need(this.#paused === null, "FOREIGN_PAUSE"); const event = await this.#event();
    need(event.method === "Debugger.paused", "UNEXPECTED_RESUME"); const breakpointId = this.#points.get(role); need(breakpointId !== undefined, "ARM_MISSING");
    const frameId = decodeCurrentSchematicDisplaySavePause(event.params, role, this.#bindings.scriptId, breakpointId);
    this.#paused = Object.freeze({ role, frameId }); return frameId;
  }
  async #capture(role: "entry" | "clock" | "compress" | "body" | "result", previous: string): Promise<ReturnType<typeof decodeCurrentSchematicDisplaySaveArray>> {
    const frameId = await this.#pause(role); const site = SITES[role];
    const raw = decodeCurrentSchematicDisplaySaveArrayCapture(await this.#send({ phase: "schematic-save-frame", role, method: "Debugger.evaluateOnCallFrame", params: {
      ...FRAME_FLAGS, callFrameId: frameId, expression: site.expression } }), site.length);
    const args = role === "entry" ? [{ value: this.#argumentsValue.target.pageUuid }, { value: this.#argumentsValue.target.projectUuid }] :
      [{ objectId: this.#arrays.get("entry") }, { objectId: previous }];
    const command = validateCurrentSchematicDisplaySaveCommand({ phase: `schematic-save-${role}`, method: "Runtime.callFunctionOn", params: { ...CALL_FLAGS, objectId: raw,
      functionDeclaration: CALLS[role], arguments: args, returnByValue: false } });
    const length = role === "entry" ? 13 : site.length; const objectId = decodeCurrentSchematicDisplaySaveArrayCapture(await this.#send(command), length);
    this.#arrays.set(role, objectId); return decodeCurrentSchematicDisplaySaveArray(await this.#properties(objectId), length);
  }
  async #resume(role: CurrentSchematicDisplaySaveSite): Promise<void> {
    need(this.#paused?.role === role, "RESUME_ORIGINAL_PAUSE");
    const reply = await this.#send({ phase: "schematic-save-resume", method: "Debugger.resume", params: {} }, true);
    requireCurrentSchematicDisplaySaveEmpty(reply); const event = await this.#event();
    need(event.method === "Debugger.resumed", "RESUME_EVENT"); requireCurrentSchematicDisplaySaveEmpty(event.params); this.#paused = null;
  }
  /** Called while the original one-Save SDK Promise is retained separately by
   * the native owner. Returns with the actual worker held before uploadLocal. */
  public async observeBody(): Promise<CurrentSchematicRelevanceDisplaySaveBodyObservation> {
    need(this.#armed && !this.#busy && !this.#observing, "BODY_CONSUMED"); this.#busy = true; this.#observing = true;
    try {
      const entry = await this.#capture("entry", "unused");
      for (const role of ["save", "rpc", "compress", "getTicket", "setTicket"] as const) {
        const profile = METHODS[role]; const object = entry.get(String(profile.index)); need(object !== undefined, "METHOD_MISSING");
        requireCurrentSchematicDisplaySaveMethodDescription(object.description, role);
        decodeCurrentSchematicDisplaySaveMethod(await this.#properties(currentSchematicDisplaySaveArrayObject(entry, profile.index)), role, this.#bindings.scriptId);
      }
      await this.#resume("entry"); await this.#capture("clock", this.#arrays.get("entry") ?? "missing"); await this.#resume("clock");
      await this.#capture("compress", this.#arrays.get("clock") ?? "missing"); await this.#resume("compress");
      const body = await this.#capture("body", this.#arrays.get("compress") ?? "missing"), objectId = this.#arrays.get("body"); need(objectId !== undefined, "BODY_MISSING");
      const valueCommand = validateCurrentSchematicDisplaySaveCommand({ phase: "schematic-save-value", method: "Runtime.callFunctionOn", params: {
        ...CALL_FLAGS, objectId, functionDeclaration: CALLS.value, arguments: [{ objectId: this.#arrays.get("entry") }], returnByValue: true } });
      const value = decodeCurrentSchematicDisplaySaveBodyValue(await this.#send(valueCommand));
      need(value.documentUuid === this.#argumentsValue.target.pageUuid && value.projectUuid === this.#argumentsValue.target.projectUuid && value.clock === currentSchematicDisplaySaveArrayValue(body, 3) &&
        value.headTicket === currentSchematicDisplaySaveArrayValue(body, 4) && value.body === currentSchematicDisplaySaveArrayValue(body, 5), "BODY_VALUE");
      const packet: CurrentSchematicRelevanceDisplaySaveBodyObservation = freezeDeep({ schema: "private.current-schematic-relevance-display-save-body-observation.v1", value, bodySha256: sha256Text(value.body),
        originalAwaitedClockContinuationObserved: true, originalFullCompressReturnObserved: true, selectedClockResponderVerified: false, selectedSqlAuthorized: false, persistenceVerified: false });
      this.#body = packet; bodies.set(packet, Object.freeze({ observer: this, owner: this.#owner, argumentsValue: this.#argumentsValue, text: canonicalJson(packet) })); return packet;
    } catch (error) { this.#failure(); throw error; } finally { this.#busy = false; }
  }
  /** Resume only the retained accepted body pause, once. Actual main request
   * and every native SQL call remain fenced by the original main owner. */
  public async releaseBody(packet: CurrentSchematicRelevanceDisplaySaveBodyObservation): Promise<void> {
    need(this.#body === packet && !this.#bodyReleased && !this.#busy, "BODY_RELEASE_CONSUMED"); this.#bodyReleased = true; this.#busy = true;
    try { await this.requireOriginal(packet); await this.#resume("body"); } catch (error) { this.#failure(); throw error; } finally { this.#busy = false; }
  }
  public async observeCompletion(): Promise<void> {
    need(this.#bodyReleased && !this.#complete && !this.#busy, "COMPLETION_CONSUMED"); this.#complete = true; this.#busy = true;
    try { await this.#capture("result", this.#arrays.get("body") ?? "missing"); await this.#resume("result"); }
    catch (error) { this.#failure(); throw error; } finally { this.#busy = false; }
  }
  public async requireOriginal(packet: CurrentSchematicRelevanceDisplaySaveBodyObservation): Promise<void> {
    const original = bodies.get(packet); need(original?.observer === this && original.owner === this.#owner && original.argumentsValue === this.#argumentsValue &&
      original.text === canonicalJson(packet) && this.#body === packet, "ORIGINAL_BODY"); await this.#current(true);
  }
  /** No live detach or unsafe resume on failure. Original Job abort/normal
   * close and observed complete exit must settle any pending native request. */
  public async retireAfterOriginalExit(): Promise<void> {
    need(!this.#busy && !this.#retired, "RETIRE_PENDING"); await this.#bindings.assertOriginalGenerationExited(); this.#retired = true;
  }
}
export async function requireOriginalCurrentSchematicRelevanceDisplaySaveBody(packet: CurrentSchematicRelevanceDisplaySaveBodyObservation, owner: CurrentSchematicRelevanceDisplayWriteOwner,
  argumentsValue: GeneratedSchematicRelevanceDisplayNativeArguments): Promise<void> {
  const original = bodies.get(packet); need(original !== undefined && original.owner === owner && original.argumentsValue === argumentsValue, "ORIGINAL_BODY");
  await original.observer.requireOriginal(packet);
}

/** Historical captured data only, including after original Job exit/release.
 * The original packet/owner/arguments identities remain mandatory; this does
 * not revalidate live source custody, resume a pause or grant another Save. */
export function requireOriginalCurrentSchematicRelevanceDisplaySaveBodyData(packet: CurrentSchematicRelevanceDisplaySaveBodyObservation, owner: CurrentSchematicRelevanceDisplayWriteOwner,
  argumentsValue: GeneratedSchematicRelevanceDisplayNativeArguments): CurrentSchematicDisplaySaveBodyValue {
  const original = bodies.get(packet); need(original !== undefined && original.owner === owner && original.argumentsValue === argumentsValue && original.text === canonicalJson(packet) && packet.bodySha256 === sha256Text(packet.value.body), "ORIGINAL_BODY_DATA");
  return packet.value;
}
