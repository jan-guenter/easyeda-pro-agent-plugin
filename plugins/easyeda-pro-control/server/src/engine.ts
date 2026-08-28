import {
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
  operationHasOrphanedCallRisk,
  operationSummary as untypedOperationSummary,
  reviewedCompatibilityManifestFingerprint,
  sha256Json,
  sha256Text,
  validateExpectedFingerprint,
  validatePrivateFingerprint,
  OPERATION_SCHEMA,
} from './core.ts';
import {
  createOperation,
  listOperations,
  loadOperation,
  operationPath,
  updateOperation,
  writePhaseArtifact,
} from './artifacts.ts';
import type { ArtifactDescriptor } from './artifacts.ts';
import { createCheckpoint, verifyCheckpoint } from './checkpoint.ts';
import {
  buildActivateRecoveryTargetCode,
  buildComponentMutationCode,
  buildReopenOnlyCode,
  buildSaveReopenCode,
  CONTEXT_PROBE_CODE,
  PROJECT_CONTEXT_PROBE_CODE,
  wrapWithContextGuard,
} from './runtime-scripts.ts';
import {
  buildExactReadCode,
  exactTargetAssertionPointer,
  validateExactReadPayload,
  validateExactReadRequest,
} from './exact-readers.ts';
import type { ExactReadRequest } from './exact-readers.ts';
import { randomUUID } from 'node:crypto';
import { isAbsolute } from 'node:path';

const FORBIDDEN_APPLY_NAMES = /(^|_)(save|save_all|sync|import_changes|order|purchase)(_|$)/iu;
const DEDICATED_FACADE_NAME = /(^|_)(capture|export)(_|$)/iu;
const EXACT_COMPONENT_MUTATION_TOOL = 'easyeda_control_exact_component_mutation';
const ACTIVE_DOCUMENT_WRITE_ALLOWLIST = new Map<number, Set<string>>([[3, new Set<string>()]]);

type UnknownRecord = Record<string, unknown>;
export type MutationStateName = 'before' | 'after';
type ExpectedCallKind = 'read' | 'mutate-unsaved';
export type RecoveryResolution =
  | 'reconciled-no-mutation'
  | 'reconciled-applied-unsaved'
  | 'reconciled-saved-reopened';

export interface AssertionSpec {
  pointer: string;
  op: 'exists' | 'equals' | 'not-equals' | 'matches' | 'length-equals';
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
  annotations?: {
    title?: string | undefined;
    readOnlyHint?: boolean | undefined;
    destructiveHint?: boolean | undefined;
    idempotentHint?: boolean | undefined;
    openWorldHint?: boolean | undefined;
  } | undefined;
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
  listTools?(): Promise<ToolDescriptor[]>;
  findTool?(name: string): Promise<ToolDescriptor | undefined>;
  callTool(name: string, args: UnknownRecord | undefined, timeoutMs?: number): Promise<unknown>;
  serverInfo?(): { name?: string; version?: unknown } | undefined;
  instructions?(): unknown;
  launcherFingerprint?(): Promise<LauncherFingerprint>;
  launcherState?(): Promise<LauncherState>;
  installedEasyedaBundles?(): Promise<InstalledEasyedaBundles>;
}

interface ContextOptions {
  allowTabChange?: boolean;
}

interface InvokeOptions extends ContextOptions {
  targetChanges?: TargetChange[];
  beforeDispatch?: () => void | Promise<void>;
  afterDispatch?: () => void | Promise<void>;
}

export interface EngineOptions {
  privateComponentWriterValidated?: boolean | undefined;
}

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

interface CheckpointArgs {
  receiptPath?: string;
  source?: string;
  outputDir?: string;
  label?: string;
}

function isUnknownRecord(value: unknown): value is UnknownRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isContextProbePayload(value: unknown): value is ContextProbePayload {
  return (
    isUnknownRecord(value) &&
    isUnknownRecord(value['project']) &&
    isUnknownRecord(value['document'])
  );
}

function isProjectProbePayload(value: unknown): value is ProjectProbePayload {
  return isUnknownRecord(value) && isUnknownRecord(value['project']);
}

function isOperationJournalRecord(value: unknown): value is OperationJournal {
  return isUnknownRecord(value);
}

function isMutationPlan(value: unknown): value is MutationPlan {
  if (!isUnknownRecord(value)) return false;
  const expectedContext = value['expectedContext'];
  return (
    isUnknownRecord(expectedContext) &&
    isUnknownRecord(expectedContext['project']) &&
    isUnknownRecord(expectedContext['document']) &&
    isUnknownRecord(value['applyCall']) &&
    isUnknownRecord(value['checkpoint']) &&
    isUnknownRecord(value['expectedFingerprint'])
  );
}

function isCompleteOperationJournal(value: unknown): value is OperationJournal {
  return (
    isUnknownRecord(value) &&
    typeof value['operationId'] === 'string' &&
    typeof value['planHash'] === 'string' &&
    typeof value['state'] === 'string' &&
    typeof value['mutationState'] === 'string' &&
    typeof value['saved'] === 'boolean' &&
    typeof value['reopened'] === 'boolean' &&
    typeof value['hardStop'] === 'boolean' &&
    typeof value['mutationMayHaveOccurred'] === 'boolean' &&
    typeof value['nextSafeAction'] === 'string' &&
    typeof value['journalPath'] === 'string' &&
    typeof value['updatedAt'] === 'string'
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
  if (!isCompleteOperationJournal(operation)) return summary;
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
      typeof summary.orphanedCallPhase === 'string' ? summary.orphanedCallPhase : undefined,
    runtimeRestartChallenge:
      typeof summary.runtimeRestartChallenge === 'string'
        ? summary.runtimeRestartChallenge
        : undefined,
    runtimeRestartChallengeIssuedAt:
      typeof summary.runtimeRestartChallengeIssuedAt === 'string'
        ? summary.runtimeRestartChallengeIssuedAt
        : undefined,
    runtimeRestartBoundary: operation.runtimeRestartBoundary,
    nextSafeAction: operation.nextSafeAction,
    unknownPhase: typeof summary.unknownPhase === 'string' ? summary.unknownPhase : undefined,
    lastError: summary.lastError,
    journalPath: operation.journalPath,
    checkpoints: summary.checkpoints,
    artifacts: summary.artifacts,
    updatedAt: operation.updatedAt,
  };
}

function annotatedError(message: string, options?: ErrorOptions): AnnotatedError {
  return new Error(message, options);
}

function errorMetadata(error: unknown): AnnotatedError | undefined {
  return error instanceof Error ? (error) : undefined;
}

function proofPayload(value: unknown): ProofPayload {
  if (!isUnknownRecord(value)) {
    throw new Error('Exact proof payload must be an object.');
  }
  return value;
}

function contextPayload(value: unknown): ContextProbePayload {
  if (!isContextProbePayload(value)) {
    throw new Error('EasyEDA context probe returned a non-object context.');
  }
  return value;
}

function projectPayload(value: unknown): ProjectProbePayload {
  if (!isProjectProbePayload(value)) {
    throw new Error('EasyEDA project probe returned a non-object project context.');
  }
  return value;
}

function asOperationJournal(value: unknown): OperationJournal {
  if (!isOperationJournalRecord(value)) {
    throw new TypeError('Operation journal must be an object.');
  }
  return value;
}

function asOperationJournals(value: unknown): OperationJournal[] {
  return Array.isArray(value) ? value.map((item) => asOperationJournal(item)) : [];
}

function toolDocumentType(toolName: string): number | undefined {
  if (/^easyeda_schematic_/iu.test(toolName)) return 1;
  if (/^easyeda_(pcb|board)_/iu.test(toolName)) return 3;
  return undefined;
}

function now(): string {
  return new Date().toISOString();
}

function serializeError(error: unknown): SerializedError {
  const metadata = errorMetadata(error);
  return {
    name: metadata?.name ?? 'Error',
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
    const error = annotatedError(`${label} failed ${failed.length} assertion(s).`);
    error.assertionResults = results;
    throw error;
  }
  return results;
}

function normalizedProofPayload(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((item) => normalizedProofPayload(item));
  if (!isUnknownRecord(value)) return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, child]) => [
      key,
      key === 'read_consistency' && isUnknownRecord(child)
        ? { stable: child['stable'] === true }
        : normalizedProofPayload(child),
    ]),
  );
}

function snapshotHash(results: SpecResult[]): string {
  return sha256Json(
    results.map((result) => ({
      toolName: result.toolName,
      payload: normalizedProofPayload(result.payload),
      assertions: result.assertions,
    })),
  );
}

function runtimeFingerprint(status: unknown): unknown {
  return isUnknownRecord(status) ? status['stableFingerprint'] : undefined;
}

function exactCalls(calls: ToolCallSpec[] | undefined, kind: string): ToolCallSpec[] {
  return (calls ?? []).filter(
    (call) =>
      call.toolName === 'easyeda_control_exact_read' && call.arguments?.['kind'] === kind,
  );
}

function assertRequiredPhaseReaders(
  calls: ToolCallSpec[],
  documentType: number,
  targetPrimitiveIds: string[],
  label: string,
): void {
  const componentKind = documentType === 1 ? 'schematic-components' : 'pcb-components';
  const componentCalls = exactCalls(calls, componentKind);
  const summaryCalls = componentCalls.filter((call) => {
    const selector = call.arguments?.['selector'];
    return (
      isUnknownRecord(selector) &&
      selector['all'] === true &&
      call.arguments?.['includePins'] === false &&
      call.arguments?.['includeBounds'] === false
    );
  });
  const targetCalls = componentCalls.filter((call) => {
    const selector = call.arguments?.['selector'];
    const primitiveIds = isUnknownRecord(selector) ? selector['primitiveIds'] : undefined;
    return (
      isStringArray(primitiveIds) &&
      canonicalJson(primitiveIds.toSorted((left, right) => left.localeCompare(right))) ===
        canonicalJson(targetPrimitiveIds.toSorted((left, right) => left.localeCompare(right))) &&
      call.arguments?.['includePins'] !== false &&
      call.arguments?.['includeBounds'] !== false
    );
  });
  if (componentCalls.length !== 2 || summaryCalls.length !== 1 || targetCalls.length !== 1) {
    throw new Error(
      `${label} requires one all-component scalar snapshot (pins/bounds false) and one detailed exact-target ${componentKind} snapshot (pins/bounds true).`,
    );
  }
  if (documentType === 3) {
    for (const kind of ['pcb-inventory', 'pcb-rules']) {
      if (exactCalls(calls, kind).length !== 1) {
        throw new Error(`${label} requires exactly one facade-owned ${kind} invariant read.`);
      }
    }
  } else if (exactCalls(calls, 'schematic-topology').length !== 1) {
    throw new Error(`${label} requires exactly one facade-owned schematic-topology invariant read.`);
  }
}

function resultForKind(results: SpecResult[], kind: string): ProofPayload {
  const matches = (results ?? []).filter(
    (result) =>
      result.toolName === 'easyeda_control_exact_read' && proofPayload(result.payload).kind === kind,
  );
  if (matches.length !== 1) throw new Error(`Proof phase did not produce exactly one ${kind} result.`);
  const [match] = matches;
  if (!match) throw new Error(`Proof phase did not produce exactly one ${kind} result.`);
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
        result.toolName === 'easyeda_control_exact_read' && proofPayload(result.payload).kind === kind,
    )
    .map((result) => proofPayload(result.payload));
  const summary = matches.filter(
    (payload) => payload.detail?.pins === false && payload.detail?.bounds === false,
  );
  const target = matches.filter(
    (payload) =>
      payload.detail?.pins === true &&
      payload.detail?.bounds === true &&
      canonicalJson(payload.primitiveIds) === canonicalJson([...targetPrimitiveIds].toSorted()),
  );
  if (matches.length !== 2 || summary.length !== 1 || target.length !== 1) {
    throw new Error(`Proof phase did not produce the required summary and target ${kind} results.`);
  }
  const [summaryPayload] = summary;
  const [targetPayload] = target;
  if (!summaryPayload || !targetPayload) {
    throw new Error(`Proof phase did not produce the required summary and target ${kind} results.`);
  }
  return { summary: summaryPayload, target: targetPayload };
}

function targetRecordPointer(primitiveId: string): string {
  return exactTargetAssertionPointer(primitiveId).replace(/\/primitiveId$/u, '');
}

function targetChangeAssertions(plan: MutationPlan, state: MutationStateName): AssertionSpec[] {
  return plan.targetChanges.map((change) => ({
    pointer: `${targetRecordPointer(change.primitiveId)}${change.pointer}`,
    op: 'equals',
    value: change[state],
  }));
}

