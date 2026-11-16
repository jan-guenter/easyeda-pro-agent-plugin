/** Descriptor metadata for the fixed original classic RPC receiver graph. */
import { types } from "node:util";
import { z } from "zod";
import { captureCurrentPcbStringClockReply as capture } from "./current-pcb-string-clock-reply.ts";
import { decodeCurrentFootprintCopyClockRpcV2Array as array } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import { currentSchematicRelevanceRawArrayLength as length, currentSchematicRelevanceRawHandle as object, currentSchematicRelevanceRawProperties as properties } from "./current-schematic-relevance-action-raw-replies.ts";
import type { CurrentSchematicRelevanceRawRemote as Remote } from "./current-schematic-relevance-action-raw-replies.ts";
import { CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_REQUESTS as LIMIT, validateCurrentSchematicWireClassicRpcCommand as validate } from "./current-schematic-wire-classic-rpc-protocol.ts";
import type { CurrentSchematicWireClassicRpcCommand as Command } from "./current-schematic-wire-classic-rpc-protocol.ts";

const internal = z.strictObject({ name: z.string(), value: z.unknown() });
const internals = z.strictObject({ result: z.array(z.unknown()).max(256), internalProperties: z.array(internal).max(2) });
function need(condition: boolean): asserts condition { if (!condition) { throw new Error("SCHEMATIC_WIRE_CLASSIC_RPC_CURSOR"); } }
export type CurrentSchematicWireClassicRpcFields = ReturnType<typeof properties>;
export function wireClassicRpcFieldValue(fields: CurrentSchematicWireClassicRpcFields, key: string): Remote { const row = fields.get(key); need(row?.value !== undefined && row.get === undefined && row.set === undefined); return row.value; }
export function wireClassicRpcRef(fields: CurrentSchematicWireClassicRpcFields, key: string, kind: "object" | "array" | "map" | "set" | "large" = "object"): string { const v = wireClassicRpcFieldValue(fields, key); need(v.type === "object" && (kind === "object" || kind === "large" ? v.subtype === undefined : v.subtype === kind)); if (kind === "map" || kind === "set") { need(v.className === (kind === "map" ? "Map" : "Set")); } return object(v, "object"); }
function props(objectId: string, kind: "fields" | "large" = "fields"): Command { return validate({ phase: "classic-rpc-properties", kind, method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }); }
/** Runtime omits internals in accessor-only mode. The real full request is
 * retained by the cursor; this header check never fabricates an empty property
 * packet or walks unused large-map values. Critical fields are projected later
 * with native descriptors after their original object has passed this check. */
function largeOrdinary(input: unknown): void {
  need(input !== null && typeof input === "object" && !types.isProxy(input) && !Array.isArray(input) &&
    (Object.getPrototypeOf(input) === Object.prototype || Object.getPrototypeOf(input) === null));
  const names = Reflect.ownKeys(input); need(names.length === 2 && names.includes("result") && names.includes("internalProperties"));
  const fields = Object.getOwnPropertyDescriptor(input, "result");
  const inside = Object.getOwnPropertyDescriptor(input, "internalProperties");
  need(fields !== undefined && Object.hasOwn(fields, "value") && inside !== undefined && Object.hasOwn(inside, "value"));
  const values: unknown = fields.value; need(Array.isArray(values) && !types.isProxy(values) && Object.getPrototypeOf(values) === Array.prototype && values.length <= 4096);
  const internalsValue: unknown = inside.value;
  const packet = z.strictObject({ internalProperties: z.array(internal).length(1) }).parse(capture({internalProperties:internalsValue}).value);
  need(packet.internalProperties[0]?.name === "[[Prototype]]");
}
export class CurrentSchematicWireClassicRpcCensus {
  readonly #maximum: 64;
  public readonly approved: string[] = []; readonly #cache = new Map<string, CurrentSchematicWireClassicRpcFields>();
  public constructor(maximum: 64) { this.#maximum = maximum; }
  public *read(id: string, kind: "object" | "array" | "map" | "set" | "large" = "object"): Generator<Command, CurrentSchematicWireClassicRpcFields, unknown> {
    const old = this.#cache.get(id); if (old !== undefined) { return old; }
    need(this.#cache.size < this.#maximum); const raw: unknown = yield props(id, kind === "large" ? "large" : "fields");
    if (kind === "large") { largeOrdinary(raw); const unread = new Map<string, ReturnType<typeof properties> extends ReadonlyMap<string, infer T> ? T : never>(); this.#cache.set(id, unread); this.approved.push(id); need(this.approved.length <= LIMIT.approvedSlots); return unread; }
    const parsed = internals.parse(raw); const fields = properties(raw);
    const names = parsed.internalProperties.map(row => row.name);
    need(names.length === (kind === "map" || kind === "set" ? 2 : 1) && names.includes("[[Prototype]]") && (names.length !== 2 || names.includes("[[Entries]]")));
    if (kind === "array") { array(raw, length(raw, 0, LIMIT.approvedSlots)); }
    this.#cache.set(id, fields); this.approved.push(id); need(this.approved.length <= LIMIT.approvedSlots); return fields;
  }
  public *array(id: string, count: number): Generator<Command, CurrentSchematicWireClassicRpcFields, unknown> { const fields = yield* this.read(id, "array"); need(fields.size === count + 1 && wireClassicRpcFieldValue(fields, "length").value === count); return fields; }
  public *field(fields: CurrentSchematicWireClassicRpcFields, key: string, kind: "object" | "array" | "map" | "set" | "large" = "object"): Generator<Command, CurrentSchematicWireClassicRpcFields, unknown> { return yield* this.read(wireClassicRpcRef(fields, key, kind), kind); }
}
Object.freeze(CurrentSchematicWireClassicRpcCensus.prototype);Object.freeze(CurrentSchematicWireClassicRpcCensus);
