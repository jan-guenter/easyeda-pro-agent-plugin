/* oxlint-disable import/max-dependencies -- Fixed209 runner composes passive packet readers, independent exact scopes and original issuance; no dynamic dispatch. */
/** Fixed209 common-state observation used only by the original contained
 * owner after complete209 PCB source/context admission. No writer, FileSource or Save
 * authority follows from these samples or their later stored comparison. */
import { CURRENT_PCB_209_COMMON_CONSTRUCTOR_FUNCTION, CURRENT_PCB_209_COMMON_EMPTY_ASSETS_FUNCTION,
  CURRENT_PCB_209_COMMON_METADATA_FUNCTION, CURRENT_PCB_209_COMMON_PACKET_SEEDS } from "./current-pcb-209-common-program.ts";
import { decodeCurrentPcb209CommonConstructorProperties } from "./current-pcb-209-common-constructor-scope.ts";
import { types } from "node:util";
import { canonicalJson, sha256Json, sha256Text } from "./core.ts";
import { currentPcbCommonRunnerFailure } from "./current-pcb-common-baseline-failure.ts";
import { CURRENT_PCB_COMMON_GRAPH_BYTES } from "./current-pcb-common-graph.ts";
import { decodeCurrentPcbCommonMetadata } from "./current-pcb-common-metadata.ts";
import type { CurrentPcbCommonMetadata } from "./current-pcb-common-metadata.ts";
import { decodeCurrentPcbCommonPreference, decodeCurrentPcbCommonPresentation,
  decodeCurrentPcbCommonRules } from "./current-pcb-common-state.ts";
import type { CurrentPcbCommonPreference, CurrentPcbCommonPresentation, CurrentPcbCommonRules } from "./current-pcb-common-state.ts";
import { CURRENT_PCB_COMMON_PACKET_ADVANCE, CURRENT_PCB_COMMON_PACKET_MAX_STEPS, CURRENT_PCB_COMMON_PACKET_MAX_TEXT_BYTES,
  CURRENT_PCB_COMMON_PACKET_READ, CURRENT_PCB_COMMON_PACKET_RESULT } from "./current-pcb-common-packet-program.ts";
import { decodeCurrentPcbCommonPacketChunk, decodeCurrentPcbCommonPacketHandle } from "./current-pcb-common-packet.ts";
import type { CurrentPcbCommonPacketChunk } from "./current-pcb-common-packet.ts";
import { CURRENT_PCB_CONSTRUCTOR_BUNDLES, decodeCurrentPcbConstructorBundle,
  decodeCurrentPcbConstructorTuple } from "./current-pcb-constructor-scope.ts";
import { CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION, CURRENT_PCB_DIAGNOSTIC_MODEL_HANDLER_FUNCTION } from "./current-pcb-diagnostic-model-program.ts";
import { decodeCurrentPcb209CommonModelFunction, decodeCurrentPcb209CommonModelScope,
  decodeCurrentPcb209CommonModelScopeList } from "./current-pcb-209-common-model-scope.ts";
import { decodeCurrentPcbStringEmptyAssets } from "./current-pcb-string-empty-assets.ts";
import type { CurrentPcbStringEmptyAssets } from "./current-pcb-string-empty-assets.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_209_COMMON_BASELINE_OBJECT_GROUP = "easyeda-pro-control-pcb209-common-baseline-v1";
/** Fixed maximum: twelve scope/constructor requests, three bounded packet
 * streams with native final results, two plain readers and one group release. */
export const CURRENT_PCB_209_COMMON_BASELINE_REQUEST_COUNT = 15 + 3 * (CURRENT_PCB_COMMON_PACKET_MAX_STEPS * 2 + 1);
export const CURRENT_PCB_209_COMMON_BASELINE_MAX_BYTES = 2_121_728;
export const CURRENT_PCB_209_COMMON_BASELINE_CHUNK_MAX_BYTES = 2_097_152;
const EFFECTS = Object.freeze({ throwOnSideEffect: true, silent: true, awaitPromise: false,
  generatePreview: false, userGesture: false } as const);
type PacketLeaf = "presentation" | "rules" | "preference";
type SamplePhase = PacketLeaf | "assets" | "metadata";
type PacketPhase = `${PacketLeaf}-seed` | "packet-advance" | "packet-read" | "packet-result";
type Phase = SamplePhase | PacketPhase | "owner" | "owner-final" | "wrapper" | "properties" | "handler" | "constructors" | "bounds" | "release";

