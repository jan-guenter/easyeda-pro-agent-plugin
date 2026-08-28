import {
  OPERATION_SCHEMA,
  assertSubset,
  buildPlanHash,
  canonicalJson,
  classifyTool,
  controlImplementationFingerprint,
  evaluateAssertions,
  extractToolPayload,
  isTerminalOperation,
  newOperationId,
  normalizeEasyedaProjectPath,
  normalizeProofEnvelope,
  operationHasOrphanedCallRisk,
  reviewedCompatibilityManifestFingerprint,
  sha256Json,
  sha256Text,
  operationSummary as untypedOperationSummary,
  validateExpectedFingerprint,
  validatePrivateFingerprint,
} from "./core.ts";
import {
  controlDataDirectory,
  controlRootCapability,
  createOperation,
  listOperations,
  loadOperation,
  operationPath,
  updateOperation,
  writePhaseArtifact,
} from "./artifacts.ts";
import type { ArtifactDescriptor } from "./artifacts.ts";
import { createCheckpoint, verifyCheckpoint } from "./checkpoint.ts";
import type {
  CheckpointAccessPolicy,
  CheckpointCreateInput,
} from "./checkpoint.ts";
import {
  CONTEXT_PROBE_CODE,
  PROJECT_CONTEXT_PROBE_CODE,
  RUNTIME_IDENTITY_PROBE_CODE,
  buildActivateRecoveryTargetCode,
  buildComponentMutationCode,
  buildReopenOnlyCode,
  buildSaveReopenCode,
  wrapWithContextGuard,
} from "./runtime-scripts.ts";
import type { ExactSaveGuard } from "./runtime-scripts.ts";
import {
  buildExactReadCode,
  exactTargetAssertionPointer,
  validateExactReadPayload,
  validateExactReadRequest,
} from "./exact-readers.ts";
import type { ExactReadRequest } from "./exact-readers.ts";
import { randomUUID } from "node:crypto";
import { dirname, isAbsolute, join } from "node:path";

const FORBIDDEN_APPLY_NAMES =
  /(^|_)(save|save_all|sync|import_changes|order|purchase)(_|$)/iu;
const DEDICATED_FACADE_NAME = /(^|_)(capture|export)(_|$)/iu;
const EXACT_COMPONENT_MUTATION_TOOL =
  "easyeda_control_exact_component_mutation";
const ACTIVE_DOCUMENT_WRITE_ALLOWLIST = new Map<number, Set<string>>([
  [3, new Set<string>()],
]);

async function checkpointAccessPolicy(
  source: string,
): Promise<CheckpointAccessPolicy> {
  const expectedSource = normalizeEasyedaProjectPath(source);
  return {
    expectedSource,
    controlRoot: await controlRootCapability(),
    artifactRoots: [
      join(dirname(expectedSource), "backups"),
      join(controlDataDirectory(), "checkpoints"),
    ],
  };
}

async function createAuthorizedCheckpoint(
  input: Readonly<CheckpointCreateInput>,
  expectedSource = input.source,
): Promise<Awaited<ReturnType<typeof createCheckpoint>>> {
  const source = normalizeEasyedaProjectPath(input.source);
  return createCheckpoint(
    { ...input, source },
    await checkpointAccessPolicy(expectedSource),
  );
}

async function verifyAuthorizedCheckpoint(
  receiptPath: string,
  source: string,
): Promise<Awaited<ReturnType<typeof verifyCheckpoint>>> {
  return verifyCheckpoint(receiptPath, await checkpointAccessPolicy(source));
}

type UnknownRecord = Record<string, unknown>;
export type MutationStateName = "before" | "after";
type ExpectedCallKind = "read" | "mutate-unsaved";
export type RecoveryResolution =
  | "reconciled-no-mutation"
  | "reconciled-applied-unsaved"
  | "reconciled-saved-reopened";

export interface AssertionSpec {
  pointer: string;
  op: "exists" | "equals" | "not-equals" | "matches" | "length-equals";
  value?: unknown;
}

interface AssertionResult {
  index: number;
  pointer: string;
  op: string;
  passed: boolean;
  expected: unknown;
  actual: unknown;
}

export interface SerializedError {
  name: string;
  message: string;
  mismatches?: unknown;
  assertionResults?: unknown;
  upstreamResult?: unknown;
}

interface AnnotatedError extends Error {
  mismatches?: unknown;
  assertionResults?: unknown;
  upstreamResult?: unknown;
  journalStateRecorded?: boolean;
  blockingOperations?: unknown;
  durableBaselineFailure?: boolean;
  persistenceProofFailure?: boolean;
  requiredRuntimeRestartConfirmation?: string;
  orphanedCallPhase?: unknown;
}

export type ProjectContext =
  | (UnknownRecord & {
      uuid: string;
      projectUuid?: string | undefined;
      path: string;
    })
  | (UnknownRecord & {
      projectUuid: string;
      uuid?: string | undefined;
      path: string;
    });

export type ExpectedDocumentContext =
  | (UnknownRecord & {
      uuid: string;
      documentUuid?: string | undefined;
      documentType: number;
      tabId?: string | undefined;
    })
  | (UnknownRecord & {
      documentUuid: string;
      uuid?: string | undefined;
      documentType: number;
      tabId?: string | undefined;
    });

export type LiveDocumentContext = ExpectedDocumentContext & { tabId: string };

export interface AuxiliaryDocumentContext extends UnknownRecord {
  uuid?: string | undefined;
  documentUuid?: string | undefined;
  tabId?: string | undefined;
}

export interface ExpectedContext extends UnknownRecord {
  project: ProjectContext;
  document: ExpectedDocumentContext;
  pcb?: AuxiliaryDocumentContext | undefined;
  schematic?: AuxiliaryDocumentContext | undefined;
}

interface ProjectProbePayload extends UnknownRecord {
  project: ProjectContext;
}

export interface ContextProbePayload extends ProjectProbePayload {
  document: LiveDocumentContext;
  pcb?: AuxiliaryDocumentContext | undefined;
  schematic?: AuxiliaryDocumentContext | undefined;
}

export interface RuntimeIdentity extends UnknownRecord {
  kind: "runtime-identity";
  generation: string;
  timeOrigin: number;
  processId: number | null;
}

export interface AuthenticatedBridgeSessionIdentity extends UnknownRecord {
  readonly authenticatedAtEpochMs: number;
  readonly authenticationReceiptSha256: string;
  readonly gatewayInstanceId: string;
  readonly sequence: number;
  readonly sessionId: string;
}

export interface AuthenticatedBridgeDispatchBinding {
  readonly begunAtEpochMs: number;
  readonly bindingReceipt: string;
  readonly gatewayInstanceId: string;
  readonly leaseId: string;
  readonly schema: "easyeda-pro-control.bridge-dispatch-lease.v1";
  readonly sessionId: string;
  readonly sessionSequence: number;
}

export interface ClosedAuthenticatedBridgeSessionIdentity
  extends AuthenticatedBridgeSessionIdentity {
  readonly closeReason: string;
  readonly closedAtEpochMs: number;
}

export interface ExecutionAuthorityProcessIdentity extends UnknownRecord {
  readonly pid: number;
  readonly role: string;
  readonly startIdentity: string;
}

export interface ExecutionAuthorityEvidence extends UnknownRecord {
  readonly authoritySha256: string;
  readonly bindingSha256: string;
  readonly capturedAt: string;
  readonly policyId: string;
  readonly policySha256: string;
  readonly processes: readonly ExecutionAuthorityProcessIdentity[];
  readonly processTreeSha256: string;
  readonly schema: "easyeda-pro-control.execution-authority.v1";
}

export interface ExecutionAuthorityTerminationProof extends UnknownRecord {
  readonly bindingSha256: string;
  readonly checkedAt: string;
  readonly noPriorExecutionAuthorityRemains: true;
  readonly ok: true;
  readonly policyId: string;
  readonly policySha256: string;
  readonly schema: "easyeda-pro-control.execution-authority-termination.v1";
  readonly terminatedAuthoritySha256: string;
}

export interface TargetChange {
  primitiveId: string;
  pointer: string;
  before: unknown;
  after: unknown;
}

export interface ToolCallSpec {
  toolName: string;
  arguments?: UnknownRecord;
  assertions?: AssertionSpec[];
  sourceSha256?: string;
}

export interface CheckpointPlan {
  source: string;
  outputDir: string;
  label: string;
}

export interface MutationPlan extends UnknownRecord {
  expectedContext: ExpectedContext;
  targetPrimitiveIds: string[];
  targetChanges: TargetChange[];
  preflightCalls: ToolCallSpec[];
  applyCall: ToolCallSpec;
  verifyCalls: ToolCallSpec[];
  verifyAssertions?: AssertionSpec[];
  rollbackCalls: ToolCallSpec[];
  reopenedVerifyCalls: ToolCallSpec[];
  reopenedAssertions?: AssertionSpec[];
  checkpoint: CheckpointPlan;
  capabilityLevel: string;
  expectedFingerprint: UnknownRecord;
}

interface ProofDetail extends UnknownRecord {
  pins?: boolean;
  bounds?: boolean;
}

interface PadProofRecord extends UnknownRecord {
  primitiveId: string;
  parentComponentPrimitiveId: string;
}

interface ComponentProofRecord extends UnknownRecord {
  pads?: PadProofRecord[];
}

interface ProofPayload extends UnknownRecord {
  kind?: string;
  detail?: ProofDetail;
  primitiveIds?: string[];
  byPrimitiveId?: Record<string, ComponentProofRecord>;
}

interface SpecResult {
  toolName: string;
  payload: unknown;
  assertions: AssertionResult[];
  sourceSha256?: string | undefined;
  transmittedSourceSha256?: string | undefined;
}

interface BaselineInvariants {
  componentKind: string;
  nonTargetComponentStateSha256: string;
  unchangedTargetStateSha256: string;
  schematicTopologySha256?: string;
  pcbInventorySha256?: string;
  pcbRulesSha256?: string;
}

interface PhaseInvariantProof {
  targetAssertions: AssertionResult[];
  nonTargetComponentStateSha256: string;
  unchangedTargetStateSha256: string;
  schematicTopologySha256?: string;
  pcbInventorySha256?: string;
  pcbRulesSha256?: string;
}

interface PadConsequence {
  primitiveId: string;
  parentComponentPrimitiveId: string;
  field: string;
  value: unknown;
}

export interface CheckpointReceipt extends UnknownRecord {
  receiptPath: string;
  checkpoint?: string;
  schema?: string;
}

export interface CheckpointVerification extends UnknownRecord {
  ok: boolean;
  checkpointMatchesReceipt?: boolean;
  sourceEqualsCheckpoint?: boolean;
}

export interface RuntimeRestartBoundary extends UnknownRecord {
  confirmationSha256?: string;
  storedRuntimeFingerprintMatchedAfterReconnect?: boolean;
  limitation?: string;
  reboundTabId?: string;
  priorBridgeSession?: AuthenticatedBridgeSessionIdentity;
  currentBridgeSession?: AuthenticatedBridgeSessionIdentity;
  closedBridgeSession?: unknown;
  priorBridgeDispatch?: AuthenticatedBridgeDispatchBinding;
  executionAuthorityTerminationProof?: ExecutionAuthorityTerminationProof;
}

export interface RuntimeGuardFailure extends UnknownRecord {
  phase: string;
  error: SerializedError;
}

export interface OperationJournal extends UnknownRecord {
  schema: unknown;
  operationId: string;
  journalPath: string;
  planHash: string;
  plan: MutationPlan;
  state: string;
  mutationState: string;
  saved: boolean;
  reopened: boolean;
  orphanedCallPossible: boolean;
  orphanedCallPhase?: string | undefined;
  orphanedCallMarkedAt?: string;
  orphanedCallReturnedAt?: string;
  runtimeRestartChallengeAttempt?: number;
  runtimeRestartChallenge?: string;
  runtimeRestartChallengeIssuedAt?: string;
  runtimeRestartChallengeConsumedAt?: string;
  runtimeRestartBoundary?: RuntimeRestartBoundary;
  runtimeIdentityBeforeOrphan?: RuntimeIdentity;
  bridgeSessionBeforeOrphan?: AuthenticatedBridgeSessionIdentity;
  bridgeDispatchBeforeOrphan?: AuthenticatedBridgeDispatchBinding;
  executionAuthorityBeforeOrphan?: ExecutionAuthorityEvidence;
  unsavedStateDiscardedByRestart?: boolean;
  baselineDiscardAuthorized?: boolean;
  hardStop: boolean;
  mutationMayHaveOccurred: boolean;
  nextSafeAction: string;
  context: ExpectedContext;
  runtimeStatus?: unknown;
  facadeImplementation?: unknown;
  preCheckpoint: CheckpointReceipt;
  candidateFinalCheckpoint?: CheckpointReceipt | undefined;
  finalCheckpoint?: CheckpointReceipt;
  sequence: number;
  createdAt?: string;
  updatedAt: string;
  artifacts: ArtifactDescriptor[];
  baselineReopened?: boolean;
  baselineHash?: string;
  baselineInvariants?: BaselineInvariants;
  unknownPhase?: string | undefined;
  lastError?: SerializedError;
  runtimeGuardFailure?: RuntimeGuardFailure;
  recoveryActivationResumeState?: string;
  recoveryActivationPriorUnknownPhase?: string | null;
  recoveryAttemptCount?: number;
  recoverySourceSha256?: string;
}

export interface OperationSummary {
  operationId: string;
  planHash: string;
  state: string;
  mutationState: string;
  saved: boolean;
  reopened: boolean;
  hardStop: boolean;
  mutationMayHaveOccurred: boolean;
  orphanedCallPossible: boolean;
  orphanedCallPhase?: string | undefined;
  runtimeRestartChallenge?: string | undefined;
  runtimeRestartChallengeIssuedAt?: string | undefined;
  runtimeRestartBoundary?: RuntimeRestartBoundary | undefined;
  nextSafeAction: string;
  unknownPhase?: string | undefined;
  lastError: unknown;
  journalPath: string;
  checkpoints: unknown;
  artifacts: unknown;
  updatedAt: string;
}

interface DurableBaselineFailure {
  state: string;
  mutationState: string;
  hardStop: boolean;
  mutationMayHaveOccurred: boolean;
  nextSafeAction: string;
}

export interface ToolDescriptor {
  name: string;
  title?: string | undefined;
  description?: string | undefined;
  annotations?:
    | {
        title?: string | undefined;
        readOnlyHint?: boolean | undefined;
        destructiveHint?: boolean | undefined;
        idempotentHint?: boolean | undefined;
        openWorldHint?: boolean | undefined;
      }
    | undefined;
  inputSchema?: unknown;
  outputSchema?: unknown;
}

export interface LauncherFingerprint {
  command: string;
  commandSha256: string;
  args: string[];
  cwd: string;
  entrypoint: string;
  entrypointSha256: string;
  implementationTree: {
    root: string;
    sha256: string;
    fileCount: number;
  };
  executionClosure: {
    root: string;
    directoryCount: number;
    fileCount: number;
    symlinkCount: number;
    totalBytes: number;
    sha256: string;
  };
  dependencyLock: {
    type: string;
    path: string;
    sha256: string;
  };
}

export interface LauncherState {
  startup: LauncherFingerprint;
  current: LauncherFingerprint;
  startupSha256: string;
  currentSha256: string;
  drift: boolean;
}

export interface InstalledEasyedaBundles {
  available: true;
  assetsRoot: string;
  pcbEditor: {
    version: string;
    implementationPath: string;
    implementationSha256: string;
  };
  publicApi: {
    version: string;
    implementationPath: string;
    implementationSha256: string;
    adapterPath: string;
    adapterSha256: string;
    declarationsPath: string;
    declarationsSha256: string;
  };
}

export interface UpstreamClient {
  listTools?: () => Promise<ToolDescriptor[]>;
  findTool?: (name: string) => Promise<ToolDescriptor | undefined>;
  callTool: (
    name: string,
    args: UnknownRecord | undefined,
    timeoutMs?: number,
    dispatchLease?: AuthenticatedBridgeDispatchBinding,
  ) => Promise<unknown>;
  serverInfo?: () => { name?: string; version?: unknown } | undefined;
  instructions?: () => unknown;
  launcherFingerprint?: () => Promise<LauncherFingerprint>;
  launcherState?: () => Promise<LauncherState>;
  installedEasyedaBundles?: () => Promise<InstalledEasyedaBundles>;
  bridgeSessionLifecycle?: () => unknown;
  closedAuthenticatedBridgeSession?: (sessionId: string) => unknown;
  beginAuthenticatedBridgeDispatch?: (
    expectedGatewayInstanceId: string,
    expectedSessionId: string,
  ) => AuthenticatedBridgeDispatchBinding;
  endAuthenticatedBridgeDispatch?: (
    binding: AuthenticatedBridgeDispatchBinding,
  ) => void;
  abortAuthenticatedBridgeDispatch?: (
    binding: AuthenticatedBridgeDispatchBinding,
    outcome: "not-dispatched" | "ambiguous-after-dispatch",
  ) => { readonly released: boolean; readonly retainedUntilSessionClose: boolean };
  currentAuthenticatedBridgeDispatchBinding?: () =>
    | AuthenticatedBridgeDispatchBinding
    | undefined;
}

interface ContextOptions {
  allowTabChange?: boolean;
}

interface OperationBridgeDispatch {
  readonly binding: AuthenticatedBridgeDispatchBinding;
  readonly ownedByAuthenticatedScope: boolean;
}

interface InvokeOptions extends ContextOptions {
  targetChanges?: TargetChange[];
  guardedDispatch?: (
    name: string,
    args: UnknownRecord,
    timeoutMs: number,
  ) => Promise<unknown>;
}

export interface EngineOptions {
  privateComponentWriterValidated?: boolean | undefined;
  semanticPersistenceValidator?: SemanticPersistenceValidator | undefined;
  executionAuthorityValidator?: RuntimeExecutionAuthorityValidator | undefined;
}

export interface ExecutionAuthorityCaptureInput {
  readonly bindingSha256: string;
  readonly bridgeSession: AuthenticatedBridgeSessionIdentity;
  readonly challengeAttempt: number;
  readonly operationId: string;
  readonly orphanPhase: string;
  readonly runtimeIdentity: RuntimeIdentity;
}

export interface ExecutionAuthorityTerminationInput {
  readonly bindingSha256: string;
  readonly challengeAttempt: number;
  readonly currentBridgeSession: AuthenticatedBridgeSessionIdentity;
  readonly currentRuntimeIdentity: RuntimeIdentity;
  readonly operationId: string;
  readonly orphanPhase: string;
  readonly priorBridgeSession: AuthenticatedBridgeSessionIdentity;
  readonly priorExecutionAuthority: ExecutionAuthorityEvidence;
  readonly priorRuntimeIdentity: RuntimeIdentity;
}

export interface RuntimeExecutionAuthorityValidator {
  readonly capture: (
    input: ExecutionAuthorityCaptureInput,
  ) => Promise<ExecutionAuthorityEvidence>;
  readonly proveTerminated: (
    input: ExecutionAuthorityTerminationInput,
  ) => Promise<ExecutionAuthorityTerminationProof>;
}

export interface SemanticPersistenceValidationInput {
  readonly bindingSha256: string;
  readonly operationId: string;
  readonly plan: MutationPlan;
  readonly preCheckpoint: CheckpointReceipt;
  readonly finalCheckpoint: CheckpointReceipt;
  readonly reopenedProofSnapshotSha256: string;
}

export interface SemanticPersistenceProof extends UnknownRecord {
  readonly bindingSha256: string;
  readonly ok: true;
  readonly observedDelta: UnknownRecord;
  readonly policyId: string;
  readonly policySha256: string;
  readonly observedDeltaSha256: string;
}

export type SemanticPersistenceValidator = (
  input: SemanticPersistenceValidationInput,
) => Promise<SemanticPersistenceProof>;

export interface PlanOptions {
  confirmDiscardAnyUnsavedState?: boolean | undefined;
}

export interface SaveReopenOptions {
  confirmDiscardAnyUnsavedState?: boolean | undefined;
}

export interface RecoverOptions {
  runtimeRestartConfirmation?: string | undefined;
  confirmRepeatAfterUnknownRecovery?: boolean | undefined;
  confirmDiscardAnyUnsavedState?: boolean | undefined;
}

interface ToolClassification {
  readOnly: boolean;
  write: boolean;
  hasConfirmWrite: boolean;
  idempotent: boolean;
}

interface ValidatedSpec {
  tool: ToolDescriptor;
  classification: ToolClassification;
  exactRequest?: ExactReadRequest;
  exactComponentMutation?: { state: MutationStateName };
}

interface StatusProbe {
  available: boolean;
  payload?: UnknownRecord;
  error?: SerializedError;
}

type ControlFingerprint = Awaited<
  ReturnType<typeof controlImplementationFingerprint>
>;

type InstalledBundlesStatus =
  | InstalledEasyedaBundles
  | {
      available: false;
      error: SerializedError | { message: string };
    };

interface StableRuntimeFingerprint extends UnknownRecord {
  facadeImplementation: ControlFingerprint;
  reviewedCompatibilityManifest: ReturnType<
    typeof reviewedCompatibilityManifestFingerprint
  >;
  upstreamServer: { version: unknown };
  upstreamLauncher: LauncherFingerprint;
  upstreamImplementationDrift: boolean;
  installedBundles: InstalledBundlesStatus;
  toolCount: number;
  toolCatalogSha256: string;
  health: { payload: UnknownRecord };
  bridge: { payload: UnknownRecord };
  bridgeDispatcher: { payload: UnknownRecord };
}

