/* oxlint-disable import/max-dependencies -- The original callback facade binds independently fixed read and partial-continuation cursors to one genuine owner and event lane. */
import type {CurrentSchematicRelevanceModifyWorkerPrepared} from "./current-schematic-relevance-modify-worker-collector.ts";
import type {CurrentSchematicRelevancePublicationNativePrepared} from "./current-schematic-relevance-publication-native-collector.ts";
import type {CurrentSchematicRelevancePublicationPostHeld} from "./current-schematic-relevance-publication-body-collector.ts";
import type {CurrentSchematicRelevancePublicationPublishHeld,CurrentSchematicRelevanceSdkGateRun} from "./current-schematic-relevance-sdk-gate-collector.ts";
import type {CurrentSchematicRelevanceNormalCommandUiReturned} from "./current-schematic-relevance-normal-command-ui-collector.ts";
import type {CurrentSchematicRelevanceFileSaveUiReturned} from "./current-schematic-relevance-file-save-ui-collector.ts";
import type {CurrentSchematicRelevanceRenderDelegateStoreReturned} from "./current-schematic-relevance-render-delegate-collector.ts";
import type {CurrentSchematicRelevanceStatusTabLookupHeld} from "./current-schematic-relevance-status-tab-lookup-collector.ts";
import type {CurrentSchematicRelevanceStatusTabMutationHeld} from "./current-schematic-relevance-status-tab-mutation-collector.ts";
import type {CurrentSchematicRelevanceStatusSubscriberHeld} from "./current-schematic-relevance-status-subscriber-collector.ts";
import type {CurrentSchematicRelevanceStatusCloneDependencies} from "./current-schematic-relevance-status-clone-collector.ts";
import type {CurrentSchematicRelevanceStatusDeliveryHeld} from "./current-schematic-relevance-status-delivery-cursor.ts";
import type {CurrentSchematicRelevanceStatusBusHeld} from "./current-schematic-relevance-status-bus-cursor.ts";
import type {CurrentSchematicRelevanceHistoryStatusHeld} from "./current-schematic-relevance-history-status-cursor.ts";
import type {CurrentSchematicRelevanceUploadReturnHeld} from "./current-schematic-relevance-upload-return-cursor.ts";
import type {CurrentSchematicRelevancePendingCacheHeld} from "./current-schematic-relevance-pending-cache-cursor.ts";
import type {CurrentSchematicRelevanceUploadCmHeld} from "./current-schematic-relevance-upload-cm-cursor.ts";
import type {CurrentSchematicRelevanceUploadSerializeHeld} from "./current-schematic-relevance-upload-serialize-cursor.ts";
import type {CurrentSchematicRelevanceUploadModelHeld} from "./current-schematic-relevance-upload-model-cursor.ts";
import type {CurrentSchematicRelevanceUploadEntryHeld} from "./current-schematic-relevance-upload-entry-cursor.ts";
import type {CurrentSchematicRelevanceNoEchoPreparation} from "./current-schematic-relevance-noecho-cursor.ts";
import type {CurrentSchematicRelevanceNormalRecordReceipt} from "./current-schematic-relevance-normal-record-cursor.ts";
import type {CurrentSchematicRelevanceNormalDisposalReceipt} from "./current-schematic-relevance-normal-disposal-cursor.ts";
import type {CurrentSchematicRelevanceNormalUpdateReceipt} from "./current-schematic-relevance-normal-update-cursor.ts";
import type {CurrentSchematicRelevanceHistoryCommandReceipt} from "./current-schematic-relevance-history-command-cursor.ts";
import type {CurrentSchematicRelevanceMonitorBatchReceipt} from "./current-schematic-relevance-monitor-batch-cursor.ts";
import type { CurrentSchematicRelevanceAstHeld, CurrentSchematicRelevanceRecordAstPrepared } from "./current-schematic-relevance-record-ast-cursor.ts";
import type { CurrentSchematicRelevanceCompletionReceipt } from "./current-schematic-relevance-completion-cursor.ts";
import type { CurrentSchematicRelevancePrimitivePrepared, CurrentSchematicRelevancePrimitiveRecordHeld } from "./current-schematic-relevance-primitive-cursor.ts";
import type { CurrentSchematicRelevanceUiPublicationReceipt } from "./current-schematic-relevance-ui-publication-cursor.ts";
/** Maintained original callback entry collector. Every read remains bound to
 * the original held callback and pending Modify; each finite continuation ends at
 * its next separately held original body. */
