/** Actual original callback entry receipt; no continuation is represented. */
import { CURRENT_SCHEMATIC_RELEVANCE_ACTION_CALLBACK_CALLS as CALLS, CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_ENTRY_FLAGS as FLAGS, CURRENT_SCHEMATIC_RELEVANCE_ACTION_CALLBACK_REQUESTS as REQUESTS, validateCurrentSchematicRelevanceDisplayModifyEntryCommand as validate } from "./current-schematic-relevance-display-modify-entry-protocol.ts";
import type { CurrentSchematicRelevanceDisplayModifyEntryCommand as Command } from "./current-schematic-relevance-display-modify-entry-protocol.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_ACTION_CALLBACK_EXPRESSIONS as EXPRESSIONS } from "./current-schematic-relevance-action-callback-programs.ts";
import { currentSchematicRelevancePrefixCapture as capture, currentSchematicRelevancePrefixHandle as handle, currentSchematicRelevancePrefixProperties as properties, currentSchematicRelevancePrefixTrue as truth, currentSchematicRelevancePrefixTuple as tuple } from "./current-schematic-relevance-run-prefix-replies.ts";
import type { CurrentSchematicRelevancePrefixRemote as Remote } from "./current-schematic-relevance-run-prefix-replies.ts";
import type { CurrentSchematicRelevanceRawCapture } from "./current-schematic-relevance-action-raw-cursor.ts";

function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_RELEVANCE_ORIGINAL_CALLBACK_CURSOR"); } }
function originalObjects(values: readonly Remote[]): void { for (const value of values) { need(value.type === "object" && value.subtype !== "proxy" && value.subtype !== "null" && (value.subtype === undefined || value.subtype === "array")); handle(value); } }
export interface CurrentSchematicRelevanceActionCallbackEntry {
  readonly frameCaptureObjectId: string; readonly contextObjectId: string; readonly detailsObjectId: string; readonly boundObjectId: string; readonly activeActionObjectId: string; readonly monitorObjectId: string; readonly busGroupSetObjectId: string;
  readonly originalRequests: 10; readonly actualCallbackEntryObserved: true; readonly activeActionCalleesQualified: false; readonly continuationAuthorized: false;
}
export class CurrentSchematicRelevanceActionCallbackCursor {
  readonly #frame: string; readonly #holder: string; readonly #raw: CurrentSchematicRelevanceRawCapture;
  readonly #plan: Generator<Command, CurrentSchematicRelevanceActionCallbackEntry, unknown>;
  #pending: Command | null = null; #reserved = false; #failed = false; #reads = 0; #completed: CurrentSchematicRelevanceActionCallbackEntry | null = null;
  public constructor(frame: string, holder: string, raw: CurrentSchematicRelevanceRawCapture) { this.#frame = frame; this.#holder = holder; this.#raw = raw; this.#plan = this.#collect(); Object.freeze(this); }
  static #properties(objectId: string): Command { return validate({ phase: "schematic-callback-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }); }
  static #call(phase: typeof CALLS[number][0], objectId: string, args: readonly string[]): Command {
    const row = CALLS.find(item => item[0] === phase); need(row !== undefined && row[2] === args.length);
    return validate({ phase, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId, functionDeclaration: row[1], arguments: args.map(id => ({ objectId: id })), returnByValue: row[3], awaitPromise: false, userGesture: false } });
  }
  *#collect(): Generator<Command, CurrentSchematicRelevanceActionCallbackEntry, unknown> {
    const raw = this.#raw;
    const frame = capture(yield validate({ phase: "schematic-callback-entry-frame", method: "Debugger.evaluateOnCallFrame", params: { ...FLAGS, callFrameId: this.#frame, expression: EXPRESSIONS.entry, returnByValue: false, includeCommandLineAPI: false } }));
    const fields = tuple(yield CurrentSchematicRelevanceActionCallbackCursor.#properties(frame), 2); need(fields[0]?.type === "object" && fields[0].subtype === "array" && fields[1]?.type === "function"); const context = handle(fields[0]);
    const contextFields = tuple(yield CurrentSchematicRelevanceActionCallbackCursor.#properties(context), 7); originalObjects(contextFields); need(contextFields[0]?.subtype === "array" && contextFields[4]?.subtype === "array");
    const details = capture(yield CurrentSchematicRelevanceActionCallbackCursor.#call("schematic-callback-details", context, [raw.nativeObjectId])); const detailFields = tuple(yield CurrentSchematicRelevanceActionCallbackCursor.#properties(details), 3); originalObjects(detailFields); need(detailFields[0]?.subtype === "array");
    const args = [raw.nativeObjectId, raw.referencesObjectId, this.#holder, details]; const bound = capture(yield CurrentSchematicRelevanceActionCallbackCursor.#call("schematic-callback-bind", frame, args)); const boundFields = tuple(yield CurrentSchematicRelevanceActionCallbackCursor.#properties(bound), 13); originalObjects(boundFields.slice(0,12)); need(boundFields[12]?.type === "object" && boundFields[12].subtype === "set" && boundFields[12].className === "Set");
    const busSet = handle(boundFields[12]); const set = properties(yield CurrentSchematicRelevanceActionCallbackCursor.#properties(busSet)); const internals = new Map((set.internalProperties ?? []).map(item => [item.name, item.value])); need(set.result.length === 0 && internals.size === 2 && internals.has("[[Prototype]]") && internals.get("[[Entries]]")?.type === "object" && internals.get("[[Entries]]")?.subtype === "array" && internals.get("[[Entries]]")?.description === "Array(0)");
    const active = handle(boundFields[10]), monitor = handle(boundFields[11]);
    truth(yield CurrentSchematicRelevanceActionCallbackCursor.#call("schematic-callback-after-run", raw.snapshotObjectId, [raw.nativeObjectId, raw.referencesObjectId, active, busSet]));
    truth(yield CurrentSchematicRelevanceActionCallbackCursor.#call("schematic-callback-same", frame, [...args, bound]));
    return Object.freeze({ frameCaptureObjectId: frame, contextObjectId: context, detailsObjectId: details, boundObjectId: bound, activeActionObjectId: active, monitorObjectId: monitor, busGroupSetObjectId: busSet, originalRequests: 10, actualCallbackEntryObserved: true, activeActionCalleesQualified: false, continuationAuthorized: false });
  }
  public next(): Command | null { need(!this.#failed && !this.#reserved); if (this.#pending !== null) { return this.#pending; } if (this.#completed !== null) { return null; } const item = this.#plan.next(); need(item.done !== true); this.#pending = item.value; return this.#pending; }
  public reserve(command: Command): void { need(!this.#failed && !this.#reserved && this.next() === command); this.#reserved = true; this.#reads += 1; need(this.#reads <= REQUESTS.entry); }
  public accept(command: Command, reply: unknown): void { need(!this.#failed && this.#reserved && this.#pending === command); try { const item = this.#plan.next(reply); this.#reserved = false; this.#pending = null; if (item.done === true) { need(this.#reads === REQUESTS.entry); this.#completed = item.value; } else { this.#pending = item.value; } } catch (caughtError) { this.#failed = true; throw caughtError; } }
  public requireCompleted(): CurrentSchematicRelevanceActionCallbackEntry { need(!this.#failed && !this.#reserved && this.#pending === null && this.#completed !== null); return this.#completed; }
  public fail(): void { this.#failed = true; }
}
