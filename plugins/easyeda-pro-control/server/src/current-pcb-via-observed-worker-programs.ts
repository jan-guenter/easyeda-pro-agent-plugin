/** Fixed generated Via worker programs only. Exact text membership is inert;
 * only the original controller can correlate a submitted program with its
 * same-session Inspector event and source reply. */
/* oxlint-disable import/max-dependencies -- The closed catalogue derives its strings and repeated-call bounds from every original finite lane; a caller registry would admit arbitrary execution. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_PCB_VIA_REPLAY_NO_PUBLICATION_PROGRAM } from "./current-pcb-via-replay-program.ts";
import { CURRENT_PCB_VIA_SAVE_REQUESTS, currentPcbViaSaveNativeCases } from "./current-pcb-via-save-protocol.ts";
import { CURRENT_PROJECT_SAVE_STRUCTURE_REQUESTS, currentProjectSaveStructureNativeCases } from "./current-project-save-structure-protocol.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_REQUESTS, currentProjectSaveProducerNativeCases } from "./current-project-save-producer-protocol.ts";
import { CURRENT_PROJECT_STRUCTURE_TRANSPORT_REQUESTS, currentProjectStructureTransportNativeCases } from "./current-project-structure-transport-protocol.ts";
import { CURRENT_PCB_VIA_CLOCK_REQUESTS, currentPcbViaClockNativeCases } from "./current-pcb-via-clock-protocol.ts";
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

type Kind = "function" | "expression";
const expressions = new Set<string>(), functions = new Set<string>([CURRENT_PCB_VIA_REPLAY_NO_PUBLICATION_PROGRAM]);
const cases: readonly (Readonly<{ method: string; params: object }> | Readonly<{ phase: "via-post-sync-replay" }>)[] = [
  ...currentPcbViaSaveNativeCases(),
  ...currentProjectSaveStructureNativeCases(),
  ...currentProjectSaveProducerNativeCases(),
  ...currentProjectStructureTransportNativeCases(),
  ...currentPcbViaClockNativeCases(),
  ...currentGeneratedInitialCacheNativeCases(),
  ...currentGeneratedInitialSyncNativeCases(),
  ...currentGeneratedPeriodicSyncNativeCases(),
  ...currentProjectSyncQuiesceNativeCases(),
  ...currentPcbViaLocalUploadNativeCases(),
  ...currentPcbViaUploadRequestNativeCases(),
  ...currentPcbViaSaveTailObservationNativeCases(),
  ...currentPcbViaSaveTailDeleteControlNativeCases(),
  ...currentPcbViaPostHistorySyncNativeCases(),
  ...currentPcbViaSaveDrainNativeCases(),
];
for (const command of cases) {
  if (!("method" in command)) { continue; }
  if (command.method === "Runtime.callFunctionOn" && "functionDeclaration" in command.params && typeof command.params.functionDeclaration === "string") { functions.add(command.params.functionDeclaration); }
  else if (command.method === "Debugger.evaluateOnCallFrame" && "expression" in command.params && typeof command.params.expression === "string") { expressions.add(command.params.expression); }
}
/** Each source-producing call spends an original lane request. Summing the
 * complete finite budgets is a conservative upper bound, not an execution
 * count. Periodic calls, repeated producer/cache roles and three tail jobs
 * remain included through their own derived bounds. One replay is separate. */
export const CURRENT_PCB_VIA_OBSERVED_WORKER_SOURCE_REQUESTS =
  CURRENT_PCB_VIA_SAVE_REQUESTS.total +
  CURRENT_PROJECT_SAVE_STRUCTURE_REQUESTS.cdpRequests +
  CURRENT_PROJECT_SAVE_PRODUCER_REQUESTS.cdpRequests +
  CURRENT_PROJECT_STRUCTURE_TRANSPORT_REQUESTS.cdpRequests +
  CURRENT_PCB_VIA_CLOCK_REQUESTS.total +
  CURRENT_GENERATED_INITIAL_CACHE_REQUESTS.cdpRequests +
  CURRENT_GENERATED_INITIAL_SYNC_REQUESTS.cdpRequests +
  CURRENT_GENERATED_PERIODIC_SYNC_REQUESTS.cdpRequests +
  CURRENT_PROJECT_SYNC_QUIESCE_REQUESTS.cdpRequests +
  CURRENT_PCB_VIA_LOCAL_UPLOAD_REQUESTS.cdpRequests +
  CURRENT_PCB_VIA_UPLOAD_REQUEST_REQUESTS.cdpRequests +
  CURRENT_PCB_VIA_SAVE_TAIL_OBSERVATION_REQUESTS.cdpRequests +
  CURRENT_PCB_VIA_SAVE_TAIL_DELETE_CONTROL_REQUESTS.cdpRequests +
  CURRENT_PCB_VIA_POST_HISTORY_SYNC_REQUESTS.total +
  CURRENT_PCB_VIA_SAVE_DRAIN_REQUESTS.cdpRequests +
  CURRENT_PCB_VIA_SAVE_TAIL_OBSERVATION_REQUESTS.additionalSharedRequests + 1;

export function requireCurrentPcbViaObservedWorkerProgram(kind: Kind, text: string): void {
  const catalogue = kind === "function" ? functions : expressions;
  if ((kind !== "function" && kind !== "expression") || !catalogue.has(text)) { throw new Error("PCB_VIA_OBSERVED_WORKER_PROGRAM"); }
}
const replySchema = z.strictObject({ scriptSource: z.string() });
/** Inspector wraps callFunctionOn declarations in parentheses and retains
 * evaluateOnCallFrame expressions verbatim. No whitespace or wrapper fallback
 * is admitted. A different engine representation refuses before continuation. */
export function qualifyCurrentPcbViaObservedWorkerSource(raw: unknown, kind: Kind, text: string): void {
  requireCurrentPcbViaObservedWorkerProgram(kind, text);
  const reply = replySchema.parse(captureCurrentPcbStringClockReply(raw).value);
  if (reply.scriptSource !== (kind === "function" ? `(${text})` : text)) { throw new Error("PCB_VIA_OBSERVED_WORKER_SOURCE"); }
}
