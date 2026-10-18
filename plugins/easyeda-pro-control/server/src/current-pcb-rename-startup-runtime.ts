/** Dormant original-generation PCB startup/metadata observation. No writer.
 * Settled holders do not prove the complete native AST equals stored source.
 * Pinned SCH d9d6a955 PCB see5765333 enters startBatch5549002 at depth zero,
 * which replaces both pending sets. Its title-only path never enqueues sheets;
 * the endBatch5549110 Xl/km source-model initialization loops are then empty.
 * Ja3651075 rebuilds derived AST/net/display data, not document source. Its
 * qZe/WZe/YZe reads use SYMBOL.GET_BY_TITLE and SHEET.GET_LOTS_ARR; ASTUpdate
 * clears temporary designator caches (SCH3873862) or refreshes assembly-view
 * data (UI3823ed6e16292042). The standardization subscriber is separately
 * excluded because its active UI path can fetch supplier data. These bounded
 * no-repair prerequisites do not replace the eventual complete closed-SQL
 * effect check, concurrent-event exclusion or original writer authority.
 */
/* oxlint-disable import/max-dependencies -- Compose original PCB generation, pinned neutral readers and bounded evidence without caller-selectable issuers. */
import { readExactUtf8Artifact, writePhaseArtifact } from "./artifacts.ts";
import type { ArtifactDescriptor } from "./artifacts.ts";
import { assertExpectedFingerprint, assertUpstreamReplySettled, canonicalJson, extractToolPayload, isRecord, sha256Json, sha256Text } from "./core.ts";
import { verifyCurrentProjectOnlySymbolPreflightImplementation, verifyCurrentSymbolPersistenceImplementation } from "./current-disposable-open-profile.ts";
import { assertOriginalCurrentPcbNativeMetadata, compareCurrentPcbNativeMetadata, prepareCurrentPcbNativeMetadata } from "./current-pcb-native-metadata.ts";
import type { CurrentPcbNativeMetadata } from "./current-pcb-native-metadata.ts";
import { assertCurrentProjectOnlyPcbRenameGeneration, assertOriginalCurrentPcbRenameGenerationEvidence,
  revalidateCurrentProjectOnlyPcbRenameGeneration } from "./current-pcb-rename-generation-runtime.ts";
import type { CurrentProjectOnlyPcbRenameGeneration, CurrentProjectOnlyPcbRenameGenerationSource } from "./current-pcb-rename-generation-runtime.ts";
import { buildCurrentPcbRenamePanelGuard } from "./current-pcb-rename-panel-guard.ts";
import { decodeCurrentPcbRenamePreflightReply, parseCurrentPcbRenamePreflightRequest } from "./current-pcb-rename-preflight.ts";
import type { CurrentPcbRenamePreflightRequest, CurrentPcbRenamePreflightResult } from "./current-pcb-rename-preflight.ts";
import { buildCurrentPcbRenamePreflightProgram } from "./current-pcb-rename-preflight-program.ts";
import { CURRENT_PCB_RENAME_STARTUP_STAGES, buildCurrentPcbRenameStartupGuard } from "./current-pcb-rename-startup-guard.ts";
import { buildCurrentProjectOnlySymbolGuard } from "./current-project-only-symbol-guard.ts";
import { currentSymbolStartupExpectationSchema, selectCurrentSymbolStartupExpectation } from "./current-symbol-startup.ts";
import type { CurrentSymbolStartupExpectation } from "./current-symbol-startup.ts";
import { CURRENT_SYMBOL_STARTUP_STAGES, buildCurrentSymbolStartupGuard } from "./current-symbol-startup-guard.ts";
import type { EasyedaControlEngine } from "./engine.ts";
import { EXACT_READ_ENVELOPE_SCHEMA, decodeExactReadEnvelope } from "./exact-readers.ts";
import { validateSdkLocalRuntimeFingerprint } from "./sdk-local-runtime.ts";
import { exact } from "./symbol-clock-controls.ts";

const MAX_BYTES = 1_048_576;
const LIMITATIONS = Object.freeze({ completeAstSourceBindingVerified: false, startupLocalChangesExcluded: false, permissionVerified: false,
  backendActorVerified: false, backendClockVerified: false, producerBindingVerified: false, writerAuthority: false,
  crossInvocationReceiverContinuityVerified: false, globalIdleVerified: false, persistenceVerified: false, executionAuthorized: false } as const);
