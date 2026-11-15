/** Descriptor metadata for the fixed original original parser context graph. */
import { z } from "zod";
import { decodeCurrentFootprintCopyClockRpcV2Array as array } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import { currentSchematicRelevanceRawArrayLength as length, currentSchematicRelevanceRawHandle as object, currentSchematicRelevanceRawProperties as properties } from "./current-schematic-relevance-action-raw-replies.ts";
import type { CurrentSchematicRelevanceRawRemote as Remote } from "./current-schematic-relevance-action-raw-replies.ts";
import { CURRENT_SCHEMATIC_WIRE_PARSER_REQUESTS as LIMIT, validateCurrentSchematicWireParserCommand as validate } from "./current-schematic-wire-parser-protocol.ts";
import type { CurrentSchematicWireParserCommand as Command } from "./current-schematic-wire-parser-protocol.ts";

const internal = z.strictObject({ name: z.string(), value: z.unknown() });
const internals = z.strictObject({ result: z.array(z.unknown()).max(256), internalProperties: z.array(internal).max(2) });
function need(condition: boolean): asserts condition { if (!condition) { throw new Error("SCHEMATIC_WIRE_PARSER_CURSOR"); } }
export type CurrentSchematicWireParserFields = ReturnType<typeof properties>;
export function wireParserFieldValue(fields: CurrentSchematicWireParserFields, key: string): Remote { const row = fields.get(key); need(row?.value !== undefined && row.get === undefined && row.set === undefined); return row.value; }
export function wireParserRef(fields: CurrentSchematicWireParserFields, key: string, kind: "object" | "array" | "map" | "set" = "object"): string { const v = wireParserFieldValue(fields, key); need(v.type === "object" && (kind === "object" ? v.subtype === undefined : v.subtype === kind)); if (kind === "map" || kind === "set") { need(v.className === (kind === "map" ? "Map" : "Set")); } return object(v, "object"); }
function props(objectId: string): Command { return validate({ phase: "wire-parser-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }); }
export class CurrentSchematicWireParserCensus {
  readonly #maximum: 64;
  public readonly approved: string[] = []; readonly #cache = new Map<string, CurrentSchematicWireParserFields>();
  public constructor(maximum: 64) { this.#maximum = maximum; }
  public *read(id: string, kind: "object" | "array" | "map" | "set" = "object"): Generator<Command, CurrentSchematicWireParserFields, unknown> {
    const old = this.#cache.get(id); if (old !== undefined) { return old; }
    need(this.#cache.size < this.#maximum); const raw: unknown = yield props(id); const parsed = internals.parse(raw); const fields = properties(raw);
    const names = parsed.internalProperties.map(row => row.name);
    need(names.length === (kind === "map" || kind === "set" ? 2 : 1) && names.includes("[[Prototype]]") && (names.length !== 2 || names.includes("[[Entries]]")));
    if (kind === "array") { array(raw, length(raw, 0, LIMIT.approvedSlots)); }
    this.#cache.set(id, fields); this.approved.push(id); need(this.approved.length <= LIMIT.approvedSlots); return fields;
  }
  public *array(id: string, count: number): Generator<Command, CurrentSchematicWireParserFields, unknown> { const fields = yield* this.read(id, "array"); need(fields.size === count + 1 && wireParserFieldValue(fields, "length").value === count); return fields; }
  public *field(fields: CurrentSchematicWireParserFields, key: string, kind: "object" | "array" | "map" | "set" = "object"): Generator<Command, CurrentSchematicWireParserFields, unknown> { return yield* this.read(wireParserRef(fields, key, kind), kind); }
}
Object.freeze(CurrentSchematicWireParserCensus.prototype);Object.freeze(CurrentSchematicWireParserCensus);
