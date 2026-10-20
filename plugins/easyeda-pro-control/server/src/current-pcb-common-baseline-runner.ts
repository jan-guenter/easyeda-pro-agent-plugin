/** Dormant composed common-state observation. The future retained owner must
 * admit the original PCB script/context before calling this runner. No public
 * tool, native request budget, writer, FileSource or Save route uses it. */
import { types } from "node:util";
import { canonicalJson } from "./core.ts";
import { CURRENT_PCB_COMMON_PREFERENCE_FUNCTION, CURRENT_PCB_COMMON_PRESENTATION_FUNCTION,
  CURRENT_PCB_COMMON_RULES_FUNCTION, decodeCurrentPcbCommonPreference, decodeCurrentPcbCommonPresentation,
  decodeCurrentPcbCommonRules } from "./current-pcb-common-state.ts";
import type { CurrentPcbCommonPreference, CurrentPcbCommonPresentation, CurrentPcbCommonRules } from "./current-pcb-common-state.ts";
import { CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION, CURRENT_PCB_DIAGNOSTIC_MODEL_HANDLER_FUNCTION } from "./current-pcb-diagnostic-model-program.ts";
import { decodeCurrentPcbDiagnosticModelFunction, decodeCurrentPcbDiagnosticModelScope,
  decodeCurrentPcbDiagnosticModelScopeList } from "./current-pcb-diagnostic-model-scope.ts";
import { CURRENT_PCB_STRING_EMPTY_ASSETS_FUNCTION, decodeCurrentPcbStringEmptyAssets } from "./current-pcb-string-empty-assets.ts";
import type { CurrentPcbStringEmptyAssets } from "./current-pcb-string-empty-assets.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_COMMON_BASELINE_OBJECT_GROUP = "easyeda-pro-control-pcb-common-baseline-v1";
/** Six original-scope requests, four fixed readers and one private-group release. */
export const CURRENT_PCB_COMMON_BASELINE_REQUEST_COUNT = 11;
export const CURRENT_PCB_COMMON_BASELINE_MAX_BYTES = 1_597_440;
const EFFECTS = Object.freeze({ throwOnSideEffect: true, silent: true, awaitPromise: false,
  generatePreview: false, userGesture: false } as const);
type SamplePhase = "presentation" | "rules" | "preference" | "assets";
type Phase = SamplePhase | "owner" | "owner-final" | "wrapper" | "properties" | "handler" | "bounds" | "release";
const PROGRAMS = Object.freeze({ presentation: CURRENT_PCB_COMMON_PRESENTATION_FUNCTION,
  rules: CURRENT_PCB_COMMON_RULES_FUNCTION, preference: CURRENT_PCB_COMMON_PREFERENCE_FUNCTION,
  assets: CURRENT_PCB_STRING_EMPTY_ASSETS_FUNCTION });

export type CurrentPcbCommonBaselineCommand =
  | Readonly<{ commonPhase: "wrapper"; method: "Runtime.evaluate"; params: typeof EFFECTS & Readonly<{
    expression: typeof CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION; uniqueContextId: string;
    objectGroup: typeof CURRENT_PCB_COMMON_BASELINE_OBJECT_GROUP; returnByValue: false; timeout: 1000;
    includeCommandLineAPI: false; allowUnsafeEvalBlockedByCSP: false;
  }> }>
  | Readonly<{ commonPhase: "properties"; method: "Runtime.getProperties"; params: Readonly<{
    objectId: string; ownProperties: true; accessorPropertiesOnly: false; generatePreview: false;
  }> }>
  | Readonly<{ commonPhase: "handler"; method: "Runtime.callFunctionOn"; params: typeof EFFECTS & Readonly<{
    objectId: string; functionDeclaration: typeof CURRENT_PCB_DIAGNOSTIC_MODEL_HANDLER_FUNCTION; returnByValue: false;
  }> }>
  | Readonly<{ commonPhase: SamplePhase; method: "Runtime.callFunctionOn"; params: typeof EFFECTS & Readonly<{
    objectId: string; functionDeclaration: string; returnByValue: true; arguments: readonly [Readonly<{ objectId: string }>];
  }> }>
  | Readonly<{ commonPhase: "release"; method: "Runtime.releaseObjectGroup"; params: Readonly<{
    objectGroup: typeof CURRENT_PCB_COMMON_BASELINE_OBJECT_GROUP;
  }> }>;

