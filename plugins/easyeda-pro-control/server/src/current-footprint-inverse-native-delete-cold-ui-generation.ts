/* oxlint-disable import/max-dependencies -- This original coordinator joins durable publication, own birth, fixed read, whole-Job cleanup and complete SQL comparison without sharing issuer domains. */
import { AsyncLocalStorage } from "node:async_hooks";
import {createHash} from "node:crypto";
import {CurrentFootprintInverseNativeDeleteColdUiJournal,assertOriginalCurrentFootprintInverseNativeDeleteColdUiJournal,scanCurrentFootprintInverseNativeDeleteColdUiLaunchStates} from "./current-footprint-inverse-native-delete-cold-ui-journal.ts";
import type {COLD_UI_STAGES,ColdUiStagePhase} from "./current-footprint-inverse-native-delete-cold-ui-contract.ts";
import {assertOriginalCurrentFootprintInverseNativeDeleteColdUiOwner,currentFootprintInverseNativeDeleteColdUiAllocationOutcome,originalCurrentFootprintInverseNativeDeleteColdSource,originalCurrentFootprintInverseNativeDeleteColdUiTermination,startCurrentFootprintInverseNativeDeleteColdUiOwner} from "./current-pcb-diagnostic-owner.ts";
import {requireCurrentFootprintInverseNativeDeleteColdClosedSnapshot} from "./current-footprint-inverse-v4-closed-snapshot.ts";
import type {CurrentFootprintInverseNativeDeleteColdGeneration} from "./current-footprint-inverse-native-delete-cold-generation.ts";
/** One retained native DELETE cold generation. Only genuine released
 * persistence can select it; this module adds no public operation or authority
 * to adopt a supplied owner, checkpoint, source or cleanup binding. */
import {types} from "node:util";
import {requireOriginalCurrentFootprintInverseNativeDeleteColdAbsence} from "./current-footprint-inverse-native-delete-cold-absence.ts";
import type {CurrentFootprintInverseNativeDeleteColdAbsence} from "./current-footprint-inverse-native-delete-cold-absence.ts";
// oxlint-disable-next-line import/no-cycle -- The original private coordinator issues its token after construction; this late leaf never runs or registers authority at module initialization.
import {prepareCurrentFootprintInverseNativeDeleteColdUiCheckpoint} from "./current-footprint-inverse-native-delete-cold-ui-checkpoint.ts";
import type {CurrentFootprintInverseNativeDeleteColdUiCheckpoint} from "./current-footprint-inverse-native-delete-cold-ui-checkpoint.ts";
// oxlint-disable-next-line import/no-cycle -- The original private coordinator issues its token after construction; this late leaf never runs or registers authority at module initialization.
import {captureCurrentFootprintInverseNativeDeleteColdUiAbsence,requireOriginalCurrentFootprintInverseNativeDeleteColdUiAbsence} from "./current-footprint-inverse-native-delete-cold-ui-absence.ts";
import type {CurrentFootprintInverseNativeDeleteColdUiAbsence} from "./current-footprint-inverse-native-delete-cold-ui-absence.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_CAPACITY as CAPACITY} from "./current-footprint-inverse-native-delete-cold-ui-capacity.ts";
import type {CurrentFootprintInverseNativeDeleteColdOwner,CurrentFootprintInverseNativeDeleteColdUiOwner,CurrentFootprintInverseNativeDeleteColdUiReadResult} from "./current-pcb-diagnostic-owner.ts";

