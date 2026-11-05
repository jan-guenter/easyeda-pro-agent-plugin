/** Read-only custody for one real main construction/event cursor. Only the
 * original runner issues this token. A snapshot never admits native commands
 * or opens the currently unimplemented sequential structure handoff. */
import type { CurrentFootprintCopyMainBackendObservation, CurrentFootprintCopyMainBackendRunner } from "./current-footprint-copy-main-backend-runner.ts";

export interface CurrentFootprintForwardMainCursor {
  readonly profile: "private.current-footprint-forward-main-cursor.v1";
  readonly executionAuthorized: false;
}
export interface CurrentFootprintForwardMainCursorSnapshot {
  readonly issuer: CurrentFootprintCopyMainBackendRunner;
  readonly construction: CurrentFootprintCopyMainBackendObservation;
  readonly phase: "construction" | "request" | "completion" | "upload-settled" | "structure" | "released" | "failed";
  readonly normalRequests: number;
  readonly cleanupRequests: number;
  readonly pendingReplies: number;
  readonly pendingEvents: number;
  readonly incompleteFrame: boolean;
  readonly paused: boolean;
  readonly busy: boolean;
  readonly uploadRetirementAcknowledged: boolean;
  readonly sequentialStructureAdmissionAvailable: false;
  readonly executionAuthorized: false;
}
export { requireCurrentFootprintForwardMainCursor, requireCurrentFootprintForwardMainUploadSettlement } from "./current-footprint-copy-main-backend-runner.ts";
