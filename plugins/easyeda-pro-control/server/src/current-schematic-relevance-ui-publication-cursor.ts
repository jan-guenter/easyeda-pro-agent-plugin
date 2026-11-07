/** Original publisher/native dependencies while the first setAttribute is held.
 * This cursor invokes no encoder, consistency callback, publisher or timer. */
/* oxlint-disable import/max-dependencies -- Independent exact source/native metadata profiles qualify the same original graph without sharing authority. */
import { z } from "zod";
import { CURRENT_SCHEMATIC_RELEVANCE_UI_PUBLICATION_READ_BOUND as BOUND, CURRENT_SCHEMATIC_RELEVANCE_UI_PUBLICATION_CALLS as CALLS, CURRENT_SCHEMATIC_RELEVANCE_UI_PUBLICATION_FLAGS as FLAGS, validateCurrentSchematicRelevanceUiPublicationCommand as validate } from "./current-schematic-relevance-ui-publication-protocol.ts";
import type { CurrentSchematicRelevanceUiPublicationCommand as Command } from "./current-schematic-relevance-ui-publication-protocol.ts";
import { currentSchematicRelevanceUiPublicationCapture as capture, currentSchematicRelevanceUiPublicationHandle as handle, currentSchematicRelevanceUiPublicationProperties as properties, currentSchematicRelevanceUiPublicationTrue as truth, currentSchematicRelevanceUiPublicationTuple as tuple } from "./current-schematic-relevance-ui-publication-replies.ts";
import type { CurrentSchematicRelevanceUiPublicationRemote as Remote } from "./current-schematic-relevance-ui-publication-replies.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { captureCurrentSchematicDisplayAccessorSource } from "./current-schematic-display-accessor-replies.ts";
import { qualifyCurrentSchematicRelevancePublicationCalleeSource as qualify } from "./current-schematic-relevance-publication-callee-source.ts";
import { decodeCurrentSchematicRelevancePublicationCalleeFunction as decodeFunction, requireCurrentSchematicRelevancePublicationCalleeDescription as description } from "./current-schematic-relevance-publication-callee-replies.ts";
import { decodeCurrentNativeFunctionMetadata } from "./current-native-function-metadata.ts";
import { currentSchematicRelevancePrefixNativeFunction as nativeFunction } from "./current-schematic-relevance-run-prefix-replies.ts";
import type { CurrentSchematicRelevanceRawCapture } from "./current-schematic-relevance-action-raw-cursor.ts";
import type { CurrentSchematicRelevanceRunPrefixCapture } from "./current-schematic-relevance-run-prefix-cursor.ts";
import type { CurrentSchematicRelevanceActiveHistoryReceipt } from "./current-schematic-relevance-active-history-cursor.ts";

