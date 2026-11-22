/** Original full saved preparation to one separately born V4 inverse owner.
 * The actual opening/GET/reference/DEL prefix stays held before first upload.
 * This fixed composition adds no public consent, executable input or adopter. */
/* oxlint-disable import/max-dependencies -- One original generation composes fixed native, preparation, cache, startup and saved-generation registries; no caller implementations or wire programs are accepted. */
import {types} from "node:util";
import {requireOriginalCurrentFootprintInverseFullPreparation} from "./current-footprint-inverse-full-preparation.ts";
import type {CurrentFootprintInverseFullPreparation} from "./current-footprint-inverse-full-preparation.ts";
import {observeOriginalCurrentFootprintInverseCaches} from "./current-footprint-inverse-v4-cache-observer.ts";
import {CURRENT_PCB_209_OPENING_SCRIPTS} from "./current-pcb-209-opening-profile.ts";
import {selectCurrentPcb209StartPage,selectCurrentPcb209StartPageFrame} from "./current-pcb-209-start-page-selection.ts";
import {CURRENT_FOOTPRINT_INVERSE_COLD_STEP_ROLES,currentFootprintInverseColdStepBudget} from "./current-footprint-inverse-cold-step-protocol.ts";
import {CURRENT_FOOTPRINT_INVERSE_MODEL_STEP_ROLES,currentFootprintInverseModelStepBudget} from "./current-footprint-inverse-model-step-protocol.ts";
import type {CurrentFootprintInverseStartupIdle} from "./current-footprint-inverse-model-step-protocol.ts";
import type {CurrentFootprintInverseColdHeld} from "./current-footprint-inverse-startup-origin.ts";
import type {CurrentFootprintInverseWorkerOrigin} from "./current-footprint-inverse-v4-worker-origin.ts";
import type {CurrentFootprintInverseBootstrapHeld} from "./current-footprint-inverse-bootstrap-origin.ts";
import type {CurrentFootprintInverseNativeDeleteMainSource} from "./current-footprint-inverse-native-delete-main-source.ts";
import {createCurrentFootprintInverseNativeDeleteSavedGeneration} from "./current-footprint-inverse-native-delete-saved-generation.ts";
import type {CurrentFootprintInverseNativeDeleteSavedGeneration} from "./current-footprint-inverse-native-delete-saved-generation.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_CONTINUATION_V4_ACTION_LIMITS as ACTIONS} from "./current-footprint-inverse-native-continuation-v4-profile.ts";
import {assertOriginalCurrentFootprintInverseFullNativeContinuationV4Owner,assertOriginalCurrentFootprintInverseTermination,currentFootprintInverseFullAllocationOutcome,originalCurrentFootprintInversePreparedCheckpoint,originalCurrentFootprintInverseTermination,requireOriginalCurrentFootprintInverseColdHeld,requireOriginalCurrentFootprintInverseNativeDeleteMainSourceForOwner,requireOriginalCurrentFootprintInverseStartupIdle,startCurrentFootprintInverseFullNativeContinuationV4Owner} from "./current-footprint-inverse-v4-native-owner.ts";
import type {CurrentFootprintInverseNativeOwner} from "./current-footprint-inverse-v4-native-owner.ts";

export interface CurrentFootprintInverseFullNativeOpeningResult{readonly profile:"private.current-footprint-inverse-full-native-opening-result.v1"}
type Original=ReturnType<typeof requireOriginalCurrentFootprintInverseFullPreparation>;
const INTERNAL=Object.freeze({});
const generations=new WeakMap<CurrentFootprintInverseFullPreparation,CurrentFootprintInverseFullNativeGeneration>();
const results=new WeakMap<CurrentFootprintInverseFullNativeOpeningResult,CurrentFootprintInverseFullNativeGeneration>();
const fixedRoles=Object.freeze(["birth","launch","main","browser","frames","ui","preflight","cache-origin","cache-read","cache-backup","cache-absence","flow-plan","startup-plan","row-plan","polling-intent","library-intent","registration","worker-arm","construction-arm","navigation","source-held","construction","bootstrap","producers","cold-arm","callbacks","initial-cache","initial-sync","timer","library","cold-ingress","public-service","delete-worker","native-intent","native-bootstrap","qualification","get-ready","get-call","get-dependencies","get-callback","get-manager","get-channel","get-job","get-worker","get-result","reference-ready","pcb-call","pcb-dependencies","pcb-callback","pcb-manager","pcb-channel","pcb-job","pcb-worker","pcb-result","schematic-call","schematic-result","derived-call","derived-job","derived-worker","derived-result","device-call","device-job","device-worker","device-result","delete-call","delete-rpc","delete-job","clock-registration","clock","serialization","publication","main-source","cleanup-abort","cleanup-end","cleanup-release"] as const);
const precedingTerminationSamples=ACTIONS.termination-1;
function need(value:boolean,code:string):asserts value{if(!value){throw new Error(`INVERSE_FULL_NATIVE_GENERATION_${code}`);}}
/** Every native method is selected in source below. A stage name is retained
 * metadata only; no operation/program/callback table is read from JSON. */
