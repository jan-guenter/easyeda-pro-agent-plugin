/** Original current-generation startup qualification, never a public writer. */
/* oxlint-disable import/max-dependencies -- Compose original generation, source pins and bounded evidence directly without a caller-selectable verifier. */
import { readExactUtf8Artifact, writePhaseArtifact } from "./artifacts.ts";
import type { ArtifactDescriptor } from "./artifacts.ts";
import { assertExpectedFingerprint, assertUpstreamReplySettled, canonicalJson, extractToolPayload, isRecord, sha256Json, sha256Text } from "./core.ts";
import { verifyCurrentProjectOnlySymbolPreflightImplementation, verifyCurrentSymbolPersistenceImplementation } from "./current-disposable-open-profile.ts";
import { buildCurrentProjectOnlySymbolGuard } from "./current-project-only-symbol-guard.ts";
// oxlint-disable-next-line import/no-cycle -- Startup consumes the original baseline generation now retained by disposable orchestration; a supplied issuer would weaken ownership.
import { assertCurrentProjectOnlySymbolGeneration, revalidateCurrentProjectOnlySymbolGeneration } from "./current-symbol-baseline-runtime.ts";
import type { CurrentProjectOnlySymbolGeneration, CurrentProjectOnlySymbolGenerationSource } from "./current-symbol-baseline-runtime.ts";
import { currentSymbolStartupExpectationSchema, selectCurrentSymbolStartupExpectation } from "./current-symbol-startup.ts";
import type { CurrentSymbolStartupExpectation } from "./current-symbol-startup.ts";
import { CURRENT_SYMBOL_STARTUP_STAGES, buildCurrentSymbolStartupGuard } from "./current-symbol-startup-guard.ts";
import type { EasyedaControlEngine } from "./engine.ts";
import { EXACT_READ_ENVELOPE_SCHEMA, decodeExactReadEnvelope } from "./exact-readers.ts";
import { readNativeHistoryCheckpoint } from "./native-history.ts";
import { validateSdkLocalRuntimeFingerprint } from "./sdk-local-runtime.ts";
import { exact } from "./symbol-clock-controls.ts";

export interface CurrentSymbolWriterStartup {
  readonly profile: "private.current-symbol-writer-startup.v1";
  readonly operationId: string;
  readonly expectation: CurrentSymbolStartupExpectation;
  readonly baselineSha256: string;
  readonly startupLocalChangesExcluded: true;
  readonly runtimeHoldersObserved: true;
  readonly crossInvocationReceiverContinuityVerified: false;
  readonly globalIdleVerified: false;
  readonly persistenceVerified: false;
  readonly executionAuthorized: false;
}
interface Original {
  readonly engine: EasyedaControlEngine; readonly generation: CurrentProjectOnlySymbolGeneration;
  readonly source: CurrentProjectOnlySymbolGenerationSource; readonly expectation: CurrentSymbolStartupExpectation;
  readonly text: string; readonly resultArtifact: ArtifactDescriptor;
}
const attempts = new WeakSet<CurrentProjectOnlySymbolGeneration>(), issued = new WeakMap<object, Original>();
const MAX_BYTES = 98_304;
interface Collection {
  readonly engine: EasyedaControlEngine;
  raw?: unknown; intentArtifact?: Readonly<ArtifactDescriptor>; resultArtifact?: Readonly<ArtifactDescriptor>;
  resultPublicationAttempted: boolean; failureObserved: boolean;
}
const collections = new WeakMap<CurrentProjectOnlySymbolGeneration, Collection>();
function need(condition: boolean): asserts condition { if (!condition) { throw new Error("Current symbol writer startup qualification refused."); } }