export interface EngineStatus {
  upstreamServer: { name?: string; version?: unknown } | undefined;
  upstreamLauncher: LauncherFingerprint;
  upstreamLauncherState: LauncherState;
  installedBundles: InstalledBundlesStatus;
  toolCatalogSha256: string;
  upstreamInstructions: unknown;
  toolCount: number;
  health: StatusProbe;
  bridge: StatusProbe;
  dispatcher: StatusProbe;
  facadeImplementation: ControlFingerprint;
  capabilities: {
    exactReads: { enabled: boolean; level: string };
    privateComponentWriter: { enabled: boolean; level: string; reason: string };
  };
  stableFingerprint: StableRuntimeFingerprint;
}

interface CheckpointArgs {
  receiptPath?: string;
  source?: string;
  outputDir?: string;
  label?: string;
}

function isUnknownRecord(value: unknown): value is UnknownRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function containsAsciiControlCharacter(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.codePointAt(index);
    if (code !== undefined && (code < 32 || code === 127)) {
      return true;
    }
  }
  return false;
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

function isContextProbePayload(value: unknown): value is ContextProbePayload {
  return (
    isUnknownRecord(value) &&
    isUnknownRecord(value["project"]) &&
    isUnknownRecord(value["document"])
  );
}

function isProjectProbePayload(value: unknown): value is ProjectProbePayload {
  return isUnknownRecord(value) && isUnknownRecord(value["project"]);
}

function isOperationJournalRecord(value: unknown): value is OperationJournal {
  return isUnknownRecord(value);
}

function isMutationPlan(value: unknown): value is MutationPlan {
  if (!isUnknownRecord(value)) {
    return false;
  }
  const expectedContext = value["expectedContext"];
  return (
    isUnknownRecord(expectedContext) &&
    isUnknownRecord(expectedContext["project"]) &&
    isUnknownRecord(expectedContext["document"]) &&
    isUnknownRecord(value["applyCall"]) &&
    isUnknownRecord(value["checkpoint"]) &&
    isUnknownRecord(value["expectedFingerprint"])
  );
}

function isCompleteOperationJournal(value: unknown): value is OperationJournal {
  return (
    isUnknownRecord(value) &&
    typeof value["operationId"] === "string" &&
    typeof value["planHash"] === "string" &&
    typeof value["state"] === "string" &&
    typeof value["mutationState"] === "string" &&
    typeof value["saved"] === "boolean" &&
    typeof value["reopened"] === "boolean" &&
    typeof value["hardStop"] === "boolean" &&
    typeof value["mutationMayHaveOccurred"] === "boolean" &&
    typeof value["nextSafeAction"] === "string" &&
    typeof value["journalPath"] === "string" &&
    typeof value["updatedAt"] === "string"
  );
}

function operationSummary(operation: OperationJournal): OperationSummary;
function operationSummary(
  operation: Readonly<UnknownRecord>,
): ReturnType<typeof untypedOperationSummary>;
function operationSummary(
  operation: Readonly<UnknownRecord>,
): OperationSummary | ReturnType<typeof untypedOperationSummary> {
  const summary = untypedOperationSummary(operation);
  if (!isCompleteOperationJournal(operation)) {
    return summary;
  }
  return {
    operationId: operation.operationId,
    planHash: operation.planHash,
    state: operation.state,
    mutationState: operation.mutationState,
    saved: operation.saved,
    reopened: operation.reopened,
    hardStop: operation.hardStop,
    mutationMayHaveOccurred: operation.mutationMayHaveOccurred,
    orphanedCallPossible: summary.orphanedCallPossible,
    orphanedCallPhase:
      typeof summary.orphanedCallPhase === "string"
        ? summary.orphanedCallPhase
        : undefined,
    runtimeRestartChallenge:
      typeof summary.runtimeRestartChallenge === "string"
        ? summary.runtimeRestartChallenge
        : undefined,
    runtimeRestartChallengeIssuedAt:
      typeof summary.runtimeRestartChallengeIssuedAt === "string"
        ? summary.runtimeRestartChallengeIssuedAt
        : undefined,
    runtimeRestartBoundary: operation.runtimeRestartBoundary,
    nextSafeAction: operation.nextSafeAction,
    unknownPhase:
      typeof summary.unknownPhase === "string"
        ? summary.unknownPhase
        : undefined,
    lastError: summary.lastError,
    journalPath: operation.journalPath,
    checkpoints: summary.checkpoints,
    artifacts: summary.artifacts,
    updatedAt: operation.updatedAt,
  };
}

function annotatedError(
  message: string,
  options?: ErrorOptions,
): AnnotatedError {
  return new Error(message, options);
}

function errorMetadata(error: unknown): AnnotatedError | undefined {
  return error instanceof Error ? error : undefined;
}

function proofPayload(value: unknown): ProofPayload {
  if (!isUnknownRecord(value)) {
    throw new Error("Exact proof payload must be an object.");
  }
  return value;
}

function contextPayload(value: unknown): ContextProbePayload {
  if (!isContextProbePayload(value)) {
    throw new Error("EasyEDA context probe returned a non-object context.");
  }
  return value;
}

function projectPayload(value: unknown): ProjectProbePayload {
  if (!isProjectProbePayload(value)) {
    throw new Error(
      "EasyEDA project probe returned a non-object project context.",
    );
  }
  return value;
}

function runtimeIdentityPayload(value: unknown): RuntimeIdentity {
  if (
    !isUnknownRecord(value) ||
    value["kind"] !== "runtime-identity" ||
    typeof value["generation"] !== "string" ||
    value["generation"].length < 24 ||
    typeof value["timeOrigin"] !== "number" ||
    !Number.isFinite(value["timeOrigin"]) ||
    value["timeOrigin"] <= 0 ||
    !(
      value["processId"] === null ||
      (typeof value["processId"] === "number" &&
        Number.isInteger(value["processId"]) &&
        value["processId"] > 0)
    )
  ) {
    throw new Error("EasyEDA runtime identity probe returned invalid evidence.");
  }
  return {
    ...value,
    kind: "runtime-identity",
    generation: value["generation"],
    timeOrigin: value["timeOrigin"],
    processId: value["processId"],
  };
}

function base64UrlIdentity(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length === 43 &&
    /^[A-Za-z0-9_-]+$/u.test(value)
  );
}

function authenticatedBridgeSessionPayload(
  value: unknown,
  gatewayInstanceId: unknown,
): AuthenticatedBridgeSessionIdentity {
  if (
    !isUnknownRecord(value) ||
    !base64UrlIdentity(gatewayInstanceId) ||
    !base64UrlIdentity(value["sessionId"]) ||
    typeof value["authenticationReceiptSha256"] !== "string" ||
    !/^[a-f0-9]{64}$/u.test(value["authenticationReceiptSha256"]) ||
    typeof value["authenticatedAtEpochMs"] !== "number" ||
    !Number.isSafeInteger(value["authenticatedAtEpochMs"]) ||
    value["authenticatedAtEpochMs"] <= 0 ||
    typeof value["sequence"] !== "number" ||
    !Number.isSafeInteger(value["sequence"]) ||
    value["sequence"] <= 0
  ) {
    throw new Error(
      "The authenticated bridge did not return a strict active-session identity.",
    );
  }
  return {
    ...value,
    gatewayInstanceId,
    sessionId: value["sessionId"],
    authenticationReceiptSha256: value["authenticationReceiptSha256"],
    authenticatedAtEpochMs: value["authenticatedAtEpochMs"],
    sequence: value["sequence"],
  };
}

function bridgeLifecycleSession(value: unknown): AuthenticatedBridgeSessionIdentity {
  if (
    !isUnknownRecord(value) ||
    value["schema"] !==
      "easyeda-pro-control.authenticated-bridge-lifecycle.v1" ||
    value["activeSession"] === null ||
    value["activeSession"] === undefined
  ) {
    throw new Error(
      "No fully authenticated EasyEDA bridge session is active.",
    );
  }
  return authenticatedBridgeSessionPayload(
    value["activeSession"],
    value["gatewayInstanceId"],
  );
}

function closedBridgeSessionPayload(
  value: unknown,
  prior: AuthenticatedBridgeSessionIdentity,
): ClosedAuthenticatedBridgeSessionIdentity {
  const session = authenticatedBridgeSessionPayload(
    value,
    prior.gatewayInstanceId,
  );
  if (
    session.sessionId !== prior.sessionId ||
    session.authenticationReceiptSha256 !==
      prior.authenticationReceiptSha256 ||
    session.authenticatedAtEpochMs !== prior.authenticatedAtEpochMs ||
    session.sequence !== prior.sequence ||
    !isUnknownRecord(value) ||
    typeof value["closedAtEpochMs"] !== "number" ||
    !Number.isSafeInteger(value["closedAtEpochMs"]) ||
    value["closedAtEpochMs"] < session.authenticatedAtEpochMs ||
    typeof value["closeReason"] !== "string" ||
    value["closeReason"].length === 0 ||
    value["closeReason"].length > 160
  ) {
    throw new Error(
      "The prior authenticated bridge session has no exact closure record.",
    );
  }
  return {
    ...session,
    closedAtEpochMs: value["closedAtEpochMs"],
    closeReason: value["closeReason"],
  };
}

function authenticatedBridgeDispatchPayload(
  value: unknown,
  session: AuthenticatedBridgeSessionIdentity,
): AuthenticatedBridgeDispatchBinding {
  if (
    !isUnknownRecord(value) ||
    canonicalJson(Object.keys(value).toSorted()) !==
      canonicalJson(
        [
          "begunAtEpochMs",
          "bindingReceipt",
          "gatewayInstanceId",
          "leaseId",
          "schema",
          "sessionId",
          "sessionSequence",
        ].toSorted(),
      ) ||
    value["schema"] !== "easyeda-pro-control.bridge-dispatch-lease.v1" ||
    value["gatewayInstanceId"] !== session.gatewayInstanceId ||
    value["sessionId"] !== session.sessionId ||
    value["sessionSequence"] !== session.sequence ||
    typeof value["begunAtEpochMs"] !== "number" ||
    !Number.isSafeInteger(value["begunAtEpochMs"]) ||
    value["begunAtEpochMs"] < session.authenticatedAtEpochMs ||
    typeof value["leaseId"] !== "string" ||
    !/^[A-Za-z0-9_-]{43}$/u.test(value["leaseId"]) ||
    typeof value["bindingReceipt"] !== "string" ||
    !/^[A-Za-z0-9_-]{43}$/u.test(value["bindingReceipt"])
  ) {
    throw new Error(
      "The upstream did not bind dispatch to the exact authenticated EasyEDA bridge session.",
    );
  }
  return {
    begunAtEpochMs: value["begunAtEpochMs"],
    bindingReceipt: value["bindingReceipt"],
    gatewayInstanceId: value["gatewayInstanceId"],
    leaseId: value["leaseId"],
    schema: "easyeda-pro-control.bridge-dispatch-lease.v1",
    sessionId: value["sessionId"],
    sessionSequence: value["sessionSequence"],
  };
}

function executionAuthorityPayload(
  value: unknown,
  expectedBindingSha256: string,
): ExecutionAuthorityEvidence {
  if (
    !isUnknownRecord(value) ||
    value["schema"] !== "easyeda-pro-control.execution-authority.v1" ||
    value["bindingSha256"] !== expectedBindingSha256 ||
    typeof value["policyId"] !== "string" ||
    !/^[a-z0-9][a-z0-9._:-]{0,127}$/iu.test(value["policyId"]) ||
    typeof value["policySha256"] !== "string" ||
    !/^[a-f0-9]{64}$/u.test(value["policySha256"]) ||
    typeof value["capturedAt"] !== "string" ||
    !Number.isFinite(Date.parse(value["capturedAt"])) ||
    !Array.isArray(value["processes"]) ||
    value["processes"].length === 0 ||
    value["processes"].length > 512
  ) {
    throw new Error(
      "The execution-authority validator did not return a strict operation-bound process-tree capture.",
    );
  }
  const processes = value["processes"].map((candidate: unknown) => {
    if (
      !isUnknownRecord(candidate) ||
      typeof candidate["pid"] !== "number" ||
      !Number.isSafeInteger(candidate["pid"]) ||
      candidate["pid"] <= 0 ||
      typeof candidate["role"] !== "string" ||
      !/^[a-z0-9][a-z0-9._:-]{0,63}$/iu.test(candidate["role"]) ||
      typeof candidate["startIdentity"] !== "string" ||
      candidate["startIdentity"].length === 0 ||
      candidate["startIdentity"].length > 256 ||
      containsAsciiControlCharacter(candidate["startIdentity"])
    ) {
      throw new Error(
        "The execution-authority process-tree capture contains an invalid process identity.",
      );
    }
    return {
      pid: candidate["pid"],
      role: candidate["role"],
      startIdentity: candidate["startIdentity"],
    };
  });
  if (new Set(processes.map((process) => process.pid)).size !== processes.length) {
    throw new Error(
      "The execution-authority process tree contains duplicate process IDs.",
    );
  }
  const processTreeSha256 = sha256Json(processes);
  const authoritySha256 = sha256Json({
    schema: "easyeda-pro-control.execution-authority.v1",
    bindingSha256: expectedBindingSha256,
    policyId: value["policyId"],
    policySha256: value["policySha256"],
    capturedAt: value["capturedAt"],
    processes,
    processTreeSha256,
  });
  if (
    value["processTreeSha256"] !== processTreeSha256 ||
    value["authoritySha256"] !== authoritySha256
  ) {
    throw new Error(
      "The execution-authority capture hashes do not bind its exact process tree.",
    );
  }
  return {
    ...value,
    schema: "easyeda-pro-control.execution-authority.v1",
    bindingSha256: expectedBindingSha256,
    policyId: value["policyId"],
    policySha256: value["policySha256"],
    capturedAt: value["capturedAt"],
    processes,
    processTreeSha256,
    authoritySha256,
  };
}

function executionAuthorityTerminationPayload(
  value: unknown,
  expectedBindingSha256: string,
  expectedAuthoritySha256: string,
  expectedPolicyId: string,
  expectedPolicySha256: string,
): ExecutionAuthorityTerminationProof {
  if (
    !isUnknownRecord(value) ||
    value["schema"] !==
      "easyeda-pro-control.execution-authority-termination.v1" ||
    value["ok"] !== true ||
    value["noPriorExecutionAuthorityRemains"] !== true ||
    value["bindingSha256"] !== expectedBindingSha256 ||
    value["terminatedAuthoritySha256"] !== expectedAuthoritySha256 ||
    value["policyId"] !== expectedPolicyId ||
    value["policySha256"] !== expectedPolicySha256 ||
    typeof value["checkedAt"] !== "string" ||
    !Number.isFinite(Date.parse(value["checkedAt"]))
  ) {
    throw new Error(
      "The execution-authority validator did not prove termination of the exact prior process tree.",
    );
  }
  return {
    ...value,
    schema: "easyeda-pro-control.execution-authority-termination.v1",
    ok: true,
    noPriorExecutionAuthorityRemains: true,
    bindingSha256: expectedBindingSha256,
    terminatedAuthoritySha256: expectedAuthoritySha256,
    policyId: value["policyId"],
    policySha256: value["policySha256"],
    checkedAt: value["checkedAt"],
  };
}

function semanticPersistenceBindingSha256(input: {
  readonly operationId: string;
  readonly plan: MutationPlan;
  readonly preCheckpoint: CheckpointReceipt;
  readonly finalCheckpoint: CheckpointReceipt;
  readonly reopenedProofSnapshotSha256: string;
}): string {
  return sha256Json({
    schema: "easyeda-pro-control.semantic-persistence-binding.v1",
    operationId: input.operationId,
    planHash: buildPlanHash(input.plan),
    preCheckpointSha256: sha256Json(input.preCheckpoint),
    finalCheckpointSha256: sha256Json(input.finalCheckpoint),
    reopenedProofSnapshotSha256: input.reopenedProofSnapshotSha256,
  });
}

function semanticPersistencePayload(
  value: unknown,
  expectedBindingSha256: string,
): SemanticPersistenceProof {
  if (
    !isUnknownRecord(value) ||
    value["ok"] !== true ||
    value["bindingSha256"] !== expectedBindingSha256 ||
    typeof value["policyId"] !== "string" ||
    !/^[a-z0-9][a-z0-9._:-]{0,127}$/iu.test(value["policyId"]) ||
    typeof value["policySha256"] !== "string" ||
    !/^[a-f0-9]{64}$/u.test(value["policySha256"]) ||
    typeof value["observedDeltaSha256"] !== "string" ||
    !/^[a-f0-9]{64}$/u.test(value["observedDeltaSha256"]) ||
    !isUnknownRecord(value["observedDelta"]) ||
    sha256Json(value["observedDelta"]) !== value["observedDeltaSha256"]
  ) {
    throw new Error(
      "Semantic persistence validator did not return a strict hash-bound proof.",
    );
  }
  return {
    ...value,
    bindingSha256: expectedBindingSha256,
    ok: true,
    policyId: value["policyId"],
    policySha256: value["policySha256"],
    observedDelta: value["observedDelta"],
    observedDeltaSha256: value["observedDeltaSha256"],
  };
}

function asOperationJournal(value: unknown): OperationJournal {
  if (!isOperationJournalRecord(value)) {
    throw new TypeError("Operation journal must be an object.");
  }
  return value;
}

function asOperationJournals(value: unknown): OperationJournal[] {
  return Array.isArray(value)
    ? value.map((item) => asOperationJournal(item))
    : [];
}

function toolDocumentType(toolName: string): number | undefined {
  if (/^easyeda_schematic_/iu.test(toolName)) {
    return 1;
  }
  if (/^easyeda_(pcb|board)_/iu.test(toolName)) {
    return 3;
  }
  return undefined;
}

function now(): string {
  return new Date().toISOString();
}

function serializeError(error: unknown): SerializedError {
  const metadata = errorMetadata(error);
  return {
    name: metadata?.name ?? "Error",
    message: metadata?.message ?? String(error),
    mismatches: metadata?.mismatches,
    assertionResults: metadata?.assertionResults,
    upstreamResult: metadata?.upstreamResult,
  };
}

function assertAssertions(
  payload: unknown,
  assertions: AssertionSpec[] | undefined,
  label: string,
): AssertionResult[] {
  const evaluate = evaluateAssertions as (
    root: unknown,
    specs: AssertionSpec[],
  ) => AssertionResult[];
  const results = evaluate(payload, assertions ?? []);
  const failed = results.filter((result: AssertionResult) => !result.passed);
  if (failed.length > 0) {
    const error = annotatedError(
      `${label} failed ${failed.length} assertion(s).`,
    );
    error.assertionResults = results;
    throw error;
  }
  return results;
}

function snapshotHash(results: SpecResult[]): string {
  return sha256Json(
    results.map((result) => ({
      toolName: result.toolName,
      payload: normalizeProofEnvelope(result.payload),
      assertions: result.assertions,
    })),
  );
}

function runtimeFingerprint(status: unknown): unknown {
  return isUnknownRecord(status) ? status["stableFingerprint"] : undefined;
}

function exactCalls(
  calls: ToolCallSpec[] | undefined,
  kind: string,
): ToolCallSpec[] {
  return (calls ?? []).filter(
    (call) =>
      call.toolName === "easyeda_control_exact_read" &&
      call.arguments?.["kind"] === kind,
  );
}

function assertRequiredPhaseReaders(
  calls: ToolCallSpec[],
  documentType: number,
  targetPrimitiveIds: string[],
  label: string,
): void {
  const componentKind =
    documentType === 1 ? "schematic-components" : "pcb-components";
  const componentCalls = exactCalls(calls, componentKind);
  const summaryCalls = componentCalls.filter((call) => {
    const selector = call.arguments?.["selector"];
    return (
      isUnknownRecord(selector) &&
      selector["all"] === true &&
      call.arguments?.["includePins"] === false &&
      call.arguments?.["includeBounds"] === false
    );
  });
  const targetCalls = componentCalls.filter((call) => {
    const selector = call.arguments?.["selector"];
    const primitiveIds = isUnknownRecord(selector)
      ? selector["primitiveIds"]
      : undefined;
    return (
      isStringArray(primitiveIds) &&
      canonicalJson(
        primitiveIds.toSorted((left, right) => left.localeCompare(right)),
      ) ===
        canonicalJson(
          targetPrimitiveIds.toSorted((left, right) =>
            left.localeCompare(right),
          ),
        ) &&
      call.arguments?.["includePins"] !== false &&
      call.arguments?.["includeBounds"] !== false
    );
  });
  if (
    componentCalls.length !== 2 ||
    summaryCalls.length !== 1 ||
    targetCalls.length !== 1
  ) {
    throw new Error(
      `${label} requires one all-component scalar snapshot (pins/bounds false) and one detailed exact-target ${componentKind} snapshot (pins/bounds true).`,
    );
  }
  if (documentType === 3) {
    for (const kind of ["pcb-inventory", "pcb-rules"]) {
      if (exactCalls(calls, kind).length !== 1) {
        throw new Error(
          `${label} requires exactly one facade-owned ${kind} invariant read.`,
        );
      }
    }
  } else if (exactCalls(calls, "schematic-topology").length !== 1) {
    throw new Error(
      `${label} requires exactly one facade-owned schematic-topology invariant read.`,
    );
  }
}

