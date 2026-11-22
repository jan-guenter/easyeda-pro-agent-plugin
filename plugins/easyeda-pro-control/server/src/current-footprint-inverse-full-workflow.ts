/* oxlint-disable unicorn/no-useless-undefined -- Original undefined settlement is retained explicitly for the cleanup and publication acknowledgement promises. */
/** Internal original full-copy -> native inverse -> closed SQL/cold-manager
 * composition. This module registers no tool and grants no UI-task parity. */
/* oxlint-disable import/max-dependencies -- This single original lifecycle boundary keeps consent, durable facts and the three disjoint source/native/saved registries explicit. */
import {AsyncLocalStorage} from "node:async_hooks";
import {types} from "node:util";
import {sha256Json} from "./core.ts";
import {captureCurrentPcbStringClockReply} from "./current-pcb-string-clock-reply.ts";
import type {CurrentFootprintInverseNativeOwner} from "./current-footprint-inverse-v4-native-owner.ts";
import type {CurrentFootprintInverseNativeDeleteMainSource} from "./current-footprint-inverse-native-delete-main-source.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";
import {requireOriginalCurrentFootprintForwardWriterWorkflowResult} from "./current-footprint-forward-writer-workflow.ts";
import type {CurrentFootprintForwardWriterWorkflowResult} from "./current-footprint-forward-writer-workflow.ts";
import {prepareCurrentFootprintInverseFullPreparation,requireOriginalCurrentFootprintInverseFullPreparation} from "./current-footprint-inverse-full-preparation.ts";
import type {CurrentFootprintInverseFullPreparation} from "./current-footprint-inverse-full-preparation.ts";
import {CurrentFootprintInverseFullNativeGeneration,claimCurrentFootprintInverseFullNativeGeneration,requireOriginalCurrentFootprintInverseFullNativeOpeningResult} from "./current-footprint-inverse-full-native-generation.ts";
import type {CurrentFootprintInverseFullNativeOpeningResult} from "./current-footprint-inverse-full-native-generation.ts";
import {CurrentFootprintInverseNativeDeleteSavedGeneration,requireOriginalCurrentFootprintInverseNativeDeleteSavedResult} from "./current-footprint-inverse-native-delete-saved-generation.ts";
import type {CurrentFootprintInverseNativeDeleteSavedResult} from "./current-footprint-inverse-native-delete-saved-generation.ts";
import {CurrentFootprintInverseFullWorkflowJournal,scanCurrentFootprintInverseFullWorkflowSummaries} from "./current-footprint-inverse-full-workflow-journal.ts";
import {CURRENT_FOOTPRINT_INVERSE_FULL_WORKFLOW_BUDGET as BUDGET,currentFootprintInverseFullWorkflowRequestSchema,currentFootprintInverseFullWorkflowResultSchema} from "./current-footprint-inverse-full-workflow-contract.ts";
import type {CurrentFootprintInverseFullWorkflowRecord,CurrentFootprintInverseFullWorkflowRequest,CurrentFootprintInverseFullWorkflowResult,CurrentFootprintInverseFullWorkflowStage} from "./current-footprint-inverse-full-workflow-contract.ts";
import {captureCurrentFootprintForwardExecutionPrototypes,captureCurrentFootprintForwardExecutionReceiver,requireCurrentFootprintForwardExecutionPrototypes} from "./current-footprint-forward-execution-opening-identity.ts";

