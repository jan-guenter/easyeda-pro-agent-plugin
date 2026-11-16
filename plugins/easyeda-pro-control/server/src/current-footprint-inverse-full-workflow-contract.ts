/** Fixed internal consent and durable facts for the original full-copy inverse.
 * Historical JSON is never an owner, checkpoint, body or resume capability. */
import {z} from "zod";
import {canonicalJson,sha256Json} from "./core.ts";
import {currentFootprintForwardWriterWorkflowIdSchema} from "./current-footprint-forward-writer-workflow-contract.ts";

export const CURRENT_FOOTPRINT_INVERSE_FULL_WORKFLOW_PROFILE="private.current-footprint-inverse-full-workflow.v1";
export const CURRENT_FOOTPRINT_INVERSE_FULL_WORKFLOW_BUDGET=Object.freeze({
 stages:3,normalRecords:8,cleanupRecords:4,records:12,recordBytes:4096,manifestBytes:65_536,artifactPathUnits:1024,
});
export const currentFootprintInverseFullWorkflowIdSchema=z.string().max(96).regex(/^footprint-inverse-flow-[a-z0-9][a-z0-9-]*$(?![\s\S])/u);
export const currentFootprintInverseFullWorkflowRequestSchema=z.strictObject({
 operationId:currentFootprintInverseFullWorkflowIdSchema,
 sourceOperationId:currentFootprintForwardWriterWorkflowIdSchema,
 confirmDisposableCopiedFootprintDelete:z.literal(true),
 confirmDeleteTriggeredPersistence:z.literal(true),confirmNoExplicitSave:z.literal(true),
 acceptExistingProfileEffects:z.literal(true),acceptNormalOpenEffects:z.literal(true),
 acceptDebuggerPauseEffects:z.literal(true),acceptCacheInvalidationEffects:z.literal(true),
 acceptManagerOnlyColdAbsence:z.literal(true),acceptUnsupportedNativeUiTaskAbsence:z.literal(true),
}).refine(value=>value.operationId.slice("footprint-inverse-flow-".length)===value.sourceOperationId.slice("footprint-forward-flow-".length),"The operation must identify this exact original source workflow.");
export type CurrentFootprintInverseFullWorkflowRequest=Readonly<z.infer<typeof currentFootprintInverseFullWorkflowRequestSchema>>;
export const CURRENT_FOOTPRINT_INVERSE_FULL_WORKFLOW_STAGES=Object.freeze(["preparation","opening","delete-persistence-cold"]as const);
export type CurrentFootprintInverseFullWorkflowStage=(typeof CURRENT_FOOTPRINT_INVERSE_FULL_WORKFLOW_STAGES)[number];
const stage=z.enum(CURRENT_FOOTPRINT_INVERSE_FULL_WORKFLOW_STAGES);
const digest=z.string().regex(/^[a-f\d]{64}$(?![\s\S])/u);
export const currentFootprintInverseFullWorkflowResultSchema=z.strictObject({
 profile:z.literal("private.current-footprint-inverse-full-workflow-result.v1"),
 operationId:currentFootprintInverseFullWorkflowIdSchema,sourceOperationId:currentFootprintForwardWriterWorkflowIdSchema,
 targetUuid:z.string().regex(/^(?:[a-f\d]{16}|[a-f\d]{32})$(?![\s\S])/u),
 persistenceVerified:z.literal(true),nativeManagerColdAbsenceVerified:z.literal(true),selectedPreferencesUnchanged:z.literal(true),
 originalWriterAndColdHelpersReleased:z.literal(true),explicitSaveAttempts:z.literal(0),
 nativeUiTaskAbsenceVerified:z.literal(false),publicSdkParity:z.literal(false),wholeInverseVerified:z.literal(false),executionAuthorized:z.literal(false),
});
export type CurrentFootprintInverseFullWorkflowResult=Readonly<z.infer<typeof currentFootprintInverseFullWorkflowResultSchema>>;
export const currentFootprintInverseFullWorkflowEvidenceSchemas=Object.freeze({
 "operation-intent":z.strictObject({request:currentFootprintInverseFullWorkflowRequestSchema}),
 "stage-intent":z.strictObject({stage}),
 "stage-result":z.strictObject({stage,originalCompletionObserved:z.literal(true),evidenceSha256:digest}),
 complete:currentFootprintInverseFullWorkflowResultSchema,
 failure:z.strictObject({stage,originalErrorRetained:z.literal(true)}),
 "cleanup-intent":z.strictObject({confirmOriginalJobsOnly:z.literal(true),normalWorkStopped:z.literal(true)}),
 "cleanup-result":z.strictObject({originalOwnersClosed:z.literal(true),originalPendingJoined:z.literal(true),released:z.literal(true)}),
 "terminal-failure":z.strictObject({originalOwnersClosed:z.literal(true),originalPendingJoined:z.literal(true),released:z.literal(true)}),
});
export const currentFootprintInverseFullWorkflowRecordSchema=z.strictObject({
 schema:z.literal("easyeda-pro-control.footprint-inverse-flow-record.v1"),
 operationId:currentFootprintInverseFullWorkflowIdSchema,sequence:z.number().int().min(0).max(11),
 previousSha256:digest.nullable(),kind:z.enum(["operation-intent","stage-intent","stage-result","complete","failure","cleanup-intent","cleanup-result","terminal-failure"]),
 evidence:z.record(z.string(),z.unknown()),executionAuthorized:z.literal(false),saveAuthorized:z.literal(false),
}).superRefine((value,context)=>{
 if(!currentFootprintInverseFullWorkflowEvidenceSchemas[value.kind].safeParse(value.evidence).success){context.addIssue({code:"custom",path:["evidence"],message:"Malformed fixed inverse workflow facts."});}
 if(Buffer.byteLength(`${JSON.stringify(value)}\n`)>CURRENT_FOOTPRINT_INVERSE_FULL_WORKFLOW_BUDGET.recordBytes){context.addIssue({code:"custom",message:"Inverse workflow record bound."});}
});
export type CurrentFootprintInverseFullWorkflowRecord=Readonly<z.infer<typeof currentFootprintInverseFullWorkflowRecordSchema>>;
function need(value:boolean,code:string):asserts value{if(!value){throw new Error(`INVERSE_FULL_WORKFLOW_CHAIN_${code}`);}}
export function assertCurrentFootprintInverseFullWorkflowChain(input:readonly CurrentFootprintInverseFullWorkflowRecord[]):void{
 need(input.length<=CURRENT_FOOTPRINT_INVERSE_FULL_WORKFLOW_BUDGET.records,"BOUND");
 let stageIndex=0;let active:CurrentFootprintInverseFullWorkflowStage|null=null;let failed=false;let cleanup=false;let closed=false;let terminal=false;
 for(const [index,entry]of input.entries()){
  currentFootprintInverseFullWorkflowRecordSchema.parse(entry);need(!terminal&&entry.sequence===index&&entry.operationId===input[0]?.operationId,"ORDER");
  need(entry.previousSha256===(index===0?null:sha256Json(input[index-1])),"LINK");
  if(index===0){need(entry.kind==="operation-intent","FIRST");}
  else{
  const evidence=entry.evidence;
  switch(entry.kind){
   case"operation-intent": {throw new Error("INVERSE_FULL_WORKFLOW_CHAIN_DUPLICATE_INTENT");
   }
   case"stage-intent": {need(!failed&&!cleanup&&active===null&&evidence["stage"]===CURRENT_FOOTPRINT_INVERSE_FULL_WORKFLOW_STAGES[stageIndex],"STAGE_INTENT");active=CURRENT_FOOTPRINT_INVERSE_FULL_WORKFLOW_STAGES[stageIndex]??null;break;
   }
   case"stage-result": {need(!failed&&!cleanup&&active!==null&&evidence["stage"]===active,"STAGE_RESULT");active=null;stageIndex+=1;break;
   }
   case"failure": {
    const previous=CURRENT_FOOTPRINT_INVERSE_FULL_WORKFLOW_STAGES[Math.max(0,stageIndex-1)];const next=CURRENT_FOOTPRINT_INVERSE_FULL_WORKFLOW_STAGES[stageIndex];
    need(!failed&&!cleanup&&(active===null?evidence["stage"]===previous||evidence["stage"]===next:evidence["stage"]===active),"FAILURE_STAGE");failed=true;break;
   }
   case"cleanup-intent": {need(failed&&!cleanup,"FAILURE_BEFORE_CLEANUP");cleanup=true;break;
   }
   case"cleanup-result": {need(failed&&cleanup&&!closed,"ORIGINAL_CLEANUP");closed=true;break;
   }
   case"complete": {need(!failed&&!cleanup&&active===null&&stageIndex===CURRENT_FOOTPRINT_INVERSE_FULL_WORKFLOW_STAGES.length&&evidence["operationId"]===entry.operationId&&evidence["sourceOperationId"]===currentFootprintInverseFullWorkflowEvidenceSchemas["operation-intent"].parse(input[0]?.evidence).request.sourceOperationId,"COMPLETE");terminal=true;break;
   }
   case"terminal-failure": {need(failed&&cleanup&&closed,"CLOSED_FAILURE");terminal=true;break;
   }
   default: {need(false,"KIND");
   }
  }
  }
 }
 const first=input[0];if(first!==undefined){const request=currentFootprintInverseFullWorkflowEvidenceSchemas["operation-intent"].parse(first.evidence).request;need(request.operationId===first.operationId,"REQUEST");}
}
export function currentFootprintInverseFullWorkflowRequestText(input:CurrentFootprintInverseFullWorkflowRequest):string{return canonicalJson(currentFootprintInverseFullWorkflowRequestSchema.parse(input));}
