/** Source-allowed labels only, never exception messages, values or handles. */
import { z } from "zod";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const currentPcbTeardropFailureSchema = z.object({ schema: z.literal("easyeda-pro-control.pcb-teardrop-owner-failure.v1"),
  stage: z.enum(["callback", "registry", "tuple", "receiver", "target", "reproof", "bound-metadata", "target-metadata", "bound-arguments", "decode"]),
  topic: z.enum(["isMoveSwitch", "SetSuspend", "cheakTearDrop", "addModifyTeardrop", "flushTearDrop", "refreshTearDrop"]).nullable(),
  reason: z.enum(["own", "object", "count", "instance", "callback", "target", "receiver", "shadow", "prototype", "unexpected", "reply"]),
}).strict();
export type CurrentPcbTeardropFailure = Readonly<z.infer<typeof currentPcbTeardropFailureSchema>>;
const failures = new WeakMap<object, CurrentPcbTeardropFailure>();
export function currentPcbTeardropFailure(input: CurrentPcbTeardropFailure): Error {
  const detail = freezeDeep(currentPcbTeardropFailureSchema.parse(input));
  const error = new Error(`PCB_TEARDROP_OWNER_${detail.stage.toUpperCase().replaceAll("-", "_")}_${(detail.topic ?? "NONE").toUpperCase()}_${detail.reason.toUpperCase()}`);
  failures.set(error, detail); return error;
}
export function currentPcbTeardropFailureDetail(error: unknown): CurrentPcbTeardropFailure | null {
  return error !== null && typeof error === "object" ? failures.get(error) ?? null : null;
}
