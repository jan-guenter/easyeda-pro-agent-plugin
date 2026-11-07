/* oxlint-disable import/max-dependencies -- The original page owner composes fixed source/checkpoint programs, tracked execution authority and its separate no-replay cleanup owner. */
import { createOperation, listOperationIds, loadOperation, operationPath, updateOperation, writePhaseArtifact } from "./artifacts.ts";
import { OPERATION_SCHEMA, assertExpectedFingerprint, assertSubset, assertUpstreamReplySettled, buildPlanHash, canonicalJson, extractToolPayload, sha256Json, sha256Text } from "./core.ts";
import type { EasyedaControlEngine, TrackedDispatchOperationJournal } from "./engine.ts";
import { decodeExactReadEnvelope } from "./exact-readers.ts";
import { CURRENT_SCHEMATIC_PAGE_OPENING_PROFILE, currentSchematicPageOpeningIdSchema, currentSchematicPageOpeningRequestSchema,
  currentSchematicPageOpeningResultSchema } from "./current-schematic-page-opening.ts";
import type { CurrentSchematicPageOpeningRequest, CurrentSchematicPageOpeningTarget } from "./current-schematic-page-opening.ts";
import { prepareCurrentSchematicPageOpeningCheckpoint, verifyCurrentSchematicPageOpeningCheckpoint } from "./current-schematic-page-opening-checkpoint.ts";
import { buildCurrentSchematicPageOpeningProgram } from "./current-schematic-page-opening-program.ts";
import { verifyCurrentSchematicPageOpeningImplementation } from "./current-schematic-page-read-profile.ts";
import type { OrdinaryTrackedOpenCleanup } from "./ordinary-tracked-open-cleanup.ts";
import type { SdkLocalEngine } from "./sdk-local-runtime.ts";
import { validateSdkPublicReadersFingerprint } from "./sdk-public-readers-runtime.ts";

export type CurrentSchematicPageOpeningEngine = SdkLocalEngine & Pick<EasyedaControlEngine, "dispatchWithOrphanTracking">;
type Engine = CurrentSchematicPageOpeningEngine;
type Journal = TrackedDispatchOperationJournal;
type NativeResult = ReturnType<typeof currentSchematicPageOpeningResultSchema.parse>;
export interface CurrentSchematicPageOpeningDependencies {
  readonly prepareCheckpoint?: typeof prepareCurrentSchematicPageOpeningCheckpoint;
  readonly verifyCheckpoint?: typeof verifyCurrentSchematicPageOpeningCheckpoint;
  readonly verifyImplementation?: typeof verifyCurrentSchematicPageOpeningImplementation;
}
function need(value: boolean): asserts value { if (!value) { throw new Error("SCH209_OPEN_OWNER_OR_JOURNAL_CHANGED"); } }
function decode(raw: unknown, target: CurrentSchematicPageOpeningTarget, phase: "preflight" | "open"): NativeResult {
  assertUpstreamReplySettled(raw); const envelope = extractToolPayload(raw);
  need(Buffer.byteLength(JSON.stringify(envelope)) <= 16_384);
  const result = currentSchematicPageOpeningResultSchema.parse(decodeExactReadEnvelope(envelope));
  need(result.phase === phase && result.projectUuid === target.projectUuid && result.branchUuid === target.branchUuid &&
    result.documentUuid === target.documentUuid && result.schematicUuid === target.schematicUuid);
  return result;
}

/** A local historical view only. It cannot reconstruct the opening owner,
 * clear tracked-call quarantine, repeat navigation or assert page readiness. */
export async function inspectCurrentSchematicPageOpening(operationId: string): Promise<Record<string, unknown>> {
  currentSchematicPageOpeningIdSchema.parse(operationId);
  const journal = await loadOperation(operationId);
  need(journal.plan["profile"] === CURRENT_SCHEMATIC_PAGE_OPENING_PROFILE);
  return { operationId, state: journal["state"], orphanedCallPossible: journal["orphanedCallPossible"],
    mutationMayHaveOccurred: journal["mutationMayHaveOccurred"], explicitSaveDispatched: false,
    originalOwnerRecreated: false, executionAuthorized: false, replayAllowed: false,
    journalSha256: journal["journalSha256"], artifacts: journal.artifacts, target: journal.plan["target"],
    nextSafeAction: journal["nextSafeAction"] };
}

