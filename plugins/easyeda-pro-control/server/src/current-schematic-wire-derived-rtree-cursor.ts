/** Bounded descriptor reader for the known six-model Wire fixture. The final
 * fixed comparison joins every traversed edge against Inspector-qualified
 * objects again, so replacement objects are refused before descriptor access. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply as capture } from "./current-pcb-string-clock-reply.ts";
import { decodeCurrentFootprintCopyClockRpcV2ArrayCapture as tuple } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import { CURRENT_SCHEMATIC_WIRE_DERIVED_RTREE_CALLS as CALLS, CURRENT_SCHEMATIC_WIRE_DERIVED_RTREE_FLAGS as FLAGS, CURRENT_SCHEMATIC_WIRE_DERIVED_RTREE_REQUESTS as LIMIT, validateCurrentSchematicWireDerivedRtreeCommand as validate } from "./current-schematic-wire-derived-rtree-protocol.ts";
import type { CurrentSchematicWireDerivedRtreeCommand as Command } from "./current-schematic-wire-derived-rtree-protocol.ts";

import type { CurrentSchematicWireDerivedRtreeFields } from "./current-schematic-wire-derived-rtree-census.ts";
import { CurrentSchematicWireDerivedRtreeCensus, wireDerivedFieldValue as fieldValue, wireDerivedRef as ref } from "./current-schematic-wire-derived-rtree-census.ts";

const truth = z.strictObject({ result: z.strictObject({ type: z.literal("boolean"), value: z.literal(true) }) });
function need(condition: boolean): asserts condition { if (!condition) { throw new Error("SCHEMATIC_WIRE_DERIVED_RTREE_CURSOR"); } }
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
function call(role: keyof typeof CALLS, receiver: string, refs: readonly string[]): Command { const row = CALLS[role]; need(refs.length === row.refs); return validate({ phase: "wire-derived-rtree-call", role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: receiver, functionDeclaration: row.program, arguments: refs.map(objectId => ({ objectId })), returnByValue: row.byValue, awaitPromise: false, userGesture: false } }); }
export interface CurrentSchematicWireDerivedRtreeData {
  readonly schema: "private.schematic-wire-derived-rtree-comparison-data.v1"; readonly stage: "before" | "after"; readonly snapshot: string | null;
  readonly boundedRtreeCompared: true; readonly fourConnectionNodesCompared: true; readonly unaffectedIndexNodesCompared: boolean;
  readonly suppliedObservationsOnly: true; readonly originalHeldEventsJoined: false; readonly lifecycleComplete: false; readonly mutationAuthorized: false; readonly saveAuthorized: false;
}
type First = Readonly<{ stage: "before"; holder: string; native: string }>;
export type CurrentSchematicWireDerivedRtreeInput = First | Readonly<{ stage: "after"; previous: CurrentSchematicWireDerivedRtreeData }>;
interface Stored { readonly first: First; readonly snapshot: string }
const issued = new WeakMap<CurrentSchematicWireDerivedRtreeData, Stored>(); const spent = new WeakSet<CurrentSchematicWireDerivedRtreeData>();
/** Every after packet consumes its exact locally issued before packet once.
 * An external original owner must separately qualify classes and hold lifecycle
 * events; parsed comparison data never provide that custody. */
