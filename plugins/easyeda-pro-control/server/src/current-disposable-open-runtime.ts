/* oxlint-disable import/max-dependencies -- This operation composes fixed checkpoint, current implementation, retained runtime and shared journal boundaries. */
import { z } from "zod";
import { createOperation, loadOperation, operationPath, updateOperation, writePhaseArtifact } from "./artifacts.ts";
import { listQualifiedOperationStates } from "./closed-symbol-terminal-admission.ts";
import { OPERATION_SCHEMA, assertSubset, buildPlanHash, canonicalJson, extractToolPayload, isRecord, isTerminalOperation, sha256Json, sha256Text } from "./core.ts";
import { CURRENT_DISPOSABLE_OPEN_MAX_BYTES, CURRENT_DISPOSABLE_OPEN_NAVIGATION_TIMEOUT_MS, buildCurrentDisposableOpenProgram, currentDisposableOpenSealedTargetSchema,
  parseCurrentDisposableOpenRequest, validateCurrentDisposableOpenResult } from "./current-disposable-open.ts";
import type { CurrentDisposableOpenRequest, CurrentDisposableOpenSealedTarget, CurrentDisposableOpenTarget } from "./current-disposable-open.ts";
import { currentOpenFailureDiagnosticSchema, describeCurrentOpenFailure } from "./current-disposable-open-diagnostics.ts";
import type { CurrentOpenFailureContext, CurrentOpenFailureDiagnostic } from "./current-disposable-open-diagnostics.ts";
import { prepareCurrentDisposableOpenCheckpoint, verifyCurrentDisposableOpenCheckpoint } from "./current-disposable-open-checkpoint.ts";
import type { CurrentDisposableOpenCheckpoint } from "./current-disposable-open-checkpoint.ts";
import { CURRENT_DISPOSABLE_OPEN_IMPLEMENTATION, verifyCurrentDisposableOpenImplementation } from "./current-disposable-open-profile.ts";
import { decodeExactReadEnvelope } from "./exact-readers.ts";
import { EasyedaControlEngine } from "./engine.ts";
import type { AuthenticatedBridgeSessionIdentity, TrackedDispatchOperationJournal } from "./engine.ts";
import { validateSdkLocalRuntimeFingerprint } from "./sdk-local-runtime.ts";
import { WindowsControlRuntime } from "./windows-runtime.ts";
import type { WindowsAuthorityLaunch } from "./windows-authority.ts";
// oxlint-disable-next-line import/no-cycle -- The fixed preparation stage consumes this module's private original-object issuer after initialization.
import { assertOriginalCurrentOwnedSymbolPreparation, prepareCurrentOwnedSymbolMetadata } from "./current-symbol-owned-preparation.ts";
import type { CurrentOwnedSymbolMetadataPreparation } from "./current-symbol-owned-preparation.ts";
// oxlint-disable-next-line import/no-cycle -- The baseline consumes the opener's private original-object transfer; neither module exposes a public route.
import { CurrentSymbolBaselineCoordinator, currentSymbolBaselineRequestSchema } from "./current-symbol-baseline-runtime.ts";
import type { MachineProfile } from "./machine-profile.ts";

type Value = Record<string, unknown>;
type Phase = "preflight" | "open-project" | "open-document" | "observe";
type OpenRequest = Extract<CurrentDisposableOpenRequest, { action: "open" }>;
const PROFILE = "easyeda-pro-control.current-disposable-open.v1";
const digest = z.string().regex(/^[a-f0-9]{64}$/u);
const launchSchema = z.object({ jobId: z.string().regex(/^[a-f0-9]{32}$/u), helperInstance: z.string().regex(/^[a-f0-9]{32}$/u),
  root: z.object({ pid: z.number().int().positive(), role: z.literal("easyeda-main"), startIdentity: z.string().regex(/^win32:[0-9]{15,20}:job:[a-f0-9]{32}$/u) }).strict() }).strict()
  .refine((value) => value.root.startIdentity.endsWith(`:job:${value.jobId}`));
const terminationSchema = z.object({ jobId: z.string(), helperInstance: z.string(), terminated: z.literal(true) }).strict();
const closedSessionSchema = z.object({ authenticatedAtEpochMs: z.number().int().nonnegative(), authenticationReceiptSha256: digest,
  sequence: z.number().int().positive(), sessionId: z.string().min(1).max(256), closeReason: z.string().min(1).max(160),
  closedAtEpochMs: z.number().int().nonnegative() }).strict();

interface Plan extends Value {
  profile: typeof PROFILE;
  intent: { request: OpenRequest; target: CurrentDisposableOpenSealedTarget; implementation: typeof CURRENT_DISPOSABLE_OPEN_IMPLEMENTATION };
  expectedFingerprint: Value;
}
interface OpenJournal extends TrackedDispatchOperationJournal {
  plan: Plan;
  checkpointProof: CurrentDisposableOpenCheckpoint;
  originalLaunch: WindowsAuthorityLaunch;
  projectDispatchConsumed: boolean;
  documentDispatchConsumed: boolean;
  result?: Value;
  failureDiagnostic?: CurrentOpenFailureDiagnostic;
}
interface Retained {
  readonly journal: OpenJournal;
  readonly runtime: Pick<WindowsControlRuntime, "status" | "observeLaunchTermination">;
  readonly launch: WindowsAuthorityLaunch;
  readonly launchText: string;
  readonly planText: string;
}
export interface CurrentDisposableOpenOptions {
  readonly engine: Pick<EasyedaControlEngine, "assertBridgeDispatchAllowed" | "assertNativeUiEditingAllowed" | "assertRecoveryOperationIsolated" |
    "dispatchWithOrphanTracking" | "executionAuthorityValidator" | "upstream"> & {
      readonly status: () => Promise<{ stableFingerprint: Value }>;
    };
  readonly runtime: () => Pick<WindowsControlRuntime, "status" | "observeLaunchTermination">;
  readonly assertOwner: () => void;
}
const defaults = { createOperation, loadOperation, updateOperation, writePhaseArtifact, listOperations: listQualifiedOperationStates,
  prepareCheckpoint: prepareCurrentDisposableOpenCheckpoint, verifyCheckpoint: verifyCurrentDisposableOpenCheckpoint,
  verifyImplementation: verifyCurrentDisposableOpenImplementation, validateFingerprint: validateSdkLocalRuntimeFingerprint };