export type CurrentPcb209CommonBaselineCommand =
  | Readonly<{ commonPhase: "wrapper"; method: "Runtime.evaluate"; params: typeof EFFECTS & Readonly<{
    expression: typeof CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION; uniqueContextId: string;
    objectGroup: typeof CURRENT_PCB_209_COMMON_BASELINE_OBJECT_GROUP; returnByValue: false; timeout: 1000;
    includeCommandLineAPI: false; allowUnsafeEvalBlockedByCSP: false;
  }> }>
  | Readonly<{ commonPhase: "properties"; method: "Runtime.getProperties"; params: Readonly<{
    objectId: string; ownProperties: true; accessorPropertiesOnly: false; generatePreview: false;
  }> }>
  | Readonly<{ commonPhase: "handler"; method: "Runtime.callFunctionOn"; params: typeof EFFECTS & Readonly<{
    objectId: string; functionDeclaration: typeof CURRENT_PCB_DIAGNOSTIC_MODEL_HANDLER_FUNCTION; returnByValue: false;
  }> }>
  | Readonly<{ commonPhase: "constructors"; method: "Runtime.callFunctionOn"; params: typeof EFFECTS & Readonly<{
    objectId: string; functionDeclaration: typeof CURRENT_PCB_209_COMMON_CONSTRUCTOR_FUNCTION; returnByValue: false;
    arguments: readonly [Readonly<{ objectId: string }>];
  }> }>
  | Readonly<{ commonPhase: "metadata"; method: "Runtime.callFunctionOn"; params: typeof EFFECTS & Readonly<{
    objectId: string; functionDeclaration: typeof CURRENT_PCB_209_COMMON_METADATA_FUNCTION; returnByValue: true;
    arguments: readonly [Readonly<{ objectId: string }>];
  }> }>
  | Readonly<{ commonPhase: "assets"; method: "Runtime.callFunctionOn"; params: typeof EFFECTS & Readonly<{
    objectId: string; functionDeclaration: string; returnByValue: true;
    arguments: readonly [Readonly<{ objectId: string }>, Readonly<{ objectId: string }>];
  }> }>
  | Readonly<{ commonPhase: `${PacketLeaf}-seed`; method: "Runtime.callFunctionOn"; params: typeof EFFECTS & Readonly<{
    objectId: string; functionDeclaration: string; objectGroup: typeof CURRENT_PCB_209_COMMON_BASELINE_OBJECT_GROUP; returnByValue: false;
    arguments: readonly [Readonly<{ objectId: string }>, Readonly<{ objectId: string }>];
  }> }>
  | Readonly<{ commonPhase: "packet-advance" | "packet-read" | "packet-result"; method: "Runtime.callFunctionOn"; params: typeof EFFECTS & Readonly<{
    objectId: string; functionDeclaration: string; objectGroup: typeof CURRENT_PCB_209_COMMON_BASELINE_OBJECT_GROUP; returnByValue: boolean;
  }> }>
  | Readonly<{ commonPhase: "release"; method: "Runtime.releaseObjectGroup"; params: Readonly<{
    objectGroup: typeof CURRENT_PCB_209_COMMON_BASELINE_OBJECT_GROUP;
  }> }>;

