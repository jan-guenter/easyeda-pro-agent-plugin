/** Per-channel sequencing for three source-owner-selected ordinary stops.
 * Coordinates and pause identity are bound to original channel observations;
 * full source and DOM qualification remain the calling owner's responsibility.
 */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";
import type { CurrentPcb209OwnershipCommand, CurrentPcb209OwnershipStage } from "./current-pcb-209-ratline-ownership-breakpoint.ts";

type BaseKind = "initial-window" | "pcb-bootstrap";
interface Context {
  readonly role: string; readonly sessionId: string; readonly sources: number; readonly resumes: number;
  readonly scriptId: string | null; readonly pausedKind: string | undefined;
  readonly initialScriptId: string | null; readonly initialSourceQualified: boolean;
}
const token = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const location = z.object({ scriptId: token, lineNumber: z.number().int().min(0).max(65_535), columnNumber: z.number().int().min(0).max(1_048_575) }).strict();
const frames = z.array(z.looseObject({ functionName: z.string(), url: z.string(), functionLocation: location, location })).min(1).max(32);
interface StageState {
  readonly stage: CurrentPcb209OwnershipStage; readonly baseKind: BaseKind; readonly sessionId: string;
  readonly entry: z.infer<typeof location>; readonly stack: string;
  breakpointId: string | null; armQualified: boolean; enterConsumed: boolean; enterQualified: boolean;
  resumed: boolean; ordinary: boolean; removeConsumed: boolean; removed: boolean;
}
function need(value: boolean): asserts value { if (!value) { throw new Error("PCB209_RATLINE_OWNERSHIP_SEQUENCE"); } }
function stack(value: z.infer<typeof frames>): string {
  return JSON.stringify(value.map(item => ({ functionName: item.functionName, url: item.url, functionLocation: item.functionLocation, location: item.location })));
}
export class CurrentPcb209RatlineOwnershipChannel {
  readonly #states = new Map<CurrentPcb209OwnershipStage, StageState>();
  readonly #instrumentation = new Map<string, unknown>();
  #state(stage: CurrentPcb209OwnershipStage): StageState {
    const value = this.#states.get(stage); need(value !== undefined); return value;
  }
  #active(sessionId: string): StageState {
    const values = [...this.#states.values()].filter(state => state.sessionId === sessionId && !state.removed);
    need(values.length === 1 && values[0] !== undefined); return values[0];
  }
  public check(command: CurrentPcb209OwnershipCommand, context: Context): void {
    need(context.role === "pcb" && command.sessionId === context.sessionId);
    const stage = command.ownershipStage;
    if (command.ownershipPhase === "arm") {
      need(!this.#states.has(stage) && [...this.#states.values()].every(state => state.removed));
      if (stage === "initial-window") {
        need(context.sources === 0 && context.resumes === 0 && context.initialSourceQualified && context.initialScriptId === command.params.location.scriptId && context.pausedKind === "initial-window");
      } else {
        const ordinal = stage === "pcb-admission" ? 0 : 28;
        need(context.sources === ordinal + 1 && context.resumes === ordinal && context.scriptId === command.params.location.scriptId && context.pausedKind === "pcb-bootstrap");
        if (stage === "pcb-release") { need(this.#states.get("pcb-admission")?.removed === true); }
      }
      const entry = location.parse(command.params.location), original = frames.parse(this.#instrumentation.get(command.sessionId));
      need(original !== undefined && JSON.stringify(original[0]?.location) === JSON.stringify(entry));
      need(stage === "pcb-admission" || entry.lineNumber === 0 && entry.columnNumber === 0);
      return;
    }
    const state = this.#state(stage); need(state.sessionId === command.sessionId && !state.removed);
    if (command.ownershipPhase === "enter") {
      need(state.armQualified && !state.enterConsumed && context.pausedKind === state.baseKind);
    } else {
      need(state.enterQualified && state.resumed && state.ordinary && !state.removeConsumed &&
        context.pausedKind === "ownership" && command.params.breakpointId === state.breakpointId);
    }
  }
  public checkCleanupRemoval(command: CurrentPcb209OwnershipCommand): void {
    const state = this.#state(command.ownershipStage);
    need(command.ownershipPhase === "remove" && state.sessionId === command.sessionId &&
      command.params.breakpointId === state.breakpointId && !state.removeConsumed && !state.removed);
  }
  public consume(command: CurrentPcb209OwnershipCommand): void {
    if (command.ownershipPhase === "arm") {
      const original = frames.parse(this.#instrumentation.get(command.sessionId));
      this.#states.set(command.ownershipStage, { stage: command.ownershipStage, baseKind: command.ownershipStage === "initial-window" ? "initial-window" : "pcb-bootstrap",
        sessionId: command.sessionId, entry: Object.freeze(location.parse(command.params.location)), stack: stack(original), breakpointId: null,
        armQualified: false, enterConsumed: false, enterQualified: false, resumed: false, ordinary: false, removeConsumed: false, removed: false });
    } else if (command.ownershipPhase === "enter") { this.#state(command.ownershipStage).enterConsumed = true; }
    else { this.#state(command.ownershipStage).removeConsumed = true; }
  }
  public reply(command: CurrentPcb209OwnershipCommand, result: unknown): BaseKind | null {
    const state = this.#state(command.ownershipStage), value = captureCurrentPcbStringClockReply(result).value;
    if (command.ownershipPhase === "arm") {
      state.breakpointId = z.looseObject({ breakpointId: token }).parse(value).breakpointId;
      const actual = z.object({ breakpointId: token, actualLocation: location }).strict().safeParse(value);
      // Keep malformed/moved allocations available to the original cleanup.
      state.armQualified = actual.success && JSON.stringify(actual.data.actualLocation) === JSON.stringify(state.entry);
    } else {
      z.object({}).strict().parse(value);
      if (command.ownershipPhase === "enter") { state.enterQualified = true; }
      else { state.removed = true; return state.baseKind; }
    }
    return null;
  }
  public observeInstrumentation(event: DiagnosticEvent): void {
    if (event.method !== "Debugger.paused" || event.params["reason"] !== "instrumentation" || event.sessionId === undefined) { return; }
    this.#instrumentation.set(event.sessionId, structuredClone(event.params["callFrames"]));
  }
  public observeOrdinary(event: DiagnosticEvent): void {
    need(event.sessionId !== undefined); const state = this.#active(event.sessionId);
    need(state.enterConsumed && state.resumed && !state.ordinary && state.breakpointId !== null);
    const pause = z.looseObject({ reason: z.literal("other"), hitBreakpoints: z.tuple([z.literal(state.breakpointId)]), callFrames: frames }).parse(event.params);
    need(stack(pause.callFrames) === state.stack); state.ordinary = true;
  }
  public observeEnterResume(sessionId: string): void {
    const state = this.#active(sessionId); need(state.enterConsumed && !state.resumed && !state.ordinary); state.resumed = true;
  }
  public assertDomReady(): void { need([...this.#states.values()].every(state => state.removed || state.ordinary)); }
  public assertFinalResume(stage: CurrentPcb209OwnershipStage): void { need(this.#state(stage).removed); }
  public assertNoPending(): void { need([...this.#states.values()].every(state => state.removed)); }
}