/** Offline-test seams only; never parsed from a tool request. */
export type CurrentDisposableOpenDependencies = Partial<typeof defaults>;

export interface CurrentDisposableOpenGeneration {
  readonly profile: "private.current-disposable-open-generation.v1";
  readonly operationId: string;
}
export interface CurrentDisposableOpenGenerationSource {
  readonly engine: EasyedaControlEngine;
  readonly runtime: WindowsControlRuntime;
  readonly target: CurrentDisposableOpenSealedTarget;
  readonly expectedFingerprint: Value;
  /** A retained status projection, not an issued launch/close/copy capability. */
  readonly launchProjection: WindowsAuthorityLaunch;
  readonly bridgeSession: AuthenticatedBridgeSessionIdentity;
  /** Ordinary opening may change storage; this is never a post-opening baseline. */
  readonly preNavigationCheckpoint: CurrentDisposableOpenCheckpoint;
}
const issuedGenerations = new WeakMap<object, {
  readonly source: CurrentDisposableOpenGenerationSource;
  readonly current: () => void;
  readonly revalidate: () => Promise<void>;
}>();
export interface CurrentSymbolBaselineOwner {
  readonly profile: "private.current-symbol-baseline-owner.v1";
  readonly operationId: string;
  readonly openingOperationId: string;
}
export interface CurrentSymbolBaselineOwnerSource {
  readonly source: CurrentDisposableOpenGenerationSource;
  readonly preparation: CurrentOwnedSymbolMetadataPreparation;
}
const issuedBaselineOwners = new WeakMap<object, {
  readonly value: CurrentSymbolBaselineOwnerSource; readonly current: () => void; readonly revalidate: () => Promise<void>;
}>();
// The transfer owns the runtime, not just its current Job. A later owned launch
// Must not reopen ordinary navigation or let a sibling baseline take over.
const baselineRuntimeReservations = new WeakSet<object>();

/** One-way transfer out of an active generation. This checks the original
 * opening, runtime and validator, but deliberately not a now-closed session.
 * It grants no termination, copy or subsequent opening authority by itself.
 */
export function assertCurrentSymbolBaselineOwner(value: unknown, engine: EasyedaControlEngine): CurrentSymbolBaselineOwnerSource {
  requireValue(value !== null && typeof value === "object", "Current symbol baseline original owner is missing.");
  const issued = issuedBaselineOwners.get(value);
  requireValue(issued !== undefined && issued.value.source.engine === engine, "Current symbol baseline owner was not issued by this engine.");
  issued.current(); return issued.value;
}
export async function revalidateCurrentSymbolBaselineOwner(value: unknown, engine: EasyedaControlEngine): Promise<CurrentSymbolBaselineOwnerSource> {
  const original = assertCurrentSymbolBaselineOwner(value, engine);
  requireValue(value !== null && typeof value === "object", "Current symbol baseline original owner is missing.");
  const issued = issuedBaselineOwners.get(value);
  requireValue(issued !== undefined, "Current symbol baseline original owner is missing.");
  await issued.revalidate();
  requireValue(assertCurrentSymbolBaselineOwner(value, engine) === original, "Current symbol baseline owner changed during revalidation.");
  return original;
}

/** Fixed lookup of the coordinator's original in-memory owner. JSON, loaded
 * history and a matching launch projection cannot recreate this identity.
 */
export function assertCurrentDisposableOpenGeneration(value: unknown, engine: EasyedaControlEngine): CurrentDisposableOpenGenerationSource {
  requireValue(value !== null && typeof value === "object", "Current disposable-open original generation is missing.");
  const issued = issuedGenerations.get(value);
  requireValue(issued !== undefined && issued.source.engine === engine, "Current disposable-open generation was not issued by this engine's retained coordinator.");
  issued.current(); return issued.source;
}

export async function revalidateCurrentDisposableOpenGeneration(value: unknown, engine: EasyedaControlEngine): Promise<CurrentDisposableOpenGenerationSource> {
  const source = assertCurrentDisposableOpenGeneration(value, engine);
  requireValue(value !== null && typeof value === "object", "Current disposable-open original generation is missing.");
  const issued = issuedGenerations.get(value);
  requireValue(issued !== undefined, "Current disposable-open original generation is missing.");
  await issued.revalidate();
  requireValue(assertCurrentDisposableOpenGeneration(value, engine) === source, "Current disposable-open generation changed during revalidation.");
  return source;
}

