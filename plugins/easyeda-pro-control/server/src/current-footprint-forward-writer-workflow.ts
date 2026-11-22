/* oxlint-disable unicorn/no-useless-undefined -- The original retained cleanup Promise preserves its exact undefined settlement. */
/** Fixed complete workflow. Inputs carry confirmations, never native callback
 * tables, replacement owners, clocks, UUIDs or saved-state candidates. */
/* oxlint-disable import/max-dependencies -- Keep every original source, intent, native, SQL and saved-generation authority explicit at this one complete lifecycle boundary. */
import { AsyncLocalStorage } from "node:async_hooks";
import { types } from "node:util";
import { originalNativeOrSourceErrorCode } from "./original-native-error-code.ts";
import { sha256Json } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CurrentFootprintForwardWriterOpeningProvider, requireCurrentFootprintForwardWriterOpeningInput, requireOriginalCurrentFootprintForwardWriterCompleteOpeningProvider, requireOriginalCurrentFootprintForwardWriterCompleteOpeningPublication, requireOriginalCurrentFootprintForwardWriterCompleteOpeningRequest } from "./current-footprint-forward-writer-opening.ts";
import { CurrentFootprintForwardWriterWorkflowV2Journal, scanCurrentFootprintForwardWriterCurrentWorkflowSummaries } from "./current-footprint-forward-writer-workflow-v2-journal.ts";
import { currentFootprintForwardWriterWorkflowRequestSchema } from "./current-footprint-forward-writer-workflow-contract.ts";
import type { CURRENT_FOOTPRINT_FORWARD_WRITER_WORKFLOW_STAGES, CurrentFootprintForwardWriterWorkflowRequest } from "./current-footprint-forward-writer-workflow-contract.ts";
import { CurrentFootprintForwardWriterClockPreparationOwner, requireOriginalCurrentFootprintForwardWriterClockPreparation } from "./current-footprint-forward-writer-clock-preparation.ts";
import type { CurrentFootprintForwardWriterMainCapability } from "./current-footprint-forward-writer-main-capability.ts";
import type { CurrentFootprintForwardWriterMainRequestOrigin } from "./current-footprint-forward-writer-main-origin.ts";
import type { CurrentFootprintForwardWriterClockRpcOrigin } from "./current-footprint-forward-writer-clock-origin.ts";
import type { CurrentFootprintForwardWriterCreateIntent } from "./current-footprint-forward-writer-create-intent.ts";
import { issueCurrentFootprintForwardWriterMainCapability } from "./current-footprint-forward-writer-main-capability.ts";
import { CurrentFootprintCopyMainBackendRunner, captureOriginalCurrentFootprintForwardMainCursor, requireCurrentFootprintForwardMainCursor } from "./current-footprint-copy-main-backend-runner.ts";
import { selectCurrentPcb209StartPage, selectCurrentPcb209StartPageFrame } from "./current-pcb-209-start-page-selection.ts";
import { CurrentFootprintForwardWriterPrecreateHeadOwner, requireOriginalCurrentFootprintForwardWriterPrecreateHead } from "./current-footprint-forward-writer-precreate-head.ts";
import type { CurrentFootprintForwardHeadAgeObservation } from "./current-footprint-forward-head-age.ts";
import { reserveCurrentFootprintForwardWriterMainRequestPlan } from "./current-footprint-forward-writer-main-request-plan.ts";
import { reserveCurrentFootprintForwardWriterCopyLocal } from "./current-footprint-forward-writer-copy-local-reservation.ts";
import { CurrentFootprintForwardWriterPairedScheduler, requireOriginalCurrentFootprintForwardWriterCreateJoin } from "./current-footprint-forward-writer-paired-scheduler.ts";
import type { CurrentFootprintForwardWriterPairedObservation } from "./current-footprint-forward-writer-paired-scheduler.ts";
import { CurrentFootprintForwardWriterCreateIntentOwner } from "./current-footprint-forward-writer-create-intent.ts";
import { CurrentFootprintForwardWriterNativeOwner, assertOriginalCurrentFootprintForwardWriterCompleteNativeOwner, originalCurrentFootprintForwardWriterNativeTermination, requireCurrentFootprintForwardWriterReleasePreflightFacts } from "./current-pcb-diagnostic-owner.ts";
import { captureCurrentFootprintForwardWriterClosedSnapshot } from "./current-footprint-copy-closed-snapshot.ts";
import { completedCurrentFootprintCopyV2SqlSource, prepareCurrentFootprintCopyV2SqlPlan, verifyCurrentFootprintCopyV2SqlEffect } from "./current-footprint-copy-v2-sql.ts";
import { decodeCurrentFootprintCopyV2NativeResult } from "./current-footprint-copy-v2-native-result.ts";
import { prepareCurrentFootprintCopyV2SavedProjection } from "./current-footprint-copy-v2-saved-source.ts";
import { abortCurrentFootprintForwardWriterHeldSavedJob, createCurrentFootprintForwardWriterHeldSavedExecutionNative, observeCurrentFootprintForwardWriterHeldSavedSource, requireCurrentFootprintForwardWriterHeldSavedReleasePreflightFailure, requireOriginalCurrentFootprintForwardWriterSavedCheckpoint, retryCurrentFootprintForwardWriterHeldSavedReleaseAfterPreflight, sealCurrentFootprintForwardWriterSavedCheckpoint, verifyCurrentFootprintForwardWriterSavedCheckpoint } from "./current-footprint-forward-writer-held-saved-generation.ts";
import type { CurrentFootprintForwardWriterSavedCheckpoint } from "./current-footprint-forward-writer-held-saved-generation.ts";
import type { CurrentFootprintCopySavedExecutionNative } from "./current-footprint-copy-execution-runtime.ts";
import type {CurrentFootprintCopyPendingCreate} from "./current-pcb-worker-startup-channel.ts";
import type { CurrentFootprintCopyWindowsClockWindow } from "./current-footprint-copy-windows-clock.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { Inventory } from "./closed-sql-equality.ts";
import { captureCurrentFootprintForwardExecutionPrototypes, captureCurrentFootprintForwardExecutionReceiver, requireCurrentFootprintForwardExecutionPrototypes } from "./current-footprint-forward-execution-opening-identity.ts";

import { CURRENT_FOOTPRINT_FORWARD_WRITER_WORKFLOW_V2_BUDGET as BUDGET, currentFootprintForwardWriterReleasePreflightFactsSchema } from "./current-footprint-forward-writer-workflow-v2-contract.ts";
import type { CurrentFootprintForwardWriterReleasePreflightFacts } from "./current-footprint-forward-writer-workflow-v2-contract.ts";
import type { CurrentFootprintForwardWriterReleasePreflightProof } from "./current-pcb-diagnostic-owner.ts";

