/** Inert metadata decoders for newly encountered original reference callees.
 * Runtime custody and readiness/completion issuance remain private in Core. */
import { z } from "zod";
import { captureCurrentFootprintInverseDeleteBindingReply as capture } from "./current-footprint-inverse-delete-binding-capture.ts";
import { decodeCurrentNativeFunctionMetadata } from "./current-native-function-metadata.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import type { CurrentFootprintInverseReferenceQueryKind } from "./current-footprint-inverse-reference-query-job.ts";

export const CURRENT_FOOTPRINT_INVERSE_REFERENCE_NATIVE_PROFILES = freezeDeep({
  values: { name: "values", arity: 1, constructor: false },
  filter: { name: "filter", arity: 1, constructor: false },
  map: { name: "map", arity: 1, constructor: false },
  forEach: { name: "forEach", arity: 1, constructor: false },
  species: { name: "get [Symbol.species]", arity: 0, constructor: false },
  shift: { name: "shift", arity: 0, constructor: false },
  test: { name: "test", arity: 1, constructor: false },
  exec: { name: "exec", arity: 1, constructor: false },
} as const);
export type CurrentFootprintInverseReferenceNativeRole = keyof typeof CURRENT_FOOTPRINT_INVERSE_REFERENCE_NATIVE_PROFILES;
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
function need(value: boolean): asserts value { if (!value) { throw new Error("FOOTPRINT_INVERSE_REFERENCE_WORKER_METADATA"); } }
export function currentFootprintInverseReferenceNativeCallable(input: unknown, role: CurrentFootprintInverseReferenceNativeRole): string {
  const expected = CURRENT_FOOTPRINT_INVERSE_REFERENCE_NATIVE_PROFILES[role];
  const value = z.strictObject({ type: z.literal("function"), className: z.literal("Function"), description: z.literal(`function ${expected.name}() { [native code] }`), objectId: handle }).parse(capture(input));
  return value.objectId;
}
export function qualifyCurrentFootprintInverseReferenceNativeFunction(input: unknown, role: CurrentFootprintInverseReferenceNativeRole): void {
  decodeCurrentNativeFunctionMetadata(input, CURRENT_FOOTPRINT_INVERSE_REFERENCE_NATIVE_PROFILES[role]);
}
const scope = z.strictObject({ type: z.literal("object"), subtype: z.literal("internal#scope"), className: z.literal("Object"), description: z.string().max(128), objectId: handle });
const property = z.strictObject({ name: z.string(), value: scope, writable: z.literal(true), configurable: z.literal(true), enumerable: z.literal(true), isOwn: z.literal(true) });
export function currentFootprintInverseReferenceHandlerScope(input: unknown, kind: CurrentFootprintInverseReferenceQueryKind): string {
  const rows = z.strictObject({ result: z.array(property).min(3).max(4) }).parse(capture(input)).result;
  let registrar = "cP";
  if (kind === "pcb-all") { registrar = "hP"; } else if (kind === "device-all") { registrar = "aP"; }
  const labels = rows.length === 4 ? [`Closure (${registrar})`, "Closure", "Script", "Global"] : [`Closure (${registrar})`, "Closure", "Global"];
  const ids = new Set<string>();
  for (const [index, row] of rows.entries()) { need(row.name === String(index) && row.value.description === labels[index] && !ids.has(row.value.objectId)); ids.add(row.value.objectId); }
  const first = rows[0]; need(first !== undefined); return first.value.objectId;
}
