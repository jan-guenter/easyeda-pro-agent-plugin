/* oxlint-disable import/max-dependencies -- One original full lifecycle composes maintained journal, input, native factory, opening and cleanup; historical v2 provider registries stay separate. */
/** Producer-capable full opening and same-owner source handoff. The clock,
 * Create and persistence gates remain independent; unknown producers stay held. */
import { CURRENT_COMPLETE_FORWARD_STARTUP_METHODS, CURRENT_COMPLETE_FORWARD_STARTUP_SEQUENCE } from "./current-footprint-forward-writer-startup-transport.ts";
import { types } from "node:util";
// oxlint-disable-next-line import/no-cycle -- The original preparer registry is consulted only by a later reservation; module evaluation reads no cyclic binding.
import { requireOriginalCurrentFootprintForwardWriterClockPreparationOperation } from "./current-footprint-forward-writer-clock-preparation.ts";
import type { CurrentFootprintForwardWriterClockPreparationOperation } from "./current-footprint-forward-writer-clock-preparation.ts";
import { z } from "zod";
import { canonicalJson, sha256Json } from "./core.ts";
import { prepareCurrentFootprintCopyOwned } from "./current-footprint-copy-preparation-runtime.ts";
import { CURRENT_PCB_209_OPENING_SCRIPTS } from "./current-pcb-209-opening-profile.ts";
import { CurrentFootprintCopyStartupOpening } from "./current-pcb-209-worker-startup-opening.ts";
import type { CurrentFootprintCopyStartupOpeningResult } from "./current-pcb-209-worker-startup-opening.ts";
import { acquireCurrentPcbDiagnosticLaunchExclusion, assertCurrentPcbDiagnosticLaunchExclusion, assertNoUnresolvedCurrentPcbDiagnosticLaunches, releaseCurrentPcbDiagnosticLaunchExclusion } from "./current-pcb-diagnostic-lifecycle-journal.ts";
import type { CurrentPcbDiagnosticLifecycleOptions } from "./current-pcb-diagnostic-lifecycle.ts";
import { verifyCurrentPcb209DiagnosticInstallation } from "./current-pcb-diagnostic-installation.ts";
import type { CurrentPcbDiagnosticInstallationOptions } from "./current-pcb-diagnostic-installation.ts";
import { assertOriginalCurrentFootprintForwardWriterCompleteNativeOwner, assertOriginalCurrentFootprintForwardWriterNativeOwner, currentFootprintForwardWriterBirthOutcome, currentFootprintForwardWriterCompleteBirthOutcome, requireCurrentFootprintForwardWriterCompleteUnownedHelperClosed, requireCurrentFootprintForwardWriterUnownedHelperClosed, startCurrentFootprintForwardWriterCompleteNativeOwner, startCurrentFootprintForwardWriterNativeOwner } from "./current-pcb-diagnostic-owner.ts";
import type { CurrentFootprintCombinedAbortReservation, CurrentFootprintForwardWriterNativeOwner, CurrentFootprintForwardWriterReleasePreflightProof } from "./current-pcb-diagnostic-owner.ts";
import { assertNoUnresolvedOrdinaryLaunches } from "./ordinary-launch.ts";
import { createCurrentFootprintForwardWriterHeadInput, currentFootprintForwardWriterHeadInputBirthOptions, prepareCurrentFootprintForwardWriterHeadInput,
  requireCurrentFootprintForwardWriterPreparedInput, verifyCurrentFootprintForwardWriterPreparedInput } from "./current-footprint-forward-writer-head-input.ts";
import { CURRENT_FOOTPRINT_FORWARD_WRITER_PURPOSE } from "./current-footprint-forward-writer-profile.ts";
import { CURRENT_FOOTPRINT_FORWARD_WRITER_OPENING_BUDGET as BUDGET, CURRENT_FOOTPRINT_FORWARD_WRITER_OPENING_PRODUCER_STEPS as PRODUCER_STEPS, currentFootprintForwardWriterOpeningRequestSchema, currentFootprintForwardWriterOpeningResultSchema } from "./current-footprint-forward-writer-opening-contract.ts";
import type { CurrentFootprintForwardWriterOpeningRequest as Request, CurrentFootprintForwardWriterOpeningResult as Result } from "./current-footprint-forward-writer-opening-contract.ts";
import { CurrentFootprintForwardWriterOpeningJournal } from "./current-footprint-forward-writer-opening-journal.ts";
import { captureCurrentFootprintForwardExecutionPrototypes, captureCurrentFootprintForwardExecutionReceiver, requireCurrentFootprintForwardExecutionPrototypes } from "./current-footprint-forward-execution-opening-identity.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import type { CurrentProjectSaveProducerHeldCall } from "./current-project-save-producer-origin.ts";

function need(value:boolean,code:string):asserts value { if(!value) { throw new Error(`FULL_FORWARD_OPENING_${code}`); } }
const token=z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$(?![\s\S])/u);
const openingPrototype=captureCurrentFootprintForwardExecutionPrototypes(CurrentFootprintCopyStartupOpening.prototype);
const journalPrototype=captureCurrentFootprintForwardExecutionPrototypes(CurrentFootprintForwardWriterOpeningJournal.prototype);
const nativeMethods=["launch","status","bindForwardWriterHeadInput","prepareFootprintForwardWriterStartupFrontier","finishFootprintForwardWriterStartupFrontier","observeFootprintCopyUi","requireFootprintCopyUi","assertFootprintForwardWriterSourceCapacity","sealFootprintForwardWriterSource","originalFootprintForwardWriterSource","observeFootprintMainConstruction","browserObservation","inspectFrames","inspectScript","handoffWorkerStartup","observeForwardHeadOpening","whenFootprintForwardWriterProducersArmed","observeFootprintForwardWriterHeldProducer","footprintForwardWriterHeldProducerRole","footprintForwardWriterProducerProgress","continueFootprintForwardWriterStartupCache","continueFootprintForwardWriterStartupSyncCall","settleFootprintForwardWriterStartupCache","settleFootprintForwardWriterStartupSyncCalls","reserveFootprintCombinedAbort","dispatchFootprintCombinedAbort","observeApplicationWindow","requestNormalClose","endFootprintForwardWriterWorkflowObserversAfterTermination","observeTermination","releaseClosed","releaseUnlaunched","releaseNoProcess","consumeFootprintForwardWriterReleasePreflightFailure","retryFootprintForwardWriterReleaseAfterPreflight"] as const satisfies readonly (keyof CurrentFootprintForwardWriterNativeOwner)[];
type PreparedInput=ReturnType<typeof requireCurrentFootprintForwardWriterPreparedInput>;
type ReleaseKind="release-result"|"cleanup-unlaunched-owner"|"cleanup-no-process"|"cleanup-no-allocation"|"cleanup-unowned-helper";
type NormalStage="main"|"browser"|"frames"|"ui-source"|"handoff"|"assignments"|"ui"|"state"|"source"|"preparation";
type Stage="new"|"launched"|"main"|"browser"|"frames"|"ui-source"|"sealed";
type Outcome=Readonly<{value:CurrentFootprintCopyStartupOpeningResult}>|Readonly<{error:unknown}>;
type ProducerAction="head"|"arm"|"cache"|"sync"|"settle-cache"|"settle-sync";
export interface CurrentFootprintForwardWriterClockPreparationReservation { readonly profile:"private.current-footprint-forward-writer-clock-preparation-reservation.v1" }
export type CurrentFootprintForwardWriterClockPreparationOutcome=Readonly<{failed:false}>|Readonly<{failed:true;cause:unknown}>;
const originals=new WeakSet<object>();
const completeProviders=new WeakSet<object>();
/** Own all original promises synchronously before their first await. Every
 * normal failure burns the flow; cleanup settles original facts without replay. */