function resultForKind(results: SpecResult[], kind: string): ProofPayload {
  const matches = (results ?? []).filter(
    (result) =>
      result.toolName === "easyeda_control_exact_read" &&
      proofPayload(result.payload).kind === kind,
  );
  if (matches.length !== 1) {
    throw new Error(`Proof phase did not produce exactly one ${kind} result.`);
  }
  const [match] = matches;
  if (!match) {
    throw new Error(`Proof phase did not produce exactly one ${kind} result.`);
  }
  return proofPayload(match.payload);
}

function componentProofResults(
  results: SpecResult[],
  kind: string,
  targetPrimitiveIds: string[],
): { summary: ProofPayload; target: ProofPayload } {
  const matches = (results ?? [])
    .filter(
      (result) =>
        result.toolName === "easyeda_control_exact_read" &&
        proofPayload(result.payload).kind === kind,
    )
    .map((result) => proofPayload(result.payload));
  const summary = matches.filter(
    (payload) =>
      payload.detail?.pins === false && payload.detail?.bounds === false,
  );
  const target = matches.filter(
    (payload) =>
      payload.detail?.pins === true &&
      payload.detail?.bounds === true &&
      canonicalJson(payload.primitiveIds) ===
        canonicalJson([...targetPrimitiveIds].toSorted()),
  );
  if (matches.length !== 2 || summary.length !== 1 || target.length !== 1) {
    throw new Error(
      `Proof phase did not produce the required summary and target ${kind} results.`,
    );
  }
  const [summaryPayload] = summary;
  const [targetPayload] = target;
  if (!summaryPayload || !targetPayload) {
    throw new Error(
      `Proof phase did not produce the required summary and target ${kind} results.`,
    );
  }
  return { summary: summaryPayload, target: targetPayload };
}

function targetRecordPointer(primitiveId: string): string {
  return exactTargetAssertionPointer(primitiveId).replace(
    /\/primitiveId$/u,
    "",
  );
}

function targetChangeAssertions(
  plan: MutationPlan,
  state: MutationStateName,
): AssertionSpec[] {
  return plan.targetChanges.map((change) => ({
    pointer: `${targetRecordPointer(change.primitiveId)}${change.pointer}`,
    op: "equals",
    value: change[state],
  }));
}

function maskRelativePointer(root: UnknownRecord, pointer: string): void {
  const parts = pointer
    .slice(1)
    .split("/")
    .map((part) => part.replaceAll("~1", "/").replaceAll("~0", "~"));
  let owner: unknown = root;
  for (let index = 0; index < parts.length - 1; index += 1) {
    const key = parts[index];
    if (key === undefined) {
      throw new Error(
        `Declared target change pointer does not resolve: ${pointer}`,
      );
    }
    if (Array.isArray(owner) && /^\d+$/u.test(key)) {
      owner = owner[Number(key)];
    } else if (isUnknownRecord(owner)) {
      owner = owner[key];
    } else {
      owner = undefined;
    }
    if (!isUnknownRecord(owner) && !Array.isArray(owner)) {
      throw new Error(
        `Declared target change pointer does not resolve: ${pointer}`,
      );
    }
  }
  const finalKey = parts.at(-1);
  if (
    finalKey === undefined ||
    (Array.isArray(owner)
      ? !/^\d+$/u.test(finalKey) || Number(finalKey) >= owner.length
      : !isUnknownRecord(owner) || !Object.hasOwn(owner, finalKey))
  ) {
    throw new Error(
      `Declared target change pointer does not resolve: ${pointer}`,
    );
  }
  if (Array.isArray(owner)) {
    owner[Number(finalKey)] = "__DECLARED_TARGET_CHANGE__";
  } else if (isUnknownRecord(owner)) {
    owner[finalKey] = "__DECLARED_TARGET_CHANGE__";
  }
}

function targetComponentInvariantHash(
  payload: ProofPayload,
  plan: MutationPlan,
): string {
  const records = structuredClone(payload?.byPrimitiveId ?? {});
  for (const change of plan.targetChanges) {
    const record = records[change.primitiveId];
    if (!record || typeof record !== "object") {
      throw new Error(
        `Exact component snapshot omitted declared target ${change.primitiveId}.`,
      );
    }
    maskRelativePointer(record, change.pointer);
  }
  return sha256Json(records);
}

function nonTargetComponentHash(
  payload: ProofPayload,
  targetPrimitiveIds: string[],
): string {
  const targets = new Set(targetPrimitiveIds);
  return sha256Json(
    Object.fromEntries(
      Object.entries(payload?.byPrimitiveId ?? {}).filter(
        ([primitiveId]) => !targets.has(primitiveId),
      ),
    ),
  );
}

function declaredTargetPadConsequences(
  plan: MutationPlan,
  targetComponentPayload: ProofPayload,
  stateName: MutationStateName,
): Map<string, PadConsequence> {
  if (!["before", "after"].includes(stateName)) {
    throw new Error(
      "PCB pad consequence proof requires before or after state.",
    );
  }
  const consequences = new Map<string, PadConsequence>();
  for (const change of plan.targetChanges) {
    const match = /^\/pads\/(0|[1-9]\d*)\/(x|y|rotation|layer)$/u.exec(
      change.pointer,
    );
    if (!match) {
      continue;
    }
    const component =
      targetComponentPayload?.byPrimitiveId?.[change.primitiveId];
    const padIndexText = match[1];
    const field = match[2];
    if (padIndexText === undefined || field === undefined) {
      throw new Error(
        `Declared target pad consequence is malformed: ${change.pointer}`,
      );
    }
    const padIndex = Number(padIndexText);
    const pad = component?.pads?.[padIndex];
    if (!pad || typeof pad !== "object") {
      throw new Error(
        `Declared target pad consequence does not resolve: ${change.primitiveId}${change.pointer}`,
      );
    }
    const key = `${pad.primitiveId}\u0000${field}`;
    if (consequences.has(key)) {
      throw new Error(
        `Declared target pad consequence repeats direct pad ${pad.primitiveId}/${field}.`,
      );
    }
    consequences.set(key, {
      primitiveId: pad.primitiveId,
      parentComponentPrimitiveId: change.primitiveId,
      field,
      value: change[stateName],
    });
  }
  return consequences;
}

function pcbInventoryInvariantHash(
  payload: ProofPayload,
  plan: MutationPlan,
  targetComponentPayload: ProofPayload,
  stateName: MutationStateName,
): string {
  const normalizedInventory = normalizeProofEnvelope(payload);
  if (!isUnknownRecord(normalizedInventory)) {
    throw new Error("PCB inventory invariant must be an object.");
  }
  const inventory = structuredClone(normalizedInventory);
  const targetSet = new Set(plan.targetPrimitiveIds);
  const declaredConsequences = declaredTargetPadConsequences(
    plan,
    targetComponentPayload,
    stateName,
  );
  const families = inventory["families"];
  const padFamily = isUnknownRecord(families) ? families["pads"] : undefined;
  const padsCandidate = isUnknownRecord(padFamily)
    ? padFamily["byPrimitiveId"]
    : undefined;
  if (!isUnknownRecord(padsCandidate)) {
    throw new Error(
      "PCB inventory invariant omitted its direct pad state index.",
    );
  }
  const pads = padsCandidate;
  for (const consequence of declaredConsequences.values()) {
    const pad = pads[consequence.primitiveId];
    if (
      !isUnknownRecord(pad) ||
      typeof pad["parentComponentPrimitiveId"] !== "string" ||
      !targetSet.has(pad["parentComponentPrimitiveId"]) ||
      pad["parentComponentPrimitiveId"] !==
        consequence.parentComponentPrimitiveId
    ) {
      throw new Error(
        `Declared target pad consequence ${consequence.primitiveId}/${consequence.field} has no matching target-owned direct pad.`,
      );
    }
    if (!Object.hasOwn(pad, consequence.field)) {
      throw new Error(
        `Target-owned direct pad ${consequence.primitiveId} omitted declared consequence field ${consequence.field}.`,
      );
    }
    if (
      canonicalJson(pad[consequence.field]) !== canonicalJson(consequence.value)
    ) {
      throw new Error(
        `Target-owned direct pad ${consequence.primitiveId}/${consequence.field} disagrees with its declared ${stateName} consequence.`,
      );
    }
    pad[consequence.field] = "__AUTHORIZED_TARGET_PAD_CONSEQUENCE__";
  }
  return sha256Json(inventory);
}

function baselineInvariants(
  results: SpecResult[],
  plan: MutationPlan,
): BaselineInvariants {
  const documentType = plan.expectedContext.document.documentType;
  const componentKind =
    documentType === 1 ? "schematic-components" : "pcb-components";
  const components = componentProofResults(
    results,
    componentKind,
    plan.targetPrimitiveIds,
  );
  assertAssertions(
    components.target,
    targetChangeAssertions(plan, "before"),
    "Declared target baseline",
  );
  const value: BaselineInvariants = {
    componentKind,
    nonTargetComponentStateSha256: nonTargetComponentHash(
      components.summary,
      plan.targetPrimitiveIds,
    ),
    unchangedTargetStateSha256: targetComponentInvariantHash(
      components.target,
      plan,
    ),
  };
  if (documentType === 1) {
    value.schematicTopologySha256 = sha256Json(
      normalizeProofEnvelope(resultForKind(results, "schematic-topology")),
    );
  } else if (documentType === 3) {
    value.pcbInventorySha256 = pcbInventoryInvariantHash(
      resultForKind(results, "pcb-inventory"),
      plan,
      components.target,
      "before",
    );
    value.pcbRulesSha256 = sha256Json(
      normalizeProofEnvelope(resultForKind(results, "pcb-rules")),
    );
  }
  return value;
}

function verifyPhaseInvariants(
  results: SpecResult[],
  operation: OperationJournal,
  label: string,
): PhaseInvariantProof {
  const baseline = operation.baselineInvariants;
  if (!baseline) {
    throw new Error(
      "Operation journal has no exact baseline invariant hashes.",
    );
  }
  const components = componentProofResults(
    results,
    baseline.componentKind,
    operation.plan.targetPrimitiveIds,
  );
  const targetAssertions = assertAssertions(
    components.target,
    targetChangeAssertions(operation.plan, "after"),
    `${label} declared target state`,
  );
  const nonTargetComponentStateSha256 = nonTargetComponentHash(
    components.summary,
    operation.plan.targetPrimitiveIds,
  );
  if (
    nonTargetComponentStateSha256 !== baseline.nonTargetComponentStateSha256
  ) {
    throw new Error(
      `${label} changed one or more non-target component scalar records.`,
    );
  }
  const unchangedTargetStateSha256 = targetComponentInvariantHash(
    components.target,
    operation.plan,
  );
  if (unchangedTargetStateSha256 !== baseline.unchangedTargetStateSha256) {
    throw new Error(
      `${label} changed target state outside the explicitly declared targetChanges.`,
    );
  }
  const proof: PhaseInvariantProof = {
    targetAssertions,
    nonTargetComponentStateSha256,
    unchangedTargetStateSha256,
  };
  if (operation.plan.expectedContext.document.documentType === 1) {
    const topologyHash = sha256Json(
      normalizeProofEnvelope(resultForKind(results, "schematic-topology")),
    );
    if (topologyHash !== baseline.schematicTopologySha256) {
      throw new Error(
        `${label} changed compiled schematic pin connectivity or component correlation.`,
      );
    }
    proof.schematicTopologySha256 = topologyHash;
  } else if (operation.plan.expectedContext.document.documentType === 3) {
    const inventoryHash = pcbInventoryInvariantHash(
      resultForKind(results, "pcb-inventory"),
      operation.plan,
      components.target,
      "after",
    );
    const rulesHash = sha256Json(
      normalizeProofEnvelope(resultForKind(results, "pcb-rules")),
    );
    if (inventoryHash !== baseline.pcbInventorySha256) {
      throw new Error(
        `${label} changed the PCB primitive inventory or adapter-observable pad/via/track/region/pour/fill state.`,
      );
    }
    if (rulesHash !== baseline.pcbRulesSha256) {
      throw new Error(
        `${label} changed PCB rules, net classes, pairs, groups, or net names.`,
      );
    }
    proof.pcbInventorySha256 = inventoryHash;
    proof.pcbRulesSha256 = rulesHash;
  }
  return proof;
}

function ensurePlanShape(value: unknown): asserts value is MutationPlan {
  if (!isMutationPlan(value)) {
    throw new Error("Mutation plan must be an object.");
  }
  const plan = value;
  const projectUuid =
    plan.expectedContext.project.uuid ??
    plan.expectedContext.project.projectUuid;
  const documentUuid =
    plan.expectedContext.document.uuid ??
    plan.expectedContext.document.documentUuid;
  if (
    typeof projectUuid !== "string" ||
    projectUuid.length === 0 ||
    typeof documentUuid !== "string" ||
    documentUuid.length === 0 ||
    !Number.isInteger(plan.expectedContext.document.documentType)
  ) {
    throw new Error(
      "Plan context requires project UUID, document UUID, and integer documentType.",
    );
  }
  if (plan.expectedContext.document.documentType !== 3) {
    throw new Error(
      "Guarded mutation plans currently support PCB (3) component placement/layer/lock only. Schematic public modify cannot preserve every placed property in this pinned build.",
    );
  }
  if (
    !Array.isArray(plan.targetPrimitiveIds) ||
    plan.targetPrimitiveIds.length !== 1 ||
    new Set(plan.targetPrimitiveIds).size !== plan.targetPrimitiveIds.length
  ) {
    throw new Error(
      "Guarded mutation plans require exactly one targetPrimitiveId so recovery never has to classify a partial multi-component apply.",
    );
  }
  if (!Array.isArray(plan.targetChanges) || plan.targetChanges.length === 0) {
    throw new Error(
      "Mutation plans require explicit before/after targetChanges.",
    );
  }
  const targetSet = new Set(plan.targetPrimitiveIds);
  const documentType = plan.expectedContext.document.documentType;
  const declaredChangeKeys = new Set();
  for (const change of plan.targetChanges) {
    if (!targetSet.has(change?.primitiveId)) {
      throw new Error(
        "Every targetChanges primitiveId must be declared in targetPrimitiveIds.",
      );
    }
    if (
      typeof change.pointer !== "string" ||
      !change.pointer.startsWith("/") ||
      /^\/primitiveId(?:\/|$)/u.test(change.pointer)
    ) {
      throw new Error(
        "Every target change requires a non-identity relative JSON pointer.",
      );
    }
    if (canonicalJson(change.before) === canonicalJson(change.after)) {
      throw new Error(
        "Every target change must declare distinct before and after values.",
      );
    }
    const changeKey = `${change.primitiveId}\u0000${change.pointer}`;
    if (declaredChangeKeys.has(changeKey)) {
      throw new Error(
        `Target change ${change.primitiveId}${change.pointer} is declared more than once.`,
      );
    }
    declaredChangeKeys.add(changeKey);
    if (
      documentType === 3 &&
      !/^\/(?:x|y|rotation|layer|primitiveLock|bounds\/(?:minX|minY|maxX|maxY)|pads\/\d+\/(?:x|y|rotation|layer))$/u.test(
        change.pointer,
      )
    ) {
      throw new Error(
        "Guarded PCB mutation currently permits component placement/lock state and the resulting declared bounds/pad transforms only. Pad/footprint geometry, nets, rules, routes, pours, and stack changes require a separately validated capability.",
      );
    }
    for (const [stateName, stateValue] of [
      ["before", change.before],
      ["after", change.after],
    ] as const) {
      if (change.pointer === "/primitiveLock") {
        if (typeof stateValue !== "boolean") {
          throw new TypeError(
            `Target ${change.primitiveId}${change.pointer} ${stateName} value must be boolean.`,
          );
        }
      } else if (change.pointer === "/layer") {
        if (typeof stateValue !== "number" || ![1, 2].includes(stateValue)) {
          throw new Error(
            `Target ${change.primitiveId}${change.pointer} ${stateName} value must be Top 1 or Bottom 2.`,
          );
        }
      } else if (
        typeof stateValue !== "number" ||
        !Number.isFinite(stateValue)
      ) {
        throw new TypeError(
          `Target ${change.primitiveId}${change.pointer} ${stateName} value must be finite.`,
        );
      }
    }
  }
  for (const primitiveId of plan.targetPrimitiveIds) {
    if (
      !plan.targetChanges.some((change) => change.primitiveId === primitiveId)
    ) {
      throw new Error(
        `Target ${primitiveId} has no declared before/after change.`,
      );
    }
    const writablePattern = /^\/(x|y|rotation|layer|primitiveLock)$/u;
    if (
      !plan.targetChanges.some(
        (change) =>
          change.primitiveId === primitiveId &&
          writablePattern.test(change.pointer),
      )
    ) {
      throw new Error(
        `Target ${primitiveId} has no facade-writable top-level component change.`,
      );
    }
  }
  if (
    typeof plan.expectedContext.document.tabId !== "string" ||
    plan.expectedContext.document.tabId.length === 0
  ) {
    throw new Error("Mutation plans require the exact active document tabId.");
  }
  const expectedProjectPath = normalizeEasyedaProjectPath(
    plan.expectedContext.project.path,
  );
  if (!Array.isArray(plan.preflightCalls) || plan.preflightCalls.length === 0) {
    throw new Error("Plan requires at least one read-only preflight call.");
  }
  if (!Array.isArray(plan.verifyCalls) || plan.verifyCalls.length === 0) {
    throw new Error("Plan requires at least one live verification call.");
  }
  if (
    !Array.isArray(plan.reopenedVerifyCalls) ||
    plan.reopenedVerifyCalls.length === 0
  ) {
    throw new Error(
      "Plan requires at least one reopened-state verification call.",
    );
  }
  for (const [label, calls] of [
    ["Preflight", plan.preflightCalls],
    ["Live verification", plan.verifyCalls],
    ["Reopened verification", plan.reopenedVerifyCalls],
  ] satisfies [string, ToolCallSpec[]][]) {
    assertRequiredPhaseReaders(
      calls,
      plan.expectedContext.document.documentType,
      plan.targetPrimitiveIds,
      label,
    );
  }
  if (!Array.isArray(plan.rollbackCalls) || plan.rollbackCalls.length === 0) {
    throw new Error("Plan requires at least one explicit rollback call.");
  }
  if (
    plan.applyCall.toolName !== EXACT_COMPONENT_MUTATION_TOOL ||
    canonicalJson(plan.applyCall.arguments ?? {}) !==
      canonicalJson({ state: "after" })
  ) {
    throw new Error(
      `applyCall must be the facade-generated ${EXACT_COMPONENT_MUTATION_TOOL} with arguments.state=after.`,
    );
  }
  const rollbackCall = plan.rollbackCalls[0];
  if (
    plan.rollbackCalls.length !== 1 ||
    rollbackCall === undefined ||
    rollbackCall.toolName !== EXACT_COMPONENT_MUTATION_TOOL ||
    canonicalJson(rollbackCall.arguments ?? {}) !==
      canonicalJson({ state: "before" })
  ) {
    throw new Error(
      `rollbackCalls must contain exactly one facade-generated ${EXACT_COMPONENT_MUTATION_TOOL} call with arguments.state=before.`,
    );
  }
  if (
    plan.checkpoint.source.length === 0 ||
    plan.checkpoint.outputDir.length === 0 ||
    plan.checkpoint.label.length === 0
  ) {
    throw new Error(
      "Plan requires source, outputDir, and label for durable checkpoints.",
    );
  }
  if (
    !isAbsolute(plan.checkpoint.source) ||
    !isAbsolute(plan.checkpoint.outputDir)
  ) {
    throw new Error("Checkpoint source and outputDir must be absolute paths.");
  }
  const checkpointSource = normalizeEasyedaProjectPath(plan.checkpoint.source);
  if (checkpointSource !== expectedProjectPath) {
    throw new Error(
      "checkpoint.source must be the exact .eprj2 path reported by expectedContext.project.path.",
    );
  }
  if (plan.checkpoint.label.length > 54) {
    throw new Error("Checkpoint label must be at most 54 characters.");
  }
  if (plan.capabilityLevel !== "private-version-pinned") {
    throw new Error(
      "Guarded PCB component mutation remains private-version-pinned until connected sacrificial-board validation proves this installed modify path.",
    );
  }
  validateExpectedFingerprint(plan.expectedFingerprint);
  validatePrivateFingerprint(plan.expectedFingerprint);
}

export class SerializedGate {
  private admissionOpen = true;
  private tail: Promise<void> = Promise.resolve();

  public run<T>(task: () => T | Promise<T>): Promise<T> {
    if (!this.admissionOpen) {
      return Promise.reject(
        new Error(
          "The EasyEDA control facade is shutting down and no longer accepts operations.",
        ),
      );
    }
    return this.enqueue(task);
  }

  /**
   * Atomically reject every later operation before process shutdown closes the
   * MCP transport. Work already admitted through run() remains ahead of the
   * shutdown drain in the queue.
   */
  public closeAdmission(): void {
    this.admissionOpen = false;
  }

  /** Queue the one shutdown drain after operation admission has been closed. */
  public runAfterAdmissionClose<T>(
    task: () => T | Promise<T>,
  ): Promise<T> {
    if (this.admissionOpen) {
      return Promise.reject(
        new Error(
          "Serialized shutdown cannot run before operation admission closes.",
        ),
      );
    }
    return this.enqueue(task);
  }

