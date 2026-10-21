/** Finite original-worker grammar. Native adapters reconstruct the exact
 * program from phase; no caller code, scope index, property or callback call. */
import { CURRENT_PCB_STRING_BUFFERED_CALLBACK_ENVIRONMENT, CURRENT_PCB_STRING_BUFFER_CALLBACK_SELECTOR,
  CURRENT_PCB_STRING_COOPERATION_CALLBACK_SELECTOR, CURRENT_PCB_STRING_DRAIN_CALLBACK_SELECTOR,
  CURRENT_PCB_STRING_STRUCTURE_CALLBACK_SELECTOR, CURRENT_PCB_STRING_UPLOAD_CALLBACK_SELECTOR,
  CURRENT_PCB_STRING_UPLOAD_STRUCTURE_CALLBACK_SELECTOR } from "./current-pcb-string-producer-callback-program.ts";
import { CURRENT_PCB_STRING_COOPERATION_SELECTOR, CURRENT_PCB_STRING_COOPERATION_STATE,
  CURRENT_PCB_STRING_DEBOUNCE_SELECTOR, CURRENT_PCB_STRING_DEBOUNCE_STATE, CURRENT_PCB_STRING_STRUCTURE_SELECTOR,
  CURRENT_PCB_STRING_STRUCTURE_STATE, CURRENT_PCB_STRING_UPLOAD_SELECTOR, CURRENT_PCB_STRING_UPLOAD_STATE,
  CURRENT_PCB_STRING_UPLOAD_STRUCTURE_SELECTOR, CURRENT_PCB_STRING_UPLOAD_STRUCTURE_STATE } from "./current-pcb-string-producer-program.ts";
import { CURRENT_PCB_STRING_WORKER_GATE_PROGRAM, CURRENT_PCB_STRING_WORKER_GATE_SELECTOR,
  CURRENT_PCB_STRING_WORKER_PROJECT_SELECTOR } from "./current-pcb-string-worker-gate-program.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_STRING_WORKER_PRODUCER_OBJECT_GROUP = "easyeda-pro-control-string-worker-producers-v1";
