/** Retain the actual V4 MainSource through its original upload/caller,
 * preferences, closed SQL, released helper and separate cold owner.
 * This internal composition creates no public consent or owner grant. */
/* oxlint-disable import/max-dependencies -- One original durability coordinator joins distinct Core, MainSource, persistence and cold registries; callers provide no implementations or derived data. */
import {types} from "node:util";
import type {CurrentFootprintInversePreparedCheckpoint} from "./current-footprint-inverse-prepared-checkpoint.ts";
import type {CurrentFootprintInverseNativeDeleteMainSource} from "./current-footprint-inverse-native-delete-main-source.ts";
import type {CurrentFootprintInverseNativeDeleteCallerResult} from "./current-footprint-inverse-native-delete-caller-origin.ts";
import type {CurrentFootprintInverseNativeDeletePoststateResult} from "./current-footprint-inverse-native-delete-poststate-origin.ts";
import type {CurrentFootprintInverseNativeDeletePersistenceOrigin} from "./current-footprint-inverse-native-delete-persistence-origin.ts";
import {captureCurrentFootprintInverseNativeDeletePersistence,requireOriginalCurrentFootprintInverseNativeDeletePersistenceResult} from "./current-footprint-inverse-native-delete-persistence.ts";
import type {CurrentFootprintInverseNativeDeletePersistenceResult} from "./current-footprint-inverse-native-delete-persistence.ts";
import {createCurrentFootprintInverseNativeDeleteColdGeneration} from "./current-footprint-inverse-native-delete-cold-generation.ts";
import type {CurrentFootprintInverseNativeDeleteColdGeneration} from "./current-footprint-inverse-native-delete-cold-generation.ts";
import type {CurrentFootprintInverseNativeDeleteColdAbsence} from "./current-footprint-inverse-native-delete-cold-absence.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_CONTINUATION_V4_ACTION_LIMITS as ACTIONS} from "./current-footprint-inverse-native-continuation-v4-profile.ts";
import {assertOriginalCurrentFootprintInverseNativeContinuationV4Owner,assertOriginalCurrentFootprintInverseTermination,originalCurrentFootprintInversePreparedCheckpoint,originalCurrentFootprintInverseTermination,requireOriginalCurrentFootprintInverseNativeDeleteMainSourceForOwner} from "./current-footprint-inverse-v4-native-owner.ts";
import type {CurrentFootprintInverseNativeOwner} from "./current-footprint-inverse-v4-native-owner.ts";

export interface CurrentFootprintInverseNativeDeleteSavedResult{
 readonly profile:"private.current-footprint-inverse-native-delete-saved-result.v1";
 readonly targetUuid:string;readonly persistenceVerified:true;readonly nativeManagerColdAbsenceVerified:true;
 readonly selectedPreferencesUnchanged:true;readonly originalWriterAndColdHelpersReleased:true;
 readonly explicitSaveAttempts:0;readonly nativeUiTaskAbsenceVerified:false;readonly publicSdkParity:false;
 readonly wholeInverseVerified:false;readonly executionAuthorized:false;
}
type Bindings=ReturnType<typeof requireOriginalCurrentFootprintInverseNativeDeleteMainSourceForOwner>;
const INTERNAL=Object.freeze({});
const originals=new WeakMap<CurrentFootprintInverseNativeDeleteMainSource,CurrentFootprintInverseNativeDeleteSavedGeneration>();
const results=new WeakMap<CurrentFootprintInverseNativeDeleteSavedResult,CurrentFootprintInverseNativeDeleteSavedGeneration>();
const stageLimit=12+ACTIONS.termination;
const precedingTerminationSamples=ACTIONS.termination-1;
function need(value:boolean,code:string):asserts value{if(!value){throw new Error(`INVERSE_NATIVE_DELETE_SAVED_GENERATION_${code}`);}}
/** The genuine source already retains the held delete, body, before inventory
 * and same Main runner. No owner, callback or SQL can be substituted. */
