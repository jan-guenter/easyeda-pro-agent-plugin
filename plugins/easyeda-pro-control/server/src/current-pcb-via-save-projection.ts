/** Late body authority for the held original main request. Public JSON cannot
 * issue it; selected SQL remains owned and separately fenced by native custody. */
import { canonicalJson } from "./core.ts";
import { assertOriginalCurrentPcbViaWriteOwner, requireOriginalCurrentPcbViaWriteEffect } from "./current-pcb-diagnostic-owner.ts";
import type { CurrentPcbViaWriteEffect } from "./current-pcb-via-write-effect.ts";
import type { CurrentPcbViaWriteOwner } from "./current-pcb-via-write-owner.ts";
import { requireOriginalCurrentPcbViaWritePlan } from "./current-pcb-via-write-plan.ts";
import type { CurrentPcbViaWritePlan } from "./current-pcb-via-write-plan.ts";
import { requireOriginalCurrentPcbViaSaveBody } from "./current-pcb-via-save-observer.ts";
import type { CurrentPcbViaSaveBodyObservation } from "./current-pcb-via-save-observer.ts";
import { requireOriginalCurrentPcbViaClockBodyJoin } from "./current-pcb-via-clock-observer.ts";
import type { CurrentPcbViaClockBodyJoin } from "./current-pcb-via-clock-observer.ts";
import { compareCurrentPcbViaSaveDelta } from "./current-pcb-via-save-delta.ts";
import type { CurrentPcbViaSaveDelta } from "./current-pcb-via-save-delta.ts";

export interface CurrentPcbViaSaveProjection {
  readonly schema: "private.current-pcb-via-save-projection.v1"; readonly bodySha256: string; readonly primitiveId: string;
  readonly exactOriginalUniqueIdDeltaVerified: true; readonly originalClockBodyJoinVerified: true;
  readonly selectedSqlAuthorized: false; readonly persistenceVerified: false;
}
interface Original { readonly owner: CurrentPcbViaWriteOwner; readonly plan: CurrentPcbViaWritePlan; readonly effect: CurrentPcbViaWriteEffect;
  readonly body: CurrentPcbViaSaveBodyObservation; readonly clock: CurrentPcbViaClockBodyJoin; readonly delta: CurrentPcbViaSaveDelta; readonly text: string }
const issued = new WeakMap<CurrentPcbViaSaveProjection, Original>(); const attempted = new WeakSet<CurrentPcbViaWriteOwner>();
function need(value: boolean): asserts value { if (!value) { throw new Error("PCB_VIA_SAVE_ORIGINAL_PROJECTION"); } }
async function current(original: Omit<Original, "delta" | "text">): Promise<void> {
  assertOriginalCurrentPcbViaWriteOwner(original.owner); requireOriginalCurrentPcbViaWritePlan(original.plan);
  requireOriginalCurrentPcbViaWriteEffect(original.effect, original.owner, original.plan);
  await requireOriginalCurrentPcbViaSaveBody(original.body, original.owner, original.plan);
  await requireOriginalCurrentPcbViaClockBodyJoin(original.clock, original.body, original.owner, original.plan);
  requireOriginalCurrentPcbViaWriteEffect(original.effect, original.owner, original.plan); assertOriginalCurrentPcbViaWriteOwner(original.owner);
}
/** Consumes one original generation before any await. A failed projection or
 * lost continuation cannot mint a second body or resume the original request. */
export async function qualifyOriginalCurrentPcbViaSaveProjection(owner: CurrentPcbViaWriteOwner, plan: CurrentPcbViaWritePlan, effect: CurrentPcbViaWriteEffect,
  body: CurrentPcbViaSaveBodyObservation, clock: CurrentPcbViaClockBodyJoin): Promise<CurrentPcbViaSaveProjection> {
  assertOriginalCurrentPcbViaWriteOwner(owner); const original = requireOriginalCurrentPcbViaWritePlan(plan);
  requireOriginalCurrentPcbViaWriteEffect(effect, owner, plan); need(!attempted.has(owner)); attempted.add(owner);
  const input = Object.freeze({ owner, plan, effect, body, clock }); await current(input);
  const delta = compareCurrentPcbViaSaveDelta(plan, original.history, requireOriginalCurrentPcbViaWriteEffect(effect, owner, plan), body.value);
  need(delta.bodySha256 === body.bodySha256); await current(input);
  const token: CurrentPcbViaSaveProjection = Object.freeze({ schema: "private.current-pcb-via-save-projection.v1", bodySha256: delta.bodySha256, primitiveId: delta.primitiveId,
    exactOriginalUniqueIdDeltaVerified: true, originalClockBodyJoinVerified: true, selectedSqlAuthorized: false, persistenceVerified: false });
  issued.set(token, Object.freeze({ ...input, delta, text: canonicalJson(token) })); return token;
}
export async function requireOriginalCurrentPcbViaSaveProjection(token: CurrentPcbViaSaveProjection, owner: CurrentPcbViaWriteOwner,
  plan: CurrentPcbViaWritePlan): Promise<CurrentPcbViaSaveDelta> {
  const original = issued.get(token); need(original !== undefined && original.owner === owner && original.plan === plan && original.text === canonicalJson(token));
  await current(original); need(issued.get(token) === original); return original.delta;
}
