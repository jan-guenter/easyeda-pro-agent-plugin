/** Descriptor metadata for the fixed original three-tuple batch graph. */
import { z } from "zod";
import { decodeCurrentFootprintCopyClockRpcV2Array as array } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import { currentSchematicRelevanceRawArrayLength as length, currentSchematicRelevanceRawHandle as object, currentSchematicRelevanceRawProperties as properties } from "./current-schematic-relevance-action-raw-replies.ts";
import type { CurrentSchematicRelevanceRawRemote as Remote } from "./current-schematic-relevance-action-raw-replies.ts";
import { CURRENT_SCHEMATIC_WIRE_CM_PUBLICATION_REQUESTS as LIMIT, validateCurrentSchematicWireCmPublicationCommand as validate } from "./current-schematic-wire-cm-publication-protocol.ts";
import type { CurrentSchematicWireCmPublicationCommand as Command } from "./current-schematic-wire-cm-publication-protocol.ts";

const internal = z.strictObject({ name: z.string(), value: z.unknown() });
const internals = z.strictObject({ result: z.array(z.unknown()).max(256), internalProperties: z.array(internal).max(2) });
function need(condition: boolean): asserts condition { if (!condition) { throw new Error("SCHEMATIC_WIRE_CM_PUBLICATION_CURSOR"); } }
export type CurrentSchematicWireCmPublicationFields = ReturnType<typeof properties>;
export function wireCmPublicationFieldValue(fields: CurrentSchematicWireCmPublicationFields, key: string): Remote { const row = fields.get(key); need(row?.value !== undefined && row.get === undefined && row.set === undefined); return row.value; }
export function wireCmPublicationRef(fields: CurrentSchematicWireCmPublicationFields, key: string, kind: "object" | "array" | "map" | "set" = "object"): string { const v = wireCmPublicationFieldValue(fields, key); need(v.type === "object" && (kind === "object" ? v.subtype === undefined : v.subtype === kind)); if (kind === "map" || kind === "set") { need(v.className === (kind === "map" ? "Map" : "Set")); } return object(v, "object"); }
function props(objectId: string): Command { return validate({ phase: "wire-cm-publication-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }); }
export class CurrentSchematicWireCmPublicationCensus {
  readonly #maximum: 32;
  public readonly approved: string[] = []; readonly #cache = new Map<string, CurrentSchematicWireCmPublicationFields>();
  public constructor(maximum: 32) { this.#maximum = maximum; }
  public *read(id: string, kind: "object" | "array" | "map" | "set" = "object"): Generator<Command, CurrentSchematicWireCmPublicationFields, unknown> {
    const old = this.#cache.get(id); if (old !== undefined) { return old; }
    need(this.#cache.size < this.#maximum); const raw: unknown = yield props(id); const parsed = internals.parse(raw); const fields = properties(raw);
    const names = parsed.internalProperties.map(row => row.name);
    need(names.length === (kind === "map" || kind === "set" ? 2 : 1) && names.includes("[[Prototype]]") && (names.length !== 2 || names.includes("[[Entries]]")));
    if (kind === "array") { array(raw, length(raw, 0, LIMIT.approvedSlots)); }
    this.#cache.set(id, fields); this.approved.push(id); need(this.approved.length <= LIMIT.approvedSlots); return fields;
  }
  public *array(id: string, count: number): Generator<Command, CurrentSchematicWireCmPublicationFields, unknown> { const fields = yield* this.read(id, "array"); need(fields.size === count + 1 && wireCmPublicationFieldValue(fields, "length").value === count); return fields; }
  public *field(fields: CurrentSchematicWireCmPublicationFields, key: string, kind: "object" | "array" | "map" | "set" = "object"): Generator<Command, CurrentSchematicWireCmPublicationFields, unknown> { return yield* this.read(wireCmPublicationRef(fields, key, kind), kind); }
}