  private async enqueue<T>(task: () => T | Promise<T>): Promise<T> {
    const previous = this.tail;
    let release!: () => void;
    this.tail = new Promise((resolve) => {
      release = resolve;
    });
    await previous;
    try {
      return await task();
    } finally {
      release();
    }
  }
}

export class EasyedaControlEngine {
  public readonly upstream: UpstreamClient;
  public readonly privateComponentWriterValidated: boolean;
  public readonly semanticPersistenceValidator:
    | SemanticPersistenceValidator
    | undefined;
  public readonly executionAuthorityValidator:
    | RuntimeExecutionAuthorityValidator
    | undefined;
  public readonly controlFingerprintPromise: ReturnType<
    typeof controlImplementationFingerprint
  >;

  public constructor(upstream: UpstreamClient, options: EngineOptions = {}) {
    this.upstream = upstream;
    this.privateComponentWriterValidated =
      options.privateComponentWriterValidated === true;
    this.semanticPersistenceValidator = options.semanticPersistenceValidator;
    this.executionAuthorityValidator = options.executionAuthorityValidator;
    this.controlFingerprintPromise = controlImplementationFingerprint();
  }

  public requirePrivateComponentWriterEnabled(): void {
    if (
      !this.privateComponentWriterValidated ||
      this.semanticPersistenceValidator === undefined ||
      this.executionAuthorityValidator === undefined
    ) {
      throw new Error(
        "The private PCB component writer is runtime-disabled until a connected sacrificial-board test validates this installed modify path, a strict semantic persistence-delta validator is installed, and an operation-bound process-tree termination validator is installed for ambiguous-call recovery. Exact reads, evidence, checkpoints, capture, and draft DSN export remain available.",
      );
    }
  }

  private authenticatedBridgeSession(): AuthenticatedBridgeSessionIdentity {
    const lifecycle = this.upstream.bridgeSessionLifecycle?.();
    if (lifecycle === undefined) {
      throw new Error(
        "The upstream does not expose authenticated bridge-session lifecycle evidence.",
      );
    }
    return bridgeLifecycleSession(lifecycle);
  }

  public async markOrphanedCallRisk(
    operation: OperationJournal,
    phase: string,
  ): Promise<OperationBridgeDispatch> {
    const validator = this.executionAuthorityValidator;
    if (validator === undefined) {
      throw new Error(
        "Ambiguous-call recovery requires an installed operation-bound process-tree termination validator before dispatch.",
      );
    }
    const beginDispatch = this.upstream.beginAuthenticatedBridgeDispatch;
    const abortDispatch = this.upstream.abortAuthenticatedBridgeDispatch;
    const scopedDispatch =
      this.upstream.currentAuthenticatedBridgeDispatchBinding?.();
    const ownedByAuthenticatedScope = scopedDispatch !== undefined;
    if (
      !ownedByAuthenticatedScope &&
      (beginDispatch === undefined || abortDispatch === undefined)
    ) {
      throw new Error(
        "Ambiguous-call recovery requires authenticated bridge dispatch-lease support.",
      );
    }
    const challengeAttempt =
      (operation.runtimeRestartChallengeAttempt ?? 0) + 1;
    const bridgeSession = this.authenticatedBridgeSession();
    const bridgeDispatch = authenticatedBridgeDispatchPayload(
      scopedDispatch ??
        beginDispatch?.call(
          this.upstream,
          bridgeSession.gatewayInstanceId,
          bridgeSession.sessionId,
        ),
      bridgeSession,
    );
    let journaled = false;
    try {
      const runtimeIdentity = await this.runtimeIdentity(bridgeDispatch);
      if (
        canonicalJson(this.authenticatedBridgeSession()) !==
        canonicalJson(bridgeSession)
      ) {
        throw new Error(
          "The authenticated EasyEDA bridge session changed while bound execution authority was being captured.",
        );
      }
      const bindingSha256 = sha256Json({
        schema: "easyeda-pro-control.execution-authority-binding.v1",
        operationId: operation.operationId,
        orphanPhase: phase,
        challengeAttempt,
        bridgeSession,
        bridgeDispatch,
        runtimeIdentity,
      });
      const executionAuthority = executionAuthorityPayload(
        await validator.capture({
          bindingSha256,
          bridgeSession,
          challengeAttempt,
          operationId: operation.operationId,
          orphanPhase: phase,
          runtimeIdentity,
        }),
        bindingSha256,
      );
      operation.runtimeIdentityBeforeOrphan = runtimeIdentity;
      operation.bridgeSessionBeforeOrphan = bridgeSession;
      operation.bridgeDispatchBeforeOrphan = bridgeDispatch;
      operation.executionAuthorityBeforeOrphan = executionAuthority;
      operation.orphanedCallPossible = true;
      operation.orphanedCallPhase = phase;
      operation.orphanedCallMarkedAt = now();
      operation.runtimeRestartChallengeAttempt = challengeAttempt;
      operation.runtimeRestartChallenge = [
        "EASYEDA_RESTARTED_AND_RECONNECTED",
        operation.operationId,
        phase,
        operation.runtimeRestartChallengeAttempt,
        randomUUID(),
      ].join(":");
      operation.runtimeRestartChallengeIssuedAt = now();
      delete operation.runtimeRestartBoundary;
      operation.updatedAt = now();
      await updateOperation(operation);
      journaled = true;

      const boundRuntimeIdentity = await this.runtimeIdentity(bridgeDispatch);
      if (
        canonicalJson(boundRuntimeIdentity) !== canonicalJson(runtimeIdentity)
      ) {
        throw new Error(
          "The EasyEDA runtime identity changed after dispatch was bound to its authenticated bridge session.",
        );
      }
      return { binding: bridgeDispatch, ownedByAuthenticatedScope };
    } catch (error) {
      if (!ownedByAuthenticatedScope) {
        try {
          abortDispatch?.call(
            this.upstream,
            bridgeDispatch,
            "not-dispatched",
          );
        } catch (abortError) {
          throw new Error(
            `Pre-dispatch authority capture failed (${serializeError(error).message}) and the authenticated bridge dispatch lease could not be released safely: ${serializeError(abortError).message}`,
            { cause: abortError },
          );
        }
      }
      // The orphan marker is only justified once callTool starts.
      // A post-journal authority reproof failure is provably pre-dispatch.
      // Clear it even when an outer authenticated scope owns the lease lifecycle.
      if (journaled) {
        operation.orphanedCallPossible = false;
        operation.orphanedCallPhase = phase;
        operation.orphanedCallReturnedAt = now();
        delete operation.runtimeRestartChallenge;
        delete operation.runtimeRestartChallengeIssuedAt;
        operation.updatedAt = now();
        try {
          await updateOperation(operation);
        } catch (journalError) {
          throw new Error(
            `Pre-dispatch authority capture failed (${serializeError(error).message}) and its unused orphan marker could not be cleared: ${serializeError(journalError).message}`,
            { cause: journalError },
          );
        }
      }
      throw error;
    }
  }

  public async clearOrphanedCallRisk(
    operation: OperationJournal,
    phase: string,
    dispatch: OperationBridgeDispatch,
  ): Promise<void> {
    if (!dispatch.ownedByAuthenticatedScope) {
      const endDispatch = this.upstream.endAuthenticatedBridgeDispatch;
      if (endDispatch === undefined) {
        throw new Error(
          "The authenticated bridge dispatch lease cannot be completed.",
        );
      }
      endDispatch.call(this.upstream, dispatch.binding);
    }
    operation.orphanedCallPossible = false;
    operation.orphanedCallPhase = phase;
    operation.orphanedCallReturnedAt = now();
    delete operation.runtimeRestartChallenge;
    delete operation.runtimeRestartChallengeIssuedAt;
    operation.updatedAt = now();
    await updateOperation(operation);
  }

  private async dispatchWithOrphanTracking(
    operation: OperationJournal,
    phase: string,
    name: string,
    args: UnknownRecord,
    timeoutMs: number,
  ): Promise<unknown> {
    const dispatch = await this.markOrphanedCallRisk(operation, phase);
    try {
      const result = await this.upstream.callTool(
        name,
        args,
        timeoutMs,
        dispatch.binding,
      );
      await this.clearOrphanedCallRisk(operation, phase, dispatch);
      return result;
    } catch (error) {
      if (
        operation.orphanedCallPossible &&
        !dispatch.ownedByAuthenticatedScope
      ) {
        const abortDispatch =
          this.upstream.abortAuthenticatedBridgeDispatch;
        if (abortDispatch === undefined) {
          throw new AggregateError(
            [error],
            "The guarded EasyEDA call failed and its authenticated bridge dispatch lease cannot be retained safely.",
            { cause: error },
          );
        }
        try {
          abortDispatch.call(
            this.upstream,
            dispatch.binding,
            "ambiguous-after-dispatch",
          );
        } catch (abortError) {
          throw new Error(
            `The guarded EasyEDA call failed (${serializeError(error).message}) and its authenticated bridge dispatch lease could not be retained safely: ${serializeError(abortError).message}`,
            { cause: abortError },
          );
        }
      }
      throw error;
    }
  }

  public async ensureRuntimeRestartChallenge(
    operation: OperationJournal,
  ): Promise<string> {
    if (
      typeof operation.runtimeRestartChallenge === "string" &&
      operation.runtimeRestartChallenge.length > 0
    ) {
      return operation.runtimeRestartChallenge;
    }
    const phase =
      operation.orphanedCallPhase ?? operation.unknownPhase ?? "legacy-orphan";
    operation.runtimeRestartChallengeAttempt =
      (operation.runtimeRestartChallengeAttempt ?? 0) + 1;
    operation.runtimeRestartChallenge = [
      "EASYEDA_RESTARTED_AND_RECONNECTED",
      operation.operationId,
      phase,
      operation.runtimeRestartChallengeAttempt,
      randomUUID(),
    ].join(":");
    operation.runtimeRestartChallengeIssuedAt = now();
    operation.updatedAt = now();
    await updateOperation(operation);
    return operation.runtimeRestartChallenge;
  }

  public async requireDurableBaselineBeforeDispatch(
    operation: OperationJournal,
    phase: string,
    failure: DurableBaselineFailure,
  ): Promise<Awaited<ReturnType<typeof verifyCheckpoint>>> {
    let verification: Awaited<ReturnType<typeof verifyCheckpoint>> | undefined;
    let cause: unknown;
    try {
      verification = await verifyAuthorizedCheckpoint(
        operation.preCheckpoint.receiptPath,
        operation.plan.expectedContext.project.path,
      );
      if (!verification.ok) {
        cause = new Error(
          "The durable project database no longer matches the pre-checkpoint.",
        );
      }
    } catch (error) {
      cause = error;
    }
    if (verification?.ok !== true) {
      const error = annotatedError(
        `The durable baseline changed immediately before ${phase}; no ${phase} mutation was dispatched.`,
        cause === undefined ? undefined : { cause },
      );
      error.journalStateRecorded = true;
      operation.state = failure.state;
      operation.mutationState = failure.mutationState;
      operation.hardStop = failure.hardStop;
      operation.mutationMayHaveOccurred = failure.mutationMayHaveOccurred;
      operation.unknownPhase = `${phase}-pre-dispatch-durable-baseline`;
      operation.nextSafeAction = failure.nextSafeAction;
      operation.lastError = serializeError(error);
      operation.updatedAt = now();
      await updateOperation(operation);
      throw error;
    }
    return verification;
  }

  public async assertStoredRuntime(
    operation: OperationJournal,
    phase: string,
  ): Promise<void> {
    try {
      validateExpectedFingerprint(operation.plan.expectedFingerprint);
      if (operation.plan.capabilityLevel === "private-version-pinned") {
        validatePrivateFingerprint(operation.plan.expectedFingerprint);
      }
      assertSubset(
        runtimeFingerprint(await this.status()),
        operation.plan.expectedFingerprint,
        "EasyEDA runtime fingerprint",
      );
    } catch (error) {
      operation.hardStop = true;
      operation.runtimeGuardFailure = {
        phase,
        observedAt: now(),
        error: serializeError(error),
      };
      operation.lastError = serializeError(error);
      operation.nextSafeAction =
        "Do not dispatch another phase. Restore the exact stored runtime fingerprint, then retry the same legal phase or recovery reconciliation.";
      operation.updatedAt = now();
      await updateOperation(operation);
      throw error;
    }
  }

  public async assertBridgeDispatchAllowed(): Promise<true> {
    const blockingOperations = asOperationJournals(await listOperations())
      .filter(
        (operation) =>
          operation?.state === "journal-unreadable" ||
          operationHasOrphanedCallRisk(operation),
      )
      .map((operation) => operationSummary(operation));
    if (blockingOperations.length === 0) {
      return true;
    }
    const labels = blockingOperations
      .map((operation) => `${operation.operationId}:${operation.state}`)
      .join(", ");
    const error = annotatedError(
      `EasyEDA bridge dispatch is quarantined by an orphan-risk or unreadable operation journal (${labels}). Use easyeda_control_recover_incomplete without an operationId to inspect the local journals. Do not run live status, context, reads, captures, exports, checkpoints, or writes until the nonce-bound restart/recovery gate clears every orphan risk; an unreadable journal requires manual restoration or review.`,
    );
    error.blockingOperations = blockingOperations;
    throw error;
  }

  public async assertRecoveryOperationIsolated(
    operationId: string,
  ): Promise<true> {
    const blockingOperations = asOperationJournals(await listOperations())
      .filter(
        (operation) =>
          operation?.operationId !== operationId &&
          (!isTerminalOperation(operation) ||
            operation?.state === "journal-unreadable" ||
            operationHasOrphanedCallRisk(operation)),
      )
      .map((operation) => operationSummary(operation));
    if (blockingOperations.length === 0) {
      return true;
    }
    const labels = blockingOperations
      .map((operation) => `${operation.operationId}:${operation.state}`)
      .join(", ");
    const error = annotatedError(
      `Recovery operation ${operationId} is not isolated; another incomplete, unreadable, or orphan-risk journal exists (${labels}). Recovery may dispatch live bridge calls, so resolve or manually review the other journal first.`,
    );
    error.blockingOperations = blockingOperations;
    throw error;
  }

  public async status(): Promise<EngineStatus> {
    const listTools = this.upstream.listTools?.bind(this.upstream);
    const launcherFingerprint = this.upstream.launcherFingerprint?.bind(
      this.upstream,
    );
    if (listTools === undefined || launcherFingerprint === undefined) {
      throw new Error(
        "The upstream client does not expose status and launcher probes.",
      );
    }
    const tools = await listTools();
    const call = async (name: string): Promise<StatusProbe> => {
      if (!tools.some((tool) => tool.name === name)) {
        return { available: false };
      }
      try {
        const payload = extractToolPayload(
          await this.upstream.callTool(name, {}),
        );
        return {
          available: true,
          payload: isUnknownRecord(payload) ? payload : {},
        };
      } catch (error) {
        return { available: true, error: serializeError(error) };
      }
    };
    const [health, bridge, dispatcher, facadeImplementation] =
      await Promise.all([
        call("easyeda_health_check"),
        call("easyeda_bridge_status"),
        call("easyeda_bridge_probe_methods"),
        this.controlFingerprintPromise,
      ]);
    const upstreamServer = this.upstream.serverInfo?.();
    let installedBundles: InstalledBundlesStatus;
    const readInstalledBundles = this.upstream.installedEasyedaBundles?.bind(
      this.upstream,
    );
    try {
      installedBundles =
        readInstalledBundles === undefined
          ? {
              available: false,
              error: { message: "Installed-bundle probe is unavailable." },
            }
          : await readInstalledBundles();
    } catch (error) {
      installedBundles = { available: false, error: serializeError(error) };
    }
    const readLauncherState = this.upstream.launcherState?.bind(this.upstream);
    const launcherState =
      readLauncherState === undefined
        ? await (async (): Promise<LauncherState> => {
            const startup = await launcherFingerprint();
            const current = await launcherFingerprint();
            return {
              startup,
              current,
              startupSha256: sha256Json(startup),
              currentSha256: sha256Json(current),
              drift: false,
            };
          })()
        : await readLauncherState();
    const upstreamLauncher = launcherState.startup;
    const toolCatalogSha256 = sha256Json(
      tools.map((tool) => ({
        name: tool.name,
        title: tool.title,
        description: tool.description,
        annotations: tool.annotations,
        inputSchema: tool.inputSchema,
        outputSchema: tool.outputSchema,
      })),
    );
    const stableFingerprint = {
      facadeImplementation,
      reviewedCompatibilityManifest: reviewedCompatibilityManifestFingerprint(),
      upstreamServer: { version: upstreamServer?.version },
      upstreamLauncher,
      upstreamImplementationDrift: launcherState.drift,
      installedBundles,
      toolCount: tools.length,
      toolCatalogSha256,
      health: {
        payload: {
          version: health.payload?.["version"],
          node_version: health.payload?.["node_version"],
          bridge_connected: health.payload?.["bridge_connected"],
          easyeda_version: health.payload?.["easyeda_version"],
          extension_version: health.payload?.["extension_version"],
          extension_version_mismatch:
            health.payload?.["extension_version_mismatch"],
          registry_mismatch: health.payload?.["registry_mismatch"],
        },
      },
      bridge: {
        payload: {
          connected: bridge.payload?.["connected"],
          bridge_version: bridge.payload?.["bridge_version"],
          easyeda_version: bridge.payload?.["easyeda_version"],
          diagnostics: {
            method_registry_hash: isUnknownRecord(
              bridge.payload?.["diagnostics"],
            )
              ? bridge.payload["diagnostics"]["method_registry_hash"]
              : undefined,
          },
        },
      },
      bridgeDispatcher: {
        payload: {
          source: dispatcher.payload?.["source"],
          dispatcher_build_id: dispatcher.payload?.["dispatcher_build_id"],
          total: dispatcher.payload?.["total"],
        },
      },
    };
    return {
      upstreamServer,
      upstreamLauncher,
      upstreamLauncherState: launcherState,
      installedBundles,
      toolCatalogSha256,
      upstreamInstructions: this.upstream.instructions?.(),
      toolCount: tools.length,
      health,
      bridge,
      dispatcher,
      facadeImplementation,
      capabilities: {
        exactReads: {
          enabled: true,
          level: "private-version-pinned-read-only",
        },
        privateComponentWriter: {
          enabled:
            this.privateComponentWriterValidated &&
            this.semanticPersistenceValidator !== undefined &&
            this.executionAuthorityValidator !== undefined,
          level: "private-version-pinned",
          reason:
            this.privateComponentWriterValidated &&
            this.semanticPersistenceValidator !== undefined &&
            this.executionAuthorityValidator !== undefined
              ? "Connected sacrificial-board validation, strict persisted-delta validation, and operation-bound process-tree termination proof are installed in this facade build."
              : "Runtime-disabled until connected sacrificial-board validation, strict persisted-delta validation, and operation-bound process-tree termination proof cover the installed modify path.",
        },
      },
      stableFingerprint,
    };
  }

  public async context(): Promise<ExpectedContext> {
    const tool = await this.upstream.findTool?.("easyeda_execute");
    if (!tool) {
      throw new Error("The upstream server does not expose easyeda_execute.");
    }
    const result = await this.upstream.callTool(
      "easyeda_execute",
      { code: CONTEXT_PROBE_CODE, timeoutMs: 15_000, confirmWrite: true },
      25_000,
    );
    const payload = contextPayload(extractToolPayload(result));
    const projectUuid = payload?.project?.uuid ?? payload?.project?.projectUuid;
    const projectPath = payload?.project?.path;
    const documentUuid =
      payload?.document?.uuid ?? payload?.document?.documentUuid;
    const documentType = payload?.document?.documentType;
    const tabId = payload?.document?.tabId;
    if (
      typeof projectUuid !== "string" ||
      projectUuid.length === 0 ||
      typeof projectPath !== "string" ||
      projectPath.length === 0 ||
      typeof documentUuid !== "string" ||
      documentUuid.length === 0 ||
      typeof tabId !== "string" ||
      tabId.length === 0 ||
      !Number.isInteger(documentType) ||
      ![1, 2, 3, 4, 15].includes(documentType)
    ) {
      throw new Error(
        "EasyEDA context probe did not prove a nonempty project UUID/path, document UUID, active tab, and supported document type.",
      );
    }
    payload.project.path = normalizeEasyedaProjectPath(projectPath);
    if (documentType === 1) {
      const schematicUuid =
        payload?.schematic?.uuid ?? payload?.schematic?.documentUuid;
      if (schematicUuid !== documentUuid) {
        throw new Error(
          "Schematic context UUID does not agree with the active document UUID.",
        );
      }
      if (
        typeof payload.schematic?.tabId === "string" &&
        payload.schematic.tabId.length > 0 &&
        payload.schematic.tabId !== tabId
      ) {
        throw new Error(
          "Schematic context tab does not agree with the active document tab.",
        );
      }
    }
    if (documentType === 3) {
      const pcbUuid = payload?.pcb?.uuid ?? payload?.pcb?.documentUuid;
      if (pcbUuid !== documentUuid) {
        throw new Error(
          "PCB context UUID does not agree with the active document UUID.",
        );
      }
      if (
        typeof payload.pcb?.tabId === "string" &&
        payload.pcb.tabId.length > 0 &&
        payload.pcb.tabId !== tabId
      ) {
        throw new Error(
          "PCB context tab does not agree with the active document tab.",
        );
      }
    }
    return payload;
  }