type Persistence=ReturnType<typeof requireOriginalCurrentFootprintInverseNativeDeleteColdAbsence>;
const INTERNAL=Object.freeze({});
type Stage=typeof COLD_UI_STAGES[number];
type NativeIntentStage = "birth-intent" | "read-intent";
const admission = new AsyncLocalStorage<CurrentFootprintInverseNativeDeleteColdUiGeneration>();
interface Intent{
 readonly predecessor:CurrentFootprintInverseNativeDeleteColdOwner;readonly absence:CurrentFootprintInverseNativeDeleteColdAbsence;
 readonly journal:CurrentFootprintInverseNativeDeleteColdUiJournal;readonly retained:()=>void;readonly assertNormal:()=>void;
 readonly reproveNativeAdmission: (stage: NativeIntentStage) => Promise<void>;
}
const originalIntents=new WeakMap<object,Intent>();
export function requireOriginalCurrentFootprintInverseNativeDeleteColdUiIntent(token:object):Readonly<Intent>{
 const original=originalIntents.get(token);need(original!==undefined,"ORIGINAL_INTENT");original.retained();assertOriginalCurrentFootprintInverseNativeDeleteColdUiJournal(original.journal);return original;
}
const generations=new WeakMap<CurrentFootprintInverseNativeDeleteColdAbsence,CurrentFootprintInverseNativeDeleteColdUiGeneration>();
const terminationLimit=CAPACITY.controls.cleanupCoreControls.termination;
const fixedStages={checkpoint:1,birth:1,read:1,window:1,close:1,observers:1,release:1,absence:1,abort:1} as const;
const stageLimit=terminationLimit+Object.values(fixedStages).reduce((total,value)=>total+value,0);
function need(value:boolean,code:string):asserts value{if(!value){throw new Error(`INVERSE_NATIVE_DELETE_COLD_UI_GENERATION_${code}`);}}
/** Retains original work through normal closure and interruption. Native
 * dispatch stays inside the genuine cold Core owner and its fixed ledger. */
