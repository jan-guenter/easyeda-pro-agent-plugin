/* oxlint-disable import/max-dependencies -- The original coordinator binds the separately versioned control contracts to the genuine forward/inverse workflows and shared original-receiver guards. */
/** One original controlled disposable workflow per facade. Execute/cleanup
 * retain their original work and return promptly; inspection never adopts it. */
import { types } from "node:util";
import { originalNativeOrSourceErrorCode } from "./original-native-error-code.ts";
import {CurrentFootprintInverseColdUiContinuation,createCurrentFootprintInverseColdUiContinuation} from "./current-footprint-inverse-cold-ui-continuation.ts";
import {currentFootprintInverseColdUiControlActionSchema} from "./current-footprint-inverse-cold-ui-control-contract.ts";
import type {CurrentFootprintInverseColdUiControlResult} from "./current-footprint-inverse-cold-ui-control-contract.ts";
import { currentFootprintInverseControlActionSchema, currentFootprintInverseControlResultSchema } from "./current-footprint-inverse-control-contract.ts";
import type { CurrentFootprintInverseControlExecution, CurrentFootprintInverseControlResult } from "./current-footprint-inverse-control-contract.ts";
import {CurrentFootprintInverseFullWorkflow,createCurrentFootprintInverseFullWorkflow,requireOriginalCurrentFootprintInverseFullWorkflowResult} from "./current-footprint-inverse-full-workflow.ts";
import type {CurrentFootprintInverseFullWorkflowResult} from "./current-footprint-inverse-full-workflow-contract.ts";
import {currentFootprintInverseFullWorkflowRequestSchema} from "./current-footprint-inverse-full-workflow-contract.ts";
import { canonicalJson } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import type { CurrentPcbDiagnosticLifecycleOptions } from "./current-pcb-diagnostic-lifecycle.ts";
import { createCurrentFootprintForwardWriterCompleteOpeningProvider } from "./current-footprint-forward-writer-opening.ts";
import { CurrentFootprintForwardWriterWorkflow, requireOriginalCurrentFootprintForwardWriterWorkflowResult } from "./current-footprint-forward-writer-workflow.ts";
import type { CurrentFootprintForwardWriterWorkflowResult } from "./current-footprint-forward-writer-workflow.ts";
import { currentFootprintForwardWriterControlActionSchema, currentFootprintForwardWriterControlResultSchema } from "./current-footprint-forward-writer-control-contract.ts";
import type { CurrentFootprintForwardWriterControlAction, CurrentFootprintForwardWriterControlResult } from "./current-footprint-forward-writer-control-contract.ts";
import { captureCurrentFootprintForwardExecutionPrototypes, captureCurrentFootprintForwardExecutionReceiver, requireCurrentFootprintForwardExecutionPrototypes } from "./current-footprint-forward-execution-opening-identity.ts";