export interface CurrentPcbCommonBaselineTransport {
  /** Original retained PCB page transport only. No new attachment or selection. */
  readonly request: (command: CurrentPcbCommonBaselineCommand) => Promise<unknown>;
  /** Recheck original owner, complete source and unique context at each await. */
  readonly assertCurrent: () => void;
}
export interface CurrentPcbCommonBaselineObservation {
  readonly schema: "easyeda-pro-control.pcb-common-baseline-observation.v1";
  readonly documentUuid: string;
  readonly presentation: CurrentPcbCommonPresentation;
  readonly rules: CurrentPcbCommonRules;
  readonly preference: CurrentPcbCommonPreference;
  readonly assets: CurrentPcbStringEmptyAssets;
  readonly atomicSnapshotVerified: false;
  readonly continuousObservation: false;
  readonly originalOwnerVerified: false;
  readonly completeLiveBaselineVerified: false;
  readonly storedSourceMatched: false;
  readonly queueCompletionVerified: false;
  readonly saveAuthorized: false;
  readonly executionAuthorized: false;
}
function refuse(): never { throw new Error("PCB_COMMON_BASELINE_OBSERVATION"); }
function handle(value: string): string {
  if (!/^[A-Za-z\d_.:-]{1,256}$/u.test(value)) { return refuse(); }
  return value;
}
function emptyReply(value: unknown): void {
  if (value === null || typeof value !== "object" || types.isProxy(value) || Array.isArray(value) ||
      Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null ||
      Reflect.ownKeys(value).length > 0) { refuse(); }
}

