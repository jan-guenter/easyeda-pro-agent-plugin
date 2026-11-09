/* oxlint-disable import/max-dependencies -- One finite readonly cursor joins the separately pinned raw, queue, native and source metadata validators. */
/** The original owner retains this cursor and supplies actual correlated
 * replies. It has no resume, setter, Save or application-call command. */
import { z } from "zod";
import { CURRENT_SCHEMATIC_RELEVANCE_RUN_PREFIX_CALLS as CALLS, CURRENT_SCHEMATIC_RELEVANCE_RUN_PREFIX_READ_BOUND, CURRENT_SCHEMATIC_RELEVANCE_RUN_PREFIX_FLAGS as FLAGS, currentSchematicRelevanceRunPrefixExpression, validateCurrentSchematicRelevanceRunPrefixCommand } from "./current-schematic-relevance-run-prefix-protocol.ts";
import type { CurrentSchematicRelevanceRunPrefixCallRole, CurrentSchematicRelevanceRunPrefixCommand } from "./current-schematic-relevance-run-prefix-protocol.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_PREFIX_NATIVE_FUNCTIONS as NATIVES, currentSchematicRelevancePrefixCapture, currentSchematicRelevancePrefixClosures, currentSchematicRelevancePrefixHandle, currentSchematicRelevancePrefixNativeFunction, currentSchematicRelevancePrefixProperties, currentSchematicRelevancePrefixTrue, currentSchematicRelevancePrefixTuple } from "./current-schematic-relevance-run-prefix-replies.ts";
import type { CurrentSchematicRelevancePrefixRemote } from "./current-schematic-relevance-run-prefix-replies.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_ACTION_PREFIX_ROLES as ROLES, qualifyCurrentSchematicRelevanceActionPrefixSource } from "./current-schematic-relevance-action-prefix-source.ts";
import { decodeCurrentSchematicRelevancePrefixFunction, requireCurrentSchematicRelevancePrefixDescription } from "./current-schematic-relevance-action-prefix-replies.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_PREFIX_QUEUE_PROGRAMS as QUEUE, CURRENT_SCHEMATIC_RELEVANCE_PREFIX_QUEUE_CALLEES as QUEUE_ROLES } from "./current-schematic-relevance-action-prefix-queue-programs.ts";
import { decodeCurrentSchematicRelevancePrefixQueueFunction, decodeCurrentSchematicRelevancePrefixQueueScope, decodeCurrentSchematicRelevancePrefixQueueWeakRef, requireCurrentSchematicRelevancePrefixQueueDescription } from "./current-schematic-relevance-action-prefix-queue-replies.ts";
import { qualifyCurrentSchematicRelevancePrefixQueueSource } from "./current-schematic-relevance-action-prefix-queue-source.ts";
import type { CurrentSchematicRelevanceRawCapture } from "./current-schematic-relevance-action-raw-cursor.ts";
import type { CurrentSchematicRelevanceDisplayOriginalRun } from "./current-schematic-relevance-display-modify-entry-origin.ts";
import { captureCurrentSchematicDisplayAccessorSource } from "./current-schematic-display-accessor-replies.ts";
import { currentSchematicRelevanceRawNativeConstructor } from "./current-schematic-relevance-action-raw-replies.ts";