export class CurrentFootprintInverseNativeDeleteColdUiGeneration{
 readonly #intent=Object.freeze({});readonly #journal:CurrentFootprintInverseNativeDeleteColdUiJournal;
 readonly #operationId: string;
 #reservationPending:Promise<void>|null=null;#stage:Stage="checkpoint";#journalTerminal=false;
 readonly #persistence:CurrentFootprintInverseNativeDeleteColdAbsence;
 readonly #predecessor:CurrentFootprintInverseNativeDeleteColdOwner;
 readonly #bindings:Persistence;
 readonly #pending:Promise<unknown>[]=[];
 readonly #original:Promise<unknown>[]=[];
 readonly #observed:Promise<void>[]=[];
 #run:Promise<CurrentFootprintInverseNativeDeleteColdUiAbsence>|null=null;
 #cleanup:Promise<void>|null=null;
 #preparing:Promise<CurrentFootprintInverseNativeDeleteColdUiCheckpoint>|null=null;
 #checkpoint:CurrentFootprintInverseNativeDeleteColdUiCheckpoint|null=null;
 #birth:Promise<CurrentFootprintInverseNativeDeleteColdUiOwner>|null=null;
 #owner:CurrentFootprintInverseNativeDeleteColdUiOwner|null=null;
 #read:Promise<CurrentFootprintInverseNativeDeleteColdUiReadResult>|null=null;
 #readResult:CurrentFootprintInverseNativeDeleteColdUiReadResult|null=null;
 #window:Promise<string|null>|null=null;
 #close:Promise<void>|null=null;
 #termination:Readonly<{pending:Promise<boolean>;ordinal:number}>|null=null;
 #terminationCalls=0;
 #terminated=false;
 #end:Promise<void>|null=null;
 #release:Promise<unknown>|null=null;
 #releaseKind:"closed"|"unlaunched"|"no-process"|null=null;
 #reservation:object|null=null;
 #abort:Promise<void>|null=null;
 #absence:CurrentFootprintInverseNativeDeleteColdUiAbsence|null=null;
 #stopped=false;
 #failed=false;
 #failure:unknown;
 #cleaned=false;
 public constructor(internal:object,persistence:CurrentFootprintInverseNativeDeleteColdAbsence,owner:CurrentFootprintInverseNativeDeleteColdOwner){
  need(internal===INTERNAL,"INTERNAL_FACTORY");
  this.#bindings=requireOriginalCurrentFootprintInverseNativeDeleteColdAbsence(persistence,owner);
  this.#persistence=persistence;this.#predecessor=owner;
  const source=originalCurrentFootprintInverseNativeDeleteColdSource(owner);const snapshot=requireCurrentFootprintInverseNativeDeleteColdClosedSnapshot(owner,this.#bindings.inventory);
  const suffix=createHash("sha256").update(source.operationId).digest("hex").slice(0,32);
  this.#operationId=`footprint-inverse-cold-ui-${suffix}`;
  this.#journal=new CurrentFootprintInverseNativeDeleteColdUiJournal({operationId:this.#operationId,parentOperationId:source.operationId,sourceSha256:snapshot.checkpoint.sourceSha256,documentUuid:persistence.targetUuid,readonlyContinuation:true,saveRequests:0});
  originalIntents.set(this.#intent,Object.freeze({predecessor:owner,absence:persistence,journal:this.#journal,
   retained:():void=>{this.#sourceCurrent();},assertNormal:():void=>{this.#sourceCurrent();need(!this.#stopped&&!this.#failed,"NORMAL_ENDED");},
   reproveNativeAdmission: (stage: NativeIntentStage): Promise<void> => this.#reproveNativeAdmission(stage)}));
 }
 #remember(cause:unknown):void{if(!this.#failed){this.#failed=true;this.#failure=cause;}}
 #sourceCurrent():void{
  const actual=requireOriginalCurrentFootprintInverseNativeDeleteColdAbsence(this.#persistence,this.#predecessor);
  need(actual===this.#bindings,"ORIGINAL_COMPLETED_COLD");
 }
 #current(cleanup=false):void{this.#sourceCurrent();
  if(!cleanup){need(!this.#stopped&&!this.#failed,"NORMAL_ENDED");}
  if(this.#owner!==null){assertOriginalCurrentFootprintInverseNativeDeleteColdUiOwner(this.#owner);}
 }
 #observe<T>(pending:Promise<T>):void{
  const observed=(async():Promise<void>=>{try{await pending;}catch(error){this.#remember(error);}})();
  this.#observed.push(observed);
 }
 /** Reserve and retain the complete wrapper before invoking the original
  * method, then retain its actual Promise before the first join. */
 #call<T>(cleanup:boolean,start:()=>Promise<T>):Promise<T>{
  need(this.#pending.length<stageLimit&&this.#original.length<stageLimit,"STAGE_BOUND");
  const gate=Promise.withResolvers<null>();
  const pending=(async():Promise<T>=>{
   await gate.promise;this.#current(cleanup);
   const original=start();need(types.isPromise(original),"ORIGINAL_PROMISE");
   this.#original.push(original);this.#observe(original);
   const value=await original;this.#current(cleanup);return value;
  })();
  this.#pending.push(pending);this.#observe(pending);gate.resolve(null);return pending;
 }
 async #journalStage<T>(stage:Stage,start:()=>Promise<T>):Promise<T>{
  this.#current();this.#stage=stage;await this.#journal.append(`${stage}-intent` as ColdUiStagePhase,{});this.#current();
  const result=await start();this.#current();await this.#journal.append(`${stage}-result` as ColdUiStagePhase,{originalCompleted:true});this.#current();return result;
 }
 public start():Promise<CurrentFootprintInverseNativeDeleteColdUiAbsence>{
  this.#current(true);if(this.#run!==null){return this.#run;}
  const gate=Promise.withResolvers<null>();
  const pending=admission.run(this,async():Promise<CurrentFootprintInverseNativeDeleteColdUiAbsence>=>{
   await gate.promise;this.#current();this.#reservationPending=this.#journal.reserve();await this.#reservationPending;this.#current();
   this.#preparing=this.#journalStage("checkpoint",()=>this.#call(false,()=>prepareCurrentFootprintInverseNativeDeleteColdUiCheckpoint(this.#intent)));
   const checkpoint=await this.#preparing;this.#checkpoint=checkpoint;this.#current();
   this.#birth=this.#journalStage("birth",()=>this.#call(false,()=>startCurrentFootprintInverseNativeDeleteColdUiOwner(checkpoint)));
   const owner=await this.#birth;this.#owner=owner;this.#current();
   this.#read=this.#journalStage("read",()=>this.#call(false,()=>owner.readFootprintInverseNativeDeleteColdUi()));
   this.#readResult=await this.#read;this.#current();
   this.#window=this.#journalStage("window",()=>this.#call(false,()=>owner.observeApplicationWindow()));const hwnd=await this.#window;this.#current();need(hwnd!==null,"ORIGINAL_WINDOW");
   this.#close=this.#journalStage("close",()=>this.#call(false,()=>owner.requestNormalClose(hwnd)));await this.#close;this.#current();
   await this.#journalStage("exit",()=>this.#observeExit(false));this.#current();
   await this.#journalStage("observers",()=>this.#endObservers());this.#current();
   await this.#journalStage("release",()=>this.#releaseOwner("closed"));this.#current();
   const termination=originalCurrentFootprintInverseNativeDeleteColdUiTermination(owner);
   const result=await this.#journalStage("absence",()=>this.#call(false,()=>captureCurrentFootprintInverseNativeDeleteColdUiAbsence(this.#readResultRequired(),owner,termination)));this.#current();
   requireOriginalCurrentFootprintInverseNativeDeleteColdUiAbsence(result,owner);await this.#journal.append("terminal-success",{nativeUiTaskAbsenceVerified:true,publicSdkParity:false,wholeInverseVerified:false});this.#current();this.#journalTerminal=true;this.#absence=result;return result;
  });
  this.#run=pending;this.#observe(pending);gate.resolve(null);return pending;
 }
 #originalNativeIntent(operationId: string): NativeIntentStage | null {
  if (admission.getStore() !== this || operationId !== this.#operationId ||
      this.#stopped || this.#failed || this.#journalTerminal || this.#run === null) { return null; }
  const journal = this.#journal.retained();
  if (!journal.reserved || journal.publicationPending || this.#journal.reservationOutcome() !== "reserved") { return null; }
  const last = journal.records.at(-1)?.kind;
  if (this.#stage === "birth" && this.#birth !== null && last === "birth-intent") { return last; }
  if (this.#stage === "read" && this.#read !== null && last === "read-intent") { return last; }
  return null;
 }

 /** Reprove the actual retained stage before allowing its own diagnostic journal. */
 public async ownsDiagnosticOperation(operationId: string): Promise<boolean> {
  const stage = this.#originalNativeIntent(operationId);
  if (stage === null) { return false; }
  this.#current(); await this.#journal.assertStage(stage); this.#current();
  return this.#originalNativeIntent(operationId) === stage;
 }

 async #reproveNativeAdmission(stage: NativeIntentStage): Promise<void> {
  this.#current();
  need(this.#originalNativeIntent(this.#operationId) === stage, "NATIVE_INTENT");
  await assertNoUnresolvedCurrentFootprintInverseNativeDeleteColdUis();
  await this.#journal.assertStage(stage);
  this.#current();
  need(this.#originalNativeIntent(this.#operationId) === stage, "NATIVE_INTENT_CHANGED");
 }

 #readResultRequired():CurrentFootprintInverseNativeDeleteColdUiReadResult{need(this.#readResult!==null,"ORIGINAL_READ");return this.#readResult;}
 #originalOwner():CurrentFootprintInverseNativeDeleteColdUiOwner{this.#current(true);need(this.#owner!==null,"ORIGINAL_OWNER");return this.#owner;}
 async #observeExit(cleanup:boolean):Promise<void>{
  const owner=this.#originalOwner();
  while(!this.#terminated){
   if(this.#termination===null){
    need(this.#terminationCalls<terminationLimit,"TERMINATION_BOUND");this.#terminationCalls+=1;
    this.#termination=Object.freeze({pending:this.#call(true,()=>cleanup?owner.observeFootprintInverseNativeDeleteColdUiTerminationAfterAbort():owner.observeTermination()),ordinal:this.#terminationCalls});
   }
   const original=this.#termination;const exited=await original.pending;this.#current(true);
   need(this.#termination===original||this.#termination===null||this.#termination.ordinal>original.ordinal,"ORIGINAL_TERMINATION_PENDING");
   if(exited){originalCurrentFootprintInverseNativeDeleteColdUiTermination(owner);this.#terminated=true;return;}
   if(this.#termination===original){this.#termination=null;}if(!cleanup){this.#current();}
  }
 }
 #endObservers():Promise<void>{
  const owner=this.#originalOwner();need(this.#terminated,"ORIGINAL_EXIT_REQUIRED");
  this.#end??=this.#call(true,()=>owner.endFootprintInverseNativeDeleteColdUiAfterOriginalExit());return this.#end;
 }
 #releaseOwner(kind:"closed"|"unlaunched"|"no-process"):Promise<unknown>{
  const owner=this.#originalOwner();
  if(this.#release!==null){need(this.#releaseKind===kind,"ORIGINAL_RELEASE_KIND");return this.#release;}
  this.#releaseKind=kind;
  this.#release=this.#call(true,():Promise<unknown>=>{if(kind==="closed"){return owner.releaseClosed();}if(kind==="unlaunched"){return owner.releaseUnlaunched();}return owner.releaseNoProcess();});return this.#release;
 }
 async #recoverBirth():Promise<void>{
  if(this.#preparing!==null){await Promise.allSettled([this.#preparing]);}
  if(this.#birth!==null){await Promise.allSettled([this.#birth]);}
  this.#current(true);
  if(this.#owner===null&&this.#checkpoint!==null){
   const outcome=currentFootprintInverseNativeDeleteColdUiAllocationOutcome(this.#checkpoint);
   if(outcome.owner===null){need(outcome.state==="not-attempted"||outcome.state==="no-resource","BIRTH_UNRESOLVED");}
   else{assertOriginalCurrentFootprintInverseNativeDeleteColdUiOwner(outcome.owner);this.#owner=outcome.owner;}
  }
 }
 /** Cut off normal work synchronously. Abort/exit is allowed during this same
  * original read; the read joins after observer retirement, never before it. */
 async #cleanupResources():Promise<void>{await this.#recoverBirth();this.#current(true);
   const owner=this.#owner;
   if(owner===null){await Promise.allSettled(this.#pending);if(this.#run!==null){await Promise.allSettled([this.#run]);}this.#cleaned=true;return;}
   let state=owner.status();
   if(this.#release!==null){await this.#release;this.#current(true);state=owner.status();}
   if(!state.released){
    this.#reservation??=owner.reserveFootprintInverseNativeDeleteColdUiCleanup();
    if(state.binding===null&&state.launchConsumed&&this.#read!==null){await Promise.allSettled([this.#read]);this.#current(true);state=owner.status();}
    if(!state.launchConsumed){await this.#releaseOwner("unlaunched");}
    else if(state.binding===null){need(state.noProcessCleanupAvailable,"ORIGINAL_LAUNCH_UNRESOLVED");await this.#releaseOwner("no-process");}
    else{
     const errors:unknown[]=[];
     if(!this.#terminated){
      const reservation=this.#reservation;need(reservation!==null,"ORIGINAL_CLEANUP_RESERVATION");
      this.#abort??=this.#call(true,()=>owner.dispatchFootprintInverseNativeDeleteColdUiCleanupAbort(reservation));
      try{await this.#abort;}catch(error){errors.push(error);}
      try{await this.#observeExit(true);}catch(error){errors.push(error);}
     }
     need(this.#terminated,"ORIGINAL_ROOT_AND_JOB_RETAINED");
     try{await this.#endObservers();}catch(error){errors.push(error);}
     await Promise.allSettled([...(this.#read===null?[]:[this.#read]),...(this.#window===null?[]:[this.#window]),...(this.#close===null?[]:[this.#close])]);
     try{await this.#releaseOwner("closed");}catch(error){errors.push(error);}
     await Promise.allSettled(this.#pending);if(this.#run!==null){await Promise.allSettled([this.#run]);}
     if(errors.length>0){throw new AggregateError(errors,"INVERSE_NATIVE_DELETE_COLD_UI_GENERATION_CLEANUP");}
    }
   }
   await Promise.allSettled(this.#pending);if(this.#run!==null){await Promise.allSettled([this.#run]);}
   this.#current(true);const closed=owner.status();need(closed.released&&closed.helperClosed&&owner.observeFootprintCopyRelease()==="released","ORIGINAL_HELPER_EXIT");this.#cleaned=true;
 }
 async #beginCleanupJournal():Promise<void>{
  if(this.#reservationPending!==null){await Promise.allSettled([this.#reservationPending]);}
  const outcome=this.#journal.reservationOutcome();if(outcome==="not-entered"||outcome==="conflict"){return;}
  this.#journal.planOriginalCleanup(this.#stage);
  await this.#journal.waitForCurrentPublication();await this.#journal.settle();const last=this.#journal.retained().records.at(-1)?.kind;
  if(last==="terminal-success"||last==="terminal-failure"){this.#journalTerminal=true;return;}
  await this.#journal.beginOriginalCleanup(this.#stage);
 }
 async #finishCleanupJournal():Promise<void>{
  if(this.#journalTerminal){return;}
  const state=this.#owner?.status();need(this.#cleaned&&(state===undefined||state.released&&state.helperClosed),"CLEANUP_RESOURCE_PROOF");
  this.#journal.planOriginalCleanup(this.#stage);this.#journal.recordOriginalCleanupClosure(!this.#terminated,this.#terminated);
  await this.#journal.waitForCurrentPublication();const outcome=this.#journal.reservationOutcome();if(outcome==="not-entered"||outcome==="conflict"){return;}
  await this.#journal.settleOriginalCleanupPublication();this.#journalTerminal=true;
 }
 public cleanup():Promise<void>{
  this.#current(true);this.#stopped=true;if(this.#cleanup!==null){return this.#cleanup;}this.#journal.planOriginalCleanup(this.#stage);
  const gate=Promise.withResolvers<null>();const pending=(async():Promise<void>=>{
   await gate.promise;const errors:unknown[]=[];
   try{await this.#beginCleanupJournal();}catch(error){errors.push(error);}
   try{await this.#cleanupResources();}catch(error){errors.push(error);}
   try{await this.#finishCleanupJournal();}catch(error){errors.push(error);}
   if(errors.length>0){throw new AggregateError(errors,"INVERSE_NATIVE_DELETE_COLD_UI_CLEANUP_PUBLICATION");}
  })();this.#cleanup=pending;this.#observe(pending);
  try{if(this.#owner!==null&&this.#release===null&&!this.#owner.status().released){this.#reservation=this.#owner.reserveFootprintInverseNativeDeleteColdUiCleanup();}gate.resolve(null);}catch(error){gate.reject(error);}
  return pending;
 }
 /** Settle only this original pending publication; never dispatch a stage. */
 public async settlePublication():Promise<void>{
  this.#sourceCurrent();
  if(this.#cleaned){const state=this.#owner?.status();need(state===undefined||state.released&&state.helperClosed,"ORIGINAL_CLEANUP_RETAINED");this.#journal.planOriginalCleanup(this.#stage);this.#journal.recordOriginalCleanupClosure(!this.#terminated,this.#terminated);}
  await this.#journal.waitForCurrentPublication();const outcome=this.#journal.reservationOutcome();
  if(outcome==="reserved"||outcome==="create-unknown"){
   await this.#journal.settle();
   if(this.#cleaned){await this.#journal.settleOriginalCleanupPublication();}
   const terminal=this.#journal.retained().records.at(-1)?.kind;this.#journalTerminal=terminal==="terminal-success"||terminal==="terminal-failure";
  }
  this.#sourceCurrent();
 }
 public retained():Readonly<{profile:"private.current-footprint-inverse-native-delete-cold-ui-generation-state.v1";started:boolean;cleanupStarted:boolean;failed:boolean;cleaned:boolean;ownerRetained:boolean;terminated:boolean;released:boolean;helperClosed:boolean;nativeManagerColdAbsenceVerified:boolean;nativeUiTaskColdAbsenceVerified:boolean;publicSdkParity:false;wholeInverseVerified:false;executionAuthorized:false}>{
  this.#current(true);const state=this.#owner?.status();
  return Object.freeze({profile:"private.current-footprint-inverse-native-delete-cold-ui-generation-state.v1",started:this.#run!==null,cleanupStarted:this.#cleanup!==null,failed:this.#failed,cleaned:this.#cleaned,ownerRetained:this.#owner!==null,terminated:this.#terminated,released:state?.released??false,helperClosed:state?.helperClosed??false,nativeManagerColdAbsenceVerified:this.#absence!==null,nativeUiTaskColdAbsenceVerified:this.#absence!==null,publicSdkParity:false,wholeInverseVerified:false,executionAuthorized:false});
 }
 /** New control metadata leaves the historical retained-state projection unchanged. */
 public originalControlState():Readonly<{stage:Stage;publicationPending:boolean;journalTerminal:boolean;journalUnsettled:boolean}>{
  this.#current(true);const journal=this.#journal.retained(),outcome=journal.publicationPending?null:this.#journal.reservationOutcome();
  return Object.freeze({stage:this.#stage,publicationPending:journal.publicationPending,journalTerminal:this.#journalTerminal,
   journalUnsettled:journal.publicationPending||!this.#journalTerminal&&outcome!=="not-entered"&&outcome!=="conflict"});
 }
 public originalResult(result:CurrentFootprintInverseNativeDeleteColdUiAbsence):Readonly<{owner:CurrentFootprintInverseNativeDeleteColdUiOwner;absence:CurrentFootprintInverseNativeDeleteColdUiAbsence}>{
  this.#current(true);need(this.#absence===result&&this.#journalTerminal&&this.#owner!==null&&this.#terminated&&this.#release!==null,"ORIGINAL_COMPLETED_RESULT");
  requireOriginalCurrentFootprintInverseNativeDeleteColdUiAbsence(result,this.#owner);return Object.freeze({owner:this.#owner,absence:result});
 }
 public retainedFailure():unknown{this.#current(true);return this.#failure;}
}
Object.freeze(CurrentFootprintInverseNativeDeleteColdUiGeneration.prototype);Object.freeze(CurrentFootprintInverseNativeDeleteColdUiGeneration);
export function isOriginalCurrentFootprintInverseNativeDeleteColdUiDiagnosticOperation(operationId: string): Promise<boolean> {
  return admission.getStore()?.ownsDiagnosticOperation(operationId) ?? Promise.resolve(false);
}
export async function assertNoUnresolvedCurrentFootprintInverseNativeDeleteColdUis(): Promise<void> {
  for (const operation of await scanCurrentFootprintInverseNativeDeleteColdUiLaunchStates()) {
    need(operation.settled || await isOriginalCurrentFootprintInverseNativeDeleteColdUiDiagnosticOperation(operation.operationId), "UNRESOLVED_OTHER_COLD_UI");
  }
}
/** Original persistence issuance is rechecked before even this local
 * coordinator exists. Repeated calls preserve that same original controller. */
export function createCurrentFootprintInverseNativeDeleteColdUiGeneration(persistence:CurrentFootprintInverseNativeDeleteColdAbsence,owner:CurrentFootprintInverseNativeDeleteColdOwner):CurrentFootprintInverseNativeDeleteColdUiGeneration{
 requireOriginalCurrentFootprintInverseNativeDeleteColdAbsence(persistence,owner);
 const prior=generations.get(persistence);if(prior!==undefined){return prior;}
 const generation=new CurrentFootprintInverseNativeDeleteColdUiGeneration(INTERNAL,persistence,owner);generations.set(persistence,generation);Object.freeze(generation);return generation;
}

/** Original completed previous controller supplies no live owner adoption. */
export function createCurrentFootprintInverseNativeDeleteColdUiAfterColdGeneration(previous:CurrentFootprintInverseNativeDeleteColdGeneration):CurrentFootprintInverseNativeDeleteColdUiGeneration{
 const original=previous.originalCompletedColdManager();return createCurrentFootprintInverseNativeDeleteColdUiGeneration(original.absence,original.owner);
}
