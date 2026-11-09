/** Retains actual original Wire stage references and their exact projections.
 * Metadata dispatch has its own original origin; no mutation or Save runs. */
/* oxlint-disable import/max-dependencies -- Original owner, plan, effect and each independently issued observation keep separate provenance. */
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
import { CurrentSchematicWireAccessorObserver, requireOriginalCurrentSchematicWireAccessorObservation } from "./current-schematic-wire-accessor-observer.ts";
import type { CurrentSchematicWireAccessorObservation, CurrentSchematicWireAccessorOrigin } from "./current-schematic-wire-accessor-observer.ts";
import { CurrentSchematicWireLexicalObserver, requireOriginalCurrentSchematicWireLexicalObservation } from "./current-schematic-wire-lexical-observer.ts";
import type { CurrentSchematicWireLexicalObservation, CurrentSchematicWireLexicalOrigin, CurrentSchematicWireLexicalValues } from "./current-schematic-wire-lexical-observer.ts";

import { CurrentSchematicWireIntentObserver, requireOriginalCurrentSchematicWireIntentObservation } from "./current-schematic-wire-intent-observer.ts";
import type { CurrentSchematicWireIntentObservation, CurrentSchematicWireIntentOrigin, CurrentSchematicWireIntentValues } from "./current-schematic-wire-intent-observer.ts";

