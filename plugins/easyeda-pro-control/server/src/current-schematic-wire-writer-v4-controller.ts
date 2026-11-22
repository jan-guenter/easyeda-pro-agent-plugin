/** Original v4 source checkpoint: one project open, capture/preflight and the
 * original readonly metadata pipeline. No Modify, Save or prior writer grant. */
import { assertOriginalCurrentSchematicWireWriterV4Owner, originalCurrentSchematicWireWriterV4Target } from "./current-schematic-wire-writer-v4-owner.ts";
import type { CurrentSchematicWireWriterV4Owner } from "./current-schematic-wire-writer-v4-owner.ts";
import { requireOriginalCurrentSchematicWireEditPlan } from "./current-schematic-wire-edit-plan.ts";
import type { CurrentSchematicWireEditPlan } from "./current-schematic-wire-edit-plan.ts";
import { CurrentSchematicWireAccessorObserver, requireOriginalCurrentSchematicWireAccessorObservation } from "./current-schematic-wire-accessor-observer.ts";
import type { CurrentSchematicWireAccessorObservation, CurrentSchematicWireAccessorOrigin } from "./current-schematic-wire-accessor-observer.ts";
import { CurrentSchematicWireLexicalObserver, requireOriginalCurrentSchematicWireLexicalObservation } from "./current-schematic-wire-lexical-observer.ts";
import type { CurrentSchematicWireLexicalObservation, CurrentSchematicWireLexicalOrigin, CurrentSchematicWireLexicalValues } from "./current-schematic-wire-lexical-observer.ts";

import { CurrentSchematicWireIntentObserver, requireOriginalCurrentSchematicWireIntentObservation } from "./current-schematic-wire-intent-observer.ts";
import type { CurrentSchematicWireIntentObservation, CurrentSchematicWireIntentOrigin, CurrentSchematicWireIntentValues } from "./current-schematic-wire-intent-observer.ts";

import { CurrentSchematicWireDependencyObserver, requireOriginalCurrentSchematicWireDependencyObservation } from "./current-schematic-wire-dependencies-observer.ts";
import type { CurrentSchematicWireDependencyObservation, CurrentSchematicWireDependencyOrigin } from "./current-schematic-wire-dependencies-observer.ts";
import type { CurrentSchematicWireDependencyValues } from "./current-schematic-wire-dependencies-cursor.ts";

import { requireOriginalSchematicWireWriterV4ReadStage, requireOriginalSchematicWireWriterV4RunGuard } from "./current-pcb-diagnostic-owner.ts";
import type { CurrentSchematicWireWriterStageResult } from "./current-schematic-wire-writer-programs.ts";
import type { CurrentSchematicWireWriterV4RunGuardObservation } from "./current-schematic-wire-writer-v4-run-guard.ts";

function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_WIRE_PROOF_ORIGINAL_CONTROLLER"); } }