  public async projectContext(): Promise<ProjectProbePayload> {
    const tool = await this.upstream.findTool?.("easyeda_execute");
    if (!tool) {
      throw new Error("The upstream server does not expose easyeda_execute.");
    }
    const result = await this.upstream.callTool(
      "easyeda_execute",
      {
        code: PROJECT_CONTEXT_PROBE_CODE,
        timeoutMs: 15_000,
        confirmWrite: true,
      },
      25_000,
    );
    const payload = projectPayload(extractToolPayload(result));
    const projectUuid = payload?.project?.uuid ?? payload?.project?.projectUuid;
    if (
      typeof projectUuid !== "string" ||
      projectUuid.length === 0 ||
      typeof payload?.project?.path !== "string" ||
      payload.project.path.length === 0
    ) {
      throw new Error(
        "EasyEDA project probe did not prove a UUID and .eprj2 path.",
      );
    }
    normalizeEasyedaProjectPath(payload.project.path);
    return payload;
  }

  public async runtimeIdentity(
    bridgeDispatch?: AuthenticatedBridgeDispatchBinding,
  ): Promise<RuntimeIdentity> {
    const tool = await this.upstream.findTool?.("easyeda_execute");
    if (!tool) {
      throw new Error("The upstream server does not expose easyeda_execute.");
    }
    const result = await this.upstream.callTool(
      "easyeda_execute",
      {
        code: RUNTIME_IDENTITY_PROBE_CODE,
        timeoutMs: 15_000,
        confirmWrite: true,
      },
      25_000,
      bridgeDispatch,
    );
    return runtimeIdentityPayload(extractToolPayload(result));
  }

  public async assertProjectContext(
    expectedProject: ProjectContext,
  ): Promise<ProjectProbePayload> {
    const actual = await this.projectContext();
    const expected: UnknownRecord = structuredClone(expectedProject);
    delete expected["path"];
    assertSubset(actual.project, expected, "Active EasyEDA project");
    if (
      normalizeEasyedaProjectPath(actual.project.path) !==
      normalizeEasyedaProjectPath(expectedProject.path)
    ) {
      throw new Error(
        "Active EasyEDA project path does not match the expected .eprj2 database.",
      );
    }
    return actual;
  }

  public async assertContext(
    expectedContext: ExpectedContext,
    options: ContextOptions = {},
  ): Promise<ContextProbePayload> {
    const actual = contextPayload(await this.context());
    const expected: UnknownRecord = structuredClone(expectedContext);
    if (options.allowTabChange === true) {
      for (const key of ["document", "pcb", "schematic"]) {
        const document = expected[key];
        if (isUnknownRecord(document)) {
          delete document["tabId"];
        }
      }
    }
    const project = expected["project"];
    if (isUnknownRecord(project)) {
      delete project["path"];
    }
    assertSubset(actual, expected, "Active EasyEDA context");
    if (
      normalizeEasyedaProjectPath(actual.project.path) !==
      normalizeEasyedaProjectPath(expectedContext.project.path)
    ) {
      throw new Error(
        "Active EasyEDA project path does not match the expected .eprj2 database.",
      );
    }
    return actual;
  }

  public async rebindAfterLifecycle(
    expectedContext: ExpectedContext,
    payload: unknown,
    label: string,
  ): Promise<ContextProbePayload> {
    const cleanContext = await this.assertContext(expectedContext, {
      allowTabChange: true,
    });
    const payloadDocument = isUnknownRecord(payload)
      ? payload["document"]
      : undefined;
    const payloadTabId = isUnknownRecord(payloadDocument)
      ? payloadDocument["tabId"]
      : undefined;
    if (typeof payloadTabId !== "string" || payloadTabId.length === 0) {
      throw new Error(`${label} did not report the reopened tabId.`);
    }
    if (cleanContext.document.tabId !== payloadTabId) {
      throw new Error(
        `${label} reopened tab does not match the active context tab.`,
      );
    }
    expectedContext.document.tabId = payloadTabId;
    if (expectedContext.pcb && expectedContext.document.documentType === 3) {
      expectedContext.pcb.tabId = payloadTabId;
    }
    if (
      expectedContext.schematic &&
      expectedContext.document.documentType === 1
    ) {
      expectedContext.schematic.tabId = payloadTabId;
    }
    return cleanContext;
  }

  public async activateAndRebindRecoveryTarget(
    operation: OperationJournal,
    resumeState: string,
  ): Promise<ContextProbePayload> {
    await this.assertProjectContext(operation.plan.expectedContext.project);
    const source = buildActivateRecoveryTargetCode(
      operation.plan.expectedContext,
    );
    const sourceSha256 = sha256Text(source);
    const acceptedRestartBoundary = operation.runtimeRestartBoundary
      ? structuredClone(operation.runtimeRestartBoundary)
      : undefined;
    if (!Object.hasOwn(operation, "recoveryActivationResumeState")) {
      operation.recoveryActivationResumeState = resumeState;
    }
    if (!Object.hasOwn(operation, "recoveryActivationPriorUnknownPhase")) {
      operation.recoveryActivationPriorUnknownPhase =
        operation.unknownPhase ?? null;
    }
    operation.state = "recovery-target-activation-dispatching";
    operation.hardStop = true;
    operation.mutationMayHaveOccurred = true;
    operation.nextSafeAction =
      "Wait for recovery target activation. Do not overlap it with another activation or exact proof.";
    operation.updatedAt = now();
    await updateOperation(operation);
    try {
      const raw = await this.dispatchWithOrphanTracking(
        operation,
        "recovery-target-activation",
        "easyeda_execute",
        { code: source, timeoutMs: 30_000, confirmWrite: true },
        40_000,
      );
      const payload = extractToolPayload(raw);
      assertSubset(
        payload,
        { ok: true, kind: "activate-recovery-target" },
        "Recovery target activation",
      );
      const reboundContext = await this.rebindAfterLifecycle(
        operation.plan.expectedContext,
        payload,
        "Recovery target activation",
      );
      operation.context = reboundContext;
      operation.planHash = buildPlanHash(operation.plan);
      if (acceptedRestartBoundary) {
        acceptedRestartBoundary["contextReboundAt"] = now();
        acceptedRestartBoundary.reboundTabId = reboundContext.document.tabId;
        operation.runtimeRestartBoundary = acceptedRestartBoundary;
      }
      operation.sequence += 1;
      const artifact = await writePhaseArtifact(
        operation.operationId,
        operation.sequence,
        `recovery-target-rebind-${Date.now()}`,
        {
          sourceSha256,
          payload,
          context: reboundContext,
          planHash: operation.planHash,
        },
      );
      operation.artifacts.push(artifact);
      operation.state = resumeState;
      if (operation.recoveryActivationPriorUnknownPhase === null) {
        delete operation.unknownPhase;
      } else {
        operation.unknownPhase = operation.recoveryActivationPriorUnknownPhase;
      }
      delete operation.recoveryActivationResumeState;
      delete operation.recoveryActivationPriorUnknownPhase;
      operation.hardStop = true;
      operation.nextSafeAction =
        "Continue the exact recovery classification on the rebound target.";
      operation.updatedAt = now();
      await updateOperation(operation);
      return reboundContext;
    } catch (error) {
      operation.state = "recovery-target-activation-unknown";
      operation.hardStop = true;
      operation.mutationMayHaveOccurred = true;
      operation.unknownPhase = "recovery-target-activation";
      operation.nextSafeAction =
        "Do not retry or start exact proof while target activation may still complete. Use recovery again only after the current nonce-bound restart gate when orphanedCallPossible is true.";
      operation.lastError = serializeError(error);
      operation.updatedAt = now();
      await updateOperation(operation);
      throw error;
    }
  }

  public async exactRead(
    request: unknown,
    expectedContext: ExpectedContext,
    options: ContextOptions = {},
  ): Promise<ProofPayload> {
    const parsed = validateExactReadRequest(request, expectedContext);
    const source = buildExactReadCode(parsed);
    const initialContext = await this.assertContext(expectedContext, options);
    const boundContext = structuredClone(expectedContext);
    boundContext.document.tabId = initialContext.document.tabId;
    const guardedSource = wrapWithContextGuard(source, boundContext);
    const executeOnce = async (): Promise<ProofPayload> => {
      await this.assertContext(boundContext);
      const raw = await this.upstream.callTool(
        "easyeda_execute",
        { code: guardedSource, timeoutMs: 60_000, confirmWrite: true },
        70_000,
      );
      const payload = proofPayload(
        validateExactReadPayload(extractToolPayload(raw), parsed),
      );
      await this.assertContext(boundContext);
      return payload;
    };
    const first = await executeOnce();
    const second = await executeOnce();
    const firstHash = sha256Json(first);
    const secondHash = sha256Json(second);
    if (firstHash !== secondHash) {
      const error = annotatedError(
        "Facade-owned exact read changed between two consecutive observations; no stable design proof was produced.",
      );
      error.mismatches = [
        { pointer: "/", expected: firstHash, actual: secondHash },
      ];
      throw error;
    }
    return {
      ...second,
      read_consistency: {
        stable: true,
        attempts: 2,
        snapshotSha256: secondHash,
        contextBinding: {
          level: "active-context-stability-required",
          preAndPostChecked: true,
          switchAwayAndBackDetectable: false,
        },
      },
    };
  }

  public async invokeSpec(
    spec: ToolCallSpec,
    expectedContext: ExpectedContext,
    expectedKind: ExpectedCallKind,
    options: InvokeOptions = {},
  ): Promise<SpecResult> {
    const { exactRequest, exactComponentMutation } = await this.validateSpec(
      spec,
      expectedKind,
      expectedContext,
    );
    if (exactRequest !== undefined) {
      const payload = await this.exactRead(
        exactRequest,
        expectedContext,
        options,
      );
      const assertions = assertAssertions(
        payload,
        spec.assertions,
        spec.toolName,
      );
      return {
        toolName: spec.toolName,
        payload,
        assertions,
      };
    }
    if (exactComponentMutation !== undefined) {
      if (
        !Array.isArray(options.targetChanges) ||
        options.targetChanges.length === 0
      ) {
        throw new Error(
          "Facade-generated component mutation has no journal-bound targetChanges.",
        );
      }
      await this.assertContext(expectedContext);
      const source = buildComponentMutationCode(
        expectedContext.document.documentType,
        options.targetChanges,
        exactComponentMutation.state,
      );
      const guarded = wrapWithContextGuard(source, expectedContext);
      const mutationArguments = {
        code: guarded,
        timeoutMs: 60_000,
        confirmWrite: true,
      };
      const raw = options.guardedDispatch
        ? await options.guardedDispatch(
            "easyeda_execute",
            mutationArguments,
            70_000,
          )
        : await this.upstream.callTool(
            "easyeda_execute",
            mutationArguments,
            70_000,
          );
      const payload = extractToolPayload(raw);
      assertSubset(
        payload,
        {
          ok: true,
          kind: "exact-component-mutation",
          state: exactComponentMutation.state,
          documentType: expectedContext.document.documentType,
        },
        "Facade-generated component mutation",
      );
      const assertions = assertAssertions(
        payload,
        spec.assertions,
        spec.toolName,
      );
      await this.assertContext(expectedContext);
      return {
        toolName: spec.toolName,
        payload,
        assertions,
        sourceSha256: sha256Text(source),
        transmittedSourceSha256: sha256Text(guarded),
      };
    }
    const activeContext = await this.assertContext(expectedContext, options);
    const args: UnknownRecord = structuredClone(spec.arguments ?? {});
    let transmittedSourceSha256: string | undefined;

    const expectedProjectUuid =
      expectedContext.project.uuid ?? expectedContext.project.projectUuid;
    const expectedDocumentUuid =
      expectedContext.document.uuid ?? expectedContext.document.documentUuid;
    for (const key of ["projectId", "projectUuid"]) {
      if (args[key] !== undefined && args[key] !== expectedProjectUuid) {
        throw new Error(
          `${spec.toolName} arguments.${key} does not match the proven project UUID.`,
        );
      }
    }
    for (const key of [
      "documentId",
      "documentUuid",
      "schematicUuid",
      "pcbUuid",
    ]) {
      if (args[key] !== undefined && args[key] !== expectedDocumentUuid) {
        throw new Error(
          `${spec.toolName} arguments.${key} does not match the proven document UUID.`,
        );
      }
    }
    if (
      args["tabId"] !== undefined &&
      args["tabId"] !== activeContext.document.tabId
    ) {
      throw new Error(
        `${spec.toolName} arguments.tabId does not match the active proven tab.`,
      );
    }
    if (
      spec.toolName !== "easyeda_execute" &&
      expectedKind === "mutate-unsaved" &&
      ![
        "projectId",
        "projectUuid",
        "documentId",
        "documentUuid",
        "schematicUuid",
        "pcbUuid",
        "tabId",
      ].some((key) => args[key] !== undefined) &&
      ACTIVE_DOCUMENT_WRITE_ALLOWLIST.get(
        expectedContext.document.documentType,
      )?.has(spec.toolName) !== true
    ) {
      throw new Error(
        `${spec.toolName} has no exact project/document target argument and cannot be used for guarded mutation. Add a constrained facade writer instead.`,
      );
    }

    if (spec.toolName === "easyeda_execute") {
      const code = args["code"];
      if (typeof code !== "string") {
        throw new TypeError("easyeda_execute arguments.code must be a string.");
      }
      const guarded = wrapWithContextGuard(code, expectedContext);
      args["code"] = guarded;
      transmittedSourceSha256 = sha256Text(guarded);
    }

    const timeoutMs =
      spec.toolName === "easyeda_execute"
        ? Math.min(70_000, Number(args["timeoutMs"] ?? 15_000) + 10_000)
        : 70_000;
    const raw =
      expectedKind === "mutate-unsaved" && options.guardedDispatch
        ? await options.guardedDispatch(spec.toolName, args, timeoutMs)
        : await this.upstream.callTool(spec.toolName, args, timeoutMs);
    const payload = extractToolPayload(raw);
    const assertions = assertAssertions(
      payload,
      spec.assertions,
      spec.toolName,
    );
    await this.assertContext(expectedContext, options);
    return {
      toolName: spec.toolName,
      payload,
      assertions,
      sourceSha256: spec.sourceSha256,
      transmittedSourceSha256,
    };
  }

  public async validateSpec(
    spec: ToolCallSpec,
    expectedKind: ExpectedCallKind,
    expectedContext: ExpectedContext,
  ): Promise<ValidatedSpec> {
    if (spec.toolName === "easyeda_execute") {
      throw new Error(
        "Guarded mutation plans reject caller-supplied JavaScript in every phase. Use the facade-generated exact component mutation.",
      );
    }
    if (spec.toolName === "easyeda_control_exact_read") {
      if (expectedKind !== "read") {
        throw new Error(
          "easyeda_control_exact_read can only be used as a read.",
        );
      }
      return {
        tool: {
          name: spec.toolName,
          annotations: { readOnlyHint: true, idempotentHint: true },
        },
        classification: {
          readOnly: true,
          write: false,
          hasConfirmWrite: false,
          idempotent: true,
        },
        exactRequest: validateExactReadRequest(spec.arguments, expectedContext),
      };
    }
    if (spec.toolName === EXACT_COMPONENT_MUTATION_TOOL) {
      if (expectedKind !== "mutate-unsaved") {
        throw new Error(
          `${EXACT_COMPONENT_MUTATION_TOOL} can only be used as an unsaved mutation.`,
        );
      }
      const callArguments = spec.arguments ?? {};
      const keys = Object.keys(callArguments).toSorted();
      const state = callArguments["state"];
      if (
        canonicalJson(keys) !== canonicalJson(["state"]) ||
        (state !== "before" && state !== "after")
      ) {
        throw new Error(
          `${EXACT_COMPONENT_MUTATION_TOOL} requires only arguments.state=before|after.`,
        );
      }
      if ((spec.assertions ?? []).length > 0) {
        throw new Error(
          `${EXACT_COMPONENT_MUTATION_TOOL} cannot substitute inline assertions for exact phase verification.`,
        );
      }
      return {
        tool: { name: spec.toolName, annotations: { destructiveHint: true } },
        classification: {
          readOnly: false,
          write: true,
          hasConfirmWrite: true,
          idempotent: true,
        },
        exactComponentMutation: { state },
      };
    }
    const tool = await this.upstream.findTool?.(spec.toolName);
    if (!tool) {
      throw new Error(`Unknown upstream EasyEDA tool: ${spec.toolName}`);
    }
    if (
      spec.toolName !== "easyeda_execute" &&
      DEDICATED_FACADE_NAME.test(spec.toolName)
    ) {
      throw new Error(
        `${spec.toolName} must use its dedicated capture or export facade gate and cannot appear in a mutation plan.`,
      );
    }
    const classification = classifyTool(tool);
    const requiredDocumentType = toolDocumentType(spec.toolName);
    if (
      requiredDocumentType !== undefined &&
      expectedContext?.document?.documentType !== requiredDocumentType
    ) {
      throw new Error(
        `${spec.toolName} belongs to document type ${requiredDocumentType}, not the plan's active document type ${String(expectedContext?.document?.documentType)}.`,
      );
    }
    if (expectedKind === "read") {
      throw new Error(
        `${spec.toolName} is not admitted as mutation proof. Guarded plans accept only facade-owned easyeda_control_exact_read calls in preflight, live verification, and reopened verification.`,
      );
    } else {
      if (!classification.write) {
        throw new Error(
          `${spec.toolName} is not classified as a write upstream tool.`,
        );
      }
      if (
        ACTIVE_DOCUMENT_WRITE_ALLOWLIST.get(
          expectedContext.document.documentType,
        )?.has(spec.toolName) !== true
      ) {
        throw new Error(
          `${spec.toolName} is not a reviewed writer for the plan's active document type. Use the facade-generated exact component mutation supported by this state machine.`,
        );
      }
      if (FORBIDDEN_APPLY_NAMES.test(spec.toolName)) {
        throw new Error(
          `${spec.toolName} is forbidden during apply/rollback. Persistence and ECO/UI workflows use dedicated gates.`,
        );
      }
    }
    return { tool, classification };
  }

  public async runSpecs(
    specs: ToolCallSpec[],
    expectedContext: ExpectedContext,
    expectedKind: ExpectedCallKind,
    options: InvokeOptions = {},
  ): Promise<SpecResult[]> {
    const results: SpecResult[] = [];
    for (const spec of specs) {
      results.push(
        await this.invokeSpec(spec, expectedContext, expectedKind, options),
      );
    }
    return results;
  }

