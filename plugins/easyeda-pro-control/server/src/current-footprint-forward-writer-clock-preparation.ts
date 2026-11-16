/** Original full-writer metadata/lease continuation. This retains the original
 * constructor and UI registration; it does not begin a clock/create channel. */
/* oxlint-disable import/max-dependencies -- Compose existing original source, opening, native registration and lease issuers; no caller callback table may substitute for them. */
import { types } from "node:util";
import { sha256Json } from "./core.ts";
import { requireOriginalCurrentFootprintCopyPreparationSource } from "./current-footprint-copy-preparation-runtime.ts";
// oxlint-disable-next-line import/no-cycle -- The provider resolves only this module's private operation registry inside its later reserve call; neither module reads the other's values during evaluation.
import { finishOriginalCurrentFootprintForwardWriterClockPreparation, requireCurrentFootprintForwardWriterOpeningInput, reserveOriginalCurrentFootprintForwardWriterClockPreparation } from "./current-footprint-forward-writer-opening.ts";
import type { CurrentFootprintForwardWriterClockPreparationReservation, CurrentFootprintForwardWriterOpeningProvider } from "./current-footprint-forward-writer-opening.ts";
import { CurrentFootprintCopyStartupOpening } from "./current-pcb-209-worker-startup-opening.ts";
import type { CurrentFootprintCopyOpeningResult, CurrentFootprintCopyStartupOpeningResult } from "./current-pcb-209-worker-startup-opening.ts";
import { CurrentFootprintForwardWriterNativeOwner, assertOriginalCurrentFootprintForwardWriterNativeOwner } from "./current-pcb-diagnostic-owner.ts";
import { captureCurrentFootprintForwardExecutionPrototypes, captureCurrentFootprintForwardExecutionReceiver } from "./current-footprint-forward-execution-opening-identity.ts";
import type { CurrentFootprintCopyProducerObservation } from "./current-footprint-copy-producer-runner.ts";
import type { CurrentFootprintCopyDependencyObservation } from "./current-footprint-copy-dependency-runner.ts";
import type { CurrentFootprintCopyRegisteredAsyncObservation } from "./current-footprint-copy-async-runner.ts";
import type { CurrentFootprintCopyDestinationObservation } from "./current-footprint-copy-destination-runner.ts";
import type { CurrentFootprintCopyClockRegistrationV2Observation } from "./current-footprint-copy-clock-registration-v2-runner.ts";

const openingPrototype = captureCurrentFootprintForwardExecutionPrototypes(CurrentFootprintCopyStartupOpening.prototype);
const nativePrototype = captureCurrentFootprintForwardExecutionPrototypes(CurrentFootprintForwardWriterNativeOwner.prototype);
const openingMethods = ["observeFootprintProducers", "observeFootprintDependencies", "observeFootprintRegisteredAsync", "observeFootprintDestinations", "prepareFootprintForwardWriterClockLeases"] as const;
const nativeMethods = ["observeFootprintForwardWriterClockRegistration", "assertFootprintForwardWriterClockPreparationCapacity", "originalFootprintForwardWriterSource", "requireOriginalForwardWriterMainRunner"] as const;
type Input = Awaited<ReturnType<typeof requireCurrentFootprintForwardWriterOpeningInput>>;
type Source = Awaited<ReturnType<typeof requireOriginalCurrentFootprintCopyPreparationSource>>;
type Leases = Awaited<ReturnType<CurrentFootprintCopyStartupOpening["prepareFootprintForwardWriterClockLeases"]>>;
type Stage = "new" | "source" | "producers" | "dependencies" | "callbacks" | "destinations" | "registration" | "leases" | "complete";
export interface CurrentFootprintForwardWriterClockPreparation {
  readonly profile: "private.current-footprint-forward-writer-clock-preparation.v1";
  readonly sourceInputSha256: string;
  readonly originalMetadataAndLeaseReferencesRetained: true;
  readonly continuousProducerExclusionVerified: false;
  readonly currentHeadVerified: false;
  readonly clockInvocationsObserved: false;
  readonly nativeCreateRouteIssued: false;
  readonly executionAuthorized: false;
}
interface Bindings { readonly input: Input; readonly source: Source; readonly leases: Leases; readonly registration: CurrentFootprintCopyClockRegistrationV2Observation }
const originals = new WeakMap<CurrentFootprintForwardWriterClockPreparation, Readonly<{ provider: CurrentFootprintForwardWriterOpeningProvider; read: () => Readonly<Bindings> }>>();
export interface CurrentFootprintForwardWriterClockPreparationOperation { readonly profile: "private.current-footprint-forward-writer-clock-preparation-operation.v1" }
const operations = new WeakMap<CurrentFootprintForwardWriterClockPreparationOperation, Readonly<{ provider: CurrentFootprintForwardWriterOpeningProvider; pending: Promise<CurrentFootprintForwardWriterClockPreparation> }>>();
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`FORWARD_WRITER_CLOCK_PREPARATION_${code}`); } }
/** Cleanup joins exactly the Promise issued before this collector's first
 * await. A supplied Promise, copied operation or other provider cannot enter. */
