/** Same-cursor original readonly DB return. A copied row or callback cannot
 * manufacture this custody or authorize a worker/cache continuation. */
import { decodeCurrentGeneratedSyncCallee } from "./current-generated-initial-sync-replies.ts";
import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { CURRENT_PCB_VIA_MAIN_LIVE_HISTORY_FUNCTIONS as FUNCTIONS, CURRENT_PCB_VIA_MAIN_LIVE_HISTORY_SITE as SITE } from "./current-pcb-via-main-live-history-source.ts";
import { validateCurrentPcbViaMainLiveHistoryCommand } from "./current-pcb-via-main-live-history-protocol.ts";
import type { CurrentPcbViaMainLiveHistoryCommand as Command } from "./current-pcb-via-main-live-history-protocol.ts";
import type { CurrentPcbViaMainBeginPause } from "./current-pcb-via-main-begin-custody.ts";
import type { CurrentProjectHistorySqlEffects } from "./current-project-history-sql-effects.ts";

const uuid = z.string().regex(/^[a-f\d]{32}$/u); const time = z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/u);
export const currentPcbViaMainLiveHistoryRowSchema = z.strictObject({ id: z.number().int().positive().max(2), uuid, parent: uuid.nullable(), key: uuid,
  is_lock: z.literal(0), num: z.union([z.literal(0), z.literal(1)]), snapshot_num: z.literal(0), created_at: time, updated_at: time, lock_time: time, iv: uuid });
