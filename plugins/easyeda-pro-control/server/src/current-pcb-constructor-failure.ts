/** Fixed selector labels only. No raw exception, owner value, design data or
 * remote handle can enter this branded diagnostic record. */
import { z } from "zod";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const currentPcbConstructorFailureSchema = z.object({
  schema: z.literal("easyeda-pro-control.pcb-constructor-failure.v1"),
  bundle: z.enum(["diagnostic", "precreate", "common"]),
  profile: z.enum(["kde", "Sfe", "mpe", "Yde", "HSe", "USe", "Yme", "Nfe", "Epe", "GSe",
    "Jse", "Lpe", "Kme", "fpe", "P1e", "mge", "tge", "$me", "Spe", "Ume", "cge", "Tfe", "Qme", "jde"]).nullable(),
  stage: z.enum(["callback", "scope", "owner", "constructor", "metadata", "statics", "reproof", "decode", "tuple"]),
  reason: z.enum(["own", "object", "function", "name", "arity", "prototype", "static", "callback", "count", "instance", "target", "shadow", "unexpected", "reply", "location", "scopes"]),
}).strict();
export type CurrentPcbConstructorFailure = Readonly<z.infer<typeof currentPcbConstructorFailureSchema>>;
const failures = new WeakMap<object, CurrentPcbConstructorFailure>();
export function currentPcbConstructorFailure(input: CurrentPcbConstructorFailure): Error {
  const detail = freezeDeep(currentPcbConstructorFailureSchema.parse(input));
  const error = new Error(`PCB_CONSTRUCTOR_SCOPE_${detail.bundle.toUpperCase()}_${(detail.profile ?? "none").toUpperCase()}_${detail.stage.toUpperCase()}_${detail.reason.toUpperCase()}`);
  failures.set(error, detail); return error;
}
export function currentPcbConstructorFailureDetail(error: unknown): CurrentPcbConstructorFailure | null {
  return error !== null && typeof error === "object" ? failures.get(error) ?? null : null;
}
