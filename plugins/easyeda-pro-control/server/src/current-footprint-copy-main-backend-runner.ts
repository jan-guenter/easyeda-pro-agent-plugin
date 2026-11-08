import type { CurrentSelectedProjectMainOrigin } from "./current-selected-project-main-origin.ts";
import type { CurrentSchematicRelevanceDisplaySaveMainBackendBindings, CurrentSchematicRelevanceDisplaySaveMainOrigin } from "./current-schematic-relevance-display-save-main-origin.ts";
import { CurrentFootprintInverseMainHistoryCustody } from "./current-footprint-inverse-main-history-custody.ts";
import type { CurrentFootprintInverseMainHistoryRows } from "./current-footprint-inverse-main-history-custody.ts";
import { CurrentFootprintInverseMainHistoryCollector } from "./current-footprint-inverse-main-history-collector.ts";
import type { CurrentFootprintInverseMainHistoryBaseline } from "./current-footprint-inverse-main-history-baseline.ts";
import { CURRENT_FOOTPRINT_INVERSE_MAIN_HISTORY_REQUESTS as INVERSE_HISTORY, validateCurrentFootprintInverseMainHistoryCommand } from "./current-footprint-inverse-main-history-protocol.ts";
import type { CurrentFootprintInverseMainHistoryCommand } from "./current-footprint-inverse-main-history-protocol.ts";
import { CurrentPcbViaMainLiveHistoryCustody } from "./current-pcb-via-main-live-history-custody.ts";
import type { CurrentPcbViaMainLiveHistoryRows } from "./current-pcb-via-main-live-history-custody.ts";
import { CURRENT_PCB_VIA_MAIN_LIVE_HISTORY_REQUESTS as VIA_LIVE_HISTORY, validateCurrentPcbViaMainLiveHistoryCommand } from "./current-pcb-via-main-live-history-protocol.ts";
import type { CurrentPcbViaMainLiveHistoryCommand } from "./current-pcb-via-main-live-history-protocol.ts";
import { CURRENT_PCB_VIA_MAIN_LIVE_HISTORY_SITE, qualifyCurrentPcbViaMainLiveHistorySource } from "./current-pcb-via-main-live-history-source.ts";
/** One original-main startup continuation and construction capture. This runner
 * never opens a project, invokes an application callback, samples a clock or
 * grants a writer. The native transport retains root/Job/socket ownership. */
/* oxlint-disable import/max-dependencies -- The sole main scheduler directly joins its fixed grammars, source issuers and genuine native-owner capability; separating them would obscure the original lease boundary. */
import { performance } from "node:perf_hooks";
import { setTimeout as delay } from "node:timers/promises";
import { types } from "node:util";
import { z } from "zod";
import { createOriginalSourceError } from "./original-source-error.ts";
import { CURRENT_SAVED_PROJECT_REGISTRATION_CONFIG_CALLS as SAVED_CONFIG_CALLS } from "./current-saved-project-registration-config-programs.ts";
import { CURRENT_SAVED_PROJECT_REGISTRATION_CONFIG_SITE_NAMES, CURRENT_SAVED_PROJECT_REGISTRATION_CONFIG_REQUESTS as SAVED_CONFIG_REQUESTS } from "./current-saved-project-registration-config-protocol.ts";
import { canonicalJson } from "./core.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_REGISTRATION_BREAKPOINT_ID as REGISTRATION_ID, CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_APP_URL_PATTERN as URL_PATTERN, decodeCurrentFootprintCopyMainBackendArray,
  decodeCurrentFootprintCopyMainBackendFunction, decodeCurrentFootprintCopyMainBackendNative, validateCurrentFootprintCopyMainBackendCommand } from "./current-footprint-copy-main-backend-contract.ts";
import type { CurrentFootprintCopyMainBackendCommand as Command } from "./current-footprint-copy-main-backend-contract.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_CALLS as CALLS, CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_EXPRESSION as EXPRESSION,
  CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_FLAGS as FLAGS, CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_GROUP as GROUP } from "./current-footprint-copy-main-backend-programs.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_SOURCE as SOURCE, captureCurrentFootprintCopyMainBackendSourceReply,
  qualifyCurrentFootprintCopyMainBackendSource, requireCurrentFootprintCopyMainBackendSource } from "./current-footprint-copy-main-backend-source.ts";
import type { CurrentFootprintCopyMainBackendSource as QualifiedSource, CurrentFootprintCopyMainBackendRole as Role } from "./current-footprint-copy-main-backend-source.ts";
import { currentFootprintCopyMainBackendObservationSchema } from "./current-footprint-copy-main-backend-observation.ts";
import type { CurrentFootprintCopyMainBackendObservation } from "./current-footprint-copy-main-backend-observation.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_TRANSPORT as PROFILE } from "./current-footprint-copy-main-transport-contract.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_REQUESTS } from "./current-footprint-copy-main-backend-budget.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_CLEANUP_PHASES, CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_COLLECTION_SITES, CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_REQUESTS,
  currentFootprintCopyMainRequestAllocatedId, decodeCurrentFootprintCopyMainRequestCollectedFunction as decodeViaFunction,
  decodeCurrentFootprintCopyMainRequestArrayMember as decodeViaMember, decodeCurrentFootprintCopyMainRequestCollectionPause as decodeViaPause, validateCurrentFootprintCopyMainRequestCollectCommand } from "./current-footprint-copy-main-request-protocol.ts";
import type { CurrentFootprintCopyMainRequestCollectCommand } from "./current-footprint-copy-main-request-protocol.ts";
import { qualifyCurrentFootprintCopyMainRequestSource, requireCurrentFootprintCopyMainRequestSource } from "./current-footprint-copy-main-request-source.ts";
import type { CurrentFootprintCopyMainRequestSource } from "./current-footprint-copy-main-request-source.ts";
import { qualifyCurrentFootprintCopyMainCompletionSource, requireCurrentFootprintCopyMainCompletionSource } from "./current-footprint-copy-main-completion-source.ts";
import type { CurrentFootprintCopyMainCompletionSource } from "./current-footprint-copy-main-completion-source.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_REQUESTS, currentFootprintCopyMainCompletionAllocatedId, validateCurrentFootprintCopyMainCompletionCommand } from "./current-footprint-copy-main-completion-protocol.ts";
import type { CurrentFootprintCopyMainCompletionCommand } from "./current-footprint-copy-main-completion-protocol.ts";
import type { CurrentFootprintCopyMainCompletionOrigin, CurrentFootprintCopyMainCompletionOriginBindings } from "./current-footprint-copy-main-completion-origin.ts";
// oxlint-disable-next-line import/no-cycle -- The collector's issuer getter returns here; transfer is invoked only after both original owners exist, never during initialization.
import { requireCurrentFootprintCopyMainRequestHeldFinalPb, transferCurrentFootprintCopyMainRequestHeldFinalPb, transferCurrentFootprintForwardMainRequestHeldFinalPb } from "./current-footprint-copy-main-request-runner.ts";
import type { CurrentFootprintCopyMainRequestHeldFinalPb } from "./current-footprint-copy-main-request-runner.ts";
import type { CurrentSchematicRelevanceSavedRegistrationBindings, CurrentSchematicRelevanceSavedRegistrationIntent } from "./current-schematic-relevance-saved-registration-intent.ts";
import type { CurrentSchematicRelevanceDisplayRegistrationBindings, CurrentSchematicRelevanceDisplayRegistrationIntent } from "./current-schematic-relevance-display-registration-intent.ts";
// oxlint-disable-next-line import/no-cycle -- The native owner constructs this runner; its original private-factory guards are invoked only after that construction, never at module initialization. A callback registration seam would weaken this authority check.
import { assertCurrentFootprintCombinedMainCompletionCapacity, beginCurrentFootprintCombinedMainCompletion, currentFootprintCombinedMainGenerationExited, failCurrentFootprintCombinedMainCompletion, requireCurrentFootprintCombinedMainCapability, requireCurrentFootprintCombinedMainCleanup, requireCurrentFootprintCombinedPairedSchedule, requireCurrentFootprintHeadAgeBootstrapCapability, retireCurrentFootprintCombinedMainCompletion, sendCurrentFootprintCombinedMainCommand, sendCurrentFootprintCombinedMainCompletion, sendOriginalCurrentSchematicRelevanceDisplayMainLiveHistory } from './current-pcb-diagnostic-owner.ts';
import type { CurrentFootprintCombinedMainCapability, requireOriginalCurrentFootprintInverseRegistrationIntentForRunner as RequireInverseRegistration, requireOriginalCurrentSavedProjectRegistrationIntent as RequireSavedRegistration, requireOriginalCurrentSchematicRelevanceDisplayRegistrationIntent as RequireSchematicDisplayRegistration, requireOriginalCurrentSchematicRelevanceSavedRegistrationIntent as RequireSchematicSavedRegistration } from './current-pcb-diagnostic-owner.ts';
import type { CurrentFootprintInverseRegistrationBindings, CurrentFootprintInverseRegistrationIntent } from "./current-footprint-inverse-registration-origin.ts";
import type { CurrentFootprintCopyClockRpcOrigin } from "./current-footprint-copy-clock-rpc-origin.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { CURRENT_FOOTPRINT_HEAD_AGE_CONTEXT_BIND_PROGRAM, CURRENT_FOOTPRINT_HEAD_AGE_CONTEXT_CAPTURE_PROGRAM, decodeCurrentFootprintHeadAgeContextAccessor, decodeCurrentFootprintHeadAgeContextArray, decodeCurrentFootprintHeadAgeContextScopes, qualifyCurrentFootprintHeadAgeContextSource, requireCurrentFootprintHeadAgeContextSource } from "./current-footprint-head-age-context.ts";
import type { CurrentFootprintHeadAgeBootstrapCapability, CurrentFootprintHeadAgeContextSource } from "./current-footprint-head-age-context.ts";
import { CURRENT_FOOTPRINT_HEAD_AGE_CAPTURE_PROGRAM, CURRENT_FOOTPRINT_HEAD_AGE_DATE_METHODS, CURRENT_FOOTPRINT_HEAD_AGE_OBSERVE_PROGRAM,
  decodeCurrentFootprintHeadAgeArray, decodeCurrentFootprintHeadAgeMainObservation, decodeCurrentFootprintHeadAgeNativeMethod } from "./current-footprint-head-age-main.ts";
import type { CurrentFootprintHeadAgeMainObservation } from "./current-footprint-head-age-main.ts";
import { validateClockControlScope } from "./symbol-clock-controls.ts";
import { decodeCurrentFootprintHeadAgeCdpReply, isCurrentFootprintHeadAgeCdpPhase, rejectCurrentFootprintHeadAgeCdpException } from "./current-footprint-head-age-cdp-exception.ts";
import { qualifyCurrentProjectStructureMainSource, requireCurrentProjectStructureMainSource } from "./current-project-structure-main-source.ts";
import { CURRENT_PROJECT_STRUCTURE_MAIN_REQUESTS, validateCurrentProjectStructureMainCommand } from "./current-project-structure-main-protocol.ts";
import type { CurrentProjectStructureMainCommand } from "./current-project-structure-main-protocol.ts";
import type { CurrentProjectStructureMainBinding, CurrentProjectStructureMainLease } from "./current-project-structure-main-lease.ts";
import type { CurrentFootprintForwardMainCursor, CurrentFootprintForwardMainCursorSnapshot } from "./current-footprint-forward-main-cursor.ts";

/* oxlint-disable import/no-cycle -- Both issuers resolve original private registries only after construction; initialization issues no capability or native request. */
import { assertCurrentFootprintForwardExecutionMainCompletionCapacity, beginCurrentFootprintForwardExecutionMainCompletion,
  currentFootprintForwardExecutionMainGenerationExited, failCurrentFootprintForwardExecutionMainCompletion,
  isCurrentFootprintForwardExecutionMainCapability, pollCurrentFootprintForwardExecutionMain,
  reproveCurrentFootprintForwardExecutionMainPublication,
  requireCurrentFootprintForwardExecutionMainCapability, requireCurrentFootprintForwardExecutionMainCleanup,
  retireCurrentFootprintForwardExecutionMainCompletion, sendCurrentFootprintForwardExecutionMainCommand,
  sendCurrentFootprintForwardExecutionMainCompletion } from "./current-footprint-forward-execution-main-capability.ts";
/* oxlint-enable import/no-cycle */
import type { CurrentFootprintForwardExecutionMainCapability } from "./current-footprint-forward-execution-main-capability.ts";

import { captureCurrentFootprintForwardExecutionPrototypes, requireCurrentFootprintForwardExecutionPrototypes } from "./current-footprint-forward-execution-opening-identity.ts";
/* oxlint-disable import/no-cycle -- Only the original dedicated native factory issues this capability after both constructors exist; an injectable registration hook would lose original-owner authority. */
import { currentProjectStructureMainGenerationExited, isCurrentProjectStructureMainCapability, requireCurrentProjectStructureMainCapability,
  requireCurrentProjectStructureMainCleanup, sendCurrentProjectStructureMainCommand } from "./current-project-structure-main-capability.ts";
/* oxlint-enable import/no-cycle */
import type { CurrentProjectStructureMainCapability } from "./current-project-structure-main-capability.ts";

// oxlint-disable-next-line import/no-cycle -- The actual selected-file native factory creates this runner; no capability issues during module initialization.
import { originalCurrentFootprintInverseMainHistoryBaseline, prepareOriginalCurrentSelectedFileStartupActors, requireCurrentSelectedFileMainSqlFenceBootstrap, sendCurrentSelectedFileMainSqlFenceCommand, sendOriginalCurrentFootprintInverseMainHistory, sendOriginalCurrentPcbViaMainBegin, sendOriginalCurrentPcbViaMainCommand, sendOriginalCurrentPcbViaMainHistory, sendOriginalCurrentPcbViaMainLiveHistory, sendOriginalCurrentPcbViaMainStep, sendOriginalCurrentPcbViaMainStructure, sendOriginalCurrentSchematicRelevanceDisplayMain, sendOriginalCurrentSchematicRelevanceDisplayMainStructure } from "./current-selected-file-main-sql-fence-bootstrap.ts";
import type { CurrentSelectedFileMainSqlFenceBootstrap } from "./current-selected-file-main-sql-fence-bootstrap.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_SOURCE as SQL_SOURCE, qualifyCurrentSelectedFileMainSqlFenceSource } from "./current-selected-file-main-sql-fence-source.ts";
import type { CurrentSelectedFileMainSqlFenceSite } from "./current-selected-file-main-sql-fence-source.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_CAPTURE_PROGRAM as SQL_CAPTURE, CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_CONDITIONS as SQL_CONDITIONS, CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_CONFIGURATION_PROGRAM as SQL_CONFIGURATION,
  CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_REQUIRE_PROGRAM as SQL_REQUIRE } from "./current-selected-file-main-sql-fence-programs.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_CALL_FLAGS as SQL_CALL, CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_EARLY_ID as SQL_EARLY_ID,
  CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_FRAME_FLAGS as SQL_FRAME, CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_NATIVE_EXPRESSION as SQL_NATIVE_EXPRESSION,
  CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_REQUESTS as SQL_REQUESTS, CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_SITES as SQL_SITES,
  validateCurrentSelectedFileMainSqlFenceCommand } from "./current-selected-file-main-sql-fence-protocol.ts";
import type { CurrentSelectedFileMainSqlFenceCommand } from "./current-selected-file-main-sql-fence-protocol.ts";
import { currentSelectedFileMainSqlFenceImportsError, decodeCurrentSelectedFileMainSqlFenceNative, decodeCurrentSelectedFileMainSqlFenceNativeArray } from "./current-selected-file-main-sql-fence-replies.ts";
import type { CurrentPcbViaMainBeginPause } from "./current-pcb-via-main-begin-custody.ts";
import { currentGeneratedProjectHistorySqlBaselineSchema } from "./current-generated-project-history-sql-baseline.ts";
import type { CurrentPcbViaMainHistoryHandoff } from "./current-pcb-via-main-history-custody.ts";
import { CurrentPcbViaMainStructureCustody } from "./current-pcb-via-main-structure-custody.ts";
import { CURRENT_PCB_VIA_MAIN_STRUCTURE_REQUESTS as VIA_STRUCTURE, currentPcbViaMainStructureExpectedSchema, validateCurrentPcbViaMainStructureCommand } from "./current-pcb-via-main-structure-protocol.ts";
import type { CurrentPcbViaMainStructureCommand, CurrentPcbViaMainStructureExpected, CurrentPcbViaMainStructureStep } from "./current-pcb-via-main-structure-protocol.ts";
import { CURRENT_PCB_VIA_MAIN_STRUCTURE_SITES as VIA_STRUCTURE_SITES } from "./current-pcb-via-main-structure-source.ts";
import type { CurrentProjectStructureSqlEffects } from "./current-project-structure-sql-effects.ts";
import { CurrentPcbViaMainHistoryCustody } from "./current-pcb-via-main-history-custody.ts";
import { CURRENT_PCB_VIA_MAIN_HISTORY_REQUESTS as VIA_HISTORY, CURRENT_PCB_VIA_MAIN_HISTORY_SITES as VIA_HISTORY_SITES, validateCurrentPcbViaMainHistoryCommand } from "./current-pcb-via-main-history-protocol.ts";
import type { CurrentPcbViaMainHistoryCommand, CurrentPcbViaMainHistoryStep } from "./current-pcb-via-main-history-protocol.ts";
import type { CurrentProjectHistorySqlEffects } from "./current-project-history-sql-effects.ts";
import type { CurrentGeneratedProjectHistorySqlBaseline } from "./current-generated-project-history-sql-baseline.ts";
import { CurrentPcbViaMainBeginCustody } from "./current-pcb-via-main-begin-custody.ts";
import { CURRENT_PCB_VIA_MAIN_BEGIN_REQUESTS as VIA_BEGIN, validateCurrentPcbViaMainBeginCommand } from "./current-pcb-via-main-begin-protocol.ts";
import type { CurrentPcbViaMainBeginCommand } from "./current-pcb-via-main-begin-protocol.ts";
import { CURRENT_PCB_VIA_MAIN_REQUESTS as VIA_REQUESTS, validateCurrentPcbViaMainCommand } from "./current-pcb-via-main-protocol.ts";
import { CURRENT_PCB_VIA_MAIN_STEP_REQUESTS as VIA_STEPS, validateCurrentPcbViaMainStepCommand } from "./current-pcb-via-main-step-protocol.ts";
import type { CurrentPcbViaMainStepCommand } from "./current-pcb-via-main-step-protocol.ts";
import type { CurrentPcbViaMainCommand } from "./current-pcb-via-main-protocol.ts";
import type { CurrentPcbViaMainBackendBindings, CurrentPcbViaMainEvent, CurrentPcbViaMainOrigin } from "./current-pcb-via-main-origin.ts";
import { createHash } from "node:crypto";
import { CURRENT_SELECTED_FILE_MAIN_FETCH_SOURCE as FETCH_SOURCE } from "./current-selected-file-main-fetch-source.ts";
import { CurrentSelectedFileMainRequestReader } from "./current-selected-file-main-request-reader.ts";
import type { CurrentSelectedFileMainRequestObservation } from "./current-selected-file-main-request-reader.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_EXPRESSIONS as VIA_FRAMES } from "./current-footprint-copy-main-request-programs.ts";
import { currentFootprintCopyMainRequestPlanSchema, decodeCurrentFootprintCopyMainRequestPromise as decodeViaPromise, decodeCurrentFootprintCopyMainRequestValue as decodeViaValue } from "./current-footprint-copy-main-request-contract.ts";
import { CURRENT_MAIN_STARTUP_CONFIG_CALLS as STARTUP_CALLS } from "./current-main-startup-config-programs.ts";
import { qualifyCurrentMainStartupConfigSource } from "./current-main-startup-config-sql.ts";
import { CurrentMainStartupConfigProgress, currentMainStartupConfigSelectionSchema } from "./current-main-startup-config-progress.ts";
import type { CurrentSavedProjectRegistrationBindings, CurrentSavedProjectRegistrationIntent } from "./current-saved-project-registration-origin.ts";
import { CURRENT_SAVED_PROJECT_REGISTRATION_CONFIG_SITES as SAVED_CONFIG_SITES, qualifyCurrentSavedProjectRegistrationConfigSource } from "./current-saved-project-registration-config-source.ts";
import { currentSelectedFileMainSqlCaptureError } from "./current-selected-file-main-sql-capture-error.ts";

type MainCapability = CurrentFootprintCombinedMainCapability | CurrentFootprintForwardExecutionMainCapability | CurrentProjectStructureMainCapability;
function mainCapability(capability: MainCapability, runner: CurrentFootprintCopyMainBackendRunner): void {
  if (isCurrentProjectStructureMainCapability(capability)) { requireCurrentProjectStructureMainCapability(capability, runner); }
  else if (isCurrentFootprintForwardExecutionMainCapability(capability)) { requireCurrentFootprintForwardExecutionMainCapability(capability, runner); }
  else { requireCurrentFootprintCombinedMainCapability(capability, runner); }
}
function mainCleanup(capability: MainCapability, runner: CurrentFootprintCopyMainBackendRunner): void {
  if (isCurrentProjectStructureMainCapability(capability)) { requireCurrentProjectStructureMainCleanup(capability, runner); }
  else if (isCurrentFootprintForwardExecutionMainCapability(capability)) { requireCurrentFootprintForwardExecutionMainCleanup(capability, runner); }
  else { requireCurrentFootprintCombinedMainCleanup(capability, runner); }
}
function mainExited(capability: MainCapability, runner: CurrentFootprintCopyMainBackendRunner): boolean {
  if (isCurrentProjectStructureMainCapability(capability)) { return currentProjectStructureMainGenerationExited(capability, runner); }
  return isCurrentFootprintForwardExecutionMainCapability(capability) ? currentFootprintForwardExecutionMainGenerationExited(capability, runner) : currentFootprintCombinedMainGenerationExited(capability, runner);
}
async function mainCommand(capability: MainCapability, runner: CurrentFootprintCopyMainBackendRunner,
  command: CurrentFootprintCopyMainRequestCollectCommand | CurrentProjectStructureMainCommand, id: number): Promise<void> {
  if (isCurrentProjectStructureMainCapability(capability)) { await sendCurrentProjectStructureMainCommand(capability, runner, validateCurrentProjectStructureMainCommand(command), id); return; }
  await (isCurrentFootprintForwardExecutionMainCapability(capability) ? sendCurrentFootprintForwardExecutionMainCommand(capability, runner, validateCurrentFootprintCopyMainRequestCollectCommand(command), id) : sendCurrentFootprintCombinedMainCommand(capability, runner, command, id));
}
function mainCompletionCapacity(capability: MainCapability, runner: CurrentFootprintCopyMainBackendRunner, first: number): void {
  need(!isCurrentProjectStructureMainCapability(capability), "STRUCTURE_COMPLETION_ROLE_UNAVAILABLE");
  if (isCurrentFootprintForwardExecutionMainCapability(capability)) { assertCurrentFootprintForwardExecutionMainCompletionCapacity(capability, runner, first); }
  else { assertCurrentFootprintCombinedMainCompletionCapacity(capability, runner, first); }
}
async function mainCompletionBegin(capability: MainCapability, runner: CurrentFootprintCopyMainBackendRunner, first: number): Promise<void> {
  need(!isCurrentProjectStructureMainCapability(capability), "STRUCTURE_COMPLETION_ROLE_UNAVAILABLE");
  await (isCurrentFootprintForwardExecutionMainCapability(capability) ? beginCurrentFootprintForwardExecutionMainCompletion(capability, runner, first) : beginCurrentFootprintCombinedMainCompletion(capability, runner, first));
}
async function mainCompletionCommand(capability: MainCapability, runner: CurrentFootprintCopyMainBackendRunner,
  command: CurrentFootprintCopyMainCompletionCommand, id: number): Promise<void> {
  need(!isCurrentProjectStructureMainCapability(capability), "STRUCTURE_COMPLETION_ROLE_UNAVAILABLE");
  await (isCurrentFootprintForwardExecutionMainCapability(capability) ? sendCurrentFootprintForwardExecutionMainCompletion(capability, runner, command, id) : sendCurrentFootprintCombinedMainCompletion(capability, runner, command, id));
}
async function mainCompletionRetire(capability: MainCapability, runner: CurrentFootprintCopyMainBackendRunner): Promise<void> {
  need(!isCurrentProjectStructureMainCapability(capability), "STRUCTURE_COMPLETION_ROLE_UNAVAILABLE");
  await (isCurrentFootprintForwardExecutionMainCapability(capability) ? retireCurrentFootprintForwardExecutionMainCompletion(capability, runner) : retireCurrentFootprintCombinedMainCompletion(capability, runner));
}
function mainCompletionFail(capability: MainCapability, runner: CurrentFootprintCopyMainBackendRunner): void {
  if (isCurrentProjectStructureMainCapability(capability)) { return; }
  if (isCurrentFootprintForwardExecutionMainCapability(capability)) { failCurrentFootprintForwardExecutionMainCompletion(capability, runner); }
  else { failCurrentFootprintCombinedMainCompletion(capability, runner); }
}

export { currentFootprintCopyMainBackendObservationSchema } from "./current-footprint-copy-main-backend-observation.ts";
export type { CurrentFootprintCopyMainBackendObservation } from "./current-footprint-copy-main-backend-observation.ts";
export { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_REQUESTS } from "./current-footprint-copy-main-backend-budget.ts";

export interface CurrentFootprintCopyMainBackendTransport {
  readonly assertCurrent: () => Promise<void>;
  readonly send: (command: Command, id: number) => Promise<void>;
  /** Canonical base64 chunks of NUL-separated UTF-8 inspector messages. */
  readonly poll: (cleanup: boolean) => Promise<string>;
}
export interface CurrentFootprintCopyMainRequestOrigin {
  readonly profile: "private.current-footprint-copy-main-request-origin.v1"; readonly executionAuthorized: false;
}
export interface CurrentFootprintCopyMainRequestOriginEvent {
  readonly method: "Debugger.paused" | "Debugger.resumed"; readonly params: unknown;
}
export interface CurrentFootprintCopyMainRequestOriginBindings {
  readonly scriptId: string; readonly retainedArrayObjectId: string; readonly driverCallbackObjectId: string;
  readonly qualifiedSource: CurrentFootprintCopyMainRequestSource;
  readonly assertOriginal: () => Promise<void>; readonly assertCleanup: () => Promise<void>;
  readonly assertOriginalGenerationExited: () => Promise<void>;
  readonly request: (command: CurrentFootprintCopyMainRequestCollectCommand, cleanup: boolean) => Promise<unknown>;
  readonly pump: (cleanup: boolean) => Promise<void>;
  readonly takeEvent: () => CurrentFootprintCopyMainRequestOriginEvent | null;
  readonly retire: () => Promise<void>;
}
export interface CurrentFootprintForwardMainRequestOrigin {
  readonly profile: "private.current-footprint-forward-main-request-origin.v2"; readonly executionAuthorized: false;
}
export interface CurrentFootprintForwardMainCompletionOrigin {
  readonly profile: "private.current-footprint-forward-main-completion-origin.v2"; readonly executionAuthorized: false;
}
export interface CurrentFootprintForwardMainRequestOriginBindings extends CurrentFootprintCopyMainRequestOriginBindings {
  readonly fail: (error: unknown) => void;
  readonly request: (command: CurrentFootprintCopyMainRequestCollectCommand, cleanup: boolean, retainAllocation?: (reply: unknown) => void) => Promise<unknown>;
  readonly settleAllocation: () => Promise<void>;
}
export interface CurrentFootprintForwardMainCompletionOriginBindings extends CurrentFootprintCopyMainCompletionOriginBindings {
  readonly request: (command: CurrentFootprintCopyMainCompletionCommand, cleanup: boolean, retainAllocation?: (reply: unknown) => void) => Promise<unknown>;
  readonly settleAllocation: () => Promise<void>;
}
type MainRequestOrigin = CurrentFootprintCopyMainRequestOrigin | CurrentFootprintForwardMainRequestOrigin;
type MainCompletionOrigin = CurrentFootprintCopyMainCompletionOrigin | CurrentFootprintForwardMainCompletionOrigin;
interface OriginEntry { readonly kind: "combined" | "forward"; readonly assertOriginalEntry: () => void; readonly bindings: CurrentFootprintForwardMainRequestOriginBindings;
  readonly capability: MainCapability; readonly runner: CurrentFootprintCopyMainBackendRunner }
const requestOrigins = new WeakMap<object, OriginEntry>();
const completionOrigins = new WeakMap<object, Readonly<{
  kind: "combined" | "forward"; assertOriginalEntry: () => void; bindings: CurrentFootprintForwardMainCompletionOriginBindings;
}>>();
const structureLeases = new WeakMap<CurrentProjectStructureMainLease, Readonly<{
  assertOriginalEntry: () => void; binding: CurrentProjectStructureMainBinding;
}>>();
const forwardMainCursors = new WeakMap<CurrentFootprintForwardMainCursor, Readonly<{
  runner: CurrentFootprintCopyMainBackendRunner;
  snapshot: () => CurrentFootprintForwardMainCursorSnapshot;
}>>();
/** Original cursor observations carry no send permission. The future writer
 * issuer must independently bind this exact runner to its own v2 generation. */
export function requireCurrentFootprintForwardMainCursor(token: CurrentFootprintForwardMainCursor,
  runner: CurrentFootprintCopyMainBackendRunner): CurrentFootprintForwardMainCursorSnapshot {
  const held = forwardMainCursors.get(token); need(held !== undefined && held.runner === runner, "FORWARD_CURSOR_ORIGINAL"); return held.snapshot();
}
/** Sequential handoff requires an acknowledged original upload retirement,
 * with every reply, event, pause and capture settled. This proof neither
 * issues a structure lease nor relaxes the old mutually exclusive purposes. */
export function requireCurrentFootprintForwardMainUploadSettlement(token: CurrentFootprintForwardMainCursor,
  runner: CurrentFootprintCopyMainBackendRunner): CurrentFootprintForwardMainCursorSnapshot {
  const snapshot = requireCurrentFootprintForwardMainCursor(token, runner);
  need(snapshot.phase === "upload-settled" && !snapshot.busy && !snapshot.incompleteFrame && snapshot.pendingReplies === 0 && snapshot.pendingEvents === 0 &&
    !snapshot.paused, "FORWARD_CURSOR_UPLOAD_UNSETTLED"); return snapshot;
}
/** Require the construction runner's exact token; caller JSON cannot issue a
 * structure request lease or replace its original transport and event cursor. */
export function requireCurrentProjectStructureMainLease(token: CurrentProjectStructureMainLease): CurrentProjectStructureMainBinding {
  const entry = structureLeases.get(token); need(entry !== undefined, "STRUCTURE_ORIGINAL_LEASE_REQUIRED");
  entry.assertOriginalEntry(); return entry.binding;
}
export function requireCurrentFootprintCopyMainCompletionOrigin(token: CurrentFootprintCopyMainCompletionOrigin): CurrentFootprintCopyMainCompletionOriginBindings {
  const entry = completionOrigins.get(token); need(entry !== undefined && entry.kind === "combined", "COMPLETION_ORIGINAL_LEASE_REQUIRED");
  entry.assertOriginalEntry(); return entry.bindings;
}
export function requireCurrentFootprintCopyMainRequestOrigin(token: CurrentFootprintCopyMainRequestOrigin): CurrentFootprintCopyMainRequestOriginBindings {
  const entry = requestOrigins.get(token); need(entry !== undefined && entry.kind === "combined", "REQUEST_ORIGINAL_LEASE_REQUIRED");
  entry.assertOriginalEntry(); return entry.bindings;
}
/** The actual native issuer joins both origins through the same retained
 * combined core. Equal plan bytes or a foreign genuine clock packet fail. */
