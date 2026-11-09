/** Original Core custody for the one Modify TEXT suppression wave. This
 * interface creates no token, event reader, native control or resume grant. */
import type { CurrentProjectSaveStructureEvent } from "./current-project-save-structure-origin.ts";
import type { CurrentSchematicRelevanceModifyWorkerPrepared } from "./current-schematic-relevance-modify-worker-collector.ts";
import type { CurrentSchematicRelevancePublicationPayload } from "./current-schematic-relevance-publication-body-replies.ts";
import type { CurrentSchematicRelevanceModifyStructureCommand } from "./current-schematic-relevance-modify-structure-protocol.ts";

export interface CurrentSchematicRelevanceModifyStructureOrigin { readonly profile: "private.current-schematic-relevance-modify-structure-origin.v2" }
export interface CurrentSchematicRelevanceModifyStructureReader {
  readonly projectObjectId: string;
  readonly uploadWrapperObjectId: string;
  readonly uploadCallbackObjectId: string;
  readonly assertCurrent: () => void;
}
export interface CurrentSchematicRelevanceModifyStructureBindings {
  readonly sessionId: string;
  readonly scriptId: string;
  readonly nativeObjectId: string;
  readonly projectObjectId: string;
  readonly projectUuid: string;
  readonly worker: CurrentSchematicRelevanceModifyWorkerPrepared;
  readonly payload: Readonly<CurrentSchematicRelevancePublicationPayload>;
  readonly assertCurrent: () => Promise<void>;
  readonly assertModifyPending: () => void;
  /** Core reserves the exact original router event inside the actual native
   * transfer. Null is accepted only for fixed passive or allocation commands. */
  readonly request: (command: CurrentSchematicRelevanceModifyStructureCommand, originalEvent: CurrentProjectSaveStructureEvent | null,
    retainAllocationReply?: (reply: unknown) => void) => Promise<unknown>;
  readonly fail: () => void;
}
export interface CurrentSchematicRelevanceModifyStructureCompleted {
  readonly profile: "private.current-schematic-relevance-modify-structure-completed.v1";
  readonly originalReaderJoined: true;
  readonly originalSingleTextNoPublicationObserved: true;
  readonly originalSerialPromiseFulfilledUndefined: true;
  readonly originalSerialIdleObserved: true;
  readonly workerCompleted: false;
  readonly modifyCompleted: false;
  readonly saveAuthorized: false;
}