const ROLES = ["publisherConstructor", "cachePendData", "publishPendData", "localChange", "uniqueIdGet", "consistencyGetClient", "consistencyGetUnique"] as const;
const NATIVE = [["setTimeout", 1], ["clearTimeout", 0], ["stringify", 3], ["parse", 2], ["debug", 0]] as const;
type Step<T> = Generator<Command, T, unknown>;
function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_RELEVANCE_UI_PUBLICATION_CURSOR"); } }
export interface CurrentSchematicRelevanceUiPublicationReceipt {
  readonly snapshotObjectId: string; readonly linksObjectId: string; readonly stateObjectId: string; readonly pristineObjectId: string; readonly functionsObjectId: string;
  readonly globalObjectId: string; readonly globalsObjectId: string; readonly membersObjectId: string; readonly qualifiedObjectId: string;
  readonly originalRequests: number; readonly originalPublisherPristineVerified: true; readonly originalNativeDependenciesVerified: true;
  readonly nativeSenderVerified: false; readonly promiseContinuationsVerified: false; readonly consistencyCallbackReceiverVerified: false; readonly publicationCompleted: false; readonly primitiveWriteAuthorized: false;
}
export class CurrentSchematicRelevanceUiPublicationCursor {
  readonly #frame: string; readonly #context: string; readonly #script: string; readonly #variant: 0 | 1; readonly #holder: string;
  readonly #raw: CurrentSchematicRelevanceRawCapture; readonly #prefix: CurrentSchematicRelevanceRunPrefixCapture; readonly #active: CurrentSchematicRelevanceActiveHistoryReceipt;
  readonly #ids = new Map<string, string>(); readonly #slots = new Map<string, readonly Remote[]>(); readonly #plan: Step<CurrentSchematicRelevanceUiPublicationReceipt>;
  #pending: Command | null = null; #reserved = false; #failed = false; #reads = 0; #receipt: CurrentSchematicRelevanceUiPublicationReceipt | null = null;
  public constructor(frame: string, context: string, script: string, variant: 0 | 1, holder: string, raw: CurrentSchematicRelevanceRawCapture, prefix: CurrentSchematicRelevanceRunPrefixCapture, active: CurrentSchematicRelevanceActiveHistoryReceipt) {
    this.#frame = frame; this.#context = context; this.#script = script; this.#variant = variant; this.#holder = holder; this.#raw = raw; this.#prefix = prefix; this.#active = active; this.#ids.set("qualified", active.qualifiedObjectId); this.#plan = this.#collect(); Object.freeze(this);
  }
  #id(name: string): string { const id = this.#ids.get(name); need(id !== undefined); return id; }
  static #props(objectId: string): Command { return validate({ phase: "properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }); }
  static #call(role: typeof CALLS[number][0], objectId: string, args: readonly string[]): Command { const row = CALLS.find(value => value[0] === role); need(row !== undefined && args.length === row[2]); return validate({ phase: "call", role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId, functionDeclaration: row[1], arguments: args.map(id => ({ objectId: id })), returnByValue: row[3], awaitPromise: false, userGesture: false } }); }
  *#read(name: string, command: Command, length?: number): Step<void> { const id = capture(yield command); const values = tuple(yield CurrentSchematicRelevanceUiPublicationCursor.#props(id), length); this.#ids.set(name, id); this.#slots.set(name, values); }
  *#qualify(name: string): Step<void> {
    let candidate = this.#id(name);
    for (let depth = 0; depth < 12; depth += 1) {
      yield* this.#read("novel", CurrentSchematicRelevanceUiPublicationCursor.#call("novel", candidate, [this.#raw.nativeObjectId, this.#id("qualified")])); const fresh = this.#slots.get("novel"); need(fresh !== undefined); if (fresh.length === 0) { return; }
      for (const value of fresh) { properties(yield CurrentSchematicRelevanceUiPublicationCursor.#props(handle(value))); }
      yield* this.#read("qualified", CurrentSchematicRelevanceUiPublicationCursor.#call("merge", this.#id("qualified"), [this.#raw.nativeObjectId, this.#id("novel")])); need((this.#slots.get("qualified")?.length ?? 385) <= 384);
      yield* this.#read("parents", CurrentSchematicRelevanceUiPublicationCursor.#call("prototypes", this.#id("novel"), [this.#raw.nativeObjectId])); candidate = this.#id("parents");
    }
    need(this.#slots.get("parents")?.every(value => value.type === "object" && value.subtype === "null" && value.value === null) === true);
  }
  *#tuple(name: string, command: Command, length: number): Step<void> { yield* this.#read(name, command, length); yield* this.#qualify(name); }
  #args(): readonly string[] { return [this.#raw.nativeObjectId, this.#id("links"), this.#raw.referencesObjectId, this.#holder]; }
  *#collect(): Step<CurrentSchematicRelevanceUiPublicationReceipt> {
    need(this.#active.originalActiveHistoryVerified && this.#active.originalFunctionMetadataVerified && !this.#active.primitiveWriteAuthorized);
    truth(yield CurrentSchematicRelevanceUiPublicationCursor.#call("descriptor-hooks", this.#raw.nativeObjectId, []));
    const source = captureCurrentSchematicDisplayAccessorSource(yield validate({ phase: "source", method: "Debugger.getScriptSource", params: { scriptId: this.#script } })).scriptSource; need(qualify(source) === this.#variant);
    yield* this.#tuple("links", CurrentSchematicRelevanceUiPublicationCursor.#call("links", this.#prefix.rootsObjectId, [this.#raw.nativeObjectId]), 4);
    yield* this.#tuple("namespace", validate({ phase: "namespace", variant: this.#variant, method: "Debugger.evaluateOnCallFrame", params: { ...FLAGS, callFrameId: this.#frame, expression: this.#variant === 0 ? "[da]" : "[ya]", returnByValue: false, includeCommandLineAPI: false } }), 1);
    yield* this.#tuple("state", CurrentSchematicRelevanceUiPublicationCursor.#call("state", this.#id("links"), [...this.#args(), this.#id("namespace")]), 7);
    yield* this.#tuple("functions", CurrentSchematicRelevanceUiPublicationCursor.#call("functions", this.#id("links"), [this.#raw.nativeObjectId, this.#id("links"), this.#id("qualified")]), ROLES.length);
    for (const [index, role] of ROLES.entries()) { const value = this.#slots.get("functions")?.[index]; need(value?.type === "function" && typeof value.description === "string"); description(value.description, this.#variant, role); decodeFunction(yield CurrentSchematicRelevanceUiPublicationCursor.#props(handle(value)), this.#variant, role, this.#script); }
    const global = z.strictObject({ result: z.strictObject({ type: z.literal("object"), className: z.literal("Window"), description: z.literal("Window"), objectId: z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u) }) }).parse(captureCurrentPcbStringClockReply(yield validate({ phase: "global", method: "Runtime.evaluate", params: { ...FLAGS, expression: "this", uniqueContextId: this.#context, returnByValue: false, includeCommandLineAPI: false, awaitPromise: false, userGesture: false } })).value).result.objectId; this.#ids.set("global", global);
    yield* this.#tuple("seed", CurrentSchematicRelevanceUiPublicationCursor.#call("seed", global, []), 1);
    yield* this.#tuple("globals", CurrentSchematicRelevanceUiPublicationCursor.#call("globals", global, [this.#raw.nativeObjectId, this.#id("qualified")]), 8);
    yield* this.#tuple("members", CurrentSchematicRelevanceUiPublicationCursor.#call("global-members", this.#id("globals"), [this.#raw.nativeObjectId, this.#id("qualified")]), 6);
    for (const [index, expected] of NATIVE.entries()) { const value = index < 2 ? this.#slots.get("globals")?.[index + 2] : this.#slots.get("members")?.[index - 2]; need(value?.type === "function" && value.description === `function ${expected[0]}() { [native code] }`); decodeCurrentNativeFunctionMetadata(yield CurrentSchematicRelevanceUiPublicationCursor.#props(handle(value)), { name: expected[0], arity: expected[1], constructor: false }); }
    const broadcast = this.#slots.get("globals")?.[5], promise = this.#slots.get("globals")?.[1]; need(promise?.type === "function" && promise.description === "function Promise() { [native code] }" && broadcast?.type === "function" && broadcast.description === "function BroadcastChannel() { [native code] }"); nativeFunction(yield CurrentSchematicRelevanceUiPublicationCursor.#props(handle(promise)), ["Promise", 1]); decodeCurrentNativeFunctionMetadata(yield CurrentSchematicRelevanceUiPublicationCursor.#props(handle(broadcast)), { name: "BroadcastChannel", arity: 1, constructor: true, parentDescription: "function EventTarget() { [native code] }" });
    yield* this.#tuple("pristine", CurrentSchematicRelevanceUiPublicationCursor.#call("pristine", this.#id("state"), [...this.#args(), this.#id("qualified")]), 7);
    yield* this.#read("snapshot", CurrentSchematicRelevanceUiPublicationCursor.#call("snapshot", this.#id("qualified"), [this.#raw.nativeObjectId]));
    yield* this.#read("current-functions", CurrentSchematicRelevanceUiPublicationCursor.#call("functions", this.#id("links"), [this.#raw.nativeObjectId, this.#id("links"), this.#id("qualified")]), ROLES.length);
    truth(yield CurrentSchematicRelevanceUiPublicationCursor.#call("same-functions", this.#id("functions"), [this.#raw.nativeObjectId, this.#id("current-functions")]));
    truth(yield CurrentSchematicRelevanceUiPublicationCursor.#call("same-globals", global, [this.#raw.nativeObjectId, this.#id("qualified"), this.#id("globals"), this.#id("members")]));
    truth(yield CurrentSchematicRelevanceUiPublicationCursor.#call("descriptor-hooks", this.#raw.nativeObjectId, []));
    truth(yield CurrentSchematicRelevanceUiPublicationCursor.#call("same-snapshot", this.#id("snapshot"), [this.#raw.nativeObjectId, this.#id("qualified")]));
    return Object.freeze({ snapshotObjectId: this.#id("snapshot"), linksObjectId: this.#id("links"), stateObjectId: this.#id("state"), pristineObjectId: this.#id("pristine"), functionsObjectId: this.#id("functions"), globalObjectId: global, globalsObjectId: this.#id("globals"), membersObjectId: this.#id("members"), qualifiedObjectId: this.#id("qualified"), originalRequests: this.#reads, originalPublisherPristineVerified: true, originalNativeDependenciesVerified: true, nativeSenderVerified: false, promiseContinuationsVerified: false, consistencyCallbackReceiverVerified: false, publicationCompleted: false, primitiveWriteAuthorized: false });
  }
  public next(): Command | null { need(!this.#failed && !this.#reserved); if (this.#pending !== null) { return this.#pending; } if (this.#receipt !== null) { return null; } const step = this.#plan.next(); need(step.done !== true); this.#pending = step.value; return this.#pending; }
  public reserve(command: Command): void { need(!this.#failed && !this.#reserved && this.next() === command); this.#reserved = true; this.#reads += 1; need(this.#reads <= BOUND); }
  public accept(command: Command, reply: unknown): void { need(!this.#failed && this.#reserved && this.#pending === command); try { const step = this.#plan.next(reply); this.#pending = null; this.#reserved = false; if (step.done === true) { this.#receipt = step.value; } else { this.#pending = step.value; } } catch (error) { this.#failed = true; throw error; } }
  public requireCompleted(): CurrentSchematicRelevanceUiPublicationReceipt { need(!this.#failed && !this.#reserved && this.#pending === null && this.#receipt !== null); return this.#receipt; }
  public fail(): void { this.#failed = true; }
}
