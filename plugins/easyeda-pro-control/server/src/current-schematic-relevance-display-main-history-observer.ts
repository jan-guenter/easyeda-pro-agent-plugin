/** Continues the original selected history transaction through its actual
 * native callbacks. This packet grants no SDK Save or persistence authority. */
/* oxlint-disable import/max-dependencies -- Compose original operation custody with fixed source/cipher selectors, never caller code or SQL. */
import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { requireOriginalCurrentSchematicRelevanceDisplaySaveMainOrigin } from "./current-pcb-diagnostic-owner.ts";
import type { CurrentSchematicRelevanceDisplayWriteOwner } from "./current-schematic-relevance-display-write-owner.ts";
import type { GeneratedSchematicRelevanceDisplayNativeArguments } from "./generated-schematic-relevance-display-source.ts";
import type { CurrentSchematicRelevanceDisplaySaveMainBindings, CurrentSchematicRelevanceDisplaySaveMainOrigin } from "./current-schematic-relevance-display-save-main-origin.ts";
import { requireOriginalCurrentSchematicRelevanceDisplayHeldBeginResult } from "./current-schematic-relevance-display-main-begin-observer.ts";
import type { CurrentSchematicRelevanceDisplayHeldBeginResult } from "./current-schematic-relevance-display-main-begin-observer.ts";
import { CURRENT_PCB_VIA_MAIN_HISTORY_FLAGS as FLAGS, CURRENT_PCB_VIA_MAIN_HISTORY_SITES as SITES, CURRENT_PCB_VIA_MAIN_HISTORY_SLOTS as SLOTS,
  currentPcbViaMainHistoryFrame, validateCurrentPcbViaMainHistoryCommand } from "./current-pcb-via-main-history-protocol.ts";
import type { CurrentPcbViaMainHistoryCommand, CurrentPcbViaMainHistoryFrameRole as FrameRole, CurrentPcbViaMainHistoryProgramRole as ProgramRole, CurrentPcbViaMainHistoryRole as Role, CurrentPcbViaMainHistorySlot as Slot } from "./current-pcb-via-main-history-protocol.ts";
import { CURRENT_PROJECT_HISTORY_MAIN_PROGRAMS as PROGRAMS } from "./current-project-history-main-programs.ts";
import type { CurrentProjectHistorySqlEffects } from "./current-project-history-sql-effects.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { decodeCurrentFootprintCopyMainRequestArrayCapture as decodeArray } from "./current-footprint-copy-main-request-protocol.ts";
import { decodeCurrentFootprintCopyMainCompletionCallback as decodeCallback, decodeCurrentFootprintCopyMainCompletionCallbackMetadata as decodeCallbackMetadata } from "./current-footprint-copy-main-completion-protocol.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_GROUP as GROUP } from "./current-footprint-copy-main-request-programs.ts";

