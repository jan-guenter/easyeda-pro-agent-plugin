/** Exact synchronous reference-service path. A manager [] is insufficient:
 * the worker must publish success and rearm its own original service task. */
import {
  CURRENT_FOOTPRINT_INVERSE_GET_COMPLETION_SITES as SHARED,
  qualifyCurrentFootprintInverseGetCompletionSource,
} from "./current-footprint-inverse-get-completion-source.ts";
import { qualifyCurrentFootprintInverseReferenceQuerySource } from "./current-footprint-inverse-reference-query-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_INVERSE_REFERENCE_WORKER_SITES = freezeDeep({
  entry: { role: "entry", lineNumber: 0, columnNumber: 8403, functionName: "s", functionLine: 0, functionColumn: 8383, expression: "[this,r,e,t,s]" },
  returned: SHARED.returned,
  serviceReturn: SHARED.serviceReturn,
  outerFailure: SHARED.outerFailure,
  post: SHARED.post,
  posted: SHARED.posted,
  postReturn: SHARED.postReturn,
  local: SHARED.local,
  localReturn: SHARED.localReturn,
  taskFailure: SHARED.taskFailure,
  taskReturn: SHARED.taskReturn,
  eventReturn: SHARED.eventReturn,
} as const);
export const CURRENT_FOOTPRINT_INVERSE_REFERENCE_WORKER_ROLES = Object.freeze([
  "entry", "returned", "serviceReturn", "outerFailure", "post", "posted",
  "postReturn", "local", "localReturn", "taskFailure", "taskReturn", "eventReturn",
] as const);
export type CurrentFootprintInverseReferenceWorkerRole = keyof typeof CURRENT_FOOTPRINT_INVERSE_REFERENCE_WORKER_SITES;
export const CURRENT_FOOTPRINT_INVERSE_REFERENCE_WORKER_ORDER = Object.freeze([
  "returned", "post-publish", "posted-publish", "postReturn-publish",
  "post-whohas", "posted-whohas", "postReturn-whohas",
  "serviceReturn", "taskReturn", "eventReturn",
  "local-publish", "localReturn-publish", "local-whohas", "localReturn-whohas",
] as const);
export const CURRENT_FOOTPRINT_INVERSE_REFERENCE_WORKER_TOPICS = Object.freeze({
  "pcb-all": "/mgr/projectWorker/pcb/getAllArrData",
  "footprint-derived": "/mgr/projectWorker/footprint/getKeysBySource",
  "device-all": "/mgr/projectWorker/device/getAllArrData",
} as const);
export function qualifyCurrentFootprintInverseReferenceWorkerSource(input: unknown): string {
  if (typeof input !== "string") { throw new TypeError("FOOTPRINT_INVERSE_REFERENCE_WORKER_SOURCE"); }
  qualifyCurrentFootprintInverseReferenceQuerySource(input, "worker");
  return qualifyCurrentFootprintInverseGetCompletionSource(input);
}
