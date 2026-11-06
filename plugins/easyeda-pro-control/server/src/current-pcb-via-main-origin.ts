/** Visible fields issue no main cursor. Only the retained original selected
 * backend can populate the private registry used by the Via native owner. */
import type { CurrentPcbViaMainStructureCommand, CurrentPcbViaMainStructureExpected } from "./current-pcb-via-main-structure-protocol.ts";
import type { CurrentProjectStructureSqlEffects } from "./current-project-structure-sql-effects.ts";
import type { CurrentPcbViaMainHistoryCommand } from "./current-pcb-via-main-history-protocol.ts";
import type { CurrentProjectHistorySqlEffects } from "./current-project-history-sql-effects.ts";
import type { CurrentPcbViaMainBeginCommand } from "./current-pcb-via-main-begin-protocol.ts";
import type { CurrentPcbViaMainBeginResult } from "./current-pcb-via-main-begin-custody.ts";
import type { CurrentPcbViaMainCommand } from "./current-pcb-via-main-protocol.ts";
import type { CurrentFootprintCopyMainRequestSource } from "./current-footprint-copy-main-request-source.ts";
import type { CurrentSelectedFileMainRequestObservation } from "./current-selected-file-main-request-reader.ts";

export interface CurrentPcbViaMainOrigin { readonly profile: "private.current-pcb-via-main-origin.v1" }
export interface CurrentPcbViaMainEvent { readonly method: "Debugger.paused" | "Debugger.resumed"; readonly params: unknown }
export interface CurrentPcbViaMainBackendBindings {
  readonly scriptId: string; readonly constructionObjectId: string; readonly source: CurrentFootprintCopyMainRequestSource;
  readonly persistentDriverBreakpointId: string; readonly sqlCaptureObjectId: string;
  readonly structureRequest: (command: CurrentPcbViaMainStructureCommand, cleanup: boolean) => Promise<unknown>;
  readonly requireStructureArmed: () => void;
  readonly startStructure: (request: CurrentSelectedFileMainRequestObservation) => void;
  readonly structureExpected: () => CurrentPcbViaMainStructureExpected;
  readonly originalStructureEffects: () => CurrentProjectStructureSqlEffects;
  readonly historyRequest: (command: CurrentPcbViaMainHistoryCommand, cleanup: boolean) => Promise<unknown>;
  readonly requireHistoryArmed: () => void;
  readonly startHistory: () => Readonly<{ transactionObjectId: string; callbackBreakpointId: string }>;
  readonly originalHistoryEffects: () => CurrentProjectHistorySqlEffects;
  readonly beginRequest: (command: CurrentPcbViaMainBeginCommand, cleanup: boolean) => Promise<unknown>;
  readonly requireBeginArmed: () => void;
  readonly originalBeginResult: () => CurrentPcbViaMainBeginResult;
  readonly request: (command: CurrentPcbViaMainCommand, cleanup: boolean) => Promise<unknown>;
  readonly nextEvent: () => Promise<CurrentPcbViaMainEvent>;
  readonly observeRequest: () => Promise<CurrentSelectedFileMainRequestObservation>;
  readonly requireOriginalRequest: (packet: CurrentSelectedFileMainRequestObservation) => void;
  readonly requireOriginalControllerBody: () => void;
  readonly requireOriginalActorSql: () => Readonly<{ actorObjectId: string; sqlObjectId: string; dataStr: string }>;
  readonly continuePlannedController: () => Promise<void>;
  readonly continuePlannedContext: () => Promise<void>;
  readonly continuePlannedDriver: (packet: CurrentSelectedFileMainRequestObservation) => Promise<void>;
  readonly continueReadonlyRequest: (packet: CurrentSelectedFileMainRequestObservation) => Promise<void>;
  readonly assertCurrent: () => Promise<void>;
  readonly fail: () => void;
}
export interface CurrentPcbViaMainBindings extends CurrentPcbViaMainBackendBindings { readonly assertSaveAttempt: () => void }