/** Retain the original failed return for closure diagnostics, never authority. */
export function currentSymbolStartupCollectionEvidence(generation: CurrentProjectOnlySymbolGeneration, engine: EasyedaControlEngine): Readonly<Record<string, unknown>> | undefined {
  const collection = collections.get(generation); if (collection === undefined) { return undefined; } need(collection.engine === engine);
  return Object.freeze({ profile: "private.current-symbol-startup-collection.v1", raw: collection.raw ?? null,
    rawRetained: Object.hasOwn(collection, "raw"), intentArtifact: collection.intentArtifact ?? null, resultArtifact: collection.resultArtifact ?? null,
    resultPublicationAttempted: collection.resultPublicationAttempted, failureObserved: collection.failureObserved, executionAuthorized: false });
}

/** The fixed observation is synchronous. It checks cached holders, without a
 * getter that starts initialization or asks the native worker to flush/save.
 */
export function buildCurrentSymbolStartupObservation(target: Readonly<{ projectUuid: string; branchUuid: string }>, expectation: CurrentSymbolStartupExpectation): string {
  exact(target, ["projectUuid", "branchUuid"]);
  need(/^[a-f0-9]{64}$/u.test(target.projectUuid) && /^[a-f0-9]{32}$/u.test(target.branchUuid));
  const selected = currentSymbolStartupExpectationSchema.parse(expectation);
  return `let startupStage='project-only-context';
const observation=(()=>{try{const root=globalThis,apply=Reflect.apply,target=${JSON.stringify(target)},startupExpected=${JSON.stringify(selected)},expired=false;
const bad=()=>{throw new Error('CURRENT_SYMBOL_STARTUP_FAILED');};
const own=(owner,key,optional=false)=>{if(owner===null||(typeof owner!=='object'&&typeof owner!=='function'))bad();const d=Object.getOwnPropertyDescriptor(owner,key);if(!d){if(optional&&!(key in owner))return undefined;bad();}if(!Object.hasOwn(d,'value'))bad();return d.value;};
const method=(owner,key)=>{const chain=[];let node=owner;for(let i=0;i<4;i++){if(node===null||(typeof node!=='object'&&typeof node!=='function'))bad();chain.push(node);const d=Object.getOwnPropertyDescriptor(node,key);if(d){if(!Object.hasOwn(d,'value')||typeof d.value!=='function')bad();return{owner,key,chain,fn:d.value};}node=Object.getPrototypeOf(node);}bad();};
const methodCheck=binding=>{for(let i=0;i<binding.chain.length;i++){const node=binding.chain[i];if(i>0&&Object.getPrototypeOf(binding.chain[i-1])!==node)bad();if(i===binding.chain.length-1){if(own(node,binding.key)!==binding.fn)bad();}else if(Object.hasOwn(node,binding.key))bad();}};
${buildCurrentProjectOnlySymbolGuard()}
${buildCurrentSymbolStartupGuard(true)}
startup.check();startupStage='project-only-context';projectOnly.check();startup.check();
return{profile:'private.current-symbol-startup-observation.v1',projectUuid:target.projectUuid,branchUuid:target.branchUuid,sheetUuids:startupExpected.sheetUuids,templates:startupExpected.templates,executionAuthorized:false};
}catch{return{profile:'private.current-symbol-startup-failure.v1',stage:startupStage,executionAuthorized:false};}})();
const json=JSON.stringify(observation),utf8Bytes=new TextEncoder().encode(json).byteLength;
const envelope={schema:${JSON.stringify(EXACT_READ_ENVELOPE_SCHEMA)},utf8Bytes,json};
if(utf8Bytes>${MAX_BYTES}||new TextEncoder().encode(JSON.stringify(envelope)).byteLength>${MAX_BYTES})throw new Error('CURRENT_SYMBOL_STARTUP_ENVELOPE');
return envelope;`;
}

