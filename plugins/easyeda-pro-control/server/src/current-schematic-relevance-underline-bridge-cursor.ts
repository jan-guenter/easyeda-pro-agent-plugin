/** Correlated original descriptor reads before decorator forwarding, then a
 * separate read lane at the original setAttribute entry before its body. */
/* oxlint-disable max-classes-per-file -- These two four-read stages share one private cursor engine and retain distinct receipts and fixed command generators. */
import { CURRENT_SCHEMATIC_RELEVANCE_ACTION_CALLBACK_CALLS as CALLS, CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_ENTRY_FLAGS as FLAGS, validateCurrentSchematicRelevanceDisplayModifyEntryCommand as validate } from "./current-schematic-relevance-display-modify-entry-protocol.ts";
import type { CurrentSchematicRelevanceDisplayModifyEntryCommand as Command } from "./current-schematic-relevance-display-modify-entry-protocol.ts";
import type { CurrentSchematicRelevanceDisplayAccessorFunctions } from "./current-schematic-relevance-display-accessor-observer.ts";
import type { CurrentSchematicRelevanceActionCallbackEntry } from "./current-schematic-relevance-action-callback-cursor.ts";
import type { CurrentSchematicRelevanceRawCapture } from "./current-schematic-relevance-action-raw-cursor.ts";
import type { CurrentSchematicRelevanceFirstSetterReceipt } from "./current-schematic-relevance-first-setter-cursor.ts";
import type { CurrentSchematicRelevanceRunPrefixCapture } from "./current-schematic-relevance-run-prefix-cursor.ts";
import { currentSchematicRelevancePrefixCapture as capture, currentSchematicRelevancePrefixHandle as handle, currentSchematicRelevancePrefixProperties as properties, currentSchematicRelevancePrefixTrue as truth, currentSchematicRelevancePrefixTuple as tuple } from "./current-schematic-relevance-run-prefix-replies.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_SET_ATTRIBUTE_EXPRESSION as EXPRESSION } from "./current-schematic-relevance-underline-bridge-programs.ts";