type Stage = typeof CURRENT_FOOTPRINT_FORWARD_WRITER_WORKFLOW_STAGES[number];
type Generation = "writer" | "saved";
type CleanupAction = "close" | "abort" | "termination" | "observers" | "release" | "unlaunched" | "no-process" | "no-allocation" | "unowned-helper";
type Outcome = "dispatched" | "pending" | "terminated" | "released" | "no-resource" | "failed";
type Input = Awaited<ReturnType<typeof requireCurrentFootprintForwardWriterOpeningInput>>;
type CreateContext=Readonly<{owner:CurrentFootprintForwardWriterNativeOwner;capability:CurrentFootprintForwardWriterMainCapability;mainOrigin:CurrentFootprintForwardWriterMainRequestOrigin;clockOrigin:CurrentFootprintForwardWriterClockRpcOrigin;intent:CurrentFootprintForwardWriterCreateIntent}>;
const admission = new AsyncLocalStorage<CurrentFootprintForwardWriterWorkflow>();
const originals = new WeakSet<object>();
const consumedProviders = new WeakSet<object>();
const results = new WeakMap<CurrentFootprintForwardWriterWorkflowResult, CurrentFootprintForwardWriterWorkflow>();
const providerPrototype = captureCurrentFootprintForwardExecutionPrototypes(CurrentFootprintForwardWriterOpeningProvider.prototype);
const mainPrototype = captureCurrentFootprintForwardExecutionPrototypes(CurrentFootprintCopyMainBackendRunner.prototype);
const nativePrototype = captureCurrentFootprintForwardExecutionPrototypes(CurrentFootprintForwardWriterNativeOwner.prototype);
const pairedPrototype = captureCurrentFootprintForwardExecutionPrototypes(CurrentFootprintForwardWriterPairedScheduler.prototype);
const journalPrototype = captureCurrentFootprintForwardExecutionPrototypes(CurrentFootprintForwardWriterWorkflowV2Journal.prototype);
const metadataPrototype=captureCurrentFootprintForwardExecutionPrototypes(CurrentFootprintForwardWriterClockPreparationOwner.prototype);
const headPrototype=captureCurrentFootprintForwardExecutionPrototypes(CurrentFootprintForwardWriterPrecreateHeadOwner.prototype);
const intentPrototype=captureCurrentFootprintForwardExecutionPrototypes(CurrentFootprintForwardWriterCreateIntentOwner.prototype);
const providerMethods = ["launch","observeMain","observeBrowser","inspectFrames","inspectUi","startOpening","nextHeldProducer","startupCacheJobs","continueStartup","settleStartup","captureSource","status","closeCompleteWorkflow","completeWorkflowNoProcessCleanupAvailable","endCompleteWorkflowObserversAfterTermination","abort","observeTermination","release","consumeReleasePreflightFailure","retryReleaseAfterPreflight","cleanupBeforeLaunch","cleanupNoProcess","settleRecords"] as const;
const nativeMethods = ["prepareFootprintForwardWriterOwnData","readFootprintForwardWriterBranchApi","prepareFootprintForwardWriterCopyTailObservation","prepareFootprintForwardWriterTicketTimer","beginFootprintForwardWriterProducerInterval","observeFootprintCopyWindowsClock","prepareFootprintForwardWriterPublication","reproveFootprintForwardWriterTicketTimerBeforeCreate","bindFootprintForwardWriterProducerInterval","issueFootprintForwardWriterClockObserver","consumeFootprintForwardWriterProducerInterval","prepareFootprintForwardWriterCopyLocal","observeFootprintForwardWriterHeldProducer","continueFootprintForwardWriterCopyLocal","prepareFootprintForwardWriterCopyUpload","continueFootprintForwardWriterCopyUpload","prepareFootprintForwardWriterCopyDrain","continueFootprintForwardWriterCopyDrain","settleFootprintForwardWriterCopyDrain","footprintForwardWriterCopyDrainProgress","footprintForwardWriterCopyLocalProgress","footprintForwardWriterCopyUploadProgress","closedFootprintCopyWindowsClockWindow","boundFootprintCopyDocumentClockValues"] as const;
function need(value:boolean,code:string):asserts value { if(!value){throw new Error(`FORWARD_WRITER_WORKFLOW_${code}`);} }
function record(value:unknown):value is Readonly<Record<string,unknown>> { return value!==null&&typeof value==="object"&&!Array.isArray(value); }
export interface CurrentFootprintForwardWriterWorkflowResult {
 readonly profile:"private.current-footprint-forward-writer-workflow-result.v2";
 readonly operationId:string; readonly createdUuid:string; readonly writerSqlSha256:string; readonly savedSqlSha256:string; readonly sourceReadSha256:string;
 readonly originalClosedReadersDistinct:true; readonly originalOwnersReleased:true; readonly explicitSaveAttempts:0;
 readonly savedResultVerified:true; readonly inverseAvailable:false; readonly executionAuthorized:false;
}
/** A matching operation name or caller Promise cannot exempt a journal. */
export function isOriginalCurrentFootprintForwardWriterWorkflowAdmission(operationId:string):boolean {
 // oxlint-disable-next-line eslint/no-use-before-define -- Captured after class evaluation, before a caller may enter the original workflow scope.
 const owner=admission.getStore();return owner!==undefined&&originals.has(owner)&&originalAdmission.call(owner,operationId);
}
export async function assertNoUnresolvedCurrentFootprintForwardWriterWorkflowIsolation():Promise<void> {
 const summaries=await scanCurrentFootprintForwardWriterCurrentWorkflowSummaries();
 need(summaries.every(row=>row.settled||isOriginalCurrentFootprintForwardWriterWorkflowAdmission(row.operationId)),"UNRESOLVED_OTHER_WORKFLOW");
}
export class CurrentFootprintForwardWriterWorkflow {
 readonly #provider:CurrentFootprintForwardWriterOpeningProvider; readonly #request:CurrentFootprintForwardWriterWorkflowRequest;
 readonly #openingRequest:ReturnType<typeof requireOriginalCurrentFootprintForwardWriterCompleteOpeningRequest>;
 readonly #journal:CurrentFootprintForwardWriterWorkflowV2Journal; readonly #journalCurrent:()=>void;readonly #providerCurrent:()=>void;
 readonly #pending=new Set<Promise<unknown>>();readonly #cleanupAttempts=new Set<string>();
 readonly #cleanupIntents=new Map<string,Readonly<Record<string,unknown>>>();readonly #cleanupDispatchStarted=new Set<string>();
 readonly #releaseRecoveries=new Map<Generation,Readonly<{proof:CurrentFootprintForwardWriterReleasePreflightProof;facts:CurrentFootprintForwardWriterReleasePreflightFacts;cause:unknown}>>();
 readonly #cleanupResults=new Map<string,Readonly<{value:unknown;evidence:Readonly<Record<string,unknown>>}>>();
 readonly #cleanupFacts=new Map<string,Readonly<{generation:Generation;action:CleanupAction;attempt:number;outcome:Outcome}>>();
 #journalTail:Promise<unknown>=Promise.resolve();
 #runPending:Promise<CurrentFootprintForwardWriterWorkflowResult>|null=null;#cleanupPending:Promise<void>|null=null;#stagePending:Promise<unknown>|null=null;#lifecyclePending:Promise<unknown>|null=null;
 #cleanupInProgress=false;
 #stage:Stage="opening";#stopped=false;#failed=false;#failure:unknown;#terminal=false;
 #writerReleased=false;#savedReleased=false;#writerTerminated=false;#savedTerminated=false;
 #metadataCurrent:(()=>void)|null=null;#headCurrent:(()=>void)|null=null;#intentCurrent:(()=>void)|null=null;
 #input:Input|null=null;#nativeCurrent:(()=>void)|null=null;#mainCurrent:(()=>void)|null=null;
 #metadata:CurrentFootprintForwardWriterClockPreparationOwner|null=null;#head:CurrentFootprintForwardWriterPrecreateHeadOwner|null=null;
 #intent:CurrentFootprintForwardWriterCreateIntentOwner|null=null;#paired:CurrentFootprintForwardWriterPairedScheduler|null=null;
 #pairedCurrent:(()=>void)|null=null;#pairedPacket:CurrentFootprintForwardWriterPairedObservation|null=null;
 #age:CurrentFootprintForwardHeadAgeObservation|null=null;#clockWindow:CurrentFootprintCopyWindowsClockWindow|null=null;
 #saved:CurrentFootprintCopySavedExecutionNative|null=null;#savedStartPending:Promise<void>|null=null;#savedTermination:object|null=null;#writerTermination:object|null=null;
 #after:Inventory|null=null;#savedAfter:Inventory|null=null;#checkpoint:CurrentFootprintForwardWriterSavedCheckpoint|null=null;
 #result:CurrentFootprintForwardWriterWorkflowResult|null=null;#createContext:CreateContext|null=null;
 public constructor(provider:CurrentFootprintForwardWriterOpeningProvider,input:unknown) {
  requireOriginalCurrentFootprintForwardWriterCompleteOpeningProvider(provider);need(!consumedProviders.has(provider),"ORIGINAL_PROVIDER_CONSUMED");
  const request=currentFootprintForwardWriterWorkflowRequestSchema.parse(captureCurrentPcbStringClockReply(input).value);
  const opening=requireOriginalCurrentFootprintForwardWriterCompleteOpeningRequest(provider);need(request.parentOperationId===opening.operationId,"ORIGINAL_PARENT");
  this.#provider=provider;this.#openingRequest=opening;this.#request=Object.freeze({...request});this.#journal=new CurrentFootprintForwardWriterWorkflowV2Journal(this.#request);
  this.#journalCurrent=captureCurrentFootprintForwardExecutionReceiver(this.#journal,journalPrototype,["reserve","append","settle","assertCurrent","retained","reservationOutcome","waitForCurrentPublication"]);
  this.#providerCurrent=captureCurrentFootprintForwardExecutionReceiver(provider,providerPrototype,providerMethods);
  consumedProviders.add(provider);originals.add(this);Object.freeze(this);
 }
 /** The engine's fresh generic scan may omit only this current pre-birth
  * workflow and its exact original provider journal. Every filesystem await
  * rechecks both original publishers; unreadable/orphan-risk rows never enter. */
 public async ownsDiagnosticOperation(operationId:string):Promise<boolean>{
  if(admission.getStore()!==this||this.#stage!=="opening"||this.#stopped||this.#failed||this.#terminal||!this.#journal.retained().reserved){return false;}
  this.#current();await this.#journalAction(()=>this.#journal.assertCurrent());this.#current();
  if(operationId===this.#request.operationId){return true;}
  if(operationId!==this.#request.parentOperationId){return false;}
  const owned=await requireOriginalCurrentFootprintForwardWriterCompleteOpeningPublication(this.#provider,operationId);this.#current();return owned;
 }
 public originalAdmission(operationId:string):boolean {
  // oxlint-disable-next-line eslint/no-use-before-define -- Captured after class evaluation; this method is never invoked during module initialization.
  requireCurrentFootprintForwardExecutionPrototypes(workflowPrototype);this.#providerCurrent();this.#journalCurrent();
  return originals.has(this)&&operationId===this.#request.operationId&&!this.#terminal&&this.#journal.retained().reserved&&requireOriginalCurrentFootprintForwardWriterCompleteOpeningRequest(this.#provider)===this.#openingRequest;
 }
 #current(cleanup=false):void {
  need(originals.has(this)&&!types.isProxy(this)&&Object.getPrototypeOf(this)===CurrentFootprintForwardWriterWorkflow.prototype&&Reflect.ownKeys(this).length===0,"ORIGINAL_WORKFLOW");
  // oxlint-disable-next-line eslint/no-use-before-define -- Captured after class evaluation; this method is never invoked during module initialization.
  requireCurrentFootprintForwardExecutionPrototypes(workflowPrototype);this.#providerCurrent();this.#journalCurrent();requireOriginalCurrentFootprintForwardWriterCompleteOpeningProvider(this.#provider);
  need(requireOriginalCurrentFootprintForwardWriterCompleteOpeningRequest(this.#provider)===this.#openingRequest,"ORIGINAL_PARENT");
  if(!cleanup){need(!this.#stopped&&!this.#failed&&!this.#terminal,"NORMAL_ENDED");}this.#nativeCurrent?.();this.#mainCurrent?.();this.#pairedCurrent?.();this.#metadataCurrent?.();this.#headCurrent?.();this.#intentCurrent?.();
 }
 /** Exact current original journal reservation, never a data-only budget
  * flag. Only this fixed run enters its private async scope and binds the five
  * original references immediately before its sole dispatch. */
 public requireCreateAdmission(owner:CurrentFootprintForwardWriterNativeOwner,capability:CurrentFootprintForwardWriterMainCapability,mainOrigin:CurrentFootprintForwardWriterMainRequestOrigin,clockOrigin:CurrentFootprintForwardWriterClockRpcOrigin,intent:CurrentFootprintForwardWriterCreateIntent):void {
  this.#current();const context=this.#createContext;const retained=this.#journal.retained();const last=retained.records.at(-1);
  need(admission.getStore()===this&&context!==null&&context.owner===owner&&context.capability===capability&&context.mainOrigin===mainOrigin&&context.clockOrigin===clockOrigin&&context.intent===intent&&
   this.#stage==="create"&&this.#input!==null&&this.#input.owner===owner&&this.#input.result.operationId===this.#request.parentOperationId&&retained.reserved&&!retained.publicationPending&&
   this.#journal.reservationOutcome()==="reserved"&&retained.records.length===10&&last?.kind==="stage-intent"&&last.evidence["stage"]==="create",
  "ORIGINAL_CREATE_WORKFLOW_RESERVATION");
  assertOriginalCurrentFootprintForwardWriterCompleteNativeOwner(owner);
 }
 /** Queue-safe: publication filesystem work only, bracketed by synchronous
  * original refs. No application, inspector, clock or native channel enqueue. */
 public async reproveCreateAdmission(owner:CurrentFootprintForwardWriterNativeOwner,capability:CurrentFootprintForwardWriterMainCapability,mainOrigin:CurrentFootprintForwardWriterMainRequestOrigin,clockOrigin:CurrentFootprintForwardWriterClockRpcOrigin,intent:CurrentFootprintForwardWriterCreateIntent):Promise<void> {
  this.requireCreateAdmission(owner,capability,mainOrigin,clockOrigin,intent);
  await this.#journalAction(()=>this.#journal.assertCurrent());this.requireCreateAdmission(owner,capability,mainOrigin,clockOrigin,intent);
 }
 /** This later stage proves only the original completed tail and join.
  * Prewrite source/user/timer baselines must never run after the mutation. */
 public requireCreateJoin(owner:CurrentFootprintForwardWriterNativeOwner,capability:CurrentFootprintForwardWriterMainCapability,mainOrigin:CurrentFootprintForwardWriterMainRequestOrigin,clockOrigin:CurrentFootprintForwardWriterClockRpcOrigin,intent:CurrentFootprintForwardWriterCreateIntent,pending:CurrentFootprintCopyPendingCreate):void{
  this.#current();const context=this.#createContext;const retained=this.#journal.retained();const last=retained.records.at(-1);
  need(admission.getStore()===this&&this.#stage==="create-result"&&context!==null&&context.owner===owner&&context.capability===capability&&context.mainOrigin===mainOrigin&&context.clockOrigin===clockOrigin&&context.intent===intent&&
   this.#input?.owner===owner&&this.#paired!==null&&this.#pairedPacket===null&&retained.reserved&&!retained.publicationPending&&this.#journal.reservationOutcome()==="reserved"&&
   retained.records.length===24&&last?.kind==="stage-intent"&&last.evidence["stage"]==="create-result","ORIGINAL_CREATE_RESULT_WORKFLOW");
  const joined=requireOriginalCurrentFootprintForwardWriterCreateJoin(pending,owner,clockOrigin);
  need(joined.issuer===this.#paired&&joined.capability===capability&&joined.mainOrigin===mainOrigin&&joined.backend===this.#input.source.main,"ORIGINAL_CREATE_RESULT_PAIRED");
 }
 public async reproveCreateJoin(owner:CurrentFootprintForwardWriterNativeOwner,capability:CurrentFootprintForwardWriterMainCapability,mainOrigin:CurrentFootprintForwardWriterMainRequestOrigin,clockOrigin:CurrentFootprintForwardWriterClockRpcOrigin,intent:CurrentFootprintForwardWriterCreateIntent,pending:CurrentFootprintCopyPendingCreate):Promise<void>{
  this.requireCreateJoin(owner,capability,mainOrigin,clockOrigin,intent,pending);await this.#journalAction(()=>this.#journal.assertCurrent());this.requireCreateJoin(owner,capability,mainOrigin,clockOrigin,intent,pending);
 }
 #retain<T>(pending:Promise<T>):Promise<T> { this.#pending.add(pending);return pending; }
 #journalAction<T>(action:()=>Promise<T>):Promise<T> {
  const previous=this.#journalTail;const pending=(async():Promise<T>=>{await Promise.allSettled([previous]);return action();})();
  this.#journalTail=pending;return pending;
 }
 #append(kind:Parameters<CurrentFootprintForwardWriterWorkflowV2Journal["append"]>[0],evidence:Readonly<Record<string,unknown>>):Promise<void> {
  return this.#journalAction(()=>this.#journal.append(kind,evidence));
 }
 #settle():Promise<void> { return this.#journalAction(()=>{
  const outcome=this.#journal.reservationOutcome();return outcome==="not-entered"||outcome==="conflict"?Promise.resolve():this.#journal.settle();
 }); }

 async #stageCall<T>(stage:Stage,action:()=>Promise<T>,facts:(value:T)=>unknown):Promise<T> {
  this.#current();this.#stage=stage;await this.#append("stage-intent",{stage});this.#current();
  const pending=this.#retain(action());this.#stagePending=pending;
  try{const value=await pending;this.#current();await this.#append("stage-result",{stage,evidenceSha256:sha256Json(facts(value)),originalCompletionObserved:true});this.#current();return value;}
  finally{if(this.#stagePending===pending){this.#stagePending=null;}}
 }
 #remember(error:unknown):void { if(!this.#failed){this.#failed=true;this.#failure=error;} }
 /** Repetition returns the same original Promise, never another Create. */
 public run():Promise<CurrentFootprintForwardWriterWorkflowResult> {
  if(this.#runPending!==null){return this.#runPending;}this.#current();
  const completion=Promise.withResolvers<CurrentFootprintForwardWriterWorkflowResult>();this.#runPending=completion.promise;
  void admission.run(this,async():Promise<void>=>{try{await this.#journalAction(()=>this.#journal.reserve());this.#current();completion.resolve(await this.#run());}
   catch(error){this.#remember(error);try{await this.#journal.waitForCurrentPublication();await this.#settle();
    if(!this.#terminal&&this.#journal.retained().reserved&&!this.#journal.retained().records.some(row=>row.kind==="failure")){await this.#append("failure",{stage:this.#stage,originalErrorRetained:true});}await this.cleanup();}
    catch(cleanupError){completion.reject(new AggregateError([error,cleanupError],"FORWARD_WRITER_WORKFLOW_CLEANUP",{cause:error}));return;}completion.reject(error);}});
  return completion.promise;
 }
 async #opening():Promise<Input> {
  await this.#provider.launch();await this.#provider.observeMain();const selected=selectCurrentPcb209StartPage(await this.#provider.observeBrowser());
  const frame=selectCurrentPcb209StartPageFrame(await this.#provider.inspectFrames(selected.targetId),selected);await this.#provider.inspectUi(frame.frameId);await this.#provider.startOpening();
  // Three original holds per admitted cache job. One startup sync has nine
  // Holds, including four original natural history responses.
  const cacheHolds=3*this.#provider.startupCacheJobs();
  for(let index=0;index<cacheHolds;index+=1){const next=await this.#provider.nextHeldProducer();need(["headEntry","headPromise","headSuccess"].includes(next.role),"ORIGINAL_STARTUP_CACHE_ROLE");await this.#provider.continueStartup("cache");}
  await this.#provider.settleStartup("cache");
  for(let index=0;index<9;index+=1){const next=await this.#provider.nextHeldProducer();need(["syncEntry","syncFull","syncHistory","syncMerged","syncFinalizing","syncReturned"].includes(next.role),"ORIGINAL_STARTUP_SYNC_ROLE");await this.#provider.continueStartup("sync");}
  await this.#provider.settleStartup("sync");await this.#provider.captureSource();
  const input=await requireCurrentFootprintForwardWriterOpeningInput(this.#provider);assertOriginalCurrentFootprintForwardWriterCompleteNativeOwner(input.owner);this.#input=input;
  this.#nativeCurrent=captureCurrentFootprintForwardExecutionReceiver(input.owner,nativePrototype,nativeMethods);need(input.source.main!==null,"ORIGINAL_MAIN");
  this.#mainCurrent=captureCurrentFootprintForwardExecutionReceiver(input.source.main,mainPrototype,["issueForwardWriterBranchOrigin","armFootprintForwardWriterBranchRead","issueForwardWriterRequestOrigin","issueForwardWriterPostBranchOrigin","issueForwardWriterLiveHistoryOrigin"]);return input;
 }
 async #run():Promise<CurrentFootprintForwardWriterWorkflowResult> {
  const input=await this.#stageCall("opening",()=>this.#opening(),value=>value.result);const owner=input.owner;const source=input.source;const copy=source.owned.copyPlan;const main=source.main;
  need(main!==null,"ORIGINAL_MAIN");const capability=await issueCurrentFootprintForwardWriterMainCapability(this.#provider);
  const preparation=await this.#stageCall("metadata",()=>{this.#metadata=new CurrentFootprintForwardWriterClockPreparationOwner(this.#provider);this.#metadataCurrent=captureCurrentFootprintForwardExecutionReceiver(this.#metadata,metadataPrototype,["prepare"]);return this.#metadata.prepare();},value=>value);
  const metadata=requireOriginalCurrentFootprintForwardWriterClockPreparation(preparation,this.#provider);
  const preaction=await this.#stageCall("preaction",async()=>{
   await owner.prepareFootprintForwardWriterOwnData(main);const branch=main.issueForwardWriterBranchOrigin(capability);
   await main.armFootprintForwardWriterBranchRead(branch);await owner.readFootprintForwardWriterBranchApi(branch,main);
   await owner.prepareFootprintForwardWriterCopyTailObservation();await owner.prepareFootprintForwardWriterTicketTimer(main);
   const interval=await owner.beginFootprintForwardWriterProducerInterval(capability);
   this.#head=new CurrentFootprintForwardWriterPrecreateHeadOwner(this.#provider,capability,interval);this.#headCurrent=captureCurrentFootprintForwardExecutionReceiver(this.#head,headPrototype,["observe","joinAfterOriginalExit"]);const head=await this.#head.observe();
   const original=requireOriginalCurrentFootprintForwardWriterPrecreateHead(head,this.#provider,capability,interval);this.#age=original.age;
   const native=await owner.observeFootprintCopyWindowsClock("before");const endpoint=Number((BigInt(native.after.utcAfterTicks)-621_355_968_000_000_000n+9999n)/10_000n);
   const minimum=Math.max(endpoint,original.age?.observation.observedWindow.notAfterMs??endpoint);const maximum=(original.age?.observation.observedWindow.notAfterMs??minimum)+60_000;
   need(Number.isSafeInteger(minimum)&&minimum>0&&minimum<=maximum,"ORIGINAL_CLOCK_WINDOW");const window=Object.freeze({minimum,maximum});
   const reservation=reserveCurrentFootprintForwardWriterMainRequestPlan(copy,{projectUuid:copy.source.projectUuid,branchUuid:copy.source.branchUuid,projectKey:copy.source.projectUuid,path:source.source.target.rawWindowsPath},window);
   const local=reserveCurrentFootprintForwardWriterCopyLocal(reservation);await owner.prepareFootprintForwardWriterPublication(main,reservation);await owner.reproveFootprintForwardWriterTicketTimerBeforeCreate();
   return Object.freeze({branch,interval,head,window,reservation,local});
  },value=>({window:value.window,head:value.head,local:value.local}));
  const armed=await this.#stageCall("request-arm",async()=>{
   const cursor=captureOriginalCurrentFootprintForwardMainCursor(main);const construction=requireCurrentFootprintForwardMainCursor(cursor,main).construction;
   const origin=await main.issueForwardWriterRequestOrigin(capability,construction);const paired=new CurrentFootprintForwardWriterPairedScheduler(main,capability,origin,preaction.reservation);this.#paired=paired;
   this.#pairedCurrent=captureCurrentFootprintForwardExecutionReceiver(paired,pairedPrototype,["armMain","bindClocks","armClocks","requireExecutionReady","dispatchCreate","collectClocks","originalCompletedClocks","originalMainRequestRunner","collectMain","originalCompletedMain","finishAfterTail","joinCreate","observeOriginalGenerationEnded","diagnostics"]);
   await paired.armMain();owner.bindFootprintForwardWriterProducerInterval(preaction.interval,capability,origin);
   const clock=await owner.issueFootprintForwardWriterClockObserver(source.opening,source.result,metadata.leases.workerLease,metadata.leases.invocationLease,capability,origin);
   paired.bindClocks(clock);await paired.armClocks();await owner.observeFootprintCopyWindowsClock("armed");
   this.#intent=new CurrentFootprintForwardWriterCreateIntentOwner({provider:this.#provider,preparation,head:preaction.head,interval:preaction.interval,capability,mainOrigin:origin,clockOrigin:clock,reservation:preaction.reservation},
    {operationId:this.#request.operationId.replace("footprint-forward-flow-","footprint-create-intent-"),clockWindow:preaction.window,confirmDisposableCopy:true,acceptUnsupportedInverse:true});
   this.#intentCurrent=captureCurrentFootprintForwardExecutionReceiver(this.#intent,intentPrototype,["prepare","consume","finishAfterOriginalExit"]);
   const intent=await this.#intent.prepare();paired.requireExecutionReady(copy,preaction.window.minimum,preaction.window.maximum);return Object.freeze({origin,clock,intent,paired});
  },()=>({originalMainArmed:true,originalClocksArmed:true,originalIntentPrepared:true}));
  await this.#stageCall("create",async()=>{need(this.#intent!==null&&this.#createContext===null,"ORIGINAL_INTENT");this.#createContext=Object.freeze({owner,capability,mainOrigin:armed.origin,clockOrigin:armed.clock,intent:armed.intent});await this.#intent.consume(armed.intent);owner.consumeFootprintForwardWriterProducerInterval(preaction.interval,capability,armed.origin);await armed.paired.dispatchCreate(armed.intent);},()=>({originalSingleCreateWritten:true,explicitSaveAttempts:0}));
  await this.#stageCall("clocks",()=>armed.paired.collectClocks(),()=>armed.paired.originalCompletedClocks());
  await this.#stageCall("local",async()=>{
   await owner.prepareFootprintForwardWriterCopyLocal({main:armed.paired.originalMainRequestRunner(),origin:armed.origin,clock:armed.clock,clocks:armed.paired.originalCompletedClocks(),request:preaction.reservation,reservation:preaction.local});
   for(let index=0;index<7;index+=1){const packet=await owner.observeFootprintForwardWriterHeldProducer();await owner.continueFootprintForwardWriterCopyLocal(packet);}
  },()=>owner.footprintForwardWriterCopyLocalProgress());
  await this.#stageCall("upload",async()=>{await owner.prepareFootprintForwardWriterCopyUpload();for(let index=0;index<3;index+=1){const packet=await owner.observeFootprintForwardWriterHeldProducer();await owner.continueFootprintForwardWriterCopyUpload(packet);}},()=>owner.footprintForwardWriterCopyUploadProgress());
  await this.#stageCall("main",()=>armed.paired.collectMain(),()=>armed.paired.originalCompletedMain().packet);
  await this.#stageCall("drain",async()=>{
   const completed=armed.paired.originalCompletedMain();const post=main.issueForwardWriterPostBranchOrigin(capability,completed.runner,completed.packet,preaction.branch);
   const live=main.issueForwardWriterLiveHistoryOrigin(capability,completed.runner,completed.packet,preaction.branch,post);await owner.prepareFootprintForwardWriterCopyDrain(main,live,post);
   // Twenty normal drain resumes, two separate deletes and seven post-sync
   // Holds. Callback and natural timer events have their own retained drivers.
   for(let index=0;index<=29;index+=1){
    const progress=owner.footprintForwardWriterCopyDrainProgress();
    if(record(progress["post"])&&progress["post"]["canSettle"]===true||record(progress["drain"])&&progress["drain"]["canSettle"]===true){await owner.settleFootprintForwardWriterCopyDrain();}
    const after=owner.footprintForwardWriterCopyDrainProgress();if(after["nativeCompleted"]===true&&after["publicationCompleted"]===true){return;}
    need(index<29,"ORIGINAL_DRAIN_PAUSE_BOUND");const packet=await owner.observeFootprintForwardWriterHeldProducer();await owner.continueFootprintForwardWriterCopyDrain(packet);
   }
  },()=>owner.footprintForwardWriterCopyDrainProgress());
  await this.#stageCall("timer",()=>armed.paired.finishAfterTail(),()=>({originalNaturalTimerTailJoined:true}));
  const paired=await this.#stageCall("create-result",async()=>{const packet=await armed.paired.joinCreate();this.#pairedPacket=packet;await owner.observeFootprintCopyWindowsClock("post");return packet;},value=>({main:value.main,clocks:value.clocks,createReplySha256:sha256Json(value.serializedCreateResult)}));
  await this.#normalLifecycle(()=>this.#closeWriter(true));
  const after=await this.#stageCall("writer-snapshot",async()=>{need(this.#writerTermination!==null,"ORIGINAL_WRITER_TERMINATION");this.#after=await captureCurrentFootprintForwardWriterClosedSnapshot(owner,this.#writerTermination);return this.#after;},value=>({sqlSha256:value.logicalSha256}));
  const projection=await this.#stageCall("closed-effect",async()=>{
   const window=this.#clockWindow;need(window!==null,"ORIGINAL_CLOSED_CLOCK_WINDOW");const first=paired.clocks.samples[0],second=paired.clocks.samples[1];need(first!==undefined&&second!==undefined,"ORIGINAL_TWO_CLOCKS");
   const documents=owner.boundFootprintCopyDocumentClockValues(window,[[first.updateTime,first.lexicalOffset],[second.updateTime,second.lexicalOffset]]);
   const age=this.#age?.observation;const selected=age?.main.controls.controlsBefore.sql[0];
   const agedHead=age===undefined?undefined:(need(selected!==undefined,"ORIGINAL_AGED_SQL_CONTROL"),{createdAtLiteral:age.head.createdAtLiteral,nativeParsedLocalMs:selected.epochMs,nativeTimezoneOffsetMinutes:age.main.controls.controlsBefore.clockBefore.offsetMinutes});
   const sql=await prepareCurrentFootprintCopyV2SqlPlan({before:source.owned.before,copyPlan:copy,witness:{projectUuid:copy.source.projectUuid,branchUuid:copy.source.branchUuid,backendActorUuid:paired.main.value.backendActorUuid,client:copy.client,preDispatchMaxTicket:copy.maximumTicket,
    documentClockMinMs:documents.documentClockMinMs,documentClockMaxMs:documents.documentClockMaxMs,backendClockMinMs:window.backendClockMinMs,backendClockMaxMs:window.backendClockMaxMs,backendLocalOffsetMinutes:window.backendLocalOffsetMinutes,...(agedHead===undefined?{}:{agedHead})}});
   const result=decodeCurrentFootprintCopyV2NativeResult(copy,paired.serializedCreateResult);const effect=await verifyCurrentFootprintCopyV2SqlEffect(sql,after,{returnedUuid:result.returnedUuid});
   const closed=completedCurrentFootprintCopyV2SqlSource(sql,effect,after);need(closed.documentClocks[0]===first.updateTime&&closed.documentClocks[1]===second.updateTime&&closed.projectUpdatedAtLiteral===paired.main.value.observedProjectUpdatedAt&&effect["newHistoryUuid"]===paired.main.value.historyUuid,"ORIGINAL_CLOSED_MAIN_AND_CLOCKS");
   return prepareCurrentFootprintCopyV2SavedProjection(sql,effect,after);
  },value=>value);
  await this.#stageCall("saved-allocation",async()=>{this.#saved=await createCurrentFootprintForwardWriterHeldSavedExecutionNative(owner,paired);this.#current();const starting=this.#saved.start(projection,after);this.#savedStartPending=starting;await starting;},()=>({originalFreshGenerationStarted:true}));
  const saved=this.#saved;need(saved!==null,"ORIGINAL_SAVED_GENERATION");
  const replay=await this.#stageCall("saved-cache",()=>saved.excludeReplay(),()=>({originalBothNamespacesHeld:true}));
  await this.#stageCall("saved-open",async()=>{await saved.requireReplayExclusion(replay);await saved.open(projection,after,replay);},()=>({originalFreshPreopenVerified:true}));
  const savedRead=await this.#stageCall("saved-read",()=>observeCurrentFootprintForwardWriterHeldSavedSource(saved),value=>({sourceSha256:value.contentSha256,sourceSamples:value.sourceSamples,stateSamples:value.stateSamples}));
  await this.#normalLifecycle(()=>this.#closeSaved(true));
  const savedAfter=await this.#stageCall("saved-snapshot",async()=>{need(this.#savedTermination!==null,"ORIGINAL_SAVED_TERMINATION");this.#savedAfter=await saved.snapshot(this.#savedTermination);return this.#savedAfter;},value=>({sqlSha256:value.logicalSha256}));
  await this.#normalLifecycle(()=>this.#releaseSaved());
  const checkpoint=await this.#stageCall("saved-checkpoint",async()=>{this.#checkpoint=await sealCurrentFootprintForwardWriterSavedCheckpoint(saved);await verifyCurrentFootprintForwardWriterSavedCheckpoint(this.#checkpoint);return this.#checkpoint;},()=>({originalClosedSqlAndSourceVerified:true}));
  const original=requireOriginalCurrentFootprintForwardWriterSavedCheckpoint(checkpoint);
  need(original.writer===owner&&original.paired===paired&&original.writerAfter===after&&original.inventory===savedAfter&&original.savedRead===savedRead&&readerCompletion(after)!==readerCompletion(savedAfter)&&after.logicalSha256===savedAfter.logicalSha256&&this.#writerReleased&&this.#savedReleased,"ORIGINAL_SAVED_COMPLETION");
  const result=Object.freeze({profile:"private.current-footprint-forward-writer-workflow-result.v2" as const,operationId:this.#request.operationId,createdUuid:projection.targetUuid,writerSqlSha256:after.logicalSha256,savedSqlSha256:savedAfter.logicalSha256,sourceReadSha256:savedRead.contentSha256,originalClosedReadersDistinct:true as const,originalOwnersReleased:true as const,explicitSaveAttempts:0 as const,savedResultVerified:true as const,inverseAvailable:false as const,executionAuthorized:false as const});
  await this.#append("complete",{createdUuid:result.createdUuid,writerSqlSha256:result.writerSqlSha256,savedSqlSha256:result.savedSqlSha256,sourceReadSha256:result.sourceReadSha256,originalClosedReadersDistinct:true,originalOwnersReleased:true,explicitSaveAttempts:0,savedResultVerified:true,inverseAvailable:false});
  this.#result=result;results.set(result,this);this.#terminal=true;return result;
 }
 async #normalLifecycle(action:()=>Promise<void>):Promise<void> {
  this.#current();const pending=this.#retain(action());this.#lifecyclePending=pending;
  try{await pending;this.#current();}finally{if(this.#lifecyclePending===pending){this.#lifecyclePending=null;}}
 }
 async #cleanupCall<T>(generation:Generation,action:CleanupAction,attempt:number,run:()=>Promise<T>,outcome:(value:T)=>Outcome,recovery:Readonly<{deferFailure?:boolean;facts?:CurrentFootprintForwardWriterReleasePreflightFacts}>={}):Promise<T> {
  const key=`${generation}:${action}:${attempt}`;
  const intent=Object.freeze({generation,action,attempt,...(recovery.facts===undefined?{}:{preDispatchProof:recovery.facts})});
  if(this.#cleanupAttempts.has(key)){
   const retained=this.#cleanupResults.get(key);
   if(retained!==undefined){
    await this.#journal.waitForCurrentPublication();await this.#settle();this.#current(true);
    const publishedResult=this.#journal.retained().records.find(row=>row.kind==="cleanup-result"&&row.evidence["generation"]===generation&&row.evidence["action"]===action&&row.evidence["attempt"]===attempt);
    if(publishedResult===undefined){await this.#append("cleanup-result",retained.evidence);}
    else{need(sha256Json(publishedResult.evidence)===sha256Json(retained.evidence),"ORIGINAL_CLEANUP_RESULT_CHANGED");}
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The original generation/action/attempt key binds this value to the same fixed typed cleanup site; opaque native tokens cannot be reconstructed or reparsed.
    return retained.value as T;
   }
   const retainedIntent=this.#cleanupIntents.get(key);
   need(!this.#cleanupDispatchStarted.has(key)&&retainedIntent!==undefined&&sha256Json(retainedIntent)===sha256Json(intent),"ORIGINAL_CLEANUP_CONSUMED");
  }else{this.#cleanupAttempts.add(key);this.#cleanupIntents.set(key,intent);}
  await this.#journal.waitForCurrentPublication();await this.#settle();this.#current(true);
  const original=this.#cleanupIntents.get(key);need(original!==undefined,"ORIGINAL_CLEANUP_INTENT_REQUIRED");
  const published=this.#journal.retained().records.find(row=>row.kind==="cleanup-intent"&&row.evidence["generation"]===generation&&row.evidence["action"]===action&&row.evidence["attempt"]===attempt);
  if(published===undefined){await this.#append("cleanup-intent",original);}
  else{need(sha256Json(published.evidence)===sha256Json(original),"ORIGINAL_CLEANUP_INTENT_CHANGED");}
  this.#current(true);need(!this.#cleanupDispatchStarted.has(key),"ORIGINAL_CLEANUP_CONSUMED");
  // This local marker is set immediately before the sole invocation. A failed
  // Intent publication can resume only while this original marker is absent.
  this.#cleanupDispatchStarted.add(key);
  let value:T;
  try{value=await this.#retain(run());}
  catch(error){if(recovery.deferFailure!==true){this.#remember(error);}try{await this.#append("cleanup-result",{generation,action,attempt,outcome:"failed",...(recovery.facts===undefined?{}:{preDispatchProof:recovery.facts}),evidenceSha256:sha256Json({generation,action,attempt,originalErrorRetained:true})});}
   // oxlint-disable-next-line eslint/preserve-caught-error -- The native failure remains the cause and the distinct publication failure is retained in the aggregate.
   catch(publicationError){throw new AggregateError([error,publicationError],"FORWARD_WRITER_WORKFLOW_CLEANUP_PUBLICATION",{cause:error});}throw error;}
  this.#current(true);const result=outcome(value);this.#cleanupFacts.set(key,Object.freeze({generation,action,attempt,outcome:result}));
  const evidence=Object.freeze({generation,action,attempt,outcome:result,...(recovery.facts===undefined?{}:{preDispatchProof:recovery.facts}),evidenceSha256:sha256Json({generation,action,attempt,outcome:result})});
  this.#cleanupResults.set(key,Object.freeze({value,evidence}));await this.#append("cleanup-result",evidence);return value;
 }
 /** A first failure can proceed only through its original provider and Core's
  * unused opaque proof. Journal facts never enter a capability constructor. */
 async #continueReleasePreflight(generation:Generation,original:Readonly<{proof:CurrentFootprintForwardWriterReleasePreflightProof;facts:CurrentFootprintForwardWriterReleasePreflightFacts;cause:unknown}>,retry:(proof:CurrentFootprintForwardWriterReleasePreflightProof)=>Promise<void>):Promise<void>{
  await this.#cleanupCall(generation,"release",2,async()=>{
   const current=requireCurrentFootprintForwardWriterReleasePreflightFacts(original.proof);
   need(sha256Json(current)===sha256Json(original.facts),"ORIGINAL_RELEASE_PREFLIGHT_CHANGED");
   // Core consumes this same opaque token before its sole second dispatch.
   await retry(original.proof);
  },()=>"released",{facts:original.facts});
 }
 async #releaseWithPreflight(generation:Generation,first:()=>Promise<void>,consume:(cause:unknown)=>CurrentFootprintForwardWriterReleasePreflightProof|null,retry:(proof:CurrentFootprintForwardWriterReleasePreflightProof)=>Promise<void>):Promise<void> {
  const retained=this.#releaseRecoveries.get(generation);
  if(retained!==undefined){await this.#continueReleasePreflight(generation,retained,retry);return;}
  try { await this.#cleanupCall(generation,"release",1,first,()=>"released",{deferFailure:true}); }
  catch(error) {
   try {
    const proof=consume(error);if(proof===null){throw error;}
    const facts=Object.freeze(currentFootprintForwardWriterReleasePreflightFactsSchema.parse(requireCurrentFootprintForwardWriterReleasePreflightFacts(proof)));
    need(!this.#releaseRecoveries.has(generation),"ORIGINAL_RELEASE_RECOVERY_CONSUMED");const original=Object.freeze({proof,facts,cause:error});this.#releaseRecoveries.set(generation,original);
    await this.#continueReleasePreflight(generation,original,retry);
   } catch(recoveryError) {this.#remember(error);throw recoveryError;}
  }
 }
 async #closeWriter(normal:boolean):Promise<void> {
  if(this.#writerReleased){return;}const status=this.#provider.status();
  if(status["busy"]===true&&status["launchInvoked"]!==true&&this.#stagePending!==null){await Promise.allSettled([this.#stagePending]);}
  const current=this.#provider.status();
  if(current["launchInvoked"]!==true){
   const allocated=current["factoryInvoked"]===true;
   await this.#cleanupCall("writer",allocated?"unlaunched":"no-allocation",1,()=>this.#provider.cleanupBeforeLaunch(),()=>allocated?"released":"no-resource");this.#writerReleased=true;return;
  }
  if(current["released"]===true){this.#writerReleased=true;return;}
  if(this.#provider.completeWorkflowNoProcessCleanupAvailable()){
   await this.#cleanupCall("writer","no-process",1,()=>this.#provider.cleanupNoProcess(),()=>"released");this.#writerReleased=true;return;
  }
  if(current["terminated"]===true){this.#writerTerminated=true;}else{
   await this.#cleanupCall("writer",normal?"close":"abort",1,()=>normal?this.#provider.closeCompleteWorkflow():this.#provider.abort(true),()=>"dispatched");
   for(let attempt=1;attempt<=BUDGET.terminationObservations;attempt+=1){
    if(normal){need(!this.#stopped,"ORIGINAL_NORMAL_CLOSE_ENDED");}
    if(this.#cleanupFacts.get(`writer:termination:${attempt}`)?.outcome!=="pending"){
     const exited=await this.#cleanupCall("writer","termination",attempt,()=>this.#provider.observeTermination(),value=>value?"terminated":"pending");if(exited){this.#writerTerminated=true;break;}
    }
   }need(this.#writerTerminated,"WRITER_TERMINATION_BOUND");
  }
  if(normal){need(this.#input!==null,"ORIGINAL_WRITER_INPUT");await this.#input.owner.observeFootprintCopyWindowsClock("termination");this.#clockWindow=this.#input.owner.closedFootprintCopyWindowsClockWindow();}
  await this.#cleanupCall("writer","observers",1,async()=>{
   await this.#provider.endCompleteWorkflowObserversAfterTermination();
   if(this.#paired!==null){await this.#paired.observeOriginalGenerationEnded();}
   if(this.#head!==null){await this.#head.joinAfterOriginalExit();}
   if(this.#intent!==null){await this.#intent.finishAfterOriginalExit();}
  },()=>"released");
  await this.#releaseWithPreflight("writer",()=>this.#provider.release(),cause=>this.#provider.consumeReleasePreflightFailure(cause),proof=>this.#provider.retryReleaseAfterPreflight(proof));
  if(this.#input!==null){this.#writerTermination=originalCurrentFootprintForwardWriterNativeTermination(this.#input.owner);}this.#writerReleased=true;
 }
 async #closeSaved(normal:boolean):Promise<void> {
  if(this.#savedReleased){return;}const saved=this.#saved;
  if(saved?.startOutcome()==="pending"){need(this.#savedStartPending!==null,"ORIGINAL_SAVED_BIRTH_PENDING");await Promise.allSettled([this.#savedStartPending]);this.#current(true);}
  if(saved===null||saved.startOutcome()==="not-started"||saved.startOutcome()==="no-resource"){
   await this.#cleanupCall("saved","no-allocation",1,()=>Promise.resolve(),()=>"no-resource");this.#savedReleased=true;return;
  }
  if(this.#savedTerminated){return;}need(saved.startOutcome()==="retained","SAVED_ALLOCATION_UNRESOLVED");
  await this.#cleanupCall("saved",normal?"close":"abort",1,()=>normal?saved.close():abortCurrentFootprintForwardWriterHeldSavedJob(saved),()=>"dispatched");
  for(let attempt=1;attempt<=BUDGET.terminationObservations;attempt+=1){
   if(normal){need(!this.#stopped,"ORIGINAL_NORMAL_CLOSE_ENDED");}
   if(this.#cleanupFacts.get(`saved:termination:${attempt}`)?.outcome!=="pending"){
    const termination=await this.#cleanupCall("saved","termination",attempt,()=>saved.termination(),value=>value.status==="terminated"?"terminated":"pending");
    if(termination.status==="terminated"){this.#savedTermination=termination.original;this.#savedTerminated=true;break;}
   }
  }need(this.#savedTerminated&&this.#savedTermination!==null,"SAVED_TERMINATION_BOUND");
  await this.#cleanupCall("saved","observers",1,async()=>{need(this.#savedTermination!==null,"ORIGINAL_SAVED_TERMINATION");await saved.requireTermination(this.#savedTermination);},()=>"released");
 }
 async #releaseSaved():Promise<void> {
  const saved=this.#saved,termination=this.#savedTermination;need(saved!==null&&termination!==null,"ORIGINAL_SAVED_RELEASE");
  await this.#releaseWithPreflight("saved",async()=>{await saved.release(termination);need(await saved.observeRelease(termination)==="released","ORIGINAL_SAVED_RELEASE_ACK");},
   cause=>requireCurrentFootprintForwardWriterHeldSavedReleasePreflightFailure(saved,cause),async proof=>{await retryCurrentFootprintForwardWriterHeldSavedReleaseAfterPreflight(saved,proof);need(await saved.observeRelease(termination)==="released","ORIGINAL_SAVED_RELEASE_ACK");});this.#savedReleased=true;
 }
 /** Abort may proceed while an original normal wait is pending. Exact action
  * Promises join after original Job exit; no action or record is replayed. */
 public cleanup():Promise<void> {
  if(this.#cleanupPending!==null){return this.#cleanupPending;}this.#current(true);
  if(this.#terminal){need(this.#result!==null,"ORIGINAL_TERMINAL");return Promise.resolve();}
  this.#stopped=true;this.#cleanupInProgress=true;const completion=Promise.withResolvers<undefined>();this.#cleanupPending=completion.promise;
  void admission.run(this,async():Promise<void>=>{try{
   await this.#journal.waitForCurrentPublication();await this.#settle();
   if(!this.#journal.retained().reserved){need(this.#input===null&&this.#saved===null,"UNRESERVED_RESOURCES");await this.#provider.cleanupBeforeLaunch();this.#writerReleased=true;this.#savedReleased=true;this.#terminal=true;completion.resolve(undefined);return;}
   if(this.#lifecyclePending!==null){await Promise.allSettled([this.#lifecyclePending]);}
   await this.#closeWriter(false);await this.#closeSaved(false);if(this.#savedTerminated&&!this.#savedReleased){await this.#releaseSaved();}
   await Promise.allSettled(this.#pending);need(this.#writerReleased&&this.#savedReleased,"ORIGINAL_RESOURCES_UNRELEASED");
   if(!this.#journal.retained().records.some(row=>row.kind==="failure")){this.#remember(new Error("FORWARD_WRITER_WORKFLOW_ENDED"));await this.#append("failure",{stage:this.#stage,originalErrorRetained:true});}
   await this.#append("terminal-failure",{originalOwnersClosed:true,originalPendingJoined:true,released:true});this.#terminal=true;completion.resolve(undefined);
  }catch(error){completion.reject(error);}finally{this.#cleanupInProgress=false;}});return completion.promise;
 }
 /** Settle original publication, then continue an already-requested cleanup.
  * Acknowledged steps reuse original results; no consumed step is dispatched again. */
 public async settleRecords():Promise<void> {
  this.#current(true);await this.#journal.waitForCurrentPublication();await this.#settle();
  if(!this.#journal.retained().reserved||this.#terminal||!this.#failed&&!this.#stopped){return;}
  const provider=this.#provider.status();
  if(provider["busy"]===true||provider["cleanupBusy"]===true||this.#cleanupInProgress||this.#stagePending!==null||this.#lifecyclePending!==null){return;}
  const writerCleanupStarted=[...this.#cleanupDispatchStarted].some(key=>key.startsWith("writer:"));
  // A workflow intent can fail before the provider owns a journal at all.
  // Its first cleanup must enter that original provider path before settlement.
  if(provider["publicationPending"]===true||provider["released"]!==true&&writerCleanupStarted){await this.#provider.settleRecords();}this.#current(true);
  if(this.#cleanupPending!==null){
   // Continue only the already-requested cleanup after publishing its original
   // Acknowledged outcomes; unknown attempts remain consumed in #cleanupCall.
   this.#cleanupInProgress=true;
   try{
    await this.#closeWriter(false);await this.#closeSaved(false);
    if(this.#savedTerminated&&!this.#savedReleased){await this.#releaseSaved();}
   }finally{this.#cleanupInProgress=false;}
  }
  const published=(generation:Generation):boolean=>this.#journal.retained().records.some(row=>{
   if(row.kind!=="cleanup-result"||row.evidence["generation"]!==generation){return false;}
   const action=row.evidence["action"],attempt=row.evidence["attempt"];
   if(typeof action!=="string"||typeof attempt!=="number"){return false;}
   const fact=this.#cleanupFacts.get(`${generation}:${action}:${attempt}`);
   return fact!==undefined&&fact.outcome===row.evidence["outcome"]&&["release","unlaunched","no-process","no-allocation","unowned-helper"].includes(fact.action)&&
    (fact.outcome==="released"||fact.outcome==="no-resource");
  });
  if(published("writer")&&this.#provider.status()["released"]===true){this.#writerReleased=true;}
  if(published("saved")&&this.#saved!==null&&this.#savedTermination!==null&&await this.#saved.observeRelease(this.#savedTermination)==="released"){this.#savedReleased=true;}
  if(!this.#writerReleased){return;}
  await Promise.allSettled(this.#pending);this.#current(true);
  // A cancelled pure adapter construction has no native allocation. This
  // Distinct local pair is safe only after all original stage Promises joined.
  if(!this.#savedReleased&&(this.#saved===null||this.#saved.startOutcome()==="not-started"||this.#saved.startOutcome()==="no-resource")&&!this.#cleanupAttempts.has("saved:no-allocation:1")){await this.#closeSaved(false);}
  if(!this.#savedReleased){return;}
  if(!this.#journal.retained().records.some(row=>row.kind==="failure")){await this.#append("failure",{stage:this.#stage,originalErrorRetained:true});}
  if(this.#journal.retained().records.at(-1)?.kind!=="terminal-failure"){await this.#append("terminal-failure",{originalOwnersClosed:true,originalPendingJoined:true,released:true});}
  this.#terminal=true;
 }
 public retained():Readonly<Record<string,unknown>> {
  this.#current(true);return Object.freeze({profile:"private.current-footprint-forward-writer-workflow-state.v2",operationId:this.#request.operationId,stage:this.#stage,failed:this.#failed,terminal:this.#terminal,writerTerminated:this.#writerTerminated,writerReleased:this.#writerReleased,savedTerminated:this.#savedTerminated,savedReleased:this.#savedReleased,publicationPending:this.#journal.retained().publicationPending,executionAuthorized:false});
 }
 public retainedFailureCode():string|null {
  this.#current(true);
  const code=originalNativeOrSourceErrorCode(this.#failure);
  if(code!=="PCB_DIAGNOSTIC_CREATE_PROCESS_REFUSED"){return code;}
  const win32=this.#provider.status()["createProcessError"];
  return typeof win32==="number"&&Number.isSafeInteger(win32)&&win32>=0&&win32<=4_294_967_295?`${code}_WIN32_${String(win32)}`:code;
 }
 public retainedFailure():unknown { this.#current(true);return this.#failure; }
 public originalResult(packet:CurrentFootprintForwardWriterWorkflowResult):Readonly<{checkpoint:CurrentFootprintForwardWriterSavedCheckpoint;paired:CurrentFootprintForwardWriterPairedObservation}> {
  this.#current(true);need(results.get(packet)===this&&packet===this.#result&&this.#terminal&&this.#checkpoint!==null&&this.#pairedPacket!==null&&this.#writerReleased&&this.#savedReleased,"ORIGINAL_COMPLETE_RESULT");
  requireOriginalCurrentFootprintForwardWriterSavedCheckpoint(this.#checkpoint);return Object.freeze({checkpoint:this.#checkpoint,paired:this.#pairedPacket});
 }
}
const workflowPrototype=captureCurrentFootprintForwardExecutionPrototypes(CurrentFootprintForwardWriterWorkflow.prototype);
/* oxlint-disable typescript/unbound-method -- Call the captured method only on its original private-field workflow receiver. */
const originalAdmission=CurrentFootprintForwardWriterWorkflow.prototype.originalAdmission;
const originalDiagnosticOperation=CurrentFootprintForwardWriterWorkflow.prototype.ownsDiagnosticOperation;
const originalResult=CurrentFootprintForwardWriterWorkflow.prototype.originalResult;
const originalCreateAdmission=CurrentFootprintForwardWriterWorkflow.prototype.requireCreateAdmission;
const originalCreateReproof=CurrentFootprintForwardWriterWorkflow.prototype.reproveCreateAdmission;
const originalCreateJoin=CurrentFootprintForwardWriterWorkflow.prototype.requireCreateJoin;
const originalCreateJoinReproof=CurrentFootprintForwardWriterWorkflow.prototype.reproveCreateJoin;
/* oxlint-enable typescript/unbound-method */
export function requireOriginalCurrentFootprintForwardWriterWorkflowResult(packet:CurrentFootprintForwardWriterWorkflowResult):ReturnType<CurrentFootprintForwardWriterWorkflow["originalResult"]> {
 const owner=results.get(packet);need(owner!==undefined,"ORIGINAL_RESULT");return originalResult.call(owner,packet);
}


export function requireOriginalCurrentFootprintForwardWriterWorkflowCreateAdmission(owner:CurrentFootprintForwardWriterNativeOwner,capability:CurrentFootprintForwardWriterMainCapability,mainOrigin:CurrentFootprintForwardWriterMainRequestOrigin,clockOrigin:CurrentFootprintForwardWriterClockRpcOrigin,intent:CurrentFootprintForwardWriterCreateIntent):void {
 const flow=admission.getStore();need(flow!==undefined&&originals.has(flow),"ORIGINAL_CREATE_SCOPE");originalCreateAdmission.call(flow,owner,capability,mainOrigin,clockOrigin,intent);
}
export function reproveOriginalCurrentFootprintForwardWriterWorkflowCreateAdmission(owner:CurrentFootprintForwardWriterNativeOwner,capability:CurrentFootprintForwardWriterMainCapability,mainOrigin:CurrentFootprintForwardWriterMainRequestOrigin,clockOrigin:CurrentFootprintForwardWriterClockRpcOrigin,intent:CurrentFootprintForwardWriterCreateIntent):Promise<void> {
 const flow=admission.getStore();need(flow!==undefined&&originals.has(flow),"ORIGINAL_CREATE_SCOPE");return originalCreateReproof.call(flow,owner,capability,mainOrigin,clockOrigin,intent);
}


export function requireOriginalCurrentFootprintForwardWriterWorkflowCreateJoin(owner:CurrentFootprintForwardWriterNativeOwner,capability:CurrentFootprintForwardWriterMainCapability,mainOrigin:CurrentFootprintForwardWriterMainRequestOrigin,clockOrigin:CurrentFootprintForwardWriterClockRpcOrigin,intent:CurrentFootprintForwardWriterCreateIntent,pending:CurrentFootprintCopyPendingCreate):void{
 const flow=admission.getStore();need(flow!==undefined&&originals.has(flow),"ORIGINAL_CREATE_JOIN_SCOPE");originalCreateJoin.call(flow,owner,capability,mainOrigin,clockOrigin,intent,pending);
}
export function reproveOriginalCurrentFootprintForwardWriterWorkflowCreateJoin(owner:CurrentFootprintForwardWriterNativeOwner,capability:CurrentFootprintForwardWriterMainCapability,mainOrigin:CurrentFootprintForwardWriterMainRequestOrigin,clockOrigin:CurrentFootprintForwardWriterClockRpcOrigin,intent:CurrentFootprintForwardWriterCreateIntent,pending:CurrentFootprintCopyPendingCreate):Promise<void>{
 const flow=admission.getStore();need(flow!==undefined&&originals.has(flow),"ORIGINAL_CREATE_JOIN_SCOPE");return originalCreateJoinReproof.call(flow,owner,capability,mainOrigin,clockOrigin,intent,pending);
}


export function isOriginalCurrentFootprintForwardWriterDiagnosticOperation(operationId:string):Promise<boolean>{
 const flow=admission.getStore();return flow===undefined||!originals.has(flow)?Promise.resolve(false):originalDiagnosticOperation.call(flow,operationId);
}
