/** Original cold-v2 metadata/lease continuation. This retains the original
 * constructor and UI registration; it does not begin a clock/create channel. */
/* oxlint-disable import/max-dependencies -- Compose existing original source, opening, native registration and lease issuers; no caller callback table may substitute for them. */
import { types } from "node:util";
import { sha256Json } from "./core.ts";
import { requireOriginalCurrentFootprintCopyPreparationSource } from "./current-footprint-copy-preparation-runtime.ts";
import { finishOriginalCurrentFootprintForwardClockPreparation, requireCurrentFootprintForwardExecutionOpeningInput, reserveOriginalCurrentFootprintForwardClockPreparation } from "./current-footprint-forward-execution-opening.ts";
import type { CurrentFootprintForwardClockPreparationReservation, CurrentFootprintForwardExecutionOpeningProvider } from "./current-footprint-forward-execution-opening.ts";
import { CurrentFootprintCopyStartupOpening } from "./current-pcb-209-worker-startup-opening.ts";
import type { CurrentFootprintCopyOpeningResult, CurrentFootprintCopyStartupOpeningResult } from "./current-pcb-209-worker-startup-opening.ts";
import { CurrentFootprintForwardExecutionNativeOwner, assertOriginalCurrentFootprintForwardExecutionNativeOwner } from "./current-pcb-diagnostic-owner.ts";
import { captureCurrentFootprintForwardExecutionPrototypes, captureCurrentFootprintForwardExecutionReceiver } from "./current-footprint-forward-execution-opening-identity.ts";
import type { CurrentFootprintCopyProducerObservation } from "./current-footprint-copy-producer-runner.ts";
import type { CurrentFootprintCopyDependencyObservation } from "./current-footprint-copy-dependency-runner.ts";
import type { CurrentFootprintCopyRegisteredAsyncObservation } from "./current-footprint-copy-async-runner.ts";
import type { CurrentFootprintCopyDestinationObservation } from "./current-footprint-copy-destination-runner.ts";
import type { CurrentFootprintCopyClockRegistrationObservation } from "./current-footprint-copy-clock-registration-runner.ts";

const openingPrototype = captureCurrentFootprintForwardExecutionPrototypes(CurrentFootprintCopyStartupOpening.prototype);
const nativePrototype = captureCurrentFootprintForwardExecutionPrototypes(CurrentFootprintForwardExecutionNativeOwner.prototype);
const openingMethods = ["observeFootprintProducers", "observeFootprintDependencies", "observeFootprintRegisteredAsync", "observeFootprintDestinations", "prepareFootprintForwardExecutionClockLeases"] as const;
const nativeMethods = ["observeFootprintForwardExecutionClockRegistration", "assertFootprintForwardExecutionClockPreparationCapacity", "originalFootprintForwardExecutionSource", "requireOriginalForwardExecutionMainRunner"] as const;
type Input = Awaited<ReturnType<typeof requireCurrentFootprintForwardExecutionOpeningInput>>;
type Source = Awaited<ReturnType<typeof requireOriginalCurrentFootprintCopyPreparationSource>>;
type Leases = Awaited<ReturnType<CurrentFootprintCopyStartupOpening["prepareFootprintForwardExecutionClockLeases"]>>;
type Stage = "new" | "source" | "producers" | "dependencies" | "callbacks" | "destinations" | "registration" | "leases" | "complete";
export interface CurrentFootprintForwardClockPreparation {
  readonly profile: "private.current-footprint-forward-clock-preparation.v1";
  readonly sourceInputSha256: string;
  readonly originalMetadataAndLeaseReferencesRetained: true;
  readonly continuousProducerExclusionVerified: false;
  readonly currentHeadVerified: false;
  readonly clockInvocationsObserved: false;
  readonly nativeCreateRouteIssued: false;
  readonly executionAuthorized: false;
}
interface Bindings { readonly input: Input; readonly source: Source; readonly leases: Leases; readonly registration: CurrentFootprintCopyClockRegistrationObservation }
const originals = new WeakMap<CurrentFootprintForwardClockPreparation, Readonly<{ provider: CurrentFootprintForwardExecutionOpeningProvider; read: () => Readonly<Bindings> }>>();
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`FORWARD_CLOCK_PREPARATION_${code}`); } }
function footprintResult(result: CurrentFootprintCopyOpeningResult): asserts result is CurrentFootprintCopyStartupOpeningResult {
  need(result.construction.profile === "private.current-footprint-copy-construction.v1", "ORIGINAL_FOOTPRINT_RESULT");
}
/** Only the original completed owner may resolve these retained references.
 * They supply no current frontier/clock or native dispatch authority. */
