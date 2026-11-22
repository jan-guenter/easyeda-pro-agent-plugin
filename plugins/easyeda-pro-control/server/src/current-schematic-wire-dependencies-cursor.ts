/** Finite native dependency metadata cursor; construction supplies selectors
 * only. Only the original Core origin can issue an observation from its data. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_SCHEMATIC_WIRE_DEPENDENCY_NATIVE_ROLES as ROLES } from "./current-schematic-wire-dependencies-programs.ts";
import { CURRENT_SCHEMATIC_WIRE_DEPENDENCY_CALLS as CALLS, CURRENT_SCHEMATIC_WIRE_DEPENDENCY_EXTRA_ARGUMENTS as EXTRA, CURRENT_SCHEMATIC_WIRE_DEPENDENCY_FLAGS as FLAGS,
  CURRENT_SCHEMATIC_WIRE_DEPENDENCY_REQUESTS as REQUESTS, validateCurrentSchematicWireDependencyCommand } from "./current-schematic-wire-dependencies-protocol.ts";
import type { CurrentSchematicWireDependencyCommand, CurrentSchematicWireDependencyRole } from "./current-schematic-wire-dependencies-protocol.ts";
import { decodeCurrentFootprintCopyClockRpcV2Array, decodeCurrentFootprintCopyClockRpcV2ArrayCapture } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import { decodeCurrentNativeFunctionMetadata } from "./current-native-function-metadata.ts";
import { currentSchematicRelevanceRawNativeConstructor, currentSchematicRelevanceRawProperties } from "./current-schematic-relevance-action-raw-replies.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const truth = z.strictObject({ result: z.strictObject({ type: z.literal("boolean"), value: z.literal(true) }) });
function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_WIRE_DEPENDENCY_CURSOR"); } }
export interface CurrentSchematicWireDependencyValues {
  readonly nativeArrayObjectId: string; readonly nativeFunctionObjectIds: readonly string[];
  readonly mapPrototypeObjectId: string; readonly iteratorTupleObjectId: string;
  readonly iteratorObjectId: string; readonly iteratorPrototypeObjectId: string; readonly iteratorNextObjectId: string;
}
/** Validate the actual iterator and its distinct native prototype; a plain
 * object or a prototype-only packet cannot stand in for the iterator. */
