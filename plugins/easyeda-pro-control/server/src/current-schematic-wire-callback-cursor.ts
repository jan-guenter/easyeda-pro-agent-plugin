/** Finite original callback comparison plan. These supplied observations
 * grant no event ownership, continuation, constructor, setter or Save authority. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply as capture } from "./current-pcb-string-clock-reply.ts";
import { decodeCurrentFootprintCopyClockRpcV2Array as array, decodeCurrentFootprintCopyClockRpcV2ArrayCapture as tuple } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import { currentSchematicRelevanceRawHandle as object, currentSchematicRelevanceRawProperties as properties } from "./current-schematic-relevance-action-raw-replies.ts";
import { CURRENT_SCHEMATIC_WIRE_CALLBACK_REQUESTS as LIMIT, CURRENT_SCHEMATIC_WIRE_CALLBACK_VALUES as VALUES, validateCurrentSchematicWireCallbackCommand as validate } from "./current-schematic-wire-callback-protocol.ts";
import type { CurrentSchematicWireCallbackCommand as Command } from "./current-schematic-wire-callback-protocol.ts";
import { CURRENT_SCHEMATIC_WIRE_WRITER_CALLBACK_CALLS as CALLS, CURRENT_SCHEMATIC_WIRE_WRITER_FLAGS as FLAGS } from "./current-schematic-wire-writer-protocol.ts";
import { CURRENT_SCHEMATIC_WIRE_WRITER_FRAME_EXPRESSIONS as FRAMES } from "./current-schematic-wire-writer-programs.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const truth = z.strictObject({ result: z.strictObject({ type: z.literal("boolean"), value: z.literal(true) }) });
function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_WIRE_CALLBACK_CURSOR"); } }
type Base = Readonly<{ frame: string; holder: string; native: string; qualified: string }>;
export type CurrentSchematicWireCallbackInput =
  Readonly<{ role: "values"; holder: string; values: readonly string[] }> |
  Base & Readonly<{ role: "entry" }> |
  Base & Readonly<{ role: "point-before" | "point-after"; previous: string }> |
  Base & Readonly<{ role: "setter-before"; first: string; second: string }>;
const frameInput = {frame: handle, holder: handle, native: handle, qualified: handle};
const cursorInput = z.discriminatedUnion("role", [
  z.strictObject({role: z.literal("values"), holder: handle, values: z.array(handle).length(8).readonly()}),
  z.strictObject({...frameInput, role: z.literal("entry")}),
  z.strictObject({...frameInput, role: z.literal("point-before"), previous: handle}),
  z.strictObject({...frameInput, role: z.literal("point-after"), previous: handle}),
  z.strictObject({...frameInput, role: z.literal("setter-before"), first: handle, second: handle}),
]).readonly();
export interface CurrentSchematicWireCallbackData {
  readonly schema: "private.schematic-wire-callback-comparison-data.v1"; readonly role: CurrentSchematicWireCallbackInput["role"];
  readonly frame: string | null; readonly tuple: string | null; readonly compared: true; readonly suppliedObservationsOnly: true;
  readonly originalHeldEventJoined: false; readonly continuationAuthorized: false; readonly mutationAuthorized: false; readonly saveAuthorized: false;
}
function props(objectId: string): Command { return validate({ phase: "wire-raw-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }); }
export class CurrentSchematicWireCallbackCursor {
  readonly #plan: Generator<Command, CurrentSchematicWireCallbackData, unknown>; readonly #maximum: number;
  #pending: Command | null = null; #reserved = false; #failed = false; #reads = 0; #result: CurrentSchematicWireCallbackData | null = null; readonly #packets: unknown[] = [];
  /** Exact original selectors come from Core's retaining owner; construction
   * itself supplies neither that custody nor an actual held marker. */
  public constructor(input: CurrentSchematicWireCallbackInput) {
    const retained = cursorInput.parse(capture(input).value);
    handle.parse(retained.holder);
    if (retained.role === "values") { need(retained.values.length === 8); for (const value of retained.values) { handle.parse(value); } }
    else {
      handle.parse(retained.frame); handle.parse(retained.native); handle.parse(retained.qualified);
      if (retained.role === "point-before" || retained.role === "point-after") { handle.parse(retained.previous); }
      else if (retained.role === "setter-before") { handle.parse(retained.first); handle.parse(retained.second); }
    }
    const maximum = { values: LIMIT.values, entry: LIMIT.entry, "point-before": LIMIT.before, "point-after": LIMIT.after, "setter-before": LIMIT.setter } as const;
    this.#maximum = maximum[retained.role]; this.#plan = CurrentSchematicWireCallbackCursor.collect(retained); Object.freeze(this);
  }
  private static *collect(input: CurrentSchematicWireCallbackInput): Generator<Command, CurrentSchematicWireCallbackData, unknown> {
    let frame: string | null = null; let result: string | null = null;
    if (input.role === "values") {
      result = tuple(yield validate({ phase: "wire-callback-values", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: input.holder, functionDeclaration: VALUES, arguments: input.values.map(objectId => ({ objectId })), returnByValue: false, awaitPromise: false, userGesture: false } }), 8);
      const cells = array(yield props(result), 8);
      for (let i = 0; i < 8; i += 1) { object(cells.get(String(i)), i === 0 || i === 1 || i === 4 || i === 5 || i === 7 ? "function" : "object"); }
    } else {
      const length = { entry: 2, "point-before": 4, "point-after": 5, "setter-before": 2 } as const;
      frame = tuple(yield validate({ phase: `wire-callback-${input.role}`, method: "Debugger.evaluateOnCallFrame", params: { ...FLAGS, callFrameId: input.frame, expression: FRAMES[input.role], returnByValue: false, includeCommandLineAPI: false } }), length[input.role]);
      const fields = array(yield props(frame), length[input.role]);
      const indexes = { entry: [0], "point-before": [0, 2, 3], "point-after": [0, 2, 3, 4], "setter-before": [0, 1] } as const;
      for (const index of indexes[input.role]) { const id = object(fields.get(String(index)), "object"); const packet: unknown = yield props(id); properties(packet); }
      let refs: readonly string[] = [input.native, input.holder, input.qualified];
      if (input.role === "point-before" || input.role === "point-after") { refs = [...refs, input.previous]; }
      else if (input.role === "setter-before") { refs = [...refs, input.first, input.second]; }
      const phase = `wire-callback-${input.role}-proof`;
      const row = CALLS.find(call => call[0] === phase); need(row !== undefined && row[2] === refs.length);
      const raw: unknown = yield validate({ phase, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: frame, functionDeclaration: row[1], arguments: refs.map(objectId => ({ objectId })), returnByValue: row[3], awaitPromise: false, userGesture: false } });
      if (row[3]) { truth.parse(raw); }
      else {
        const count = input.role === "entry" ? 13 : 1; result = tuple(raw, count);
        const cells = array(yield props(result), count); for (let i = 0; i < count; i += 1) { object(cells.get(String(i)), "object"); }
      }
    }
    return Object.freeze({ schema: "private.schematic-wire-callback-comparison-data.v1", role: input.role, frame, tuple: result, compared: true, suppliedObservationsOnly: true, originalHeldEventJoined: false, continuationAuthorized: false, mutationAuthorized: false, saveAuthorized: false });
  }
  /** Return the same original pending command until its owner reserves it. */
  public next(): Command | null {
    need(!this.#failed && !this.#reserved); if (this.#pending !== null) { return this.#pending; } if (this.#result !== null) { return null; }
    try { const row = this.#plan.next(); need(row.done !== true); this.#pending = row.value; return row.value; } catch (error) { this.#failed = true; throw error; }
  }
  /** Reserve only the exact pending command, before the owner writes it. */
  public reserve(command: Command): void { need(!this.#failed && !this.#reserved && this.#pending !== null && command === this.#pending && this.#reads < this.#maximum); this.#reserved = true; this.#reads += 1; }
  /** A rejected reply retains the consumed attempt and permanently fails. */
  public accept(command: Command, raw: unknown): void {
    need(!this.#failed && this.#reserved && this.#pending !== null && command === this.#pending);
    try { const value = capture(raw).value; this.#packets.push(value); const row = this.#plan.next(value); this.#pending = null; this.#reserved = false; if (row.done === true) { this.#result = row.value; } else { this.#pending = row.value; } } catch (error) { this.#failed = true; throw error; }
  }
  /** Complete data cannot substitute for the retaining original event owner. */
  public requireCompleted(): CurrentSchematicWireCallbackData { need(!this.#failed && !this.#reserved && this.#pending === null && this.#result !== null); return this.#result; }
  /** Preserve exact replies for the original owner, without reconstructing it. */
  public retainedReplies(): readonly unknown[] { need(this.#result !== null && !this.#failed); return Object.freeze([...this.#packets]); }
  /** Original owner failure permanently consumes this reader. */
  public fail(): void { this.#failed = true; }
}