  public async plan(
    plan: unknown,
    options: PlanOptions = {},
  ): Promise<OperationSummary> {
    this.requirePrivateComponentWriterEnabled();
    ensurePlanShape(plan);
    if (options.confirmDiscardAnyUnsavedState !== true) {
      throw new Error(
        "A mutation plan must first close/reopen the target without saving to bind its live baseline to the project database. Set confirmDiscardAnyUnsavedState=true only after authorizing discard of any unsaved target-document state.",
      );
    }
    const operations = asOperationJournals(await listOperations());
    const unfinished = operations.filter(
      (operation) => !isTerminalOperation(operation),
    );
    if (unfinished.length > 0) {
      throw new Error(
        `An incomplete EasyEDA operation already exists: ${unfinished
          .map((operation) => operation.operationId)
          .join(", ")}. Recover it before planning another mutation.`,
      );
    }

    if (
      [
        ...plan.preflightCalls,
        plan.applyCall,
        ...plan.verifyCalls,
        ...plan.rollbackCalls,
        ...plan.reopenedVerifyCalls,
      ].some((spec) => spec.toolName === "easyeda_execute")
    ) {
      throw new Error(
        "Guarded mutation plans do not accept caller-supplied JavaScript. Apply and rollback use the facade-generated exact component mutation only.",
      );
    }
    for (const spec of plan.preflightCalls) {
      await this.validateSpec(spec, "read", plan.expectedContext);
    }
    await this.validateSpec(
      plan.applyCall,
      "mutate-unsaved",
      plan.expectedContext,
    );
    for (const spec of plan.verifyCalls) {
      await this.validateSpec(spec, "read", plan.expectedContext);
    }
    for (const spec of plan.rollbackCalls) {
      await this.validateSpec(spec, "mutate-unsaved", plan.expectedContext);
    }
    for (const spec of plan.reopenedVerifyCalls) {
      await this.validateSpec(spec, "read", plan.expectedContext);
    }

    const status = await this.status();
    assertSubset(
      runtimeFingerprint(status),
      plan.expectedFingerprint,
      "EasyEDA runtime fingerprint",
    );
    const context = await this.assertContext(plan.expectedContext);
    const preCheckpoint = await createAuthorizedCheckpoint(
      {
        ...plan.checkpoint,
        label: `pre-${plan.checkpoint.label}`,
      },
      plan.expectedContext.project.path,
    );
    const checkpointVerification = await verifyAuthorizedCheckpoint(
      preCheckpoint.receiptPath,
      plan.expectedContext.project.path,
    );
    if (!checkpointVerification.ok) {
      throw new Error("Pre-mutation checkpoint verification failed.");
    }

    const operationId = newOperationId();
    const createdAt = now();
    const operation: OperationJournal = {
      schema: OPERATION_SCHEMA,
      operationId,
      journalPath: operationPath(operationId),
      planHash: buildPlanHash(plan),
      plan,
      state: "baseline-reopen-dispatching",
      mutationState: "none",
      saved: false,
      reopened: false,
      orphanedCallPossible: false,
      baselineDiscardAuthorized: true,
      hardStop: true,
      mutationMayHaveOccurred: true,
      nextSafeAction:
        "Wait for the baseline close/reopen-without-save. Never repeat an uncertain lifecycle call.",
      context,
      runtimeStatus: status,
      facadeImplementation: status.stableFingerprint.facadeImplementation,
      preCheckpoint,
      sequence: 0,
      createdAt,
      updatedAt: createdAt,
      artifacts: [],
    };
    await createOperation(operation);
    const checkpointArtifact = await writePhaseArtifact(
      operationId,
      0,
      "baseline-checkpoint",
      {
        context,
        preCheckpoint,
        checkpointVerification,
      },
    );
    operation.artifacts.push(checkpointArtifact);
    await updateOperation(operation);

    try {
      await this.assertStoredRuntime(operation, "baseline-reopen");
      const repeatedCheckpointVerification = await verifyAuthorizedCheckpoint(
        operation.preCheckpoint.receiptPath,
        operation.plan.expectedContext.project.path,
      );
      if (!repeatedCheckpointVerification.ok) {
        throw new Error(
          "The durable database changed before baseline reopen dispatch.",
        );
      }
      const source = buildReopenOnlyCode(plan.expectedContext);
      const sourceSha256 = sha256Text(source);
      const raw = await this.dispatchWithOrphanTracking(
        operation,
        "baseline-reopen",
        "easyeda_execute",
        { code: source, timeoutMs: 60_000, confirmWrite: true },
        70_000,
      );
      const payload = extractToolPayload(raw);
      assertSubset(
        payload,
        { ok: true, saved: false, closed: true, reopened: true },
        "Baseline reopen-only result",
      );
      const cleanContext = await this.rebindAfterLifecycle(
        plan.expectedContext,
        payload,
        "Baseline reopen-only result",
      );
      operation.planHash = buildPlanHash(plan);
      operation.context = cleanContext;
      operation.baselineReopened = true;
      operation.sequence += 1;
      const reopenArtifact = await writePhaseArtifact(
        operationId,
        operation.sequence,
        `baseline-reopen-${Date.now()}`,
        {
          sourceSha256,
          transmittedSourceSha256: sourceSha256,
          payload,
          repeatedCheckpointVerification,
          context: cleanContext,
        },
      );
      operation.artifacts.push(reopenArtifact);
      operation.state = "baseline-reopened";
      operation.hardStop = false;
      operation.mutationMayHaveOccurred = false;
      operation.nextSafeAction =
        "Run target-bound preflight against the clean durable baseline.";
      operation.updatedAt = now();
      await updateOperation(operation);
    } catch (error) {
      operation.state = "baseline-reopen-unknown";
      operation.mutationState = "none";
      operation.hardStop = true;
      operation.mutationMayHaveOccurred = true;
      operation.unknownPhase = "baseline-reopen";
      operation.nextSafeAction =
        "Do not retry the lifecycle call. Verify the intact pre-checkpoint and invalidate this plan through recovery.";
      operation.lastError = serializeError(error);
      operation.updatedAt = now();
      await updateOperation(operation);
      throw error;
    }

    try {
      await this.assertStoredRuntime(operation, "baseline-preflight");
      const preflight = await this.runSpecs(
        plan.preflightCalls,
        plan.expectedContext,
        "read",
      );
      const exactBaselineInvariants = baselineInvariants(preflight, plan);
      const baselineHash = snapshotHash(preflight);
      const finalCheckpointVerification = await verifyAuthorizedCheckpoint(
        operation.preCheckpoint.receiptPath,
        operation.plan.expectedContext.project.path,
      );
      if (!finalCheckpointVerification.ok) {
        throw new Error(
          "The durable database changed between the pre-checkpoint, baseline reopen, and preflight.",
        );
      }
      operation.sequence += 1;
      const preflightArtifact = await writePhaseArtifact(
        operationId,
        operation.sequence,
        `preflight-${Date.now()}`,
        {
          context: operation.context,
          baselineHash,
          exactBaselineInvariants,
          preflight,
          preCheckpoint,
          finalCheckpointVerification,
        },
      );
      operation.artifacts.push(preflightArtifact);
      operation.baselineHash = baselineHash;
      operation.baselineInvariants = exactBaselineInvariants;
      operation.state = "preflight-proven";
      operation.hardStop = false;
      operation.mutationMayHaveOccurred = false;
      operation.nextSafeAction =
        "Call easyeda_control_apply with this operationId and planHash.";
      operation.updatedAt = now();
      await updateOperation(operation);
      return operationSummary(operation);
    } catch (error) {
      operation.state = "plan-invalidated";
      operation.mutationState = "none";
      operation.hardStop = false;
      operation.mutationMayHaveOccurred = false;
      operation.nextSafeAction =
        "No planned mutation was dispatched. Resolve the read or durable-baseline failure before creating a new plan.";
      operation.lastError = serializeError(error);
      operation.updatedAt = now();
      await updateOperation(operation);
      throw error;
    }
  }

  public async apply(
    operationId: string,
    planHash: string,
  ): Promise<OperationSummary> {
    this.requirePrivateComponentWriterEnabled();
    const operation = asOperationJournal(await loadOperation(operationId));
    if (operation.state !== "preflight-proven") {
      throw new Error(
        `Operation ${operationId} is in state ${operation.state}, not preflight-proven.`,
      );
    }
    if (operation.planHash !== planHash) {
      throw new Error("planHash does not match the journal.");
    }
    assertSubset(
      runtimeFingerprint(await this.status()),
      operation.plan.expectedFingerprint,
      "EasyEDA runtime fingerprint",
    );
    let preCheckpointVerification;
    try {
      preCheckpointVerification = await verifyAuthorizedCheckpoint(
        operation.preCheckpoint.receiptPath,
        operation.plan.expectedContext.project.path,
      );
      if (!preCheckpointVerification.ok) {
        throw new Error(
          "The durable project database no longer matches the pre-checkpoint.",
        );
      }
    } catch (error) {
      operation.state = "plan-invalidated";
      operation.mutationState = "none";
      operation.hardStop = false;
      operation.mutationMayHaveOccurred = false;
      operation.nextSafeAction =
        "This plan ended without applying. Create a fresh checkpoint and preflight before replanning.";
      operation.lastError = serializeError(error);
      operation.updatedAt = now();
      await updateOperation(operation);
      throw new Error(
        "The project database changed or its checkpoint proof failed after planning; no mutation was applied.",
        { cause: error },
      );
    }
    await this.assertContext(operation.plan.expectedContext);
    const repeated = await this.runSpecs(
      operation.plan.preflightCalls,
      operation.plan.expectedContext,
      "read",
    );
    const repeatedHash = snapshotHash(repeated);
    const repeatedInvariants = baselineInvariants(repeated, operation.plan);
    if (repeatedHash !== operation.baselineHash) {
      const error = new Error(
        "Preflight state changed after planning; no mutation was applied.",
      );
      operation.state = "plan-invalidated";
      operation.mutationState = "none";
      operation.hardStop = false;
      operation.mutationMayHaveOccurred = false;
      operation.nextSafeAction =
        "Run a fresh read-only preflight and create a new plan.";
      operation.lastError = serializeError(error);
      operation.updatedAt = now();
      await updateOperation(operation);
      throw error;
    }
    if (
      canonicalJson(repeatedInvariants) !==
      canonicalJson(operation.baselineInvariants)
    ) {
      throw new Error(
        "Exact baseline invariants changed after planning; no mutation was applied.",
      );
    }

    try {
      const immediateCheckpointVerification = await verifyAuthorizedCheckpoint(
        operation.preCheckpoint.receiptPath,
        operation.plan.expectedContext.project.path,
      );
      if (!immediateCheckpointVerification.ok) {
        throw new Error(
          "The durable database changed during repeated preflight.",
        );
      }
    } catch (error) {
      operation.state = "plan-invalidated";
      operation.mutationState = "none";
      operation.hardStop = false;
      operation.mutationMayHaveOccurred = false;
      operation.nextSafeAction =
        "No mutation was dispatched. Recreate the durable checkpoint and plan from fresh state.";
      operation.lastError = serializeError(error);
      operation.updatedAt = now();
      await updateOperation(operation);
      throw new Error(
        "The durable baseline changed during preflight; no mutation was applied.",
        {
          cause: error,
        },
      );
    }

    try {
      assertSubset(
        runtimeFingerprint(await this.status()),
        operation.plan.expectedFingerprint,
        "EasyEDA runtime fingerprint",
      );
    } catch (error) {
      operation.state = "plan-invalidated";
      operation.mutationState = "none";
      operation.hardStop = false;
      operation.mutationMayHaveOccurred = false;
      operation.nextSafeAction =
        "No mutation was dispatched. Restore the intended runtime, then create a fresh plan and checkpoint.";
      operation.lastError = serializeError(error);
      operation.updatedAt = now();
      await updateOperation(operation);
      throw new Error(
        "The runtime fingerprint changed during preflight; no mutation was applied.",
        {
          cause: error,
        },
      );
    }

    operation.state = "applying";
    operation.hardStop = true;
    operation.mutationMayHaveOccurred = true;
    operation.nextSafeAction =
      "Wait for the apply call. Do not retry after a timeout.";
    operation.updatedAt = now();
    await updateOperation(operation);
    try {
      const result = await this.invokeSpec(
        operation.plan.applyCall,
        operation.plan.expectedContext,
        "mutate-unsaved",
        {
          targetChanges: operation.plan.targetChanges,
          guardedDispatch: async (name, args, timeoutMs) => {
            await this.requireDurableBaselineBeforeDispatch(
              operation,
              "apply",
              {
                state: "plan-invalidated",
                mutationState: "none",
                hardStop: false,
                mutationMayHaveOccurred: false,
                nextSafeAction:
                  "No apply was dispatched. Recreate the durable checkpoint and exact plan from fresh state.",
              },
            );
            return this.dispatchWithOrphanTracking(
              operation,
              "apply",
              name,
              args,
              timeoutMs,
            );
          },
        },
      );
      let durableVerification;
      let durableVerificationError;
      try {
        durableVerification = await verifyAuthorizedCheckpoint(
          operation.preCheckpoint.receiptPath,
          operation.plan.expectedContext.project.path,
        );
      } catch (error) {
        durableVerificationError = serializeError(error);
      }
      operation.sequence += 1;
      const artifact = await writePhaseArtifact(
        operationId,
        operation.sequence,
        "apply",
        {
          result,
          durableVerification,
          durableVerificationError,
        },
      );
      operation.artifacts.push(artifact);
      if (durableVerification?.ok !== true) {
        const error = annotatedError(
          "The apply call returned, but the durable database no longer matches the pre-checkpoint; the edit cannot be classified as unsaved.",
        );
        error.journalStateRecorded = true;
        operation.state = "durable-baseline-drift";
        operation.mutationState = "unknown";
        operation.hardStop = true;
        operation.mutationMayHaveOccurred = true;
        operation.unknownPhase = "apply-durable-baseline";
        operation.nextSafeAction =
          "Do not retry or save. Inspect the durable project, live document, apply artifact, and pre-checkpoint before recovery.";
        operation.lastError = durableVerificationError ?? serializeError(error);
        operation.updatedAt = now();
        await updateOperation(operation);
        throw error;
      }
      operation.state = "applied-unsaved";
      operation.mutationState = "applied-unsaved";
      operation.hardStop = false;
      operation.mutationMayHaveOccurred = true;
      operation.nextSafeAction =
        "Call easyeda_control_verify. Do not save manually.";
      operation.updatedAt = now();
      await updateOperation(operation);
      return operationSummary(operation);
    } catch (error) {
      if (errorMetadata(error)?.journalStateRecorded === true) {
        throw error;
      }
      operation.state = "unknown";
      operation.mutationState = "unknown";
      operation.hardStop = true;
      operation.mutationMayHaveOccurred = true;
      operation.unknownPhase = "apply";
      operation.nextSafeAction =
        "Do not retry or save. Use easyeda_control_recover_incomplete to reconcile the stored plan.";
      operation.lastError = serializeError(error);
      operation.updatedAt = now();
      await updateOperation(operation);
      throw error;
    }
  }

  public async verify(operationId: string): Promise<OperationSummary> {
    this.requirePrivateComponentWriterEnabled();
    const operation = asOperationJournal(await loadOperation(operationId));
    if (operation.state !== "applied-unsaved") {
      throw new Error(
        `Operation ${operationId} is in state ${operation.state}, not applied-unsaved.`,
      );
    }
    await this.assertStoredRuntime(operation, "verify");
    try {
      await this.assertContext(operation.plan.expectedContext);
      const results = await this.runSpecs(
        operation.plan.verifyCalls,
        operation.plan.expectedContext,
        "read",
      );
      const combined = results.map((result) => result.payload);
      const exactInvariantProof = verifyPhaseInvariants(
        results,
        operation,
        "Live verification",
      );
      const aggregateAssertions = assertAssertions(
        combined,
        operation.plan.verifyAssertions,
        "Live verification",
      );
      let durableVerification;
      let durableVerificationError;
      try {
        durableVerification = await verifyAuthorizedCheckpoint(
          operation.preCheckpoint.receiptPath,
          operation.plan.expectedContext.project.path,
        );
      } catch (error) {
        durableVerificationError = serializeError(error);
      }
      operation.sequence += 1;
      const artifact = await writePhaseArtifact(
        operationId,
        operation.sequence,
        "verify-live",
        {
          results,
          exactInvariantProof,
          aggregateAssertions,
          durableVerification,
          durableVerificationError,
        },
      );
      operation.artifacts.push(artifact);
      if (durableVerification?.ok !== true) {
        const error = annotatedError(
          "Live assertions passed, but the durable database no longer matches the pre-checkpoint; live state cannot be classified as verified-unsaved.",
        );
        error.journalStateRecorded = true;
        operation.state = "durable-baseline-drift";
        operation.mutationState = "unknown";
        operation.hardStop = true;
        operation.mutationMayHaveOccurred = true;
        operation.unknownPhase = "verify-durable-baseline";
        operation.nextSafeAction =
          "Do not save. Inspect the durable project, live document, verification artifact, and pre-checkpoint before recovery.";
        operation.lastError = durableVerificationError ?? serializeError(error);
        operation.updatedAt = now();
        await updateOperation(operation);
        throw error;
      }
      operation.state = "live-verified";
      operation.hardStop = false;
      operation.nextSafeAction =
        "Call easyeda_control_save_reopen to persist, or easyeda_control_rollback to cancel after a fresh desired-state and durable-baseline proof.";
      operation.updatedAt = now();
      await updateOperation(operation);
      return operationSummary(operation);
    } catch (error) {
      if (errorMetadata(error)?.journalStateRecorded === true) {
        throw error;
      }
      operation.state = "verification-failed";
      operation.hardStop = true;
      operation.nextSafeAction =
        "Do not save. Call easyeda_control_rollback, or inspect before choosing recovery.";
      operation.lastError = serializeError(error);
      operation.updatedAt = now();
      await updateOperation(operation);
      throw error;
    }
  }

  public async rollback(
    operationId: string,
    planHash: string,
  ): Promise<OperationSummary> {
    this.requirePrivateComponentWriterEnabled();
    const operation = asOperationJournal(await loadOperation(operationId));
    if (
      !["applied-unsaved", "verification-failed", "live-verified"].includes(
        operation.state,
      )
    ) {
      throw new Error(
        `Operation ${operationId} cannot roll back safely from state ${operation.state}. Reconcile unknown state first.`,
      );
    }
    if (operation.planHash !== planHash) {
      throw new Error("planHash does not match the journal.");
    }
    await this.assertStoredRuntime(operation, "rollback");
    await this.assertContext(operation.plan.expectedContext);
    operation.state = "rolling-back";
    operation.hardStop = true;
    operation.mutationMayHaveOccurred = true;
    operation.nextSafeAction = "Wait for exact rollback verification.";
    operation.updatedAt = now();
    await updateOperation(operation);
    try {
      const rollback = await this.runSpecs(
        operation.plan.rollbackCalls,
        operation.plan.expectedContext,
        "mutate-unsaved",
        {
          targetChanges: operation.plan.targetChanges,
          guardedDispatch: async (name, args, timeoutMs) => {
            let desiredResults;
            let exactInvariantProof;
            let aggregateAssertions;
            try {
              desiredResults = await this.runSpecs(
                operation.plan.verifyCalls,
                operation.plan.expectedContext,
                "read",
              );
              exactInvariantProof = verifyPhaseInvariants(
                desiredResults,
                operation,
                "Rollback pre-dispatch desired-state proof",
              );
              aggregateAssertions = assertAssertions(
                desiredResults.map((result) => result.payload),
                operation.plan.verifyAssertions,
                "Rollback pre-dispatch desired-state proof",
              );
            } catch (error) {
              const rollbackError = annotatedError(
                "Rollback was not dispatched because fresh exact readback could not prove the complete intended unsaved state.",
                { cause: error },
              );
              rollbackError.journalStateRecorded = true;
              operation.state = "verification-failed";
              operation.mutationState = "unknown";
              operation.hardStop = true;
              operation.mutationMayHaveOccurred = true;
              operation.nextSafeAction =
                "Do not save or apply an inverse. Reconcile the live state before another rollback attempt.";
              operation.lastError = serializeError(rollbackError);
              operation.updatedAt = now();
              await updateOperation(operation);
              throw rollbackError;
            }
            const durableVerification =
              await this.requireDurableBaselineBeforeDispatch(
                operation,
                "rollback",
                {
                  state: "durable-baseline-drift",
                  mutationState: "unknown",
                  hardStop: true,
                  mutationMayHaveOccurred: true,
                  nextSafeAction:
                    "Do not save or dispatch the inverse. Inspect the changed durable project, live desired state, and pre-checkpoint before recovery.",
                },
              );
            operation.sequence += 1;
            const proofArtifact = await writePhaseArtifact(
              operationId,
              operation.sequence,
              `rollback-pre-dispatch-${Date.now()}`,
              {
                desiredResults,
                exactInvariantProof,
                aggregateAssertions,
                durableVerification,
              },
            );
            operation.artifacts.push(proofArtifact);
            operation.updatedAt = now();
            await updateOperation(operation);
            await this.requireDurableBaselineBeforeDispatch(
              operation,
              "rollback",
              {
                state: "durable-baseline-drift",
                mutationState: "unknown",
                hardStop: true,
                mutationMayHaveOccurred: true,
                nextSafeAction:
                  "Do not save or dispatch the inverse. Inspect the changed durable project, live desired state, and pre-checkpoint before recovery.",
                },
              );
            return this.dispatchWithOrphanTracking(
              operation,
              "rollback",
              name,
              args,
              timeoutMs,
            );
          },
        },
      );
      const baseline = await this.runSpecs(
        operation.plan.preflightCalls,
        operation.plan.expectedContext,
        "read",
      );
      const restoredInvariants = baselineInvariants(baseline, operation.plan);
      const restoredHash = snapshotHash(baseline);
      if (restoredHash !== operation.baselineHash) {
        throw new Error(
          "Rollback calls completed, but the exact baseline hash was not restored.",
        );
      }
      if (
        canonicalJson(restoredInvariants) !==
        canonicalJson(operation.baselineInvariants)
      ) {
        throw new Error(
          "Rollback calls completed, but exact baseline invariants were not restored.",
        );
      }
      const durableVerification = await verifyAuthorizedCheckpoint(
        operation.preCheckpoint.receiptPath,
        operation.plan.expectedContext.project.path,
      );
      if (!durableVerification.ok) {
        throw new Error(
          "Live rollback restored the baseline, but the durable database no longer matches the pre-checkpoint.",
        );
      }
      operation.sequence += 1;
      const artifact = await writePhaseArtifact(
        operationId,
        operation.sequence,
        "rollback",
        {
          rollback,
          restoredHash,
          restoredInvariants,
          durableVerification,
        },
      );
      operation.artifacts.push(artifact);
      operation.state = "rolled-back";
      operation.mutationState = "rolled-back";
      operation.hardStop = false;
      operation.mutationMayHaveOccurred = false;
      operation.nextSafeAction =
        "Operation ended without saving. Review the journal before replanning.";
      operation.updatedAt = now();
      await updateOperation(operation);
      return operationSummary(operation);
    } catch (error) {
      if (errorMetadata(error)?.journalStateRecorded === true) {
        throw error;
      }
      operation.state = "rollback-failed";
      operation.mutationState = "unknown";
      operation.hardStop = true;
      operation.mutationMayHaveOccurred = true;
      operation.nextSafeAction =
        "Do not save or retry. Reconcile the live document manually.";
      operation.lastError = serializeError(error);
      operation.updatedAt = now();
      await updateOperation(operation);
      throw error;
    }
  }