function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_WIRE_PROOF_ORIGINAL_CONTROLLER"); } }
const controllers = new WeakSet<CurrentSchematicWireEditOwner>();
export class CurrentSchematicWireProofController {
  readonly #owner: CurrentSchematicWireEditOwner; readonly #plan: CurrentSchematicWireEditPlan;
  readonly #original: ReturnType<typeof requireOriginalCurrentSchematicWireEditPlan>;
  #effectAttempted = false; #effect: GeneratedSchematicWireNativeEffect | null = null;
  #retirementStarted = false;
  #saveProjection: ReturnType<typeof compareGeneratedSchematicWirePendingSaveDelta> | null = null;
  #accessorTask: Promise<CurrentSchematicWireAccessorObservation> | null = null;
  #accessorOrigin: CurrentSchematicWireAccessorOrigin | null = null; #accessor: CurrentSchematicWireAccessorObserver | null = null;
  #accessorObservation: CurrentSchematicWireAccessorObservation | null = null; #accessorFailed = false; #accessorSettled = false; #accessorRetired = false;
  #lexicalTask: Promise<CurrentSchematicWireLexicalObservation> | null = null; #lexical: CurrentSchematicWireLexicalObserver | null = null;
  #lexicalOrigin: CurrentSchematicWireLexicalOrigin | null = null; #lexicalObservation: CurrentSchematicWireLexicalObservation | null = null;
  #lexicalFailed = false; #lexicalSettled = false; #lexicalRetired = false;
  #intentTask: Promise<CurrentSchematicWireIntentObservation> | null = null; #intent: CurrentSchematicWireIntentObserver | null = null;
  #intentOrigin: CurrentSchematicWireIntentOrigin | null = null; #intentObservation: CurrentSchematicWireIntentObservation | null = null;
  #intentFailed = false; #intentSettled = false; #intentRetired = false;
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
  /** One original readonly metadata attempt, retaining the exact Promise on
   * failure. This cannot generate a Modify entry or issue callback authority. */
  public observeOriginalAccessors(): Promise<CurrentSchematicWireAccessorObservation> {
    this.#current(); if (this.#accessorTask !== null) { return this.#accessorTask; }
    need(!this.#retirementStarted);
    const pending = (async (): Promise<CurrentSchematicWireAccessorObservation> => {
      try {
        const origin = await this.#owner.createSchematicWireAccessorOrigin(this.#original.argumentsValue); this.#current(); this.#accessorOrigin = origin;
        const observer = new CurrentSchematicWireAccessorObserver(origin, this.#owner, this.#original.argumentsValue); this.#accessor = observer;
        const packet = await observer.observe(); this.#current(); requireOriginalCurrentSchematicWireAccessorObservation(packet, origin, this.#owner, this.#original.argumentsValue);
        this.#accessorObservation = packet; return packet;
      } catch (error) { this.#accessorFailed = true; throw error; } finally { this.#accessorSettled = true; }
    })(); this.#accessorTask = pending; return pending;
  }
  public requireOriginalAccessorFunctions(): ReturnType<typeof requireOriginalCurrentSchematicWireAccessorObservation> {
    this.#current(); need(this.#accessorObservation !== null && this.#accessorOrigin !== null && this.#accessorSettled && !this.#accessorFailed && !this.#accessorRetired);
    return requireOriginalCurrentSchematicWireAccessorObservation(this.#accessorObservation, this.#accessorOrigin, this.#owner, this.#original.argumentsValue);
  }
  /** The existing original accessor observation supplies the only permitted
   * scope selectors. Failure remains attached to this same original Promise. */
  public observeOriginalLexicalOperands(): Promise<CurrentSchematicWireLexicalObservation> {
    this.#current(); if (this.#lexicalTask !== null) { return this.#lexicalTask; }
    need(!this.#retirementStarted);
    const pending = (async (): Promise<CurrentSchematicWireLexicalObservation> => {
      try {
        const packet = await this.observeOriginalAccessors(); this.#current(); need(this.#accessorOrigin !== null && packet === this.#accessorObservation);
        const origin = await this.#owner.createSchematicWireLexicalOrigin(this.#original.argumentsValue, this.#accessorOrigin, packet); this.#current(); this.#lexicalOrigin = origin;
        const observer = new CurrentSchematicWireLexicalObserver(origin, this.#owner, this.#original.argumentsValue); this.#lexical = observer;
        const observed = await observer.observe(); this.#current(); requireOriginalCurrentSchematicWireLexicalObservation(observed, origin, this.#owner, this.#original.argumentsValue);
        this.#lexicalObservation = observed; return observed;
      } catch (error) { this.#lexicalFailed = true; throw error; } finally { this.#lexicalSettled = true; }
    })(); this.#lexicalTask = pending; return pending;
  }
  public requireOriginalLexicalValues(): CurrentSchematicWireLexicalValues {
    this.#current(); need(this.#lexicalObservation !== null && this.#lexicalOrigin !== null && this.#lexicalSettled && !this.#lexicalFailed && !this.#lexicalRetired);
    return requireOriginalCurrentSchematicWireLexicalObservation(this.#lexicalObservation, this.#lexicalOrigin, this.#owner, this.#original.argumentsValue);
  }
  public observeOriginalIntent(): Promise<CurrentSchematicWireIntentObservation> {
    this.#current(); if (this.#intentTask !== null) { return this.#intentTask; }
    need(!this.#retirementStarted);
    const pending = (async (): Promise<CurrentSchematicWireIntentObservation> => {
      try {
        const packet = await this.observeOriginalLexicalOperands(); this.#current(); need(this.#lexicalOrigin !== null && packet === this.#lexicalObservation);
        const origin = await this.#owner.createSchematicWireIntentOrigin(this.#original.argumentsValue, this.#lexicalOrigin, packet); this.#current(); this.#intentOrigin = origin;
        const observer = new CurrentSchematicWireIntentObserver(origin, this.#owner, this.#original.argumentsValue); this.#intent = observer;
        const observed = await observer.observe(); this.#current(); requireOriginalCurrentSchematicWireIntentObservation(observed, origin, this.#owner, this.#original.argumentsValue);
        this.#intentObservation = observed; return observed;
      } catch (error) { this.#intentFailed = true; throw error; } finally { this.#intentSettled = true; }
    })(); this.#intentTask = pending; return pending;
  }
  public requireOriginalIntentValues(): CurrentSchematicWireIntentValues {
    this.#current(); need(this.#intentObservation !== null && this.#intentOrigin !== null && this.#intentSettled && !this.#intentFailed && !this.#intentRetired);
    return requireOriginalCurrentSchematicWireIntentObservation(this.#intentObservation, this.#intentOrigin, this.#owner, this.#original.argumentsValue);
  }
  /** Failure cleanup remains tied to this same original root/Job. A detached
   * metadata holder cannot transfer to another native generation. */
  public async retireAccessorsAfterOriginalExit(): Promise<void> {
    this.#current(); need(this.#accessor !== null && this.#accessorSettled && !this.#accessorRetired);
    need((this.#intentTask === null || this.#intentSettled) && (this.#lexicalTask === null || this.#lexicalSettled));
    this.#retirementStarted = true;
    if (this.#intent !== null && !this.#intentRetired) { need(this.#intentSettled); await this.#intent.retireAfterOriginalExit(); this.#current(); this.#intentRetired = true; }
    if (this.#lexical !== null && !this.#lexicalRetired) { need(this.#lexicalSettled); await this.#lexical.retireAfterOriginalExit(); this.#current(); this.#lexicalRetired = true; }
    await this.#accessor.retireAfterOriginalExit(); this.#current(); this.#accessorRetired = true;
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
  public inspectAccessors(): Readonly<{
    profile: "private.current-schematic-wire-accessor-controller-status.v1"; operationId: string;
    started: boolean; settled: boolean; failed: boolean; originalFunctionsQualified: boolean; retiredAfterOriginalExit: boolean;
    originalLexicalOperandsJoined: false; executionAuthorized: false; saveAuthorized: false;
  }> {
    this.#current(); return Object.freeze({ profile: "private.current-schematic-wire-accessor-controller-status.v1", operationId: this.#plan.operationId,
      started: this.#accessorTask !== null, settled: this.#accessorSettled, failed: this.#accessorFailed, originalFunctionsQualified: this.#accessorObservation !== null,
      retiredAfterOriginalExit: this.#accessorRetired, originalLexicalOperandsJoined: false, executionAuthorized: false, saveAuthorized: false });
  }
  public inspectLexical(): Readonly<{
    profile: "private.current-schematic-wire-lexical-controller-status.v1"; operationId: string;
    started: boolean; settled: boolean; failed: boolean; originalOperandsQualified: boolean; retiredAfterOriginalExit: boolean;
    liveContinuationAuthorized: false; executionAuthorized: false; saveAuthorized: false;
  }> {
    this.#current(); return Object.freeze({ profile: "private.current-schematic-wire-lexical-controller-status.v1", operationId: this.#plan.operationId,
      started: this.#lexicalTask !== null, settled: this.#lexicalSettled, failed: this.#lexicalFailed, originalOperandsQualified: this.#lexicalObservation !== null,
      retiredAfterOriginalExit: this.#lexicalRetired, liveContinuationAuthorized: false, executionAuthorized: false, saveAuthorized: false });
  }
}