function requireValue(condition: boolean, message: string): asserts condition { if (!condition) { throw new Error(message); } }
function targetOnly(request: CurrentDisposableOpenTarget): CurrentDisposableOpenTarget {
  return { rawWindowsPath: request.rawWindowsPath, projectUuid: request.projectUuid,
    documentUuid: request.documentUuid, expectedSourceSha256: request.expectedSourceSha256 };
}
function isOpenJournal(value: unknown): value is OpenJournal {
  if (!isRecord(value) || !isRecord(value["plan"]) || !isRecord(value["checkpointProof"])) { return false; }
  const checkpoint = value["checkpointProof"], plan = value["plan"];
  return plan["profile"] === PROFILE && isRecord(plan["intent"]) && isRecord(plan["expectedFingerprint"]) &&
    typeof value["operationId"] === "string" && typeof value["journalPath"] === "string" && typeof value["planHash"] === "string" &&
    typeof value["state"] === "string" && typeof value["mutationState"] === "string" && typeof value["saved"] === "boolean" &&
    typeof value["reopened"] === "boolean" && typeof value["orphanedCallPossible"] === "boolean" && typeof value["hardStop"] === "boolean" &&
    typeof value["mutationMayHaveOccurred"] === "boolean" && typeof value["nextSafeAction"] === "string" && typeof value["updatedAt"] === "string" &&
    Number.isSafeInteger(value["sequence"]) && typeof value["projectDispatchConsumed"] === "boolean" && typeof value["documentDispatchConsumed"] === "boolean" &&
    Array.isArray(value["artifacts"]) && value["artifacts"].every((item: unknown) => isRecord(item) && typeof item["path"] === "string" &&
      typeof item["bytes"] === "number" && digest.safeParse(item["sha256"]).success) &&
    checkpoint["profile"] === "easyeda-pro-control.current-disposable-open-checkpoint.v1" && isRecord(checkpoint["checkpoint"]) &&
    isRecord(checkpoint["targetEvidence"]) && launchSchema.safeParse(value["originalLaunch"]).success &&
    (value["failureDiagnostic"] === undefined || currentOpenFailureDiagnosticSchema.safeParse(value["failureDiagnostic"]).success);
}
function observationOutcome(result: Value): string {
  if (result["phase"] === "open-document" && result["publicResult"] === null) { return "public-returned-not-opened"; }
  if (result["activeTarget"] === true && result["nativeIdentityVerified"] === true) { return "target-native-identity-observed"; }
  return result["documentPresent"] === true ? "target-present-readiness-unverified" : "target-not-observed";
}
function summary(journal: OpenJournal): Value {
  return { operationId: journal.operationId, state: journal.state, attemptConsumed: true, replayAllowed: false,
    projectDispatchConsumed: journal.projectDispatchConsumed, documentDispatchConsumed: journal.documentDispatchConsumed,
    orphanedCallPossible: journal.orphanedCallPossible, hardStop: journal.hardStop, result: journal.result ?? null,
    failureDiagnostic: journal.failureDiagnostic ?? null,
    normalOpenEffectsMayHaveOccurred: journal.mutationMayHaveOccurred, explicitSaveDispatched: false,
    persistenceVerified: false, writerAuthority: false, nextSafeAction: journal.nextSafeAction,
    journalPath: journal.journalPath, artifacts: journal.artifacts };
}

/** One current-version disposable navigation attempt. Retirement ends that
 * attempt after original process/session termination; it cannot continue or
 * repeat it, restore lost supervision, or satisfy shared CAD recovery APIs.
 */
export class CurrentDisposableOpenCoordinator {
  private readonly options: CurrentDisposableOpenOptions;
  private readonly services: typeof defaults;
  private readonly retained = new Map<string, Retained>();
  private readonly productionServices: boolean;
  private readonly generations = new Map<string, CurrentDisposableOpenGeneration>();
  private readonly baselineJobs = new Set<string>();
  private readonly baselines = new Map<string, CurrentSymbolBaselineCoordinator>();
  private busy = false;

  public constructor(options: CurrentDisposableOpenOptions, dependencies: CurrentDisposableOpenDependencies = {}) {
    this.options = options; this.services = { ...defaults, ...dependencies };
    this.productionServices = Reflect.ownKeys(dependencies).length === 0;
  }

  public async run(input: unknown, expectedFingerprint?: Value): Promise<Value> {
    const request = parseCurrentDisposableOpenRequest(structuredClone(input));
    requireValue(!this.busy, "Current disposable opening is already in progress.");
    this.busy = true;
    if (request.action !== "inspect") { this.generations.clear(); }
    try {
      if (request.action === "open") {
        requireValue(expectedFingerprint !== undefined, "Current disposable opening requires its expected fingerprint.");
        return await this.open(request, structuredClone(expectedFingerprint));
      }
      const journal = await this.load(request.operationId);
      if (request.action === "inspect") { return summary(journal); }
      if (request.action === "retire-after-termination") { return await this.retire(journal); }
      return await this.observe(journal);
    } finally { this.busy = false; }
  }

