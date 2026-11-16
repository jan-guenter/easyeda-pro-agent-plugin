/* oxlint-disable eslint/max-classes-per-file -- The private core stays with the fixed-generation wrappers; exporting an injectable wire selector would weaken the native boundary. */
/* oxlint-disable import/max-dependencies -- The shared original channel joins fixed legacy,209 and copy-purpose grammars with one reply/event owner. */







import type {currentFootprintForwardWriterCompleteProfile} from "./current-footprint-forward-writer-complete-profile.ts";
import type {CurrentFootprintForwardWriterCompleteBirthOrigin} from "./current-footprint-forward-writer-complete-birth-origin.ts";
import {currentFootprintForwardWriterTicketTimerWire,validateCurrentFootprintForwardWriterTicketTimerCommand} from "./current-footprint-forward-writer-ticket-timer-protocol.ts";
import type {CurrentFootprintForwardWriterTicketTimerCommand} from "./current-footprint-forward-writer-ticket-timer-protocol.ts";
import {CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_BINDING_PROGRAMS} from "./current-footprint-forward-writer-ticket-timer-bindings.ts";
import {currentFootprintForwardWriterStartupWsWire} from "./current-footprint-forward-writer-startup-ws-protocol.ts";
import type {CurrentFootprintForwardWriterStartupWsCommand} from "./current-footprint-forward-writer-startup-ws-protocol.ts";
import {currentFootprintForwardWriterOwnDataFixedWire,currentFootprintForwardWriterOwnDataProgram,qualifyCurrentFootprintForwardWriterOwnDataHelper,validateCurrentFootprintForwardWriterOwnDataCommand} from "./current-footprint-forward-writer-own-data-protocol.ts";
import type {CurrentFootprintForwardWriterOwnDataCommand} from "./current-footprint-forward-writer-own-data-protocol.ts";
import {currentFootprintForwardWriterCopyDeleteWire,currentFootprintForwardWriterCopyDrainWire} from "./current-footprint-forward-writer-copy-drain-wire.ts";
import {currentFootprintForwardWriterPostHistorySyncWire} from "./current-footprint-forward-writer-post-history-sync-wire.ts";
import type {CurrentPcbViaSaveDrainCommand} from "./current-pcb-via-save-drain-protocol.ts";
import type {CurrentPcbViaPostHistorySyncCommand} from "./current-pcb-via-post-history-sync-protocol.ts";
import type {CurrentPcbViaSaveTailDeleteControlCommand} from "./current-pcb-via-save-tail-delete-control-protocol.ts";
import {currentFootprintForwardWriterCopyTailObservationWire} from "./current-footprint-forward-writer-copy-tail-observation-wire.ts";
import type {CurrentPcbViaSaveTailObservationCommand} from "./current-pcb-via-save-tail-observation-protocol.ts";
import { currentFootprintForwardWriterPublicationWire } from "./current-footprint-forward-writer-publication-wire.ts";
import type { CurrentFootprintForwardWriterPublicationCommand } from "./current-footprint-forward-writer-publication-protocol.ts";
import { currentFootprintForwardWriterBranchQueryWire } from "./current-footprint-forward-writer-branch-query-wire.ts";
import type { CurrentFootprintForwardWriterBranchQueryCommand } from "./current-footprint-forward-writer-branch-query-protocol.ts";
/** Private original-native-channel adapter. The eventual retained owner must
 * irreversibly hand off its original parent attachment and request counter.
 * This module neither launches EasyEDA nor accepts a parent receipt as authority. */
import { types } from "node:util";
import { currentPcbDiagnosticNativeRefusal } from "./current-pcb-diagnostic-native-refusal.ts";
import { createHash } from "node:crypto";
import { currentFootprintCopyParentWire } from "./current-footprint-copy-parent-wire.ts";
import type { CurrentFootprintParentCommand, CurrentFootprintParentCommandKind } from "./current-footprint-copy-parent-wire.ts";
import { markCurrentFootprintExecutionDependency } from "./current-footprint-copy-execution-purpose.ts";
import { requireCurrentFootprintCopyParentRoute } from "./current-footprint-copy-parent-route.ts";
import process from "node:process";
import { z } from "zod";
import { decodeCurrentPcbDiagnosticJson } from "./current-pcb-diagnostic-json.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_FOOTPRINT_COPY_SOURCE_FRAME_BYTES } from "./current-footprint-copy-source-command.ts";
import { CURRENT_PCB_WORKER_STARTUP_REQUEST_LIMIT, currentFootprintCombinedStartupWire, currentFootprintCopyExecutionStartupWire, currentFootprintCopyForwardStartupWire, currentFootprintCopyHeldSavedStartupWire, currentFootprintCopyPreparationWire, currentFootprintCopySavedStartupWire,
  currentFootprintForwardExecutionStartupWire, currentFootprintForwardWriterStartupWire, currentPcb209WorkerStartupWire, currentPcbWorkerStartupWire } from "./current-pcb-worker-startup-wire.ts";
import { currentFootprintForwardWriterProfile } from "./current-footprint-forward-writer-profile.ts";
import { currentFootprintForwardWriterProducerWire } from "./current-footprint-forward-writer-producer-wire.ts";
import type { CurrentFootprintForwardWriterProducerChannelCommand } from "./current-footprint-forward-writer-producer-wire.ts";
import type { CurrentFootprintForwardWriterProducerBootstrap, CurrentFootprintForwardWriterProducerChannelBindings, CurrentFootprintForwardWriterProducerPrepare } from "./current-footprint-forward-writer-producer-origin.ts";
import { currentFootprintCopyManagerRouteWire } from "./current-footprint-copy-manager-route-wire.ts";
import type { CurrentFootprintCopyManagerRouteCommand } from "./current-footprint-copy-manager-route-command.ts";
import { currentFootprintCopyClockRegistrationWire } from "./current-footprint-copy-clock-registration-wire.ts";
import { CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_REQUESTS } from "./current-footprint-copy-clock-registration-runner.ts";
import type { CurrentFootprintCopyClockRegistrationCommand } from "./current-footprint-copy-clock-registration-contract.ts";
import { currentFootprintCopyUiWire } from "./current-footprint-copy-ui-wire.ts";
import type { CurrentFootprintCopyUiCommand } from "./current-footprint-copy-ui-command.ts";
import { CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE } from "./current-footprint-copy-preparation-profile.ts";
import { CURRENT_FOOTPRINT_COPY_EXECUTION_PROFILE } from "./current-footprint-copy-execution-profile.ts";
import { CURRENT_FOOTPRINT_COMBINED_RENDERER_PROFILE } from "./current-footprint-copy-combined-profile.ts";
import { currentProjectStructureWorkerWire } from "./current-project-structure-worker-wire.ts";
import { CURRENT_PROJECT_STRUCTURE_NATIVE_PROFILE } from "./current-project-structure-native-profile.ts";
import { CURRENT_FOOTPRINT_COPY_FORWARD_RENDERER_PROFILE } from "./current-footprint-copy-forward-profile.ts";
import { CURRENT_FOOTPRINT_FORWARD_EXECUTION_RENDERER_PROFILE } from "./current-footprint-forward-execution-profile.ts";
import { CurrentFootprintForwardWriterAllocatedCreateClockBudget,createCurrentFootprintForwardWriterCompleteAllocatedClockBudget } from "./current-footprint-forward-writer-allocated-clock-budget.ts";
import { resolveCurrentFootprintForwardWriterClockChannelOrigin } from "./current-footprint-forward-writer-clock-registry.ts";
import type { CurrentFootprintForwardWriterClockChannelBindings, CurrentFootprintForwardWriterClockChannelOrigin } from "./current-footprint-forward-writer-clock-origin.ts";
import { CurrentFootprintForwardColdAllocatedCreateClockBudget } from "./current-footprint-forward-cold-allocated-create-clock-budget.ts";
import { CURRENT_FOOTPRINT_COPY_SAVED_PROFILE } from "./current-footprint-copy-saved-profile.ts";
import { CURRENT_FOOTPRINT_COPY_HELD_SAVED_PROFILE } from "./current-footprint-copy-held-saved-profile.ts";
import { CURRENT_FOOTPRINT_COPY_HELD_SAVED_CAPACITY } from "./current-footprint-copy-held-saved-capacity.ts";
import { CURRENT_FOOTPRINT_SAVED_CACHE_HELD_LIMITS } from "./current-footprint-saved-cache-held-profile.ts";
import type { CurrentFootprintSavedCacheHeldCommand } from "./current-footprint-saved-cache-held-protocol.ts";
import { currentFootprintSavedCacheHeldWire } from "./current-footprint-saved-cache-held-wire.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { currentFootprintCopySavedQueueWire } from "./current-footprint-copy-saved-queue-wire.ts";
import type { CurrentFootprintCopySavedQueueChannelCommand } from "./current-footprint-copy-saved-queue-wire.ts";
import type { CurrentFootprintCopySavedQueueCommand } from "./current-footprint-copy-saved-queue.ts";
import { currentFootprintCacheConstructionWire } from "./current-footprint-copy-cache-construction-wire.ts";
import type { CurrentFootprintCacheConstructionChannelCommand } from "./current-footprint-copy-cache-construction-wire.ts";
import type { CurrentFootprintCacheConstructionCommand } from "./current-footprint-copy-cache-construction-contract.ts";
import { CURRENT_FOOTPRINT_COPY_CACHE_CONSTRUCTION_REQUESTS } from "./current-footprint-copy-cache-construction-contract.ts";
import { CURRENT_FOOTPRINT_COPY_TRANSACTION_CLOCK_REQUESTS } from "./current-footprint-copy-transaction-clock.ts";
import type { CurrentFootprintCopyTransactionClockCommand } from "./current-footprint-copy-transaction-clock.ts";
import { currentFootprintCopyTransactionClockWire } from "./current-footprint-copy-transaction-clock-wire.ts";
import type { CurrentPcbWorkerStartupCommand, CurrentPcbWorkerStartupDependency, CurrentPcbWorkerStartupEvent } from "./current-pcb-worker-startup-contract.ts";
import { CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_FUNCTION } from "./current-pcb-diagnostic-pcb-opening.ts";
import { currentFootprintCopyClockRpcWire } from "./current-footprint-copy-clock-rpc-wire.ts";
import { CurrentFootprintCopyClockRpcBudget } from "./current-footprint-copy-clock-rpc-budget.ts";
import { currentFootprintForwardWriterCopyUploadWire } from "./current-footprint-forward-writer-copy-upload-wire.ts";
import type { CurrentPcbViaUploadRequestCommand } from "./current-pcb-via-upload-request-protocol.ts";
import { currentFootprintForwardWriterCopyLocalWire } from "./current-footprint-forward-writer-copy-local-wire.ts";
import type { CurrentFootprintForwardWriterCopyLocalCommand } from "./current-footprint-forward-writer-copy-local-protocol.ts";
import { currentFootprintCopyClockRegistrationV2Wire } from "./current-footprint-copy-clock-registration-v2-wire.ts";
import type { CurrentFootprintCopyClockRegistrationV2Command } from "./current-footprint-copy-clock-registration-v2-contract.ts";
import { CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_V2_REQUESTS } from "./current-footprint-copy-clock-registration-v2-runner.ts";
import { currentFootprintCopyClockRpcV2Wire } from "./current-footprint-copy-clock-rpc-v2-wire.ts";
import type { CurrentFootprintCopyClockRpcV2Command } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import type { CurrentFootprintCopyClockRpcCommand } from "./current-footprint-copy-clock-rpc-protocol.ts";
import type { CurrentFootprintCopyClockRpcOriginEvent } from "./current-footprint-copy-clock-rpc-origin.ts";
import { CurrentFootprintCopyAllocatedCreateClockBudget } from "./current-footprint-copy-allocated-create-clock-budget.ts";
import { currentFootprintCopyAllocationWire } from "./current-footprint-copy-allocation-wire.ts";
import { CURRENT_PCB_WORKER_STARTUP_STREAM_LIMITS as STREAM } from "./current-pcb-worker-startup-stream-limits.ts";
import { CurrentFootprintCopyCreateClockBudget } from "./current-footprint-copy-create-clock-budget.ts";
import { CURRENT_FOOTPRINT_COPY_NATIVE_CREATE_LIMITS, captureCurrentFootprintCopyNativeCreateReply, currentFootprintCopyNativeCreateCommand,
  currentFootprintCopyNativeCreateWire } from "./current-footprint-copy-native-create-wire.ts";
import type { CurrentFootprintCopyNativeCreateCommand } from "./current-footprint-copy-native-create-wire.ts";
// oxlint-disable-next-line import/no-cycle -- The original construction issuer is required instead of an injectable capability registry; no initialization calls cross this transport cycle.
import { requireCurrentFootprintCopyCreateInvocationLease, requireCurrentFootprintForwardColdContinuationLease } from "./current-pcb-worker-construction-runner.ts";
import type { CurrentFootprintCopyCreateInvocationBinding, CurrentFootprintCopyCreateInvocationLease } from "./current-footprint-copy-create-invocation-lease.ts";
import type { CurrentFootprintCopyV2Plan } from "./current-footprint-copy-v2-plan.ts";
import { CURRENT_FOOTPRINT_FORWARD_COLD_NATIVE_LIMITS as FORWARD_LIMITS } from "./current-footprint-forward-cold-native-limits.ts";
import type { CurrentPcbWorkerConstructionCommand } from "./current-pcb-worker-construction-contract.ts";
import { currentFootprintForwardColdTailWire } from "./current-footprint-forward-cold-wire.ts";
import type { CurrentFootprintForwardColdContinuationBinding, CurrentFootprintForwardColdContinuationLease,
  CurrentFootprintForwardColdTail, CurrentFootprintForwardColdTailBinding } from "./current-footprint-forward-cold-continuation.ts";

export interface CurrentPcbWorkerStartupParent {
  readonly targetId: string;
  readonly sessionId: string;
  readonly nextRequestId: number;
}
type NativeRequest = ReturnType<typeof currentPcbWorkerStartupWire>["request"] | Readonly<{ action: "poll" }>;
export interface CurrentPcbWorkerStartupNativeDependency {
  /** Return the same original immutable object after rechecking the retained
   * parent/process, not a new object reconstructed from an earlier receipt. */
  readonly requireOriginalParent: () => Promise<CurrentPcbWorkerStartupParent>;
  readonly assertOriginalTermination: () => Promise<void>;
  readonly observeOriginalParentEvent: (event: CurrentPcbWorkerStartupEvent) => unknown;
  readonly exchange: (request: NativeRequest) => Promise<unknown>;
}
export interface CurrentPcbWorkerStartupPriorUsage {
  readonly receivedBytes: number;
  readonly eventCount: number;
  readonly eventBytes: number;
}
/** The actual owner selects this realm and target from its original UI source
 * and closed snapshot. Matching constructor data grants no native authority. */
export interface CurrentFootprintCopyHeldSavedChannelBinding {
  readonly sessionId: string;
  readonly uniqueContextId: string;
  readonly projectUuid: string;
  readonly branchUuid: string;
}
const INTERNAL_PROFILE = Symbol("fixed-worker-startup-channel-wire");
const footprintDependencies = new WeakSet<CurrentPcbWorkerStartupDependency>();
const structureDependencies = new WeakMap<CurrentPcbWorkerStartupDependency, () => void>();
/** Identity only. Copies cannot enlarge the construction/observation budget. */
export function isOriginalProjectStructureDependency(dependency: CurrentPcbWorkerStartupDependency): boolean { return structureDependencies.has(dependency); }
/** Preserve the unspent observer suffix before either observer is armed. */
export function requireOriginalProjectStructurePrefixCapacity(dependency: CurrentPcbWorkerStartupDependency): void {
  const requirePrefix = structureDependencies.get(dependency); if (requirePrefix === undefined) { throw fail("STRUCTURE_ORIGINAL_DEPENDENCY"); } requirePrefix();
}
const savedDependencies = new WeakSet<CurrentPcbWorkerStartupDependency>();
const heldSavedDependencies = new WeakSet<CurrentPcbWorkerStartupDependency>();

const executionDependencies = new WeakMap<CurrentPcbWorkerStartupDependency, CurrentPcbWorkerStartupChannelCore>();
const forwardExecutionDependencies = new WeakSet<CurrentPcbWorkerStartupDependency>();
const forwardWriterProducerChannels = new WeakMap<CurrentPcbWorkerStartupDependency, CurrentFootprintForwardWriterProducerChannelBindings>();
/** Full-writer identity is separate from every old v2 dependency token. */
export function isOriginalFootprintForwardWriterDependency(dependency: CurrentPcbWorkerStartupDependency): boolean { return forwardWriterProducerChannels.has(dependency); }
/** Return only the original channel's captured private methods and context. */
export function requireCurrentFootprintForwardWriterProducerChannel(dependency: CurrentPcbWorkerStartupDependency): CurrentFootprintForwardWriterProducerChannelBindings {
  const binding = forwardWriterProducerChannels.get(dependency); if (binding === undefined) { throw fail("FORWARD_WRITER_PRODUCER_ORIGINAL_CHANNEL"); }
  binding.context(); return binding;
}
/** The v2 native channel alone issues this marker. Legacy forward observations
 * cannot acquire continuous cold-producer ownership from their receipt. */
export function isOriginalFootprintForwardExecutionDependency(dependency: CurrentPcbWorkerStartupDependency): boolean {
  return forwardExecutionDependencies.has(dependency);
}
const coldTails = new WeakMap<CurrentFootprintForwardColdTail, CurrentFootprintForwardColdTailBinding>();
export function requireCurrentFootprintForwardColdTail(tail: CurrentFootprintForwardColdTail): CurrentFootprintForwardColdTailBinding {
  const binding = coldTails.get(tail); if (binding === undefined) { throw fail("FORWARD_COLD_TAIL_ORIGINAL"); }
  binding.assertCleanup(); return binding;
}
export function suspendCurrentFootprintForwardColdContinuation(dependency: CurrentPcbWorkerStartupDependency, lease: CurrentFootprintForwardColdContinuationLease): void {
  const channel = executionDependencies.get(dependency); if (channel === undefined) { throw fail("FORWARD_COLD_PURPOSE"); }
  channel.suspendForwardColdContinuation(dependency, lease);
}
export function requireCurrentFootprintForwardColdGenerationExited(dependency: CurrentPcbWorkerStartupDependency, lease: CurrentFootprintForwardColdContinuationLease): void {
  const channel = executionDependencies.get(dependency); if (channel === undefined) { throw fail("FORWARD_COLD_PURPOSE"); }
  channel.requireForwardColdGenerationExited(dependency, lease);
}
/** The sole original create and retired clock cursor select this continuation.
 * Its token proves ownership only; it grants no SQL or producer eligibility. */
export function beginCurrentFootprintForwardColdTail(dependency: CurrentPcbWorkerStartupDependency,
  pending: CurrentFootprintCopyPendingCreate): Promise<CurrentFootprintForwardColdTail> {
  const channel = executionDependencies.get(dependency); if (channel === undefined) { return Promise.reject(fail("FORWARD_COLD_PURPOSE")); }
  return channel.beginForwardColdTail(dependency, pending);
}
/** This marker is issued only by the separate channel, never by receipt data. */
export function isOriginalFootprintPreparationDependency(dependency: CurrentPcbWorkerStartupDependency): boolean {
  return footprintDependencies.has(dependency);
}
export function isOriginalFootprintSavedDependency(dependency: CurrentPcbWorkerStartupDependency): boolean { return savedDependencies.has(dependency); }
/** This separate marker never confers the legacy saved, preparation or writer purpose. */
export function isOriginalFootprintHeldSavedDependency(dependency: CurrentPcbWorkerStartupDependency): boolean { return heldSavedDependencies.has(dependency); }
/** Only the new cold channel can issue this marker; old saved/writer maps remain disjoint. */

export { isOriginalFootprintExecutionDependency } from "./current-footprint-copy-execution-purpose.ts";
export function requestCurrentFootprintCopyTransactionClock(dependency: CurrentPcbWorkerStartupDependency,
  command: CurrentFootprintCopyTransactionClockCommand & Readonly<{ sessionId: string }>): Promise<unknown> {
  const channel = executionDependencies.get(dependency);
  if (channel === undefined) { return Promise.reject(fail("FOOTPRINT_CLOCK_PURPOSE")); }
  return channel.requestFootprintClock(command);
}
export function requestCurrentFootprintCopyCacheConstruction(dependency: CurrentPcbWorkerStartupDependency,
  command: CurrentFootprintCacheConstructionCommand): Promise<unknown> {
  const channel = executionDependencies.get(dependency);
  if (channel === undefined) { return Promise.reject(fail("FOOTPRINT_CACHE_PURPOSE")); }
  return channel.requestFootprintCacheConstruction(command);
}
export function originalCurrentFootprintExecutionProjectUuid(dependency: CurrentPcbWorkerStartupDependency): string {
  const channel = executionDependencies.get(dependency);
  if (channel === undefined) { throw fail("FOOTPRINT_CACHE_PURPOSE"); }
  return channel.originalExecutionProjectUuid(dependency);
}
export function requestCurrentFootprintCopyParent(dependency: CurrentPcbWorkerStartupDependency,
  command: CurrentFootprintParentCommand, kind: CurrentFootprintParentCommandKind): Promise<unknown> {
  const channel = executionDependencies.get(dependency);
  if (channel === undefined) { return Promise.reject(fail("FOOTPRINT_PARENT_PURPOSE")); }
  return channel.requestFootprintParent(dependency, command, kind);
}
export function subscribeCurrentFootprintCopyParentEvents(dependency: CurrentPcbWorkerStartupDependency,
  listener: (event: CurrentPcbWorkerStartupEvent) => void, lost: () => void): () => void {
  const channel = executionDependencies.get(dependency);
  if (channel === undefined) { throw fail("FOOTPRINT_PARENT_PURPOSE"); }
  return channel.subscribeFootprintParentEvents(dependency, listener, lost);
}
const token = z.string().min(1).max(128).regex(/^[A-Za-z\d_.:-]+$/u);
const parentSchema = z.object({ targetId: token, sessionId: token,
  nextRequestId: z.number().int().min(1).max(CURRENT_PCB_WORKER_STARTUP_REQUEST_LIMIT) }).strict();
const heldSavedToken = z.string().regex(/^[A-Za-z\d_.:-]{1,128}(?![\s\S])/u);
const heldSavedBindingSchema = z.object({ sessionId: heldSavedToken, uniqueContextId: heldSavedToken,
  projectUuid: z.string().regex(/^[a-f\d]{64}(?![\s\S])/u), branchUuid: z.string().regex(/^[a-f\d]{32}(?![\s\S])/u) }).strict();
