/** Original active history and monitor callees while setAttribute is held.
 * This collector invokes no application getter, callback or model setter. */
/* oxlint-disable import/max-dependencies -- Independent fixed source profiles and Inspector decoders qualify the same retained original graph. */
import { CURRENT_SCHEMATIC_RELEVANCE_ACTION_CALLBACK_CALLS as CALLS, CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_ENTRY_FLAGS as FLAGS, validateCurrentSchematicRelevanceDisplayModifyEntryCommand as validate } from "./current-schematic-relevance-display-modify-entry-protocol.ts";
import type { CurrentSchematicRelevanceDisplayModifyEntryCommand as Command } from "./current-schematic-relevance-display-modify-entry-protocol.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_ACTIVE_HISTORY_READ_BOUND as BOUND, CURRENT_SCHEMATIC_RELEVANCE_ACTIVE_HISTORY_EXPRESSIONS as EXPRESSIONS } from "./current-schematic-relevance-active-history-programs.ts";
import type { CurrentSchematicRelevanceActionCallbackEntry } from "./current-schematic-relevance-action-callback-cursor.ts";
import type { CurrentSchematicRelevanceRawCapture } from "./current-schematic-relevance-action-raw-cursor.ts";
import type { CurrentSchematicRelevanceRunPrefixCapture } from "./current-schematic-relevance-run-prefix-cursor.ts";
import { currentSchematicRelevancePrefixCapture as capture, currentSchematicRelevancePrefixHandle as handle, currentSchematicRelevancePrefixNativeFunction as nativeFunction, currentSchematicRelevancePrefixProperties as properties, currentSchematicRelevancePrefixTrue as truth, currentSchematicRelevancePrefixTuple as tuple } from "./current-schematic-relevance-run-prefix-replies.ts";
import type { CurrentSchematicRelevancePrefixRemote as Remote } from "./current-schematic-relevance-run-prefix-replies.ts";
import { captureCurrentSchematicDisplayAccessorSource } from "./current-schematic-display-accessor-replies.ts";
import { requireGeneratedSchematicDisplayActionDescription as legacyDescription, decodeGeneratedSchematicDisplayActionFunction as legacyFunction, qualifyGeneratedSchematicDisplayActionSource as legacySource } from "./generated-schematic-display-action-replies.ts";
import { requireCurrentSchematicRelevanceModelCalleeDescription as modelDescription, decodeCurrentSchematicRelevanceModelCalleeFunction as modelFunction, } from "./current-schematic-relevance-model-callee-replies.ts";
import { qualifyCurrentSchematicRelevanceModelCalleeSource as modelSource } from "./current-schematic-relevance-model-callee-source.ts";
import { requireCurrentSchematicRelevanceHistoryCalleeDescription as historyDescription, decodeCurrentSchematicRelevanceHistoryCalleeFunction as historyFunction } from "./current-schematic-relevance-history-callee-replies.ts";
import { qualifyCurrentSchematicRelevanceHistoryCalleeSource as historySource } from "./current-schematic-relevance-history-callee-source.ts";