export interface CurrentSchematicRelevanceDisplayMainHistoryCompletion {
  readonly schema: "private.current-schematic-relevance-display-main-history-completion.v1";
  readonly originalNativeCallbacksCompleted: true; readonly originalServiceAwaitCompleted: true;
  readonly selectedSqlStillFenced: true; readonly structurePublicationVerified: false; readonly persistenceVerified: false;
}
const issued = new WeakMap<CurrentSchematicRelevanceDisplayMainHistoryCompletion, Readonly<{ observer: CurrentSchematicRelevanceDisplayMainHistoryObserver; owner: CurrentSchematicRelevanceDisplayWriteOwner; plan: GeneratedSchematicRelevanceDisplayNativeArguments; origin: CurrentSchematicRelevanceDisplaySaveMainOrigin; effects: CurrentProjectHistorySqlEffects }>>();
const point = z.looseObject({ scriptId: z.string(), lineNumber: z.number().int(), columnNumber: z.number().int() });
const frame = z.looseObject({ callFrameId: z.string(), functionName: z.string(), functionLocation: point, location: point });
const eventParams = z.looseObject({ hitBreakpoints: z.tuple([z.string()]), callFrames: z.array(frame).min(1).max(64) });
const eventSchema = z.strictObject({ method: z.literal("Debugger.paused"), params: eventParams });
const valueSchema = z.strictObject({ result: z.strictObject({ type: z.literal("object"), value: z.unknown() }) });
type Paused = z.infer<typeof eventSchema>["params"];
type Step = Extract<CurrentPcbViaMainHistoryCommand, { phase: "via-main-history-step" }>["role"];
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`SCHEMATIC_RELEVANCE_HISTORY_OBSERVER_${code}`); } }
export class CurrentSchematicRelevanceDisplayMainHistoryObserver {
  readonly #origin: CurrentSchematicRelevanceDisplaySaveMainOrigin; readonly #owner: CurrentSchematicRelevanceDisplayWriteOwner; readonly #plan: GeneratedSchematicRelevanceDisplayNativeArguments; readonly #bindings: CurrentSchematicRelevanceDisplaySaveMainBindings;
  readonly #points = new Map<Role, string>();
  #armed = false; #busy = false; #attempted = false; #failed = false; #completion: CurrentSchematicRelevanceDisplayMainHistoryCompletion | null = null;
  public constructor(origin: CurrentSchematicRelevanceDisplaySaveMainOrigin, owner: CurrentSchematicRelevanceDisplayWriteOwner, plan: GeneratedSchematicRelevanceDisplayNativeArguments) { this.#origin = origin; this.#owner = owner; this.#plan = plan; this.#bindings = requireOriginalCurrentSchematicRelevanceDisplaySaveMainOrigin(origin, owner, plan); Object.freeze(this); }
  async #current(observing: boolean): Promise<void> { need(!this.#failed && requireOriginalCurrentSchematicRelevanceDisplaySaveMainOrigin(this.#origin, this.#owner, this.#plan) === this.#bindings, "ORIGINAL"); await this.#bindings.assertCurrent(); need(!this.#failed, "CHANGED"); if (observing) { this.#bindings.assertSaveAttempt(); } }
  async #send(input: unknown, observing: boolean): Promise<unknown> { await this.#current(observing); const command = validateCurrentPcbViaMainHistoryCommand(input); const reply = captureCurrentPcbStringClockReply(await this.#bindings.historyRequest(command, false)).value; await this.#current(observing); return reply; }
  /** Arms nine distinct source sites before Save. The existing BEGIN callback
   * point is transferred later; this route never installs a duplicate. */
  public async arm(): Promise<void> {
    need(!this.#armed && !this.#busy, "ARM_CONSUMED"); this.#armed = true; this.#busy = true;
    try { for (const role of ["branch", "writerAppend", "writerMutable", "encryptEntry", "cipher", "commitReturned", "projectReturned", "saveReturned", "controllerReturned"] as const) { const site = SITES[role]; const location = { scriptId: this.#bindings.scriptId, lineNumber: site.lineNumber, columnNumber: site.columnNumber };
      const result = z.strictObject({ breakpointId: z.string(), actualLocation: z.unknown() }).parse(await this.#send({ phase: "via-main-history-arm", role, method: "Debugger.setBreakpoint", params: { location } }, false));
      need(canonicalJson(result.actualLocation) === canonicalJson(location) && ![...this.#points.values()].includes(result.breakpointId), "ARM_REPLY"); this.#points.set(role, result.breakpointId);
    } this.#bindings.requireHistoryArmed(); }
    catch (error) { this.#failed = true; this.#bindings.fail(); throw error; } finally { this.#busy = false; }
  }
  async #next(role: Role | "sqlRun"): Promise<Paused> {
    for (let count = 0; count < 64; count += 1) { const event = eventSchema.parse(captureCurrentPcbStringClockReply(await this.#bindings.nextEvent()).value); await this.#current(true);
      if (event.params.hitBreakpoints[0] === this.#bindings.persistentDriverBreakpointId) { const request = await this.#bindings.observeRequest(); this.#bindings.requireOriginalRequest(request); need(request.method === "GET" || request.method === "HEAD", "FOREIGN_REQUEST"); await this.#bindings.continueReadonlyRequest(request); }
      else { if (role !== "sqlRun") { need(event.params.hitBreakpoints[0] === this.#points.get(role), "ORIGINAL_POINT"); } return event.params; }
    } throw new Error("SCHEMATIC_RELEVANCE_HISTORY_OBSERVER_READ_BOUND");
  }
  async #frame(role: FrameRole, paused: Paused): Promise<string> {
    const expected = currentPcbViaMainHistoryFrame(role); const matches = paused.callFrames.filter(item => item.functionName === expected.name && item.functionLocation.scriptId === this.#bindings.scriptId && item.functionLocation.lineNumber === expected.lineNumber && item.functionLocation.columnNumber === expected.functionColumn);
    need(matches.length === 1 && matches[0] !== undefined, "ORIGINAL_FRAME"); return decodeArray(await this.#send({ phase: "via-main-history-frame", role, method: "Debugger.evaluateOnCallFrame", params: { objectGroup: GROUP, silent: true, generatePreview: false, throwOnSideEffect: true,
      callFrameId: matches[0].callFrameId, expression: expected.expression, returnByValue: false, includeCommandLineAPI: false } }, true), expected.length);
  }
  #join(role: ProgramRole, objectId: string, arguments_: readonly string[]): Promise<unknown> {
    const fixed = PROGRAMS[role]; return this.#send({ phase: "via-main-history-join", role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId, functionDeclaration: fixed.program, arguments: arguments_.map(argument => ({ objectId: argument })), returnByValue: fixed.returnByValue } }, true);
  }
  async #packet(role: ProgramRole, objectId: string, arguments_: readonly string[]): Promise<string> { const fixed = PROGRAMS[role]; need(!fixed.returnByValue, "PACKET_PROGRAM"); return decodeArray(await this.#join(role, objectId, arguments_), fixed.length); }
  async #capture(role: Role, program: ProgramRole, arguments_: readonly string[]): Promise<string> { return this.#packet(program, await this.#frame(role, await this.#next(role)), arguments_); }
  async #value(role: ProgramRole, packet: string, arguments_: readonly string[] = []): Promise<unknown> { need(PROGRAMS[role].returnByValue, "VALUE_PROGRAM"); return valueSchema.parse(await this.#join(role, packet, arguments_)).result.value; }
  async #step(role: Step): Promise<void> { z.strictObject({}).parse(await this.#send({ phase: "via-main-history-step", role, method: "Debugger.resume", params: {} }, true)); }
  async #sql(slot: Slot, mode: "append" | "mutable", cipher: string): Promise<Readonly<{ run: string; callback: string }>> {
    const callers = { data: "dataCaller", head: mode === "append" ? "headCallerAppend" : "headCallerMutable", branch: "branchCaller", commit: "commitCaller", project: "projectCaller" } as const;
    const programs = { data: "runData", head: "runHead", branch: "runBranch", commit: "runCommit", project: "runProject" } as const;
    const paused = await this.#next("sqlRun"); const raw = await this.#frame("sqlRun", paused); const caller = await this.#frame(callers[slot], paused);
    const run = await this.#packet(programs[slot], raw, [caller, cipher, this.#bindings.sqlCaptureObjectId]); await this.#value("sqlValue", run); await this.#step(`sql-${slot}`);
    const callback = await this.#capture("sqlCallback", "sqlCallback", [run]); await this.#value("sqlCallbackValue", callback); await this.#step(`callback-${slot}`); return Object.freeze({ run, callback });
  }
  public async observe(begin: CurrentSchematicRelevanceDisplayHeldBeginResult): Promise<CurrentSchematicRelevanceDisplayMainHistoryCompletion> {
    need(this.#armed && !this.#busy && !this.#attempted, "OBSERVATION_CONSUMED"); this.#attempted = true; this.#busy = true;
    try {
      need(await requireOriginalCurrentSchematicRelevanceDisplayHeldBeginResult(begin, this.#owner, this.#plan) === this.#origin, "ORIGINAL_BEGIN_ORIGIN"); const handoff = this.#bindings.startHistory(); this.#points.set("sqlCallback", handoff.callbackBreakpointId);
      const properties = (role: "transaction" | "callback", objectId: string): Promise<unknown> => this.#send({ phase: "via-main-history-properties", role, method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }, true);
      const callbackFunction = decodeCallback(await properties("transaction", handoff.transactionObjectId)); decodeCallbackMetadata(await properties("callback", callbackFunction), this.#bindings.scriptId);
      const armed = z.strictObject({ breakpointId: z.string() }).parse(await this.#send({ phase: "via-main-history-callback-arm", method: "Debugger.setBreakpointOnFunctionCall", params: { objectId: callbackFunction } }, true)); need(![...this.#points.values()].includes(armed.breakpointId), "CALLBACK_POINT_ALIAS"); this.#points.set("callback", armed.breakpointId);
      await this.#step("begin"); const callback = await this.#capture("callback", "callback", [handoff.transactionObjectId]); await this.#step("callback");
      const branch = await this.#capture("branch", "branch", [callback]); const mode = z.object({ mode: z.enum(["append", "mutable"]) }).parse(await this.#value("branchValue", branch)).mode; await this.#step("branch");
      const writer = await this.#capture(mode === "append" ? "writerAppend" : "writerMutable", "writer", [branch]); await this.#step("writer");
      const paused = await this.#next("encryptEntry"); const entry = await this.#frame("encryptEntry", paused); const caller = await this.#frame(mode === "append" ? "encryptCallerAppend" : "encryptCallerMutable", paused);
      const encrypt = await this.#packet("encryptEntry", entry, [caller, writer]); await this.#step("encrypt"); const cipher = await this.#capture("cipher", "cipher", [encrypt, this.#bindings.sqlCaptureObjectId]); await this.#value("cipherValue", cipher, [this.#bindings.sqlCaptureObjectId]); await this.#step("cipher");
      const slots = new Map<Slot, Readonly<{ run: string; callback: string }>>(); for (const slot of SLOTS.slice(0, 4)) { slots.set(slot, await this.#sql(slot, mode, cipher)); }
      const commit = slots.get("commit"); need(commit !== undefined, "ORIGINAL_COMMIT"); await this.#capture("commitReturned", "commitReturned", [commit.callback]); await this.#step("commitReturned");
      const project = await this.#sql("project", mode, cipher); const projectReturned = await this.#capture("projectReturned", "projectReturned", [project.run]); await this.#step("projectReturned");
      const saveReturned = await this.#capture("saveReturned", "saveReturned", [projectReturned]); await this.#step("saveReturned");
      const final = await this.#frame("controllerReturned", await this.#next("controllerReturned")); await this.#value("controllerReturned", final, [saveReturned]); await this.#step("controllerReturned");
      const effects = this.#bindings.originalHistoryEffects(); this.#completion = Object.freeze({ schema: "private.current-schematic-relevance-display-main-history-completion.v1", originalNativeCallbacksCompleted: true, originalServiceAwaitCompleted: true, selectedSqlStillFenced: true, structurePublicationVerified: false, persistenceVerified: false });
      issued.set(this.#completion, Object.freeze({ observer: this, owner: this.#owner, plan: this.#plan, origin: this.#origin, effects })); return this.#completion;
    } catch (error) { this.#failed = true; this.#bindings.fail(); throw error; } finally { this.#busy = false; }
  }
  public async requireOriginal(packet: CurrentSchematicRelevanceDisplayMainHistoryCompletion): Promise<void> { need(this.#completion === packet && issued.get(packet)?.observer === this, "ORIGINAL_PACKET"); await this.#current(true); need(this.#bindings.originalHistoryEffects() === issued.get(packet)?.effects, "ORIGINAL_EFFECTS"); }
}
export async function requireOriginalCurrentSchematicRelevanceDisplayMainHistoryCompletion(packet: CurrentSchematicRelevanceDisplayMainHistoryCompletion, owner: CurrentSchematicRelevanceDisplayWriteOwner, plan: GeneratedSchematicRelevanceDisplayNativeArguments): Promise<Readonly<{ origin: CurrentSchematicRelevanceDisplaySaveMainOrigin; effects: CurrentProjectHistorySqlEffects }>> {
  const original = issued.get(packet); need(original !== undefined && original.owner === owner && original.plan === plan, "ORIGINAL_OWNER_PLAN"); await original.observer.requireOriginal(packet); return Object.freeze({ origin: original.origin, effects: original.effects });
}
