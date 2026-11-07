/** Original held-setter history graph. This cursor observes descriptors and
 * function metadata only. Its receipt grants no callback or write continuation. */
/* oxlint-disable import/max-dependencies -- Independent exact source, original-handle and native metadata decoders qualify one finite original graph. */
import { createHash } from "node:crypto";
import { CURRENT_SCHEMATIC_RELEVANCE_ACTION_CALLBACK_CALLS as CALLS, CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_ENTRY_FLAGS as FLAGS, validateCurrentSchematicRelevanceDisplayModifyEntryCommand as validate } from "./current-schematic-relevance-display-modify-entry-protocol.ts";
import type { CurrentSchematicRelevanceDisplayModifyEntryCommand as Command } from "./current-schematic-relevance-display-modify-entry-protocol.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_COMPLETION_READ_BOUND as BOUND } from "./current-schematic-relevance-completion-programs.ts";
import type { CurrentSchematicRelevanceActionCallbackEntry } from "./current-schematic-relevance-action-callback-cursor.ts";
import type { CurrentSchematicRelevanceRawCapture } from "./current-schematic-relevance-action-raw-cursor.ts";
import type { CurrentSchematicRelevanceRunPrefixCapture } from "./current-schematic-relevance-run-prefix-cursor.ts";
import type { CurrentSchematicRelevanceActiveHistoryReceipt } from "./current-schematic-relevance-active-history-cursor.ts";
import type { CurrentSchematicRelevanceDisplayAccessorFunctions } from "./current-schematic-relevance-display-accessor-observer.ts";
import { currentSchematicRelevancePrefixCapture as capture, currentSchematicRelevancePrefixHandle as handle, currentSchematicRelevancePrefixNativeFunction as nativeFunction, currentSchematicRelevancePrefixProperties as properties, currentSchematicRelevancePrefixTrue as truth, currentSchematicRelevancePrefixTuple as tuple } from "./current-schematic-relevance-run-prefix-replies.ts";
import type { CurrentSchematicRelevancePrefixRemote as Remote } from "./current-schematic-relevance-run-prefix-replies.ts";
import { captureCurrentSchematicDisplayAccessorSource } from "./current-schematic-display-accessor-replies.ts";
import { requireCurrentSchematicRelevanceCompletionCalleeDescription as calleeDescription, decodeCurrentSchematicRelevanceCompletionCalleeFunction as calleeFunction } from "./current-schematic-relevance-completion-callee-replies.ts";
import { qualifyCurrentSchematicRelevanceCompletionCalleeSource as calleeSource } from "./current-schematic-relevance-completion-callee-source.ts";
import { requireCurrentSchematicRelevanceCompletionCallbackDescription as callbackDescription, decodeCurrentSchematicRelevanceCompletionCallbackFunction as callbackFunction } from "./current-schematic-relevance-completion-callback-replies.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_COMPLETION_CALLBACK_SOURCE as CALLBACK_SOURCE, qualifyCurrentSchematicRelevanceCompletionCallbackSource as callbackSource } from "./current-schematic-relevance-completion-callback-source.ts";
import type { CurrentSchematicRelevanceCompletionCallbackRole } from "./current-schematic-relevance-completion-callback-source.ts";
import { decodeCurrentSchematicRelevanceDisplayAccessorFunction as accessorFunction } from "./current-schematic-relevance-display-accessor-replies.ts";
import { requireGeneratedSchematicDisplayAccessorDescription as accessorDescription, qualifyGeneratedSchematicDisplayAccessorSource as accessorSource } from "./generated-schematic-display-accessor-replies.ts";

