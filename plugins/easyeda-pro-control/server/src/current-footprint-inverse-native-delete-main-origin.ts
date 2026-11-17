/** Visible fields issue no main cursor. Only the retained original selected
 * backend can populate the private registry used by the native DELETE owner. */
import type { CurrentFootprintInverseNativeDeleteMainHistoryCommand } from "./current-footprint-inverse-native-delete-main-history-protocol.ts";
import type { CurrentProjectHistorySqlEffects } from "./current-project-history-sql-effects.ts";
import type { CurrentFootprintInverseNativeDeleteMainBeginCommand } from "./current-footprint-inverse-native-delete-main-begin-protocol.ts";
import type { CurrentFootprintInverseNativeDeleteMainBeginResult } from "./current-footprint-inverse-native-delete-main-begin-custody.ts";
import type { CurrentFootprintInverseNativeDeleteMainCommand } from "./current-footprint-inverse-native-delete-main-protocol.ts";
import type { CurrentFootprintCopyMainRequestSource } from "./current-footprint-copy-main-request-source.ts";
import type { CurrentSelectedFileMainRequestObservation } from "./current-selected-file-main-request-reader.ts";

export interface CurrentFootprintInverseNativeDeleteMainRequestOrigin { readonly profile: "private.current-footprint-inverse-native-delete-main-request-origin.v1" }
export interface CurrentFootprintInverseNativeDeleteMainEvent { readonly method: "Debugger.paused" | "Debugger.resumed"; readonly params: unknown }
export interface CurrentFootprintInverseNativeDeleteMainBackendBindings {
  readonly scriptId: string; readonly constructionObjectId: string; readonly source: CurrentFootprintCopyMainRequestSource;
  readonly persistentDriverBreakpointId: string; readonly sqlCaptureObjectId: string;
  readonly historyRequest: (command: CurrentFootprintInverseNativeDeleteMainHistoryCommand, cleanup: boolean) => Promise<unknown>;
  readonly requireHistoryArmed: () => void;
  readonly startHistory: () => Readonly<{ transactionObjectId: string; callbackBreakpointId: string }>;
  readonly originalHistoryEffects: () => CurrentProjectHistorySqlEffects;
  readonly beginRequest: (command: CurrentFootprintInverseNativeDeleteMainBeginCommand, cleanup: boolean) => Promise<unknown>;
  readonly requireBeginArmed: () => void;
  readonly originalBeginResult: () => CurrentFootprintInverseNativeDeleteMainBeginResult;
  readonly request: (command: CurrentFootprintInverseNativeDeleteMainCommand, cleanup: boolean) => Promise<unknown>;
  readonly nextEvent: () => Promise<CurrentFootprintInverseNativeDeleteMainEvent>;
  readonly observeRequest: () => Promise<CurrentSelectedFileMainRequestObservation>;
  readonly requireOriginalRequest: (packet: CurrentSelectedFileMainRequestObservation) => void;
  readonly requireOriginalControllerBody: () => void;
  readonly requireOriginalActorSql: () => Readonly<{ actorObjectId: string; sqlObjectId: string; dataStr: string }>;
  readonly continuePlannedController: () => Promise<void>;
  readonly continuePlannedContext: () => Promise<void>;
  readonly continuePlannedDriver: (packet: CurrentSelectedFileMainRequestObservation) => Promise<void>;
  readonly continueReadonlyRequest: (packet: CurrentSelectedFileMainRequestObservation) => Promise<void>;
  readonly assertCurrent: () => Promise<void>;
  readonly fail: (cause: unknown) => void;
}
export interface CurrentFootprintInverseNativeDeleteMainBindings extends CurrentFootprintInverseNativeDeleteMainBackendBindings {
  readonly assertBeforeOriginalUpload: () => void;
  readonly assertOriginalUploadWritten: () => void;
  readonly requireOriginalBody: () => Readonly<{dataStr:string;bodySha256:string}>;
}

export interface CurrentFootprintInverseNativeDeleteMainPlan {
  readonly target: Readonly<{projectUuid:string;branchUuid:string;rawWindowsPath:string}>;
}