const heldSavedSequence = ["capture", "array-properties", "constructor-properties", "match-properties", "getter-properties", "recheck-before-getter",
  "retain-receiver", "queue-first", "recheck-first", "queue-fresh", "recheck-fresh"] as const;
const ackSchema = z.object({ written: z.literal(true) }).strict();
const MAX_BYTES = STREAM.receivedBytes, MAX_EVENTS = STREAM.eventCount, MAX_EVENT_BYTES = STREAM.eventBytes;
const MAX_FRAME = STREAM.frameBytes, SOURCE_FRAME = STREAM.sourceFrameBytes;
const ACTIVE_POLL_MS = STREAM.activePollMilliseconds, IDLE_POLL_MS = STREAM.idlePollMilliseconds, LIFETIME_MS = STREAM.lifetimeMilliseconds;
const MAX_DATA_POLLS = STREAM.dataPolls, MAX_IDLE_POLLS = STREAM.idlePolls, MAX_WAIT_POLLS = STREAM.waitPolls;
const monotonicNow = process.hrtime.bigint.bind(process.hrtime);
const failureCodes = new WeakMap<Error, string>();
type ClockCommand = CurrentFootprintCopyTransactionClockCommand & Readonly<{ sessionId: string }>;
type ChannelCommand = (CurrentFootprintForwardWriterTicketTimerCommand & Readonly<{sessionId:string}>) | (CurrentFootprintForwardWriterStartupWsCommand & Readonly<{sessionId:string}>) | (CurrentFootprintForwardWriterOwnDataCommand & Readonly<{sessionId:string}>) | (CurrentPcbViaSaveDrainCommand & Readonly<{sessionId:string}>) | (ReturnType<typeof currentFootprintForwardWriterPostHistorySyncWire>["command"] & Readonly<{sessionId:string}>) | (CurrentPcbViaSaveTailDeleteControlCommand & Readonly<{sessionId:string}>) | (CurrentPcbViaSaveTailObservationCommand & Readonly<{sessionId:string}>) | (CurrentFootprintForwardWriterPublicationCommand["command"] & Readonly<{ sessionId: string; forwardCopyPublication:"callback"|"queue" }>) | (CurrentFootprintForwardWriterBranchQueryCommand & Readonly<{ sessionId: string }>) | (CurrentPcbViaUploadRequestCommand & Readonly<{ sessionId: string }>) | (CurrentFootprintForwardWriterCopyLocalCommand & Readonly<{ sessionId: string }>) | CurrentFootprintCopyClockRegistrationV2Command | CurrentFootprintForwardWriterProducerChannelCommand | CurrentPcbWorkerStartupCommand | CurrentFootprintCopyUiCommand | CurrentFootprintCopyManagerRouteCommand | CurrentFootprintCopyClockRegistrationCommand | ClockCommand | CurrentFootprintParentCommand | CurrentFootprintCopySavedQueueChannelCommand | CurrentFootprintCacheConstructionChannelCommand | CurrentFootprintSavedCacheHeldCommand;
function clockWire(raw: unknown, id: number): ReturnType<typeof currentFootprintCopyTransactionClockWire> {
  const captured = captureCurrentPcbStringClockReply(raw).value;
  if (!record(captured) || !exact(captured, ["method", "params", "sessionId"]) || typeof captured["sessionId"] !== "string") { throw fail("FOOTPRINT_CLOCK_COMMAND"); }
  const { sessionId, ...command } = captured;
  return currentFootprintCopyTransactionClockWire(command, id, sessionId);
}
type PendingCommand = ChannelCommand | CurrentFootprintCopyClockRpcV2Command | CurrentFootprintCopyClockRpcCommand | CurrentFootprintCopyNativeCreateCommand;
// oxlint-disable-next-line typescript/explicit-function-return-type -- Preserve the exact separate literal purpose and inherited fixed channel profile fields without widening either old profile.
function forwardWriterRendererProfile(complete:CompleteChannelInput|null) { const profile = complete===null?currentFootprintForwardWriterProfile():complete.profile; return { ...CURRENT_FOOTPRINT_FORWARD_EXECUTION_RENDERER_PROFILE, ...profile.renderer, purpose: profile.purpose }; }
type FootprintProfile = ReturnType<typeof forwardWriterRendererProfile> | typeof CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE | typeof CURRENT_FOOTPRINT_COPY_EXECUTION_PROFILE | typeof CURRENT_FOOTPRINT_COPY_SAVED_PROFILE | typeof CURRENT_FOOTPRINT_COMBINED_RENDERER_PROFILE | typeof CURRENT_FOOTPRINT_COPY_FORWARD_RENDERER_PROFILE | typeof CURRENT_FOOTPRINT_COPY_HELD_SAVED_PROFILE | typeof CURRENT_FOOTPRINT_FORWARD_EXECUTION_RENDERER_PROFILE;
function replyFrameLimit(command: PendingCommand, nativeCreate = false, heldSavedCleanup = false): number {
  if (heldSavedCleanup) { return CURRENT_FOOTPRINT_COPY_HELD_SAVED_CAPACITY.renderer.cleanupReplyFrameBytes; }
  if (nativeCreate) { return CURRENT_FOOTPRINT_COPY_NATIVE_CREATE_LIMITS.responseFrameBytes; }
  // The leaf's limit covers its result object. The fixed CDP envelope adds a
  // Bounded positive int32 ID, original session token and framing keys.
  if ("heldCachePhase" in command) { return CURRENT_FOOTPRINT_SAVED_CACHE_HELD_LIMITS.replyBytes + 256; }
  if ("phase" in command && typeof command.phase === "string" && command.phase.startsWith("allocation-")) { return 65_536; }
  if (command.method === "Debugger.getScriptSource") { return SOURCE_FRAME; }
  return command.method === "Runtime.callFunctionOn" && "objectId" in command.params && command.params.awaitPromise === true ?
    CURRENT_FOOTPRINT_COPY_SOURCE_FRAME_BYTES : MAX_FRAME;
}
interface Pending {
  readonly id: number;
  readonly command: PendingCommand;
  readonly nativeCreate?: true;
  /** Only the fixed original copy tail marks its planned normal resumes. */
  readonly plannedForwardTail?: true;
  readonly heldSavedCleanup?: true;
  rawFrame?: string;
  readonly commandSha256?: string;
  readonly completion: PromiseWithResolvers<unknown>;
  readonly allocation: boolean;
  written: boolean;
  writeFailed: boolean;
  replied: boolean;
  result: unknown;
  remoteError: boolean;
  settled: boolean;
}
function fail(code: string): Error {
  const error = new Error(`PCB_WORKER_STARTUP_CHANNEL_${code}`); failureCodes.set(error, code); return error;
}
function record(value: unknown): value is Record<string, unknown> { return value !== null && typeof value === "object" && !Array.isArray(value); }
function exact(value: object, keys: readonly string[]): boolean { return Object.keys(value).toSorted().join(",") === [...keys].toSorted().join(","); }
function cleanupCommand(command: Pick<PendingCommand, "method">): boolean {
  if ("forwardStartupFrontier" in command) { return false; }
  // A planned cache resume is normal source work. It must reprove its
  // Original owner and cannot use cleanup permission after a failure.
  if (command.method === "Debugger.resume" && "phase" in command && (command.phase === "inverse-initial-cache-resume" || command.phase === "inverse-initial-sync-resume")) { return false; }
  return command.method === "Debugger.removeBreakpoint" || command.method === "Debugger.resume" ||
    command.method === "Runtime.runIfWaitingForDebugger" || command.method === "Runtime.releaseObjectGroup";
}
interface ClockRpcState {
  readonly workerSessionId: string;
  readonly uiSessionId: string;
  readonly budget: CurrentFootprintCopyClockRpcBudget | CurrentFootprintCopyCreateClockBudget | CurrentFootprintCopyAllocatedCreateClockBudget | CurrentFootprintForwardColdAllocatedCreateClockBudget | CurrentFootprintForwardWriterAllocatedCreateClockBudget;
  readonly create: CreateClockState | null;
  readonly events: CurrentFootprintCopyClockRpcOriginEvent[];
  begun: boolean;
  retired: boolean;
  retireAttempted: boolean;
  retireAcknowledged: boolean;
  eventCount: number;
  eventBytes: number;
}
interface CreateClockState {
  readonly allocation: boolean;
  readonly copyPlan: CurrentFootprintCopyV2Plan;
  readonly binding: CurrentFootprintCopyCreateInvocationBinding;
  readonly command: CurrentFootprintCopyNativeCreateCommand;
  readonly token: CurrentFootprintCopyPendingCreate;
  dispatchAttempted: boolean;
  pending: Pending | null;
  rejectedFrame: Readonly<{ classification: "unattributed-rejected-native-frame"; bytes: number; sha256: string; base64: string }> | null;
}
/** Identity token only. No serializable receipt can become an original wait. */
export interface CurrentFootprintCopyPendingCreate { readonly profile: "private.current-footprint-copy-pending-create.v1" }
export interface CurrentFootprintCopyCreateClockChannelBindings {
  readonly clockLease: CurrentFootprintCopyCreateInvocationBinding["clockLease"];
  readonly copyPlan: CurrentFootprintCopyV2Plan;
  readonly invocationBinding: CurrentFootprintCopyCreateInvocationBinding;
  readonly workerSessionId: string;
  readonly assertOriginalSynchronous: () => void;
}
const createClockRoutes = new WeakMap<CurrentFootprintCopyCreateClockChannelRoute, CurrentFootprintCopyCreateClockChannelBindings>();
const forwardWriterCreateClockRoutes = new WeakMap<CurrentFootprintForwardWriterCreateClockChannelRoute, CurrentFootprintCopyCreateClockChannelBindings>();
const forwardWriterCreateClockIssuers=new WeakMap<CurrentFootprintForwardWriterCreateClockChannelRoute,Readonly<{issuer:CurrentPcbWorkerStartupChannel;state:ClockRpcState}>>();
export function requireCurrentFootprintCopyCreateClockChannelRoute(route: CurrentFootprintCopyCreateClockChannelRoute): CurrentFootprintCopyCreateClockChannelBindings {
  const binding = createClockRoutes.get(route); if (binding === undefined) { throw fail("FOOTPRINT_CREATE_ORIGINAL_ROUTE"); }
  binding.assertOriginalSynchronous(); return binding;
}
export function requireCurrentFootprintForwardWriterCreateClockChannelRoute(route: CurrentFootprintForwardWriterCreateClockChannelRoute): CurrentFootprintCopyCreateClockChannelBindings {
  const binding = forwardWriterCreateClockRoutes.get(route); if (binding === undefined) { throw fail("FORWARD_WRITER_CREATE_ORIGINAL_ROUTE"); }
  binding.assertOriginalSynchronous(); return binding;
}
export interface CurrentFootprintCopyCreateClockChannelRoute extends CurrentFootprintCopyClockRpcChannelRoute {
  /** Resolves on the one native write ACK, without awaiting native create. */
  readonly dispatchCreate: () => Promise<CurrentFootprintCopyPendingCreate>;
  /** Joins the exact original reply, early or late. No SQL/durability claim. */
  readonly joinCreate: (pending: CurrentFootprintCopyPendingCreate) => Promise<string>;
}
export interface CurrentFootprintForwardWriterCreateClockChannelRoute extends Omit<CurrentFootprintCopyCreateClockChannelRoute, "request"> {
  readonly request: (command: CurrentFootprintCopyClockRpcV2Command, cleanup: boolean) => Promise<unknown>;
}
interface InternalClockChannelRoute extends Omit<CurrentFootprintCopyClockRpcChannelRoute, "request"> {
  readonly request: (command: CurrentFootprintCopyClockRpcCommand | CurrentFootprintCopyClockRpcV2Command, cleanup: boolean) => Promise<unknown>;
}
interface InternalCreateClockChannelRoute extends InternalClockChannelRoute {
  readonly dispatchCreate: () => Promise<CurrentFootprintCopyPendingCreate>;
  readonly joinCreate: (pending: CurrentFootprintCopyPendingCreate) => Promise<string>;
}
export interface CurrentFootprintCopyClockRpcChannelReservation { readonly profile: "private.current-footprint-clock-rpc-channel-reservation.v1" }
export interface CurrentFootprintCopyClockRpcChannelRoute {
  readonly workerSessionId: string;
  readonly assertOriginal: () => Promise<void>;
  readonly assertCleanup: () => Promise<void>;
  readonly assertOriginalGenerationExited: () => Promise<void>;
  readonly request: (command: CurrentFootprintCopyClockRpcCommand, cleanup: boolean) => Promise<unknown>;
  readonly pump: (cleanup: boolean) => Promise<void>;
  readonly takeEvent: () => CurrentFootprintCopyClockRpcOriginEvent | null;
  readonly fail: () => void;
  readonly retire: () => Promise<void>;
}
function parentCommand(command: ChannelCommand): boolean {
  return command.method === "Target.getTargets" || command.method === "Page.getFrameTree" ||
    command.method === "DOM.getFrameOwner" || command.method === "DOM.describeNode" ||
    command.method === "Debugger.getScriptSource" && "pcbPhase" in command ||
    command.method === "Runtime.callFunctionOn" && "uniqueContextId" in command.params;
}
function members(dependency: CurrentPcbWorkerStartupNativeDependency): readonly unknown[] {
  if (!record(dependency) || types.isProxy(dependency) ||
      Object.getPrototypeOf(dependency) !== Object.prototype && Object.getPrototypeOf(dependency) !== null) { throw fail("DEPENDENCY"); }
  const fields = ["requireOriginalParent", "assertOriginalTermination", "observeOriginalParentEvent", "exchange"] as const;
  if (Reflect.ownKeys(dependency).length !== fields.length) { throw fail("DEPENDENCY"); }
  return fields.map(key => {
    const descriptor = Object.getOwnPropertyDescriptor(dependency, key);
    if (descriptor === undefined || !Object.hasOwn(descriptor, "value") || typeof descriptor.value !== "function") { throw fail("DEPENDENCY"); }
    return descriptor.value as unknown;
  });
}
async function observe(work: Promise<unknown>): Promise<void> {
  try { await work; } catch {
    // The original pending operation and channel status retain the failure.
  }
}

interface ColdContinuationState {
  readonly lease: CurrentFootprintForwardColdContinuationLease;
  readonly binding: CurrentFootprintForwardColdContinuationBinding;
  readonly dependency: CurrentPcbWorkerStartupDependency;
  readonly workerSessionId: string;
}
const COMPLETE_CHANNEL_INTERNAL=Symbol("original-complete-forward-channel");
class CurrentPcbWorkerStartupChannelCore {
  #coldContinuation: ColdContinuationState | null = null;
  #coldPause = false;
  #fullClock: Readonly<{ origin: CurrentFootprintForwardWriterClockChannelOrigin; binding: CurrentFootprintForwardWriterClockChannelBindings; reprove: () => CurrentFootprintForwardWriterClockChannelBindings }> | null = null;
  #fullClockPreparing = false;
  #fullProducerPause = false;
  #fullClockExitStarted = false;
  #fullClockRetirementDisposition: "retired" | "ended-before-begin" | null = null;
  #coldTailAttempted = false;
  #coldTail: CurrentFootprintForwardColdTail | null = null;
  readonly #wire: typeof currentPcbWorkerStartupWire;
  readonly #structurePurpose: boolean;
  readonly #footprintPurpose: boolean;
  readonly #executionPurpose: boolean;
  readonly #createClockPurpose: boolean;
  readonly #allocationPurpose: boolean;
  readonly #forwardWriterProducerPrepare: CurrentFootprintForwardWriterProducerPrepare | null;
  #forwardWriterProducerPrepared = false;
  #forwardWriterProducerBound = false;
  #forwardWriterProducerEnrolled = false;
  readonly #forwardEventBytes: ((bytes: number) => void) | null;
  readonly #forwardSavedObservation: boolean;
  readonly #savedPurpose: boolean;
  readonly #heldSavedBinding: CurrentFootprintCopyHeldSavedChannelBinding | null;

  readonly #footprintProfile: FootprintProfile;
  readonly #requestLimit: number;
  readonly #native: CurrentPcbWorkerStartupNativeDependency;
  readonly #members: readonly unknown[];
  readonly #parentMethod: CurrentPcbWorkerStartupNativeDependency["requireOriginalParent"];
  readonly #terminate: CurrentPcbWorkerStartupNativeDependency["assertOriginalTermination"];
  readonly #parentEvent: CurrentPcbWorkerStartupNativeDependency["observeOriginalParentEvent"];
  readonly #exchange: CurrentPcbWorkerStartupNativeDependency["exchange"];
  readonly #pending = new Map<number, Pending>();
  readonly #workers = new Map<string, string>();
  readonly #created = monotonicNow();
  #parent: CurrentPcbWorkerStartupParent | null = null;
  #listener: ((event: CurrentPcbWorkerStartupEvent) => void) | null = null;
  #tail: Promise<void> = Promise.resolve();
  #buffer = Buffer.alloc(4096);
  #used = 0;
  #nextId = 0;
  #bytes = 0;
  #events = 0;
  #eventBytes = 0;
  #polls = 0;
  #dataPolls = 0;
  #waitPolls = 0;
  #idlePolls = 0;
  #nextPollDelay: number = ACTIVE_POLL_MS;
  #pollTimer: ReturnType<typeof setTimeout> | null = null;
  #pollQueued = false;
  #started = false;
  #released = false;
  #releaseRequested = false;
  #terminationVerified = false;
  #queuedRequests = 0;
  #attachIssued = false;
  #attachAcknowledged = false;
  #openingIdentity: string | null = null;
  #openingContext: string | null = null;
  #openingProjectUuid: string | null = null;
  #openingConsumed = false;
  #actorReads = 0;
  #savedQueueReads = 0;
  #savedQueueContext: string | null = null;
  #savedQueueScope: string | null = null;
  #heldSavedNormal = 0;
  #heldSavedCleanup = 0;
  #heldCacheStep = 0;
  #heldCacheTuple: string | null = null;
  #heldCacheReleaseAttempted = false;
  #heldCacheReleased = false;
  #footprintUiStarted = false;
  #footprintUiReleased = false;
  #footprintManagerStarted = false;
  #footprintManagerSourceConsumed = false;
  #footprintManagerReleased = false;
  #footprintClockRegistrationStarted = false;
  #footprintClockRegistrationSourceConsumed = false;
  #footprintClockRegistrationCallbackConsumed = false;
  #footprintClockRegistrationBindingsConsumed = false;
  #footprintClockRegistrationSamples = 0;
  #footprintClockRegistrationReleased = false;
  #footprintClockRegistrationRequests = 0;
  #forwardWriterRegistrationStep = 0;
  #footprintParentSubscriber: Readonly<{ event: (event: CurrentPcbWorkerStartupEvent) => void; lost: () => void }> | null = null;
  #footprintParentSubscriptionConsumed = false;
  #executionWorkerSession: string | null = null;
  #executionChildContext: string | null = null;
  #executionChildContextNumber:number|null=null;
  readonly #completeBirth:CompleteChannelInput|null;
  #forwardWriterTicketHelper:{readonly command:CurrentFootprintForwardWriterTicketTimerCommand;readonly program:string;scriptId:string|null}|null=null;
  #forwardWriterOwnDataHelper:{readonly command:CurrentFootprintForwardWriterOwnDataCommand;readonly program:string;scriptId:string|null}|null=null;
  #footprintClockSession: string | null = null;
  #footprintClockRequests = 0;
  #clockRpcAttempted = false;
  #clockRpcHandoffPending = false;
  #clockRpc: ClockRpcState | null = null;
  #clockRpcPreparedState: ClockRpcState | null = null;
  #clockRpcReservation: CurrentFootprintCopyClockRpcChannelReservation | null = null;
  #footprintCacheRequests = 0;
  #pcbPreflightConsumed = false;
  #pcbOpeningConsumed = false;
  #pcbSourceConsumed = false;
  #pcbObservationConsumed = false;
  #failure: Error | null = null;
  #failureCode: string | null = null;
  #exchangeFailure: Readonly<{ requestId: number; method: string; nativeCode: string | null; kind: "native-refusal" | "unrecognized-exchange-failure" }> | null = null;
  #fatal = false;

