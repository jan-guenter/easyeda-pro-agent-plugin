/** Exact three-step CM/source-caller comparison. No data packet is an event
 * origin; only its own locally issued successor can extend the sequence. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply as capture } from "./current-pcb-string-clock-reply.ts";
import { decodeCurrentFootprintCopyClockRpcV2Array as array, decodeCurrentFootprintCopyClockRpcV2ArrayCapture as tuple } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import { currentSchematicRelevanceRawHandle as object } from "./current-schematic-relevance-action-raw-replies.ts";
import { decodeCurrentSchematicWireAsyncPromise as promiseState } from "./current-schematic-wire-async-replies.ts";
import { CurrentSchematicWireCmPublicationCensus as Census, wireCmPublicationRef as ref } from "./current-schematic-wire-cm-publication-census.ts";
import { currentSchematicWirePublicationExpectedSchema as expectedSchema, sameCurrentSchematicWirePublicationBody as sameBody, currentSchematicWirePublicationValueSchema as valueSchema } from "./current-schematic-wire-publication-values.ts";
import type { CurrentSchematicWirePublicationExpected as Expected, CurrentSchematicWirePublicationValue as Value } from "./current-schematic-wire-publication-values.ts";
import { CURRENT_SCHEMATIC_WIRE_CM_PUBLICATION_CALLS as CALLS, CURRENT_SCHEMATIC_WIRE_CM_PUBLICATION_FLAGS as FLAGS, CURRENT_SCHEMATIC_WIRE_CM_PUBLICATION_REQUESTS as LIMIT, validateCurrentSchematicWireCmPublicationCommand as validate } from "./current-schematic-wire-cm-publication-protocol.ts";
import { CURRENT_SCHEMATIC_WIRE_CM_PUBLICATION_FRAMES as FRAMES } from "./current-schematic-wire-cm-publication-programs.ts";
import type { CurrentSchematicWireCmPublicationCommand as Command } from "./current-schematic-wire-cm-publication-protocol.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
function need(condition: boolean): asserts condition { if (!condition) { throw new Error("SCHEMATIC_WIRE_CM_PUBLICATION_CURSOR"); } }
function props(objectId: string): Command { return validate({ phase: "wire-cm-publication-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }); }
function call(role: keyof typeof CALLS, receiver: string, refs: readonly string[]): Command { const row = CALLS[role]; need(refs.length === row.refs); return validate({ phase: "wire-cm-publication-call", role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: receiver, functionDeclaration: row.program, arguments: refs.map(objectId => ({ objectId })), returnByValue: row.byValue, awaitPromise: false, userGesture: false } }); }
function frame(role: keyof typeof FRAMES, callFrameId: string): Command { return validate({ phase: "wire-cm-publication-frame", role, method: "Debugger.evaluateOnCallFrame", params: { ...FLAGS, callFrameId, expression: FRAMES[role], returnByValue: false, includeCommandLineAPI: false } }); }
type First = Readonly<{ ordinal: 1; frame: string; publisherFrame: string; holder: string; native: string; expected: Expected }>;
export type CurrentSchematicWireCmPublicationInput = First | Readonly<{ ordinal: 2 | 3; frame: string; publisherFrame: string; previous: CurrentSchematicWireCmPublicationData }>;
export interface CurrentSchematicWireCmPublicationData {
  readonly schema: "private.schematic-wire-cm-publication-comparison-data.v1"; readonly ordinal: 1 | 2 | 3; readonly snapshot: string; readonly values: readonly Value[];
  readonly exactOriginalPublisherCallerCompared: true; readonly originalThreeCmFramesCompared: boolean; readonly suppliedObservationsOnly: true;
  readonly originalEventsJoined: false; readonly workerPublicationJoined: false; readonly saveAuthorized: false;
}
interface Stored { readonly first: First; readonly snapshot: string; readonly values: readonly Value[] }
const issued = new WeakMap<CurrentSchematicWireCmPublicationData, Stored>(); const spent = new WeakSet<CurrentSchematicWireCmPublicationData>();
/** A complete three-event data sequence binds the sole batch successor. */
export function consumeCurrentSchematicWireCmPublicationData(input: CurrentSchematicWireCmPublicationData): Readonly<{ holder: string; native: string; expected: Expected; cmSnapshot: string; values: readonly Value[] }> {
  const original = issued.get(input); need(original !== undefined && input.ordinal === 3 && !spent.has(input)); spent.add(input); return Object.freeze({ holder: original.first.holder, native: original.first.native, expected: original.first.expected, cmSnapshot: original.snapshot, values: original.values });
}
export class CurrentSchematicWireCmPublicationCursor {
  readonly #plan: Generator<Command, CurrentSchematicWireCmPublicationData, unknown>; readonly #maximum: number; #pending: Command | null = null; #reserved = false; #failed = false; #reads = 0; #result: CurrentSchematicWireCmPublicationData | null = null; readonly #packets: unknown[] = [];
  public constructor(input: CurrentSchematicWireCmPublicationInput) {
    const retained = Object.freeze({ ...input }); handle.parse(retained.frame); handle.parse(retained.publisherFrame); let first: First; let previous: Stored | null = null;
    if (retained.ordinal === 1) { first = Object.freeze({ ...retained, expected: expectedSchema.parse(retained.expected) }); handle.parse(first.holder); handle.parse(first.native); }
    else { const old = issued.get(retained.previous); need(old !== undefined && !spent.has(retained.previous) && retained.previous.ordinal + 1 === retained.ordinal); spent.add(retained.previous); previous = old; first = old.first; }
    this.#maximum = [LIMIT.firstMaximum, LIMIT.secondMaximum, LIMIT.thirdMaximum][retained.ordinal - 1] ?? 0; this.#plan = CurrentSchematicWireCmPublicationCursor.collect(retained, first, previous); Object.freeze(this);
  }
  private static *collect(input: CurrentSchematicWireCmPublicationInput, first: First, previous: Stored | null): Generator<Command, CurrentSchematicWireCmPublicationData, unknown> {
    const { holder, native } = first; const census = new Census(32); const captured = tuple(yield frame("cm", input.frame), 14); yield* census.array(captured, 14);
    const caller = tuple(yield frame("publisher", input.publisherFrame), 7); yield* census.array(caller, 7);
    const h = yield* census.array(holder, 2); const b = yield* census.field(h, "0"); const state = yield* census.field(h, "1"); const page = yield* census.field(b, "page");
    yield* census.field(b, "shapes"); const consistency = yield* census.field(b, "consistency"); const manager = yield* census.field(consistency, "manager"); const publisher = yield* census.field(manager, "_base"); const cm = yield* census.field(manager, "consistencyManager");
    for (const key of ["host", "metadata", "line", "group"]) { yield* census.field(b, key); }
    const runner = yield* census.field(b, "runner"); yield* census.field(runner, "_currentAction"); const before = yield* census.field(state, "before"); yield* census.field(before, "attribute");
    const local = yield* census.field(cm, "tempLocalIds"); const uuid = page.get("uuid")?.value; need(uuid?.type === "string" && typeof uuid.value === "string"); const doc = yield* census.field(local, uuid.value);
    const ids = [first.expected[0].id, first.expected[1].id, first.expected[2].id];
    for (let i = 0; i < input.ordinal; i += 1) { const id = ids[i]; need(id !== undefined); yield* census.array(ref(doc, id, "array"), 2); }
    if (input.ordinal > 1) { const p = publisher.get("pendPromise")?.value; need(p?.type === "object" && p.subtype === "promise" && p.className === "Promise"); const promise = object(p, "object"); need(promiseState(yield props(promise)) === "pending"); census.approved.push(promise); }
    const refs = [...census.approved]; while (refs.length < LIMIT.approvedSlots) { refs.push(native); } const approved = tuple(yield call("approved", holder, [native, ...refs]), LIMIT.approvedSlots);
    const role = ({ 1: "cm1", 2: "cm2", 3: "cm3" } as const)[input.ordinal]; const snapshot = tuple(yield call(role, captured, [native, holder, approved, caller, previous?.snapshot ?? holder]), 4); array(yield props(snapshot), 4);
    const schema = z.strictObject({ result: z.strictObject({ type: z.literal("object"), value: z.array(valueSchema).length(input.ordinal).readonly() }) }); const values = schema.parse(yield call("values", snapshot, [native])).result.value;
    for (let i = 0; i < input.ordinal; i += 1) { const row = values[i]; const expected = first.expected[i]; need(row !== undefined && expected !== undefined && row[0] === expected.id && row[2] === expected.type && sameBody(row[3], expected.body)); }
    const data: CurrentSchematicWireCmPublicationData = Object.freeze({ schema: "private.schematic-wire-cm-publication-comparison-data.v1", ordinal: input.ordinal, snapshot, values, exactOriginalPublisherCallerCompared: true, originalThreeCmFramesCompared: input.ordinal === 3, suppliedObservationsOnly: true, originalEventsJoined: false, workerPublicationJoined: false, saveAuthorized: false }); issued.set(data, Object.freeze({ first, snapshot, values })); return data;
  }
  public next(): Command | null { need(!this.#failed && !this.#reserved); if (this.#pending !== null) { return this.#pending; } if (this.#result !== null) { return null; } try { const step = this.#plan.next(); need(step.done !== true); this.#pending = step.value; return step.value; } catch (error) { this.#failed = true; throw error; } }
  public reserve(command: Command): void { need(!this.#failed && !this.#reserved && this.#pending !== null && command === this.#pending && this.#reads < this.#maximum); this.#reserved = true; this.#reads += 1; }
  public accept(command: Command, raw: unknown): void { need(!this.#failed && this.#reserved && this.#pending === command); try { const captured = capture(raw).value; this.#packets.push(captured); const step = this.#plan.next(captured); this.#pending = null; this.#reserved = false; if (step.done === true) { this.#result = step.value; } else { this.#pending = step.value; } } catch (error) { this.#failed = true; throw error; } }
  public requireCompleted(): CurrentSchematicWireCmPublicationData { need(!this.#failed && !this.#reserved && this.#pending === null && this.#result !== null); return this.#result; }
  public retainedReplies(): readonly unknown[] { need(this.#failed || this.#result !== null); return Object.freeze([...this.#packets]); }
  public fail(): void { this.#failed = true; }
}