export interface CurrentPcbRenameStartupObservation extends Readonly<typeof LIMITATIONS> {
  readonly profile: "private.current-pcb-rename-startup.v1";
  readonly operationId: string;
  readonly expectation: CurrentSymbolStartupExpectation;
  readonly projection: CurrentPcbNativeMetadata;
  readonly observation: CurrentPcbRenamePreflightResult;
  readonly baselineSha256: string;
  readonly runtimeHoldersObserved: true;
  readonly pcbAstSettledObserved: true;
}
interface Original {
  readonly engine: EasyedaControlEngine; readonly generation: CurrentProjectOnlyPcbRenameGeneration;
  readonly source: CurrentProjectOnlyPcbRenameGenerationSource; readonly projection: CurrentPcbNativeMetadata;
  readonly expectation: CurrentSymbolStartupExpectation; readonly observation: CurrentPcbRenamePreflightResult;
  readonly text: string; readonly resultArtifact: ArtifactDescriptor;
}
interface Collection {
  readonly engine: EasyedaControlEngine;
  raw?: unknown; intentArtifact?: Readonly<ArtifactDescriptor>; resultArtifact?: Readonly<ArtifactDescriptor>;
  resultPublicationAttempted: boolean; failureObserved: boolean;
}
const attempts = new WeakSet<CurrentProjectOnlyPcbRenameGeneration>(), collections = new WeakMap<CurrentProjectOnlyPcbRenameGeneration, Collection>();
const issued = new WeakMap<object, Original>();
function need(condition: boolean): asserts condition { if (!condition) { throw new Error("Current PCB startup observation refused."); } }

export function currentPcbRenameStartupCollectionEvidence(generation: CurrentProjectOnlyPcbRenameGeneration, engine: EasyedaControlEngine): Readonly<Record<string, unknown>> | undefined {
  const collection = collections.get(generation); if (collection === undefined) { return undefined; } need(collection.engine === engine);
  return Object.freeze({ profile: "private.current-pcb-rename-startup-collection.v1", raw: collection.raw ?? null,
    rawRetained: Object.hasOwn(collection, "raw"), intentArtifact: collection.intentArtifact ?? null, resultArtifact: collection.resultArtifact ?? null,
    resultPublicationAttempted: collection.resultPublicationAttempted, failureObserved: collection.failureObserved, ...LIMITATIONS });
}

/** One invocation retains startup owners around the fixed native preflight.
 * The wrapper never initializes, repairs or flushes a holder/queue. Native
 * reads still have their own timeout; no writer or retry is introduced.
 */
export function buildCurrentPcbRenameStartupObservation(request: CurrentPcbRenamePreflightRequest, expectation: CurrentSymbolStartupExpectation): string {
  const selected = parseCurrentPcbRenamePreflightRequest(request), startup = currentSymbolStartupExpectationSchema.parse(expectation);
  return `let startupStage='project-only-context',preflight=null;
const observation=await(async()=>{try{const root=globalThis,apply=Reflect.apply,target=${JSON.stringify(selected.target)},startupExpected=${JSON.stringify(startup)},expired=false;
const bad=()=>{throw new Error('CURRENT_PCB_RENAME_STARTUP_FAILED');};
const own=(owner,key,optional=false)=>{if(owner===null||(typeof owner!=='object'&&typeof owner!=='function'))bad();const d=Object.getOwnPropertyDescriptor(owner,key);if(!d){if(optional&&!(key in owner))return undefined;bad();}if(!Object.hasOwn(d,'value'))bad();return d.value;};
const method=(owner,key)=>{const chain=[];let node=owner;for(let i=0;i<4;i++){if(node===null||(typeof node!=='object'&&typeof node!=='function'))bad();chain.push(node);const d=Object.getOwnPropertyDescriptor(node,key);if(d){if(!Object.hasOwn(d,'value')||typeof d.value!=='function')bad();return{owner,key,chain,fn:d.value};}node=Object.getPrototypeOf(node);}bad();};
const methodCheck=binding=>{for(let i=0;i<binding.chain.length;i++){const node=binding.chain[i];if(i>0&&Object.getPrototypeOf(binding.chain[i-1])!==node)bad();if(i===binding.chain.length-1){if(own(node,binding.key)!==binding.fn)bad();}else if(Object.hasOwn(node,binding.key))bad();}};
${buildCurrentProjectOnlySymbolGuard()}
${buildCurrentSymbolStartupGuard(true)}
${buildCurrentPcbRenameStartupGuard(true)}
startupStage='auxiliary-panel';
${buildCurrentPcbRenamePanelGuard()}
startup.check();pcbRenameStartup.check();startupStage='auxiliary-panel';pcbRenamePanels.check();startupStage='preflight';
preflight=await(async()=>{${buildCurrentPcbRenamePreflightProgram(selected)}})();
startupStage='project-only-context';projectOnly.check();startup.check();pcbRenameStartup.check();startupStage='auxiliary-panel';pcbRenamePanels.check();
return{profile:'private.current-pcb-rename-startup-observation.v1',target,sheetUuids:startupExpected.sheetUuids,templates:startupExpected.templates,
preflight,runtimeHoldersObserved:true,pcbAstSettledObserved:true,...${JSON.stringify(LIMITATIONS)}};
}catch{return{profile:'private.current-pcb-rename-startup-failure.v1',stage:startupStage,preflight,...${JSON.stringify(LIMITATIONS)}};}})();
const json=JSON.stringify(observation),utf8Bytes=new TextEncoder().encode(json).byteLength,envelope={schema:${JSON.stringify(EXACT_READ_ENVELOPE_SCHEMA)},utf8Bytes,json};
if(utf8Bytes>${MAX_BYTES}||new TextEncoder().encode(JSON.stringify(envelope)).byteLength>${MAX_BYTES})throw new Error('CURRENT_PCB_RENAME_STARTUP_ENVELOPE');
return envelope;`;
}