/** 57 bounded read/qualification requests, then one original-worker release. */
export const CURRENT_PCB_STRING_WORKER_PRODUCER_REQUEST_COUNT = 58;
export const CURRENT_PCB_STRING_WORKER_PRODUCER_SEQUENCE = Object.freeze([
  "project", "gate-select", "properties", "properties", "properties", "properties", "properties", "properties", "properties", "properties", "properties",
  "properties", "properties", "gates",
  "upload-structure-select", "properties", "properties", "upload-structure", "upload-structure-callback", "properties",
  "structure-select", "properties", "properties", "structure", "properties", "properties", "debounce-select", "properties", "properties", "debounce", "structure-callback", "properties",
  "cooperation-select", "properties", "properties", "cooperation", "cooperation-callback", "properties",
  "upload-select", "properties", "properties", "upload", "properties", "properties", "upload-callback", "properties", "buffer-callback", "properties", "drain-callback", "properties",
  "properties", "properties", "properties", "properties", "properties", "properties", "buffered-environment", "release",
] as const);
export const CURRENT_PCB_STRING_WORKER_PRODUCER_REPLY_BYTES = 65_536;
export const CURRENT_PCB_STRING_WORKER_PRODUCER_OBSERVATION_BYTES = 131_072;
export const CURRENT_PCB_STRING_WORKER_PRODUCER_RETAINED_BYTES = 114_688;
export const CURRENT_PCB_STRING_WORKER_PRODUCER_EVALUATIONS = Object.freeze({
  project: CURRENT_PCB_STRING_WORKER_PROJECT_SELECTOR,
  "upload-structure-select": CURRENT_PCB_STRING_UPLOAD_STRUCTURE_SELECTOR,
  "structure-select": CURRENT_PCB_STRING_STRUCTURE_SELECTOR,
  "cooperation-select": CURRENT_PCB_STRING_COOPERATION_SELECTOR,
  "upload-select": CURRENT_PCB_STRING_UPLOAD_SELECTOR,
});
export const CURRENT_PCB_STRING_WORKER_PRODUCER_CALLS = Object.freeze({
  "gate-select": CURRENT_PCB_STRING_WORKER_GATE_SELECTOR, gates: CURRENT_PCB_STRING_WORKER_GATE_PROGRAM,
  "upload-structure": CURRENT_PCB_STRING_UPLOAD_STRUCTURE_STATE, structure: CURRENT_PCB_STRING_STRUCTURE_STATE,
  "debounce-select": CURRENT_PCB_STRING_DEBOUNCE_SELECTOR, debounce: CURRENT_PCB_STRING_DEBOUNCE_STATE,
  cooperation: CURRENT_PCB_STRING_COOPERATION_STATE, upload: CURRENT_PCB_STRING_UPLOAD_STATE,
  "upload-structure-callback": CURRENT_PCB_STRING_UPLOAD_STRUCTURE_CALLBACK_SELECTOR,
  "structure-callback": CURRENT_PCB_STRING_STRUCTURE_CALLBACK_SELECTOR,
  "cooperation-callback": CURRENT_PCB_STRING_COOPERATION_CALLBACK_SELECTOR,
  "upload-callback": CURRENT_PCB_STRING_UPLOAD_CALLBACK_SELECTOR,
  "buffer-callback": CURRENT_PCB_STRING_BUFFER_CALLBACK_SELECTOR,
  "drain-callback": CURRENT_PCB_STRING_DRAIN_CALLBACK_SELECTOR,
  "buffered-environment": CURRENT_PCB_STRING_BUFFERED_CALLBACK_ENVIRONMENT,
});
export type CurrentPcbStringWorkerProducerEvaluation = keyof typeof CURRENT_PCB_STRING_WORKER_PRODUCER_EVALUATIONS;
export type CurrentPcbStringWorkerProducerCall = keyof typeof CURRENT_PCB_STRING_WORKER_PRODUCER_CALLS;
export const CURRENT_PCB_STRING_WORKER_PRODUCER_CALL_ARGUMENTS = freezeDeep({
  "gate-select": { count: 0, returnByValue: false }, gates: { count: 2, returnByValue: true },
  "upload-structure": { count: 1, returnByValue: true }, structure: { count: 1, returnByValue: true },
  "debounce-select": { count: 1, returnByValue: false }, debounce: { count: 4, returnByValue: true },
  cooperation: { count: 1, returnByValue: true }, upload: { count: 1, returnByValue: true },
  "upload-structure-callback": { count: 1, returnByValue: false }, "structure-callback": { count: 3, returnByValue: false },
  "cooperation-callback": { count: 1, returnByValue: false }, "upload-callback": { count: 1, returnByValue: false },
  "buffer-callback": { count: 1, returnByValue: false }, "drain-callback": { count: 1, returnByValue: false },
  "buffered-environment": { count: 6, returnByValue: true },
} satisfies Record<CurrentPcbStringWorkerProducerCall, Readonly<{ count: number; returnByValue: boolean }>>);
export const CURRENT_PCB_STRING_WORKER_PRODUCER_EFFECTS = Object.freeze({
  throwOnSideEffect: true, silent: true, awaitPromise: false, generatePreview: false, userGesture: false,
} as const);
type Effects = typeof CURRENT_PCB_STRING_WORKER_PRODUCER_EFFECTS;
export type CurrentPcbStringWorkerProducerCommand = Readonly<{ sessionId: string }> & (
  | Readonly<{ workerProducerPhase: CurrentPcbStringWorkerProducerEvaluation; method: "Runtime.evaluate"; params: Effects & Readonly<{
    expression: string; uniqueContextId: string; returnByValue: false; timeout: 1000;
    objectGroup: typeof CURRENT_PCB_STRING_WORKER_PRODUCER_OBJECT_GROUP; includeCommandLineAPI: false; allowUnsafeEvalBlockedByCSP: false;
  }> }>
  | Readonly<{ workerProducerPhase: CurrentPcbStringWorkerProducerCall; method: "Runtime.callFunctionOn"; params: Effects & Readonly<{
    objectId: string; functionDeclaration: string; returnByValue: boolean;
    objectGroup: typeof CURRENT_PCB_STRING_WORKER_PRODUCER_OBJECT_GROUP; arguments: readonly Readonly<{ objectId: string }>[];
  }> }>
  | Readonly<{ workerProducerPhase: "properties"; method: "Runtime.getProperties"; params: Readonly<{
    objectId: string; ownProperties: true; accessorPropertiesOnly: false; generatePreview: false;
  }> }>
  | Readonly<{ workerProducerPhase: "release"; method: "Runtime.releaseObjectGroup"; params: Readonly<{
    objectGroup: typeof CURRENT_PCB_STRING_WORKER_PRODUCER_OBJECT_GROUP;
  }> }>
);