  public constructor(internal: typeof INTERNAL_PROFILE, native: CurrentPcbWorkerStartupNativeDependency,
    wire: typeof currentPcbWorkerStartupWire, priorUsage?: CurrentPcbWorkerStartupPriorUsage, createClockPurpose = false, allocationPurpose = false,
    forwardEventBytes: ((bytes: number) => void) | null = null, accountedSavedPurpose = false,
    heldSavedBinding: CurrentFootprintCopyHeldSavedChannelBinding | null = null, forwardWriterProducerPrepare: CurrentFootprintForwardWriterProducerPrepare | null = null,completeBirth:CompleteChannelInput|null=null) {
    this.#completeBirth=completeBirth;
    if (internal !== INTERNAL_PROFILE) { throw fail("INTERNAL_PROFILE"); }
    if(completeBirth!==null&&(types.isProxy(completeBirth)||Object.getOwnPropertyDescriptor(completeBirth,"key")?.value!==COMPLETE_CHANNEL_INTERNAL||wire!==currentFootprintForwardWriterStartupWire)){throw fail("FORWARD_COMPLETE_ORIGINAL_CHANNEL_FACTORY");} this.#wire = wire; this.#createClockPurpose = createClockPurpose; this.#allocationPurpose = allocationPurpose;
    this.#structurePurpose = wire === currentProjectStructureWorkerWire;
    if ((wire === currentFootprintForwardWriterStartupWire) !== (forwardWriterProducerPrepare !== null) ||
        forwardWriterProducerPrepare !== null && (typeof forwardWriterProducerPrepare !== "function" || types.isProxy(forwardWriterProducerPrepare))) { throw fail("FORWARD_WRITER_PRODUCER_BINDING"); }
    this.#forwardWriterProducerPrepare = forwardWriterProducerPrepare;
    if (typeof accountedSavedPurpose !== "boolean" || accountedSavedPurpose && wire !== currentFootprintCopySavedStartupWire ||
        (wire === currentFootprintCopyForwardStartupWire || wire === currentFootprintForwardExecutionStartupWire || wire === currentFootprintForwardWriterStartupWire || accountedSavedPurpose || (wire === currentFootprintCopyHeldSavedStartupWire)) !== (forwardEventBytes !== null) ||
        forwardEventBytes !== null && typeof forwardEventBytes !== "function") { throw fail("FORWARD_ACCOUNTING"); }
    this.#forwardEventBytes = forwardEventBytes; this.#forwardSavedObservation = accountedSavedPurpose;
    if ((wire === currentFootprintCopyHeldSavedStartupWire) !== (heldSavedBinding !== null)) { throw fail("HELD_SAVED_BINDING"); }
    this.#heldSavedBinding = heldSavedBinding === null ? null : freezeDeep(heldSavedBindingSchema.parse(captureCurrentPcbStringClockReply(heldSavedBinding).value));
    if (allocationPurpose && !createClockPurpose) { throw fail("FOOTPRINT_ALLOCATION_PURPOSE"); }
    if (wire === currentFootprintForwardExecutionStartupWire && (!allocationPurpose || !createClockPurpose)) { throw fail("FORWARD_EXECUTION_BIRTH"); }
    this.#executionPurpose = wire === currentFootprintCopyExecutionStartupWire || wire === currentFootprintCombinedStartupWire || wire === currentFootprintCopyForwardStartupWire || wire === currentFootprintForwardExecutionStartupWire || wire === currentFootprintForwardWriterStartupWire;
    this.#savedPurpose = wire === currentFootprintCopySavedStartupWire || wire === currentFootprintCopyHeldSavedStartupWire;
    this.#footprintPurpose = this.#executionPurpose || this.#savedPurpose || wire === currentFootprintCopyPreparationWire;
    const writerProfile = this.#executionPurpose ? CURRENT_FOOTPRINT_COPY_EXECUTION_PROFILE : CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE;
    let footprintProfile: FootprintProfile = writerProfile;
    if (this.#savedPurpose) { footprintProfile = CURRENT_FOOTPRINT_COPY_SAVED_PROFILE; }
    if (wire === currentFootprintCombinedStartupWire) { footprintProfile = CURRENT_FOOTPRINT_COMBINED_RENDERER_PROFILE; }
    if (wire === currentFootprintCopyForwardStartupWire) { footprintProfile = CURRENT_FOOTPRINT_COPY_FORWARD_RENDERER_PROFILE; }
    if (wire === currentFootprintForwardExecutionStartupWire) { footprintProfile = CURRENT_FOOTPRINT_FORWARD_EXECUTION_RENDERER_PROFILE; }
    if (wire === currentFootprintForwardWriterStartupWire) { footprintProfile = forwardWriterRendererProfile(completeBirth); }
    if (wire === currentFootprintCopyHeldSavedStartupWire) { footprintProfile = CURRENT_FOOTPRINT_COPY_HELD_SAVED_PROFILE; }

    this.#footprintProfile = footprintProfile;
    let requestLimit = this.#footprintPurpose ? this.#footprintProfile.requestLimit : CURRENT_PCB_WORKER_STARTUP_REQUEST_LIMIT;
    if (this.#structurePurpose) { requestLimit = CURRENT_PROJECT_STRUCTURE_NATIVE_PROFILE.worker.total; }
    this.#requestLimit = requestLimit;
    this.#members = members(native); this.#native = native;
    this.#parentMethod = native.requireOriginalParent; this.#terminate = native.assertOriginalTermination;
    this.#parentEvent = native.observeOriginalParentEvent; this.#exchange = native.exchange;
    if (priorUsage !== undefined) {
      const prior = z.object({ receivedBytes: z.number().int().min(0).max(MAX_BYTES),
        eventCount: z.number().int().min(0).max(MAX_EVENTS), eventBytes: z.number().int().min(0).max(MAX_EVENT_BYTES) }).strict()
        .parse(captureCurrentPcbStringClockReply(priorUsage).value);
      this.#bytes = prior.receivedBytes; this.#events = prior.eventCount; this.#eventBytes = prior.eventBytes;
    }
  }
  public status(): Readonly<{ started: boolean; released: boolean; failed: boolean; fatal: boolean;
    pendingReplies: number; nextRequestId: number; receivedBytes: number; pollCount: number; attachedWorkers: number;
    dataPollCount: number; waitingPollCount: number; idlePollCount: number; failureCode: string | null;
    heldSaved?: Readonly<{ normalRequests: number; cleanupRequests: number; heldNormalPhases: number; releaseAttempted: boolean; released: boolean }>;
    exchangeFailure?: Readonly<{ requestId: number; method: string; nativeCode: string | null; kind: "native-refusal" | "unrecognized-exchange-failure" }> }> {
    return Object.freeze({ started: this.#started, released: this.#released, failed: this.#failure !== null, fatal: this.#fatal,
      pendingReplies: this.#pending.size, nextRequestId: this.#nextId, receivedBytes: this.#bytes,
      pollCount: this.#polls, attachedWorkers: this.#workers.size, dataPollCount: this.#dataPolls,
      waitingPollCount: this.#waitPolls, idlePollCount: this.#idlePolls, failureCode: this.#failureCode,
      ...(this.#heldSavedBinding === null ? {} : { heldSaved: Object.freeze({ normalRequests: this.#heldSavedNormal,
        cleanupRequests: this.#heldSavedCleanup, heldNormalPhases: this.#heldCacheStep,
        releaseAttempted: this.#heldCacheReleaseAttempted, released: this.#heldCacheReleased }) }),
      ...(this.#exchangeFailure === null ? {} : { exchangeFailure: this.#exchangeFailure }) });
  }
  public classifyForwardRequest(id: number): boolean {
    const pending = this.#pending.get(id);
    if (this.#forwardEventBytes === null || pending === undefined || pending.written || pending.writeFailed) { throw fail("FORWARD_PENDING_REQUEST"); }
    return pending.plannedForwardTail === true ? false : cleanupCommand(pending.command);
  }
  public forwardPollWaiting(): boolean {
    if (this.#forwardEventBytes === null) { throw fail("FORWARD_PENDING_REQUEST"); }
    return this.#pending.size > 0 || this.#queuedRequests !== 0 || this.#used !== 0;
  }
  #withinLifetime(cleanup = false): void {
    const age = monotonicNow() - this.#created;
    let normal = this.#footprintPurpose ? this.#footprintProfile.normalMilliseconds : LIFETIME_MS;
    let cleanupMilliseconds = this.#footprintPurpose ? this.#footprintProfile.cleanupMilliseconds : 0;
    if (this.#structurePurpose) { normal = CURRENT_PROJECT_STRUCTURE_NATIVE_PROFILE.normalMilliseconds; cleanupMilliseconds = CURRENT_PROJECT_STRUCTURE_NATIVE_PROFILE.cleanupMilliseconds; }
    const total = normal + cleanupMilliseconds;
    if (age < 0n || age >= BigInt(total) * 1_000_000n) {
      this.#poison("LIFETIME", true); throw this.#failure ?? fail("LIFETIME");
    }
    // Reject new normal work without poisoning the retained pipe. Original
    // Cleanup and reply polling remain available during the sealed reserve.
    if (!cleanup && age >= BigInt(normal) * 1_000_000n) { throw fail("NORMAL_LIFETIME"); }
  }
  #sameMethods(): void {
    if (members(this.#native).some((value, index) => value !== this.#members[index])) { throw fail("DEPENDENCY_CHANGED"); }
  }
  async #current(): Promise<void> {
    await this.#queue(() => this.#currentWithinQueue());
  }
  async #currentWithinQueue(): Promise<void> {
    if (this.#released || this.#releaseRequested || this.#terminationVerified || this.#failure !== null) { throw this.#failure ?? fail("RELEASED"); }
    try {
      this.#withinLifetime();
      this.#sameMethods(); const parent = await this.#parentMethod.call(this.#native); this.#sameMethods();
      this.#withinLifetime();
      if (parent !== this.#parent || this.#released || this.#releaseRequested || this.#terminationVerified || this.#failure !== null) { throw fail("ORIGINAL_PARENT"); }
    } catch (error) {
      if (!(error instanceof Error && failureCodes.get(error) === "NORMAL_LIFETIME")) { this.#poison("OWNER"); }
      throw error;
    }
  }
  public async start(): Promise<CurrentPcbWorkerStartupDependency> {
    if (this.#started) { throw fail("START_CONSUMED"); } this.#started = true;
    await this.#queue(async (): Promise<void> => {
      this.#withinLifetime();
      this.#sameMethods(); const original = await this.#parentMethod.call(this.#native); this.#sameMethods();
      this.#withinLifetime();
      if (!record(original) || types.isProxy(original) || !Object.isFrozen(original)) { throw fail("PARENT"); }
      const parent = (this.#footprintPurpose || this.#structurePurpose ? parentSchema.extend({ nextRequestId: z.number().int().min(1).max(this.#requestLimit) }) : parentSchema)
        .parse(captureCurrentPcbStringClockReply(original).value);
      if (this.#heldSavedBinding !== null) {
        if (parent.sessionId !== this.#heldSavedBinding.sessionId || parent.nextRequestId - 1 > CURRENT_FOOTPRINT_COPY_HELD_SAVED_PROFILE.normalRequestLimit) { throw fail("HELD_SAVED_PARENT"); }
        this.#heldSavedNormal = parent.nextRequestId - 1;
      }
      if (this.#released || this.#releaseRequested || this.#terminationVerified) { throw fail("START_CLOSING"); }
      this.#parent = original; this.#nextId = parent.nextRequestId;
    });
    const parent = this.#parent;
    if (parent === null || this.#released || this.#releaseRequested || this.#terminationVerified) { throw fail("START_CLOSING"); }
    const dependency = Object.freeze({ parentTargetId: parent.targetId, parentSessionId: parent.sessionId,
      assertOriginalOwner: (): Promise<void> => this.#current(),
      assertOriginalTermination: (): Promise<void> => this.#originalTermination(),
      request: (command: CurrentPcbWorkerStartupCommand): Promise<unknown> => this.#request(command),
      subscribe: (listener: (event: CurrentPcbWorkerStartupEvent) => void): (() => void) => {
        if (this.#listener !== null || this.#released) { throw fail("SUBSCRIBER"); }
        this.#listener = listener; this.#schedulePoll(0);
        return (): void => { if (this.#listener === listener) { this.#listener = null; } };
      },
    });
    if (this.#footprintPurpose && !this.#savedPurpose) { footprintDependencies.add(dependency); }
    if (this.#wire === currentFootprintForwardExecutionStartupWire) { forwardExecutionDependencies.add(dependency); }
    if (this.#structurePurpose) { structureDependencies.set(dependency, (): void => {
      this.#sameMethods(); this.#withinLifetime();
      if (this.#released || this.#releaseRequested || this.#terminationVerified || this.#failure !== null || this.#pending.size > 0 ||
        this.#queuedRequests !== 0 || this.#nextId - 1 > CURRENT_PROJECT_STRUCTURE_NATIVE_PROFILE.worker.derivation.startupNormal) { throw fail("STRUCTURE_PREFIX_CAPACITY"); }
    }); }
    if (this.#savedPurpose && !this.#forwardSavedObservation && this.#heldSavedBinding === null) { savedDependencies.add(dependency); }
    if (this.#heldSavedBinding !== null) {
      heldSavedDependencies.add(dependency);
    }
    if (this.#executionPurpose) { markCurrentFootprintExecutionDependency(dependency); executionDependencies.set(dependency, this); }
    if (this.#wire === currentFootprintForwardWriterStartupWire) {
      const context = (): Readonly<{ sessionId: string; uniqueContextId: string }> => {
        this.#sameMethods(); this.#withinLifetime();
        if (this.#released || this.#releaseRequested || this.#terminationVerified || this.#failure !== null || !this.#openingConsumed ||
            this.#executionWorkerSession === null || this.#executionChildContext === null || !this.#workers.has(this.#executionWorkerSession)) { throw fail("FORWARD_WRITER_PRODUCER_CONTEXT"); }
        return Object.freeze({ sessionId: this.#executionWorkerSession, uniqueContextId: this.#executionChildContext });
      };
      const current = async (): Promise<void> => { context(); await this.#current(); context(); };
      const producerBinding: CurrentFootprintForwardWriterProducerChannelBindings = Object.freeze({ dependency, context, assertCurrent: current,
        prepare: async (bootstrap: CurrentFootprintForwardWriterProducerBootstrap): Promise<void> => {
          const prepare = this.#forwardWriterProducerPrepare;
          if (prepare === null || this.#forwardWriterProducerPrepared) { throw fail("FORWARD_WRITER_PRODUCER_PREPARE_ONCE"); }
          this.#forwardWriterProducerPrepared = true; await current(); await prepare(bootstrap); await current();
        },
        bind: async (scriptId: string): Promise<void> => {
          await current(); if (!this.#forwardWriterProducerPrepared || this.#forwardWriterProducerBound || !token.safeParse(scriptId).success) { throw fail("FORWARD_WRITER_PRODUCER_BIND_ONCE"); }
          const original = context(); this.#forwardWriterProducerBound = true;
          const reply = captureCurrentPcbStringClockReply(await this.#exchange.call(this.#native, { action: "footprint-forward-producer-bind", workerContext: original.uniqueContextId, scriptId })).value;
          await current(); if (!record(reply) || !exact(reply, ["bound"]) || reply["bound"] !== true) { throw fail("FORWARD_WRITER_PRODUCER_BIND_ACK"); }
        },
        enroll: async () => {
          await current(); if (!this.#forwardWriterProducerBound || this.#forwardWriterProducerEnrolled) { throw fail("FORWARD_WRITER_PRODUCER_ENROLL_ONCE"); }
          this.#forwardWriterProducerEnrolled = true;
          const reply = captureCurrentPcbStringClockReply(await this.#exchange.call(this.#native, { action: "footprint-forward-producer-enroll" })).value;
          await current(); if (!record(reply) || !exact(reply, ["enrolled"]) || reply["enrolled"] !== true) { throw fail("FORWARD_WRITER_PRODUCER_ENROLL_ACK"); }
        },
        request: (command: Parameters<CurrentFootprintForwardWriterProducerChannelBindings["request"]>[0]): Promise<unknown> => { const original = context(); if (!this.#forwardWriterProducerBound) { return Promise.reject(fail("FORWARD_WRITER_PRODUCER_UNBOUND")); }
          return this.#request({ ...command, sessionId: original.sessionId }, false, false, undefined, false, false, false, true); },
      });
      forwardWriterProducerChannels.set(dependency, producerBinding);
    }
    return dependency;
  }
  #poison(code: string, fatal = false): void {
    const first = this.#failure === null;
    this.#failure ??= fail(code); this.#failureCode ??= code; this.#fatal ||= fatal;

    if (this.#clockRpc !== null && (!this.#clockRpc.retired || this.#clockRpc.create !== null)) { this.#clockRpc.budget.fail(); }
    if (first) {
      try { this.#footprintParentSubscriber?.lost(); }
      catch { this.#fatal = true; }
    }
    for (const pending of this.#pending.values()) {
      if (!pending.allocation && !pending.settled) { pending.settled = true; pending.completion.reject(this.#failure); }
    }
  }
  #queue(work: () => Promise<void>): Promise<void> {
    const previous = this.#tail;
    const next = (async (): Promise<void> => { await previous; await work(); })();
    this.#tail = observe(next); return next;
  }
  /** Keep the fixed leaf on the original realm, target and single held tuple.
   * Metadata handles have their own roles; they cannot replace the tuple used
   * by rechecks/getter/namespace observations. Attempts consume at dispatch. */
  #attributeHeld(command: CurrentFootprintSavedCacheHeldCommand): void {
    const binding = this.#heldSavedBinding, phase = command.heldCachePhase;
    if (binding === null || command.sessionId !== binding.sessionId || this.#openingConsumed ||
        this.#heldCacheReleaseAttempted || (phase === "release" ? this.#heldCacheStep === 0 : heldSavedSequence[this.#heldCacheStep] !== phase)) { throw fail("HELD_CACHE_SEQUENCE"); }
    if (phase === "capture") {
      if (command.params.uniqueContextId !== binding.uniqueContextId) { throw fail("HELD_CACHE_CONTEXT"); }
    } else if (phase !== "release" && !["array-properties", "constructor-properties", "match-properties", "getter-properties"].includes(phase) &&
        command.params.objectId !== this.#heldCacheTuple) { throw fail("HELD_CACHE_TUPLE"); }
    if ((phase === "queue-first" || phase === "queue-fresh") &&
        (command.params.arguments[0].value !== binding.projectUuid || command.params.arguments[1].value !== binding.branchUuid)) { throw fail("HELD_CACHE_TARGET"); }
  }
  #attributed(command: ChannelCommand, manager = false, clock = false, parentKind?: CurrentFootprintParentCommandKind, registration = false, producer = false, copyTail: "local" | "upload" | "branch" | "publication" | "tail-observe" | "drain" | "post" | "delete" | "own-data" | "startup-ws" | "ticket-timer" | null = null): void {
    if (this.#parent === null || this.#released || this.#releaseRequested || this.#terminationVerified) { throw fail("NOT_STARTED"); }

    if(copyTail==="ticket-timer"&&this.#clockRpc===null){
      if(this.#wire!==currentFootprintForwardWriterStartupWire||!this.#forwardWriterProducerBound||!this.#openingConsumed||this.#clockRpcHandoffPending||command.sessionId!==this.#executionWorkerSession||command.sessionId===undefined||!this.#workers.has(command.sessionId)){throw fail("FORWARD_TICKET_ORIGINAL_PRECREATE");}return;
    }
    if (copyTail === "branch" || copyTail==="own-data" || copyTail==="startup-ws" || copyTail==="tail-observe" && "phase" in command && command.phase==="via-tail-arm") {
      if (this.#wire !== currentFootprintForwardWriterStartupWire || !this.#forwardWriterProducerBound || !this.#openingConsumed ||
          this.#clockRpc !== null || this.#clockRpcHandoffPending || command.sessionId !== this.#executionWorkerSession ||
          command.sessionId === undefined || !this.#workers.has(command.sessionId)) { throw fail("FORWARD_BRANCH_QUERY_ORIGINAL_PRECREATE"); }
      if(copyTail==="own-data"&&command.method==="Runtime.callFunctionOn"&&"uniqueContextId" in command.params&&command.params.uniqueContextId!==this.#executionChildContext){throw fail("FORWARD_OWN_DATA_ORIGINAL_CONTEXT");}
      return;
    }
    if (copyTail) {
      const create = this.#clockRpc?.create;
      if (this.#wire !== currentFootprintForwardWriterStartupWire || this.#fullClock === null || create === null || create === undefined ||
          !create.dispatchAttempted || create.pending?.written !== true || create.pending.writeFailed || command.sessionId !== this.#executionWorkerSession ||
          command.sessionId === undefined || !this.#workers.has(command.sessionId)) { throw fail("FORWARD_COPY_LOCAL_ORIGINAL_CREATE"); }
      this.#requireFullClock(); create.binding.requireInvocationConsumed(); return;
    }
    if (producer) {
      if (this.#wire !== currentFootprintForwardWriterStartupWire || !this.#forwardWriterProducerBound || command.sessionId !== this.#executionWorkerSession ||
          command.sessionId === undefined || !this.#workers.has(command.sessionId) || !("phase" in command) || !("forwardStartupFrontier" in command || command.phase.startsWith("project-save-producer-") || command.phase.startsWith("inverse-initial-cache-") || command.phase.startsWith("inverse-initial-sync-"))) { throw fail("FORWARD_WRITER_PRODUCER_ATTRIBUTION"); }
      if (command.method === "Runtime.callFunctionOn" && "uniqueContextId" in command.params && command.params.uniqueContextId !== this.#executionChildContext) { throw fail("FORWARD_WRITER_PRODUCER_ORIGINAL_CONTEXT"); }
      return;
    }
    if ("heldCachePhase" in command) { this.#attributeHeld(command); return; }
    if (this.#forwardSavedObservation && (command.method === "Target.setAutoAttach" ||
        !("phase" in command) && command.method === "Runtime.callFunctionOn" && "uniqueContextId" in command.params && command.params.arguments.length > 0 ||
        "phase" in command && command.phase === "saved-upload-queue" && this.#savedQueueReads > 0)) {
      throw fail("FORWARD_SAVED_OBSERVATION_ONLY");
    }
    if (registration && this.#wire === currentFootprintForwardWriterStartupWire) {
      const sequence = ["initial", "properties", "properties", "wrapper-source", "properties", "callback", "properties", "callback-source", "properties", "bindings", "properties", "properties", "properties", "properties", "properties", "properties", "properties", "sample"];
      const phase = "phase" in command ? command.phase : null;
      if (!this.#executionPurpose || !this.#openingConsumed || !this.#footprintUiStarted || this.#footprintUiReleased || command.sessionId !== this.#parent.sessionId ||
          this.#footprintClockRegistrationReleased || phase === null || this.#footprintClockRegistrationRequests >= CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_V2_REQUESTS.total ||
          (this.#forwardWriterRegistrationStep < sequence.length ? phase !== "release" && phase !== sequence[this.#forwardWriterRegistrationStep] :
            phase !== "release" && (phase !== (this.#forwardWriterRegistrationStep % 5 === 2 ? "sample" : "properties") || this.#forwardWriterRegistrationStep >= sequence.length + 20))) { throw fail("FORWARD_WRITER_CLOCK_REGISTRATION_SEQUENCE"); }
      return;
    }
    if (registration) {
      if (!("phase" in command) || !this.#executionPurpose || !this.#openingConsumed || !this.#footprintUiStarted || this.#footprintUiReleased ||
          command.sessionId !== this.#parent.sessionId || this.#footprintClockRegistrationReleased ||
          (command.phase === "initial" ? this.#footprintClockRegistrationStarted : !this.#footprintClockRegistrationStarted) ||
          command.phase === "source" && this.#footprintClockRegistrationSourceConsumed ||
          command.phase === "callback" && this.#footprintClockRegistrationCallbackConsumed ||
          command.phase === "bindings" && this.#footprintClockRegistrationBindingsConsumed ||
          command.phase === "sample" && this.#footprintClockRegistrationSamples >= 1 + CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_REQUESTS.maximumAdditionalSamples ||
          this.#footprintClockRegistrationRequests >= CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_REQUESTS.total - (command.phase === "release" ? 0 : 1)) { throw fail("FOOTPRINT_CLOCK_REGISTRATION_SEQUENCE"); }
      return;
    }
    if ("phase" in command && command.phase === "cache-construction") {
      if (!this.#executionPurpose || this.#executionWorkerSession === null || command.sessionId !== this.#executionWorkerSession ||
        !this.#openingConsumed || this.#footprintCacheRequests >= CURRENT_FOOTPRINT_COPY_CACHE_CONSTRUCTION_REQUESTS.total +
          CURRENT_FOOTPRINT_COPY_CACHE_CONSTRUCTION_REQUESTS.reproof) { throw fail("FOOTPRINT_CACHE_OWNER"); }
      return;
    }
    if ("phase" in command && command.phase === "saved-upload-queue") {
      const scope = JSON.stringify(command.params.arguments.map(argument => argument.value));
      if (!this.#savedPurpose || this.#heldSavedBinding !== null || command.sessionId !== this.#parent.sessionId || this.#openingConsumed || this.#savedQueueReads >= 2 ||
        this.#savedQueueContext !== null && this.#savedQueueContext !== command.params.uniqueContextId ||
        this.#savedQueueScope !== null && this.#savedQueueScope !== scope) { throw fail("SAVED_QUEUE_OWNER"); }
      return;
    }
    if (parentKind !== undefined) {
      if (!this.#executionPurpose || this.#footprintParentSubscriber === null || !("phase" in command)) { throw fail("FOOTPRINT_PARENT_OWNER"); }
      if (parentKind === "construction") {
        if (command.sessionId !== this.#parent.sessionId || !this.#openingConsumed &&
            !["source", "breakpoint-before", "breakpoint-after"].includes(command.phase)) { throw fail("FOOTPRINT_PARENT_SEQUENCE"); }
      } else {
        if (!this.#openingConsumed || this.#executionWorkerSession === null ||
            command.sessionId !== this.#parent.sessionId && command.sessionId !== this.#executionWorkerSession) { throw fail("FOOTPRINT_PEER_SESSION"); }
        if (command.method === "Runtime.callFunctionOn" && "uniqueContextId" in command.params &&
            command.params.uniqueContextId !== this.#executionChildContext) { throw fail("FOOTPRINT_PEER_CONTEXT"); }
      }
      return;
    }
    if (clock) {
      if (!this.#executionPurpose || !this.#openingConsumed || command.sessionId === undefined || command.sessionId !== this.#executionWorkerSession || !this.#workers.has(command.sessionId) ||
        this.#footprintClockSession !== null && command.sessionId !== this.#footprintClockSession ||
        this.#footprintClockRequests >= CURRENT_FOOTPRINT_COPY_TRANSACTION_CLOCK_REQUESTS) { throw fail("FOOTPRINT_CLOCK_OWNER"); }
      return;
    }
    if (manager) {
      if (!("phase" in command) || !this.#footprintPurpose || !this.#openingConsumed || !this.#footprintUiStarted || this.#footprintUiReleased && command.phase !== "release" ||
          command.sessionId !== this.#parent.sessionId || this.#footprintManagerReleased ||
          (command.phase === "initial" ? this.#footprintManagerStarted : !this.#footprintManagerStarted) ||
          command.phase === "source" && this.#footprintManagerSourceConsumed) { throw fail("FOOTPRINT_MANAGER_ROUTE_SEQUENCE"); }
      return;
    }
    if ("phase" in command) {
      if (!this.#footprintPurpose || !this.#openingConsumed || command.sessionId !== this.#parent.sessionId || this.#footprintUiReleased ||
          command.phase === "release" && this.#footprintClockRegistrationStarted && !this.#footprintClockRegistrationReleased ||
          (command.phase === "initial" ? this.#footprintUiStarted : !this.#footprintUiStarted)) { throw fail("FOOTPRINT_UI_SEQUENCE"); }
      if (command.method === "Runtime.callFunctionOn" && "uniqueContextId" in command.params && command.params.uniqueContextId !== this.#openingContext) {
        throw fail("FOOTPRINT_UI_CONTEXT");
      }
      return;
    }
    if (command.method === "Target.setAutoAttach") {
      if (command.sessionId !== this.#parent.sessionId || this.#attachIssued) { throw fail("ATTACHMENT"); }
      return;
    }
    if (parentCommand(command)) {
      if (command.method !== "Target.getTargets" && command.sessionId !== this.#parent.sessionId) { throw fail("PARENT_SESSION"); }
      if (command.method === "Debugger.getScriptSource" && (!this.#pcbOpeningConsumed || this.#pcbSourceConsumed)) { throw fail("PCB_SOURCE_SEQUENCE"); }
      if (command.method === "Runtime.callFunctionOn" && "uniqueContextId" in command.params) {
        if (command.params.arguments.length === 0) {
          if (!this.#openingConsumed || command.params.uniqueContextId !== this.#openingContext || this.#actorReads >= 2) { throw fail("ACTOR_SEQUENCE"); }
          return;
        }
        const identity = JSON.stringify([command.params.uniqueContextId, command.params.arguments[0].value]);
        const phase = command.params.arguments[1].value;
        if (this.#savedPurpose) {
          const target = command.params.arguments[0].value;
          const binding = this.#heldSavedBinding;
          if (binding === null ? this.#savedQueueReads < 1 || this.#savedQueueContext !== command.params.uniqueContextId ||
            this.#savedQueueScope !== JSON.stringify([target.projectUuid, target.branchUuid]) ||
            phase === "open-project" && this.#savedQueueReads !== 2 :
            command.params.uniqueContextId !== binding.uniqueContextId || target.projectUuid !== binding.projectUuid ||
            target.branchUuid !== binding.branchUuid || this.#heldCacheStep < 9 ||
            (phase === "preflight" ? this.#heldCacheReleaseAttempted : this.#heldCacheStep !== heldSavedSequence.length || !this.#heldCacheReleased)) { throw fail("SAVED_REPLAY_BRACKETS"); }
        }
        if (command.params.functionDeclaration === CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_FUNCTION) {
          if (!this.#openingConsumed || this.#openingIdentity !== identity ||
              phase === "preflight" && this.#pcbPreflightConsumed ||
              phase === "open-document" && (!this.#pcbPreflightConsumed || this.#pcbOpeningConsumed) ||
              phase === "observe" && (!this.#pcbSourceConsumed || this.#pcbObservationConsumed)) { throw fail("PCB_OPENING_SEQUENCE"); }
          return;
        }
        if (phase === "preflight" ? this.#openingIdentity !== null :
            !this.#attachAcknowledged || this.#openingIdentity !== identity || this.#openingConsumed) { throw fail("OPENING_SEQUENCE"); }
      }
      return;
    }
    if (command.sessionId === undefined) { throw fail("WORKER_SESSION"); }
    if (!this.#workers.has(command.sessionId)) { throw fail("WORKER_SESSION"); }
    if (this.#executionPurpose && command.method === "Runtime.enable" &&
        (!this.#openingConsumed || this.#executionWorkerSession !== null)) { throw fail("EXECUTION_WORKER_RUNTIME"); }
  }
  // oxlint-disable-next-line eslint/require-await -- Return the original retained completion, with synchronous guards converted to rejection.
  async #request(raw: ChannelCommand, manager = false, clock = false, parentKind?: CurrentFootprintParentCommandKind, registration = false, heldCache = false, coldTail = false, producer = false, copyTail: "local" | "upload" | "branch" | "publication" | "tail-observe" | "drain" | "post" | "delete" | "own-data" | "startup-ws" | "ticket-timer" | null = null): Promise<unknown> {

    if (coldTail) { this.#sameColdTail(true); }
    else if (!((producer || copyTail) && this.#wire === currentFootprintForwardWriterStartupWire && this.#fullClock !== null) && (this.#clockRpcHandoffPending || this.#clockRpc !== null && (!this.#clockRpc.retired || this.#clockRpc.create !== null))) { throw fail("FOOTPRINT_RPC_EXCLUSIVE"); }
    // Select the fixed grammar only after rejecting prototype/proxy traps.
    if (!record(raw) || types.isProxy(raw) ||
      Object.getPrototypeOf(raw) !== Object.prototype && Object.getPrototypeOf(raw) !== null) { throw fail("COMMAND"); }
    if ("phase" in raw && (!this.#footprintPurpose || this.#savedPurpose &&
      Object.getOwnPropertyDescriptor(raw, "phase")?.value !== "saved-upload-queue")) { throw fail("FOOTPRINT_UI_PURPOSE"); }
    const copyWire = manager ? currentFootprintCopyManagerRouteWire : currentFootprintCopyUiWire;
    const encode = (value: ChannelCommand, id: number): Readonly<{ command: ChannelCommand & Readonly<{ id: number }>; request: Readonly<Record<string, string | number>> }> => {

      if (copyTail) {
        if (value.sessionId === undefined) { throw fail("FORWARD_COPY_LOCAL_ORIGINAL_SESSION"); }
        const { sessionId, ...input } = value;
        let wire: ReturnType<typeof currentFootprintForwardWriterTicketTimerWire> | ReturnType<typeof currentFootprintForwardWriterStartupWsWire> | ReturnType<typeof currentFootprintForwardWriterOwnDataFixedWire> | ReturnType<typeof currentFootprintForwardWriterCopyLocalWire> | ReturnType<typeof currentFootprintForwardWriterCopyUploadWire> | ReturnType<typeof currentFootprintForwardWriterBranchQueryWire> | ReturnType<typeof currentFootprintForwardWriterPublicationWire> | ReturnType<typeof currentFootprintForwardWriterCopyTailObservationWire> | ReturnType<typeof currentFootprintForwardWriterCopyDrainWire> | ReturnType<typeof currentFootprintForwardWriterPostHistorySyncWire> | ReturnType<typeof currentFootprintForwardWriterCopyDeleteWire>;
        if(copyTail==="ticket-timer"){wire=currentFootprintForwardWriterTicketTimerWire(input,id);}
        else if(copyTail==="startup-ws"){wire=currentFootprintForwardWriterStartupWsWire(input,id);}
        else if(copyTail==="own-data"){wire=currentFootprintForwardWriterOwnDataFixedWire(input,id,sessionId);}
        else if (copyTail === "local") { wire = currentFootprintForwardWriterCopyLocalWire(input, id); }
        else if (copyTail === "upload") { wire = currentFootprintForwardWriterCopyUploadWire(input, id); }
        else if(copyTail==="drain"){wire=currentFootprintForwardWriterCopyDrainWire(input,id);}
        else if(copyTail==="post"){wire=currentFootprintForwardWriterPostHistorySyncWire(input,id);}
        else if(copyTail==="delete"){wire=currentFootprintForwardWriterCopyDeleteWire(input,id);}
        else if(copyTail==="tail-observe"){wire=currentFootprintForwardWriterCopyTailObservationWire(input,id);}
        else if(copyTail==="publication"){
          const own=Object.getOwnPropertyDescriptor(input,"forwardCopyPublication");if(own===undefined||!Object.hasOwn(own,"value")){throw fail("FORWARD_PUBLICATION_LANE");}
          const {forwardCopyPublication,...command}=z.record(z.string(),z.unknown()).parse(input);if(forwardCopyPublication!=="callback"&&forwardCopyPublication!=="queue"){throw fail("FORWARD_PUBLICATION_LANE");}
          wire=currentFootprintForwardWriterPublicationWire({phase:"forward-copy-publication",lane:forwardCopyPublication,command},id);
          return {command:{...wire.command,forwardCopyPublication,sessionId,id},request:wire.request};
        }
        else { wire = currentFootprintForwardWriterBranchQueryWire(input, id); }
        return { command: { ...wire.command, sessionId, id }, request: wire.request };
      }
      if (producer) {
        if (value.sessionId === undefined) { throw fail("FORWARD_WRITER_PRODUCER_SESSION"); }
        const { sessionId, ...command } = value; return currentFootprintForwardWriterProducerWire(command, id, sessionId);
      }
      if (coldTail) { this.#sameColdTail(cleanupCommand(value)); return currentFootprintForwardColdTailWire(value, id); }
      if (heldCache) {
        if (this.#heldSavedBinding === null) { throw fail("HELD_CACHE_PURPOSE"); }
        return currentFootprintSavedCacheHeldWire(value, id);
      }
      if (registration) { if (this.#parent === null) { throw fail("NOT_STARTED"); } return this.#wire === currentFootprintForwardWriterStartupWire ? currentFootprintCopyClockRegistrationV2Wire(value, id, this.#parent.sessionId) : currentFootprintCopyClockRegistrationWire(value, id, this.#parent.sessionId); }
      if (Object.getOwnPropertyDescriptor(value, "phase")?.value === "saved-upload-queue") { return currentFootprintCopySavedQueueWire(value, id); }
      if (Object.getOwnPropertyDescriptor(value, "phase")?.value === "cache-construction") { return currentFootprintCacheConstructionWire(value, id); }
      if (parentKind !== undefined) {
        if (this.#parent === null) { throw fail("NOT_STARTED"); }
        return currentFootprintCopyParentWire(value, id, parentKind, this.#parent.sessionId, this.#executionWorkerSession);
      }
      if (clock) { return clockWire(value, id); }
      return "phase" in value ? copyWire(value, id) : this.#wire(value, id);
    };
    const normalized = encode(raw, 1).command;
    const { id: _id, ...command } = normalized;
    this.#attributed(command, manager, clock, parentKind, registration, producer, copyTail);
    this.#withinLifetime(!copyTail && cleanupCommand(command));
    if (this.#fatal || this.#failure !== null && (copyTail || !cleanupCommand(command))) { throw this.#failure ?? fail("FATAL"); }
    if (this.#queuedRequests >= 32) { throw fail("QUEUE_BUDGET"); } this.#queuedRequests += 1;
    const completion = Promise.withResolvers<unknown>();
    const queued = this.#queue(async (): Promise<void> => {
      let pending: Pending | null = null;
      let exchangeAttempted = false;
      try {
        if (copyTail || !cleanupCommand(command)) { await this.#currentWithinQueue(); }
        this.#attributed(command, manager, clock, parentKind, registration, producer, copyTail);
        this.#withinLifetime(!copyTail && cleanupCommand(command));
        const cleanup = !copyTail && cleanupCommand(command);
        let limit = this.#heldSavedBinding === null && this.#footprintPurpose && !cleanup ? this.#footprintProfile.normalRequestLimit : this.#requestLimit;
        if (this.#structurePurpose && !cleanup) { limit = CURRENT_PROJECT_STRUCTURE_NATIVE_PROFILE.worker.normal; }
        if (this.#fatal || this.#released || this.#nextId > limit) { throw fail("REQUEST_BUDGET"); }
        if (this.#heldSavedBinding !== null && (cleanup ? this.#heldSavedCleanup >= CURRENT_FOOTPRINT_COPY_HELD_SAVED_PROFILE.cleanupRequestLimit :
          this.#heldSavedNormal >= this.#footprintProfile.normalRequestLimit)) { throw fail("HELD_SAVED_REQUEST_CLASS"); }
        const wire = encode(command, this.#nextId);
        if ((producer || copyTail) && this.#fullClock !== null && this.#clockRpc?.begun === true && !this.#clockRpc.retired) {
          this.#requireFullClock(); if (!(this.#clockRpc.budget instanceof CurrentFootprintForwardWriterAllocatedCreateClockBudget)) { throw fail("FORWARD_WRITER_CLOCK_ORIGINAL_BUDGET"); }
          this.#clockRpc.budget.consumeOriginalProducerRequest(this.#nextId);
        }
        this.#nextId += 1;
        if (this.#heldSavedBinding !== null) { if (cleanup) { this.#heldSavedCleanup += 1; } else { this.#heldSavedNormal += 1; } }
        if ("heldCachePhase" in command) {
          if (command.heldCachePhase === "release") { this.#heldCacheReleaseAttempted = true; }
          else { this.#heldCacheStep += 1; }
          if (command.heldCachePhase === "array-properties") { this.#heldCacheTuple = command.params.objectId; }
        }
        if (this.#executionPurpose && command.method === "Runtime.enable") { this.#executionWorkerSession = command.sessionId ?? null; }
        if (clock) { this.#footprintClockSession ??= command.sessionId ?? null; this.#footprintClockRequests += 1; }
        pending = { id: wire.command.id, command, completion,
          ...(copyTail ? { plannedForwardTail: true as const } : {}),
          ...(this.#heldSavedBinding !== null && cleanup ? { heldSavedCleanup: true as const } : {}),
          allocation: command.method === "Debugger.setBreakpoint" || command.method === "Debugger.setInstrumentationBreakpoint",
          written: false, writeFailed: false, replied: false, result: null, remoteError: false, settled: false };
        this.#pending.set(pending.id, pending);
        if ("phase" in command && command.phase === "cache-construction") { this.#footprintCacheRequests += 1; }
        if ("phase" in command && command.phase === "saved-upload-queue") {
          this.#savedQueueReads += 1; this.#savedQueueContext ??= command.params.uniqueContextId;
          this.#savedQueueScope ??= JSON.stringify(command.params.arguments.map(argument => argument.value));
        }
        if (command.method === "Target.setAutoAttach") { this.#attachIssued = true; }
        if (command.method === "Debugger.getScriptSource" && "pcbPhase" in command) { this.#pcbSourceConsumed = true; }
        if (registration && "phase" in command) {
          this.#footprintClockRegistrationRequests += 1;
          if (this.#wire === currentFootprintForwardWriterStartupWire && command.phase !== "release") { this.#forwardWriterRegistrationStep += 1; }
          if (command.phase === "initial") { this.#footprintClockRegistrationStarted = true; }
          if (command.phase === "source") { this.#footprintClockRegistrationSourceConsumed = true; }
          if (command.phase === "callback") { this.#footprintClockRegistrationCallbackConsumed = true; }
          if (command.phase === "bindings") { this.#footprintClockRegistrationBindingsConsumed = true; }
          if (command.phase === "sample") { this.#footprintClockRegistrationSamples += 1; }
          if (command.phase === "release") { this.#footprintClockRegistrationReleased = true; }
        } else if (manager && "phase" in command) {
          if (command.phase === "initial") { this.#footprintManagerStarted = true; }
          if (command.phase === "source") { this.#footprintManagerSourceConsumed = true; }
          if (command.phase === "release") { this.#footprintManagerReleased = true; }
        } else if ("phase" in command) {
          if (command.phase === "initial") { this.#footprintUiStarted = true; }
          if (command.phase === "release") { this.#footprintUiReleased = true; }
        }
        if (!clock && parentKind === undefined && !("phase" in command) && !("heldCachePhase" in command) && command.method === "Runtime.callFunctionOn" && "uniqueContextId" in command.params) {
          if (command.params.arguments.length === 0) { this.#actorReads += 1; }
          else if (command.params.functionDeclaration === CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_FUNCTION) {
            if (command.params.arguments[1].value === "preflight") { this.#pcbPreflightConsumed = true; }
            else if (command.params.arguments[1].value === "open-document") { this.#pcbOpeningConsumed = true; }
            else { this.#pcbObservationConsumed = true; }
          }
          else if (command.params.arguments[1].value === "preflight") {
            this.#openingIdentity = JSON.stringify([command.params.uniqueContextId, command.params.arguments[0].value]);
            this.#openingContext = command.params.uniqueContextId;
            this.#openingProjectUuid = command.params.arguments[0].value.projectUuid;
          } else { this.#openingConsumed = true; }
        }
        exchangeAttempted = true;
        ackSchema.parse(captureCurrentPcbStringClockReply(await this.#exchange.call(this.#native, wire.request)).value);
        pending.written = true; this.#complete(pending);
      } catch (error) {
        if (exchangeAttempted && pending !== null && this.#exchangeFailure === null) {
          const native = currentPcbDiagnosticNativeRefusal(error);
          this.#exchangeFailure = Object.freeze({ requestId: pending.id, method: pending.command.method,
            nativeCode: native?.nativeCode ?? null, kind: native === null ? "unrecognized-exchange-failure" : "native-refusal" });
        }
        if (!(error instanceof Error && failureCodes.get(error) === "NORMAL_LIFETIME" && pending === null)) { this.#poison("WRITE"); }
        if (pending === null) { completion.reject(error); }
        else { pending.writeFailed = true; this.#complete(pending); }
      } finally { this.#queuedRequests -= 1; this.#schedulePoll(0); }
    });
    void observe(queued); return completion.promise;
  }
  /** Fixed copy-purpose parent requests share the original counter, stream and
   * attachment. Other purposes refuse before dispatch. */
  public requestFootprintUi(command: CurrentFootprintCopyUiCommand): Promise<unknown> {
    if (!this.#footprintPurpose || this.#savedPurpose) { return Promise.reject(fail("FOOTPRINT_UI_PURPOSE")); }
    return this.#request(command);
  }
  public requestFootprintManagerRoute(command: CurrentFootprintCopyManagerRouteCommand): Promise<unknown> {
    if (!this.#footprintPurpose || this.#savedPurpose) { return Promise.reject(fail("FOOTPRINT_MANAGER_ROUTE_PURPOSE")); }
    return this.#request(command, true);
  }
  public requestFootprintClockRegistration(command: CurrentFootprintCopyClockRegistrationCommand): Promise<unknown> {
    if (!this.#executionPurpose || this.#wire === currentFootprintForwardWriterStartupWire) { return Promise.reject(fail("FOOTPRINT_CLOCK_REGISTRATION_PURPOSE")); }
    return this.#request(command, false, false, undefined, true);
  }
  /** This separate fixed tail cannot widen the historical producer parser.
   * It becomes usable only after the same original native Create was written. */
  public requestForwardWriterCopyLocal(dependency: CurrentPcbWorkerStartupDependency, command: CurrentFootprintForwardWriterCopyLocalCommand): Promise<unknown> {
    if (this.#wire !== currentFootprintForwardWriterStartupWire || executionDependencies.get(dependency) !== this || this.#executionWorkerSession === null) { return Promise.reject(fail("FORWARD_COPY_LOCAL_ORIGINAL_CHANNEL")); }
    return this.#request({ ...command, sessionId: this.#executionWorkerSession }, false, false, undefined, false, false, false, false, "local");
  }
  /** Reflection helpers stay on this original preclock worker and pending
   * script event. A caller cannot select a helper script or substitute a program. */
  public originalForwardWriterCreateWritten(dependency:CurrentPcbWorkerStartupDependency):boolean{
    this.#sameMethods();const create=this.#clockRpc?.create;
    if(this.#wire!==currentFootprintForwardWriterStartupWire||executionDependencies.get(dependency)!==this||this.#fullClock===null||create===null||create===undefined||!create.dispatchAttempted||create.pending?.written!==true||create.pending.writeFailed){return false;}
    this.#requireFullClock();create.binding.requireInvocationConsumed();return true;
  }
  public async requestForwardWriterTicketTimer(dependency:CurrentPcbWorkerStartupDependency,input:CurrentFootprintForwardWriterTicketTimerCommand):Promise<unknown>{
    if(this.#wire!==currentFootprintForwardWriterStartupWire||executionDependencies.get(dependency)!==this||this.#executionWorkerSession===null){throw fail("FORWARD_TICKET_ORIGINAL_CHANNEL");}
    const command=validateCurrentFootprintForwardWriterTicketTimerCommand(input);
    if(command.phase==="ticket-timer-call"&&command.role==="capture"){
      if(this.#forwardWriterTicketHelper!==null){throw fail("FORWARD_TICKET_HELPER_ONCE");}this.#forwardWriterTicketHelper={command:input,program:CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_BINDING_PROGRAMS.capture,scriptId:null};
    }
    const helper=this.#forwardWriterTicketHelper;
    if(command.phase==="ticket-timer-guard-source"&&(helper===null||helper.scriptId===null||command.params.scriptId!==helper.scriptId)){throw fail("FORWARD_TICKET_ORIGINAL_HELPER");}
    const reply=await this.#request({...command,sessionId:this.#executionWorkerSession},false,false,undefined,false,false,false,false,"ticket-timer");
    if(command.phase==="ticket-timer-guard-source"){
      const raw=captureCurrentPcbStringClockReply(reply).value;
      if(helper===null||helper!==this.#forwardWriterTicketHelper||!record(raw)||!exact(raw,["scriptSource"])||raw["scriptSource"]!==`(${helper.program})`){this.#poison("FORWARD_TICKET_HELPER_SOURCE");throw fail("FORWARD_TICKET_HELPER_SOURCE");}
      this.#forwardWriterTicketHelper=null;
    }return reply;
  }
  public requestForwardWriterStartupWs(dependency:CurrentPcbWorkerStartupDependency,command:CurrentFootprintForwardWriterStartupWsCommand):Promise<unknown>{
    if(this.#wire!==currentFootprintForwardWriterStartupWire||executionDependencies.get(dependency)!==this||this.#executionWorkerSession===null){return Promise.reject(fail("FORWARD_STARTUP_WS_ORIGINAL_CHANNEL"));}
    return this.#request({...command,sessionId:this.#executionWorkerSession},false,false,undefined,false,false,false,false,"startup-ws");
  }
  public requestForwardWriterOwnData(dependency:CurrentPcbWorkerStartupDependency,input:CurrentFootprintForwardWriterOwnDataCommand):Promise<unknown>{
    if(this.#wire!==currentFootprintForwardWriterStartupWire||executionDependencies.get(dependency)!==this||this.#executionWorkerSession===null||this.#forwardWriterOwnDataHelper!==null){return Promise.reject(fail("FORWARD_OWN_DATA_ORIGINAL_CHANNEL"));}
    const command=validateCurrentFootprintForwardWriterOwnDataCommand(input);if(command.method==="Debugger.getScriptSource"){return Promise.reject(fail("FORWARD_OWN_DATA_PRIVATE_HELPER"));}
    const program=currentFootprintForwardWriterOwnDataProgram(command);if(program!==null){this.#forwardWriterOwnDataHelper={command:input,program,scriptId:null};}
    return this.#request({...command,sessionId:this.#executionWorkerSession},false,false,undefined,false,false,false,false,"own-data");
  }
  public async qualifyForwardWriterOwnDataHelper(dependency:CurrentPcbWorkerStartupDependency,command:CurrentFootprintForwardWriterOwnDataCommand,program:string):Promise<unknown>{
    const helper=this.#forwardWriterOwnDataHelper;
    if(this.#wire!==currentFootprintForwardWriterStartupWire||executionDependencies.get(dependency)!==this||this.#executionWorkerSession===null||helper===null||helper.command!==command||helper.program!==program||helper.scriptId===null){throw fail("FORWARD_OWN_DATA_ORIGINAL_HELPER");}
    const read=validateCurrentFootprintForwardWriterOwnDataCommand({phase:"forward-writer-own-data-helper",method:"Debugger.getScriptSource",params:{scriptId:helper.scriptId}});
    try{const raw=captureCurrentPcbStringClockReply(await this.#request({...read,sessionId:this.#executionWorkerSession},false,false,undefined,false,false,false,false,"own-data")).value;
      if(this.#forwardWriterOwnDataHelper!==helper||!record(raw)||!exact(raw,["scriptSource"])){throw fail("FORWARD_OWN_DATA_HELPER_REPLY");}
      qualifyCurrentFootprintForwardWriterOwnDataHelper(raw["scriptSource"],program);this.#forwardWriterOwnDataHelper=null;return raw;
    }catch(error){this.#poison("FORWARD_OWN_DATA_HELPER_FAILED");throw error;}
  }
  public requestForwardWriterBranchQuery(dependency: CurrentPcbWorkerStartupDependency, command: CurrentFootprintForwardWriterBranchQueryCommand): Promise<unknown> {
    if (this.#wire !== currentFootprintForwardWriterStartupWire || executionDependencies.get(dependency) !== this || this.#executionWorkerSession === null) { return Promise.reject(fail("FORWARD_BRANCH_QUERY_ORIGINAL_CHANNEL")); }
    return this.#request({ ...command, sessionId: this.#executionWorkerSession }, false, false, undefined, false, false, false, false, "branch");
  }
  public requestForwardWriterCopyDrain(dependency:CurrentPcbWorkerStartupDependency,command:CurrentPcbViaSaveDrainCommand):Promise<unknown>{
    if(this.#wire!==currentFootprintForwardWriterStartupWire||executionDependencies.get(dependency)!==this||this.#executionWorkerSession===null){return Promise.reject(fail("FORWARD_COPY_DRAIN_ORIGINAL_CHANNEL"));}
    return this.#request({...command,sessionId:this.#executionWorkerSession},false,false,undefined,false,false,false,false,"drain");
  }
  public requestForwardWriterCopyPost(dependency:CurrentPcbWorkerStartupDependency,command:CurrentPcbViaPostHistorySyncCommand):Promise<unknown>{
    if(this.#wire!==currentFootprintForwardWriterStartupWire||executionDependencies.get(dependency)!==this||this.#executionWorkerSession===null){return Promise.reject(fail("FORWARD_COPY_POST_ORIGINAL_CHANNEL"));}
    const wire=currentFootprintForwardWriterPostHistorySyncWire(command,1);
    return this.#request({...wire.command,sessionId:this.#executionWorkerSession},false,false,undefined,false,false,false,false,"post");
  }
  public requestForwardWriterCopyDelete(dependency:CurrentPcbWorkerStartupDependency,command:CurrentPcbViaSaveTailDeleteControlCommand):Promise<unknown>{
    if(this.#wire!==currentFootprintForwardWriterStartupWire||executionDependencies.get(dependency)!==this||this.#executionWorkerSession===null){return Promise.reject(fail("FORWARD_COPY_DELETE_ORIGINAL_CHANNEL"));}
    return this.#request({...command,sessionId:this.#executionWorkerSession},false,false,undefined,false,false,false,false,"delete");
  }
  public requestForwardWriterCopyTailObservation(dependency:CurrentPcbWorkerStartupDependency,command:CurrentPcbViaSaveTailObservationCommand):Promise<unknown>{
    if(this.#wire!==currentFootprintForwardWriterStartupWire||executionDependencies.get(dependency)!==this||this.#executionWorkerSession===null){return Promise.reject(fail("FORWARD_COPY_TAIL_ORIGINAL_CHANNEL"));}
    return this.#request({...command,sessionId:this.#executionWorkerSession},false,false,undefined,false,false,false,false,"tail-observe");
  }
  public requestForwardWriterPublication(dependency:CurrentPcbWorkerStartupDependency,input:CurrentFootprintForwardWriterPublicationCommand):Promise<unknown>{
    if(this.#wire!==currentFootprintForwardWriterStartupWire||executionDependencies.get(dependency)!==this||this.#executionWorkerSession===null){return Promise.reject(fail("FORWARD_PUBLICATION_ORIGINAL_CHANNEL"));}
    const wire=currentFootprintForwardWriterPublicationWire(input,1);
    return this.#request({...wire.command,forwardCopyPublication:input.lane,sessionId:this.#executionWorkerSession},false,false,undefined,false,false,false,false,"publication");
  }
  public requestForwardWriterCopyUpload(dependency: CurrentPcbWorkerStartupDependency, command: CurrentPcbViaUploadRequestCommand): Promise<unknown> {
    if (this.#wire !== currentFootprintForwardWriterStartupWire || executionDependencies.get(dependency) !== this || this.#executionWorkerSession === null) { return Promise.reject(fail("FORWARD_COPY_UPLOAD_ORIGINAL_CHANNEL")); }
    return this.#request({ ...command, sessionId: this.#executionWorkerSession }, false, false, undefined, false, false, false, false, "upload");
  }
  public requestForwardWriterClockRegistration(command: CurrentFootprintCopyClockRegistrationV2Command): Promise<unknown> {
    if (this.#wire !== currentFootprintForwardWriterStartupWire) { return Promise.reject(fail("FORWARD_WRITER_CLOCK_REGISTRATION_PURPOSE")); }
    return this.#request(command, false, false, undefined, true);
  }
  public requestFootprintSavedUploadQueue(command: CurrentFootprintCopySavedQueueCommand): Promise<unknown> {
    if (!this.#savedPurpose || this.#heldSavedBinding !== null) { return Promise.reject(fail("SAVED_QUEUE_PURPOSE")); }
    try {
      const captured = captureCurrentPcbStringClockReply(command).value;
      if (!record(captured)) { return Promise.reject(fail("SAVED_QUEUE_COMMAND")); }
      const parsed = currentFootprintCopySavedQueueWire({ ...captured, phase: "saved-upload-queue" }, 1);
      const { id: _id, ...original } = parsed.command; return this.#request(original);
    } catch (error) { return Promise.reject(error instanceof Error ? error : fail("SAVED_QUEUE_COMMAND")); }
  }
  /** Only the separately born held-saved purpose reaches this fixed codec.
   * Cleanup shares the global counter and retains its consumed attempt. */
  public async requestFootprintHeldSavedCache(command: CurrentFootprintSavedCacheHeldCommand): Promise<unknown> {
    if (this.#heldSavedBinding === null) { throw fail("HELD_CACHE_PURPOSE"); }
    const { id: _id, ...fixed } = currentFootprintSavedCacheHeldWire(command, 1).command;
    const reply = await this.#request(fixed, false, false, undefined, false, true);
    if (fixed.heldCachePhase === "release") { z.object({}).strict().parse(captureCurrentPcbStringClockReply(reply).value); this.#heldCacheReleased = true; }
    return reply;
  }



  /** The actual Core stdin cutoff must match this original physical pending
   * slot and its same-request token. A copied packet grants no write. */


  public requestFootprintCacheConstruction(command: CurrentFootprintCacheConstructionCommand): Promise<unknown> {
    if (!this.#executionPurpose || this.#executionWorkerSession === null) { return Promise.reject(fail("FOOTPRINT_CACHE_PURPOSE")); }
    try {
      const captured = captureCurrentPcbStringClockReply(command).value;
      if (!record(captured) || Object.hasOwn(captured, "sessionId") || Object.hasOwn(captured, "phase")) { return Promise.reject(fail("FOOTPRINT_CACHE_COMMAND")); }
      const parsed = currentFootprintCacheConstructionWire({ ...captured, phase: "cache-construction", sessionId: this.#executionWorkerSession }, 1);
      const { id: _id, ...original } = parsed.command; return this.#request(original);
    } catch (error) { return Promise.reject(error instanceof Error ? error : fail("FOOTPRINT_CACHE_COMMAND")); }
  }
  public originalExecutionProjectUuid(dependency: CurrentPcbWorkerStartupDependency): string {
    if (executionDependencies.get(dependency) !== this || !this.#executionPurpose || !this.#openingConsumed || this.#openingProjectUuid === null ||
      this.#released || this.#releaseRequested || this.#terminationVerified || this.#failure !== null) { throw fail("FOOTPRINT_CACHE_PROJECT"); }
    return this.#openingProjectUuid;
  }
  public requestFootprintParent(dependency: CurrentPcbWorkerStartupDependency,
    command: CurrentFootprintParentCommand, kind: CurrentFootprintParentCommandKind): Promise<unknown> {
    const route = requireCurrentFootprintCopyParentRoute(dependency);
    if (executionDependencies.get(dependency) !== this || command.sessionId === route.parentSessionId &&
        (command.method === "Debugger.getScriptSource" && command.params.scriptId !== route.managerScriptId ||
         command.method === "Debugger.setBreakpoint" && command.params.location.scriptId !== route.managerScriptId)) {
      return Promise.reject(fail("FOOTPRINT_PARENT_SOURCE"));
    }
    return this.#request(command, false, false, kind);
  }
  public subscribeFootprintParentEvents(dependency: CurrentPcbWorkerStartupDependency,
    listener: (event: CurrentPcbWorkerStartupEvent) => void, lost: () => void): () => void {
    const route = requireCurrentFootprintCopyParentRoute(dependency);
    if (!this.#executionPurpose || executionDependencies.get(dependency) !== this || this.#footprintParentSubscriptionConsumed ||
        this.#parent === null || route.parentSessionId !== this.#parent.sessionId || this.#released || this.#releaseRequested ||
        this.#failure !== null || this.#openingConsumed) { throw fail("FOOTPRINT_PARENT_SUBSCRIBER"); }
    this.#footprintParentSubscriptionConsumed = true;
    const selected = Object.freeze({ event: (event: CurrentPcbWorkerStartupEvent): void => {
      route.assertOriginalSynchronous(); listener(event); route.assertOriginalSynchronous();
    }, lost });
    this.#footprintParentSubscriber = selected;
    return (): void => {
      if (this.#footprintParentSubscriber !== selected) { throw fail("FOOTPRINT_PARENT_SUBSCRIBER"); }
      this.#footprintParentSubscriber = null;
    };
  }
  public requestFootprintClock(command: ClockCommand): Promise<unknown> {
    if (!this.#executionPurpose || this.#clockRpcAttempted) { return Promise.reject(fail("FOOTPRINT_CLOCK_PURPOSE")); }
    return this.#request(command, false, true);
  }
  /** Quiesce the one original queue before its synchronous transport handoff.
   * Polling remains suspended until begin or original-generation cleanup. */
  // oxlint-disable-next-line eslint/require-await -- Convert synchronous purpose refusal to rejection while retaining the original preparation promise.
  public async prepareFootprintClockRpc(dependency: CurrentPcbWorkerStartupDependency,
    workerSessionId: string): Promise<CurrentFootprintCopyClockRpcChannelReservation> {
    if (this.#createClockPurpose) { throw fail("FOOTPRINT_RPC_PURPOSE"); }
    return this.#prepareClockRpc(dependency, workerSessionId, null);
  }
  /** Private unmounted writer-channel composition. Existing validation channels
   * cannot upgrade into it, even with a genuine construction invocation lease. */
  public async prepareFootprintCreateClockRpc(dependency: CurrentPcbWorkerStartupDependency, workerSessionId: string,
    lease: CurrentFootprintCopyCreateInvocationLease, plan: CurrentFootprintCopyV2Plan): Promise<CurrentFootprintCopyClockRpcChannelReservation> {
    if (!this.#createClockPurpose || executionDependencies.get(dependency) !== this || this.#clockRpcAttempted) { throw fail("FOOTPRINT_CREATE_PURPOSE"); }
    const binding = requireCurrentFootprintCopyCreateInvocationLease(lease);
    await binding.assertOriginal();
    const command = currentFootprintCopyNativeCreateCommand(workerSessionId, binding.projectObjectId, binding.handles, plan, binding.prewriteHandles);
    if (command.params.arguments[5].value !== this.#openingProjectUuid) { throw fail("FOOTPRINT_CREATE_PROJECT"); }
    binding.assertCleanup();
    const create: CreateClockState = { allocation: this.#allocationPurpose, copyPlan: plan, binding, command, token: Object.freeze({ profile: "private.current-footprint-copy-pending-create.v1" }),
      dispatchAttempted: false, pending: null, rejectedFrame: null };
    return this.#prepareClockRpc(dependency, workerSessionId, create);
  }
  #requireFullClock(): CurrentFootprintForwardWriterClockChannelBindings {
    const full = this.#fullClock;
    if (full === null || this.#wire !== currentFootprintForwardWriterStartupWire || full.reprove() !== full.binding ||
        executionDependencies.get(full.binding.dependency) !== this) { throw fail("FORWARD_WRITER_CLOCK_ORIGINAL_CHANNEL"); } return full.binding;
  }
  /** A genuine full origin retains its continuously armed producer source.
   * The old v2/Combined entry points cannot install this separate route. */
  public async prepareForwardWriterCreateClockRpc(dependency: CurrentPcbWorkerStartupDependency, origin: CurrentFootprintForwardWriterClockChannelOrigin): Promise<CurrentFootprintCopyClockRpcChannelReservation> {
    if (this.#wire !== currentFootprintForwardWriterStartupWire || executionDependencies.get(dependency) !== this || this.#fullClockPreparing || this.#fullClock !== null || this.#clockRpcAttempted) { throw fail("FORWARD_WRITER_CLOCK_CONSUMED"); }
    this.#fullClockPreparing = true; const original = await resolveCurrentFootprintForwardWriterClockChannelOrigin(origin, dependency);
    const binding = original.binding; this.#fullClock = Object.freeze({ origin, binding, reprove: original.reprove });
    await binding.assertOriginal(); this.#requireFullClock(); const invocation = requireCurrentFootprintCopyCreateInvocationLease(binding.invocationLease); await invocation.assertOriginal(); this.#requireFullClock();
    if (invocation.clockLease !== binding.workerLease) { throw fail("FORWARD_WRITER_CLOCK_ORIGINAL_LEASE"); }
    const workerSessionId = requireCurrentFootprintForwardWriterProducerChannel(dependency).context().sessionId;
    const command = currentFootprintCopyNativeCreateCommand(workerSessionId, invocation.projectObjectId, invocation.handles, binding.copyPlan, invocation.prewriteHandles);
    if (command.params.arguments[5].value !== this.#openingProjectUuid) { throw fail("FORWARD_WRITER_CLOCK_PROJECT"); }
    const create: CreateClockState = { allocation: true, copyPlan: binding.copyPlan, binding: invocation, command,
      token: Object.freeze({ profile: "private.current-footprint-copy-pending-create.v1" }), dispatchAttempted: false, pending: null, rejectedFrame: null };
    return this.#prepareClockRpc(dependency, workerSessionId, create);
  }
  public beginForwardWriterCreateClockRpc(dependency: CurrentPcbWorkerStartupDependency, reservation: CurrentFootprintCopyClockRpcChannelReservation): Promise<CurrentFootprintForwardWriterCreateClockChannelRoute> {
    const binding = this.#requireFullClock(); if (binding.dependency !== dependency) { return Promise.reject(fail("FORWARD_WRITER_CLOCK_ORIGINAL_CHANNEL")); }
    return this.beginFootprintCreateClockRpc(dependency, reservation);
  }
  /** Called synchronously by the original constructor before unsubscribing.
   * Events cannot fall between the old listener and the clock event owner. */
  public suspendForwardColdContinuation(dependency: CurrentPcbWorkerStartupDependency, lease: CurrentFootprintForwardColdContinuationLease): void {
    this.#sameMethods(); this.#withinLifetime();
    const binding = requireCurrentFootprintForwardColdContinuationLease(lease);
    if (this.#wire !== currentFootprintForwardExecutionStartupWire || executionDependencies.get(dependency) !== this ||
        binding.dependency !== dependency || this.#coldContinuation !== null || this.#clockRpcAttempted || this.#listener === null ||
        this.#executionWorkerSession === null || this.#failure !== null || this.#fatal || this.#released || this.#releaseRequested) { throw fail("FORWARD_COLD_HANDOFF"); }
    binding.suspend();
    this.#coldContinuation = Object.freeze({ lease, binding, dependency, workerSessionId: this.#executionWorkerSession });
  }
  public requireForwardColdGenerationExited(dependency: CurrentPcbWorkerStartupDependency, lease: CurrentFootprintForwardColdContinuationLease): void {
    this.#sameMethods();
    if (!this.#terminationVerified || this.#wire !== currentFootprintForwardExecutionStartupWire ||
        this.#coldContinuation?.dependency !== dependency || this.#coldContinuation.lease !== lease) { throw fail("FORWARD_COLD_ORIGINAL_EXIT"); }
  }
  #sameColdTail(cleanup: boolean): ColdContinuationState {
    this.#sameMethods(); this.#withinLifetime(cleanup);
    const cold = this.#coldContinuation, rpc = this.#clockRpc;
    if (this.#wire !== currentFootprintForwardExecutionStartupWire || cold === null || this.#coldTail === null ||
        rpc === null || !rpc.retired || !rpc.retireAcknowledged || rpc.create === null || !rpc.create.dispatchAttempted ||
        rpc.create.binding.clockLease !== cold.binding.workerLease || rpc.workerSessionId !== cold.workerSessionId ||
        this.#released || this.#releaseRequested || this.#terminationVerified || this.#fatal || !cleanup && this.#failure !== null) { throw fail("FORWARD_COLD_TAIL_ORIGINAL"); }
    cold.binding.assertCleanup(); return cold;
  }
  public async beginForwardColdTail(dependency: CurrentPcbWorkerStartupDependency, originalPending: CurrentFootprintCopyPendingCreate): Promise<CurrentFootprintForwardColdTail> {
    const cold = this.#coldContinuation, rpc = this.#clockRpc;
    if (rpc === null || cold === null || cold.dependency !== dependency || executionDependencies.get(dependency) !== this ||
        this.#wire !== currentFootprintForwardExecutionStartupWire || this.#coldTailAttempted || !rpc.retired || !rpc.retireAcknowledged ||
        this.#samePendingCreate(rpc).token !== originalPending || !this.#createRetirementQuiescent(rpc)) { throw fail("FORWARD_COLD_TAIL_UNAVAILABLE"); }
    this.#coldTailAttempted = true;
    try {
      await this.#queue(async (): Promise<void> => {
        this.#samePendingCreate(rpc); cold.binding.assertCleanup();
        if (this.#queuedRequests !== 0 || this.#used !== 0 || rpc.events.length > 0 || !this.#createRetirementQuiescent(rpc)) { throw fail("FORWARD_COLD_TAIL_RETAIN"); }
        const parent = await this.#parentMethod.call(this.#native);
        if (parent !== this.#parent || this.#samePendingCreate(rpc).token !== originalPending) { throw fail("FORWARD_COLD_TAIL_PARENT"); }
        const result = captureCurrentPcbStringClockReply(await this.#exchange.call(this.#native, { action: "footprint-forward-cold-begin" })).value;
        if (!record(result) || !exact(result, ["begun"]) || result["begun"] !== true) { throw fail("FORWARD_COLD_TAIL_BEGIN_ACK"); }
      });
      const tailToken = Object.freeze({ profile: "private.current-footprint-forward-cold-tail.v1" as const });
      this.#coldTail = tailToken;
      coldTails.set(tailToken, Object.freeze({ continuation: cold.lease, dependency, workerLease: cold.binding.workerLease, workerSessionId: cold.workerSessionId,
        assertCleanup: (): void => { this.#sameColdTail(true); },
        assertOriginal: async (): Promise<void> => {
          this.#sameColdTail(false);
          await this.#queue(async (): Promise<void> => { const parent = await this.#parentMethod.call(this.#native);
            if (parent !== this.#parent) { throw fail("FORWARD_COLD_TAIL_PARENT"); } this.#sameColdTail(false); });
          this.#sameColdTail(false);
        },
        request: async (command: CurrentPcbWorkerConstructionCommand, cleanup: boolean, retain?: (reply: unknown) => void): Promise<unknown> => {
          this.#sameColdTail(cleanup);
          if (typeof cleanup !== "boolean" || cleanup !== cleanupCommand(command) || retain !== undefined) { throw fail("FORWARD_COLD_TAIL_COMMAND"); }
          const reply = await this.#request({ ...command, sessionId: cold.workerSessionId }, false, false, undefined, false, false, true);
          this.#sameColdTail(cleanup); return reply;
        },
      }));
      cold.binding.attach(tailToken); this.#sameColdTail(false); return tailToken;
    } catch (error) { this.#poison("FORWARD_COLD_TAIL_BEGIN"); throw error; }
  }
  async #prepareClockRpc(dependency: CurrentPcbWorkerStartupDependency, workerSessionId: string,
    create: CreateClockState | null): Promise<CurrentFootprintCopyClockRpcChannelReservation> {
    const full = this.#wire === currentFootprintForwardWriterStartupWire && this.#fullClock !== null;
    if ((this.#wire !== currentFootprintCombinedStartupWire && this.#wire !== currentFootprintForwardExecutionStartupWire && !full) || executionDependencies.get(dependency) !== this || this.#clockRpcAttempted ||
        (full ? create === null : (create !== null) !== this.#createClockPurpose)) { throw fail("FOOTPRINT_RPC_PURPOSE"); }
    if (full) { this.#requireFullClock(); }
    this.#clockRpcAttempted = true; this.#clockRpcHandoffPending = true;
    if (this.#pollTimer !== null) { clearTimeout(this.#pollTimer); this.#pollTimer = null; }
    try {
      await this.#queue(async (): Promise<void> => {
        await this.#currentWithinQueue();
        if (this.#parent === null || this.#listener === null || this.#pending.size > 0 || this.#queuedRequests !== 0 || this.#used !== 0 ||
            this.#pollQueued || this.#fatal || this.#failure !== null || this.#footprintParentSubscriber !== null || this.#footprintClockRequests !== 0 ||
            this.#executionWorkerSession !== workerSessionId || workerSessionId === this.#parent.sessionId ||
            !this.#workers.has(workerSessionId) || !this.#footprintClockRegistrationStarted || this.#footprintClockRegistrationReleased) {
          throw fail("FOOTPRINT_RPC_QUIESCENCE");
        }
        let budget: ClockRpcState["budget"];
        if (this.#wire === currentFootprintForwardExecutionStartupWire && (create === null || this.#coldContinuation === null ||
            this.#coldContinuation.binding.workerLease !== create.binding.clockLease || this.#coldContinuation.workerSessionId !== workerSessionId)) {
          throw fail("FORWARD_COLD_HANDOFF_REQUIRED");
        }
        if (create === null) { budget = new CurrentFootprintCopyClockRpcBudget(this.#nextId); }
        else if (create.allocation) {
          if (full) { budget = this.#completeBirth===null?new CurrentFootprintForwardWriterAllocatedCreateClockBudget(this.#nextId):await createCurrentFootprintForwardWriterCompleteAllocatedClockBudget(this.#nextId,this.#completeBirth.origin); }
          else { budget = this.#wire === currentFootprintForwardExecutionStartupWire ? new CurrentFootprintForwardColdAllocatedCreateClockBudget(this.#nextId) : new CurrentFootprintCopyAllocatedCreateClockBudget(this.#nextId); }
        }
        else { budget = new CurrentFootprintCopyCreateClockBudget(this.#nextId); }
        if (this.#wire === currentFootprintForwardExecutionStartupWire) {
          const remaining = this.#coldContinuation?.binding.remainingRequests();
          if (remaining === undefined || budget.snapshot().lastReservedId + remaining.total > FORWARD_LIMITS.requestLimit) { throw fail("FORWARD_COLD_TAIL_HEADROOM"); }
        }
        this.#clockRpcPreparedState = { workerSessionId, uiSessionId: this.#parent.sessionId,
          budget,
          create, events: [], begun: false, retired: false,
          retireAttempted: false, retireAcknowledged: false, eventCount: 0, eventBytes: 0 };
        this.#clockRpcReservation = Object.freeze({ profile: "private.current-footprint-clock-rpc-channel-reservation.v1" });
      });
      if (this.#clockRpcReservation === null) { throw fail("FOOTPRINT_RPC_RESERVATION"); }
      return this.#clockRpcReservation;
    } catch (error) {
      this.#clockRpcHandoffPending = false; this.#poison("FOOTPRINT_RPC_HANDOFF"); this.#schedulePoll(0); throw error;
    }
  }
  /** The genuine owner consumes its original transport subscription immediately
   * before this synchronous cursor installation. No await separates them. */
  public async beginFootprintClockRpc(dependency: CurrentPcbWorkerStartupDependency,
    reservation: CurrentFootprintCopyClockRpcChannelReservation): Promise<InternalClockChannelRoute> {
    const state = this.#clockRpcPreparedState;
    if (executionDependencies.get(dependency) !== this || reservation !== this.#clockRpcReservation || state === null ||
        this.#clockRpc !== null || !this.#clockRpcHandoffPending || this.#nextId !== state.budget.snapshot().startId ||
        this.#pending.size > 0 || this.#queuedRequests !== 0 || this.#used !== 0 || this.#failure !== null || this.#fatal) { throw fail("FOOTPRINT_RPC_RESERVATION"); }
    this.#clockRpc = state;
    try {
      await this.#queue(async (): Promise<void> => {
        await this.#currentWithinQueue();
        let action = "footprint-clock-rpc-begin";
        if (state.create !== null) { action = state.create.allocation ? "footprint-copy-allocated-create-clock-begin" : "footprint-copy-create-clock-begin"; }
        let coldReservation: Readonly<Record<string, number>> = {};
        if (this.#wire === currentFootprintForwardExecutionStartupWire) {
          const remaining = this.#coldContinuation?.binding.remainingRequests(); if (remaining === undefined) { throw fail("FORWARD_COLD_HANDOFF_REQUIRED"); }
          action = "footprint-forward-allocated-clock-begin"; coldReservation = { coldNormal: remaining.normal, coldCleanup: remaining.cleanup };
        }
        if (this.#fullClock !== null) { this.#requireFullClock(); action = "footprint-forward-writer-clock-begin"; }
        const result = captureCurrentPcbStringClockReply(await this.#exchange.call(this.#native,
          { action, firstRequestId: this.#nextId, ...coldReservation })).value;
        if (!record(result) || !exact(result, ["begun"]) || result["begun"] !== true) { throw fail("FOOTPRINT_RPC_BEGIN_ACK"); }
        state.begun = true;
      });
      const route = { workerSessionId: state.workerSessionId,
        assertOriginal: (): Promise<void> => this.#assertClockRpc(state, false),
        assertCleanup: (): Promise<void> => this.#assertClockRpc(state, true),
        assertOriginalGenerationExited: (): Promise<void> => this.#originalTermination(),
        request: (command: CurrentFootprintCopyClockRpcCommand | CurrentFootprintCopyClockRpcV2Command, cleanup: boolean): Promise<unknown> => this.#requestClockRpc(state, command, cleanup),
        pump: async (cleanup: boolean): Promise<void> => {
          this.#sameClockRpc(state, cleanup); this.#schedulePoll(0);
          await this.#queue((): Promise<void> => { this.#sameClockRpc(state, cleanup); return Promise.resolve(); });
        },
        takeEvent: (): CurrentFootprintCopyClockRpcOriginEvent | null => {
          this.#sameClockRpc(state, true); return state.events.shift() ?? null;
        },
        fail: (): void => {
          if (this.#clockRpc === state && (!state.retired || state.create !== null)) { state.budget.fail(); this.#poison("FOOTPRINT_RPC_SEMANTIC"); }
        },
        retire: (): Promise<void> => this.#retireClockRpc(state),
      };
      return Object.freeze(state.create === null ? route : { ...route,
        dispatchCreate: (): Promise<CurrentFootprintCopyPendingCreate> => this.#dispatchCreate(state),
        joinCreate: (pending: CurrentFootprintCopyPendingCreate): Promise<string> => this.#joinCreate(state, pending),
      });
    } catch (error) { this.#clockRpc?.budget.fail(); this.#poison("FOOTPRINT_RPC_HANDOFF"); throw error; }
    finally { this.#clockRpcHandoffPending = false; this.#schedulePoll(0); }
  }
  public async beginFootprintCreateClockRpc(dependency: CurrentPcbWorkerStartupDependency,
    reservation: CurrentFootprintCopyClockRpcChannelReservation): Promise<InternalCreateClockChannelRoute> {
    if ((!this.#createClockPurpose && this.#fullClock === null) || this.#clockRpcPreparedState?.create === null || this.#clockRpcPreparedState === null) {
      throw fail("FOOTPRINT_CREATE_PURPOSE");
    }
    const state = this.#clockRpcPreparedState;
    const route = await this.beginFootprintClockRpc(dependency, reservation);
    const original = Object.freeze({ ...route, dispatchCreate: (): Promise<CurrentFootprintCopyPendingCreate> => this.#dispatchCreate(state),
      joinCreate: (originalPending: CurrentFootprintCopyPendingCreate): Promise<string> => this.#joinCreate(state, originalPending) });
    const create = this.#samePendingCreate(state);
    const registry = this.#fullClock === null ? createClockRoutes : forwardWriterCreateClockRoutes;
    registry.set(original, Object.freeze({ clockLease: create.binding.clockLease, copyPlan: create.copyPlan,
      invocationBinding: create.binding, workerSessionId: state.workerSessionId,
      assertOriginalSynchronous: (): void => { this.#samePendingCreate(state); } }));
    if(this.#fullClock!==null){forwardWriterCreateClockIssuers.set(original,Object.freeze({issuer:this,state}));}
    return original;
  }
  /** Wake only this original full producer's existing polling owner after
   * clock retirement. The old clock RPC pump remains closed after retirement. */
  public async pumpRetiredFootprintForwardWriterProducer(dependency:CurrentPcbWorkerStartupDependency,route:CurrentFootprintForwardWriterCreateClockChannelRoute):Promise<void>{
    const same=():void=>{
      this.#sameMethods();const original=this.#requireFullClock();const state=this.#clockRpc;const issued=forwardWriterCreateClockIssuers.get(route);
      if(issued?.issuer!==this||issued.state!==state||original.dependency!==dependency||this.#wire!==currentFootprintForwardWriterStartupWire||state===null||!state.retired||!state.retireAcknowledged||
        this.#listener===null||this.#released||this.#releaseRequested||this.#terminationVerified||this.#fatal||this.#failure!==null||
        requireCurrentFootprintForwardWriterCreateClockChannelRoute(route).workerSessionId!==state.workerSessionId){throw fail("FORWARD_WRITER_PRODUCER_PUMP_ORIGINAL");}
      this.#samePendingCreate(state);this.#withinLifetime(false);
    };
    same();this.#schedulePoll(0);
    await this.#queue(async():Promise<void>=>{same();const parent=await this.#parentMethod.call(this.#native);same();if(parent!==this.#parent){throw fail("FORWARD_WRITER_PRODUCER_PUMP_PARENT");}});
    same();
  }
  #sameClockRpc(state: ClockRpcState, cleanup: boolean): void {
    this.#sameMethods();
    if (this.#fullClock !== null) { this.#requireFullClock(); }
    if (this.#clockRpc !== state || !state.begun || state.retired || this.#released || this.#releaseRequested ||
        this.#terminationVerified || this.#fatal || !cleanup && (this.#failure !== null || state.budget.snapshot().failed)) {
      throw fail("FOOTPRINT_RPC_ORIGINAL");
    }
    this.#withinLifetime(cleanup);
  }
  async #assertClockRpc(state: ClockRpcState, cleanup: boolean): Promise<void> {
    this.#sameClockRpc(state, cleanup);
    await this.#queue(async (): Promise<void> => {
      this.#sameClockRpc(state, cleanup);
      const parent = await this.#parentMethod.call(this.#native); this.#sameClockRpc(state, cleanup);
      if (parent !== this.#parent) { throw fail("FOOTPRINT_RPC_PARENT"); }
    });
    this.#sameClockRpc(state, cleanup);
  }
  // oxlint-disable-next-line eslint/require-await -- Preserve the retained pending completion and convert synchronous validation failures to rejection.
  async #requestClockRpc(state: ClockRpcState, input: CurrentFootprintCopyClockRpcCommand | CurrentFootprintCopyClockRpcV2Command, cleanup: boolean): Promise<unknown> {
    this.#sameClockRpc(state, cleanup);
    const captured = captureCurrentPcbStringClockReply(input).value;
    const allocation = z.object({ phase: z.string() }).loose().parse(captured).phase.startsWith("allocation-");
    if (allocation && !(state.budget instanceof CurrentFootprintCopyAllocatedCreateClockBudget || state.budget instanceof CurrentFootprintForwardColdAllocatedCreateClockBudget || state.budget instanceof CurrentFootprintForwardWriterAllocatedCreateClockBudget)) { throw fail("FOOTPRINT_ALLOCATION_PURPOSE"); }
    const { id: _validationId, ...command } = (allocation ? currentFootprintCopyAllocationWire(captured, 1, state.workerSessionId) :
      (this.#fullClock === null ? currentFootprintCopyClockRpcWire : currentFootprintCopyClockRpcV2Wire)(captured, 1, state.workerSessionId, state.uiSessionId)).command;
    if (typeof cleanup !== "boolean" || cleanup !== cleanupCommand(command) || state.budget.snapshot().failed) { throw fail("FOOTPRINT_RPC_CLASS"); }
    if (this.#queuedRequests >= 32) { throw fail("QUEUE_BUDGET"); }
    this.#queuedRequests += 1; const completion = Promise.withResolvers<unknown>();
    const queued = this.#queue(async (): Promise<void> => {
      let pending: Pending | null = null;
      try {
        this.#sameClockRpc(state, cleanup);
        const parent = await this.#parentMethod.call(this.#native); this.#sameClockRpc(state, cleanup);
        if (parent !== this.#parent || this.#failure !== null) { throw fail("FOOTPRINT_RPC_PARENT"); }
        const wire = allocation ? currentFootprintCopyAllocationWire(command, this.#nextId, state.workerSessionId) :
          (this.#fullClock === null ? currentFootprintCopyClockRpcWire : currentFootprintCopyClockRpcV2Wire)(command, this.#nextId, state.workerSessionId, state.uiSessionId);
        if (allocation) {
          if (!(state.budget instanceof CurrentFootprintCopyAllocatedCreateClockBudget || state.budget instanceof CurrentFootprintForwardColdAllocatedCreateClockBudget || state.budget instanceof CurrentFootprintForwardWriterAllocatedCreateClockBudget)) { throw fail("FOOTPRINT_ALLOCATION_PURPOSE"); }
          state.budget.consumeAllocation(this.#nextId, String(wire.request["phase"]), cleanup);
        } else { state.budget.consume(this.#nextId, cleanup); }
        this.#nextId += 1;
        pending = { id: wire.command.id, command: wire.command, completion,
          allocation: command.method === "Debugger.setBreakpoint", written: false, writeFailed: false, replied: false,
          result: null, remoteError: false, settled: false };
        this.#pending.set(pending.id, pending);
        ackSchema.parse(captureCurrentPcbStringClockReply(await this.#exchange.call(this.#native, wire.request)).value);
        pending.written = true; this.#complete(pending);
      } catch (error) {
        state.budget.fail(); this.#poison("FOOTPRINT_RPC_WRITE");
        if (pending === null) { completion.reject(error); }
        else { pending.writeFailed = true; this.#complete(pending); }
      } finally { this.#queuedRequests -= 1; this.#schedulePoll(0); }
    });
    void observe(queued); return completion.promise;
  }
  #samePendingCreate(state: ClockRpcState): CreateClockState {
    this.#sameMethods(); this.#withinLifetime();
    if (this.#clockRpc !== state || !state.begun || state.create === null || !this.#createClockPurpose && this.#fullClock === null ||
        this.#released || this.#releaseRequested || this.#terminationVerified || this.#fatal || this.#failure !== null) {
      throw fail("FOOTPRINT_CREATE_ORIGINAL");
    }
    state.create.binding.assertCleanup(); return state.create;
  }
  async #dispatchCreate(state: ClockRpcState): Promise<CurrentFootprintCopyPendingCreate> {
    const create = this.#samePendingCreate(state);
    if (state.retired || create.dispatchAttempted || !(state.budget instanceof CurrentFootprintCopyCreateClockBudget || state.budget instanceof CurrentFootprintCopyAllocatedCreateClockBudget || state.budget instanceof CurrentFootprintForwardColdAllocatedCreateClockBudget || state.budget instanceof CurrentFootprintForwardWriterAllocatedCreateClockBudget)) {
      throw fail("FOOTPRINT_CREATE_CONSUMED");
    }
    // Consume synchronously before entering the queue. A lost native ACK never
    // Restores the invocation slot or permits another create.
    create.dispatchAttempted = true;
    try {
      // Construction reproof can itself join this original channel queue. It
      // Must finish before this queue is held, then its synchronous seal and
      // Original parent are rechecked inside the dispatch callback.
      await create.binding.assertOriginal(); this.#samePendingCreate(state);
    } catch (error) { state.budget.fail(); this.#poison("FOOTPRINT_CREATE_WRITE"); throw error; }
    await this.#queue(async (): Promise<void> => {
      let pending: Pending | null = null;
      try {
        if (this.#samePendingCreate(state) !== create || state.retired || !(state.budget instanceof CurrentFootprintCopyCreateClockBudget || state.budget instanceof CurrentFootprintCopyAllocatedCreateClockBudget || state.budget instanceof CurrentFootprintForwardColdAllocatedCreateClockBudget || state.budget instanceof CurrentFootprintForwardWriterAllocatedCreateClockBudget)) {
          throw fail("FOOTPRINT_CREATE_ORIGINAL");
        }
        if (this.#samePendingCreate(state) !== create) { throw fail("FOOTPRINT_CREATE_ORIGINAL"); }
        const parent = await this.#parentMethod.call(this.#native);
        if (parent !== this.#parent || this.#samePendingCreate(state) !== create) { throw fail("FOOTPRINT_CREATE_PARENT"); }
        const wire = currentFootprintCopyNativeCreateWire(JSON.stringify(create.command), this.#nextId);
        // The future owner must already have published durable intent and
        // Consumed the original main/clock runner markers before calling here.
        create.binding.consumeBeforeInvocation(); state.budget.consumeCreate(this.#nextId); this.#nextId += 1;
        const completion = Promise.withResolvers<unknown>(); void observe(completion.promise);
        pending = { id: wire.command.id, command: wire.command, completion, nativeCreate: true,
          commandSha256: createHash("sha256").update(JSON.stringify(wire.command)).digest("hex"), allocation: false, written: false, writeFailed: false, replied: false, result: null, remoteError: false, settled: false };
        create.pending = pending; this.#pending.set(pending.id, pending);
        ackSchema.parse(captureCurrentPcbStringClockReply(await this.#exchange.call(this.#native, wire.request)).value);
        pending.written = true; this.#complete(pending);
      } catch (error) {
        state.budget.fail(); this.#poison("FOOTPRINT_CREATE_WRITE");
        if (pending !== null) { pending.writeFailed = true; this.#complete(pending); }
        throw error;
      } finally { this.#schedulePoll(0); }
    });
    return create.token;
  }
  async #joinCreate(state: ClockRpcState, originalPending: CurrentFootprintCopyPendingCreate): Promise<string> {
    const create = this.#samePendingCreate(state), pending = create.pending;
    if (originalPending !== create.token || pending === null || !pending.written || pending.writeFailed || !create.dispatchAttempted) { throw fail("FOOTPRINT_CREATE_PENDING"); }
    const reply = await pending.completion.promise;
    if (this.#samePendingCreate(state) !== create || !pending.replied || pending.remoteError || pending.rawFrame === undefined) {
      throw fail("FOOTPRINT_CREATE_REPLY");
    }
    const result = captureCurrentFootprintCopyNativeCreateReply(reply);
    await this.#queue(async (): Promise<void> => {
      if (this.#samePendingCreate(state) !== create) { throw fail("FOOTPRINT_CREATE_ORIGINAL"); }
      const parent = await this.#parentMethod.call(this.#native);
      if (parent !== this.#parent || this.#samePendingCreate(state) !== create) { throw fail("FOOTPRINT_CREATE_PARENT"); }
    });
    return result;
  }
  #createRetirementQuiescent(state: ClockRpcState): boolean {
    if (this.#terminationVerified) { return this.#pending.size === 0; }
    const create = state.create;
    if (create === null) { return this.#pending.size === 0; }
    const pending = create.pending;
    if (!create.dispatchAttempted || pending === null || !pending.written || pending.writeFailed || pending.nativeCreate !== true ||
        pending.command.sessionId !== state.workerSessionId || pending.remoteError) { return false; }
    return pending.replied ? this.#pending.size === 0 && pending.rawFrame !== undefined :
      this.#pending.size === 1 && this.#pending.get(pending.id) === pending;
  }
  async #retireClockRpc(state: ClockRpcState): Promise<void> {
    try { await this.#queue(async (): Promise<void> => {
      if (this.#clockRpc !== state || state.retired || this.#released || this.#releaseRequested && !(this.#fullClock !== null && this.#terminationVerified) || !this.#createRetirementQuiescent(state) ||
          this.#queuedRequests !== 0 || this.#used !== 0 || state.events.length > 0) { throw fail("FOOTPRINT_RPC_RETAIN"); }
      this.#sameMethods();
      if (state.retireAttempted) {
        if (!this.#terminationVerified) { throw fail("FOOTPRINT_RPC_RETAIN_RETIRE_UNKNOWN"); }
        // The prior native retirement remains unknown. Actual exit permits
        // Local route settlement only; never repeat its consumed control.
        state.retired = true; return;
      }
      if (!this.#terminationVerified) {
        this.#sameClockRpc(state, false); state.budget.requireCompleted();
      }
      state.retireAttempted = true;
      let action = state.create === null ? "footprint-clock-rpc-retire" : "footprint-copy-create-clock-retire";
      if (this.#fullClock !== null) { action = "footprint-forward-writer-clock-retire"; }
      const result = captureCurrentPcbStringClockReply(await this.#exchange.call(this.#native, { action })).value;
      if (this.#fullClock !== null) {
        const parsed = z.object({ retired: z.literal(true), disposition: z.enum(["retired", "ended-before-begin"]) }).strict().parse(result);
        if (!this.#terminationVerified && parsed.disposition !== "retired") { throw fail("FORWARD_WRITER_CLOCK_RETIRE_BEFORE_ORIGINAL_EXIT"); }
        this.#fullClockRetirementDisposition = parsed.disposition;
      } else if (!record(result) || !exact(result, ["retired"]) || result["retired"] !== true) { throw fail("FOOTPRINT_RPC_RETIRE_ACK"); }
      state.retireAcknowledged = true;
      if (!this.#terminationVerified) { state.budget.retire(); }
      state.retired = true;
    }); } catch (error) { state.budget.fail(); this.#poison("FOOTPRINT_RPC_RETIRE"); throw error; }
  }
  public retainedFootprintClockRpc(): Readonly<Record<string, unknown>> {
    const state = this.#clockRpc;
    return Object.freeze({ attempted: this.#clockRpcAttempted, begun: state?.begun ?? false, retired: state?.retired ?? false,
      retirementDispatchAttempted: state?.retireAttempted ?? false, nativeRetirementAcknowledged: state?.retireAcknowledged ?? false,
      originalGenerationExitObserved: this.#terminationVerified, budget: state?.budget.snapshot() ?? null,
      create: state?.create === null || state?.create === undefined ? null : Object.freeze({ attempted: state.create.dispatchAttempted,
        written: state.create.pending?.written ?? false, replied: state.create.pending?.replied ?? false,
        writeFailed: state.create.pending?.writeFailed ?? false, requestId: state.create.pending?.id ?? null, commandSha256: state.create.pending?.commandSha256 ?? null,
        rawFrame: state.create.pending?.rawFrame ?? null, rejectedFrame: state.create.rejectedFrame, executionAuthorized: false }), executionAuthorized: false });
  }
  public async retireForwardWriterClockAfterOriginalExit(dependency: CurrentPcbWorkerStartupDependency): Promise<void> {
    if (!this.#terminationVerified || this.#requireFullClock().dependency !== dependency) { throw fail("FORWARD_WRITER_CLOCK_ORIGINAL_EXIT_REQUIRED"); }
    const state = this.#clockRpc; if (state !== null && !state.retired) { await this.#retireClockRpc(state); }
  }
  public retainedForwardWriterClockDisposition(): Readonly<{ schema: "private.current-footprint-forward-writer-clock-disposition.v1"; disposition: "retired" | "ended-before-begin" | null; originalGenerationExitObserved: boolean; executionAuthorized: false }> {
    this.#requireFullClock(); return Object.freeze({ schema: "private.current-footprint-forward-writer-clock-disposition.v1", disposition: this.#fullClockRetirementDisposition, originalGenerationExitObserved: this.#terminationVerified, executionAuthorized: false });
  }
  #complete(pending: Pending): void {
    if (!pending.replied) { return; }
    // An allocation ID remains useful cleanup evidence even when WriteFile's
    // Acknowledgment was lost. The poisoned owner prevents further arming.
    if (!pending.written && !(pending.allocation && pending.writeFailed)) { return; }
    this.#pending.delete(pending.id);
    if (pending.settled) { return; }
    pending.settled = true;
    if (pending.remoteError || this.#failure !== null && !pending.allocation && (pending.plannedForwardTail === true || !cleanupCommand(pending.command))) {
      pending.completion.reject(this.#failure ?? fail("REMOTE"));
    } else {
      if (pending.command.method === "Target.setAutoAttach") {
        if (!record(pending.result) || !exact(pending.result, [])) { this.#poison("ATTACH_REPLY"); pending.completion.reject(fail("ATTACH_REPLY")); return; }
        this.#attachAcknowledged = true;
      }
      pending.completion.resolve(pending.result);
    }
  }
  #schedulePoll(milliseconds: number): void {
    if (this.#released || this.#releaseRequested || this.#terminationVerified || this.#fatal || this.#clockRpcHandoffPending ||
        this.#listener === null && this.#pending.size === 0 || this.#pollQueued) { return; }
    if (this.#pollTimer !== null) {
      if (milliseconds !== 0) { return; }
      // A new command wakes an idle listener immediately. Keep one serialized
      // Poll owner and all cumulative counters; only the pending timer changes.
      clearTimeout(this.#pollTimer); this.#pollTimer = null;
    }
    this.#pollTimer = setTimeout(() => { this.#pollTimer = null; this.#poll(); }, milliseconds);
  }
  #poll(): void {
    if (this.#pollQueued || this.#released || this.#releaseRequested || this.#terminationVerified || this.#fatal) { return; }
    this.#pollQueued = true;
    const work = this.#queue(async (): Promise<void> => {
      try {
        if (this.#released || this.#releaseRequested || this.#terminationVerified || this.#fatal) { return; }
        this.#withinLifetime(true); this.#polls += 1;
        const waiting = this.#pending.size > 0 || this.#queuedRequests !== 0 || this.#used !== 0;
        // Native chunks may be64KiB, larger than generic clock text fields.
        const raw = await this.#exchange.call(this.#native, { action: "poll" });
        this.#withinLifetime(true); this.#chunk(raw, waiting);
      } catch (error) { this.#poison(error instanceof Error ? failureCodes.get(error) ?? "POLL" : "POLL", true); }
      finally { this.#pollQueued = false; this.#schedulePoll(this.#nextPollDelay); }
    });
    void observe(work);
  }
  #chunk(raw: unknown, waiting: boolean): void {
    if (!record(raw) || types.isProxy(raw) || Reflect.ownKeys(raw).join(",") !== "bytes" ||
        Object.getPrototypeOf(raw) !== Object.prototype && Object.getPrototypeOf(raw) !== null) { throw fail("CHUNK"); }
    const descriptor = Object.getOwnPropertyDescriptor(raw, "bytes"), text: unknown = descriptor?.value;
    if (descriptor === undefined || !Object.hasOwn(descriptor, "value") || typeof text !== "string" || text.length > 87_384 ||
        !/^(?:[A-Za-z\d+/]{4})*(?:[A-Za-z\d+/]{2}==|[A-Za-z\d+/]{3}=)?$/u.test(text)) { throw fail("CHUNK"); }
    const bytes = Buffer.from(text, "base64");
    if (bytes.length > STREAM.pollChunkBytes || bytes.toString("base64") !== text) { throw fail("CHUNK"); }
    // Empty idle checks observe unsolicited events, but consume no data or
    // Request-wait allowance. Bound all three forms separately and never reset
    // A count after progress. The nonrenewable monotonic lifetime caps idle time.
    if (bytes.length > 0) {
      if (this.#dataPolls >= MAX_DATA_POLLS) { throw fail("DATA_POLL_BUDGET"); }
      this.#dataPolls += 1; this.#nextPollDelay = ACTIVE_POLL_MS;
    } else if (waiting) {
      if (this.#waitPolls >= MAX_WAIT_POLLS) { throw fail("WAIT_POLL_BUDGET"); }
      this.#waitPolls += 1; this.#nextPollDelay = ACTIVE_POLL_MS;
    } else {
      if (this.#idlePolls >= MAX_IDLE_POLLS) { throw fail("IDLE_POLL_BUDGET"); }
      this.#idlePolls += 1; this.#nextPollDelay = IDLE_POLL_MS;
    }
    this.#bytes += bytes.length; if (this.#bytes > MAX_BYTES) { throw fail("BYTE_BUDGET"); }
    let start = 0;
    while (start < bytes.length) {
      const zero = bytes.indexOf(0, start);
      const end = zero === -1 ? bytes.length : zero;
      const required = this.#used + end - start;
      const limit = Math.max(MAX_FRAME, ...[...this.#pending.values()].map(pending => replyFrameLimit(pending.command, pending.nativeCreate === true, pending.heldSavedCleanup === true)));
      if (required > limit) { throw fail("FRAME_BUDGET"); }
      if (required > this.#buffer.length) {
        const replacement = Buffer.alloc(Math.min(limit, Math.max(required, this.#buffer.length * 2)));
        this.#buffer.copy(replacement, 0, 0, this.#used); this.#buffer = replacement;
      }
      bytes.copy(this.#buffer, this.#used, start, end); this.#used = required;
      if (zero === -1) { return; }
      this.#frame(this.#buffer.subarray(0, this.#used)); this.#used = 0; start = zero + 1;
    }
  }
  #frame(bytes: Buffer): void {
    try { this.#decodeFrame(bytes); }
    catch (error) {
      const create = this.#clockRpc?.create;
      // Keep one exact rejected complete frame before the decoder's failure can
      // Be lost at actual exit. Its attribution/ACK relation remains unknown.
      if (create !== null && create !== undefined && create.rejectedFrame === null &&
          bytes.length <= CURRENT_FOOTPRINT_COPY_NATIVE_CREATE_LIMITS.responseFrameBytes) {
        create.rejectedFrame = Object.freeze({ classification: "unattributed-rejected-native-frame", bytes: bytes.length,
          sha256: createHash("sha256").update(bytes).digest("hex"), base64: bytes.toString("base64") });
      }
      throw error;
    }
  }
  #decodeFrame(bytes: Buffer): void {
    if (bytes.length === 0) { throw fail("FRAME"); }
    const value = decodeCurrentPcbDiagnosticJson(bytes);
    if (!record(value)) { throw fail("FRAME"); }
    if (Object.hasOwn(value, "method")) { this.#event(value, bytes.length); return; }
    const id = value["id"];
    if (typeof id !== "number" || !Number.isSafeInteger(id)) { throw fail("REPLY_ID"); }
    const pending = this.#pending.get(id);
    const sessionKeys = pending?.command.sessionId === undefined ? [] : ["sessionId"];
    if (pending === undefined || pending.replied || value["sessionId"] !== pending.command.sessionId ||
        !exact(value, ["id", ...sessionKeys, Object.hasOwn(value, "result") ? "result" : "error"]) ||
        !record(value["result"] ?? value["error"]) || bytes.length > replyFrameLimit(pending.command, pending.nativeCreate === true, pending.heldSavedCleanup === true)) {
      throw fail("REPLY");
    }
    // Preserve the exact original frame before any semantic create decoder or
    // Remote-error handling. The same pending entry survives clock retirement.
    if (pending.nativeCreate === true) { pending.rawFrame = bytes.toString("utf8"); }
    pending.replied = true; pending.remoteError = Object.hasOwn(value, "error");
    pending.result = value["result"] ?? null;
    if (pending.nativeCreate === true && !pending.remoteError) {
      try { captureCurrentFootprintCopyNativeCreateReply(pending.result); }
      catch { this.#poison("FOOTPRINT_CREATE_REPLY"); }
    }
    if (pending.remoteError) { this.#poison("REMOTE"); }
    this.#complete(pending);
  }
  #event(value: Record<string, unknown>, bytes: number): void {
    this.#forwardEventBytes?.(bytes);
    this.#events += 1; this.#eventBytes += bytes;
    const eventLimit=this.#wire===currentFootprintForwardWriterStartupWire&&"eventCount" in this.#footprintProfile?this.#footprintProfile.eventCount:MAX_EVENTS;
    if (bytes > MAX_FRAME || this.#events > eventLimit || this.#eventBytes > MAX_EVENT_BYTES || this.#parent === null) { throw fail("EVENT_BUDGET"); }
    const event = z.object({ method: z.string().min(1).max(128), params: z.record(z.string(), z.unknown()), sessionId: token }).strict()
      .parse(captureCurrentPcbStringClockReply(value).value);


      const ticketHelper=this.#forwardWriterTicketHelper;
      if(ticketHelper!==null&&event.sessionId===this.#executionWorkerSession&&event.method==="Debugger.scriptParsed"&&record(event.params)&&
        event.params["executionContextId"]===this.#executionChildContextNumber&&event.params["url"]===""&&event.params["length"]===ticketHelper.program.length+2&&
        event.params["startLine"]===0&&event.params["startColumn"]===0&&event.params["isModule"]===false){
        const id=event.params["scriptId"];if(typeof id!=="string"||ticketHelper.scriptId!==null){throw fail("FORWARD_TICKET_HELPER_EVENT");}ticketHelper.scriptId=id;
      }
    const ownHelper=this.#forwardWriterOwnDataHelper;
    if(ownHelper!==null&&event.sessionId===this.#executionWorkerSession&&event.method==="Debugger.scriptParsed"&&
        event.params["executionContextId"]===this.#executionChildContextNumber&&event.params["url"]===""&&event.params["length"]===ownHelper.program.length+2){
      if(ownHelper.scriptId!==null||event.params["startLine"]!==0||event.params["startColumn"]!==0||event.params["isModule"]!==false){throw fail("FORWARD_OWN_DATA_HELPER_EVENT");}
      ownHelper.scriptId=token.parse(event.params["scriptId"]);return;
    }
    const rpc = this.#clockRpc;
    const cold = this.#coldContinuation;
    if (this.#fullClock !== null && event.sessionId === this.#executionWorkerSession) {
      const full = this.#requireFullClock();
      if (event.method === "Debugger.paused" && full.events.acceptsPause(event.params)) {
        if (this.#fullProducerPause) { throw fail("FORWARD_WRITER_CLOCK_DUPLICATE_PRODUCER_PAUSE"); }
        this.#fullProducerPause = true; full.events.paused(event.params); return;
      }
      if (event.method === "Debugger.resumed" && this.#fullProducerPause) { this.#fullProducerPause = false; full.events.resumed(); return; }
    }
    if (cold !== null && event.sessionId === cold.workerSessionId) {
      if (event.method === "Debugger.paused" && cold.binding.acceptsPause(event.params)) {
        if (this.#coldPause) { throw fail("FORWARD_COLD_DUPLICATE_PAUSE"); }
        this.#coldPause = true; cold.binding.paused(event.params); return;
      }
      if (event.method === "Debugger.resumed" && this.#coldPause) {
        this.#coldPause = false; cold.binding.resumed(); return;
      }
    }
    if (rpc?.create !== null && rpc?.create !== undefined && rpc.retired) { throw fail("FOOTPRINT_CREATE_POST_CLOCK_EVENT"); }
    if (rpc !== null && !rpc.retired && (event.sessionId === rpc.uiSessionId || event.sessionId === rpc.workerSessionId) &&
        (event.method === "Debugger.paused" || event.method === "Debugger.resumed")) {
      if (!rpc.begun || rpc.events.length >= (rpc.create?.allocation === true ? STREAM.allocatedCreateClockEvents : STREAM.clockRpcEvents) || rpc.eventCount >= (rpc.create?.allocation === true ? STREAM.allocatedCreateClockEvents : STREAM.clockRpcEvents) || rpc.eventBytes + bytes > MAX_EVENT_BYTES) { throw fail("FOOTPRINT_RPC_EVENTS"); }
      const params = captureCurrentPcbStringClockReply(event.params).value;
      rpc.events.push(Object.freeze({ method: event.method, sessionId: event.sessionId, params }));
      rpc.eventCount += 1; rpc.eventBytes += bytes; return;
    }
    if (event.sessionId === this.#parent.sessionId) {
      if (event.method !== "Target.attachedToTarget") {
        if (this.#executionPurpose && this.#footprintParentSubscriber !== null &&
            (event.method === "Debugger.paused" || event.method === "Debugger.resumed")) {
          this.#footprintParentSubscriber.event(event); return;
        }
        this.#deliverParent(event); return;
      }
      const params = event.params;
      const child = params["targetInfo"], sessionId = token.parse(params["sessionId"]);
      if (!this.#attachIssued || !record(child) || child["type"] !== "worker" || child["attached"] !== true ||
          typeof params["waitingForDebugger"] !== "boolean" || !exact(params, ["sessionId", "targetInfo", "waitingForDebugger"]) ||
          sessionId === this.#parent.sessionId || this.#workers.has(sessionId) || this.#workers.size >= 16) { throw fail("ATTACHMENT"); }
      const targetId = token.parse(child["targetId"]);
      if (targetId === this.#parent.targetId || [...this.#workers.values()].includes(targetId)) { throw fail("ATTACHMENT"); }
      this.#workers.set(sessionId, targetId);
    } else if (!this.#workers.has(event.sessionId)) { throw fail("EVENT_SESSION"); }
    if (this.#executionPurpose && event.sessionId === this.#executionWorkerSession && event.method === "Runtime.executionContextCreated") {
      const context = event.params["context"];
      if (!record(context) || this.#executionChildContext !== null) { throw fail("FOOTPRINT_PEER_CONTEXT"); }
      this.#executionChildContext = token.parse(context["uniqueId"]);
      const contextNumber=context["id"];this.#executionChildContextNumber=typeof contextNumber==="number"&&Number.isSafeInteger(contextNumber)&&contextNumber>=0?contextNumber:null;
    }
    if (this.#listener === null) { throw fail("WORKER_SUBSCRIBER"); }
    this.#listener(event);
  }
  #deliverParent(event: CurrentPcbWorkerStartupEvent): void {
    try {
      const result: unknown = this.#parentEvent.call(this.#native, event);
      if (result !== undefined) {
        // Reject asynchronous observers without leaving their rejection
        // Unobserved. Never assimilate an arbitrary thenable/getter.
        if (types.isPromise(result)) { void observe(result); }
        throw fail("PARENT_EVENT");
      }
    } catch { this.#poison("PARENT_EVENT"); }
  }
  async #originalTermination(): Promise<void> {
    await this.#queue(async (): Promise<void> => {
      this.#sameMethods(); await this.#terminate.call(this.#native); this.#sameMethods();
      this.#terminationVerified = true;
      this.#coldContinuation?.binding.lost();
      if (this.#pollTimer !== null) { clearTimeout(this.#pollTimer); this.#pollTimer = null; }
      const rpcActive = this.#clockRpc !== null && (!this.#clockRpc.retired || this.#clockRpc.create !== null);
      if (rpcActive || this.#wire === currentFootprintForwardWriterStartupWire) {
        // Only the retained root/whole-Job proof above ends ambiguous RPC
        // Allocations or this full writer's original metadata waits.
        // Ending these waits fabricates no reply and permits their finally join.
        for (const pending of this.#pending.values()) {
          if (!pending.settled) { pending.settled = true; pending.completion.reject(fail("TERMINATED")); }
        }
        this.#pending.clear(); this.#used = 0;
        if (rpcActive && this.#clockRpc !== null) { this.#clockRpc.budget.fail(); this.#clockRpc.events.length = 0; }
      }
    });
    // The queue must be free while the original observer joins its own pending
    // Owner checks. Its exit join sends no inspector command or application RPC.
    await this.#coldContinuation?.binding.observeExited();
    if (this.#fullClock !== null && !this.#fullClockExitStarted) {
      this.#fullClockExitStarted = true; await this.#requireFullClock().observeExited();
    }
  }
  /** Original termination, not a timeout or caller flag, ends reply retention.
   * This releases local polling only; native pipe handles belong to the owner. */
  public async releaseAfterTermination(): Promise<void> {
    if (!this.#started || this.#released || this.#releaseRequested) { throw fail("RELEASE_STATE"); }
    this.#releaseRequested = true;
    try { await this.#originalTermination(); }
    catch (error) { this.#releaseRequested = false; this.#schedulePoll(0); throw error; }

    this.#released = true;
    if (this.#pollTimer !== null) { clearTimeout(this.#pollTimer); this.#pollTimer = null; }
    await this.#tail;
    for (const pending of this.#pending.values()) {
      if (!pending.settled) { pending.settled = true; pending.completion.reject(fail("TERMINATED")); }
    }
    this.#pending.clear(); this.#listener = null;

  }
}

export class CurrentPcbWorkerStartupChannel extends CurrentPcbWorkerStartupChannelCore {
  public constructor(native: CurrentPcbWorkerStartupNativeDependency, priorUsage?: CurrentPcbWorkerStartupPriorUsage) {
    super(INTERNAL_PROFILE, native, currentPcbWorkerStartupWire, priorUsage);
  }
}
export class CurrentPcb209WorkerStartupChannel extends CurrentPcbWorkerStartupChannelCore {
  public constructor(native: CurrentPcbWorkerStartupNativeDependency, priorUsage?: CurrentPcbWorkerStartupPriorUsage) {
    super(INTERNAL_PROFILE, native, currentPcb209WorkerStartupWire, priorUsage);
  }
}
/** A separately constructed channel; the old256 owners retain their bounds. */
export class CurrentFootprintCopyPreparationChannel extends CurrentPcbWorkerStartupChannelCore {
  public constructor(native: CurrentPcbWorkerStartupNativeDependency, priorUsage?: CurrentPcbWorkerStartupPriorUsage) {
    super(INTERNAL_PROFILE, native, currentFootprintCopyPreparationWire, priorUsage);
  }
}
/** Separate fixed launch identity. Preparation channels cannot be upgraded. */
export class CurrentFootprintCopyExecutionChannel extends CurrentPcbWorkerStartupChannelCore {
  public constructor(native: CurrentPcbWorkerStartupNativeDependency, priorUsage?: CurrentPcbWorkerStartupPriorUsage) {
    super(INTERNAL_PROFILE, native, currentFootprintCopyExecutionStartupWire, priorUsage);
  }
}
/** New sealed main/renderer birth; it cannot be obtained from an old channel. */
export class CurrentFootprintCombinedStartupChannel extends CurrentPcbWorkerStartupChannelCore {
  public constructor(native: CurrentPcbWorkerStartupNativeDependency, priorUsage?: CurrentPcbWorkerStartupPriorUsage) {
    super(INTERNAL_PROFILE, native, currentFootprintCombinedStartupWire, priorUsage);
  }
}
/** Separate cold-project observer birth. It receives no footprint execution,
 * create, clock, saved or manager-route dependency marker. */
export class CurrentProjectStructureStartupChannel extends CurrentPcbWorkerStartupChannelCore {
  public constructor(native: CurrentPcbWorkerStartupNativeDependency, priorUsage?: CurrentPcbWorkerStartupPriorUsage) {
    super(INTERNAL_PROFILE, native, currentProjectStructureWorkerWire, priorUsage);
  }
}
/** Distinct forward observation grammar and counters. Its allocation/create
 * paths remain absent until current-head/cache/clock eligibility is joined. */
export class CurrentFootprintCopyForwardStartupChannel extends CurrentPcbWorkerStartupChannelCore {
  public constructor(native: CurrentPcbWorkerStartupNativeDependency, observeEventBytes: (bytes: number) => void, priorUsage?: CurrentPcbWorkerStartupPriorUsage) {
    super(INTERNAL_PROFILE, native, currentFootprintCopyForwardStartupWire, priorUsage, false, false, observeEventBytes);
  }
}
/** Distinct allocation/create channel, constructed only for a future original
 * writer-v2 birth. Existing observation channels cannot acquire these roles. */
export class CurrentFootprintForwardExecutionStartupChannel extends CurrentPcbWorkerStartupChannelCore {
  public constructor(native: CurrentPcbWorkerStartupNativeDependency, observeEventBytes: (bytes: number) => void,
    priorUsage?: CurrentPcbWorkerStartupPriorUsage, writerBirth = false, producerPrepare: CurrentFootprintForwardWriterProducerPrepare | null = null,completeBirth:CompleteChannelInput|null=null) {
    if (typeof writerBirth !== "boolean") { throw fail("FORWARD_WRITER_BIRTH"); }
    super(INTERNAL_PROFILE, native, writerBirth ? currentFootprintForwardWriterStartupWire : currentFootprintForwardExecutionStartupWire, priorUsage, !writerBirth, !writerBirth, observeEventBytes, false, null, producerPrepare,completeBirth);
  }
}
type CompleteChannelInput=Readonly<{key:typeof COMPLETE_CHANNEL_INTERNAL;origin:CurrentFootprintForwardWriterCompleteBirthOrigin;profile:ReturnType<typeof currentFootprintForwardWriterCompleteProfile>}>;

/** The dedicated producer-capable birth has no old v2 clock or cold-tail
 * dependency registration. Its fixed preparation and cleanup counters start
 * on this original channel before any producer instrumentation is issued. */
export class CurrentFootprintForwardWriterStartupChannel extends CurrentFootprintForwardExecutionStartupChannel {
  public constructor(native: CurrentPcbWorkerStartupNativeDependency, observeEventBytes: (bytes: number) => void, priorUsage: CurrentPcbWorkerStartupPriorUsage,
    producerPrepare: CurrentFootprintForwardWriterProducerPrepare,complete?:CompleteChannelInput) {
    if(complete!==undefined&&(types.isProxy(complete)||Object.getOwnPropertyDescriptor(complete,"key")?.value!==COMPLETE_CHANNEL_INTERNAL)){throw fail("FORWARD_COMPLETE_ORIGINAL_CHANNEL_FACTORY");}
    super(native, observeEventBytes, priorUsage, true, producerPrepare,complete??null);
  }
}
/** Resolve only Core's original pre-I/O token before constructing the fixed
 * variant. No public budget selector or registration callback is supplied. */
export async function createCurrentFootprintForwardWriterCompleteStartupChannel(origin:CurrentFootprintForwardWriterCompleteBirthOrigin,native:CurrentPcbWorkerStartupNativeDependency,observeEventBytes:(bytes:number)=>void,priorUsage:CurrentPcbWorkerStartupPriorUsage,producerPrepare:CurrentFootprintForwardWriterProducerPrepare):Promise<CurrentFootprintForwardWriterStartupChannel>{
 const original=await import("./current-footprint-forward-writer-complete-birth-origin.ts");const profile=original.requireOriginalCurrentFootprintForwardWriterCompleteBirth(origin);
 return new CurrentFootprintForwardWriterStartupChannel(native,observeEventBytes,priorUsage,producerPrepare,Object.freeze({key:COMPLETE_CHANNEL_INTERNAL,origin,profile}));
}

/** Unmounted future writer birth. No diagnostic owner constructs this class;
 * native current validation purposes refuse its begin/create controls. */
export class CurrentFootprintCopyCreateClockStartupChannel extends CurrentPcbWorkerStartupChannelCore {
  public constructor(native: CurrentPcbWorkerStartupNativeDependency, priorUsage?: CurrentPcbWorkerStartupPriorUsage) {
    super(INTERNAL_PROFILE, native, currentFootprintCombinedStartupWire, priorUsage, true);
  }
}
/** Separate private allocation birth; no existing native validation owner constructs it. */
export class CurrentFootprintCopyAllocatedCreateClockStartupChannel extends CurrentPcbWorkerStartupChannelCore {
  public constructor(native: CurrentPcbWorkerStartupNativeDependency, priorUsage?: CurrentPcbWorkerStartupPriorUsage) {
    super(INTERNAL_PROFILE, native, currentFootprintCombinedStartupWire, priorUsage, true, true);
  }
}
/** Fixed saved-generation owner; no writer, clock or parent challenge marker. */
export class CurrentFootprintCopySavedChannel extends CurrentPcbWorkerStartupChannelCore {
  public constructor(native: CurrentPcbWorkerStartupNativeDependency, priorUsage?: CurrentPcbWorkerStartupPriorUsage) {
    super(INTERNAL_PROFILE, native, currentFootprintCopySavedStartupWire, priorUsage);
  }
}
/** Separately marked held-saved birth. The owner supplies its original sealed
 * realm/target and charges actual sends, polls/events and retained bytes. */
export class CurrentFootprintCopyHeldSavedStartupChannel extends CurrentPcbWorkerStartupChannelCore {
  /** Bind the private held-cache grammar and shared accounting at channel birth.
   * Legacy saved/execution markers cannot substitute for this dependency. */
  public constructor(native: CurrentPcbWorkerStartupNativeDependency, binding: CurrentFootprintCopyHeldSavedChannelBinding,
    observeEventBytes: (bytes: number) => void, priorUsage?: CurrentPcbWorkerStartupPriorUsage) {
    super(INTERNAL_PROFILE, native, currentFootprintCopyHeldSavedStartupWire, priorUsage, false, false, observeEventBytes, false, binding);
  }
}
/** Separate native DELETE cold birth: shared readonly syntax, own dependency
 * marker and finite source leaf. No legacy saved-source path is enabled. */

/** Distinct accounted saved birth. Its fixed wire and353-request ceiling are
 * identical to the ordinary saved reader; it accepts no create or clock route. */
export class CurrentFootprintCopyForwardSavedStartupChannel extends CurrentPcbWorkerStartupChannelCore {
  public constructor(native: CurrentPcbWorkerStartupNativeDependency, observeEventBytes: (bytes: number) => void, priorUsage?: CurrentPcbWorkerStartupPriorUsage) {
    super(INTERNAL_PROFILE, native, currentFootprintCopySavedStartupWire, priorUsage, false, false, observeEventBytes, true);
  }
}
// oxlint-disable-next-line typescript/unbound-method -- Called only with the original WeakMap-selected private-field channel above.
const beginOriginalClockRpc = CurrentPcbWorkerStartupChannelCore.prototype.beginFootprintClockRpc;
// oxlint-disable-next-line typescript/unbound-method -- Called only with the original WeakMap-selected private-field channel below.
const prepareOriginalClockRpc = CurrentPcbWorkerStartupChannelCore.prototype.prepareFootprintClockRpc;
export function prepareCurrentFootprintCopyClockRpcChannel(dependency: CurrentPcbWorkerStartupDependency,
  workerSessionId: string): Promise<CurrentFootprintCopyClockRpcChannelReservation> {
  const channel = executionDependencies.get(dependency);
  if (!(channel instanceof CurrentFootprintCombinedStartupChannel)) { return Promise.reject(fail("FOOTPRINT_RPC_PURPOSE")); }
  return prepareOriginalClockRpc.call(channel, dependency, workerSessionId);
}
export function beginCurrentFootprintCopyClockRpcChannel(dependency: CurrentPcbWorkerStartupDependency,
  reservation: CurrentFootprintCopyClockRpcChannelReservation): Promise<CurrentFootprintCopyClockRpcChannelRoute> {
  const channel = executionDependencies.get(dependency);
  if (!(channel instanceof CurrentFootprintCombinedStartupChannel)) { return Promise.reject(fail("FOOTPRINT_RPC_PURPOSE")); }
  return beginOriginalClockRpc.call(channel, dependency, reservation);
}
// oxlint-disable typescript/unbound-method -- These fixed methods run only on the original private-map cold-v2 receiver below.
const prepareOriginalForwardAllocatedClock = CurrentPcbWorkerStartupChannelCore.prototype.prepareFootprintCreateClockRpc;
const beginOriginalForwardAllocatedClock = CurrentPcbWorkerStartupChannelCore.prototype.beginFootprintCreateClockRpc;
// oxlint-enable typescript/unbound-method
/** Separate cold-v2 channel entry. A Combined or copied dependency cannot
 * select this original allocated-clock reservation or its retained tail. */
export function prepareCurrentFootprintForwardAllocatedClockChannel(dependency: CurrentPcbWorkerStartupDependency,
  workerSessionId: string, invocation: CurrentFootprintCopyCreateInvocationLease, plan: CurrentFootprintCopyV2Plan): Promise<CurrentFootprintCopyClockRpcChannelReservation> {
  const channel = executionDependencies.get(dependency);
  if (!(channel instanceof CurrentFootprintForwardExecutionStartupChannel) || !isOriginalFootprintForwardExecutionDependency(dependency)) { return Promise.reject(fail("FORWARD_ALLOCATED_CLOCK_ORIGINAL_CHANNEL")); }
  return prepareOriginalForwardAllocatedClock.call(channel, dependency, workerSessionId, invocation, plan);
}
export function beginCurrentFootprintForwardAllocatedClockChannel(dependency: CurrentPcbWorkerStartupDependency,
  reservation: CurrentFootprintCopyClockRpcChannelReservation): Promise<CurrentFootprintCopyCreateClockChannelRoute> {
  const channel = executionDependencies.get(dependency);
  if (!(channel instanceof CurrentFootprintForwardExecutionStartupChannel) || !isOriginalFootprintForwardExecutionDependency(dependency)) { return Promise.reject(fail("FORWARD_ALLOCATED_CLOCK_ORIGINAL_CHANNEL")); }
  return beginOriginalForwardAllocatedClock.call(channel, dependency, reservation);
}

// oxlint-disable typescript/unbound-method -- Invoke only on the original WeakMap-selected full channel, never a caller receiver.
const prepareOriginalFullClock = CurrentPcbWorkerStartupChannelCore.prototype.prepareForwardWriterCreateClockRpc;
const beginOriginalFullClock = CurrentPcbWorkerStartupChannelCore.prototype.beginForwardWriterCreateClockRpc;
const retireOriginalFullClock = CurrentPcbWorkerStartupChannelCore.prototype.retireForwardWriterClockAfterOriginalExit;
const requestOriginalFullStartupWs=CurrentPcbWorkerStartupChannelCore.prototype.requestForwardWriterStartupWs;
const requestOriginalFullTicketTimer=CurrentPcbWorkerStartupChannelCore.prototype.requestForwardWriterTicketTimer;
const originalFullCreateWritten=CurrentPcbWorkerStartupChannelCore.prototype.originalForwardWriterCreateWritten;
const requestOriginalFullOwnData=CurrentPcbWorkerStartupChannelCore.prototype.requestForwardWriterOwnData;
const qualifyOriginalFullOwnDataHelper=CurrentPcbWorkerStartupChannelCore.prototype.qualifyForwardWriterOwnDataHelper;
const requestOriginalFullBranchQuery = CurrentPcbWorkerStartupChannelCore.prototype.requestForwardWriterBranchQuery;
const requestOriginalFullCopyDrain=CurrentPcbWorkerStartupChannelCore.prototype.requestForwardWriterCopyDrain;
const requestOriginalFullCopyPost=CurrentPcbWorkerStartupChannelCore.prototype.requestForwardWriterCopyPost;
const requestOriginalFullCopyDelete=CurrentPcbWorkerStartupChannelCore.prototype.requestForwardWriterCopyDelete;
const requestOriginalFullCopyTailObservation=CurrentPcbWorkerStartupChannelCore.prototype.requestForwardWriterCopyTailObservation;
const requestOriginalFullPublication = CurrentPcbWorkerStartupChannelCore.prototype.requestForwardWriterPublication;
const requestOriginalFullCopyUpload = CurrentPcbWorkerStartupChannelCore.prototype.requestForwardWriterCopyUpload;
const requestOriginalFullCopyLocal = CurrentPcbWorkerStartupChannelCore.prototype.requestForwardWriterCopyLocal;
// oxlint-enable typescript/unbound-method
export function prepareCurrentFootprintForwardWriterAllocatedClockChannel(dependency: CurrentPcbWorkerStartupDependency, origin: CurrentFootprintForwardWriterClockChannelOrigin): Promise<CurrentFootprintCopyClockRpcChannelReservation> {
  const channel = executionDependencies.get(dependency);
  if (!(channel instanceof CurrentFootprintForwardWriterStartupChannel) || !isOriginalFootprintForwardWriterDependency(dependency)) { return Promise.reject(fail("FORWARD_WRITER_CLOCK_ORIGINAL_CHANNEL")); }
  return prepareOriginalFullClock.call(channel, dependency, origin);
}
export function beginCurrentFootprintForwardWriterAllocatedClockChannel(dependency: CurrentPcbWorkerStartupDependency, reservation: CurrentFootprintCopyClockRpcChannelReservation): Promise<CurrentFootprintForwardWriterCreateClockChannelRoute> {
  const channel = executionDependencies.get(dependency);
  if (!(channel instanceof CurrentFootprintForwardWriterStartupChannel) || !isOriginalFootprintForwardWriterDependency(dependency)) { return Promise.reject(fail("FORWARD_WRITER_CLOCK_ORIGINAL_CHANNEL")); }
  return beginOriginalFullClock.call(channel, dependency, reservation);
}
export function retireCurrentFootprintForwardWriterClockAfterOriginalExit(dependency: CurrentPcbWorkerStartupDependency): Promise<void> {
  const channel = executionDependencies.get(dependency);
  if (!(channel instanceof CurrentFootprintForwardWriterStartupChannel) || !isOriginalFootprintForwardWriterDependency(dependency)) { return Promise.reject(fail("FORWARD_WRITER_CLOCK_ORIGINAL_CHANNEL")); }
  return retireOriginalFullClock.call(channel, dependency);
}

export function requestCurrentFootprintForwardWriterCopyLocal(dependency: CurrentPcbWorkerStartupDependency, command: CurrentFootprintForwardWriterCopyLocalCommand): Promise<unknown> {
  const channel = executionDependencies.get(dependency);
  if (!(channel instanceof CurrentFootprintForwardWriterStartupChannel) || !isOriginalFootprintForwardWriterDependency(dependency)) { return Promise.reject(fail("FORWARD_COPY_LOCAL_ORIGINAL_CHANNEL")); }
  return requestOriginalFullCopyLocal.call(channel, dependency, command);
}

export function requestCurrentFootprintForwardWriterCopyUpload(dependency: CurrentPcbWorkerStartupDependency, command: CurrentPcbViaUploadRequestCommand): Promise<unknown> {
  const channel = executionDependencies.get(dependency);
  if (!(channel instanceof CurrentFootprintForwardWriterStartupChannel) || !isOriginalFootprintForwardWriterDependency(dependency)) { return Promise.reject(fail("FORWARD_COPY_UPLOAD_ORIGINAL_CHANNEL")); }
  return requestOriginalFullCopyUpload.call(channel, dependency, command);
}

export function requestCurrentFootprintForwardWriterBranchQuery(dependency: CurrentPcbWorkerStartupDependency, command: CurrentFootprintForwardWriterBranchQueryCommand): Promise<unknown> {
  const channel = executionDependencies.get(dependency);
  if (!(channel instanceof CurrentFootprintForwardWriterStartupChannel) || !isOriginalFootprintForwardWriterDependency(dependency)) { return Promise.reject(fail("FORWARD_BRANCH_QUERY_ORIGINAL_CHANNEL")); }
  return requestOriginalFullBranchQuery.call(channel, dependency, command);
}

export function requestCurrentFootprintForwardWriterPublication(dependency:CurrentPcbWorkerStartupDependency,command:CurrentFootprintForwardWriterPublicationCommand):Promise<unknown>{
 const channel=executionDependencies.get(dependency);
 if(!(channel instanceof CurrentFootprintForwardWriterStartupChannel)||!isOriginalFootprintForwardWriterDependency(dependency)){return Promise.reject(fail("FORWARD_PUBLICATION_ORIGINAL_CHANNEL"));}
 return requestOriginalFullPublication.call(channel,dependency,command);
}

export function requestCurrentFootprintForwardWriterCopyTailObservation(dependency:CurrentPcbWorkerStartupDependency,command:CurrentPcbViaSaveTailObservationCommand):Promise<unknown>{
 const channel=executionDependencies.get(dependency);
 if(!(channel instanceof CurrentFootprintForwardWriterStartupChannel)||!isOriginalFootprintForwardWriterDependency(dependency)){return Promise.reject(fail("FORWARD_COPY_TAIL_ORIGINAL_CHANNEL"));}
 return requestOriginalFullCopyTailObservation.call(channel,dependency,command);
}

export function requestCurrentFootprintForwardWriterCopyDrain(dependency:CurrentPcbWorkerStartupDependency,command:CurrentPcbViaSaveDrainCommand):Promise<unknown>{
 const channel=executionDependencies.get(dependency);
 if(!(channel instanceof CurrentFootprintForwardWriterStartupChannel)||!isOriginalFootprintForwardWriterDependency(dependency)){return Promise.reject(fail("FORWARD_COPY_TAIL_ORIGINAL_CHANNEL"));}
 return requestOriginalFullCopyDrain.call(channel,dependency,command);
}

export function requestCurrentFootprintForwardWriterCopyPost(dependency:CurrentPcbWorkerStartupDependency,command:CurrentPcbViaPostHistorySyncCommand):Promise<unknown>{
 const channel=executionDependencies.get(dependency);
 if(!(channel instanceof CurrentFootprintForwardWriterStartupChannel)||!isOriginalFootprintForwardWriterDependency(dependency)){return Promise.reject(fail("FORWARD_COPY_TAIL_ORIGINAL_CHANNEL"));}
 return requestOriginalFullCopyPost.call(channel,dependency,command);
}

export function requestCurrentFootprintForwardWriterCopyDelete(dependency:CurrentPcbWorkerStartupDependency,command:CurrentPcbViaSaveTailDeleteControlCommand):Promise<unknown>{
 const channel=executionDependencies.get(dependency);
 if(!(channel instanceof CurrentFootprintForwardWriterStartupChannel)||!isOriginalFootprintForwardWriterDependency(dependency)){return Promise.reject(fail("FORWARD_COPY_TAIL_ORIGINAL_CHANNEL"));}
 return requestOriginalFullCopyDelete.call(channel,dependency,command);
}

export function originalCurrentFootprintForwardWriterCreateWritten(dependency:CurrentPcbWorkerStartupDependency):boolean{
 const channel=executionDependencies.get(dependency);if(!(channel instanceof CurrentFootprintForwardWriterStartupChannel)||!isOriginalFootprintForwardWriterDependency(dependency)){throw fail("FORWARD_TICKET_ORIGINAL_CHANNEL");}return originalFullCreateWritten.call(channel,dependency);
}
export function requestCurrentFootprintForwardWriterTicketTimer(dependency:CurrentPcbWorkerStartupDependency,command:CurrentFootprintForwardWriterTicketTimerCommand):Promise<unknown>{
 const channel=executionDependencies.get(dependency);if(!(channel instanceof CurrentFootprintForwardWriterStartupChannel)||!isOriginalFootprintForwardWriterDependency(dependency)){return Promise.reject(fail("FORWARD_TICKET_ORIGINAL_CHANNEL"));}return requestOriginalFullTicketTimer.call(channel,dependency,command);
}
export function requestCurrentFootprintForwardWriterOwnData(dependency:CurrentPcbWorkerStartupDependency,command:CurrentFootprintForwardWriterOwnDataCommand):Promise<unknown>{
 const channel=executionDependencies.get(dependency);if(!(channel instanceof CurrentFootprintForwardWriterStartupChannel)||!isOriginalFootprintForwardWriterDependency(dependency)){return Promise.reject(fail("FORWARD_OWN_DATA_ORIGINAL_CHANNEL"));}return requestOriginalFullOwnData.call(channel,dependency,command);
}
export function qualifyCurrentFootprintForwardWriterOwnDataChannelHelper(dependency:CurrentPcbWorkerStartupDependency,command:CurrentFootprintForwardWriterOwnDataCommand,program:string):Promise<unknown>{
 const channel=executionDependencies.get(dependency);if(!(channel instanceof CurrentFootprintForwardWriterStartupChannel)||!isOriginalFootprintForwardWriterDependency(dependency)){return Promise.reject(fail("FORWARD_OWN_DATA_ORIGINAL_CHANNEL"));}return qualifyOriginalFullOwnDataHelper.call(channel,dependency,command,program);
}

export function requestCurrentFootprintForwardWriterStartupWs(dependency:CurrentPcbWorkerStartupDependency,command:CurrentFootprintForwardWriterStartupWsCommand):Promise<unknown>{
 const channel=executionDependencies.get(dependency);if(!(channel instanceof CurrentFootprintForwardWriterStartupChannel)||!isOriginalFootprintForwardWriterDependency(dependency)){return Promise.reject(fail("FORWARD_STARTUP_WS_ORIGINAL_CHANNEL"));}return requestOriginalFullStartupWs.call(channel,dependency,command);
}