export interface CurrentPcb209CommonBaselineTransport {
  /** Original retained PCB page transport only. No new attachment or selection. */
  readonly request: (command: CurrentPcb209CommonBaselineCommand) => Promise<unknown>;
  /** Recheck original owner, complete source and unique context at each await. */
  readonly assertCurrent: () => void;
}
export interface CurrentPcb209CommonBaselineObservation {
  readonly schema: "easyeda-pro-control.pcb209-common-baseline-observation.v1";
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
export type CurrentPcb209CommonBaselineReplies = Readonly<Record<SamplePhase, CurrentPcbCommonRetainedReply>>;
const retainedReplies = new WeakMap<CurrentPcb209CommonBaselineObservation, CurrentPcb209CommonBaselineReplies>();
export type CurrentPcb209CommonBaselineChunks = Readonly<Record<PacketLeaf, readonly CurrentPcbCommonRetainedReply[]>>;
const retainedChunks = new WeakMap<CurrentPcb209CommonBaselineObservation, CurrentPcb209CommonBaselineChunks>();
export interface CurrentPcb209CommonBaselineChunkMetadata {
  readonly schema: "easyeda-pro-control.pcb209-common-chunk-metadata.v1";
  readonly leaves: Readonly<Record<PacketLeaf, Readonly<{ count: number; bytes: number; transcriptSha256: string }>>>;
  readonly totalBytes: number;
  readonly atomicSnapshotVerified: false;
  readonly executionAuthorized: false;
}
/** Original exact packet-read strings; kept independently from native RESULT. */
export function requireOriginalCurrentPcb209CommonBaselineChunks(observation: CurrentPcb209CommonBaselineObservation): CurrentPcb209CommonBaselineChunks {
  const chunks = retainedChunks.get(observation); if (chunks === undefined) { return refuse(); } return chunks;
}
export function currentPcb209CommonBaselineChunkMetadata(observation: CurrentPcb209CommonBaselineObservation): CurrentPcb209CommonBaselineChunkMetadata {
  const chunks = requireOriginalCurrentPcb209CommonBaselineChunks(observation);
  const leaf = (name: PacketLeaf): Readonly<{ count: number; bytes: number; transcriptSha256: string }> => Object.freeze({
    count: chunks[name].length, bytes: chunks[name].reduce((sum, reply) => sum + Buffer.byteLength(reply.result.value), 0),
    transcriptSha256: sha256Json(chunks[name].map(reply => sha256Text(reply.result.value))),
  });
  const leaves = Object.freeze({ presentation: leaf("presentation"), rules: leaf("rules"), preference: leaf("preference") });
  return Object.freeze({ schema: "easyeda-pro-control.pcb209-common-chunk-metadata.v1", leaves,
    totalBytes: leaves.presentation.bytes + leaves.rules.bytes + leaves.preference.bytes,
    atomicSnapshotVerified: false, executionAuthorized: false });
}

/** Original runner issuance only, not current native ownership, freshness,
 * interval completion or execution authority. No decoded-data reserialization. */
export function requireOriginalCurrentPcb209CommonBaselineReplies(observation: CurrentPcb209CommonBaselineObservation): CurrentPcb209CommonBaselineReplies {
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

export class CurrentPcb209CommonBaselineRunner {
  readonly #transport: CurrentPcb209CommonBaselineTransport;
  readonly #script: string;
  readonly #context: string;
  readonly #document: string;
  #consumed = false;
  #phase: Phase = "owner";
  public constructor(transport: CurrentPcb209CommonBaselineTransport, scriptId: string, uniqueContextId: string, documentUuid: string) {
    this.#transport = Object.freeze({ request: transport.request, assertCurrent: transport.assertCurrent });
    this.#script = handle(scriptId); this.#context = handle(uniqueContextId);
    if (!/^(?:[a-f\d]{16}|[a-f\d]{32})$/u.test(documentUuid)) { refuse(); }
    this.#document = documentUuid;
  }
  async #request(command: CurrentPcb209CommonBaselineCommand): Promise<unknown> {
    this.#phase = command.commonPhase; this.#transport.assertCurrent();
    const arrived = await this.#transport.request(freezeDeep(command));
    // Seal raw text on arrival, before an owner hook can mutate an alias to the
    // Transport envelope. Ownership must still pass before sample consumption
    // Or another dispatch; validating this bounded envelope grants no authority.
    let reply = arrived;
    if (["packet-read", "packet-result", "assets", "metadata"].includes(command.commonPhase)) { reply = retainReply(arrived); }
    else if (command.commonPhase.endsWith("-seed") || command.commonPhase === "packet-advance") {
      reply = Object.freeze({ result: Object.freeze({ type: "object", className: "Object", description: "Object",
        objectId: decodeCurrentPcbCommonPacketHandle(arrived) }) });
    }
    this.#transport.assertCurrent(); return reply;
  }
  #properties(objectId: string): Promise<unknown> {
    return this.#request({ commonPhase: "properties", method: "Runtime.getProperties",
      params: { objectId: handle(objectId), ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } });
  }
  #assets(scope: string, wrapper: string, bundle: string): Promise<unknown> {
    return this.#request({ commonPhase: "assets", method: "Runtime.callFunctionOn",
      params: { ...EFFECTS, objectId: scope, functionDeclaration: CURRENT_PCB_209_COMMON_EMPTY_ASSETS_FUNCTION, returnByValue: true,
        arguments: [{ objectId: wrapper }, { objectId: bundle }] } });
  }
  async #packet(leaf: PacketLeaf, scope: string, wrapper: string, bundle: string): Promise<Readonly<{
    reply: CurrentPcbCommonRetainedReply; chunks: readonly CurrentPcbCommonRetainedReply[];
  }>> {
    let objectId = decodeCurrentPcbCommonPacketHandle(await this.#request({ commonPhase: `${leaf}-seed`, method: "Runtime.callFunctionOn",
      params: { ...EFFECTS, objectId: scope, functionDeclaration: CURRENT_PCB_209_COMMON_PACKET_SEEDS[leaf],
        objectGroup: CURRENT_PCB_209_COMMON_BASELINE_OBJECT_GROUP, returnByValue: false,
        arguments: [{ objectId: wrapper }, { objectId: bundle }] } }));
    const chunks: CurrentPcbCommonRetainedReply[] = [], handles = new Set([objectId]);
    let bytes = 0, previous: CurrentPcbCommonPacketChunk | undefined;
    for (let sequence = 0; sequence < CURRENT_PCB_COMMON_PACKET_MAX_STEPS; sequence += 1) {
      const reply = retainReply(await this.#request({ commonPhase: "packet-read", method: "Runtime.callFunctionOn",
        params: { ...EFFECTS, objectId, functionDeclaration: CURRENT_PCB_COMMON_PACKET_READ,
          objectGroup: CURRENT_PCB_209_COMMON_BASELINE_OBJECT_GROUP, returnByValue: true } }));
      const size = Buffer.byteLength(reply.result.value); bytes += size;
      if (size > CURRENT_PCB_COMMON_PACKET_MAX_TEXT_BYTES || bytes > CURRENT_PCB_209_COMMON_BASELINE_CHUNK_MAX_BYTES) { refuse(); }
      const chunk = decodeCurrentPcbCommonPacketChunk(reply); this.#documentMatches(chunk);
      if (chunk.sequence !== sequence || chunk.sourceSchema !== `easyeda-pro-control.pcb-common-${leaf}.v2` ||
          (sequence === 0 ? chunk.roots === null || chunk.phase !== "capture" || chunk.events.length > 0 : chunk.roots !== null)) { refuse(); }
      if (previous !== undefined && (chunk.nodes < previous.nodes || chunk.fields < previous.fields ||
          chunk.stringUnits < previous.stringUnits || chunk.records < previous.records ||
          previous.phase === "verify" && chunk.phase === "capture" ||
          previous.phase !== "capture" && chunk.events.length > 0)) { refuse(); }
      chunks.push(reply);
      if (chunk.phase === "complete") {
        const result = retainReply(await this.#request({ commonPhase: "packet-result", method: "Runtime.callFunctionOn",
          params: { ...EFFECTS, objectId, functionDeclaration: CURRENT_PCB_COMMON_PACKET_RESULT,
            objectGroup: CURRENT_PCB_209_COMMON_BASELINE_OBJECT_GROUP, returnByValue: true } }));
        return Object.freeze({ reply: result, chunks: Object.freeze(chunks) });
      }
      if (sequence + 1 === CURRENT_PCB_COMMON_PACKET_MAX_STEPS) { return refuse(); }
      previous = chunk;
      objectId = decodeCurrentPcbCommonPacketHandle(await this.#request({ commonPhase: "packet-advance", method: "Runtime.callFunctionOn",
        params: { ...EFFECTS, objectId, functionDeclaration: CURRENT_PCB_COMMON_PACKET_ADVANCE,
          objectGroup: CURRENT_PCB_209_COMMON_BASELINE_OBJECT_GROUP, returnByValue: false } }));
      if (handles.has(objectId)) { refuse(); } handles.add(objectId);
    }
    return refuse();
  }
  async #constructors(scope: string, wrapper: string): Promise<string> {
    const bundle = decodeCurrentPcbConstructorBundle(await this.#request({ commonPhase: "constructors", method: "Runtime.callFunctionOn",
      params: { ...EFFECTS, objectId: scope, functionDeclaration: CURRENT_PCB_209_COMMON_CONSTRUCTOR_FUNCTION,
        returnByValue: false, arguments: [{ objectId: wrapper }] } }), "common");
    const constructors = decodeCurrentPcbConstructorTuple(await this.#properties(bundle), "common"), prototypes = new Set<string>();
    for (const [index, name] of CURRENT_PCB_CONSTRUCTOR_BUNDLES.common.entries()) {
      const constructor = constructors[index]; if (constructor === undefined) { return refuse(); }
      const result = decodeCurrentPcb209CommonConstructorProperties(await this.#properties(constructor), this.#script, name, "common");
      if (prototypes.has(result.prototypeId)) { return refuse(); } prototypes.add(result.prototypeId);
    }
    return bundle;
  }
  #documentMatches(value: { readonly documentUuid: string }): void {
    if (value.documentUuid !== this.#document) { refuse(); }
  }
  public async observe(): Promise<CurrentPcb209CommonBaselineObservation> {
    if (this.#consumed) { return refuse(); }
    this.#consumed = true;
    let chunks: CurrentPcb209CommonBaselineChunks | undefined, cleanupFailed = false, replies: CurrentPcb209CommonBaselineReplies | undefined,
      result: CurrentPcb209CommonBaselineObservation | undefined, started = false;
    const failures: unknown[] = [];
    try {
      this.#transport.assertCurrent(); started = true;
      const wrapper = decodeCurrentPcb209CommonModelFunction(await this.#request({
        commonPhase: "wrapper", method: "Runtime.evaluate", params: { ...EFFECTS,
          expression: CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION, uniqueContextId: this.#context,
          objectGroup: CURRENT_PCB_209_COMMON_BASELINE_OBJECT_GROUP, returnByValue: false, timeout: 1000,
          includeCommandLineAPI: false, allowUnsafeEvalBlockedByCSP: false },
      }), "rpc-wrapper");
      const wrapperScopes = decodeCurrentPcb209CommonModelScopeList(await this.#properties(wrapper), this.#script, "rpc-wrapper");
      const wrapperScope = decodeCurrentPcb209CommonModelScope(await this.#properties(wrapperScopes), "rpc-wrapper");
      const handler = decodeCurrentPcb209CommonModelFunction(await this.#request({
        commonPhase: "handler", method: "Runtime.callFunctionOn", params: { ...EFFECTS, objectId: wrapperScope,
          functionDeclaration: CURRENT_PCB_DIAGNOSTIC_MODEL_HANDLER_FUNCTION, returnByValue: false },
      }), "save-handler");
      const handlerScopes = decodeCurrentPcb209CommonModelScopeList(await this.#properties(handler), this.#script, "save-handler");
      const scope = decodeCurrentPcb209CommonModelScope(await this.#properties(handlerScopes), "save-handler");
      const bundle = await this.#constructors(scope, wrapper);
      const presentationPackets = await this.#packet("presentation", scope, wrapper, bundle), presentationReply = presentationPackets.reply;
      const presentation = decodeCurrentPcbCommonPresentation(presentationReply);
      this.#documentMatches(presentation);
      const rulesPackets = await this.#packet("rules", scope, wrapper, bundle), rulesReply = rulesPackets.reply;
      const rules = decodeCurrentPcbCommonRules(rulesReply); this.#documentMatches(rules);
      const preferencePackets = await this.#packet("preference", scope, wrapper, bundle), preferenceReply = preferencePackets.reply;
      const preference = decodeCurrentPcbCommonPreference(preferenceReply); this.#documentMatches(preference);
      const assetsReply = retainReply(await this.#assets(scope, wrapper, bundle));
      const assets = decodeCurrentPcbStringEmptyAssets(assetsReply); this.#documentMatches(assets);
      const metadataReply = retainReply(await this.#request({ commonPhase: "metadata", method: "Runtime.callFunctionOn",
        params: { ...EFFECTS, objectId: scope, functionDeclaration: CURRENT_PCB_209_COMMON_METADATA_FUNCTION, returnByValue: true,
          arguments: [{ objectId: wrapper }] } }));
      const metadata = decodeCurrentPcbCommonMetadata(metadataReply); this.#documentMatches(metadata);
      replies = Object.freeze({ presentation: presentationReply, rules: rulesReply, preference: preferenceReply, assets: assetsReply, metadata: metadataReply });
      chunks = Object.freeze({ presentation: presentationPackets.chunks, rules: rulesPackets.chunks, preference: preferencePackets.chunks });
      this.#phase = "bounds";
      const observation: CurrentPcb209CommonBaselineObservation = freezeDeep({
        schema: "easyeda-pro-control.pcb209-common-baseline-observation.v1", documentUuid: this.#document,
        presentation, rules, preference, assets, metadata, atomicSnapshotVerified: false, continuousObservation: false,
        originalOwnerVerified: false, completeLiveBaselineVerified: false, storedSourceMatched: false,
        queueCompletionVerified: false, saveAuthorized: false, executionAuthorized: false,
      });
      if (Buffer.byteLength(canonicalJson(observation)) > CURRENT_PCB_209_COMMON_BASELINE_MAX_BYTES) { refuse(); }
      this.#transport.assertCurrent(); result = observation;
    } catch (caughtError) { failures.push(caughtError); }
    let failurePhase = this.#phase;
    if (started) {
      try {
        // Cleanup uses only the original group's retained transport. Failure
        // Withholds the observation without replacing an earlier exception.
        emptyReply(await this.#transport.request(freezeDeep({ commonPhase: "release", method: "Runtime.releaseObjectGroup",
          params: { objectGroup: CURRENT_PCB_209_COMMON_BASELINE_OBJECT_GROUP } })));
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
    if (result === undefined || replies === undefined || chunks === undefined) { return refuse(); }
    retainedReplies.set(result, replies);
    retainedChunks.set(result, chunks);
    return result;
  }
}