const valueSchema = z.strictObject({ projectUuid: z.string().regex(/^[a-f\d]{64}$/u), branchUuid: uuid, historyUuid: uuid, rows: z.array(currentPcbViaMainLiveHistoryRowSchema).min(1).max(2) });
export type CurrentPcbViaMainLiveHistoryRows = Readonly<z.infer<typeof valueSchema>>;
export interface CurrentPcbViaMainLiveHistoryHost {
  readonly scriptId: string; readonly sqlCaptureObjectId: string; readonly originalSqlObjectId: () => string;
  readonly assertCurrent: () => void; readonly effects: () => CurrentProjectHistorySqlEffects;
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
const remote = z.strictObject({ result: z.looseObject({ type: z.literal("object"), subtype: z.literal("array"), objectId: handle, description: z.string().optional() }) });
function need(value: boolean, reason: string): asserts value { if (!value) { throw new Error(`PCB_VIA_MAIN_LIVE_${reason}`); } }
const order = ["arm", "frame", "join-capture", "properties-packet", "properties-projectSql", "properties-table", "properties-branches", "join-value", "remove", "step", "release"] as const;
export class CurrentPcbViaMainLiveHistoryCustody {
  readonly #host: CurrentPcbViaMainLiveHistoryHost;
  #stage = 0; #failed = false; #point: string | null = null; #frame: string | null = null; #capture: string | null = null;
  #effects: CurrentProjectHistorySqlEffects | null = null; #value: CurrentPcbViaMainLiveHistoryRows | null = null;
  readonly #functions = new Map<string, string>();
  #active: Readonly<{ command: Command; consumed: boolean }> | null = null;
  public constructor(host: CurrentPcbViaMainLiveHistoryHost) { this.#host = host; Object.freeze(this); }
  #same(): void { need(!this.#failed, "FAILED"); this.#host.assertCurrent(); if (this.#effects !== null) { need(this.#host.effects() === this.#effects, "ORIGINAL_EFFECTS"); } }
  #held(): CurrentPcbViaMainBeginPause {
    const held = this.#host.pause(); const pause = pausedSchema.parse(captureCurrentPcbStringClockReply(held.raw).value); const first = pause.callFrames[0];
    need(first !== undefined && held.frameId === first.callFrameId && held.sqlSite === null && held.pendingEvents === 0 && !held.resumed && !held.resumeAttempted &&
      first.functionName === SITE.name && first.functionLocation.scriptId === this.#host.scriptId && first.functionLocation.lineNumber === SITE.lineNumber && first.functionLocation.columnNumber === SITE.functionColumn &&
      first.location.scriptId === this.#host.scriptId && first.location.lineNumber === SITE.lineNumber && first.location.columnNumber === SITE.columnNumber && pause.hitBreakpoints[0] === this.#point, "ORIGINAL_YB_RETURN"); return held;
  }
  #expect(command: Command): void {
    const suffix = command.phase.replace("via-main-live-", ""); const selected = "role" in command ? `${suffix}-${command.role}` : suffix;
    need(selected === order[this.#stage], "ONCE_ORDER");
    if (this.#stage === 0) { need(command.phase === "via-main-live-arm" && command.params.location.scriptId === this.#host.scriptId, "ORIGINAL_SCRIPT"); this.#effects = this.#host.effects(); return; }
    if (this.#stage < 10) { const held = this.#held(); if (this.#stage < 8) { need(this.#point !== null && this.#host.pointCurrent(this.#point), "CURRENT_POINT"); }
      if (command.phase === "via-main-live-frame") { need(command.params.callFrameId === held.frameId, "ORIGINAL_FRAME"); }
    }
    if (command.phase === "via-main-live-join") {
      if (command.role === "capture") { need(command.params.objectId === this.#frame && command.params.arguments[0]?.objectId === this.#host.sqlCaptureObjectId && command.params.arguments[1]?.objectId === this.#host.originalSqlObjectId(), "ORIGINAL_DATABASE_CAPTURE"); }
      else { need(command.params.objectId === this.#capture, "ORIGINAL_VALUE_PACKET"); }
    } else if (command.phase === "via-main-live-properties") { need(command.params.objectId === (command.role === "packet" ? this.#capture : this.#functions.get(command.role)), "ORIGINAL_MEMBER"); }
    else if (command.phase === "via-main-live-remove") { need(command.params.breakpointId === this.#point, "ORIGINAL_REMOVE"); }
  }
  public consume(command: Command, requestId: number): void {
    this.#same(); const active = this.#active;
    need(active !== null && !active.consumed && canonicalJson(active.command) === canonicalJson(command) && this.#host.pendingRequestId() === requestId && this.#host.busy(), "ORIGINAL_PENDING_REQUEST");
    this.#active = { command: active.command, consumed: true };
  }
  public async request(input: Command, cleanup: boolean): Promise<unknown> {
    this.#same(); const command = validateCurrentPcbViaMainLiveHistoryCommand(input);
    need(this.#active === null && cleanup === (command.phase === "via-main-live-remove" || command.phase === "via-main-live-release"), "REQUEST_LANE");
    try {
      this.#expect(command); this.#active = { command, consumed: false };
      const reply = captureCurrentPcbStringClockReply(await (command.phase === "via-main-live-step" ? this.#host.resume(this.#held().identity, command) : this.#host.send(command, cleanup))).value;
      need(this.#active.consumed, "NATIVE_WRITE_ACK"); this.#same();
      if (command.phase === "via-main-live-arm") { const allocated = z.strictObject({ breakpointId: handle, actualLocation: location }).parse(reply); need(canonicalJson(allocated.actualLocation) === canonicalJson(command.params.location), "EXACT_POINT"); this.#point = allocated.breakpointId; this.#host.registerPoint(allocated.breakpointId, allocated.actualLocation); }
      else if (command.phase === "via-main-live-frame") { this.#frame = remote.parse(reply).result.objectId; }
      else if (command.phase === "via-main-live-join") {
        if (command.role === "capture") { this.#capture = remote.parse(reply).result.objectId; }
        else { const value = valueSchema.parse(byValue.parse(reply).result.value); const effect = this.#effects;
          need(effect !== null && value.projectUuid === effect.projectUuid && value.branchUuid === effect.branchUuid && value.historyUuid === effect.historyUuid && value.rows.length === (effect.mode === "append" ? 2 : 1), "ORIGINAL_EFFECT_SCOPE");
          for (const row of value.rows) { need(row.iv === row.uuid, "NATIVE_IV"); }
          need(value.rows[0]?.uuid === effect.historyUuid && value.rows[0].num === effect.historyNum && value.rows[0].key === effect.keyHex, "ORIGINAL_HEAD"); this.#value = freezeDeep(value);
        }
      } else if (command.phase === "via-main-live-properties") {
        const parsed = properties.parse(reply);
        if (command.role === "packet") { need(parsed.result.length === 9 && parsed.result.filter(item => item.name === "length").length === 1 && parsed.result.find(item => item.name === "length")?.value?.value === 8, "PACKET_MEMBERS");
          for (const [role, expected] of Object.entries(FUNCTIONS)) { const member = parsed.result.filter(item => item.name === String(expected.index)); need(member.length === 1 && member[0]?.value?.type === "function" && member[0].value.subtype === undefined && typeof member[0].value.objectId === "string", "ORIGINAL_FUNCTION_MEMBER"); this.#functions.set(role, handle.parse(member[0].value.objectId)); }
        } else {
          decodeCurrentGeneratedSyncCallee(reply, FUNCTIONS[command.role], this.#host.scriptId);
        }
      } else { z.strictObject({}).parse(reply); if (command.phase === "via-main-live-remove") { need(this.#point !== null, "ORIGINAL_POINT"); this.#host.removePoint(this.#point); } }
      this.#stage += 1; return reply;
    } catch (caughtError) { this.#failed = true; throw caughtError; } finally { this.#active = null; }
  }
  public result(): CurrentPcbViaMainLiveHistoryRows { this.#same(); need(this.#stage === order.length && this.#value !== null && this.#active === null, "ORIGINAL_COMPLETED_READ"); return this.#value; }
}
