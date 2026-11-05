/** Disposable v2 opening/source validation only. The separate writer birth
 * does not grant clock, create, dispatch, Save or saved-result authority. */
import { CurrentFootprintForwardExecutionOpeningProvider } from "./current-footprint-forward-execution-opening.ts";
import { captureCurrentFootprintForwardExecutionPrototypes, captureCurrentFootprintForwardExecutionReceiver,
  requireCurrentFootprintForwardExecutionPrototypes } from "./current-footprint-forward-execution-opening-identity.ts";
import type { CurrentPcbDiagnosticLifecycleOptions } from "./current-pcb-diagnostic-lifecycle.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { types } from "node:util";
import { currentFootprintForwardSourceValidationInspectionSchema, currentFootprintForwardSourceValidationRequestSchema } from "./current-footprint-forward-source-validation-schema.ts";

export { currentFootprintForwardSourceValidationRequestSchema } from "./current-footprint-forward-source-validation-schema.ts";
export type { CurrentFootprintForwardSourceValidationRequest } from "./current-footprint-forward-source-validation-schema.ts";

const providerPrototypes = captureCurrentFootprintForwardExecutionPrototypes(CurrentFootprintForwardExecutionOpeningProvider.prototype);
const providerMethods = ["launch", "observeMain", "observeBrowser", "inspectFrames", "inspectUi", "captureSource", "observeWindow", "close", "abort",
  "observeTermination", "release", "observeRelease", "settleRecords", "cleanupBeforeLaunch", "cleanupNoProcess", "inspection",
  "hasActiveReservation", "hasOwnedAllocation", "hasAttemptedNativeOwnerAllocation"] as const;
function need(value: boolean): asserts value { if (!value) { throw new Error("FORWARD_SOURCE_VALIDATION_ORIGINAL_OPERATION"); } }
/** Reject option hooks before freezing the index's original plain data object.
 * The provider independently validates its fixed fields and guard callbacks. */
function originalOptions(options: CurrentPcbDiagnosticLifecycleOptions): CurrentPcbDiagnosticLifecycleOptions {
  need(options !== null && typeof options === "object" && !types.isProxy(options) && Object.getPrototypeOf(options) === Object.prototype);
  for (const key of Reflect.ownKeys(options)) {
    const descriptor = Object.getOwnPropertyDescriptor(options, key);
    need(typeof key === "string" && descriptor !== undefined && Object.hasOwn(descriptor, "value"));
  }
  return Object.freeze(options);
}

/** Keep the public selector separate from the original private provider. No
 * caller descriptor or returned result can recreate that provider or its owner. */
export class CurrentFootprintForwardSourceValidation {
  readonly #provider: CurrentFootprintForwardExecutionOpeningProvider;
  readonly #providerCurrent: () => void;
  #operationId: string | null = null;
  #window: string | null = null;
  public constructor(options: CurrentPcbDiagnosticLifecycleOptions) {
    this.#provider = new CurrentFootprintForwardExecutionOpeningProvider(originalOptions(options));
    this.#providerCurrent = captureCurrentFootprintForwardExecutionReceiver(this.#provider, providerPrototypes, providerMethods);
    Object.freeze(this);
  }
  /** Recheck original class/receiver resolution at every public and await edge. */
  #current(): void {
    // oxlint-disable-next-line eslint/no-use-before-define -- Captured after the complete class definition and before instances are constructed.
    requireCurrentFootprintForwardExecutionPrototypes(controllerPrototypes);
    need(Object.getPrototypeOf(this) === CurrentFootprintForwardSourceValidation.prototype && Reflect.ownKeys(this).length === 0);
    this.#providerCurrent();
  }
  public hasActiveReservation(): boolean { this.#current(); return this.#provider.hasActiveReservation(); }
  public hasOwnedAllocation(): boolean { this.#current(); return this.#provider.hasOwnedAllocation(); }
  public hasAttemptedNativeOwnerAllocation(): boolean { this.#current(); return this.#provider.hasAttemptedNativeOwnerAllocation(); }
  /** Exact operation/binding checks precede any provider action. Inspection
   * and settlement retain unknown outcomes; neither restores normal work. */
  public async run(input: unknown): Promise<Readonly<Record<string, unknown>>> {
    const request = currentFootprintForwardSourceValidationRequestSchema.parse(captureCurrentPcbStringClockReply(input).value);
    this.#current();
    if (request.action === "launch") {
      need(this.#operationId === null); this.#operationId = request.operationId;
      const { action: _action, confirmValidationOnly: _validation, confirmDiagnosticLaunch: _launch, ...opening } = request;
      const result = await this.#provider.launch(opening); this.#current(); return { ...result, executionReady: false };
    }
    need(this.#operationId === request.operationId);
    if ("expectedBindingSha256" in request) {
      const inspected = this.#provider.inspection();
      need(inspected["operationId"] === request.operationId && inspected["binding"] !== null && inspected["bindingSha256"] === request.expectedBindingSha256);
    }
    if (request.action === "inspect") { return currentFootprintForwardSourceValidationInspectionSchema.parse(this.#provider.inspection()); }
    let result: unknown;
    switch (request.action) {
      case "observe-main": { result = await this.#provider.observeMain(); break; }
      case "observe-browser": { result = await this.#provider.observeBrowser(); break; }
      case "inspect-frames": { result = await this.#provider.inspectFrames(request.targetId); break; }
      case "inspect-ui": { result = await this.#provider.inspectUi(request.frameId); break; }
      case "capture-source": { result = await this.#provider.captureSource(); break; }
      case "observe-window": { const observed = await this.#provider.observeWindow(); this.#window = observed; result = { hwnd: observed }; break; }
      case "normal-close": { need(this.#window !== null && this.#window === request.hwnd); await this.#provider.close(request.hwnd); result = { requested: true, saveOrDiscardSelected: false }; break; }
      case "abort-generation": { await this.#provider.abort(request.confirmAbortOriginalForwardJob); result = { requested: true, originalJobOnly: true }; break; }
      case "observe-termination": { result = { terminated: await this.#provider.observeTermination() }; break; }
      case "release-closed": { await this.#provider.release(); result = { released: true }; break; }
      case "observe-release": { result = { state: await this.#provider.observeRelease() }; break; }
      case "settle-records": { await this.#provider.settleRecords(); result = { recordsSettled: true }; break; }
      case "cleanup-before-launch": { await this.#provider.cleanupBeforeLaunch(); result = { cleanupCompleted: true }; break; }
      case "cleanup-no-process": { await this.#provider.cleanupNoProcess(); result = { cleanupCompleted: true }; break; }
      default: { throw new Error("FORWARD_SOURCE_VALIDATION_ACTION"); }
    }
    this.#current();
    return { schema: "easyeda-pro-control.footprint-forward-source-validation-step.v1", operationId: request.operationId, action: request.action, result,
      executionReady: false, executionAuthorized: false, saveAuthorized: false };
  }
}
const controllerPrototypes = captureCurrentFootprintForwardExecutionPrototypes(CurrentFootprintForwardSourceValidation.prototype);