export function decodeCurrentSchematicWireDependencyIterator(input: unknown): Readonly<{ iteratorObjectId: string; iteratorPrototypeObjectId: string; iteratorNextObjectId: string }> {
  const iterator = decodeCurrentFootprintCopyClockRpcV2Array(input, 3);
  const next = iterator.get("2"), parent = iterator.get("1"), value = iterator.get("0");
  need(value?.type === "object" && value.subtype === "iterator" && value.className === "SetIterator" && value.description === "SetIterator" && value.objectId !== undefined && value.value === undefined &&
    parent?.type === "object" && parent.subtype === undefined && parent.className === "Set Iterator" && parent.description === "Set Iterator" && parent.objectId !== undefined && parent.value === undefined &&
    next?.type === "function" && next.className === "Function" && next.subtype === undefined && next.objectId !== undefined && next.value === undefined && next.description === "function next() { [native code] }");
  return Object.freeze({ iteratorObjectId: value.objectId, iteratorPrototypeObjectId: parent.objectId, iteratorNextObjectId: next.objectId });
}
export class CurrentSchematicWireDependencyCursor {
  readonly #holder: string; readonly #target: string; readonly #operation: string;
  readonly #plan: Generator<CurrentSchematicWireDependencyCommand, CurrentSchematicWireDependencyValues, unknown>;
  #pending: CurrentSchematicWireDependencyCommand | null = null; #reserved = false; #failed = false; #reads = 0;
  #completed: CurrentSchematicWireDependencyValues | null = null;
  public constructor(holder: string, target: string, operation: string) {
    this.#holder = handle.parse(holder); this.#target = target; this.#operation = operation; this.#plan = this.#collect(); Object.freeze(this);
  }
  static #properties(objectId: string): CurrentSchematicWireDependencyCommand {
    return validateCurrentSchematicWireDependencyCommand({ phase: "wire-dependency-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } });
  }
  #call(role: CurrentSchematicWireDependencyRole, refs: readonly string[] = []): CurrentSchematicWireDependencyCommand {
    need(refs.length === EXTRA[role]); return validateCurrentSchematicWireDependencyCommand({ phase: "wire-dependency-call", role, method: "Runtime.callFunctionOn",
      params: { ...FLAGS, objectId: this.#holder, functionDeclaration: CALLS[role], arguments: [{ objectId: this.#holder }, { value: this.#target }, { value: this.#operation }, ...refs.map(objectId => ({ objectId }))], returnByValue: role === "same" } });
  }
  *#collect(): Generator<CurrentSchematicWireDependencyCommand, CurrentSchematicWireDependencyValues, unknown> {
    const nativeArrayObjectId = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(yield this.#call("capture"), ROLES.length);
    const fields = decodeCurrentFootprintCopyClockRpcV2Array(yield CurrentSchematicWireDependencyCursor.#properties(nativeArrayObjectId), ROLES.length);
    const refs: string[] = []; let mapPrototypeObjectId: string | null = null;
    for (const [index, row] of ROLES.entries()) {
      const value = fields.get(String(index)); need(value?.type === "function" && value.subtype === undefined && value.className === "Function" && value.objectId !== undefined && value.value === undefined && value.description === `function ${row[1]}() { [native code] }`);
      refs.push(value.objectId); const raw = yield CurrentSchematicWireDependencyCursor.#properties(value.objectId);
      if (row[0] === "mapConstructor") { mapPrototypeObjectId = currentSchematicRelevanceRawNativeConstructor(raw, "Map"); need(currentSchematicRelevanceRawProperties(raw).size === 3); }
      else { decodeCurrentNativeFunctionMetadata(raw, { name: row[1], arity: row[2], constructor: false }); }
    }
    const iteratorTupleObjectId = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(yield this.#call("iterator", [nativeArrayObjectId]), 3);
    const iterator = decodeCurrentSchematicWireDependencyIterator(yield CurrentSchematicWireDependencyCursor.#properties(iteratorTupleObjectId));
    decodeCurrentNativeFunctionMetadata(yield CurrentSchematicWireDependencyCursor.#properties(iterator.iteratorNextObjectId), { name: "next", arity: 0, constructor: false });
    truth.parse(captureCurrentPcbStringClockReply(yield this.#call("same", [nativeArrayObjectId, iteratorTupleObjectId])).value);
    need(mapPrototypeObjectId !== null);
    return Object.freeze({ nativeArrayObjectId, nativeFunctionObjectIds: Object.freeze(refs), mapPrototypeObjectId, iteratorTupleObjectId, ...iterator });
  }
  public next(): CurrentSchematicWireDependencyCommand | null {
    need(!this.#failed && !this.#reserved); if (this.#pending !== null) { return this.#pending; } if (this.#completed !== null) { return null; }
    try { const item = this.#plan.next(); need(item.done !== true); this.#pending = item.value; return this.#pending; } catch (error) { this.#failed = true; throw error; }
  }
  public reserve(command: CurrentSchematicWireDependencyCommand): void { need(!this.#failed && !this.#reserved && this.#pending !== null && command === this.#pending && this.#reads < REQUESTS.normal); this.#reserved = true; this.#reads += 1; }
  public accept(command: CurrentSchematicWireDependencyCommand, raw: unknown): void {
    need(!this.#failed && this.#reserved && this.#pending !== null && command === this.#pending);
    try { const item = this.#plan.next(captureCurrentPcbStringClockReply(raw).value); this.#reserved = false; this.#pending = null;
      if (item.done === true) { need(this.#reads === REQUESTS.normal); this.#completed = item.value; } else { this.#pending = item.value; }
    } catch (error) { this.#failed = true; throw error; }
  }
  public requireCompleted(): CurrentSchematicWireDependencyValues { need(!this.#failed && !this.#reserved && this.#pending === null && this.#completed !== null); return this.#completed; }
  public fail(): void { this.#failed = true; }
}
