/** Original SCH generation startup collector. No writer, worker lease or
 * delayed-subscriber completion is inferred from matching observations. */
/* oxlint-disable import/max-dependencies -- Compose original SCH generation, pinned neutral readers and bounded evidence without caller-selectable issuers. */
import { readExactUtf8Artifact, writePhaseArtifact } from "./artifacts.ts";
import type { ArtifactDescriptor } from "./artifacts.ts";
import { assertExpectedFingerprint, assertUpstreamReplySettled, canonicalJson, extractToolPayload, isRecord, sha256Json, sha256Text } from "./core.ts";
import { verifyCurrentProjectOnlySymbolPreflightImplementation, verifyCurrentSymbolPersistenceImplementation } from "./current-disposable-open-profile.ts";
import { assertOriginalCurrentSchematicNativeMetadata } from "./current-schematic-native-metadata.ts";
import type { CurrentSchematicNativeMetadata } from "./current-schematic-native-metadata.ts";
import { assertCurrentProjectOnlySchematicRenameGeneration, assertOriginalCurrentSchematicRenameGenerationEvidence,
  revalidateCurrentProjectOnlySchematicRenameGeneration } from "./current-schematic-rename-generation-runtime.ts";
import type { CurrentProjectOnlySchematicRenameGeneration, CurrentProjectOnlySchematicRenameGenerationSource } from "./current-schematic-rename-generation-runtime.ts";
import { CURRENT_PCB_RENAME_PANEL_STAGES, buildCurrentPcbRenamePanelGuard } from "./current-pcb-rename-panel-guard.ts";
import { buildCurrentSchematicChildGuard } from "./current-schematic-child-guard.ts";
import { buildCurrentSchematicChildProgram } from "./current-schematic-child-program.ts";
import { decodeCurrentSchematicChildObservation } from "./current-schematic-child-observation.ts";
import { assertOriginalCurrentSchematicChildRoster, compareCurrentSchematicChildRoster } from "./current-schematic-child-roster.ts";
import type { CurrentSchematicChildObservation } from "./current-schematic-child-roster-contract.ts";
import { compareCurrentSchematicRenameObservation, decodeCurrentSchematicRenameObservation } from "./current-schematic-rename-observation.ts";
import type { CurrentSchematicRenameObservation } from "./current-schematic-rename-observation.ts";
import { parseCurrentSchematicRenamePreflightRequest } from "./current-schematic-rename-preflight.ts";
import type { CurrentSchematicRenamePreflightRequest } from "./current-schematic-rename-preflight.ts";
import { buildCurrentSchematicRenamePreflightProgram } from "./current-schematic-rename-preflight-program.ts";
import { buildCurrentProjectOnlySymbolGuard } from "./current-project-only-symbol-guard.ts";
import { currentSymbolStartupExpectationSchema } from "./current-symbol-startup.ts";
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
export interface CurrentSchematicRenameStartupObservation extends Readonly<typeof LIMITATIONS> {
  readonly profile: "private.current-schematic-rename-startup.v1";
  readonly operationId: string;
  readonly expectation: CurrentSymbolStartupExpectation;
  readonly projection: CurrentSchematicNativeMetadata;
  readonly observation: CurrentSchematicRenameObservation;
  readonly children: CurrentSchematicChildObservation;
  readonly baselineSha256: string;
  readonly runtimeHoldersObserved: true;
  readonly schematicAstSettledObserved: true;
}
interface Original {
  readonly engine: EasyedaControlEngine; readonly generation: CurrentProjectOnlySchematicRenameGeneration;
  readonly source: CurrentProjectOnlySchematicRenameGenerationSource; readonly projection: CurrentSchematicNativeMetadata;
  readonly expectation: CurrentSymbolStartupExpectation; readonly observation: CurrentSchematicRenameObservation;
  readonly text: string; readonly resultArtifact: ArtifactDescriptor;
}
interface Collection {
  readonly engine: EasyedaControlEngine;
  raw?: unknown; intentArtifact?: Readonly<ArtifactDescriptor>; resultArtifact?: Readonly<ArtifactDescriptor>;
  resultPublicationAttempted: boolean; failureObserved: boolean;
}
const attempts = new WeakSet<CurrentProjectOnlySchematicRenameGeneration>(), collections = new WeakMap<CurrentProjectOnlySchematicRenameGeneration, Collection>();
const issued = new WeakMap<object, Original>();
function need(condition: boolean): asserts condition { if (!condition) { throw new Error("Current SCH startup observation refused."); } }

