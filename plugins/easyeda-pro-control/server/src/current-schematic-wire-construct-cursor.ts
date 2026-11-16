/** Finite comparison of the original callback's Reflect.construct binding.
 * Only the original event owner may issue requests or authorize continuation. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply as capture } from "./current-pcb-string-clock-reply.ts";
import { decodeCurrentFootprintCopyClockRpcV2Array as array, decodeCurrentFootprintCopyClockRpcV2ArrayCapture as tuple } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import { decodeCurrentNativeFunctionMetadata } from "./current-native-function-metadata.ts";
import { currentSchematicRelevanceRawHandle as object, currentSchematicRelevanceRawProperties as properties } from "./current-schematic-relevance-action-raw-replies.ts";
import { CURRENT_SCHEMATIC_WIRE_CONSTRUCT_FLAGS as FLAGS, CURRENT_SCHEMATIC_WIRE_CONSTRUCT_FRAME as FRAME, CURRENT_SCHEMATIC_WIRE_CONSTRUCT_REQUESTS as LIMIT, CURRENT_SCHEMATIC_WIRE_CONSTRUCT_SAME as SAME, validateCurrentSchematicWireConstructCommand as validate } from "./current-schematic-wire-construct-protocol.ts";
import type { CurrentSchematicWireConstructCommand as Command } from "./current-schematic-wire-construct-protocol.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const truth = z.strictObject({ result: z.strictObject({ type: z.literal("boolean"), value: z.literal(true) }) });
function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_WIRE_CONSTRUCT_CURSOR"); } }
export interface CurrentSchematicWireConstructData {
  readonly schema: "private.schematic-wire-native-construct-data.v1"; readonly reflect: string; readonly construct: string; readonly nativeConstructCompared: true;
  readonly suppliedObservationsOnly: true; readonly originalConstructorInvoked: false; readonly executionAuthorized: false; readonly saveAuthorized: false;
}
function props(objectId: string): Command { return validate({ phase: "wire-construct-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }); }
export class CurrentSchematicWireConstructCursor {
  readonly #plan: Generator<Command, CurrentSchematicWireConstructData, unknown>; readonly #maximum: number;
  #pending: Command | null = null; #reserved = false; #failed = false; #reads = 0; #result: CurrentSchematicWireConstructData | null = null; readonly #packets: unknown[] = [];
  /** Select only a current original callback frame and previously qualified
   * native19 tuple. Previous data selects a mandatory second-call recheck. */
  public constructor(frame: string, native: string, previous?: CurrentSchematicWireConstructData) {
    handle.parse(frame); handle.parse(native);
    if (previous !== undefined) { handle.parse(previous.reflect); handle.parse(previous.construct); }
    this.#maximum = previous === undefined ? LIMIT.initial : LIMIT.recheck;
    this.#plan = CurrentSchematicWireConstructCursor.collect(frame, native, previous); Object.freeze(this);
  }
  private static *collect(frame: string, native: string, previous: CurrentSchematicWireConstructData | undefined): Generator<Command, CurrentSchematicWireConstructData, unknown> {
    const selected = tuple(yield validate({ phase: "wire-construct-frame", method: "Debugger.evaluateOnCallFrame", params: { ...FLAGS, callFrameId: frame, expression: FRAME, returnByValue: false, includeCommandLineAPI: false } }), 1);
    const fields = array(yield props(selected), 1);
    const candidate = object(fields.get("0"), "object");
    let reflect: string; let construct: string;
    if (previous === undefined) {
      const rows = properties(yield props(candidate)); const descriptor = rows.get("construct"); const remote = descriptor?.value;
      need(descriptor !== undefined && remote !== undefined && descriptor.get === undefined && descriptor.set === undefined && descriptor.writable === true && !descriptor.enumerable && descriptor.configurable && remote.type === "function" && remote.className === "Function" && remote.subtype === undefined && remote.description === "function construct() { [native code] }");
      construct = object(remote, "function"); reflect = candidate;
      decodeCurrentNativeFunctionMetadata(yield props(construct), { name: "construct", arity: 2, constructor: false });
    } else { reflect = previous.reflect; construct = previous.construct; }
    truth.parse(yield validate({ phase: "wire-construct-same", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: selected, functionDeclaration: SAME, arguments: [native, reflect, construct].map(objectId => ({ objectId })), returnByValue: true, awaitPromise: false, userGesture: false } }));
    return Object.freeze({ schema: "private.schematic-wire-native-construct-data.v1", reflect, construct, nativeConstructCompared: true, suppliedObservationsOnly: true, originalConstructorInvoked: false, executionAuthorized: false, saveAuthorized: false });
  }
  /** Retain the next command identity until it is reserved and answered. */
  public next(): Command | null {
    need(!this.#failed && !this.#reserved); if (this.#pending !== null) { return this.#pending; } if (this.#result !== null) { return null; }
    try { const row = this.#plan.next(); need(row.done !== true); this.#pending = row.value; return row.value; } catch (error) { this.#failed = true; throw error; }
  }
  /** Consume one exact command before the owner writes its request. */
  public reserve(command: Command): void { need(!this.#failed && !this.#reserved && this.#pending !== null && command === this.#pending && this.#reads < this.#maximum); this.#reserved = true; this.#reads += 1; }
  /** One malformed reply permanently consumes this same reader. */
  public accept(command: Command, raw: unknown): void {
    need(!this.#failed && this.#reserved && this.#pending !== null && command === this.#pending);
    try { const value = capture(raw).value; this.#packets.push(value); const row = this.#plan.next(value); this.#pending = null; this.#reserved = false; if (row.done === true) { this.#result = row.value; } else { this.#pending = row.value; } }
    catch (error) { this.#failed = true; throw error; }
  }
  /** Return supplied comparison data with no original invocation claim. */
  public requireCompleted(): CurrentSchematicWireConstructData { need(!this.#failed && !this.#reserved && this.#pending === null && this.#result !== null); return this.#result; }
  /** Keep all exact supplied replies for the retaining original owner. */
  public retainedReplies(): readonly unknown[] { need(this.#result !== null && !this.#failed); return Object.freeze([...this.#packets]); }
  /** Original owner failure is terminal for this reader. */
  public fail(): void { this.#failed = true; }
}
