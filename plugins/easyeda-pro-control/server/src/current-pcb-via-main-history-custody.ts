/** Original Via history receipt custody. The native owner reaches only the
 * instance privately retained by its same selected-file backend cursor. */
/* oxlint-disable import/max-dependencies -- Join the original BEGIN handoff, exact SQL/cipher/source leaves and independent native callback receipts without an injectable issuer. */
import { z } from "zod";
import { canonicalJson, sha256Text } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { decodeNativeHistoryChunk } from "./native-history.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { decodeCurrentFootprintCopyMainRequestArrayCapture as decodeArray } from "./current-footprint-copy-main-request-protocol.ts";
import { decodeCurrentFootprintCopyMainCompletionCallback as decodeCallback, decodeCurrentFootprintCopyMainCompletionCallbackMetadata as decodeCallbackMetadata } from "./current-footprint-copy-main-completion-protocol.ts";
import { CURRENT_PROJECT_HISTORY_MAIN_PROGRAMS as PROGRAMS } from "./current-project-history-main-programs.ts";
import type { CurrentProjectHistorySqlEffects, CurrentProjectHistorySqlNativeCallback } from "./current-project-history-sql-effects.ts";
import { CURRENT_PCB_VIA_MAIN_HISTORY_REQUESTS as LIMITS, CURRENT_PCB_VIA_MAIN_HISTORY_SITES as SITES, CURRENT_PCB_VIA_MAIN_HISTORY_SLOTS as SLOTS, CURRENT_PCB_VIA_MAIN_HISTORY_STEPS as STEPS, currentPcbViaMainHistoryFrame, validateCurrentPcbViaMainHistoryCommand } from "./current-pcb-via-main-history-protocol.ts";
import type { CurrentPcbViaMainHistoryCommand as Command, CurrentPcbViaMainHistoryFrameRole as FrameRole, CurrentPcbViaMainHistoryProgramRole as ProgramRole, CurrentPcbViaMainHistoryRole as Role, CurrentPcbViaMainHistorySlot as Slot } from "./current-pcb-via-main-history-protocol.ts";
import type { CurrentPcbViaMainHistoryNativeWindow } from "./current-pcb-via-main-history-ack.ts";
import type { CurrentGeneratedProjectHistorySqlBaseline } from "./current-generated-project-history-sql-baseline.ts";
import { currentGeneratedProjectHistorySqlBaselineSchema } from "./current-generated-project-history-sql-baseline.ts";
import type { CurrentPcbViaMainBeginPause } from "./current-pcb-via-main-begin-custody.ts";
import type { CurrentPcbViaMainOrigin } from "./current-pcb-via-main-origin.ts";

type Step = typeof STEPS[number];
export interface CurrentPcbViaMainHistoryHandoff { readonly origin: CurrentPcbViaMainOrigin; readonly actorObjectId: string; readonly sqlObjectId: string; readonly saveObjectId: string; readonly transactionObjectId: string; readonly callbackBreakpointId: string; readonly dataStr: string }
export interface CurrentPcbViaMainHistoryHost {
  readonly origin: CurrentPcbViaMainOrigin; readonly scriptId: string; readonly captureObjectId: string;
  readonly assertCurrent: () => void; readonly baseline: () => CurrentGeneratedProjectHistorySqlBaseline;
  readonly handoff: () => CurrentPcbViaMainHistoryHandoff;
  readonly actorValue: () => Readonly<{ uuid: string; username: string; nickname: string; updateTime: number }>;
  readonly pause: () => CurrentPcbViaMainBeginPause; readonly pendingRequestId: () => number | null; readonly busy: () => boolean;
  readonly send: (command: Command, cleanup: boolean) => Promise<unknown>; readonly resume: (identity: object, command: Command) => Promise<unknown>;
  readonly registerPoint: (id: string, location: Readonly<{ scriptId: string; lineNumber: number; columnNumber: number }>) => void;
  readonly pointCurrent: (id: string) => boolean; readonly removePoint: (id: string) => void;
}
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), uuid = z.string().regex(/^[a-f\d]{32}$/u);
const point = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const frame = z.looseObject({ callFrameId: handle, functionName: z.string(), location: point, functionLocation: point });
const pauseSchema = z.looseObject({ reason: z.literal("other"), hitBreakpoints: z.tuple([handle]), callFrames: z.array(frame).min(1).max(64) });
const branchValueSchema = z.strictObject({ mode: z.enum(["append", "mutable"]), branch: currentGeneratedProjectHistorySqlBaselineSchema.shape.branch,
  head: currentGeneratedProjectHistorySqlBaselineSchema.shape.head, withinOneMinute: z.union([z.literal(0), z.literal(1)]) });
