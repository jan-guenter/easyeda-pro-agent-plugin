/** Offline discovery allocates no workflow and cannot select a saved source. */
import { z } from "zod";
import { CURRENT_FOOTPRINT_INVERSE_CONTROL_TOOL, currentFootprintInverseControlActionSchema, currentFootprintInverseControlResultSchema } from "./current-footprint-inverse-control-contract.ts";
import { CURRENT_FOOTPRINT_INVERSE_FULL_WORKFLOW_BUDGET } from "./current-footprint-inverse-full-workflow-contract.ts";
import { facadeToolRegistered } from "./facade-mode.ts";

export function queryCurrentFootprintInverseControl(includeSchemas=false):Record<string,unknown>{
 return {offline:true,tool:CURRENT_FOOTPRINT_INVERSE_CONTROL_TOOL,mountedInPublicUtilities:facadeToolRegistered("public-utilities-only",CURRENT_FOOTPRINT_INVERSE_CONTROL_TOOL),
  validationOnly:true,connectedValidation:false,ordinaryProjectsSupported:false,generalSdkWriter:false,
  runtimeAdmissionRequired:true,sourceAdmissionRequired:true,originalCompletedForwardCoordinatorRequired:true,independentInverseConfirmationsRequired:true,
  maximumInverseAttempts:1,maximumExplicitSaveAttempts:0,deleteTriggeredPersistence:true,managerOnlyColdAbsence:true,
  nativeUiTaskAbsenceVerified:false,publicSdkParity:false,wholeInverseVerified:false,executionAuthorized:false,saveAuthorized:false,
  actions:["execute","inspect","cleanup","settle-publication"],workflowBudget:CURRENT_FOOTPRINT_INVERSE_FULL_WORKFLOW_BUDGET,
  limitations:[
   "Execute selects only this facade's genuine completed and fully released forward/saved result; no source, checkpoint, owner, callback, program or clock input is accepted.",
   "Fresh disposable inverse confirmations reserve one attempt before dispatch. The retained original workflow runs through native delete, persistence, full closed SQL and a fresh manager-only cold reader.",
   "Inspect, cleanup and publication settlement select only that same original inverse and never restart execution. Shutdown joins its original cleanup and publication.",
   "Native UI task absence, public SDK parity and whole inverse verification remain false. No connected acceptance or ordinary-project support follows from this source route.",
  ],...(includeSchemas?{inputSchema:z.toJSONSchema(currentFootprintInverseControlActionSchema),outputSchema:z.toJSONSchema(currentFootprintInverseControlResultSchema)}:{})};
}
export function validateCurrentFootprintInverseControlArguments(input:unknown):Record<string,unknown>{
 const parsed=currentFootprintInverseControlActionSchema.safeParse(input);
 return parsed.success?{valid:true,request:parsed.data,executionAuthorized:false,saveAuthorized:false,ordinaryProjectsSupported:false}:{
  valid:false,executionAuthorized:false,saveAuthorized:false,ordinaryProjectsSupported:false,
  issues:parsed.error.issues.slice(0,16).map(issue=>({path:issue.path.map(String),message:issue.message.slice(0,512)})),
 };
}