const controllers = new WeakSet<CurrentSchematicWireWriterV4Owner>();
export class CurrentSchematicWireWriterV4Controller {
  readonly #owner: CurrentSchematicWireWriterV4Owner; readonly #plan: CurrentSchematicWireEditPlan;
  readonly #original: ReturnType<typeof requireOriginalCurrentSchematicWireEditPlan>;
  #retirementStarted = false;
  #runGuardTask: Promise<CurrentSchematicWireWriterV4RunGuardObservation> | null = null; #runGuard: CurrentSchematicWireWriterV4RunGuardObservation | null = null;
  #runGuardSettled = false; #runGuardFailed = false;
  #preflightTask: Promise<CurrentSchematicWireWriterStageResult> | null = null; #preflight: CurrentSchematicWireWriterStageResult | null = null;
  #preflightSettled = false; #preflightFailed = false;
  #accessorTask: Promise<CurrentSchematicWireAccessorObservation> | null = null;
  #accessorOrigin: CurrentSchematicWireAccessorOrigin | null = null; #accessor: CurrentSchematicWireAccessorObserver | null = null;
  #accessorObservation: CurrentSchematicWireAccessorObservation | null = null; #accessorFailed = false; #accessorSettled = false; #accessorRetired = false;
  #lexicalTask: Promise<CurrentSchematicWireLexicalObservation> | null = null; #lexical: CurrentSchematicWireLexicalObserver | null = null;
  #lexicalOrigin: CurrentSchematicWireLexicalOrigin | null = null; #lexicalObservation: CurrentSchematicWireLexicalObservation | null = null;
  #lexicalFailed = false; #lexicalSettled = false; #lexicalRetired = false;
  #intentTask: Promise<CurrentSchematicWireIntentObservation> | null = null; #intent: CurrentSchematicWireIntentObserver | null = null;
  #intentOrigin: CurrentSchematicWireIntentOrigin | null = null; #intentObservation: CurrentSchematicWireIntentObservation | null = null;
  #intentFailed = false; #intentSettled = false; #intentRetired = false;
  #dependencyTask: Promise<CurrentSchematicWireDependencyObservation> | null = null; #dependency: CurrentSchematicWireDependencyObserver | null = null;
  #dependencyOrigin: CurrentSchematicWireDependencyOrigin | null = null; #dependencyObservation: CurrentSchematicWireDependencyObservation | null = null;
  #dependencyFailed = false; #dependencySettled = false; #dependencyRetired = false;
  public constructor(owner: CurrentSchematicWireWriterV4Owner, plan: CurrentSchematicWireEditPlan) {
    assertOriginalCurrentSchematicWireWriterV4Owner(owner); const original = requireOriginalCurrentSchematicWireEditPlan(plan);
    need(originalCurrentSchematicWireWriterV4Target(owner) === original.prepared && !controllers.has(owner)); controllers.add(owner);
    this.#owner = owner; this.#plan = plan; this.#original = original; Object.freeze(this);
  }
  #current(): void {
    assertOriginalCurrentSchematicWireWriterV4Owner(this.#owner);
    need(requireOriginalCurrentSchematicWireEditPlan(this.#plan) === this.#original && originalCurrentSchematicWireWriterV4Target(this.#owner) === this.#original.prepared);
  }
  /** One original source preparation Promise includes every refusal. The
   * owner keeps its exact v3 packet; JSON cannot create or replace it. */
  public captureOriginalPreflight(): Promise<CurrentSchematicWireWriterStageResult> {
    this.#current(); if (this.#preflightTask !== null) { return this.#preflightTask; } need(!this.#retirementStarted);
    const pending = (async (): Promise<CurrentSchematicWireWriterStageResult> => {
      try {
        const args = this.#original.argumentsValue;
        await this.#owner.openGeneratedSchematicWireWriterV4(args); this.#current();
        await this.#owner.executeSchematicWireWriterV4ReadStage("capture", args); this.#current();
        const packet = await this.#owner.executeSchematicWireWriterV4ReadStage("preflight", args); this.#current();
        need("schema" in packet); requireOriginalSchematicWireWriterV4ReadStage(this.#owner, args, packet); this.#preflight = packet; return packet;
      } catch (error) { this.#preflightFailed = true; throw error; } finally { this.#preflightSettled = true; }
    })(); this.#preflightTask = pending; return pending;
  }
  /** One original readonly metadata attempt, retaining the exact Promise on
   * failure. This cannot generate a Modify entry or issue callback authority. */
  public observeOriginalAccessors(): Promise<CurrentSchematicWireAccessorObservation> {
    this.#current(); if (this.#accessorTask !== null) { return this.#accessorTask; }
    need(!this.#retirementStarted);
    const pending = (async (): Promise<CurrentSchematicWireAccessorObservation> => {
      try {
        await this.captureOriginalPreflight(); this.#current();
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
  /** Real native dependencies follow this controller's original intent;
   * neither copied packets nor caller-provided function handles can select it. */
  public observeOriginalDependencies(): Promise<CurrentSchematicWireDependencyObservation> {
    this.#current(); if (this.#dependencyTask !== null) { return this.#dependencyTask; }
    need(!this.#retirementStarted);
    const pending = (async (): Promise<CurrentSchematicWireDependencyObservation> => {
      try {
        const packet = await this.observeOriginalIntent(); this.#current(); need(this.#intentOrigin !== null && packet === this.#intentObservation);
        const origin = await this.#owner.createSchematicWireDependencyOrigin(this.#original.argumentsValue, this.#intentOrigin, packet); this.#current(); this.#dependencyOrigin = origin;
        const observer = new CurrentSchematicWireDependencyObserver(origin, this.#owner, this.#original.argumentsValue); this.#dependency = observer;
        const observed = await observer.observe(); this.#current(); requireOriginalCurrentSchematicWireDependencyObservation(observed, origin, this.#owner, this.#original.argumentsValue);
        this.#dependencyObservation = observed; return observed;
      } catch (error) { this.#dependencyFailed = true; throw error; } finally { this.#dependencySettled = true; }
    })(); this.#dependencyTask = pending; return pending;
  }
  /** Prepare one original refusal-only run point after the entire metadata
   * chain. Its retained Promise cannot be retried or turned into a resume. */
  public armOriginalRunGuard(): Promise<CurrentSchematicWireWriterV4RunGuardObservation> {
    this.#current(); if (this.#runGuardTask !== null) { return this.#runGuardTask; } need(!this.#retirementStarted);
    const pending = (async (): Promise<CurrentSchematicWireWriterV4RunGuardObservation> => {
      try {
        const packet = await this.observeOriginalDependencies(); this.#current();
        need(this.#dependencyOrigin !== null && packet === this.#dependencyObservation);
        const guard = await this.#owner.armSchematicWireWriterV4RunGuard(this.#original.argumentsValue, this.#dependencyOrigin, packet); this.#current();
        requireOriginalSchematicWireWriterV4RunGuard(this.#owner, this.#original.argumentsValue, guard); this.#runGuard = guard; return guard;
      } catch (error) { this.#runGuardFailed = true; throw error; } finally { this.#runGuardSettled = true; }
    })(); this.#runGuardTask = pending; return pending;
  }
  public requireOriginalDependencyValues(): CurrentSchematicWireDependencyValues {
    this.#current(); need(this.#dependencyObservation !== null && this.#dependencyOrigin !== null && this.#dependencySettled && !this.#dependencyFailed && !this.#dependencyRetired);
    return requireOriginalCurrentSchematicWireDependencyObservation(this.#dependencyObservation, this.#dependencyOrigin, this.#owner, this.#original.argumentsValue);
  }
  public inspectDependencies(): Readonly<{
    profile: "private.current-schematic-wire-writer-v4-dependency-controller-status.v1"; operationId: string;
    started: boolean; settled: boolean; failed: boolean; originalDependenciesQualified: boolean; retiredAfterOriginalExit: boolean;
    originalSetLinesInvocationJoined: false; bboxCompletionVerified: false; executionAuthorized: false; saveAuthorized: false;
  }> {
    this.#current(); return Object.freeze({ profile: "private.current-schematic-wire-writer-v4-dependency-controller-status.v1", operationId: this.#plan.operationId,
      started: this.#dependencyTask !== null, settled: this.#dependencySettled, failed: this.#dependencyFailed, originalDependenciesQualified: this.#dependencyObservation !== null,
      retiredAfterOriginalExit: this.#dependencyRetired, originalSetLinesInvocationJoined: false, bboxCompletionVerified: false, executionAuthorized: false, saveAuthorized: false });
  }
  /** Failure cleanup remains tied to this same original root/Job. A detached
   * metadata holder cannot transfer to another native generation. */
  public async retireAccessorsAfterOriginalExit(): Promise<void> {
    this.#current(); need(this.#accessor !== null && this.#accessorSettled && !this.#accessorRetired);
    need((this.#dependencyTask === null || this.#dependencySettled) && (this.#intentTask === null || this.#intentSettled) && (this.#lexicalTask === null || this.#lexicalSettled));
    need(this.#runGuardTask === null || this.#runGuardSettled);
    this.#retirementStarted = true;
    if (this.#dependency !== null && !this.#dependencyRetired) { need(this.#dependencySettled); await this.#dependency.retireAfterOriginalExit(); this.#current(); this.#dependencyRetired = true; }
    if (this.#intent !== null && !this.#intentRetired) { need(this.#intentSettled); await this.#intent.retireAfterOriginalExit(); this.#current(); this.#intentRetired = true; }
    if (this.#lexical !== null && !this.#lexicalRetired) { need(this.#lexicalSettled); await this.#lexical.retireAfterOriginalExit(); this.#current(); this.#lexicalRetired = true; }
    await this.#accessor.retireAfterOriginalExit(); this.#current(); this.#accessorRetired = true;
  }
  public inspect(): Readonly<{ profile: "private.current-schematic-wire-writer-v4-controller-status.v1"; operationId: string;
    preflightStarted: boolean; preflightSettled: boolean; preflightFailed: boolean; originalPreflightObserved: boolean;
    originalDependenciesQualified: boolean; originalTailReservationComplete: false; executionAuthorized: false; saveAuthorized: false }> {
    this.#current(); return Object.freeze({ profile: "private.current-schematic-wire-writer-v4-controller-status.v1", operationId: this.#plan.operationId,
      preflightStarted: this.#preflightTask !== null, preflightSettled: this.#preflightSettled, preflightFailed: this.#preflightFailed, originalPreflightObserved: this.#preflight !== null,
      originalDependenciesQualified: this.#dependencyObservation !== null, originalTailReservationComplete: false, executionAuthorized: false, saveAuthorized: false });
  }
  public inspectRunGuard(): Readonly<{ profile: "private.current-schematic-wire-writer-v4-run-guard-controller-status.v1"; operationId: string;
    started: boolean; settled: boolean; failed: boolean; originalRunPointArmed: boolean; executionAuthorized: false; saveAuthorized: false }> {
    this.#current(); return Object.freeze({ profile: "private.current-schematic-wire-writer-v4-run-guard-controller-status.v1", operationId: this.#plan.operationId,
      started: this.#runGuardTask !== null, settled: this.#runGuardSettled, failed: this.#runGuardFailed, originalRunPointArmed: this.#runGuard !== null, executionAuthorized: false, saveAuthorized: false });
  }
  public inspectAccessors(): Readonly<{
    profile: "private.current-schematic-wire-writer-v4-accessor-controller-status.v1"; operationId: string;
    started: boolean; settled: boolean; failed: boolean; originalFunctionsQualified: boolean; retiredAfterOriginalExit: boolean;
    originalLexicalOperandsJoined: false; executionAuthorized: false; saveAuthorized: false;
  }> {
    this.#current(); return Object.freeze({ profile: "private.current-schematic-wire-writer-v4-accessor-controller-status.v1", operationId: this.#plan.operationId,
      started: this.#accessorTask !== null, settled: this.#accessorSettled, failed: this.#accessorFailed, originalFunctionsQualified: this.#accessorObservation !== null,
      retiredAfterOriginalExit: this.#accessorRetired, originalLexicalOperandsJoined: false, executionAuthorized: false, saveAuthorized: false });
  }
  public inspectLexical(): Readonly<{
    profile: "private.current-schematic-wire-writer-v4-lexical-controller-status.v1"; operationId: string;
    started: boolean; settled: boolean; failed: boolean; originalOperandsQualified: boolean; retiredAfterOriginalExit: boolean;
    liveContinuationAuthorized: false; executionAuthorized: false; saveAuthorized: false;
  }> {
    this.#current(); return Object.freeze({ profile: "private.current-schematic-wire-writer-v4-lexical-controller-status.v1", operationId: this.#plan.operationId,
      started: this.#lexicalTask !== null, settled: this.#lexicalSettled, failed: this.#lexicalFailed, originalOperandsQualified: this.#lexicalObservation !== null,
      retiredAfterOriginalExit: this.#lexicalRetired, liveContinuationAuthorized: false, executionAuthorized: false, saveAuthorized: false });
  }
}
