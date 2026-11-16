/** Finite readers bind one fresh original tree wrapper to its actual caller
 * continuation and the same native Promise. Original event custody stays external. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply as capture } from "./current-pcb-string-clock-reply.ts";
import { decodeCurrentFootprintCopyClockRpcV2Array as array, decodeCurrentFootprintCopyClockRpcV2ArrayCapture as tuple } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import { currentSchematicRelevanceRawHandle as object, currentSchematicRelevanceRawProperties as properties } from "./current-schematic-relevance-action-raw-replies.ts";
import type { CurrentSchematicRelevanceRawRemote as Remote } from "./current-schematic-relevance-action-raw-replies.ts";
import { CURRENT_SCHEMATIC_WIRE_ASYNC_CALLS as CALLS, CURRENT_SCHEMATIC_WIRE_ASYNC_FLAGS as FLAGS, CURRENT_SCHEMATIC_WIRE_ASYNC_REQUESTS as LIMIT, validateCurrentSchematicWireAsyncCommand as validate } from "./current-schematic-wire-async-protocol.ts";
import type { CurrentSchematicWireAsyncCommand as Command } from "./current-schematic-wire-async-protocol.ts";
import { CURRENT_SCHEMATIC_WIRE_ASYNC_FRAMES as FRAMES } from "./current-schematic-wire-async-programs.ts";
import { CURRENT_SCHEMATIC_WIRE_ASYNC_SOURCE as SOURCE, decodeCurrentSchematicWireAsyncFunction as qualify } from "./current-schematic-wire-async-source.ts";
import type { CurrentSchematicWireAsyncTree as Tree } from "./current-schematic-wire-async-source.ts";
import { decodeCurrentSchematicWireAsyncPromise as promiseState } from "./current-schematic-wire-async-replies.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const tree = z.enum(["objectContent", "pageContent", "netContent", "symbolContent"]);
const truth = z.strictObject({ result: z.strictObject({ type: z.literal("boolean"), value: z.literal(true) }) });
function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_WIRE_ASYNC_CURSOR"); } }
type Entry = Readonly<{ role: "entry"; frame: string; holder: string; native: string; ast: string; tree: string; wrapper: string; scriptId: string; variant: 0 | 1; treeRole: Tree }>;
export type CurrentSchematicWireAsyncInput = Entry | Readonly<{ role: "target" | "continuation"; frame: string; previous: CurrentSchematicWireAsyncData }> | Readonly<{ role: "settled"; previous: CurrentSchematicWireAsyncData }>;
export interface CurrentSchematicWireAsyncData {
  readonly schema: "private.schematic-wire-async-comparison-data.v1"; readonly role: CurrentSchematicWireAsyncInput["role"];
  readonly entrySnapshot: string; readonly targetFunction: string; readonly originalTargetReceiverCompared: boolean; readonly promise: string | null; readonly originalCallerReturnCompared: boolean; readonly samePromiseFulfilledCompared: boolean;
  readonly suppliedObservationsOnly: true; readonly originalHeldEventJoined: false; readonly asynchronousPublicationComplete: false;
  readonly continuationAuthorized: false; readonly mutationAuthorized: false; readonly saveAuthorized: false;
}
interface Stored { readonly input: Entry; readonly snapshot: string; readonly wrapper: Remote; readonly target: string; readonly scope: string | null; readonly promiseSnapshot: string | null; readonly promise: string | null }
const issued = new WeakMap<CurrentSchematicWireAsyncData, Stored>();
const successors = new WeakSet<CurrentSchematicWireAsyncData>();
function props(objectId: string): Command { return validate({ phase: "wire-async-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }); }
function call(role: keyof typeof CALLS, receiver: string, refs: readonly string[]): Command {
  const row = CALLS[role]; need(refs.length === row.refs);
  return validate({ phase: "wire-async-call", role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: receiver, functionDeclaration: row.program, arguments: refs.map(objectId => ({ objectId })), returnByValue: row.byValue, awaitPromise: false, userGesture: false } });
}
function frame(role: keyof typeof FRAMES, callFrameId: string): Command { return validate({ phase: "wire-async-frame", role, method: "Debugger.evaluateOnCallFrame", params: { ...FLAGS, callFrameId, expression: FRAMES[role], returnByValue: false, includeCommandLineAPI: false } }); }
function nil(value: Remote | undefined): void { need(value?.type === "object" && value.subtype === "null" && value.value === null && value.objectId === undefined); }
function* refreshScope(wrapper: Remote, input: Entry): Generator<Command, string, unknown> {
  const decoded = qualify(yield props(input.wrapper), wrapper, input.variant, "serialCall", input.scriptId);
  const scopePacket = z.strictObject({ result: z.array(z.unknown()).min(1).max(LIMIT.scopeLimit) }).parse(yield props(decoded.scopes));
  const fields = properties({ ...scopePacket, internalProperties: [] });
  const matches = [...fields.values()].filter(row => row.value?.type === "object" && row.value.subtype === "internal#scope" && row.value.description === `Closure (${SOURCE[input.variant].rows.serial.name})` && row.get === undefined && row.set === undefined);
  need(matches.length === 1); return object(matches[0]?.value, "object");
}
/** A proxy exposes different native internals. Compare only an ordinary
 * original receiver before any later descriptor projection can traverse it. */
