/** Complete original saved-reader sequence. Constructor inputs supply no
 * callbacks, native handles, replacement owner or target selectors. */

   // oxlint-disable import/max-dependencies -- Distinct native/cache/cold/scene/closed receipts and durable journal remain independently checked.
  
import { consumeOriginalCurrentSchematicRelevanceSavedReadbackParent } from "./current-schematic-relevance-saved-readback-parent.ts";
import type { CurrentSchematicRelevanceSavedReadbackParent, CurrentSchematicRelevanceSavedReadbackParentBinding } from "./current-schematic-relevance-saved-readback-parent.ts";
import { setTimeout as delay } from "node:timers/promises";
import { canonicalJson, sha256Json } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import type { CurrentPcbDiagnosticInstallationOptions } from "./current-pcb-diagnostic-installation.ts";
import { selectCurrentPcb209StartPage, selectCurrentPcb209StartPageFrame } from "./current-pcb-209-start-page-selection.ts";
import { CURRENT_PCB_209_OPENING_SCRIPTS } from "./current-pcb-209-opening-profile.ts";
import { requireOriginalGeneratedSchematicRelevanceSavedReadbackPlan } from "./generated-schematic-relevance-saved-readback-plan.ts";
import type { GeneratedSchematicRelevanceSavedReadbackPlan } from "./generated-schematic-relevance-saved-readback-plan.ts";
import { assertOriginalCurrentSchematicRelevanceSavedReadbackOwner, currentSchematicRelevanceSavedReadbackAllocationOutcome, originalCurrentSchematicRelevanceSavedReadbackTarget, originalCurrentSchematicRelevanceSavedReadbackTermination, startCurrentSchematicRelevanceSavedReadbackOwner } from "./current-schematic-relevance-saved-readback-owner.ts";
import type { CurrentSchematicRelevanceSavedReadbackOwner } from "./current-schematic-relevance-saved-readback-owner.ts";
import { CurrentSchematicRelevanceSavedReadbackJournal, assertOriginalCurrentSchematicRelevanceSavedReadbackJournal } from "./current-schematic-relevance-saved-readback-journal.ts";
import type { CurrentSchematicRelevanceSavedReadbackJournalKind } from "./current-schematic-relevance-saved-readback-journal.ts";
import { observeOriginalCurrentSchematicRelevanceSavedScene } from "./current-schematic-relevance-saved-scene-controller.ts";
import { CurrentSchematicRelevanceSavedReadbackClosedCapture } from "./current-schematic-relevance-saved-readback-closed-proof.ts";
import { acceptOriginalCurrentSchematicRelevanceSavedReadback, requireOriginalCurrentSchematicRelevanceSavedReadbackAcceptance } from "./current-schematic-relevance-saved-readback-acceptance.ts";
import type { CurrentSchematicRelevanceSavedReadbackAcceptance } from "./current-schematic-relevance-saved-readback-acceptance.ts";

const attempts=new WeakSet<GeneratedSchematicRelevanceSavedReadbackPlan>();
const EXIT=Object.freeze({observations:40,delayMilliseconds:250});
export interface CurrentSchematicRelevanceSavedReadbackWorkflowResult{
 readonly schema:"private.current-schematic-relevance-saved-readback-workflow-result.v1";
 readonly operationId:string;readonly readerOperationId:string;readonly acceptance:CurrentSchematicRelevanceSavedReadbackAcceptance;
 readonly originalReaderHelperReleased:true;readonly persistenceVerified:true;readonly reopenedVerified:true;readonly executionAuthorized:false;
}
export type CurrentSchematicRelevanceSavedReadbackResourceClosure =
 | Readonly<{outcome:"allocation-never-entered"|"no-resource-allocated";helperAllocated:false;rootCreated:false;exitClaimed:false}>
 | Readonly<{outcome:"root-never-created";helperAllocated:true;helperReleased:true;rootCreated:false;exitClaimed:false}>
 | Readonly<{outcome:"root-exited";helperAllocated:true;helperReleased:true;rootCreated:true;originalRootExited:true;originalJobEmpty:true}>;