const hexPart = z.string().min(2).max(8192).regex(/^(?:[a-f\d]{2})+$/u), hexParts = z.array(hexPart).min(1).max(8);
const cipherValueSchema = z.strictObject({ historyUuid: uuid, chunkUuid: z.string().regex(/^[a-f\d]{32}(?:-1)?$/u), keyHex: uuid, cipherHexParts: hexParts });
const base64Parts = z.array(z.string().min(1).max(8192).regex(/^[A-Za-z\d+/=]+$/u)).min(1).max(8);
const projectFields = z.strictObject({ updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/u), modifierUuid: uuid });
const emptyFields = z.strictObject({});
const sqlValueSchema = z.discriminatedUnion("kind", [z.strictObject({ kind: z.literal("data"), fields: z.strictObject({ dataBase64Parts: base64Parts }) }),
  z.strictObject({ kind: z.enum(["head", "branch", "commit"]), fields: emptyFields }), z.strictObject({ kind: z.literal("project"), fields: projectFields })]);
const callbackValueSchema = z.strictObject({ kind: z.enum(SLOTS), changes: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER), lastID: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER) });
const finalValueSchema = z.strictObject({ historyUuid: uuid, originalServiceAwaitCompleted: z.literal(true), controllerBodyJoined: z.literal(true) });
const resultValue = z.strictObject({ result: z.strictObject({ type: z.literal("object"), value: z.unknown() }) });
interface SqlSlot { readonly proof: string; value: z.infer<typeof sqlValueSchema> | null; callback: string | null; callbackValue: z.infer<typeof callbackValueSchema> | null; window: CurrentPcbViaMainHistoryNativeWindow | null }
function isSiteRole(value: FrameRole): value is Role { return Object.hasOwn(SITES, value); }
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`PCB_VIA_HISTORY_CUSTODY_${code}`); } }
export class CurrentPcbViaMainHistoryCustody {
  readonly #host: CurrentPcbViaMainHistoryHost; readonly #points = new Map<Role, string>(); readonly #frames = new Map<string, string>(); readonly #packets = new Map<ProgramRole, string>();
  readonly #values = new Set<string>(); readonly #slots = new Map<Slot, SqlSlot>();
  #normal = 0; #cleanup = 0; #step = 0; #failed = false; #started = false;
  #handoff: CurrentPcbViaMainHistoryHandoff | null = null; #callbackFunction: string | null = null; #callbackQualified = false;
  #branch: z.infer<typeof branchValueSchema> | null = null; #cipher: z.infer<typeof cipherValueSchema> | null = null; #dataBase64: string | null = null; #plaintextSha256: string | null = null;
  #pending: Readonly<{ identity: object; role: Step; dataStr: string }> | null = null; #consumed = false; #pendingId: number | null = null; #acknowledged = false;
  #finalValue: z.infer<typeof finalValueSchema> | null = null; #result: CurrentProjectHistorySqlEffects | null = null;
  public constructor(host: CurrentPcbViaMainHistoryHost) { this.#host = host; Object.freeze(this); }
  #same(): void { need(!this.#failed, "FAILED"); this.#host.assertCurrent(); }
  #pointsCurrent(): void { need([...this.#points.values()].every(id => this.#host.pointCurrent(id)), "CURRENT_POINTS"); }
  public requireArmed(): void { this.#same(); this.#pointsCurrent(); need(!this.#started && this.#points.size === 9 && !this.#points.has("callback") && !this.#points.has("sqlCallback") && this.#normal === 9 && this.#cleanup === 0, "PRE_SAVE_ENROLLMENT"); this.#host.baseline(); }
  public start(): Readonly<{ transactionObjectId: string; callbackBreakpointId: string }> { this.requireArmed(); need(!this.#started, "START_CONSUMED"); this.#started = true; const handoff = this.#host.handoff(); need(handoff.origin === this.#host.origin, "ORIGINAL_BEGIN_ORIGIN"); need(this.#host.pointCurrent(handoff.callbackBreakpointId) && ![...this.#points.values()].includes(handoff.callbackBreakpointId), "ORIGINAL_CALLBACK_POINT_TRANSFER"); this.#points.set("sqlCallback", handoff.callbackBreakpointId); this.#handoff = handoff; return Object.freeze({ transactionObjectId: handoff.transactionObjectId, callbackBreakpointId: handoff.callbackBreakpointId }); }
  #rawPause(): Readonly<{ held: CurrentPcbViaMainBeginPause; frames: z.infer<typeof frame>[]; point: string }> {
    const held = this.#host.pause(); const raw = pauseSchema.parse(captureCurrentPcbStringClockReply(held.raw).value); const first = raw.callFrames[0];
    need(first !== undefined && first.callFrameId === held.frameId && !held.resumed && !held.resumeAttempted && held.pendingEvents === 0, "LIVE_DELIVERED_PAUSE"); return { held, frames: raw.callFrames, point: raw.hitBreakpoints[0] };
  }
  #top(role: Role | "sqlRun"): CurrentPcbViaMainBeginPause {
    const raw = this.#rawPause(); const first = raw.frames[0]; const expected = currentPcbViaMainHistoryFrame(role); need(first !== undefined && first.functionName === expected.name && first.functionLocation.scriptId === this.#host.scriptId && first.functionLocation.lineNumber === expected.lineNumber && first.functionLocation.columnNumber === expected.functionColumn && first.location.scriptId === this.#host.scriptId, "SOURCE_FUNCTION");
    if (role === "sqlRun") { need(raw.held.sqlSite === "run" && first.location.lineNumber === 1025 && first.location.columnNumber === 875, "ORIGINAL_NATIVE_RUN"); }
    else { const site = SITES[role]; need(raw.held.sqlSite === null && raw.point === this.#points.get(role) && first.location.lineNumber === site.lineNumber && first.location.columnNumber === site.columnNumber, "SOURCE_POINT"); }
    return raw.held;
  }
  #slot(): Slot { const step = STEPS[this.#step]; const found = SLOTS.find(slot => step === `sql-${slot}` || step === `callback-${slot}`); need(found !== undefined, "SLOT_STAGE"); return found; }
  #stageRoles(): readonly FrameRole[] {
    need(this.#branch !== null || this.#step <= 2, "BRANCH_REQUIRED"); const mode = this.#branch?.mode;
    if (this.#step === 1) { return ["callback"]; } if (this.#step === 2) { return ["branch"]; }
    if (this.#step === 3) { return [mode === "append" ? "writerAppend" : "writerMutable"]; }
    if (this.#step === 4) { return ["encryptEntry", mode === "append" ? "encryptCallerAppend" : "encryptCallerMutable"]; }
    if (this.#step === 5) { return ["cipher"]; }
    if ([6, 8, 10, 12, 15].includes(this.#step)) { const slot = this.#slot(); let caller: FrameRole;
      if (slot === "data") { caller = "dataCaller"; } else if (slot === "head") { caller = mode === "append" ? "headCallerAppend" : "headCallerMutable"; }
      else if (slot === "branch") { caller = "branchCaller"; } else if (slot === "commit") { caller = "commitCaller"; } else { caller = "projectCaller"; } return ["sqlRun", caller]; }
    if ([7, 9, 11, 13, 16].includes(this.#step)) { return ["sqlCallback"]; }
    if (this.#step === 14) { return ["commitReturned"]; } if (this.#step === 17) { return ["projectReturned"]; } if (this.#step === 18) { return ["saveReturned"]; } if (this.#step === 19) { return ["controllerReturned"]; }
    throw new Error("PCB_VIA_HISTORY_CUSTODY_FRAME_STAGE");
  }
  #frameId(role: FrameRole): string { const actual = this.#rawPause(), expected = currentPcbViaMainHistoryFrame(role); const roles = this.#stageRoles(); need(roles.includes(role), "FRAME_ROLE_STAGE");
    if (roles[0] === role) { need(role === "sqlRun" || isSiteRole(role), "TOP_SOURCE_ROLE"); this.#top(role); return actual.held.frameId; }
    const found = actual.frames.slice(1).filter(item => item.functionName === expected.name && item.functionLocation.scriptId === this.#host.scriptId && item.functionLocation.lineNumber === expected.lineNumber && item.functionLocation.columnNumber === expected.functionColumn && item.location.scriptId === this.#host.scriptId); need(found.length === 1 && found[0] !== undefined, "ORIGINAL_CALLER_FRAME"); return found[0].callFrameId;
  }
  #frameKey(role: FrameRole): string { return `${String(this.#step)}:${role}`; }
  #framePacket(role: FrameRole): string { const value = this.#frames.get(this.#frameKey(role)); need(value !== undefined, "FRAME_PACKET_REQUIRED"); return value; }
  #packet(role: ProgramRole): string { const value = this.#packets.get(role); need(value !== undefined, "PRIOR_PACKET_REQUIRED"); return value; }
  #currentSlot(): SqlSlot { const value = this.#slots.get(this.#slot()); need(value !== undefined, "ORIGINAL_SQL_SLOT"); return value; }
  #joinExpected(role: ProgramRole): Readonly<{ receiver: string; arguments: readonly string[] }> {
    need(this.#handoff !== null, "BEGIN_REQUIRED"); const roles = this.#stageRoles(), top = roles[0]; need(top !== undefined, "TOP_ROLE");
    if (role === "branchValue") { need(this.#step === 2, "VALUE_STAGE"); return { receiver: this.#packet("branch"), arguments: [] }; }
    if (role === "cipherValue") { need(this.#step === 5, "VALUE_STAGE"); return { receiver: this.#packet("cipher"), arguments: [this.#host.captureObjectId] }; }
    if (role === "sqlValue") { need([6, 8, 10, 12, 15].includes(this.#step), "VALUE_STAGE"); return { receiver: this.#currentSlot().proof, arguments: [] }; }
    if (role === "sqlCallbackValue") { need([7, 9, 11, 13, 16].includes(this.#step), "VALUE_STAGE"); const callback = this.#currentSlot().callback; need(callback !== null, "CALLBACK_REQUIRED"); return { receiver: callback, arguments: [] }; }
    const receiver = this.#framePacket(top);
    if (role === "callback" && this.#step === 1) { return { receiver, arguments: [this.#handoff.transactionObjectId] }; }
    if (role === "branch" && this.#step === 2) { return { receiver, arguments: [this.#packet("callback")] }; }
    if (role === "writer" && this.#step === 3) { return { receiver, arguments: [this.#packet("branch")] }; }
    if (role === "encryptEntry" && this.#step === 4) { need(roles[1] !== undefined, "CALLER_ROLE"); return { receiver, arguments: [this.#framePacket(roles[1]), this.#packet("writer")] }; }
    if (role === "cipher" && this.#step === 5) { return { receiver, arguments: [this.#packet("encryptEntry"), this.#host.captureObjectId] }; }
    const runRole: Readonly<Record<Slot, ProgramRole>> = { data: "runData", head: "runHead", branch: "runBranch", commit: "runCommit", project: "runProject" };
    if ([6, 8, 10, 12, 15].includes(this.#step) && role === runRole[this.#slot()]) { need(roles[1] !== undefined && this.#plaintextSha256 !== null, "CIPHER_AND_CALLER_REQUIRED"); return { receiver, arguments: [this.#framePacket(roles[1]), this.#packet("cipher"), this.#host.captureObjectId] }; }
    if (role === "sqlCallback" && [7, 9, 11, 13, 16].includes(this.#step)) { return { receiver, arguments: [this.#currentSlot().proof] }; }
    if (role === "commitReturned" && this.#step === 14) { const callback = this.#slots.get("commit")?.callback; need(callback !== undefined && callback !== null, "COMMIT_CALLBACK"); return { receiver, arguments: [callback] }; }
    if (role === "projectReturned" && this.#step === 17) { const project = this.#slots.get("project"); need(project !== undefined, "PROJECT_RUN"); return { receiver, arguments: [project.proof] }; }
    if (role === "saveReturned" && this.#step === 18) { return { receiver, arguments: [this.#packet("projectReturned")] }; }
    if (role === "controllerReturned" && this.#step === 19) { return { receiver, arguments: [this.#packet("saveReturned")] }; }
    throw new Error("PCB_VIA_HISTORY_CUSTODY_JOIN_STAGE");
  }
  public async request(input: Command, cleanup: boolean): Promise<unknown> {
    this.#same(); const command = validateCurrentPcbViaMainHistoryCommand(input);
    try { if (cleanup) { this.#cleanup += 1; need(command.phase === "via-main-history-remove" && this.#cleanup <= LIMITS.cleanup && this.#result !== null, "CLEANUP"); }
      else { this.#normal += 1; need(command.phase !== "via-main-history-remove" && this.#normal <= LIMITS.normal, "NORMAL_BOUND"); }
      if (command.phase === "via-main-history-step") { return await this.#advance(command); }
      if (command.phase === "via-main-history-arm") { need(!this.#started && this.#handoff === null && !this.#points.has(command.role) && command.params.location.scriptId === this.#host.scriptId, "ARM_CONSUMED"); this.#host.baseline(); }
      else if (command.phase === "via-main-history-properties") { need(this.#started && this.#step === 0 && this.#handoff !== null, "METADATA_STAGE"); const objectId = command.params.objectId;
        need(command.role === "transaction" ? this.#callbackFunction === null && objectId === this.#handoff.transactionObjectId : this.#callbackFunction !== null && !this.#callbackQualified && objectId === this.#callbackFunction, "ORIGINAL_CALLBACK_METADATA"); }
      else if (command.phase === "via-main-history-callback-arm") { need(this.#started && this.#step === 0 && this.#callbackQualified && command.params.objectId === this.#callbackFunction && !this.#points.has("callback"), "ORIGINAL_CALLBACK_ARM"); }
      else if (command.phase === "via-main-history-frame") { need(this.#started && command.params.callFrameId === this.#frameId(command.role) && !this.#frames.has(this.#frameKey(command.role)), "ORIGINAL_FRAME"); }
      else if (command.phase === "via-main-history-join") { const expected = this.#joinExpected(command.role), key = `${String(this.#step)}:${command.role}`; need(!this.#values.has(key) && command.params.objectId === expected.receiver && canonicalJson(command.params.arguments.map(argument => argument.objectId)) === canonicalJson(expected.arguments), "ORIGINAL_JOIN_ARGUMENTS"); this.#values.add(key); }
      else { need(this.#points.get(command.role) === command.params.breakpointId, "ORIGINAL_POINT"); }
      const reply = captureCurrentPcbStringClockReply(await this.#host.send(command, cleanup)).value; this.#same();
      if (command.phase === "via-main-history-arm") { const allocated = z.strictObject({ breakpointId: handle, actualLocation: point }).parse(reply); need(canonicalJson(allocated.actualLocation) === canonicalJson(command.params.location) && ![...this.#points.values()].includes(allocated.breakpointId), "ARM_REPLY"); this.#host.registerPoint(allocated.breakpointId, allocated.actualLocation); this.#points.set(command.role, allocated.breakpointId); }
      else if (command.phase === "via-main-history-properties") { if (command.role === "transaction") { this.#callbackFunction = decodeCallback(reply); } else { decodeCallbackMetadata(reply, this.#host.scriptId); this.#callbackQualified = true; } }
      else if (command.phase === "via-main-history-callback-arm") { const allocated = z.strictObject({ breakpointId: handle }).parse(reply); need(![...this.#points.values()].includes(allocated.breakpointId), "CALLBACK_POINT_ALIAS"); this.#host.registerPoint(allocated.breakpointId, { scriptId: this.#host.scriptId, lineNumber: SITES.callback.lineNumber, columnNumber: SITES.callback.columnNumber }); this.#points.set("callback", allocated.breakpointId); }
      else if (command.phase === "via-main-history-frame") { this.#frames.set(this.#frameKey(command.role), decodeArray(reply, currentPcbViaMainHistoryFrame(command.role).length)); }
      else if (command.phase === "via-main-history-join") { await this.#retainJoin(command.role, reply); }
      else { z.strictObject({}).parse(reply); this.#host.removePoint(command.params.breakpointId); }
      return reply;
    } catch (error) { this.#failed = true; throw error; }
  }
  async #retainJoin(role: ProgramRole, reply: unknown): Promise<void> {
    const fixed = PROGRAMS[role];
    if (!fixed.returnByValue) { const id = decodeArray(reply, fixed.length);
      if (role.startsWith("run")) { const slot = this.#slot(); need(!this.#slots.has(slot), "SQL_SLOT_CONSUMED"); this.#slots.set(slot, { proof: id, value: null, callback: null, callbackValue: null, window: null }); }
      else if (role === "sqlCallback") { const slot = this.#currentSlot(); need(slot.callback === null, "CALLBACK_CONSUMED"); slot.callback = id; }
      else { need(!this.#packets.has(role), "PACKET_CONSUMED"); this.#packets.set(role, id); } return;
    }
    const value = resultValue.parse(reply).result.value;
    if (role === "branchValue") { const branch = branchValueSchema.parse(value); const baseline = this.#host.baseline(); need(canonicalJson(branch.branch) === canonicalJson(baseline.branch) && canonicalJson(branch.head) === canonicalJson(baseline.head) && branch.mode === (branch.withinOneMinute === 0 ? "append" : "mutable"), "INITIAL_HEAD_AND_BRANCH"); this.#branch = freezeDeep(branch); }
    else if (role === "cipherValue") { need(this.#branch !== null && this.#handoff !== null && this.#cipher === null, "CIPHER_ONCE"); const cipher = cipherValueSchema.parse(value); const baseline = this.#host.baseline();
      need(this.#branch.mode === "append" ? cipher.historyUuid !== baseline.head.uuid && cipher.chunkUuid === cipher.historyUuid : cipher.historyUuid === baseline.head.uuid && cipher.chunkUuid === `${baseline.head.uuid}-1` && cipher.keyHex === baseline.head.key, "SOURCE_CIPHER_HEAD");
      const cipherHex = cipher.cipherHexParts.join(""); need(cipherHex.length >= 34 && cipherHex.length <= 65_536, "CIPHER_BOUND"); const dataBase64 = Buffer.from(cipherHex, "hex").toString("base64");
      const plaintext = await decodeNativeHistoryChunk({ historyUuid: cipher.historyUuid, keyHex: cipher.keyHex, dataBase64 }); this.#same(); this.#top("cipher");
      const actor = this.#host.actorValue(); const expected = `{"type":"EDIT_HEAD"}||${JSON.stringify(actor)}|\n${this.#handoff.dataStr}`; need(plaintext === expected, "ORIGINAL_EDIT_HEAD_AND_BODY"); this.#cipher = freezeDeep(cipher); this.#dataBase64 = dataBase64; this.#plaintextSha256 = sha256Text(plaintext); }
    else if (role === "sqlValue") { const slot = this.#currentSlot(); const parsed = sqlValueSchema.parse(value); need(parsed.kind === this.#slot() && slot.value === null, "SQL_VALUE_SLOT"); if (parsed.kind === "data") { need(parsed.fields.dataBase64Parts.join("") === this.#dataBase64, "ORIGINAL_NATIVE_CIPHER"); } slot.value = freezeDeep(parsed); }
    else if (role === "sqlCallbackValue") { const slot = this.#currentSlot(); const parsed = callbackValueSchema.parse(value); need(slot.callbackValue === null && parsed.kind === this.#slot() && (parsed.kind === "commit" || parsed.changes === 1) && (parsed.kind !== "data" && !(parsed.kind === "head" && this.#branch?.mode === "append") || parsed.lastID === 2), "CALLBACK_RESULT_SLOT"); slot.callbackValue = freezeDeep(parsed); }
    else { need(role === "controllerReturned" && this.#cipher !== null && this.#finalValue === null, "FINAL_VALUE_ONCE"); const parsed = finalValueSchema.parse(value); need(parsed.historyUuid === this.#cipher.historyUuid, "CONTROLLER_HISTORY_UUID"); this.#finalValue = freezeDeep(parsed); }
  }
  #ready(role: Step): CurrentPcbViaMainBeginPause {
    need(this.#started && this.#handoff !== null && role === STEPS[this.#step], "STEP_CONSUMED"); this.#pointsCurrent();
    if (role === "begin") { need(this.#callbackQualified && this.#points.size === 11, "ORIGINAL_CALLBACK_REQUIRED"); const held = this.#host.pause(); need(!held.resumeAttempted && !held.resumed && held.pendingEvents === 0, "ORIGINAL_BEGIN_RETURN"); return held; }
    if (role === "callback") { this.#packet("callback"); return this.#top("callback"); }
    if (role === "branch") { this.#packet("branch"); need(this.#branch !== null, "HEAD_VALUE_REQUIRED"); return this.#top("branch"); }
    if (role === "writer") { this.#packet("writer"); return this.#top(this.#branch?.mode === "append" ? "writerAppend" : "writerMutable"); }
    if (role === "encrypt") { this.#packet("encryptEntry"); return this.#top("encryptEntry"); }
    if (role === "cipher") { this.#packet("cipher"); need(this.#plaintextSha256 !== null && this.#cipher !== null, "DECRYPTED_BODY_REQUIRED"); return this.#top("cipher"); }
    if (role.startsWith("sql-") || role.startsWith("callback-")) { const slot = this.#currentSlot(); need(slot.value !== null, "SQL_VALUE_REQUIRED"); if (role.startsWith("callback-")) { need(slot.callback !== null && slot.callbackValue !== null && slot.window !== null && slot.window.afterEpochMs === 0, "NATIVE_CALLBACK_REQUIRED"); return this.#top("sqlCallback"); } return this.#top("sqlRun"); }
    need(role === "commitReturned" || role === "projectReturned" || role === "saveReturned" || role === "controllerReturned", "RETURN_STAGE"); this.#packet(role === "controllerReturned" ? "saveReturned" : role); if (role === "controllerReturned") { need(this.#finalValue !== null, "SERVICE_RESULT_REQUIRED"); for (const slot of SLOTS) { const value = this.#slots.get(slot); need(value?.callbackValue !== null && value?.callbackValue !== undefined && value.window !== null && value.window.afterEpochMs > 0, "ALL_NATIVE_CALLBACKS_REQUIRED"); } }
    return this.#top(role);
  }
  async #advance(command: Extract<Command, { phase: "via-main-history-step" }>): Promise<unknown> {
    need(this.#pending === null && this.#handoff !== null, "PENDING_STEP"); const held = this.#ready(command.role); this.#step += 1; this.#pending = Object.freeze({ identity: held.identity, role: command.role, dataStr: this.#handoff.dataStr }); this.#consumed = false; this.#pendingId = null; this.#acknowledged = false;
    const reply = await this.#host.resume(held.identity, command); this.#same(); need(this.#consumed && this.#acknowledged, "ORIGINAL_NATIVE_ACK_REQUIRED"); z.strictObject({}).parse(reply); this.#pending = null; this.#pendingId = null;
    if (this.#step === STEPS.length) { this.#finish(); } return reply;
  }
  public consume(command: Command, requestId: number): Readonly<{ origin: CurrentPcbViaMainOrigin; dataStr: string; role: Step }> {
    this.#same(); this.#pointsCurrent(); const pending = this.#pending; const held = this.#host.pause(); need(command.phase === "via-main-history-step" && pending !== null && !this.#consumed && this.#host.busy() && this.#host.pendingRequestId() === requestId && command.role === pending.role && held.identity === pending.identity && held.resumeAttempted && !held.resumed, "ORIGINAL_PENDING_NATIVE_GRANT"); this.#consumed = true; this.#pendingId = requestId;
    return Object.freeze({ origin: this.#host.origin, dataStr: pending.dataStr, role: pending.role });
  }
  public acknowledge(command: Command, requestId: number, window: CurrentPcbViaMainHistoryNativeWindow | null): void {
    this.#same(); const pending = this.#pending; need(command.phase === "via-main-history-step" && pending !== null && this.#consumed && !this.#acknowledged && this.#pendingId === requestId && pending.role === command.role, "ORIGINAL_PENDING_ACK");
    if (pending.role.startsWith("sql-") || pending.role.startsWith("callback-")) { need(window !== null && pending.role.endsWith(`-${window.slot}`), "NATIVE_WINDOW_SLOT"); const slot = this.#slots.get(window.slot); need(slot !== undefined, "NATIVE_WINDOW_ORIGINAL_SQL");
      if (pending.role.startsWith("sql-")) { need(slot.window === null && window.afterEpochMs === 0, "NATIVE_START_WINDOW_ONCE"); }
      else { need(slot.window !== null && window.beforeEpochMs === slot.window.beforeEpochMs && window.afterEpochMs >= window.beforeEpochMs && window.afterEpochMs - window.beforeEpochMs <= 120_000 && slot.callbackValue !== null, "NATIVE_CALLBACK_WINDOW_ONCE"); } slot.window = window;
    } else { need(window === null, "UNEXPECTED_NATIVE_WINDOW"); } this.#acknowledged = true;
  }
  #finish(): void {
    need(this.#step === STEPS.length && this.#normal === LIMITS.normal && this.#branch !== null && this.#cipher !== null && this.#dataBase64 !== null && this.#plaintextSha256 !== null && this.#handoff !== null && this.#finalValue !== null && this.#result === null, "COMPLETE_SOURCE_SCHEDULE");
    const baseline = this.#host.baseline(), project = this.#slots.get("project")?.value; need(project?.kind === "project", "PROJECT_VALUE"); const callbacks: CurrentProjectHistorySqlNativeCallback[] = SLOTS.map(slot => { const row = this.#slots.get(slot); need(row?.callbackValue !== null && row?.callbackValue !== undefined && row.window !== null && row.window.afterEpochMs >= row.window.beforeEpochMs, "COMPLETE_NATIVE_SLOT"); return Object.freeze({ slot, changes: row.callbackValue.changes, lastID: row.callbackValue.lastID, beforeEpochMs: row.window.beforeEpochMs, afterEpochMs: row.window.afterEpochMs }); });
    this.#result = freezeDeep({ schema: "private.current-project-history-sql-effects.v1", projectUuid: baseline.projectUuid, branchUuid: baseline.branchUuid, initialLogicalSha256: baseline.initialLogicalSha256,
      mode: this.#branch.mode, historyUuid: this.#cipher.historyUuid, parentHistoryUuid: baseline.head.uuid, keyHex: this.#cipher.keyHex, chunkUuid: this.#cipher.chunkUuid, dataBase64: this.#dataBase64,
      plaintextSha256: this.#plaintextSha256, bodySha256: sha256Text(this.#handoff.dataStr), historyNum: this.#branch.mode === "append" ? 0 : 1, actor: this.#host.actorValue(), projectUpdatedAt: project.fields.updatedAt, projectModifierUuid: project.fields.modifierUuid,
      nativeCallbacks: callbacks, originalServiceAwaitCompleted: true, selectedSqlStillFenced: true });
  }
  public result(): CurrentProjectHistorySqlEffects { this.#same(); need(this.#result !== null && this.#pending === null && this.#step === STEPS.length, "ORIGINAL_COMPLETE_RESULT"); return this.#result; }
}