function maskRelativePointer(root: UnknownRecord, pointer: string): void {
  const parts = pointer
    .slice(1)
    .split('/')
    .map((part) => part.replaceAll('~1', '/').replaceAll('~0', '~'));
  let owner: unknown = root;
  for (let index = 0; index < parts.length - 1; index += 1) {
    const key = parts[index];
    if (key === undefined) {
      throw new Error(`Declared target change pointer does not resolve: ${pointer}`);
    }
    owner = Array.isArray(owner) && /^\d+$/u.test(key)
      ? owner[Number(key)]
      : isUnknownRecord(owner)
        ? owner[key]
        : undefined;
    if (!isUnknownRecord(owner) && !Array.isArray(owner)) {
      throw new Error(`Declared target change pointer does not resolve: ${pointer}`);
    }
  }
  const finalKey = parts.at(-1);
  if (
    finalKey === undefined ||
    (Array.isArray(owner)
      ? !/^\d+$/u.test(finalKey) || Number(finalKey) >= owner.length
      : !isUnknownRecord(owner) || !Object.hasOwn(owner, finalKey))
  ) {
    throw new Error(`Declared target change pointer does not resolve: ${pointer}`);
  }
  if (Array.isArray(owner)) owner[Number(finalKey)] = '__DECLARED_TARGET_CHANGE__';
  else if (isUnknownRecord(owner)) owner[finalKey] = '__DECLARED_TARGET_CHANGE__';
}

function targetComponentInvariantHash(payload: ProofPayload, plan: MutationPlan): string {
  const records = structuredClone(payload?.byPrimitiveId ?? {});
  for (const change of plan.targetChanges) {
    const record = records[change.primitiveId];
    if (!record || typeof record !== 'object') {
      throw new Error(`Exact component snapshot omitted declared target ${change.primitiveId}.`);
    }
    maskRelativePointer(record, change.pointer);
  }
  return sha256Json(records);
}

function nonTargetComponentHash(payload: ProofPayload, targetPrimitiveIds: string[]): string {
  const targets = new Set(targetPrimitiveIds);
  return sha256Json(
    Object.fromEntries(
      Object.entries(payload?.byPrimitiveId ?? {}).filter(([primitiveId]) => !targets.has(primitiveId)),
    ),
  );
}