export function requireOriginalCurrentFootprintForwardWriterClockPreparationOperation(operation: CurrentFootprintForwardWriterClockPreparationOperation,
  provider: CurrentFootprintForwardWriterOpeningProvider): Readonly<{ pending: Promise<unknown> }> {
  const held = operations.get(operation); need(held !== undefined && held.provider === provider, "ORIGINAL_OPERATION"); return held;
}
function footprintResult(result: CurrentFootprintCopyOpeningResult): asserts result is CurrentFootprintCopyStartupOpeningResult {
  need(result.construction.profile === "private.current-footprint-copy-construction.v1", "ORIGINAL_FOOTPRINT_RESULT");
}
/** Only the original completed owner may resolve these retained references.
 * They supply no current frontier/clock or native dispatch authority. */
export function requireOriginalCurrentFootprintForwardWriterClockPreparation(token: CurrentFootprintForwardWriterClockPreparation,
  provider: CurrentFootprintForwardWriterOpeningProvider): Readonly<Bindings> {
  const original = originals.get(token); need(original !== undefined && original.provider === provider, "ORIGINAL_TOKEN"); return original.read();
}
export class CurrentFootprintForwardWriterClockPreparationOwner {
  readonly #provider: CurrentFootprintForwardWriterOpeningProvider;
  #input: Input | null = null;
  #source: Source | null = null;
  #openingCurrent: (() => void) | null = null;
  #nativeCurrent: (() => void) | null = null;
  #stage: Stage = "new";
  #attempted = false;
  #busy = false;
  #reservation: CurrentFootprintForwardWriterClockPreparationReservation | null = null;
  #operation: CurrentFootprintForwardWriterClockPreparationOperation | null = null;
  #failed = false;
  #failure: unknown;
  #producers: CurrentFootprintCopyProducerObservation | null = null;
  #dependencies: CurrentFootprintCopyDependencyObservation | null = null;
  #callbacks: CurrentFootprintCopyRegisteredAsyncObservation | null = null;
  #destinations: CurrentFootprintCopyDestinationObservation | null = null;
  #registration: CurrentFootprintCopyClockRegistrationV2Observation | null = null;
  #leases: Leases | null = null;
  #token: CurrentFootprintForwardWriterClockPreparation | null = null;
  public constructor(provider: CurrentFootprintForwardWriterOpeningProvider) {
    need(provider !== null && typeof provider === "object" && !types.isProxy(provider), "ORIGINAL_PROVIDER"); this.#provider = provider; Object.freeze(this);
  }
  #current(): void {
    this.#openingCurrent?.(); this.#nativeCurrent?.();
    const input = this.#input, source = this.#source;
    if (input !== null) {
      assertOriginalCurrentFootprintForwardWriterNativeOwner(input.owner);
      const current = input.owner.originalFootprintForwardWriterSource();
      need(current.source === input.source.source && current.opening === input.source.opening && current.result === input.source.result &&
        current.preparation === input.source.preparation && current.owned.copyPlan === input.source.owned.copyPlan && current.main === input.source.main, "ORIGINAL_INPUT_CHANGED");
      need(current.main !== null, "ORIGINAL_MAIN"); input.owner.requireOriginalForwardWriterMainRunner(current.main, "normal");
      if (source !== null) { need(source.opening === current.opening && source.result === current.result && source.before === current.owned.before && source.sourcePlan === current.owned.sourcePlan, "ORIGINAL_SOURCE_CHANGED"); }
    }
  }
  /** Publication is an authority boundary independent of the retained native
   * source references. Re-read its original journal after every collector await
   * before a later collector can spend another original request. */
  async #published(): Promise<void> {
    this.#current();
    const previous = this.#input;
    need(previous !== null, "ORIGINAL_PUBLISHED_INPUT");
    const current = await requireCurrentFootprintForwardWriterOpeningInput(this.#provider);
    this.#current();
    need(current.result === previous.result && current.owner === previous.owner && current.source.source === previous.source.source &&
      current.source.opening === previous.source.opening && current.source.result === previous.source.result &&
      current.source.preparation === previous.source.preparation && current.source.owned.before === previous.source.owned.before &&
      current.source.owned.copyPlan === previous.source.owned.copyPlan && current.source.owned.nativeArguments === previous.source.owned.nativeArguments &&
      current.source.owned.sourcePlan === previous.source.owned.sourcePlan && current.source.main === previous.source.main &&
      current.source.mainRetained === previous.source.mainRetained && current.source.resources === previous.source.resources &&
      current.source.binding === previous.source.binding, "ORIGINAL_PUBLISHED_INPUT");
  }
  /** Consume the complete preparation attempt before its first await. Each
   * original collector retains partial resources independently for cleanup. */
  public prepare(): Promise<CurrentFootprintForwardWriterClockPreparation> {
    try {
      need(!this.#attempted && !this.#busy, "CONSUMED"); this.#attempted = true; this.#busy = true;
      const completion = Promise.withResolvers<CurrentFootprintForwardWriterClockPreparation>();
      const operation: CurrentFootprintForwardWriterClockPreparationOperation = Object.freeze({ profile: "private.current-footprint-forward-writer-clock-preparation-operation.v1" });
      this.#operation = operation; operations.set(operation, Object.freeze({ provider: this.#provider, pending: completion.promise }));
      void (async (): Promise<void> => { try { completion.resolve(await this.#prepare()); } catch (error) { completion.reject(error); } })();
      return completion.promise;
    } catch (error) {
      // oxlint-disable-next-line typescript/prefer-promise-reject-errors -- Keep the exact original synchronous refusal in the same Promise-returning API.
      return Promise.reject(error);
    }
  }
  async #prepare(): Promise<CurrentFootprintForwardWriterClockPreparation> {
    let completed: CurrentFootprintForwardWriterClockPreparation | null = null;
    try {
      need(this.#operation !== null, "ORIGINAL_OPERATION"); this.#reservation = reserveOriginalCurrentFootprintForwardWriterClockPreparation(this.#provider, this.#operation);
      this.#stage = "source"; this.#input = await requireCurrentFootprintForwardWriterOpeningInput(this.#provider);
      const input = this.#input, opening = input.source.opening;
      need(opening instanceof CurrentFootprintCopyStartupOpening && Object.getPrototypeOf(opening) === CurrentFootprintCopyStartupOpening.prototype, "ORIGINAL_OPENING");
      this.#openingCurrent = captureCurrentFootprintForwardExecutionReceiver(opening, openingPrototype, openingMethods);
      this.#nativeCurrent = captureCurrentFootprintForwardExecutionReceiver(input.owner, nativePrototype, nativeMethods); this.#current();
      input.owner.assertFootprintForwardWriterClockPreparationCapacity(); this.#current();
      this.#source = await requireOriginalCurrentFootprintCopyPreparationSource(input.source.preparation, opening); await this.#published();
      const result = this.#source.result, source = this.#source; footprintResult(result);
      this.#stage = "producers"; this.#producers = await opening.observeFootprintProducers(result, source.assignments, source.state); await this.#published();
      this.#stage = "dependencies"; this.#dependencies = await opening.observeFootprintDependencies(result, source.assignments, source.state, this.#producers); await this.#published();
      this.#stage = "callbacks"; this.#callbacks = await opening.observeFootprintRegisteredAsync(result, source.assignments, source.state); await this.#published();
      this.#stage = "destinations"; this.#destinations = await opening.observeFootprintDestinations(result, source.assignments, source.state, this.#dependencies, this.#callbacks); await this.#published();
      this.#stage = "registration"; this.#registration = await input.owner.observeFootprintForwardWriterClockRegistration(opening, result); await this.#published();
      this.#stage = "leases"; this.#leases = await opening.prepareFootprintForwardWriterClockLeases(result, source.assignments, source.state, this.#producers, this.#dependencies, this.#callbacks, this.#destinations); await this.#published();
      const token = Object.freeze({ profile: "private.current-footprint-forward-writer-clock-preparation.v1" as const, sourceInputSha256: sha256Json(input.result), originalMetadataAndLeaseReferencesRetained: true as const,
        continuousProducerExclusionVerified: false as const, currentHeadVerified: false as const, clockInvocationsObserved: false as const, nativeCreateRouteIssued: false as const, executionAuthorized: false as const });
      this.#token = token; this.#stage = "complete"; completed = token;
    } catch (error) { this.#failed = true; this.#failure = error; }
    const original = this.#failure, originalFailed = this.#failed; let settlementError: unknown, settlementFailed = false;
    try {
      if (this.#reservation !== null) {
        finishOriginalCurrentFootprintForwardWriterClockPreparation(this.#provider, this.#reservation,
          originalFailed ? Object.freeze({ failed: true, cause: original }) : Object.freeze({ failed: false }));
        this.#reservation = null;
      }
    } catch (error) { settlementFailed = true; settlementError = error; if (!this.#failed) { this.#failed = true; this.#failure = error; } }
    finally { this.#busy = false; }
    if (settlementFailed && originalFailed) { throw new AggregateError([original, settlementError], "FORWARD_WRITER_CLOCK_PREPARATION_CUSTODY_SETTLEMENT", { cause: original }); }
    if (this.#failed) {
      throw this.#failure;
    }
    need(completed !== null, "COMPLETE_RESULT_REQUIRED"); const token = completed;
    originals.set(token, Object.freeze({ provider: this.#provider, read: (): Readonly<Bindings> => this.#requireOriginal(token) })); return token;
  }
  #requireOriginal(token: CurrentFootprintForwardWriterClockPreparation): Readonly<Bindings> {
    need(token === this.#token && this.#stage === "complete" && !this.#busy && this.#reservation === null && !this.#failed && this.#input !== null && this.#source !== null && this.#leases !== null && this.#registration !== null, "ORIGINAL_COMPLETE_PREPARATION");
    this.#current(); return Object.freeze({ input: this.#input, source: this.#source, leases: this.#leases, registration: this.#registration });
  }
  public retained(): Readonly<Record<string, unknown>> {
    return Object.freeze({ stage: this.#stage, attempted: this.#attempted, busy: this.#busy, failed: this.#failed,
      sourceRetained: this.#source !== null, producersRetained: this.#producers !== null, dependenciesRetained: this.#dependencies !== null, callbacksRetained: this.#callbacks !== null,
      destinationsRetained: this.#destinations !== null, registrationRetained: this.#registration !== null, leasesRetained: this.#leases !== null, result: this.#token,
      nativeCreateRouteIssued: false, executionAuthorized: false });
  }
}