export function decodeCurrentPcbRenameStartupObservation(raw: unknown, request: CurrentPcbRenamePreflightRequest,
  expectation: CurrentSymbolStartupExpectation): CurrentPcbRenamePreflightResult {
  assertUpstreamReplySettled(raw);
  const envelope = exact(extractToolPayload(raw), ["schema", "utf8Bytes", "json"]);
  need(envelope["schema"] === EXACT_READ_ENVELOPE_SCHEMA && typeof envelope["json"] === "string" && envelope["json"].length > 0 &&
    envelope["json"].length <= MAX_BYTES && Buffer.byteLength(JSON.stringify(envelope)) <= MAX_BYTES);
  const observed = decodeExactReadEnvelope(envelope);
  if (isRecord(observed) && observed["profile"] === "private.current-pcb-rename-startup-failure.v1") {
    const failure = exact(observed, ["profile", "stage", "preflight", ...Object.keys(LIMITATIONS)]), stage = failure["stage"];
    need(Object.entries(LIMITATIONS).every(([key, value]) => failure[key] === value) &&
      // Retain the old coarse label for historical failures, not new emission
      // Or a retrospective diagnosis of which predicate failed.
      [...CURRENT_SYMBOL_STARTUP_STAGES, ...CURRENT_PCB_RENAME_STARTUP_STAGES, "pcb-ast", "auxiliary-panel", "preflight"].some(allowed => allowed === stage));
    throw new Error(`Current PCB startup observation refused [startup:${String(stage)}].`);
  }
  const result = exact(observed, ["profile", "target", "sheetUuids", "templates", "preflight", "runtimeHoldersObserved", "pcbAstSettledObserved", ...Object.keys(LIMITATIONS)]);
  const { preflight, ...rest } = result;
  need(canonicalJson(rest) === canonicalJson({ profile: "private.current-pcb-rename-startup-observation.v1", target: request.target,
    sheetUuids: expectation.sheetUuids, templates: expectation.templates, runtimeHoldersObserved: true, pcbAstSettledObserved: true, ...LIMITATIONS }));
  return decodeCurrentPcbRenamePreflightReply({ content: [], structuredContent: { ok: true, result: preflight } }, request);
}

export function assertOriginalCurrentPcbRenameStartup(value: unknown, engine: EasyedaControlEngine,
  generation: CurrentProjectOnlyPcbRenameGeneration): Original {
  need(value !== null && typeof value === "object"); const original = issued.get(value);
  need(original !== undefined && original.engine === engine && original.generation === generation && original.text === canonicalJson(value));
  const scope = engine.upstream.currentAuthenticatedBridgeDispatchBinding?.();
  need(assertOriginalCurrentPcbRenameGenerationEvidence(generation, engine, scope === undefined ? undefined : canonicalJson(scope)) === original.source);
  assertOriginalCurrentPcbNativeMetadata(original.projection, original.source.baseline.inventory); return original;
}
export async function revalidateCurrentPcbRenameStartupObservation(value: unknown, engine: EasyedaControlEngine,
  generation: CurrentProjectOnlyPcbRenameGeneration): Promise<Original> {
  const original = assertOriginalCurrentPcbRenameStartup(value, engine, generation);
  const check = (): void => { need(assertOriginalCurrentPcbRenameStartup(value, engine, generation) === original); };
  const fingerprint = original.source.source.expectedFingerprint;
  assertExpectedFingerprint(fingerprint); validateSdkLocalRuntimeFingerprint(fingerprint); const root = fingerprint.installedBundles.assetsRoot;
  await verifyCurrentProjectOnlySymbolPreflightImplementation(root); check();
  await verifyCurrentSymbolPersistenceImplementation(root); check(); await readExactUtf8Artifact(original.resultArtifact); check(); return original;
}

/** One original generation/dispatch scope only. A failed observation consumes
 * its attempt; raw failure evidence is retained for cleanup, never retried.
 */