/** One project-context page navigation through the original tracked bridge.
 * The generic dispatcher supplies physical process authority and quarantine;
 * this adapter supplies exact page/checkpoint intent, receiver and no-replay
 * custody. It owns no launch, close, Save or replacement-process capability. */
export class CurrentSchematicPageOpeningCoordinator {
  readonly #engine: Engine;
  readonly #assertOriginalLaunch: () => void;
  readonly #cleanup: OrdinaryTrackedOpenCleanup | undefined;
  readonly #prepare: typeof prepareCurrentSchematicPageOpeningCheckpoint;
  readonly #verify: typeof verifyCurrentSchematicPageOpeningCheckpoint;
  readonly #implementation: typeof verifyCurrentSchematicPageOpeningImplementation;
  readonly #attempts = new Set<string>();
  #busy = false;
  public constructor(engine: Engine, assertOriginalLaunch: () => void, dependencies: CurrentSchematicPageOpeningDependencies = {}, cleanup?: OrdinaryTrackedOpenCleanup) {
    this.#engine = engine; this.#assertOriginalLaunch = assertOriginalLaunch; this.#cleanup = cleanup; this.#prepare = dependencies.prepareCheckpoint ?? prepareCurrentSchematicPageOpeningCheckpoint;
    this.#verify = dependencies.verifyCheckpoint ?? verifyCurrentSchematicPageOpeningCheckpoint;
    this.#implementation = dependencies.verifyImplementation ?? verifyCurrentSchematicPageOpeningImplementation;
  }
  public async run(input: unknown, expectedFingerprint?: Record<string, unknown>): Promise<Record<string, unknown>> {
    const request = currentSchematicPageOpeningRequestSchema.parse(input);
    if (request.action === "inspect") { return { ...await inspectCurrentSchematicPageOpening(request.operationId), ...this.#cleanup?.inspect(request.operationId) }; }
    if (request.action !== "open") { need(!this.#busy && this.#cleanup !== undefined); return this.#cleanup.run(request); }
    this.#assertOriginalLaunch(); need(!this.#busy && this.#attempts.size < 4096 && !this.#attempts.has(request.operationId));
    this.#attempts.add(request.operationId); this.#busy = true;
    try { return await this.#open(request, expectedFingerprint); } finally { this.#busy = false; }
  }
  async #open(request: Extract<CurrentSchematicPageOpeningRequest, { action: "open" }>, expectedInput?: Record<string, unknown>): Promise<Record<string, unknown>> {
    const expected = structuredClone(expectedInput); validateSdkPublicReadersFingerprint(expected);
    need(expected !== undefined);
    const engine = this.#engine;
    const dispatch = engine.dispatchWithOrphanTracking, guard = engine.assertBridgeDispatchAllowed, status = engine.status, upstream = engine.upstream;
    const execute = upstream.callTool;
    const requestText = canonicalJson(request);
    const current = (): void => { this.#assertOriginalLaunch(); need(this.#engine === engine && engine.upstream === upstream && engine.assertBridgeDispatchAllowed === guard &&
      engine.status === status && upstream.callTool === execute && engine.dispatchWithOrphanTracking === dispatch && canonicalJson(request) === requestText); };
    current(); await guard.call(engine); current();
    const initialStatus = await status.call(engine); current(); const initial = structuredClone(initialStatus.stableFingerprint);
    validateSdkPublicReadersFingerprint(initial); assertExpectedFingerprint(initial); assertSubset(initial, expected, "SCH209 opening expected runtime");
    await this.#implementation(initial.installedBundles.assetsRoot); current();
    const existingOperations = await listOperationIds(); current(); need(!existingOperations.includes(request.operationId));
    const prepared = await this.#prepare(request.target); current(); const preparedText = canonicalJson(prepared);
    const preflightCode = buildCurrentSchematicPageOpeningProgram(request.target, "preflight");
    await guard.call(engine); current();
    const preflightRaw = await execute.call(upstream, "easyeda_execute", { code: preflightCode, timeoutMs: 60_000, confirmWrite: true }, 70_000); current();
    const preflight = decode(preflightRaw, request.target, "preflight");
    await this.#verify(prepared, request.target); current(); need(canonicalJson(prepared) === preparedText);
    await this.#implementation(initial.installedBundles.assetsRoot); current();
    const code = buildCurrentSchematicPageOpeningProgram(request.target, "open", preflight.windowTabId);
    const plan = { profile: CURRENT_SCHEMATIC_PAGE_OPENING_PROFILE, purpose: "ordinary-schematic-page-open", target: request.target,
      expectedFingerprintSha256: sha256Json(initial), preflight, checkpoint: prepared, codeSha256: sha256Text(code),
      confirmOrdinaryProject: true, acceptNormalOpenEffects: true, explicitSaveDispatched: false, replayAllowed: false };
    const timestamp = new Date().toISOString();
    const journal: Journal = { schema: OPERATION_SCHEMA, operationId: request.operationId, journalPath: operationPath(request.operationId), plan,
      planHash: buildPlanHash(plan), state: "prepared", mutationState: "navigation-intent", saved: false, reopened: false,
      orphanedCallPossible: false, hardStop: true, mutationMayHaveOccurred: true, sequence: 0, artifacts: [], createdAt: timestamp, updatedAt: timestamp,
      nextSafeAction: "Await this one original page opening. Inspect local evidence after a lost reply; never repeat navigation or Save." };
    await createOperation(journal); current(); this.#cleanup?.retain(journal);
    const revalidate = async (): Promise<void> => { current(); need(canonicalJson(await loadOperation(request.operationId)) === canonicalJson(journal)); current(); };
    let retained: NativeResult | undefined;
    const raw = await dispatch.call(engine, journal, "schematic-page-open209", "easyeda_execute", { code, timeoutMs: 60_000, confirmWrite: true }, 70_000,
      async () => { current(); await revalidate(); await this.#verify(prepared, request.target); current(); need(canonicalJson(prepared) === preparedText);
        await this.#implementation(initial.installedBundles.assetsRoot); current(); await revalidate(); },
      async reply => { current(); retained = decode(reply, request.target, "open"); need(retained.windowTabId === preflight.windowTabId);
        const artifact = await writePhaseArtifact(request.operationId, journal.sequence + 1, "native-open-result", reply); current();
        journal.sequence += 1; journal.artifacts.push(artifact); journal.updatedAt = new Date().toISOString(); await updateOperation(journal); current(); },
      revalidate);
    current(); need(retained !== undefined); decode(raw, request.target, "open");
    await revalidate(); await this.#implementation(initial.installedBundles.assetsRoot); current();
    await guard.call(engine); current(); const final = await status.call(engine); current(); validateSdkPublicReadersFingerprint(final.stableFingerprint);
    need(canonicalJson(final.stableFingerprint) === canonicalJson(initial));
    journal.state = "completed"; journal.mutationState = "navigation-acknowledged"; journal.hardStop = false; journal.updatedAt = new Date().toISOString();
    journal.nextSafeAction = "Observe the exact opened page with schematic-page-read when ready. Native background work and persistence remain unproved; original launch cleanup remains separate.";
    await updateOperation(journal); current();
    return { operationId: request.operationId, result: retained, checkpoint: prepared.preparationCheckpoint,
      journalPath: journal.journalPath, journalSha256: journal["journalSha256"], replayAllowed: false, explicitSaveDispatched: false,
      pageReadTarget: { projectUuid: request.target.projectUuid, branchUuid: request.target.branchUuid, documentUuid: request.target.documentUuid,
        schematicUuid: request.target.schematicUuid, tabId: `${request.target.documentUuid}@${request.target.projectUuid}` }, executionAuthorized: false };
  }
}
