/** Bounded GROUP old/new history reader. A retained comparison result binds
 * only this reader's successor; it never issues an original event or resume. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply as capture } from "./current-pcb-string-clock-reply.ts";
import { decodeCurrentFootprintCopyClockRpcV2Array as array, decodeCurrentFootprintCopyClockRpcV2ArrayCapture as tuple } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import { currentSchematicRelevanceRawHandle as object, currentSchematicRelevanceRawProperties as properties } from "./current-schematic-relevance-action-raw-replies.ts";
import type { CurrentSchematicRelevanceRawProperty as Property } from "./current-schematic-relevance-action-raw-replies.ts";
import { decodeCurrentSchematicWireTransitionFunction as groupFunction } from "./current-schematic-wire-transition-source.ts";
import { decodeCurrentSchematicWireGroupHistoryFunction as publicationFunction } from "./current-schematic-wire-group-history-source.ts";
import { CURRENT_SCHEMATIC_WIRE_GROUP_HISTORY_CALLS as CALLS, CURRENT_SCHEMATIC_WIRE_GROUP_HISTORY_FLAGS as FLAGS, CURRENT_SCHEMATIC_WIRE_GROUP_HISTORY_REQUESTS as LIMIT, validateCurrentSchematicWireGroupHistoryCommand as validate } from "./current-schematic-wire-group-history-protocol.ts";
import type { CurrentSchematicWireGroupHistoryCommand as Command } from "./current-schematic-wire-group-history-protocol.ts";
import { CURRENT_SCHEMATIC_WIRE_GROUP_HISTORY_FRAMES as FRAMES } from "./current-schematic-wire-group-history-programs.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const truth = z.strictObject({ result: z.strictObject({ type: z.literal("boolean"), value: z.literal(true) }) });
function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_WIRE_GROUP_HISTORY_CURSOR"); } }
type Role = keyof typeof CALLS;
type Before = Readonly<{ role: "before"; frame: string; holder: string; native: string; frontier: string; setter: string; groupConstructor: string; scriptId: string; variant: 0 | 1 }>;
type After = Readonly<{ role: "after"; frame: string; previous: CurrentSchematicWireGroupHistoryData }>;
export type CurrentSchematicWireGroupHistoryInput = Before | After;
export interface CurrentSchematicWireGroupHistoryData {
  readonly schema: "private.schematic-wire-group-history-comparison-data.v1"; readonly role: "before" | "after";
  readonly snapshot: string; readonly publicationFunction: string; readonly exactOneGroupCommandCompared: true;
  readonly oldDataOwnDescriptorsAndOpaqueReferencesPreserved: boolean; readonly newLinePointsAndPeerAttributesCompared: boolean;
  readonly suppliedObservationsOnly: true; readonly originalHeldEventJoined: false; readonly historyComplete: false;
  readonly bboxComplete: false; readonly mutationAuthorized: false; readonly saveAuthorized: false;
}
interface Stored { readonly input: Before; readonly module: string; readonly snapshot: string; readonly publication: string }
const issued = new WeakMap<CurrentSchematicWireGroupHistoryData, Stored>();
const successors = new WeakSet<CurrentSchematicWireGroupHistoryData>();
function props(objectId: string): Command { return validate({ phase: "wire-group-history-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }); }
function call(role: Role, receiver: string, refs: readonly string[]): Command {
  const row = CALLS[role]; need(refs.length === row.refs);
  return validate({ phase: "wire-group-history-call", role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: receiver, functionDeclaration: row.program, arguments: refs.map(objectId => ({ objectId })), returnByValue: row.byValue, awaitPromise: false, userGesture: false } });
}
function field(rows: ReadonlyMap<string, Property>, name: string): Property {
  const row = rows.get(name); need(row?.value !== undefined && row.get === undefined && row.set === undefined); return row;
}
export class CurrentSchematicWireGroupHistoryCursor {
  readonly #plan: Generator<Command, CurrentSchematicWireGroupHistoryData, unknown>; readonly #maximum: number;
  #pending: Command | null = null; #reserved = false; #failed = false; #reads = 0; #result: CurrentSchematicWireGroupHistoryData | null = null; readonly #packets: unknown[] = [];
  /** Original Core must supply the original held frame and selectors. A copied
   * before packet cannot create a successor, even for data comparison. */
  public constructor(input: CurrentSchematicWireGroupHistoryInput) {
    const retained = Object.freeze({ ...input }); handle.parse(retained.frame); let before: Before; let prior: Stored | null = null;
    if (retained.role === "before") {
      before = retained; for (const id of [retained.holder, retained.native, retained.frontier, retained.setter, retained.groupConstructor, retained.scriptId]) { handle.parse(id); }
      need((retained.variant === 0 || retained.variant === 1) && !Object.is(retained.variant, -0));
    } else { const original = issued.get(retained.previous); need(original !== undefined && retained.previous.role === "before" && !successors.has(retained.previous)); successors.add(retained.previous); prior = original; before = original.input; }
    this.#maximum = LIMIT[retained.role]; this.#plan = CurrentSchematicWireGroupHistoryCursor.collect(retained, before, prior); Object.freeze(this);
  }
  private static *collect(input: CurrentSchematicWireGroupHistoryInput, before: Before, prior: Stored | null): Generator<Command, CurrentSchematicWireGroupHistoryData, unknown> {
    const { holder, native, frontier, scriptId, variant } = before; const after = input.role === "after";
    const tupleRows = new Map<string, ReturnType<typeof array>>(); const objectRows = new Map<string, ReturnType<typeof properties>>();
    const read = function* read(role: Role, receiver: string, refs: readonly string[], length: number, metadata: readonly number[]): Generator<Command, string, unknown> {
      const id = tuple(yield call(role, receiver, refs), length), rows = array(yield props(id), length);
      tupleRows.set(id, rows);
      for (const index of metadata) { const value = rows.get(String(index)); const child = object(value, "object"); objectRows.set(child, properties(yield props(child))); }
      return id;
    };
    const frame = tuple(yield validate({ phase: "wire-group-history-frame", role: input.role, method: "Debugger.evaluateOnCallFrame", params: { ...FLAGS, callFrameId: input.frame, expression: FRAMES[input.role], returnByValue: false, includeCommandLineAPI: false } }), 1);
    const frameRows = array(yield props(frame), 1); const receiverId = object(frameRows.get("0"), "object"); properties(yield props(receiverId));
    let module: string; let publication: string;
    if (after) { need(prior !== null); module = prior.module; publication = prior.publication; } else {
      module = tuple(yield call("module", holder, [native, before.groupConstructor, before.setter]), 2);
      const rows = array(yield props(module), 2); const ctor = rows.get("0"); need(ctor !== undefined);
      const ctorId = object(ctor, "function"); const decoded = groupFunction(yield props(ctorId), ctor, variant, "historyGroupClass", scriptId); need(decoded.prototype !== null);
      properties(yield props(decoded.prototype)); const setterId = object(rows.get("1"), "object"); array(yield props(setterId), 4); publication = "";
    }
    const roots = yield* read(after ? "afterRoots" : "beforeRoots", frame, after ? [native, holder, frontier, prior?.snapshot ?? ""] : [native, holder, frontier], 5, after ? [0, 1, 2, 4] : [0, 1, 2, 3, 4]);
    if (!after) {
      // The complete original onDidRecord roster has one listener. Do not arm
      // A text-matched callback selected from another history or subscription.
      const rootsRows = tupleRows.get(roots); need(rootsRows !== undefined); const bus = objectRows.get(object(rootsRows.get("3"), "object")); need(bus !== undefined);
      const size = field(bus, "_size").value; need(size?.type === "number" && size.value === 1);
      const subscriptionsId = object(field(bus, "_listenerSubscriptions").value, "object"); const subscriptions = array(yield props(subscriptionsId), 1);
      const subscriptionId = object(subscriptions.get("0"), "object"); const subscription = properties(yield props(subscriptionId));
      const fn = field(subscription, "cb").value; need(fn !== undefined);
      const fnId = object(fn, "function"); const decoded = publicationFunction(yield props(fnId), fn, variant, scriptId); publication = decoded.objectId;
    }
    const collections = yield* read("collections", roots, [native, holder], 2, [0, 1]);
    const payload = yield* read("data", collections, [native, module], 2, [0, 1]);
    const details = yield* read(after ? "afterDetails" : "beforeDetails", payload, [native], after ? 4 : 2, after ? [0, 1, 2, 3] : [0, 1]);
    const records = yield* read(after ? "afterRecords" : "beforeRecords", details, [native, holder], after ? 4 : 2, after ? [0, 1, 2, 3] : [0, 1]);
    const attributes = yield* read(after ? "afterAttributes" : "beforeAttributes", records, [native], after ? 4 : 2, after ? [0, 1, 2, 3] : [0, 1]);
    const points = yield* read(after ? "afterPoints" : "beforePoints", attributes, [native], after ? 2 : 1, after ? [0, 1] : [0]);
    const coordinates = yield* read(after ? "afterCoordinates" : "beforeCoordinates", points, [native], after ? 4 : 2, after ? [0, 1, 2, 3] : [0, 1]);
    const refs = [native, holder, module, roots, collections, payload, details, records, attributes, points, coordinates];
    let snapshot: string;
    if (after) { need(prior !== null); truth.parse(yield call("completed", holder, [...refs, prior.snapshot])); snapshot = prior.snapshot; }
    else { snapshot = tuple(yield call("snapshot", holder, refs), 9); array(yield props(snapshot), 9); }
    const result: CurrentSchematicWireGroupHistoryData = Object.freeze({ schema: "private.schematic-wire-group-history-comparison-data.v1", role: input.role, snapshot, publicationFunction: publication, exactOneGroupCommandCompared: true, oldDataOwnDescriptorsAndOpaqueReferencesPreserved: after, newLinePointsAndPeerAttributesCompared: after, suppliedObservationsOnly: true, originalHeldEventJoined: false, historyComplete: false, bboxComplete: false, mutationAuthorized: false, saveAuthorized: false });
    if (!after) { issued.set(result, Object.freeze({ input: before, module, snapshot, publication })); }
    return result;
  }
  /** Return the retained pending command until its exact reservation is made. */
  public next(): Command | null {
    need(!this.#failed && !this.#reserved); if (this.#pending !== null) { return this.#pending; } if (this.#result !== null) { return null; }
    try { const step = this.#plan.next(); need(step.done !== true); this.#pending = step.value; return step.value; } catch (error) { this.#failed = true; throw error; }
  }
  /** Reserve before sending; a copied row cannot consume a different attempt. */
  public reserve(command: Command): void { need(!this.#failed && !this.#reserved && this.#pending !== null && command === this.#pending && this.#reads < this.#maximum); this.#reserved = true; this.#reads += 1; }
  /** Preserve each exact reply and permanently retain a consumed failure. */
  public accept(command: Command, raw: unknown): void {
    need(!this.#failed && this.#reserved && this.#pending === command);
    try { const value = capture(raw).value; this.#packets.push(raw); const step = this.#plan.next(value); this.#pending = null; this.#reserved = false; if (step.done === true) { this.#result = step.value; } else { this.#pending = step.value; } } catch (error) { this.#failed = true; throw error; }
  }
  /** Completion remains data only; original event ownership is separate. */
  public requireCompleted(): CurrentSchematicWireGroupHistoryData { need(!this.#failed && !this.#reserved && this.#pending === null && this.#result !== null); return this.#result; }
  /** Return supplied original replies without granting native provenance. */
  public retainedReplies(): readonly unknown[] { need(!this.#failed && this.#result !== null); return Object.freeze([...this.#packets]); }
  /** Original owner failure permanently consumes this reader. */
  public fail(): void { this.#failed = true; }
}