export class CurrentFootprintInverseFullNativeGeneration{
 readonly #prepared:CurrentFootprintInverseFullPreparation;
 readonly #original:Original;
 readonly #maximumSteps:number;
 readonly #pending:Promise<unknown>[]=[];
 readonly #actual:Promise<unknown>[]=[];
 readonly #observed:Promise<void>[]=[];
 readonly #roles=new Set<string>();
 #run:Promise<CurrentFootprintInverseFullNativeOpeningResult>|null=null;
 #cleanup:Promise<void>|null=null;
 #birth:Promise<CurrentFootprintInverseNativeOwner>|null=null;
 #birthOriginal:Promise<CurrentFootprintInverseNativeOwner>|null=null;
 #owner:CurrentFootprintInverseNativeOwner|null=null;
 #launch:ReturnType<CurrentFootprintInverseNativeOwner["startFootprintInverseFullGeneration"]>|null=null;
 #navigation:ReturnType<CurrentFootprintInverseNativeOwner["openFootprintInverseProject"]>|null=null;
 #sourceOrigin:CurrentFootprintInverseWorkerOrigin|null=null;
 #bootstrap:CurrentFootprintInverseBootstrapHeld|null=null;
 #source:CurrentFootprintInverseNativeDeleteMainSource|null=null;
 #saved:CurrentFootprintInverseNativeDeleteSavedGeneration|null=null;
 #result:CurrentFootprintInverseFullNativeOpeningResult|null=null;
 #reservation:object|null=null;
 #abort:Promise<void>|null=null;
 #termination:Readonly<{pending:Promise<boolean>;ordinal:number}>|null=null;
 #terminationCalls=0;
 #terminated=false;
 #end:Promise<void>|null=null;
 #release:Promise<unknown>|null=null;
 #releaseKind:"closed"|"unlaunched"|"no-process"|null=null;
 #stopped=false;
 #failed=false;
 #failure:unknown;
 #cleaned=false;
 public constructor(internal:object,prepared:CurrentFootprintInverseFullPreparation){
  need(internal===INTERNAL,"INTERNAL_FACTORY");this.#original=requireOriginalCurrentFootprintInverseFullPreparation(prepared);this.#prepared=prepared;
  const chunks=this.#original.data.cold.chunks.length;this.#maximumSteps=currentFootprintInverseColdStepBudget(chunks)+currentFootprintInverseModelStepBudget(chunks).cdpRequests;
 }
 #remember(error:unknown):void{if(!this.#failed){this.#failed=true;this.#failure=error;}}
 #current(cleanup=false):void{
  need(requireOriginalCurrentFootprintInverseFullPreparation(this.#prepared)===this.#original,"ORIGINAL_FULL_PREPARATION");
  if(!cleanup){need(!this.#stopped&&!this.#failed,"NORMAL_ENDED");}
  if(this.#owner!==null){assertOriginalCurrentFootprintInverseFullNativeContinuationV4Owner(this.#owner);need(originalCurrentFootprintInversePreparedCheckpoint(this.#owner)===this.#prepared,"ORIGINAL_OWNER_PREPARATION");}
 }
 #observe(pending:Promise<unknown>):void{
  const observed=(async():Promise<void>=>{try{await pending;}catch(error){this.#remember(error);}})();this.#observed.push(observed);
 }
 #call<T>(role:string,cleanup:boolean,start:()=>Promise<T>):Promise<T>{
  const bound=fixedRoles.length+this.#maximumSteps+precedingTerminationSamples;
  need(this.#pending.length<bound&&!this.#roles.has(role),"FINITE_ORIGINAL_STAGE");
  need(fixedRoles.some(value=>value===role)||/^cold:[0-9]+$/u.test(role)||/^cleanup:termination:[0-9]+$/u.test(role),"FIXED_STAGE");
  this.#roles.add(role);const gate=Promise.withResolvers<null>();
  const pending=(async():Promise<T>=>{
   await gate.promise;this.#current(cleanup);const original=start();need(types.isPromise(original),"ORIGINAL_PROMISE");this.#actual.push(original);this.#observe(original);
   const value=await original;this.#current(cleanup);return value;
  })();this.#pending.push(pending);this.#observe(pending);gate.resolve(null);return pending;
 }
 #requiredOwner():CurrentFootprintInverseNativeOwner{this.#current(true);need(this.#owner!==null,"ORIGINAL_OWNER");return this.#owner;}
 public start():Promise<CurrentFootprintInverseFullNativeOpeningResult>{
  this.#current(true);if(this.#run!==null){return this.#run;}
  const gate=Promise.withResolvers<null>();
  const pending=(async():Promise<CurrentFootprintInverseFullNativeOpeningResult>=>{
   await gate.promise;this.#current();
   this.#birth=this.#call("birth",false,()=>{
    need(currentFootprintInverseFullAllocationOutcome(this.#prepared).state==="not-attempted","PREEXISTING_FACTORY_REFUSED");
    const original=startCurrentFootprintInverseFullNativeContinuationV4Owner(this.#prepared);this.#birthOriginal=original;return original;
   });this.#owner=await this.#birth;this.#current();const owner=this.#owner;
   this.#launch=this.#call("launch",false,()=>owner.startFootprintInverseFullGeneration());await this.#launch;
   await this.#call("main",false,()=>owner.observeFootprintMainConstruction());
   const browser=await this.#call("browser",false,()=>owner.browserObservation());const selected=selectCurrentPcb209StartPage(browser);
   const frames=await this.#call("frames",false,()=>owner.inspectFrames(selected.targetId));const frame=selectCurrentPcb209StartPageFrame(frames,selected);
   await this.#call("ui",false,()=>owner.inspectScript(frame.frameId,CURRENT_PCB_209_OPENING_SCRIPTS.ui));
   await this.#call("preflight",false,()=>owner.prepareFootprintInverseV4Ui());
   const cache=await this.#call("cache-origin",false,()=>owner.createFootprintInverseV4CacheOrigin());
   await this.#call("cache-read",false,()=>observeOriginalCurrentFootprintInverseCaches(owner,this.#prepared,cache));
   await this.#call("cache-backup",false,()=>owner.publishFootprintInverseV4CacheBackup());await this.#call("cache-absence",false,()=>owner.invalidateFootprintInverseV4Caches());
   await this.#call("flow-plan",false,()=>owner.prepareFootprintInverseV4FlowCachePlan());await this.#call("startup-plan",false,()=>owner.prepareFootprintInverseV4StartupPlan());await this.#call("row-plan",false,()=>owner.prepareFootprintInverseV4PublicRowPlan());
   await this.#call("polling-intent",false,()=>owner.prepareFootprintInverseV4PollingCancellationIntent());await this.#call("library-intent",false,()=>owner.prepareFootprintInverseV4LibraryRefreshIntent());
   await this.#call("registration",false,()=>owner.registerFootprintInverseV4Project());
   await this.#call("worker-arm",false,()=>owner.armFootprintInverseV4Worker(async origin=>{
    this.#current();need(this.#sourceOrigin===null||this.#sourceOrigin===origin,"ORIGINAL_SOURCE_CALLBACK");this.#sourceOrigin=origin;
    await this.#call("construction-arm",false,()=>owner.armFootprintInverseV4Construction(origin));
   }));
   // The actual navigation remains pending while its original source and
   // Constructor/bootstrap holds are serviced by the same Core pump.
   this.#navigation=this.#call("navigation",false,()=>owner.openFootprintInverseV4Project());
   await this.#call("source-held",false,()=>owner.observeFootprintInverseV4WorkerSource());await this.#call("construction",false,()=>owner.observeFootprintInverseV4Construction());
   await this.#call("bootstrap",false,()=>owner.withFootprintInverseV4BootstrapHeld(async hold=>{
    this.#current();need(this.#bootstrap===null||this.#bootstrap===hold,"ORIGINAL_BOOTSTRAP_CALLBACK");this.#bootstrap=hold;
    await this.#call("producers",false,()=>owner.armFootprintInverseV4Producers(hold));await this.#call("cold-arm",false,()=>owner.armFootprintInverseV4ColdLoad(hold));
    await this.#call("callbacks",false,()=>owner.armFootprintInverseV4StartupCallbacks(hold));await this.#call("initial-cache",false,()=>owner.armFootprintInverseV4InitialCache(hold));
    await this.#call("initial-sync",false,()=>owner.armFootprintInverseV4InitialSyncWorker(hold));await this.#call("timer",false,()=>owner.armFootprintInverseV4FirstTimer(hold));
    await this.#call("library",false,()=>owner.armFootprintInverseV4LibraryRefresh(hold));
   }));
   let ingress:CurrentFootprintInverseColdHeld|CurrentFootprintInverseStartupIdle=await this.#call("cold-ingress",false,()=>owner.startFootprintInverseV4ColdIngress());
   let steps=0;
   while(ingress.profile!=="private.current-footprint-inverse-startup-idle.v1"){
    need(steps<this.#maximumSteps,"ORIGINAL_INGRESS_BOUND");const held:CurrentFootprintInverseColdHeld=ingress;const data=requireOriginalCurrentFootprintInverseColdHeld(held,owner,this.#prepared);
    const role=`cold:${String(steps)}`;steps+=1;
    if(CURRENT_FOOTPRINT_INVERSE_COLD_STEP_ROLES.some(value=>value===data.role)){ingress=await this.#call<CurrentFootprintInverseColdHeld>(role,false,():Promise<CurrentFootprintInverseColdHeld>=>owner.continueFootprintInverseV4ColdIngress(held));}
    else{need(CURRENT_FOOTPRINT_INVERSE_MODEL_STEP_ROLES.some(value=>value===data.role),"ORIGINAL_MODEL_ROLE");ingress=await this.#call<CurrentFootprintInverseColdHeld|CurrentFootprintInverseStartupIdle>(role,false,():Promise<CurrentFootprintInverseColdHeld|CurrentFootprintInverseStartupIdle>=>owner.continueFootprintInverseV4ModelIngress(held));}
   }
   requireOriginalCurrentFootprintInverseStartupIdle(ingress,owner,this.#prepared);await this.#navigation;this.#current();
   await this.#call("public-service",false,()=>owner.observeFootprintInverseV4PublicService());
   await this.#call("delete-worker",false,()=>owner.armFootprintInverseV4DeleteWorker());
   const intent=await this.#call("native-intent",false,()=>owner.prepareFootprintInverseV4NativeDeleteIntent());await this.#call("native-bootstrap",false,()=>owner.observeFootprintInverseV4NativeDeleteBootstrap(intent));
   const qualification=await this.#call("qualification",false,()=>owner.observeFootprintInverseV4NativeDeleteQualification(intent));
   const getReady=await this.#call("get-ready",false,()=>owner.prepareFootprintInverseV4NativeGetWorker(qualification));
   const getCall=await this.#call("get-call",false,()=>owner.holdFootprintInverseV4NativeGetTaskCall(getReady));
   const getDependencies=await this.#call("get-dependencies",false,()=>owner.prepareFootprintInverseV4NativeGetTaskDependencies(getCall));
   const getCallback=await this.#call("get-callback",false,()=>owner.advanceFootprintInverseV4NativeGetTaskCallback(getDependencies));
   const getManager=await this.#call("get-manager",false,()=>owner.advanceFootprintInverseV4NativeGetTaskManager(getCallback));
   const getChannel=await this.#call("get-channel",false,()=>owner.advanceFootprintInverseV4NativeGetTaskChannel(getManager));
   const getJob=await this.#call("get-job",false,()=>owner.acceptFootprintInverseV4NativeGetTaskJob(getChannel));
   const getWorker=await this.#call("get-worker",false,()=>owner.completeFootprintInverseV4NativeGetTaskWorker(getJob));
   const getResult=await this.#call("get-result",false,()=>owner.completeFootprintInverseNativeGetTaskResult(getWorker));
   const referenceReady=await this.#call("reference-ready",false,()=>owner.prepareFootprintInverseNativeReferenceWorker(getResult));
   const pcbCall=await this.#call("pcb-call",false,()=>owner.holdFootprintInverseNativeReferencePcbCall(getResult));
   const pcbDependencies=await this.#call("pcb-dependencies",false,()=>owner.prepareFootprintInverseNativeReferencePcbDependencies(pcbCall));
   const pcbCallback=await this.#call("pcb-callback",false,()=>owner.advanceFootprintInverseNativeReferencePcbCallback(pcbDependencies));
   const pcbManager=await this.#call("pcb-manager",false,()=>owner.advanceFootprintInverseNativeReferencePcbManager(pcbCallback));
   const pcbChannel=await this.#call("pcb-channel",false,()=>owner.advanceFootprintInverseNativeReferencePcbChannel(pcbManager));
   const pcbJob=await this.#call("pcb-job",false,()=>owner.forwardFootprintInverseNativeReferencePcbQuery(pcbChannel,referenceReady));
   const pcbWorker=await this.#call("pcb-worker",false,()=>owner.observeFootprintInverseNativeReferenceWorker(pcbJob));
   const pcb=await this.#call("pcb-result",false,()=>owner.finishFootprintInverseNativeReferencePcbQuery(pcbWorker));
   const schematicCall=await this.#call("schematic-call",false,()=>owner.holdFootprintInverseNativeReferenceNextCall(pcb));
   const schematic=await this.#call("schematic-result",false,()=>owner.finishFootprintInverseNativeSchematicReference(schematicCall));
   const derivedCall=await this.#call("derived-call",false,()=>owner.holdFootprintInverseNativeReferenceNextCall(schematic));
   const derivedJob=await this.#call("derived-job",false,()=>owner.forwardFootprintInverseNativeReferenceNextWorker(derivedCall));
   const derivedWorker=await this.#call("derived-worker",false,()=>owner.observeFootprintInverseNativeReferenceWorker(derivedJob));
   const derived=await this.#call("derived-result",false,()=>owner.finishFootprintInverseNativeReferenceNextWorker(derivedWorker));
   const deviceCall=await this.#call("device-call",false,()=>owner.holdFootprintInverseNativeReferenceNextCall(derived));
   const deviceJob=await this.#call("device-job",false,()=>owner.forwardFootprintInverseNativeReferenceNextWorker(deviceCall));
   const deviceWorker=await this.#call("device-worker",false,()=>owner.observeFootprintInverseNativeReferenceWorker(deviceJob));
   const device=await this.#call("device-result",false,()=>owner.finishFootprintInverseNativeReferenceNextWorker(deviceWorker));
   const deleteCall=await this.#call("delete-call",false,()=>owner.holdFootprintInverseNativeDeleteCall(device));
   const inner=await this.#call("delete-rpc",false,()=>owner.holdFootprintInverseNativeDeleteInnerRpc(deleteCall));
   const job=await this.#call("delete-job",false,()=>owner.forwardFootprintInverseNativeDelete(inner));
   await this.#call("clock-registration",false,()=>owner.prepareFootprintInverseNativeDeleteClockRegistration(job));
   const clock=await this.#call("clock",false,()=>owner.observeFootprintInverseNativeDeleteClock(job));
   const serialization=await this.#call("serialization",false,()=>owner.observeFootprintInverseNativeDeleteSerialization(clock));
   const publication=await this.#call("publication",false,()=>owner.observeFootprintInverseNativeDeletePublication(serialization));
   this.#source=await this.#call("main-source",false,()=>owner.prepareFootprintInverseNativeDeleteMainSource(serialization,publication));this.#current();
   const original=requireOriginalCurrentFootprintInverseNativeDeleteMainSourceForOwner(this.#source,owner,this.#prepared);original.assertBeforeOriginalUpload();need(!original.originalUploadWritten(),"FIRST_UPLOAD_STILL_HELD");
   this.#saved=createCurrentFootprintInverseNativeDeleteSavedGeneration(this.#source,owner,this.#prepared);
   const result:CurrentFootprintInverseFullNativeOpeningResult=Object.freeze({profile:"private.current-footprint-inverse-full-native-opening-result.v1"});this.#result=result;results.set(result,this);return result;
  })();this.#run=pending;this.#observe(pending);gate.resolve(null);return pending;
 }
 async #recoverBirth():Promise<void>{
  if(this.#birth!==null){await Promise.allSettled([this.#birth]);}this.#current(true);
  if(this.#owner===null&&this.#birthOriginal!==null){
   const original=currentFootprintInverseFullAllocationOutcome(this.#prepared);
   if(original.owner===null){need(original.state==="not-attempted"||original.state==="no-resource","ORIGINAL_BIRTH_RETAINED");}
   else{assertOriginalCurrentFootprintInverseFullNativeContinuationV4Owner(original.owner);this.#owner=original.owner;}
  }
 }
 async #observeExit():Promise<void>{
  const owner=this.#requiredOwner(),reservation=this.#reservation;need(reservation!==null,"ORIGINAL_CLEANUP_RESERVATION");
  while(!this.#terminated){
   if(this.#termination===null){need(this.#terminationCalls<precedingTerminationSamples,"TERMINATION_BOUND");this.#terminationCalls+=1;const ordinal=this.#terminationCalls;
    this.#termination=Object.freeze({ordinal,pending:this.#call(`cleanup:termination:${String(ordinal)}`,true,()=>owner.observeFootprintInverseFullOpeningTerminationAfterAbort(reservation))});}
   const original=this.#termination;const exited=await original.pending;this.#current(true);
   need(this.#termination===original||this.#termination===null||this.#termination.ordinal>original.ordinal,"ORIGINAL_TERMINATION_PENDING");
   if(exited){const token=originalCurrentFootprintInverseTermination(owner);assertOriginalCurrentFootprintInverseTermination(owner,token);this.#terminated=true;return;}
   if(this.#termination===original){this.#termination=null;}
  }
 }
 #releaseOwner(kind:"closed"|"unlaunched"|"no-process"):Promise<unknown>{
  const owner=this.#requiredOwner();if(this.#release!==null){need(this.#releaseKind===kind,"ORIGINAL_RELEASE_KIND");return this.#release;}
  this.#releaseKind=kind;this.#release=this.#call("cleanup-release",true,():Promise<unknown>=>{if(kind==="closed"){return owner.releaseClosed();}if(kind==="unlaunched"){return owner.releaseUnlaunched();}return owner.releaseNoProcess();});return this.#release;
 }
 /** No retry/launch/adoption. A late original birth/launch is joined first,
  * then only that original owner and Job can be closed and released. */
 public reserveOriginalCleanup():void{
  this.#current(true);this.#stopped=true;
  if(this.#saved!==null){this.#saved.stopOriginalNormal();}
  if(this.#owner!==null&&!this.#owner.status().released&&!this.#terminated){this.#reservation??=this.#owner.reserveFootprintInverseFullOpeningCleanup();}
 }
 public cleanup():Promise<void>{
  this.reserveOriginalCleanup();if(this.#cleanup!==null){return this.#cleanup;}
  const gate=Promise.withResolvers<null>();
  const pending=(async():Promise<void>=>{
   await gate.promise;await this.#recoverBirth();this.#current(true);const owner=this.#owner;
   if(owner===null){await Promise.allSettled(this.#pending);if(this.#run!==null){await Promise.allSettled([this.#run]);}this.#cleaned=true;return;}
   const failures:unknown[]=[];
   if(this.#saved!==null){
    try{await this.#saved.cleanup();}catch(error){failures.push(error);}
    const state=owner.status();if(!state.released||!state.helperClosed){throw new AggregateError(failures,"INVERSE_FULL_NATIVE_SAVED_OWNER_RETAINED");}
   }
   else if(!owner.status().released){
    this.#reservation??=owner.reserveFootprintInverseFullOpeningCleanup();
    if(this.#launch!==null){await Promise.allSettled([this.#launch]);}this.#current(true);const state=owner.status();
    if(!state.launchConsumed){await this.#releaseOwner("unlaunched");}
    else if(state.binding===null){need(state.noProcessCleanupAvailable,"ORIGINAL_LAUNCH_RETAINED");await this.#releaseOwner("no-process");}
    else{
     if(!this.#terminated){
      const reservation=this.#reservation;need(reservation!==null,"ORIGINAL_CLEANUP_RESERVATION");this.#abort??=this.#call("cleanup-abort",true,()=>owner.dispatchFootprintInverseFullOpeningCleanupAbort(reservation));
      try{await this.#abort;}catch(error){failures.push(error);}try{await this.#observeExit();}catch(error){failures.push(error);}
     }
     need(this.#terminated,"ORIGINAL_ROOT_AND_JOB_RETAINED");this.#end??=this.#call("cleanup-end",true,()=>owner.endFootprintInverseFullOpeningAfterOriginalExit());
     try{await this.#end;}catch(error){failures.push(error);}
     await Promise.allSettled(this.#pending);if(this.#run!==null){await Promise.allSettled([this.#run]);}
     try{await this.#releaseOwner("closed");}catch(error){failures.push(error);}
    }
   }
   await Promise.allSettled(this.#pending);if(this.#run!==null){await Promise.allSettled([this.#run]);}
   this.#current(true);const state=owner.status();need(state.released&&state.helperClosed,"ORIGINAL_HELPER_EXIT");
   if(state.binding!==null){const token=originalCurrentFootprintInverseTermination(owner);assertOriginalCurrentFootprintInverseTermination(owner,token);this.#terminated=true;}
   if(failures.length>0){throw new AggregateError(failures,"INVERSE_FULL_NATIVE_GENERATION_CLEANUP");}this.#cleaned=true;
  })();this.#cleanup=pending;this.#observe(pending);
  try{if(this.#owner!==null&&this.#saved===null&&!this.#owner.status().released){this.#reservation=this.#owner.reserveFootprintInverseFullOpeningCleanup();}gate.resolve(null);}catch(error){gate.reject(error);}
  return pending;
 }
 public originalResult(result:CurrentFootprintInverseFullNativeOpeningResult):Readonly<{owner:CurrentFootprintInverseNativeOwner;prepared:CurrentFootprintInverseFullPreparation;source:CurrentFootprintInverseNativeDeleteMainSource;saved:CurrentFootprintInverseNativeDeleteSavedGeneration}>{
  this.#current(true);need(this.#result===result&&results.get(result)===this&&this.#source!==null&&this.#saved!==null,"ORIGINAL_RESULT");
  return Object.freeze({owner:this.#requiredOwner(),prepared:this.#prepared,source:this.#source,saved:this.#saved});
 }
 public retained():Readonly<{profile:"private.current-footprint-inverse-full-native-generation-state.v1";started:boolean;cleanupStarted:boolean;failed:boolean;cleaned:boolean;originalOwnerRetained:boolean;originalHelperClosed:boolean;mainSourceHeld:boolean;wholeInverseVerified:false;executionAuthorized:false}>{
  this.#current(true);return Object.freeze({profile:"private.current-footprint-inverse-full-native-generation-state.v1",started:this.#run!==null,cleanupStarted:this.#cleanup!==null,failed:this.#failed,cleaned:this.#cleaned,originalOwnerRetained:this.#owner!==null,originalHelperClosed:this.#owner?.status().helperClosed??false,mainSourceHeld:this.#result!==null,wholeInverseVerified:false,executionAuthorized:false});
 }
 public retainedFailure():unknown{this.#current(true);return this.#failure;}
}
Object.freeze(CurrentFootprintInverseFullNativeGeneration.prototype);Object.freeze(CurrentFootprintInverseFullNativeGeneration);
export function createCurrentFootprintInverseFullNativeGeneration(prepared:CurrentFootprintInverseFullPreparation):CurrentFootprintInverseFullNativeGeneration{
 requireOriginalCurrentFootprintInverseFullPreparation(prepared);const prior=generations.get(prepared);if(prior!==undefined){return prior;}
 const generation=new CurrentFootprintInverseFullNativeGeneration(INTERNAL,prepared);generations.set(prepared,generation);Object.freeze(generation);return generation;
}
/** A whole workflow may claim only a fresh unused generation. It must not
 * adopt a previously retained opening, even before that opening launches. */
export function claimCurrentFootprintInverseFullNativeGeneration(prepared:CurrentFootprintInverseFullPreparation):CurrentFootprintInverseFullNativeGeneration{
 requireOriginalCurrentFootprintInverseFullPreparation(prepared);need(!generations.has(prepared),"GENERATION_ALREADY_RETAINED");
 return createCurrentFootprintInverseFullNativeGeneration(prepared);
}
export function requireOriginalCurrentFootprintInverseFullNativeOpeningResult(result:CurrentFootprintInverseFullNativeOpeningResult):ReturnType<CurrentFootprintInverseFullNativeGeneration["originalResult"]>{
 const generation=results.get(result);need(generation!==undefined,"ORIGINAL_ISSUANCE");return generation.originalResult(result);
}