export class CurrentSchematicWireDerivedRtreeCursor {
  readonly #plan: Generator<Command, CurrentSchematicWireDerivedRtreeData, unknown>; readonly #maximum: 97 | 102; #pending: Command | null = null; #reserved = false; #failed = false; #reads = 0; #result: CurrentSchematicWireDerivedRtreeData | null = null; readonly #packets: unknown[] = [];
  public constructor(input: CurrentSchematicWireDerivedRtreeInput) {
    let first; let previous: string | null = null;
    if (input.stage === "before") { first = Object.freeze({ ...input }); handle.parse(first.holder); handle.parse(first.native); }
    else { const retained = issued.get(input.previous); need(retained !== undefined && !spent.has(input.previous)); spent.add(input.previous); first = retained.first; previous = retained.snapshot; }
    this.#maximum = previous === null ? LIMIT.before : LIMIT.after; this.#plan = CurrentSchematicWireDerivedRtreeCursor.collect(first, previous); Object.freeze(this);
  }
  private static *collect(first: First, previous: string | null): Generator<Command, CurrentSchematicWireDerivedRtreeData, unknown> {
    const { holder, native } = first; const census = new CurrentSchematicWireDerivedRtreeCensus(previous === null ? LIMIT.beforeMetadata : LIMIT.afterMetadata); const h = yield* census.array(holder, 2); const b = yield* census.field(h, "0"); const state = yield* census.field(h, "1");
    const before = yield* census.field(state, "before"); const scene = previous === null ? before : yield* census.field(state, "after");
    const shapes = yield* census.field(b, "shapes"); yield* census.field(b, "line"); yield* census.field(b, "group");
    for (const key of ["page", "host", "metadata", "runner"]) { yield* census.field(b, key); }
    const persistent = yield* census.array(ref(scene, "tree", "array"), 6); const markers = yield* census.array(ref(scene, "markers", "array"), 2); const oldMarkers = yield* census.array(ref(before, "markers", "array"), 2);
    let busLine: CurrentSchematicWireDerivedRtreeFields | null = null;
    for (let i = 0; i < 6; i += 1) { const row = yield* census.field(persistent, String(i)); const model = yield* census.field(row, "model"); if (fieldValue(row, "type").value === "Bus") { busLine = model; } }
    need(busLine !== null);
    for (let i = 0; i < 2; i += 1) { yield* census.field(markers, String(i)); yield* census.field(oldMarkers, String(i)); }
    const tree = yield* census.field(shapes, "rTree"); const net = yield* census.field(shapes, "netPointManager"); const range = yield* census.field(net, "pointRangeRTree");
    yield* census.field(tree, "options"); const modelBush = yield* census.field(tree, "_rbush"); const pointBush = yield* census.field(range, "rTree");
    const modelRoot = yield* census.field(modelBush, "data"); const pointRoot = yield* census.field(pointBush, "data");
    yield* census.array(ref(modelRoot, "children", "array"), 5); const pointRecords = yield* census.array(ref(pointRoot, "children", "array"), 4);
    const map = ref(tree, "_idBBoxMap", "map"); yield* census.read(map, "map"); yield* census.field(tree, "_oldIdBBoxMap", "map");
    const mapArray = tuple(yield call("map", map, [native]), 5); const pairs = yield* census.array(mapArray, 5);
    for (let i = 0; i < 5; i += 1) { const pair = yield* census.array(ref(pairs, String(i), "array"), 2); const node = yield* census.field(pair, "1"); yield* census.field(node, "bbox"); }
    for (let i = 0; i < 4; i += 1) { const record = yield* census.field(pointRecords, String(i)); const point = yield* census.field(record, "point"); for (const key of ["Wire", "Bus", "Pin", "BusEntry"]) { yield* census.field(point, key, "set"); } }
    const data = yield* census.field(net, "_netPointData"); yield* census.field(data, "points", "set");
    for (const [key, count] of [["wireUnConnect", 2], ["pinUnConnected", 0], ["junction", 0]] as const) { yield* census.array(ref(data, key, "array"), count); }
    for (const key of ["unConnectDotModels", "junctionModels"]) { yield* census.field(net, key, "set"); }
    for (const key of ["netGroupConnectedMap", "busEntryOrSymbolConnectedMap"]) { yield* census.field(net, key, "map"); }
    const line = yield* census.field(b, "line");
    for (const model of [line, busLine]) { const points = yield* census.array(ref(model, "_points", "array"), 2); for (let i = 0; i < 2; i += 1) { yield* census.field(points, String(i)); } }
    if (previous !== null) { yield* census.read(previous); }
    const refs = [...census.approved]; while (refs.length < LIMIT.approvedSlots) { refs.push(native); }
    const approved = tuple(yield call("approved", holder, [native, ...refs]), LIMIT.approvedSlots);
    let snapshot: string | null = null;
    if (previous === null) { snapshot = z.strictObject({ result: z.strictObject({ type: z.literal("object"), className: z.literal("Object"), description: z.literal("Object"), objectId: handle }) }).parse(yield call("before", holder, [native, holder, approved])).result.objectId; }
    else { truth.parse(yield call("after", holder, [native, holder, approved, previous])); }
    const result: CurrentSchematicWireDerivedRtreeData = Object.freeze({ schema: "private.schematic-wire-derived-rtree-comparison-data.v1", stage: previous === null ? "before" : "after", snapshot, boundedRtreeCompared: true, fourConnectionNodesCompared: true, unaffectedIndexNodesCompared: previous !== null, suppliedObservationsOnly: true, originalHeldEventsJoined: false, lifecycleComplete: false, mutationAuthorized: false, saveAuthorized: false });
    if (snapshot !== null) { issued.set(result, Object.freeze({ first, snapshot })); } return result;
  }
  public next(): Command | null { need(!this.#failed && !this.#reserved); if (this.#pending !== null) { return this.#pending; } if (this.#result !== null) { return null; } try { const step = this.#plan.next(); need(step.done !== true); this.#pending = step.value; return step.value; } catch (error) { this.#failed = true; throw error; } }
  public reserve(command: Command): void { need(!this.#failed && !this.#reserved && this.#pending !== null && command === this.#pending && this.#reads < this.#maximum); this.#reserved = true; this.#reads += 1; }
  public accept(command: Command, raw: unknown): void { need(!this.#failed && this.#reserved && this.#pending === command); try { const captured = capture(raw).value; this.#packets.push(raw); const step = this.#plan.next(captured); this.#pending = null; this.#reserved = false; if (step.done === true) { this.#result = step.value; } else { this.#pending = step.value; } } catch (error) { this.#failed = true; throw error; } }
  public requireCompleted(): CurrentSchematicWireDerivedRtreeData { need(!this.#failed && !this.#reserved && this.#pending === null && this.#result !== null); return this.#result; }
  public retainedReplies(): readonly unknown[] { need(!this.#failed && this.#result !== null); return Object.freeze([...this.#packets]); }
  public fail(): void { this.#failed = true; }
}