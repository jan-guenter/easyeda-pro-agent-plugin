import { z } from "zod";
import { CURRENT_FOOTPRINT_INVERSE_COLD_UI_CONTROL_TOOL, currentFootprintInverseColdUiControlActionSchema, currentFootprintInverseColdUiControlResultSchema } from "./current-footprint-inverse-cold-ui-control-contract.ts";
import { COLD_UI_JOURNAL_BUDGET } from "./current-footprint-inverse-native-delete-cold-ui-contract.ts";
import { facadeToolRegistered } from "./facade-mode.ts";

export function queryCurrentFootprintInverseColdUiControl(includeSchemas=false):Record<string,unknown>{
 return {offline:true,tool:CURRENT_FOOTPRINT_INVERSE_COLD_UI_CONTROL_TOOL,mountedInPublicUtilities:facadeToolRegistered("public-utilities-only",CURRENT_FOOTPRINT_INVERSE_COLD_UI_CONTROL_TOOL),
  validationOnly:true,connectedValidation:false,ordinaryProjectsSupported:false,generalSdkWriter:false,runtimeAdmissionRequired:true,sourceAdmissionRequired:true,
  originalCompletedInverseCoordinatorRequired:true,independentColdUiConfirmationsRequired:true,maximumUiInvocations:1,maximumExplicitSaveAttempts:0,journalBudget:COLD_UI_JOURNAL_BUDGET,
  historicalInverseV1Unchanged:true,nativeUiTaskAbsenceRequiresOriginalCompletion:true,publicSdkParity:false,wholeInverseVerified:false,executionAuthorized:false,saveAuthorized:false,
  actions:["execute","inspect","cleanup","settle-publication"],limitations:[
   "Execute selects only the same retained coordinator's genuine completed and fully released inverse and original cold-manager generation; supplied JSON, owners and callbacks cannot issue this continuation.",
   "The new readonly generation owns its checkpoint, helper, single UI task, normal close, root and whole-Job exit, original helper release and complete closed SQL comparison. Opening can persist existing-profile data.",
   "Inspect, cleanup and publication settlement retain that original generation. Lost replies never recreate it. Existing inverse V1 UI-absence false fields remain unchanged.",
   "A separately issued cold-UI absence proves native task behavior only. Public SDK parity, continuous replay exclusion, whole inverse verification and connected acceptance remain unproved.",
  ],...(includeSchemas?{inputSchema:z.toJSONSchema(currentFootprintInverseColdUiControlActionSchema),outputSchema:z.toJSONSchema(currentFootprintInverseColdUiControlResultSchema)}:{})};
}
export function validateCurrentFootprintInverseColdUiControlArguments(input:unknown):Record<string,unknown>{
 const parsed=currentFootprintInverseColdUiControlActionSchema.safeParse(input);
 return parsed.success?{valid:true,request:parsed.data,executionAuthorized:false,saveAuthorized:false,ordinaryProjectsSupported:false}:{valid:false,executionAuthorized:false,saveAuthorized:false,ordinaryProjectsSupported:false,
  issues:parsed.error.issues.slice(0,16).map(issue=>({path:issue.path.map(String),message:issue.message.slice(0,512)})),};
}