const ordinaryInternal = z.strictObject({ name: z.literal("[[Prototype]]"), value: z.unknown() });
const ordinaryPacket = z.strictObject({ result: z.array(z.unknown()).max(256), internalProperties: z.array(ordinaryInternal).length(1) });
function ordinary(input: unknown): ReturnType<typeof properties> {
  const packet = capture(input).value;
  const parsed = ordinaryPacket.parse(packet);
  need(parsed.internalProperties.length === 1);
  return properties(packet);
}
export class CurrentSchematicWireAsyncCursor {
  readonly #plan: Generator<Command, CurrentSchematicWireAsyncData, unknown>; readonly #maximum: number;
  #pending: Command | null = null; #reserved = false; #failed = false; #reads = 0; #result: CurrentSchematicWireAsyncData | null = null; readonly #packets: unknown[] = [];
  /** Only an exact issued packet can bind its single successor. Every input
   * selector is copied; no original event or writer ownership is synthesized. */
  public constructor(input: CurrentSchematicWireAsyncInput) {
    const retained = Object.freeze({ ...input }); let original: Entry; let prior: Stored | null = null;
    if (retained.role === "entry") {
      original = retained;
      for (const id of [original.frame, original.holder, original.native, original.ast, original.tree, original.wrapper, original.scriptId]) { handle.parse(id); }
      tree.parse(original.treeRole); need((original.variant === 0 || original.variant === 1) && !Object.is(original.variant, -0));
    } else {
      const stored = issued.get(retained.previous);
      need(stored !== undefined && !successors.has(retained.previous) && retained.previous.role === ({ target: "entry", continuation: "target", settled: "continuation" } as const)[retained.role]);
      successors.add(retained.previous); prior = stored; original = stored.input;
      if (retained.role !== "settled") { handle.parse(retained.frame); }
    }
    const maximum = { entry: LIMIT.entry, target: LIMIT.target, continuation: LIMIT.continuation, settled: LIMIT.settlementMaximum } as const;
    this.#maximum = maximum[retained.role];
    this.#plan = CurrentSchematicWireAsyncCursor.collect(retained, original, prior); Object.freeze(this);
  }
  private static *collect(input: CurrentSchematicWireAsyncInput, original: Entry, prior: Stored | null): Generator<Command, CurrentSchematicWireAsyncData, unknown> {
    const { native, holder, variant, scriptId } = original; let snapshot: string; let wrapper: Remote; let targetFunction: string; let scope: string | null = null; let promiseSnapshot: string | null = null; let promise: string | null = null;
    if (input.role === "entry") {
      const captured = tuple(yield frame("entry", original.frame), 5); const fields = array(yield props(captured), 5); nil(fields.get("0")); nil(fields.get("1"));
      const args = object(fields.get("2"), "object"); array(yield props(args), 3);
      const target = fields.get("3"); need(target !== undefined); const targetId = object(target, "function"); targetFunction = targetId; qualify(yield props(targetId), target, variant, original.treeRole, scriptId);

      // Metadata requires the complete actual wrapper description as well as
      // Its original script. Select it from its already qualified tree packet.
      const treeFields = ordinary(yield props(original.tree)); const ownWrapper = treeFields.get("passContentData");
      need(ownWrapper?.value?.type === "function" && ownWrapper.get === undefined && ownWrapper.set === undefined);
      wrapper = Object.freeze({ ...ownWrapper.value, objectId: original.wrapper });
      qualify(yield props(original.wrapper), wrapper, variant, "serialCall", scriptId);
      ordinary(yield props(original.ast));
      const role = { objectContent: "entryObject", pageContent: "entryPage", netContent: "entryNet", symbolContent: "entrySymbol" } as const;
      snapshot = tuple(yield call(role[original.treeRole], captured, [native, holder, original.ast, original.tree, original.wrapper]), 15); array(yield props(snapshot), 15);
    } else {
      need(prior !== null); snapshot = prior.snapshot; wrapper = prior.wrapper; targetFunction = prior.target;
      if (input.role === "target") {
        const role = original.treeRole === "netContent" || original.treeRole === "symbolContent" ? "targetExtended" : "target";
        const count = role === "target" ? 3 : 4;
        const captured = tuple(yield frame(role, input.frame), count); array(yield props(captured), count);
        truth.parse(yield call(role, captured, [native, holder, snapshot]));
      } else if (input.role === "continuation") {
        const captured = tuple(yield frame("continuation", input.frame), 3); array(yield props(captured), 3);
        truth.parse(yield call("caller", captured, [native, holder, snapshot]));

        // Reuse the complete description retained by the original entry's
        // Immutable packet, rather than accepting a caller-supplied source.
        scope = yield* refreshScope(wrapper, original);
        const closure = tuple(yield call("scope", scope, [native]), 4); const cells = array(yield props(closure), 4); nil(cells.get("1"));
        const value = cells.get("0"); need(value?.type === "object" && value.subtype === "promise" && value.className === "Promise" && value.description === "Promise" && value.objectId !== undefined); object(cells.get("2"), "object"); object(cells.get("3"), "function");
        promiseSnapshot = tuple(yield call("returned", closure, [native, holder, snapshot]), 2); const saved = array(yield props(promiseSnapshot), 2);
        const retainedPromise = saved.get("0"); need(retainedPromise?.type === "object" && retainedPromise.subtype === "promise" && retainedPromise.className === "Promise" && retainedPromise.description === "Promise"); promise = object(retainedPromise, "object"); object(saved.get("1"), "object");
        need(promiseState(yield props(promise)) === "pending");
      } else {
        need(prior.promise !== null && prior.scope !== null && prior.promiseSnapshot !== null); promise = prior.promise; scope = prior.scope; promiseSnapshot = prior.promiseSnapshot;
        let fulfilled = false;
        for (let index = 1; index < LIMIT.promisePollsMaximum; index += 1) { if (promiseState(yield props(promise)) === "fulfilled") { fulfilled = true; break; } }
        need(fulfilled);
        scope = yield* refreshScope(wrapper, original);
        const closure = tuple(yield call("scope", scope, [native]), 4); array(yield props(closure), 4);
        truth.parse(yield call("settled", closure, [native, holder, snapshot, promiseSnapshot]));
      }
    }
    const data: CurrentSchematicWireAsyncData = Object.freeze({ schema: "private.schematic-wire-async-comparison-data.v1", role: input.role, entrySnapshot: snapshot, targetFunction, originalTargetReceiverCompared: input.role !== "entry", promise, originalCallerReturnCompared: input.role === "continuation" || input.role === "settled", samePromiseFulfilledCompared: input.role === "settled", suppliedObservationsOnly: true, originalHeldEventJoined: false, asynchronousPublicationComplete: false, continuationAuthorized: false, mutationAuthorized: false, saveAuthorized: false });
    if (input.role !== "settled") { issued.set(data, Object.freeze({ input: original, snapshot, wrapper, target: targetFunction, scope, promiseSnapshot, promise })); }
    return data;
  }
  /** Retain exactly one pending command until its original reservation. */
  public next(): Command | null {
    need(!this.#failed && !this.#reserved); if (this.#pending !== null) { return this.#pending; } if (this.#result !== null) { return null; }
    try { const step = this.#plan.next(); need(step.done !== true); this.#pending = step.value; return step.value; } catch (error) { this.#failed = true; throw error; }
  }
  /** Reserve before any request is written. Copies cannot consume this cursor. */
  public reserve(command: Command): void { need(!this.#failed && !this.#reserved && this.#pending !== null && command === this.#pending && this.#reads < this.#maximum); this.#reserved = true; this.#reads += 1; }
  /** Preserve supplied replies and permanently consume malformed or failed work. */
  public accept(command: Command, raw: unknown): void {
    need(!this.#failed && this.#reserved && this.#pending === command);
    try { const value = capture(raw).value; this.#packets.push(raw); const step = this.#plan.next(value); this.#pending = null; this.#reserved = false; if (step.done === true) { this.#result = step.value; } else { this.#pending = step.value; } } catch (error) { this.#failed = true; throw error; }
  }
  /** Supplied data cannot replace actual original events or native custody. */
  public requireCompleted(): CurrentSchematicWireAsyncData { need(!this.#failed && !this.#reserved && this.#pending === null && this.#result !== null); return this.#result; }
  /** Return exact reply packets without converting them into admission proof. */
  public retainedReplies(): readonly unknown[] { need(!this.#failed && this.#result !== null); return Object.freeze([...this.#packets]); }
  /** Original owner failure permanently consumes this reader. */
  public fail(): void { this.#failed = true; }
}