export function requireOriginalCurrentFootprintForwardClockPreparation(token: CurrentFootprintForwardClockPreparation,
  provider: CurrentFootprintForwardExecutionOpeningProvider): Readonly<Bindings> {
  const original = originals.get(token); need(original !== undefined && original.provider === provider, "ORIGINAL_TOKEN"); return original.read();
}
export class CurrentFootprintForwardClockPreparationOwner {
  readonly #provider: CurrentFootprintForwardExecutionOpeningProvider;
  #input: Input | null = null;
  #source: Source | null = null;
  #openingCurrent: (() => void) | null = null;
  #nativeCurrent: (() => void) | null = null;
  #stage: Stage = "new";
  #attempted = false;
  #busy = false;
  #reservation: CurrentFootprintForwardClockPreparationReservation | null = null;
  #failure: unknown = null;
  #producers: CurrentFootprintCopyProducerObservation | null = null;
  #dependencies: CurrentFootprintCopyDependencyObservation | null = null;
  #callbacks: CurrentFootprintCopyRegisteredAsyncObservation | null = null;
  #destinations: CurrentFootprintCopyDestinationObservation | null = null;
  #registration: CurrentFootprintCopyClockRegistrationObservation | null = null;
  #leases: Leases | null = null;
  #token: CurrentFootprintForwardClockPreparation | null = null;
  public constructor(provider: CurrentFootprintForwardExecutionOpeningProvider) {
    need(provider !== null && typeof provider === "object" && !types.isProxy(provider), "ORIGINAL_PROVIDER"); this.#provider = provider; Object.freeze(this);
  }
  #current(): void {
    this.#openingCurrent?.(); this.#nativeCurrent?.();
    const input = this.#input, source = this.#source;
    if (input !== null) {
      assertOriginalCurrentFootprintForwardExecutionNativeOwner(input.owner);
      const current = input.owner.originalFootprintForwardExecutionSource();
      need(current.source === input.source.source && current.opening === input.source.opening && current.result === input.source.result &&
        current.preparation === input.source.preparation && current.owned.copyPlan === input.source.owned.copyPlan && current.main === input.source.main, "ORIGINAL_INPUT_CHANGED");
      need(current.main !== null, "ORIGINAL_MAIN"); input.owner.requireOriginalForwardExecutionMainRunner(current.main, "normal");
      if (source !== null) { need(source.opening === current.opening && source.result === current.result && source.before === current.owned.before && source.sourcePlan === current.owned.sourcePlan, "ORIGINAL_SOURCE_CHANGED"); }
    }
  }
  /** Consume the complete preparation attempt before its first await. Each
   * original collector retains partial resources independently for cleanup. */
  public async prepare(): Promise<CurrentFootprintForwardClockPreparation> {
    need(!this.#attempted && !this.#busy, "CONSUMED"); this.#attempted = true; this.#busy = true;
    let completed: CurrentFootprintForwardClockPreparation | null = null;
    try {
      this.#reservation = reserveOriginalCurrentFootprintForwardClockPreparation(this.#provider);
      this.#stage = "source"; this.#input = await requireCurrentFootprintForwardExecutionOpeningInput(this.#provider);
      const input = this.#input, opening = input.source.opening;
      need(opening instanceof CurrentFootprintCopyStartupOpening && Object.getPrototypeOf(opening) === CurrentFootprintCopyStartupOpening.prototype, "ORIGINAL_OPENING");
      this.#openingCurrent = captureCurrentFootprintForwardExecutionReceiver(opening, openingPrototype, openingMethods);
      this.#nativeCurrent = captureCurrentFootprintForwardExecutionReceiver(input.owner, nativePrototype, nativeMethods); this.#current();
      input.owner.assertFootprintForwardExecutionClockPreparationCapacity(); this.#current();
      this.#source = await requireOriginalCurrentFootprintCopyPreparationSource(input.source.preparation, opening); this.#current();
      const result = this.#source.result, source = this.#source; footprintResult(result);
      this.#stage = "producers"; this.#producers = await opening.observeFootprintProducers(result, source.assignments, source.state); this.#current();
      this.#stage = "dependencies"; this.#dependencies = await opening.observeFootprintDependencies(result, source.assignments, source.state, this.#producers); this.#current();
      this.#stage = "callbacks"; this.#callbacks = await opening.observeFootprintRegisteredAsync(result, source.assignments, source.state); this.#current();
      this.#stage = "destinations"; this.#destinations = await opening.observeFootprintDestinations(result, source.assignments, source.state, this.#dependencies, this.#callbacks); this.#current();
      this.#stage = "registration"; this.#registration = await input.owner.observeFootprintForwardExecutionClockRegistration(opening, result); this.#current();
      this.#stage = "leases"; this.#leases = await opening.prepareFootprintForwardExecutionClockLeases(result, source.assignments, source.state, this.#producers, this.#dependencies, this.#callbacks, this.#destinations); this.#current();
      const token = Object.freeze({ profile: "private.current-footprint-forward-clock-preparation.v1" as const, sourceInputSha256: sha256Json(input.result), originalMetadataAndLeaseReferencesRetained: true as const,
        continuousProducerExclusionVerified: false as const, currentHeadVerified: false as const, clockInvocationsObserved: false as const, nativeCreateRouteIssued: false as const, executionAuthorized: false as const });
      this.#token = token; this.#stage = "complete"; completed = token;
    } catch (error) { this.#failure ??= error; }
    const original = this.#failure; let settlementError: unknown = null;
    try { if (this.#reservation !== null) { finishOriginalCurrentFootprintForwardClockPreparation(this.#provider, this.#reservation, original); this.#reservation = null; } }
    catch (error) { settlementError = error; this.#failure ??= error; }
    finally { this.#busy = false; }
    if (settlementError !== null && original !== null) { throw new AggregateError([original, settlementError], "FORWARD_CLOCK_PREPARATION_CUSTODY_SETTLEMENT", { cause: original }); }
    if (this.#failure !== null) {
      // oxlint-disable-next-line typescript/only-throw-error -- Preserve the exact original collector or synchronous custody refusal; no new operation may replace it.
      throw this.#failure;
    }
    need(completed !== null, "COMPLETE_RESULT_REQUIRED"); const token = completed;
    originals.set(token, Object.freeze({ provider: this.#provider, read: (): Readonly<Bindings> => this.#requireOriginal(token) })); return token;
  }
  #requireOriginal(token: CurrentFootprintForwardClockPreparation): Readonly<Bindings> {
    need(token === this.#token && this.#stage === "complete" && !this.#busy && this.#reservation === null && this.#failure === null && this.#input !== null && this.#source !== null && this.#leases !== null && this.#registration !== null, "ORIGINAL_COMPLETE_PREPARATION");
    this.#current(); return Object.freeze({ input: this.#input, source: this.#source, leases: this.#leases, registration: this.#registration });
  }
  public retained(): Readonly<Record<string, unknown>> {
    return Object.freeze({ stage: this.#stage, attempted: this.#attempted, busy: this.#busy, failed: this.#failure !== null,
      sourceRetained: this.#source !== null, producersRetained: this.#producers !== null, dependenciesRetained: this.#dependencies !== null, callbacksRetained: this.#callbacks !== null,
      destinationsRetained: this.#destinations !== null, registrationRetained: this.#registration !== null, leasesRetained: this.#leases !== null, result: this.#token,
      nativeCreateRouteIssued: false, executionAuthorized: false });
  }
}
