/** Distinct inverse-only original worker/Main join. Data-only completions from
 * other purposes or an independently constructed cursor cannot issue it. */
import type { CurrentFootprintForwardSavedCheckpoint } from "./current-footprint-copy-held-saved-generation.ts";
import type { CurrentFootprintInverseBootstrapArguments } from "./current-footprint-inverse-bootstrap-origin.ts";
import type { CurrentFootprintInverseInitialSyncData } from "./current-footprint-inverse-initial-sync-data.ts";
import type { CurrentFootprintInverseMainHistoryRows } from "./current-footprint-inverse-main-history-custody.ts";
import type { CurrentFootprintInverseInitialSyncNativeCommand } from "./current-footprint-inverse-initial-sync-protocol.ts";
import type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";

export interface CurrentFootprintInverseInitialSyncOrigin { readonly profile: "private.current-footprint-inverse-initial-sync-origin.v1" }
export interface CurrentFootprintInverseInitialSyncCompletion { readonly profile: "private.current-footprint-inverse-initial-sync-completion.v1" }
export interface CurrentFootprintInverseInitialSyncOriginBindings {
  readonly prepared: CurrentFootprintForwardSavedCheckpoint; readonly actual: CurrentFootprintInverseBootstrapArguments; readonly data: CurrentFootprintInverseInitialSyncData;
  readonly producer: Readonly<{ wrapper: string; callback: string }>; readonly originalBreakpoints: readonly Readonly<{ role: string; id: string }>[];
  readonly headEntry: () => string; readonly assertCurrent: () => void; readonly fail: () => void;
  readonly armHistory: (ordinal: 1 | 2 | 3 | 4) => Promise<void>; readonly waitHistory: (ordinal: 1 | 2 | 3 | 4) => Promise<CurrentFootprintInverseMainHistoryRows>; readonly requireHistory: (ordinal: 1 | 2 | 3 | 4) => CurrentFootprintInverseMainHistoryRows;
  readonly request: (command: CurrentFootprintInverseInitialSyncNativeCommand) => Promise<unknown>; readonly nextEvent: () => Promise<DiagnosticEvent>;
  readonly complete: (packet: CurrentFootprintInverseInitialSyncCompletion) => Promise<void>;
}