function declaredTargetPadConsequences(
  plan: MutationPlan,
  targetComponentPayload: ProofPayload,
  stateName: MutationStateName,
): Map<string, PadConsequence> {
  if (!['before', 'after'].includes(stateName)) {
    throw new Error('PCB pad consequence proof requires before or after state.');
  }
  const consequences = new Map<string, PadConsequence>();
  for (const change of plan.targetChanges) {
    const match = /^\/pads\/(0|[1-9]\d*)\/(x|y|rotation|layer)$/u.exec(change.pointer);
    if (!match) continue;
    const component = targetComponentPayload?.byPrimitiveId?.[change.primitiveId];
    const padIndexText = match[1];
    const field = match[2];
    if (padIndexText === undefined || field === undefined) {
      throw new Error(`Declared target pad consequence is malformed: ${change.pointer}`);
    }
    const padIndex = Number(padIndexText);
    const pad = component?.pads?.[padIndex];
    if (!pad || typeof pad !== 'object') {
      throw new Error(`Declared target pad consequence does not resolve: ${change.primitiveId}${change.pointer}`);
    }
    const key = `${pad.primitiveId}\u0000${field}`;
    if (consequences.has(key)) {
      throw new Error(`Declared target pad consequence repeats direct pad ${pad.primitiveId}/${field}.`);
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
  const normalizedInventory = normalizedProofPayload(payload);
  if (!isUnknownRecord(normalizedInventory)) {
    throw new Error('PCB inventory invariant must be an object.');
  }
  const inventory = structuredClone(normalizedInventory);
  const targetSet = new Set(plan.targetPrimitiveIds);
  const declaredConsequences = declaredTargetPadConsequences(
    plan,
    targetComponentPayload,
    stateName,
  );
  const families = inventory['families'];
  const padFamily = isUnknownRecord(families) ? families['pads'] : undefined;
  const padsCandidate = isUnknownRecord(padFamily) ? padFamily['byPrimitiveId'] : undefined;
  if (!isUnknownRecord(padsCandidate)) {
    throw new Error('PCB inventory invariant omitted its direct pad state index.');
  }
  const pads = padsCandidate;
  for (const consequence of declaredConsequences.values()) {
    const pad = pads[consequence.primitiveId];
    if (
      !isUnknownRecord(pad) ||
      typeof pad['parentComponentPrimitiveId'] !== 'string' ||
      !targetSet.has(pad['parentComponentPrimitiveId']) ||
      pad['parentComponentPrimitiveId'] !== consequence.parentComponentPrimitiveId
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
    if (canonicalJson(pad[consequence.field]) !== canonicalJson(consequence.value)) {
      throw new Error(
        `Target-owned direct pad ${consequence.primitiveId}/${consequence.field} disagrees with its declared ${stateName} consequence.`,
      );
    }
    pad[consequence.field] = '__AUTHORIZED_TARGET_PAD_CONSEQUENCE__';
  }
  return sha256Json(inventory);
}

function baselineInvariants(results: SpecResult[], plan: MutationPlan): BaselineInvariants {
  const documentType = plan.expectedContext.document.documentType;
  const componentKind = documentType === 1 ? 'schematic-components' : 'pcb-components';
  const components = componentProofResults(results, componentKind, plan.targetPrimitiveIds);
  assertAssertions(
    components.target,
    targetChangeAssertions(plan, 'before'),
    'Declared target baseline',
  );
  const value: BaselineInvariants = {
    componentKind,
    nonTargetComponentStateSha256: nonTargetComponentHash(
      components.summary,
      plan.targetPrimitiveIds,
    ),
    unchangedTargetStateSha256: targetComponentInvariantHash(components.target, plan),
  };
  if (documentType === 1) {
    value.schematicTopologySha256 = sha256Json(
      normalizedProofPayload(resultForKind(results, 'schematic-topology')),
    );
  } else if (documentType === 3) {
    value.pcbInventorySha256 = pcbInventoryInvariantHash(
      resultForKind(results, 'pcb-inventory'),
      plan,
      components.target,
      'before',
    );
    value.pcbRulesSha256 = sha256Json(normalizedProofPayload(resultForKind(results, 'pcb-rules')));
  }
  return value;
}

function verifyPhaseInvariants(
  results: SpecResult[],
  operation: OperationJournal,
  label: string,
): PhaseInvariantProof {
  const baseline = operation.baselineInvariants;
  if (!baseline) throw new Error('Operation journal has no exact baseline invariant hashes.');
  const components = componentProofResults(
    results,
    baseline.componentKind,
    operation.plan.targetPrimitiveIds,
  );
  const targetAssertions = assertAssertions(
    components.target,
    targetChangeAssertions(operation.plan, 'after'),
    `${label} declared target state`,
  );
  const nonTargetComponentStateSha256 = nonTargetComponentHash(
    components.summary,
    operation.plan.targetPrimitiveIds,
  );
  if (nonTargetComponentStateSha256 !== baseline.nonTargetComponentStateSha256) {
    throw new Error(
      `${label} changed one or more non-target component scalar records.`,
    );
  }
  const unchangedTargetStateSha256 = targetComponentInvariantHash(
    components.target,
    operation.plan,
  );
  if (unchangedTargetStateSha256 !== baseline.unchangedTargetStateSha256) {
    throw new Error(`${label} changed target state outside the explicitly declared targetChanges.`);
  }
  const proof: PhaseInvariantProof = {
    targetAssertions,
    nonTargetComponentStateSha256,
    unchangedTargetStateSha256,
  };
  if (operation.plan.expectedContext.document.documentType === 1) {
    const topologyHash = sha256Json(
      normalizedProofPayload(resultForKind(results, 'schematic-topology')),
    );
    if (topologyHash !== baseline.schematicTopologySha256) {
      throw new Error(`${label} changed compiled schematic pin connectivity or component correlation.`);
    }
    proof.schematicTopologySha256 = topologyHash;
  } else if (operation.plan.expectedContext.document.documentType === 3) {
    const inventoryHash = pcbInventoryInvariantHash(
      resultForKind(results, 'pcb-inventory'),
      operation.plan,
      components.target,
      'after',
    );
    const rulesHash = sha256Json(normalizedProofPayload(resultForKind(results, 'pcb-rules')));
    if (inventoryHash !== baseline.pcbInventorySha256) {
      throw new Error(
        `${label} changed the PCB primitive inventory or adapter-observable pad/via/track/region/pour/fill state.`,
      );
    }
    if (rulesHash !== baseline.pcbRulesSha256) {
      throw new Error(`${label} changed PCB rules, net classes, pairs, groups, or net names.`);
    }
    proof.pcbInventorySha256 = inventoryHash;
    proof.pcbRulesSha256 = rulesHash;
  }
  return proof;
}

function ensurePlanShape(value: unknown): asserts value is MutationPlan {
  if (!isMutationPlan(value)) {
    throw new Error('Mutation plan must be an object.');
  }
  const plan = value;
  const projectUuid =
    plan.expectedContext.project.uuid ?? plan.expectedContext.project.projectUuid;
  const documentUuid =
    plan.expectedContext.document.uuid ?? plan.expectedContext.document.documentUuid;
  if (
    typeof projectUuid !== 'string' ||
    projectUuid.length === 0 ||
    typeof documentUuid !== 'string' ||
    documentUuid.length === 0 ||
    !Number.isInteger(plan.expectedContext.document.documentType)
  ) {
    throw new Error('Plan context requires project UUID, document UUID, and integer documentType.');
  }
  if (plan.expectedContext.document.documentType !== 3) {
    throw new Error(
      'Guarded mutation plans currently support PCB (3) component placement/layer/lock only. Schematic public modify cannot preserve every placed property in this pinned build.',
    );
  }
  if (
    !Array.isArray(plan.targetPrimitiveIds) ||
    plan.targetPrimitiveIds.length !== 1 ||
    new Set(plan.targetPrimitiveIds).size !== plan.targetPrimitiveIds.length
  ) {
    throw new Error(
      'Guarded mutation plans require exactly one targetPrimitiveId so recovery never has to classify a partial multi-component apply.',
    );
  }
  if (!Array.isArray(plan.targetChanges) || plan.targetChanges.length === 0) {
    throw new Error('Mutation plans require explicit before/after targetChanges.');
  }
  const targetSet = new Set(plan.targetPrimitiveIds);
  const documentType = plan.expectedContext.document.documentType;
  const declaredChangeKeys = new Set();
  for (const change of plan.targetChanges) {
    if (!targetSet.has(change?.primitiveId)) {
      throw new Error('Every targetChanges primitiveId must be declared in targetPrimitiveIds.');
    }
    if (
      typeof change.pointer !== 'string' ||
      !change.pointer.startsWith('/') ||
      /^\/primitiveId(?:\/|$)/u.test(change.pointer)
    ) {
      throw new Error('Every target change requires a non-identity relative JSON pointer.');
    }
    if (canonicalJson(change.before) === canonicalJson(change.after)) {
      throw new Error('Every target change must declare distinct before and after values.');
    }
    const changeKey = `${change.primitiveId}\u0000${change.pointer}`;
    if (declaredChangeKeys.has(changeKey)) {
      throw new Error(`Target change ${change.primitiveId}${change.pointer} is declared more than once.`);
    }
    declaredChangeKeys.add(changeKey);
    if (
      documentType === 3 &&
      !/^\/(?:x|y|rotation|layer|primitiveLock|bounds\/(?:minX|minY|maxX|maxY)|pads\/\d+\/(?:x|y|rotation|layer))$/u.test(
        change.pointer,
      )
    ) {
      throw new Error(
        'Guarded PCB mutation currently permits component placement/lock state and the resulting declared bounds/pad transforms only. Pad/footprint geometry, nets, rules, routes, pours, and stack changes require a separately validated capability.',
      );
    }
    for (const [stateName, stateValue] of [
      ['before', change.before],
      ['after', change.after],
    ] as const) {
      if (change.pointer === '/primitiveLock') {
        if (typeof stateValue !== 'boolean') {
          throw new TypeError(`Target ${change.primitiveId}${change.pointer} ${stateName} value must be boolean.`);
        }
      } else if (change.pointer === '/layer') {
        if (typeof stateValue !== 'number' || ![1, 2].includes(stateValue)) {
          throw new Error(`Target ${change.primitiveId}${change.pointer} ${stateName} value must be Top 1 or Bottom 2.`);
        }
      } else if (typeof stateValue !== 'number' || !Number.isFinite(stateValue)) {
        throw new TypeError(`Target ${change.primitiveId}${change.pointer} ${stateName} value must be finite.`);
      }
    }
  }
  for (const primitiveId of plan.targetPrimitiveIds) {
    if (!plan.targetChanges.some((change) => change.primitiveId === primitiveId)) {
      throw new Error(`Target ${primitiveId} has no declared before/after change.`);
    }
    const writablePattern = /^\/(x|y|rotation|layer|primitiveLock)$/u;
    if (
      !plan.targetChanges.some(
        (change) => change.primitiveId === primitiveId && writablePattern.test(change.pointer),
      )
    ) {
      throw new Error(`Target ${primitiveId} has no facade-writable top-level component change.`);
    }
  }
  if (
    typeof plan.expectedContext.document.tabId !== 'string' ||
    plan.expectedContext.document.tabId.length === 0
  ) {
    throw new Error('Mutation plans require the exact active document tabId.');
  }
  const expectedProjectPath = normalizeEasyedaProjectPath(plan.expectedContext.project.path);
  if (!Array.isArray(plan.preflightCalls) || plan.preflightCalls.length === 0) {
    throw new Error('Plan requires at least one read-only preflight call.');
  }
  if (!Array.isArray(plan.verifyCalls) || plan.verifyCalls.length === 0) {
    throw new Error('Plan requires at least one live verification call.');
  }
  if (!Array.isArray(plan.reopenedVerifyCalls) || plan.reopenedVerifyCalls.length === 0) {
    throw new Error('Plan requires at least one reopened-state verification call.');
  }
  for (const [label, calls] of [
    ['Preflight', plan.preflightCalls],
    ['Live verification', plan.verifyCalls],
    ['Reopened verification', plan.reopenedVerifyCalls],
  ] satisfies Array<[string, ToolCallSpec[]]>) {
    assertRequiredPhaseReaders(
      calls,
      plan.expectedContext.document.documentType,
      plan.targetPrimitiveIds,
      label,
    );
  }
  if (!Array.isArray(plan.rollbackCalls) || plan.rollbackCalls.length === 0) {
    throw new Error('Plan requires at least one explicit rollback call.');
  }
  if (
    plan.applyCall.toolName !== EXACT_COMPONENT_MUTATION_TOOL ||
    canonicalJson(plan.applyCall.arguments ?? {}) !== canonicalJson({ state: 'after' })
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
    canonicalJson(rollbackCall.arguments ?? {}) !== canonicalJson({ state: 'before' })
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
    throw new Error('Plan requires source, outputDir, and label for durable checkpoints.');
  }
  if (!isAbsolute(plan.checkpoint.source) || !isAbsolute(plan.checkpoint.outputDir)) {
    throw new Error('Checkpoint source and outputDir must be absolute paths.');
  }
  const checkpointSource = normalizeEasyedaProjectPath(plan.checkpoint.source);
  if (checkpointSource !== expectedProjectPath) {
    throw new Error(
      'checkpoint.source must be the exact .eprj2 path reported by expectedContext.project.path.',
    );
  }
  if (plan.checkpoint.label.length > 54) {
    throw new Error('Checkpoint label must be at most 54 characters.');
  }
  if (plan.capabilityLevel !== 'private-version-pinned') {
    throw new Error(
      'Guarded PCB component mutation remains private-version-pinned until connected sacrificial-board validation proves this installed modify path.',
    );
  }
  validateExpectedFingerprint(plan.expectedFingerprint);
  validatePrivateFingerprint(plan.expectedFingerprint);
}

export class SerializedGate {
  private tail: Promise<void>;

  constructor() {
    this.tail = Promise.resolve();
  }

  async run<T>(task: () => T | Promise<T>): Promise<T> {
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
  readonly upstream: UpstreamClient;
  readonly privateComponentWriterValidated: boolean;
  readonly controlFingerprintPromise: ReturnType<typeof controlImplementationFingerprint>;

  constructor(upstream: UpstreamClient, options: EngineOptions = {}) {
    this.upstream = upstream;
    this.privateComponentWriterValidated = options.privateComponentWriterValidated === true;
    this.controlFingerprintPromise = controlImplementationFingerprint();
  }

  requirePrivateComponentWriterEnabled(): void {
    if (!this.privateComponentWriterValidated) {
      throw new Error(
        'The private PCB component writer is runtime-disabled until a connected sacrificial-board test validates this installed modify path. Exact reads, evidence, checkpoints, capture, and draft DSN export remain available.',
      );
    }
  }

  async markOrphanedCallRisk(operation: OperationJournal, phase: string): Promise<void> {
    operation.orphanedCallPossible = true;
    operation.orphanedCallPhase = phase;
    operation.orphanedCallMarkedAt = now();
    operation.runtimeRestartChallengeAttempt =
      (operation.runtimeRestartChallengeAttempt ?? 0) + 1;
    operation.runtimeRestartChallenge = [
      'EASYEDA_RESTARTED_AND_RECONNECTED',
      operation.operationId,
      phase,
      operation.runtimeRestartChallengeAttempt,
      randomUUID(),
    ].join(':');
    operation.runtimeRestartChallengeIssuedAt = now();
    delete operation.runtimeRestartBoundary;
    operation.updatedAt = now();
    await updateOperation(operation);
  }

  async clearOrphanedCallRisk(operation: OperationJournal, phase: string): Promise<void> {
    operation.orphanedCallPossible = false;
    operation.orphanedCallPhase = phase;
    operation.orphanedCallReturnedAt = now();
    delete operation.runtimeRestartChallenge;
    delete operation.runtimeRestartChallengeIssuedAt;
    operation.updatedAt = now();
    await updateOperation(operation);
  }

  async ensureRuntimeRestartChallenge(operation: OperationJournal): Promise<string> {
    if (
      typeof operation.runtimeRestartChallenge === 'string' &&
      operation.runtimeRestartChallenge.length > 0
    ) {
      return operation.runtimeRestartChallenge;
    }
    const phase = operation.orphanedCallPhase ?? operation.unknownPhase ?? 'legacy-orphan';
    operation.runtimeRestartChallengeAttempt =
      (operation.runtimeRestartChallengeAttempt ?? 0) + 1;
    operation.runtimeRestartChallenge = [
      'EASYEDA_RESTARTED_AND_RECONNECTED',
      operation.operationId,
      phase,
      operation.runtimeRestartChallengeAttempt,
      randomUUID(),
    ].join(':');
    operation.runtimeRestartChallengeIssuedAt = now();
    operation.updatedAt = now();
    await updateOperation(operation);
    return operation.runtimeRestartChallenge;
  }

  async requireDurableBaselineBeforeDispatch(
    operation: OperationJournal,
    phase: string,
    failure: DurableBaselineFailure,
  ): Promise<CheckpointVerification> {
    let verification: CheckpointVerification | undefined;
    let cause: unknown;
    try {
      verification = await verifyCheckpoint(operation.preCheckpoint.receiptPath);
      if (!verification.ok) {
        cause = new Error('The durable project database no longer matches the pre-checkpoint.');
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

  async assertStoredRuntime(operation: OperationJournal, phase: string): Promise<void> {
    try {
      validateExpectedFingerprint(operation.plan.expectedFingerprint);
      if (operation.plan.capabilityLevel === 'private-version-pinned') {
        validatePrivateFingerprint(operation.plan.expectedFingerprint);
      }
      assertSubset(
        runtimeFingerprint(await this.status()),
        operation.plan.expectedFingerprint,
        'EasyEDA runtime fingerprint',
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
        'Do not dispatch another phase. Restore the exact stored runtime fingerprint, then retry the same legal phase or recovery reconciliation.';
      operation.updatedAt = now();
      await updateOperation(operation);
      throw error;
    }
  }

  async assertBridgeDispatchAllowed(): Promise<true> {
    const blockingOperations = asOperationJournals(await listOperations())
      .filter(
        (operation) =>
          operation?.state === 'journal-unreadable' ||
          operationHasOrphanedCallRisk(operation),
      )
      .map((operation) => operationSummary(operation));
    if (blockingOperations.length === 0) return true;
    const labels = blockingOperations
      .map((operation) => `${operation.operationId}:${operation.state}`)
      .join(', ');
    const error = annotatedError(
      `EasyEDA bridge dispatch is quarantined by an orphan-risk or unreadable operation journal (${labels}). Use easyeda_control_recover_incomplete without an operationId to inspect the local journals. Do not run live status, context, reads, captures, exports, checkpoints, or writes until the nonce-bound restart/recovery gate clears every orphan risk; an unreadable journal requires manual restoration or review.`,
    );
    error.blockingOperations = blockingOperations;
    throw error;
  }

  async assertRecoveryOperationIsolated(operationId: string): Promise<true> {
    const blockingOperations = asOperationJournals(await listOperations())
      .filter(
        (operation) =>
          operation?.operationId !== operationId &&
          (!isTerminalOperation(operation) ||
            operation?.state === 'journal-unreadable' ||
            operationHasOrphanedCallRisk(operation)),
      )
      .map((operation) => operationSummary(operation));
    if (blockingOperations.length === 0) return true;
    const labels = blockingOperations
      .map((operation) => `${operation.operationId}:${operation.state}`)
      .join(', ');
    const error = annotatedError(
      `Recovery operation ${operationId} is not isolated; another incomplete, unreadable, or orphan-risk journal exists (${labels}). Recovery may dispatch live bridge calls, so resolve or manually review the other journal first.`,
    );
    error.blockingOperations = blockingOperations;
    throw error;
  }

  async status() {
    const listTools = this.upstream.listTools?.bind(this.upstream);
    const launcherFingerprint = this.upstream.launcherFingerprint?.bind(this.upstream);
    if (listTools === undefined || launcherFingerprint === undefined) {
      throw new Error('The upstream client does not expose status and launcher probes.');
    }
    const tools = await listTools();
    const call = async (name: string): Promise<StatusProbe> => {
      if (!tools.some((tool) => tool.name === name)) return { available: false };
      try {
        const payload = extractToolPayload(await this.upstream.callTool(name, {}));
        return { available: true, payload: isUnknownRecord(payload) ? payload : {} };
      } catch (error) {
        return { available: true, error: serializeError(error) };
      }
    };
    const [health, bridge, dispatcher, facadeImplementation] = await Promise.all([
      call('easyeda_health_check'),
      call('easyeda_bridge_status'),
      call('easyeda_bridge_probe_methods'),
      this.controlFingerprintPromise,
    ]);
    const upstreamServer = this.upstream.serverInfo?.();
    let installedBundles;
    const readInstalledBundles = this.upstream.installedEasyedaBundles?.bind(this.upstream);
    try {
      installedBundles =
        readInstalledBundles === undefined
          ? { available: false, error: { message: 'Installed-bundle probe is unavailable.' } }
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
          version: health.payload?.['version'],
          node_version: health.payload?.['node_version'],
          bridge_connected: health.payload?.['bridge_connected'],
          easyeda_version: health.payload?.['easyeda_version'],
          extension_version: health.payload?.['extension_version'],
          extension_version_mismatch: health.payload?.['extension_version_mismatch'],
          registry_mismatch: health.payload?.['registry_mismatch'],
        },
      },
      bridge: {
        payload: {
          connected: bridge.payload?.['connected'],
          bridge_version: bridge.payload?.['bridge_version'],
          easyeda_version: bridge.payload?.['easyeda_version'],
          diagnostics: {
            method_registry_hash: isUnknownRecord(bridge.payload?.['diagnostics'])
              ? bridge.payload['diagnostics']['method_registry_hash']
              : undefined,
          },
        },
      },
      bridgeDispatcher: {
        payload: {
          source: dispatcher.payload?.['source'],
          dispatcher_build_id: dispatcher.payload?.['dispatcher_build_id'],
          total: dispatcher.payload?.['total'],
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
        exactReads: { enabled: true, level: 'private-version-pinned-read-only' },
        privateComponentWriter: {
          enabled: this.privateComponentWriterValidated,
          level: 'private-version-pinned',
          reason: this.privateComponentWriterValidated
            ? 'Connected sacrificial-board validation is recorded by this facade build.'
            : 'Runtime-disabled until a connected sacrificial-board test validates the installed modify path.',
        },
      },
      stableFingerprint,
    };
  }

  async context(): Promise<ExpectedContext> {
    const tool = await this.upstream.findTool?.('easyeda_execute');
    if (!tool) throw new Error('The upstream server does not expose easyeda_execute.');
    const result = await this.upstream.callTool(
      'easyeda_execute',
      { code: CONTEXT_PROBE_CODE, timeoutMs: 15000, confirmWrite: true },
      25000,
    );
    const payload = contextPayload(extractToolPayload(result));
    const projectUuid = payload?.project?.uuid ?? payload?.project?.projectUuid;
    const projectPath = payload?.project?.path;
    const documentUuid = payload?.document?.uuid ?? payload?.document?.documentUuid;
    const documentType = payload?.document?.documentType;
    const tabId = payload?.document?.tabId;
    if (
      typeof projectUuid !== 'string' ||
      projectUuid.length === 0 ||
      typeof projectPath !== 'string' ||
      projectPath.length === 0 ||
      typeof documentUuid !== 'string' ||
      documentUuid.length === 0 ||
      typeof tabId !== 'string' ||
      tabId.length === 0 ||
      !Number.isInteger(documentType) ||
      ![1, 2, 3, 4, 15].includes(documentType)
    ) {
      throw new Error(
        'EasyEDA context probe did not prove a nonempty project UUID/path, document UUID, active tab, and supported document type.',
      );
    }
    payload.project.path = normalizeEasyedaProjectPath(projectPath);
    if (documentType === 1) {
      const schematicUuid = payload?.schematic?.uuid ?? payload?.schematic?.documentUuid;
      if (schematicUuid !== documentUuid) {
        throw new Error('Schematic context UUID does not agree with the active document UUID.');
      }
      if (
        typeof payload.schematic?.tabId === 'string' &&
        payload.schematic.tabId.length > 0 &&
        payload.schematic.tabId !== tabId
      ) {
        throw new Error('Schematic context tab does not agree with the active document tab.');
      }
    }
    if (documentType === 3) {
      const pcbUuid = payload?.pcb?.uuid ?? payload?.pcb?.documentUuid;
      if (pcbUuid !== documentUuid) {
        throw new Error('PCB context UUID does not agree with the active document UUID.');
      }
      if (
        typeof payload.pcb?.tabId === 'string' &&
        payload.pcb.tabId.length > 0 &&
        payload.pcb.tabId !== tabId
      ) {
        throw new Error('PCB context tab does not agree with the active document tab.');
      }
    }
    return payload;
  }

  async projectContext() {
    const tool = await this.upstream.findTool?.('easyeda_execute');
    if (!tool) throw new Error('The upstream server does not expose easyeda_execute.');
    const result = await this.upstream.callTool(
      'easyeda_execute',
      { code: PROJECT_CONTEXT_PROBE_CODE, timeoutMs: 15000, confirmWrite: true },
      25000,
    );
    const payload = projectPayload(extractToolPayload(result));
    const projectUuid = payload?.project?.uuid ?? payload?.project?.projectUuid;
    if (
      typeof projectUuid !== 'string' ||
      projectUuid.length === 0 ||
      typeof payload?.project?.path !== 'string' ||
      payload.project.path.length === 0
    ) {
      throw new Error('EasyEDA project probe did not prove a UUID and .eprj2 path.');
    }
    normalizeEasyedaProjectPath(payload.project.path);
    return payload;
  }

  async assertProjectContext(expectedProject: ProjectContext): Promise<ProjectProbePayload> {
    const actual = await this.projectContext();
    const expected: UnknownRecord = structuredClone(expectedProject);
    delete expected['path'];
    assertSubset(actual.project, expected, 'Active EasyEDA project');
    if (
      normalizeEasyedaProjectPath(actual.project.path) !==
      normalizeEasyedaProjectPath(expectedProject.path)
    ) {
      throw new Error('Active EasyEDA project path does not match the expected .eprj2 database.');
    }
    return actual;
  }

  async assertContext(
    expectedContext: ExpectedContext,
    options: ContextOptions = {},
  ): Promise<ContextProbePayload> {
    const actual = contextPayload(await this.context());
    const expected: UnknownRecord = structuredClone(expectedContext);
    if (options.allowTabChange === true) {
      for (const key of ['document', 'pcb', 'schematic']) {
        const document = expected[key];
        if (isUnknownRecord(document)) delete document['tabId'];
      }
    }
    const project = expected['project'];
    if (isUnknownRecord(project)) delete project['path'];
    assertSubset(actual, expected, 'Active EasyEDA context');
    if (
      normalizeEasyedaProjectPath(actual.project.path) !==
      normalizeEasyedaProjectPath(expectedContext.project.path)
    ) {
      throw new Error('Active EasyEDA project path does not match the expected .eprj2 database.');
    }
    return actual;
  }

  async rebindAfterLifecycle(
    expectedContext: ExpectedContext,
    payload: unknown,
    label: string,
  ): Promise<ContextProbePayload> {
    const cleanContext = await this.assertContext(expectedContext, { allowTabChange: true });
    const payloadDocument = isUnknownRecord(payload) ? payload['document'] : undefined;
    const payloadTabId = isUnknownRecord(payloadDocument) ? payloadDocument['tabId'] : undefined;
    if (typeof payloadTabId !== 'string' || payloadTabId.length === 0) {
      throw new Error(`${label} did not report the reopened tabId.`);
    }
    if (cleanContext.document.tabId !== payloadTabId) {
      throw new Error(`${label} reopened tab does not match the active context tab.`);
    }
    expectedContext.document.tabId = payloadTabId;
    if (expectedContext.pcb && expectedContext.document.documentType === 3) {
      expectedContext.pcb.tabId = payloadTabId;
    }
    if (expectedContext.schematic && expectedContext.document.documentType === 1) {
      expectedContext.schematic.tabId = payloadTabId;
    }
    return cleanContext;
  }

  async activateAndRebindRecoveryTarget(
    operation: OperationJournal,
    resumeState: string,
  ): Promise<ContextProbePayload> {
    await this.assertProjectContext(operation.plan.expectedContext.project);
    const source = buildActivateRecoveryTargetCode(operation.plan.expectedContext);
    const sourceSha256 = sha256Text(source);
    const acceptedRestartBoundary = operation.runtimeRestartBoundary
      ? structuredClone(operation.runtimeRestartBoundary)
      : undefined;
    if (!Object.hasOwn(operation, 'recoveryActivationResumeState')) {
      operation.recoveryActivationResumeState = resumeState;
    }
    if (!Object.hasOwn(operation, 'recoveryActivationPriorUnknownPhase')) {
      operation.recoveryActivationPriorUnknownPhase = operation.unknownPhase ?? null;
    }
    operation.state = 'recovery-target-activation-dispatching';
    operation.hardStop = true;
    operation.mutationMayHaveOccurred = true;
    operation.nextSafeAction =
      'Wait for recovery target activation. Do not overlap it with another activation or exact proof.';
    operation.updatedAt = now();
    await updateOperation(operation);
    try {
      await this.markOrphanedCallRisk(operation, 'recovery-target-activation');
      const raw = await this.upstream.callTool(
        'easyeda_execute',
        { code: source, timeoutMs: 30000, confirmWrite: true },
        40000,
      );
      await this.clearOrphanedCallRisk(operation, 'recovery-target-activation');
      const payload = extractToolPayload(raw);
      assertSubset(
        payload,
        { ok: true, kind: 'activate-recovery-target' },
        'Recovery target activation',
      );
      const reboundContext = await this.rebindAfterLifecycle(
        operation.plan.expectedContext,
        payload,
        'Recovery target activation',
      );
      operation.context = reboundContext;
      operation.planHash = buildPlanHash(operation.plan);
      if (acceptedRestartBoundary) {
        acceptedRestartBoundary['contextReboundAt'] = now();
        acceptedRestartBoundary['reboundTabId'] = reboundContext.document.tabId;
        operation.runtimeRestartBoundary = acceptedRestartBoundary;
      }
      operation.sequence += 1;
      const artifact = await writePhaseArtifact(
        operation.operationId,
        operation.sequence,
        `recovery-target-rebind-${Date.now()}`,
        { sourceSha256, payload, context: reboundContext, planHash: operation.planHash },
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
      operation.nextSafeAction = 'Continue the exact recovery classification on the rebound target.';
      operation.updatedAt = now();
      await updateOperation(operation);
      return reboundContext;
    } catch (error) {
      operation.state = 'recovery-target-activation-unknown';
      operation.hardStop = true;
      operation.mutationMayHaveOccurred = true;
      operation.unknownPhase = 'recovery-target-activation';
      operation.nextSafeAction =
        'Do not retry or start exact proof while target activation may still complete. Use recovery again only after the current nonce-bound restart gate when orphanedCallPossible is true.';
      operation.lastError = serializeError(error);
      operation.updatedAt = now();
      await updateOperation(operation);
      throw error;
    }
  }

  async exactRead(
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
    const executeOnce = async () => {
      await this.assertContext(boundContext);
      const raw = await this.upstream.callTool(
        'easyeda_execute',
        { code: guardedSource, timeoutMs: 60000, confirmWrite: true },
        70000,
      );
      const payload = proofPayload(validateExactReadPayload(extractToolPayload(raw), parsed));
      await this.assertContext(boundContext);
      return payload;
    };
    const first = await executeOnce();
    const second = await executeOnce();
    const firstHash = sha256Json(first);
    const secondHash = sha256Json(second);
    if (firstHash !== secondHash) {
      const error = annotatedError(
        'Facade-owned exact read changed between two consecutive observations; no stable design proof was produced.',
      );
      error.mismatches = [{ pointer: '/', expected: firstHash, actual: secondHash }];
      throw error;
    }
    return {
      ...second,
      read_consistency: {
        stable: true,
        attempts: 2,
        snapshotSha256: secondHash,
        contextBinding: {
          level: 'active-context-stability-required',
          preAndPostChecked: true,
          switchAwayAndBackDetectable: false,
        },
      },
    };
  }

  async invokeSpec(
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
      const payload = await this.exactRead(exactRequest, expectedContext, options);
      const assertions = assertAssertions(payload, spec.assertions, spec.toolName);
      return {
        toolName: spec.toolName,
        payload,
        assertions,
      };
    }
    if (exactComponentMutation !== undefined) {
      if (!Array.isArray(options.targetChanges) || options.targetChanges.length === 0) {
        throw new Error('Facade-generated component mutation has no journal-bound targetChanges.');
      }
      await this.assertContext(expectedContext);
      const source = buildComponentMutationCode(
        expectedContext.document.documentType,
        options.targetChanges,
        exactComponentMutation.state,
      );
      const guarded = wrapWithContextGuard(source, expectedContext);
      if (typeof options.beforeDispatch === 'function') await options.beforeDispatch();
      const raw = await this.upstream.callTool(
        'easyeda_execute',
        { code: guarded, timeoutMs: 60000, confirmWrite: true },
        70000,
      );
      if (typeof options.afterDispatch === 'function') await options.afterDispatch();
      const payload = extractToolPayload(raw);
      assertSubset(
        payload,
        {
          ok: true,
          kind: 'exact-component-mutation',
          state: exactComponentMutation.state,
          documentType: expectedContext.document.documentType,
        },
        'Facade-generated component mutation',
      );
      const assertions = assertAssertions(payload, spec.assertions, spec.toolName);
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
    for (const key of ['projectId', 'projectUuid']) {
      if (args[key] !== undefined && args[key] !== expectedProjectUuid) {
        throw new Error(`${spec.toolName} arguments.${key} does not match the proven project UUID.`);
      }
    }
    for (const key of ['documentId', 'documentUuid', 'schematicUuid', 'pcbUuid']) {
      if (args[key] !== undefined && args[key] !== expectedDocumentUuid) {
        throw new Error(`${spec.toolName} arguments.${key} does not match the proven document UUID.`);
      }
    }
    if (args['tabId'] !== undefined && args['tabId'] !== activeContext.document.tabId) {
      throw new Error(`${spec.toolName} arguments.tabId does not match the active proven tab.`);
    }
    if (
      spec.toolName !== 'easyeda_execute' &&
      expectedKind === 'mutate-unsaved' &&
      !['projectId', 'projectUuid', 'documentId', 'documentUuid', 'schematicUuid', 'pcbUuid', 'tabId'].some(
        (key) => args[key] !== undefined,
      ) &&
      ACTIVE_DOCUMENT_WRITE_ALLOWLIST
        .get(expectedContext.document.documentType)
        ?.has(spec.toolName) !== true
    ) {
      throw new Error(
        `${spec.toolName} has no exact project/document target argument and cannot be used for guarded mutation. Add a constrained facade writer instead.`,
      );
    }

    if (spec.toolName === 'easyeda_execute') {
      const code = args['code'];
      if (typeof code !== 'string') {
        throw new TypeError('easyeda_execute arguments.code must be a string.');
      }
      const guarded = wrapWithContextGuard(code, expectedContext);
      args['code'] = guarded;
      transmittedSourceSha256 = sha256Text(guarded);
    }

    const timeoutMs =
      spec.toolName === 'easyeda_execute'
        ? Math.min(70000, Number(args['timeoutMs'] ?? 15000) + 10000)
        : 70000;
    if (expectedKind === 'mutate-unsaved' && typeof options.beforeDispatch === 'function') {
      await options.beforeDispatch();
    }
    const raw = await this.upstream.callTool(spec.toolName, args, timeoutMs);
    if (expectedKind === 'mutate-unsaved' && typeof options.afterDispatch === 'function') {
      await options.afterDispatch();
    }
    const payload = extractToolPayload(raw);
    const assertions = assertAssertions(payload, spec.assertions, spec.toolName);
    await this.assertContext(expectedContext, options);
    return {
      toolName: spec.toolName,
      payload,
      assertions,
      sourceSha256: spec.sourceSha256,
      transmittedSourceSha256,
    };
  }

  async validateSpec(
    spec: ToolCallSpec,
    expectedKind: ExpectedCallKind,
    expectedContext: ExpectedContext,
  ): Promise<ValidatedSpec> {
    if (spec.toolName === 'easyeda_execute') {
      throw new Error(
        'Guarded mutation plans reject caller-supplied JavaScript in every phase. Use the facade-generated exact component mutation.',
      );
    }
    if (spec.toolName === 'easyeda_control_exact_read') {
      if (expectedKind !== 'read') {
        throw new Error('easyeda_control_exact_read can only be used as a read.');
      }
      return {
        tool: {
          name: spec.toolName,
          annotations: { readOnlyHint: true, idempotentHint: true },
        },
        classification: { readOnly: true, write: false, hasConfirmWrite: false, idempotent: true },
        exactRequest: validateExactReadRequest(spec.arguments, expectedContext),
      };
    }
    if (spec.toolName === EXACT_COMPONENT_MUTATION_TOOL) {
      if (expectedKind !== 'mutate-unsaved') {
        throw new Error(`${EXACT_COMPONENT_MUTATION_TOOL} can only be used as an unsaved mutation.`);
      }
      const callArguments = spec.arguments ?? {};
      const keys = Object.keys(callArguments).toSorted();
      const state = callArguments['state'];
      if (
        canonicalJson(keys) !== canonicalJson(['state']) ||
        (state !== 'before' && state !== 'after')
      ) {
        throw new Error(`${EXACT_COMPONENT_MUTATION_TOOL} requires only arguments.state=before|after.`);
      }
      if ((spec.assertions ?? []).length > 0) {
        throw new Error(`${EXACT_COMPONENT_MUTATION_TOOL} cannot substitute inline assertions for exact phase verification.`);
      }
      return {
        tool: { name: spec.toolName, annotations: { destructiveHint: true } },
        classification: { readOnly: false, write: true, hasConfirmWrite: true, idempotent: true },
        exactComponentMutation: { state },
      };
    }
    const tool = await this.upstream.findTool?.(spec.toolName);
    if (!tool) throw new Error(`Unknown upstream EasyEDA tool: ${spec.toolName}`);
    if (spec.toolName !== 'easyeda_execute' && DEDICATED_FACADE_NAME.test(spec.toolName)) {
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
    if (expectedKind === 'read') {
      throw new Error(
        `${spec.toolName} is not admitted as mutation proof. Guarded plans accept only facade-owned easyeda_control_exact_read calls in preflight, live verification, and reopened verification.`,
      );
    } else {
      if (!classification.write) {
        throw new Error(`${spec.toolName} is not classified as a write upstream tool.`);
      }
      if (
        ACTIVE_DOCUMENT_WRITE_ALLOWLIST
          .get(expectedContext.document.documentType)
          ?.has(spec.toolName) !== true
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

  async runSpecs(
    specs: ToolCallSpec[],
    expectedContext: ExpectedContext,
    expectedKind: ExpectedCallKind,
    options: InvokeOptions = {},
  ): Promise<SpecResult[]> {
    const results: SpecResult[] = [];
    for (const spec of specs) {
      results.push(await this.invokeSpec(spec, expectedContext, expectedKind, options));
    }
    return results;
  }

  async plan(plan: unknown, options: PlanOptions = {}) {
    this.requirePrivateComponentWriterEnabled();
    ensurePlanShape(plan);
    if (options.confirmDiscardAnyUnsavedState !== true) {
      throw new Error(
        'A mutation plan must first close/reopen the target without saving to bind its live baseline to the project database. Set confirmDiscardAnyUnsavedState=true only after authorizing discard of any unsaved target-document state.',
      );
    }
    const operations = asOperationJournals(await listOperations());
    const unfinished = operations.filter((operation) => !isTerminalOperation(operation));
    if (unfinished.length > 0) {
      throw new Error(
        `An incomplete EasyEDA operation already exists: ${unfinished
          .map((operation) => operation.operationId)
          .join(', ')}. Recover it before planning another mutation.`,
      );
    }

    if (
      [
        ...plan.preflightCalls,
        plan.applyCall,
        ...plan.verifyCalls,
        ...plan.rollbackCalls,
        ...plan.reopenedVerifyCalls,
      ].some((spec) => spec.toolName === 'easyeda_execute')
    ) {
      throw new Error(
        'Guarded mutation plans do not accept caller-supplied JavaScript. Apply and rollback use the facade-generated exact component mutation only.',
      );
    }
    for (const spec of plan.preflightCalls) {
      await this.validateSpec(spec, 'read', plan.expectedContext);
    }
    await this.validateSpec(plan.applyCall, 'mutate-unsaved', plan.expectedContext);
    for (const spec of plan.verifyCalls) {
      await this.validateSpec(spec, 'read', plan.expectedContext);
    }
    for (const spec of plan.rollbackCalls) {
      await this.validateSpec(spec, 'mutate-unsaved', plan.expectedContext);
    }
    for (const spec of plan.reopenedVerifyCalls) {
      await this.validateSpec(spec, 'read', plan.expectedContext);
    }

    const status = await this.status();
    assertSubset(
      runtimeFingerprint(status),
      plan.expectedFingerprint,
      'EasyEDA runtime fingerprint',
    );
    const context = await this.assertContext(plan.expectedContext);
    const preCheckpoint = await createCheckpoint({
      ...plan.checkpoint,
      label: `pre-${plan.checkpoint.label}`,
    });
    const checkpointVerification = await verifyCheckpoint(preCheckpoint.receiptPath);
    if (!checkpointVerification.ok) throw new Error('Pre-mutation checkpoint verification failed.');

    const operationId = newOperationId();
    const createdAt = now();
    const operation: OperationJournal = {
      schema: OPERATION_SCHEMA,
      operationId,
      journalPath: operationPath(operationId),
      planHash: buildPlanHash(plan),
      plan,
      state: 'baseline-reopen-dispatching',
      mutationState: 'none',
      saved: false,
      reopened: false,
      orphanedCallPossible: false,
      baselineDiscardAuthorized: true,
      hardStop: true,
      mutationMayHaveOccurred: true,
      nextSafeAction:
        'Wait for the baseline close/reopen-without-save. Never repeat an uncertain lifecycle call.',
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
    const checkpointArtifact = await writePhaseArtifact(operationId, 0, 'baseline-checkpoint', {
      context,
      preCheckpoint,
      checkpointVerification,
    });
    operation.artifacts.push(checkpointArtifact);
    await updateOperation(operation);

    try {
      await this.assertStoredRuntime(operation, 'baseline-reopen');
      const repeatedCheckpointVerification = await verifyCheckpoint(
        operation.preCheckpoint.receiptPath,
      );
      if (!repeatedCheckpointVerification.ok) {
        throw new Error('The durable database changed before baseline reopen dispatch.');
      }
      const source = buildReopenOnlyCode(plan.expectedContext);
      const sourceSha256 = sha256Text(source);
      await this.markOrphanedCallRisk(operation, 'baseline-reopen');
      const raw = await this.upstream.callTool(
        'easyeda_execute',
        { code: source, timeoutMs: 60000, confirmWrite: true },
        70000,
      );
      await this.clearOrphanedCallRisk(operation, 'baseline-reopen');
      const payload = extractToolPayload(raw);
      assertSubset(
        payload,
        { ok: true, saved: false, closed: true, reopened: true },
        'Baseline reopen-only result',
      );
      const cleanContext = await this.rebindAfterLifecycle(
        plan.expectedContext,
        payload,
        'Baseline reopen-only result',
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
      operation.state = 'baseline-reopened';
      operation.hardStop = false;
      operation.mutationMayHaveOccurred = false;
      operation.nextSafeAction = 'Run target-bound preflight against the clean durable baseline.';
      operation.updatedAt = now();
      await updateOperation(operation);
    } catch (error) {
      operation.state = 'baseline-reopen-unknown';
      operation.mutationState = 'none';
      operation.hardStop = true;
      operation.mutationMayHaveOccurred = true;
      operation.unknownPhase = 'baseline-reopen';
      operation.nextSafeAction =
        'Do not retry the lifecycle call. Verify the intact pre-checkpoint and invalidate this plan through recovery.';
      operation.lastError = serializeError(error);
      operation.updatedAt = now();
      await updateOperation(operation);
      throw error;
    }

    try {
      await this.assertStoredRuntime(operation, 'baseline-preflight');
      const preflight = await this.runSpecs(
        plan.preflightCalls,
        plan.expectedContext,
        'read',
      );
      const exactBaselineInvariants = baselineInvariants(preflight, plan);
      const baselineHash = snapshotHash(preflight);
      const finalCheckpointVerification = await verifyCheckpoint(
        operation.preCheckpoint.receiptPath,
      );
      if (!finalCheckpointVerification.ok) {
        throw new Error(
          'The durable database changed between the pre-checkpoint, baseline reopen, and preflight.',
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
      operation.state = 'preflight-proven';
      operation.hardStop = false;
      operation.mutationMayHaveOccurred = false;
      operation.nextSafeAction = 'Call easyeda_control_apply with this operationId and planHash.';
      operation.updatedAt = now();
      await updateOperation(operation);
      return operationSummary(operation);
    } catch (error) {
      operation.state = 'plan-invalidated';
      operation.mutationState = 'none';
      operation.hardStop = false;
      operation.mutationMayHaveOccurred = false;
      operation.nextSafeAction =
        'No planned mutation was dispatched. Resolve the read or durable-baseline failure before creating a new plan.';
      operation.lastError = serializeError(error);
      operation.updatedAt = now();
      await updateOperation(operation);
      throw error;
    }
  }

  async apply(operationId: string, planHash: string) {
    this.requirePrivateComponentWriterEnabled();
    const operation = asOperationJournal(await loadOperation(operationId));
    if (operation.state !== 'preflight-proven') {
      throw new Error(`Operation ${operationId} is in state ${operation.state}, not preflight-proven.`);
    }
    if (operation.planHash !== planHash) throw new Error('planHash does not match the journal.');
    assertSubset(
      runtimeFingerprint(await this.status()),
      operation.plan.expectedFingerprint,
      'EasyEDA runtime fingerprint',
    );
    let preCheckpointVerification;
    try {
      preCheckpointVerification = await verifyCheckpoint(operation.preCheckpoint.receiptPath);
      if (!preCheckpointVerification.ok) {
        throw new Error('The durable project database no longer matches the pre-checkpoint.');
      }
    } catch (error) {
      operation.state = 'plan-invalidated';
      operation.mutationState = 'none';
      operation.hardStop = false;
      operation.mutationMayHaveOccurred = false;
      operation.nextSafeAction =
        'This plan ended without applying. Create a fresh checkpoint and preflight before replanning.';
      operation.lastError = serializeError(error);
      operation.updatedAt = now();
      await updateOperation(operation);
      throw new Error(
        'The project database changed or its checkpoint proof failed after planning; no mutation was applied.',
        { cause: error },
      );
    }
    await this.assertContext(operation.plan.expectedContext);
    const repeated = await this.runSpecs(
      operation.plan.preflightCalls,
      operation.plan.expectedContext,
      'read',
    );
    const repeatedHash = snapshotHash(repeated);
    const repeatedInvariants = baselineInvariants(repeated, operation.plan);
    if (repeatedHash !== operation.baselineHash) {
      const error = new Error('Preflight state changed after planning; no mutation was applied.');
      operation.state = 'plan-invalidated';
      operation.mutationState = 'none';
      operation.hardStop = false;
      operation.mutationMayHaveOccurred = false;
      operation.nextSafeAction = 'Run a fresh read-only preflight and create a new plan.';
      operation.lastError = serializeError(error);
      operation.updatedAt = now();
      await updateOperation(operation);
      throw error;
    }
    if (canonicalJson(repeatedInvariants) !== canonicalJson(operation.baselineInvariants)) {
      throw new Error('Exact baseline invariants changed after planning; no mutation was applied.');
    }

    try {
      const immediateCheckpointVerification = await verifyCheckpoint(
        operation.preCheckpoint.receiptPath,
      );
      if (!immediateCheckpointVerification.ok) {
        throw new Error('The durable database changed during repeated preflight.');
      }
    } catch (error) {
      operation.state = 'plan-invalidated';
      operation.mutationState = 'none';
      operation.hardStop = false;
      operation.mutationMayHaveOccurred = false;
      operation.nextSafeAction =
        'No mutation was dispatched. Recreate the durable checkpoint and plan from fresh state.';
      operation.lastError = serializeError(error);
      operation.updatedAt = now();
      await updateOperation(operation);
      throw new Error('The durable baseline changed during preflight; no mutation was applied.', {
        cause: error,
      });
    }

    try {
      assertSubset(
        runtimeFingerprint(await this.status()),
        operation.plan.expectedFingerprint,
        'EasyEDA runtime fingerprint',
      );
    } catch (error) {
      operation.state = 'plan-invalidated';
      operation.mutationState = 'none';
      operation.hardStop = false;
      operation.mutationMayHaveOccurred = false;
      operation.nextSafeAction =
        'No mutation was dispatched. Restore the intended runtime, then create a fresh plan and checkpoint.';
      operation.lastError = serializeError(error);
      operation.updatedAt = now();
      await updateOperation(operation);
      throw new Error('The runtime fingerprint changed during preflight; no mutation was applied.', {
        cause: error,
      });
    }

    operation.state = 'applying';
    operation.hardStop = true;
    operation.mutationMayHaveOccurred = true;
    operation.nextSafeAction = 'Wait for the apply call. Do not retry after a timeout.';
    operation.updatedAt = now();
    await updateOperation(operation);
    try {
      const result = await this.invokeSpec(
        operation.plan.applyCall,
        operation.plan.expectedContext,
        'mutate-unsaved',
        {
          targetChanges: operation.plan.targetChanges,
          beforeDispatch: async () => {
            await this.requireDurableBaselineBeforeDispatch(operation, 'apply', {
              state: 'plan-invalidated',
              mutationState: 'none',
              hardStop: false,
              mutationMayHaveOccurred: false,
              nextSafeAction:
                'No apply was dispatched. Recreate the durable checkpoint and exact plan from fresh state.',
            });
            await this.markOrphanedCallRisk(operation, 'apply');
          },
          afterDispatch: async () => {
            await this.clearOrphanedCallRisk(operation, 'apply');
          },
        },
      );
      let durableVerification;
      let durableVerificationError;
      try {
        durableVerification = await verifyCheckpoint(operation.preCheckpoint.receiptPath);
      } catch (error) {
        durableVerificationError = serializeError(error);
      }
      operation.sequence += 1;
      const artifact = await writePhaseArtifact(operationId, operation.sequence, 'apply', {
        result,
        durableVerification,
        durableVerificationError,
      });
      operation.artifacts.push(artifact);
      if (durableVerification?.ok !== true) {
        const error = annotatedError(
          'The apply call returned, but the durable database no longer matches the pre-checkpoint; the edit cannot be classified as unsaved.',
        );
        error.journalStateRecorded = true;
        operation.state = 'durable-baseline-drift';
        operation.mutationState = 'unknown';
        operation.hardStop = true;
        operation.mutationMayHaveOccurred = true;
        operation.unknownPhase = 'apply-durable-baseline';
        operation.nextSafeAction =
          'Do not retry or save. Inspect the durable project, live document, apply artifact, and pre-checkpoint before recovery.';
        operation.lastError = durableVerificationError ?? serializeError(error);
        operation.updatedAt = now();
        await updateOperation(operation);
        throw error;
      }
      operation.state = 'applied-unsaved';
      operation.mutationState = 'applied-unsaved';
      operation.hardStop = false;
      operation.mutationMayHaveOccurred = true;
      operation.nextSafeAction = 'Call easyeda_control_verify. Do not save manually.';
      operation.updatedAt = now();
      await updateOperation(operation);
      return operationSummary(operation);
    } catch (error) {
      if (errorMetadata(error)?.journalStateRecorded === true) throw error;
      operation.state = 'unknown';
      operation.mutationState = 'unknown';
      operation.hardStop = true;
      operation.mutationMayHaveOccurred = true;
      operation.unknownPhase = 'apply';
      operation.nextSafeAction =
        'Do not retry or save. Use easyeda_control_recover_incomplete to reconcile the stored plan.';
      operation.lastError = serializeError(error);
      operation.updatedAt = now();
      await updateOperation(operation);
      throw error;
    }
  }

  async verify(operationId: string) {
    const operation = asOperationJournal(await loadOperation(operationId));
    if (operation.state !== 'applied-unsaved') {
      throw new Error(`Operation ${operationId} is in state ${operation.state}, not applied-unsaved.`);
    }
    await this.assertStoredRuntime(operation, 'verify');
    try {
      await this.assertContext(operation.plan.expectedContext);
      const results = await this.runSpecs(
        operation.plan.verifyCalls,
        operation.plan.expectedContext,
        'read',
      );
      const combined = results.map((result) => result.payload);
      const exactInvariantProof = verifyPhaseInvariants(
        results,
        operation,
        'Live verification',
      );
      const aggregateAssertions = assertAssertions(
        combined,
        operation.plan.verifyAssertions,
        'Live verification',
      );
      let durableVerification;
      let durableVerificationError;
      try {
        durableVerification = await verifyCheckpoint(operation.preCheckpoint.receiptPath);
      } catch (error) {
        durableVerificationError = serializeError(error);
      }
      operation.sequence += 1;
      const artifact = await writePhaseArtifact(operationId, operation.sequence, 'verify-live', {
        results,
        exactInvariantProof,
        aggregateAssertions,
        durableVerification,
        durableVerificationError,
      });
      operation.artifacts.push(artifact);
      if (durableVerification?.ok !== true) {
        const error = annotatedError(
          'Live assertions passed, but the durable database no longer matches the pre-checkpoint; live state cannot be classified as verified-unsaved.',
        );
        error.journalStateRecorded = true;
        operation.state = 'durable-baseline-drift';
        operation.mutationState = 'unknown';
        operation.hardStop = true;
        operation.mutationMayHaveOccurred = true;
        operation.unknownPhase = 'verify-durable-baseline';
        operation.nextSafeAction =
          'Do not save. Inspect the durable project, live document, verification artifact, and pre-checkpoint before recovery.';
        operation.lastError = durableVerificationError ?? serializeError(error);
        operation.updatedAt = now();
        await updateOperation(operation);
        throw error;
      }
      operation.state = 'live-verified';
      operation.hardStop = false;
      operation.nextSafeAction =
        'Call easyeda_control_save_reopen to persist, or easyeda_control_rollback to cancel after a fresh desired-state and durable-baseline proof.';
      operation.updatedAt = now();
      await updateOperation(operation);
      return operationSummary(operation);
    } catch (error) {
      if (errorMetadata(error)?.journalStateRecorded === true) throw error;
      operation.state = 'verification-failed';
      operation.hardStop = true;
      operation.nextSafeAction =
        'Do not save. Call easyeda_control_rollback, or inspect before choosing recovery.';
      operation.lastError = serializeError(error);
      operation.updatedAt = now();
      await updateOperation(operation);
      throw error;
    }
  }

  async rollback(operationId: string, planHash: string) {
    this.requirePrivateComponentWriterEnabled();
    const operation = asOperationJournal(await loadOperation(operationId));
    if (!['applied-unsaved', 'verification-failed', 'live-verified'].includes(operation.state)) {
      throw new Error(
        `Operation ${operationId} cannot roll back safely from state ${operation.state}. Reconcile unknown state first.`,
      );
    }
    if (operation.planHash !== planHash) throw new Error('planHash does not match the journal.');
    await this.assertStoredRuntime(operation, 'rollback');
    await this.assertContext(operation.plan.expectedContext);
    operation.state = 'rolling-back';
    operation.hardStop = true;
    operation.mutationMayHaveOccurred = true;
    operation.nextSafeAction = 'Wait for exact rollback verification.';
    operation.updatedAt = now();
    await updateOperation(operation);
    try {
      const rollback = await this.runSpecs(
        operation.plan.rollbackCalls,
        operation.plan.expectedContext,
        'mutate-unsaved',
        {
          targetChanges: operation.plan.targetChanges,
          beforeDispatch: async () => {
            let desiredResults;
            let exactInvariantProof;
            let aggregateAssertions;
            try {
              desiredResults = await this.runSpecs(
                operation.plan.verifyCalls,
                operation.plan.expectedContext,
                'read',
              );
              exactInvariantProof = verifyPhaseInvariants(
                desiredResults,
                operation,
                'Rollback pre-dispatch desired-state proof',
              );
              aggregateAssertions = assertAssertions(
                desiredResults.map((result) => result.payload),
                operation.plan.verifyAssertions,
                'Rollback pre-dispatch desired-state proof',
              );
            } catch (cause) {
              const error = annotatedError(
                'Rollback was not dispatched because fresh exact readback could not prove the complete intended unsaved state.',
                { cause },
              );
              error.journalStateRecorded = true;
              operation.state = 'verification-failed';
              operation.mutationState = 'unknown';
              operation.hardStop = true;
              operation.mutationMayHaveOccurred = true;
              operation.nextSafeAction =
                'Do not save or apply an inverse. Reconcile the live state before another rollback attempt.';
              operation.lastError = serializeError(error);
              operation.updatedAt = now();
              await updateOperation(operation);
              throw error;
            }
            const durableVerification = await this.requireDurableBaselineBeforeDispatch(
              operation,
              'rollback',
              {
                state: 'durable-baseline-drift',
                mutationState: 'unknown',
                hardStop: true,
                mutationMayHaveOccurred: true,
                nextSafeAction:
                  'Do not save or dispatch the inverse. Inspect the changed durable project, live desired state, and pre-checkpoint before recovery.',
              },
            );
            operation.sequence += 1;
            const proofArtifact = await writePhaseArtifact(
              operationId,
              operation.sequence,
              `rollback-pre-dispatch-${Date.now()}`,
              { desiredResults, exactInvariantProof, aggregateAssertions, durableVerification },
            );
            operation.artifacts.push(proofArtifact);
            operation.updatedAt = now();
            await updateOperation(operation);
            await this.requireDurableBaselineBeforeDispatch(operation, 'rollback', {
              state: 'durable-baseline-drift',
              mutationState: 'unknown',
              hardStop: true,
              mutationMayHaveOccurred: true,
              nextSafeAction:
                'Do not save or dispatch the inverse. Inspect the changed durable project, live desired state, and pre-checkpoint before recovery.',
            });
            await this.markOrphanedCallRisk(operation, 'rollback');
          },
          afterDispatch: async () => {
            await this.clearOrphanedCallRisk(operation, 'rollback');
          },
        },
      );
      const baseline = await this.runSpecs(
        operation.plan.preflightCalls,
        operation.plan.expectedContext,
        'read',
      );
      const restoredInvariants = baselineInvariants(baseline, operation.plan);
      const restoredHash = snapshotHash(baseline);
      if (restoredHash !== operation.baselineHash) {
        throw new Error('Rollback calls completed, but the exact baseline hash was not restored.');
      }
      if (canonicalJson(restoredInvariants) !== canonicalJson(operation.baselineInvariants)) {
        throw new Error('Rollback calls completed, but exact baseline invariants were not restored.');
      }
      const durableVerification = await verifyCheckpoint(operation.preCheckpoint.receiptPath);
      if (!durableVerification.ok) {
        throw new Error(
          'Live rollback restored the baseline, but the durable database no longer matches the pre-checkpoint.',
        );
      }
      operation.sequence += 1;
      const artifact = await writePhaseArtifact(operationId, operation.sequence, 'rollback', {
        rollback,
        restoredHash,
        restoredInvariants,
        durableVerification,
      });
      operation.artifacts.push(artifact);
      operation.state = 'rolled-back';
      operation.mutationState = 'rolled-back';
      operation.hardStop = false;
      operation.mutationMayHaveOccurred = false;
      operation.nextSafeAction = 'Operation ended without saving. Review the journal before replanning.';
      operation.updatedAt = now();
      await updateOperation(operation);
      return operationSummary(operation);
    } catch (error) {
      if (errorMetadata(error)?.journalStateRecorded === true) throw error;
      operation.state = 'rollback-failed';
      operation.mutationState = 'unknown';
      operation.hardStop = true;
      operation.mutationMayHaveOccurred = true;
      operation.nextSafeAction = 'Do not save or retry. Reconcile the live document manually.';
      operation.lastError = serializeError(error);
      operation.updatedAt = now();
      await updateOperation(operation);
      throw error;
    }
  }

  async saveReopen(
    operationId: string,
    planHash: string,
    options: SaveReopenOptions = {},
  ) {
    this.requirePrivateComponentWriterEnabled();
    const operation = asOperationJournal(await loadOperation(operationId));
    if (operation.planHash !== planHash) throw new Error('planHash does not match the journal.');
    if (
      ![
        'live-verified',
        'reopened-verified',
        'final-reopened',
        'final-checkpoint-failed',
      ].includes(operation.state)
    ) {
      throw new Error(
        `Operation ${operationId} cannot save/reopen from state ${operation.state}. Live verification is required.`,
      );
    }
    const delayedFinalRetry = operation.state !== 'live-verified';
    await this.assertStoredRuntime(operation, 'save-reopen');

    if (operation.state === 'live-verified') {
      let preCheckpointVerification;
      try {
        preCheckpointVerification = await verifyCheckpoint(operation.preCheckpoint.receiptPath);
        if (!preCheckpointVerification.ok) {
          throw new Error('The durable project database no longer matches the pre-checkpoint.');
        }
      } catch (error) {
        operation.state = 'durable-baseline-drift';
        operation.mutationState = 'unknown';
        operation.hardStop = true;
        operation.mutationMayHaveOccurred = true;
        operation.nextSafeAction =
          'Do not save. The live unsaved edit and durable database no longer share the proven baseline; inspect both before recovery.';
        operation.lastError = serializeError(error);
        operation.updatedAt = now();
        await updateOperation(operation);
        throw new Error(
          'The durable project database changed or its checkpoint proof failed before save; persistence was refused.',
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
          'read',
        );
        const exactInvariantProof = verifyPhaseInvariants(
          preSaveResults,
          operation,
          'Immediate pre-save verification',
        );
        const preSaveAssertions = assertAssertions(
          preSaveResults.map((result) => result.payload),
          operation.plan.verifyAssertions,
          'Immediate pre-save live verification',
        );
        try {
          preSaveDurableVerification = await verifyCheckpoint(
            operation.preCheckpoint.receiptPath,
          );
        } catch (error) {
          preSaveDurableError = serializeError(error);
        }
        if (preSaveDurableVerification?.ok !== true) {
          const error = annotatedError(
            'The durable project changed while the immediate pre-save verifier was running.',
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
        operation.state = 'saving';
        operation.hardStop = true;
        operation.mutationMayHaveOccurred = true;
        operation.nextSafeAction = 'Wait. Never retry an uncertain save automatically.';
        operation.updatedAt = now();
        await updateOperation(operation);
      } catch (error) {
        operation.state = errorMetadata(error)?.durableBaselineFailure === true
          ? 'durable-baseline-drift'
          : 'pre-save-verification-failed';
        operation.mutationState = errorMetadata(error)?.durableBaselineFailure === true
          ? 'unknown'
          : 'applied-unsaved';
        operation.hardStop = true;
        operation.mutationMayHaveOccurred = true;
        operation.nextSafeAction = errorMetadata(error)?.durableBaselineFailure === true
          ? 'Do not save. The live edit and durable project no longer share the proven baseline; inspect before recovery.'
          : 'Do not save. Live state changed after verification; inspect it and use recovery to prove either the baseline or intended unsaved state.';
        operation.lastError = preSaveDurableError ?? serializeError(error);
        operation.updatedAt = now();
        await updateOperation(operation);
        throw error;
      }
      try {
        const source = buildSaveReopenCode(operation.plan.expectedContext);
        const guarded = wrapWithContextGuard(source, operation.plan.expectedContext);
        await this.requireDurableBaselineBeforeDispatch(operation, 'save-reopen', {
          state: 'durable-baseline-drift',
          mutationState: 'unknown',
          hardStop: true,
          mutationMayHaveOccurred: true,
          nextSafeAction:
            'Do not save. The live edit and durable project no longer share the proven baseline; inspect both before recovery.',
        });
        await this.markOrphanedCallRisk(operation, 'save-reopen');
        const raw = await this.upstream.callTool(
          'easyeda_execute',
          { code: guarded, timeoutMs: 60000, confirmWrite: true },
          70000,
        );
        await this.clearOrphanedCallRisk(operation, 'save-reopen');
        const payload = extractToolPayload(raw);
        assertSubset(payload, { ok: true, saved: true, reopened: true }, 'Save/reopen result');
        const reopenedContext = await this.rebindAfterLifecycle(
          operation.plan.expectedContext,
          payload,
          'Save/reopen result',
        );
        operation.context = reopenedContext;
        operation.planHash = buildPlanHash(operation.plan);
        operation.sequence += 1;
        const artifact = await writePhaseArtifact(operationId, operation.sequence, 'save-reopen', {
          sourceSha256: sha256Text(source),
          transmittedSourceSha256: sha256Text(guarded),
          payload,
          context: reopenedContext,
        });
        operation.artifacts.push(artifact);
        operation.state = 'document-saved';
        operation.mutationState = 'saved';
        operation.saved = true;
        operation.reopened = true;
        operation.updatedAt = now();
        await updateOperation(operation);
      } catch (error) {
        if (errorMetadata(error)?.journalStateRecorded === true) throw error;
        operation.state = 'unknown';
        operation.mutationState = 'unknown';
        operation.saved = false;
        operation.reopened = false;
        operation.hardStop = true;
        operation.mutationMayHaveOccurred = true;
        operation.unknownPhase = 'save-reopen';
        operation.nextSafeAction =
          'Do not retry. Reconcile whether save/close/reopen completed before any further action.';
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
          'read',
        );
        const exactInvariantProof = verifyPhaseInvariants(
          results,
          operation,
          'Reopened verification',
        );
        const aggregateAssertions = assertAssertions(
          results.map((result) => result.payload),
          operation.plan.reopenedAssertions,
          'Reopened verification',
        );
        let persistenceVerification;
        try {
          persistenceVerification = await verifyCheckpoint(operation.preCheckpoint.receiptPath);
        } catch (error) {
          persistenceVerificationError = serializeError(error);
        }
        operation.sequence += 1;
        const artifact = await writePhaseArtifact(
          operationId,
          operation.sequence,
          'verify-reopened',
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
            'Reopened assertions passed, but logical persistence relative to the intact pre-checkpoint was not proved.',
          );
          error.persistenceProofFailure = true;
          throw error;
        }
        operation.state = 'reopened-verified';
        operation.updatedAt = now();
        await updateOperation(operation);
      } catch (error) {
        operation.state = errorMetadata(error)?.persistenceProofFailure === true
          ? 'persistence-verification-failed'
          : 'reopen-verification-failed';
        operation.hardStop = true;
        operation.nextSafeAction =
          errorMetadata(error)?.persistenceProofFailure === true
            ? 'The document was saved and reopened, but a logical database change from the intact pre-checkpoint was not proved. Stop and inspect the persisted project.'
            : 'The document was saved but reopened state failed verification. Stop and inspect the persisted project.';
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
          'Delayed final verification must close/reopen without saving so it cannot certify later unsaved edits. Set confirmDiscardAnyUnsavedState=true only after authorizing discard of any unsaved target-document state.',
        );
      }
      const source = buildReopenOnlyCode(operation.plan.expectedContext);
      const sourceSha256 = sha256Text(source);
      operation.state = 'final-reopen-dispatching';
      operation.mutationState = 'saved';
      operation.hardStop = true;
      operation.mutationMayHaveOccurred = true;
      operation.nextSafeAction =
        'Wait for the delayed reopen-without-save. Never repeat it after an uncertain result; use recovery.';
      operation.updatedAt = now();
      await updateOperation(operation);
      try {
        await this.markOrphanedCallRisk(operation, 'final-reopen');
        const raw = await this.upstream.callTool(
          'easyeda_execute',
          { code: source, timeoutMs: 60000, confirmWrite: true },
          70000,
        );
        await this.clearOrphanedCallRisk(operation, 'final-reopen');
        const payload = extractToolPayload(raw);
        assertSubset(
          payload,
          { ok: true, saved: false, closed: true, reopened: true },
          'Delayed final reopen-only result',
        );
        const reopenedContext = await this.rebindAfterLifecycle(
          operation.plan.expectedContext,
          payload,
          'Delayed final reopen-only result',
        );
        operation.context = reopenedContext;
        operation.planHash = buildPlanHash(operation.plan);
        operation.sequence += 1;
        const artifact = await writePhaseArtifact(
          operationId,
          operation.sequence,
          `final-reopen-${Date.now()}`,
          { sourceSha256, transmittedSourceSha256: sourceSha256, payload, context: reopenedContext },
        );
        operation.artifacts.push(artifact);
        operation.state = 'final-reopened';
        operation.mutationState = 'saved';
        operation.saved = true;
        operation.reopened = true;
        operation.hardStop = false;
        operation.mutationMayHaveOccurred = false;
        operation.nextSafeAction =
          'Create a fresh candidate checkpoint and rerun checkpoint-bound reopened verification.';
        operation.updatedAt = now();
        await updateOperation(operation);
      } catch (error) {
        operation.state = 'final-reopen-unknown';
        operation.mutationState = 'unknown';
        operation.saved = false;
        operation.reopened = false;
        operation.hardStop = true;
        operation.mutationMayHaveOccurred = true;
        operation.unknownPhase = 'final-reopen';
        operation.nextSafeAction =
          'Do not repeat the reopen. Inspect current state and use explicitly confirmed saved-state recovery.';
        operation.lastError = serializeError(error);
        operation.updatedAt = now();
        await updateOperation(operation);
        throw error;
      }
    }

    try {
      const finalCheckpoint = await createCheckpoint({
        ...operation.plan.checkpoint,
        label: `post-${operation.plan.checkpoint.label}`,
      });
      operation.candidateFinalCheckpoint = finalCheckpoint;
      operation.updatedAt = now();
      await updateOperation(operation);
      await this.assertContext(operation.plan.expectedContext);
      const finalResults = await this.runSpecs(
        operation.plan.reopenedVerifyCalls,
        operation.plan.expectedContext,
        'read',
      );
      const exactInvariantProof = verifyPhaseInvariants(
        finalResults,
        operation,
        'Final checkpoint-bound reopened verification',
      );
      const finalAssertions = assertAssertions(
        finalResults.map((result) => result.payload),
        operation.plan.reopenedAssertions,
        'Final checkpoint-bound reopened verification',
      );
      const persistenceVerification = await verifyCheckpoint(
        operation.preCheckpoint.receiptPath,
      );
      if (
        !persistenceVerification.checkpointMatchesReceipt ||
        persistenceVerification.sourceEqualsCheckpoint
      ) {
        throw new Error(
          'Final verification did not prove a logical database change from the intact pre-checkpoint.',
        );
      }
      const checkpointVerification = await verifyCheckpoint(finalCheckpoint.receiptPath);
      if (!checkpointVerification.ok) {
        throw new Error(
          'The live database changed after the candidate final checkpoint or that checkpoint failed verification.',
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
        },
      );
      operation.artifacts.push(artifact);
      operation.finalCheckpoint = finalCheckpoint;
      operation.candidateFinalCheckpoint = undefined;
      operation.state = 'completed';
      operation.mutationState = 'saved';
      operation.saved = true;
      operation.reopened = true;
      operation.hardStop = false;
      operation.mutationMayHaveOccurred = false;
      operation.nextSafeAction = 'Operation completed. Preserve its journal and checkpoint receipts.';
      operation.updatedAt = now();
      await updateOperation(operation);
      return operationSummary(operation);
    } catch (error) {
      operation.state = 'final-checkpoint-failed';
      operation.hardStop = true;
      operation.nextSafeAction =
        'The document was not resaved, but final checkpoint-bound verification failed. Inspect the candidate receipt, then call save_reopen again to create a fresh candidate and rerun reopened proof.';
      operation.lastError = serializeError(error);
      operation.updatedAt = now();
      await updateOperation(operation);
      throw error;
    }
  }

  async recover(): Promise<OperationSummary[]>;
  async recover(
    operationId: string,
    resolution?: RecoveryResolution,
    options?: RecoverOptions,
  ): Promise<OperationSummary>;
  async recover(
    operationId: undefined,
    resolution?: RecoveryResolution,
    options?: RecoverOptions,
  ): Promise<OperationSummary[]>;
  async recover(
    operationId?: string  ,
    resolution?: RecoveryResolution  ,
    options: RecoverOptions = {},
  ): Promise<OperationSummary | OperationSummary[]> {
    if (operationId === undefined || operationId.length === 0) {
      return asOperationJournals(await listOperations())
        .filter((operation) => !isTerminalOperation(operation))
        .map((operation) => operationSummary(operation));
    }
    await this.assertRecoveryOperationIsolated(operationId);
    const operation = asOperationJournal(await loadOperation(operationId));
    if (isTerminalOperation(operation)) return operationSummary(operation);
    const recoveryStartState =
      operation.recoveryActivationResumeState ?? operation.state;
    const recoveryStartUnknownPhase =
      operation.recoveryActivationPriorUnknownPhase === null
        ? undefined
        : operation.recoveryActivationPriorUnknownPhase ?? operation.unknownPhase;
    const baselinePreparationStates = new Set([
      'baseline-reopen-dispatching',
      'baseline-reopen-unknown',
      'baseline-reopened',
    ]);

    const allowedStates = {
      'reconciled-no-mutation': new Set([
        ...baselinePreparationStates,
        'preflight-proven',
        'applying',
        'applied-unsaved',
        'live-verified',
        'unknown',
        'verification-failed',
        'pre-save-verification-failed',
        'rolling-back',
        'rollback-failed',
        'saving',
        'recovery-target-activation-dispatching',
        'recovery-target-activation-unknown',
        'durable-baseline-drift',
      ]),
      'reconciled-applied-unsaved': new Set([
        'applying',
        'applied-unsaved',
        'verification-failed',
        'pre-save-verification-failed',
        'rolling-back',
        'rollback-failed',
        'saving',
        'unknown',
        'recovery-target-activation-dispatching',
        'recovery-target-activation-unknown',
        'durable-baseline-drift',
      ]),
      'reconciled-saved-reopened': new Set([
        'saving',
        'document-saved',
        'reopen-verification-failed',
        'persistence-verification-failed',
        'reopened-verified',
        'final-reopen-dispatching',
        'final-reopen-unknown',
        'final-reopened',
        'final-checkpoint-failed',
        'recovery-reopen-dispatching',
        'recovery-reopen-unknown',
        'recovery-reopened',
        'recovery-verification-failed',
        'unknown',
      ]),
    };
    if (!resolution) throw new Error('A supported recovery resolution is required.');
    const allowed = allowedStates[resolution];
    if (!allowed.has(recoveryStartState)) {
      throw new Error(
        `Resolution ${resolution} is not legal from operation state ${recoveryStartState}.`,
      );
    }
    if (
      resolution === 'reconciled-saved-reopened' &&
      recoveryStartState === 'unknown' &&
      recoveryStartUnknownPhase !== 'save-reopen'
    ) {
      throw new Error(
        'An unknown apply cannot be reconciled as saved/reopened. First prove whether the unsaved apply occurred.',
      );
    }

    if (operationHasOrphanedCallRisk(operation)) {
      const requiredConfirmation = await this.ensureRuntimeRestartChallenge(operation);
      if (options.runtimeRestartConfirmation !== requiredConfirmation) {
        const error = annotatedError(
          'Recovery is blocked because a timed-out or disconnected EasyEDA call may still be running. A person must deliberately terminate EasyEDA Pro, restart it, reconnect the bridge, and provide the current nonce-bound runtimeRestartChallenge from the incomplete-operation summary as runtimeRestartConfirmation. If EasyEDA prompts about unsaved changes, never choose Save; discard or force-quit only with explicit authority and a still-valid clean-baseline/no-concurrent-edit assumption, otherwise cancel and preserve the session for manual review.',
        );
        error.requiredRuntimeRestartConfirmation = requiredConfirmation;
        error.orphanedCallPhase = operation.orphanedCallPhase ?? operation.unknownPhase;
        throw error;
      }
      await this.assertStoredRuntime(operation, 'recovery-runtime-restart-boundary');
      const attestedAt = now();
      operation.sequence += 1;
      const boundary = {
        attestedAt,
        challengeAttempt: operation.runtimeRestartChallengeAttempt,
        orphanedCallPhase: operation.orphanedCallPhase ?? operation.unknownPhase,
        confirmationSha256: sha256Text(requiredConfirmation),
        storedRuntimeFingerprintMatchedAfterReconnect: true,
        limitation:
          'Caller-attested EasyEDA Pro restart/reconnect boundary; the facade cannot independently prove process generation.',
      };
      operation.runtimeRestartBoundary = boundary;
      operation.unsavedStateDiscardedByRestart = true;
      operation.runtimeRestartChallengeConsumedAt = attestedAt;
      delete operation.runtimeRestartChallenge;
      delete operation.runtimeRestartChallengeIssuedAt;
      operation.updatedAt = now();
      // Persist consumption while the orphan-risk gate is still closed. If the
      // process stops before the next journal write, recovery issues a new
      // nonce instead of accepting this attestation again.
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
      await this.assertStoredRuntime(operation, 'recovery');
    }
    if (
      resolution === 'reconciled-applied-unsaved' &&
      operation.unsavedStateDiscardedByRestart === true
    ) {
      throw new Error(
        'Applied-unsaved recovery is illegal after the required EasyEDA restart/discard boundary. Prove the durable baseline with reconciled-no-mutation, or inspect manually if unsaved state was preserved contrary to the recovery contract.',
      );
    }
    if (
      resolution === 'reconciled-saved-reopened' &&
      [
        'final-reopen-dispatching',
        'final-reopen-unknown',
        'recovery-reopen-dispatching',
        'recovery-reopen-unknown',
      ].includes(operation.state) &&
      options.confirmRepeatAfterUnknownRecovery !== true
    ) {
      throw new Error(
        'The previous recovery reopen is uncertain. Inspect the journal, then set confirmRepeatAfterUnknownRecovery=true to authorize a newly journaled reconciliation attempt.',
      );
    }

    if (resolution === 'reconciled-saved-reopened') {
      await this.assertProjectContext(operation.plan.expectedContext.project);
    } else if (
      resolution === 'reconciled-no-mutation' &&
      baselinePreparationStates.has(operation.state)
    ) {
      await this.assertProjectContext(operation.plan.expectedContext.project);
    } else {
      await this.activateAndRebindRecoveryTarget(operation, recoveryStartState);
    }

    let preCheckpointVerification;
    try {
      preCheckpointVerification = await verifyCheckpoint(operation.preCheckpoint.receiptPath);
    } catch (error) {
      throw new Error('Stored pre-checkpoint integrity could not be proved; recovery is blocked.', {
        cause: error,
      });
    }

    let recoveryEvidence;

    if (resolution === 'reconciled-no-mutation') {
      if (!preCheckpointVerification.ok) {
        throw new Error(
          'The durable project no longer matches the pre-checkpoint; no-mutation recovery is impossible.',
        );
      }
      if (baselinePreparationStates.has(recoveryStartState)) {
        const finalPreCheckpointVerification = await verifyCheckpoint(
          operation.preCheckpoint.receiptPath,
        );
        if (!finalPreCheckpointVerification.ok) {
          throw new Error(
            'The durable project changed while the interrupted baseline preparation was being invalidated.',
          );
        }
        operation.state = 'plan-invalidated';
        operation.mutationState = 'none';
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
          'read',
        );
        const recoveredBaselineInvariants = baselineInvariants(
          baseline,
          operation.plan,
        );
        if (snapshotHash(baseline) !== operation.baselineHash) {
          throw new Error('Live state does not match the stored preflight baseline.');
        }
        if (
          canonicalJson(recoveredBaselineInvariants) !==
          canonicalJson(operation.baselineInvariants)
        ) {
          throw new Error('Live state does not match the stored exact baseline invariants.');
        }
        const finalPreCheckpointVerification = await verifyCheckpoint(
          operation.preCheckpoint.receiptPath,
        );
        if (!finalPreCheckpointVerification.ok) {
          throw new Error(
            'The durable project changed while no-mutation recovery was reading the live baseline.',
          );
        }
        operation.state = 'reconciled-no-mutation';
        operation.mutationState = 'none';
        operation.saved = false;
        operation.reopened = false;
        recoveryEvidence = {
          preCheckpointVerification,
          finalPreCheckpointVerification,
          baselineHash: operation.baselineHash,
          recoveredBaselineInvariants,
        };
      }
    } else if (resolution === 'reconciled-applied-unsaved') {
      if (!preCheckpointVerification.ok) {
        throw new Error(
          'The durable project changed after the pre-checkpoint; the desired state cannot be classified as unsaved.',
        );
      }
      const results = await this.runSpecs(
        operation.plan.verifyCalls,
        operation.plan.expectedContext,
        'read',
      );
      const exactInvariantProof = verifyPhaseInvariants(
        results,
        operation,
        'Recovered live verification',
      );
      const aggregateAssertions = assertAssertions(
        results.map((result) => result.payload),
        operation.plan.verifyAssertions,
        'Recovered live verification',
      );
      const finalPreCheckpointVerification = await verifyCheckpoint(
        operation.preCheckpoint.receiptPath,
      );
      if (!finalPreCheckpointVerification.ok) {
        throw new Error(
          'The durable project changed while recovered unsaved state was being verified.',
        );
      }
      operation.state = 'live-verified';
      operation.mutationState = 'applied-unsaved';
      operation.saved = false;
      operation.reopened = false;
      recoveryEvidence = {
        preCheckpointVerification,
        finalPreCheckpointVerification,
        results,
        exactInvariantProof,
        aggregateAssertions,
      };
    } else if (resolution === 'reconciled-saved-reopened') {
      if (
        !preCheckpointVerification.checkpointMatchesReceipt ||
        preCheckpointVerification.sourceEqualsCheckpoint
      ) {
        throw new Error(
          'Saved recovery requires an intact pre-checkpoint and a demonstrably changed live project database.',
        );
      }
      let reopenOnly;
      if (options.confirmDiscardAnyUnsavedState !== true) {
        throw new Error(
          'Saved-state recovery must close/reopen without saving so it cannot certify later unsaved edits. Set confirmDiscardAnyUnsavedState=true only after authorizing discard of any unsaved target-document state.',
        );
      }
      const source = buildReopenOnlyCode(operation.plan.expectedContext, {
        allowDifferentActiveDocument: true,
      });
      const sourceSha256 = sha256Text(source);
      operation.state = 'recovery-reopen-dispatching';
      operation.mutationState = 'unknown';
      operation.hardStop = true;
      operation.mutationMayHaveOccurred = true;
      operation.recoveryAttemptCount = (operation.recoveryAttemptCount ?? 0) + 1;
      operation.recoverySourceSha256 = sourceSha256;
      operation.nextSafeAction =
        'Wait for the destructive reopen-only recovery. Never repeat it after a timeout without a fresh reconciliation.';
      operation.updatedAt = now();
      await updateOperation(operation);
      try {
        await this.markOrphanedCallRisk(operation, 'recovery-reopen');
        const raw = await this.upstream.callTool(
          'easyeda_execute',
          { code: source, timeoutMs: 60000, confirmWrite: true },
          70000,
        );
        await this.clearOrphanedCallRisk(operation, 'recovery-reopen');
        const payload = extractToolPayload(raw);
        assertSubset(
          payload,
          { ok: true, saved: false, closed: true, reopened: true },
          'Recovery reopen-only result',
        );
        reopenOnly = {
          sourceSha256,
          transmittedSourceSha256: sourceSha256,
          payload,
        };
        const reopenedContext = await this.rebindAfterLifecycle(
          operation.plan.expectedContext,
          payload,
          'Recovery reopen-only result',
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
        operation.state = 'recovery-reopened';
        operation.mutationState = 'saved';
        operation.saved = true;
        operation.reopened = true;
        operation.hardStop = false;
        operation.nextSafeAction = 'Run the stored reopened verifier and final checkpoint.';
        operation.updatedAt = now();
        await updateOperation(operation);
      } catch (error) {
        operation.state = 'recovery-reopen-unknown';
        operation.mutationState = 'unknown';
        operation.saved = false;
        operation.reopened = false;
        operation.hardStop = true;
        operation.mutationMayHaveOccurred = true;
        operation.unknownPhase = 'recovery-reopen';
        operation.nextSafeAction =
          'Do not repeat recovery. Inspect project/document state and the journal before an explicitly confirmed reconciliation attempt.';
        operation.lastError = serializeError(error);
        operation.updatedAt = now();
        await updateOperation(operation);
        throw error;
      }
      try {
        const finalCheckpoint = await createCheckpoint({
          ...operation.plan.checkpoint,
          label: `post-${operation.plan.checkpoint.label}`,
        });
        operation.candidateFinalCheckpoint = finalCheckpoint;
        operation.updatedAt = now();
        await updateOperation(operation);
        await this.assertContext(operation.plan.expectedContext);
        const results = await this.runSpecs(
          operation.plan.reopenedVerifyCalls,
          operation.plan.expectedContext,
          'read',
        );
        const exactInvariantProof = verifyPhaseInvariants(
          results,
          operation,
          'Recovered reopened verification',
        );
        const aggregateAssertions = assertAssertions(
          results.map((result) => result.payload),
          operation.plan.reopenedAssertions,
          'Recovered reopened verification',
        );
        const persistenceVerification = await verifyCheckpoint(
          operation.preCheckpoint.receiptPath,
        );
        if (
          !persistenceVerification.checkpointMatchesReceipt ||
          persistenceVerification.sourceEqualsCheckpoint
        ) {
          throw new Error(
            'Recovered reopened assertions passed, but logical persistence relative to the intact pre-checkpoint was not proved.',
          );
        }
        const finalCheckpointVerification = await verifyCheckpoint(finalCheckpoint.receiptPath);
        if (!finalCheckpointVerification.ok) {
          throw new Error('Reconciled final checkpoint verification failed.');
        }
        operation.finalCheckpoint = finalCheckpoint;
        operation.candidateFinalCheckpoint = undefined;
        operation.state = 'completed';
        operation.mutationState = 'saved';
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
        };
      } catch (error) {
        operation.state = 'recovery-verification-failed';
        operation.mutationState = 'saved';
        operation.saved = true;
        operation.reopened = true;
        operation.hardStop = true;
        operation.mutationMayHaveOccurred = false;
        operation.nextSafeAction =
          'The recovery reopen completed, but durable verification or checkpointing failed. Inspect before retrying verification.';
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
      operation.state === 'live-verified' || operation.mutationState === 'applied-unsaved';
    operation.nextSafeAction =
      operation.state === 'live-verified'
        ? 'Call easyeda_control_save_reopen.'
        : 'Recovery is complete. Review the journal before planning another mutation.';
    operation.updatedAt = now();
    await updateOperation(operation);
    return operationSummary(operation);
  }

  checkpoint(args: CheckpointArgs) {
    if (args.receiptPath !== undefined && args.receiptPath.length > 0) {
      return verifyCheckpoint(args.receiptPath);
    }
    const { source, outputDir, label } = args;
    if (
      typeof source !== 'string' ||
      source.length === 0 ||
      typeof outputDir !== 'string' ||
      outputDir.length === 0 ||
      typeof label !== 'string' ||
      label.length === 0
    ) {
      throw new TypeError('Checkpoint creation requires nonempty source, outputDir, and label.');
    }
    return createCheckpoint({ source, outputDir, label });
  }
}

export function planHashFor(plan: unknown): string {
  if (!isUnknownRecord(plan)) throw new Error('Plan hash input must be an object.');
  return buildPlanHash(plan);
}

export function canonicalSnapshotHash(results: unknown): string {
  return sha256Text(canonicalJson(results));
}
