/** Offline SCH-container rename input only. No live preflight is registered. */
import { z } from "zod";

export const CURRENT_SCHEMATIC_RENAME_PREFLIGHT_MAX_BYTES = 524_288;
export const CURRENT_SCHEMATIC_RENAME_PREFLIGHT_MAX_PEERS = 4096;
const id = z.string().regex(/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u);
const integer = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER).refine(value => !Object.is(value, -0));
// Worker Ne1845057 may use locale lowercasing. This first preflight subset has
// No capital I or non-ASCII spelling, including unpaired UTF16 surrogates.
const title = z.string().min(1).max(512).refine(value => value.trim() === value && /^[\u0020-\u007E]+$/u.test(value) && !value.includes("I"),
  "locale-invariant printable ASCII without capital I required");
const targetSchema = z.object({ projectUuid: z.string().regex(/^[a-f0-9]{64}$/u), branchUuid: z.string().regex(/^[a-f0-9]{32}$/u),
  schematicUuid: id, ownerUuid: z.string().regex(/^[a-f0-9]{32}$/u) }).strict();
// Worker b849bd12 Dg.get at1911033 returns name/display_name, not PCB title,
// Parent or docType. Empty source/version/board native fallbacks cannot prove
// Their original values; the separate SQL projection requires exact strings.
export const currentSchematicRenamePeerSchema = z.object({ uuid: id, name: title, displayName: title, source: z.literal(""),
  version: z.string().min(1).max(128), boardUuid: z.union([z.literal(""), id]), ticket: integer,
  updateTime: integer.max(8_640_000_000_000_000) }).strict();
const beforeSchema = currentSchematicRenamePeerSchema.omit({ uuid: true });
export const currentSchematicRenamePreflightRequestSchema = z.object({ target: targetSchema, expectedBefore: beforeSchema, desiredTitle: title }).strict()
  .refine(value => value.expectedBefore.name === value.expectedBefore.displayName.toLowerCase() &&
    value.desiredTitle.toLowerCase() !== value.expectedBefore.name, "native name projection or normalized title change differs");
export type CurrentSchematicRenamePreflightRequest = z.infer<typeof currentSchematicRenamePreflightRequestSchema>;
export type CurrentSchematicRenamePeer = z.infer<typeof currentSchematicRenamePeerSchema>;

function fields(input: unknown, names: readonly string[]): Record<string, unknown> {
  if (input === null || typeof input !== "object" || Array.isArray(input) ||
    (Object.getPrototypeOf(input) !== Object.prototype && Object.getPrototypeOf(input) !== null) || Reflect.ownKeys(input).length !== names.length) {
    throw new Error("CURRENT_SCHEMATIC_RENAME_PREFLIGHT_SHAPE");
  }
  const result: Record<string, unknown> = {};
  for (const name of names) {
    const descriptor = Object.getOwnPropertyDescriptor(input, name);
    if (descriptor === undefined || !Object.hasOwn(descriptor, "value")) { throw new Error("CURRENT_SCHEMATIC_RENAME_PREFLIGHT_SHAPE"); }
    Object.defineProperty(result, name, { value: descriptor.value as unknown, enumerable: true });
  }
  return result;
}
/** Validating supplied data grants no native name, membership, process, clock,
 * subscriber-completion, persistence or execution claim. The separate internal
 * observer consumes this contract; no live tool or writer is registered.
 */
export function parseCurrentSchematicRenamePreflightRequest(input: unknown): CurrentSchematicRenamePreflightRequest {
  const value = fields(input, ["target", "expectedBefore", "desiredTitle"]);
  const result = currentSchematicRenamePreflightRequestSchema.parse({
    target: fields(value["target"], ["projectUuid", "branchUuid", "schematicUuid", "ownerUuid"]),
    expectedBefore: fields(value["expectedBefore"], ["name", "displayName", "source", "version", "boardUuid", "ticket", "updateTime"]),
    desiredTitle: value["desiredTitle"],
  });
  const encoded = JSON.stringify(result);
  if (Buffer.byteLength(encoded) > CURRENT_SCHEMATIC_RENAME_PREFLIGHT_MAX_BYTES) { throw new Error("CURRENT_SCHEMATIC_RENAME_PREFLIGHT_BOUND"); }
  Object.freeze(result.target); Object.freeze(result.expectedBefore); return Object.freeze(result);
}