export function currentSchematicRenameStartupCollectionEvidence(generation: CurrentProjectOnlySchematicRenameGeneration, engine: EasyedaControlEngine): Readonly<Record<string, unknown>> | undefined {
  const collection = collections.get(generation); if (collection === undefined) { return undefined; } need(collection.engine === engine);
  return Object.freeze({ profile: "private.current-schematic-rename-startup-collection.v1", raw: collection.raw ?? null,
    rawRetained: Object.hasOwn(collection, "raw"), intentArtifact: collection.intentArtifact ?? null, resultArtifact: collection.resultArtifact ?? null,
    resultPublicationAttempted: collection.resultPublicationAttempted, failureObserved: collection.failureObserved, ...LIMITATIONS });
}

/** One invocation retains startup owners around the fixed native preflight.
 * The wrapper never initializes, repairs or flushes a holder/queue. Native
 * reads still have their own timeout; no writer or retry is introduced.
 */
export function buildCurrentSchematicRenameStartupObservation(request: CurrentSchematicRenamePreflightRequest, expectation: CurrentSymbolStartupExpectation): string {
  const selected = parseCurrentSchematicRenamePreflightRequest(request), startup = currentSymbolStartupExpectationSchema.parse(expectation);
  return `let startupStage='project-only-context',preflight=null,children=null;
const observation=await(async()=>{try{const root=globalThis,apply=Reflect.apply,target=${JSON.stringify(selected.target)},startupExpected=${JSON.stringify(startup)},expired=false;
const bad=()=>{throw new Error('CURRENT_SCH_RENAME_STARTUP_FAILED');};
const own=(owner,key,optional=false)=>{if(owner===null||(typeof owner!=='object'&&typeof owner!=='function'))bad();const d=Object.getOwnPropertyDescriptor(owner,key);if(!d){if(optional&&!(key in owner))return undefined;bad();}if(!Object.hasOwn(d,'value'))bad();return d.value;};
const method=(owner,key)=>{const chain=[];let node=owner;for(let i=0;i<4;i++){if(node===null||(typeof node!=='object'&&typeof node!=='function'))bad();chain.push(node);const d=Object.getOwnPropertyDescriptor(node,key);if(d){if(!Object.hasOwn(d,'value')||typeof d.value!=='function')bad();return{owner,key,chain,fn:d.value};}node=Object.getPrototypeOf(node);}bad();};
const methodCheck=binding=>{for(let i=0;i<binding.chain.length;i++){const node=binding.chain[i];if(i>0&&Object.getPrototypeOf(binding.chain[i-1])!==node)bad();if(i===binding.chain.length-1){if(own(node,binding.key)!==binding.fn)bad();}else if(Object.hasOwn(node,binding.key))bad();}};
${buildCurrentProjectOnlySymbolGuard()}
${buildCurrentSymbolStartupGuard(true)}
startupStage='schematic-children';
${buildCurrentSchematicChildGuard()}
startupStage='auxiliary-panel';
${buildCurrentPcbRenamePanelGuard(true)}
startup.check();schematicChildren.check();startupStage='auxiliary-panel';pcbRenamePanels.check();startupStage='preflight';
preflight=await(async()=>{${buildCurrentSchematicRenamePreflightProgram(selected)}})();
startupStage='project-only-context';projectOnly.check();startup.check();schematicChildren.check();startupStage='auxiliary-panel';pcbRenamePanels.check();
startupStage='child-observation';children=await(async()=>{${buildCurrentSchematicChildProgram(selected)}})();
startupStage='project-only-context';projectOnly.check();startup.check();startupStage='schematic-children';schematicChildren.check();startupStage='auxiliary-panel';pcbRenamePanels.check();
return{profile:'private.current-schematic-rename-startup-observation.v1',target,sheetUuids:startupExpected.sheetUuids,templates:startupExpected.templates,
preflight,children,runtimeHoldersObserved:true,schematicAstSettledObserved:true,...${JSON.stringify(LIMITATIONS)}};
}catch{return{profile:'private.current-schematic-rename-startup-failure.v1',stage:startupStage,preflight,children,...${JSON.stringify(LIMITATIONS)}};}})();
const json=JSON.stringify(observation),utf8Bytes=new TextEncoder().encode(json).byteLength,envelope={schema:${JSON.stringify(EXACT_READ_ENVELOPE_SCHEMA)},utf8Bytes,json};
if(utf8Bytes>${MAX_BYTES}||new TextEncoder().encode(JSON.stringify(envelope)).byteLength>${MAX_BYTES})throw new Error('CURRENT_SCH_RENAME_STARTUP_ENVELOPE');
return envelope;`;
}

