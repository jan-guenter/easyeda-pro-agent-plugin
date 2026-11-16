/** Finite scope/descriptor reader for the original non-private annotation
 * branch. A null field does not supply a complete observer roster or owner. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply as capture } from "./current-pcb-string-clock-reply.ts";
import { decodeCurrentFootprintCopyClockRpcV2Array as array, decodeCurrentFootprintCopyClockRpcV2ArrayCapture as tuple } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import { currentSchematicRelevanceRawHandle as object, currentSchematicRelevanceRawProperties as properties } from "./current-schematic-relevance-action-raw-replies.ts";
import type { CurrentSchematicRelevanceRawRemote as Remote } from "./current-schematic-relevance-action-raw-replies.ts";
import { CURRENT_SCHEMATIC_WIRE_ANNOTATION_ABSENCE_CALLS as CALLS, CURRENT_SCHEMATIC_WIRE_ANNOTATION_ABSENCE_FLAGS as FLAGS, CURRENT_SCHEMATIC_WIRE_ANNOTATION_ABSENCE_REQUESTS as LIMIT, validateCurrentSchematicWireAnnotationAbsenceCommand as validate } from "./current-schematic-wire-annotation-absence-protocol.ts";
import type { CurrentSchematicWireAnnotationAbsenceCommand as Command } from "./current-schematic-wire-annotation-absence-protocol.ts";
import { decodeCurrentSchematicWireAnnotationAbsenceFunction as qualify } from "./current-schematic-wire-annotation-absence-source.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const truth = z.strictObject({ result: z.strictObject({ type: z.literal("boolean"), value: z.literal(true) }) });
const remote = z.strictObject({ type: z.enum(["object", "function", "undefined"]), subtype: z.string().optional(), className: z.string().optional(), description: z.string().max(16_384).optional(), objectId: handle.optional() });
const result = z.strictObject({ result: remote });
const internal = z.strictObject({ name: z.literal("[[Prototype]]"), value: z.strictObject({ type: z.literal("object"), subtype: z.string().optional(), className: z.string().optional(), description: z.string().optional(), objectId: handle.optional(), value: z.unknown().optional() }) });
const ordinary = z.strictObject({ result: z.array(z.unknown()).max(256), internalProperties: z.array(internal).length(1) });
function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_WIRE_ANNOTATION_ABSENCE_CURSOR"); } }
function props(objectId: string): Command { return validate({ phase: "wire-annotation-absence-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }); }
function call(role: keyof typeof CALLS, receiver: string, refs: readonly string[]): Command {
  const row = CALLS[role]; need(refs.length === row.refs);
  return validate({ phase: "wire-annotation-absence-call", role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: receiver, functionDeclaration: row.program, arguments: refs.map(objectId => ({ objectId })), returnByValue: row.byValue, awaitPromise: false, userGesture: false } });
}
function parent(input: unknown): string {
  const value = ordinary.parse(input).internalProperties[0]?.value;
  need(value !== undefined && value.subtype === undefined && value.objectId !== undefined && value.value === undefined); return value.objectId;
}
function* scopes(scopesId: string): Generator<Command, readonly string[], unknown> {
  const raw = z.strictObject({ result: z.array(z.unknown()).min(1).max(LIMIT.scopeLimit) }).parse(yield props(scopesId));
  const rows = properties({ ...raw, internalProperties: [] }); const values: string[] = [];
  for (let index = 0; index < rows.size; index += 1) { const field = rows.get(String(index)); need(field?.get === undefined && field?.set === undefined && field?.value?.subtype === "internal#scope"); values.push(object(field.value, "object")); }
  return values;
}
export interface CurrentSchematicWireAnnotationAbsenceData {
  readonly schema: "private.schematic-wire-annotation-absence-data.v1"; readonly snapshot: string; readonly factory: string;
  readonly capturedPrivateModeFalseCompared: true; readonly originalPageAnnotationManagerNullCompared: true;
  readonly suppliedObservationsOnly: true; readonly originalHeldEventJoined: false; readonly observerRosterComplete: false;
  readonly annotationLifecycleComplete: false; readonly mutationAuthorized: false; readonly saveAuthorized: false;
}
export class CurrentSchematicWireAnnotationAbsenceCursor {
  readonly #plan: Generator<Command, CurrentSchematicWireAnnotationAbsenceData, unknown>;
  #pending: Command | null = null; #reserved = false; #failed = false; #reads = 0; #result: CurrentSchematicWireAnnotationAbsenceData | null = null; readonly #packets: unknown[] = [];
  /** The original owner supplies qualified selectors. This cursor neither
   * opens a page nor invokes its factory, register or canvas methods. */
  public constructor(holder: string, native: string, scriptId: string, variant: 0 | 1) {
    for (const id of [holder, native, scriptId]) { handle.parse(id); } need((variant === 0 || variant === 1) && !Object.is(variant, -0));
    this.#plan = CurrentSchematicWireAnnotationAbsenceCursor.collect(holder, native, scriptId, variant); Object.freeze(this);
  }
  private static *collect(holder: string, native: string, scriptId: string, variant: 0 | 1): Generator<Command, CurrentSchematicWireAnnotationAbsenceData, unknown> {
    const snapshot = tuple(yield call("roots", holder, [native]), 10); const roots = array(yield props(snapshot), 10);
    const page = object(roots.get("3"), "object"); let packet: unknown = yield props(page); let method: Remote | null = null;
    for (let depth = 0; depth <= LIMIT.prototypeLimit; depth += 1) {
      const fields = properties(packet); ordinary.parse(packet); const own = fields.get("openCanvas");
      if (own !== undefined) { need(own.get === undefined && own.set === undefined && own.value?.type === "function"); method = own.value; break; }
      need(depth < LIMIT.prototypeLimit); packet = yield props(parent(packet));
    }
    need(method !== null); const fn = object(method, "function"); const open = qualify(yield props(fn), method, variant, "openCanvas", scriptId);
    let factory: string | null = null; let factoryScopes: string | null = null;
    for (const scope of yield* scopes(open.scopes)) {
      const reply = result.parse(yield call(variant === 0 ? "factoryMain" : "factoryEditor", scope, [native])).result;
      if (reply.type !== "undefined") { need(factory === null && reply.type === "function"); factory = object(reply, "function"); const metadata = qualify(yield props(factory), reply, variant, "factory", scriptId); factoryScopes = metadata.scopes; }
    }
    need(factory !== null && factoryScopes !== null); let privateTuple: string | null = null;
    for (const scope of yield* scopes(factoryScopes)) {
      const raw: unknown = yield call(variant === 0 ? "privateMain" : "privateEditor", scope, [native]); const reply = result.parse(raw).result;
      if (reply.type !== "undefined") { need(privateTuple === null && reply.type === "object" && reply.subtype === "array"); privateTuple = tuple(raw, 2); const cells = array(yield props(privateTuple), 2); const mode = cells.get("0"); need(mode?.type === "boolean" && mode.value === false); object(cells.get("1"), "function"); }
    }
    need(privateTuple !== null); truth.parse(yield call("complete", privateTuple, [native, holder, snapshot, factory]));
    return Object.freeze({ schema: "private.schematic-wire-annotation-absence-data.v1", snapshot, factory, capturedPrivateModeFalseCompared: true, originalPageAnnotationManagerNullCompared: true, suppliedObservationsOnly: true, originalHeldEventJoined: false, observerRosterComplete: false, annotationLifecycleComplete: false, mutationAuthorized: false, saveAuthorized: false });
  }
  /** Retain the same next command until its exact reservation. */
  public next(): Command | null {
    need(!this.#failed && !this.#reserved); if (this.#pending !== null) { return this.#pending; } if (this.#result !== null) { return null; }
    try { const step = this.#plan.next(); need(step.done !== true); this.#pending = step.value; return step.value; } catch (error) { this.#failed = true; throw error; }
  }
  /** Reserve before writing; copied commands cannot consume this reader. */
  public reserve(command: Command): void { need(!this.#failed && !this.#reserved && this.#pending !== null && command === this.#pending && this.#reads < LIMIT.normalMaximum); this.#reserved = true; this.#reads += 1; }
  /** Preserve exact replies and permanently consume malformed or failed work. */
  public accept(command: Command, raw: unknown): void {
    need(!this.#failed && this.#reserved && this.#pending === command);
    try { const value = capture(raw).value; this.#packets.push(raw); const step = this.#plan.next(value); this.#pending = null; this.#reserved = false; if (step.done === true) { this.#result = step.value; } else { this.#pending = step.value; } } catch (error) { this.#failed = true; throw error; }
  }
  /** Null/private comparisons do not prove a complete observer roster. */
  public requireCompleted(): CurrentSchematicWireAnnotationAbsenceData { need(!this.#failed && !this.#reserved && this.#pending === null && this.#result !== null); return this.#result; }
  /** Return exact supplied replies without issuing provenance. */
  public retainedReplies(): readonly unknown[] { need(!this.#failed && this.#result !== null); return Object.freeze([...this.#packets]); }
  /** Permanently close the reader when its original owner fails. */
  public fail(): void { this.#failed = true; }
}
