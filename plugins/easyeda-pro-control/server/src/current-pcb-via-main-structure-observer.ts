/** Drives the original main cursor through the selected STRUCTURE update and
 * response finalizer. It owns no second event reader or persistence claim. */
/* oxlint-disable import/max-dependencies -- Fixed source/program, actual original cursor and inert inspector metadata have distinct ownership boundaries. */
import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { requireOriginalCurrentPcbViaMainOrigin } from "./current-pcb-diagnostic-owner.ts";
import type { CurrentPcbViaWriteOwner } from "./current-pcb-via-write-owner.ts";
import type { CurrentPcbViaWritePlan } from "./current-pcb-via-write-plan.ts";
import type { CurrentPcbViaMainBindings, CurrentPcbViaMainOrigin } from "./current-pcb-via-main-origin.ts";
import type { CurrentProjectStructureSqlEffects } from "./current-project-structure-sql-effects.ts";
import { CURRENT_PCB_VIA_MAIN_STRUCTURE_CALL_FLAGS as FLAGS, CURRENT_PCB_VIA_MAIN_STRUCTURE_FRAME_FLAGS as FRAME_FLAGS, CURRENT_PCB_VIA_MAIN_STRUCTURE_GROUP as GROUP, CURRENT_PCB_VIA_MAIN_STRUCTURE_PROGRAMS as PROGRAMS,
  currentPcbViaMainStructureFrame, validateCurrentPcbViaMainStructureCommand } from "./current-pcb-via-main-structure-protocol.ts";
import type { CurrentPcbViaMainStructureFrameRole as FrameRole, CurrentPcbViaMainStructureProgramRole as ProgramRole, CurrentPcbViaMainStructureRole as Role, CurrentPcbViaMainStructureStep as Step } from "./current-pcb-via-main-structure-protocol.ts";
import { CURRENT_PCB_VIA_MAIN_STRUCTURE_CONDITIONS as CONDITIONS, CURRENT_PCB_VIA_MAIN_STRUCTURE_SITES as SITES } from "./current-pcb-via-main-structure-source.ts";
import { decodeCurrentPcbViaMainStructureFinalFunction, decodeCurrentPcbViaMainStructureFinalMetadata } from "./current-pcb-via-main-structure-replies.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { decodeCurrentFootprintCopyMainRequestArrayCapture as decodeArray, decodeCurrentFootprintCopyMainRequestArrayMember as decodeMember } from "./current-footprint-copy-main-request-protocol.ts";
import { decodeCurrentFootprintCopyMainRequestPromise as decodePromise } from "./current-footprint-copy-main-request-contract.ts";