export async function collectCurrentPcbRenameStartupObservation(engine: EasyedaControlEngine,
  generation: CurrentProjectOnlyPcbRenameGeneration): Promise<CurrentPcbRenameStartupObservation> {
  const scopeReader = engine.upstream.currentAuthenticatedBridgeDispatchBinding; need(scopeReader !== undefined);
  const scope = scopeReader.call(engine.upstream); need(scope !== undefined);
  const scopeText = canonicalJson(scope), source = assertCurrentProjectOnlyPcbRenameGeneration(generation, engine, scopeText);
  need(!attempts.has(generation)); attempts.add(generation);
  const collection: Collection = { engine, resultPublicationAttempted: false, failureObserved: false }; collections.set(generation, collection);
  const evidenceId = `current-pcb-startup-${sha256Json({ operationId: generation.operationId })}`;
  try {
    const call = engine.upstream.callTool;
    const check = (): void => {
      need(engine.upstream.currentAuthenticatedBridgeDispatchBinding === scopeReader && canonicalJson(scopeReader.call(engine.upstream)) === scopeText &&
        engine.upstream.callTool === call && assertCurrentProjectOnlyPcbRenameGeneration(generation, engine, scopeText) === source);
    };
    await revalidateCurrentProjectOnlyPcbRenameGeneration(generation, engine, scopeText); check();
    const baseline = source.baseline, { target, desiredTitle } = baseline.intent;
    const projection = await prepareCurrentPcbNativeMetadata({ before: baseline.inventory, target, desiredTitle }); check();
    need(projection.baseline.historySha256 === baseline.history.semanticSha256 && projection.baseline.rawHistorySha256 === baseline.rawHistorySha256 &&
      projection.maximumTicket === baseline.maximumTicket && baseline.history.projectUuid === target.projectUuid && baseline.history.branchUuid === target.branchUuid &&
      baseline.history.projectOwnerUuid === target.ownerUuid);
    const expectation = selectCurrentSymbolStartupExpectation(baseline.history), fingerprint = source.source.expectedFingerprint;
    assertExpectedFingerprint(fingerprint); validateSdkLocalRuntimeFingerprint(fingerprint); const assetsRoot = fingerprint.installedBundles.assetsRoot;
    await verifyCurrentProjectOnlySymbolPreflightImplementation(assetsRoot); check();
    await verifyCurrentSymbolPersistenceImplementation(assetsRoot); check(); await engine.assertBridgeDispatchAllowed(); check();
    const code = buildCurrentPcbRenameStartupObservation(projection.request, expectation);
    const intent = await writePhaseArtifact(evidenceId, 0, "pcb-startup-intent", { target, expectation, projectionSha256: projection.projectionSha256,
      codeSha256: sha256Text(code), baselineSha256: sha256Json(baseline), captureSha256: sha256Json(source.capture), ...LIMITATIONS });
    collection.intentArtifact = Object.freeze(intent); check(); await readExactUtf8Artifact(intent); check();
    const raw = await call.call(engine.upstream, "easyeda_execute", { code, timeoutMs: 15_000, confirmWrite: true }, 25_000); collection.raw = raw;
    // Retain the original return before any fallible publication, identity,
    // Decoder, source or original-SQL comparison. Never turn failure into retry.
    collection.resultPublicationAttempted = true;
    const resultArtifact = await writePhaseArtifact(evidenceId, 0, "pcb-startup-result", { raw }); collection.resultArtifact = Object.freeze(resultArtifact); check();
    const observation = decodeCurrentPcbRenameStartupObservation(raw, projection.request, expectation);
    compareCurrentPcbNativeMetadata(projection, baseline.inventory, observation);
    await verifyCurrentProjectOnlySymbolPreflightImplementation(assetsRoot); check();
    await verifyCurrentSymbolPersistenceImplementation(assetsRoot); check();
    await revalidateCurrentProjectOnlyPcbRenameGeneration(generation, engine, scopeText); check();
    const token: CurrentPcbRenameStartupObservation = Object.freeze({ profile: "private.current-pcb-rename-startup.v1", operationId: generation.operationId,
      expectation, projection, observation, baselineSha256: sha256Json(baseline), runtimeHoldersObserved: true, pcbAstSettledObserved: true, ...LIMITATIONS });
    issued.set(token, Object.freeze({ engine, generation, source, projection, expectation, observation, text: canonicalJson(token), resultArtifact })); return token;
  } catch (error) {
    collection.failureObserved = true;
    if (collection.intentArtifact !== undefined && !collection.resultPublicationAttempted) {
      collection.resultPublicationAttempted = true;
      try { collection.resultArtifact = Object.freeze(await writePhaseArtifact(evidenceId, 0, "pcb-startup-result", currentPcbRenameStartupCollectionEvidence(generation, engine))); }
      catch (retentionError) { throw new AggregateError([error, retentionError], "Current PCB startup read failed and evidence publication failed; original attempt is retained.", { cause: retentionError }); }
    }
    throw error;
  }
}