export function decodeCurrentSchematicRenameStartupObservation(raw: unknown, request: CurrentSchematicRenamePreflightRequest,
  expectation: CurrentSymbolStartupExpectation): Readonly<{ observation: CurrentSchematicRenameObservation; children: CurrentSchematicChildObservation }> {
  assertUpstreamReplySettled(raw);
  const envelope = exact(extractToolPayload(raw), ["schema", "utf8Bytes", "json"]);
  need(envelope["schema"] === EXACT_READ_ENVELOPE_SCHEMA && typeof envelope["json"] === "string" && envelope["json"].length > 0 &&
    envelope["json"].length <= MAX_BYTES && Buffer.byteLength(JSON.stringify(envelope)) <= MAX_BYTES);
  const observed = decodeExactReadEnvelope(envelope);
  if (isRecord(observed) && observed["profile"] === "private.current-schematic-rename-startup-failure.v1") {
    const failure = exact(observed, ["profile", "stage", "preflight", "children", ...Object.keys(LIMITATIONS)]), stage = failure["stage"];
    need(Object.entries(LIMITATIONS).every(([key, value]) => failure[key] === value) &&
      // Fixed diagnostics only; never echo private native exception text.
      [...CURRENT_SYMBOL_STARTUP_STAGES, ...CURRENT_PCB_RENAME_PANEL_STAGES,
        "schematic-children", "child-observation", "auxiliary-panel", "preflight"].some(allowed => allowed === stage));
    throw new Error(`Current SCH startup observation refused [startup:${String(stage)}].`);
  }
  const result = exact(observed, ["profile", "target", "sheetUuids", "templates", "preflight", "children", "runtimeHoldersObserved", "schematicAstSettledObserved", ...Object.keys(LIMITATIONS)]);
  const { preflight, children, ...rest } = result;
  need(canonicalJson(rest) === canonicalJson({ profile: "private.current-schematic-rename-startup-observation.v1", target: request.target,
    sheetUuids: expectation.sheetUuids, templates: expectation.templates, runtimeHoldersObserved: true, schematicAstSettledObserved: true, ...LIMITATIONS }));
  return Object.freeze({ observation: decodeCurrentSchematicRenameObservation({ content: [], structuredContent: { ok: true, result: preflight } }, request),
    children: decodeCurrentSchematicChildObservation({ content: [], structuredContent: { ok: true, result: children } }, request) });
}

export function assertOriginalCurrentSchematicRenameStartup(value: unknown, engine: EasyedaControlEngine,
  generation: CurrentProjectOnlySchematicRenameGeneration): Original {
  need(value !== null && typeof value === "object"); const original = issued.get(value);
  need(original !== undefined && original.engine === engine && original.generation === generation && original.text === canonicalJson(value));
  const scope = engine.upstream.currentAuthenticatedBridgeDispatchBinding?.();
  need(assertOriginalCurrentSchematicRenameGenerationEvidence(generation, engine, scope === undefined ? undefined : canonicalJson(scope)) === original.source);
  assertOriginalCurrentSchematicNativeMetadata(original.projection, original.source.baseline.inventory);
  assertOriginalCurrentSchematicChildRoster(original.source.baseline.children, original.source.baseline.inventory, original.projection); return original;
}
export async function revalidateCurrentSchematicRenameStartupObservation(value: unknown, engine: EasyedaControlEngine,
  generation: CurrentProjectOnlySchematicRenameGeneration): Promise<Original> {
  const original = assertOriginalCurrentSchematicRenameStartup(value, engine, generation);
  const check = (): void => { need(assertOriginalCurrentSchematicRenameStartup(value, engine, generation) === original); };
  const fingerprint = original.source.source.expectedFingerprint;
  assertExpectedFingerprint(fingerprint); validateSdkLocalRuntimeFingerprint(fingerprint); const root = fingerprint.installedBundles.assetsRoot;
  await verifyCurrentProjectOnlySymbolPreflightImplementation(root); check();
  await verifyCurrentSymbolPersistenceImplementation(root); check(); await readExactUtf8Artifact(original.resultArtifact); check(); return original;
}

/** One original generation/dispatch scope only. A failed observation consumes
 * its attempt; raw failure evidence is retained for cleanup, never retried.
 */
