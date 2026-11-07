/** Same-cursor original readonly DB return. A copied row or callback cannot
 * manufacture this custody or authorize a worker/cache continuation. */
import { decodeCurrentGeneratedSyncCallee } from "./current-generated-initial-sync-replies.ts";
import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { CURRENT_PCB_VIA_MAIN_LIVE_HISTORY_FUNCTIONS as FUNCTIONS, CURRENT_PCB_VIA_MAIN_LIVE_HISTORY_SITE as SITE } from "./current-pcb-via-main-live-history-source.ts";
import { validateCurrentFootprintInverseMainHistoryCommand } from "./current-footprint-inverse-main-history-protocol.ts";
import type { CurrentFootprintInverseMainHistoryCommand as Command } from "./current-footprint-inverse-main-history-protocol.ts";
import type { CurrentPcbViaMainBeginPause } from "./current-pcb-via-main-begin-custody.ts";
import type { CurrentSelectedFileMainRequestObservation } from "./current-selected-file-main-request-reader.ts";
import type { CurrentFootprintInverseMainHistoryBaseline } from "./current-footprint-inverse-main-history-baseline.ts";

import { currentFootprintInverseMainHistoryValueSchema as valueSchema } from "./current-footprint-inverse-main-history-baseline.ts";

export type CurrentFootprintInverseMainHistoryRows = CurrentFootprintInverseMainHistoryBaseline;
export interface CurrentFootprintInverseMainHistoryHost {
  readonly scriptId: string; readonly sqlCaptureObjectId: string;
  readonly assertCurrent: () => void; readonly expected: () => CurrentFootprintInverseMainHistoryBaseline;
  readonly pause: () => CurrentPcbViaMainBeginPause; readonly pendingRequestId: () => number | null; readonly busy: () => boolean;
  readonly send: (command: Command, cleanup: boolean) => Promise<unknown>;
  readonly registerPoint: (id: string, location: Readonly<{ scriptId: string; lineNumber: number; columnNumber: number }>) => void;
  readonly removePoint: (id: string) => void; readonly pointCurrent: (id: string) => boolean;
  readonly resume: (identity: object, command: Command) => Promise<unknown>;
}
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), location = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const frameSchema = z.looseObject({ callFrameId: handle, functionName: z.string(), location, functionLocation: location });
const pausedSchema = z.looseObject({ reason: z.literal("other"), hitBreakpoints: z.tuple([handle]), callFrames: z.array(frameSchema).min(1).max(64) });
const propertyValue = z.looseObject({ type: z.string(), subtype: z.string().optional(), objectId: z.string().optional(), value: z.unknown().optional() });
const property = z.looseObject({ name: z.string(), value: propertyValue.optional() });
const internalValue = z.looseObject({ value: z.unknown().optional() }); const internalProperty = z.looseObject({ name: z.string(), value: internalValue });
const properties = z.looseObject({ result: z.array(property), internalProperties: z.array(internalProperty).optional() });
const byValue = z.strictObject({ result: z.strictObject({ type: z.literal("object"), value: z.unknown() }) });
const promiseMember = z.looseObject({ name: z.string(), value: propertyValue });
const promiseReply = z.strictObject({ result: z.array(property).max(32), internalProperties: z.array(promiseMember).length(3) });
const remote = z.strictObject({ result: z.looseObject({ type: z.literal("object"), subtype: z.literal("array"), objectId: handle, description: z.string().optional() }) });
function need(value: boolean, reason: string): asserts value { if (!value) { throw new Error(`FOOTPRINT_INVERSE_MAIN_HISTORY_${reason}`); } }
const order = ["arm", "frame", "join-capture", "properties-packet", "properties-promise", "join-resolved", "properties-projectSql", "properties-table", "properties-branches", "join-value", "remove", "step", "release"] as const;
export class CurrentFootprintInverseMainHistoryCustody {
  readonly #host: CurrentFootprintInverseMainHistoryHost;
  #stage = 0; #failed = false; #point: string | null = null; #frame: string | null = null; #capture: string | null = null;
  #requestCapture: string | null = null; #promise: string | null = null; #resolved: string | null = null;
  #expected: CurrentFootprintInverseMainHistoryBaseline | null = null; #value: CurrentFootprintInverseMainHistoryRows | null = null;
  readonly #functions = new Map<string, string>();
  #active: Readonly<{ command: Command; consumed: boolean }> | null = null;
  public constructor(host: CurrentFootprintInverseMainHistoryHost) { this.#host = host; Object.freeze(this); }
  #same(): void { need(!this.#failed, "FAILED"); this.#host.assertCurrent(); if (this.#expected !== null) { need(this.#host.expected() === this.#expected, "ORIGINAL_BASELINE"); } }
  public wantsReadonlyRequest(packet: CurrentSelectedFileMainRequestObservation): boolean {
    if (this.#stage !== 1 || this.#expected === null) { return false; } this.#same(); const effect = this.#expected;
    return packet.mode === "fetch" && packet.method === "GET" && packet.pathHeader === effect.projectUuid && packet.pureQuery === "" && packet.pureUrl === `/api/v4/projects/${effect.projectUuid}/branches/${effect.branchUuid}/histories/${effect.historyUuid}`;
  }
  public retainReadonlyRequest(packet: CurrentSelectedFileMainRequestObservation, capture: string): void {
    need(this.wantsReadonlyRequest(packet) && this.#requestCapture === null, "ONE_ORIGINAL_HISTORY_GET"); this.#requestCapture = handle.parse(capture);
  }
  public originalRequestObjectId(): string { this.#same(); need(this.#requestCapture !== null, "ORIGINAL_HISTORY_GET_REQUIRED"); return this.#requestCapture; }
  #held(): CurrentPcbViaMainBeginPause {
    const held = this.#host.pause(); const pause = pausedSchema.parse(captureCurrentPcbStringClockReply(held.raw).value); const first = pause.callFrames[0];
    need(first !== undefined && held.frameId === first.callFrameId && held.sqlSite === null && held.pendingEvents === 0 && !held.resumed && !held.resumeAttempted &&
      first.functionName === SITE.name && first.functionLocation.scriptId === this.#host.scriptId && first.functionLocation.lineNumber === SITE.lineNumber && first.functionLocation.columnNumber === SITE.functionColumn &&
      first.location.scriptId === this.#host.scriptId && first.location.lineNumber === SITE.lineNumber && first.location.columnNumber === SITE.columnNumber && pause.hitBreakpoints[0] === this.#point, "ORIGINAL_YB_RETURN"); return held;
  }
  #expect(command: Command): void {
    const suffix = command.phase.replace("inverse-main-history-", ""); const selected = "role" in command ? `${suffix}-${command.role}` : suffix;
    need(selected === order[this.#stage], "ONCE_ORDER");
    if (this.#stage === 0) { need(command.phase === "inverse-main-history-arm" && command.params.location.scriptId === this.#host.scriptId, "ORIGINAL_SCRIPT"); this.#expected = this.#host.expected(); return; }
    if (this.#stage < 12) { const held = this.#held(); if (this.#stage < 10) { need(this.#point !== null && this.#host.pointCurrent(this.#point), "CURRENT_POINT"); }
      if (command.phase === "inverse-main-history-frame") { need(command.params.callFrameId === held.frameId, "ORIGINAL_FRAME"); }
    }
    if (command.phase === "inverse-main-history-join") {
      if (command.role === "capture") { need(command.params.objectId === this.#frame && command.params.arguments[0]?.objectId === this.#host.sqlCaptureObjectId && command.params.arguments[1]?.objectId === this.originalRequestObjectId(), "ORIGINAL_DATABASE_CAPTURE"); }
      else { need(command.params.objectId === this.#capture && (command.role !== "resolved" || command.params.arguments[0]?.objectId === this.#resolved), "ORIGINAL_VALUE_PACKET"); }
    } else if (command.phase === "inverse-main-history-properties") {
      let expected: string | null | undefined;
      if (command.role === "packet") { expected = this.#capture; } else if (command.role === "promise") { expected = this.#promise; } else { expected = this.#functions.get(command.role); }
      need(command.params.objectId === expected, "ORIGINAL_MEMBER");
    }
    else if (command.phase === "inverse-main-history-remove") { need(command.params.breakpointId === this.#point, "ORIGINAL_REMOVE"); }
  }
  public consume(command: Command, requestId: number): void {
    this.#same(); const active = this.#active;
    need(active !== null && !active.consumed && canonicalJson(active.command) === canonicalJson(command) && this.#host.pendingRequestId() === requestId && this.#host.busy(), "ORIGINAL_PENDING_REQUEST");
    this.#active = { command: active.command, consumed: true };
  }
  public async request(input: Command, cleanup: boolean): Promise<unknown> {
    this.#same(); const command = validateCurrentFootprintInverseMainHistoryCommand(input);
    need(this.#active === null && cleanup === (command.phase === "inverse-main-history-remove" || command.phase === "inverse-main-history-release"), "REQUEST_LANE");
    try {
      this.#expect(command); this.#active = { command, consumed: false };
      const reply = captureCurrentPcbStringClockReply(await (command.phase === "inverse-main-history-step" ? this.#host.resume(this.#held().identity, command) : this.#host.send(command, cleanup))).value;
      need(this.#active.consumed, "NATIVE_WRITE_ACK"); this.#same();
      if (command.phase === "inverse-main-history-arm") { const allocated = z.strictObject({ breakpointId: handle, actualLocation: location }).parse(reply); need(canonicalJson(allocated.actualLocation) === canonicalJson(command.params.location), "EXACT_POINT"); this.#point = allocated.breakpointId; this.#host.registerPoint(allocated.breakpointId, allocated.actualLocation); }
      else if (command.phase === "inverse-main-history-frame") { this.#frame = remote.parse(reply).result.objectId; }
      else if (command.phase === "inverse-main-history-join") {
        if (command.role === "capture") { this.#capture = remote.parse(reply).result.objectId; }
        else if (command.role === "resolved") { z.strictObject({ result: z.strictObject({ type: z.literal("boolean"), value: z.literal(true) }) }).parse(reply); }
        else { const value = valueSchema.parse(byValue.parse(reply).result.value); const effect = this.#expected;
          need(effect !== null && value.projectUuid === effect.projectUuid && value.branchUuid === effect.branchUuid && value.historyUuid === effect.historyUuid && canonicalJson(value.rows) === canonicalJson(effect.rows), "ORIGINAL_SAVED_ROWS");
          for (const row of value.rows) { need(row.iv === row.uuid, "NATIVE_IV"); }
          need(value.rows[0]?.uuid === effect.historyUuid && value.rows[0].num === effect.rows[0]?.num && value.rows[0].key === effect.rows[0].key, "ORIGINAL_HEAD"); this.#value = freezeDeep(value);
        }
      } else if (command.phase === "inverse-main-history-properties") {
        const parsed = properties.parse(reply);
        if (command.role === "packet") { need(parsed.result.length === 11 && parsed.result.filter(item => item.name === "length").length === 1 && parsed.result.find(item => item.name === "length")?.value?.value === 10, "PACKET_MEMBERS");
          const promise = parsed.result.find(item => item.name === "8")?.value; need(promise?.type === "object" && promise.subtype === "promise" && typeof promise.objectId === "string", "ORIGINAL_DB_PROMISE"); this.#promise = handle.parse(promise.objectId);
          for (const [role, expected] of Object.entries(FUNCTIONS)) { const member = parsed.result.filter(item => item.name === String(expected.index)); need(member.length === 1 && member[0]?.value?.type === "function" && member[0].value.subtype === undefined && typeof member[0].value.objectId === "string", "ORIGINAL_FUNCTION_MEMBER"); this.#functions.set(role, handle.parse(member[0].value.objectId)); }
        } else if (command.role === "promise") {
          const original = promiseReply.parse(reply); const state = original.internalProperties.filter(item => item.name === "[[PromiseState]]"); const results = original.internalProperties.filter(item => item.name === "[[PromiseResult]]");
          need(state.length === 1 && results.length === 1 && original.internalProperties.filter(item => item.name === "[[Prototype]]").length === 1 && state[0]?.value.type === "string" && state[0].value.value === "fulfilled", "ORIGINAL_FULFILLED_DB_PROMISE");
          const result = results[0]?.value;
          need(result?.type === "object" && result.subtype === undefined && result.objectId !== undefined, "ORIGINAL_DB_PROMISE_RESULT"); this.#resolved = result.objectId;
        } else {
          decodeCurrentGeneratedSyncCallee(reply, FUNCTIONS[command.role], this.#host.scriptId);
        }
      } else { z.strictObject({}).parse(reply); if (command.phase === "inverse-main-history-remove") { need(this.#point !== null, "ORIGINAL_POINT"); this.#host.removePoint(this.#point); } }
      this.#stage += 1; return reply;
    } catch (caughtError) { this.#failed = true; throw caughtError; } finally { this.#active = null; }
  }
  public result(): CurrentFootprintInverseMainHistoryRows { this.#same(); need(this.#stage === order.length && this.#value !== null && this.#active === null, "ORIGINAL_COMPLETED_READ"); return this.#value; }
}
