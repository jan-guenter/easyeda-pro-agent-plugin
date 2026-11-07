/** Exact readonly checks on both sides of record's first original call. */
import { CURRENT_SCHEMATIC_RELEVANCE_RECORD_AST_CALLS as CALLS, CURRENT_SCHEMATIC_RELEVANCE_RECORD_AST_FLAGS as FLAGS, validateCurrentSchematicRelevanceRecordAstCommand as validate } from "./current-schematic-relevance-record-ast-protocol.ts";
import type { CurrentSchematicRelevanceRecordAstCommand as Command } from "./current-schematic-relevance-record-ast-protocol.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_RECORD_AST_EXPRESSIONS as EXPRESSIONS } from "./current-schematic-relevance-record-ast-programs.ts";
import { currentSchematicRelevanceUiPublicationCapture as capture, currentSchematicRelevanceUiPublicationHandle as handle, currentSchematicRelevanceUiPublicationTrue as truth, currentSchematicRelevanceUiPublicationTuple as tuple } from "./current-schematic-relevance-ui-publication-replies.ts";
import type { CurrentSchematicRelevanceRawCapture } from "./current-schematic-relevance-action-raw-cursor.ts";
import type { CurrentSchematicRelevanceActionCallbackEntry } from "./current-schematic-relevance-action-callback-cursor.ts";
import type { CurrentSchematicRelevanceDisplayAccessorFunctions } from "./current-schematic-relevance-display-accessor-observer.ts";
import type { CurrentSchematicRelevanceUiPublicationReceipt } from "./current-schematic-relevance-ui-publication-cursor.ts";
import type { CurrentSchematicRelevanceCompletionReceipt } from "./current-schematic-relevance-completion-cursor.ts";
import type { CurrentSchematicRelevancePrimitivePrepared, CurrentSchematicRelevancePrimitiveRecordHeld } from "./current-schematic-relevance-primitive-cursor.ts";

function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_RELEVANCE_RECORD_AST_CURSOR"); } }
export interface CurrentSchematicRelevanceRecordAstPrepared { readonly frameCaptureObjectId: string; readonly originalRequests: 7; readonly originalRecordEventAndClosureVerified: true; readonly continuationAuthorized: false }
export interface CurrentSchematicRelevanceAstHeld { readonly frameCaptureObjectId: string; readonly originalRequests: 7; readonly originalRecordResumeConsumed: true; readonly originalAstReceiverVerified: true; readonly originalAstBodyStillHeld: true; readonly furtherWriteAuthorized: false; readonly modifyCompleted: false; readonly saveAuthorized: false }
export interface CurrentSchematicRelevanceRecordAstInputs { readonly raw: CurrentSchematicRelevanceRawCapture; readonly entry: CurrentSchematicRelevanceActionCallbackEntry; readonly functions: CurrentSchematicRelevanceDisplayAccessorFunctions; readonly ui: CurrentSchematicRelevanceUiPublicationReceipt; readonly completion: CurrentSchematicRelevanceCompletionReceipt; readonly primitive: CurrentSchematicRelevancePrimitivePrepared; readonly record: CurrentSchematicRelevancePrimitiveRecordHeld }
type Receipt = CurrentSchematicRelevanceRecordAstPrepared | CurrentSchematicRelevanceAstHeld;
const props = (objectId: string): Command => validate({ phase: "properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } });
const call = (role: typeof CALLS[number][0], objectId: string, args: readonly string[]): Command => { const row = CALLS.find(value => value[0] === role); need(row !== undefined && args.length === row[2]); return validate({ phase: "call", role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId, functionDeclaration: row[1], arguments: args.map(id => ({ objectId: id })), returnByValue: row[3], awaitPromise: false, userGesture: false } }); };
export class CurrentSchematicRelevanceRecordAstCursor {
  readonly #plan: Generator<Command, Receipt, unknown>; #pending: Command | null = null; #reserved = false; #failed = false; #reads = 0; #receipt: Receipt | null = null;
  public constructor(callFrameId: string, stage: "record" | "ast", inputs: CurrentSchematicRelevanceRecordAstInputs) { this.#plan = CurrentSchematicRelevanceRecordAstCursor.#collect(callFrameId, stage, inputs); Object.freeze(this); }
  static *#collect(callFrameId: string, stage: "record" | "ast", input: CurrentSchematicRelevanceRecordAstInputs): Generator<Command, Receipt, unknown> {
    const { raw, entry, functions, ui, completion, primitive, record } = input; truth(yield call("hooks", raw.nativeObjectId, []));
    const actual = capture(yield validate({ phase: "frame", role: stage, method: "Debugger.evaluateOnCallFrame", params: { ...FLAGS, callFrameId, expression: EXPRESSIONS[stage], returnByValue: false, includeCommandLineAPI: false } })); const values = tuple(yield props(actual), stage === "record" ? 3 : 1); for (const value of values) { handle(value); }
    truth(yield call("raw-delta", raw.snapshotObjectId, [raw.nativeObjectId, raw.referencesObjectId, entry.activeActionObjectId, entry.busGroupSetObjectId, entry.boundObjectId, primitive.captureObjectId])); truth(yield call("ui-delta", ui.snapshotObjectId, [raw.nativeObjectId, ui.qualifiedObjectId, entry.boundObjectId, primitive.captureObjectId])); truth(yield call("completion-delta", completion.snapshotObjectId, [raw.nativeObjectId, completion.qualifiedObjectId, entry.boundObjectId, primitive.captureObjectId]));
    if (stage === "record") { truth(yield call("record-before", actual, [raw.nativeObjectId, raw.referencesObjectId, entry.boundObjectId, record.eventObjectId, functions.astObjectId, primitive.captureObjectId, functions.recordObjectId])); return Object.freeze({ frameCaptureObjectId: actual, originalRequests: 7, originalRecordEventAndClosureVerified: true, continuationAuthorized: false }); }
    truth(yield call("receiver", actual, [raw.nativeObjectId, raw.referencesObjectId])); return Object.freeze({ frameCaptureObjectId: actual, originalRequests: 7, originalRecordResumeConsumed: true, originalAstReceiverVerified: true, originalAstBodyStillHeld: true, furtherWriteAuthorized: false, modifyCompleted: false, saveAuthorized: false });
  }
  public next(): Command | null { need(!this.#failed && !this.#reserved); if (this.#pending !== null) { return this.#pending; } if (this.#receipt !== null) { return null; } const step = this.#plan.next(); need(step.done !== true); this.#pending = step.value; return this.#pending; }
  public reserve(command: Command): void { need(!this.#failed && !this.#reserved && this.next() === command); this.#reserved = true; this.#reads += 1; need(this.#reads <= 7); }
  public accept(command: Command, reply: unknown): void { need(!this.#failed && this.#reserved && this.#pending === command); try { const step = this.#plan.next(reply); this.#pending = null; this.#reserved = false; if (step.done === true) { need(this.#reads === 7); this.#receipt = step.value; } else { this.#pending = step.value; } } catch (error) { this.#failed = true; throw error; } }
  public requirePrepared(): CurrentSchematicRelevanceRecordAstPrepared { const value = this.#completed(); need("originalRecordEventAndClosureVerified" in value); return value; }
  public requireAstHeld(): CurrentSchematicRelevanceAstHeld { const value = this.#completed(); need("originalAstBodyStillHeld" in value); return value; }
  #completed(): Receipt { need(!this.#failed && !this.#reserved && this.#pending === null && this.#receipt !== null); return this.#receipt; }
  public fail(): void { this.#failed = true; }
}