export async function collectCurrentSchematicRenameStartupObservation(engine: EasyedaControlEngine,
  generation: CurrentProjectOnlySchematicRenameGeneration): Promise<CurrentSchematicRenameStartupObservation> {
  const scopeReader = engine.upstream.currentAuthenticatedBridgeDispatchBinding; need(scopeReader !== undefined);
  const scope = scopeReader.call(engine.upstream); need(scope !== undefined);
  const scopeText = canonicalJson(scope), source = assertCurrentProjectOnlySchematicRenameGeneration(generation, engine, scopeText);
  need(!attempts.has(generation)); attempts.add(generation);
  const collection: Collection = { engine, resultPublicationAttempted: false, failureObserved: false }; collections.set(generation, collection);
  const evidenceId = `current-schematic-startup-${sha256Json({ operationId: generation.operationId })}`;
  try {
    const call = engine.upstream.callTool;
    const check = (): void => {
      need(engine.upstream.currentAuthenticatedBridgeDispatchBinding === scopeReader && canonicalJson(scopeReader.call(engine.upstream)) === scopeText &&
        engine.upstream.callTool === call && assertCurrentProjectOnlySchematicRenameGeneration(generation, engine, scopeText) === source);
    };
    await revalidateCurrentProjectOnlySchematicRenameGeneration(generation, engine, scopeText); check();
    const baseline = source.baseline, { target, desiredTitle } = baseline.intent;
    const projection = baseline.metadata, roster = baseline.children;
    assertOriginalCurrentSchematicNativeMetadata(projection, baseline.inventory);
    assertOriginalCurrentSchematicChildRoster(roster, baseline.inventory, projection); check();
    need(projection.request.desiredTitle === desiredTitle && canonicalJson(projection.request.target) === canonicalJson(target));
    need(projection.baseline.historySha256 === baseline.history.semanticSha256 && projection.baseline.rawHistorySha256 === baseline.rawHistorySha256 &&
      projection.maximumTicket === baseline.maximumTicket && baseline.history.projectUuid === target.projectUuid && baseline.history.branchUuid === target.branchUuid &&
      baseline.history.projectOwnerUuid === target.ownerUuid);
    const expectation = roster.startupInput, fingerprint = source.source.expectedFingerprint;
    assertExpectedFingerprint(fingerprint); validateSdkLocalRuntimeFingerprint(fingerprint); const assetsRoot = fingerprint.installedBundles.assetsRoot;
    await verifyCurrentProjectOnlySymbolPreflightImplementation(assetsRoot); check();
    await verifyCurrentSymbolPersistenceImplementation(assetsRoot); check(); await engine.assertBridgeDispatchAllowed(); check();
    const code = buildCurrentSchematicRenameStartupObservation(projection.request, expectation);
    const intent = await writePhaseArtifact(evidenceId, 0, "schematic-startup-intent", { target, expectation, projectionSha256: projection.projectionSha256,
      codeSha256: sha256Text(code), baselineSha256: sha256Json(baseline), captureSha256: sha256Json(source.capture), ...LIMITATIONS });
    collection.intentArtifact = Object.freeze(intent); check(); await readExactUtf8Artifact(intent); check();
    const raw = await call.call(engine.upstream, "easyeda_execute", { code, timeoutMs: 25_000, confirmWrite: true }, 35_000); collection.raw = raw;
    // Retain the original return before any fallible publication, identity,
    // Decoder, source or original-SQL comparison. Never turn failure into retry.
    collection.resultPublicationAttempted = true;
    const resultArtifact = await writePhaseArtifact(evidenceId, 0, "schematic-startup-result", { raw }); collection.resultArtifact = Object.freeze(resultArtifact); check();
    const { observation, children } = decodeCurrentSchematicRenameStartupObservation(raw, projection.request, expectation);
    compareCurrentSchematicRenameObservation(projection, baseline.inventory, observation);
    compareCurrentSchematicChildRoster(roster, baseline.inventory, children);
    await verifyCurrentProjectOnlySymbolPreflightImplementation(assetsRoot); check();
    await verifyCurrentSymbolPersistenceImplementation(assetsRoot); check();
    await revalidateCurrentProjectOnlySchematicRenameGeneration(generation, engine, scopeText); check();
    const token: CurrentSchematicRenameStartupObservation = Object.freeze({ profile: "private.current-schematic-rename-startup.v1", operationId: generation.operationId,
      expectation, projection, observation, children, baselineSha256: sha256Json(baseline), runtimeHoldersObserved: true, schematicAstSettledObserved: true, ...LIMITATIONS });
    issued.set(token, Object.freeze({ engine, generation, source, projection, expectation, observation, text: canonicalJson(token), resultArtifact })); return token;
  } catch (error) {
    collection.failureObserved = true;
    if (collection.intentArtifact !== undefined && !collection.resultPublicationAttempted) {
      collection.resultPublicationAttempted = true;
      try { collection.resultArtifact = Object.freeze(await writePhaseArtifact(evidenceId, 0, "schematic-startup-result", currentSchematicRenameStartupCollectionEvidence(generation, engine))); }
      catch (retentionError) { throw new AggregateError([error, retentionError], "Current SCH startup read failed and evidence publication failed; original attempt is retained.", { cause: retentionError }); }
    }
    throw error;
  }
}

