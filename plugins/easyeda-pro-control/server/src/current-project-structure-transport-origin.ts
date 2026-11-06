/** The actual pre-project owner registry issues this origin. Visible fields
 * and a matching structural binding provide no worker or native custody. */
import type { GeneratedFixtureOpenCheckpoint } from "./managed-fixture-generated-open-checkpoint.ts";
import type { GeneratedSchematicFixtureOpenCheckpoint } from "./managed-schematic-fixture-open-checkpoint.ts";
import type { CurrentProjectStructureTransportCommand } from "./current-project-structure-transport-protocol.ts";
import type { CurrentProjectSaveStructureEvent } from "./current-project-save-structure-origin.ts";

export interface CurrentPcbViaStructureTransportOrigin { readonly profile: "private.current-pcb-via-structure-transport-origin.v1" }
export interface CurrentSchematicDisplayStructureTransportOrigin { readonly profile: "private.current-schematic-display-structure-transport-origin.v1" }
export type CurrentProjectStructureTransportOrigin = CurrentPcbViaStructureTransportOrigin | CurrentSchematicDisplayStructureTransportOrigin;
export interface CurrentProjectStructureTransportBindings {
  readonly sessionId: string; readonly scriptId: string; readonly uniqueContextId: string;
  readonly prepared: GeneratedFixtureOpenCheckpoint | GeneratedSchematicFixtureOpenCheckpoint;
  readonly request: (command: CurrentProjectStructureTransportCommand, cleanup: boolean) => Promise<unknown>;
  readonly nextEvent: () => Promise<CurrentProjectSaveStructureEvent>;
  readonly assertCurrent: () => Promise<void>; readonly assertOperationPending: () => void;
  readonly assertOriginalGenerationExited: () => Promise<void>; readonly fail: () => void;
}
/** Separate authority for the genuine pending body/clock/tree. It cannot be
 * serialized into history completion or full structure publication. */
export interface CurrentProjectStructureBodyReservation { readonly profile: "private.current-project-structure-body-reservation.v1" }
/** Actual main SQL callback plus original response publication; this is not
 * a worker task-finalizer, producer-frontier or saved/reopened proof. */
export interface CurrentProjectStructureMainPublication { readonly profile: "private.current-project-structure-main-publication.v1" }

export interface CurrentProjectStructureBodyReservationValue {
  readonly projectUuid: string; readonly branchUuid: string; readonly documentUuid: string;
  readonly bodySha256: string; readonly saveHeadTicket: number; readonly workerClock: number;
  readonly expectedStructureText: string;
}
export interface CurrentProjectStructureMainPublicationValue {
  readonly projectUuid: string; readonly branchUuid: string; readonly ticket: number; readonly structureSha256: string;
  readonly nativeChanges: 1; readonly nativeBeforeEpochMs: number; readonly nativeAfterEpochMs: number;
  readonly originalResponsePublished: true; readonly selectedSqlStillFenced: true;
}
