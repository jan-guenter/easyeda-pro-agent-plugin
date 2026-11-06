/** Original native observations and SDK acknowledgement qualify the local
 * projected effect. This is never an authority for selected SQLite writes. */
import { canonicalJson } from "./core.ts";
import { compareCurrentPcbViaProjectedEffect } from "./current-pcb-via-write-effect-data.ts";
import type { CurrentPcbViaProjectedEffect } from "./current-pcb-via-write-effect-data.ts";
import { requireOriginalCurrentPcbViaNativeObservation, requireOriginalCurrentPcbViaSceneObservation,
  requireOriginalCurrentPcbViaWriteStage } from "./current-pcb-via-write-owner.ts";
import type { CurrentPcbViaNativeObservation, CurrentPcbViaSceneObservation, CurrentPcbViaWriteOwner } from "./current-pcb-via-write-owner.ts";
import { requireOriginalCurrentPcbViaWritePlan } from "./current-pcb-via-write-plan.ts";
import type { CurrentPcbViaWritePlan } from "./current-pcb-via-write-plan.ts";
import type { CurrentPcbViaWriteStageResult } from "./current-pcb-via-write-contract.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export interface CurrentPcbViaWriteEffect {
  readonly schema: "private.current-pcb-via-write-effect.v1";
  readonly proof: CurrentPcbViaProjectedEffect;
}
export interface CurrentPcbViaWriteEffectObservations {
  readonly before: CurrentPcbViaNativeObservation; readonly after: CurrentPcbViaNativeObservation;
  readonly beforeScene: CurrentPcbViaSceneObservation; readonly afterScene: CurrentPcbViaSceneObservation;
  readonly createAcknowledgement: CurrentPcbViaWriteStageResult;
}
interface Original { readonly owner: CurrentPcbViaWriteOwner; readonly plan: CurrentPcbViaWritePlan;
  readonly observations: CurrentPcbViaWriteEffectObservations; readonly text: string }
const issued = new WeakMap<CurrentPcbViaWriteEffect, Original>();
const generations = new WeakMap<CurrentPcbViaWriteOwner, CurrentPcbViaWriteEffect>();
function compare(owner: CurrentPcbViaWriteOwner, plan: CurrentPcbViaWritePlan, observations: CurrentPcbViaWriteEffectObservations): CurrentPcbViaProjectedEffect {
  const original = requireOriginalCurrentPcbViaWritePlan(plan);
  return compareCurrentPcbViaProjectedEffect(plan, original.history,
    requireOriginalCurrentPcbViaNativeObservation(owner, plan, observations.before, "before"),
    requireOriginalCurrentPcbViaNativeObservation(owner, plan, observations.after, "after"),
    requireOriginalCurrentPcbViaSceneObservation(owner, plan, observations.beforeScene, "before"),
    requireOriginalCurrentPcbViaSceneObservation(owner, plan, observations.afterScene, "after"),
    requireOriginalCurrentPcbViaWriteStage(owner, plan, observations.createAcknowledgement, "create"));
}
/** Exactly one effect is issued for one genuine native generation. It joins
 * live original objects, never a serialized stage result or facade receipt. */
export function qualifyOriginalCurrentPcbViaWriteEffect(owner: CurrentPcbViaWriteOwner, plan: CurrentPcbViaWritePlan,
  observations: CurrentPcbViaWriteEffectObservations): CurrentPcbViaWriteEffect {
  if (generations.has(owner)) { throw new Error("PCB_VIA_EFFECT_ALREADY_ISSUED"); }
  const proof = compare(owner, plan, observations); const effect = freezeDeep({ schema: "private.current-pcb-via-write-effect.v1", proof } as const);
  issued.set(effect, Object.freeze({ owner, plan, observations: Object.freeze({ ...observations }), text: canonicalJson(effect) }));
  generations.set(owner, effect); return effect;
}
/** The native owner's single Save entry uses this exact token and rechecks
 * every original packet and create ACK. It supplies no SQL resume slot. */
export function requireOriginalCurrentPcbViaWriteEffect(effect: CurrentPcbViaWriteEffect, owner: CurrentPcbViaWriteOwner,
  plan: CurrentPcbViaWritePlan): CurrentPcbViaProjectedEffect {
  const original = issued.get(effect);
  if (original === undefined || original.owner !== owner || original.plan !== plan || generations.get(owner) !== effect ||
      canonicalJson(effect) !== original.text) { throw new Error("PCB_VIA_ORIGINAL_EFFECT"); }
  if (canonicalJson(compare(owner, plan, original.observations)) !== canonicalJson(effect.proof)) { throw new Error("PCB_VIA_EFFECT_CHANGED"); }
  return effect.proof;
}