export function requireCurrentFootprintCopyMainRequestClockOrigin(token: CurrentFootprintCopyMainRequestOrigin,
  clock: CurrentFootprintCopyClockRpcOrigin): void {
  const entry = requestOrigins.get(token); need(entry !== undefined && entry.kind === "combined", "REQUEST_ORIGINAL_LEASE_REQUIRED");
  entry.assertOriginalEntry(); need(!isCurrentFootprintForwardExecutionMainCapability(entry.capability) && !isCurrentProjectStructureMainCapability(entry.capability), "REQUEST_ORIGINAL_LEASE_REQUIRED");
  requireCurrentFootprintCombinedPairedSchedule(entry.capability, entry.runner, clock);
}

export function isCurrentFootprintForwardMainRequestOrigin(value: unknown): value is CurrentFootprintForwardMainRequestOrigin {
  return value !== null && typeof value === "object" && !types.isProxy(value) && requestOrigins.get(value)?.kind === "forward";
}
export function isCurrentFootprintForwardMainCompletionOrigin(value: unknown): value is CurrentFootprintForwardMainCompletionOrigin {
  return value !== null && typeof value === "object" && !types.isProxy(value) && completionOrigins.get(value)?.kind === "forward";
}
/** Separate genuine-v2 getters never accept the legacy Combined origins. */
export function requireCurrentFootprintForwardMainRequestOrigin(token: CurrentFootprintForwardMainRequestOrigin): CurrentFootprintForwardMainRequestOriginBindings {
  const entry = requestOrigins.get(token); need(entry !== undefined && entry.kind === "forward", "FORWARD_REQUEST_ORIGINAL_LEASE_REQUIRED");
  entry.assertOriginalEntry(); return entry.bindings;
}
export function requireCurrentFootprintForwardMainCompletionOrigin(token: CurrentFootprintForwardMainCompletionOrigin): CurrentFootprintForwardMainCompletionOriginBindings {
  const entry = completionOrigins.get(token); need(entry !== undefined && entry.kind === "forward", "FORWARD_COMPLETION_ORIGINAL_LEASE_REQUIRED");
  entry.assertOriginalEntry(); return entry.bindings;
}

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const location = z.object({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() }).strict();
const frame = z.looseObject({ callFrameId: handle, location });
const registrationId = z.literal(REGISTRATION_ID);
const pauseSchema = z.looseObject({ reason: z.string().max(128), callFrames: z.array(frame).min(1).max(64), hitBreakpoints: z.array(z.string().min(1).max(512)).max(2).optional() });
const empty = z.object({}).strict();
const sqlTrueValue = z.object({ type: z.literal("boolean"), value: z.literal(true) }).strict();
const sqlTrueReply = z.object({ result: sqlTrueValue }).strict();
const sqlConfigurationValue = z.object({ schema: z.literal("private.selected-file-main-sql-initializer-config.v1"), stage: z.enum(["serialize", "pragma"]),
  path: z.string().min(1).max(4096), selectedFile: z.boolean(), readonlySql: z.literal(false), nativeCompletionProven: z.literal(false), designWriteGrant: z.literal(false) }).strict();
const sqlConfigurationRemote = z.object({ type: z.literal("object"), value: sqlConfigurationValue }).strict();
const sqlConfigurationReply = z.object({ result: sqlConfigurationRemote }).strict();
const objectReply = z.object({ result: z.object({ type: z.literal("object"), subtype: z.literal("array"), className: z.literal("Array"),
  description: z.string().max(32), objectId: handle }).strict() }).strict();
const savedRegistrationEpoch = z.number().int().min(-8_640_000_000_000_000).max(8_640_000_000_000_000);
const savedRegistrationRunValue = z.strictObject({ schema: z.literal("private.current-saved-project-registration-run.v1"), path: z.string().max(4096),
  insertEpochMilliseconds: savedRegistrationEpoch, updateEpochMilliseconds: savedRegistrationEpoch,
  nativeSqlCallbackCompleted: z.literal(false), selectedDesignWriteAuthorized: z.literal(false) });
const savedRegistrationRunRemote = z.strictObject({ type: z.literal("object"), value: savedRegistrationRunValue });
const savedRegistrationRunReply = z.strictObject({ result: savedRegistrationRunRemote });
type SavedRegistrationSite = typeof CURRENT_SAVED_PROJECT_REGISTRATION_CONFIG_SITE_NAMES[number];
interface Pause { readonly frameId: string; readonly location: z.infer<typeof location>; readonly registration: boolean; readonly sqlSite?: CurrentSelectedFileMainSqlFenceSite; readonly savedRegistrationSite?: SavedRegistrationSite; resumeAttempted: boolean; resumed: boolean }
interface SavedProjectRegistrationEnrollment {
  readonly kind: "saved";
  readonly intent: CurrentSavedProjectRegistrationIntent; readonly bindings: CurrentSavedProjectRegistrationBindings;
  readonly ownerModule: Readonly<{ requireOriginalCurrentSavedProjectRegistrationIntent: typeof RequireSavedRegistration }>;
  readonly requireOriginal: typeof RequireSavedRegistration;
}
interface InverseProjectRegistrationEnrollment {
  readonly kind: "inverse";
  readonly intent: CurrentFootprintInverseRegistrationIntent; readonly bindings: CurrentFootprintInverseRegistrationBindings;
  readonly ownerModule: Readonly<{ requireOriginalCurrentFootprintInverseRegistrationIntentForRunner: typeof RequireInverseRegistration }>;
  readonly requireOriginal: typeof RequireInverseRegistration;
}
interface SchematicSavedProjectRegistrationEnrollment {
  readonly kind: "schematic-saved";
  readonly intent: CurrentSchematicRelevanceSavedRegistrationIntent; readonly bindings: CurrentSchematicRelevanceSavedRegistrationBindings;
  readonly ownerModule: Readonly<{ requireOriginalCurrentSchematicRelevanceSavedRegistrationIntent: typeof RequireSchematicSavedRegistration }>;
  readonly requireOriginal: typeof RequireSchematicSavedRegistration;
}
interface SchematicDisplayProjectRegistrationEnrollment {
  readonly kind: "schematic-relevance-display";
  readonly intent: CurrentSchematicRelevanceDisplayRegistrationIntent; readonly bindings: CurrentSchematicRelevanceDisplayRegistrationBindings;
  readonly ownerModule: Readonly<{ requireOriginalCurrentSchematicRelevanceDisplayRegistrationIntent: typeof RequireSchematicDisplayRegistration }>;
  readonly requireOriginal: typeof RequireSchematicDisplayRegistration;
}
type ProjectRegistrationEnrollment = SavedProjectRegistrationEnrollment | InverseProjectRegistrationEnrollment | SchematicSavedProjectRegistrationEnrollment | SchematicDisplayProjectRegistrationEnrollment;
interface Resolved { readonly breakpointId: string; readonly location: z.infer<typeof location> }
interface StructureAllocation { readonly id: number; readonly retain: (reply: unknown) => void; seen: boolean; stopped: boolean }
interface ForwardPoll {
  readonly allocation: StructureAllocation;
  readonly retain: (chunk: string) => void;
  delivered: boolean;
  settled: boolean;
  chunk: string | null;
}
interface RegistrationLocationFailure {
  readonly lineNumber: number;
  readonly columnNumber: number;
  readonly scriptObserved: boolean;
}
type MetadataRole = "head-age-context-array" | "head-age-context-getter" | "head-age-context-setter" | "head-age-context-getter-scopes" | "head-age-context-setter-scopes" | Role | "Date" | "now" | "retained-array" | "head-age-array" | typeof CURRENT_FOOTPRINT_HEAD_AGE_DATE_METHODS[number];
interface SchemaIssue { readonly code: string; readonly path: readonly (string | number)[] }
const schemaPathKeys = new Set(["args", "breakpointId", "callFrameId", "callFrames", "className", "columnNumber", "configurable", "context", "debuggerId",
  "description", "enumerable", "executionContextId", "hitBreakpoints", "id", "internalProperties", "isOwn", "lineNumber", "location", "locations", "name",
  "objectId", "reason", "result", "scriptId", "scriptSource", "subtype", "type", "url", "value", "writable"]);
const schemaIssueCodes = new Set(["custom", "invalid_element", "invalid_format", "invalid_key", "invalid_type", "invalid_union", "invalid_value",
  "not_multiple_of", "too_big", "too_small", "unrecognized_keys"]);
