/** A source-qualified instrumentation stop can service only V8 interrupt
 * commands. Transfer to the same first statement's ordinary breakpoint before
 * requesting main-thread DOM ancestry. This helper grants no source authority. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";

export type CurrentPcb209OwnershipStage = "initial-window" | "pcb-admission" | "pcb-release";
export interface CurrentPcb209OwnershipEntryPoint { readonly lineNumber: number; readonly columnNumber: number }
interface OwnerCommand { readonly sessionId: string; readonly ownershipStage: CurrentPcb209OwnershipStage }
export type CurrentPcb209OwnershipCommand =
  OwnerCommand & Readonly<{ method: "Debugger.setBreakpoint"; ownershipPhase: "arm";
    params: Readonly<{ location: Readonly<{ scriptId: string; lineNumber: number; columnNumber: number }> }> }> |
  OwnerCommand & Readonly<{ method: "Debugger.resume"; ownershipPhase: "enter"; params: Readonly<Record<string, never>> }> |
  OwnerCommand & Readonly<{ method: "Debugger.removeBreakpoint"; ownershipPhase: "remove"; params: Readonly<{ breakpointId: string }> }>;
type Request = (command: CurrentPcb209OwnershipCommand) => Promise<unknown>;
const token = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const location = z.object({ scriptId: token, lineNumber: z.number().int().min(0).max(65_535),
  columnNumber: z.number().int().min(0).max(1_048_575) }).strict();
const frame = z.looseObject({ functionName: z.string().max(256), url: z.string().max(8192),
  functionLocation: location, location });
const frames = z.array(frame).min(1).max(32);
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`PCB209_OWNERSHIP_BREAKPOINT_${code}`); } }
function stack(value: z.infer<typeof frames>): string {
  return JSON.stringify(value.map(item => ({ functionName: item.functionName, url: item.url,
    functionLocation: item.functionLocation, location: item.location })));
}
async function observeFailure(promise: Promise<unknown>): Promise<void> { try { await promise; } catch {
  // The original enter/remove caller reports failure; late allocation stays owned.
} }
async function bounded<T>(promise: Promise<T>): Promise<T> {
  const deadline = Promise.withResolvers<never>();
  const timer = setTimeout(() => { deadline.reject(new Error("PCB209_OWNERSHIP_BREAKPOINT_DEADLINE")); }, 2500);
  try { return await Promise.race([promise, deadline.promise]); } finally { clearTimeout(timer); }
}

export class CurrentPcb209OwnershipBreakpoint {
  readonly #stage: CurrentPcb209OwnershipStage;
  readonly #sessionId: string;
  readonly #entry: z.infer<typeof location>;
  readonly #stack: string;
  readonly #resumed = Promise.withResolvers<null>();
  readonly #ordinary = Promise.withResolvers<null>();
  #allocation: Promise<void> | null = null;
  #allocationUncertain = false;
  #breakpointId: string | null = null;
  #enterConsumed = false;
  #resumeConsumed = false;
  #resumeSeen = false;
  #ordinarySeen = false;
  #entered = false;
  #failed = false;
  #removal: Promise<void> | null = null;
  #removed = false;
  public constructor(stage: CurrentPcb209OwnershipStage, sessionId: string, instrumentationPause: unknown,
    entryPoint: CurrentPcb209OwnershipEntryPoint) {
    this.#stage = z.enum(["initial-window", "pcb-admission", "pcb-release"]).parse(stage); this.#sessionId = token.parse(sessionId);
    const pause = z.looseObject({ reason: z.literal("instrumentation"), data: z.looseObject({ scriptId: token }),
      hitBreakpoints: z.array(token).max(1), callFrames: frames }).parse(captureCurrentPcbStringClockReply(instrumentationPause).value);
    const point = location.omit({ scriptId: true }).parse(entryPoint);
    this.#entry = Object.freeze(location.parse({ scriptId: pause.data.scriptId, ...point }));
    need(stage === "pcb-admission" || this.#entry.lineNumber === 0 && this.#entry.columnNumber === 0, "FIXED_ENTRY");
    need(JSON.stringify(pause.callFrames[0]?.location) === JSON.stringify(this.#entry), "INITIAL_ENTRY");
    this.#stack = stack(pause.callFrames);
    void observeFailure(this.#resumed.promise); void observeFailure(this.#ordinary.promise);
  }
  public observe(event: DiagnosticEvent): boolean {
    if (!this.#resumeConsumed || this.#entered || this.#removed || !["Debugger.resumed", "Debugger.paused"].includes(event.method)) { return false; }
    try {
      need(event.sessionId === this.#sessionId, "EVENT_SESSION");
      const value = captureCurrentPcbStringClockReply(event.params).value;
      if (event.method === "Debugger.resumed") {
        need(!this.#resumeSeen && !this.#ordinarySeen, "DUPLICATE_RESUME"); z.object({}).strict().parse(value);
        this.#resumeSeen = true; this.#resumed.resolve(null);
      } else {
        need(this.#resumeSeen && !this.#ordinarySeen && this.#breakpointId !== null, "ORDINARY_SEQUENCE");
        const pause = z.looseObject({ reason: z.literal("other"), hitBreakpoints: z.tuple([z.literal(this.#breakpointId)]),
          callFrames: frames }).parse(value);
        need(stack(pause.callFrames) === this.#stack, "ORDINARY_STACK");
        this.#ordinarySeen = true; this.#ordinary.resolve(null);
      }
      return true;
    } catch (error) {
      this.#failed = true; this.#resumed.reject(error); this.#ordinary.reject(error); throw error;
    }
  }
  /** Source and original context must already be qualified by the calling owner.
   * Actual breakpoint allocation is retained even if the bounded wait expires. */
  public async enter(request: Request, assertCurrentIdentity: () => Promise<void>): Promise<void> {
    need(!this.#enterConsumed && !this.#failed, "ENTER_CONSUMED"); this.#enterConsumed = true;
    try {
      await bounded(assertCurrentIdentity()); this.#allocationUncertain = true;
      const raw = request({ method: "Debugger.setBreakpoint", ownershipStage: this.#stage, ownershipPhase: "arm",
        sessionId: this.#sessionId, params: { location: this.#entry } });
      this.#allocation = (async (): Promise<void> => {
        const value = captureCurrentPcbStringClockReply(await raw).value;
        // Retain the handle before checking the resolved location. A moved or
        // Malformed allocation must still be removed by the same owner.
        this.#breakpointId = z.looseObject({ breakpointId: token }).parse(value).breakpointId; this.#allocationUncertain = false;
        const allocated = z.object({ breakpointId: token, actualLocation: location }).strict().parse(value);
        need(JSON.stringify(allocated.actualLocation) === JSON.stringify(this.#entry), "ACTUAL_ENTRY");
      })(); void observeFailure(this.#allocation);
      await bounded(this.#allocation); need(!this.#failed, "FAILED"); await bounded(assertCurrentIdentity());
      this.#resumeConsumed = true;
      const resumed = await bounded(request({ method: "Debugger.resume", ownershipStage: this.#stage, ownershipPhase: "enter",
        sessionId: this.#sessionId, params: {} }));
      z.object({}).strict().parse(captureCurrentPcbStringClockReply(resumed).value);
      await bounded(this.#resumed.promise); await bounded(this.#ordinary.promise); await bounded(assertCurrentIdentity());
      need(!this.#failed && this.#ordinarySeen, "ORDINARY_REQUIRED"); this.#entered = true;
    } catch (error) { this.#failed = true; throw error; }
  }
  /** Removing the owned allocation grants no resume. The original window or
   * source owner retains the ordinary pause and its one final resume. */
  public async remove(request: Request): Promise<void> {
    if (this.#removed || !this.#enterConsumed) { return; }
    if (this.#allocation === null && !this.#allocationUncertain) { return; }
    if (this.#allocation !== null) {
      try { await bounded(this.#allocation); } catch {
        // A failed exact-location check can still leave a known owned handle.
      }
    }
    need(!this.#allocationUncertain && this.#breakpointId !== null, "UNRESOLVED_ALLOCATION");
    if (this.#removal === null) {
      const breakpointId = this.#breakpointId;
      this.#removal = (async (): Promise<void> => {
        const raw = await request({ method: "Debugger.removeBreakpoint", ownershipStage: this.#stage, ownershipPhase: "remove",
          sessionId: this.#sessionId, params: { breakpointId } });
        z.object({}).strict().parse(captureCurrentPcbStringClockReply(raw).value); this.#removed = true;
      })(); void observeFailure(this.#removal);
    }
    await bounded(this.#removal);
  }
  public status(): Readonly<Record<string, unknown>> { return Object.freeze({ stage: this.#stage, enterConsumed: this.#enterConsumed,
    allocationUncertain: this.#allocationUncertain, breakpointRetained: this.#breakpointId !== null, resumeConsumed: this.#resumeConsumed,
    resumeSeen: this.#resumeSeen, ordinaryPauseSeen: this.#ordinarySeen, entered: this.#entered, failed: this.#failed,
    removalConsumed: this.#removal !== null, removed: this.#removed, executionAuthorized: false }); }
}