export interface CurrentPcbViaMainStructureCompletion {
  readonly schema: "private.current-pcb-via-main-structure-completion.v1";
  readonly originalNativeCallbackCompleted: true; readonly originalResponseFinalizerReturned: true;
  readonly selectedSqlStillFenced: true; readonly producerFrontierVerified: false; readonly persistenceVerified: false;
}
const issued = new WeakMap<CurrentPcbViaMainStructureCompletion, Readonly<{ observer: CurrentPcbViaMainStructureObserver; owner: CurrentPcbViaWriteOwner; plan: CurrentPcbViaWritePlan; origin: CurrentPcbViaMainOrigin; effects: CurrentProjectStructureSqlEffects }>>();
const point = z.looseObject({ scriptId: z.string(), lineNumber: z.number().int(), columnNumber: z.number().int() });
const frame = z.looseObject({ callFrameId: z.string(), functionName: z.string(), functionLocation: point, location: point });
const eventParams = z.looseObject({ hitBreakpoints: z.tuple([z.string()]), callFrames: z.array(frame).min(1).max(64) });
const event = z.strictObject({ method: z.literal("Debugger.paused"), params: eventParams });
type Pause = z.infer<typeof event>["params"];
const valueSchema = z.strictObject({ result: z.strictObject({ type: z.literal("object"), value: z.unknown() }) });
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`PCB_VIA_STRUCTURE_OBSERVER_${code}`); } }
export class CurrentPcbViaMainStructureObserver {
  readonly #origin: CurrentPcbViaMainOrigin; readonly #owner: CurrentPcbViaWriteOwner; readonly #plan: CurrentPcbViaWritePlan; readonly #bindings: CurrentPcbViaMainBindings;
  readonly #points = new Map<Role, string>();
  #armed = false; #busy = false; #attempted = false; #cleanupAttempted = false; #failed = false; #completion: CurrentPcbViaMainStructureCompletion | null = null;
  public constructor(origin: CurrentPcbViaMainOrigin, owner: CurrentPcbViaWriteOwner, plan: CurrentPcbViaWritePlan) { this.#origin = origin; this.#owner = owner; this.#plan = plan; this.#bindings = requireOriginalCurrentPcbViaMainOrigin(origin, owner, plan); Object.freeze(this); }
  async #current(observing: boolean): Promise<void> { need(!this.#failed && requireOriginalCurrentPcbViaMainOrigin(this.#origin, this.#owner, this.#plan) === this.#bindings, "ORIGINAL"); await this.#bindings.assertCurrent(); need(!this.#failed, "CHANGED"); if (observing) { this.#bindings.assertSaveAttempt(); } }
  async #send(input: unknown, observing: boolean, cleanup = false): Promise<unknown> { await this.#current(observing); const command = validateCurrentPcbViaMainStructureCommand(input); const reply = captureCurrentPcbStringClockReply(await this.#bindings.structureRequest(command, cleanup)).value; await this.#current(observing); return reply; }
  async #arm(role: Exclude<Role, "callback" | "finalEntry">, observing: boolean): Promise<void> {
    const site = SITES[role]; const location = { scriptId: this.#bindings.scriptId, lineNumber: site.lineNumber, columnNumber: site.columnNumber }; const condition: unknown = Object.getOwnPropertyDescriptor(CONDITIONS, role)?.value;
    const reply = z.strictObject({ breakpointId: z.string(), actualLocation: z.unknown() }).parse(await this.#send({ phase: "via-main-structure-arm", role, method: "Debugger.setBreakpoint", params: { location, ...(condition === undefined ? {} : { condition }) } }, observing));
    need(canonicalJson(reply.actualLocation) === canonicalJson(location) && ![...this.#points.values()].includes(reply.breakpointId), "ARM_REPLY"); this.#points.set(role, reply.breakpointId);
  }
  public async arm(): Promise<void> {
    need(!this.#armed && !this.#busy, "ARM_CONSUMED"); this.#armed = true; this.#busy = true;
    try { for (const role of ["controller", "query", "selected", "update", "exec", "updateReturned", "serviceReturned", "controllerReturned", "response"] as const) { await this.#arm(role, false); } this.#bindings.requireStructureArmed(); }
    catch (error) { this.#failed = true; this.#bindings.fail(); throw error; } finally { this.#busy = false; }
  }
  async #next(role: Role | "run" | "driver"): Promise<Pause> {
    for (let count = 0; count < 64; count += 1) { const paused = event.parse(captureCurrentPcbStringClockReply(await this.#bindings.nextEvent()).value).params; await this.#current(true);
      if (paused.hitBreakpoints[0] === this.#bindings.persistentDriverBreakpointId) { const request = await this.#bindings.observeRequest(); this.#bindings.requireOriginalRequest(request);
        if (role === "driver" && request.method !== "GET" && request.method !== "HEAD") { this.#bindings.startStructure(request); return paused; }
        need(request.method === "GET" || request.method === "HEAD", "FOREIGN_REQUEST"); await this.#bindings.continueReadonlyRequest(request);
      } else { need(role !== "driver", "ORIGINAL_DRIVER_REQUIRED"); if (role !== "run" && role !== "callback") { need(paused.hitBreakpoints[0] === this.#points.get(role), "ORIGINAL_POINT"); } return paused; }
    } throw new Error("PCB_VIA_STRUCTURE_OBSERVER_READ_BOUND");
  }
  async #frame(role: FrameRole, paused: Pause): Promise<string> { const fixed = currentPcbViaMainStructureFrame(role), matches = paused.callFrames.filter(row => row.functionName === fixed.name && row.functionLocation.scriptId === this.#bindings.scriptId && row.functionLocation.lineNumber === fixed.lineNumber && row.functionLocation.columnNumber === fixed.functionColumn);
    need(matches.length === 1 && matches[0] !== undefined, "ORIGINAL_FRAME"); return decodeArray(await this.#send({ phase: "via-main-structure-frame", role, method: "Debugger.evaluateOnCallFrame", params: { ...FRAME_FLAGS, callFrameId: matches[0].callFrameId, expression: fixed.expression } }, true), fixed.length); }
  #join(role: ProgramRole, objectId: string, arguments_: readonly unknown[]): Promise<unknown> { const fixed = PROGRAMS[role]; return this.#send({ phase: "via-main-structure-join", role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId, functionDeclaration: fixed.program, arguments: arguments_, returnByValue: fixed.returnByValue } }, true); }
  async #packet(role: ProgramRole, objectId: string, arguments_: readonly string[]): Promise<string> { const fixed = PROGRAMS[role]; need(!fixed.returnByValue, "PACKET_PROGRAM"); return decodeArray(await this.#join(role, objectId, arguments_.map(id => ({ objectId: id }))), fixed.length); }
  async #capture(role: Role, program: ProgramRole, arguments_: readonly string[]): Promise<string> { return this.#packet(program, await this.#frame(role, await this.#next(role)), arguments_); }
  async #value(role: ProgramRole, packet: string): Promise<unknown> { need(PROGRAMS[role].returnByValue, "VALUE_PROGRAM"); return valueSchema.parse(await this.#join(role, packet, [])).result.value; }
  #properties(role: "query" | "promise" | "final" | "finalFunction", objectId: string): Promise<unknown> { return this.#send({ phase: "via-main-structure-properties", role, method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }, true); }
  async #remove(role: Role): Promise<void> { const breakpointId = this.#points.get(role); need(breakpointId !== undefined, "OWN_POINT"); z.strictObject({}).parse(await this.#send({ phase: "via-main-structure-remove", role, method: "Debugger.removeBreakpoint", params: { breakpointId } }, true, true)); }
  async #step(role: Step): Promise<void> { z.strictObject({}).parse(await this.#send({ phase: "via-main-structure-step", role, method: "Debugger.resume", params: {} }, true)); }
  public async observe(): Promise<CurrentPcbViaMainStructureCompletion> {
    need(this.#armed && !this.#busy && !this.#attempted, "OBSERVATION_CONSUMED"); this.#attempted = true; this.#busy = true;
    try {
      const driverPause = await this.#next("driver"); await this.#arm("context", true); const driver = await this.#frame("driver", driverPause); const caller = await this.#frame("driverCaller", driverPause);
      const invocation = await this.#packet("invocation", driver, [this.#bindings.constructionObjectId, caller]); await this.#step("driver");
      const context = await this.#capture("context", "context", [this.#bindings.constructionObjectId]);
      z.strictObject({ result: z.strictObject({ type: z.literal("boolean"), value: z.literal(true) }) }).parse(await this.#join("contextJoin", invocation, [{ objectId: context }])); await this.#remove("context"); await this.#step("context");
      const controllerFrame = await this.#frame("controller", await this.#next("controller")); const controller = decodeArray(await this.#join("controller", controllerFrame, [{ objectId: context }, { objectId: invocation }, { value: this.#bindings.structureExpected() }]), PROGRAMS.controller.length); await this.#step("controller");
      const queryPause = await this.#next("query"); const queryFrame = await this.#frame("query", queryPause); const queryCaller = await this.#frame("queryCaller", queryPause);
      const query = await this.#packet("query", queryFrame, [controller, queryCaller]); const promise = decodeMember(await this.#properties("query", query), 7, 6, "promise"); const connection = decodePromise(await this.#properties("promise", promise));
      z.strictObject({ result: z.strictObject({ type: z.literal("boolean"), value: z.literal(true) }) }).parse(await this.#join("connection", query, [{ objectId: connection }])); await this.#step("query");
      const selected = await this.#capture("selected", "selected", [query]); await this.#value("selectedValue", selected); await this.#step("selected");
      const update = await this.#capture("update", "update", [selected]); await this.#value("rowsValue", update); await this.#step("update");
      const exec = await this.#capture("exec", "exec", [update]); await this.#step("exec");
      const runPause = await this.#next("run"); const runFrame = await this.#frame("run", runPause); const runCaller = await this.#frame("runCaller", runPause);
      const run = await this.#packet("run", runFrame, [runCaller, exec, this.#bindings.sqlCaptureObjectId]); await this.#value("runValue", run); await this.#step("run");
      const callback = await this.#capture("callback", "callback", [run]); await this.#value("callbackValue", callback); await this.#step("callback");
      const updateReturned = await this.#capture("updateReturned", "updateReturned", [exec]); await this.#step("updateReturned");
      const service = await this.#capture("serviceReturned", "serviceReturned", [updateReturned]); await this.#step("serviceReturned");
      const controllerReturned = await this.#capture("controllerReturned", "controllerReturned", [service]); await this.#step("controllerReturned");
      const response = await this.#capture("response", "response", [controllerReturned]); await this.#value("responseValue", response);
      const final = await this.#packet("finalSelect", response, []); const finalFunction = decodeCurrentPcbViaMainStructureFinalFunction(await this.#properties("final", final)); decodeCurrentPcbViaMainStructureFinalMetadata(await this.#properties("finalFunction", finalFunction), this.#bindings.scriptId);
      const armed = z.strictObject({ breakpointId: z.string() }).parse(await this.#send({ phase: "via-main-structure-final-arm", method: "Debugger.setBreakpointOnFunctionCall", params: { objectId: finalFunction } }, true)); need(![...this.#points.values()].includes(armed.breakpointId), "FINAL_ALIAS"); this.#points.set("finalEntry", armed.breakpointId); await this.#step("response");
      const finalEntry = await this.#capture("finalEntry", "finalEntry", [final]); await this.#arm("finalReturned", true); await this.#arm("finalFailed", true); await this.#step("finalEntry");
      const finalReturned = await this.#capture("finalReturned", "finalReturned", [finalEntry]); await this.#value("finalValue", finalReturned); for (const role of ["finalEntry", "finalReturned", "finalFailed"] as const) { await this.#remove(role); } await this.#step("finalReturned");
      const effects = this.#bindings.originalStructureEffects(); this.#completion = Object.freeze({ schema: "private.current-pcb-via-main-structure-completion.v1", originalNativeCallbackCompleted: true, originalResponseFinalizerReturned: true, selectedSqlStillFenced: true, producerFrontierVerified: false, persistenceVerified: false });
      issued.set(this.#completion, Object.freeze({ observer: this, owner: this.#owner, plan: this.#plan, origin: this.#origin, effects })); return this.#completion;
    } catch (error) { this.#failed = true; this.#bindings.fail(); throw error; } finally { this.#busy = false; }
  }
  /** Removes only this ledger's points after its real finalizer completed.
   * The original selected-file fence remains installed through owner exit. */
  public async cleanup(): Promise<void> {
    need(!this.#busy && this.#completion !== null && !this.#failed && !this.#cleanupAttempted, "CLEANUP_AFTER_COMPLETION"); this.#cleanupAttempted = true; this.#busy = true;
    try { for (const role of ["controller", "query", "selected", "update", "exec", "updateReturned", "serviceReturned", "controllerReturned", "response"] as const) { await this.#remove(role); }
      z.strictObject({}).parse(await this.#send({ phase: "via-main-structure-release", method: "Runtime.releaseObjectGroup", params: { objectGroup: GROUP } }, true, true));
    } catch (error) { this.#failed = true; this.#bindings.fail(); throw error; } finally { this.#busy = false; }
  }
  public async requireOriginal(packet: CurrentPcbViaMainStructureCompletion): Promise<void> { need(this.#completion === packet && issued.get(packet)?.observer === this, "ORIGINAL_PACKET"); await this.#current(true); need(this.#bindings.originalStructureEffects() === issued.get(packet)?.effects, "ORIGINAL_EFFECTS"); }
}
export async function requireOriginalCurrentPcbViaMainStructureCompletion(packet: CurrentPcbViaMainStructureCompletion, owner: CurrentPcbViaWriteOwner, plan: CurrentPcbViaWritePlan): Promise<Readonly<{ origin: CurrentPcbViaMainOrigin; effects: CurrentProjectStructureSqlEffects }>> {
  const original = issued.get(packet); need(original !== undefined && original.owner === owner && original.plan === plan, "ORIGINAL_OWNER_PLAN"); await original.observer.requireOriginal(packet); return Object.freeze({ origin: original.origin, effects: original.effects });
}
