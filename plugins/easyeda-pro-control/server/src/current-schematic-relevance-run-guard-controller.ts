/** Three original function-entry receiver guards. Core retains this controller,
 * supplies only correlated replies and separately grants any continuation. */
import { z } from "zod";
import { CURRENT_SCHEMATIC_RELEVANCE_PREFIX_QUEUE_SOURCE as SOURCE } from "./current-schematic-relevance-action-prefix-queue-source.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_RUN_PREFIX_CALLS as CALLS, CURRENT_SCHEMATIC_RELEVANCE_RUN_PREFIX_FLAGS as FLAGS, CURRENT_SCHEMATIC_RELEVANCE_RUN_PREFIX_GUARDS as ROLES, validateCurrentSchematicRelevanceRunPrefixCommand } from "./current-schematic-relevance-run-prefix-protocol.ts";
import type { CurrentSchematicRelevanceRunPrefixCommand } from "./current-schematic-relevance-run-prefix-protocol.ts";
import { currentSchematicRelevancePrefixCapture, currentSchematicRelevancePrefixHandle, currentSchematicRelevancePrefixProperties, currentSchematicRelevancePrefixTrue, currentSchematicRelevancePrefixTuple } from "./current-schematic-relevance-run-prefix-replies.ts";
import type { CurrentSchematicRelevanceRunPrefixCapture } from "./current-schematic-relevance-run-prefix-cursor.ts";
import type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";