  public async saveReopen(
    operationId: string,
    planHash: string,
    options: SaveReopenOptions = {},
  ): Promise<OperationSummary> {
    this.requirePrivateComponentWriterEnabled();
    const operation = asOperationJournal(await loadOperation(operationId));
    if (operation.planHash !== planHash) {
      throw new Error("planHash does not match the journal.");
    }
    if (
      ![
        "live-verified",
        "reopened-verified",
        "final-reopened",
        "final-checkpoint-failed",
      ].includes(operation.state)
    ) {
      throw new Error(
        `Operation ${operationId} cannot save/reopen from state ${operation.state}. Live verification is required.`,
      );
    }
    const delayedFinalRetry = operation.state !== "live-verified";
    await this.assertStoredRuntime(operation, "save-reopen");

    if (operation.state === "live-verified") {
      let preCheckpointVerification;
      let exactSaveGuards: ExactSaveGuard[] = [];
      try {
        preCheckpointVerification = await verifyAuthorizedCheckpoint(
          operation.preCheckpoint.receiptPath,
          operation.plan.expectedContext.project.path,
        );
        if (!preCheckpointVerification.ok) {
          throw new Error(
            "The durable project database no longer matches the pre-checkpoint.",
          );
        }
      } catch (error) {
        operation.state = "durable-baseline-drift";
        operation.mutationState = "unknown";
        operation.hardStop = true;
        operation.mutationMayHaveOccurred = true;
        operation.nextSafeAction =
          "Do not save. The live unsaved edit and durable database no longer share the proven baseline; inspect both before recovery.";
        operation.lastError = serializeError(error);
        operation.updatedAt = now();
        await updateOperation(operation);
        throw new Error(
          "The durable project database changed or its checkpoint proof failed before save; persistence was refused.",
          { cause: error },
        );
      }
      let preSaveDurableVerification;
      let preSaveDurableError;
      try {
        await this.assertContext(operation.plan.expectedContext);
        const preSaveResults = await this.runSpecs(
          operation.plan.verifyCalls,
          operation.plan.expectedContext,
          "read",
        );
        const exactInvariantProof = verifyPhaseInvariants(
          preSaveResults,
          operation,
          "Immediate pre-save verification",
        );
        const preSaveAssertions = assertAssertions(
          preSaveResults.map((result) => result.payload),
          operation.plan.verifyAssertions,
          "Immediate pre-save live verification",
        );
        exactSaveGuards = operation.plan.verifyCalls.map((spec, index) => {
          if (spec.toolName !== "easyeda_control_exact_read") {
            throw new Error(
              "Immediate pre-save verification contained a non-exact reader.",
            );
          }
          const result = preSaveResults[index];
          if (result === undefined) {
            throw new Error(
              "Immediate pre-save verification omitted an exact-reader result.",
            );
          }
          return {
            request: validateExactReadRequest(
              spec.arguments,
              operation.plan.expectedContext,
            ),
            expectedSnapshotSha256: sha256Json(
              normalizeProofEnvelope(result.payload),
            ),
          };
        });
        try {
          preSaveDurableVerification = await verifyAuthorizedCheckpoint(
            operation.preCheckpoint.receiptPath,
            operation.plan.expectedContext.project.path,
          );
        } catch (error) {
          preSaveDurableError = serializeError(error);
        }
        if (preSaveDurableVerification?.ok !== true) {
          const error = annotatedError(
            "The durable project changed while the immediate pre-save verifier was running.",
          );
          error.durableBaselineFailure = true;
          throw error;
        }
        operation.sequence += 1;
        const preSaveArtifact = await writePhaseArtifact(
          operationId,
          operation.sequence,
          `verify-pre-save-${Date.now()}`,
          {
            results: preSaveResults,
            exactInvariantProof,
            aggregateAssertions: preSaveAssertions,
            durableVerification: preSaveDurableVerification,
          },
        );
        operation.artifacts.push(preSaveArtifact);
        operation.state = "saving";
        operation.hardStop = true;
        operation.mutationMayHaveOccurred = true;
        operation.nextSafeAction =
          "Wait. Never retry an uncertain save automatically.";
        operation.updatedAt = now();
        await updateOperation(operation);
      } catch (error) {
        operation.state =
          errorMetadata(error)?.durableBaselineFailure === true
            ? "durable-baseline-drift"
            : "pre-save-verification-failed";
        operation.mutationState =
          errorMetadata(error)?.durableBaselineFailure === true
            ? "unknown"
            : "applied-unsaved";
        operation.hardStop = true;
        operation.mutationMayHaveOccurred = true;
        operation.nextSafeAction =
          errorMetadata(error)?.durableBaselineFailure === true
            ? "Do not save. The live edit and durable project no longer share the proven baseline; inspect before recovery."
            : "Do not save. Live state changed after verification; inspect it and use recovery to prove either the baseline or intended unsaved state.";
        operation.lastError = preSaveDurableError ?? serializeError(error);
        operation.updatedAt = now();
        await updateOperation(operation);
        throw error;
      }
      try {
        const source = buildSaveReopenCode(
          operation.plan.expectedContext,
          exactSaveGuards,
        );
        const guarded = wrapWithContextGuard(
          source,
          operation.plan.expectedContext,
        );
        await this.requireDurableBaselineBeforeDispatch(
          operation,
          "save-reopen",
          {
            state: "durable-baseline-drift",
            mutationState: "unknown",
            hardStop: true,
            mutationMayHaveOccurred: true,
            nextSafeAction:
              "Do not save. The live edit and durable project no longer share the proven baseline; inspect both before recovery.",
          },
        );
        const raw = await this.dispatchWithOrphanTracking(
          operation,
          "save-reopen",
          "easyeda_execute",
          { code: guarded, timeoutMs: 60_000, confirmWrite: true },
          70_000,
        );
        const payload = extractToolPayload(raw);
        assertSubset(
          payload,
          { ok: true, saved: true, reopened: true },
          "Save/reopen result",
        );
        const reopenedContext = await this.rebindAfterLifecycle(
          operation.plan.expectedContext,
          payload,
          "Save/reopen result",
        );
        operation.context = reopenedContext;
        operation.planHash = buildPlanHash(operation.plan);
        operation.sequence += 1;
        const artifact = await writePhaseArtifact(
          operationId,
          operation.sequence,
          "save-reopen",
          {
            sourceSha256: sha256Text(source),
            transmittedSourceSha256: sha256Text(guarded),
            exactSaveGuards: exactSaveGuards.map((guard) => ({
              expectedSnapshotSha256: guard.expectedSnapshotSha256,
              request: guard.request,
            })),
            payload,
            context: reopenedContext,
          },
        );
        operation.artifacts.push(artifact);
        operation.state = "document-saved";
        operation.mutationState = "saved";
        operation.saved = true;
        operation.reopened = true;
        operation.updatedAt = now();
        await updateOperation(operation);
      } catch (error) {
        if (errorMetadata(error)?.journalStateRecorded === true) {
          throw error;
        }
        operation.state = "unknown";
        operation.mutationState = "unknown";
        operation.saved = false;
        operation.reopened = false;
        operation.hardStop = true;
        operation.mutationMayHaveOccurred = true;
        operation.unknownPhase = "save-reopen";
        operation.nextSafeAction =
          "Do not retry. Reconcile whether save/close/reopen completed before any further action.";
        operation.lastError = serializeError(error);
        operation.updatedAt = now();
        await updateOperation(operation);
        throw error;
      }

      let persistenceVerificationError;
      try {
        await this.assertContext(operation.plan.expectedContext);
        const results = await this.runSpecs(
          operation.plan.reopenedVerifyCalls,
          operation.plan.expectedContext,
          "read",
        );
        const exactInvariantProof = verifyPhaseInvariants(
          results,
          operation,
          "Reopened verification",
        );
        const aggregateAssertions = assertAssertions(
          results.map((result) => result.payload),
          operation.plan.reopenedAssertions,
          "Reopened verification",
        );
        let persistenceVerification;
        try {
          persistenceVerification = await verifyAuthorizedCheckpoint(
            operation.preCheckpoint.receiptPath,
            operation.plan.expectedContext.project.path,
          );
        } catch (error) {
          persistenceVerificationError = serializeError(error);
        }
        operation.sequence += 1;
        const artifact = await writePhaseArtifact(
          operationId,
          operation.sequence,
          "verify-reopened",
          {
            results,
            exactInvariantProof,
            aggregateAssertions,
            persistenceVerification,
            persistenceVerificationError,
          },
        );
        operation.artifacts.push(artifact);
        if (
          persistenceVerification?.checkpointMatchesReceipt !== true ||
          persistenceVerification.sourceEqualsCheckpoint
        ) {
          const error = annotatedError(
            "Reopened assertions passed, but logical persistence relative to the intact pre-checkpoint was not proved.",
          );
          error.persistenceProofFailure = true;
          throw error;
        }
        operation.state = "reopened-verified";
        operation.updatedAt = now();
        await updateOperation(operation);
      } catch (error) {
        operation.state =
          errorMetadata(error)?.persistenceProofFailure === true
            ? "persistence-verification-failed"
            : "reopen-verification-failed";
        operation.hardStop = true;
        operation.nextSafeAction =
          errorMetadata(error)?.persistenceProofFailure === true
            ? "The document was saved and reopened, but a logical database change from the intact pre-checkpoint was not proved. Stop and inspect the persisted project."
            : "The document was saved but reopened state failed verification. Stop and inspect the persisted project.";
        operation.lastError =
          persistenceVerificationError ?? serializeError(error);
        operation.updatedAt = now();
        await updateOperation(operation);
        throw error;
      }
    }

    if (delayedFinalRetry) {
      if (options.confirmDiscardAnyUnsavedState !== true) {
        throw new Error(
          "Delayed final verification must close/reopen without saving so it cannot certify later unsaved edits. Set confirmDiscardAnyUnsavedState=true only after authorizing discard of any unsaved target-document state.",
        );
      }
      const source = buildReopenOnlyCode(operation.plan.expectedContext);
      const sourceSha256 = sha256Text(source);
      operation.state = "final-reopen-dispatching";
      operation.mutationState = "saved";
      operation.hardStop = true;
      operation.mutationMayHaveOccurred = true;
      operation.nextSafeAction =
        "Wait for the delayed reopen-without-save. Never repeat it after an uncertain result; use recovery.";
      operation.updatedAt = now();
      await updateOperation(operation);
      try {
        const raw = await this.dispatchWithOrphanTracking(
          operation,
          "final-reopen",
          "easyeda_execute",
          { code: source, timeoutMs: 60_000, confirmWrite: true },
          70_000,
        );
        const payload = extractToolPayload(raw);
        assertSubset(
          payload,
          { ok: true, saved: false, closed: true, reopened: true },
          "Delayed final reopen-only result",
        );
        const reopenedContext = await this.rebindAfterLifecycle(
          operation.plan.expectedContext,
          payload,
          "Delayed final reopen-only result",
        );
        operation.context = reopenedContext;
        operation.planHash = buildPlanHash(operation.plan);
        operation.sequence += 1;
        const artifact = await writePhaseArtifact(
          operationId,
          operation.sequence,
          `final-reopen-${Date.now()}`,
          {
            sourceSha256,
            transmittedSourceSha256: sourceSha256,
            payload,
            context: reopenedContext,
          },
        );
        operation.artifacts.push(artifact);
        operation.state = "final-reopened";
        operation.mutationState = "saved";
        operation.saved = true;
        operation.reopened = true;
        operation.hardStop = false;
        operation.mutationMayHaveOccurred = false;
        operation.nextSafeAction =
          "Create a fresh candidate checkpoint and rerun checkpoint-bound reopened verification.";
        operation.updatedAt = now();
        await updateOperation(operation);
      } catch (error) {
        operation.state = "final-reopen-unknown";
        operation.mutationState = "unknown";
        operation.saved = false;
        operation.reopened = false;
        operation.hardStop = true;
        operation.mutationMayHaveOccurred = true;
        operation.unknownPhase = "final-reopen";
        operation.nextSafeAction =
          "Do not repeat the reopen. Inspect current state and use explicitly confirmed saved-state recovery.";
        operation.lastError = serializeError(error);
        operation.updatedAt = now();
        await updateOperation(operation);
        throw error;
      }
    }

    try {
      const finalCheckpoint = await createAuthorizedCheckpoint(
        {
          ...operation.plan.checkpoint,
          label: `post-${operation.plan.checkpoint.label}`,
        },
        operation.plan.expectedContext.project.path,
      );
      operation.candidateFinalCheckpoint = finalCheckpoint;
      operation.updatedAt = now();
      await updateOperation(operation);
      await this.assertContext(operation.plan.expectedContext);
      const finalResults = await this.runSpecs(
        operation.plan.reopenedVerifyCalls,
        operation.plan.expectedContext,
        "read",
      );
      const exactInvariantProof = verifyPhaseInvariants(
        finalResults,
        operation,
        "Final checkpoint-bound reopened verification",
      );
      const finalAssertions = assertAssertions(
        finalResults.map((result) => result.payload),
        operation.plan.reopenedAssertions,
        "Final checkpoint-bound reopened verification",
      );
      const persistenceVerification = await verifyAuthorizedCheckpoint(
        operation.preCheckpoint.receiptPath,
        operation.plan.expectedContext.project.path,
      );
      if (
        !persistenceVerification.checkpointMatchesReceipt ||
        persistenceVerification.sourceEqualsCheckpoint
      ) {
        throw new Error(
          "Final verification did not prove a logical database change from the intact pre-checkpoint.",
        );
      }
      const checkpointVerification = await verifyAuthorizedCheckpoint(
        finalCheckpoint.receiptPath,
        operation.plan.expectedContext.project.path,
      );
      if (!checkpointVerification.ok) {
        throw new Error(
          "The live database changed after the candidate final checkpoint or that checkpoint failed verification.",
        );
      }
      const semanticPersistenceValidator = this.semanticPersistenceValidator;
      if (semanticPersistenceValidator === undefined) {
        throw new Error(
          "No semantic persistence-delta validator is installed; completion is forbidden.",
        );
      }
      const reopenedProofSnapshotSha256 = snapshotHash(finalResults);
      const semanticValidationInput = {
        operationId,
        plan: operation.plan,
        preCheckpoint: operation.preCheckpoint,
        finalCheckpoint,
        reopenedProofSnapshotSha256,
      };
      const semanticValidationBindingSha256 =
        semanticPersistenceBindingSha256(semanticValidationInput);
      const semanticPersistenceProof = semanticPersistencePayload(
        await semanticPersistenceValidator({
          ...semanticValidationInput,
          bindingSha256: semanticValidationBindingSha256,
        }),
        semanticValidationBindingSha256,
      );
      await this.assertContext(operation.plan.expectedContext);
      const certificationResults = await this.runSpecs(
        operation.plan.reopenedVerifyCalls,
        operation.plan.expectedContext,
        "read",
      );
      const certificationInvariantProof = verifyPhaseInvariants(
        certificationResults,
        operation,
        "Post-policy completion certification",
      );
      const certificationAssertions = assertAssertions(
        certificationResults.map((result) => result.payload),
        operation.plan.reopenedAssertions,
        "Post-policy completion certification",
      );
      const certifiedSnapshotSha256 = snapshotHash(certificationResults);
      if (certifiedSnapshotSha256 !== snapshotHash(finalResults)) {
        throw new Error(
          "The reopened EasyEDA state changed while semantic persistence was being validated; completion is forbidden.",
        );
      }
      const certificationPersistenceVerification =
        await verifyAuthorizedCheckpoint(
          operation.preCheckpoint.receiptPath,
          operation.plan.expectedContext.project.path,
        );
      if (
        !certificationPersistenceVerification.checkpointMatchesReceipt ||
        certificationPersistenceVerification.sourceEqualsCheckpoint
      ) {
        throw new Error(
          "The pre-checkpoint or durable logical delta changed during semantic persistence validation.",
        );
      }
      const certificationCheckpointVerification =
        await verifyAuthorizedCheckpoint(
          finalCheckpoint.receiptPath,
          operation.plan.expectedContext.project.path,
        );
      if (!certificationCheckpointVerification.ok) {
        throw new Error(
          "The live database changed during semantic persistence validation; completion is forbidden.",
        );
      }
      operation.sequence += 1;
      const artifact = await writePhaseArtifact(
        operationId,
        operation.sequence,
        `final-checkpoint-${Date.now()}`,
        {
          finalCheckpoint,
          finalResults,
          exactInvariantProof,
          finalAssertions,
          checkpointVerification,
          persistenceVerification,
          semanticPersistenceProof,
          certificationResults,
          certificationInvariantProof,
          certificationAssertions,
          certifiedSnapshotSha256,
          certificationPersistenceVerification,
          certificationCheckpointVerification,
        },
      );
      operation.artifacts.push(artifact);
      operation.finalCheckpoint = finalCheckpoint;
      operation.candidateFinalCheckpoint = undefined;
      operation.state = "completed";
      operation.mutationState = "saved";
      operation.saved = true;
      operation.reopened = true;
      operation.hardStop = false;
      operation.mutationMayHaveOccurred = false;
      operation.nextSafeAction =
        "Operation completed. Preserve its journal and checkpoint receipts.";
      operation.updatedAt = now();
      await updateOperation(operation);
      return operationSummary(operation);
    } catch (error) {
      operation.state = "final-checkpoint-failed";
      operation.hardStop = true;
      operation.nextSafeAction =
        "The document was not resaved, but final checkpoint-bound verification failed. Inspect the candidate receipt, then call save_reopen again to create a fresh candidate and rerun reopened proof.";
      operation.lastError = serializeError(error);
      operation.updatedAt = now();
      await updateOperation(operation);
      throw error;
    }
  }