import { requireOriginalCurrentSchematicRelevanceActionCallbackOrigin } from "./current-pcb-diagnostic-owner.ts";
import type { CurrentSchematicRelevanceDisplayWriteOwner } from "./current-schematic-relevance-display-write-owner.ts";
import type { GeneratedSchematicRelevanceDisplayNativeArguments } from "./generated-schematic-relevance-display-source.ts";
import type { CurrentSchematicRelevanceDisplayActionCallbackOrigin } from "./current-schematic-relevance-display-run-handoff.ts";
import type { CurrentSchematicRelevanceActionCallbackBindings } from "./current-schematic-relevance-action-callback-origin.ts";
import type { CurrentSchematicRelevanceActiveHistoryReceipt } from "./current-schematic-relevance-active-history-cursor.ts";
import type { CurrentSchematicRelevanceFirstSetterReceipt } from "./current-schematic-relevance-first-setter-cursor.ts";
import type { CurrentSchematicRelevanceSetAttributeReceipt, CurrentSchematicRelevanceUnderlineBridgeReceipt } from "./current-schematic-relevance-underline-bridge-cursor.ts";
import type { CurrentSchematicRelevanceActionCallbackEntry } from "./current-schematic-relevance-action-callback-cursor.ts";

function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_RELEVANCE_ORIGINAL_CALLBACK_OBSERVER"); } }
export class CurrentSchematicRelevanceActionCallbackObserver {
  readonly #origin: CurrentSchematicRelevanceDisplayActionCallbackOrigin; readonly #owner: CurrentSchematicRelevanceDisplayWriteOwner; readonly #args: GeneratedSchematicRelevanceDisplayNativeArguments; readonly #bindings: CurrentSchematicRelevanceActionCallbackBindings;
  #attempted = false; #firstSetterAttempted = false; #firstSetterReadAttempted = false; #busy = false; #failed = false; #entry: CurrentSchematicRelevanceActionCallbackEntry | null = null; #setter: CurrentSchematicRelevanceFirstSetterReceipt | null = null;
  #activeAttempted = false; #active: CurrentSchematicRelevanceActiveHistoryReceipt | null = null;
  #bridgeAttempted = false; #setAttributeAttempted = false; #setAttributeReadAttempted = false; #bridge: CurrentSchematicRelevanceUnderlineBridgeReceipt | null = null; #setAttribute: CurrentSchematicRelevanceSetAttributeReceipt | null = null;
  public constructor(origin: CurrentSchematicRelevanceDisplayActionCallbackOrigin, owner: CurrentSchematicRelevanceDisplayWriteOwner, args: GeneratedSchematicRelevanceDisplayNativeArguments) {
    this.#origin = origin; this.#owner = owner; this.#args = args; this.#bindings = requireOriginalCurrentSchematicRelevanceActionCallbackOrigin(origin, owner, args); Object.freeze(this);
  }
  #current(): void { need(!this.#failed && requireOriginalCurrentSchematicRelevanceActionCallbackOrigin(this.#origin, this.#owner, this.#args) === this.#bindings); }
  public async observeEntry(): Promise<CurrentSchematicRelevanceActionCallbackEntry> {
    need(!this.#attempted && !this.#busy); this.#attempted = true; this.#busy = true;
    try {
      this.#current(); await this.#bindings.assertCurrent(); this.#current();
      for (let command = this.#bindings.nextEntryCommand(); command !== null; command = this.#bindings.nextEntryCommand()) { this.#current(); await this.#bindings.requestEntry(command); this.#current(); }
      this.#entry = this.#bindings.requireOriginalEntry(); await this.#bindings.assertCurrent(); this.#current(); need(this.#entry === this.#bindings.requireOriginalEntry()); return this.#entry;
    } catch (error) { this.#failed = true; this.#bindings.fail(); throw error; } finally { this.#busy = false; }
  }
  public async continueToFirstSetter(): Promise<void> {
    this.#current(); need(!this.#busy && !this.#firstSetterAttempted && this.#entry !== null); this.#firstSetterAttempted = true; this.#busy = true;
    try { need(this.#entry === this.#bindings.requireOriginalEntry()); await this.#bindings.continueToFirstSetter(); this.#current(); need(this.#entry === this.#bindings.requireOriginalEntry()); }
    catch (error) { this.#failed = true; this.#bindings.fail(); throw error; } finally { this.#busy = false; }
  }
  public async observeFirstSetter(): Promise<CurrentSchematicRelevanceFirstSetterReceipt> {
    this.#current(); need(!this.#busy && this.#firstSetterAttempted && !this.#firstSetterReadAttempted); this.#firstSetterReadAttempted = true; this.#busy = true;
    try { await this.#bindings.assertCurrent(); this.#current(); for (let command = this.#bindings.nextFirstSetterCommand(); command !== null; command = this.#bindings.nextFirstSetterCommand()) { await this.#bindings.requestFirstSetter(command); this.#current(); } this.#setter = this.#bindings.requireOriginalFirstSetter(); await this.#bindings.assertCurrent(); this.#current(); need(this.#setter === this.#bindings.requireOriginalFirstSetter()); return this.#setter; }
    catch (error) { this.#failed = true; this.#bindings.fail(); throw error; } finally { this.#busy = false; }
  }
  public async observeUnderlineForwarding(): Promise<CurrentSchematicRelevanceUnderlineBridgeReceipt> {
    this.#current(); need(!this.#busy && this.#setter !== null && !this.#bridgeAttempted); this.#bridgeAttempted = true; this.#busy = true;
    try { need(this.#setter === this.#bindings.requireOriginalFirstSetter()); await this.#bindings.assertCurrent(); this.#current(); for (let command = this.#bindings.nextUnderlineBridgeCommand(); command !== null; command = this.#bindings.nextUnderlineBridgeCommand()) { await this.#bindings.requestUnderlineBridge(command); this.#current(); } this.#bridge = this.#bindings.requireOriginalUnderlineBridge(); await this.#bindings.assertCurrent(); this.#current(); need(this.#bridge === this.#bindings.requireOriginalUnderlineBridge()); return this.#bridge; }
    catch (error) { this.#failed = true; this.#bindings.fail(); throw error; } finally { this.#busy = false; }
  }
  public async continueToSetAttribute(): Promise<void> {
    this.#current(); need(!this.#busy && this.#bridge !== null && !this.#setAttributeAttempted); this.#setAttributeAttempted = true; this.#busy = true;
    try { need(this.#bridge === this.#bindings.requireOriginalUnderlineBridge()); await this.#bindings.continueToSetAttribute(); this.#current(); need(this.#bridge === this.#bindings.requireOriginalUnderlineBridge()); }
    catch (error) { this.#failed = true; this.#bindings.fail(); throw error; } finally { this.#busy = false; }
  }
  public async observeSetAttribute(): Promise<CurrentSchematicRelevanceSetAttributeReceipt> {
    this.#current(); need(!this.#busy && this.#setAttributeAttempted && !this.#setAttributeReadAttempted); this.#setAttributeReadAttempted = true; this.#busy = true;
    try { await this.#bindings.assertCurrent(); this.#current(); for (let command = this.#bindings.nextSetAttributeCommand(); command !== null; command = this.#bindings.nextSetAttributeCommand()) { await this.#bindings.requestSetAttribute(command); this.#current(); } this.#setAttribute = this.#bindings.requireOriginalSetAttribute(); await this.#bindings.assertCurrent(); this.#current(); need(this.#setAttribute === this.#bindings.requireOriginalSetAttribute()); return this.#setAttribute; }
    catch (error) { this.#failed = true; this.#bindings.fail(); throw error; } finally { this.#busy = false; }
  }
  public async observeActiveHistory(): Promise<CurrentSchematicRelevanceActiveHistoryReceipt> {
    this.#current(); need(!this.#busy && this.#setAttribute !== null && !this.#activeAttempted); this.#activeAttempted = true; this.#busy = true;
    try { need(this.#setAttribute === this.#bindings.requireOriginalSetAttribute()); await this.#bindings.assertCurrent(); this.#current(); for (let command = this.#bindings.nextActiveHistoryCommand(); command !== null; command = this.#bindings.nextActiveHistoryCommand()) { await this.#bindings.requestActiveHistory(command); this.#current(); } this.#active = this.#bindings.requireOriginalActiveHistory(); await this.#bindings.assertCurrent(); this.#current(); need(this.#active === this.#bindings.requireOriginalActiveHistory()); return this.#active; }
    catch (error) { this.#failed = true; this.#bindings.fail(); throw error; } finally { this.#busy = false; }
  }
  public async prepareOriginalRecord(): Promise<CurrentSchematicRelevanceRecordAstPrepared> {
    this.#current(); if (this.#busy) { throw new Error("SCHEMATIC_CALLBACK_OBSERVER_BUSY"); } this.#busy = true;
    try { for (;;) { const command = this.#bindings.nextRecordAstBeforeCommand(); if (command === null) { break; } await this.#bindings.requestRecordAstBefore(command); this.#current(); } return this.#bindings.requireOriginalRecordAstPrepared(); }
    catch (error) { this.#failed = true; this.#bindings.fail(); throw error; } finally { this.#busy = false; }
  }
  public async continueOriginalRecordToAst(): Promise<void> {
    this.#current(); if (this.#busy) { throw new Error("SCHEMATIC_CALLBACK_OBSERVER_BUSY"); } this.#busy = true;
    try { await this.#bindings.continueRecordToAst(); this.#current(); } catch (error) { this.#failed = true; this.#bindings.fail(); throw error; } finally { this.#busy = false; }
  }
  public async observeOriginalAstHeld(): Promise<CurrentSchematicRelevanceAstHeld> {
    this.#current(); if (this.#busy) { throw new Error("SCHEMATIC_CALLBACK_OBSERVER_BUSY"); } this.#busy = true;
    try { for (;;) { const command = this.#bindings.nextAstCommand(); if (command === null) { break; } await this.#bindings.requestAst(command); this.#current(); } return this.#bindings.requireOriginalAstHeld(); }
    catch (error) { this.#failed = true; this.#bindings.fail(); throw error; } finally { this.#busy = false; }
  }
  public async continueOriginalMonitorsToHistory():Promise<CurrentSchematicRelevanceMonitorBatchReceipt>{
    this.#current();if(this.#busy){throw new Error("SCHEMATIC_CALLBACK_OBSERVER_BUSY");}this.#busy=true;
    try{for(let stage=0;stage<5;stage += 1){for(;;){const command=this.#bindings.nextMonitorBatchCommand();if(command===null){break;}await this.#bindings.requestMonitorBatch(command);this.#current();}const receipt=this.#bindings.requireOriginalMonitorBatch();if(receipt.stage==="history"){return receipt;}await this.#bindings.continueOriginalMonitorBatch();this.#current();}throw new Error("SCHEMATIC_MONITOR_HISTORY_NOT_REACHED");}
    catch(error){this.#failed=true;this.#bindings.fail();throw error;}finally{this.#busy=false;}
  }
  public async continueOriginalNormalRecordToUpload():Promise<CurrentSchematicRelevanceNormalRecordReceipt>{this.#current();if(this.#busy){throw new Error("SCHEMATIC_CALLBACK_OBSERVER_BUSY");}this.#busy=true;try{for(let stage=0;stage<8;stage+=1){for(;;){const command=this.#bindings.nextNormalRecordCommand();if(command===null){break;}await this.#bindings.requestNormalRecord(command);this.#current();}const receipt=this.#bindings.requireOriginalNormalRecord();if(receipt.stage==="didRecord"){return receipt;}await this.#bindings.continueOriginalNormalRecord();this.#current();}throw new Error("SCH_RECORD_DID_RECORD_NOT_REACHED");}catch(error){this.#failed=true;this.#bindings.fail();throw error;}finally{this.#busy=false;}}
  /** Complete only the original queued UI callbacks, retain each visitor's
   * actual fulfilled Promise, then hold the original SDK fulfillment marker.
   * The wrapper, worker TEXT wave, Modify and Save remain incomplete. */
  /** Retain the private SDK wait and stop the actual timer at the original publisher entry before any native sender runs. */
  /** Capture the same original worker channel/event metadata while the UI native send stays held. */
  public async prepareOriginalModifyWorker():Promise<CurrentSchematicRelevanceModifyWorkerPrepared>{this.#current();if(this.#busy){throw new Error("SCHEMATIC_CALLBACK_OBSERVER_BUSY");}this.#busy=true;try{const data=await this.#bindings.prepareOriginalModifyWorker();this.#current();return data;}catch(error){this.#failed=true;this.#bindings.fail();throw error;}finally{this.#busy=false;}}
  /** Qualify the original publisher/channel dependencies without yielding its held body. */
  public async prepareOriginalPublicationNative():Promise<CurrentSchematicRelevancePublicationNativePrepared>{this.#current();if(this.#busy){throw new Error("SCHEMATIC_CALLBACK_OBSERVER_BUSY");}this.#busy=true;try{const data=await this.#bindings.prepareOriginalPublicationNative();this.#current();return data;}catch(error){this.#failed=true;this.#bindings.fail();throw error;}finally{this.#busy=false;}}
  /** Run only the qualified original publisher prefix, ending before native BC postMessage. */
  public async continueOriginalPublisherToPost():Promise<CurrentSchematicRelevancePublicationPostHeld>{this.#current();if(this.#busy){throw new Error("SCHEMATIC_CALLBACK_OBSERVER_BUSY");}this.#busy=true;try{const data=await this.#bindings.continueOriginalPublisherToPost();this.#current();return data;}catch(error){this.#failed=true;this.#bindings.fail();throw error;}finally{this.#busy=false;}}
  public async continueOriginalPublicationTimer():Promise<CurrentSchematicRelevancePublicationPublishHeld>{this.#current();if(this.#busy){throw new Error("SCHEMATIC_CALLBACK_OBSERVER_BUSY");}this.#busy=true;try{const data=await this.#bindings.prepareOriginalPublicationTimer();this.#current();return data;}catch(error){this.#failed=true;this.#bindings.fail();throw error;}finally{this.#busy=false;}}
  public async continueOriginalQueuedNotifications():Promise<CurrentSchematicRelevanceSdkGateRun>{this.#current();if(this.#busy){throw new Error("SCHEMATIC_CALLBACK_OBSERVER_BUSY");}this.#busy=true;try{const data=await this.#bindings.prepareOriginalNotifications();this.#current();return data;}catch(error){this.#failed=true;this.#bindings.fail();throw error;}finally{this.#busy=false;}}
  public async continueOriginalStatusCommands():Promise<CurrentSchematicRelevanceNormalCommandUiReturned>{this.#current();if(this.#busy){throw new Error("SCHEMATIC_CALLBACK_OBSERVER_BUSY");}this.#busy=true;try{const data=await this.#bindings.prepareOriginalStatusCommands();this.#current();return data;}catch(error){this.#failed=true;this.#bindings.fail();throw error;}finally{this.#busy=false;}}
  public async continueOriginalFileSaveUi():Promise<CurrentSchematicRelevanceFileSaveUiReturned>{this.#current();if(this.#busy){throw new Error("SCHEMATIC_CALLBACK_OBSERVER_BUSY");}this.#busy=true;try{const data=await this.#bindings.prepareOriginalFileSaveUi();this.#current();return data;}catch(error){this.#failed=true;this.#bindings.fail();throw error;}finally{this.#busy=false;}}
  public async continueOriginalRenderDelegate():Promise<CurrentSchematicRelevanceRenderDelegateStoreReturned>{this.#current();if(this.#busy){throw new Error("SCHEMATIC_CALLBACK_OBSERVER_BUSY");}this.#busy=true;try{const data=await this.#bindings.prepareOriginalRenderDelegate();this.#current();return data;}catch(error){this.#failed=true;this.#bindings.fail();throw error;}finally{this.#busy=false;}}
  public async continueOriginalStoreToRender():Promise<CurrentSchematicRelevanceStatusTabMutationHeld>{this.#current();if(this.#busy){throw new Error("SCHEMATIC_CALLBACK_OBSERVER_BUSY");}this.#busy=true;try{const data=await this.#bindings.prepareOriginalStatusTabMutation();this.#current();return data;}catch(error){this.#failed=true;this.#bindings.fail();throw error;}finally{this.#busy=false;}}
  public async continueOriginalUiLookupToStore():Promise<CurrentSchematicRelevanceStatusTabLookupHeld>{this.#current();if(this.#busy){throw new Error("SCHEMATIC_CALLBACK_OBSERVER_BUSY");}this.#busy=true;try{const data=await this.#bindings.prepareOriginalStatusTabLookup();this.#current();return data;}catch(error){this.#failed=true;this.#bindings.fail();throw error;}finally{this.#busy=false;}}
  public async continueOriginalCloneToUiFunction():Promise<CurrentSchematicRelevanceStatusSubscriberHeld>{this.#current();if(this.#busy){throw new Error("SCHEMATIC_CALLBACK_OBSERVER_BUSY");}this.#busy=true;try{const data=await this.#bindings.prepareOriginalStatusSubscriber();this.#current();return data;}catch(error){this.#failed=true;this.#bindings.fail();throw error;}finally{this.#busy=false;}}
  public async continueOriginalTaskToCloneDependencies():Promise<CurrentSchematicRelevanceStatusCloneDependencies>{this.#current();if(this.#busy){throw new Error("SCHEMATIC_CALLBACK_OBSERVER_BUSY");}this.#busy=true;try{const data=await this.#bindings.prepareOriginalStatusClone();this.#current();return data;}catch(error){this.#failed=true;this.#bindings.fail();throw error;}finally{this.#busy=false;}}
  public async continueOriginalLocalPublishToTask():Promise<CurrentSchematicRelevanceStatusDeliveryHeld>{this.#current();if(this.#busy){throw new Error("SCHEMATIC_CALLBACK_OBSERVER_BUSY");}this.#busy=true;try{for(;;){const command=this.#bindings.nextStatusDeliveryCommand();if(command===null){break;}await this.#bindings.requestStatusDelivery(command);this.#current();}await this.#bindings.continueOriginalStatusDelivery();this.#current();for(;;){const command=this.#bindings.nextStatusDeliveryCommand();if(command===null){break;}await this.#bindings.requestStatusDelivery(command);this.#current();}return this.#bindings.requireOriginalStatusDelivery();}catch(error){this.#failed=true;this.#bindings.fail();throw error;}finally{this.#busy=false;}}
  public async continueOriginalStatusToLocalPublish():Promise<CurrentSchematicRelevanceStatusBusHeld>{this.#current();if(this.#busy){throw new Error("SCHEMATIC_CALLBACK_OBSERVER_BUSY");}this.#busy=true;try{for(;;){const command=this.#bindings.nextStatusBusCommand();if(command===null){break;}await this.#bindings.requestStatusBus(command);this.#current();}await this.#bindings.continueOriginalStatusBus();this.#current();for(;;){const command=this.#bindings.nextStatusBusCommand();if(command===null){break;}await this.#bindings.requestStatusBus(command);this.#current();}return this.#bindings.requireOriginalStatusBus();}catch(error){this.#failed=true;this.#bindings.fail();throw error;}finally{this.#busy=false;}}
  public async continueOriginalStatusToFirstCallback():Promise<CurrentSchematicRelevanceHistoryStatusHeld>{this.#current();if(this.#busy){throw new Error("SCHEMATIC_CALLBACK_OBSERVER_BUSY");}this.#busy=true;try{for(;;){const command=this.#bindings.nextHistoryStatusCommand();if(command===null){break;}await this.#bindings.requestHistoryStatus(command);this.#current();}await this.#bindings.continueOriginalHistoryStatus();this.#current();for(;;){const command=this.#bindings.nextHistoryStatusCommand();if(command===null){break;}await this.#bindings.requestHistoryStatus(command);this.#current();}return this.#bindings.requireOriginalHistoryStatus();}catch(error){this.#failed=true;this.#bindings.fail();throw error;}finally{this.#busy=false;}}
  public async continueOriginalUploaderToStatus():Promise<CurrentSchematicRelevanceUploadReturnHeld>{this.#current();if(this.#busy){throw new Error("SCHEMATIC_CALLBACK_OBSERVER_BUSY");}this.#busy=true;try{for(let stage=0;stage<3;stage+=1){for(;;){const command=this.#bindings.nextUploadReturnCommand();if(command===null){break;}await this.#bindings.requestUploadReturn(command);this.#current();}if(stage===2){const receipt=this.#bindings.requireOriginalUploadReturn();if(receipt.stage!=="status"||!receipt.originalStatusBodyHeld){throw new Error("SCH_UPLOADER_STATUS_NOT_HELD");}return receipt;}await this.#bindings.continueOriginalUploadReturn();this.#current();}throw new Error("SCH_UPLOADER_RETURN_FIXED_PATH");}catch(error){this.#failed=true;this.#bindings.fail();throw error;}finally{this.#busy=false;}}
  public async continueOriginalPendingCacheBody():Promise<CurrentSchematicRelevancePendingCacheHeld>{this.#current();if(this.#busy){throw new Error("SCHEMATIC_CALLBACK_OBSERVER_BUSY");}this.#busy=true;try{for(;;){const command=this.#bindings.nextPendingCacheCommand();if(command===null){break;}await this.#bindings.requestPendingCache(command);this.#current();}await this.#bindings.continueOriginalPendingCache();this.#current();for(;;){const command=this.#bindings.nextPendingCacheCommand();if(command===null){break;}await this.#bindings.requestPendingCache(command);this.#current();}return this.#bindings.requireOriginalPendingCache();}catch(error){this.#failed=true;this.#bindings.fail();throw error;}finally{this.#busy=false;}}
  public async continueOriginalConsistencyToPendingCache():Promise<CurrentSchematicRelevanceUploadCmHeld>{this.#current();if(this.#busy){throw new Error("SCHEMATIC_CALLBACK_OBSERVER_BUSY");}this.#busy=true;try{for(let step=0;step<9;step+=1){for(;;){const command=this.#bindings.nextCmCommand();if(command===null){break;}await this.#bindings.requestCm(command);this.#current();}if(step===8){const receipt=this.#bindings.requireOriginalCm();if(receipt.stage!=="cache"||!receipt.originalPendingCacheBodyHeld){throw new Error("SCH_CM_CM_HELD");}return receipt;}await this.#bindings.continueOriginalCm();this.#current();}throw new Error("SCH_CM_FIXED_PATH");}catch(error){this.#failed=true;this.#bindings.fail();throw error;}finally{this.#busy=false;}}
  public async continueOriginalTextToConsistency():Promise<CurrentSchematicRelevanceUploadSerializeHeld>{this.#current();if(this.#busy){throw new Error("SCHEMATIC_CALLBACK_OBSERVER_BUSY");}this.#busy=true;try{for(let step=0;step<9;step+=1){for(;;){const command=this.#bindings.nextSerializeCommand();if(command===null){break;}await this.#bindings.requestSerialize(command);this.#current();}if(step===8){const receipt=this.#bindings.requireOriginalSerialize();if(receipt.stage!=="local"||!receipt.originalConsistencyBodyHeld){throw new Error("SCH_SERIALIZE_CM_HELD");}return receipt;}await this.#bindings.continueOriginalSerialize();this.#current();}throw new Error("SCH_SERIALIZE_FIXED_PATH");}catch(error){this.#failed=true;this.#bindings.fail();throw error;}finally{this.#busy=false;}}
  public async continueOriginalUploaderToText():Promise<CurrentSchematicRelevanceUploadModelHeld>{this.#current();if(this.#busy){throw new Error("SCHEMATIC_CALLBACK_OBSERVER_BUSY");}this.#busy=true;try{for(let step=0;step<4;step+=1){for(;;){const command=this.#bindings.nextUploadModelCommand();if(command===null){break;}await this.#bindings.requestUploadModel(command);this.#current();}if(step===3){const receipt=this.#bindings.requireOriginalUploadModel();if(receipt.stage!=="text"||!receipt.originalTextUploadBodyHeld){throw new Error("SCH_UPLOAD_MODEL_TEXT_HELD");}return receipt;}await this.#bindings.continueOriginalUploadModel();this.#current();}throw new Error("SCH_UPLOAD_MODEL_FIXED_PATH");}catch(error){this.#failed=true;this.#bindings.fail();throw error;}finally{this.#busy=false;}}
  public async continueOriginalDidRecordToUploader():Promise<CurrentSchematicRelevanceUploadEntryHeld>{this.#current();if(this.#busy){throw new Error("SCHEMATIC_CALLBACK_OBSERVER_BUSY");}this.#busy=true;try{for(;;){const command=this.#bindings.nextUploadEntryCommand();if(command===null){break;}await this.#bindings.requestUploadEntry(command);this.#current();}await this.#bindings.continueOriginalUploadEntry();this.#current();for(;;){const command=this.#bindings.nextUploadEntryCommand();if(command===null){break;}await this.#bindings.requestUploadEntry(command);this.#current();}return this.#bindings.requireOriginalUploadEntry();}catch(error){this.#failed=true;this.#bindings.fail();throw error;}finally{this.#busy=false;}}
  public async prepareOriginalNoEcho():Promise<CurrentSchematicRelevanceNoEchoPreparation>{this.#current();if(this.#busy){throw new Error("SCHEMATIC_CALLBACK_OBSERVER_BUSY");}this.#busy=true;try{for(;;){const command=this.#bindings.nextNoEchoCommand();if(command===null){break;}await this.#bindings.requestNoEcho(command);this.#current();}return this.#bindings.requireOriginalNoEcho();}catch(error){this.#failed=true;this.#bindings.fail();throw error;}finally{this.#busy=false;}}
  public async prepareOriginalListenerDisposal():Promise<CurrentSchematicRelevanceNormalDisposalReceipt>{this.#current();if(this.#busy){throw new Error("SCHEMATIC_CALLBACK_OBSERVER_BUSY");}this.#busy=true;try{for(;;){const command=this.#bindings.nextListenerDisposalCommand();if(command===null){break;}await this.#bindings.requestListenerDisposal(command);this.#current();}return this.#bindings.requireOriginalListenerDisposal();}catch(error){this.#failed=true;this.#bindings.fail();throw error;}finally{this.#busy=false;}}
  public async continueOriginalNormalHistoryToCanRecord():Promise<CurrentSchematicRelevanceNormalUpdateReceipt>{
    this.#current();if(this.#busy){throw new Error("SCHEMATIC_CALLBACK_OBSERVER_BUSY");}this.#busy=true;try{for(let stage=0;stage<8;stage+=1){for(;;){const command=this.#bindings.nextNormalUpdateCommand();if(command===null){break;}await this.#bindings.requestNormalUpdate(command);this.#current();}const receipt=this.#bindings.requireOriginalNormalUpdate();if(receipt.stage==="canRecord"){return receipt;}await this.#bindings.continueOriginalNormalUpdate();this.#current();}throw new Error("SCH_NORMAL_UPDATE_CAN_RECORD_NOT_REACHED");}catch(error){this.#failed=true;this.#bindings.fail();throw error;}finally{this.#busy=false;}}
  public async continueOriginalHistoryToFinish():Promise<CurrentSchematicRelevanceHistoryCommandReceipt>{
    this.#current();if(this.#busy){throw new Error("SCHEMATIC_CALLBACK_OBSERVER_BUSY");}this.#busy=true;
    try{for(let stage=0;stage<4;stage+=1){for(;;){const command=this.#bindings.nextHistoryCommand();if(command===null){break;}await this.#bindings.requestHistoryCommand(command);this.#current();}const receipt=this.#bindings.requireOriginalHistoryCommand();if(receipt.stage==="finish"){return receipt;}await this.#bindings.continueOriginalHistoryCommand();this.#current();}throw new Error("SCH_HISTORY_COMMAND_FINISH_NOT_REACHED");}
    catch(error){this.#failed=true;this.#bindings.fail();throw error;}finally{this.#busy=false;}
  }
  public async observeNormalCompletionGraph(): Promise<CurrentSchematicRelevanceCompletionReceipt> {
    this.#current(); if (this.#busy) { throw new Error("SCHEMATIC_CALLBACK_OBSERVER_BUSY"); } this.#busy = true;
    try { for (;;) { const command = this.#bindings.nextNormalCompletionCommand(); if (command === null) { break; } await this.#bindings.requestNormalCompletion(command); this.#current(); } return this.#bindings.requireOriginalNormalCompletion(); }
    catch (error) { this.#failed = true; this.#bindings.fail(); throw error; } finally { this.#busy = false; }
  }
  public async prepareOriginalPrimitive(): Promise<CurrentSchematicRelevancePrimitivePrepared> {
    this.#current(); if (this.#busy) { throw new Error("SCHEMATIC_CALLBACK_OBSERVER_BUSY"); } this.#busy = true;
    try { for (;;) { const command = this.#bindings.nextPrimitiveBeforeCommand(); if (command === null) { break; } await this.#bindings.requestPrimitiveBefore(command); this.#current(); } return this.#bindings.requireOriginalPrimitivePrepared(); }
    catch (error) { this.#failed = true; this.#bindings.fail(); throw error; } finally { this.#busy = false; }
  }
  public async continueOriginalPrimitiveToRecord(): Promise<void> {
    this.#current(); if (this.#busy) { throw new Error("SCHEMATIC_CALLBACK_OBSERVER_BUSY"); } this.#busy = true;
    try { await this.#bindings.continueToRecord(); this.#current(); } catch (error) { this.#failed = true; this.#bindings.fail(); throw error; } finally { this.#busy = false; }
  }
  public async observeOriginalPrimitiveRecord(): Promise<CurrentSchematicRelevancePrimitiveRecordHeld> {
    this.#current(); if (this.#busy) { throw new Error("SCHEMATIC_CALLBACK_OBSERVER_BUSY"); } this.#busy = true;
    try { for (;;) { const command = this.#bindings.nextPrimitiveRecordCommand(); if (command === null) { break; } await this.#bindings.requestPrimitiveRecord(command); this.#current(); } return this.#bindings.requireOriginalPrimitiveRecordHeld(); }
    catch (error) { this.#failed = true; this.#bindings.fail(); throw error; } finally { this.#busy = false; }
  }
  public async observeUiPublicationPristine(): Promise<CurrentSchematicRelevanceUiPublicationReceipt> {
    this.#current(); if (this.#busy) { throw new Error("SCHEMATIC_CALLBACK_OBSERVER_BUSY"); } this.#busy = true;
    try { for (;;) { const command = this.#bindings.nextUiPublicationCommand(); if (command === null) { break; } await this.#bindings.requestUiPublication(command); this.#current(); } return this.#bindings.requireOriginalUiPublication(); }
    catch (error) { this.#failed = true; this.#bindings.fail(); throw error; } finally { this.#busy = false; }
  }
  public requireOriginalEntry(): CurrentSchematicRelevanceActionCallbackEntry { this.#current(); need(!this.#busy && this.#entry !== null && this.#entry === this.#bindings.requireOriginalEntry()); return this.#entry; }
}