export class CurrentPcbCommonBaselineRunner {
  readonly #transport: CurrentPcbCommonBaselineTransport;
  readonly #script: string;
  readonly #context: string;
  readonly #document: string;
  #consumed = false;
  #phase: Phase = "owner";
  public constructor(transport: CurrentPcbCommonBaselineTransport, scriptId: string, uniqueContextId: string, documentUuid: string) {
    this.#transport = Object.freeze({ request: transport.request, assertCurrent: transport.assertCurrent });
    this.#script = handle(scriptId); this.#context = handle(uniqueContextId);
    if (!/^(?:[a-f\d]{16}|[a-f\d]{32})$/u.test(documentUuid)) { refuse(); }
    this.#document = documentUuid;
  }
  async #request(command: CurrentPcbCommonBaselineCommand): Promise<unknown> {
    this.#phase = command.commonPhase; this.#transport.assertCurrent();
    const reply = await this.#transport.request(freezeDeep(command));
    this.#transport.assertCurrent(); return reply;
  }
  #properties(objectId: string): Promise<unknown> {
    return this.#request({ commonPhase: "properties", method: "Runtime.getProperties",
      params: { objectId: handle(objectId), ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } });
  }
  #sample(phase: SamplePhase, scope: string, wrapper: string): Promise<unknown> {
    return this.#request({ commonPhase: phase, method: "Runtime.callFunctionOn",
      params: { ...EFFECTS, objectId: scope, functionDeclaration: PROGRAMS[phase], returnByValue: true,
        arguments: [{ objectId: wrapper }] } });
  }
  #documentMatches(value: { readonly documentUuid: string }): void {
    if (value.documentUuid !== this.#document) { refuse(); }
  }
  public async observe(): Promise<CurrentPcbCommonBaselineObservation> {
    if (this.#consumed) { return refuse(); }
    this.#consumed = true;
    let cleanupFailed = false, result: CurrentPcbCommonBaselineObservation | undefined, started = false;
    const failures: unknown[] = [];
    try {
      this.#transport.assertCurrent(); started = true;
      const wrapper = decodeCurrentPcbDiagnosticModelFunction(await this.#request({
        commonPhase: "wrapper", method: "Runtime.evaluate", params: { ...EFFECTS,
          expression: CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION, uniqueContextId: this.#context,
          objectGroup: CURRENT_PCB_COMMON_BASELINE_OBJECT_GROUP, returnByValue: false, timeout: 1000,
          includeCommandLineAPI: false, allowUnsafeEvalBlockedByCSP: false },
      }), "rpc-wrapper");
      const wrapperScopes = decodeCurrentPcbDiagnosticModelScopeList(await this.#properties(wrapper), this.#script, "rpc-wrapper");
      const wrapperScope = decodeCurrentPcbDiagnosticModelScope(await this.#properties(wrapperScopes), "rpc-wrapper");
      const handler = decodeCurrentPcbDiagnosticModelFunction(await this.#request({
        commonPhase: "handler", method: "Runtime.callFunctionOn", params: { ...EFFECTS, objectId: wrapperScope,
          functionDeclaration: CURRENT_PCB_DIAGNOSTIC_MODEL_HANDLER_FUNCTION, returnByValue: false },
      }), "save-handler");
      const handlerScopes = decodeCurrentPcbDiagnosticModelScopeList(await this.#properties(handler), this.#script, "save-handler");
      const scope = decodeCurrentPcbDiagnosticModelScope(await this.#properties(handlerScopes), "save-handler");
      const presentation = decodeCurrentPcbCommonPresentation(await this.#sample("presentation", scope, wrapper));
      this.#documentMatches(presentation);
      const rules = decodeCurrentPcbCommonRules(await this.#sample("rules", scope, wrapper)); this.#documentMatches(rules);
      const preference = decodeCurrentPcbCommonPreference(await this.#sample("preference", scope, wrapper)); this.#documentMatches(preference);
      const assets = decodeCurrentPcbStringEmptyAssets(await this.#sample("assets", scope, wrapper)); this.#documentMatches(assets);
      this.#phase = "bounds";
      const observation: CurrentPcbCommonBaselineObservation = freezeDeep({
        schema: "easyeda-pro-control.pcb-common-baseline-observation.v1", documentUuid: this.#document,
        presentation, rules, preference, assets, atomicSnapshotVerified: false, continuousObservation: false,
        originalOwnerVerified: false, completeLiveBaselineVerified: false, storedSourceMatched: false,
        queueCompletionVerified: false, saveAuthorized: false, executionAuthorized: false,
      });
      if (Buffer.byteLength(canonicalJson(observation)) > CURRENT_PCB_COMMON_BASELINE_MAX_BYTES) { refuse(); }
      this.#transport.assertCurrent(); result = observation;
    } catch (caughtError) { failures.push(caughtError); }
    let failurePhase = this.#phase;
    if (started) {
      try {
        // Cleanup uses only the original group's retained transport. Failure
        // Withholds the observation without replacing an earlier exception.
        emptyReply(await this.#transport.request(freezeDeep({ commonPhase: "release", method: "Runtime.releaseObjectGroup",
          params: { objectGroup: CURRENT_PCB_COMMON_BASELINE_OBJECT_GROUP } })));
      } catch (caughtError) { cleanupFailed = true; failures.push(caughtError); }
    }
    if (failures.length === 0) {
      failurePhase = "owner-final";
      try { this.#transport.assertCurrent(); } catch (caughtError) { failures.push(caughtError); }
    }
    if (failures.length > 0) {
      const phase = failures.length === 1 && cleanupFailed ? "release" : failurePhase;
      throw new AggregateError(failures, `PCB_COMMON_BASELINE_OBSERVATION_FAILED_${phase.toUpperCase()}${cleanupFailed ? "_RELEASE_FAILED" : ""}`,
        { cause: failures[0] });
    }
    if (result === undefined) { return refuse(); }
    return result;
  }
}