type OriginalSource=ReturnType<typeof requireOriginalCurrentFootprintForwardWriterWorkflowResult>;
const INTERNAL=Object.freeze({});
const sourceClaims=new WeakMap<CurrentFootprintForwardWriterWorkflowResult,CurrentFootprintInverseFullWorkflow>();
const originals=new WeakSet<CurrentFootprintInverseFullWorkflow>();
const results=new WeakMap<CurrentFootprintInverseFullWorkflowResult,CurrentFootprintInverseFullWorkflow>();
const admission=new AsyncLocalStorage<CurrentFootprintInverseFullWorkflow>();
const journalPrototype=captureCurrentFootprintForwardExecutionPrototypes(CurrentFootprintInverseFullWorkflowJournal.prototype);
const openingPrototype=captureCurrentFootprintForwardExecutionPrototypes(CurrentFootprintInverseFullNativeGeneration.prototype);
const savedPrototype=captureCurrentFootprintForwardExecutionPrototypes(CurrentFootprintInverseNativeDeleteSavedGeneration.prototype);
function need(value:boolean,code:string):asserts value{if(!value){throw new Error(`INVERSE_FULL_WORKFLOW_${code}`);}}
export class CurrentFootprintInverseFullWorkflow{
 readonly #source:CurrentFootprintForwardWriterWorkflowResult;readonly #sourceOriginal:OriginalSource;readonly #request:CurrentFootprintInverseFullWorkflowRequest;
 readonly #journal:CurrentFootprintInverseFullWorkflowJournal;readonly #journalCurrent:()=>void;
 readonly #pending:Promise<unknown>[]=[];
 #journalTail:Promise<unknown>=Promise.resolve();#run:Promise<CurrentFootprintInverseFullWorkflowResult>|null=null;#cleanup:Promise<void>|null=null;
 #preparation:Promise<CurrentFootprintInverseFullPreparation>|null=null;#prepared:CurrentFootprintInverseFullPreparation|null=null;
 #opening:CurrentFootprintInverseFullNativeGeneration|null=null;#openingCurrent:(()=>void)|null=null;#openingRun:Promise<CurrentFootprintInverseFullNativeOpeningResult>|null=null;
 #openingResult:CurrentFootprintInverseFullNativeOpeningResult|null=null;#saved:CurrentFootprintInverseNativeDeleteSavedGeneration|null=null;#savedCurrent:(()=>void)|null=null;
 #savedRun:Promise<CurrentFootprintInverseNativeDeleteSavedResult>|null=null;#savedResult:CurrentFootprintInverseNativeDeleteSavedResult|null=null;
 #ownerCleanup:Promise<void>|null=null;#resourcesClosed=false;
 #publicationBlocker:Readonly<{wake:PromiseWithResolvers<undefined>;cause:unknown}>|null=null;
 #publicationChange=Promise.withResolvers<undefined>();#shutdown:Promise<void>|null=null;
 #result:CurrentFootprintInverseFullWorkflowResult|null=null;#stage:CurrentFootprintInverseFullWorkflowStage="preparation";
 #stopped=false;#failed=false;#failure:unknown;#terminal=false;
 public constructor(internal:object,source:CurrentFootprintForwardWriterWorkflowResult,input:unknown){
  need(internal===INTERNAL,"INTERNAL_FACTORY");this.#sourceOriginal=requireOriginalCurrentFootprintForwardWriterWorkflowResult(source);this.#source=source;
  this.#request=freezeDeep(currentFootprintInverseFullWorkflowRequestSchema.parse(captureCurrentPcbStringClockReply(input).value));
  need(source.operationId===this.#request.sourceOperationId,"ORIGINAL_SOURCE_OPERATION");
  this.#journal=new CurrentFootprintInverseFullWorkflowJournal(this.#request);
  this.#journalCurrent=captureCurrentFootprintForwardExecutionReceiver(this.#journal,journalPrototype,["reserve","append","settle","assertCurrent","retained","reservationOutcome","waitForCurrentPublication"]);
  originals.add(this);Object.freeze(this);
 }
 #current(cleanup=false):void{
  // oxlint-disable-next-line eslint/no-use-before-define -- The frozen original prototype snapshot is initialized after class evaluation, before any factory can issue a workflow.
  requireCurrentFootprintForwardExecutionPrototypes(workflowPrototype);need(originals.has(this)&&sourceClaims.get(this.#source)===this,"ORIGINAL_WORKFLOW");
  const same=requireOriginalCurrentFootprintForwardWriterWorkflowResult(this.#source);need(same.checkpoint===this.#sourceOriginal.checkpoint&&same.paired===this.#sourceOriginal.paired,"ORIGINAL_SOURCE");
  this.#journalCurrent();this.#openingCurrent?.();this.#savedCurrent?.();
  if(!cleanup){need(!this.#stopped&&!this.#failed&&!this.#terminal,"NORMAL_ENDED");}
 }
 #remember(cause:unknown):void{if(!this.#failed){this.#failed=true;this.#failure=cause;}}
 #retain<T>(pending:Promise<T>):Promise<T>{
  need(types.isPromise(pending),"ORIGINAL_PROMISE");this.#pending.push(pending);
  const observed=(async():Promise<void>=>{try{await pending;}catch(error){this.#remember(error);}})();this.#pending.push(observed);return pending;
 }
 #journalAction<T>(action:()=>Promise<T>):Promise<T>{
  const previous=this.#journalTail;const pending=(async():Promise<T>=>{await Promise.allSettled([previous]);return action();})();
  this.#journalTail=pending;return pending;
 }
 #append(kind:CurrentFootprintInverseFullWorkflowRecord["kind"],evidence:Readonly<Record<string,unknown>>):Promise<void>{return this.#journalAction(()=>this.#journal.append(kind,evidence));}
 #settle():Promise<void>{return this.#journalAction(()=>{const outcome=this.#journal.reservationOutcome();return outcome==="not-entered"||outcome==="conflict"?Promise.resolve():this.#journal.settle();});}
 async #stageCall<T>(stage:CurrentFootprintInverseFullWorkflowStage,action:()=>Promise<T>,facts:(value:T)=>unknown):Promise<T>{
  this.#current();this.#stage=stage;await this.#append("stage-intent",{stage});this.#current();
  const original=this.#retain(action());const value=await original;this.#current();
  await this.#append("stage-result",{stage,originalCompletionObserved:true,evidenceSha256:sha256Json(facts(value))});this.#current();return value;
 }
 /** One actual Promise from genuine closed full-copy result to manager cold
  * absence. Neither inspect nor publication settlement starts this path. */
 public run():Promise<CurrentFootprintInverseFullWorkflowResult>{
  this.#current(true);if(this.#run!==null){return this.#run;}this.#current();
  const completion=Promise.withResolvers<CurrentFootprintInverseFullWorkflowResult>();this.#run=completion.promise;
  void admission.run(this,async():Promise<void>=>{
   try{
    await this.#journalAction(()=>this.#journal.reserve());this.#current();
    this.#prepared=await this.#stageCall("preparation",()=>{
     const original=prepareCurrentFootprintInverseFullPreparation(this.#sourceOriginal.checkpoint);this.#preparation=original;return original;
    },value=>({profile:value.profile,sourceOperationId:this.#source.operationId}));this.#current();
    requireOriginalCurrentFootprintInverseFullPreparation(this.#prepared);
    this.#opening=claimCurrentFootprintInverseFullNativeGeneration(this.#prepared);
    this.#openingCurrent=captureCurrentFootprintForwardExecutionReceiver(this.#opening,openingPrototype,["start","reserveOriginalCleanup","cleanup","retained","originalResult"]);
    this.#openingResult=await this.#stageCall("opening",()=>{
     const opening=this.#opening;need(opening!==null,"ORIGINAL_OPENING");const original=opening.start();this.#openingRun=original;return original;
    },value=>({profile:value.profile,mainSourceHeldBeforeUpload:true}));this.#current();
    const opening=requireOriginalCurrentFootprintInverseFullNativeOpeningResult(this.#openingResult);
    need(opening.prepared===this.#prepared,"ORIGINAL_OPENING_SOURCE");this.#saved=opening.saved;
    this.#savedCurrent=captureCurrentFootprintForwardExecutionReceiver(this.#saved,savedPrototype,["start","stopOriginalNormal","cleanup","retained","originalResult"]);
    this.#savedResult=await this.#stageCall("delete-persistence-cold",()=>{
     const saved=this.#saved;need(saved!==null,"ORIGINAL_SAVED");const original=saved.start();this.#savedRun=original;return original;
    },value=>value);this.#current();
    this.#resourcesClosed=true;completion.resolve(await this.#publishComplete());
   }catch(error){
    this.#remember(error);
    try{await this.cleanup();if(this.#result!==null){completion.resolve(this.#result);return;}}catch(cleanupError){completion.reject(new AggregateError([error,cleanupError],"INVERSE_FULL_WORKFLOW_CLEANUP",{cause:error}));return;}
    completion.reject(error);
   }
  });return completion.promise;
 }
 async #publishComplete():Promise<CurrentFootprintInverseFullWorkflowResult>{
  this.#current(true);if(this.#result!==null){return this.#result;}need(this.#savedResult!==null&&this.#openingResult!==null,"ORIGINAL_COMPLETE");
  const opening=requireOriginalCurrentFootprintInverseFullNativeOpeningResult(this.#openingResult),saved=requireOriginalCurrentFootprintInverseNativeDeleteSavedResult(this.#savedResult);
  need(saved.source===opening.source&&saved.owner===opening.owner&&saved.prepared===opening.prepared,"ORIGINAL_SAVED_SOURCE");
  const result=freezeDeep(currentFootprintInverseFullWorkflowResultSchema.parse({...this.#savedResult,profile:"private.current-footprint-inverse-full-workflow-result.v1",operationId:this.#request.operationId,sourceOperationId:this.#request.sourceOperationId}));
  if(this.#journal.retained().records.at(-1)?.kind!=="complete"){await this.#append("complete",result);}
  this.#current(true);this.#result=result;results.set(result,this);this.#terminal=true;return result;
 }
 /** Reserve the original cutoff synchronously. The first abort is dispatched
  * only after this same journal has published its cleanup intent. */
 public cleanup():Promise<void>{
  this.#current(true);this.#stopped=true;
  this.#opening?.reserveOriginalCleanup();this.#saved?.stopOriginalNormal();
  if(this.#cleanup!==null){return this.#cleanup;}if(this.#terminal){return Promise.resolve();}
  const completion=Promise.withResolvers<undefined>();this.#cleanup=completion.promise;
  void admission.run(this,async():Promise<void>=>{
   try{
    await this.#journal.waitForCurrentPublication();await this.#cleanupPublication(()=>this.#settle());this.#current(true);
    if(!this.#journal.retained().reserved){need(this.#opening===null,"UNRESERVED_OWNER");await Promise.allSettled(this.#pending);this.#resourcesClosed=true;this.#terminal=true;completion.resolve(undefined);return;}
    const records=this.#journal.retained().records;
    if(records.at(-1)?.kind==="complete"){await this.#publishComplete();completion.resolve(undefined);return;}
    if(!records.some(row=>row.kind==="failure")){if(!this.#failed){this.#remember(new Error("INVERSE_FULL_WORKFLOW_ENDED"));}await this.#cleanupPublication(()=>this.#append("failure",{stage:this.#stage,originalErrorRetained:true}));}
    if(!this.#journal.retained().records.some(row=>row.kind==="cleanup-intent")){await this.#cleanupPublication(()=>this.#append("cleanup-intent",{confirmOriginalJobsOnly:true,normalWorkStopped:true}));}
    this.#current(true);
    if(this.#opening!==null){
     this.#ownerCleanup??=this.#retain(this.#opening.cleanup());await this.#ownerCleanup;
     need(this.#opening.retained().cleaned,"ORIGINAL_HELPERS_RETAINED");
    }
    await Promise.allSettled([...this.#pending,...(this.#preparation===null?[]:[this.#preparation]),...(this.#openingRun===null?[]:[this.#openingRun])]);this.#current(true);this.#resourcesClosed=true;
    await this.#publishClosedFailure();completion.resolve(undefined);
   }catch(error){completion.reject(error);}
  });return completion.promise;
 }
 /** Keep the original cleanup task pending across a failed publication.
  * Explicit settlement can acknowledge only these same queued bytes; it does
  * not create another abort/release attempt or restart normal work. */
 async #cleanupPublication(action:()=>Promise<void>):Promise<void>{
  try{await action();}catch(error){
   this.#remember(error);need(this.#publicationBlocker===null,"PUBLICATION_WAITER_ONCE");
   if(!this.#journal.retained().publicationPending&&this.#journal.reservationOutcome()!=="create-unknown"){throw error;}
   const original=Object.freeze({wake:Promise.withResolvers<undefined>(),cause:error});this.#publicationBlocker=original;this.#publicationChange.resolve(undefined);
   await original.wake.promise;this.#current(true);need(this.#publicationBlocker===null,"ORIGINAL_PUBLICATION_JOIN");
   await this.#journal.assertCurrent();this.#current(true);
  }
 }
 async #publishClosedFailure():Promise<void>{
  need(this.#resourcesClosed,"ORIGINAL_RESOURCES_RETAINED");
  const records=this.#journal.retained().records;
  if(!records.some(row=>row.kind==="cleanup-result")){await this.#cleanupPublication(()=>this.#append("cleanup-result",{originalOwnersClosed:true,originalPendingJoined:true,released:true}));}
  if(this.#journal.retained().records.at(-1)?.kind!=="terminal-failure"){await this.#cleanupPublication(()=>this.#append("terminal-failure",{originalOwnersClosed:true,originalPendingJoined:true,released:true}));}
  this.#terminal=true;
 }
 /** Settle original bytes only. An already pending original cleanup may
  * continue after that acknowledgement; no action or opening is recreated. */
 public async settleRecords():Promise<void>{
  this.#current(true);await this.#journal.waitForCurrentPublication();await this.#settle();this.#current(true);
  const blocked=this.#publicationBlocker;
  if(blocked!==null){need(!this.#journal.retained().publicationPending,"ORIGINAL_PUBLICATION_PENDING");this.#publicationChange=Promise.withResolvers<undefined>();this.#publicationBlocker=null;blocked.wake.resolve(undefined);return;}
  if(!this.#journal.retained().reserved||this.#terminal){return;}
  if(this.#journal.retained().records.at(-1)?.kind==="complete"&&this.#savedResult!==null){await this.#publishComplete();return;}
  if(this.#resourcesClosed&&this.#cleanup===null&&this.#journal.retained().records.some(row=>row.kind==="cleanup-intent")){await this.#publishClosedFailure();}
 }
 /** Same-controller shutdown joins this retained cleanup and services only
  * its original pending publications, at most one per bounded journal row. */
 public shutdownOriginal():Promise<void>{
  this.#current(true);if(this.#shutdown!==null){return this.#shutdown;}
  const cleanup=this.cleanup(),gate=Promise.withResolvers<null>();
  const pending=(async():Promise<void>=>{
   await gate.promise;const ended=(async():Promise<"closed">=>{await cleanup;return"closed";})();void Promise.allSettled([ended]);
   let publications=0;
   for(;;){
    this.#current(true);
    if(this.#publicationBlocker===null){
      const original=this.#publicationChange.promise;const changed=(async():Promise<"publication">=>{await original;return"publication";})();
      if(await Promise.race([ended,changed])==="closed"){return;}
    }else{need(publications<BUDGET.records,"ORIGINAL_PUBLICATION_BOUND");publications+=1;await this.settleRecords();}
   }
  })();this.#shutdown=pending;gate.resolve(null);return pending;
 }
 public async ownsDiagnosticOperation(operationId:string):Promise<boolean>{
  if(admission.getStore()!==this||this.#stopped||this.#failed||this.#terminal||!this.#journal.retained().reserved||operationId!==this.#request.operationId){return false;}
  this.#current();await this.#journalAction(()=>this.#journal.assertCurrent());this.#current();
  const last=this.#journal.retained().records.at(-1);
  return last?.kind==="stage-intent"&&last.evidence["stage"]===this.#stage&&(this.#stage==="opening"&&this.#opening!==null||this.#stage==="delete-persistence-cold"&&this.#saved!==null);
 }
 /** The six exact original records precede the first upload and stay the
  * current publication throughout its original saved-generation Promise. */
 public requireUploadAdmission(owner:CurrentFootprintInverseNativeOwner,source:CurrentFootprintInverseNativeDeleteMainSource):void{
  this.#current();need(admission.getStore()===this&&this.#stage==="delete-persistence-cold"&&this.#openingResult!==null&&this.#saved!==null&&this.#savedRun!==null,"ORIGINAL_UPLOAD_SCOPE");
  const original=requireOriginalCurrentFootprintInverseFullNativeOpeningResult(this.#openingResult);
  need(original.owner===owner&&original.source===source&&original.prepared===this.#prepared&&original.saved===this.#saved,"ORIGINAL_UPLOAD_BINDINGS");
  const retained=this.#journal.retained();const last=retained.records.at(-1);
  need(retained.reserved&&!retained.publicationPending&&this.#journal.reservationOutcome()==="reserved"&&retained.records.length===6&&last?.kind==="stage-intent"&&last.evidence["stage"]==="delete-persistence-cold","ORIGINAL_UPLOAD_INTENT");
 }
 public async reproveUploadAdmission(owner:CurrentFootprintInverseNativeOwner,source:CurrentFootprintInverseNativeDeleteMainSource):Promise<void>{
  this.requireUploadAdmission(owner,source);await this.#journalAction(()=>this.#journal.assertCurrent());this.requireUploadAdmission(owner,source);
 }
 public originalAdmission(operationId:string):boolean{
  this.#current(true);return admission.getStore()===this&&!this.#terminal&&!this.#stopped&&!this.#failed&&this.#journal.retained().reserved&&operationId===this.#request.operationId;
 }
 public retained():Readonly<{profile:"private.current-footprint-inverse-full-workflow-state.v1";operationId:string;stage:CurrentFootprintInverseFullWorkflowStage;started:boolean;failed:boolean;terminal:boolean;resourcesClosed:boolean;publicationPending:boolean;cleanupPublicationPending:boolean;wholeInverseVerified:false;executionAuthorized:false}>{
  this.#current(true);return Object.freeze({profile:"private.current-footprint-inverse-full-workflow-state.v1",operationId:this.#request.operationId,stage:this.#stage,started:this.#run!==null,failed:this.#failed,terminal:this.#terminal,resourcesClosed:this.#resourcesClosed,publicationPending:this.#journal.retained().publicationPending||this.#publicationBlocker!==null,cleanupPublicationPending:this.#publicationBlocker!==null,wholeInverseVerified:false,executionAuthorized:false});
 }
 /** Return only the actual retained result after its original publication.
  * A rejected caller Promise is neither retried nor replaced by this reader. */
 public retainedResult():CurrentFootprintInverseFullWorkflowResult|null{this.#current(true);return this.#result;}
 public retainedFailure():unknown{this.#current(true);return this.#failure;}
 public originalResult(result:CurrentFootprintInverseFullWorkflowResult):Readonly<{source:CurrentFootprintForwardWriterWorkflowResult;opening:CurrentFootprintInverseFullNativeOpeningResult;saved:CurrentFootprintInverseNativeDeleteSavedResult}>{
  this.#current(true);need(results.get(result)===this&&this.#result===result&&this.#terminal&&this.#resourcesClosed&&this.#openingResult!==null&&this.#savedResult!==null,"ORIGINAL_RESULT");
  requireOriginalCurrentFootprintInverseNativeDeleteSavedResult(this.#savedResult);return Object.freeze({source:this.#source,opening:this.#openingResult,saved:this.#savedResult});
 }
}
Object.freeze(CurrentFootprintInverseFullWorkflow.prototype);Object.freeze(CurrentFootprintInverseFullWorkflow);
const workflowPrototype=captureCurrentFootprintForwardExecutionPrototypes(CurrentFootprintInverseFullWorkflow.prototype);
/* oxlint-disable typescript/unbound-method -- These captured methods are called only on their original private-field workflow receiver. */
const diagnostic=CurrentFootprintInverseFullWorkflow.prototype.ownsDiagnosticOperation;
const originalAdmission=CurrentFootprintInverseFullWorkflow.prototype.originalAdmission;
const originalResult=CurrentFootprintInverseFullWorkflow.prototype.originalResult;
const requireUpload=CurrentFootprintInverseFullWorkflow.prototype.requireUploadAdmission;
const reproveUpload=CurrentFootprintInverseFullWorkflow.prototype.reproveUploadAdmission;
/* oxlint-enable typescript/unbound-method */
Object.freeze(CurrentFootprintInverseFullWorkflow.prototype);Object.freeze(CurrentFootprintInverseFullWorkflow);
export function createCurrentFootprintInverseFullWorkflow(source:CurrentFootprintForwardWriterWorkflowResult,input:unknown):CurrentFootprintInverseFullWorkflow{
 requireOriginalCurrentFootprintForwardWriterWorkflowResult(source);need(!sourceClaims.has(source),"ORIGINAL_SOURCE_CONSUMED");
 const workflow=new CurrentFootprintInverseFullWorkflow(INTERNAL,source,input);sourceClaims.set(source,workflow);return workflow;
}
export function requireOriginalCurrentFootprintInverseFullWorkflowResult(result:CurrentFootprintInverseFullWorkflowResult):ReturnType<CurrentFootprintInverseFullWorkflow["originalResult"]>{
 const workflow=results.get(result);need(workflow!==undefined,"ORIGINAL_RESULT");return originalResult.call(workflow,result);
}
export function isOriginalCurrentFootprintInverseFullWorkflowDiagnosticOperation(operationId:string):Promise<boolean>{
 const workflow=admission.getStore();return workflow===undefined?Promise.resolve(false):diagnostic.call(workflow,operationId);
}
export async function assertNoUnresolvedCurrentFootprintInverseFullWorkflows():Promise<void>{
 const summaries=await scanCurrentFootprintInverseFullWorkflowSummaries();
 for(const summary of summaries){const workflow=admission.getStore();need(summary.settled||workflow!==undefined&&originalAdmission.call(workflow,summary.operationId),"UNRESOLVED_OTHER_WORKFLOW");}
}

export function requireOriginalCurrentFootprintInverseFullWorkflowUpload(owner:CurrentFootprintInverseNativeOwner,source:CurrentFootprintInverseNativeDeleteMainSource):void{
 const workflow=admission.getStore();need(workflow!==undefined,"ORIGINAL_UPLOAD_SCOPE");requireUpload.call(workflow,owner,source);
}
export function reproveOriginalCurrentFootprintInverseFullWorkflowUpload(owner:CurrentFootprintInverseNativeOwner,source:CurrentFootprintInverseNativeDeleteMainSource):Promise<void>{
 const workflow=admission.getStore();need(workflow!==undefined,"ORIGINAL_UPLOAD_SCOPE");return reproveUpload.call(workflow,owner,source);
}