  /** Internal preparation only. The public opener request schema has no route
   * here. Later writer stages still need their independently issued witness,
   * post-opening baseline, original close reservation and full SQL inventory.
   */
  public async prepareSymbolMetadata(operationId: string, input: unknown): Promise<CurrentOwnedSymbolMetadataPreparation> {
    requireValue(!this.busy, "Current disposable opening is already in progress.");
    requireValue(this.productionServices && this.options.engine instanceof EasyedaControlEngine,
      "Current symbol preparation cannot issue from injected opening services or an unowned engine.");
    const engine = this.options.engine;
    this.busy = true; this.generations.clear();
    try {
      const loaded = await this.load(operationId), slot = this.retainedJournal(loaded);
      CurrentDisposableOpenCoordinator.assertNotTransferred(slot.runtime);
      requireValue(slot.runtime instanceof WindowsControlRuntime, "Current symbol preparation requires the retained Windows runtime object.");
      const runtime = slot.runtime;
      // Scope acquisition can connect the upstream.
      // Refuse quarantine before entering, not only inside the callback.
      await engine.assertBridgeDispatchAllowed(); this.currentUntransferred(slot);
      await engine.assertRecoveryOperationIsolated(operationId); this.currentUntransferred(slot);
      const scope = engine.upstream.withAuthenticatedBridgeDispatchScope;
      requireValue(scope !== undefined, "Current symbol preparation requires an authenticated dispatch scope.");
      const result: unknown = await scope.call(engine.upstream, async () => {
        const generation = this.issueGeneration(slot, engine, runtime);
        try { return await prepareCurrentOwnedSymbolMetadata(engine, generation, input); }
        catch (error) { this.generations.delete(operationId); throw error; }
      });
      return assertOriginalCurrentOwnedSymbolPreparation(result, engine).preparation;
    } finally { this.busy = false; }
  }

  /** Internal owned baseline only. The public opener schema has no route here.
   * Consumes this Job before the first await, transfers a fresh preparation,
   * then requests one normal close outside its authenticated scope.
   */
  public async beginSymbolBaseline(openingOperationId: string, input: unknown, sqlRuntime: MachineProfile["runtime"]): Promise<Value> {
    const request = currentSymbolBaselineRequestSchema.parse(input);
    requireValue(request.operationId !== openingOperationId && !this.busy && !this.baselines.has(request.operationId),
      "Current symbol baseline needs a distinct unused operation.");
    requireValue(this.productionServices && this.options.engine instanceof EasyedaControlEngine,
      "Current symbol baseline cannot issue from injected opening services or an unowned engine.");
    const engine = this.options.engine, slot = this.retained.get(openingOperationId);
    requireValue(slot !== undefined && slot.runtime instanceof WindowsControlRuntime, "Current symbol baseline needs the original retained opening and runtime.");
    const runtime = slot.runtime;
    CurrentDisposableOpenCoordinator.assertNotTransferred(runtime); this.current(slot);
    baselineRuntimeReservations.add(runtime);
    this.baselineJobs.add(slot.launch.jobId);
    this.generations.clear(); this.busy = true;
    const stage = new CurrentSymbolBaselineCoordinator(engine, runtime, sqlRuntime);
    this.baselines.set(request.operationId, stage);
    let owner: CurrentSymbolBaselineOwner | undefined;
    try {
      const loaded = await this.load(openingOperationId);
      requireValue(this.retainedJournal(loaded) === slot, "Current symbol baseline original opening changed.");
      await engine.assertBridgeDispatchAllowed(); this.current(slot);
      await engine.assertRecoveryOperationIsolated(openingOperationId); this.current(slot);
      const scope = engine.upstream.withAuthenticatedBridgeDispatchScope;
      requireValue(scope !== undefined, "Current symbol baseline needs an authenticated scope.");
      try {
        await scope.call(engine.upstream, async () => {
          const generation = this.issueGeneration(slot, engine, runtime, request.operationId);
          const preparation = await prepareCurrentOwnedSymbolMetadata(engine, generation, request.preparation);
          owner = this.transferBaseline(slot, engine, generation, preparation, request.operationId);
          await stage.capture(owner);
        });
      } catch (error) {
        if (owner !== undefined) {
          try { await stage.stopAfterScopeFailure(owner); }
          catch (recordError) { throw new AggregateError([error, recordError], "Current symbol baseline scope failed and could not record its stopped state.", { cause: recordError }); }
        }
        throw error;
      }
      requireValue(owner !== undefined, "Current symbol baseline scope returned without its retained owner.");
      return await stage.close(owner);
    } finally { this.generations.delete(openingOperationId); this.busy = false; }
  }

  public async observeSymbolBaseline(operationId: string): Promise<Value> {
    const stage = this.baselines.get(operationId);
    requireValue(!this.busy && stage !== undefined, "Current symbol baseline original coordinator is unavailable or busy.");
    this.busy = true;
    try { return await stage.observe(operationId); }
    finally { this.busy = false; }
  }

  /** Internal continuation only; the public opener schema has no relaunch route. */
  public async relaunchSymbolBaseline(operationId: string): Promise<Value> {
    const stage = this.baselines.get(operationId);
    requireValue(!this.busy && stage !== undefined, "Current symbol baseline original coordinator is unavailable or busy.");
    this.busy = true;
    try { return await stage.relaunch(operationId); }
    finally { this.busy = false; }
  }

  private static assertNotTransferred(runtime: Retained["runtime"]): void {
    requireValue(!baselineRuntimeReservations.has(runtime), "Current disposable opening was transferred to a one-shot baseline owner.");
  }

