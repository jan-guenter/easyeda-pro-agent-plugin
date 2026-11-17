/** Inert strict-schema discovery for the controlled original workflow.
 * Matching arguments create no provider, native owner or execution authority. */
import { z } from "zod";
import { CURRENT_FOOTPRINT_FORWARD_WRITER_CONTROL_TOOL, currentFootprintForwardWriterControlActionSchema, currentFootprintForwardWriterControlResultSchema } from "./current-footprint-forward-writer-control-contract.ts";
import { currentFootprintForwardWriterCompleteProfile } from "./current-footprint-forward-writer-complete-profile.ts";
import { facadeToolRegistered } from "./facade-mode.ts";

export function queryCurrentFootprintForwardWriterControl(includeSchemas = false): Record<string, unknown> {
 return {offline:true,tool:CURRENT_FOOTPRINT_FORWARD_WRITER_CONTROL_TOOL,
  mountedInPublicUtilities:facadeToolRegistered("public-utilities-only",CURRENT_FOOTPRINT_FORWARD_WRITER_CONTROL_TOOL),
  validationOnly:true,connectedValidation:false,ordinaryProjectsSupported:false,generalSdkWriter:false,
  runtimeAdmissionRequired:true,sourceAdmissionRequired:true,originalControllerRequired:true,freshSavedReaderRequired:true,
  wholeWriterBudgetReserved:currentFootprintForwardWriterCompleteProfile().wholeWriterReserved,
  maximumCreateAttempts:1,maximumExplicitSaveAttempts:0,copyTriggeredPersistence:true,inverseAvailable:false,
  executionAuthorized:false,saveAuthorized:false,
  actions:["prepare","execute","inspect","cleanup","settle-publication"],
  limitations:[
   "Only the exact explicitly identified closed disposable target and existing footprint are admitted; the parent ID is derived from the fresh flow ID.",
   "Execute retains one original copy-triggered persistence path and returns promptly. Inspect its original settlement; never repeat execute after uncertainty.",
   "Completion requires the original clocks, Main request, publication and natural timer tail, then independent full closed SQL and a separate fresh held cold reader with exact source/state and final SQL verification.",
   "Cleanup targets only the retained original Jobs and cannot reverse a possible copy. Settlement repairs original bytes and may continue already-requested original cleanup without replay; historical JSON cannot recreate a live owner.",
   "This narrower native equivalent does not execute the public matcher, support ordinary-project copy, provide an inverse or establish connected validation from discovery.",
  ],...(includeSchemas?{inputSchema:z.toJSONSchema(currentFootprintForwardWriterControlActionSchema),outputSchema:z.toJSONSchema(currentFootprintForwardWriterControlResultSchema)}:{})};
}
export function validateCurrentFootprintForwardWriterControlArguments(input:unknown):Record<string,unknown>{
 const parsed=currentFootprintForwardWriterControlActionSchema.safeParse(input);
 return parsed.success?{valid:true,request:parsed.data,executionAuthorized:false,saveAuthorized:false,ordinaryProjectsSupported:false}:{
  valid:false,executionAuthorized:false,saveAuthorized:false,ordinaryProjectsSupported:false,
  issues:parsed.error.issues.slice(0,16).map(issue=>({path:issue.path.map(String),message:issue.message.slice(0,512)})),
 };
}