function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_RELEVANCE_UNDERLINE_BRIDGE_CURSOR"); } }
export interface CurrentSchematicRelevanceUnderlineBridgeReceipt { readonly originalRequests: 4; readonly originalDecoratedForwardingVerified: true; readonly primitiveWriteAuthorized: false }
export interface CurrentSchematicRelevanceSetAttributeReceipt { readonly frameCaptureObjectId: string; readonly originalRequests: 4; readonly originalMonitorReceiverVerified: true; readonly rawUnderlineUnchanged: true; readonly primitiveWriteAuthorized: false }
type Receipt = CurrentSchematicRelevanceUnderlineBridgeReceipt | CurrentSchematicRelevanceSetAttributeReceipt;
function inspect(objectId: string): Command { return validate({ phase: "schematic-callback-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }); }
function call(phase: typeof CALLS[number][0], objectId: string, args: readonly string[]): Command { const row = CALLS.find(value => value[0] === phase); need(row !== undefined && args.length === row[2]); return validate({ phase, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId, functionDeclaration: row[1], arguments: args.map(id => ({ objectId: id })), returnByValue: row[3], awaitPromise: false, userGesture: false } }); }
class OriginalCursor<T extends Receipt> {
  readonly #plan: Generator<Command, T, unknown>; #pending: Command | null = null; #reserved = false; #failed = false; #reads = 0; #receipt: T | null = null;
  public constructor(plan: Generator<Command, T, unknown>) { this.#plan = plan; Object.freeze(this); }
  public next(): Command | null { need(!this.#failed && !this.#reserved); if (this.#pending !== null) { return this.#pending; } if (this.#receipt !== null) { return null; } const item = this.#plan.next(); need(item.done !== true); this.#pending = item.value; return this.#pending; }
  public reserve(command: Command): void { need(!this.#failed && !this.#reserved && this.next() === command); this.#reserved = true; this.#reads += 1; need(this.#reads <= 4); }
  public accept(command: Command, reply: unknown): void { need(!this.#failed && this.#reserved && this.#pending === command); try { const item = this.#plan.next(reply); this.#reserved = false; this.#pending = null; if (item.done === true) { need(this.#reads === 4); this.#receipt = item.value; } else { this.#pending = item.value; } } catch (error) { this.#failed = true; throw error; } }
  public requireCompleted(): T { need(!this.#failed && !this.#reserved && this.#pending === null && this.#receipt !== null); return this.#receipt; }
  public fail(): void { this.#failed = true; }
}
export class CurrentSchematicRelevanceUnderlineBridgeCursor extends OriginalCursor<CurrentSchematicRelevanceUnderlineBridgeReceipt> {
  public constructor(raw: CurrentSchematicRelevanceRawCapture, entry: CurrentSchematicRelevanceActionCallbackEntry, first: CurrentSchematicRelevanceFirstSetterReceipt, functions: CurrentSchematicRelevanceDisplayAccessorFunctions, prefix: CurrentSchematicRelevanceRunPrefixCapture) {
    super(CurrentSchematicRelevanceUnderlineBridgeCursor.#collect(raw, entry, first, functions, prefix));
  }
  static *#collect(raw: CurrentSchematicRelevanceRawCapture, entry: CurrentSchematicRelevanceActionCallbackEntry, first: CurrentSchematicRelevanceFirstSetterReceipt, functions: CurrentSchematicRelevanceDisplayAccessorFunctions, prefix: CurrentSchematicRelevanceRunPrefixCapture): Generator<Command, CurrentSchematicRelevanceUnderlineBridgeReceipt, unknown> {
    const u = functions.underline; properties(yield inspect(u.rawDescriptorObjectId)); properties(yield inspect(u.decoratorObjectId));
    truth(yield call("schematic-callback-after-run", raw.snapshotObjectId, [raw.nativeObjectId, raw.referencesObjectId, entry.activeActionObjectId, entry.busGroupSetObjectId]));
    truth(yield call("schematic-callback-underline-bridge", first.frameCaptureObjectId, [raw.nativeObjectId, raw.referencesObjectId, entry.boundObjectId, first.frameCaptureObjectId, first.mappingTupleObjectId, first.bindingTupleObjectId, u.rawDescriptorObjectId, u.decoratorObjectId, u.decoratorSetterObjectId, u.decoratorAccessorObjectId, u.rawGetObjectId, u.rawSetObjectId, prefix.intrinsicFunctionsObjectId, prefix.qualifiedObjectId, functions.setAttributeObjectId, u.setObjectId]));
    return Object.freeze({ originalRequests: 4, originalDecoratedForwardingVerified: true, primitiveWriteAuthorized: false });
  }
}
export class CurrentSchematicRelevanceSetAttributeCursor extends OriginalCursor<CurrentSchematicRelevanceSetAttributeReceipt> {
  public constructor(frame: string, raw: CurrentSchematicRelevanceRawCapture, entry: CurrentSchematicRelevanceActionCallbackEntry, functions: CurrentSchematicRelevanceDisplayAccessorFunctions) { super(CurrentSchematicRelevanceSetAttributeCursor.#collect(frame, raw, entry, functions)); }
  static *#collect(frameId: string, raw: CurrentSchematicRelevanceRawCapture, entry: CurrentSchematicRelevanceActionCallbackEntry, functions: CurrentSchematicRelevanceDisplayAccessorFunctions): Generator<Command, CurrentSchematicRelevanceSetAttributeReceipt, unknown> {
    const frame = capture(yield validate({ phase: "schematic-callback-setAttribute-frame", method: "Debugger.evaluateOnCallFrame", params: { ...FLAGS, callFrameId: frameId, expression: EXPRESSION, returnByValue: false, includeCommandLineAPI: false } })); const values = tuple(yield inspect(frame), 5);
    need(values[0]?.type === "object" && values[0].subtype === undefined && values[1]?.type === "object" && values[1].subtype === undefined && values[2]?.type === "object" && values[2].subtype === undefined && values[3]?.type === "string" && values[3].value === "underline" && values[4]?.type === "boolean"); handle(values[0]); handle(values[1]); handle(values[2]);
    truth(yield call("schematic-callback-after-run", raw.snapshotObjectId, [raw.nativeObjectId, raw.referencesObjectId, entry.activeActionObjectId, entry.busGroupSetObjectId]));
    truth(yield call("schematic-callback-setAttribute-proof", frame, [raw.nativeObjectId, raw.referencesObjectId, entry.boundObjectId, functions.underline.rawDescriptorObjectId, functions.setAttributeObjectId]));
    return Object.freeze({ frameCaptureObjectId: frame, originalRequests: 4, originalMonitorReceiverVerified: true, rawUnderlineUnchanged: true, primitiveWriteAuthorized: false });
  }
}
