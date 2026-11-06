/** Original Via structure receipt ledger. Only its retained backend instance
 * can consume a pending original SQL/response continuation in the native owner. */
/* oxlint-disable import/max-dependencies -- Keep original scope, exact source/programs and independent native callback/metadata receipts separate. */
import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { decodeCurrentFootprintCopyMainRequestArrayCapture as decodeArray, decodeCurrentFootprintCopyMainRequestArrayMember as decodeMember } from "./current-footprint-copy-main-request-protocol.ts";
import { decodeCurrentFootprintCopyMainRequestPromise as decodePromise } from "./current-footprint-copy-main-request-contract.ts";
import type { CurrentPcbViaMainOrigin } from "./current-pcb-via-main-origin.ts";
import type { CurrentPcbViaMainBeginPause, CurrentPcbViaMainCallbackLoan } from "./current-pcb-via-main-begin-custody.ts";
import type { CurrentGeneratedProjectHistorySqlBaseline } from "./current-generated-project-history-sql-baseline.ts";
import type { CurrentSelectedFileMainRequestObservation } from "./current-selected-file-main-request-reader.ts";
import type { CurrentProjectStructureSqlEffects } from "./current-project-structure-sql-effects.ts";
import type { CurrentPcbViaMainStructureNativeWindow } from "./current-pcb-via-main-structure-ack.ts";
import { decodeCurrentPcbViaMainStructureFinalFunction, decodeCurrentPcbViaMainStructureFinalMetadata } from "./current-pcb-via-main-structure-replies.ts";
import { CURRENT_PCB_VIA_MAIN_STRUCTURE_REQUESTS as LIMITS, CURRENT_PCB_VIA_MAIN_STRUCTURE_PROGRAMS as PROGRAMS, CURRENT_PCB_VIA_MAIN_STRUCTURE_STEPS as STEPS,
  currentPcbViaMainStructureExpectedSchema, currentPcbViaMainStructureFrame, validateCurrentPcbViaMainStructureCommand } from "./current-pcb-via-main-structure-protocol.ts";
import type { CurrentPcbViaMainStructureCommand as Command, CurrentPcbViaMainStructureExpected as Expected, CurrentPcbViaMainStructureFrameRole as FrameRole,
  CurrentPcbViaMainStructureProgramRole as ProgramRole, CurrentPcbViaMainStructureRole as Role, CurrentPcbViaMainStructureStep as Step } from "./current-pcb-via-main-structure-protocol.ts";
import { CURRENT_PCB_VIA_MAIN_STRUCTURE_SITES as SITES } from "./current-pcb-via-main-structure-source.ts";

