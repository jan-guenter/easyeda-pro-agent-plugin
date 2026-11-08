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
  public reserveSaveDrainResume(event:CurrentSchematicDisplayRoutedEvent,role:string):void{this.reserveOriginalProducerContinuation(event,role,["historyReply","detachedEntry","syncEntry","syncDeferred","historyQueued","historyFinally","cloudReturned","cloudFinally","batchReturned","bufferDone","detachedReturned","headEntry","headPromise","headSuccess"]);}
  public reservePostHistorySyncResume(event:CurrentSchematicDisplayRoutedEvent,role:string):void{this.reserveOriginalProducerContinuation(event,role,["syncEntry","syncFull","syncLast","syncHistory","syncMerged","syncFinalizing","syncReturned"]);}
  public reserveSaveTailDeleteResume(event:CurrentSchematicDisplayRoutedEvent,role:"cacheDeleteCall"|"cacheDeleteReturned"):void{this.reserveOriginalProducerContinuation(event,role,["cacheDeleteCall","cacheDeleteReturned"]);}
  /** Reserve only the current original worker receive/body delivery. Native
   * control and source/receiver proof remain separate Core obligations. */
  public reserveModifyResume(event: CurrentSchematicDisplayRoutedEvent, role: "handler" | "batch" | "batchReturned" | "handlerReturned"): void { this.reserveOriginalModifyContinuation(event, role); }
  /** Reserve the original seven-role nested CM delivery only; the actual
   * native sender still needs its own source and consumed-intent proof. */
  public reserveModifyCmResume(event: CurrentSchematicDisplayRoutedEvent, role: "remote" | "onChange" | "ticket" | "ticketReturned" | "canWs" | "canWsReturned" | "remoteReturned"): void { this.reserveOriginalModifyCmContinuation(event, role); }
  /** The native remove response is already acknowledged by Core before this
   * original held-return token can retire an active routing epoch. */
  public retireModifyCmPoint(breakpointId: string, role: "remote" | "onChange" | "ticket" | "ticketReturned" | "canWs" | "canWsReturned" | "remoteReturned", event: CurrentSchematicDisplayRoutedEvent): void { this.retireOriginalModifyCmPoint(breakpointId, role, event); }
  /** Retire the four acknowledged enclosing guards without adopting the
   * original handler-return delivery as a fresh allocation. */
  public retireModifyParentPoint(breakpointId: string, role: "handler" | "batch" | "batchReturned" | "handlerReturned", event: CurrentSchematicDisplayRoutedEvent): void { this.retireOriginalModifyParentPoint(breakpointId, role, event); }
  /** Retire the exact acknowledged temporary structure epoch. Only Core's
   * original reader binding calls this after the native empty remove ACK. */
  public retireModifyStructurePoint(breakpointId: string, role: "startupEntry" | "startupReturn" | "modifyEntry" | "modifyReturned"): void { this.retireOriginalModifyStructurePoint(breakpointId, role); }
  /** Consume one delivered event from the original structure reader; the
   * native action separately enforces this wave's fixed three-role order. */
  public reserveModifyStructureResume(event: CurrentSchematicDisplayRoutedEvent, role: "modifyEntry" | "modifyReturned" | "initialFinally"): void { this.reserveOriginalModifyStructureContinuation(event, role); }
  public requireProducerFrontier():void{this.requireOriginalProducerFrontier();}
  protected override acceptsLane(lane: CurrentSchematicDisplayEventLane): boolean { return lane === "modify" || lane === "quiesce" || lane === "library" || super.acceptsLane(lane); }
  // oxlint-disable-next-line eslint/class-methods-use-this -- This protected virtual policy keeps the original owner limits fixed while the dedicated seven-record subclass supplies its separate finite policy.
  protected override maximumRegisteredPoints(): number { return 59 + 2 + 7 + 3 + 4 + 7; }
}