const workflowPrototype=captureCurrentFootprintForwardExecutionPrototypes(CurrentFootprintForwardWriterWorkflow.prototype);
const inversePrototype=captureCurrentFootprintForwardExecutionPrototypes(CurrentFootprintInverseFullWorkflow.prototype);
const coldUiPrototype=captureCurrentFootprintForwardExecutionPrototypes(CurrentFootprintInverseColdUiContinuation.prototype);
type Preparation=Extract<CurrentFootprintForwardWriterControlAction,{action:"prepare"}>;
const originalCoordinators=new WeakSet<object>();
function need(value:boolean,code:string):asserts value{if(!value){throw new Error(`FORWARD_WRITER_COORDINATOR_${code}`);}}
function failureCode(error:unknown):string|null{
 const code=originalNativeOrSourceErrorCode(error);if(code!==null){return code;}
 if(!Error.isError(error)||types.isProxy(error)){return null;}const descriptor=Object.getOwnPropertyDescriptor(error,"message"),message=descriptor?.value as unknown;
 return typeof message==="string"&&/^[A-Z][A-Z0-9_:-]{0,255}$/u.test(message)?message:null;
}
export class CurrentFootprintForwardWriterCoordinator{
 readonly #request:Preparation;readonly #requestText:string;readonly #workflow:CurrentFootprintForwardWriterWorkflow;readonly #workflowCurrent:()=>void;
 #execution:Promise<CurrentFootprintForwardWriterWorkflowResult>|null=null;#executionObservation:Promise<void>|null=null;#executionSettled=false;#executionFailed=false;
 #cleanup:Promise<void>|null=null;#cleanupObservation:Promise<void>|null=null;#cleanupSettled=false;#cleanupFailed=false;
 #coldUi:CurrentFootprintInverseColdUiContinuation|null=null;#coldUiCurrent:(()=>void)|null=null;#coldUiAttempted=false;
 #inverse:CurrentFootprintInverseFullWorkflow|null=null;#inverseCurrent:(()=>void)|null=null;#inverseRequestText:string|null=null;
 #inverseRun:Promise<CurrentFootprintInverseFullWorkflowResult>|null=null;#inverseObservation:Promise<void>|null=null;#inverseSettled=false;#inverseAttempted=false;
 #inverseCleanup:Promise<void>|null=null;#inverseCleanupObservation:Promise<void>|null=null;#inverseCleanupSettled=false;#inverseCleanupFailed=false;
 #inverseControlRequest:CurrentFootprintInverseControlExecution|null=null;#inverseFailed=false;#inverseFailureObserved=false;#inverseOriginalFailure:unknown;#inverseCode:string|null=null;
 #inversePublication:Promise<void>|null=null;#inversePublicationObservation:Promise<void>|null=null;#inversePublicationSettled=true;#inversePublicationFailed=false;
 #settlement:Promise<void>|null=null;#settlementSettled=true;#shutdown:Promise<void>|null=null;#failureObserved=false;#code:string|null=null;#completed:CurrentFootprintForwardWriterWorkflowResult|null=null;
 public constructor(options:CurrentPcbDiagnosticLifecycleOptions,input:unknown){
  const request=currentFootprintForwardWriterControlActionSchema.parse(captureCurrentPcbStringClockReply(input).value);need(request.action==="prepare","PREPARE_REQUIRED");
  const {action:_action,confirmValidationOnly:_validation,...source}=request;
  const parentOperationId=request.operationId.replace("footprint-forward-flow-","footprint-forward-writer-");
  const provider=createCurrentFootprintForwardWriterCompleteOpeningProvider({...source,operationId:parentOperationId},options);
  this.#workflow=new CurrentFootprintForwardWriterWorkflow(provider,{operationId:request.operationId,parentOperationId,confirmDisposableCopy:true,acceptUnsupportedInverse:true});
  this.#request=Object.freeze(request);this.#requestText=canonicalJson(request);
  this.#workflowCurrent=captureCurrentFootprintForwardExecutionReceiver(this.#workflow,workflowPrototype,["run","cleanup","settleRecords","retained","retainedFailure","retainedFailureCode"]);
  originalCoordinators.add(this);Object.freeze(this);
 }
 #current():void{
  // oxlint-disable-next-line eslint/no-use-before-define -- Captured after class evaluation, before any coordinator construction.
  requireCurrentFootprintForwardExecutionPrototypes(coordinatorPrototype);
  need(originalCoordinators.has(this)&&Object.getPrototypeOf(this)===CurrentFootprintForwardWriterCoordinator.prototype&&Reflect.ownKeys(this).length===0,"ORIGINAL_COORDINATOR");this.#workflowCurrent();this.#inverseCurrent?.();this.#coldUiCurrent?.();
 }
 #failure(error:unknown,originalCode:string|null=null):void{if(!this.#failureObserved){this.#failureObserved=true;this.#code=originalCode??failureCode(error);}}
 public inspect(action:CurrentFootprintForwardWriterControlResult["action"]="inspect"):CurrentFootprintForwardWriterControlResult{
  this.#current();const source=this.#workflow.retained();const ended=source["terminal"]===true;
  let state:CurrentFootprintForwardWriterControlResult["state"]="running";
  if(this.#completed!==null){state="completed";}else if(ended){state="stopped";}else if(this.#executionFailed||this.#cleanupFailed){state="needs-cleanup";}else if(this.#execution===null){state="prepared";}
  return currentFootprintForwardWriterControlResultSchema.parse({schema:"easyeda-pro-control.footprint-forward-write-operation.v2",action,operationId:this.#request.operationId,state,stage:source["stage"],
   execution:{attempted:this.#execution!==null,settled:this.#executionSettled,failed:this.#executionFailed},
   cleanup:{requested:this.#cleanup!==null,settled:this.#cleanupSettled,failed:this.#cleanupFailed,writerTerminated:source["writerTerminated"],writerReleased:source["writerReleased"],savedTerminated:source["savedTerminated"],savedReleased:source["savedReleased"],publicationPending:source["publicationPending"]},
   diagnostic:{originalFailureRetained:this.#failureObserved,code:this.#code},completed:this.#completed,validationOnly:true,connectedValidation:false,ordinaryProjectsSupported:false,generalSdkWriter:false,inverseAvailable:false,explicitSaveAttempts:0});
 }
 public hasActiveReservation():boolean{
  this.#current();const source=this.#workflow.retained();const inverse=this.#inverse?.retained();
  return source["terminal"]!==true||source["publicationPending"]===true||this.#execution!==null&&!this.#executionSettled||this.#cleanup!==null&&!this.#cleanupSettled||!this.#settlementSettled||
   inverse!==undefined&&(!inverse.terminal||inverse.publicationPending)||this.#inverseRun!==null&&!this.#inverseSettled||this.#inverseCleanup!==null&&!this.#inverseCleanupSettled||!this.#inversePublicationSettled||this.#coldUi?.hasActiveReservation()===true;
 }
 /** Source/installation admission remains in the original provider immediately
  * before preparation/birth. No caller can provide those runtime guards. */
 #startCleanup():void{
  if(this.#cleanup!==null||this.#workflow.retained()["terminal"]===true){return;}
  const pending=this.#workflow.cleanup();this.#cleanup=pending;
  this.#cleanupObservation=(async():Promise<void>=>{try{await pending;}catch(error){this.#cleanupFailed=true;this.#failure(error);}finally{this.#cleanupSettled=true;}})();
 }
 // oxlint-disable-next-line eslint/require-await,typescript/require-await -- Keep the Promise API prompt while retaining original background work.
 public async run(input:unknown):Promise<CurrentFootprintForwardWriterControlResult>{
  const request=currentFootprintForwardWriterControlActionSchema.parse(captureCurrentPcbStringClockReply(input).value);this.#current();need(request.operationId===this.#request.operationId,"ORIGINAL_OPERATION");
  if(request.action==="prepare"){need(canonicalJson(request)===this.#requestText,"ORIGINAL_PREPARATION");return this.inspect("prepare");}
  if(request.action==="execute"){
   need(this.#execution===null&&this.#cleanup===null&&this.#workflow.retained()["terminal"]!==true,"EXECUTE_CONSUMED");
   const pending=this.#workflow.run();this.#execution=pending;
   this.#executionObservation=(async():Promise<void>=>{try{const result=await pending;requireOriginalCurrentFootprintForwardWriterWorkflowResult(result);this.#completed=result;}
    catch(error){this.#executionFailed=true;this.#failure(error,this.#workflow.retainedFailureCode());}finally{this.#executionSettled=true;}})();
  }else if(request.action==="cleanup"){
   this.#startCleanup();
  }else if(request.action==="settle-publication"&&this.#settlementSettled){
    this.#settlementSettled=false;const pending=this.#settleOriginalRecords();this.#settlement=pending;
    void(async():Promise<void>=>{try{await pending;}catch(error){this.#failure(error);}finally{this.#settlementSettled=true;}})();
  }
  this.#current();return this.inspect(request.action);
 }
 /** Internal object-only reader. The inspect projection remains historical
  * JSON with inverseAvailable false and cannot satisfy this getter. */
 public originalCompletedResult():CurrentFootprintForwardWriterWorkflowResult{
  this.#current();const source=this.#workflow.retained();
  need(this.#shutdown===null&&this.#execution!==null&&this.#executionSettled&&!this.#executionFailed&&this.#completed!==null&&source["terminal"]===true&&source["publicationPending"]===false&&this.#settlementSettled,"ORIGINAL_COMPLETED_RESULT");
  requireOriginalCurrentFootprintForwardWriterWorkflowResult(this.#completed);return this.#completed;
 }
 /** New consent is strict, but only this original completed controller can
  * select the source object. No public action or caller source is accepted. */
 public startOriginalInverse(input:unknown):Promise<CurrentFootprintInverseFullWorkflowResult>{
  this.#current();need(this.#shutdown===null,"ORIGINAL_SHUTDOWN_STARTED");
  const request=currentFootprintInverseFullWorkflowRequestSchema.parse(captureCurrentPcbStringClockReply(input).value),text=canonicalJson(request);
  if(this.#inverseRun!==null){need(text===this.#inverseRequestText,"ORIGINAL_INVERSE_REQUEST");return this.#inverseRun;}
  need(!this.#inverseAttempted,"ORIGINAL_INVERSE_CONSUMED");const source=this.originalCompletedResult();need(request.sourceOperationId===source.operationId,"ORIGINAL_INVERSE_SOURCE");
  this.#inverseAttempted=true;this.#inverseRequestText=text;
  const inverse=createCurrentFootprintInverseFullWorkflow(source,request);this.#inverse=inverse;
  this.#inverseCurrent=captureCurrentFootprintForwardExecutionReceiver(inverse,inversePrototype,["run","cleanup","shutdownOriginal","settleRecords","retained","retainedResult"]);
  const pending=inverse.run();this.#inverseRun=pending;
  this.#inverseObservation=(async():Promise<void>=>{try{const result=await pending;requireOriginalCurrentFootprintInverseFullWorkflowResult(result);}catch(error){this.#inverseFailed=true;this.#inverseFailure(error);}finally{this.#inverseSettled=true;}})();
  return pending;
 }
 #inverseFailure(error:unknown):void{
  if(!this.#inverseFailureObserved){this.#inverseFailureObserved=true;this.#inverseOriginalFailure=error;this.#inverseCode=failureCode(error);}
 }
 /** A distinct typed route selects only the retained completed source. Consent
  * is consumed synchronously before the genuine original inverse factory/run. */
 // oxlint-disable-next-line eslint/require-await,typescript/require-await -- Dispatch retains background work and returns the original inspection promptly.
 public async runInverse(input:unknown):Promise<CurrentFootprintInverseControlResult>{
  const request=currentFootprintInverseControlActionSchema.parse(captureCurrentPcbStringClockReply(input).value);this.#current();
  if(request.action==="execute"){
   need(this.#shutdown===null&&this.#inverseControlRequest===null&&!this.#inverseAttempted,"ORIGINAL_INVERSE_CONTROL_CONSUMED");
   const source=this.originalCompletedResult();need(source.operationId===request.sourceOperationId,"ORIGINAL_INVERSE_SOURCE");
   this.#inverseControlRequest=Object.freeze(request);
   const {schema:_schema,action:_action,confirmValidationOnly:_validation,confirmDisposableProject:_disposable,...consent}=request;
   try{void this.startOriginalInverse(consent);}catch(error){this.#inverseFailed=true;this.#inverseSettled=true;this.#inverseFailure(error);}
  }else{
   need(this.#inverseControlRequest!==null&&request.operationId===this.#inverseControlRequest.operationId,"ORIGINAL_INVERSE_CONTROL_OPERATION");
   if(request.action==="cleanup"){this.#startInverseCleanup();}
   else if(request.action==="settle-publication"&&this.#inversePublicationSettled){
    this.#inversePublicationSettled=false;this.#inversePublicationFailed=false;
    const pending=Promise.try(()=>this.#inverse?.settleRecords());this.#inversePublication=pending;
    this.#inversePublicationObservation=(async():Promise<void>=>{try{await pending;}catch(error){this.#inversePublicationFailed=true;this.#inverseFailure(error);}finally{this.#inversePublicationSettled=true;}})();
   }
  }
  this.#current();return this.inspectInverse(request.action);
 }
 public originalInverseFailure():unknown{this.#current();return this.#inverseOriginalFailure;}
 public inspectInverse(action:CurrentFootprintInverseControlResult["action"]="inspect"):CurrentFootprintInverseControlResult{
  this.#current();const request=this.#inverseControlRequest;need(request!==null,"ORIGINAL_INVERSE_CONTROL_REQUIRED");
  const completed=this.originalInverseResult(),source=this.#inverse?.retained();
  let state:CurrentFootprintInverseControlResult["state"]="running";
  if(completed!==null&&this.#inverseSettled&&source?.resourcesClosed===true&&!source.publicationPending&&this.#inversePublicationSettled){state="completed";}
  else if(source?.terminal===true||source===undefined&&this.#inverseCleanupSettled){state="stopped";}
  else if(this.#inverseFailed||this.#inverseCleanupFailed||this.#inversePublicationFailed){state="needs-cleanup";}
  return currentFootprintInverseControlResultSchema.parse({
   schema:"easyeda-pro-control.footprint-inverse-operation.v1",action,operationId:request.operationId,sourceOperationId:request.sourceOperationId,state,stage:source?.stage??"preparation",
   execution:{attempted:true,settled:this.#inverseSettled,failed:this.#inverseFailed},
   cleanup:{requested:this.#inverseCleanup!==null,settled:this.#inverseCleanupSettled,failed:this.#inverseCleanupFailed,originalResourcesClosed:source?.resourcesClosed??this.#inverseCleanupSettled,publicationPending:source?.publicationPending??false,cleanupPublicationPending:source?.cleanupPublicationPending??false},
   publication:{attempted:this.#inversePublication!==null,settled:this.#inversePublicationSettled,failed:this.#inversePublicationFailed},
   diagnostic:{originalFailureRetained:this.#inverseFailureObserved,code:this.#inverseCode},completed,
   managerOnlyColdAbsence:true,nativeUiTaskAbsenceVerified:false,publicSdkParity:false,wholeInverseVerified:false,
   validationOnly:true,connectedValidation:false,ordinaryProjectsSupported:false,generalSdkWriter:false,executionAuthorized:false,saveAuthorized:false,explicitSaveAttempts:0,
  });
 }
 /** A distinct original-result route; it never upgrades historical inverse V1. */
 public runInverseColdUi(input:unknown):Promise<CurrentFootprintInverseColdUiControlResult>{
  const request=currentFootprintInverseColdUiControlActionSchema.parse(captureCurrentPcbStringClockReply(input).value);this.#current();
  if(request.action==="execute"){
   need(this.#shutdown===null&&!this.#coldUiAttempted&&this.#coldUi===null,"ORIGINAL_COLD_UI_CONSUMED");
   const source=this.originalInverseResult(),state=this.#inverse?.retained();
   need(source!==null&&source.operationId===request.sourceOperationId&&this.#inverseSettled&&!this.#inverseFailed&&state?.terminal===true&&state.resourcesClosed&&!state.publicationPending&&this.#inversePublicationSettled,"ORIGINAL_COMPLETED_INVERSE");
   this.#coldUiAttempted=true;
   const continuation=createCurrentFootprintInverseColdUiContinuation(source,request);this.#coldUi=continuation;
   this.#coldUiCurrent=captureCurrentFootprintForwardExecutionReceiver(continuation,coldUiPrototype,["run","inspect","hasActiveReservation","cleanup","settleRecords","shutdownOriginal"]);
  }
  need(this.#coldUi!==null,"ORIGINAL_COLD_UI_REQUIRED");return this.#coldUi.run(request);
 }
 public inspectInverseColdUi(action:CurrentFootprintInverseColdUiControlResult["action"]="inspect"):CurrentFootprintInverseColdUiControlResult{
  this.#current();need(this.#coldUi!==null,"ORIGINAL_COLD_UI_REQUIRED");return this.#coldUi.inspect(action);
 }
 #startInverseCleanup():void{
  if(this.#inverseCleanup!==null||this.#inverse===null&&this.#inverseControlRequest===null){return;}
  // oxlint-disable-next-line typescript/no-invalid-void-type -- Resolve only the original cleanup Promise<void> while reserving its latch before dispatch.
  const completion=Promise.withResolvers<void>();const pending=completion.promise;this.#inverseCleanup=pending;
  try{completion.resolve(this.#inverse?.cleanup());}catch(error){completion.reject(error);}
  this.#inverseCleanupObservation=(async():Promise<void>=>{try{await pending;}catch(error){this.#inverseCleanupFailed=true;this.#inverseFailure(error);}finally{this.#inverseCleanupSettled=true;}})();
 }
 async #settleOriginalRecords():Promise<void>{
  const results=await Promise.allSettled([this.#workflow.settleRecords()]);
  const failures=results.filter(value=>value.status==="rejected").map(value=>value.reason as unknown);
  if(failures.length>0){throw new AggregateError(failures,"FORWARD_WRITER_COORDINATOR_PUBLICATION");}
 }
 public originalInverseResult():CurrentFootprintInverseFullWorkflowResult|null{
  this.#current();
  const result=this.#inverse?.retainedResult()??null;
  if(result!==null){requireOriginalCurrentFootprintInverseFullWorkflowResult(result);}
  return result;
 }
 /** Internal facade shutdown selects only this retained original operation.
  * Original uncertain work remains retained; no timeout becomes exit proof. */
 public shutdownOriginal():Promise<void>{
  this.#current();if(this.#shutdown!==null){return this.#shutdown;}
  this.#shutdown=(async():Promise<void>=>{
   this.#startInverseCleanup();
   const joinedContinuations=Promise.allSettled([Promise.try(()=>this.#inverse?.shutdownOriginal()),Promise.try(()=>this.#coldUi?.shutdownOriginal())]);
   if(this.#workflow.retained()["terminal"]!==true){
    this.#startCleanup();
    await Promise.allSettled([this.#cleanup]);
   }
   await Promise.allSettled([...(this.#execution===null?[]:[this.#execution]),...(this.#executionObservation===null?[]:[this.#executionObservation]),...(this.#cleanupObservation===null?[]:[this.#cleanupObservation]),...(this.#settlement===null?[]:[this.#settlement]),joinedContinuations,...(this.#inverseRun===null?[]:[this.#inverseRun]),...(this.#inverseObservation===null?[]:[this.#inverseObservation]),...(this.#inverseCleanupObservation===null?[]:[this.#inverseCleanupObservation]),...(this.#inversePublicationObservation===null?[]:[this.#inversePublicationObservation])]);
   const [inverseOutcome,coldUiOutcome]=await joinedContinuations;
   if(inverseOutcome?.status==="rejected"){throw inverseOutcome.reason;}
   if(coldUiOutcome?.status==="rejected"){throw coldUiOutcome.reason;}
   await this.#settleOriginalRecords();this.#current();need(!this.hasActiveReservation(),"ORIGINAL_CLEANUP_PENDING");
  })();return this.#shutdown;
 }
}
const coordinatorPrototype=captureCurrentFootprintForwardExecutionPrototypes(CurrentFootprintForwardWriterCoordinator.prototype);

// oxlint-disable-next-line typescript/unbound-method -- Invoked only with the same original private-field coordinator receiver.
const originalCompleted=CurrentFootprintForwardWriterCoordinator.prototype.originalCompletedResult;
export function requireOriginalCurrentFootprintForwardWriterCoordinatorResult(coordinator:CurrentFootprintForwardWriterCoordinator):CurrentFootprintForwardWriterWorkflowResult{
 need(originalCoordinators.has(coordinator),"ORIGINAL_COORDINATOR");return originalCompleted.call(coordinator);
}
