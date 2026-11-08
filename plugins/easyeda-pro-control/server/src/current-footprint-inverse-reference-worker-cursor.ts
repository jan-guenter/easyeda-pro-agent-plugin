/** Private child of the original worker controller. This cursor authenticates
 * its event stream and fixed helper receipts; it cannot issue owner tokens. */
import { z } from "zod";
import type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";
import { captureCurrentFootprintInverseDeleteBindingReply as capture } from "./current-footprint-inverse-delete-binding-capture.ts";
import { CURRENT_FOOTPRINT_INVERSE_DELETE_NATIVE_EVENT_CALLERS as CALLERS } from "./current-footprint-inverse-delete-native-event-source.ts";
import { CURRENT_FOOTPRINT_INVERSE_REFERENCE_WORKER_ORDER as ORDER, CURRENT_FOOTPRINT_INVERSE_REFERENCE_WORKER_ROLES as ROLES, CURRENT_FOOTPRINT_INVERSE_REFERENCE_WORKER_SITES as SITES } from "./current-footprint-inverse-reference-worker-source.ts";
import type { CurrentFootprintInverseReferenceWorkerRole as Role } from "./current-footprint-inverse-reference-worker-source.ts";
import { currentFootprintInverseReferenceWorkerBudget, currentFootprintInverseReferenceWorkerProgram, qualifyCurrentFootprintInverseReferenceWorkerHelper, validateCurrentFootprintInverseReferenceWorkerCommand } from "./current-footprint-inverse-reference-worker-protocol.ts";
import type { CurrentFootprintInverseReferenceWorkerCommand as Command } from "./current-footprint-inverse-reference-worker-protocol.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const location = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const remote = z.looseObject({ type: z.string() });
const scope = z.looseObject({ type: z.string(), object: remote });
const frame = z.strictObject({ callFrameId: handle, functionName: z.string().max(128), functionLocation: location, location, url: z.string().max(8192), scopeChain: z.array(scope).max(16), this: remote, returnValue: remote.optional(), canBeRestarted: z.boolean().optional() });
const pause = z.strictObject({ method: z.literal("Debugger.paused"), sessionId: handle, params: z.strictObject({ callFrames: z.array(frame).min(1).max(16), reason: z.enum(["other", "debugCommand"]), hitBreakpoints: z.tuple([handle]), asyncStackTrace: z.unknown().optional(), asyncStackTraceId: z.unknown().optional() }) });
const point = z.strictObject({ breakpointId: handle, actualLocation: location });
type Budget = ReturnType<typeof currentFootprintInverseReferenceWorkerBudget>;
type Held = Readonly<{ event: DiagnosticEvent; role: Role; callFrameId: string; breakpointId: string; step: "entry" | typeof ORDER[number] }>;
export interface CurrentFootprintInverseReferenceWorkerCursorBindings {
  readonly scriptId: string; readonly sessionId: string; readonly executionContextId: number;
  readonly nodes: readonly number[];
  readonly current: () => Promise<void>;
  readonly request: (command: Command) => Promise<unknown>;
  readonly next: () => Promise<DiagnosticEvent>;
}
function need(value: boolean): asserts value { if (!value) { throw new Error("FOOTPRINT_INVERSE_REFERENCE_CURSOR"); } }
function empty(value: unknown): void { need(JSON.stringify(capture(value)) === "{}"); }
function at(actual: z.infer<typeof frame>, site: Readonly<{ functionName: string; functionLine: number; functionColumn: number; lineNumber: number; columnNumber: number }>, scriptId: string): void {
  need(actual.functionName === site.functionName && actual.functionLocation.scriptId === scriptId && actual.functionLocation.lineNumber === site.functionLine && actual.functionLocation.columnNumber === site.functionColumn && actual.location.scriptId === scriptId && actual.location.lineNumber === site.lineNumber && actual.location.columnNumber === site.columnNumber);
}
/** Fixed frame facts only. Native trusted delivery is checked independently. */
export function currentFootprintInverseReferenceEntryFrames(input: unknown, sessionId: string, scriptId: string, breakpointId: string): Readonly<{ entryFrame: string; nativeEventFrame: string }> {
  const event = pause.parse(capture(input)); const frames = event.params.callFrames; need(event.sessionId === sessionId && event.params.hitBreakpoints[0] === breakpointId && frames.length === CALLERS.length + 1);
  const first = frames[0], last = frames.at(-1); need(first !== undefined && last !== undefined); at(first, SITES.entry, scriptId); const ids = new Set([first.callFrameId]);
  for (const [index, caller] of CALLERS.entries()) { const actual = frames[index + 1]; need(actual !== undefined && !ids.has(actual.callFrameId)); ids.add(actual.callFrameId); at(actual, { functionName: caller.functionName, functionLine: caller.lineNumber, functionColumn: caller.columnNumber, lineNumber: caller.lineNumber, columnNumber: caller.pausedColumn }, scriptId); }
  return Object.freeze({ entryFrame: first.callFrameId, nativeEventFrame: last.callFrameId });
}
export class CurrentFootprintInverseReferenceWorkerCursor {
  readonly #b: CurrentFootprintInverseReferenceWorkerCursorBindings; readonly #budget: Budget;
  readonly #helpers: { program: string; source: string; scriptId: string | null; command: Command }[] = [];
  readonly #receipts: Readonly<{ command: Command; reply: unknown }>[] = [];
  readonly #helperScripts = new Set<string>();
  readonly #points = new Map<Role, string>(); readonly #resolutions = new Map<string, Role>(); readonly #removed = new Set<string>();
  #arming: Role | null = null; #normal = 0; #helpersAttempted = 0; #helperReads = 0;
  #ready = false; #consumed = false; #query = 0; #active = false; #held: Held | null = null; #permitted = false; #resumePending = false; #resumes = 0; #holds = 0;
  public constructor(bindings: CurrentFootprintInverseReferenceWorkerCursorBindings) { this.#b = bindings; this.#budget = currentFootprintInverseReferenceWorkerBudget(bindings.nodes); Object.freeze(this); }
  public budget(): Budget { return this.#budget; }
  public observe(event: DiagnosticEvent): boolean {
    if (event.method === "Debugger.scriptParsed" && event.params["url"] === "") {
      if (this.#query === 3 && !this.#active) { return false; }
      const expected = this.#helpers[0]; need(expected !== undefined && expected.scriptId === null && event.sessionId === this.#b.sessionId && event.params["executionContextId"] === this.#b.executionContextId); const id = handle.parse(event.params["scriptId"]); need(id !== this.#b.scriptId && !this.#helperScripts.has(id)); this.#helperScripts.add(id); expected.scriptId = id; return true;
    }
    if (event.method === "Debugger.breakpointResolved") {
      const id = handle.parse(event.params["breakpointId"]); const actual = location.parse(capture(event.params["location"]));
      const role = [...this.#points].find(([, original]) => original === id)?.[0] ?? this.#arming;
      if (role !== null && role !== undefined && actual.scriptId === this.#b.scriptId && actual.lineNumber === SITES[role].lineNumber && actual.columnNumber === SITES[role].columnNumber) { need(!this.#resolutions.has(id)); this.#resolutions.set(id, role); return true; }
    }
    return false;
  }
  public async request(input: Command): Promise<unknown> {
    const command = validateCurrentFootprintInverseReferenceWorkerCommand(input); need(command.method !== "Debugger.getScriptSource" && (!this.#ready || this.#active));
    if (command.method === "Debugger.setBreakpoint") { need(!this.#ready && this.#arming === null && !this.#points.has(command.role)); this.#arming = command.role; }
    else if (command.method === "Debugger.removeBreakpoint") { need(this.#query === 2 && this.#held !== null && this.#holds === ORDER.length && this.#helpers.length === 0 && [...this.#points.values()].includes(command.params.breakpointId) && !this.#removed.has(command.params.breakpointId)); this.#removed.add(command.params.breakpointId); }
    else if (command.method === "Debugger.resume") { need(this.#active && this.#permitted && this.#resumePending && this.#held === null); }
    else if (this.#ready) { need(this.#active && this.#held !== null && !this.#resumePending); }
    const program = currentFootprintInverseReferenceWorkerProgram(command);
    if (program !== null) { const source = command.method === "Debugger.evaluateOnCallFrame" ? program : `(${program})`; qualifyCurrentFootprintInverseReferenceWorkerHelper(source, program); need(this.#helpers.length === 0); this.#helpersAttempted += 1; need(this.#helpersAttempted <= this.#budget.helpers); this.#helpers.push({ program, source, scriptId: null, command: input }); }
    this.#normal += 1; need(this.#normal <= (this.#ready ? this.#budget.queryNormal + (this.#query === 2 ? ROLES.length : 0) : this.#budget.setupNormal));
    await this.#b.current(); const raw = await this.#b.request(command); await this.#b.current(); this.#receipts.push(Object.freeze({ command, reply: raw }));
    if (command.method === "Debugger.setBreakpoint") { const actual = point.parse(capture(raw)); const site = SITES[command.role]; need(this.#arming === command.role && actual.actualLocation.scriptId === this.#b.scriptId && actual.actualLocation.lineNumber === site.lineNumber && actual.actualLocation.columnNumber === site.columnNumber && ![...this.#points.values()].includes(actual.breakpointId) && (this.#resolutions.get(actual.breakpointId) === undefined || this.#resolutions.get(actual.breakpointId) === command.role)); this.#points.set(command.role, actual.breakpointId); this.#arming = null; }
    if (command.method === "Debugger.removeBreakpoint") { empty(raw); }
    return raw;
  }
  public async qualifyHelper(command: Command): Promise<void> {
    const expected = this.#helpers[0]; need(expected !== undefined && expected.command === command && expected.scriptId !== null);
    const read: Command = { phase: "inverse-reference-worker-helper", method: "Debugger.getScriptSource", params: { scriptId: expected.scriptId } };
    this.#helperReads += 1; need(this.#helperReads <= this.#budget.helpers); await this.#b.current(); const raw = await this.#b.request(read); await this.#b.current();
    const captured = z.strictObject({ scriptSource: z.string() }).parse(capture(raw)); qualifyCurrentFootprintInverseReferenceWorkerHelper(captured.scriptSource, expected.program); need(this.#helpers[0] === expected); this.#receipts.push(Object.freeze({ command: read, reply: raw })); this.#helpers.shift();
  }
  public points(): ReadonlyMap<Role, string> { return new Map(this.#points); }
  public prepareComplete(): void { need(!this.#ready && this.#arming === null && this.#points.size === ROLES.length && this.#normal === this.#budget.setupNormal && this.#helpersAttempted === this.#budget.setupHelpers && this.#helperReads === this.#helpersAttempted && this.#helpers.length === 0); this.#ready = true; }
  public requireReady(): void { need(this.#ready && !this.#consumed && !this.#active && this.#query === 0 && this.#helpers.length === 0); }
  public consume(): void { this.requireReady(); this.#consumed = true; }
  public requireCustody(): void { need(this.#ready && this.#helpers.length === 0 && this.#helperReads === this.#helpersAttempted && this.#points.size === ROLES.length); }
  public beginQuery(index: number): void { this.requireCustody(); need(this.#consumed && !this.#active && index === this.#query && index < 3 && this.#held === null && !this.#resumePending); this.#active = true; this.#permitted = false; this.#normal = 0; this.#resumes = 0; this.#holds = 0; }
  public async entry(): Promise<Readonly<{ event: DiagnosticEvent; entryFrame: string; nativeEventFrame: string; breakpointId: string }>> {
    need(this.#active && this.#held === null && this.#resumes === 0); const breakpointId = this.#points.get("entry"); need(breakpointId !== undefined); const raw = await this.#b.next(); const frames = currentFootprintInverseReferenceEntryFrames(raw, this.#b.sessionId, this.#b.scriptId, breakpointId); this.#held = Object.freeze({ event: raw, role: "entry", callFrameId: frames.entryFrame, breakpointId, step: "entry" }); return Object.freeze({ event: raw, ...frames, breakpointId });
  }
  public requireEntry(event: DiagnosticEvent): void { need(this.#active && !this.#permitted && this.#held?.event === event && this.#held.role === "entry" && this.#resumes === 0); }
  public permit(event: DiagnosticEvent): void { this.requireEntry(event); need(this.#normal === this.#budget.entryNormal && this.#helpers.length === 0); this.#permitted = true; }
  public reserveResume(): void { need(this.#active && this.#permitted && this.#held !== null && !this.#resumePending && this.#resumes === this.#holds && this.#resumes < ORDER.length + 1 && this.#helpers.length === 0 && (this.#query !== 2 || this.#resumes < ORDER.length || this.#removed.size === ROLES.length)); this.#held = null; this.#resumePending = true; this.#resumes += 1; }
  public async resumed(): Promise<void> { need(this.#resumePending); const event = await this.#b.next(); need(event.method === "Debugger.resumed" && event.sessionId === this.#b.sessionId && Reflect.ownKeys(event.params).length === 0); this.#resumePending = false; }
  public async nextPause(): Promise<Held> {
    need(this.#active && this.#permitted && this.#held === null && !this.#resumePending && this.#resumes === this.#holds + 1); const raw = await this.#b.next(); const event = pause.parse(capture(raw)); const step = ORDER[this.#holds]; const frameValue = event.params.callFrames[0]; need(step !== undefined && frameValue !== undefined && event.sessionId === this.#b.sessionId); const role = ROLES.find(candidate => candidate === step.split("-")[0]); need(role !== undefined); const breakpointId = this.#points.get(role); need(breakpointId !== undefined && event.params.hitBreakpoints[0] === breakpointId); at(frameValue, SITES[role], this.#b.scriptId); this.#holds += 1; this.#held = Object.freeze({ event: raw, role, callFrameId: frameValue.callFrameId, breakpointId, step }); return this.#held;
  }
  public complete(): void { need(this.#active && this.#held === null && !this.#resumePending && this.#holds === ORDER.length && this.#resumes === ORDER.length + 1 && this.#normal === this.#budget.queryNormal + (this.#query === 2 ? ROLES.length : 0) && this.#helpers.length === 0 && this.#helperReads === this.#helpersAttempted && this.#removed.size === (this.#query === 2 ? ROLES.length : 0)); this.#active = false; this.#query += 1; }
  public requireCompleted(index: number): void { need(this.#ready && this.#consumed && this.#query > index && this.#query <= 3); }
}