const CALLEES = ["commandCanRecordGet", "historyRecord", "historyClearRecordsCore", "historyStatusGet", "historyCanRedoBaseGet", "historyCanUndoBaseGet", "historyCanRedoGet", "historyCanUndoGet", "groupForEach", "groupRemove", "groupSizeGet", "stackWillRecord", "willRecordTab"] as const;
const CALLBACKS = ["didRecordUpload", "statusToolbar", "statusMenu", "statusUnsaved"] as const;
const POSITIONS = ["x", "y", "rotation", "hAlign", "vAlign"] as const;
type Role = typeof CALLEES[number] | typeof CALLBACKS[number] | typeof POSITIONS[number] | "arrayAt" | "arrayShift";
type Step<T> = Generator<Command, T, unknown>;
function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_RELEVANCE_COMPLETION_CURSOR"); } }
export interface CurrentSchematicRelevanceCompletionReceipt {
  readonly rootsObjectId: string; readonly detailsObjectId: string; readonly subscriptionsObjectId: string;
  readonly functionsObjectId: string; readonly qualifiedObjectId: string; readonly snapshotObjectId: string;
  readonly functions: Readonly<Record<Role, string>>; readonly scopes: Readonly<Record<string, string>>;
  readonly statusCallbackOrder: readonly CurrentSchematicRelevanceCompletionCallbackRole[];
  readonly originalRequests: number; readonly originalHeldSetterGraphVerified: true;
  readonly completeOwnDescriptorsAndPrototypesRetained: true; readonly originalPositionGetterIdentityVerified: true;
  readonly nestedCommandCallbacksInstantiated: false; readonly callbackReceiversVerified: false;
  readonly callbackDeliveryVerified: false; readonly uiEffectsVerified: false; readonly continuationAuthorized: false;
}
export class CurrentSchematicRelevanceCompletionCursor {
  readonly #raw: CurrentSchematicRelevanceRawCapture; readonly #entry: CurrentSchematicRelevanceActionCallbackEntry;
  readonly #prefix: CurrentSchematicRelevanceRunPrefixCapture; readonly #active: CurrentSchematicRelevanceActiveHistoryReceipt;
  readonly #accessors: CurrentSchematicRelevanceDisplayAccessorFunctions; readonly #variant: 0 | 1; readonly #script: string;
  readonly #ids = new Map<string, string>(); readonly #slots = new Map<string, readonly Remote[]>();
  readonly #functions = new Map<Role, string>(); readonly #scopes = new Map<Role, string>();
  readonly #status: CurrentSchematicRelevanceCompletionCallbackRole[] = []; readonly #plan: Step<CurrentSchematicRelevanceCompletionReceipt>;
  #pending: Command | null = null; #reserved = false; #failed = false; #reads = 0; #receipt: CurrentSchematicRelevanceCompletionReceipt | null = null;
  public constructor(raw: CurrentSchematicRelevanceRawCapture, entry: CurrentSchematicRelevanceActionCallbackEntry, prefix: CurrentSchematicRelevanceRunPrefixCapture, active: CurrentSchematicRelevanceActiveHistoryReceipt, accessors: CurrentSchematicRelevanceDisplayAccessorFunctions, variant: 0 | 1, script: string) {
    this.#raw = raw; this.#entry = entry; this.#prefix = prefix; this.#active = active; this.#accessors = accessors; this.#variant = variant; this.#script = script;
    this.#ids.set("qualified", active.qualifiedObjectId); this.#plan = this.#collect(); Object.freeze(this);
  }
  #id(name: string): string { const id = this.#ids.get(name); need(id !== undefined); return id; }
  #value(name: string, index: number): Remote { const value = this.#slots.get(name)?.[index]; need(value !== undefined); return value; }
  static #props(objectId: string): Command { return validate({ phase: "schematic-callback-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }); }
  static #call(phase: typeof CALLS[number][0], objectId: string, args: readonly string[]): Command { const row = CALLS.find(value => value[0] === phase); need(row !== undefined && args.length === row[2]); return validate({ phase, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId, functionDeclaration: row[1], arguments: args.map(id => ({ objectId: id })), returnByValue: row[3], awaitPromise: false, userGesture: false } }); }
  *#read(name: string, command: Command, length?: number): Step<void> { const id = capture(yield command); const values = tuple(yield CurrentSchematicRelevanceCompletionCursor.#props(id), length); this.#ids.set(name, id); this.#slots.set(name, values); }
  *#qualify(name: string): Step<void> {
    let candidate = this.#id(name);
    for (let depth = 0; depth < 12; depth += 1) {
      yield* this.#read("novel", CurrentSchematicRelevanceCompletionCursor.#call("schematic-callback-active-novel", candidate, [this.#raw.nativeObjectId, this.#id("qualified")])); const fresh = this.#slots.get("novel"); need(fresh !== undefined); if (fresh.length === 0) { return; }
      for (const value of fresh) { properties(yield CurrentSchematicRelevanceCompletionCursor.#props(handle(value))); }
      yield* this.#read("qualified", CurrentSchematicRelevanceCompletionCursor.#call("schematic-callback-active-merge", this.#id("qualified"), [this.#raw.nativeObjectId, this.#id("novel")]));
      yield* this.#read("parents", CurrentSchematicRelevanceCompletionCursor.#call("schematic-callback-active-prototypes", this.#id("novel"), [this.#raw.nativeObjectId])); candidate = this.#id("parents");
    }
    need(this.#slots.get("parents")?.every(value => value.type === "object" && value.subtype === "null" && value.value === null) === true);
  }
  *#tuple(name: string, command: Command, length: number): Step<void> { yield* this.#read(name, command, length); yield* this.#qualify(name); }
  #select(): readonly string[] { return [this.#raw.nativeObjectId, this.#id("roots"), this.#id("details"), this.#id("subscriptions"), this.#entry.boundObjectId, this.#prefix.baseFunctionsObjectId, this.#prefix.queueFunctionsObjectId, this.#id("qualified")]; }
  #callbackRole(description: string, index: number): CurrentSchematicRelevanceCompletionCallbackRole {
    const sha = createHash("sha256").update(description).digest("hex");
    const roles: readonly CurrentSchematicRelevanceCompletionCallbackRole[] = index === 13 ? ["didRecordUpload"] : ["statusToolbar", "statusMenu", "statusUnsaved"];
    const role = roles.find(value => CALLBACK_SOURCE[this.#variant].roles[value].sha256 === sha); need(role !== undefined); return role;
  }
  *#metadata(): Step<void> {
    for (let index = 0; index < 24; index += 1) {
      const value = this.#value("functions", index); need(value.type === "function" && typeof value.description === "string"); const id = handle(value); const command = CurrentSchematicRelevanceCompletionCursor.#props(id);
      const callee = CALLEES[index];
      if (callee !== undefined) { calleeDescription(value.description, this.#variant, callee); const decoded = calleeFunction(yield command, this.#variant, callee, this.#script); this.#functions.set(callee, id); this.#scopes.set(callee, decoded.scopes); }
      else if (index < 17) { const role = this.#callbackRole(value.description, index); need(!this.#functions.has(role)); callbackDescription(value.description, this.#variant, role); const decoded = callbackFunction(yield command, this.#variant, role, this.#script); this.#functions.set(role, id); this.#scopes.set(role, decoded.scopes); if (index > 13) { this.#status.push(role); } }
      else if (index < 22) { const field = POSITIONS[index - 17]; need(field !== undefined); const role = `${field}.get` as const; accessorDescription(value.description, this.#variant, role); const decoded = accessorFunction(yield command, this.#variant, role, this.#script); this.#functions.set(field, id); this.#scopes.set(field, decoded.scopes); }
      else { const name = index === 22 ? "at" : "shift"; need(value.description === `function ${name}() { [native code] }`); nativeFunction(yield command, [name, name === "at" ? 1 : 0]); this.#functions.set(index === 22 ? "arrayAt" : "arrayShift", id); }
    }
    need(this.#functions.size === 24 && this.#status.length === 3);
  }
  *#collect(): Step<CurrentSchematicRelevanceCompletionReceipt> {
    const source = captureCurrentSchematicDisplayAccessorSource(yield validate({ phase: "schematic-callback-active-source", method: "Debugger.getScriptSource", params: { scriptId: this.#script } })).scriptSource;
    need(calleeSource(source) === this.#variant && callbackSource(source) === this.#variant && accessorSource({ scriptSource: source }) === this.#variant);
    yield* this.#tuple("roots", CurrentSchematicRelevanceCompletionCursor.#call("schematic-callback-completion-roots", this.#entry.boundObjectId, [this.#raw.nativeObjectId, this.#raw.referencesObjectId, this.#entry.boundObjectId, this.#active.rootsObjectId, this.#active.moduleObjectId, this.#id("qualified")]), 14);
    yield* this.#tuple("details", CurrentSchematicRelevanceCompletionCursor.#call("schematic-callback-completion-details", this.#id("roots"), [this.#raw.nativeObjectId, this.#id("qualified")]), 12);
    yield* this.#tuple("subscriptions", CurrentSchematicRelevanceCompletionCursor.#call("schematic-callback-completion-subscriptions", this.#id("details"), [this.#raw.nativeObjectId, this.#id("qualified")]), 6);
    yield* this.#tuple("functions", CurrentSchematicRelevanceCompletionCursor.#call("schematic-callback-completion-functions", this.#id("roots"), this.#select()), 24); yield* this.#metadata();
    yield* this.#read("snapshot", CurrentSchematicRelevanceCompletionCursor.#call("schematic-callback-completion-snapshot", this.#id("qualified"), [this.#raw.nativeObjectId]));
    truth(yield CurrentSchematicRelevanceCompletionCursor.#call("schematic-callback-after-run", this.#raw.snapshotObjectId, [this.#raw.nativeObjectId, this.#raw.referencesObjectId, this.#entry.activeActionObjectId, this.#entry.busGroupSetObjectId]));
    truth(yield CurrentSchematicRelevanceCompletionCursor.#call("schematic-callback-completion-same", this.#id("functions"), [...this.#select(), ...POSITIONS.map(field => this.#accessors.positionGetters[field])]));
    truth(yield CurrentSchematicRelevanceCompletionCursor.#call("schematic-callback-completion-snapshot-same", this.#id("snapshot"), [this.#raw.nativeObjectId, this.#id("qualified")]));
    const functions = Object.fromEntries(this.#functions);
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Exact13 callee, four distinct callback, five getter and two native roles above populate the fixed24-key record.
    return Object.freeze({ rootsObjectId: this.#id("roots"), detailsObjectId: this.#id("details"), subscriptionsObjectId: this.#id("subscriptions"), functionsObjectId: this.#id("functions"), qualifiedObjectId: this.#id("qualified"), snapshotObjectId: this.#id("snapshot"), functions: Object.freeze(functions) as Readonly<Record<Role, string>>, scopes: Object.freeze(Object.fromEntries(this.#scopes)), statusCallbackOrder: Object.freeze([...this.#status]), originalRequests: this.#reads, originalHeldSetterGraphVerified: true, completeOwnDescriptorsAndPrototypesRetained: true, originalPositionGetterIdentityVerified: true, nestedCommandCallbacksInstantiated: false, callbackReceiversVerified: false, callbackDeliveryVerified: false, uiEffectsVerified: false, continuationAuthorized: false });
  }
  public next(): Command | null { need(!this.#failed && !this.#reserved); if (this.#pending !== null) { return this.#pending; } if (this.#receipt !== null) { return null; } try { const step = this.#plan.next(); need(step.done !== true); this.#pending = step.value; return this.#pending; } catch (error) { this.#failed = true; throw error; } }
  public reserve(command: Command): void { need(!this.#failed && !this.#reserved && this.next() === command); this.#reserved = true; this.#reads += 1; if (this.#reads > BOUND) { this.#failed = true; throw new Error("SCHEMATIC_RELEVANCE_COMPLETION_BUDGET"); } }
  public accept(command: Command, reply: unknown): void { need(!this.#failed && this.#reserved && this.#pending === command); try { const step = this.#plan.next(reply); this.#pending = null; this.#reserved = false; if (step.done === true) { this.#receipt = step.value; } else { this.#pending = step.value; } } catch (error) { this.#failed = true; throw error; } }
  public requireCompleted(): CurrentSchematicRelevanceCompletionReceipt { need(!this.#failed && !this.#reserved && this.#pending === null && this.#receipt !== null); return this.#receipt; }
  public fail(): void { this.#failed = true; }
}
