/** Internal PCB-only intention. This schema grants no opening, closure or edit. */
import { z } from "zod";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const target = z.object({ projectUuid: z.string().regex(/^[a-f0-9]{64}$/u), branchUuid: z.string().regex(/^[a-f0-9]{32}$/u),
  ownerUuid: z.string().regex(/^[a-f0-9]{32}$/u), pcbUuid: z.string().regex(/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u) }).strict();
export const currentPcbRenameOwnerRequestSchema = z.object({ operationId: z.string().regex(/^[A-Za-z0-9._:-]{1,160}$/u),
  // Native locale folding is not qualified for non-ASCII or capital I. Match
  // The later immutable binding's supported subset before consuming an owner.
  target, desiredTitle: z.string().min(1).max(512).refine(value => value.trim() === value && /^[\u0020-\u007E]+$/u.test(value) && !value.includes("I")) }).strict();
export type CurrentPcbRenameOwnerIntent = Readonly<Omit<z.infer<typeof currentPcbRenameOwnerRequestSchema>, "operationId">>;

function own(value: unknown, fields: readonly string[]): Record<string, unknown> {
  const prototype: unknown = value === null || typeof value !== "object" ? undefined : Object.getPrototypeOf(value);
  if (value === null || typeof value !== "object" || Array.isArray(value) ||
    prototype !== Object.prototype && prototype !== null || Reflect.ownKeys(value).length !== fields.length) {
    throw new Error("Current PCB opening owner requires exact own-data fields.");
  }
  const result: Record<string, unknown> = {};
  for (const name of fields) {
    const field = Object.getOwnPropertyDescriptor(value, name);
    if (field === undefined || !Object.hasOwn(field, "value")) { throw new Error("Current PCB opening owner refuses accessors or missing fields."); }
    result[name] = field.value as unknown;
  }
  return result;
}
export function parseCurrentPcbRenameOwnerRequest(input: unknown): Readonly<z.infer<typeof currentPcbRenameOwnerRequestSchema>> {
  const value = own(input, ["operationId", "target", "desiredTitle"]);
  return freezeDeep(currentPcbRenameOwnerRequestSchema.parse({ ...value,
    target: own(value["target"], ["projectUuid", "branchUuid", "ownerUuid", "pcbUuid"]) }));
}