const ROLES = ["historyActiveAttribute", "resolverStart", "resolverComplete", "resolverFailure", "groupConstructor", "groupAdd", "parentGet", "tagNameGet", "positionAttrsGet", "modifyAttributeChange", "bboxAttributeChange", "watchAttributeChange", "commandConstructor", "commandBaseConstructor", "commandAttribute", "commandUpdate", "reflectHas", "reflectSet", "historyGetModelCommand", "historyTryGroup", "mapSet"] as const;
type Role = typeof ROLES[number];
type Step<T> = Generator<Command, T, unknown>;
function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_RELEVANCE_ACTIVE_HISTORY_CURSOR"); } }
export interface CurrentSchematicRelevanceActiveHistoryReceipt { readonly rootsObjectId: string; readonly resolverObjectId: string; readonly functionsObjectId: string; readonly moduleObjectId: string; readonly qualifiedObjectId: string; readonly functions: Readonly<Record<Role, string>>; readonly originalRequests: number; readonly originalActiveHistoryVerified: true; readonly originalFunctionMetadataVerified: true; readonly callbackReceiversVerified: false; readonly primitiveWriteAuthorized: false }
export class CurrentSchematicRelevanceActiveHistoryCursor {
  readonly #frame: string; readonly #raw: CurrentSchematicRelevanceRawCapture; readonly #entry: CurrentSchematicRelevanceActionCallbackEntry; readonly #prefix: CurrentSchematicRelevanceRunPrefixCapture; readonly #variant: 0 | 1; readonly #script: string;
  readonly #ids = new Map<string, string>(); readonly #slots = new Map<string, readonly Remote[]>(); readonly #plan: Step<CurrentSchematicRelevanceActiveHistoryReceipt>;
  #pending: Command | null = null; #reserved = false; #failed = false; #reads = 0; #receipt: CurrentSchematicRelevanceActiveHistoryReceipt | null = null;
  public constructor(frame: string, raw: CurrentSchematicRelevanceRawCapture, entry: CurrentSchematicRelevanceActionCallbackEntry, prefix: CurrentSchematicRelevanceRunPrefixCapture, variant: 0 | 1, script: string) { this.#frame = frame; this.#raw = raw; this.#entry = entry; this.#prefix = prefix; this.#variant = variant; this.#script = script; this.#ids.set("qualified", prefix.qualifiedObjectId); this.#plan = this.#collect(); Object.freeze(this); }
  #id(name: string): string { const id = this.#ids.get(name); need(id !== undefined); return id; }
  #at(name: string, index: number): string { return handle(this.#slots.get(name)?.[index]); }
  static #props(objectId: string): Command { return validate({ phase: "schematic-callback-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }); }
  static #call(phase: typeof CALLS[number][0], objectId: string, args: readonly string[]): Command { const row = CALLS.find(value => value[0] === phase); need(row !== undefined && args.length === row[2]); return validate({ phase, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId, functionDeclaration: row[1], arguments: args.map(id => ({ objectId: id })), returnByValue: row[3], awaitPromise: false, userGesture: false } }); }
  *#read(name: string, command: Command, length?: number): Step<void> { const id = capture(yield command); const values = tuple(yield CurrentSchematicRelevanceActiveHistoryCursor.#props(id), length); this.#ids.set(name, id); this.#slots.set(name, values); }
  *#qualify(name: string): Step<void> {
    let candidate = this.#id(name);
    for (let depth = 0; depth < 12; depth += 1) {
      yield* this.#read("novel", CurrentSchematicRelevanceActiveHistoryCursor.#call("schematic-callback-active-novel", candidate, [this.#raw.nativeObjectId, this.#id("qualified")])); const fresh = this.#slots.get("novel"); need(fresh !== undefined); if (fresh.length === 0) { return; }
      for (const value of fresh) { properties(yield CurrentSchematicRelevanceActiveHistoryCursor.#props(handle(value))); }
      yield* this.#read("qualified", CurrentSchematicRelevanceActiveHistoryCursor.#call("schematic-callback-active-merge", this.#id("qualified"), [this.#raw.nativeObjectId, this.#id("novel")])); need((this.#slots.get("qualified")?.length ?? 385) <= 384);
      yield* this.#read("parents", CurrentSchematicRelevanceActiveHistoryCursor.#call("schematic-callback-active-prototypes", this.#id("novel"), [this.#raw.nativeObjectId])); candidate = this.#id("parents");
    }
    need(this.#slots.get("parents")?.every(value => value.type === "object" && value.subtype === "null" && value.value === null) === true);
  }
  *#tuple(name: string, command: Command, length: number): Step<void> { yield* this.#read(name, command, length); yield* this.#qualify(name); }
  *#weakMap(): Step<void> {
    const map = properties(yield CurrentSchematicRelevanceActiveHistoryCursor.#props(this.#at("roots", 1))); need(map.result.length === 0 && map.internalProperties?.length === 2 && map.internalProperties.some(value => value.name === "[[Prototype]]")); const entries = map.internalProperties.find(value => value.name === "[[Entries]]")?.value; need(entries?.type === "object" && entries.subtype === "array" && entries.description === "Array(1)");
    const list = properties(yield CurrentSchematicRelevanceActiveHistoryCursor.#props(handle(entries))); need(list.internalProperties === undefined && list.result.length === 2); const entry = list.result.find(value => value.name === "0"), length = list.result.find(value => value.name === "length"); need(length?.value?.type === "number" && length.value.value === 1 && length.value.objectId === undefined && length.get === undefined && length.set === undefined && length.writable === true && !length.enumerable && !length.configurable && entry?.value?.subtype === "internal#entry" && entry.get === undefined && entry.set === undefined && entry.writable === true && entry.enumerable && entry.configurable);
    const id = handle(entry.value), value = properties(yield CurrentSchematicRelevanceActiveHistoryCursor.#props(id)); need(value.internalProperties === undefined && value.result.length === 2 && value.result.every(field => (field.name === "key" || field.name === "value") && field.value?.type === "object" && field.value.subtype === undefined && field.get === undefined && field.set === undefined && field.writable === true && field.enumerable && field.configurable));
    truth(yield CurrentSchematicRelevanceActiveHistoryCursor.#call("schematic-callback-active-entry", id, [this.#raw.nativeObjectId, this.#raw.referencesObjectId, this.#id("resolver")]));
  }
  *#functionMetadata(): Step<void> {
    const values = this.#slots.get("functions"); need(values?.length === ROLES.length);
    for (const [index, role] of ROLES.entries()) {
      const value = values[index]; need(value?.type === "function" && typeof value.description === "string"); const command = CurrentSchematicRelevanceActiveHistoryCursor.#props(handle(value));
      if (role === "parentGet" || role === "tagNameGet" || role === "positionAttrsGet" || role === "modifyAttributeChange" || role === "bboxAttributeChange" || role === "watchAttributeChange") { modelDescription(value.description, this.#variant, role); modelFunction(yield command, this.#variant, role, this.#script); }
      else if (role === "commandConstructor" || role === "commandBaseConstructor" || role === "commandAttribute" || role === "commandUpdate") { historyDescription(value.description, this.#variant, role); historyFunction(yield command, this.#variant, role, this.#script); }
      else if (role === "reflectHas" || role === "reflectSet" || role === "mapSet") { const expected = role === "reflectHas" ? ["has", 2] as const : ["set", role === "mapSet" ? 2 : 3] as const; need(value.description === `function ${expected[0]}() { [native code] }`); nativeFunction(yield command, expected); }
      else { legacyDescription(value.description, this.#variant, role); legacyFunction(yield command, this.#variant, role, this.#script); }
    }
  }
  #selection(): readonly string[] { return [this.#raw.nativeObjectId, this.#entry.boundObjectId, this.#id("roots"), this.#id("resolver"), this.#id("module"), this.#id("classes"), this.#prefix.intrinsicObjectsObjectId, this.#prefix.baseFunctionsObjectId, this.#id("qualified")]; }
  *#collect(): Step<CurrentSchematicRelevanceActiveHistoryReceipt> {
    const source = captureCurrentSchematicDisplayAccessorSource(yield validate({ phase: "schematic-callback-active-source", method: "Debugger.getScriptSource", params: { scriptId: this.#script } })).scriptSource; need(legacySource({ scriptSource: source }) === this.#variant && modelSource(source) === this.#variant && historySource(source) === this.#variant);
    yield* this.#tuple("module", validate({ phase: this.#variant === 0 ? "schematic-callback-active-main" : "schematic-callback-active-child", method: "Debugger.evaluateOnCallFrame", params: { ...FLAGS, callFrameId: this.#frame, expression: EXPRESSIONS[this.#variant], returnByValue: false, includeCommandLineAPI: false } }), 3);
    yield* this.#tuple("roots", CurrentSchematicRelevanceActiveHistoryCursor.#call("schematic-callback-active-roots", this.#entry.boundObjectId, [this.#raw.nativeObjectId, this.#raw.referencesObjectId, this.#prefix.rootsObjectId, this.#entry.boundObjectId]), 8);
    yield* this.#tuple("details", CurrentSchematicRelevanceActiveHistoryCursor.#call("schematic-callback-active-details", this.#id("roots"), [this.#raw.nativeObjectId]), 1);
    yield* this.#tuple("resolver", CurrentSchematicRelevanceActiveHistoryCursor.#call("schematic-callback-active-resolver", this.#id("roots"), [this.#raw.nativeObjectId, this.#raw.referencesObjectId, this.#prefix.intrinsicFunctionsObjectId]), 1); yield* this.#weakMap();
    yield* this.#tuple("classes", CurrentSchematicRelevanceActiveHistoryCursor.#call("schematic-callback-active-classes", this.#id("module"), [this.#raw.nativeObjectId]), 2);
    yield* this.#tuple("functions", CurrentSchematicRelevanceActiveHistoryCursor.#call("schematic-callback-active-functions", this.#id("roots"), this.#selection()), ROLES.length); yield* this.#functionMetadata();
    truth(yield CurrentSchematicRelevanceActiveHistoryCursor.#call("schematic-callback-after-run", this.#raw.snapshotObjectId, [this.#raw.nativeObjectId, this.#raw.referencesObjectId, this.#entry.activeActionObjectId, this.#entry.busGroupSetObjectId]));
    truth(yield CurrentSchematicRelevanceActiveHistoryCursor.#call("schematic-callback-active-same", this.#id("functions"), [this.#raw.nativeObjectId, this.#raw.referencesObjectId, ...this.#selection().slice(1), this.#prefix.intrinsicFunctionsObjectId]));
    const functions = Object.fromEntries(ROLES.map((role, index) => [role, this.#at("functions", index)]));
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Every exact role is constructed above from its correlated fixed-length original function tuple.
    return Object.freeze({ rootsObjectId: this.#id("roots"), resolverObjectId: this.#id("resolver"), functionsObjectId: this.#id("functions"), moduleObjectId: this.#id("module"), qualifiedObjectId: this.#id("qualified"), functions: Object.freeze(functions) as Readonly<Record<Role, string>>, originalRequests: this.#reads, originalActiveHistoryVerified: true, originalFunctionMetadataVerified: true, callbackReceiversVerified: false, primitiveWriteAuthorized: false });
  }
  public next(): Command | null { need(!this.#failed && !this.#reserved); if (this.#pending !== null) { return this.#pending; } if (this.#receipt !== null) { return null; } const step = this.#plan.next(); need(step.done !== true); this.#pending = step.value; return this.#pending; }
  public reserve(command: Command): void { need(!this.#failed && !this.#reserved && this.next() === command); this.#reserved = true; this.#reads += 1; need(this.#reads <= BOUND); }
  public accept(command: Command, reply: unknown): void { need(!this.#failed && this.#reserved && this.#pending === command); try { const step = this.#plan.next(reply); this.#pending = null; this.#reserved = false; if (step.done === true) { this.#receipt = step.value; } else { this.#pending = step.value; } } catch (error) { this.#failed = true; throw error; } }
  public requireCompleted(): CurrentSchematicRelevanceActiveHistoryReceipt { need(!this.#failed && !this.#reserved && this.#pending === null && this.#receipt !== null); return this.#receipt; }
  public fail(): void { this.#failed = true; }
}