  private transferBaseline(slot: Retained, engine: EasyedaControlEngine, generation: CurrentDisposableOpenGeneration,
    preparation: CurrentOwnedSymbolMetadataPreparation, operationId: string): CurrentSymbolBaselineOwner {
    const original = assertOriginalCurrentOwnedSymbolPreparation(preparation, engine);
    requireValue(original.generation === generation && original.source === assertCurrentDisposableOpenGeneration(generation, engine),
      "Current symbol baseline transfer needs its original preparation and generation.");
    const journalText = canonicalJson(slot.journal), preparationText = canonicalJson(preparation), source = original.source;
    const upstream = engine.upstream, validator = engine.executionAuthorityValidator;
    const lifecycleReader = upstream.bridgeSessionLifecycle, scopeReader = upstream.currentAuthenticatedBridgeDispatchBinding;
    const owner = Object.freeze({ profile: "private.current-symbol-baseline-owner.v1" as const, operationId, openingOperationId: generation.operationId });
    const value = Object.freeze({ source, preparation });
    const current = (): void => {
      this.current(slot);
      requireValue(this.baselineJobs.has(slot.launch.jobId) && this.options.engine === engine && engine.upstream === upstream &&
        engine.executionAuthorityValidator === validator && upstream.bridgeSessionLifecycle === lifecycleReader &&
        upstream.currentAuthenticatedBridgeDispatchBinding === scopeReader && canonicalJson(slot.journal) === journalText &&
        canonicalJson(slot.launch) === slot.launchText && canonicalJson(preparation) === preparationText, "Current symbol baseline transferred owner changed.");
    };
    const revalidate = async (): Promise<void> => {
      current(); await engine.assertBridgeDispatchAllowed(); current();
      await engine.assertRecoveryOperationIsolated(operationId); current();
      const persisted = await this.load(owner.openingOperationId); current();
      requireValue(canonicalJson(persisted) === journalText, "Current symbol baseline persisted opening changed.");
    };
    current(); this.generations.delete(generation.operationId);
    issuedBaselineOwners.set(owner, { value, current, revalidate }); return owner;
  }

  private issueGeneration(slot: Retained, engine: EasyedaControlEngine, runtime: WindowsControlRuntime, baselineOperationId?: string): CurrentDisposableOpenGeneration {
    this.current(slot);
    const journal = slot.journal, journalText = canonicalJson(journal), session = journal.bridgeSessionBeforeOrphan;
    requireValue(journal.state === "completed" && !journal.hardStop && !journal.orphanedCallPossible &&
      journal.projectDispatchConsumed && journal.result?.["outcome"] === "target-native-identity-observed" && session !== undefined,
    "Current symbol preparation requires the retained successful native-identity opening and original session.");
    const reader = engine.upstream.bridgeSessionLifecycle, sessionText = canonicalJson(session), upstream = engine.upstream;
    requireValue(reader !== undefined, "Current symbol preparation cannot inspect the original authenticated session.");
    const generation = Object.freeze({ profile: "private.current-disposable-open-generation.v1" as const, operationId: journal.operationId });
    this.generations.set(journal.operationId, generation);
    const current = (): void => {
      try {
        this.current(slot);
        if (baselineOperationId === undefined) { CurrentDisposableOpenCoordinator.assertNotTransferred(runtime); }
        else {
          requireValue(this.baselines.has(baselineOperationId) && this.baselineJobs.has(slot.launch.jobId),
            "Current symbol baseline generation lost its original reservation.");
        }
        requireValue(this.generations.get(journal.operationId) === generation && canonicalJson(journal) === journalText &&
          engine.upstream === upstream && upstream.bridgeSessionLifecycle === reader, "Current symbol preparation retained opening or lifecycle reader changed.");
        const lifecycle = reader.call(engine.upstream);
        requireValue(isRecord(lifecycle) && lifecycle["schema"] === "easyeda-pro-control.authenticated-bridge-lifecycle.v1" &&
          isRecord(lifecycle["activeSession"]) && canonicalJson({ ...lifecycle["activeSession"], gatewayInstanceId: lifecycle["gatewayInstanceId"] }) === sessionText,
        "Current symbol preparation original authenticated session changed.");
      } catch (error) { this.generations.delete(journal.operationId); throw error; }
    };
    const source = Object.freeze({ engine, runtime, target: journal.plan.intent.target, expectedFingerprint: journal.plan.expectedFingerprint,
      launchProjection: slot.launch, bridgeSession: session, preNavigationCheckpoint: journal.checkpointProof });
    const revalidate = async (): Promise<void> => {
      try {
        current(); await engine.assertBridgeDispatchAllowed(); current();
        await engine.assertRecoveryOperationIsolated(journal.operationId); current();
        await this.admission(source.expectedFingerprint); current();
        const persisted = await this.load(journal.operationId); current();
        requireValue(canonicalJson(persisted) === journalText, "Current symbol preparation persisted opening changed.");
      } catch (error) { this.generations.delete(journal.operationId); throw error; }
    };
    current(); issuedGenerations.set(generation, { source, current, revalidate }); return generation;
  }

  private async load(operationId: string): Promise<OpenJournal> {
    const raw: unknown = await this.services.loadOperation(operationId);
    requireValue(isOpenJournal(raw), "Current disposable-open journal is malformed or has another profile.");
    const { plan } = raw;
    const request = parseCurrentDisposableOpenRequest(plan.intent.request);
    requireValue(request.action === "open" && request.operationId === operationId, "Current disposable-open original request differs.");
    const target = currentDisposableOpenSealedTargetSchema.parse(plan.intent.target);
    requireValue(target.projectUuid === request.projectUuid && target.documentUuid === request.documentUuid &&
      target.rawWindowsPath === request.rawWindowsPath && target.expectedSourceSha256 === request.expectedSourceSha256 &&
      canonicalJson(plan.intent.implementation) === canonicalJson(CURRENT_DISPOSABLE_OPEN_IMPLEMENTATION) &&
      raw.schema === OPERATION_SCHEMA && raw.operationId === operationId && raw.planHash === buildPlanHash(plan),
    "Current disposable-open journal target or state differs.");
    // Managed load already verified journal/artifact bytes. This checked family
    // Projection never reconstructs the coordinator's original retained slot.
    return raw;
  }

