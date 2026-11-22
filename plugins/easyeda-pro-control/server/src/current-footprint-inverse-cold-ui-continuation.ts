/* oxlint-disable import/max-dependencies -- One original continuation binds historical inverse, saved/cold registries, the new native generation, strict control schemas and original-receiver guards. */
/** Genuine completed inverse -> original saved/cold generation -> one new UI task.
 * No native owner, result DTO, callback or factory is accepted from a caller. */
import {types} from "node:util";
import { originalNativeOrSourceErrorCode } from "./original-native-error-code.ts";
import {canonicalJson} from "./core.ts";
import {captureCurrentPcbStringClockReply} from "./current-pcb-string-clock-reply.ts";
import {requireOriginalCurrentFootprintInverseFullWorkflowResult} from "./current-footprint-inverse-full-workflow.ts";
import type {CurrentFootprintInverseFullWorkflowResult} from "./current-footprint-inverse-full-workflow-contract.ts";
import {requireOriginalCurrentFootprintInverseFullNativeOpeningResult} from "./current-footprint-inverse-full-native-generation.ts";
import {requireOriginalCurrentFootprintInverseNativeDeleteSavedColdGeneration} from "./current-footprint-inverse-native-delete-saved-generation.ts";
import {CurrentFootprintInverseNativeDeleteColdUiGeneration,createCurrentFootprintInverseNativeDeleteColdUiAfterColdGeneration} from "./current-footprint-inverse-native-delete-cold-ui-generation.ts";
import type {CurrentFootprintInverseNativeDeleteColdUiAbsence} from "./current-footprint-inverse-native-delete-cold-ui-absence.ts";
import {currentFootprintInverseColdUiControlActionSchema,currentFootprintInverseColdUiControlResultSchema} from "./current-footprint-inverse-cold-ui-control-contract.ts";
import type {CurrentFootprintInverseColdUiControlExecution,CurrentFootprintInverseColdUiControlResult} from "./current-footprint-inverse-cold-ui-control-contract.ts";
import {captureCurrentFootprintForwardExecutionPrototypes,captureCurrentFootprintForwardExecutionReceiver,requireCurrentFootprintForwardExecutionPrototypes} from "./current-footprint-forward-execution-opening-identity.ts";