export interface CurrentPcbViaMainStructureHost {
  readonly origin: CurrentPcbViaMainOrigin; readonly scriptId: string; readonly constructionObjectId: string; readonly sqlCaptureObjectId: string;
  readonly assertCurrent: () => void; readonly baseline: () => CurrentGeneratedProjectHistorySqlBaseline; readonly expected: () => Expected;
  readonly requireRequest: (packet: CurrentSelectedFileMainRequestObservation) => void;
  readonly lendCallback: () => CurrentPcbViaMainCallbackLoan; readonly returnCallback: (loan: CurrentPcbViaMainCallbackLoan) => void;
  readonly pause: () => CurrentPcbViaMainBeginPause; readonly pendingRequestId: () => number | null; readonly busy: () => boolean;
  readonly send: (command: Command, cleanup: boolean) => Promise<unknown>; readonly resume: (identity: object, command: Command) => Promise<unknown>;
  readonly registerPoint: (id: string, location: Readonly<{ scriptId: string; lineNumber: number; columnNumber: number }>) => void;
  readonly pointCurrent: (id: string) => boolean; readonly removePoint: (id: string) => void;
}
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), point = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const frame = z.looseObject({ callFrameId: handle, functionName: z.string(), location: point, functionLocation: point });
const pauseSchema = z.looseObject({ reason: z.literal("other"), hitBreakpoints: z.tuple([handle]), callFrames: z.array(frame).min(1).max(64) });
const resultValue = z.strictObject({ result: z.strictObject({ type: z.literal("object"), value: z.unknown() }) });
const rowValue = z.strictObject({ ticket: z.literal(1), structureText: z.string().min(1).max(65_536) });
const rowsValue = rowValue.extend({ rows: z.literal(1) });
const runValue = z.strictObject({ ticket: z.number().int().positive(), structureText: z.string().min(1).max(9999), branchUuid: z.string().regex(/^[a-f\d]{32}$/u) });
const callbackValue = z.strictObject({ changes: z.literal(1), lastID: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER) });
const finalValue = z.strictObject({ originalResponseFinalizerReturned: z.literal(true), statusCode: z.literal(200) });
interface Point { readonly id: string; removed: boolean }
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`PCB_VIA_STRUCTURE_CUSTODY_${code}`); } }
function isSite(role: FrameRole): role is Role { return Object.hasOwn(SITES, role); }
export class CurrentPcbViaMainStructureCustody {
  readonly #host: CurrentPcbViaMainStructureHost; readonly #points = new Map<Role, Point>(); readonly #frames = new Map<string, string>(); readonly #packets = new Map<ProgramRole, string>(); readonly #values = new Set<string>();
  #normal = 0; #cleanup = 0; #step = 0; #failed = false; #started = false; #callbackReturned = false; #loan: CurrentPcbViaMainCallbackLoan | null = null;
  #queryPromise: string | null = null; #queryResult: string | null = null; #finalFunction: string | null = null; #finalQualified = false;
  #selected = false; #rows = false; #runValue = false; #callbackValue: z.infer<typeof callbackValue> | null = null; #finalValue = false; #responseValue = false;
  #pending: Readonly<{ identity: object; role: Step; expected: Expected }> | null = null; #consumed = false; #pendingId: number | null = null; #acknowledged = false;
  #window: CurrentPcbViaMainStructureNativeWindow | null = null; #result: CurrentProjectStructureSqlEffects | null = null;
  public constructor(host: CurrentPcbViaMainStructureHost) { this.#host = host; Object.freeze(this); }
  #same(): void { need(!this.#failed, "FAILED"); this.#host.assertCurrent(); }
  #currentPoints(): void { need([...this.#points].filter(([role, row]) => !row.removed && (role !== "callback" || !this.#callbackReturned)).every(([, row]) => this.#host.pointCurrent(row.id)), "CURRENT_SOURCE_POINTS"); }
  public requireArmed(): void { this.#same(); this.#currentPoints(); need(!this.#started && this.#step === 0 && this.#points.size === 9 && this.#normal === 9 && this.#cleanup === 0 && !this.#points.has("context") && !this.#points.has("callback") && !this.#points.has("finalEntry") && !this.#points.has("finalReturned") && !this.#points.has("finalFailed"), "PRE_ACTION_ENROLLMENT"); this.#host.baseline(); }
  public start(packet: CurrentSelectedFileMainRequestObservation): void {
    this.requireArmed(); this.#host.requireRequest(packet); const expected = currentPcbViaMainStructureExpectedSchema.parse(this.#host.expected()); const held = this.#host.pause();
    need(packet.mode === "fetch" && packet.method === "POST" && packet.pureQuery === "" && packet.pathHeader === expected.projectUuid && packet.pureUrl === `/api/v4/projects/${expected.projectUuid}/branches/${expected.branchUuid}/structures` && held.sqlSite === "driver" && !held.resumeAttempted && !held.resumed && held.pendingEvents === 0, "ORIGINAL_POST_DRIVER");
    this.#started = true; const loan = this.#host.lendCallback(); need(this.#host.pointCurrent(loan.breakpointId) && ![...this.#points.values()].some(row => row.id === loan.breakpointId), "ORIGINAL_CALLBACK_LOAN"); this.#loan = loan; this.#points.set("callback", { id: loan.breakpointId, removed: false });
  }
  #raw(): Readonly<{ held: CurrentPcbViaMainBeginPause; frames: z.infer<typeof frame>[]; id: string }> { const held = this.#host.pause(), raw = pauseSchema.parse(captureCurrentPcbStringClockReply(held.raw).value); need(!held.resumeAttempted && !held.resumed && held.pendingEvents === 0 && raw.callFrames[0]?.callFrameId === held.frameId, "LIVE_DELIVERED_PAUSE"); return { held, frames: raw.callFrames, id: raw.hitBreakpoints[0] }; }
  #top(role: Role | "driver" | "run"): CurrentPcbViaMainBeginPause {
    const raw = this.#raw(); const first = raw.frames[0]; const expected = currentPcbViaMainStructureFrame(role); need(first !== undefined && first.functionName === expected.name && first.functionLocation.scriptId === this.#host.scriptId && first.functionLocation.lineNumber === expected.lineNumber && first.functionLocation.columnNumber === expected.functionColumn && first.location.scriptId === this.#host.scriptId, "ORIGINAL_FUNCTION");
    if (role === "driver" || role === "run") { need(raw.held.sqlSite === role && first.location.lineNumber === (role === "driver" ? 1164 : 1025) && first.location.columnNumber === (role === "driver" ? 2453 : 875), "ORIGINAL_NATIVE_SITE"); }
    else { const site = SITES[role]; need(raw.held.sqlSite === null && raw.id === this.#points.get(role)?.id && first.location.lineNumber === site.lineNumber && first.location.columnNumber === site.columnNumber, "ORIGINAL_SOURCE_POINT"); }
    return raw.held;
  }
  #roles(): readonly FrameRole[] { const role = STEPS[this.#step]; need(role !== undefined, "FRAME_STAGE"); if (role === "driver") { return ["driver", "driverCaller"]; } if (role === "query") { return ["query", "queryCaller"]; } if (role === "run") { return ["run", "runCaller"]; } return [role]; }
  #frameId(role: FrameRole): string { const roles = this.#roles(); need(roles.includes(role), "FRAME_ROLE"); if (roles[0] === role) { need(role === "driver" || role === "run" || isSite(role), "FRAME_TOP"); return this.#top(role).frameId; }
    const expected = currentPcbViaMainStructureFrame(role), matches = this.#raw().frames.slice(1).filter(row => row.functionName === expected.name && row.functionLocation.scriptId === this.#host.scriptId && row.functionLocation.lineNumber === expected.lineNumber && row.functionLocation.columnNumber === expected.functionColumn && row.location.scriptId === this.#host.scriptId); need(matches.length === 1 && matches[0] !== undefined, "ORIGINAL_CALLER"); return matches[0].callFrameId; }
  #frameKey(role: FrameRole): string { return `${String(this.#step)}:${role}`; }
  #frame(role: FrameRole): string { const id = this.#frames.get(this.#frameKey(role)); need(id !== undefined, "FRAME_RECEIPT"); return id; }
  #packet(role: ProgramRole): string { const id = this.#packets.get(role); need(id !== undefined, "PRIOR_PACKET"); return id; }
  #expectedJoin(role: ProgramRole): Readonly<{ receiver: string; args: readonly unknown[] }> {
    if (role === "invocation" && this.#step === 0) { return { receiver: this.#frame("driver"), args: [{ objectId: this.#host.constructionObjectId }, { objectId: this.#frame("driverCaller") }] }; }
    if (role === "context" && this.#step === 1) { return { receiver: this.#frame("context"), args: [{ objectId: this.#host.constructionObjectId }] }; }
    if (role === "contextJoin" && this.#step === 1) { return { receiver: this.#packet("invocation"), args: [{ objectId: this.#packet("context") }] }; }
    if (role === "controller" && this.#step === 2) { return { receiver: this.#frame("controller"), args: [{ objectId: this.#packet("context") }, { objectId: this.#packet("invocation") }, { value: this.#host.expected() }] }; }
    if (role === "query" && this.#step === 3) { return { receiver: this.#frame("query"), args: [{ objectId: this.#packet("controller") }, { objectId: this.#frame("queryCaller") }] }; }
    if (role === "connection" && this.#step === 3) { need(this.#queryResult !== null, "FULFILLED_DB_RESULT"); return { receiver: this.#packet("query"), args: [{ objectId: this.#queryResult }] }; }
    const packetArgs: Partial<Record<ProgramRole, readonly [number, FrameRole, ProgramRole]>> = { selected: [4, "selected", "query"], update: [5, "update", "selected"], exec: [6, "exec", "update"], callback: [8, "callback", "run"], updateReturned: [9, "updateReturned", "exec"], serviceReturned: [10, "serviceReturned", "updateReturned"], controllerReturned: [11, "controllerReturned", "serviceReturned"], response: [12, "response", "controllerReturned"], finalEntry: [13, "finalEntry", "finalSelect"], finalReturned: [14, "finalReturned", "finalEntry"] };
    const packet = packetArgs[role]; if (packet !== undefined) { need(this.#step === packet[0], "PACKET_STAGE"); return { receiver: this.#frame(packet[1]), args: [{ objectId: this.#packet(packet[2]) }] }; }
    if (role === "run" && this.#step === 7) { return { receiver: this.#frame("run"), args: [{ objectId: this.#frame("runCaller") }, { objectId: this.#packet("exec") }, { objectId: this.#host.sqlCaptureObjectId }] }; }
    const values: Partial<Record<ProgramRole, readonly [number, ProgramRole]>> = { selectedValue: [4, "selected"], rowsValue: [5, "update"], runValue: [7, "run"], callbackValue: [8, "callback"], responseValue: [12, "response"], finalSelect: [12, "response"], finalValue: [14, "finalReturned"] };
    const value = values[role]; need(value !== undefined && this.#step === value[0], "VALUE_STAGE"); return { receiver: this.#packet(value[1]), args: [] };
  }
  public async request(input: Command, cleanup: boolean): Promise<unknown> {
    this.#same(); const command = validateCurrentPcbViaMainStructureCommand(input);
    try { if (cleanup) { this.#cleanup += 1; need(this.#cleanup <= LIMITS.cleanup && (command.phase === "via-main-structure-remove" || command.phase === "via-main-structure-release"), "CLEANUP_BOUND"); }
      else { this.#normal += 1; need(this.#normal <= LIMITS.normal && command.phase !== "via-main-structure-remove" && command.phase !== "via-main-structure-release", "NORMAL_BOUND"); }
      if (command.phase === "via-main-structure-step") { return await this.#advance(command); }
      if (command.phase === "via-main-structure-arm") { need(!this.#points.has(command.role) && command.params.location.scriptId === this.#host.scriptId, "ARM_CONSUMED"); if (command.role === "context") { need(this.#started && this.#step === 0, "HELD_POST_CONTEXT_ARM"); this.#top("driver"); } else if (command.role === "finalReturned" || command.role === "finalFailed") { need(this.#step === 13, "HELD_ORIGINAL_FINAL_ARM"); this.#top("finalEntry"); } else { need(!this.#started, "PRE_ACTION_ARM"); } }
      else if (command.phase === "via-main-structure-final-arm") { need(this.#step === 12 && this.#finalQualified && command.params.objectId === this.#finalFunction && !this.#points.has("finalEntry"), "ORIGINAL_FINAL_ARM"); this.#top("response"); }
      else if (command.phase === "via-main-structure-frame") { need(this.#started && command.params.callFrameId === this.#frameId(command.role) && !this.#frames.has(this.#frameKey(command.role)), "ORIGINAL_FRAME"); }
      else if (command.phase === "via-main-structure-join") { const expected = this.#expectedJoin(command.role); const key = `${String(this.#step)}:${command.role}`; need(!this.#values.has(key) && command.params.objectId === expected.receiver && canonicalJson(command.params.arguments) === canonicalJson(expected.args), "ORIGINAL_JOIN_ARGUMENTS"); this.#values.add(key); }
      else if (command.phase === "via-main-structure-properties") {
        if (command.role === "query") { need(this.#step === 3 && this.#queryPromise === null && command.params.objectId === this.#packet("query"), "QUERY_PROMISE_ONCE"); }
        else if (command.role === "promise") { need(this.#step === 3 && this.#queryPromise !== null && this.#queryResult === null && command.params.objectId === this.#queryPromise, "ORIGINAL_DB_PROMISE"); }
        else if (command.role === "final") { need(this.#step === 12 && this.#finalFunction === null && command.params.objectId === this.#packet("finalSelect"), "FINAL_ARRAY_ONCE"); }
        else { need(this.#step === 12 && this.#finalFunction !== null && !this.#finalQualified && command.params.objectId === this.#finalFunction, "ORIGINAL_FINAL_METADATA"); }
      } else if (command.phase === "via-main-structure-remove") { const row = this.#points.get(command.role); need(row !== undefined && !row.removed && row.id === command.params.breakpointId && command.role !== "callback", "ORIGINAL_OWN_POINT");
        need(command.role === "context" ? this.#step === 1 && this.#values.has("1:contextJoin") : this.#step === 14 && this.#finalValue && ["finalEntry", "finalReturned", "finalFailed"].includes(command.role) || this.#result !== null, "POINT_REMOVAL_STAGE"); }
      else { need(this.#result !== null && [...this.#points].filter(([role]) => role !== "callback").every(([, row]) => row.removed), "RELEASE_AFTER_ALL_OWN_POINTS"); }
      const reply = captureCurrentPcbStringClockReply(await this.#host.send(command, cleanup)).value; this.#same();
      if (command.phase === "via-main-structure-arm") { const allocated = z.strictObject({ breakpointId: handle, actualLocation: point }).parse(reply); need(canonicalJson(allocated.actualLocation) === canonicalJson(command.params.location) && ![...this.#points.values()].some(row => row.id === allocated.breakpointId), "ARM_REPLY"); this.#host.registerPoint(allocated.breakpointId, allocated.actualLocation); this.#points.set(command.role, { id: allocated.breakpointId, removed: false }); }
      else if (command.phase === "via-main-structure-final-arm") { const allocated = z.strictObject({ breakpointId: handle }).parse(reply); need(![...this.#points.values()].some(row => row.id === allocated.breakpointId), "FINAL_POINT_ALIAS"); this.#host.registerPoint(allocated.breakpointId, { scriptId: this.#host.scriptId, lineNumber: SITES.finalEntry.lineNumber, columnNumber: SITES.finalEntry.columnNumber }); this.#points.set("finalEntry", { id: allocated.breakpointId, removed: false }); }
      else if (command.phase === "via-main-structure-frame") { this.#frames.set(this.#frameKey(command.role), decodeArray(reply, currentPcbViaMainStructureFrame(command.role).length)); }
      else if (command.phase === "via-main-structure-properties") { if (command.role === "query") { this.#queryPromise = decodeMember(reply, 7, 6, "promise"); } else if (command.role === "promise") { this.#queryResult = decodePromise(reply); } else if (command.role === "final") { this.#finalFunction = decodeCurrentPcbViaMainStructureFinalFunction(reply); } else { decodeCurrentPcbViaMainStructureFinalMetadata(reply, this.#host.scriptId); this.#finalQualified = true; } }
      else if (command.phase === "via-main-structure-join") { this.#retain(command.role, reply); }
      else { z.strictObject({}).parse(reply); if (command.phase === "via-main-structure-remove") { const row = this.#points.get(command.role); need(row !== undefined, "ORIGINAL_POINT"); row.removed = true; this.#host.removePoint(row.id); } }
      return reply;
    } catch (error) { this.#failed = true; throw error; }
  }
  #retain(role: ProgramRole, reply: unknown): void {
    const fixed = PROGRAMS[role]; if (!fixed.returnByValue) { need(!this.#packets.has(role), "PACKET_CONSUMED"); this.#packets.set(role, decodeArray(reply, fixed.length)); return; }
    if (role === "connection" || role === "contextJoin") { z.strictObject({ result: z.strictObject({ type: z.literal("boolean"), value: z.literal(true) }) }).parse(reply); return; }
    const value = resultValue.parse(reply).result.value; const baseline = this.#host.baseline(); const expected = this.#host.expected();
    if (role === "selectedValue" || role === "rowsValue") { const row = role === "selectedValue" ? rowValue.parse(value) : rowsValue.parse(value); need(row.ticket === baseline.structure.ticket && row.structureText === baseline.structure.structure, "COMPLETE_INITIAL_STRUCTURE_ROW"); if (role === "selectedValue") { this.#selected = true; } else { this.#rows = true; } }
    else if (role === "runValue") { const row = runValue.parse(value); need(canonicalJson(row) === canonicalJson({ ticket: expected.ticket, structureText: expected.structureText, branchUuid: expected.branchUuid }), "EXACT_NATIVE_UPDATE"); this.#runValue = true; }
    else if (role === "callbackValue") { this.#callbackValue = freezeDeep(callbackValue.parse(value)); }
    else if (role === "responseValue") { const row = z.strictObject({ projectUuid: z.string(), branchUuid: z.string(), ticket: z.number().int(), structureText: z.string(), projectPath: z.string(), selectedTicket: z.literal(1), selectedRows: z.literal(1) }).parse(value); need(row.projectUuid === expected.projectUuid && row.branchUuid === expected.branchUuid && row.ticket === expected.ticket && row.structureText === expected.structureText, "EXACT_CONTROLLER_RESPONSE"); this.#responseValue = true; }
    else { need(role === "finalValue", "VALUE_ROLE"); finalValue.parse(value); this.#finalValue = true; }
  }
  #ready(role: Step): CurrentPcbViaMainBeginPause {
    this.#same(); this.#currentPoints(); need(this.#started && this.#loan !== null && role === STEPS[this.#step], "STEP_CONSUMED");
    if (role === "driver") { this.#packet("invocation"); need(this.#points.has("context"), "HELD_POST_CONTEXT_ARM"); }
    else if (role === "context") { need(this.#values.has("1:contextJoin") && this.#points.get("context")?.removed === true, "ORIGINAL_CONTEXT_JOIN_AND_REMOVE"); }
    else if (role === "query") { need(this.#queryResult !== null && this.#values.has("3:connection"), "ORIGINAL_FULFILLED_DB"); }
    else if (role === "selected") { need(this.#selected, "INITIAL_ROW_REQUIRED"); }
    else if (role === "update") { need(this.#rows, "COMPLETE_BRANCH_ROSTER"); }
    else if (role === "run") { need(this.#runValue && this.#window === null, "EXACT_NATIVE_UPDATE_REQUIRED"); }
    else if (role === "callback") { need(this.#callbackValue !== null && this.#window !== null && this.#window.afterEpochMs === 0, "ORIGINAL_NATIVE_CALLBACK"); }
    else if (role === "response") { need(this.#responseValue && this.#finalQualified && this.#points.has("finalEntry"), "ORIGINAL_RESPONSE_AND_FINAL"); }
    else if (role === "finalEntry") { need(this.#points.has("finalReturned") && this.#points.has("finalFailed"), "FINAL_RETURN_AND_CATCH_ARMED"); }
    else if (role === "finalReturned") { need(this.#finalValue && ["finalEntry", "finalReturned", "finalFailed"].every(value => { const site = z.enum(["finalEntry", "finalReturned", "finalFailed"]).parse(value); return this.#points.get(site)?.removed === true; }), "FINAL_RETURN_AND_POINTS_REMOVED"); }
    if (role !== "driver" && role !== "context" && role !== "run") { this.#packet(role); } return this.#top(role);
  }
  async #advance(command: Extract<Command, { phase: "via-main-structure-step" }>): Promise<unknown> {
    need(this.#pending === null, "PENDING_STEP"); const held = this.#ready(command.role); this.#step += 1; this.#pending = Object.freeze({ identity: held.identity, role: command.role, expected: this.#host.expected() }); this.#consumed = false; this.#pendingId = null; this.#acknowledged = false;
    const reply = await this.#host.resume(held.identity, command); this.#same(); need(this.#consumed && this.#acknowledged, "ORIGINAL_NATIVE_ACK_REQUIRED"); z.strictObject({}).parse(reply); this.#pending = null;
    if (this.#step === STEPS.length) { this.#finish(); } return reply;
  }
  public consume(command: Command, requestId: number): Readonly<{ origin: CurrentPcbViaMainOrigin; expected: Expected; role: Step }> {
    this.#same(); this.#currentPoints(); const pending = this.#pending; const held = this.#host.pause(); need(command.phase === "via-main-structure-step" && pending !== null && !this.#consumed && this.#host.busy() && this.#host.pendingRequestId() === requestId && command.role === pending.role && pending.identity === held.identity && held.resumeAttempted && !held.resumed, "ORIGINAL_PENDING_NATIVE_GRANT"); this.#consumed = true; this.#pendingId = requestId; return Object.freeze({ origin: this.#host.origin, expected: pending.expected, role: pending.role });
  }
  public acknowledge(command: Command, requestId: number, window: CurrentPcbViaMainStructureNativeWindow | null): void {
    this.#same(); const pending = this.#pending; need(command.phase === "via-main-structure-step" && pending !== null && this.#consumed && !this.#acknowledged && this.#pendingId === requestId && command.role === pending.role, "ORIGINAL_PENDING_ACK");
    if (command.role === "run") { need(window !== null && this.#window === null && window.afterEpochMs === 0, "ORIGINAL_NATIVE_START"); this.#window = window; }
    else if (command.role === "callback") { need(window !== null && this.#window !== null && window.beforeEpochMs === this.#window.beforeEpochMs && window.afterEpochMs >= window.beforeEpochMs && window.afterEpochMs - window.beforeEpochMs <= 120_000, "ORIGINAL_NATIVE_CALLBACK_WINDOW"); this.#window = window; }
    else { need(window === null, "UNEXPECTED_NATIVE_WINDOW"); } this.#acknowledged = true;
  }
  #finish(): void {
    need(this.#loan !== null && this.#normal === LIMITS.normal && this.#step === STEPS.length && this.#callbackValue !== null && this.#window !== null && this.#window.afterEpochMs > 0 && this.#finalValue && this.#responseValue && this.#result === null, "COMPLETE_ORIGINAL_SCHEDULE");
    const expected = this.#host.expected(); const baseline = this.#host.baseline(); this.#host.returnCallback(this.#loan); this.#callbackReturned = true;
    this.#result = freezeDeep({ schema: "private.current-project-structure-sql-effects.v1", projectUuid: expected.projectUuid, branchUuid: expected.branchUuid, initialLogicalSha256: baseline.initialLogicalSha256,
      previousTicket: 1, previousStructureText: baseline.structure.structure, ticket: expected.ticket, structureText: expected.structureText, selectedRows: 1, nativeChanges: 1, nativeLastID: this.#callbackValue.lastID,
      nativeBeforeEpochMs: this.#window.beforeEpochMs, nativeAfterEpochMs: this.#window.afterEpochMs, originalServiceAwaitCompleted: true, originalControllerBodyVerified: true, originalResponseFinalizerReturned: true, selectedSqlStillFenced: true });
  }
  public result(): CurrentProjectStructureSqlEffects { this.#same(); this.#currentPoints(); need(this.#result !== null && this.#pending === null && this.#step === STEPS.length, "ORIGINAL_RESULT"); return this.#result; }
}
