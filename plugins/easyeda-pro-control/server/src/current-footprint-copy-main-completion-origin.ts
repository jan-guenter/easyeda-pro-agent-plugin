/** Private getter. Only the original main scheduler can issue an origin after
 * genuine native capacity admission and an atomic original held-PB transfer.
 * The current54-command purpose cannot reserve this75-command unit. */
import type { CurrentFootprintCopyMainRequestHeldFinalPb, CurrentFootprintCopyMainRequestHeldFinalPbBindings } from "./current-footprint-copy-main-request-runner.ts";
import type { CurrentFootprintCopyMainCompletionSource } from "./current-footprint-copy-main-completion-source.ts";
import type { CurrentFootprintCopyMainCompletionCommand } from "./current-footprint-copy-main-completion-protocol.ts";

export interface CurrentFootprintCopyMainCompletionOrigin {
  readonly profile: "private.current-footprint-copy-main-completion-origin.v1";
  readonly executionAuthorized: false;
}
export interface CurrentFootprintCopyMainCompletionOriginBindings {
  readonly heldFinalPb: CurrentFootprintCopyMainRequestHeldFinalPb;
  readonly transferredHeld: CurrentFootprintCopyMainRequestHeldFinalPbBindings;
  readonly source: CurrentFootprintCopyMainCompletionSource;
  readonly scriptId: string;
  readonly assertOriginal: () => Promise<void>;
  readonly assertCleanup: () => Promise<void>;
  readonly assertOriginalGenerationExited: () => Promise<void>;
  readonly assertOriginalHeld: () => Promise<void>;
  readonly fail: () => void;
  readonly request: (command: CurrentFootprintCopyMainCompletionCommand, cleanup: boolean) => Promise<unknown>;
  readonly pump: (cleanup: boolean) => Promise<void>;
  readonly takeEvent: () => Readonly<{ method: "Debugger.paused" | "Debugger.resumed"; params: unknown }> | null;
  readonly retire: () => Promise<void>;
}
export { requireCurrentFootprintCopyMainCompletionOrigin } from "./current-footprint-copy-main-backend-runner.ts";