export class CurrentFootprintForwardWriterOpeningProvider {
 readonly #options:CurrentPcbDiagnosticLifecycleOptions;readonly #request:Request;readonly #head:ReturnType<typeof createCurrentFootprintForwardWriterHeadInput>;
 readonly #journal:CurrentFootprintForwardWriterOpeningJournal;readonly #journalCurrent:()=>void;
 #birth:CurrentPcbDiagnosticInstallationOptions|null=null;#prepared:ReturnType<typeof requireCurrentFootprintForwardWriterPreparedInput>|null=null;
 #lease:ReturnType<typeof acquireCurrentPcbDiagnosticLaunchExclusion>|null=null;#owner:CurrentFootprintForwardWriterNativeOwner|null=null;#methods:ReadonlyMap<string,unknown>|null=null;
 #result:Result|null=null;#bindingSha256:string|null=null;#sourceAttempted=false;
 #frontierPreparation:ReturnType<CurrentFootprintForwardWriterNativeOwner["prepareFootprintForwardWriterStartupFrontier"]>|null=null;
 #clockPending:Promise<unknown>|null=null;#clockPreparationAttempted=false;#clockReservation:CurrentFootprintForwardWriterClockPreparationReservation|null=null;
 #stage:Stage="new";#busy=false;#cleanupBusy=false;#failed=false;#failure:unknown;#launchInvoked=false;#factoryInvoked=false;#factorySettled=false;#failureRecordAttempted=false;
 #opening:CurrentFootprintCopyStartupOpening|null=null;#openingInvoked=false;#openingCurrent:(()=>void)|null=null;#openingPending:Promise<Outcome>|null=null;#openingOutcome:Outcome|null=null;#openingRelease:Promise<void>|null=null;
 #producerOrdinal=0;#held:CurrentProjectSaveProducerHeldCall|null=null;#read:Promise<CurrentProjectSaveProducerHeldCall>|null=null;
 #normalCloseAttempted=false;#normalCloseDispatched=false;#normalCloseAcknowledged=false;#normalClosePending:Promise<void>|null=null;
 #abort:CurrentFootprintCombinedAbortReservation|null=null;#abortDispatched=false;#abortAcknowledged=false;
 #terminationOrdinal=0;#terminationPending:{ordinal:number;dispatched:boolean;result:boolean|null}|null=null;#terminated=false;
 #settleCacheAttempted=false;#settleSyncAttempted=false;
 #releaseFirstFailure:unknown;#releasePreflightProof:CurrentFootprintForwardWriterReleasePreflightProof|null=null;#releaseRetryAttempted=false;
 #releaseEvidence:Readonly<Record<string,unknown>>|null=null;#releasePending:Promise<unknown>|null=null;#released=false;#releaseKind:"release-result"|"cleanup-unlaunched-owner"|"cleanup-no-process"|"cleanup-no-allocation"|"cleanup-unowned-helper"|null=null;
 public constructor(input:unknown,options:CurrentPcbDiagnosticLifecycleOptions) {
  this.#head=createCurrentFootprintForwardWriterHeadInput(input,options);this.#options=options;
  this.#request=freezeDeep(currentFootprintForwardWriterOpeningRequestSchema.parse(captureCurrentPcbStringClockReply(input).value));
  this.#journal=new CurrentFootprintForwardWriterOpeningJournal(this.#request);
  this.#journalCurrent=captureCurrentFootprintForwardExecutionReceiver(this.#journal,journalPrototype,["reserve","append","settle","waitForCurrentPublication","assertCurrent","retained","reservationOutcome"]);
  originals.add(this);Object.freeze(this);
 }
 #current(cleanup=false):void {
  // oxlint-disable-next-line eslint/no-use-before-define -- Captured after class evaluation, before any caller can construct a provider.
  requireCurrentFootprintForwardExecutionPrototypes(providerPrototype);
  need(originals.has(this)&&Object.getPrototypeOf(this)===CurrentFootprintForwardWriterOpeningProvider.prototype&&Reflect.ownKeys(this).length===0,"ORIGINAL_PROVIDER");
  this.#options.assertLocalAllowed();this.#journalCurrent();this.#openingCurrent?.();
  if(this.#lease!==null) { assertCurrentPcbDiagnosticLaunchExclusion(this.#lease); }
  if(!cleanup) { need(!this.#failed&&this.#abort===null&&!this.#abortDispatched&&!this.#released,"NORMAL_ENDED"); }
  if(this.#owner!==null) { assertOriginalCurrentFootprintForwardWriterNativeOwner(this.#owner);if(completeProviders.has(this)){assertOriginalCurrentFootprintForwardWriterCompleteNativeOwner(this.#owner);}for(const [key,value] of this.#methods??[]) { need(Reflect.get(this.#owner,key)===value,"ORIGINAL_NATIVE_METHOD"); } }
 }
 async #startupFailureEvidence(): Promise<Readonly<Record<string, unknown>>> {
   if ((this.#stage !== "main" && this.#stage !== "browser" && this.#stage !== "frames") ||
       !completeProviders.has(this) || this.#owner === null) { return {}; }
   try {
    const status = this.#owner.status();
    const request = status.diagnosticFailureObservation?.request;
    const method = request !== null && request !== undefined && CURRENT_COMPLETE_FORWARD_STARTUP_SEQUENCE[request.id - 1] === request.method
     ? CURRENT_COMPLETE_FORWARD_STARTUP_METHODS.find(value => value === request.method) ?? null : null;
    const requestId = method === null ? null : request?.id ?? null;
    const heldSite = status.selectedSqlFence?.["heldSite"];
    const deadline = status.diagnosticFailureObservation?.code === "deadline";
    const transport = status.forwardStartupTransport;
    let windowPresent: boolean | null = null;
    if (deadline && this.#stage === "main") {
     try { windowPresent = await this.#owner.observeApplicationWindow() !== null; }
     catch {
      // An unavailable passive window sample must not replace the original transport error.
     }
    }
    return { browser: {
     method, requestId, deadline, mainPause: status.forwardStartupMainPause ?? null, windowPresent,
     ...(requestId !== null && transport?.requestId === requestId ? { openingTransport: {
      writeAcknowledged: transport.writeAcknowledged, rendererPolls: transport.rendererPolls, rendererBytesObserved: transport.rendererBytesObserved,
     } } : {}),
     mainHeldSite: typeof heldSite === "string" && /^[A-Za-z][A-Za-z0-9]{0,47}$(?![\s\S])/u.test(heldSite) ? heldSite : null,
    } };
   } catch {
    // Optional cached diagnostics must not delay original failure publication.
    return {};
   }
  }
 async #normal<T>(action:()=>Promise<T>):Promise<T> {
  this.#current();need(!this.#busy&&!this.#cleanupBusy,"BUSY");this.#busy=true;
  try { return await action(); }
  catch(error) {
   if(!this.#failed) { this.#failed=true;this.#failure=error; }
   if(this.#abort===null&&this.#journal.retained().reserved&&!this.#journal.retained().publicationPending&&!this.#failureRecordAttempted) {
    this.#failureRecordAttempted=true;
    try {
     const browserEvidence = await this.#startupFailureEvidence();
     await this.#journal.append("failure",{phase:this.#stage,originalErrorRetained:true,code:"ORIGINAL_STAGE_FAILED",...browserEvidence});
    }
    catch(publicationError) {
     // oxlint-disable-next-line eslint/preserve-caught-error -- Original operation error remains the cause; separate publication failure is retained in this aggregate.
     throw new AggregateError([error,publicationError],"FULL_FORWARD_FAILURE_PUBLICATION",{cause:error});
    }
   }
   throw error;
  } finally { this.#busy=false; }
 }
 #requiredOwner():CurrentFootprintForwardWriterNativeOwner { need(this.#owner!==null,"OWNER_REQUIRED");return this.#owner; }
 async #stageCall<T>(stage:NormalStage,evidence:Readonly<Record<string,unknown>>,action:()=>Promise<T>,retain:(value:T)=>void=():void=>{
   // This stage creates no separately retained resource.
  },project:(value:T)=>Readonly<Record<string,unknown>>=value=>({result:value})):Promise<T> {
  await this.#journal.append(`${stage}-intent`,evidence);this.#current();
  const value=await action();retain(value);this.#current();await this.#journal.append(`${stage}-result`,project(value));this.#current();return value;
 }
 async #preparedCurrent(historical:boolean):Promise<PreparedInput> {
  this.#current();const original=this.#prepared;need(original!==null,"PREPARED_REQUIRED");
  await verifyCurrentFootprintForwardWriterPreparedInput(this.#head,historical);this.#current();const current=requireCurrentFootprintForwardWriterPreparedInput(this.#head);
  need(this.#prepared===original&&current.checkpoint===original.checkpoint&&current.source===original.source&&current.sealedTarget===original.sealedTarget,"PREPARED_CHANGED");return original;
 }
 /** Reserve before preparation/native work. The full factory consumes the
  * same actual input; no second reader, caller owner or historical v2 exists. */
 public launch():Promise<Readonly<Record<string,unknown>>> { return this.#normal(async()=>{
  need(this.#stage==="new"&&!this.#factoryInvoked&&this.#birth===null,"LAUNCH_CONSUMED");await this.#options.assertAllowed();this.#current();await this.#options.assertOtherLaunchesSettled();this.#current();
  await assertNoUnresolvedOrdinaryLaunches();await assertNoUnresolvedCurrentPcbDiagnosticLaunches();this.#current();this.#lease=acquireCurrentPcbDiagnosticLaunchExclusion();
  await this.#journal.reserve();this.#current();await this.#journal.append("prepare-intent",{target:this.#request.target});this.#current();
  await prepareCurrentFootprintForwardWriterHeadInput(this.#head);this.#prepared=requireCurrentFootprintForwardWriterPreparedInput(this.#head);this.#birth=currentFootprintForwardWriterHeadInputBirthOptions(this.#head);this.#current();
  await this.#journal.append("prepare-result",{checkpoint:this.#prepared.checkpoint,beforeSqlSha256:this.#prepared.source.before.logicalSha256,originalSqlReaderCompleted:true});this.#current();
  const installation=await verifyCurrentPcb209DiagnosticInstallation(this.#birth);this.#current();const executable=installation.plan.files[0];need(executable!==undefined,"EXECUTABLE_REQUIRED");await this.#preparedCurrent(false);
  await this.#journal.append("allocation-intent",{purpose:CURRENT_FOOTPRINT_FORWARD_WRITER_PURPOSE,installationSha256:sha256Json(installation),...(completeProviders.has(this)?{nativeBirth:{schema:"private.current-footprint-forward-writer-complete-birth.v3",graphKind:"complete-v2"}}:{})});this.#current();this.#factoryInvoked=true;
  try { this.#owner=await (completeProviders.has(this)?startCurrentFootprintForwardWriterCompleteNativeOwner:startCurrentFootprintForwardWriterNativeOwner)(this.#birth,this.#head); }
  catch(error) { const outcome=(completeProviders.has(this)?currentFootprintForwardWriterCompleteBirthOutcome:currentFootprintForwardWriterBirthOutcome)(this.#birth);if(outcome.owner!==null) { this.#owner=outcome.owner; }throw error; }
  finally { this.#factorySettled=true; }
  const owner=this.#requiredOwner();assertOriginalCurrentFootprintForwardWriterNativeOwner(owner);this.#methods=new Map(nativeMethods.map(key=>[key,Reflect.get(owner,key)]));this.#current();
  await this.#journal.append("allocation-result",{retained:true,purpose:CURRENT_FOOTPRINT_FORWARD_WRITER_PURPOSE});this.#current();await this.#preparedCurrent(false);
  await this.#journal.append("launch-intent",{executableSha256:executable.sha256});this.#current();this.#launchInvoked=true;let failure:unknown;let launchFailed=false;
  try { await owner.launch({executable:executable.windowsPath,executableSha256:executable.sha256,confirmDiagnosticLaunch:true}); }catch(error) { launchFailed=true;failure=error;this.#failed=true;this.#failure=error; }
  const binding=owner.status().binding;
  if(binding!==null) {
   try { await this.#journal.append("binding",{binding,acknowledged:!launchFailed});const published=this.#journal.retained().records.find(row=>row.kind==="binding");need(published!==undefined,"BINDING_PUBLICATION");this.#bindingSha256=sha256Json(published); }
   catch(publicationError) {
    if(launchFailed) {
     // oxlint-disable-next-line eslint/preserve-caught-error -- Preserve the original launch rejection as cause and the separate binding publication failure in the aggregate.
     throw new AggregateError([failure,publicationError],"FULL_FORWARD_BINDING_PUBLICATION",{cause:failure});
    }
    throw publicationError;
   }
  }
  this.#current(true);if(launchFailed) {
   // Preserve the exact original native launch rejection; it is never replayed.
   throw failure;
  }need(binding!==null,"BINDING_REQUIRED");
  await owner.bindForwardWriterHeadInput(this.#head);this.#current();this.#stage="launched";
  return Object.freeze({operationId:this.#request.operationId,binding,originalFullInputRetained:true,executionAuthorized:false,saveAuthorized:false});
 }); }
 public observeMain():Promise<Readonly<Record<string,unknown>>> { return this.#normal(async()=>{need(this.#stage==="launched","MAIN_STAGE");const value=await this.#stageCall("main",{},()=>this.#requiredOwner().observeFootprintMainConstruction());this.#stage="main";return value;}); }
 public observeBrowser():Promise<Readonly<Record<string,unknown>>> { return this.#normal(async()=>{need(this.#stage==="main","BROWSER_STAGE");const value=await this.#stageCall("browser",{},()=>this.#requiredOwner().browserObservation());this.#stage="browser";return value;}); }
 public inspectFrames(targetId:string):Promise<Readonly<Record<string,unknown>>> { return this.#normal(async()=>{need(this.#stage==="browser","FRAMES_STAGE");const selected=token.parse(targetId);const value=await this.#stageCall("frames",{targetId:selected},()=>this.#requiredOwner().inspectFrames(selected));this.#stage="frames";return value;}); }
 public inspectUi(frameId:string):Promise<Readonly<Record<string,unknown>>> { return this.#normal(async()=>{need(this.#stage==="frames","UI_STAGE");const selected=token.parse(frameId);const value=await this.#stageCall("ui-source",{frameId:selected},()=>this.#requiredOwner().inspectScript(selected,CURRENT_PCB_209_OPENING_SCRIPTS.ui));this.#stage="ui-source";return value;}); }
 async #producer<T>(action:ProducerAction,work:()=>Promise<T>):Promise<T> {
  need(this.#producerOrdinal<PRODUCER_STEPS,"PRODUCER_STEPS");this.#producerOrdinal+=1;const evidence={ordinal:this.#producerOrdinal,action,facts:{originalPendingOpening:true}};
  await this.#journal.append("producer-intent",evidence);this.#current();const value=await work();this.#current();await this.#journal.append("producer-result",{...evidence,facts:{originalStageReturned:true}});this.#current();return value;
 }
 /** Retain navigation once, service source-held callbacks while it is pending,
  * and leave the next unsupported frontier held without pretending completion. */
 public startOpening():Promise<void> { return this.#normal(async()=>{
  need(this.#stage==="ui-source"&&this.#opening===null&&this.#openingPending===null,"OPENING_CONSUMED");const prepared=await this.#preparedCurrent(false);const owner=this.#requiredOwner();
  const handoff=await this.#stageCall("handoff",{},()=>owner.handoffWorkerStartup(),():void=>{
   // Native handoff stays retained by the same original owner.
  },value=>({originalChannelRetained:true,parentSessionId:value.dependency.parentSessionId,parentTargetId:value.dependency.parentTargetId}));
  this.#frontierPreparation=owner.prepareFootprintForwardWriterStartupFrontier();await this.#frontierPreparation;this.#current();
  requireCurrentFootprintForwardExecutionPrototypes(openingPrototype);const opening=new CurrentFootprintCopyStartupOpening(handoff);this.#opening=opening;
  this.#openingCurrent=captureCurrentFootprintForwardExecutionReceiver(opening,openingPrototype,["open","proveCurrentAssignments","observeFootprintState","observeFootprintSource","requireFootprintSource","releaseAfterTermination","status"]);
  await this.#journal.append("opening-intent",{target:prepared.sealedTarget});this.#current();
  this.#openingInvoked=true;const pending=opening.open(prepared.sealedTarget,async()=>{await this.#preparedCurrent(false);await this.#journal.assertCurrent();this.#current();});
  this.#openingPending=(async():Promise<Outcome>=>{
   let outcome:Outcome;try { outcome=Object.freeze({value:await pending}); }catch(error) { if(!this.#failed) { this.#failed=true;this.#failure=error; }outcome=Object.freeze({error}); }
   this.#openingOutcome=outcome;return outcome;
  })();
  await this.#producer("head",()=>owner.observeForwardHeadOpening());await this.#producer("arm",()=>owner.whenFootprintForwardWriterProducersArmed());
  this.#read=owner.observeFootprintForwardWriterHeldProducer();this.#retainReadRejection(this.#read);
 }); }
 #retainReadRejection(pending:Promise<CurrentProjectSaveProducerHeldCall>):void { void(async():Promise<void>=>{try { await pending; }catch(error) { if(!this.#failed) { this.#failed=true;this.#failure=error; } }})(); }
 /** The exact delivered packet remains local. Callers receive a role label,
  * not a serialized handle capable of selecting or replaying a continuation. */
 public nextHeldProducer():Promise<Readonly<{role:string}>> { return this.#normal(async()=>{
  need(this.#read!==null&&this.#held===null,"ORIGINAL_PRODUCER_READ");const pending=this.#read;const packet=await pending;this.#current();need(this.#read===pending,"READ_CHANGED");this.#held=packet;
  return Object.freeze({role:this.#requiredOwner().footprintForwardWriterHeldProducerRole(packet)});
 }); }
 /** Original admitted cardinality, available before source capture; no continuation. */
 public startupCacheJobs():number {
  this.#current();need(this.#openingInvoked&&this.#openingPending!==null,"ORIGINAL_STARTUP_REQUIRED");
  const progress=this.#requiredOwner().footprintForwardWriterProducerProgress();const cache=progress.cache;
  need(progress.armed&&!progress.failed&&cache!==null&&!cache.failed&&Number.isSafeInteger(cache.jobs)&&cache.jobs>=2&&cache.jobs<=8,"ORIGINAL_CACHE_JOB_COUNT");
  return cache.jobs;
 }
 public continueStartup(kind:"cache"|"sync"):Promise<void> { return this.#normal(async()=>{
  need(kind==="cache"||kind==="sync","STARTUP_KIND");
  need(this.#held!==null&&this.#read!==null,"ORIGINAL_HELD_REQUIRED");const owner=this.#requiredOwner(),packet=this.#held;
  const role=owner.footprintForwardWriterHeldProducerRole(packet);need(kind==="cache"?["headEntry","headPromise","headSuccess"].includes(role):["syncEntry","syncFull","syncHistory","syncMerged","syncFinalizing","syncReturned"].includes(role),"PRODUCER_ROLE");
  await this.#producer(kind,async()=>{this.#held=null;this.#read=null;await (kind==="cache"?owner.continueFootprintForwardWriterStartupCache(packet):owner.continueFootprintForwardWriterStartupSyncCall(packet));});
  this.#read=owner.observeFootprintForwardWriterHeldProducer();this.#retainReadRejection(this.#read);
 }); }
 public settleStartup(kind:"cache"|"sync"):Promise<void> { return this.#normal(async()=>{
  need((kind==="cache"||kind==="sync")&&this.#openingPending!==null,"SETTLEMENT_STAGE");
  if(kind==="cache") { need(!this.#settleCacheAttempted,"CACHE_SETTLEMENT_CONSUMED");this.#settleCacheAttempted=true; }
  else { need(!this.#settleSyncAttempted,"SYNC_SETTLEMENT_CONSUMED");this.#settleSyncAttempted=true; }
  const owner=this.#requiredOwner();await this.#producer(kind==="cache"?"settle-cache":"settle-sync",async()=>{
   const progress=owner.footprintForwardWriterProducerProgress();
   if(kind==="cache"){need(progress.cache!==null&&!progress.cache.failed,"ORIGINAL_CACHE_SETTLEMENT");if(!progress.cache.complete){need(progress.cache.canSettle,"CACHE_SETTLEMENT_READY");await owner.settleFootprintForwardWriterStartupCache();}}
   else{need(progress.sync!==null&&!progress.sync.failed,"ORIGINAL_SYNC_SETTLEMENT");if(!progress.sync.completed){need(progress.sync.canSettle,"SYNC_SETTLEMENT_READY");await owner.settleFootprintForwardWriterStartupSyncCalls();}}
  });
 }); }
 /** Finish the original navigation and startup component, then capture and
  * seal only this full writer's actual before/source/preparation references. */
 public captureSource():Promise<Result> { return this.#normal(async()=>{
  need(this.#stage==="ui-source"&&!this.#sourceAttempted&&this.#opening!==null&&this.#openingPending!==null&&this.#frontierPreparation!==null&&this.#bindingSha256!==null,"SOURCE_STAGE");
  this.#sourceAttempted=true;const opening=this.#opening,pending=this.#openingPending;const owner=this.#requiredOwner();
  const outcome=await pending;
  if("error" in outcome) { throw outcome.error; }
  this.#current();need(this.#openingPending===pending&&this.#openingOutcome===outcome&&this.#opening===opening,"ORIGINAL_OPENING_OUTCOME");
  need(this.#settleCacheAttempted&&this.#settleSyncAttempted,"STARTUP_SETTLEMENT_REQUIRED");
  await this.#journal.append("opening-result",{result:outcome.value});this.#current();
  await owner.finishFootprintForwardWriterStartupFrontier(opening,outcome.value);this.#current();
  const assignments=await this.#stageCall("assignments",{},()=>opening.proveCurrentAssignments(outcome.value));
  await this.#stageCall("ui",{},async()=>{const packet=await owner.observeFootprintCopyUi(opening,outcome.value);this.#current();await owner.requireFootprintCopyUi(packet);this.#current();return packet;});
  const state=await this.#stageCall("state",{},()=>opening.observeFootprintState(outcome.value,assignments));
  const prepared=await this.#preparedCurrent(true);owner.assertFootprintForwardWriterSourceCapacity();this.#current();
  const plan=prepared.source.sourcePlan;need(plan.maximumTicket===state.maximumTicket,"SOURCE_BASELINE_CHANGED");
  const source=await this.#stageCall("source",{sourcePlanSha256:sha256Json(plan)},()=>opening.observeFootprintSource(outcome.value,assignments,state,plan));
  const preparation=await this.#stageCall("preparation",{},()=>prepareCurrentFootprintCopyOwned(Object.freeze({opening,result:outcome.value,assignments,state,sourcePlan:plan,source,before:prepared.source.before})));
  await this.#journal.append("seal-intent",{sourcePacketSha256:sha256Json(source),preparationSha256:sha256Json(preparation)});this.#current();
  await owner.sealFootprintForwardWriterSource(this.#request.operationId,opening,outcome.value,preparation,prepared.checkpoint.checkpoint,prepared.runtime);this.#current();
  const original=owner.originalFootprintForwardWriterSource();need(original.opening===opening&&original.result===outcome.value&&original.preparation===preparation&&original.owned.before===prepared.source.before&&original.owned.sourcePlan===plan,"ORIGINAL_SEALED_INPUTS");
  const result=freezeDeep(currentFootprintForwardWriterOpeningResultSchema.parse({schema:"easyeda-pro-control.footprint-forward-writer-source-input.v1",purpose:CURRENT_FOOTPRINT_FORWARD_WRITER_PURPOSE,operationId:this.#request.operationId,
   bindingSha256:this.#bindingSha256,checkpointSha256:prepared.source.before.checkpointSha256,beforeSqlSha256:prepared.source.before.logicalSha256,sourcePlanSha256:sha256Json(plan),sourcePacketSha256:sha256Json(source),preparationSha256:sha256Json(preparation),
   originalOpeningRetained:true,sameWriterSourceSealed:true,wholeWriterReserved:false,routeAndClocksQualified:false,executionReady:false,executionAuthorized:false,saveAuthorized:false}));
  this.#result=result;await this.#journal.append("seal-result",{result});this.#current();this.#stage="sealed";return result;
 }); }
 /** Only this provider's published original values can feed the clock stage. */
 /** The fixed workflow may read only this original complete provider's
  * immutable request before launch. Data alone issues no native capability. */
 public originalCompleteWorkflowRequest():Request {
  this.#current(true);need(completeProviders.has(this),"ORIGINAL_COMPLETE_PROVIDER");return this.#request;
 }
 public async requireSourceInput():Promise<Readonly<{result:Result;owner:CurrentFootprintForwardWriterNativeOwner;headReference:PreparedInput["source"]["reference"];source:ReturnType<CurrentFootprintForwardWriterNativeOwner["originalFootprintForwardWriterSource"]>}>> {
  this.#current();need(this.#stage==="sealed"&&this.#result!==null&&this.#prepared!==null&&this.#openingOutcome!==null&&"value" in this.#openingOutcome,"SOURCE_NOT_PUBLISHED");
  await this.#journal.assertCurrent();this.#current();const owner=this.#requiredOwner(),source=owner.originalFootprintForwardWriterSource();
  const binding=this.#journal.retained().records.find(row=>row.kind==="binding");
  need(binding!==undefined&&sha256Json(binding)===this.#bindingSha256&&canonicalJson(binding.evidence["binding"])===canonicalJson(owner.status().binding)&&source.opening===this.#opening&&source.result===this.#openingOutcome.value&&source.owned.before===this.#prepared.source.before&&source.owned.sourcePlan===this.#prepared.source.sourcePlan,"ORIGINAL_PUBLISHED_SOURCE");
  return Object.freeze({result:this.#result,owner,source,headReference:this.#prepared.source.reference});
 }
 /** Own pre-birth opening intent only. This supports the original workflow's
  * diagnostic admission; no caller operation ID can issue an exclusion. */
 public async requireCompleteWorkflowOpeningPublication(operationId:string):Promise<boolean>{
  this.#current(true);if(!completeProviders.has(this)||this.#request.operationId!==operationId||this.#factoryInvoked||this.#launchInvoked||!this.#journal.retained().reserved){return false;}
  await this.#journal.assertCurrent();this.#current(true);
  return !this.#factoryInvoked&&!this.#launchInvoked&&this.#journal.retained().reserved;
 }
 public reserveClockPreparation(operation:CurrentFootprintForwardWriterClockPreparationOperation):CurrentFootprintForwardWriterClockPreparationReservation {
  this.#current();need(this.#stage==="sealed"&&!this.#busy&&!this.#cleanupBusy&&!this.#clockPreparationAttempted,"CLOCK_PREPARATION_CONSUMED");
  this.#clockPreparationAttempted=true;const original=requireOriginalCurrentFootprintForwardWriterClockPreparationOperation(operation,this);this.#clockPending=original.pending;this.#busy=true;const reservation=Object.freeze({profile:"private.current-footprint-forward-writer-clock-preparation-reservation.v1" as const});this.#clockReservation=reservation;return reservation;
 }
 public finishClockPreparation(reservation:CurrentFootprintForwardWriterClockPreparationReservation,outcome:CurrentFootprintForwardWriterClockPreparationOutcome):void {
  this.#current(true);need(reservation===this.#clockReservation&&this.#busy,"ORIGINAL_CLOCK_RESERVATION");
  if(outcome.failed&&!this.#failed) { this.#failed=true;this.#failure=outcome.cause; }this.#clockReservation=null;this.#busy=false;
 }
 /** No new native operation: settle only the journal's original pending bytes. */
 public async settleRecords():Promise<void> {
  this.#current(true);need(!this.#busy&&!this.#cleanupBusy,"SETTLEMENT_BUSY");this.#cleanupBusy=true;
  try { await this.#journal.settle();this.#current(true);
   if(this.#normalCloseAcknowledged&&!this.#journal.retained().records.some(entry=>entry.kind==="close-result")) { await this.#journal.append("close-result",{requested:true}); }
   if(this.#abortAcknowledged&&!this.#journal.retained().records.some(entry=>entry.kind==="abort-result")) { await this.#journal.append("abort-result",{requested:true,originalJobOnly:true}); }
   const pending=this.#terminationPending;if(pending!==null&&pending.result!==null) {
    if(!this.#journal.retained().records.some(entry=>entry.kind==="termination-result"&&entry.evidence["ordinal"]===pending.ordinal)) { await this.#journal.append("termination-result",{ordinal:pending.ordinal,terminated:pending.result}); }
    this.#terminationPending=null;
   }
   if(this.#releaseKind!==null&&this.#releaseEvidence!==null) { await this.#finishRelease(this.#releaseKind,this.#releaseEvidence); }
  } finally { this.#cleanupBusy=false; }
 }
 /** Original abort reservation/control only, with no Save or other process. */
 public async abort(confirmAbortOriginalJob:true):Promise<void> {
  this.#current(true);
  // oxlint-disable-next-line typescript/no-unnecessary-boolean-literal-compare -- Runtime callers must confirm only this original disposable Job.
  need(confirmAbortOriginalJob===true&&this.#launchInvoked&&!this.#cleanupBusy&&!this.#abortDispatched&&!this.#terminated,"ABORT_UNAVAILABLE");
  const owner=this.#requiredOwner();this.#abort??=owner.reserveFootprintCombinedAbort();this.#cleanupBusy=true;
  try { await this.#journal.waitForCurrentPublication();this.#current(true);await this.#journal.settle();
   if(!this.#journal.retained().records.some(entry=>entry.kind==="abort-intent")) { await this.#journal.append("abort-intent",{}); }
   this.#current(true);this.#abortDispatched=true;await owner.dispatchFootprintCombinedAbort(this.#abort,true);this.#abortAcknowledged=true;await this.#journal.append("abort-result",{requested:true,originalJobOnly:true});
  } finally { this.#cleanupBusy=false; }
 }
 /** The complete workflow requests the original window's normal close once,
  * after its copy-triggered persistence tail; it never chooses Save/discard. */
 public completeWorkflowNoProcessCleanupAvailable():boolean {
  this.#current(true);need(completeProviders.has(this),"ORIGINAL_COMPLETE_PROVIDER");return this.#owner?.status().noProcessCleanupAvailable===true;
 }
 public closeCompleteWorkflow():Promise<void> {
  this.#current(true);need(completeProviders.has(this)&&this.#launchInvoked&&!this.#normalCloseAttempted&&!this.#abortDispatched&&!this.#terminated&&!this.#busy&&!this.#cleanupBusy,"COMPLETE_CLOSE_UNAVAILABLE");
  this.#normalCloseAttempted=true;const completion=Promise.withResolvers<undefined>();
  this.#normalClosePending=completion.promise;this.#cleanupBusy=true;
  void(async():Promise<void>=>{try{
   await this.#journal.settle();this.#current(true);const owner=this.#requiredOwner();const hwnd=await owner.observeApplicationWindow();this.#current(true);need(hwnd!==null,"ORIGINAL_CLOSE_WINDOW");
   await this.#journal.append("close-intent",{hwnd});this.#current(true);this.#normalCloseDispatched=true;
   await owner.requestNormalClose(hwnd);this.#normalCloseAcknowledged=true;await this.#journal.append("close-result",{requested:true});
   // oxlint-disable-next-line unicorn/no-useless-undefined -- Preserve the retained undefined completion Promise.
   completion.resolve(undefined);
  }catch(error){completion.reject(error);}finally{this.#cleanupBusy=false;}})();return completion.promise;
 }
 public async observeTermination():Promise<boolean> {
  this.#current(true);need((this.#abortDispatched||completeProviders.has(this)&&this.#normalCloseDispatched)&&!this.#cleanupBusy&&(!this.#terminated||this.#terminationPending!==null),"TERMINATION_UNAVAILABLE");this.#cleanupBusy=true;
  try { if(this.#terminationPending===null) { need(this.#terminationOrdinal<BUDGET.terminationObservations,"TERMINATION_BOUND");this.#terminationOrdinal+=1;this.#terminationPending={ordinal:this.#terminationOrdinal,dispatched:false,result:null}; }
   const pending=this.#terminationPending;await this.#journal.settle();if(!this.#journal.retained().records.some(entry=>entry.kind==="termination-intent"&&entry.evidence["ordinal"]===pending.ordinal)) { await this.#journal.append("termination-intent",{ordinal:pending.ordinal}); }
   if(pending.result===null) { need(!pending.dispatched,"ORIGINAL_TERMINATION_PENDING");pending.dispatched=true;pending.result=await this.#requiredOwner().observeTermination();this.#terminated=pending.result; }
   if(!this.#journal.retained().records.some(entry=>entry.kind==="termination-result"&&entry.evidence["ordinal"]===pending.ordinal)) { await this.#journal.append("termination-result",{ordinal:pending.ordinal,terminated:pending.result}); }
   const result=pending.result;this.#terminationPending=null;return result;
  } finally { this.#cleanupBusy=false; }
 }
 async #finishRelease(kind:ReleaseKind,evidence:Readonly<Record<string,unknown>>):Promise<void> {
  need(this.#releaseKind===null||this.#releaseKind===kind,"ORIGINAL_RELEASE_KIND");this.#releaseKind=kind;
  if(this.#releaseEvidence===null) { this.#releaseEvidence=Object.freeze({...evidence}); }else { need(canonicalJson(this.#releaseEvidence)===canonicalJson(evidence),"ORIGINAL_RELEASE_FACTS"); }
  await this.#journal.settle();
  const existing=this.#journal.retained().records.find(entry=>entry.kind===kind);if(existing===undefined) { await this.#journal.append(kind,evidence); }else { need(canonicalJson(existing.evidence)===canonicalJson(evidence),"RELEASE_RECORD_CHANGED"); }
  this.#released=true;if(this.#lease!==null) { releaseCurrentPcbDiagnosticLaunchExclusion(this.#lease);this.#lease=null; }
 }
 public async cleanupBeforeLaunch():Promise<void> {
  this.#current(true);need(!this.#launchInvoked&&!this.#busy&&!this.#cleanupBusy,"PRELAUNCH_ONLY");this.#cleanupBusy=true;
  try { const reservation=this.#journal.reservationOutcome();if(!this.#factoryInvoked&&(reservation==="not-entered"||reservation==="conflict")) { if(this.#lease!==null) { releaseCurrentPcbDiagnosticLaunchExclusion(this.#lease);this.#lease=null; }this.#released=true;return; }
   await this.#journal.settle();if(!this.#factoryInvoked) { await this.#finishRelease("cleanup-no-allocation",{noAllocationProved:true});return; }
   need(this.#birth!==null&&this.#factorySettled,"ORIGINAL_FACTORY_SETTLED");const outcome=(completeProviders.has(this)?currentFootprintForwardWriterCompleteBirthOutcome:currentFootprintForwardWriterBirthOutcome)(this.#birth);
   if(outcome.state==="no-resource") { await this.#finishRelease("cleanup-no-allocation",{noAllocationProved:true});return; }
   if(outcome.owner===null) { (completeProviders.has(this)?requireCurrentFootprintForwardWriterCompleteUnownedHelperClosed:requireCurrentFootprintForwardWriterUnownedHelperClosed)(this.#birth);await this.#finishRelease("cleanup-unowned-helper",{helperClosed:true,originalFactorySettled:true,eofAttempted:true,nativeOwnerNeverReturned:true,normalHelperExit:true,applicationLaunchNeverInvoked:true});return; }
   need(outcome.owner===this.#owner,"ORIGINAL_FACTORY_OWNER");this.#releasePending??=outcome.owner.releaseUnlaunched();await this.#releasePending;
   await this.#finishRelease("cleanup-unlaunched-owner",{helperClosed:true,launchNeverInvoked:true,originalUnlaunchedReleaseAcknowledged:true});
  } finally { this.#cleanupBusy=false; }
 }
 public async cleanupNoProcess():Promise<void> {
  this.#current(true);need(this.#launchInvoked&&!this.#abortDispatched&&!this.#busy&&!this.#cleanupBusy,"NO_PROCESS_ONLY");this.#cleanupBusy=true;
  try { await this.#journal.settle();if(this.#releasePending===null) { need(this.#requiredOwner().status().noProcessCleanupAvailable,"NATIVE_NO_PROCESS_PROOF");if(!this.#journal.retained().records.some(entry=>entry.kind==="no-process-release-intent")){await this.#journal.append("no-process-release-intent",{});}this.#releasePending=this.#requiredOwner().releaseNoProcess(); }
   await this.#releasePending;await this.#finishRelease("cleanup-no-process",{helperReleased:true,noProcessProved:true});
  } finally { this.#cleanupBusy=false; }
 }
 /** End the original complete owner's pending observers after its actual
  * root/Job exit, while retaining its helper for all original Promise joins. */
 public endCompleteWorkflowObserversAfterTermination():Promise<void> {
  this.#current(true);need(completeProviders.has(this)&&this.#terminated,"ORIGINAL_COMPLETE_EXIT");
  return this.#requiredOwner().endFootprintForwardWriterWorkflowObserversAfterTermination();
 }
 public async release():Promise<void> {
  this.#current(true);need(this.#terminated&&!this.#cleanupBusy,"ORIGINAL_EXIT_REQUIRED");this.#cleanupBusy=true;
  try { await this.#journal.settle();if(!this.#journal.retained().records.some(entry=>entry.kind==="release-intent")) { await this.#journal.append("release-intent",{}); }
   if(completeProviders.has(this)){await this.endCompleteWorkflowObserversAfterTermination();}
   if(this.#normalClosePending!==null) { await Promise.allSettled([this.#normalClosePending]); }
   if(this.#openingPending!==null) { await this.#openingPending; }
   if(this.#opening!==null) {
    this.#openingCurrent?.();
    if(this.#openingInvoked){this.#openingRelease??=this.#opening.releaseAfterTermination();await this.#openingRelease;}
    else {
          const opening = this.#opening.status(), transport = opening.transport;
          need(this.#openingOutcome === null && !opening.consumed && !opening.settled && !opening.openingAttempted &&
            !opening.openingDispatchSettled && !opening.openingResultRetained && !opening.constructionRetained && !opening.completed &&
            opening.diagnostics.stage === "idle" && opening.diagnostics.step === "idle" && opening.diagnostics.failure === null &&
            !transport.started && !transport.settled && !transport.failed && transport.requests === 0 &&
            !transport.initialPauseSeen && !transport.initialResumeAttempted && !transport.initialResumeSeen &&
            !transport.unresolvedInstrumentation && transport.attachedWorkers === 0 && !transport.existingWorkersBound &&
            transport.existingWorkersObserved === 0 && transport.existingWorkersAttached === 0 &&
            transport.parentConstruction === null && transport.parentPeer === null && transport.constructionAssignments === null &&
            transport.bootstrapStages.every(stage => !stage.parsed && !stage.pauseSeen && !stage.resumeAttempted && !stage.resumeSeen),
          "ORIGINAL_UNSTARTED_OPENING_REQUIRED");
    }
   }
   if(this.#clockPending!==null) { await Promise.allSettled([this.#clockPending]);this.#current(true); }
   this.#releasePending??=this.#requiredOwner().releaseClosed();
   try { await this.#releasePending; } catch(caughtError) { this.#releaseFirstFailure=caughtError;throw caughtError; }
   if(this.#read!==null) { await Promise.allSettled([this.#read]); }
   await this.#finishRelease("release-result",{released:true});
  } finally { this.#cleanupBusy=false; }
 }
 /** Only the genuine complete owner may qualify its retained FIRST native
  * release failure. No wrapper/JSON error can reopen a consumed release. */
 public consumeReleasePreflightFailure(cause:unknown):CurrentFootprintForwardWriterReleasePreflightProof|null {
  this.#current(true);
  if(!completeProviders.has(this)||this.#cleanupBusy||this.#released||this.#releasePending===null||cause!==this.#releaseFirstFailure||this.#releasePreflightProof!==null||this.#releaseRetryAttempted){return null;}
  const proof=this.#requiredOwner().consumeFootprintForwardWriterReleasePreflightFailure(cause);
  this.#releasePreflightProof=proof;return proof;
 }
 public async retryReleaseAfterPreflight(proof:CurrentFootprintForwardWriterReleasePreflightProof):Promise<void> {
  this.#current(true);need(completeProviders.has(this)&&this.#terminated&&!this.#cleanupBusy&&!this.#released&&!this.#releaseRetryAttempted&&proof===this.#releasePreflightProof,"ORIGINAL_RELEASE_PREFLIGHT");
  this.#releaseRetryAttempted=true;this.#cleanupBusy=true;
  try {
   // All opening/clock/observer joins already settled before the first native
   // The failed Promise stays retained; retry only the proven native edge.
   await this.#requiredOwner().retryFootprintForwardWriterReleaseAfterPreflight(proof);
   if(this.#read!==null){await Promise.allSettled([this.#read]);}
   await this.#finishRelease("release-result",{released:true});
  } finally {this.#cleanupBusy=false;}
 }
 /** Original error identity stays private to this instance; no journal can recreate it. */
 public retainedFailure():unknown { this.#current(true);return this.#failure; }
 public status():Readonly<Record<string,unknown>> {
  this.#current(true);return Object.freeze({stage:this.#stage,failed:this.#failed,busy:this.#busy,cleanupBusy:this.#cleanupBusy,factoryInvoked:this.#factoryInvoked,factorySettled:this.#factorySettled,launchInvoked:this.#launchInvoked,
   openingPending:this.#openingPending!==null&&this.#openingOutcome===null,openingSettled:this.#openingOutcome!==null,originalReadPending:this.#read!==null&&this.#held===null,producerOrdinal:this.#producerOrdinal,
   producer:this.#owner?.footprintForwardWriterProducerProgress()??null,createProcessError:this.#owner?.status().createProcessError??null,abortDispatched:this.#abortDispatched,abortAcknowledged:this.#abortAcknowledged,terminated:this.#terminated,released:this.#released,
   publicationPending:this.#journal.retained().publicationPending,sourceSealed:this.#stage==="sealed",executionAuthorized:false,saveAuthorized:false});
 }
}

const providerPrototype=captureCurrentFootprintForwardExecutionPrototypes(CurrentFootprintForwardWriterOpeningProvider.prototype);

/** Construct a fresh complete-birth variant before its first reservation or
 * I/O. The private registry cannot upgrade an existing provider or native owner.
 * Its published v1 source-only facts remain unchanged and grant no execution. */
export function createCurrentFootprintForwardWriterCompleteOpeningProvider(input:unknown,options:CurrentPcbDiagnosticLifecycleOptions):CurrentFootprintForwardWriterOpeningProvider {
 const provider=new CurrentFootprintForwardWriterOpeningProvider(input,options);completeProviders.add(provider);return provider;
}
/** Only the original fresh complete variant can compose the full coordinator.
 * Actual source publication and native ownership retain their separate guards. */
export function requireOriginalCurrentFootprintForwardWriterCompleteOpeningProvider(provider:CurrentFootprintForwardWriterOpeningProvider):void {
 need(provider!==null&&typeof provider==="object"&&!types.isProxy(provider)&&originals.has(provider)&&completeProviders.has(provider)&&Object.getPrototypeOf(provider)===CurrentFootprintForwardWriterOpeningProvider.prototype&&Reflect.ownKeys(provider).length===0,"ORIGINAL_COMPLETE_PROVIDER");
 requireCurrentFootprintForwardExecutionPrototypes(providerPrototype);
}


// oxlint-disable typescript/unbound-method -- Captured module-original methods are called only with the genuine private-field provider receiver.
const publishedSourceInput=CurrentFootprintForwardWriterOpeningProvider.prototype.requireSourceInput;
const completeWorkflowRequest=CurrentFootprintForwardWriterOpeningProvider.prototype.originalCompleteWorkflowRequest;
const completeOpeningPublication=CurrentFootprintForwardWriterOpeningProvider.prototype.requireCompleteWorkflowOpeningPublication;
const reserveClock=CurrentFootprintForwardWriterOpeningProvider.prototype.reserveClockPreparation;
const finishClock=CurrentFootprintForwardWriterOpeningProvider.prototype.finishClockPreparation;
// oxlint-enable typescript/unbound-method
export function requireCurrentFootprintForwardWriterOpeningInput(provider:CurrentFootprintForwardWriterOpeningProvider):ReturnType<CurrentFootprintForwardWriterOpeningProvider["requireSourceInput"]> {
 need(provider!==null&&typeof provider==="object"&&!types.isProxy(provider),"ORIGINAL_PROVIDER");return publishedSourceInput.call(provider);
}
export function reserveOriginalCurrentFootprintForwardWriterClockPreparation(provider:CurrentFootprintForwardWriterOpeningProvider,operation:CurrentFootprintForwardWriterClockPreparationOperation):CurrentFootprintForwardWriterClockPreparationReservation { return reserveClock.call(provider,operation); }
export function finishOriginalCurrentFootprintForwardWriterClockPreparation(provider:CurrentFootprintForwardWriterOpeningProvider,reservation:CurrentFootprintForwardWriterClockPreparationReservation,outcome:CurrentFootprintForwardWriterClockPreparationOutcome):void { finishClock.call(provider,reservation,outcome); }

export function requireOriginalCurrentFootprintForwardWriterCompleteOpeningRequest(provider:CurrentFootprintForwardWriterOpeningProvider):Request {
 requireOriginalCurrentFootprintForwardWriterCompleteOpeningProvider(provider);return completeWorkflowRequest.call(provider);
}


export function requireOriginalCurrentFootprintForwardWriterCompleteOpeningPublication(provider:CurrentFootprintForwardWriterOpeningProvider,operationId:string):Promise<boolean>{
 requireOriginalCurrentFootprintForwardWriterCompleteOpeningProvider(provider);return completeOpeningPublication.call(provider,operationId);
}
