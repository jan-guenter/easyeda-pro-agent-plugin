/** Fixed labels from the raw-String reader, not vendor exceptions or authority. */
import { z } from "zod";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const currentPcbRawStringFailureSchema = z.object({
  schema: z.literal("easyeda-pro-control.pcb-raw-string-failure.v1"),
  stage: z.enum(["callback", "scope", "environment", "manager", "view-manager", "map", "models", "reproof", "serialize", "decode"]),
  reason: z.enum(["guard", "object", "own", "instance", "number", "flag", "text", "identifier", "map", "iterator", "unexpected", "reply"]),
}).strict();
export type CurrentPcbRawStringFailure = Readonly<z.infer<typeof currentPcbRawStringFailureSchema>>;
const failures = new WeakMap<object, CurrentPcbRawStringFailure>();

export function currentPcbRawStringFailure(input: CurrentPcbRawStringFailure): Error {
  const detail = freezeDeep(currentPcbRawStringFailureSchema.parse(input));
  const error = new Error(`PCB_DIAGNOSTIC_RAW_STRINGS_STATE_${detail.stage.toUpperCase().replaceAll("-", "_")}_${detail.reason.toUpperCase()}`);
  failures.set(error, detail); return error;
}
export function currentPcbRawStringFailureDetail(error: unknown): CurrentPcbRawStringFailure | null {
  return error !== null && typeof error === "object" ? failures.get(error) ?? null : null;
}
/** A CDP exception or malformed envelope says nothing about which leaf guard
 * ran. Preserve the stable reply error without retaining any vendor text. */
export function currentPcbRawStringReplyFailure(): Error {
  const error = new Error("PCB_DIAGNOSTIC_RAW_STRINGS_REPLY");
  failures.set(error, Object.freeze({ schema: "easyeda-pro-control.pcb-raw-string-failure.v1", stage: "decode", reason: "reply" }));
  return error;
}