type Command = CurrentSchematicRelevanceRunPrefixCommand;
type Step<T> = Generator<Command, T, unknown>;
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
export { CURRENT_SCHEMATIC_RELEVANCE_RUN_PREFIX_READ_BOUND } from "./current-schematic-relevance-run-prefix-protocol.ts";
function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_RELEVANCE_ORIGINAL_RUN_PREFIX_CURSOR"); } }
export interface CurrentSchematicRelevanceRunPrefixCapture {
  readonly mapIteratorObjectId:string;readonly iteratorFunctionsObjectId:string;readonly objectConstructorObjectId:string;readonly objectIsExtensibleObjectId:string;readonly idleFunctionsObjectId: string; readonly runObjectId: string; readonly rootsObjectId: string; readonly nativeObjectId: string; readonly referencesObjectId: string;
  readonly firstStartObjectId: string; readonly willEndObjectId: string; readonly firstEndObjectId: string;
  readonly intrinsicObjectsObjectId: string; readonly baseFunctionsObjectId: string; readonly queueFunctionsObjectId: string; readonly intrinsicFunctionsObjectId: string;
  readonly qualifiedObjectId: string; readonly originalRequests: number; readonly originalRunStillHeld: true;
  readonly callbackReceiversVerified: false; readonly continuationAuthorized: false; readonly persistenceVerified: false;
}
export class CurrentSchematicRelevanceRunPrefixCursor {
  readonly #run: CurrentSchematicRelevanceDisplayOriginalRun; readonly #raw: CurrentSchematicRelevanceRawCapture; readonly #idle: string; readonly #variant: 0 | 1; readonly #script: string;
  readonly #ids = new Map<string, string>(); readonly #slots = new Map<string, readonly CurrentSchematicRelevancePrefixRemote[]>();
  readonly #plan: Step<CurrentSchematicRelevanceRunPrefixCapture>;
  #command: Command | null = null; #reserved = false; #failed = false; #requests = 0; #completed: CurrentSchematicRelevanceRunPrefixCapture | null = null;
  public constructor(run: CurrentSchematicRelevanceDisplayOriginalRun, raw: CurrentSchematicRelevanceRawCapture, idle: string, variant: 0 | 1, scriptId: string) {
    this.#run = run; this.#raw = raw; this.#idle = handle.parse(idle); this.#variant = variant; this.#script = handle.parse(scriptId);
    handle.parse(run.callFrameId); handle.parse(run.tupleObjectId); handle.parse(raw.nativeObjectId); handle.parse(raw.referencesObjectId);
    this.#plan = this.#collect(); Object.freeze(this);
  }
  #id(name: string): string { const value = this.#ids.get(name); need(value !== undefined); return value; }
  #slot(name: string, index: number): CurrentSchematicRelevancePrefixRemote { const value = this.#slots.get(name)?.[index]; need(value !== undefined); return value; }
  #at(name: string, index: number): string { return currentSchematicRelevancePrefixHandle(this.#slot(name, index)); }
  static #props(objectId: string): Command { return validateCurrentSchematicRelevanceRunPrefixCommand({ phase: "prefix-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }); }
  #frame(role: "run" | "group" | "module" | "intrinsics" | "empty"): Command { return validateCurrentSchematicRelevanceRunPrefixCommand({ phase: "prefix-frame", role, variant: this.#variant, method: "Debugger.evaluateOnCallFrame", params: { ...FLAGS, callFrameId: this.#run.callFrameId, expression: currentSchematicRelevanceRunPrefixExpression(role, this.#variant), returnByValue: false, includeCommandLineAPI: false } }); }
  static #call(role: CurrentSchematicRelevanceRunPrefixCallRole, receiver: string, references: readonly string[]): Command {
    const row = CALLS.find(item => item[0] === role); need(row !== undefined);
    return validateCurrentSchematicRelevanceRunPrefixCommand({ phase: "prefix-call", role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: receiver, functionDeclaration: row[1], arguments: references.map(objectId => ({ objectId })), returnByValue: row[3], awaitPromise: false, userGesture: false } });
  }
  static *#true(role: CurrentSchematicRelevanceRunPrefixCallRole, receiver: string, references: readonly string[]): Step<void> { currentSchematicRelevancePrefixTrue(yield CurrentSchematicRelevanceRunPrefixCursor.#call(role, receiver, references)); }
  *#readTuple(name: string, command: Command, length?: number): Step<void> {
    const objectId = currentSchematicRelevancePrefixCapture(yield command);
    const values = currentSchematicRelevancePrefixTuple(yield CurrentSchematicRelevanceRunPrefixCursor.#props(objectId), length);
    this.#ids.set(name, objectId); this.#slots.set(name, values);
  }
  *#existing(name: string, objectId: string, length: number): Step<void> {
    const values = currentSchematicRelevancePrefixTuple(yield CurrentSchematicRelevanceRunPrefixCursor.#props(objectId), length);
    this.#ids.set(name, objectId); this.#slots.set(name, values);
  }
  /** Native metadata precedes every descriptor/prototype follow. Actual JS
   * identity deduplication handles different Inspector wrappers of one value. */
  *#qualify(name: string): Step<void> {
    let candidate = this.#id(name);
    for (let depth = 0; depth < 12; depth += 1) {
      yield* this.#readTuple("novel", CurrentSchematicRelevanceRunPrefixCursor.#call("novel", candidate, [this.#id("native"), this.#id("qualified")]));
      const fresh = this.#slots.get("novel"); need(fresh !== undefined);
      if (fresh.length === 0) { return; }
      for (const value of fresh) { currentSchematicRelevancePrefixProperties(yield CurrentSchematicRelevanceRunPrefixCursor.#props(currentSchematicRelevancePrefixHandle(value))); }
      yield* this.#readTuple("qualified", CurrentSchematicRelevanceRunPrefixCursor.#call("merge", this.#id("qualified"), [this.#id("native"), this.#id("novel"), this.#id("empty"), this.#id("empty"), this.#id("empty")]));
      yield* this.#readTuple("parents", CurrentSchematicRelevanceRunPrefixCursor.#call("prototypes", this.#id("novel"), [this.#id("native")])); candidate = this.#id("parents");
    }
    need(this.#slots.get("parents")?.every(value => value.type === "object" && value.subtype === "null" && value.value === null) === true);
  }
  *#tuple(name: string, command: Command, length?: number): Step<void> { yield* this.#readTuple(name, command, length); yield* this.#qualify(name); }
  *#nativeFunctions(): Step<void> {
    for (const [index, profile] of NATIVES.entries()) {
      const value = this.#slot("intrinsic", index); need(value.type === "function" && value.description === `function ${profile[0]}() { [native code] }`);
      currentSchematicRelevancePrefixNativeFunction(yield CurrentSchematicRelevanceRunPrefixCursor.#props(this.#at("intrinsic", index)), profile);
    }
    for (let index = 34; index < 38; index += 1) { need(this.#slot("intrinsic", index).type === "symbol"); }
  }
  #baseArguments(): readonly string[] { return [this.#id("native"), this.#id("run"), this.#id("references"), this.#id("roots"), this.#id("events"), this.#id("details"), this.#id("subscriptions"), this.#id("module"), this.#id("qualified"), this.#at("channel", 0), this.#at("group", 0), this.#at("intrinsic", 34)]; }
  *#baseFunctions(): Step<void> {
    yield* this.#tuple("base", CurrentSchematicRelevanceRunPrefixCursor.#call("base", this.#id("run"), this.#baseArguments()), ROLES.length);
    let generatorPrototype: string | null = null;
    for (const [index, role] of ROLES.entries()) {
      const value = this.#slot("base", index); need(value.type === "function" && value.description !== undefined); requireCurrentSchematicRelevancePrefixDescription(value.description, this.#variant, role);
      const metadata = decodeCurrentSchematicRelevancePrefixFunction(yield CurrentSchematicRelevanceRunPrefixCursor.#props(this.#at("base", index)), this.#variant, role, this.#script);
      if (role === "containerIterator") { generatorPrototype = metadata.prototype; }
    }
    need(generatorPrototype !== null);
    // Classify the source generator's prototype without calling that generator.
    yield* this.#tuple("generator", CurrentSchematicRelevanceRunPrefixCursor.#call("triple", generatorPrototype, [generatorPrototype, this.#id("empty"), this.#id("empty")]), 3);
    yield* this.#tuple("map-iterator", CurrentSchematicRelevanceRunPrefixCursor.#call("map-iterator", this.#at("container", 0), [this.#id("native"), this.#id("intrinsic")]), 3);
    yield* this.#tuple("iterator-functions", CurrentSchematicRelevanceRunPrefixCursor.#call("iterator-members", this.#id("map-iterator"), [this.#id("native"), this.#id("qualified"), generatorPrototype, this.#at("intrinsic", 34)]), 4);
    const profiles = [["next", 0], ["next", 1], ["[Symbol.iterator]", 0], ["[Symbol.iterator]", 0]] as const;
    for (const [index, profile] of profiles.entries()) { const value = this.#slot("iterator-functions", index); need(value.description === `function ${profile[0]}() { [native code] }`); currentSchematicRelevancePrefixNativeFunction(yield CurrentSchematicRelevanceRunPrefixCursor.#props(this.#at("iterator-functions", index)), profile); }
    yield* CurrentSchematicRelevanceRunPrefixCursor.#true("base-same", this.#id("base"), this.#baseArguments());
  }
  *#queueFunctions(): Step<void> {
    yield* this.#tuple("queue", CurrentSchematicRelevanceRunPrefixCursor.#call("queue-functions", this.#id("roots"), [this.#id("native"), this.#id("run"), this.#id("references"), this.#id("idle"), this.#id("module"), this.#id("events"), this.#id("details"), this.#id("subscriptions"), this.#id("qualified")]), 18);
    const scopeValues: string[] = [];
    for (const [index, role] of QUEUE_ROLES.entries()) {
      const value = this.#slot("queue", index); need(value.type === "function" && value.description !== undefined); requireCurrentSchematicRelevancePrefixQueueDescription(value.description, this.#variant, role);
      const metadata = decodeCurrentSchematicRelevancePrefixQueueFunction(yield CurrentSchematicRelevanceRunPrefixCursor.#props(this.#at("queue", index)), this.#variant, role, this.#script);
      if (index === 4 || index === 5 || index === 7) {
        const closures = currentSchematicRelevancePrefixClosures(yield CurrentSchematicRelevanceRunPrefixCursor.#props(metadata.scopes));
        const binding = index === 4 ? "t" : "e"; let selected: string | null = null;
        for (const closure of closures) {
          const packet = yield CurrentSchematicRelevanceRunPrefixCursor.#props(closure);
          const fields = currentSchematicRelevancePrefixProperties(packet);
          if (fields.result.some(item => item.name === binding)) { selected = decodeCurrentSchematicRelevancePrefixQueueScope(packet, binding); break; }
        }
        need(selected !== null); scopeValues.push(selected);
      }
    }
    need(scopeValues.length === 3);
    yield* this.#tuple("scopes", CurrentSchematicRelevanceRunPrefixCursor.#call("triple", this.#id("run"), scopeValues), 3);
    yield* CurrentSchematicRelevanceRunPrefixCursor.#true("queue-scopes", this.#id("scopes"), [this.#id("native"), this.#id("references"), this.#id("roots")]);
    const guard = this.#at("queue", 17);
    const metadata = currentSchematicRelevancePrefixProperties(yield CurrentSchematicRelevanceRunPrefixCursor.#props(guard));
    const location = metadata.internalProperties?.find(item => item.name === "[[FunctionLocation]]")?.value;
    need(location?.type === "object" && location.subtype === "internal#location");
    const point = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() }).parse(location.value);
    const actual = captureCurrentSchematicDisplayAccessorSource(yield validateCurrentSchematicRelevanceRunPrefixCommand({ phase: "prefix-source", method: "Debugger.getScriptSource", params: { scriptId: point.scriptId } })).scriptSource;
    need(actual === `(${QUEUE.functions})`);
    const description = this.#slot("queue", 17).description; need(description !== undefined && actual.slice(actual.indexOf("function(){for(const item of saved)"), actual.indexOf(";return[...callees,verify]")) === description);
    yield* CurrentSchematicRelevanceRunPrefixCursor.#true("queue-same", this.#id("queue"), [this.#id("native")]);
  }
  *#willEnd(): Step<void> {
    yield* this.#tuple("will-root", CurrentSchematicRelevanceRunPrefixCursor.#call("will-end-root", this.#at("roots", 1), [this.#id("native"), this.#id("roots")]), 1);
    yield* this.#tuple("will-details", CurrentSchematicRelevanceRunPrefixCursor.#call("will-end-details", this.#at("will-root", 0), [this.#id("native"), this.#id("will-root")]), 3);
    yield* this.#tuple("will-subscription", CurrentSchematicRelevanceRunPrefixCursor.#call("will-end-subscription", this.#id("will-details"), [this.#id("native")]), 1);
    yield* this.#tuple("will-functions", CurrentSchematicRelevanceRunPrefixCursor.#call("will-end-functions", this.#at("roots", 1), [this.#id("native"), this.#id("roots"), this.#id("will-root"), this.#id("will-details"), this.#id("will-subscription"), this.#id("qualified")]), 3);
    const roles = ["historyWillEnd", "listenerDispose", "historyClearTempData"] as const;
    for (const [index, role] of roles.entries()) { const value = this.#slot("will-functions", index); need(value.type === "function" && value.description !== undefined); requireCurrentSchematicRelevancePrefixQueueDescription(value.description, this.#variant, role); decodeCurrentSchematicRelevancePrefixQueueFunction(yield CurrentSchematicRelevanceRunPrefixCursor.#props(this.#at("will-functions", index)), this.#variant, role, this.#script); }
  }
  *#busGroupPrecondition(): Step<void> {
    yield* this.#tuple("object-constructor", CurrentSchematicRelevanceRunPrefixCursor.#call("bus-group-constructor", this.#id("native"), [this.#id("native")]), 1);
    need(this.#slot("object-constructor", 0).description === "function Object() { [native code] }");
    currentSchematicRelevanceRawNativeConstructor(yield CurrentSchematicRelevanceRunPrefixCursor.#props(this.#at("object-constructor", 0)), "Object");
    yield* this.#tuple("extensibility", CurrentSchematicRelevanceRunPrefixCursor.#call("bus-group-extensibility", this.#at("object-constructor", 0), [this.#id("native")]), 1);
    need(this.#slot("extensibility", 0).description === "function isExtensible() { [native code] }");
    currentSchematicRelevancePrefixNativeFunction(yield CurrentSchematicRelevanceRunPrefixCursor.#props(this.#at("extensibility", 0)), ["isExtensible", 1]);
  }
  *#collect(): Step<CurrentSchematicRelevanceRunPrefixCapture> {
    const source = captureCurrentSchematicDisplayAccessorSource(yield validateCurrentSchematicRelevanceRunPrefixCommand({ phase: "prefix-source", method: "Debugger.getScriptSource", params: { scriptId: this.#script } })).scriptSource;
    need(qualifyCurrentSchematicRelevanceActionPrefixSource(source) === this.#variant && qualifyCurrentSchematicRelevancePrefixQueueSource(source) === this.#variant);
    yield* this.#readTuple("empty", this.#frame("empty"), 0); this.#ids.set("qualified", this.#id("empty")); this.#slots.set("qualified", Object.freeze([]));
    yield* this.#existing("native", this.#raw.nativeObjectId, 19); yield* this.#qualify("native");
    yield* this.#existing("references", this.#raw.referencesObjectId, 24); yield* this.#qualify("references");
    yield* this.#existing("idle", this.#idle, 18); yield* this.#qualify("idle");
    yield* this.#existing("entry", this.#run.tupleObjectId, 3); yield* this.#qualify("entry");
    yield* this.#tuple("run", this.#frame("run"), 14); yield* this.#tuple("module", this.#frame("module"), 4); yield* this.#tuple("group", this.#frame("group"), 1); yield* this.#tuple("intrinsics", this.#frame("intrinsics"), 10);
    yield* CurrentSchematicRelevanceRunPrefixCursor.#true("run", this.#id("run"), [this.#id("native"), this.#id("entry"), this.#id("references")]);
    yield* this.#tuple("roots", CurrentSchematicRelevanceRunPrefixCursor.#call("queue-roots", this.#id("run"), [this.#id("native"), this.#id("references"), this.#id("idle"), this.#id("module")]), 9);
    yield* this.#tuple("events", CurrentSchematicRelevanceRunPrefixCursor.#call("queue-events", this.#id("roots"), [this.#id("native"), this.#id("references"), this.#id("idle")]), 9);
    yield* this.#tuple("details", CurrentSchematicRelevanceRunPrefixCursor.#call("queue-details", this.#id("events"), [this.#id("native"), this.#id("module")]), 7);
    yield* this.#tuple("subscriptions", CurrentSchematicRelevanceRunPrefixCursor.#call("queue-subscriptions", this.#id("details"), [this.#id("native")]), 4);
    yield* this.#tuple("manager", CurrentSchematicRelevanceRunPrefixCursor.#call("manager", this.#at("roots", 5), [this.#id("native"), this.#id("roots")]), 2); yield* CurrentSchematicRelevanceRunPrefixCursor.#true("manager-base", this.#at("manager", 0), [this.#id("native"), this.#id("manager")]);
    yield* this.#tuple("channel", CurrentSchematicRelevanceRunPrefixCursor.#call("pause-channel", this.#at("roots", 7), [this.#id("native"), this.#id("roots")]), 1);
    yield* this.#tuple("intrinsic-prototypes", CurrentSchematicRelevanceRunPrefixCursor.#call("intrinsic-prototypes", this.#id("intrinsics"), [this.#id("native")]), 7);
    const nativeMetadata = currentSchematicRelevancePrefixProperties(yield CurrentSchematicRelevanceRunPrefixCursor.#props(this.#at("run", 10)));
    const functionPrototype = currentSchematicRelevancePrefixHandle(nativeMetadata.internalProperties?.find(item => item.name === "[[Prototype]]")?.value);
    yield* this.#tuple("intrinsic", CurrentSchematicRelevanceRunPrefixCursor.#call("intrinsic-members", this.#id("intrinsics"), [this.#id("native"), this.#id("intrinsic-prototypes"), this.#id("qualified"), functionPrototype, this.#id("run")]), 38); yield* this.#nativeFunctions();
    yield* this.#tuple("container", CurrentSchematicRelevanceRunPrefixCursor.#call("container", this.#at("roots", 3), [this.#id("native"), this.#id("roots")]), 2);
    yield* this.#tuple("members", CurrentSchematicRelevanceRunPrefixCursor.#call("container-members", this.#id("container"), [this.#id("native"), this.#id("roots")]), 2);
    const weak = decodeCurrentSchematicRelevancePrefixQueueWeakRef(yield CurrentSchematicRelevanceRunPrefixCursor.#props(this.#at("members", 1)));
    yield* CurrentSchematicRelevanceRunPrefixCursor.#true("weak-target", weak.target, [this.#id("native"), this.#id("references")]);
    yield* CurrentSchematicRelevanceRunPrefixCursor.#true("weak-map", this.#at("container", 1), [this.#id("native"), this.#id("references"), this.#id("roots"), this.#id("container"), this.#id("members"), this.#id("intrinsic")]);
    yield* this.#willEnd(); yield* this.#baseFunctions(); yield* this.#busGroupPrecondition(); yield* this.#queueFunctions();
    yield* CurrentSchematicRelevanceRunPrefixCursor.#true("bus-group-idle", this.#at("references", 10), [this.#id("native"), this.#id("references"), this.#id("qualified"), this.#at("object-constructor", 0), this.#at("extensibility", 0)]);
    yield* CurrentSchematicRelevanceRunPrefixCursor.#true("raw-same", this.#raw.snapshotObjectId, [this.#id("native")]);
    return Object.freeze({ mapIteratorObjectId:this.#id("map-iterator"),iteratorFunctionsObjectId:this.#id("iterator-functions"),objectConstructorObjectId:this.#at("object-constructor",0),objectIsExtensibleObjectId:this.#at("extensibility",0),idleFunctionsObjectId: this.#id("idle"), runObjectId: this.#id("run"), rootsObjectId: this.#id("roots"), nativeObjectId: this.#id("native"), referencesObjectId: this.#id("references"), firstStartObjectId: this.#at("queue", 4), willEndObjectId: this.#at("will-functions", 0), firstEndObjectId: this.#at("queue", 6), intrinsicObjectsObjectId: this.#id("intrinsics"), baseFunctionsObjectId: this.#id("base"), queueFunctionsObjectId: this.#id("queue"), intrinsicFunctionsObjectId: this.#id("intrinsic"), qualifiedObjectId: this.#id("qualified"), originalRequests: this.#requests, originalRunStillHeld: true, callbackReceiversVerified: false, continuationAuthorized: false, persistenceVerified: false });
  }
  public next(): Command | null {
    need(!this.#failed && !this.#reserved);
    if (this.#command === null && this.#completed === null) { const next = this.#plan.next(); need(next.done !== true); this.#command = next.value; }
    return this.#command;
  }
  public reserve(command: Command): void { need(!this.#failed && !this.#reserved && this.#command !== null && command === this.#command && this.#requests < CURRENT_SCHEMATIC_RELEVANCE_RUN_PREFIX_READ_BOUND); this.#requests += 1; this.#reserved = true; }
  public accept(command: Command, raw: unknown): void {
    need(!this.#failed && this.#reserved && this.#command !== null && command === this.#command);
    try { const next = this.#plan.next(raw); this.#reserved = false; if (next.done === true) { this.#completed = next.value; this.#command = null; } else { this.#command = next.value; } }
    catch (error) { this.#failed = true; throw error; }
  }
  public fail(): void { this.#failed = true; }
  public requireCompleted(): CurrentSchematicRelevanceRunPrefixCapture { need(!this.#failed && !this.#reserved && this.#command === null && this.#completed !== null); return this.#completed; }
}