  public async recover(
    operationId?: undefined,
    resolution?: RecoveryResolution,
    options?: RecoverOptions,
  ): Promise<OperationSummary[]>;
  public async recover(
    operationId: string,
    resolution?: RecoveryResolution,
    options?: RecoverOptions,
  ): Promise<OperationSummary>;
  public async recover(
    operationId?: string,
    resolution?: RecoveryResolution,
    options: RecoverOptions = {},
  ): Promise<OperationSummary | OperationSummary[]> {
    if (operationId === undefined || operationId.length === 0) {
      return asOperationJournals(await listOperations())
        .filter((operation) => !isTerminalOperation(operation))
        .map((operation) => operationSummary(operation));
    }
    await this.assertRecoveryOperationIsolated(operationId);
    const operation = asOperationJournal(await loadOperation(operationId));
    if (isTerminalOperation(operation)) {
      return operationSummary(operation);
    }
    const recoveryStartState =
      operation.recoveryActivationResumeState ?? operation.state;
    const recoveryStartUnknownPhase =
      operation.recoveryActivationPriorUnknownPhase === null
        ? undefined
        : (operation.recoveryActivationPriorUnknownPhase ??
          operation.unknownPhase);
    const baselinePreparationStates = new Set([
      "baseline-reopen-dispatching",
      "baseline-reopen-unknown",
      "baseline-reopened",
    ]);

    const allowedStates = {
      "reconciled-no-mutation": new Set([
        ...baselinePreparationStates,
        "preflight-proven",
        "applying",
        "applied-unsaved",
        "live-verified",
        "unknown",
        "verification-failed",
        "pre-save-verification-failed",
        "rolling-back",
        "rollback-failed",
        "saving",
        "recovery-target-activation-dispatching",
        "recovery-target-activation-unknown",
        "durable-baseline-drift",
      ]),
      "reconciled-applied-unsaved": new Set([
        "applying",
        "applied-unsaved",
        "verification-failed",
        "pre-save-verification-failed",
        "rolling-back",
        "rollback-failed",
        "saving",
        "unknown",
        "recovery-target-activation-dispatching",
        "recovery-target-activation-unknown",
        "durable-baseline-drift",
      ]),
      "reconciled-saved-reopened": new Set([
        "saving",
        "document-saved",
        "reopen-verification-failed",
        "persistence-verification-failed",
        "reopened-verified",
        "final-reopen-dispatching",
        "final-reopen-unknown",
        "final-reopened",
        "final-checkpoint-failed",
        "recovery-reopen-dispatching",
        "recovery-reopen-unknown",
        "recovery-reopened",
        "recovery-verification-failed",
        "unknown",
      ]),
    };
    if (!resolution) {
      throw new Error("A supported recovery resolution is required.");
    }
    const allowed = allowedStates[resolution];
    if (!allowed.has(recoveryStartState)) {
      throw new Error(
        `Resolution ${resolution} is not legal from operation state ${recoveryStartState}.`,
      );
    }
    if (
      resolution === "reconciled-saved-reopened" &&
      recoveryStartState === "unknown" &&
      recoveryStartUnknownPhase !== "save-reopen"
    ) {
      throw new Error(
        "An unknown apply cannot be reconciled as saved/reopened. First prove whether the unsaved apply occurred.",
      );
    }

    if (operationHasOrphanedCallRisk(operation)) {
      const requiredConfirmation =
        await this.ensureRuntimeRestartChallenge(operation);
      if (options.runtimeRestartConfirmation !== requiredConfirmation) {
        const error = annotatedError(
          "Recovery is blocked because a timed-out or disconnected EasyEDA call may still be running. A person must deliberately terminate EasyEDA Pro, restart it, reconnect the bridge, and provide the current nonce-bound runtimeRestartChallenge from the incomplete-operation summary as runtimeRestartConfirmation. If EasyEDA prompts about unsaved changes, never choose Save; discard or force-quit only with explicit authority and a still-valid clean-baseline/no-concurrent-edit assumption, otherwise cancel and preserve the session for manual review.",
        );
        error.requiredRuntimeRestartConfirmation = requiredConfirmation;
        error.orphanedCallPhase =
          operation.orphanedCallPhase ?? operation.unknownPhase;
        throw error;
      }
      const priorRuntimeIdentity = operation.runtimeIdentityBeforeOrphan;
      const priorBridgeSession = operation.bridgeSessionBeforeOrphan;
      const priorBridgeDispatch = operation.bridgeDispatchBeforeOrphan;
      const priorExecutionAuthority = operation.executionAuthorityBeforeOrphan;
      const challengeAttempt = operation.runtimeRestartChallengeAttempt;
      const orphanedCallPhase =
        operation.orphanedCallPhase ?? operation.unknownPhase;
      if (
        priorRuntimeIdentity === undefined ||
        priorBridgeSession === undefined ||
        priorBridgeDispatch === undefined ||
        priorExecutionAuthority === undefined ||
        challengeAttempt === undefined ||
        orphanedCallPhase === undefined
      ) {
        throw new Error(
          "Recovery cannot prove termination of the former EasyEDA execution authority because this operation lacks its complete pre-dispatch runtime, bridge-session, process-tree, phase, or challenge binding.",
        );
      }
      if (
        priorBridgeDispatch.gatewayInstanceId !==
          priorBridgeSession.gatewayInstanceId ||
        priorBridgeDispatch.sessionId !== priorBridgeSession.sessionId ||
        priorBridgeDispatch.sessionSequence !== priorBridgeSession.sequence
      ) {
        throw new Error(
          "Recovery cannot prove that the orphaned call was dispatched on its recorded authenticated bridge session.",
        );
      }
      const currentBridgeSessionBeforeProbe =
        this.authenticatedBridgeSession();
      if (
        currentBridgeSessionBeforeProbe.gatewayInstanceId !==
        priorBridgeSession.gatewayInstanceId
      ) {
        throw new Error(
          "The facade bridge gateway restarted and no longer owns authoritative closure history for the pre-dispatch session. Automatic recovery is forbidden.",
        );
      }
      if (
        currentBridgeSessionBeforeProbe.sessionId ===
        priorBridgeSession.sessionId
      ) {
        throw new Error(
          "The pre-dispatch authenticated EasyEDA bridge session is still active. Terminate EasyEDA Pro and reconnect before recovery.",
        );
      }
      const currentRuntimeIdentity = await this.runtimeIdentity();
      const currentBridgeSession = this.authenticatedBridgeSession();
      if (
        canonicalJson(currentBridgeSession) !==
        canonicalJson(currentBridgeSessionBeforeProbe)
      ) {
        throw new Error(
          "The authenticated bridge session changed while recovery identity was being proved.",
        );
      }
      const closedSessionLookup =
        this.upstream.closedAuthenticatedBridgeSession;
      if (closedSessionLookup === undefined) {
        throw new Error(
          "The authenticated bridge does not expose exact closed-session history.",
        );
      }
      const closedBridgeSession = closedBridgeSessionPayload(
        closedSessionLookup.call(
          this.upstream,
          priorBridgeSession.sessionId,
        ),
        priorBridgeSession,
      );
      if (
        currentBridgeSession.authenticatedAtEpochMs <
        closedBridgeSession.closedAtEpochMs
      ) {
        throw new Error(
          "The replacement bridge session was authenticated before the prior session closed.",
        );
      }
      if (
        currentRuntimeIdentity.generation === priorRuntimeIdentity.generation ||
        currentRuntimeIdentity.timeOrigin === priorRuntimeIdentity.timeOrigin
      ) {
        throw new Error(
          "The EasyEDA renderer generation did not change. Terminate or reload the EasyEDA renderer, reconnect the authenticated bridge, and retry with the still-current confirmation.",
        );
      }
      const executionAuthorityValidator = this.executionAuthorityValidator;
      if (executionAuthorityValidator === undefined) {
        throw new Error(
          "Recovery is forbidden without an operation-bound validator that proves the entire prior EasyEDA process tree and execution authority terminated.",
        );
      }
      const terminationBindingSha256 = sha256Json({
        schema:
          "easyeda-pro-control.execution-authority-termination-binding.v1",
        operationId,
        orphanedCallPhase,
        challengeAttempt,
        priorBridgeSession,
        priorBridgeDispatch,
        currentBridgeSession,
        closedBridgeSession,
        priorRuntimeIdentity,
        currentRuntimeIdentity,
        priorExecutionAuthoritySha256:
          priorExecutionAuthority.authoritySha256,
      });
      const executionAuthorityTerminationProof =
        executionAuthorityTerminationPayload(
          await executionAuthorityValidator.proveTerminated({
            bindingSha256: terminationBindingSha256,
            challengeAttempt,
            currentBridgeSession,
            currentRuntimeIdentity,
            operationId,
            orphanPhase: orphanedCallPhase,
            priorBridgeSession,
            priorExecutionAuthority,
            priorRuntimeIdentity,
          }),
          terminationBindingSha256,
          priorExecutionAuthority.authoritySha256,
          priorExecutionAuthority.policyId,
          priorExecutionAuthority.policySha256,
        );
      await this.assertStoredRuntime(
        operation,
        "recovery-runtime-restart-boundary",
      );
      const attestedAt = now();
      operation.sequence += 1;
      const boundary = {
        attestedAt,
        challengeAttempt,
        orphanedCallPhase,
        confirmationSha256: sha256Text(requiredConfirmation),
        storedRuntimeFingerprintMatchedAfterReconnect: true,
        priorRuntimeIdentity,
        currentRuntimeIdentity,
        rendererGenerationChanged: true,
        priorBridgeSession,
        priorBridgeDispatch,
        currentBridgeSession,
        closedBridgeSession,
        executionAuthorityTerminationProof,
      };
      operation.runtimeRestartBoundary = boundary;
      operation.runtimeIdentityBeforeOrphan = currentRuntimeIdentity;
      operation.bridgeSessionBeforeOrphan = currentBridgeSession;
      operation.unsavedStateDiscardedByRestart = true;
      operation.runtimeRestartChallengeConsumedAt = attestedAt;
      delete operation.runtimeRestartChallenge;
      delete operation.runtimeRestartChallengeIssuedAt;
      operation.updatedAt = now();
      // Persist consumption while the orphan-risk gate is still closed. If the
      // Process stops before the next journal write, recovery issues a new
      // Nonce instead of accepting this attestation again.
      await updateOperation(operation);
      const artifact = await writePhaseArtifact(
        operationId,
        operation.sequence,
        `runtime-restart-boundary-${Date.now()}`,
        boundary,
      );
      operation.artifacts.push(artifact);
      operation.orphanedCallPossible = false;
      operation.orphanedCallPhase = undefined;
      operation.updatedAt = now();
      await updateOperation(operation);
    } else {
      await this.assertStoredRuntime(operation, "recovery");
    }
    if (
      resolution === "reconciled-applied-unsaved" &&
      operation.unsavedStateDiscardedByRestart === true
    ) {
      throw new Error(
        "Applied-unsaved recovery is illegal after the required EasyEDA restart/discard boundary. Prove the durable baseline with reconciled-no-mutation, or inspect manually if unsaved state was preserved contrary to the recovery contract.",
      );
    }
    if (
      resolution === "reconciled-saved-reopened" &&
      [
        "final-reopen-dispatching",
        "final-reopen-unknown",
        "recovery-reopen-dispatching",
        "recovery-reopen-unknown",
      ].includes(operation.state) &&
      options.confirmRepeatAfterUnknownRecovery !== true
    ) {
      throw new Error(
        "The previous recovery reopen is uncertain. Inspect the journal, then set confirmRepeatAfterUnknownRecovery=true to authorize a newly journaled reconciliation attempt.",
      );
    }

    if (resolution === "reconciled-saved-reopened") {
      await this.assertProjectContext(operation.plan.expectedContext.project);
    } else if (
      resolution === "reconciled-no-mutation" &&
      baselinePreparationStates.has(operation.state)
    ) {
      await this.assertProjectContext(operation.plan.expectedContext.project);
    } else {
      await this.activateAndRebindRecoveryTarget(operation, recoveryStartState);
    }

    let preCheckpointVerification;
    try {
      preCheckpointVerification = await verifyAuthorizedCheckpoint(
        operation.preCheckpoint.receiptPath,
        operation.plan.expectedContext.project.path,
      );
    } catch (error) {
      throw new Error(
        "Stored pre-checkpoint integrity could not be proved; recovery is blocked.",
        {
          cause: error,
        },
      );
    }

    let recoveryEvidence;

    if (resolution === "reconciled-no-mutation") {
      if (!preCheckpointVerification.ok) {
        throw new Error(
          "The durable project no longer matches the pre-checkpoint; no-mutation recovery is impossible.",
        );
      }
      if (baselinePreparationStates.has(recoveryStartState)) {
        const finalPreCheckpointVerification = await verifyAuthorizedCheckpoint(
          operation.preCheckpoint.receiptPath,
          operation.plan.expectedContext.project.path,
        );
        if (!finalPreCheckpointVerification.ok) {
          throw new Error(
            "The durable project changed while the interrupted baseline preparation was being invalidated.",
          );
        }
        operation.state = "plan-invalidated";
        operation.mutationState = "none";
        operation.saved = false;
        operation.reopened = false;
        recoveryEvidence = {
          preCheckpointVerification,
          finalPreCheckpointVerification,
          baselinePreparationInvalidated: true,
        };
      } else {
        const baseline = await this.runSpecs(
          operation.plan.preflightCalls,
          operation.plan.expectedContext,
          "read",
        );
        const recoveredBaselineInvariants = baselineInvariants(
          baseline,
          operation.plan,
        );
        if (snapshotHash(baseline) !== operation.baselineHash) {
          throw new Error(
            "Live state does not match the stored preflight baseline.",
          );
        }
        if (
          canonicalJson(recoveredBaselineInvariants) !==
          canonicalJson(operation.baselineInvariants)
        ) {
          throw new Error(
            "Live state does not match the stored exact baseline invariants.",
          );
        }
        const finalPreCheckpointVerification = await verifyAuthorizedCheckpoint(
          operation.preCheckpoint.receiptPath,
          operation.plan.expectedContext.project.path,
        );
        if (!finalPreCheckpointVerification.ok) {
          throw new Error(
            "The durable project changed while no-mutation recovery was reading the live baseline.",
          );
        }
        operation.state = "reconciled-no-mutation";
        operation.mutationState = "none";
        operation.saved = false;
        operation.reopened = false;
        recoveryEvidence = {
          preCheckpointVerification,
          finalPreCheckpointVerification,
          baselineHash: operation.baselineHash,
          recoveredBaselineInvariants,
        };
      }
    } else if (resolution === "reconciled-applied-unsaved") {
      if (!preCheckpointVerification.ok) {
        throw new Error(
          "The durable project changed after the pre-checkpoint; the desired state cannot be classified as unsaved.",
        );
      }
      const results = await this.runSpecs(
        operation.plan.verifyCalls,
        operation.plan.expectedContext,
        "read",
      );
      const exactInvariantProof = verifyPhaseInvariants(
        results,
        operation,
        "Recovered live verification",
      );
      const aggregateAssertions = assertAssertions(
        results.map((result) => result.payload),
        operation.plan.verifyAssertions,
        "Recovered live verification",
      );
      const finalPreCheckpointVerification = await verifyAuthorizedCheckpoint(
        operation.preCheckpoint.receiptPath,
        operation.plan.expectedContext.project.path,
      );
      if (!finalPreCheckpointVerification.ok) {
        throw new Error(
          "The durable project changed while recovered unsaved state was being verified.",
        );
      }
      operation.state = "live-verified";
      operation.mutationState = "applied-unsaved";
      operation.saved = false;
      operation.reopened = false;
      recoveryEvidence = {
        preCheckpointVerification,
        finalPreCheckpointVerification,
        results,
        exactInvariantProof,
        aggregateAssertions,
      };
    } else if (resolution === "reconciled-saved-reopened") {
      if (
        !preCheckpointVerification.checkpointMatchesReceipt ||
        preCheckpointVerification.sourceEqualsCheckpoint
      ) {
        throw new Error(
          "Saved recovery requires an intact pre-checkpoint and a demonstrably changed live project database.",
        );
      }
      let reopenOnly;
      if (options.confirmDiscardAnyUnsavedState !== true) {
        throw new Error(
          "Saved-state recovery must close/reopen without saving so it cannot certify later unsaved edits. Set confirmDiscardAnyUnsavedState=true only after authorizing discard of any unsaved target-document state.",
        );
      }
      const source = buildReopenOnlyCode(operation.plan.expectedContext, {
        allowDifferentActiveDocument: true,
      });
      const sourceSha256 = sha256Text(source);
      operation.state = "recovery-reopen-dispatching";
      operation.mutationState = "unknown";
      operation.hardStop = true;
      operation.mutationMayHaveOccurred = true;
      operation.recoveryAttemptCount =
        (operation.recoveryAttemptCount ?? 0) + 1;
      operation.recoverySourceSha256 = sourceSha256;
      operation.nextSafeAction =
        "Wait for the destructive reopen-only recovery. Never repeat it after a timeout without a fresh reconciliation.";
      operation.updatedAt = now();
      await updateOperation(operation);
      try {
        const raw = await this.dispatchWithOrphanTracking(
          operation,
          "recovery-reopen",
          "easyeda_execute",
          { code: source, timeoutMs: 60_000, confirmWrite: true },
          70_000,
        );
        const payload = extractToolPayload(raw);
        assertSubset(
          payload,
          { ok: true, saved: false, closed: true, reopened: true },
          "Recovery reopen-only result",
        );
        reopenOnly = {
          sourceSha256,
          transmittedSourceSha256: sourceSha256,
          payload,
        };
        const reopenedContext = await this.rebindAfterLifecycle(
          operation.plan.expectedContext,
          payload,
          "Recovery reopen-only result",
        );
        operation.context = reopenedContext;
        operation.planHash = buildPlanHash(operation.plan);
        operation.sequence += 1;
        const reopenArtifact = await writePhaseArtifact(
          operationId,
          operation.sequence,
          `recovery-reopen-${Date.now()}`,
          { ...reopenOnly, context: reopenedContext },
        );
        operation.artifacts.push(reopenArtifact);
        operation.state = "recovery-reopened";
        operation.mutationState = "saved";
        operation.saved = true;
        operation.reopened = true;
        operation.hardStop = false;
        operation.nextSafeAction =
          "Run the stored reopened verifier and final checkpoint.";
        operation.updatedAt = now();
        await updateOperation(operation);
      } catch (error) {
        operation.state = "recovery-reopen-unknown";
        operation.mutationState = "unknown";
        operation.saved = false;
        operation.reopened = false;
        operation.hardStop = true;
        operation.mutationMayHaveOccurred = true;
        operation.unknownPhase = "recovery-reopen";
        operation.nextSafeAction =
          "Do not repeat recovery. Inspect project/document state and the journal before an explicitly confirmed reconciliation attempt.";
        operation.lastError = serializeError(error);
        operation.updatedAt = now();
        await updateOperation(operation);
        throw error;
      }
      try {
        const finalCheckpoint = await createAuthorizedCheckpoint(
          {
            ...operation.plan.checkpoint,
            label: `post-${operation.plan.checkpoint.label}`,
          },
          operation.plan.expectedContext.project.path,
        );
        operation.candidateFinalCheckpoint = finalCheckpoint;
        operation.updatedAt = now();
        await updateOperation(operation);
        await this.assertContext(operation.plan.expectedContext);
        const results = await this.runSpecs(
          operation.plan.reopenedVerifyCalls,
          operation.plan.expectedContext,
          "read",
        );
        const exactInvariantProof = verifyPhaseInvariants(
          results,
          operation,
          "Recovered reopened verification",
        );
        const aggregateAssertions = assertAssertions(
          results.map((result) => result.payload),
          operation.plan.reopenedAssertions,
          "Recovered reopened verification",
        );
        const persistenceVerification = await verifyAuthorizedCheckpoint(
          operation.preCheckpoint.receiptPath,
          operation.plan.expectedContext.project.path,
        );
        if (
          !persistenceVerification.checkpointMatchesReceipt ||
          persistenceVerification.sourceEqualsCheckpoint
        ) {
          throw new Error(
            "Recovered reopened assertions passed, but logical persistence relative to the intact pre-checkpoint was not proved.",
          );
        }
        const finalCheckpointVerification = await verifyAuthorizedCheckpoint(
          finalCheckpoint.receiptPath,
          operation.plan.expectedContext.project.path,
        );
        if (!finalCheckpointVerification.ok) {
          throw new Error("Reconciled final checkpoint verification failed.");
        }
        const semanticPersistenceValidator = this.semanticPersistenceValidator;
        if (semanticPersistenceValidator === undefined) {
          throw new Error(
            "No semantic persistence-delta validator is installed; recovered completion is forbidden.",
          );
        }
        const reopenedProofSnapshotSha256 = snapshotHash(results);
        const semanticValidationInput = {
          operationId,
          plan: operation.plan,
          preCheckpoint: operation.preCheckpoint,
          finalCheckpoint,
          reopenedProofSnapshotSha256,
        };
        const semanticValidationBindingSha256 =
          semanticPersistenceBindingSha256(semanticValidationInput);
        const semanticPersistenceProof = semanticPersistencePayload(
          await semanticPersistenceValidator({
            ...semanticValidationInput,
            bindingSha256: semanticValidationBindingSha256,
          }),
          semanticValidationBindingSha256,
        );
        await this.assertContext(operation.plan.expectedContext);
        const certificationResults = await this.runSpecs(
          operation.plan.reopenedVerifyCalls,
          operation.plan.expectedContext,
          "read",
        );
        const certificationInvariantProof = verifyPhaseInvariants(
          certificationResults,
          operation,
          "Recovered post-policy completion certification",
        );
        const certificationAssertions = assertAssertions(
          certificationResults.map((result) => result.payload),
          operation.plan.reopenedAssertions,
          "Recovered post-policy completion certification",
        );
        const certifiedSnapshotSha256 = snapshotHash(certificationResults);
        if (certifiedSnapshotSha256 !== snapshotHash(results)) {
          throw new Error(
            "The recovered reopened EasyEDA state changed while semantic persistence was being validated; completion is forbidden.",
          );
        }
        const certificationPersistenceVerification =
          await verifyAuthorizedCheckpoint(
            operation.preCheckpoint.receiptPath,
            operation.plan.expectedContext.project.path,
          );
        if (
          !certificationPersistenceVerification.checkpointMatchesReceipt ||
          certificationPersistenceVerification.sourceEqualsCheckpoint
        ) {
          throw new Error(
            "The recovered pre-checkpoint or durable logical delta changed during semantic persistence validation.",
          );
        }
        const certificationCheckpointVerification =
          await verifyAuthorizedCheckpoint(
            finalCheckpoint.receiptPath,
            operation.plan.expectedContext.project.path,
          );
        if (!certificationCheckpointVerification.ok) {
          throw new Error(
            "The recovered live database changed during semantic persistence validation; completion is forbidden.",
          );
        }
        operation.finalCheckpoint = finalCheckpoint;
        operation.candidateFinalCheckpoint = undefined;
        operation.state = "completed";
        operation.mutationState = "saved";
        operation.saved = true;
        operation.reopened = true;
        recoveryEvidence = {
          preCheckpointVerification,
          reopenOnly,
          results,
          exactInvariantProof,
          aggregateAssertions,
          persistenceVerification,
          finalCheckpoint,
          finalCheckpointVerification,
          semanticPersistenceProof,
          certificationResults,
          certificationInvariantProof,
          certificationAssertions,
          certifiedSnapshotSha256,
          certificationPersistenceVerification,
          certificationCheckpointVerification,
        };
      } catch (error) {
        operation.state = "recovery-verification-failed";
        operation.mutationState = "saved";
        operation.saved = true;
        operation.reopened = true;
        operation.hardStop = true;
        operation.mutationMayHaveOccurred = false;
        operation.nextSafeAction =
          "The recovery reopen completed, but durable verification or checkpointing failed. Inspect before retrying verification.";
        operation.lastError = serializeError(error);
        operation.updatedAt = now();
        await updateOperation(operation);
        throw error;
      }
    }

    operation.sequence += 1;
    const artifact = await writePhaseArtifact(
      operationId,
      operation.sequence,
      `recovery-${resolution}-${randomUUID()}`,
      recoveryEvidence,
    );
    operation.artifacts.push(artifact);
    operation.hardStop = false;
    operation.mutationMayHaveOccurred =
      operation.state === "live-verified" ||
      operation.mutationState === "applied-unsaved";
    operation.nextSafeAction =
      operation.state === "live-verified"
        ? "Call easyeda_control_save_reopen."
        : "Recovery is complete. Review the journal before planning another mutation.";
    operation.updatedAt = now();
    await updateOperation(operation);
    return operationSummary(operation);
  }

  public async checkpoint(
    args: CheckpointArgs,
  ): Promise<
    | Awaited<ReturnType<typeof verifyCheckpoint>>
    | Awaited<ReturnType<typeof createCheckpoint>>
  > {
    const activeContext = await this.context();
    const activeSource = activeContext.project.path;
    if (args.receiptPath !== undefined && args.receiptPath.length > 0) {
      return verifyAuthorizedCheckpoint(args.receiptPath, activeSource);
    }
    const { source, outputDir, label } = args;
    if (
      typeof source !== "string" ||
      source.length === 0 ||
      typeof outputDir !== "string" ||
      outputDir.length === 0 ||
      typeof label !== "string" ||
      label.length === 0
    ) {
      throw new TypeError(
        "Checkpoint creation requires nonempty source, outputDir, and label.",
      );
    }
    return createAuthorizedCheckpoint(
      { source, outputDir, label },
      activeSource,
    );
  }
}

export function planHashFor(plan: unknown): string {
  if (!isUnknownRecord(plan)) {
    throw new Error("Plan hash input must be an object.");
  }
  return buildPlanHash(plan);
}

export function canonicalSnapshotHash(results: unknown): string {
  return sha256Text(canonicalJson(results));
}