const issuedFailures = new WeakMap<Error, string>();
const methodNames = ["assertCurrent", "send", "poll"] as const;
function need(value: boolean, detail: string): asserts value {
  if (!value) { const error = createOriginalSourceError("FOOTPRINT_MAIN_CONSTRUCTION", detail); issuedFailures.set(error, detail); throw error; }
}
function schemaIssues(error: z.ZodError): readonly SchemaIssue[] {
  return Object.freeze(error.issues.slice(0, 6).map(issue => Object.freeze({ code: schemaIssueCodes.has(issue.code) ? issue.code : "other",
    path: Object.freeze(issue.path.slice(0, 8).map(segment => schemaPathSegment(segment))) })));
}
function schemaPathSegment(segment: PropertyKey): string | number {
  if (typeof segment === "number" && Number.isSafeInteger(segment) && segment >= 0 && segment <= 256) { return segment; }
  if (typeof segment === "string" && schemaPathKeys.has(segment)) { return segment; }
  return "$unknown";
}
function methods(transport: CurrentFootprintCopyMainBackendTransport): readonly unknown[] {
  need(!types.isProxy(transport) && Object.isFrozen(transport) && Object.getPrototypeOf(transport) === Object.prototype && Reflect.ownKeys(transport).length === methodNames.length, "TRANSPORT");
  return methodNames.map(name => { const entry = Object.getOwnPropertyDescriptor(transport, name); need(entry !== undefined && Object.hasOwn(entry, "value") && typeof entry.value === "function", "TRANSPORT"); return entry.value as unknown; });
}
const issued = new WeakMap<CurrentFootprintCopyMainBackendObservation, CurrentFootprintCopyMainBackendRunner>();
const forwardPollRetainers = new WeakMap<(chunk: string) => void, Readonly<{ runner: CurrentFootprintCopyMainBackendRunner; requireOriginal: () => void }>>();
const selectedRequestPackets = new WeakMap<CurrentSelectedFileMainRequestObservation, Readonly<{ runner: CurrentFootprintCopyMainBackendRunner; pause: Pause; text: string }>>();
export function requireOriginalCurrentSelectedFileMainRequest(packet: CurrentSelectedFileMainRequestObservation, runner: CurrentFootprintCopyMainBackendRunner): void {
  const original = selectedRequestPackets.get(packet); need(original !== undefined && original.runner === runner, "SELECTED_REQUEST_ORIGINAL"); runner.requireOriginalSelectedMainRequest(packet);
}
export class CurrentFootprintCopyMainBackendRunner {
  readonly #transport: CurrentFootprintCopyMainBackendTransport;
  readonly #methods: readonly unknown[];
  readonly #decoder = new TextDecoder("utf-8", { fatal: true });
  #decoderPendingContinuations = 0;
  readonly #scripts = new Map<string, number>();
  #selectedRequestReader: CurrentSelectedFileMainRequestReader | null = null;
  #selectedRequestPause: Pause | null = null;
  #selectedFetchScript: Readonly<{ scriptId: string; executionContextId: number }> | null = null;
  readonly #sqlApprovedReadRequests = new WeakSet<Pause>();
  readonly #selectedObservedRequests = new WeakMap<Pause, CurrentSelectedFileMainRequestObservation>();
  #selectedReadonlyContinuations = 0;
  readonly #selectedSqlBootstrap: CurrentSelectedFileMainSqlFenceBootstrap | null;
  readonly #selectedSqlPath: string | null;
  readonly #sqlBreakpoints = new Map<string, CurrentSelectedFileMainSqlFenceSite>();
  readonly #sqlResolutions: Resolved[] = [];
  #sqlArming: CurrentSelectedFileMainSqlFenceSite | null = null;
  #sqlCapture: string | null = null;
  #sqlReady = false;
  #startupConfigTracker: string | null = null;
  #startupSqlContinuations = 0;
  #startupMetadataContinuations = 0;
  readonly #startupConfigProgress = new CurrentMainStartupConfigProgress();
  #sqlHeld: Pause | null = null;
  #inverseMainHistoryIntent: CurrentFootprintInverseRegistrationIntent | null = null;
  #inverseMainHistoryBaseline: CurrentFootprintInverseMainHistoryBaseline | null = null;
  #inverseMainHistoryCustody: CurrentFootprintInverseMainHistoryCustody | null = null;
  #inverseMainHistoryCollector: CurrentFootprintInverseMainHistoryCollector | null = null;
  #inverseMainHistoryArming = false;
  #inverseMainHistoryResolution: Resolved | null = null;
  #inverseMainHistoryPoint: Readonly<{ id: string; location: z.infer<typeof location> }> | null = null;
  #inverseMainHistoryPause: Readonly<{ identity: Pause; raw: unknown }> | null = null;
  readonly #inverseMainHistoryRows: CurrentFootprintInverseMainHistoryRows[] = [];
  #inverseMainHistoryOrdinal = 0;
  readonly #inverseMainHistorySignals = new Map<number, ReturnType<typeof Promise.withResolvers<CurrentFootprintInverseMainHistoryRows | null>>>();
  #viaMainOrigin: CurrentSelectedProjectMainOrigin | null = null;
  #viaBeginCustody: CurrentPcbViaMainBeginCustody | null = null;
  #viaStructureCustody: CurrentPcbViaMainStructureCustody | null = null;
  #viaStructureExpected: CurrentPcbViaMainStructureExpected | null = null;
  #viaLiveHistoryCustody: CurrentPcbViaMainLiveHistoryCustody | null = null;
  #viaHistoryCustody: CurrentPcbViaMainHistoryCustody | null = null;
  #viaInitialHistoryBaseline: CurrentGeneratedProjectHistorySqlBaseline | null = null;
  #viaMainDeliveredPause: Pause | null = null;
  #viaMainDriverStep: Readonly<{ origin: CurrentSelectedProjectMainOrigin; request: CurrentSelectedFileMainRequestObservation; pause: Pause; expected: Readonly<z.infer<typeof currentFootprintCopyMainRequestPlanSchema>> }> | null = null;
  #viaMainDriverStepConsumed = false;
  #viaMainInvocation: string | null = null;
  #viaMainContextPacket: string | null = null;
  #viaMainContextJoined = false;
  #viaMainControllerPacket: string | null = null;
  #viaMainControllerStep: Readonly<{ origin: CurrentSelectedProjectMainOrigin; pause: Pause; expected: Readonly<z.infer<typeof currentFootprintCopyMainRequestPlanSchema>> }> | null = null;
  #viaMainControllerStepConsumed = false;
  #viaMainDeliveredEvent: unknown = null;
  #viaMainPbFunction: string | null = null;
  #viaMainPbQualified = false;
  readonly #viaMainActorFrames = new Map<"editHead" | "actor", string>();
  #viaMainActorPacket: string | null = null;
  #viaMainActorPromise: string | null = null;
  #viaMainSqlOwner: string | null = null;
  #viaMainSqlPacket: string | null = null;
  #viaMainQueryFunction: string | null = null;
  #viaMainQueryQualified = false;
  #viaMainActorValue: ReturnType<typeof decodeViaValue> | null = null;
  #viaMainContextStep: Readonly<{ origin: CurrentSelectedProjectMainOrigin; pause: Pause; expected: Readonly<z.infer<typeof currentFootprintCopyMainRequestPlanSchema>> }> | null = null;
  #viaMainContextStepConsumed = false;
  readonly #viaMainEvents: CurrentPcbViaMainEvent[] = [];
  readonly #viaMainPoints = new Map<string, z.infer<typeof location>>();
  readonly #viaMainRequestPoints = new Set<string>();
  readonly #viaMainOriginalPoints = new Map<string, z.infer<typeof location>>();
  #viaMainArming: z.infer<typeof location> | null = null;
  #viaMainPoll: Promise<void> | null = null;
  #viaMainReadonlyService: Promise<void> | null = null;
  #viaMainNormal = 0;
  #viaMainCleanup = 0;
  #viaMainGroupReleased = false;
  #viaExpectedBody: Readonly<z.infer<typeof currentFootprintCopyMainRequestPlanSchema>> | null = null;
  readonly #viaMainFrames = new Set<string>();
  #sqlMutationPauses = 0;
  readonly #sqlApprovedConfigurations = new WeakSet<Pause>();
  readonly #sqlConfigurationRecords: Readonly<Record<string, unknown>>[] = [];
  readonly #headAgeBootstrapCapture: boolean;
  readonly #headAgeBootstrapCapability: CurrentFootprintHeadAgeBootstrapCapability | null;
  #headAgeBootstrapScriptId: string | null = null;
  readonly #resolved: Resolved[] = [];
  readonly #replies: unknown[] = [];
  #text = "";
  #attempted = false;
  #busy = false;
  #failed = false;
  #releaseAttempted = false;
  #released = false;
  #normalCloseAttempted = false;
  #started = 0;
  #requests = 0;
  #normalRequests = 0;
  #cleanupRequests = 0;
  #events = 0;
  #received = 0;
  #pendingId: number | null = null;
  #reply: unknown = null;
  #replySeen = false;
  #forwardPoll: ForwardPoll | null = null;
  #breakpoint: string | null = null;
  #removeAttempted = false;
  #removed = false;
  #pause: Pause | null = null;
  #initialContinuationCount: 0 | 1 = 0;
  #registrationSeen = false;
  #savedRegistrationEnrollmentAttempted = false;
  #savedRegistrationEnrollment: ProjectRegistrationEnrollment | null = null;
  readonly #savedRegistrationBreakpoints = new Map<string, SavedRegistrationSite>();
  readonly #savedRegistrationResolutions: Resolved[] = [];
  #savedRegistrationArming: SavedRegistrationSite | null = null;
  #savedRegistrationTracker: string | null = null;
  #savedRegistrationOpenedPause: Pause | null = null;
  #savedRegistrationStage: "unused" | "bound" | "run-consumed" | "upsert-awaited" | "registration-awaited" | "registration-skipped" = "unused";
  #source: QualifiedSource | null = null;
  #appSource: string | null = null;
  #appScriptId: string | null = null;
  #sourceArray: string | null = null;
  #retainedArray: string | null = null;
  #driverCallbackObjectId: string | null = null;
  #packet: CurrentFootprintCopyMainBackendObservation | null = null;
  #phase = "idle";
  #lastFailure: string | null = null;
  #registrationLocationFailure: RegistrationLocationFailure | null = null;
  #metadataRole: MetadataRole | null = null;
  #schemaIssues: readonly SchemaIssue[] | null = null;
  #forwardMainCursor: CurrentFootprintForwardMainCursor | null = null;
  #originAttempted = false;
  #originActive = false;
  #originCapability: MainCapability | null = null;
  #originToken: MainRequestOrigin | null = null;
  #structureAttempted = false;
  #structureActive = false;
  #structureLease: CurrentProjectStructureMainLease | null = null;
  #structureSource: ReturnType<typeof qualifyCurrentProjectStructureMainSource> | null = null;
  #structureNormal = 0;
  #structureCleanup = 0;
  #structureAllocationUncertain = false;
  #structureAllocation: StructureAllocation | null = null;
  #originSource: CurrentFootprintCopyMainRequestSource | null = null;
  readonly #originEvents: CurrentFootprintCopyMainRequestOriginEvent[] = [];
  readonly #originBreakpoints = new Set<string>();
  #originPauseActive = false;
  #originResumeExpected = false;
  #originUncertain = false;
  #originGroupReleased = false;
  #completionAttempted = false;
  #completionBeginAttempted = false;
  #completionActive = false;
  #completionFailed = false;
  #completionToken: MainCompletionOrigin | null = null;
  #completionSource: CurrentFootprintCopyMainCompletionSource | null = null;
  #completionNormal = 0;
  #completionCleanup = 0;
  #completionFinalResumeAttempted = false;
  #completionRetireAttempted = false;
  #completionRetirementAcknowledged = false;
  #headAgePreparationAttempted = false;
  #headAgeArray: string | null = null;
  #headAgeContextSource: CurrentFootprintHeadAgeContextSource | null = null;
  #headAgeAttempted = false;
  /** Retain the fixed transport and optional original-owner bootstrap token.
   * Copied tokens refuse before any inspector request is issued. */
  public constructor(transport: CurrentFootprintCopyMainBackendTransport, headAgeBootstrap?: CurrentFootprintHeadAgeBootstrapCapability, selectedSqlBootstrap?: CurrentSelectedFileMainSqlFenceBootstrap) {
    if (headAgeBootstrap !== undefined) { requireCurrentFootprintHeadAgeBootstrapCapability(headAgeBootstrap, transport); }
    need(headAgeBootstrap === undefined || selectedSqlBootstrap === undefined, "EXCLUSIVE_MAIN_BOOTSTRAP");
    this.#selectedSqlBootstrap = selectedSqlBootstrap ?? null;
    this.#selectedSqlPath = selectedSqlBootstrap === undefined ? null : requireCurrentSelectedFileMainSqlFenceBootstrap(selectedSqlBootstrap, transport);
    this.#headAgeBootstrapCapture = headAgeBootstrap !== undefined; this.#headAgeBootstrapCapability = headAgeBootstrap ?? null;
    this.#methods = methods(transport); this.#transport = transport;
  }
  /** Capture this actual construction's cursor without issuing a request or
   * transferring its native capability. Repeated reads preserve one token. */
  public issueForwardMainCursor(): CurrentFootprintForwardMainCursor {
    need(!this.#busy && this.#packet !== null && issued.get(this.#packet) === this && this.#source !== null &&
      this.#appScriptId !== null && this.#retainedArray !== null, "FORWARD_CURSOR_CONSTRUCTION_REQUIRED");
    if (this.#forwardMainCursor === null) {
      const token = Object.freeze({ profile: "private.current-footprint-forward-main-cursor.v1" as const, executionAuthorized: false as const });
      this.#forwardMainCursor = token;
      forwardMainCursors.set(token, Object.freeze({ runner: this, snapshot: (): CurrentFootprintForwardMainCursorSnapshot => this.#forwardCursorSnapshot(token) }));
    }
    this.#forwardCursorSnapshot(this.#forwardMainCursor); return this.#forwardMainCursor;
  }
  /** Derive each phase from original private transition fields. A retirement
   * attempt, matching JSON or actual generation exit alone cannot claim a
   * successful upload handoff. Historical reads grant no native freshness. */
  #forwardCursorSnapshot(token: CurrentFootprintForwardMainCursor): CurrentFootprintForwardMainCursorSnapshot {
    need(token === this.#forwardMainCursor && this.#packet !== null && issued.get(this.#packet) === this && this.#source !== null &&
      methods(this.#transport).every((value, index) => value === this.#methods[index]), "FORWARD_CURSOR_ORIGINAL");
    requireCurrentFootprintCopyMainBackendSource(this.#source);
    need(this.#requests === this.#normalRequests + this.#cleanupRequests &&
      !(this.#structureAttempted && this.#originAttempted) && (!this.#completionAttempted || this.#originAttempted), "FORWARD_CURSOR_TRANSITION");
    // Admission may retain an exact v2 allocation before its original send.
    // Observed, stopped or detached uncertainty cannot use this in-flight
    // State to revive normal work.
    const pendingForwardAllocation = isCurrentFootprintForwardExecutionMainCapability(this.#originCapability) &&
      this.#structureAllocation !== null && !this.#structureAllocation.stopped && !this.#structureAllocation.seen &&
      this.#pendingId === this.#structureAllocation.id;
    const failed = this.#failed || this.#originUncertain || this.#structureAllocationUncertain && !pendingForwardAllocation || this.#completionFailed;
    const paused = this.#originPauseActive || this.#originResumeExpected || this.#pause !== null && !this.#pause.resumed;
    const settled = this.#completionRetirementAcknowledged && !this.#completionActive && !this.#originActive && !failed &&
      this.#completionNormal === CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_REQUESTS.normal &&
      this.#completionCleanup === CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_REQUESTS.cleanup && this.#originGroupReleased &&
      this.#originBreakpoints.size === 0 && !paused && this.#pendingId === null && this.#originEvents.length === 0 &&
      this.#text === "" && this.#decoderPendingContinuations === 0;
    let phase: CurrentFootprintForwardMainCursorSnapshot["phase"] = "construction";
    if (this.#originAttempted) { phase = this.#completionAttempted ? "completion" : "request"; }
    if (this.#structureAttempted) { phase = "structure"; }
    if (settled) { phase = "upload-settled"; }
    if (this.#released) { phase = "released"; }
    if (failed) { phase = "failed"; }
    return Object.freeze({ issuer: this, construction: this.#packet, phase,
      normalRequests: this.#normalRequests, cleanupRequests: this.#cleanupRequests,
      pendingReplies: this.#pendingId === null ? 0 : 1, pendingEvents: this.#originEvents.length,
      incompleteFrame: this.#text !== "" || this.#decoderPendingContinuations !== 0,
      paused, busy: this.#busy, uploadRetirementAcknowledged: this.#completionRetirementAcknowledged,
      sequentialStructureAdmissionAvailable: false, executionAuthorized: false });
  }
  /** Reprove transport, bootstrap custody, source and the active deadline.
   * Cleanup retains its separate lifetime without reopening normal work. */
  #same(cleanup: boolean): void {
    if (this.#selectedSqlBootstrap !== null) { need(requireCurrentSelectedFileMainSqlFenceBootstrap(this.#selectedSqlBootstrap, this.#transport) === this.#selectedSqlPath, "SELECTED_SQL_ORIGINAL_BOOTSTRAP"); }
    if (this.#headAgeBootstrapCapability !== null) { requireCurrentFootprintHeadAgeBootstrapCapability(this.#headAgeBootstrapCapability, this.#transport); }
    need(methods(this.#transport).every((value, index) => value === this.#methods[index]) && !this.#released &&
      (cleanup || !this.#failed && !this.#releaseAttempted && !this.#normalCloseAttempted), "OWNER");
    if (this.#source !== null) { requireCurrentFootprintCopyMainBackendSource(this.#source); }
    need(this.#started === 0 || performance.now() - this.#started < (cleanup ? PROFILE.totalMilliseconds : PROFILE.normalMilliseconds), "TOTAL_DEADLINE");
  }
  async #current(cleanup = false): Promise<void> { this.#same(cleanup); await this.#transport.assertCurrent(); this.#same(cleanup); }
  #location(actual: z.infer<typeof location>): void {
    const scriptObserved = this.#scripts.has(actual.scriptId);
    const matches = actual.lineNumber === SOURCE.registration.https.lineNumber && actual.columnNumber === SOURCE.registration.https.breakpointColumnNumber && scriptObserved;
    if (!matches) { this.#registrationLocationFailure ??= Object.freeze({ lineNumber: actual.lineNumber, columnNumber: actual.columnNumber, scriptObserved }); }
    need(matches, "REGISTRATION_LOCATION");
  }
  #resolve(record: Resolved): void {
    if (this.#inverseMainHistoryArming || this.#inverseMainHistoryPoint?.id === record.breakpointId) {
      const site = CURRENT_PCB_VIA_MAIN_LIVE_HISTORY_SITE;
      need(record.location.scriptId === this.#appScriptId && record.location.lineNumber === site.lineNumber && record.location.columnNumber === site.columnNumber &&
        (this.#inverseMainHistoryPoint === null || this.#inverseMainHistoryPoint.id === record.breakpointId) && (this.#inverseMainHistoryResolution === null || this.#inverseMainHistoryResolution.breakpointId === record.breakpointId), "INVERSE_HISTORY_RESOLUTION");
      this.#inverseMainHistoryResolution = record; return;
    }
    const savedSite = this.#savedRegistrationBreakpoints.get(record.breakpointId) ?? this.#savedRegistrationArming;
    if (savedSite !== null && savedSite !== undefined) {
      this.#savedRegistrationLocation(savedSite, record.location); need(this.#savedRegistrationResolutions.length < 3, "SAVED_REGISTRATION_RESOLUTION_BOUND");
      this.#savedRegistrationResolutions.push(record); return;
    }
    if (this.#viaMainOrigin !== null && !this.#sqlBreakpoints.has(record.breakpointId)) {
      const expected = this.#viaMainPoints.get(record.breakpointId) ?? this.#viaMainArming;
      need(expected !== null && expected !== undefined && canonicalJson(expected) === canonicalJson(record.location), "VIA_MAIN_BREAKPOINT_RESOLUTION"); return;
    }
    if (this.#selectedSqlBootstrap !== null && record.breakpointId !== REGISTRATION_ID) {
      const site = this.#sqlBreakpoints.get(record.breakpointId) ?? this.#sqlArming;
      need(site !== null && site !== undefined, "SELECTED_SQL_FOREIGN_BREAKPOINT"); this.#sqlLocation(site, record.location);
      need(this.#sqlResolutions.length < 64, "SELECTED_SQL_RESOLUTION_BOUND"); this.#sqlResolutions.push(record); return;
    }
    need(this.#resolved.length < 8, "RESOLUTION_BOUND"); this.#resolved.push(record);
    if (this.#breakpoint !== null) { need(record.breakpointId === this.#breakpoint, "FOREIGN_BREAKPOINT"); this.#location(record.location); }
  }
  /** Account for bounded original inspector events and exact source locations.
   * Only the owner-issued head-age token admits the passive Node bootstrap. */
  #event(method: string, input: unknown): void {
    if (this.#headAgeBootstrapCapability !== null) { requireCurrentFootprintHeadAgeBootstrapCapability(this.#headAgeBootstrapCapability, this.#transport); }
    this.#events += 1; need(this.#events <= 4096, "EVENT_BOUND");
    if (this.#viaMainOrigin !== null && (method === "Debugger.paused" || method === "Debugger.resumed")) {
      need(this.#viaMainEvents.length < 64, "VIA_MAIN_EVENT_BOUND");
      if (method === "Debugger.paused") {
        need(this.#pause === null || this.#pause.resumed, "VIA_MAIN_OVERLAPPING_PAUSE");
        const event = pauseSchema.parse(input), first = event.callFrames[0]; need(first !== undefined && event.reason === "other" && event.hitBreakpoints?.length === 1, "VIA_MAIN_PAUSE");
        const id = event.hitBreakpoints[0]; need(id !== undefined, "VIA_MAIN_POINT"); const sqlSite = this.#sqlBreakpoints.get(id);
        const expected = sqlSite === undefined ? this.#viaMainPoints.get(id) : null;
        if (sqlSite === undefined) { need(expected !== undefined && expected !== null && canonicalJson(expected) === canonicalJson(first.location), "VIA_MAIN_FOREIGN_PAUSE"); }
        else { this.#sqlLocation(sqlSite, first.location); }
        this.#pause = { frameId: first.callFrameId, location: first.location, registration: false, ...(sqlSite === undefined ? {} : { sqlSite }), resumeAttempted: false, resumed: false };
        this.#viaMainFrames.clear(); for (const call of event.callFrames) { this.#viaMainFrames.add(call.callFrameId); }
        if (sqlSite !== undefined) { this.#sqlHeld = this.#pause; }
      } else { empty.parse(input); need(this.#pause?.resumeAttempted === true && !this.#pause.resumed, "VIA_MAIN_UNRESERVED_RESUME"); this.#pause.resumed = true; }
      this.#viaMainEvents.push(Object.freeze({ method, params: freezeDeep(input) })); return;
    }
    if ((this.#originActive || this.#structureActive) && (method === "Debugger.paused" || method === "Debugger.resumed")) {
      need(this.#originEvents.length < 64, "REQUEST_EVENT_BOUND");
      if (method === "Debugger.paused") { if (this.#originPauseActive) { this.#originUncertain = true; } this.#originPauseActive = true; }
      else { empty.parse(input); if (!this.#originPauseActive || !this.#originResumeExpected) { this.#originUncertain = true; }
        this.#originPauseActive = false; this.#originResumeExpected = false; }
      this.#originEvents.push(Object.freeze({ method, params: freezeDeep(input) })); return;
    }
    if (method === "Debugger.scriptParsed") {
      if (this.#headAgeBootstrapCapture) {
        const bootstrap = z.looseObject({ scriptId: handle, url: z.literal("node:internal/bootstrap/node"), executionContextId: z.number().int().nonnegative(),
          startLine: z.literal(0), startColumn: z.literal(0), endLine: z.literal(479), endColumn: z.literal(0), length: z.literal(15_939),
          isLiveEdit: z.literal(false), hasSourceURL: z.literal(false), isModule: z.literal(false), scriptLanguage: z.literal("JavaScript"),
          embedderName: z.literal("node:internal/bootstrap/node") }).safeParse(input);
        if (bootstrap.success) {
          need(this.#headAgeBootstrapScriptId === null, "HEAD_AGE_BOOTSTRAP_CHANGED"); this.#headAgeBootstrapScriptId = bootstrap.data.scriptId; return;
        }
      }
      const script = z.looseObject({ scriptId: handle, url: z.string().max(4096), executionContextId: z.number().int().positive() }).parse(input);
      if (this.#selectedSqlBootstrap !== null && script.url === FETCH_SOURCE.url) {
        const builtin = z.looseObject({ scriptId: handle, url: z.literal(FETCH_SOURCE.url), executionContextId: z.number().int().positive(),
          startLine: z.literal(0), startColumn: z.literal(0), endLine: z.literal(17_434), endColumn: z.literal(0), length: z.literal(745_782),
          isLiveEdit: z.literal(false), hasSourceURL: z.literal(false), isModule: z.literal(false), scriptLanguage: z.literal("JavaScript") }).parse(input);
        need(this.#selectedFetchScript === null, "SELECTED_FETCH_SCRIPT_REPLACED"); this.#selectedFetchScript = Object.freeze({ scriptId: builtin.scriptId, executionContextId: builtin.executionContextId });
      }
      if (new RegExp(URL_PATTERN, "u").test(script.url)) { need(!this.#scripts.has(script.scriptId) && this.#scripts.size === 0, "APP_SCRIPT_CHANGED"); this.#scripts.set(script.scriptId, script.executionContextId); }
      return;
    }
    if (method === "Runtime.executionContextCreated") { z.looseObject({ context: z.looseObject({ id: z.number().int().positive() }) }).parse(input); return; }
    if (method === "Runtime.consoleAPICalled") {
      z.looseObject({ type: z.enum(["log", "debug", "info", "error", "warning", "dir", "dirxml", "table", "trace", "clear", "startGroup", "startGroupCollapsed", "endGroup", "assert", "profile", "profileEnd", "count", "timeEnd"]),
        args: z.array(z.unknown()).max(64), executionContextId: z.number().int().positive() }).parse(input); return;
    }
    if (method === "Debugger.breakpointResolved") { this.#resolve(z.object({ breakpointId: z.string().min(1).max(512), location }).strict().parse(input)); return; }
    if (method === "Debugger.paused") {
      need(this.#pause === null || this.#pause.resumed, "DUPLICATE_PAUSE"); const event = pauseSchema.parse(input), first = event.callFrames[0]; need(first !== undefined, "PAUSE_FRAME");
      const points = event.hitBreakpoints ?? [], sqlSite = points.length === 1 ? this.#sqlBreakpoints.get(points[0] ?? "") : undefined;
      if (points.length === 1 && points[0] === this.#inverseMainHistoryPoint?.id) {
        const site = CURRENT_PCB_VIA_MAIN_LIVE_HISTORY_SITE;
        need(event.reason === "other" && first.location.scriptId === this.#appScriptId && first.location.lineNumber === site.lineNumber && first.location.columnNumber === site.columnNumber && this.#inverseMainHistoryPause === null, "INVERSE_HISTORY_ORIGINAL_PAUSE");
        const pause: Pause = { frameId: first.callFrameId, location: first.location, registration: false, resumeAttempted: false, resumed: false };
        this.#pause = pause; this.#inverseMainHistoryPause = Object.freeze({ identity: pause, raw: input }); return;
      }
      const savedRegistrationSite = points.length === 1 ? this.#savedRegistrationBreakpoints.get(points[0] ?? "") : undefined;
      if (savedRegistrationSite !== undefined) {
        need(this.#savedRegistrationEnrollment !== null && event.reason === "other", "SAVED_REGISTRATION_ORIGINAL_PAUSE");
        this.#savedRegistrationLocation(savedRegistrationSite, first.location);
        this.#pause = { frameId: first.callFrameId, location: first.location, registration: false, savedRegistrationSite, resumeAttempted: false, resumed: false }; return;
      }
      if (sqlSite !== undefined) {
        need(this.#selectedSqlBootstrap !== null && event.reason === "other", "SELECTED_SQL_PAUSE"); this.#sqlLocation(sqlSite, first.location);
        this.#pause = { frameId: first.callFrameId, location: first.location, registration: false, sqlSite, resumeAttempted: false, resumed: false }; return;
      }
      const registration = points.length === 1;
      if (registration) {
        need(this.#breakpoint !== null && points[0] === this.#breakpoint && !this.#registrationSeen && event.reason === "other", "REGISTRATION_PAUSE");
        this.#location(first.location); this.#registrationSeen = true;
      } else { need(event.reason === "Break on start" && this.#initialContinuationCount === 0 && !this.#registrationSeen && this.#pause === null && this.#breakpoint !== null, "INITIAL_PAUSE"); }
      this.#pause = { frameId: first.callFrameId, location: first.location, registration, resumeAttempted: false, resumed: false }; return;
    }
    if (method === "Debugger.resumed") { empty.parse(input); need(this.#pause !== null && this.#pause.resumeAttempted && !this.#pause.resumed, "UNEXPECTED_RESUME"); this.#pause.resumed = true; return; }
    // Preserve the original process on exceptions, context replacement and
    // Unknown events. They never cause a retry or another resume.
    need(false, "UNEXPECTED_EVENT");
  }
  #message(text: string): void {
    const value: unknown = JSON.parse(text);
    const response = z.object({ id: z.number().int().positive(), result: z.unknown().optional(), error: z.unknown().optional() }).strict().safeParse(value);
    if (response.success) {
      need(this.#pendingId !== null && response.data.id === this.#pendingId && !this.#replySeen && !Object.hasOwn(response.data, "error") && Object.hasOwn(response.data, "result"), "REPLY_ID_OR_ERROR");
      this.#reply = response.data.result; this.#replySeen = true; this.#replies.push(response.data.result);
      const allocation = this.#structureAllocation;
      if (allocation !== null && allocation.id === response.data.id) {
        allocation.seen = true; allocation.retain(response.data.result);
        if (allocation.stopped) { this.#settleStructureAllocation(allocation); }
      }
      return;
    }
    const event = z.object({ method: z.string().max(128), params: z.unknown() }).strict().parse(value); this.#event(event.method, event.params);
  }
  async #pump(cleanup = false): Promise<void> {
    if (this.#viaMainOrigin === null) { await this.#pumpOriginal(cleanup); return; }
    if (this.#viaMainPoll !== null) { await this.#viaMainPoll; return; }
    const pending = this.#pumpOriginal(cleanup); this.#viaMainPoll = pending;
    try { await pending; } finally { if (this.#viaMainPoll === pending) { this.#viaMainPoll = null; } }
  }
  async #pumpOriginal(cleanup: boolean): Promise<void> {
    await this.#current(cleanup);
    if (this.#structureAllocation !== null) {
      if (isCurrentFootprintForwardExecutionMainCapability(this.#originCapability)) {
        await this.#pumpForwardAllocation(this.#originCapability, this.#structureAllocation, cleanup); return;
      }
      // Only original allocation replies gain custody before the post-poll
      // Guard. Late settlement never restores normal work or clears other
      // Pause/channel uncertainty, and no replacement request is dispatched.
      const raw = await this.#transport.poll(cleanup).then(chunk => {
        try { this.#chunk(chunk); return chunk; } catch (error) { this.#originUncertain = true; throw error; }
      }, (error: unknown) => { this.#originUncertain = true; throw error; });
      await this.#current(cleanup); if (raw === "") { await delay(10); } return;
    }
    const raw = isCurrentFootprintForwardExecutionMainCapability(this.#originCapability) ?
      await pollCurrentFootprintForwardExecutionMain(this.#originCapability, this, cleanup) : await this.#transport.poll(cleanup);
    if (this.#viaMainOrigin !== null) { this.#chunk(raw); await this.#current(cleanup); if (raw === "") { await delay(10); } return; }
    await this.#current(cleanup); this.#chunk(raw); if (raw === "") { await delay(10); }
  }
  /** Register only this pending allocation's original byte receiver. A lost
   * native poll retains its callback until the actual late reply; another poll
   * cannot replace that custody. Native accounting still runs independently. */
  async #pumpForwardAllocation(capability: CurrentFootprintForwardExecutionMainCapability, allocation: StructureAllocation, cleanup: boolean): Promise<void> {
    const previous = this.#forwardPoll;
    need(previous === null || previous.settled && previous.delivered, "FORWARD_ORIGINAL_POLL_PENDING");
    const poll: ForwardPoll = { allocation, delivered: false, settled: false, chunk: null,
      retain: (chunk: string): void => {
        requireOriginalCurrentFootprintForwardMainPollRetainer(this, poll.retain);
        poll.delivered = true; poll.chunk = chunk;
        try { this.#chunk(chunk); }
        catch (error) { this.#originUncertain = true; throw error; }
      } };
    this.#forwardPoll = poll;
    forwardPollRetainers.set(poll.retain, Object.freeze({ runner: this, requireOriginal: (): void => {
      need(this.#forwardPoll === poll && !poll.delivered && this.#structureAllocation === allocation && this.#pendingId === allocation.id,
        "FORWARD_ORIGINAL_POLL_RETAINER");
    } }));
    try {
      const raw = await pollCurrentFootprintForwardExecutionMain(capability, this, cleanup, poll.retain);
      need(poll.delivered && poll.chunk === raw, "FORWARD_ORIGINAL_POLL_REPLY");
      await this.#current(cleanup); if (raw === "") { await delay(10); }
    } catch (error) { this.#originUncertain = true; throw error; }
    finally { poll.settled = true; }
  }
  /** Decode only original bounded transport chunks. The allocation path uses
   * this same parser and pending ID instead of accepting caller transcripts. */
  #chunk(raw: string): void {
    need(typeof raw === "string" && raw.length <= 43_692 && /^(?:[A-Za-z\d+/]{4})*(?:[A-Za-z\d+/]{2}==|[A-Za-z\d+/]{3}=)?$/u.test(raw), "CHUNK_GRAMMAR");
    if (raw === "") { return; }
    const bytes = Buffer.from(raw, "base64"); need(bytes.length <= 32_768 && bytes.toString("base64") === raw, "CHUNK_BOUND");
    this.#received += bytes.length; need(this.#received <= 64 * 1024 * 1024, "RECEIVED_BOUND");
    const text = this.#decoder.decode(bytes, { stream: true }); this.#trackDecoderBoundary(bytes); this.#text += text;
    let boundary = this.#text.indexOf("\0");
    while (boundary !== -1) { const message = this.#text.slice(0, boundary); need(message.length > 0 && Buffer.byteLength(message) <= 4 * 1024 * 1024, "MESSAGE_BOUND"); this.#text = this.#text.slice(boundary + 1); this.#message(message); boundary = this.#text.indexOf("\0"); }
    need(Buffer.byteLength(this.#text) <= 4 * 1024 * 1024, "PARTIAL_MESSAGE_BOUND");
  }
  /** The original fatal decoder validates bytes first. Count its remaining
   * continuation bytes without flushing or replacing that streaming decoder;
   * an empty text buffer alone cannot prove a complete inspector frame. */
  #trackDecoderBoundary(bytes: Buffer): void {
    for (const byte of bytes) {
      if (this.#decoderPendingContinuations !== 0) { this.#decoderPendingContinuations -= 1; }
      else if (byte >= 0xF0) { this.#decoderPendingContinuations = 3; }
      else if (byte >= 0xE0) { this.#decoderPendingContinuations = 2; }
      else if (byte >= 0xC2) { this.#decoderPendingContinuations = 1; }
    }
  }
  /** A stopped original request may retire its reply slot only after that
   * exact response was captured. This does not acknowledge native cleanup. */
  #settleStructureAllocation(allocation: StructureAllocation): void {
    need(this.#structureAllocation === allocation && allocation.seen && this.#pendingId === allocation.id, "STRUCTURE_ALLOCATION_PENDING");
    this.#pendingId = null; this.#reply = null; this.#replySeen = false; this.#structureAllocation = null;
  }
  async #wait(predicate: () => boolean, cleanup = false): Promise<void> {
    const started = performance.now(); while (!predicate()) { need(performance.now() - started < 20_000, "REPLY_DEADLINE"); await this.#pump(cleanup); }
  }
  /** Consume one fixed request number and retain its sole pending reply.
   * Head-age exceptions are captured before success decoding; cleanup keeps
   * its own counter and cannot repeat a consumed normal request. */
  async #request(input: Command | CurrentSelectedFileMainSqlFenceCommand | CurrentFootprintCopyMainRequestCollectCommand | CurrentFootprintCopyMainCompletionCommand | CurrentProjectStructureMainCommand | CurrentPcbViaMainCommand | CurrentPcbViaMainStepCommand | CurrentPcbViaMainBeginCommand | CurrentPcbViaMainHistoryCommand | CurrentPcbViaMainStructureCommand | CurrentPcbViaMainLiveHistoryCommand | CurrentFootprintInverseMainHistoryCommand,
    cleanup = false, retainAllocationReply?: (reply: unknown) => void): Promise<unknown> {
    this.#phase = input.phase; await this.#current(cleanup);
    if (this.#viaMainOrigin !== null && this.#viaMainPoll !== null) { await this.#viaMainPoll; await this.#current(cleanup); }
    const inverseHistory = input.phase.startsWith("inverse-main-history-");
    const via = input.phase.startsWith("via-main-");
    const sqlFence = input.phase.startsWith("sql-fence-");
    const collection = input.phase.startsWith("request-");
    const completion = input.phase.startsWith("completion-");
    const structure = input.phase.startsWith("structure-main-");
    const forwardAllocation = isCurrentFootprintForwardExecutionMainCapability(this.#originCapability) &&
      (collection && (input.phase === "request-driver-arm" || input.phase === "request-site-arm") ||
        completion && (input.phase === "completion-source-arm" || input.phase === "completion-callback-arm"));
    need(retainAllocationReply === undefined || !cleanup && (structure && input.phase === "structure-main-arm" || forwardAllocation), "STRUCTURE_ALLOCATION_CALLBACK");
    let cleanupCommand: boolean;
    if (via || inverseHistory) { cleanupCommand = cleanup; }
    else if (completion || structure) { cleanupCommand = ["Debugger.resume", "Debugger.removeBreakpoint", "Runtime.releaseObjectGroup"].includes(input.method); }
    else if (collection) { cleanupCommand = (CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_CLEANUP_PHASES as readonly string[]).includes(input.phase); }
    else { cleanupCommand = !sqlFence && ["resume", "remove", "release"].includes(input.phase); }
    const normalMaximum = this.#structureAttempted ? CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_REQUESTS.observeNormal + CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_REQUESTS.originIssueNormal + CURRENT_PROJECT_STRUCTURE_MAIN_REQUESTS.normal : CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_REQUESTS.observeNormal + CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_REQUESTS.originIssueNormal + CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_REQUESTS.normal +
      (this.#completionToken === null ? 0 : CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_REQUESTS.normal);
    const cleanupMaximum = this.#structureAttempted ? CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_REQUESTS.observeCleanup + CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_REQUESTS.releaseCleanup + CURRENT_PROJECT_STRUCTURE_MAIN_REQUESTS.cleanup : CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_REQUESTS.observeCleanup + CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_REQUESTS.releaseCleanup + CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_REQUESTS.cleanup +
      (this.#completionToken === null ? 0 : CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_REQUESTS.cleanup - 2);
    const initialMaximum = this.#selectedSqlBootstrap === null ? 64 : 72 + SQL_REQUESTS.normal + (this.#savedRegistrationEnrollment === null ? 0 : SAVED_CONFIG_REQUESTS);
    const requestMaximum = cleanup && this.#selectedSqlBootstrap === null ? 72 : initialMaximum + (this.#inverseMainHistoryIntent === null ? 0 : INVERSE_HISTORY.repetitions * INVERSE_HISTORY.total);
    let withinBound: boolean;
    if (inverseHistory) { withinBound = this.#selectedSqlBootstrap !== null && this.#inverseMainHistoryIntent !== null && this.#requests < initialMaximum + INVERSE_HISTORY.repetitions * INVERSE_HISTORY.total; }
    else if (via) { withinBound = this.#selectedSqlBootstrap !== null && this.#viaMainOrigin !== null && this.#requests < initialMaximum + VIA_REQUESTS.total + VIA_STEPS.total + VIA_BEGIN.total + VIA_HISTORY.total + VIA_STRUCTURE.total + VIA_LIVE_HISTORY.total; }
    else if (this.#originAttempted || this.#structureAttempted) { withinBound = this.#requests < normalMaximum + cleanupMaximum && (cleanupCommand ? this.#cleanupRequests < cleanupMaximum : this.#normalRequests < normalMaximum); }
    else { withinBound = this.#requests < requestMaximum; }
    need(this.#pendingId === null && withinBound, "REQUEST_BOUND");
    this.#requests += 1; if (cleanupCommand) { this.#cleanupRequests += 1; } else { this.#normalRequests += 1; }
    const id = this.#requests; this.#pendingId = id; this.#replySeen = false; this.#reply = null;
    const allocation = retainAllocationReply === undefined ? null : { id, retain: retainAllocationReply, seen: false, stopped: false };
    if (allocation !== null) { need(this.#structureAllocation === null, "STRUCTURE_ALLOCATION_PENDING"); this.#structureAllocation = allocation; }
    try {
    if (inverseHistory) {
      need(this.#selectedSqlBootstrap !== null && this.#inverseMainHistoryIntent !== null, "INVERSE_HISTORY_ORIGINAL_BOOTSTRAP");
      await sendOriginalCurrentFootprintInverseMainHistory(this.#selectedSqlBootstrap, this, validateCurrentFootprintInverseMainHistoryCommand(input), id);
    } else if (via) {
      need(this.#selectedSqlBootstrap !== null && this.#viaMainOrigin !== null, "VIA_MAIN_ORIGINAL_BOOTSTRAP");
      if (this.#viaMainOrigin.profile === "private.current-schematic-relevance-display-save-main-origin.v1") { await this.#sendRelevanceMain(input, id); }
      else if (input.phase.startsWith("via-main-structure-")) { const command = validateCurrentPcbViaMainStructureCommand(input), window = await sendOriginalCurrentPcbViaMainStructure(this.#selectedSqlBootstrap, this, command, id);
        if (command.phase === "via-main-structure-step") { need(this.#viaStructureCustody !== null, "VIA_STRUCTURE_ORIGINAL_CUSTODY"); this.#viaStructureCustody.acknowledge(command, id, window); }
      }
      else if (input.phase.startsWith("via-main-live-")) { await sendOriginalCurrentPcbViaMainLiveHistory(this.#selectedSqlBootstrap, this, validateCurrentPcbViaMainLiveHistoryCommand(input), id); }
      else if (input.phase.startsWith("via-main-history-")) { const command = validateCurrentPcbViaMainHistoryCommand(input), window = await sendOriginalCurrentPcbViaMainHistory(this.#selectedSqlBootstrap, this, command, id);
        if (command.phase === "via-main-history-step") { need(this.#viaHistoryCustody !== null, "VIA_HISTORY_ORIGINAL_CUSTODY"); this.#viaHistoryCustody.acknowledge(command, id, window); }
      }
      else if (input.phase.startsWith("via-main-begin-")) { await sendOriginalCurrentPcbViaMainBegin(this.#selectedSqlBootstrap, this, validateCurrentPcbViaMainBeginCommand(input), id); }
      else { await ((input.phase === "via-main-driver-step" || input.phase === "via-main-context-step" || input.phase === "via-main-controller-step") ? sendOriginalCurrentPcbViaMainStep(this.#selectedSqlBootstrap, this, validateCurrentPcbViaMainStepCommand(input), id) :
        sendOriginalCurrentPcbViaMainCommand(this.#selectedSqlBootstrap, this, validateCurrentPcbViaMainCommand(input), id)); }
    } else if (sqlFence) {
      need(this.#selectedSqlBootstrap !== null, "SELECTED_SQL_ORIGINAL_BOOTSTRAP");
      await sendCurrentSelectedFileMainSqlFenceCommand(this.#selectedSqlBootstrap, this, validateCurrentSelectedFileMainSqlFenceCommand(input), id);
    } else if (structure) {
      need(this.#originCapability !== null && this.#structureActive, "STRUCTURE_ORIGINAL_LEASE_REQUIRED");
      // The same native owner still rejects this new vocabulary. No native
      // Purpose, encoder or capacity is enabled by this source-only route.
      await mainCommand(this.#originCapability, this, validateCurrentProjectStructureMainCommand(input), id);
    } else if (completion) {
      need(this.#originCapability !== null && this.#completionActive, "COMPLETION_ORIGINAL_LEASE_REQUIRED");
      await mainCompletionCommand(this.#originCapability, this, validateCurrentFootprintCopyMainCompletionCommand(input), id);
    } else if (collection) {
      need(this.#originCapability !== null && this.#originActive, "REQUEST_ORIGINAL_LEASE_REQUIRED");
      await mainCommand(this.#originCapability, this, validateCurrentFootprintCopyMainRequestCollectCommand(input), id);
    } else { await this.#transport.send(validateCurrentFootprintCopyMainBackendCommand(input), id); }
    await this.#current(cleanup); await this.#wait(() => this.#replySeen, cleanup);
    const result = this.#reply;
    if (allocation === null) { this.#pendingId = null; this.#reply = null; this.#replySeen = false; }
    else { this.#settleStructureAllocation(allocation); }
    if (isCurrentFootprintHeadAgeCdpPhase(input.phase)) { rejectCurrentFootprintHeadAgeCdpException(result, input.phase); }
    return result;
    } catch (error) {
      if (allocation !== null && this.#structureAllocation === allocation) {
        allocation.stopped = true; if (allocation.seen) { this.#settleStructureAllocation(allocation); }
      }
      throw error;
    }
  }
  #properties(objectId: string, role: MetadataRole): Promise<unknown> {
    this.#metadataRole = role;
    return this.#request({ phase: "properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } });
  }
  async #qualify(scriptId: string): Promise<void> {
    if (this.#source !== null) { need(this.#appScriptId === scriptId, "SOURCE_CHANGED"); return; }
    need(this.#scripts.has(scriptId), "APP_SCRIPT_REQUIRED");
    const reply = captureCurrentFootprintCopyMainBackendSourceReply(await this.#request({ phase: "source", method: "Debugger.getScriptSource", params: { scriptId } }));
    this.#source = qualifyCurrentFootprintCopyMainBackendSource(reply.scriptSource); this.#appScriptId = scriptId; this.#appSource = reply.scriptSource;
  }
  async #resume(pause: Pause): Promise<void> {
    need(this.#pause === pause && !pause.resumeAttempted && !pause.resumed && this.#breakpoint !== null, "RESUME_CONSUMED");
    pause.resumeAttempted = true;
    empty.parse(await this.#request({ phase: "resume", method: "Debugger.resume", params: {} })); await this.#wait(() => pause.resumed);
  }
  async #remove(cleanup = false): Promise<void> {
    need(this.#breakpoint !== null && !this.#removeAttempted, "REMOVE_CONSUMED"); this.#removeAttempted = true;
    empty.parse(await this.#request({ phase: "remove", method: "Debugger.removeBreakpoint", params: { breakpointId: this.#breakpoint } }, cleanup)); this.#removed = true;
  }
  #fail(error: unknown): void {
    this.#failed = true; this.failFootprintInverseInitialHistory();
    if (this.#lastFailure !== null) { return; }
    if (error instanceof z.ZodError) { this.#lastFailure = "REPLY_SCHEMA"; this.#schemaIssues = schemaIssues(error); }
    else { this.#lastFailure = error instanceof Error ? issuedFailures.get(error) ?? "ORIGINAL_TRANSPORT_OR_CAPTURE" : "ORIGINAL_TRANSPORT_OR_CAPTURE"; }
  }
  public async observe(): Promise<CurrentFootprintCopyMainBackendObservation> {
    need(!this.#attempted && !this.#busy, "OBSERVE_CONSUMED"); this.#attempted = true; this.#busy = true; this.#started = performance.now();
    try {
      empty.parse(await this.#request({ phase: "runtime-enable", method: "Runtime.enable", params: {} }));
      z.object({ debuggerId: handle }).strict().parse(await this.#request({ phase: "debugger-enable", method: "Debugger.enable", params: { maxScriptsCacheSize: 33_554_432 } }));
      if (this.#selectedSqlBootstrap !== null) { await this.#armSelectedSqlEarly(); }
      const armed = z.object({ breakpointId: registrationId, locations: z.array(location).max(1) }).strict().parse(await this.#request({ phase: "registration-arm", method: "Debugger.setBreakpointByUrl", params: {
        urlRegex: URL_PATTERN, lineNumber: SOURCE.registration.https.lineNumber, columnNumber: SOURCE.registration.https.breakpointColumnNumber } }));
      this.#breakpoint = armed.breakpointId;
      for (const record of this.#resolved) { need(record.breakpointId === armed.breakpointId, "FOREIGN_BREAKPOINT"); this.#location(record.location); }
      for (const actual of armed.locations) { this.#location(actual); }
      empty.parse(await this.#request({ phase: "run-waiting", method: "Runtime.runIfWaitingForDebugger", params: {} }));
      await this.#wait(() => this.#pause !== null); const first = this.#pause; need(first !== null, "INITIAL_PAUSE_REQUIRED");
      if (!first.registration && first.sqlSite === undefined) {
        if (this.#scripts.has(first.location.scriptId)) { await this.#qualify(first.location.scriptId); }
        this.#initialContinuationCount = 1; await this.#resume(first); await this.#wait(() => this.#pause !== first);
      }
      if (this.#selectedSqlBootstrap !== null) { await this.#startSelectedSqlFence(); }
      const registration = this.#pause; need(registration !== null && registration.registration && !registration.resumeAttempted, "REGISTRATION_REQUIRED");
      await this.#qualify(registration.location.scriptId);
      need(this.#resolved.some(record => record.breakpointId === this.#breakpoint && record.location.scriptId === registration.location.scriptId &&
        record.location.lineNumber === registration.location.lineNumber && record.location.columnNumber === registration.location.columnNumber) || armed.locations.some(actual => actual.scriptId === registration.location.scriptId), "REGISTRATION_RESOLUTION_REQUIRED");
      const selected = objectReply.parse(await this.#request({ phase: "frame", method: "Debugger.evaluateOnCallFrame", params: { callFrameId: registration.frameId,
        expression: EXPRESSION, objectGroup: GROUP, silent: true, returnByValue: false, generatePreview: false, throwOnSideEffect: true, includeCommandLineAPI: false } }));
      need(selected.result.description === "Array(9)", "FRAME_ARRAY"); this.#sourceArray = selected.result.objectId;
      const captured = objectReply.parse(await this.#request({ phase: "capture", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: this.#sourceArray,
        functionDeclaration: CALLS.capture.program, arguments: [], returnByValue: false } }));
      need(captured.result.description === "Array(13)", "CAPTURE_ARRAY"); this.#retainedArray = captured.result.objectId;
      const ids = decodeCurrentFootprintCopyMainBackendArray(await this.#properties(this.#retainedArray, "retained-array"));
      for (const [index, role] of [[10, "Date"], [11, "now"]] as const) {
        const id = ids[index]; need(id !== undefined, "NATIVE_MEMBER_REQUIRED"); decodeCurrentFootprintCopyMainBackendNative(await this.#properties(id, role), role);
      }
      for (const [index, role] of [[3, "protocolCallback"], [5, "driverIntercept"], [6, "driverCallback"], [7, "router"], [8, "actorClock"], [9, "projectSql"], [12, "dateParser"]] as readonly (readonly [number, Role])[]) {
        const id = ids[index]; need(id !== undefined && this.#appScriptId !== null, "MEMBER_REQUIRED"); decodeCurrentFootprintCopyMainBackendFunction(await this.#properties(id, role), role, this.#appScriptId);
      }
      this.#metadataRole = null;
      this.#driverCallbackObjectId = ids[6] ?? null;
      await this.#reprove();
      if (this.#selectedSqlBootstrap !== null) { await prepareOriginalCurrentSelectedFileStartupActors(this.#selectedSqlBootstrap, this); await this.#current(); }
      await this.#remove(); await this.#resume(registration); await this.#current();
      this.#packet = Object.freeze(currentFootprintCopyMainBackendObservationSchema.parse({ profile: "private.current-footprint-copy-main-backend-construction.v1",
        originalMainTransportRetained: true, runtimeAppSourceQualified: true, runtimeAppSourceSha256: SOURCE.sha256, initialContinuationCount: this.#initialContinuationCount,
        registrationBreakpointArmedBeforeInitialContinuation: true, actualRegistrationLocationVerified: true, originalProtocolCallbackAndBackendRetained: true,
        originalDriverCallbackAndRouterRetained: true, originalActorClockAndSqlFunctionsRetained: true, originalNativeDateNowRetained: true, originalDateParserRetained: true,
        protocolRegistrationObserved: false, requestContextRetained: false, actualActorClockInvocationObserved: false, projectSqlInvocationObserved: false,
        responderExclusivityProven: false, executionAuthorized: false })); issued.set(this.#packet, this); return this.#packet;
    } catch (error) { this.#fail(error); throw error; } finally { this.#busy = false; }
  }
  public requireOriginalStartupActorPause(capability: CurrentSelectedFileMainSqlFenceBootstrap): void {
    this.#same(false); need(this.#selectedSqlBootstrap === capability && this.#busy && this.#sqlReady && this.#source !== null && this.#appSource !== null &&
      this.#retainedArray !== null && this.#sourceArray !== null && this.#packet === null && this.#metadataRole === null &&
      this.#pause?.registration === true && !this.#pause.resumeAttempted && !this.#pause.resumed && !this.#removeAttempted,
    "SAVED_READBACK_EARLY_ACTOR_STARTUP_PAUSE");
  }
  #sqlLocation(site: CurrentSelectedFileMainSqlFenceSite, actual: z.infer<typeof location>): void {
    const expected = SQL_SOURCE.sites[site]; need(this.#scripts.has(actual.scriptId) && actual.lineNumber === expected.lineNumber &&
      actual.columnNumber === expected.breakpointColumnNumber && (this.#appScriptId === null || actual.scriptId === this.#appScriptId), "SELECTED_SQL_LOCATION");
  }
  async #armSelectedSqlEarly(): Promise<void> {
    need(this.#selectedSqlBootstrap !== null && this.#sqlBreakpoints.size === 0, "SELECTED_SQL_EARLY_CONSUMED"); this.#sqlArming = "import";
    const reply = z.object({ breakpointId: z.literal(SQL_EARLY_ID), locations: z.array(location).max(1) }).strict().parse(await this.#request({ phase: "sql-fence-early-arm", method: "Debugger.setBreakpointByUrl", params: {
      urlRegex: URL_PATTERN, lineNumber: SQL_SOURCE.sites.import.lineNumber, columnNumber: SQL_SOURCE.sites.import.breakpointColumnNumber } }));
    this.#sqlBreakpoints.set(reply.breakpointId, "import"); for (const actual of reply.locations) { this.#sqlLocation("import", actual); }
    this.#sqlArming = null;
  }
  async #armSelectedSql(site: Exclude<CurrentSelectedFileMainSqlFenceSite, "import">): Promise<void> {
    need(this.#selectedSqlBootstrap !== null && this.#appScriptId !== null, "SELECTED_SQL_SOURCE_REQUIRED"); this.#sqlArming = site;
    const point = SQL_SOURCE.sites[site];
    const actualLocation = { scriptId: this.#appScriptId, lineNumber: point.lineNumber, columnNumber: point.breakpointColumnNumber };
    const command: CurrentSelectedFileMainSqlFenceCommand = site === "afterImports" ? { phase: "sql-fence-after-imports-arm", method: "Debugger.setBreakpoint", params: { location: { scriptId: this.#appScriptId, lineNumber: SQL_SOURCE.sites.afterImports.lineNumber, columnNumber: SQL_SOURCE.sites.afterImports.breakpointColumnNumber } } } :
      { phase: "sql-fence-arm", site, method: "Debugger.setBreakpoint", params: { location: actualLocation, condition: SQL_CONDITIONS[site] } };
    const reply = z.object({ breakpointId: handle, actualLocation: location }).strict().parse(await this.#request(command));
    need(!this.#sqlBreakpoints.has(reply.breakpointId), "SELECTED_SQL_BREAKPOINT_REUSED"); this.#sqlLocation(site, reply.actualLocation);
    for (const record of this.#sqlResolutions.filter(item => item.breakpointId === reply.breakpointId)) { this.#sqlLocation(site, record.location); }
    this.#sqlBreakpoints.set(reply.breakpointId, site); this.#sqlArming = null;
  }
  async #sqlResume(pause: Pause): Promise<void> {
    need(this.#selectedSqlBootstrap !== null && this.#pause === pause && (pause.sqlSite === "import" || pause.sqlSite === "afterImports" || this.#sqlApprovedConfigurations.has(pause) || this.#sqlApprovedReadRequests.has(pause)) &&
      !pause.resumeAttempted && !pause.resumed, "SELECTED_SQL_NO_MUTATION_GRANT"); pause.resumeAttempted = true;
    empty.parse(await this.#request({ phase: "sql-fence-resume", method: "Debugger.resume", params: {} })); await this.#wait(() => pause.resumed);
  }
  async #startSelectedSqlFence(): Promise<void> {
    const initial = this.#pause; need(initial?.sqlSite === "import" && this.#selectedSqlPath !== null, "SELECTED_SQL_BEFORE_IMPORT_REQUIRED");
    await this.#qualify(initial.location.scriptId); need(this.#appSource !== null, "SELECTED_SQL_FULL_SOURCE"); qualifyCurrentSelectedFileMainSqlFenceSource(this.#appSource); qualifyCurrentMainStartupConfigSource(this.#appSource);
    await this.#armSelectedSql("afterImports"); for (const site of SQL_SITES) { await this.#armSelectedSql(site); }
    await this.#sqlResume(initial); await this.#wait(() => this.#pause !== initial);
    const after = this.#pause; need(after?.sqlSite === "afterImports", "SELECTED_SQL_AFTER_IMPORTS_REQUIRED");
    const selected = objectReply.parse(await this.#request({ phase: "sql-fence-frame", site: "afterImports", method: "Debugger.evaluateOnCallFrame", params: {
      ...SQL_FRAME, callFrameId: after.frameId, expression: SQL_SOURCE.sites.afterImports.expression } })); need(selected.result.description === "Array(4)", "SELECTED_SQL_MODULE_FRAME");
    const importsError = currentSelectedFileMainSqlFenceImportsError(await this.#request({ phase: "sql-fence-properties", method: "Runtime.getProperties", params: {
      objectId: selected.result.objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }));
    if (importsError !== null) { need(false, importsError); }
    const captureReply = await this.#request({ phase: "sql-fence-capture", method: "Runtime.callFunctionOn", params: {
      ...SQL_CALL, objectId: selected.result.objectId, functionDeclaration: SQL_CAPTURE, arguments: [{ value: this.#selectedSqlPath }], returnByValue: false } });
    const captureError = currentSelectedFileMainSqlCaptureError(captureReply);
    if (captureError !== null) { need(false, captureError); }
    const captured = objectReply.parse(captureReply);
    need(captured.result.description === "Array(11)", "SELECTED_SQL_ORIGINAL_CAPTURE"); this.#sqlCapture = captured.result.objectId;
    const natives = objectReply.parse(await this.#request({ phase: "sql-fence-native-frame", method: "Debugger.evaluateOnCallFrame", params: {
      ...SQL_FRAME, callFrameId: after.frameId, expression: SQL_NATIVE_EXPRESSION } })); need(natives.result.description === "Array(5)", "SELECTED_SQL_NATIVE_FRAME");
    const ids = decodeCurrentSelectedFileMainSqlFenceNativeArray(await this.#request({ phase: "sql-fence-properties", method: "Runtime.getProperties", params: {
      objectId: natives.result.objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }));
    for (const [index, role] of [[0, "Database"], [1, "Statement"], [2, "proxy"]] as const) {
      const id = ids[index]; need(id !== undefined, "SELECTED_SQL_NATIVE_REQUIRED"); decodeCurrentSelectedFileMainSqlFenceNative(await this.#request({ phase: "sql-fence-properties", method: "Runtime.getProperties", params: {
        objectId: id, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }), role);
    }
    for (const [index, role] of [[3, "Date"], [4, "now"]] as const) {
      const id = ids[index]; need(id !== undefined, "SELECTED_SQL_NATIVE_DATE_REQUIRED"); decodeCurrentFootprintCopyMainBackendNative(await this.#request({ phase: "sql-fence-properties", method: "Runtime.getProperties", params: {
        objectId: id, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }), role);
    }
    await this.#requireSelectedSqlCapture(); this.#sqlReady = true; await this.#sqlResume(after);
    await this.#wait(() => this.#pause !== after);
    while (this.#pause !== null && !this.#pause.registration) {
      const configuration = this.#pause; need(await this.#configureStartupSql(configuration), "SELECTED_SQL_UNQUALIFIED_STARTUP_MUTATION");
      await this.#wait(() => this.#pause !== configuration);
    }
    this.#startupConfigProgress.complete();
    // Every mutation stays paused until a distinct original request/SQL issuer
    // Proves that exact current call. This bootstrap publishes no such grant.
    need(this.#pause?.registration === true, "SELECTED_SQL_MUTATION_BEFORE_REGISTRATION");
  }
  async #requireSelectedSqlCapture(): Promise<void> {
    need(this.#sqlCapture !== null, "SELECTED_SQL_CAPTURE_REQUIRED");
    sqlTrueReply.parse(await this.#request({ phase: "sql-fence-require", method: "Runtime.callFunctionOn", params: {
      ...SQL_CALL, objectId: this.#sqlCapture, functionDeclaration: SQL_REQUIRE, arguments: [], returnByValue: true } }));
  }
  async #configureSelectedSqlInitializer(pause: Pause): Promise<void> {
    const site = pause.sqlSite; need((site === "initializerSerialize" || site === "initializerPragma") && this.#sqlCapture !== null && this.#sqlReady &&
      this.#pause === pause && !pause.resumeAttempted && !pause.resumed && this.#sqlConfigurationRecords.length < 64, "SELECTED_SQL_INITIALIZER_REQUIRED");
    const selectedFrame = objectReply.parse(await this.#request({ phase: "sql-fence-frame", site, method: "Debugger.evaluateOnCallFrame", params: {
      ...SQL_FRAME, callFrameId: pause.frameId, expression: SQL_SOURCE.sites[site].expression } })); need(selectedFrame.result.description === "Array(5)", "SELECTED_SQL_INITIALIZER_FRAME");
    const stage = site === "initializerSerialize" ? "serialize" : "pragma";
    const reply = sqlConfigurationReply.parse(
      await this.#request({ phase: "sql-fence-configure", site, method: "Runtime.callFunctionOn", params: { ...SQL_CALL, throwOnSideEffect: false,
        objectId: selectedFrame.result.objectId, functionDeclaration: SQL_CONFIGURATION, arguments: [{ objectId: this.#sqlCapture }, { value: stage }], returnByValue: true } }));
    need(reply.result.value.stage === stage && reply.result.value.selectedFile === (reply.result.value.path === this.#selectedSqlPath), "SELECTED_SQL_INITIALIZER_BINDING");
    this.#sqlConfigurationRecords.push(Object.freeze(reply.result.value)); this.#sqlApprovedConfigurations.add(pause); await this.#sqlResume(pause);
  }
  /** Enroll only the original saved Core's durable, pre-dispatch intent. This
   * cannot continue SQL. The later actual callback must separately prove that
   * same Core's once-consumed registration pipe Promise is still pending. */
  public enrollSavedProjectRegistrationIntent(intent: CurrentSavedProjectRegistrationIntent): Promise<void> {
    return this.#enrollProjectRegistration("saved", intent);
  }
  /** Separate inverse entry; a saved-reader intent cannot cross this issuer. */
  public enrollFootprintInverseRegistrationIntent(intent: CurrentFootprintInverseRegistrationIntent): Promise<void> {
    return this.#enrollProjectRegistration("inverse", intent);
  }
  /** Own SCH7 reader only. A Via or inverse token cannot enter this branch. */
  public enrollSchematicRelevanceSavedRegistrationIntent(intent: CurrentSchematicRelevanceSavedRegistrationIntent): Promise<void> {
    return this.#enrollProjectRegistration("schematic-saved", intent);
  }
  /** Distinct original writer issuer; a saved-reader token cannot enter. */
  public enrollSchematicRelevanceDisplayRegistrationIntent(intent: CurrentSchematicRelevanceDisplayRegistrationIntent): Promise<void> {
    return this.#enrollProjectRegistration("schematic-relevance-display", intent);
  }
  async #enrollProjectRegistration(...[kind, intent]: ["saved", CurrentSavedProjectRegistrationIntent] | ["inverse", CurrentFootprintInverseRegistrationIntent] | ["schematic-saved", CurrentSchematicRelevanceSavedRegistrationIntent] | ["schematic-relevance-display", CurrentSchematicRelevanceDisplayRegistrationIntent]): Promise<void> {
    this.#same(false);
    need(!this.#busy && !this.#savedRegistrationEnrollmentAttempted && this.#savedRegistrationEnrollment === null &&
      this.#selectedSqlBootstrap !== null && this.#sqlReady && this.#sqlCapture !== null && this.#selectedSqlPath !== null &&
      this.#packet !== null && issued.get(this.#packet) === this && this.#appSource !== null && !this.#originActive && !this.#structureActive,
    "SAVED_REGISTRATION_ENROLLMENT_UNAVAILABLE");
    this.#savedRegistrationEnrollmentAttempted = true; this.#busy = true;
    try {
      qualifyCurrentSavedProjectRegistrationConfigSource(this.#appSource);
      // Literal lazy import avoids Core -> runner -> Core eager initialization.
      // The original private registry accessor is retained, never injected.
      const ownerModule = await import("./current-pcb-diagnostic-owner.ts"); await this.#current();
      let enrollment: ProjectRegistrationEnrollment;
      if (kind === "saved") {
        const requireOriginal = ownerModule.requireOriginalCurrentSavedProjectRegistrationIntent; const bindings = requireOriginal(intent, this);
        need(bindings.target.rawWindowsPath === this.#selectedSqlPath && bindings.target.rawWindowsPath === bindings.prepared.target.rawWindowsPath &&
          bindings.target.expectedSourceSha256 === bindings.prepared.target.sourceSha256, "SAVED_REGISTRATION_SELECTED_TARGET");
        enrollment = Object.freeze({ kind: "saved", intent, bindings, ownerModule, requireOriginal });
      } else if (kind === "schematic-saved") {
        const requireOriginal = ownerModule.requireOriginalCurrentSchematicRelevanceSavedRegistrationIntent; const bindings = requireOriginal(intent, this);
        need(bindings.target.rawWindowsPath === this.#selectedSqlPath && bindings.target.documentUuid === bindings.pageUuid &&
          bindings.schematicUuid !== bindings.pageUuid && /^[a-f0-9]{32}$/u.test(bindings.schematicUuid) && /^[a-f0-9]{32}$/u.test(bindings.pageUuid), "SCHEMATIC_SAVED_REGISTRATION_SELECTED_TARGET");
        enrollment = Object.freeze({ kind: "schematic-saved", intent, bindings, ownerModule, requireOriginal });
      } else if (kind === "schematic-relevance-display") {
        const requireOriginal = ownerModule.requireOriginalCurrentSchematicRelevanceDisplayRegistrationIntent; const bindings = requireOriginal(intent, this);
        need(bindings.target.rawWindowsPath === this.#selectedSqlPath && bindings.target.documentUuid === bindings.pageUuid &&
          bindings.schematicUuid !== bindings.pageUuid && /^[a-f0-9]{32}$/u.test(bindings.schematicUuid) && /^[a-f0-9]{32}$/u.test(bindings.pageUuid), "SCHEMATIC_DISPLAY_REGISTRATION_SELECTED_TARGET");
        enrollment = Object.freeze({ kind: "schematic-relevance-display", intent, bindings, ownerModule, requireOriginal });
      } else {
        const requireOriginal = ownerModule.requireOriginalCurrentFootprintInverseRegistrationIntentForRunner; const bindings = requireOriginal(intent, this);
        need(bindings.target.rawWindowsPath === this.#selectedSqlPath, "INVERSE_REGISTRATION_SELECTED_TARGET");
        enrollment = Object.freeze({ kind: "inverse", intent, bindings, ownerModule, requireOriginal });
      }
      const bindings = enrollment.bindings;
      await bindings.assertCurrent(); await this.#current(); this.#reproveProjectRegistration(enrollment);
      this.#savedRegistrationEnrollment = enrollment;
      for (const site of CURRENT_SAVED_PROJECT_REGISTRATION_CONFIG_SITE_NAMES) {
        this.#savedRegistrationArming = site; const point = SAVED_CONFIG_SITES[site];
        need(this.#appScriptId !== null, "SAVED_REGISTRATION_SCRIPT_REQUIRED");
        const reply = z.strictObject({ breakpointId: handle, actualLocation: location }).parse(await this.#request({ phase: "sql-fence-registration-arm", site,
          method: "Debugger.setBreakpoint", params: { location: { scriptId: this.#appScriptId, lineNumber: point.lineNumber, columnNumber: point.columnNumber }, condition: "true" } }));
        this.#savedRegistrationLocation(site, reply.actualLocation);
        need(!this.#sqlBreakpoints.has(reply.breakpointId) && !this.#savedRegistrationBreakpoints.has(reply.breakpointId), "SAVED_REGISTRATION_BREAKPOINT_REUSED");
        for (const record of this.#savedRegistrationResolutions) {
          if (record.location.columnNumber === point.columnNumber) { need(record.breakpointId === reply.breakpointId, "SAVED_REGISTRATION_RESOLUTION_ID"); }
        }
        this.#savedRegistrationBreakpoints.set(reply.breakpointId, site); this.#savedRegistrationArming = null;
        await bindings.assertCurrent(); await this.#current();
      }
    } catch (caughtError) { this.#fail(caughtError); throw caughtError; }
    finally { this.#busy = false; }
  }
  /** Original source/owner plus a genuinely attempted unsettled pipe dispatch.
   * Data-only SQL matching will never replace this native continuation gate. */
  public async assertOriginalSavedProjectRegistrationPending(): Promise<void> {
    need(this.#savedRegistrationEnrollment?.kind === "saved", "SAVED_REGISTRATION_ISSUER_REQUIRED");
    await this.#assertOriginalProjectRegistrationPending();
  }
  public async assertOriginalSchematicRelevanceSavedRegistrationPending(): Promise<void> {
    need(this.#savedRegistrationEnrollment?.kind === "schematic-saved", "SCHEMATIC_SAVED_REGISTRATION_ISSUER_REQUIRED");
    await this.#assertOriginalProjectRegistrationPending();
  }
  public async assertOriginalSchematicRelevanceDisplayRegistrationPending(): Promise<void> {
    need(this.#savedRegistrationEnrollment?.kind === "schematic-relevance-display", "SCHEMATIC_DISPLAY_REGISTRATION_ISSUER_REQUIRED");
    await this.#assertOriginalProjectRegistrationPending();
  }
  #reproveProjectRegistration(original: ProjectRegistrationEnrollment): void {
    let current: boolean;
    if (original.kind === "schematic-relevance-display") {
      current = original.ownerModule.requireOriginalCurrentSchematicRelevanceDisplayRegistrationIntent === original.requireOriginal &&
        original.requireOriginal(original.intent, this) === original.bindings && original.bindings.target.documentUuid === original.bindings.pageUuid;
    } else if (original.kind === "schematic-saved") {
      current = original.ownerModule.requireOriginalCurrentSchematicRelevanceSavedRegistrationIntent === original.requireOriginal &&
        original.requireOriginal(original.intent, this) === original.bindings && original.bindings.target.documentUuid === original.bindings.pageUuid;
    } else if (original.kind === "saved") {
      current = original.ownerModule.requireOriginalCurrentSavedProjectRegistrationIntent === original.requireOriginal &&
        original.requireOriginal(original.intent, this) === original.bindings;
    } else {
      current = original.ownerModule.requireOriginalCurrentFootprintInverseRegistrationIntentForRunner === original.requireOriginal &&
        original.requireOriginal(original.intent, this) === original.bindings;
    }
    need(current && original.bindings.target.rawWindowsPath === this.#selectedSqlPath, "SAVED_REGISTRATION_ENROLLMENT_CHANGED");
  }
  async #assertOriginalProjectRegistrationPending(): Promise<void> {
    this.#same(false); const original = this.#savedRegistrationEnrollment;
    need(original !== null, "SAVED_REGISTRATION_ENROLLMENT_REQUIRED"); this.#reproveProjectRegistration(original);
    original.bindings.assertOriginalDispatchPending(); await original.bindings.assertCurrent(); this.#same(false);
    need(this.#savedRegistrationEnrollment === original, "SAVED_REGISTRATION_ENROLLMENT_CHANGED"); this.#reproveProjectRegistration(original);
    original.bindings.assertOriginalDispatchPending();
  }
  /** The native Core independently joins this intent to its private original
   * registry before sending any new registration command. */
  public originalSavedProjectRegistrationCommandIntent(): CurrentSavedProjectRegistrationIntent {
    this.#same(false); const original = this.#savedRegistrationEnrollment;
    need(original?.kind === "saved", "SAVED_REGISTRATION_ISSUER_REQUIRED"); this.#reproveProjectRegistration(original); return original.intent;
  }
  public originalFootprintInverseRegistrationCommandIntent(): CurrentFootprintInverseRegistrationIntent {
    this.#same(false); const original = this.#savedRegistrationEnrollment;
    need(original?.kind === "inverse", "INVERSE_REGISTRATION_ISSUER_REQUIRED"); this.#reproveProjectRegistration(original); return original.intent;
  }
  public originalSchematicRelevanceSavedRegistrationCommandIntent(): CurrentSchematicRelevanceSavedRegistrationIntent {
    this.#same(false); const original = this.#savedRegistrationEnrollment;
    need(original?.kind === "schematic-saved", "SCHEMATIC_SAVED_REGISTRATION_ISSUER_REQUIRED"); this.#reproveProjectRegistration(original); return original.intent;
  }
  public originalSchematicRelevanceDisplayRegistrationCommandIntent(): CurrentSchematicRelevanceDisplayRegistrationIntent {
    this.#same(false); const original = this.#savedRegistrationEnrollment;
    need(original?.kind === "schematic-relevance-display", "SCHEMATIC_DISPLAY_REGISTRATION_ISSUER_REQUIRED"); this.#reproveProjectRegistration(original); return original.intent;
  }
  /** Called by that same original Core after its one dispatch settles. It
   * proves the source awaits, never the contents of a closed shared database. */
  public requireOriginalSavedProjectRegistrationAwaited(intent: CurrentSavedProjectRegistrationIntent): void {
    need(this.originalSavedProjectRegistrationCommandIntent() === intent, "SAVED_REGISTRATION_ISSUER_REQUIRED"); this.#requireProjectRegistrationAwaited();
  }
  public requireOriginalFootprintInverseRegistrationAwaited(intent: CurrentFootprintInverseRegistrationIntent): void {
    need(this.originalFootprintInverseRegistrationCommandIntent() === intent, "INVERSE_REGISTRATION_ISSUER_REQUIRED"); this.#requireProjectRegistrationAwaited();
  }
  public requireOriginalSchematicRelevanceSavedRegistrationAwaited(intent: CurrentSchematicRelevanceSavedRegistrationIntent): void {
    need(this.originalSchematicRelevanceSavedRegistrationCommandIntent() === intent, "SCHEMATIC_SAVED_REGISTRATION_ISSUER_REQUIRED"); this.#requireProjectRegistrationAwaited();
  }
  public requireOriginalSchematicRelevanceDisplayRegistrationAwaited(intent: CurrentSchematicRelevanceDisplayRegistrationIntent): void {
    need(this.originalSchematicRelevanceDisplayRegistrationCommandIntent() === intent, "SCHEMATIC_DISPLAY_REGISTRATION_ISSUER_REQUIRED"); this.#requireProjectRegistrationAwaited();
  }
  /** Only the actual writer's prior-path result settles this unused sequence. */
  public requireOriginalSchematicRelevanceDisplayRegistrationSkipped(intent: CurrentSchematicRelevanceDisplayRegistrationIntent): void {
    need(this.originalSchematicRelevanceDisplayRegistrationCommandIntent() === intent, "SCHEMATIC_DISPLAY_REGISTRATION_ISSUER_REQUIRED");
    const original = this.#savedRegistrationEnrollment; need(original?.kind === "schematic-relevance-display", "SCHEMATIC_DISPLAY_REGISTRATION_ISSUER_REQUIRED");
    original.bindings.assertOriginalNoDispatchResult();
    need((this.#savedRegistrationStage === "unused" || this.#savedRegistrationStage === "registration-skipped") && this.#savedRegistrationTracker === null &&
      this.#savedRegistrationOpenedPause === null && this.#savedRegistrationArming === null && this.#savedRegistrationBreakpoints.size === 3 && this.#sqlHeld === null,
    "SCHEMATIC_DISPLAY_REGISTRATION_UNUSED_SEQUENCE_REQUIRED"); this.#savedRegistrationStage = "registration-skipped";
  }
  /** A genuine prior-path result settles only an entirely unused own sequence.
   * It creates no SQL tracker, native run or callback/await acknowledgment. */
  public requireOriginalSchematicRelevanceSavedRegistrationSkipped(intent: CurrentSchematicRelevanceSavedRegistrationIntent): void {
    need(this.originalSchematicRelevanceSavedRegistrationCommandIntent() === intent, "SCHEMATIC_SAVED_REGISTRATION_ISSUER_REQUIRED");
    const original = this.#savedRegistrationEnrollment; need(original?.kind === "schematic-saved", "SCHEMATIC_SAVED_REGISTRATION_ISSUER_REQUIRED");
    original.bindings.assertOriginalNoDispatchResult();
    need((this.#savedRegistrationStage === "unused" || this.#savedRegistrationStage === "registration-skipped") && this.#savedRegistrationTracker === null &&
      this.#savedRegistrationOpenedPause === null && this.#savedRegistrationArming === null && this.#savedRegistrationBreakpoints.size === 3 && this.#sqlHeld === null,
    "SCHEMATIC_SAVED_REGISTRATION_UNUSED_SEQUENCE_REQUIRED"); this.#savedRegistrationStage = "registration-skipped";
  }
  /** A real prior-registration result can finish an unused inverse sequence;
   * it cannot fabricate a native run, callback or source-await acknowledgment. */
  public requireOriginalFootprintInverseRegistrationSkipped(intent: CurrentFootprintInverseRegistrationIntent): void {
    need(this.originalFootprintInverseRegistrationCommandIntent() === intent, "INVERSE_REGISTRATION_ISSUER_REQUIRED");
    const original = this.#savedRegistrationEnrollment; need(original?.kind === "inverse", "INVERSE_REGISTRATION_ISSUER_REQUIRED");
    original.bindings.assertOriginalNoDispatchResult();
    need((this.#savedRegistrationStage === "unused" || this.#savedRegistrationStage === "registration-skipped") && this.#savedRegistrationTracker === null &&
      this.#savedRegistrationOpenedPause === null && this.#savedRegistrationArming === null && this.#savedRegistrationBreakpoints.size === 3 && this.#sqlHeld === null,
    "INVERSE_REGISTRATION_UNUSED_SEQUENCE_REQUIRED"); this.#savedRegistrationStage = "registration-skipped";
  }
  #requireProjectRegistrationAwaited(): void {
    need(this.#savedRegistrationStage === "registration-awaited" &&
      this.#savedRegistrationTracker !== null && this.#savedRegistrationArming === null && this.#savedRegistrationBreakpoints.size === 3 &&
      this.#sqlHeld === null && this.#savedRegistrationOpenedPause?.savedRegistrationSite === "opened" && this.#savedRegistrationOpenedPause.resumed,
    "SAVED_REGISTRATION_ORIGINAL_AWAITS_REQUIRED");
  }
  #savedRegistrationLocation(site: SavedRegistrationSite, actual: z.infer<typeof location>): void {
    const expected = SAVED_CONFIG_SITES[site]; need(actual.scriptId === this.#appScriptId && this.#scripts.has(actual.scriptId) &&
      actual.lineNumber === expected.lineNumber && actual.columnNumber === expected.columnNumber, "SAVED_REGISTRATION_SOURCE_LOCATION");
  }
  async #continueSavedRegistration(pause: Pause): Promise<void> {
    need(this.#pause === pause && !pause.resumeAttempted && !pause.resumed && this.#sqlCapture !== null && this.#startupConfigTracker !== null &&
      this.#selectedSqlPath !== null && this.#savedRegistrationBreakpoints.size === 3, "SAVED_REGISTRATION_ORIGINAL_PAUSE");
    await this.#assertOriginalProjectRegistrationPending();
    const site = pause.savedRegistrationSite; let selected: z.infer<typeof objectReply>;
    if (site === undefined) {
      need(pause.sqlSite === "run" && this.#savedRegistrationStage === "bound", "SAVED_REGISTRATION_SINGLE_RUN_REQUIRED");
      selected = objectReply.parse(await this.#request({ phase: "sql-fence-frame", site: "run", method: "Debugger.evaluateOnCallFrame", params: {
        ...SQL_FRAME, callFrameId: pause.frameId, expression: SQL_SOURCE.sites.run.expression } }));
      need(selected.result.description === "Array(5)", "SAVED_REGISTRATION_NATIVE_RUN_FRAME");
    } else {
      selected = objectReply.parse(await this.#request({ phase: "sql-fence-registration-frame", site, method: "Debugger.evaluateOnCallFrame", params: {
        ...SQL_FRAME, callFrameId: pause.frameId, expression: SAVED_CONFIG_SITES[site].expression } }));
      let size = 7; if (site === "bind") { size = 17; } else if (site === "afterExec") { size = 8; }
      need(selected.result.description === `Array(${String(size)})`, "SAVED_REGISTRATION_FRAME");
    }
    const frameId = selected.result.objectId;
    if (site === "bind") {
      need(this.#savedRegistrationStage === "unused" && this.#savedRegistrationTracker === null, "SAVED_REGISTRATION_BIND_CONSUMED");
      const reply = objectReply.parse(await this.#request({ phase: "sql-fence-registration-bind", method: "Runtime.callFunctionOn", params: { ...SQL_CALL,
        throwOnSideEffect: false, objectId: frameId, functionDeclaration: SAVED_CONFIG_CALLS.bind,
        arguments: [{ objectId: this.#startupConfigTracker }, { value: this.#selectedSqlPath }], returnByValue: false } }));
      need(reply.result.description === "Array(8)", "SAVED_REGISTRATION_TRACKER"); this.#savedRegistrationTracker = reply.result.objectId; this.#savedRegistrationStage = "bound";
    } else {
      need(this.#savedRegistrationTracker !== null, "SAVED_REGISTRATION_BIND_REQUIRED");
      const registrationArguments: [{ objectId: string }] = [{ objectId: this.#savedRegistrationTracker }];
      const params = { ...SQL_CALL, throwOnSideEffect: false as const, objectId: frameId, arguments: registrationArguments, returnByValue: true as const };
      if (site === undefined) {
        need(this.#savedRegistrationStage === "bound", "SAVED_REGISTRATION_RUN_CONSUMED");
        const value = savedRegistrationRunReply.parse(
          await this.#request({ phase: "sql-fence-registration-run", method: "Runtime.callFunctionOn", params: { ...params, functionDeclaration: SAVED_CONFIG_CALLS.run } }));
        need(value.result.value.path === this.#selectedSqlPath, "SAVED_REGISTRATION_RUN_TARGET"); this.#savedRegistrationStage = "run-consumed";
      } else if (site === "afterExec") {
        need(this.#savedRegistrationStage === "run-consumed", "SAVED_REGISTRATION_UPSERT_AWAIT_REQUIRED");
        sqlTrueReply.parse(await this.#request({ phase: "sql-fence-registration-after-exec", method: "Runtime.callFunctionOn", params: { ...params, functionDeclaration: SAVED_CONFIG_CALLS.afterExec } })); this.#savedRegistrationStage = "upsert-awaited";
      } else {
        need(this.#savedRegistrationStage === "upsert-awaited", "SAVED_REGISTRATION_QUERY_AWAIT_REQUIRED");
        sqlTrueReply.parse(await this.#request({ phase: "sql-fence-registration-opened", method: "Runtime.callFunctionOn", params: { ...params, functionDeclaration: SAVED_CONFIG_CALLS.opened } })); this.#savedRegistrationStage = "registration-awaited";
      }
    }
    await this.#assertOriginalProjectRegistrationPending(); await this.#requireSelectedSqlCapture();
    this.#sqlApprovedConfigurations.add(pause); await this.#sqlResume(pause);
    if (site === "opened") { need(this.#savedRegistrationOpenedPause === null, "SAVED_REGISTRATION_OPENED_ALREADY_RETAINED"); this.#savedRegistrationOpenedPause = pause; }
  }
  async #configureStartupSql(pause: Pause): Promise<boolean> {
    const site = pause.sqlSite;
    need(this.#pause === pause && !pause.resumeAttempted && !pause.resumed && this.#sqlCapture !== null && this.#sqlReady, "STARTUP_CONFIG_ORIGINAL_PAUSE");
    if (site === "initializerSerialize" || site === "initializerPragma") { await this.#configureSelectedSqlInitializer(pause); return true; }
    if (site === "startupVersion" || site === "startupJB" || site === "startupDC") {
      const selected = objectReply.parse(await this.#request({ phase: "sql-fence-frame", site, method: "Debugger.evaluateOnCallFrame", params: {
        ...SQL_FRAME, callFrameId: pause.frameId, expression: SQL_SOURCE.sites[site].expression } }));
      let size = 11; if (site === "startupVersion") { size = 13; } else if (site === "startupJB") { size = 12; }
      need(selected.result.description === `Array(${String(size)})`, "STARTUP_CONFIG_SOURCE_FRAME");
      if (site === "startupVersion") {
        need(this.#startupConfigTracker === null, "STARTUP_CONFIG_VERSION_CONSUMED");
        const captured = objectReply.parse(await this.#request({ phase: "sql-fence-startup-version", method: "Runtime.callFunctionOn", params: { ...SQL_CALL, throwOnSideEffect: false,
          objectId: selected.result.objectId, functionDeclaration: STARTUP_CALLS.version, arguments: [{ objectId: this.#sqlCapture }], returnByValue: false } }));
        need(captured.result.description === "Array(6)", "STARTUP_CONFIG_ORIGINAL_TRACKER"); this.#startupConfigTracker = captured.result.objectId; this.#startupConfigProgress.version();
      } else {
        need(this.#startupConfigTracker !== null, "STARTUP_CONFIG_VERSION_REQUIRED");
        if (site === "startupJB") {
          sqlTrueReply.parse(await this.#request({ phase: "sql-fence-startup-jb", method: "Runtime.callFunctionOn", params: { ...SQL_CALL, throwOnSideEffect: false,
            objectId: selected.result.objectId, functionDeclaration: STARTUP_CALLS.bindJB, arguments: [{ objectId: this.#startupConfigTracker }], returnByValue: true } }));
          this.#startupConfigProgress.bind("jb");
        } else {
          sqlTrueReply.parse(await this.#request({ phase: "sql-fence-startup-dc", method: "Runtime.callFunctionOn", params: { ...SQL_CALL, throwOnSideEffect: false,
            objectId: selected.result.objectId, functionDeclaration: STARTUP_CALLS.bindDC, arguments: [{ objectId: this.#startupConfigTracker }], returnByValue: true } }));
          this.#startupConfigProgress.bind("dc");
        }
      }
    } else if (site === "run" || site === "prepare" || site === "prepared" || site === "statementRun" || site === "finalize") {
      if (this.#startupConfigTracker === null || site === "statementRun" || site === "finalize") { return false; }
      const selected = objectReply.parse(await this.#request({ phase: "sql-fence-frame", site, method: "Debugger.evaluateOnCallFrame", params: {
        ...SQL_FRAME, callFrameId: pause.frameId, expression: SQL_SOURCE.sites[site].expression } }));
      let size = 5; if (site === "prepare") { size = 6; } else if (site === "prepared") { size = 7; }
      need(selected.result.description === `Array(${String(size)})`, "STARTUP_CONFIG_NATIVE_FRAME");
      const reply = z.object({ result: z.object({ type: z.literal("object"), value: currentMainStartupConfigSelectionSchema }).strict() }).strict().parse(
        await this.#request({ phase: "sql-fence-startup-select", site, method: "Runtime.callFunctionOn", params: { ...SQL_CALL, throwOnSideEffect: false,
          objectId: selected.result.objectId, functionDeclaration: STARTUP_CALLS.select, arguments: [{ objectId: this.#startupConfigTracker }, { value: site }], returnByValue: true } }));
      if (!this.#startupConfigProgress.consume(reply.result.value)) { return false; }
    } else { return false; }
    await this.#requireSelectedSqlCapture(); this.#sqlApprovedConfigurations.add(pause); await this.#sqlResume(pause);
    if (site === "startupVersion" || site === "startupJB" || site === "startupDC") { this.#startupMetadataContinuations += 1; } else { this.#startupSqlContinuations += 1; }
    return true;
  }
  #requireSelectedRequestPause(pause: Pause): void {
    this.#same(false); need(this.#selectedSqlBootstrap !== null && this.#sqlReady && this.#packet !== null && issued.get(this.#packet) === this && this.#sqlCapture !== null &&
      this.#pause === pause && pause.sqlSite === "driver" && !pause.resumeAttempted && !pause.resumed && this.#pendingId === null, "SELECTED_REQUEST_ORIGINAL_PAUSE");
  }
  async #observeSelectedMainRequest(pause: Pause): Promise<CurrentSelectedFileMainRequestObservation> {
    this.#requireSelectedRequestPause(pause); const previous = this.#selectedObservedRequests.get(pause); if (previous !== undefined) { this.requireOriginalSelectedMainRequest(previous); return previous; }
    need(this.#selectedRequestPause === null, "SELECTED_REQUEST_REENTRANT"); this.#selectedRequestPause = pause;
    try {
      if (this.#selectedRequestReader === null) {
        need(this.#appScriptId !== null && this.#sqlCapture !== null, "SELECTED_REQUEST_SOURCE_REQUIRED");
        this.#selectedRequestReader = new CurrentSelectedFileMainRequestReader(Object.freeze({ appScriptId: this.#appScriptId, captureObjectId: this.#sqlCapture,
          request: (command: CurrentSelectedFileMainSqlFenceCommand): Promise<unknown> => { const actual = this.#selectedRequestPause; need(actual !== null, "SELECTED_REQUEST_ORIGINAL_PAUSE"); this.#requireSelectedRequestPause(actual); return this.#request(command); },
        assertCurrent: async (): Promise<void> => { const actual = this.#selectedRequestPause; need(actual !== null, "SELECTED_REQUEST_ORIGINAL_PAUSE"); this.#requireSelectedRequestPause(actual); await this.#current(); this.#requireSelectedRequestPause(actual); },
          assertFetchScript: (scriptId: string): void => { need(this.#selectedFetchScript?.scriptId === scriptId && this.#appScriptId !== null && this.#scripts.get(this.#appScriptId) === this.#selectedFetchScript.executionContextId, "SELECTED_FETCH_ORIGINAL_SCRIPT"); } }));
      }
      const packet = await this.#selectedRequestReader.observe(pause.frameId); this.#requireSelectedRequestPause(pause);
      selectedRequestPackets.set(packet, Object.freeze({ runner: this, pause, text: canonicalJson(packet) })); this.#selectedObservedRequests.set(pause, packet); return packet;
    } finally { this.#selectedRequestPause = null; }
  }
  /** Own inverse issuer only. Four original same-head requests are armed one
   * at a time before their worker response may continue. */
  public async armFootprintInverseInitialHistory(ordinal: number): Promise<void> {
    need(!this.#busy && this.#selectedSqlBootstrap !== null && this.#sqlReady && this.#appScriptId !== null && this.#appSource !== null && this.#sqlCapture !== null && this.#viaMainOrigin === null && this.#sqlHeld === null && this.#inverseMainHistoryPoint === null && ordinal === this.#inverseMainHistoryRows.length + 1 && ordinal === this.#inverseMainHistoryOrdinal + 1 && ordinal <= INVERSE_HISTORY.repetitions, "INVERSE_HISTORY_ARM_ONCE");
    const intent = this.originalFootprintInverseRegistrationCommandIntent();
    const baseline = originalCurrentFootprintInverseMainHistoryBaseline(this.#selectedSqlBootstrap, this, intent);
    if (this.#inverseMainHistoryBaseline === null) { this.#inverseMainHistoryIntent = intent; this.#inverseMainHistoryBaseline = baseline; }
    need(this.#inverseMainHistoryIntent === intent && this.#inverseMainHistoryBaseline === baseline, "INVERSE_HISTORY_ORIGINAL_BASELINE");
    qualifyCurrentPcbViaMainLiveHistorySource(this.#appSource); this.#busy = true; this.#inverseMainHistoryOrdinal = ordinal; this.#inverseMainHistorySignals.set(ordinal, Promise.withResolvers<CurrentFootprintInverseMainHistoryRows | null>());
    const same = (): void => { this.#same(false); need(this.originalFootprintInverseRegistrationCommandIntent() === intent && this.#selectedSqlBootstrap !== null && originalCurrentFootprintInverseMainHistoryBaseline(this.#selectedSqlBootstrap, this, intent) === baseline, "INVERSE_HISTORY_OWNER_CHANGED"); };
    const custody = new CurrentFootprintInverseMainHistoryCustody({ scriptId: this.#appScriptId, sqlCaptureObjectId: this.#sqlCapture, assertCurrent: same,
      expected: (): CurrentFootprintInverseMainHistoryBaseline => { same(); return baseline; },
      pause: (): CurrentPcbViaMainBeginPause => { same(); const held = this.#inverseMainHistoryPause; need(held !== null && held.identity === this.#pause, "INVERSE_HISTORY_HELD_REQUIRED");
        return Object.freeze({ identity: held.identity, frameId: held.identity.frameId, raw: held.raw, sqlSite: null, pendingEvents: 0, resumed: held.identity.resumed, resumeAttempted: held.identity.resumeAttempted }); },
      pendingRequestId: (): number | null => this.#pendingId, busy: (): boolean => this.#busy,
      send: (command, cleanup): Promise<unknown> => this.#request(command, cleanup),
      registerPoint: (id, actual): void => { need(this.#inverseMainHistoryPoint === null && (this.#inverseMainHistoryResolution === null || this.#inverseMainHistoryResolution.breakpointId === id) && !this.#sqlBreakpoints.has(id) && !this.#savedRegistrationBreakpoints.has(id), "INVERSE_HISTORY_POINT_ALIAS"); this.#inverseMainHistoryPoint = Object.freeze({ id, location: actual }); },
      pointCurrent: (id): boolean => this.#inverseMainHistoryPoint?.id === id,
      removePoint: (id): void => { need(this.#inverseMainHistoryPoint?.id === id, "INVERSE_HISTORY_ORIGINAL_REMOVE"); this.#inverseMainHistoryPoint = null; },
      resume: async (identity, command): Promise<unknown> => { same(); const held = this.#inverseMainHistoryPause; need(held !== null && held.identity === identity && this.#pause === identity && !held.identity.resumed && !held.identity.resumeAttempted, "INVERSE_HISTORY_RESUME_ONCE");
        held.identity.resumeAttempted = true; const result = await this.#request(command); await this.#wait(() => held.identity.resumed); same(); return result; } });
    this.#inverseMainHistoryCustody = custody; const collector = new CurrentFootprintInverseMainHistoryCollector(custody, this.#sqlCapture); this.#inverseMainHistoryCollector = collector;
    this.#inverseMainHistoryResolution = null; this.#inverseMainHistoryArming = true;
    try { await collector.arm(this.#appScriptId); same(); } catch (error) { this.#fail(error); throw error; }
    finally { this.#inverseMainHistoryArming = false; this.#busy = false; }
  }
  public consumeFootprintInverseInitialHistory(command: CurrentFootprintInverseMainHistoryCommand, id: number): void {
    this.#same(false); need(this.#inverseMainHistoryCustody !== null && this.#inverseMainHistoryIntent === this.originalFootprintInverseRegistrationCommandIntent(), "INVERSE_HISTORY_ORIGINAL_CUSTODY"); this.#inverseMainHistoryCustody.consume(command, id);
  }
  /** Waits only on the original collector. It starts no second inspector poll. */
  public originalFootprintInverseInitialHistoryCompletion(ordinal: number): Promise<CurrentFootprintInverseMainHistoryRows | null> {
    this.#same(false); const signal = this.#inverseMainHistorySignals.get(ordinal); need(signal !== undefined && this.#inverseMainHistoryIntent === this.originalFootprintInverseRegistrationCommandIntent(), "INVERSE_HISTORY_ORIGINAL_COMPLETION"); return signal.promise;
  }
  public failFootprintInverseInitialHistory(): void { for (const signal of this.#inverseMainHistorySignals.values()) { signal.resolve(null); } }
  public requireFootprintInverseInitialHistoryRows(ordinal: number): CurrentFootprintInverseMainHistoryRows {
    this.#same(false); const rows = this.#inverseMainHistoryRows[ordinal - 1]; need(Number.isSafeInteger(ordinal) && ordinal >= 1 && ordinal <= INVERSE_HISTORY.repetitions && rows !== undefined && this.#inverseMainHistoryIntent === this.originalFootprintInverseRegistrationCommandIntent(), "INVERSE_HISTORY_COMPLETION_REQUIRED"); return rows;
  }
  /** Original driver observation only. Matching JSON and another runner cannot
   * recreate it, and it provides no request/SQL continuation by itself. */
  public async observeSelectedMainRequest(): Promise<CurrentSelectedFileMainRequestObservation> {
    need(!this.#busy && this.#pause !== null && !this.#originActive && !this.#structureActive, "SELECTED_REQUEST_CURSOR_BUSY"); this.#busy = true;
    try { return await this.#observeSelectedMainRequest(this.#pause); } catch (error) { this.#fail(error); throw error; } finally { this.#busy = false; }
  }
  public requireOriginalSelectedMainRequest(packet: CurrentSelectedFileMainRequestObservation): void {
    const original = selectedRequestPackets.get(packet); need(original?.runner === this && original.text === canonicalJson(packet) && this.#selectedObservedRequests.get(original.pause) === packet, "SELECTED_REQUEST_ORIGINAL");
    this.#requireSelectedRequestPause(original.pause);
  }
  #selectedReadonlyRequest(packet: CurrentSelectedFileMainRequestObservation): boolean {
    this.requireOriginalSelectedMainRequest(packet); need(this.#selectedSqlPath !== null, "SELECTED_REQUEST_PATH_REQUIRED");
    const prefix = `/api/v4/projects/${createHash("sha256").update(this.#selectedSqlPath).digest("hex")}`;
    return (packet.method === "GET" || packet.method === "HEAD") && (packet.pureUrl === prefix || packet.pureUrl.startsWith(`${prefix}/`));
  }
  async #continueSelectedReadonlyRequest(packet: CurrentSelectedFileMainRequestObservation): Promise<void> {
    need(this.#selectedReadonlyRequest(packet) && this.#selectedReadonlyContinuations < 64, "SELECTED_REQUEST_NO_WRITE_GRANT"); const original = selectedRequestPackets.get(packet); need(original !== undefined, "SELECTED_REQUEST_ORIGINAL");
    if (this.#viaLiveHistoryCustody?.wantsReadonlyRequest(packet) === true) { need(this.#selectedRequestReader !== null, "VIA_LIVE_ORIGINAL_REQUEST_READER"); this.#viaLiveHistoryCustody.retainReadonlyRequest(packet, this.#selectedRequestReader.requireOriginalCapture(packet)); }
    if (this.#inverseMainHistoryCustody?.wantsReadonlyRequest(packet) === true) { need(this.#selectedRequestReader !== null, "INVERSE_HISTORY_ORIGINAL_REQUEST_READER"); this.#inverseMainHistoryCustody.retainReadonlyRequest(packet, this.#selectedRequestReader.requireOriginalCapture(packet)); }
    this.#selectedReadonlyContinuations += 1; this.#sqlApprovedReadRequests.add(original.pause); await this.#sqlResume(original.pause);
    if (this.#sqlHeld === original.pause) { this.#sqlHeld = null; }
  }
  public async continueSelectedReadonlyRequest(packet: CurrentSelectedFileMainRequestObservation): Promise<void> {
    need(!this.#busy, "SELECTED_REQUEST_CURSOR_BUSY"); this.#busy = true;
    try { await this.#continueSelectedReadonlyRequest(packet); } catch (error) { this.#fail(error); throw error; } finally { this.#busy = false; }
  }
  async #sendRelevanceMain(input: Readonly<{ phase: string }>, id: number): Promise<void> {
    need(this.#selectedSqlBootstrap !== null && this.#viaMainOrigin?.profile === "private.current-schematic-relevance-display-save-main-origin.v1", "SCHEMATIC_MAIN_ORIGINAL_BOOTSTRAP");
    if(input.phase.startsWith("via-main-live-")){await sendOriginalCurrentSchematicRelevanceDisplayMainLiveHistory(this.#selectedSqlBootstrap,this,validateCurrentPcbViaMainLiveHistoryCommand(input),id);return;}
    if (input.phase.startsWith("via-main-structure-")) {
      const command = validateCurrentPcbViaMainStructureCommand(input), window = await sendOriginalCurrentSchematicRelevanceDisplayMainStructure(this.#selectedSqlBootstrap, this, command, id);
      if (command.phase === "via-main-structure-step") { need(this.#viaStructureCustody !== null, "SCHEMATIC_STRUCTURE_ORIGINAL_CUSTODY"); this.#viaStructureCustody.acknowledge(command, id, window); } return;
    }
    let command: CurrentPcbViaMainCommand | CurrentPcbViaMainHistoryCommand | CurrentPcbViaMainBeginCommand | CurrentPcbViaMainStepCommand;
    if (input.phase.startsWith("via-main-history-")) { command = validateCurrentPcbViaMainHistoryCommand(input); }
    else if (input.phase.startsWith("via-main-begin-")) { command = validateCurrentPcbViaMainBeginCommand(input); }
    else if (input.phase === "via-main-driver-step" || input.phase === "via-main-context-step" || input.phase === "via-main-controller-step") { command = validateCurrentPcbViaMainStepCommand(input); }
    else { command = validateCurrentPcbViaMainCommand(input); }
    const window = await sendOriginalCurrentSchematicRelevanceDisplayMain(this.#selectedSqlBootstrap, this, command, id);
    if (command.phase === "via-main-history-step") { need(this.#viaHistoryCustody !== null, "SCHEMATIC_HISTORY_ORIGINAL_CUSTODY"); this.#viaHistoryCustody.acknowledge(validateCurrentPcbViaMainHistoryCommand(command), id, window); }
  }
  /** Same original cursor, no second inspector. A held write remains paused;
   * this method never treats its data as permission to continue native SQL. */
  public async pumpSelectedSqlFence(): Promise<void> {
    if (this.#viaMainOrigin !== null) {
      if (!this.#busy) { await this.#pump();
        if (!this.#busy) { const service = (async (): Promise<void> => { this.#busy = true;
          try { await this.#serveUndeliveredViaReadonly(); } catch (error) { this.#fail(error); throw error; } finally { this.#busy = false; this.#viaMainReadonlyService = null; }
        })(); this.#viaMainReadonlyService = service; await service; }
      } return;
    }
    need(this.#selectedSqlBootstrap !== null && this.#sqlReady && this.#packet !== null && !this.#busy && !this.#originActive && !this.#structureActive, "SELECTED_SQL_PUMP_OWNER");
    this.#busy = true; try {
      await this.#current(); if (this.#sqlHeld !== null) { return; } await this.#pump();
      const pause = this.#pause;
      if (pause !== null && !pause.resumed && this.#inverseMainHistoryPause?.identity === pause) {
        need(this.#inverseMainHistoryCollector !== null && this.#inverseMainHistoryRows.length + 1 === this.#inverseMainHistoryOrdinal, "INVERSE_HISTORY_ORIGINAL_COLLECTOR");
        const rows = await this.#inverseMainHistoryCollector.observeHeld(pause.frameId); this.#same(false);
        need(pause.resumed && this.#inverseMainHistoryPoint === null, "INVERSE_HISTORY_READ_RELEASE_REQUIRED"); this.#inverseMainHistoryRows.push(rows); this.#inverseMainHistoryPause = null; this.#inverseMainHistorySignals.get(this.#inverseMainHistoryOrdinal)?.resolve(rows);
      }
      else if (pause !== null && !pause.resumed && pause.savedRegistrationSite !== undefined) { await this.#continueSavedRegistration(pause); }
      else if (pause !== null && !pause.resumed && pause.sqlSite !== undefined) {
        if (pause.sqlSite === "run" && this.#savedRegistrationTracker !== null) { await this.#continueSavedRegistration(pause); }
        else if (pause.sqlSite === "driver") { const request = await this.#observeSelectedMainRequest(pause); if (this.#selectedReadonlyRequest(request)) { await this.#continueSelectedReadonlyRequest(request); } else { this.#sqlHeld = pause; } }
        else if (!await this.#configureStartupSql(pause)) { this.#sqlMutationPauses += 1; need(this.#sqlMutationPauses <= 64, "SELECTED_SQL_MUTATION_BOUND"); this.#sqlHeld = pause; await this.#requireSelectedSqlCapture(); }
      }
    } catch (error) { this.#fail(error); throw error; } finally { this.#busy = false; }
  }
  async #serveUndeliveredViaReadonly(): Promise<void> {
    const pause = this.#pause;
    if (pause === null || pause.sqlSite !== "driver" || pause.resumeAttempted || pause.resumed || this.#viaMainDeliveredPause !== null || this.#viaMainDriverStep !== null) { return; }
    const context = CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_COLLECTION_SITES.context;
    need(![...this.#viaMainPoints.values()].some(point => point.lineNumber === context.lineNumber && point.columnNumber === context.columnNumber), "VIA_MAIN_READONLY_CONTEXT_POINT_PRESENT");
    const packet = await this.#observeSelectedMainRequest(pause);
    if (this.#selectedReadonlyRequest(packet)) {
      const event = this.#viaMainEvents.shift(); need(event?.method === "Debugger.paused" && pauseSchema.parse(event.params).callFrames[0]?.callFrameId === pause.frameId, "VIA_MAIN_READONLY_ORIGINAL_PAUSE");
      await this.#continueSelectedReadonlyRequest(packet); const resumed = this.#viaMainEvents.shift();
      need(pause.resumed && resumed?.method === "Debugger.resumed", "VIA_MAIN_READONLY_ORIGINAL_RESUMED"); empty.parse(resumed.params);
    }
  }
  public selectedSqlFenceState(): Readonly<Record<string, unknown>> {
    return Object.freeze({ profile: "private.selected-file-main-sql-fence.v1", originalBootstrapRetained: this.#selectedSqlBootstrap !== null,
      ready: this.#sqlReady, conditionalBreakpoints: Math.max(0, this.#sqlBreakpoints.size - 2), nativePrimitivesReplaced: false,
      heldSite: this.#sqlHeld?.sqlSite ?? null, readonlyRequestContinuations: this.#selectedReadonlyContinuations, selectedProjectMutationsResumed: 0, mutationGrantAvailable: false,
      profileSqlContinuationsAcknowledged: this.#startupSqlContinuations, profileMetadataContinuationsAcknowledged: this.#startupMetadataContinuations,
      startupProfileBookkeeping: this.#startupConfigProgress.snapshot(), initializerConfigurations: Object.freeze([...this.#sqlConfigurationRecords]), initializerConfigurationAutomaticallyAdmitted: true, completeSqlEffectProven: false, executionAuthorized: false, saveAuthorized: false });
  }

  /** Transfer this original selected-file cursor into a Via-only observer.
   * The persistent SQL fence remains installed, and this vocabulary has no
   * resume at all. A later per-call native grant must be separately added. */
  public beginViaMainObservation(): Promise<Readonly<{ origin: CurrentPcbViaMainOrigin; bindings: CurrentPcbViaMainBackendBindings }>> {
    return this.#beginSelectedMainObservation(Object.freeze({ profile: "private.current-pcb-via-main-origin.v1" }));
  }
  public async beginSchematicRelevanceDisplaySaveMainObservation(): Promise<Readonly<{ origin: CurrentSchematicRelevanceDisplaySaveMainOrigin; bindings: CurrentSchematicRelevanceDisplaySaveMainBackendBindings }>> {
    const captured = await this.#beginSelectedMainObservation(Object.freeze({ profile: "private.current-schematic-relevance-display-save-main-origin.v1" }));
    const actual = captured.bindings;
    // The original seven-record cursor exposes its fixed request, BEGIN,
    // History, enrolled STRUCTURE and original readonly live-history lanes.
    const bindings: CurrentSchematicRelevanceDisplaySaveMainBackendBindings = Object.freeze({ liveHistoryRequest: actual.liveHistoryRequest, originalLiveHistoryRequestObjectId: actual.originalLiveHistoryRequestObjectId, originalLiveHistoryRows: actual.originalLiveHistoryRows, structureRequest: actual.structureRequest, requireStructureArmed: actual.requireStructureArmed, startStructure: actual.startStructure, structureExpected: actual.structureExpected, originalStructureEffects: actual.originalStructureEffects, scriptId: actual.scriptId, constructionObjectId: actual.constructionObjectId, source: actual.source, persistentDriverBreakpointId: actual.persistentDriverBreakpointId, sqlCaptureObjectId: actual.sqlCaptureObjectId, historyRequest: actual.historyRequest, requireHistoryArmed: actual.requireHistoryArmed, startHistory: actual.startHistory, originalHistoryEffects: actual.originalHistoryEffects, beginRequest: actual.beginRequest, requireBeginArmed: actual.requireBeginArmed, originalBeginResult: actual.originalBeginResult, request: actual.request, nextEvent: actual.nextEvent, observeRequest: actual.observeRequest, requireOriginalRequest: actual.requireOriginalRequest, requireOriginalControllerBody: actual.requireOriginalControllerBody, requireOriginalActorSql: actual.requireOriginalActorSql, continuePlannedController: actual.continuePlannedController, continuePlannedContext: actual.continuePlannedContext, continuePlannedDriver: actual.continuePlannedDriver, continueReadonlyRequest: actual.continueReadonlyRequest, assertCurrent: actual.assertCurrent, fail: actual.fail });
    return Object.freeze({ origin: captured.origin, bindings });
  }
  async #beginSelectedMainObservation<O extends CurrentSelectedProjectMainOrigin>(origin: O): Promise<Readonly<{ origin: O; bindings: CurrentPcbViaMainBackendBindings }>> {
    need(this.#selectedSqlBootstrap !== null && this.#sqlReady && this.#packet !== null && issued.get(this.#packet) === this &&
      this.#viaMainOrigin === null && !this.#busy && !this.#originAttempted && !this.#structureAttempted && this.#sqlHeld === null &&
      this.#pause?.resumed === true && this.#appScriptId !== null && this.#appSource !== null && this.#sourceArray !== null && this.#retainedArray !== null, "VIA_MAIN_ORIGINAL_CURSOR");
    const driver = [...this.#sqlBreakpoints].find(([, site]) => site === "driver")?.[0]; need(driver !== undefined, "VIA_MAIN_PERSISTENT_DRIVER");
    this.#busy = true;
    try {
      qualifyCurrentPcbViaMainLiveHistorySource(this.#appSource);
      const source = qualifyCurrentFootprintCopyMainRequestSource(this.#appSource);
      this.#viaMainOrigin = origin; this.#viaMainNormal = 1;
      const reproof = await this.#request({ phase: "via-main-construction-require", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: this.#sourceArray,
        functionDeclaration: CALLS.require.program, arguments: [{ objectId: this.#retainedArray }], returnByValue: true } });
      z.object({ result: z.object({ type: z.literal("boolean"), value: z.literal(true) }).strict() }).strict().parse(reproof);
      const same = (): void => { need(this.#viaMainOrigin === origin && this.#selectedSqlBootstrap !== null && !this.#failed && !this.#viaMainGroupReleased, "VIA_MAIN_ORIGINAL"); requireCurrentFootprintCopyMainRequestSource(source); this.#same(false); };
      need(this.#sqlCapture !== null, "VIA_BEGIN_SQL_CAPTURE");
      const actorSql = (): Readonly<{ actorObjectId: string; sqlObjectId: string; dataStr: string }> => {
        same(); need(this.#pause !== null && this.#viaMainActorPacket !== null && this.#viaMainSqlPacket !== null && this.#viaMainQueryQualified &&
          this.#viaMainActorValue !== null && this.#viaMainControllerStepConsumed && this.#viaExpectedBody !== null, "VIA_MAIN_ACTOR_SQL_REQUIRED"); this.#viaPoint(this.#pause, "editHead");
        return Object.freeze({ actorObjectId: this.#viaMainActorPacket, sqlObjectId: this.#viaMainSqlPacket, dataStr: this.#viaExpectedBody.dataStr });
      };
      const begin = new CurrentPcbViaMainBeginCustody({ origin, scriptId: this.#appScriptId, captureObjectId: this.#sqlCapture, assertCurrent: same, actorSql,
        pause: (): CurrentPcbViaMainBeginPause => { same(); const pause = this.#pause; need(pause !== null && pause === this.#viaMainDeliveredPause, "VIA_BEGIN_ORIGINAL_PAUSE");
          return Object.freeze({ identity: pause, frameId: pause.frameId, raw: this.#viaMainDeliveredEvent, sqlSite: pause.sqlSite ?? null, pendingEvents: this.#viaMainEvents.length, resumed: pause.resumed, resumeAttempted: pause.resumeAttempted }); },
        pendingRequestId: (): number | null => this.#pendingId, busy: (): boolean => this.#busy,
        send: (command, cleanup): Promise<unknown> => this.#request(command, cleanup),
        registerPoint: (id, pointLocation): void => { need(!this.#viaMainPoints.has(id) && !this.#sqlBreakpoints.has(id), "VIA_BEGIN_POINT_ALIAS"); this.#viaMainPoints.set(id, pointLocation); this.#viaMainOriginalPoints.set(id, pointLocation); },
        pointCurrent: (id): boolean => this.#viaMainPoints.has(id),
        removePoint: (id): void => { need(this.#viaMainPoints.delete(id), "VIA_BEGIN_POINT_REMOVED"); },
        resume: async (identity, command): Promise<unknown> => {
          const pause = this.#pause; need(pause !== null && pause === identity && pause === this.#viaMainDeliveredPause && !pause.resumeAttempted && !pause.resumed && this.#viaMainEvents.length === 0, "VIA_BEGIN_RESUME_OWNER");
          pause.resumeAttempted = true; const reply = await this.#request(command); await this.#wait(() => pause.resumed); same();
          const resumed = this.#viaMainEvents.shift(); need(resumed?.method === "Debugger.resumed", "VIA_BEGIN_ORIGINAL_RESUMED"); empty.parse(resumed.params);
          this.#viaMainDeliveredPause = null; if (this.#sqlHeld === pause) { this.#sqlHeld = null; } return reply;
        } }); this.#viaBeginCustody = begin;
      const structure = new CurrentPcbViaMainStructureCustody({ origin, scriptId: this.#appScriptId, constructionObjectId: this.#retainedArray, sqlCaptureObjectId: this.#sqlCapture, assertCurrent: same,
        baseline: (): CurrentGeneratedProjectHistorySqlBaseline => { same(); need(this.#viaInitialHistoryBaseline !== null, "VIA_STRUCTURE_INITIAL_BASELINE_REQUIRED"); return this.#viaInitialHistoryBaseline; },
        expected: (): CurrentPcbViaMainStructureExpected => { same(); need(this.#viaStructureExpected !== null, "VIA_STRUCTURE_ORIGINAL_BODY_REQUIRED"); return this.#viaStructureExpected; },
        lendCallback: (): ReturnType<CurrentPcbViaMainBeginCustody["lendOriginalCallbackBeforeBegin"]> => begin.lendOriginalCallbackBeforeBegin(), returnCallback: (loan): void => { begin.returnOriginalCallbackBeforeBegin(loan); },
        requireRequest: (packet): void => { same(); this.requireOriginalSelectedMainRequest(packet); const record = selectedRequestPackets.get(packet); need(record !== undefined && record.pause === this.#viaMainDeliveredPause, "VIA_STRUCTURE_ORIGINAL_DELIVERED_REQUEST"); },
        pause: (): CurrentPcbViaMainBeginPause => { same(); const pause = this.#pause; need(pause !== null && pause === this.#viaMainDeliveredPause, "VIA_STRUCTURE_ORIGINAL_PAUSE"); return Object.freeze({ identity: pause, frameId: pause.frameId, raw: this.#viaMainDeliveredEvent, sqlSite: pause.sqlSite ?? null, pendingEvents: this.#viaMainEvents.length, resumed: pause.resumed, resumeAttempted: pause.resumeAttempted }); },
        pendingRequestId: (): number | null => this.#pendingId, busy: (): boolean => this.#busy,
        send: (command, cleanup): Promise<unknown> => this.#request(command, cleanup),
        registerPoint: (id, pointLocation): void => { need(!this.#viaMainPoints.has(id) && !this.#sqlBreakpoints.has(id), "VIA_STRUCTURE_POINT_ALIAS"); this.#viaMainPoints.set(id, pointLocation); this.#viaMainOriginalPoints.set(id, pointLocation); },
        pointCurrent: (id): boolean => this.#viaMainPoints.has(id), removePoint: (id): void => { need(this.#viaMainPoints.delete(id), "VIA_STRUCTURE_POINT_REMOVED"); },
        resume: async (identity, command): Promise<unknown> => { const pause = this.#pause; need(pause !== null && pause === identity && pause === this.#viaMainDeliveredPause && !pause.resumeAttempted && !pause.resumed && this.#viaMainEvents.length === 0, "VIA_STRUCTURE_RESUME_OWNER");
          pause.resumeAttempted = true; const reply = await this.#request(command); await this.#wait(() => pause.resumed); same(); const resumed = this.#viaMainEvents.shift(); need(resumed?.method === "Debugger.resumed", "VIA_STRUCTURE_ORIGINAL_RESUMED"); empty.parse(resumed.params); this.#viaMainDeliveredPause = null; if (this.#sqlHeld === pause) { this.#sqlHeld = null; } return reply;
        } }); this.#viaStructureCustody = structure;
      const history = new CurrentPcbViaMainHistoryCustody({ origin, scriptId: this.#appScriptId, captureObjectId: this.#sqlCapture, assertCurrent: same,
        baseline: (): CurrentGeneratedProjectHistorySqlBaseline => { same(); need(this.#viaInitialHistoryBaseline !== null, "VIA_HISTORY_INITIAL_BASELINE_REQUIRED"); return this.#viaInitialHistoryBaseline; },
        handoff: (): CurrentPcbViaMainHistoryHandoff => begin.consumeHistoryHandoff(), actorValue: (): Readonly<{ uuid: string; username: string; nickname: string; updateTime: number }> => { same(); need(this.#viaMainActorValue !== null, "VIA_HISTORY_ACTOR_REQUIRED"); return this.#viaMainActorValue; },
        pause: (): CurrentPcbViaMainBeginPause => { same(); const pause = this.#pause; need(pause !== null && pause === this.#viaMainDeliveredPause, "VIA_HISTORY_ORIGINAL_PAUSE");
          return Object.freeze({ identity: pause, frameId: pause.frameId, raw: this.#viaMainDeliveredEvent, sqlSite: pause.sqlSite ?? null, pendingEvents: this.#viaMainEvents.length, resumed: pause.resumed, resumeAttempted: pause.resumeAttempted }); },
        pendingRequestId: (): number | null => this.#pendingId, busy: (): boolean => this.#busy,
        send: (command, cleanup): Promise<unknown> => this.#request(command, cleanup),
        registerPoint: (id, pointLocation): void => { need(!this.#viaMainPoints.has(id) && !this.#sqlBreakpoints.has(id), "VIA_HISTORY_POINT_ALIAS"); this.#viaMainPoints.set(id, pointLocation); this.#viaMainOriginalPoints.set(id, pointLocation); },
        pointCurrent: (id): boolean => this.#viaMainPoints.has(id), removePoint: (id): void => { need(this.#viaMainPoints.delete(id), "VIA_HISTORY_POINT_REMOVED"); },
        resume: async (identity, command): Promise<unknown> => {
          const pause = this.#pause; need(pause !== null && pause === identity && pause === this.#viaMainDeliveredPause && !pause.resumeAttempted && !pause.resumed && this.#viaMainEvents.length === 0, "VIA_HISTORY_RESUME_OWNER");
          pause.resumeAttempted = true; const reply = await this.#request(command); await this.#wait(() => pause.resumed); same();
          const resumed = this.#viaMainEvents.shift(); need(resumed?.method === "Debugger.resumed", "VIA_HISTORY_ORIGINAL_RESUMED"); empty.parse(resumed.params);
          this.#viaMainDeliveredPause = null; if (this.#sqlHeld === pause) { this.#sqlHeld = null; } return reply;
        } }); this.#viaHistoryCustody = history;
      const liveHistory = new CurrentPcbViaMainLiveHistoryCustody({ scriptId: this.#appScriptId, sqlCaptureObjectId: this.#sqlCapture,
        assertCurrent: same,
        effects: (): CurrentProjectHistorySqlEffects => { same(); return history.result(); },
        pause: (): CurrentPcbViaMainBeginPause => { same(); const pause = this.#pause; need(pause !== null && pause === this.#viaMainDeliveredPause, "VIA_LIVE_ORIGINAL_PAUSE"); return Object.freeze({ identity: pause, frameId: pause.frameId, raw: this.#viaMainDeliveredEvent, sqlSite: pause.sqlSite ?? null, pendingEvents: this.#viaMainEvents.length, resumed: pause.resumed, resumeAttempted: pause.resumeAttempted }); },
        pendingRequestId: (): number | null => this.#pendingId, busy: (): boolean => this.#busy,
        send: (command, cleanup): Promise<unknown> => this.#request(command, cleanup),
        registerPoint: (id, pointLocation): void => { need(!this.#viaMainPoints.has(id) && !this.#sqlBreakpoints.has(id), "VIA_LIVE_POINT_ALIAS"); this.#viaMainPoints.set(id, pointLocation); this.#viaMainOriginalPoints.set(id, pointLocation); },
        pointCurrent: (id): boolean => this.#viaMainPoints.has(id), removePoint: (id): void => { need(this.#viaMainPoints.delete(id), "VIA_LIVE_POINT_REMOVED"); },
        resume: async (identity, command): Promise<unknown> => {
          const pause = this.#pause; need(pause !== null && pause === identity && pause === this.#viaMainDeliveredPause && !pause.resumeAttempted && !pause.resumed && this.#viaMainEvents.length === 0 && this.#sqlHeld === null, "VIA_LIVE_RESUME_OWNER");
          pause.resumeAttempted = true; const reply = await this.#request(command); await this.#wait(() => pause.resumed); same();
          const resumed = this.#viaMainEvents.shift(); need(resumed?.method === "Debugger.resumed", "VIA_LIVE_ORIGINAL_RESUMED"); empty.parse(resumed.params); this.#viaMainDeliveredPause = null; return reply;
        } }); this.#viaLiveHistoryCustody = liveHistory;
      const bindings: CurrentPcbViaMainBackendBindings = Object.freeze({ scriptId: this.#appScriptId, constructionObjectId: this.#retainedArray, source, persistentDriverBreakpointId: driver, sqlCaptureObjectId: this.#sqlCapture,
        structureRequest: async (input: CurrentPcbViaMainStructureCommand, cleanup: boolean): Promise<unknown> => {
          same(); if (this.#viaMainReadonlyService !== null) { await this.#viaMainReadonlyService; same(); } need(!this.#busy, "VIA_STRUCTURE_BUSY"); const command = validateCurrentPcbViaMainStructureCommand(input);
          if (command.phase === "via-main-structure-arm") { this.#viaMainArming = command.params.location; }
          else if (command.phase === "via-main-structure-final-arm") { this.#viaMainArming = { scriptId: this.#appScriptId ?? "", lineNumber: VIA_STRUCTURE_SITES.finalEntry.lineNumber, columnNumber: VIA_STRUCTURE_SITES.finalEntry.columnNumber }; }
          this.#busy = true; try { return await structure.request(command, cleanup); } catch (error) { this.#fail(error); throw error; } finally { this.#viaMainArming = null; this.#busy = false; }
        }, requireStructureArmed: (): void => { same(); structure.requireArmed(); },
        startStructure: (request: CurrentSelectedFileMainRequestObservation): void => { same(); need(!this.#busy, "VIA_STRUCTURE_START_BUSY"); structure.start(request); },
        structureExpected: (): CurrentPcbViaMainStructureExpected => { same(); need(this.#viaStructureExpected !== null, "VIA_STRUCTURE_EXPECTED_BODY_REQUIRED"); return this.#viaStructureExpected; },
        originalStructureEffects: (): CurrentProjectStructureSqlEffects => { same(); return structure.result(); },
        liveHistoryRequest: async (input: CurrentPcbViaMainLiveHistoryCommand, cleanup: boolean): Promise<unknown> => {
          same(); if (this.#viaMainReadonlyService !== null) { await this.#viaMainReadonlyService; same(); } need(!this.#busy, "VIA_LIVE_BUSY"); const command = validateCurrentPcbViaMainLiveHistoryCommand(input);
          if (command.phase === "via-main-live-arm") { this.#viaMainArming = command.params.location; }
          this.#busy = true; try { return await liveHistory.request(command, cleanup); } catch (error) { this.#fail(error); throw error; } finally { this.#viaMainArming = null; this.#busy = false; }
        }, originalLiveHistoryRequestObjectId: (): string => { same(); history.result(); return liveHistory.originalRequestObjectId(); }, originalLiveHistoryRows: (): CurrentPcbViaMainLiveHistoryRows => { same(); return liveHistory.result(); },
        historyRequest: async (input: CurrentPcbViaMainHistoryCommand, cleanup: boolean): Promise<unknown> => {
          same(); if (this.#viaMainReadonlyService !== null) { await this.#viaMainReadonlyService; same(); } need(!this.#busy, "VIA_HISTORY_BUSY"); const command = validateCurrentPcbViaMainHistoryCommand(input);
          if (command.phase === "via-main-history-arm") { need(this.#viaExpectedBody === null, "VIA_HISTORY_PRE_SAVE_ARM_REQUIRED"); this.#viaMainArming = command.params.location; }
          else if (command.phase === "via-main-history-callback-arm") { this.#viaMainArming = { scriptId: this.#appScriptId ?? "", lineNumber: VIA_HISTORY_SITES.callback.lineNumber, columnNumber: VIA_HISTORY_SITES.callback.columnNumber }; }
          this.#busy = true; try { return await history.request(command, cleanup); } catch (error) { this.#fail(error); throw error; } finally { this.#viaMainArming = null; this.#busy = false; }
        }, requireHistoryArmed: (): void => { same(); history.requireArmed(); }, startHistory: (): Readonly<{ transactionObjectId: string; callbackBreakpointId: string }> => { same(); need(!this.#busy, "VIA_HISTORY_START_BUSY"); return history.start(); }, originalHistoryEffects: (): CurrentProjectHistorySqlEffects => { same(); return history.result(); },
          beginRequest: async (input: CurrentPcbViaMainBeginCommand, cleanup: boolean): Promise<unknown> => {
          same(); if (this.#viaMainReadonlyService !== null) { await this.#viaMainReadonlyService; same(); } need(!this.#busy, "VIA_BEGIN_BUSY"); const command = validateCurrentPcbViaMainBeginCommand(input);
          if (command.phase === "via-main-begin-arm") { need(this.#viaExpectedBody === null, "VIA_BEGIN_PRE_SAVE_ARM_REQUIRED"); this.#viaMainArming = command.params.location; }
          this.#busy = true; try { return await begin.request(command, cleanup); } catch (error) { this.#fail(error); throw error; } finally { this.#viaMainArming = null; this.#busy = false; }
        }, requireBeginArmed: () => { same(); begin.requireArmed(); }, originalBeginResult: () => { same(); return begin.result(); },
        assertCurrent: async (): Promise<void> => { same(); await this.#current(); same(); }, fail: (): void => { this.#fail(new Error("VIA_MAIN_OBSERVER_FAILED")); },
        observeRequest: async (): Promise<CurrentSelectedFileMainRequestObservation> => {
          same(); this.requireViaMainObservationArmed(origin); const pause = this.#viaMainDeliveredPause;
          need(pause !== null && this.#pause === pause && pause.sqlSite === "driver" && this.#viaMainEvents.length === 0, "VIA_MAIN_DELIVERED_DRIVER_REQUIRED"); this.#busy = true;
          try { const packet = await this.#observeSelectedMainRequest(pause); same(); return packet; }
          catch (error) { this.#fail(error); throw error; } finally { this.#busy = false; }
        }, requireOriginalRequest: (packet: CurrentSelectedFileMainRequestObservation): void => {
          same(); this.requireOriginalSelectedMainRequest(packet); const actual = selectedRequestPackets.get(packet);
          need(actual !== undefined && this.#viaMainDeliveredPause === actual.pause, "VIA_MAIN_ORIGINAL_DELIVERED_REQUEST");
        }, continueReadonlyRequest: async (packet: CurrentSelectedFileMainRequestObservation): Promise<void> => {
          same(); this.requireViaMainObservationArmed(origin); this.requireOriginalSelectedMainRequest(packet); const actual = selectedRequestPackets.get(packet);
          need(actual !== undefined && this.#viaMainDeliveredPause === actual.pause && this.#viaMainEvents.length === 0, "VIA_MAIN_ORIGINAL_DELIVERED_REQUEST"); this.#busy = true;
          try {
            await this.#continueSelectedReadonlyRequest(packet); same(); const resumed = this.#viaMainEvents.shift();
            need(actual.pause.resumeAttempted && actual.pause.resumed && resumed?.method === "Debugger.resumed", "VIA_MAIN_READONLY_ORIGINAL_RESUMED");
            empty.parse(resumed.params); this.#viaMainDeliveredPause = null;
          } catch (error) { this.#fail(error); throw error; } finally { this.#busy = false; }
        },
        continuePlannedDriver: async (packet: CurrentSelectedFileMainRequestObservation): Promise<void> => {
          same(); this.#requireViaNextPoint(origin, "context"); this.requireOriginalSelectedMainRequest(packet);
          const actual = selectedRequestPackets.get(packet), expected = this.#viaExpectedBody;
          need(actual !== undefined && expected !== null && this.#viaMainDeliveredPause === actual.pause && this.#viaMainEvents.length === 0 && this.#viaMainDriverStep === null &&
            packet.mode === "fetch" && packet.method === "POST" && packet.pureQuery === "" && packet.pathHeader === expected.projectKey &&
            packet.pureUrl === `/api/v4/projects/${expected.projectUuid}/branches/${expected.branchUuid}/histories`, "VIA_MAIN_ORIGINAL_HISTORY_DRIVER");
          this.#busy = true; this.#viaMainDriverStep = Object.freeze({ origin, request: packet, pause: actual.pause, expected }); actual.pause.resumeAttempted = true;
          try {
            empty.parse(await this.#request({ phase: "via-main-driver-step", method: "Debugger.resume", params: {} })); await this.#wait(() => actual.pause.resumed); same();
            const resumed = this.#viaMainEvents.shift(); need(this.#viaMainDriverStepConsumed && resumed?.method === "Debugger.resumed", "VIA_MAIN_DRIVER_ORIGINAL_RESUMED");
            empty.parse(resumed.params); this.#viaMainDeliveredPause = null; if (this.#sqlHeld === actual.pause) { this.#sqlHeld = null; }
          } catch (error) { this.#fail(error); throw error; } finally { this.#busy = false; }
        },
        requireOriginalControllerBody: (): void => {
          same(); need(this.#pause !== null && this.#viaMainControllerPacket !== null && this.#viaMainContextStepConsumed && this.#viaExpectedBody !== null, "VIA_MAIN_CONTROLLER_BODY_REQUIRED"); this.#viaPoint(this.#pause, "controller");
        },
        requireOriginalActorSql: actorSql,
        continuePlannedController: async (): Promise<void> => {
          same(); this.#requireViaNextPoint(origin, "editHead"); const expected = this.#viaExpectedBody, pause = this.#pause;
          need(pause !== null && expected !== null && this.#viaMainDeliveredPause === pause && this.#viaMainEvents.length === 0 && this.#viaMainControllerStep === null &&
            this.#viaMainPbQualified && this.#viaMainControllerPacket !== null && this.#viaMainContextStepConsumed && this.#viaMainContextStep?.pause.resumed === true &&
            !pause.resumeAttempted && !pause.resumed, "VIA_MAIN_ORIGINAL_JOINED_CONTROLLER"); this.#viaPoint(pause, "controller");
          this.#busy = true; this.#viaMainControllerStep = Object.freeze({ origin, pause, expected }); pause.resumeAttempted = true;
          try {
            empty.parse(await this.#request({ phase: "via-main-controller-step", method: "Debugger.resume", params: {} })); await this.#wait(() => pause.resumed); same();
            const resumed = this.#viaMainEvents.shift(); need(this.#viaMainControllerStepConsumed && resumed?.method === "Debugger.resumed", "VIA_MAIN_CONTROLLER_ORIGINAL_RESUMED");
            empty.parse(resumed.params); this.#viaMainDeliveredPause = null;
          } catch (error) { this.#fail(error); throw error; } finally { this.#busy = false; }
        },
        continuePlannedContext: async (): Promise<void> => {
          same(); this.#requireViaNextPoint(origin, "controller"); const expected = this.#viaExpectedBody, pause = this.#pause;
          need(pause !== null && expected !== null && this.#viaMainDeliveredPause === pause && this.#viaMainEvents.length === 0 && this.#viaMainContextStep === null &&
            this.#viaMainContextJoined && this.#viaMainContextPacket !== null && this.#viaMainDriverStepConsumed && this.#viaMainDriverStep?.pause.resumed === true &&
            !pause.resumeAttempted && !pause.resumed, "VIA_MAIN_ORIGINAL_JOINED_CONTEXT"); this.#viaPoint(pause, "context");
          this.#busy = true; this.#viaMainContextStep = Object.freeze({ origin, pause, expected }); pause.resumeAttempted = true;
          try {
            empty.parse(await this.#request({ phase: "via-main-context-step", method: "Debugger.resume", params: {} })); await this.#wait(() => pause.resumed); same();
            const resumed = this.#viaMainEvents.shift(); need(this.#viaMainContextStepConsumed && resumed?.method === "Debugger.resumed", "VIA_MAIN_CONTEXT_ORIGINAL_RESUMED");
            empty.parse(resumed.params); this.#viaMainDeliveredPause = null;
          } catch (error) { this.#fail(error); throw error; } finally { this.#busy = false; }
        },
        request: async (input: CurrentPcbViaMainCommand, cleanup: boolean): Promise<unknown> => {
          same(); if (this.#viaMainReadonlyService !== null) { await this.#viaMainReadonlyService; same(); } need(!this.#busy, "VIA_MAIN_COMMAND_BUSY"); const command = validateCurrentPcbViaMainCommand(input);
          const removing = command.method === "Debugger.removeBreakpoint"; const releasing = command.method === "Runtime.releaseObjectGroup";
          need(cleanup === (removing || releasing), "VIA_MAIN_COMMAND_LANE");
          if (cleanup) { this.#viaMainCleanup += 1; const point = typeof command.params["breakpointId"] === "string" ? this.#viaMainPoints.get(command.params["breakpointId"]) : undefined;
            const context = CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_COLLECTION_SITES.context, pause = this.#pause;
            const joinedContext = removing && pause !== null && !pause.resumeAttempted && !pause.resumed && this.#viaMainDeliveredPause === pause && this.#viaMainContextJoined && point !== undefined &&
              canonicalJson(point) === canonicalJson(pause.location) && point.lineNumber === context.lineNumber && point.columnNumber === context.columnNumber;
            need(this.#viaMainCleanup <= VIA_REQUESTS.cleanup && (pause === null || pause.resumed || joinedContext), "VIA_MAIN_CLEANUP_HELD"); }
          else { this.#viaMainNormal += 1; need(this.#viaMainNormal <= VIA_REQUESTS.normal, "VIA_MAIN_NORMAL_BOUND"); }
          if (command.method === "Debugger.evaluateOnCallFrame") { need(typeof command.params["callFrameId"] === "string" && this.#viaMainFrames.has(command.params["callFrameId"]) && this.#pause?.resumed === false, "VIA_MAIN_FRAME_OWNER"); }
          if (removing) { need(typeof command.params["breakpointId"] === "string" && this.#viaMainRequestPoints.has(command.params["breakpointId"]) && this.#viaMainPoints.has(command.params["breakpointId"]), "VIA_MAIN_PERSISTENT_POINT"); }
          let arming: z.infer<typeof location> | null = null;
          if (command.method === "Debugger.setBreakpoint") { arming = location.parse(command.params["location"]); need(arming.scriptId === this.#appScriptId, "VIA_MAIN_SOURCE_SCRIPT"); }
          this.#busy = true; this.#viaMainArming = arming;
          try {
            const raw = await this.#request(command, cleanup); const reply = captureCurrentPcbStringClockReply(raw).value;
            this.#retainViaRequestReply(command, reply);
            if (arming !== null) { const allocated = z.object({ breakpointId: handle, actualLocation: location }).strict().parse(reply);
              need(canonicalJson(allocated.actualLocation) === canonicalJson(arming) && !this.#sqlBreakpoints.has(allocated.breakpointId) && !this.#viaMainPoints.has(allocated.breakpointId), "VIA_MAIN_ARM_REPLY"); this.#viaMainPoints.set(allocated.breakpointId, arming); this.#viaMainRequestPoints.add(allocated.breakpointId); this.#viaMainOriginalPoints.set(allocated.breakpointId, arming); }
            if (removing) { empty.parse(reply); need(typeof command.params["breakpointId"] === "string", "VIA_MAIN_POINT"); this.#viaMainPoints.delete(command.params["breakpointId"]); }
            if (releasing) { empty.parse(reply); } same(); if (releasing) { this.#viaMainGroupReleased = true; } return reply;
          } catch (error) { this.#fail(error); throw error; } finally { this.#viaMainArming = null; this.#busy = false; }
        }, nextEvent: async (): Promise<CurrentPcbViaMainEvent> => {
          same(); if (this.#viaMainReadonlyService !== null) { await this.#viaMainReadonlyService; same(); } need(!this.#busy, "VIA_MAIN_EVENT_BUSY"); this.#busy = true; const started = performance.now();
          try { while (this.#viaMainEvents.length === 0) { need(performance.now() - started < 20_000, "VIA_MAIN_EVENT_DEADLINE"); await this.#pump(); same(); }
            const event = this.#viaMainEvents.shift(); need(event !== undefined, "VIA_MAIN_EVENT");
            if (event.method === "Debugger.paused") { need(this.#pause !== null && !this.#pause.resumed && this.#viaMainDeliveredPause === null, "VIA_MAIN_DELIVERY_OVERLAP"); this.#viaMainDeliveredPause = this.#pause; this.#viaMainDeliveredEvent = event.params; }
            return event;
          } catch (error) { this.#fail(error); throw error; } finally { this.#busy = false; }
        } });
      return Object.freeze({ origin, bindings });
    } catch (error) { this.#fail(error); throw error; } finally { this.#busy = false; }
  }
  #viaPoint(pause: Pause, role: "context" | "controller" | "editHead"): ReturnType<typeof decodeViaPause> {
    const expected = CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_COLLECTION_SITES[role];
    need(pause.location.scriptId === this.#appScriptId && pause.location.lineNumber === expected.lineNumber && pause.location.columnNumber === expected.columnNumber &&
      pause.sqlSite === undefined && this.#viaMainDeliveredPause === pause && !pause.resumed, "VIA_MAIN_ORIGINAL_POINT");
    const point = [...this.#viaMainOriginalPoints].find(([, value]) => value.lineNumber === expected.lineNumber && value.columnNumber === expected.columnNumber)?.[0];
    need(point !== undefined && this.#appScriptId !== null, "VIA_MAIN_ORIGINAL_POINT_ID");
    return decodeViaPause(this.#viaMainDeliveredEvent, role, this.#appScriptId, point);
  }
  #retainViaRequestReply(command: CurrentPcbViaMainCommand, reply: unknown): void {
    const array = (length: number): string => { const value = objectReply.parse(reply); need(value.result.description === `Array(${String(length)})`, "VIA_MAIN_ORIGINAL_REPLY_ARRAY"); return value.result.objectId; };
    if (command.phase === "via-main-request-frame" && (command.params["expression"] === VIA_FRAMES.editHead || command.params["expression"] === VIA_FRAMES.actor)) {
      need(this.#pause !== null && this.#viaMainControllerStepConsumed, "VIA_MAIN_ORIGINAL_ACTOR_FRAME"); const pause = this.#viaPoint(this.#pause, "editHead");
      const role = command.params["expression"] === VIA_FRAMES.editHead ? "editHead" : "actor";
      need(!this.#viaMainActorFrames.has(role) && command.params["callFrameId"] === (role === "editHead" ? pause.frameId : pause.callerFrameId), "VIA_MAIN_ORIGINAL_ACTOR_FRAME_ID");
      this.#viaMainActorFrames.set(role, array(role === "editHead" ? 1 : 9));
    } else if (command.phase === "via-main-request-properties") {
      const id = command.params["objectId"];
      if (id === this.#viaMainControllerPacket) { need(this.#pause !== null && !this.#viaMainPbQualified && this.#viaMainPbFunction === null, "VIA_MAIN_ORIGINAL_PB_MEMBER"); this.#viaPoint(this.#pause, "controller"); this.#viaMainPbFunction = decodeViaMember(reply, 12, 8, "editHead"); }
      else if (id === this.#viaMainPbFunction) { need(this.#pause !== null && !this.#viaMainPbQualified && this.#appScriptId !== null, "VIA_MAIN_ORIGINAL_PB_FUNCTION"); this.#viaPoint(this.#pause, "controller"); decodeViaFunction(reply, "editHead", this.#appScriptId); this.#viaMainPbQualified = true; }
      else if (id === this.#viaMainActorPacket) { need(this.#pause !== null && this.#viaMainActorPromise === null, "VIA_MAIN_ORIGINAL_ACTOR_PROMISE"); this.#viaPoint(this.#pause, "editHead"); this.#viaMainActorPromise = decodeViaMember(reply, 10, 6, "promise"); }
      else if (id === this.#viaMainActorPromise) { need(this.#pause !== null && this.#viaMainSqlOwner === null, "VIA_MAIN_ORIGINAL_FULFILLED_PROMISE"); this.#viaPoint(this.#pause, "editHead"); this.#viaMainSqlOwner = decodeViaPromise(reply); }
      else if (id === this.#viaMainSqlPacket) { need(this.#pause !== null && this.#viaMainQueryFunction === null, "VIA_MAIN_ORIGINAL_QUERY_MEMBER"); this.#viaPoint(this.#pause, "editHead"); this.#viaMainQueryFunction = decodeViaMember(reply, 7, 6, "sqlQueryOne"); }
      else if (id === this.#viaMainQueryFunction) { need(this.#pause !== null && !this.#viaMainQueryQualified && this.#appScriptId !== null, "VIA_MAIN_ORIGINAL_QUERY_FUNCTION"); this.#viaPoint(this.#pause, "editHead"); decodeViaFunction(reply, "sqlQueryOne", this.#appScriptId); this.#viaMainQueryQualified = true; }
    } else if (command.phase === "via-main-request-actor") {
      need(this.#pause !== null && this.#viaMainActorPacket === null && this.#viaMainControllerStepConsumed && this.#viaMainControllerPacket !== null, "VIA_MAIN_ORIGINAL_ACTOR_CAPTURE"); this.#viaPoint(this.#pause, "editHead");
      const args = z.tuple([z.strictObject({ objectId: handle }), z.strictObject({ objectId: handle })]).parse(command.params["arguments"]);
      need(command.params["objectId"] === this.#viaMainActorFrames.get("editHead") && args[0].objectId === this.#viaMainActorFrames.get("actor") && args[1].objectId === this.#viaMainControllerPacket, "VIA_MAIN_ORIGINAL_ACTOR_ARGUMENTS");
      this.#viaMainActorPacket = array(10);
    } else if (command.phase === "via-main-request-sql") {
      need(this.#pause !== null && this.#viaMainActorPacket !== null && this.#viaMainSqlOwner !== null && this.#viaMainSqlPacket === null, "VIA_MAIN_ORIGINAL_SQL_CAPTURE"); this.#viaPoint(this.#pause, "editHead");
      const args = z.tuple([z.strictObject({ objectId: handle })]).parse(command.params["arguments"]);
      need(command.params["objectId"] === this.#viaMainActorPacket && args[0].objectId === this.#viaMainSqlOwner, "VIA_MAIN_ORIGINAL_SQL_ARGUMENTS"); this.#viaMainSqlPacket = array(7);
    } else if (command.phase === "via-main-request-value") {
      need(this.#pause !== null && this.#viaMainActorPacket !== null && this.#viaMainSqlPacket !== null && this.#viaMainQueryQualified && this.#viaMainActorValue === null && command.params["objectId"] === this.#viaMainActorPacket, "VIA_MAIN_ORIGINAL_ACTOR_VALUE");
      this.#viaPoint(this.#pause, "editHead"); this.#viaMainActorValue = decodeViaValue(reply);
    } else if (command.phase === "via-main-request-invocation") {
      need(this.#pause?.sqlSite === "driver" && !this.#pause.resumeAttempted && this.#viaMainDeliveredPause === this.#pause && this.#viaMainInvocation === null, "VIA_MAIN_ORIGINAL_INVOCATION_CAPTURE");
      const args = z.tuple([z.strictObject({ objectId: handle }), z.strictObject({ objectId: handle })]).parse(command.params["arguments"]);
      need(args[0].objectId === this.#retainedArray, "VIA_MAIN_ORIGINAL_CONSTRUCTION_ARGUMENT"); this.#viaMainInvocation = array(6);
    } else if (command.phase === "via-main-request-context") {
      need(this.#pause !== null && this.#viaMainContextPacket === null && this.#viaMainInvocation !== null && this.#viaMainDriverStepConsumed, "VIA_MAIN_ORIGINAL_CONTEXT_CAPTURE"); this.#viaPoint(this.#pause, "context");
      const args = z.tuple([z.strictObject({ objectId: handle })]).parse(command.params["arguments"]); need(args[0].objectId === this.#retainedArray, "VIA_MAIN_ORIGINAL_CONSTRUCTION_ARGUMENT");
      this.#viaMainContextPacket = array(6);
    } else if (command.phase === "via-main-request-context-join") {
      need(this.#pause !== null && this.#viaMainContextPacket !== null && this.#viaMainInvocation !== null && !this.#viaMainContextJoined, "VIA_MAIN_ORIGINAL_CONTEXT_JOIN"); this.#viaPoint(this.#pause, "context");
      const args = z.tuple([z.strictObject({ objectId: handle })]).parse(command.params["arguments"]);
      need(command.params["objectId"] === this.#viaMainInvocation && args[0].objectId === this.#viaMainContextPacket, "VIA_MAIN_ORIGINAL_CONTEXT_ARGUMENTS");
      z.strictObject({ result: z.strictObject({ type: z.literal("boolean"), value: z.literal(true) }) }).parse(reply); this.#viaMainContextJoined = true;
    } else if (command.phase === "via-main-request-controller") {
      need(this.#pause !== null && this.#viaMainContextJoined && this.#viaMainContextPacket !== null && this.#viaExpectedBody !== null && this.#viaMainContextStepConsumed && this.#viaMainControllerPacket === null, "VIA_MAIN_ORIGINAL_CONTROLLER_CAPTURE"); this.#viaPoint(this.#pause, "controller");
      const args = z.tuple([z.strictObject({ objectId: handle }), z.strictObject({ value: currentFootprintCopyMainRequestPlanSchema })]).parse(command.params["arguments"]);
      need(args[0].objectId === this.#viaMainContextPacket && canonicalJson(args[1].value) === canonicalJson(this.#viaExpectedBody), "VIA_MAIN_ORIGINAL_CONTROLLER_BODY"); this.#viaMainControllerPacket = array(12);
    }
  }
  public consumeOriginalViaMainStructure(command: CurrentPcbViaMainStructureCommand, requestId: number): Readonly<{ origin: CurrentSelectedProjectMainOrigin; expected: CurrentPcbViaMainStructureExpected; role: CurrentPcbViaMainStructureStep }> {
    need(this.#viaStructureCustody !== null && this.#sqlReady && this.#sqlBreakpoints.size === SQL_SITES.length + 2 && SQL_SITES.every(site => [...this.#sqlBreakpoints.values()].includes(site)), "VIA_STRUCTURE_ORIGINAL_CUSTODY"); return this.#viaStructureCustody.consume(command, requestId);
  }
  public requireViaStructureCompleted(origin: CurrentSelectedProjectMainOrigin): CurrentProjectStructureSqlEffects {
    this.#same(false); need(origin === this.#viaMainOrigin && this.#viaStructureCustody !== null && this.#sqlReady && this.#sqlBreakpoints.size === SQL_SITES.length + 2 && SQL_SITES.every(site => [...this.#sqlBreakpoints.values()].includes(site)), "VIA_STRUCTURE_ORIGINAL_COMPLETION"); return this.#viaStructureCustody.result();
  }
  public requireViaExpectedStructure(origin: CurrentSelectedProjectMainOrigin): CurrentPcbViaMainStructureExpected {
    this.#same(false); need(origin === this.#viaMainOrigin && this.#viaStructureExpected !== null, "VIA_STRUCTURE_ORIGINAL_EXPECTED"); return this.#viaStructureExpected;
  }
  public bindViaExpectedStructure(origin: CurrentSelectedProjectMainOrigin, input: CurrentPcbViaMainStructureExpected): void {
    this.#same(false); need(origin === this.#viaMainOrigin && this.#viaStructureCustody !== null && this.#viaStructureExpected === null && this.#viaExpectedBody !== null && !this.#busy && this.#viaInitialHistoryBaseline !== null, "VIA_STRUCTURE_BODY_BIND_ONCE"); this.#viaStructureCustody.requireArmed();
    const expected = currentPcbViaMainStructureExpectedSchema.parse(input); need(expected.projectUuid === this.#viaExpectedBody.projectUuid && expected.branchUuid === this.#viaExpectedBody.branchUuid && expected.ticket > this.#viaInitialHistoryBaseline.structure.ticket, "VIA_STRUCTURE_ORIGINAL_SCOPE"); this.#viaStructureExpected = freezeDeep(expected);
  }
  public consumeOriginalViaMainLiveHistory(command: CurrentPcbViaMainLiveHistoryCommand, requestId: number): void {
    this.#same(false); need(this.#viaLiveHistoryCustody !== null && this.#sqlReady && this.#sqlBreakpoints.size === SQL_SITES.length + 2 && SQL_SITES.every(site => [...this.#sqlBreakpoints.values()].includes(site)), "VIA_LIVE_ORIGINAL_CUSTODY"); this.#viaLiveHistoryCustody.consume(command, requestId);
  }
  public requireViaLiveHistoryRows(origin: CurrentSelectedProjectMainOrigin): CurrentPcbViaMainLiveHistoryRows {
    this.#same(false); need(origin === this.#viaMainOrigin && this.#viaLiveHistoryCustody !== null && this.#sqlReady && this.#sqlBreakpoints.size === SQL_SITES.length + 2 && SQL_SITES.every(site => [...this.#sqlBreakpoints.values()].includes(site)), "VIA_LIVE_ORIGINAL_COMPLETION"); return this.#viaLiveHistoryCustody.result();
  }
  public consumeOriginalViaMainHistory(command: CurrentPcbViaMainHistoryCommand, requestId: number): Readonly<{ origin: CurrentSelectedProjectMainOrigin; dataStr: string; role: CurrentPcbViaMainHistoryStep }> {
    need(this.#viaHistoryCustody !== null && this.#sqlReady && this.#sqlBreakpoints.size === SQL_SITES.length + 2 && SQL_SITES.every(site => [...this.#sqlBreakpoints.values()].includes(site)), "VIA_HISTORY_ORIGINAL_CUSTODY"); return this.#viaHistoryCustody.consume(command, requestId);
  }
  public requireViaHistoryCompleted(origin: CurrentSelectedProjectMainOrigin): CurrentProjectHistorySqlEffects {
    this.#same(false); need(origin === this.#viaMainOrigin && this.#viaHistoryCustody !== null && this.#sqlReady && this.#sqlBreakpoints.size === SQL_SITES.length + 2 && SQL_SITES.every(site => [...this.#sqlBreakpoints.values()].includes(site)), "VIA_HISTORY_ORIGINAL_COMPLETION"); return this.#viaHistoryCustody.result();
  }
  public consumeOriginalViaMainBegin(command: CurrentPcbViaMainBeginCommand, requestId: number): Readonly<{ origin: CurrentSelectedProjectMainOrigin; dataStr: string; nativeSql: boolean }> {
    need(this.#viaBeginCustody !== null, "VIA_BEGIN_ORIGINAL_CUSTODY"); return this.#viaBeginCustody.consume(command, requestId);
  }
  public consumeOriginalViaMainControllerStep(command: CurrentPcbViaMainStepCommand, requestId: number): Readonly<{ origin: CurrentSelectedProjectMainOrigin; dataStr: string }> {
    const grant = this.#viaMainControllerStep; this.#same(false);
    need(grant !== null && !this.#viaMainControllerStepConsumed && command.phase === "via-main-controller-step" && this.#pendingId === requestId && this.#busy &&
      this.#viaMainOrigin === grant.origin && this.#viaExpectedBody === grant.expected && this.#pause === grant.pause && this.#viaMainDeliveredPause === grant.pause &&
      grant.pause.resumeAttempted && !grant.pause.resumed && this.#viaMainPbQualified && this.#viaMainControllerPacket !== null, "VIA_MAIN_ORIGINAL_PENDING_CONTROLLER_GRANT");
    this.#viaMainControllerStepConsumed = true; return Object.freeze({ origin: grant.origin, dataStr: grant.expected.dataStr });
  }
  public consumeOriginalViaMainContextStep(command: CurrentPcbViaMainStepCommand, requestId: number): Readonly<{ origin: CurrentSelectedProjectMainOrigin; dataStr: string }> {
    const grant = this.#viaMainContextStep; this.#same(false);
    need(grant !== null && !this.#viaMainContextStepConsumed && command.phase === "via-main-context-step" && this.#pendingId === requestId && this.#busy &&
      this.#viaMainOrigin === grant.origin && this.#viaExpectedBody === grant.expected && this.#pause === grant.pause && this.#viaMainDeliveredPause === grant.pause &&
      grant.pause.resumeAttempted && !grant.pause.resumed && this.#viaMainContextJoined && this.#viaMainContextPacket !== null, "VIA_MAIN_ORIGINAL_PENDING_CONTEXT_GRANT");
    this.#viaMainContextStepConsumed = true; return Object.freeze({ origin: grant.origin, dataStr: grant.expected.dataStr });
  }
  /** The genuine native sender consumes this pending original call once.
   * A phase string or matching plan cannot create the request/pause lineage. */
  public consumeOriginalViaMainDriverStep(command: CurrentPcbViaMainStepCommand, requestId: number): Readonly<{ origin: CurrentSelectedProjectMainOrigin; dataStr: string }> {
    const grant = this.#viaMainDriverStep; this.#same(false);
    need(grant !== null && !this.#viaMainDriverStepConsumed && command.phase === "via-main-driver-step" && this.#pendingId === requestId && this.#busy &&
      this.#viaMainOrigin === grant.origin && this.#viaExpectedBody === grant.expected && this.#pause === grant.pause && this.#viaMainDeliveredPause === grant.pause &&
      grant.pause.resumeAttempted && !grant.pause.resumed && selectedRequestPackets.get(grant.request)?.pause === grant.pause, "VIA_MAIN_ORIGINAL_PENDING_DRIVER_GRANT");
    this.#viaMainDriverStepConsumed = true; return Object.freeze({ origin: grant.origin, dataStr: grant.expected.dataStr });
  }
  #requireViaNextPoint(origin: CurrentSelectedProjectMainOrigin, role: "context" | "controller" | "editHead"): void {
    this.#same(false); const expected = CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_COLLECTION_SITES[role];
    need(this.#viaMainOrigin === origin && !this.#busy && !this.#failed && !this.#viaMainGroupReleased && this.#viaMainArming === null &&
      [...this.#viaMainPoints.values()].some(point => point.scriptId === this.#appScriptId && point.lineNumber === expected.lineNumber && point.columnNumber === expected.columnNumber), "VIA_MAIN_NEXT_POINT_REQUIRED");
  }
  public requireViaMainObservationArmed(origin: CurrentSelectedProjectMainOrigin): void {
    need(this.#viaMainOrigin === origin && !this.#busy && !this.#failed && !this.#viaMainGroupReleased && (this.#viaMainPoints.size >= 2 && this.#viaMainPoints.size <= VIA_REQUESTS.ownPointRemovals + VIA_BEGIN.sourceArms + VIA_HISTORY.sourceArms + VIA_HISTORY.originalCallbackArm + VIA_STRUCTURE.arms + VIA_STRUCTURE.originalFinalArm + VIA_LIVE_HISTORY.arms) && this.#viaMainArming === null, "VIA_MAIN_SETUP_UNSETTLED");
    for (const role of ["controller", "editHead"] as const) {
      const expected = CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_COLLECTION_SITES[role]; need([...this.#viaMainPoints.values()].some(point => point.scriptId === this.#appScriptId && point.lineNumber === expected.lineNumber && point.columnNumber === expected.columnNumber), "VIA_MAIN_SETUP_POINTS");
    }
  }
  public bindViaInitialHistoryBaseline(origin: CurrentSelectedProjectMainOrigin, input: CurrentGeneratedProjectHistorySqlBaseline): void {
    this.#same(false); need(this.#viaMainOrigin === origin && this.#viaInitialHistoryBaseline === null && !this.#busy && this.#viaMainPoints.size === 0 && this.#viaExpectedBody === null, "VIA_HISTORY_ORIGINAL_INITIAL_BASELINE");
    this.#viaInitialHistoryBaseline = freezeDeep(currentGeneratedProjectHistorySqlBaselineSchema.parse(captureCurrentPcbStringClockReply(input).value));
  }
  public bindViaExpectedHistoryBody(origin: CurrentSelectedProjectMainOrigin, input: unknown): void {
    this.requireViaMainObservationArmed(origin); this.#same(false);
    need(this.#viaExpectedBody === null && this.#sqlHeld === null && this.#pause?.resumed === true, "VIA_MAIN_BODY_BIND_CONSUMED");
    const plan = freezeDeep(currentFootprintCopyMainRequestPlanSchema.parse(captureCurrentPcbStringClockReply(input).value));
    need(plan.path === this.#selectedSqlPath && plan.projectUuid === plan.projectKey, "VIA_MAIN_BODY_SCOPE");
    if (this.#viaInitialHistoryBaseline !== null) { need(this.#viaInitialHistoryBaseline.projectUuid === plan.projectUuid && this.#viaInitialHistoryBaseline.branchUuid === plan.branchUuid, "VIA_HISTORY_INITIAL_BODY_SCOPE"); } this.#viaExpectedBody = plan;
  }
  public requireViaExpectedHistoryBody(origin: CurrentSelectedProjectMainOrigin): Readonly<z.infer<typeof currentFootprintCopyMainRequestPlanSchema>> {
    need(this.#viaMainOrigin === origin && this.#viaExpectedBody !== null && !this.#viaMainGroupReleased, "VIA_MAIN_ORIGINAL_BODY"); this.#same(false); return this.#viaExpectedBody;
  }

  async #reprove(): Promise<void> {
    need(this.#sourceArray !== null && this.#retainedArray !== null && this.#source !== null, "ORIGINAL_CAPTURE_REQUIRED");
    const result = await this.#request({ phase: "require", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: this.#sourceArray,
      functionDeclaration: CALLS.require.program, arguments: [{ objectId: this.#retainedArray }], returnByValue: true } });
    z.object({ result: z.object({ type: z.literal("boolean"), value: z.literal(true) }).strict() }).strict().parse(result);
  }
  public async reprove(packet: CurrentFootprintCopyMainBackendObservation): Promise<void> {
    need(!this.#originAttempted && !this.#structureAttempted && !this.#busy && packet === this.#packet && issued.get(packet) === this, "ORIGINAL_PACKET_REQUIRED"); this.#busy = true;
    try { await this.#reprove(); } catch (error) { this.#fail(error); throw error; } finally { this.#busy = false; }
  }
  /** The native owner admits the fixed head-age phases only for its separate
   * head-age birth. This method cannot grant that birth to another transport.
   * Every actual Date method receives native V8 metadata checks before the one
   * synchronous parser/control call; failures consume the complete attempt. */
  public async prepareHeadAge(nativeRootPid: number): Promise<void> {
    need(this.#headAgeBootstrapCapture && !this.#headAgePreparationAttempted && !this.#originAttempted && !this.#structureAttempted && !this.#busy && this.#packet !== null && issued.get(this.#packet) === this &&
      this.#retainedArray !== null && this.#sourceArray !== null, "HEAD_AGE_CONSUMED");
    this.#headAgePreparationAttempted = true; this.#busy = true;
    try {
      need(Number.isSafeInteger(nativeRootPid) && nativeRootPid > 0 && nativeRootPid <= 4_294_967_295, "HEAD_AGE_NATIVE_ROOT");
      await this.#reprove();
      const captured = objectReply.parse(await this.#request({ phase: "head-age-context-capture", method: "Runtime.callFunctionOn", params: {
        ...FLAGS, objectId: this.#sourceArray, functionDeclaration: CURRENT_FOOTPRINT_HEAD_AGE_CONTEXT_CAPTURE_PROGRAM,
        arguments: [{ objectId: this.#retainedArray }], returnByValue: false } }));
      need(captured.result.description === "Array(4)", "HEAD_AGE_CONTEXT_ARRAY");
      const accessors = decodeCurrentFootprintHeadAgeContextArray(await this.#properties(captured.result.objectId, "head-age-context-array"));
      const getter = decodeCurrentFootprintHeadAgeContextAccessor(await this.#properties(accessors.getter, "head-age-context-getter"), "getter");
      const setter = decodeCurrentFootprintHeadAgeContextAccessor(await this.#properties(accessors.setter, "head-age-context-setter"), "setter");
      need(getter.scriptId === setter.scriptId && getter.scriptId === this.#headAgeBootstrapScriptId, "HEAD_AGE_CONTEXT_SCRIPT");
      const source = z.object({ scriptSource: z.string().length(15_939) }).strict().parse(await this.#request({ phase: "head-age-context-source", method: "Debugger.getScriptSource", params: { scriptId: getter.scriptId } }));
      this.#headAgeContextSource = qualifyCurrentFootprintHeadAgeContextSource(source.scriptSource);
      const getterScopes = decodeCurrentFootprintHeadAgeContextScopes(await this.#properties(getter.scopesId, "head-age-context-getter-scopes"));
      const setterScopes = decodeCurrentFootprintHeadAgeContextScopes(await this.#properties(setter.scopesId, "head-age-context-setter-scopes"));
      const context = objectReply.parse(await this.#request({ phase: "head-age-context-bind", method: "Runtime.callFunctionOn", params: {
        ...FLAGS, objectId: getterScopes[0], functionDeclaration: CURRENT_FOOTPRINT_HEAD_AGE_CONTEXT_BIND_PROGRAM,
        arguments: [{ objectId: getterScopes[1] }, { objectId: setterScopes[0] }, { objectId: setterScopes[1] },
          { objectId: captured.result.objectId }, { value: nativeRootPid }], returnByValue: false } }));
      need(context.result.description === "Array(5)", "HEAD_AGE_CONTEXT_BOUND"); requireCurrentFootprintHeadAgeContextSource(this.#headAgeContextSource);
      const selected = objectReply.parse(await this.#request({ phase: "head-age-capture", method: "Runtime.callFunctionOn", params: {
        ...FLAGS, objectId: this.#sourceArray, functionDeclaration: CURRENT_FOOTPRINT_HEAD_AGE_CAPTURE_PROGRAM,
        arguments: [{ objectId: this.#retainedArray }, { objectId: context.result.objectId }], returnByValue: false } }));
      need(selected.result.description === "Array(16)", "HEAD_AGE_ARRAY");
      const ids = decodeCurrentFootprintHeadAgeArray(await this.#properties(selected.result.objectId, "head-age-array"));
      for (const [index, name] of CURRENT_FOOTPRINT_HEAD_AGE_DATE_METHODS.entries()) {
        const id = ids[index]; need(id !== undefined, "HEAD_AGE_METHOD"); decodeCurrentFootprintHeadAgeNativeMethod(await this.#properties(id, name), name);
      }
      this.#metadataRole = null; this.#headAgeArray = selected.result.objectId;
    } catch (error) { this.#fail(error); throw error; } finally { this.#busy = false; }
  }
  /** Run the one synchronous native Date/parser observation only after the
   * original method roster was fully checked. Metadata reads occur outside the
   * Windows collection bracket; no retry or new array is allocated here. */
  public async observeHeadAge(input: unknown): Promise<CurrentFootprintHeadAgeMainObservation> {
    need(!this.#headAgeAttempted && !this.#originAttempted && !this.#structureAttempted && !this.#busy && this.#headAgeArray !== null && this.#packet !== null && issued.get(this.#packet) === this, "HEAD_AGE_CONSUMED");
    this.#headAgeAttempted = true; this.#busy = true;
    try {
      const scope = validateClockControlScope(input); need(scope.createdAtLiteral.length === 19, "HEAD_AGE_LITERAL");
      const observed = await this.#request({ phase: "head-age-observe", method: "Runtime.callFunctionOn", params: {
        ...FLAGS, throwOnSideEffect: false, objectId: this.#headAgeArray, functionDeclaration: CURRENT_FOOTPRINT_HEAD_AGE_OBSERVE_PROGRAM,
        arguments: [{ value: scope.createdAtLiteral }, { value: Date.parse(`${scope.createdAtLiteral.replace(" ", "T")}Z`) }], returnByValue: true } });
      const value = decodeCurrentFootprintHeadAgeCdpReply(observed);
      const decoded = decodeCurrentFootprintHeadAgeMainObservation(value, scope.createdAtLiteral); await this.#reprove(); return decoded;
    } catch (error) { this.#fail(error); throw error; } finally { this.#busy = false; }
  }
  public async release(): Promise<void> {
    need(this.#selectedSqlBootstrap === null, "SELECTED_SQL_RETAIN_THROUGH_EXIT"); await this.#release();
  }
  async #release(): Promise<void> {
    need(!this.#originActive && !this.#structureActive && this.#attempted && !this.#busy && !this.#releaseAttempted, "RELEASE_CONSUMED"); this.#releaseAttempted = true; this.#busy = true;
    try {
      if (this.#breakpoint !== null && !this.#removeAttempted) { await this.#remove(true); }
      empty.parse(await this.#request({ phase: "release", method: "Runtime.releaseObjectGroup", params: { objectGroup: GROUP } }, true)); this.#released = true;
    } catch (error) { this.#fail(error); throw error; } finally { this.#busy = false; }
  }
  #normalCloseQuiescence(released: boolean): void {
    need(methods(this.#transport).every((value, index) => value === this.#methods[index]) && this.#packet !== null &&
      !this.#busy && !this.#failed && this.#pendingId === null && this.#text.length === 0 && this.#removed &&
      this.#pause !== null && this.#pause.resumed && !this.#originActive && !this.#structureActive && !this.#completionActive && !this.#completionFailed &&
      !this.#originPauseActive && !this.#originResumeExpected && !this.#originUncertain && this.#originBreakpoints.size === 0 &&
      this.#originEvents.length === 0 && this.#released === released && (!released || this.#releaseAttempted), "NORMAL_CLOSE_QUIESCENCE");
  }
  /** Dedicated observer cleanup may close after a semantic refusal only when
   * every original pause, allocation, response and group has settled. No
   * normal work or generic historical owner receives this cleanup exception. */
  #structureCloseQuiescence(released: boolean): void {
    const capability = this.#originCapability; need(isCurrentProjectStructureMainCapability(capability), "STRUCTURE_CLOSE_OWNER");
    mainCleanup(capability, this);
    need(methods(this.#transport).every((value, index) => value === this.#methods[index]) && this.#packet !== null &&
      !this.#busy && this.#pendingId === null && this.#text === "" && this.#decoderPendingContinuations === 0 && this.#removed &&
      this.#pause !== null && this.#pause.resumed && this.#structureAttempted && !this.#structureActive && !this.#originAttempted &&
      !this.#completionAttempted && !this.#originPauseActive && !this.#originResumeExpected && !this.#originUncertain &&
      !this.#structureAllocationUncertain && this.#structureAllocation === null && this.#originBreakpoints.size === 0 &&
      this.#originEvents.length === 0 && (this.#structureLease === null || this.#originGroupReleased) &&
      this.#released === released && (!released || this.#releaseAttempted), "STRUCTURE_CLOSE_QUIESCENCE");
  }
  /** No resume is dispatched here. A complete original observation, settled
   * origins and the acknowledged registration resume precede the existing
   * object-group release. A failed release consumes this cleanup attempt. */
  public async prepareNormalClose(): Promise<void> {
    need(this.#selectedSqlBootstrap === null, "SELECTED_SQL_RETAIN_THROUGH_EXIT");
    need(!this.#normalCloseAttempted, "NORMAL_CLOSE_CONSUMED"); this.#normalCloseAttempted = true;
    const structure = isCurrentProjectStructureMainCapability(this.#originCapability);
    if (structure) { this.#structureCloseQuiescence(this.#released); } else { this.#normalCloseQuiescence(this.#released); }
    if (!this.#released) { await this.#release(); }
    if (structure) { this.#structureCloseQuiescence(true); } else { this.#normalCloseQuiescence(true); }
  }
  public requireNormalClosePrepared(): void {
    need(this.#normalCloseAttempted, "NORMAL_CLOSE_REQUIRED");
    if (isCurrentProjectStructureMainCapability(this.#originCapability)) { this.#structureCloseQuiescence(true); } else { this.#normalCloseQuiescence(true); }
  }
  /** Transfer this original construction cursor once to the fixed structure
   * observer. Only its dedicated original native birth carries the new fixed
   * vocabulary; a token cannot upgrade another purpose or its native budget. */
  public async issueStructureLease(capability: CurrentFootprintCombinedMainCapability | CurrentProjectStructureMainCapability,
    packet: unknown): Promise<CurrentProjectStructureMainLease> {
    need(!this.#structureAttempted && !this.#originAttempted && !this.#busy && this.#packet !== null && packet === this.#packet && issued.get(this.#packet) === this &&
      this.#appScriptId !== null && this.#appSource !== null && this.#retainedArray !== null, "STRUCTURE_ORIGINAL_CONSTRUCTION_REQUIRED");
    mainCapability(capability, this); this.#same(false);
    this.#structureAttempted = true; this.#busy = true;
    if (isCurrentProjectStructureMainCapability(capability)) { this.#originCapability = capability; }
    try {
      await this.#reprove(); mainCapability(capability, this); this.#same(false);
      this.#structureSource = qualifyCurrentProjectStructureMainSource(this.#appSource);
      this.#originCapability = capability;
      const token = Object.freeze({ profile: "private.current-project-structure-main-lease.v1" as const });
      const binding: CurrentProjectStructureMainBinding = Object.freeze({ issuer: this, scriptId: this.#appScriptId,
        construction: this.#retainedArray, source: this.#structureSource,
        assertOriginal: async (): Promise<void> => { this.#structureCheck(token, false); await this.#current(); this.#structureCheck(token, false); },
        assertCleanup: (): void => { this.#structureCheck(token, true); },
        fail: (failure: unknown): void => {
          if (!this.#structureActive || this.#structureLease !== token) { return; }
          this.#fail(failure);
        },
        assertGenerationExited: (): void => { this.#structureCheck(token, true); need(mainExited(capability, this), "STRUCTURE_GENERATION_LIVE"); },
        request: (command: CurrentProjectStructureMainCommand, cleanup: boolean, retainAllocationReply?: (reply: unknown) => void): Promise<unknown> =>
          this.#structureRequest(token, command, cleanup, retainAllocationReply),
        settleAllocation: async (): Promise<void> => {
          this.#structureCheck(token, true);
          const allocation = this.#structureAllocation;
          if (allocation === null) { return; }
          need(!this.#busy && allocation.stopped && this.#pendingId === allocation.id, "STRUCTURE_ALLOCATION_PENDING"); this.#busy = true;
          try { await this.#pump(true); this.#structureCheck(token, true); } finally { this.#busy = false; }
        },
        pump: async (cleanup: boolean): Promise<void> => {
          this.#structureCheck(token, cleanup); need(!this.#busy, "STRUCTURE_BUSY"); this.#busy = true;
          try { await this.#pump(cleanup); this.#structureCheck(token, cleanup); } finally { this.#busy = false; }
        },
        takeEvent: (): CurrentFootprintCopyMainRequestOriginEvent | null => { this.#structureCheck(token, true); return this.#originEvents.shift() ?? null; },
        retire: (): void => {
          this.#structureCheck(token, true); need(!this.#busy && (mainExited(capability, this) ||
            this.#originGroupReleased && this.#originBreakpoints.size === 0 && !this.#originPauseActive && !this.#originResumeExpected &&
            !this.#originUncertain && !this.#structureAllocationUncertain && this.#structureAllocation === null &&
            this.#pendingId === null && this.#originEvents.length === 0), "STRUCTURE_CLEANUP_INCOMPLETE");
          this.#structureActive = false;
        },
      });
      this.#structureLease = token; this.#structureActive = true;
      structureLeases.set(token, Object.freeze({ assertOriginalEntry: (): void => { this.#structureCheck(token, true); }, binding }));
      return token;
    } catch (error) { this.#fail(error); throw error; } finally { this.#busy = false; }
  }
  /** Recheck the same native capability on every lease use. Only observed
   * original-root exit and empty Job bypass an expired inspector cleanup lane. */
  #structureCheck(token: CurrentProjectStructureMainLease, cleanup: boolean): void {
    need(this.#structureActive && this.#structureLease === token && this.#originCapability !== null && this.#structureSource !== null,
      "STRUCTURE_ORIGINAL_LEASE_REQUIRED");
    requireCurrentProjectStructureMainSource(this.#structureSource);
    if (cleanup && mainExited(this.#originCapability, this)) {
      need(methods(this.#transport).every((value, index) => value === this.#methods[index]) && !this.#released, "OWNER"); return;
    }
    if (cleanup) { mainCleanup(this.#originCapability, this); }
    else { mainCapability(this.#originCapability, this); need(!this.#originUncertain, "STRUCTURE_FAILED"); }
    this.#same(cleanup);
  }
  /** Preserve the original request allocator and pause acknowledgments. A
   * rejected allocation/dispatch remains consumed and cannot be retried. */
  async #structureRequest(token: CurrentProjectStructureMainLease, input: CurrentProjectStructureMainCommand, cleanup: boolean,
    retainAllocationReply?: (reply: unknown) => void): Promise<unknown> {
    need(typeof cleanup === "boolean" && !this.#busy, "STRUCTURE_BUSY"); this.#structureCheck(token, cleanup);
    const command = validateCurrentProjectStructureMainCommand(input);
    need(retainAllocationReply === undefined || command.phase === "structure-main-arm" && !cleanup, "STRUCTURE_ALLOCATION_CALLBACK");
    const isCleanup = ["structure-main-remove", "structure-main-resume", "structure-main-release"].includes(command.phase);
    need(cleanup === isCleanup && (cleanup ? this.#structureCleanup < CURRENT_PROJECT_STRUCTURE_MAIN_REQUESTS.cleanup :
      this.#structureNormal < CURRENT_PROJECT_STRUCTURE_MAIN_REQUESTS.normal), "STRUCTURE_REQUEST_BOUND");
    if (command.phase === "structure-main-remove") { need(this.#originBreakpoints.has(command.params.breakpointId), "STRUCTURE_BREAKPOINT_OWNER"); }
    if (command.phase === "structure-main-resume") {
      need(this.#originPauseActive && !this.#originResumeExpected, "STRUCTURE_RESUME_CONSUMED"); this.#originResumeExpected = true;
    }
    if (cleanup) { this.#structureCleanup += 1; } else { this.#structureNormal += 1; }
    this.#busy = true;
    try {
      let allocated: string | null = null;
      let retain: ((reply: unknown) => void) | undefined;
      if (command.phase === "structure-main-arm") { retain = (reply: unknown): void => {
        const known = z.looseObject({ breakpointId: handle }).safeParse(reply);
        if (known.success && !this.#originBreakpoints.has(known.data.breakpointId)) {
          allocated = known.data.breakpointId; this.#originBreakpoints.add(allocated);
        } else { this.#structureAllocationUncertain = true; }
        retainAllocationReply?.(reply);
      }; }
      const result = await this.#request(command, cleanup, retain); this.#structureCheck(token, cleanup);
      if (command.phase === "structure-main-arm") {
        const reply = z.object({ breakpointId: handle, actualLocation: location }).strict().parse(result);
        need(allocated === reply.breakpointId && reply.actualLocation.scriptId === command.params.location.scriptId && reply.actualLocation.lineNumber === command.params.location.lineNumber && reply.actualLocation.columnNumber === command.params.location.columnNumber, "STRUCTURE_BREAKPOINT_ALLOCATION");
      } else if (command.phase === "structure-main-remove") { empty.parse(result); this.#originBreakpoints.delete(command.params.breakpointId); }
      else if (command.phase === "structure-main-resume") { empty.parse(result); }
      else if (command.phase === "structure-main-release") { empty.parse(result); this.#originGroupReleased = true; }
      return result;
    } catch (error) { if (command.phase !== "structure-main-arm") { this.#originUncertain = true; } this.#fail(error); throw error; } finally { this.#busy = false; }
  }
  /** Only the actual new combined native owner can join this original runner.
   * No caller-supplied scheduler, handles, flags or serialized packet is issued. */
  public async issueRequestOrigin(capability: CurrentFootprintCombinedMainCapability,
    packet: CurrentFootprintCopyMainBackendObservation): Promise<CurrentFootprintCopyMainRequestOrigin> {
    requireCurrentFootprintCombinedMainCapability(capability, this);
    const token = await this.#issueRequestOrigin(capability, packet);
    need(token.profile === "private.current-footprint-copy-main-request-origin.v1", "REQUEST_ORIGINAL_OWNER"); return token;
  }
  /** Consume the same original main cursor using only the separately issued
   * writer-v2 capability. This does not qualify clocks or enable a writer. */
  public async issueForwardExecutionRequestOrigin(capability: CurrentFootprintForwardExecutionMainCapability,
    packet: CurrentFootprintCopyMainBackendObservation): Promise<CurrentFootprintForwardMainRequestOrigin> {
    requireCurrentFootprintForwardExecutionMainCapability(capability, this);
    const token = await this.#issueRequestOrigin(capability, packet);
    need(token.profile === "private.current-footprint-forward-main-request-origin.v2", "FORWARD_REQUEST_ORIGINAL_OWNER"); return token;
  }
  async #issueRequestOrigin(capability: MainCapability, packet: CurrentFootprintCopyMainBackendObservation): Promise<MainRequestOrigin> {
    need(!this.#originAttempted && !this.#structureAttempted && !this.#busy && packet === this.#packet && issued.get(packet) === this &&
      this.#appScriptId !== null && this.#appSource !== null && this.#retainedArray !== null && this.#driverCallbackObjectId !== null,
    "REQUEST_ORIGINAL_CONSTRUCTION_REQUIRED");
    mainCapability(capability, this);
    this.#originAttempted = true; this.#busy = true;
    try {
      await this.#reprove(); mainCapability(capability, this); this.#same(false);
      this.#originSource = qualifyCurrentFootprintCopyMainRequestSource(this.#appSource);
      const forward = isCurrentFootprintForwardExecutionMainCapability(capability);
      const token = forward ? Object.freeze({ profile: "private.current-footprint-forward-main-request-origin.v2" as const, executionAuthorized: false as const }) :
        Object.freeze({ profile: "private.current-footprint-copy-main-request-origin.v1" as const, executionAuthorized: false as const });
      const bindings: CurrentFootprintForwardMainRequestOriginBindings = Object.freeze({ scriptId: this.#appScriptId,
        fail: (error: unknown): void => { if (forward && this.#originToken === token) { this.#fail(error); } },
        retainedArrayObjectId: this.#retainedArray, driverCallbackObjectId: this.#driverCallbackObjectId, qualifiedSource: this.#originSource,
        assertOriginal: (): Promise<void> => this.#originCurrent(token),
        assertCleanup: (): Promise<void> => { this.#originCheck(token, true); return Promise.resolve(); },
        assertOriginalGenerationExited: (): Promise<void> => {
          this.#originCheck(token, true); need(mainExited(capability, this), "REQUEST_ORIGINAL_GENERATION_LIVE"); return Promise.resolve();
        },
        request: (command: CurrentFootprintCopyMainRequestCollectCommand, cleanup: boolean, retainAllocation?: (reply: unknown) => void): Promise<unknown> => this.#originRequest(token, command, cleanup, retainAllocation),
        settleAllocation: (): Promise<void> => this.#settleOriginAllocation(token, false),
        pump: (cleanup: boolean): Promise<void> => this.#originPump(token, cleanup),
        takeEvent: (): CurrentFootprintCopyMainRequestOriginEvent | null => { this.#originCheck(token, true); return this.#originEvents.shift() ?? null; },
        retire: (): Promise<void> => {
          this.#originCheck(token, true); need(!this.#busy && (mainExited(capability, this) ||
            this.#originGroupReleased && this.#originBreakpoints.size === 0 && !this.#originPauseActive && !this.#originResumeExpected &&
            !this.#originUncertain && this.#pendingId === null && this.#structureAllocation === null && !this.#structureAllocationUncertain && this.#originEvents.length === 0), "REQUEST_ORIGINAL_CLEANUP_INCOMPLETE");
          if (this.#completionAttempted) {
            need(mainExited(capability, this), "COMPLETION_ORIGINAL_GENERATION_LIVE");
            return this.#retireFailedCompletionTransfer(capability);
          }
          this.#originActive = false; return Promise.resolve();
        },
      });
      this.#originCapability = capability; this.#originToken = token; this.#originActive = true;
      requestOrigins.set(token, Object.freeze({ kind: forward ? "forward" : "combined", assertOriginalEntry: (): void => { this.#originCheck(token, true); }, bindings, capability, runner: this })); return token;
    } catch (error) { this.#fail(error); throw error; } finally { this.#busy = false; }
  }
  /** Synchronous identity join before any create. Equal receipts or an origin
   * belonging to another original backend cannot pass this capability check. */
  public requireRequestOrigin(capability: CurrentFootprintCombinedMainCapability, token: CurrentFootprintCopyMainRequestOrigin): void {
    requireCurrentFootprintCombinedMainCapability(capability, this);
    need(capability === this.#originCapability && token === this.#originToken, "REQUEST_ORIGINAL_OWNER");
    this.#originCheck(token, false);
  }
  public requireForwardExecutionRequestOrigin(capability: CurrentFootprintForwardExecutionMainCapability, token: CurrentFootprintForwardMainRequestOrigin): void {
    requireCurrentFootprintForwardExecutionMainCapability(capability, this);
    need(capability === this.#originCapability && token === this.#originToken, "FORWARD_REQUEST_ORIGINAL_OWNER"); this.#originCheck(token, false);
  }
  /** All four original fixed request points must exist before cold-v2 gives
   * the renderer its clock lane. A descriptor or equal origin is insufficient. */
  public requireForwardExecutionRequestArmed(capability: CurrentFootprintForwardExecutionMainCapability, token: CurrentFootprintForwardMainRequestOrigin): void {
    this.requireForwardExecutionRequestOrigin(capability, token);
    need(!this.#busy && this.#pendingId === null && this.#originBreakpoints.size === Object.keys(CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_COLLECTION_SITES).length &&
      this.#originEvents.length === 0 && !this.#originPauseActive && !this.#originResumeExpected && !this.#originUncertain && !this.#originGroupReleased,
    "FORWARD_REQUEST_ORIGINAL_ARM_REQUIRED");
  }
  /** Private original-owner handoff. Capacity refuses before either the old
   * lease or a native phase is consumed. A dispatched begin is one-shot; only
   * actual original exit can settle a lost acknowledgment. No writer starts. */
  public async issueCompletionOrigin(capability: CurrentFootprintCombinedMainCapability,
    packet: CurrentFootprintCopyMainRequestHeldFinalPb): Promise<CurrentFootprintCopyMainCompletionOrigin> {
    requireCurrentFootprintCombinedMainCapability(capability, this);
    const token = await this.#issueCompletionOrigin(capability, packet);
    need(token.profile === "private.current-footprint-copy-main-completion-origin.v1", "COMPLETION_ORIGINAL_OWNER"); return token;
  }
  /** Transfer the actual held PB on this same v2 main cursor after exact native
   * completion headroom, retaining failed/unknown begin custody without retry. */
  public async issueForwardExecutionCompletionOrigin(capability: CurrentFootprintForwardExecutionMainCapability,
    packet: CurrentFootprintCopyMainRequestHeldFinalPb): Promise<CurrentFootprintForwardMainCompletionOrigin> {
    requireCurrentFootprintForwardExecutionMainCapability(capability, this);
    const token = await this.#issueCompletionOrigin(capability, packet);
    need(token.profile === "private.current-footprint-forward-main-completion-origin.v2", "FORWARD_COMPLETION_ORIGINAL_OWNER"); return token;
  }
  async #issueCompletionOrigin(capability: MainCapability, packet: CurrentFootprintCopyMainRequestHeldFinalPb): Promise<MainCompletionOrigin> {
    need(!this.#completionAttempted && !this.#busy && this.#originToken !== null && capability === this.#originCapability &&
      this.#appSource !== null && this.#appScriptId !== null && this.#originSource !== null, "COMPLETION_ORIGINAL_CONSTRUCTION_REQUIRED");
    const forward = isCurrentFootprintForwardExecutionMainCapability(capability);
    const held = requireCurrentFootprintCopyMainRequestHeldFinalPb(packet), originalToken = this.#originToken;
    need(held.qualifiedSource === this.#originSource && held.scriptId === this.#appScriptId &&
      held.retainedArrayObjectId === this.#retainedArray, "COMPLETION_ORIGINAL_HELD_OWNER");
    this.#originCheck(originalToken, false);
    mainCompletionCapacity(capability, this, this.#requests + 1);
    const source = qualifyCurrentFootprintCopyMainCompletionSource(this.#appSource);
    this.#completionAttempted = true; this.#busy = true;
    try {
      await held.assertOriginal(); this.#originCheck(originalToken, false);
      need(requireCurrentFootprintCopyMainRequestHeldFinalPb(packet) === held && this.#pendingId === null && this.#text === "" &&
        (!forward || this.#decoderPendingContinuations === 0 && this.#structureAllocation === null && !this.#structureAllocationUncertain) &&
        this.#originEvents.length === 0 && this.#originBreakpoints.size === 0 && this.#originPauseActive &&
        !this.#originResumeExpected && !this.#originUncertain && !this.#originGroupReleased, "COMPLETION_ORIGINAL_CURSOR");
      this.#completionBeginAttempted = true; await mainCompletionBegin(capability, this, this.#requests + 1);
      this.#originCheck(originalToken, false);
      need(this.#pendingId === null && this.#text === "" &&
        (!forward || this.#decoderPendingContinuations === 0 && this.#structureAllocation === null && !this.#structureAllocationUncertain && this.#originBreakpoints.size === 0) &&
        this.#originEvents.length === 0 && this.#originPauseActive &&
        !this.#originResumeExpected && !this.#originUncertain && !this.#originGroupReleased, "COMPLETION_ORIGINAL_CURSOR");
      // No await between consuming the exact old held lease and installing its
      // Sole new origin. The old collector cannot resume, release or retire it.
      const transferredHeld = originalToken.profile === "private.current-footprint-forward-main-request-origin.v2" ?
        transferCurrentFootprintForwardMainRequestHeldFinalPb(packet, originalToken) : transferCurrentFootprintCopyMainRequestHeldFinalPb(packet, originalToken);
      need(transferredHeld === held, "COMPLETION_TRANSFER_IDENTITY");
      const token = forward ? Object.freeze({ profile: "private.current-footprint-forward-main-completion-origin.v2" as const, executionAuthorized: false as const }) :
        Object.freeze({ profile: "private.current-footprint-copy-main-completion-origin.v1" as const, executionAuthorized: false as const });
      this.#completionSource = source; this.#completionToken = token; this.#completionActive = true;
      const bindings: CurrentFootprintForwardMainCompletionOriginBindings = Object.freeze({ heldFinalPb: packet, transferredHeld,
        source, scriptId: held.scriptId,
        assertOriginal: (): Promise<void> => this.#completionCurrent(token),
        assertCleanup: (): Promise<void> => { this.#completionCheck(token, true); return Promise.resolve(); },
        assertOriginalHeld: (): Promise<void> => {
          this.#completionCheck(token, false); need(this.#originPauseActive && !this.#originResumeExpected &&
            !this.#completionFinalResumeAttempted && this.#originEvents.length === 0, "COMPLETION_ORIGINAL_PB_ADVANCED"); return Promise.resolve();
        },
        assertOriginalGenerationExited: (): Promise<void> => {
          this.#completionCheck(token, true); need(mainExited(capability, this), "COMPLETION_ORIGINAL_GENERATION_LIVE");
          // Only observed retained-root exit and empty Job permit abandoned
          // Inspector replies/events to settle without pretending they replied.
          this.#originEvents.length = 0; return Promise.resolve();
        },
        fail: (): void => {
          if (this.#completionToken === token) { this.#completionFailed = true; mainCompletionFail(capability, this); }
        },
        request: (command: CurrentFootprintCopyMainCompletionCommand, cleanup: boolean, retainAllocation?: (reply: unknown) => void): Promise<unknown> => this.#completionRequest(token, command, cleanup, retainAllocation),
        settleAllocation: (): Promise<void> => this.#settleOriginAllocation(token, true),
        pump: (cleanup: boolean): Promise<void> => this.#completionPump(token, cleanup),
        takeEvent: (): CurrentFootprintCopyMainRequestOriginEvent | null => { this.#completionCheck(token, true); return this.#originEvents.shift() ?? null; },
        retire: (): Promise<void> => this.#completionRetire(token),
      });
      completionOrigins.set(token, Object.freeze({ kind: forward ? "forward" : "combined", assertOriginalEntry: (): void => { this.#completionCheck(token, true); }, bindings })); return token;
    } catch (error) { this.#completionFailed = true; this.#fail(error); throw error; } finally { this.#busy = false; }
  }
  /** Poll only the retained original allocation once after its caller has
   * stopped. A late ID enters both original cleanup owners before any guard;
   * uncertainty never becomes normal eligibility or a replacement allocation. */
  async #settleOriginAllocation(token: MainRequestOrigin | MainCompletionOrigin, completion: boolean): Promise<void> {
    need(isCurrentFootprintForwardExecutionMainCapability(this.#originCapability), "FORWARD_ALLOCATION_ORIGINAL");
    const current = (): void => {
      if (token.profile === "private.current-footprint-forward-main-completion-origin.v2") { need(completion, "FORWARD_ALLOCATION_ORIGINAL"); this.#completionCheck(token, true); }
      else { need(!completion && token.profile === "private.current-footprint-forward-main-request-origin.v2", "FORWARD_ALLOCATION_ORIGINAL"); this.#originCheck(token, true); }
    };
    current(); const allocation = this.#structureAllocation;
    if (allocation === null) { return; }
    need(!this.#busy && allocation.stopped && this.#pendingId === allocation.id, "STRUCTURE_ALLOCATION_PENDING"); this.#busy = true;
    try { await this.#pump(true); current(); }
    finally { this.#busy = false; }
  }
  #completionCheck(token: MainCompletionOrigin, cleanup: boolean): void {
    need(this.#completionActive && token === this.#completionToken && this.#originCapability !== null && this.#completionSource !== null,
      "COMPLETION_ORIGINAL_LEASE_REQUIRED");
    requireCurrentFootprintCopyMainCompletionSource(this.#completionSource);
    if (cleanup && mainExited(this.#originCapability, this)) {
      need(methods(this.#transport).every((value, index) => value === this.#methods[index]) && !this.#released, "OWNER"); return;
    }
    if (cleanup) { mainCleanup(this.#originCapability, this); }
    else { need(!this.#completionFailed && !this.#originUncertain, "COMPLETION_FAILED"); mainCapability(this.#originCapability, this); }
    this.#same(cleanup);
  }
  async #completionCurrent(token: MainCompletionOrigin): Promise<void> {
    this.#completionCheck(token, false);
    if (this.#originCapability !== null && isCurrentFootprintForwardExecutionMainCapability(this.#originCapability)) { await reproveCurrentFootprintForwardExecutionMainPublication(this.#originCapability, this); this.#completionCheck(token, false); }
    await this.#current(); this.#completionCheck(token, false);
  }
  async #completionPump(token: MainCompletionOrigin, cleanup: boolean): Promise<void> {
    need(typeof cleanup === "boolean" && !this.#busy, "COMPLETION_ORIGINAL_BUSY"); this.#completionCheck(token, cleanup); this.#busy = true;
    try { await this.#pump(cleanup); this.#completionCheck(token, cleanup); }
    catch (error) { this.#completionFailed = true; this.#fail(error); throw error; } finally { this.#busy = false; }
  }
  async #completionRequest(token: MainCompletionOrigin, input: CurrentFootprintCopyMainCompletionCommand, cleanup: boolean,
    retainAllocationReply?: (reply: unknown) => void): Promise<unknown> {
    need(typeof cleanup === "boolean" && !this.#busy, "COMPLETION_ORIGINAL_BUSY"); this.#completionCheck(token, cleanup);
    const command = validateCurrentFootprintCopyMainCompletionCommand(input);
    const actualCleanup = ["completion-remove", "completion-resume", "completion-resume-final-pb", "completion-release"].includes(command.phase);
    need(cleanup === actualCleanup && (cleanup ? this.#completionCleanup < CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_REQUESTS.cleanup :
      this.#completionNormal < CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_REQUESTS.normal), "COMPLETION_REQUEST_CLASS_OR_BOUND");
    if (command.phase === "completion-remove") { need(this.#originBreakpoints.has(command.params.breakpointId), "COMPLETION_BREAKPOINT_OWNER"); }
    if (command.method === "Debugger.resume") {
      // Resume consumes cleanup capacity but advances native application work.
      // A retained alias must never resume after a semantic/protocol failure.
      this.#completionCheck(token, false);
      need(this.#originPauseActive && !this.#originResumeExpected && (command.phase === "completion-resume-final-pb") === !this.#completionFinalResumeAttempted,
        "COMPLETION_ORIGINAL_RESUME_CONSUMED");
      if (command.phase === "completion-resume-final-pb") { this.#completionFinalResumeAttempted = true; }
      this.#originResumeExpected = true;
    }
    const allocation = command.phase === "completion-source-arm" || command.phase === "completion-callback-arm";
    const forward = token.profile === "private.current-footprint-forward-main-completion-origin.v2";
    need(retainAllocationReply === undefined || forward && allocation && !cleanup, "FORWARD_ALLOCATION_CALLBACK");
    this.#busy = true; if (cleanup) { this.#completionCleanup += 1; } else { this.#completionNormal += 1; }
    const retain = forward && allocation ? (reply: unknown): void => {
      const id = currentFootprintCopyMainCompletionAllocatedId(reply);
      if (id !== null && !this.#originBreakpoints.has(id)) { this.#originBreakpoints.add(id); this.#structureAllocationUncertain = false; }
      else { this.#structureAllocationUncertain = true; }
      retainAllocationReply?.(reply);
    } : undefined;
    if (retain !== undefined) { this.#structureAllocationUncertain = true; }
    try {
      const result = await this.#request(command, cleanup, retain); this.#completionCheck(token, cleanup);
      if (command.phase === "completion-source-arm" || command.phase === "completion-callback-arm") {
        const allocated = currentFootprintCopyMainCompletionAllocatedId(result);
        if (forward) { need(allocated !== null && this.#originBreakpoints.has(allocated) && !this.#structureAllocationUncertain, "COMPLETION_BREAKPOINT_ALLOCATION"); }
        else { need(allocated !== null && !this.#originBreakpoints.has(allocated), "COMPLETION_BREAKPOINT_ALLOCATION"); this.#originBreakpoints.add(allocated); }
      } else if (command.phase === "completion-remove") { empty.parse(result); this.#originBreakpoints.delete(command.params.breakpointId); }
      else if (command.method === "Debugger.resume") { empty.parse(result); }
      else if (command.phase === "completion-release") { empty.parse(result); this.#originGroupReleased = true; }
      return result;
    } catch (error) { this.#completionFailed = true; this.#originUncertain = true; this.#fail(error); throw error; } finally { this.#busy = false; }
  }
  /** Native retirement acknowledgment does not settle inspector custody.
   * Recheck the original cursor after its await, retaining cleanup ownership
   * and the actual acknowledgment if a late event/frame requires root exit. */
  #completionRetireQuiescence(): void {
    need(!this.#completionFailed && this.#completionNormal === CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_REQUESTS.normal &&
      this.#completionCleanup === CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_REQUESTS.cleanup && this.#originGroupReleased &&
      this.#originBreakpoints.size === 0 && !this.#originPauseActive && !this.#originResumeExpected && !this.#originUncertain &&
      this.#pendingId === null && this.#structureAllocation === null && !this.#structureAllocationUncertain && this.#originEvents.length === 0 &&
      this.#text === "" && this.#decoderPendingContinuations === 0 &&
      (this.#forwardPoll === null || this.#forwardPoll.settled && this.#forwardPoll.delivered), "COMPLETION_ORIGINAL_CLEANUP_INCOMPLETE");
  }
  async #completionRetire(token: MainCompletionOrigin): Promise<void> {
    this.#completionCheck(token, true); need(!this.#busy && this.#originCapability !== null, "COMPLETION_ORIGINAL_BUSY");
    const exited = mainExited(this.#originCapability, this);
    if (!exited) { this.#completionRetireQuiescence(); }
    // A lost native retirement acknowledgement is never replayed. After actual
    // Exit the retained phase may be released locally without another request.
    if (this.#completionRetireAttempted) { need(exited, "COMPLETION_RETIRE_CONSUMED"); this.#completionActive = false; this.#originActive = false; return; }
    this.#completionRetireAttempted = true; this.#busy = true;
    try {
      await mainCompletionRetire(this.#originCapability, this); this.#completionRetirementAcknowledged = true;
      this.#completionCheck(token, true);
      if (!mainExited(this.#originCapability, this)) { this.#completionRetireQuiescence(); }
      this.#completionActive = false; this.#originActive = false;
    }
    catch (error) { this.#completionFailed = true; this.#fail(error); throw error; } finally { this.#busy = false; }
  }
  async #retireFailedCompletionTransfer(capability: MainCapability): Promise<void> {
    if (this.#completionBeginAttempted && !this.#completionRetireAttempted) {
      this.#completionRetireAttempted = true; await mainCompletionRetire(capability, this);
    }
    this.#originActive = false;
  }
  #originCheck(token: MainRequestOrigin, cleanup: boolean): void {
    need(!this.#completionActive, "COMPLETION_OWNS_MAIN");
    need(this.#originActive && token === this.#originToken && this.#originCapability !== null && this.#originSource !== null,
      "REQUEST_ORIGINAL_LEASE_REQUIRED");
    if (cleanup && mainExited(this.#originCapability, this)) {
      // Actual original-root exit and empty Job settle the retained lease even
      // After inspector budgets expire. This path cannot revive native I/O.
      need(methods(this.#transport).every((value, index) => value === this.#methods[index]) && !this.#released, "OWNER");
      requireCurrentFootprintCopyMainRequestSource(this.#originSource);
      if (this.#source !== null) { requireCurrentFootprintCopyMainBackendSource(this.#source); }
      return;
    }
    if (cleanup) { mainCleanup(this.#originCapability, this); }
    else { mainCapability(this.#originCapability, this); }
    requireCurrentFootprintCopyMainRequestSource(this.#originSource); this.#same(cleanup);
  }
  async #originCurrent(token: MainRequestOrigin): Promise<void> {
    this.#originCheck(token, false);
    if (this.#originCapability !== null && isCurrentFootprintForwardExecutionMainCapability(this.#originCapability)) { await reproveCurrentFootprintForwardExecutionMainPublication(this.#originCapability, this); this.#originCheck(token, false); }
    await this.#current(); this.#originCheck(token, false);
  }
  async #originPump(token: MainRequestOrigin, cleanup: boolean): Promise<void> {
    need(!this.#completionAttempted, "COMPLETION_TRANSFER_CONSUMED");
    need(typeof cleanup === "boolean" && !this.#busy, "REQUEST_ORIGINAL_BUSY"); this.#originCheck(token, cleanup); this.#busy = true;
    try { await this.#pump(cleanup); this.#originCheck(token, cleanup); }
    catch (error) { this.#fail(error); throw error; } finally { this.#busy = false; }
  }
  async #originRequest(token: MainRequestOrigin, input: CurrentFootprintCopyMainRequestCollectCommand, cleanup: boolean,
    retainAllocationReply?: (reply: unknown) => void): Promise<unknown> {
    need(!this.#completionAttempted, "COMPLETION_TRANSFER_CONSUMED");
    need(typeof cleanup === "boolean" && !this.#busy, "REQUEST_ORIGINAL_BUSY"); this.#originCheck(token, cleanup);
    const command = validateCurrentFootprintCopyMainRequestCollectCommand(input);
    if (command.phase === "request-remove") { need(this.#originBreakpoints.has(command.params.breakpointId), "REQUEST_BREAKPOINT_OWNER"); }
    if (command.phase === "request-resume") {
      // Although charged to cleanup, resume advances the original SQL path.
      // A v2 semantic refusal can retain removal custody, never resume it.
      if (token.profile === "private.current-footprint-forward-main-request-origin.v2") { this.#originCheck(token, false); }
      need(this.#originPauseActive && !this.#originResumeExpected, "REQUEST_ORIGINAL_RESUME_CONSUMED"); this.#originResumeExpected = true;
    }
    const allocation = command.phase === "request-driver-arm" || command.phase === "request-site-arm";
    const forward = token.profile === "private.current-footprint-forward-main-request-origin.v2";
    need(retainAllocationReply === undefined || forward && allocation && !cleanup, "FORWARD_ALLOCATION_CALLBACK");
    this.#busy = true;
    const retain = forward && allocation ? (reply: unknown): void => {
      const id = currentFootprintCopyMainRequestAllocatedId(reply);
      if (id !== null && !this.#originBreakpoints.has(id)) { this.#originBreakpoints.add(id); this.#structureAllocationUncertain = false; }
      else { this.#structureAllocationUncertain = true; }
      retainAllocationReply?.(reply);
    } : undefined;
    if (retain !== undefined) { this.#structureAllocationUncertain = true; }
    const mutation = ["request-driver-arm", "request-site-arm", ...CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_CLEANUP_PHASES].includes(command.phase);
    try {
      const result = await this.#request(command, cleanup, retain); this.#originCheck(token, cleanup);
      if (command.phase === "request-driver-arm" || command.phase === "request-site-arm") {
        const allocated = currentFootprintCopyMainRequestAllocatedId(result);
        if (forward) { need(allocated !== null && this.#originBreakpoints.has(allocated) && !this.#structureAllocationUncertain, "REQUEST_BREAKPOINT_ALLOCATION"); }
        else { need(allocated !== null && !this.#originBreakpoints.has(allocated), "REQUEST_BREAKPOINT_ALLOCATION"); this.#originBreakpoints.add(allocated); }
      } else if (command.phase === "request-remove") { empty.parse(result); this.#originBreakpoints.delete(command.params.breakpointId); }
      else if (command.phase === "request-resume") { empty.parse(result); }
      else if (command.phase === "request-release") { empty.parse(result); this.#originGroupReleased = true; }
      return result;
    } catch (error) { if (mutation) { this.#originUncertain = true; } this.#fail(error); throw error; } finally { this.#busy = false; }
  }
  public retained(): Readonly<{ attempted: boolean; completed: boolean; failed: boolean; phase: string; failure: string | null; requests: number; replies: number;
    pendingReplies: number; events: number; receivedBytes: number; initialContinuationCount: number; registrationPaused: boolean; sourceQualified: boolean;
    breakpointRemoved: boolean; releaseAttempted: boolean; released: boolean; registrationLocationFailure: RegistrationLocationFailure | null;
    metadataRole: MetadataRole | null; schemaIssues: readonly SchemaIssue[] | null; requestOriginIssued: boolean; requestOriginActive: boolean }> {
    return Object.freeze({ attempted: this.#attempted, completed: this.#packet !== null, failed: this.#failed, phase: this.#phase, failure: this.#lastFailure,
      requests: this.#requests, replies: this.#replies.length, pendingReplies: this.#pendingId === null ? 0 : 1, events: this.#events, receivedBytes: this.#received,
      initialContinuationCount: this.#initialContinuationCount, registrationPaused: this.#registrationSeen, sourceQualified: this.#source !== null,
      breakpointRemoved: this.#removed, releaseAttempted: this.#releaseAttempted, released: this.#released,
      registrationLocationFailure: this.#registrationLocationFailure, metadataRole: this.#metadataRole, schemaIssues: this.#schemaIssues,
      requestOriginIssued: this.#originAttempted, requestOriginActive: this.#originActive });
  }
}

// oxlint-disable-next-line typescript/unbound-method -- Invoke only on the same original private-field runner, after genuine native-owner admission.
const originalForwardMainCursor = CurrentFootprintCopyMainBackendRunner.prototype.issueForwardMainCursor;
/** The native v2 issuer captures the original cursor method rather than an
 * instance/prototype replacement. This issues no send or whole-writer role. */
export function captureOriginalCurrentFootprintForwardMainCursor(runner: CurrentFootprintCopyMainBackendRunner): CurrentFootprintForwardMainCursor {
  requireOriginalCurrentFootprintForwardMainRunner(runner);
  need(CurrentFootprintCopyMainBackendRunner.prototype.issueForwardMainCursor === originalForwardMainCursor, "FORWARD_CURSOR_ORIGINAL");
  return originalForwardMainCursor.call(runner);
}

const forwardMainPrototypes = captureCurrentFootprintForwardExecutionPrototypes(CurrentFootprintCopyMainBackendRunner.prototype);
/** Recheck complete original method descriptors and actual receiver resolution.
 * Native factory membership and cursor/source admission are separate proofs. */
export function requireOriginalCurrentFootprintForwardMainRunner(runner: CurrentFootprintCopyMainBackendRunner): void {
  requireCurrentFootprintForwardExecutionPrototypes(forwardMainPrototypes);
  need(runner !== null && typeof runner === "object" && !types.isProxy(runner) &&
    Object.getPrototypeOf(runner) === CurrentFootprintCopyMainBackendRunner.prototype && Reflect.ownKeys(runner).length === 0, "FORWARD_CURSOR_ORIGINAL");
}
/** Authenticate the exact original allocation receiver, never a caller's
 * replacement callback. This membership check grants no native send or retry
 * and remains valid for a real late reply after the original caller stopped. */
export function requireOriginalCurrentFootprintForwardMainPollRetainer(runner: CurrentFootprintCopyMainBackendRunner,
  retain: (chunk: string) => void): void {
  requireOriginalCurrentFootprintForwardMainRunner(runner);
  need(typeof retain === "function" && !types.isProxy(retain), "FORWARD_ORIGINAL_POLL_RETAINER");
  const original = forwardPollRetainers.get(retain);
  need(original !== undefined && original.runner === runner, "FORWARD_ORIGINAL_POLL_RETAINER"); original.requireOriginal();
}
