/** One retained native DELETE cold generation. Only genuine released
 * persistence can select it; this module adds no public operation or authority
 * to adopt a supplied owner, checkpoint, source or cleanup binding. */
import {types} from "node:util";
import {requireOriginalCurrentFootprintInverseNativeDeletePersistenceResult} from "./current-footprint-inverse-native-delete-persistence.ts";
import type {CurrentFootprintInverseNativeDeletePersistenceResult} from "./current-footprint-inverse-native-delete-persistence.ts";
import type {CurrentFootprintInversePreparedCheckpoint} from "./current-footprint-inverse-prepared-checkpoint.ts";
import {prepareCurrentFootprintInverseNativeDeleteColdCheckpoint} from "./current-footprint-inverse-native-delete-cold-checkpoint.ts";
import type {CurrentFootprintInverseNativeDeleteColdCheckpoint} from "./current-footprint-inverse-native-delete-cold-checkpoint.ts";
import {captureCurrentFootprintInverseNativeDeleteColdAbsence,requireOriginalCurrentFootprintInverseNativeDeleteColdAbsence} from "./current-footprint-inverse-native-delete-cold-absence.ts";
import type {CurrentFootprintInverseNativeDeleteColdAbsence} from "./current-footprint-inverse-native-delete-cold-absence.ts";
import type {CurrentFootprintInverseNativeDeleteColdReadResult} from "./current-footprint-inverse-native-delete-cold-read-origin.ts";
import {CURRENT_FOOTPRINT_COPY_HELD_SAVED_CAPACITY as CAPACITY} from "./current-footprint-copy-held-saved-capacity.ts";
import {assertOriginalCurrentFootprintInverseNativeDeleteColdOwner,currentFootprintInverseNativeDeleteColdAllocationOutcome,originalCurrentFootprintInverseNativeDeleteColdTermination,startCurrentFootprintInverseNativeDeleteColdOwner} from "./current-footprint-inverse-v4-native-owner.ts";
import type {CurrentFootprintInverseNativeDeleteColdOwner,CurrentFootprintInverseNativeOwner} from "./current-footprint-inverse-v4-native-owner.ts";

type Persistence=ReturnType<typeof requireOriginalCurrentFootprintInverseNativeDeletePersistenceResult>;
const INTERNAL=Object.freeze({});
const generations=new WeakMap<CurrentFootprintInverseNativeDeletePersistenceResult,CurrentFootprintInverseNativeDeleteColdGeneration>();
const terminationLimit=CAPACITY.controls.cleanupCoreControls.termination;
const fixedStages={checkpoint:1,birth:1,read:1,window:1,close:1,observers:1,release:1,absence:1,abort:1} as const;
const stageLimit=terminationLimit+Object.values(fixedStages).reduce((total,value)=>total+value,0);
function need(value:boolean,code:string):asserts value{if(!value){throw new Error(`INVERSE_NATIVE_DELETE_COLD_GENERATION_${code}`);}}
/** Retains original work through normal closure and interruption. Native
 * dispatch stays inside the genuine cold Core owner and its fixed ledger. */
