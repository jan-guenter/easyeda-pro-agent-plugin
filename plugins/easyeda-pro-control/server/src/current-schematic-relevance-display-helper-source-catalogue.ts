/** Fixed generated seven-record schematic worker programs only. Exact text membership is inert;
 * only the original controller can correlate a submitted program with its
 * same-session Inspector event and source reply. */
/* oxlint-disable import/max-dependencies -- The closed catalogue derives its strings and repeated-call bounds from every original finite lane; a caller registry would admit arbitrary execution. */
import { CURRENT_PROJECT_LIBRARY_REFRESH_REQUESTS, currentProjectLibraryRefreshCases } from "./current-project-library-refresh-protocol.ts";
import { types } from "node:util";
import { CURRENT_SCHEMATIC_DISPLAY_SAVE_REQUESTS, currentSchematicDisplaySaveNativeCases } from "./current-schematic-display-save-protocol.ts";
import { CURRENT_PROJECT_SAVE_STRUCTURE_REQUESTS, currentProjectSaveStructureNativeCases } from "./current-project-save-structure-protocol.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_REQUESTS, currentProjectSaveProducerNativeCases } from "./current-project-save-producer-protocol.ts";
import { CURRENT_PROJECT_STRUCTURE_TRANSPORT_REQUESTS, currentProjectStructureTransportNativeCases } from "./current-project-structure-transport-protocol.ts";
import { CURRENT_SCHEMATIC_DISPLAY_CLOCK_REQUESTS, currentSchematicDisplayClockNativeCases } from "./current-schematic-display-clock-protocol.ts";
import { CURRENT_GENERATED_INITIAL_CACHE_REQUESTS, currentGeneratedInitialCacheNativeCases } from "./current-generated-initial-cache-protocol.ts";
import { CURRENT_GENERATED_INITIAL_SYNC_REQUESTS, currentGeneratedInitialSyncNativeCases } from "./current-generated-initial-sync-protocol.ts";
import { CURRENT_GENERATED_PERIODIC_SYNC_REQUESTS, currentGeneratedPeriodicSyncNativeCases } from "./current-generated-periodic-sync-protocol.ts";
import { CURRENT_PROJECT_SYNC_QUIESCE_REQUESTS, currentProjectSyncQuiesceNativeCases } from "./current-project-sync-quiesce-protocol.ts";
import { CURRENT_PCB_VIA_LOCAL_UPLOAD_REQUESTS, currentPcbViaLocalUploadNativeCases } from "./current-pcb-via-local-upload-protocol.ts";
import { CURRENT_PCB_VIA_UPLOAD_REQUEST_REQUESTS, currentPcbViaUploadRequestNativeCases } from "./current-pcb-via-upload-request-protocol.ts";
import { CURRENT_PCB_VIA_SAVE_TAIL_OBSERVATION_REQUESTS, currentPcbViaSaveTailObservationNativeCases } from "./current-pcb-via-save-tail-observation-protocol.ts";
import { CURRENT_PCB_VIA_SAVE_TAIL_DELETE_CONTROL_REQUESTS, currentPcbViaSaveTailDeleteControlNativeCases } from "./current-pcb-via-save-tail-delete-control-protocol.ts";
import { CURRENT_PCB_VIA_POST_HISTORY_SYNC_REQUESTS, currentPcbViaPostHistorySyncNativeCases } from "./current-pcb-via-post-history-sync-protocol.ts";
import { CURRENT_PCB_VIA_SAVE_DRAIN_REQUESTS, currentPcbViaSaveDrainNativeCases } from "./current-pcb-via-save-drain-protocol.ts";

import { CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_REPLAY_NO_PUBLICATION_PROGRAM } from "./current-schematic-relevance-display-replay-program.ts";

type Kind = "function" | "expression";
const conditions = new Set<string>(), expressions = new Set<string>(), functions = new Set<string>([CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_REPLAY_NO_PUBLICATION_PROGRAM]);
const cases: readonly (Readonly<{ method: string; params: object }> | Readonly<{ phase: "via-post-sync-replay" }>)[] = [
  ...currentSchematicDisplaySaveNativeCases(),
  ...currentProjectSaveStructureNativeCases(),
  ...currentProjectSaveProducerNativeCases(),
  ...currentProjectStructureTransportNativeCases(),
  ...currentSchematicDisplayClockNativeCases(),
  ...currentGeneratedInitialCacheNativeCases(),
  ...currentGeneratedInitialSyncNativeCases(),
  ...currentGeneratedPeriodicSyncNativeCases(),
  ...currentProjectSyncQuiesceNativeCases(),
  ...currentProjectLibraryRefreshCases(),
  ...currentPcbViaLocalUploadNativeCases(),
  ...currentPcbViaUploadRequestNativeCases(),
  ...currentPcbViaSaveTailObservationNativeCases(),
  ...currentPcbViaSaveTailDeleteControlNativeCases(),
  ...currentPcbViaPostHistorySyncNativeCases(),
  ...currentPcbViaSaveDrainNativeCases(),
];
for (const command of cases) {
  if ("method" in command) {
  if ((command.method === "Debugger.setBreakpoint" || command.method === "Debugger.setBreakpointOnFunctionCall") && "condition" in command.params && typeof command.params.condition === "string") {
    conditions.add(command.params.condition); expressions.add(command.params.condition);
  }
  if (command.method === "Runtime.callFunctionOn" && "functionDeclaration" in command.params && typeof command.params.functionDeclaration === "string") { functions.add(command.params.functionDeclaration); }
  else if (command.method === "Debugger.evaluateOnCallFrame" && "expression" in command.params && typeof command.params.expression === "string") { expressions.add(command.params.expression); }
  }
}
/** Each source-producing call spends an original lane request. Summing the
 * complete finite budgets is a conservative upper bound, not an execution
 * count. Periodic calls, repeated producer/cache roles and three tail jobs
 * remain included through their own derived bounds. The fourth schematic local cache job adds one full shared head-job budget.
 * The independent fixed TEXT replay uses the same retained original Save node and its own source receipt. */
