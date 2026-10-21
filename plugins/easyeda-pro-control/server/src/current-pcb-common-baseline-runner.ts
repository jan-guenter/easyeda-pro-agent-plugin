/** Fixed common-state observation used only by the original String-purpose
 * owner after PCB script/context admission. No writer, FileSource or Save
 * authority follows from these samples or their later stored comparison. */
import { types } from "node:util";
import { canonicalJson } from "./core.ts";
import { currentPcbCommonRunnerFailure } from "./current-pcb-common-baseline-failure.ts";
import { CURRENT_PCB_COMMON_GRAPH_BYTES } from "./current-pcb-common-graph.ts";
import { CURRENT_PCB_COMMON_METADATA_FUNCTION, decodeCurrentPcbCommonMetadata } from "./current-pcb-common-metadata.ts";
import type { CurrentPcbCommonMetadata } from "./current-pcb-common-metadata.ts";
import { CURRENT_PCB_COMMON_PREFERENCE_FUNCTION, CURRENT_PCB_COMMON_PRESENTATION_FUNCTION,
  CURRENT_PCB_COMMON_RULES_FUNCTION, decodeCurrentPcbCommonPreference, decodeCurrentPcbCommonPresentation,
  decodeCurrentPcbCommonRules } from "./current-pcb-common-state.ts";
import type { CurrentPcbCommonPreference, CurrentPcbCommonPresentation, CurrentPcbCommonRules } from "./current-pcb-common-state.ts";
import { CURRENT_PCB_CONSTRUCTOR_BUNDLES, CURRENT_PCB_CONSTRUCTOR_BUNDLE_FUNCTIONS, decodeCurrentPcbConstructorBundle,
  decodeCurrentPcbConstructorProperties, decodeCurrentPcbConstructorTuple } from "./current-pcb-constructor-scope.ts";
import { CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION, CURRENT_PCB_DIAGNOSTIC_MODEL_HANDLER_FUNCTION } from "./current-pcb-diagnostic-model-program.ts";
import { decodeCurrentPcbDiagnosticModelFunction, decodeCurrentPcbDiagnosticModelScope,
  decodeCurrentPcbDiagnosticModelScopeList } from "./current-pcb-diagnostic-model-scope.ts";
import { CURRENT_PCB_STRING_EMPTY_ASSETS_FUNCTION, decodeCurrentPcbStringEmptyAssets } from "./current-pcb-string-empty-assets.ts";
import type { CurrentPcbStringEmptyAssets } from "./current-pcb-string-empty-assets.ts";
// oxlint-disable-next-line import/max-dependencies -- The fixed runner composes its existing independently audited readers and one branded failure boundary.
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_COMMON_BASELINE_OBJECT_GROUP = "easyeda-pro-control-pcb-common-baseline-v2";
/** Six scope + six constructor requests, five readers and one group release. */
export const CURRENT_PCB_COMMON_BASELINE_REQUEST_COUNT = 18;
export const CURRENT_PCB_COMMON_BASELINE_MAX_BYTES = 2_121_728;
const EFFECTS = Object.freeze({ throwOnSideEffect: true, silent: true, awaitPromise: false,
  generatePreview: false, userGesture: false } as const);
