/** Original full-writer bootstrap/channel custody. Matching fields cannot
 * construct any of these registries or continue a held producer. */
import type { CurrentProjectSaveProducerCommand } from "./current-project-save-producer-protocol.ts";
import type { CurrentProjectSaveProducerGuardCommand } from "./current-project-save-producer-guard-protocol.ts";
import type { CurrentPcbWorkerStartupDependency } from "./current-pcb-worker-startup-contract.ts";
import type { CurrentFootprintInverseInitialCacheCommand } from "./current-footprint-inverse-initial-cache-protocol.ts";
import type { CurrentFootprintInverseInitialSyncCommand } from "./current-footprint-inverse-initial-sync-protocol.ts";
import type { CurrentFootprintForwardWriterFrontierChannelCommand } from "./current-footprint-forward-writer-frontier-protocol.ts";

export interface CurrentFootprintForwardWriterProducerBootstrap { readonly profile: "private.current-footprint-forward-writer-producer-bootstrap.v1" }
export interface CurrentFootprintForwardWriterProducerEvents {
  readonly acceptsPause: (input: unknown) => boolean;
  readonly paused: (input: unknown) => void;
  readonly resumed: () => void;
  readonly lost: () => void;
}
export interface CurrentFootprintForwardWriterProducerBootstrapBindings {
  readonly issuer: object;
  readonly dependency: CurrentPcbWorkerStartupDependency;
  readonly scriptId: string;
  readonly workerSource: string | null;
  readonly project: string;
  readonly wrapper: string;
  readonly callback: string;
  readonly assertPaused: () => Promise<void>;
  readonly assertCurrent: () => Promise<void>;
  readonly observeExited: () => Promise<void>;
  readonly subscribe: (events: CurrentFootprintForwardWriterProducerEvents) => void;
  readonly fail: () => void;
}
export interface CurrentFootprintForwardWriterProducerChannelBindings {
  readonly dependency: CurrentPcbWorkerStartupDependency;
  readonly context: () => Readonly<{ sessionId: string; uniqueContextId: string }>;
  readonly assertCurrent: () => Promise<void>;
  readonly bind: (scriptId: string) => Promise<void>;
  readonly enroll: () => Promise<void>;
  readonly request: (command: CurrentProjectSaveProducerCommand | CurrentProjectSaveProducerGuardCommand | CurrentFootprintInverseInitialCacheCommand | CurrentFootprintInverseInitialSyncCommand | CurrentFootprintForwardWriterFrontierChannelCommand) => Promise<unknown>;
  readonly prepare: (bootstrap: CurrentFootprintForwardWriterProducerBootstrap) => Promise<void>;
}
export type CurrentFootprintForwardWriterProducerPrepare = (bootstrap: CurrentFootprintForwardWriterProducerBootstrap) => Promise<void>;

export { requireCurrentFootprintForwardWriterProducerBootstrap, requireOriginalCurrentFootprintForwardWriterCallbackTargets } from "./current-pcb-worker-construction-runner.ts";
export { requireCurrentFootprintForwardWriterProducerChannel } from "./current-pcb-worker-startup-channel.ts";
