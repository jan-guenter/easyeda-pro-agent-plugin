/** Inert finite seven-record startup routing. This class resumes no realm and
 * cannot issue an original native, timer or design-write capability. */
import { CURRENT_PCB_VIA_LOCAL_UPLOAD_ROLES } from "./current-pcb-via-local-upload-protocol.ts";
import type { CurrentPcbViaLocalUploadRole } from "./current-pcb-via-local-upload-protocol.ts";
import { CURRENT_PCB_VIA_UPLOAD_REQUEST_ROLES } from "./current-pcb-via-upload-request-protocol.ts";
import type { CurrentPcbViaUploadRequestRole } from "./current-pcb-via-upload-request-protocol.ts";
import { CurrentSchematicDisplayEventRouter } from "./current-schematic-display-event-router.ts";
import type { CurrentSchematicDisplayEventLane, CurrentSchematicDisplayRoutedEvent } from "./current-schematic-display-event-router.ts";

export class CurrentSchematicRelevanceDisplayEventRouter extends CurrentSchematicDisplayEventRouter {
  public reserveSaveLocalResume(event:CurrentSchematicDisplayRoutedEvent,role:CurrentPcbViaLocalUploadRole):void{this.reserveOriginalProducerContinuation(event,role,CURRENT_PCB_VIA_LOCAL_UPLOAD_ROLES);}
  public reserveSaveUploadResume(event:CurrentSchematicDisplayRoutedEvent,role:CurrentPcbViaUploadRequestRole):void{this.reserveOriginalProducerContinuation(event,role,CURRENT_PCB_VIA_UPLOAD_REQUEST_ROLES);}
  protected override acceptsLane(lane: CurrentSchematicDisplayEventLane): boolean { return lane === "quiesce" || lane === "library" || super.acceptsLane(lane); }
  // oxlint-disable-next-line eslint/class-methods-use-this -- This protected virtual policy keeps the original owner limits fixed while the dedicated seven-record subclass supplies its separate finite policy.
  protected override maximumRegisteredPoints(): number { return 59 + 2 + 7; }
}
