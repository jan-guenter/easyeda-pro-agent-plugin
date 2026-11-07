/** One original UI pause lane. It shares the owner's existing event stream;
 * it never polls, resumes a pause or treats a timeout as completion. */
import { z } from "zod";
import type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";
import type { CurrentSchematicRelevanceDisplayAccessorFunctions } from "./current-schematic-relevance-display-accessor-observer.ts";
import { GENERATED_SCHEMATIC_DISPLAY_ACCESSOR_SOURCE as SOURCES } from "./generated-schematic-display-accessor-source.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_ACTION_MARKERS as MARKERS } from "./current-schematic-relevance-display-action-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_CALLBACK_LOCATION as CALLBACK } from "./current-schematic-relevance-display-modify-entry-replies.ts";
import { validateCurrentSchematicRelevanceDisplayModifyEntryCommand as validate } from "./current-schematic-relevance-display-modify-entry-protocol.ts";
import type { CurrentSchematicRelevanceDisplayModifyEntryCommand as Command } from "./current-schematic-relevance-display-modify-entry-protocol.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const point = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const frame = z.object({ callFrameId: handle, functionLocation: point, location: point });
const roles = ["setAttribute", "record", "ast"] as const;
const functionKeys = Object.freeze({ setAttribute: "setAttributeObjectId", record: "recordObjectId", ast: "astObjectId" } as const);
const sourceKeys = Object.freeze({ setAttribute: "monitorSetAttribute", record: "monitorRecord", ast: "monitorAst" } as const);
export type CurrentSchematicRelevanceActionCallbackRole = "entry" | "setter" | "finish" | "failure" | typeof roles[number];
export interface CurrentSchematicRelevanceActionCallbackHeld { readonly event: DiagnosticEvent; readonly role: CurrentSchematicRelevanceActionCallbackRole; readonly callFrameId: string }
export interface CurrentSchematicRelevanceActionCallbackHost {
  readonly sessionId: string; readonly callbackScriptId: string; readonly sourceScriptId: string; readonly variant: 0 | 1; readonly functions: CurrentSchematicRelevanceDisplayAccessorFunctions;
  readonly request: (command: Command) => Promise<unknown>; readonly assertCurrent: () => void; readonly fail: () => void;
}
function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_RELEVANCE_ORIGINAL_CALLBACK_EVENT"); } }
export class CurrentSchematicRelevanceActionCallbackController {
  readonly #host: CurrentSchematicRelevanceActionCallbackHost;
  readonly #points = new Map<string, typeof roles[number]>(); readonly #entry = Promise.withResolvers<CurrentSchematicRelevanceActionCallbackHeld | null>();
  #attempted = false; #armed = false; #failed = false; #held: CurrentSchematicRelevanceActionCallbackHeld | null = null;
  public constructor(host: CurrentSchematicRelevanceActionCallbackHost) { this.#host = host; handle.parse(host.sessionId); handle.parse(host.callbackScriptId); handle.parse(host.sourceScriptId); Object.freeze(this); }
  public async arm(): Promise<void> {
    need(!this.#attempted && !this.#failed); this.#attempted = true;
    try {
      for (const role of roles) {
        this.#host.assertCurrent(); const objectId = this.#host.functions[functionKeys[role]];
        const command = validate({ phase: `schematic-callback-arm-${role}`, method: "Debugger.setBreakpointOnFunctionCall", params: { objectId, condition: "" } });
        const reply = z.strictObject({ breakpointId: handle }).parse(captureCurrentPcbStringClockReply(await this.#host.request(command)).value); this.#host.assertCurrent(); need(!this.#points.has(reply.breakpointId)); this.#points.set(reply.breakpointId, role);
      }
      this.#armed = true; this.assertArmed();
    } catch (caughtError) { this.fail(); throw caughtError; }
  }
  public assertArmed(): void { this.#host.assertCurrent(); need(!this.#failed && this.#armed && this.#points.size === roles.length ); }
  #role(event: DiagnosticEvent): CurrentSchematicRelevanceActionCallbackRole | null {
    const ids = event.params["hitBreakpoints"]; const frames = event.params["callFrames"]; if (!Array.isArray(frames) || frames.length === 0 || !Array.isArray(ids)) { return null; }
    const first = frame.parse(frames[0]);
    if (ids.some(id => typeof id === "string" && this.#points.has(id))) {
      need(ids.length === 1 && typeof ids[0] === "string"); const role = this.#points.get(ids[0]); need(role !== undefined);
      const expected = SOURCES[this.#host.variant].methods[sourceKeys[role]];
      need(first.functionLocation.scriptId === this.#host.sourceScriptId && first.functionLocation.lineNumber === expected.lineNumber && first.functionLocation.columnNumber === expected.columnNumber && first.location.scriptId === this.#host.sourceScriptId); return role;
    }
    if (first.functionLocation.scriptId !== this.#host.callbackScriptId) { return null; }
    need(ids.length === 0 && first.functionLocation.lineNumber === CALLBACK.lineNumber && first.functionLocation.columnNumber === CALLBACK.columnNumber && first.location.scriptId === this.#host.callbackScriptId);
    const marker = MARKERS.find(value => value.lineNumber === first.location.lineNumber && value.columnNumber === first.location.columnNumber); need(marker !== undefined); return marker.role;
  }
  public observeOriginalEvent(event: DiagnosticEvent): boolean {
    if (event.sessionId !== this.#host.sessionId || event.method !== "Debugger.paused") { return false; }
    try {
      const role = this.#role(event); if (role === null) { return false; } this.#host.assertCurrent(); need(!this.#failed && this.#armed && this.#held === null && event.params["reason"] === "other");
      const frames = event.params["callFrames"]; need(Array.isArray(frames)); const first = frame.parse(frames[0]); const held = Object.freeze({ event, role, callFrameId: first.callFrameId }); this.#held = held;
      // No continuation is available until the entry's original active-action
      // And subsequent receiver proofs have their own finite grant.
      need(role === "entry"); this.#entry.resolve(held); return true;
    } catch { this.fail(); return true; }
  }
  public async waitOriginalEntry(): Promise<CurrentSchematicRelevanceActionCallbackHeld> { const held = await this.#entry.promise; need(held !== null && !this.#failed && this.#held === held); this.#host.assertCurrent(); return held; }
  public requireHeld(held: CurrentSchematicRelevanceActionCallbackHeld): void { this.#host.assertCurrent(); need(!this.#failed && this.#held === held && held.event.sessionId === this.#host.sessionId); }
  public fail(): void { if (!this.#failed) { this.#failed = true; this.#entry.resolve(null); this.#host.fail(); } }
}
