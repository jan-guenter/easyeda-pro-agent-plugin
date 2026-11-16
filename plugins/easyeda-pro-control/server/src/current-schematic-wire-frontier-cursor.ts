/* oxlint-disable eslint/max-classes-per-file -- Two finite readers share a command-identity engine while keeping metadata and actual-frame comparisons distinct. */
/** Complete callback text and receiver comparison at a finite history/bbox
 * frontier. The original event owner must retain all actual events and replies. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply as capture } from "./current-pcb-string-clock-reply.ts";
import { decodeCurrentFootprintCopyClockRpcV2Array as array, decodeCurrentFootprintCopyClockRpcV2ArrayCapture as tuple } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import { currentSchematicRelevanceRawHandle as object, currentSchematicRelevanceRawProperties as properties } from "./current-schematic-relevance-action-raw-replies.ts";
import type { CurrentSchematicRelevanceRawProperty as Property, CurrentSchematicRelevanceRawRemote as Remote } from "./current-schematic-relevance-action-raw-replies.ts";
import { CURRENT_SCHEMATIC_WIRE_FRONTIER_FLAGS as FLAGS, CURRENT_SCHEMATIC_WIRE_FRONTIER_FRAMES as FRAMES, CURRENT_SCHEMATIC_WIRE_FRONTIER_REQUESTS as LIMIT, CURRENT_SCHEMATIC_WIRE_FRONTIER_PROGRAMS as PROGRAMS, validateCurrentSchematicWireFrontierCommand as validate } from "./current-schematic-wire-frontier-protocol.ts";
import type { CurrentSchematicWireFrontierCommand as Command, CurrentSchematicWireFrontierEntryRole as EntryRole } from "./current-schematic-wire-frontier-protocol.ts";
import { decodeCurrentSchematicWireCompletionFunction as qualify } from "./current-schematic-wire-completion-source.ts";
import { decodeCurrentSchematicWirePublicationFunction as publication } from "./current-schematic-wire-publication-source.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const truth = z.strictObject({ result: z.strictObject({ type: z.literal("boolean"), value: z.literal(true) }) });
const ROLES = ["netPointRefresh", "netPointAnalyze", "netPointBuild", "historyTransact", "historyRecord", "netPointUpdate", "historyStackWillRecord", "historyEnd", "historyWillEnd", "historyStart", "historyBusStart", "historyBusEnd"] as const;
type Role = typeof ROLES[number];
function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_WIRE_FRONTIER_CURSOR"); } }
function data(rows: ReadonlyMap<string, Property>, name: string): Remote { const row = rows.get(name); need(row?.value !== undefined && row.get === undefined && row.set === undefined); return row.value; }
function props(objectId: string): Command { return validate({ phase: "wire-frontier-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }); }
function call(role: keyof typeof PROGRAMS, receiver: string, refs: readonly string[]): Command {
  need(refs.length === (role === "roots" ? 1 : 3));
  return validate({ phase: "wire-frontier-call", role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: receiver, functionDeclaration: PROGRAMS[role], arguments: refs.map(objectId => ({ objectId })), returnByValue: role !== "roots", awaitPromise: false, userGesture: false } });
}
const parentRemote = z.looseObject({ type: z.string(), subtype: z.string().optional(), objectId: handle.optional(), value: z.unknown().optional() });
const internal = z.strictObject({ name: z.string(), value: parentRemote });
const packet = z.strictObject({ result: z.array(z.unknown()).max(256), internalProperties: z.array(internal).max(3) });
function parent(input: unknown): string {
  const raw = packet.parse(input); const matches = raw.internalProperties.filter(row => row.name === "[[Prototype]]");
  need(matches.length === 1); const value = matches[0]?.value;
  need(value?.type === "object" && value.subtype === undefined && value.objectId !== undefined && value.value === undefined);
  return value.objectId;
}
class Reader<T> {
  readonly #plan: Generator<Command, T, unknown>; readonly #maximum: number; readonly #packets: unknown[] = [];
  #pending: Command | null = null; #reserved = false; #failed = false; #reads = 0; #result: T | null = null;
  public constructor(plan: Generator<Command, T, unknown>, maximum: number) { this.#plan = plan; this.#maximum = maximum; }
  /** Retain one command object until its original owner reserves it. */
  public next(): Command | null {
    need(!this.#failed && !this.#reserved); if (this.#pending !== null) { return this.#pending; } if (this.#result !== null) { return null; }
    try { const row = this.#plan.next(); need(row.done !== true); this.#pending = row.value; return row.value; } catch (error) { this.#failed = true; throw error; }
  }
  /** Spend the exact pending command before the owner writes its request. */
  public reserve(command: Command): void { need(!this.#failed && !this.#reserved && this.#pending !== null && command === this.#pending && this.#reads < this.#maximum); this.#reserved = true; this.#reads += 1; }
  /** Malformed evidence retains a terminal consumed attempt. */
  public accept(command: Command, raw: unknown): void {
    need(!this.#failed && this.#reserved && this.#pending !== null && command === this.#pending);
    try { const value = capture(raw).value; this.#packets.push(value); const row = this.#plan.next(value); this.#pending = null; this.#reserved = false; if (row.done === true) { this.#result = row.value; } else { this.#pending = row.value; } } catch (error) { this.#failed = true; throw error; }
  }
  /** Completed comparison data cannot issue an original event or continuation. */
  public requireCompleted(): T { need(!this.#failed && !this.#reserved && this.#pending === null && this.#result !== null); return this.#result; }
  /** Preserve the complete supplied reply roster for its original owner. */
  public retainedReplies(): readonly unknown[] { need(this.#result !== null && !this.#failed); return Object.freeze([...this.#packets]); }
  /** Original owner failure permanently consumes this reader. */
  public fail(): void { this.#failed = true; }
}
export interface CurrentSchematicWireFrontierMetadataData {
  readonly schema: "private.schematic-wire-frontier-metadata-data.v1"; readonly roots: string; readonly functions: Readonly<Record<Role, string>>;
  readonly fiveListenerRostersCompared: true; readonly suppliedObservationsOnly: true; readonly actualCallbackReceiversJoined: false;
  readonly otherListenerRostersComplete: false; readonly historyComplete: false; readonly bboxComplete: false; readonly executionAuthorized: false; readonly saveAuthorized: false;
}
export class CurrentSchematicWireFrontierMetadataCursor extends Reader<CurrentSchematicWireFrontierMetadataData> {
  /** Original Core supplies only its current callback holder/native19 and the
   * already fully qualified source variant. The original Modify run remains\n   * held and idle; listeners can be armed before their first start delivery. */
  public constructor(holder: string, native: string, script: string, variant: 0 | 1) {
    for (const id of [holder, native, script]) { handle.parse(id); } need((variant === 0 || variant === 1) && !Object.is(variant, -0));
    super(CurrentSchematicWireFrontierMetadataCursor.collect(holder, native, script, variant), LIMIT.metadataMaximum); Object.freeze(this);
  }
  private static *collect(holder: string, native: string, script: string, variant: 0 | 1): Generator<Command, CurrentSchematicWireFrontierMetadataData, unknown> {
    const roots = tuple(yield call("roots", holder, [native]), 8);
    const fields = array(yield props(roots), 8); const packets: unknown[] = []; const maps: ReadonlyMap<string, Property>[] = [];
    for (let i = 0; i < 8; i += 1) { const id = object(fields.get(String(i)), "object"); const raw: unknown = yield props(id); packets.push(raw); maps.push(properties(raw)); }
    const refs: Partial<Record<Role, string>> = {};
    const fn = function* fn(role: Role, remote: Remote): Generator<Command, void, unknown> { const id = object(remote, "function"); const metadata: unknown = yield props(id); if (role === "historyBusStart" || role === "historyBusEnd") { publication(metadata, remote, variant, role, script); } else { qualify(metadata, remote, variant, role, script); } refs[role] = id; };
    const groups = [
      { index: 2, methods: [["netPointRefresh", "refreshNetPoint"], ["netPointAnalyze", "analyzeNetPointData"], ["netPointBuild", "buildNetPointsIndexes"]] },
      { index: 1, methods: [["historyTransact", "transactionSuccessHandler"], ["historyRecord", "_record"]] },
    ] as const;
    for (const group of groups) {
      let raw = packets[group.index]; let rows = maps[group.index]; need(raw !== undefined && rows !== undefined);
      const remaining = new Set(group.methods.map(([role]) => role));
      for (let depth = 0; depth <= LIMIT.prototypeLimit; depth += 1) {
        for (const [role, name] of group.methods) {
          if (remaining.has(role) && rows.has(name)) { yield* fn(role, data(rows, name)); remaining.delete(role); }
        }
        if (remaining.size === 0) { break; } need(depth < LIMIT.prototypeLimit);
        raw = yield props(parent(raw)); rows = properties(raw);
      }
      need(remaining.size === 0);
    }
    const listeners = [[3, ["netPointUpdate"]], [4, ["historyStackWillRecord"]], [5, ["historyEnd", "historyBusEnd"]], [6, ["historyWillEnd"]], [7, ["historyStart", "historyBusStart"]]] as const;
    for (const [index, roles] of listeners) {
      const rows = maps[index]; need(rows !== undefined);
      const size = data(rows, "_size"); need(size.type === "number" && size.value === roles.length && size.objectId === undefined);
      const list = object(data(rows, "_listenerSubscriptions"), "object");
      const values = array(yield props(list), roles.length);
      for (const [at, role] of roles.entries()) {
        const subscription = object(values.get(String(at)), "object");
        const subscriber = properties(yield props(subscription)); const callback = subscriber.get("cb");
        need(callback?.value !== undefined && callback.get === undefined && callback.set === undefined && callback.writable === true && callback.enumerable && callback.configurable);
        yield* fn(role, callback.value);
      }
    }
    const functions = z.record(z.enum(ROLES), handle).parse(refs);
    return Object.freeze({ schema: "private.schematic-wire-frontier-metadata-data.v1", roots, functions: Object.freeze(functions), fiveListenerRostersCompared: true, suppliedObservationsOnly: true, actualCallbackReceiversJoined: false, otherListenerRostersComplete: false, historyComplete: false, bboxComplete: false, executionAuthorized: false, saveAuthorized: false });
  }
}
export interface CurrentSchematicWireFrontierEntryData {
  readonly schema: "private.schematic-wire-frontier-entry-data.v1"; readonly role: EntryRole; readonly frame: string;
  readonly actualReceiverCompared: true; readonly suppliedObservationsOnly: true; readonly originalEventJoined: false;
  readonly callbackBodyComplete: false; readonly executionAuthorized: false; readonly saveAuthorized: false;
}
export class CurrentSchematicWireFrontierEntryCursor extends Reader<CurrentSchematicWireFrontierEntryData> {
  /** Only a current actual original listener frame may supply these selectors. */
  public constructor(role: EntryRole, frame: string, holder: string, native: string, roots: string) {
    for (const id of [frame, holder, native, roots]) { handle.parse(id); }
    const count = role === "netPointUpdate" || role === "historyStart" ? LIMIT.entryTwo : LIMIT.entryOne;
    super(CurrentSchematicWireFrontierEntryCursor.collect(role, frame, holder, native, roots), count); Object.freeze(this);
  }
  private static *collect(role: EntryRole, frame: string, holder: string, native: string, roots: string): Generator<Command, CurrentSchematicWireFrontierEntryData, unknown> {
    const count = role === "netPointUpdate" || role === "historyStart" ? 2 : 1;
    const selected = tuple(yield validate({ phase: "wire-frontier-frame", role, method: "Debugger.evaluateOnCallFrame", params: { ...FLAGS, callFrameId: frame, expression: FRAMES[role], returnByValue: false, includeCommandLineAPI: false } }), count);
    const fields = array(yield props(selected), count);
    for (let i = 0; i < count; i += 1) { const id = object(fields.get(String(i)), "object"); properties(yield props(id)); }
    truth.parse(yield call(role, selected, [native, holder, roots]));
    return Object.freeze({ schema: "private.schematic-wire-frontier-entry-data.v1", role, frame: selected, actualReceiverCompared: true, suppliedObservationsOnly: true, originalEventJoined: false, callbackBodyComplete: false, executionAuthorized: false, saveAuthorized: false });
  }
}
