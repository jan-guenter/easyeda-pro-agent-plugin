/** Retains actual original Wire stage references and their exact projections.
 * This controller has no dispatch method, callback injection or Save route. */
import { canonicalJson } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { assertOriginalCurrentSchematicWireEditOwner, originalCurrentSchematicWireEditTarget, requireOriginalSchematicWireEditStage } from "./current-schematic-wire-edit-owner.ts";
import type { CurrentSchematicWireEditOwner } from "./current-schematic-wire-edit-owner.ts";
import { requireOriginalCurrentSchematicWireEditPlan } from "./current-schematic-wire-edit-plan.ts";
import type { CurrentSchematicWireEditPlan } from "./current-schematic-wire-edit-plan.ts";
import { qualifyOriginalGeneratedSchematicWireEffect, requireOriginalGeneratedSchematicWireEffect } from "./generated-schematic-wire-native-effect.ts";
import type { GeneratedSchematicWireNativeEffect } from "./generated-schematic-wire-native-effect.ts";
import type { GeneratedSchematicWireEditStageResult } from "./generated-schematic-wire-lifecycle-effect.ts";
import { compareGeneratedSchematicWirePendingSaveDelta } from "./generated-schematic-wire-save-delta.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_WIRE_PROOF_ORIGINAL_CONTROLLER"); } }
const controllers = new WeakSet<CurrentSchematicWireEditOwner>();
export class CurrentSchematicWireProofController {
  readonly #owner: CurrentSchematicWireEditOwner; readonly #plan: CurrentSchematicWireEditPlan;
  readonly #original: ReturnType<typeof requireOriginalCurrentSchematicWireEditPlan>;
  #effectAttempted = false; #effect: GeneratedSchematicWireNativeEffect | null = null;
  #saveProjection: ReturnType<typeof compareGeneratedSchematicWirePendingSaveDelta> | null = null;
  public constructor(owner: CurrentSchematicWireEditOwner, plan: CurrentSchematicWireEditPlan) {
    assertOriginalCurrentSchematicWireEditOwner(owner); const original = requireOriginalCurrentSchematicWireEditPlan(plan);
    need(originalCurrentSchematicWireEditTarget(owner) === original.prepared && !controllers.has(owner)); controllers.add(owner);
    this.#owner = owner; this.#plan = plan; this.#original = original; Object.freeze(this);
  }
  #current(): void {
    assertOriginalCurrentSchematicWireEditOwner(this.#owner);
    need(requireOriginalCurrentSchematicWireEditPlan(this.#plan) === this.#original && originalCurrentSchematicWireEditTarget(this.#owner) === this.#original.prepared);
    if (this.#effect !== null) { requireOriginalGeneratedSchematicWireEffect(this.#effect, this.#owner, this.#original.argumentsValue); }
  }
  /** Failure consumes issuance. Copying the result or replaying stage JSON
   * cannot replace the registered original native packet references. */
  public retainOriginalEffect(before: GeneratedSchematicWireEditStageResult, modified: GeneratedSchematicWireEditStageResult, observed: GeneratedSchematicWireEditStageResult): GeneratedSchematicWireNativeEffect {
    this.#current(); need(!this.#effectAttempted); this.#effectAttempted = true;
    const args = this.#original.argumentsValue;
    requireOriginalSchematicWireEditStage(this.#owner, args, before, "preflight"); requireOriginalSchematicWireEditStage(this.#owner, args, modified, "modify"); requireOriginalSchematicWireEditStage(this.#owner, args, observed, "observe");
    const effect = qualifyOriginalGeneratedSchematicWireEffect(this.#owner, args, before, modified, observed); this.#current(); this.#effect = effect; return effect;
  }
  /** Original effect plus inert pending-body relation only. Original pending,
   * clock, callback, worker and Main joins remain required before dispatch. */
  public comparePendingSaveData(input: unknown): Readonly<{
    schema: "private.current-schematic-wire-effect-save-data.v1"; delta: ReturnType<typeof compareGeneratedSchematicWirePendingSaveDelta>;
    originalEffectStagesJoined: true; originalPendingBodyClockJoined: false; selectedSqlAuthorized: false; saveAuthorized: false; persistenceVerified: false;
  }> {
    this.#current(); need(this.#effect !== null);
    const delta = compareGeneratedSchematicWirePendingSaveDelta(this.#original.argumentsValue, this.#original.prepared.history, captureCurrentPcbStringClockReply(input).value);
    need(this.#saveProjection === null || canonicalJson(delta) === canonicalJson(this.#saveProjection)); this.#saveProjection = delta; this.#current();
    return freezeDeep({ schema: "private.current-schematic-wire-effect-save-data.v1", delta, originalEffectStagesJoined: true, originalPendingBodyClockJoined: false,
      selectedSqlAuthorized: false, saveAuthorized: false, persistenceVerified: false });
  }
  public inspect(): Readonly<{
    profile: "private.current-schematic-wire-proof-controller-status.v1"; operationId: string; effectIssuanceAttempted: boolean;
    originalEffectStagesJoined: boolean; pendingSaveDataCompared: boolean; executionAuthorized: false; saveAuthorized: false; reopenedVerified: false;
  }> {
    this.#current(); return Object.freeze({ profile: "private.current-schematic-wire-proof-controller-status.v1", operationId: this.#plan.operationId,
      effectIssuanceAttempted: this.#effectAttempted, originalEffectStagesJoined: this.#effect !== null, pendingSaveDataCompared: this.#saveProjection !== null,
      executionAuthorized: false, saveAuthorized: false, reopenedVerified: false });
  }
}