type CommonPhase = "presentation" | "rules" | "preference" | "assets";
type SamplePhase = CommonPhase | "metadata";
type Phase = SamplePhase | "owner" | "owner-final" | "wrapper" | "properties" | "handler" | "constructors" | "bounds" | "release";
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
  | Readonly<{ commonPhase: "constructors"; method: "Runtime.callFunctionOn"; params: typeof EFFECTS & Readonly<{
    objectId: string; functionDeclaration: typeof CURRENT_PCB_CONSTRUCTOR_BUNDLE_FUNCTIONS.common; returnByValue: false;
    arguments: readonly [Readonly<{ objectId: string }>];
  }> }>
  | Readonly<{ commonPhase: "metadata"; method: "Runtime.callFunctionOn"; params: typeof EFFECTS & Readonly<{
    objectId: string; functionDeclaration: typeof CURRENT_PCB_COMMON_METADATA_FUNCTION; returnByValue: true;
    arguments: readonly [Readonly<{ objectId: string }>];
  }> }>
  | Readonly<{ commonPhase: CommonPhase; method: "Runtime.callFunctionOn"; params: typeof EFFECTS & Readonly<{
    objectId: string; functionDeclaration: string; returnByValue: true;
    arguments: readonly [Readonly<{ objectId: string }>, Readonly<{ objectId: string }>];
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
  readonly schema: "easyeda-pro-control.pcb-common-baseline-observation.v2";
  readonly documentUuid: string;
  readonly presentation: CurrentPcbCommonPresentation;
  readonly rules: CurrentPcbCommonRules;
  readonly preference: CurrentPcbCommonPreference;
  readonly assets: CurrentPcbStringEmptyAssets;
  readonly metadata: CurrentPcbCommonMetadata;
  readonly atomicSnapshotVerified: false;
  readonly continuousObservation: false;
  readonly originalOwnerVerified: false;
  readonly completeLiveBaselineVerified: false;
  readonly storedSourceMatched: false;
  readonly queueCompletionVerified: false;
  readonly saveAuthorized: false;
  readonly executionAuthorized: false;
}
export interface CurrentPcbCommonRetainedReply { readonly result: Readonly<{ type: "string"; value: string }>; }
export type CurrentPcbCommonBaselineReplies = Readonly<Record<SamplePhase, CurrentPcbCommonRetainedReply>>;
const retainedReplies = new WeakMap<CurrentPcbCommonBaselineObservation, CurrentPcbCommonBaselineReplies>();

/** Original runner issuance only, not current native ownership, freshness,
 * interval completion or execution authority. No decoded-data reserialization. */
export function requireOriginalCurrentPcbCommonBaselineReplies(observation: CurrentPcbCommonBaselineObservation): CurrentPcbCommonBaselineReplies {
  const replies = retainedReplies.get(observation); if (replies === undefined) { return refuse(); } return replies;
}
function rawRecord(input: unknown, keys: readonly string[]): object {
  if (input === null || typeof input !== "object" || types.isProxy(input) || Array.isArray(input)) { return refuse(); }
  const actual = Reflect.ownKeys(input), prototype: unknown = Object.getPrototypeOf(input);
  if (prototype !== Object.prototype && prototype !== null || actual.length !== keys.length ||
      actual.some(key => typeof key !== "string" || !keys.includes(key))) { return refuse(); }
  return input;
}
function rawValue(input: object, key: string): unknown {
  const descriptor = Object.getOwnPropertyDescriptor(input, key);
  if (descriptor === undefined || !Object.hasOwn(descriptor, "value")) { return refuse(); }
  return descriptor.value as unknown;
}
function retainReply(input: unknown): CurrentPcbCommonRetainedReply {
  const wrapper = rawRecord(input, ["result"]);
  const result = rawRecord(rawValue(wrapper, "result"), ["type", "value"]);
  const type = rawValue(result, "type"), value = rawValue(result, "value");
  if (type !== "string" || typeof value !== "string" || !value.isWellFormed() || Buffer.byteLength(value) > CURRENT_PCB_COMMON_GRAPH_BYTES) { return refuse(); }
  // Both exact own-data envelopes are immutable before the next native await.
  // Retain exact original text, not reconstructed decoded content.
  Object.freeze(result); Object.freeze(wrapper);
  if (rawValue(wrapper, "result") !== result || rawValue(result, "type") !== type || rawValue(result, "value") !== value) { return refuse(); }
  return Object.freeze({ result: Object.freeze({ type, value }) });
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
  #sample(phase: CommonPhase, scope: string, wrapper: string, bundle: string): Promise<unknown> {
    return this.#request({ commonPhase: phase, method: "Runtime.callFunctionOn",
      params: { ...EFFECTS, objectId: scope, functionDeclaration: PROGRAMS[phase], returnByValue: true,
        arguments: [{ objectId: wrapper }, { objectId: bundle }] } });
  }
  async #constructors(scope: string, wrapper: string): Promise<string> {
    const bundle = decodeCurrentPcbConstructorBundle(await this.#request({ commonPhase: "constructors", method: "Runtime.callFunctionOn",
      params: { ...EFFECTS, objectId: scope, functionDeclaration: CURRENT_PCB_CONSTRUCTOR_BUNDLE_FUNCTIONS.common,
        returnByValue: false, arguments: [{ objectId: wrapper }] } }), "common");
    const constructors = decodeCurrentPcbConstructorTuple(await this.#properties(bundle), "common"), prototypes = new Set<string>();
    for (const [index, name] of CURRENT_PCB_CONSTRUCTOR_BUNDLES.common.entries()) {
      const constructor = constructors[index]; if (constructor === undefined) { return refuse(); }
      const result = decodeCurrentPcbConstructorProperties(await this.#properties(constructor), this.#script, name, "common");
      if (prototypes.has(result.prototypeId)) { return refuse(); } prototypes.add(result.prototypeId);
    }
    return bundle;
  }
  #documentMatches(value: { readonly documentUuid: string }): void {
    if (value.documentUuid !== this.#document) { refuse(); }
  }
  public async observe(): Promise<CurrentPcbCommonBaselineObservation> {
    if (this.#consumed) { return refuse(); }
    this.#consumed = true;
    let cleanupFailed = false, replies: CurrentPcbCommonBaselineReplies | undefined,
      result: CurrentPcbCommonBaselineObservation | undefined, started = false;
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
      const bundle = await this.#constructors(scope, wrapper);
      const presentationReply = retainReply(await this.#sample("presentation", scope, wrapper, bundle));
      const presentation = decodeCurrentPcbCommonPresentation(presentationReply);
      this.#documentMatches(presentation);
      const rulesReply = retainReply(await this.#sample("rules", scope, wrapper, bundle));
      const rules = decodeCurrentPcbCommonRules(rulesReply); this.#documentMatches(rules);
      const preferenceReply = retainReply(await this.#sample("preference", scope, wrapper, bundle));
      const preference = decodeCurrentPcbCommonPreference(preferenceReply); this.#documentMatches(preference);
      const assetsReply = retainReply(await this.#sample("assets", scope, wrapper, bundle));
      const assets = decodeCurrentPcbStringEmptyAssets(assetsReply); this.#documentMatches(assets);
      const metadataReply = retainReply(await this.#request({ commonPhase: "metadata", method: "Runtime.callFunctionOn",
        params: { ...EFFECTS, objectId: scope, functionDeclaration: CURRENT_PCB_COMMON_METADATA_FUNCTION, returnByValue: true,
          arguments: [{ objectId: wrapper }] } }));
      const metadata = decodeCurrentPcbCommonMetadata(metadataReply); this.#documentMatches(metadata);
      replies = Object.freeze({ presentation: presentationReply, rules: rulesReply, preference: preferenceReply, assets: assetsReply, metadata: metadataReply });
      this.#phase = "bounds";
      const observation: CurrentPcbCommonBaselineObservation = freezeDeep({
        schema: "easyeda-pro-control.pcb-common-baseline-observation.v2", documentUuid: this.#document,
        presentation, rules, preference, assets, metadata, atomicSnapshotVerified: false, continuousObservation: false,
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
      let cleanup: "not-started" | "released" | "failed" = "not-started";
      if (started) { cleanup = cleanupFailed ? "failed" : "released"; }
      throw currentPcbCommonRunnerFailure(phase, cleanup, failures);
    }
    if (result === undefined || replies === undefined) { return refuse(); }
    retainedReplies.set(result, replies);
    return result;
  }
}