export class CurrentFootprintInverseNativeDeleteColdGeneration{
 readonly #persistence:CurrentFootprintInverseNativeDeletePersistenceResult;
 readonly #predecessor:CurrentFootprintInverseNativeOwner;
 readonly #prepared:CurrentFootprintInversePreparedCheckpoint;
 readonly #bindings:Persistence;
 readonly #pending:Promise<unknown>[]=[];
 readonly #original:Promise<unknown>[]=[];
 readonly #observed:Promise<void>[]=[];
 #run:Promise<CurrentFootprintInverseNativeDeleteColdAbsence>|null=null;
 #cleanup:Promise<void>|null=null;
 #preparing:Promise<CurrentFootprintInverseNativeDeleteColdCheckpoint>|null=null;
 #checkpoint:CurrentFootprintInverseNativeDeleteColdCheckpoint|null=null;
 #birth:Promise<CurrentFootprintInverseNativeDeleteColdOwner>|null=null;
 #owner:CurrentFootprintInverseNativeDeleteColdOwner|null=null;
 #read:Promise<CurrentFootprintInverseNativeDeleteColdReadResult>|null=null;
 #readResult:CurrentFootprintInverseNativeDeleteColdReadResult|null=null;
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
 #absence:CurrentFootprintInverseNativeDeleteColdAbsence|null=null;
 #stopped=false;
 #failed=false;
 #failure:unknown;
 #cleaned=false;
 public constructor(internal:object,persistence:CurrentFootprintInverseNativeDeletePersistenceResult,owner:CurrentFootprintInverseNativeOwner,prepared:CurrentFootprintInversePreparedCheckpoint){
  need(internal===INTERNAL,"INTERNAL_FACTORY");
  this.#bindings=requireOriginalCurrentFootprintInverseNativeDeletePersistenceResult(persistence,owner,prepared);
  this.#persistence=persistence;this.#predecessor=owner;this.#prepared=prepared;
 }
 #remember(cause:unknown):void{if(!this.#failed){this.#failed=true;this.#failure=cause;}}
 #current(cleanup=false):void{
  const actual=requireOriginalCurrentFootprintInverseNativeDeletePersistenceResult(this.#persistence,this.#predecessor,this.#prepared);
  need(actual.origin===this.#bindings.origin&&actual.bindings===this.#bindings.bindings&&actual.snapshot===this.#bindings.snapshot&&actual.delta===this.#bindings.delta&&actual.data===this.#bindings.data,"ORIGINAL_PERSISTENCE");
  if(!cleanup){need(!this.#stopped&&!this.#failed,"NORMAL_ENDED");}
  if(this.#owner!==null){assertOriginalCurrentFootprintInverseNativeDeleteColdOwner(this.#owner);}
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
 public start():Promise<CurrentFootprintInverseNativeDeleteColdAbsence>{
  this.#current(true);if(this.#run!==null){return this.#run;}
  const gate=Promise.withResolvers<null>();
  const pending=(async():Promise<CurrentFootprintInverseNativeDeleteColdAbsence>=>{
   await gate.promise;this.#current();
   this.#preparing=this.#call(false,()=>prepareCurrentFootprintInverseNativeDeleteColdCheckpoint(this.#persistence,this.#predecessor,this.#prepared));
   const checkpoint=await this.#preparing;this.#checkpoint=checkpoint;this.#current();
   this.#birth=this.#call(false,()=>startCurrentFootprintInverseNativeDeleteColdOwner(checkpoint));
   const owner=await this.#birth;this.#owner=owner;this.#current();
   this.#read=this.#call(false,()=>owner.readFootprintInverseNativeDeleteCold());
   this.#readResult=await this.#read;this.#current();
   this.#window=this.#call(false,()=>owner.observeApplicationWindow());const hwnd=await this.#window;this.#current();need(hwnd!==null,"ORIGINAL_WINDOW");
   this.#close=this.#call(false,()=>owner.requestNormalClose(hwnd));await this.#close;this.#current();
   await this.#observeExit(false);this.#current();
   await this.#endObservers();this.#current();
   await this.#releaseOwner("closed");this.#current();
   const termination=originalCurrentFootprintInverseNativeDeleteColdTermination(owner);
   const result=await this.#call(false,()=>captureCurrentFootprintInverseNativeDeleteColdAbsence(this.#readResultRequired(),owner,termination));this.#current();
   requireOriginalCurrentFootprintInverseNativeDeleteColdAbsence(result,owner);this.#absence=result;return result;
  })();
  this.#run=pending;this.#observe(pending);gate.resolve(null);return pending;
 }
 #readResultRequired():CurrentFootprintInverseNativeDeleteColdReadResult{need(this.#readResult!==null,"ORIGINAL_READ");return this.#readResult;}
 #originalOwner():CurrentFootprintInverseNativeDeleteColdOwner{this.#current(true);need(this.#owner!==null,"ORIGINAL_OWNER");return this.#owner;}
 async #observeExit(cleanup:boolean):Promise<void>{
  const owner=this.#originalOwner();
  while(!this.#terminated){
   if(this.#termination===null){
    need(this.#terminationCalls<terminationLimit,"TERMINATION_BOUND");this.#terminationCalls+=1;
    this.#termination=Object.freeze({pending:this.#call(true,()=>cleanup?owner.observeFootprintInverseNativeDeleteColdTerminationAfterAbort():owner.observeTermination()),ordinal:this.#terminationCalls});
   }
   const original=this.#termination;const exited=await original.pending;this.#current(true);
   need(this.#termination===original||this.#termination===null||this.#termination.ordinal>original.ordinal,"ORIGINAL_TERMINATION_PENDING");
   if(exited){originalCurrentFootprintInverseNativeDeleteColdTermination(owner);this.#terminated=true;return;}
   if(this.#termination===original){this.#termination=null;}if(!cleanup){this.#current();}
  }
 }
 #endObservers():Promise<void>{
  const owner=this.#originalOwner();need(this.#terminated,"ORIGINAL_EXIT_REQUIRED");
  this.#end??=this.#call(true,()=>owner.endFootprintInverseNativeDeleteColdAfterOriginalExit());return this.#end;
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
   const outcome=currentFootprintInverseNativeDeleteColdAllocationOutcome(this.#checkpoint);
   if(outcome.owner===null){need(outcome.state==="not-attempted"||outcome.state==="no-resource","BIRTH_UNRESOLVED");}
   else{assertOriginalCurrentFootprintInverseNativeDeleteColdOwner(outcome.owner);this.#owner=outcome.owner;}
  }
 }
 /** Cut off normal work synchronously. Abort/exit is allowed during this same
  * original read; the read joins after observer retirement, never before it. */
 public cleanup():Promise<void>{
  this.#current(true);this.#stopped=true;if(this.#cleanup!==null){return this.#cleanup;}
  const gate=Promise.withResolvers<null>();
  const pending=(async():Promise<void>=>{
   await gate.promise;await this.#recoverBirth();this.#current(true);
   const owner=this.#owner;
   if(owner===null){await Promise.allSettled(this.#pending);if(this.#run!==null){await Promise.allSettled([this.#run]);}this.#cleaned=true;return;}
   let state=owner.status();
   if(this.#release!==null){await this.#release;this.#current(true);state=owner.status();}
   if(!state.released){
    this.#reservation??=owner.reserveFootprintInverseNativeDeleteColdCleanup();
    if(state.binding===null&&state.launchConsumed&&this.#read!==null){await Promise.allSettled([this.#read]);this.#current(true);state=owner.status();}
    if(!state.launchConsumed){await this.#releaseOwner("unlaunched");}
    else if(state.binding===null){need(state.noProcessCleanupAvailable,"ORIGINAL_LAUNCH_UNRESOLVED");await this.#releaseOwner("no-process");}
    else{
     const errors:unknown[]=[];
     if(!this.#terminated){
      const reservation=this.#reservation;need(reservation!==null,"ORIGINAL_CLEANUP_RESERVATION");
      this.#abort??=this.#call(true,()=>owner.dispatchFootprintInverseNativeDeleteColdCleanupAbort(reservation));
      try{await this.#abort;}catch(error){errors.push(error);}
      try{await this.#observeExit(true);}catch(error){errors.push(error);}
     }
     need(this.#terminated,"ORIGINAL_ROOT_AND_JOB_RETAINED");
     try{await this.#endObservers();}catch(error){errors.push(error);}
     await Promise.allSettled([...(this.#read===null?[]:[this.#read]),...(this.#window===null?[]:[this.#window]),...(this.#close===null?[]:[this.#close])]);
     try{await this.#releaseOwner("closed");}catch(error){errors.push(error);}
     await Promise.allSettled(this.#pending);if(this.#run!==null){await Promise.allSettled([this.#run]);}
     if(errors.length>0){throw new AggregateError(errors,"INVERSE_NATIVE_DELETE_COLD_GENERATION_CLEANUP");}
    }
   }
   await Promise.allSettled(this.#pending);if(this.#run!==null){await Promise.allSettled([this.#run]);}
   this.#current(true);const closed=owner.status();need(closed.released&&closed.helperClosed&&owner.observeFootprintCopyRelease()==="released","ORIGINAL_HELPER_EXIT");this.#cleaned=true;
  })();
  this.#cleanup=pending;this.#observe(pending);
  try{if(this.#owner!==null&&this.#release===null&&!this.#owner.status().released){this.#reservation=this.#owner.reserveFootprintInverseNativeDeleteColdCleanup();}gate.resolve(null);}
  catch(error){gate.reject(error);}
  return pending;
 }
 public retained():Readonly<{profile:"private.current-footprint-inverse-native-delete-cold-generation-state.v1";started:boolean;cleanupStarted:boolean;failed:boolean;cleaned:boolean;ownerRetained:boolean;terminated:boolean;released:boolean;helperClosed:boolean;nativeManagerColdAbsenceVerified:boolean;publicSdkParity:false;wholeInverseVerified:false;executionAuthorized:false}>{
  this.#current(true);const state=this.#owner?.status();
  return Object.freeze({profile:"private.current-footprint-inverse-native-delete-cold-generation-state.v1",started:this.#run!==null,cleanupStarted:this.#cleanup!==null,failed:this.#failed,cleaned:this.#cleaned,ownerRetained:this.#owner!==null,terminated:this.#terminated,released:state?.released??false,helperClosed:state?.helperClosed??false,nativeManagerColdAbsenceVerified:this.#absence!==null,publicSdkParity:false,wholeInverseVerified:false,executionAuthorized:false});
 }
 /** Completed original facts only; another generation still requires its
  * own checkpoint, factory, helper and from-birth reservation. */
 public originalCompletedColdManager():Readonly<{absence:CurrentFootprintInverseNativeDeleteColdAbsence;owner:CurrentFootprintInverseNativeDeleteColdOwner}>{
  this.#current(true);need(this.#run!==null&&this.#absence!==null&&this.#owner!==null&&!this.#failed,"ORIGINAL_COMPLETED_RESULT");
  requireOriginalCurrentFootprintInverseNativeDeleteColdAbsence(this.#absence,this.#owner);return Object.freeze({absence:this.#absence,owner:this.#owner});
 }
 public retainedFailure():unknown{this.#current(true);return this.#failure;}
}
Object.freeze(CurrentFootprintInverseNativeDeleteColdGeneration.prototype);Object.freeze(CurrentFootprintInverseNativeDeleteColdGeneration);
/** Original persistence issuance is rechecked before even this local
 * coordinator exists. Repeated calls preserve that same original controller. */
export function createCurrentFootprintInverseNativeDeleteColdGeneration(persistence:CurrentFootprintInverseNativeDeletePersistenceResult,owner:CurrentFootprintInverseNativeOwner,prepared:CurrentFootprintInversePreparedCheckpoint):CurrentFootprintInverseNativeDeleteColdGeneration{
 requireOriginalCurrentFootprintInverseNativeDeletePersistenceResult(persistence,owner,prepared);
 const prior=generations.get(persistence);if(prior!==undefined){return prior;}
 const generation=new CurrentFootprintInverseNativeDeleteColdGeneration(INTERNAL,persistence,owner,prepared);generations.set(persistence,generation);Object.freeze(generation);return generation;
}