export class CurrentFootprintInverseNativeDeleteSavedGeneration{
 readonly #source:CurrentFootprintInverseNativeDeleteMainSource;
 readonly #owner:CurrentFootprintInverseNativeOwner;
 readonly #prepared:CurrentFootprintInversePreparedCheckpoint;
 readonly #bindings:Bindings;
 readonly #pending:Promise<unknown>[]=[];
 readonly #original:Promise<unknown>[]=[];
 readonly #observed:Promise<void>[]=[];
 #run:Promise<CurrentFootprintInverseNativeDeleteSavedResult>|null=null;
 #cleanup:Promise<void>|null=null;
 #flow:ReturnType<CurrentFootprintInverseNativeOwner["continueFootprintInverseNativeDeleteLocalPublication"]>|null=null;
 #caller:Promise<CurrentFootprintInverseNativeDeleteCallerResult>|null=null;
 #poststate:Promise<CurrentFootprintInverseNativeDeletePoststateResult>|null=null;
 #persistenceOrigin:Promise<CurrentFootprintInverseNativeDeletePersistenceOrigin>|null=null;
 #origin:CurrentFootprintInverseNativeDeletePersistenceOrigin|null=null;
 #window:Promise<string|null>|null=null;
 #close:Promise<void>|null=null;
 #closing=false;
 #termination:Readonly<{pending:Promise<boolean>;ordinal:number}>|null=null;
 #terminationCalls=0;
 #terminated=false;
 #end:Promise<void>|null=null;
 #capture:Promise<CurrentFootprintInverseNativeDeletePersistenceResult>|null=null;
 #persistence:CurrentFootprintInverseNativeDeletePersistenceResult|null=null;
 #release:Promise<unknown>|null=null;
 #abort:Promise<void>|null=null;
 #cold:CurrentFootprintInverseNativeDeleteColdGeneration|null=null;
 #coldRun:Promise<CurrentFootprintInverseNativeDeleteColdAbsence>|null=null;
 #absence:CurrentFootprintInverseNativeDeleteColdAbsence|null=null;
 #result:CurrentFootprintInverseNativeDeleteSavedResult|null=null;
 #stopped=false;
 #failed=false;
 #failure:unknown;
 #cleaned=false;
 public constructor(internal:object,source:CurrentFootprintInverseNativeDeleteMainSource,owner:CurrentFootprintInverseNativeOwner,prepared:CurrentFootprintInversePreparedCheckpoint){
  need(internal===INTERNAL,"INTERNAL_FACTORY");
  this.#bindings=requireOriginalCurrentFootprintInverseNativeDeleteMainSourceForOwner(source,owner,prepared);
  this.#source=source;this.#owner=owner;this.#prepared=prepared;
 }
 #remember(cause:unknown):void{if(!this.#failed){this.#failed=true;this.#failure=cause;}}
 #current(cleanup=false):void{
  assertOriginalCurrentFootprintInverseNativeContinuationV4Owner(this.#owner);
  need(originalCurrentFootprintInversePreparedCheckpoint(this.#owner)===this.#prepared&&this.#bindings.owner===this.#owner&&this.#bindings.prepared===this.#prepared,"ORIGINAL_SOURCE");
  if(!cleanup){need(!this.#stopped&&!this.#failed,"NORMAL_ENDED");}
  if(this.#terminated){this.#bindings.assertOriginalExit();}
  else if(!cleanup&&!this.#closing){need(requireOriginalCurrentFootprintInverseNativeDeleteMainSourceForOwner(this.#source,this.#owner,this.#prepared)===this.#bindings,"ORIGINAL_CURRENT_SOURCE");}
 }
 #observe(pending:Promise<unknown>):void{
  const joined=(async():Promise<void>=>{try{await pending;}catch(error){this.#remember(error);}})();this.#observed.push(joined);
 }
 #call<T>(cleanup:boolean,start:()=>Promise<T>):Promise<T>{
  need(this.#pending.length<stageLimit&&this.#original.length<stageLimit,"FINITE_STAGES");
  const gate=Promise.withResolvers<null>();
  const pending=(async():Promise<T>=>{
   await gate.promise;this.#current(cleanup);const original=start();need(types.isPromise(original),"ORIGINAL_PROMISE");
   this.#original.push(original);this.#observe(original);const value=await original;this.#current(cleanup);return value;
  })();this.#pending.push(pending);this.#observe(pending);gate.resolve(null);return pending;
 }
 public start():Promise<CurrentFootprintInverseNativeDeleteSavedResult>{
  this.#current(true);if(this.#run!==null){return this.#run;}
  const gate=Promise.withResolvers<null>();
  const pending=(async():Promise<CurrentFootprintInverseNativeDeleteSavedResult>=>{
   await gate.promise;this.#current();
   this.#flow=this.#call(false,()=>this.#owner.continueFootprintInverseNativeDeleteLocalPublication(this.#source));await this.#flow;this.#current();
   this.#caller=this.#call(false,()=>this.#owner.completeFootprintInverseNativeDeleteCaller(this.#source));const caller=await this.#caller;this.#current();
   this.#poststate=this.#call(false,()=>this.#owner.observeFootprintInverseNativeDeletePoststate(this.#source,caller));const poststate=await this.#poststate;this.#current();
   this.#persistenceOrigin=this.#call(false,()=>this.#owner.prepareFootprintInverseNativeDeletePersistence(this.#source,poststate));this.#origin=await this.#persistenceOrigin;this.#current();
   this.#window=this.#call(false,()=>this.#owner.observeApplicationWindow());const hwnd=await this.#window;this.#current();need(hwnd!==null,"ORIGINAL_WINDOW");
   this.#close=this.#call(false,()=>{this.#closing=true;return this.#owner.requestNormalClose(hwnd);});await this.#close;this.#current();
   await this.#observeExit(false);this.#current();
   await this.#endObservers();this.#current();
   const origin=this.#origin;need(origin!==null,"ORIGINAL_PERSISTENCE_ORIGIN");const termination=originalCurrentFootprintInverseTermination(this.#owner);
   this.#capture=this.#call(false,()=>captureCurrentFootprintInverseNativeDeletePersistence(origin,this.#owner,this.#prepared,termination));this.#persistence=await this.#capture;this.#current();
   const persistence=requireOriginalCurrentFootprintInverseNativeDeletePersistenceResult(this.#persistence,this.#owner,this.#prepared);
   await this.#releaseOwner();this.#current();need(this.#owner.status().released&&this.#owner.status().helperClosed,"ORIGINAL_WRITER_HELPER_EXIT");
   this.#cold=createCurrentFootprintInverseNativeDeleteColdGeneration(this.#persistence,this.#owner,this.#prepared);
   this.#coldRun=this.#call(false,()=>{const cold=this.#cold;need(cold!==null,"ORIGINAL_COLD_GENERATION");return cold.start();});this.#absence=await this.#coldRun;this.#current();
   need(this.#absence.targetUuid===persistence.data.targetUuid&&this.#absence.maximumTicket===persistence.data.maximumTicket,"ORIGINAL_DURABLE_TARGET");
   const result:CurrentFootprintInverseNativeDeleteSavedResult=Object.freeze({profile:"private.current-footprint-inverse-native-delete-saved-result.v1",targetUuid:persistence.data.targetUuid,persistenceVerified:true,nativeManagerColdAbsenceVerified:true,selectedPreferencesUnchanged:true,originalWriterAndColdHelpersReleased:true,explicitSaveAttempts:0,nativeUiTaskAbsenceVerified:false,publicSdkParity:false,wholeInverseVerified:false,executionAuthorized:false});
   this.#result=result;results.set(result,this);return result;
  })();this.#run=pending;this.#observe(pending);gate.resolve(null);return pending;
 }
 async #observeExit(cleanup:boolean):Promise<void>{
  while(!this.#terminated){
   if(this.#termination===null){
    need(this.#terminationCalls<precedingTerminationSamples,"TERMINATION_BOUND");this.#terminationCalls+=1;
    this.#termination=Object.freeze({pending:this.#call(true,()=>cleanup?this.#owner.observeFootprintInverseNativeDeleteSavedTerminationAfterAbort(this.#source):this.#owner.observeTermination()),ordinal:this.#terminationCalls});
   }
   const original=this.#termination;const exited=await original.pending;this.#current(true);
   need(this.#termination===original||this.#termination===null||this.#termination.ordinal>original.ordinal,"ORIGINAL_TERMINATION");
   if(exited){const token=originalCurrentFootprintInverseTermination(this.#owner);assertOriginalCurrentFootprintInverseTermination(this.#owner,token);this.#terminated=true;return;}
   if(this.#termination===original){this.#termination=null;}if(!cleanup){this.#current();}
  }
 }
 #endObservers():Promise<void>{
  need(this.#terminated,"ORIGINAL_JOB_EXIT");this.#end??=this.#call(true,()=>this.#owner.endFootprintInverseNativeDeleteSavedAfterOriginalExit(this.#source));return this.#end;
 }
 #releaseOwner():Promise<unknown>{
  need(this.#terminated,"ORIGINAL_JOB_EXIT");this.#release??=this.#call(true,()=>this.#owner.releaseClosed());return this.#release;
 }
 /** Stop before the first await, dispatch only this same original Job's abort,
  * retire all observers after exit, then join work and release. */
 public stopOriginalNormal():void{this.#current(true);this.#stopped=true;}
 public cleanup():Promise<void>{
  this.stopOriginalNormal();if(this.#cleanup!==null){return this.#cleanup;}
  const gate=Promise.withResolvers<null>();
  const pending=(async():Promise<void>=>{
   await gate.promise;this.#current(true);const failures:unknown[]=[];
   if(this.#cold!==null){
    try{await this.#cold.cleanup();}catch(error){failures.push(error);}
    const state=this.#cold.retained();
    if(state.ownerRetained&&(!state.released||!state.helperClosed)){throw new AggregateError(failures,"INVERSE_NATIVE_DELETE_SAVED_COLD_OWNER_RETAINED");}
   }
   if(!this.#owner.status().released){
    if(!this.#terminated){
     if(this.#abort!==null){try{await this.#abort;}catch(error){failures.push(error);}}
     try{await this.#observeExit(true);}catch(error){failures.push(error);}
    }
    need(this.#terminated,"ORIGINAL_ROOT_AND_JOB_RETAINED");
    try{await this.#endObservers();}catch(error){failures.push(error);}
    await Promise.allSettled([...(this.#flow===null?[]:[this.#flow]),...(this.#caller===null?[]:[this.#caller]),...(this.#poststate===null?[]:[this.#poststate]),...(this.#persistenceOrigin===null?[]:[this.#persistenceOrigin]),...(this.#window===null?[]:[this.#window]),...(this.#close===null?[]:[this.#close]),...(this.#capture===null?[]:[this.#capture])]);
    try{await this.#releaseOwner();}catch(error){failures.push(error);}
   }
   await Promise.allSettled(this.#pending);if(this.#run!==null){await Promise.allSettled([this.#run]);}
   this.#current(true);const status=this.#owner.status();need(status.released&&status.helperClosed,"ORIGINAL_HELPER_EXIT");
   if(failures.length>0){throw new AggregateError(failures,"INVERSE_NATIVE_DELETE_SAVED_GENERATION_CLEANUP");}this.#cleaned=true;
  })();this.#cleanup=pending;this.#observe(pending);
  try{
   if(!this.#terminated&&!this.#owner.status().released){const abort=this.#owner.abortFootprintInverseV4(true);need(types.isPromise(abort),"ORIGINAL_ABORT_PROMISE");this.#abort=abort;this.#observe(abort);}
   gate.resolve(null);
  }catch(error){gate.reject(error);}
  return pending;
 }
 public requireOriginalArguments(source:CurrentFootprintInverseNativeDeleteMainSource,owner:CurrentFootprintInverseNativeOwner,prepared:CurrentFootprintInversePreparedCheckpoint):void{
  this.#current(true);need(this.#source===source&&this.#owner===owner&&this.#prepared===prepared,"ORIGINAL_ARGUMENTS");
 }
 public originalResult(result:CurrentFootprintInverseNativeDeleteSavedResult):Readonly<{owner:CurrentFootprintInverseNativeOwner;prepared:CurrentFootprintInversePreparedCheckpoint;source:CurrentFootprintInverseNativeDeleteMainSource;persistence:CurrentFootprintInverseNativeDeletePersistenceResult;absence:CurrentFootprintInverseNativeDeleteColdAbsence}>{
  this.#current(true);need(this.#result===result&&results.get(result)===this&&this.#persistence!==null&&this.#absence!==null,"ORIGINAL_RESULT");
  return Object.freeze({owner:this.#owner,prepared:this.#prepared,source:this.#source,persistence:this.#persistence,absence:this.#absence});
 }
 /** A separate continuation may select only the original completed cold generation.
  * This reader neither widens the historical saved result nor starts new work. */
 public originalCompletedColdGeneration(result:CurrentFootprintInverseNativeDeleteSavedResult):CurrentFootprintInverseNativeDeleteColdGeneration{
  const original=this.originalResult(result);need(this.#run!==null&&!this.#failed&&this.#terminated&&this.#cold!==null&&this.#absence!==null,"ORIGINAL_COMPLETED_COLD");
  const status=this.#owner.status();const cold=this.#cold.originalCompletedColdManager();
  need(status.released&&status.helperClosed&&cold.absence===original.absence&&cold.absence===this.#absence,"ORIGINAL_RELEASED_COLD");return this.#cold;
 }
 public retained():Readonly<{profile:"private.current-footprint-inverse-native-delete-saved-generation-state.v1";started:boolean;cleanupStarted:boolean;failed:boolean;cleaned:boolean;originalRootAndJobExited:boolean;originalHelperClosed:boolean;persistenceVerified:boolean;nativeManagerColdAbsenceVerified:boolean;wholeInverseVerified:false;executionAuthorized:false}>{
  this.#current(true);return Object.freeze({profile:"private.current-footprint-inverse-native-delete-saved-generation-state.v1",started:this.#run!==null,cleanupStarted:this.#cleanup!==null,failed:this.#failed,cleaned:this.#cleaned,originalRootAndJobExited:this.#terminated,originalHelperClosed:this.#owner.status().helperClosed,persistenceVerified:this.#persistence!==null,nativeManagerColdAbsenceVerified:this.#absence!==null,wholeInverseVerified:false,executionAuthorized:false});
 }
 public retainedFailure():unknown{this.#current(true);return this.#failure;}
}
Object.freeze(CurrentFootprintInverseNativeDeleteSavedGeneration.prototype);Object.freeze(CurrentFootprintInverseNativeDeleteSavedGeneration);
export function createCurrentFootprintInverseNativeDeleteSavedGeneration(source:CurrentFootprintInverseNativeDeleteMainSource,owner:CurrentFootprintInverseNativeOwner,prepared:CurrentFootprintInversePreparedCheckpoint):CurrentFootprintInverseNativeDeleteSavedGeneration{
 const retained=originals.get(source);if(retained!==undefined){retained.requireOriginalArguments(source,owner,prepared);return retained;}
 requireOriginalCurrentFootprintInverseNativeDeleteMainSourceForOwner(source,owner,prepared);
 const generation=new CurrentFootprintInverseNativeDeleteSavedGeneration(INTERNAL,source,owner,prepared);originals.set(source,generation);Object.freeze(generation);return generation;
}
export function requireOriginalCurrentFootprintInverseNativeDeleteSavedResult(result:CurrentFootprintInverseNativeDeleteSavedResult):ReturnType<CurrentFootprintInverseNativeDeleteSavedGeneration["originalResult"]>{
 const generation=results.get(result);need(generation!==undefined,"ORIGINAL_ISSUANCE");return generation.originalResult(result);
}

export function requireOriginalCurrentFootprintInverseNativeDeleteSavedColdGeneration(result:CurrentFootprintInverseNativeDeleteSavedResult):CurrentFootprintInverseNativeDeleteColdGeneration{
 const generation=results.get(result);need(generation!==undefined,"ORIGINAL_ISSUANCE");return generation.originalCompletedColdGeneration(result);
}