  private current(slot: Retained): void {
    this.options.assertOwner();
    requireValue(this.retained.get(slot.journal.operationId) === slot && this.options.runtime() === slot.runtime &&
      canonicalJson(slot.journal.plan) === slot.planText, "Current disposable-open retained owner or plan changed.");
    const status = slot.runtime.status();
    requireValue(status.state === "owned" && canonicalJson(status.launch) === slot.launchText,
      "Current disposable-open original supervised generation changed or was lost.");
  }

  private currentUntransferred(slot: Retained): void {
    this.current(slot); CurrentDisposableOpenCoordinator.assertNotTransferred(slot.runtime);
  }

  private async record(journal: OpenJournal, phase: string, value: unknown): Promise<void> {
    journal.sequence += 1;
    journal.artifacts.push(await this.services.writePhaseArtifact(journal.operationId, journal.sequence, phase, value));
    journal.updatedAt = new Date().toISOString();
    await this.services.updateOperation(journal);
  }

  private async admission(fingerprint: Value): Promise<void> {
    this.services.validateFingerprint(fingerprint);
    const status = await this.options.engine.status();
    const actual = status.stableFingerprint;
    this.services.validateFingerprint(actual);
    assertSubset(actual, fingerprint, "Current disposable-open runtime");
    requireValue(isRecord(actual["installedBundles"]) && typeof actual["installedBundles"]["assetsRoot"] === "string", "Current disposable-open installed assets are unavailable.");
    await this.services.verifyImplementation(actual["installedBundles"]["assetsRoot"]);
  }

  private async dispatch(slot: Retained, phase: Phase, failureContext: CurrentOpenFailureContext): Promise<Value> {
    const { engine } = this.options, journal = slot.journal;
    failureContext.phase = phase; failureContext.hostStage = "owner-check";
    this.currentUntransferred(slot);
    failureContext.hostStage = "dispatch-guards";
    await engine.assertBridgeDispatchAllowed(); this.currentUntransferred(slot);
    await engine.assertRecoveryOperationIsolated(journal.operationId); this.currentUntransferred(slot);
    const scope = engine.upstream.withAuthenticatedBridgeDispatchScope;
    requireValue(scope !== undefined, "Current disposable opening requires authenticated dispatch scopes.");
    failureContext.hostStage = "scope";
    const result: unknown = await scope.call(engine.upstream, async () => {
      failureContext.hostStage = "runtime-admission";
      this.currentUntransferred(slot); await this.admission(journal.plan.expectedFingerprint); this.currentUntransferred(slot);
      const navigate = phase === "open-project" || phase === "open-document";
      failureContext.hostStage = "reserve-navigation";
      if (phase === "open-project") {
        requireValue(!journal.projectDispatchConsumed, "Project-open dispatch is already consumed.");
        journal.projectDispatchConsumed = true;
      }
      if (phase === "open-document") {
        requireValue(journal.projectDispatchConsumed && !journal.documentDispatchConsumed, "Document-open dispatch is unavailable or consumed.");
        journal.documentDispatchConsumed = true;
      }
      failureContext.hostStage = "build-program";
      const code = buildCurrentDisposableOpenProgram(journal.plan.intent.target, phase);
      journal.state = `${phase}-dispatching`; journal.hardStop = true;
      journal.mutationMayHaveOccurred ||= navigate;
      journal.nextSafeAction = "Await this tracked phase; no project or document open may be replayed.";
      failureContext.hostStage = "write-intent";
      await this.record(journal, `${phase}-intent`, { phase, codeSha256: sha256Text(code), navigationIntent: navigate }); this.currentUntransferred(slot);
      let parsed: Value | undefined;
      const toolTimeout = navigate ? CURRENT_DISPOSABLE_OPEN_NAVIGATION_TIMEOUT_MS : 20_000;
      failureContext.hostStage = "tracked-dispatch";
      await engine.dispatchWithOrphanTracking(journal, phase, "easyeda_execute", { code, timeoutMs: toolTimeout, confirmWrite: true }, toolTimeout + 10_000,
        async () => {
          failureContext.hostStage = "before-dispatch";
          this.currentUntransferred(slot);
          await engine.assertRecoveryOperationIsolated(journal.operationId);
          if (phase === "open-project") {
            failureContext.hostStage = "checkpoint-reproof";
            await this.services.verifyCheckpoint(journal.checkpointProof, targetOnly(journal.plan.intent.request));
          }
          this.currentUntransferred(slot);
          failureContext.hostStage = "tracked-dispatch";
        },
        async (raw) => {
          failureContext.hostStage = "decode-result";
          const envelope = extractToolPayload(raw);
          requireValue(Buffer.byteLength(JSON.stringify(envelope), "utf8") <= CURRENT_DISPOSABLE_OPEN_MAX_BYTES, "Current disposable-open reply exceeds its bound.");
          const decoded: unknown = decodeExactReadEnvelope(envelope);
          failureContext.hostStage = "validate-result";
          parsed = validateCurrentDisposableOpenResult(journal.plan.intent.target, phase, decoded);
          failureContext.hostStage = "retain-result";
          await this.record(journal, `${phase}-return`, parsed);
          this.currentUntransferred(slot);
          failureContext.hostStage = "tracked-dispatch";
        });
      failureContext.hostStage = "settled-result";
      this.currentUntransferred(slot);
      requireValue(parsed !== undefined, "Current disposable-open settled result was not retained.");
      failureContext.hostStage = "post-admission";
      await this.admission(journal.plan.expectedFingerprint); this.currentUntransferred(slot);
      return parsed;
    });
    this.currentUntransferred(slot);
    failureContext.hostStage = "settled-result";
    requireValue(isRecord(result), "Current disposable-open dispatch returned no exact result.");
    return result;
  }

