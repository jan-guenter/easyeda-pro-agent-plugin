/** Fixed Inspector helpers used while the original PROJECT source is held.
 * Application scripts and structurally similar source are never admitted. */
import { CURRENT_PROJECT_STRUCTURE_TRANSPORT_PROGRAMS } from "./current-project-structure-transport-programs.ts";
import { CURRENT_NATIVE_CACHE_RESPONSE_INTRINSIC_CALLS } from "./current-native-cache-response-intrinsics.ts";

export const CURRENT_PROJECT_WORKER_SETUP_HELPERS = Object.freeze([
  CURRENT_PROJECT_STRUCTURE_TRANSPORT_PROGRAMS.capture,
  CURRENT_NATIVE_CACHE_RESPONSE_INTRINSIC_CALLS.constructors.program,
  CURRENT_NATIVE_CACHE_RESPONSE_INTRINSIC_CALLS.members.program,
  CURRENT_NATIVE_CACHE_RESPONSE_INTRINSIC_CALLS.reprove.program,
]);
export const CURRENT_PROJECT_WORKER_SETUP_HELPER_REQUESTS = CURRENT_PROJECT_WORKER_SETUP_HELPERS.length;
export function requireCurrentProjectWorkerSetupHelper(program: string): void {
  if (!CURRENT_PROJECT_WORKER_SETUP_HELPERS.includes(program)) { throw new Error("PROJECT_WORKER_SETUP_HELPER_PROGRAM"); }
}
export function qualifyCurrentProjectWorkerSetupHelperSource(input: unknown, program: string): void {
  requireCurrentProjectWorkerSetupHelper(program);
  if (typeof input !== "string" || input !== `(${program})`) { throw new Error("PROJECT_WORKER_SETUP_HELPER_SOURCE"); }
}
