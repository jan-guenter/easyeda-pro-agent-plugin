/** Versioned recovery facts only. A schema-valid projection is not the
 * original live owner's opaque pre-dispatch proof and cannot grant retry. */
import { z } from "zod";
import { CURRENT_FOOTPRINT_FORWARD_WRITER_WORKFLOW_CLEANUP_ACTIONS as ACTIONS, currentFootprintForwardWriterWorkflowEvidenceSchemas as V1_EVIDENCE,
 currentFootprintForwardWriterWorkflowRecordSchema as V1_RECORD } from "./current-footprint-forward-writer-workflow-contract.ts";
import { CURRENT_FOOTPRINT_FORWARD_WRITER_WORKFLOW_V2_BUDGET as BUDGET } from "./current-footprint-forward-writer-workflow-v2-budget.ts";

export { CURRENT_FOOTPRINT_FORWARD_WRITER_WORKFLOW_V2_BUDGET,CURRENT_FOOTPRINT_FORWARD_WRITER_WORKFLOW_V2_PROFILE } from "./current-footprint-forward-writer-workflow-v2-budget.ts";
const digest=z.string().regex(/^[a-f\d]{64}$(?![\s\S])/u);
/** The future original issuer must bind this projection to the same retained
 * owner, failed FIRST attempt and operation. The identical projection on the
 * retry result still describes attempt1, never attempt2's dispatch status.
 * Parsing or hashing JSON never supplies the live owner's proof. */
export const currentFootprintForwardWriterReleasePreflightFactsSchema=z.strictObject({
 schema:z.literal("easyeda-pro-control.footprint-forward-release-preflight-facts.v1"),
 failedReleaseAttempt:z.literal(1),originalOwnerRetained:z.literal(true),originalFailureRetained:z.literal(true),
 originalReleaseNotDispatched:z.literal(true),originalNativeActivityUnchanged:z.literal(true),proofSha256:digest,
});
const firstCleanup=z.strictObject({generation:z.enum(["writer","saved"]),action:z.enum(ACTIONS),attempt:z.number().int().min(1).max(BUDGET.terminationObservations)})
 .refine(value=>value.action==="termination"||value.attempt===1,"Only the first cleanup attempt or bounded termination observations use this shape.");
const retry=z.strictObject({generation:z.enum(["writer","saved"]),action:z.literal("release"),attempt:z.literal(2),
 preDispatchProof:currentFootprintForwardWriterReleasePreflightFactsSchema});
const firstResult=z.strictObject({...firstCleanup.shape,outcome:z.enum(["dispatched","pending","terminated","released","no-resource","failed"]),evidenceSha256:digest})
 .refine(value=>value.action==="termination"||value.attempt===1,"Historical cleanup shape admits no release retry.");
const retryResult=z.strictObject({...retry.shape,outcome:z.enum(["released","failed"]),evidenceSha256:digest});
export const currentFootprintForwardWriterWorkflowV2EvidenceSchemas=Object.freeze({...V1_EVIDENCE,
 "cleanup-intent":z.union([firstCleanup,retry]),"cleanup-result":z.union([firstResult,retryResult]),
});
export const currentFootprintForwardWriterWorkflowV2RecordSchema=z.strictObject({...V1_RECORD.shape,
 schema:z.literal("easyeda-pro-control.footprint-forward-flow-record.v2"),sequence:z.number().int().min(0).max(BUDGET.records-1),
}).superRefine((value,context)=>{
 const parsed=currentFootprintForwardWriterWorkflowV2EvidenceSchemas[value.kind].safeParse(value.evidence);
 if(!parsed.success){context.addIssue({code:"custom",path:["evidence"],message:"Malformed fixed v2 workflow evidence."});}
});
export type CurrentFootprintForwardWriterWorkflowV2Record=Readonly<z.infer<typeof currentFootprintForwardWriterWorkflowV2RecordSchema>>;
export type CurrentFootprintForwardWriterReleasePreflightFacts=Readonly<z.infer<typeof currentFootprintForwardWriterReleasePreflightFactsSchema>>;