  private async open(request: OpenRequest, fingerprint: Value): Promise<Value> {
    const { engine } = this.options;
    this.options.assertOwner();
    const runtime = this.options.runtime(), status = runtime.status();
    CurrentDisposableOpenCoordinator.assertNotTransferred(runtime);
    requireValue(status.state === "owned", "Current disposable opening requires this facade's original supervised application.");
    const launch = launchSchema.parse(status.launch);
    await engine.assertBridgeDispatchAllowed(); await engine.assertNativeUiEditingAllowed();
    CurrentDisposableOpenCoordinator.assertNotTransferred(runtime);
    const operations = await this.services.listOperations();
    CurrentDisposableOpenCoordinator.assertNotTransferred(runtime);
    requireValue(!operations.some((operation) => operation["operationId"] === request.operationId), "Current disposable-open operation ID is consumed.");
    this.services.validateFingerprint(fingerprint);
    const checkpointProof = await this.services.prepareCheckpoint(targetOnly(request));
    CurrentDisposableOpenCoordinator.assertNotTransferred(runtime);
    const target = currentDisposableOpenSealedTargetSchema.parse({ rawWindowsPath: request.rawWindowsPath, projectUuid: request.projectUuid,
      documentUuid: request.documentUuid, expectedSourceSha256: request.expectedSourceSha256, branchUuid: checkpointProof.targetEvidence.branchUuid });
    const plan: Plan = { profile: PROFILE, intent: { request, target, implementation: CURRENT_DISPOSABLE_OPEN_IMPLEMENTATION }, expectedFingerprint: fingerprint };
    const journal: OpenJournal = { schema: OPERATION_SCHEMA, operationId: request.operationId, journalPath: operationPath(request.operationId),
      planHash: buildPlanHash(plan), plan, state: "planned", mutationState: "not-inferred", saved: false, reopened: false,
      orphanedCallPossible: false, hardStop: true, mutationMayHaveOccurred: false, sequence: 0, artifacts: [],
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), checkpointProof, originalLaunch: launch,
      projectDispatchConsumed: false, documentDispatchConsumed: false,
      nextSafeAction: "Run one current-profile disposable project/document open; normal open effects are accepted, not validated design changes." };
    const slot: Retained = { journal, runtime, launch, launchText: canonicalJson(launch), planText: canonicalJson(plan) };
    this.retained.set(request.operationId, slot); this.currentUntransferred(slot);
    await this.services.createOperation(journal);
    const failureContext: CurrentOpenFailureContext = { phase: "preflight", hostStage: "owner-check" };
    try {
      await this.dispatch(slot, "preflight", failureContext); this.currentUntransferred(slot);
      const project = await this.dispatch(slot, "open-project", failureContext); this.currentUntransferred(slot);
      failureContext.hostStage = "project-acknowledgement";
      requireValue(project["publicResult"] === true && project["projectPresent"] === true, "Project opening did not acknowledge the exact target project.");
      // Project restoration may already have activated the selected PCB. A
      // Second ordinary open can Save again, so only observe that result.
      const document = project["documentPresent"] === true && project["activeTarget"] === true ? project : await this.dispatch(slot, "open-document", failureContext);
      this.currentUntransferred(slot);
      journal.result = { ...document, outcome: observationOutcome(document) }; journal.state = "completed"; journal.hardStop = false;
      journal.nextSafeAction = "Navigation attempt completed. Inspect target identity/readiness separately; no Save, persistence or writer authority is inferred.";
      failureContext.hostStage = "write-completion";
      await this.record(journal, "completed", { result: journal.result, replayAllowed: false, persistenceVerified: false, writerAuthority: false });
      this.currentUntransferred(slot);
      return summary(journal);
    } catch (error) { return this.stop(journal, error, failureContext); }
  }

  private async stop(journal: OpenJournal, error: unknown, context: CurrentOpenFailureContext): Promise<Value> {
    const beforeNavigation = !journal.projectDispatchConsumed && !journal.documentDispatchConsumed && !journal.orphanedCallPossible;
    journal.state = journal.orphanedCallPossible ? "current-open-outcome-unknown" : "current-open-stopped";
    journal.hardStop = !beforeNavigation;
    if (beforeNavigation) {
      journal.state = "plan-invalidated";
      journal.result = { outcome: "stopped-before-navigation", navigationAttempted: false, replayAllowed: false };
    }
    journal.nextSafeAction = journal.orphanedCallPossible
      ? "Do not replay navigation. Keep this facade alive; close EasyEDA normally, then retire this exact attempt after original root/Job termination and bridge closure."
      : "Inspect or observe this consumed attempt without navigation. No successful opening or unchanged durable state is inferred.";
    if (beforeNavigation) { journal.nextSafeAction = "Attempt ended before navigation. Inspect its consumed history; never reuse this operation ID."; }
    journal.failureDiagnostic = describeCurrentOpenFailure(error, context);
    await this.record(journal, "failure-diagnostic", journal.failureDiagnostic);
    return { ...summary(journal), failure: "CURRENT_DISPOSABLE_OPEN_STOPPED" };
  }

  private retainedJournal(journal: OpenJournal): Retained {
    const slot = this.retained.get(journal.operationId);
    requireValue(slot !== undefined && canonicalJson(slot.journal) === canonicalJson(journal),
      "This facade no longer retains the original disposable-open owner and journal; loaded history cannot restore authority.");
    this.current(slot); return slot;
  }

  private async observe(loaded: OpenJournal): Promise<Value> {
    requireValue(!loaded.orphanedCallPossible && loaded.state !== "plan-invalidated", "An uncertain or retired open cannot dispatch observations.");
    const slot = this.retainedJournal(loaded);
    CurrentDisposableOpenCoordinator.assertNotTransferred(slot.runtime);
    const journal = slot.journal;
    const failureContext: CurrentOpenFailureContext = { phase: "observe", hostStage: "owner-check" };
    try {
      const observation = await this.dispatch(slot, "observe", failureContext); this.currentUntransferred(slot);
      journal.result = { ...observation, outcome: observationOutcome(observation) }; journal.state = "completed"; journal.hardStop = false;
      journal.nextSafeAction = "Read-only target observation completed. Earlier navigation outcome is not reconstructed and navigation remains consumed.";
      failureContext.hostStage = "write-completion";
      await this.record(journal, "observed", { observation, earlierNavigationOutcome: "not-inferred", replayAllowed: false });
      this.currentUntransferred(slot);
      return summary(journal);
    } catch (error) { return this.stop(journal, error, failureContext); }
  }

  private async retire(loaded: OpenJournal): Promise<Value> {
    requireValue(!isTerminalOperation(loaded), "Current disposable-open attempt is already terminal.");
    const slot = this.retainedJournal(loaded);
    CurrentDisposableOpenCoordinator.assertNotTransferred(slot.runtime);
    const { engine } = this.options, journal = slot.journal;
    await engine.assertRecoveryOperationIsolated(journal.operationId); this.currentUntransferred(slot);
    const authority = journal.executionAuthorityBeforeOrphan, binding = journal.bridgeDispatchBeforeOrphan, prior = journal.bridgeSessionBeforeOrphan;
    requireValue(prior !== undefined && binding !== undefined && authority !== undefined &&
      authority.processes.some((process) => process.pid === slot.launch.root.pid && process.startIdentity === slot.launch.root.startIdentity && process.role === "easyeda-main") &&
      authority.processes.every((process) => process.startIdentity.endsWith(`:job:${slot.launch.jobId}`)),
    "Retirement lacks the operation's original retained launch/capture binding.");
    const observeClosure = engine.upstream.assertClosedAuthenticatedBridgeDispatchReleased;
    requireValue(observeClosure !== undefined, "Closed bridge dispatch retirement proof is unavailable.");
    const observation = terminationSchema.parse(await slot.runtime.observeLaunchTermination()); this.currentUntransferred(slot);
    requireValue(observation.jobId === slot.launch.jobId && observation.helperInstance === slot.launch.helperInstance,
      "Retirement termination observation belongs to another original launch.");
    const closure = closedSessionSchema.parse(observeClosure.call(engine.upstream, binding, prior));
    await engine.assertRecoveryOperationIsolated(journal.operationId); this.currentUntransferred(slot);
    requireValue(canonicalJson(await this.load(journal.operationId)) === canonicalJson(journal), "Disposable-open journal changed before retirement.");
    this.currentUntransferred(slot);
    requireValue(canonicalJson(observeClosure.call(engine.upstream, binding, prior)) === canonicalJson(closure), "Original bridge closure changed before retirement.");
    const proof = { schema: "easyeda-pro-control.current-open-retirement.v1", operationId: journal.operationId, planHash: journal.planHash,
      originalLaunch: slot.launch, originalLaunchSha256: sha256Json(slot.launch), authoritySha256: authority.authoritySha256,
      phase: journal.orphanedCallPhase, bridgeSession: prior, bridgeDispatch: binding, closedBridgeSession: closure,
      termination: observation, navigationOutcome: "not-inferred", durableEffects: "unknown-and-accepted", replayAllowed: false,
      continuationAuthorized: false, replacementAuthorityGranted: false, persistenceVerified: false, writerAuthority: false };
    // Publish complete proof while the original quarantine is still set. Only
    // This no-replay family consumes it; shared CAD recovery is unchanged.
    await this.record(journal, "retirement-proof", proof); this.currentUntransferred(slot);
    requireValue(canonicalJson(observeClosure.call(engine.upstream, binding, prior)) === canonicalJson(closure), "Original bridge closure changed after proof publication.");
    await engine.assertRecoveryOperationIsolated(journal.operationId); this.currentUntransferred(slot);
    const hadOrphan = journal.orphanedCallPossible;
    const terminal: OpenJournal = { ...journal, state: "plan-invalidated", hardStop: false, orphanedCallPossible: false,
      result: { retired: true, ...proof }, updatedAt: new Date().toISOString(),
      nextSafeAction: "Attempt retired without replay or continuation. Unknown disposable file effects remain. Ordinary startup may be considered separately; no original design outcome was inferred." };
    delete terminal.runtimeRestartChallenge; delete terminal.runtimeRestartChallengeIssuedAt;
    await this.services.updateOperation(terminal);
    this.currentUntransferred(slot);
    Object.assign(journal, terminal);
    delete journal.runtimeRestartChallenge; delete journal.runtimeRestartChallengeIssuedAt;
    if (hadOrphan) { await engine.executionAuthorityValidator?.releaseCapture?.(authority); }
    return summary(journal);
  }
}
