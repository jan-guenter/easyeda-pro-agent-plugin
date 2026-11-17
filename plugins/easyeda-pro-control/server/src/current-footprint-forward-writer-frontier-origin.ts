/** Only the same full owner's original pre-navigation component and held
 * constructor may issue this native/event custody. Labels supply no grant. */
import type { CurrentFootprintForwardWriterFrontierCommand, CurrentFootprintForwardWriterFrontierLane, CurrentFootprintForwardWriterStartupCallbackRole } from "./current-footprint-forward-writer-frontier-protocol.ts";
import type { CurrentProjectSyncQuiesceOrigin } from "./current-project-sync-quiesce-origin.ts";

export interface CurrentFootprintForwardWriterStartupFrontierOrigin { readonly profile: "private.current-footprint-forward-writer-startup-frontier-origin.v1" }
export interface CurrentFootprintForwardWriterStartupFrontierEvent { readonly method: "Debugger.paused" | "Debugger.resumed"; readonly sessionId: string; readonly params: unknown }
export interface CurrentFootprintForwardWriterStartupFrontierBindings {
  readonly sourceRecords: number;
  readonly actual: Readonly<{ sessionId: string; scriptId: string; uniqueContextId: string; source: string; project: string; wrapper: string; callback: string }>;
  readonly timerOrigin: CurrentProjectSyncQuiesceOrigin;
  readonly request: (command: CurrentFootprintForwardWriterFrontierCommand) => Promise<unknown>;
  readonly event: (lane: CurrentFootprintForwardWriterFrontierLane) => Promise<CurrentFootprintForwardWriterStartupFrontierEvent>;
  readonly point: (lane: "callback" | "timer", role: string, id: string) => void;
  readonly control: (operation: "callback-held" | "timer-held" | "timer-complete" | "queue-open" | "complete", role?: CurrentFootprintForwardWriterStartupCallbackRole | "entry" | "returned") => Promise<void>;
  readonly journal: (kind: string, evidence: Readonly<Record<string, unknown>>) => Promise<void>;
  readonly assertCurrent: () => void;
  readonly assertOriginalGenerationExited: () => Promise<void>;
  readonly fail: (cause?: unknown) => void;
}
// oxlint-disable-next-line import/no-cycle -- Only the actual later Core birth installs and resolves this original private registry.
export { requireOriginalCurrentFootprintForwardWriterStartupFrontierOrigin } from "./current-pcb-diagnostic-owner.ts";