export function decodeCurrentSymbolStartupObservation(raw: unknown, target: Readonly<{ projectUuid: string; branchUuid: string }>, expectation: CurrentSymbolStartupExpectation): void {
  assertUpstreamReplySettled(raw);
  const envelope = exact(extractToolPayload(raw), ["schema", "utf8Bytes", "json"]);
  need(envelope["schema"] === EXACT_READ_ENVELOPE_SCHEMA && typeof envelope["json"] === "string" &&
    envelope["json"].length > 0 && envelope["json"].length <= MAX_BYTES && Buffer.byteLength(JSON.stringify(envelope)) <= MAX_BYTES);
  const observation = decodeExactReadEnvelope(envelope);
  if (isRecord(observation) && observation["profile"] === "private.current-symbol-startup-failure.v1") {
    const failure = exact(observation, ["profile", "stage", "executionAuthorized"]), stage = failure["stage"];
    need(failure["executionAuthorized"] === false && CURRENT_SYMBOL_STARTUP_STAGES.some((allowed) => allowed === stage));
    throw new Error(`Current symbol writer startup qualification refused [startup:${String(stage)}].`);
  }
  const expected = { profile: "private.current-symbol-startup-observation.v1", ...target, sheetUuids: expectation.sheetUuids,
    templates: expectation.templates, executionAuthorized: false };
  need(canonicalJson(observation) === canonicalJson(expected));
}

export function assertCurrentSymbolWriterStartup(value: unknown, engine: EasyedaControlEngine,
  generation: CurrentProjectOnlySymbolGeneration): Original {
  need(value !== null && typeof value === "object"); const original = issued.get(value);
  need(original !== undefined && original.engine === engine && original.generation === generation && original.text === canonicalJson(value));
  const scope = engine.upstream.currentAuthenticatedBridgeDispatchBinding?.();
  need(assertCurrentProjectOnlySymbolGeneration(generation, engine, scope === undefined ? undefined : canonicalJson(scope)) === original.source);
  return original;
}
export async function revalidateCurrentSymbolWriterStartup(value: unknown, engine: EasyedaControlEngine,
  generation: CurrentProjectOnlySymbolGeneration): Promise<Original> {
  const original = assertCurrentSymbolWriterStartup(value, engine, generation);
  const check = (): void => { need(assertCurrentSymbolWriterStartup(value, engine, generation) === original); };
  const fingerprint = original.source.source.expectedFingerprint;
  assertExpectedFingerprint(fingerprint); validateSdkLocalRuntimeFingerprint(fingerprint);
  const root = fingerprint.installedBundles.assetsRoot;
  await verifyCurrentProjectOnlySymbolPreflightImplementation(root); check();
  await verifyCurrentSymbolPersistenceImplementation(root); check();
  await readExactUtf8Artifact(original.resultArtifact); check();
  return original;
}

/** Must run in the original generation's leased dispatch scope before writer
 * clocks. A fresh renderer invocation still includes the same fixed guard; this
 * token cannot promise object identity across requests. Failure consumes once.
 */
