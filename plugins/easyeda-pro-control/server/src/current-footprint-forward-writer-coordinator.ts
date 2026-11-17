/** One original controlled disposable workflow per facade. Execute/cleanup
 * retain their original work and return promptly; inspection never adopts it. */
import { types } from "node:util";
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
type Preparation=Extract<CurrentFootprintForwardWriterControlAction,{action:"prepare"}>;
const originalCoordinators=new WeakSet<object>();
function need(value:boolean,code:string):asserts value{if(!value){throw new Error(`FORWARD_WRITER_COORDINATOR_${code}`);}}
function failureCode(error:unknown):string|null{
 if(!Error.isError(error)||types.isProxy(error)){return null;}const descriptor=Object.getOwnPropertyDescriptor(error,"message"),message=descriptor?.value as unknown;
 return typeof message==="string"&&/^[A-Z][A-Z0-9_:-]{0,255}$/u.test(message)?message:null;
}
export class CurrentFootprintForwardWriterCoordinator{
 readonly #request:Preparation;readonly #requestText:string;readonly #workflow:CurrentFootprintForwardWriterWorkflow;readonly #workflowCurrent:()=>void;
 #execution:Promise<CurrentFootprintForwardWriterWorkflowResult>|null=null;#executionObservation:Promise<void>|null=null;#executionSettled=false;#executionFailed=false;
 #cleanup:Promise<void>|null=null;#cleanupObservation:Promise<void>|null=null;#cleanupSettled=false;#cleanupFailed=false;
 #settlement:Promise<void>|null=null;#settlementSettled=true;#shutdown:Promise<void>|null=null;#failureObserved=false;#code:string|null=null;#completed:CurrentFootprintForwardWriterWorkflowResult|null=null;
 public constructor(options:CurrentPcbDiagnosticLifecycleOptions,input:unknown){
  const request=currentFootprintForwardWriterControlActionSchema.parse(captureCurrentPcbStringClockReply(input).value);need(request.action==="prepare","PREPARE_REQUIRED");
  const {action:_action,confirmValidationOnly:_validation,...source}=request;
  const parentOperationId=request.operationId.replace("footprint-forward-flow-","footprint-forward-writer-");
  const provider=createCurrentFootprintForwardWriterCompleteOpeningProvider({...source,operationId:parentOperationId},options);
  this.#workflow=new CurrentFootprintForwardWriterWorkflow(provider,{operationId:request.operationId,parentOperationId,confirmDisposableCopy:true,acceptUnsupportedInverse:true});
  this.#request=Object.freeze(request);this.#requestText=canonicalJson(request);
  this.#workflowCurrent=captureCurrentFootprintForwardExecutionReceiver(this.#workflow,workflowPrototype,["run","cleanup","settleRecords","retained","retainedFailure"]);
  originalCoordinators.add(this);Object.freeze(this);
 }
 #current():void{
  // oxlint-disable-next-line eslint/no-use-before-define -- Captured after class evaluation, before any coordinator construction.
  requireCurrentFootprintForwardExecutionPrototypes(coordinatorPrototype);
  need(originalCoordinators.has(this)&&Object.getPrototypeOf(this)===CurrentFootprintForwardWriterCoordinator.prototype&&Reflect.ownKeys(this).length===0,"ORIGINAL_COORDINATOR");this.#workflowCurrent();
 }
 #failure(error:unknown):void{if(!this.#failureObserved){this.#failureObserved=true;this.#code=failureCode(error);}}
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
  this.#current();const source=this.#workflow.retained();
  return source["terminal"]!==true||source["publicationPending"]===true||this.#execution!==null&&!this.#executionSettled||this.#cleanup!==null&&!this.#cleanupSettled||!this.#settlementSettled;
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
    catch(error){this.#executionFailed=true;this.#failure(error);}finally{this.#executionSettled=true;}})();
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

 async #settleOriginalRecords():Promise<void>{
  const results=await Promise.allSettled([this.#workflow.settleRecords()]);
  const failures=results.filter(value=>value.status==="rejected").map(value=>value.reason as unknown);
  if(failures.length>0){throw new AggregateError(failures,"FORWARD_WRITER_COORDINATOR_PUBLICATION");}
 }
 /** Internal facade shutdown selects only this retained original operation.
  * Original uncertain work remains retained; no timeout becomes exit proof. */
 public shutdownOriginal():Promise<void>{
  this.#current();if(this.#shutdown!==null){return this.#shutdown;}
  this.#shutdown=(async():Promise<void>=>{
    if(this.#workflow.retained()["terminal"]!==true){
    this.#startCleanup();
    await Promise.allSettled([this.#cleanup]);
   }
   await Promise.allSettled([...(this.#execution===null?[]:[this.#execution]),...(this.#executionObservation===null?[]:[this.#executionObservation]),...(this.#cleanupObservation===null?[]:[this.#cleanupObservation]),...(this.#settlement===null?[]:[this.#settlement])]);
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