const INTERNAL=Object.freeze({});const originals=new WeakSet<object>();const claims=new WeakSet<CurrentFootprintInverseFullWorkflowResult>();
const generationPrototype=captureCurrentFootprintForwardExecutionPrototypes(CurrentFootprintInverseNativeDeleteColdUiGeneration.prototype);
function need(value:boolean,code:string):asserts value{if(!value){throw new Error(`INVERSE_COLD_UI_CONTINUATION_${code}`);}}
function failureCode(error:unknown):string|null{
 const code=originalNativeOrSourceErrorCode(error);if(code!==null){return code;}
 if(!Error.isError(error)||types.isProxy(error)){return null;}const value=Object.getOwnPropertyDescriptor(error,"message")?.value as unknown;return typeof value==="string"&&/^[A-Z][A-Z0-9_:-]{0,255}$/u.test(value)?value:null;
}
export class CurrentFootprintInverseColdUiContinuation{
 readonly #source:CurrentFootprintInverseFullWorkflowResult;readonly #sourceOriginal:ReturnType<typeof requireOriginalCurrentFootprintInverseFullWorkflowResult>;
 readonly #request:CurrentFootprintInverseColdUiControlExecution;readonly #requestText:string;
 #generation:CurrentFootprintInverseNativeDeleteColdUiGeneration|null=null;#generationCurrent:(()=>void)|null=null;
 #attempted=false;#run:Promise<CurrentFootprintInverseNativeDeleteColdUiAbsence>|null=null;#runObservation:Promise<void>|null=null;#runSettled=false;#runFailed=false;
 #result:CurrentFootprintInverseNativeDeleteColdUiAbsence|null=null;#cleanup:Promise<undefined>|null=null;#cleanupObservation:Promise<void>|null=null;#cleanupSettled=false;#cleanupFailed=false;
 #publication:Promise<undefined>|null=null;#publicationObservation:Promise<void>|null=null;#publicationSettled=true;#publicationFailed=false;
 #shutdown:Promise<void>|null=null;#failureObserved=false;#failure:unknown;#code:string|null=null;
 public constructor(internal:object,source:CurrentFootprintInverseFullWorkflowResult,request:CurrentFootprintInverseColdUiControlExecution){
  need(internal===INTERNAL,"INTERNAL_FACTORY");this.#sourceOriginal=requireOriginalCurrentFootprintInverseFullWorkflowResult(source);
  need(source.operationId===request.sourceOperationId,"ORIGINAL_SOURCE_OPERATION");this.#source=source;this.#request=Object.freeze(request);this.#requestText=canonicalJson(request);originals.add(this);Object.freeze(this);
 }
 #current():void{
  // oxlint-disable-next-line eslint/no-use-before-define -- Captured once after class evaluation and before construction.
  requireCurrentFootprintForwardExecutionPrototypes(continuationPrototype);
  need(originals.has(this)&&Object.getPrototypeOf(this)===CurrentFootprintInverseColdUiContinuation.prototype&&Reflect.ownKeys(this).length===0,"ORIGINAL_CONTINUATION");
  const source=requireOriginalCurrentFootprintInverseFullWorkflowResult(this.#source);need(source.source===this.#sourceOriginal.source&&source.opening===this.#sourceOriginal.opening&&source.saved===this.#sourceOriginal.saved,"ORIGINAL_SOURCE");this.#generationCurrent?.();
  if(this.#result!==null){need(this.#generation!==null,"ORIGINAL_RESULT_OWNER");this.#generation.originalResult(this.#result);}
 }
 #remember(error:unknown):void{if(!this.#failureObserved){this.#failureObserved=true;this.#failure=error;this.#code=failureCode(error);}}
 #start():void{
  this.#current();need(!this.#attempted&&this.#shutdown===null,"ATTEMPT_CONSUMED");this.#attempted=true;
  const completion=Promise.withResolvers<CurrentFootprintInverseNativeDeleteColdUiAbsence>();this.#run=completion.promise;
  this.#runObservation=(async():Promise<void>=>{try{const result=await completion.promise;this.#current();need(this.#generation!==null,"ORIGINAL_GENERATION");this.#generation.originalResult(result);this.#result=result;}catch(error){this.#runFailed=true;this.#remember(error);}finally{this.#runSettled=true;}})();
  try{
   const opening=requireOriginalCurrentFootprintInverseFullNativeOpeningResult(this.#sourceOriginal.opening);
   const cold=requireOriginalCurrentFootprintInverseNativeDeleteSavedColdGeneration(this.#sourceOriginal.saved);
   need(opening.saved.originalCompletedColdGeneration(this.#sourceOriginal.saved)===cold,"ORIGINAL_SAVED_COLD");
   const generation=createCurrentFootprintInverseNativeDeleteColdUiAfterColdGeneration(cold);this.#generation=generation;
   this.#generationCurrent=captureCurrentFootprintForwardExecutionReceiver(generation,generationPrototype,["start","cleanup","settlePublication","retained","originalControlState","originalResult"]);
   completion.resolve(generation.start());
  }catch(error){completion.reject(error);}
 }
 public run(input:unknown):Promise<CurrentFootprintInverseColdUiControlResult>{
  const request=currentFootprintInverseColdUiControlActionSchema.parse(captureCurrentPcbStringClockReply(input).value);this.#current();need(request.operationId===this.#request.operationId,"ORIGINAL_OPERATION");
  if(request.action==="execute"){need(canonicalJson(request)===this.#requestText,"ORIGINAL_REQUEST");this.#start();}
  else if(request.action==="cleanup"){void this.cleanup();}
  else if(request.action==="settle-publication"){void this.settleRecords();}
  return Promise.resolve(this.inspect(request.action));
 }
 public inspect(action:CurrentFootprintInverseColdUiControlResult["action"]="inspect"):CurrentFootprintInverseColdUiControlResult{
  this.#current();const original=this.#generation?.retained();const journal=this.#generation?.originalControlState();
  const resourcesClosed=this.#result!==null||original?.cleaned===true&&(!original.ownerRetained||original.released&&original.helperClosed)||original===undefined&&this.#cleanupSettled&&!this.#cleanupFailed;
  let state:CurrentFootprintInverseColdUiControlResult["state"]="running";
  if(this.#result!==null&&this.#runSettled&&!this.#runFailed&&resourcesClosed&&journal?.journalTerminal===true&&!journal.publicationPending&&this.#publicationSettled&&!this.#publicationFailed){state="completed";}
  else if(this.#cleanupSettled&&resourcesClosed&&journal?.publicationPending!==true&&journal?.journalUnsettled!==true){state="stopped";}
  else if(this.#runFailed||this.#cleanupFailed||this.#publicationFailed){state="needs-cleanup";}
  return currentFootprintInverseColdUiControlResultSchema.parse({schema:"easyeda-pro-control.footprint-inverse-cold-ui-operation.v1",action,operationId:this.#request.operationId,sourceOperationId:this.#request.sourceOperationId,state,stage:journal?.stage??"checkpoint",
   execution:{attempted:true,settled:this.#runSettled,failed:this.#runFailed},cleanup:{requested:this.#cleanup!==null,settled:this.#cleanupSettled,failed:this.#cleanupFailed,originalResourcesClosed:resourcesClosed,publicationPending:journal?.publicationPending??false,journalTerminal:journal?.journalTerminal??false,journalUnsettled:journal?.journalUnsettled??false},
   publication:{attempted:this.#publication!==null,settled:this.#publicationSettled,failed:this.#publicationFailed},diagnostic:{originalFailureRetained:this.#failureObserved,code:this.#code},
   originalInverse:this.#source,coldUiAbsence:this.#result,nativeUiTaskAbsenceVerified:this.#result!==null,validationOnly:true,connectedValidation:false,ordinaryProjectsSupported:false,generalSdkWriter:false,publicSdkParity:false,wholeInverseVerified:false,executionAuthorized:false,saveAuthorized:false,explicitSaveAttempts:0});
 }
 public hasActiveReservation():boolean{
  this.#current();const state=this.inspect();return this.#run!==null&&!this.#runSettled||state.cleanup.requested&&!state.cleanup.settled||!state.publication.settled||state.cleanup.publicationPending||state.cleanup.journalUnsettled||!state.cleanup.originalResourcesClosed;
 }
 /** Reserve before synchronously cutting off this original generation. A throw consumes cleanup. */
 public cleanup():Promise<undefined>{
  this.#current();if(this.#cleanup!==null){return this.#cleanup;}
  const completion=Promise.withResolvers<undefined>();this.#cleanup=completion.promise;
  this.#cleanupObservation=(async():Promise<void>=>{try{await completion.promise;}catch(error){this.#cleanupFailed=true;this.#remember(error);}finally{this.#cleanupSettled=true;}})();
  try{const original=this.#generation?.cleanup();completion.resolve((async():Promise<undefined>=>{if(original!==undefined){await original;}await Promise.allSettled(this.#runObservation===null?[]:[this.#runObservation]);this.#current();return undefined;})());}catch(error){completion.reject(error);}
  return completion.promise;
 }
 public settleRecords():Promise<undefined>{
  this.#current();if(!this.#publicationSettled&&this.#publication!==null){return this.#publication;}
  this.#publicationSettled=false;this.#publicationFailed=false;const completion=Promise.withResolvers<undefined>();this.#publication=completion.promise;
  this.#publicationObservation=(async():Promise<void>=>{try{await completion.promise;}catch(error){this.#publicationFailed=true;this.#remember(error);}finally{this.#publicationSettled=true;}})();
  try{const original=this.#generation?.settlePublication();completion.resolve((async():Promise<undefined>=>{if(original!==undefined){await original;}this.#current();return undefined;})());}catch(error){completion.reject(error);}
  return completion.promise;
 }
 public shutdownOriginal():Promise<void>{
  this.#current();if(this.#shutdown!==null){return this.#shutdown;}
  const cleanup=this.cleanup();this.#shutdown=(async():Promise<void>=>{
   await Promise.allSettled([cleanup,...(this.#runObservation===null?[]:[this.#runObservation]),...(this.#cleanupObservation===null?[]:[this.#cleanupObservation]),...(this.#publicationObservation===null?[]:[this.#publicationObservation])]);
   await this.settleRecords();this.#current();need(!this.hasActiveReservation(),"ORIGINAL_CLEANUP_PENDING");
  })();return this.#shutdown;
 }
 public retainedFailure():unknown{this.#current();return this.#failure;}
}
Object.freeze(CurrentFootprintInverseColdUiContinuation.prototype);Object.freeze(CurrentFootprintInverseColdUiContinuation);
const continuationPrototype=captureCurrentFootprintForwardExecutionPrototypes(CurrentFootprintInverseColdUiContinuation.prototype);
export function createCurrentFootprintInverseColdUiContinuation(source:CurrentFootprintInverseFullWorkflowResult,input:unknown):CurrentFootprintInverseColdUiContinuation{
 const request=currentFootprintInverseColdUiControlActionSchema.parse(captureCurrentPcbStringClockReply(input).value);need(request.action==="execute","EXECUTE_REQUIRED");requireOriginalCurrentFootprintInverseFullWorkflowResult(source);need(!claims.has(source),"SOURCE_CONSUMED");
 const continuation=new CurrentFootprintInverseColdUiContinuation(INTERNAL,source,request);claims.add(source);return continuation;
}
