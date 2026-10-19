/** Internal SCH-only intention. Membership and owner identity must later be
 * bound to original closed SQL; this schema grants no opening, closure or edit. */
import { types } from "node:util";
import { z } from "zod";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const target = z.object({ projectUuid: z.string().regex(/^[a-f0-9]{64}$/u), branchUuid: z.string().regex(/^[a-f0-9]{32}$/u),
  ownerUuid: z.string().regex(/^[a-f0-9]{32}$/u), schematicUuid: z.string().regex(/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u) }).strict();
export const currentSchematicRenameOwnerRequestSchema = z.object({ operationId: z.string().regex(/^[A-Za-z0-9._:-]{1,160}$/u),
  // Native locale folding is not qualified for non-ASCII or capital I. Match
  // The later immutable binding's supported subset before consuming an owner.
  target, desiredTitle: z.string().min(1).max(512).refine(value => value.trim() === value && /^[\u0020-\u007E]+$/u.test(value) && !value.includes("I")) }).strict();
export type CurrentSchematicRenameOwnerIntent = Readonly<Omit<z.infer<typeof currentSchematicRenameOwnerRequestSchema>, "operationId">>;

function own(value: unknown, fields: readonly string[]): Record<string, unknown> {
  if (value !== null && typeof value === "object" && types.isProxy(value)) { throw new Error("Current SCH owner refuses Proxy input."); }
  const prototype: unknown = value === null || typeof value !== "object" ? undefined : Object.getPrototypeOf(value);
  if (value === null || typeof value !== "object" || Array.isArray(value) ||
    prototype !== Object.prototype && prototype !== null || Reflect.ownKeys(value).length !== fields.length) {
    throw new Error("Current SCH opening owner requires exact own-data fields.");
  }
  const result: Record<string, unknown> = {};
  for (const name of fields) {
    const field = Object.getOwnPropertyDescriptor(value, name);
    if (field === undefined || !Object.hasOwn(field, "value")) { throw new Error("Current SCH opening owner refuses accessors or missing fields."); }
    result[name] = field.value as unknown;
  }
  return result;
}
export function parseCurrentSchematicRenameOwnerRequest(input: unknown): Readonly<z.infer<typeof currentSchematicRenameOwnerRequestSchema>> {
  const value = own(input, ["operationId", "target", "desiredTitle"]);
  return freezeDeep(currentSchematicRenameOwnerRequestSchema.parse({ ...value,
    target: own(value["target"], ["projectUuid", "branchUuid", "ownerUuid", "schematicUuid"]) }));
}