type GuardRole = typeof ROLES[number];
export interface CurrentSchematicRelevanceRunGuardStep { readonly guard: GuardRole | "run"; readonly command: CurrentSchematicRelevanceRunPrefixCommand }
export interface CurrentSchematicRelevanceRunPrefixEnd {
  readonly profile: "private.current-schematic-relevance-run-prefix-end.v1";
  readonly originalRunResumeAcknowledged: true; readonly originalRunResumedObserved: true;
  readonly firstStartReceiverVerified: true; readonly willEndReceiverVerified: true; readonly firstEndReceiverVerified: true;
  readonly originalGuardResumesAcknowledged: 3; readonly originalGuardResumedEventsObserved: 3;
  readonly actionCompletionVerified: false; readonly persistenceVerified: false;
}
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const point = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const frame = z.looseObject({ callFrameId: handle, functionLocation: point, location: point });
const pause = z.looseObject({ callFrames: z.array(frame).min(1).max(64), reason: z.literal("other"), hitBreakpoints: z.array(handle).length(1) });
const armAck = z.strictObject({ breakpointId: handle });
const emptyAck = z.strictObject({});
const sourceRoles = Object.freeze(["historyStartFirst", "historyWillEnd", "historyEndFirst"] as const);
export const CURRENT_SCHEMATIC_RELEVANCE_RUN_GUARD_REQUESTS = Object.freeze({ arms: 3, initialResume: 1, receiverReads: 12, removes: 3, guardResumes: 3, total: 22, originalEvents: 7 });
function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_RELEVANCE_ORIGINAL_RUN_GUARD"); } }
export class CurrentSchematicRelevanceRunGuardController {
  readonly #session: string; readonly #script: string; readonly #variant: 0 | 1; readonly #capture: CurrentSchematicRelevanceRunPrefixCapture;
  readonly #points = new Map<string, GuardRole>(); readonly #breakpoints = new Map<GuardRole, string>();
  readonly #heldSignals = ROLES.map(() => Promise.withResolvers<DiagnosticEvent | null>());
  readonly #initial = Promise.withResolvers<boolean>(); readonly #end = Promise.withResolvers<CurrentSchematicRelevanceRunPrefixEnd | null>();
  #arms = 0; #index = 0; #started = false; #failed = false; #reserved = false; #requests = 0;
  #command: CurrentSchematicRelevanceRunGuardStep | null = null; #held: Readonly<{ role: GuardRole; event: DiagnosticEvent; frameId: string }> | null = null;
  #read = 0; #tuple: string | null = null; #receiver: string | null = null;
  #resume: GuardRole | "run" | null = null; #resumeAck = false; #resumeSeen = false; #initialCompleted = false;
  #completed: CurrentSchematicRelevanceRunPrefixEnd | null = null;
  public constructor(sessionId: string, scriptId: string, variant: 0 | 1, capture: CurrentSchematicRelevanceRunPrefixCapture) { this.#session = handle.parse(sessionId); this.#script = handle.parse(scriptId); this.#variant = variant; this.#capture = capture; Object.freeze(this); }
  static #props(objectId: string): CurrentSchematicRelevanceRunPrefixCommand { return validateCurrentSchematicRelevanceRunPrefixCommand({ phase: "prefix-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }); }
  #function(role: GuardRole): string { switch (role) { case "first-start": { return this.#capture.firstStartObjectId; } case "will-end": { return this.#capture.willEndObjectId; } case "first-end": { return this.#capture.firstEndObjectId; } default: { throw new Error("SCHEMATIC_RUN_GUARD_ROLE"); } } }
  #require(): void { need(!this.#failed); }
  public next(): CurrentSchematicRelevanceRunGuardStep | null {
    this.#require(); need(!this.#reserved);
    if (this.#command !== null) { return this.#command; }
    if (this.#completed !== null || this.#resume !== null) { return null; }
    let role: GuardRole; let command: CurrentSchematicRelevanceRunPrefixCommand;
    if (this.#arms < 3) { const actual = ROLES[this.#arms]; need(actual !== undefined); role = actual; command = validateCurrentSchematicRelevanceRunPrefixCommand({ phase: "prefix-arm", role, method: "Debugger.setBreakpointOnFunctionCall", params: { objectId: this.#function(role), condition: "" } }); }
    else {
      const held = this.#held; if (!this.#initialCompleted || held === null) { return null; } role = held.role; need(role === ROLES[this.#index]);
      switch (this.#read) {
        case 0: { command = validateCurrentSchematicRelevanceRunPrefixCommand({ phase: "prefix-frame", role: "receiver", variant: this.#variant, method: "Debugger.evaluateOnCallFrame", params: { ...FLAGS, callFrameId: held.frameId, expression: "[this]", returnByValue: false, includeCommandLineAPI: false } }); break; }
        case 1: { need(this.#tuple !== null); command = CurrentSchematicRelevanceRunGuardController.#props(this.#tuple); break; }
        case 2: { need(this.#receiver !== null); command = CurrentSchematicRelevanceRunGuardController.#props(this.#receiver); break; }
        case 3: { need(this.#receiver !== null); const row = CALLS.find(value => value[0] === "callback-receiver"); need(row !== undefined); command = validateCurrentSchematicRelevanceRunPrefixCommand({ phase: "prefix-call", role: "callback-receiver", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: this.#receiver, functionDeclaration: row[1], arguments: [{ objectId: this.#capture.nativeObjectId }, { objectId: this.#capture.rootsObjectId }], returnByValue: true, awaitPromise: false, userGesture: false } }); break; }
        case 4: { const breakpointId = this.#breakpoints.get(role); need(breakpointId !== undefined); command = validateCurrentSchematicRelevanceRunPrefixCommand({ phase: "prefix-remove", role, method: "Debugger.removeBreakpoint", params: { breakpointId } }); break; }
        case 5: { command = validateCurrentSchematicRelevanceRunPrefixCommand({ phase: "prefix-resume", role, method: "Debugger.resume", params: {} }); break; }
        default: { throw new Error("SCHEMATIC_RUN_GUARD_READ_ORDER"); }
      }
    }
    this.#command = Object.freeze({ guard: role, command }); return this.#command;
  }
  public assertArmed(): void { this.#require(); need(this.#arms === 3 && this.#points.size === 3 && !this.#started && !this.#reserved && this.#command === null && this.#held === null); }
  /** Reservation precedes the native write. Neither a timeout nor a missing
   * ACK permits this original run resume to be requested a second time. */
  public beginOriginalRunResume(): CurrentSchematicRelevanceRunGuardStep {
    this.assertArmed(); this.#started = true;
    this.#command = Object.freeze({ guard: "run", command: validateCurrentSchematicRelevanceRunPrefixCommand({ phase: "prefix-resume", role: "run", method: "Debugger.resume", params: {} }) }); return this.#command;
  }
  public reserve(step: CurrentSchematicRelevanceRunGuardStep): void {
    this.#require(); need(!this.#reserved && step === this.#command && this.#requests < CURRENT_SCHEMATIC_RELEVANCE_RUN_GUARD_REQUESTS.total);
    this.#requests += 1; this.#reserved = true;
    if (step.command.phase === "prefix-resume") { need(this.#resume === null); this.#resume = step.guard; this.#resumeAck = false; this.#resumeSeen = false; if (step.guard !== "run") { need(this.#held?.role === step.guard && this.#read === 5); this.#held = null; } }
  }
  #finishResume(): void {
    if (this.#resume === null || !this.#resumeAck || !this.#resumeSeen) { return; }
    const role = this.#resume; this.#resume = null;
    if (role === "run") { this.#initialCompleted = true; this.#initial.resolve(true); }
    else {
      need(role === ROLES[this.#index]); this.#index += 1; this.#read = 0; this.#tuple = null; this.#receiver = null;
      if (this.#index === 3) {
        need(this.#requests === CURRENT_SCHEMATIC_RELEVANCE_RUN_GUARD_REQUESTS.total && this.#held === null);
        const packet: CurrentSchematicRelevanceRunPrefixEnd = Object.freeze({ profile: "private.current-schematic-relevance-run-prefix-end.v1", originalRunResumeAcknowledged: true, originalRunResumedObserved: true, firstStartReceiverVerified: true, willEndReceiverVerified: true, firstEndReceiverVerified: true, originalGuardResumesAcknowledged: 3, originalGuardResumedEventsObserved: 3, actionCompletionVerified: false, persistenceVerified: false });
        this.#completed = packet; this.#end.resolve(packet);
      }
    }
  }
  public accept(step: CurrentSchematicRelevanceRunGuardStep, raw: unknown): void {
    this.#require(); need(this.#reserved && step === this.#command);
    try {
      const command = step.command;
      if (command.phase === "prefix-arm") { const ack = armAck.parse(captureCurrentPcbStringClockReply(raw).value); need(!this.#points.has(ack.breakpointId) && step.guard === ROLES[this.#arms]); this.#points.set(ack.breakpointId, command.role); this.#breakpoints.set(command.role, ack.breakpointId); this.#arms += 1; }
      else if (command.phase === "prefix-resume") { emptyAck.parse(captureCurrentPcbStringClockReply(raw).value); need(this.#resume === step.guard); this.#resumeAck = true; }
      else {
        need(this.#held?.role === step.guard);
        switch (this.#read) {
          case 0: { this.#tuple = currentSchematicRelevancePrefixCapture(raw); break; }
          case 1: { const values = currentSchematicRelevancePrefixTuple(raw, 1); this.#receiver = currentSchematicRelevancePrefixHandle(values[0]); break; }
          case 2: { currentSchematicRelevancePrefixProperties(raw); break; }
          case 3: { currentSchematicRelevancePrefixTrue(raw); break; }
          case 4: { emptyAck.parse(captureCurrentPcbStringClockReply(raw).value); break; }
          default: { throw new Error("SCHEMATIC_RUN_GUARD_REPLY_ORDER"); }
        } this.#read += 1;
      }
      this.#reserved = false; this.#command = null; this.#finishResume();
    } catch (error) { this.fail(); throw error; }
  }
  /** This consumes only this controller's actual reserved resumed event and
   * three installed function-call breakpoints. The callback owns other events. */
  public observeOriginalEvent(event: DiagnosticEvent): boolean {
    if (event.sessionId !== this.#session || this.#failed) { return false; }
    if (event.method === "Debugger.resumed") {
      if (this.#resume === null) { return false; }
      try { need(!this.#resumeSeen); this.#resumeSeen = true; this.#finishResume(); } catch { this.fail(); } return true;
    }
    if (event.method !== "Debugger.paused") { return false; }
    const ids = event.params["hitBreakpoints"]; if (!Array.isArray(ids) || !ids.some(value => typeof value === "string" && this.#points.has(value))) { return false; }
    try {
      const actual = pause.parse(event.params); const role = this.#points.get(actual.hitBreakpoints[0] ?? ""); need(role !== undefined && this.#started && this.#held === null);
      const expected = this.#resume === null || this.#resume === "run" ? this.#index : this.#index + (this.#resumeSeen ? 1 : 0);
      need(role === ROLES[expected] && (this.#initialCompleted || this.#resume === "run" && this.#resumeSeen));
      const first = actual.callFrames[0]; const sourceRole = sourceRoles[expected]; need(first !== undefined && sourceRole !== undefined);
      const profile = SOURCE[this.#variant].roles[sourceRole]; need(first.functionLocation.scriptId === this.#script && first.location.scriptId === this.#script && first.functionLocation.lineNumber === profile.lineNumber && first.functionLocation.columnNumber === profile.columnNumber);
      this.#held = Object.freeze({ role, event, frameId: first.callFrameId }); const signal = this.#heldSignals[expected]; need(signal !== undefined); signal.resolve(event);
    } catch { this.fail(); } return true;
  }
  public async waitOriginalRunResumed(): Promise<void> { need(await this.#initial.promise); this.#require(); need(this.#initialCompleted); }
  public async waitOriginalGuard(index: 0 | 1 | 2): Promise<DiagnosticEvent> { const signal = this.#heldSignals[index]; need(signal !== undefined); const event = await signal.promise; this.#require(); need(event !== null && this.#held?.event === event && this.#held.role === ROLES[index]); return event; }
  public async waitOriginalEnd(): Promise<CurrentSchematicRelevanceRunPrefixEnd> { const packet = await this.#end.promise; this.requireCompleted(packet); need(packet !== null); return packet; }
  public requireCompleted(packet: CurrentSchematicRelevanceRunPrefixEnd | null): void { this.#require(); need(packet !== null && packet === this.#completed && this.#index === 3 && this.#resume === null && !this.#reserved); }
  public fail(): void { this.#failed = true; this.#initial.resolve(false); this.#end.resolve(null); for (const signal of this.#heldSignals) { signal.resolve(null); } }
}