export const CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_OBSERVED_WORKER_SOURCE_REQUESTS =
  CURRENT_SCHEMATIC_DISPLAY_SAVE_REQUESTS.total +
  CURRENT_PROJECT_SAVE_STRUCTURE_REQUESTS.cdpRequests +
  CURRENT_PROJECT_SAVE_PRODUCER_REQUESTS.cdpRequests +
  CURRENT_PROJECT_STRUCTURE_TRANSPORT_REQUESTS.cdpRequests +
  CURRENT_SCHEMATIC_DISPLAY_CLOCK_REQUESTS.total +
  CURRENT_GENERATED_INITIAL_CACHE_REQUESTS.cdpRequests +
  CURRENT_GENERATED_INITIAL_SYNC_REQUESTS.cdpRequests +
  CURRENT_GENERATED_PERIODIC_SYNC_REQUESTS.cdpRequests +
  CURRENT_PROJECT_SYNC_QUIESCE_REQUESTS.cdpRequests +
  CURRENT_PROJECT_LIBRARY_REFRESH_REQUESTS.cdpRequests +
  CURRENT_PCB_VIA_LOCAL_UPLOAD_REQUESTS.cdpRequests +
  CURRENT_PCB_VIA_UPLOAD_REQUEST_REQUESTS.cdpRequests +
  CURRENT_PCB_VIA_SAVE_TAIL_OBSERVATION_REQUESTS.cdpRequests +
  CURRENT_PCB_VIA_SAVE_TAIL_DELETE_CONTROL_REQUESTS.cdpRequests +
  CURRENT_PCB_VIA_POST_HISTORY_SYNC_REQUESTS.total +
  CURRENT_PCB_VIA_SAVE_DRAIN_REQUESTS.cdpRequests +
  CURRENT_PCB_VIA_SAVE_TAIL_OBSERVATION_REQUESTS.additionalSharedRequests +
  CURRENT_PCB_VIA_SAVE_TAIL_OBSERVATION_REQUESTS.additionalSharedRequests / CURRENT_PCB_VIA_SAVE_TAIL_OBSERVATION_REQUESTS.additionalHeadJobs;

/** Persistent conditions are registered only when the original controller
 * installs their own fixed breakpoint. A later condition compilation consumes
 * the same bounded source reader; it is not a new caller expression. */
export function requireCurrentSchematicRelevanceDisplayObservedWorkerCondition(text: string): void {
  if (!conditions.has(text)) { throw new Error("SCHEMATIC_RELEVANCE_DISPLAY_OBSERVED_WORKER_CONDITION"); }
}
export function requireCurrentSchematicRelevanceDisplayObservedWorkerProgram(kind: Kind, text: string): void {
  const catalogue = kind === "function" ? functions : expressions;
  if ((kind !== "function" && kind !== "expression") || !catalogue.has(text)) { throw new Error("SCHEMATIC_RELEVANCE_DISPLAY_OBSERVED_WORKER_PROGRAM"); }
}
/** Inspector wraps callFunctionOn declarations in parentheses and retains
 * evaluateOnCallFrame expressions verbatim. No whitespace or wrapper fallback
 * is admitted. A different engine representation refuses before continuation. */
export function qualifyCurrentSchematicRelevanceDisplayObservedWorkerSource(raw: unknown, kind: Kind, text: string): void {
  requireCurrentSchematicRelevanceDisplayObservedWorkerProgram(kind, text);
  if (typeof raw !== "object" || raw === null || types.isProxy(raw)) { throw new Error("SCHEMATIC_RELEVANCE_DISPLAY_OBSERVED_WORKER_SOURCE"); }
  const prototype: unknown = Object.getPrototypeOf(raw);
  if ((prototype !== Object.prototype && prototype !== null) || Reflect.ownKeys(raw).length !== 1) { throw new Error("SCHEMATIC_RELEVANCE_DISPLAY_OBSERVED_WORKER_SOURCE"); }
  const descriptor = Object.getOwnPropertyDescriptor(raw, "scriptSource");
  // Exact equality to an already admitted fixed program bounds this single
  // Source field, without admitting a caller expression. No shared clock limit changes.
  if (descriptor === undefined || !Object.hasOwn(descriptor, "value") || descriptor.enumerable !== true ||
      descriptor.value !== (kind === "function" ? `(${text})` : text)) { throw new Error("SCHEMATIC_RELEVANCE_DISPLAY_OBSERVED_WORKER_SOURCE"); }
}
