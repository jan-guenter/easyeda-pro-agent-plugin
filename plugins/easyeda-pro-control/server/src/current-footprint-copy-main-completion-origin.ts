/** Getter-only native origin seam. No issuer exists until the combined owner
 * reserves/encodes this entire unit and transfers its genuine held-PB lease.
 * Caller callbacks, JSON handles and the historical held receipt cannot mint it. */
import type { CurrentFootprintCopyMainRequestHeldFinalPb } from "./current-footprint-copy-main-request-runner.ts";
import type { CurrentFootprintCopyMainCompletionSource } from "./current-footprint-copy-main-completion-source.ts";
import type { CurrentFootprintCopyMainCompletionCommand } from "./current-footprint-copy-main-completion-protocol.ts";

export interface CurrentFootprintCopyMainCompletionOrigin {
  readonly profile: "private.current-footprint-copy-main-completion-origin.v1";
  readonly executionAuthorized: false;
}
export interface CurrentFootprintCopyMainCompletionOriginBindings {
  readonly heldFinalPb: CurrentFootprintCopyMainRequestHeldFinalPb;
  readonly source: CurrentFootprintCopyMainCompletionSource;
  readonly scriptId: string;
  readonly assertOriginal: () => Promise<void>;
  readonly assertCleanup: () => Promise<void>;
  readonly assertOriginalGenerationExited: () => Promise<void>;
  readonly request: (command: CurrentFootprintCopyMainCompletionCommand, cleanup: boolean) => Promise<unknown>;
  readonly pump: (cleanup: boolean) => Promise<void>;
  readonly takeEvent: () => Readonly<{ method: "Debugger.paused" | "Debugger.resumed"; params: unknown }> | null;
  readonly retire: () => Promise<void>;
}
const originals = new WeakMap<CurrentFootprintCopyMainCompletionOrigin, CurrentFootprintCopyMainCompletionOriginBindings>();
export function requireCurrentFootprintCopyMainCompletionOrigin(token: CurrentFootprintCopyMainCompletionOrigin): CurrentFootprintCopyMainCompletionOriginBindings {
  const original = originals.get(token);
  if (original === undefined) { throw new Error("FOOTPRINT_MAIN_COMPLETION_NATIVE_ORIGIN_UNAVAILABLE"); }
  return original;
}