export async function qualifyCurrentSymbolWriterStartup(engine: EasyedaControlEngine,
  generation: CurrentProjectOnlySymbolGeneration): Promise<CurrentSymbolWriterStartup> {
  const scopeReader = engine.upstream.currentAuthenticatedBridgeDispatchBinding;
  need(scopeReader !== undefined); const scope = scopeReader.call(engine.upstream); need(scope !== undefined);
  const scopeText = canonicalJson(scope), source = assertCurrentProjectOnlySymbolGeneration(generation, engine, scopeText);
  need(!attempts.has(generation)); attempts.add(generation);
  const collection: Collection = { engine, resultPublicationAttempted: false, failureObserved: false }; collections.set(generation, collection);
  const evidenceId = `current-startup-${sha256Json({ operationId: generation.operationId })}`;
  try {
  const call = engine.upstream.callTool;
  const check = (): void => {
    need(engine.upstream.currentAuthenticatedBridgeDispatchBinding === scopeReader && canonicalJson(scopeReader.call(engine.upstream)) === scopeText &&
      engine.upstream.callTool === call && assertCurrentProjectOnlySymbolGeneration(generation, engine, scopeText) === source);
  };
  await revalidateCurrentProjectOnlySymbolGeneration(generation, engine, scopeText); check();
  const baseline = source.baseline, premises = baseline.startupPremises;
  need(premises.sqlSchemaSupported && premises.databaseVersion === "25.10.31.1" && premises.targetPcbSuppliesNonzeroNativeCount &&
    premises.blockers.every((entry) => entry === "active-schematic-pages"));
  const history = await readNativeHistoryCheckpoint({ checkpointPath: baseline.checkpoint.checkpoint, expectedSha256: baseline.checkpoint.checkpointSha256,
    projectUuid: baseline.preparation.target.projectUuid, libraryAtomHeaders: "preserve" }); check();
  need(history.semanticSha256 === premises.historySemanticSha256 && history.branchUuid === baseline.preparation.target.branchUuid);
  const expectation = selectCurrentSymbolStartupExpectation(history);
  need(expectation.sheetUuids.length === premises.activeSchematicPages);
  if (source.source.purpose === "ordinary-symbol-metadata") {
    need(source.source.startupExpectation !== undefined && canonicalJson(expectation) === canonicalJson(source.source.startupExpectation));
  }
  const fingerprint = source.source.expectedFingerprint;
  assertExpectedFingerprint(fingerprint); validateSdkLocalRuntimeFingerprint(fingerprint);
  const assetsRoot = fingerprint.installedBundles.assetsRoot;
  await verifyCurrentProjectOnlySymbolPreflightImplementation(assetsRoot); check();
  await verifyCurrentSymbolPersistenceImplementation(assetsRoot); check();
  await engine.assertBridgeDispatchAllowed(); check();
  const target = { projectUuid: history.projectUuid, branchUuid: history.branchUuid };
  const code = buildCurrentSymbolStartupObservation(target, expectation);
  const intent = await writePhaseArtifact(evidenceId, 0, "startup-intent", { target, expectation, codeSha256: sha256Text(code), baselineSha256: sha256Json(baseline),
    captureSha256: sha256Json(source.capture), executionAuthorized: false }); collection.intentArtifact = Object.freeze(intent); check();
  await readExactUtf8Artifact(intent); check();
  const raw = await call.call(engine.upstream, "easyeda_execute", { code, timeoutMs: 15_000, confirmWrite: true }, 25_000);
  collection.raw = raw;
  // Retain the original return before any owner, decoder or source check can
  // Fail. Raw evidence does not issue authority or make this attempt repeatable.
  collection.resultPublicationAttempted = true;
  const resultArtifact = await writePhaseArtifact(evidenceId, 0, "startup-result", { raw }); collection.resultArtifact = Object.freeze(resultArtifact); check();
  decodeCurrentSymbolStartupObservation(raw, target, expectation);
  await verifyCurrentProjectOnlySymbolPreflightImplementation(assetsRoot); check();
  await verifyCurrentSymbolPersistenceImplementation(assetsRoot); check();
  await revalidateCurrentProjectOnlySymbolGeneration(generation, engine, scopeText); check();
  const token: CurrentSymbolWriterStartup = Object.freeze({ profile: "private.current-symbol-writer-startup.v1", operationId: generation.operationId,
    expectation, baselineSha256: sha256Json(baseline), startupLocalChangesExcluded: true, runtimeHoldersObserved: true,
    crossInvocationReceiverContinuityVerified: false, globalIdleVerified: false, persistenceVerified: false, executionAuthorized: false });
  issued.set(token, { engine, generation, source, expectation, text: canonicalJson(token), resultArtifact }); return token;
  } catch (error) {
    collection.failureObserved = true;
    if (collection.intentArtifact !== undefined && !collection.resultPublicationAttempted) {
      collection.resultPublicationAttempted = true;
      try { collection.resultArtifact = Object.freeze(await writePhaseArtifact(evidenceId, 0, "startup-result", currentSymbolStartupCollectionEvidence(generation, engine))); }
      catch (retentionError) { throw new AggregateError([error, retentionError], "Current startup read failed and partial evidence publication failed; original attempt is retained.", { cause: retentionError }); }
    }
    throw error;
  }
}
