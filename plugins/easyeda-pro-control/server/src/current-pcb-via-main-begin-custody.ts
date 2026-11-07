/** The original main backend alone retains this receipt ledger. Constructing
 * another ledger cannot enter its private native sender or consume its slot. */
import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_PCB_VIA_MAIN_BEGIN_CALLS as CALLS } from "./current-pcb-via-main-begin-programs.ts";
import { CURRENT_PCB_VIA_MAIN_BEGIN_REQUESTS as LIMITS, CURRENT_PCB_VIA_MAIN_BEGIN_SITES as SITES, CURRENT_PCB_VIA_MAIN_BEGIN_STEPS as STEPS, validateCurrentPcbViaMainBeginCommand } from "./current-pcb-via-main-begin-protocol.ts";
import type { CurrentPcbViaMainBeginCall as Call, CurrentPcbViaMainBeginCommand as Command, CurrentPcbViaMainBeginRole as Role } from "./current-pcb-via-main-begin-protocol.ts";
import type { CurrentSelectedProjectMainOrigin } from "./current-selected-project-main-origin.ts";
import { decodeCurrentFootprintCopyMainRequestArrayCapture as decodeArray } from "./current-footprint-copy-main-request-protocol.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), point = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const frame = z.looseObject({ callFrameId: handle, functionName: z.string(), location: point, functionLocation: point });
const pauseValue = z.looseObject({ reason: z.literal("other"), hitBreakpoints: z.tuple([handle]), callFrames: z.array(frame).min(1).max(64) });
export const currentPcbViaMainBeginResultSchema = z.strictObject({ schema: z.literal("private.current-pcb-via-main-begin-result.v1"), originalNativeCallbackSucceeded: z.literal(true), originalBeginAwaitCompleted: z.literal(true), transactionDepth: z.literal(1), historySqlCompleted: z.literal(false), furtherSelectedSqlAuthorized: z.literal(false), persistenceVerified: z.literal(false) });
export type CurrentPcbViaMainBeginResult = Readonly<z.infer<typeof currentPcbViaMainBeginResultSchema>>;
export interface CurrentPcbViaMainBeginPause { readonly identity: object; readonly frameId: string; readonly raw: unknown; readonly sqlSite: string | null; readonly pendingEvents: number; readonly resumed: boolean; readonly resumeAttempted: boolean }
export interface CurrentPcbViaMainBeginHost {
  readonly origin: CurrentSelectedProjectMainOrigin; readonly scriptId: string; readonly captureObjectId: string;
  readonly assertCurrent: () => void;
  readonly actorSql: () => Readonly<{ actorObjectId: string; sqlObjectId: string; dataStr: string }>;
  readonly pause: () => CurrentPcbViaMainBeginPause;
  readonly pendingRequestId: () => number | null;
  readonly busy: () => boolean;
  readonly send: (command: Command, cleanup: boolean) => Promise<unknown>;
  readonly resume: (pause: object, command: Command) => Promise<unknown>;
  readonly registerPoint: (id: string, location: z.infer<typeof point>) => void;
  readonly pointCurrent: (id: string) => boolean;
  readonly removePoint: (id: string) => void;
}
const resultReply = z.strictObject({ result: z.strictObject({ type: z.literal("object"), value: currentPcbViaMainBeginResultSchema }) });
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`PCB_VIA_BEGIN_CUSTODY_${code}`); } }
export interface CurrentPcbViaMainCallbackLoan { readonly identity: object; readonly breakpointId: string }
export class CurrentPcbViaMainBeginCustody {
  readonly #host: CurrentPcbViaMainBeginHost;
  readonly #points = new Map<Role, string>(); readonly #frames = new Map<Call, string>(); readonly #packets = new Map<Call, string>();
  #transferred = false; #callbackLoan: CurrentPcbViaMainCallbackLoan | null = null; #callbackLoanConsumed = false;
  #normal = 0; #cleanup = 0; #step = 0; #failed = false;
  #actor: ReturnType<CurrentPcbViaMainBeginHost["actorSql"]> | null = null;
  #pending: Readonly<{ pause: object; role: typeof STEPS[number]; dataStr: string }> | null = null;
  #consumed = false; #result: CurrentPcbViaMainBeginResult | null = null;
  public constructor(host: CurrentPcbViaMainBeginHost) { this.#host = host; Object.freeze(this); }
  #same(): void { need(!this.#failed, "FAILED"); this.#host.assertCurrent(); }
  #pointsCurrent(): void { need([...this.#points.values()].every(id => this.#host.pointCurrent(id)), "CURRENT_SOURCE_POINTS"); }
  public requireArmed(): void { this.#same(); this.#pointsCurrent(); need(this.#callbackLoan === null && this.#points.size === 4 && this.#step === 0 && this.#normal === 4 && this.#cleanup === 0, "PRE_SAVE_ENROLLMENT"); }
  #held(role: Call): CurrentPcbViaMainBeginPause {
    const held = this.#host.pause(); const raw = pauseValue.parse(captureCurrentPcbStringClockReply(held.raw).value); const first = raw.callFrames[0];
    need(first !== undefined && held.pendingEvents === 0 && !held.resumed && !held.resumeAttempted && first.callFrameId === held.frameId && first.location.scriptId === this.#host.scriptId, "LIVE_DELIVERED_PAUSE");
    if (role === "run") { need(held.sqlSite === "run" && first.functionName === "" && raw.callFrames.some(item => item.functionName === "begin" && item.functionLocation.scriptId === this.#host.scriptId && item.functionLocation.lineNumber === 1025 && item.functionLocation.columnNumber === 2040) && raw.callFrames.some(item => item.functionName === "inTransaction" && item.functionLocation.scriptId === this.#host.scriptId && item.functionLocation.lineNumber === 1025 && item.functionLocation.columnNumber === 2514) && first.location.lineNumber === 1025 && first.location.columnNumber === 875 && first.functionLocation.scriptId === this.#host.scriptId && first.functionLocation.lineNumber === 1025 && first.functionLocation.columnNumber === 859, "ORIGINAL_RAW_RUN"); }
    else { const site = SITES[role]; need(held.sqlSite === null && raw.hitBreakpoints[0] === this.#points.get(role) && first.functionName === site.name && first.location.lineNumber === site.lineNumber && first.location.columnNumber === site.columnNumber && first.functionLocation.scriptId === this.#host.scriptId && first.functionLocation.lineNumber === site.functionLine && first.functionLocation.columnNumber === site.functionColumn, "ORIGINAL_SOURCE_PAUSE"); }
    return held;
  }
  public async request(input: Command, cleanup: boolean): Promise<unknown> {
    this.#same(); need(!this.#transferred, "HISTORY_TRANSFERRED"); need(this.#callbackLoan === null, "STRUCTURE_CALLBACK_BORROWED"); const command = validateCurrentPcbViaMainBeginCommand(input);
    try {
      if (cleanup) { this.#cleanup += 1; need(command.phase === "via-main-begin-remove" && this.#cleanup <= LIMITS.cleanup && this.#result !== null, "CLEANUP"); }
      else { this.#normal += 1; need(command.phase !== "via-main-begin-remove" && this.#normal <= LIMITS.normal, "NORMAL_BOUND"); }
      if (command.phase === "via-main-begin-step") { return await this.#advance(command); }
      if (command.phase === "via-main-begin-arm") { need(this.#step === 0 && this.#actor === null && !this.#points.has(command.role) && command.params.location.scriptId === this.#host.scriptId, "ARM_CONSUMED"); }
      else if (command.phase === "via-main-begin-frame") { const held = this.#held(command.role); need(this.#step === ({ save: 1, transaction: 2, run: 3, callback: 4, returned: 5 }[command.role]) && !this.#frames.has(command.role) && command.params.callFrameId === held.frameId, "ORIGINAL_FRAME"); }
      else if (command.phase === "via-main-begin-join") {
        this.#held(command.role); need(this.#frames.get(command.role) === command.params.objectId && !this.#packets.has(command.role) && (command.role !== "returned" || this.#result === null), "ORIGINAL_FRAME_PACKET");
        let expected: readonly string[];
        if (command.role === "save") { need(this.#actor !== null, "ACTOR_REQUIRED"); expected = [this.#actor.actorObjectId, this.#actor.sqlObjectId]; }
        else if (command.role === "transaction") { expected = [this.#packet("save")]; }
        else if (command.role === "run") { expected = [this.#host.captureObjectId, this.#packet("transaction")]; }
        else if (command.role === "callback") { expected = [this.#packet("run")]; }
        else { expected = [this.#packet("callback")]; }
        need(canonicalJson(command.params.arguments.map(item => item.objectId)) === canonicalJson(expected), "ORIGINAL_ARGUMENTS");
      } else { need(this.#points.get(command.role) === command.params.breakpointId, "ORIGINAL_POINT"); }
      const reply = await this.#host.send(command, cleanup); this.#same();
      if (command.phase === "via-main-begin-arm") { const result = z.strictObject({ breakpointId: handle, actualLocation: point }).parse(reply); need(![...this.#points.values()].includes(result.breakpointId) && canonicalJson(result.actualLocation) === canonicalJson(command.params.location), "ARM_REPLY"); this.#host.registerPoint(result.breakpointId, result.actualLocation); this.#points.set(command.role, result.breakpointId); }
      else if (command.phase === "via-main-begin-frame") { const length = { save: 4, transaction: 2, run: 7, callback: 8, returned: 2 }[command.role]; this.#frames.set(command.role, decodeArray(reply, length)); }
      else if (command.phase === "via-main-begin-join") { if (command.role === "returned") { this.#result = Object.freeze(resultReply.parse(reply).result.value); } else { this.#packets.set(command.role, decodeArray(reply, CALLS[command.role].length)); } }
      else if (command.phase === "via-main-begin-remove") { z.strictObject({}).parse(reply); this.#host.removePoint(command.params.breakpointId); }
      return reply;
    } catch (error) { this.#failed = true; throw error; }
  }
  #packet(role: Call): string { const value = this.#packets.get(role); need(value !== undefined, "PRIOR_PACKET"); return value; }
  async #advance(command: Extract<Command, { phase: "via-main-begin-step" }>): Promise<unknown> {
    this.#pointsCurrent(); need(this.#pending === null && command.role === STEPS[this.#step], "STEP_CONSUMED"); let held: CurrentPcbViaMainBeginPause;
    if (command.role === "actor") { need(this.#points.size === 4 && this.#normal === 5, "PRE_SAVE_POINTS_REQUIRED"); this.#actor = this.#host.actorSql(); held = this.#host.pause(); need(!held.resumed && !held.resumeAttempted && held.pendingEvents === 0, "ORIGINAL_PB_HELD"); }
    else { this.#packet(command.role); held = this.#held(command.role); }
    need(this.#actor !== null, "ACTOR_REQUIRED"); this.#step += 1; this.#pending = Object.freeze({ pause: held.identity, role: command.role, dataStr: this.#actor.dataStr }); this.#consumed = false;
    const reply = await this.#host.resume(held.identity, command); this.#same(); need(this.#consumed, "NATIVE_GRANT_NOT_CONSUMED"); z.strictObject({}).parse(reply); this.#pending = null; return reply;
  }
  public consume(command: Command, requestId: number): Readonly<{ origin: CurrentSelectedProjectMainOrigin; dataStr: string; nativeSql: boolean }> {
    this.#same(); this.#pointsCurrent(); const pending = this.#pending; const held = this.#host.pause();
    need(command.phase === "via-main-begin-step" && pending !== null && !this.#consumed && this.#host.busy() && this.#host.pendingRequestId() === requestId && command.role === pending.role && held.identity === pending.pause && held.resumeAttempted && !held.resumed, "ORIGINAL_PENDING_NATIVE_GRANT");
    this.#consumed = true; return Object.freeze({ origin: this.#host.origin, dataStr: pending.dataStr, nativeSql: command.role === "run" });
  }
  /** One actual prehistory operation may temporarily use the same installed
   * point. It must return this exact lease before BEGIN can enter any source. */
  public lendOriginalCallbackBeforeBegin(): CurrentPcbViaMainCallbackLoan {
    this.requireArmed(); need(!this.#callbackLoanConsumed, "STRUCTURE_CALLBACK_LOAN_CONSUMED"); const breakpointId = this.#points.get("callback"); need(breakpointId !== undefined, "ORIGINAL_CALLBACK_POINT");
    this.#callbackLoanConsumed = true; this.#callbackLoan = Object.freeze({ identity: Object.freeze({}), breakpointId }); return this.#callbackLoan;
  }
  public returnOriginalCallbackBeforeBegin(loan: CurrentPcbViaMainCallbackLoan): void {
    this.#same(); this.#pointsCurrent(); need(this.#callbackLoan === loan && this.#points.get("callback") === loan.breakpointId && this.#step === 0 && this.#normal === 4 && this.#pending === null && !this.#transferred, "STRUCTURE_CALLBACK_ORIGINAL_LOAN"); this.#callbackLoan = null;
  }
  /** Synchronous one-use transfer while the original begin return is still
   * held. Only this backend's successor ledger receives these retained IDs. */
  public consumeHistoryHandoff(): Readonly<{ origin: CurrentSelectedProjectMainOrigin; actorObjectId: string; sqlObjectId: string; saveObjectId: string; transactionObjectId: string; callbackBreakpointId: string; dataStr: string }> {
    need(this.#result !== null && this.#actor !== null && !this.#transferred, "HISTORY_TRANSFER_CONSUMED"); this.requireResult(this.#result); const callbackBreakpointId = this.#points.get("callback"); need(callbackBreakpointId !== undefined, "ORIGINAL_CALLBACK_POINT"); this.#transferred = true; this.#points.delete("callback");
    return Object.freeze({ origin: this.#host.origin, actorObjectId: this.#actor.actorObjectId, sqlObjectId: this.#actor.sqlObjectId, saveObjectId: this.#packet("save"), transactionObjectId: this.#packet("transaction"), callbackBreakpointId, dataStr: this.#actor.dataStr });
  }
  public result(): CurrentPcbViaMainBeginResult { need(this.#result !== null, "RESULT_REQUIRED"); this.requireResult(this.#result); return this.#result; }
  public requireResult(packet: CurrentPcbViaMainBeginResult): void { this.#same(); need(!this.#transferred && this.#result === packet && this.#step === 5 && this.#pending === null && this.#normal === LIMITS.normal, "ORIGINAL_RESULT"); this.#held("returned"); }
}
