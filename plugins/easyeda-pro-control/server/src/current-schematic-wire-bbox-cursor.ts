/** Retain two original bbox callback Promises through their actual block
 * returns and fulfillment. Supplied packets grant no callback or bbox custody. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply as capture } from "./current-pcb-string-clock-reply.ts";
import { decodeCurrentFootprintCopyClockRpcV2Array as array, decodeCurrentFootprintCopyClockRpcV2ArrayCapture as tuple } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import { currentSchematicRelevanceRawArrayLength as arrayLength, currentSchematicRelevanceRawHandle as object, currentSchematicRelevanceRawProperties as properties } from "./current-schematic-relevance-action-raw-replies.ts";
import type { CurrentSchematicRelevanceRawRemote as Remote } from "./current-schematic-relevance-action-raw-replies.ts";
import { decodeCurrentSchematicWireAsyncPromise as promiseState } from "./current-schematic-wire-async-replies.ts";
import { CURRENT_SCHEMATIC_WIRE_BBOX_CALLS as CALLS, CURRENT_SCHEMATIC_WIRE_BBOX_FLAGS as FLAGS, CURRENT_SCHEMATIC_WIRE_BBOX_REQUESTS as LIMIT, validateCurrentSchematicWireBboxCommand as validate } from "./current-schematic-wire-bbox-protocol.ts";
import type { CurrentSchematicWireBboxCommand as Command } from "./current-schematic-wire-bbox-protocol.ts";
import { CURRENT_SCHEMATIC_WIRE_BBOX_FRAME as FRAME } from "./current-schematic-wire-bbox-programs.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const truth = z.strictObject({ result: z.strictObject({ type: z.literal("boolean"), value: z.literal(true) }) });
const ordinaryInternal = z.strictObject({ name: z.literal("[[Prototype]]"), value: z.unknown() });
const ordinaryPacket = z.strictObject({ result: z.array(z.unknown()).max(256), internalProperties: z.array(ordinaryInternal).length(1) });
function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_WIRE_BBOX_CURSOR"); } }
type First = Readonly<{ role: "entry"; tick: 1; frame: string; holder: string; native: string; action: string }>;
type Second = Readonly<{ role: "entry"; tick: 2; frame: string; previous: CurrentSchematicWireBboxData }>;
export type CurrentSchematicWireBboxInput = First | Second | Readonly<{ role: "returned"; frame: string; previous: CurrentSchematicWireBboxData }> | Readonly<{ role: "settled"; previous: CurrentSchematicWireBboxData }>;
export interface CurrentSchematicWireBboxData {
  readonly schema: "private.schematic-wire-bbox-comparison-data.v1"; readonly role: CurrentSchematicWireBboxInput["role"]; readonly tick: 1 | 2;
  readonly snapshot: string; readonly promise: string; readonly pendingCollectionsPreservedAndAsyncMapClearedCompared: boolean;
  readonly samePromiseFulfilledCompared: boolean; readonly twoTickSequenceCompared: boolean; readonly suppliedObservationsOnly: true;
  readonly originalHeldEventJoined: false; readonly rTreeComplete: false; readonly derivedMarkersComplete: false; readonly bboxComplete: false;
  readonly mutationAuthorized: false; readonly saveAuthorized: false;
}
interface Stored { readonly input: First; readonly tick: 1 | 2; readonly snapshot: string; readonly promise: string }
const issued = new WeakMap<CurrentSchematicWireBboxData, Stored>(); const successors = new WeakSet<CurrentSchematicWireBboxData>();
function props(objectId: string): Command { return validate({ phase: "wire-bbox-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }); }
function call(role: keyof typeof CALLS, receiver: string, refs: readonly string[]): Command {
  const row = CALLS[role]; need(refs.length === row.refs);
  return validate({ phase: "wire-bbox-call", role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: receiver, functionDeclaration: row.program, arguments: refs.map(objectId => ({ objectId })), returnByValue: row.byValue, awaitPromise: false, userGesture: false } });
}
function frame(callFrameId: string): Command { return validate({ phase: "wire-bbox-frame", method: "Debugger.evaluateOnCallFrame", params: { ...FLAGS, callFrameId, expression: FRAME, returnByValue: false, includeCommandLineAPI: false } }); }
function ordinary(input: unknown): ReturnType<typeof properties> { ordinaryPacket.parse(input); return properties(input); }
function field(rows: ReturnType<typeof properties>, name: string): Remote {
  const row = rows.get(name); need(row?.value !== undefined && row.get === undefined && row.set === undefined); return row.value;
}
function bbox(input: unknown, pending: boolean): void {
  const rows = ordinary(input);
  for (const [name, subtype, className] of [["_modelsShouldUpdateBBox", "map", "Map"], ["_modelTypesShouldUpdateBBox", "set", "Set"], ["_modelMapForOnBBoxChangeAsync", "map", "Map"]] as const) { const value = field(rows, name); need(value.type === "object" && value.subtype === subtype && value.className === className); object(value, "object"); }
  const value = field(rows, "_nextTickPromise");
  if (pending) { need(value.type === "object" && value.subtype === "promise" && value.className === "Promise"); }
  else { need(value.type === "object" && value.subtype === "null" && value.value === null && value.objectId === undefined); }

}
export class CurrentSchematicWireBboxCursor {
  readonly #plan: Generator<Command, CurrentSchematicWireBboxData, unknown>; readonly #maximum: number;
  #pending: Command | null = null; #reserved = false; #failed = false; #reads = 0; #result: CurrentSchematicWireBboxData | null = null; readonly #packets: unknown[] = [];
  /** Original Core must supply the held callback entry or return. Only one
   * exact issued packet binds its successor, including a consumed failure. */
  public constructor(input: CurrentSchematicWireBboxInput) {
    const retained = Object.freeze({ ...input }); let first: First; let prior: Stored | null = null;
    if (retained.role === "entry" && retained.tick === 1) { first = retained; for (const id of [first.frame, first.holder, first.native, first.action]) { handle.parse(id); } }
    else {
      const stored = issued.get(retained.previous); need(stored !== undefined && !successors.has(retained.previous));
      const expected = ({ entry: "settled", returned: "entry", settled: "returned" } as const)[retained.role];
      need(retained.previous.role === expected && (retained.role !== "entry" || stored.tick === 1)); successors.add(retained.previous); prior = stored; first = stored.input;
      if (retained.role !== "settled") { handle.parse(retained.frame); }
    }
    const maximum = { entry: LIMIT.entryMaximum, returned: LIMIT.returned, settled: LIMIT.settlementMaximum } as const;
    this.#maximum = maximum[retained.role]; this.#plan = CurrentSchematicWireBboxCursor.collect(retained, first, prior); Object.freeze(this);
  }
  private static *collect(input: CurrentSchematicWireBboxInput, original: First, prior: Stored | null): Generator<Command, CurrentSchematicWireBboxData, unknown> {
    const { native, holder, action } = original; const tick = input.role === "entry" ? input.tick : prior?.tick; need(tick === 1 || tick === 2); let snapshot: string; let promise: string;
    if (input.role === "entry") {
      const captured = tuple(yield frame(input.frame), 1); const cells = array(yield props(captured), 1); const receiver = object(cells.get("0"), "object"); bbox(yield props(receiver), true); ordinary(yield props(action));
      snapshot = tuple(yield call(tick === 1 ? "running" : "idle", captured, [native, holder, action, prior?.snapshot ?? holder]), 22);
      const rows = array(yield props(snapshot), 22); const pending = rows.get("11"); need(pending?.type === "object" && pending.subtype === "promise" && pending.className === "Promise" && pending.description === "Promise"); promise = object(pending, "object"); object(rows.get("12"), "object");
      need(promiseState(yield props(promise)) === "pending");
      for (const index of [16, 17, 18]) {
        const id = object(rows.get(String(index)), "object"); const raw: unknown = yield props(id); const length = arrayLength(raw, 0, LIMIT.collectionLimit); const entries = array(raw, length);
        for (let item = 0; item < length; item += 1) {
          const value = entries.get(String(item)); need(value !== undefined);
          if (index === 17) { need(value.type === "string" && typeof value.value === "string" && value.value.length > 0 && value.value.length <= 128); }
          else { const pair = object(value, "object"); const slots = array(yield props(pair), 2); object(slots.get("0"), "object"); const flag = slots.get("1"); need(flag?.type === "number" && (flag.value === 0 || flag.value === 1) && !Object.is(flag.value, -0)); }
        }
      }
    } else {
      need(prior !== null); snapshot = prior.snapshot; promise = prior.promise;
      if (input.role === "returned") {
        const captured = tuple(yield frame(input.frame), 1); const cells = array(yield props(captured), 1); const receiver = object(cells.get("0"), "object"); bbox(yield props(receiver), false);
        truth.parse(yield call("returned", captured, [native, holder, snapshot]));
      } else {
        let fulfilled = false;
        for (let index = 1; index < LIMIT.promisePollsMaximum; index += 1) { if (promiseState(yield props(promise)) === "fulfilled") { fulfilled = true; break; } }
        need(fulfilled); truth.parse(yield call("settled", holder, [native, holder, snapshot]));
      }
    }
    const data: CurrentSchematicWireBboxData = Object.freeze({ schema: "private.schematic-wire-bbox-comparison-data.v1", role: input.role, tick, snapshot, promise, pendingCollectionsPreservedAndAsyncMapClearedCompared: input.role !== "entry", samePromiseFulfilledCompared: input.role === "settled", twoTickSequenceCompared: tick === 2 && input.role === "settled", suppliedObservationsOnly: true, originalHeldEventJoined: false, rTreeComplete: false, derivedMarkersComplete: false, bboxComplete: false, mutationAuthorized: false, saveAuthorized: false });
    if (!(tick === 2 && input.role === "settled")) { issued.set(data, Object.freeze({ input: original, tick, snapshot, promise })); } return data;
  }
  /** Retain the pending command until its exact reservation. */
  public next(): Command | null {
    need(!this.#failed && !this.#reserved); if (this.#pending !== null) { return this.#pending; } if (this.#result !== null) { return null; }
    try { const step = this.#plan.next(); need(step.done !== true); this.#pending = step.value; return step.value; } catch (error) { this.#failed = true; throw error; }
  }
  /** Reserve before writing and keep every failed attempt consumed. */
  public reserve(command: Command): void { need(!this.#failed && !this.#reserved && this.#pending !== null && command === this.#pending && this.#reads < this.#maximum); this.#reserved = true; this.#reads += 1; }
  /** Retain the exact supplied packet before advancing its bounded plan. */
  public accept(command: Command, raw: unknown): void {
    need(!this.#failed && this.#reserved && this.#pending === command);
    try { const value = capture(raw).value; this.#packets.push(raw); const step = this.#plan.next(value); this.#pending = null; this.#reserved = false; if (step.done === true) { this.#result = step.value; } else { this.#pending = step.value; } } catch (error) { this.#failed = true; throw error; }
  }
  /** Fulfillment comparisons remain separate from original bbox completion. */
  public requireCompleted(): CurrentSchematicWireBboxData { need(!this.#failed && !this.#reserved && this.#pending === null && this.#result !== null); return this.#result; }
  /** Preserve supplied original replies without issuing native provenance. */
  public retainedReplies(): readonly unknown[] { need(!this.#failed && this.#result !== null); return Object.freeze([...this.#packets]); }
  /** Original owner failure closes the reader permanently. */
  public fail(): void { this.#failed = true; }
}
