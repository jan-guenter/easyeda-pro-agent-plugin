/** Original-cursor import/opening capture composition. Only its owning Main
 * engine creates this helper; a supplied host cannot issue native authority. */
/* oxlint-disable import/max-dependencies -- Retain original source/reader joins and independent native metadata decoders beside the fixed capture/read composition. */
import { z } from "zod";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_SOURCE as SQL_SOURCE, qualifyCurrentSelectedFileMainSqlFenceSource } from "./current-selected-file-main-sql-fence-source.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_CAPTURE_PROGRAM as SQL_CAPTURE, CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_REQUIRE_PROGRAM as SQL_REQUIRE } from "./current-selected-file-main-sql-fence-programs.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_CALL_FLAGS as CALL, CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_EARLY_ID as EARLY,
  CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_FRAME_FLAGS as FRAME, CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_NATIVE_EXPRESSION as NATIVE } from "./current-selected-file-main-sql-fence-protocol.ts";
import { currentSelectedFileMainSqlFenceImportsError, decodeCurrentSelectedFileMainSqlFenceNative, decodeCurrentSelectedFileMainSqlFenceNativeArray } from "./current-selected-file-main-sql-fence-replies.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_APP_URL_PATTERN as URL, decodeCurrentFootprintCopyMainBackendNative } from "./current-footprint-copy-main-backend-contract.ts";
import { CURRENT_FOOTPRINT_FORWARD_HEAD_FRAME, CURRENT_FOOTPRINT_FORWARD_HEAD_GROUP as GROUP } from "./current-footprint-forward-head-programs.ts";
import { CURRENT_FOOTPRINT_FORWARD_HEAD_OPEN_POINT as OPEN, qualifyCurrentFootprintForwardHeadSource } from "./current-footprint-forward-head-source.ts";
import { requireCurrentFootprintCopyHeadReference } from "./current-footprint-copy-head-reference.ts";
import { CurrentFootprintForwardHeadController } from "./current-footprint-forward-head-controller.ts";
import type { CurrentFootprintForwardHeadHost, CurrentFootprintForwardHeadRead } from "./current-footprint-forward-head-controller.ts";
import type { CurrentFootprintForwardHeadMainCommand as Command } from "./current-footprint-forward-head-protocol.ts";
import type { CurrentFootprintForwardHeadSource } from "./current-footprint-forward-head-origin.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$(?![\s\S])/u);
const location = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const point = z.strictObject({ breakpointId: handle, actualLocation: location });
const object = z.strictObject({ result: z.strictObject({ type: z.literal("object"), subtype: z.literal("array"), className: z.literal("Array"), description: z.string(), objectId: handle }) });
const yes = z.strictObject({ result: z.strictObject({ type: z.literal("boolean"), value: z.literal(true) }) });
type Site = "import" | "afterImports" | "open";
export interface CurrentFootprintForwardHeadPause {
  readonly identity: object; readonly frameId: string; readonly location: Readonly<z.infer<typeof location>>; readonly site: Site;
}
export interface CurrentFootprintForwardHeadMainHost {
  readonly source: CurrentFootprintForwardHeadSource;
  readonly assertCurrent: () => void;
  readonly request: (command: Command, cleanup: boolean) => Promise<unknown>;
  readonly pendingRequestId: () => number | null;
  readonly qualifySource: (scriptId: string) => Promise<string>;
  readonly waitPause: (site: Site) => Promise<CurrentFootprintForwardHeadPause>;
  readonly resume: (pause: CurrentFootprintForwardHeadPause) => Promise<void>;
  readonly constructionObjectId: () => string;
}
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`FORWARD_HEAD_MAIN_${code}`); } }
export class CurrentFootprintForwardHeadMain {
  readonly #host: CurrentFootprintForwardHeadMainHost;
  readonly #points = new Map<string, Site>();
  #scriptId: string | null = null;
  #arming: Site | null = null;
  #armed = false; #captured = false; #readAttempted = false;
  #sql: string | null = null;
  #sharesSelectedSql = false;
  #after: string | null = null;
  #open: string | null = null;
  #reader: CurrentFootprintForwardHeadController | null = null;
  #activeRead: Command | null = null;
  #packet: CurrentFootprintForwardHeadRead | null = null;
  public constructor(host: CurrentFootprintForwardHeadMainHost) { this.#host = host; Object.freeze(this); }
  #same(): void { this.#host.assertCurrent(); const { before, sourcePlan, reference } = this.#host.source; requireCurrentFootprintCopyHeadReference(reference, before, sourcePlan); }
  public site(id: string, actual: Readonly<z.infer<typeof location>>): Site | null {
    const selected = this.#points.get(id); if (selected === undefined) { return null; }
    const expected = selected === "open" ? OPEN : SQL_SOURCE.sites[selected];
    const column = selected === "open" ? OPEN.columnNumber : SQL_SOURCE.sites[selected].breakpointColumnNumber;
    need(actual.lineNumber === expected.lineNumber && actual.columnNumber === column && (this.#scriptId === null || actual.scriptId === this.#scriptId), "POINT_LOCATION"); return selected;
  }
  public resolve(id: string, actual: Readonly<z.infer<typeof location>>): boolean {
    if (!this.#points.has(id)) { if (this.#arming === null) { return false; } this.#points.set(id, this.#arming); }
    return this.site(id, actual) !== null;
  }
  #remember(id: string, selected: Site, actual: Readonly<z.infer<typeof location>>): void {
    const existing = this.#points.get(id);
    need((existing === undefined || existing === selected) && [...this.#points].every(([key, value]) => value !== selected || key === id), "ORIGINAL_ALLOCATED_POINT");
    this.#points.set(id, selected); this.site(id, actual);
  }
  public async arm(): Promise<void> {
    this.#same(); need(!this.#armed, "ARM_CONSUMED"); this.#armed = true; this.#points.set(EARLY, "import");
    const reply = z.strictObject({ breakpointId: z.literal(EARLY), locations: z.array(location).max(1) }).parse(await this.#host.request({ phase: "forward-head-sql", command: {
      phase: "sql-fence-early-arm", method: "Debugger.setBreakpointByUrl", params: { urlRegex: URL, lineNumber: SQL_SOURCE.sites.import.lineNumber, columnNumber: SQL_SOURCE.sites.import.breakpointColumnNumber } } }, false));
    this.#same(); for (const actual of reply.locations) { this.site(reply.breakpointId, actual); }
  }
  public async capture(): Promise<void> {
    this.#same(); need(this.#armed && !this.#captured, "CAPTURE_CONSUMED"); this.#captured = true;
    const initial = await this.#host.waitPause("import"); this.#same(); this.#scriptId = initial.location.scriptId;
    const source = await this.#host.qualifySource(this.#scriptId); this.#same(); qualifyCurrentSelectedFileMainSqlFenceSource(source); qualifyCurrentFootprintForwardHeadSource(source);
    this.#arming = "afterImports";
    const after = point.parse(await this.#host.request({ phase: "forward-head-sql", command: { phase: "sql-fence-after-imports-arm", method: "Debugger.setBreakpoint",
      params: { location: { scriptId: this.#scriptId, lineNumber: SQL_SOURCE.sites.afterImports.lineNumber, columnNumber: SQL_SOURCE.sites.afterImports.breakpointColumnNumber } } } }, false));
    this.#after = after.breakpointId; this.#remember(after.breakpointId, "afterImports", after.actualLocation);
    await this.#armOpen();
    await this.#remove(EARLY); await this.#host.resume(initial); this.#same();
    const held = await this.#host.waitPause("afterImports"); this.#same();
    const frame = object.parse(await this.#host.request({ phase: "forward-head-sql", command: { phase: "sql-fence-frame", site: "afterImports", method: "Debugger.evaluateOnCallFrame",
      params: { ...FRAME, callFrameId: held.frameId, expression: SQL_SOURCE.sites.afterImports.expression } } }, false));
    need(frame.result.description === "Array(4)", "IMPORT_FRAME");
    const properties = (objectId: string): Promise<unknown> => this.#host.request({ phase: "forward-head-sql", command: { phase: "sql-fence-properties", method: "Runtime.getProperties",
      params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } } }, false);
    need(currentSelectedFileMainSqlFenceImportsError(await properties(frame.result.objectId)) === null, "IMPORT_METADATA"); this.#same();
    const capture = object.parse(await this.#host.request({ phase: "forward-head-sql", command: { phase: "sql-fence-capture", method: "Runtime.callFunctionOn", params: {
      ...CALL, objectId: frame.result.objectId, functionDeclaration: SQL_CAPTURE, arguments: [{ value: this.#host.source.rawWindowsPath }], returnByValue: false } } }, false));
    need(capture.result.description === "Array(11)", "ORIGINAL_SCOPE"); this.#sql = capture.result.objectId;
    const natives = object.parse(await this.#host.request({ phase: "forward-head-sql", command: { phase: "sql-fence-native-frame", method: "Debugger.evaluateOnCallFrame",
      params: { ...FRAME, callFrameId: held.frameId, expression: NATIVE } } }, false)); need(natives.result.description === "Array(5)", "NATIVE_FRAME");
    const ids = decodeCurrentSelectedFileMainSqlFenceNativeArray(await properties(natives.result.objectId));
    for (const [index, role] of [[0, "Database"], [1, "Statement"], [2, "proxy"]] as const) { const id = ids[index]; need(id !== undefined, "NATIVE_MEMBER"); decodeCurrentSelectedFileMainSqlFenceNative(await properties(id), role); this.#same(); }
    for (const [index, role] of [[3, "Date"], [4, "now"]] as const) { const id = ids[index]; need(id !== undefined, "NATIVE_DATE"); decodeCurrentFootprintCopyMainBackendNative(await properties(id), role); this.#same(); }
    yes.parse(await this.#host.request({ phase: "forward-head-sql", command: { phase: "sql-fence-require", method: "Runtime.callFunctionOn",
      params: { ...CALL, objectId: this.#sql, functionDeclaration: SQL_REQUIRE, arguments: [], returnByValue: true } } }, false));
    this.#same(); need(this.#after !== null, "ORIGINAL_AFTER_POINT"); await this.#remove(this.#after); await this.#host.resume(held); this.#same();
  }
  /** Reuse the same runner's original SQL capture during its after-imports hold. */
  public async captureSelectedSql(scriptId: string, originalSql: string): Promise<void> {
    this.#same();
    need(!this.#armed && !this.#captured && this.#sql === null, "CAPTURE_CONSUMED");
    this.#armed = true;
    this.#captured = true;
    this.#sharesSelectedSql = true;
    this.#scriptId = handle.parse(scriptId);
    this.#sql = handle.parse(originalSql);
    const source = await this.#host.qualifySource(this.#scriptId);
    this.#same(); qualifyCurrentFootprintForwardHeadSource(source);
    await this.#armOpen();
  }
  async #armOpen(): Promise<void> {
    this.#same();
    need(this.#scriptId !== null && this.#open === null, "ORIGINAL_OPEN_POINT");
    this.#arming = "open";
    const open = point.parse(await this.#host.request({ phase: "forward-head-open", command: { phase: "arm", method: "Debugger.setBreakpoint", params: {
      location: { scriptId: this.#scriptId, lineNumber: OPEN.lineNumber, columnNumber: OPEN.columnNumber } } } }, false));
    this.#open = open.breakpointId; this.#remember(open.breakpointId, "open", open.actualLocation); this.#arming = null;
    this.#same();
  }
  async #remove(breakpointId: string): Promise<void> {
    need(this.#points.has(breakpointId), "ORIGINAL_REMOVE"); z.strictObject({}).parse(await this.#host.request({ phase: "forward-head-open", command: {
      phase: "remove", method: "Debugger.removeBreakpoint", params: { breakpointId } } }, true)); this.#points.delete(breakpointId); this.#same();
  }
  /** The original Main sender calls this only for the active inner reader.
   * All outer commands remain bound to that Main engine's own pending ID. */
  public consume(command: Command, requestId: number): void {
    this.#same();
    if (command.phase === "forward-head-read") { need(this.#reader !== null && this.#activeRead === command, "ORIGINAL_READER_REQUEST"); this.#reader.consume(command.command, requestId); }
  }
  public async observeOpening(): Promise<CurrentFootprintForwardHeadRead> {
    this.#same(); need(this.#captured && !this.#readAttempted && this.#sql !== null, "READ_CONSUMED"); this.#readAttempted = true;
    const held = await this.#host.waitPause("open"); this.#same();
    const frame = object.parse(await this.#host.request({ phase: "forward-head-open", command: { phase: "frame", method: "Debugger.evaluateOnCallFrame", params: {
      ...FRAME, objectGroup: GROUP, callFrameId: held.frameId, expression: CURRENT_FOOTPRINT_FORWARD_HEAD_FRAME } } }, false)); need(frame.result.description === "Array(4)", "OPEN_FRAME");
    const reader = new CurrentFootprintForwardHeadController(Object.freeze<CurrentFootprintForwardHeadHost>({ assertCurrent: (): void => { this.#same(); }, pendingRequestId: this.#host.pendingRequestId,
      afterReadQueued: async (): Promise<void> => {
        this.#same(); need(this.#open !== null, "ORIGINAL_OPEN_POINT"); await this.#remove(this.#open); await this.#host.resume(held); this.#same();
      },
      send: async (command, cleanup): Promise<unknown> => {
        const wrapped: Command = { phase: "forward-head-read", command }; this.#activeRead = wrapped;
        try { return await this.#host.request(wrapped, cleanup); } finally { this.#activeRead = null; }
      } }), { before: this.#host.source.before, sourcePlan: this.#host.source.sourcePlan, reference: this.#host.source.reference,
      frameObjectId: frame.result.objectId, sqlScopeObjectId: this.#sql, constructionObjectId: this.#host.constructionObjectId() });
    this.#reader = reader; this.#packet = await reader.observe(); this.#same(); await reader.release(); this.#same();
    if (!this.#sharesSelectedSql) {
      z.strictObject({}).parse(await this.#host.request({ phase: "forward-head-open", command: { phase: "release", method: "Runtime.releaseObjectGroup", params: { objectGroup: FRAME.objectGroup } } }, true));
    }
    this.#same(); return this.#packet;
  }
}