export interface CurrentSchematicRelevanceSavedReadbackCleanupStatus{
 readonly allocation:"not-entered"|"no-resource"|"retained"|"released"|"unresolved";
 readonly nativeResourcesRetained:boolean;readonly abortAttempted:boolean;readonly originalTerminationVerified:boolean;readonly helperReleaseVerified:boolean;
 readonly captureReleasePending:boolean;readonly originalCallsPending:boolean;readonly publicationPending:boolean;
}
const results=new WeakMap<CurrentSchematicRelevanceSavedReadbackWorkflowResult,CurrentSchematicRelevanceSavedReadbackWorkflow>();
function need(value:boolean,reason:string):asserts value{if(!value){throw new Error(`SCHEMATIC_SAVED_WORKFLOW_${reason}`);}}

export class CurrentSchematicRelevanceSavedReadbackWorkflow{
 readonly #parent:CurrentSchematicRelevanceSavedReadbackParentBinding|null;readonly #options:CurrentPcbDiagnosticInstallationOptions;readonly #prepared:GeneratedSchematicRelevanceSavedReadbackPlan;readonly #journal:CurrentSchematicRelevanceSavedReadbackJournal;
 readonly #publications=new Map<CurrentSchematicRelevanceSavedReadbackJournalKind,Promise<void>>();
 #owner:CurrentSchematicRelevanceSavedReadbackOwner|null=null;#factory:Promise<CurrentSchematicRelevanceSavedReadbackOwner>|null=null;#factorySettled=false;
 #execution:Promise<CurrentSchematicRelevanceSavedReadbackWorkflowResult>|null=null;#executionSettled=false;#pending:Promise<unknown>|null=null;
 #reservation:Promise<void>|null=null;#publication:Promise<void>|null=null;#publicationBlocked=false;#failed=false;#cancelled=false;#stage="prepared";
 #cleanup:Promise<void>|null=null;#cleanupSettled=false;#cleanupComplete=false;#cleanupExhausted=false;#settlement:Promise<void>|null=null;
 #cleanupBinding:string|null=null;#abort:Promise<void>|null=null;#abortAcknowledged=false;#release:Promise<void>|null=null;#closed=false;#normalClose=false;
 #capture:CurrentSchematicRelevanceSavedReadbackClosedCapture|null=null;#result:CurrentSchematicRelevanceSavedReadbackWorkflowResult|null=null;
 public constructor(options:CurrentPcbDiagnosticInstallationOptions,prepared:GeneratedSchematicRelevanceSavedReadbackPlan,parent:CurrentSchematicRelevanceSavedReadbackParent|null=null){
  requireOriginalGeneratedSchematicRelevanceSavedReadbackPlan(prepared);captureCurrentPcbStringClockReply(options);need(Object.isFrozen(options)&&!attempts.has(prepared),"ORIGINAL_PREPARATION");this.#parent=parent===null?null:consumeOriginalCurrentSchematicRelevanceSavedReadbackParent(parent,prepared,this);attempts.add(prepared);this.#options=options;this.#prepared=prepared;this.#journal=new CurrentSchematicRelevanceSavedReadbackJournal(prepared);Object.freeze(this);
 }
 #current(owner:CurrentSchematicRelevanceSavedReadbackOwner,cleanup=false):void{this.#parent?.assertCurrent();assertOriginalCurrentSchematicRelevanceSavedReadbackOwner(owner);assertOriginalCurrentSchematicRelevanceSavedReadbackJournal(this.#journal,this.#prepared);need(this.#owner===owner&&originalCurrentSchematicRelevanceSavedReadbackTarget(owner)===this.#prepared&&(cleanup||!this.#cancelled),"ORIGINAL_OWNER");}
 #has(kind:CurrentSchematicRelevanceSavedReadbackJournalKind):boolean{return this.#journal.retained().records.some(row=>row.kind===kind);}
 async #journalReady():Promise<void>{
  this.#parent?.assertCurrent();await this.#parent?.ready();this.#parent?.assertCurrent();assertOriginalCurrentSchematicRelevanceSavedReadbackJournal(this.#journal,this.#prepared);this.#reservation??=this.#journal.reserve();try{await this.#reservation;}catch{
   // Preserve the original reservation failure; settle only its retained creation or candidate.
  }const pending=this.#publication;if(pending!==null){try{await pending;}catch{ 
   // Preserve original publication in #publications; settle only its exact retained candidate.
   }}
  if(this.#journal.retained().publicationPending||!this.#journal.retained().reserved){await this.#journal.settlePublication();}
  await this.#journal.assertCurrent();assertOriginalCurrentSchematicRelevanceSavedReadbackJournal(this.#journal,this.#prepared);
 }
 async #record(kind:CurrentSchematicRelevanceSavedReadbackJournalKind,evidence:Readonly<Record<string,unknown>>,cleanup=false):Promise<void>{
  await this.#journalReady();need(cleanup||!this.#cancelled,"CANCELLED_DURING_PUBLICATION");
  if(this.#has(kind)){need(cleanup,"RECORD_CONSUMED");return;}need(!this.#publications.has(kind),"PUBLICATION_CONSUMED");
  const pending=this.#journal.append(kind,evidence);this.#publications.set(kind,pending);this.#publication=pending;
  try{await pending;await this.#journal.assertCurrent();await this.#parent?.record(kind,evidence);this.#parent?.assertCurrent();}finally{if(this.#publication===pending){this.#publication=null;}}
  need(cleanup||!this.#cancelled,"CANCELLED_DURING_PUBLICATION");
 }
 async #step<T>(stage:string,owner:CurrentSchematicRelevanceSavedReadbackOwner,invoke:()=>Promise<T>):Promise<T>{
  this.#current(owner);need(this.#pending===null,"ORIGINAL_PENDING");this.#stage=stage;const pending=invoke();this.#pending=pending;
  try{const value=await pending;this.#current(owner);return value;}finally{if(this.#pending===pending){this.#pending=null;}}
 }
 async #exit(owner:CurrentSchematicRelevanceSavedReadbackOwner,cleanup:boolean):Promise<void>{
  for(let index=0;index<EXIT.observations;index+=1){this.#current(owner,cleanup);const pending=owner.observeTermination();this.#pending=pending;let closed:boolean;try{closed=await pending;}finally{if(this.#pending===pending){this.#pending=null;}}
   this.#current(owner,cleanup);if(closed){originalCurrentSchematicRelevanceSavedReadbackTermination(owner);this.#closed=true;return;}if(index+1<EXIT.observations){await delay(EXIT.delayMilliseconds);}}
  if(cleanup){this.#cleanupExhausted=true;}throw new Error("SCHEMATIC_SAVED_WORKFLOW_ORIGINAL_EXIT_NOT_OBSERVED");
 }
 async #releaseClosed(owner:CurrentSchematicRelevanceSavedReadbackOwner):Promise<void>{this.#current(owner,true);need(this.#closed,"ORIGINAL_CLOSURE_REQUIRED");this.#release??=owner.releaseClosed();await this.#release;this.#current(owner,true);need(owner.status().released&&owner.status().helperClosed,"ORIGINAL_HELPER_RELEASE");}
 public execute():Promise<CurrentSchematicRelevanceSavedReadbackWorkflowResult>{
  if(this.#execution!==null){return this.#execution;}need(!this.#cancelled,"CANCELLED_BEFORE_EXECUTION");
  const execution=(async():Promise<CurrentSchematicRelevanceSavedReadbackWorkflowResult>=>{
   try{
    this.#reservation??=this.#journal.reserve();await this.#reservation;await this.#journalReady();need(!this.#cancelled,"CANCELLED_BEFORE_BIRTH");await this.#record("allocation-intent",{originalSavedPlanOnly:true});
    this.#stage="allocation";this.#factory=startCurrentSchematicRelevanceSavedReadbackOwner(this.#options,this.#prepared);let owner:CurrentSchematicRelevanceSavedReadbackOwner;try{owner=await this.#factory;}finally{this.#factorySettled=true;}this.#owner=owner;this.#journal.bindOwner(owner);this.#current(owner);
    await this.#record("allocation-result",{originalNativeOwnerRetained:true});
    await this.#record("launch-intent",{originalReaderOnly:true});await this.#step("launch",owner,()=>owner.startSchematicSavedReadbackGeneration());await this.#record("launch-result",{originalReaderLaunched:true});
    await this.#record("main-intent",{selectedDesignReadonly:true});await this.#step("main",owner,()=>owner.observeFootprintMainConstruction());await this.#record("main-result",{originalBeforeImportFenceInstalled:true});
    await this.#record("ui-intent",{originalStartPageOnly:true});const browser=await this.#step("browser",owner,()=>owner.browserObservation()),selected=selectCurrentPcb209StartPage(browser);
    const frames=await this.#step("frames",owner,()=>owner.inspectFrames(selected.targetId));const frame=selectCurrentPcb209StartPageFrame(frames,selected);await this.#step("ui-source",owner,()=>owner.inspectScript(frame.frameId,CURRENT_PCB_209_OPENING_SCRIPTS.ui));await this.#record("ui-result",{originalUiSourceQualified:true});
    await this.#record("cache-intent",{onlyExactSavedProjectNamespaces:true});await this.#step("cache-origin",owner,()=>owner.createSchematicSavedCacheOrigin());await this.#step("complete-cache-observation",owner,()=>owner.observeSchematicSavedCaches());await this.#record("cache-result",{twoOriginalCdpAndNativeMetadataRounds:true});
    await this.#record("backup-intent",{completeDurableBackupRequired:true});await this.#step("durable-cache-backup",owner,()=>owner.publishSchematicSavedCacheBackup());await this.#record("backup-result",{originalCompleteBackupPublishedAndReverified:true});
    await this.#record("invalidate-intent",{twoOnceDeletesWithFreshOriginalGuards:true});const absence=await this.#step("exact-cache-invalidation",owner,()=>owner.invalidateSchematicSavedCaches());await this.#record("invalidate-result",{originalAbsenceObserved:true});
    await this.#record("loading-intent",{originalEmptyUiAndEarlyActorExclusion:true});const loading=await this.#step("loading-preparation",owner,()=>owner.prepareSchematicSavedLoading(absence));await this.#step("cold-worker-arm",owner,()=>owner.armSchematicSavedColdWorker(loading));await this.#record("loading-result",{originalColdWorkerArmedBeforeNavigation:true});
    await this.#record("registration-intent",{sourceBoundRecentPathPolicyOnly:true});await this.#step("registration-intent",owner,()=>owner.prepareSchematicSavedRegistrationIntent());await this.#step("registration",owner,()=>owner.registerSchematicSavedProject());await this.#record("registration-result",{originalRegistrationAwaitedOrOriginalNoDispatchVerified:true});
    await this.#record("opening-intent",{sameSavedProjectAndPageOnly:true});await this.#step("project-and-page-open",owner,()=>owner.openSchematicSavedProjectAndPage());await this.#record("opening-result",{originalProjectSdkAndPageIdentityVerified:true});
    await this.#record("cold-intent",{originalWorkerOnly:true});const cold=await this.#step("cold-observation",owner,()=>owner.observeSchematicSavedColdLoading());await this.#record("cold-result",{originalColdObservationSha256:sha256Json(cold),nativeCompletionAcknowledged:true});
    await this.#record("scene-intent",{sevenExactSavedRecords:true});const origin=await this.#step("scene-origin",owner,()=>owner.createSchematicSavedSceneOrigin());const scene=await this.#step("scene",owner,()=>observeOriginalCurrentSchematicRelevanceSavedScene(owner,origin));await this.#record("scene-result",{originalSceneObservedAndGroupReleased:true});
    const hwnd=await this.#step("original-window",owner,()=>owner.observeApplicationWindow());need(hwnd!==null,"ORIGINAL_WINDOW");await this.#record("close-intent",{originalWindowOnly:true});this.#normalClose=true;await this.#step("normal-close",owner,()=>owner.requestNormalClose(hwnd));await this.#record("close-result",{originalNormalCloseAcknowledged:true});
    await this.#record("exit-intent",{originalRootAndJobOnly:true});this.#stage="exit";await this.#exit(owner,false);await this.#record("exit-result",{rootExited:true,jobEmpty:true});const termination=originalCurrentSchematicRelevanceSavedReadbackTermination(owner);
    await this.#record("release-intent",{originalHelperOnly:true});await this.#releaseClosed(owner);await this.#record("release-result",{originalHelperReleased:true});
    await this.#record("closed-sql-intent",{sameOriginalSavedFileOnly:true});this.#capture=new CurrentSchematicRelevanceSavedReadbackClosedCapture(owner,termination);const closed=await this.#step("closed-source-and-sql",owner,()=>{need(this.#capture!==null,"ORIGINAL_CAPTURE");return this.#capture.capture();});await this.#capture.settleRelease();need(this.#capture.isReleaseAcknowledged(),"ORIGINAL_FD_RELEASE");await this.#record("closed-sql-result",{sourceSha256:closed.sourceSha256,logicalSha256:closed.inventoryLogicalSha256,allOriginalDescriptorsClosed:true});
    await this.#record("complete-intent",{fiveOriginalReceiptJoin:true});const acceptance=acceptOriginalCurrentSchematicRelevanceSavedReadback(owner,cold,origin,scene,closed);requireOriginalCurrentSchematicRelevanceSavedReadbackAcceptance(acceptance,owner);
    await this.#record("complete-result",{persistenceVerified:true,reopenedVerified:true,originalHelperReleased:true,acceptanceSha256:sha256Json(acceptance)});this.#current(owner);requireOriginalCurrentSchematicRelevanceSavedReadbackAcceptance(acceptance,owner);
    const result:CurrentSchematicRelevanceSavedReadbackWorkflowResult=Object.freeze({schema:"private.current-schematic-relevance-saved-readback-workflow-result.v1",operationId:requireOriginalGeneratedSchematicRelevanceSavedReadbackPlan(this.#prepared).data.operationId,readerOperationId:this.#journal.retained().operationId,acceptance,originalReaderHelperReleased:true,persistenceVerified:true,reopenedVerified:true,executionAuthorized:false});results.set(result,this);this.#result=result;this.#cleanupComplete=true;this.#stage="complete";return result;
   }catch(error){this.#failed=true;try{await this.#cleanupOriginal();}catch{ 
   // Retain the same failed cleanup and original resources; no retry.
   }throw error;}finally{this.#executionSettled=true;}
  })();this.#execution=execution;return execution;
 }
 async #cleanupRecord(kind:CurrentSchematicRelevanceSavedReadbackJournalKind,evidence:Readonly<Record<string,unknown>>):Promise<void>{try{await this.#record(kind,evidence,true);}catch(error){this.#publicationBlocked=true;throw error;}}
 async #runCleanup():Promise<void>{
  try{await this.#journalReady();}catch(error){this.#publicationBlocked=true;throw error;}this.#publicationBlocked=false;
  if(this.#has("complete-result")){need(this.#closed&&this.#owner!==null&&this.#owner.status().released&&this.#owner.status().helperClosed,"PUBLISHED_COMPLETION_RESOURCES");this.#cleanupComplete=true;return;}
  await this.#cleanupRecord("failure",{stage:this.#stage,readbackAccepted:false});
  if(this.#owner===null&&this.#factory!==null){try{this.#owner=await this.#factory;}catch{this.#owner=currentSchematicRelevanceSavedReadbackAllocationOutcome(this.#prepared).owner;}if(this.#owner!==null){this.#journal.bindOwner(this.#owner);}}
  const owner=this.#owner;if(owner===null){const allocation=currentSchematicRelevanceSavedReadbackAllocationOutcome(this.#prepared);need(allocation.state==="not-attempted"||allocation.state==="no-resource","ALLOCATION_UNRESOLVED");await this.#cleanupRecord("cleanup-complete",{noResourceAllocated:true,readbackAccepted:false});this.#cleanupComplete=true;return;}
  this.#current(owner,true);let state=owner.status();
  if(state.binding===null&&!state.released){const pending=this.#pending;if(pending!==null){try{await pending;}catch{ 
   // Join the original failed launch.
   }}state=owner.status();if(state.binding===null){need(!state.launchConsumed||state.noProcessCleanupAvailable,"LAUNCH_UNRESOLVED");await this.#cleanupRecord("no-process-intent",{originalOwnerOnly:true});this.#release??=state.noProcessCleanupAvailable?(async():Promise<void>=>{await owner.releaseNoProcess();})():owner.releaseUnlaunched();await this.#release;this.#current(owner,true);}}
  state=owner.status();if(state.binding===null){need(state.released&&state.helperClosed,"NO_ROOT_HELPER_RELEASE");await this.#cleanupRecord("no-process-result",{helperReleased:true,helperClosed:true,rootCreated:false,exitClaimed:false});await this.#cleanupRecord("cleanup-complete",{readbackAccepted:false});this.#cleanupComplete=true;return;}
  const binding=canonicalJson(state.binding);need(this.#cleanupBinding===null||this.#cleanupBinding===binding,"CLEANUP_BINDING");this.#cleanupBinding=binding;
  if(!this.#closed){await this.#cleanupRecord("abort-intent",{originalReaderJobOnly:true});if(this.#abort===null){this.#cancelled=true;this.#abort=owner.abortSchematicSavedReadback(true);}try{await this.#abort;this.#abortAcknowledged=true;}catch{ 
   // An unknown original abort never permits redispatch.
   }await this.#cleanupRecord("abort-result",{originalJobAbortAcknowledged:this.#abortAcknowledged,retryAuthorized:false});}
  const pending=this.#pending;if(pending!==null){try{await pending;}catch{ 
   // Settle the actual original request before termination/release.
   }}
  if(this.#capture!==null&&this.#capture.status()["attempted"]===true){await this.#capture.settleRelease();need(this.#capture.isReleaseAcknowledged(),"FD_RELEASE_PENDING");}
  await this.#cleanupRecord("termination-intent",{originalReaderOnly:true});if(!this.#closed){await this.#exit(owner,true);}originalCurrentSchematicRelevanceSavedReadbackTermination(owner);await this.#cleanupRecord("termination-result",{rootExited:true,jobEmpty:true});
  await this.#cleanupRecord("helper-release-intent",{originalHelperOnly:true});await this.#releaseClosed(owner);await this.#cleanupRecord("helper-release-result",{helperReleased:true,helperClosed:true});await this.#cleanupRecord("cleanup-complete",{readbackAccepted:false});this.#cleanupComplete=true;
 }
 #cleanupOriginal():Promise<void>{if(this.#cleanup!==null){return this.#cleanup;}const pending=(async():Promise<void>=>{try{await this.#runCleanup();}finally{this.#cleanupSettled=true;}})();this.#cleanup=pending;return pending;}
 public abort(confirmOriginalJobOnly:true):Promise<void>{
  // oxlint-disable-next-line typescript/no-unnecessary-boolean-literal-compare -- Runtime caller confirms only the original Job cleanup, never PID/path signals.
  need(confirmOriginalJobOnly===true,"ORIGINAL_JOB_CONFIRMATION");this.#cancelled=true;return this.#settlement??this.#cleanupOriginal();
 }
 public settleCleanup():Promise<void>{
  const cleanup=this.#cleanup;if(cleanup===null){return Promise.reject(new Error("SCHEMATIC_SAVED_WORKFLOW_CLEANUP_NOT_SUBMITTED"));}if(this.#settlement!==null){return this.#settlement;}if(!this.#cleanupSettled||!this.#cleanupExhausted&&!this.#publicationBlocked){return cleanup;}
  const binding=this.#cleanupBinding,owner=this.#owner;const publication=this.#publicationBlocked;if(!publication&&(owner===null||binding===null)){return Promise.reject(new Error("SCHEMATIC_SAVED_WORKFLOW_ORIGINAL_SETTLEMENT_BINDING"));}
  const pending=(async():Promise<void>=>{try{await cleanup;}catch{ 
   // Retain the original failure while joining one extra bounded observation round.
   }if(!publication){need(owner!==null&&binding!==null,"ORIGINAL_SETTLEMENT_BINDING");this.#current(owner,true);need(canonicalJson(owner.status().binding)===binding,"ORIGINAL_SETTLEMENT_BINDING");await this.#journalReady();await this.#exit(owner,true);}await this.#runCleanup();})();this.#settlement=pending;return pending;
 }
 public inspect():Readonly<Record<string,unknown>>{return Object.freeze({schema:"private.current-schematic-relevance-saved-readback-workflow-status.v1",stage:this.#stage,started:this.#execution!==null,executionSettled:this.#executionSettled,failed:this.#failed,pending:this.#pending!==null||this.#factory!==null&&!this.#factorySettled,publicationPending:this.#publication!==null||this.#journal.retained().publicationPending,cleanupPublicationBlocked:this.#publicationBlocked,abortAttempted:this.#abort!==null,originalAbortAcknowledged:this.#abortAcknowledged,normalCloseAttempted:this.#normalClose,originalClosureObserved:this.#closed,cleanupSettled:this.#cleanupSettled,cleanupComplete:this.#cleanupComplete,cleanupExitWaitExhausted:this.#cleanupExhausted,settlementAttempted:this.#settlement!==null,allocation:currentSchematicRelevanceSavedReadbackAllocationOutcome(this.#prepared).state,owner:this.#owner?.status()??null,capture:this.#capture?.status()??null,journal:this.#journal.retained(),persistenceVerified:this.#result!==null,reopenedVerified:this.#result!==null,executionAuthorized:false});}
 /** Diagnostic allocation data never recreates a live owner or acceptance. */
 public cleanupStatus():CurrentSchematicRelevanceSavedReadbackCleanupStatus{
  requireOriginalGeneratedSchematicRelevanceSavedReadbackPlan(this.#prepared);const original=currentSchematicRelevanceSavedReadbackAllocationOutcome(this.#prepared),owner=this.#owner??original.owner;
  if(owner!==null){assertOriginalCurrentSchematicRelevanceSavedReadbackOwner(owner);need(originalCurrentSchematicRelevanceSavedReadbackTarget(owner)===this.#prepared,"STATUS_ORIGINAL_OWNER");}
  const state=owner?.status();const released=state?.released===true&&state.helperClosed;let allocation:CurrentSchematicRelevanceSavedReadbackCleanupStatus["allocation"]="unresolved";
  if(released){allocation="released";}else if(owner!==null){allocation="retained";}else if(original.state==="not-attempted"){allocation="not-entered";}else if(original.state==="no-resource"){allocation="no-resource";}
  return Object.freeze({allocation,nativeResourcesRetained:allocation==="retained"||allocation==="unresolved",abortAttempted:this.#abort!==null,originalTerminationVerified:this.#closed,helperReleaseVerified:released,
   captureReleasePending:this.#capture!==null&&!this.#capture.isReleaseAcknowledged(),originalCallsPending:this.#pending!==null||this.#factory!==null&&!this.#factorySettled,publicationPending:this.#publicationBlocked||this.#publication!==null||this.#journal.retained().publicationPending});
 }
 /** Historical closure is derived only from this workflow's retained resources.
  * It grants no saved-readback acceptance or native continuation. */
 public requireOriginalResourceClosure():Readonly<{generation:CurrentSchematicRelevanceSavedReadbackResourceClosure;captureStarted:boolean}>{
  const state=this.cleanupStatus();need(!state.originalCallsPending&&!state.publicationPending&&!state.captureReleasePending&&(this.#execution===null||this.#executionSettled)&&this.#cleanupComplete,"RESOURCE_CLOSURE_PENDING");
  const original=currentSchematicRelevanceSavedReadbackAllocationOutcome(this.#prepared),owner=this.#owner??original.owner;let generation:CurrentSchematicRelevanceSavedReadbackResourceClosure;
  if(owner===null){if(original.state==="not-attempted"&&this.#factory===null){generation=Object.freeze({outcome:"allocation-never-entered",helperAllocated:false,rootCreated:false,exitClaimed:false});}else{need(original.state==="no-resource"&&this.#factorySettled,"RESOURCE_CLOSURE_UNRESOLVED");generation=Object.freeze({outcome:"no-resource-allocated",helperAllocated:false,rootCreated:false,exitClaimed:false});}}
  else{this.#current(owner,true);const status=owner.status();need(status.released&&status.helperClosed,"RESOURCE_CLOSURE_UNRELEASED");if(status.binding===null){generation=Object.freeze({outcome:"root-never-created",helperAllocated:true,helperReleased:true,rootCreated:false,exitClaimed:false});}else{need(this.#closed,"RESOURCE_CLOSURE_EXIT");originalCurrentSchematicRelevanceSavedReadbackTermination(owner);generation=Object.freeze({outcome:"root-exited",helperAllocated:true,helperReleased:true,rootCreated:true,originalRootExited:true,originalJobEmpty:true});}}
  return Object.freeze({generation,captureStarted:this.#capture!==null});
 }
 public requireOriginalResult(result:CurrentSchematicRelevanceSavedReadbackWorkflowResult):CurrentSchematicRelevanceSavedReadbackWorkflowResult{need(this.#result===result&&results.get(result)===this&&this.#owner!==null&&this.#closed&&this.#normalClose&&this.#cleanupComplete,"ORIGINAL_RESULT");this.#current(this.#owner,true);requireOriginalCurrentSchematicRelevanceSavedReadbackAcceptance(result.acceptance,this.#owner);need(this.#owner.status().released&&this.#owner.status().helperClosed,"ORIGINAL_HELPER_RELEASE");return result;}
}
export function requireOriginalCurrentSchematicRelevanceSavedReadbackWorkflowResult(result:CurrentSchematicRelevanceSavedReadbackWorkflowResult,workflow:CurrentSchematicRelevanceSavedReadbackWorkflow):CurrentSchematicRelevanceSavedReadbackWorkflowResult{need(results.get(result)===workflow,"ORIGINAL_RESULT");return workflow.requireOriginalResult(result);}
