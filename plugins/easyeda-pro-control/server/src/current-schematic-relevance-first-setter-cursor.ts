/** Eight correlated readonly calls at the actual first setter marker. */
import { CURRENT_SCHEMATIC_RELEVANCE_ACTION_CALLBACK_CALLS as CALLS, CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_ENTRY_FLAGS as FLAGS, CURRENT_SCHEMATIC_RELEVANCE_ACTION_CALLBACK_REQUESTS as REQUESTS, validateCurrentSchematicRelevanceDisplayModifyEntryCommand as validate } from "./current-schematic-relevance-display-modify-entry-protocol.ts";
import type { CurrentSchematicRelevanceDisplayModifyEntryCommand as Command } from "./current-schematic-relevance-display-modify-entry-protocol.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_FIRST_SETTER_EXPRESSION as EXPRESSION } from "./current-schematic-relevance-first-setter-programs.ts";
import { currentSchematicRelevancePrefixCapture as capture, currentSchematicRelevancePrefixHandle as handle, currentSchematicRelevancePrefixTrue as truth, currentSchematicRelevancePrefixTuple as tuple } from "./current-schematic-relevance-run-prefix-replies.ts";
import type { CurrentSchematicRelevanceActionCallbackEntry } from "./current-schematic-relevance-action-callback-cursor.ts";
import type { CurrentSchematicRelevanceRawCapture } from "./current-schematic-relevance-action-raw-cursor.ts";
import type { CurrentSchematicRelevanceDisplayUnderlineFunctions } from "./current-schematic-relevance-display-accessor-observer.ts";

function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_RELEVANCE_ORIGINAL_FIRST_SETTER"); } }
export interface CurrentSchematicRelevanceFirstSetterReceipt { readonly frameCaptureObjectId: string; readonly mappingTupleObjectId: string; readonly bindingTupleObjectId: string; readonly originalRequests: 8; readonly actualFirstSetterObserved: true; readonly originalUnderlineAccessorsMatched: true; readonly activeHistoryQualified: false; readonly continuationAuthorized: false }
export class CurrentSchematicRelevanceFirstSetterCursor {
  readonly #frame: string; readonly #raw: CurrentSchematicRelevanceRawCapture; readonly #entry: CurrentSchematicRelevanceActionCallbackEntry; readonly #functions: CurrentSchematicRelevanceDisplayUnderlineFunctions;
  readonly #plan: Generator<Command, CurrentSchematicRelevanceFirstSetterReceipt, unknown>;
  #pending: Command | null = null; #reserved = false; #failed = false; #reads = 0; #receipt: CurrentSchematicRelevanceFirstSetterReceipt | null = null;
  public constructor(frame: string, raw: CurrentSchematicRelevanceRawCapture, entry: CurrentSchematicRelevanceActionCallbackEntry, functions: CurrentSchematicRelevanceDisplayUnderlineFunctions) { this.#frame = frame; this.#raw = raw; this.#entry = entry; this.#functions = functions; this.#plan = this.#collect(); Object.freeze(this); }
  static #properties(objectId: string): Command { return validate({ phase: "schematic-callback-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }); }
  static #call(phase: typeof CALLS[number][0], objectId: string, args: readonly string[]): Command { const row = CALLS.find(item => item[0] === phase); need(row !== undefined && args.length === row[2]); return validate({ phase, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId, functionDeclaration: row[1], arguments: args.map(id => ({ objectId: id })), returnByValue: row[3], awaitPromise: false, userGesture: false } }); }
  *#collect(): Generator<Command, CurrentSchematicRelevanceFirstSetterReceipt, unknown> {
    const entry = this.#entry, raw = this.#raw;
    const frame = capture(yield validate({ phase: "schematic-callback-first-setter-frame", method: "Debugger.evaluateOnCallFrame", params: { ...FLAGS, callFrameId: this.#frame, expression: EXPRESSION, returnByValue: false, includeCommandLineAPI: false } })); const fields = tuple(yield CurrentSchematicRelevanceFirstSetterCursor.#properties(frame), 4);
    need(fields[0]?.type === "object" && fields[0].subtype === "array" && fields[1]?.type === "object" && fields[1].subtype === undefined && fields[2]?.type === "number" && fields[2].value === 0 && fields[3]?.type === "function"); handle(fields[0]); handle(fields[1]); handle(fields[3]);
    const mapping = capture(yield CurrentSchematicRelevanceFirstSetterCursor.#call("schematic-callback-setter-mapping", entry.boundObjectId, [raw.nativeObjectId])); const map = tuple(yield CurrentSchematicRelevanceFirstSetterCursor.#properties(mapping), 1); need(map[0]?.type === "object" && map[0].subtype === undefined && map[0].className === "Object"); handle(map[0]);
    const binding = capture(yield CurrentSchematicRelevanceFirstSetterCursor.#call("schematic-callback-setter-binding", mapping, [raw.nativeObjectId])); const selected = tuple(yield CurrentSchematicRelevanceFirstSetterCursor.#properties(binding), 1); need(selected[0]?.type === "object" && selected[0].subtype === undefined && selected[0].className === "Object"); handle(selected[0]);
    truth(yield CurrentSchematicRelevanceFirstSetterCursor.#call("schematic-callback-after-run", raw.snapshotObjectId, [raw.nativeObjectId, raw.referencesObjectId, entry.activeActionObjectId, entry.busGroupSetObjectId]));
    truth(yield CurrentSchematicRelevanceFirstSetterCursor.#call("schematic-callback-setter-proof", frame, [raw.nativeObjectId, raw.referencesObjectId, entry.boundObjectId, mapping, binding, this.#functions.getObjectId, this.#functions.setObjectId]));
    return Object.freeze({ frameCaptureObjectId: frame, mappingTupleObjectId: mapping, bindingTupleObjectId: binding, originalRequests: 8, actualFirstSetterObserved: true, originalUnderlineAccessorsMatched: true, activeHistoryQualified: false, continuationAuthorized: false });
  }
  public next(): Command | null { need(!this.#failed && !this.#reserved); if (this.#pending !== null) { return this.#pending; } if (this.#receipt !== null) { return null; } const item = this.#plan.next(); need(item.done !== true); this.#pending = item.value; return this.#pending; }
  public reserve(command: Command): void { need(!this.#failed && !this.#reserved && this.next() === command); this.#reserved = true; this.#reads += 1; need(this.#reads <= REQUESTS.setter); }
  public accept(command: Command, reply: unknown): void { need(!this.#failed && this.#reserved && this.#pending === command); try { const item = this.#plan.next(reply); this.#reserved = false; this.#pending = null; if (item.done === true) { need(this.#reads === REQUESTS.setter); this.#receipt = item.value; } else { this.#pending = item.value; } } catch (error) { this.#failed = true; throw error; } }
  public requireCompleted(): CurrentSchematicRelevanceFirstSetterReceipt { need(!this.#failed && !this.#reserved && this.#pending === null && this.#receipt !== null); return this.#receipt; }
  public fail(): void { this.#failed = true; }
}
