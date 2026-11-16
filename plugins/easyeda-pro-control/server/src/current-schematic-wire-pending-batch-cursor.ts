/** Retain the original three-tuple publication through the original publisher
 * return, timer return and same native Promise. Comparisons issue no origin. */
import { z } from "zod";
import { consumeCurrentSchematicWireCmPublicationData } from "./current-schematic-wire-cm-publication-cursor.ts";
import type { CurrentSchematicWireCmPublicationData } from "./current-schematic-wire-cm-publication-cursor.ts";
import { sameCurrentSchematicWirePublicationBody as sameBody, currentSchematicWirePublicationValueSchema as valueSchema } from "./current-schematic-wire-publication-values.ts";
import type { CurrentSchematicWirePublicationExpected as Expected } from "./current-schematic-wire-publication-values.ts";
import { captureCurrentPcbStringClockReply as capture } from "./current-pcb-string-clock-reply.ts";
import { decodeCurrentFootprintCopyClockRpcV2Array as array, decodeCurrentFootprintCopyClockRpcV2ArrayCapture as tuple } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import { currentSchematicRelevanceRawHandle as object } from "./current-schematic-relevance-action-raw-replies.ts";
import { decodeCurrentSchematicWireAsyncPromise as promiseState } from "./current-schematic-wire-async-replies.ts";
import { CurrentSchematicWirePendingBatchCensus as Census, wirePendingBatchRef as ref } from "./current-schematic-wire-pending-batch-census.ts";
import { CURRENT_SCHEMATIC_WIRE_PENDING_BATCH_CALLS as CALLS, CURRENT_SCHEMATIC_WIRE_PENDING_BATCH_FLAGS as FLAGS, CURRENT_SCHEMATIC_WIRE_PENDING_BATCH_REQUESTS as LIMIT, validateCurrentSchematicWirePendingBatchCommand as validate } from "./current-schematic-wire-pending-batch-protocol.ts";
import { CURRENT_SCHEMATIC_WIRE_PENDING_BATCH_FRAMES as FRAMES } from "./current-schematic-wire-pending-batch-programs.ts";
import type { CurrentSchematicWirePendingBatchCommand as Command } from "./current-schematic-wire-pending-batch-protocol.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const valuesSchema = z.strictObject({ result: z.strictObject({ type: z.literal("object"), value: z.tuple([valueSchema, valueSchema, valueSchema]).readonly() }) });
const truth = z.strictObject({ result: z.strictObject({ type: z.literal("boolean"), value: z.literal(true) }) });
type Values = z.infer<typeof valuesSchema>["result"]["value"];
function need(condition: boolean): asserts condition { if (!condition) { throw new Error("SCHEMATIC_WIRE_PENDING_BATCH_CURSOR"); } }
function props(objectId: string): Command { return validate({ phase: "wire-pending-batch-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }); }
function call(role: keyof typeof CALLS, receiver: string, refs: readonly string[]): Command { const row = CALLS[role]; need(row.refs === refs.length); return validate({ phase: "wire-pending-batch-call", role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: receiver, functionDeclaration: row.program, arguments: refs.map(objectId => ({ objectId })), returnByValue: row.byValue, awaitPromise: false, userGesture: false } }); }
function frame(role: keyof typeof FRAMES, callFrameId: string): Command { return validate({ phase: "wire-pending-batch-frame", role, method: "Debugger.evaluateOnCallFrame", params: { ...FLAGS, callFrameId, expression: FRAMES[role], returnByValue: false, includeCommandLineAPI: false } }); }
function* fulfilled(promise: string): Generator<Command, void, unknown> {
  for (let i = 1; i < LIMIT.settlementMaximum; i += 1) { if (promiseState(yield props(promise)) === "fulfilled") { return; } }
  need(false);
}
export interface CurrentSchematicWirePendingBatchData {
  readonly schema: "private.schematic-wire-pending-batch-comparison-data.v1"; readonly stage: "payload" | "publisherReturned" | "timerReturned" | "settled";
  readonly snapshot: string; readonly values: readonly (readonly [string, number, "WIRE" | "LINE" | "ATTR", string])[];
  readonly originalThreeTuplePayloadCompared: true; readonly sameTimerResolverCompared: boolean; readonly originalArrayClearedCompared: boolean; readonly samePromiseFulfilledCompared: boolean;
  readonly suppliedObservationsOnly: true; readonly originalEventsJoined: false; readonly workerPublicationJoined: false; readonly lifecycleComplete: false; readonly saveAuthorized: false;
}
type First = Readonly<{ stage: "payload"; frame: string; timerFrame: string; holder: string; native: string; expected: Expected; cmSnapshot: string }>;
export type CurrentSchematicWirePendingBatchInput = Readonly<{ stage: "payload"; frame: string; timerFrame: string; previous: CurrentSchematicWireCmPublicationData }> | Readonly<{ stage: "publisherReturned" | "timerReturned"; frame: string; previous: CurrentSchematicWirePendingBatchData }> | Readonly<{ stage: "settled"; previous: CurrentSchematicWirePendingBatchData }>;
interface Stored { readonly identity: Readonly<{ page: string; client: string; unique: string }>; readonly first: First; readonly snapshot: string; readonly promise: string; readonly values: Values; readonly cleared: string | null; readonly timerFrame: string | null }
const issued = new WeakMap<CurrentSchematicWirePendingBatchData, Stored>();
const spent = new WeakSet<CurrentSchematicWirePendingBatchData>();
/** The original settled comparison packet has one source-only worker successor.
 * Its values supply no MessageBus, worker or native event ownership. */
export function consumeCurrentSchematicWirePendingBatchData(input: CurrentSchematicWirePendingBatchData): Readonly<{ page: string; client: string; unique: string; values: Values }> {
  const retained = issued.get(input); need(retained !== undefined && input.stage === "settled" && !spent.has(input)); spent.add(input);
  return Object.freeze({ ...retained.identity, values: retained.values });
}

export class CurrentSchematicWirePendingBatchCursor {
  readonly #maximum: number; readonly #plan: Generator<Command, CurrentSchematicWirePendingBatchData, unknown>;
  #pending: Command | null = null; #reserved = false; #failed = false; #reads = 0; #result: CurrentSchematicWirePendingBatchData | null = null; readonly #packets: unknown[] = [];
  public constructor(input: CurrentSchematicWirePendingBatchInput) {
    const retained = Object.freeze({ ...input }); let first: First; let previous: Stored | null = null;
    if (retained.stage === "payload") { first = Object.freeze({ stage: "payload", frame: retained.frame, timerFrame: retained.timerFrame, ...consumeCurrentSchematicWireCmPublicationData(retained.previous) }); for (const value of [first.frame, first.timerFrame, first.holder, first.native]) { handle.parse(value); } }
    else { const old = issued.get(retained.previous); need(old !== undefined && !spent.has(retained.previous)); const prior = ({ publisherReturned: "payload", timerReturned: "publisherReturned", settled: "timerReturned" } as const)[retained.stage]; need(retained.previous.stage === prior); spent.add(retained.previous); previous = old; first = old.first; if (retained.stage !== "settled") { handle.parse(retained.frame); } }
    this.#maximum = { payload: LIMIT.payloadMaximum, publisherReturned: LIMIT.publishedMaximum, timerReturned: LIMIT.timerReturned, settled: LIMIT.settlementMaximum }[retained.stage]; this.#plan = CurrentSchematicWirePendingBatchCursor.collect(retained, first, previous); Object.freeze(this);
  }
  private static *collect(input: CurrentSchematicWirePendingBatchInput, first: First, previous: Stored | null): Generator<Command, CurrentSchematicWirePendingBatchData, unknown> {
    const { holder, native } = first; let snapshot: string; let promise: string; let values: Values; let identity = previous?.identity ?? null; let cleared = previous?.cleared ?? null; let timerFrame = previous?.timerFrame ?? null;
    if (input.stage === "payload") {
      const census = new Census(32); const rawFrame = tuple(yield frame("payload", input.frame), 2); const rawCells = yield* census.array(rawFrame, 2);
      const args = rawCells.get("1")?.value; need(args?.type === "object" && args.subtype === "array" && args.className === "Arguments" && args.description === "Arguments(2)"); yield* census.read(object(args, "object"));
      const captured = tuple(yield call("payload", rawFrame, [native]), 4); const cells = yield* census.array(captured, 4);
      yield* census.field(cells, "0"); const payload = yield* census.array(ref(cells, "3", "array"), 4); const cache = yield* census.field(payload, "0");
      const h = yield* census.array(holder, 2); const b = yield* census.field(h, "0"); const state = yield* census.field(h, "1");
      const page = yield* census.field(b, "page"); yield* census.field(b, "shapes"); const consistency = yield* census.field(b, "consistency"); const manager = yield* census.field(consistency, "manager"); const publisher = yield* census.field(manager, "_base"); yield* census.field(manager, "consistencyManager");
      for (const key of ["host", "metadata", "runner", "line", "group"]) { yield* census.field(b, key); }
      const before = yield* census.field(state, "before"); yield* census.field(before, "attribute"); yield* census.field(state, "after");
      const uuid = page.get("uuid")?.value; need(uuid?.type === "string" && typeof uuid.value === "string"); const cacheRow = yield* census.field(cache, uuid.value); const pend = yield* census.array(ref(cacheRow, "pend", "array"), 3);
      for (let i = 0; i < 3; i += 1) { yield* census.array(ref(pend, String(i), "array"), 4); }
      const timerCapture = tuple(yield frame("timerReturned", first.timerFrame), 2); const timerCells = yield* census.array(timerCapture, 2); const resolver = timerCells.get("1")?.value; need(resolver?.type === "function" && resolver.subtype === undefined && resolver.className === "Function" && resolver.description === "function () { [native code] }"); object(resolver, "function");
      const p = publisher.get("pendPromise")?.value; need(p?.type === "object" && p.subtype === "promise" && p.className === "Promise"); promise = object(p, "object"); need(promiseState(yield props(promise)) === "pending"); census.approved.push(promise);
      const refs = [...census.approved]; while (refs.length < LIMIT.approvedSlots) { refs.push(native); }
      const approved = tuple(yield call("approved", holder, [native, ...refs]), LIMIT.approvedSlots);
      snapshot = tuple(yield call("capture", captured, [native, holder, approved, first.cmSnapshot, timerCapture]), 13);
      const snapshotRows = array(yield props(snapshot), 13); const scalar = (index: string): string => { const value = snapshotRows.get(index); need(value?.type === "string" && typeof value.value === "string" && value.value.length > 0 && value.value.length <= 128); return value.value; }; identity = Object.freeze({ page: scalar("7"), unique: scalar("8"), client: scalar("9") }); const actual = snapshotRows.get("4"); need(actual?.type === "object" && actual.subtype === "promise" && actual.className === "Promise"); promise = object(actual, "object");
      values = valuesSchema.parse(yield call("values", snapshot, [native])).result.value;
      for (let i = 0; i < 3; i += 1) { const row = values[i]; const expected = first.expected[i]; need(row !== undefined && expected !== undefined && row[0] === expected.id && row[2] === expected.type && sameBody(row[3], expected.body)); }
    } else {
      need(previous !== null); snapshot = previous.snapshot; promise = previous.promise; values = previous.values;
      if (input.stage === "publisherReturned") {
        const captured = tuple(yield frame("publisherReturned", input.frame), 1); array(yield props(captured), 1);
        const next = tuple(yield call("afterRoot", captured, [native, holder, snapshot]), 1); const fields = array(yield props(next), 1); const cache = object(fields.get("0"), "object"); const census = new Census(32); yield* census.read(cache);
        cleared = tuple(yield call("published", next, [native, holder, snapshot]), 1); need(promiseState(yield props(promise)) === "pending");
      } else {
        need(cleared !== null);
        if (input.stage === "timerReturned") { const captured = tuple(yield frame("timerReturned", input.frame), 2); array(yield props(captured), 2); truth.parse(yield call("timerReturned", captured, [native, holder, snapshot, cleared])); timerFrame = captured; }
        else {
          yield* fulfilled(promise); need(timerFrame !== null); truth.parse(yield call("timerReturned", timerFrame, [native, holder, snapshot, cleared]));
        }
      }
    }
    const data: CurrentSchematicWirePendingBatchData = Object.freeze({ schema: "private.schematic-wire-pending-batch-comparison-data.v1", stage: input.stage, snapshot, values, originalThreeTuplePayloadCompared: true, sameTimerResolverCompared: input.stage === "timerReturned" || input.stage === "settled", originalArrayClearedCompared: input.stage !== "payload", samePromiseFulfilledCompared: input.stage === "settled", suppliedObservationsOnly: true, originalEventsJoined: false, workerPublicationJoined: false, lifecycleComplete: false, saveAuthorized: false });
    need(identity !== null); issued.set(data, Object.freeze({ identity, first, snapshot, promise, values, cleared, timerFrame })); return data;
  }
  public next(): Command | null { need(!this.#failed && !this.#reserved); if (this.#pending !== null) { return this.#pending; } if (this.#result !== null) { return null; } try { const step = this.#plan.next(); need(step.done !== true); this.#pending = step.value; return step.value; } catch (error) { this.#failed = true; throw error; } }
  public reserve(command: Command): void { need(!this.#failed && !this.#reserved && this.#pending !== null && command === this.#pending && this.#reads < this.#maximum); this.#reserved = true; this.#reads += 1; }
  public accept(command: Command, raw: unknown): void { need(!this.#failed && this.#reserved && this.#pending === command); try { const captured = capture(raw).value; this.#packets.push(captured); const step = this.#plan.next(captured); this.#pending = null; this.#reserved = false; if (step.done === true) { this.#result = step.value; } else { this.#pending = step.value; } } catch (error) { this.#failed = true; throw error; } }
  public requireCompleted(): CurrentSchematicWirePendingBatchData { need(!this.#failed && !this.#reserved && this.#pending === null && this.#result !== null); return this.#result; }
  public retainedReplies(): readonly unknown[] { need(this.#failed || this.#result !== null); return Object.freeze([...this.#packets]); }
  public fail(): void { this.#failed = true; }
}
